# Website API contract audit — 2026-09-12

Scope: API-01, documentation audit only. Read all **16 current top-level Markdown files** in `docs/api` completely: README, 01–14, and 16. Excluded `old_docs` and `_captures`; no credential files, network, production API, or accepted frontend files were read or changed in this delegated lane. The parent owns current live verification. Statements below describe the supplied documents unless explicitly identified as implementation recommendations. A documentation claim of a previous live measurement is **not** a measurement made in this audit.

The current bundle has substantive internal contradictions. Use live capabilities and current runtime envelopes to settle them; do not copy the older examples wholesale. The authoritative generated parameter section is a stronger documentary basis than older hand-written introductions, but it still requires the parent's live reconciliation.

## 1. Immediate integration decisions

1. Keep both `Authorization: Bearer <Google OIDC ID token>` and `x-api-key` strictly on the backend. Audience = the exact configured base URL. Health needs only the ID token. No API credentials in served files, browser storage, telemetry or browser error bodies. Sources: `02-authentication.md:9-26,65-81,239-244`; `10-integrations-web-mobile.md:8-20`.
2. Fetch and cache the actual capabilities. **103 is the total specification count: 100 request fields + 3 output-only fields**, not 103 user inputs or 103 independent generation controls. Exclude `rights`, `compliance`, `analysis_outputs` from requests. Sources: `04-request-body-full.md:27-35,93-100`; `06-response-envelope.md:474-489`.
3. Use native asynchronous admission, persist the local logical request before the first upstream POST, then persist upstream `job_id` immediately. Never replay an uncertain generation POST. Upstream has **no idempotency key**, even for identical seed/body; a local idempotency key prevents local duplicates but cannot make another upstream POST safe. Sources: `11-webhook-async.md:136-148,188-232`.
4. Treat admission, job status, delivery, measurements and partial-delivery notices as separate states. `202 success:true` is accepted work, not playable music. `dry_run:true success:true` is a plan, not music. There is no stage/progress percentage feed. Sources: `03-endpoints-reference.md:34-39,211-218`; `11-webhook-async.md:196-227`; `06-response-envelope.md:718-754`.
5. Store stable mastered **GCS identifiers**, associated take number, delivery metadata and full result. Signed HTTPS URLs are renewable leases. Current `tracks[]` contains rendered masters, while `source_take[]` contains raw generation. Keep take 1's `render_plan.processed_*` metadata as the canonical first-master fallback for older envelopes. Never promote a labelled raw fallback to a mastered delivery. Sources: `06-response-envelope.md:174-246,307-373,790-795,853-867`.
6. Support the current accepted language universe from capability fields and display the measured verification state. Default language policy is `measure`, not English-only or strict. Sung smoke test in English avoids changing verification coverage; this does not justify limiting the product to English lyrics. Sources: `04-request-body-full.md:287-319,382`; `14-language-support.md:13-45,80-94`.
7. Read quota from real responses; this website key's user-supplied ceiling is 100/day. The corrected auth document agrees with 60/min default and 100/day maximum. Never import 1000/10000 examples as defaults. Dry runs and content refusals consume request quota despite no music-generation charge. Sources: `02-authentication.md:84-104`; `03-endpoints-reference.md:211-218,275-278`; `16-content-policy.md:240-251`.

## 2. Endpoints and exact wire contracts

Configured base: `https://music-api-636636169989.us-central1.run.app` (`03-endpoints-reference.md:11-20`). Its live reachability and the owner's reported revision are parent verification items.

| Endpoint | Body / success response | Errors and constraints | Sources |
|---|---|---|---|
| `GET /health` | No body; expected `ok:boolean`, `params:number`, `ffmpeg:boolean`, `version:string`; newer envelopes also document `service` | OIDC only. Never `/healthz`. Do not require the old literal version `2.0-cloudrun` | `03:44-78`; `06:654-672` |
| `GET /v1/music/capabilities` | `success`, `request_id`, `parameters[]`, documented `engines`, `vocabularies`, `languages`, newer `service` | Dual auth. Exact shape must be read live; the abridged example omits most nested fields | `03:84-163` |
| `POST /v1/music` | JSON object; only `prompt` required. Normal success 200 finished envelope. `async:true` returns 202 admission. `dry_run:true` returns 200 plan even with `async:true` | Unknown top-level/nested fields refused. Explicit caller choice for any new billable attempt | `03:165-224`; `04:373-393`; `11:188-232` |
| `GET /v1/music/jobs/{job_id}` | `status` = `queued`, `processing`, `complete`, `failed`; complete has `response`; failed has `error` plus `http_status` | Same account only; other account or unknown job = 404. Polls explicitly exempt from daily quota | `03:31`; `11:215-227` |
| `POST /v1/music/delivery-url` | Request `{"gcs_uri":"gs://..."}`. Response `success`, `request_id`, `url`, `url_kind`, `url_expires_at`, `url_signer`, `gcs_uri` | No generation. 400 malformed/unaccepted bucket, 404 absent delivered object, 502 signing failure. Backend should only renew objects in its own persisted delivery records | `06:212-246` |
| `GET /v1/music/originality/{request_id}` | Pending/complete/failed; complete has `verdict`; failed can still have `success:true` | Optional post-delivery analysis, independent of generation job. 404 no record; 502 store IO. Only poll when requested/pending | `03:348-445`; `12:66-179` |
| `POST /v1/music/jobs/{job_id}/run` | Internal worker only | Never expose or invoke from the website | `03:32`; `11:229-232` |

In this table and the rest of the audit, `03:...` abbreviates `docs/api/03-endpoints-reference.md`, and similarly for numbered filenames.

### Native async admission

Documented 202 shape (`11:199-213`):

```json
{
  "success": true,
  "async": true,
  "job_id": "job-<uuid>",
  "request_id": "<uuid>",
  "status": "queued",
  "poll": {"method": "GET", "path": "/v1/music/jobs/job-<uuid>", "auth": "x-api-key of the creating account"},
  "webhook": null,
  "task": {"name": "projects/.../tasks/job-<uuid>", "dispatch_deadline": "1800s"},
  "auth": {"account_id": "...", "key_id": "...", "limit": {}},
  "service": {}
}
```

The exact full GET job record is **not** shown in the bundle. Only status and complete/failed payload fields are promised. Do not invent progress, timestamps, retention duration, a list-jobs route, a cancellation route, or a recover-by-client-id endpoint. The worker claims only `queued` and acknowledges subsequent dispatches without another generation; this protects worker redelivery, not duplicate external admissions (`11:229-232`).

Recommended local states: ready → submitting → queued/processing → complete/failed; network interruption before a job ID is saved → **submission outcome unknown**. After restart, known IDs resume by GET polling. Unknown submissions remain visible without automatic replay. Persist full local request/idempotency fingerprint and responses atomically; same token plus different payload must conflict locally. These are integration recommendations derived from the absence of upstream idempotency, not promised upstream states.

No streaming, WebSocket, batch, cancel or partial stage updates (`11:176-184`). A browser abort means stopped waiting, not cancelled upstream music. Polling intervals around 5–15 seconds are documented; use bounded backoff on transient GET failures (`11:234-244`). No need for a public webhook for this local implementation.

### Optional webhook

`webhook_url` must be HTTPS. A finished response is POSTed once, content type JSON, correlation header `X-PlayMusicPrompts-Request-Id`. OIDC audience is that exact webhook URL and issuer `https://accounts.google.com`; expected email is `music-api-runtime@playmusicprompts.iam.gserviceaccount.com`. Verify signature/expiry/audience/email before accepting. The callback has no retry and a 30-second timeout; immediate response may say `status:"dispatched"` rather than claiming received. Absence of a signature can be reported by the service and must not be accepted as authenticated. Sources `11:23-125`.

## 3. Request field surface and shape safeguards

All 103 names are enumerated in `04:60-164`. The three response-only names are `rights`, `compliance`, `analysis_outputs`; the other 100 are request fields. Request fields also include orchestration (`async`, `dry_run`, `capabilities`, `webhook_url`), metadata (`project`, `labels`, `client_side_echo`), costly output selectors (`output_package`, `variation_count`, `duration.on_miss`) and analysis controls. Do not portray them all as musical knobs. Keep orchestration/credential concerns out of the consumer's creative form while preserving supported request semantics at the backend.

Binding is meaningful: `typed` / `prose` / `compiled` describe vendor intent; `enforced` describes later edits/measurements; `our_stage` describes pipeline controls; `client_side` metadata is not a musical guarantee (`04:13-23`). `seed` remains accepted but current Interactions responses explicitly report `sent_to_model:false`; it cannot reproduce a track (`06:769-788`). `negative_prompt` is prose, despite older typed examples (`04:17,66`).

| Field | Exact documented request shape / safeguards | Source |
|---|---|---|
| `prompt` | Required string, ≤5000 characters; reject blank locally | `04:64,379-380` |
| `duration` | Object: integer `target_seconds` 10–180; numeric `tolerance_seconds` 0–10; `on_miss` accept/regenerate/trim. Defaults 135 / 2 / trim | `04:204-218` |
| `vocal` | Object: mode choir/duet/female/instrumental/male/plan_decides/spoken; language from current capability universe; policy measure/prefer_proven/strict. Defaults instrumental/en/measure | `04:287-301` |
| `lyrics` | Object: mode none/custom/ai_write; text ≤2000 only custom; theme ≤1000 only ai_write; verify boolean default true; language; script auto/latin. Custom requires nonempty text; custom or ai_write plus instrumental is a contradiction | `04:303-319,382` |
| `project` | Object: name ≤120; version_note ≤200. `track_id` is server-assigned and refused if sent | `04:172-176` |
| `prompt_enhance` | Object, not plain toggle: enabled boolean, style cinematic/conservative/descriptive. Default false/conservative | `04:178-190` |
| `prompt_blocks` | Object array: role bass/climax/harmony/hook/outro/percussion/texture/transition; text ≤280; weight 0–1 step .1 | `04:192-202` |
| `structure` | ≤12 items, each requires section and bars. Bars integer 1–64. Section enum at source | `04:220-265` |
| `energy_curve` | Object: preset cinematic/custom/double_peak/flat/front_loaded/linear_rise/valley; points array items require t≥0 and v in [0,1] | `04:267-279` |
| `mood_orbit` | Actual validation shape `{"axes":{"<pole>":0.0}}`, allowed poles aggressive/dark/epic/hopeful/melancholic/uplifting. Do not send axes as an enum string or an array | `04:281-285,387` |
| `references` | ≤3 object items; kind descriptor/midi/user_audio required. descriptor uses text ≤500; user_audio/midi use URI url; nested active-when enforced | `04:321-333,383` |
| `labels` | Direct object of string → string, e.g. `{"campaign":"spring"}`; do not wrap in `shape` | `04:335-338,386`; `06:466-472` |
| `controls` | Object: harmony_complexity/rhythm_density/sonic_polish integer 0–10; defaults 7/6/8 | `04:340-354` |
| `mastering` | Object: target broadcast/cinematic_trailer/game/none/social/streaming; loudness_lufs enum documented as strings "-11"/"-14"/"-16"/"-23"/"-9"; true_peak_db -3..0. Defaults cinematic_trailer/"-9"/-1 | `04:356-370` |
| `output_package` | single_track/variations/stems_bundle. `variation_count` only active with variations, enum 2/3/4; each variation generates separately | `04:84-85,384`; `13:18-29,162-166` |
| `route` | auto/lyria-3-pro-preview/lyria-3-clip-preview/lyria-002. Clip route has 30-second maximum; auto does not choose clip | `04:87`; `08:60-71` |
| `quality` / `export` | quality draft/balanced/ultra. export wav24_48k/wav16_48k/flac_48k/mp3_320/mp3_native | `04:88,91` |
| `normalize_output` / fades / channels | boolean; fade_in_seconds/fade_out_seconds integer 0–15; channel_layout stereo/mono | `04:148-152` |

Do not use only a top-level type map. Validate nested unknown keys, required per-item keys, bounds, whole-number steps, text lengths, active-when, and server-assigned refusal. Refuse all invalid paths together rather than silently deleting them (`04:169-170,375-393`). The capabilities' actual `fields`/`constraints`/`values` shapes must drive field extraction. The abridged `03` schema cannot establish their exact runtime serialization.

Additional undocumented integration boundaries: no reference-upload endpoint is listed; a `references[].url` schema does not itself establish file-upload storage, user rights, server download behavior or media influence. Do not promise audio/MIDI upload matching before verifying its compiled trace/actual delivery. The exact live key/mood/genus vocabularies and slider numeric-vs-enum behavior should be reconciled against capabilities, not inferred from the control label.

## 4. Minimal bounded validation payloads

These are candidate one-take bodies for the parent's two authorized intentional smoke submissions. They have not been sent by this audit. They avoid variations, stems, originality analysis and automatic duration regeneration. No deliberate artist names or policy-risk content. Native async is an integration choice justified by `11:188-232`.

Instrumental, 15-second target (shape sources `01:64-75`; `04:204-218`):

```json
{
  "prompt": "Warm cinematic piano and cello, a gentle slow rise, no vocals.",
  "duration": {"target_seconds": 15, "tolerance_seconds": 2, "on_miss": "trim"},
  "vocal": {"mode": "instrumental"},
  "async": true
}
```

Custom English lyrics, 30-second target (shape sources `01:116-129`; `04:287-319`):

```json
{
  "prompt": "Warm acoustic folk ballad, gentle piano and guitar, intimate and hopeful.",
  "duration": {"target_seconds": 30, "tolerance_seconds": 2, "on_miss": "trim"},
  "vocal": {"mode": "female", "language": "en", "language_policy": "measure"},
  "lyrics": {
    "mode": "custom",
    "text": "We follow the morning light, with open hearts and steady feet. Every road becomes our song, every day a new beginning.",
    "verify": true
  },
  "async": true
}
```

Optional explicit mastering/export is valid if needed for the frontend's actual selected controls, but unnecessary in a minimal smoke. If supplied, use real capability values such as `mastering:{target:"streaming",loudness_lufs:"-14",true_peak_db:-1}` and `export:"wav24_48k"` rather than assuming a -14 LUFS default. Do not count setting `dry_run:true` as either song proof; it creates no audio and consumes daily quota. A 15-second instrumental is too short for some optional originality statistics (`12:146-165`), so omission is deliberate.

## 5. Delivery, library, player and measurements

### Persistence and URL renewal

- Persist `request_id`, `job.job_id` when present, original request, every delivered take, full result, selected mastered GCS URI and URL metadata. Preserve `service.revision` as response provenance. It is not necessary to expose account/key IDs in product copy.
- For take 1, canonical processed tuple is `render_plan.processed_url`, `processed_gcs_uri`, `processed_url_kind`, `processed_url_expires_at`, `processed_probe`; `tracks[0]` is the modern delivered-master record. For variations, preserve each `tracks[i].render_plan`, never apply take 1's metadata to every take (`06:174-210,853-867`).
- Keep `url_kind` and expiry. `v4_signed` has an expiry; `cdn_unsigned` may have null expiry. Renewal returns `url`, not `public_url`. Never regenerate to repair a link (`06:200-246`). If media load fails, refresh only the saved known delivered object, retain playback intent/position, and retry media load in a bounded way; do not convert a missing object/failed signing into a successful track.
- The document does not prove CORS for the deployed delivery bucket. Direct `<audio>` play can succeed while a Three.js/WebAudio analyser connected to a cross-origin media element fails to read audio. Parent must test actual player visual response with returned media; a constrained same-origin media proxy may be required. This is an unresolved integration check, not a measured API defect.
- Current `tracks[].kind` can explicitly say raw take when a variation render failed. Render failures and `generation_shortfall` must be visible and preserved; no silent drop of paid outputs. `takes_requested` vs `takes_delivered` differ for later-take vendor refusal (`06:147-172,208-210`).

### Measurements are not binary product success

Use measured duration/codec/sample rate/channel/size from final `processed_probe`/`measured`/export probe, not the requested value. `analysis_outputs` null is unknown/not-run, never zero (`06:598-643,836-867`). Short underlength audio under trim/accept is not padded; `refuse_pad` reports a miss. `on_miss:regenerate` allows one additional paid attempt (`08:153-168`).

Custom sung delivery can succeed with a failed or unavailable lyric verification. Show actual `verdict`, metric and `measured`/reason, without calling the music generation failed or guaranteeing perfect words. PER can exceed 1 due to insertions; it is not a percentage constrained to 0–100 (`05:259-290`). `lyrics.verify:false` is a typed skipped block; AI-written lyrics are `NOT_APPLICABLE`, not the same null as instrumental (`06:377-384`). Default non-English `measure` can yield `NOT_CALIBRATED` or `GRAPHEME_ONLY`; don't relabel as PASS (`14:13-45,80-110`).

`rights` is a platform assertion and explicitly has `copyright_warranted:false`; no guarantee of exclusivity/copyright clearance (`06:474-489`). `compliance.c2pa.state` and `trust` are different; signed can be valid yet untrusted. Preserve actual watermark/provenance state and do not call vendor-stated SynthID verified (`06:491-595`). No legal or billing conclusion was made by this audit.

### Stems and originality

Requested stem results live at `render_plan.stages.stems.stems.<id>`, not `tracks[]`. `master` is rendered/delivery-grade; vocals/music can be delivered as separate **analysis-grade** files with their own signed URLs. Drums/bass currently report `REFUSED_LICENCE`; fx/ambience `NOT_BUILT`; requests can therefore be partially fulfilled and each state must be named (`13:31-52`; `06:256-261`). Do not reuse internal `lyrics_verification.separator` analysis GCS paths as downloadable product assets absent an explicit delivered stem record.

Originality is optional, starts pending separately, and does not block finished playback. Report per-axis `verdict`, calibration and genre scope; single take lacks between-take similarity. `PASS` in this gate is measured repetition/similarity in a calibrated genre, not global uniqueness or copyright safety. Unknown/unavailable/failed analysis must not be called PASS (`03:406-413`; `12:17-53,128-165,190-209`).

## 6. Error and quota handling

Prefer typed `error_code` plus specific blocks, while tolerating non-JSON edge failures and older smaller envelopes. Do not assume every status includes a request ID or a JSON `error_class`; Google IAM can reply HTML before the app (`02:65-69`; `07:61-75`). A 202 is not an error despite older `07:11` wording.

| Condition | Website behavior | Source |
|---|---|---|
| `INVALID_REQUEST` 400 | Keep user's input, show named invalid fields; no unchanged resend | `07:39,77-185` |
| `LANGUAGE_NOT_PROVEN` 422 or strict-language `INVALID_REQUEST` 400 | Explain selected strict policy; preserve chosen language; no silent English fallback. Code existence/status remains contradictory | `07:40,188-215`; `14:80-94` |
| `CONTENT_REFUSED` 400, instrument_failure=false | Show English category labels from `content_safety.refused_categories`; retain editable form; no hidden resend | `07:217-258`; `16:165-207` |
| `CONTENT_REFUSED`, instrument_failure=true | Temporary service issue, not rejected lyric. Preserve input; bounded retry can be deliberate because no generation was admitted, but it consumes quota | `16:210-251` |
| `VENDOR_CONTENT_BLOCKED` 422 / class vendor_refusal | Show vendor decline; no automatic retry. Newer table permits one deliberate unchanged resubmission, unlike older deterministic-refusal prose; each deliberate attempt must be explicit | `07:43`; `06:147-172` |
| `GENERATION_FAILED` 502 | Preserve request/result ID and report failure. No automatic same-body regeneration | `07:42,260-275` |
| `MEASUREMENT_FAILED` 502 | No verified delivery; keep diagnostic evidence; do not label delivered or assume no upstream spend | `07:44,277-292`; `06:248-254` |
| `RENDER_FAILED` 500 | Paid source may exist. Keep request ID/source reference, report failure; **no automatic POST replay** and no invented free render-retry endpoint | `07:45,294-307`; `11:136-148` |
| `BUDGET_EXHAUSTED` 503 | Preserve budget/stage context. No hidden generation retry; prior stages may differ from refused stage | `07:48,310-328` |
| `INTERNAL_ERROR` / `CONFIG_ERROR` 500 | Report request ID and honest state. A local idempotency row cannot make another generation POST safe | `07:46-47,330-361`; `11:136-148` |
| `UNAUTHENTICATED` 401 / edge auth failure | Backend connectivity configuration state; no credentials or raw token errors exposed | `07:49,61-75` |
| `FORBIDDEN_SCOPE` 403 / store unavailable | Backend permission/service incident. No retries or IAM changes by this website | `07:50,61-75`; `02:151-154` |
| `RATE_LIMITED` 429 | Read `auth.limit` and legacy `limit`; respect reset_seconds or next UTC day. Preserve local pending jobs and continue free job GETs with appropriate backoff | `07:51,74-75`; `11:218-222` |

Generated catalogue currently lists **13 codes** (`07:35-55`). Do not switch on only the seven older examples. Rate/quota state has no documented response headers; read inline bodies (`03:451-455`). Real zero usage/remaining is valid; never use truthiness to decide whether quota exists (`10:359-360` has this sample bug). Missing quota is unknown, not unlimited/zero. Never fabricate per-user credits or account balances from a tenant API-key quota.

Documented request-class timeouts are health 15 seconds, capabilities 30 seconds, synchronous instrumental 180 seconds, custom sung 320 seconds, variations longer (`09:35-63`). They are old recommendations, not a contractual deadline for native jobs. Persist jobs and allow later refresh instead of marking a long-running job definitively failed on a UI timer. The examples using `fetch(...,{timeout:...})` are library/version-specific and not a reliable native-fetch timeout. Async admission includes safety/enhance gates, so it is not guaranteed instant.

## 7. Contradiction register and resolution for implementation

| Topic | Contradiction | Integration resolution / outstanding check |
|---|---|---|
| Bundle freshness | README:5-6,245-246 says all current; README:278 says revision 00025; several sections were updated through September 11 | Preserve evidence dates and check current capabilities/envelopes; no wholesale trust |
| File count | README:252 says 15; list includes 16 current files | All 16 read; no missing 15.md inferred |
| Spec count | README says up to 103 inputs; `04:28` says 100 request + 3 response-only | Use binding classification and actual runtime spec |
| Async | README:149-161 and `11:3-5` imply only synchronous/custom queue; `11:188-232` gives native async | Native async for website; no fake progress |
| Key bucket | `02:76-79,108-109` corrected `playmusicprompts-apikeys`; `02:188-204` still places key records in music-studio with runtime objectAdmin | Parent handles existing key; no storage/IAM implementation copied from stale block |
| Quotas | `09:14` says 1000; many examples show 120/min and 10000/day; `02:92-93` and `07:51` cap 100/day | Live reported limits + owner's 100/day ceiling |
| IAM status | `02:65-69` / `03:19` say anonymous 403; `02:145-147` and `07:68` say 401 | Handle both plus non-JSON; parent negative control determines actual edge response |
| Lyric length | `05:28` says 5000; generated `04:306` says 2000 | Current capabilities, then 2000 as documentary fallback |
| Languages/default policy | README:184-187 and `05:24,63-67` say English-only / 11 languages / strict; `04:290-291,382` + `14:13-26,80-94` say 109 / default measure | Use current nested capability language list and measure; never silent fallback |
| Strict refusal code | `14:92-94` says LANGUAGE_NOT_PROVEN nonexistent; generated `07:40` includes 422 code | Support both typed shapes; current strict dry run can resolve if needed |
| EN PER threshold | `01:160`, `05:57,76` give 0.654862 vs `14:51` gives 0.418776 | Read delivered threshold; never hardcode |
| Tracks/raw | README:136-138 and `03:249-255` show raw tracks; `06:174-210,790-795` shows mastered tracks / raw source_take | Prefer processed first master + modern per-take record; inspect kind |
| Raw variation fallback | `06:208` can label raw variation; `07:294-298` says any requested render failure refuses whole file | Preserve both error and partial-delivery branches; live behavior outstanding; never silently promote a raw take |
| Stems | README:172-175 and old 13 prose says none; `13:36-52` delivers vocals/music but explicitly refuses others | First-class per-stem state/grade; no all-stems claim |
| Master defaults | `08:243` / `13:115-117` say -14 LUFS/native MP3; generated `04:356-370` defaults cinematic -9; `06:739` shows wav24 | Actual capabilities/settings; explicit UI choices; measured files |
| Duration accept | Name can imply no edit; `08:165-168` says long takes still trim | Explain actual documented semantics; keep trim smoke tests |
| Vendor refusal | README:198-200 / `07:365-368` say deterministic; new `07:43` measured per-call VENDOR_CONTENT_BLOCKED | No blind retry; explicit new caller decision only |
| Render retry | `07:306` claims retry render does not rebill; documented endpoint list contains no free render retry | Do not resubmit generation as render repair |
| Originality | `08:338-339` says all NOT_CALIBRATED; `12:196-206` and `03:406-413` say calibrated per-axis/genre | Read actual per-axis fields and unknown state |
| Provenance | `06:892-896` old c2pa_note says not embedded; `06:537-595` new stage embeds/validates C2PA and AudioSeal | Display current typed state/trust; retained historical notes are not unconditional truth |
| Safety categories | `04:37-38`, `07:41` say seven; `16:14-27` gives eight | Use actual refused_categories; local static copy has eight if needed |
| Language fallback shape | `06:263-266` string/null; `14:143` object | Preserve and normalize both; don't assume string |
| Example proxy correctness | `10:48-65` blindly forwards body/raw errors; Python 135-136 does not preserve upstream status and returns HTTPException object; 350 raw fallback; 359 truthiness quota | Implement real boundary, persistence, sanitization and typed state; examples are not finished production code |

## 8. Parent's remaining live acceptance evidence

1. Current authenticated health, capabilities, revision and safe negative auth control; confirm 100 request / 3 response-only fields and nested serialization with credential-free captures.
2. Current auth/quota semantics of free endpoints; exact accepted job response and complete/failed envelope. Confirm unknown-job 404 without probing other accounts' known objects.
3. Instrumental 15 seconds and sung 30 seconds, sequential intentional generations through the actual website; save admission and finished request IDs, measured metadata, and actual downloaded/playable master.
4. Direct media/WebAudio CORS or guarded local media proxy, seek/range/renewal behavior, navigation/restart job resumption and stable library IDs. Signed URL refresh must not trigger generation.
5. Field validation, response-only refusal, inactive fields, bad JSON/non-JSON upstream errors, expired credentials, limits and ambiguous admission failure states via meaningful local tests; no billable probe loops.
6. Surface paid partial outputs, stem states, lyric verification absence/failure, provenance/calibration and quota unknowns without fake success.

## 9. Current capability snapshot reconciliation

After the initial documentation audit, the parent supplied its freshly retrieved `live-capabilities.json` in this directory. This delegate parsed that saved response, not credentials or a network request. Snapshot SHA-256: `37b4966fc22c271341beed29b52ffb8f19273e14856d1462858201aa068a5319`. The JSON is one line; locators below use field paths and parameter names instead of an unhelpful line number. Service revision is `music-api-00105-2qz`, API version `2.1-cloudrun`.

- The 103 parameter names match the generated documentation table exactly: no missing or extra names; response-only remains exactly rights, compliance, analysis_outputs.
- Top-level keys are service, success, request_id, endpoint, schema_id, bindings_legend, parameters, languages, routes, honesty, auth. `endpoint` is `generate-music-hybrid-model`, not the documentary constant; schema_id is `berk.music-studio-param-spec/v1`. Do not enforce the older endpoint label in capabilities parsing.
- `routes` is an array of `{id,label}` records. The response does not carry the older `engines.route_options` or top-level `vocabularies`. Actual parameter `values` supplies genres (2196), moods (114), instruments (1057), eras (14). Respect their max_selected limits: 6, 6, 12, 2 respectively.
- `languages.entries` has 11 registry records. The form's accepted universe is **109** values in each of `parameters[name=vocal].fields.language.values` and `parameters[name=lyrics].fields.language.values`. Do not accidentally restrict selection to the 11 registry records.
- `default` is an object `{value,evidence}`. Extract `.value` without copying documentary evidence into the request. Null default means omit, not JSON null. UI defaults include cinematic genres, orchestral instruments, default structure and arrangement choices; do not silently inject every spec default into a minimal user request.
- `key` has `values_generated:{roots:[12],modes:[9]}` and no values array. Expand the 108 exact `root|mode` wire IDs. Its default is `C|minor`.
- `tempo_bpm` is numeric 40–220, step 1. Its eight values are labelled presets, not the only accepted BPM values. `controls` subfields are numeric 0–10 step 1 despite a values array of five graded string presets; serialize numbers, not `high` or `very_low`.
- `arrangement_ai` has on/off values with a boolean true default; async, dry_run, normalize_output and run_originality_gate have string true/false IDs but boolean defaults. Avoid one generic string serializer for all toggles. `loop_ready` only documents true; false/unset should be omitted unless separately verified.
- Structured arrays (`prompt_blocks`, `structure`, `references`) and objects (`duration`, `lyrics`, `vocal`, `controls`, `mastering`, `prompt_enhance`, `project`) require the documented shape projection. `labels.fields.shape` describes a string map; it is not a request wrapper. `mood_orbit.fields.axes` describes allowed axis names, not a direct enum-valued field.
- Some indispensable validation rules are documented but not serialized as machine-readable constraints in this snapshot: `variation_count` has no `active_when`; energy points have only a string shape; per-item required keys are not encoded. Retain explicit documented refinements alongside a generic projection.
- Confirmed current max lyric text 2000; duration 10–180, target step 1; default policy measure; default mastering cinematic_trailer / string "-9" / -1; export wav24_48k. These settle corresponding older-document contradictions.
- **Unresolved measurement-domain drift:** `lyrics_measurement_domain.default.value` is `mix` and its evidence says the GPU path is needed, while the documents describe separated stem by default. Set `lyrics_measurement_domain:"stem"` explicitly when the intended test/product choice is calibrated stem comparison, then read the actual response measurement_domain. Do not infer current render behavior from stale default prose alone.
- The snapshot's `honesty.note` explicitly states that binding is a contract statement, not capability proof, and notes `lyria_launch_probe_pending` values. This contradicts the blanket documentary statement that every enum is generation-proven. Display input intent separately from measured output; do not claim all 100 request fields have been proved by the website's two smoke tests.

## 10. Later owner correction — permanent own-server music service

The parent relayed the owner's next explicit requirements: ingest generated music onto the owner's server, then serve a radio/streaming product; Google audio ads between tracks and unobtrusive web banners; login plus rewarded ad for downloads, login for playlists, guests may listen/generate; web first with future phones/tablets and Samsung/LG TV. This supersedes direct-upstream playback as the intended final architecture. Section 5's signed URLs now describe **ingestion sources**, not the listener delivery mechanism. Ingest every mastered take once, verify the received bytes/metadata, persist owner-side identifiers and serve the owner's media assets. Keep renewal for interrupted or delayed ingestion; never regenerate to recover an ingest URL. No direct-delivery proxy or implementation was created by this delegate.

The API has no documented user accounts, login, playlists, ad entitlements, rewarded-download authorization, radio scheduler, own-storage ingestion or end-user playback-token service. These are distinct website/service requirements, not capabilities to infer from `project`, `labels`, API-key account, `client_side_echo`, or `stems`. Keep API account IDs separate from end-user IDs. Existing accepted browser-storage namespaces must remain isolated in the new website. The research/cloud recommendation and complete application implementation remain parent-owned work.

This audit is complete for its bounded documentation and saved-capability comparison scope. It does **not** certify the live website or close the expanded implementation. No API calls, music generations or credential operations were performed by this delegate.
