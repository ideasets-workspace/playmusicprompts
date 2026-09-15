import assert from 'node:assert/strict';
import {createWorldTouch} from '../../../website_html_templates_beyond/world-touch.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import * as REAL_THREE from '../../../website_html_templates_beyond/vendor/three/build/three.module.js';
import {createAudioFeatures} from '../../../website_html_templates_beyond/player-three-features.js';
import {getWorld} from '../../../website_html_templates_beyond/player-three-worlds.js';
import {VISUAL_DEFAULTS,VISUAL_SCHEMA,sanitizeVisualSettings} from '../../../website_html_templates_beyond/player-three-visual-settings.js';
import {AETHER_DEFAULTS,sanitizeAether} from '../../../website_html_templates_beyond/lab-aether-settings.js';

const website=new URL('../../../website_html_templates_beyond/',import.meta.url);
const threeURL=new URL('vendor/three/build/three.module.js',website).href;
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier==='three')return {url:threeURL,shortCircuit:true};
  if(specifier.startsWith('three/addons/'))return {url:new URL('vendor/three/examples/jsm/'+specifier.slice(13),website).href,shortCircuit:true};
  return nextResolve(specifier,context);
}});
const {createOpticsPass:realOptics}=await import(new URL('player-three-optics.js',website).href);
const {ShaderPass:RealShaderPass}=await import('three/addons/postprocessing/ShaderPass.js');
const {OrbitControls:RealOrbitControls}=await import('three/addons/controls/OrbitControls.js');
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
const names=['createWorldTouch','THREE','AETHER_DEFAULTS','sanitizeAether','createSceneCollection','createAudioFeatures','createOpticsPass','getWorld','OrbitControls','EffectComposer','RenderPass','UnrealBloomPass','OutputPass','ShaderPass','VISUAL_DEFAULTS','sanitizeVisualSettings','Reflector','RoomEnvironment'];
// Only imports are adapted. Each call delegates immediately to the current dependency registry.
// Production function, shader text and frame/setter bodies below are unchanged.
const prefix=names.map(name=>['THREE','VISUAL_DEFAULTS','AETHER_DEFAULTS'].includes(name)
  ? `const ${name}=globalThis.__STUDIO_HOST_DEPS.${name};`
  : ['createWorldTouch','createSceneCollection','createAudioFeatures','createOpticsPass','getWorld','sanitizeVisualSettings','sanitizeAether'].includes(name)
    ? `const ${name}=(...args)=>globalThis.__STUDIO_HOST_DEPS.${name}(...args);`
    : `const ${name}=new Proxy(function(){},{construct(_target,args){return new globalThis.__STUDIO_HOST_DEPS.${name}(...args);}});`).join('\n');

let current;
function eventSurface(){
  const callbacks=new Map(),surface={listeners:new Map(),eventListeners:callbacks,
    addEventListener(type,fn,options){const capture=options===true||options?.capture===true,list=callbacks.get(type)||[];if(!list.some(item=>item.fn===fn&&item.capture===capture))list.push({fn,capture});callbacks.set(type,list);this.listeners.set(type,event=>this.dispatch(type,event));},
    removeEventListener(type,fn,options){const capture=options===true||options?.capture===true,list=(callbacks.get(type)||[]).filter(item=>item.fn!==fn||item.capture!==capture);if(list.length)callbacks.set(type,list);else{callbacks.delete(type);this.listeners.delete(type);}},
    dispatch(type,event={}){let stopped=false;event.type=type;event.target??=this;event.currentTarget=this;event.defaultPrevented??=false;event.preventDefault=()=>{event.defaultPrevented=true;};event.stopPropagation=()=>{event.propagationStopped=true;};event.stopImmediatePropagation=()=>{stopped=true;event.propagationStopped=true;};for(const capture of [true,false])for(const item of [...callbacks.get(type)||[]]){if(stopped)return event;if(item.capture===capture)item.fn.call(this,event);}return event;}
  };return surface;
}
function canvas(){
  const owner=current;
  const classes=new Set(),captures=new Set();
  return {...eventSurface(),classes,captures,classList:{toggle(name,value){if(value)classes.add(name);else classes.delete(name);}},getBoundingClientRect(){return {left:0,top:0,width:owner.host?.clientWidth||1280,height:owner.host?.clientHeight||720};},get clientWidth(){return owner.host?.clientWidth||1280;},get clientHeight(){return owner.host?.clientHeight||720;},setPointerCapture(id){captures.add(id);},hasPointerCapture(id){return captures.has(id);},releasePointerCapture(id){if(captures.delete(id))this.dispatch('lostpointercapture',{pointerId:id});},width:1,height:1,style:{},ownerDocument:globalThis.document,getRootNode(){return this.ownerDocument;},setAttribute(){},
    toBlob(callback,type){
      owner.captureCalls.push({render:owner.composer.renders,type});owner.order.push('toBlob');
      if(owner.blobError)throw owner.blobError;
      if(owner.delayBlob){owner.blobCallbacks.push(callback);return;}
      callback(owner.nullBlob?null:new Blob(['boundary pixels'],{type:'image/png'}));
    },
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
class ControlsBoundary extends RealOrbitControls {
  constructor(camera,element){super(camera,element);this.updates??=[];current.controls=this;}
  update(dt){this.updates??=[];this.updates.push(dt);return super.update(dt);}
  dispose(){super.dispose();this.disposed=true;}
}
class ComposerBoundary {
  constructor(renderer){this.renderer=renderer;this.passes=[];this.renders=0;current.composer=this;}
  addPass(pass){this.passes.push(pass);}
  setPixelRatio(value){this.pixelRatio=value;}
  setSize(w,h){this.width=w;this.height=h;for(const pass of this.passes)pass.setSize?.(w*(this.pixelRatio||1),h*(this.pixelRatio||1));}
  render(){this.renders++;current.order.push('render');}
  dispose(){this.disposed=true;}
}
class RenderPassBoundary {constructor(scene,camera){this.scene=scene;this.camera=camera;current.scene=scene;current.camera=camera;}}
class BloomBoundary {constructor(size,strength,radius,threshold){Object.assign(this,{size,strength,radius,threshold});current.bloom=this;}dispose(){this.disposed=true;}}
class GradeBoundary extends RealShaderPass {constructor(shader){super(shader);this.fragmentShader=shader.fragmentShader;current.grade=this;}dispose(){super.dispose();this.disposed=true;}}
class OutputBoundary {}
const deps={createWorldTouch,THREE:{...REAL_THREE,WebGLRenderer:RendererBoundary,PMREMGenerator:PMREMBoundary,TextureLoader:TextureBoundary},
  createSceneCollection(scene,options){current.collectionOptions=options;const real=realCollection(scene,options);current.collection=real;return {
    select:id=>real.select(id),get view(){return real.view;},setPalette:w=>real.setPalette(w),
    update(frame){current.frames.push({...frame,spectrum:Array.from(frame.spectrum),look:{...frame.look},labLook:{...frame.labLook},touch:{...frame.touch}});real.update(frame);},
    get diagnostics(){return real.diagnostics;},dispose:()=>real.dispose()
  };},
  createAudioFeatures,createOpticsPass(){const optics=realOptics();current.optics=optics;return optics;},getWorld,OrbitControls:ControlsBoundary,EffectComposer:ComposerBoundary,RenderPass:RenderPassBoundary,
  UnrealBloomPass:BloomBoundary,OutputPass:OutputBoundary,ShaderPass:GradeBoundary,VISUAL_DEFAULTS,sanitizeVisualSettings,AETHER_DEFAULTS,sanitizeAether,Reflector,RoomEnvironment};
globalThis.__STUDIO_HOST_DEPS=deps;
const {createListeningRoom}=await import(`data:text/javascript;base64,${Buffer.from(prefix+'\n'+importless).toString('base64')}`);
const results=[],failures=[];
function near(a,b,tolerance=1e-7){assert(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);}
function check(name,fn){try{fn();results.push(name);}catch(error){failures.push({name,error:error.message,stack:error.stack?.split('\n').slice(0,5).join('\n')});}}
async function checkAsync(name,fn){try{await fn();results.push(name);}catch(error){failures.push({name,error:error.message,stack:error.stack?.split('\n').slice(0,5).join('\n')});}}
function harness(width=1000,height=700){
  const ctx={frames:[],queue:[],now:1000,errors:[],transitionCaptures:0,captureCalls:[],blobCallbacks:[],order:[],timers:new Map(),nextTimer:1};current=ctx;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>ctx.now}});
  globalThis.document={...eventSurface(),hidden:false,createElement:canvas};
  ctx.rootEvents=eventSurface();globalThis.addEventListener=ctx.rootEvents.addEventListener.bind(ctx.rootEvents);globalThis.removeEventListener=ctx.rootEvents.removeEventListener.bind(ctx.rootEvents);
  globalThis.matchMedia=query=>({matches:query==='(pointer:fine)'});
  globalThis.devicePixelRatio=1.5;
  globalThis.requestAnimationFrame=fn=>{ctx.queue.push(fn);return ctx.queue.length;};
  globalThis.setTimeout=(fn,delay)=>{const id=ctx.nextTimer++;ctx.timers.set(id,{fn,delay});return id;};
  globalThis.clearTimeout=id=>ctx.timers.delete(id);
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
  ctx.pointer=(type,x=500,y=350,extra={})=>{const event={pointerId:1,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:1,clientX:x,clientY:y,pageX:x,pageY:y,ctrlKey:false,metaKey:false,shiftKey:false,...extra};ctx.renderer.domElement.dispatch(type,event);if(!event.propagationStopped)globalThis.document.dispatch(type,event);return event;};
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
  assert.equal(ctx.renderer.toneMappingExposure,1.05);assert.equal(ctx.composer.passes.length,5);assert.equal(ctx.optics.pass.enabled,false);
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
function pose(ctx){return [...ctx.camera.position.toArray(),...ctx.camera.quaternion.toArray(),ctx.camera.zoom];}
function samePose(a,b){for(let i=0;i<a.length;i++)near(a[i],b[i],1e-9);}

check('Director optics is the actual production pass between grade and output, default camera remains neutral',()=>using(ctx=>{
  ctx.run(10);assert.equal(ctx.composer.passes[2],ctx.grade);assert.equal(ctx.composer.passes[3],ctx.optics.pass);
  assert(ctx.optics.pass instanceof RealShaderPass);assert.equal(ctx.optics.pass.enabled,false);
  const initial=pose(ctx);ctx.run(10);samePose(pose(ctx),initial);assert.equal(ctx.room.diagnostics.performance.camera.mode,'still');
}));
check('setPerformance copies and bounds optics/camera without replacing the saved 29 look settings',()=>using(ctx=>{
  const value={optics:{dispersion:2,streak:-1,grain:NaN},camera:{mode:'arc',amount:4}};
  ctx.room.setPerformance(value);value.optics.dispersion=0;value.camera.mode='still';ctx.step();
  assert.deepEqual(ctx.room.diagnostics.performance.optics,{dispersion:1,streak:0,grain:0});
  assert.equal(ctx.room.diagnostics.performance.camera.mode,'arc');assert.equal(ctx.room.diagnostics.performance.camera.amount,1);
  assert.deepEqual(ctx.last().look,VISUAL_DEFAULTS);assert.equal(ctx.optics.pass.uniforms.uDispersion.value,1);
  ctx.room.setPerformance({optics:{grain:.6},camera:{mode:'invalid',amount:Infinity}});ctx.step();
  assert.equal(ctx.room.diagnostics.performance.camera.mode,'still');assert.equal(ctx.room.diagnostics.performance.camera.amount,0);
  assert.equal(ctx.optics.pass.uniforms.uGrain.value,.6);ctx.room.setPerformance();ctx.step();assert.equal(ctx.optics.pass.enabled,false);
}));
check('Continuous framing preserves manual direction and target without invoking a control reset',()=>using(ctx=>{
  ctx.controls.target.set(.3,2.1,.4);ctx.camera.position.copy(ctx.controls.target).add(new REAL_THREE.Vector3(5,3,9));
  const direction=ctx.camera.position.clone().sub(ctx.controls.target).normalize(),target=ctx.controls.target.clone(),distance=ctx.distance(),updates=ctx.controls.updates.length;
  ctx.room.setVisualSettings({...VISUAL_DEFAULTS,framing:1.25},{continuous:true});
  near(ctx.distance(),distance/1.25);assert.equal(ctx.controls.updates.length,updates);assert.deepEqual(ctx.controls.target.toArray(),target.toArray());
  const after=ctx.camera.position.clone().sub(ctx.controls.target).normalize();for(let i=0;i<3;i++)near(after.getComponent(i),direction.getComponent(i));
}));
check('Continuous framing clamps Horizon manual near/far distances to the actual composed profile',()=>using(ctx=>{
  ctx.select('orbital');const direction=ctx.camera.position.clone().sub(ctx.controls.target).normalize();
  ctx.camera.position.copy(direction).multiplyScalar(ctx.controls.minDistance).add(ctx.controls.target);
  ctx.room.setVisualSettings({...VISUAL_DEFAULTS,framing:1.35},{continuous:true});near(ctx.distance(),ctx.controls.minDistance);
  ctx.camera.position.copy(direction).multiplyScalar(ctx.controls.maxDistance).add(ctx.controls.target);
  ctx.room.setVisualSettings({...VISUAL_DEFAULTS,framing:.75},{continuous:true});near(ctx.distance(),ctx.controls.maxDistance);
}));
check('Prism continuous framing changes only lens zoom, preserving composed camera position',()=>using(ctx=>{
  ctx.select('liquid');const position=ctx.camera.position.clone(),target=ctx.controls.target.clone();
  ctx.room.setVisualSettings({...VISUAL_DEFAULTS,framing:1.35},{continuous:true});near(ctx.camera.zoom,1.35);
  assert.deepEqual(ctx.camera.position.toArray(),position.toArray());assert.deepEqual(ctx.controls.target.toArray(),target.toArray());
  ctx.room.setVisualSettings({...VISUAL_DEFAULTS,framing:.75},{continuous:true});near(ctx.camera.zoom,.75);assert.deepEqual(ctx.camera.position.toArray(),position.toArray());
}));
check('Breathe advances only during active playback and freezes its actual camera under pause and Motion off',()=>using(ctx=>{
  ctx.room.setPerformance({camera:{mode:'breathe',amount:1}});ctx.run(12);near(ctx.camera.zoom,1);assert.equal(ctx.room.diagnostics.performance.cameraPhase,0);
  ctx.audio(fullSpectrum);ctx.run(60);assert(Math.abs(ctx.camera.zoom-1)>.01);const moving=pose(ctx),phase=ctx.room.diagnostics.performance.cameraPhase;
  ctx.audio(silentSpectrum,false);ctx.run(20);samePose(pose(ctx),moving);assert.equal(ctx.room.diagnostics.performance.cameraPhase,phase);
  ctx.audio(fullSpectrum);ctx.room.setMotion(false);ctx.run(20);samePose(pose(ctx),moving);assert.equal(ctx.room.diagnostics.performance.cameraPhase,phase);
  ctx.room.setMotion(true);ctx.run(15);assert(ctx.room.diagnostics.performance.cameraPhase>phase);
}));
check('Record arc moves the actual perspective camera and can freeze without accumulating drift',()=>using(ctx=>{
  const baseline=pose(ctx);ctx.room.setPerformance({camera:{mode:'arc',amount:1}});ctx.audio(fullSpectrum);ctx.run(60);
  assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...baseline.slice(0,3)))>.05);
  ctx.room.setMotion(false);ctx.step();const frozen=pose(ctx);ctx.run(80);samePose(pose(ctx),frozen);
  ctx.room.setPerformance({camera:{mode:'still',amount:1}});ctx.step();samePose(pose(ctx),baseline);
}));
check('Composed Horizon and Prism arc uses bounded zoom/roll while preserving their camera positions',()=>using(ctx=>{
  for(const model of ['orbital','liquid']){
    ctx.select(model);ctx.room.setPerformance({camera:{mode:'still',amount:1}});ctx.step();const position=ctx.camera.position.clone(),zoom=ctx.camera.zoom;
    ctx.room.setPerformance({camera:{mode:'arc',amount:1}});ctx.audio(fullSpectrum);ctx.run(40);
    assert.equal(ctx.controls.enableRotate,false);assert.deepEqual(ctx.camera.position.toArray(),position.toArray());
    assert(Math.abs(ctx.camera.zoom-zoom)>.001);assert(Math.abs(ctx.camera.zoom/zoom-1)<=.07001);assert(Math.abs(ctx.camera.rotation.z)>.0001);
  }
}));
check('Manual camera gesture wins the hold period and remains stable indefinitely with Motion off',()=>using(ctx=>{
  ctx.room.setPerformance({camera:{mode:'arc',amount:1}});ctx.audio(fullSpectrum);ctx.run(25);
  ctx.controls.dispatchEvent({type:'start'});ctx.camera.position.add(new REAL_THREE.Vector3(.2,.1,.3));ctx.controls.dispatchEvent({type:'end'});ctx.room.setMotion(false);ctx.step();
  const manual=pose(ctx);ctx.run(160,50);samePose(pose(ctx),manual);
}));
check('After gesture hold and handback, subsequent Motion off freezes the reacquired camera pose',()=>using(ctx=>{
  ctx.room.setPerformance({camera:{mode:'arc',amount:1}});ctx.audio(fullSpectrum);ctx.run(20);
  ctx.controls.dispatchEvent({type:'start'});ctx.controls.dispatchEvent({type:'end'});ctx.run(140,50);
  const acquired=pose(ctx);ctx.room.setMotion(false);ctx.run(20);samePose(pose(ctx),acquired);
}));
check('Partially reacquired camera handback freezes its blend and resumes without a discontinuous jump',()=>using(ctx=>{
  ctx.room.setPerformance({camera:{mode:'arc',amount:1}});ctx.audio(fullSpectrum);ctx.run(30);
  ctx.controls.dispatchEvent({type:'start'});ctx.controls.dispatchEvent({type:'end'});ctx.run(104,50);
  const partial=pose(ctx);ctx.room.setMotion(false);ctx.run(40,50);samePose(pose(ctx),partial);
  ctx.room.setMotion(true);ctx.step();assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...partial.slice(0,3)))<.15);
}));
check('Repeated camera undo plus actual OrbitControls update does not drift framing, base settings or neutral pose',()=>using(ctx=>{
  assert(ctx.controls instanceof RealOrbitControls);
  const settings={...VISUAL_DEFAULTS,framing:1.15,exposure:1.2,saturation:.9};ctx.room.setVisualSettings(settings);ctx.audio(fullSpectrum);
  for(const scene of ['record','aurora','orbital','liquid']){
    ctx.select(scene);ctx.room.setPerformance({camera:{mode:'still',amount:1}});ctx.step();const baseline=pose(ctx);
    for(const mode of ['breathe','arc']){
      ctx.room.setPerformance({camera:{mode,amount:1}});ctx.run(300,20);ctx.room.setMotion(false);ctx.step();const frozen=pose(ctx);ctx.run(100);samePose(pose(ctx),frozen);
      assert.deepEqual(ctx.last().look,settings);ctx.room.setPerformance({camera:{mode:'still',amount:1}});ctx.step();samePose(pose(ctx),baseline);ctx.room.setMotion(true);
    }
  }
}));
check('Raw Director bands stay real and independent of user bass/mid/treble visual gains',()=>{
  const capture=look=>{const ctx=harness();try{ctx.apply(look);ctx.audio(silentSpectrum);ctx.run(12);ctx.audio(fullSpectrum);ctx.run(10);return {signals:{...ctx.room.diagnostics.signals},frame:ctx.last()};}finally{ctx.close();}};
  const normal=capture({}),suppressed=capture({bassGain:0,midGain:0,trebleGain:0,pulseGain:0});
  for(const key of ['bass','mid','treble','energy','pulse','centroid'])near(normal.signals[key],suppressed.signals[key]);
  assert(normal.signals.energy>0);assert(normal.signals.bass>0);assert.equal(suppressed.frame.bass,0);assert.equal(suppressed.frame.pulse,0);
  const ctx=harness();try{ctx.audio(silentSpectrum);ctx.run(5);assert(Object.values(ctx.room.diagnostics.signals).every(value=>value===0));}finally{ctx.close();}
});
check('Low quality retains optics using the real lower sample budget and correct preview pixels',()=>using(ctx=>{
  ctx.room.setPerformance({optics:{dispersion:.5,streak:.6,grain:.7}});ctx.room.setQuality('low');ctx.step(40);
  assert.equal(ctx.optics.pass.enabled,true);assert.equal(ctx.optics.pass.uniforms.uTaps.value,4);
  assert.deepEqual(ctx.optics.pass.uniforms.uResolution.value.toArray(),[1000,700]);
  ctx.host.clientWidth=410;ctx.host.clientHeight=190;ctx.resize();assert.deepEqual(ctx.optics.pass.uniforms.uResolution.value.toArray(),[410,190]);
  ctx.room.setQuality('high');ctx.step();assert.equal(ctx.optics.pass.uniforms.uTaps.value,8);assert.deepEqual(ctx.optics.pass.uniforms.uResolution.value.toArray(),[615,285]);
}));

check('Aether uses the same host renderer, real collection asset and sanitized independent lab frame',()=>using(ctx=>{
  const input={form:'helix',flow:1.7,spread:1.4,turbulence:.8,glow:1.6,depth:.3,focus:.9,journey:false};
  ctx.room.setLabSettings(input);input.flow=0;ctx.select('aether');ctx.step();
  assert.equal(ctx.collectionOptions.renderer,ctx.renderer);assert.equal(ctx.collection.diagnostics.selected,'aether');
  assert.equal(ctx.last().labLook.flow,1.7);assert.equal(ctx.last().labLook.form,'helix');
  assert.deepEqual(ctx.collection.diagnostics.asset.settings,ctx.last().labLook);assert.deepEqual(ctx.last().look,VISUAL_DEFAULTS);
  assert.equal(ctx.collection.diagnostics.asset.mode,'analytical-shader','No GPU capability is supplied by this explicit renderer boundary');
  assert.match(ctx.collection.diagnostics.asset.fallbackReason,/half-float color targets|floating-point renderer/);assert.equal(ctx.errors.length,0);
  ctx.room.setLabSettings({flow:99,spread:-10,form:'invalid',journey:'yes'});ctx.step();
  assert.equal(ctx.last().labLook.flow,2);assert.equal(ctx.last().labLook.spread,.6);assert.equal(ctx.last().labLook.form,'silk');assert.equal(ctx.last().labLook.journey,false);
}));
check('Aether static form and appearance edits apply while its automatic state remains frozen',()=>using(ctx=>{
  ctx.select('aether');ctx.audio(fullSpectrum);ctx.run(20);ctx.room.setMotion(false);ctx.step();
  const before=ctx.collection.diagnostics.asset,basePose=pose(ctx);
  ctx.room.setLabSettings({...AETHER_DEFAULTS,form:'nova',spread:1.4,glow:.3,depth:0});ctx.audio(silentSpectrum);ctx.run(20);
  const after=ctx.collection.diagnostics.asset;assert.equal(after.phase,before.phase);assert.equal(after.clock,before.clock);assert.equal(after.events,before.events);
  assert.equal(after.settings.form,'nova');assert.equal(after.settings.spread,1.4);assert.equal(after.settings.glow,.3);assert.equal(after.settings.depth,0);
  assert.deepEqual(after.weights,[0,1,0]);samePose(pose(ctx),basePose);
}));
check('Aether receives genuine host band gating and drops transient response when playback is paused',()=>using(ctx=>{
  ctx.select('aether');ctx.audio(silentSpectrum);ctx.run(15);ctx.audio(fullSpectrum);ctx.run(20);
  const active=ctx.collection.diagnostics.asset;assert(active.signals.bass>.1);assert(active.events>0);
  ctx.audio(fullSpectrum,false,false);ctx.run(120);const paused=ctx.collection.diagnostics.asset;
  assert(paused.signals.bass<.00001);assert(paused.signals.mid<.00001);assert(paused.signals.treble<.00001);assert.equal(paused.events,active.events);
  assert(paused.phase>active.phase,'Ambient phase is separate from audio activity');
}));
check('Journey camera waits for playback, then moves and holds the exact pose during pause and Motion off',()=>using(ctx=>{
  ctx.select('aether');ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.run(30);
  const baseline=pose(ctx);assert.equal(ctx.room.diagnostics.performance.cameraPhase,0);
  ctx.audio(fullSpectrum);ctx.run(80);const moving=pose(ctx),phase=ctx.room.diagnostics.performance.cameraPhase;
  assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...baseline.slice(0,3)))>.1);
  ctx.audio(silentSpectrum,false);ctx.run(60);samePose(pose(ctx),moving);assert.equal(ctx.room.diagnostics.performance.cameraPhase,phase);
  ctx.audio(fullSpectrum);ctx.room.setMotion(false);ctx.run(100);samePose(pose(ctx),moving);assert.equal(ctx.room.diagnostics.performance.cameraPhase,phase);
  ctx.room.setMotion(true);ctx.run(20);assert(ctx.room.diagnostics.performance.cameraPhase>phase);
}));
check('Turning Journey off restores the manual baseline without cumulative camera drift',()=>using(ctx=>{
  ctx.select('aether');const baseline=pose(ctx);ctx.audio(fullSpectrum);
  for(let i=0;i<4;i++){
    ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.run(200);
    assert(pose(ctx).every(Number.isFinite));ctx.room.setMotion(false);ctx.run(10);const held=pose(ctx);ctx.run(20);samePose(pose(ctx),held);
    ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:false});ctx.step();samePose(pose(ctx),baseline);ctx.room.setMotion(true);
  }
}));
check('Aether Journey yields to camera gestures for five seconds and reacquires smoothly from the manual baseline',()=>using(ctx=>{
  ctx.select('aether');ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.audio(fullSpectrum);ctx.run(70);
  ctx.controls.dispatchEvent({type:'start'});ctx.camera.position.add(new REAL_THREE.Vector3(.4,.15,.2));ctx.controls.dispatchEvent({type:'end'});ctx.step();
  const manual=pose(ctx);ctx.run(90,50);samePose(pose(ctx),manual);
  ctx.run(15,50);const reacquiring=pose(ctx);assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...manual.slice(0,3)))>.01);
  ctx.room.setMotion(false);ctx.run(60,50);samePose(pose(ctx),reacquiring);ctx.room.setMotion(true);ctx.step();
  assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...reacquiring.slice(0,3)))<.2);
  ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:false});ctx.step();samePose(pose(ctx),manual);
}));
check('Aether Journey gesture priority also holds when the separate Auto orbit setting is enabled',()=>using(ctx=>{
  ctx.select('aether');ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.room.setAutoOrbit(true);ctx.audio(fullSpectrum);ctx.run(50);
  ctx.controls.dispatchEvent({type:'start'});ctx.controls.dispatchEvent({type:'end'});ctx.step();
  const manual=pose(ctx);ctx.run(90,50);samePose(pose(ctx),manual);
}));
check('Journey is scoped to Aether; copied Record, Neural, Horizon and Prism retain their neutral camera behavior',()=>using(ctx=>{
  ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.audio(fullSpectrum);
  for(const scene of ['record','aurora','orbital','liquid']){ctx.select(scene);ctx.step();const baseline=pose(ctx);ctx.run(60);samePose(pose(ctx),baseline);assert.equal(ctx.collection.diagnostics.selected,scene);}
  ctx.select('aether');ctx.step();const baseline=pose(ctx);ctx.run(60);assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...baseline.slice(0,3)))>.01);
}));
check('Aether keeps explicit appearance through preview resize and really reduces submitted geometry in Low detail',()=>using(ctx=>{
  ctx.select('aether');ctx.room.setLabSettings({...AETHER_DEFAULTS,form:'helix',spread:1.35,depth:.4});ctx.room.setQuality('high');ctx.step();
  const high=ctx.collection.diagnostics.asset,wide=ctx.distance();assert.equal(high.count,65536);
  ctx.host.clientWidth=300;ctx.host.clientHeight=400;ctx.resize();ctx.step();near(ctx.distance(),wide);near(ctx.camera.aspect,.75);
  assert.equal(ctx.last().labLook.form,'helix');assert.equal(ctx.last().labLook.spread,1.35);
  ctx.room.setQuality('low');ctx.step(40);const low=ctx.collection.diagnostics.asset;assert.equal(low.count,high.count/4);assert.equal(low.lineSegments,high.lineSegments/4);assert.equal(low.computeCadence,3);
  assert.equal(ctx.last().labLook.depth,.4);assert.equal(ctx.bloom.enabled,false);
  ctx.room.setQuality('high');ctx.step();assert.equal(ctx.collection.diagnostics.asset.count,high.count);
}));

for(const world of ['tidal','monolith','aether']){
  check(`${world}: actual collection receives independent controls and composed preview framing`,()=>using(ctx=>{
    const labLook={...AETHER_DEFAULTS,form:'helix',flow:1.4,spread:1.3,turbulence:.9,glow:.7,depth:.3,focus:.8,journey:false};
    ctx.select(world);ctx.room.setLabSettings(labLook);ctx.step();
    assert.equal(ctx.collection.diagnostics.selected,world);assert.deepEqual(ctx.last().labLook,labLook);
    for(const key of ['form','flow','spread','turbulence','glow','depth','focus'])assert.equal(ctx.collection.diagnostics.asset.settings[key],labLook[key],key);
    assert.equal(ctx.collection.view.aspectFit,false);const position=ctx.camera.position.clone();ctx.apply({framing:1.25});near(ctx.camera.zoom,1.25);near(ctx.camera.position.distanceTo(position),0,1e-9);
    ctx.host.clientWidth=410;ctx.host.clientHeight=200;ctx.resize();near(ctx.camera.aspect,2.05);near(ctx.camera.position.distanceTo(position),0,1e-9);
  }));
  check(`${world}: Motion off freezes automatic uniforms and architecture while explicit edits still apply`,()=>using(ctx=>{
    ctx.select(world);ctx.audio(fullSpectrum);ctx.run(30);ctx.room.setMotion(false);ctx.step();
    const snapshot=()=>{const values=[];ctx.scene.traverse(object=>{if(!object.visible)return;if(object.isInstancedMesh)values.push(Array.from(object.instanceMatrix.array));for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[]){const uniforms=material.uniforms;for(const[key,uniform]of Object.entries(uniforms||{})){if(/^(td|ml|a)(Time|Clock|Phase|Bass|Mid|Treble|Energy|Events|Powers|Front|FrontEnergy)$/.test(key))values.push([key,ArrayBuffer.isView(uniform.value)?Array.from(uniform.value):uniform.value]);}}});return JSON.stringify(values);};
    const held=snapshot(),phase=ctx.collection.diagnostics.asset.phase,updates=ctx.collection.diagnostics.asset.updates;ctx.audio(silentSpectrum);ctx.run(80);assert.equal(snapshot(),held);assert.equal(ctx.collection.diagnostics.asset.phase,phase);assert.equal(ctx.collection.diagnostics.asset.updates,updates);
    ctx.room.setLabSettings({...AETHER_DEFAULTS,form:'nova',spread:1.45,glow:.3,depth:.1});ctx.step();
    const assetState=ctx.collection.diagnostics.asset;assert.equal(assetState.phase,phase);assert.equal(assetState.settings.form,'nova');assert.equal(assetState.settings.spread,1.45);assert.equal(assetState.settings.glow,.3);assert.equal(assetState.settings.depth,.1);
  }));
  check(`${world}: active analyser bands settle after pause, without inventing new onsets`,()=>using(ctx=>{
    ctx.select(world);ctx.audio(silentSpectrum);ctx.run(12);ctx.audio(fullSpectrum);ctx.run(30);
    const response=()=>{if(ctx.collection.diagnostics.asset.signals)return ctx.collection.diagnostics.asset.signals;let found;ctx.scene.traverse(object=>{if(object.material?.uniforms?.tdBass)found=object.material.uniforms;});return {bass:found.tdBass.value,mid:found.tdMid.value,treble:found.tdTreble.value};};
    const events=()=>{const d=ctx.collection.diagnostics.asset;return d.events??d.eventCount??d.onsets;};
    assert(response().bass>.1);const count=events();assert(count>0);ctx.audio(fullSpectrum,false,false);ctx.run(150);assert(response().bass<.00001);assert(response().mid<.00001);assert(response().treble<.00001);assert.equal(events(),count);
  }));
  check(`${world}: Low detail reduces actual scene work and returns to High without losing appearance`,()=>using(ctx=>{
    ctx.select(world);ctx.room.setLabSettings({...AETHER_DEFAULTS,form:'helix',spread:1.3});ctx.room.setQuality('high');ctx.step();const high=ctx.collection.diagnostics.asset;
    ctx.room.setQuality('low');ctx.step(40);const low=ctx.collection.diagnostics.asset;
    if(world==='tidal'){assert(low.waterTriangles<high.waterTriangles);assert(low.waveComponents<high.waveComponents);assert(low.noiseOctaves<high.noiseOctaves);}
    if(world==='monolith'){assert(low.instances<high.instances);assert(low.motes<high.motes);}
    if(world==='aether'){assert(low.count<high.count);assert(low.fieldCount<high.fieldCount);assert(low.riderCount<high.riderCount);assert(low.computeCadence>high.computeCadence);}
    assert.equal(low.settings.form,'helix');assert.equal(low.settings.spread,1.3);ctx.room.setQuality('high');ctx.step();assert.equal(ctx.collection.diagnostics.asset.quality,'high');
  }));
  check(`${world}: Journey stays bounded, pauses exactly and yields to a real OrbitControls wheel event`,()=>using(ctx=>{
    ctx.select(world);ctx.room.setQuality('high');ctx.step();const baseline=ctx.camera.position.clone();ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.room.setAutoOrbit(true);ctx.audio(fullSpectrum);ctx.run(400);
    assert.equal(ctx.controls.autoRotate,false);const displacement=ctx.camera.position.distanceTo(baseline);assert(displacement>.02);assert(displacement<2.1,'Journey left the authored local camera envelope');
    ctx.audio(silentSpectrum,false);ctx.run(10);const paused=pose(ctx);ctx.run(40);samePose(pose(ctx),paused);
    ctx.audio(fullSpectrum);ctx.renderer.domElement.listeners.get('wheel')({deltaY:-80,deltaMode:0,clientX:300,clientY:200,ctrlKey:false,preventDefault(){}});ctx.step();
    const manual=pose(ctx);ctx.run(90,50);samePose(pose(ctx),manual);ctx.run(25,50);const resumed=pose(ctx);assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...manual.slice(0,3)))>.01);
    ctx.room.setMotion(false);ctx.run(30);samePose(pose(ctx),resumed);ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:false});ctx.step();samePose(pose(ctx),manual);
    if(world!=='aether')assert.equal(ctx.controls.enableRotate,false);
  }));
}

check('Canvas boundary retains the actual touch capture listener before existing OrbitControls bubble listener',()=>using(ctx=>{
  const listeners=ctx.renderer.domElement.eventListeners.get('pointerdown');assert.equal(listeners.length,2);assert.equal(listeners[0].capture,false);assert.equal(listeners[1].capture,true);
  ctx.select('aether');ctx.room.setTouchEnabled(true);let starts=0;ctx.controls.addEventListener('start',()=>starts++);
  const down=ctx.pointer('pointerdown',750,175);assert.equal(down.defaultPrevented,true);assert.equal(down.propagationStopped,true);assert.equal(starts,0);assert.equal(ctx.controls._pointers.length,0);
  assert.equal(ctx.room.touchState.serial,1);assert.equal(ctx.room.touchState.x,.5);assert.equal(ctx.room.touchState.y,.5);assert(ctx.renderer.domElement.hasPointerCapture(1));
}));
for(const world of ['tidal','monolith','aether']){
  check(`${world}: a paused-world gesture reaches the real asset without inventing music`,()=>using(ctx=>{
    ctx.select(world);ctx.room.setQuality('high');ctx.room.setTouchEnabled(true);ctx.audio(silentSpectrum,false,false);ctx.pointer('pointerdown',700,140);ctx.run(20);
    const sent=ctx.last().touch;assert.equal(sent.active,true);assert.equal(sent.serial,1);assert(sent.strength>.99);near(sent.x,.4);near(sent.y,.6);
    assert.equal(ctx.last().active,false);assert.equal(ctx.last().onset,false);assert.equal(ctx.last().pulse,0);
    const received=ctx.collection.diagnostics.asset;if(world==='tidal'){assert.equal(received.touchCount,1);assert.equal(received.touchSerial,1);assert(received.touch[2]>.9);}else{assert.equal(received.touch.serial,1);assert(received.touch.strength>.8);}
    const snapshot={...sent};ctx.pointer('pointermove',100,560);ctx.run(15);assert.deepEqual(sent,snapshot,'Historical frame evidence must not alias the reused touch sample');assert(ctx.last().touch.x<-.7);assert(ctx.last().touch.y<-.5);
    ctx.pointer('pointerup',100,560);ctx.run(80);assert.equal(ctx.last().touch.active,false);assert(ctx.last().touch.strength<.001);assert.equal(ctx.last().touch.serial,1);
  }));
  check(`${world}: touching owns the camera over Journey and Auto orbit, with no competing control gesture`,()=>using(ctx=>{
    ctx.select(world);ctx.room.setQuality('high');ctx.room.setLabSettings({...AETHER_DEFAULTS,journey:true});ctx.room.setAutoOrbit(true);ctx.audio(fullSpectrum);ctx.run(50);
    ctx.room.setTouchEnabled(true);let starts=0;ctx.controls.addEventListener('start',()=>starts++);ctx.pointer('pointerdown');ctx.step();const held=pose(ctx);
    ctx.pointer('pointermove',800,100);ctx.run(180,50);samePose(pose(ctx),held);assert.equal(starts,0);assert.equal(ctx.controls.autoRotate,false);assert.equal(ctx.controls.enabled,false);
    ctx.pointer('pointerup',800,100);ctx.run(90,50);samePose(pose(ctx),held);ctx.run(30,50);assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...held.slice(0,3)))>.01);
  }));
  check(`${world}: Motion off cancels the held pointer, freezes the asset and resumes without reviving a contact`,()=>using(ctx=>{
    ctx.select(world);ctx.room.setQuality('high');ctx.room.setTouchEnabled(true);ctx.pointer('pointerdown',750,175);ctx.run(20);ctx.room.setMotion(false);ctx.step();
    assert.equal(ctx.room.touchState.requested,true);assert.equal(ctx.room.touchState.enabled,false);assert.equal(ctx.room.touchState.active,false);assert.equal(ctx.renderer.domElement.captures.size,0);assert.equal(ctx.last().touch.strength,0);
    const before=JSON.stringify(ctx.collection.diagnostics.asset);ctx.run(30);assert.equal(JSON.stringify(ctx.collection.diagnostics.asset),before);
    ctx.room.setMotion(true);ctx.step();assert.equal(ctx.last().touch.active,false);assert.equal(ctx.last().touch.strength,0);assert.equal(ctx.last().touch.serial,1);
    ctx.pointer('pointerdown',200,500);ctx.step();assert.equal(ctx.last().touch.active,true);assert.equal(ctx.last().touch.serial,2);
  }));
}
check('Touch mode returns actual mouse drag and wheel navigation to OrbitControls when disabled',()=>using(ctx=>{
  ctx.select('aether');ctx.room.setQuality('high');ctx.room.setTouchEnabled(true);ctx.pointer('pointerdown',500,350);ctx.step();ctx.room.setTouchEnabled(false);ctx.step();assert.equal(ctx.room.touchState.active,false);assert.equal(ctx.controls.enabled,true);
  const before=pose(ctx),serial=ctx.room.touchState.serial;let starts=0;ctx.controls.addEventListener('start',()=>starts++);
  assert.equal(ctx.pointer('pointerdown',500,350).propagationStopped,undefined);ctx.pointer('pointermove',760,380);ctx.pointer('pointerup',760,380);ctx.run(30);
  assert(starts>0);assert(ctx.camera.position.distanceTo(new REAL_THREE.Vector3(...before.slice(0,3)))>.1);assert.equal(ctx.room.touchState.serial,serial);
  const distance=ctx.distance();ctx.renderer.domElement.dispatch('wheel',{deltaY:-100,deltaMode:0,clientX:500,clientY:350,ctrlKey:false});assert(ctx.distance()<distance);
}));
check('A second pointer never steals ownership, alters the serial, or ends the primary world gesture',()=>using(ctx=>{
  ctx.select('tidal');ctx.room.setTouchEnabled(true);ctx.pointer('pointerdown',600,250,{pointerType:'touch'});ctx.step();
  ctx.pointer('pointerdown',200,500,{pointerId:2,pointerType:'touch',isPrimary:false});ctx.pointer('pointermove',100,650,{pointerId:2,pointerType:'touch',isPrimary:false});ctx.pointer('pointerup',100,650,{pointerId:2,pointerType:'touch',isPrimary:false});ctx.step();
  assert.equal(ctx.room.touchState.serial,1);assert.equal(ctx.room.touchState.active,true);assert(ctx.renderer.domElement.hasPointerCapture(1));assert.equal(ctx.controls._pointers.length,0);near(ctx.last().touch.x,.2);near(ctx.last().touch.y,2/7);
  ctx.pointer('pointercancel',600,250,{pointerType:'touch'});ctx.step();assert.equal(ctx.room.touchState.active,false);assert.equal(ctx.renderer.domElement.captures.size,0);
}));
check('Scene handoff releases contact and sends neutral touch before another world receives a new gesture',()=>using(ctx=>{
  ctx.select('tidal');ctx.room.setQuality('high');ctx.room.setTouchEnabled(true);ctx.pointer('pointerdown');ctx.run(10);ctx.room.setModel('monolith');ctx.step();
  assert.equal(ctx.collection.diagnostics.selected,'monolith');assert.equal(ctx.room.touchState.requested,true);assert.equal(ctx.room.touchState.enabled,true);assert.equal(ctx.last().touch.active,false);assert.equal(ctx.last().touch.strength,0);assert.equal(ctx.renderer.domElement.captures.size,0);
  ctx.pointer('pointermove',200,200);ctx.step();assert.equal(ctx.last().touch.active,false);ctx.pointer('pointerdown',200,200);ctx.step();assert.equal(ctx.last().touch.serial,2);
  ctx.room.setModel('record');ctx.step();assert.equal(ctx.room.touchState.available,false);assert.equal(ctx.controls.enabled,true);assert.equal(ctx.renderer.domElement.classes.has('world-touch-enabled'),false);
  const serial=ctx.room.touchState.serial;let starts=0;ctx.controls.addEventListener('start',()=>starts++);ctx.pointer('pointerdown');ctx.pointer('pointermove',700,380);ctx.pointer('pointerup',700,380);ctx.step();assert(starts>0);assert.equal(ctx.room.touchState.serial,serial);
}));
check('Global blur and pagehide release world capture without creating extra touch or musical events',()=>using(ctx=>{
  ctx.select('tidal');ctx.room.setTouchEnabled(true);ctx.pointer('pointerdown');ctx.step();ctx.rootEvents.dispatch('blur');ctx.step();assert.equal(ctx.room.touchState.active,false);assert.equal(ctx.renderer.domElement.captures.size,0);assert.equal(ctx.last().touch.serial,1);
  ctx.pointer('pointerdown');ctx.step();ctx.rootEvents.dispatch('pagehide');ctx.step();assert.equal(ctx.room.touchState.active,false);assert.equal(ctx.renderer.domElement.captures.size,0);assert.equal(ctx.last().touch.serial,2);assert.equal(ctx.last().onset,false);
}));
check('Host disposal releases a held touch and removes actual touch/control event ownership',()=>{
  const ctx=harness();ctx.select('aether');ctx.room.setTouchEnabled(true);ctx.pointer('pointerdown');ctx.step();const serial=ctx.room.touchState.serial;ctx.close();
  assert.equal(ctx.renderer.domElement.captures.size,0);assert.equal(ctx.room.touchState.active,false);assert.equal(ctx.room.touchState.enabled,false);
  for(const name of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])assert.equal(ctx.renderer.domElement.eventListeners.has(name),false,name);
  for(const name of ['blur','pagehide'])assert.equal(ctx.rootEvents.eventListeners.has(name),false,name);
  ctx.pointer('pointerdown');assert.equal(ctx.room.touchState.serial,serial);
});

await checkAsync('captureFrame waits for the next compositor render and encodes the actual renderer canvas as PNG',async()=>{
  const ctx=harness();try{
    const render=ctx.composer.renders,promise=ctx.room.captureFrame();assert.equal(ctx.captureCalls.length,0);assert.equal(ctx.timers.size,1);
    ctx.step();const blob=await promise;assert(blob instanceof Blob);assert.equal(blob.type,'image/png');
    assert.equal(ctx.captureCalls.length,1);assert(ctx.captureCalls[0].render>render);assert.equal(ctx.captureCalls[0].type,'image/png');
    assert.deepEqual(ctx.order.slice(-2),['render','toBlob']);assert.equal(ctx.timers.size,0);
  }finally{ctx.close();}
});
await checkAsync('Null PNG encoder output and synchronous encoder errors reject honestly',async()=>{
  for(const failure of ['null','throw']){const ctx=harness();try{
    ctx.nullBlob=failure==='null';if(failure==='throw')ctx.blobError=new Error('encoder boundary failure');
    const promise=ctx.room.captureFrame(),rejected=assert.rejects(promise,failure==='null'?/could not save/:/encoder boundary/);ctx.step();await rejected;assert.equal(ctx.timers.size,0);
  }finally{ctx.close();}}
});
await checkAsync('Hidden-page capture times out without rendering or returning a fabricated image',async()=>{
  const ctx=harness();try{
    const promise=ctx.room.captureFrame(),rejected=assert.rejects(promise,/Keep the player visible/);globalThis.document.hidden=true;ctx.step();assert.equal(ctx.captureCalls.length,0);
    const timer=[...ctx.timers.values()][0];assert.equal(timer.delay,6000);timer.fn();await rejected;assert.equal(ctx.captureCalls.length,0);
  }finally{ctx.close();}
});
await checkAsync('Disposal rejects queued captures and new requests; a lost context rejects new captures',async()=>{
  const ctx=harness();const queued=assert.rejects(ctx.room.captureFrame(),/closed before capture/);ctx.close();await queued;await assert.rejects(ctx.room.captureFrame(),/not ready/);assert.equal(ctx.timers.size,0);
  const lost=harness();try{lost.renderer.domElement.listeners.get('webglcontextlost')({preventDefault(){}});await assert.rejects(lost.room.captureFrame(),/not ready/);assert.equal(lost.errors.length,1);}finally{lost.close();}
});
await checkAsync('Disposal also rejects a capture already awaiting the asynchronous PNG callback',async()=>{
  const ctx=harness();ctx.delayBlob=true;let result='pending';
  const promise=ctx.room.captureFrame().then(()=>{result='resolved';},()=>{result='rejected';});ctx.step();assert.equal(ctx.blobCallbacks.length,1);ctx.close();await Promise.resolve();
  try{assert.equal(result,'rejected','Capture remained pending after the host closed during PNG encoding');}
  finally{ctx.blobCallbacks[0](new Blob(['boundary pixels'],{type:'image/png'}));await promise;}
});
await checkAsync('Capture timeout remains active while an asynchronous encoder callback is outstanding',async()=>{
  const ctx=harness();ctx.delayBlob=true;let result='pending';
  const promise=ctx.room.captureFrame().then(()=>{result='resolved';},()=>{result='rejected';});ctx.step();
  try{
    assert.equal(ctx.timers.size,1,'Encoder wait lost its timeout before the callback settled');
    const timer=[...ctx.timers.values()][0];assert.equal(timer.delay,6000);timer.fn();await Promise.resolve();assert.equal(result,'rejected');
  }finally{ctx.blobCallbacks[0](new Blob(['boundary pixels'],{type:'image/png'}));await promise;ctx.close();}
});
await checkAsync('An outstanding encoder request is captured once across subsequent live frames',async()=>{
  const ctx=harness();ctx.delayBlob=true;
  try{
    const promise=ctx.room.captureFrame();ctx.step();ctx.run(8);assert.equal(ctx.captureCalls.length,1);assert.equal(ctx.blobCallbacks.length,1);assert.equal(ctx.timers.size,1);
    ctx.blobCallbacks[0](new Blob(['boundary pixels'],{type:'image/png'}));await promise;assert.equal(ctx.timers.size,0);ctx.run(3);assert.equal(ctx.captureCalls.length,1);
  }finally{ctx.close();}
});

console.log(JSON.stringify({scope:'Unchanged current production host function; real bundled Three scene/geometry/material/camera/Reflector and OrbitControls math, actual collection/assets/features/settings and optics ShaderPass. Renderer, composer execution, DOM event surfaces and PNG encoder are explicit boundaries. No GPU, screenshot, visual or audible playback claim.',threeRevision:REAL_THREE.REVISION,hostSHA256:sourceHash,passed:results.length,failed:failures.length,results,failures},null,2));
if(failures.length)process.exitCode=1;

