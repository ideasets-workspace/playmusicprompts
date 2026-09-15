import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../public/advertising.js',import.meta.url),'utf8');
const flush=async()=>{for(let i=0;i<12;i++) await Promise.resolve();};
class Emitter {
  listeners=new Map();
  addEventListener(type,fn){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list);}
  removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(x=>x!==fn));}
  emit(type,event={}){for(const fn of [...(this.listeners.get(type)||[])]) fn(event);}
}
function setup({sdk=true,banner=false}={}) {
  let id=0;const timers=new Map(),scripts=[],events=[],loaders=[],managers=[],displays=[];
  class Element extends Emitter {
    constructor(tag){super();this.tagName=tag;this.children=[];this.isConnected=false;this.hidden=false;this.attributes={};}
    setAttribute(k,v){this.attributes[k]=v;}
    append(...els){for(const el of els){this.children.push(el);el.parent=this;el.isConnected=true;}}
    appendChild(el){this.append(el);if(el.tagName==='script')scripts.push(el);return el;}
    remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);}
  }
  const body=new Element('body'),head=new Element('head');body.isConnected=head.isConnected=true;
  const doc={body,head,createElement:tag=>new Element(tag),dispatchEvent:e=>{events.push(e);return true;}};
  const audio=new Emitter();Object.assign(audio,{paused:false,ended:false,volume:.7,muted:false,pauseCalls:0,playCalls:0,pause(){this.paused=true;this.pauseCalls++;},play(){this.paused=false;this.playCalls++;return Promise.resolve();}});
  const window={document:doc,innerWidth:1100,addEventListener(){},CustomEvent:class{constructor(type,o){this.type=type;Object.assign(this,o);}},setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimeout:n=>timers.delete(n),PMP_APP:{config:{ads:{enabled:true,audio:{enabled:true,tagUrl:'https://pubads.g.doubleclick.net/gampad/ads?iu=/123/music&output=vast',minTracksBetweenAds:1},banner:{enabled:banner,adUnitPath:'/123/banner',sizes:[[320,50],[728,90]]}}}}};
  const types=Object.fromEntries(['CONTENT_PAUSE_REQUESTED','CONTENT_RESUME_REQUESTED','ALL_ADS_COMPLETED','LOADED','STARTED','AD_PROGRESS','SKIPPABLE_STATE_CHANGED','PAUSED','RESUMED'].map(x=>[x,x]));
  class Manager extends Emitter {
    startCalls=0;initCalls=0;destroyCalls=0;skips=0;canSkip=false;
    setVolume(v){this.volume=v;} init(){this.initCalls++;} start(){this.startCalls++;}
    destroy(){this.destroyCalls++;this.emit(types.CONTENT_RESUME_REQUESTED);}
    pause(){this.emit(types.PAUSED);} resume(){this.emit(types.RESUMED);}
    getRemainingTime(){return 18;} getAdSkippableState(){return this.canSkip;}
    skip(){this.skips++;this.emit(types.ALL_ADS_COMPLETED);}
  }
  function installSdk() {
    window.google={ima:{AdEvent:{Type:types},AdErrorEvent:{Type:{AD_ERROR:'AD_ERROR'}},AdsManagerLoadedEvent:{Type:{ADS_MANAGER_LOADED:'ADS_MANAGER_LOADED'}},AdsRenderingSettings:class{},AdsRequest:class{setAdWillAutoPlay(v){this.autoplay=v;}setAdWillPlayMuted(v){this.muted=v;}},AdDisplayContainer:class {constructor(){this.initialized=0;displays.push(this);} initialize(){this.initialized++;}destroy(){}},AdsLoader:class extends Emitter {constructor(){super();this.requests=[];loaders.push(this);}requestAds(request,context){this.requests.push({request,context});}destroy(){this.destroyed=true;}}}};
  }
  let renderListener=null,refreshes=0,destroyedSlots=0;
  const slot={addService(){return this;}};
  window.googletag={apiReady:true,setConfig(value){this.config=value;},pubads:()=>({setPrivacySettings(){},addEventListener:(name,fn)=>renderListener=fn,removeEventListener:()=>renderListener=null,refresh:()=>refreshes++}),defineSlot:()=>slot,enableServices(){},display(){},destroySlots:()=>destroyedSlots++};
  if(sdk)installSdk();else delete window.googletag;
  vm.runInNewContext(source,{window,URL,console,Promise});
  function loaded(index=loaders.length-1,requestIndex=0) {
    const currentLoader=loaders[index],context=currentLoader.requests[requestIndex].context,m=new Manager();managers.push(m);
    currentLoader.emit('ADS_MANAGER_LOADED',{getUserRequestContext:()=>context,getAdsManager:()=>m});return m;
  }
  function nofill(index=loaders.length-1,requestIndex=0){const l=loaders[index];l.emit('AD_ERROR',{getUserRequestContext:()=>l.requests[requestIndex].context});}
  function fireTimers(ms){for(const [n,t] of [...timers])if(t.ms===ms){timers.delete(n);t.fn();}}
  const permission=async()=>({allowed:true,storageAllowed:true,personalized:false,requestParams:{gdpr:'1',gdpr_consent:'test-consent'}});
  return {api:window.PMPAds,window,doc,audio,events,scripts,timers,loaders,managers,displays,types,loaded,nofill,fireTimers,installSdk,permission,render:empty=>renderListener?.({slot,isEmpty:empty}),get refreshes(){return refreshes;},get destroyedSlots(){return destroyedSlots;}};
}
async function ready(h){await h.api.configure({audio:h.audio,consent:h.permission});assert.equal(h.api.userGesture(h.audio),true);}

test('unconfigured, missing consent and denied storage never load Google scripts or request ads',async()=>{
  const h=setup({sdk:false,banner:true});
  await h.api.configure({audio:h.audio});assert.equal(h.scripts.length,0);
  await h.api.configure({audio:h.audio,consent:async()=>({allowed:true,storageAllowed:false})});assert.equal(h.scripts.length,0);
  h.window.PMP_APP.config.ads.enabled=false;
  await h.api.configure({audio:h.audio,consent:h.permission});assert.equal(h.scripts.length,0);
  const r=await h.api.beforeNext({audio:h.audio,reason:'ended'});assert.equal(r.status,'unconfigured');assert.equal(r.allowNext,true);
});
test('a consent callback that never settles has a bounded fail-closed result',async()=>{
  const h=setup({sdk:false});const p=h.api.configure({audio:h.audio,consent:()=>new Promise(()=>{})});await flush();h.fireTimers(3000);await p;
  assert.equal(h.scripts.length,0);assert.equal(h.api.getState().phase,'consent-required');
});
test('SDK preparation does not impersonate a user gesture or start an ad',async()=>{
  const h=setup();await h.api.configure({audio:h.audio,consent:h.permission});assert.equal(h.displays[0].initialized,0);
  const result=await h.api.beforeNext({audio:h.audio,reason:'ended'});assert.equal(result.status,'gesture-required');assert.equal(h.loaders[0].requests.length,0);assert.equal(h.audio.playCalls,0);
});
test('concurrent boundary calls request once and completion events resolve once without playing content',async()=>{
  const h=setup();await ready(h);
  const first=h.api.beforeNext({audio:h.audio,reason:'ended'}),second=h.api.beforeNext({audio:h.audio,reason:'ended'});assert.equal(first,second);await flush();
  assert.equal(h.loaders[0].requests.length,1);
  const request=h.loaders[0].requests[0].request,url=new URL(request.adTagUrl);assert.equal(url.searchParams.get('ad_type'),'audio');assert.equal(url.searchParams.get('env'),'instream');assert.equal(url.searchParams.get('npa'),'1');
  const m=h.loaded();m.emit(h.types.STARTED);m.emit(h.types.CONTENT_RESUME_REQUESTED);m.emit(h.types.ALL_ADS_COMPLETED);
  const result=await first;assert.equal(result.allowNext,true);assert.equal(m.destroyCalls,1);assert.equal(h.audio.playCalls,0);assert.equal(h.events.filter(e=>e.type==='pmp:ads-result').length,1);
});
test('no-fill resumes queue permission once, while user pause prohibits automatic next',async()=>{
  const h=setup();await ready(h);const p=h.api.beforeNext({audio:h.audio,reason:'next'});await flush();h.api.pause();h.nofill();
  const result=await p;assert.equal(result.allowNext,false);assert.equal(result.status,'ad-unavailable');assert.equal(h.audio.playCalls,0);
});
test('an ad arriving after user pause never starts until an explicit resume',async()=>{
  const h=setup();await ready(h);const p=h.api.beforeNext({audio:h.audio,reason:'next'});await flush();h.api.pause();const m=h.loaded();
  assert.equal(m.initCalls,0);assert.equal(m.startCalls,0);h.api.resume();assert.equal(m.startCalls,1);
  m.emit(h.types.ALL_ADS_COMPLETED);assert.equal((await p).allowNext,true);
});
test('stale loaded response after cancellation is destroyed without starting or resuming',async()=>{
  const h=setup();await ready(h);const p=h.api.beforeNext({audio:h.audio,reason:'next'});await flush();h.api.cancel('selection-changed');
  assert.equal((await p).allowNext,false);const m=h.loaded();assert.equal(m.startCalls,0);assert.equal(m.destroyCalls,1);assert.equal(h.api.active,false);
});
test('request watchdog frees the queue and late response cannot restart a timed-out ad',async()=>{
  const h=setup();await ready(h);const p=h.api.beforeNext({audio:h.audio,reason:'next'});await flush();h.fireTimers(10000);
  assert.equal((await p).status,'ad-timeout');assert.equal(h.api.active,false);assert.equal(h.loaded().startCalls,0);
});
test('abort cancels an in-flight break without allowing content advancement',async()=>{
  const h=setup();await ready(h);const controller=new AbortController();const p=h.api.beforeNext({audio:h.audio,reason:'ended',signal:controller.signal});await flush();controller.abort();
  assert.equal((await p).allowNext,false);assert.equal(h.api.active,false);
});
test('frequency, muted audio and paused content do not make inappropriate ad requests',async()=>{
  const h=setup();h.window.PMP_APP.config.ads.audio.minTracksBetweenAds=3;await ready(h);
  assert.equal((await h.api.beforeNext({audio:h.audio,reason:'next'})).status,'frequency');h.audio.muted=true;
  assert.equal((await h.api.beforeNext({audio:h.audio,reason:'next'})).status,'muted');h.audio.muted=false;h.audio.paused=true;
  assert.equal((await h.api.beforeNext({audio:h.audio,reason:'next'})).allowNext,false);assert.equal(h.loaders[0].requests.length,0);
});
test('only SDK-authorized skip is exposed; no reward or entitlement grant exists',async()=>{
  const h=setup();await ready(h);const p=h.api.beforeNext({audio:h.audio,reason:'next'});await flush();const m=h.loaded();
  assert.equal(h.api.skip(),false);m.canSkip=true;assert.equal(h.api.skip(),true);await p;assert.equal(m.skips,1);
  assert.equal(h.api.grantReward,undefined);assert.equal(h.api.getState().rewardedDownload,'unavailable');
});
test('banner waits for consent, requests once, stays hidden on no-fill, and is removed on revocation',async()=>{
  const h=setup({banner:true});await ready(h);assert.equal(h.refreshes,1);await h.api.mountBanner();assert.equal(h.refreshes,1);
  const banner=h.doc.body.children.find(e=>e.id==='pmp-banner');assert.equal(banner.hidden,true);h.render(false);assert.equal(banner.hidden,false);h.render(true);assert.equal(banner.hidden,true);
  await h.api.configure({consent:async()=>({allowed:false})});assert.equal(banner.isConnected,false);assert.equal(h.destroyedSlots,1);assert.equal(h.refreshes,1);
});
test('consent revocation during SDK loading prevents engine creation when the load finishes',async()=>{
  const h=setup({sdk:false});const p=h.api.configure({audio:h.audio,consent:h.permission});await flush();assert.equal(h.scripts.length,1);
  await h.api.configure({consent:async()=>({allowed:false})});h.installSdk();h.scripts[0].onload();await p;
  assert.equal(h.loaders.length,0);assert.equal(h.api.getState().audioReady,false);
});
test('a fresh consent denial at a track boundary clears earlier SDK permission',async()=>{
  const h=setup();let allowed=true;
  await h.api.configure({audio:h.audio,consent:async()=>({allowed,storageAllowed:true})});h.api.userGesture(h.audio);allowed=false;
  const r=await h.api.beforeNext({audio:h.audio,reason:'next'});assert.equal(r.status,'consent-required');assert.equal(r.allowNext,true);assert.equal(h.api.getState().audioReady,false);assert.equal(h.api.userGesture(h.audio),false);await flush();
  assert.equal(h.loaders[0].requests.length,0);
});
test('missing storage permission never initializes SDK or banner even with allowed=true',async()=>{
  const h=setup({sdk:false,banner:true});await h.api.configure({audio:h.audio,consent:async()=>({allowed:true,personalized:false})});
  assert.equal(h.scripts.length,0);assert.equal(h.loaders.length,0);assert.equal(h.refreshes,0);
  assert.equal(h.api.userGesture(h.audio),false);const result=await h.api.beforeNext({audio:h.audio,reason:'next'});assert.equal(result.status,'consent-required');assert.equal(result.allowNext,true);
});
test('WebAudio effective volume controls initial ad loudness and live volume updates',async()=>{
  const h=setup();h.audio.volume=1;let volume=.23;
  await h.api.configure({audio:h.audio,consent:h.permission,getVolume:()=>volume});h.api.userGesture(h.audio);
  const result=h.api.beforeNext({audio:h.audio,reason:'next'});await flush();const manager=h.loaded();assert.equal(manager.volume,.23);
  volume=.61;h.audio.emit('volumechange');assert.equal(manager.volume,.61);h.api.setVolume(0);assert.equal(manager.volume,0);
  manager.emit(h.types.ALL_ADS_COMPLETED);await result;assert.equal(h.audio.volume,1);
});
test('zero, invalid or unavailable WebAudio effective volume does not request audible ads',async()=>{
  for(const getVolume of [()=>0,()=>NaN,()=>{throw Error('Rack unavailable');}]){const h=setup();h.audio.volume=1;await h.api.configure({audio:h.audio,consent:h.permission,getVolume});h.api.userGesture(h.audio);assert.equal((await h.api.beforeNext({audio:h.audio,reason:'next'})).status,'muted');assert.equal(h.loaders[0].requests.length,0);}
});

const mainTransportSource=readFileSync(new URL('../public/service-player.js',import.meta.url),'utf8');
const roomSource=readFileSync(new URL('../public/player-three.js',import.meta.url),'utf8');
// Execute the exact room binding in isolation; this verifies transport, not WebGL/device rendering.
const roomTransportSource=roomSource.split('// Shared room media transport: both system controls and TV keys use these handlers.')[1]?.split('// End shared room media transport.')[0];
function transportFixture(kind){
  const calls=[],intents=[],handlers=new Map(),documentEvents=new Map();let tv;
  const audio=new Emitter();Object.assign(audio,{paused:true,currentTime:22,duration:100,volume:1,muted:false,play(){calls.push('content-play');this.paused=false;return Promise.resolve();},pause(){calls.push('content-pause');this.paused=true;}});
  const ads={active:true,paused:false,userGesture(){calls.push('gesture');},resume(){calls.push('ad-resume');this.paused=false;},pause(){calls.push('ad-pause');this.paused=true;},toggle(){calls.push('ad-toggle');},skip(){calls.push('ad-skip');return false;},cancel(){calls.push('ad-cancel');this.active=false;},getState(){return{paused:this.paused};},configure(){},setVolume(value){calls.push(['ad-volume',value]);}};
  const seekTo=time=>{audio.currentTime=Math.max(0,Math.min(audio.duration,time));};
  const P={audio,state:{current:{id:'song'},nextWaiting:false},actions:{play:()=>calls.push('content-toggle'),previous:()=>calls.push('content-previous'),next:()=>calls.push('content-next')},$:()=>null,pageHooks:[],closeDialog(){}};
  const navigator={mediaSession:{setActionHandler:(name,fn)=>handlers.set(name,fn)}};
  const roomListening={setPlayIntent:value=>intents.push(value)},listeningView=null;
  const window={PMP:P,PMP_APP:{notify(){}},PMPListening:roomListening,PMPAds:ads,PMPPlatform:{attach:value=>tv=value,refresh(){}}};
  const document={addEventListener:(name,fn)=>documentEvents.set(name,fn),body:{classList:{contains:()=>false}}};
  const context={window,document,navigator,audio,roomListening,listeningView,togglePlay:()=>calls.push('content-toggle'),goNext:()=>calls.push('content-next'),previous:()=>calls.push('content-previous'),seekTo,currentPanel:null,closePanel(){},cinema(){},console};
  if(kind==='room'){assert.ok(roomTransportSource);vm.runInNewContext(roomTransportSource,context);}else vm.runInNewContext(mainTransportSource,context);
  return {ads,audio,calls,intents,handlers,tv,navigator,documentEvents,P};
}
for(const kind of ['main','room']){
  test(`${kind}: OS media play/pause/next controls active ad and cannot start content`,()=>{const h=transportFixture(kind);h.handlers.get('play')();h.handlers.get('pause')();h.handlers.get('nexttrack')();assert.ok(h.calls.includes('ad-resume'));assert.ok(h.calls.includes('ad-pause'));assert.ok(h.calls.includes('ad-skip'));assert.ok(!h.calls.some(call=>['content-play','content-toggle','content-next','content-pause'].includes(call)));});
  test(`${kind}: system seeking and TV seeking are blocked during an ad`,()=>{const h=transportFixture(kind);h.handlers.get('seekto')({seekTime:80});h.handlers.get('seekforward')({seekOffset:15});h.handlers.get('seekbackward')({seekOffset:15});h.tv.seek(10);assert.equal(h.audio.currentTime,22);h.ads.active=false;h.handlers.get('seekto')({seekTime:80});assert.equal(h.audio.currentTime,80);h.handlers.get('seekforward')({seekOffset:40});assert.equal(h.audio.currentTime,100);});
  test(`${kind}: system stop cancels ad before stopping/resetting content`,()=>{const h=transportFixture(kind);h.handlers.get('stop')();assert.deepEqual(h.calls,['ad-cancel','content-pause']);assert.equal(h.audio.currentTime,0);assert.equal(h.ads.active,false);});
  test(`${kind}: previous cancels ad before selecting previous content`,()=>{const h=transportFixture(kind);h.handlers.get('previoustrack')();assert.deepEqual(h.calls,['ad-cancel','content-previous']);});
}
test('3D gain changes push user volume/mute to ad transport without altering native audio volume',()=>{
  const gainSource=roomSource.match(/^function updateGain\(\).*$/m)?.[0];assert.ok(gainSource);const values=[],rack=[],elements=new Map();
  const context=vm.createContext({volume:.37,muted:false,window:{PMPAds:{setVolume:value=>values.push(value)}},soundControls:{setVolume:(...value)=>rack.push(value)},$:key=>{if(!elements.has(key))elements.set(key,{setAttribute(){}});return elements.get(key);},icon:()=>'',audio:{volume:1}});
  vm.runInContext(`${gainSource}\nupdateGain();muted=true;updateGain();`,context);assert.deepEqual(values,[.37,0]);assert.deepEqual(rack,[[.37,false],[.37,true]]);assert.equal(context.audio.volume,1);
});
test('3D pending audio-context start cannot play content after an ad takes transport',async()=>{
  const toggleSource=roomSource.match(/^async function togglePlay\(.*$/m)?.[0];assert.ok(toggleSource);let start,plays=0;
  const context=vm.createContext({window:{PMPAds:{active:false,userGesture(){}}},roomListening:null,listeningView:null,audio:{paused:true,play(){plays++;return Promise.resolve();}},current:{id:'song'},startAudio:()=>new Promise(resolve=>start=resolve),persist(){},peaks:true,loadWave(){},toast(){},queue:[],console});
  vm.runInContext(toggleSource,context);const pending=vm.runInContext('togglePlay()',context);context.window.PMPAds.active=true;start();await pending;assert.equal(plays,0);
});
