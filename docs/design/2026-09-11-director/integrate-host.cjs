const fs=require('fs');const path='website_html_templates/player-three-scene.js';let s=fs.readFileSync(path,'utf8');
function rep(a,b){if(!s.includes(a))throw Error('Missing host marker: '+a.slice(0,80));s=s.replace(a,()=>b);}
rep("import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';","import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';\nimport {createOpticsPass} from './player-three-optics.js';");
rep('let look={...VISUAL_DEFAULTS};',`let look={...VISUAL_DEFAULTS},performanceLook={optics:{dispersion:0,streak:0,grain:0},camera:{mode:'still',amount:.35}};
  let cameraPhase=0,cameraZoomFactor=1,cameraRoll=0,cameraUserUntil=0;const cameraOffset=new THREE.Vector3(),captureRequests=new Set();`);
rep('grade.enabled=false;composer.addPass(grade);composer.addPass(new OutputPass());','grade.enabled=false;composer.addPass(grade);const optics=createOpticsPass();composer.addPass(optics.pass);composer.addPass(new OutputPass());');
rep('const resize=new ResizeObserver(setSize);',`function undoCameraPerformance(){camera.position.sub(cameraOffset);cameraOffset.set(0,0,0);camera.zoom/=cameraZoomFactor;cameraZoomFactor=1;camera.rotation.z-=cameraRoll;cameraRoll=0;camera.updateProjectionMatrix();}
  function cameraGesture(){undoCameraPerformance();cameraUserUntil=performance.now()+5000;}
  controls.addEventListener('start',cameraGesture);controls.addEventListener('end',cameraGesture);
  function choreographCamera(dt,time){
    if(motion&&active)cameraPhase+=dt;
    const {mode,amount}=performanceLook.camera;if(mode==='still'||amount===0||time<cameraUserUntil)return;
    if(mode==='breathe'||collection.view?.orbit===false){cameraZoomFactor=1+Math.sin(cameraPhase*.29)*amount*.07;camera.zoom*=cameraZoomFactor;camera.updateProjectionMatrix();if(mode==='arc'){cameraRoll=Math.sin(cameraPhase*.19)*amount*.035;camera.rotation.z+=cameraRoll;}}
    else{const offset=camera.position.clone().sub(controls.target),desired=offset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),Math.sin(cameraPhase*.19)*amount*.22);desired.y+=Math.sin(cameraPhase*.27)*amount*.16;cameraOffset.copy(desired).sub(offset);camera.position.add(cameraOffset);camera.lookAt(controls.target);}
  }
  const resize=new ResizeObserver(setSize);`);
rep('function reset(){\n    const aspect=', 'function reset(){\n    undoCameraPerformance();\n    const aspect=');
rep('    changeScene();\n    const visualDt=', '    undoCameraPerformance();changeScene();\n    const visualDt=');
rep('bass=bass/bassCount*reactivity*look.bassGain;', 'const signalBass=bass/bassCount,signalMid=mid/midCount,signalTreble=treble/trebleCount;\n    bass=bass/bassCount*reactivity*look.bassGain;');
rep('controls.update(visualDt);composer.render();frames++;','controls.update(visualDt);choreographCamera(visualDt,time);optics.update({...performanceLook.optics,time:phase,motion,quality:autoLow?\'low\':quality});composer.render();\n    for(const request of captureRequests){captureRequests.delete(request);clearTimeout(request.timeout);try{renderer.domElement.toBlob(blob=>blob?request.resolve(blob):request.reject(new Error(\'This browser could not save the frame.\')),\'image/png\');}catch(error){request.reject(error);}}\n    frames++;');
rep('world:currentWorld,reactivity,look:{...look}});','world:currentWorld,reactivity,look:{...look},signals:{bass:signalBass,mid:signalMid,treble:signalTreble,energy,pulse:musical.pulse,centroid:musical.centroid},performance:{...performanceLook,cameraPhase}});');
rep('setVisualSettings(value){const previous=look;', 'setVisualSettings(value,{continuous=false}={}){const previous=look;');
rep('if(previous.framing!==look.framing)reset();},setModel(id)',`if(previous.framing!==look.framing){if(continuous){undoCameraPerformance();if(collection.view?.aspectFit===false)camera.zoom=look.framing;else camera.position.sub(controls.target).multiplyScalar(previous.framing/look.framing).add(controls.target);camera.updateProjectionMatrix();}else reset();}},
  setPerformance(value={}){const o=value.optics||{},c=value.camera||{},bound=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;performanceLook={optics:{dispersion:bound(o.dispersion),streak:bound(o.streak),grain:bound(o.grain)},camera:{mode:['still','breathe','arc'].includes(c.mode)?c.mode:'still',amount:bound(c.amount)}};},
  captureFrame(){if(disposed||lost)return Promise.reject(new Error('The scene is not ready to capture.'));return new Promise((resolve,reject)=>{const request={resolve,reject,timeout:null};request.timeout=setTimeout(()=>{captureRequests.delete(request);reject(new Error('Keep the player visible, then try saving the frame again.'));},6000);captureRequests.add(request);});},setModel(id)`);
rep('dispose(){disposed=true;transitionAnimation?.cancel();','dispose(){disposed=true;for(const request of captureRequests){clearTimeout(request.timeout);request.reject(new Error(\'The listening room closed before capture.\'));}captureRequests.clear();transitionAnimation?.cancel();');
rep('grade.dispose();bloom.dispose();composer.dispose();','grade.dispose();optics.dispose();bloom.dispose();composer.dispose();');
fs.writeFileSync(path,s);
