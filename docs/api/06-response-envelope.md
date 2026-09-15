# 06 · Response Envelope — Every Field

Every field of the 200 response, its type, its meaning, and when it may be `null` or absent. All
examples below are captured from the live production service in the current session
(an internal evidence artefact).

## Top-level shape

```json
{
    "success": true,
    "request_id": "7decbad8-2918-4c80-b658-248d6e7ac14e",
    "endpoint": "playmusicprompts-music-api",
    "route": { "...": "which generation model + why it was chosen" },
    "prompt_sent": "The full English prose sent to Lyria",
    "bindings": { "...": "per-parameter binding report" },
    "measured": { "...": "ffprobe measurements on the delivered file" },
    "takes_delivered": 1,
    "tracks": [ { "public_url": "...", "gcs_uri": "...", "take": 1 } ],
    "language_fallback": null,
    "mix_plan": { "...": "A7 two-path mix plan with lawful layers + refusals" },
    "render_plan": { "...": "conform + master stages with measured verification" },
    "lyrics_verification": { "...": "PER gate output for a sung take; null for instrumental" },
    "originality_gate": { "...": "a recorded platform decision verdict OR poll pointer OR opt-in note" },
    "spend_note": "1 generation call(s), one per take, no retry (Clause 22)",
    "auth": { "account_id": "...", "key_id": "...", "limit": { "..." : "..." } }
}
```

## Field-by-field

### `success` (bool)

`true` iff the request produced at least one delivered take AND every measurement in the response
was actually taken (not fabricated). `false` responses always carry the error envelope described in
`07-error-catalogue.md` instead of the fields below.

### `request_id` (string, UUIDv4)

Unique per request. Use it as the correlation ID in logs, in support tickets, and in the
`GET /v1/music/originality/{request_id}` poll path.

### `endpoint` (string, constant)

Always `"playmusicprompts-music-api"`. Distinguishes this endpoint from historical variants (the
legacy AWS Lambda conductor was `content-asset-creator/music`).

### `route` (object)

Which generation model was chosen and why.

```json
{
    "model": "lyria-3-pro-preview",
    "why": "vocals/lyrics requested: lyria-3-pro is the only surface measured to sing dictated words (findings 2026-08-13)",
    "delegate_reported": {
        "surface": "interactions",
        "model": "lyria-3-pro-preview"
    }
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `model` | string | The exact Vertex Lyria model id used (`lyria-3-pro-preview`, `lyria-3-clip-preview`, `lyria-002`) |
| `why` | string | The rule that picked this route (sung → `lyria-3-pro-preview`; instrumental → `lyria-002`; explicit `route:` overrides both) |
| `delegate_reported.surface` | string | Which Vertex surface responded (`interactions` today; a future prediction-endpoint route would say `prediction`) |
| `delegate_reported.model` | string | The model id echoed back by Vertex (control: must equal `route.model`) |

### `prompt_sent` (string)

The full English prose the compiler built and sent to Lyria. This is the ONLY prompt Lyria saw —
nothing above the API surface can prepend or intercept it. Read it to understand exactly what your
parameter body was translated into.

### `bindings` (object)

One entry per set parameter, showing how it reached generation. Each entry carries a `binding`
class (one of the seven from `04-request-body-full.md`) and, when a prose clause was compiled, the
exact `sent` text.

```json
"bindings": {
    "duration": {
        "binding": "prose_hint_plus_enforced",
        "sent": "The piece is approximately 30 seconds long, continuous from beginning to end.",
        "note": "prose length request (no vendor duration field exists — measured); the conform stage enforces target±tolerance on the delivered file per duration.on_miss when it runs (render_plan.conform)"
    },
    "prompt": {"binding": "typed"},
    "vocal": {"binding": "prose", "sent": "Vocal style: a male voice, singing in en."},
    "lyrics": {
        "binding": "typed",
        "convention": "Lyrics-in-quotes (measured)",
        "orthography_route": "R0 (default per a recorded platform decision)",
        "note": "R1 phoneme-informed respelling is available for Turkish via the lyrics_orthography_route=R1 parameter; R0 sends the raw orthography unchanged"
    },
    "phoneme_timeline": {
        "status": "NOT_AVAILABLE",
        "reason": "A3 PLANNED phoneme timeline needs a sourced syllabifier. Language 'fr' has none, so a timeline is not built rather than invented. Served today: en \u2192 the service's internal syllabification_en.py (S-BKC09, NAACL-HLT 2009 SONORITY, 95.00 % on CELEX); tr \u2192 the service's internal syllabification.py (S15, The Phonology of Turkish).", so a timeline is not built rather than invented.",
        "research_item": "A3"
    }
}
```

**`bindings.phoneme_timeline.duration_basis` and `bindings.structure.time_basis` (added 2026-09-07, status items
A7/A8).** For a sung Turkish request the PLANNED timeline artefact now carries `duration_basis` — `{"source":
"duration.target_seconds"}` when you sent a target, or `{"source": "structure × bar", "bars_total": N, "bar_window":
{...}}` when the total was derived from `structure`. `bar_window` is the same provenance record the originality gate
reports (`tempo_bpm`, `tempo_source`, `beats_per_bar`, `meter_source`, `provisional`): the bar length comes from YOUR
`tempo_bpm` and your `time_signature` (or the spec's documented default meter, then `provisional: true`); when you sent
`structure` without a tempo and without a duration target the timeline is `NOT_AVAILABLE` with a reason that names
the missing step — the service never invents a tempo. `bindings.structure.time_basis` says which clock the
`[mm:ss]` section timestamps were placed on: `"bars × bar length"`, `"sections placed proportionally to their bar
counts across duration.target_seconds (no tempo requested, so no bar clock)"`, or `"none: …"` — in the last case the
section ORDER is still sent to the model (`"Song structure, in order: verse; chorus."`) but without timestamps.
Before this date a Turkish sung request whose syllable count did not divide the duration exactly received
`phoneme_timeline.status: "REFUSED"` with a "syllables overlap" reason caused by a one-ULP floating-point mismatch in
the span grid (measured on the paid take T04 of 2026-09-07); the grid is now built from shared boundaries and that
refusal no longer occurs.

### `measured` (object)

`ffprobe` measurements on the delivered file. Every value here was read from the actual file bytes,
never labelled.

```json
{
    "duration_seconds": 143.752,
    "duration_measured": true,
    "codec": "mp3",
    "sample_rate": "44100",
    "channels": 2
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `duration_seconds` | float | Real duration from ffprobe `format=duration` |
| `duration_measured` | bool | Always `true` on success; a `false` here is an infrastructure fault |
| `codec` | string | Container codec (`mp3`, `wav`, `flac` per `export`) |
| `sample_rate` | string | Hz (Lyria emits 44100; export can rewrap to 48000) |
| `channels` | integer | Channel count |
| `tempo` | object | Tempo measured back on the file you receive: `state` (`MEASURED` / `NOT_MEASURABLE`), `tempo_bpm_estimated`, `tempo_bpm_requested`, `agreement {acc1_within_4pct, acc2_octave_tolerant, octave_error_oe1}` (Schreiber, Urbano & Müller, TISMIR 2020), `measured_on` |
| `key_estimated` | object | **Since 2026-09-08; learned estimator since 2026-09-09.** Global key measured back on the file you receive. `key_estimated` (`root\|major` / `root\|minor`), `key_requested`, `agreement {mirex_weighted_score, relation}` using the MIREX Audio Key Detection weights (same 1.0 · fifth 0.5 · relative 0.3 · parallel 0.2 · other 0.0), `state`, `method`. The estimator is S-KEY (Deezer's self-supervised 24-key model, ICASSP 2025, MIT), run on GPU; the block carries `analysis.distribution` (all 24 keys, sums to 1), `kappa` (top-1 minus top-2 probability), `engine {checkpoint_sha256, pinned_commit, device, inference_s}` and `bar {status, theta, target_risk, held_out, …}`. `state` is `MEASURED` when `kappa >= theta` — the threshold of a guaranteed-risk (selective) calibration on 494 labelled excerpts (target risk 0.25; held-out coverage 0.73, held-out risk 0.12; the estimator is exactly right on 76 % of that corpus) — and `NOT_MEASURABLE` when the model's own confidence is below it; the estimate and every number are present in both cases, and `reason` says which. If the GPU estimator cannot be reached, the block falls back to the previous chroma-template estimate with `state: ESTIMATED_UNCALIBRATED`, its own fields (`best_correlation`, `margin_over_second`, `alternates_reported_not_gating`, `analysis.confidence`, `analysis.correlations`) and a `learned_branch {attempted, error}` record, so a fallback is never mistaken for a learned reading. A modal request (`D\|dorian` …) is graded through its key signature. Treat `agreement` as the measured relation between the estimate and your request; a take that does not honour the requested key is reported, never corrected |
| `time_signature_estimated` | object | **Since 2026-09-08; learned estimator since 2026-09-09.** Meter numerator measured back on the file you receive: `value` (`"4/4"`-style, numerator only), `numerator_estimated`, `numerator_requested`, `equivalence_class` (`duple` / `triple` / `quintuple` / `septuple`), `agreement {equivalence_class_match, exact_match, requested_class, estimated_class}`, `state`, `method`. The estimator is Beat This! (CP-JKU's beat and downbeat tracker, ISMIR 2024, MIT code and weights) run on GPU; the numerator is the modal count of beats between consecutive downbeats, and the block carries `analysis {beats, downbeats, bars, beats_per_bar_histogram, features}`, `kappa` (the share of bars agreeing with the modal count), `engine {checkpoint_sha256, checkpoint, device, inference_s}` and `bar {status, theta, target_risk, held_out, gated_classes, excluded_classes, per_truth_class, …}`. `state` is `MEASURED` when `kappa >= theta` AND the requested class is in `bar.gated_classes` — a guaranteed-risk (selective) calibration on 957 labelled excerpts (target risk 0.25; held-out coverage 0.58, held-out risk 0.13) whose per-class table showed the tracker never counts 5 or 7 beats per bar (accepted risk 1.0 on quintuple and septuple material), so for a requested 5/x or 7/x the state is `NOT_MEASURABLE` with that table as `reason`; below theta, or without bar structure, `NOT_MEASURABLE` with the estimate still reported. If the GPU tracker cannot be reached the block falls back to the previous onset-autocorrelation estimate with `state: ESTIMATED_UNCALIBRATED`, its own fields (`tactus_bpm`, `tactus_source`, `recurrence_by_numerator`, `margin_over_second`) and a `learned_branch {attempted, error}` record. Treat `agreement` as the measured relation between the estimate and your request; a take that does not honour the requested meter is reported, never corrected |

### `takes_delivered` · `takes_requested` · `generation_shortfall`

`takes_requested` is what the request asked for (`variation_count` under `output_package=variations`, else `1`).
`takes_delivered` is what was generated, rendered and delivered — never zero on a `success:true` response. They are
equal except in one measured case (D-MUS122-61, 2026-09-07): Vertex refuses a **later** take of a multi-take
request as `content_blocked` (measured on 2026-09-07: four calls with a byte-identical body returned 200, 200, 200,
`content_blocked` — the refusal is per-call, not content). The loop then stops, the takes already generated are
delivered in full, and `generation_shortfall` states it:

```json
"takes_requested": 3,
"takes_delivered": 2,
"generation_shortfall": {
    "takes_requested": 3, "takes_generated": 2, "failed_take": 3,
    "reason": "VertexRefusal: Vertex error 400: {\"error\":{\"code\":\"content_blocked\", ...}}",
    "error_code": "VENDOR_CONTENT_BLOCKED",
    "vendor_refusal": {"http_status": 400, "code": "content_blocked", "message": "Request blocked for an unspecified policy reason. Please modify your input and retry.", "vendor": "vertex-ai", "model": "lyria-3-pro-preview", "retried_by_service": false},
    "policy": "the generation loop stopped at the failed take; the takes already generated are delivered in full (rendered) — no retry was made (Clause 22)"
}
```

`generation_shortfall` is `null` when every requested take was delivered. No retry is ever made. A refused **first**
take is an error envelope carrying `failed_take: 1`, `takes_requested` and the `budget` block — since 2026-09-08 with
its own code: **`VENDOR_CONTENT_BLOCKED` (422)** when Vertex's policy declined the call (`vendor_refusal` carries the
vendor's own status, code and message verbatim, the model and `retried_by_service: false`), `GENERATION_FAILED` (502)
for every other generation failure. Before that date both reached the caller as 502.

### `tracks[]` (list)

One entry per delivered take. **Every take goes through the same conform → master → post-edits → export chain**
(D-MUS122-60, 2026-09-07 — before that date only take 1 was rendered and takes 2..N were the generator's raw files).

```json
[
    {
        "public_url": "https://storage.googleapis.com/playmusicprompts-music-studio/deliveries/masters/<YYYY>/<MM>/<DD>/mastered_82abbd6cea904918b8dd191d303df989.wav?X-Goog-Algorithm=GOOG4-RSA-SHA256&...",
        "gcs_uri":    "gs://playmusicprompts-music-studio/deliveries/masters/2026/09/06/mastered_82abbd6cea904918b8dd191d303df989.wav",
        "url_kind": "v4_signed",
        "url_expires_at": "2026-09-13T22:40:26.155447+00:00",
        "take": 1,
        "kind": "delivered master",
        "derived_from": "source_take 1 through render_plan.stages (conform/master/post_edits/export)"
    },
    {
        "public_url": "...", "gcs_uri": "...", "url_kind": "v4_signed", "url_expires_at": "...",
        "take": 2,
        "kind": "delivered master (variation 2)",
        "derived_from": "source_take 2 through render_plan.stages (conform/master/post_edits/export)",
        "render_plan": { "stages": { "conform": {}, "master": {}, "post_edits": {}, "export": {} }, "settings": {} }
    }
]
```

| Field | Type | Meaning |
|-------|------|---------|
| `public_url` | string | A **V4 signed HTTPS URL** any client can GET with no credentials of its own — playable directly in a browser `<audio src>` or a mobile media player. Time-limited; see `url_expires_at`. |
| `gcs_uri` | string | The object's stable identifier. Use it to mint a fresh URL from `POST /v1/music/delivery-url` when a signature expires. |
| `url_kind` | string | `v4_signed` (time-limited signature, the live shape) or `cdn_unsigned` (permanent, when the operator has put a CDN in front of delivery). Read this instead of inferring fetchability from the URL's shape. |
| `url_expires_at` | string \| null | ISO-8601 UTC expiry for a signed URL; `null` when the URL does not expire. |
| `url_signer` | string | The identity that signed, for audit. |
| `take` | integer | 1-based take index |
| `kind` | string | `delivered master` (take 1), `delivered master (variation N)` (rendered additional take), or `raw take (variation N: render pass failed — <reason>)` when that take's render chain failed — the file is still the generator's raw take and is labelled as such, never promoted. |
| `derived_from` | string | Which source take and which stages produced the file. |
| `render_plan` | object | Present on variations 2..N only: that take's own `stages` and `settings` (take 1's plan is the top-level `render_plan`). |

### Delivery URLs expire — refresh them, never regenerate

A V4 signature is time-limited (default lifetime 7 days, which is Google Cloud Storage's documented
maximum for a V4 signature; the operator can shorten it). When a URL expires, exchange the stable
`gcs_uri` for a new one:

```http
POST /v1/music/delivery-url
Authorization: Bearer <id-token>
x-api-key: pmp_<key>
Content-Type: application/json

{"gcs_uri": "gs://playmusicprompts-music-studio/deliveries/masters/<YYYY>/<MM>/<DD>/mastered_<sha>.wav"}
```

```json
{
    "success": true,
    "request_id": "<uuid4>",
    "url": "https://storage.googleapis.com/...?X-Goog-Signature=...",
    "url_kind": "v4_signed",
    "url_expires_at": "2026-09-08T15:45:00+00:00",
    "url_signer": "music-api-runtime@playmusicprompts.iam.gserviceaccount.com",
    "gcs_uri": "gs://playmusicprompts-music-studio/deliveries/masters/<YYYY>/<MM>/<DD>/mastered_<sha>.wav"
}
```

This call is **free** — it mints a signature, it does not generate audio. Never regenerate a track to
recover a download link.

Errors: `400` when the `gcs_uri` is malformed or names a bucket this service does not deliver from,
`404` when no such delivered object exists, `502` when the URL cannot be signed.

**Store the `gcs_uri`, not the URL.** The `gcs_uri` is permanent; the URL is a lease on it. A client
that persists only the URL will find dead links in its library after the lifetime elapses.

### If a delivery URL cannot be signed, the request FAILS

The API does not return `200` with an unfetchable URL. If the signing path is broken, the request
returns `502 MEASUREMENT_FAILED` naming the cause, and nothing is reported as delivered — a delivery
whose audio cannot be fetched is not a delivery. Measured origin: until 2026-09-01 this endpoint
returned a bare `storage.googleapis.com` URL that 403'd for every anonymous client, and the defect
was invisible because nobody had downloaded one.

Delivered tracks are always the **MASTERED** file — the mix that survived conform + master + verify.
Separated stems are NEVER in `tracks[]` and never layered into the master (the platform's stem-shipping policy). When you ask for
them through `stems`, they arrive under `render_plan.stages.stems.stems.<name>` as their OWN files, each record
carrying `grade` (`"analysis-grade"` for a separated stem — with a `grade_note` quoting the clause —
`"delivery-grade"` for the master and for any engine-generated whole signal; added 2026-09-07, decision D11) next
to `origin`, `state`, `gcs_uri` and, for a DELIVERED separated stem, `public_url` / `url_kind` / `url_expires_at`.

### `language_fallback` (string | null)

- `null` when the requested `vocal.language` was accepted as-is
- Otherwise a short reason like `"tr not SINGING_PROVEN; fell back to en per vocal.language_policy=prefer_proven"`

### `mix_plan` (object)

The A7 two-path plan — which layers the request asked for, which ones the platform will lawfully
ship, and which ones it refuses BY LAW.

```json
{
    "research_item": "A7",
    "multi_path": false,
    "layer_count": 1,
    "layers": [
        {
            "role": "MUSIC_BED",
            "engine": "lyria-3-pro-preview",
            "origin": "ENGINE_GENERATED",
            "delivery_class": "SHIPPABLE",
            "prompt_intent": "the full typed stack stays authoritative: structure -> [mm:ss] section prose, tempo_bpm, key, time_signature, instruments, mood_orbit, energy_curve"
        }
    ],
    "refusals": [
        {
            "role": "LEAD_VOCAL",
            "refused": true,
            "reason": "No Google service generates a vocal-only signal: the only Google sung surface (lyria-3-pro-preview) returns a MIXED song. An isolated vocal could therefore only come from SEPARATING that mix, and layering a separated stem INTO the delivered master is what CLAUSE 15 forbids ('a separated stem is analysis-grade and may never be shipped'). Decision D11 (2026-09-07) draws the line precisely: the clause binds the delivered MASTER; a separated stem the caller explicitly requests through `stems` is delivered as its OWN file labelled grade=analysis-grade (the service's render stage), never mixed into the master.",
            "law": "a platform policy that forbids shipping machine-separated stems",
            "what_is_still_lawful": "The sung take is delivered AS A WHOLE by lyria-3-pro-preview (single-path), and its separated vocal is used for MEASUREMENT only — which is exactly what the A8 intelligibility gate needs.",
            "what_would_unblock_it": [
                "a Google/Vertex surface that generates a vocal-only take",
                "his explicit suspension of CLAUSE 15 for this case, which is his decision"
            ]
        }
    ],
    "unmeasured": "..."
}
```

Refusals are ALWAYS first-class citizens — a role that the platform cannot lawfully ship is named
here with the exact law, exact reason, and exact unblock path.

### `render_plan` (object)

The conform + master + stems pipeline output.

```json
{
    "executed": true,
    "stages": {
        "conform": {
            "ok": true,
            "measured_duration_seconds": 30.0,
            "plan": {
                "action": "trim",
                "cut_seconds": 30.0,
                "fade_seconds": 2.0,
                "derivation": {
                    "bar_seconds": 2.0,
                    "tempo_bpm": 120.0,
                    "time_signature": "4/4",
                    "bar_aligned": true,
                    "rule": "cut at the bar boundary nearest target inside ±tolerance"
                },
                "delivered_seconds": 143.751792
            }
        },
        "master": {
            "ok": true,
            "mode": "linear_gain_plus_true_peak_limiter",
            "pass1": {
                "input_i": "-14.68", "input_tp": "-0.57", "input_lra": "6.20",
                "input_thresh": "-24.86", "output_i": "-13.17", "output_tp": "-1.00",
                "output_lra": "5.50", "output_thresh": "-23.34",
                "normalization_type": "dynamic", "target_offset": "-0.83"
            },
            "applied_gain_db": 0.68,
            "limiter_limit_db": -1.0,
            "relimit_passes": 0,
            "residual_overshoot_db": 0.0,
            "target": {"lufs": -14.0, "true_peak_db": -1.0},
            "verification": {
                "has_audio": true,
                "measured": true,
                "channels": 2,
                "integrated_lufs": -13.9,
                "lra_lu": 5.8,
                "true_peak_dbtp": -1.0,
                "measured_by": "ebur128 (separate from the loudnorm that made the file)"
            }
        },
        "stems": {"requested": [], "note": "no separated stems requested"}
    },
    "processed_url": "https://storage.googleapis.com/playmusicprompts-music-studio/deliveries/masters/2026/09/01/mastered_11632ce915aa42b3b0f15629541ae4f9.wav",
    "processed_gcs_uri": "gs://playmusicprompts-music-studio/deliveries/masters/2026/09/01/mastered_11632ce915aa42b3b0f15629541ae4f9.wav",
    "processed_duration_seconds": 30.0
}
```

Key fields:

| Field | Meaning |
|-------|---------|
| `stages.conform.plan.action` | `trim`, `pad`, or `passthrough` |
| `stages.conform.plan.cut_seconds` | Length after trim; bar-aligned to `tempo_bpm` + `time_signature` when possible |
| `stages.master.mode` | `linear_gain_plus_true_peak_limiter` (frontier) or `loudnorm` (legacy fallback) |
| `stages.master.applied_gain_db` | Gain applied to reach the target LUFS |
| `stages.master.verification` | Independent ebur128 pass on the FINISHED file — the honest post-hoc measurement |
| `processed_url` | The mastered file's public URL. This is what a downstream consumer downloads. |

Full mastering research: the service's internal research documentation (available from the API operator on request).

### `lyrics_verification` (object | null)

Complete PER intelligibility gate output for a sung request with dictated lyrics; `null` for instrumental / no
lyrics. Every field is described in `05-lyrics-and-singing.md`. Two typed non-running shapes (never bare `null`):
`lyrics.verify: false` → `{measured: false, gate_ran: false, skipped_by_caller: true, reason}`; `lyrics.mode: "ai_write"`
with a voice → `{measured: false, gate_ran: false, verdict: "NOT_APPLICABLE", reason, language}` (since 2026-09-07,
a recorded platform decision: the model composes the words, so there is no dictated reference to score against — earlier revisions
returned `null` here, indistinguishable from instrumental).

### `originality_gate` (object)

Three shapes, mutually exclusive:

1. **Not requested** (default):
   ```json
   {
       "measured": false,
       "opt_in": true,
       "reason": "the optional originality gate is opt-in (set run_originality_gate: true)."
   }
   ```
2. **Requested, running in background** (the `bar_window` block was added 2026-09-07, a recorded platform decision — measured live on
   `music-api-00102-xiw`):
   ```json
   {
       "status": "pending",
       "measured": false,
       "poll": "/v1/music/originality/<request_id>",
       "bar_window": {
           "bar_seconds": 2.414972831555645,
           "tempo_bpm": 99.38,
           "tempo_source": "measured.tempo (TempoEstimator on the delivered file)",
           "beats_per_bar": 4,
           "meter_source": "param_spec default '4/4' (evidence: png shows 4/4); not requested and not estimable (music-01: time_signature_estimated NOT_RUN)",
           "provisional": true
       },
       "note": "the optional originality gate is computing in the background"
   }
   ```
   `bar_window` says where the tile rule's "one bar" came from. `tempo_source` is `request.tempo_bpm` when you sent a
   tempo, otherwise the tempo the service MEASURED on your delivered file; when neither exists it names the absence and
   the verdict's `axis1_monotony.tile_rule` reports `state: NOT_RUN` (the SI and tempogram statistics are still
   measured). `meter_source` is `request.time_signature` when you sent one, otherwise the spec's default record with
   its evidence and `provisional: true`. The same block is repeated inside the polled verdict.
3. **Requested, but unable to record**:
   ```json
   {
       "status": "unavailable",
       "measured": false,
       "reason": "could not write the pending originality record: ..."
   }
   ```

To get the actual verdict when `status=pending` was returned, poll
`GET /v1/music/originality/{request_id}` until `status` is `complete` or `failed`.

Full gate documentation: `12-originality-gate.md`.

### `spend_note` (string)

A one-line accounting note of what the request actually spent (used by the operator's ledger). Not
authoritative for billing — the authoritative record is in Google Cloud billing.

### `auth` (object)

Always present.

```json
"auth": {
    "account_id": "web-app-prod",
    "key_id": "3a7f0c9d4e12",
    "limit": {
        "rate_per_min": 120,
        "daily_quota": 10000,
        "used_today": 48
    }
}
```

- On a successful request `limit.used_today` was incremented for this call BEFORE the response was
  built, so it always reflects the count including this request.
- Until 2026-09-06 the legacy bootstrap key collapsed it to `{"note": "legacy bootstrap key, unlimited"}`; that
  path was retired (02-authentication), so every response now carries the store's per-key record.

## Fields added 2026-09-02

Five blocks were added when ten previously-ignored parameters were wired. See
the release notes supplied by the API operator for the full list.

### `labels` — present only if you sent it

Your own key/value metadata, echoed verbatim and never interpreted.

```json
{ "labels": { "campaign": "spring", "internal_ref": "AB-99" } }
```

### `rights` — present on every DELIVERY response (not on the dry-run envelope, which precedes delivery — measured 2026-09-08)

```json
{
  "rights": {
    "commercial_use": true,
    "sync": true,
    "copyright_warranted": false,
    "basis": "Vertex AI Lyria output under Google Cloud's own terms for generated content; this field records the platform's assertion and is not legal advice",
    "source": "the service's internal param_spec.json — the `rights` parameter's declared default"
  }
}
```

`copyright_warranted` is **always** `false` and is stated rather than omitted. This is a response
field — sending `rights` in a request is refused as an unknown field.

### `compliance` — present on every DELIVERY response (not on the dry-run envelope, which precedes delivery — measured 2026-09-08)

```json
{
  "compliance": {
    "c2pa": {
      "state": "signed",
      "survived_render": true,
      "verified_by": "c2pa-python 0.37.10 / c2pa-rs 0.90.19",
      "trust": "untrusted_own_ca",
      "validation_state": "Valid",
      "validation_codes": {
        "success": ["timeStamp.validated", "claimSignature.insideValidity", "claimSignature.validated", "assertion.hashedURI.match", "assertion.dataHash.match"],
        "informational": ["timeStamp.untrusted"],
        "failure": ["signingCredential.untrusted"]
      },
      "manifest_assertions": ["c2pa.actions", "com.ideasets.music-api.generation", "c2pa.soft-binding"],
      "signature_info": {"alg": "Es256", "issuer": "Ideasets", "common_name": "music-api provenance signer", "time": "2026-09-08T11:09:15+00:00"}
    },
    "watermark": {
      "state": "embedded_calibrated",
      "algorithm": "com.aiwatermark.audioseal.1",
      "library": "audioseal==0.2.0",
      "message_id": 2,
      "detection": {"probability": 0.999, "detected": true, "mean_frame_probability": 0.993, "message_id": 2, "message_bit_confidence": 0.38, "sample_rate_hz": 16000, "seconds": 29.936, "detect_time_s": 0.49},
      "watermark_rms_dbfs": -41.8,
      "calibration": {"calibrated": true, "status": "CALIBRATED", "artefact": "watermark_bars.json", "threshold": 0.5, "marked": {"n": 30, "detected": 30, "min_probability": 0.977, "max_probability": 1.0, "message_matches": 30}, "unmarked": {"n": 20, "detected": 0, "min_probability": 0.002, "max_probability": 0.119, "message_matches": 0}, "measured_at": "2026-09-09T10:10:44Z"},
      "soft_binding_in_manifest": true
    },
    "synthid": {
      "state": "vendor_stated_not_verified",
      "statement": "Google states every Lyria output carries a SynthID audio watermark; no detector API exists for audio and SynthID is not a registered C2PA soft-binding algorithm, so this is a vendor statement recorded by the generator, not a measurement by this service."
    },
    "ddex_ai_credit": {
      "state": "declared",
      "version": "ERN 4.3.2",
      "contains_ai": "All",
      "special_contributor": "GenerativeAI",
      "reason": "`declared` = the ERN 4.3.2 values are carried in this response and inside the C2PA manifest's vendor assertion; `written` is reserved for an ERN message, which this service does not produce"
    },
    "shape": {"c2pa": {"state": "signed|absent|failed", "...": "..."}, "watermark": {"state": "embedded_uncalibrated|embedded_calibrated|absent|failed", "...": "..."}, "synthid": {"state": "vendor_stated_not_verified"}, "ddex_ai_credit": {"state": "declared|written", "version": "ERN 4.3.2", "contains_ai": "None|Partly|All"}},
    "source": "render_plan.stages.provenance (the service's internal provenance.py) + render_plan.stages.watermark (the service's internal watermark.py) + the service's internal provenance_contract.py + the service's internal watermark_contract.py; shape from param_spec.json"
  }
}
```

**What `c2pa.state` means, mechanically (since 2026-09-08).** The render chain's last stage embeds a C2PA 2.x manifest into the
final bytes of every delivered master and every separated stem, AFTER the export encode (an ffmpeg pass of any kind — even a
stream copy — was measured to strip the manifest from WAV, MP3 and FLAC alike, so the embed is last by construction). The same
module then re-opens the bytes that were uploaded and reports the validator's own codes:

- `signed` — the manifest was embedded and read back `Valid` or `Trusted` from the delivered bytes. `survived_render` is that
  read-back verdict. `validation_codes` are copied from the validator; `signature_info` is the signing certificate's identity.
- `absent` — nothing was embedded; `reason` is one of three fixed strings: `signer_not_configured: …` (no certificate/key in the
  environment), `library_missing: …` (the runtime lacks c2pa-python), `unsupported_container: …` (only WAV, MP3 and FLAC have an
  embedding path in c2pa-rs; OGG/Opus is specified but unimplemented upstream). The dry-run envelope never carries this block.
- `failed` — embedding ran but the read-back was not `Valid`; `reason` starts with `embed_failed:` or `readback_not_valid:`.
- `trust` — `untrusted_own_ca` while our own private CA signs (the validator reports `signingCredential.untrusted`); `trusted`
  only when the certificate is on a trust list the validator recognises. A signature can be cryptographically valid and still
  untrusted; both facts are reported, neither is hidden in the other.

**What it does NOT mean.** A C2PA manifest is provenance, not authenticity: it proves who signed which bytes and when, not that
the music is "real" or that nobody can strip it — anyone can re-encode the file and the manifest is gone (that is why the
watermark layer exists). The `stems[*].provenance` block carries the same report per stem.

**`watermark` — layer 2 of the two-layer mark (since 2026-09-09).** Before the export encode, the mastered PCM is marked with Meta
FAIR's AudioSeal (arXiv:2401.17264; `audioseal==0.2.0`, MIT), an additive, imperceptible watermark carrying a 16-bit message =
the id of the model record that generated the take (`message_id`). The mark is applied on this service's GPU container, and
the state is decided from the DETECTOR's reading of the marked bytes, never from the fact that the marking call returned:

- `embedded_uncalibrated` — the detector read the mark back with the expected message (`detection.detected`, `detection.probability`
  = fraction of frames above the algorithm's 0.5 threshold), but the operating point on OUR material (44.1/48 kHz music through our
  export codecs, outside the paper's 16 kHz speech evaluation) had not yet passed its 10 marked / 10 unmarked control; `calibration`
  says `NOT_RUN` or `CALIBRATION_FAILED` with the reasons. (The state every delivery reported between the layer's launch and the
  calibration of 2026-09-09; it returns only if a later re-calibration fails.)
- `embedded_calibrated` — as above, and the control passed at the paper's own clean-audio operating point (TPR 1.00 / FPR 0.00).
  **Since 2026-09-09 this is the production state.** The control measured on this service's own deliveries: 10 masters across
  `wav24_48k` / `mp3_320` / `flac_48k`, each also re-encoded to MP3 320 kbit/s and FLAC — 30 of 30 marked files detected with the
  correct message (lowest probability 0.977); 20 of 20 unmarked files not detected (10 raw takes before the mark, 10 human studio
  recordings; highest probability 0.119). `calibration` carries the summary counts and `measured_at`.
- `absent` — the stage did not run; `reason` is one of the fixed strings `separator_unconfigured: …`, `separator_unreachable: …`,
  `not_pcm: …`, or names the missing model message id. The unmarked master is delivered and says so.
- `failed` — the marking ran but the detector did NOT read the mark back with the expected message (`reason` starts with
  `detector_disagrees:`); the unmarked master is delivered, because a mark the detector cannot find is not a mark.
- `soft_binding_in_manifest` — when embedded, the C2PA manifest carries a `c2pa.soft-binding` assertion (C2PA 2.4 §18.10) with
  `alg = com.aiwatermark.audioseal.1` from the official soft-binding algorithm list, one block over the whole timespan whose value is
  the 2-byte message, plus a `watermark` record in the vendor assertion. Representation note, measured from the c2pa-rs builder source:
  the assertion is emitted through the JSON manifest surface, so the block `value` is stored as an array of two unsigned bytes
  rather than the CDDL byte string — the vendor-assertion copy is the conformant carrier; both are present.

**What the watermark does NOT do.** It is a soft binding for recovering the manifest when the file's metadata has been stripped, and
a machine-readable marker for the EU Code of Practice's second layer. It is not an AI detector and not tamper-proof: post-hoc audio
watermarks do not survive neural-codec re-synthesis (published measurements, see the research report named in the changelog), and
detection on a heavily edited or re-synthesised file is expected to fail. `detection` reports what the detector measured on the
marked bytes at delivery time; the calibration control measures survival through MP3 320 and FLAC re-encodes.

**`synthid`.** Google states every Lyria output carries a SynthID audio watermark. There is no detector API for audio and SynthID
is not a registered C2PA soft-binding algorithm, so this service records the statement and never claims to have verified it.

**`ddex_ai_credit`.** `declared` means the DDEX ERN 4.3.2 disclosure values (`ContainsAI = All`, `SpecialContributor =
GenerativeAI`) are carried in this response and inside the manifest's vendor assertion. `written` would mean an ERN message was
produced — this service produces none, so `written` does not appear.

**History.** Until 2026-09-07 this block returned `"c2pa": true` with the truth in a note; on 2026-09-07 it became the measured
`absent`; since 2026-09-08 it is derived per delivery from the provenance stage.

  is one JSON blob today (there is no chunked response mode).
### `analysis_outputs` — always present

Every value is a measurement of the file that was delivered.

```json
{
  "analysis_outputs": {
    "measured_loudness_lufs": -14.1,
    "measured_true_peak_dbtp": -1.0,
    "measured_loudness_range_lu": 7.3,
    "measured_duration_seconds": 30.0,
    "measured_channels": 2,
    "measured_sample_rate": 48000,
    "measured_codec": "mp3",
    "intelligibility": { "metric": "per", "value": 0.089, "verdict": "PASS" },
    "measured_by": "ffprobe and ebur128 on the delivered file; the intelligibility row comes from the A8 gate and is present only when the request was sung",
    "null_means": "the stage that would have produced that measurement did not run — the master stage is skipped for quality=draft and for normalize_output=false, for example. A null is an honest absence, never a zero."
  }
}
```

**A `null` here is never a zero.** It means the stage that would have produced that number did not
run. Do not chart a null as 0.

### `webhook` — present only if you sent `webhook_url`

The outcome of the callback push. See [11 — Webhooks](11-webhook-async.md) for all three shapes.

### `render_plan.stages.export` — always present

```json
{
  "export": {
    "ok": true,
    "applied": true,
    "requested": "flac_48k",
    "description": "FLAC at 48 kHz",
    "file_size_bytes": 175938,
    "measured": { "codec": "flac", "sample_rate": "48000", "channels": 2 },
    "measured_by": "ffprobe on the encoded file"
  }
}
```

`measured` is read from the encoded file, not from the request. If `requested` and `measured.codec`
disagree, believe `measured` and report it — the request is an intent, the measurement is the file.

### `lyrics_verification` additions

| field | meaning |
|---|---|
| `verify_metric` | the metric you asked for in `lyrics_verify_metric` |
| `primary_metric` | `{metric, value, threshold, verdict}` — the metric that decided the verdict. `verdict: "NOT_RUN"` means the metric you asked for is unavailable for that language and the PER-based verdict stands, labelled as such rather than silently relabelled |
| `measurement_domain` | `{requested, measured_on, note}` — whether the score came from the separated vocal stem or the full mix |
| `bar_source` | now also reports `lyrics_threshold_override=<n>` when you overrode the bar, and `NOT_COMPARABLE` when you asked for the mix domain (the calibrated bar was calibrated on stems) |

## Fields added 2026-09-04 → 2026-09-06 (every response, measured on `music-api-00085-tih`)

### `service` — always present, on every envelope (success, refusal, health, capabilities, dry run)

```json
"service": {
  "platform": "cloud-run",
  "service": "music-api",
  "revision": "music-api-00085-tih",
  "configuration": "music-api",
  "api_version": "2.1-cloudrun",
  "revision_known": true,
  "runtime": {"python": "3.12.14", "fastapi": "0.115.6", "uvicorn": "0.52.4"}
}
```

The revision that BUILT the response, read from Cloud Run's own container environment (`K_REVISION`), so an
evidence file is self-attesting. `runtime` versions are measured in the running container with
`importlib.metadata` — never copied from a pin file. `revision_known` is the one boolean to assert.

### `budget` — present on every paid delivery

```json
"budget": {
  "contract": "playmusicprompts.request-budget/v1",
  "total_seconds": 3600.0,
  "source": "cloud_run_admin_api_v2.template.timeout",
  "elapsed_seconds": 76.359,
  "remaining_seconds": 3523.641,
  "stages": [
    {"name": "lyria_generate", "timeout_seconds": 2645.98, "remaining_at_start_seconds": 3599.98, "elapsed_seconds": 18.892, "outcome": "ok"},
    {"name": "storage_upload", "...": "..."},
    {"name": "render_master",  "...": "..."}
  ],
  "reserves_seconds": {"lyria_generate": 0.0, "lyria_fetch": 60.0, "separator": 264.0, "asr_transcribe": 300.0, "gemini_text": 120.0, "render_master": 60.0, "storage_upload": 60.0, "measure_ffprobe": 60.0, "webhook_push": 30.0},
  "rule": "each stage may use everything left minus the sourced reserves of the stages after it; a stage that cannot get the documented floor is refused before any spend"
}
```

The request's time budget is the revision's own Cloud Run timeout (read from the Admin API at start), and every stage
reports the timeout it was given and the seconds it used. A request that could not afford a paid stage is refused with
`503 BUDGET_EXHAUSTED` before spending (see 07).

### `language_capability` — present for every sung / spoken request

```json
"language_capability": {
  "code": "ja", "name": "日本語",
  "generation": "PROMPT_LANGUAGE",
  "transcription": "GEMINI_DOCUMENTED",
  "intelligibility_gate": "GRAPHEME_METRICS_ONLY",
  "bar": "NOT_CALIBRATED",
  "singing": "DOCUMENTED_CONVERGENT", "speech": "PENDING_MEASUREMENT",
  "registry_evidence": "GTSinger + Mureka",
  "accepted": true,
  "sources": {"generation": "...", "transcription": {"source_url": "...", "source_declared": "...", "source_archive": "...", "count": 109}}
}
```

The measured capability tuple for the requested language (see 14 — Language support): what the generator can do,
what the transcriber documents, which intelligibility metric applies (`PER` where a phonemiser exists, otherwise
grapheme metrics), whether a bar is calibrated, and the registry states — so a delivery in an unproven language is
delivered WITH its state, never blended into a yes.

### The dry-run envelope — `dry_run: true` (2026-09-06)

A request with `"dry_run": true` passes content safety, prompt enhance, validation, routing and prompt compilation
exactly like a paid request, then returns the plan and stops — no Lyria call, no render, no storage, no webhook,
no job, nothing billable. It takes precedence over `async`. Top-level keys:

```json
{
  "success": true, "dry_run": true, "request_id": "…", "endpoint": "POST /v1/music",
  "route": {"model": "lyria-3-pro-preview", "why": "…"},
  "prompt_sent": "the exact prompt that WOULD be sent",
  "generation_payload": {"prompt": "…", "model": "…", "instrumental_only": false, "takes": 1},
  "_note_generation_payload": "instrumental_only is a REPORT of vocal.mode (true when instrumental) kept for readers of this block; it is not a Lyria request field — no Lyria surface has one (A9, 2026-09-07) — and the instrumental instruction reaches the model as the prose clause recorded in bindings.vocal",
  "bindings": {"…": "per-parameter bindings, identical to a paid response"},
  "language_capability": {"…": "as above, for sung/spoken"}, "language_fallback": null, "tradition_notices": [],
  "prompt_enhance": null,
  "render_settings": {
    "quality": "balanced",
    "conform": {"target_seconds": 135, "tolerance_seconds": 5.0, "on_miss": "accept", "tempo_bpm": 128.0, "time_signature": "4/4"},
    "master": {"target": "cinematic_trailer", "loudness_lufs": -9.0, "true_peak_db": -1.0, "normalize_output": true, "mix_dynamic_range_requested_lu": null},
    "post_edits": {"fade_in_seconds": 0, "fade_out_seconds": 0, "channel_layout": null},
    "export": "wav24_48k",
    "stems": {"requested": ["master"], "separated_requested": [], "separator_calls": 0}
  },
  "request_parameters_received": ["…every top-level parameter you sent…"],
  "spend_note": "dry_run=true: … nothing billable",
  "auth": {"…": "…"}, "service": {"…": "…"}
}
```

`render_settings` is produced by the SAME resolver the render stage runs (`render.resolve_enforced_settings`), so what
the preview says the master, conform, post-edit, export and stems stages would do is what the paid path does. A dry-run
envelope never carries `tracks`, `render_plan`, `budget`, `takes_delivered`, `rights` or `compliance` — the last two
describe a DELIVERED file (whether a manifest survived the render, whether a credit was written) and have no truthful
value before a file exists; read them on the paid response only (measured 2026-09-08: `the service's main stage` returns the dry-run
envelope before the delivery path that builds them). Use a dry-run for UI previews, form validation and integration
tests — it costs a request against your key's quota and nothing else.

## Fields measured 2026-09-11 against a real delivered response — the ones this document had never described

**How this section was produced, because it matters for trusting it.** Every other section of this file was
hand-written. This one was derived by walking a REAL delivered response and listing every field path the
document did not mention: an internal operator script against
`paid_parameter_sweep_20260907T135535Z.json` (request `de83dc09-ac2a-4f46-a0cb-c01e0c64d9e9`, **30 top-level
fields, 320 field paths**). It found **4 top-level fields and 59 nested leaves** absent from this document —
capabilities the service returns and a customer had no way to learn about. The checker now runs as a gate,
so this cannot silently happen again. The truth source is a delivered response rather than a code read for
a measured reason: the envelope is assembled across many branches (the delivery path, the background
originality task, the mastering stage, the async path, the webhook push), so no single function produces the
field set a customer actually receives.

### `seed` (object) — always present

A provenance record of the request, **not** a re-render promise. Real shape:

```json
"seed": {
  "value": 454533620,
  "source": "server (secrets.randbits(31))",
  "sent_to_model": false,
  "note": "NOT sent: the Interactions surface body is {model, input} and has no seed field (measured)",
  "honest_limit": "a seed is a provenance record, not a re-render promise"
}
```

- **`value`** — the integer generated for this request, or the one you sent.
- **`source`** — `"server (secrets.randbits(31))"` when the service generated it, otherwise your value.
- **`sent_to_model`** — **`false` on the Interactions surface**, and this is the field to read before you
  build any "regenerate the same track" feature. The surface's request body is `{model, input}` and has no
  seed field, measured; so the seed is recorded, not transmitted.
- **`honest_limit`** — stated in the response itself so a caller cannot mistake the seed for determinism.

### `source_take[]` (list) — always present on a delivery

The RAW generator output for each take, before conform and mastering, each with a signed `public_url`, its
`gcs_uri` and its own probe. Use it when you want to hear what the model produced versus what was delivered;
do not present it as the deliverable — the mastered file in `tracks[]` is. Each delivered track's
`derived_from` names which `source_take` it came from and which render stages were applied to it.

### `job` (object) — present only on the ASYNC path (`"async": true`)

```json
"job": {
  "job_id": "job-<request_id>",
  "mode": "async",
  "attempt": {
    "task_name": "job-<request_id>",
    "retry_count": "0",
    "execution_count": "0",
    "caller_email": "<the service's own runtime identity>"
  }
}
```

- **`job.job_id`** — the id to poll `GET /v1/music/jobs/{job_id}` with. It is `job-` plus the request id, so
  a caller does not have to store a second identifier.
- **`job.attempt.retry_count`** / **`job.attempt.execution_count`** — the queue's own counters, **as
  strings** (they arrive as headers). A non-zero `retry_count` means the delivery was attempted before:
  useful when reconciling a duplicate webhook.
- **`job.attempt.task_name`** — the queue task backing this execution.
- **`job.attempt.caller_email`** — the identity that invoked the worker; it is the service's own runtime
  account, never yours.

### `duration_regeneration` (object | null) — `null` unless a take was regenerated for length

Non-null only when a generated take missed the requested duration badly enough to be regenerated. Read it
with `generation_shortfall`.

### `bindings` additions

- **`bindings.genres`** — `{"binding": "prose", "sent": "Genre and style: indie folk."}`. The exact clause
  your genres compiled into, echoed so you can see what the model was told.
- **`bindings.project`** — `{"binding": "metadata", "consumed_by": "render_plan.deliver (track naming) +
  response echo", "value": {...}}`. `consumed_by` names where a client-side field actually lands.
- **`bindings.client_side_echo`** — the fields the server accepted and ignored by design, echoed back.
- **`bindings.vocal.mode_requested`** — what you asked for, kept beside what was used, so a fallback is
  visible rather than silent.

### `measured` additions — the delivered file's real audio properties

- **`measured.sample_fmt`** — ffprobe's sample format of the delivered file, e.g. `"s32"`.
- **`measured.bits_per_sample`** — e.g. `24`. Read this, not the request, to know what you received.
- **`measured.size_bytes`** — the delivered object's real size.
- **`measured.tempo.analysis`** — the tempo estimator's own working parameters
  (`ac_size_s`, `analysis_sample_rate_hz`, `duration_s`, `max_tempo`, `onset_frames`, `prior_start_bpm`,
  `prior_std_octaves`), so a disputed tempo can be re-derived rather than argued about.
- **`measured.tempo.agreement`** — `acc1_within_4pct`, `acc2_octave_tolerant`, `octave_error_oe1` and
  `metric_source`: the standard tempo-agreement metrics between the requested and the measured tempo.

### `mix_plan.stage` (object) — the mix stage's own identity

`id`, `position` (where in the pipeline it runs and why), `reuses` (which module does the loudness work, so
normalisation has a single source of truth), `instantiated` and `instantiated_note`. Layers additionally
carry **`evidence`** and **`measured_caveat`**, which is where a layer states what it could NOT prove.

### `render_plan` additions

- **`render_plan.processed_url_kind`** — `"v4_signed"`: the URL scheme of the delivered link.
- **`render_plan.processed_url_signer`** — the identity that signed it.
- **`render_plan.processed_url_expires_at`** — when the link stops working. Pair it with the URL-refresh
  route described above; never re-generate a track to get a fresh link.
- **`render_plan.processed_probe`** — an independent ffprobe of the FINAL object
  (`codec_name`, `sample_rate`, `channels`, `sample_fmt`, `bits_per_sample`, `duration_seconds`,
  `size_bytes`, `measured_by`). This is the measurement of the file you will download.
- **`render_plan.stages.export.measured.bit_rate`**, **`render_plan.stages.export.measured.bits_per_raw_sample`**,
  **`render_plan.stages.export.output_path`**, **`render_plan.stages.export.source.bits_per_sample`**,
  **`render_plan.stages.export.upsampled_from`** — the export stage's before/after: the delivered bit rate
  and raw sample width, the object path written, the source file's own bit depth, and — when the file was
  upsampled — what it was upsampled FROM. That last field is how you tell a genuine 24-bit master from a
  16-bit source promoted to a 24-bit container.
- **`render_plan.stages.master.why_not_loudnorm`** — present when the mastering stage deliberately did not
  run a loudness normalisation pass, with the reason. A field that explains an absence is how this service
  avoids the silent-downgrade class.

### `webhook` additions

- **`webhook.attempted`** — whether a push was made at all.
- **`webhook.elapsed_s`** — how long it took.
- **`webhook.retry_policy`** — what the service will and will not retry.
- **`webhook.auth.scheme`** — `oidc_id_token`.
- **`webhook.auth.audience`** — the audience the token was minted for: your own webhook URL.
- **`webhook.auth.verify_with`** — the exact verification recipe your handler should apply, given in the
  response so you do not have to derive it:
  `google.oauth2.id_token.verify_oauth2_token(token, Request(), audience=<your url>)`, then check the
  `email` claim against the service's runtime account. Verify it; do not trust the request because it
  arrived.

### `budget.source_detail` (string)

The Cloud Run service resource the request's total time budget was read from at boot. The budget is not a
constant in code — it is read from the deployed revision's own timeout, and this field names where.

### `compliance` additions — two notes that state what is NOT true

- **`compliance.c2pa_note`** — says in plain words that C2PA content credentials are **not embedded in the
  delivered file today**, and that the flag records intent. A caller must not infer embedded provenance
  from the flag alone.
- **`compliance.ddex_ai_credit_note`** — says the DDEX AI-credit information is carried **in this response,
  not in the audio file's own metadata**.

## Nullability quick reference

| Field | May be null? | When |
|-------|--------------|------|
| `route.delegate_reported` | No | Always present on success |
| `bindings.<param>` | Per-param | Only params you set (or a default that was inferred) appear |
| `bindings.phoneme_timeline` | Yes | Sung requests in a language with a **sourced syllabifier**: `tr` (S15) and `en` (S-BKC09 SONORITY, added 2026-09-10). Any other language returns `status: "NOT_AVAILABLE"` naming which languages ARE served. |
| `language_fallback` | Yes | `null` unless a fallback happened |
| `lyrics_verification` | Yes | `null` for instrumental takes |
| `mix_plan.refusals[]` | No | Always an array; may be empty |
| `render_plan.stages.stems` | Depends on `stems` request | `{"requested":[]}` when no stems asked for |

## Content-Type and encoding

- Response body is `application/json; charset=utf-8`.
- All string fields are UTF-8. Turkish characters (ç, ğ, ı, İ, ö, ş, ü) round-trip.
- No BOM.
- Response bodies are NOT gzipped by the app (Cloud Run's front-end MAY apply gzip transparently
  based on the request's `Accept-Encoding`).

## Response size

- Instrumental delivery: ~4-8 KB
- Sung delivery with full lyrics_verification (with `reference.phonemes`, `hypothesis.phonemes`,
  and full alignment_errors): 20-60 KB depending on hypothesis length. The 2026-09-01 sung EN proof
  produced 12 KB of `alignment_errors` alone.
- Consider streaming or paginating if your integration is bandwidth-sensitive; but note the response
  is one JSON blob today (there is no chunked response mode).
