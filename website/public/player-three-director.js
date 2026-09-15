import {VISUAL_SCHEMA, VISUAL_DEFAULTS, VISUAL_PRESETS, sanitizeVisualSettings} from './player-three-visual-settings.js';
import {AETHER_DEFAULTS,sanitizeAether} from './lab-aether-settings.js';

const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const valueOf = (object, key) => Object.getOwnPropertyDescriptor(object, key)?.value;
const plain = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
const finite = value => typeof value === 'number' && Number.isFinite(value);
const bounded = (value, low, high, fallback) => finite(value) ? Math.max(low, Math.min(high, value)) : fallback;
const clamp01 = value => bounded(value, 0, 1, 0);
const unsafe = new Set(['__proto__', 'prototype', 'constructor']);
const safeId = value => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,79}$/u.test(value) && !unsafe.has(value);
const sceneIds = new Set(['record', 'aurora', 'orbital', 'liquid', 'aether', 'tidal', 'monolith']);
const sceneId = value => sceneIds.has(value) ? value : 'record';
const stringLabel = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const text = value.replace(/[\u0000-\u001f\u007f-\u009f]/gu, '').trim().replace(/\s+/gu, ' ').slice(0, 48);
  return text || fallback;
};
const source = (id, label) => Object.freeze({id, label});
const target = (id, scene) => Object.freeze({id, label: VISUAL_SCHEMA[id].label, ...(scene ? {scene} : {})});

export const DIRECTOR_STORAGE_KEY = 'pmp.website.room.director.v1';
export const DIRECTOR_SOURCES = Object.freeze([
  source('bass', 'Bass'), source('mid', 'Midrange'), source('treble', 'Treble'),
  source('energy', 'Energy'), source('pulse', 'Transients'), source('centroid', 'Brightness')
]);
export const DIRECTOR_TARGETS = Object.freeze([
  target('bloom'), target('exposure'), target('saturation'), target('particleGlow'), target('motionSpeed'),
  target('neuralSway', 'aurora'), target('neuralSpread', 'aurora'),
  target('horizonFlow', 'orbital'), target('horizonTilt', 'orbital'),
  target('prismSpeed', 'liquid'), target('prismTwist', 'liquid'), target('recordSpectrum', 'record')
]);
const sources = new Set(DIRECTOR_SOURCES.map(item => item.id));
const targets = new Map(DIRECTOR_TARGETS.map(item => [item.id, item]));
const visualKeys = Object.keys(VISUAL_SCHEMA);
const corner = id => {
  const preset = VISUAL_PRESETS.find(item => item.id === id);
  return Object.freeze({name: preset.name, settings: preset.settings});
};
const initialRoutes = [
  ['bass', 'bloom', .25], ['pulse', 'exposure', .18],
  ['centroid', 'saturation', .25], ['energy', 'motionSpeed', .3]
].map(([signal, output, amount], index) => Object.freeze({id: `route-${index + 1}`, enabled: false, source: signal, target: output, amount}));

export const DIRECTOR_DEFAULTS = Object.freeze({
  mode: 'manual', follow: false,
  morph: Object.freeze({x: 0, y: 0, corners: Object.freeze([
    corner('dreamstate'), corner('high-voltage'), corner('deep-space'), corner('night-drive')
  ])}),
  routes: Object.freeze(initialRoutes), cues: Object.freeze([]), scoreTrackId: null,
  optics: Object.freeze({dispersion: 0, streak: 0, grain: 0}),
  camera: Object.freeze({mode: 'still', amount: .35})
});

const configurationKeys = Object.keys(DIRECTOR_DEFAULTS);
const copy = value => JSON.parse(JSON.stringify(value));
const validSettings = value => plain(value) && Object.keys(value).length > 0
  && Object.keys(value).every(key => owns(VISUAL_SCHEMA, key) && finite(valueOf(value, key)));
const boundedList = (list, maximum) => Array.from({length: Math.min(list.length, maximum)}, (_, index) => valueOf(list, String(index)));

/** Recover usable fields without executing accessors or mutating supplied data. */
export function sanitizeDirectorConfig(value) {
  const input = plain(value) ? value : {};
  const morphValue = valueOf(input, 'morph');
  const morph = plain(morphValue) ? morphValue : {};
  const suppliedCorners = valueOf(morph, 'corners');
  const corners = DIRECTOR_DEFAULTS.morph.corners.map((fallback, index) => {
    const supplied = Array.isArray(suppliedCorners) ? valueOf(suppliedCorners, String(index)) : null;
    if (!plain(supplied)) return copy(fallback);
    const settings = valueOf(supplied, 'settings');
    return {name: stringLabel(valueOf(supplied, 'name'), fallback.name),
      settings: validSettings(settings) ? sanitizeVisualSettings(settings) : {...fallback.settings}};
  });
  const suppliedRoutes = valueOf(input, 'routes');
  const routeIds = new Set();
  const routes = Array.isArray(suppliedRoutes) ? boundedList(suppliedRoutes, 4).flatMap((route, index) => {
    if (!plain(route)) return [];
    const from = valueOf(route, 'source'), to = valueOf(route, 'target'), amount = valueOf(route, 'amount');
    if (!sources.has(from) || !targets.has(to) || !finite(amount)) return [];
    let id = valueOf(route, 'id');
    if (!safeId(id) || routeIds.has(id)) id = `route-restored-${index + 1}`;
    while (routeIds.has(id)) id += '-r';
    routeIds.add(id);
    return [{id, enabled: valueOf(route, 'enabled') === true, source: from, target: to,
      amount: bounded(amount, -1, 1, 0)}];
  }) : copy(DIRECTOR_DEFAULTS.routes);
  const suppliedCues = valueOf(input, 'cues');
  const cueIds = new Set(), byTime = new Map();
  if (Array.isArray(suppliedCues)) {
    // Last supplied cue at the same normalized time wins. Input recovery is bounded.
    for (const [index, cue] of boundedList(suppliedCues, 24).entries()) {
      if (!plain(cue)) continue;
      const time = valueOf(cue, 'time'), duration = valueOf(cue, 'duration');
      const scene = valueOf(cue, 'scene'), settings = valueOf(cue, 'settings');
      if (!finite(time) || !finite(duration) || !sceneIds.has(scene) || !validSettings(settings)) continue;
      let id = valueOf(cue, 'id');
      if (!safeId(id) || cueIds.has(id)) id = `cue-restored-${index + 1}`;
      while (cueIds.has(id)) id += '-r';
      cueIds.add(id);
      const normalizedTime = bounded(time, 0, 86400, 0);
      byTime.set(normalizedTime, {id, time: normalizedTime, label: stringLabel(valueOf(cue, 'label'), `Cue ${index + 1}`),
        scene, settings: sanitizeVisualSettings(settings), duration: bounded(duration, 0, 30, 0), ...(plain(valueOf(cue,'labLook'))?{labLook:sanitizeAether(valueOf(cue,'labLook'))}:{})});
    }
  }
  const suppliedOptics = valueOf(input, 'optics');
  const optics = plain(suppliedOptics) ? suppliedOptics : {};
  const suppliedCamera = valueOf(input, 'camera');
  const camera = plain(suppliedCamera) ? suppliedCamera : {};
  const mode = valueOf(input, 'mode'), cameraMode = valueOf(camera, 'mode');
  const trackId = valueOf(input, 'scoreTrackId');
  return {
    mode: ['manual', 'morph', 'score'].includes(mode) ? mode : 'manual',
    follow: valueOf(input, 'follow') === true,
    morph: {x: clamp01(valueOf(morph, 'x')), y: clamp01(valueOf(morph, 'y')), corners},
    routes, cues: [...byTime.values()].sort((a, b) => a.time - b.time),
    scoreTrackId: typeof trackId === 'string' && trackId.length > 0 && trackId.length <= 256
      && !/[\u0000-\u001f\u007f-\u009f]/u.test(trackId) ? trackId : null,
    optics: {dispersion: clamp01(valueOf(optics, 'dispersion')), streak: clamp01(valueOf(optics, 'streak')), grain: clamp01(valueOf(optics, 'grain'))},
    camera: {mode: ['still', 'breathe', 'arc'].includes(cameraMode) ? cameraMode : 'still',
      amount: bounded(valueOf(camera, 'amount'), 0, 1, .35)}
  };
}

// Storage receives data only. A malformed mutation must not silently replace a saved score.
function safeData(value, depth = 0) {
  if (depth > 8) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) {
    if (value.length > 64) return false;
    return Object.keys(value).every(key => /^\d+$/u.test(key) && safeData(valueOf(value, key), depth + 1));
  }
  return plain(value) && Object.keys(value).length <= 40
    && Object.keys(value).every(key => !unsafe.has(key) && safeData(valueOf(value, key), depth + 1));
}
function validPatch(patch) {
  if (!plain(patch) || !safeData(patch) || Object.keys(patch).some(key => !configurationKeys.includes(key))) return false;
  const has = key => owns(patch, key), get = key => valueOf(patch, key);
  if (has('mode') && !['manual', 'morph', 'score'].includes(get('mode'))) return false;
  if (has('follow') && typeof get('follow') !== 'boolean') return false;
  if (has('scoreTrackId') && get('scoreTrackId') !== null
    && (typeof get('scoreTrackId') !== 'string' || !get('scoreTrackId').length || get('scoreTrackId').length > 256
      || /[\u0000-\u001f\u007f-\u009f]/u.test(get('scoreTrackId')))) return false;
  for (const key of ['morph', 'optics', 'camera']) if (has(key) && !plain(get(key))) return false;
  for (const [key, maximum] of [['routes', 4], ['cues', 24]]) {
    if (has(key) && (!Array.isArray(get(key)) || get(key).length > maximum)) return false;
  }
  const fields = (value, allowed) => plain(value) && Object.keys(value).every(key => allowed.includes(key));
  const finiteFields = (value, keys) => keys.every(key => !owns(value, key) || finite(valueOf(value, key)));
  if (has('morph')) {
    const morph = get('morph');
    if (!fields(morph, ['x', 'y', 'corners']) || !finiteFields(morph, ['x', 'y'])) return false;
    if (owns(morph, 'corners')) {
      const corners = valueOf(morph, 'corners');
      if (!Array.isArray(corners) || corners.length !== 4 || !corners.every(item => fields(item, ['name', 'settings'])
        && typeof valueOf(item, 'name') === 'string' && validSettings(valueOf(item, 'settings')))) return false;
    }
  }
  if (has('optics') && (!fields(get('optics'), ['dispersion', 'streak', 'grain'])
    || !finiteFields(get('optics'), ['dispersion', 'streak', 'grain']))) return false;
  if (has('camera')) {
    const camera = get('camera');
    if (!fields(camera, ['mode', 'amount']) || !finiteFields(camera, ['amount'])
      || (owns(camera, 'mode') && !['still', 'breathe', 'arc'].includes(valueOf(camera, 'mode')))) return false;
  }
  if (has('routes') && !get('routes').every(route => fields(route, ['id', 'enabled', 'source', 'target', 'amount'])
    && safeId(valueOf(route, 'id')) && typeof valueOf(route, 'enabled') === 'boolean'
    && sources.has(valueOf(route, 'source')) && targets.has(valueOf(route, 'target')) && finite(valueOf(route, 'amount')))) return false;
  if (has('cues') && !get('cues').every(cue => fields(cue, ['id', 'time', 'label', 'scene', 'settings', 'duration','labLook'])
    && safeId(valueOf(cue, 'id')) && finite(valueOf(cue, 'time')) && finite(valueOf(cue, 'duration'))
    && typeof valueOf(cue, 'label') === 'string' && sceneIds.has(valueOf(cue, 'scene')) && validSettings(valueOf(cue, 'settings'))
    && (!owns(cue,'labLook') || (fields(valueOf(cue,'labLook'),Object.keys(AETHER_DEFAULTS))
      && finiteFields(valueOf(cue,'labLook'),['flow','spread','turbulence','glow','depth','focus'])
      && (!owns(valueOf(cue,'labLook'),'form') || ['silk','nova','helix'].includes(valueOf(valueOf(cue,'labLook'),'form')))
      && (!owns(valueOf(cue,'labLook'),'journey') || typeof valueOf(valueOf(cue,'labLook'),'journey')==='boolean'))))) return false;
  return true;
}

/** Reads never write; each patch merges against the latest persisted top-level state. */
export function createDirectorStore(adapter) {
  if (!adapter || typeof adapter.get !== 'function' || typeof adapter.set !== 'function') {
    throw new TypeError('Director requires a storage adapter.');
  }
  const snapshot = () => {
    try { return {config: sanitizeDirectorConfig(adapter.get(DIRECTOR_STORAGE_KEY, null)), error: null}; }
    catch { return {config: sanitizeDirectorConfig(null), error: 'Saved Director settings are unavailable. Your changes are temporary.'}; }
  };
  return {
    read() { return snapshot().config; },
    patch(partialConfig) {
      const current = snapshot();
      if (!validPatch(partialConfig)) return {ok: false, accepted: false, config: current.config, error: 'Choose valid Director settings. Your saved score has not changed.'};
      const config = sanitizeDirectorConfig({...current.config, ...partialConfig});
      if (current.error) return {ok: false, config, error: current.error};
      let ok = false;
      try { ok = adapter.set(DIRECTOR_STORAGE_KEY, copy(config)) === true; }
      catch { /* Keep the exact candidate available to the controller for this visit. */ }
      return {ok, config, ...(!ok ? {error: 'Your Director changes could not be saved on this device. They are temporary.'} : {})};
    }
  };
}

const mix = (a, b, factor) => factor === 0 ? a : factor === 1 ? b : a + (b - a) * factor;
const smoothstep = t => t * t * (3 - 2 * t);
function blendSettings(a, b, progress) {
  return Object.fromEntries(visualKeys.map(key => [key, mix(a[key], b[key], progress)]));
}
function morphSettings(corners, x, y) {
  return Object.fromEntries(visualKeys.map(key => [key,
    mix(mix(corners[0].settings[key], corners[1].settings[key], x),
      mix(corners[2].settings[key], corners[3].settings[key], x), y)]));
}

/** Pure per-frame evaluator. Every output starts from base, morph or absolute-time score. */
export function createDirectorEngine() {
  let config = sanitizeDirectorConfig(null), signature = JSON.stringify(config), revision = 0;
  let appliedRevision = -1, previous = null, previousBase = '', previousInputScene = '', previousTrackId;
  let xy = {x: config.morph.x, y: config.morph.y}, scoreTime = 0, enterScore = false;
  const levels = Object.fromEntries(DIRECTOR_SOURCES.map(item => [item.id, 0]));
  return {
    setConfig(value) {
      const next = sanitizeDirectorConfig(value), serialized = JSON.stringify(next);
      if (serialized === signature) return;
      if (next.morph.x !== config.morph.x || next.morph.y !== config.morph.y || next.mode !== config.mode) {
        xy = {x: next.morph.x, y: next.morph.y};
      }
      enterScore = next.mode === 'score' && (enterScore || config.mode !== 'score');
      config = next; signature = serialized; revision += 1;
    },
    update(frame = {}) {
      const base = sanitizeVisualSettings(frame.baseSettings ?? VISUAL_DEFAULTS);
      const inputScene = sceneId(frame.scene), baseSignature = JSON.stringify(base);
      const motion = frame.motion !== false, playing = frame.playing === true;
      const changed = revision !== appliedRevision || baseSignature !== previousBase || inputScene !== previousInputScene || frame.trackId !== previousTrackId;
      // Fresh analyser data and playback time cannot move a frozen scene. Explicit static edits can.
      if (!motion && previous && !changed) {
        const held = copy(previous);
        held.status = held.status.startsWith('Score belongs') ? 'Score belongs to another song · Motion is off' : 'Motion is off · look held';
        return held;
      }
      const dt = bounded(frame.dt, 0, 1, 1 / 60);
      const inputSignals = plain(frame.signals) ? frame.signals : {};
      if (motion) for (const item of DIRECTOR_SOURCES) {
        const targetValue = playing ? clamp01(valueOf(inputSignals, item.id)) : 0;
        levels[item.id] += (targetValue - levels[item.id]) * (1 - Math.exp(-dt * (targetValue > levels[item.id] ? 12 : 5)));
        if (Math.abs(levels[item.id]) < 1e-9) levels[item.id] = 0;
      }
      let settings = {...base}, outputScene = inputScene, activeCueId = null, status = 'Manual look', labLook=null;
      if (config.mode === 'morph') {
        if (config.follow && motion && playing) {
          const response = 1 - Math.exp(-dt * 3);
          xy.x = mix(xy.x, levels.energy, response);
          xy.y = mix(xy.y, levels.centroid, response);
        } else if (!config.follow) xy = {x: config.morph.x, y: config.morph.y};
        settings = morphSettings(config.morph.corners, xy.x, xy.y);
        status = config.follow ? (playing ? 'Following music' : 'Follow paused') : 'Morph live';
      } else if (config.mode === 'score') {
        if (!config.scoreTrackId) status = 'Score needs a track';
        else if (frame.trackId !== config.scoreTrackId) status = 'Score belongs to another song';
        else if (!config.cues.length) status = 'Add a cue to begin';
        else {
          if (motion || !previous || enterScore || frame.trackId !== previousTrackId) scoreTime = bounded(frame.time, 0, 86400, 0);
          let index = config.cues.length - 1;
          while (index >= 0 && config.cues[index].time > scoreTime) index -= 1;
          if (index < 0) status = 'Before the first cue';
          else {
            const cue = config.cues[index];
            const from = index > 0 ? config.cues[index - 1].settings : base;
            const progress = cue.duration === 0 ? 1 : smoothstep(clamp01((scoreTime - cue.time) / cue.duration));
            settings = blendSettings(from, cue.settings, progress);
            outputScene = cue.scene; activeCueId = cue.id;labLook=['aether','tidal','monolith'].includes(cue.scene)&&cue.labLook?{...cue.labLook}:null;
            status = playing ? 'Score playing' : 'Score paused';
          }
        }
      }
      // A mismatched score is an unconditional return to manual appearance; old routes must not leak across songs.
      const scoreAvailable = config.mode !== 'score' || activeCueId !== null;
      if (scoreAvailable) for (const route of config.routes) {
        const metadata = targets.get(route.target);
        if (!route.enabled || (metadata.scene && metadata.scene !== outputScene)) continue;
        const spec = VISUAL_SCHEMA[route.target];
        settings[route.target] += levels[route.source] * route.amount * .35 * (spec.max - spec.min);
      }
      if (!motion) status = status.startsWith('Score belongs') ? 'Score belongs to another song · Motion is off' : 'Motion is off · look held';
      previous = {settings: sanitizeVisualSettings(settings), scene: outputScene, xy: {...xy}, signals: {...levels},
        activeCueId, status, mode: config.mode, optics: {...config.optics}, camera: {...config.camera},labLook};
      appliedRevision = revision; previousBase = baseSignature; previousInputScene = inputScene; previousTrackId = frame.trackId; enterScore = false;
      return copy(previous);
    }
  };
}
