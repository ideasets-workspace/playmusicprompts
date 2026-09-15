import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/listening-client.js', import.meta.url), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
class Events {
  listeners = new Map();
  addEventListener(name, fn) { const list = this.listeners.get(name) || []; list.push(fn); this.listeners.set(name, list); }
  removeEventListener(name, fn) { this.listeners.set(name, (this.listeners.get(name) || []).filter(item => item !== fn)); }
  dispatchEvent(event) { for (const fn of this.listeners.get(event.type) || []) fn(event); }
  emit(type, extra = {}) { this.dispatchEvent({type, ...extra}); }
}
class Node extends Events {
  constructor(tag, doc) { super(); this.tagName = tag; this.doc = doc; this.children = []; this.dataset = {}; this.attributes = {}; this.hidden = false; this.textContent = ''; }
  set id(value) { this._id = value; this.doc.nodes.set(value, this); }
  get id() { return this._id; }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(key, value) { this.attributes[key] = value; }
}
const track = (id = 'track-one') => ({id, title: `Music ${id}`, owned: true, url: `/api/listen/${id}`, duration: 120});
async function fixture(options = {}) {
  let now = 0, serial = 0, updated = 0;
  const storage = options.storage || new Map(), calls = [], notifications = [], opened = [], intervals = new Set();
  const window = new Events(), document = new Events(); document.nodes = new Map();
  window.location = {href: 'http://127.0.0.1:4177/index.html', origin: 'http://127.0.0.1:4177'};
  document.createElement = tag => new Node(tag, document);
  document.getElementById = id => document.nodes.get(id) || null;
  const host = document.createElement('div'); document.querySelector = query => query === '.player-extra' ? host : null;
  const audio = new Events(); Object.assign(audio, {currentTime: 0, paused: options.paused ?? false, ended: false, seeking: false, duration: 120, readyState: 4});
  audio.pause = () => { if (!audio.paused) { audio.paused = true; audio.emit('pause'); } };
  const current = options.current || track();
  const state = {current, songs: [current], queue: options.queue || [], draft: {prompt: 'The current edited direction', mix: {normalize: false}}, continuation: false};
  const original = options.original || {prompt: 'Original chosen sound', vocals: {mode: 'instrumental'}, async: false, mastering: {enabled: false}};
  let sessions = options.sessions || [], nextCalls = 0, fallbackCalls = 0;
  const dismissalReceipts = new Map();
  const P = {state, audio, pageHooks: [], actions: {next: async () => { nextCalls++; if (options.next) await options.next(); }}, updatePlayer() {},
    registerTrack(value) { const item = clone(value), index = state.songs.findIndex(t => t.id === item.id); if (index < 0) state.songs.push(item); else state.songs[index] = item; return item; }};
  const APP = {authScope: options.authScope || 'a'.repeat(64), jobs: options.jobs ?? [{id: 'original-job', tracks: [current], workflow: {request: original}}], notify: message => notifications.push(message)};
  function view(base = {}) {
    return {id: 'session-one', clientId: JSON.parse(storage.get('pmp.listening.tab.v1')).clientId, enabled: true, playing: true, status: 'listening', currentTrackId: current.id,
      queue: [], activeJob: null, history: [], policy: null, updatedAt: ++updated, ...base};
  }
  async function defaultRequest(path, request = {}) {
    if (path === '/api/session') return {authScope: APP.authScope, csrf: 'fixture-csrf'};
    if (path === '/api/listening-sessions' && request.method === 'POST') {
      let session = sessions.find(s => s.idempotencyKey === request.headers['Idempotency-Key']);
      if (!session) { session = view({currentTrackId: request.body.trackId, idempotencyKey: request.headers['Idempotency-Key']}); sessions.unshift(session); }
      return {session: clone(session)};
    }
    if (path === '/api/listening-sessions') return {sessions: clone(sessions)};
    if (path.endsWith('/events')) {
      const session = sessions.find(s => path.includes(s.id)); if (!session) throw Object.assign(Error('Not found'), {status: 404});
      const event = request.body;
      if (event.type === 'dismiss') {
        if (dismissalReceipts.has(event.eventId)) {
          assert.deepEqual(clone(event), dismissalReceipts.get(event.eventId)); return {session: clone(session)};
        }
        if (event.trackIds.some(id => id === session.currentTrackId || !session.queue.some(item => item.id === id))) throw Object.assign(Error('The prepared queue changed. Refresh it before removing these songs.'), {status: 409, code: 'QUEUE_CHANGED'});
        session.queue = session.queue.filter(item => !event.trackIds.includes(item.id)); dismissalReceipts.set(event.eventId, clone(event));
      }
      if (event.type === 'start') { session.currentTrackId = event.trackId; session.queue = session.queue.filter(t => t.id !== event.trackId); }
      if (event.type === 'pause' || event.type === 'disable') session.playing = false;
      if (event.type === 'disable') session.enabled = false;
      if (event.type === 'resume') { session.playing = true; session.enabled = true; }
      session.updatedAt = ++updated; return {session: clone(session)};
    }
    if (path.startsWith('/api/listening-sessions/')) {
      const session = sessions.find(s => path.endsWith(s.id)); if (!session) throw Object.assign(Error('Not found'), {status: 404});
      return {session: clone(session)};
    }
    throw Object.assign(Error('Not found'), {status: 404});
  }
  APP.request = async (path, request = {}) => {
    calls.push({path, ...clone(request)});
    return options.request ? options.request(path, request, defaultRequest) : defaultRequest(path, request);
  };
  Object.assign(window, {PMP: P, PMP_APP: APP, PMPAds: {active: false, getState: () => ({paused: false})},
    PMPControls: {payload(draft) { fallbackCalls++; return clone(draft); }}, PMPWorkflow: {openCreate: id => opened.push(id)}});
  const context = vm.createContext({window, document, sessionStorage: {getItem: key => storage.get(key) || null, setItem(key, value) { if (options.storageFails) throw Error('Storage denied'); storage.set(key, value); }},
    URL, crypto: {randomUUID: () => `random-id-${++serial}`}, performance: {now: () => now},
    setInterval: fn => { intervals.add(fn); return fn; }, clearInterval: id => intervals.delete(id), CustomEvent: class { constructor(type, options = {}) { this.type = type; Object.assign(this, options); } }});
  vm.runInContext(source, context);
  const settle = async () => { for (let n = 0; n < 25; n++) await new Promise(resolve => setImmediate(resolve)); };
  await settle();
  return {P, APP, audio, window, document, host, calls, notifications, opened, storage, api: window.PMPListening, original, view,
    get sessions() { return sessions; }, get nextCalls() { return nextCalls; }, get fallbackCalls() { return fallbackCalls; }, settle,
    advance(seconds, position = audio.currentTime + seconds) { now += seconds * 1000; audio.currentTime = position; audio.emit('timeupdate'); },
    async tick() { for (const fn of intervals) fn(); await settle(); },
    get posts() { return calls.filter(c => c.method === 'POST'); },
    get events() { return calls.filter(c => c.path.endsWith('/events')).map(c => c.body); }};
}

test('bootstrap is read-only; explicit enable sends the exact original false/nested selections once', async () => {
  const f = await fixture(); assert.equal(f.posts.length, 0);
  await Promise.all([f.api.setEnabled(true), f.api.setEnabled(true)]);
  assert.equal(f.posts.filter(c => c.path === '/api/listening-sessions').length, 1);
  assert.deepEqual(f.posts[0].body.request, f.original); assert.equal(f.fallbackCalls, 0);
  f.P.state.draft.prompt = 'Unrelated later edit'; f.original.prompt = 'Mutated UI object';
  assert.equal(f.posts[0].body.request.prompt, 'Original chosen sound');
});

test('original intentRequest takes precedence over the three-take wire request without altering popup evidence', async () => {
  const intent = {prompt: 'Original owner intent', async: false, mastering: {enabled: false}};
  const wire = {...intent, output_package: 'variations', variation_count: 3};
  const job = {id: 'first-three-job', tracks: [track()], workflow: {request: wire, intentRequest: intent}};
  const f = await fixture({jobs: [job]}); await f.api.setEnabled(true);
  assert.deepEqual(f.posts[0].body.request, intent); assert.deepEqual(job.workflow.request, wire);
  assert.equal(f.posts[0].body.request.output_package, undefined);
});

test('enabling while paused saves the exact brief but waits for actual play before its first POST', async () => {
  const f = await fixture({paused: true}); assert.equal(await f.api.setEnabled(true), true);
  assert.equal(f.posts.length, 0); assert.equal(f.api.getState().enabled, true);
  assert.match(f.document.getElementById('listening-session-status').children[0].textContent, /Press play to start/);
  await f.tick(); assert.equal(f.posts.length, 0);
  f.original.prompt = 'A later edit'; f.audio.paused = false; f.audio.emit('play'); await f.api.onTrackStart(); await f.settle();
  assert.equal(f.posts[0].body.request.prompt, 'Original chosen sound'); assert.equal(f.posts.filter(c => c.path === '/api/listening-sessions').length, 1);
});

test('a loading play event does not admit generation; only playable audio unblocks the staged session', async () => {
  const f = await fixture({paused: true}); await f.api.setEnabled(true);
  f.audio.readyState = 0; f.audio.paused = false; f.audio.emit('play'); f.audio.emit('waiting');
  await f.api.onTrackStart(); await f.tick(); assert.equal(f.posts.length, 0);
  f.audio.readyState = 4; f.audio.emit('playing'); await f.settle(); assert.equal(f.posts.length, 1);
  assert.equal(f.posts[0].path, '/api/listening-sessions');
});

test('an audio failure before playing makes zero generation submissions and clears play intent', async () => {
  const f = await fixture({paused: true}); await f.api.setEnabled(true);
  f.audio.readyState = 0; f.audio.paused = false; f.audio.emit('play'); f.audio.emit('error'); await f.settle(); await f.tick();
  assert.equal(f.posts.length, 0); assert.equal(f.api.getState().playing, false);
  assert.match(f.api.getState().error, /song could not start/);
});

test('switching off a never-submitted paused session removes its staged request without a POST', async () => {
  const f = await fixture({paused: true}); await f.api.setEnabled(true); await f.api.setEnabled(false);
  f.audio.paused = false; f.audio.emit('play'); await f.settle();
  assert.equal(f.posts.length, 0); assert.equal(f.api.getState().pendingStart, false);
});

test('re-enabling an existing paused session does not submit resume until real playback', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.audio.pause(); await f.settle(); await f.api.setEnabled(false);
  const count = f.posts.length; await f.api.setEnabled(true); assert.equal(f.posts.length, count);
  f.audio.paused = false; f.audio.emit('play'); await f.settle();
  assert.equal(f.events.at(-1).type, 'resume');
});

test('a catalogue track from another owner uses validated current controls, a local file cannot start', async () => {
  const f = await fixture({jobs: []}); await f.api.setEnabled(true);
  assert.equal(f.fallbackCalls, 1); assert.deepEqual(f.posts[0].body.request, f.P.state.draft);
  const local = await fixture({current: {...track(), owned: false, url: 'blob:local'}});
  assert.equal(await local.api.setEnabled(true), false); assert.equal(local.posts.length, 0);
});

test('older owned jobs are fetched read-only before falling back; network failure does not silently replace intent', async () => {
  const old = {...track(), jobId: 'older-job-id'};
  const f = await fixture({current: old, jobs: [], request: async (path, request, next) => path === '/api/jobs/older-job-id' ? {job: {tracks: [old], workflow: {request: {prompt: 'Archived original', async: false}}}} : next(path, request)});
  await f.api.setEnabled(true); assert.equal(f.posts[0].body.request.prompt, 'Archived original'); assert.equal(f.fallbackCalls, 0);
  const failed = await fixture({current: old, jobs: [], request: async (path, request, next) => { if (path.startsWith('/api/jobs/')) throw Error('Network'); return next(path, request); }});
  assert.equal(await failed.api.setEnabled(true), false); assert.equal(failed.posts.length, 0); assert.equal(failed.fallbackCalls, 0);
});

test('played seconds count wall-bounded listening and exclude seeks, pauses, ads and suspension', async () => {
  const f = await fixture(); await f.api.setEnabled(true);
  f.advance(3); await f.tick(); assert.equal(f.events.at(-1).playedSeconds, 3);
  f.audio.seeking = true; f.audio.currentTime = 100; f.audio.emit('seeking'); f.advance(1, 100); f.audio.seeking = false; f.audio.emit('seeked');
  f.advance(3, 103); await f.tick(); assert.equal(f.events.at(-1).playedSeconds, 6);
  f.audio.paused = true; f.audio.emit('pause'); f.advance(7, 110); await f.settle(); assert.equal(f.api.getState().playedSeconds, 6);
  f.audio.paused = false; f.audio.emit('play'); f.advance(3, 113); await f.tick(); assert.equal(f.api.getState().playedSeconds, 9);
  f.window.PMPAds.active = true; f.document.emit('pmp:ads-state'); f.advance(5, 118); await f.tick(); assert.equal(f.api.getState().playedSeconds, 9);
  f.window.PMPAds.active = false; f.document.emit('pmp:ads-state'); f.audio.emit('play'); f.advance(30, 148); await f.tick(); assert.equal(f.api.getState().playedSeconds, 9);
});

test('a skip reports actual listened time before the next track starts; repeated hooks do not duplicate events', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.advance(5);
  await Promise.all([f.api.ending('skip'), f.api.ending('skip')]);
  f.P.state.current = track('track-two'); f.audio.currentTime = 0;
  await Promise.all([f.api.onTrackStart(), f.api.onTrackStart()]); await f.settle();
  assert.deepEqual(f.events.filter(e => ['skip', 'start'].includes(e.type)).map(e => [e.type, e.trackId, e.playedSeconds]), [['skip', 'track-one', 5], ['start', 'track-two', 0]]);
});

test('verified queue entries append after the manual queue, de-duplicate and are consumed on start', async () => {
  const f = await fixture({queue: ['manual-track']}); await f.api.setEnabled(true);
  f.sessions[0].queue = [track('prepared-one'), track('prepared-one'), {...track('forged-one'), url: 'https://other.test/music.mp3'}, {...track('local-one'), owned: false}];
  f.sessions[0].updatedAt++;
  await f.api.refresh(); await f.api.refresh(); assert.deepEqual(f.P.state.queue, ['manual-track', 'prepared-one']);
  f.P.state.current = track('prepared-one'); f.P.state.queue = ['manual-track']; f.audio.currentTime = 0;
  await f.api.onTrackStart(); await f.api.refresh(); assert.deepEqual(f.P.state.queue, ['manual-track']);
});

test('a lost event response blocks dependent POSTs and retries the identical durable key/body', async () => {
  let fail = true;
  const f = await fixture({request: async (path, request, next) => {
    if (path.endsWith('/events') && request.body.type === 'progress' && fail) { fail = false; await next(path, request); throw Error('Response lost'); }
    return next(path, request);
  }});
  await f.api.setEnabled(true); f.advance(3); await f.tick();
  assert.equal(f.api.getState().blocked, true);
  const failed = clone(f.events.at(-1)); f.advance(3); await f.tick(); assert.equal(f.events.length, 1);
  await f.api.setEnabled(true); assert.deepEqual(f.events.filter(e => e.type === 'progress'), [failed, failed]);
  assert.equal(f.api.getState().pendingEvents, 0);
});

test('reload resolves a lost session admission using GET and never replays a billable POST automatically', async () => {
  const storage = new Map(); let fail = true;
  const f = await fixture({storage, request: async (path, request, next) => {
    const result = await next(path, request);
    if (path === '/api/listening-sessions' && request.method === 'POST' && fail) { fail = false; throw Error('Lost'); }
    return result;
  }});
  await f.api.setEnabled(true); assert.equal(f.api.getState().pendingStart, true);
  const reloaded = await fixture({storage, sessions: f.sessions, paused: true});
  assert.equal(reloaded.posts.length, 0); assert.equal(reloaded.api.getState().session.id, 'session-one');
  assert.equal(reloaded.api.getState().pendingStart, false); assert.equal(reloaded.api.getState().playing, false);
  await reloaded.tick(); assert.equal(reloaded.posts.length, 0); assert.equal(reloaded.nextCalls, 0);
});

test('an unconfirmed admission is retried under its original id and original request only on explicit enable', async () => {
  let fail = true;
  const f = await fixture({request: async (path, request, next) => {
    if (path === '/api/listening-sessions' && request.method === 'POST' && fail) { fail = false; throw Error('Never reached server'); }
    return next(path, request);
  }});
  await f.api.setEnabled(true); const first = clone(f.posts[0]);
  f.P.state.draft.prompt = 'New text'; await f.api.refresh(); assert.equal(f.posts.length, 1);
  await f.api.setEnabled(true); assert.deepEqual(f.posts[1], first);
});

test('another tab session is not silently adopted or resumed', async () => {
  const f = await fixture({sessions: [{id: 'other-session', clientId: 'other-client', enabled: true, queue: [], updatedAt: 1}]});
  assert.equal(f.api.getState().session, null); assert.equal(f.posts.length, 0);
});

test('late verified songs advance only after an actual end and retained play intent', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.advance(120);
  f.audio.ended = true; f.audio.paused = true; await f.api.ending('ended');
  f.sessions[0].queue = [track('prepared-one')]; f.sessions[0].updatedAt++;
  await f.api.refresh(); await f.settle(); assert.equal(f.nextCalls, 1);
  await f.api.refresh(); assert.equal(f.nextCalls, 1);
  const paused = await fixture(); await paused.api.setEnabled(true); paused.audio.ended = true; paused.audio.paused = true;
  await paused.api.ending('ended'); paused.api.setPlayIntent(false);
  paused.sessions[0].queue = [track('prepared-one')]; paused.sessions[0].updatedAt++;
  await paused.api.refresh(); await paused.settle(); assert.equal(paused.nextCalls, 0);
});

test('turning off suppresses autoplay before its refresh resolves a ready song', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.audio.ended = true; f.audio.paused = true;
  await f.api.ending('ended'); f.sessions[0].queue = [track('prepared-one')]; f.sessions[0].updatedAt++;
  await f.api.setEnabled(false); assert.equal(f.nextCalls, 0); assert.equal(f.events.at(-1).type, 'disable');
});

test('skip with no prepared track pauses internally and advances when ready without mistaking that pause for user intent', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.advance(4);
  await f.api.ending('skip', {waitForNext: true});
  assert.equal(f.audio.paused, true); assert.equal(f.api.getState().waiting, true); assert.equal(f.api.getState().playing, true);
  assert.equal(f.events.at(-1).type, 'skip'); assert.equal(f.events.at(-1).playedSeconds, 4);
  await f.api.onTrackStart(); assert.equal(f.api.getState().waiting, true);
  f.sessions[0].queue = [track('prepared-one')]; f.sessions[0].updatedAt++;
  await f.api.refresh(); await f.settle(); assert.equal(f.nextCalls, 1);
  const stopped = await fixture(); await stopped.api.setEnabled(true); await stopped.api.ending('skip', {waitForNext: true});
  stopped.api.setPlayIntent(false); stopped.sessions[0].queue = [track('prepared-one')]; stopped.sessions[0].updatedAt++;
  await stopped.api.refresh(); assert.equal(stopped.nextCalls, 0);
  stopped.api.setPlayIntent(true); await stopped.settle(); assert.equal(stopped.nextCalls, 1);
});

test('a user pause can be sent after an unknown progress result without replaying a potentially generating event', async () => {
  let fail = true;
  const f = await fixture({request: async (path, request, next) => {
    if (path.endsWith('/events') && request.body.type === 'progress' && fail) { fail = false; throw Error('Unknown outcome'); }
    return next(path, request);
  }});
  await f.api.setEnabled(true); f.advance(3); await f.tick();
  const failed = clone(f.events[0]); f.audio.pause(); await f.settle();
  assert.deepEqual(f.events.map(e => e.type), ['progress', 'pause']);
  assert.equal(f.api.getState().pendingEvents, 1);
  const count = f.posts.length; await f.api.setEnabled(true); await f.api.onTrackStart();
  assert.equal(f.posts.length, count);
  f.audio.paused = false; f.audio.emit('play'); await f.settle();
  assert.deepEqual(f.events.filter(e => e.type === 'progress'), [failed, failed]);
});

test('switching tracks while the first session response is pending preserves ordered feedback and announces the actual next track', async () => {
  let release;
  const f = await fixture({request: async (path, request, next) => {
    if (path === '/api/listening-sessions' && request.method === 'POST') await new Promise(resolve => { release = resolve; });
    return next(path, request);
  }});
  const enabling = f.api.setEnabled(true); await f.settle(); f.advance(4);
  void f.api.ending('skip'); f.P.state.current = track('track-two'); f.audio.currentTime = 0;
  void f.api.onTrackStart(); release(); await enabling; await f.settle();
  assert.deepEqual(f.events.map(e => [e.type, e.trackId]), [['skip', 'track-one'], ['start', 'track-two']]);
  await f.api.onTrackStart(); assert.equal(f.events.filter(e => e.type === 'start').length, 1);
});

test('disable takes precedence over an unconfirmed update and later manual play cannot drain it while off', async () => {
  let fail = true;
  const f = await fixture({request: async (path, request, next) => {
    if (path.endsWith('/events') && request.body.type === 'progress' && fail) { fail = false; throw Error('Response lost'); }
    return next(path, request);
  }});
  await f.api.setEnabled(true); f.advance(3); await f.tick(); await f.api.setEnabled(false);
  assert.deepEqual(f.events.map(e => e.type), ['progress', 'disable']);
  f.P.state.current = track('manual-next'); f.audio.currentTime = 0; await f.api.onTrackStart(); await f.tick();
  assert.deepEqual(f.events.map(e => e.type), ['progress', 'disable']);
});

test('progress events are serialized, and a blocked request does not accumulate interval POSTs', async () => {
  let release, active = 0, maxActive = 0;
  const f = await fixture({request: async (path, request, next) => {
    if (path.endsWith('/events')) { active++; maxActive = Math.max(maxActive, active); if (request.body.type === 'progress') await new Promise(resolve => { release = resolve; }); const result = await next(path, request); active--; return result; }
    return next(path, request);
  }});
  await f.api.setEnabled(true); f.advance(3); await f.tick();
  f.advance(3); await f.tick(); f.api.setPlayIntent(false); await f.settle();
  assert.equal(f.events.length, 1); assert.equal(f.api.getState().pendingEvents, 2);
  release(); await f.settle(); assert.equal(maxActive, 1); assert.deepEqual(f.events.map(e => e.type), ['progress', 'pause']);
});

test('pagehide stops heartbeats and queued POST dispatch; read-only readiness cannot autoplay', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.window.emit('pagehide');
  const before = f.posts.length; f.advance(3); await f.tick(); await f.api.setEnabled(true); await f.api.onTrackStart();
  assert.equal(f.posts.length, before); assert.equal(f.nextCalls, 0);
});

test('storage denial fails closed before any creation submission', async () => {
  const f = await fixture({storageFails: true}); assert.equal(await f.api.setEnabled(true), false); assert.equal(f.posts.length, 0);
});

test('actual active jobs update shared workflow data and open only after a status-link click; server text stays text', async () => {
  const f = await fixture(); await f.api.setEnabled(true);
  const job = {id: 'next-job-id', status: 'submitting', workflow: {id: 'next-job-id', kind: 'create', status: 'submitting', request: {prompt: 'Actual next request'}}};
  f.sessions[0].activeJob = job; f.sessions[0].error = {message: '<img src=x onerror=alert(1)>'}; f.sessions[0].updatedAt++;
  await f.api.refresh(); assert.deepEqual(f.APP.jobs[0], job); assert.deepEqual(f.opened, []);
  const node = f.document.getElementById('listening-session-status');
  assert.equal(node.children[0].textContent, '<img src=x onerror=alert(1)>'); assert.equal(node.children[0].children.length, 0);
  node.children[1].emit('click'); assert.deepEqual(f.opened, ['next-job-id']);
});

test('a recovered read clears its transient warning without posting or reviving a session disabled by the server', async () => {
  let failRead = false;
  const f = await fixture({request: async (path, request, next) => {
    if (failRead && request.method !== 'POST') throw Error('Offline');
    return next(path, request);
  }});
  await f.api.setEnabled(true); const posts = f.posts.length;
  failRead = true; await f.api.refresh(); assert.match(f.api.getState().error, /could not be refreshed/);
  failRead = false; f.sessions[0].enabled = false; f.sessions[0].playing = false; f.sessions[0].updatedAt++;
  await f.api.refresh(); assert.equal(f.api.getState().error, ''); assert.equal(f.api.getState().enabled, false);
  assert.equal(f.posts.length, posts);
});

test('reset for a new creation confirms disable then detaches local intent while preserving server history', async () => {
  const f = await fixture(); await f.api.setEnabled(true); f.sessions[0].history = [{trackId: 'old-track', listenedSeconds: 5}];
  const firstKey = f.posts[0].headers['Idempotency-Key'];
  assert.equal(await f.api.resetForCreation(), true);
  assert.equal(f.api.getState().session, null); assert.equal(f.api.getState().enabled, false);
  assert.equal(f.sessions[0].enabled, false); assert.deepEqual(f.sessions[0].history, [{trackId: 'old-track', listenedSeconds: 5}]);
  f.APP.jobs = []; f.P.state.draft = {prompt: 'The next intentional musical journey', async: false};
  await f.api.setEnabled(true);
  const admission = f.posts.filter(item => item.path === '/api/listening-sessions').at(-1);
  assert.notEqual(admission.headers['Idempotency-Key'], firstKey); assert.equal(admission.body.request.prompt, 'The next intentional musical journey');
});

test('reset clears a never-submitted staged opt-in without POSTing it', async () => {
  const f = await fixture({paused: true}); await f.api.setEnabled(true); await f.api.resetForCreation();
  assert.equal(f.posts.length, 0); assert.equal(f.api.getState().pendingStart, false); assert.equal(f.api.getState().enabled, false);
});

test('reset refuses an unconfirmed admission and retains its exact key and body', async () => {
  const f = await fixture({request: async (path, request, next) => {
    if (path === '/api/listening-sessions' && request.method === 'POST') throw Error('Unknown admission');
    return next(path, request);
  }});
  await f.api.setEnabled(true); const before = JSON.parse(f.storage.get('pmp.listening.tab.v1')).pendingStart;
  await assert.rejects(f.api.resetForCreation(), /has not been confirmed/);
  assert.deepEqual(JSON.parse(f.storage.get('pmp.listening.tab.v1')).pendingStart, before); assert.equal(f.posts.length, 1);
});

test('reset cannot erase an unconfirmed non-stop event even after disabling the server session', async () => {
  const f = await fixture({request: async (path, request, next) => {
    if (path.endsWith('/events') && request.body.type === 'progress') throw Error('Unknown progress');
    return next(path, request);
  }});
  await f.api.setEnabled(true); f.advance(3); await f.tick(); const event = clone(f.events[0]);
  await assert.rejects(f.api.resetForCreation(), /still needs confirmation/);
  assert.equal(f.sessions[0].enabled, false); assert.equal(f.api.getState().pendingEvents, 1);
  assert.deepEqual(JSON.parse(f.storage.get('pmp.listening.tab.v1')).events[0], event);
  assert.equal(f.posts.filter(item => item.path === '/api/listening-sessions').length, 1);
});

test('reset can reconcile an admitted session with a lost response by GET and disable it without another admission', async () => {
  let lost = true;
  const f = await fixture({request: async (path, request, next) => {
    const result = await next(path, request);
    if (path === '/api/listening-sessions' && request.method === 'POST' && lost) { lost = false; throw Error('Lost response'); }
    return result;
  }});
  await f.api.setEnabled(true); assert.equal(f.api.getState().pendingStart, true);
  await f.api.resetForCreation(); assert.equal(f.api.getState().session, null);
  assert.equal(f.sessions[0].enabled, false); assert.equal(f.posts.filter(item => item.path === '/api/listening-sessions').length, 1);
});

test('reset waits for an already in-flight admission and then disables that exact session', async () => {
  let release;
  const f = await fixture({request: async (path, request, next) => {
    if (path === '/api/listening-sessions' && request.method === 'POST') await new Promise(resolve => { release = resolve; });
    return next(path, request);
  }});
  const enabling = f.api.setEnabled(true); await f.settle(); const resetting = f.api.resetForCreation(); await f.settle();
  release(); await enabling; await resetting;
  assert.equal(f.api.getState().session, null); assert.equal(f.sessions[0].enabled, false);
  assert.deepEqual(f.posts.map(item => item.body.type || 'admission'), ['admission', 'disable']);
});

const preparedId = letter => letter.repeat(64);
async function prepareQueue(f, ids = [preparedId('a')]) {
  await f.api.setEnabled(true); f.sessions[0].queue = ids.map(id => track(id)); f.sessions[0].updatedAt++;
  await f.api.refresh(); return ids;
}

test('prepared removal is acknowledged while paused with only its exact durable queue event, preserving manual choices', async () => {
  const f = await fixture({queue: ['manual-choice']}); const [id] = await prepareQueue(f);
  f.audio.pause(); await f.settle(); const before = f.posts.length;
  assert.equal(await f.api.dismissPrepared([id, 'manual-choice']), true);
  assert.deepEqual(Object.keys(f.events.at(-1)).sort(), ['clientId', 'eventId', 'trackIds', 'type']);
  assert.equal(f.events.at(-1).type, 'dismiss'); assert.deepEqual(f.events.at(-1).trackIds, [id]);
  assert.equal(f.posts.length, before + 1); assert.deepEqual(f.sessions[0].queue, []);
  // Host queue is changed by the real Remove handler only after this receipt.
  assert.deepEqual(f.P.state.queue, ['manual-choice', id]); f.P.state.queue.splice(1, 1);
  await f.api.refresh(); assert.deepEqual(f.P.state.queue, ['manual-choice']); assert.equal(f.api.getState().playing, false);
});

test('manual-only removals and empty selections do not post to a listening session', async () => {
  const f = await fixture({queue: ['manual-choice']});
  assert.equal(await f.api.dismissPrepared(['manual-choice']), true); assert.equal(await f.api.dismissPrepared([]), true);
  assert.equal(f.posts.length, 0);
  await assert.rejects(f.api.dismissPrepared(Array(101).fill('manual-choice')), /up to 100/);
});

test('an unknown removal blocks re-append across GET/reload and explicit retry preserves the exact event body', async () => {
  const id = preparedId('b'), storage = new Map(); let unavailable = true;
  const f = await fixture({storage, request: async (path, request, next) => {
    if (request.body?.type === 'dismiss' && unavailable) throw Error('No receipt');
    return next(path, request);
  }});
  await prepareQueue(f, [id]); f.audio.pause(); await f.settle();
  await assert.rejects(f.api.dismissPrepared([id]), /not been confirmed/);
  const sent = clone(f.events.at(-1)); assert.equal(f.api.getState().pendingEvents, 1);
  f.P.state.queue = []; const before = f.posts.length; await f.api.refresh(); await f.tick();
  assert.deepEqual(f.P.state.queue, []); assert.equal(f.posts.length, before);
  f.api.dispose();
  const reloaded = await fixture({storage, sessions: f.sessions, paused: true});
  assert.equal(reloaded.posts.length, 0); assert.deepEqual(reloaded.P.state.queue, []);
  assert.match(reloaded.document.getElementById('listening-session-status').children[0].textContent, /queue removal/);
  assert.equal(await reloaded.api.dismissPrepared([id]), true);
  assert.deepEqual(reloaded.events.at(-1), sent); assert.equal(reloaded.api.getState().pendingEvents, 0);
});

test('an applied removal with a lost reply is confirmed by retrying its existing key even when GET no longer contains that song', async () => {
  let lost = true;
  const f = await fixture({request: async (path, request, next) => {
    const result = await next(path, request);
    if (request.body?.type === 'dismiss' && lost) { lost = false; throw Error('Reply lost'); }
    return result;
  }});
  const [id] = await prepareQueue(f); await assert.rejects(f.api.dismissPrepared([id]), /not been confirmed/);
  const sent = clone(f.events.at(-1)); assert.equal(f.sessions[0].queue.length, 0);
  await f.api.refresh(); assert.equal(f.api.getState().pendingEvents, 1);
  assert.equal(await f.api.dismissPrepared([id]), true);
  assert.deepEqual(f.events.filter(event => event.type === 'dismiss'), [sent, sent]); assert.equal(f.api.getState().blocked, false);
});

test('a definite stale-queue rejection keeps the local row, refreshes authoritative state, and exposes the actual error', async () => {
  const f = await fixture({request: async (path, request, next) => {
    if (request.body?.type === 'dismiss') throw Object.assign(Error('The queue changed. Refresh before removing this song.'), {status: 409, code: 'QUEUE_CHANGED'});
    return next(path, request);
  }});
  const [id] = await prepareQueue(f);
  await assert.rejects(f.api.dismissPrepared([id]), error => error.code === 'QUEUE_CHANGED');
  assert.ok(f.P.state.queue.includes(id)); assert.equal(f.api.getState().pendingEvents, 0);
  assert.match(f.api.getState().error, /queue changed/); assert.ok(!f.calls.at(-1).method);
});

test('dismiss is serialized after an unknown progress result without replaying that potentially generating event', async () => {
  let release, active = 0, peak = 0;
  const f = await fixture({request: async (path, request, next) => {
    if (!path.endsWith('/events')) return next(path, request);
    active++; peak = Math.max(peak, active);
    try {
      if (request.body.type === 'progress') { await new Promise(resolve => { release = resolve; }); throw Error('Unknown progress'); }
      return await next(path, request);
    } finally { active--; }
  }});
  const [id] = await prepareQueue(f); f.advance(3); await f.tick();
  const removal = f.api.dismissPrepared([id]); await f.settle(); assert.equal(f.events.length, 1);
  release(); assert.equal(await removal, true);
  assert.equal(peak, 1); assert.deepEqual(f.events.map(event => event.type), ['progress', 'dismiss']);
  assert.equal(f.api.getState().pendingEvents, 1); assert.equal(f.api.getState().blocked, true);
});

test('queue removal refuses to POST when its durable record cannot be saved', async () => {
  const options = {}, f = await fixture(options); const [id] = await prepareQueue(f); options.storageFails = true;
  const before = f.posts.length; await assert.rejects(f.api.dismissPrepared([id]), /could not save/);
  assert.equal(f.posts.length, before); assert.ok(f.P.state.queue.includes(id));
});

test('a stopped end records actual listening with playing:false and never advances a ready next song', async () => {
  const f = await fixture(); const [id] = await prepareQueue(f);
  for (let n = 0; n < 12; n++) f.advance(10);
  f.audio.ended = true; f.audio.paused = true;
  f.api.setPlayIntent(false); await f.api.ending('ended'); await f.settle();
  const ended = f.events.find(event => event.type === 'ended');
  assert.ok(ended); assert.equal(ended.playing, false); assert.equal(ended.playedSeconds, 120);
  assert.deepEqual(f.events.filter(event => ['pause', 'ended'].includes(event.type)).map(event => event.type), ['pause', 'ended']);
  await f.api.refresh(); await f.tick(); assert.equal(f.nextCalls, 0); assert.equal(f.api.getState().waiting, false);
  assert.ok(f.P.state.queue.includes(id)); assert.equal(f.api.getState().pendingEvents, 0);
});

test('logout or expired ownership archives the old session and permits a clean Create reset without replay', async()=>{
 const old=await fixture();await old.api.setEnabled(true);old.api.dispose();
 const next=await fixture({storage:old.storage,authScope:'b'.repeat(64)});
 assert.equal(next.posts.length,0);assert.equal(next.api.getState().session,null);assert.equal(next.api.getState().pendingEvents,0);
 assert.equal(await next.api.resetForCreation(),true);assert.ok([...next.storage.keys()].some(key=>key.startsWith('pmp.listening.archive.v1.')));
 assert.equal(JSON.parse(next.storage.get('pmp.listening.tab.v1')).authScope,'b'.repeat(64));
});
test('a migrated owned session is recovered paused with prior commands archived, not posted as the new owner',async()=>{
 const old=await fixture();await old.api.setEnabled(true);old.api.dispose();
 const snapshot=JSON.parse(old.storage.get('pmp.listening.tab.v1'));snapshot.events.push({type:'skip',eventId:'old-skip-event',clientId:snapshot.clientId,trackId:'track-one'});old.storage.set('pmp.listening.tab.v1',JSON.stringify(snapshot));
 const next=await fixture({storage:old.storage,authScope:'b'.repeat(64),sessions:old.sessions.map(s=>({...s,enabled:false,playing:false}))});
 assert.equal(next.posts.length,0);assert.equal(next.api.getState().session.id,old.sessions[0].id);assert.equal(next.api.getState().enabled,false);assert.equal(next.api.getState().pendingEvents,0);
});
test('a temporarily unavailable session keeps its pending receipts intact',async()=>{
 const old=await fixture();await old.api.setEnabled(true);old.api.dispose();
 const before=JSON.parse(old.storage.get('pmp.listening.tab.v1'));
 const next=await fixture({storage:old.storage,request:async(path,request,normal)=>{if(path.startsWith('/api/listening-sessions/'))throw Error('Network outage');return normal(path,request);}});
 assert.equal(next.posts.length,0);assert.equal(JSON.parse(next.storage.get('pmp.listening.tab.v1')).sessionId,before.sessionId);assert.equal([...next.storage.keys()].filter(k=>k.startsWith('pmp.listening.archive.')).length,0);
 await assert.rejects(next.api.resetForCreation(),/could not be switched off/);
});
test('cross-tab account change refuses dispatch under the new identity and requests a page reload',async()=>{
 let change=false;const f=await fixture({request:async(path,request,normal)=>path==='/api/session'&&change?{authScope:'b'.repeat(64),csrf:'new-csrf'}:normal(path,request)});
 change=true;await f.api.setEnabled(true);assert.equal(f.posts.length,0);assert.match(f.api.getState().error,/account session changed/);await assert.rejects(f.api.resetForCreation(),/Reload/);
});
test('a lost prior-owner admission is never replayed under a new guest',async()=>{
 const old=await fixture({request:async(path,request,normal)=>{if(path==='/api/listening-sessions'&&request.method==='POST')throw Error('Lost reply');return normal(path,request);}});
 await old.api.setEnabled(true);old.api.dispose();assert.equal(old.api.getState().pendingStart,true);
 const next=await fixture({storage:old.storage,authScope:'b'.repeat(64)});assert.equal(next.posts.length,0);assert.equal(next.api.getState().pendingStart,false);assert.equal(await next.api.resetForCreation(),true);
});

test('automatic reordering changes only matching queued slots and preserves manual and duplicate entries',async()=>{
 const f=await fixture(),reorder=f.window.PMPListeningFactory.reorderAutomatic;
 const q=['manual-one','faithful','manual-two','explore'];assert.equal(reorder(q,['explore','faithful']),true);assert.deepEqual(q,['manual-one','explore','manual-two','faithful']);
 const repeated=['faithful','faithful','explore'];assert.equal(reorder(repeated,['explore','faithful']),false);assert.deepEqual(repeated,['faithful','faithful','explore']);
 const room=[{id:'current'},{id:'faithful'},{id:'manual'},{id:'explore'}];assert.equal(reorder(room,['explore','current','faithful'],{idOf:t=>t.id,start:1}),true);assert.deepEqual(room.map(t=>t.id),['current','explore','manual','faithful']);
 assert.equal(reorder(q,['missing']),false);
});
