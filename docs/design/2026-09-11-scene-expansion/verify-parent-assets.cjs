const path = require('node:path');
const {pathToFileURL} = require('node:url');

const root = 'C:/Berk/PlayMusicPrompts';
const assetRoot = path.join(root, 'website_html_templates');

(async () => {
  const THREE = await import(pathToFileURL(path.join(assetRoot, 'vendor/three/build/three.module.js')));
  const factories = {
    aurora: (await import(pathToFileURL(path.join(assetRoot, 'player-three-aurora.js')))).createAuroraAsset,
    orbital: (await import(pathToFileURL(path.join(assetRoot, 'player-three-orbital.js')))).createOrbitalAsset,
    liquid: (await import(pathToFileURL(path.join(assetRoot, 'player-three-liquid.js')))).createLiquidAsset,
  };
  const world = {light: 0xf47645, rim: 0xc4739a, tint: 0xefb9a4};
  const checks = [];
  const check = (name, passed, evidence) => {
    checks.push({name, passed: !!passed, evidence});
    if (!passed) throw new Error(`${name}: ${JSON.stringify(evidence)}`);
  };
  for (const [id, factory] of Object.entries(factories)) {
    const asset = factory(THREE), before = snapshot(asset.group);
    asset.setPalette(world);
    for (let i = 1; i <= 45; i++) asset.update({time: i / 30, dt: 1 / 30, bass: .85, mid: .62, treble: .48, energy: .7, active: true, motion: true, intensity: .8, spinVelocity: .8});
    const changed = differs(before, snapshot(asset.group));
    check(`${id} responds to motion/audio frame`, changed, asset.diagnostics);
    const frozen = snapshot(asset.group);
    const rotation = asset.group.rotation.toArray();
    for (let i = 0; i < 20; i++) asset.update({time: 50 + i, dt: .04, bass: 1, mid: 1, treble: 1, energy: 1, active: true, motion: false, intensity: .8, spinVelocity: 4});
    const exactFreeze = !differs(frozen, snapshot(asset.group)) && rotation.every((entry, i) => entry === asset.group.rotation.toArray()[i]);
    check(`${id} freezes geometry and transform when motion is off`, exactFreeze, exactFreeze ? rotation : diffSummary(frozen, snapshot(asset.group)));
    let finite = true;
    asset.group.traverse(object => {
      for (const attribute of ['position', 'normal']) {
        const value = object.geometry?.attributes?.[attribute];
        if (value) for (const entry of value.array) finite &&= Number.isFinite(entry);
      }
    });
    check(`${id} geometry remains finite`, finite, asset.diagnostics);
    asset.dispose();
    if (id === 'liquid') {
      const uninterrupted = factory(THREE), resumed = factory(THREE);
      for (let i = 1; i <= 30; i++) {
        const frame = {time: i / 30, dt: 1 / 30, bass: .7, mid: .5, treble: .4, energy: .6, active: true, motion: true, intensity: .8, spinVelocity: .6};
        uninterrupted.update(frame); resumed.update(frame);
      }
      for (let i = 0; i < 15; i++) resumed.update({time: 80 + i, dt: .04, bass: 1, mid: 1, treble: 1, energy: 1, active: true, motion: false, intensity: .8, spinVelocity: 4});
      for (let i = 31; i <= 50; i++) {
        const frame = {time: 1000 + i, dt: 1 / 30, bass: .7, mid: .5, treble: .4, energy: .6, active: true, motion: true, intensity: .8, spinVelocity: .6};
        uninterrupted.update(frame); resumed.update(frame);
      }
      check('liquid resumes on its local clock after a global time jump', !differs(snapshot(uninterrupted.group), snapshot(resumed.group)), {frames: 20});
      uninterrupted.dispose(); resumed.dispose();
    }
  }
  fsWrite(path.join(root, 'memory/lanes/three-player-20260911/evidence/SCENES-02-parent-assets.json'), {checks, passed: checks.length, allPassed: true});
  console.log(JSON.stringify({checks, passed: checks.length, allPassed: true}, null, 2));
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });

function fsWrite(file, value) {
  require('node:fs').writeFileSync(file, JSON.stringify(value, null, 2));
}

function snapshot(group) {
  const state = [];
  group.traverse(object => {
    state.push({
      name: object.name,
      position: object.position?.toArray?.(),
      rotation: object.rotation?.toArray?.(),
      scale: object.scale?.toArray?.(),
      geometry: ['position', 'normal'].flatMap(attribute => object.geometry?.attributes?.[attribute] ? [Array.from(object.geometry.attributes[attribute].array)] : []),
      uniforms: [object.material].flat().filter(Boolean).flatMap(material => material.uniforms ? Object.values(material.uniforms).map(entry => {
        const value = entry.value;
        return typeof value === 'number' ? value : value?.toArray?.() || value?.x !== undefined ? [value.x, value.y, value.z, value.w].filter(Number.isFinite) : undefined;
      }) : []),
    });
  });
  return state;
}

function differs(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function diffSummary(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
    out.push({index: i, name: a[i]?.name, before: a[i], after: b[i]});
    if (out.length === 2) break;
  }
  return out;
}
