# 02 · Authentication and Authorization

The API sits behind two independent authentication layers. Both are required on every write path.
This document is the source of truth for how they combine, which HTTP status maps to which failure
mode, and what an operator does to mint, disable, or re-limit a key.

## Two-layer model, in one sentence each

1. **Cloud Run IAM (identity token)** — proves the caller has network permission to invoke the
   service at all. The service is deployed `--no-allow-unauthenticated`; the ideasets.com
   Organization Policy `iam.allowedPolicyMemberDomains` forbids `allUsers`, so every request must
   carry an OIDC identity token from a principal that has `roles/run.invoker` on the service.
2. **API key (`x-api-key` header)** — proves the caller is a specific tenant with a specific
   allowance. Keys are minted per-account, carry scopes and per-key limits (rate + daily quota),
   and are stored server-side only as SHA-256 hashes.

Both checks run BEFORE the request body is parsed. If either fails the API returns the exact
status (`401`, `403`, or `429`) with the exact reason; there is no blanket "forbidden".

## Layer 1 — Cloud Run identity token

### What Cloud Run expects

An `Authorization: Bearer <id-token>` header where `<id-token>` is a Google OIDC ID token whose
`aud` claim matches the service URL and whose `email` claim is a principal (user, service account,
or group) bound to `roles/run.invoker` on this service.

Minted from the SDK:

```bash
gcloud auth print-identity-token          # from a user account already logged in
gcloud auth print-identity-token --impersonate-service-account=<sa>@<project>.iam.gserviceaccount.com
```

Or from a service account running on a Google Cloud VM/Cloud Run/GKE:

```bash
curl -sH "Metadata-Flavor: Google" \
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=https://music-api-636636169989.us-central1.run.app"
```

### Who has `run.invoker` today

Live IAM policy on the service, verified via
`gcloud run services get-iam-policy music-api --region=us-central1 --project=playmusicprompts`:

| Principal | Role | Purpose |
|-----------|------|---------|
| `user:publish@ideasets.com` | `roles/run.invoker` | Owner and operator |
| `the separator service account` | `roles/run.invoker` | The GCE VM the separator service that returns stem separations to `music-api`, and any operator SSH probe from that VM |

**How to grant a new principal invoker access** (operator action):

```bash
gcloud run services add-iam-policy-binding music-api \
    --region=us-central1 --project=playmusicprompts \
    --member=serviceAccount:<sa>@<project>.iam.gserviceaccount.com \
    --role=roles/run.invoker
```

The Domain-Restricted-Sharing Organization Policy on ideasets.com refuses `--member=allUsers` even
for the operator; making the service anonymously reachable requires a policy exemption at the org
level, which is an operator decision (open owner-decision F).

### 403 without a token

Anonymous requests to any path return an HTTP 403 emitted by the Google Front End itself, BEFORE
the container is reached. The body is Google's own HTML error page, not JSON — this is how you can
tell auth-layer-1 refused you rather than the app.

## Layer 2 — API key (`x-api-key`)

### The key format

- Raw shape: `pmp_<43-char-url-safe-base64>` (32 bytes of CSPRNG entropy).
- Displayed **once**, at mint time. The server persists only its SHA-256 hash under
  `gs://playmusicprompts-content/apikeys/<hash>.json`.
- Wire it into your caller via a secret store (Cloud Secret Manager, Vault, `.env` outside VCS).
  Do NOT commit the raw key.
- Rotate by minting a new one, deploying it, then disabling the old one. See below.

### Every key record carries

| Field | Purpose |
|-------|---------|
| `key_id` | 12-char public identifier (hash prefix) shown in every response and log |
| `account_id` | The tenant this key belongs to |
| `label` | Free-text description ("web-prod", "ios-app", "internal-batch") |
| `scopes` | List of permissions; `music:generate` is required for `POST /v1/music` |
| `limits.rate_per_min` | Requests per rolling 60-second window per key (default 60) |
| `limits.daily_quota` | Requests per UTC calendar day per key (default 1000) |
| `disabled` | If true, every request 401s until re-enabled |
| `created_at` | ISO-8601 UTC mint timestamp |

### Legacy key exception

If the environment variable `API_KEY` is set on the Cloud Run revision, its value is honoured as a
legacy bootstrap key mapped to a synthetic `legacy` account with unlimited allowance. This exists
only to avoid breaking a mid-migration integration; new integrations MUST use the store.
Source: `the service's internal main.py::_authorize`.

## Minting a key (operator only)

There is a single admin CLI at `the service's internal the operator's key-administration tool`. It must run under a Google
identity that has read/write on `gs://playmusicprompts-content/apikeys/`.

```bash
The operator runs their key-administration tool with your account name, the
`music:generate` scope, and the rate and quota agreed with you.
```

Sample output (verbatim shape — every mint prints the raw key ONCE):

```
Minted new API key.

    RAW KEY (store now, will not be shown again):
    pmp_<43-char-secret>

    key_id     : 3a7f0c9d4e12
    account    : web-app-prod
    scopes     : ['music:generate']
    rate/min   : 120
    daily quota: 10000
```

Every other operation is fully server-verifiable without ever seeing the raw key:

```bash
The operator can list every key, disable or re-enable one, and change its rate and quota
without ever seeing a raw key value again.
```

## HTTP status matrix

Every path through `_authorize` maps to exactly one status. This table is generated from the code
in `the service's internal api_keys.py::check_and_count` and `the service's internal main.py::_authorize`:

| Situation | HTTP | Body reason | Notes |
|-----------|------|-------------|-------|
| No `Authorization` header | 401 | (Google HTML — layer 1 refused before the app was reached) | Fix: attach a valid identity token |
| `Authorization` present but the principal has no `run.invoker` | 401 | (Google HTML) | Fix: grant `roles/run.invoker` |
| Identity token audience mismatch | 401 | (Google HTML) | Fix: mint with `--audience=<service-url>` |
| No `x-api-key` header | 401 | `{"error":"missing x-api-key header"}` | Fix: attach a valid key |
| `x-api-key` hash not in store | 401 | `{"error":"unknown API key"}` | Fix: mint or resync the key |
| Key disabled | 401 | `{"error":"API key is disabled"}` | Fix: their key-administration tool |
| Key lacks scope `music:generate` | 403 | `{"error":"API key lacks the required scope 'music:generate'"}` | Fix: mint a new key with the correct scope |
| Rate limit exceeded (≥ `rate_per_min` in the last 60 s) | 429 | `{"error":"rate limit exceeded (<N>/min)","limit":{"rate_per_min":N,"reset_seconds":<s>}}` | Retry after `reset_seconds` |
| Daily quota exceeded (`count ≥ daily_quota` for the current UTC day) | 429 | `{"error":"daily quota exceeded (<N>/day)","limit":{"daily_quota":N,"resets":"next UTC day"}}` | Retry at 00:00 UTC or ask the operator to raise the quota |
| Store IO error (bucket unreachable) | 403 | `{"error":"authorization store unavailable: <ExcClass>"}` | Fail-CLOSED by design; do NOT retry blindly — file an incident |
| Everything OK | 200 | Response body carries `auth: {account_id, key_id, limit: {rate_per_min, daily_quota, used_today}}` | The remaining allowance is visible in every successful response |

## Full worked example

```bash
# 1. Get an identity token for the service
export ID_TOKEN=$(gcloud auth print-identity-token)

# 2. Point at your key (from your secret store, NEVER commit)
export API_KEY="pmp_..."

# 3. Send a request
curl -sS -X POST \
    -H "Authorization: Bearer $ID_TOKEN" \
    -H "x-api-key: $API_KEY" \
    -H "Content-Type: application/json" \
    --data '{"prompt":"test","vocal":{"mode":"instrumental"},"duration":{"target_seconds":15}}' \
    https://music-api-636636169989.us-central1.run.app/v1/music \
    -w "\nHTTP=%{http_code}\n"
```

Inspect the `auth` block in the response:

```json
"auth": {
    "account_id": "web-app-prod",
    "key_id": "3a7f0c9d4e12",
    "limit": {"rate_per_min": 120, "daily_quota": 10000, "used_today": 47}
}
```

Your remaining daily allowance is `daily_quota - used_today = 9953`.

## Storage layout on GCS

Auth material lives in the same content bucket as delivered audio (no new paid infrastructure per
the frontier-engineering law):

```
gs://playmusicprompts-content/
├── apikeys/<sha256_of_raw_key>.json       — the key record; hashes only
├── apikeys-usage/<sha256_of_raw_key>/     — one file per UTC day per key
│   └── 2026-09-01.json                    — {day, count, minute_window_start, minute_count}
├── music/lyria_<timestamp>_<request_id>_t0.mp3   — delivered takes (public via CDN)
├── stems/<request_id>_vocals.wav          — analysis-only vocal stems (never shipped as tracks)
└── originality/<request_id>.json          — a recorded platform decision verdicts (pending/complete/failed)
```

The `apikeys/` and `apikeys-usage/` prefixes require the Cloud Run runtime service account to have
`roles/storage.objectAdmin` on the bucket. Live check with their key-administration tool.

## What the caller sees on success (auth-related fields)

Every 200 response carries an `auth` block, always:

```json
{
    "success": true,
    "request_id": "e2a1f3...",
    "auth": {
        "account_id": "web-app-prod",
        "key_id": "3a7f0c9d4e12",
        "limit": {"rate_per_min": 120, "daily_quota": 10000, "used_today": 48}
    },
    "...": "..."
}
```

Log this and expose the remaining allowance in your client UI so the user is never surprised by a
429. When the reported `used_today` climbs and reaches `daily_quota` you MUST stop and retry after
00:00 UTC or ask for a quota raise; a repeated 429 without a backoff is antisocial (and, in extreme
cases, would be treated as abuse by the operator).

## Rotation runbook

1. their key-administration tool a new key with the same scopes/limits.
2. Deploy the new key to the caller's secret store.
3. Verify the caller is using it (the `key_id` in a fresh response equals the new one).
4. their key-administration tool.
5. After 24 hours with no error from the caller, delete the old key record. There is no
   `delete-key` verb by design; disable-then-forget is the audit-friendly path.

## Non-goals

- The API does not issue refresh tokens or OAuth flows. Cloud Run's own identity-token model is
  the OAuth2-compliant layer; API keys are the tenant-limit layer.
- The API does not accept `Authorization` on browsers via `Origin`/CORS from the raw domain. The
  browser MUST hit its own backend, and the backend MUST attach `Authorization` server-side.
  Exposing an identity token from a browser is a rotation-and-audit nightmare and is refused by
  policy.
