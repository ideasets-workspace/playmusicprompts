import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, basename, sep } from 'node:path';
import { once } from 'node:events';
import { Store } from '../server/store.mjs';
import { createApplication } from '../server/http.mjs';
import { createJobs } from '../server/jobs.mjs';
import { readAdConfig } from '../server/ad-config.mjs';
import { appRoot } from '../server/config.mjs';

// Boundary fixtures only: real local HTTP, SQLite, and application JavaScript.
// No external scripts, identity accounts, generation, media or secrets are used.
const publicRoot = join(appRoot, 'public');
const source = name => readFileSync(join(publicRoot, name), 'utf8');
const publisher = () => readAdConfig({ PMP_ADS_ENABLED: 'true', PMP_CMP_CERTIFICATION_REVIEWED: 'true', PMP_CMP_ID: '300',
  PMP_CMP_SCRIPT_URL: 'https://cmp.fixture.invalid/message.js', PMP_AD_BANNER_UNIT: '/12345/test-banner' });
async function directory(t) {
  const folder = await mkdtemp(join(tmpdir(), 'pmp-final-security-'));
  t.after(async () => { const path = resolve(folder); assert.ok(path.startsWith(resolve(tmpdir()) + sep) && basename(path).startsWith('pmp-final-security-'));
    await rm(path, { recursive: true, force: true }); }); return folder;
}
async function application(t, advertising) {
  const stateRoot = await directory(t), store = new Store(':memory:');
  const config = { stateRoot, publicRoot, production: false, origin: 'http://127.0.0.1', oidc: null,
    ads: advertising.ads, consent: advertising.consent, adCsp: advertising.csp };
  const app = createApplication({ config, store, engine: {submit: async()=>{throw Error('Unexpected music request in a read-only security fixture');}}, media: {}, jobs: {} });
  app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
  config.origin = `http://127.0.0.1:${app.server.address().port}`;
  t.after(async () => { app.server.closeAllConnections(); await new Promise(resolve => app.server.close(resolve)); store.close(); });
  return { config, get: path => fetch(config.origin + path) };
}

test('final: every actual HTML page receives a fresh CSP nonce on all script elements, including import maps', async t => {
  const app = await application(t, publisher());
  const pages = (await readdir(publicRoot)).filter(name => name.endsWith('.html'));
  assert.ok(pages.includes('index.html') && pages.includes('player-three.html'));
  const nonces = new Set(); let scriptCount = 0;
  for (const page of pages) {
    const response = await app.get('/' + page + '?untrusted=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    assert.equal(response.status, 200, page); const html = await response.text();
    const csp = response.headers.get('content-security-policy'), nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
    assert.match(nonce, /^[A-Za-z0-9+/]{32}$/); assert.ok(!nonces.has(nonce)); nonces.add(nonce);
    assert.ok(csp.includes("'strict-dynamic'")); assert.ok(!csp.includes("script-src 'unsafe-inline'"));
    assert.equal(Number(response.headers.get('content-length')), Buffer.byteLength(html));
    const scripts = [...html.matchAll(/<script\b[^>]*>/gi)];
    for (const [tag] of scripts) { assert.ok(tag.includes(`nonce="${nonce}"`), `${page}: ${tag}`); scriptCount++; }
    // Transformation must only add nonces to the exact file; query input is never reflected.
    assert.equal(html.replaceAll(` nonce="${nonce}"`, ''), await readFile(join(publicRoot, page), 'utf8'));
  }
  assert.ok(scriptCount > 0);
});

test('final: advertising disabled keeps external origins out and hashes every actual inline script exactly', async t => {
  const app = await application(t, readAdConfig({}));
  for (const page of ['index.html', 'player-three.html']) {
    const response = await app.get('/' + page), html = await response.text(), csp = response.headers.get('content-security-policy');
    assert.equal(response.status, 200); assert.ok(!csp.includes('https://')); assert.ok(!csp.includes('nonce-'));
    assert.ok(csp.includes("frame-src 'none'"));
    for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/i.test(script[1])) continue;
      assert.ok(csp.includes(`'sha256-${createHash('sha256').update(script[2]).digest('base64')}'`));
    }
    assert.equal(html, await readFile(join(publicRoot, page), 'utf8'));
  }
});

async function browserFixture() {
  const scripts = [], requests = [], listeners = new Map(), timers = new Map(), intervals = new Map();
  let serial = 0, reloads = 0, cmpCallback;
  const node = tag => ({ tagName: tag, children: [], setAttribute() {}, remove() { this.removed = true; },
    append(...items) { this.children.push(...items); }, appendChild(item) { this.append(item); return item; } });
  const head = node('head'), body = node('body'), header = node('header'), toast = node('p');
  const document = { head, body, currentScript: { nonce: 'fixture-document-nonce' }, visibilityState: 'visible',
    createElement: node, querySelector: selector => selector === 'header' ? header : selector === '#toast' ? toast : null,
    dispatchEvent() { return true; } };
  const storage = () => { const items = new Map(); return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value), removeItem: key => items.delete(key) }; };
  const location = { pathname: '/player-three.html', origin: 'https://website.fixture.invalid', reload() { reloads++; }, assign() { throw Error('Unexpected fixture navigation'); } };
  const advertising = publisher(), session = { user: null, csrf: 'synthetic-csrf', config: { ads: advertising.ads, consent: advertising.consent, identity: { available: false } } };
  const setTimeout = (fn, ms) => { timers.set(++serial, { fn, ms }); return serial; }, clearTimeout = id => timers.delete(id);
  const setInterval = (fn, ms) => { intervals.set(++serial, { fn, ms }); return serial; }, clearInterval = id => intervals.delete(id);
  const dispatch = event => { for (const item of [...(listeners.get(event.type) || [])]) { item.fn(event); if (item.once) listeners.set(event.type, listeners.get(event.type).filter(x => x !== item)); } };
  const window = { document, location, innerWidth: 1200, setTimeout, clearTimeout, setInterval, clearInterval,
    addEventListener: (name, fn, options = {}) => listeners.set(name, [...(listeners.get(name) || []), { fn, once: options.once }]), dispatchEvent: dispatch,
    CustomEvent: class { constructor(type, options = {}) { this.type = type; Object.assign(this, options); } },
    __tcfapi(command, version, callback) { if (command === 'ping') callback({ cmpLoaded: false, cmpId: 300 }); if (command === 'addEventListener') cmpCallback = callback; },
  };
  const fetch = async (path, options) => { requests.push({ path, method: options.method });
    const responses = { '/api/session': session, '/api/jobs': { jobs: [] }, '/api/catalog': { tracks: [] }, '/api/controls-schema': { parameters: [] } };
    assert.ok(path in responses, `Unexpected fixture request ${path}`); return { ok: true, json: async () => responses[path] }; };
  const context = vm.createContext({ window, document, location, fetch, URL, URLSearchParams, console, Promise, CustomEvent: window.CustomEvent,
    localStorage: storage(), sessionStorage: storage(), setTimeout, clearTimeout, setInterval, clearInterval });
  head.append = (...items) => { for (const item of items) {
    scripts.push(item);
    if (item.src === 'platform-input.js') window.PMPPlatform = { getState: () => ({ enabled: false }), setMode() {} };
    if (['consent.js', 'advertising.js'].includes(item.src)) vm.runInContext(source(item.src), context);
    // Actual consent and advertising are executed. Player rendering is outside this
    // boundary test; third-party URLs are recorded, never fetched or executed.
    if (!item.src.startsWith('https:')) item.onload?.();
  } };
  head.appendChild = item => { head.append(item); return item; };
  await vm.runInContext(source('app-entry.js'), context);
  const accept = () => cmpCallback({ cmpId: 300, cmpStatus: 'loaded', eventStatus: 'tcloaded', gdprApplies: true, isServiceSpecific: true,
    tcString: 'TEST-ONLY-CONSENT-STRING-NOT-A-REAL-GRANT', listenerId: 17,
    purpose: { consents: { 1: true, 3: true, 4: true }, legitimateInterests: { 2: true, 7: true, 9: true, 10: true } },
    vendor: { consents: { 755: true }, legitimateInterests: { 755: true }, disclosedVendors: { 755: true } }, publisher: { restrictions: {} } }, true);
  return { window, scripts, requests, intervals, dispatch, accept, get reloads() { return reloads; } };
}
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };

test('final: actual bootstrap propagates the document nonce through local modules, CMP and consent-gated GPT loader', async () => {
  const f = await browserFixture();
  assert.equal(f.window.PMP_APP.schemaAvailable, true);
  assert.ok(f.scripts.some(s => s.src === 'player-three.js' && s.type === 'module'));
  assert.ok(f.scripts.some(s => s.src === 'https://cmp.fixture.invalid/message.js'));
  assert.ok(!f.scripts.some(s => s.src.includes('/tag/js/gpt.js')), 'Advertising SDK must wait for consent.');
  f.accept(); await flush();
  assert.ok(f.scripts.some(s => s.src === 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'));
  for (const script of f.scripts) assert.equal(script.nonce, 'fixture-document-nonce', script.src);
  assert.ok(f.requests.every(r => r.method === 'GET'));
  f.dispatch({ type: 'pagehide', persisted: false });
});

test('final: back-forward-cache restoration reloads a fresh session and consent instead of retaining destroyed services', async () => {
  const f = await browserFixture();
  f.accept(); assert.equal((await f.window.PMPConsent.getDecision({ purpose: 'audio' })).allowed, true);
  assert.equal(f.intervals.size, 1);
  f.dispatch({ type: 'pageshow', persisted: false }); assert.equal(f.reloads, 0);
  f.dispatch({ type: 'pagehide', persisted: true });
  assert.equal(f.window.PMPConsent.getState().enabled, false); assert.equal(f.intervals.size, 0);
  f.dispatch({ type: 'pageshow', persisted: true });
  assert.equal(f.reloads, 1, 'A restored document needs a fresh bootstrap after pagehide cleanup.');
  assert.ok(f.requests.every(r => r.method === 'GET'), 'Restoring must not automatically submit generation.');
});

test('final: SQLite restart submits only durable queued work, polls known jobs, resumes stored ingest and quarantines lost admission', async t => {
  const folder = await directory(t), file = join(folder, 'restart.sqlite');
  const original = new Store(file), ids = {};
  for (const state of ['queued', 'submitting', 'pending', 'ingesting']) {
    const job = original.admit({ owner: state, ipKey: state, idem: 'synthetic-' + state, payload: { prompt: state, async: true }, limits: { daily: 100, owner: 100, ip: 100 } }).job;
    ids[state] = job.id;
    original.updateJob(job.id, { status: state, ...(state === 'pending' ? { upstreamId: 'existing-native-job' } : {}),
      ...(state === 'ingesting' ? { result: { success: true, private_marker: 'synthetic-private-ingest-result' } } : {}) });
  }
  original.close();
  const store = new Store(file), submitted = [], polled = [], copied = [];
  const jobs = createJobs({ store, engine: {
    async submit(payload) { submitted.push(payload.prompt); return { job_id: 'new-native-job', status: 'queued' }; },
    async job(id) { polled.push(id); return { status: 'processing' }; },
  }, media: { async ingest(id, result) { copied.push({ id, result }); return { status: 'ready', takes: [] }; } } });
  try {
    jobs.wake(); const deadline = Date.now() + 2000;
    while (jobs.running) { assert.ok(Date.now() < deadline); await new Promise(resolve => setImmediate(resolve)); }
    jobs.stop();
    assert.deepEqual(submitted, ['queued']); assert.deepEqual(polled, ['existing-native-job']);
    assert.equal(copied.length, 1); assert.equal(copied[0].id, ids.ingesting); assert.equal(copied[0].result.private_marker, 'synthetic-private-ingest-result');
    assert.equal(store.job(ids.submitting).status, 'uncertain'); assert.equal(store.job(ids.pending).upstream_id, 'existing-native-job');
    assert.ok(!JSON.stringify(store.publicJob(store.job(ids.ingesting))).includes('synthetic-private-ingest-result'));
  } finally { jobs.stop(); store.close(); }
});
