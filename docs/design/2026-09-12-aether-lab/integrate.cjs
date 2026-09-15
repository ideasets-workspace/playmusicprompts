const fs=require('fs'),dir='website_html_templates_lab/';
function edit(file,work){let s=fs.readFileSync(dir+file,'utf8');const rep=(a,b)=>{if(!s.includes(a))throw Error(file+' missing '+a.slice(0,90));s=s.replace(a,()=>b);};const all=(a,b)=>{if(!s.includes(a))throw Error(file+' missing repeated '+a);s=s.split(a).join(b);};work(rep,all);fs.writeFileSync(dir+file,s);}
edit('player-three.html',(rep)=>{
 rep('<link rel="stylesheet" href="player-three-director.css">','<link rel="stylesheet" href="player-three-director.css"><link rel="stylesheet" href="lab-aether.css">');
 rep(' THE LISTENING ROOM</div>',' AETHER LAB · 001</div>');
 rep('<nav aria-label="Player navigation">','<nav aria-label="Player navigation"><a class="back-link" href="http://127.0.0.1:4173/player-three.html" target="_blank" rel="noopener">Original player ↗</a>');
 rep('Less outside.<br>More <em>inside.</em>','Sound, beyond<br><em>imagination.</em>');
 rep('A world that moves with your music.<br>Press play. Be somewhere else.','A living universe. Shaped by your sound.<br>Press play. Feel it unfold.');
 rep('SOUND. IN ANOTHER DIMENSION.','A NEW STATE OF SOUND.');
 rep('04 SCENES','05 SCENES');
});
edit('player-three-collection.js',(rep)=>rep("export const SCENES = [",`export const SCENES = [
 {id:'aether',name:'Aether',short:'Aether',line:'Become part of the music.',detail:'Living light, flowing particles and three evolving forms. Your music shapes the current.',icon:'M2 17C8-6 16 30 22 7M2 12C9-11 15 35 22 12M2 7C8-16 16 40 22 17'},`));
edit('player-three-models.js',(rep)=>{
 rep("import {getScene}","import {createAetherAsset} from './lab-aether.js';\nimport {createAetherAtmosphere} from './lab-aether-atmosphere.js';\nimport {getScene}");
 rep('createSceneCollection(scene){','createSceneCollection(scene,{renderer}={}){');
 rep('const factories={aurora:',`function createAether(THREE){const asset=createAetherAsset(THREE,{renderer}),atmosphere=createAetherAtmosphere(THREE);asset.group.add(atmosphere.group);return {...asset,update(frame){asset.update(frame);atmosphere.update(frame);},setPalette(world){asset.setPalette(world);atmosphere.setPalette(world);},dispose(){atmosphere.dispose();asset.dispose();}};}
 const factories={aether:createAether,aurora:`);
});
edit('player-three-visual-studio.js',(rep,all)=>{
 all("['look','motion','scene','director']","['look','motion','scene','world','director']");
 rep("['Look','Motion','Scene','Director']","['Look','Motion','Scene','Aether','Director']");
 rep("q('#studio-view-director').replaceChildren();","q('#studio-view-director').replaceChildren();q('#studio-view-world').replaceChildren();");
 rep("panel.classList.toggle('studio-directing',tab==='director');","panel.classList.toggle('studio-directing',tab==='director');panel.classList.toggle('studio-world',tab==='world');");
 all('Neural, Horizon and Prism','Neural, Horizon, Prism and Aether');
});
edit('player-three-scene.js',(rep)=>{
 rep("import * as THREE from 'three';","import * as THREE from 'three';\nimport {AETHER_DEFAULTS,sanitizeAether} from './lab-aether-settings.js';");
 rep('let look={...VISUAL_DEFAULTS},performanceLook=', 'let labLook={...AETHER_DEFAULTS};\n  let look={...VISUAL_DEFAULTS},performanceLook=');
 rep('createSceneCollection(scene),features=', 'createSceneCollection(scene,{renderer}),features=');
 rep('const {mode}=performanceLook.camera;const amount=performanceLook.camera.amount*cameraHandback;',"const cameraLook=model==='aether'&&labLook.journey?{mode:'journey',amount:.85}:performanceLook.camera;const {mode}=cameraLook;const amount=cameraLook.amount*cameraHandback;");
 rep("if(mode==='breathe'||collection.view?.orbit===false)","if(mode==='journey'){const offset=camera.position.clone().sub(controls.target),desired=offset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),Math.sin(cameraPhase*.085)*amount*.65).multiplyScalar(1+Math.sin(cameraPhase*.11)*amount*.2);desired.y+=Math.sin(cameraPhase*.13)*amount*.7;cameraOffset.copy(desired).sub(offset);camera.position.add(cameraOffset);camera.lookAt(controls.target);}\n    else if(mode==='breathe'||collection.view?.orbit===false)");
 rep('look,quality:autoLow?', 'look,labLook,quality:autoLow?');
 rep('reactivity,look:{...look},signals:', 'reactivity,look:{...look},labLook:{...labLook},signals:');
 rep('return{diagnostics,setVisualSettings', 'return{diagnostics,setLabSettings(value){labLook=sanitizeAether(value);},setVisualSettings');
});
edit('player-three.js',(rep,all)=>{
 rep("import {createPerformanceDirector}","import {createAetherControls} from './lab-aether-ui.js';\nimport {createPerformanceDirector}");
 rep('let visualStudio=null,performanceDirector=null;', 'let visualStudio=null,performanceDirector=null,aetherControls=null;');
 all("['record','aurora','orbital','liquid']","['record','aurora','orbital','liquid','aether']");
 rep('onSelect(id){manualScene=getScene(id).id;performanceDirector?.bypass();visualState.model=manualScene;room?.setModel(visualState.model);persist(\'model\');visualStudio?.refreshScene();}', 'onSelect:chooseScene');
 rep('const sceneSelection=createSceneSelection(',"function chooseScene(id){manualScene=getScene(id).id;performanceDirector?.bypass();visualState.model=manualScene;room?.setModel(visualState.model);persist('model');visualStudio?.refreshScene();}\nconst sceneSelection=createSceneSelection(");
 rep('getManualScene:()=>manualScene,getTrack:', 'getManualScene:()=>manualScene,getLabBase:()=>aetherControls?.settings,getTrack:');
 rep('\nfunction cinema(force)',"\naetherControls=createAetherControls({storage,getRoom:()=>room,getScene:()=>visualState.model,chooseAether(){chooseScene('aether');sceneSelection.synchronize();},openWorld(){openPanel('visual-panel');visualStudio.showTab('world');},onManualEdit:()=>performanceDirector?.bypass(),toast});\nfunction cinema(force)");
 rep('performanceDirector?.tick(performance.now());requestAnimationFrame(analyse);', 'performanceDirector?.tick(performance.now());aetherControls?.tick(performance.now());requestAnimationFrame(analyse);');
});
console.log('Lab-only fifth scene, UI, renderer and main wiring integrated.');
