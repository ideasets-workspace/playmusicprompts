/* Admission-limit constants for the PlayMusicPrompts website server.
 *
 * WHAT THIS FILE IS
 *   The single place where every numeric admission ceiling and default of the
 *   website's own request-admission layer is declared. `config.mjs` reads the
 *   defaults and the ceiling from here; `http.mjs`, `initial-creation.mjs`,
 *   `listening-sessions.mjs` and `enhancements.mjs` read the signed-in and
 *   enhancement limits from here; `store.mjs` reads the per-scope 429 messages.
 *   No caller may carry its own literal copy of one of these numbers
 *   (frontier-engineering law: constants live apart from the code that uses
 *   them and are wired in).
 *
 * WHY THE NUMBERS ARE WHAT THEY ARE
 *   Owner order, 2026-09-15 10:20 (+03), verbatim: "limiti 1000 yap". Before
 *   that order the ceiling was 100 and the per-guest / per-IP defaults were 10,
 *   which blocked the owner's own development session after three creations
 *   (each "Create & Play" admits three musical directions = 3 counts; 9 + 3 > 10).
 *   The 1000 values below apply that order to every admission scope.
 *
 * WHAT THESE LIMITS DO NOT CHANGE
 *   The external music engine enforces its own per-API-key daily quota
 *   (docs/api/02-authentication.md, "limits.daily_quota", default 100/day and
 *   operator-set). The website cannot raise that number; when the key's quota is
 *   exhausted the engine answers 429 and the website reports the engine's own
 *   RATE_LIMITED message. Raising the website ceiling therefore never causes a
 *   paid request to be made that the engine would not have accepted; it only
 *   stops the website from refusing requests earlier than the engine would.
 *
 * SCOPES
 *   global   - every creation admitted by this website instance, per UTC day.
 *   guest    - creations by one anonymous browser session, per UTC day.
 *   signedIn - creations by one verified account, per UTC day.
 *   ip       - creations from one client address, per UTC day.
 *   minute   - creations from one client address, per rolling minute bucket.
 *   enhance  - prompt-enhancement jobs, per UTC day, shared with the global bucket.
 */

/** Highest value any admission limit may be configured to (env or default). */
export const ADMISSION_CEILING = 1000;

/** Default per-UTC-day creation admissions for the whole website instance. */
export const DEFAULT_DAILY_ADMISSION_LIMIT = 1000;

/** Default per-UTC-day creation admissions for one anonymous guest session. */
export const DEFAULT_GUEST_DAILY_LIMIT = 1000;

/** Per-UTC-day creation admissions for one verified (signed-in) account. */
export const SIGNED_IN_DAILY_LIMIT = 1000;

/** Default per-UTC-day creation admissions from one client IP address. */
export const DEFAULT_IP_DAILY_LIMIT = 1000;

/** Creation admissions from one client IP address per minute bucket (unchanged burst guard). */
export const IP_MINUTE_LIMIT = 2;

/** Upper bound for the enhancement worker's share of the daily global bucket. */
export const ENHANCEMENT_DAILY_CEILING = ADMISSION_CEILING;

/** Length of one admission day, in milliseconds (UTC calendar-day buckets). */
export const ADMISSION_DAY_MS = 86_400_000;

/** Length of one burst bucket, in milliseconds. */
export const ADMISSION_MINUTE_MS = 60_000;

/**
 * Human-readable descriptions per admission scope. `Store.consume()` places the
 * matching sentence in its 429 response so the person reading the error knows
 * WHICH limit stopped them and when it resets. A bare "limit reached" was the
 * owner's own complaint on 2026-09-15 ("bu hata neden???").
 */
export const ADMISSION_SCOPE_MESSAGES = Object.freeze({
  global: 'This website has reached its daily creation limit. It resets at midnight UTC.',
  guest: 'This browser session has reached its daily creation limit. It resets at midnight UTC.',
  signedIn: 'Your account has reached its daily creation limit. It resets at midnight UTC.',
  ip: 'Your network address has reached its daily creation limit. It resets at midnight UTC.',
  minute: 'Creations are limited per minute from one network address. Please wait a moment and try again.',
});

/** Fallback sentence for counters that carry no scope description. */
export const GENERIC_LIMIT_MESSAGE = 'This request limit has been reached. Please try again later.';
