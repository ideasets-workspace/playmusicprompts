import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import * as THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
import {createLiquidAsset} from './player-three-asset-liquid.js';
import {createLiquidAsset as createAccepted} from '../2026-09-11-player-frontier/player-three-liquid.js';
import {WORLDS} from '../../../website_html_templates/player-three-worlds.js';

const results=[];
function check(name,fn){fn();results.push(name);}
const values=asset=>asset.group.children[0].material.uniforms;
const snapshot=(asset,keys)=>JSON.stringify(Object.fromEntries(Object.entries(values(asset))
  .filter(([key])=>!keys||keys.includes(key))
  .map(([key,{value}])=>[key,value?.toArray?value.toArray():value])));
const poseKeys=['uPhase','uTravel','uBass','uMid','uTreble','uEnergy','uCentroid','uFront','uFrontEnergy'];
function withAssets(fn){const assets=[];const create=()=>{const a=createLiquidAsset(THREE);assets.push(a);return a;};try{fn(create);}finally{assets.forEach(a=>a.dispose());}}
const defaultLook={prismWidth:1,prismTwist:1,prismSpeed:1,prismGloss:1,particles:1,particleGlow:1,pulseGain:1};
const audio={dt:1/60,motion:true,active:true,bass:.8,mid:.6,treble:.4,energy:.7,pulse:.8,centroid:.53};

check('Accepted baseline hash is the exact source preserved before Studio changes',()=>{
  const source=readFileSync(new URL('../2026-09-11-player-frontier/player-three-liquid.js',import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'),'9f8a0b0c1e2191c4ed204658cfe20a32b82550c94210b2d8d46678e65a366f07');
});
check('Actual Three geometry, five draws and fixed camera profile remain identical to accepted source',()=>withAssets(create=>{
  const next=create(), previous=createAccepted(THREE);
  try{
    assert.deepEqual(next.view,previous.view);assert.equal(next.group.children.length,5);
    assert.equal(next.diagnostics.triangles,previous.diagnostics.triangles);
    for(let i=0;i<5;i++){
      const a=next.group.children[i],b=previous.group.children[i];
      assert.equal(a.name,b.name);assert.equal(a.frustumCulled,false);assert.equal(a.geometry.instanceCount,b.geometry.instanceCount);
      assert.deepEqual(a.geometry.index?.array,b.geometry.index?.array);
      for(const key of Object.keys(a.geometry.attributes)){
        assert.deepEqual(a.geometry.attributes[key].array,b.geometry.attributes[key].array);
        assert(a.geometry.attributes[key].array.every(Number.isFinite));
      }
    }
  }finally{previous.dispose();}
}));
check('Absent look and explicit defaults preserve accepted audio, phase, travel and front values exactly',()=>withAssets(create=>{
  const absent=create(), explicit=create(), previous=createAccepted(THREE);
  try{
    const oldKeys=Object.keys(values(previous));
    for(let i=0;i<240;i++){
      const frame={...audio,active:i<150,onset:i===10||i===70,intensity:.65,quality:i>180?'low':'high'};
      previous.update(frame);absent.update(frame);explicit.update({...frame,look:defaultLook});
      assert.equal(snapshot(absent,oldKeys),snapshot(previous,oldKeys));
      assert.equal(snapshot(explicit,oldKeys),snapshot(previous,oldKeys));
    }
  }finally{previous.dispose();}
}));
check('Static controls clamp to specified minima and maxima with motion frozen',()=>withAssets(create=>{
  const a=create();
  a.update({motion:false,look:{prismWidth:-10,prismTwist:-10,prismSpeed:-10,prismGloss:-10,particles:-10,particleGlow:-10}});
  assert.deepEqual(a.diagnostics.look,{width:.8,twist:0,gloss:.6,speed:0,particleGlow:.2,density:0});
  assert.equal(a.group.children[4].geometry.drawRange.count,0);
  a.update({motion:false,look:{prismWidth:10,prismTwist:10,prismSpeed:10,prismGloss:10,particles:10,particleGlow:10}});
  assert.deepEqual(a.diagnostics.look,{width:1.3,twist:2,gloss:1.6,speed:2,particleGlow:2,density:1});
  assert.equal(a.group.children[4].geometry.drawRange.count,380);
}));
check('Invalid look inputs resolve to finite defaults',()=>withAssets(create=>{
  const a=create();
  a.update({motion:false,look:{prismWidth:NaN,prismTwist:Infinity,prismSpeed:null,prismGloss:'1.5',particles:undefined,particleGlow:-Infinity}});
  assert.deepEqual(a.diagnostics.look,{width:1,twist:1,gloss:1,speed:1,particleGlow:1,density:1});
}));
check('Width and twist uniforms feed common architecture and peripheral placement shaders',()=>withAssets(create=>{
  const a=create();a.update({motion:false,look:{prismWidth:1.3,prismTwist:0}});
  assert.equal(values(a).uWidth.value,1.3);assert.equal(values(a).uTwist.value,0);
  for(const object of a.group.children){
    assert.match(object.material.vertexShader,/float corridorRadius\(float d\)[^\n]+\* uWidth/);
    assert.match(object.material.vertexShader,/float corridorTwist\(float d\)[^\n]+\* uTwist/);
  }
  assert.match(a.group.children[4].material.vertexShader,/aRadius\*uWidth/);
}));
check('Gloss applies to both dark wall and rib reflection bands, preserving accepted negative-Z support',()=>withAssets(create=>{
  const a=create();a.update({motion:false,look:{prismGloss:1.6}});
  const wall=a.group.children[0].material.fragmentShader,rib=a.group.children[2].material.fragmentShader;
  assert.equal(values(a).uGloss.value,1.6);
  assert.match(wall,/reflected\.y\+\.21\)\*uGloss/);assert.match(wall,/48\.0\*uGloss/);
  assert.match(rib,/reflected\.y\+\.18\)\*uGloss/);assert.match(rib,/60\.0\*uGloss/);
  assert(wall.includes('(.7+.3*abs(reflected.z))'));assert(wall.includes('vec3(.0018,.0030,.0060)'));
}));
check('Flight zero freezes travel only: real audio, bends and onset fronts remain active',()=>withAssets(create=>{
  const stopped=create(), moving=create();
  for(let i=0;i<60;i++){
    const frame={...audio,onset:i===0};
    stopped.update({...frame,look:{prismSpeed:0}});moving.update({...frame,look:{prismSpeed:1}});
  }
  assert.equal(values(stopped).uTravel.value,0);assert(values(moving).uTravel.value>0);
  assert.equal(snapshot(stopped,poseKeys.filter(k=>k!=='uTravel')),snapshot(moving,poseKeys.filter(k=>k!=='uTravel')));
  assert.equal(stopped.diagnostics.onsets,1);assert(values(stopped).uPhase.value>.9);
}));
check('Twice flight speed produces twice actual travel without changing front propagation',()=>withAssets(create=>{
  const normal=create(),fast=create();
  for(let i=0;i<90;i++){
    const frame={...audio,onset:i===0};normal.update({...frame,look:{prismSpeed:1}});fast.update({...frame,look:{prismSpeed:2}});
  }
  assert.equal(values(fast).uTravel.value,values(normal).uTravel.value*2);
  assert.deepEqual(values(fast).uFront.value,values(normal).uFront.value);
  assert.deepEqual(values(fast).uFrontEnergy.value,values(normal).uFrontEnergy.value);
}));
check('Host-scaled motion delta is accepted through 0.125 seconds without truncation or a second speed multiply',()=>withAssets(create=>{
  const a=create();
  a.update({dt:.125,motion:true,active:false,look:{motionSpeed:2.5}});
  assert.equal(values(a).uPhase.value,.125);assert.equal(values(a).uTravel.value,.125*.9);
  a.update({dt:.5,motion:true,active:false,look:{motionSpeed:2.5}});
  assert.equal(values(a).uPhase.value,.25);
  const slow=create();slow.update({dt:.005,motion:true,active:false,look:{motionSpeed:.1}});
  assert.equal(values(slow).uPhase.value,.005);assert.equal(values(slow).uTravel.value,.005*.9);
  const invalid=create();invalid.update({dt:1,motion:true,active:false,look:{motionSpeed:Infinity}});
  assert.equal(values(invalid).uPhase.value,.05);
}));
check('Particle density reduces actual whole-line draw count in both quality modes; structural draws are preserved',()=>withAssets(create=>{
  const a=create();
  for(const quality of ['low','high','auto'])for(const density of [0,.25,.5,1]){
    a.update({motion:false,quality,look:{particles:density}});
    const expected=Math.floor((quality==='low'?90:190)*density);
    assert.equal(a.diagnostics.particles,expected);assert.equal(a.group.children[4].geometry.drawRange.count,expected*2);
    assert.equal(a.group.children.length,5);
    assert.equal(a.group.children[2].geometry.instanceCount,448);
  }
}));
check('Particle glow changes filament light only and remains editable while frozen',()=>withAssets(create=>{
  const a=create();a.update({...audio,onset:true});const pose=snapshot(a,poseKeys);
  a.update({motion:false,look:{particleGlow:2}});
  assert.equal(values(a).uParticleGlow.value,2);assert.equal(snapshot(a,poseKeys),pose);
  assert.match(a.group.children[4].material.fragmentShader,/vec4\(color\*uParticleGlow,/);
  for(const object of a.group.children.slice(0,4))assert(!object.material.fragmentShader.includes('color*uParticleGlow'));
}));
check('Motion off freezes phase, real audio and fronts exactly while explicit look remains editable',()=>withAssets(create=>{
  const a=create();for(let i=0;i<30;i++)a.update({...audio,onset:i===0});const before=snapshot(a,poseKeys);
  for(let i=0;i<30;i++)a.update({dt:1,motion:false,active:true,onset:true,pulse:1,bass:1,energy:1,
    look:{prismWidth:1.3,prismTwist:2,prismSpeed:2,prismGloss:.6,particles:.5}});
  assert.equal(snapshot(a,poseKeys),before);assert.equal(a.diagnostics.onsets,1);
  assert.equal(values(a).uWidth.value,1.3);assert.equal(values(a).uGloss.value,.6);
}));
check('Zero pulse gain immediately clears existing fronts while frozen and prevents new fronts while moving',()=>withAssets(create=>{
  const a=create();a.update({...audio,onset:true});assert(values(a).uFrontEnergy.value[0]>0);
  const phase=values(a).uPhase.value,fronts=Array.from(values(a).uFront.value);
  a.update({motion:false,look:{pulseGain:0}});
  assert(values(a).uFrontEnergy.value.every(v=>v===0));assert.deepEqual(Array.from(values(a).uFront.value),fronts);
  assert.equal(values(a).uPhase.value,phase);
  for(let i=0;i<10;i++)a.update({...audio,onset:true,look:{pulseGain:0}});
  assert.equal(a.diagnostics.onsets,1);assert(values(a).uFrontEnergy.value.every(v=>v===0));
  a.update({...audio,onset:true,look:{pulseGain:1}});assert.equal(a.diagnostics.onsets,2);
}));
check('Idle and inactive frames do not fabricate onset waves even at extreme flight speed',()=>withAssets(create=>{
  const a=create();for(let i=0;i<60;i++)a.update({dt:1/60,motion:true,active:false,onset:true,pulse:1,look:{prismSpeed:2}});
  assert.equal(a.diagnostics.onsets,0);assert(values(a).uFrontEnergy.value.every(v=>v===0));assert(a.diagnostics.travel>1.7);
}));
check('All nine palettes remain directly editable during a frozen pose',()=>withAssets(create=>{
  const a=create();a.update({...audio,onset:true});const pose=snapshot(a,poseKeys);
  for(const world of WORLDS){a.setPalette(world);assert.equal(values(a).uLight.value.getHex(),world.light);assert.equal(snapshot(a,poseKeys),pose);}
}));
check('Long extreme flight remains finite and bounded',()=>withAssets(create=>{
  const a=create();for(let i=0;i<20000;i++)a.update({...audio,onset:i%120===0,look:{prismSpeed:2,prismWidth:1.3,prismTwist:2,prismGloss:1.6}});
  assert(a.diagnostics.travel>=0&&a.diagnostics.travel<112);
  a.update({dt:Infinity,bass:NaN,energy:Infinity,motion:true,active:true,look:{prismSpeed:Infinity}});
  assert(Number.isFinite(a.diagnostics.travel));assert(Number.isFinite(a.diagnostics.phase));
}));
check('Every owned resource is disposed exactly once; later changes are inert',()=>{
  const a=createLiquidAsset(THREE);let geometries=0,materials=0;
  for(const o of a.group.children){o.geometry.addEventListener('dispose',()=>geometries++);o.material.addEventListener('dispose',()=>materials++);}
  a.dispose();a.dispose();assert.equal(geometries,5);assert.equal(materials,5);assert.equal(a.group.children.length,0);
  const before=JSON.stringify(a.diagnostics);a.update({...audio,look:{prismWidth:1.3}});assert.equal(JSON.stringify(a.diagnostics),before);
});
console.log(JSON.stringify({scope:'Real Three construction and source/control state checks. GPU compilation and rendered appearance require parent browser verification.',threeRevision:THREE.REVISION,passed:results.length,results},null,2));
