# PlayMusicPrompts Production API — `api.PlayMusicPrompts.com`

**Status:** LIVE and end-to-end proven on the real domain. **Last verified:** 2026-08-19 12:48 (UTC+3),
this session, over HTTPS against the production hostname (not a staging alias).

**What this document is:** the complete reference for the public-facing API that fronts the
PlayMusicPrompts music engine — its domain, transport, authentication, endpoints, envelopes, error
catalogue and current infrastructure topology. It does NOT repeat the full 35-parameter / 3,561-value
music-generation contract, which is a separate document (see [§9](#9-where-the-parameter-contract-lives)
below) and would drift out of sync with this file if duplicated by hand — the parameter contract has its
own single source of truth (`generate_music_hybrid_model/music_studio/param_spec.json`) and this document
points to it rather than copying it.

**Product context:** this API is the production entry point for **PlayMusicPrompts** — the prompt-to-music
intelligence engine described in full in
[`C:\Berk\PlayMusicPrompts\AGENTS.md`](../AGENTS.md) and
[`C:\Berk\PlayMusicPrompts\Brainstorming\ChatGPT-MusicHybridModel\conversation.md`](../Brainstorming/ChatGPT-MusicHybridModel/conversation.md).
The engine underneath this API is the "Deep Inspector" layer of that vision — the existing 34/35-control
Music Studio surface, exposed at the most advanced level today, with the Music Intent Graph / Living
Score layers to be built on top of it in later phases.

---

## 1. Base URL and environments

| Environment | Base URL | Notes |
|---|---|---|
| **Production** | `https://api.playmusicprompts.com` | The only environment that exists today. Custom domain in API Gateway, REGIONAL endpoint type, TLS 1.2 minimum. |
| Direct (bypass custom domain) | `https://dby89fga2h.execute-api.eu-central-1.amazonaws.com/prod` | The underlying REST API's own invoke URL. Works identically; kept as a fallback if DNS to the custom domain is ever unavailable. |

There is currently **one stage** (`prod`) and **no separate staging/sandbox API** — every request against
either URL above reaches the same live engine and can incur real cost (see [§6](#6-cost-and-rate-limits)).

## 2. Transport and TLS

- **Protocol:** HTTPS only. There is no plaintext HTTP listener; API Gateway REGIONAL custom domains do
  not offer one.
- **Certificate:** AWS Certificate Manager, DNS-validated, `RSA_2048`, issued 2026-08-19 for the exact
  name `api.playmusicprompts.com` (ARN and issuance timeline recorded in
  `C:\Berk\PlayMusicPrompts\.claude\memory\infra.md`).
- **Minimum TLS policy:** `TLS_1_2` (API Gateway's `securityPolicy` setting on the custom domain).
- **DNS:** `api.playmusicprompts.com` is a CNAME at the domain's registrar (Squarespace DNS) pointing to
  the API Gateway-issued regional target `d-fp6slqrd4h.execute-api.eu-central-1.amazonaws.com`. This
  target is specific to this custom-domain resource and would change if the custom domain were ever
  recreated.

## 3. Authentication

Every request — except `OPTIONS` preflight — requires an API key.

- **Header:** `x-api-key: <your-key>`
- **Where the key lives:** issued keys are AWS API Gateway API keys, attached to the usage plan described
  in §6. The current production key's identifier is `<REDACTED-KEY-ID>`; its VALUE is never written into any
  documentation, chat transcript or repository file — it is held only in
  `C:\Berk\PlayMusicPrompts\api-key-value.local.txt` (a local, non-versioned file) and in API Gateway
  itself. Retrieve it with:
  ```bash
  aws apigateway get-api-key --api-key <REDACTED-KEY-ID> --include-value \
    --profile futuremovies_production --region eu-central-1 --output text --query value
  ```
- **Missing or wrong key:** the API responds `403 Forbidden` with body `{"message":"Forbidden"}`. This is
  API Gateway's own key-validation response — it happens BEFORE the request reaches the engine, so no
  cost is incurred and no application-level error envelope (§8) is returned for this case.
- **Measured proof (this session, over the real domain):**

  | Case | HTTP status |
  |---|---|
  | No `x-api-key` header | `403` |
  | Wrong `x-api-key` value | `403` |
  | Correct `x-api-key` value | `200` (capabilities: `success:true`, 35 parameters returned) |

There is currently no user-facing self-service key issuance flow; keys are issued via the AWS CLI/console
by whoever operates the AWS account. Building a self-service developer portal (key issuance, per-customer
usage dashboards) is future product work, not yet started.

## 4. Endpoints

### 4.1 `GET /v1/music/capabilities`

The discoverable capability matrix — every parameter the engine accepts, its UI hints, its accepted
values (or the vocabulary file it draws from), its binding class (§5), the language registry state, and
the available generation routes. This is a **read-only, side-effect-free** call: it costs nothing, spends
no generation credit, and is meant to be called BEFORE building a generation request so a client (a UI, a
CLI, another service) never hardcodes a value the engine does not actually support.

- **Method / path:** `GET /v1/music/capabilities` (also reachable as `GET /v1/music`, or as
  `POST /v1/music` with a JSON body of exactly `{"capabilities": true}` — all three are handled by the
  same code path in the Lambda handler).
- **Auth:** API key required.
- **Request body:** none.
- **Response (200), top-level shape, measured live this session:**

  ```json
  {
    "success": true,
    "request_id": "<uuid>",
    "endpoint": "generate-music-hybrid-model",
    "schema_id": "<param_spec.json's own $schema_id>",
    "bindings_legend": { "typed": "…", "prose": "…", "enforced": "…", "compiled": "…",
                        "refused": "…", "response_field": "…", "client_side": "…" },
    "parameters": [ /* 35 parameter objects — see §4.1.1 */ ],
    "languages": { "source": "…", "entries": [ /* language registry projection */ ] },
    "routes": [
      {"id": "auto", "label": "BT-Music v2.0 (auto: the conductor picks per request)"},
      {"id": "lyria-3-pro-preview", "label": "Lyria 3 Pro (full songs, vocals; generation-proven)"},
      {"id": "lyria-3-clip-preview", "label": "Lyria 3 Clip (30 s clips)"},
      {"id": "lyria-002", "label": "Lyria 2 (instrumental only, 16-bit 48 kHz PCM; GA)"}
    ],
    "honesty": {
      "generated_from": "music_studio/param_spec.json + its imported data files, at call time",
      "note": "a binding class is a CONTRACT statement, not a capability proof; fields marked lyria_launch_probe_pending in the spec's values_origin upgrade only after a generation-proven probe (SCHEMA IS NEVER CAPABILITY)"
    }
  }
  ```

  This response is a **live projection** of `param_spec.json` and its imported vocabulary/data files — it
  is generated at call time, never cached or hand-written, so it can never drift from what the engine
  actually validates against.

#### 4.1.1 One example parameter object (verbatim, measured live)

```json
{
  "name": "project",
  "ui_control": "Project / Track Name",
  "panel": 1,
  "section": "Creative Brief",
  "control": "text",
  "binding": "client_side",
  "free_text": true,
  "fields": {
    "name": {"max_length": 120},
    "track_id": {"server_assigned": true},
    "version_note": {"max_length": 200}
  },
  "default": {"value": null, "evidence": "no default; user-named (png shows 'Odyssey Trailer Theme' as sample data, not a default)"}
}
```

Every one of the 35 parameter objects follows this shape (name, UI hints, its accepted values or
sub-fields, its binding class, and its default with the EVIDENCE for that default — never an unsourced
value). See §5 for what the `binding` field means, and the note in
[§9](#9-where-the-parameter-contract-lives) for the full parameter-by-parameter reference.

### 4.2 `POST /v1/music`

The generation endpoint. **This call costs money** — it invokes the deployed music-generation model
exactly once per request (no retries, no fallback model; see §6). Read `GET /v1/music/capabilities`
first, every time your client's cached copy might be stale, so you never submit a value the engine does
not accept.

- **Method / path:** `POST /v1/music`
- **Auth:** API key required.
- **Content-Type:** `application/json`
- **Request body:** a JSON object validated against `param_spec.json` (35 top-level parameter groups —
  project, structure, key, tempo, energy curve, instruments, vocal/lyrics, mastering target, export
  format, stems, references, controls, mood orbit, era, and more). The full field-by-field reference is
  the document linked in §9 — do not hand-maintain a second copy of it here.
- **On success (200):** the envelope in §8.1.
- **On failure:** one of the error envelopes in §8.2, with the matching HTTP status from §7.

### 4.3 `OPTIONS` (on both routes above)

CORS preflight. No API key required (a browser preflight request cannot carry a custom header). Returns
`204 No Content` with:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type,x-api-key
Access-Control-Allow-Methods: POST, GET, OPTIONS
```

## 5. Binding classes (what "accepted" actually means per field)

Every parameter in the capabilities response carries a `binding` field. This is the engine's own honesty
mechanism — Berk's standing order that no control may be accepted and silently ignored. The seven classes,
verbatim from the live `bindings_legend`:

| Class | Meaning |
|---|---|
| `typed` | the value is carried as a distinct, structured field into the generation request |
| `prose` | the value is compiled into the natural-language prompt sent to the model |
| `enforced` | the value is validated and can cause the request to be refused, but is not itself sent to the model |
| `compiled` | the value is combined with other fields (e.g. structure + energy curve) into a derived directive |
| `refused` | the field is currently rejected outright — present in the schema, not yet wired to any effect |
| `response_field` | the value only ever appears in the RESPONSE (e.g. a measured property), never in the request |
| `client_side` | the value is informational for the calling application and is never sent to the model at all |

A parameter's binding class is a **contract statement**, not proof that a generation model actually acted
on it — the response's own `honesty.note` says this explicitly. Treat `refused` fields as not-yet-working
regardless of what the UI hint suggests.

## 6. Cost and rate limits

| Control | Value | Source |
|---|---|---|
| Rate limit | 5 requests/second | usage plan `per6b3` |
| Burst limit | 10 requests | usage plan `per6b3` |
| Daily quota | 9,000 requests/day | usage plan `per6b3` |
| Quota → cost ceiling | 9,000 × the measured $0.08 per-generation unit price = **$720/day worst case**, under Berk's **$750/day** spend ceiling (order of 2026-08-10) | derived, recorded in `infra.md` |

Exceeding the rate or burst limit returns `429 Too Many Requests` from API Gateway directly (before the
request reaches the engine, so no generation cost is incurred). Exceeding the daily quota returns
`429 Too Many Requests` with a quota-specific message, also before reaching the engine.

**Every accepted `POST /v1/music` request performs exactly one paid generation call** — the endpoint
issues no retries and no fallback model on failure (Mandate Clause 22: a model refusal is terminal).

## 7. Error catalogue

Every error the engine can return, its HTTP status, its class, and what the caller should do — this table
is generated from `generate_music_hybrid_model/music_studio/data/error_catalogue.json`, the engine's own
single source of truth for error semantics (no error text is hand-typed at any raise site in the code).

| Code | HTTP status | Class | Meaning | Caller action |
|---|---|---|---|---|
| `INVALID_REQUEST` | 400 | caller-fixable | the request failed validation against `param_spec.json` | read the `refused` array: it names every violated field with the allowed values for that field |
| `LANGUAGE_NOT_PROVEN` | 422 | caller-fixable | `vocal.language` exists in the registry but its measured singing/speech evidence does not meet the level this request requires | choose a language whose state satisfies the request, or set `vocal.language_policy` to `prefer_proven` and accept the reported fallback |
| `GENERATION_FAILED` | 502 | upstream | the delegated generation model returned `success=false` | the delegate's own error is passed through verbatim in `error`; this is terminal — not retried |
| `MEASUREMENT_FAILED` | 502 | upstream | audio was returned but could not be measured | treat as no delivery — nothing is charged as delivered |
| `CONFIG_ERROR` | 500 | ours | a deploy-time environment variable is absent | none — this is an internal deployment defect |
| `INTERNAL_ERROR` | 500 | ours | an unexpected exception reached the handler boundary | none — retry is safe only if your own request was idempotent |

## 8. Response envelopes

### 8.1 Success — `POST /v1/music`

```json
{
  "success": true,
  "request_id": "<uuid>",
  "endpoint": "generate-music-hybrid-model",
  "route": {
    "model": "<the route the conductor actually chose>",
    "why": "<the stated reason for that choice>",
    "worker": "<the delegate function that executed the generation>",
    "delegate_reported": {"surface": "…", "model": "…"},
    "identity_note": "the delegate's OWN reported surface/model are echoed because naming a model is not proof that model ran"
  },
  "prompt_sent": "<the exact compiled prompt string sent to the model>",
  "bindings": { /* per-field binding report for THIS request */ },
  "measured": {
    "duration_seconds": 0,
    "duration_measured": true,
    "measured_by": "<the measurement method that produced this number>",
    "codec": "…", "sample_rate": 0, "channels": 0
  },
  "tracks": [ {"url": "…", "public_url": "…"} ],
  "language_fallback": null,
  "render_plan": { /* the heavy post-processing stages NOT executed in this Lambda — see §10 */ },
  "spend_note": "this endpoint issues ONE generation call per invocation; no retry and no fallback model"
}
```

`measured.*` values are ALWAYS read from the delegate's own measurement of the delivered audio bytes
(an MPEG frame walk or a WAV data-chunk read) — never derived from a request parameter or a file header
guess. If the delegate could not measure the file, `measured.duration_measured` is `false` and a
`measured.honesty` field states so explicitly instead of a number being quoted as fact.

### 8.2 Failure

```json
{
  "success": false,
  "error": "<human-readable detail>",
  "error_code": "INVALID_REQUEST",
  "error_code_meaning": "the request failed validation against param_spec.json",
  "error_class": "caller_fixable",
  "caller_action": "read the `refused` array: it names every violated field with the allowed values for that field",
  "request_id": "<uuid>",
  "refused": ["<field 1: reason>", "<field 2: reason>", "…"]
}
```

The `refused` array is only present on `INVALID_REQUEST`; other error codes omit it.

## 9. Where the parameter contract lives

The full 35-parameter reference — every field, its accepted values, its provenance and its worked
examples — is documented in
[`C:\Berk\SsmContentAssetCreator\docs\ssm-content-asset-generation-api_v5.md`](../../SsmContentAssetCreator/docs/ssm-content-asset-generation-api_v5.md)
section 9.8 (the section that this repository's `scripts/generate_music_studio_doc_section.py` generates
directly from `param_spec.json`, so it can never hand-drift from the live schema). Until that document is
migrated into this repository's own `docs/` tree, treat it as the parameter authority and this document as
the API-surface authority; `GET /v1/music/capabilities` is always the ground truth for BOTH, live.

## 10. Heavy post-processing stages (what `render_plan` describes)

`POST /v1/music` returns audio from ONE generation call. It does **not** run mastering, format conform,
or stem separation inline — those stages need `ffmpeg` and a GPU, which the Lambda runtime has neither of.
The response's `render_plan` field names the exact stages, the GPU instance they would run on, and the
detached command that runs them there — as a PLAN the caller can verify, never as work silently skipped.
As of this writing, **no production caller has ever triggered these stages** (`render_plan.executed` is
always `false`); deciding where they run (a container with `ffmpeg` bundled into a future Lambda, versus
the existing GPU instance) is an open architecture decision, not yet made.

## 11. Infrastructure topology (why a request touches two AWS accounts)

This is operational detail for whoever administers the API, not something a client of the API needs to
know — included here for completeness and honesty about the current, temporary shape of the system.

- **The public-facing layer — domain, certificate, API Gateway, API key, usage plan — lives in the
  `futuremovies_production` AWS account** (`840513866551`), per Berk's order of 2026-08-19 to move the
  server. This is what `api.playmusicprompts.com` resolves to and terminates TLS on.
- **The compute — the Lambda function that actually runs the engine — still lives in the
  `beforetomorrow_production` AWS account** (`723322847393`), function name `PlayMusicPromptsModel`. The
  futuremovies API integrates into it CROSS-ACCOUNT via a resource-based Lambda permission scoped
  exclusively to this API's ARN.
- **Why compute has not moved yet:** the `futuremovies_production` account currently has an
  **account-level restriction on the Lambda service** — every Lambda API call (list, create) returns
  `AccessDeniedException` with no message, despite the calling user holding full administrator access,
  no permissions boundary, no AWS Organization membership, and the IAM policy simulator confirming the
  action is `allowed`. This matches AWS's documented new-account verification restriction. The fix is a
  free AWS Support case under "Account and billing" in the futuremovies account; once resolved, moving
  the Lambda is a single `create-function` call plus one integration-URI update (the execution role and
  the delegate resource-policy grants already exist in futuremovies, prepared in advance).
- **Nothing about this affects a caller of the API.** The request path, latency, and response are
  identical regardless of which account the compute physically runs in.

## 12. Known open items (stated plainly, not smoothed over)

- **A minimal-body smoke test during this session returned a bare `502` with an empty body**, rather than
  the structured `INVALID_REQUEST`/`400` envelope §8.2 promises for a malformed request. Measured
  same-turn: CloudWatch shows a 987 ms billed duration with no delegate-invocation log line, and the R&D
  spend ledger (`artifacts/song-rnd/spend_ledger.json`) has no new entry — **so this did NOT reach the
  paid generation call and incurred $0**, but the exact reason API Gateway returned a bare 502 instead of
  the Lambda's own JSON error body is `[UNVERIFIED]` and is an open debugging item, not yet root-caused.
- **The futuremovies Lambda restriction** (§11) — resolution depends on Berk filing the AWS support case.
- **No self-service key issuance** exists yet (§3) — every key is issued manually via the AWS CLI today.
- **Heavy post-processing stages never execute** (§10) — `render_plan.executed` is always `false` today.

## 13. Verification ledger (this document's own evidence, per claim)

| Claim | Verified how | When |
|---|---|---|
| `api.playmusicprompts.com` resolves via public DNS | `nslookup` against `8.8.8.8`, this session | 2026-08-19 12:43 |
| ACM certificate ISSUED | `aws acm describe-certificate`, observed transition live | 2026-08-19 ~12:05 |
| Keyless request → 403 | live HTTPS request against the real domain | 2026-08-19 12:48 |
| Wrong-key request → 403 | live HTTPS request against the real domain | 2026-08-19 12:48 |
| Correct-key request → 200, 35 parameters | live HTTPS request against the real domain | 2026-08-19 12:48 |
| Error catalogue table | read directly from `music_studio/data/error_catalogue.json` | 2026-08-19 15:42 |
| Capabilities response shape | live `GET /v1/music/capabilities` call, full JSON saved to `capabilities-full.json` | 2026-08-19 15:42 |
| Cross-account compute topology + Lambda restriction | this session's AWS CLI output (IAM simulator, CloudTrail lookup, account contact info) | 2026-08-19 (11:00–12:00 block) |
