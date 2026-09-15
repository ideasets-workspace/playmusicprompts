import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
const production = resolve(here, '../../../website_html_templates/player-three-visual-settings.js');
const engineFile = resolve(here, 'player-three-director.js');
const original = await readFile(engineFile, 'utf8');
// Execute the exact deliverable; adapt its one relative import to the current production schema only.
const executable = original.replace("'./player-three-visual-settings.js'", JSON.stringify(pathToFileURL(production).href));
const module = await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`);
const {VISUAL_DEFAULTS: defaults, VISUAL_SCHEMA: schema} = await import(pathToFileURL(production).href);
const {DIRECTOR_DEFAULTS: directorDefaults, DIRECTOR_SOURCES, DIRECTOR_TARGETS, DIRECTOR_STORAGE_KEY,
  sanitizeDirectorConfig, createDirectorStore, createDirectorEngine} = module;
const clone = value => JSON.parse(JSON.stringify(value));
const configure = patch => sanitizeDirectorConfig({...clone(directorDefaults), ...patch});
const baseFrame = {baseSettings: defaults, scene: 'record', trackId: 'track-1', time: 0, dt: 1 / 60,
  playing: true, motion: true, signals: {bass: 0, mid: 0, treble: 0, energy: 0, pulse: 0, centroid: 0}};
const frame = patch => ({...baseFrame, ...patch});
const levelFrame = patch => frame({signals: Object.fromEntries(DIRECTOR_SOURCES.map(item => [item.id, 1])), ...patch});
const close = (actual, expected, epsilon = 1e-10) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} differs from ${expected}`);
const route = (source = 'bass', target = 'bloom', amount = 1) => ({id: 'route-test', enabled: true, source, target, amount});
const cue = (id, time, exposure, scene = 'record', duration = 0) => ({id, time, label: id, scene, duration, settings: {...defaults, exposure}});
const tests = [];
const check = (name, work) => { work(); tests.push(name); };

check('Default engine is exact complete29 identity in play, pause and Motion off', () => {
  const engine = createDirectorEngine();
  for (const options of [{}, {playing: false}, {motion: false}, {playing: false, motion: false}]) {
    const result = engine.update(levelFrame(options));
    assert.deepEqual(result.settings, defaults);
    assert.equal(result.scene, 'record');
  }
  assert.equal(Object.keys(defaults).length, 29);
});
check('All four bilinear corners are exact and center is the arithmetic mean', () => {
  const engine = createDirectorEngine();
  for (const [index, x, y] of [[0, 0, 0], [1, 1, 0], [2, 0, 1], [3, 1, 1]]) {
    const config = configure({mode: 'morph'}); config.morph.x = x; config.morph.y = y;
    engine.setConfig(config);
    assert.deepEqual(engine.update(frame()).settings, config.morph.corners[index].settings);
  }
  const config = configure({mode: 'morph'}); config.morph.x = config.morph.y = .5;
  engine.setConfig(config); const result = engine.update(frame());
  for (const key of Object.keys(defaults)) close(result.settings[key], config.morph.corners.reduce((sum, item) => sum + item.settings[key], 0) / 4);
});
check('Morph clamps coordinates and is continuous between adjacent positions', () => {
  const engine = createDirectorEngine(), config = configure({mode: 'morph'});
  config.morph.x = 20; config.morph.y = -10; engine.setConfig(config);
  assert.deepEqual(engine.update(frame()).xy, {x: 1, y: 0});
  config.morph.x = .3; config.morph.y = .4; engine.setConfig(config); const a = engine.update(frame());
  config.morph.x += 1e-5; engine.setConfig(config); const b = engine.update(frame());
  for (const key of Object.keys(defaults)) assert.ok(Math.abs(a.settings[key] - b.settings[key]) < 3e-5);
});
check('Each route has bounded signed depth and never accumulates frame drift', () => {
  for (const metadata of DIRECTOR_TARGETS) for (const sign of [-1, 1]) {
    const engine = createDirectorEngine(); engine.setConfig(configure({routes: [route('bass', metadata.id, sign)]}));
    const input = levelFrame({dt: 1, scene: metadata.scene || 'record'});
    let result;
    for (let index = 0; index < 15; index++) result = engine.update(input);
    const spec = schema[metadata.id];
    close(result.settings[metadata.id], Math.max(spec.min, Math.min(spec.max, defaults[metadata.id] + sign * .35 * (spec.max - spec.min))), 1e-8);
    const settled = result.settings[metadata.id];
    for (let index = 0; index < 1000; index++) result = engine.update(input);
    close(result.settings[metadata.id], settled, 1e-8);
  }
});
check('All six supplied real sources drive routes; unknown/NaN sources do not', () => {
  for (const item of DIRECTOR_SOURCES) {
    const engine = createDirectorEngine(); engine.setConfig(configure({routes: [route(item.id, 'exposure', .5)]}));
    const result = engine.update(frame({dt: 1, signals: {[item.id]: 1}}));
    assert.ok(result.settings.exposure > defaults.exposure);
    for (const other of DIRECTOR_SOURCES) if (other.id !== item.id) assert.equal(result.signals[other.id], 0);
  }
  const engine = createDirectorEngine(); engine.setConfig(configure({routes: [route()]}));
  assert.deepEqual(engine.update(frame({signals: {bass: NaN, fake: 1}})).settings, defaults);
});
check('Scene-specific routes apply only to their own world', () => {
  for (const metadata of DIRECTOR_TARGETS.filter(item => item.scene)) {
    const engine = createDirectorEngine(); engine.setConfig(configure({routes: [route('bass', metadata.id)]}));
    const scene = metadata.scene === 'record' ? 'aurora' : 'record';
    assert.deepEqual(engine.update(levelFrame({scene})).settings, defaults);
    assert.notEqual(engine.update(levelFrame({scene: metadata.scene})).settings[metadata.id], defaults[metadata.id]);
  }
});
check('Disabled, zero-depth and zero-pulse routes are exact neutral', () => {
  for (const change of [{enabled: false}, {amount: 0}]) {
    const engine = createDirectorEngine(); engine.setConfig(configure({routes: [{...route(), ...change}]}));
    assert.deepEqual(engine.update(levelFrame()).settings, defaults);
  }
  const engine = createDirectorEngine(); engine.setConfig(configure({routes: [route('pulse')]}));
  assert.deepEqual(engine.update(frame({signals: {energy: 1, pulse: 0}})).settings, defaults);
});
check('Follow uses only real energy and centroid, eases, and holds on pause', () => {
  const engine = createDirectorEngine(); engine.setConfig(configure({mode: 'morph', follow: true}));
  for (let index = 0; index < 120; index++) assert.deepEqual(engine.update(frame()).xy, {x: 0, y: 0});
  const first = engine.update(frame({signals: {energy: 1, centroid: .5}}));
  assert.ok(first.xy.x > 0 && first.xy.x < 1 && first.xy.y > 0 && first.xy.y < .5);
  let last;
  for (let index = 0; index < 600; index++) last = engine.update(frame({signals: {energy: 1, centroid: .5}}));
  close(last.xy.x, 1, 1e-8); close(last.xy.y, .5, 1e-8);
  assert.deepEqual(engine.update(levelFrame({playing: false})).xy, last.xy);
});
check('Follow exits through explicit pointer configuration and updates while Motion off', () => {
  const engine = createDirectorEngine(); engine.setConfig(configure({mode: 'morph', follow: true}));
  engine.update(levelFrame());
  const config = configure({mode: 'morph', follow: false}); config.morph.x = .23; config.morph.y = .68;
  engine.setConfig(config);
  assert.deepEqual(engine.update(levelFrame({motion: false})).xy, {x: .23, y: .68});
});
check('Motion off freezes settings/scene/xy/signals despite time and fresh sound', () => {
  const engine = createDirectorEngine(); engine.setConfig(configure({mode: 'morph', follow: true, routes: [route()]}));
  const before = engine.update(levelFrame());
  for (let index = 0; index < 60; index++) {
    const after = engine.update(frame({motion: false, time: index + 20, dt: 1}));
    for (const key of ['settings', 'scene', 'xy', 'signals']) assert.deepEqual(after[key], before[key]);
    assert.match(after.status, /Motion is off/u);
  }
  assert.notDeepEqual(engine.update(levelFrame()).settings, before.settings);
});
check('Static base and optics edits apply while frozen without advancing follow', () => {
  const engine = createDirectorEngine(); const config = configure({mode: 'morph', follow: true}); engine.setConfig(config);
  const first = engine.update(levelFrame());
  config.optics = {dispersion: .6, streak: .2, grain: .1}; engine.setConfig(config);
  const edited = engine.update(frame({motion: false, time: 99, dt: 1}));
  assert.deepEqual(edited.xy, first.xy); assert.deepEqual(edited.settings, first.settings); assert.deepEqual(edited.optics, config.optics);
  engine.setConfig(configure({mode: 'manual'}));
  assert.equal(engine.update(frame({motion: false, baseSettings: {...defaults, exposure: 1.4}})).settings.exposure, 1.4);
});
check('Repeated equivalent setConfig calls do not reset follow or modulation envelopes', () => {
  const a = createDirectorEngine(), b = createDirectorEngine();
  const config = configure({mode: 'morph', follow: true, routes: [route()]}); a.setConfig(config); b.setConfig(config);
  for (let index = 0; index < 50; index++) {
    b.setConfig(clone(config));
    assert.deepEqual(b.update(levelFrame()), a.update(levelFrame()));
  }
});
check('Pause releases modulation smoothly to base and retains no accumulated offset', () => {
  const engine = createDirectorEngine(); engine.setConfig(configure({routes: [route()]}));
  let before;
  for (let index = 0; index < 60; index++) before = engine.update(levelFrame());
  const first = engine.update(levelFrame({playing: false}));
  assert.ok(first.settings.bloom < before.settings.bloom && first.settings.bloom > defaults.bloom);
  let last;
  for (let index = 0; index < 360; index++) last = engine.update(levelFrame({playing: false}));
  close(last.settings.bloom, defaults.bloom, 1e-8);
});
check('Score boundaries, smoothstep duration and deterministic seeks use absolute track time', () => {
  const config = configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 10, 1.6, 'aurora', 4), cue('cue-b', 20, .6, 'orbital', 2)]});
  const engine = createDirectorEngine(); engine.setConfig(config);
  const at = time => engine.update(frame({time, playing: false}));
  assert.deepEqual(at(9).settings, defaults); assert.equal(at(9).activeCueId, null); assert.equal(at(9).scene, 'record');
  assert.equal(at(10).scene, 'aurora'); assert.equal(at(10).settings.exposure, defaults.exposure);
  close(at(11).settings.exposure, defaults.exposure + (1.6 - defaults.exposure) * .15625);
  close(at(12).settings.exposure, (defaults.exposure + 1.6) / 2);
  assert.equal(at(14).settings.exposure, 1.6); assert.equal(at(20).settings.exposure, 1.6);
  close(at(21).settings.exposure, 1.1); assert.equal(at(22).settings.exposure, .6);
  const forward = at(12), backward = at(12); assert.deepEqual(forward, backward);
  at(100); assert.deepEqual(at(12), forward); at(0); assert.deepEqual(at(12), forward);
});
check('Zero duration switches exactly; overlapping transitions follow documented previous cue settings', () => {
  const config = configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 1, 1.6, 'aurora', 20), cue('cue-b', 3, .6, 'liquid', 1), cue('cue-c', 8, 1.3, 'record', 0)]});
  const engine = createDirectorEngine(); engine.setConfig(config);
  assert.equal(engine.update(frame({time: 3})).settings.exposure, 1.6);
  assert.equal(engine.update(frame({time: 8})).settings.exposure, 1.3);
});
check('Score Motion freeze survives optics edits and resumes at actual audio time', () => {
  const config = configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 1, 1.6, 'aurora', 2), cue('cue-b', 10, .6, 'liquid') ]});
  const engine = createDirectorEngine(); engine.setConfig(config);
  const initial = engine.update(frame({time: 2}));
  assert.deepEqual(engine.update(frame({time: 15, motion: false})).settings, initial.settings);
  config.optics.grain = .5; engine.setConfig(config);
  const held = engine.update(frame({time: 15, motion: false}));
  assert.deepEqual(held.settings, initial.settings); assert.equal(held.scene, 'aurora'); assert.equal(held.optics.grain, .5);
  const resumed = engine.update(frame({time: 15})); assert.equal(resumed.activeCueId, 'cue-b'); assert.equal(resumed.scene, 'liquid');
});
check('Score missing track/cues/mismatch return exact base and correct status', () => {
  for (const [patch, text] of [[{scoreTrackId: null}, 'needs a track'], [{scoreTrackId: 'track-2'}, 'another song'], [{cues: []}, 'Add a cue']]) {
    const engine = createDirectorEngine(); engine.setConfig(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 0, 1.6)], routes: [route()], ...patch}));
    const result = engine.update(levelFrame()); assert.deepEqual(result.settings, defaults); assert.equal(result.activeCueId, null); assert.match(result.status, new RegExp(text));
  }
});
check('Explicit track changes bypass a bound score even with Motion off', () => {
  const engine = createDirectorEngine(); engine.setConfig(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 0, 1.6, 'liquid')]}));
  engine.update(frame());
  const changed = engine.update(frame({trackId: 'track-2', motion: false}));
  assert.deepEqual(changed.settings, defaults); assert.equal(changed.scene, 'record'); assert.match(changed.status, /another song/u);
  const restored = engine.update(frame({trackId: 'track-1', motion: false, time: 10}));
  assert.equal(restored.scene, 'liquid'); assert.equal(restored.settings.exposure, 1.6);
});
check('Before the first cue score mode is exact base even with enabled routes', () => {
  const engine = createDirectorEngine();
  engine.setConfig(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 10, 1.6)], routes: [route()]}));
  const result = engine.update(levelFrame({time: 4}));
  assert.deepEqual(result.settings, defaults); assert.equal(result.scene, 'record'); assert.equal(result.activeCueId, null);
});
check('Sanitizer caps values, repairs IDs, strips unknowns and resolves duplicate times deterministically', () => {
  const config = sanitizeDirectorConfig({mode: 'morph', follow: true,
    morph: {x: 5, y: -2}, routes: [{...route(), id: '__proto__', amount: 8}, {...route(), id: '__proto__', amount: -8}],
    cues: [cue('cue-z', 4, 1.2), cue('cue-a', 2, 1.5), cue('cue-z', 4, .8), cue('cue-bad', NaN, 1.5)],
    optics: {dispersion: 9, streak: -3, grain: NaN}, camera: {mode: 'arc', amount: 99}, unknown: 1});
  assert.deepEqual([config.morph.x, config.morph.y], [1, 0]);
  assert.deepEqual(config.routes.map(item => item.amount), [1, -1]);
  assert.equal(new Set(config.routes.map(item => item.id)).size, 2);
  assert.deepEqual(config.cues.map(item => item.time), [2, 4]); assert.equal(config.cues[1].settings.exposure, .8);
  assert.deepEqual(config.optics, {dispersion: 1, streak: 0, grain: 0}); assert.equal(config.camera.amount, 1); assert.equal(config.unknown, undefined);
});
check('Sanitizer limits24 cues/4 routes and48-character labels', () => {
  const config = sanitizeDirectorConfig({cues: Array.from({length: 40}, (_, index) => ({...cue(`cue-${index}`, index, 1.5), label: 'x'.repeat(80)})), routes: Array.from({length: 10}, () => route())});
  assert.equal(config.cues.length, 24); assert.equal(config.routes.length, 4); assert.equal(config.cues[0].label.length, 48);
});
check('Inputs and returned values cannot mutate config, defaults or future engine output', () => {
  const config = configure({mode: 'morph'}), engine = createDirectorEngine(); engine.setConfig(config);
  config.morph.corners[0].settings.exposure = 1.7;
  const first = engine.update(frame()); const expected = first.settings.exposure; first.settings.exposure = 0;
  assert.equal(engine.update(frame({motion: false})).settings.exposure, expected);
  assert.equal(directorDefaults.mode, 'manual'); assert.equal(defaults.exposure, 1.05);
});
check('Safe store reads without writes, uses only its key and merges latest peer state', () => {
  let saved = null, writes = 0; const keys = [];
  const adapter = {get(key, fallback) { keys.push(key); return saved ?? fallback; }, set(key, value) { keys.push(key); writes++; saved = clone(value); return true; }};
  const a = createDirectorStore(adapter), b = createDirectorStore(adapter);
  assert.deepEqual(a.read(), sanitizeDirectorConfig(null)); assert.equal(writes, 0);
  assert.equal(a.patch({mode: 'morph'}).ok, true);
  assert.equal(b.patch({optics: {dispersion: .5, streak: .2, grain: 0}}).ok, true);
  assert.equal(a.patch({camera: {mode: 'arc', amount: .8}}).ok, true);
  assert.equal(saved.mode, 'morph'); assert.equal(saved.optics.dispersion, .5); assert.equal(saved.camera.mode, 'arc');
  assert.ok(keys.every(key => key === DIRECTOR_STORAGE_KEY));
  assert.equal(a.patch({optics: {grain: .6}}).config.optics.dispersion, 0, 'Nested config replaces, it does not deep-merge.');
});
check('Store rejects unknown/nonfinite/accessor/prototype/malformed nested mutations without writes', () => {
  let writes = 0, executed = false; const saved = configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 0, 1.3)]});
  const store = createDirectorStore({get() { return saved; }, set() { writes++; return true; }});
  const accessor = {}; Object.defineProperty(accessor, 'mode', {enumerable: true, get() { executed = true; return 'morph'; }});
  const invalid = [{unknown: 1}, {optics: {grain: NaN}}, {optics: {grain: '1'}}, {camera: {mode: 'fly'}},
    {routes: [route('fake')]}, {cues: [{...cue('cue-a', 0, 1.3), settings: {exposure: NaN}}]},
    {routes: Array.from({length: 5}, () => route())}, accessor, JSON.parse('{"__proto__":{"polluted":true}}')];
  for (const patch of invalid) { const result = store.patch(patch); assert.equal(result.ok, false); assert.equal(result.accepted, false); assert.equal(result.config.cues.length, 1); }
  assert.equal(writes, 0); assert.equal(executed, false); assert.equal({}.polluted, undefined);
});
check('Malformed stored config is recovered without mutation or accessor execution', () => {
  let writes = 0, reads = 0, executed = false;
  const malformed = {mode: 'wrong', cues: [null], optics: {grain: NaN}};
  Object.defineProperty(malformed, 'morph', {enumerable: true, get() { executed = true; return {}; }});
  const store = createDirectorStore({get() { reads++; return malformed; }, set() { writes++; return true; }});
  const result = store.read(); assert.equal(result.mode, 'manual'); assert.deepEqual(result.cues, []);
  assert.equal(writes, 0); assert.equal(reads, 1); assert.equal(executed, false);
});
check('Write failures return a truthful transient candidate; failed reads never overwrite storage', () => {
  for (const setter of [() => false, () => undefined, () => { throw new Error('quota'); }]) {
    const store = createDirectorStore({get() { return null; }, set: setter});
    const result = store.patch({mode: 'morph'}); assert.equal(result.ok, false); assert.notEqual(result.accepted, false); assert.equal(result.config.mode, 'morph'); assert.match(result.error, /temporary/u);
    assert.equal(store.read().mode, 'manual');
  }
  let writes = 0;
  const store = createDirectorStore({get() { throw new Error('blocked'); }, set() { writes++; return true; }});
  const result = store.patch({follow: true}); assert.equal(result.ok, false); assert.equal(result.config.follow, true); assert.equal(writes, 0);
});
check('Engine module has no own DOM/render/audio/RAF/network side effects', () => {
  assert.doesNotMatch(original, /\b(document|window|requestAnimationFrame|AudioContext|fetch|XMLHttpRequest|setInterval|setTimeout)\s*[.(]/u);
  assert.equal(Object.keys(module).sort().join(','), ['DIRECTOR_DEFAULTS', 'DIRECTOR_SOURCES', 'DIRECTOR_STORAGE_KEY', 'DIRECTOR_TARGETS', 'createDirectorEngine', 'createDirectorStore', 'sanitizeDirectorConfig'].sort().join(','));
});

console.log(JSON.stringify({passed: tests.length, tests,
  engineSha256: createHash('sha256').update(original).digest('hex'),
  schemaSha256: createHash('sha256').update(await readFile(production)).digest('hex'),
  limit: 'Actual pure-module function evidence only. Parent must verify integrated real audio, controls, storage and rendered scenes.'}, null, 2));
