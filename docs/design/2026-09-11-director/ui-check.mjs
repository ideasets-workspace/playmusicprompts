// Behavior checks for actual UI functions with a minimal DOM boundary facade.
// These do not simulate a browser, layout, WebGL or audible music.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {DIRECTOR_DEFAULTS, DIRECTOR_TARGETS} from '../../../website_html_templates/player-three-director.js';
import {getScene} from '../../../website_html_templates/player-three-collection.js';

const sourcePath = process.argv[2] || fileURLToPath(new URL('./player-three-director-ui.js', import.meta.url));
const source = readFileSync(sourcePath, 'utf8');
const extract = (name, next) => {
  const start = source.indexOf(`function ${name}(`), end = source.indexOf(next, start);
  assert.ok(start >= 0 && end > start, `Actual ${name} function exists`);
  return source.slice(start, end).trim();
};
const bind = (code, scope) => Function(...Object.keys(scope), `"use strict"; return (${code});`)(...Object.values(scope));
const node = () => {
  let text = '', writes = 0; const children = new Map(), attrs = new Map(), classes = new Map();
  return {get textContent() {return text;}, set textContent(value) {text = value; writes++;}, get writes() {return writes;}, hidden: false, disabled: false,
    style: {}, classList: {toggle: (name, value) => classes.set(name, value)}, classes,
    setAttribute: (name, value) => attrs.set(name, value), attrs,
    querySelector(selector) {if (!children.has(selector)) children.set(selector, node()); return children.get(selector);}
  };
};
const setText = bind(extract('setText', '\n  function report'), {});
const results = [];
function check(name, run) {try {run(); results.push({name, pass: true});} catch (error) {results.push({name, pass: false, error: error.message});}}
check('An armed mismatched score can be disarmed', () => {
  const patches = [], current = {...structuredClone(DIRECTOR_DEFAULTS), mode: 'score'};
  const toggle = bind(extract('toggleScore', '\n  function clearScore'), {config: () => current, scoreUsable: () => false, commitChange: patch => patches.push(patch)});
  toggle(); assert.deepEqual(patches, [{mode: 'manual', follow: false}]);
});
check('A new score cannot be armed without a usable track and cue', () => {
  let writes = 0; const toggle = bind(extract('toggleScore', '\n  function clearScore'), {config: () => structuredClone(DIRECTOR_DEFAULTS), scoreUsable: () => false, commitChange: () => writes++});
  toggle(); assert.equal(writes, 0);
});
check('Failed clear keeps the storage failure feedback', () => {
  const messages = [], clear = bind(extract('clearScore', "\n  on(q('#director-arm')"), {config: () => structuredClone(DIRECTOR_DEFAULTS), commitChange: () => {messages.push('Not saved on this device'); return {ok: false};}, report: message => messages.push(message)});
  clear(); assert.deepEqual(messages, ['Not saved on this device']);
});
check('Successful clear reports success and exits a running score', () => {
  let patch; const messages = [], clear = bind(extract('clearScore', "\n  on(q('#director-arm')"), {config: () => ({...structuredClone(DIRECTOR_DEFAULTS), mode: 'score'}), commitChange: value => {patch = value; return {ok: true};}, report: message => messages.push(message)});
  clear(); assert.deepEqual(patch, {cues: [], scoreTrackId: null, mode: 'manual'}); assert.equal(messages.length, 1);
});
check('Repeated live-region text creates only one text mutation', () => {const label = node(); setText(label, 'Motion is off'); setText(label, 'Motion is off'); assert.equal(label.writes, 1);});

function updateHarness({mode = 'manual', enabled = true, target = 'bloom', mismatch = false, paused = false} = {}) {
  const current = structuredClone(DIRECTOR_DEFAULTS); current.mode = mode; current.routes[0] = {...current.routes[0], enabled, target};
  const elements = new Map(), q = selector => {if (!elements.has(selector)) elements.set(selector, node()); return elements.get(selector);};
  const routeRows = new Map(current.routes.map(route => [route.id, node()]));
  const update = bind(extract('update', '\n  for (const event of'), {
    disposed: false, lastLive: null, config: () => current, q, setText, audio: {paused, currentTime: 4, duration: 30, ended: false}, scoreMismatch: () => mismatch,
    pointerId: null, updatePad: () => {}, getSnapshot: () => ({scene: 'record'}), DIRECTOR_TARGETS, routeRows,
    clamp: value => Math.max(0, Math.min(1, value)), getScene, clock: value => String(value), cueRows: new Map(), trackKey: 'track-a', getTrack: () => ({id: 'track-a'}), refreshScore: () => {}
  });
  const live = {mode, status: 'Actual engine status', scene: 'record', signals: {bass: .65}, activeCueId: 'cue-a', capabilities: {motion: true, bloom: true}};
  return {update, live, current, q, row: routeRows.get(current.routes[0].id), state: () => routeRows.get(current.routes[0].id).querySelector('.director-route-state').textContent};
}
check('Motion off is held and does not mark the instrument as performing', () => {
  const h = updateHarness(); h.live.capabilities.motion = false; h.update(h.live);
  assert.equal(h.state(), 'Motion held'); assert.equal(h.q('.director-live-line').classes.get('is-performing'), false);
});
check('Mismatched score routes wait instead of claiming active modulation', () => {
  const h = updateHarness({mode: 'score', mismatch: true}); h.update(h.live); assert.equal(h.state(), 'Waiting for cue');
});
check('Before-first-cue score routes wait', () => {
  const h = updateHarness({mode: 'score'}); h.live.activeCueId = null; h.update(h.live); assert.equal(h.state(), 'Waiting for cue');
});
check('Low-detail disabled bloom explains why this route has no visible effect', () => {
  const h = updateHarness(); h.live.capabilities.bloom = false; h.update(h.live); assert.equal(h.state(), 'Needs detail');
});
check('A target in another scene remains dormant', () => {
  const h = updateHarness({target: 'neuralSway'}); h.update(h.live); assert.equal(h.state(), 'For Neural');
});
check('Paused route waits and active route reflects the supplied real source', () => {
  const paused = updateHarness({paused: true}); paused.update(paused.live); assert.equal(paused.state(), 'Waiting');
  const h = updateHarness(); h.update(h.live); assert.equal(h.state(), 'On'); assert.equal(h.row.querySelector('.director-meter i').style.transform, 'scaleX(0.65)');
});
check('Disabled route takes precedence over Motion and quality constraints', () => {
  const h = updateHarness({enabled: false}); h.live.capabilities = {motion: false, bloom: false}; h.update(h.live); assert.equal(h.state(), 'Off');
});
check('Repeated update does not repeatedly mutate the screen-reader status', () => {
  const h = updateHarness(); h.update(h.live); h.update(h.live); assert.equal(h.q('#director-live-status').writes, 1);
});
check('Deleting a focused cue returns focus to next, previous or capture', () => {
  for (const [ids, deleted, expected] of [[['a', 'b', 'c'], 'b', 'c'], [['a', 'b'], 'b', 'a'], [['a'], 'a', 'capture']]) {
    const current = {...structuredClone(DIRECTOR_DEFAULTS), mode: 'score', cues: ids.map((id, time) => ({id, time}))};
    let focused, patch; const cueRows = new Map(ids.map(id => [id, {contains: () => id === deleted, querySelector: () => ({focus: () => {focused = id;}})}]));
    const remove = bind(extract('removeCue', '\n  function scoreMismatch'), {config: () => current, cueRows, document: {activeElement: {}}, commitChange: value => {patch = value; cueRows.delete(deleted);}, q: () => ({disabled: false, focus: () => {focused = 'capture';}})});
    remove(deleted); assert.equal(focused, expected); assert.equal(patch.cues.some(cue => cue.id === deleted), false);
  }
});
process.stdout.write(JSON.stringify({sourcePath, passed: results.filter(result => result.pass).length, total: results.length, results, limitation: 'Actual UI function logic with a DOM boundary facade; no browser, visual, shader or audio verification.'}, null, 2) + '\n');
if (results.some(result => !result.pass)) process.exitCode = 1;
