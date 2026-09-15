import assert from 'node:assert/strict';
import * as THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
import {createAuroraAsset} from './player-three-asset-aurora.js';
import {createOrbitalAsset} from './player-three-asset-orbital.js';
import {createAuroraAsset as createOriginalNeural} from '../2026-09-11-player-frontier/player-three-aurora.js';
import {createOrbitalAsset as createOriginalHorizon} from '../2026-09-11-player-frontier/player-three-orbital.js';
import {WORLDS} from '../../../website_html_templates/player-three-worlds.js';

const checks = [];
function check(name, fn) { fn(); checks.push(name); }
function inspect(asset) {
  const nodes = [], geometries = new Set(), materials = new Set();
  asset.group.traverse(n => {nodes.push(n); if(n.geometry)geometries.add(n.geometry); if(n.material)materials.add(n.material);});
  return {nodes, geometries, materials, u: [...materials][0].uniforms};
}
const serialize = value => ArrayBuffer.isView(value) ? [...value] : value?.toArray ? value.toArray() : value;
function snapshot(asset, keys) {
  const {nodes, u} = inspect(asset);
  return JSON.stringify({uniforms:Object.fromEntries((keys || Object.keys(u)).map(k=>[k,serialize(u[k].value)])),
    pose:nodes.map(n=>[n.position.toArray(),n.quaternion.toArray(),n.scale.toArray()])});
}
const defaults = {particles:1,particleGlow:1,pulseGain:1,motionSpeed:1,neuralSpread:1,neuralSway:1,neuralTrail:1,
  horizonGravity:1,horizonFlow:1,horizonDetail:1,horizonTilt:0};
const factories = [{name:'Neural', make:createAuroraAsset, original:createOriginalNeural},
  {name:'Horizon',make:createOrbitalAsset, original:createOriginalHorizon}];

for (const {name, make, original} of factories) {
  check(`${name}: missing look and explicit defaults preserve original animation, geometry, palette and view`,()=>{
    const old=original(THREE), plain=make(THREE), explicit=make(THREE);
    const oldInfo=inspect(old), oldKeys=Object.keys(oldInfo.u);
    for(let i=0;i<180;i++) {
      const frame={dt:1/60,motion:i<130 || i>150,active:i>20&&i<100,bass:.3,mid:.4,treble:.2,energy:.25,
        onset:i===25||i===75,pulse:.6,centroid:.45,spectrum:Float32Array.from({length:64},(_,n)=>n%11/20),quality:i<140?'high':'low'};
      if(i%20===0) for(const a of [old,plain,explicit])a.setPalette(WORLDS[(i/20)%9]);
      old.update(frame);plain.update(frame);explicit.update({...frame,look:defaults});
      assert.equal(snapshot(plain,oldKeys),snapshot(old,oldKeys));
      assert.equal(snapshot(explicit),snapshot(plain));
      if(name==='Horizon') assert.equal(inspect(plain).u.uDiskFlow.value,oldInfo.u.uTime.value);
    }
    const current=inspect(plain);
    assert.deepEqual(plain.view,old.view);
    const oldGeometries=[...oldInfo.geometries];
    [...current.geometries].forEach((g,i)=>{
      for(const [key,attribute]of Object.entries(g.attributes))assert.deepEqual(attribute.array,oldGeometries[i].attributes[key].array);
      assert.deepEqual(g.index?.array,oldGeometries[i].index?.array);
      assert.deepEqual(g.drawRange,oldGeometries[i].drawRange);
    });
    for(const a of [old,plain,explicit])a.dispose();
  });

  check(`${name}: density changes actual draw count, respects low quality, and restores defaults`,()=>{
    const a=make(THREE), {nodes}=inspect(a), points=nodes.filter(n=>n.isPoints), dust=points.at(-1);
    const structural=points.length>1?points[0]:null, structureCount=structural?.geometry.attributes.position.count;
    const maximum=name==='Neural'?1050:1152, low=name==='Neural'?480:576;
    for(const quality of ['high','low']) for(const particles of [0,.37,1]) {
      a.update({motion:false,quality,look:{particles}});
      assert.equal(dust.geometry.drawRange.count,Math.floor((quality==='low'?low:maximum)*particles));
      if(structural)assert.equal(structural.geometry.attributes.position.count,structureCount);
    }
    a.update({motion:false});assert.equal(dust.geometry.drawRange.count,maximum);a.dispose();
  });

  check(`${name}: static tuning and pulse suppression work while animated uniforms stay frozen`,()=>{
    const a=make(THREE),{u}=inspect(a);
    for(let i=0;i<60;i++)a.update({motion:true,dt:1/60,active:true,bass:.7,energy:.6,onset:i===55,pulse:.8});
    const animatedKeys=name==='Neural'?['uTime','uBass','uMid','uTreble','uEnergy','uDrive','uFlow','uSpectrum','uEvents','uPowers']:
      ['uTime','uDiskFlow','uAudio','uPulse','uCentroid','uWaveAges','uWaveStrengths'];
    const animated=()=>JSON.stringify(Object.fromEntries(animatedKeys.map(k=>[k,serialize(u[k].value)])));
    const before=animated();
    const look={neuralSpread:1.2,neuralSway:2,neuralTrail:.4,horizonGravity:.75,horizonFlow:2,horizonDetail:1.5,horizonTilt:.18,
      particleGlow:2,particles:.2,pulseGain:0};
    for(let i=0;i<30;i++)a.update({motion:false,dt:.05,active:true,bass:i%2,energy:i%2,onset:true,pulse:1,look});
    assert.equal(animated(),before);assert.equal(u.uParticleGlow.value,2);assert.equal(u.uPulseEnabled.value,0);
    a.dispose();
  });

  check(`${name}: no invented or zero-gain fronts and bounded scaled time`,()=>{
    const a=make(THREE),{u}=inspect(a);
    const eventCount=()=>name==='Neural'?a.diagnostics().eventCount:a.diagnostics.onsetCount;
    for(let i=0;i<60;i++)a.update({motion:true,dt:1/60,active:true,onset:false,bass:1,energy:1});
    assert.equal(eventCount(),0);
    a.update({motion:true,dt:.05,active:true,onset:true,pulse:1,look:{pulseGain:0}});assert.equal(eventCount(),0);
    a.update({motion:true,dt:.05,active:false,onset:true,pulse:1});assert.equal(eventCount(),0);
    a.update({motion:true,dt:.05,active:true,onset:true,pulse:.8});assert.equal(eventCount(),1);
    const before=u.uTime.value;
    a.update({motion:true,dt:.1,active:true,energy:0,look:{motionSpeed:2.5}});
    assert(Math.abs(u.uTime.value-before-(name==='Neural'?.1:.046))<1e-9);
    a.dispose();
  });

  check(`${name}: full pose freeze and idempotent disposal`,()=>{
    const a=make(THREE), {geometries,materials}=inspect(a);
    a.update({motion:true,dt:.05,active:true,bass:.6,energy:.5,onset:true,pulse:.7});
    const before=snapshot(a);
    for(let i=0;i<60;i++)a.update({motion:false,dt:.05,active:true,onset:true,pulse:1,bass:1,energy:1});
    assert.equal(snapshot(a),before);
    let disposed=0;for(const resource of [...geometries,...materials])resource.addEventListener('dispose',()=>disposed++);
    a.dispose();a.dispose();a.update({motion:true,dt:1});a.setPalette(WORLDS[4]);
    assert.equal(disposed,geometries.size+materials.size);
  });
}

check('Neural: width scales joined fibers and cells together, preserving host placement and dust',()=>{
  const a=createAuroraAsset(THREE), {nodes}=inspect(a), fibers=nodes.find(n=>n.isMesh), cells=nodes.find(n=>n.isPoints), dust=nodes.filter(n=>n.isPoints).at(-1);
  a.group.position.set(3,2.75,-1);
  for(const neuralSpread of [.7,1,1.2]) {
    a.update({motion:false,look:{neuralSpread}});
    assert.deepEqual(fibers.scale.toArray(),[neuralSpread,1,neuralSpread]);
    assert.deepEqual(cells.scale.toArray(),fibers.scale.toArray());
    assert.deepEqual(dust.scale.toArray(),[1,1,1]);assert.deepEqual(a.group.position.toArray(),[3,2.75,-1]);
  }
  a.dispose();
});

check('Neural: sway and trail extremes reach shader and retained audio pose; malformed settings use safe defaults',()=>{
  const a=createAuroraAsset(THREE),{u,materials}=inspect(a);
  for(let i=0;i<60;i++)a.update({motion:true,dt:1/60,active:true,bass:1,energy:.6});
  a.update({motion:false,look:{neuralSway:0,neuralTrail:.4}});
  assert.equal(a.group.rotation.x,0);assert.equal(u.uSway.value,0);assert.equal(u.uTrail.value,.4);
  a.update({motion:false,look:{neuralSway:2,neuralTrail:2}});
  assert.notEqual(a.group.rotation.x,0);assert.equal(u.uTrail.value,2);
  a.update({motion:false,look:{neuralSway:Infinity,neuralTrail:NaN,neuralSpread:'1.2',particleGlow:null}});
  assert.equal(u.uSway.value,1);assert.equal(u.uTrail.value,1);assert.equal(u.uParticleGlow.value,1);
  const shader=[...materials][0];assert(shader.vertexShader.includes('uDrive * uSway'));
  assert(shader.fragmentShader.includes('34. / uTrail'));assert(shader.fragmentShader.includes('(uTrail - 1.) * .6'));
  a.dispose();
});

check('Neural: CPU culling bounds cover the full sound deformation at maximum sway',()=>{
  const a=createAuroraAsset(THREE),{nodes}=inspect(a);
  for(const node of nodes.filter(n=>n.isMesh||n.name==='Living synaptic junctions')) {
    const geometry=node.geometry, position=geometry.attributes.position;
    const p=new THREE.Vector3();
    for(let i=0;i<position.count;i++) {
      p.fromBufferAttribute(position,i);
      // Maxima bound the shader's ordered x/z deformation, including the phase
      // change introduced when the already-deformed x is used by the z sine.
      const dx=Math.abs(p.x)*.18+.33,dz=Math.abs(p.z)*.28+.48,dy=.2+.148;
      for(const sign of [-1,1])assert(geometry.boundingBox.containsPoint(new THREE.Vector3(p.x+dx*sign,p.y+dy*sign,p.z+dz*sign)));
    }
  }
  a.dispose();
});

check('Horizon: flow stops only disk drift, changes speed continuously, and does not freeze other clocks',()=>{
  const a=createOrbitalAsset(THREE),{u}=inspect(a);
  a.update({motion:true,dt:.05,active:true});const initialFlow=u.uDiskFlow.value;
  a.update({motion:true,dt:.05,active:true,look:{horizonFlow:0}});
  assert.equal(u.uDiskFlow.value,initialFlow);assert(u.uTime.value>initialFlow);
  a.update({motion:true,dt:.05,active:true,look:{horizonFlow:2}});
  assert(Math.abs(u.uDiskFlow.value-initialFlow-.05*.46*2)<1e-9);
  const before=u.uDiskFlow.value;a.update({motion:false,dt:100,look:{horizonFlow:0}});assert.equal(u.uDiskFlow.value,before);a.dispose();
});

check('Horizon: gravity, detail, tilt and glow reach shared materials with safe bounds and unchanged low step budget',()=>{
  const a=createOrbitalAsset(THREE),{u,materials}=inspect(a);
  for(const look of [{horizonGravity:.75,horizonDetail:.5,horizonTilt:-.12,particleGlow:.2},
    {horizonGravity:1.25,horizonDetail:1.5,horizonTilt:.18,particleGlow:2}]) {
    a.update({motion:false,quality:'low',look});
    for(const [key,value]of Object.entries(look))assert.equal(u[{horizonGravity:'uGravity',horizonDetail:'uDetail',horizonTilt:'uTilt',particleGlow:'uParticleGlow'}[key]].value,value);
    assert.equal(u.uSteps.value,32);
  }
  a.update({motion:false,look:{horizonGravity:NaN,horizonDetail:99,horizonTilt:-9,particleGlow:Infinity}});
  assert.equal(u.uGravity.value,1);assert.equal(u.uDetail.value,1.5);assert.equal(u.uTilt.value,-.12);assert.equal(u.uParticleGlow.value,1);
  const shader=[...materials][0].fragmentShader;
  assert.equal((shader.match(/\.32 \+ uTilt/g)||[]).length,2);assert(shader.includes('1.12 * uGravity'));
  assert(shader.includes('112. * uDetail'));assert(shader.includes('27. * uDetail'));assert(shader.includes('float shear = uDiskFlow'));
  a.dispose();
});

// CPU cross-check of exact shader ray equations at all geometry-setting limits.
// It verifies finite intersections and a preserved central capture region, not pixels.
function ray(x,y,gravity,tilt,steps) {
  let p=new THREE.Vector3(0,0,9),d=new THREE.Vector3(x,y,-9).normalize(),travelled=0,hits=0,captured=false;
  const normal=new THREE.Vector3(.045,.947,.32+tilt).normalize();
  for(let i=0;i<steps;i++) {
    const r=p.length();if(r<.94){captured=true;break;}if(travelled>24)break;
    const delta=THREE.MathUtils.clamp(r*.13,.16,1.1)*56/steps;
    const nd=d.clone().addScaledVector(p,-1.12*gravity/Math.max(r*r*r,.32)*delta).normalize();
    const np=p.clone().addScaledVector(d.clone().add(nd).normalize(),delta);
    const before=p.dot(normal),after=np.dot(normal);
    if(before*after<0){const crossing=p.clone().lerp(np,before/(before-after));if(crossing.length()>1.36&&crossing.length()<4.35)hits++;}
    assert(np.toArray().every(Number.isFinite));travelled+=delta;p=np;d=nd;
  }
  return {hits,captured};
}
check('Horizon: extreme gravity/tilt combinations retain a finite, visible disk and central dark capture at 32/56 steps',()=>{
  for(const gravity of [.75,1.25])for(const tilt of [-.12,.18])for(const steps of [32,56]) {
    assert.equal(ray(0,0,gravity,tilt,steps).captured,true);
    let disk=0,captured=0;
    for(let y=-3;y<=3;y+=.2)for(let x=-5;x<=5;x+=.2) {const r=ray(x,y,gravity,tilt,steps);if(r.hits)disk++;if(r.captured)captured++;}
    assert(disk>90,`missing disk at ${gravity},${tilt},${steps}: ${disk}`);assert(captured>30);
  }
});

console.log(JSON.stringify({passed:checks.length,checks,threeRevision:THREE.REVISION,
  limitations:['Node checks use actual Three geometry, uniforms and exact CPU ray equations. No shader compilation or pixel-quality claim.',
    'Parent must integrate modules and inspect actual rendered defaults, changed controls and live preview.']},null,2));
