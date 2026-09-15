# Analytics audit — measured inventory (item 10, read phase)

Date: 2026-09-05 16:3x TRT · Lane: d575a0b1 · Task: `i10-analytics-audit` (open)
Scope of the order (Berk, 2026-09-05): "tüm analytics tablerimiz vs. de düzgün olmalı" — GA4 on web
and Flutter, Consent Mode v2, and the Postgres analytics tables (ad opportunities, plays, generation).

This file records ONLY what was measured from disk this session, with the command family used.
It is the input to the fix phase; nothing here is a completion claim.

## 1. Web (Next.js static site, `deploy/payload/public/site/`)

### 1.1 Event API
- `analytics.js` (79 lines) — one `track(name, params)` API exported as `window.__pmpAnalytics`;
  params are scalar-only, strings capped at 100 chars, no prompt/lyrics text (lines 67–76).
- Measurement id `G-JHCLCF9L0B` is declared in THREE places: `analytics.js:19`,
  `lib/catalogue/config.ts:82`, `lib/legal/config.ts:27` (via shareConfig). Fix-phase item F1:
  single source of truth (rules/20 constants file) — verify the three are byte-equal before merging.

### 1.2 Unique GA4 event names — 45 measured (`rg` over `*.js`, patterns `T("…")` and `track("…")`)
| file | events |
|---|---|
| `ads.js` | ad_break_declined, ad_error, ad_started, ad_skipped, ad_complete, ad_requested |
| `musics.js` | musics_filter, musics_play, musics_sort, musics_view |
| `social.js` | like_toggle, playlist_open, playlist_remove, playlist_add, playlist_create |
| `player.js` | generate_start, playlist_start, generate_complete, generate_error, adaptive_generation, track_start, track_skip, track_complete, history_replay, toggle_shuffle, toggle_repeat, download_track, toggle_mute, seek, audio_play, audio_pause, delivery_url_refresh |
| `track.js` | track_page_view (+ audio_play / track_complete / seek / toggle_mute with `surface:"track_page"`) |
| `share.js` | share_track |
| `app.js` | select_option, reference_add, engine_ready, engine_unavailable |
| `modal.js` | modal_play_now, modal_dismiss |
| `enhance.js` | enhance_open, enhance_start, enhance_complete, enhance_apply, enhance_undo, enhance_error |
| `analytics.js` | consent_update |

Count: 6+4+5+17+1+1+4+2+6+1 = **47 call-sites naming 45 distinct events** (track.js re-uses 4 names).

### 1.3 Consent Mode v2 — DEFECT D1 (measured, `analytics.js:40–46`)
```js
function applyConsent(decision) {
  window.gtag("consent", "update", {
    analytics_storage: decision.analytics ? "granted" : "denied",
    // The site runs no advertising: ad purposes stay denied regardless.
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
}
```
The comment is now false: `ads.js` exists (IMA audio breaks, `ad_requested{personalized}`) and
item 8 adds banner slots. With `ad_storage`/`ad_user_data`/`ad_personalization` hard-denied,
Google will serve only non-personalised/limited ads everywhere and GA4 ads-linked reporting is
degraded — regardless of what the user chose. This is the same file item 11 (country-based consent)
rewrites, so D1 is fixed inside item 11, not separately.

### 1.4 Consent UI — GAP (measured, `consent.js`, 4,101 B)
- No region/country/geo logic (grep `region|country|geo|eea|gdpr|kvkk|locale` → only prose lines
  2, 6, 20, 33). Binary analytics-only choice, default denied for everyone. Item 11 replaces it.

## 2. Flutter app (`app/`) — GAP G1 (measured absence)
- `rg -i 'firebase|analytics|measurement_protocol|gtag|posthog|amplitude|mixpanel' app/pubspec.yaml app/lib`
  → **NO MATCH**. The phone/tablet apps send no analytics at all. The `consent_gate.dart` UMP flow
  gates ADS only. Fix-phase item F2: GA4 for Flutter (Firebase Analytics SDK is Google's documented
  route; official docs must be downloaded under `docs/external-api/` first — external-API law) with
  the same event vocabulary as §1.2, and Consent Mode v2 equivalents (`setConsent`) tied to the
  item-11 country-based decision.

## 3. Postgres (Prisma, `deploy/payload/prisma/`)
- Models: User, Account, Session, VerificationToken, ApiKey, Project, LoginEvent, AuditLog,
  MusicJob, MusicTrack, MusicTrackLike, Playlist, PlaylistItem (schema.prisma lines 27–331).
- Migrations: 9 (init … `20260904200000_ad_opportunities`).
- Database functions defined (22, rules/20 compliant — no SQL statements in TS, only function calls
  via `$queryRaw` SELECT fn_…): fn_ad_daily_summary, fn_ad_event_record, fn_ad_opportunity_open,
  fn_catalogue_facets, fn_catalogue_ingest_job, fn_catalogue_list, fn_catalogue_public_ids,
  fn_link_anonymous_jobs, fn_playlist_add_track, fn_playlist_create, fn_playlist_delete,
  fn_playlist_items, fn_playlist_list, fn_playlist_remove_track, fn_playlist_rename,
  fn_playlists_containing, fn_social_assert_identity, fn_track_like_state, fn_track_like_toggle,
  fn_track_refresh_delivery, fn_track_register_play, fn_track_set_storage.
- Fix-phase item F3 (verification, not code): run `fn_ad_daily_summary` and a play/generation count
  against the live database and reconcile against GA4 counts for the same window; record the delta.

## 4. Fix-phase list derived from this inventory (all open)
| id | item | depends on |
|---|---|---|
| F1 | one constants source for the GA4 measurement id (3 declarations today) | — |
| F2 | Flutter analytics: SDK + 45-event vocabulary parity + consent hooks | item 11 decision model; official docs download |
| F3 | Postgres ↔ GA4 reconciliation query on live data | DB access from this workstation |
| D1 | Consent Mode ad purposes hard-denied | rewritten inside item 11 |
| F4 | GA4 recommended-event alignment (e.g. `share`, `select_content`) — requires reading Google's current recommended-events reference (download first) | external-API law |

Nothing above is delivered. Status of `i10-analytics-audit`: OPEN — read phase complete, fix phase not started.
