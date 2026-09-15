import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from '../../../website_html_templates_beyond/vendor/three/build/three.module.js';

const moduleURL = process.argv[2] ? pathToFileURL(process.argv[2]) : new URL('lab-aether-atmosphere.js', import.meta.url);
// Keep cross-module checks on the same selected source tree as the volume.
const particleURL = new URL('lab-aether.js', moduleURL);
const {createAetherAsset} = await import(particleURL.href);
const {createAetherAtmosphere} = await import(moduleURL.href);
const source = fs.readFileSync(moduleURL, 'utf8'), checks = [];
const check = (name, fn) => {fn(); checks.push(name);};
const atmosphere = createAetherAtmosphere(THREE), mesh = atmosphere.group.children[0], material = mesh.material, u = material.uniforms;
const frame = {dt: 1 / 60, motion: true, active: true, bass: .8, mid: .5, treble: .3, look: {}, labLook: {}};
check('Pinned Three constructs a single bounded transparent medium with additive RGB and unchanged destination alpha', () => {
  assert.ok(atmosphere.group instanceof THREE.Group); assert.ok(mesh.geometry instanceof THREE.BoxGeometry);
  assert.equal(atmosphere.group.children.length, 1); assert.equal(material.side, THREE.BackSide);
  assert.equal(material.transparent, true); assert.equal(material.depthWrite, false); assert.equal(material.toneMapped, false);
  assert.equal(material.blending, THREE.CustomBlending); assert.equal(material.blendSrc, THREE.OneFactor);
  assert.equal(material.blendDst, THREE.OneFactor); assert.equal(material.blendSrcAlpha, THREE.ZeroFactor);
  assert.equal(material.blendDstAlpha, THREE.OneFactor); assert.equal(mesh.renderOrder, -10);
  assert.deepEqual([mesh.geometry.parameters.width, mesh.geometry.parameters.height, mesh.geometry.parameters.depth], u.avHalfBox.value.toArray().map(v => v * 2));
});
check('Cloud detail is a fixed, deterministic filtered 3D texture with a bounded local budget',()=>{
  const texture=u.avNoiseField.value;
  assert.ok(texture instanceof THREE.Data3DTexture);
  assert.equal(texture.image.data.byteLength,64*64*64);
  assert.deepEqual([texture.image.width,texture.image.height,texture.image.depth],[64,64,64]);
  assert.equal(texture.minFilter,THREE.LinearMipmapLinearFilter);assert.equal(texture.generateMipmaps,true);
  assert.equal(texture.wrapR,THREE.RepeatWrapping);
  const other=createAetherAtmosphere(THREE);
  assert.deepEqual(texture.image.data,other.group.children[0].material.uniforms.avNoiseField.value.image.data);
  assert.equal(new Set(texture.image.data).size,256);
  const version=texture.version,data=texture.image.data;
  atmosphere.update(frame);atmosphere.update({...frame,motion:false});
  assert.equal(texture.version,version);assert.equal(texture.image.data,data);other.dispose();
});

check('Camera uniform applies the complete translated, rotated and nonuniformly scaled parent transform', () => {
  const scene = new THREE.Scene(), parent = new THREE.Group(), camera = new THREE.PerspectiveCamera(38, 1.6, .1, 100);
  parent.position.set(2, 2.75, -1); parent.rotation.set(.1, .8, -.2); parent.scale.set(1.1, .8, 1.5);
  scene.add(parent); parent.add(atmosphere.group); camera.position.set(4, 5, 13); camera.lookAt(0, 2.75, 0);
  scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
  mesh.onBeforeRender({}, scene, camera);
  const world = u.avCamera.value.clone().applyMatrix4(mesh.matrixWorld);
  assert.ok(world.distanceTo(camera.getWorldPosition(new THREE.Vector3())) < 1e-10);
  assert.equal(u.avOrthographic.value, 0);
  const ortho = new THREE.OrthographicCamera(-4, 4, 3, -3, .1, 100); ortho.position.copy(camera.position); ortho.lookAt(0, 2.75, 0); ortho.updateMatrixWorld(true);
  mesh.onBeforeRender({}, scene, ortho); assert.equal(u.avOrthographic.value, 1);
  const direction = u.avDirection.value.clone().transformDirection(mesh.matrixWorld);
  assert.ok(direction.distanceTo(ortho.getWorldDirection(new THREE.Vector3())) < 1e-10);
  parent.remove(atmosphere.group); atmosphere.group.updateMatrixWorld(true);
});

check('Three injected shader helpers cannot collide with av-prefixed custom helpers', () => {
  const bundle = fs.readFileSync(new URL('../../../website_html_templates_beyond/vendor/three/build/three.module.js', import.meta.url), 'utf8');
  const helpers = shader => new Set([...shader.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '').matchAll(/\b(?:void|float|int|bool|[biu]?vec[234]|mat[234])\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*\{/g)].map(m => m[1]));
  const start = bundle.indexOf('function getLuminanceFunction()'); assert.ok(start > 0);
  const injected = helpers(THREE.ShaderChunk.common + THREE.ShaderChunk.tonemapping_pars_fragment + THREE.ShaderChunk.colorspace_pars_fragment + bundle.slice(start, bundle.indexOf('\n}', start) + 2));
  assert.ok(injected.has('luminance'));
  for (const shader of [material.vertexShader, material.fragmentShader]) {
    for (const name of helpers(shader)) {
      if (name === 'main') continue;
      assert.match(name, /^av/); assert.equal(injected.has(name), false, name);
    }
  }
  assert.doesNotMatch(source, /requestAnimationFrame|setInterval|AudioContext|fetch\(|new THREE\.WebGLRenderer/);
});

// Independent reference slab intersection with explicit zero-direction handling.
const reference = (origin, direction, bounds) => {
  let near = -Infinity, far = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(direction[i]) < 1e-12) {if (Math.abs(origin[i]) > bounds[i]) return null; continue;}
    const a = (-bounds[i] - origin[i]) / direction[i], b = (bounds[i] - origin[i]) / direction[i];
    near = Math.max(near, Math.min(a, b)); far = Math.min(far, Math.max(a, b));
  }
  return far > Math.max(near, 0) ? [Math.max(near, 0), far] : null;
};
const shaderSlabs = (origin, direction, bounds) => {
  const safe = direction.map(v => (v < 0 ? -1 : 1) * Math.max(Math.abs(v), .000001));
  const a = origin.map((o, i) => (-bounds[i] - o) / safe[i]), b = origin.map((o, i) => (bounds[i] - o) / safe[i]);
  const near = Math.max(...a.map((v, i) => Math.min(v, b[i]))), far = Math.min(...a.map((v, i) => Math.max(v, b[i])));
  return far > Math.max(near, 0) ? [Math.max(near, 0), far] : null;
};
check('Ray-box arithmetic matches an independent reference outside, inside and parallel to the box', () => {
  const bounds = u.avHalfBox.value.toArray();
  const cases = [
    [[0, 0, 12], [0, 0, -1]], [[0, 0, 0], [0, 0, 1]], [[6, 0, 0], [0, 1, 0]],
    [[0, 12, 0], [0, -1, 0]], [[-12, 0, 0], [1, 0, 0]], [[12, 0, 0], [1, 0, 0]],
    [[0, 4, 0], [1, 0, 0]], [[3, 2, 8], new THREE.Vector3(-.2, -.1, -1).normalize().toArray()]
  ];
  for (const [origin, direction] of cases) assert.deepEqual(shaderSlabs(origin, direction, bounds), reference(origin, direction, bounds));
  let seed = 12451;
  const random = () => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296;};
  for (let n = 0; n < 1000; n++) {
    const origin = [random(), random(), random()].map(v => (v - .5) * 30);
    const direction = new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize().toArray();
    assert.deepEqual(shaderSlabs(origin, direction, bounds), reference(origin, direction, bounds));
  }
  assert.match(material.fragmentShader, /enter = max\(bounds.x, 0.0\), leave = bounds.y/);
});

check('Each quality level changes the actual bounded shader ray loop', () => {
  atmosphere.update({...frame, quality: 'low'}); assert.equal(u.avSteps.value, 36); assert.equal(atmosphere.diagnostics().raySteps, 36);
  atmosphere.update({...frame, quality: 'high'}); assert.equal(u.avSteps.value, 64);
  assert.match(material.fragmentShader, /for \(int i = 0; i < 64; i\+\+\)/);
  assert.match(material.fragmentShader, /if \(i >= avSteps\) break/);
});
check('Continuous form morph is convex and does not advance under Motion off', () => {
  atmosphere.update({...frame, labLook: {form: 'helix'}});
  const weights = u.avForms.value.toArray(); assert.ok(weights[0] > 0 && weights[2] > 0);
  assert.ok(Math.abs(weights.reduce((a, b) => a + b) - 1) < 1e-12);
  const before = atmosphere.diagnostics();
  atmosphere.update({...frame, motion: false, dt: 50, bass: 1, labLook: {form: 'helix'}});
  const after = atmosphere.diagnostics();
  for (const key of ['elapsed', 'updates', 'formBlend', 'signals']) assert.deepEqual(after[key], before[key]);
});
check('Explicit form, depth, spread, focus and finish edits remain effective while frozen', () => {
  atmosphere.update({...frame, motion: false, look: {particleGlow: 1.4}, labLook: {form: 'nova', depth: .25, focus: .8, spread: 1.3, turbulence: 1.2, glow: 1.5}});
  assert.deepEqual(u.avForms.value.toArray(), [0, 1, 0]); assert.equal(u.avDepth.value, .25); assert.equal(u.avFocus.value, .8);
  assert.equal(u.avSpread.value, 1.3); assert.equal(u.avTurbulence.value, 1.2); assert.ok(Math.abs(u.avGlow.value - 2.1) < 1e-12);
  atmosphere.update({...frame, motion: false, labLook: {depth: 0}}); assert.equal(mesh.visible, false);
  atmosphere.update({...frame, motion: false, labLook: {depth: .65}}); assert.equal(mesh.visible, true);
});
check('Invalid controls and enormous elapsed gaps remain finite and inside their declared budgets', () => {
  atmosphere.update({...frame, dt: 1e20, look: {particleGlow: Infinity}, labLook: {form: 'missing', spread: -5, turbulence: 900, glow: NaN, depth: 600, focus: -7, flow: 900}});
  const d = atmosphere.diagnostics();
  assert.equal(d.form, 'silk'); assert.equal(d.settings.spread, .6); assert.equal(d.settings.turbulence, 1.5);
  assert.equal(d.settings.glow, 1); assert.equal(d.settings.depth, 1); assert.equal(d.settings.focus, 0); assert.equal(d.settings.flow, 2);
  const before = d.elapsed; atmosphere.update({...frame, dt: -50, labLook: {flow: 2}}); assert.equal(atmosphere.diagnostics().elapsed, before);
  for (const key of ['avTime', 'avBass', 'avMid', 'avTreble', 'avSpread', 'avTurbulence', 'avDepth', 'avFocus', 'avGlow']) assert.ok(Number.isFinite(u[key].value));
});
check('Audio responds to actual active input and settles on pause; zero flow stops ambient phase', () => {
  for (let i = 0; i < 120; i++) atmosphere.update({...frame, labLook: {flow: 0}});
  assert.ok(atmosphere.diagnostics().signals.bass > .79);
  const phase = atmosphere.diagnostics().elapsed;
  for (let i = 0; i < 180; i++) atmosphere.update({...frame, active: false, labLook: {flow: 0}});
  assert.equal(atmosphere.diagnostics().elapsed, phase);
  assert.ok(atmosphere.diagnostics().signals.bass < .00001);
});
check('The medium has true depth integration, stable sample positions and a hard radiance ceiling', () => {
  assert.match(material.fragmentShader, /samplePoint = origin \+ direction \* \(enter \+ \(float\(i\) \+ 0.5\) \* stride\)/);
  assert.match(material.fragmentShader, /1.0 - exp\(-density \* stride \* avDepth \* 0.36\)/);
  assert.match(material.fragmentShader, /transmittance \*= 1.0 - opacity/);
  assert.match(material.fragmentShader, /min\(radiance, vec3\(0.42\)\)/);
  assert.doesNotMatch(material.fragmentShader, /gl_FragCoord|texture2D|sampler2D/);
  for (const steps of [36, 64]) {
    const thickness = 5, density = .7, depth = .65, stride = thickness / steps;
    let transmittance = 1, sum = 0;
    for (let i = 0; i < steps; i++) {const opacity = 1 - Math.exp(-density * stride * depth * .36); sum += transmittance * opacity; transmittance *= 1 - opacity;}
    assert.ok(Math.abs(sum - (1 - Math.exp(-density * thickness * depth * .36))) < 1e-12);
  }
});
check('Environment box includes the camera, all near banks and the full distant field',()=>{
  const half=u.avHalfBox.value;
  assert.ok(half.x>=30&&half.y>=20&&half.z>=50);
  const a=createAetherAsset(THREE),camera=new THREE.Vector3().fromArray(a.view.direction).normalize().multiplyScalar(a.view.distance).add(new THREE.Vector3().fromArray(a.view.target));
  camera.y-=2.75;
  assert.ok(camera.toArray().every((v,i)=>Math.abs(v)<half.toArray()[i]));
  const ray=shaderSlabs(camera.toArray(),[0,0,-1],half.toArray());
  assert.equal(ray[0],0);assert.ok(ray[1]>40&&ray[1]<100);a.dispose();
});
check('Particle and volume clocks, envelopes and form weights match through pause and frozen edits',()=>{
  const a=createAetherAsset(THREE),v=createAetherAtmosphere(THREE);
  for(let i=0;i<180;i++){
    const f={...frame,energy:.61,active:i<100,motion:i<130,labLook:{form:i<30?'silk':i<90?'nova':'helix',flow:1.3}};
    a.update(f);v.update(f);
    assert.ok(Math.abs(a.diagnostics().phase-v.diagnostics().elapsed)<1e-12);
    assert.deepEqual(a.diagnostics().weights,v.diagnostics().formBlend);
    for(const band of ['bass','mid','treble'])assert.equal(a.diagnostics().signals[band],v.diagnostics().signals[band]);
  }
  a.update({...frame,motion:false,labLook:{form:'silk',depth:.2}});v.update({...frame,motion:false,labLook:{form:'silk',depth:.2}});
  assert.deepEqual(a.diagnostics().weights,v.diagnostics().formBlend);a.dispose();v.dispose();
});
check('Palette inputs reach actual shader colours', () => {
  atmosphere.setPalette({light: 0xff4400, rim: 0x00aaff, tint: 0xffffaa});
  assert.equal(u.avPrimary.value.getHex(), 0xff4400); assert.equal(u.avSecondary.value.getHex(), 0x00aaff);
  assert.ok(u.avPearl.value.r > 0 && u.avPearl.value.g > 0 && u.avPearl.value.b > 0);
});
check('Particle and medium share camera-relative touch while frozen input is ignored',()=>{
  const a=createAetherAsset(THREE),v=createAetherAtmosphere(THREE),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1.7,.1,100);
  scene.add(a.group);a.group.add(v.group);a.group.position.set(1,2.75,-.5);a.group.rotation.set(.05,.4,.02);
  camera.position.set(2,4,6);camera.lookAt(0,2.75,-5);camera.updateMatrixWorld(true);
  const f={...frame,active:false,touch:{x:.6,y:-.2,strength:.8,active:true,serial:5}};
  a.update(f);v.update(f);scene.updateMatrixWorld(true);
  a.group.children[0].onBeforeRender({},scene,camera);v.group.children[0].onBeforeRender({},scene,camera);
  assert.deepEqual(a.diagnostics().touch,v.diagnostics().touch);
  const held=v.diagnostics().touch;
  a.update({...f,motion:false,touch:{}});v.update({...f,motion:false,touch:{}});
  assert.deepEqual({...v.diagnostics().touch,frozen:false},held);
  a.update({...f,touch:{x:.6,y:-.2,strength:.3,active:false,serial:5}});v.update({...f,touch:{x:.6,y:-.2,strength:.3,active:false,serial:5}});
  assert.equal(v.diagnostics().touch.strength,.3);assert.equal(v.diagnostics().touch.active,false);
  a.update(frame);v.update(frame);assert.equal(v.diagnostics().touch.strength,0);
  v.dispose();a.dispose();
});
check('Owned geometry and material dispose once and disposed assets cannot resume updates', () => {
  let geometryDisposals = 0, materialDisposals = 0,noiseDisposals=0;
  mesh.geometry.addEventListener('dispose', () => geometryDisposals++); material.addEventListener('dispose', () => materialDisposals++);
  u.avNoiseField.value.addEventListener('dispose',()=>noiseDisposals++);
  atmosphere.dispose(); atmosphere.dispose(); const final = atmosphere.diagnostics();
  atmosphere.update(frame); atmosphere.setPalette({light: 0});
  assert.deepEqual(atmosphere.diagnostics(), final); assert.equal(final.disposed, true);
  assert.equal(geometryDisposals, 1); assert.equal(materialDisposals, 1);assert.equal(noiseDisposals,1); assert.equal(atmosphere.group.children.length, 0);
});
console.log(JSON.stringify({passed: checks.length, checks, module: moduleURL.pathname, moduleSHA256: createHash('sha256').update(source).digest('hex'), particleModule: particleURL.pathname, particleSHA256: createHash('sha256').update(fs.readFileSync(particleURL)).digest('hex'), scope: 'Pinned Three construction, real scene/camera matrices, input and lifecycle behavior, independent slab-reference comparison, bounded compositing math and shader namespace/source guards. These checks do not compile GLSL or establish actual GPU rendering, performance or visual acceptance.'}, null, 2));
