/* test/capabilities-cache.test.mjs — the engine-contact policy of server/capabilities-cache.mjs.
 * Proves: first start fetches once and persists; a second instance serves from disk with zero engine calls; a stale
 * document is served immediately while one background refresh runs; a failing refresh keeps the old document and
 * backs off; a changed engine revision in a generation response triggers exactly one refresh; without any document a
 * failing engine yields the site's own 503 problem, never the engine's text.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CapabilitiesCache} from '../server/capabilities-cache.mjs';
import {CAPABILITIES_CACHE_FILE, CAPABILITIES_REFRESH_INTERVAL_MS, CAPABILITIES_RETRY_BACKOFF_MS} from '../server/capabilities-constants.mjs';

const doc = revision => ({schema_id: 'berk.music-studio-param-spec/v1', service: {revision}, parameters: [{name: 'prompt'}]});

async function fixture(t) {
  const stateRoot = await mkdtemp(join(tmpdir(), 'pmp-caps-'));
  t.after(() => rm(stateRoot, {recursive: true, force: true}));
  let now = 1_000_000; const clock = () => now; const advance = ms => { now += ms; };
  const calls = []; const logs = [];
  let answer = async () => doc('rev-1');
  const fetch = async () => { calls.push(now); return answer(); };
  const make = () => new CapabilitiesCache({stateRoot, fetch, now: clock, log: l => logs.push(l)});
  return {stateRoot, make, calls, logs, advance, setAnswer: fn => { answer = fn; }};
}

test('first start fetches once, persists to disk, and a fresh process serves from disk with zero engine calls', async t => {
  const f = await fixture(t);
  const a = f.make(); a.load();
  assert.equal(a.document(), null); assert.equal(a.status().available, false);
  const first = await a.get(); assert.equal(first.service.revision, 'rev-1'); assert.equal(f.calls.length, 1);
  await a.get(); await a.get(); assert.equal(f.calls.length, 1, 'served from memory');
  const persisted = JSON.parse(await readFile(join(f.stateRoot, CAPABILITIES_CACHE_FILE), 'utf8'));
  assert.equal(persisted.revision, 'rev-1'); assert.equal(persisted.document.service.revision, 'rev-1');
  const b = f.make(); b.load();
  assert.equal(b.status().available, true); assert.equal((await b.get()).service.revision, 'rev-1'); assert.equal(f.calls.length, 1, 'second process: disk, not engine');
});

test('a document older than the refresh interval is served immediately and refreshed once in the background; failure keeps it and backs off', async t => {
  const f = await fixture(t); const c = f.make(); c.load(); await c.get(); assert.equal(f.calls.length, 1);
  f.advance(CAPABILITIES_REFRESH_INTERVAL_MS + 1); f.setAnswer(async () => doc('rev-2'));
  const served = await c.get(); assert.equal(served.service.revision, 'rev-1', 'old document served without waiting');
  await new Promise(r => setImmediate(r)); assert.equal(f.calls.length, 2); assert.equal(c.document().service.revision, 'rev-2');
  f.advance(CAPABILITIES_REFRESH_INTERVAL_MS + 1); f.setAnswer(async () => { throw Object.assign(new Error('rate limited'), {code: 'RATE_LIMITED'}); });
  await c.get(); await new Promise(r => setImmediate(r)); assert.equal(f.calls.length, 3); assert.equal(c.document().service.revision, 'rev-2', 'failure keeps the last good document');
  f.advance(1000); await c.get(); await new Promise(r => setImmediate(r)); assert.equal(f.calls.length, 3, 'backoff: no second attempt');
  f.advance(CAPABILITIES_RETRY_BACKOFF_MS); f.setAnswer(async () => doc('rev-3')); await c.get(); await new Promise(r => setImmediate(r));
  assert.equal(f.calls.length, 4); assert.equal(c.document().service.revision, 'rev-3');
  assert.ok(f.logs.some(l => l.event === 'engine_capabilities_refresh' && l.outcome === 'failed' && l.code === 'RATE_LIMITED'));
});

test('a generation response with a new engine revision triggers exactly one refresh; same revision triggers none', async t => {
  const f = await fixture(t); const c = f.make(); c.load(); await c.get(); assert.equal(f.calls.length, 1);
  assert.equal(c.noteEngineResponse({success: true, service: {revision: 'rev-1'}}), false);
  assert.equal(c.noteEngineResponse({success: true}), false);
  f.setAnswer(async () => doc('rev-9'));
  assert.equal(c.noteEngineResponse({success: true, service: {revision: 'rev-9'}}), true);
  assert.equal(c.noteEngineResponse({success: true, service: {revision: 'rev-9'}}), true, 'a second note while in flight joins the same single-flight attempt');
  await new Promise(r => setImmediate(r)); assert.equal(f.calls.length, 2); assert.equal(c.document().service.revision, 'rev-9');
});

test('with no document anywhere and a failing engine, get() throws the site problem (503 CAPABILITIES_UNAVAILABLE), never the engine text', async t => {
  const f = await fixture(t); f.setAnswer(async () => { throw new Error('The music service request limit has been reached.'); });
  const c = f.make(); c.load();
  await assert.rejects(c.get(), error => error.status === 503 && error.code === 'CAPABILITIES_UNAVAILABLE' && !/request limit/.test(error.message));
  assert.equal(c.document(), null);
});

test('constructor refuses a missing fetch function', () => {
  assert.throws(() => new CapabilitiesCache({stateRoot: tmpdir()}), TypeError);
});
