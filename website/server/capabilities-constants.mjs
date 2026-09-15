/* capabilities-constants.mjs — fixed values for the engine-capabilities cache and the engine-contact policy.
 *
 * Owner rule (Berk, 2026-09-15 14:47, verbatim): "api ye sadece generate de ve next track generate de gidelim backend
 * den client dan değil" — the music engine is contacted only for a generation (create, play-something, next-track,
 * enhance) and the lifecycle that generation needs (status poll, delivery URL, originality report). Page load,
 * the controls schema, the connection status and previews must never spend an engine request.
 *
 * Measured 2026-09-15 on the live host: the previous 5-minute in-memory schema cache and the 30-second health cache
 * re-fetched on visitor traffic (≤5 and ≤17 engine calls that day), and the key's 100/day quota was exhausted with
 * legacy import + generations; when the engine then answered 429, the site opened with the engine's raw message and
 * creation disabled. The values below make page load independent of the engine.
 */

/** File inside the private state directory that holds the last good capabilities document (JSON, with metadata). */
export const CAPABILITIES_CACHE_FILE = 'capabilities.cache.json';

/**
 * The cached document is re-fetched in the background at most once per this interval (24 h) — the engine's
 * capabilities change only when the engine is redeployed, and a redeploy is also detected from the `service.revision`
 * field of every generation response (see CapabilitiesCache.noteEngineResponse), which triggers one refresh.
 */
export const CAPABILITIES_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** After a failed refresh (429, 5xx, network) no further engine call is attempted for this long; the cached document keeps serving. */
export const CAPABILITIES_RETRY_BACKOFF_MS = 15 * 60 * 1000;

/** Problem returned when no capabilities document exists anywhere yet (first start with the engine unreachable). */
export const CAPABILITIES_UNAVAILABLE = Object.freeze({
  status: 503, code: 'CAPABILITIES_UNAVAILABLE',
  message: 'Creation controls are not available right now. Listening works; creating returns when the music service is reachable.',
});

/**
 * Request previews (`dry_run` / `capabilities` modes of the engine) are a non-generation engine call and are therefore
 * refused under the owner rule. The two engine parameters that switch a request into those modes stay described in
 * the controls contract (their `false` values are ordinary request fields); only the preview ROUTE is refused.
 */
export const PREVIEW_UNAVAILABLE = Object.freeze({
  status: 409, code: 'PREVIEW_UNAVAILABLE',
  message: 'Request previews are turned off: the music service is contacted only when a song is created.',
});

/** Job statuses that prove "the engine answered a generation" when the connection status is derived from history. */
export const GENERATION_EVIDENCE_STATUSES = Object.freeze(['ready', 'partial', 'pending', 'ingesting']);
