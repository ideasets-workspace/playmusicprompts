# 07 · Error Catalogue

Every failure the service can emit, with the exact HTTP status, the exact `error_code` and
`caller_action`, and — where relevant — the law behind the refusal. Source of truth:
the service's versioned error catalogue. The service asserts at import
time that the catalogue and the `ErrorCode` enum describe the same closed set; drift fails the
container at boot.

## Error envelope shape

Every non-200 response body is:

```json
{
    "success": false,
    "error": "<one-line human-readable reason>",
    "error_code": "<catalogue code>",
    "error_code_meaning": "<one-line semantic from the catalogue>",
    "error_class": "caller_fixable | ours | upstream",
    "caller_action": "<what the caller should do>",
    "request_id": "<uuid4>",
    "refused": ["<name-and-reason for each violated field>"]
}
```

`error_class` is the operational hint:

- **`caller_fixable`** — the request body is wrong; change it and retry (4xx status)
- **`upstream`** — Vertex or another delegate refused; not our defect, and the model refusal is
  **terminal** (the platform's no-hidden-retry policy — no hidden retries)
- **`ours`** — a deployment or code fault on our side; file an incident, do not retry blindly

## Every code

| `error_code` | HTTP | Class | Meaning | Caller action | Law |
|-----|------|-------|---------|---------------|-----|
| `INVALID_REQUEST` | 400 | caller_fixable | The request failed validation against `param_spec.json` | Read the `refused` array: it names every violated field with the allowed values for that field | the platform's validator policy |
| `LANGUAGE_NOT_PROVEN` | 400 | caller_fixable | `vocal.language` exists in the registry but its measured singing state does not meet what this request requires (returned as an `INVALID_REQUEST`-shaped 400, not a 422 — measured 2026-09-01) | Either choose a language whose state satisfies the request, or set `vocal.language_policy: prefer_proven` and accept the reported fallback | a recorded platform decision |
| `GENERATION_FAILED` | 502 | upstream | The delegated Vertex Lyria call returned `success:false` | The delegate's error is passed through verbatim in `error`; a model refusal is terminal and is not retried | the platform's no-hidden-retry policy |
| `MEASUREMENT_FAILED` | 502 | upstream | Audio was returned but ffprobe could not measure it | Treat as no delivery; nothing is charged as delivered | the platform's measurement policy |
| `CONFIG_ERROR` | 500 | ours | A deploy-time environment variable is absent | None — this is our deployment defect, file an incident | fail loud, never fail open |
| `INTERNAL_ERROR` | 500 | ours | An unexpected exception reached the handler boundary | None — retry is safe only if your request was idempotent; the traceback is logged, never returned | a platform policy |

## Auth-layer statuses (before the catalogue applies)

Auth failures are handled BEFORE the request body is parsed and use a smaller envelope. They are
listed here for completeness; the full model is in `02-authentication.md`.

| Status | Cause | Body |
|--------|-------|------|
| 401 | Missing / invalid Cloud Run identity token | Google HTML page (not JSON) — the app was never reached |
| 401 | Missing `x-api-key` header | `{"success":false,"error":"missing x-api-key header","request_id":"...","auth":{...}}` |
| 401 | Unknown key hash | `{"success":false,"error":"unknown API key","request_id":"...","auth":{...}}` |
| 401 | Key disabled | `{"success":false,"error":"API key is disabled","request_id":"...","auth":{...}}` |
| 403 | Key lacks scope `music:generate` | `{"success":false,"error":"API key lacks the required scope 'music:generate'","request_id":"...","auth":{...}}` |
| 403 | Auth store IO error (fail-CLOSED) | `{"success":false,"error":"authorization store unavailable: <ExcClass>","request_id":"...","auth":{...}}` |
| 429 | Rate limit exceeded | `{"success":false,"error":"rate limit exceeded (<N>/min)","auth":{"limit":{"rate_per_min":N,"reset_seconds":<s>}}}` |
| 429 | Daily quota exceeded | `{"success":false,"error":"daily quota exceeded (<N>/day)","auth":{"limit":{"daily_quota":N,"resets":"next UTC day"}}}` |

## `INVALID_REQUEST` — the caller-fixable class in detail

`INVALID_REQUEST` is the code most integrations meet first. The `refused` array is the primary
diagnostic; each entry names the field and either the allowed values or the constraint it violated.

### Unknown field

Request:
```json
{"prompt":"test","duration_seconds":30}
```

Response (verbatim shape):
```json
{
    "success": false,
    "error": "unknown field(s) ['duration_seconds'] refused; this endpoint accepts exactly: ['adlibs','arrangement_ai',...]",
    "error_code": "INVALID_REQUEST",
    "error_class": "caller_fixable",
    "caller_action": "read the `refused` array: it names every violated field with the allowed values for that field",
    "refused": ["unknown field(s) ['duration_seconds'] refused; this endpoint accepts exactly: [...]"]
}
```

Fix: rename to `duration` and use the correct object shape (`{"target_seconds": 30}`).

### Wrong shape

Request:
```json
{"prompt":"test","duration":30}
```

The current service surfaces this as a `500 INTERNAL_ERROR` when the type-check misses. This is a
KNOWN GAP tracked as an operator follow-up and will be tightened to a `400 INVALID_REQUEST` with the
exact violated shape. Documented here so integrations can validate types before calling.

### Missing required field

Request:
```json
{}
```

Response:
```json
{
    "success": false,
    "error": "prompt is required",
    "error_code": "INVALID_REQUEST",
    "error_class": "caller_fixable",
    "caller_action": "read the `refused` array: ...",
    "refused": ["prompt: required"]
}
```

### Predefined value violated

Request:
```json
{"prompt":"test","route":"gpt-4"}
```

Response:
```json
{
    "success": false,
    "error": "route 'gpt-4' not allowed; must be one of ['auto','lyria-3-pro-preview','lyria-3-clip-preview','lyria-002']",
    "error_code": "INVALID_REQUEST",
    "error_class": "caller_fixable",
    "refused": ["route: value 'gpt-4' not in allowed set"]
}
```

### Range violated

Request:
```json
{"prompt":"test","seed":-1}
```

Response:
```json
{
    "success": false,
    "error": "seed must be a non-negative integer",
    "error_code": "INVALID_REQUEST",
    "error_class": "caller_fixable",
    "refused": ["seed: value -1 < min 0"]
}
```

### `active_when` contract violated

Request:
```json
{"prompt":"test","variation_count":3}
```

`variation_count` is only active when `output_package = variations`:

```json
{
    "success": false,
    "error": "variation_count is only active when output_package = 'variations'",
    "error_code": "INVALID_REQUEST",
    "error_class": "caller_fixable",
    "refused": ["variation_count: not active for output_package=<default>"]
}
```

## `LANGUAGE_NOT_PROVEN` in detail

Sung request in a language whose `singing` state is `NOT_MEASURED`:

Request:
```json
{
    "prompt": "test",
    "vocal": {"mode": "male", "language": "tr", "language_policy": "strict"},
    "lyrics": {"mode": "custom", "text": "test"}
}
```

Response:
```json
{
    "success": false,
    "error": "vocal.language 'tr' is NOT_MEASURED for singing; language_policy=strict refuses the fallback",
    "error_code": "LANGUAGE_NOT_PROVEN",
    "error_code_meaning": "vocal.language exists in the registry but its measured singing/speech state does not meet the evidence level this request requires",
    "error_class": "caller_fixable",
    "caller_action": "either choose a language whose state satisfies the request, or set vocal.language_policy to prefer_proven and accept the reported fallback",
    "refused": ["vocal.language: 'tr' not SINGING_PROVEN; the corpus is CC BY-NC-ND (a recorded platform decision)"]
}
```

Fix: switch to `en` (the only `SINGING_PROVEN` language today) or set
`vocal.language_policy: prefer_proven`.

## `GENERATION_FAILED` in detail

Vertex Lyria returned an error. The delegate's own message is passed through verbatim.

```json
{
    "success": false,
    "error": "Vertex Lyria returned status 400: 'The prompt was blocked by content filters'",
    "error_code": "GENERATION_FAILED",
    "error_class": "upstream",
    "caller_action": "the delegate's own error is passed through verbatim in `error`; a model refusal is terminal and is not retried"
}
```

**A model refusal is terminal** — retrying the SAME request with the SAME prompt will meet the same
refusal. Change the prompt (e.g. tone down flagged language) and try again.

## `MEASUREMENT_FAILED` in detail

Rare. Lyria returned audio bytes but `ffprobe` could not parse the container. The caller sees:

```json
{
    "success": false,
    "error": "ffprobe returned exit 1 on the delivered file",
    "error_code": "MEASUREMENT_FAILED",
    "error_class": "upstream",
    "caller_action": "treat as no delivery; nothing is charged as delivered"
}
```

Nothing is billed as delivered. The operator investigates by pulling the file from GCS
(`gs://playmusicprompts-content/music/<request_id>*`) and running `ffprobe` locally.

## `CONFIG_ERROR` in detail

Only seen during a broken deploy. If you see this in production, file an incident immediately.

```json
{
    "success": false,
    "error": "GCS_BUCKET env var is required and unset",
    "error_code": "CONFIG_ERROR",
    "error_class": "ours",
    "caller_action": "none — this is our deployment defect and is reported as such"
}
```

## `INTERNAL_ERROR` in detail

Any uncaught exception at the boundary. The response body carries a generic message; the traceback
is in Cloud Logging under `logName ~ /cloud_run_revision/music-api/`.

```json
{
    "success": false,
    "error": "internal error: <ExceptionClassName>",
    "error_code": "INTERNAL_ERROR",
    "error_class": "ours",
    "caller_action": "none — retry is safe only if the caller's request was idempotent; the traceback is logged, never returned"
}
```

**When retry is safe**: if your request is idempotent (i.e. calling it twice does not double-bill
or double-create anything on your side), retrying with the same body up to 3 times with exponential
backoff (2 s, 8 s, 32 s) is reasonable. Beyond 3 retries, file an incident.

## What "terminal" means

the platform's no-hidden-retry policy, in one sentence: **a model refusal is terminal — redrawing it is guaranteed
waste; hidden retries are banned.** If the SAME prompt refused, the same prompt will refuse again.
The service does NOT retry Vertex on `GENERATION_FAILED`. If your integration retries automatically
you MUST first change something material about the request; otherwise you are throwing money away.

## Debugging with `request_id`

Every response — success or error — carries a `request_id`. To debug:

1. Save the `request_id` in your client logs.
2. Ask the operator for the container log line matching that id:
   ```bash
   gcloud logging read \
       --project=playmusicprompts \
       --limit=50 \
       'resource.type="cloud_run_revision" resource.labels.service_name="music-api" AND textPayload:"<request_id>"'
   ```
3. The log shows the full validation path, the compiled prompt, the Vertex call, and — for a sung
   request — the separator and ASR steps.

## Error handling checklist for integrators

- [ ] Catch and display all four `caller_fixable` codes with the `refused` array visible to the
      developer console (not the end-user); show a user-friendly summary to the end-user.
- [ ] Treat `upstream` codes as end-user-visible ("we could not generate music for this prompt")
      but do NOT auto-retry the same prompt.
- [ ] Treat `ours` codes (500, 502) as end-user-visible ("something on our side broke") and file
      an operator ticket automatically with the `request_id`.
- [ ] Never expose the raw `error_code` string in end-user copy; map it to your own localised
      messages.
- [ ] Log every response's `request_id` at minimum, and consider `route.model` + `measured.duration_seconds`
      for later correlation with billing.

## Not-a-defect responses

Some responses look like defects but are honest reporting of a limitation, not an error:

- `lyrics_verification.measured = false` with a `reason` — the gate could not measure something
  (e.g. no calibrated bar for a non-`en` language); this is HONEST STATE, not a defect.
- `mix_plan.refusals[]` — a role you might have asked for that the platform cannot lawfully ship;
  the refusal names the exact law, and `what_would_unblock_it` names the exact action.
- `aligner_priors.status = NO_LAWFUL_ALIGNER` — every aligner candidate is licence-blocked; the
  gate reports this honestly rather than using an off-the-shelf MFA which is measured to be worse.

None of these are errors and none of them turn `success` to `false`.
