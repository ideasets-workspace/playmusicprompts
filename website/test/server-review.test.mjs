import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, basename, sep } from 'node:path';
import { once } from 'node:events';
import { generateKeyPairSync, sign } from 'node:crypto';
import { Store } from '../server/store.mjs';
import { createJobs } from '../server/jobs.mjs';
import { createApplication } from '../server/http.mjs';
import { createIdentity } from '../server/identity.mjs';

// Regression inputs below are explicitly synthetic boundary fixtures. They are
// not a music generation, an identity-provider proof or a decoded audio proof.
const limits = { daily: 100, owner: 100, ip: 100 };
const takeId = 'a'.repeat(64), listeningId = 'b'.repeat(64), masterId = 'c'.repeat(64);
const delivery = { success: true, tracks: [{ take: 1, kind: 'delivered master', gcs_uri: 'gs://test-bucket/master.wav' }] };
const captured = JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json', import.meta.url)));
function admission(store, owner = 'guest:review', idem = 'review-request-1', payload = { prompt: 'Review fixture', async: true }) {
  return store.admit({ owner, ipKey: 'review-ip', idem, payload, limits }).job;
}
function manifest(partial = false) {
  return { status: partial ? 'partial' : 'ready', takes: [{ id: takeId, take: 1, status: partial ? 'partial' : 'ready',
    master: { id: masterId, codec: 'pcm_s24le', sampleRate: 48000, channels: 2 },
    listening: { id: listeningId, durationSeconds: 15.048, codec: 'mp3', sampleRate: 48000, channels: 2 },
    errors: partial ? [{ code: 'STEM_UNAVAILABLE', message: 'Separate output unavailable.', retryable: false }] : [] }] };
}
async function drain(jobs) {
  jobs.wake();
  const deadline = Date.now() + 1000;
  while (jobs.running) {
    if (Date.now() > deadline) throw Error('Fixture worker did not settle.');
    await new Promise(resolve => setImmediate(resolve));
  }
}

test('review: native top-level 202 job_id becomes durable pending, then complete poll ingests once', async t => {
  const store = new Store(':memory:'); t.after(() => store.close());
  const job = admission(store); let submissions = 0, polls = 0, ingests = 0;
  const jobs = createJobs({ store, engine: {
    async submit() { submissions++; return { success: true, async: true, job_id: 'job-review', status: 'queued' }; },
    async job(id) { polls++; assert.equal(id, 'job-review'); return { success: true, status: 'complete', response: delivery }; }
  }, media: { async ingest(id, result) { ingests++; assert.equal(id, job.id); assert.deepEqual(result, delivery); return manifest(); } } });
  t.after(() => jobs.stop());
  await drain(jobs);
  assert.equal(store.job(job.id).status, 'pending'); assert.equal(store.job(job.id).upstream_id, 'job-review');
  await drain(jobs);
  assert.equal(store.job(job.id).status, 'ready'); assert.equal(store.catalog().length, 1);
  await drain(jobs);
  assert.deepEqual({ submissions, polls, ingests }, { submissions: 1, polls: 1, ingests: 1 });
});

test('review: idempotency ignores key order, rejects changed intent, and does not recount duplicates', t => {
  const store = new Store(':memory:'); t.after(() => store.close());
  const first = admission(store, 'owner', 'request-one', { prompt: 'Fixture', async: true });
  const replay = store.admit({ owner: 'owner', ipKey: 'review-ip', idem: 'request-one', payload: { async: true, prompt: 'Fixture' }, limits });
  assert.equal(replay.existing, true); assert.equal(replay.job.id, first.id);
  assert.throws(() => admission(store, 'owner', 'request-one', { prompt: 'Different fixture', async: true }), { code: 'IDEMPOTENCY_CONFLICT' });
  assert.equal(store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count, 1);
  assert.throws(() => store.ownJob(first.id, 'other-owner'), { status: 404 });
});

test('review: unknown submission and transfer retry never submit another paid generation', async t => {
  const store = new Store(':memory:'); t.after(() => store.close());
  const job = admission(store); let submissions = 0;
  const jobs = createJobs({ store, engine: { async submit() { submissions++; throw Object.assign(Error('private error'), { code: 'ENGINE_TIMEOUT', uncertain: true }); } }, media: {} });
  t.after(() => jobs.stop());
  await drain(jobs); await drain(jobs);
  assert.equal(store.job(job.id).status, 'uncertain'); assert.equal(submissions, 1);
  assert.ok(!JSON.stringify(store.publicJob(store.job(job.id))).includes('private error'));
  store.updateJob(job.id, { status: 'ingesting', result: delivery });
  const transfer = createJobs({ store, engine: { async submit() { assert.fail('Transfer retry submitted generation'); } }, media: { async ingest() { return manifest(); } } });
  t.after(() => transfer.stop()); await drain(transfer);
  assert.equal(store.job(job.id).status, 'ready');
});

test('review: two workers holding the same queued snapshot must claim admission atomically', async t => {
  const store = new Store(':memory:'); t.after(() => store.close());
  const snapshot = admission(store);
  // A deterministic interleaving of two workers that read queued before either
  // claims it. This is a concurrency regression, not a paid/live submission.
  store.activeJobs = () => [snapshot];
  let submissions = 0;
  const engine = { async submit() { submissions++; await new Promise(resolve => setImmediate(resolve));
    return { success: true, job_id: 'job-claim-review', status: 'queued' }; } };
  const first = createJobs({ store, engine, media: {} }); const second = createJobs({ store, engine, media: {} });
  t.after(() => { first.stop(); second.stop(); });
  await Promise.all([drain(first), drain(second)]);
  assert.equal(submissions, 1, 'Claim queued -> submitting with one conditional SQLite update before the external POST.');
});

test('review: partial take remains listenable and uses real capability field names and measured duration', t => {
  const store = new Store(':memory:'); t.after(() => store.close());
  const job = admission(store, 'review', 'partial-request', { prompt: 'Fixture', genres: ['cinematic'], moods: ['epic'], eras: ['era_1980s'], async: true });
  store.publish(job, manifest(true));
  const [track] = store.catalog(); assert.ok(track, 'A valid mastered listening rendition must not disappear when a separate stem fails.');
  assert.equal(track.duration, 15.048); assert.equal(track.genre, 'cinematic'); assert.equal(track.mood, 'epic'); assert.equal(track.era, 'era_1980s');
  assert.equal(track.deliveryStatus, 'partial');
  assert.ok(!JSON.stringify(track).includes('gs://')); assert.ok(!JSON.stringify(track).includes(masterId));
});

async function appFixture(t) {
  const folder = await mkdtemp(join(tmpdir(), 'pmp-server-review-'));
  const publicRoot = join(folder, 'public'); await mkdir(publicRoot);
  const stateRoot = join(folder, 'private-test-state'); await mkdir(stateRoot);
  const audioPath = join(stateRoot, 'http-range-fixture.bin'); await writeFile(audioPath, Buffer.from('0123456789'));
  await writeFile(join(publicRoot, 'index.html'), '<!doctype html><title>Review boundary fixture</title>');
  await writeFile(join(stateRoot, 'private.json'), '{"private":"must-never-serve"}');
  const store = new Store(':memory:');
  const config = { origin: 'http://127.0.0.1:1', publicRoot, stateRoot, production: false, oidc: null, ads: { enabled: false },
    dailyAdmissionLimit: 100, guestDailyLimit: 3, ipDailyLimit: 10 };
  const assetLookups = [];
  const { server } = createApplication({ config, store, engine: { async capabilities() { return captured; }, async submit() { assert.fail('Read-only route fixture must never submit upstream work.'); } }, jobs: { wake() {} },
    media: { async resolve(id, kind) { assetLookups.push({ id, kind }); return id === listeningId && kind === 'listening' ? { path: audioPath, contentType: 'audio/mpeg' } : null; } } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); config.origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close();
    // Verify the exact generated test directory remains under the intended temp root.
    const target = resolve(folder), parent = resolve(tmpdir());
    assert.ok(target.startsWith(parent + sep) && basename(target).startsWith('pmp-server-review-'));
    await rm(target, { recursive: true, force: true });
  });
  const request = (path, options) => fetch(config.origin + path, options);
  const sessionResponse = await request('/api/session'); const session = await sessionResponse.json();
  const cookie = sessionResponse.headers.get('set-cookie').split(';')[0];
  const headers = { cookie, origin: config.origin, 'x-csrf-token': session.csrf, 'content-type': 'application/json', 'idempotency-key': 'review-http-request' };
  return { store, request, headers, assetLookups };
}

test('review: catalog track resolves its distinct listening object; raw master ID is inaccessible', async t => {
  const app = await appFixture(t); const job = admission(app.store); app.store.publish(job, manifest());
  const [track] = app.store.catalog();
  const played = await app.request(track.url, { headers: { Range: 'bytes=2-5' } });
  assert.equal(played.status, 206); assert.equal(played.headers.get('content-range'), 'bytes 2-5/10'); assert.equal(await played.text(), '2345');
  assert.deepEqual(app.assetLookups, [{ id: listeningId, kind: 'listening' }]);
  const master = await app.request('/api/listen/' + masterId); assert.equal(master.status, 404);
  for (const path of ['/server/credentials.mjs', '/.state/private.json', '/%2e%2e/private-test-state/private.json', '/api/downloads/' + takeId])
    assert.ok([401, 404].includes((await app.request(path)).status), path);
});

test('review: CSRF and anonymous account gates reject before application mutation', async t => {
  const app = await appFixture(t);
  const bad = await app.request('/api/jobs', { method: 'POST', headers: { ...app.headers, 'x-csrf-token': 'wrong' }, body: JSON.stringify({ prompt: 'Fixture' }) });
  assert.equal(bad.status, 403); assert.equal(app.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n, 0);
  const forgedReward = await app.request('/api/rewards/grant', { method: 'POST', headers: app.headers, body: '{"rewarded":true}' });
  assert.equal(forgedReward.status, 401);
  const playlist = await app.request('/api/playlists', { method: 'POST', headers: app.headers, body: '{"name":"Fixture"}' });
  assert.equal(playlist.status, 401);
  const caps = JSON.stringify(await (await app.request('/api/capabilities')).json());
  assert.ok(!caps.includes('"auth"')); assert.ok(!caps.includes('"key_id"'));
});

test('review: generation admission refuses capability/plan modes instead of recording uncertain phantom songs', async t => {
  const app = await appFixture(t);
  for (const mode of ['capabilities', 'dry_run']) {
    const response = await app.request('/api/jobs', { method: 'POST', headers: { ...app.headers, 'idempotency-key': 'review-mode-' + mode },
      body: JSON.stringify({ prompt: 'Fixture', [mode]: true }) });
    assert.equal(response.status, 400, `${mode} is a control-plane request and must not enter song admission.`);
  }
  assert.equal(app.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n, 0);
});

test('review: actual OIDC code-flow module checks signature/nonce/audience and rotates sessions; no external calls', async t => {
  const issuer = 'https://oidc.review.invalid';
  const clientId = 'review-client';
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'review-key', use: 'sig', alg: 'RS256' };
  let expectedNonce, mode = 'valid', tokenCalls = 0, jwksCalls = 0;
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  function token() {
    const claims = { iss: issuer, sub: 'review-subject', aud: clientId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 120,
      nonce: expectedNonce, name: 'Synthetic review identity' };
    if (mode === 'wrong-nonce') claims.nonce = 'wrong';
    if (mode === 'wrong-audience') claims.aud = 'another-client';
    if (mode === 'expired') claims.exp = Math.floor(Date.now() / 1000) - 120;
    const input = b64({ alg: 'RS256', kid: 'review-key' }) + '.' + b64(claims);
    const signature = sign('RSA-SHA256', Buffer.from(input), privateKey);
    if (mode === 'bad-signature') signature[0] ^= 1;
    return input + '.' + signature.toString('base64url');
  }
  // Every URL is matched; a surprise URL fails the test rather than accessing the network.
  t.mock.method(globalThis, 'fetch', async input => {
    const url = String(input instanceof Request ? input.url : input);
    let body;
    if (url === issuer + '/.well-known/openid-configuration') body = {
      issuer, authorization_endpoint: issuer + '/authorize', token_endpoint: issuer + '/token', jwks_uri: issuer + '/jwks',
      response_types_supported: ['code'], subject_types_supported: ['public'], id_token_signing_alg_values_supported: ['RS256'],
      code_challenge_methods_supported: ['S256'], token_endpoint_auth_methods_supported: ['client_secret_post']
    };
    else if (url === issuer + '/token') { tokenCalls++; body = { access_token: 'synthetic-access', token_type: 'Bearer', expires_in: 120, id_token: token() }; }
    else if (url === issuer + '/jwks') { jwksCalls++; body = { keys: [jwk] }; }
    else assert.fail('Unexpected external identity URL: ' + url);
    return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
  });
  for (const scenario of ['bad-signature', 'wrong-nonce', 'wrong-audience', 'expired', 'valid']) {
    mode = scenario;
    const store = new Store(':memory:');
    try {
      const identity = createIdentity({ origin: 'http://127.0.0.1:4177', oidc: { issuer, clientId, clientSecret: 'synthetic-client-secret' } }, store);
      const guest = store.newSession(); const start = new URL((await identity.start(guest.row)).url);
      expectedNonce = start.searchParams.get('nonce');
      assert.equal(start.searchParams.get('code_challenge_method'), 'S256');
      const callback = new URL('http://127.0.0.1:4177/auth/callback'); callback.searchParams.set('code', 'synthetic-code'); callback.searchParams.set('state', start.searchParams.get('state'));
      if (scenario === 'valid') {
        const signed = await identity.callback(callback, guest.row);
        assert.ok(signed.user.id); assert.ok(!store.session(guest.token)); assert.equal(store.session(signed.token).user_id, signed.user.id);
        await assert.rejects(identity.callback(callback, guest.row), { code: 'SIGNIN_INVALID' });
      } else {
        await assert.rejects(identity.callback(callback, guest.row), { code: 'SIGNIN_INVALID' }, scenario);
        assert.equal(store.db.prepare('SELECT count(*) AS n FROM users').get().n, 0);
      }
    } finally { store.close(); }
  }
  assert.equal(tokenCalls, 5); assert.ok(jwksCalls >= 2, 'Valid and invalid signatures must use the issuer key set.');
});
