import assert from 'node:assert/strict';
import * as THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
import {createLiquidAsset} from './player-three-liquid.js';
import {WORLDS} from '../../../website_html_templates/player-three-worlds.js';
const asset=createLiquidAsset(THREE);
const results=[];
function check(name,fn){fn();results.push(name);}
function uniformsSnapshot(){return JSON.stringify(asset.group.children.map(o=>Object.fromEntries(Object.entries(o.material.uniforms).map(([key,u])=>[key,u.value?.toArray?u.value.toArray():u.value]))));}
check('Real Three factory creates bounded architecture',()=>{
  assert(asset.group.isGroup);assert.equal(asset.group.children.length,5);
  assert(asset.diagnostics.triangles<150000);assert(asset.diagnostics.drawCalls<30);
  for(const child of asset.group.children){
    assert.equal(child.frustumCulled,false);
    for(const attr of Object.values(child.geometry.attributes))assert(attr.array.every(Number.isFinite));
    assert(child.material.vertexShader.includes('void main()'));
    assert(child.material.fragmentShader.includes('void main()'));
  }
});
check('Initial still pose has visible palette and proper fixed tunnel view',()=>{
  assert.deepEqual(asset.view.direction,[0,0,1]);assert.equal(asset.view.aspectFit,false);assert.equal(asset.view.orbit,false);
  const u=asset.group.children[0].material.uniforms;
  assert(u.uLight.value.r>0);assert.equal(u.uTravel.value,0);
});
check('Motion-off is an exact uniform freeze including actual audio inputs',()=>{
  const before=uniformsSnapshot();
  for(let i=0;i<60;i++)asset.update({dt:1/60,motion:false,active:true,bass:1,mid:1,treble:1,energy:1,pulse:1,onset:true,intensity:.65});
  assert.equal(uniformsSnapshot(),before);assert.equal(asset.diagnostics.onsets,0);
});
check('Idle advances flight without inventing audio events',()=>{
  for(let i=0;i<60;i++)asset.update({dt:1/60,motion:true,active:false});
  assert(asset.diagnostics.travel>.8);assert.equal(asset.diagnostics.onsets,0);
  assert.equal(asset.group.children[0].material.uniforms.uEnergy.value,0);
});
check('Actual audio and onset drive envelopes and travelling fronts',()=>{
  for(let i=0;i<60;i++)asset.update({dt:1/60,motion:true,active:true,bass:.8,mid:.6,treble:.5,energy:.7,onset:i===0,pulse:.9});
  const u=asset.group.children[0].material.uniforms;
  assert(u.uBass.value>.75);assert(u.uEnergy.value>.65);assert.equal(asset.diagnostics.onsets,1);
  assert(u.uFront.value[0]<88&&u.uFront.value[0]>30);assert(asset.diagnostics.travel>4);
});
check('Live pose/audio fronts remain frozen when motion is disabled',()=>{
  const before=uniformsSnapshot();
  for(let i=0;i<20;i++)asset.update({dt:1,motion:false,active:false});
  assert.equal(uniformsSnapshot(),before);
});
check('All nine palettes update explicitly with motion frozen',()=>{
  for(const world of WORLDS){asset.setPalette(world);assert.equal(asset.group.children[0].material.uniforms.uLight.value.getHex(),world.light);}
});
check('Explicit intensity and quality remain adjustable when frozen',()=>{
  const before=asset.diagnostics.travel;
  asset.update({motion:false,intensity:.25,quality:'low'});
  assert.equal(asset.group.children[0].material.uniforms.uIntensity.value,.25);
  assert.equal(asset.group.children[4].geometry.drawRange.count,180);assert.equal(asset.diagnostics.travel,before);
});
check('Finite bounded state after long flight and malformed numeric inputs',()=>{
  for(let i=0;i<20000;i++)asset.update({dt:1/60,motion:true,active:true,energy:.8,bass:.6,onset:i%120===0,pulse:.7});
  assert(asset.diagnostics.travel>=0&&asset.diagnostics.travel<112);
  asset.update({dt:Infinity,energy:Infinity,bass:NaN,motion:true,active:true});
  assert(Number.isFinite(asset.diagnostics.travel));
});
check('Every owned resource is disposed once and later updates are inert',()=>{
  let disposedGeometry=0,disposedMaterial=0;
  for(const o of asset.group.children){o.geometry.addEventListener('dispose',()=>disposedGeometry++);o.material.addEventListener('dispose',()=>disposedMaterial++);}
  asset.dispose();asset.dispose();assert.equal(disposedGeometry,5);assert.equal(disposedMaterial,5);assert.equal(asset.group.children.length,0);
  const phase=asset.diagnostics.phase;asset.update({dt:1,motion:true});assert.equal(asset.diagnostics.phase,phase);
});
console.log(JSON.stringify({scope:'Prism source and real Three structure only; parent browser compilation/render review still required',threeRevision:THREE.REVISION,passed:results.length,results,geometry:asset.diagnostics},null,2));
