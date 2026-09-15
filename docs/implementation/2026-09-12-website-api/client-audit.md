# Frontend integration audit — API-01

Date: 2026-09-12. Owner: `/root/website_client_audit`. Scope: read-only inspection of the accepted `website_html_templates_beyond/` source and its adapter/storage interfaces. No accepted-tree edits, credentials, network requests, generation, or browser interactions were made in this lane. Recommendations below are implementation requirements, not completed integration claims. Parent owns integration and actual browser/audio verification.

## Verified current architecture

Project root is `C:/Berk/PlayMusicPrompts/`. Unprefixed frontend filenames below (for example `app.js`, `scripts/build.mjs`) resolve under `C:/Berk/PlayMusicPrompts/website_html_templates_beyond/`. Explicit `docs/api/...` references resolve under the project root.

| Surface | Verified source | Consequence |
|---|---|---|
| Public configuration | `website_html_templates_beyond/config.js:1–7` | Empty catalog; all service and account adapters null. No API client exists here yet. Keep credentials off this surface. |
| Shared main-page runtime | `app.js:6–8,21–24` | `window.PMP` owns songs, saved IDs, playlists, draft, main audio current/queue/history, generation booleans. Create/Explore/Radio/Library/Login use a fetched-HTML navigation shell that swaps only `#main`; it preserves runtime/audio during those transitions. |
| Page builder/load order | `scripts/build.mjs:17` | Deferred scripts load config → data → schema → app → player → collections → controls → experience. Add a shared service/store client before its consumers; update builder as well as generated HTML, otherwise a rebuild drops integration. |
| Page navigation | `scripts/build.mjs:9–12`; `app.js:21,26` | Main navigation only covers Create/Explore/Radio/Library. No route to the advanced player is present. The generic `data-route` handler requires fetched content containing `#main`; the standalone Three.js page does not, so its link must use full navigation or an explicit dedicated handoff. |
| Three.js app | `player-three.html:12,20,73`; `player-three.js:1–27` | Independently booted app; only config is shared as code. Own audio element, engine, queue, session, preferences and sound/scene tools. Header currently opens previous edition, not Create. Its audio uses `crossorigin="anonymous"`. |
| Main persistence | `app.js:6,17–20`; `player.js:21,25–28` | Browser localStorage prefix `pmp.beyond.`; creations stored as full nonlocal created track objects. Imported files use IndexedDB `pmp-beyond-local-audio`, store `tracks`, keyed by `id`; blobs are durable and object URLs are rebuilt. Saved and playlists are references to song IDs. |
| Advanced-player persistence | `player-three.js:17–19,30–40,44,54–57`; `player-three-store.js:1–4,20–25,68–89` | Same imported-audio DB, saved-ID key, and creations key as main pages. Own queue/current/time session with explicit tab ownership protects against stale tab writes. Preferences are separated from session. Preserve this behavior. |
| Shared generated library timing | `player.js:27`; `player-three.js:54–55,94` | Both read creations at startup. Advanced player merges existing config catalog and creations, but has no listener for new creations; current storage listener only handles saved and room preferences. Already-open tabs do not learn newly generated tracks. A saved session order excludes new creations from queue even after reload; they remain in `available` and require Restore library. |
| Main library and discovery | `collections.js:9,11,16,19`; `app.js:7–8` | Creation tab queries `state.songs.filter(created)`; saved IDs resolve through songs. Search uses requested genre/mood/era labels. Illustrative sample titles remain in main state and discovery; missing audio opens an honest unavailable dialog (`player.js:8`). These are not an actual service music catalog. |

## Actual request and callback contract

`experience.js:11` calls `PMPControls.payload(state.draft)`, then awaits:

```js
PMP_CONFIG.adapters.generate(payload, {signal: AbortSignal})
// currently must resolve ONE record: {id?, title, url, ...additionalMetadata}
```

`controls.js:34` whitelists schema parameter keys, clones typed values, requires a nonblank prompt, drops inactive fields, validates defined constraints, and rejects instrumental/custom-or-AI-lyrics conflict. Private UI fields `_scene`/`_quickLines` are therefore not submitted. `controls.js:33` validates object children, typed enums, numeric bounds/step and custom-lyrics required text. Native control rendering preserves enum wire IDs/types (`controls.js:16–18,23–26`). The payload should remain a typed prompt-and-parameters object, not an assembled prose substitute.

`player.js:19` invokes the distinct optional continuation callback:

```js
PMP_CONFIG.adapters.continue({
  current: publicTrack(state.current), // only blob is removed; URL and metadata remain
  history: state.history.slice(0, 20), // array of song IDs, not full historical tracks
  preferences: state.draft
}) // currently resolves one playable track
```

Continuation activates only after an explicit Keep it going toggle (`player.js:18`). It submits whenever enabled with a current song and an empty queue; this may be immediately after the song starts, not only at its end. Concurrent auto-fills are blocked by `autofilling`. Turning it off does not cancel a pending request; the returned result is currently discarded if disabled before resolution (`player.js:19`). This must be changed to persist every delivered billable result regardless of whether it is still wanted in the playback queue. Do not send the whole `current` object upstream as a music request. Use the validated preferences plus an explicit local context representation; no API field named `history` or `current` is established by this callback.

The existing Enhance callback is optional `(originalPrompt, draft) => string` (`experience.js:12`); its fallback only appends a controls-derived description. The backend generation capability `prompt_enhance` is not evidence of a separate public Enhance endpoint. Account adapters likewise remain a separate dependency (`experience.js:13–16`, README:80); no account/login success should be manufactured from music API access.

## 103 capabilities versus 100 controls

This is an intentional classification, not evidence of three missing request controls. `schema.js:1–11` declares 100 request parameters and excludes `rights`, `compliance`, `analysis_outputs`. `docs/api/04-request-body-full.md:22,93–100` identifies those three as response-only. Do not add them to a generation request.

The schema is a checked-in human-controls snapshot, not a live capabilities response. `schema.js:18068–18108` records unresolved current tempo bounds, the complete 109-language universe, exact live key IDs, and unstated limits/defaults. Existing language inputs permit explicit codes with eleven suggestions rather than claiming an exhaustive set (`controls.js:15`; schema language metadata at 15275–15279 and 15464–15468). Runtime capability reconciliation must preserve typed IDs, fill verified live limits/options, and report incompatible drift rather than silently submit stale constraints. Compare request/response classification and nested fields, not only counts.

`controls.js:32` initially prints a hardcoded “100 controls” before filtering. Replace with actual current supported user-editable count if runtime reconciliation changes the visible set.

Operation switches currently appear in All controls: `webhook_url`, `async`, `dry_run`, `capabilities` (`schema.js:16015–16107`). They cannot be treated as ordinary sound settings in the live Create action. `capabilities:true` returns metadata, and `dry_run:true` wins over async rather than generating a song (`docs/api/03-endpoints-reference.md:98,211–218`; `11-webhook-async.md:192–194`). Separate Preview/Validate from Create. The local backend owns async orchestration and webhook policy; make system-managed values visible as such or keep them outside editable musical controls without pretending the underlying parameter ceased to exist.

## Completion, persistence, and audio mapping gaps

| Gap | Current evidence | Required integration behavior |
|---|---|---|
| One take only | `experience.js:11`; `player.js:21` | Adapter/register contract must accept and persist **all** returned takes; do not drop additional variations. Use deterministic IDs from server job/request and take, avoiding duplicate creation entries after poll/reload. |
| Raw upstream envelope is not a track | `player.js:21` requires `r.url` and `r.title`; API `06-response-envelope.md:174–210` supplies `tracks[].public_url`, `gcs_uri`, take/kind/expiry | Explicitly map delivered media. Title should use user's project/name if available, otherwise a clearly local title, never claim an upstream-generated title that was not returned. Track genre/mood/era reflect requested labels, not measured compliance. |
| Durable signed-link renewal absent | Both `player.js:9` and `player-three.js:48–49` set `audio.src` directly; error paths at player:33 and Three.js:93 only report failure | Store stable `gcs_uri`, `url_kind`, `url_expires_at` and use a shared resolver/server media endpoint before selection and on a bounded stale-link failure. Renew existing delivery, never regenerate. Free renewal response uses `url`, not `public_url` (`06-response-envelope.md:218–246`). |
| Missing all-take metadata | API `06-response-envelope.md:187–210,257–261` | Preserve take-specific kind and render_plan, request-level render_plan for take1, measured data, rights/compliance, analysis state, language/lyrics verification and originality status. Do not promote a raw variation to mastered if `kind` identifies render failure. Stems are separate assets under `render_plan.stages.stems.stems`, not substitute master tracks; preserve grade/provenance and label accordingly. |
| Partial success can be hidden | API `06-response-envelope.md:147–172` | Register every delivered take even when `generation_shortfall` is non-null. Display requested versus delivered count and refusal reason; no automatic paid retry. A partial result is not a complete requested variation set. |
| Storage writes may fail silently | `player.js:21` ignores creations storage boolean; `player.js:27` restores only entries with a URL | Server-side job/library journal is durable truth. Browser metadata cache is best effort and must report failures. Avoid copying giant raw envelopes blindly into localStorage; store response audit details server-side and expose an intentional public metadata record. The upstream `auth` block is service administration, not customer track metadata. |
| Mid-generation reload loses state | `app.js:7`; `experience.js:3,9–11` | Only booleans, AbortController and last message exist in memory. Create local operation ID before POST, persist submission state, then bind to upstream job. Reload/navigation resumes the same operation. An uncertain submission must remain pending/unknown until reconciled, not become a fresh paid submit on retry. |
| “Cancel creation” is inaccurate for background API jobs | `experience.js:10–11,19` | Stopping the browser wait cannot assert upstream cancellation. Use “Keep creating in the background”/“Stop watching” or equivalent truthful text. Persist/collect final result regardless of watcher state. No cancellation endpoint was established by this frontend contract. |
| User edits can detach completion from its original prompt | Request captures `payload` in `experience.js:11`, but generic state/draft remains mutable | Persist immutable original request with operation. Register metadata from that snapshot; never relabel the completed music using the user's now-edited draft. |
| Generic error destroys actionable detail | `experience.js:11` catch always says “We couldn’t create your song. Try again.” | Map validated field paths, policy refusal, quota/rate/Retry-After, authentication unavailable, polling transient failure and uncertain submission to distinct honest UI. Preserve support request ID without tokens. A POST error is not generic permission to retry. |
| Queue/cross-page handoff missing | `scripts/build.mjs:10–12`; `player-three.js:54–55,94` | Add visible “Listen in 3D” for a real selected/generated track, full same-origin navigation with stable track ID/time handoff, and “Back to Create”. Merge newly completed library records on storage/event/focus or server refresh without clobbering a manually edited queue. Selected requested track must enter queue even if old saved order omits it. |
| Remote 3D waveform absent | `player-three.js:47` decodes only `track.blob`; main `player.js:6` fetches URL | Generated remote music can still animate through Web Audio, but 3D waveform currently remains flat. Fetch bounded same-origin delivered media or expose a verified waveform; use cancellation tokens already present so old decode results cannot overwrite a newer track. No invented waveform bars. |

## Bounded integration architecture recommendation

Keep the accepted layout and its native controls. Implement within the new `website/` copy:

1. One same-origin service client and public track store consumed by both classic and Three.js players. The browser never calls the protected upstream directly. The server supplies capability readiness, job state, library records and renewable delivery through a local protected boundary.
2. Immutable local operation records, idempotent submit handoff, server polling/resume, and a persistent generated library. UI may detach while work continues. Completion imports every take exactly once and updates both player surfaces.
3. A request-aware generation controller with stage text based only on actual upstream/local states. Keep `role=status` (existing builder:16), use `aria-busy` while waiting and `role=alert` for actionable errors, retain prompt focus/field association on validation, and expose a resumable job list in Library. No invented percentages, completion ETA, or upstream cancel outcome.
4. A shared delivery resolver using stable object identity. Handle pre-expiry renewal and a bounded retry for an expired signed URL; a generation call is never part of playback repair. Keep seeking/range support and actual CORS/Web Audio behavior in browser verification.
5. New main ↔ room navigation links with selected-track handoff; retain the existing room tab-ownership store, motion preferences, local imported files, Studio, Director, touch and all seven scenes. No engine rewrite is needed for API wiring.
6. Song details expose what the service actually returned: delivery type, requested versus measured duration, take/variation, available stems, lyric/originality statuses and partial-delivery notes. Do not market a requested genre/key/quality setting as measured achievement.
7. Existing illustrative discovery can stay visually recognizable, but its sample cards cannot become a pretend live catalog. Fill discovery with actual created/local/catalog records when available and keep unavailable content clearly identified. Account/cloud library synchronization is an independent dependency, not supplied by the music-generation key.

## Acceptance checks parent should execute

- Compare live capability request keys and nested constraints against the stored schema; confirm exactly the response-only fields remain excluded and current language/tempo/key behavior is grounded in live data.
- Validate instrumental and custom-lyrics requests with actual typed payloads, including inactive-field omission, no server-assigned track ID, dry-run separation and field-specific errors before any paid work.
- Submit once, navigate away, reload/restart local backend, resume original job, receive all takes once; detach watcher and still retain completion; no silent second billable request on transient error.
- Persist generated records plus stable delivery identity and retrieve after browser reload. Force an expired URL case through resolver and prove renewal without any generation invocation. Verify range/seeking and real decoded playback in both players.
- Open the generated track via Listen in 3D despite an old saved room queue order; inspect title, duration, progressing currentTime, audible/Web Audio signal, animation, controls and return navigation. Refresh while another tab has queue ownership and ensure preferences/session integrity remain intact.
- Preserve partial delivery/raw variation/stem-grade distinctions. Present real policy/quota/network/auth states and support IDs with no key or token in browser, metadata, log or evidence files.
- Recheck generated HTML after builder execution, mobile/keyboard/live-region behavior, screenshot layout and unchanged hashes of all accepted trees.

## Evidence limitations

This audit establishes current code and checked-in documentation only. It does not establish current API liveness, live capability contents, signing/CORS behavior, idempotency guarantees, job persistence, successful audio generation, browser playback or rendered UI quality. Those remain API-01 parent/contract-lane measurement and subsequent API-03–05 implementation/verification work.
