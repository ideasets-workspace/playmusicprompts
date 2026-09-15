// Visual Studio owns appearance only. Playback, scene choice and Motion stay separate.
const definition = (label, min, max, step, initial, group, scene) =>
  Object.freeze({label, min, max, step, default: initial, group, ...(scene ? {scene} : {})});

export const VISUAL_SCHEMA = Object.freeze({
  exposure: definition('Exposure', .55, 1.75, .01, 1.05, 'look'),
  bloom: definition('Bloom strength', 0, 2, .01, 1, 'look'),
  bloomRadius: definition('Bloom diffusion', 0, 1, .01, .65, 'look'),
  saturation: definition('Color richness', 0, 1.8, .01, 1, 'look'),
  vignette: definition('Edge shade', 0, .8, .01, 0, 'look'),
  particles: definition('Particle density', 0, 1, .01, 1, 'look'),
  particleGlow: definition('Particle glow', .2, 2, .01, 1, 'look'),
  motionSpeed: definition('World tempo', .1, 2.5, .01, 1, 'motion'),
  bassGain: definition('Bass response', 0, 2, .01, 1, 'motion'),
  midGain: definition('Midrange response', 0, 2, .01, 1, 'motion'),
  trebleGain: definition('Treble response', 0, 2, .01, 1, 'motion'),
  pulseGain: definition('Transient impact', 0, 2, .01, 1, 'motion'),
  smoothing: definition('Response smoothing', .25, 2.5, .01, 1, 'motion'),
  framing: definition('Scene framing', .75, 1.35, .01, 1, 'motion'),
  orbitSpeed: definition('Orbit speed', .05, 1.2, .01, .26, 'motion'),
  recordSpectrum: definition('Spectrum height', .2, 2, .01, 1, 'scene', 'record'),
  recordReflect: definition('Floor reflection', 0, 1.5, .01, 1, 'scene', 'record'),
  recordFog: definition('Atmospheric depth', 0, .12, .001, .057, 'scene', 'record'),
  neuralSpread: definition('Canopy spread', .7, 1.2, .01, 1, 'scene', 'aurora'),
  neuralSway: definition('Living sway', 0, 2, .01, 1, 'scene', 'aurora'),
  neuralTrail: definition('Electrical trail', .4, 2, .01, 1, 'scene', 'aurora'),
  horizonGravity: definition('Light curvature', .75, 1.25, .01, 1, 'scene', 'orbital'),
  horizonFlow: definition('Accretion flow', 0, 2, .01, 1, 'scene', 'orbital'),
  horizonDetail: definition('Filament detail', .5, 1.5, .01, 1, 'scene', 'orbital'),
  horizonTilt: definition('Disk tilt', -.12, .18, .01, 0, 'scene', 'orbital'),
  prismWidth: definition('Passage width', .8, 1.3, .01, 1, 'scene', 'liquid'),
  prismTwist: definition('Passage twist', 0, 2, .01, 1, 'scene', 'liquid'),
  prismSpeed: definition('Flight speed', 0, 2, .01, 1, 'scene', 'liquid'),
  prismGloss: definition('Surface gloss', .6, 1.6, .01, 1, 'scene', 'liquid')
});

const keys = Object.keys(VISUAL_SCHEMA);
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const plain = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
// Read data properties only: settings never execute imported accessor properties.
const ownValue = (object, key) => Object.getOwnPropertyDescriptor(object, key)?.value;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, spec) => Math.min(spec.max, Math.max(spec.min, value));

export const VISUAL_DEFAULTS = Object.freeze(Object.fromEntries(keys.map(key => [key, VISUAL_SCHEMA[key].default])));

export function sanitizeVisualSettings(value) {
  const input = plain(value) ? value : {};
  return Object.fromEntries(keys.map(key => {
    const candidate = ownValue(input, key);
    return [key, finite(candidate) ? clamp(candidate, VISUAL_SCHEMA[key]) : VISUAL_DEFAULTS[key]];
  }));
}

const look = (id, name, description, settings) => Object.freeze({
  id, name, description, settings: Object.freeze(sanitizeVisualSettings({...VISUAL_DEFAULTS, ...settings}))
});

export const VISUAL_PRESETS = Object.freeze([
  look('original', 'Original', 'The artist\'s original balance of light, space and motion.', {}),
  look('night-drive', 'Night Drive', 'Clean neon, flowing motion and a deeper edge.', {
    exposure: .94, bloom: 1.12, bloomRadius: .47, saturation: 1.2, vignette: .2,
    particles: .72, particleGlow: 1.22, motionSpeed: 1.15, bassGain: 1.18, midGain: .88,
    trebleGain: 1.1, pulseGain: 1.25, smoothing: .8, orbitSpeed: .32,
    recordSpectrum: 1.22, recordReflect: 1.2, recordFog: .068,
    neuralSpread: .94, neuralSway: .82, neuralTrail: 1.25,
    horizonGravity: 1.08, horizonFlow: 1.24, horizonDetail: 1.15, horizonTilt: .04,
    prismWidth: .92, prismTwist: 1.2, prismSpeed: 1.25, prismGloss: 1.24
  }),
  look('dreamstate', 'Dreamstate', 'Soft light and spacious, unhurried movement.', {
    exposure: 1.1, bloom: 1.25, bloomRadius: .85, saturation: .82, vignette: .12,
    particles: .62, particleGlow: .82, motionSpeed: .58, bassGain: .7, midGain: .82,
    trebleGain: .65, pulseGain: .55, smoothing: 1.8, framing: 1.04, orbitSpeed: .12,
    recordSpectrum: .72, recordReflect: .75, recordFog: .073,
    neuralSpread: 1.12, neuralSway: .65, neuralTrail: 1.65,
    horizonGravity: .9, horizonFlow: .65, horizonDetail: .8, horizonTilt: -.04,
    prismWidth: 1.18, prismTwist: .55, prismSpeed: .6, prismGloss: .82
  }),
  look('high-voltage', 'High Voltage', 'Crisp highlights and a sharper response to every hit.', {
    exposure: 1, bloom: 1.18, bloomRadius: .3, saturation: 1.32, vignette: .17,
    particles: 1, particleGlow: 1.45, motionSpeed: 1.32, bassGain: 1.5, midGain: 1.18,
    trebleGain: 1.45, pulseGain: 1.65, smoothing: .55, orbitSpeed: .42,
    recordSpectrum: 1.5, recordReflect: 1.1, recordFog: .045,
    neuralSpread: 1.05, neuralSway: 1.45, neuralTrail: .72,
    horizonGravity: 1.17, horizonFlow: 1.48, horizonDetail: 1.35, horizonTilt: .065,
    prismWidth: .88, prismTwist: 1.5, prismSpeed: 1.45, prismGloss: 1.45
  }),
  look('deep-space', 'Deep Space', 'Quiet shadows, distant light and a sense of scale.', {
    exposure: .85, bloom: .85, bloomRadius: .7, saturation: .88, vignette: .32,
    particles: .48, particleGlow: 1.05, motionSpeed: .7, bassGain: 1.2, midGain: .7,
    trebleGain: .78, pulseGain: .9, smoothing: 1.4, framing: .9, orbitSpeed: .09,
    recordSpectrum: .85, recordReflect: .6, recordFog: .035,
    neuralSpread: 1.18, neuralSway: .5, neuralTrail: 1.35,
    horizonGravity: 1.2, horizonFlow: .7, horizonDetail: 1.25, horizonTilt: -.06,
    prismWidth: 1.25, prismTwist: .7, prismSpeed: .7, prismGloss: 1.12
  })
]);

export const VISUAL_STORAGE_KEY = 'pmp.website.room.visual-studio.v1';
const MAX_PRESETS = 20;
const MAX_NAME = 48;
const MAX_IMPORT_BYTES = 128 * 1024;
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const safeId = value => typeof value === 'string' && /^look-[a-zA-Z0-9_-]{1,80}$/.test(value);
const normalizedName = value => typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
const validName = value => typeof value === 'string' && !/[\u0000-\u001f\u007f-\u009f]/u.test(value)
  && normalizedName(value).length > 0 && normalizedName(value).length <= MAX_NAME;
const nameKey = value => normalizedName(value).toLowerCase();
const copy = state => ({
  settings: {...state.settings},
  presets: state.presets.map(preset => ({id: preset.id, name: preset.name, settings: {...preset.settings}}))
});

function validSettingsInput(value) {
  if (!plain(value)) return false;
  const supplied = Object.keys(value);
  return supplied.length > 0 && supplied.every(key => !unsafeKeys.has(key) && owns(VISUAL_SCHEMA, key)
    && finite(ownValue(value, key)));
}

function stateFrom(value) {
  if (!plain(value) || (owns(value, 'version') && ownValue(value, 'version') !== 1)) {
    return {settings: {...VISUAL_DEFAULTS}, presets: []};
  }
  const settings = sanitizeVisualSettings(ownValue(value, 'settings'));
  const supplied = ownValue(value, 'presets');
  const presets = [];
  const names = new Set();
  const ids = new Set();
  if (Array.isArray(supplied)) {
    // Bounded recovery: malformed entries are ignored without touching storage.
    for (let index = 0; index < Math.min(supplied.length, MAX_PRESETS); index++) {
      const preset = supplied[index];
      if (!plain(preset)) continue;
      const name = ownValue(preset, 'name');
      const input = ownValue(preset, 'settings');
      if (!validName(name) || !validSettingsInput(input) || names.has(nameKey(name))) continue;
      let id = ownValue(preset, 'id');
      if (!safeId(id) || ids.has(id)) id = `look-restored-${index + 1}`;
      while (ids.has(id)) id += '-r';
      ids.add(id);
      names.add(nameKey(name));
      presets.push({id, name: normalizedName(name), settings: sanitizeVisualSettings(input)});
    }
  }
  return {settings, presets};
}

function importData(payload) {
  let source = payload;
  if (typeof source === 'string') {
    if (source.length > MAX_IMPORT_BYTES || new TextEncoder().encode(source).byteLength > MAX_IMPORT_BYTES) {
      throw new Error('This look file is too large. Choose a file smaller than 128 KB.');
    }
    try { source = JSON.parse(source); }
    catch { throw new Error('This file is not valid JSON. Choose a Visual Studio look file.'); }
  }
  if (!plain(source) || Object.keys(source).some(key => !['format', 'version', 'presets'].includes(key))
    || ownValue(source, 'format') !== 'pmp-visual-looks' || ownValue(source, 'version') !== 1) {
    throw new Error('This is not a supported Visual Studio look file.');
  }
  const presets = ownValue(source, 'presets');
  if (!Array.isArray(presets) || presets.length > MAX_PRESETS) {
    throw new Error('A look file can contain up to 20 looks.');
  }
  const names = new Set();
  return presets.map(preset => {
    if (!plain(preset) || Object.keys(preset).some(key => !['id', 'name', 'settings'].includes(key))) {
      throw new Error('Every imported look must contain only a name, settings and optional ID.');
    }
    const name = ownValue(preset, 'name');
    const settings = ownValue(preset, 'settings');
    if (!validName(name)) throw new Error('Give every look a name between 1 and 48 characters.');
    if (names.has(nameKey(name))) throw new Error('This file contains repeated look names. Rename them and try again.');
    names.add(nameKey(name));
    if (!validSettingsInput(settings)) throw new Error('A look contains unknown or invalid visual settings.');
    const id = ownValue(preset, 'id');
    if (id !== undefined && !safeId(id)) throw new Error('A look contains an invalid ID.');
    return {id, name: normalizedName(name), settings: sanitizeVisualSettings(settings)};
  });
}

/**
 * Adapter: get(key, fallback), set(key, value) -> boolean.
 * Mutation state is the requested candidate when a write fails; ok:false means
 * it is temporary, not saved. read() always returns the latest persisted state.
 * Invalid requests return unchanged state. Reads never migrate or write.
 */
export function createVisualStore(adapter) {
  if (!adapter || typeof adapter.get !== 'function' || typeof adapter.set !== 'function') {
    throw new TypeError('Visual Studio requires a storage adapter.');
  }
  let sequence = 0;
  const readSnapshot = () => {
    try { return {state: stateFrom(adapter.get(VISUAL_STORAGE_KEY, null)), error: null}; }
    catch { return {state: stateFrom(null), error: 'Saved looks are unavailable. Your changes are temporary.'}; }
  };
  const read = () => copy(readSnapshot().state);
  const fail = (snapshot, error) => ({ok: false, state: copy(snapshot.state), error});
  const commit = (snapshot, state, id) => {
    if (snapshot.error) return {...fail({state}, snapshot.error), ...(id ? {id} : {})};
    let saved = false;
    try { saved = adapter.set(VISUAL_STORAGE_KEY, {version: 1, ...copy(state)}) === true; }
    catch { /* The live preview may still use state, with an explicit unsaved status. */ }
    return {ok: saved, state: copy(state), ...(id ? {id} : {}),
      ...(!saved ? {error: 'Your changes could not be saved on this device. They are temporary.'} : {})};
  };
  const nextId = presets => {
    const ids = new Set(presets.map(preset => preset.id));
    let id;
    do {
      sequence += 1;
      const uuid = globalThis.crypto?.randomUUID?.();
      id = `look-${uuid || `${Date.now().toString(36)}-${sequence.toString(36)}`}`;
    } while (ids.has(id));
    return id;
  };

  return {
    read,
    patch(key, value) {
      const snapshot = readSnapshot();
      if (typeof key !== 'string' || !owns(VISUAL_SCHEMA, key) || !finite(value)) {
        return fail(snapshot, 'Choose a valid visual setting and a finite number.');
      }
      const state = copy(snapshot.state);
      state.settings[key] = clamp(value, VISUAL_SCHEMA[key]);
      return commit(snapshot, state);
    },
    replace(settings) {
      const snapshot = readSnapshot();
      if (!validSettingsInput(settings)) return fail(snapshot, 'Choose a valid visual look.');
      const state = copy(snapshot.state);
      state.settings = sanitizeVisualSettings(settings);
      return commit(snapshot, state);
    },
    savePreset(name, settings) {
      const snapshot = readSnapshot();
      if (!validName(name)) return fail(snapshot, 'Give your look a name between 1 and 48 characters.');
      if (!validSettingsInput(settings)) return fail(snapshot, 'Choose valid visual settings for your look.');
      const state = copy(snapshot.state);
      const existing = state.presets.findIndex(preset => nameKey(preset.name) === nameKey(name));
      if (existing < 0 && state.presets.length >= MAX_PRESETS) {
        return fail(snapshot, 'You have 20 saved looks. Delete one before saving another.');
      }
      const id = existing < 0 ? nextId(state.presets) : state.presets[existing].id;
      const preset = {id, name: normalizedName(name), settings: sanitizeVisualSettings(settings)};
      if (existing < 0) state.presets.push(preset);
      else state.presets[existing] = preset;
      return commit(snapshot, state, id);
    },
    deletePreset(id) {
      const snapshot = readSnapshot();
      if (!safeId(id) || !snapshot.state.presets.some(preset => preset.id === id)) {
        return fail(snapshot, 'This saved look is no longer available.');
      }
      const state = copy(snapshot.state);
      state.presets = state.presets.filter(preset => preset.id !== id);
      return commit(snapshot, state, id);
    },
    importPresets(payload) {
      const snapshot = readSnapshot();
      let incoming;
      try { incoming = importData(payload); }
      catch (error) { return fail(snapshot, error.message); }
      const state = copy(snapshot.state);
      for (const preset of incoming) {
        const existing = state.presets.findIndex(item => nameKey(item.name) === nameKey(preset.name));
        if (existing >= 0) {
          state.presets[existing] = {...preset, id: state.presets[existing].id};
        } else {
          if (state.presets.length >= MAX_PRESETS) {
            return fail(snapshot, 'These looks would exceed the 20-look limit. Delete a look and try again.');
          }
          const availableId = safeId(preset.id) && !state.presets.some(item => item.id === preset.id);
          state.presets.push({...preset, id: availableId ? preset.id : nextId(state.presets)});
        }
      }
      return commit(snapshot, state);
    },
    exportPresets() {
      return JSON.stringify({format: 'pmp-visual-looks', version: 1, presets: read().presets}, null, 2);
    }
  };
}
