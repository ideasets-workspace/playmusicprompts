# 03 · Endpoints Reference

Every HTTP surface the service exposes, with the exact contract, status codes, and — where a live
probe is available — the verbatim response captured this session. Endpoints marked
`live-verified 2026-09-01` were called against the running production service in the same session
this document was written; endpoints marked `code-verified 2026-09-01` were read from the running
container's source (`the service's internal main.py`) but not called this session.

Source of truth: `the service's internal main.py` at commit HEAD of Cloud Run revision `music-api-00025-2hc`.

## Base URL

```
https://music-api-636636169989.us-central1.run.app
```

- Region: `us-central1` (Cloud Run auto-suffixed hostname)
- TLS: managed certificate on `.run.app`
- Anonymous requests to any path are refused by Cloud Run IAM with a 403 HTML page BEFORE reaching
  the container (Organization Policy `iam.allowedPolicyMemberDomains` on ideasets.com).

## Endpoint index

| Path | Method | Auth | Purpose | Verification |
|------|--------|------|---------|--------------|
| `/health` | GET | Cloud Run identity token | Liveness probe | live-verified 2026-09-01 |
| `/v1/music/capabilities` | GET | Cloud Run identity token + `x-api-key` | Discover the full parameter surface | live-verified 2026-09-01 |
| `/v1/music` | POST | Cloud Run identity token + `x-api-key` | Generate + deliver a music track | live-verified 2026-09-01 (250.6 s sung, 30.8 s instrumental, HTTP 200) |
| `/v1/music/delivery-url` | POST | Cloud Run identity token + `x-api-key` | Mint a fresh signed URL for an already-delivered file, free, no generation | added 2026-09-01 |
| `/v1/music/originality/{request_id}` | GET | Cloud Run identity token + `x-api-key` | Poll a background originality verdict | live-verified 2026-09-01 (404 branch) |

Reserved paths NOT served by this container (Google Front End answers with its own 404 before
reaching the app):

- `/healthz` — reserved by Google Cloud Run infrastructure, do NOT use for liveness

## GET `/health`

Liveness + boot-sanity probe. The container proves it loaded the parameter spec (fail-loud on a
truncated contract) and that ffmpeg is on PATH.

### Request

```http
GET /health HTTP/1.1
Authorization: Bearer <id-token>
```

No body, no other headers required.

### Response (200 OK)

```json
{
    "ok": true,
    "params": 101,
    "ffmpeg": true,
    "version": "2.0-cloudrun"
}
```

Field contract:

| Field | Type | Meaning |
|-------|------|---------|
| `ok` | boolean | Always `true` on a successful 200; a false value is never returned |
| `params` | integer | Number of parameters loaded from the service's versioned parameter specification; MUST equal 101 |
| `ffmpeg` | boolean | `true` iff `ffmpeg` and `ffprobe` are on PATH inside the container |
| `version` | string | Semantic build tag from `main.py` FastAPI init |

If the container is unhealthy Cloud Run's own startup probes have already prevented traffic from
reaching it, so `/health` returning anything other than 200 with `ok:true` is by construction a
container-boot bug, not a runtime state.

## GET `/v1/music/capabilities`

Returns the complete discoverable parameter surface. This is the SAME spec the validator uses on
`POST /v1/music` — a capability listed here is a generation-proven, real field (a platform policy),
never a schema label.

### Request

```http
GET /v1/music/capabilities HTTP/1.1
Authorization: Bearer <id-token>
x-api-key: pmp_<key>
```

Alternative: `POST /v1/music` with body `{"capabilities": true}` returns the same payload; use
whichever your caller finds easier.

### Response (200 OK) — abridged shape

```json
{
    "success": true,
    "request_id": "<uuid4>",
    "parameters": [
        {
            "name": "prompt",
            "binding": "typed",
            "control": "text",
            "constraints": {"max_length": 5000},
            "required": true
        },
        {
            "name": "vocal",
            "binding": "prose",
            "control": "combo",
            "values": [
                {"id": "instrumental", "label": "Instrumental (no vocals)"},
                {"id": "male", "label": "Male voice"},
                {"id": "female", "label": "Female voice"},
                {"id": "duet", "label": "Duet"},
                {"id": "choir", "label": "Choir"},
                {"id": "spoken", "label": "Spoken word"}
            ]
        }
        // ...99 more entries — full detail in 04-request-body-full.md
    ],
    "engines": {
        "route_options": ["auto", "lyria-3-pro-preview", "lyria-3-clip-preview", "lyria-002"],
        "default_route": "auto"
    },
    "vocabularies": {
        "genres": 2196,
        "moods": 114,
        "instruments": 1057,
        "eras": 14
    },
    "languages": {
        "supported": ["en", "tr", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"],
        "singing_proven": ["en"],
        "coverage_scores": {
            "en": 0.4681, "tr": 0.6232, "zh": 0.3086, "ja": 0.6275,
            "ko": 0.3908, "ru": 0.4179, "es": 0.4878, "fr": 0.5893,
            "de": 0.7586, "it": 0.4938, "pt": 0.4022
        }
    }
}
```

Field contract:

| Field | Type | Meaning |
|-------|------|---------|
| `parameters[]` | list | One entry per parameter, with `binding` (typed/prose/enforced/compiled/our_stage/response_field/client_side), `control` (text/combo/slider/toggle/chips/multi-select/upload/radar/envelope), and either an explicit `values[]` list or `constraints` for free-form fields |
| `engines.route_options` | list | The exact set of `route` values accepted on `POST /v1/music` |
| `vocabularies` | map | Live-loaded vocabulary sizes from `data/*_vocabulary.json` |
| `languages.singing_proven` | list | Language codes with a calibrated PER bar (only `en` today) |
| `languages.coverage_scores` | map | PHOIBLE-based phoneme coverage score per language, absolute number, 0.0-1.0 |

The full parameter reference is `04-request-body-full.md`; the coverage-score research is in
the service's internal research documentation (available from the API operator on request).

## POST `/v1/music`

The single generation endpoint. Accepts a parameter body, delegates to Vertex AI Lyria, conforms
and masters the delivered audio, and — for sung requests — separates the vocal stem and scores
intelligibility. Runs synchronously for the delivery; the optional originality gate (when opted in)
runs in a background thread and is polled via `/v1/music/originality/{request_id}`.

### Request

```http
POST /v1/music HTTP/1.1
Authorization: Bearer <id-token>
x-api-key: pmp_<key>
Content-Type: application/json
```

Body: a JSON object. The only field required is `prompt`. Every other field is optional; every
unknown field is refused BY NAME (400).

Minimal instrumental request:

```json
{
    "prompt": "warm cinematic piano and cello, slow rise",
    "vocal": {"mode": "instrumental"},
    "duration": {"target_seconds": 30, "tolerance_seconds": 2, "on_miss": "conform"}
}
```

Sung request with custom lyrics:

```json
{
    "prompt": "warm folk ballad, acoustic guitar and gentle piano, medium tempo",
    "duration": {"target_seconds": 30, "tolerance_seconds": 2, "on_miss": "conform"},
    "lyrics": {
        "mode": "custom",
        "text": "We rise where the morning breaks, we walk the road together, holding on through every season"
    },
    "vocal": {"mode": "male", "language": "en"}
}
```

Full field reference: `04-request-body-full.md`. Vocal + lyric deep dive: `05-lyrics-and-singing.md`.

### Response (200 OK) — top-level shape

Verbatim from the 2026-09-01 08:47 live proof (an internal evidence artefact):

```json
{
    "success": true,
    "request_id": "7decbad8-2918-4c80-b658-248d6e7ac14e",
    "endpoint": "playmusicprompts-music-api",
    "route": {
        "model": "lyria-3-pro-preview",
        "why": "vocals/lyrics requested: lyria-3-pro is the only surface measured to sing dictated words",
        "delegate_reported": {"surface": "interactions", "model": "lyria-3-pro-preview"}
    },
    "prompt_sent": "The piece is approximately 30 seconds long, continuous from beginning to end. warm folk ballad, acoustic guitar and gentle piano, medium tempo Vocal style: a male voice, singing in en. The singer sings these exact words, slowly and clearly: \"We rise where the morning breaks, we walk the road together, holding on through every season\".",
    "bindings": { "...": "per-parameter binding report" },
    "measured": {
        "duration_seconds": 143.752,
        "duration_measured": true,
        "codec": "mp3",
        "sample_rate": "44100",
        "channels": 2
    },
    "takes_delivered": 1,
    "tracks": [
        {
            "public_url": "https://storage.googleapis.com/playmusicprompts-content/music/lyria_20260901_084334_7decbad8_t0.mp3",
            "gcs_uri":    "gs://playmusicprompts-content/music/lyria_20260901_084334_7decbad8_t0.mp3",
            "take": 1
        }
    ],
    "language_fallback": null,
    "mix_plan": { "...": "A7 two-path mix plan with layers + refusals" },
    "render_plan": { "...": "conform + master stages with measured verification" },
    "lyrics_verification": { "...": "sung PER gate output; null for instrumental" },
    "originality_gate": {
        "measured": false,
        "opt_in": true,
        "reason": "the optional originality gate is opt-in (set run_originality_gate: true)."
    },
    "spend_note": "1 generation call(s), one per take, no retry (Clause 22)",
    "auth": {
        "account_id": "legacy",
        "key_id": "legacy",
        "limit": {"note": "legacy bootstrap key, unlimited"}
    }
}
```

Full field-by-field detail: `06-response-envelope.md`.

Elapsed times observed in the current session:

| Request class | Median | Range | Bottleneck |
|---------------|--------|-------|------------|
| Instrumental, no lyric gate | ~110 s | 95 - 145 s | Lyria generation + conform + master |
| Sung EN + PER gate | ~250 s | 230 - 280 s | Add separate (~12 s L4) + ASR (~30 s) + PER (~1 s) |
| Sung EN + `run_originality_gate:true` | ~250 s (same; gate runs in background) | | Same as above; gate verdict poll ~2 min |

### Error responses

Every error response follows the envelope described in `07-error-catalogue.md`:

```json
{
    "success": false,
    "error": "<human-readable reason>",
    "error_code": "<catalogue code>",
    "error_code_meaning": "<one-line semantic>",
    "error_class": "caller_fixable | ours | infrastructure",
    "caller_action": "<what the caller should do>",
    "request_id": "<uuid4>",
    "refused": ["<name-and-reason for each refused field>"]
}
```

Live-observed examples from the current session:

**400 INVALID_REQUEST — unknown fields**

Sending `duration_seconds` (correct name is `duration.target_seconds`):

```json
{
    "success": false,
    "error": "unknown field(s) ['custom_lyrics','duration_seconds','language','run_lyric_gate'] refused; this endpoint accepts exactly: ['adlibs','arrangement_ai',...]",
    "error_code": "INVALID_REQUEST",
    "error_code_meaning": "the request failed validation against param_spec.json",
    "error_class": "caller_fixable",
    "caller_action": "read the `refused` array: it names every violated field with the allowed values for that field",
    "request_id": "1ba8c8f3-4694-47cf-b38e-56494120d7fd",
    "refused": ["unknown field(s) [...] refused; ..."]
}
```

**400 INVALID_REQUEST — wrong shape**

Sending `duration: 30` (should be `{"target_seconds": 30}`):

```
Server-side traceback in the container log:
    File "/app/the service's internal planner.py", line 110, in choose_route
        target = ((req.get("duration") or {}).get("target_seconds")) or 135
    AttributeError: 'int' object has no attribute 'get'
Response 500 INTERNAL_ERROR from the boundary handler.
```

This case will be tightened to a 400 in a follow-up (the boundary should surface it as a
`caller_fixable` error). Documented here so an integration can guard against it.

**500 INTERNAL_ERROR**

Any uncaught exception at the handler boundary. The body carries `error_code: INTERNAL_ERROR`
and `caller_action: "none — retry is safe only if the caller's request was idempotent; the
traceback is logged, never returned"`. Retry with the SAME request body is safe only when your
request itself is idempotent (e.g. it does not attempt to charge a wallet twice).

## GET `/v1/music/originality/{request_id}`

Polls the verdict of a the optional originality gate that was requested on a delivery
(`run_originality_gate: true` on the `POST /v1/music` body). The gate is a background job that
takes ~2 minutes to compute; this endpoint returns pending / complete / failed with the exact
verdict data when available.

### Request

```http
GET /v1/music/originality/{request_id} HTTP/1.1
Authorization: Bearer <id-token>
x-api-key: pmp_<key>
```

### Response

**200 pending**:

```json
{
    "success": true,
    "status": "pending",
    "measured": false,
    "started_at": "2026-09-01T09:00:00Z",
    "takes": 1
}
```

**200 complete**:

```json
{
    "success": true,
    "status": "complete",
    "verdict": {
        "measured": true,
        "bars_status": "NOT_CALIBRATED",
        "axis1_monotony": {
            "measured": true,
            "structureness_indicator": 0.183,
            "tempogram_cyclic": 0.412,
            "tile_rule_pass": true
        },
        "axis2_similarity": {
            "measured": false,
            "reason": "only one take delivered; between-take carbon-copy needs >=2"
        }
    }
}
```

**200 failed**:

```json
{
    "success": true,
    "status": "failed",
    "reason": "ImportError: librosa not installed"
}
```

**404 no record**:

```json
{
    "success": false,
    "request_id": "<id>",
    "error": "no originality record — the gate was not requested for this request_id (set run_originality_gate:true on the delivery), or the id is unknown"
}
```

**502 store IO error**:

```json
{
    "success": false,
    "request_id": "<id>",
    "error": "could not read the originality record: <ExcClass>"
}
```

Full gate documentation: `12-originality-gate.md`.

## Not-served endpoints (reserved by Google, do NOT use)

- `/healthz` — reserved by Google Front End; will 404 before reaching the container. Use `/health`.

## Rate limit response headers

There are no rate-limit response headers today. The rate/quota state is returned INLINE in the
`auth` block of every 200 response and in the `limit` block of every 429 response body. If you need
proactive backoff, read `auth.limit.used_today` after each success and stop at `daily_quota - 1`.
