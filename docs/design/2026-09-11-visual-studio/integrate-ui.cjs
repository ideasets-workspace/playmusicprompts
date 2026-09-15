const fs=require('fs');
fs.copyFileSync('docs/design/2026-09-11-visual-studio/player-three-visual-settings.js','website_html_templates/player-three-visual-settings.js');
const file='website_html_templates/player-three.js';let s=fs.readFileSync(file,'utf8');
function rep(a,b){if(!s.includes(a))throw Error('Missing '+a);s=s.replace(a,()=>b);}
rep("import {createSessionControls}","import {createVisualStore} from './player-three-visual-settings.js';\nimport {createVisualStudio} from './player-three-visual-studio.js';\nimport {createSessionControls}");
rep('let room=null;const visualState','const visualStore=createVisualStore(storage);let visualStudio=null;\nlet room=null;const visualState');
rep('room.setReactivity(visualState.reactivity);}catch','room.setReactivity(visualState.reactivity);room.setVisualSettings(visualStudio?.settings||visualStore.read().settings);}catch');
rep('function closePanel(){if(!currentPanel)return;','function closePanel(){if(!currentPanel)return;if(currentPanel.id===\'visual-panel\')visualStudio?.close();');
rep("currentPanel.querySelector('button')?.focus();}","if(id==='visual-panel')visualStudio?.open();currentPanel.querySelector('button')?.focus();}");
rep("persist('model');},open:()=>openPanel('visual-panel'),close:closePanel});","persist('model');visualStudio?.refreshScene();},open:()=>{openPanel('visual-panel');visualStudio?.showTab('scene');},close:()=>visualStudio?.refreshScene()});");
rep('function cinema(force){','visualStudio=createVisualStudio({store:visualStore,getRoom:()=>room,getModel:()=>visualState.model,toast,audio,togglePlay});\nfunction cinema(force){');
rep('sceneSelection?.synchronize();}}});','sceneSelection?.synchronize();visualStudio?.refreshScene();}}});');
rep('visual:{...visualState}','visual:{...visualState,studio:visualStudio?.settings}');
fs.writeFileSync(file,s);
const html='website_html_templates/player-three.html';let h=fs.readFileSync(html,'utf8');h=h.replace('<link rel="stylesheet" href="player-three-layout.css">','<link rel="stylesheet" href="player-three-layout.css"><link rel="stylesheet" href="player-three-visual-studio.css">');fs.writeFileSync(html,h);
