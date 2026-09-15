# 09 · Limits and Timeouts

Every quantitative constraint your integration must respect, and the exact retry behaviour the API
expects from a well-behaved client.

## Your API key's limits

Each key issued to you carries two independent limits, set by the API operator at mint time and
adjustable on request.

| Limit | Default | What happens when exceeded |
|-------|---------|----------------------------|
| Rate per minute | 60 requests | `429` with `limit.reset_seconds` telling you how long to wait |
| Daily quota (UTC calendar day) | 1000 requests | `429` with `limit.resets: "next UTC day"` |

**Read your remaining allowance from every successful response.** The `auth` block reports it, and
the count already includes the request you just made:

```json
"auth": {
    "account_id": "your-account",
    "key_id": "3a7f0c9d",
    "limit": {"rate_per_min": 120, "daily_quota": 10000, "used_today": 48}
}
```

Your remaining daily allowance is `daily_quota - used_today`. Surface this in your own UI or
internal dashboard so a 429 is never a surprise, and stop issuing requests at `daily_quota - 1`
rather than discovering the ceiling by hitting it.

If your production volume needs a higher limit, ask the operator before you launch — raising a
limit is a one-line change on their side, but discovering the need at 09:00 on launch day is
avoidable.

## Request timeouts

The service has no streaming and no progress feed: a request blocks until the delivery is complete.
Set your client timeouts accordingly.

| Endpoint | Typical | Recommended client timeout |
|----------|---------|----------------------------|
| `GET /health` | under 1 s | 15 s |
| `GET /v1/music/capabilities` | 9 s | 30 s |
| `POST /v1/music` instrumental, `target_seconds` 15 | 25 s | 180 s |
| `POST /v1/music` instrumental, `target_seconds` 60 | 90-140 s | 180 s |
| `POST /v1/music` sung with custom lyrics | 230-280 s | 320 s |
| `POST /v1/music` with `output_package: variations` | N × the single-take figure | 500 s for 3 instrumental takes; consult the operator before requesting sung variations |
| `GET /v1/music/originality/{request_id}` | under 1 s per poll | 15 s per poll |

The service's own server-side ceiling is 3600 seconds, so a client timeout above that is
meaningless. In practice a sung request that has not returned within 320 seconds indicates a fault,
not a slow generation.

**Timeout settings by SDK:**

| Environment | Where to set it |
|-------------|-----------------|
| Node.js `fetch` (undici) | `{ timeout: 320_000 }` or an `AbortSignal.timeout(320_000)` |
| Python `httpx.AsyncClient` | `timeout=320.0` |
| Python `requests` | `timeout=320` |
| Swift `URLRequest` | `timeoutInterval = 320`, and raise `URLSessionConfiguration.timeoutIntervalForResource` to match |
| Kotlin `OkHttpClient` | `.readTimeout(320, TimeUnit.SECONDS)`; `connectTimeout` and `writeTimeout` can stay at 30 s |
| Browser `fetch` | `AbortSignal.timeout(320_000)` — but a browser should be calling your backend, not this API |

## Retry policy

The API expects a disciplined client. Getting this wrong costs real money on every wasted call.

| Response | Retry? | How |
|----------|--------|-----|
| `200 OK` | **Never** | The delivery succeeded. Every retry generates a new, different, billed track. |
| `400 INVALID_REQUEST` | **Never unchanged** | Read the `refused` array, fix the field it names, then send a corrected request. |
| `401` | **Never unchanged** | Your identity token or API key is missing, expired, unknown or disabled. Fix the credential. |
| `403` | **Never unchanged** | Either your key lacks the required scope, or the authorization store is unreachable (a fail-closed safety behaviour). Report the second case rather than retrying. |
| `429` rate limit | **Yes, after the stated delay** | Wait `limit.reset_seconds`, then retry the identical request. |
| `429` daily quota | **Yes, after 00:00 UTC** | Or ask the operator for a higher quota. |
| `502 GENERATION_FAILED` | **Never unchanged** | The music generator refused. The refusal is deterministic: the identical prompt will refuse again. Change the prompt materially. |
| `502 MEASUREMENT_FAILED` | **Never unchanged** | Nothing was delivered and nothing was charged as delivered. Report it. |
| `500 INTERNAL_ERROR` | **Up to 3 times** | Exponential backoff: 2 s, then 8 s, then 32 s. Only if your own request is idempotent on your side (retrying must not double-charge a wallet or double-create a record in your system). After the third failure, report it with the `request_id`. |
| `500 CONFIG_ERROR` | **Never** | A deployment fault on the service side. Report it immediately. |

**Why "never retry a 502 unchanged" is a hard rule and not advice.** A generator refusal is
deterministic. The same prompt produces the same refusal. A retry loop against a refusing prompt is
a loop that burns budget for a guaranteed failure. Change the prompt or stop.

## Idempotency

There is **no server-side idempotency key**. Two identical requests produce two different tracks
and two charges — the generator is not deterministic even with the same `seed` value.

If your client must be safe against a network hang mid-request, implement idempotency on your side:

1. Generate your own token before the call and record `{token: "pending"}` in your database.
2. Make the request.
3. On success, record `{token: "complete", request_id: <from response>}`.
4. If a network error leaves you unsure whether the request landed, **do not blindly retry**. Wait
   out the full timeout window first; the request may still be in flight and will still be charged.

## Concurrency

**Instrumental requests scale freely.** The service runs one request per instance and Google Cloud
Run adds instances automatically, so concurrent instrumental requests do not queue behind each
other.

**Sung requests serialise at one point.** The vocal-isolation stage runs on a single dedicated GPU
worker with a concurrency of one. Two simultaneous sung requests will both generate in parallel, but
the second one's isolation stage waits for the first to finish — adding roughly 15 seconds per
queued request ahead of it.

Practical guidance:

- Up to ~3 concurrent sung requests: acceptable, expect modest queuing.
- More than 3 concurrent sung requests: talk to the operator first. Additional GPU capacity can be
  provisioned, but not instantaneously.
- Load testing: **get operator approval before running one.** An unannounced load test against the
  GPU worker looks identical to abuse.

## Response sizes

| Response | Typical size |
|----------|--------------|
| `GET /health` | under 200 bytes |
| `GET /v1/music/capabilities` | 200-400 KB (the full 103-parameter specification) |
| `POST /v1/music` instrumental | 4-8 KB |
| `POST /v1/music` sung with lyrics | 20-60 KB (the intelligibility measurement carries full phoneme sequences and a per-symbol alignment trace) |
| `GET /v1/music/originality/{id}` | 1-4 KB |

If your transport is bandwidth-constrained, cache the capabilities response — the parameter surface
changes rarely and the operator will tell you when it does.

## Audio file sizes

Delivered files land at these approximate sizes:

| Duration | MP3 (native) | WAV 24-bit 48 kHz |
|----------|--------------|-------------------|
| 15 s | 250 KB | 4.3 MB |
| 30 s | 500 KB | 8.6 MB |
| 60 s | 1 MB | 17 MB |
| 180 s | 3 MB | 52 MB |

The `export` parameter chooses the format. Both `public_url` and `gcs_uri` point at the same
object; `public_url` is directly playable and requires no authentication.

## What a well-behaved client looks like

- [ ] Attaches both credentials on every request, from the backend, never from a device.
- [ ] Sets a timeout matched to the request class (see the table above).
- [ ] Logs the `request_id` of every response, success or failure.
- [ ] Reads `auth.limit.used_today` and stops before the quota rather than at it.
- [ ] Distinguishes the three error classes and reacts differently to each.
- [ ] Never retries a `200`, a `400`, or a `502` unchanged.
- [ ] Backs off exponentially on `500`, capped at three attempts.
- [ ] Waits the stated interval on `429` instead of hammering.
- [ ] Presents `render_plan.processed_url` (the mastered file) to the user, not the raw take.
- [ ] Coordinates with the operator before load testing or before exceeding 3 concurrent sung
      requests.
