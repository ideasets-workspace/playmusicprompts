import assert from 'node:assert/strict';
import * as THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
import {WORLDS} from '../../../website_html_templates/player-three-worlds.js';
import {createOrbitalAsset} from './player-three-orbital.js';

const a = createOrbitalAsset(THREE);
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
const nodes = [], geometries = new Set(), materials = new Set();
a.group.traverse(n => { nodes.push(n); if(n.geometry)geometries.add(n.geometry); if(n.material)materials.add(n.material); });
const uniforms = [...materials][0].uniforms;
function snapshot() {
  return JSON.stringify({uniforms, transforms: nodes.map(n => [n.position.toArray(),n.quaternion.toArray(),n.scale.toArray()])});
}
check('Uses host Three namespace and bounded two-pass structure',()=>{
  assert(a.group instanceof THREE.Group); assert.equal(materials.size,2); assert.equal(geometries.size,2);
  assert.equal(a.diagnostics.triangles,2); assert(a.diagnostics.points<=1200);
  assert.equal(a.view.orbit,false);
});
check('All declared geometry bounds and vertex coordinates are finite',()=>{
  for(const g of geometries) { assert(Number.isFinite(g.boundingSphere.radius)); for(const x of g.attributes.position.array)assert(Number.isFinite(x)); }
});
check('Nine world palettes mutate existing shared colors',()=>{
  const light=uniforms.uLight.value;
  for(const w of WORLDS){a.setPalette(w);assert.equal(uniforms.uLight.value,light);assert.equal(light.getHex(),w.light);assert.equal(uniforms.uRim.value.getHex(),w.rim);}
});
check('Real audio values affect uniforms while moving',()=>{
  const before=snapshot();a.update({dt:.05,motion:true,active:true,bass:.7,mid:.4,treble:.8,energy:.6,pulse:.9,onset:true,centroid:.7,quality:'high',intensity:.65});
  assert.notEqual(snapshot(),before);assert(uniforms.uAudio.value.x>0);assert.equal(a.diagnostics.onsetCount,1);assert.equal(uniforms.uWaveAges.value.x,0);
});
check('Exact material and pose freeze across changing audio while Motion is off',()=>{
  const before=snapshot();
  for(let i=0;i<100;i++)a.update({dt:.05,motion:false,active:true,bass:i%2,mid:1,treble:1,energy:1,pulse:1,onset:true,centroid:1,quality:'high',intensity:.65});
  assert.equal(snapshot(),before);assert.equal(a.diagnostics.onsetCount,1);
});
check('Quality and explicit intensity remain operable while frozen',()=>{
  a.update({motion:false,quality:'low',intensity:.3});assert.equal(uniforms.uSteps.value,32);assert.equal(uniforms.uIntensity.value,.3);
  const stars=nodes.find(n=>n.isPoints);assert.equal(stars.geometry.drawRange.count,576);
});
check('Onset fronts are never synthesized during inactive playback',()=>{
  a.update({dt:.05,motion:true,active:false,onset:true});assert.equal(a.diagnostics.onsetCount,1);
  for(let i=0;i<500;i++)a.update({dt:.016,motion:true,active:true,onset:false});assert.equal(a.diagnostics.onsetCount,1);
});
check('Time and input clamps prevent malformed feature explosions',()=>{
  const before=a.diagnostics.phase;a.update({dt:99,motion:true,active:true,bass:Infinity,mid:NaN,treble:-3,energy:200,pulse:NaN});
  assert(a.diagnostics.phase-before<=.051);for(const x of uniforms.uAudio.value.toArray())assert(Number.isFinite(x)&&x>=0&&x<=1);
});
check('Four bounded wave slots handle sustained transient inputs',()=>{
  for(let i=0;i<50;i++)a.update({dt:.05,motion:true,active:true,onset:true,pulse:.8});
  assert.equal(uniforms.uWaveAges.value.toArray().length,4);assert.equal(uniforms.uWaveStrengths.value.toArray().length,4);
});
check('All shader chunk names exist in the bundled Three revision',()=>{
  for(const m of materials)for(const match of m.fragmentShader.matchAll(/#include <(.*?)>/g))assert.equal(typeof THREE.ShaderChunk[match[1]],'string');
});
check('Every owned GPU resource disposes exactly once; update after disposal is inert',()=>{
  let count=0;for(const x of [...geometries,...materials])x.addEventListener('dispose',()=>count++);
  a.dispose();a.dispose();assert.equal(count,4);const before=snapshot();a.update({dt:1,motion:true});assert.equal(snapshot(),before);
});

// Mathematical cross-check of the shader's ray/disk intersections, not rendered visual evidence.
function ray(x,y,steps=56){
  let p=new THREE.Vector3(0,0,9),d=new THREE.Vector3(x,y,-9).normalize(),travelled=0,hits=0,captured=false;
  const normal=new THREE.Vector3(.045,.947,.32).normalize();
  for(let i=0;i<steps;i++){
    const r=p.length();if(r<.94){captured=true;break;}if(travelled>24)break;
    const delta=THREE.MathUtils.clamp(r*.13,.16,1.1)*56/steps;
    const nd=d.clone().addScaledVector(p,-1.12/Math.max(r*r*r,.32)*delta).normalize();
    const np=p.clone().addScaledVector(d.clone().add(nd).normalize(),delta);
    const b=p.dot(normal),after=np.dot(normal);
    if(b*after<0){const cross=p.clone().lerp(np,b/(b-after));if(cross.length()>1.36&&cross.length()<4.35)hits++;}
    travelled+=delta;p=np;d=nd;
  }
  return {hits,captured};
}
let capturedCount=0,diskCount=0,multipleImages=0;
for(let y=-4;y<=4;y+=.08)for(let x=-6;x<=6;x+=.08){const r=ray(x,y);if(r.captured)capturedCount++;if(r.hits)diskCount++;if(r.hits>1)multipleImages++;}
check('Ray model contains a central shadow, broad disk and secondary path crossings',()=>{
  assert.equal(ray(0,0).captured,true);assert.equal(ray(0,0).hits,0);assert(diskCount>1200);assert(capturedCount>300);assert(multipleImages>0);
});
console.log(JSON.stringify({threeRevision:THREE.REVISION,checks,pass:checks.length,rayModel:{capturedCount,diskCount,multipleImages},limitations:['Shader not compiled by this Node test.','No GPU timing or rendered visual quality inferred. Parent browser review required.']},null,2));
