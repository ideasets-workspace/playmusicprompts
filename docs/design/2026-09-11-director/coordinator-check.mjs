import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';

const here = fileURLToPath(new URL('.', import.meta.url));
const website = resolve(here, '../../../website_html_templates');
const source = await readFile(resolve(website, 'player-three-performance.js'), 'utf8');
const readMain = await readFile(resolve(website, 'player-three.js'), 'utf8');
const engineUrl = pathToFileURL(resolve(website, 'player-three-director.js')).href;
const visualUrl = pathToFileURL(resolve(website, 'player-three-visual-settings.js')).href;
const {VISUAL_DEFAULTS: defaults} = await import(visualUrl);
const {DIRECTOR_STORAGE_KEY: key, DIRECTOR_DEFAULTS, sanitizeDirectorConfig} = await import(engineUrl);
const boundary = {ui: null};
globalThis.__directorCoordinatorBoundary = boundary;
const uiModule = 'data:text/javascript;base64,' + Buffer.from("export function createDirectorControls(args){return globalThis.__directorCoordinatorBoundary.ui(args);}").toString('base64');
const adapted = source.replace("'./player-three-director.js'", JSON.stringify(engineUrl))
  .replace("'./player-three-director-ui.js'", JSON.stringify(uiModule))
  .replace("'./player-three-visual-settings.js'", JSON.stringify(visualUrl));
const {createPerformanceDirector} = await import('data:text/javascript;base64,' + Buffer.from(adapted).toString('base64'));
const clone = value => JSON.parse(JSON.stringify(value));
const previousWindow = globalThis.window;
const events = new EventTarget(), listeners = new Set();
globalThis.window = {
  addEventListener(type, listener) {events.addEventListener(type, listener); listeners.add(listener);},
  removeEventListener(type, listener) {events.removeEventListener(type, listener); listeners.delete(listener);}
};
const emitStorage = changedKey => {const event = new Event('storage'); Object.defineProperty(event, 'key', {value: changedKey}); events.dispatchEvent(event);};
const configure = patch => sanitizeDirectorConfig({...clone(DIRECTOR_DEFAULTS), ...patch});
const route = {id: 'route-test', enabled: true, source: 'bass', target: 'bloom', amount: .5};
const cue = (id, time, exposure, scene = 'liquid', duration = 0) => ({id, time, label: id, scene, duration, settings: {...defaults, exposure}});
const active = new Set();
function setup(initial = null) {
  const saved = new Map(initial ? [[key, clone(initial)]] : []), reads = [], writes = [], rooms = [], performances = [], selections = [], uiFrames = [];
  const state = {base: {...defaults}, manual: 'record', scene: 'record', track: {id: 'track-1', title: 'Boundary song'}, failWrite: false, failRead: false, roomReady: true, activated: 0, refreshes: 0, disposed: 0, captureCalls: 0, seeks: []};
  const audio = {currentTime: 0, duration: 120, paused: true, ended: false, readyState: 4};
  const storage = {get(storageKey, fallback) {reads.push(storageKey); if (state.failRead) throw Error('read unavailable'); return saved.has(storageKey) ? clone(saved.get(storageKey)) : fallback;},
    set(storageKey, value) {writes.push({key: storageKey, value: clone(value)}); if (state.failWrite) return false; saved.set(storageKey, clone(value)); return true;}};
  const room = {diagnostics: {motion: true, signals: {bass: 1, mid: .2, treble: .3, energy: .8, pulse: .1, centroid: .4}},
    setVisualSettings(settings, options) {rooms.push({settings: clone(settings), options: clone(options)});},
    setPerformance(settings) {performances.push(clone(settings));},
    async captureFrame() {state.captureCalls++; return new Blob(['boundary-frame'], {type: 'image/png'});}};
  let controls;
  boundary.ui = args => {controls = args; return {update(live) {uiFrames.push(clone(live));}, refresh() {state.refreshes++;}, dispose() {state.disposed++;}};};
  let director;
  director = createPerformanceDirector({container: {}, storage, getRoom: () => state.roomReady ? room : null,
    getBase: () => state.base, getScene: () => state.scene, getManualScene: () => state.manual, getTrack: () => state.track, audio,
    seek(time) {state.seeks.push(time); audio.currentTime = Math.max(0, Math.min(audio.duration, time));},
    onScene(scene) {state.scene = scene; selections.push(scene);}, toast() {},
    onActivate() {state.activated++; director?.setComparing(false);}});
  active.add(director);
  let now = performance.now();
  const tick = (seconds = .02) => {now += seconds * 1000; director.tick(now); return director.live;};
  const cleanup = () => {director.dispose(); active.delete(director);};
  return {director, controls, state, saved, reads, writes, room, rooms, performances, selections, uiFrames, audio, tick, cleanup};
}
const results = [];
const check = async (name, work) => {
  try {await work(); results.push({name, passed: true});}
  catch (error) {results.push({name, passed: false, error: error.message});}
  finally {for (const director of active) director.dispose(); active.clear();}
};

await check('Initialization and neutral ticks only read Director storage; all29 saved settings remain exact', () => {
  const test = setup(); assert.equal(test.writes.length, 0); assert.deepEqual(test.director.config, configure({}));
  const initial = test.tick(); assert.deepEqual(initial.settings, defaults); assert.equal(test.selections.length, 0);
  for (let index = 0; index < 120; index++) test.tick();
  assert.equal(test.writes.length, 0); assert.ok(test.reads.every(value => value === key));
  assert.equal(test.rooms.length, 1, 'Neutral frames must not reapply unchanged visuals.');
  assert.deepEqual(test.rooms[0].options, {continuous: true});
});
await check('Audio modulation is ephemeral and paused/ended/unready audio cannot inject new sound', () => {
  const test = setup(configure({routes: [route]})); test.audio.paused = false;
  for (let index = 0; index < 100; index++) test.tick();
  assert.ok(test.director.live.settings.bloom > defaults.bloom); assert.equal(test.writes.length, 0); assert.deepEqual(test.state.base, defaults);
  test.audio.paused = true; const before = test.director.live.settings.bloom; test.tick(); assert.ok(test.director.live.settings.bloom < before);
  test.audio.paused = false; test.audio.ended = true;
  for (let index = 0; index < 400; index++) test.tick(); assert.ok(Math.abs(test.director.live.settings.bloom - defaults.bloom) < 1e-8);
  test.audio.ended = false; test.audio.readyState = 2; test.tick(); assert.ok(Math.abs(test.director.live.settings.bloom - defaults.bloom) < 1e-8);
});
await check('Latest peer top-level settings survive a local explicit change and no other store is written', () => {
  const test = setup(); test.saved.set(key, configure({camera: {mode: 'arc', amount: .8}}));
  const result = test.controls.commit({mode: 'morph'}); assert.equal(result.ok, true);
  assert.equal(result.config.camera.mode, 'arc'); assert.equal(result.config.mode, 'morph');
  assert.ok(test.writes.every(write => write.key === key)); assert.equal(test.state.activated, 1);
});
await check('Failed writes retain previous unsaved edits, then merge latest peer fields on successful retry', () => {
  const test = setup(); test.state.failWrite = true;
  assert.equal(test.controls.commit({mode: 'morph'}).ok, false);
  assert.equal(test.controls.commit({optics: {dispersion: .3, streak: .4, grain: .2}}).ok, false);
  assert.equal(test.director.config.mode, 'morph'); assert.equal(test.director.config.optics.streak, .4);
  test.saved.set(key, configure({camera: {mode: 'arc', amount: .7}})); test.state.failWrite = false;
  const result = test.controls.commit({follow: true}); assert.equal(result.ok, true);
  assert.equal(result.config.mode, 'morph'); assert.equal(result.config.optics.streak, .4); assert.equal(result.config.camera.amount, .7);
  assert.equal(result.config.follow, true);
});
await check('Storage events merge dirty fields without writes and ignore unrelated playback/session events', () => {
  const test = setup(); test.state.failWrite = true; test.controls.commit({mode: 'morph'}); const before = test.writes.length;
  test.saved.set(key, configure({optics: {dispersion: .6, streak: .1, grain: .2}})); emitStorage(key);
  assert.equal(test.director.config.mode, 'morph'); assert.equal(test.director.config.optics.dispersion, .6); assert.equal(test.writes.length, before);
  const refreshes = test.state.refreshes; emitStorage('pmp.room.session.v2'); assert.equal(test.state.refreshes, refreshes);
  test.saved.set(key, configure({camera: {mode: 'breathe', amount: .6}})); emitStorage(null);
  assert.equal(test.director.config.mode, 'morph'); assert.equal(test.director.config.camera.mode, 'breathe'); assert.equal(test.writes.length, before);
});
await check('Rejected invalid patch cannot poison future valid changes or dirty merge', () => {
  const test = setup(); assert.equal(test.controls.commit({mode: 'invalid'}).ok, false);
  const next = test.controls.commit({optics: {dispersion: .5, streak: 0, grain: 0}});
  assert.equal(next.ok, true, 'Invalid rejected mode must not remain in dirty map and reject every later edit.');
  assert.equal(next.config.mode, 'manual'); assert.equal(next.config.optics.dispersion, .5);
});
await check('Rejected input preserves existing transient accepted edits before the next valid retry', () => {
  const test = setup(); test.state.failWrite = true; test.controls.commit({mode: 'morph'});
  assert.equal(test.controls.commit({mode: 'invalid'}).ok, false);
  assert.equal(test.director.config.mode, 'morph', 'Rejected input must not replace live transient config with persisted defaults.');
  test.state.failWrite = false;
  const result = test.controls.commit({camera: {mode: 'arc', amount: .5}});
  assert.equal(result.ok, true); assert.equal(result.config.mode, 'morph'); assert.equal(result.config.camera.mode, 'arc');
});
await check('Manual bypass disables active performance without changing saved base, track or scene preference', () => {
  const test = setup(configure({mode: 'morph', follow: true, routes: [route]}));
  test.audio.paused = false; test.tick(); const base = clone(test.state.base), track = clone(test.state.track);
  test.director.bypass(); assert.equal(test.director.config.mode, 'manual'); assert.equal(test.director.config.follow, false);
  assert.ok(test.director.config.routes.every(item => !item.enabled)); test.tick();
  assert.deepEqual(test.director.live.settings, base); assert.deepEqual(test.state.track, track); assert.equal(test.state.manual, 'record');
  const writes = test.writes.length; test.director.bypass(); assert.equal(test.writes.length, writes);
});
await check('Compare holds engine and neutralizes lens; snapshot is true Original; activation exits Compare', () => {
  const test = setup(configure({mode: 'morph', optics: {dispersion: .5, streak: .4, grain: .3}, camera: {mode: 'arc', amount: .5}}));
  test.tick(); const prior = clone(test.director.live), writes = test.writes.length;
  test.director.setComparing(true); const applied = test.rooms.length;
  assert.deepEqual(test.controls.getSnapshot().settings, defaults);
  for (let index = 0; index < 100; index++) test.tick();
  assert.deepEqual(test.director.live, prior); assert.equal(test.rooms.length, applied); assert.equal(test.writes.length, writes);
  assert.deepEqual(test.performances.at(-1), {optics: {dispersion: 0, streak: 0, grain: 0}, camera: {mode: 'still', amount: 0}});
  test.controls.commit({mode: 'manual'}); test.tick(); assert.deepEqual(test.director.live.settings, defaults);
  assert.deepEqual(test.performances.at(-1).optics, {dispersion: .5, streak: .4, grain: .3});
});
await check('Score receives absolute seek time while leaving manual scene preference and playback untouched', () => {
  const test = setup(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 10, 1.6, 'aurora', 4), cue('cue-b', 40, .6, 'liquid')]}));
  test.audio.currentTime = 12; test.tick(); assert.equal(test.state.scene, 'aurora'); assert.equal(test.state.manual, 'record');
  assert.ok(Math.abs(test.director.live.settings.exposure - 1.325) < 1e-10);
  test.audio.currentTime = 60; test.tick(); assert.equal(test.state.scene, 'liquid'); assert.equal(test.director.live.activeCueId, 'cue-b');
  test.audio.currentTime = 12; test.tick(); assert.equal(test.state.scene, 'aurora'); assert.ok(Math.abs(test.director.live.settings.exposure - 1.325) < 1e-10);
  assert.equal(test.audio.paused, true); assert.equal(test.audio.currentTime, 12); assert.equal(test.writes.length, 0);
});
await check('UI seek delegates to the provided intentional session seek boundary', () => {
  const test = setup(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 20, 1.6)]}));
  test.controls.seek(22); assert.deepEqual(test.state.seeks, [22]); assert.equal(test.audio.currentTime, 22);
  test.tick(); assert.equal(test.director.live.activeCueId, 'cue-a'); assert.equal(test.audio.paused, true);
});
await check('Track mismatch and bypass return to independent manual scene without storing cue scene choices', () => {
  const test = setup(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 0, 1.6)]}));
  test.tick(); assert.equal(test.state.scene, 'liquid'); assert.equal(test.state.manual, 'record');
  test.state.track = {id: 'track-2', title: 'Other boundary song'}; test.tick();
  assert.equal(test.state.scene, 'record'); assert.deepEqual(test.director.live.settings, defaults); assert.equal(test.writes.length, 0);
  test.state.track = {id: 'track-1'}; test.tick(); assert.equal(test.state.scene, 'liquid');
  test.director.bypass(); test.tick(); assert.equal(test.state.scene, 'record'); assert.ok(test.writes.every(write => write.key === key));
});
await check('Motion-off score is held by genuine host diagnostics and static optics edits remain applicable', () => {
  const test = setup(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 0, 1.6, 'aurora'), cue('cue-b', 10, .6)]}));
  test.audio.currentTime = 2; test.tick(); const held = clone(test.director.live.settings);
  test.room.diagnostics.motion = false; test.audio.currentTime = 60; test.tick(); assert.deepEqual(test.director.live.settings, held);
  test.controls.commit({optics: {dispersion: .2, streak: .1, grain: .5}}); test.tick();
  assert.deepEqual(test.director.live.settings, held); assert.equal(test.performances.at(-1).optics.grain, .5);
  test.room.diagnostics.motion = true; test.tick(); assert.equal(test.director.live.activeCueId, 'cue-b');
});
await check('UI receives effective cue snapshot rather than saved base and updates are limited to ~10Hz', () => {
  const test = setup(configure({mode: 'score', scoreTrackId: 'track-1', cues: [cue('cue-a', 0, 1.6)]}));
  for (let index = 0; index < 60; index++) test.tick(1 / 60);
  assert.equal(test.controls.getSnapshot().settings.exposure, 1.6); assert.equal(test.controls.getSnapshot().scene, 'liquid');
  assert.ok(test.uiFrames.length >= 8 && test.uiFrames.length <= 11); assert.equal(test.writes.length, 0);
});
await check('Unavailable room safely defers ticks and gives a truthful capture error', async () => {
  const test = setup(); test.state.roomReady = false; test.tick(); assert.equal(test.rooms.length, 0);
  await assert.rejects(test.controls.captureFrame(), /still opening/u);
  test.state.roomReady = true; test.tick(); assert.equal(test.rooms.length, 1);
});
await check('Capture delegates to the live room Blob and local download boundary without changing audio/storage', async () => {
  const test = setup(); const oldDocument = globalThis.document, oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL, oldTimeout = globalThis.setTimeout;
  const anchor = {clicks: 0, click() {this.clicks++;}}, revoked = [], blobs = [];
  try {
    globalThis.document = {createElement(tag) {assert.equal(tag, 'a'); return anchor;}};
    URL.createObjectURL = blob => {blobs.push(blob); return 'blob:coordinator-boundary';}; URL.revokeObjectURL = url => revoked.push(url);
    globalThis.setTimeout = callback => {callback(); return 0;};
    await test.controls.captureFrame();
    assert.equal(test.state.captureCalls, 1); assert.equal(blobs[0].type, 'image/png'); assert.equal(anchor.clicks, 1);
    assert.match(anchor.download, /^playmusicprompts-record-.+\.png$/u); assert.deepEqual(revoked, ['blob:coordinator-boundary']);
    assert.equal(test.writes.length, 0); assert.equal(test.audio.paused, true);
  } finally {globalThis.document = oldDocument; URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; globalThis.setTimeout = oldTimeout;}
});
await check('Disposal removes the storage listener and disposes UI boundary', () => {
  const before = listeners.size, test = setup(); assert.equal(listeners.size, before + 1);
  test.cleanup(); assert.equal(listeners.size, before); assert.equal(test.state.disposed, 1);
  emitStorage(key); assert.equal(test.state.refreshes, 0);
});
await check('Actual main wiring keeps manual scene separate and persists only explicit scene selection', () => {
  const main = readMain;
  const selection = main.split(/\r?\n/u).find(line => line.startsWith('const sceneSelection=createSceneSelection('));
  const coordinator = main.split(/\r?\n/u).find(line => line.startsWith('performanceDirector=createPerformanceDirector('));
  assert.ok(selection && coordinator, 'Current actual integration lines must exist.');
  const calls = {persist: [], models: [], synchronize: 0, refreshScene: 0, bypass: 0, seeks: []};
  let selectedOptions, performanceOptions;
  const context = {
    $() {return {};}, storage: {}, audio: {}, current: {id: 'track-1', title: 'Actual wiring boundary'},
    visualState: {model: 'record'}, room: {setModel(id) {calls.models.push(id);}},
    manualScene: 'record', performanceDirector: null, visualStudio: {settings: defaults, endCompare() {}, refreshScene() {calls.refreshScene++;}},
    getScene: id => ({id}), persist: scope => calls.persist.push(scope), seekTo: time => calls.seeks.push(time), openPanel() {}, togglePlay() {}, toast() {},
    createSceneSelection(options) {selectedOptions = options; return {synchronize() {calls.synchronize++;}};},
    createPerformanceDirector(options) {performanceOptions = options; return {bypass() {calls.bypass++;}};}
  };
  runInNewContext(selection + '\n' + coordinator, context);
  performanceOptions.onScene('liquid');
  assert.equal(context.visualState.model, 'liquid'); assert.equal(context.manualScene, 'record'); assert.deepEqual(calls.persist, []);
  assert.equal(performanceOptions.getManualScene(), 'record'); assert.equal(performanceOptions.getScene(), 'liquid');
  selectedOptions.onSelect('aurora');
  assert.equal(context.manualScene, 'aurora'); assert.equal(context.visualState.model, 'aurora'); assert.deepEqual(calls.persist, ['model']); assert.equal(calls.bypass, 1);
  assert.equal(performanceOptions.getTrack().id, 'track-1');
  performanceOptions.seek(34); assert.deepEqual(calls.seeks, [34], 'Intentional cue seek must reach the existing seekTo boundary.');
});

globalThis.window = previousWindow; delete globalThis.__directorCoordinatorBoundary;
console.log(JSON.stringify({passed: results.filter(item => item.passed).length, failed: results.filter(item => !item.passed).length, results,
  coordinatorSha256: createHash('sha256').update(source).digest('hex'),
  evidenceBoundary: 'Executes actual coordinator and production engine/store/schema. UI, room and browser download are explicit host boundaries, not actual renderer or DOM verification.'}, null, 2));
if (results.some(item => !item.passed)) process.exitCode = 1;
