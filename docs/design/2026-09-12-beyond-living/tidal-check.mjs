import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from '../../../website_html_templates_beyond/vendor/three/build/three.module.js';
const url=process.argv[2]?pathToFileURL(process.argv[2]):new URL('lab-tidal.js',import.meta.url);
const {createTidalAsset}=await import(url.href), source=fs.readFileSync(url,'utf8');
const checks=[], check=(name,fn)=>{fn();checks.push(name);};
const asset=createTidalAsset(THREE), [sky,water]=asset.group.children, u=water.material.uniforms;
const base={dt:1/60,motion:true,active:true,bass:.8,mid:.6,treble:.4,energy:.5,labLook:{},look:{},quality:'high'};
check('Pinned Three constructs a full ocean and inside sky, without renderer, loader or timer ownership',()=>{
  assert.ok(asset.group instanceof THREE.Group);assert.equal(asset.group.children.length,5);
  assert.equal(sky.material.side,THREE.BackSide);assert.equal(sky.material.depthWrite,false);
  assert.equal(water.material.side,THREE.FrontSide);assert.equal(water.geometry.attributes.position.count,193*193);
  assert.equal(sky.material.uniforms,water.material.uniforms);
  assert.doesNotMatch(source,/new THREE\.(WebGLRenderer|Audio|TextureLoader)|requestAnimationFrame|setInterval|setTimeout|fetch\(/);
});
check('Three separate depth layers are real finite indexed coastal meshes with usable face normals',()=>{
  const coast=asset.group.children.slice(2);assert.equal(coast.length,3);
  for(const mesh of coast){
    assert.equal(mesh.geometry.attributes.position.count,65*21);assert.ok(mesh.geometry.index.count>7000);
    assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));
    assert.ok([...mesh.geometry.attributes.normal.array].every(Number.isFinite));
    mesh.geometry.computeBoundingBox();assert.ok(mesh.geometry.boundingBox.max.y>1.8);
    assert.ok(mesh.geometry.boundingBox.min.y<-1.35);assert.ok(mesh.geometry.boundingBox.max.z<0);
  }
  assert.notEqual(coast[0].geometry.boundingBox.min.z,coast[1].geometry.boundingBox.min.z);
});
check('Composed camera remains above the maximum analytic crest throughout allowed dolly range',()=>{
  assert.equal(asset.view.aspectFit,false);assert.equal(asset.view.orbit,false);
  const direction=new THREE.Vector3().fromArray(asset.view.direction).normalize();
  for(const distance of [asset.view.minDistance,asset.view.distance,asset.view.maxDistance]) {
    const y=asset.view.target[1]-2.75+direction.y*distance;
    assert.ok(y>-1.35+.92+.25);
  }
  assert.equal(water.geometry.parameters.width,128);assert.equal(sky.geometry.parameters.radius,68);
  assert.match(source,/s\.yz\*=1\.-bounded\*bounded;s\.x=bounded\*\.92/);
});
check('Local camera uniform respects the host group translation and complete parent transform',()=>{
  const scene=new THREE.Scene(), parent=new THREE.Group(), camera=new THREE.PerspectiveCamera(38,1.6,.1,100);
  parent.position.set(2,1,-3);parent.rotation.set(.02,.1,.01);parent.scale.set(.9,1.2,1.1);
  asset.group.position.y=2.75;parent.add(asset.group);scene.add(parent);camera.position.set(0,4,12);
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);water.onBeforeRender({},scene,camera);
  assert.ok(u.tdCamera.value.clone().applyMatrix4(asset.group.matrixWorld).distanceTo(camera.position)<1e-10);
  parent.remove(asset.group);asset.group.position.set(0,0,0);asset.group.updateMatrixWorld(true);
});
check('Audio uniforms respond to actual gated bands and decay after playback stops',()=>{
  for(let i=0;i<60;i++)asset.update(base);
  assert.ok(u.tdBass.value>.79);assert.ok(u.tdMid.value>.59);assert.ok(u.tdTreble.value>.39);
  const before=u.tdBass.value;
  for(let i=0;i<60;i++)asset.update({...base,active:false});
  assert.ok(u.tdBass.value<before*.005);
});
check('Onsets create bounded ring slots only while the actual track is active',()=>{
  for(let i=0;i<70;i++)asset.update({...base,onset:i%10===0,pulse:.85});
  const d=asset.diagnostics();assert.equal(d.eventCount,7);assert.equal(u.tdEvents.value.length,6);
  assert.equal(u.tdPowers.value.length,6);assert.ok([...u.tdPowers.value].every(v=>Math.abs(v-.85)<1e-6));
  for(let i=0;i<20;i++)asset.update({...base,onset:true,active:false});assert.equal(asset.diagnostics().eventCount,d.eventCount);
  for(let i=0;i<20;i++)asset.update({...base,onset:true,look:{pulseGain:0}});assert.equal(asset.diagnostics().eventCount,d.eventCount);
});
check('Pointer serials create their own bounded water fronts while paused without inventing audio events',()=>{
  const audioEvents=asset.diagnostics().eventCount;
  asset.update({...base,active:false,touch:{x:.4,y:-.5,strength:.7,active:true,serial:1}});
  assert.equal(asset.diagnostics().touchCount,1);assert.equal(asset.diagnostics().eventCount,audioEvents);
  assert.deepEqual(u.tdTouch.value.toArray(),[.4*(4+.5*5.5),-8,.7]);
  for(let i=0;i<30;i++)asset.update({...base,active:false,touch:{x:.4,y:-.5,strength:.7,active:true,serial:1}});
  assert.equal(asset.diagnostics().touchCount,1);assert.equal(u.tdTouchRings.value.length,4);
  for(let serial=2;serial<=9;serial++)asset.update({...base,active:false,touch:{x:-.5,y:.3,strength:.8,active:true,serial}});
  assert.equal(asset.diagnostics().touchCount,9);assert.equal(u.tdTouchRings.value.length,4);
  assert.equal(asset.diagnostics().eventCount,audioEvents);
});
check('Released strength follows host decay; missing touch is neutral and stale serials cannot replay',()=>{
  const count=asset.diagnostics().touchCount;
  asset.update({...base,touch:{x:.1,y:-.1,strength:.25,active:false,serial:9}});
  assert.equal(u.tdTouch.value.z,.25);assert.equal(asset.diagnostics().touchCount,count);
  asset.update({...base,touch:{x:.1,y:-.1,strength:1,active:true,serial:3}});
  assert.equal(asset.diagnostics().touchCount,count);
  asset.update(base);assert.equal(u.tdTouch.value.z,0);assert.equal(asset.diagnostics().touchCount,count);
});
check('Motion off retains the complete touch and ripple state without a reset jump or delayed synthetic onset',()=>{
  asset.update({...base,touch:{x:.2,y:-.4,strength:.65,active:true,serial:10}});
  const before=asset.diagnostics(),rings=u.tdTouchRings.value.map(v=>v.toArray());
  for(let i=0;i<40;i++)asset.update({...base,motion:false,touch:{x:-1,y:1,strength:1,active:true,serial:11}});
  assert.deepEqual(asset.diagnostics().touch,before.touch);assert.equal(asset.diagnostics().touchCount,before.touchCount);
  assert.equal(asset.diagnostics().clock,before.clock);assert.equal(asset.diagnostics().touchSerial,10);
  assert.deepEqual(u.tdTouchRings.value.map(v=>v.toArray()),rings);
  asset.update({...base,touch:{x:-1,y:1,strength:0,active:false,serial:11}});
  assert.equal(asset.diagnostics().touchCount,before.touchCount);
});
check('Malformed touch coordinates, strength and serial cannot enter shader storage',()=>{
  const count=asset.diagnostics().touchCount;
  asset.update({...base,touch:{x:Infinity,y:NaN,strength:-4,active:true,serial:Infinity}});
  assert.deepEqual(u.tdTouch.value.toArray(),[0,-14,0]);assert.equal(asset.diagnostics().touchCount,count);
  asset.update({...base,touch:{x:99,y:-99,strength:4,active:true,serial:12}});
  assert.deepEqual(u.tdTouch.value.toArray(),[4,-2,1]);
  assert.ok(u.tdTouchRings.value.flatMap(v=>v.toArray()).every(Number.isFinite));
});
check('Motion off freezes a partial form transition, shader clocks, event ages and all audio response',()=>{
  for(let i=0;i<12;i++)asset.update({...base,labLook:{form:'nova'}});
  const before=asset.diagnostics(), signals=[u.tdBass.value,u.tdMid.value,u.tdTreble.value,u.tdEnergy.value], events=[...u.tdEvents.value];
  assert.ok(before.formWeights[0]>0&&before.formWeights[1]>0);
  for(let i=0;i<50;i++)asset.update({...base,motion:false,onset:true,bass:2,labLook:{form:'nova'}});
  const after=asset.diagnostics();for(const k of ['phase','clock','updates','eventCount'])assert.equal(after[k],before[k]);
  assert.deepEqual(after.formWeights,before.formWeights);assert.deepEqual([...u.tdEvents.value],events);
  assert.deepEqual([u.tdBass.value,u.tdMid.value,u.tdTreble.value,u.tdEnergy.value],signals);
});
check('Explicit controls still work while frozen and a static form edit applies without advancing time',()=>{
  const before=asset.diagnostics();
  asset.update({...base,motion:false,labLook:{form:'helix',spread:1.4,turbulence:1.2,glow:1.5,depth:.9,focus:.8}});
  const after=asset.diagnostics();assert.equal(after.phase,before.phase);assert.equal(after.clock,before.clock);
  assert.deepEqual(after.formWeights,[0,0,1]);assert.equal(u.tdSpread.value,1.4);assert.equal(u.tdTurbulence.value,1.2);
  assert.equal(u.tdGlow.value,1.5);assert.equal(u.tdDepth.value,.9);assert.equal(u.tdFocus.value,.8);
});
check('Zero flow holds the current advection phase while the independent real onset clock can advance',()=>{
  const before=asset.diagnostics();asset.update({...base,labLook:{flow:0}});const after=asset.diagnostics();
  assert.equal(after.phase,before.phase);assert.ok(after.clock>before.clock);
});
check('Low quality reduces real triangles, wave components and noise octaves without resources per update',()=>{
  const highGeometry=water.geometry,highMaterial=water.material;asset.update({...base,quality:'low'});
  assert.notEqual(water.geometry,highGeometry);assert.notEqual(water.material,highMaterial);
  assert.equal(water.geometry.attributes.position.count,81*81);
  assert.equal(water.material.defines.TD_WAVES,5);assert.equal(water.material.defines.TD_NOISE,2);assert.equal(water.material.defines.TD_MICRO,2);
  assert.equal(water.material.defines.TD_CURRENT_LAYERS,1);assert.equal(water.material.defines.TD_COAST_STEPS,3);
  assert.equal(asset.diagnostics().coastVertices,3*33*11);assert.equal(asset.diagnostics().currentLayers,1);
  for(const mesh of asset.group.children.slice(2))assert.equal(mesh.geometry.attributes.position.count,33*11);
  assert.equal(sky.material.defines.TD_NOISE,2);assert.ok(asset.diagnostics().waterTriangles<25000);
  const lowGeometry=water.geometry,lowMaterial=water.material;for(let i=0;i<100;i++)asset.update({...base,quality:'low'});
  assert.equal(water.geometry,lowGeometry);assert.equal(water.material,lowMaterial);
  asset.update(base);assert.equal(water.geometry,highGeometry);assert.equal(water.material,highMaterial);
});
check('Nonfinite and out-of-range input cannot enter shader scalars or event powers',()=>{
  asset.update({...base,dt:Infinity,bass:NaN,mid:Infinity,treble:-1,energy:'x',onset:true,pulse:Infinity,
    look:{particles:NaN,particleGlow:Infinity},labLook:{form:'bad',flow:NaN,spread:Infinity,turbulence:-100,glow:100,depth:NaN,focus:'x'}});
  const d=asset.diagnostics();assert.equal(d.settings.form,'silk');assert.equal(d.settings.spread,1);
  assert.equal(d.settings.glow,1.8);assert.equal(d.settings.turbulence,0);
  for(const [key,uniform] of Object.entries(u))if(typeof uniform.value==='number')assert.ok(Number.isFinite(uniform.value),key);
  assert.ok([...u.tdPowers.value].every(Number.isFinite));assert.ok(d.formWeights.every(Number.isFinite));
});
check('Palette changes the reflected and visible sky through shared finite linear color uniforms',()=>{
  asset.setPalette({light:0xf49cbd,rim:0xffc485});assert.equal(u.tdPrimary.value.getHex(),0xf49cbd);assert.equal(u.tdSecondary.value.getHex(),0xffc485);
  asset.setPalette({light:NaN,rim:'wrong'});assert.equal(u.tdPrimary.value.getHex(),0xf49cbd);assert.equal(u.tdSecondary.value.getHex(),0xffc485);
});
check('Shader helper names are isolated from Three injected GLSL identifiers and derivative normals share displacement',()=>{
  const helpers=shader=>[...shader.matchAll(/\b(?:void|float|int|vec[234]|mat[234])\s+(\w+)\s*\([^;{}]*\)\s*\{/g)].map(m=>m[1]);
  for(const material of [sky.material,water.material])for(const shader of [material.vertexShader,material.fragmentShader]) {
    for(const name of helpers(shader))assert.ok(name==='main'||name.startsWith('td'),name);
    assert.doesNotMatch(shader,/\b(?:texture2D|sampler2D)\b/);
  }
  assert.match(water.material.vertexShader,/tdSurface\(position\.xz\)/);
  assert.match(water.material.fragmentShader,/tdNormal\(tdPoint\.xz,footprint\)/);
  assert.match(water.material.fragmentShader,/color=mix\(color,tdSky\(-eye\),fog\)/);
});
check('Footprint filtering is fragment-only and the reported reserved-word GPU failure cannot recur',()=>{
  const shaders=asset.group.children.flatMap(mesh=>[mesh.material.vertexShader,mesh.material.fragmentShader]);
  for(const shader of shaders){
    const clean=shader.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');
    assert.doesNotMatch(clean,/\b(?:float|int|vec[234])\s+(?:filter|input|output|resource|partition|sample|namespace)\b/);
  }
  assert.doesNotMatch(water.material.vertexShader,/\b(?:fwidth|dFdx|dFdy)\s*\(/);
  assert.match(water.material.fragmentShader,/tdFootprintWeight/);
  assert.match(water.material.fragmentShader,/fwidth\(crest\)/);
  assert.match(water.material.fragmentShader,/tdCoastReflection\(tdPoint,reflection\)/);
});
check('All owned geometry and material resources dispose exactly once and updates become inert',()=>{
  const geometries=new Set(asset.group.children.map(mesh=>mesh.geometry)),materials=new Set(asset.group.children.map(mesh=>mesh.material));
  asset.update({...base,quality:'low'});for(const mesh of asset.group.children){geometries.add(mesh.geometry);materials.add(mesh.material);}
  const calls=new Map();for(const object of [...geometries,...materials])object.addEventListener('dispose',()=>calls.set(object,(calls.get(object)||0)+1));
  const before=asset.diagnostics();asset.dispose();asset.dispose();asset.update(base);asset.setPalette({light:0});
  assert.equal(geometries.size,9);assert.equal(materials.size,6);assert.equal(calls.size,15);
  assert.ok([...calls.values()].every(v=>v===1));assert.equal(asset.group.children.length,0);
  assert.equal(asset.diagnostics().phase,before.phase);assert.equal(asset.diagnostics().disposed,true);
});
process.stdout.write(JSON.stringify({module:url.href,sha256:createHash('sha256').update(source).digest('hex'),passed:checks.length,checks,limits:'Real Three construction, numeric state and resource checks. This is not GPU compilation, actual rendered art quality or frame-rate evidence.'},null,2)+'\n');
