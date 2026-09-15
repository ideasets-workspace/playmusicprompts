import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, readdir, stat, symlink, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createMedia, validateGcsUri, validateDeliveryUrl, replaceMediaManifest } from '../server/media.mjs';

// Generated diagnostic tones and an injected GCS transport are test fixtures,
// never application catalogue music. FFmpeg/FFprobe perform real disk processing.
let runtime = {};
try { runtime = JSON.parse(await readFile(new URL('../.state/runtime.local.json', import.meta.url), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const ffmpegPath = process.env.PMP_FFMPEG || process.env.FFMPEG_PATH || runtime.ffmpegPath;
const ffprobePath = process.env.PMP_FFPROBE || process.env.FFPROBE_PATH || runtime.ffprobePath;
if(!ffmpegPath||!ffprobePath)throw Error('Configure a maintained FFmpeg/FFprobe pair before media tests. See scripts/install-media-tools.ps1.');
const bucket = 'test-owned-media';
const source = `gs://${bucket}/deliveries/master-one.wav`;
const source2 = `gs://${bucket}/deliveries/master-two.wav`;
const rawSource = `gs://${bucket}/deliveries/raw.wav`;
let fixtureRoot, wav;
const calls = (binary, args) => new Promise((done, reject) => {
  const child = spawn(binary, args, { shell: false, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let error = ''; child.stderr.on('data', chunk => { error += chunk; });
  child.on('error', reject); child.on('close', code => code === 0 ? done() : reject(new Error(error)));
});
before(async () => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'pmp-media-fixtures-'));
  const path = join(fixtureRoot, 'diagnostic-tone.wav');
  await calls(ffmpegPath, ['-hide_banner', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=1.5', '-ac', '2', '-c:a', 'pcm_s24le', path]);
  wav = await readFile(path);
});
after(async () => { if (fixtureRoot && resolve(fixtureRoot).startsWith(resolve(tmpdir()) + sep + 'pmp-media-fixtures-')) await rm(fixtureRoot, { recursive: true, force: true }); });

function signed(uri = source, adjustments = {}) {
  const { bucket: bucketName, object } = validateGcsUri(uri, [bucket]);
  const url = new URL(`https://storage.googleapis.com/${bucketName}/${object}`);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  for (const [key, value] of Object.entries({ 'X-Goog-Algorithm': 'GOOG4-RSA-SHA256', 'X-Goog-Credential': `fixture@example.invalid/${stamp.slice(0,8)}/auto/storage/goog4_request`, 'X-Goog-Date': stamp, 'X-Goog-Expires': '600', 'X-Goog-SignedHeaders': 'host', 'X-Goog-Signature': 'a'.repeat(512), ...adjustments })) url.searchParams.set(key, value);
  return url.href;
}
function result(tracks = [{ take: 1, kind: 'delivered master', gcs_uri: source }], extra = {}) { return { success: true, takes_requested: tracks.length, takes_delivered: tracks.length, tracks, ...extra }; }
async function setup(t, overrides = {}) {
  const root = await mkdtemp(join(tmpdir(), 'pmp-media-test-'));
  t.after(async () => { assert.ok(resolve(root).startsWith(resolve(tmpdir()))); assert.match(root, /pmp-media-test-[^\\/]+$/); await rm(root, { recursive: true, force: true }); });
  const seen = { deliveries: [], fetches: [] };
  const options = {
    root, ffmpegPath, ffprobePath, allowedBuckets: [bucket],
    delivery: async uri => { seen.deliveries.push(uri); return { success: true, gcs_uri: uri, url: signed(uri) }; },
    fetchImpl: async (url, options) => { seen.fetches.push({ url, options }); return new Response(wav, { headers: { 'content-length': String(wav.length) } }); },
    ...overrides,
  };
  return { root, seen, options, media: createMedia(options) };
}

test('real byte ingestion, distinct MP3 listening rendition, private master and restart idempotence', async t => {
  const { media, seen, options } = await setup(t);
  const health = await media.health();
  assert.equal(health.configured, true);
  t.diagnostic(health.ffmpeg);
  t.diagnostic(health.ffprobe);
  const output = await media.ingest('job_valid', result());
  assert.equal(output.status, 'ready');
  const take = output.takes[0];
  assert.equal(take.master.sha256, createHash('sha256').update(wav).digest('hex'));
  assert.equal(take.master.size, wav.length);
  assert.equal(take.master.codec, 'pcm_s24le');
  assert.equal(take.listening.codec, 'mp3');
  assert.equal(take.listening.measured, true);
  assert.notEqual(take.listening.id, take.master.id);
  assert.notEqual(take.listening.sha256, take.master.sha256);
  assert.ok(Math.abs(take.listening.durationSeconds - 1.5) < 0.1);
  assert.equal((await media.resolve(take.listening.id)).id, take.listening.id);
  assert.equal(await media.resolve(take.master.id), null);
  assert.equal((await media.resolve(take.master.id, 'master')).id, take.master.id);
  assert.equal(seen.fetches[0].options.redirect, 'manual');
  assert.equal(seen.fetches[0].options.headers.Authorization, undefined);
  const again = await createMedia(options).ingest('job_valid', result());
  assert.equal(again.takes[0].listening.sha256, take.listening.sha256);
  assert.equal(seen.fetches.length, 1);
  const persisted = await media.read('job_valid');
  assert.equal(persisted.status, 'ready');
  assert.ok(!JSON.stringify(persisted).includes('X-Goog-Signature'));
});

test('all takes retained, raw fallback not promoted, shortfall stays explicit', async t => {
  const { media } = await setup(t);
  const output = await media.ingest('job_partial', result([
    { take: 1, kind: 'delivered master', gcs_uri: source },
    { take: 2, kind: 'raw take (variation 2: render pass failed)', gcs_uri: rawSource },
  ], { takes_requested: 3, generation_shortfall: { takes_requested: 3, takes_generated: 2, failed_take: 3, error_code: 'VENDOR_CONTENT_BLOCKED' } }));
  assert.equal(output.status, 'partial');
  assert.equal(output.takes.length, 3);
  assert.equal(output.takes[0].status, 'ready');
  assert.equal(output.takes[1].master, null);
  assert.equal(output.takes[1].listening, null);
  assert.equal(output.takes[1].source.codec, 'pcm_s24le');
  assert.equal(output.takes[1].errors[0].code, 'RAW_ONLY');
  assert.equal(output.takes[2].errors[0].code, 'NOT_GENERATED');
  assert.equal(output.generationShortfall.failed_take, 3);
});

test('older first-take processed master selected while source and delivered stems remain private', async t => {
  const { media, seen } = await setup(t);
  const output = await media.ingest('job_legacy', result([{ take: 1, gcs_uri: rawSource }], {
    source_take: [{ take: 1, gcs_uri: rawSource }],
    render_plan: { processed_gcs_uri: source, stages: { stems: { stems: { vocals: { state: 'DELIVERED', grade: 'analysis-grade', gcs_uri: source2 }, bass: { state: 'REFUSED_LICENCE' } } } } },
  }));
  assert.equal(output.status, 'partial');
  assert.equal(output.takes[0].master.sourceUri, source);
  assert.equal(output.takes[0].source.sourceUri, rawSource);
  assert.equal(output.takes[0].stems[0].asset.kind, 'stem');
  assert.equal(output.takes[0].stems[1].asset, null);
  assert.equal(output.takes[0].stems[1].error.upstreamState, 'REFUSED_LICENCE');
  assert.equal(seen.deliveries.length, 3);
  assert.equal(await media.resolve(output.takes[0].stems[0].asset.id), null);
});

test('packaging failure retains measured master; restart retry never redownloads or regenerates', async t => {
  const { media, options, seen } = await setup(t, { ffmpegPath: join(fixtureRoot, 'nonexistent.exe') });
  const first = await media.ingest('job_packaging', result());
  assert.equal(first.status, 'partial');
  assert.ok(first.takes[0].master);
  assert.equal(first.takes[0].listening, null);
  assert.equal(first.takes[0].errors[0].code, 'MISSING_TOOLS');
  const retried = await createMedia({ ...options, ffmpegPath }).ingest('job_packaging', result());
  assert.equal(retried.status, 'ready');
  assert.equal(seen.fetches.length, 1);
});

test('concurrent same-job ingests serialize; changed object cannot replace persisted job', async t => {
  const { media, seen } = await setup(t);
  const outputs = await Promise.all([media.ingest('job_concurrent', result()), media.ingest('job_concurrent', result())]);
  assert.equal(outputs[0].takes[0].master.id, outputs[1].takes[0].master.id);
  assert.equal(seen.fetches.length, 1);
  await assert.rejects(media.ingest('job_concurrent', result([{ take: 1, kind: 'delivered master', gcs_uri: source2 }])), { code: 'RESULT_CONFLICT' });
});

test('untrusted URL forms, bucket/object mismatches and expired/duplicate signatures rejected', () => {
  for (const uri of ['http://127.0.0.1/file', 'gs://another-bucket/a.wav', `gs://${bucket}/../a.wav`, `gs://${bucket}/a\\b.wav`, `gs://${bucket}/a.wav?query`]) assert.throws(() => validateGcsUri(uri, [bucket]), { code: 'INVALID_SOURCE' });
  for (const value of [signed().replace('https:', 'http:'), signed().replace('storage.googleapis.com', '127.0.0.1'), signed().replace('storage.googleapis.com', 'storage.googleapis.com.evil.invalid'), signed().replace('/deliveries/master-one.wav', '/deliveries/other.wav'), signed().replace('https://', 'https://user:password@'), signed(source, { 'X-Goog-Date': '20200101T000000Z' }), signed() + '&X-Goog-Expires=600']) assert.throws(() => validateDeliveryUrl(value, source, [bucket]), { code: 'UNSAFE_DELIVERY' });
  const virtual = signed().replace(`storage.googleapis.com/${bucket}/`, `${bucket}.storage.googleapis.com/`);
  assert.equal(validateDeliveryUrl(virtual, source, [bucket]).hostname, `${bucket}.storage.googleapis.com`);
});

test('malicious renewed delivery is never fetched; redirects are never followed', async t => {
  const unsafe = await setup(t, { delivery: async () => ({ url: 'https://169.254.169.254/latest/meta-data/' }) });
  const blocked = await unsafe.media.ingest('job_ssrf', result());
  assert.equal(blocked.status, 'failed');
  assert.equal(blocked.takes[0].errors[0].code, 'UNSAFE_DELIVERY');
  assert.equal(unsafe.seen.fetches.length, 0);
  let requests = 0;
  const redirect = await setup(t, { fetchImpl: async () => { requests++; return new Response('', { status: 302, headers: { location: 'http://127.0.0.1/private' } }); } });
  assert.equal((await redirect.media.ingest('job_redirect', result())).status, 'failed');
  assert.equal(requests, 1);
});

test('size bounds apply to declared and streaming bodies; no published master or leftover part', async t => {
  for (const declared of [true, false]) {
    const { media, root } = await setup(t, { maxBytes: 1024, fetchImpl: async () => new Response(wav, { headers: declared ? { 'content-length': String(wav.length) } : {} }) });
    const output = await media.ingest(`job_size_${declared}`, result());
    assert.equal(output.takes[0].errors[0].code, 'SOURCE_TOO_LARGE');
    assert.equal(output.takes[0].master, null);
    const files = await readdir(root, { recursive: true });
    assert.ok(!files.some(file => file.endsWith('.part') || file.endsWith('audio.bin')));
  }
});

test('HTML masquerading as audio is not published; no upstream error or signed URL leaks', async t => {
  const { media, root } = await setup(t, { fetchImpl: async () => new Response('<html>not audio</html>') });
  const output = await media.ingest('job_invalid_audio', result());
  assert.equal(output.status, 'failed');
  assert.equal(output.takes[0].errors[0].code, 'INVALID_MEDIA');
  assert.ok(!(await readdir(root, { recursive: true })).some(file => file.endsWith('audio.bin')));
  assert.ok(!JSON.stringify(output).includes('X-Goog-Signature'));
});

test('download stalls are bounded and first 403 refreshes only the known source once', async t => {
  const stalled = await setup(t, { downloadTimeoutMs: 20, fetchImpl: async (_, options) => new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('abort')), { once: true })) });
  const timeout = await stalled.media.ingest('job_stall', result());
  assert.equal(timeout.takes[0].errors[0].code, 'DOWNLOAD_TIMEOUT');
  let attempts = 0;
  const refresh = await setup(t, { fetchImpl: async () => ++attempts === 1 ? new Response('expired', { status: 403 }) : new Response(wav) });
  assert.equal((await refresh.media.ingest('job_refresh', result())).status, 'ready');
  assert.equal(refresh.seen.deliveries.length, 2);
  assert.ok(refresh.seen.deliveries.every(uri => uri === source));
});

test('traversal IDs rejected, corrupt stored bytes rejected and safely re-ingested', async t => {
  const { media, seen } = await setup(t);
  await assert.rejects(media.ingest('../escape', result()), { code: 'INVALID_JOB' });
  assert.equal(await media.resolve('../escape'), null);
  const original = await media.ingest('job_corrupt', result());
  const master = original.takes[0].master;
  await writeFile(master.path, 'tampered');
  assert.equal(await media.resolve(master.id, 'master'), null);
  const recovered = await media.ingest('job_corrupt', result());
  assert.equal(recovered.status, 'ready');
  assert.equal(recovered.takes[0].master.sha256, master.sha256);
  assert.equal((await stat(master.path)).size, wav.length);
  assert.equal(seen.fetches.length, 2);
});

test('process and delivery timeouts are bounded; a declared delivered stem without an object remains partial', async t => {
  const processing = await setup(t, { processTimeoutMs: 1 });
  const timed = await processing.media.ingest('job_process_timeout', result());
  assert.equal(timed.status, 'failed');
  assert.equal(timed.takes[0].errors[0].code, 'TOOL_TIMEOUT');
  const deliveryTimeout = await setup(t, { deliveryTimeoutMs: 10, delivery: async () => new Promise(() => {}) });
  assert.equal((await deliveryTimeout.media.ingest('job_delivery_timeout', result())).takes[0].errors[0].code, 'DELIVERY_TIMEOUT');
  const stems = await setup(t);
  const incomplete = await stems.media.ingest('job_missing_stem', result(undefined, { render_plan: { stages: { stems: { stems: { vocals: { state: 'DELIVERED' } } } } } }));
  assert.equal(incomplete.status, 'partial');
  assert.ok(incomplete.takes[0].listening);
  assert.equal(incomplete.takes[0].stems[0].error.code, 'INVALID_SOURCE');
});

test('result metadata and source URIs cannot overwrite private output paths or leak transport auth', async t => {
  const { media, root } = await setup(t);
  const output = await media.ingest('job_metadata', result([{ take: 1, kind: 'delivered master', gcs_uri: source, public_url: signed(), path: 'C:/outside/secret', render_plan: { processed_url: signed() } }], { auth: { key_id: 'do-not-copy' } }));
  assert.equal(output.status, 'ready');
  assert.ok(output.takes[0].master.path.startsWith(root));
  assert.equal(output.upstream.auth, undefined);
  assert.equal(output.takes[0].upstream.public_url, undefined);
  assert.equal(output.takes[0].upstream.render_plan.processed_url, undefined);
  await assert.rejects(media.ingest('job_duplicate', result([{ take: 1, kind: 'delivered master', gcs_uri: source }, { take: 1, kind: 'delivered master', gcs_uri: source2 }])), { code: 'INVALID_RESULT' });
});

test('storage junctions and a tampered persisted filename cannot escape the private root', async t => {
  const outside = await mkdtemp(join(tmpdir(), 'pmp-media-outside-'));
  t.after(async () => { assert.match(outside, /pmp-media-outside-[^\\/]+$/); await rm(outside, { recursive: true, force: true }); });
  const junction = await setup(t);
  await symlink(outside, join(junction.root, 'objects'), process.platform === 'win32' ? 'junction' : 'dir');
  const rejected = await junction.media.ingest('job_junction', result());
  assert.equal(rejected.status, 'failed');
  assert.equal(rejected.takes[0].errors[0].code, 'STORAGE_UNSAFE');
  assert.deepEqual(await readdir(outside), []);
  const normal = await setup(t);
  const output = await normal.media.ingest('job_record_tamper', result());
  const asset = output.takes[0].listening;
  const recordPath = join(normal.root, 'objects', asset.id, 'asset.json');
  const record = JSON.parse(await readFile(recordPath, 'utf8'));
  record.file = '../../outside.txt';
  await writeFile(recordPath, JSON.stringify(record));
  await assert.rejects(normal.media.resolve(asset.id), { code: 'STORAGE_UNSAFE' });
});

test('Windows transient replacement recovers atomically without removing the prior manifest', async t => {
  const { root } = await setup(t);
  const oldPath = join(root, 'durable.json'), newPath = join(root, 'replacement.tmp');
  await writeFile(oldPath, '{"revision":1}');
  await writeFile(newPath, '{"revision":2}');
  let attempts = 0;
  await replaceMediaManifest(newPath, oldPath, { platform: 'win32', renameFile: async (from, to) => {
    attempts++;
    assert.equal((JSON.parse(await readFile(oldPath, 'utf8'))).revision, 1);
    if (attempts < 3) throw Object.assign(new Error('transient fixture lock'), { code: attempts === 1 ? 'EPERM' : 'EBUSY' });
    return rename(from, to);
  } });
  assert.equal(attempts, 3);
  assert.equal((JSON.parse(await readFile(oldPath, 'utf8'))).revision, 2);
  await assert.rejects(stat(newPath), { code: 'ENOENT' });
});

test('replacement retries expire and unrelated/platform errors propagate with the durable destination intact', async t => {
  const { root } = await setup(t);
  const oldPath = join(root, 'durable.json'), newPath = join(root, 'replacement.tmp');
  await writeFile(oldPath, '{"revision":1}');
  await writeFile(newPath, '{"revision":2}');
  let attempts = 0;
  const started = performance.now();
  const locked = Object.assign(new Error('persistent fixture lock'), { code: 'EACCES' });
  await assert.rejects(replaceMediaManifest(newPath, oldPath, { platform: 'win32', retryWindowMs: 80, renameFile: async () => { attempts++; throw locked; } }), error => error === locked);
  assert.ok(attempts >= 2);
  assert.ok(performance.now() - started < 1500);
  assert.equal((JSON.parse(await readFile(oldPath, 'utf8'))).revision, 1);
  assert.equal((JSON.parse(await readFile(newPath, 'utf8'))).revision, 2);
  for (const [platform, code] of [['linux', 'EPERM'], ['win32', 'ENOENT']]) {
    let calls = 0;
    await assert.rejects(replaceMediaManifest(newPath, oldPath, { platform, renameFile: async () => { calls++; throw Object.assign(new Error('nonretryable fixture error'), { code }); } }), { code });
    assert.equal(calls, 1);
  }
});
