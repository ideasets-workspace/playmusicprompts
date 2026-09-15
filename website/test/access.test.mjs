import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep, extname } from 'node:path';
import { once } from 'node:events';
import { Readable } from 'node:stream';
import { Store } from '../server/store.mjs';
import { createSecurity, parseCookie, readJSON, playlistBody } from '../server/security.mjs';
import { loadConfig, appRoot } from '../server/config.mjs';
import { createApplication } from '../server/http.mjs';

// Local synthetic identities and boundary fixtures only. No identity-provider,
// generation, cloud, private application state or real credentials are accessed.
const limits = { daily: 100, owner: 100, ip: 100 };
const captured = JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json', import.meta.url)));
const trackOne = '1'.repeat(64), trackTwo = '2'.repeat(64);
async function directory(t) {
  const folder = await mkdtemp(join(tmpdir(), 'pmp-access-test-'));
  t.after(async () => {
    const path = resolve(folder), parent = resolve(tmpdir());
    assert.ok(path.startsWith(parent + sep) && basename(path).startsWith('pmp-access-test-'));
    await rm(path, { recursive: true, force: true });
  }); return folder;
}
function database(t) { const store = new Store(':memory:'); t.after(() => store.close()); return store; }
function users(store) { return ['Alice', 'Bob'].map(name => store.identity('https://identity.fixture.invalid', name.toLowerCase(), name)); }
function job(store, owner, idem = 'fixture-request', payload = { prompt: 'Fixture', async: true }) {
  return store.admit({ owner, idem, payload, ipKey: owner, limits }).job;
}
function seedTracks(store, owner = 'fixture') {
  const item = job(store, owner);
  store.publish(item, { status: 'ready', takes: [trackOne, trackTwo].map((id, i) => ({ id, take: i + 1, status: 'ready', errors: [],
    master: { id: 'a'.repeat(63) + i, codec: 'pcm_s24le', sampleRate: 48000, channels: 2 },
    listening: { id: 'b'.repeat(63) + i, durationSeconds: 15, codec: 'mp3', sampleRate: 48000, channels: 2 } })) });
  store.updateJob(item.id, { status: 'ready' }); return item;
}

test('access: two users cannot list, edit, delete or save each other\'s private playlist state', t => {
  const store = database(t), [alice, bob] = users(store); seedTracks(store);
  const playlist = store.createPlaylist(alice.id, 'Alice private mix');
  assert.deepEqual(store.playlists(bob.id), []);
  for (const action of [() => store.playlist(playlist.id, bob.id),
    () => store.changePlaylist(playlist.id, bob.id, { revision: 1, name: 'Hijacked', songs: [trackTwo] }),
    () => store.deletePlaylist(playlist.id, bob.id)]) assert.throws(action, { status: 404, code: 'NOT_FOUND' });
  assert.equal(store.playlist(playlist.id, alice.id).name, 'Alice private mix');
  store.favorite(alice.id, trackOne, true); store.favorite(bob.id, trackTwo, true);
  store.favorite(bob.id, trackOne, false);
  assert.deepEqual(store.favorites(alice.id).map(x => x.id), [trackOne]);
  assert.deepEqual(store.favorites(bob.id).map(x => x.id), [trackTwo]);
  assert.throws(() => store.favorite(alice.id, 'missing-track', true), { status: 404 });
  store.changePlaylist(playlist.id, alice.id, { revision: 1, songs: [trackOne] });
  store.deletePlaylist(playlist.id, alice.id); assert.equal(store.db.prepare('SELECT count(*) AS n FROM playlist_items').get().n, 0);
});

test('access: stale tab revision cannot overwrite another tab, and rejected changes roll back atomically', t => {
  const store = database(t), [alice] = users(store); seedTracks(store);
  const playlist = store.createPlaylist(alice.id, 'Original');
  const tabA = store.playlists(alice.id)[0], tabB = store.playlists(alice.id)[0];
  const saved = store.changePlaylist(playlist.id, alice.id, { revision: tabA.revision, name: 'Tab A', songs: [trackOne] });
  assert.equal(saved.revision, 2);
  assert.throws(() => store.changePlaylist(playlist.id, alice.id, { revision: tabB.revision, name: 'Tab B', songs: [trackTwo] }), { status: 409, code: 'PLAYLIST_CHANGED' });
  assert.deepEqual(store.playlists(alice.id)[0], saved);
  assert.throws(() => store.changePlaylist(playlist.id, alice.id, { revision: 2, name: 'Must roll back', songs: ['unavailable'] }), { status: 400 });
  assert.deepEqual(store.playlists(alice.id)[0], saved);
  const merged = store.changePlaylist(playlist.id, alice.id, { revision: 2, songs: [trackOne, trackTwo, trackOne] });
  assert.equal(merged.revision, 3); assert.deepEqual(merged.songs, [trackOne, trackTwo]);
});

test('access: existing SQLite playlist records gain revision 1 without losing ownership or names', async t => {
  const folder = await directory(t), path = join(folder, 'migration.sqlite');
  const old = new DatabaseSync(path);
  old.exec("CREATE TABLE users (id TEXT PRIMARY KEY, issuer TEXT NOT NULL, subject TEXT NOT NULL, name TEXT NOT NULL, UNIQUE(issuer,subject)); CREATE TABLE playlists (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, created INTEGER NOT NULL); INSERT INTO users VALUES ('owner','https://fixture.invalid','subject','Fixture'); INSERT INTO playlists VALUES ('existing','owner','Existing mix',123);"); old.close();
  const store = new Store(path);
  try { const result = store.playlists('owner')[0]; assert.equal(result.revision, 1); assert.equal(result.name, 'Existing mix'); assert.equal(result.createdAt, 123);
    assert.equal(store.changePlaylist('existing', 'owner', { revision: 1, name: 'Updated' }).revision, 2); }
  finally { store.close(); }
});

test('access: login claims only its guest jobs; account switching, rotation, expiry and logout preserve ownership', t => {
  const store = database(t), [alice, bob] = users(store);
  const firstGuest = store.newSession(), otherGuest = store.newSession();
  const mine = job(store, firstGuest.row.owner), theirs = job(store, otherGuest.row.owner);
  const signed = store.newSession(alice, firstGuest.row);
  assert.notEqual(signed.token, firstGuest.token); assert.notEqual(signed.row.csrf, firstGuest.row.csrf); assert.ok(!store.session(firstGuest.token));
  assert.equal(store.ownJob(mine.id, alice.id).owner, alice.id); assert.equal(store.job(theirs.id).owner, otherGuest.row.owner);
  assert.throws(() => store.ownJob(theirs.id, alice.id), { status: 404 });
  const switched = store.newSession(bob, signed.row);
  assert.ok(!store.session(signed.token)); assert.equal(store.job(mine.id).owner, alice.id);
  assert.throws(() => store.ownJob(mine.id, bob.id), { status: 404 });
  store.db.prepare('UPDATE sessions SET expires=? WHERE token_hash=?').run(Date.now() - 1, switched.row.token_hash);
  assert.ok(!store.session(switched.token)); store.cleanup();
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM sessions WHERE token_hash=?').get(switched.row.token_hash).n, 0);
  const current = store.newSession(alice), otherDevice = store.newSession(alice); store.deleteSession(current.row);
  assert.ok(!store.session(current.token)); assert.ok(store.session(otherDevice.token));
  assert.equal(store.session('forged-cookie'), null); assert.equal(parseCookie(`pmp_dev_session=${otherDevice.token}; pmp_dev_session=forged`, 'pmp_dev_session'), null);
});

test('access: colliding client request IDs cannot prevent guest jobs being safely claimed at login', t => {
  const store = database(t), [alice] = users(store), guest = store.newSession();
  const existing = job(store, alice.id, 'same-client-request'); store.updateJob(existing.id, { status: 'ready' });
  const guestJob = job(store, guest.row.owner, 'same-client-request', { prompt: 'Different guest creation', async: true });
  assert.doesNotThrow(() => store.newSession(alice, guest.row), 'A guest and account have separate idempotency namespaces before login.');
  assert.equal(store.job(existing.id).owner, alice.id); assert.equal(store.job(guestJob.id).owner, alice.id);
  assert.equal(store.jobs(alice.id).length, 2);
  const claimed = store.job(guestJob.id);
  assert.notEqual(claimed.idem, store.job(existing.id).idem);
  assert.match(claimed.idem, /^[a-zA-Z0-9_-]{8,120}$/);
  assert.equal(store.publicJob(claimed).idempotencyKey, claimed.idem);
  assert.equal(store.admit({ owner: alice.id, idem: claimed.idem, ipKey: alice.id, payload: JSON.parse(claimed.payload), limits }).existing, true);
  assert.throws(() => store.admit({ owner: alice.id, idem: 'same-client-request', ipKey: alice.id, payload: JSON.parse(claimed.payload), limits }), { code: 'IDEMPOTENCY_CONFLICT' });
});

test('access: production IP attribution accepts only authenticated loopback gateway headers; development ignores XFF', async t => {
  const folder = await directory(t), store = database(t); const secret = 'synthetic-proxy-secret-32-characters-minimum';
  const production = createSecurity({ production: true, stateRoot: folder, origin: 'https://music.fixture.invalid', proxySecret: secret }, store);
  const req = (remote = '127.0.0.1', headers = {}) => ({ socket: { remoteAddress: remote }, headers: { 'x-pmp-proxy-secret': secret, 'x-pmp-client-ip': '203.0.113.10', ...headers } });
  const a = production.ipKey(req()), b = production.ipKey(req('::1', { 'x-pmp-client-ip': '203.0.113.11' })); assert.notEqual(a, b);
  assert.equal(a, production.ipKey(req('::ffff:127.0.0.1', { 'x-forwarded-for': '198.51.100.8' })));
  assert.throws(() => production.ipKey(req('203.0.113.10')), { code: 'PROXY_REQUIRED' });
  assert.throws(() => production.ipKey(req('127.0.0.1', { 'x-pmp-proxy-secret': 'wrong' })), { code: 'PROXY_REQUIRED' });
  for (const address of ['203.0.113.1, 203.0.113.2', 'not-an-ip', '', '127.0.0.1:1234', ['203.0.113.1']])
    assert.throws(() => production.ipKey(req('127.0.0.1', { 'x-pmp-client-ip': address })), { code: 'INVALID_CLIENT_ADDRESS' });
  const dev = createSecurity({ production: false, stateRoot: folder, origin: 'http://127.0.0.1:4177' }, store);
  assert.equal(dev.ipKey(req()), dev.ipKey(req('127.0.0.1', { 'x-forwarded-for': 'different', 'x-pmp-client-ip': '198.51.100.4' })));
  assert.match(production.cookie('synthetic'), /^__Host-pmp_session=.*; Path=\/; HttpOnly; SameSite=Lax;.*; Secure$/);
  assert.ok(!production.cookie('synthetic').includes('Domain='));
});

test('access: configuration refuses unsafe production origin/proxy, public state and expanded admission limits', async t => {
  const folder = await directory(t);
  const env = { NODE_ENV: 'production', PMP_ORIGIN: 'https://music.fixture.invalid', PMP_STATE_DIR: folder, PMP_PROXY_SECRET: 'synthetic-proxy-secret-32-characters-minimum', PMP_MAIL_FROM: 'no-reply@music.fixture.invalid' };
  const valid = loadConfig(env); assert.equal(valid.host, '127.0.0.1'); assert.equal(valid.credentialsMode, 'aws-wif'); assert.equal(valid.mail.transport, 'ses');
  assert.equal(valid.accounts.emailVerification, 'off', 'owner order 2026-09-15: verification is off until e-mail is connected');
  // Verification OFF (the default) lets production start with no sender: mail is null and reset-by-mail is reported unavailable.
  const noSender = loadConfig({ ...env, PMP_MAIL_FROM: '' }); assert.equal(noSender.mail, null); assert.equal(noSender.accounts.emailVerification, 'off');
  // Verification REQUIRED restores the strict rule: production without a sender refuses to start.
  assert.throws(() => loadConfig({ ...env, PMP_MAIL_FROM: '', PMP_ACCOUNT_EMAIL_VERIFICATION: 'required' }));
  assert.equal(loadConfig({ ...env, PMP_ACCOUNT_EMAIL_VERIFICATION: 'required' }).accounts.emailVerification, 'required');
  assert.throws(() => loadConfig({ ...env, PMP_ACCOUNT_EMAIL_VERIFICATION: 'later' }));
  for (const overrides of [{ PMP_ORIGIN: 'http://music.fixture.invalid' }, { PMP_PROXY_SECRET: '' }, { PMP_PROXY_SECRET: 'short' }, { PMP_MAIL_TRANSPORT: 'file' },
    { PMP_STATE_DIR: join(appRoot, 'public', 'private') }, { PMP_DAILY_ADMISSION_LIMIT: '1001' }, { PMP_GUEST_DAILY_LIMIT: '0' },
    { PMP_ORIGIN: 'https://music.fixture.invalid/path' }, { PMP_ORIGIN: 'https://user:pass@music.fixture.invalid' }])
    assert.throws(() => loadConfig({ ...env, ...overrides }));
  assert.throws(() => loadConfig({ NODE_ENV: 'development', PMP_ORIGIN: 'http://public.fixture.invalid:4177', PMP_STATE_DIR: folder }));
});

test('access: strict JSON/metadata rejects arrays, truncated or oversized bodies, prototype keys and absent revision', async () => {
  const stream = (text, headers = {}) => Object.assign(Readable.from([Buffer.from(text)]), { headers: { 'content-type': 'application/json', ...headers } });
  for (const text of ['[]', 'null', '{broken', '123']) await assert.rejects(readJSON(stream(text)), { code: 'INVALID_JSON' });
  await assert.rejects(readJSON(stream('{}', { 'content-type': 'text/plain' })), { status: 415 });
  await assert.rejects(readJSON(stream('{"data":"long body"}'), 5), { status: 413 });
  await assert.rejects(readJSON(stream('{}', { 'content-length': '999999' })), { status: 413 });
  assert.throws(() => playlistBody(JSON.parse('{"name":"Mix","__proto__":{"admin":true}}')), { code: 'INVALID_REQUEST' });
  for (const revision of [undefined, 0, -1, 1.5, '1', null]) assert.throws(() => playlistBody({ name: 'Mix', revision }, true), { code: 'REVISION_REQUIRED' });
  for (const name of ['', ' ', 'x'.repeat(101), {}]) assert.throws(() => playlistBody({ name }), { code: 'INVALID_NAME' });
  assert.throws(() => playlistBody({ revision: 1, songs: [{}] }, true), { code: 'INVALID_TRACKS' });
  assert.equal(playlistBody({ name: '  Mix  ' }).name, 'Mix'); assert.equal({}.admin, undefined);
});

async function application(t) {
  const folder = await directory(t), publicRoot = join(folder, 'public'), stateRoot = join(folder, 'private'); await mkdir(publicRoot); await mkdir(stateRoot);
  await writeFile(join(publicRoot, 'index.html'), '<!doctype html><title>Access fixture</title>');
  await writeFile(join(stateRoot, 'secret.js'), 'private-fixture-only');
  const store = new Store(':memory:'); const [alice, bob] = users(store); const signed = [alice, bob].map(user => store.newSession(user));
  const config = { production: false, origin: 'http://127.0.0.1:1', stateRoot, publicRoot, oidc: null, ads: { enabled: false }, dailyAdmissionLimit: 100, guestDailyLimit: 3, ipDailyLimit: 10 };
  const { server } = createApplication({ config, store, engine: { capabilities: async () => captured, submit: async()=>{throw Error('Unexpected music request in access fixture');} }, media: {}, jobs: { wake() {} } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); config.origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close(); });
  const request = (path, account = 0, options = {}) => fetch(config.origin + path, { ...options,
    headers: { ...(account === null ? {} : { cookie: `pmp_dev_session=${signed[account].token}`, 'x-csrf-token': signed[account].row.csrf }),
      origin: config.origin, 'content-type': 'application/json', ...options.headers } });
  return { store, request, alice, bob, signed };
}

test('access: HTTP enforces playlist ownership, mandatory revisions and session revocation across tabs', async t => {
  const app = await application(t); seedTracks(app.store);
  const created = await app.request('/api/playlists', 0, { method: 'POST', body: '{"name":"Private"}' }); assert.equal(created.status, 201);
  const playlist = (await created.json()).playlist;
  assert.deepEqual((await (await app.request('/api/playlists', 1)).json()).playlists, []);
  for (const method of ['PATCH', 'DELETE']) assert.equal((await app.request('/api/playlists/' + playlist.id, 1,
    { method, ...(method === 'PATCH' ? { body: '{"name":"Hijacked","revision":1}' } : {}) })).status, 404);
  const missing = await app.request('/api/playlists/' + playlist.id, 0, { method: 'PATCH', body: '{"name":"No revision"}' }); assert.equal(missing.status, 400);
  const first = await app.request('/api/playlists/' + playlist.id, 0, { method: 'PATCH', body: JSON.stringify({ revision: 1, songs: [trackOne] }) }); assert.equal(first.status, 200);
  const stale = await app.request('/api/playlists/' + playlist.id, 0, { method: 'PATCH', body: JSON.stringify({ revision: 1, songs: [trackTwo] }) }); assert.equal(stale.status, 409);
  assert.deepEqual(app.store.playlists(app.alice.id)[0].songs, [trackOne]);
  assert.equal((await app.request('/api/auth/logout', 0, { method: 'POST', body: '{}' })).status, 200);
  assert.equal((await app.request('/api/playlists', 0)).status, 401); assert.equal((await app.request('/api/playlists', 1)).status, 200);
});

test('access: owned-job/public responses and served paths never expose raw engine metadata or master identifiers', async t => {
  const app = await application(t); const own = seedTracks(app.store, app.alice.id);
  const privateResult = { success: true, auth: { api_key: 'synthetic-private-api-key', key_id: 'synthetic-private-key-id' },
    tracks: [{ gcs_uri: 'gs://private-fixture/master.wav', public_url: 'https://private-engine.fixture.invalid/signed?token=private' }],
    prompt_sent: 'synthetic-private-compiled-prompt' };
  app.store.updateJob(own.id, { result: privateResult });
  for (const path of ['/api/jobs', '/api/jobs/' + own.id, '/api/catalog', '/api/radio', '/api/session', '/api/capabilities', '/api/controls-schema']) {
    const response = await app.request(path); assert.equal(response.status, 200, path); const text = await response.text();
    for (const forbidden of ['synthetic-private', 'gs://', 'private-engine.fixture.invalid', '"upstream_id"', '"api_key"', '"key_id"']) assert.ok(!text.includes(forbidden), path + ': ' + forbidden);
  }
  assert.equal((await app.request('/api/jobs/' + own.id, 1)).status, 404);
  for (const path of ['/server/credentials.mjs', '/.state/secret.js', '/%2e%2e/private/secret.js', '/..%5cprivate%5csecret.js'])
    assert.equal((await app.request(path, null)).status, 404, path);
  for (const path of ['/api/rewards/grant', '/api/downloads/master']) assert.equal((await app.request(path, 0, { method: 'POST', body: '{"rewarded":true}' })).status, 503);
});

test('access: actual public JavaScript/HTML/JSON carries no direct engine hostname or dual-auth credentials', async () => {
  const root = join(appRoot, 'public');
  async function inspect(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const full = join(path, entry.name); if (entry.isDirectory()) { await inspect(full); continue; }
      if (!entry.isFile() || !['.js', '.html', '.json'].includes(extname(entry.name))) continue;
      const text = await readFile(full, 'utf8');
      assert.ok(!/music-api-[A-Za-z0-9-]+\.run\.app|x-api-key|Authorization: Bearer|pmp_[A-Za-z0-9_-]{43}/.test(text), 'Private engine boundary found in served source: ' + full);
    }
  } await inspect(root);
});
