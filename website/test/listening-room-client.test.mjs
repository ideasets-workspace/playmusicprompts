import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const [core, room] = await Promise.all(['listening-client.js', 'listening-room-client.js'].map(name => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8')));
const clone = value => JSON.parse(JSON.stringify(value));
class Events {
  listeners = new Map();
  addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) || []), fn]); }
  removeEventListener(type, fn) { this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== fn)); }
  dispatchEvent(event) { for (const fn of this.listeners.get(event.type) || []) fn(event); }
  emit(type) { this.dispatchEvent({type}); }
}
class Node extends Events {
  constructor(tag, doc) { super(); this.tagName = tag; this.doc = doc; this.children = []; this.attributes = {}; this.dataset = {}; this.textContent = ''; this.hidden = false; }
  set id(value) { this._id = value; this.doc.nodes.set(value, this); }
  get id() { return this._id; }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; if (key === 'href') delete this.href; }
}
const origin = 'http://127.0.0.1:4177';
const track = id => ({id, title: id, owned: true, url: `${origin}/api/listen/${id}`, duration: 120});
async function fixture(options = {}) {
  let clock = 0, ids = 0, revision = 0, session = null, renderCount = 0, persistCount = 0;
  let current = options.current || track('current-song');
  const queue = options.queue || [track('previous-song'), current], available = [...queue], calls = [], states = [], advances = [], notices = [], saved = new Map(), timers = new Set();
  const window = new Events(); window.location = {origin, href: `${origin}/player-three.html`};
  const document = new Events(); document.nodes = new Map(); document.createElement = tag => new Node(tag, document);
  document.getElementById = id => document.nodes.get(id) || null;
  const mount = document.createElement('div');
  const audio = new Events(); Object.assign(audio, {paused: options.paused ?? true, ended: false, currentTime: 0, seeking: false, duration: 120, readyState: 4});
  audio.pause = () => { if (!audio.paused) { audio.paused = true; audio.emit('pause'); } };
  const request = {prompt: 'The owner selected this exact sound', async: false, instrumental: true, loop_ready: true, mastering: {enabled: false}};
  const APP = {authScope: 'a'.repeat(64), jobs: options.jobs || [{id: 'owned-source-job', tracks: [current], workflow: {request}}], notify: value => notices.push(value)};
  APP.request = async (path, options = {}) => {
    calls.push({path, ...clone(options)});
    if (path === '/api/session') return {authScope: APP.authScope, csrf: 'fixture-csrf'};
    if (path === '/api/listening-sessions' && options.method === 'POST') {
      session = {id: 'listening-room-session', clientId: options.body.clientId, idempotencyKey: options.headers['Idempotency-Key'], enabled: true, playing: true, currentTrackId: options.body.trackId,
        status: 'listening', queue: [], activeJob: null, history: [], updatedAt: ++revision};
      return {session: clone(session)};
    }
    if (path === '/api/listening-sessions') return {sessions: session ? [clone(session)] : []};
    if (path.endsWith('/events')) {
      const body = options.body;
      if (body.type === 'dismiss') session.queue = session.queue.filter(item => !body.trackIds.includes(item.id));
      if (body.type === 'start') { session.currentTrackId = body.trackId; session.queue = session.queue.filter(item => item.id !== body.trackId); }
      if (body.type === 'pause' || body.type === 'disable') session.playing = false;
      if (body.type === 'disable') session.enabled = false;
      if (body.type === 'resume') { session.playing = true; session.enabled = true; }
      session.updatedAt = ++revision; return {session: clone(session)};
    }
    if (path.startsWith('/api/listening-sessions/')) return {session: clone(session)};
    throw Object.assign(Error('The source job is not available to this listener.'), {status: 404});
  };
  Object.assign(window, {PMP_APP: APP, PMPAds: {active: false, getState: () => ({paused: false})}});
  const context = vm.createContext({window, document, URL, crypto: {randomUUID: () => `room-client-${++ids}`}, performance: {now: () => clock},
    sessionStorage: {getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value)},
    setInterval: fn => { timers.add(fn); return fn; }, clearInterval: fn => timers.delete(fn), CustomEvent: class { constructor(type) { this.type = type; } }});
  vm.runInContext(core, context); vm.runInContext(room, context);
  assert.equal(window.PMP, undefined); assert.equal(window.PMPListening, undefined);
  const hasNext = options.hasNext || (() => queue.findIndex(item => item.id === current?.id) + 1 < queue.length);
  const controller = window.PMPListeningRoom.create({app: APP, audio, queue, available, getCurrent: () => current, hasNext,
    advance: async () => { advances.push(queue[queue.findIndex(item => item.id === current?.id) + 1]?.id); },
    renderQueue: () => { renderCount++; }, persistQueue: () => { persistCount++; }, statusHost: mount,
    onState: model => states.push(clone(model)), getDraftRequest: options.getDraftRequest, notify: value => notices.push(value)});
  window.PMPListening = controller; // Actual root integration assigns this instance.
  const settle = async () => { for (let i = 0; i < 20; i++) await new Promise(resolve => setImmediate(resolve)); };
  await settle();
  return {window, document, audio, APP, controller, queue, available, calls, states, advances, notices, request, mount, settle,
    get session() { return session; }, get renderCount() { return renderCount; }, get persistCount() { return persistCount; },
    get posts() { return calls.filter(item => item.method === 'POST'); }, get events() { return calls.filter(item => item.path.endsWith('/events')).map(item => item.body); },
    select(track) { current = track; audio.currentTime = 0; },
    advanceTime(seconds, position = audio.currentTime + seconds) { clock += seconds * 1000; audio.currentTime = position; audio.emit('timeupdate'); },
    async tick() { for (const fn of timers) fn(); await settle(); }};
}

test('the room creates a real host without PMP and bootstraps read-only with an accessible opt-in switch', async () => {
  const f = await fixture(); assert.equal(f.window.PMP, undefined); assert.equal(f.posts.length, 0);
  const checkbox = f.document.getElementById('room-listening-enabled'), status = f.document.getElementById('room-listening-status');
  assert.equal(checkbox.checked, false); assert.equal(checkbox.attributes['aria-describedby'], 'room-listening-description');
  assert.equal(status.attributes.role, 'status'); assert.equal(status.attributes['aria-live'], 'polite');
  await f.tick(); assert.equal(f.posts.length, 0);
});

test('same-origin absolute room tracks retain their exact original request and wait for actual play', async () => {
  const f = await fixture(); const toggle = f.document.getElementById('room-listening-enabled'); toggle.checked = true; toggle.emit('change'); await f.settle();
  assert.equal(f.posts.length, 0); assert.match(f.document.getElementById('room-listening-status').textContent, /Press play/);
  f.audio.paused = false; f.audio.emit('play'); await f.controller.onTrackStart(); await f.settle();
  assert.equal(f.posts.length, 1); assert.deepEqual(f.posts[0].body.request, f.request);
  assert.equal(f.posts[0].body.trackId, 'current-song');
});

test('a missing original and missing current draft refuses generation rather than substituting a sample', async () => {
  const f = await fixture({paused: false, jobs: []}); assert.equal(await f.controller.setEnabled(true), false);
  assert.equal(f.posts.length, 0); assert.match(f.document.getElementById('room-listening-status').textContent, /Open Create/);
  const request = {prompt: 'An explicitly supplied validated draft', async: false, mastering: {enabled: false}};
  const supplied = await fixture({paused: false, jobs: [], getDraftRequest: async () => request});
  await supplied.controller.setEnabled(true); assert.deepEqual(supplied.posts[0].body.request, request);
});

test('current and previous room tracks are not mistaken for future songs; prepared music appends without removing current', async () => {
  const f = await fixture({paused: false}); await f.controller.setEnabled(true); f.advanceTime(4);
  await f.controller.ending('skip', {waitForNext: true}); assert.equal(f.audio.paused, true);
  await f.controller.refresh(); assert.equal(f.advances.length, 0);
  f.session.queue = [track('prepared-next')]; f.session.updatedAt++;
  await f.controller.refresh(); await f.settle();
  assert.deepEqual(f.queue.map(item => item.id), ['previous-song', 'current-song', 'prepared-next']);
  assert.deepEqual(f.advances, ['prepared-next']); assert.equal(f.available.at(-1).url, '/api/listen/prepared-next');
});

test('manual/local queue order survives repeated prepared delivery, current consumption, and duplicate IDs', async () => {
  const current = track('current-song'), local = {id: 'local-upload', title: 'Local music', local: true, url: 'blob:local'};
  const f = await fixture({paused: false, current, queue: [current, local, track('manual-choice')]}); await f.controller.setEnabled(true);
  f.session.queue = [track('prepared-next'), track('prepared-next'), track('local-upload')]; f.session.updatedAt++;
  await f.controller.refresh(); await f.controller.refresh();
  assert.deepEqual(f.queue.map(item => item.id), ['current-song', 'local-upload', 'manual-choice', 'prepared-next']);
  assert.equal(f.queue[1], local); assert.equal(f.queue[1].url, 'blob:local'); assert.equal(f.renderCount, 1); assert.equal(f.persistCount, 1);
  await f.controller.ending('skip'); f.select(f.queue[3]); await f.controller.onTrackStart(); await f.controller.refresh();
  assert.equal(f.queue.length, 4); assert.equal(f.queue[3].id, 'prepared-next');
  assert.equal(f.events.filter(item => item.type === 'start').at(-1).trackId, 'prepared-next');
});

test('the room delegates next eligibility to the supplied real shuffle/repeat policy', async () => {
  let eligible = false;
  const f = await fixture({paused: false, hasNext: () => eligible}); await f.controller.setEnabled(true); f.audio.ended = true; f.audio.paused = true;
  await f.controller.ending('ended'); f.session.queue = [track('prepared-next')]; f.session.updatedAt++;
  await f.controller.refresh(); assert.equal(f.advances.length, 0);
  eligible = true; await f.controller.refresh(); assert.equal(f.advances.length, 1);
});

test('user pause during room waiting suppresses late autoplay and explicit play can resume it', async () => {
  const f = await fixture({paused: false}); await f.controller.setEnabled(true); await f.controller.ending('skip', {waitForNext: true});
  f.controller.setPlayIntent(false); await f.settle(); f.session.queue = [track('prepared-next')]; f.session.updatedAt++;
  await f.controller.refresh(); assert.equal(f.advances.length, 0);
  f.controller.setPlayIntent(true); await f.settle(); assert.deepEqual(f.advances, ['prepared-next']);
});

test('room progress links address the actual job in a separate tab and never require a pretend main popup', async () => {
  const f = await fixture({paused: false}); await f.controller.setEnabled(true);
  f.session.activeJob = {id: 'actual-next-job', status: 'uncertain', workflow: {kind: 'create', status: 'uncertain', request: {prompt: 'Actual request'}}};
  f.session.error = {message: '<svg onload=alert(1)>'}; f.session.status = 'needs-attention'; f.session.updatedAt++;
  await f.controller.refresh();
  const section = f.document.getElementById('room-listening-session'), [progress, check, resume] = section.children[3].children;
  assert.equal(progress.href, '/index.html?job=actual-next-job'); assert.equal(progress.target, '_blank'); assert.equal(progress.rel, 'noopener');
  assert.equal(check.hidden, false); assert.equal(resume.hidden, false); assert.equal(f.states.at(-1).preparing, false);
  const text = f.document.getElementById('room-listening-status'); assert.equal(text.textContent, '<svg onload=alert(1)>'); assert.equal(text.children.length, 0);
});

test('canonical ownership accepts only this origin and the exact same track id without query or credentials', async () => {
  const f = await fixture(); const canonical = f.window.PMPListeningFactory.canonicalTrack;
  assert.equal(canonical(track('current-song')).url, '/api/listen/current-song');
  for (const url of ['https://evil.test/api/listen/current-song', '/api/listen/another-song', '/api/listen/current-song?token=abc', '/api/listen/current-song#fragment', `http://u:p@127.0.0.1:4177/api/listen/current-song`, 'blob:owned']) {
    assert.equal(canonical({...track('current-song'), url}), null, url);
  }
});

test('choosing a local upload turns off continuation without modifying the upload or counting it as an owned track', async () => {
  const f = await fixture({paused: false}); await f.controller.setEnabled(true);
  const local = {id: 'local-upload', title: 'Personal file', url: 'blob:local', local: true};
  await f.controller.ending('skip'); f.queue.push(local); f.available.push(local); f.select(local); await f.controller.onTrackStart(); await f.settle();
  assert.equal(f.controller.getState().enabled, false); assert.equal(f.events.at(-1).type, 'disable'); assert.equal(f.queue.at(-1), local);
  assert.ok(f.notices.some(item => /local audio file/.test(item)));
});

test('dispose before the room pauses audio removes listeners and prevents hidden POSTs', async () => {
  const f = await fixture({paused: false}); await f.controller.setEnabled(true); const count = f.posts.length;
  f.controller.dispose(); f.audio.pause(); f.advanceTime(5); await f.tick(); f.audio.paused = false; f.audio.emit('play'); await f.settle();
  assert.equal(f.posts.length, count); assert.equal((f.audio.listeners.get('play') || []).length, 0);
});

test('the actual room host exposes acknowledged removal without losing current, manual order or local uploads', async () => {
  const current = track('current-song'), local = {id: 'device-file', title: 'Device audio', local: true, url: 'blob:device'};
  const f = await fixture({paused: false, current, queue: [track('previous-song'), current, local, track('manual-song')]});
  await f.controller.setEnabled(true);
  const id = 'b'.repeat(64); f.session.queue = [track(id)]; f.session.updatedAt++;
  await f.controller.refresh(); f.audio.pause(); await f.settle();
  assert.equal(await f.controller.dismissPrepared([id]), true);
  assert.equal(f.events.at(-1).type, 'dismiss'); assert.deepEqual(f.events.at(-1).trackIds, [id]);
  assert.ok(f.queue.some(item => item.id === id)); // Real room handler removes it after awaiting this receipt.
  f.queue.splice(f.queue.findIndex(item => item.id === id), 1);
  await f.controller.refresh();
  assert.deepEqual(f.queue.map(item => item.id), ['previous-song', 'current-song', 'device-file', 'manual-song']);
  assert.equal(f.queue[2], local); assert.ok(f.available.some(item => item.id === id));
  assert.equal(f.controller.getState().playing, false); assert.equal(f.advances.length, 0);
});

test('confirmed reset before room Clear prevents its old prepared songs from reappearing on a later GET', async () => {
  const f = await fixture({paused: false}); await f.controller.setEnabled(true);
  const id = 'c'.repeat(64); f.session.queue = [track(id)]; f.session.updatedAt++;
  await f.controller.refresh(); assert.ok(f.queue.some(item => item.id === id));
  await f.controller.resetForCreation(); f.queue.splice(0); f.select(null); f.audio.pause();
  await f.controller.refresh(); await f.tick();
  assert.deepEqual(f.queue, []); assert.equal(f.controller.getState().session, null);
  assert.equal(f.session.enabled, false); assert.equal(f.advances.length, 0);
});
