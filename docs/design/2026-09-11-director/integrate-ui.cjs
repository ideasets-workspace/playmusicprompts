const fs=require('fs');
function edit(path,mutate){let s=fs.readFileSync(path,'utf8');const rep=(a,b)=>{if(!s.includes(a))throw Error('Missing '+path+': '+a.slice(0,90));s=s.replace(a,()=>b);};const all=(a,b)=>{if(!s.includes(a))throw Error('Missing repeated marker '+a);s=s.split(a).join(b);};mutate(rep,all);fs.writeFileSync(path,s);}
edit('website_html_templates/player-three-visual-studio.js',(rep,all)=>{
 rep('audio,togglePlay})','audio,togglePlay,onManualEdit=()=>{},onCompareChange=()=>{}})');
 rep("const panel=document.querySelector('#visual-panel'),q=s=>panel.querySelector(s);","const panel=document.querySelector('#visual-panel'),q=s=>panel.querySelector(s),STUDIO_TABS=['look','motion','scene','director'];");
 all("['look','motion','scene']",'STUDIO_TABS');
 rep("['Look','Motion','Scene']","['Look','Motion','Scene','Director']");
 rep('panel.append(shell);',"panel.append(shell);q('#studio-view-director').replaceChildren();");
 rep('function patch(key,value){','function patch(key,value){\n    endCompare();onManualEdit();');
 rep('function replace(settingsToApply){','function replace(settingsToApply){endCompare();onManualEdit();');
 rep("activeTab=tab;for(const id of STUDIO_TABS)","if(tab==='director')endCompare();activeTab=tab;panel.classList.toggle('studio-directing',tab==='director');for(const id of STUDIO_TABS)");
 rep("e.key==='End'?'scene':tabs[(index+(e.key==='ArrowRight'?1:2))%3]","e.key==='End'?'director':tabs[(index+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length]");
 rep("q('#studio-compare').onclick=()=>{comparing=!comparing;apply();render();};","function endCompare(){if(!comparing)return;comparing=false;onCompareChange(false);apply();render();}\n  q('#studio-compare').onclick=()=>{comparing=!comparing;onCompareChange(comparing);apply();render();};");
 rep('refreshScene,showTab,','refreshScene,showTab,endCompare,');
 rep('if(comparing){comparing=false;apply();render();}', 'endCompare();');
});
edit('website_html_templates/player-three.js',(rep)=>{
 rep("import {createVisualStore}","import {createPerformanceDirector} from './player-three-performance.js';\nimport {createVisualStore}");
 rep('let visualStudio=null;','let visualStudio=null,performanceDirector=null;');
 rep('\nfunction fallback(message)', '\nlet manualScene=visualState.model;\nfunction fallback(message)');
 rep("onSelect(id){visualState.model=getScene(id).id;room?.setModel(visualState.model);","onSelect(id){manualScene=getScene(id).id;performanceDirector?.bypass();visualState.model=manualScene;room?.setModel(visualState.model);");
 rep('toast,audio,togglePlay});\nfunction cinema',`toast,audio,togglePlay,onManualEdit:()=>performanceDirector?.bypass(),onCompareChange:value=>performanceDirector?.setComparing(value)});
performanceDirector=createPerformanceDirector({container:$('#studio-view-director'),storage,getRoom:()=>room,getBase:()=>visualStudio.settings,getScene:()=>visualState.model,getManualScene:()=>manualScene,getTrack:()=>current?{id:current.id,title:current.title}:null,audio,toast,onActivate:()=>visualStudio.endCompare(),onScene(id){visualState.model=getScene(id).id;room?.setModel(visualState.model);sceneSelection.synchronize();visualStudio.refreshScene();}});
function cinema`);
 rep("latest.model!==visualState.model){visualState.model=latest.model;", "latest.model!==manualScene){manualScene=latest.model;performanceDirector?.bypass();visualState.model=latest.model;");
 rep('!muted&&volume>0);requestAnimationFrame(analyse);','!muted&&volume>0);performanceDirector?.tick(performance.now());requestAnimationFrame(analyse);');
 rep('studio:visualStudio?.settings}', 'studio:visualStudio?.settings,director:performanceDirector?.live}');
});
edit('website_html_templates/player-three.html',(rep)=>rep('<link rel="stylesheet" href="player-three-visual-studio.css">','<link rel="stylesheet" href="player-three-visual-studio.css"><link rel="stylesheet" href="player-three-director.css">'));
