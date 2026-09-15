# 11 · Webhooks and Async Patterns

The API is **synchronous by design** — `POST /v1/music` runs the full pipeline (60-280 s) and
returns the delivered tracks in one response. The `webhook_url` parameter exists for a caller who
wants a fire-and-forget notification pattern; it does NOT change the delivery mechanism.

## The `webhook_url` parameter (our_stage, `text`, `https_uri`)

```json
{
    "prompt": "test",
    "vocal": {"mode": "instrumental"},
    "duration": {"target_seconds": 30},
    "webhook_url": "https://yourdomain.com/api/music-callback"
}
```

When present, the API POSTs to `webhook_url` after the delivery is complete with the same JSON
body it returned synchronously. Your webhook handler MUST:

- Return `200 OK` within 30 seconds; the API does NOT retry a failed webhook.
- Handle at-least-once delivery (though today it is exactly-once; a retry policy is a follow-up).
- Verify the payload against your own tracking (correlate `request_id` with your job record).

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

## Recommended async pattern for user-facing UIs

If a user hits "Generate" and needs to see status faster than the 60-280 s round-trip:

1. Your frontend calls YOUR backend's `/api/music/generate-async`.
2. Your backend enqueues the job on your own queue (Cloud Tasks, SQS, Redis) with a job id and
   returns `202 Accepted { jobId }`.
3. Your queue worker calls PlayMusicPrompts synchronously (up to 320 s timeout).
4. On completion, your worker writes the result to your own DB.
5. Your frontend polls `/api/music/job-status/{jobId}` (your own endpoint) every 5-15 s.

This pattern lets your UI reflect progress states even though the underlying API is synchronous.
