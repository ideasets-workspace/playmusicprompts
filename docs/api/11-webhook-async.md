# 11 · Webhooks and Async Patterns

The API is **synchronous by design** — `POST /v1/music` runs the full pipeline (60-280 s) and
returns the delivered tracks in one response. The `webhook_url` parameter exists for a caller who
wants a fire-and-forget notification pattern; it does NOT change the delivery mechanism.

## The `webhook_url` parameter (our_stage, `text`, `https_uri`)

> **Corrected 2026-09-02.** Until that date this parameter was **validated and then ignored**: an
> `https` URL was accepted, checked for its scheme, and never called. If you built against the
> description below before 2026-09-02 and saw no callbacks, that is why. It now genuinely POSTs, and
> the response tells you what happened to the push.

```json
{
    "prompt": "test",
    "vocal": {"mode": "instrumental"},
    "duration": {"target_seconds": 30},
    "webhook_url": "https://yourdomain.com/api/music-callback"
}
```

When present, the API POSTs the **same JSON body it returned synchronously** to `webhook_url` after the
delivery is complete.

### The delivery contract

| property | behaviour | why |
|---|---|---|
| method and body | `POST`, `Content-Type: application/json`, the complete response body | so a webhook consumer needs no second call |
| correlation header | `X-PlayMusicPrompts-Request-Id: <request_id>` | you can match the push to the synchronous response you already hold |
| **signature (since 2026-09-06)** | `Authorization: Bearer <Google-signed OIDC ID token>`, audience = your `webhook_url`, issuer `https://accounts.google.com`, `email` claim = `music-api-runtime@playmusicprompts.iam.gserviceaccount.com` | the same scheme Google's own push products use (Pub/Sub push, Cloud Tasks); you can prove the push is ours, and an endpoint behind Google Cloud IAM needs no code at all |
| user agent | `playmusicprompts-music-api/1.0` | |
| attempts | **exactly one.** There is no retry | a retry against a handler that already succeeded but answered slowly would deliver a duplicate, and this API has no idempotency key to let you detect one. A single attempt whose outcome is *reported* is more honest than a retry loop whose duplicates are invisible. |
| timeout | 30 seconds | a handler needing longer should accept and queue |
| scheme | `https` only, refused twice — by the validator and again by the sender | a validator and a sender that agree only by convention drift apart |

### You are told whether the push landed

The response carries a `webhook` block:

```json
{
  "webhook": {
    "attempted": true,
    "ok": true,
    "status": 200,
    "auth": {
      "scheme": "oidc_id_token",
      "audience": "https://yourdomain.com/api/music-callback",
      "verify_with": "google.oauth2.id_token.verify_oauth2_token(token, Request(), audience=<your url>); check the `email` claim against the music-api runtime service account"
    },
    "elapsed_s": 0.34,
    "retry_policy": "none — sent once; the outcome is reported here"
  }
}
```

### Verifying the signature

Every push carries a Google-signed OIDC ID token in the `Authorization` header. Verify it before trusting
the body — three lines with the Google auth library (any language with a Google auth SDK has the
equivalent):

```python
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

claims = id_token.verify_oauth2_token(bearer_token, google_requests.Request(),
                                      audience="https://yourdomain.com/api/music-callback")
assert claims["email"] == "music-api-runtime@playmusicprompts.iam.gserviceaccount.com"
```

`verify_oauth2_token` checks the signature against Google's published keys, the expiry, and the audience.
If your endpoint runs on Cloud Run or Cloud Functions with authentication required, grant
`roles/run.invoker` to `music-api-runtime@playmusicprompts.iam.gserviceaccount.com` and Google's front end
performs this verification for you; an unsigned or foreign push is refused with 403 before your code runs
(measured 2026-09-06 with such a receiver: our push → 200, an unsigned POST → 403).

If the token could not be minted (only possible outside Google Cloud, where there is no metadata server),
the push is still sent and the `auth` block says `{"scheme": "none", "reason": ...}` — the absence of a
signature is reported, never silent.

If your endpoint refused or was unreachable:

```json
{
  "webhook": {
    "attempted": true,
    "ok": false,
    "status": 503,
    "body": "…first 200 characters of your response…",
    "retry_policy": "none — sent once; the outcome is reported here"
  }
}
```

If the push had not completed by the time the response was built:

```json
{
  "webhook": {
    "attempted": true,
    "status": "dispatched",
    "note": "the push is still in flight after 3 s and its outcome is therefore not known at response time; it is sent once, with no retry"
  }
}
```

That last shape is deliberate: reporting a delivery that has not been confirmed would be stating
something we do not know. Most receivers answer well under a second, so you will usually get the real
status code.

Your webhook handler should:

- Return a `2xx` within 30 seconds.
- Verify the `Authorization` bearer token (see *Verifying the signature*) before acting on the body.
- Correlate on `request_id` (header or body) — and on `job.job_id` for asynchronous jobs — against your own job record.
- Treat the push as **the same information** as the synchronous response, not as additional data.

The webhook body is the **finished** response: it already carries `auth`, `service` (the revision that
produced it), `job` (for async jobs) and the arrangement adviser's binding. Measured 2026-09-06 on revision
`music-api-00064-fmm` with a receiver that logs what arrived: body `job.job_id` == the accepted `job_id`,
header `X-PlayMusicPrompts-Request-Id` == `request_id`, `service.revision` == the serving revision, token
`email` == the runtime service account.

Today the webhook fires AFTER the synchronous response is returned. You will receive both:

1. The synchronous 200 body on your caller.
2. The webhook POST at `webhook_url`.

This gives your integration two ways to receive the same result — pick whichever fits your
architecture. If you use webhooks, the synchronous response can be discarded (though we recommend
keeping it for audit).

## Idempotency

The service has **no server-side idempotency key**. Sending the same request body twice will
generate two different Lyria takes (Lyria is not seed-deterministic — a repeat request with the
same seed is measured to produce a 23.87 dB different result). If your client retries a request
due to a network hang, you WILL be charged for two generations.

Recommendation:

1. Assign your own idempotency token in your client (e.g. `X-Client-Idempotency-Key: <uuid>`).
2. Track state in your client's DB: `{token: pending}` before the call, `{token: complete, request_id}`
   after.
3. On retry-on-network-hang, check your DB first; if `pending`, do NOT retry blindly — wait longer.

## Background polling for originality

The `run_originality_gate: true` flag turns Stage 10 on (the optional originality gate). The delivery response
returns immediately with `originality_gate.status = "pending"`; you poll
`GET /v1/music/originality/{request_id}` until `complete` or `failed`.

Recommended polling shape:

```typescript
async function pollUntilComplete(requestId: string, timeoutMs = 240_000): Promise<any> {
    const started = Date.now();
    let intervalMs = 5_000;
    while (Date.now() - started < timeoutMs) {
        const body = await fetch(`/api/music/originality/${requestId}`).then(r => r.json());
        if (body.status === "complete") return body.verdict;
        if (body.status === "failed") throw new Error(body.reason);
        await new Promise(r => setTimeout(r, intervalMs));
        intervalMs = Math.min(intervalMs * 1.5, 30_000);  // gentle exponential backoff, cap at 30 s
    }
    throw new Error("originality poll timeout");
}
```

The gate typically completes in 90-150 seconds. It runs in a background thread in the same
container, so Cloud Run keeps the instance warm (`--no-cpu-throttling`).

## What is NOT supported today

- **Server-Sent Events (SSE)** — no streaming response endpoint. Every response is a single JSON
  blob.
- **WebSocket** — no WebSocket surface.
- **Batch endpoint** — no `/v1/music:batchGenerate`. Send N independent requests instead; each
  scales its own Cloud Run instance.
- **Cancel** — no way to cancel a running request. The client's timeout is the only way to give up.
- **Delta updates** — no partial state updates. The response arrives when the delivery is complete.

If you need any of these, file a request; they are all buildable but not scheduled today.

## Native asynchronous mode (`"async": true`) — added 2026-09-05

You no longer need your own queue for the pattern below: the API carries one.

> **Precedence with `dry_run` (added 2026-09-06):** a body carrying both `"dry_run": true` and `"async": true` is
> answered as a dry run — 200 with the compiled plan, no job created, no 202, no webhook — because there is nothing to
> enqueue. Use `dry_run` to preview and validate, then submit the real request with `async`.

1. `POST /v1/music` with `"async": true` in the body (everything else unchanged). The request still passes
   every $0 gate synchronously — content safety, prompt enhance, validation — so a bad request is refused with
   the usual 400 immediately, and nothing is billed for a refusal.
2. An admitted request is answered **`202 Accepted`**:

```json
{
  "success": true, "async": true,
  "job_id": "job-19560fb8-c565-48ac-91f4-744bc5d24930",
  "request_id": "19560fb8-c565-48ac-91f4-744bc5d24930",
  "status": "queued",
  "poll": {"method": "GET", "path": "/v1/music/jobs/job-19560fb8-…", "auth": "x-api-key of the creating account"},
  "webhook": null,
  "task": {"name": "projects/…/queues/music-api-jobs/tasks/job-19560fb8-…", "dispatch_deadline": "1800s"},
  "auth": {"account_id": "…", "key_id": "…", "limit": {…}},
  "service": {"revision": "music-api-00057-dw4", …}
}
```

3. The delivery runs inside a Google Cloud Tasks dispatch of the service (durable: it is a real request, not a
   background thread that a scaled-down instance could lose). Its result — the SAME envelope the synchronous
   route returns, plus a `job` block — is written to the job record.
4. Poll `GET /v1/music/jobs/{job_id}` with the same `x-api-key`. Polls are **not counted** against your daily
   quota (the job consumed one count when it was accepted). `status` is one of `queued`, `processing`,
   `complete`, `failed`; when `complete` the body carries `response` (the delivery); when `failed` it carries
   `error` (the same error envelope a synchronous failure returns) and `http_status`. A job is readable only by
   the account that created it; any other account — and any unknown id — receives 404.
5. If you also set `webhook_url`, the same envelope is POSTed there once when the delivery finishes; correlate
   by `request_id` (identical in the 202 body and in the webhook payload) **or by `job.job_id`** — since 2026-09-06
   the webhook body carries the `job` block `{job_id, mode: "async", attempt}` too (until then the block was
   attached to the stored record only after the push, so a caller holding just the 202's `job_id` could not match
   the webhook; the 202's `webhook.correlates_by` names both keys). Live re-proof of this pending (2026-09-06 deploy).

Measured on 2026-09-05 (revision `music-api-00057-dw4`, an internal operator script): accept in 1.7 s,
`processing` on the first poll, `complete` after 42 s for a 30-second instrumental, and the Cloud Tasks task
consumed after the runner's 200. A retry by Cloud Tasks can never pay for a second generation: the runner claims
a job only while it is still `queued` and acknowledges every later dispatch without work.

## Recommended async pattern for user-facing UIs (when you prefer your own queue)

If you already run a queue and want progress states of your own shape, this pattern still works:

1. Your frontend calls YOUR backend's `/api/music/generate-async`.
2. Your backend enqueues the job on your own queue (Cloud Tasks, SQS, Redis) with a job id and
   returns `202 Accepted { jobId }`.
3. Your queue worker calls PlayMusicPrompts synchronously (up to 320 s timeout) — or with `"async": true`
   and polls `/v1/music/jobs/{job_id}` as above.
4. On completion, your worker writes the result to your own DB.
5. Your frontend polls `/api/music/job-status/{jobId}` (your own endpoint) every 5-15 s.
