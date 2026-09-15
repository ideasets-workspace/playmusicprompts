import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

// Optional first argument verifies the parent-integrated copy instead of this asset.
const moduleUrl = process.argv[2] ? pathToFileURL(process.argv[2]) : new URL('./player-three-visual-settings.js', import.meta.url);
const {VISUAL_SCHEMA, VISUAL_DEFAULTS, VISUAL_PRESETS, VISUAL_STORAGE_KEY,
  sanitizeVisualSettings, createVisualStore} = await import(moduleUrl.href);
const results = [];
const check = (name, test) => { test(); results.push({name, pass: true}); };
const expected = {
  exposure: [1.05, .55, 1.75], bloom: [1, 0, 2], bloomRadius: [.65, 0, 1],
  saturation: [1, 0, 1.8], vignette: [0, 0, .8], particles: [1, 0, 1], particleGlow: [1, .2, 2],
  motionSpeed: [1, .1, 2.5], bassGain: [1, 0, 2], midGain: [1, 0, 2], trebleGain: [1, 0, 2],
  pulseGain: [1, 0, 2], smoothing: [1, .25, 2.5], framing: [1, .75, 1.35], orbitSpeed: [.26, .05, 1.2],
  recordSpectrum: [1, .2, 2], recordReflect: [1, 0, 1.5], recordFog: [.057, 0, .12],
  neuralSpread: [1, .7, 1.2], neuralSway: [1, 0, 2], neuralTrail: [1, .4, 2],
  horizonGravity: [1, .75, 1.25], horizonFlow: [1, 0, 2], horizonDetail: [1, .5, 1.5], horizonTilt: [0, -.12, .18],
  prismWidth: [1, .8, 1.3], prismTwist: [1, 0, 2], prismSpeed: [1, 0, 2], prismGloss: [1, .6, 1.6]
};
const bank = initial => {
  const values = new Map(initial ? [[VISUAL_STORAGE_KEY, structuredClone(initial)]] : []);
  const calls = {read: 0, write: 0};
  return {calls, values, adapter: {
    get(key, fallback) { calls.read++; return structuredClone(values.has(key) ? values.get(key) : fallback); },
    set(key, value) { calls.write++; values.set(key, structuredClone(value)); return true; }
  }};
};
const file = presets => ({format: 'pmp-visual-looks', version: 1, presets});
const custom = (name, settings = {exposure: 1.2}) => ({name, settings});

check('Schema has exactly 29 contracted settings, 15 shared and 14 scene-specific', () => {
  assert.deepEqual(Object.keys(VISUAL_SCHEMA), Object.keys(expected));
  assert.equal(Object.values(VISUAL_SCHEMA).filter(spec => spec.group !== 'scene').length, 15);
  assert.equal(Object.values(VISUAL_SCHEMA).filter(spec => spec.group === 'scene').length, 14);
  for (const [key, [initial, min, max]] of Object.entries(expected)) {
    const spec = VISUAL_SCHEMA[key];
    assert.deepEqual([spec.default, spec.min, spec.max], [initial, min, max]);
    assert.equal(VISUAL_DEFAULTS[key], initial);
    assert.ok(spec.label.length > 0 && spec.step > 0 && spec.step <= max - min);
    assert.ok(['look', 'motion', 'scene'].includes(spec.group));
    assert.ok(spec.group !== 'scene' || ['record', 'aurora', 'orbital', 'liquid'].includes(spec.scene));
    assert.ok(Object.isFrozen(spec));
  }
  assert.ok(Object.isFrozen(VISUAL_SCHEMA) && Object.isFrozen(VISUAL_DEFAULTS));
});

for (const [key, [initial, min, max]] of Object.entries(expected)) {
  check(`${key}: finite bounds, invalid input, absent defaults and legitimate zero preserved`, () => {
    assert.equal(sanitizeVisualSettings({[key]: min - 999})[key], min);
    assert.equal(sanitizeVisualSettings({[key]: max + 999})[key], max);
    assert.equal(sanitizeVisualSettings({[key]: (min + max) / 2})[key], (min + max) / 2);
    assert.equal(sanitizeVisualSettings({[key]: initial})[key], initial);
    for (const value of [undefined, null, NaN, Infinity, -Infinity, '1', true, {}, []]) {
      assert.equal(sanitizeVisualSettings({[key]: value})[key], initial);
    }
    assert.equal(sanitizeVisualSettings({})[key], initial);
    if (min <= 0 && max >= 0) assert.equal(sanitizeVisualSettings({[key]: 0})[key], 0);
  });
}

check('Sanitizer ignores inherited and unsafe keys, never invokes getters, and returns fresh state', () => {
  assert.deepEqual(sanitizeVisualSettings(Object.create({exposure: 1.7})), VISUAL_DEFAULTS);
  const input = JSON.parse('{"__proto__":{"polluted":true},"constructor":{},"exposure":1.3}');
  assert.equal(sanitizeVisualSettings(input).exposure, 1.3);
  assert.equal({}.polluted, undefined);
  let getterCalls = 0;
  Object.defineProperty(input, 'bloom', {get() {getterCalls++; throw new Error('must not run');}, enumerable: true});
  assert.equal(sanitizeVisualSettings(input).bloom, 1);
  assert.equal(getterCalls, 0);
  const sanitized = sanitizeVisualSettings(null); sanitized.exposure = 0;
  assert.equal(VISUAL_DEFAULTS.exposure, 1.05);
});

check('Five complete frozen built-in looks include exact Original and distinct coherent balances', () => {
  assert.deepEqual(VISUAL_PRESETS.map(preset => preset.id), ['original', 'night-drive', 'dreamstate', 'high-voltage', 'deep-space']);
  assert.deepEqual(VISUAL_PRESETS[0].settings, VISUAL_DEFAULTS);
  for (const preset of VISUAL_PRESETS) {
    assert.deepEqual(sanitizeVisualSettings(preset.settings), preset.settings);
    assert.ok(Object.isFrozen(preset) && Object.isFrozen(preset.settings));
    assert.ok(preset.name && preset.description);
  }
  const dream = VISUAL_PRESETS.find(preset => preset.id === 'dreamstate').settings;
  const voltage = VISUAL_PRESETS.find(preset => preset.id === 'high-voltage').settings;
  assert.ok(dream.motionSpeed < 1 && dream.smoothing > 1 && dream.pulseGain < 1);
  assert.ok(voltage.motionSpeed > 1 && voltage.smoothing < 1 && voltage.pulseGain > 1);
  assert.equal(new Set(VISUAL_PRESETS.map(preset => JSON.stringify(preset.settings))).size, 5);
});

check('Initialization and reads never write, and snapshots cannot mutate stored values', () => {
  const storage = bank(); const store = createVisualStore(storage.adapter);
  const first = store.read(); first.settings.exposure = 0; first.presets.push({name: 'bad'});
  assert.deepEqual(store.read(), {settings: {...VISUAL_DEFAULTS}, presets: []});
  assert.equal(storage.calls.write, 0);
});

check('Each field patches the latest state, clamps, and preserves all other fields and custom looks', () => {
  const storage = bank(); const first = createVisualStore(storage.adapter); const stale = createVisualStore(storage.adapter);
  first.savePreset('Protected look', {neuralSpread: 1.1});
  const expectedSettings = {...VISUAL_DEFAULTS};
  for (const [key, spec] of Object.entries(VISUAL_SCHEMA)) {
    first.read(); stale.read();
    const result = stale.patch(key, spec.max + 1);
    expectedSettings[key] = spec.max;
    assert.equal(result.ok, true);
    assert.deepEqual(first.read().settings, expectedSettings);
    assert.equal(first.read().presets.length, 1);
  }
  const before = storage.calls.write;
  for (const [key, value] of [['unknown', 1], ['__proto__', 1], ['exposure', '1'], ['bloom', NaN]]) {
    assert.equal(first.patch(key, value).ok, false);
  }
  assert.equal(storage.calls.write, before);
});

check('Replace resets unspecified settings deliberately and preserves latest saved looks', () => {
  const storage = bank(); const first = createVisualStore(storage.adapter); const other = createVisualStore(storage.adapter);
  first.patch('bloom', 2); first.read(); other.savePreset('Latest', {prismGloss: 1.4});
  const result = first.replace({exposure: .8});
  assert.equal(result.ok, true); assert.equal(result.state.settings.exposure, .8);
  assert.equal(result.state.settings.bloom, 1); assert.equal(result.state.presets[0].name, 'Latest');
  assert.deepEqual(first.replace(VISUAL_DEFAULTS).state.settings, VISUAL_DEFAULTS);
  assert.equal(first.replace({exposure: Infinity}).ok, false);
});

check('Preset save normalizes names, upserts case-insensitively, preserves current appearance, and rejects invalid input', () => {
  const storage = bank(); const store = createVisualStore(storage.adapter);
  store.patch('vignette', .5);
  const first = store.savePreset('  My   Look  ', {exposure: .8});
  assert.equal(first.ok, true); assert.equal(first.state.presets[0].name, 'My Look');
  const updated = store.savePreset('my look', {exposure: 1.6});
  assert.equal(updated.id, first.id); assert.equal(updated.state.presets.length, 1);
  assert.equal(updated.state.presets[0].settings.exposure, 1.6);
  assert.equal(updated.state.settings.vignette, .5);
  const writes = storage.calls.write;
  for (const name of ['', ' ', 'x'.repeat(49), 'bad\u0000name', null]) assert.equal(store.savePreset(name, VISUAL_DEFAULTS).ok, false);
  assert.equal(store.savePreset('Invalid', {exposure: '1'}).ok, false);
  assert.equal(storage.calls.write, writes);
});

check('20-look limit permits updates and atomic import rejects overflow without partial changes', () => {
  const storage = bank(); const store = createVisualStore(storage.adapter);
  for (let index = 1; index <= 20; index++) assert.equal(store.savePreset(`Look ${index}`, VISUAL_DEFAULTS).ok, true);
  assert.equal(store.savePreset('One more', VISUAL_DEFAULTS).ok, false);
  assert.equal(store.savePreset('Look 1', {bloom: .2}).ok, true);
  const before = store.read(); const writes = storage.calls.write;
  const result = store.importPresets(file([custom('Look 1', {bloom: 1.8}), custom('New')]));
  assert.equal(result.ok, false); assert.deepEqual(store.read(), before); assert.deepEqual(result.state, before);
  assert.equal(storage.calls.write, writes);
  assert.equal(store.importPresets(file([custom('Look 1', {bloom: 1.8})])).ok, true);
});

check('Export/import roundtrip retains IDs, names and exact settings; reimport has no duplicates', () => {
  const a = createVisualStore(bank().adapter); const b = createVisualStore(bank().adapter);
  a.savePreset('Electric Garden', VISUAL_PRESETS[3].settings); a.savePreset('My Quiet Space', VISUAL_PRESETS[4].settings);
  const exported = a.exportPresets();
  assert.equal(typeof exported, 'string');
  assert.equal(b.importPresets(exported).ok, true);
  assert.deepEqual(b.read().presets, a.read().presets);
  assert.deepEqual(b.read().settings, VISUAL_DEFAULTS);
  assert.equal(b.importPresets(exported).ok, true);
  assert.equal(b.read().presets.length, 2);
  const empty = createVisualStore(bank().adapter);
  assert.equal(empty.importPresets(empty.exportPresets()).ok, true);
});

check('Import validates bytes, format/version, count, names, settings, IDs and prototype keys atomically', () => {
  const storage = bank(); const store = createVisualStore(storage.adapter);
  const invalid = [
    'not json', ' '.repeat(128 * 1024 + 1), JSON.stringify(file([custom('🌍'.repeat(70000))])),
    {...file([]), format: 'other'}, {...file([]), version: 2}, {...file([]), extra: true},
    file(Array.from({length: 21}, (_, index) => custom(`Look ${index}`))),
    file([custom('')]), file([custom('x'.repeat(49))]), file([custom('Unsafe\u0001')]),
    file([custom('One'), custom(' one ')]), file([custom('Bad', {})]),
    file([custom('Bad', {exposure: NaN})]), file([custom('Bad', {exposure: '1'})]),
    file([custom('Bad', {unknown: 1})]), file([{...custom('Bad'), id: '<script>'}]),
    JSON.parse('{"format":"pmp-visual-looks","version":1,"presets":[{"name":"Bad","settings":{"__proto__":1}}]}'),
    JSON.parse('{"format":"pmp-visual-looks","version":1,"presets":[],"__proto__":{"polluted":true}}')
  ];
  for (const payload of invalid) {
    const result = store.importPresets(payload);
    assert.equal(result.ok, false); assert.ok(result.error); assert.deepEqual(result.state, store.read());
  }
  assert.equal(storage.calls.write, 0); assert.equal({}.polluted, undefined);
  const valid = store.importPresets(file([custom('Bounded', {exposure: 100, horizonTilt: -100})]));
  assert.equal(valid.ok, true); assert.equal(valid.state.presets[0].settings.exposure, 1.75);
  assert.equal(valid.state.presets[0].settings.horizonTilt, -.12);
});

check('Import resolves colliding safe IDs and retains target IDs for name updates', () => {
  const store = createVisualStore(bank().adapter);
  const first = store.savePreset('First', VISUAL_DEFAULTS);
  const imported = store.importPresets(file([{...custom('Second'), id: first.id}]));
  assert.equal(imported.ok, true); assert.notEqual(imported.state.presets[1].id, first.id);
  const replaced = store.importPresets(file([{...custom('FIRST', {saturation: .6}), id: 'look-external'}]));
  assert.equal(replaced.state.presets[0].id, first.id);
  assert.equal(replaced.state.presets[0].settings.saturation, .6);
});

check('Delete reads latest state, preserves other settings/looks, and rejects missing or unsafe IDs', () => {
  const storage = bank(); const a = createVisualStore(storage.adapter); const b = createVisualStore(storage.adapter);
  const first = a.savePreset('First', VISUAL_DEFAULTS); a.read();
  b.savePreset('Second', VISUAL_DEFAULTS); b.patch('prismWidth', 1.2);
  const result = a.deletePreset(first.id);
  assert.equal(result.ok, true); assert.equal(result.state.presets[0].name, 'Second');
  assert.equal(result.state.settings.prismWidth, 1.2);
  assert.equal(a.deletePreset(first.id).ok, false); assert.equal(a.deletePreset('__proto__').ok, false);
});

check('Corrupt persisted state recovers bounded safe snapshots without writing', () => {
  for (const corrupt of [null, [], 'bad', {version: 2, settings: {exposure: 1.6}}]) {
    const storage = bank(corrupt); const store = createVisualStore(storage.adapter);
    assert.deepEqual(store.read(), {settings: {...VISUAL_DEFAULTS}, presets: []});
    assert.equal(storage.calls.write, 0);
  }
  const storage = bank({version: 1, settings: {bloom: Infinity, exposure: .8}, presets: [
    {id: 'look-valid', name: 'Valid', settings: {exposure: 1.2}},
    {id: 'look-bad', name: 'Invalid', settings: {bad: 1}},
    {id: 'look-duplicate-name', name: 'valid', settings: VISUAL_DEFAULTS},
    {id: 'look-valid', name: 'Recovered ID', settings: {bloom: .8}}
  ]});
  const read = createVisualStore(storage.adapter).read();
  assert.equal(read.settings.exposure, .8); assert.equal(read.settings.bloom, 1);
  assert.equal(read.presets.length, 2); assert.notEqual(read.presets[1].id, 'look-valid');
  assert.equal(storage.calls.write, 0);
});

check('False, thrown and truthy non-boolean writes never report persistence; transient candidate remains available', () => {
  for (const set of [() => false, () => {throw new Error('quota');}, () => 'true']) {
    const store = createVisualStore({get: (_key, fallback) => fallback, set});
    const patch = store.patch('exposure', 1.5);
    assert.equal(patch.ok, false); assert.equal(patch.state.settings.exposure, 1.5); assert.ok(patch.error);
    assert.equal(store.read().settings.exposure, 1.05);
    const saved = store.savePreset('Temporary', VISUAL_DEFAULTS);
    assert.equal(saved.ok, false); assert.equal(saved.state.presets.length, 1); assert.ok(saved.id);
    assert.equal(store.read().presets.length, 0);
    const imported = store.importPresets(file([custom('Temporary import')]));
    assert.equal(imported.ok, false); assert.equal(imported.state.presets.length, 1);
  }
});

check('Unreadable storage never receives a partial write and exposes an honest temporary candidate', () => {
  let writes = 0;
  const store = createVisualStore({get() {throw new Error('blocked');}, set() {writes++; return true;}});
  assert.deepEqual(store.read(), {settings: {...VISUAL_DEFAULTS}, presets: []});
  const result = store.patch('bloom', .4);
  assert.equal(result.ok, false); assert.equal(result.state.settings.bloom, .4); assert.ok(result.error);
  assert.equal(writes, 0);
});

console.log(JSON.stringify({source: moduleUrl.href, passed: results.length, checks: results}, null, 2));
