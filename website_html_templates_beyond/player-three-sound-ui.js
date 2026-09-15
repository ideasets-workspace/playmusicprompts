import {AudioRack,EQ_FREQUENCIES,SOUND_PROFILES,sanitizeSound} from './player-three-audio.js';

export function createSoundControls({audio,storage,toast,onChange}){
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let settings=sanitizeSound(storage.get('pmp.beyond.room.sound',{})),rack=null,context=null,source=null;
  let saved=storage.get('pmp.beyond.room.soundPresets',[]);if(!Array.isArray(saved))saved=[];saved=saved.filter(p=>p&&typeof p.name==='string'&&typeof p.id==='string').slice(0,32).map(p=>({...p,name:p.name.slice(0,48),settings:sanitizeSound(p.settings)}));
  let volume=.7,muted=false,lastMeter=0;
  $('#eq-preset').innerHTML=Object.entries(SOUND_PROFILES).map(([id,p])=>`<option value="${id}">${p.name}</option>`).join('')+'<option value="custom" disabled>Custom</option>';
  $('#eq-bands').innerHTML=EQ_FREQUENCIES.map((f,i)=>`<div class="eq-column"><output id="eq-output-${i}" for="eq-${i}">0</output><input id="eq-${i}" type="range" min="-12" max="12" step="1" value="0" aria-label="Equalizer ${f} hertz"><label for="eq-${i}">${f>=1000?f/1000+'k':f}</label></div>`).join('');
  function drawResponse(){const canvas=$('#eq-response'),g=canvas.getContext('2d'),box=canvas.getBoundingClientRect();if(!box.width)return;const w=box.width,h=80,dpr=Math.min(devicePixelRatio,2);canvas.width=w*dpr;canvas.height=h*dpr;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);g.strokeStyle='#66537355';g.lineWidth=1;for(const y of [16,40,64]){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}if(!rack){g.fillStyle='#a38eaf';g.font='9px Inter';g.fillText('Response appears when audio starts',10,45);return;}g.beginPath();const response=rack.response;for(let i=0;i<response.length;i++){const db=20*Math.log10(Math.max(response[i],1e-8));const x=i/(response.length-1)*w,y=40-Math.max(-24,Math.min(24,db))*1.45;if(!i)g.moveTo(x,y);else g.lineTo(x,y);}g.strokeStyle='#c4a1ff';g.lineWidth=1.8;g.stroke();}
  function synchronize(){
    settings.eq.forEach((v,i)=>{$(`#eq-${i}`).value=v;$(`#eq-output-${i}`).value=`${v>0?'+':''}${v}`;});
    const preset=Object.entries(SOUND_PROFILES).find(([,p])=>p.eq.every((v,i)=>v===settings.eq[i]));$('#eq-preset').value=preset?.[0]||'custom';
    $('#effects-enabled').checked=settings.enabled;$('#effects-state').textContent=settings.enabled?'Effects on':'Original signal';
    for(const key of ['width','balance','preamp','ambience'])$('#sound-'+key).value=settings[key];
    $('#sound-width-value').value=Math.round(settings.width*100)+'%';$('#sound-balance-value').value=settings.balance===0?'Center':`${settings.balance<0?'L':'R'} ${Math.round(Math.abs(settings.balance)*100)}%`;
    $('#sound-preamp-value').value=`${settings.preamp>0?'+':''}${settings.preamp} dB`;$('#sound-ambience-value').value=Math.round(settings.ambience*100)+'%';
    $('#sound-mono').checked=settings.mono;$('#sound-width').disabled=settings.mono;$('#sound-headroom').checked=settings.autoHeadroom;$('#sound-room').value=settings.room;$('#sound-dynamics').value=settings.dynamics;
    $('#headroom-status').textContent=rack?`${rack.metrics.headroomDb.toFixed(1)} dB reserved`:'Ready when you press play';
    $('#sound-settings').classList.toggle('effects-bypassed',!settings.enabled);drawResponse();
  }
  function apply(){settings=sanitizeSound(settings);rack?.apply(settings);synchronize();storage.set('pmp.beyond.room.sound',settings);onChange?.();}
  function renderPresets(){const focused=document.activeElement?.closest('[data-preset]')?.dataset.preset;$('#saved-sound-presets').innerHTML=saved.length?saved.map(p=>`<div class="saved-preset"><button class="preset-load" data-preset="${esc(p.id)}">${esc(p.name)}</button><button class="icon-btn preset-delete" data-delete-preset="${esc(p.id)}" aria-label="Delete ${esc(p.name)}">×</button></div>`).join(''):'<p class="drawer-note">Your signature sound belongs here. Save your settings and return to them anytime.</p>';if(focused)$('#save-preset-name').focus();}
  EQ_FREQUENCIES.forEach((_,i)=>$(`#eq-${i}`).oninput=e=>{settings.eq[i]=Number(e.target.value);apply();});
  $('#eq-preset').onchange=e=>{settings.eq=[...(SOUND_PROFILES[e.target.value]?.eq||SOUND_PROFILES.flat.eq)];apply();};$('#eq-reset').onclick=()=>{settings.eq=[...SOUND_PROFILES.flat.eq];apply();};
  for(const key of ['width','balance','preamp','ambience'])$('#sound-'+key).oninput=e=>{settings[key]=Number(e.target.value);apply();};
  $('#sound-mono').onchange=e=>{settings.mono=e.target.checked;apply();};$('#sound-headroom').onchange=e=>{settings.autoHeadroom=e.target.checked;apply();};
  $('#sound-room').onchange=e=>{settings.room=e.target.value;apply();};$('#sound-dynamics').onchange=e=>{settings.dynamics=e.target.value;apply();};
  $('#effects-enabled').onchange=e=>{settings.enabled=e.target.checked;apply();};$('#sound-reset-all').onclick=()=>{settings=sanitizeSound();apply();toast('Your original sound is restored.');};
  $('#save-sound-preset').onsubmit=e=>{e.preventDefault();const name=$('#save-preset-name').value.trim();if(!name)return;const match=saved.find(p=>p.name.toLowerCase()===name.toLowerCase());if(match)match.settings=structuredClone(settings);else{if(saved.length>=32){toast('You can keep 32 sound presets. Delete one to make room.');return;}saved.push({id:crypto.randomUUID(),name:name.slice(0,48),settings:structuredClone(settings)});}if(storage.set('pmp.beyond.room.soundPresets',saved)){renderPresets();$('#save-preset-name').value='';toast(match?'Your sound preset is updated.':'Your signature sound is saved.');}else toast('Your browser couldn’t save this preset.');};
  $('#saved-sound-presets').onclick=e=>{const load=e.target.closest('[data-preset]'),remove=e.target.closest('[data-delete-preset]');if(load){const preset=saved.find(p=>p.id===load.dataset.preset);if(preset){settings=sanitizeSound(preset.settings);apply();toast(`${preset.name} is ready.`);}}if(remove){saved=saved.filter(p=>p.id!==remove.dataset.deletePreset);storage.set('pmp.beyond.room.soundPresets',saved);renderPresets();$('#save-preset-name').focus();}};
  const tabs=$$('[data-sound-tab]');function setTab(button){tabs.forEach(t=>{const active=t===button;t.setAttribute('aria-selected',active);t.tabIndex=active?0:-1;$('#sound-view-'+t.dataset.soundTab).hidden=!active;});drawResponse();}
  tabs.forEach((button,i)=>{button.onclick=()=>setTab(button);button.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(tabs[index]);tabs[index].focus();}};});
  new ResizeObserver(drawResponse).observe($('#eq-response'));renderPresets();synchronize();
  return {
    async start(){if(!context){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error('This browser does not support sound processing.');context=new Context();rack=new AudioRack(context,settings);source=context.createMediaElementSource(audio);source.connect(rack.input);rack.setVolume(volume,muted);synchronize();}if(context.state!=='running')await context.resume();return{context,rack};},
    setVolume(value,isMuted){volume=value;muted=isMuted;rack?.setVolume(value,isMuted);},
    setFade(value){rack?.setFade(value);},
    scheduleSleep(remaining,seconds){rack?.scheduleFade(remaining,seconds);},
    cancelSleep(){rack?.cancelFade();},
    read(now){if(!rack)return null;const bins=rack.read();if(now-lastMeter>85&&!$('#sound-panel').hidden){lastMeter=now;for(const [channel,key]of [['left','leftDb'],['right','rightDb']]){const db=rack.metrics[key];$('#meter-'+channel).style.width=Math.max(0,Math.min(100,(db+60)/60*100))+'%';$('#meter-'+channel+'-value').textContent=db<=-90?'−∞':db.toFixed(1);}$('#peak-value').textContent=rack.metrics.peakDb<=-90?'—':rack.metrics.peakDb.toFixed(1)+' dBFS';$('#correlation-value').textContent=rack.metrics.correlation.toFixed(2);$('#reduction-value').value=Math.abs(rack.metrics.reduction).toFixed(1)+' dB';$('#reduction-meter').style.width=Math.min(100,Math.abs(rack.metrics.reduction)/24*100)+'%';}return bins;},
    get state(){return{settings:structuredClone(settings),metrics:rack?{...rack.metrics}:null,profiles:saved.map(p=>({id:p.id,name:p.name})),headroomGain:rack?.headroom.gain.value};},
    get context(){return context;},get rack(){return rack;}
  };
}
