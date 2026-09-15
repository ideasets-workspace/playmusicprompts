import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicGenerationWorkflow } from '../server/workflow-state.mjs';
import { validateRequest } from '../server/validation.mjs';
import { Store } from '../server/store.mjs';

// Explicit local fixtures, never claims of another live song or live worker.
const fixture = { prompt: 'Keep my exact words. 🎵', async: false };
const job = status => ({ id: '12345678-1234-4123-8123-123456789abc', status, createdAt: 1000, updatedAt: 2000, tracks: [], error: null });
const track = (character = 'a') => ({ id: character.repeat(64), title: 'Fixture song', url: '/api/listen/' + character.repeat(64), owned: true, created: true, take: 1, duration: 30, art: 'night' });
const states = workflow => workflow.steps.slice(0, 3).map(step => step.state);

test('the request snapshot covers all100 current request names exactly, including native false and nested values', () => {
  const directory = new URL('../../docs/implementation/2026-09-12-website-api/', import.meta.url);
  const raw = JSON.parse(readFileSync(new URL('live-capabilities.json', directory), 'utf8'));
  const candidate = JSON.parse(readFileSync(new URL('parameter-gap-audit.json', directory), 'utf8')).dry_run_candidate.payload;
  const validated = validateRequest(candidate, raw);
  const expected = raw.parameters.filter(p => !['rights', 'compliance', 'analysis_outputs'].includes(p.name)).map(p => p.name).sort();
  const workflow = publicGenerationWorkflow(job('queued'), validated);
  assert.equal(expected.length, 100);
  assert.deepEqual(Object.keys(workflow.request).sort(), expected);
  assert.deepEqual(workflow.request, validated);
  assert.equal(workflow.request.capabilities, false);
  assert.equal(workflow.request.prompt_enhance.enabled, false);
  assert.equal(workflow.request.mastering.loudness_lufs, '-14');
  workflow.request.project.name = 'Changed only in returned copy';
  assert.notEqual(workflow.request.project.name, validated.project.name);
});

test('snapshot preserves false, zero, empty/Unicode/multiline text and omission without injecting defaults', () => {
  const request = { prompt: ' 🎵\noriginal ', labels: { note: '', whitespace: ' \n ' }, project: {}, prompt_blocks: [], async: false, dry_run: false, normalize_output: false, fade_in_seconds: 0 };
  const workflow = publicGenerationWorkflow(job('queued'), request);
  assert.deepEqual(workflow.request, request);
  assert.equal(Object.hasOwn(workflow.request, 'quality'), false);
  request.labels.note = 'Mutated input';
  assert.equal(workflow.request.labels.note, '');
});

test('unknown root/private/response-only data cannot cross the request or job boundary', () => {
  const request = { ...fixture, auth: { token: 'PRIVATE_TOKEN' }, service: 'PRIVATE_SERVICE', rights: {}, compliance: {}, analysis_outputs: {}, internal: 'PRIVATE_INTERNAL' };
  const workflow = publicGenerationWorkflow({ ...job('pending'), auth: request.auth, upstream_id: 'PRIVATE_ID', payload: 'PRIVATE_PAYLOAD', result: { private: true } }, request, 'processing');
  assert.deepEqual(workflow.request, fixture);
  assert.ok(!JSON.stringify(workflow).includes('PRIVATE_'));
  assert.equal(workflow.result, undefined);
});

test('prototype keys, getters, cycles and non-JSON selected data fail closed rather than mutate or silently disappear', () => {
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    const root = { ...fixture }; Object.defineProperty(root, key, { value: 'unsafe', enumerable: true });
    assert.throws(() => publicGenerationWorkflow(job('queued'), root), /Unsafe/);
    const nested = { ...fixture, labels: JSON.parse(`{"${key}":"unsafe"}`) };
    assert.throws(() => publicGenerationWorkflow(job('queued'), nested), /Unsafe/);
  }
  assert.throws(() => publicGenerationWorkflow(job('queued'), Object.create({ prompt: 'Inherited' })), /Unsafe/);
  let executed = false;
  const getter = { get prompt() { executed = true; return 'Do not invoke'; } };
  assert.throws(() => publicGenerationWorkflow(job('queued'), getter), /Unsafe/);
  assert.equal(executed, false);
  const circular = {}; circular.self = circular;
  for (const value of [undefined, NaN, Infinity, () => 'wrong', circular, new Date()]) assert.throws(() => publicGenerationWorkflow(job('queued'), { prompt: 'Fixture', project: value }), /snapshot/);
  assert.equal({}.unsafe, undefined);
});

test('queue/submission and real queued-versus-processing are distinct with no timed production claims', () => {
  const cases = [
    ['queued', null, 'Request saved', ['pending', 'pending', 'pending']],
    ['submitting', null, 'Sending request', ['active', 'pending', 'pending']],
    ['pending', 'queued', 'Waiting for music worker', ['complete', 'pending', 'pending']],
    ['pending', 'processing', 'Music worker processing', ['complete', 'active', 'pending']],
    ['pending', null, 'Waiting for music result', ['complete', 'pending', 'pending']],
    ['pending', 'complete', 'Music result returned', ['complete', 'complete', 'pending']],
    ['ingesting', 'complete', 'Saving your music', ['complete', 'complete', 'active']],
  ];
  for (const [status, upstream, title, expected] of cases) {
    const workflow = publicGenerationWorkflow(job(status), fixture, upstream);
    assert.equal(workflow.title, title); assert.deepEqual(states(workflow), expected);
    assert.deepEqual(workflow.steps.map(s => s.id), ['request', 'music', 'delivery']);
    assert.ok(!/\d+%|mastering|rewriting|validating/i.test(JSON.stringify(workflow.steps)));
    assert.equal(workflow.createdAt, 1000); assert.equal(workflow.updatedAt, 2000);
  }
  assert.deepEqual(states(publicGenerationWorkflow(job('pending'), fixture, 'PRIVATE_UNKNOWN')), ['complete', 'pending', 'pending']);
});

test('ready requires actual owned listening tracks; partial delivery preserves files without total-success claims', () => {
  const ready = publicGenerationWorkflow({ ...job('ready'), tracks: [track(), track('b'), track()] }, fixture, 'complete');
  assert.equal(ready.status, 'ready'); assert.equal(ready.result.tracks.length, 2);
  assert.match(ready.message, /2 songs/); assert.deepEqual(states(ready), ['complete', 'complete', 'complete']);
  const partial = publicGenerationWorkflow({ ...job('partial'), tracks: [track()] }, fixture, 'complete');
  assert.equal(partial.status, 'partial'); assert.match(partial.message, /Other requested outputs need attention/);
  assert.deepEqual(states(partial), ['complete', 'complete', 'unavailable']);
});

test('raw/source-only or unowned/remote URLs never become a ready player result', () => {
  const raw = { ...track(), kind: 'raw' }, remote = { ...track(), url: 'https://private.invalid/signed-token' }, unowned = { ...track(), owned: false };
  for (const item of [raw, remote, unowned]) {
    const workflow = publicGenerationWorkflow({ ...job('ready'), tracks: [item] }, fixture);
    assert.equal(workflow.status, 'ingest_failed'); assert.equal(workflow.result, undefined);
    assert.doesNotMatch(JSON.stringify(workflow), /private.invalid|signed-token/);
  }
  const sourceOnly = publicGenerationWorkflow({ ...job('ingest_failed'), assetsSummary: { takes: [{ source: { owned: true } }] } }, fixture);
  assert.equal(sourceOnly.status, 'ingest_failed'); assert.equal(sourceOnly.result, undefined);
  assert.deepEqual(states(sourceOnly), ['complete', 'complete', 'failed']);
  assert.match(sourceOnly.message, /No verified listening copy/);
});

test('public playable track projection keeps needed player fields and strips extra engine/asset data', () => {
  const input = { ...track(), gcs_uri: 'gs://private/source', auth: { token: 'PRIVATE_TOKEN' }, master: { file: 'PRIVATE_FILE' }, privateUrl: 'PRIVATE_URL' };
  const workflow = publicGenerationWorkflow({ ...job('ready'), tracks: [input] }, fixture);
  assert.equal(workflow.result.tracks[0].title, 'Fixture song'); assert.equal(workflow.result.tracks[0].duration, 30);
  assert.ok(!JSON.stringify(workflow).includes('PRIVATE_')); assert.ok(!JSON.stringify(workflow).includes('gs://'));
  workflow.result.tracks[0].title = 'New title'; assert.equal(input.title, 'Fixture song');
});

test('failure and uncertainty do not mark unobserved worker steps complete or discard existing playable outputs', () => {
  const early = publicGenerationWorkflow(job('failed'), fixture);
  assert.deepEqual(states(early), ['failed', 'unavailable', 'pending']);
  const workerFailure = publicGenerationWorkflow(job('failed'), fixture, 'failed');
  assert.deepEqual(states(workerFailure), ['complete', 'failed', 'pending']);
  const uncertain = publicGenerationWorkflow(job('uncertain'), fixture);
  assert.deepEqual(states(uncertain), ['unavailable', 'unavailable', 'pending']);
  assert.match(uncertain.message, /not be submitted again automatically/);
  const existing = publicGenerationWorkflow({ ...job('failed'), tracks: [track()] }, fixture, 'failed');
  assert.equal(existing.status, 'failed'); assert.equal(existing.result.tracks.length, 1);
  assert.deepEqual(states(existing), ['complete', 'complete', 'unavailable']);
  assert.equal(publicGenerationWorkflow(job('unknown'), fixture).status, 'uncertain');
});

test('optional originality is separately observable and never postpones ready music', () => {
  assert.equal(publicGenerationWorkflow({ ...job('ready'), tracks: [track()], summary: { originality: { state: 'pending' } } }, fixture).steps.length, 3);
  const mapping = { pending: 'active', complete: 'complete', failed: 'failed', 'no-record': 'unavailable', unavailable: 'unavailable' };
  for (const [analysisState, expected] of Object.entries(mapping)) {
    const workflow = publicGenerationWorkflow({ ...job('ready'), tracks: [track()], summary: { originality: { state: analysisState } } }, { ...fixture, run_originality_gate: true });
    assert.equal(workflow.status, 'ready'); assert.equal(workflow.steps[3].state, expected);
    assert.equal(workflow.steps[3].id, 'originality'); assert.equal(workflow.result.tracks.length, 1);
    assert.doesNotMatch(JSON.stringify(workflow), /copyright|originality passed/i);
  }
  const before = publicGenerationWorkflow(job('queued'), { ...fixture, run_originality_gate: true });
  assert.equal(before.steps[3].state, 'pending');
});

test('already-public error guidance is preserved without extra private fields', () => {
  const error = { code: 'INVALID_REQUEST', message: 'Review the selected duration.', fields: [{ path: 'duration.target_seconds', code: 'RANGE', message: 'Use the displayed range.', raw: 'PRIVATE_VALUE' }], omittedDetails: 1, upstreamBody: { token: 'PRIVATE_TOKEN' }, auth: 'PRIVATE_AUTH' };
  const workflow = publicGenerationWorkflow({ ...job('failed'), error }, fixture);
  assert.deepEqual(workflow.error, { code: error.code, message: error.message, fields: [{ path: 'duration.target_seconds', code: 'RANGE', message: 'Use the displayed range.' }], omittedDetails: 1 });
  assert.ok(!JSON.stringify(workflow).includes('PRIVATE_'));
  assert.equal(publicGenerationWorkflow({ ...job('queued'), createdAt: NaN, updatedAt: -1 }, fixture).createdAt, null);
});

test('actual Store admission, pending envelope and published manifest remain compatible with the workflow projection', () => {
  const store = new Store(':memory:');
  try {
    const { job: saved } = store.admit({ owner: 'fixture-owner', ipKey: 'fixture-ip', idem: 'workflow-fixture-one', payload: fixture, limits: { daily: 100, owner: 20, ip: 20 } });
    const view = () => {
      const current = store.ownJob(saved.id, 'fixture-owner');
      return publicGenerationWorkflow(store.publicJob(current), JSON.parse(current.payload), JSON.parse(current.result || 'null')?.status);
    };
    assert.equal(view().title, 'Request saved');
    store.updateJob(saved.id, { status: 'pending', upstreamId: 'PRIVATE_UPSTREAM_ID', result: { status: 'queued', auth: 'PRIVATE_AUTH' } });
    assert.equal(view().title, 'Waiting for music worker');
    store.updateJob(saved.id, { result: { status: 'processing' } });
    assert.equal(view().steps[1].state, 'active');
    store.updateJob(saved.id, { status: 'ingesting', result: { success: true, tracks: [{ take: 1, kind: 'delivered master' }] } });
    const asset = (kind, id) => ({ kind, id: id.repeat(64), measured: true, durationSeconds: 30, codec: kind === 'master' ? 'pcm_s24le' : 'aac', sampleRate: 48000, channels: 2 });
    store.publish(store.job(saved.id), { jobId: saved.id, status: 'ready', takes: [{ id: 'c'.repeat(64), take: 1, kind: 'delivered-master', status: 'ready', master: asset('master', 'd'), listening: asset('listening', 'e') }] });
    store.updateJob(saved.id, { status: 'ready' });
    const ready = view();
    assert.equal(ready.status, 'ready'); assert.equal(ready.result.tracks[0].url, '/api/listen/' + 'c'.repeat(64));
    assert.equal(ready.result.tracks[0].duration, 30); assert.deepEqual(ready.request, fixture);
    assert.ok(!JSON.stringify(ready).includes('PRIVATE_')); assert.ok(!JSON.stringify(ready).includes('d'.repeat(64)));
    assert.throws(() => store.ownJob(saved.id, 'other-owner'), { status: 404 });
  } finally { store.close(); }
});
