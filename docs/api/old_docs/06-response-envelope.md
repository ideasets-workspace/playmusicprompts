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
        "reason": "A3 PLANNED phoneme timeline needs a sourced syllabifier; one exists only for Turkish (the service's syllabification module). Language 'en' has no sourced syllabifier, so a timeline is not built rather than invented.",
        "research_item": "A3"
    }
}
```

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

### `takes_delivered` (integer)

Number of takes actually delivered. Equals `variation_count` for `output_package=variations`; equals
`1` otherwise. Never zero on a `success:true` response.

### `tracks[]` (list)

One entry per delivered take.

```json
[
    {
        "public_url": "https://storage.googleapis.com/playmusicprompts-content/music/lyria_20260901_084334_7decbad8_t0.mp3",
        "gcs_uri":    "gs://playmusicprompts-content/music/lyria_20260901_084334_7decbad8_t0.mp3",
        "take": 1
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

### Delivery URLs expire — refresh them, never regenerate

A V4 signature is time-limited (default lifetime 7 days, which is Google Cloud Storage's documented
maximum for a V4 signature; the operator can shorten it). When a URL expires, exchange the stable
`gcs_uri` for a new one:

```http
POST /v1/music/delivery-url
Authorization: Bearer <id-token>
x-api-key: pmp_<key>
Content-Type: application/json

{"gcs_uri": "gs://playmusicprompts-content/music/mastered_<sha>.wav"}
```

```json
{
    "success": true,
    "request_id": "<uuid4>",
    "url": "https://storage.googleapis.com/...?X-Goog-Signature=...",
    "url_kind": "v4_signed",
    "url_expires_at": "2026-09-08T15:45:00+00:00",
    "url_signer": "music-api-runtime@playmusicprompts.iam.gserviceaccount.com",
    "gcs_uri": "gs://playmusicprompts-content/music/mastered_<sha>.wav"
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
Separated stems are NEVER in `tracks[]` (the platform's stem-shipping policy).

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
            "reason": "No Google service generates a vocal-only signal. The only Google sung surface (lyria-3-pro-preview) returns a MIXED song, so an isolated vocal can only be obtained by separating that mix — and CLAUSE 15 forbids shipping a separated stem.",
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
    "processed_url": "https://storage.googleapis.com/playmusicprompts-content/music/mastered_11632ce915aa42b3b0f15629541ae4f9.wav",
    "processed_gcs_uri": "gs://playmusicprompts-content/music/mastered_11632ce915aa42b3b0f15629541ae4f9.wav",
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

Complete PER intelligibility gate output for a sung request; `null` for instrumental. Every field
is described in `05-lyrics-and-singing.md`.

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
2. **Requested, running in background**:
   ```json
   {
       "status": "pending",
       "measured": false,
       "poll": "/v1/music/originality/<request_id>",
       "note": "the optional originality gate is computing in the background"
   }
   ```
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
- For the legacy bootstrap key it collapses to `{"note": "legacy bootstrap key, unlimited"}`.

## Nullability quick reference

| Field | May be null? | When |
|-------|--------------|------|
| `route.delegate_reported` | No | Always present on success |
| `bindings.<param>` | Per-param | Only params you set (or a default that was inferred) appear |
| `bindings.phoneme_timeline` | Yes | Only for sung `tr` requests |
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
