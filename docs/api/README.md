# PlayMusicPrompts Music API â€” Integration Documentation

**This bundle is the complete integration reference for the PlayMusicPrompts Music API.** It is
written for the engineering team that will build a web, mobile, or desktop client on top of this
API. Everything in it has been verified against the live production service; every parameter,
response field and error code below is real and current.

---

## What this API does

You send a text prompt (and optionally a full custom lyric plus up to 103 parameters). The API
generates music with Google Vertex AI Lyria, conforms the delivered audio to the duration you asked
for, masters it to a broadcast-ready loudness target, and â€” when you requested sung custom lyrics â€”
isolates the vocal, transcribes it, and scores how intelligibly the requested words were actually
sung. It returns the delivered tracks plus every measurement it took.

Two request shapes cover most integrations:

**Instrumental** â€” a music bed with no vocals, delivered in about 25 seconds to 2.5 minutes.

**Sung with your exact lyrics** â€” a full song where a voice sings the words you supplied verbatim,
delivered in about 4 minutes, with a measured intelligibility score attached.

---

## Base URL

```
https://music-api-636636169989.us-central1.run.app
```

Region: `us-central1` (Google Cloud). All endpoints are HTTPS-only.

---

## Read the documents in this order

| # | Document | Read it when |
|---|----------|--------------|
| 01 | [01-quickstart.md](01-quickstart.md) | **Start here.** Your first instrumental and first sung request, in copy-pasteable form. Fifteen minutes to a working call. |
| 02 | [02-authentication.md](02-authentication.md) | Before you write any code. Explains the two auth layers, what your backend must attach to every request, and the exact meaning of every 401/403/429. |
| 03 | [03-endpoints-reference.md](03-endpoints-reference.md) | While building your API client. Every endpoint's method, headers, request shape, response shape and status codes. |
| 04 | [04-request-body-full.md](04-request-body-full.md) | While building your UI. All 103 parameters with their control type (text/slider/combo/chips/toggle), allowed values, and validation rules. This is your form-generation reference. |
| 05 | [05-lyrics-and-singing.md](05-lyrics-and-singing.md) | If your product generates songs with lyrics. Covers `vocal`, `lyrics`, language support, and how the intelligibility score works. |
| 06 | [06-response-envelope.md](06-response-envelope.md) | While parsing responses. Every field, its type, its meaning, and when it is null. |
| 07 | [07-error-catalogue.md](07-error-catalogue.md) | While writing error handling. Every error code with the exact status, the exact caller action, and whether a retry is safe. |
| 08 | [08-audio-pipeline.md](08-audio-pipeline.md) | To understand latency. Explains what happens in each of the ten processing stages and how long each takes, so you can build honest progress UI. |
| 09 | [09-limits-and-timeouts.md](09-limits-and-timeouts.md) | Before you go to production. Rate limits, daily quotas, per-endpoint timeouts, retry policy, concurrency contract. |
| 10 | [10-integrations-web-mobile.md](10-integrations-web-mobile.md) | **Working code.** Node.js and Python backend proxies, plus web (TypeScript), iOS (Swift), Android (Kotlin) and desktop client examples. |
| 11 | [11-webhook-async.md](11-webhook-async.md) | If you need a non-blocking pattern. Covers `webhook_url`, polling, and idempotency. |
| 12 | [12-originality-gate.md](12-originality-gate.md) | If your product needs a "creative variety" guarantee. Explains the optional monotony and carbon-copy measurements. |
| 13 | [13-stems-and-masters.md](13-stems-and-masters.md) | If you expected separated stems. Explains what the API ships, what it does not, and why. |
| 14 | [14-language-support.md](14-language-support.md) | If you plan to sing in a language other than English. Explains the 11-language registry and what "not yet proven for singing" means for your request. |
| 16 | [16-content-policy.md](16-content-policy.md) | **Read this if you accept lyrics from your users.** The eight categories of text the API refuses, the 29 fields it checks, and how to handle `400 CONTENT_REFUSED` â€” including how to tell a policy refusal from a temporary classifier outage, which are different situations for your user. |

---

## The most important thing to get right first: authentication

Every request needs **two** credentials attached, and they serve different purposes.

**Layer 1 â€” a Google identity token.** This proves your caller has permission to reach the service
at all. The service is not publicly reachable; anonymous requests get a `403` from Google's edge
before the application ever sees them. Your backend obtains this token from the Google Cloud SDK or
from the metadata server if it runs on Google Cloud, and attaches it as
`Authorization: Bearer <token>`. Ask the API operator to grant `roles/run.invoker` to the service
account your backend runs as.

**Layer 2 â€” an API key.** This identifies your tenant and enforces your rate limit and daily
quota. It goes in the `x-api-key` header. The operator mints it and gives it to you once; the
server stores only a hash, so it cannot be recovered if you lose it.

**Do not put either credential in a browser or a mobile app.** Both belong in your backend. Your
frontend calls your backend; your backend attaches the credentials and calls this API. Document 10
shows the exact proxy pattern in Node.js and Python.

---

## The shape of a request, minimally

```json
{
    "prompt": "warm folk ballad, acoustic guitar and gentle piano, medium tempo",
    "duration": {"target_seconds": 30},
    "vocal": {"mode": "male", "language": "en"},
    "lyrics": {
        "mode": "custom",
        "text": "We rise where the morning breaks, we walk the road together"
    }
}
```

Only `prompt` is required. Everything else is optional, and unknown fields are refused by name with
a list of every field the endpoint does accept â€” so a typo produces an immediately actionable
error, never a silent ignore.

---

## The shape of a response, minimally

```json
{
    "success": true,
    "request_id": "7decbad8-2918-4c80-b658-248d6e7ac14e",
    "tracks": [
        {
            "public_url": "https://storage.googleapis.com/.../lyria_20260901_084334_7decbad8_t0.mp3",
            "gcs_uri": "gs://.../lyria_20260901_084334_7decbad8_t0.mp3",
            "take": 1
        }
    ],
    "measured": {
        "duration_seconds": 143.752,
        "codec": "mp3",
        "sample_rate": "44100",
        "channels": 2
    },
    "render_plan": {
        "processed_url": "https://storage.googleapis.com/.../mastered_11632ce9.wav",
        "processed_duration_seconds": 30.0
    },
    "lyrics_verification": {
        "per": 0.31,
        "verdict": "PASS",
        "threshold": 0.654862
    },
    "auth": {
        "account_id": "your-account",
        "key_id": "3a7f0c9d",
        "limit": {"rate_per_min": 120, "daily_quota": 10000, "used_today": 48}
    }
}
```

**Use `render_plan.processed_url`, not `tracks[0].public_url`, as the file you present to your
user.** The first is the mastered, duration-conformed, loudness-normalised file; the second is the
raw generator output before mastering.

Both are **V4 signed URLs** â€” any client can GET them with no credentials, so they go straight into
an `<audio src>` or a mobile media player. They are time-limited: store the response's `gcs_uri` and
exchange it at `POST /v1/music/delivery-url` for a fresh URL when a signature expires. That call is
free and does not regenerate audio. See [06-response-envelope.md](06-response-envelope.md).

---

## Latency you must design around

There is no streaming and no progress feed. A request blocks until the delivery is complete.

| Request | Typical | Design your timeout at |
|---------|---------|------------------------|
| `GET /health` | under 1 second | 15 seconds |
| `GET /v1/music/capabilities` | 9 seconds | 30 seconds |
| `POST /v1/music` instrumental, 15 s target | 25 seconds | 180 seconds |
| `POST /v1/music` instrumental, 60 s target | 90-140 seconds | 180 seconds |
| `POST /v1/music` sung with lyrics | 230-280 seconds | 320 seconds |

If your product cannot hold a user on a spinner for four minutes, use the queue pattern in
document 11: your backend accepts the request, returns a job id immediately, and calls this API
from a worker while your frontend polls your own job-status endpoint.

---

## What this API deliberately does not do

Knowing the boundaries early will save you a redesign.

**It does not stream.** No Server-Sent Events, no WebSocket, no chunked audio. One request, one
JSON response containing finished URLs.

**It does not ship separated stems.** You cannot request "just the vocal" or "just the drums" as
delivered files. The underlying generator only produces mixed audio, and the platform's own rules
forbid shipping a machine-separated stem as a delivery track. Document 13 explains this and what
you get instead.

**It does not cancel.** Once a request is in flight there is no cancel endpoint. Your client
timeout is the only exit.

**It does not batch.** There is no multi-request endpoint. Send N independent requests; the service
scales horizontally to handle them, but see the concurrency note in document 09 about sung requests
in particular.

**It sings in English only, today.** Eleven languages are registered and the API will accept them
for prose and instrumental requests, but only English has a calibrated intelligibility threshold
for sung custom lyrics. A sung request in another language is refused with an explanation unless you
explicitly opt into an English fallback. Document 14 covers the full picture.

---

## Errors: three classes, three different reactions

Every error response carries an `error_class` field telling you who can act on it.

**`caller_fixable`** â€” your request is wrong. The `refused` array names every violated field. Fix
the request and retry. Never retry unchanged.

**`upstream`** â€” the music generator refused or failed. **Do not retry the same prompt** â€” a model
refusal is deterministic, and a blind retry costs money for a guaranteed second refusal. Change the
prompt materially and try again.

**`ours`** â€” the service itself broke. Retry up to three times with exponential backoff (2 s, 8 s,
32 s) if your request is idempotent on your side, then report it with the `request_id`.

Document 07 has the exact table.

---

## Support and escalation

Every response â€” success or failure â€” carries a `request_id`. **Log it.** When you report a
problem, the `request_id` is what lets the operator find the exact server-side trace for your
request in seconds instead of hours.

When you open a report, include:

- the `request_id`
- the timestamp in UTC
- the full request body you sent (redact your API key)
- the full response body you received
- what you expected to happen
- what actually happened

Send it through the support channel you agreed with the API operator.

---

## What is NOT in this bundle, and why

This bundle is the integration reference. It deliberately omits:

- **Deployment and operations.** How the service is deployed, how logs are read, how the
  infrastructure is provisioned, and how API keys are minted are the operator's responsibility, not
  yours. If you need a configuration change, request it through your support channel.
- **Internal infrastructure addresses and identifiers.** The service calls internal components you
  do not address directly. Their addresses are intentionally absent.
- **Cost and budget figures.** Commercial information; ask the operator if you need capacity
  planning numbers.
- **Internal research documentation.** The API's design decisions rest on a large body of internal
  research (phonology, mastering, intelligibility measurement, originality scoring). Where a
  document references it, the operator can supply the specific paper on request.
- **The service's own source code and repository layout.** Where a document explains behaviour it
  names the responsible component in prose rather than by file path.

Nothing functional has been removed. Every parameter, every endpoint, every response field and
every error code in this bundle is complete and current.

---

## Bundle contents checklist

Confirm you received all 15 files:

- [ ] `README.md` (this file)
- [ ] `01-quickstart.md`
- [ ] `02-authentication.md`
- [ ] `03-endpoints-reference.md`
- [ ] `04-request-body-full.md`
- [ ] `05-lyrics-and-singing.md`
- [ ] `06-response-envelope.md`
- [ ] `07-error-catalogue.md`
- [ ] `08-audio-pipeline.md`
- [ ] `09-limits-and-timeouts.md`
- [ ] `10-integrations-web-mobile.md`
- [ ] `11-webhook-async.md`
- [ ] `12-originality-gate.md`
- [ ] `13-stems-and-masters.md`
- [ ] `14-language-support.md`
- [ ] `16-content-policy.md`

If any is missing, ask before you start â€” the documents cross-reference each other and a missing
one will leave a dead link.

---

## Version

Documentation generated **2026-09-01** against production revision `music-api-00025`.

The API's parameter surface, response envelope and error catalogue are versioned server-side; call
`GET /v1/music/capabilities` at integration time to confirm you are building against the current
surface. If the parameter count that endpoint reports differs from the 103 documented here, ask the
operator for an updated bundle before you continue.
