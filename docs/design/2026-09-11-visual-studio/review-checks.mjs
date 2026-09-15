import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const root = new URL('../../../', import.meta.url);
const site = new URL('website_html_templates/', root);
const source = name => readFileSync(new URL(name, site), 'utf8');
const uiSource = source('player-three-visual-studio.js');
const sceneSource = source('player-three-scene.js');
const {VISUAL_DEFAULTS, VISUAL_PRESETS, VISUAL_STORAGE_KEY, createVisualStore} = await import(new URL('player-three-visual-settings.js', site));
const THREE = await import(new URL('vendor/three/build/three.module.js', site));
const checks = [];
const check = (name, run) => {run(); checks.push({name, pass: true});};
const between = (value, start, end) => {
  const from = value.indexOf(start); const to = value.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Cannot isolate current source: ${start}`);
  return value.slice(from, to);
};
const fn = (start, end) => between(uiSource, `  function ${start}`, `  function ${end}`);
const handler = prefix => {
  const line = uiSource.split(/\r?\n/).find(line => line.trim().startsWith(prefix));
  assert.ok(line, `Current handler missing: ${prefix}`); return line;
};

function createController() {
  let persisted = null, writable = true;
  const adapter = {get: (_key, fallback) => persisted ? structuredClone(persisted) : fallback,
    set: (_key, value) => {if (!writable) return false; persisted = structuredClone(value); return true;}};
  const store = createVisualStore(adapter);
  // The application uses one realm; clone object arguments back across this VM
  // test boundary so the store's deliberate plain-object check sees that shape.
  const bridge = Object.fromEntries(Object.entries(store).map(([key, action]) =>
    [key, (...args) => action(...args.map(value => value && typeof value === 'object' ? structuredClone(value) : value))]));
  const nodes = new Map(); const messages = []; const windowEvents = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, {value: '', hidden: false, disabled: false, attributes: {},
      focus() {}, setAttribute(key, value) {this.attributes[key] = value;},
      replaceChildren() {}, add() {}, append() {}});
    return nodes.get(key);
  };
  // This isolates the actual controller functions/handlers with a recording DOM
  // boundary. It is not browser/layout/WebGL verification, which remains parent-owned.
  const context = {store: bridge, VISUAL_DEFAULTS, VISUAL_PRESETS, VISUAL_STORAGE_KEY,
    q: node, toast: text => messages.push(text), document: {createElement: () => ({append() {}})},
    Option: class {constructor(text, value) {this.text = text; this.value = value;}},
    window: {addEventListener: (name, fn) => windowEvents.set(name, fn)}};
  const script = `
    let state=store.read(),settings={...state.settings},comparing=false,selectedId=null;
    const dirty=new Map(),rows=new Map(); let preview=null;
    const apply=()=>{preview={...(comparing?VISUAL_DEFAULTS:settings)};};
    const refreshScene=()=>{};
    ${fn('selectedPreset', 'render')}
    ${fn('render', 'outcome')}
    ${fn('outcome', 'patch')}
    ${fn('patch', 'replace')}
    ${fn('replace', 'refreshScene')}
    ${handler("q('#studio-preset').onchange")}
    ${handler("q('#studio-compare').onclick")}
    ${handler("q('#studio-reset').onclick")}
    ${handler("q('#studio-save-form').onsubmit")}
    ${handler("q('#studio-delete').onclick")}
    ${handler("window.addEventListener('storage'")}
    render();apply();
    ({patch,inspect:()=>({settings:{...settings},preview:{...preview},dirty:dirty.size,selected: q('#studio-preset').value,deleteHidden:q('#studio-delete').hidden,status:q('#studio-status').textContent}),
      save:name=>{q('#studio-look-name').value=name;q('#studio-save-form').onsubmit({preventDefault(){}});},
      select:id=>q('#studio-preset').onchange({target:{value:id}}),
      delete:()=>q('#studio-delete').onclick(),compare:()=>q('#studio-compare').onclick(),reset:()=>q('#studio-reset').onclick()});
  `;
  const controller = vm.runInNewContext(script, context);
  return {controller, store, messages, adapter,
    setWritable(value) {writable = value;},
    storageEvent() {windowEvents.get('storage')({key: VISUAL_STORAGE_KEY});}};
}

check('Original-equivalent custom look stays explicitly selected and can be deleted', () => {
  const {controller: ui, store} = createController();
  ui.save('My Original');
  const id = store.read().presets[0].id;
  assert.equal(ui.inspect().selected, id); assert.equal(ui.inspect().deleteHidden, false);
  ui.select('original'); assert.equal(ui.inspect().deleteHidden, true);
  ui.select(id); assert.equal(ui.inspect().selected, id); assert.equal(ui.inspect().deleteHidden, false);
  ui.delete(); assert.equal(store.read().presets.length, 0); assert.equal(ui.inspect().selected, 'original');
});

check('Two identical custom looks remain independently selectable and deletable', () => {
  const {controller: ui, store} = createController();
  ui.patch('exposure', 1.32); ui.save('First'); ui.save('Second');
  const [first, second] = store.read().presets;
  assert.equal(ui.inspect().selected, second.id);
  ui.select(first.id); assert.equal(ui.inspect().selected, first.id);
  ui.delete(); assert.deepEqual(store.read().presets.map(look => look.id), [second.id]);
  ui.select(second.id); ui.delete(); assert.equal(store.read().presets.length, 0);
});

check('Consecutive failed setting changes remain live and recover alongside latest other-tab fields', () => {
  const session = createController(); const ui = session.controller;
  session.setWritable(false); ui.patch('exposure', 1.45); ui.patch('particles', .2);
  assert.equal(ui.inspect().settings.exposure, 1.45); assert.equal(ui.inspect().settings.particles, .2);
  assert.equal(ui.inspect().dirty, 2); assert.match(ui.inspect().status, /not saved/);
  assert.equal(session.store.read().settings.exposure, 1.05);
  session.setWritable(true);
  createVisualStore(session.adapter).patch('saturation', .6);
  session.storageEvent();
  assert.equal(ui.inspect().settings.exposure, 1.45); assert.equal(ui.inspect().settings.saturation, .6);
  ui.patch('vignette', .3);
  const saved = session.store.read().settings;
  assert.equal(saved.exposure, 1.45); assert.equal(saved.particles, .2);
  assert.equal(saved.saturation, .6); assert.equal(saved.vignette, .3); assert.equal(ui.inspect().dirty, 0);
});

check('Failed custom save creates no ghost saved look and leaves live temporary settings intact', () => {
  const session = createController(); const ui = session.controller;
  session.setWritable(false); ui.patch('bloom', .5); ui.save('Unsaved');
  assert.equal(session.store.read().presets.length, 0);
  assert.equal(ui.inspect().deleteHidden, true); assert.equal(ui.inspect().settings.bloom, .5);
  assert.match(ui.inspect().status, /not saved/); assert.ok(session.messages.some(text => /temporary/.test(text)));
});

check('Compare is temporary and reset selects exact Original without deleting custom looks', () => {
  const {controller: ui, store} = createController();
  ui.patch('bloom', 1.8); ui.save('Bright'); ui.compare();
  assert.equal(ui.inspect().preview.bloom, 1); assert.equal(ui.inspect().settings.bloom, 1.8);
  assert.equal(store.read().settings.bloom, 1.8);
  ui.compare(); assert.equal(ui.inspect().preview.bloom, 1.8);
  ui.reset(); assert.equal(ui.inspect().selected, 'original');
  assert.deepEqual(store.read().settings, VISUAL_DEFAULTS); assert.equal(store.read().presets.length, 1);
});

check('Prism framing covers both endpoints while retaining its safe camera position and exact default', () => {
  const resetSource = between(sceneSource, '  function reset(){', 'reset();\n  function tick').replace(/\s*}$/, '}');
  const camera = new THREE.PerspectiveCamera(38, 2, .1, 100);
  const controls = {target: new THREE.Vector3(), update() {}};
  const view = {target: [0, 2.75, -18], direction: [0, 0, 1], distance: 24.5,
    fitRadius: 4.8, aspectFit: false, minDistance: 22.5, maxDistance: 25};
  const context = {THREE, camera, controls, collection: {view}, host: {clientWidth: 460, clientHeight: 200},
    model: 'liquid', look: {...VISUAL_DEFAULTS}};
  vm.createContext(context); vm.runInContext(resetSource, context);
  for (const framing of [.75, 1, 1.35]) {
    context.look.framing = framing; vm.runInContext('reset()', context);
    assert.equal(camera.zoom, framing); assert.equal(camera.position.distanceTo(controls.target), 24.5);
  }
  context.model = 'record'; context.collection.view = null; context.look.framing = 1;
  vm.runInContext('reset()', context); assert.equal(camera.zoom, 1);
});

check('Reflection strength multiplies radiance and defaults to1 instead of recoloring the reflector', () => {
  const uniformLine = sceneSource.split(/\r?\n/).find(line => line.includes('uniforms.reflectionStrength={'));
  const shaderLine = sceneSource.split(/\r?\n/).find(line => line.includes('fragmentShader=reflector'));
  const fragment = source('vendor/three/examples/jsm/objects/Reflector.js');
  const originalFragment = fragment.match(/fragmentShader: \/\* glsl \*\/`([\s\S]*?)`/)[1];
  const reflector = {material: {uniforms: {}, fragmentShader: originalFragment}};
  vm.runInNewContext(`${uniformLine}\n${shaderLine}`, {reflector});
  assert.equal(reflector.material.uniforms.reflectionStrength.value, 1);
  assert.match(reflector.material.fragmentShader, /blendOverlay\( base\.rgb, color \) \* reflectionStrength/);
  assert.ok(sceneSource.includes('uniforms.reflectionStrength.value=look.recordReflect'));
  assert.ok(!sceneSource.includes('multiplyScalar(look.recordReflect)'));
});

check('Transient impact is explicitly unavailable for Record and orbit speed for composed views', () => {
  const refresh = fn('refreshScene', 'showTab');
  const rows = new Map(['orbitSpeed', 'pulseGain'].map(key => [key, {dataset: {},
    input: {}, hint: {}, querySelector(selector) {return selector === 'input' ? this.input : this.hint;}}]));
  const state = {model: 'record'};
  const context = {q: () => ({}), rows, getScene: id => ({name: id}), getModel: () => state.model,
    help: {pulseGain: 'Strength of waves triggered by musical transients.'}};
  vm.runInNewContext(`${refresh}\nrefreshScene();`, context);
  assert.equal(rows.get('pulseGain').input.disabled, true); assert.equal(rows.get('orbitSpeed').input.disabled, false);
  for (const id of ['aurora', 'orbital', 'liquid']) {
    state.model = id; vm.runInNewContext(`${refresh}\nrefreshScene();`, context);
    assert.equal(rows.get('pulseGain').input.disabled, false);
    assert.equal(rows.get('orbitSpeed').input.disabled, ['orbital', 'liquid'].includes(id));
  }
});

console.log(JSON.stringify({scope: 'Installed source controller and camera invariants; not actual DOM or WebGL verification',
  files: Object.fromEntries(['player-three-visual-studio.js', 'player-three-scene.js'].map(name => [name,
    createHash('sha256').update(source(name)).digest('hex')])), passed: checks.length, checks}, null, 2));
