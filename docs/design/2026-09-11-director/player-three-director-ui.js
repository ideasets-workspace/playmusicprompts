import {DIRECTOR_SOURCES, DIRECTOR_TARGETS} from './player-three-director.js';
import {VISUAL_PRESETS, sanitizeVisualSettings} from './player-three-visual-settings.js';
import {getScene} from './player-three-collection.js';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
const percent = value => `${Math.round(clamp(value) * 100)}%`;
const clock = value => {const s = Math.max(0, Number.isFinite(value) ? value : 0); return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;};
const sameLook = (a, b) => Object.keys(a).every(key => a[key] === b[key]);
const cueId = () => `cue-${crypto.randomUUID()}`;

// Mounted within the existing Studio. The parent owns sound, the renderer,
// persistence and the refresh clock; this view only handles explicit edits.
export function createDirectorControls({container, getConfig, commit, getSnapshot, getTrack, audio, getLive, captureFrame, toast, seek}) {
  const root = document.createElement('section'); root.className = 'director'; root.setAttribute('aria-label', 'Visual Director');
  root.innerHTML = `<div class="director-intro"><div><span class="director-kicker">YOUR SOUND. YOUR DIRECTION.</span><h3>Play the world.</h3></div><span class="director-mode-badge" id="director-mode-label">MANUAL</span></div>
    <p class="director-lead">Blend a feeling. Give the music control. Make every moment yours.</p>
    <div class="director-views" role="tablist" aria-label="Director controls"><button id="director-tab-perform" type="button" role="tab" aria-selected="true" aria-controls="director-view-perform" tabindex="0">Perform</button><button id="director-tab-score" type="button" role="tab" aria-selected="false" aria-controls="director-view-score" tabindex="-1">Score</button><button id="director-tab-lens" type="button" role="tab" aria-selected="false" aria-controls="director-view-lens" tabindex="-1">Lens</button></div>
    <div id="director-view-perform" role="tabpanel" aria-labelledby="director-tab-perform">
      <div class="director-mode-switch" role="group" aria-label="Visual performance mode"><button id="director-manual" type="button" aria-pressed="true"><span>01</span>Manual</button><button id="director-morph" type="button" aria-pressed="false"><span>02</span>Live morph</button></div>
      <div class="director-pad" id="director-pad" role="slider" tabindex="0" aria-label="Look morph pad" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-describedby="director-pad-help"><div class="director-pad-grid" aria-hidden="true"></div><span class="director-pad-axis director-pad-axis-x" aria-hidden="true"></span><span class="director-pad-axis director-pad-axis-y" aria-hidden="true"></span><span class="director-pad-corner director-corner-0" data-corner-name="0"></span><span class="director-pad-corner director-corner-1" data-corner-name="1"></span><span class="director-pad-corner director-corner-2" data-corner-name="2"></span><span class="director-pad-corner director-corner-3" data-corner-name="3"></span><span class="director-pad-puck" aria-hidden="true"><i></i></span><span class="director-pad-coordinate" aria-hidden="true">0 / 0</span></div>
      <p class="director-help" id="director-pad-help">Drag to blend four looks. Arrow keys move the blend; hold Shift for larger steps. Moving the pad turns on Live morph.</p>
      <div class="director-xy-inputs"><label for="director-x">Horizontal <output id="director-x-value" for="director-x">0%</output><input id="director-x" type="range" min="0" max="1" step=".01" value="0"></label><label for="director-y">Vertical <output id="director-y-value" for="director-y">0%</output><input id="director-y" type="range" min="0" max="1" step=".01" value="0"></label></div>
      <label class="director-switch-line" for="director-follow"><span><strong>Follow the music</strong><small>Energy moves across. Brightness moves up.</small></span><input id="director-follow" type="checkbox" role="switch"></label>
      <div class="director-section-heading"><h4>Four corners. Infinite shades.</h4><span>LOOK MAP</span></div><div class="director-corners" id="director-corners"></div>
      <div class="director-section-heading"><h4>Let your sound shape the scene.</h4><span>4 ROUTES</span></div><p class="director-help">Choose a signal and where it goes. Positive depth adds; negative depth pulls back. Start with one route.</p><div class="director-routes" id="director-routes"></div><p class="director-help director-bypass-note">Manual switches off morph, score and all four routes. Your saved Studio look stays intact.</p>
    </div>
    <div id="director-view-score" role="tabpanel" aria-labelledby="director-tab-score" hidden>
      <div class="director-score-track"><span class="director-kicker">A SCORE FOR THIS SONG</span><strong id="director-track-title">Bring your music</strong><p id="director-track-note"></p><div><span id="director-playhead">0:00</span><span id="director-cue-count">0 / 24 cues</span></div></div>
      <div class="director-score-actions"><button id="director-arm" class="director-primary" type="button" aria-pressed="false">Arm score</button><button id="director-clear" type="button">Clear score</button></div><p class="director-help">Capture the current look and scene at a moment in your song. Arming the score follows playback; it never starts the music.</p>
      <form id="director-capture-form" class="director-cue-capture"><div class="director-field"><label for="director-cue-label">Name the moment</label><input id="director-cue-label" type="text" maxlength="48" placeholder="The first light" autocomplete="off"></div><div class="director-cue-fields"><div class="director-field"><label for="director-cue-time">At second</label><input id="director-cue-time" type="number" min="0" max="86400" step=".1" value="0" required></div><div class="director-field"><label for="director-cue-duration">Transition · seconds</label><input id="director-cue-duration" type="number" min="0" max="30" step=".1" value="2" required></div><button id="director-use-playhead" type="button">Use playhead ↙</button></div><button id="director-capture-cue" type="submit" class="director-primary">＋ Capture this moment</button></form>
      <div class="director-score-empty" id="director-score-empty"><span>Every great journey<br>starts with a moment.</span><p>Your captured cues will appear here.</p></div><ol id="director-cues" class="director-cues" aria-label="Captured visual cues"></ol>
    </div>
    <div id="director-view-lens" role="tabpanel" aria-labelledby="director-tab-lens" hidden>
      <div class="director-lens-heading"><span class="director-kicker">THE FINISHING TOUCH</span><h4>A little cinema.<br>A world of difference.</h4><p class="director-help">Shape the lens around your world. Start subtle. Find your signature.</p></div><div id="director-optics"></div>
      <div class="director-section-heading"><h4>Make the camera feel it.</h4><span>CAMERA</span></div><div class="director-field"><label for="director-camera">Camera movement</label><select id="director-camera"><option value="still">Still · your chosen view</option><option value="breathe">Breathe · a gentle drift</option><option value="arc">Arc · a measured journey</option></select></div><div class="director-range"><div><label for="director-camera-amount">Movement depth</label><output id="director-camera-value" for="director-camera-amount">35%</output></div><input id="director-camera-amount" type="range" min="0" max="1" step=".01" value=".35"></div><p class="director-help" id="director-camera-note">Camera movement needs Motion on. Horizon and Prism keep their composed view. Dragging a scene gives the camera back to you.</p>
      <div class="director-frame-card"><div><span class="director-kicker">KEEP THIS FEELING</span><h4>One frame. Yours forever.</h4><p>Your current 3D view, saved as a PNG.</p></div><button id="director-capture-frame" type="button" class="director-primary">Capture frame ↗</button></div><button id="director-reset-lens" class="director-text-button" type="button">Reset lens & camera ↺</button>
    </div><div class="director-live-line"><i aria-hidden="true"></i><span id="director-live-status" role="status">Manual look</span></div><p id="director-feedback" class="director-feedback" role="status" hidden></p>`;
  container.append(root);
  const q = selector => root.querySelector(selector), cleanups = [], cueRows = new Map(), routeRows = new Map(), cornerRows = [];
  let disposed = false, activeView = 'perform', pointerId = null, capturePending = false, trackKey, lastLive = getLive?.() || null;
  let lastError = '', attempted = null;
  const notify = message => {if (message && message !== lastError) toast?.(message); lastError = message || '';};
  function setText(node, value) {if (node.textContent !== value) node.textContent = value;}
  function report(message, error = false) {const line = q('#director-feedback'); setText(line, message); line.hidden = !message; line.classList.toggle('is-error', error);}
  function commitChange(partial) {
    if (disposed) return null;
    try {
      const result = commit(partial); attempted = result?.config || null;
      if (!result?.ok) {const message = result?.error || 'Your change is live for this visit. Device storage is unavailable.'; report(message, true); notify(message);}
      else {lastError = ''; report('Applied · saved on this device');}
      refresh(); return result;
    } catch (error) {report(error.message || 'This change could not be applied.', true); notify(error.message || 'This change could not be applied.'); return null;}
  }
  // The parent retains failed-write candidates. Use its current config so that
  // simultaneous controls always merge the latest nested object.
  const config = () => getConfig() || attempted;
  const setInput = (input, value) => {if (document.activeElement !== input) input.value = String(value);};
  const on = (node, type, listener, options) => {node.addEventListener(type, listener, options); cleanups.push(() => node.removeEventListener(type, listener, options));};
  const makeOption = (name, value) => {const option = document.createElement('option'); option.textContent = name; option.value = value; return option;};
  function showView(view, focus = false) {
    const views = ['perform', 'score', 'lens']; if (!views.includes(view)) return;
    activeView = view;
    for (const id of views) {const button = q(`#director-tab-${id}`); button.setAttribute('aria-selected', String(id === view)); button.tabIndex = id === view ? 0 : -1; q(`#director-view-${id}`).hidden = id !== view;}
    if (focus) q(`#director-tab-${view}`).focus();
  }
  on(q('.director-views'), 'click', event => {const tab = event.target.closest('[role="tab"]'); if (tab) showView(tab.id.replace('director-tab-', ''));});
  on(q('.director-views'), 'keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation(); const views = ['perform', 'score', 'lens'];
    showView(event.key === 'Home' ? 'perform' : event.key === 'End' ? 'lens' : views[(views.indexOf(activeView) + (event.key === 'ArrowRight' ? 1 : 2)) % 3], true);
  });
  on(q('#director-manual'), 'click', () => {const current = config(); commitChange({mode: 'manual', follow: false, routes: current.routes.map(route => ({...route, enabled: false}))});});
  on(q('#director-morph'), 'click', () => commitChange({mode: 'morph'}));
  on(q('#director-follow'), 'change', event => commitChange({mode: 'morph', follow: event.target.checked}));
  function setXY(x, y) {
    const current = config(); const xy = {x: Math.round(clamp(x) * 1000) / 1000, y: Math.round(clamp(y) * 1000) / 1000};
    commitChange({mode: 'morph', follow: false, morph: {...current.morph, ...xy}}); updatePad(xy);
  }
  function currentXY() {const current = config(); return current.mode === 'morph' && current.follow && lastLive?.mode === 'morph' ? lastLive.xy : current.morph;}
  function updatePad(xy) {
    const x = clamp(xy?.x), y = clamp(xy?.y), pad = q('#director-pad');
    pad.style.setProperty('--morph-x', `${x * 100}%`); pad.style.setProperty('--morph-y', `${(1 - y) * 100}%`);
    pad.setAttribute('aria-valuenow', String(Math.round(x * 100))); pad.setAttribute('aria-valuetext', `Horizontal ${percent(x)}, vertical ${percent(y)}`);
    q('.director-pad-coordinate').textContent = `${Math.round(x * 100)} / ${Math.round(y * 100)}`;
    setInput(q('#director-x'), x); setInput(q('#director-y'), y); q('#director-x-value').value = percent(x); q('#director-y-value').value = percent(y);
  }
  function pointerXY(event) {const rect = q('#director-pad').getBoundingClientRect(); if (rect.width > 0 && rect.height > 0) setXY((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height);}
  on(q('#director-pad'), 'pointerdown', event => {if (event.button !== 0 || !event.isPrimary) return; event.preventDefault(); pointerId = event.pointerId; q('#director-pad').focus({preventScroll: true}); q('#director-pad').setPointerCapture(pointerId); pointerXY(event);});
  on(q('#director-pad'), 'pointermove', event => {if (event.pointerId === pointerId) pointerXY(event);});
  on(q('#director-pad'), 'pointerup', event => {if (event.pointerId !== pointerId) return; pointerXY(event); pointerId = null;});
  on(q('#director-pad'), 'lostpointercapture', () => {pointerId = null;});
  on(q('#director-pad'), 'pointercancel', () => {pointerId = null;});
  on(q('#director-pad'), 'keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation(); const xy = currentXY(), step = event.shiftKey ? .1 : .01;
    setXY(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : xy.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), event.key === 'Home' ? 0 : event.key === 'End' ? 1 : xy.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0));
  });
  on(q('#director-x'), 'input', event => setXY(Number(event.target.value), currentXY().y));
  on(q('#director-y'), 'input', event => setXY(currentXY().x, Number(event.target.value)));
  const cornerNames = ['Bottom left', 'Bottom right', 'Top left', 'Top right'];
  for (let i = 0; i < 4; i++) {
    const row = document.createElement('div'); row.className = 'director-field director-corner-field';
    row.innerHTML = `<label for="director-corner-${i}"><i></i>${cornerNames[i]}</label><select id="director-corner-${i}"></select>`;
    const select = row.querySelector('select'); VISUAL_PRESETS.forEach(preset => select.append(makeOption(preset.name, preset.id)));
    const capturedOption = makeOption('Captured look', 'captured'); capturedOption.disabled = true;
    select.append(capturedOption, makeOption('＋ Capture current look', 'capture'));
    q('#director-corners').append(row); cornerRows.push(select);
    on(select, 'change', event => {
      const current = config(), value = event.target.value, preset = VISUAL_PRESETS.find(item => item.id === value); let corner;
      if (value === 'capture') {const snapshot = getSnapshot(); corner = {name: `${getScene(snapshot.scene).short} · captured`, settings: sanitizeVisualSettings(snapshot.settings)};}
      else if (preset) corner = {name: preset.name, settings: {...preset.settings}};
      else {refresh(); return;}
      const corners = current.morph.corners.map((item, index) => index === i ? corner : item);
      commitChange({morph: {...current.morph, corners}});
      select.value = value === 'capture' ? 'captured' : value;
    });
  }
  function makeRoute(route, index) {
    const row = document.createElement('div'); row.className = 'director-route';
    row.innerHTML = `<div class="director-route-top"><label class="director-route-enable"><input type="checkbox" role="switch" aria-label="Enable route ${index + 1}"><span>ROUTE 0${index + 1}</span></label><span class="director-route-state">Off</span><span class="director-meter" role="meter" aria-label="Route ${index + 1} source level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></span></div><div class="director-route-flow"><label><span class="sr-only">Route ${index + 1} source</span><select class="director-route-source"></select></label><span aria-hidden="true">→</span><label><span class="sr-only">Route ${index + 1} target</span><select class="director-route-target"></select></label></div><div class="director-route-depth"><label for="director-route-amount-${index}">Depth</label><input id="director-route-amount-${index}" type="range" min="-1" max="1" step=".01" aria-label="Route ${index + 1} depth"><output for="director-route-amount-${index}"></output></div>`;
    const source = row.querySelector('.director-route-source'), target = row.querySelector('.director-route-target');
    DIRECTOR_SOURCES.forEach(item => source.append(makeOption(item.label, item.id)));
    DIRECTOR_TARGETS.forEach(item => target.append(makeOption(`${item.label}${item.scene ? ` · ${getScene(item.scene).short}` : ''}`, item.id)));
    const change = patch => {const current = config(); commitChange({routes: current.routes.map(item => item.id === route.id ? {...item, ...patch} : item)});};
    on(row.querySelector('input[type="checkbox"]'), 'change', event => change({enabled: event.target.checked}));
    on(source, 'change', event => change({source: event.target.value})); on(target, 'change', event => change({target: event.target.value}));
    on(row.querySelector('input[type="range"]'), 'input', event => change({amount: Number(event.target.value)}));
    q('#director-routes').append(row); routeRows.set(route.id, row); return row;
  }
  function makeCue(cue) {
    const row = document.createElement('li'); row.className = 'director-cue'; row.dataset.cueId = cue.id;
    row.innerHTML = `<div class="director-cue-top"><span class="director-cue-index"></span><span class="director-cue-scene"></span><span class="director-cue-current" hidden>ON SCREEN</span><button class="director-remove-cue" type="button" aria-label="Remove cue">×</button></div><label class="sr-only">Cue name<input class="director-cue-label" type="text" maxlength="48" autocomplete="off"></label><div class="director-cue-edit"><label>At second<input class="director-cue-time" type="number" min="0" max="86400" step=".1" required></label><label>Transition · s<input class="director-cue-duration" type="number" min="0" max="30" step=".1" required></label><button class="director-jump-cue" type="button">Jump to cue ↗</button></div>`;
    // Keep a visible name field while retaining its accessible text label.
    const nameWrapper = row.querySelector('.sr-only'); nameWrapper.className = 'director-cue-name-label'; nameWrapper.firstChild.textContent = 'Cue name';
    const edit = (key, value, input) => {
      const current = config(); if (scoreMismatch(current)) {report('This score belongs to another track. Return to that song to edit it.', true); refresh(); return;}
      if (key !== 'label' && (!Number.isFinite(value) || !input.checkValidity())) {report('Use a valid time or transition length.', true); input.reportValidity(); return;}
      if (key === 'time' && current.cues.some(item => item.id !== cue.id && Math.abs(item.time - value) < .00001)) {report('There is already a cue at that second. Choose another moment.', true); input.value = String(current.cues.find(item => item.id === cue.id)?.time || 0); return;}
      if (key === 'time' && Number.isFinite(audio.duration) && audio.duration > 0 && value > audio.duration) {report('Choose a moment within this song.', true); input.value = String(current.cues.find(item => item.id === cue.id)?.time || 0); return;}
      commitChange({cues: current.cues.map(item => item.id === cue.id ? {...item, [key]: key === 'label' ? value.trim().slice(0, 48) || 'Untitled moment' : value} : item)});
    };
    for (const [key, selector] of [['label', '.director-cue-label'], ['time', '.director-cue-time'], ['duration', '.director-cue-duration']]) on(row.querySelector(selector), 'change', event => edit(key, key === 'label' ? event.target.value : Number(event.target.value), event.target));
    on(row.querySelector('.director-remove-cue'), 'click', () => removeCue(cue.id));
    on(row.querySelector('.director-jump-cue'), 'click', () => {
      const current = config(), target = current.cues.find(item => item.id === cue.id); if (!target || scoreMismatch(current) || !getTrack()) return;
      try {const time = Math.min(target.time, Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : target.time); if (seek) seek(time); else audio.currentTime = time; report('Playhead moved to the cue.');} catch {report('This song is not ready to seek yet.', true);}
    });
    cueRows.set(cue.id, row); return row;
  }
  function removeCue(id) {
    const current = config(), ordered = [...current.cues].sort((a, b) => a.time - b.time), index = ordered.findIndex(cue => cue.id === id);
    if (index < 0) return;
    const restoreFocus = cueRows.get(id)?.contains(document.activeElement), neighbors = [ordered[index + 1]?.id, ordered[index - 1]?.id];
    const cues = current.cues.filter(cue => cue.id !== id);
    commitChange({cues, ...(!cues.length ? {scoreTrackId: null, ...(current.mode === 'score' ? {mode: 'manual'} : {})} : {})});
    if (restoreFocus && !cueRows.has(id)) {
      const target = neighbors.map(key => cueRows.get(key)?.querySelector('.director-remove-cue')).find(Boolean) || q('#director-capture-cue');
      (target.disabled ? q('#director-tab-score') : target).focus();
    }
  }
  function scoreMismatch(current = config()) {return Boolean(current.cues.length && current.scoreTrackId !== getTrack()?.id);}
  function scoreUsable(current = config()) {return Boolean(getTrack()?.id && !scoreMismatch(current));}
  on(q('#director-use-playhead'), 'click', () => {q('#director-cue-time').value = (Math.round(clamp(audio.currentTime, 0, 86400) * 10) / 10).toString();});
  function toggleScore() {const current = config(); if (current.mode !== 'score' && (!scoreUsable(current) || !current.cues.length)) return; commitChange({mode: current.mode === 'score' ? 'manual' : 'score', follow: false});}
  function clearScore() {const current = config(); const result = commitChange({cues: [], scoreTrackId: null, ...(current.mode === 'score' ? {mode: 'manual'} : {})}); if (result?.ok) report('Score cleared. Your Studio look is unchanged.');}
  on(q('#director-arm'), 'click', toggleScore);
  on(q('#director-clear'), 'click', clearScore);
  on(q('#director-capture-form'), 'submit', event => {
    event.preventDefault(); const current = config(), track = getTrack(); if (!track?.id || !scoreUsable(current)) return;
    const form = q('#director-capture-form'); if (!form.reportValidity()) return;
    const time = Number(q('#director-cue-time').value), duration = Number(q('#director-cue-duration').value);
    if (!Number.isFinite(time) || !Number.isFinite(duration)) return;
    if (Number.isFinite(audio.duration) && audio.duration > 0 && time > audio.duration) {report('Choose a moment within this song.', true); return;}
    const existing = current.cues.find(cue => Math.abs(cue.time - time) < .00001);
    if (!existing && current.cues.length >= 24) {report('Your score has 24 moments. Remove a cue before adding another.', true); return;}
    const snapshot = getSnapshot(), cue = {id: existing?.id || cueId(), time, duration, label: q('#director-cue-label').value.trim().slice(0, 48) || `Moment ${current.cues.length + (existing ? 0 : 1)}`, scene: getScene(snapshot.scene).id, settings: sanitizeVisualSettings(snapshot.settings)};
    const result = commitChange({scoreTrackId: track.id, cues: [...current.cues.filter(item => item.id !== existing?.id), cue]});
    if (result?.ok) {q('#director-cue-label').value = ''; report(existing ? 'The cue at this moment now holds your current view.' : 'Moment captured. Arm the score when you are ready.');}
  });
  const optics = [
    ['dispersion', 'Chromatic separation', 'A fine fringe of color at the edges of the lens.'],
    ['streak', 'Anamorphic streaks', 'Let bright highlights stretch into horizontal light.'],
    ['grain', 'Film grain', 'A subtle texture across the finished frame.']
  ];
  for (const [key, label, help] of optics) {
    const row = document.createElement('div'); row.className = 'director-range';
    row.innerHTML = `<div><label for="director-optic-${key}">${label}</label><output for="director-optic-${key}">0%</output></div><input id="director-optic-${key}" type="range" min="0" max="1" step=".01" value="0" aria-describedby="director-optic-help-${key}"><p class="director-help" id="director-optic-help-${key}">${help}</p>`;
    q('#director-optics').append(row); on(row.querySelector('input'), 'input', event => commitChange({optics: {...config().optics, [key]: Number(event.target.value)}}));
  }
  on(q('#director-camera'), 'change', event => commitChange({camera: {...config().camera, mode: event.target.value}}));
  on(q('#director-camera-amount'), 'input', event => commitChange({camera: {...config().camera, amount: Number(event.target.value)}}));
  on(q('#director-reset-lens'), 'click', () => commitChange({optics: {dispersion: 0, streak: 0, grain: 0}, camera: {mode: 'still', amount: .35}}));
  on(q('#director-capture-frame'), 'click', async () => {
    if (capturePending) return; capturePending = true; q('#director-capture-frame').disabled = true; q('#director-capture-frame').textContent = 'Capturing your frame…';
    try {await captureFrame(); if (!disposed) {report('Your PNG download has started.'); toast?.('Your current 3D frame is ready to download.');}}
    catch (error) {if (!disposed) {const message = error?.message || 'This frame could not be saved. Please try again.'; report(message, true); toast?.(message);}}
    finally {capturePending = false; if (!disposed) {q('#director-capture-frame').disabled = false; q('#director-capture-frame').textContent = 'Capture frame ↗';}}
  });
  function refreshScore(current) {
    const track = getTrack(), usable = scoreUsable(current), mismatch = scoreMismatch(current), changedTrack = trackKey !== (track?.id || null);
    if (changedTrack) {trackKey = track?.id || null; if (document.activeElement !== q('#director-cue-time')) q('#director-cue-time').value = String(Math.round(clamp(audio.currentTime, 0, 86400) * 10) / 10);}
    q('#director-track-title').textContent = track?.title || 'Bring your music';
    q('#director-track-note').textContent = !track ? 'Add a song to capture moments and build its visual score.' : mismatch ? 'This score belongs to another track. Return to that song, or clear this score to begin here.' : current.cues.length ? 'This score follows this song, wherever you seek.' : 'Your song is ready. Capture a look to begin.';
    q('#director-cue-count').textContent = `${current.cues.length} / 24 cues`;
    q('#director-arm').disabled = current.mode !== 'score' && (!usable || !current.cues.length); q('#director-arm').setAttribute('aria-pressed', String(current.mode === 'score')); q('#director-arm').textContent = current.mode === 'score' ? 'Disarm score' : 'Arm score';
    q('#director-clear').disabled = !current.cues.length;
    for (const field of q('#director-capture-form').querySelectorAll('input, button')) field.disabled = !usable;
    q('#director-capture-cue').textContent = current.cues.length >= 24 ? 'Capture / replace at this second' : '＋ Capture this moment';
    q('#director-score-empty').hidden = current.cues.length > 0;
    for (const [id, row] of cueRows) if (!current.cues.some(cue => cue.id === id)) {row.remove(); cueRows.delete(id);}
    const list = q('#director-cues');
    [...current.cues].sort((a, b) => a.time - b.time).forEach((cue, index) => {
      const row = cueRows.get(cue.id) || makeCue(cue);
      if (list.children[index] !== row) list.insertBefore(row, list.children[index] || null);
      row.querySelector('.director-cue-index').textContent = `${String(index + 1).padStart(2, '0')} / ${clock(cue.time)}`;
      row.querySelector('.director-cue-scene').textContent = getScene(cue.scene).short;
      setInput(row.querySelector('.director-cue-label'), cue.label); setInput(row.querySelector('.director-cue-time'), cue.time); setInput(row.querySelector('.director-cue-duration'), cue.duration);
      row.querySelector('.director-remove-cue').setAttribute('aria-label', `Remove cue ${cue.label}`);
      for (const field of row.querySelectorAll('input')) field.disabled = mismatch;
      row.querySelector('.director-jump-cue').disabled = !usable;
    });
  }
  function refresh() {
    if (disposed) return; const current = config(); if (!current) return;
    q('#director-manual').setAttribute('aria-pressed', String(current.mode === 'manual' && !current.routes.some(route => route.enabled)));
    q('#director-morph').setAttribute('aria-pressed', String(current.mode === 'morph')); q('#director-follow').checked = current.follow;
    for (let i = 0; i < 4; i++) {
      const corner = current.morph.corners[i], preset = VISUAL_PRESETS.find(item => sameLook(item.settings, corner.settings));
      q(`[data-corner-name="${i}"]`).textContent = corner.name; setInput(cornerRows[i], preset?.id || 'captured');
    }
    if (pointerId === null && !(current.mode === 'morph' && current.follow && lastLive?.mode === 'morph')) updatePad(current.morph);
    for (const [id, row] of routeRows) if (!current.routes.some(route => route.id === id)) {row.remove(); routeRows.delete(id);}
    current.routes.forEach((route, index) => {
      const row = routeRows.get(route.id) || makeRoute(route, index);
      row.querySelector('input[type="checkbox"]').checked = route.enabled; row.classList.toggle('is-on', route.enabled);
      setInput(row.querySelector('.director-route-source'), route.source); setInput(row.querySelector('.director-route-target'), route.target); setInput(row.querySelector('input[type="range"]'), route.amount);
      row.querySelector('output').value = `${route.amount > 0 ? '+' : ''}${Math.round(route.amount * 100)}%`;
    });
    for (const [key] of optics) {const input = q(`#director-optic-${key}`); setInput(input, current.optics[key]); input.previousElementSibling.querySelector('output').value = percent(current.optics[key]);}
    setInput(q('#director-camera'), current.camera.mode); setInput(q('#director-camera-amount'), current.camera.amount); q('#director-camera-value').value = percent(current.camera.amount); q('#director-camera-amount').disabled = current.camera.mode === 'still';
    refreshScore(current); update(getLive?.() || lastLive);
  }
  function update(live) {
    if (disposed) return; if (live) lastLive = live;
    const current = config(); if (!current) return;
    q('#director-mode-label').textContent = current.mode === 'score' ? 'SCORE ARMED' : current.mode === 'morph' ? current.follow ? 'MUSIC GUIDED' : 'LIVE MORPH' : current.routes.some(route => route.enabled) ? 'SIGNAL ROUTING' : 'MANUAL';
    setText(q('#director-live-status'), live?.status || 'Manual look');
    const motionHeld = live?.capabilities?.motion === false, waitingForCue = current.mode === 'score' && (scoreMismatch(current) || !live?.activeCueId);
    q('.director-live-line').classList.toggle('is-performing', !audio.paused && !motionHeld && !waitingForCue && (current.mode !== 'manual' || current.routes.some(route => route.enabled)));
    if (pointerId === null && live?.mode === 'morph' && current.mode === 'morph' && live.xy) updatePad(live.xy);
    const scene = live?.scene || getSnapshot().scene;
    for (const route of current.routes) {
      const row = routeRows.get(route.id); if (!row) continue;
      const level = clamp(live?.signals?.[route.source] || 0), target = DIRECTOR_TARGETS.find(item => item.id === route.target), applies = !target?.scene || target.scene === scene;
      row.querySelector('.director-meter i').style.transform = `scaleX(${level})`; row.querySelector('.director-meter').setAttribute('aria-valuenow', String(Math.round(level * 100)));
      const needsDetail = route.target === 'bloom' && live?.capabilities?.bloom === false;
      setText(row.querySelector('.director-route-state'), !route.enabled ? 'Off' : motionHeld ? 'Motion held' : waitingForCue ? 'Waiting for cue' : !applies ? `For ${getScene(target.scene).short}` : needsDetail ? 'Needs detail' : audio.paused ? 'Waiting' : 'On');
      row.classList.toggle('is-dormant', route.enabled && (motionHeld || waitingForCue || !applies || needsDetail));
    }
    q('#director-playhead').textContent = `${clock(audio.currentTime)}${Number.isFinite(audio.duration) ? ` / ${clock(audio.duration)}` : ''} · ${audio.ended ? 'Ended' : audio.paused ? 'Paused' : 'Playing'}`;
    for (const [id, row] of cueRows) {const active = current.mode === 'score' && live?.activeCueId === id; row.classList.toggle('is-active', active); row.querySelector('.director-cue-current').hidden = !active;}
    if (trackKey !== (getTrack()?.id || null)) refreshScore(current);
  }
  for (const event of ['loadedmetadata', 'emptied', 'play', 'pause', 'ended', 'seeked']) on(audio, event, () => {refreshScore(config()); update(getLive?.() || lastLive);});
  refresh();
  return {refresh, update, dispose() {if (disposed) return; disposed = true; cleanups.forEach(cleanup => cleanup()); if (pointerId !== null && q('#director-pad').hasPointerCapture(pointerId)) q('#director-pad').releasePointerCapture(pointerId); root.remove(); cueRows.clear(); routeRows.clear();}};
}
