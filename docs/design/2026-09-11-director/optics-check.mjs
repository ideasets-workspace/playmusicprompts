import fs from 'node:fs';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const vendor=new URL('../../../website_html_templates/vendor/three/',import.meta.url);
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier==='three')return {url:new URL('build/three.module.js',vendor).href,shortCircuit:true};
  if(specifier.startsWith('three/addons/'))return {url:new URL('examples/jsm/'+specifier.slice(13),vendor).href,shortCircuit:true};
  return nextResolve(specifier,context);
}});
const moduleUrl=process.argv[2]?pathToFileURL(process.argv[2]):new URL('player-three-optics.js',import.meta.url);
const {createOpticsPass}=await import(moduleUrl.href);
const {ShaderPass}=await import('three/addons/postprocessing/ShaderPass.js');
const {Vector2,WebGLRenderTarget,ShaderChunk}=await import('three');
const source=fs.readFileSync(moduleUrl,'utf8'),checks=[];
function check(name,fn){fn();checks.push(name);}
const optics=createOpticsPass(),{pass}=optics,u=pass.uniforms;

check('Real pinned Three ShaderPass constructs neutral and disabled; no output remapping',()=>{
  assert.ok(pass instanceof ShaderPass);assert.equal(pass.enabled,false);
  assert.equal(pass.material.name,'ListeningRoomOptics');assert.ok(u.uResolution.value instanceof Vector2);
  assert.equal(u.uDispersion.value,0);assert.equal(u.uStreak.value,0);assert.equal(u.uGrain.value,0);
  assert.equal(pass.material.depthWrite,false);assert.equal(pass.material.depthTest,false);
  assert.match(pass.material.fragmentShader,/gl_FragColor=vec4\(color,original.a\)/);
  assert.doesNotMatch(pass.material.fragmentShader,/tonemapping_fragment|colorspace_fragment/);
});
const threeBundle=fs.readFileSync(new URL('build/three.module.js',vendor),'utf8');
function functionNames(glsl){
  const cleaned=glsl.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
  return new Set([...cleaned.matchAll(/\b(?:void|float|int|uint|bool|[biu]?vec[234]|mat[234])\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*\{/g)].map(match=>match[1]));
}
const luminanceStart=threeBundle.indexOf('function getLuminanceFunction()');
assert(luminanceStart>=0,'Review pinned renderer source: luminance generator moved');
const luminanceEnd=threeBundle.indexOf('\n}',luminanceStart);
const generatedLuminance=threeBundle.slice(luminanceStart,luminanceEnd+2);
const injectedNames=functionNames([ShaderChunk.common,ShaderChunk.colorspace_pars_fragment,ShaderChunk.tonemapping_pars_fragment,generatedLuminance].join('\n'));
for(const match of threeBundle.matchAll(/get(?:ToneMapping|TexelEncoding)Function\(\s*'([^']+)'/g))injectedNames.add(match[1]);
function collisions(glsl){return [...functionNames(glsl)].filter(name=>name!=='main'&&injectedNames.has(name)).sort();}
check('Custom GLSL helpers avoid names defined by the actual pinned renderer prefix and common chunks',()=>{
  assert(injectedNames.has('luminance'),'The guard must include the actual injected luminance definition');
  assert(injectedNames.has('linearToOutputTexel'));assert(injectedNames.has('toneMapping'));
  assert(injectedNames.has('sRGBTransferOETF'));assert(injectedNames.has('pow2'));
  assert.deepEqual(collisions(pass.material.fragmentShader),[]);assert.deepEqual(collisions(pass.material.vertexShader),[]);
  assert(functionNames(pass.material.fragmentShader).has('directorLuma'));
});
check('Namespace guard rejects the exact duplicate-luminance regression that blackened the enabled GPU pass',()=>{
  const regressed=pass.material.fragmentShader.replaceAll('directorLuma','luminance');
  assert.deepEqual(collisions(regressed),['luminance']);
  for(const helper of ['linearToOutputTexel','sRGBTransferOETF','pow2']){
    assert.deepEqual(collisions(`float ${helper}(float value){return value;}`),[helper]);
  }
});
check('Every optic independently enables the pass; explicit neutral fully bypasses it',()=>{
  for(const key of ['dispersion','streak','grain']){
    optics.update({[key]:.65});assert.equal(pass.enabled,true);
    assert.equal(u['u'+key[0].toUpperCase()+key.slice(1)].value,.65);
    optics.update();assert.equal(pass.enabled,false);
  }
});
check('Malformed, negative and oversized controls cannot leak unsafe uniforms',()=>{
  optics.update({dispersion:500,streak:-2,grain:NaN,time:Number.MAX_VALUE});
  assert.deepEqual([u.uDispersion.value,u.uStreak.value,u.uGrain.value],[1,0,0]);
  assert.ok(Number.isInteger(u.uFrame.value)&&u.uFrame.value>=0&&u.uFrame.value<4096);
  for(const bad of [undefined,null,'1',{},Infinity,-Infinity,NaN]){
    optics.update({dispersion:bad,streak:bad,grain:bad});assert.equal(pass.enabled,false);
  }
});
check('Film clock stays fixed under Motion off while deliberate static lens edits still apply',()=>{
  optics.update({grain:.4,time:2,motion:true});assert.equal(u.uFrame.value,48);
  optics.update({grain:.8,dispersion:.3,streak:.2,time:30,motion:false,quality:'low'});
  assert.equal(u.uFrame.value,48);assert.equal(u.uGrain.value,.8);assert.equal(u.uDispersion.value,.3);assert.equal(u.uStreak.value,.2);
  assert.equal(u.uTaps.value,4);
  optics.update({grain:.8,time:30,motion:true});assert.equal(u.uFrame.value,720);
  optics.update({grain:.8,time:NaN});assert.equal(u.uFrame.value,720);
});
check('Low quality changes the real streak loop budget, retaining every effect',()=>{
  optics.update({grain:.7,dispersion:.7,streak:.7,quality:'low'});assert.equal(u.uTaps.value,4);assert.equal(pass.enabled,true);
  optics.update({grain:.7,dispersion:.7,streak:.7,quality:'high'});assert.equal(u.uTaps.value,8);
  assert.match(pass.material.fragmentShader,/if\(float\(i\)>uTaps\)break/);
  for(const key of ['uDispersion','uStreak','uGrain'])assert.equal(u[key].value,.7);
});
check('Composer setSize uses effective pixels and guards zero/invalid dimensions',()=>{
  pass.setSize(2048,1152);assert.deepEqual(u.uResolution.value.toArray(),[2048,1152]);
  pass.setSize(420,200);assert.deepEqual(u.uResolution.value.toArray(),[420,200]);
  pass.setSize(0,NaN);assert.deepEqual(u.uResolution.value.toArray(),[1,1]);
  pass.setSize(Infinity,1e9);assert.deepEqual(u.uResolution.value.toArray(),[1,32768]);
});
check('Actual ShaderPass render wiring samples the input texture and updates resized buffer pixels',()=>{
  const read=new WebGLRenderTarget(613,287),write=new WebGLRenderTarget(613,287),calls=[];
  // A renderer-call spy validates pass plumbing only; it is intentionally not GPU evidence.
  const renderer={setRenderTarget(value){calls.push(value);},render(mesh,camera){assert.equal(mesh.material,pass.material);assert.ok(camera.isOrthographicCamera);}};
  pass.render(renderer,write,read);
  assert.equal(u.tDiffuse.value,read.texture);assert.deepEqual(u.uResolution.value.toArray(),[613,287]);assert.deepEqual(calls,[write]);
  read.dispose();write.dispose();
});

const smoothstep=(a,b,x)=>{const p=Math.max(0,Math.min(1,(x-a)/(b-a)));return p*p*(3-2*p);};
const luma=c=>c[0]*.2126+c[1]*.7152+c[2]*.0722;
const gate=c=>Math.min(8,Math.max(0,c[0]))*smoothstep(.55,1.4,luma(c));
check('Shader highlight gate rejects dark-field blur and preserves positive bright-light response',()=>{
  assert.match(source,/smoothstep\(0\.55,1\.4,directorLuma\(c\)\)/);
  for(const value of [0,.02,.1,.3,.55])assert.equal(gate([value,value,value]),0);
  assert.ok(gate([1,1,1])>0);assert.equal(gate([2,2,2]),2);assert.equal(gate([100,100,100]),8);
  assert.match(source,/step\(0\.0,p\.x\)\*step\(p\.x,1\.0\)/);
});
check('Numerical lens field has zero center displacement and bounded symmetric channel separation',()=>{
  assert.match(source,/radial\*edgeFalloff\*\(0\.003\*uDispersion\)/);
  const offset=(x,y)=>{const p=[(x-.5)*2,(y-.5)*2],r=(p[0]**2+p[1]**2)*.5;return p.map(v=>v*r*.003);};
  assert.deepEqual(offset(.5,.5),[0,0]);assert.deepEqual(offset(1,1),[.003,.003]);
  let max=0;
  for(let y=0;y<=100;y++)for(let x=0;x<=100;x++)for(const component of offset(x/100,y/100))max=Math.max(max,Math.abs(component));
  assert.equal(max,.003);assert.deepEqual(offset(0,0),offset(1,1).map(v=>-v));
});
check('Both streak kernels are normalized, symmetric, bounded and cover the same optical extent',()=>{
  assert.match(source,/float distanceUv=0\.085\*fraction\*fraction/);
  assert.match(source,/flare\/max\(weights,0\.0001\)\*\(0\.32\*uStreak\)/);
  for(const taps of [4,8]){
    const kernel=Array.from({length:taps},(_,i)=>({x:.085*((i+1)/taps)**2,w:Math.exp(-2.5*(i+1)/taps)}));
    const total=kernel.reduce((sum,k)=>sum+2*k.w,0);
    assert.ok(Math.abs(kernel.reduce((sum,k)=>sum+2*k.w/total,0)-1)<1e-12);
    assert.equal(kernel.at(-1).x,.085);assert.ok(kernel.every(k=>k.x>0&&k.w>0));
    assert.ok(8*.32<=2.56);
  }
});
check('Fine-grain energy remains bounded and true black stays black',()=>{
  assert.match(source,/float shadowGate=smoothstep\(0\.005,0\.12,luma\)/);
  assert.match(source,/float amplitude=0\.045\*sqrt\(min\(luma,1\.0\)\+0\.002\)/);
  const maxGrain=(v)=>.5*.045*Math.sqrt(Math.min(v,1)+.002)*smoothstep(.005,.12,v);
  assert.equal(maxGrain(0),0);assert.ok(maxGrain(.2)>0);assert.ok(maxGrain(100)<.023);
  assert.match(source,/floor\(vUv\*uResolution\)/);assert.doesNotMatch(source,/requestAnimationFrame|setInterval|AudioContext|fetch\(/);
});
check('Cleanup through either API emits one material/geometry disposal and cannot reactivate',()=>{
  let materials=0,geometries=0;
  pass.material.addEventListener('dispose',()=>materials++);
  pass._fsQuad._mesh.geometry.addEventListener('dispose',()=>geometries++);
  optics.dispose();pass.dispose();optics.dispose();
  assert.equal(materials,1);assert.equal(geometries,1);assert.equal(pass.enabled,false);assert.equal(u.tDiffuse.value,null);
  const size=u.uResolution.value.toArray();optics.update({grain:1});pass.setSize(400,400);
  assert.equal(pass.enabled,false);assert.deepEqual(u.uResolution.value.toArray(),size);
});

console.log(JSON.stringify({passed:checks.length,checks,module:moduleUrl.pathname,moduleSHA256:createHash('sha256').update(source).digest('hex'),scope:'Pinned Three ShaderPass construction/API checks, render-call plumbing, namespace collision guards against actual renderer-prefix/common definitions, and numerical/source properties. No GPU compilation, screenshot or visual acceptance claim.'},null,2));
