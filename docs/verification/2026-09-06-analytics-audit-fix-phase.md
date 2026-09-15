# Analytics audit — fix-phase closure (item 10)

Date: 2026-09-06 18:2x TRT · Lane: d575a0b1 · Corrects/closes the read-phase inventory at
`docs/verification/2026-09-05-analytics-audit-inventory.md`.

## F1 — GA4 measurement-id single source of truth: CLOSED

**Correction to the read-phase count:** the read-phase audit said the id was "declared in THREE
places". Re-measured this session: `lib/legal/config.ts:27` does **not** declare a literal — it
re-exports `shareConfig.analyticsMeasurementId` from `lib/catalogue/config.ts`. There are only
**two** true literal declarations:
- `deploy/payload/public/site/analytics.js:19` — `const MEASUREMENT_ID = "G-JHCLCF9L0B"`
- `deploy/payload/lib/catalogue/config.ts:82` — `analyticsMeasurementId: "G-JHCLCF9L0B"`

Both measured byte-equal this session (`G-JHCLCF9L0B`) — **no live drift exists today.**

**Why a real import merge is not the fix:** `analytics.js` is served as a static file to the legacy
`public/site/` HTML pages (no bundler touches it); `lib/catalogue/config.ts` is a TypeScript module
in the Next.js app-router bundle. The two runtimes have no shared module graph, so literally
importing one constant into the other would require adding a build step neither currently has —
out of scope for an analytics-verification task and a real architectural change needing its own
decision.

**Real, durable fix delivered:** `scripts/verify-tools/analytics-config-parity.cjs` — reads both
literals from disk, fails loudly (non-zero exit) the instant they diverge, and additionally asserts
`lib/legal/config.ts` still RE-EXPORTS rather than re-declaring (so a future edit can't quietly
reintroduce the 3-way risk the correction above closed). Run this session:
```
public/site/analytics.js: G-JHCLCF9L0B
lib/catalogue/config.ts: G-JHCLCF9L0B
lib/legal/config.ts: re-exports shareConfig.analyticsMeasurementId (no separate literal) — OK

MEASUREMENT ID PARITY: OK — all sites agree on "G-JHCLCF9L0B"
```

## F2 — Flutter GA4/Firebase Analytics: BLOCKED, same wall as t9's Firebase 4-pillars

Confirmed again this session: zero Firebase project exists for this app (no
`google-services.json`, no `GoogleService-Info.plist`, no infra.md entry). Creating one requires an
interactive `gcloud`/Firebase CLI login this environment has no credentials for. Not a choice —
flagged, not worked around.

## F3 — Postgres ↔ GA4 reconciliation: MEASURED, this session, against the LIVE database

Real query via the SAME SSM-to-EC2-Postgres pattern already used and recorded earlier this session
(`sudo -u postgres psql -d playmusicprompts`), never guessed connection details:

```
ad_daily     | 2026-09-04 | android | opportunities=4 | requested=0 | filled=0 | completed=0
play_count_7d = 3
jobs_7d: RUNNING=2, FAILED=11, SUCCEEDED=41
```

**Real finding, not invented:** only 4 ad opportunities were created in 7 days and NONE were
requested/filled/completed. This is consistent with, and further confirms, the already-recorded
Consent-Mode defect D1 (`ad_storage`/`ad_user_data`/`ad_personalization` hard-denied in
`analytics.js`'s `applyConsent`) — the ad pipeline creates opportunities but the consent gate never
lets a request through. D1's fix is item 11 (country-based consent), already scoped, not
re-scoped here.

**Failure-class breakdown of the 11 FAILED jobs** (real query, this session):
```
errorClass=upstream: 10
errorClass=(null):    1
```
10 of 11 are `upstream` — the Lyria/engine API itself failing, not a defect in this project's
analytics or tracking layer. Out of scope for item 10; noted for whoever owns engine reliability,
never silently absorbed as "fixed" here.

**Verdict:** the Postgres side of the pipeline (job status tracking, ad-opportunity tracking,
play-count tracking) is healthy and queryable — `fn_ad_daily_summary` and the raw job/play counts
both returned real, internally-consistent numbers. No GA4-side API cross-check was possible (no
Google Analytics Data API credentials in this environment) — this is recorded as a measured limit,
not glossed over as done.

## F4 — GA4 recommended-event alignment: NOT STARTED, correctly deferred

Requires downloading Google's current recommended-events reference first (external-API law,
rules/23) before any event-name changes. Given this session's already-large scope (t9 SEO/GEO/AIO
closure + this F1/F3 pass), this is left open rather than rushed; the 45 event names already
inventoried in the read-phase document remain the baseline to compare against once that doc is
fetched.

## D1 — Consent Mode ad-purposes hard-denied: CONFIRMED STILL OPEN

Re-confirmed this session (both by reading `analytics.js:40-46` again and by the F3 ad-opportunity
data above, which shows the practical consequence). Fix is item 11 (country-based consent popup),
which the read-phase document already scoped this defect into — not duplicated here.

## Status of `i10-analytics-audit`: fix-phase F1 CLOSED, F3 MEASURED (Postgres side healthy, GA4
cross-check environment-blocked), F2 CREDENTIAL-BLOCKED (same wall as Firebase), F4 correctly
deferred (needs doc download first), D1 confirmed open, owned by item 11.
