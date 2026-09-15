export const SCENES = [
 {id:'tidal',name:'Tidal',short:'Tidal',line:'Somewhere between sound and infinity.',detail:'An endless spectral ocean. Low frequencies move its surface; musical attacks expand through the water.',icon:'M2 8c5-8 5 8 10 0s5 8 10 0M2 14c5-8 5 8 10 0s5 8 10 0M2 20c5-8 5 8 10 0s5 8 10 0'},
 {id:'monolith',name:'Monolith',short:'Monolith',line:'Let your sound move mountains.',detail:'Monumental architecture opening around a luminous heart. Step into a space shaped by your music.',icon:'M2 22V8l5-5v19m3 0V1h4v21m3 0V3l5 5v14'},
 {id:'aether',name:'Aether',short:'Aether',line:'Become part of the music.',detail:'A surrounding river of light. Your sound opens a passage through luminous clouds.',icon:'M2 17C8-6 16 30 22 7M2 12C9-11 15 35 22 12M2 7C8-16 16 40 22 17'},
 {id:'record',name:'Record',short:'Record',line:'Your world, on rotation.',icon:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0-3a6 6 0 0 1 6 6'},
 {id:'aurora',name:'Neural Bloom',short:'Neural',line:'Your sound comes alive.',detail:'Bass awakens the canopy. Rhythm flows through its branches.',icon:'M12 22V12m0 2L6 9 3 3m3 6H2m10 3 6-4 3-5m-3 5h4M12 12 10 6 13 2m-3 4L7 3'},
 {id:'orbital',name:'Event Horizon',short:'Horizon',line:'Lose yourself in the pull.',detail:'A flowing accretion disk bends around a dark heart. Your sound stirs the light.',icon:'M15 9a4 4 0 1 0 0 6M2 15c4-7 18-11 20-6S7 22 3 18m4-8c0-8 11-10 12-1'},
 {id:'liquid',name:'Prism Passage',short:'Prism',line:'Go where sound can take you.',detail:'Follow the light into a shifting corridor. Transients race along its walls.',icon:'m8 2 8 0 6 6v8l-6 6H8l-6-6V8ZM10 7h4l3 3v4l-3 3h-4l-3-3v-4ZM2 8l5 2m10 0 5-2M2 16l5-2m10 0 5 2'}
];
export const getScene=id=>SCENES.find(scene=>scene.id===id)||SCENES[0];

export function createSceneSelection({getCurrent,onSelect,open,close}){
 const grid=document.querySelector('#scene-collection');
 grid.innerHTML=SCENES.map((scene,index)=>`<button class="model-card" data-model="${scene.id}" aria-pressed="false"><span class="model-card-top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${scene.icon}"/></svg><span class="model-number">0${index+1}</span></span><strong>${scene.name}</strong><small>${scene.line}</small><span class="model-check" aria-hidden="true">✓</span></button>`).join('');
 const note=document.createElement('p');note.className='scene-experience-note';note.id='scene-experience-note';grid.after(note);
 function synchronize(){
  const selected=getScene(getCurrent()),record=selected.id==='record',fixedView=['orbital','liquid','tidal','monolith'].includes(selected.id);
  for(const button of grid.querySelectorAll('[data-model]'))button.setAttribute('aria-pressed',String(button.dataset.model===selected.id));
  document.querySelector('#scene-choice-name').textContent=selected.short;document.querySelector('#scene-choice').setAttribute('aria-label',`Change 3D scene. Current scene: ${selected.name}`);
  document.querySelector('#record-form-controls').hidden=!record;document.querySelector('#record-spin-controls').hidden=!record;
  document.querySelector('.stage-meta').textContent=record?'IMMERSIVE WORLD':selected.name.toUpperCase();
  document.querySelector('#scene').setAttribute('aria-label',`${selected.name}. ${selected.detail||'A luminous record in a reflective listening room.'} ${fixedView?'Scroll to explore depth.':'Drag to orbit and scroll to zoom.'} Music controls are below.`);
  const orbit=document.querySelector('#auto-orbit');orbit.disabled=fixedView;
  orbit.closest('.setting-heading').nextElementSibling.textContent=fixedView?'This scene uses a composed view. Scroll to explore depth; Reset view brings you home.':'A slow camera journey around your sound. Drag any time to take the view into your own hands.';
  document.querySelector('#orbit-hint').textContent=fixedView?'Scroll to explore depth · Reset view to return':'Drag to explore · Scroll to move closer';
  note.textContent=selected.detail||'Your favorite world, on rotation. Drag to explore every angle.';
 }
 grid.onclick=event=>{const button=event.target.closest('[data-model]');if(!button)return;onSelect(button.dataset.model);synchronize();close();};
 document.querySelector('#scene-choice').onclick=()=>{open();grid.querySelector(`[data-model="${getScene(getCurrent()).id}"]`)?.focus();};
 synchronize();return{synchronize};
}
