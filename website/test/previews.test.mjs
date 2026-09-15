import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, basename, sep } from 'node:path';
import { Store, sha, stable } from '../server/store.mjs';
import { createPreviews, projectPreview } from '../server/previews.mjs';
import { EngineError } from '../server/engine.mjs';

// Explicit local fixtures: no API calls, tokens, credentials, music or real CMP.
const captured = JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/live-capabilities.json', import.meta.url)));
const audit = JSON.parse(readFileSync(new URL('../../docs/implementation/2026-09-12-website-api/parameter-gap-audit.json', import.meta.url)));
const full = audit.dry_run_candidate.payload;
const config = { dailyAdmissionLimit: 100, webhookUrl: null };
const body = { prompt: 'Local preview fixture', dry_run: true, capabilities: false, async: true };
const request = (payload = body, overrides = {}) => ({ owner: 'fixture-owner', ipKey: 'fixture-ip', idem: 'fixture-preview-id', payload: structuredClone(payload), ...overrides });
const plan = payload => ({ success: true, dry_run: true, request_id: 'fixture-private-correlation', prompt_sent: 'Compiled fixture words',
  request_parameters_received: Object.keys(payload), route: { model: 'lyria-3-pro-preview', private_path: '/private/fixture' },
  generation_payload: { takes: payload.variation_count ?? 1 }, render_settings: { quality: 'balanced', export: 'wav24_48k', conform: { target_seconds: 30 } },
  bindings: { prompt: { binding: 'typed', sent: 'Compiled fixture words', auth: 'synthetic-private-binding-secret' }, auth: { note: 'synthetic-private-auth' } },
  auth: { key_id: 'synthetic-private-key', account_id: 'synthetic-private-account' }, service: { credential: 'synthetic-private-service-secret' } });
function fixture(t, submit = async payload => plan(payload)) {
  const store = new Store(':memory:'); t.after(() => store.close());
  let capCalls = 0;
  const previews = createPreviews({ store, config, engine: { submit }, capabilities: async () => { capCalls++; return captured; } });
  return { store, previews, get capCalls() { return capCalls; } };
}
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

test('preview: non-preview modes are rejected before capability lookup, quota or engine dispatch', async t => {
  let calls = 0; const f = fixture(t, async () => { calls++; throw Error('Must not dispatch'); });
  for (const payload of [{ prompt: 'Create music' }, { prompt: 'Create music', dry_run: false, capabilities: false }, { prompt: 'Create music', dry_run: 'true' }])
    await assert.rejects(f.previews.submit(request(payload)), { code: 'PREVIEW_MODE_REQUIRED' });
  assert.equal(calls, 0); assert.equal(f.capCalls, 0); assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM counters').get().n, 0);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM request_previews').get().n, 0);
});

test('preview: concurrent/repeated same-owner request consumes one quota and submits once; changed intent conflicts', async t => {
  let release, calls = 0; const gate = new Promise(resolve => release = resolve);
  const f = fixture(t, async payload => { calls++; await gate; return plan(payload); });
  const one = f.previews.submit(request()), two = f.previews.submit(request()); await flush();
  assert.equal(calls, 1); assert.equal(f.previews.running, true);
  assert.equal(f.store.db.prepare("SELECT count FROM counters WHERE key LIKE 'generation:global:%'").get().count, 1);
  release(); const [first, second] = await Promise.all([one, two]); assert.deepEqual(first, second);
  assert.equal(f.previews.running, false); assert.deepEqual(await f.previews.submit(request()), first); assert.equal(calls, 1);
  await assert.rejects(f.previews.submit(request({ ...body, prompt: 'Different intent' })), { code: 'IDEMPOTENCY_CONFLICT' });
  assert.equal(calls, 1);
});

test('preview: idempotency belongs to the owner and never returns another owner private response', async t => {
  let calls = 0; const f = fixture(t, async payload => { calls++; return { ...plan(payload), prompt_sent: payload.prompt }; });
  const alice = await f.previews.submit(request({ ...body, prompt: 'Alice private preview' }));
  const bob = await f.previews.submit(request({ ...body, prompt: 'Bob private preview' }, { owner: 'fixture-bob', ipKey: 'fixture-bob-ip' }));
  assert.notEqual(alice.id, bob.id); assert.equal(alice.promptSent, 'Alice private preview'); assert.equal(bob.promptSent, 'Bob private preview'); assert.equal(calls, 2);
});

test('preview: actual 100-field candidate is sent exactly once with native no-generation flags and sanitized output', async t => {
  let calls = 0, sent; const f = fixture(t, async payload => { calls++; sent = structuredClone(payload); return plan(payload); });
  const result = await f.previews.submit(request(full));
  assert.equal(Object.keys(full).length, 100); assert.deepEqual(sent, full); assert.equal(calls, 1);
  assert.equal(sent.dry_run, true); assert.equal(sent.capabilities, false); assert.equal(sent.async, true);
  assert.equal(sent.prompt_enhance.enabled, false); assert.ok(sent.webhook_url.startsWith('https://pmp-validation.invalid/'));
  assert.deepEqual(sent.references.map(item => item.kind), ['descriptor']);
  assert.equal(result.musicGenerated, false); assert.equal(result.kind, 'request-preview'); assert.deepEqual(result.received, Object.keys(full));
  const serialized = JSON.stringify(result);
  for (const value of ['synthetic-private-', '/private/fixture', 'fixture-private-correlation', 'private_path', 'credential']) assert.ok(!serialized.includes(value), value);
  const stored = f.store.db.prepare('SELECT * FROM request_previews WHERE id=?').get(result.id);
  assert.equal(stored.state, 'complete'); assert.equal(JSON.parse(stored.response).auth.account_id, 'synthetic-private-account');
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM jobs').get().n, 0, 'A plan is not a generation job.');
});

test('preview: capabilities mode returns discovery rather than pretending to compile musical settings', async t => {
  let sent; const f = fixture(t, async payload => { sent = payload; return captured; });
  const result = await f.previews.submit(request({ capabilities: true }));
  assert.deepEqual(sent, { capabilities: true }); assert.equal(result.kind, 'capability-preview'); assert.equal(result.musicGenerated, false);
  assert.equal(result.capabilities.request_parameter_count, 100); assert.ok(!('promptSent' in result));
  assert.ok(!('auth' in result.capabilities));
});

test('preview: mixed delivery envelopes and missing mode are refused; raw response stays private and is never replayed', async t => {
  for (const bad of [{ ...plan(body), dry_run: false }, { ...plan(body), tracks: [] }, { ...plan(body), job_id: 'unexpected-job' }, { ...plan(body), rights: {} }])
    assert.throws(() => projectPreview(bad, captured), { code: 'PREVIEW_INVALID' });
  let calls = 0; const f = fixture(t, async payload => { calls++; return { ...plan(payload), tracks: [] }; });
  await assert.rejects(f.previews.submit(request()), { code: 'PREVIEW_INVALID' }); assert.equal(f.previews.running, false);
  const row = f.store.db.prepare('SELECT * FROM request_previews').get(); assert.equal(row.state, 'failed'); assert.ok(JSON.parse(row.response).tracks);
  await assert.rejects(f.previews.submit(request()), { code: 'PREVIEW_NEEDS_ATTENTION' }); assert.equal(calls, 1);
});

test('preview: transport error retains private evidence and never silently consumes quota on replay', async t => {
  let calls = 0; const privateBody = { synthetic_private: 'fixture-only-evidence' };
  const f = fixture(t, async () => { calls++; throw new EngineError('ENGINE_TIMEOUT', 'Preview connection timed out.', { status: 504, upstreamBody: privateBody }); });
  await assert.rejects(f.previews.submit(request()), { code: 'ENGINE_TIMEOUT' });
  const row = f.store.db.prepare('SELECT * FROM request_previews').get(); assert.equal(row.state, 'failed'); assert.deepEqual(JSON.parse(row.response), privateBody);
  assert.deepEqual(JSON.parse(row.error), { code: 'ENGINE_TIMEOUT' }); assert.equal(f.previews.running, false);
  await assert.rejects(f.previews.submit(request()), { code: 'PREVIEW_NEEDS_ATTENTION' }); assert.equal(calls, 1);
});

test('preview: after actual SQLite reopen, an interrupted submission is uncertain and cannot automatically run again', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'pmp-preview-test-')), file = join(folder, 'preview.sqlite'); let store;
  try {
    store = new Store(file); createPreviews({ store, config, engine: {}, capabilities: async () => captured });
    store.db.prepare('INSERT INTO request_previews (id,owner,idem,fingerprint,payload,state,created) VALUES (?,?,?,?,?,?,?)')
      .run('interrupted-preview', 'fixture-owner', 'fixture-preview-id', sha(stable(body)), JSON.stringify(body), 'submitting', Date.now());
    store.close(); store = new Store(file); let calls = 0;
    const previews = createPreviews({ store, config, engine: { async submit() { calls++; return plan(body); } }, capabilities: async () => captured });
    await assert.rejects(previews.submit(request()), { code: 'PREVIEW_UNCONFIRMED' }); assert.equal(calls, 0); assert.equal(previews.running, false);
    assert.equal(store.db.prepare('SELECT state FROM request_previews').get().state, 'submitting');
  } finally {
    store?.close(); const path = resolve(folder); assert.ok(path.startsWith(resolve(tmpdir()) + sep) && basename(path).startsWith('pmp-preview-test-'));
    await rm(path, { recursive: true, force: true });
  }
});
