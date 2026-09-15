import {AETHER_KEY,AETHER_FORMS,AETHER_SCHEMA,AETHER_DEFAULTS,createAetherStore} from './lab-aether-settings.js';
const environments={tidal:{name:'Tidal',forms:['Drift','Swell','Current'],line:'Shape the ocean around your sound.'},monolith:{name:'Monolith',forms:['Sanctum','Awakening','Rift'],line:'Give the architecture a new rhythm.'},aether:{name:'Aether',forms:['River','Void','Helix'],line:'Find your passage through the current.'}};

export function createAetherControls({storage,getRoom,getScene,chooseAether,openWorld,onManualEdit=()=>{},getScoredLook=()=>null,toast}){
 const store=createAetherStore(storage),container=document.querySelector('#studio-view-world');
 let settings=store.read(),lastPaint=0,roomApplied=null,disposed=false,lastDisplayed='';
 const formButtons=className=>AETHER_FORMS.map((f,i)=>`<button type="button" class="${className}" data-aether-form="${f.id}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${f.path}"/></svg><span><small>0${i+1}</small><strong>${f.name}</strong></span></button>`).join('');
 container.innerHTML=`<section class="aether-controls" aria-label="Environment controls"><div class="aether-control-title"><span class="aether-kicker">YOUR WORLD. YOUR SIGNATURE.</span><h3>Aether<span>.</span></h3><p>Not just a world to watch.<br>A world to get lost in.</p></div><div id="aether-inactive" hidden><p>These controls shape the Aether world.</p><button type="button" id="aether-enter">Enter Aether ↗</button></div><fieldset id="aether-fields"><legend class="sr-only">World appearance</legend><div class="aether-section-line"><span>CHOOSE A MOVEMENT</span><span>03 FORMS</span></div><div class="aether-form-grid">${formButtons('aether-form-card')}</div><p id="aether-form-line"></p><div class="aether-ranges">${Object.entries(AETHER_SCHEMA).map(([key,s])=>`<div class="aether-range"><div><label for="aether-${key}">${s.label}</label><output for="aether-${key}"></output><button type="button" data-aether-reset="${key}" aria-label="Reset ${s.label}">↺</button></div><input type="range" id="aether-${key}" min="${s.min}" max="${s.max}" step="${s.step}" aria-describedby="aether-hint-${key}"><p id="aether-hint-${key}">${s.help}</p></div>`).join('')}</div><label class="aether-journey"><span><strong>Take me through it.</strong><small>A slow camera journey while your music plays.<br>Motion must be on. Your gestures take priority.</small></span><input type="checkbox" role="switch" id="aether-journey" aria-label="Cinematic camera journey"></label><div class="aether-reset-line"><span id="aether-save-status" role="status">Saved on this device</span><button type="button" id="aether-reset">Reset Aether ↺</button></div></fieldset><div class="aether-live"><span class="aether-live-dot"></span><span id="aether-live-state">Opening your world…</span><span id="aether-live-render"></span></div><p class="aether-sound-note">Low frequencies move the world.<br>Musical attacks become ripples of light.</p></section>`;
 const q=s=>container.querySelector(s),listeners=[];
 function on(node,event,fn){node.addEventListener(event,fn);listeners.push(()=>node.removeEventListener(event,fn));}
 function apply(){const room=getRoom();if(room){room.setLabSettings(settings);roomApplied=room;}}
 function render(display=settings){
  lastDisplayed=JSON.stringify(display);
  for(const node of [...container.querySelectorAll('[data-aether-form]')])node.setAttribute('aria-pressed',String(node.dataset.aetherForm===display.form));
  q('#aether-form-line').textContent=AETHER_FORMS.find(f=>f.id===display.form).line;
  for(const [key,s]of Object.entries(AETHER_SCHEMA)){const input=q('#aether-'+key);if(document.activeElement!==input)input.value=display[key];input.parentElement.querySelector('output').value=key==='depth'||key==='focus'?Math.round(display[key]*100)+'%':display[key].toFixed(2)+'×';input.parentElement.querySelector('button').disabled=display[key]===s.value;}
  q('#aether-journey').checked=display.journey;updateScene();
 }
 function commit(patch){const scored=getScoredLook();onManualEdit();const result=store.patch(scored?{...scored,...patch}:patch);settings=result.settings;apply();render();q('#aether-save-status').textContent=result.ok?'Applied · saved on this device':'Live for this visit · not saved';if(!result.ok)toast(result.error);}
 for(const node of [container])on(node,'click',e=>{const button=e.target.closest('[data-aether-form]');if(button)commit({form:button.dataset.aetherForm});});
 for(const key of Object.keys(AETHER_SCHEMA))on(q('#aether-'+key),'input',e=>commit({[key]:Number(e.target.value)}));
 on(container,'click',e=>{const button=e.target.closest('[data-aether-reset]');if(button)commit({[button.dataset.aetherReset]:AETHER_DEFAULTS[button.dataset.aetherReset]});});
 on(q('#aether-journey'),'change',e=>commit({journey:e.target.checked}));on(q('#aether-reset'),'click',()=>commit({...AETHER_DEFAULTS}));
 on(q('#aether-enter'),'click',()=>{chooseAether();updateScene();});
 function updateScene(){const id=getScene(),meta=environments[id],selected=!!meta;q('#aether-fields').disabled=!selected;q('#aether-inactive').hidden=selected;document.body.classList.toggle('aether-active',id==='aether');const name=meta?.name||'Your world';q('.aether-control-title h3').textContent=name+'.';q('.aether-control-title p').textContent=meta?.line||'Choose one of the three Beyond environments.';q('#aether-form-line').textContent=meta?.line||'';q('#aether-reset').textContent='Reset '+name+' ↺';q('#aether-inactive p').textContent='These controls shape Tidal, Monolith and Aether.';q('#aether-enter').textContent='Enter Aether ↗';for(const [i,button]of [...q('.aether-form-grid').querySelectorAll('button')].entries())button.querySelector('strong').textContent=meta?.forms[i]||AETHER_FORMS[i].name;}
 on(window,'storage',e=>{if(e.key!==AETHER_KEY&&e.key!==null)return;settings=store.read();apply();render();});
 function tick(time){if(disposed)return;if(getRoom()!==roomApplied)apply();if(time-lastPaint<200)return;lastPaint=time;updateScene();const scored=getScoredLook(),display=scored||settings;if(JSON.stringify(display)!==lastDisplayed)render(display);const d=getRoom()?.diagnostics;if(!d)return;
  const text=d.motion===false?'Motion off · world held':d.peak>.005?'Your sound, alive.':'An atmosphere waiting for your sound.';
  if(q('#aether-live-state').textContent!==text)q('#aether-live-state').textContent=text;
  const name=d.collection?.asset?.mode==='analytical-shader'?'Flow shader':d.collection?.asset?.mode==='gpu-half-float'?'Particle simulation':'';
  q('#aether-live-render').textContent=getScene()==='aether'?name:'';
 }
 render();apply();return {tick,get settings(){return {...settings};},dispose(){disposed=true;listeners.forEach(fn=>fn());container.replaceChildren();}};
}
