import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from '../../../website_html_templates_lab/vendor/three/build/three.module.js';
const url=process.argv[2]?pathToFileURL(process.argv[2]):new URL('lab-monolith.js',import.meta.url);
const {createMonolithAsset}=await import(url.href),source=fs.readFileSync(url,'utf8');
const asset=createMonolithAsset(THREE),checkNames=[];
const check=(name,fn)=>{fn();checkNames.push(name);};
const primary=asset.group.getObjectByName('monumental-inner-canyon');
const seams=asset.group.getObjectByName('recessed-vertical-light-seams');
const dust=asset.group.getObjectByName('airborne-mineral-motes');
const u=seams.material.uniforms;
const frame={dt:1/60,motion:true,active:true,bass:.8,mid:.55,treble:.3,energy:.6,labLook:{},look:{}};
const matrixArrays=()=>{const arrays=[];asset.group.traverse(o=>{if(o.isInstancedMesh)arrays.push(Array.from(o.instanceMatrix.array));});return arrays;};
check('The actual pinned Three builds a solid PBR environment with full ground surfaces, a far aperture and composed camera',()=>{
  assert.equal(primary.count,36);assert.ok(primary.geometry instanceof THREE.ExtrudeGeometry);assert.ok(primary.material instanceof THREE.MeshPhysicalMaterial);
  assert.equal(primary.material.metalness,.82);assert.equal(primary.material.clearcoat,.42);assert.equal(primary.material.envMapIntensity,.62);
  assert.equal(asset.group.getObjectByName('stepped-obsidian-ground').children.length,18);
  assert.ok(asset.group.getObjectByName('depth-lit-aperture').position.z < -45);
  assert.equal(asset.view.orbit,false);assert.equal(asset.view.aspectFit,false);
  const cameraPosition=new THREE.Vector3().fromArray(asset.view.direction).normalize().multiplyScalar(asset.view.distance).add(new THREE.Vector3().fromArray(asset.view.target));
  assert.ok(cameraPosition.z>11&&cameraPosition.z<13);assert.ok(cameraPosition.y>3&&cameraPosition.y<4);
});
check('Every actual instance transform is finite and the whole owned geometry remains within the host far plane budget',()=>{
  asset.group.updateMatrixWorld(true);const sceneBounds=new THREE.Box3().setFromObject(asset.group);assert.ok(sceneBounds.max.z<15);assert.ok(sceneBounds.min.z>=-63);
  // The backdrop is intentionally wide to cover portrait and landscape; its depth, not its corners,
  // is bounded by the camera far plane. All actual architectural instance centers remain nearby.
  for(const array of matrixArrays())assert.ok(array.every(Number.isFinite));
  for(let i=0;i<primary.count;i++){const m=new THREE.Matrix4();primary.getMatrixAt(i,m);const p=new THREE.Vector3().setFromMatrixPosition(m);assert.ok(p.length()<65);}
});
check('Actual material compilation callbacks add only namespaced shader inputs and preserve PBR light/reflection chunks',()=>{
  const materials=new Set();asset.group.traverse(o=>{if(o.material?.isMeshPhysicalMaterial)materials.add(o.material);});
  assert.equal(materials.size,4);
  for(const material of materials){const shader={uniforms:{},vertexShader:THREE.ShaderLib.physical.vertexShader,fragmentShader:THREE.ShaderLib.physical.fragmentShader};material.onBeforeCompile(shader);
    assert.ok(shader.uniforms.mlDepth);assert.match(shader.vertexShader,/varying vec3 mlPosition/);assert.match(shader.vertexShader,/mlWorld=instanceMatrix\*mlWorld/);
    assert.match(shader.fragmentShader,/#include <lights_fragment_begin>/);assert.match(shader.fragmentShader,/#include <lights_physical_pars_fragment>/);assert.match(shader.fragmentShader,/outgoingLight=mlMist\(outgoingLight,mlPosition\)/);
    assert.equal(shader.fragmentShader.match(/varying vec3 mlPosition/g).length,1);
  }
  assert.doesNotMatch(source,/requestAnimationFrame|setInterval|new THREE\.WebGLRenderer|new AudioContext|fetch\(/);
});
check('Bounded mineral highlights preserve channel ratios while the revised depth curve retains far-face shading',()=>{
  for(const rgb of [[.1,.02,.04],[1,2,3],[1e6,2e6,3e6]]){
    const gain=.92/(.92+Math.max(...rgb)),out=rgb.map(v=>v*gain);
    assert.ok(Math.max(...out)<.92);assert.ok(Math.abs(out[0]/out[1]-rgb[0]/rgb[1])<1e-12);
  }
  const defaultFarFog=1-Math.exp(-46*(.003+.65*.014));assert.ok(defaultFarFog<.43);
  assert.match(source,/outgoingLight\*=\.92\/\(\.92\+mlPeak\)/);
  assert.equal(asset.view.bloom,.35);
  const point=[];asset.group.traverse(o=>{if(o.isPointLight)point.push(o);});assert.equal(point.length,1);assert.ok(point[0].intensity<120);
});
check('Real audio envelopes settle on pause and silence never creates onset events',()=>{
  for(let i=0;i<120;i++)asset.update(frame);
  let d=asset.diagnostics();assert.ok(d.signals.bass>.799);assert.equal(d.onsets,0);
  for(let i=0;i<200;i++)asset.update({...frame,active:false});
  d=asset.diagnostics();assert.ok(d.signals.bass<1e-6);assert.ok(d.signals.energy<1e-6);assert.equal(d.onsets,0);
});
check('An actual onset schedules one spatial front and propagation advances coherently through the environment',()=>{
  asset.update({...frame,onset:true,pulse:.8});const before=asset.diagnostics();assert.equal(before.onsets,1);assert.equal(before.fronts[0],-48);assert.ok(before.frontEnergy[0]>1);
  asset.update(frame);const after=asset.diagnostics();assert.ok(after.fronts[0]>before.fronts[0]);assert.ok(after.frontEnergy[0]<before.frontEnergy[0]);
});
check('Motion off freezes all automatic phases, audio envelopes, wave fronts, form blend and actual instance transforms',()=>{
  for(let i=0;i<20;i++)asset.update({...frame,labLook:{form:'nova'}});
  const before=asset.diagnostics(),matrices=matrixArrays(),time=u.mlTime.value;
  for(let i=0;i<50;i++)asset.update({...frame,motion:false,onset:true,bass:1.5,mid:0,dt:5,labLook:{form:'nova'}});
  const after=asset.diagnostics();for(const key of ['phase','updates','onsets','formBlend','signals','fronts','frontEnergy'])assert.deepEqual(after[key],before[key],key);
  assert.equal(u.mlTime.value,time);assert.deepEqual(matrixArrays(),matrices);
});
check('Explicit held controls visibly change their actual instance data or shader uniforms without advancing time',()=>{
  const before=asset.diagnostics(),matrices=matrixArrays();
  asset.update({...frame,motion:false,labLook:{form:'helix',flow:0,spread:1.4,turbulence:1.3,glow:1.7,depth:.2,focus:.9},look:{particleGlow:1.2}});
  const after=asset.diagnostics();assert.equal(after.phase,before.phase);assert.equal(after.updates,before.updates);assert.deepEqual(after.formBlend,[0,0,1]);assert.notDeepEqual(matrixArrays(),matrices);
  assert.equal(u.mlDepth.value,.2);assert.equal(u.mlFocus.value,.9);assert.equal(u.mlTurbulence.value,1.3);assert.equal(u.mlGlow.value,1.7*1.2);
});
check('Low quality actually reduces submitted geometry instances and points, with independent particle-density control',()=>{
  asset.update({...frame,motion:false,quality:'high'});const high=asset.diagnostics();
  asset.update({...frame,motion:false,quality:'low'});const low=asset.diagnostics();assert.equal(high.instances,124);assert.equal(low.instances,98);assert.equal(high.motes,1000);assert.equal(low.motes,220);
  asset.update({...frame,motion:false,quality:'low',look:{particles:0}});assert.equal(dust.geometry.drawRange.count,0);
});
check('Form interpolation stays convex and continuous, while flow zero holds ambient phase without disabling real audio',()=>{
  asset.update({...frame,motion:false,labLook:{form:'silk'}});
  asset.update({...frame,labLook:{form:'nova',flow:0}});let d=asset.diagnostics();assert.ok(d.formBlend[0]>0&&d.formBlend[1]>0);assert.ok(Math.abs(d.formBlend.reduce((a,b)=>a+b,0)-1)<1e-12);
  const phase=d.phase;for(let i=0;i<50;i++)asset.update({...frame,labLook:{form:'nova',flow:0}});d=asset.diagnostics();assert.equal(d.phase,phase);assert.ok(d.signals.bass>.78);
});
check('Invalid scalar inputs and oversized frame gaps never poison transforms or clocks; accessors are not invoked',()=>{
  let invoked=false;const controls={flow:Infinity,spread:-9,turbulence:99,glow:NaN,depth:-4,focus:2};Object.defineProperty(controls,'form',{get(){invoked=true;throw new Error('must not read');}});
  const before=asset.diagnostics();asset.update({...frame,dt:Infinity,bass:NaN,labLook:controls});const d=asset.diagnostics();assert.equal(invoked,false);assert.equal(d.phase,before.phase);assert.equal(d.settings.form,'silk');assert.equal(d.settings.spread,.6);assert.equal(d.settings.turbulence,1.5);assert.equal(d.settings.depth,0);assert.equal(d.settings.focus,1);
  for(const array of matrixArrays())assert.ok(array.every(Number.isFinite));
  asset.update({...frame,dt:1000,labLook:{flow:2}});assert.ok(asset.diagnostics().phase-d.phase<=.10000001);
});
check('Palette edits affect actual light colors and shader finishes; pulse gain zero clears pending emission even when held',()=>{
  const before=u.mlPrimary.value.clone();asset.setPalette({rim:0xff4400,light:0x00aaff});
  assert.ok(!u.mlPrimary.value.equals(before));assert.ok(!u.mlPrimary.value.equals(u.mlSecondary.value));
  asset.update({...frame,onset:true});asset.update({...frame,motion:false,look:{pulseGain:0}});assert.ok(asset.diagnostics().frontEnergy.every(v=>v===0));
});
check('All owned geometries, materials and instanced buffers dispose exactly once; held references cannot restart the asset',()=>{
  const resources=new Set();asset.group.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);if(o.isInstancedMesh)resources.add(o);});
  const counts=new Map();for(const resource of resources){counts.set(resource,0);resource.addEventListener('dispose',()=>counts.set(resource,counts.get(resource)+1));}
  asset.dispose();asset.dispose();const after=asset.diagnostics();asset.update(frame);asset.setPalette({rim:0});assert.deepEqual(asset.diagnostics(),after);assert.equal(after.disposed,true);assert.equal(asset.group.children.length,0);
  for(const count of counts.values())assert.equal(count,1);
});
console.log(JSON.stringify({passed:checkNames.length,checks:checkNames,module:url.pathname,moduleSHA256:createHash('sha256').update(source).digest('hex'),scope:'Pinned Three scene, geometry, actual PBR callback wiring, numeric transforms, finite controls, motion freeze, input-driven envelopes, front propagation, true instance/draw reduction and owned-resource lifecycle. No GLSL compilation, rendered quality, FPS, photographic realism or artistic acceptance is established by this check.'},null,2));
