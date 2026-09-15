import {createDirectorEngine,createDirectorStore,DIRECTOR_STORAGE_KEY} from './player-three-director.js';
import {createDirectorControls} from './player-three-director-ui.js';
import {VISUAL_DEFAULTS} from './player-three-visual-settings.js';

// This coordinator applies transient performances. The saved look and the
// playback/session store remain the user's independent sources of truth.
export function createPerformanceDirector({container,storage,getRoom,getBase,getScene,getManualScene,getTrack,audio,seek,onScene,toast,onActivate=()=>{}}){
  const store=createDirectorStore(storage),engine=createDirectorEngine(),dirty=new Map();
  let config=store.read(),live=null,comparing=false,lastTime=performance.now(),lastPaint=0,lastSettings=null,lastScene=null;
  engine.setConfig(config);
  function commit(patch){
    onActivate();
    const result=store.patch({...Object.fromEntries(dirty),...patch});
    if(result.accepted===false)return {...result,config};
    config=result.config;
    if(result.ok)dirty.clear();else for(const key of Object.keys(patch))dirty.set(key,config[key]);
    engine.setConfig(config);lastSettings=null;
    return result;
  }
  async function captureFrame(){
    const room=getRoom();if(!room)throw Error('Your scene is still opening. Try again in a moment.');
    const blob=await room.captureFrame(),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`playmusicprompts-${getScene()}-${new Date().toISOString().replace(/[:.]/g,'-')}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  const controls=createDirectorControls({container,getConfig:()=>config,commit,getSnapshot:()=>({settings:{...(comparing?VISUAL_DEFAULTS:live?.settings||getBase())},scene:getScene()}),getTrack,audio,seek,getLive:()=>live,captureFrame,toast});
  const neutral={optics:{dispersion:0,streak:0,grain:0},camera:{mode:'still',amount:0}};
  function tick(now=performance.now()){
    const room=getRoom(),dt=Math.max(0,Math.min(.05,(now-lastTime)/1000));lastTime=now;if(!room)return;
    if(comparing){room.setPerformance(neutral);return;}
    live=engine.update({baseSettings:getBase(),scene:getManualScene(),trackId:getTrack()?.id||null,time:Number.isFinite(audio.currentTime)?audio.currentTime:0,dt,playing:!audio.paused&&!audio.ended&&audio.readyState>=3,motion:room.diagnostics.motion,signals:room.diagnostics.signals||{bass:0,mid:0,treble:0,energy:0,pulse:0,centroid:0}});
    live.capabilities={motion:room.diagnostics.motion,bloom:room.diagnostics.bloomAvailable!==false};
    if(live.scene!==getScene()){onScene(live.scene);lastScene=live.scene;}
    if(!lastSettings||lastScene!==live.scene||Object.keys(VISUAL_DEFAULTS).some(key=>Math.abs(lastSettings[key]-live.settings[key])>1e-6)){
      room.setVisualSettings(live.settings,{continuous:true});lastSettings={...live.settings};lastScene=live.scene;
    }
    room.setPerformance({optics:live.optics,camera:live.camera});
    if(now-lastPaint>100){lastPaint=now;controls.update(live);}
  }
  function bypass(){
    if(config.mode!=='manual'||config.follow||config.routes.some(route=>route.enabled)){
      const result=commit({mode:'manual',follow:false,routes:config.routes.map(route=>({...route,enabled:false}))});if(!result.ok)toast(result.error);controls.refresh();
    }
    lastSettings=null;
  }
  function setComparing(value){comparing=!!value;lastSettings=null;if(comparing)getRoom()?.setPerformance(neutral);}
  function syncStorage(event){if(event.key!==DIRECTOR_STORAGE_KEY&&event.key!==null)return;config={...store.read(),...Object.fromEntries(dirty)};engine.setConfig(config);lastSettings=null;controls.refresh();}
  window.addEventListener('storage',syncStorage);
  return {tick,bypass,setComparing,refresh:()=>controls.refresh(),get live(){return live;},get config(){return config;},dispose(){window.removeEventListener('storage',syncStorage);controls.dispose();}};
}
