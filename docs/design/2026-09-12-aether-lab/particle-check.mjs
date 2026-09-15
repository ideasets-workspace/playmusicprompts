// Behavioral/protocol verification against the actual asset and pinned Three.
// The renderer double verifies state ownership, not GPU shader compilation.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import * as THREE from '../../../website_html_templates_lab/vendor/three/build/three.module.js';
const assetModule=process.argv[2]?pathToFileURL(process.argv[2]).href:new URL('./lab-aether.js',import.meta.url).href;
const {createAetherAsset}=await import(assetModule);
let passed=0;
function check(name,fn){fn();passed++;console.log(`PASS ${name}`);}
const frame={dt:1/60,active:true,motion:true,bass:.8,mid:.55,treble:.4,energy:.3,spectrum:new Float32Array(64).fill(.4)};
const asset=createAetherAsset(THREE), material=asset.group.children[0].material;
check('The host receives an inside-environment view without object fitting',()=>{
  assert.equal(asset.view.aspectFit,false);
  assert.deepEqual(asset.view.target,[0,2.75,-5]);
  const camera=new THREE.Vector3().fromArray(asset.view.direction).normalize().multiplyScalar(asset.view.distance).add(new THREE.Vector3().fromArray(asset.view.target));
  assert.ok(camera.z>2.8&&camera.z<3.2);assert.ok(camera.y>2.75&&camera.y<3.2);
  assert.ok(asset.view.minDistance<asset.view.distance&&asset.view.maxDistance>asset.view.distance);
  for(const object of asset.group.children)assert.equal(object.frustumCulled,false);
});
check('Unsupported device honestly selects analytical rendering',()=>{
  assert.equal(asset.diagnostics().mode,'analytical-shader');assert.match(asset.diagnostics().fallbackReason,/renderer/);
  assert.equal(material.uniforms.aGpu.value,0);
});
check('Initial authored topology is finite, coherent and bounded',()=>{
  assert.equal(asset.group.children.length,4);
  for(const object of asset.group.children){
    const uv=object.geometry.attributes.aLookup.array;
    assert.ok(uv.every(n=>Number.isFinite(n)&&n>0&&n<1));
  }
  const uv=asset.group.children[0].geometry.attributes.aLookup.array;
  for(let i=0;i<uv.length;i+=4){assert.equal(uv[i+1],uv[i+3]);assert.ok(uv[i+2]>uv[i]);}
});
check('Depth field and riders use fixed, finite, spatially varied seeds',()=>{
  const [, , field,riders]=asset.group.children;
  assert.equal(field.geometry.attributes.aLookup.count,4096);assert.equal(riders.geometry.attributes.aLookup.count,768);
  for(const object of [field,riders]) {
    const data=object.geometry.attributes.aDetail.array;
    assert.ok(data.every(n=>Number.isFinite(n)&&n>=0&&n<=1));
    assert.ok(Math.min(...data)<.01&&Math.max(...data)>.99);
    assert.equal(new Set([...object.geometry.attributes.aLookup.array].filter((_,i)=>i%2)).size,256);
    assert.equal(object.material.uniforms,material.uniforms);
  }
});
asset.update(frame);
check('Actual active bands feed retained visual signals and spectrum',()=>{
  const d=asset.diagnostics();assert.ok(d.signals.bass>0&&d.signals.bass<.8);
  assert.equal(material.uniforms.aSpectrum.value[24],Math.fround(.4));assert.ok(d.phase>0);
});
check('Form transition is continuous, with normalized nonnegative weights',()=>{
  asset.update({...frame,labLook:{form:'nova'}});
  const w=asset.diagnostics().weights;assert.ok(w[0]>0&&w[1]>0&&w[1]<1);assert.equal(w[2],0);
  assert.ok(Math.abs(w.reduce((a,b)=>a+b)-1)<1e-12);
});
check('Motion off freezes an in-progress morph and all automatic clocks/signals',()=>{
  const before=asset.diagnostics(), rotation=asset.group.rotation.toArray();
  for(let i=0;i<12;i++)asset.update({...frame,motion:false,onset:true,dt:100,labLook:{form:'nova'}});
  const after=asset.diagnostics();assert.equal(after.phase,before.phase);assert.equal(after.clock,before.clock);
  assert.deepEqual(after.weights,before.weights);assert.deepEqual(after.signals,before.signals);assert.deepEqual(asset.group.rotation.toArray(),rotation);
  assert.equal(after.events,before.events);
});
check('Explicit frozen form and spatial edits apply at the retained time',()=>{
  const phase=asset.diagnostics().phase;
  asset.update({...frame,motion:false,labLook:{form:'helix',spread:1.4,depth:.2,turbulence:1.1}});
  assert.deepEqual(asset.diagnostics().weights,[0,0,1]);assert.equal(asset.diagnostics().phase,phase);
  assert.equal(material.uniforms.aSpread.value,1.4);assert.equal(material.uniforms.aDepth.value,.2);
});
check('Onsets require actual active playback and enabled pulse response',()=>{
  const old=asset.diagnostics().events;
  asset.update({...frame,active:false,onset:true});asset.update({...frame,onset:true,look:{pulseGain:0}});
  assert.equal(asset.diagnostics().events,old);
  asset.update({...frame,onset:true,pulse:.8});assert.equal(asset.diagnostics().events,old+1);
});
check('Paused playback releases audio envelopes without invented new events',()=>{
  for(let i=0;i<120;i++)asset.update({...frame,active:false,onset:false});
  assert.ok(asset.diagnostics().signals.bass<.0001);assert.ok(material.uniforms.aSpectrum.value.every(x=>x===0));
});
check('Low detail reduces real geometry draw counts and distributes all bundles',()=>{
  asset.update({...frame,quality:'low'});assert.equal(asset.diagnostics().count,16384);assert.equal(asset.diagnostics().strands,64);
  assert.equal(asset.diagnostics().fieldCount,1024);assert.equal(asset.diagnostics().riderCount,192);
  const uv=asset.group.children[1].geometry.attributes.aLookup.array;
  const rows=new Set();for(let i=0;i<16384;i+=256)rows.add(Math.floor(uv[i*2+1]*256));
  assert.ok([...rows].some(n=>n<32));assert.ok([...rows].some(n=>n>223));
});
check('Particle density zero removes all structured, suspended and rider draws',()=>{
  asset.update({...frame,look:{particles:0}});assert.equal(asset.diagnostics().count,0);assert.equal(asset.diagnostics().lineSegments,0);
  assert.ok(asset.group.children.every(o=>o.geometry.drawRange.count===0));
});
check('Quality and density reductions also apply to both new detail layers',()=>{
  asset.update({...frame,quality:'high',look:{particles:.5}});
  assert.equal(asset.diagnostics().fieldCount,2048);assert.equal(asset.diagnostics().riderCount,384);
  asset.update({...frame,quality:'low',look:{particles:.5}});
  assert.equal(asset.diagnostics().fieldCount,512);assert.equal(asset.diagnostics().riderCount,96);
});
check('Detail attributes stay immutable while the shared audio and time change',()=>{
  const fields=asset.group.children.slice(2).map(o=>Object.entries(o.geometry.attributes).map(([name,a])=>({name,attribute:a,version:a.version,array:a.array,values:a.array.slice()})));
  asset.update({...frame,onset:true,pulse:1.5,dt:.12});
  for(const object of asset.group.children.slice(2)) {
    assert.equal(object.material.uniforms.aEvents.value,material.uniforms.aEvents.value);
    assert.equal(object.material.uniforms.aTreble.value,material.uniforms.aTreble.value);
  }
  for(const attributes of fields)for(const entry of attributes){assert.equal(entry.attribute.array,entry.array);assert.equal(entry.attribute.version,entry.version);assert.deepEqual(entry.array,entry.values);}
});
check('Lab and global glow multiply, all numeric settings reject NaN and clamp',()=>{
  asset.update({...frame,labLook:{form:'invalid',glow:1.5,spread:20,turbulence:NaN,flow:-9,focus:9,depth:NaN},look:{particleGlow:1.7}});
  const s=asset.diagnostics().settings;assert.equal(s.form,'silk');assert.equal(s.spread,1.5);assert.equal(s.turbulence,.6);
  assert.equal(s.flow,0);assert.equal(s.focus,1);assert.equal(s.depth,.65);assert.equal(material.uniforms.aGlow.value,2.55);
});
check('Ambient flow zero stops transport phase, dt is bounded',()=>{
  const p=asset.diagnostics().phase,c=asset.diagnostics().clock;
  asset.update({...frame,dt:1000,labLook:{flow:0}});assert.equal(asset.diagnostics().phase,p);assert.equal(asset.diagnostics().clock-c,.125);
});
check('Palette follows the actual world colors',()=>{
  asset.setPalette({light:0xff0000,rim:0x00ff00,tint:0x0000ff});
  assert.equal(material.uniforms.aPrimary.value.getHex(),0xff0000);assert.equal(material.uniforms.aSecondary.value.getHex(),0x00ff00);
});

function rendererDouble({complete=true,throwRender=false}={}){
  const initialTarget=new THREE.WebGLRenderTarget(200,100);
  initialTarget.viewport.set(4,5,90,80);initialTarget.scissor.set(2,3,75,70);initialTarget.scissorTest=true;
  const state={target:initialTarget,face:2,mip:1,viewport:new THREE.Vector4(7,9,85,76),scissor:new THREE.Vector4(8,10,70,65),test:true,renders:0,targets:new Set()};
  const gl={SCISSOR_BOX:1,SCISSOR_TEST:2,FRAMEBUFFER:3,FRAMEBUFFER_COMPLETE:4,
    getParameter:()=>state.scissor.toArray(),isEnabled:()=>state.test,checkFramebufferStatus:()=>complete?4:0};
  const renderer={isWebGLRenderer:true,capabilities:{maxVertexTextures:16},extensions:{has:()=>true},xr:{enabled:true},autoClear:false,
    getContext:()=>gl,getRenderTarget:()=>state.target,getActiveCubeFace:()=>state.face,getActiveMipmapLevel:()=>state.mip,
    getCurrentViewport:v=>v.copy(state.viewport),getDrawingBufferSize:v=>v.set(1400,900),
    setRenderTarget(target,face=0,mip=0){state.target=target;state.face=face;state.mip=mip;if(target){state.targets.add(target);state.viewport.copy(target.viewport);state.scissor.copy(target.scissor);state.test=target.scissorTest;}},
    render(scene,camera){assert.equal(renderer.xr.enabled,false);assert.equal(renderer.autoClear,true);assert.ok(scene.isScene&&camera.isCamera);state.renders++;if(throwRender)throw new Error('diagnostic render rejection');}
  };
  return {renderer,state,initialTarget};
}
const testRenderer=rendererDouble();const gpu=createAetherAsset(THREE,{renderer:testRenderer.renderer});
check('Half-float path checks actual framebuffer completeness',()=>{
  assert.equal(gpu.diagnostics().mode,'gpu-half-float');assert.equal(testRenderer.state.targets.size,3);
});
function assertRestored(){
  const {renderer:r,state:s,initialTarget:t}=testRenderer;
  assert.equal(s.target,t);assert.equal(s.face,2);assert.equal(s.mip,1);assert.equal(r.xr.enabled,true);assert.equal(r.autoClear,false);
  assert.deepEqual(s.viewport.toArray(),[7,9,85,76]);assert.deepEqual(s.scissor.toArray(),[8,10,70,65]);assert.equal(s.test,true);
  assert.deepEqual(t.viewport.toArray(),[4,5,90,80]);assert.deepEqual(t.scissor.toArray(),[2,3,75,70]);assert.equal(t.scissorTest,true);
}
check('Capability probing restores target, cube/mipmap, XR, viewport and scissor exactly',assertRestored);
check('GPU update ping-pongs real target references and restores renderer state',()=>{
  gpu.update(frame);const first=gpu.group.children[0].material.uniforms.aPositions.value;
  gpu.update(frame);const second=gpu.group.children[0].material.uniforms.aPositions.value;
  assert.notEqual(first,second);assert.equal(gpu.group.children[0].material.uniforms.aPrevious.value,first);
  assert.equal(gpu.diagnostics().updates,2);assertRestored();
  for(const object of gpu.group.children.slice(2))assert.equal(object.material.uniforms.aPositions.value,second);
});
check('Small-preview hairline coverage responds to the actual drawing buffer',()=>{
  testRenderer.renderer.getDrawingBufferSize=v=>v.set(480,173);
  gpu.update(frame);assert.equal(gpu.diagnostics().lineCoverage,173/620);
  testRenderer.renderer.getDrawingBufferSize=v=>v.set(1280,425);
  gpu.update(frame);assert.equal(gpu.diagnostics().lineCoverage,425/620);
  testRenderer.renderer.getDrawingBufferSize=v=>v.set(1400,900);
  gpu.update(frame);assert.equal(gpu.diagnostics().lineCoverage,1);
});
check('Low quality actually lowers compute cadence to one pass per three calls',()=>{
  const count=gpu.diagnostics().updates;
  for(let i=0;i<9;i++)gpu.update({...frame,quality:'low'});
  assert.equal(gpu.diagnostics().updates-count,3);
});
check('Frozen GPU performs no simulation passes except an explicit spatial edit',()=>{
  gpu.update({...frame,motion:false});const count=gpu.diagnostics().updates;
  for(let i=0;i<6;i++)gpu.update({...frame,motion:false});assert.equal(gpu.diagnostics().updates,count);
  gpu.update({...frame,motion:false,labLook:{form:'helix'}});assert.equal(gpu.diagnostics().updates,count+1);
  assert.equal(gpu.group.children[0].material.uniforms.aDt.value,0);assert.equal(gpu.group.children[0].material.uniforms.aReset.value,1);
});
check('Framebuffer failure selects a truthful fallback without losing renderer state',()=>{
  const r=rendererDouble({complete:false}),a=createAetherAsset(THREE,{renderer:r.renderer});
  assert.equal(a.diagnostics().mode,'analytical-shader');assert.match(a.diagnostics().fallbackReason,/not renderable/);
  assert.equal(r.state.target,r.initialTarget);assert.equal(r.renderer.xr.enabled,true);a.dispose();r.initialTarget.dispose();
});
check('Render exception selects analytical fallback and restores host state',()=>{
  const r=rendererDouble({throwRender:true}),a=createAetherAsset(THREE,{renderer:r.renderer});a.update(frame);
  assert.equal(a.diagnostics().mode,'analytical-shader');assert.match(a.diagnostics().fallbackReason,/diagnostic render rejection/);
  assert.equal(r.state.target,r.initialTarget);assert.equal(r.renderer.xr.enabled,true);assert.equal(r.renderer.autoClear,false);a.dispose();r.initialTarget.dispose();
});
check('Disposal releases actual Three resources once and stops future work',()=>{
  const disposed=new Map();const track=o=>{disposed.set(o,0);o.addEventListener('dispose',()=>disposed.set(o,disposed.get(o)+1));};
  for(const object of gpu.group.children){track(object.geometry);track(object.material);}
  for(const target of testRenderer.state.targets)if(target!==testRenderer.initialTarget)track(target);
  const before=gpu.diagnostics().updates;gpu.dispose();gpu.dispose();gpu.update(frame);
  assert.equal(gpu.diagnostics().disposed,true);assert.equal(gpu.group.children.length,0);assert.equal(gpu.diagnostics().updates,before);
  assert.ok([...disposed.values()].every(n=>n===1));
});
asset.dispose();testRenderer.initialTarget.dispose();
console.log(JSON.stringify({checks:passed,scope:'actual asset behavior, real Three resources and renderer protocol; GPU pixels require browser verification'}));
