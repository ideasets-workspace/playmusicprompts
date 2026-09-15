const fs=require('fs');
const root='C:/Berk/PlayMusicPrompts/website_html_templates/';
function edit(file,changes){let s=fs.readFileSync(root+file,'utf8');for(const[from,to]of changes){if(!s.includes(from))throw Error(file+': missing '+from);s=s.replace(from,()=>to);}fs.writeFileSync(root+file,s);}
for(const name of ['aurora','orbital','liquid'])fs.copyFileSync(__dirname+'/'+name+'-asset.js',root+'player-three-'+name+'.js');
edit('player-three.html',[
 ['<link rel="stylesheet" href="player-three-ultra.css">','<link rel="stylesheet" href="player-three-ultra.css"><link rel="stylesheet" href="player-three-collection.css">'],
 ['<button class="text-btn" id="cinema"','<div class="stage-actions"><button class="scene-choice" id="scene-choice" aria-controls="visual-panel" aria-expanded="false"><span>Scene</span><strong id="scene-choice-name">Record</strong><span data-icon="down"></span></button><button class="text-btn" id="cinema"'],
 ['<span id="cinema-label">Cinema mode</span></button></div>','<span id="cinema-label">Cinema mode</span></button></div></div>'],
 ['<label class="select-label" for="form">Sculpture</label>','<div class="scene-selection-title"><h3>Choose your scene</h3><span>04 SCENES</span></div><div class="scene-collection" id="scene-collection" role="group" aria-label="3D scene"></div><div class="scene-divider"></div><div id="record-form-controls"><label class="select-label" for="form">Record detail</label>'],
 ['Flow — the sound field</option></select>','Flow — the sound field</option></select></div>'],
 ['<div class="setting-heading"><h3>Turntable motion</h3>','<div id="record-spin-controls"><div class="setting-heading"><h3>Turntable motion</h3>'],
 ['aria-label="Record rotation speed"><div','aria-label="Record rotation speed"></div><div']
]);
edit('player-three.js',[
 ["import {motionPreference", "import {getScene,createSceneSelection} from './player-three-collection.js';\nimport {motionPreference"],
 ["const visualState={world:","const visualState={model:getScene(prefs.model).id,world:"],
 ['room.setWorld(visualState.world);room.setForm','room.setWorld(visualState.world);room.setModel(visualState.model);room.setForm'],
 ["$(`[aria-controls=\"${id}\"]`)?.setAttribute('aria-expanded','true');","$$(`[aria-controls=\"${id}\"]`).forEach(button=>button.setAttribute('aria-expanded','true'));"],
 ["$('#queue-toggle').onclick=", "const sceneSelection=createSceneSelection({getCurrent:()=>visualState.model,onSelect(id){visualState.model=getScene(id).id;room?.setModel(visualState.model);persist();},open:()=>openPanel('visual-panel'),close:closePanel});\n$('#queue-toggle').onclick="]
]);
edit('player-three-scene.js',[
 ["import {getWorld}","import {createSceneCollection} from './player-three-models.js';\nimport {getWorld}"],
 ["let currentWorld='night';","let currentWorld='night',model='record';\n  const collection=createSceneCollection(scene);\n  function showModel(){const record=model==='record';sculpture.visible=deck.visible=architecture.visible=record;orbitGroup.visible=record&&form==='orbit';flow.visible=record&&form==='wave';spectrum.visible=record&&form!=='wave';}"],
 ["let sum=0,peak=0;for(let i=0;i<160;i++)", "let sum=0,peak=0,bass=0,mid=0,treble=0,bassCount=0,midCount=0,trebleCount=0;for(let i=0;i<160;i++)"],
 ["(v>amplitudes[i]?14:7));}","(v>amplitudes[i]?14:7));if(hz<250){bass+=amplitudes[i];bassCount++;}else if(hz<2000){mid+=amplitudes[i];midCount++;}else{treble+=amplitudes[i];trebleCount++;}}\n    bass=bass/bassCount*reactivity;mid=mid/midCount*reactivity;treble=treble/trebleCount*reactivity;"],
 ["for(let i=0;i<160;i++){const a=i/160", "if(model==='record'){for(let i=0;i<160;i++){const a=i/160"],
 ['spectrum.instanceMatrix.needsUpdate=true;','spectrum.instanceMatrix.needsUpdate=true;}'],
 ['const targetSpin=motion&&spin&&active?rpm*Math.PI*2/60:0;',"const targetSpin=motion&&active?(model==='record'?(spin?rpm:0):8)*Math.PI*2/60:0;"],
 ['rotor.rotation.z-=spinVelocity*dt;',"if(model==='record')rotor.rotation.z-=spinVelocity*dt;"],
 ["if(form==='wave'){", "collection.update({time:phase,dt,bass,mid,treble,energy:energy*reactivity,motion,intensity,active,spinVelocity});\n    if(model==='record'&&form==='wave'){"],
 ['{frames,energy,peak,spinAngle:', '{frames,energy,peak,bass,mid,treble,model,collection:collection.diagnostics,spinAngle:'],
 ['return{diagnostics,setAudio','return{diagnostics,setModel(id){model=collection.select(id);diagnostics.model=model;showModel();},setAudio'],
 ['currentWorld=w.id;weather=w.weather;', 'currentWorld=w.id;weather=w.weather;collection.setPalette(w);'],
 ["orbitGroup.visible=value==='orbit';flow.visible=value==='wave';spectrum.visible=value!=='wave';", 'showModel();'],
 ['controls.dispose();scene.traverse', 'controls.dispose();collection.dispose();scene.traverse']
]);
console.log('Three assets and four-way selection integrated.');
