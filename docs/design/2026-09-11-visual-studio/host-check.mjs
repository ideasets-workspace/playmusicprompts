import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as REAL_THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
import {createAudioFeatures} from '../../../website_html_templates/player-three-features.js';
import {getWorld} from '../../../website_html_templates/player-three-worlds.js';
import {VISUAL_DEFAULTS,VISUAL_SCHEMA,sanitizeVisualSettings} from '../../../website_html_templates/player-three-visual-settings.js';

const website=new URL('../../../website_html_templates/',import.meta.url);
const threeURL=new URL('vendor/three/build/three.module.js',website).href;
async function importMapped(relative){
  const file=new URL(relative,website),source=readFileSync(file,'utf8');
  const mapped=source.replace(/from\s+(['"])([^'"]+)\1/g,(match,quote,spec)=>{
    const target=spec==='three'?threeURL:spec.startsWith('.')?new URL(spec,file).href:spec;
    return `from ${JSON.stringify(target)}`;
  });
  return import(`data:text/javascript;base64,${Buffer.from(mapped).toString('base64')}`);
}
const {createSceneCollection:realCollection}=await importMapped('player-three-models.js');
const {Reflector}=await importMapped('vendor/three/examples/jsm/objects/Reflector.js');
const {RoomEnvironment}=await importMapped('vendor/three/examples/jsm/environments/RoomEnvironment.js');
const hostSource=readFileSync(new URL('player-three-scene.js',website),'utf8');
const sourceHash=createHash('sha256').update(hostSource).digest('hex');
const importless=hostSource.replace(/^import[^\n]*\n/gm,'');
assert(!/^import\s/m.test(importless),'Unexpected import layout; review the harness instead of silently changing host code');
const names=['THREE','createSceneCollection','createAudioFeatures','getWorld','OrbitControls','EffectComposer','RenderPass','UnrealBloomPass','OutputPass','ShaderPass','VISUAL_DEFAULTS','sanitizeVisualSettings','Reflector','RoomEnvironment'];
// Only imports are adapted. Each call delegates immediately to the current dependency registry.
// Production function, shader text and frame/setter bodies below are unchanged.
const prefix=names.map(name=>name==='THREE'||name==='VISUAL_DEFAULTS'
  ? `const ${name}=globalThis.__STUDIO_HOST_DEPS.${name};`
  : ['createSceneCollection','createAudioFeatures','getWorld','sanitizeVisualSettings'].includes(name)
    ? `const ${name}=(...args)=>globalThis.__STUDIO_HOST_DEPS.${name}(...args);`
    : `const ${name}=new Proxy(function(){},{construct(_target,args){return new globalThis.__STUDIO_HOST_DEPS.${name}(...args);}});`).join('\n');

let current;
function canvas(){
  return {width:1,height:1,style:{},listeners:new Map(),setAttribute(){},addEventListener(type,fn){this.listeners.set(type,fn);},
    getContext(){return {drawImage(){current.transitionCaptures++;}};},remove(){this.removed=true;},
    animate(){return {cancel(){},finished:Promise.resolve()};}};
}
class RendererBoundary {
  constructor(){this.domElement=canvas();this.capabilities={getMaxAnisotropy:()=>8};current.renderer=this;}
  setClearColor(color){this.clearColor=color;}
  setPixelRatio(ratio){this.pixelRatio=ratio;}
  setSize(w,h){this.domElement.width=w;this.domElement.height=h;}
  dispose(){this.disposed=true;}
}
class PMREMBoundary {
  fromScene(){const texture=new REAL_THREE.Texture();return {texture,dispose(){texture.dispose();}};}
  dispose(){}
}
class TextureBoundary {load(){return new REAL_THREE.Texture();}}
class ControlsBoundary {
  constructor(camera){this.object=camera;this.target=new REAL_THREE.Vector3();this.enableRotate=true;this.autoRotate=false;this.updates=[];current.controls=this;}
  update(dt){this.updates.push(dt);}
  getAzimuthalAngle(){return Math.atan2(this.object.position.x-this.target.x,this.object.position.z-this.target.z);}
  dispose(){this.disposed=true;}
}
class ComposerBoundary {
  constructor(renderer){this.renderer=renderer;this.passes=[];this.renders=0;current.composer=this;}
  addPass(pass){this.passes.push(pass);}
  setPixelRatio(value){this.pixelRatio=value;}
  setSize(w,h){this.width=w;this.height=h;}
  render(){this.renders++;}
  dispose(){this.disposed=true;}
}
class RenderPassBoundary {constructor(scene,camera){this.scene=scene;this.camera=camera;current.scene=scene;current.camera=camera;}}
class BloomBoundary {constructor(size,strength,radius,threshold){Object.assign(this,{size,strength,radius,threshold});current.bloom=this;}dispose(){this.disposed=true;}}
class GradeBoundary {constructor(shader){this.uniforms=REAL_THREE.UniformsUtils.clone(shader.uniforms);this.fragmentShader=shader.fragmentShader;current.grade=this;}dispose(){this.disposed=true;}}
class OutputBoundary {}
const deps={THREE:{...REAL_THREE,WebGLRenderer:RendererBoundary,PMREMGenerator:PMREMBoundary,TextureLoader:TextureBoundary},
  createSceneCollection(scene){const real=realCollection(scene);current.collection=real;return {
    select:id=>real.select(id),get view(){return real.view;},setPalette:w=>real.setPalette(w),
    update(frame){current.frames.push({...frame,spectrum:Array.from(frame.spectrum),look:{...frame.look}});real.update(frame);},
    get diagnostics(){return real.diagnostics;},dispose:()=>real.dispose()
  };},
  createAudioFeatures,getWorld,OrbitControls:ControlsBoundary,EffectComposer:ComposerBoundary,RenderPass:RenderPassBoundary,
  UnrealBloomPass:BloomBoundary,OutputPass:OutputBoundary,ShaderPass:GradeBoundary,VISUAL_DEFAULTS,sanitizeVisualSettings,Reflector,RoomEnvironment};
globalThis.__STUDIO_HOST_DEPS=deps;
const {createListeningRoom}=await import(`data:text/javascript;base64,${Buffer.from(prefix+'\n'+importless).toString('base64')}`);
const results=[];
function near(a,b,tolerance=1e-7){assert(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);}
function check(name,fn){fn();results.push(name);}
function harness(width=1000,height=700){
  const ctx={frames:[],queue:[],now:1000,errors:[],transitionCaptures:0};current=ctx;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>ctx.now}});
  globalThis.document={hidden:false,createElement:canvas};
  globalThis.matchMedia=query=>({matches:query==='(pointer:fine)'});
  globalThis.devicePixelRatio=1.5;
  globalThis.requestAnimationFrame=fn=>{ctx.queue.push(fn);return ctx.queue.length;};
  globalThis.ResizeObserver=class{constructor(fn){ctx.resize=fn;}observe(){}disconnect(){ctx.resizeDisconnected=true;}};
  ctx.host={clientWidth:width,clientHeight:height,dataset:{},children:[],append(item){this.children.push(item);}};
  ctx.room=createListeningRoom(ctx.host,error=>ctx.errors.push(error));
  ctx.room.setVisualSettings(VISUAL_DEFAULTS);
  ctx.apply=patch=>ctx.room.setVisualSettings({...VISUAL_DEFAULTS,...patch});
  ctx.step=(milliseconds=20)=>{current=ctx;ctx.now+=milliseconds;assert(ctx.queue.length);ctx.queue.shift()(ctx.now);};
  ctx.run=(count,milliseconds=20)=>{for(let i=0;i<count;i++)ctx.step(milliseconds);};
  ctx.last=()=>ctx.frames.at(-1);
  ctx.select=id=>{ctx.room.setMotion(false);ctx.room.setModel(id);ctx.room.setMotion(true);};
  ctx.audio=(data,playing=true,audible=true)=>ctx.room.setAudio(data,48000,2048,playing,audible);
  ctx.distance=()=>ctx.camera.position.distanceTo(ctx.controls.target);
  ctx.close=()=>{current=ctx;ctx.room.dispose();};
  return ctx;
}
function using(fn){const ctx=harness();try{fn(ctx);}finally{ctx.close();}}
const fullSpectrum=new Uint8Array(1024).fill(128);
const silentSpectrum=new Uint8Array(1024);
function recordObjects(ctx){return {
  spectrum:ctx.scene.children.find(o=>o.isGroup&&o.children.some(c=>c.isInstancedMesh)).children.find(c=>c.isInstancedMesh),
  dust:ctx.scene.children.find(o=>o.isPoints),reflector:ctx.scene.children.find(o=>o.isReflector)
};}
function matrixHeights(spectrum){const matrix=new REAL_THREE.Matrix4(),scale=new REAL_THREE.Vector3(),pos=new REAL_THREE.Vector3(),rotation=new REAL_THREE.Quaternion();
  return Array.from({length:160},(_,i)=>{spectrum.getMatrixAt(i,matrix);matrix.decompose(pos,rotation,scale);return scale.y;});}
function asset(ctx,name){return ctx.scene.getObjectByName(name);}

check('Host constructs actual Three geometry/material/camera and uses identity grade by default',()=>using(ctx=>{
  assert(ctx.scene.isScene);assert(ctx.camera.isPerspectiveCamera);assert.equal(REAL_THREE.REVISION,'185');
  assert.equal(ctx.grade.enabled,false);assert.equal(ctx.grade.uniforms.saturation.value,1);assert.equal(ctx.grade.uniforms.vignette.value,0);
  assert.equal(ctx.renderer.toneMappingExposure,1.05);assert.equal(ctx.composer.passes.length,4);
  assert(recordObjects(ctx).reflector instanceof Reflector);assert.equal(recordObjects(ctx).spectrum.count,160);
  ctx.step();assert.equal(ctx.errors.length,0);
}));
check('Exposure, bloom radius and strength alter actual renderer/pass state with safe defaults restored',()=>using(ctx=>{
  ctx.apply({exposure:1.7,bloom:2,bloomRadius:.9});ctx.step();
  assert.equal(ctx.renderer.toneMappingExposure,1.7);assert.equal(ctx.bloom.radius,.9);near(ctx.bloom.strength,(.2+.65*.65)*2);
  ctx.apply({bloom:0});ctx.step();assert.equal(ctx.bloom.strength,0);
  ctx.apply({});ctx.step();assert.equal(ctx.renderer.toneMappingExposure,1.05);near(ctx.bloom.strength,.2+.65*.65);
}));
check('Color richness and edge shade enable real grade uniforms; original bypasses the pass',()=>using(ctx=>{
  ctx.apply({saturation:0,vignette:.8});assert.equal(ctx.grade.enabled,true);
  assert.equal(ctx.grade.uniforms.saturation.value,0);assert.equal(ctx.grade.uniforms.vignette.value,.8);
  assert.match(ctx.grade.fragmentShader,/mix\(vec3\(l\),c\.rgb,saturation\)/);
  assert.match(ctx.grade.fragmentShader,/vignette\*smoothstep/);
  ctx.apply({saturation:1,vignette:0});assert.equal(ctx.grade.enabled,false);
}));
check('Record dust density changes actual draw range and glow changes PointsMaterial opacity',()=>using(ctx=>{
  const {dust}=recordObjects(ctx);ctx.apply({particles:.25,particleGlow:2});
  assert.equal(dust.geometry.drawRange.count,100);near(dust.material.opacity,.9);
  ctx.apply({particles:0,particleGlow:.2});assert.equal(dust.geometry.drawRange.count,0);near(dust.material.opacity,.09);
  ctx.apply({});assert.equal(dust.geometry.drawRange.count,400);near(dust.material.opacity,.45);
}));
check('Record reflection scales actual Reflector radiance and fog remains Record-only across scene switches',()=>using(ctx=>{
  const {reflector}=recordObjects(ctx);const base=new REAL_THREE.Color(0x34303e);
  ctx.apply({recordReflect:1.5,recordFog:.12});assert.equal(ctx.scene.fog.density,.12);
  near(reflector.material.uniforms.color.value.r,base.r);assert.equal(reflector.material.uniforms.reflectionStrength.value,1.5);
  assert.match(reflector.material.fragmentShader,/blendOverlay\( base\.rgb, color \) \* reflectionStrength/);
  ctx.apply({recordReflect:0,recordFog:0});assert.equal(reflector.material.uniforms.reflectionStrength.value,0);assert.equal(ctx.scene.fog.density,0);
  ctx.select('orbital');assert.equal(ctx.scene.fog,null);ctx.apply({recordFog:.08});assert.equal(ctx.scene.fog,null);
  ctx.select('record');near(ctx.scene.fog.density,.08);
}));
check('Record spectrum height changes actual instance matrices and stays editable with motion frozen',()=>using(ctx=>{
  ctx.audio(fullSpectrum);ctx.run(30);const {spectrum}=recordObjects(ctx);const normal=matrixHeights(spectrum);
  ctx.room.setMotion(false);ctx.apply({recordSpectrum:2});ctx.step();const twice=matrixHeights(spectrum);
  for(let i=0;i<160;i++)near(twice[i]-.035,(normal[i]-.035)*2,1e-6);
  ctx.apply({recordSpectrum:.2});ctx.step();const short=matrixHeights(spectrum);
  for(let i=0;i<160;i++)near(short[i]-.035,(normal[i]-.035)*.2,1e-6);
}));
check('Record spectrum height also changes actual Wave geometry with a frozen clock',()=>using(ctx=>{
  ctx.room.setForm('wave');ctx.audio(fullSpectrum);ctx.run(20);ctx.room.setMotion(false);
  const flow=ctx.scene.children.find(o=>o.isGroup&&o.children.length===20&&o.children.every(c=>c.isLine));
  assert(flow.visible);
  const positions=()=>flow.children.flatMap(line=>Array.from(line.geometry.attributes.position.array));
  ctx.apply({recordSpectrum:.2});ctx.step();const low=positions();
  ctx.apply({recordSpectrum:1});ctx.step();const normal=positions();
  ctx.apply({recordSpectrum:2});ctx.step();const high=positions();
  let changed=0;
  for(let i=0;i<low.length;i++)if(i%3===1){near(high[i]-normal[i],(normal[i]-low[i])/0.8,5e-7);if(Math.abs(high[i]-normal[i])>.01)changed++;}
  assert(changed>1000);
}));
check('All 29 sanitized settings reach the real collection frame without rewriting source settings',()=>using(ctx=>{
  const input=Object.fromEntries(Object.entries(VISUAL_SCHEMA).map(([key,spec])=>[key,spec.max]));
  ctx.room.setVisualSettings(input);input.prismWidth=-100;
  ctx.select('liquid');ctx.step();const frame=ctx.last();assert.equal(Object.keys(frame.look).length,29);
  for(const [key,spec] of Object.entries(VISUAL_SCHEMA))assert.equal(frame.look[key],spec.max,key);
  const prism=asset(ctx,'prism-passage');assert.equal(prism.children[0].material.uniforms.uWidth.value,1.3);
}));
check('Real host routes scene-specific settings to Neural, Horizon and Prism after switching',()=>using(ctx=>{
  const look={neuralSpread:1.2,neuralSway:0,neuralTrail:2,horizonGravity:1.25,horizonFlow:0,horizonDetail:1.5,horizonTilt:.18,prismWidth:1.3,prismTwist:0,prismSpeed:0,prismGloss:1.6,particles:.5,particleGlow:2};
  ctx.apply(look);
  for(const id of ['aurora','orbital','liquid']){ctx.select(id);ctx.step();for(const [key,value] of Object.entries(look))assert.equal(ctx.last().look[key],value);assert.equal(ctx.collection.diagnostics.selected,id);}
}));
check('World tempo scales choreography once while real feature timing and real audio smoothing remain independent',()=>{
  const capture=pace=>{const ctx=harness();try{ctx.apply({motionSpeed:pace});ctx.audio(fullSpectrum);ctx.step(50);return {frame:ctx.last(),diagnostics:{...ctx.room.diagnostics}};}finally{ctx.close();}};
  const normal=capture(1),fast=capture(2.5);near(normal.frame.dt,.05);near(fast.frame.dt,.125);near(fast.frame.time,normal.frame.time*2.5);
  assert.equal(fast.frame.bass,normal.frame.bass);assert.deepEqual(fast.frame.spectrum,normal.frame.spectrum);
});
check('Smoothing changes actual band and spectrum attack at equal real audio inputs',()=>{
  const capture=smoothing=>{const ctx=harness();try{ctx.apply({smoothing});ctx.audio(fullSpectrum);ctx.step();return ctx.last();}finally{ctx.close();}};
  const sharp=capture(.25),soft=capture(2.5);assert(sharp.bass>soft.bass*4);assert(sharp.spectrum[20]>soft.spectrum[20]*4);
});
check('Bass, midrange and treble gains independently scale actual three bands and 64 spectral bins',()=>{
  const capture=patch=>{const ctx=harness();try{ctx.apply(patch);ctx.audio(fullSpectrum);ctx.run(8);return ctx.last();}finally{ctx.close();}};
  const baseline=capture({});
  for(const [key,field,low,high] of [['bassGain','bass',0,19],['midGain','mid',20,41],['trebleGain','treble',42,63]]){
    const muted=capture({[key]:0}),boosted=capture({[key]:2});assert.equal(muted[field],0);near(boosted[field],baseline[field]*2);
    for(let i=low;i<=high;i++){assert.equal(muted.spectrum[i],0);near(boosted.spectrum[i],baseline.spectrum[i]*2);}
    for(const other of ['bass','mid','treble'].filter(item=>item!==field))near(muted[other],baseline[other]);
  }
});
check('Zero gains remove Record spectrum response without changing the supplied audio data',()=>using(ctx=>{
  ctx.apply({bassGain:0,midGain:0,trebleGain:0});ctx.audio(fullSpectrum);ctx.run(10);
  for(const height of matrixHeights(recordObjects(ctx).spectrum))near(height,.035,1e-7);
  assert(fullSpectrum.every(value=>value===128));assert.equal(ctx.last().energy,0);
}));
check('Real detector transients are scaled and zero pulse suppresses existing real Prism fronts immediately',()=>{
  const capture=gain=>{const ctx=harness();try{ctx.select('liquid');ctx.apply({pulseGain:gain});ctx.audio(silentSpectrum);ctx.run(12);ctx.audio(fullSpectrum);ctx.step();
    const before=ctx.last();const group=asset(ctx,'prism-passage');const energy=Array.from(group.children[0].material.uniforms.uFrontEnergy.value);
    ctx.room.setMotion(false);ctx.apply({pulseGain:0});ctx.step();assert(group.children[0].material.uniforms.uFrontEnergy.value.every(value=>value===0));
    return {frame:before,energy};}finally{ctx.close();}};
  const base=capture(1),double=capture(2),off=capture(0);assert.equal(base.frame.onset,true);assert(base.energy.some(value=>value>0));
  near(double.frame.pulse,base.frame.pulse*2);assert.equal(off.frame.onset,false);assert.equal(off.frame.pulse,0);assert(off.energy.every(value=>value===0));
});
check('Muted or inactive analyser input does not produce forwarded onset events',()=>using(ctx=>{
  ctx.audio(silentSpectrum);ctx.run(12);ctx.audio(fullSpectrum,true,false);ctx.step();assert.equal(ctx.last().onset,false);assert.equal(ctx.last().pulse,0);
  ctx.audio(fullSpectrum,false,true);ctx.run(4);assert.equal(ctx.last().onset,false);assert.equal(ctx.last().pulse,0);
}));
check('Motion off freezes Record matrices/rotation/light and real Prism pose despite incoming audio changes',()=>using(ctx=>{
  ctx.audio(fullSpectrum);ctx.run(20);ctx.room.setMotion(false);ctx.step();
  const {spectrum}=recordObjects(ctx),matrix=Array.from(spectrum.instanceMatrix.array),spin=ctx.room.diagnostics.spinAngle;
  const material=spectrum.material,emissive=material.emissiveIntensity;
  ctx.audio(silentSpectrum);ctx.run(12);assert.deepEqual(Array.from(spectrum.instanceMatrix.array),matrix);assert.equal(ctx.room.diagnostics.spinAngle,spin);assert.equal(material.emissiveIntensity,emissive);
  ctx.select('liquid');ctx.audio(fullSpectrum);ctx.run(12);ctx.room.setMotion(false);ctx.step();
  const u=asset(ctx,'prism-passage').children[0].material.uniforms;const snapshot=()=>JSON.stringify(['uPhase','uTravel','uBass','uMid','uTreble','uEnergy','uFront','uFrontEnergy'].map(key=>u[key].value));const pose=snapshot();
  ctx.audio(silentSpectrum);ctx.run(12);assert.equal(snapshot(),pose);
}));
check('Framing changes real camera distance, unrelated edits preserve it and reset restores intended composition',()=>using(ctx=>{
  const base=ctx.distance();ctx.apply({framing:1.25});near(ctx.distance(),base/1.25);
  ctx.camera.position.add(new REAL_THREE.Vector3(1,2,3));const manual=ctx.camera.position.clone();
  ctx.apply({framing:1.25,exposure:1.5});assert.deepEqual(ctx.camera.position.toArray(),manual.toArray());
  ctx.room.reset();near(ctx.distance(),base/1.25);
  ctx.select('liquid');const safeDistance=ctx.distance();ctx.apply({framing:1.35});near(ctx.distance(),safeDistance);near(ctx.camera.zoom,1.35);
  ctx.apply({framing:.75});near(ctx.distance(),safeDistance);near(ctx.camera.zoom,.75);
  ctx.select('record');near(ctx.camera.zoom,1);
}));
check('Resize fits actual camera to preview aspect without clearing advanced settings',()=>using(ctx=>{
  ctx.select('orbital');ctx.apply({framing:1.1,horizonTilt:.12});const wide=ctx.distance();
  ctx.host.clientWidth=300;ctx.host.clientHeight=400;ctx.resize();assert(ctx.distance()>wide);near(ctx.camera.aspect,.75);
  ctx.step();assert.equal(ctx.last().look.horizonTilt,.12);assert.equal(ctx.last().look.framing,1.1);
}));
check('Orbit speed reaches controls and only enabled compatible scenes auto-orbit during playback',()=>using(ctx=>{
  ctx.apply({orbitSpeed:1.2});ctx.room.setAutoOrbit(true);ctx.audio(fullSpectrum);ctx.step();assert.equal(ctx.controls.autoRotate,true);assert.equal(ctx.controls.autoRotateSpeed,1.2);
  ctx.select('orbital');ctx.step();assert.equal(ctx.controls.enableRotate,false);assert.equal(ctx.controls.autoRotate,false);
  ctx.select('aurora');ctx.step();assert.equal(ctx.controls.enableRotate,true);assert.equal(ctx.controls.autoRotate,true);
  ctx.room.setMotion(false);ctx.step();assert.equal(ctx.controls.autoRotate,false);
}));
check('Low quality preserves explicit look values and intentionally disables costly bloom/reflection',()=>using(ctx=>{
  ctx.apply({bloom:2,bloomRadius:.9});ctx.room.setQuality('low');ctx.step(40);
  assert.equal(ctx.bloom.enabled,false);assert.equal(recordObjects(ctx).reflector.visible,false);assert.equal(ctx.last().look.bloom,2);assert.equal(ctx.last().quality,'low');
  ctx.room.setQuality('high');ctx.step();assert.equal(ctx.bloom.enabled,true);assert.equal(recordObjects(ctx).reflector.visible,true);assert.equal(ctx.bloom.radius,.9);
}));
check('Disposed host stops scheduling/renders and disposes its explicit boundaries',()=>{
  const ctx=harness();ctx.step();ctx.close();const renders=ctx.composer.renders;ctx.step();assert.equal(ctx.composer.renders,renders);
  assert.equal(ctx.renderer.disposed,true);assert.equal(ctx.grade.disposed,true);assert.equal(ctx.resizeDisconnected,true);assert.equal(ctx.controls.disposed,true);
});
console.log(JSON.stringify({scope:'Current host function, real bundled Three scene/geometry/material/camera/Reflector, actual collection/assets/features/settings. Renderer, composer passes, controls and DOM are explicit boundaries. No GPU, visual or audible playback claim.',threeRevision:REAL_THREE.REVISION,hostSHA256:sourceHash,passed:results.length,results},null,2));
