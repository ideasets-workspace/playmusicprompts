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

<!-- ERROR-CATALOGUE-TABLE:BEGIN (generated from the service error catalogue — do not hand-edit) -->

| `error_code` | HTTP | Class | Meaning | Caller action | Law |
|-----|------|-------|---------|---------------|-----|
| `INVALID_REQUEST` | 400 | caller_fixable | the request failed validation against param_spec.json | read the `refused` array: it names every violated field with the allowed values for that field | the platform's validator policy — a validator that cannot refuse is not a validator; the refusal is proven live |
| `LANGUAGE_NOT_PROVEN` | 422 | caller_fixable | vocal.language exists in the registry but its measured singing/speech state does not meet the evidence level this request requires | either choose a language whose state satisfies the request, or set vocal.language_policy to prefer_proven and accept the reported fallback | a recorded platform decision — a language enters ONLY with evidence; a silent substitution is the deception class |
| `CONTENT_REFUSED` | 400 | caller_fixable | the request's text violates the platform's content policy. The response's `content_safety.refused_categories` names every policy category the text violated, in Turkish and in English. The offending words are deliberately NOT echoed back. | read `content_safety.refused_categories`, rewrite the named categories out of your text, and resend. If `content_safety.instrument_failure` is true the refusal was NOT about your text — the safety classifier was unreachable and the gate fails closed by design; retry. | an operator decision, verbatim: 'şarkı sözlerinde kesinlikle şiddet, kadına şiddet, siyaset, politika, dünyadaki gerçek insan ve liderlein isimleri, pedofili, tehlikeli şeyler geçmemesi lazım'. Enforced against the seven categories declared in the service's internal data/content_policy.json. This gate exists because Google's own prompt-side filter covers only PROHIBITED_CONTENT ('usually CSAM') and its configurable harm categories are documented as 'only available for response filtering, not prompt filtering' — so six of the seven categories had no enforcement anywhere before it. |
| `GENERATION_FAILED` | 502 | upstream | the delegated Lyria worker returned success=false | the delegate's own error is passed through verbatim in `error`; a model refusal is terminal and is not retried | the platform's no-hidden-retry policy — a model refusal is terminal; hidden retries are banned |
| `VENDOR_CONTENT_BLOCKED` | 422 | vendor_refusal | the generation vendor (Vertex AI, Lyria) answered the generation call with HTTP 400 `content_blocked` — its policy declined to generate for this prompt on this call. Nothing was generated and Lyria did not bill the refused call. The response's `vendor_refusal` block carries the vendor's own status, code and message verbatim, the model, and `retried_by_service: false`. | read `vendor_refusal.message`; rewrite the prompt if it names a policy concern. The refusal is MEASURED to be per-call, not per-prompt (D-MUS122-61: four byte-identical bodies returned 200, 200, 200, content_blocked), so a single resend of an unchanged prompt is a legitimate caller decision — the service itself never retries (Clause 22). A multi-take request refused on a LATER take still delivers the takes already generated, with `generation_shortfall.error_code: VENDOR_CONTENT_BLOCKED`. | the platform's no-hidden-retry policy (no hidden retry) and CLAUSE 26 (bad news named, never disguised): a policy refusal reported as 502 told the caller a gateway had failed; the vendor's own code now travels typed. HTTP 422 per RFC 9110 §15.5.21 — the request was syntactically valid and understood, its contained instructions could not be processed; 400 would collide with INVALID_REQUEST (a validation failure that names a field) and 5xx would claim a fault on our side that did not occur |
| `MEASUREMENT_FAILED` | 502 | upstream | audio was returned but could not be measured | treat as no delivery; nothing is charged as delivered | the platform's measurement policy — a delivery claim without a measurement is refused rather than reported |
| `RENDER_FAILED` | 500 | ours | the audio was generated and measured, but a requested render stage (conform, master, post-edit or export) failed in our ffmpeg chain, so the file the caller asked for could not be produced. Until 2026-09-04 this case returned 200 with whatever file the last successful stage left, labelled inside render_plan — a delivery of the wrong file. | retry; not caller-fixable. The generated take is named in `error` by its gs:// URI so nothing paid is hidden. | the platform's measurement policy — format and duration are delivery criteria measured on the file; a file that misses a requested criterion is refused, never delivered as if it met it. The `export` binding is 'enforced' (param_spec.json). |
| `CONFIG_ERROR` | 500 | ours | a deploy-time environment variable is absent | none — this is our deployment defect and is reported as such | fail loud, never fail open — an absent config that defaults silently is the amateurish-construction class |
| `INTERNAL_ERROR` | 500 | ours | an unexpected exception reached the handler boundary | none — retry is safe only if the caller's request was idempotent; the traceback is logged, never returned | error handling at a system boundary is mandatory (a platform policy, named by name) |
| `BUDGET_EXHAUSTED` | 503 | ours | the request's remaining Cloud Run time budget could not cover the next stage plus the sourced reserves of the stages after it, so the stage was refused BEFORE any paid call | retry later or with a shorter target duration; nothing was generated and nothing was billed for the refused stage. The response's `budget` block shows total, elapsed, remaining and every stage's measured time | the platform's no-hidden-retry policy (no spend the pipeline cannot finish) and the frontier engineering law (no stage timeout typed from an agent's head — the service's request_budget stage derives every stage's time from the revision's own template.timeout; contract the service's internal data/request_budget.json) |
| `UNAUTHENTICATED` | 401 | caller_fixable | no x-api-key header, an unknown key, or a disabled key — the request could not be attributed to an account | send a valid, enabled key in the x-api-key header (the Cloud Run identity token is the first layer, the key the second — see 02-authentication.md) | music-17 — two-layer authentication; a request without an attributable account is refused before any parameter is read |
| `FORBIDDEN_SCOPE` | 403 | caller_fixable | the key is valid and enabled but does not carry the scope this endpoint requires | use a key minted with the required scope (music:generate for POST /v1/music); scopes are fixed at mint time and are not changed by the caller | music-17 — scope is authorization, distinct from authentication; the two refusals are distinguishable by status and code |
| `RATE_LIMITED` | 429 | caller_fixable | the key is valid and authorized but over its per-minute rate or its daily quota (every key is capped at 100/day — an operator decision) | read auth.limit: reset_seconds for the per-minute window, or resets='next UTC day' for the daily quota; nothing was generated and nothing was billed. GET /v1/music/jobs/{job_id} polls are not counted | music-17 — per-key rate and daily quota are enforced atomically in GCS (generation-match); MAX_DAILY_QUOTA_CEILING=100 is the owner's ceiling, never raised by a caller |

13 codes — the same closed set `error_surface.ErrorCode` asserts against this file at import time.

<!-- ERROR-CATALOGUE-TABLE:END -->

> Until 2026-09-06 this table was hand-written and had drifted from the catalogue (it listed 7 codes; the service
> carried 9 — `RENDER_FAILED` since 2026-09-04 and `BUDGET_EXHAUSTED` since 2026-09-06 were missing). It is now
> rendered from `error_catalogue.json` by an internal operator script, and `--check` fails when it drifts.

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

## `CONTENT_REFUSED` in detail

The request's text violated the content policy. Eight categories are enforced — violence, violence
against women, politics, real people's names, child sexual content, dangerous acts, heavy obscenity, hate
speech — and
the gate runs at **stage 0**, before validation and before any billable call.

```json
{
  "success": false,
  "error_code": "CONTENT_REFUSED",
  "error_class": "caller_fixable",
  "request_id": "…",
  "content_safety": {
    "allowed": false,
    "refused_categories": [
      { "id": "real_people", "tr": "Gerçek kişi ve lider isimleri", "en": "Real people and leaders" }
    ],
    "reason": "the text names a real public figure",
    "fields_checked": ["prompt", "lyrics.text"],
    "layers_run": ["term_list (46 patterns, 0 hit)", "classifier (gemini-2.5-flash)"],
    "instrument_failure": false,
    "policy": "the service's internal data/content_policy.json"
  }
}
```

Three properties of this response that affect how you handle it:

1. **Nothing was generated or charged.** The gate precedes the generation call, so a
   `CONTENT_REFUSED` response carries no `tracks`, no `prompt_sent` and no `render_plan`.
2. **It wins over a validation error.** A request that is both malformed *and* forbidden returns
   `CONTENT_REFUSED`. Reporting a range violation while accepting a forbidden lyric would answer the
   trivial fault and ignore the serious one.
3. **`instrument_failure: true` is a different situation.** It means the classifier was unreachable,
   not that your text was refused; `refused_categories` is then empty. Retry with backoff, and do not
   tell the user their lyric was rejected.

Present `refused_categories` to your user (each entry carries a `tr` and an `en` label); `reason` is
written for a developer reading a log. The offending words never appear anywhere in the response, by
design — see [16 — Content policy](16-content-policy.md) for the full category list, the 29 checked
fields, and the reason each of the four unchecked fields is exempt.

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
(`gs://playmusicprompts-music-studio/music/<request_id>*`) and running `ffprobe` locally.

## `RENDER_FAILED` in detail

A render stage you REQUESTED (conform, master, post-edit, export) failed after a successful generation. The service
refuses rather than handing you the last successful stage's file under the name of the one you asked for (Mandate
Clause 16 — a label is never a substitute for the file). The paid take exists in GCS and is named in `error`.

```json
{
    "success": false,
    "error": "requested stage 'master' failed: <ffmpeg stderr head>; the generated take is at gs://…",
    "error_code": "RENDER_FAILED",
    "error_class": "ours",
    "caller_action": "retry; if it recurs for the same request, file an incident with the request_id — the generation is not re-billed by a retry of the render"
}
```

## `BUDGET_EXHAUSTED` in detail

Every delivery runs inside one Cloud Run request, and the revision's request timeout is the hard wall. Before each paid
stage the service checks that the time left can cover that stage **plus** the reserves the later stages need (separator,
ASR, mastering, upload, measurement, webhook). If it cannot, the stage is refused BEFORE any call is made — you are never
billed for a generation the platform would then cut off mid-mastering.

```json
{
    "success": false,
    "error": "stage 'lyria_generate' refused before spend: 412.0 s of the 3600 s request budget remain and the stages after it reserve 894 s (source of the total: cloud_run_admin_api_v2.template.timeout)",
    "error_code": "BUDGET_EXHAUSTED",
    "error_class": "ours",
    "caller_action": "retry later or with a shorter target duration; nothing was generated and nothing was billed for the refused stage. The response's `budget` block shows total, elapsed, remaining and every stage's measured time"
}
```

Every successful response also carries a `budget` block — `total_seconds`, `elapsed_seconds`, `remaining_seconds` and a
`stages[]` list with each stage's timeout and measured elapsed time — so a slow delivery can be read stage by stage.

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
