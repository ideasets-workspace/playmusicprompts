import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from '../../../website_html_templates_lab/vendor/three/build/three.module.js';
const url=process.argv[2]?pathToFileURL(process.argv[2]):new URL('lab-tidal.js',import.meta.url);
const {createTidalAsset}=await import(url.href), source=fs.readFileSync(url,'utf8');
const checks=[], check=(name,fn)=>{fn();checks.push(name);};
const asset=createTidalAsset(THREE), [sky,water]=asset.group.children, u=water.material.uniforms;
const base={dt:1/60,motion:true,active:true,bass:.8,mid:.6,treble:.4,energy:.5,labLook:{},look:{},quality:'high'};
check('Pinned Three constructs a full ocean and inside sky, without renderer, loader or timer ownership',()=>{
  assert.ok(asset.group instanceof THREE.Group);assert.equal(asset.group.children.length,2);
  assert.equal(sky.material.side,THREE.BackSide);assert.equal(sky.material.depthWrite,false);
  assert.equal(water.material.side,THREE.FrontSide);assert.equal(water.geometry.attributes.position.count,193*193);
  assert.equal(sky.material.uniforms,water.material.uniforms);
  assert.doesNotMatch(source,/new THREE\.(WebGLRenderer|Audio|TextureLoader)|requestAnimationFrame|setInterval|setTimeout|fetch\(/);
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
  assert.match(water.material.fragmentShader,/tdNormal\(tdPoint\.xz\)/);
  assert.match(water.material.fragmentShader,/color=mix\(color,tdSky\(-eye\),fog\)/);
});
check('All owned geometry and material resources dispose exactly once and updates become inert',()=>{
  const geometries=new Set([sky.geometry,water.geometry]),materials=new Set([sky.material,water.material]);
  asset.update({...base,quality:'low'});geometries.add(water.geometry);materials.add(water.material);materials.add(sky.material);
  const calls=new Map();for(const object of [...geometries,...materials])object.addEventListener('dispose',()=>calls.set(object,(calls.get(object)||0)+1));
  const before=asset.diagnostics();asset.dispose();asset.dispose();asset.update(base);asset.setPalette({light:0});
  assert.equal(geometries.size,3);assert.equal(materials.size,4);assert.equal(calls.size,7);
  assert.ok([...calls.values()].every(v=>v===1));assert.equal(asset.group.children.length,0);
  assert.equal(asset.diagnostics().phase,before.phase);assert.equal(asset.diagnostics().disposed,true);
});
process.stdout.write(JSON.stringify({module:url.href,sha256:createHash('sha256').update(source).digest('hex'),passed:checks.length,checks,limits:'Real Three construction, numeric state and resource checks. This is not GPU compilation, actual rendered art quality or frame-rate evidence.'},null,2)+'\n');
