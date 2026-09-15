import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine, EngineError } from '../server/engine.mjs';
const baseUrl = 'https://music.example.test';
const credentials = async () => ({ identityToken: 'test-identity', apiKey: 'test-key' });
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('dual-auth endpoint wires and complete private envelopes survive', async () => {
  const calls = [];
  const privateResponse = { success: true, auth: { key_id: 'private-id', limit: { used_today: 0 } }, tracks: [{ gcs_uri: 'gs://bucket/one.wav' }] };
  const engine = createEngine({ baseUrl, credentials, fetchImpl: async (url, options) => { calls.push({ url, options }); return response(privateResponse); } });
  assert.deepEqual(await engine.capabilities(), privateResponse);
  assert.deepEqual(await engine.submit({ prompt: 'Sound' }), privateResponse);
  await engine.job('job-a_123'); await engine.delivery('gs://bucket/one.wav');
  assert.deepEqual(calls.map(x => x.url), [baseUrl + '/v1/music/capabilities', baseUrl + '/v1/music', baseUrl + '/v1/music/jobs/job-a_123', baseUrl + '/v1/music/delivery-url']);
  for (const call of calls) {
    assert.equal(call.options.headers.Authorization, 'Bearer test-identity');
    assert.equal(call.options.headers['x-api-key'], 'test-key');
    assert.equal(call.options.redirect, 'error');
  }
  assert.deepEqual(JSON.parse(calls[3].options.body), { gcs_uri: 'gs://bucket/one.wav' });
});

test('202 is an admission; dry-run remains a plan; job failed is a successful poll', async () => {
  const bodies = [{ success: true, job_id: 'job-a', status: 'queued' }, { success: true, prompt_sent: 'plan' }, { success: true, status: 'failed', error: { error_code: 'RENDER_FAILED' }, http_status: 500 }];
  const engine = createEngine({ baseUrl, credentials, fetchImpl: async () => response(bodies.shift(), bodies.length === 2 ? 202 : 200) });
  assert.equal((await engine.submit({ prompt: 'Sound', async: true })).status, 'queued');
  assert.equal((await engine.submit({ prompt: 'Sound', async: true, dry_run: true })).prompt_sent, 'plan');
  assert.equal((await engine.job('job-a')).status, 'failed');
});

test('wire payload is frozen before asynchronous credentials and cannot drift from persisted input', async () => {
  let release; let sent;
  const waiting = new Promise(resolve => { release = resolve; });
  const engine = createEngine({ baseUrl, credentials: () => waiting, fetchImpl: async (_, options) => {
    sent = JSON.parse(options.body); return response({ success: true, job_id: 'job-a', status: 'queued' }, 202);
  } });
  const payload = { prompt: 'Original music', async: true, duration: { target_seconds: 15 } };
  const pending = engine.submit(payload);
  payload.prompt = 'Changed'; payload.duration.target_seconds = 180; payload.async = false;
  release(await credentials()); await pending;
  assert.deepEqual(sent, { prompt: 'Original music', async: true, duration: { target_seconds: 15 } });
});

test('generation connection failure is uncertain and never retried; credentials and upstream prose never leak', async () => {
  let calls = 0;
  const engine = createEngine({ baseUrl, credentials, fetchImpl: async () => { calls++; throw new Error('test-key test-identity secret path'); } });
  await assert.rejects(engine.submit({ prompt: 'Sound', async: true }), error => {
    assert.ok(error instanceof EngineError); assert.equal(error.uncertain, true); assert.equal(error.code, 'ENGINE_CONNECTION_ERROR');
    assert.ok(!JSON.stringify(error).includes('test-key')); return true;
  });
  assert.equal(calls, 1);
});

test('non-JSON edge auth denial remains private and does not mark generation admitted', async () => {
  const engine = createEngine({ baseUrl, credentials, fetchImpl: async () => new Response('<html>private-edge-details</html>', { status: 403 }) });
  await assert.rejects(engine.submit({ prompt: 'Sound' }), error => {
    assert.equal(error.upstreamStatus, 403); assert.equal(error.uncertain, false); assert.equal(error.status, 502);
    assert.match(error.upstreamBody, /private-edge-details/);
    assert.ok(!JSON.stringify(error).includes('private-edge-details')); return true;
  });
});

test('quota zero and named upstream codes retained privately, public messages remain controlled', async () => {
  const body = { success: false, error_code: 'RATE_LIMITED', error: 'token test-key', limit: { reset_seconds: 0, daily_quota: 100, used_today: 100 } };
  const engine = createEngine({ baseUrl, credentials, fetchImpl: async () => response(body, 429) });
  await assert.rejects(engine.submit({ prompt: 'Sound' }), error => {
    assert.equal(error.code, 'RATE_LIMITED'); assert.equal(error.status, 429); assert.equal(error.uncertain, false);
    assert.equal(error.upstreamBody.limit.reset_seconds, 0); assert.ok(!JSON.stringify(error).includes('test-key')); return true;
  });
});

test('timeout bounds both credential acquisition and a non-cooperative network; no late POST', async () => {
  let release; let calls = 0;
  const waiting = new Promise(resolve => { release = resolve; });
  const engine = createEngine({ baseUrl, timeoutMs: 10, credentials: () => waiting, fetchImpl: async () => { calls++; return response({ success: true }); } });
  await assert.rejects(engine.submit({ prompt: 'Sound' }), error => error.code === 'ENGINE_TIMEOUT' && error.uncertain === false);
  release(await credentials()); await new Promise(resolve => setTimeout(resolve, 5)); assert.equal(calls, 0);
  const hanging = createEngine({ baseUrl, credentials, timeoutMs: 10, fetchImpl: () => new Promise(() => { calls++; }) });
  await assert.rejects(hanging.submit({ prompt: 'Sound' }), error => error.code === 'ENGINE_TIMEOUT' && error.uncertain === true);
  assert.equal(calls, 1);
});

test('timeout of read-only calls is not a generation uncertainty', async () => {
  const engine = createEngine({ baseUrl, credentials, timeoutMs: 10, fetchImpl: () => new Promise(() => {}) });
  await assert.rejects(engine.job('job-a'), error => error.code === 'ENGINE_TIMEOUT' && !error.uncertain);
});

test('malformed/oversized successful admission is uncertain rather than replayable', async () => {
  for (const fetchImpl of [async () => response({ success: true }, 202), async () => new Response('broken'), async () => response({ data: 'x'.repeat(100) })]) {
    const engine = createEngine({ baseUrl, credentials, fetchImpl, maxResponseBytes: 64 });
    await assert.rejects(engine.submit({ prompt: 'Sound', async: true }), error => error.code === 'ENGINE_RESPONSE_INVALID' && error.uncertain);
  }
});

test('reject insecure configuration, path injection and bad credentials before fetch', async () => {
  for (const url of ['http://music.example.test', 'https://user:pass@example.test', baseUrl + '/other', baseUrl + '?token=x'])
    assert.throws(() => createEngine({ baseUrl: url, credentials }), error => error.code === 'CONFIG_ERROR');
  let calls = 0;
  const engine = createEngine({ baseUrl, credentials, fetchImpl: async () => { calls++; } });
  for (const id of ['../run', 'job/run', 'job%2frun', 'job?key=x', '']) assert.throws(() => engine.job(id), error => error.status === 400);
  for (const uri of ['https://example.com/a', 'gs://bucket/', 'gs://bucket/a\nfile']) assert.throws(() => engine.delivery(uri), error => error.status === 400);
  const bad = createEngine({ baseUrl, credentials: async () => ({ apiKey: 'secret\r\nx: 1', identityToken: 'token' }), fetchImpl: async () => { calls++; } });
  await assert.rejects(bad.capabilities(), error => error.code === 'CONFIG_ERROR' && !error.uncertain);
  assert.equal(calls, 0);
});
