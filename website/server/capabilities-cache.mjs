/* capabilities-cache.mjs — the engine's capabilities document, served from disk so page load never touches the engine.
 *
 * WHY. Under the owner rule of 2026-09-15 the music engine is contacted only for generations. The controls schema
 * (/api/controls-schema, /api/capabilities) and the connection status (/api/connection) used to fetch the engine on
 * cache misses at every visitor's page load; when the engine's per-key quota was exhausted the site opened with the
 * engine's raw 429 text and creation disabled. This class owns ONE persistent copy of the capabilities document and
 * decides, by policy, the only moments the engine may be asked for a new one.
 *
 * WHAT IT GUARANTEES.
 *   - `document()` never calls the engine: it returns the cached document or null.
 *   - `get()` calls the engine only when there is NO cached document at all (first start), single-flight, and
 *     converts any failure into CAPABILITIES_UNAVAILABLE (503) — the engine's own wording never reaches a visitor.
 *   - A refresh happens in the background (a) at most once per CAPABILITIES_REFRESH_INTERVAL_MS, or (b) when a
 *     generation response reports a different `service.revision` than the cached document (engine redeployed);
 *     a failed refresh keeps the old document and blocks further attempts for CAPABILITIES_RETRY_BACKOFF_MS.
 *   - Every engine attempt is reported through `log` as one JSON-able line, so counts are measured, not guessed.
 *
 * FILE FORMAT (CAPABILITIES_CACHE_FILE in the private state directory, mode 0600):
 *   { "fetchedAt": <ms epoch>, "revision": <engine service.revision or null>, "document": <raw capabilities> }
 *
 * Callers: server/main.mjs (constructs, loads, wires engine responses, starts the timer), server/http.mjs (serves),
 * server/previews.mjs (validation only). Constants: server/capabilities-constants.mjs. Tests: test/capabilities-cache.test.mjs.
 */
import {mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {problem} from './store.mjs';
import {CAPABILITIES_CACHE_FILE, CAPABILITIES_REFRESH_INTERVAL_MS, CAPABILITIES_RETRY_BACKOFF_MS, CAPABILITIES_UNAVAILABLE} from './capabilities-constants.mjs';

export class CapabilitiesCache {
  /**
   * @param {{stateRoot: string, fetch: () => Promise<object>, now?: () => number, log?: (line: object) => void}} deps
   *   `fetch` is the engine call (engine.capabilities); nothing else in this class knows the engine.
   */
  constructor({stateRoot, fetch, now = Date.now, log = () => {}}) {
    if (typeof fetch !== 'function') throw new TypeError('CapabilitiesCache needs the engine fetch function');
    this.path = resolve(stateRoot, CAPABILITIES_CACHE_FILE);
    this.fetch = fetch; this.now = now; this.log = log;
    this.entry = null;          // {fetchedAt, revision, document}
    this.inFlight = null;       // single-flight promise for any engine attempt
    this.blockedUntil = 0;      // backoff deadline after a failed attempt
    this.timer = null;
  }

  /** Reads the persisted document; a missing or corrupt file simply means "no document yet". */
  load() {
    try {
      const parsed = JSON.parse(readFileSync(this.path, 'utf8'));
      if (parsed && typeof parsed === 'object' && parsed.document && typeof parsed.document === 'object' && Number.isFinite(parsed.fetchedAt)) {
        this.entry = {fetchedAt: parsed.fetchedAt, revision: typeof parsed.revision === 'string' ? parsed.revision : null, document: parsed.document};
      }
    } catch (error) { if (error.code !== 'ENOENT') this.log({event: 'capabilities_cache_unreadable', code: error.code || 'PARSE'}); }
    return this.entry;
  }

  /** The cached raw document or null. Never contacts the engine. */
  document() { return this.entry?.document ?? null; }

  /** Metadata for status surfaces: when the schema was fetched and from which engine revision. */
  status() { return this.entry ? {available: true, fetchedAt: this.entry.fetchedAt, revision: this.entry.revision, ageMs: this.now() - this.entry.fetchedAt} : {available: false, fetchedAt: null, revision: null, ageMs: null}; }

  /**
   * The document for serving. With a cached copy this resolves immediately (and may kick a background refresh when
   * the copy is older than the refresh interval). Without one it makes the single first-start engine call.
   */
  async get() {
    if (this.entry) { if (this.now() - this.entry.fetchedAt >= CAPABILITIES_REFRESH_INTERVAL_MS) this.refresh('interval'); return this.entry.document; }
    try { return await this.refresh('first-start'); }
    catch { throw problem(CAPABILITIES_UNAVAILABLE.status, CAPABILITIES_UNAVAILABLE.code, CAPABILITIES_UNAVAILABLE.message); }
  }

  /**
   * Called with every successful engine response of a generation (jobs, enhancements); a different service revision
   * means the engine was redeployed and its capabilities may have changed → one background refresh.
   */
  noteEngineResponse(response) {
    const revision = response?.service?.revision;
    if (typeof revision !== 'string' || !this.entry || this.entry.revision === revision) return false;
    this.refresh('revision-change');
    return true;
  }

  /** Single-flight engine attempt honouring the backoff. Resolves with the document; rejects on failure. */
  refresh(reason) {
    if (this.inFlight) return this.inFlight;
    if (this.now() < this.blockedUntil) {
      // Callers that fire-and-forget (get(), noteEngineResponse) must never surface this as an unhandled rejection;
      // callers that await it still observe the rejection.
      const blocked = Promise.reject(new Error('CAPABILITIES_REFRESH_BACKOFF')); blocked.catch(() => {}); return blocked;
    }
    const started = this.now();
    this.inFlight = this.fetch().then(document => {
      if (!document || typeof document !== 'object' || Array.isArray(document)) throw new Error('CAPABILITIES_INVALID');
      this.entry = {fetchedAt: this.now(), revision: typeof document.service?.revision === 'string' ? document.service.revision : null, document};
      this.persist();
      this.log({event: 'engine_capabilities_refresh', reason, outcome: 'ok', ms: this.now() - started, revision: this.entry.revision});
      return document;
    }).catch(error => {
      this.blockedUntil = this.now() + CAPABILITIES_RETRY_BACKOFF_MS;
      this.log({event: 'engine_capabilities_refresh', reason, outcome: 'failed', code: error.code || error.message || 'UNKNOWN', ms: this.now() - started, retryAfterMs: CAPABILITIES_RETRY_BACKOFF_MS});
      throw error;
    }).finally(() => { this.inFlight = null; });
    // Background callers never see the rejection as an unhandled promise.
    this.inFlight.catch(() => {});
    return this.inFlight;
  }

  /** Atomic write (temp file + rename) so a crash mid-write can never leave a truncated cache. */
  persist() {
    mkdirSync(resolve(this.path, '..'), {recursive: true, mode: 0o700});
    const temp = `${this.path}.${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify(this.entry), {mode: 0o600});
    renameSync(temp, this.path);
  }

  /** Periodic background refresh; the timer is unref'd so it never keeps a shutting-down process alive. */
  start() { if (!this.timer) { this.timer = setInterval(() => this.refresh('interval').catch(() => {}), CAPABILITIES_REFRESH_INTERVAL_MS); this.timer.unref?.(); } }
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
}
