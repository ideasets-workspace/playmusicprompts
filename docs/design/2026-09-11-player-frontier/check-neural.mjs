import assert from 'node:assert/strict';
import * as THREE from '../../../website_html_templates/vendor/three/build/three.module.js';
import { createAuroraAsset } from './player-three-aurora.js';
import { WORLDS } from '../../../website_html_templates/player-three-worlds.js';

const asset = createAuroraAsset(THREE);
const results = [];
function check(name, fn) { fn(); results.push(name); }
const geometrySet = new Set(), materialSet = new Set();
asset.group.traverse(object => {
  if (object.geometry) geometrySet.add(object.geometry);
  if (object.material) materialSet.add(object.material);
});
const uniforms = [...materialSet][0].uniforms;
const snapshot = () => JSON.stringify({
  rotation: asset.group.rotation.toArray(),
  uniforms: Object.fromEntries(Object.entries(uniforms).map(([key, u]) => [key, ArrayBuffer.isView(u.value) ? Array.from(u.value) : u.value?.isColor ? u.value.toArray() : u.value]))
});
check('Host Three namespace and finite geometry', () => {
  assert(asset.group instanceof THREE.Group);
  for (const geometry of geometrySet) {
    assert(geometry instanceof THREE.BufferGeometry);
    for (const attribute of Object.values(geometry.attributes)) assert(attribute.array.every(Number.isFinite));
    assert(Number.isFinite(geometry.boundingSphere.radius));
    assert(geometry.boundingSphere.radius > 0);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) assert(geometry.boundingBox.containsPoint(new THREE.Vector3().fromBufferAttribute(positions, i)));
  }
});
check('Resource budget and structured tree', () => {
  const d = asset.diagnostics();
  assert(d.triangles <= 150000);
  assert(d.draws <= 30);
  assert(d.branches >= 150);
  assert(d.strands >= 300);
  assert.equal(d.cells, d.branches);
  assert.equal(geometrySet.size, 3);
  assert.equal(materialSet.size, 3);
});
check('No fabricated onset in idle or active silence', () => {
  for (let i = 0; i < 180; i++) asset.update({ dt: 1 / 60, active: true, motion: true });
  assert.equal(asset.diagnostics().eventCount, 0);
  assert.equal(uniforms.uEnergy.value, 0);
});
check('Actual onset and spectrum routed into shader uniforms', () => {
  const spectrum = Float32Array.from({ length: 64 }, (_, i) => i / 63);
  asset.update({ dt: 1 / 60, active: true, motion: true, onset: true, pulse: .85, energy: .65, bass: .7, mid: .4, treble: .3, centroid: .61, spectrum });
  assert.equal(asset.diagnostics().eventCount, 1);
  assert(Math.abs(uniforms.uPowers.value[0] - .85) < 1e-6);
  assert.equal(uniforms.uBass.value, .7);
  assert.deepEqual(uniforms.uSpectrum.value, spectrum);
  // A clearly present single-band signal must still open the canopy even when
  // broad-band arithmetic means are tiny; it must not manufacture an onset.
  const narrow = new Float32Array(64); narrow[18] = 1;
  for (let i = 0; i < 120; i++) asset.update({ dt: 1 / 60, active: true, motion: true, spectrum: narrow, energy: .001 });
  assert(uniforms.uDrive.value > .25 && uniforms.uDrive.value < .3);
  assert.equal(asset.diagnostics().eventCount, 1);
  for (let i = 0; i < 120; i++) asset.update({ dt: 1 / 60, active: true, motion: true, spectrum: new Float32Array(64) });
  assert(uniforms.uDrive.value < .001);
});
check('Motion off freezes pose and all animated uniforms', () => {
  const before = snapshot(), elapsed = asset.diagnostics().elapsed;
  for (let i = 0; i < 120; i++) asset.update({ dt: .05, active: true, motion: false, onset: true, pulse: 1, energy: 1, bass: 1, mid: 1, treble: 1 });
  assert.equal(snapshot(), before);
  assert.equal(asset.diagnostics().elapsed, elapsed);
});
check('No phase jump after re-enable; bounded hostile inputs', () => {
  const before = asset.diagnostics().elapsed;
  asset.update({ dt: 500, time: 100000, motion: true, bass: Infinity, mid: NaN, energy: -10, treble: 900 });
  assert(Math.abs(asset.diagnostics().elapsed - before - .05) < 1e-8);
  assert.equal(uniforms.uBass.value, 0);
  assert.equal(uniforms.uMid.value, 0);
  assert.equal(uniforms.uEnergy.value, 0);
  assert.equal(uniforms.uTreble.value, 1);
});
check('Nine palettes produce distinct finite primary colors', () => {
  const values = new Set();
  for (const world of WORLDS) {
    asset.setPalette(world);
    const components = uniforms.uPrimary.value.toArray();
    assert(components.every(Number.isFinite));
    values.add(components.join(','));
  }
  assert.equal(values.size, 9);
});
check('Low quality lowers atmosphere count and leaves structure', () => {
  asset.update({ motion: false, quality: 'low' });
  assert.equal(asset.diagnostics().particles, 480);
  asset.update({ motion: false, quality: 'high' });
  assert.equal(asset.diagnostics().particles, 1050);
});
const beforeDispose = asset.diagnostics();
check('Complete, idempotent disposal', () => {
  let count = 0;
  for (const resource of [...geometrySet, ...materialSet]) resource.addEventListener('dispose', () => count++);
  asset.dispose(); asset.dispose(); asset.update({ onset: true, active: true }); asset.setPalette(WORLDS[0]);
  assert.equal(count, geometrySet.size + materialSet.size);
  assert.equal(asset.group.children.length, 0);
  assert.equal(asset.diagnostics().disposed, true);
});
console.log(JSON.stringify({ checks: results, passed: results.length, source: 'Actual pinned local Three 0.185.1, structural only; no browser shader/render claim', scene: beforeDispose }, null, 2));
