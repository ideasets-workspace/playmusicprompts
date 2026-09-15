# SSM Content Asset Creator -- Complete API Reference v5.0

<!--
================================================================================
  AI IMPLEMENTATION PROMPT FOR FRONTEND -- Claude Opus 4.6 / Sonnet 4.6

  THIS IS THE SINGLE SOURCE OF TRUTH.
  Read this ENTIRE section before writing a single line of code.

  v5.0 Changes from v4.0 (2026-08-09) -- every item below was MEASURED against
  live AWS/CloudWatch/ECR/S3 on 2026-08-09, not carried over from v4:
  - THIS DOCUMENT DESCRIBES ONE ACCOUNT: beforetomorrow_production /
    723322847393, the project's recorded deployment target (AGENTS.md line 53,
    .claude/memory/infra.md). Its base URL, WebSocket, CDN, bucket and API key
    replace v4's throughout. The pre-migration account is SUPERSEDED (AGENTS.md
    line 76) and is NOT documented here; where it appears below it is only as
    the dated location of a measurement or as the cross-account image registry.
  - MIGRATION ITEM, MEASURED AND OPEN: on 2026-08-09 the live clients were still
    calling the superseded account's API, and its job_creator logged traffic that
    day while 723322847393's job_creator last logged 2026-07-20. Repointing the
    clients to the values in this document is an open action, not a done one.
  - Veo model IDs: `veo-3.1` / `veo-3.1-fast` resolve to the GA publisher models;
    the two `-preview` aliases are RETIRED by Google and are now REDIRECTED to
    their GA successors by the worker instead of failing. Fixed and deployed
    2026-08-09; proven by five live generations (see MEASURED REALITY below).
  - /create-video-vertex DELIVERS 1280x720 even though its JSON response says
    1920x1080. /create-video-vertex-v3 delivers a real 1920x1080 but at ~100-178x
    the bitrate (LOSSLESS), i.e. ~100-139 MB per 4 seconds.
  - The two video endpoints write to DIFFERENT S3 prefixes and return DIFFERENT
    response shapes. v4 implied they were interchangeable.
  - NEW 2026-08-12: /create-video-vertex-omni-flash — a THIRD Vertex video endpoint,
    on the Gemini Omni Flash Interactions surface (gemini-omni-flash-preview,
    720p/24 fixed, 3-10 s, text/image/reference/dialogue tasks, $0.101/s measured).
    Deployed, routed and live-verified the same day across all four task families;
    the ONLY one of the three with two-speaker dialogue (speech_config). Section 6.2b.
  - Production status is no longer restated as "173 ready": v4's per-endpoint
    status was not re-measured in this revision. What WAS measured on 2026-08-09
    is stated per item, with counts, in MEASURED REALITY.
  Retained from v4.0: the endpoint inventory, request/response parameter tables,
  error envelope and frontend patterns, which were NOT re-verified in v5 and are
  marked as inherited where they matter.
================================================================================
-->

## SYSTEM CONTEXT -- READ FIRST

You are building the frontend for **SSM Content Asset Creator** -- a production
multi-provider AI content generation platform with 176 documented API endpoints,
25+ AI providers, and 50 content types. The backend runs on AWS `eu-central-1`
in account **723322847393** (`beforetomorrow_production`).

### Tech Stack (STRICT -- no alternatives)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 15+ |
| Language | TypeScript (strict mode, zero `any`) | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| Server State | TanStack Query | v5 |
| Client State | Zustand (only when truly needed) | |
| Forms | React Hook Form + Zod | |
| Icons | Lucide React | |
| Animation | Framer Motion | |

### Live AWS Infrastructure — account 723322847393 (`beforetomorrow_production`)

Every value measured 2026-08-09 (`sts get-caller-identity`, `apigateway`, `cloudfront`, `s3api`, `lambda`).
This is the project's recorded deployment target: AGENTS.md line 53, `.claude/memory/infra.md`.

| Resource | Value |
|----------|-------|
| **AWS CLI Profile** | `beforetomorrow_production` |
| **AWS Account** | `723322847393` (BeforeTomorrow) |
| **Region** | `eu-central-1` (Frankfurt) |
| **API Gateway REST API** | ID: `v2pjhwhk0m`, Name: `ssm-content-api`, Stage: `prod` (created 2026-06-21) |
| **API Gateway WebSocket** | ID: `uijimt1hpd`, Name: `ssm-content-ws` |
| **Base URL (REST)** | `https://v2pjhwhk0m.execute-api.eu-central-1.amazonaws.com/prod` |
| **WebSocket URL** | `wss://uijimt1hpd.execute-api.eu-central-1.amazonaws.com/prod` |
| **API Key Name** | `beforetomorrow-content-prod-key` (id `h9e3kai0o3`, enabled) |
| **API Key Value** | `UjYZq4hNsN2s7bgLav2QNYUodWvtKjc2VmCJfKU3` |
| **Usage Plan** | `beforetomorrow-content-prod-plan` (id `69vihk`) |
| **Job Creator Lambda** | `ssm-content-job-creator` (Python 3.11, 512MB, 900s timeout) |
| **Worker Lambda Prefix** | `ssm-content-worker-{service}` (env `WORKER_PREFIX=ssm-content-worker-`) |
| **DynamoDB Table** | `ssm-content-jobs` (partition key `jobId`; **TTL ≈ 24 h** — rows disappear, measured) |
| **S3 Bucket** | `beforetomorrow-content-prod` (eu-central-1) |
| **CDN** | `https://cdn.BeforeTomorrow.io` → CloudFront `E1PFA6UJ8OI2X8` → that bucket |
| **Worker env** | `S3_BUCKET=beforetomorrow-content-prod`, `CDN_BASE_URL=https://cdn.BeforeTomorrow.io` |

### Open migration item (measured 2026-08-09, stated because it changes what a client sees)

The pre-migration account is **SUPERSEDED** (AGENTS.md line 76) and is not documented here. One fact
about it still matters to whoever builds against this document: **on 2026-08-09 the live clients were
still calling the superseded account**, whose `job_creator` logged requests that day, while this
account's `job_creator` last logged **2026-07-20**. Both accounts run the same worker images and both
passed every video test in MEASURED REALITY, so repointing clients to the values above is a
configuration change, not a porting job. Until that happens, traffic sent to the URLs in this document
will be the only traffic this account sees.

### Container images come from a THIRD account, and that is by design

The worker Lambdas run container images from **126684668255** (`airithms_production`), which owns the ECR
repositories and the CodeBuild builders. This account holds its own copy of each image, pushed from there.
Deploy commands and image digests: `.claude/memory/infra.md`. No client ever calls that account.

### Production Status Overview

**v4 claimed "173 ready / 3 pending" for all 176 endpoints. That claim is NOT reproduced here**, because
it was not re-measured in this revision. What was measured on 2026-08-09 is listed per item in the next
section; every endpoint not named there is inherited from v4 and carries v4's (unverified) status.

**Endpoints with a MEASURED problem as of 2026-08-09 (each verified individually this date):**

| Endpoint | Measured state | Evidence |
|----------|----------------|----------|
| `image-vertex` | **FIXED 2026-08-12** — was BROKEN (85/149 job rows FAILED, retired `imagen-4.0-generate-001`); all 13 Vertex image-class endpoints migrated to the Gemini image family, deployed, and live-verified 13/13 COMPLETED + a 14/14 param-rich sweep the same day | Live jobs through `v2pjhwhk0m` 2026-08-12 (test tools `scripts/test_vertex_image_endpoints.ps1`, `scripts/test_vertex_param_surface.ps1`); closure record `.claude/memory/infra.md` |
| `video-openai` | **BROKEN — upstream billing** | job row error: `429 … "You have no credits remaining"`, `code: credit_balance_exhausted` |
| `animation-runway` | 2 FAILED / 1 COMPLETED in the same window; one earlier failure read `Runway API error 400: "You do not have enough credits to run this task."` | job rows + job_creator log |
| `music-elevenlabs` · `threed-vertex` · `lipsync-heygen` | v4's three pending items — **NOT re-measured in v5** | inherited from v4, treat as unverified |

---

## MEASURED REALITY — 2026-08-09 (what was tested this date, item by item)

Everything in this section is this-date tool output: CloudWatch logs, ECR digests, Lambda configs,
`s3api head-object`, `ffprobe` on the delivered files. Nothing here is inferred from a sibling result.

### The Veo model-ID fault and its fix (both video endpoints)

For roughly three months, `/create-video-vertex` answered its own documented default with a 404. The
deployed image mapped `veo-3.1` → `veo-3.1-generate-preview` and `veo-3.1-fast` →
`veo-3.1-fast-generate-preview`; Google retired both preview publisher models (documented deprecation
2026-04-02), so Vertex replied
`404 NOT_FOUND — Publisher Model … was not found or your project does not have access to it`
(measured in `/aws/lambda/ssm-content-worker-video-vertex` at 2026-05-09T15:14:32Z, 15:24:59Z, 15:27:30Z).

**Fixed:** the aliases now resolve to the GA models, and a request that explicitly names a retired
publisher ID is **redirected to its GA successor** with a printed warning rather than being sent to a
certain 404:

| what the client sends | publisher model actually called | worker log line |
|---|---|---|
| `veo-3.1` | `veo-3.1-generate-001` | — |
| `veo-3.1-fast` | `veo-3.1-fast-generate-001` | — |
| `veo-3.1-preview` | `veo-3.1-generate-001` | `[WARN] Model 'veo-3.1-generate-preview' was retired by Google (404 NOT_FOUND) — using 'veo-3.1-generate-001'` |
| `veo-3.1-fast-preview` | `veo-3.1-fast-generate-001` | same shape |
| `veo-3` / `veo-3-fast` / `veo-2` | unchanged (`veo-3.0-generate-001` etc.) | — |

**Deployed images (both accounts now run the same digest per endpoint):**

| endpoint | image | digest | rollback digest |
|---|---|---|---|
| `/create-video-vertex` | `ssm-content-assets-creator-video-v2` | `sha256:7aef11f75a19762d09ceb03e07682d952dde105e658c7128e1c06cbe1cfc15f5` (tag `build-20260809T190613Z`, 384,005,257 B) | `sha256:b4d6798290b719fb84cc76f51f762110fa5dd9ef8df1cdfe394ea19005d4b735` |
| `/create-video-vertex-v3` | `ssm-content-assets-creator-video-v3` | `sha256:f587fef87928a5af61fc4b0fc72d802575bc3742818025a6145cd5756c9265ac` (tag `build-20260809T195923Z`, 384,384,587 B) | acct A `sha256:f9040af4…` · acct B `sha256:bfbfcaa0…` (they were never the same image before today) |
| `/create-video-vertex-omni-flash` | **ZIP, not a container** (`lambda_function.py` + `models.py` + `config.py`, 13,359 B) + layer `ssm-content-vertex-layer:1` | code SHA-256 `vDD1hY3eVvOs5tsVO4u8CakD/FlccCx0ymlyDG/zGAU=` (deployed 2026-08-12T14:58:40Z) | previous zip versions retained at `artifacts/deploy-2026-08-12/video-vertex-omni-flash-v{1,2}.zip` |

### Five live generations, each invoked separately (5/5 PASS)

| # | endpoint | account | model sent | model CALLED (from that worker's own log) | bytes | gen time |
|---|---|---|---|---|---|---|
| 1 | `/create-video-vertex` | 060768936870 | `veo-3.1-fast` | `veo-3.1-fast-generate-001` | 1,172,924 | 36.4 s |
| 2 | `/create-video-vertex` | 060768936870 | `veo-3.1-preview` | redirected → `veo-3.1-generate-001` | 730,823 | 42.3 s |
| 3 | `/create-video-vertex` | 723322847393 | `veo-3.1-fast-preview` | redirected → `veo-3.1-fast-generate-001` | 1,273,628 | 30.2 s |
| 4 | `/create-video-vertex-v3` | 060768936870 | `veo-3.1-fast-preview` | redirected → `veo-3.1-fast-generate-001` | 139,101,060 | 103.6 s |
| 5 | `/create-video-vertex-v3` | 723322847393 | `veo-3.1` | `veo-3.1-generate-001` | 98,686,486 | 94.8 s |

Plus one full REST-API round trip on account A: `POST /create-video-vertex` → **202** with
`jobId 48bc7611-d02f-4c8c-a41f-b3d55a31a5a6` → row reached `COMPLETED` in **30.93 s**, 791,635 B.

### THE THREE VERTEX VIDEO ENDPOINTS ARE NOT INTERCHANGEABLE — measured with `ffprobe`, not read from the response

| property | `/create-video-vertex` | `/create-video-vertex-v3` | `/create-video-vertex-omni-flash` |
|---|---|---|---|
| delivered resolution | **1280×720** | **1920×1080** | **1280×720** (ffprobe-measured 2026-08-12; the surface has no `resolution` field at all) |
| what the JSON response reports | `1920x1080` — **a static label in the worker's own table, NOT the file** | matches the file | no per-file dimensions claimed; `output_envelope_documented` is labelled documented-not-measured |
| bitrate (4 s clip) | 1,458–2,541 kbps | **196,881–277,508 kbps** (`compression_quality: LOSSLESS`, hardcoded in that handler) | ~2,000 kbps class (0.98–1.05 MB per 4 s) |
| file size for 4 s | 0.7–1.3 MB | **98.7–139.1 MB** | **0.98–1.04 MB** |
| S3 prefix | `videos/` | `mobile-games/` | `video/vertex-omni-flash/` |
| response shape | `videos: [ { url, width, height, file_size_bytes, … } ]` + top-level `url` | **flat**: `url`, `public_url`, `resolution` (string), `file_size_bytes`, `model` | **flat** + `gcs_uri`, `interaction_id`, `task`, `estimated_cost_usd` |
| Lambda duration for a 4 s clip | ~52 s | ~100–110 s | **33–46 s** (33 s text-to-video, 45–46 s with image inputs) |
| duration range | 4–8 s per segment | 4, 6, 8 s | **3–10 s** (any integer) |
| native audio | yes | yes | yes, **plus two-speaker dialogue via `speech_config`** (the only one of the three with it) |
| cost | Veo rates (not measured on this account) | Veo rates (not measured on this account) | **$0.101/s measured** (5792 tok/s × $17.50/1M) |

Common to the two Veo endpoints, verified on all six delivered files: **4.01 s, h264, 24/1 fps, aac
48 kHz stereo.** Artefacts on disk: `artifacts/video-vertex-deploy-2026-08-09/` (6 MP4s + `frames/`).
The Omni Flash endpoint measures **h264 1280×720 24/1 fps + aac 48 kHz stereo** on its delivered file
(`artifacts/deploy-2026-08-12/dialogue-tr.mp4`, ffprobe 2026-08-12).

**Consequences a frontend MUST handle:** if you need 1080p, call `-v3` and budget ~25 MB/s of output; if
you need small files and fast turnaround, call the base endpoint and do NOT trust its `width`/`height`
fields; if you need **spoken dialogue, 3-second clips, or a measured per-second price**, call
`-omni-flash` — and note its 720p ceiling is a property of the surface, not a setting.
Read the delivered file's real dimensions if they matter.

### API-layer facts worth knowing before debugging a client

- `job_creator` resolves the path against its `SERVICE_MAP` **before** parsing the body, so a malformed
  body on a valid path returns `400 {"error": "Invalid JSON body"}` — that response proves the route
  exists. An unknown path returns `400 {"error": "Unknown path: …", "valid_paths": [...]}`.
- Stage `prod` on both REST APIs has **no access logging** (`accessLogSettings: null`), so there is no
  per-path request history; with the job table's ~24 h TTL, a complaint older than a day cannot be
  reconstructed from data. Only CloudWatch worker logs persist (`retentionInDays: null` = never expire).
- Docker container workers idle in `State: Inactive` and reactivate on first invoke — that is normal and
  is not a fault.

### Frontend .env.local (EXACT values to use)

```env
NEXT_PUBLIC_SSM_CONTENT_API_URL=https://v2pjhwhk0m.execute-api.eu-central-1.amazonaws.com/prod
SSM_CONTENT_API_KEY=UjYZq4hNsN2s7bgLav2QNYUodWvtKjc2VmCJfKU3
NEXT_PUBLIC_SSM_CONTENT_WS_URL=wss://uijimt1hpd.execute-api.eu-central-1.amazonaws.com/prod
NEXT_PUBLIC_SSM_CDN_URL=https://cdn.BeforeTomorrow.io
NEXT_PUBLIC_SSM_S3_BUCKET=beforetomorrow-content-prod
```

**The API key is named `SSM_CONTENT_API_KEY`, deliberately without `NEXT_PUBLIC_`.** A `NEXT_PUBLIC_`
variable is inlined into the browser bundle by Next.js, which would publish the key to anyone who opens
devtools, and the usage plan would then be consumed by whoever found it. The key is read server-side
only, in the route handler that injects `x-api-key` (v4 printed it as `NEXT_PUBLIC_SSM_CONTENT_API_KEY`
in the same block that told you to inject it server-side — those two instructions contradicted each
other).

## ARCHITECTURE -- How Every Request Flows

```
                           FRONTEND (Next.js)                           AWS BACKEND
+-----------------------------------------------------------------------+-------------------------------------------+
|                                                                       |                                           |
|  User clicks "Generate"                                               |                                           |
|       |                                                               |                                           |
|       v                                                               |                                           |
|  React Component (useCreateContent hook)                              |                                           |
|       |                                                               |                                           |
|       | POST /api/content/create  { endpoint, prompt, model, ... }    |                                           |
|       v                                                               |                                           |
|  Next.js API Route (app/api/content/[...path]/route.ts)               |                                           |
|       |  - Validates body with Zod                                    |                                           |
|       |  - Injects x-api-key header (server-side only)                |                                           |
|       |  - Forwards to AWS                                           |                                           |
|       |                                                               |                                           |
|       | POST https://v2pjhwhk0m...amazonaws.com/prod/create-image-vertex                                          |
|       | Headers: { "x-api-key": "z0JJ...", "Content-Type": "application/json" }                                   |
|       |                                                               |                                           |
+-------+---------------------------------------------------------------+-------------------------------------------+
        |                                                               |                                           |
        v                                                               v                                           |
  API Gateway (v2pjhwhk0m)                                    job_creator Lambda                                    |
  - Validates x-api-key                                       - Creates DynamoDB record (PENDING)                   |
  - Routes to job_creator                                     - Returns 202 { jobId, status, poll_url }             |
                                                              - Self-invokes async                                  |
                                                                      |                                            |
                                                                      v                                            |
                                                              Worker Lambda (ssm-content-worker-image-vertex)       |
                                                              - Calls provider API (Vertex AI / OpenAI / etc)      |
                                                              - Uploads result to S3                               |
                                                              - Updates DynamoDB: PROCESSING --> COMPLETED/FAILED  |
                                                              - result contains CDN URL                            |
                                                                                                                   |
+------------------------------------------------------------------------------------------------------------------+

  POLLING (frontend):
  GET /api/content/jobs/{jobId}  -->  DynamoDB lookup  -->  { status, result }
  
  Status flow:  PENDING --> PROCESSING --> COMPLETED | FAILED
  Poll interval: 2s (first 10s) --> 5s (next 50s) --> 10s (after 60s)
  Max poll time: 15 minutes (900s Lambda timeout)
  
  CDN URL Normalization (job_creator):
  The job_creator _normalize_result function automatically fixes legacy CDN URLs.
  - s3://beforetomorrow-content-prod/... → https://cdn.BeforeTomorrow.io/...
  - https://assets.ssm.ideasets.com/... → https://cdn.BeforeTomorrow.io/...
  All result URLs are guaranteed to use https://cdn.BeforeTomorrow.io as the CDN base.
```

### DynamoDB Job Record Schema

```typescript
interface JobRecord {
  jobId: string;           // UUID v4 (partition key)
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  service: string;         // e.g. "image-vertex", "video-kling"
  callerKeyHash: string;   // SHA256 hash of API key (first 16 chars)
  createdAt: string;       // ISO 8601 UTC
  updatedAt: string;       // ISO 8601 UTC
  ttl: number;             // Unix epoch + 86400 (24h auto-delete)
  input: string;           // JSON string of request body (max 10KB)
  result?: string;         // JSON string with CDN URL (max 400KB, only on COMPLETED)
  error?: string;          // Error message (only on FAILED)
  durationSeconds?: string; // Worker execution time
}
```

### Result Shape (COMPLETED jobs)

```typescript
interface JobResult {
  url: string;             // CDN URL: https://cdn.BeforeTomorrow.io/images/vertex/abc123.png
  urls?: string[];         // Multiple outputs (when count > 1)
  format: string;          // "png", "jpeg", "mp4", "mp3", "wav", "glb", "fbx", etc.
  width?: number;
  height?: number;
  duration?: number;       // For video/audio in seconds
  metadata?: Record<string, unknown>;
}
```

### Endpoint Naming Convention

ALL endpoints follow this pattern:
- Standard: `POST /create-{contentType}-{provider}`
- 3D only:  `POST /3d-create-{provider}` (exception: /3d-create- prefix instead of /create-threed-)

Examples:
- `/create-image-vertex` --> worker: `ssm-content-worker-image-vertex`
- `/create-video-kling`  --> worker: `ssm-content-worker-video-kling`
- `/3d-create-meshy`     --> worker: `ssm-content-worker-threed-meshy`

### CORS Configuration

**Live inventory, measured 2026-08-12 on `v2pjhwhk0m`: 175 resources carry a POST, 176 carry an
OPTIONS, and zero POST resources lack an OPTIONS.** (The one extra OPTIONS belongs to a non-POST
resource such as the `/jobs/{jobId}` polling path.) Every POST endpoint has CORS configured:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type, X-Api-Key, Authorization`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`

## COMPLETE ENDPOINT REGISTRY (179 active + 1 planned)

> **🔴 THE PREVIOUS HEADLINE WAS WRONG AND IS CORRECTED HERE, 2026-08-15, by machine count rather than
> by inheritance.** Revisions up to 2026-08-12 claimed **"174 active"** while this registry's own lines
> already numbered 178 — the headline had been carried forward by hand while paths were appended, which
> is precisely the class of error `scripts/verify_v5_registry_arithmetic.py` now prevents by counting
> both sides.
>
> **Measured this session, three lists reconciled against each other** by
> `scripts/reconcile_v5_registry_with_live_api.py` (which carries two negative controls proving it can
> fail):
>
> | List | Count | How it was obtained |
> |---|---|---|
> | This registry's active `POST` lines | **179** | counted in the file, per category; every category's declared count equals its listed lines |
> | This registry's `PLANNED` lines | **1** | `/3d-create-vertex`, marked PLANNED |
> | Live REST API `v2pjhwhk0m` resources carrying `POST` | **180** | `aws apigateway get-resources --limit 500` |
> | Live router `ssm-content-job-creator` SERVICE_MAP entries | **180** | read from the deployed source pulled this session |
>
> **The 179 ↔ 180 difference is named, not averaged:** the gateway's extra POST path is
> **`/enhance-prompt`**, a helper route that is not an asset-generation endpoint and therefore is not
> listed among the generation endpoints below. **Paths in the gateway that the router cannot dispatch:
> 0. Router entries with no gateway path: 0.** That two-way check is the one that catches a route wired
> at the gateway but invisible to the router (which would answer 400 forever) and its opposite.
>
> `/generate-music-hybrid-model` — the Music Studio conductor — was added and live-verified on
> 2026-08-15 (section 9.8). The account's `ssm-content-worker-*` Lambda count is from the 2026-08-12
> measurement (**190** workers, 197 Lambdas in total) plus the one created 2026-08-15; it exceeds the
> endpoint count because some workers are invoke-only or superseded.

### Image (13 endpoints)
POST /create-image-vertex        --> ssm-content-worker-image-vertex
POST /create-image-openai        --> ssm-content-worker-image-openai
POST /create-image-stability     --> ssm-content-worker-image-stability
POST /create-image-luma          --> ssm-content-worker-image-luma
POST /create-image-kling         --> ssm-content-worker-image-kling
POST /create-image-runway        --> ssm-content-worker-image-runway
POST /create-image-fal           --> ssm-content-worker-image-fal
POST /create-image-flux          --> ssm-content-worker-image-flux
POST /create-image-ideogram      --> ssm-content-worker-image-ideogram
POST /create-image-recraft       --> ssm-content-worker-image-recraft
POST /create-image-nano          --> ssm-content-worker-image-nano
POST /create-image-qwen          --> ssm-content-worker-image-qwen
POST /create-image-seedream      --> ssm-content-worker-image-seedream

### Avatar (10 endpoints)
POST /create-avatar-vertex       --> ssm-content-worker-avatar-vertex
POST /create-avatar-openai       --> ssm-content-worker-avatar-openai
POST /create-avatar-stability    --> ssm-content-worker-avatar-stability
POST /create-avatar-luma         --> ssm-content-worker-avatar-luma
POST /create-avatar-kling        --> ssm-content-worker-avatar-kling
POST /create-avatar-runway       --> ssm-content-worker-avatar-runway
POST /create-avatar-fal          --> ssm-content-worker-avatar-fal
POST /create-avatar-flux         --> ssm-content-worker-avatar-flux
POST /create-avatar-ideogram     --> ssm-content-worker-avatar-ideogram
POST /create-avatar-recraft      --> ssm-content-worker-avatar-recraft

### Logo (10 endpoints)
POST /create-logo-vertex         --> ssm-content-worker-logo-vertex
POST /create-logo-openai         --> ssm-content-worker-logo-openai
POST /create-logo-stability      --> ssm-content-worker-logo-stability
POST /create-logo-luma           --> ssm-content-worker-logo-luma
POST /create-logo-kling          --> ssm-content-worker-logo-kling
POST /create-logo-runway         --> ssm-content-worker-logo-runway
POST /create-logo-fal            --> ssm-content-worker-logo-fal
POST /create-logo-flux           --> ssm-content-worker-logo-flux
POST /create-logo-ideogram       --> ssm-content-worker-logo-ideogram
POST /create-logo-recraft        --> ssm-content-worker-logo-recraft

### Icon (10 endpoints)
POST /create-icon-vertex         --> ssm-content-worker-icon-vertex
POST /create-icon-openai         --> ssm-content-worker-icon-openai
POST /create-icon-stability      --> ssm-content-worker-icon-stability
POST /create-icon-luma           --> ssm-content-worker-icon-luma
POST /create-icon-kling          --> ssm-content-worker-icon-kling
POST /create-icon-runway         --> ssm-content-worker-icon-runway
POST /create-icon-fal            --> ssm-content-worker-icon-fal
POST /create-icon-flux           --> ssm-content-worker-icon-flux
POST /create-icon-ideogram       --> ssm-content-worker-icon-ideogram
POST /create-icon-recraft        --> ssm-content-worker-icon-recraft

### Sprite (10 endpoints)
POST /create-sprite-vertex       --> ssm-content-worker-sprite-vertex
POST /create-sprite-openai       --> ssm-content-worker-sprite-openai
POST /create-sprite-stability    --> ssm-content-worker-sprite-stability
POST /create-sprite-luma         --> ssm-content-worker-sprite-luma
POST /create-sprite-kling        --> ssm-content-worker-sprite-kling
POST /create-sprite-runway       --> ssm-content-worker-sprite-runway
POST /create-sprite-fal          --> ssm-content-worker-sprite-fal
POST /create-sprite-flux         --> ssm-content-worker-sprite-flux
POST /create-sprite-ideogram     --> ssm-content-worker-sprite-ideogram
POST /create-sprite-recraft      --> ssm-content-worker-sprite-recraft

### Video (14 endpoints)
POST /create-video-vertex        --> ssm-content-worker-video-vertex
POST /create-video-vertex-v3     --> ssm-content-worker-video-vertex-v3
POST /create-video-vertex-omni-flash --> ssm-content-worker-video-vertex-omni-flash
POST /create-video-openai        --> ssm-content-worker-video-openai
POST /create-video-kling         --> ssm-content-worker-video-kling
POST /create-video-luma          --> ssm-content-worker-video-luma
POST /create-video-runway        --> ssm-content-worker-video-runway
POST /create-video-fal           --> ssm-content-worker-video-fal
POST /create-video-minimax       --> ssm-content-worker-video-minimax
POST /create-video-mochi         --> ssm-content-worker-video-mochi
POST /create-video-hunyuan       --> ssm-content-worker-video-hunyuan
POST /create-video-pixverse      --> ssm-content-worker-video-pixverse
POST /create-video-ltx           --> ssm-content-worker-video-ltx
POST /create-video-heygen        --> ssm-content-worker-video-heygen

### Animation (6 endpoints)
POST /create-animation-vertex    --> ssm-content-worker-animation-vertex
POST /create-animation-luma      --> ssm-content-worker-animation-luma
POST /create-animation-kling     --> ssm-content-worker-animation-kling
POST /create-animation-runway    --> ssm-content-worker-animation-runway
POST /create-animation-fal       --> ssm-content-worker-animation-fal
POST /create-animation-minimax   --> ssm-content-worker-animation-minimax

### Voice (9 endpoints)
POST /create-voice-elevenlabs    --> ssm-content-worker-voice-elevenlabs
POST /create-voice-gemini        --> ssm-content-worker-voice-gemini
POST /create-voice-minimax       --> ssm-content-worker-voice-minimax
POST /create-voice-xai           --> ssm-content-worker-voice-xai
POST /create-voice-dia           --> ssm-content-worker-voice-dia
POST /create-voice-f5            --> ssm-content-worker-voice-f5
POST /create-voice-chatterbox    --> ssm-content-worker-voice-chatterbox
POST /create-voice-inworld       --> ssm-content-worker-voice-inworld
POST /create-voice-vertex-tts    --> ssm-content-worker-voice-vertex-tts

### Music (8 endpoints)
POST /create-music-elevenlabs    --> ssm-content-worker-music-elevenlabs
POST /create-music-minimax       --> ssm-content-worker-music-minimax
POST /create-music-stable        --> ssm-content-worker-music-stable
POST /create-music-ace           --> ssm-content-worker-music-ace
POST /create-music-beatoven      --> ssm-content-worker-music-beatoven
POST /create-music-stability     --> ssm-content-worker-music-stability
POST /create-music-lyria         --> ssm-content-worker-music-lyria
POST /generate-music-hybrid-model --> ssm-content-worker-generate-music-hybrid-model   # Music Studio conductor, NEW + live-verified 2026-08-15 (section 9.8)

### Speech-to-text / native audio (2 endpoints -- NEW 2026-08-13, Vertex AI)
POST /create-stt-vertex          --> ssm-content-worker-stt-vertex
POST /create-audio-live-gemini   --> ssm-content-worker-audio-live-gemini

### SFX (6 endpoints)
POST /create-sfx-beatoven        --> ssm-content-worker-sfx-beatoven
POST /create-sfx-mirelo          --> ssm-content-worker-sfx-mirelo
POST /create-sfx-mmaudio         --> ssm-content-worker-sfx-mmaudio
POST /create-sfx-elevenlabs      --> ssm-content-worker-sfx-elevenlabs
POST /create-sfx-ace             --> ssm-content-worker-sfx-ace
POST /create-sfx-multi           --> ssm-content-worker-sfx-multi

### 3D (6 deployed + 1 planned -- note: /3d-create- prefix)
POST /3d-create-stability        --> ssm-content-worker-3d
POST /3d-create-meshy            --> ssm-content-worker-threed-meshy
POST /3d-create-hunyuan3d        --> ssm-content-worker-threed-hunyuan3d
POST /3d-create-trellis          --> ssm-content-worker-threed-trellis
POST /3d-create-triposr          --> ssm-content-worker-threed-triposr
POST /3d-create-tripo3d          --> ssm-content-worker-threed-tripo3d
POST /3d-create-vertex           (PLANNED -- not yet in API Gateway)

### Editing & Utility (13 endpoints)
POST /create-upscale-vertex      --> ssm-content-worker-upscale-vertex
POST /create-upscale-fal         --> ssm-content-worker-upscale-fal
POST /create-subtitle-aws        --> ssm-content-worker-subtitle-aws
POST /create-lipsync-fal         --> ssm-content-worker-lipsync-fal
POST /create-lipsync-kling       --> ssm-content-worker-lipsync-kling
POST /create-lipsync-omnihuman   --> ssm-content-worker-lipsync-omnihuman
POST /create-lipsync-heygen      --> ssm-content-worker-lipsync-heygen
POST /create-tryon-kling         --> ssm-content-worker-tryon-kling
POST /create-erase-fal           --> ssm-content-worker-erase-fal
POST /create-bgremove-fal        --> ssm-content-worker-bgremove-fal
POST /create-outpaint-fal        --> ssm-content-worker-outpaint-fal
POST /create-dubbing-elevenlabs  --> ssm-content-worker-dubbing-elevenlabs
POST /create-isolate-elevenlabs  --> ssm-content-worker-isolate-elevenlabs

### Inpaint (4 endpoints)
POST /create-inpaint-fal         --> ssm-content-worker-inpaint-fal
POST /create-inpaint-stability   --> ssm-content-worker-inpaint-stability
POST /create-inpaint-openai      --> ssm-content-worker-inpaint-openai
POST /create-inpaint-vertex      --> ssm-content-worker-inpaint-vertex

### Style Transfer (2 endpoints)
POST /create-styletransfer-fal       --> ssm-content-worker-styletransfer-fal
POST /create-styletransfer-stability --> ssm-content-worker-styletransfer-stability

### Sketch (2 endpoints)
POST /create-sketch-fal       --> ssm-content-worker-sketch-fal
POST /create-sketch-stability --> ssm-content-worker-sketch-stability

### Search & Replace (1 endpoint)
POST /create-searchreplace-stability --> ssm-content-worker-searchreplace-stability

### Recolor (1 endpoint)
POST /create-recolor-stability --> ssm-content-worker-recolor-stability

### Colorize (1 endpoint)
POST /create-colorize-fal --> ssm-content-worker-colorize-fal

### Face Swap (1 endpoint)
POST /create-faceswap-fal --> ssm-content-worker-faceswap-fal

### Face ID (2 endpoints)
POST /create-faceid-fal       --> ssm-content-worker-faceid-fal
POST /create-faceid-instantid --> ssm-content-worker-faceid-instantid

### Live Portrait (1 endpoint)
POST /create-liveportrait-fal --> ssm-content-worker-liveportrait-fal

### Restyle (1 endpoint)
POST /create-restyle-kling --> ssm-content-worker-restyle-kling

### Texture (2 endpoints)
POST /create-texture-fal       --> ssm-content-worker-texture-fal
POST /create-texture-stability --> ssm-content-worker-texture-stability

### Skybox / Panorama (2 endpoints)
POST /create-skybox-fal      --> ssm-content-worker-skybox-fal
POST /create-skybox-blockade --> ssm-content-worker-skybox-blockade

### Depth Map (2 endpoints)
POST /create-depthmap-fal      --> ssm-content-worker-depthmap-fal
POST /create-depthmap-marigold --> ssm-content-worker-depthmap-marigold

### Normal Map (1 endpoint)
POST /create-normalmap-fal --> ssm-content-worker-normalmap-fal

### Segmentation (1 endpoint)
POST /create-segment-fal --> ssm-content-worker-segment-fal

### Pattern (2 endpoints)
POST /create-pattern-fal       --> ssm-content-worker-pattern-fal
POST /create-pattern-stability --> ssm-content-worker-pattern-stability

### Coloring Page (2 endpoints)
POST /create-coloringpage-fal       --> ssm-content-worker-coloringpage-fal
POST /create-coloringpage-stability --> ssm-content-worker-coloringpage-stability

### Sticker (3 endpoints)
POST /create-sticker-fal       --> ssm-content-worker-sticker-fal
POST /create-sticker-openai    --> ssm-content-worker-sticker-openai
POST /create-sticker-stability --> ssm-content-worker-sticker-stability

### QR Art (1 endpoint)
POST /create-qrart-fal --> ssm-content-worker-qrart-fal

### Mockup (1 endpoint)
POST /create-mockup-fal --> ssm-content-worker-mockup-fal

### Product Photo (3 endpoints)
POST /create-productphoto-fal       --> ssm-content-worker-productphoto-fal
POST /create-productphoto-stability --> ssm-content-worker-productphoto-stability
POST /create-productphoto-vertex    --> ssm-content-worker-productphoto-vertex

### Voice Clone (1 endpoint)
POST /create-voiceclone-elevenlabs --> ssm-content-worker-voiceclone-elevenlabs

### Speech-to-Speech (1 endpoint)
POST /create-speechtospeech-elevenlabs --> ssm-content-worker-speechtospeech-elevenlabs

### Voice Design (1 endpoint)
POST /create-voicedesign-elevenlabs --> ssm-content-worker-voicedesign-elevenlabs

### Dialogue (2 endpoints)
POST /create-dialogue-openai --> ssm-content-worker-dialogue-openai
POST /create-dialogue-vertex --> ssm-content-worker-dialogue-vertex

### Translation (2 endpoints)
POST /create-translation-deepl  --> ssm-content-worker-translation-deepl
POST /create-translation-vertex --> ssm-content-worker-translation-vertex

### Transcription (2 endpoints)
POST /create-transcription-aws --> ssm-content-worker-transcription-aws
POST /create-transcription-fal --> ssm-content-worker-transcription-fal

### Comic (2 endpoints)
POST /create-comic-fal    --> ssm-content-worker-comic-fal
POST /create-comic-vertex --> ssm-content-worker-comic-vertex

### Tattoo Design (2 endpoints)
POST /create-tattoo-fal       --> ssm-content-worker-tattoo-fal
POST /create-tattoo-stability --> ssm-content-worker-tattoo-stability

### Architectural Render (2 endpoints)
POST /create-archrender-fal       --> ssm-content-worker-archrender-fal
POST /create-archrender-stability --> ssm-content-worker-archrender-stability

### Vector / SVG (1 endpoint)
POST /create-vector-fal --> ssm-content-worker-vector-fal

### Presentation (2 endpoints)
POST /create-presentation-fal    --> ssm-content-worker-presentation-fal
POST /create-presentation-vertex --> ssm-content-worker-presentation-vertex

### Infographic (2 endpoints)
POST /create-infographic-fal    --> ssm-content-worker-infographic-fal
POST /create-infographic-vertex --> ssm-content-worker-infographic-vertex

### Terrain / Heightmap (1 endpoint)
POST /create-terrain-fal --> ssm-content-worker-terrain-fal

### VFX / Particle Effects (1 endpoint)
POST /create-vfx-fal --> ssm-content-worker-vfx-fal

### Font / Typography (1 endpoint)
POST /create-font-fal --> ssm-content-worker-font-fal

### Document Design (2 endpoints)
POST /create-document-fal    --> ssm-content-worker-document-fal
POST /create-document-vertex --> ssm-content-worker-document-vertex

### Pose Generation (1 endpoint)
POST /create-pose-fal --> ssm-content-worker-pose-fal

## SECURITY & AUTH -- MANDATORY FOR EVERY REQUEST

```typescript
// lib/api-client.ts -- ALL requests MUST go through this wrapper
const API_BASE = process.env.NEXT_PUBLIC_SSM_CONTENT_API_URL; // https://v2pjhwhk0m.execute-api.eu-central-1.amazonaws.com/prod
const API_KEY  = process.env.SSM_CONTENT_API_KEY; // Server-side route.ts ONLY - NOT NEXT_PUBLIC_ (that would ship it to the browser)
// CRITICAL: API key must NEVER be in client-side code.
// Use Next.js API routes as Backend-For-Frontend (BFF) proxy:
//   Client --> /api/content/create --> Server-side fetch with API key --> AWS API Gateway
interface ContentApiOptions {
  endpoint: string;      // e.g. "/create-image-vertex"
  body: Record<string, unknown>;
  signal?: AbortSignal;  // For cancellation
}
async function contentApiPost({ endpoint, body, signal }: ContentApiOptions) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,  // Injected server-side only
    },
    body: JSON.stringify(body),
    signal,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ContentApiError(res.status, err.error || err.message);
  }
  
  return res.json(); // { jobId, status, poll_url }
}
```

### Security Checklist (EVERY implementation must satisfy ALL):

1. **API Key Protection** -- `x-api-key` stored in `.env.local` as `SSM_CONTENT_API_KEY` (v5 correction:
   **never** `NEXT_PUBLIC_`, which Next.js inlines into the browser bundle),
   accessed ONLY in Next.js API routes (`route.ts`). Never expose directly in client-side code.

2. **BFF Proxy Pattern** -- Create `/app/api/content/[...path]/route.ts` that:
   - Validates user session (Cognito JWT via cookies/headers)
   - Rate-limits per user (in-memory or Redis)
   - Validates request body schema with Zod BEFORE forwarding
   - Injects `x-api-key` server-side
   - Forwards to AWS API Gateway
   - Returns jobId to client

3. **Input Validation (Zod)** -- Every form submission MUST be validated:
   - Prompt length limits (varies per handler -- see each handler section)
   - Model value is in the allowed set (see each handler's Models table)
   - Enum values match exactly (e.g. aspect_ratio, quality, style)
   - Numeric ranges enforced (e.g. duration 3-15, scale 1-5)
   - URL fields are valid URLs (image_url, video_url, audio_url)
   - Required fields per generation_type are present

4. **CORS** -- API Gateway OPTIONS methods return `Access-Control-Allow-Origin: *`.
   Headers: `Content-Type, X-Api-Key, Authorization`. Methods: `GET, POST, OPTIONS`.

5. **Rate Limiting** -- Implement per-user limits:
   - Image generation: 20/min
   - Video generation: 5/min
   - Voice/Music: 10/min
   - 3D generation: 3/min

6. **File Upload Security** -- For image_url, video_url, audio_url:
   - Validate URL protocol is https://
   - Validate file extension and MIME type
   - Maximum file sizes: images 20MB, videos 500MB, audio 100MB
   - Never pass user-provided URLs directly to Lambda without validation

## JOB LIFECYCLE & POLLING -- TanStack Query Pattern

```typescript
// lib/queries/content.ts
// Step 1: Create job
export function useCreateContent(contentType: string, provider: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: Record<string, unknown>) => {
      const res = await fetch(`/api/content/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: `/create-${contentType}-${provider}`,
          ...params,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json() as Promise<{ jobId: string; status: string; poll_url: string }>;
    },
    onSuccess: (data) => {
      // Start polling immediately
      queryClient.setQueryData(["content-job", data.jobId], data);
    },
  });
}
// Step 2: Poll job status
export function useContentJob(jobId: string | null) {
  return useQuery({
    queryKey: ["content-job", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/content/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      return res.json() as Promise<ContentJobResult>;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "COMPLETED" || status === "FAILED") return false;
      if (status === "PROCESSING") return 2000;  // 2s when processing
      return 3000;  // 3s when pending
    },
    staleTime: 0,  // Always fresh
  });
}
// TypeScript types for job responses
interface ContentJobResult {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress?: number;           // 0-100
  progressMessage?: string;    // Human-readable status
  result?: {
    url: string;              // CDN URL of generated asset
    s3_key: string;           // S3 path
    metadata: Record<string, unknown>;
  };
  error?: string;
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
}
```

**Job Statuses:**
- `PENDING` --> Job created, worker Lambda not yet invoked
- `PROCESSING` --> Worker Lambda running, `progress` field updates in real-time
- `COMPLETED` --> Asset generated, `result.url` contains CDN URL
- `FAILED` --> Generation failed, `error` field contains reason
**Job TTL:** 24 hours. After that, DynamoDB record is deleted.

**S3 Bucket:** `beforetomorrow-content-prod`

**CDN Base:** `https://cdn.BeforeTomorrow.io`

## CONTENT TYPE --> FORM COMPONENT MAPPING
Each content type needs a dedicated form component with provider-specific fields:

| Content Type | Form Component | Key Dynamic Fields |
|-------------|---------------|-------------------|
| image | `<ImageGeneratorForm>` | model, prompt, aspect_ratio, quality, style, negative_prompt |
| avatar | `<AvatarGeneratorForm>` | Same as image + avatar-specific prompt templates |
| logo | `<LogoGeneratorForm>` | Same as image + `brand_name` (Vertex only) |
| icon | `<IconGeneratorForm>` | Same as image, square aspect_ratio forced |
| sprite | `<SpriteGeneratorForm>` | Same as image, sprite-sheet specific prompts |
| video | `<VideoGeneratorForm>` | model, prompt, duration, aspect_ratio, generation_type, image_url |
| animation | `<AnimationGeneratorForm>` | Similar to video + keyframes, loop, concepts |
| voice | `<VoiceGeneratorForm>` | text, voice_id, model, emotion, speed, language |
| music | `<MusicGeneratorForm>` | prompt/tags, duration, genre, mood, use_case, instruments |
| sfx | `<SfxGeneratorForm>` | prompt/text, duration, video_url (optional) |
| threed | `<ThreeDGeneratorForm>` | prompt/image_url, topology, texture, rigging, animation |
| upscale | `<UpscaleForm>` | image_url/video_url, scale, creativity |
| lipsync | `<LipsyncForm>` | video_url/image_url, audio_url, model |
| subtitle | `<SubtitleForm>` | audio_url, language, output_formats, translate_to |
| tryon | `<TryOnForm>` | human_image_url, garment_image_url |

## PROVIDER SELECTOR PATTERN
Every content type has multiple providers. The UI must:

1. Show a **provider selector** (tabs or dropdown) at the top of each form
2. When provider changes, **dynamically update** available models and parameters
3. Model selector dropdown populated from the Models table of the selected provider
4. Parameter fields shown/hidden based on selected model and generation_type
5. Allowed values for dropdowns (aspect_ratio, quality, style, etc.) change per provider

```typescript
// types/content.ts -- Provider registry pattern
interface ProviderConfig {
  id: string;                  // e.g. "vertex", "openai", "kling"
  name: string;                // Display name
  models: ModelConfig[];       // Available models
  parameters: ParameterConfig[]; // Form fields
  promptLimit: number;         // Max prompt chars
  outputFormat: string;        // "png", "mp4", "wav", "glb", etc.
}
interface ModelConfig {
  value: string;               // API value
  label: string;               // Display name
  isDefault?: boolean;
}
interface ParameterConfig {
  name: string;                // API param name
  type: "string" | "integer" | "float" | "boolean" | "select" | "array";
  required: boolean;
  default?: unknown;
  allowedValues?: (string | number)[];
  min?: number;
  max?: number;
  dependsOn?: { field: string; values: string[] }; // Show only when condition met
  modelSpecific?: string[];    // Show only for these models
}
```

## COMPLETE MODEL REGISTRY (for frontend dropdowns)

### Image Provider Models
vertex:     gemini-3.1-flash-image(default), gemini-3-pro-image, gemini-2.5-flash-image — legacy imagen-4/imagen-4-fast/imagen-4-ultra/imagen-3/imagen-3-fast values still accepted (auto-mapped; Imagen retired on Vertex 2026-06-30)

openai:     gpt-image-1(default), gpt-image-1.5, dall-e-3

stability:  sd3(default), sd3.5-large, sd3.5-large-turbo, sd3.5-medium, sd3.5-flash, stable-image-ultra, stable-image-core

luma:       photon-1(default), photon-flash-1

kling:      kling-v2-1(default), kling-v1, kling-v1-5, kling-v2, kling-v2-new, kling-v3, image-o1

runway:     gen4_image(default), gen4_image_turbo, gemini_2.5_flash

fal:        fal-ai/flux-pro/v1.1(default), fal-ai/flux-pro/v1.1-ultra, fal-ai/flux/dev, fal-ai/ideogram/v3, fal-ai/recraft/v3/text-to-image, fal-ai/stable-diffusion-v35-large

flux:       fal-ai/flux-pro/v1.1(default), fal-ai/flux-pro/v1.1-ultra, fal-ai/flux/dev

ideogram:   fal-ai/ideogram/v3 (single)

recraft:    fal-ai/recraft/v3/text-to-image (single)

nano:       fal-ai/nano-banana-2(default), fal-ai/nano-banana-pro

qwen:       fal-ai/qwen-image-2/text-to-image(default), fal-ai/qwen-image-2/pro/text-to-image

seedream:   fal-ai/bytedance/seedream/v5/lite/text-to-image (single)

### Video Provider Models
vertex:     veo-2, veo-3, veo-3-fast, veo-3.1, veo-3.1-fast(default)

openai:     sora(default)

kling:      kling-v3, kling-v2-6(default), kling-v2-5-turbo, kling-v2-1-master, kling-v1-6, kling-v1-5, kling-v1

luma:       ray-3.14, ray-3, ray-2(default), ray-flash-2

runway:     gen4_turbo(default), gen4.5, gen3a_turbo, gen4_aleph

fal:        fal-ai/wan/v2.1/1.3b/text-to-video, fal-ai/wan/v2.1/14b/text-to-video, fal-ai/hunyuan-video, fal-ai/mochi-v1, fal-ai/kling-video/v2/master/text-to-video, fal-ai/minimax/video-01/text-to-video, fal-ai/luma-dream-machine, fal-ai/cogvideox-5b, fal-ai/ltx-video/v0.9.1, fal-ai/veo2, fal-ai/pixverse/v4.5/text-to-video

minimax:    fal-ai/minimax/video-01/text-to-video(default), fal-ai/minimax/video-01-live/text-to-video, fal-ai/minimax/hailuo-02/standard/text-to-video

ltx:        fal-ai/ltx-video/v0.9.1(default), fal-ai/ltx-video/v0.9.1/image-to-video

heygen:     fal-ai/heygen/video-translate(default)

mochi:      fal-ai/mochi-v1 (single)

hunyuan:    fal-ai/hunyuan-video (single)

pixverse:   fal-ai/pixverse/v4.5/image-to-video (single)

### Animation Provider Models
kling:      kling-v3, kling-v2-6(default), kling-v2-5-turbo, kling-v2-1-master, kling-v1-6, kling-v1-5, kling-v1

luma:       ray-3.14, ray-3, ray-2(default), ray-flash-2

minimax:    fal-ai/minimax/video-01-live(default), fal-ai/minimax/video-01-live/image-to-video, fal-ai/minimax/hailuo-02/standard/image-to-video

runway:     gen4_turbo(default), gen4.5, gen3a_turbo, gen4_aleph

### Voice Provider Models
elevenlabs: eleven_turbo_v2_5(default), eleven_v3, eleven_v3_conversational, eleven_flash_v2_5, eleven_flash_v2, eleven_multilingual_v2, eleven_turbo_v2, eleven_monolingual_v1, eleven_multilingual_v1

gemini:     gemini-2.5-flash-tts(default), gemini-2.5-pro-tts

minimax:    speech-02-hd(default)

xai:        tts-1 (single)

dia:        fal-ai/dia-tts/v0.1 (single)

f5:         fal-ai/f5-tts (single)

chatterbox: fal-ai/chatterbox/text-to-speech(default), /turbo, /multilingual

inworld:    tts-1.5-max (single)

### Music Provider Models
elevenlabs: music_v1 (single)

minimax:    fal-ai/minimax/music (single)

stable:     fal-ai/stable-audio (single)

ace:        fal-ai/ace-step (single)

beatoven:   beatoven/music-generation (single)

stability:  stable-audio-2, stable-audio-2.5(default)

### 3D Provider Models
meshy:      fal-ai/meshy/v6/text-to-3d(default), fal-ai/meshy/v6/image-to-3d

hunyuan3d:  fal-ai/hunyuan3d (single)

trellis:    fal-ai/trellis (single)

triposr:    fal-ai/triposr (single)

tripo3d:    tripo3d/tripo/v2.5/image-to-3d (single)

### Editing Provider Models
upscale-fal:   fal-ai/creative-upscaler(default), fal-ai/video-upscaler

erase-fal:     fal-ai/finegrain-eraser(default), fal-ai/bria/eraser

lipsync-fal:   fal-ai/sync-lipsync/v2(default), fal-ai/sync-lipsync/v2/pro

lipsync-omnihuman: fal-ai/bytedance/omnihuman (single)

lipsync-heygen:    fal-ai/heygen/avatar-iv (single)

## PROMPT CHARACTER LIMITS (per provider)

| Provider | Limit | Content Types |
|----------|-------|---------------|
| Vertex AI Gemini Image (ex-Imagen) | No hard limit | image, avatar, logo, icon, sprite |
| OpenAI DALL-E 3 | 4,000 chars | image, avatar, logo, icon, sprite |
| OpenAI GPT Image | 32,000 chars | image, avatar, logo, icon, sprite |
| Stability AI | 10,000 chars | image, avatar, logo, icon, sprite |
| fal.ai (all) | 5,000 chars | image, video, voice, music, sfx |
| Kling AI | 2,500 chars | image, video, animation |
| Runway ML | 1,500 chars | image, video |
| Luma Labs | 2,000 chars | image, video, animation |
| ElevenLabs Voice | 5,000 chars | voice |
| ElevenLabs Music | 5,000 chars | music |
| ElevenLabs SFX | 1,000 chars | sfx |
| Inworld TTS | 5,000 chars | voice |
| Meshy 3D | 600 chars | threed |
| Vertex AI Veo | No hard limit | video, animation |

## ASPECT RATIO VALUES (per provider)

| Provider | Allowed Values |
|----------|---------------|
| Vertex AI | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| OpenAI DALL-E 3 | `1024x1024`, `1792x1024`, `1024x1792` |
| OpenAI GPT Image | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| Stability AI | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| Kling AI | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` |
| Runway ML | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| Luma Labs | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9`, `9:21` |
| Flux Ultra | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| Video Kling | `16:9`, `9:16`, `1:1` |
| Video Luma | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9`, `9:21` |
| Video Vertex | `16:9`, `9:16` |

## S3 PATH PATTERNS (per content type)

| Content Type | S3 Prefix | Example |
|-------------|-----------|---------|
| image | `images/{provider}/` | `images/vertex/abc123.png` |
| avatar | `avatars/{provider}/` | `avatars/openai/def456.png` |
| logo | `logos/{provider}/` | `logos/vertex/ghi789.png` |
| icon | `icons/{provider}/` | `icons/flux/jkl012.png` |
| sprite | `sprites/{provider}/` | `sprites/stability/mno345.png` |
| video | `videos/{provider}/` | `videos/kling/pqr678.mp4` — **exceptions, measured:** `video-vertex-v3` writes to `mobile-games/` and `video-vertex-omni-flash` to `video/vertex-omni-flash/` |
| animation | `animations/{provider}/` | `animations/luma/stu901.mp4` |
| voice | `voices/{provider}/` | `voices/elevenlabs/vwx234.mp3` |
| music | `music/{provider}/` | `music/stability/yza567.mp3` |
| sfx | `sfx/{provider}/` | `sfx/elevenlabs/bcd890.mp3` |
| threed | `3d/{provider}/` | `3d/meshy/efg123.glb` |
| subtitle | `subtitles/aws/` | `subtitles/aws/hij456.srt` |
| upscale | `upscaled/{provider}/` | `upscaled/fal/klm789.png` |
| lipsync | `lipsync/{provider}/` | `lipsync/fal/nop012.mp4` |
| inpaint | `inpaint/{provider}/` | `inpaint/fal/inp_abc123.png` |
| styletransfer | `styletransfer/{provider}/` | `styletransfer/fal/style_abc123.png` |
| sketch | `sketch/{provider}/` | `sketch/fal/sketch_abc123.png` |
| searchreplace | `searchreplace/{provider}/` | `searchreplace/stability/sr_abc123.png` |
| recolor | `recolor/{provider}/` | `recolor/stability/recolor_abc123.png` |
| colorize | `colorize/{provider}/` | `colorize/fal/colorize_abc123.png` |
| faceswap | `faceswap/{provider}/` | `faceswap/fal/faceswap_abc123.png` |
| faceid | `faceid/{provider}/` | `faceid/fal/faceid_abc123.png` |
| liveportrait | `liveportrait/{provider}/` | `liveportrait/fal/liveportrait_abc123.mp4` |
| restyle | `restyle/{provider}/` | `restyle/kling/restyle_abc123.png` |
| texture | `texture/{provider}/` | `texture/fal/texture_abc123.png` |
| skybox | `skybox/{provider}/` | `skybox/fal/skybox_abc123.png` |
| depthmap | `depthmap/{provider}/` | `depthmap/fal/depthmap_abc123.png` |
| normalmap | `normalmap/{provider}/` | `normalmap/fal/normalmap_abc123.png` |
| segment | `segment/{provider}/` | `segment/fal/segment_abc123.png` |
| pattern | `pattern/{provider}/` | `pattern/stability/pattern_abc123.png` |
| coloringpage | `coloringpage/{provider}/` | `coloringpage/fal/coloringpage_abc123.jpg` |
| sticker | `sticker/{provider}/` | `sticker/fal/sticker_abc123.png` |
| qrart | `qrart/{provider}/` | `qrart/fal/qrart_abc123.png` |
| mockup | `mockup/{provider}/` | `mockup/fal/mockup_abc123.png` |
| productphoto | `productphoto/{provider}/` | `productphoto/fal/product_abc123.png` |
| voiceclone | `voiceclone/{provider}/` | `voiceclone/elevenlabs/clone_abc123.json` |
| speechtospeech | `speechtospeech/{provider}/` | `speechtospeech/elevenlabs/sts_abc123.mp3` |
| voicedesign | `voicedesign/{provider}/` | `voicedesign/elevenlabs/design_abc123.mp3` |
| dialogue | `dialogue/{provider}/` | `dialogue/openai/dialogue_abc123.json` |
| translation | `translation/{provider}/` | `translation/vertex/translation_abc123.json` |
| transcription | `transcription/{provider}/` | `transcription/aws/transcription_abc123.json` |
| comic | `comic/{provider}/` | `comic/fal/comic_p1_abc123.png` |
| tattoo | `tattoo/{provider}/` | `tattoo/fal/tattoo_abc123.png` |
| archrender | `archrender/{provider}/` | `archrender/fal/archrender_abc123.png` |
| vector | `vector/{provider}/` | `vector/fal/vector_abc123.svg` |
| presentation | `presentation/{provider}/` | `presentation/fal/slide_1_abc123.png` |
| infographic | `infographic/{provider}/` | `infographic/fal/infographic_abc123.png` |
| terrain | `terrain/{provider}/` | `terrain/fal/terrain_abc123.png` |
| vfx | `vfx/{provider}/` | `vfx/fal/vfx_abc123.png` |
| font | `font/{provider}/` | `font/fal/font_abc123.png` |
| document | `document/{provider}/` | `document/fal/doc_abc123.png` |
| pose | `pose/{provider}/` | `pose/fal/pose_abc123.png` |

## OUTPUT FORMAT MAP

| Content Type | Provider | Default Output |
|-------------|----------|---------------|
| image (all) | ALL | `png` (some support `jpeg`, `webp`) |
| video | ALL | `mp4` |
| animation | ALL | `mp4` |
| voice-elevenlabs | ElevenLabs | `mp3` (mp3_44100_128) |
| voice-gemini | Gemini | `mp3` (also `wav`, `ogg_opus`) |
| voice-minimax | MiniMax | `mp3` (also `pcm`, `flac`) |
| voice-xai | xAI | `wav` |
| voice-dia | Dia | `wav` |
| voice-f5 | F5 | `wav` |
| voice-chatterbox | Chatterbox | `wav` |
| voice-inworld | Inworld | `wav` |
| music-elevenlabs | ElevenLabs | `mp3` |
| music-stability | Stability | `mp3` (also `wav`) |
| music-stable | Stable Audio | `wav` |
| music-ace | ACE-Step | `wav` |
| sfx (all) | ALL | `wav` or `mp3` |
| threed (all) | ALL | `.glb` (triposr also `.obj`) |
| subtitle | AWS | `.srt`, `.vtt` |

## VOICE-SPECIFIC ENUM VALUES

### ElevenLabs Voice Characters (for game voice UI)
hero_male, villain_male, narrator_male, wizard_male, warrior_male, merchant_male,

elder_male, child_male, robot_male, hero_female, villain_female, narrator_female,

witch_female, warrior_female, merchant_female, elder_female, child_female,

robot_female, monster, creature, ghost, demon, angel, announcer, tutorial, system

### ElevenLabs Voice Emotions
neutral, happy, sad, angry, fearful, surprised, disgusted, excited, calm,

serious, playful, mysterious, dramatic, whisper, shout

### ElevenLabs Speaking Speeds
very_slow(0.5x), slow(0.75x), normal(1.0x), fast(1.25x), very_fast(1.5x)

### ElevenLabs Output Formats
mp3_44100_128(default), mp3_44100_192, pcm_16000, pcm_22050, pcm_24000, pcm_44100, ulaw_8000

### ElevenLabs Languages (voice)
en, tr, es, fr, de, it, pt, pl, ru, nl, ja, zh, ko, ar, hi

### Gemini TTS Voices (30 voices)
Achernar, Achird, Algenib, Algieba, Alnilam, Aoede, Autonoe, Callirrhoe,

Charon, Despina, Enceladus, Erinome, Fenrir, Gacrux, Iapetus, Kore,

Laomedeia, Leda, Orus, Pulcherrima, Puck, Rasalgethi, Sadachbia,

Sadaltager, Schedar, Sulafat, Umbriel, Vindemiatrix, Zephyr, Zubenelgenubi

### MiniMax Voice Emotions
happy, sad, angry, fearful, disgusted, surprised, neutral

### MiniMax Voice Sample Rates
8000, 16000, 22050, 24000, 32000(default), 44100

### xAI TTS Voices
eve, ara, rex, sal, leo

### xAI TTS Languages
auto, en, zh, fr, de, hi, id, it, ja, ko, pt-BR, pt-PT, ru, es-MX, es-ES,

tr, vi, bn, ar-EG, ar-SA, ar-AE

## MUSIC-SPECIFIC ENUM VALUES

### Stability Music Genres
electronic, orchestral, ambient, chiptune, rock, pop, jazz, classical,

hip-hop, cinematic, lo-fi, edm, retro, acoustic, synthwave

### Stability Music Moods
happy, sad, energetic, calm, epic, mysterious, tense, relaxing,

uplifting, dark, playful, heroic, melancholic, triumphant, suspenseful

### Stability Music Use Cases
menu, gameplay, boss_battle, victory, defeat, loading, cutscene,

puzzle, action, exploration, shop, tutorial, credits

### Stability Music Quality
draft, standard(default), high, ultra

## IMAGE-SPECIFIC ENUM VALUES

### Vertex AI Game Styles
candy_crush, monument_valley, angry_birds, clash_royale, homescapes,

coin_master, hyper_casual, pixel_art, isometric, cartoon, realistic

### Vertex AI Rarity Tiers
common, uncommon, rare, epic, legendary, mythic

### Vertex AI Quality
draft, standard(default), high, ultra

### Stability AI Style Presets (17)
3d-model, analog-film, anime, cinematic, comic-book, digital-art,
enhance, fantasy-art, isometric, line-art, low-poly, modeling-compound,

neon-punk, origami, photographic, pixel-art, tile-texture

### Vertex AI Asset Types
hero_image, product_shot, social_post, thumbnail, app_icon, game_character,

game_background, game_ui, sprite, tileset, icon, logo, banner, screenshot,

feature_graphic, avatar, expression_sheet

## 3D-SPECIFIC ENUM VALUES

### Meshy Art Styles
realistic(default), sculpture

### Meshy Topology
quad, triangle(default)

### Meshy Symmetry Modes
off, auto(default), on

### Meshy Pose Modes
a-pose, t-pose

### Tripo3D Textures
no, standard(default), HD

### Tripo3D Texture Alignments
original_image, geometry

### Stability 3D Art Styles
realistic, stylized(default), low_poly, cartoon, anime, hand_painted, clay

### Stability 3D Categories
character, prop(default), environment, vehicle, weapon, creature, furniture

## VIDEO-SPECIFIC ENUM VALUES

### Kling Duration Range: 3-15 seconds

### Kling Modes: std, pro

### Kling Generation Types: text2video, image2video, extend, lip_sync

### Kling Aspect Ratios: 16:9, 9:16, 1:1

### Luma Duration: 5s, 9s, 18s

### Luma Resolutions: 540p, 720p, 1080p, 4k

### Luma Generation Types: video, modify_video, reframe_video, upscale_video, add_audio

### Luma Modify Modes: adhere_1, adhere_2, adhere_3, flex_1, flex_2, flex_3, reimagine_1, reimagine_2, reimagine_3

### Runway Video Models (T2V): gen4_turbo

### Runway Video Models (I2V): gen4

### Runway Generation Types: text_to_video, image_to_video, video_to_video

### Vertex Veo Person Generation: allow_all, allow_adult, dont_allow

### Vertex Veo Safety Filter: block_low_and_above, block_medium_and_above, block_only_high

### Vertex Veo Mask Modes: insert, remove, remove_static, outpaint

### Vertex Veo Compression: optimized, lossless

## BFF PROXY ROUTE (complete implementation)

```typescript
// app/api/content/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
const API_BASE = process.env.NEXT_PUBLIC_SSM_CONTENT_API_URL!;
const API_KEY = process.env.SSM_CONTENT_API_KEY!;
const baseSchema = z.object({
  endpoint: z.string().regex(/^\/(create-|3d-create-)/),
  prompt: z.string().max(32000).optional(),
  model: z.string().optional(),
  s3_bucket: z.string().optional(),
  output_path: z.string().optional(),
}).passthrough();
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = baseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { endpoint, ...params } = parsed.data;
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

## JOB POLLING ROUTE

```typescript
// app/api/content/jobs/[jobId]/route.ts
import { NextRequest, NextResponse } from "next/server";
const API_BASE = process.env.NEXT_PUBLIC_SSM_CONTENT_API_URL!;
const API_KEY = process.env.SSM_CONTENT_API_KEY!;
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const res = await fetch(`${API_BASE}/jobs/${params.jobId}`, {
    headers: { "x-api-key": API_KEY },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

## ENDPOINT COMPLETE REFERENCE — 179 active endpoints (count reconciled 2026-08-15)

> **The two numbers this heading used to carry were both wrong and are corrected here.** It read
> "176 ENDPOINT COMPLETE REFERENCE" above a sentence claiming "all 112 endpoints" — two different
> figures in adjacent lines, neither matching the registry. The authoritative count is the reconciled
> one at the top of COMPLETE ENDPOINT REGISTRY: **179 active + 1 planned**, with the live gateway at
> 180 POST resources (the extra being `/enhance-prompt`, not a generation endpoint). Verify with
> `python scripts/verify_v5_registry_arithmetic.py` and
> `python scripts/reconcile_v5_registry_with_live_api.py` rather than trusting any number typed into a
> heading.

Below you will find the reference for the endpoints organized by 

content type. For each handler you get:
- Endpoint URL and Lambda name
- Provider and package type
- Available models with API values
- ALL request parameters with types, required/optional, defaults, and allowed values
- Notes on model-specific behavior

### Content Type Sections:

1. **Image** -- 13 providers (Vertex, OpenAI, Stability, Luma, Kling, Runway, fal.ai Gateway, Flux, Ideogram, Recraft, Nano, Qwen, Seedream)
2. **Avatar** -- 10 providers (same as image minus Nano/Qwen/Seedream)
3. **Logo** -- 10 providers + Vertex brand_name
4. **Icon** -- 10 providers
5. **Sprite** -- 10 providers
6. **Video** -- 13 providers (Vertex, Vertex-v3, OpenAI, Kling, Luma, Runway, fal.ai, MiniMax, Mochi, Hunyuan, PixVerse, LTX, HeyGen)
7. **Animation** -- 6 providers (Vertex, Luma, Kling, Runway, fal.ai, MiniMax)
8. **Voice** -- 8 providers (ElevenLabs, Gemini, MiniMax, xAI, Dia, F5, Chatterbox, Inworld)
9. **Music** -- 6 providers (ElevenLabs, MiniMax, Stable, ACE, Beatoven, Stability)
10. **SFX** -- 6 providers (Beatoven, Mirelo, MMAudio, ElevenLabs, ACE, Multi)
11. **3D** -- 7 providers (Vertex, Meshy, Hunyuan3D, TRELLIS, TripoSR, Tripo3D, Stability)
12. **Editing & Utility** -- 13 handlers (upscale x2, subtitle, lipsync x4, tryon, erase, bgremove, outpaint, dubbing, isolate)

### IMPLEMENTATION ORDER (recommended):

1. Build BFF proxy (`/api/content/[...path]/route.ts`) with Zod validation
2. Build `useCreateContent` and `useContentJob` hooks
3. Build `<JobStatusTracker>` component (progress bar, status badges)
4. Build Image generator first (most providers, establishes pattern)
5. Build Video generator (complex: generation_type switching)
6. Build Voice generator (unique: voice_id, emotion, speed)
7. Build remaining content types following established patterns
8. Build comparison mode (side-by-side provider output comparison)

### FORM VALIDATION RULES (apply to ALL handlers):
- Prompt: trim whitespace, check min 1 char, check max per handler
- URLs: validate with `new URL()`, must be https://
- Integers: `Number.isInteger()`, check min/max range
- Floats: `Number.isFinite()`, check min/max range
- Enums: check value is in allowed set, case-sensitive
- Required fields: check based on generation_type (some fields become required conditionally)
- Model-specific fields: only send params that the selected model supports

### ERROR HANDLING:
- `400` -- Validation error (show field-level errors from response)
- `401` -- API key missing/invalid (redirect to auth)
- `429` -- Rate limited (show retry-after, disable submit)
- `500` -- Server error (show generic message + retry button)
- Job `FAILED` -- Show error from `result.error` field
- Network error -- Show offline banner, retry on reconnect
===============================================================================

END OF AI IMPLEMENTATION PROMPT

===============================================================================

-->

> 176 documented endpoints | 20+ AI providers | 50 content types | production architecture
> **v5.0, 2026-08-09.** The per-endpoint reference below is inherited from v4 and was NOT re-measured in
> this revision, except for the two video-Vertex endpoints (§6.1 / §6.2) and the faults named in
> MEASURED REALITY. Where a v4 figure could not be re-verified it is left as v4 wrote it — treat it as
> documentation, not as a measurement.

### AWS Infrastructure (Account A — the one serving clients today)

| Resource | Value |
|----------|-------|
| **AWS CLI Profile** | `beforetomorrow_production` |
| **AWS Account** | `723322847393` |
| **Region** | `eu-central-1` (Frankfurt) |
| **API Gateway ID** | `v2pjhwhk0m` |
| **API Gateway Name** | `ssm-content-api` |
| **Stage** | `prod` |
| **API Key Name** | `beforetomorrow-content-prod-key` (id `lvybepiomd`) |
| **Job Creator Lambda** | `ssm-content-job-creator` |
| **Worker Lambda Prefix** | `ssm-content-worker-` |
| **DynamoDB Table** | `ssm-content-jobs` |
| **S3 Bucket** | `beforetomorrow-content-prod` |
| **CDN** | `https://cdn.BeforeTomorrow.io` (CloudFront `EC2BGRV8D2WYV`) |

For **Account B (723322847393, BeforeTomorrow)** — `v2pjhwhk0m` / `uijimt1hpd` /
`beforetomorrow-content-prod` / `https://cdn.BeforeTomorrow.io` and its own API key — see the second
infrastructure table at the top of this document.

**Base URL:** `https://v2pjhwhk0m.execute-api.eu-central-1.amazonaws.com/prod`

**Auth:** `x-api-key` header — required (`apiKeyRequired: true`, verified on the live method)

**Rate limit:** 10 req/s, burst 20, **5,000 requests/day** (usage plan `z0ul90`)

**Method:** `POST`

**Response:** `202 Accepted` with `jobId` for async polling

## Job Lifecycle

```
Client --> POST /create-{type}-{provider} --> 202 { jobId, status: "PENDING", poll_url }
Client --> GET  /jobs/{jobId}              --> 200 { status: "PROCESSING" | "COMPLETED" | "FAILED", result }
```

**Statuses:** `PENDING` --> `PROCESSING` --> `COMPLETED` | `FAILED`

**Job TTL:** 24 hours

**DynamoDB Table:** `ssm-content-jobs`

**S3 Bucket:** `beforetomorrow-content-prod`

**CDN:** `https://cdn.BeforeTomorrow.io`

## Common Parameters (All Handlers)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `s3_bucket` | string | No | `beforetomorrow-content-prod` | Override S3 bucket |
| `output_path` | string | No | Auto (per handler) | Override S3 key prefix |

---

# 1. IMAGE (13 Provider)

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI | `image-vertex` | `gemini-3.1-flash-image` (default), `gemini-3-pro-image`, `gemini-2.5-flash-image` + legacy `imagen-*` aliases |
| 2 | OpenAI | `image-openai` | `gpt-image-1`, `gpt-image-1.5`, `dall-e-3` |
| 3 | Stability AI | `image-stability` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash`, `stable-image-ultra`, `stable-image-core` |
| 4 | fal.ai Gateway | `image-fal` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev`, `fal-ai/flux-2/flex`, `fal-ai/ideogram/v3`, `fal-ai/recraft/v3/text-to-image`, `fal-ai/stable-diffusion-v35-large` |
| 5 | Luma Photon | `image-luma` | `photon-1`, `photon-flash-1` |
| 6 | Kling AI | `image-kling` | `kling-v2-1` (default), `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v3`, `image-o1` |
| 7 | Runway ML | `image-runway` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| 8 | Flux (fal.ai) | `image-flux` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev`, `fal-ai/flux-2/flex` |
| 9 | Ideogram (fal.ai) | `image-ideogram` | `fal-ai/ideogram/v3` |
| 10 | Recraft (fal.ai) | `image-recraft` | `fal-ai/recraft/v3/text-to-image` |
| 11 | Nano Banana (fal.ai) | `image-nano` | `fal-ai/nano-banana-2`, `fal-ai/nano-banana-pro` |
| 12 | Qwen Image (fal.ai) | `image-qwen` | `fal-ai/qwen-image-2/text-to-image`, `fal-ai/qwen-image-2/pro/text-to-image` |
| 13 | Seedream (fal.ai) | `image-seedream` | `fal-ai/bytedance/seedream/v5/lite/text-to-image` |

## 1.1 image-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-vertex` |
| **Lambda** | `ssm-content-worker-image-vertex` |
| **Provider** | Google Vertex AI — Gemini image family (Imagen retired) |
| **Package** | Docker (ECR) |
| **Auth** | Workload Identity Federation (AWS Lambda → Google Cloud) |

> **Migration note (2026-08-04, deployed and live-verified 2026-08-12):** Google retired the entire
> Imagen generate family on Vertex AI (2026-06-30) — `imagen-4.0-generate-001` returns 404. The worker
> now runs on the Gemini image family via `:generateContent`: default `gemini-3.1-flash-image`;
> `imagen-4`/`imagen-4-fast`/`imagen-3*` → `gemini-3.1-flash-image`, `imagen-4-ultra` →
> `gemini-3-pro-image`. All legacy `model` values below remain accepted (aliased). `negative_prompt`
> is folded into the prompt text; `guidance_scale`, `add_watermark`, `enhance_prompt`,
> `language_code` and `safety_setting` are accepted but ignored (SynthID watermark is always on).
> **Expanded surface (applies to every model table below, param-rich live-verified 2026-08-12):**
> `model` also accepts `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` ·
> `aspect_ratio` accepts the full Gemini set (`1:1`, `3:2`, `2:3`, `3:4`, `4:3`, `4:5`, `5:4`, `1:4`,
> `4:1`, `1:8`, `8:1`, `9:16`, `16:9`, `21:9`, `9:21`) · `sample_image_size` accepts `512`, `1K`,
> `2K`, `4K` (a `2K` 16:9 request measured 2752×1536) · `count` 1–4 runs as per-image calls with
> auto-incremented seeds.
> Research: `docs/research/2026-08-12-vertex-image-endpoints-current-docs-and-migration.md`.

---

#### Model: `imagen-4`

Google Imagen 4 is the current-generation image model from Vertex AI. It produces the highest quality images with the best prompt understanding, photorealism, and text rendering capability. Default model for all image generation requests. Normal generation speed.

**Vertex Model ID:** `gemini-3.1-flash-image` *(legacy alias — Imagen retired 2026-06-30)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | No | `imagen-4` | `imagen-4` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

---

#### Model: `imagen-4-fast`

Imagen 4 Fast is the speed-optimized variant of Imagen 4. Produces good quality images significantly faster than the standard model, ideal for iterative workflows, previews, and real-time use cases.

**Vertex Model ID:** `gemini-3.1-flash-image` *(legacy alias `imagen-4.0-fast-generate-001` — Imagen retired 2026-06-30)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | **Yes** | -- | `imagen-4-fast` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

---

#### Model: `imagen-4-ultra`

Imagen 4 Ultra is the highest-quality variant of Imagen 4. Produces ultra-detailed images with maximum fidelity at the cost of longer generation time. Best suited for final production assets and hero images.

**Vertex Model ID:** `gemini-3-pro-image` *(legacy alias `imagen-4.0-ultra-generate-001` — Imagen retired 2026-06-30)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | **Yes** | -- | `imagen-4-ultra` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

---

#### Model: `imagen-3`

Imagen 3 is the previous-generation standard model. Retained for backward compatibility. Produces good quality images but lacks the photorealism and text rendering improvements of Imagen 4.

**Vertex Model ID:** `gemini-3.1-flash-image` *(legacy alias `imagen-3.0-generate-001` — Imagen retired 2026-06-30)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | **Yes** | -- | `imagen-3` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

---

#### Model: `imagen-3-fast`

Imagen 3 Fast is the speed-optimized variant of the previous generation. Fastest generation speed with standard quality output. Ideal for quick previews and high-throughput batch generation when the latest model quality is not required.

**Vertex Model ID:** `gemini-3.1-flash-image` *(legacy alias `imagen-3.0-fast-generate-001` — Imagen retired 2026-06-30)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | **Yes** | -- | `imagen-3-fast` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

#### Model: `imagen-3-v2`

Imagen 3.0 v2 is the second revision of the Imagen 3 generation model, offering improved quality and prompt understanding over the original Imagen 3.

**Vertex Model ID:** `gemini-3.1-flash-image` *(legacy alias `imagen-3.0-generate-002` — Imagen retired 2026-06-30)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | **Yes** | -- | `imagen-3-v2` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

#### Model: `imagen-3-capability`

Imagen 3.0 Capability is the edit/inpaint-focused model variant from the Imagen 3 family. Designed for image editing tasks including inpainting, outpainting, and style transfer.

**Vertex Model ID:** `gemini-3.1-flash-image` *(legacy alias `imagen-3.0-capability-001` — Imagen retired 2026-06-30; mask-based editing has no Gemini equivalent, see inpaint-vertex)*

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text description of the desired image |
| `model` | string | **Yes** | -- | `imagen-3-capability` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `count` | integer | No | `1` | `1`, `2`, `3`, `4` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `negative_prompt` | string | No | -- | Free text describing what to avoid |
| `guidance_scale` | float | No | `7.5` | Higher = more prompt adherence |
| `seed` | integer | No | -- | Integer for reproducibility |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `asset_type` | string | No | -- | `hero_image`, `product_shot`, `social_post`, `thumbnail`, `app_icon`, `game_character`, `game_background`, `game_ui`, `sprite`, `tileset`, `icon`, `logo`, `banner`, `screenshot`, `feature_graphic`, `avatar`, `expression_sheet` |
| `output_format` | string | No | `png` | `png`, `jpeg` |
| `character_bible` | object | No | -- | See Character Bible schema below |
| `style_anchor` | object | No | -- | See Style Anchor schema below |
| `game_config` | object | No | -- | See Game Config schema below |
| `template` | string | No | -- | Prompt template name |
| `template_vars` | object | No | `{}` | Key-value pairs for template variables |
| `upscale` | boolean | No | `false` | Post-process upscale output |
| `upscale_factor` | integer | No | `2` | Upscale multiplier |
| `remove_background` | boolean | No | `false` | Post-process background removal |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add invisible watermark to output |
| `enhance_prompt` | boolean | No | -- | AI-powered prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `pt`, `ko`, `ja`, `hi`, `zh`, `zh-CN`, `zh-TW` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0` - `100` (JPEG only) |
| `storage_uri` | string | No | -- | GCS URI to store output directly |
| `include_rai_reason` | boolean | No | -- | Include RAI rejection reason in response |
| `include_safety_attributes` | boolean | No | -- | Include safety attribute scores in response |

#### Shared Object Schemas

**`character_bible` object:**

```json
{
  "character_id": "string",
  "name": "string",
  "age_appearance": "string",
  "gender": "string",
  "skin_tone": "string",
  "build": "string",
  "eye_color": "string",
  "eye_shape": "string",
  "hair_style": "string",
  "hair_color": "string",
  "outfit_top": "string",
  "outfit_bottom": "string",
  "seed": "integer"
}
```

**`style_anchor` object:**

```json
{
  "style_id": "string",
  "name": "string",
  "aesthetic": "string",
  "lighting": "string",
  "mood": "string",
  "primary_color": "string",
  "secondary_color": "string",
  "accent_color": "string",
  "prompt_suffix": "string",
  "game_style": "string"
}
```

**`game_config` object:**

```json
{
  "game_style": "string",
  "rarity": "string"
}
```

**`game_style` allowed values:** `candy_crush`, `monument_valley`, `angry_birds`, `clash_royale`, `homescapes`, `coin_master`, `hyper_casual`, `pixel_art`, `isometric`, `cartoon`, `realistic`

**`rarity` allowed values:** `common`, `uncommon`, `rare`, `epic`, `legendary`, `mythic`

#### Response

```json
{
  "success": true,
  "request_id": "req_20260321_143022_a1b2c3d4",
  "count": 1,
  "total_time_ms": 4200,
  "images": [
    {
      "id": "img_20260321_143022_e5f6g7h8",
      "url": "s3://beforetomorrow-content-prod/images/img_...",
      "public_url": "https://cdn.BeforeTomorrow.io/images/img_...",
      "format": "png",
      "width": 1024,
      "height": 1024,
      "prompt": "original prompt",
      "enhanced_prompt": "AI-enhanced version of the prompt",
      "seed": null,
      "guidance_scale": 7.5,
      "generated_at": "2026-03-21T14:30:22.000Z",
      "engine": "gemini-3.1-flash-image",
      "character_id": null,
      "style_id": null,
      "platform_exports": {},
      "generation_time_ms": 4100
    }
  ]
}
```

---

## 1.2 image-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-openai` |
| **Lambda** | `ssm-content-worker-image-openai` |
| **Provider** | OpenAI Images API |
| **API URL** | `https://api.openai.com/v1/images/generations` |
| **Package** | ZIP (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |
| **Output** | png / jpeg / webp image |

---

#### Model: `dall-e-3`

DALL-E 3 is OpenAI's classic image generation model. It produces high-quality images with excellent prompt understanding but is limited to a single image per request (n is hardcoded to 1). Supports two quality tiers (standard and HD) and two style modes (vivid for hyper-real and natural for subdued). Prompt limit is 4,000 characters. The response is returned as base64 JSON which the Lambda decodes and uploads to S3.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 4,000 characters |
| `model` | string | **Yes** | -- | `dall-e-3` |
| `size` | string | No | `1024x1024` | `1024x1024`, `1792x1024`, `1024x1792` |
| `quality` | string | No | `standard` | `standard`, `hd` |
| `style` | string | No | `vivid` | `vivid`, `natural` |
| `n` | integer | -- | `1` | Hardcoded to 1 (cannot be changed) |

---

#### Model: `gpt-image-1`

GPT Image 1 is OpenAI's latest and most capable image generation model. It supports up to 10 images per request, transparent backgrounds, multiple output formats (png, jpeg, webp), quality tiers from low to high with an auto option, output compression control, and content moderation level adjustment. Prompt limit is 32,000 characters. Default model when no model is specified.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 characters |
| `model` | string | No | `gpt-image-1` | `gpt-image-1` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (for JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier for abuse monitoring |

---

#### Model: `gpt-image-1.5`

GPT Image 1.5 is the enhanced version of GPT Image 1 with improved prompt following and image quality. Accepts the same parameters and has the same capabilities as GPT Image 1 including transparent backgrounds, multi-image generation, and content moderation control. Prompt limit is 32,000 characters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 characters |
| `model` | string | **Yes** | -- | `gpt-image-1.5` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (for JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier for abuse monitoring |

---

#### Model: `gpt-image-1-mini`

GPT Image 1 Mini is the smaller, faster variant of GPT Image 1. Optimized for speed and lower cost while maintaining good quality. Best suited for quick iterations, thumbnails, and high-volume generation tasks. Accepts the same parameters as GPT Image 1. Prompt limit is 32,000 characters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 characters |
| `model` | string | **Yes** | -- | `gpt-image-1-mini` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (for JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier for abuse monitoring |

#### Response

```json
{
  "success": true,
  "request_id": "img_openai_20260321_143022_a1b2c3d4",
  "images": [
    {
      "id": "img_openai_20260321_143022_e5f6g7h8",
      "url": "s3://beforetomorrow-content-prod/images/openai/...",
      "public_url": "https://cdn.BeforeTomorrow.io/images/openai/...",
      "format": "png",
      "width": 1024,
      "height": 1024,
      "revised_prompt": "The revised prompt from OpenAI (DALL-E 3 only)"
    }
  ]
}
```

---

## 1.3 image-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-stability` |
| **Lambda** | `ssm-content-worker-image-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/{endpoint}` |
| **Package** | ZIP (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |
| **Prompt Limit** | **10,000 chars** |

---

#### Model: `sd3.5-large`

Stable Diffusion 3.5 Large is the latest large-parameter model in the SD3 family. Produces higher quality and more detailed images than the base SD3 model. Routes to the `/sd3` endpoint. Supports negative prompts, 17 style presets, and img2img via image_url+strength.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 characters |
| `model` | string | **Yes** | -- | `sd3.5-large` |
| `negative_prompt` | string | No | `""` | Free text describing what to avoid |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Integer for reproducibility |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Source image URL for img2img mode |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (denoising strength, only with `image_url`) |

---

#### Model: `sd3.5-turbo`

Stable Diffusion 3.5 Turbo is the distilled, speed-optimized version of SD3.5 Large. Generates images significantly faster with minimal quality loss. Ideal for real-time use cases and rapid iteration. Routes to the `/sd3` endpoint. Same parameters as SD3.5 Large.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 characters |
| `model` | string | **Yes** | -- | `sd3.5-turbo` |
| `negative_prompt` | string | No | `""` | Free text describing what to avoid |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Integer for reproducibility |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Source image URL for img2img mode |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (denoising strength, only with `image_url`) |

---

#### Model: `stable-image-ultra`

Stable Image Ultra is Stability AI's highest-quality proprietary model. Routes to the `/ultra` endpoint (not `/sd3`). Does NOT support `cfg_scale` parameter. Produces the most photorealistic and detailed images in the Stability lineup. Supports negative prompts, 17 style presets, 9 aspect ratios, and img2img.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 characters |
| `model` | string | **Yes** | -- | `stable-image-ultra` |
| `negative_prompt` | string | No | `""` | Free text describing what to avoid |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Integer for reproducibility |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Source image URL for img2img mode |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (denoising strength, only with `image_url`) |

> **Note:** `cfg_scale` is NOT supported by this model.

---

#### Model: `stable-image-core`

Stable Image Core is Stability AI's fast, general-purpose proprietary model. Routes to the `/core` endpoint. Default model when no model is specified. Produces good quality images quickly. Does NOT support `cfg_scale` parameter. Ideal for rapid prototyping and high-throughput generation.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 characters |
| `model` | string | No | `stable-image-core` | `stable-image-core` |
| `negative_prompt` | string | No | `""` | Free text describing what to avoid |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Integer for reproducibility |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Source image URL for img2img mode |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (denoising strength, only with `image_url`) |

> **Note:** `cfg_scale` is NOT supported by this model.

#### Response

```json
{
  "success": true,
  "image_id": "image_stability_20260321_143022_a1b2c3d4",
  "url": "s3://beforetomorrow-content-prod/images/stability/...",
  "public_url": "https://cdn.BeforeTomorrow.io/images/stability/...",
  "format": "png",
  "seed": 1234567890,
  "finish_reason": "SUCCESS"
}
```

---

## 1.4 image-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-fal` |
| **Lambda** | `ssm-content-worker-image-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | ZIP (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpeg image |

---

#### Model: `fal-ai/flux-pro/v1.1` (Flux Pro)

FLUX Pro v1.1 is Black Forest Labs' professional image generation model served via fal.ai. It produces high-quality photorealistic and artistic images with excellent prompt adherence. Default model for this endpoint. Supports image size presets, safety tolerance control, prompt enhancement, img2img via image_url+strength, and IP-Adapter style transfer via ip_adapter_image_url.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `ip_adapter_image_url` | string | No | -- | IP-Adapter style reference image |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Flux Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `ip_adapter_image_url` | string | No | -- | IP-Adapter style reference image |

> **Note:** Flux Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Flux Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `ip_adapter_image_url` | string | No | -- | IP-Adapter style reference image |

---

#### Model: `fal-ai/ideogram/v3` (Ideogram V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/ideogram/v3` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `negative_prompt` | string | No | -- | Free text |
| `rendering_speed` | string | No | -- | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Passthrough |
| `expand_prompt` | boolean | No | -- | -- |
| `color_palette` | any | No | -- | Passthrough |
| `image_urls` | array | No | -- | Reference image URLs |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |

---

#### Model: `fal-ai/recraft/v3/text-to-image` (Recraft V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/recraft/v3/text-to-image` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `style` | string | No | -- | Style preset |
| `colors` | any | No | -- | Color palette |
| `style_id` | string | No | -- | Custom style reference |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |

---

#### Model: `fal-ai/stable-diffusion-v35-large` (SD 3.5 Large)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/stable-diffusion-v35-large` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `negative_prompt` | string | No | -- | Free text |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `control_image_url` | string | No | -- | ControlNet control image URL |

---

## 1.5 image-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-luma` |
| **Lambda** | `ssm-content-worker-image-luma` |
| **Provider** | Luma Labs Photon |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `photon-1` | Standard quality |
| `photon-flash-1` | Fast generation |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `photon-1` | `photon-1`, `photon-flash-1` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `format` | string | No | `jpg` | `jpg`, `png` |
| `image_ref` | any | No | -- | Reference image object |
| `style_ref` | any | No | -- | Style reference object |
| `character_ref` | any | No | -- | Character reference object |
| `modify_image_ref` | any | No | -- | Modify image reference |

> **Note:** All models listed above accept the same parameters.

---

## 1.6 image-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-kling` |
| **Lambda** | `ssm-content-worker-image-kling` |
| **Provider** | Kling AI |
| **Package** | ZIP |
| **Auth** | JWT (HS256) |

### Models

| Model Value | Notes |
|-------------|-------|
| `kling-v1` | Kolors v1.5 base (default) |
| `kling-v2` | Kolors v2.0 |
| `image-o1` | Image O1 |
| `kling-o3` | Kling O3 |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `kling-v1` | `kling-v1`, `kling-v2`, `image-o1`, `kling-o3` |
| `negative_prompt` | string | No | -- | Free text |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` (validated) |
| `num_images` | integer | No | -- | Number of images |
| `seed` | integer | No | -- | -- |
| `image_fidelity` | float | No | -- | Image fidelity strength |
| `human_fidelity` | float | No | -- | Human fidelity strength |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `image_reference` | any | No | -- | Passthrough reference |

> **Note:** All models listed above accept the same parameters.

---

## 1.7 image-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-runway` |
| **Lambda** | `ssm-content-worker-image-runway` |
| **Provider** | Runway ML |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `gen4_image` | Standard image generation |
| `gen4_image_turbo` | Fast (requires reference_images) |
| `gemini_2.5_flash` | Gemini-powered |

---

#### Model: `gen4_image` / `gemini_2.5_flash`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `gen4_image` | `gen4_image`, `gemini_2.5_flash` |
| `ratio` | string | No | `1280:720` | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| `seed` | integer | No | -- | -- |
| `reference_images` | array | No | -- | Reference images |

---

#### Model: `gen4_image_turbo`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `gen4_image_turbo` |
| `ratio` | string | No | `1280:720` | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| `seed` | integer | No | -- | -- |
| `reference_images` | array | **Yes** | -- | Reference images (required for turbo) |

---

## 1.8 image-flux

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-flux` |
| **Lambda** | `ssm-content-worker-image-flux` |
| **Provider** | Flux via fal.ai (Dedicated) |
| **Package** | Docker |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/flux-pro/v1.1` | Pro standard (default) |
| `fal-ai/flux-pro/v1.1-ultra` | Pro ultra (uses `aspect_ratio` instead of `image_size`) |
| `fal-ai/flux/dev` | Open dev model |

---

#### Model: `fal-ai/flux-pro/v1.1` (Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string/object | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | `0.75` | `0.0` - `1.0` (only with `image_url`) |
| `image_prompt_url` | string | No | -- | IP-Adapter style image prompt |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | `16:9` | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | `0.75` | `0.0` - `1.0` (only with `image_url`) |
| `image_prompt_url` | string | No | -- | IP-Adapter style image prompt |

> **Note:** Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string/object | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | `28` | `1` - `50` |
| `guidance_scale` | float | No | `3.5` | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | `0.75` | `0.0` - `1.0` (only with `image_url`) |
| `image_prompt_url` | string | No | -- | IP-Adapter style image prompt |

---

## 1.9 image-ideogram

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-ideogram` |
| **Lambda** | `ssm-content-worker-image-ideogram` |
| **Provider** | Ideogram V3 via fal.ai (Dedicated) |
| **Package** | Docker |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/ideogram/v3` | Best text rendering |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/ideogram/v3` | `fal-ai/ideogram/v3` |
| `image_size` | string | No | `square_hd` | fal.ai size presets |
| `negative_prompt` | string | No | -- | Free text |
| `rendering_speed` | string | No | `BALANCED` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Passthrough |
| `style_codes` | any | No | -- | Passthrough |
| `image_urls` | array | No | -- | Reference image URLs |
| `color_palette` | any | No | -- | Passthrough |
| `expand_prompt` | boolean | No | `true` | -- |
| `num_images` | integer | No | -- | `1` - `8` |
| `seed` | integer | No | -- | -- |

---

## 1.10 image-recraft

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-recraft` |
| **Lambda** | `ssm-content-worker-image-recraft` |
| **Provider** | Recraft V3 via fal.ai (Dedicated) |
| **Package** | Docker |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/recraft/v3/text-to-image` | Vector & design focused |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/recraft/v3/text-to-image` | `fal-ai/recraft/v3/text-to-image` |
| `image_size` | string | No | `square_hd` | fal.ai size presets |
| `style` | string | No | `realistic_image` | 70+ Recraft styles |
| `colors` | any | No | -- | Color palette array |
| `style_id` | string | No | -- | Custom style reference |
| `enable_safety_checker` | boolean | No | `false` | -- |
| `seed` | integer | No | -- | -- |

---

## 1.11 image-nano

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-nano` |
| **Lambda** | `ssm-content-worker-image-nano` |
| **Provider** | Google Nano Banana via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/nano-banana-2` | Standard |
| `fal-ai/nano-banana-pro` | Pro quality |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/nano-banana-2` | `fal-ai/nano-banana-2`, `fal-ai/nano-banana-pro` |
| `image_size` | string/object | No | -- | fal.ai size presets |
| `num_images` | integer | No | -- | -- |
| `seed` | integer | No | -- | -- |
| `negative_prompt` | string | No | -- | Free text |

> **Note:** All models listed above accept the same parameters.

---

## 1.12 image-qwen

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-qwen` |
| **Lambda** | `ssm-content-worker-image-qwen` |
| **Provider** | Qwen Image 2 via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/qwen-image-2/text-to-image` | Standard |
| `fal-ai/qwen-image-2/pro/text-to-image` | Pro quality |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/qwen-image-2/text-to-image` | See above |
| `image_url` | string | No | -- | Source image (editing mode) |
| `image_size` | string/object | No | -- | fal.ai size presets |
| `num_images` | integer | No | -- | -- |
| `seed` | integer | No | -- | -- |
| `negative_prompt` | string | No | -- | Free text |
| `guidance_scale` | float | No | -- | -- |

> **Note:** All models listed above accept the same parameters.

---

## 1.13 image-seedream

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-image-seedream` |
| **Lambda** | `ssm-content-worker-image-seedream` |
| **Provider** | ByteDance Seedream 5.0 via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/bytedance/seedream/v5/lite/text-to-image` | Lite version |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/bytedance/seedream/v5/lite/text-to-image` | Single model |
| `image_size` | string/object | No | -- | fal.ai size presets |
| `num_images` | integer | No | -- | -- |
| `seed` | integer | No | -- | -- |
| `negative_prompt` | string | No | -- | Free text |
| `guidance_scale` | float | No | -- | -- |

---

# 2. AVATAR (10 Provider)
> Avatar handler'lar ilgili image handler ile ayni provider kodunu kullanir. S3 prefix: `avatars/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI | `avatar-vertex` | `gemini-3.1-flash-image` (default), `gemini-3-pro-image`, `gemini-2.5-flash-image` + legacy `imagen-*` aliases |
| 2 | OpenAI | `avatar-openai` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini`, `dall-e-3` |
| 3 | Stability AI | `avatar-stability` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash`, `stable-image-ultra`, `stable-image-core` |
| 4 | fal.ai Gateway | `avatar-fal` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev`, `fal-ai/ideogram/v3`, `fal-ai/recraft/v3/text-to-image`, `fal-ai/stable-diffusion-v35-large` |
| 5 | Luma Photon | `avatar-luma` | `photon-1`, `photon-flash-1` |
| 6 | Kling AI | `avatar-kling` | `kling-v2-1` (default), `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v3`, `image-o1` |
| 7 | Runway ML | `avatar-runway` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| 8 | Flux (fal.ai) | `avatar-flux` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev` |
| 9 | Ideogram (fal.ai) | `avatar-ideogram` | `fal-ai/ideogram/v3` |
| 10 | Recraft (fal.ai) | `avatar-recraft` | `fal-ai/recraft/v3/text-to-image` |

## 2.1 avatar-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-vertex` |
| **Lambda** | `ssm-content-worker-avatar-vertex` |
| **Provider** | Google Vertex AI — Gemini image family (Avatar-specialized; Imagen retired) |
| **Package** | Docker (ECR) |
| **Auth** | Workload Identity Federation |

### Models

| Model Value | Vertex Model ID | Speed | Quality |
|-------------|----------------|-------|---------|
| `gemini-3.1-flash-image` | `gemini-3.1-flash-image` (default) | Fast | Best |
| `gemini-3-pro-image` | `gemini-3-pro-image` | Slow | Ultra |
| `gemini-2.5-flash-image` | `gemini-2.5-flash-image` (retires 2026-10-02) | Fast | Good |
| `imagen-4` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-fast` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-ultra` *(legacy alias)* | → `gemini-3-pro-image` | Slow | Ultra |
| `imagen-3` / `imagen-3-fast` / `imagen-3-v2` *(legacy aliases)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-3-capability` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |

> **Migration note (2026-08-04):** Google retired the entire Imagen generate family on Vertex AI
> (2026-06-30). All `imagen-*` model values remain accepted for backward compatibility and are
> transparently mapped to the Gemini image family shown above. `negative_prompt` is folded into
> the prompt text; `guidance_scale`, `add_watermark`, `enhance_prompt`, `language_code` and
> `safety_setting` are accepted but ignored (SynthID watermark is always on).

### Avatar Styles

| Style Value | Description |
|-------------|-------------|
| `realistic` | Photorealistic human avatar |
| `cartoon` | Cartoon-style character (default) |
| `anime` | Japanese anime style |
| `chibi` | Super-deformed chibi |
| `pixel` | Pixel art avatar |
| `3d_render` | 3D rendered character |
| `watercolor` | Watercolor painting style |
| `sketch` | Pencil sketch style |

### Expressions
`neutral` (default), `happy`, `sad`, `angry`, `surprised`, `thinking`, `laughing`, `serious`, `wink`, `crying`, `confident`, `scared`

### Poses
`portrait` (default), `half_body`, `full_body`, `profile`, `three_quarter`, `action`

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Avatar description. Optional if `character_bible` provided |
| `style` | string | No | `cartoon` | `realistic`, `cartoon`, `anime`, `chibi`, `pixel`, `3d_render`, `watercolor`, `sketch` |
| `expression` | string | No | `neutral` | 12 values (see list above) |
| `pose` | string | No | `portrait` | `portrait`, `half_body`, `full_body`, `profile`, `three_quarter`, `action` |
| `quality` | string | No | `standard` | `standard`, `high`, `ultra` |
| `gender` | string | No | -- | Gender enum (optional) |
| `age_group` | string | No | -- | Age group enum (optional) |
| `character_bible` | object | No | -- | `{character_id, name, physical: {age_appearance, gender, ethnicity, skin_tone, build}, face: {eye_color, eye_shape, face_shape, distinctive_features}, hair: {style, color, texture}, clothing: {top, bottom, accessories}, personality_traits, seed}` |
| `count` | integer | No | `1` | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `negative_prompt` | string | No | -- | What to avoid |
| `guidance_scale` | float | No | `7.5` | Prompt adherence |
| `background` | string | No | `transparent` | Background type |
| `output_format` | string | No | `png` | Output image format |
| `export_sizes` | array\<int\> | No | `[128, 256, 512]` | Generates resized variants for each size |
| `generate_expression_sheet` | boolean | No | `false` | Generate sheet with multiple expressions |
| `expression_sheet_expressions` | array\<string\> | No | `[]` | Expression values for the sheet |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add watermark |
| `enhance_prompt` | boolean | No | -- | AI prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `ko`, `ja`, `hi`, `zh` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0`--`100` (JPEG only) |

**S3 Path:** `avatars/vertex/{avatar_vertex_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 2.2 avatar-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-openai` |
| **Lambda** | `ssm-content-worker-avatar-openai` |
| **Provider** | OpenAI Images API |
| **API URL** | `https://api.openai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |
| **Output** | png / jpeg / webp image |

### Models

| Model Value | Prompt Limit | Sizes |
|-------------|-------------|-------|
| `gpt-image-1` (default) | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `gpt-image-1.5` | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `gpt-image-1-mini` | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `dall-e-3` | 4,000 chars | `1024x1024`, `1792x1024`, `1024x1792` |

---

#### Model: `dall-e-3`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 4,000 chars |
| `model` | string | **Yes** | -- | `dall-e-3` |
| `size` | string | No | `1024x1024` | `1024x1024`, `1792x1024`, `1024x1792` |
| `quality` | string | No | `standard` | `standard`, `hd` |
| `style` | string | No | `vivid` | `vivid`, `natural` |
| `n` | integer | -- | `1` | Hardcoded to 1 |

---

#### Model: `gpt-image-1` / `gpt-image-1.5` / `gpt-image-1-mini`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 chars |
| `model` | string | No | `gpt-image-1` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1` - `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier |

**S3 Path:** `avatars/openai/{avatar_openai_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 2.3 avatar-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-stability` |
| **Lambda** | `ssm-content-worker-avatar-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/{core\|ultra\|sd3}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |
| **Output** | png / jpeg / webp image |

### Models

| Model Value | API Endpoint Suffix |
|-------------|-------------------|
| `stable-image-core` (default) | `/core` |
| `stable-image-ultra` | `/ultra` |
| `sd3` | `/sd3` |
| `sd3.5-large` | `/sd3` |
| `sd3.5-large-turbo` | `/sd3` |
| `sd3.5-medium` | `/sd3` |
| `sd3.5-flash` | `/sd3` |

---

#### Models: `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` (SD3 Family)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` |
| `negative_prompt` | string | No | -- | Max 10,000 chars |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `cfg_scale` | float | No | -- | `0.0` - `10.0` |
| `image_url` | string | No | -- | Reference image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

---

#### Models: `stable-image-ultra`, `stable-image-core` (Ultra / Core)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `stable-image-ultra`, `stable-image-core` |
| `negative_prompt` | string | No | -- | Max 10,000 chars |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Reference image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

> **Note:** Ultra/Core models do NOT support `cfg_scale`.

**S3 Path:** `avatars/stability/{avatar_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.4 avatar-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-fal` |
| **Lambda** | `ssm-content-worker-avatar-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpg / webp image |

### Models

| Model Value | Description |
|-------------|-------------|
| `fal-ai/flux-pro/v1.1` | FLUX Pro v1.1 (default) |
| `fal-ai/flux-pro/v1.1-ultra` | FLUX Pro Ultra |
| `fal-ai/flux/dev` | FLUX Dev |
| `fal-ai/ideogram/v3` | Ideogram v3 |
| `fal-ai/recraft/v3/text-to-image` | Recraft V3 |
| `fal-ai/stable-diffusion-v35-large` | SD 3.5 Large |

---

#### Model: `fal-ai/flux-pro/v1.1` (Flux Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Flux Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

> **Note:** Flux Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Flux Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

---

#### Model: `fal-ai/ideogram/v3` (Ideogram V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/ideogram/v3` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `negative_prompt` | string | No | -- | Free text |
| `rendering_speed` | string | No | -- | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Passthrough |
| `expand_prompt` | boolean | No | -- | -- |
| `color_palette` | any | No | -- | Passthrough |
| `image_urls` | array | No | -- | Reference image URLs |

---

#### Model: `fal-ai/recraft/v3/text-to-image` (Recraft V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/recraft/v3/text-to-image` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `style` | string | No | -- | Style preset |
| `colors` | any | No | -- | Color palette |
| `style_id` | string | No | -- | Custom style reference |

---

#### Model: `fal-ai/stable-diffusion-v35-large` (SD 3.5 Large)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/stable-diffusion-v35-large` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `negative_prompt` | string | No | -- | Free text |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

**S3 Path:** `avatars/fal/{avatar_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.5 avatar-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-luma` |
| **Lambda** | `ssm-content-worker-avatar-luma` |
| **Provider** | Luma Photon |
| **API URL** | `https://api.lumalabs.ai/dream-machine/v1/generations/image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `LUMA_API_KEY` Header: `Authorization: Bearer {key}` |
| **Output** | jpg / png image |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Avatar description |
| `model` | string | No | `photon-1` | `photon-1`, `photon-flash-1` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `format` | string | No | `jpg` | `jpg`, `png` |
| `image_ref` | object | No | -- | Reference image object |
| `style_ref` | object | No | -- | Style reference object |
| `character_ref` | object | No | -- | Character reference object |
| `modify_image_ref` | object | No | -- | Modify image reference |

**S3 Path:** `avatars/luma/{avatar_luma_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.6 avatar-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-kling` |
| **Lambda** | `ssm-content-worker-avatar-kling` |
| **Provider** | Kling AI |
| **API URL** | `https://api.klingai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer` with `PyJWT`) |
| **Auth** | JWT Bearer (HS256 from `KLING_ACCESS_KEY` + `KLING_SECRET_KEY`) |
| **Output** | png / jpg image |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Avatar description |
| `model` | string | No | `kling-v2-1` | `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v2-1`, `kling-v3`, `image-o1` |
| `negative_prompt` | string | No | -- | What to avoid |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` (validated) |
| `num_images` | integer | No | `1` | Mapped to `n` in API |
| `seed` | integer | No | random | Reproducibility seed |
| `image_fidelity` | float | No | -- | Image fidelity strength |
| `human_fidelity` | float | No | -- | Human fidelity strength |
| `resolution` | string | No | -- | Output resolution override |
| `image_url` | string | No | -- | Reference image URL |
| `image_reference` | object | No | -- | Image reference config |

**S3 Path:** `avatars/kling/{avatar_kling_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.7 avatar-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-runway` |
| **Lambda** | `ssm-content-worker-avatar-runway` |
| **Provider** | Runway ML |
| **API URL** | `https://api.dev.runwayml.com/v1/text_to_image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `RUNWAY_API_KEY` Header: `Authorization: Bearer {key}` + `X-Runway-Version: 2024-11-06` |
| **Output** | png / jpg image |

### Parameters

> **Note:** All models listed above accept the same parameters. `gen4_image_turbo` supports `reference_images` for image-guided generation.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Avatar description (mapped to `promptText`) |
| `model` | string | No | `gen4_image` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| `ratio` | string | No | `1280:720` | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| `seed` | integer | No | random | Reproducibility seed |
| `reference_images` | array | No | -- | Reference images (mapped to `referenceImages`) |

**S3 Path:** `avatars/runway/{avatar_runway_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.8 avatar-flux

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-flux` |
| **Lambda** | `ssm-content-worker-avatar-flux` |
| **Provider** | Flux via fal.ai (dedicated) |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpeg image |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/flux-pro/v1.1` | Pro standard (default) |
| `fal-ai/flux-pro/v1.1-ultra` | Pro ultra |
| `fal-ai/flux/dev` | Open dev model |

---

#### Model: `fal-ai/flux-pro/v1.1` (Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | `16:9` | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

> **Note:** Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | `28` | `1` - `50` |
| `guidance_scale` | float | No | `3.5` | -- |

**S3 Path:** `avatars/flux/{avatar_flux_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.9 avatar-ideogram

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-ideogram` |
| **Lambda** | `ssm-content-worker-avatar-ideogram` |
| **Provider** | Ideogram v3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/ideogram/v3` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpg image |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Avatar description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `negative_prompt` | string | No | -- | What to avoid |
| `rendering_speed` | string | No | `BALANCED` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Style preset ID |
| `style_codes` | array | No | -- | Style code references |
| `image_urls` | array | No | -- | Reference image URLs |
| `color_palette` | object | No | -- | Color palette configuration |
| `expand_prompt` | boolean | No | `true` | AI prompt expansion |
| `num_images` | integer | No | `1` | Range: **1--8** |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `avatars/ideogram/{avatar_ideogram_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 2.10 avatar-recraft

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-avatar-recraft` |
| **Lambda** | `ssm-content-worker-avatar-recraft` |
| **Provider** | Recraft V3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/recraft/v3/text-to-image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / svg image |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Avatar description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `style` | string | No | `realistic_image` | 70+ Recraft styles (e.g. `realistic_image`, `digital_illustration`, `vector_illustration`, `icon`, `logo`) |
| `colors` | object | No | -- | Color configuration |
| `style_id` | string | No | -- | Custom style ID |
| `enable_safety_checker` | boolean | No | `false` | Safety checker |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `avatars/recraft/{avatar_recraft_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 3. LOGO (10 Provider)
> S3 prefix: `logos/{provider}/`. Vertex logo'da ek `brand_name` parametresi var.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI | `logo-vertex` | `imagen-4`, `imagen-4-fast`, `imagen-4-ultra`, `imagen-3`, `imagen-3-fast` |
| 2 | OpenAI | `logo-openai` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini`, `dall-e-3` |
| 3 | Stability AI | `logo-stability` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash`, `stable-image-ultra`, `stable-image-core` |
| 4 | fal.ai Gateway | `logo-fal` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev`, `fal-ai/ideogram/v3`, `fal-ai/recraft/v3/text-to-image`, `fal-ai/stable-diffusion-v35-large` |
| 5 | Luma Photon | `logo-luma` | `photon-1`, `photon-flash-1` |
| 6 | Kling AI | `logo-kling` | `kling-v2-1` (default), `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v3`, `image-o1` |
| 7 | Runway ML | `logo-runway` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| 8 | Flux (fal.ai) | `logo-flux` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev` |
| 9 | Ideogram (fal.ai) | `logo-ideogram` | `fal-ai/ideogram/v3` |
| 10 | Recraft (fal.ai) | `logo-recraft` | `fal-ai/recraft/v3/text-to-image` |

## 3.1 logo-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-vertex` |
| **Lambda** | `ssm-content-worker-logo-vertex` |
| **Provider** | Google Vertex AI — Gemini image family (Logo-specialized; Imagen retired) |
| **Package** | Docker (ECR) |
| **Auth** | Workload Identity Federation |
| **Aspect Ratio** | Hardcoded `1:1` (logos always square) |

### Models

| Model Value | Vertex Model ID | Speed | Quality |
|-------------|----------------|-------|---------|
| `gemini-3.1-flash-image` | `gemini-3.1-flash-image` (default) | Fast | Best |
| `gemini-3-pro-image` | `gemini-3-pro-image` | Slow | Ultra |
| `gemini-2.5-flash-image` | `gemini-2.5-flash-image` (retires 2026-10-02) | Fast | Good |
| `imagen-4` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-fast` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-ultra` *(legacy alias)* | → `gemini-3-pro-image` | Slow | Ultra |
| `imagen-3` / `imagen-3-fast` / `imagen-3-v2` *(legacy aliases)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-3-capability` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |

> **Migration note (2026-08-04):** Google retired the entire Imagen generate family on Vertex AI
> (2026-06-30). All `imagen-*` model values remain accepted for backward compatibility and are
> transparently mapped to the Gemini image family shown above. `negative_prompt` is folded into
> the prompt text; `guidance_scale`, `add_watermark`, `enhance_prompt`, `language_code` and
> `safety_setting` are accepted but ignored (SynthID watermark is always on).

### Logo Types

| Type Value | Description |
|------------|-------------|
| `logomark` | Symbol/icon only, no text. Negative prompt blocks letters |
| `wordmark` | Text-based logo. Negative prompt blocks icons/symbols |
| `combination` | Icon + text combined (default) |
| `emblem` | Badge/seal style with enclosed text |
| `lettermark` | Initials/monogram logo |
| `mascot` | Character-based logo |
| `abstract` | Abstract geometric symbol |

### Industries
`tech` (default), `finance`, `food`, `health`, `luxury`, `eco`, `kids`, `gaming`, `education`, `sports`, `entertainment`, `real_estate`

### Logo Styles
`modern` (default), `vintage`, `minimal`, `playful`, `corporate`, `luxury`, `tech`, `organic`, `geometric`, `hand_drawn`

### Typography
`serif`, `sans_serif` (default), `slab_serif`, `script`, `display`, `geometric`

### Quality Levels

| Quality | Prompt Suffix |
|---------|--------------|
| `draft` | (none) |
| `standard` | (none) |
| `high` | "high quality, professional logo design" |
| `ultra` | "masterpiece quality, perfect logo, ultra professional" |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `brand_name` | string | **Yes** | -- | Brand/company name (**returns 400 if missing**) |
| `prompt` | string | No | -- | Additional description, prepended to auto-built prompt |
| `tagline` | string | No | -- | Appended as `with tagline '{tagline}'` |
| `logo_type` | string | No | `combination` | `logomark`, `wordmark`, `combination`, `emblem`, `lettermark`, `mascot`, `abstract` |
| `industry` | string | No | `tech` | `tech`, `finance`, `food`, `health`, `luxury`, `eco`, `kids`, `gaming`, `education`, `sports`, `entertainment`, `real_estate` |
| `style` | string | No | `modern` | `modern`, `vintage`, `minimal`, `playful`, `corporate`, `luxury`, `tech`, `organic`, `geometric`, `hand_drawn` |
| `typography` | string | No | `sans_serif` | `serif`, `sans_serif`, `slab_serif`, `script`, `display`, `geometric` |
| `color_palette` | object | No | -- | `{primary: "#2563EB", secondary: "#1E40AF", accent: "#F59E0B", background: "transparent"}` |
| `background` | string | No | `transparent` | Background type |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `count` | integer | No | `1` | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `negative_prompt` | string | No | auto-generated | Overrides auto-generated negative prompt |
| `guidance_scale` | float | No | `8.0` | Prompt adherence (CFG scale) |
| `output_format` | string | No | `png` | Output format |
| `export_sizes` | array\<int\> | No | `[256, 512, 1024]` | Generates resized PNG variants at each size |
| `generate_color_versions` | boolean | No | `true` | Generates grayscale monochrome version |
| `variations` | integer | No | `1` | Reserved for future use |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add watermark |
| `enhance_prompt` | boolean | No | -- | AI prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `ko`, `ja`, `hi`, `zh`, `pt` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0`--`100` (JPEG only) |

**S3 Path:** `logos/vertex/{logo_vertex_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 3.2 logo-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-openai` |
| **Lambda** | `ssm-content-worker-logo-openai` |
| **Provider** | OpenAI Images API |
| **API URL** | `https://api.openai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |
| **Output** | png / jpeg / webp image |

### Models

| Model Value | Prompt Limit | Sizes |
|-------------|-------------|-------|
| `gpt-image-1` (default) | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `gpt-image-1.5` | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `gpt-image-1-mini` | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `dall-e-3` | 4,000 chars | `1024x1024`, `1792x1024`, `1024x1792` |

---

#### Model: `dall-e-3`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 4,000 chars |
| `model` | string | **Yes** | -- | `dall-e-3` |
| `size` | string | No | `1024x1024` | `1024x1024`, `1792x1024`, `1024x1792` |
| `quality` | string | No | `standard` | `standard`, `hd` |
| `style` | string | No | `vivid` | `vivid`, `natural` |
| `n` | integer | -- | `1` | Hardcoded to 1 |

---

#### Model: `gpt-image-1` / `gpt-image-1.5` / `gpt-image-1-mini`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 chars |
| `model` | string | No | `gpt-image-1` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1` - `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier |

**S3 Path:** `logos/openai/{logo_openai_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 3.3 logo-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-stability` |
| **Lambda** | `ssm-content-worker-logo-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/{core\|ultra\|sd3}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |

### Models

| Model Value | API Endpoint Suffix |
|-------------|-------------------|
| `stable-image-core` (default) | `/core` |
| `stable-image-ultra` | `/ultra` |
| `sd3` | `/sd3` |
| `sd3.5-large` | `/sd3` |
| `sd3.5-large-turbo` | `/sd3` |
| `sd3.5-medium` | `/sd3` |
| `sd3.5-flash` | `/sd3` |

---

#### Models: `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` (SD3 Family)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` |
| `negative_prompt` | string | No | -- | Max 10,000 chars |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `cfg_scale` | float | No | -- | `0.0` - `10.0` |
| `image_url` | string | No | -- | Reference image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

---

#### Models: `stable-image-ultra`, `stable-image-core` (Ultra / Core)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `stable-image-ultra`, `stable-image-core` |
| `negative_prompt` | string | No | -- | Max 10,000 chars |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Reference image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

> **Note:** Ultra/Core models do NOT support `cfg_scale`.

**S3 Path:** `logos/stability/{logo_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.4 logo-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-fal` |
| **Lambda** | `ssm-content-worker-logo-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Models

| Model Value | Description |
|-------------|-------------|
| `fal-ai/flux-pro/v1.1` | FLUX Pro v1.1 (default) |
| `fal-ai/flux-pro/v1.1-ultra` | FLUX Pro Ultra |
| `fal-ai/flux/dev` | FLUX Dev |
| `fal-ai/ideogram/v3` | Ideogram v3 |
| `fal-ai/recraft/v3/text-to-image` | Recraft V3 |
| `fal-ai/stable-diffusion-v35-large` | SD 3.5 Large |

---

#### Model: `fal-ai/flux-pro/v1.1` (Flux Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Flux Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

> **Note:** Flux Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Flux Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

---

#### Model: `fal-ai/ideogram/v3` (Ideogram V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/ideogram/v3` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `negative_prompt` | string | No | -- | Free text |
| `rendering_speed` | string | No | -- | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Passthrough |
| `expand_prompt` | boolean | No | -- | -- |
| `color_palette` | any | No | -- | Passthrough |
| `image_urls` | array | No | -- | Reference image URLs |

---

#### Model: `fal-ai/recraft/v3/text-to-image` (Recraft V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/recraft/v3/text-to-image` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `style` | string | No | -- | Style preset |
| `colors` | any | No | -- | Color palette |
| `style_id` | string | No | -- | Custom style reference |

---

#### Model: `fal-ai/stable-diffusion-v35-large` (SD 3.5 Large)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/stable-diffusion-v35-large` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `negative_prompt` | string | No | -- | Free text |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

**S3 Path:** `logos/fal/{logo_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.5 logo-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-luma` |
| **Lambda** | `ssm-content-worker-logo-luma` |
| **Provider** | Luma Photon |
| **API URL** | `https://api.lumalabs.ai/dream-machine/v1/generations/image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `LUMA_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Logo description |
| `model` | string | No | `photon-1` | `photon-1`, `photon-flash-1` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `format` | string | No | `jpg` | `jpg`, `png` |
| `image_ref` | object | No | -- | Reference image |
| `style_ref` | object | No | -- | Style reference |
| `character_ref` | object | No | -- | Character reference |
| `modify_image_ref` | object | No | -- | Modify image reference |

**S3 Path:** `logos/luma/{logo_luma_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.6 logo-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-kling` |
| **Lambda** | `ssm-content-worker-logo-kling` |
| **Provider** | Kling AI |
| **API URL** | `https://api.klingai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer` with `PyJWT`) |
| **Auth** | JWT Bearer (HS256 from `KLING_ACCESS_KEY` + `KLING_SECRET_KEY`) |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Logo description |
| `model` | string | No | `kling-v2-1` | `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v2-1`, `kling-v3`, `image-o1` |
| `negative_prompt` | string | No | -- | What to avoid |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` (validated) |
| `num_images` | integer | No | `1` | Mapped to `n` |
| `seed` | integer | No | random | Reproducibility seed |
| `image_fidelity` | float | No | -- | Image fidelity strength |
| `human_fidelity` | float | No | -- | Human fidelity strength |
| `resolution` | string | No | -- | Output resolution override |
| `image_url` | string | No | -- | Reference image URL |
| `image_reference` | object | No | -- | Image reference config |

**S3 Path:** `logos/kling/{logo_kling_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.7 logo-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-runway` |
| **Lambda** | `ssm-content-worker-logo-runway` |
| **Provider** | Runway ML |
| **API URL** | `https://api.dev.runwayml.com/v1/text_to_image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `RUNWAY_API_KEY` Header: `Authorization: Bearer {key}` + `X-Runway-Version: 2024-11-06` |

### Parameters

> **Note:** All models listed above accept the same parameters. `gen4_image_turbo` supports `reference_images` for image-guided generation.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Logo description (mapped to `promptText`) |
| `model` | string | No | `gen4_image` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| `ratio` | string | No | `1280:720` | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| `seed` | integer | No | random | Reproducibility seed |
| `reference_images` | array | No | -- | Reference images (mapped to `referenceImages`) |

**S3 Path:** `logos/runway/{logo_runway_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.8 logo-flux

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-flux` |
| **Lambda** | `ssm-content-worker-logo-flux` |
| **Provider** | Flux via fal.ai (dedicated) |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/flux-pro/v1.1` | Pro standard (default) |
| `fal-ai/flux-pro/v1.1-ultra` | Pro ultra |
| `fal-ai/flux/dev` | Open dev model |

---

#### Model: `fal-ai/flux-pro/v1.1` (Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | `16:9` | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

> **Note:** Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | `28` | `1` - `50` |
| `guidance_scale` | float | No | `3.5` | -- |

**S3 Path:** `logos/flux/{logo_flux_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.9 logo-ideogram

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-ideogram` |
| **Lambda** | `ssm-content-worker-logo-ideogram` |
| **Provider** | Ideogram v3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/ideogram/v3` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Logo description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `negative_prompt` | string | No | -- | What to avoid |
| `rendering_speed` | string | No | `BALANCED` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Style preset ID |
| `style_codes` | array | No | -- | Style code references |
| `image_urls` | array | No | -- | Reference image URLs |
| `color_palette` | object | No | -- | Color palette configuration |
| `expand_prompt` | boolean | No | `true` | AI prompt expansion |
| `num_images` | integer | No | `1` | Range: **1--8** |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `logos/ideogram/{logo_ideogram_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 3.10 logo-recraft

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-logo-recraft` |
| **Lambda** | `ssm-content-worker-logo-recraft` |
| **Provider** | Recraft V3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/recraft/v3/text-to-image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Logo description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `style` | string | No | `realistic_image` | 70+ Recraft styles (e.g. `realistic_image`, `digital_illustration`, `vector_illustration`, `icon`, `logo`) |
| `colors` | object | No | -- | Color configuration |
| `style_id` | string | No | -- | Custom style ID |
| `enable_safety_checker` | boolean | No | `false` | Safety checker |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `logos/recraft/{logo_recraft_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 4. ICON (10 Provider)
> S3 prefix: `icons/{provider}/`. Icon-vertex ozel parametreler (style, category, design_system, platform, color_scheme, export_sizes) icerir. Diger provider'lar ilgili image handler parametrelerini kullanir.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI | `icon-vertex` | `imagen-4`, `imagen-4-fast`, `imagen-4-ultra`, `imagen-3`, `imagen-3-fast` |
| 2 | OpenAI | `icon-openai` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini`, `dall-e-3` |
| 3 | Stability AI | `icon-stability` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash`, `stable-image-ultra`, `stable-image-core` |
| 4 | fal.ai Gateway | `icon-fal` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev`, `fal-ai/ideogram/v3`, `fal-ai/recraft/v3/text-to-image`, `fal-ai/stable-diffusion-v35-large` |
| 5 | Luma Photon | `icon-luma` | `photon-1`, `photon-flash-1` |
| 6 | Kling AI | `icon-kling` | `kling-v2-1` (default), `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v3`, `image-o1` |
| 7 | Runway ML | `icon-runway` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| 8 | Flux (fal.ai) | `icon-flux` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev` |
| 9 | Ideogram (fal.ai) | `icon-ideogram` | `fal-ai/ideogram/v3` |
| 10 | Recraft (fal.ai) | `icon-recraft` | `fal-ai/recraft/v3/text-to-image` |

## 4.1 icon-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-vertex` |
| **Lambda** | `ssm-content-worker-icon-vertex` |
| **Provider** | Google Vertex AI — Gemini image family (Icon-specialized; Imagen retired) |
| **Package** | Docker (ECR) |
| **Auth** | Workload Identity Federation |
| **Aspect Ratio** | Hardcoded `1:1` (icons always square) |

### Models

| Model Value | Vertex Model ID | Speed | Quality |
|-------------|----------------|-------|---------|
| `gemini-3.1-flash-image` | `gemini-3.1-flash-image` (default) | Fast | Best |
| `gemini-3-pro-image` | `gemini-3-pro-image` | Slow | Ultra |
| `gemini-2.5-flash-image` | `gemini-2.5-flash-image` (retires 2026-10-02) | Fast | Good |
| `imagen-4` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-fast` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-ultra` *(legacy alias)* | → `gemini-3-pro-image` | Slow | Ultra |
| `imagen-3` / `imagen-3-fast` / `imagen-3-v2` *(legacy aliases)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-3-capability` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |

> **Migration note (2026-08-04):** Google retired the entire Imagen generate family on Vertex AI
> (2026-06-30). All `imagen-*` model values remain accepted for backward compatibility and are
> transparently mapped to the Gemini image family shown above. `negative_prompt` is folded into
> the prompt text; `guidance_scale`, `add_watermark`, `enhance_prompt`, `language_code` and
> `safety_setting` are accepted but ignored (SynthID watermark is always on).

### Icon Styles

| Style Value | Description |
|-------------|-------------|
| `flat` | Flat minimal icon (default) |
| `outlined` | Stroke-based outlined icon |
| `filled` | Solid filled icon |
| `3d` | 3D rendered icon |
| `glassmorphism` | Glass/frosted glass effect |
| `gradient` | Gradient fill icon |
| `glyph` | Single-color glyph |
| `duotone` | Two-tone icon |
| `neumorphism` | Soft shadow neumorphic style |
| `pixel` | Pixel art icon |

### Icon Categories
`ui` (default), `navigation`, `action`, `notification`, `social`, `media`, `file`, `commerce`, `weather`, `game`, `emoji`, `brand`

### Design Systems
`material_design`, `sf_symbols`, `fluent_ui`, `phosphor`, `feather`, `custom` (default)

### Platforms
`ios`, `android`, `web`, `universal` (default)

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Icon description (**returns 400 if empty**) |
| `style` | string | No | `flat` | `flat`, `outlined`, `filled`, `3d`, `glassmorphism`, `gradient`, `glyph`, `duotone`, `neumorphism`, `pixel` |
| `category` | string | No | `ui` | `ui`, `navigation`, `action`, `notification`, `social`, `media`, `file`, `commerce`, `weather`, `game`, `emoji`, `brand` |
| `design_system` | string | No | `custom` | `material_design`, `sf_symbols`, `fluent_ui`, `phosphor`, `feather`, `custom` |
| `platform` | string | No | `universal` | `ios`, `android`, `web`, `universal` |
| `background` | string | No | `transparent` | Background type |
| `color_scheme` | object | No | -- | `{primary: "#2563EB", secondary: "#6B7280", accent: "#F59E0B", background: "transparent"}` |
| `size` | integer | No | `512` | Base generation size |
| `export_sizes` | array\<int\> | No | `[32, 64, 128, 256, 512]` | Generates resized variants for each size |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `count` | integer | No | `1` | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `negative_prompt` | string | No | auto-generated | Overrides auto-generated per-style negatives |
| `guidance_scale` | float | No | `8.0` | Prompt adherence (CFG scale) |
| `output_format` | string | No | `png` | Output format |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add watermark |
| `enhance_prompt` | boolean | No | -- | AI prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `ko`, `ja`, `hi`, `zh`, `pt` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0`--`100` (JPEG only) |

**S3 Path:** `icons/vertex/{icon_vertex_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 4.2 icon-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-openai` |
| **Lambda** | `ssm-content-worker-icon-openai` |
| **Provider** | OpenAI Images API |
| **API URL** | `https://api.openai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |
| **Output** | png / jpeg / webp image |

### Models

| Model Value | Prompt Limit | Sizes |
|-------------|-------------|-------|
| `gpt-image-1` (default) | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `gpt-image-1.5` | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `gpt-image-1-mini` | 32,000 chars | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `dall-e-3` | 4,000 chars | `1024x1024`, `1792x1024`, `1024x1792` |

---

#### Model: `dall-e-3`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 4,000 chars |
| `model` | string | **Yes** | -- | `dall-e-3` |
| `size` | string | No | `1024x1024` | `1024x1024`, `1792x1024`, `1024x1792` |
| `quality` | string | No | `standard` | `standard`, `hd` |
| `style` | string | No | `vivid` | `vivid`, `natural` |
| `n` | integer | -- | `1` | Hardcoded to 1 |

---

#### Model: `gpt-image-1` / `gpt-image-1.5` / `gpt-image-1-mini`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 chars |
| `model` | string | No | `gpt-image-1` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1` - `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier |

**S3 Path:** `icons/openai/{icon_openai_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 4.3 icon-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-stability` |
| **Lambda** | `ssm-content-worker-icon-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/{core\|ultra\|sd3}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |
| **Output** | png / jpeg / webp image |

### Models

| Model Value | API Endpoint Suffix |
|-------------|-------------------|
| `stable-image-core` (default) | `/core` |
| `stable-image-ultra` | `/ultra` |
| `sd3` | `/sd3` |
| `sd3.5-large` | `/sd3` |
| `sd3.5-large-turbo` | `/sd3` |
| `sd3.5-medium` | `/sd3` |
| `sd3.5-flash` | `/sd3` |

---

#### Models: `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` (SD3 Family)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` |
| `negative_prompt` | string | No | -- | Max 10,000 chars |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `cfg_scale` | float | No | -- | `0.0` - `10.0` |
| `image_url` | string | No | -- | Reference image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

---

#### Models: `stable-image-ultra`, `stable-image-core` (Ultra / Core)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `stable-image-ultra`, `stable-image-core` |
| `negative_prompt` | string | No | -- | Max 10,000 chars |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | random | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Reference image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

> **Note:** Ultra/Core models do NOT support `cfg_scale`.

**S3 Path:** `icons/stability/{icon_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.4 icon-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-fal` |
| **Lambda** | `ssm-content-worker-icon-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpg / webp image |

### Models

| Model Value | Description |
|-------------|-------------|
| `fal-ai/flux-pro/v1.1` | FLUX Pro v1.1 (default) |
| `fal-ai/flux-pro/v1.1-ultra` | FLUX Pro Ultra |
| `fal-ai/flux/dev` | FLUX Dev |
| `fal-ai/ideogram/v3` | Ideogram v3 |
| `fal-ai/recraft/v3/text-to-image` | Recraft V3 |
| `fal-ai/stable-diffusion-v35-large` | SD 3.5 Large |

---

#### Model: `fal-ai/flux-pro/v1.1` (Flux Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Flux Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

> **Note:** Flux Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Flux Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

---

#### Model: `fal-ai/ideogram/v3` (Ideogram V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/ideogram/v3` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `negative_prompt` | string | No | -- | Free text |
| `rendering_speed` | string | No | -- | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Passthrough |
| `expand_prompt` | boolean | No | -- | -- |
| `color_palette` | any | No | -- | Passthrough |
| `image_urls` | array | No | -- | Reference image URLs |

---

#### Model: `fal-ai/recraft/v3/text-to-image` (Recraft V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/recraft/v3/text-to-image` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `style` | string | No | -- | Style preset |
| `colors` | any | No | -- | Color palette |
| `style_id` | string | No | -- | Custom style reference |

---

#### Model: `fal-ai/stable-diffusion-v35-large` (SD 3.5 Large)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/stable-diffusion-v35-large` |
| `image_size` | string/object | No | -- | fal.ai presets or `{width, height}` |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `png`, `jpeg`, `webp` |
| `negative_prompt` | string | No | -- | Free text |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |

**S3 Path:** `icons/fal/{icon_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.5 icon-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-luma` |
| **Lambda** | `ssm-content-worker-icon-luma` |
| **Provider** | Luma Photon |
| **API URL** | `https://api.lumalabs.ai/dream-machine/v1/generations/image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `LUMA_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Icon description |
| `model` | string | No | `photon-1` | `photon-1`, `photon-flash-1` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `format` | string | No | `jpg` | `jpg`, `png` |
| `image_ref` | object | No | -- | Reference image |
| `style_ref` | object | No | -- | Style reference |
| `character_ref` | object | No | -- | Character reference |
| `modify_image_ref` | object | No | -- | Modify image reference |

**S3 Path:** `icons/luma/{icon_luma_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.6 icon-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-kling` |
| **Lambda** | `ssm-content-worker-icon-kling` |
| **Provider** | Kling AI |
| **API URL** | `https://api.klingai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer` with `PyJWT`) |
| **Auth** | JWT Bearer (HS256 from `KLING_ACCESS_KEY` + `KLING_SECRET_KEY`) |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Icon description |
| `model` | string | No | `kling-v2-1` | `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v2-1`, `kling-v3`, `image-o1` |
| `negative_prompt` | string | No | -- | What to avoid |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` (validated) |
| `num_images` | integer | No | `1` | Mapped to `n` |
| `seed` | integer | No | random | Reproducibility seed |
| `image_fidelity` | float | No | -- | Image fidelity strength |
| `human_fidelity` | float | No | -- | Human fidelity strength |
| `resolution` | string | No | -- | Output resolution override |
| `image_url` | string | No | -- | Reference image URL |
| `image_reference` | object | No | -- | Image reference config |

**S3 Path:** `icons/kling/{icon_kling_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.7 icon-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-runway` |
| **Lambda** | `ssm-content-worker-icon-runway` |
| **Provider** | Runway ML |
| **API URL** | `https://api.dev.runwayml.com/v1/text_to_image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `RUNWAY_API_KEY` Header: `Authorization: Bearer {key}` + `X-Runway-Version: 2024-11-06` |

### Parameters

> **Note:** All models listed above accept the same parameters. `gen4_image_turbo` supports `reference_images` for image-guided generation.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Icon description (mapped to `promptText`) |
| `model` | string | No | `gen4_image` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| `ratio` | string | No | `1280:720` | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| `seed` | integer | No | random | Reproducibility seed |
| `reference_images` | array | No | -- | Reference images (mapped to `referenceImages`) |

**S3 Path:** `icons/runway/{icon_runway_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.8 icon-flux

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-flux` |
| **Lambda** | `ssm-content-worker-icon-flux` |
| **Provider** | Flux via fal.ai (dedicated) |
| **API URL** | `https://queue.fal.run/{model}` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpeg image |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/flux-pro/v1.1` | Pro standard (default) |
| `fal-ai/flux-pro/v1.1-ultra` | Pro ultra |
| `fal-ai/flux/dev` | Open dev model |

---

#### Model: `fal-ai/flux-pro/v1.1` (Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | `16:9` | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

> **Note:** Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | `28` | `1` - `50` |
| `guidance_scale` | float | No | `3.5` | -- |

**S3 Path:** `icons/flux/{icon_flux_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.9 icon-ideogram

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-ideogram` |
| **Lambda** | `ssm-content-worker-icon-ideogram` |
| **Provider** | Ideogram v3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/ideogram/v3` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Icon description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `negative_prompt` | string | No | -- | What to avoid |
| `rendering_speed` | string | No | `BALANCED` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Style preset ID |
| `style_codes` | array | No | -- | Style code references |
| `image_urls` | array | No | -- | Reference image URLs |
| `color_palette` | object | No | -- | Color palette configuration |
| `expand_prompt` | boolean | No | `true` | AI prompt expansion |
| `num_images` | integer | No | `1` | Range: **1--8** |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `icons/ideogram/{icon_ideogram_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 4.10 icon-recraft

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-icon-recraft` |
| **Lambda** | `ssm-content-worker-icon-recraft` |
| **Provider** | Recraft V3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/recraft/v3/text-to-image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Icon description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `style` | string | No | `realistic_image` | 70+ Recraft styles (e.g. `realistic_image`, `digital_illustration`, `vector_illustration`, `icon`, `logo`) |
| `colors` | object | No | -- | Color configuration |
| `style_id` | string | No | -- | Custom style ID |
| `enable_safety_checker` | boolean | No | `false` | Safety checker |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `icons/recraft/{icon_recraft_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 5. SPRITE (10 Provider)
> S3 prefix: `sprites/{provider}/`. Sprite-vertex ozel parametreler (sprite_type, animation, directions, sheet_config, metadata) icerir. Diger provider'lar ilgili image handler parametrelerini kullanir.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI | `sprite-vertex` | `imagen-4`, `imagen-4-fast`, `imagen-4-ultra`, `imagen-3`, `imagen-3-fast` |
| 2 | OpenAI | `sprite-openai` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini`, `dall-e-3` |
| 3 | Stability AI | `sprite-stability` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash`, `stable-image-ultra`, `stable-image-core` |
| 4 | fal.ai Gateway | `sprite-fal` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev`, `fal-ai/ideogram/v3`, `fal-ai/recraft/v3/text-to-image`, `fal-ai/stable-diffusion-v35-large` |
| 5 | Luma Photon | `sprite-luma` | `photon-1`, `photon-flash-1` |
| 6 | Kling AI | `sprite-kling` | `kling-v2-1` (default), `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v3`, `image-o1` |
| 7 | Runway ML | `sprite-runway` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| 8 | Flux (fal.ai) | `sprite-flux` | `fal-ai/flux-pro/v1.1`, `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux/dev` |
| 9 | Ideogram (fal.ai) | `sprite-ideogram` | `fal-ai/ideogram/v3` |
| 10 | Recraft (fal.ai) | `sprite-recraft` | `fal-ai/recraft/v3/text-to-image` |

## 5.1 sprite-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-vertex` |
| **Lambda** | `ssm-content-worker-sprite-vertex` |
| **Provider** | Google Vertex AI — Gemini image family (Sprite-specialized; Imagen retired) |
| **Package** | Docker (ECR) |
| **Auth** | Workload Identity Federation |
| **Aspect Ratio** | Hardcoded `1:1` (sprites always square) |

### Models

| Model Value | Vertex Model ID | Speed | Quality |
|-------------|----------------|-------|---------|
| `gemini-3.1-flash-image` | `gemini-3.1-flash-image` (default) | Fast | Best |
| `gemini-3-pro-image` | `gemini-3-pro-image` | Slow | Ultra |
| `gemini-2.5-flash-image` | `gemini-2.5-flash-image` (retires 2026-10-02) | Fast | Good |
| `imagen-4` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-fast` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-4-ultra` *(legacy alias)* | → `gemini-3-pro-image` | Slow | Ultra |
| `imagen-3` / `imagen-3-fast` / `imagen-3-v2` *(legacy aliases)* | → `gemini-3.1-flash-image` | Fast | Best |
| `imagen-3-capability` *(legacy alias)* | → `gemini-3.1-flash-image` | Fast | Best |

> **Migration note (2026-08-04):** Google retired the entire Imagen generate family on Vertex AI
> (2026-06-30). All `imagen-*` model values remain accepted for backward compatibility and are
> transparently mapped to the Gemini image family shown above. `negative_prompt` is folded into
> the prompt text; `guidance_scale`, `add_watermark`, `enhance_prompt`, `language_code` and
> `safety_setting` are accepted but ignored (SynthID watermark is always on).

### Sprite Styles

| Style Value | Description |
|-------------|-------------|
| `pixel_8bit` | Classic 8-bit pixel art |
| `pixel_16bit` | 16-bit era pixel art |
| `pixel_32bit` | 32-bit era pixel art |
| `modern_pixel` | Modern pixel art style (default) |
| `cartoon` | Cartoon sprite style |
| `chibi` | Super-deformed chibi style |
| `isometric` | Isometric view sprite |

### Sprite Types

| Type Value | Description | Prompt Template |
|------------|-------------|-----------------|
| `character` | Playable character (default) | Character-specific template |
| `enemy` | Enemy/monster sprite | Enemy-specific template |
| `npc` | Non-player character | NPC template |
| `item` | Collectible/usable item | Item-specific template |
| `prop` | Environmental prop | Prop template |
| `projectile` | Bullet/projectile sprite | Projectile template |
| `effect` | Visual effect (explosion, magic) | Effect-specific template |
| `ui_element` | UI sprite element | UI template |

### Animation Types
`idle` (default), `walk`, `run`, `jump`, `attack`, `hurt`, `death`, `celebrate`

### Directions
`front` (default), `back`, `left`, `right`, `front_left`, `front_right`, `back_left`, `back_right`

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sprite description (**returns 400 if empty**) |
| `style` | string | No | `modern_pixel` | `pixel_8bit`, `pixel_16bit`, `pixel_32bit`, `modern_pixel`, `cartoon`, `chibi`, `isometric` |
| `sprite_type` | string | No | `character` | `character`, `enemy`, `npc`, `item`, `prop`, `projectile`, `effect`, `ui_element` |
| `frame_width` | integer | No | `64` | Pixel width of each sprite frame |
| `frame_height` | integer | No | `64` | Pixel height of each sprite frame |
| `generate_animation` | boolean | No | `false` | Generate animation frames |
| `animation_type` | string | No | `idle` | `idle`, `walk`, `run`, `jump`, `attack`, `hurt`, `death`, `celebrate` |
| `animation_frames` | integer | No | `4` | Number of animation frames |
| `generate_sheet` | boolean | No | `false` | Generate sprite sheet |
| `sheet_config` | object | No | -- | `{columns: 4, rows: 4, frame_width: 64, frame_height: 64, padding: 0}` |
| `generate_directions` | boolean | No | `false` | Generate multiple direction views |
| `directions` | array\<string\> | No | `["front"]` | `front`, `back`, `left`, `right`, `front_left`, `front_right`, `back_left`, `back_right` |
| `background` | string | No | `transparent` | Background type |
| `generate_metadata` | boolean | No | `true` | Export JSON metadata for game engines |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `count` | integer | No | `1` | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `negative_prompt` | string | No | auto-generated | Overrides per-style auto-negatives |
| `guidance_scale` | float | No | `8.0` | Prompt adherence (CFG scale) |
| `output_format` | string | No | `png` | Output format |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `add_watermark` | boolean | No | -- | Add watermark |
| `enhance_prompt` | boolean | No | -- | AI prompt enhancement |
| `safety_setting` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `language_code` | string | No | -- | `auto`, `en`, `es`, `ko`, `ja`, `hi`, `zh`, `pt` |
| `sample_image_size` | string | No | -- | `1K`, `2K` |
| `output_mime_type` | string | No | -- | `image/png`, `image/jpeg` |
| `compression_quality` | integer | No | -- | `0`--`100` (JPEG only) |

### Metadata Output
When `generate_metadata=true`, outputs a JSON file with frame positions, sizes, and RGBA8888 format specification for game engine integration.

**S3 Path:** `sprites/vertex/{sprite_vertex_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

## 5.2 sprite-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-openai` |
| **Lambda** | `ssm-content-worker-sprite-openai` |
| **Provider** | OpenAI DALL-E / GPT Image |
| **Package** | ZIP |

### Models

| Model Value | Prompt Limit | Notes |
|-------------|-------------|-------|
| `gpt-image-1` | **32,000 chars** | Latest, best quality |
| `gpt-image-1.5` | **32,000 chars** | Enhanced version |
| `gpt-image-1-mini` | **32,000 chars** | Smaller, faster |
| `dall-e-3` | **4,000 chars** | Classic, n forced to 1 |

---

#### Model: `dall-e-3`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 4,000 chars |
| `model` | string | **Yes** | -- | `dall-e-3` |
| `size` | string | No | `1024x1024` | `1024x1024`, `1792x1024`, `1024x1792` |
| `quality` | string | No | `standard` | `standard`, `hd` |
| `style` | string | No | `vivid` | `vivid`, `natural` |
| `n` | integer | -- | `1` | Hardcoded to 1 |

---

#### Model: `gpt-image-1` / `gpt-image-1.5` / `gpt-image-1-mini`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 32,000 chars |
| `model` | string | No | `gpt-image-1` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` |
| `size` | string | No | `auto` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | `1` - `10` |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_compression` | integer | No | -- | `0` - `100` (JPEG/WebP) |
| `moderation` | string | No | -- | `low`, `auto` |
| `user` | string | No | -- | Unique end-user identifier |

---

## 5.3 sprite-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-stability` |
| **Lambda** | `ssm-content-worker-sprite-stability` |
| **Provider** | Stability AI |
| **Package** | ZIP |
| **Prompt Limit** | **10,000 chars** |

### Models

| Model Value | Endpoint | Notes |
|-------------|----------|-------|
| `sd3` | `/sd3` | Stable Diffusion 3 |
| `sd3.5-large` | `/sd3` | Stable Diffusion 3.5 Large |
| `sd3.5-large-turbo` | `/sd3` | Stable Diffusion 3.5 Large Turbo |
| `sd3.5-medium` | `/sd3` | Stable Diffusion 3.5 Medium |
| `sd3.5-flash` | `/sd3` | Stable Diffusion 3.5 Flash |
| `stable-image-ultra` | `/ultra` | Highest quality |
| `stable-image-core` | `/core` | Fast, good quality |

---

#### Models: `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` (SD3 Family)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `sd3`, `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`, `sd3.5-flash` |
| `negative_prompt` | string | No | `""` | Free text |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | -- | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `cfg_scale` | float | No | -- | `0.0` - `10.0` |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

---

#### Models: `stable-image-ultra`, `stable-image-core` (Ultra / Core)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 10,000 chars |
| `model` | string | No | `stable-image-core` | `stable-image-ultra`, `stable-image-core` |
| `negative_prompt` | string | No | `""` | Free text |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` |
| `seed` | integer | No | -- | Reproducibility seed |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `style_preset` | string | No | -- | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | `0.5` | `0.0` - `1.0` (only with `image_url`) |

> **Note:** Ultra/Core models do NOT support `cfg_scale`.

---

## 5.4 sprite-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-fal` |
| **Lambda** | `ssm-content-worker-sprite-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **Package** | ZIP |

### Models

| Model Value | Provider | Notes |
|-------------|----------|-------|
| `fal-ai/flux-pro/v1.1` | Flux Pro | Default |
| `fal-ai/flux-pro/v1.1-ultra` | Flux Pro Ultra | Highest quality |
| `fal-ai/flux/dev` | Flux Dev | Open model |
| `fal-ai/ideogram/v3` | Ideogram V3 | Text rendering |
| `fal-ai/recraft/v3/text-to-image` | Recraft V3 | Design/vector |
| `fal-ai/stable-diffusion-v35-large` | SD 3.5 Large | Classic SD |

---

#### Model: `fal-ai/flux-pro/v1.1` (Flux Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `ip_adapter_image_url` | string | No | -- | IP-Adapter style reference image |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Flux Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `ip_adapter_image_url` | string | No | -- | IP-Adapter style reference image |

> **Note:** Flux Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Flux Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | -- | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `ip_adapter_image_url` | string | No | -- | IP-Adapter style reference image |

---

#### Model: `fal-ai/ideogram/v3` (Ideogram V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/ideogram/v3` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `negative_prompt` | string | No | -- | Free text |
| `rendering_speed` | string | No | -- | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Passthrough |
| `expand_prompt` | boolean | No | -- | -- |
| `color_palette` | any | No | -- | Passthrough |
| `image_urls` | array | No | -- | Reference image URLs |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |

---

#### Model: `fal-ai/recraft/v3/text-to-image` (Recraft V3)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/recraft/v3/text-to-image` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `style` | string | No | -- | Style preset |
| `colors` | any | No | -- | Color palette |
| `style_id` | string | No | -- | Custom style reference |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |

---

#### Model: `fal-ai/stable-diffusion-v35-large` (SD 3.5 Large)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/stable-diffusion-v35-large` |
| `image_size` | string/object | No | -- | fal.ai size presets or `{width, height}` |
| `seed` | integer | No | -- | -- |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `negative_prompt` | string | No | -- | Free text |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | -- |
| `enable_safety_checker` | boolean | No | -- | -- |
| `image_url` | string | No | -- | Source image URL (img2img) |
| `strength` | float | No | -- | Denoising strength (0.0-1.0) |
| `control_image_url` | string | No | -- | ControlNet control image URL |

---

## 5.5 sprite-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-luma` |
| **Lambda** | `ssm-content-worker-sprite-luma` |
| **Provider** | Luma Photon |
| **API URL** | `https://api.lumalabs.ai/dream-machine/v1/generations/image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `LUMA_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sprite description |
| `model` | string | No | `photon-1` | `photon-1`, `photon-flash-1` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `format` | string | No | `jpg` | `jpg`, `png` |
| `image_ref` | object | No | -- | Reference image |
| `style_ref` | object | No | -- | Style reference |
| `character_ref` | object | No | -- | Character reference |
| `modify_image_ref` | object | No | -- | Modify image reference |

**S3 Path:** `sprites/luma/{sprite_luma_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 5.6 sprite-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-kling` |
| **Lambda** | `ssm-content-worker-sprite-kling` |
| **Provider** | Kling AI |
| **API URL** | `https://api.klingai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer` with `PyJWT`) |
| **Auth** | JWT Bearer (HS256 from `KLING_ACCESS_KEY` + `KLING_SECRET_KEY`) |

### Parameters

> **Note:** All models listed above accept the same parameters.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sprite description |
| `model` | string | No | `kling-v2-1` | `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-new`, `kling-v2-1`, `kling-v3`, `image-o1` |
| `negative_prompt` | string | No | -- | What to avoid |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` (validated) |
| `num_images` | integer | No | `1` | Mapped to `n` |
| `seed` | integer | No | random | Reproducibility seed |
| `image_fidelity` | float | No | -- | Image fidelity strength |
| `human_fidelity` | float | No | -- | Human fidelity strength |
| `resolution` | string | No | -- | Output resolution override |
| `image_url` | string | No | -- | Reference image URL |
| `image_reference` | object | No | -- | Image reference config |

**S3 Path:** `sprites/kling/{sprite_kling_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 5.7 sprite-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-runway` |
| **Lambda** | `ssm-content-worker-sprite-runway` |
| **Provider** | Runway ML |
| **API URL** | `https://api.dev.runwayml.com/v1/text_to_image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `RUNWAY_API_KEY` Header: `Authorization: Bearer {key}` + `X-Runway-Version: 2024-11-06` |

### Parameters

> **Note:** All models listed above accept the same parameters. `gen4_image_turbo` supports `reference_images` for image-guided generation.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sprite description (mapped to `promptText`) |
| `model` | string | No | `gen4_image` | `gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash` |
| `ratio` | string | No | `1280:720` | `1024:1024`, `1080:1080`, `1168:880`, `1360:768`, `1440:1080`, `1080:1440`, `1808:768`, `1920:1080`, `1080:1920`, `2112:912`, `1280:720`, `720:1280`, `720:720`, `960:720`, `720:960`, `1680:720` |
| `seed` | integer | No | random | Reproducibility seed |
| `reference_images` | array | No | -- | Reference images (mapped to `referenceImages`) |

**S3 Path:** `sprites/runway/{sprite_runway_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 5.8 sprite-flux

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-flux` |
| **Lambda** | `ssm-content-worker-sprite-flux` |
| **Provider** | Flux via fal.ai (Dedicated) |
| **Package** | Docker |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/flux-pro/v1.1` | Pro standard (default) |
| `fal-ai/flux-pro/v1.1-ultra` | Pro ultra |
| `fal-ai/flux/dev` | Open dev model |

---

#### Model: `fal-ai/flux-pro/v1.1` (Pro)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/flux-pro/v1.1` | -- |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

---

#### Model: `fal-ai/flux-pro/v1.1-ultra` (Ultra)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux-pro/v1.1-ultra` |
| `aspect_ratio` | string | No | `16:9` | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |
| `raw` | boolean | No | -- | Less processed output |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |

> **Note:** Ultra uses `aspect_ratio` instead of `image_size`.

---

#### Model: `fal-ai/flux/dev` (Dev)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | **Yes** | -- | `fal-ai/flux/dev` |
| `image_size` | string | No | `landscape_4_3` | fal.ai presets |
| `seed` | integer | No | random | -- |
| `num_images` | integer | No | `1` | `1` - `4` |
| `output_format` | string | No | -- | `jpeg`, `png` |
| `safety_tolerance` | string | No | `2` | `1` - `6` |
| `enhance_prompt` | boolean | No | -- | -- |
| `num_inference_steps` | integer | No | `28` | `1` - `50` |
| `guidance_scale` | float | No | `3.5` | -- |

**S3 Path:** `sprites/flux/{sprite_flux_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 5.9 sprite-ideogram

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-ideogram` |
| **Lambda** | `ssm-content-worker-sprite-ideogram` |
| **Provider** | Ideogram v3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/ideogram/v3` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sprite description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `negative_prompt` | string | No | -- | What to avoid |
| `rendering_speed` | string | No | `BALANCED` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | string | No | -- | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | string | No | -- | Style preset ID |
| `style_codes` | array | No | -- | Style code references |
| `image_urls` | array | No | -- | Reference image URLs |
| `color_palette` | object | No | -- | Color palette configuration |
| `expand_prompt` | boolean | No | `true` | AI prompt expansion |
| `num_images` | integer | No | `1` | Range: **1--8** |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `sprites/ideogram/{sprite_ideogram_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 5.10 sprite-recraft

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sprite-recraft` |
| **Lambda** | `ssm-content-worker-sprite-recraft` |
| **Provider** | Recraft V3 via fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/recraft/v3/text-to-image` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sprite description |
| `image_size` | string | No | `square_hd` | fal.ai size preset |
| `style` | string | No | `realistic_image` | 70+ Recraft styles (e.g. `realistic_image`, `digital_illustration`, `vector_illustration`, `icon`, `logo`) |
| `colors` | object | No | -- | Color configuration |
| `style_id` | string | No | -- | Custom style ID |
| `enable_safety_checker` | boolean | No | `false` | Safety checker |
| `seed` | integer | No | random | Reproducibility seed |

**S3 Path:** `sprites/recraft/{sprite_recraft_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 6. VIDEO (14 Provider)
> Tum video handler'lar asenkron calışır: submit --> poll --> download --> S3. S3 prefix: `videos/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI Veo | `video-vertex` | `veo-2`, `veo-3`, `veo-3-fast`, `veo-3.1`, `veo-3.1-fast` |
| 2 | Vertex AI Veo 3.x | `video-vertex-v3` | `veo-3`, `veo-3-fast`, `veo-3.1`, `veo-3.1-fast` |
| 2b | Vertex AI — Gemini Omni Flash (Interactions surface) | `video-vertex-omni-flash` | `gemini-omni-flash-preview` (only; 720p/24 fixed, 3–10 s, text/image/reference/dialogue tasks) |
| 3 | OpenAI Sora | `video-openai` | `sora-2`, `sora-2-pro`, `sora-2-2025-10-06`, `sora-2-pro-2025-10-06`, `sora-2-2025-12-08` |
| 4 | Luma Dream Machine | `video-luma` | `ray-2`, `ray-flash-2` |
| 5 | Kling AI | `video-kling` | `kling-v1`, `kling-v1-5`, `kling-v1-6`, `kling-v2-5-turbo`, `kling-v2-6`, `kling-v2-1-master` |
| 6 | Runway ML | `video-runway` | `gen3a_turbo`, `gen4_turbo`, `gen4.5`, `gen4_aleph` |
| 7 | fal.ai Gateway | `video-fal` | `fal-ai/kling-video/v2/master/text-to-video`, `fal-ai/minimax/video-01/text-to-video`, `fal-ai/veo3`, `fal-ai/wan/v2.1/1.3b/text-to-video`, `fal-ai/cogvideox-5b`, `fal-ai/hunyuan-video`, `fal-ai/ltx-video/v0.9.1` + I2V variants |
| 8 | MiniMax/Hailuo | `video-minimax` | `fal-ai/minimax/video-01/text-to-video`, `fal-ai/minimax/video-01-live/image-to-video`, `fal-ai/minimax-video/image-to-video/hailuo` |
| 9 | Mochi | `video-mochi` | `fal-ai/mochi-v1` |
| 10 | PixVerse | `video-pixverse` | `fal-ai/pixverse/v4.5/image-to-video` |
| 11 | Hunyuan | `video-hunyuan` | `fal-ai/hunyuan-video` |
| 12 | HeyGen | `video-heygen` | `fal-ai/heygen/v2/video-agent`, `fal-ai/heygen/video-avatars` |
| 13 | LTX | `video-ltx` | `fal-ai/ltx-video/v0.9.1`, `fal-ai/ltx-video/v0.9.1/distilled` |

## 6.1 video-vertex

**Status:** ✅ **VERIFIED LIVE 2026-08-09** — three separate generations, two accounts (see MEASURED REALITY).
Broken from ~2026-05 until 2026-08-09 with `404 NOT_FOUND` on its own default model; fixed and redeployed.

| | |
|---|---|
| **Endpoint** | `POST /create-video-vertex` |
| **Lambda** | `ssm-content-worker-video-vertex` |
| **Provider** | Google Vertex AI Veo |
| **Package** | Docker (ECR) — image `ssm-content-assets-creator-video-v2`, digest `sha256:7aef11f75a19…` (2026-08-09) |
| **Auth** | Workload Identity Federation (keyless AWS→GCP) |
| **GCP project / region** | `contentanalyticsplatform` / `us-central1` |
| **DELIVERED resolution** | **1280×720** — measured with `ffprobe` on three delivered files. **The `width`/`height` in the response say 1920×1080; that is a static table in the worker, not the file.** |
| **Delivered file size** | 0.7–1.3 MB per 4 s clip (1,458–2,541 kbps), h264 + aac 48 kHz stereo, 24 fps |
| **Typical Lambda duration** | ~52 s for a 4 s clip (generation 30–43 s) |
| **S3 prefix** | `videos/` |

### Models

| Model Value | Vertex Model ID | Notes |
|-------------|----------------|-------|
| `veo-2` | `veo-2.0-generate-001` | Standard |
| `veo-3` | `veo-3.0-generate-001` | Veo 3.0 — **the only value that worked during the outage** (measured success 2026-06-22) |
| `veo-3-fast` | `veo-3.0-fast-generate-001` | Fast variant |
| `veo-3.1` | `veo-3.1-generate-001` | GA, full quality — **live-verified 2026-08-09** |
| `veo-3.1-fast` | `veo-3.1-fast-generate-001` | GA, fast variant (the default) — **live-verified 2026-08-09** |
| `veo-3.1-preview` | `veo-3.1-generate-001` | **RETIRED by Google — automatically redirected to the GA model.** The `veo-3.1-generate-preview` publisher ID was measured returning `404 NOT_FOUND` on 2026-05-09; the worker now substitutes the GA ID and logs `[WARN] Model '…-preview' was retired by Google`. **Live-verified 2026-08-09** |
| `veo-3.1-fast-preview` | `veo-3.1-fast-generate-001` | **RETIRED by Google — automatically redirected to the GA model** (same measurement, same warning). **Live-verified 2026-08-09** |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `veo-3.1-fast` | `veo-2`, `veo-3`, `veo-3-fast`, `veo-3.1`, `veo-3.1-fast` — plus accepted-but-UNMEASURED aliases `veo-2-exp`, `veo-2-preview`, `veo-3-preview`, `veo-3-fast-preview` (forwarded as-is; no callability measurement exists) and the two retired 3.1 preview values (auto-redirected, see Models) |
| `aspect_ratio` | string | No | `16:9` | `16:9`, `9:16` |
| `duration_seconds` | integer | No | `8` | Max `8` per segment |
| `total_duration` | integer | No | same as duration_seconds | For long video (auto-segmented) |
| `quality` | string | No | `high` | `draft`, `standard`, `high`, `ultra` |
| `output_format` | string | No | `mp4` | `mp4` |
| `negative_prompt` | string | No | -- | Free text |
| `enhance_prompt` | boolean | No | `true` | -- |
| `prompt_language` | string | No | `en` | Language code |
| `seed` | integer | No | -- | -- |
| `sample_count` | integer | No | `1` | `1` - `4` |
| `guidance_scale` | float | No | `7.5` | -- |
| `style` | string | No | -- | Visual style hint |
| `color_palette` | string | No | -- | Color palette description |
| `color_grading` | string | No | -- | Color grading style |
| `film_grain` | float | No | `0.0` | `0.0` - `1.0` |
| `vignette` | float | No | `0.0` | `0.0` - `1.0` |
| `contrast` | string | No | `normal` | Contrast setting |
| `saturation` | string | No | `normal` | Saturation setting |
| `camera_control` | object | No | -- | Official Veo camera control |
| `camera_motion` | string | No | -- | Legacy camera motion |
| `camera_angle` | string | No | -- | Camera angle |
| `camera_settings` | object | No | -- | `{depth_of_field, focal_length, focus_subject}` |
| `lighting_style` | string | No | -- | Lighting style |
| `lighting_settings` | object | No | -- | Lighting config |
| `time_of_day` | string | No | -- | Time setting |
| `weather` | string | No | -- | Weather setting |
| `include_audio` | boolean | No | `true` | Generate audio |
| `audio_prompt` | string | No | -- | Audio description |
| `audio_settings` | object | No | -- | `{music_style, ambient_sounds, sound_effects}` |
| `reference_images` | array | No | -- | Reference image objects |
| `first_frame_image` | string | No | -- | Start frame image |
| `last_frame_image` | string | No | -- | End frame image |
| `first_frame_mime_type` | string | No | `image/png` | MIME type |
| `last_frame_mime_type` | string | No | `image/png` | MIME type |
| `extend_video` | string | No | -- | Source video to extend |
| `extend_video_mime_type` | string | No | `video/mp4` | MIME type |
| `mask_image` | string | No | -- | Mask for editing |
| `mask_mime_type` | string | No | `image/png` | MIME type |
| `mask_mode` | string | No | -- | `insert`, `remove`, `remove_static`, `outpaint` |
| `character_description` | string | No | -- | Character desc for consistency |
| `character_reference` | string | No | -- | Character reference image |
| `maintain_consistency` | boolean | No | `true` | Character consistency |
| `person_generation` | string | No | `allow_adult` | `allow_all`, `allow_adult`, `dont_allow` |
| `safety_filter_level` | string | No | `block_medium_and_above` | `block_low_and_above`, `block_medium_and_above`, `block_only_high` |
| `fps` | integer | No | -- | Frame rate |
| `resolution` | string | No | -- | `720p`, `1080p` |
| `compression_quality` | string | No | `optimized` | `optimized`, `lossless` |
| `motion_blur` | float | No | `0.0` | `0.0` - `1.0` |
| `motion_speed` | string | No | `normal` | Motion speed |
| `physics_realism` | string | No | `realistic` | Physics realism |
| `composition_rule` | string | No | -- | Composition rule |
| `scene_depth` | string | No | `normal` | Scene depth |
| `environment_detail` | string | No | `high` | Environment detail |
| `pubsub_topic` | string | No | -- | Cloud Pub/Sub topic |
| `action` | string | No | -- | `long_video` for multi-segment |

---

## 6.2 video-vertex-v3

**Status:** ✅ **VERIFIED LIVE 2026-08-09** — two separate generations, one per account. Before that
evening its `-preview` aliases returned `404 NOT_FOUND`, because the deployed image carried a monolithic
handler that ignored the package's model table; the refactored handler is now shipped and the build itself
asserts the delegation before pushing.

| | |
|---|---|
| **Endpoint** | `POST /create-video-vertex-v3` |
| **Lambda** | `ssm-content-worker-video-vertex-v3` |
| **Provider** | Google Vertex AI Veo 3.x (Dedicated) |
| **Package** | Docker (ECR) — image `ssm-content-assets-creator-video-v3`, digest `sha256:f587fef87928…` (2026-08-09; the first digest ever shared by both accounts) |
| **DELIVERED resolution** | **1920×1080** — real, measured with `ffprobe` |
| **Delivered file size** | **98.7–139.1 MB per 4 s clip** (196,881–277,508 kbps) — the handler sends `compression_quality: LOSSLESS` and auto-provisions a GCS staging URI for it |
| **Typical Lambda duration** | ~100–110 s for a 4 s clip (generation ~95–104 s) |
| **S3 prefix** | `mobile-games/` — **different from 6.1** |
| **Response shape** | **FLAT, not the same as 6.1**: `url`, `public_url`, `video_id`, `duration_seconds`, `resolution` (a `"WxH"` string), `file_size_bytes`, `file_size_mb`, `has_audio`, `model`, `generation_time_seconds`, `prompt_used`. There is **no `videos[]` array** |

### Models

| Model Value | Notes |
|-------------|-------|
| `veo-3` | Veo 3.0 — this worker accepts Veo 3.1 only, so the request is forced onto `veo-3.1-generate-001` with a `[WARN] Non-Veo 3.1 model requested` line |
| `veo-3-fast` | Veo 3.0 Fast — same forcing as above |
| `veo-3.1` | Veo 3.1 GA (`veo-3.1-generate-001`) — **live-verified 2026-08-09 on account 723322847393** |
| `veo-3.1-fast` | Veo 3.1 Fast GA (`veo-3.1-fast-generate-001`) |
| `veo-3.1-preview` / `veo-3.1-fast-preview` | **RETIRED by Google — automatically redirected to the matching GA model** with a `[WARN] … was retired by Google` line. **Live-verified 2026-08-09 on account 723322847393** — this exact request returned `404 NOT_FOUND` before the refactored handler was deployed the same evening |

### Parameters

**Not the same codebase as 6.1 — corrected in v5.** v4 said "shares the same codebase"; it does not. This
endpoint runs a separate package (`video_vertex_v3/`) whose handler delegates to its own `generator.py`
and accepts Veo 3.1 only. Valid single-clip durations are **4, 6, 8 s** (a request is snapped to the
nearest); aspect ratio `16:9` or `9:16`. Default model: `veo-3.1-generate-001`.

**Full parameter surface (completed 2026-08-12 from the worker's own `request_models.py`, which cites
the Veo REST reference + python-genai SDK per field; the dispatcher parses all of these — measured):**

**A. Veo API parameters (sent to Google):**

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `prompt` | string | -- | Free text |
| `model` | string | `veo-3.1-generate-001` | Veo 3.1 only; non-3.1 values forced onto it with `[WARN]`; retired `-preview` IDs auto-redirected |
| `image` / `image_mime_type` | string | -- / `image/png` | First frame (base64, `gs://` or `s3://`) |
| `last_frame` / `last_frame_mime_type` | string | -- / `image/png` | Only with `image`; interpolation |
| `extend_video` / `extend_video_mime_type` | string | -- / `video/mp4` | Extend a previously Veo-generated video (~7 s) |
| `mask` / `mask_mime_type` / `mask_mode` | string | -- | `veo-2.0-generate-preview` only; `insert`, `remove`, `remove_static`, `outpaint` |
| `reference_images` | array | -- | Up to 3 ASSET or 1 STYLE: `[{image, reference_type, mime_type}]` |
| `aspect_ratio` | string | `16:9` | `16:9`, `9:16` |
| `resolution` | string | `1080p` | `720p`, `1080p` |
| `compression_quality` | string | `LOSSLESS` | `OPTIMIZED`, `LOSSLESS` — see cost warning below |
| `duration_seconds` | integer | `8` | `4`, `6`, `8` |
| `enhance_prompt` | boolean | `true` | Gemini prompt rewrite |
| `generate_audio` | boolean | `true` | Required true for Veo 3+ |
| `negative_prompt` | string | -- | -- |
| `sample_count` | integer | `1` | `1`-`4` |
| `person_generation` | string | `allow_adult` | `allow_all`, `allow_adult`, `dont_allow` |
| `seed` | integer | -- | uint32 |
| `fps` | integer | -- | SDK-only field |
| `resize_mode` | string | -- | `pad`, `crop` (image-to-video, REST-only) |
| `output_gcs_uri` / `storage_uri` / `pubsub_topic` | string | -- | GCS staging / Pub/Sub |

**B. Multi-segment orchestration (Lambda-side):** `total_duration`, `scenes[]`, `story_title`,
`character_description`, `maintain_consistency` (default `true`), `use_extend_api` (default `true`),
`max_retries` (default `3`), `transition_type` (`crossfade`/`dissolve`/`wipe`/`fade_to_black`/`cut`),
`transition_duration` (default `0.5`).

**C. FFmpeg post-processing (applied after generation):** `speed_factor` · `color_filter`
(`sepia`/`black_and_white`/`vintage`/`noir`/`cool`/`warm`) · `color_grading`
(`cinematic_teal_orange`/`warm_golden`/`cool_blue`/`desaturated`/`high_contrast`) · `output_fps` ·
`output_resolution` (`WxH`) · `crop_region` (`W:H:X:Y`) · `background_music` +
`background_music_volume` (0.3) · `voice_over_text`/`voice_over_language`(`en-US`)/`voice_over_voice`/
`voice_over_volume` (0.8) · `intro_image`/`intro_duration` (3.0) · `outro_image`/`outro_duration` (3.0) ·
`watermark`/`watermark_position`(`bottom_right`)/`watermark_opacity`(0.7)/`watermark_scale`(0.15) ·
`subtitle_text`/`subtitle_style`/`subtitle_font_size`(24)/`subtitle_position`(`bottom`) ·
`generate_thumbnail`/`thumbnail_timestamp`/`thumbnail_format`(`png`) · `style_preset` · `audio_style` ·
`language` (prompt modifiers).

**D. Output & operational:** `s3_bucket`, `output_path`, `output_format` (`mp4`), `callback_url`,
`callback_headers`, `metadata_tags`, `priority`, `timeout_seconds` (600), `action` (`long_video`).

**Cost/CDN warning:** with the current `LOSSLESS` default this endpoint produces ~25 MB per second of
video. Use 6.1 when small files matter and 1080p does not.

---

## 6.2b video-vertex-omni-flash

**Status:** ✅ **VERIFIED LIVE 2026-08-12** — deployed and proven the same day, **all four task families
through this route**: text_to_video (job `a3dabbc6-…`, 33.85 s; plus a direct-invoke at 33.18 s) ·
**image_to_video** from a CDN source image (job `61adfc34-…`, 45.47 s) · **reference_to_video** from an
avatar reference (job `3844e6ba-…`, 45.38 s) · **end_frame_bounded** two-image bounded generation (job
`bf36663e-…`, 46.1 s) · **dialogue with Turkish lines** (job `f3b4fa4b-…`, 6 s, $0.60816) whose AUDIO was
then verified: ffprobe 1280×720 24/1 + aac 48 kHz stereo, RMS −25.81 dBFS, AWS Transcribe (tr-TR,
diarization) returned **both lines word-for-word in order, 2 speakers** —
`scripts/verify_omni_flash_dialogue_audio.py`, control-proven (a wrong transcript makes it exit 1).
Refusal control through the route: a request naming `resolution` FAILED with the surface's measured
reason — the gate can fail, so it is evidence.

| | |
|---|---|
| **Endpoint** | `POST /create-video-vertex-omni-flash` |
| **Lambda** | `ssm-content-worker-video-vertex-omni-flash` |
| **Provider** | Google Vertex AI — Gemini Omni Flash (`gemini-omni-flash-preview`) on the Interactions surface (`locations/global`) |
| **Package** | ZIP (+ layer `ssm-content-vertex-layer:1`); container option in `video_vertex_omni_flash/Dockerfile` + `buildspecs/buildspec_video_omni_flash.yml` |
| **Auth** | Workload Identity Federation (keyless AWS→GCP) |
| **Delivery** | Interactions delivers to `gs://contentanalyticsplatform-video-staging/omni-flash-staging/{request_id}/`, then GCS→S3→CDN (`video/vertex-omni-flash/`) |
| **Output envelope** | 1280×720, 24 fps, h264 High, AAC stereo 48 kHz, SynthID — **fixed surface envelope (documented, not per-file measured)**; `resolution` is not a field on this surface at all |
| **Cost** | measured rate 5792 output tokens/s × $17.50/1M ⇒ ≈ **$0.101/s** (4 s = $0.40544; the `estimated_cost_usd` response field carries it per job) |
| **Retry posture** | **ONE generation attempt per invocation** — the measured failure rate on this surface is ~1 in 3; resubmit the job to retry deliberately (a hidden retry loop multiplies spend invisibly) |

> Wire-contract source: `docs/moviemaker/research/omni/2026-08-05-omni-flash-engine-manual.md` (+
> `…-omni-schema-archaeology.md`). Every constraint below is a MEASUREMENT, not a preference; requests
> violating one are refused with a 400 naming the measured reason. Offline contract controls:
> `scripts/test_omni_flash_worker_contracts.py` (36/36, pass + refuse sides).

### Parameters (all at the request-body root)

| Parameter | Type | Required | Default | Allowed Values / Notes |
|-----------|------|----------|---------|------------------------|
| `prompt` | string | **Yes** | -- | Free text. Negatives must be PROSE inside it (`negative_prompt` does not exist on this surface) |
| `model` | string | No | `gemini-omni-flash-preview` | Only this value — the closed-set worker identity; Veo models have `/create-video-vertex` and `/create-video-vertex-v3` |
| `duration_s` | integer | No | `8` | **3–10** (integer; `duration_seconds` accepted as alias). Longer values pass Google's schema and are unproven at generation — refused here |
| `task` | string | No | `text_to_video` | `text_to_video`, `image_to_video`, `reference_to_video`. `extend` is REFUSED (the model rejects it at generation — measured, $1.01) and `edit` is REFUSED (no completed generation) |
| `aspect_ratio` | string | No | `16:9` | `16:9`, `9:16` only (`21:9`, `1:1` rejected by the surface) |
| `images` | array\<string\> | For image/reference tasks | -- | `gs://`, `s3://` or `https://` sources — the worker fetches the bytes and sends them as inline base64 image parts (`{type:"image", mime_type, data}` — the canonical measured shape; a `gcs_uri`-nested image part was LIVE-MEASURED returning 400 `Unknown parameter 'image'` on 2026-08-12). `text_to_video` with images is refused (choose the task explicitly) |
| `end_frame_bounded` | boolean | No | `false` | Two-image bounded generation: EXACTLY two `images`, `[0]` = start frame, `[1]` = END frame (the order is the measured contract). `image_to_video` only |
| `speech_speakers` | array\<object\> | No | -- | Dialogue: EXACTLY 2 speakers, `[{speaker, voice, language?}]` (flat array — a wrapper object measured HTTP 400); `speaker` must match the prompt's ALL-CAPS speaker labels; `language` defaults `en-US`. **`voice` does NOT choose the voice on this surface — measured three ways 2026-08-12/13, see "Voice control" below.** Two acoustically distinct speakers DO come out; the model picks them |
| `system_instruction` | string | No | omitted | The strongest measured lever on this model (the vendor guide wrongly calls it unsupported). Omitted from the wire when empty |
| `thinking_level` | string | No | `high` | `low`, `high` (`minimal`/`medium` are schema-only, never observed working) |
| `temperature` | float | No | `0.30` | Production setting (suppresses invented motion; surface default is higher) |
| `top_p` | float | No | `0.85` | Production setting (surface default 0.95). snake_case on the wire — `topP` was REJECTED |
| `seed` | integer | No | -- | Accepted; reproducibility never proven on this surface |
| `safety_threshold` | string | No | -- | `block_low_and_above`, `block_medium_and_above`, `block_only_high`, `block_none`, `off` (lowercase). NONE bypasses the output-likeness filter |
| `labels` | object | No | `{}` | Free key/value; accepted by the surface and useful for per-job cost attribution |
| `s3_bucket` / `output_path` | string | No | env defaults | Standard output overrides |

**Fields REFUSED by name (measured absent on this surface — sending one returns 400 with the reason):**
`resolution`, `negative_prompt`, `candidate_count`, `sample_count`, `fps`, `person_generation`, and the
Veo-only fields `cameraControl`/`camera_control`, `referenceImages`, `enhancePrompt`/`enhance_prompt`,
`compressionQuality`/`compression_quality`.

**Response (COMPLETED):** `success`, `request_id`, `video_id`, `url`, `public_url`, `file_size_bytes`,
`gcs_uri` (the staging artefact), `interaction_id`, `model`, `task`, `duration_s`, `aspect_ratio`,
`estimated_cost_usd`, `output_envelope_documented`, `generation_time_seconds`.

**Error codes:** `INVALID_REQUEST` (contract violation, named reason) · `CONTENT_BLOCKED` (provider
safety layer; rewriting a prompt to dodge it is forbidden) · `GENERATION_FAILED` (no artefact — resubmit
deliberately).

**S3 Path:** `video/vertex-omni-flash/{omni_flash_...}.mp4`

### Voice control on this endpoint — what is measured, and the WORKING route

**The finding (three independent experiments, all pointing the same way).** The Interactions schema
was read from the archived discovery document (`GenaiVertexV1beta1SpeechConfig` = `{speaker, language,
voice}` — a **free string, NO enum, no nested `voiceConfig`**, which is exactly why an invalid voice
name is never rejected). Behaviour, measured by autocorrelation F0 per transcript-identified line
(`scripts/measure_omni_flash_voice_control.py`, four runs on the same Turkish exchange):

| run | request | AYSE | KEREM | separation |
|---|---|---|---|---|
| A | AYSE=Aoede, KEREM=Charon | 290.9 Hz | 123.1 Hz | 167.8 Hz |
| B | **names swapped** (AYSE=Charon, KEREM=Aoede) | 262.3 Hz | 124.0 Hz | 138.3 Hz |
| C | **same voice for both** (AYSE=Aoede, KEREM=Aoede) | 285.7 Hz | 130.1 Hz | 155.6 Hz |
| D | swapped **+ prose direction** ("AYSE speaks very deep, low, gravelly") | 231.9 Hz | 124.0 Hz | 107.9 Hz |

Reference scales, both measured rather than chosen: a single speaker split against itself gives a
**1.4 Hz** noise floor; two voices give the **167.8 Hz** class. So: swapping the names did not swap the
voices (B), naming ONE voice for BOTH speakers still produced two (C), and prose direction did not
invert the assignment either (D). **`voice` is accepted and does not select.** What every run DOES
prove: a dialogue shot delivers two acoustically separated speakers speaking every scripted word in
order (`scripts/verify_omni_flash_dialogue_audio.py`, control-proven).

**The working route when the voice must be CHOSEN — measured live 2026-08-13.** Use this endpoint for
picture (and its automatic two-voice dialogue when the exact voices do not matter), and
**`POST /create-voice-elevenlabs`** for named-voice lines, then mix. Proof on the same Turkish line:
`voice_name: "clyde"` → **112.7 Hz** vs `voice_name: "domi"` → **175.8 Hz** (**63.1 Hz apart** against
the 1.4 Hz noise floor) — the name selects the voice there. `POST /create-voice-gemini` exposes the
same 30-name Gemini voice set with schema validation, but it is currently **BLOCKED BY BILLING, not by
capability**: both attempts returned `fal.ai submit error 403 "User is locked. Reason: Exhausted
balance."` (measured 2026-08-13; the fal.ai balance is Berk's decision, so nothing was topped up).

**Still unverified:** whether Omni's own voice assignment is stable across shots (a cast-by-name
assumption on `voice` is unsafe), and the mechanism it uses to choose (speaker order vs inferred
gender was not isolated).

---

## 6.3 video-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-openai` |
| **Lambda** | `ssm-content-worker-video-openai` |
| **Provider** | OpenAI Sora |
| **API URL** | `https://api.openai.com/v1/videos` |
| **Package** | ZIP |
| **Prompt Limit** | API-defined |
| **Polling** | Status `completed` via `GET /v1/videos/{id}`, content via `GET /v1/videos/{id}/content` |

### Models

| Model Value | Notes |
|-------------|-------|
| `sora-2` | Standard (default) |
| `sora-2-pro` | Higher quality |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Free text |
| `model` | string | No | `sora-2` | `sora-2`, `sora-2-pro` |
| `size` | string | No | -- | `720x1280`, `1280x720`, `1024x1792`, `1792x1024`, `1080x1920`, `1920x1080` |
| `seconds` | string | No | -- | `"4"`, `"8"`, `"12"` |
| `duration` | string | No | -- | Alias for `seconds` |
| `n` | integer | No | -- | Number of videos to generate |
| `input_image` | string | No | -- | Input image URL for image-to-video |

---

## 6.4 video-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-luma` |
| **Lambda** | `ssm-content-worker-video-luma` |
| **Provider** | Luma Labs Dream Machine |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `ray-2` | Standard (default) |
| `ray-flash-2` | Flash / fast |
| `ray-3` | Ray 3 |
| `ray-3.14` | Ray 3.14 |

> **Common param:** `callback_url` (string, optional) is appended to ALL generation types.

---

#### Generation Type: `video` (default)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Free text |
| `model` | string | No | `ray-2` | `ray-2`, `ray-flash-2`, `ray-3`, `ray-3.14` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `resolution` | string | No | -- | `540p`, `720p`, `1080p`, `4k` |
| `duration` | string | No | -- | `5s`, `9s`, `18s` |
| `loop` | boolean | No | -- | Seamless loop |
| `concepts` | array | No | -- | Array of camera motion concept objects |
| `frame0_image_url` | string | No | -- | Start keyframe image URL |
| `frame0_generation_id` | string | No | -- | Start keyframe from previous generation |
| `frame1_image_url` | string | No | -- | End keyframe image URL |
| `frame1_generation_id` | string | No | -- | End keyframe from previous generation |
| `keyframes` | object | No | -- | Raw keyframes passthrough |

---

#### Generation Type: `modify_video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `mode` | string | No | `adhere_1` | `adhere_1`, `adhere_2`, `adhere_3`, `flex_1`, `flex_2`, `flex_3`, `reimagine_1`, `reimagine_2`, `reimagine_3` |
| `prompt` | string | No | -- | Free text |
| `first_frame_url` | string | No | -- | First frame image URL |

---

#### Generation Type: `reframe_video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `aspect_ratio` | string | No | -- | Target aspect ratio |
| `prompt` | string | No | -- | Free text |
| `grid_position_x` | integer | No | -- | Grid X position |
| `grid_position_y` | integer | No | -- | Grid Y position |
| `x_start` | integer | No | -- | Crop X start |
| `x_end` | integer | No | -- | Crop X end |
| `y_start` | integer | No | -- | Crop Y start |
| `y_end` | integer | No | -- | Crop Y end |
| `resized_width` | integer | No | -- | Output width |
| `resized_height` | integer | No | -- | Output height |

---

#### Generation Type: `upscale_video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `resolution` | string | No | -- | Target resolution |

---

#### Generation Type: `add_audio`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `prompt` | string | No | -- | Audio description |
| `negative_prompt` | string | No | -- | Free text |

---

## 6.5 video-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-kling` |
| **Lambda** | `ssm-content-worker-video-kling` |
| **Provider** | Kling AI |
| **Package** | ZIP |
| **Auth** | JWT (HS256) |

### Models

| Model Value | Notes |
|-------------|-------|
| `kling-v1` | Standard |
| `kling-v1-5` | Improved |
| `kling-v1-6` | Latest v1.x |
| `kling-v2-5` | V2.5 |
| `kling-v2-6` | V2.6 (default) |
| `kling-v2-1-master` | Master mode |
| `kling-o3` | Kling O3 |
| `kling-v3-0` | Kling V3.0 |

---

#### Generation Type: `text2video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `kling-v2-6` | See models above |
| `negative_prompt` | string | No | -- | Free text |
| `duration` | string | No | `5` | Duration in seconds |
| `aspect_ratio` | string | No | `16:9` | `16:9`, `9:16`, `1:1` |
| `mode` | string | No | -- | `std`, `pro` |
| `cfg_scale` | float | No | -- | Guidance scale |
| `seed` | integer | No | -- | -- |
| `camera_control` | object/string | No | -- | Camera movement config |
| `generate_audio` | boolean | No | -- | Enable audio in output (alias: `enable_audio`) |
| `shot_N_prompt` | string | No | -- | Multi-shot: `shot_1_prompt` ... `shot_6_prompt` |
| `shot_N_duration` | integer | No | -- | Multi-shot: `shot_1_duration` ... `shot_6_duration` |

---

#### Generation Type: `image2video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL (also accepts `image`) |
| `model` | string | No | `kling-v2-6` | See models above |
| `prompt` | string | No | -- | Free text |
| `negative_prompt` | string | No | -- | Free text |
| `duration` | string | No | `5` | Duration in seconds |
| `aspect_ratio` | string | No | `16:9` | `16:9`, `9:16`, `1:1` |
| `mode` | string | No | -- | `std`, `pro` |
| `cfg_scale` | float | No | -- | Guidance scale |
| `seed` | integer | No | -- | -- |
| `generate_audio` | boolean | No | -- | Enable audio in output (alias: `enable_audio`) |
| `image_tail_url` | string | No | -- | End frame image URL (also accepts `image_tail`) |

---

#### Generation Type: `extend`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_id` | string | **Yes** | -- | Source video ID to extend |
| `prompt` | string | No | -- | Free text |

---

#### Generation Type: `lip_sync`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_id` | string | **Yes** | -- | Source video ID |
| `text` | string | No | -- | Text to speak |
| `audio_url` | string | No | -- | Audio URL for lip sync |
| `voice_id` | string | No | -- | Voice ID for TTS |

---

## 6.6 video-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-runway` |
| **Lambda** | `ssm-content-worker-video-runway` |
| **Provider** | Runway ML |
| **Package** | ZIP |

### Models

| Model Value | Supported Types | Notes | Credits/sec |
|-------------|----------------|-------|-------------|
| `gen4.5` | T2V, I2V | Gen4.5 (default for T2V) | -- |
| `gen4_turbo` | I2V | Gen4 Turbo (default for I2V) | -- |
| `gen3a_turbo` | I2V | Gen3a Turbo | -- |
| `gen4_aleph` | V2V | Video-to-video only | -- |

> **Auto-detection:** `generation_type` is auto-detected from inputs. If `image_url` present → `image_to_video`. If `video_url` + V2V model → `video_to_video`. If prompt only → `text_to_video`.

---

#### Generation Type: `text_to_video` (T2V)

**Valid models:** `gen4.5`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `gen4.5` | `gen4.5` |
| `ratio` | string | No | `1280:720` | `1280:720`, `720:1280` |
| `duration` | integer | No | `5` | `2` - `10` |
| `seed` | integer | No | -- | -- |
| `exploreMode` | boolean | No | -- | Enable explore mode |

---

#### Generation Type: `image_to_video` (I2V)

**Valid models:** `gen4.5`, `gen4_turbo`, `gen3a_turbo`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | `gen4_turbo` | `gen4.5`, `gen4_turbo`, `gen3a_turbo` |
| `ratio` | string | No | `1280:720` | `1280:720`, `720:1280`, `1104:832`, `960:960`, `832:1104`, `1584:672` |
| `duration` | integer | No | `5` | `2` - `10` |
| `seed` | integer | No | -- | -- |
| `exploreMode` | boolean | No | -- | Enable explore mode |

---

#### Generation Type: `video_to_video` (V2V)

**Valid models:** `gen4_aleph`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_url` | string | **Yes** | -- | Source video URL |
| `prompt` | string | No | -- | Free text |
| `model` | string | No | `gen4_aleph` | `gen4_aleph` |
| `ratio` | string | No | -- | `1280:720`, `720:1280`, `1104:832`, `960:960`, `832:1104`, `1584:672`, `672:1584`, `848:480`, `480:848` |
| `duration` | integer | No | -- | `2` - `10` |
| `seed` | integer | No | -- | -- |
| `reference_image_url` | string | No | -- | Reference image URL |

---

## 6.7 video-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-fal` |
| **Lambda** | `ssm-content-worker-video-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **Package** | ZIP |

### Models

| Model Value | Provider | Type |
|-------------|----------|------|
| `fal-ai/veo3` | Google Veo 3 | T2V |
| `fal-ai/minimax/video-01-live` | MiniMax | T2V |
| `fal-ai/mochi-v1` | Mochi | T2V |
| `fal-ai/hunyuan-video` | Hunyuan | T2V |
| `fal-ai/veo2/image-to-video` | Google Veo 2 | I2V |
| `fal-ai/minimax/video-01-live/image-to-video` | MiniMax | I2V |
| `fal-ai/minimax/hailuo-02/standard/image-to-video` | MiniMax Hailuo | I2V |
| `fal-ai/luma-dream-machine/image-to-video` | Luma | I2V |
| `fal-ai/kling-video/v2/master/image-to-video` | Kling V2 | I2V |
| `fal-ai/kling-video/v1.6/pro/image-to-video` | Kling V1.6 | I2V |
| `fal-ai/pixverse/v4.5/image-to-video` | PixVerse | I2V |

---

#### Text-to-Video (T2V) Models

**Models:** `fal-ai/veo3`, `fal-ai/minimax/video-01-live`, `fal-ai/mochi-v1`, `fal-ai/hunyuan-video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/minimax/video-01-live` | See T2V models above |
| `aspect_ratio` | string | No | -- | Model-dependent |
| `duration` | string | No | -- | Model-dependent |
| `resolution` | string | No | -- | Model-dependent |
| `negative_prompt` | string | No | -- | Free text |
| `seed` | integer | No | -- | -- |

---

#### Image-to-Video (I2V) Models

**Models:** `fal-ai/veo2/image-to-video`, `fal-ai/minimax/video-01-live/image-to-video`, `fal-ai/minimax/hailuo-02/standard/image-to-video`, `fal-ai/luma-dream-machine/image-to-video`, `fal-ai/kling-video/v2/master/image-to-video`, `fal-ai/kling-video/v1.6/pro/image-to-video`, `fal-ai/pixverse/v4.5/image-to-video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Free text |
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | -- | See I2V models above |
| `aspect_ratio` | string | No | -- | Model-dependent |
| `duration` | string | No | -- | Model-dependent |
| `resolution` | string | No | -- | Model-dependent |
| `negative_prompt` | string | No | -- | Free text |
| `seed` | integer | No | -- | -- |

---

## 6.8 video-minimax

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-minimax` |
| **Lambda** | `ssm-content-worker-video-minimax` |
| **Provider** | MiniMax/Hailuo via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Type | Notes |
|-------------|------|-------|
| `fal-ai/minimax/video-01-live` | T2V | Default |
| `fal-ai/minimax/video-01-live/image-to-video` | I2V | Image-to-video |
| `fal-ai/minimax/hailuo-02/standard/image-to-video` | I2V | Hailuo 02 |

---

#### Model: `fal-ai/minimax/video-01-live` (T2V)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/minimax/video-01-live` | -- |
| `prompt_optimizer` | boolean | No | -- | Optimize prompt |
| `duration` | string/number | No | -- | Video duration |
| `aspect_ratio` | string | No | -- | Aspect ratio |
| `resolution` | string | No | -- | Output resolution |
| `negative_prompt` | string | No | -- | Elements to avoid |
| `seed` | integer | No | -- | Reproducibility seed |

---

#### Models: `fal-ai/minimax/video-01-live/image-to-video`, `fal-ai/minimax/hailuo-02/standard/image-to-video` (I2V)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `prompt` | string | No | -- | Free text |
| `model` | string | No | -- | See I2V models above |
| `prompt_optimizer` | boolean | No | -- | Optimize prompt |
| `duration` | string/number | No | -- | Video duration |
| `aspect_ratio` | string | No | -- | Aspect ratio |
| `resolution` | string | No | -- | Output resolution |
| `negative_prompt` | string | No | -- | Elements to avoid |
| `seed` | integer | No | -- | Reproducibility seed |
| `end_image_url` | string | No | -- | End frame image URL for image-to-video |

---

## 6.9 video-mochi

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-mochi` |
| **Lambda** | `ssm-content-worker-video-mochi` |
| **Provider** | Genmo Mochi via fal.ai |
| **Package** | ZIP |
| **Models:** `fal-ai/mochi-v1` (hardcoded, T2V only) |
| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `negative_prompt` | string | No | -- | Free text |
| `seed` | integer | No | -- | -- |
| `enable_prompt_expansion` | boolean | No | -- | -- |

---

## 6.10 video-pixverse

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-pixverse` |
| **Lambda** | `ssm-content-worker-video-pixverse` |
| **Provider** | PixVerse via fal.ai |
| **Package** | ZIP |
| **Models:** `fal-ai/pixverse/v4.5/image-to-video` (I2V), `fal-ai/pixverse/v4.5/text-to-video` (T2V, auto-selected when image_url absent) |
| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `image_url` | string | No | -- | Source image (Required for I2V; omit for T2V) |
| `resolution` | string | No | -- | Passthrough |
| `duration` | string | No | -- | Passthrough |
| `negative_prompt` | string | No | -- | Free text |
| `style` | string | No | -- | Passthrough |
| `seed` | integer | No | -- | -- |
| `camera_movement` | string | No | -- | Passthrough |

---

## 6.11 video-hunyuan

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-hunyuan` |
| **Lambda** | `ssm-content-worker-video-hunyuan` |
| **Provider** | Tencent Hunyuan via fal.ai |
| **Package** | ZIP |
| **Models:** `fal-ai/hunyuan-video` (hardcoded, T2V only) |
| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `seed` | integer | No | -- | -- |
| `pro_mode` | boolean | No | -- | Enhanced quality |
| `aspect_ratio` | string | No | -- | Passthrough |
| `resolution` | string | No | -- | Passthrough |
| `num_frames` | integer | No | -- | Frame count |
| `enable_safety_checker` | boolean | No | -- | -- |

---

## 6.12 video-heygen

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-heygen` |
| **Lambda** | `ssm-content-worker-video-heygen` |
| **Provider** | HeyGen via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/heygen/v2/video-agent` | Auto video generation (default) |
| `fal-ai/heygen/video-avatars` | Avatar-based talking head |

---

#### Model: `fal-ai/heygen/v2/video-agent` (Video Agent)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Text prompt describing the video |
| `model` | string | No | `fal-ai/heygen/v2/video-agent` | -- |
| `aspect_ratio` | string | No | -- | Passthrough |
| `background_url` | string | No | -- | Custom background image URL |

---

#### Model: `fal-ai/heygen/video-avatars` (Avatar Video)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `script` | string | **Yes** | -- | Avatar speech script |
| `model` | string | **Yes** | -- | `fal-ai/heygen/video-avatars` |
| `avatar_id` | string | No | -- | Pre-built avatar ID |
| `avatar_image_url` | string | No | -- | Custom avatar photo URL |
| `voice_id` | string | No | -- | Voice selection ID |
| `audio_url` | string | No | -- | Custom audio URL |
| `language` | string | No | -- | Language code |
| `aspect_ratio` | string | No | -- | Passthrough |
| `background_url` | string | No | -- | Custom background image URL |
| `emotion` | string | No | -- | Avatar emotion expression |
| `speed` | float | No | -- | Speech speed multiplier |

---

## 6.13 video-ltx

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-video-ltx` |
| **Lambda** | `ssm-content-worker-video-ltx` |
| **Provider** | Lightricks LTX via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/ltx-video/v0.9.1` | Standard (cinematic, native audio, 60fps) |
| `fal-ai/ltx-video/v0.9.1/distilled` | Distilled (fast, <30s gen time) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Free text |
| `model` | string | No | `fal-ai/ltx-video/v0.9.1` | See above |
| `image_url` | string | No | -- | I2V source |
| `duration` | varies | No | -- | Up to 10s |
| `fps` | integer | No | -- | Up to 60 |
| `aspect_ratio` | string | No | -- | Passthrough |
| `negative_prompt` | string | No | -- | Free text |
| `seed` | integer | No | -- | -- |
| `num_inference_steps` | integer | No | -- | -- |
| `guidance_scale` | float | No | -- | -- |
| `enable_audio` | boolean | No | -- | Enable native audio generation |
| `audio_prompt` | string | No | -- | Audio generation prompt |

---

# 7. ANIMATION (6 Provider)
> Animation handler'lar video handler'lara benzer ama game asset animasyonu (sprite sheet, GIF, loop) odakli. S3 prefix: `animations/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | Vertex AI — Gemini image | `animation-vertex` | `gemini-3.1-flash-image` (default), `gemini-3-pro-image`, `gemini-2.5-flash-image`; legacy `imagen-4`, `imagen-4-fast`, `imagen-4-ultra`, `imagen-3`, `imagen-3-fast` aliased |
| 2 | Luma Dream Machine | `animation-luma` | `ray-2`, `ray-flash-2` |
| 3 | Kling AI | `animation-kling` | `kling-v2-6`, `kling-v2-5-turbo`, `kling-v2-1-master`, `kling-v1-6`, `kling-v1-5`, `kling-v1` |
| 4 | Runway ML | `animation-runway` | `gen4.5`, `gen4_turbo`, `gen3a_turbo`, `gen4_aleph` |
| 5 | fal.ai Gateway | `animation-fal` | T2A: `fal-ai/veo3`, `fal-ai/minimax/video-01-live`, `fal-ai/mochi-v1`, `fal-ai/hunyuan-video` / I2A: `fal-ai/veo2/image-to-video`, `fal-ai/minimax/video-01-live/image-to-video`, `fal-ai/kling-video/v2/master/image-to-video` + 4 more |
| 6 | MiniMax | `animation-minimax` | MiniMax video models (Bkz. video-minimax) |

## 7.1 animation-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-animation-vertex` |
| **Lambda** | `ssm-content-worker-animation-vertex` |
| **Provider** | Google Vertex AI — Gemini image family, frame-by-frame --> GIF/APNG/WebP/sprite sheet (Imagen retired) |
| **Package** | Docker (ECR) |

### Models

| Model Value | Vertex Model ID |
|-------------|----------------|
| `gemini-3.1-flash-image` | `gemini-3.1-flash-image` (default) |
| `gemini-3-pro-image` | `gemini-3-pro-image` |
| `gemini-2.5-flash-image` | `gemini-2.5-flash-image` (retires 2026-10-02) |
| `imagen-4` / `imagen-4-fast` *(legacy aliases)* | → `gemini-3.1-flash-image` |
| `imagen-4-ultra` *(legacy alias)* | → `gemini-3-pro-image` |
| `imagen-3` / `imagen-3-fast` *(legacy aliases)* | → `gemini-3.1-flash-image` |

> **Migration note (2026-08-04):** Imagen retired on Vertex AI — legacy `imagen-*` values are
> transparently mapped to the Gemini image family.

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `imagen-4` | `imagen-4`, `imagen-4-fast`, `imagen-4-ultra`, `imagen-3`, `imagen-3-fast` (user-selectable) |
| `animation_type` | string | No | `idle` | `idle`, `walk`, `run`, `attack`, `jump`, `death`, `cast`, `hit`, `spin`, `bounce`, `pulse`, `fade` |
| `art_style` | string | No | `cartoon` | `pixel_art`, `cartoon`, `anime`, `chibi`, `realistic`, `flat`, `sketch` |
| `frame_count` | integer | No | Per animation_type | -- |
| `frame_duration` | integer | No | Per animation_type | ms per frame |
| `output_format` | string | No | `gif` | `gif`, `apng`, `webp`, `sprite_sheet` |
| `width` | integer | No | `256` | -- |
| `height` | integer | No | `256` | -- |
| `loop` | boolean | No | Per animation_type | -- |
| `character_bible` | object | No | -- | `{name, type, gender, hair_color, outfit}` |
| `count` | integer | No | `1` | Number of animation variants |
| `negative_prompt` | string | No | Per art_style | Folded into the prompt text |
| `seed` | integer | No | -- | -- |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` (per-frame generation size) |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | -- | Accepted but ignored — the delivered file is governed by `output_format` (frames are composited) |
| `compression_quality` | integer | No | -- | Accepted but ignored (see `output_mime_type`) |
| `add_watermark` | boolean | No | -- | Accepted but ignored (SynthID always on) |
| `safety_setting` | string | No | -- | Accepted but ignored (no Gemini equivalent) |
| `enhance_prompt` | boolean | No | -- | Accepted but ignored (no Gemini equivalent) |

---

## 7.2 animation-luma

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-animation-luma` |
| **Lambda** | `ssm-content-worker-animation-luma` |
| **Provider** | Luma Labs Dream Machine |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `ray-2` | Standard (default) |
| `ray-flash-2` | Flash / fast |
| `ray-3` | Ray 3 |
| `ray-3.14` | Ray 3.14 |

> **Common param:** `callback_url` (string, optional) is appended to ALL generation types.

---

#### Generation Type: `video` (default)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Free text |
| `model` | string | No | `ray-2` | `ray-2`, `ray-flash-2`, `ray-3`, `ray-3.14` |
| `aspect_ratio` | string | No | -- | `1:1`, `3:4`, `4:3`, `9:16`, `16:9`, `9:21`, `21:9` |
| `resolution` | string | No | -- | `540p`, `720p`, `1080p`, `4k` |
| `duration` | string | No | -- | `5s`, `9s`, `18s` |
| `loop` | boolean | No | -- | Seamless loop |
| `concepts` | array | No | -- | Array of camera motion concept objects |
| `frame0_image_url` | string | No | -- | Start keyframe image URL |
| `frame0_generation_id` | string | No | -- | Start keyframe from previous generation |
| `frame1_image_url` | string | No | -- | End keyframe image URL |
| `frame1_generation_id` | string | No | -- | End keyframe from previous generation |
| `keyframes` | object | No | -- | Raw keyframes passthrough |

---

#### Generation Type: `modify_video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `mode` | string | No | `adhere_1` | `adhere_1`, `adhere_2`, `adhere_3`, `flex_1`, `flex_2`, `flex_3`, `reimagine_1`, `reimagine_2`, `reimagine_3` |
| `prompt` | string | No | -- | Free text |
| `first_frame_url` | string | No | -- | First frame image URL |

---

#### Generation Type: `reframe_video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `aspect_ratio` | string | No | -- | Target aspect ratio |
| `prompt` | string | No | -- | Free text |
| `grid_position_x` | integer | No | -- | Grid X position |
| `grid_position_y` | integer | No | -- | Grid Y position |
| `x_start` | integer | No | -- | Crop X start |
| `x_end` | integer | No | -- | Crop X end |
| `y_start` | integer | No | -- | Crop Y start |
| `y_end` | integer | No | -- | Crop Y end |
| `resized_width` | integer | No | -- | Output width |
| `resized_height` | integer | No | -- | Output height |

---

#### Generation Type: `upscale_video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `resolution` | string | No | -- | Target resolution |

---

#### Generation Type: `add_audio`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `media_url` | string | **Yes** | -- | Source video URL |
| `prompt` | string | No | -- | Audio description |
| `negative_prompt` | string | No | -- | Free text |

---

## 7.3 animation-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-animation-kling` |
| **Lambda** | `ssm-content-worker-animation-kling` |
| **Provider** | Kling AI |
| **Package** | ZIP |
| **Auth** | JWT (HS256) |

### Models

| Model Value | Notes |
|-------------|-------|
| `kling-v1` | Standard |
| `kling-v1-5` | Improved |
| `kling-v1-6` | Latest v1.x |
| `kling-v2-5` | V2.5 |
| `kling-v2-6` | V2.6 (default) |
| `kling-v2-1-master` | Master mode |
| `kling-o3` | Kling O3 |
| `kling-v3-0` | Kling V3.0 |

---

#### Generation Type: `text2video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `kling-v2-6` | See models above |
| `negative_prompt` | string | No | -- | Free text |
| `duration` | string | No | `5` | Duration in seconds |
| `aspect_ratio` | string | No | `16:9` | `16:9`, `9:16`, `1:1` |
| `mode` | string | No | -- | `std`, `pro` |
| `cfg_scale` | float | No | -- | Guidance scale |
| `seed` | integer | No | -- | -- |
| `camera_control` | object/string | No | -- | Camera movement config |
| `generate_audio` | boolean | No | -- | Enable audio in output (alias: `enable_audio`) |
| `shot_N_prompt` | string | No | -- | Multi-shot: `shot_1_prompt` ... `shot_6_prompt` |
| `shot_N_duration` | integer | No | -- | Multi-shot: `shot_1_duration` ... `shot_6_duration` |

---

#### Generation Type: `image2video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL (also accepts `image`) |
| `model` | string | No | `kling-v2-6` | See models above |
| `prompt` | string | No | -- | Free text |
| `negative_prompt` | string | No | -- | Free text |
| `duration` | string | No | `5` | Duration in seconds |
| `aspect_ratio` | string | No | `16:9` | `16:9`, `9:16`, `1:1` |
| `mode` | string | No | -- | `std`, `pro` |
| `cfg_scale` | float | No | -- | Guidance scale |
| `seed` | integer | No | -- | -- |
| `generate_audio` | boolean | No | -- | Enable audio in output (alias: `enable_audio`) |
| `image_tail_url` | string | No | -- | End frame image URL (also accepts `image_tail`) |

---

#### Generation Type: `extend`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_id` | string | **Yes** | -- | Source video ID to extend |
| `prompt` | string | No | -- | Free text |

---

#### Generation Type: `lip_sync`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_id` | string | **Yes** | -- | Source video ID |
| `text` | string | No | -- | Text to speak |
| `audio_url` | string | No | -- | Audio URL for lip sync |
| `voice_id` | string | No | -- | Voice ID for TTS |

---

## 7.4 animation-runway

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-animation-runway` |
| **Lambda** | `ssm-content-worker-animation-runway` |
| **Provider** | Runway ML |
| **Package** | ZIP |

### Models

| Model Value | Supported Types | Notes | Credits/sec |
|-------------|----------------|-------|-------------|
| `gen4.5` | T2V, I2V | Gen4.5 (default for T2V) | -- |
| `gen4_turbo` | I2V | Gen4 Turbo (default for I2V) | -- |
| `gen3a_turbo` | I2V | Gen3a Turbo | -- |
| `gen4_aleph` | V2V | Video-to-video only | -- |

> **Auto-detection:** `generation_type` is auto-detected from inputs. If `image_url` present → `image_to_video`. If `video_url` + V2V model → `video_to_video`. If prompt only → `text_to_video`.

---

#### Generation Type: `text_to_video` (T2V)

**Valid models:** `gen4.5`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `gen4.5` | `gen4.5` |
| `ratio` | string | No | `1280:720` | `1280:720`, `720:1280` |
| `duration` | integer | No | `5` | `2` - `10` |
| `seed` | integer | No | -- | -- |
| `exploreMode` | boolean | No | -- | Enable explore mode |

---

#### Generation Type: `image_to_video` (I2V)

**Valid models:** `gen4.5`, `gen4_turbo`, `gen3a_turbo`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | `gen4_turbo` | `gen4.5`, `gen4_turbo`, `gen3a_turbo` |
| `ratio` | string | No | `1280:720` | `1280:720`, `720:1280`, `1104:832`, `960:960`, `832:1104`, `1584:672` |
| `duration` | integer | No | `5` | `2` - `10` |
| `seed` | integer | No | -- | -- |
| `exploreMode` | boolean | No | -- | Enable explore mode |

---

#### Generation Type: `video_to_video` (V2V)

**Valid models:** `gen4_aleph`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_url` | string | **Yes** | -- | Source video URL |
| `prompt` | string | No | -- | Free text |
| `model` | string | No | `gen4_aleph` | `gen4_aleph` |
| `ratio` | string | No | -- | `1280:720`, `720:1280`, `1104:832`, `960:960`, `832:1104`, `1584:672`, `672:1584`, `848:480`, `480:848` |
| `duration` | integer | No | -- | `2` - `10` |
| `seed` | integer | No | -- | -- |
| `reference_image_url` | string | No | -- | Reference image URL |

---

## 7.5 animation-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-animation-fal` |
| **Lambda** | `ssm-content-worker-animation-fal` |
| **Provider** | fal.ai Multi-Model Gateway |
| **Package** | ZIP |

### Models

| Model Value | Provider | Type |
|-------------|----------|------|
| `fal-ai/veo3` | Google Veo 3 | T2V |
| `fal-ai/minimax/video-01-live` | MiniMax | T2V |
| `fal-ai/mochi-v1` | Mochi | T2V |
| `fal-ai/hunyuan-video` | Hunyuan | T2V |
| `fal-ai/veo2/image-to-video` | Google Veo 2 | I2V |
| `fal-ai/minimax/video-01-live/image-to-video` | MiniMax | I2V |
| `fal-ai/minimax/hailuo-02/standard/image-to-video` | MiniMax Hailuo | I2V |
| `fal-ai/luma-dream-machine/image-to-video` | Luma | I2V |
| `fal-ai/kling-video/v2/master/image-to-video` | Kling V2 | I2V |
| `fal-ai/kling-video/v1.6/pro/image-to-video` | Kling V1.6 | I2V |
| `fal-ai/pixverse/v4.5/image-to-video` | PixVerse | I2V |

---

#### Text-to-Video (T2V) Models

**Models:** `fal-ai/veo3`, `fal-ai/minimax/video-01-live`, `fal-ai/mochi-v1`, `fal-ai/hunyuan-video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/minimax/video-01-live` | See T2V models above |
| `aspect_ratio` | string | No | -- | Model-dependent |
| `duration` | string | No | -- | Model-dependent |
| `resolution` | string | No | -- | Model-dependent |
| `negative_prompt` | string | No | -- | Free text |
| `seed` | integer | No | -- | -- |

---

#### Image-to-Video (I2V) Models

**Models:** `fal-ai/veo2/image-to-video`, `fal-ai/minimax/video-01-live/image-to-video`, `fal-ai/minimax/hailuo-02/standard/image-to-video`, `fal-ai/luma-dream-machine/image-to-video`, `fal-ai/kling-video/v2/master/image-to-video`, `fal-ai/kling-video/v1.6/pro/image-to-video`, `fal-ai/pixverse/v4.5/image-to-video`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | No | -- | Free text |
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | -- | See I2V models above |
| `aspect_ratio` | string | No | -- | Model-dependent |
| `duration` | string | No | -- | Model-dependent |
| `resolution` | string | No | -- | Model-dependent |
| `negative_prompt` | string | No | -- | Free text |
| `seed` | integer | No | -- | -- |

---

## 7.6 animation-minimax

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-animation-minimax` |
| **Lambda** | `ssm-content-worker-animation-minimax` |
| **Provider** | MiniMax/Hailuo via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Type | Notes |
|-------------|------|-------|
| `fal-ai/minimax/video-01-live` | T2V | Default |
| `fal-ai/minimax/video-01-live/image-to-video` | I2V | Image-to-video |
| `fal-ai/minimax/hailuo-02/standard/image-to-video` | I2V | Hailuo 02 |

---

#### Model: `fal-ai/minimax/video-01-live` (T2V)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/minimax/video-01-live` | -- |
| `prompt_optimizer` | boolean | No | -- | Optimize prompt |
| `duration` | string/number | No | -- | Video duration |
| `aspect_ratio` | string | No | -- | Aspect ratio |
| `resolution` | string | No | -- | Output resolution |
| `negative_prompt` | string | No | -- | Elements to avoid |
| `seed` | integer | No | -- | Reproducibility seed |

---

#### Models: `fal-ai/minimax/video-01-live/image-to-video`, `fal-ai/minimax/hailuo-02/standard/image-to-video` (I2V)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `prompt` | string | No | -- | Free text |
| `model` | string | No | -- | See I2V models above |
| `prompt_optimizer` | boolean | No | -- | Optimize prompt |
| `duration` | string/number | No | -- | Video duration |
| `aspect_ratio` | string | No | -- | Aspect ratio |
| `resolution` | string | No | -- | Output resolution |
| `negative_prompt` | string | No | -- | Elements to avoid |
| `seed` | integer | No | -- | Reproducibility seed |

---

# 8. VOICE (8 Provider)
> S3 prefix: `voices/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Models | Output |
|---|----------|----------|--------|--------|
| 1 | ElevenLabs | `voice-elevenlabs` | `eleven_v3`, `eleven_v3_conversational`, `eleven_flash_v2_5`, `eleven_multilingual_v2`, `eleven_turbo_v2_5`, `eleven_turbo_v2`, `eleven_monolingual_v1`, `eleven_multilingual_v1` | mp3/wav |
| 2 | Gemini TTS | `voice-gemini` | `gemini-2.5-flash-tts`, `gemini-2.5-pro-tts` | mp3/wav/ogg |
| 3 | MiniMax Speech-02 HD | `voice-minimax` | Single model (Speech-02 HD) | mp3/pcm/flac |
| 4 | xAI TTS | `voice-xai` | Single model (xAI v1) | mp3 |
| 5 | Dia TTS | `voice-dia` | Single model (Dia) | mp3 |
| 6 | F5-TTS | `voice-f5` | `F5-TTS`, `E2-TTS` | wav |
| 7 | Chatterbox | `voice-chatterbox` | `fal-ai/chatterbox/text-to-speech`, `/turbo`, `/multilingual` | wav |
| 8 | Inworld | `voice-inworld` | Single model (TTS-1.5 Max) | wav |

## 8.1 voice-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-elevenlabs` |
| **Lambda** | `ssm-content-worker-voice-elevenlabs` |
| **Provider** | ElevenLabs (Direct API) |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `eleven_v3` | Latest, lowest error rate |
| `eleven_v3_conversational` | Real-time dialogue, emotion-aware |
| `eleven_flash_v2_5` | Flash v2.5, ultra-low latency |
| `eleven_multilingual_v2` | 29 languages, best quality |
| `eleven_turbo_v2_5` | Fast, good quality (default) |
| `eleven_turbo_v2` | Fast, English focused |
| `eleven_monolingual_v1` | Legacy English |
| `eleven_multilingual_v1` | Legacy multilingual |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Max ~5,000 chars |
| `model` | string | No | `eleven_turbo_v2_5` | See models above |
| `voice_id` | string | No | `21m00Tcm4TlvDq8ikWAM` (Rachel) | Any ElevenLabs voice ID |
| `voice_name` | string | No | -- | `rachel`, `drew`, `clyde`, `paul`, `domi`, `dave`, `fin`, `sarah`, `antoni`, `thomas`, `charlie`, `emily`, `elli`, `callum`, `patrick`, `harry`, `liam`, `dorothy`, `josh`, `arnold`, `charlotte`, `matilda`, `matthew`, `james`, `joseph`, `jeremy`, `michael`, `ethan`, `gigi`, `freya`, `grace`, `daniel`, `serena`, `adam`, `nicole`, `jessie`, `ryan`, `sam`, `glinda`, `mimi` |
| `preset` | string | No | -- | `hero_male_default`, `hero_female_default`, `villain_male_default`, `narrator_calm`, `narrator_dramatic`, `announcer`, `tutorial`, `child_character`, `elder_wise`, `merchant`, `mysterious` |
| `character` | string | No | -- | `hero_male`, `villain_male`, `narrator_male`, `wizard_male`, `warrior_male`, `merchant_male`, `elder_male`, `child_male`, `robot_male`, `hero_female`, `villain_female`, `narrator_female`, `witch_female`, `warrior_female`, `merchant_female`, `elder_female`, `child_female`, `robot_female`, `monster`, `creature`, `ghost`, `demon`, `angel`, `announcer`, `tutorial`, `system` |
| `emotion` | string | No | -- | `neutral`, `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `excited`, `calm`, `serious`, `playful`, `mysterious`, `dramatic`, `whisper`, `shout` |
| `speed` | string | No | -- | `very_slow`, `slow`, `normal`, `fast`, `very_fast` |
| `stability` | float | No | `0.5` | `0.0` - `1.0` |
| `similarity_boost` | float | No | `0.75` | `0.0` - `1.0` |
| `style` | float | No | `0.0` | `0.0` - `1.0` |
| `use_speaker_boost` | boolean | No | `true` | -- |
| `output_format` | string | No | `mp3_44100_128` | `mp3_44100_128`, `mp3_44100_192`, `pcm_16000`, `pcm_22050`, `pcm_24000`, `pcm_44100`, `ulaw_8000` |
| `language` | string | No | `en` | `en`, `tr`, `es`, `fr`, `de`, `it`, `pt`, `pl`, `ru`, `nl`, `ja`, `zh`, `ko`, `ar`, `hi` |
| `voice_speed` | float | No | -- | `0.7` - `1.2` |
| `seed` | integer | No | -- | `0` - `4294967295` |
| `previous_text` | string | No | -- | Continuity context |
| `next_text` | string | No | -- | Continuity context |
| `apply_text_normalization` | string | No | -- | `auto`, `on`, `off` |
| `language_code` | string | No | -- | BCP-47 language code |
| `previous_request_ids` | array | No | -- | Continuity: previous request IDs |
| `next_request_ids` | array | No | -- | Continuity: next request IDs |
| `pronunciation_dictionary_ids` | array | No | -- | Custom pronunciation dict IDs |

---

## 8.2 voice-gemini

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-gemini` |
| **Lambda** | `ssm-content-worker-voice-gemini` |
| **Provider** | Google Gemini TTS via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **50,000 chars** |

### Models

| Model Value | Notes |
|-------------|-------|
| `gemini-2.5-flash-tts` | Fast (default) |
| `gemini-2.5-pro-tts` | Higher quality |

### Voices
`Achernar`, `Achird`, `Algenib`, `Algieba`, `Alnilam`, `Aoede`, `Autonoe`, `Callirrhoe`, `Charon`, `Despina`, `Enceladus`, `Erinome`, `Fenrir`, `Gacrux`, `Iapetus`, `Kore` (default), `Laomedeia`, `Leda`, `Orus`, `Pulcherrima`, `Puck`, `Rasalgethi`, `Sadachbia`, `Sadaltager`, `Schedar`, `Sulafat`, `Umbriel`, `Vindemiatrix`, `Zephyr`, `Zubenelgenubi`

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` / `text` | string | **Yes** | -- | Max 50,000 chars |
| `model` | string | No | `gemini-2.5-flash-tts` | See models |
| `voice` | string | No | `Kore` | 30 voices (see above) |
| `style_instructions` | string | No | -- | Freeform style guide |
| `language_code` | string | No | -- | Language code |
| `temperature` | float | No | -- | `0.0` - `2.0` |
| `output_format` | string | No | `mp3` | `mp3`, `wav`, `ogg_opus` |
| `speakers` | array | No | -- | Multi-speaker config |

---

## 8.3 voice-minimax

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-minimax` |
| **Lambda** | `ssm-content-worker-voice-minimax` |
| **Provider** | MiniMax Speech-02 HD via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **5,000 chars** |

### Voices
`Wise_Woman` (default), `Friendly_Person`, `Inspirational_girl`, `Deep_Voice_Man`, `Calm_Woman`, `Casual_Guy`, `Lively_Girl`, `Patient_Man`, `Young_Knight`, `Determined_Man`, `Lovely_Girl`, `Decent_Boy`, `Imposing_Manner`, `Elegant_Man`, `Abbess`, `Sweet_Girl_2`, `Exuberant_Girl`

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Max 5,000 chars |
| `voice_id` | string | No | `Wise_Woman` | 17 built-in voices (see above) |
| `custom_voice_id` | string | No | -- | Overrides voice_id |
| `speed` | float | No | `1.0` | `0.5` - `2.0` |
| `vol` | float | No | `1.0` | `0` - `10` |
| `pitch` | integer | No | -- | `-12` - `12` |
| `emotion` | string | No | -- | `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, `neutral` |
| `sample_rate` | string | No | `32000` | `8000`, `16000`, `22050`, `24000`, `32000`, `44100` |
| `bitrate` | string | No | `128000` | `32000`, `64000`, `128000`, `256000` |
| `format` | string | No | `mp3` | `mp3`, `pcm`, `flac` |
| `language_boost` | string | No | -- | Language hint |
| `english_normalization` | boolean | No | -- | -- |

---

## 8.4 voice-xai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-xai` |
| **Lambda** | `ssm-content-worker-voice-xai` |
| **Provider** | xAI TTS via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **15,000 chars** |

### Voices & Languages
**Voices:** `eve` (default), `ara`, `rex`, `sal`, `leo`

**Languages:** `auto` (default), `en`, `zh`, `fr`, `de`, `hi`, `id`, `it`, `ja`, `ko`, `pt-BR`, `pt-PT`, `ru`, `es-MX`, `es-ES`, `tr`, `vi`, `bn`, `ar-EG`, `ar-SA`, `ar-AE`

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` / `prompt` | string | **Yes** | -- | Max 15,000 chars |
| `voice` | string | No | `eve` | 5 voices |
| `language` | string | No | `auto` | 21 languages |
| `output_format` | string | No | -- | Passthrough |

---

## 8.5 voice-dia

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-dia` |
| **Lambda** | `ssm-content-worker-voice-dia` |
| **Provider** | Dia TTS via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Free text with `[S1]`/`[S2]` speaker tags |
| `speed` | float | No | -- | Speech speed multiplier |
| `voice_preset` | string | No | -- | Voice preset identifier |
| `seed` | integer | No | -- | Reproducibility seed |

**Multi-speaker format:** `[S1] Hello! [S2] Hi there!`

**Nonverbal cues:** `(laughs)`, `(clears throat)`, `(sighs)`, etc.

**Output:** mp3

---

## 8.6 voice-f5

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-f5` |
| **Lambda** | `ssm-content-worker-voice-f5` |
| **Provider** | F5-TTS (voice cloning) via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `gen_text` | string | **Yes** | -- | Text to speak |
| `ref_audio_url` | string | **Yes** | -- | Reference audio URL (voice to clone) |
| `model_type` | string | **Yes** | -- | `F5-TTS`, `E2-TTS` |
| `ref_text` | string | No | -- | Reference audio transcript |
| `remove_silence` | boolean | No | `true` | -- |

**Output:** wav

---

## 8.7 voice-chatterbox

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-chatterbox` |
| **Lambda** | `ssm-content-worker-voice-chatterbox` |
| **Provider** | Chatterbox TTS via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/chatterbox/text-to-speech` | Standard (default) |
| `fal-ai/chatterbox/text-to-speech/turbo` | Fast |
| `fal-ai/chatterbox/text-to-speech/multilingual` | Multi-language |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Free text |
| `model` | string | No | `fal-ai/chatterbox/text-to-speech` | See models |
| `audio_url` | string | No | -- | Voice clone reference |
| `exaggeration` | float | No | `0.25` | -- |
| `temperature` | float | No | `0.7` | -- |
| `cfg` | float | No | `0.5` | -- |
| `seed` | integer | No | -- | -- |

**Output:** wav

---

## 8.8 voice-inworld

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voice-inworld` |
| **Lambda** | `ssm-content-worker-voice-inworld` |
| **Provider** | Inworld TTS-1.5 Max via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **5,000 chars** |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` / `prompt` | string | **Yes** | -- | Max 5,000 chars |
| `voice` | string | No | `Craig (en)` | 80+ game character voices |
| `sample_rate_hertz` | integer | No | `48000` | `8000`, `16000`, `24000`, `32000`, `40000`, `48000` |

**Output:** wav. Purpose-built for game character voices.

---

# 9. MUSIC (6 Provider)
> S3 prefix: `music/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Models | Max Duration | Output |
|---|----------|----------|--------|-------------|--------|
| 1 | ElevenLabs Music | `music-elevenlabs` | `music_v1` | 10 min (600s) | mp3 |
| 2 | MiniMax Music | `music-minimax` | `fal-ai/minimax-music` | -- | mp3 |
| 3 | Stable Audio | `music-stable` | `fal-ai/stable-audio` | 47s | wav |
| 4 | ACE-Step | `music-ace` | `fal-ai/ace-step` | 240s (4 min) | wav |
| 5 | Beatoven | `music-beatoven` | `beatoven/music-generation` | 150s | wav |
| 6 | Stability (alias) | `music-stability` | Stability AI Music | -- | -- |

## 9.1 music-elevenlabs

**Status:** ⏳ Will Be Deployed Soon (API key missing music_generation permission)

| | |
|---|---|
| **Endpoint** | `POST /create-music-elevenlabs` |
| **Lambda** | `ssm-content-worker-music-elevenlabs` |
| **Provider** | ElevenLabs Music (Direct API, streaming) |
| **Package** | ZIP |
| **Prompt Limit** | **5,000 chars** |

### Models

| Model Value | Notes |
|-------------|-------|
| `music_v1` | Only model (default) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes*** | -- | Max 5,000 chars. Mutually exclusive with `composition_plan` |
| `composition_plan` | object | **Yes*** | -- | Structured composition. Mutually exclusive with `prompt` |
| `model_id` | string | No | `music_v1` | `music_v1` |
| `music_length_ms` | integer | No | -- | `3000` - `600000` (max 10 min). Prompt mode only |
| `force_instrumental` | boolean | No | -- | Prompt mode only |
| `seed` | integer | No | -- | Composition plan mode only |
| `store_for_inpainting` | boolean | No | -- | -- |
| `output_format` | string | No | `mp3_44100_128` | ElevenLabs format strings |

**Two modes:** Simple `prompt` OR structured `composition_plan` (mutually exclusive).

---

## 9.2 music-minimax

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-music-minimax` |
| **Lambda** | `ssm-content-worker-music-minimax` |
| **Provider** | MiniMax Music via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **600 chars** (lyrics with formatting) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 600 chars (lyrics) |
| `reference_audio_url` | string | **Yes** | -- | .wav/.mp3 URL, must be >15s |

**Output:** mp3. Both parameters required.

---

## 9.3 music-stable

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-music-stable` |
| **Lambda** | `ssm-content-worker-music-stable` |
| **Provider** | Stable Audio Open via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **5,000 chars** |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 5,000 chars |
| `seconds_total` | integer | No | -- | `1` - `47` |
| `seconds_start` | integer | No | -- | Start offset (seconds) |
| `steps` | integer | No | -- | `1` - `1000` (diffusion steps) |

**Output:** wav. Max 47 seconds.

---

## 9.4 music-ace

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-music-ace` |
| **Lambda** | `ssm-content-worker-music-ace` |
| **Provider** | ACE-Step via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `tags` | string | **Yes** | -- | Comma-separated genre tags (e.g. `"lofi, hiphop, trap"`) |
| `lyrics` | string | No | -- | Structured lyrics with `[verse]`, `[chorus]`, `[bridge]`, `[inst]` tags |
| `duration` | float | No | -- | `5` - `240` seconds (max 4 min) |
| `number_of_steps` | integer | No | -- | `3` - `60` |
| `seed` | integer | No | -- | -- |
| `scheduler` | string | No | -- | `euler`, `heun` |
| `guidance_type` | string | No | -- | `cfg`, `apg`, `cfg_star` |
| `granularity_scale` | integer | No | -- | `-100` - `100` |
| `guidance_interval` | float | No | -- | `0.0` - `1.0` |
| `guidance_interval_decay` | float | No | -- | `0.0` - `1.0` |
| `guidance_scale` | float | No | -- | `0.0` - `200.0` |
| `minimum_guidance_scale` | float | No | -- | `0.0` - `200.0` |
| `tag_guidance_scale` | float | No | -- | `0.0` - `10.0` |
| `lyric_guidance_scale` | float | No | -- | `0.0` - `10.0` |

**Output:** wav. Tag-driven generation with optional structured lyrics.

---

## 9.5 music-beatoven

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-music-beatoven` |
| **Lambda** | `ssm-content-worker-music-beatoven` |
| **Provider** | Beatoven via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **5,000 chars** |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 5,000 chars |
| `negative_prompt` | string | No | -- | What to avoid |
| `duration` | float | No | -- | `5` - `150` seconds |
| `refinement` | integer | No | -- | `10` - `200` |
| `creativity` | integer | No | -- | `1` - `20` |
| `seed` | integer | No | -- | -- |

**Output:** wav. Royalty-free instrumental music.

---

## 9.6 music-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-music-stability` |
| **Lambda** | `ssm-content-worker-music-stability` |
| **Provider** | Stability AI Stable Audio (Direct API) |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `stable-audio-2` | Stable Audio 2.0 |
| `stable-audio-2.5` | Stable Audio 2.5 (default) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Free text |
| `model` | string | No | `stable-audio-2.5` | `stable-audio-2`, `stable-audio-2.5` |
| `generation_type` | string | No | `text-to-audio` | `text-to-audio`, `audio-to-audio`, `inpaint` |
| `duration` | integer | No | `30` | `1` - `190` seconds |
| `output_format` | string | No | `mp3` | `mp3`, `wav` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `genre` | string | No | -- | `electronic`, `orchestral`, `ambient`, `chiptune`, `rock`, `pop`, `jazz`, `classical`, `hip-hop`, `cinematic`, `lo-fi`, `edm`, `retro`, `acoustic`, `synthwave` |
| `mood` | string | No | -- | `happy`, `sad`, `energetic`, `calm`, `epic`, `mysterious`, `tense`, `relaxing`, `uplifting`, `dark`, `playful`, `heroic`, `melancholic`, `triumphant`, `suspenseful` |
| `use_case` | string | No | -- | `menu`, `gameplay`, `boss_battle`, `victory`, `defeat`, `loading`, `cutscene`, `puzzle`, `action`, `exploration`, `shop`, `tutorial`, `credits` |
| `steps` | integer | No | SA2: `50`, SA2.5: `8` | SA2: `30`-`100`, SA2.5: `4`-`8` |
| `cfg_scale` | float | No | SA2: `7`, SA2.5: `1` | -- |
| `seed` | integer | No | `0` | 0 = random |
| `preset` | string | No | -- | Named preset |
| `input_audio_url` | string | No | -- | Source audio (audio-to-audio / inpaint) |
| `input_audio_base64` | string | No | -- | Source audio base64 |
| `strength` | float | No | -- | `0` - `1`, transformation strength (audio-to-audio) |
| `mask_start` | float | No | -- | Inpaint start position (seconds) |
| `mask_end` | float | No | -- | Inpaint end position (seconds) |
| `tempo_bpm` | integer | No | -- | Target BPM (e.g. `120`) |
| `instruments` | array | No | -- | e.g. `["piano", "drums", "synth"]` |

---

## 9.7 music-lyria (Vertex AI -- NEW 2026-08-13)

**Status:** ✅ **VERIFIED LIVE 2026-08-13** — deployed, called through `POST /create-music-lyria`
(job `b098a4b9-…` and a second run after a measurement fix), delivered file **downloaded from the
CDN and ffprobed: 32.768 s, 48 kHz stereo `pcm_s16le`, 6,291,544 B**, and the worker's reported
duration matches the file to **0.000 s**. Direct-invoke and route-invoke both proven.

**Endpoint:** `POST /create-music-lyria` → `ssm-content-worker-music-lyria`
(python3.12 Zip, layer `ssm-content-vertex-layer:1`, 900 s / 1024 MB, WIF auth, S3 prefix
`music/vertex-lyria/`).

### The TWO surfaces, chosen by model (not interchangeable)

| Model | Status | Surface | Measured note |
|---|---|---|---|
| `lyria-002` (default) | GA · generation-proven in this repo (`INTRO_ENGINE.md`) | `:predict` with `instances[]` / `parameters` | The delivered file is 48 kHz **stereo** wav |
| `lyria-3-pro-preview` | Public Preview · **PROBED WORKING 2026-08-13** | `locations/global/interactions` | Request body must be **EXACTLY `{model, input}`** — every extra key was measured rejected |
| `lyria-3-clip-preview` | Public Preview · **PROBED WORKING 2026-08-13** | `locations/global/interactions` | same body constraint |

### Parameters (request-body root)

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| `prompt` | string | **Yes** | -- | The musical description. Everything below that has no vendor field is folded into this prose |
| `model` | string | No | `lyria-002` | One of the three above |
| `negative_prompt` | string | No | -- | `:predict` only (`parameters.negative_prompt`) |
| `seed` | integer | No | -- | `:predict` only (`parameters.seed`) |
| `sample_count` | integer | No | 1 | `:predict` only; **>1 is REFUSED on the Interactions surface** |
| `instrumental_only` | boolean | No | `true` | Appends five explicit no-vocal clauses — Lyria returns sung lyrics otherwise |
| `style`, `instruments[]`, `tempo_bpm`, `key`, `mood`, `duration_hint_seconds` | -- | No | -- | **PROSE, not parameters.** No such fields exist on either surface; they are composed into the prompt and the response returns `prompt_used` so what was actually sent is visible |
| `s3_bucket`, `output_path` | string | No | env | Delivery overrides |

### LYRICS: MEASURED ON `lyria-002` ONLY — AND THE SCOPE CORRECTION THAT FOLLOWED (2026-08-13)

There is **no `lyrics` / `vocal` / `singer` / `melody` field anywhere** in the discovery document
(revision 20260801) — 0 matches — so prose is the only channel on the `:predict` surface. What prose
buys there was measured by `scripts/measure_lyria_lyrics_capability.py`: three generations, each
delivered file transcribed by **this API's own `/create-stt-vertex`**, plus a negative control.

| Arm | Request | Delivered (ffprobe + transcript) | Verdict |
|---|---|---|---|
| A | `instrumental_only:false` + **8 specific Turkish words** dictated in the prompt | 32.768 s, median F0 145.5 Hz, voiced ratio 0.947 · transcript = the transcriber's "nobody sings" sentinel | **0 of 8 requested words.** Dictated lyrics NOT reproduced |
| B | `instrumental_only:false`, singing asked for, **no words dictated** | 32.768 s, F0 98.8 Hz, voiced ratio 0.996 · transcript `"Ah, ah, ah, ah, ah"` ×3 | A real **vocal texture**, no intelligible language |
| C | `instrumental_only:true` (the default) | 32.768 s, F0 115.9 Hz · sentinel | **Negative control PASSED** — the only reason A and B count as evidence |

> **🔴 SCOPE CORRECTION, and it is a defect in the measurement, not in the surface.** Those three arms
> **never set `model`**, so all three ran on the worker's `DEFAULT_MODEL` = **`lyria-002`** (the
> `:predict` surface). The table above is therefore true of **`lyria-002` and UNTESTED on
> `lyria-3-pro-preview`**. The script now takes `--model`, prints it beside every result and writes
> `findings-<model>.json`; the first run's evidence is preserved as
> `artifacts/deploy-2026-08-12/lyria-lyrics/findings-lyria-002.json`.
>
> **✅ ANSWERED 2026-08-13 13:3x — `lyria-3-pro-preview` DOES sing dictated Turkish lyrics.** Three arms
> plus a negative control through this endpoint, each delivered file transcribed by
> `/create-stt-vertex` (`scripts/measure_lyria_lyrics_capability.py --model lyria-3-pro-preview`,
> findings at `artifacts/deploy-2026-08-12/lyria-lyrics/findings-lyria-3-pro-preview.json`):
>
> | Arm | Transcript of the delivered audio | Verdict |
> |---|---|---|
> | A — 8 Turkish words dictated after `Lyrics:` | *"Yaz sabahı geldi … Kapıyı çota … Güneş bizi bekliyo"* | **7 of 8 words returned** |
> | B — singing, no words dictated | *"The kettle's hum is a silver line / Drawing maps of a life that's mine…"* | it wrote and sang its OWN English lyric |
> | C — `instrumental_only:true` | "nobody sings" sentinel | **negative control PASSED** |
>
> **Two limits, stated with the result:** the 8th word (`çal`) came back as `çota`/`çalıyma`, so
> Turkish is sung but **articulation is imperfect** — that is what a PER gate quantifies and no vendor
> documents it; and arm B sang **English** unbidden, so **language follows the dictated lyric, not a
> setting** — Turkish output requires dictating Turkish words. Whether the articulation is acceptable
> is **BERK'S VERDICT**, not an instrument's. Cost: $0.27 of the $50 R&D budget, 6 of 40 calls, through
> a control-proven ledger (16/16) with a loop guard.
>
> **TWO DEFECTS IN THIS WORKER WERE FOUND BY THAT PROBE AND FIXED (deployed sha256 `JBaSYy/0…`):**
> (1) it stored **MP3 under a `.wav` key** with `Content-Type: audio/wav` — ffprobe on the delivered
> file measured `mp3, 44100 Hz, 2 ch, 139.258708 s`; the container is now **sniffed from the magic
> bytes** and an unknown container is labelled `bin` rather than guessed. (2) A successful generation
> returned **no duration at all**, because the WAV-only measurement fails on MP3; duration now comes
> from an **MPEG frame-header walk** (exact for CBR and VBR, no ffmpeg, no guessed bitrate),
> control-proven **13/13** against ffprobe on the real files (Δ ≤ 0.0003 s).
>
> **Delivered length is NOT requestable and NOT fixed:** the three arms came back **139.26 s /
> 146.73 s / 159.63 s** without any duration being asked for, so Google's documented "184 second"
> figure is a ceiling, not a length. Always measure the file.

**Consequence for callers TODAY:** on `lyria-002` use this endpoint for score, atmosphere and a
wordless vocal layer (choir-like "ah", humming); words that must be HEARD go to
`/create-voice-vertex-tts`, where named-voice selection is generation-proven, and are mixed with the
bed at assembly. Note that `instrumental_only:false` does not reliably produce singing on
`lyria-002` either — arm A came back wordless despite asking for a solo singer; only arm B's
un-dictated request produced a voice.

### REFUSED BY NAME (each with its measured reason — sending them silently is the banned class)

| Field | Why it is refused |
|---|---|
| `mime_type` | printed in an enum but **measured rejected** on this surface |
| `duration_seconds` | no duration parameter exists — duration is a PROSE request and the OUTPUT length is whatever the model returns (a 30 s request measured **32.768 s**) |
| `gcs_uri` / `output_gcs_uri` | measured rejected on the Interactions body |
| `sample_rate`, `bit_rate`, `loop`, `stems` | not on either surface |

### Response extras

`surface` (`predict` / `interactions`) · `model_evidence` · `prompt_used` · `instrumental_only` ·
`tracks[]` (one entry per sample) · per-file `duration_seconds` + `codec` + `sample_rate` +
`channels` + `riff_header_present`, with `measured_by` naming the instrument
(`ffprobe` or `stdlib wave (duration derived from data bytes)`).

> **A WAV HEADER LIED BY 2× HERE, and the worker now catches it.** Lyria's own header declared
> `nframes=3,145,750` for stereo data containing 1,572,864 frames, so a header-based reading
> reported **65.536 s** for a **32.768 s** file. Duration is now derived from the DATA and the
> response carries `header_frame_count_disagrees` when the file's own header is wrong. Controlled
> both directions: `scripts/test_wave_duration_measurement.py` **6/6**.

---

# 9b. VOICE (Vertex AI TTS) -- NEW 2026-08-13

<!-- BEGIN GENERATED: generate-music-hybrid-model (scripts/generate_music_studio_doc_section.py) -->

## 9.8 generate-music-hybrid-model (Music Studio — the single endpoint)

> **THIS SECTION IS GENERATED** from `generate_music_hybrid_model/music_studio/param_spec.json` by `scripts/generate_music_studio_doc_section.py`. Do not hand-edit it: edit the spec and re-run the generator. The reason is Berk's own requirement — the UI renders every request parameter FROM THIS DOCUMENT, so the document and the worker's validator must be the SAME list, kept identical by import rather than by discipline (MANDATE CLAUSE 23).

**Endpoint:** `POST /generate-music-hybrid-model` → `ssm-content-worker-generate-music-hybrid-model` (python3.12 Zip, 900 s / 1024 MB, role `ssm-content-lambda-role`, S3 prefix `music/studio-hybrid/`).

**What it is.** The conductor for the Music Studio: it validates the request against the spec below, PLANS (route + compiled Lyria prompt + a per-control bindings report), delegates the generation to the deployed Lyria worker, measures what came back, and returns a render plan for the heavy stages (conform · master · stems · lyric verification) that run on Google Cloud rather than in the Lambda.

### The four routes (chosen by the planner, never by the caller's guess)

| `route` | When the planner picks it |
|---|---|
| `auto` | default — the planner decides from `quality` and `duration` |
| `lyria-3-clip-preview` | `quality: draft` with a target ≤ 30 s — the documented fast surface |
| `lyria-3-pro-preview` | sung lyrics, or `quality: balanced`/`ultra` |
| `lyria-002` | the GA `:predict` surface, when a typed `seed`/`negative_prompt` is required |

The response always states which model actually received the request (`route.model`, `route.worker`, `route.delegate_reported`) and WHY (`route.why`) — engine identity is proven per call, never named (MANDATE CLAUSE 8).

### Binding classes — what a parameter DOES, stated per parameter

| Class | Meaning |
|---|---|
| `typed` | a real vendor request field on the chosen route |
| `prose` | folded into the prompt because no vendor field exists; the sent clause is returned |
| `enforced` | we measure the delivered file and trim/re-render to the requested value |
| `compiled` | deterministically compiled by our own stage into per-section directives |
| `refused` | rejected by name with the measured reason |
| `response_field` | an OUTPUT the API computes and returns; not a request parameter |
| `client_side` | UI-local; stored and echoed, no generation effect |

A parameter's class is part of its contract: `prose` means there is **no vendor field** and the clause we sent is returned to you, so an accepted-and-ignored parameter is impossible to mistake for a working one.

### The complete parameter surface — 35 parameters, 4 UI panels

#### Panel 0 — Client-side (1 parameters)

- **`client_side_echo`** — Collaborate (comments, avatars)  
  control `text` · binding **`client_side`** · free text (no closed value set)
  - default: `null` — no generation effect; BeforeTomorrow app state
  - value origin: UI-local concerns; enumerated so the coverage gate can prove nothing from the png was silently dropped

#### Panel 1 — Creative Brief, Prompt Presets (9 parameters)

- **`project`** — Project / Track Name  
  control `text` · binding **`client_side`** · free text (no closed value set)
  - **runtime binding (from the planner's own report): `metadata`** — render_plan.deliver (track naming) + response echo
  - default: `null` — no default; user-named (png shows 'Odyssey Trailer Theme' as sample data, not a default)
    - `name`: max_length=120
    - `track_id`: server_assigned=True
    - `version_note`: max_length=200

- **`creative_goal`** — Creative Goal (dropdown)  
  control `combo` · binding **`prose`** · 10 predefined values
  - default: `"epic_cinematic_uplifting"` — png shows this selection in the mock-up
  - value origin: png sample + our_stage lexicon (each goal owns a fixed prose clause, versioned in data/creative_goal_lexicon.json)
  - selectable: `epic_cinematic_uplifting` — Epic, cinematic & emotionally uplifting, `dark_tense_driving` — Dark, tense & driving, `warm_intimate_acoustic` — Warm, intimate & acoustic, `playful_light_quirky` — Playful, light & quirky, `melancholic_reflective` — Melancholic & reflective, `heroic_triumphant` — Heroic & triumphant, `mysterious_atmospheric` — Mysterious & atmospheric, `romantic_sweeping` — Romantic & sweeping, `energetic_upbeat_pop` — Energetic upbeat pop, `calm_ambient_meditative` — Calm, ambient & meditative

- **`prompt`** — Describe the track in detail (5000 chars)  
  control `text` · binding **`typed`** · free text (no closed value set)
  - default: `null` — png counter reads '312/5000' - 5000 is the UI cap; the per-route prompt cap is enforced by the worker at request time
  - constraints: `{"max_length": 5000}`

- **`prompt_enhance`** — Enhance (prompt rewriting)  
  control `toggle` · binding **`our_stage`** · no value set
  - **runtime binding (from the planner's own report): `reported_not_compiled`** — rewrite stage not built: enabled=true returns the ORIGINAL prompt and this note; a silent pretend-rewrite or a meta-instruction injected into the music prompt would each be the banned class
  - default: `{"enabled": false, "style": "conservative"}` — off by default: a rewrite the user did not ask for would alter dictated wording (verbatim law, rules/01 s11)
  - value origin: our_stage (Gemini rewrite service; style set is ours)
    - `enabled`: type=boolean
    - `style`: one of `conservative` — Conservative (preserve wording, fix gaps), `descriptive` — Descriptive (expand instrumentation & dynamics), `cinematic` — Cinematic (trailer-language rewrite)

- **`negative_prompt`** — Negative prompt / avoid (chips)  
  control `chips` · binding **`typed`** · 9 predefined values
  - **runtime binding (from the planner's own report): `typed_on_predict_prose_on_interactions`**
  - default: `[]` — empty by default; suggestions only
  - value origin: png chips as seed suggestions; free chips allowed (negative_prompt is a measured typed field on the Lyria :predict surface)
  - selectable: `cheesy` — cheesy, `meme` — meme, `lo-fi` — lo-fi, `distorted` — distorted, `90s_eurodance` — 90s eurodance, `muddy_low_end` — muddy low end, `harsh_highs` — harsh highs, `off_key_vocals` — off-key vocals, `abrupt_ending` — abrupt ending

- **`genres`** — Genres / Subgenres (chips)  
  control `multi-select` · binding **`prose`** · imported from `generate_music_hybrid_model/music_studio/data/genre_vocabulary.json` (2196 values)
  - default: `["cinematic"]` — png shows Cinematic as first chip
  - constraints: `{"max_selected": 6}`
  - value origin: data/genre_vocabulary.json - VALUE SET from MusicBrainz genre entities (CC0 core data, https://musicbrainz.org/doc/About/Data_License; commercial use allowed per https://metabrainz.org/datasets/postgres-dumps; full set swept 2026-08-18, 2184/2184 against the service's own genre-count) with the FAMILY axis joined by exact folded name from Wikidata's P279 subclass graph over Q188451 music genre (also CC0). The original png chips and research-corpus tags remain as their own earlier sourced group. Grouping is mandatory rather than cosmetic: the taxonomy research rejects a flat list at any size (745-subgenre flat taxonomy scores per-label F 0.032-0.115; overload is removed by categorising, not by shortening)
  - selectable: `cinematic` — Cinematic, `hybrid_orchestral` — Hybrid Orchestral, `trailer_music` — Trailer Music, `epic` — Epic, `cinematic_orchestral_fantasy` — Cinematic Orchestral Fantasy, `electronic_dance` — Electronic Dance, `classical` — Classical, `jazz` — Jazz, `ambient` — Ambient, `8bit` — 8-bit, `lo_fi` — Lo-fi, `bossa_nova` — Bossa Nova, `rnb` — R&B, `bollywood` — Bollywood, `hip_hop` — Hip-Hop, `pop` — Pop, `rock_full_band` — Rock (full band), `metal` — Metal, `rap` — Rap, `turkish_makam_fusion` — Turkish Makam Fusion, `anatolian_folk` — Anatolian Folk, `2_tone` — 2 tone, `2_step` — 2-step, `3_step` — 3-step, `aak` — aak, `abhang` — abhang, `aboio` — aboio, `abstract_hip_hop` — abstract hip hop, `acholitronix` — acholitronix, `acid_breaks` — acid breaks, `acid_house` — acid house, `acid_jazz` — acid jazz, `acid_rock` — acid rock, `acid_techno` — acid techno, `acid_trance` — acid trance, `acidcore` — acidcore, `acousmatic` — acousmatic, `acoustic_blues` — acoustic blues, `acoustic_chicago_blues` — acoustic chicago blues, `acoustic_rock` — acoustic rock, `acoustic_texas_blues` — acoustic texas blues, `adhunik_geet` — adhunik geet, `afoxe` — afoxê, `african_blues` — african blues, `afro_house` — afro house, `afro_rock` — afro rock, `afro_trap` — afro trap, `afro_cuban_jazz` — afro-cuban jazz, `afro_funk` — afro-funk, `afro_jazz` — afro-jazz, `afro_zouk` — afro-zouk, `afrobeat` — afrobeat, `afrobeats` — afrobeats, `afropiano` — afropiano, `afroswing` — afroswing, `agbadza` — agbadza, `agbekor` — agbekor, `aggrotech` — aggrotech, `agronejo` — agronejo, `ahwash` — ahwash, `aita` — aita, `akishibu_kei` — akishibu-kei, `al_jeel` — al jeel, `aleke` — aleke, `algerian_chaabi` — algerian chaabi, `algorave` — algorave, `alloukou` — alloukou, `alpenrock` — alpenrock, `alternative_country` — alternative country, `alternative_dance` — alternative dance, `alternative_folk` — alternative folk, `alternative_hip_hop` — alternative hip hop, `alternative_metal` — alternative metal, `alternative_pop` — alternative pop, `alternative_punk` — alternative punk, `alternative_r_b` — alternative r&b, `alternative_rock` — alternative rock, `alte` — alté, `amapiano` — amapiano, `ambasse_bey` — ambasse bey, `ambient_americana` — ambient americana, `ambient_dub` — ambient dub, `ambient_house` — ambient house, `ambient_noise_wall` — ambient noise wall, `ambient_plugg` — ambient plugg, `ambient_pop` — ambient pop, `ambient_techno` — ambient techno, `ambient_trance` — ambient trance, `ambrosian_chant` — ambrosian chant, `american_gamelan` — american gamelan, `american_primitive_guitar` — american primitive guitar, `americana` — americana, `amigacore` — amigacore, `anarcho_punk` — anarcho-punk, `anatolian_rock` — anatolian rock, `andalusian_classical` — andalusian classical, `andean_new_age` — andean new age, `anglican_chant` — anglican chant, `animal_sounds` — animal sounds, `anti_folk` — anti-folk, `aor` — aor, `apala` — apala, `appalachian_folk` — appalachian folk, `aquacrunk` — aquacrunk, `arabesk` — arabesk, `arabesk_rap` — arabesk rap, `arena_rock` — arena rock, `arrocha` — arrocha, `arrocha_funk` — arrocha funk, `arrocha_sertanejo` — arrocha sertanejo, `arrochadeira` — arrochadeira, `ars_antiqua` — ars antiqua, `ars_nova` — ars nova, `ars_subtilior` — ars subtilior, `art_pop` — art pop, `art_punk` — art punk, `art_rock` — art rock, `art_song` — art song, `artcore` — artcore, `ashkenazi_cantorial_music` — ashkenazi cantorial music, `asian_rock` — asian rock, `asmr` — asmr, `assiko` — assiko, `atmospheric_black_metal` — atmospheric black metal, `atmospheric_drum_and_bass` — atmospheric drum and bass, `atmospheric_sludge_metal` — atmospheric sludge metal, `audio_documentary` — audio documentary, `audio_drama` — audio drama, `autonomic` — autonomic, `avant_folk` — avant-folk, `avant_garde` — avant-garde, `avant_garde_jazz` — avant-garde jazz, `avant_garde_metal` — avant-garde metal, `avant_garde_pop` — avant-garde pop, `avant_prog` — avant-prog, `avanzada` — avanzada, `avtorskaya_pesnya` — avtorskaya pesnya, `axe` — axé, `bacardi` — bacardi, `bachata` — bachata, `bachaton` — bachatón, `bagad` — bagad, `bagatelle` — bagatelle, `baguala` — baguala, `baila` — baila, `baisha_xiyue` — baisha xiyue, `baithak_gana` — baithak gana, `baiao` — baião, `bakersfield_sound` — bakersfield sound, `balani_show` — balani show, `balearic_beat` — balearic beat, `balearic_trance` — balearic trance, `balinese_gamelan` — balinese gamelan, `balitaw` — balitaw, `ballad` — ballad, `ballad_opera` — ballad opera, `ballet` — ballet, `ballet_de_cour` — ballet de cour, `ballroom_house` — ballroom house, `baltimore_club` — baltimore club, `bambuco` — bambuco, `banda_sinaloense` — banda sinaloense, `bandari` — bandari, `bandinha` — bandinha, `banga` — banga, `bantengan` — bantengan, `baqashot` — baqashot, `barber_beats` — barber beats, `barbershop` — barbershop, `bard_rock` — bard rock, `bardcore` — bardcore, `baroque` — baroque, `baroque_pop` — baroque pop, `baroque_suite` — baroque suite, `bashment_soca` — bashment soca, `bass_house` — bass house, `bassline` — bassline, `batida` — batida, `batidao_romantico` — batidão romântico, `batonebi_songs` — batonebi songs, `battle_rap` — battle rap, `battle_record` — battle record, `batucada` — batucada, `batuque` — batuque, `baul_gaan` — baul gaan, `beach_music` — beach music, `beat_bolha` — beat bolha, `beat_bruxaria` — beat bruxaria, `beat_fino` — beat fino, `beat_music` — beat music, `beat_poetry` — beat poetry, `beat_rock` — beat rock, `beatboxing` — beatboxing, `beatdown_hardcore` — beatdown hardcore, `bebop` — bebop, `bedoui_wahrani` — bedoui wahrani, `bedroom_pop` — bedroom pop, `beijing_opera` — beijing opera, `belgian_techno` — belgian techno, `bend_skin` — bend-skin, `beneventan_chant` — beneventan chant, `benga` — benga, `beni` — beni, `benna` — benna, `beompae` — beompae, `berlin_school` — berlin school, `bhajan` — bhajan, `bhangra` — bhangra, `bhavageethe` — bhavageethe, `bhojpuri_pop` — bhojpuri pop, `big_band` — big band, `big_beat` — big beat, `big_room_house` — big room house, `big_room_trance` — big room trance, `biguine` — biguine, `bikutsi` — bikutsi, `binaural_beats` — binaural beats, `biraha` — biraha, `birdsong` — birdsong, `birmingham_sound` — birmingham sound, `bit_music` — bit music, `bitpop` — bitpop, `black_n_roll` — black 'n' roll, `black_ambient` — black ambient, `black_metal` — black metal, `black_midi` — black midi, `black_noise` — black noise, `blackened_crust` — blackened crust, `blackened_death_metal` — blackened death metal, `blackgaze` — blackgaze, `bleep_techno` — bleep techno, `blue_eyed_soul` — blue-eyed soul, `bluegrass` — bluegrass, `bluegrass_gospel` — bluegrass gospel, `blues` — blues, `blues_rock` — blues rock, `bocet` — bocet, `boduberu` — boduberu, `boedra` — boedra, `bogino_duu` — bogino duu, `bolero` — bolero, `bolero_espanol` — bolero español, `bolero_son` — bolero son, `bolero_beat` — bolero-beat, `bomba` — bomba, `bomba_del_chota` — bomba del chota, `bongo_flava` — bongo flava, `boogaloo` — boogaloo, `boogie` — boogie, `boogie_rock` — boogie rock, `boogie_woogie` — boogie-woogie, `boom_bap` — boom bap, `bounce` — bounce, `bounce_beat` — bounce beat, `bouncy_techno` — bouncy techno, `bouyon` — bouyon, `boyfriend_country` — boyfriend country, `brass_band` — brass band, `brazilian_bass` — brazilian bass, `brazilian_phonk` — brazilian phonk, `break_in` — break-in, `breakbeat` — breakbeat, `breakbeat_hardcore` — breakbeat hardcore, `breakbeat_kota` — breakbeat kota, `breakcore` — breakcore, `breaks` — breaks, `breakstep` — breakstep, `brega` — brega, `brega_calypso` — brega calypso, `brega_funk` — brega funk, `briddim` — briddim, `brill_building` — brill building, `brit_funk` — brit funk, `britcore` — britcore, `british_blues` — british blues, `british_brass_band` — british brass band, `british_folk_rock` — british folk rock, `british_rhythm_blues` — british rhythm & blues, `britpop` — britpop, `bro_country` — bro-country, `broadband_noise` — broadband noise, `broken_beat` — broken beat, `broken_transmission` — broken transmission, `brostep` — brostep, `brutal_death_metal` — brutal death metal, `brutal_prog` — brutal prog, `bubblegum_bass` — bubblegum bass, `bubblegum_dance` — bubblegum dance, `bubblegum_pop` — bubblegum pop, `bubbling` — bubbling, `bubbling_house` — bubbling house, `buchiage_trance` — buchiage trance, `budget_rock` — budget rock, `budots` — budots, `buleria` — bulería, `bullerengue` — bullerengue, `burger_highlife` — burger-highlife, `burmese_classical` — burmese classical, `burmese_mono` — burmese mono, `burmese_stereo` — burmese stereo, `burning_spirits` — burning spirits, `burrakatha` — burrakatha, `bytebeat` — bytebeat, `byzantine_chant` — byzantine chant, `bele` — bélé, `berite_club` — bérite club, `c_pop` — c-pop, `c86` — c86, `ca_tru` — ca trù, `cabaret` — cabaret, `cabo_zouk` — cabo zouk, `cadence_lypso` — cadence lypso, `cadence_rampa` — cadence rampa, `cajun` — cajun, `cakewalk` — cakewalk, `calipso_venezolano` — calipso venezolano, `calypso` — calypso, `campursari` — campursari, `campus_folk` — campus folk, `cancion_melodica` — canción melódica, `candombe` — candombe, `candombe_beat` — candombe beat, `cantata` — cantata, `cante_alentejano` — cante alentejano, `canterbury_scene` — canterbury scene, `canto_a_lo_poeta` — canto a lo poeta, `canto_cardenche` — canto cardenche, `canto_degli_alpini` — canto degli alpini, `cantonese_opera` — cantonese opera, `cantopop` — cantopop, `cantoria` — cantoria, `cantu_a_chiterra` — cantu a chiterra, `cantu_a_tenore` — cantu a tenore, `canzona` — canzona, `canzone_d_autore` — canzone d'autore, `canzone_napoletana` — canzone napoletana, `canzone_neomelodica` — canzone neomelodica, `cape_breton_fiddling` — cape breton fiddling, `cape_jazz` — cape jazz, `caporal` — caporal, `capriccio` — capriccio, `carimbo` — carimbó, `carnatic_classical` — carnatic classical, `carnavalito` — carnavalito, `carranga` — carranga, `celtic` — celtic, `celtic_chant` — celtic chant, `celtic_electronica` — celtic electronica, `celtic_metal` — celtic metal, `celtic_new_age` — celtic new age, `celtic_punk` — celtic punk, `celtic_rock` — celtic rock, `central_asian_throat_singing` — central asian throat singing, `chacarera` — chacarera, `chachacha` — chachachá, `chakacha` — chakacha, `chalga` — chalga, `chamame` — chamamé, `chamame_tropical` — chamamé tropical, `chamarrita_acoriana` — chamarrita açoriana, `chamarrita_rioplatense` — chamarrita rioplatense, `chamber_folk` — chamber folk, `chamber_pop` — chamber pop, `champeta` — champeta, `changa_tuki` — changa tuki, `change_ringing` — change ringing, `changjak_gugak` — changjak gugak, `changui` — changüí, `chanson_francaise` — chanson française, `chanson_quebecoise` — chanson québécoise, `chanson_realiste` — chanson réaliste, `chanson_a_texte` — chanson à texte, `chaozhou_xianshi` — chaozhou xianshi, `chap_hop` — chap hop, `character_piece` — character piece, `charanga` — charanga, `chazzanut` — chazzanut, `chicago_blues` — chicago blues, `chicago_bop` — chicago bop, `chicago_drill` — chicago drill, `chicago_house` — chicago house, `chicago_polka` — chicago polka, `chicago_soul` — chicago soul, `chicano_rap` — chicano rap, `chicha` — chicha, `children_s_music` — children's music, `chilena` — chilena, `chillout` — chillout, `chillstep` — chillstep, `chillsynth` — chillsynth, `chillwave` — chillwave, `chimayche` — chimayche, `chimurenga` — chimurenga, `chinese_classical` — chinese classical, `chinese_literati_music` — chinese literati music, `chinese_opera` — chinese opera, `chinese_revolutionary_opera` — chinese revolutionary opera, `chipmunk_soul` — chipmunk soul, `chiptune` — chiptune, `chopped_and_screwed` — chopped and screwed, `chopper` — chopper, `choral_symphony` — choral symphony, `choro` — choro, `chotis_madrileno` — chotis madrileño, `christian_hardcore` — christian hardcore, `christian_hip_hop` — christian hip hop, `christian_metal` — christian metal, `christian_rock` — christian rock, `christmas_music` — christmas music, `church_music` — church music, `chuscada` — chuscada, `chutney` — chutney, `chutney_soca` — chutney soca, `cheo` — chèo, `chod` — chöd, `cilokaq` — cilokaq, `cinematic_classical` — cinematic classical, `ciranda` — ciranda, `circus_march` — circus march, `city_pop` — city pop, `classic_blues` — classic blues, `classic_country` — classic country, `classic_jazz` — classic jazz, `classic_ragtime` — classic ragtime, `classic_rock` — classic rock, `classical_crossover` — classical crossover, `classical_period` — classical period, `close_harmony` — close harmony, `cloud_rap` — cloud rap, `club` — club, `cocktail_nation` — cocktail nation, `coco` — coco, `coke_rap` — coke rap, `coladeira` — coladeira, `coldwave` — coldwave, `colinda` — colindă, `colour_bass` — colour bass, `comedy` — comedy, `comedy_hip_hop` — comedy hip hop, `comedy_rock` — comedy rock, `comfy_synth` — comfy synth, `compas` — compas, `complextro` — complextro, `comedie_ballet` — comédie-ballet, `concert_band` — concert band, `concert_spiritual` — concert spiritual, `concertina_band` — concertina band, `concerto` — concerto, `concerto_for_orchestra` — concerto for orchestra, `concerto_grosso` — concerto grosso, `conducted_improvisation` — conducted improvisation, `conga` — conga, `congolese_rumba` — congolese rumba, `conscious_hip_hop` — conscious hip hop, `contemporary_christian` — contemporary christian, `contemporary_classical` — contemporary classical, `contemporary_country` — contemporary country, `contemporary_folk` — contemporary folk, `contemporary_gospel` — contemporary gospel, `contemporary_jazz` — contemporary jazz, `contemporary_r_b` — contemporary r&b, `contenance_angloise` — contenance angloise, `contra` — contra, `cool_jazz` — cool jazz, `coon_song` — coon song, `copla` — copla, `copla_cajamarquina` — copla cajamarquina, `corrido` — corrido, `corrido_tumbado` — corrido tumbado, `cosmic_country` — cosmic country, `country` — country, `country_and_irish` — country and irish, `country_blues` — country blues, `country_boogie` — country boogie, `country_folk` — country folk, `country_gospel` — country gospel, `country_pop` — country pop, `country_rap` — country rap, `country_rock` — country rock, `country_soul` — country soul, `country_yodeling` — country yodeling, `countrypolitan` — countrypolitan, `coupe_decale` — coupé-décalé, `cowboy_poetry` — cowboy poetry, `cowpunk` — cowpunk, `crack_rock_steady` — crack rock steady, `crime_jazz` — crime jazz, `crossbreed` — crossbreed, `crossover_jazz` — crossover jazz, `crossover_prog` — crossover prog, `crossover_thrash` — crossover thrash, `cruise` — cruise, `crunk` — crunk, `crunkcore` — crunkcore, `crust_punk` — crust punk, `csardas` — csárdás, `cuarteto` — cuarteto, `cubaton` — cubatón, `cuddlecore` — cuddlecore, `cueca` — cueca, `cueca_brava` — cueca brava, `cumbia` — cumbia, `cumbia_amazonica` — cumbia amazónica, `cumbia_argentina` — cumbia argentina, `cumbia_chilena` — cumbia chilena, `cumbia_colombiana` — cumbia colombiana, `cumbia_mexicana` — cumbia mexicana, `cumbia_nortena_mexicana` — cumbia norteña mexicana, `cumbia_nortena_peruana` — cumbia norteña peruana, `cumbia_peruana` — cumbia peruana, `cumbia_pop` — cumbia pop, `cumbia_rebajada` — cumbia rebajada, `cumbia_salvadorena` — cumbia salvadoreña, `cumbia_santafesina` — cumbia santafesina, `cumbia_sonidera` — cumbia sonidera, `cumbia_surena_peruana` — cumbia sureña peruana, `cumbia_turra` — cumbia turra, `cumbia_villera` — cumbia villera, `cumbiaton` — cumbiatón, `cuple` — cuplé, `currulao` — currulao, `cururu` — cururu, `cyber_metal` — cyber metal, `cybergrind` — cybergrind, `cyberpunk` — cyberpunk, `cai_luong` — cải lương, `d_beat` — d-beat, `dabke` — dabke, `dance` — dance, `dance_pop` — dance-pop, `dance_punk` — dance-punk, `dance_punk_revival` — dance-punk revival, `dance_rock` — dance-rock, `dancefloor_drum_and_bass` — dancefloor drum and bass, `dancehall` — dancehall, `dangak` — dangak, `dangdut` — dangdut, `danmono` — danmono, `dansband` — dansband, `dansktop` — dansktop, `danzon` — danzón, `dariacore` — dariacore, `dark_ambient` — dark ambient, `dark_cabaret` — dark cabaret, `dark_disco` — dark disco, `dark_electro` — dark electro, `dark_folk` — dark folk, `dark_garage` — dark garage, `dark_jazz` — dark jazz, `dark_plugg` — dark plugg, `dark_psytrance` — dark psytrance, `dark_wave` — dark wave, `darkcore` — darkcore, `darkcore_edm` — darkcore edm, `darkstep` — darkstep, `darksynth` — darksynth, `data_sonification` — data sonification, `death_n_roll` — death 'n' roll, `death_industrial` — death industrial, `death_metal` — death metal, `death_doom_metal` — death-doom metal, `deathchant_hardcore` — deathchant hardcore, `deathcore` — deathcore, `deathgrind` — deathgrind, `deathrock` — deathrock, `deathstep` — deathstep, `dechovka` — dechovka, `deconstructed_club` — deconstructed club, `deejay` — deejay, `deep_drum_and_bass` — deep drum and bass, `deep_funk` — deep funk, `deep_house` — deep house, `deep_soul` — deep soul, `deep_tech` — deep tech, `deep_techno` — deep techno, `delta_blues` — delta blues, `dembow` — dembow, `demostyle` — demostyle, `dennery_segment` — dennery segment, `denpa` — denpa, `depressive_black_metal` — depressive black metal, `descarga` — descarga, `desert_blues` — desert blues, `desert_rock` — desert rock, `desgarrada` — desgarrada, `detroit_techno` — detroit techno, `detroit_trap` — detroit trap, `dhaanto` — dhaanto, `dhol_tasha` — dhol tasha, `dhrupad` — dhrupad, `digicore` — digicore, `digital_cumbia` — digital cumbia, `digital_fusion` — digital fusion, `digital_hardcore` — digital hardcore, `dikir_barat` — dikir barat, `dimotiko` — dimotiko, `dirty_south` — dirty south, `disco` — disco, `disco_polo` — disco polo, `dissonant_black_metal` — dissonant black metal, `dissonant_death_metal` — dissonant death metal, `diva_house` — diva house, `divertissement` — divertissement, `dixieland` — dixieland, `djanba` — djanba, `djent` — djent, `doble_paso` — doble paso, `dobrado` — dobrado, `dohori` — dohori, `doina` — doina, `dondang_sayang` — dondang sayang, `dongjing` — dongjing, `donk` — donk, `donosti_sound` — donosti sound, `doo_wop` — doo-wop, `doom_metal` — doom metal, `doomcore` — doomcore, `doomgaze` — doomgaze, `doskpop` — doskpop, `downtempo` — downtempo, `downtempo_deathcore` — downtempo deathcore, `dream_pop` — dream pop, `dream_trance` — dream trance, `dreampunk` — dreampunk, `dreamwave` — dreamwave, `drift_phonk` — drift phonk, `drill` — drill, `drill_and_bass` — drill and bass, `drinking_song` — drinking song, `drone` — drone, `drone_metal` — drone metal, `drum_and_bass` — drum and bass, `drum_and_bugle_corps` — drum and bugle corps, `drumfunk` — drumfunk, `drumless_hip_hop` — drumless hip hop, `drumline` — drumline, `drumstep` — drumstep, `dub` — dub, `dub_poetry` — dub poetry, `dub_techno` — dub techno, `dubstep` — dubstep, `dubstyle` — dubstyle, `dubwise` — dubwise, `duma` — duma, `dunedin_sound` — dunedin sound, `dungeon_chip` — dungeon chip, `dungeon_rap` — dungeon rap, `dungeon_sound` — dungeon sound, `dungeon_synth` — dungeon synth, `duranguense` — duranguense, `dutch_house` — dutch house, `eai` — eai, `early_hardstyle` — early hardstyle, `east_coast_hip_hop` — east coast hip hop, `eastern_style_polka` — eastern-style polka, `easy_listening` — easy listening, `easycore` — easycore, `ebm` — ebm, `eccojams` — eccojams, `edm` — edm, `electric_blues` — electric blues, `electric_texas_blues` — electric texas blues, `electro` — electro, `electro_hop` — electro hop, `electro_house` — electro house, `electro_latino` — electro latino, `electro_swing` — electro swing, `electro_trance` — electro trance, `electro_disco` — electro-disco, `electro_funk` — electro-funk, `electro_industrial` — electro-industrial, `electroacoustic` — electroacoustic, `electroclash` — electroclash, `electronic` — electronic, `electronic_rock` — electronic rock, `electronica` — electronica, `electronicore` — electronicore, `electropop` — electropop, `electropunk` — electropunk, `electrotango` — electrotango, `eleki` — eleki, `eletrofunk` — eletrofunk, `embolada` — embolada, `emo` — emo, `emo_pop` — emo pop, `emo_rap` — emo rap, `emocore` — emocore, `emoviolence` — emoviolence, `english_pastoral_school` — english pastoral school, `enka` — enka, `epic_collage` — epic collage, `epic_doom_metal` — epic doom metal, `epic_house` — epic house, `estrada` — estrada, `ethereal_wave` — ethereal wave, `ethio_jazz` — ethio-jazz, `euphoric_hardstyle` — euphoric hardstyle, `euro_house` — euro house, `euro_disco` — euro-disco, `euro_trance` — euro-trance, `eurobeat` — eurobeat, `eurodance` — eurodance, `europop` — europop, `euskal_kantagintza_berria` — euskal kantagintza berria, `exotica` — exotica, `experimental` — experimental, `experimental_big_band` — experimental big band, `experimental_electronic` — experimental electronic, `experimental_hip_hop` — experimental hip hop, `experimental_rock` — experimental rock, `expressionism` — expressionism, `extratone` — extratone, `fado` — fado, `fado_de_coimbra` — fado de coimbra, `fairy_tale` — fairy tale, `fakaseasea` — fakaseasea, `falak` — falak, `famo` — famo, `fandango` — fandango, `fandango_caicara` — fandango caiçara, `fantasia` — fantasia, `fantezi` — fantezi, `festejo` — festejo, `festival_progressive_house` — festival progressive house, `festival_trap` — festival trap, `fidget_house` — fidget house, `field_recording` — field recording, `fife_and_drum` — fife and drum, `fife_and_drum_blues` — fife and drum blues, `fijiri` — fijiri, `filin` — filin, `filipino_rondalla` — filipino rondalla, `filk` — filk, `filmi` — filmi, `finnish_tango` — finnish tango, `flamenco` — flamenco, `flamenco_jazz` — flamenco jazz, `flamenco_pop` — flamenco pop, `flashcore` — flashcore, `flex_dance_music` — flex dance music, `florida_breaks` — florida breaks, `fm_synthesis` — fm synthesis, `folk` — folk, `folk_metal` — folk metal, `folk_pop` — folk pop, `folk_punk` — folk punk, `folk_rock` — folk rock, `folkhop` — folkhop, `folktronica` — folktronica, `fon_leb` — fon leb, `football_chant` — football chant, `footwork` — footwork, `footwork_jungle` — footwork jungle, `forest_psytrance` — forest psytrance, `forro` — forró, `forro_de_favela` — forró de favela, `forro_eletronico` — forró eletrônico, `forro_universitario` — forró universitário, `frapcore` — frapcore, `frat_rap` — frat rap, `frat_rock` — frat rock, `freak_folk` — freak folk, `freakbeat` — freakbeat, `free_car_music` — free car music, `free_folk` — free folk, `free_funk` — free funk, `free_improvisation` — free improvisation, `free_jazz` — free jazz, `free_tekno` — free tekno, `freeform_hardcore` — freeform hardcore, `freestyle` — freestyle, `french_electro` — french electro, `french_house` — french house, `frenchcore` — frenchcore, `frevo` — frevo, `frevo_de_bloco` — frevo de bloco, `frevo_de_rua` — frevo de rua, `frevo_eletrico` — frevo elétrico, `frevo_cancao` — frevo-canção, `fugue` — fugue, `fuji` — fuji, `full_on` — full-on, `funana` — funaná, `funeral_doom_metal` — funeral doom metal, `funeral_march` — funeral march, `fungi` — fungi, `funk` — funk, `funk_automotivo` — funk automotivo, `funk_brasileiro` — funk brasileiro, `funk_carioca` — funk carioca, `funk_consciente` — funk consciente, `funk_de_bh` — funk de bh, `funk_mandelao` — funk mandelão, `funk_melody` — funk melody, `funk_metal` — funk metal, `funk_ostentacao` — funk ostentação, `funk_proibidao` — funk proibidão, `funk_rock` — funk rock, `funknejo` — funknejo, `funkot` — funkot, `funktronica` — funktronica, `funky_breaks` — funky breaks, `funky_house` — funky house, `fusion_gugak` — fusion gugak, `future_bass` — future bass, `future_bounce` — future bounce, `future_core` — future core, `future_funk` — future funk, `future_garage` — future garage, `future_house` — future house, `future_rave` — future rave, `future_riddim` — future riddim, `futurepop` — futurepop, `futurism` — futurism, `g_funk` — g-funk, `g_house` — g-house, `gaana` — gaana, `gabber` — gabber, `gaelic_psalm_singing` — gaelic psalm singing, `gagaku` — gagaku, `gagok` — gagok, `gaita_zuliana` — gaita zuliana, `gallican_chant` — gallican chant, `gambang_kromong` — gambang kromong, `gamelan` — gamelan, `gamelan_angklung` — gamelan angklung, `gamelan_beleganjur` — gamelan beleganjur, `gamelan_degung` — gamelan degung, `gamelan_gender_wayang` — gamelan gender wayang, `gamelan_gong_gede` — gamelan gong gede, `gamelan_gong_kebyar` — gamelan gong kebyar, `gamelan_jegog` — gamelan jegog, `gamelan_joged_bumbung` — gamelan joged bumbung, `gamelan_salendro` — gamelan salendro, `gamelan_sekaten` — gamelan sekaten, `gamelan_selunding` — gamelan selunding, `gamelan_semar_pegulingan` — gamelan semar pegulingan, `gamelan_siteran` — gamelan siteran, `gamelan_surakarta` — gamelan surakarta, `gangsta_rap` — gangsta rap, `garage_house` — garage house, `garage_psych` — garage psych, `garage_punk` — garage punk, `garage_rock` — garage rock, `garage_rock_revival` — garage rock revival, `garba` — garba, `geek_rock` — geek rock, `genge` — genge, `gengetone` — gengetone, `ghazal` — ghazal, `ghetto_funk` — ghetto funk, `ghetto_house` — ghetto house, `ghettotech` — ghettotech, `ginan` — ginan, `glam` — glam, `glam_metal` — glam metal, `glam_punk` — glam punk, `glam_rock` — glam rock, `glitch` — glitch, `glitch_hop` — glitch hop, `glitch_hop_edm` — glitch hop edm, `glitch_pop` — glitch pop, `gnawa` — gnawa, `go_go` — go-go, `goa_trance` — goa trance, `gommance` — gommance, `gondang` — gondang, `goombay` — goombay, `goregrind` — goregrind, `gorenoise` — gorenoise, `gospel` — gospel, `gospel_house` — gospel house, `gospel_hymn` — gospel hymn, `gospel_reggae` — gospel reggae, `gothic` — gothic, `gothic_country` — gothic country, `gothic_metal` — gothic metal, `gothic_rock` — gothic rock, `gqom` — gqom, `grand_opera` — grand opera, `graphical_sound` — graphical sound, `grebo` — grebo, `gregorian_chant` — gregorian chant, `grime` — grime, `grindcore` — grindcore, `griot` — griot, `groove_metal` — groove metal, `group_sounds` — group sounds, `grunge` — grunge, `grupera` — grupera, `gstanzl` — gstanzl, `guaguanco` — guaguancó, `guajira` — guajira, `guangdong_yinyue` — guangdong yinyue, `guaracha` — guaracha, `guaracha_edm` — guaracha edm, `guaracha_santiaguena` — guaracha santiagueña, `guarania` — guarania, `guayla` — guayla, `gufeng` — gufeng, `guggenmusik` — guggenmusik, `guided_meditation` — guided meditation, `guitarrada` — guitarrada, `gumbe` — gumbe, `guoyue` — guoyue, `gwo_ka` — gwo ka, `gypsy_jazz` — gypsy jazz, `gypsy_punk` — gypsy punk, `genero_chico` — género chico, `genero_grande` — género grande, `g_ana` — għana, `habanera` — habanera, `haitian_vodou_drumming` — haitian vodou drumming, `halftime` — halftime, `hambo` — hambo, `hamburger_schule` — hamburger schule, `hands_up` — hands up, `hanmai` — hanmai, `haozi` — haozi, `hapa_haole` — hapa haole, `happy_hardcore` — happy hardcore, `harana` — harana, `harawi` — harawi, `hard_beat` — hard beat, `hard_bop` — hard bop, `hard_drum` — hard drum, `hard_house` — hard house, `hard_nrg` — hard nrg, `hard_renaissance` — hard renaissance, `hard_rock` — hard rock, `hard_techno` — hard techno, `hard_trance` — hard trance, `hard_trap` — hard trap, `hardbag` — hardbag, `hardbass` — hardbass, `hardcore_breaks` — hardcore breaks, `hardcore_hip_hop` — hardcore hip hop, `hardcore_punk` — hardcore punk, `hardcore_techno` — hardcore techno, `hardgroove_techno` — hardgroove techno, `hardstep` — hardstep, `hardstyle` — hardstyle, `hardtekk` — hardtekk, `hardvapour` — hardvapour, `hardwave` — hardwave, `harsh_noise` — harsh noise, `harsh_noise_wall` — harsh noise wall, `hauntology` — hauntology, `heartland_rock` — heartland rock, `heaven_trap` — heaven trap, `heavy_metal` — heavy metal, `heavy_psych` — heavy psych, `heikyoku` — heikyoku, `henan_opera` — henan opera, `hexd` — hexd, `hi_nrg` — hi-nrg, `hi_tech` — hi-tech, `hi_tech_full_on` — hi-tech full-on, `highlife` — highlife, `hill_country_blues` — hill country blues, `himene_tarava` — himene tarava, `hindustani_classical` — hindustani classical, `hip_hop_soul` — hip hop soul, `hip_house` — hip house, `hipco` — hipco, `hiplife` — hiplife, `holy_minimalism` — holy minimalism, `honky_tonk` — honky tonk, `honkyoku` — honkyoku, `hopepunk` — hopepunk, `hornpipe` — hornpipe, `horror_punk` — horror punk, `horror_synth` — horror synth, `horrorcore` — horrorcore, `hot_rod_music` — hot rod music, `house` — house, `houston_sound` — houston sound, `huapango` — huapango, `huaylarsh` — huaylarsh, `huayno` — huayno, `humppa` — humppa, `hungarian_folk` — hungarian folk, `hyangak` — hyangak, `hybrid_trap` — hybrid trap, `hyper_techno` — hyper techno, `hyperpop` — hyperpop, `hypertechno` — hypertechno, `hyphy` — hyphy, `hypnagogic_pop` — hypnagogic pop, `hat_tuong` — hát tuồng, `iavnana` — iavnana, `idm` — idm, `idol_kayo` — idol kayō, `illbient` — illbient, `impressionism` — impressionism, `impromptu` — impromptu, `indeterminacy` — indeterminacy, `indian_classical` — indian classical, `indian_pop` — indian pop, `indie_folk` — indie folk, `indie_pop` — indie pop, `indie_rock` — indie rock, `indie_surf` — indie surf, `indietronica` — indietronica, `indo_jazz` — indo jazz, `indorock` — indorock, `industrial` — industrial, `industrial_folk_song` — industrial folk song, `industrial_hardcore` — industrial hardcore, `industrial_hip_hop` — industrial hip hop, `industrial_metal` — industrial metal, `industrial_musical` — industrial musical, `industrial_rock` — industrial rock, `industrial_techno` — industrial techno, `instrumental` — instrumental, `instrumental_hip_hop` — instrumental hip hop, `instrumental_jazz` — instrumental jazz, `instrumental_rock` — instrumental rock, `integral_serialism` — integral serialism, `interview` — interview, `iraqi_maqam` — iraqi maqam, `irish_folk` — irish folk, `isa` — isa, `isicathamiya` — isicathamiya, `islamic_modal_music` — islamic modal music, `italo_dance` — italo dance, `italo_house` — italo house, `italo_disco` — italo-disco, `izlan` — izlan, `izvorna_bosanska_muzika` — izvorna bosanska muzika, `j_core` — j-core, `j_euro` — j-euro, `j_pop` — j-pop, `j_rock` — j-rock, `jackin_house` — jackin house, `jaipongan` — jaipongan, `jam_band` — jam band, `jamaican_ska` — jamaican ska, `james_bay_fiddling` — james bay fiddling, `jamgrass` — jamgrass, `jangle_pop` — jangle pop, `japanese_classical` — japanese classical, `javanese_gamelan` — javanese gamelan, `jawaiian` — jawaiian, `jazz_blues` — jazz blues, `jazz_fusion` — jazz fusion, `jazz_guachaca` — jazz guachaca, `jazz_house` — jazz house, `jazz_mugham` — jazz mugham, `jazz_poetry` — jazz poetry, `jazz_pop` — jazz pop, `jazz_rap` — jazz rap, `jazz_rock` — jazz rock, `jazz_funk` — jazz-funk, `jazzstep` — jazzstep, `jeongak` — jeongak, `jerk` — jerk, `jerk_rap` — jerk rap, `jersey_club` — jersey club, `jersey_club_rap` — jersey club rap, `jersey_drill` — jersey drill, `jersey_sound` — jersey sound, `jesus_music` — jesus music, `jiangnan_sizhu` — jiangnan sizhu, `jit` — jit, `jiuta` — jiuta, `joik` — joik, `jongo` — jongo, `joropo` — joropo, `jota` — jota, `jovem_guarda` — jovem guarda, `jubilee` — jubilee, `jug_band` — jug band, `juke` — juke, `jump_blues` — jump blues, `jump_up` — jump up, `jumpstyle` — jumpstyle, `jungle` — jungle, `jungle_dutch` — jungle dutch, `jungle_techno` — jungle techno, `jungle_terror` — jungle terror, `junkanoo` — junkanoo, `jacara` — jácara, `juju` — jùjú, `joruri` — jōruri, `k_pop` — k-pop, `kabarett` — kabarett, `kacapi_suling` — kacapi suling, `kadongo_kamu` — kadongo kamu, `kafi` — kafi, `kagura` — kagura, `kai` — kai, `kakawin` — kakawin, `kalattut` — kalattut, `kalindula` — kalindula, `kalon_ny_fahiny` — kalon'ny fahiny, `kan_ha_diskan` — kan ha diskan, `kaneka` — kaneka, `kankyo_ongaku` — kankyō ongaku, `kantan_chamorrita` — kantan chamorrita, `kanto` — kanto, `kantruem` — kantruem, `kapuka` — kapuka, `kaseko` — kaseko, `kawaii_future_bass` — kawaii future bass, `kawaii_metal` — kawaii metal, `kayokyoku` — kayōkyoku, `kecak` — kecak, `keller_synth` — keller synth, `keroncong` — keroncong, `kete` — kete, `ketuk_tilu` — ketuk tilu, `khrueang_sai` — khrueang sai, `khyal` — khyal, `kidandali` — kidandali, `kidumbak` — kidumbak, `kilapanga` — kilapanga, `kirtan` — kirtan, `kizomba` — kizomba, `klapa` — klapa, `klasik` — klasik, `kleinkunst` — kleinkunst, `klezmer` — klezmer, `kliningan` — kliningan, `konnakol` — konnakol, `kontakion` — kontakion, `koplo` — koplo, `korean_ballad` — korean ballad, `korean_classical` — korean classical, `korean_revolutionary_opera` — korean revolutionary opera, `kouta` — kouta, `krakowiak` — krakowiak, `krautrock` — krautrock, `krushclub` — krushclub, `kreyol_djaz` — kréyol djaz, `kuda_lumping` — kuda lumping, `kuduro` — kuduro, `kujawiak` — kujawiak, `kulintang` — kulintang, `kumi_daiko` — kumi-daiko, `kumiuta` — kumiuta, `kundiman` — kundiman, `kunqu` — kunqu, `kwaito` — kwaito, `kwassa_kwassa` — kwassa kwassa, `kwela` — kwela, `kyivan_chant` — kyivan chant, `konsrock` — könsrock, `laiko` — laiko, `lambada` — lambada, `lando` — landó, `langgam_jawa` — langgam jawa, `latin` — latin, `latin_ballad` — latin ballad, `latin_disco` — latin disco, `latin_funk` — latin funk, `latin_house` — latin house, `latin_jazz` — latin jazz, `latin_pop` — latin pop, `latin_rock` — latin rock, `latin_soul` — latin soul, `lauda` — lauda, `lavani` — lavani, `lecture` — lecture, `leftfield` — leftfield, `lento_violento` — lento violento, `levenslied` — levenslied, `lied` — lied, `liedermacher` — liedermacher, `liquid_funk` — liquid funk, `liquid_riddim` — liquid riddim, `liscio` — liscio, `livetronica` — livetronica, `liwa` — liwa, `lo_fi_hip_hop` — lo-fi hip hop, `lo_fi_house` — lo-fi house, `lolicore` — lolicore, `loner_folk` — loner folk, `loud_kei` — loud kei, `louisiana_blues` — louisiana blues, `lounge` — lounge, `lovers_rock` — lovers rock, `lowend` — lowend, `lowercase` — lowercase, `luk_krung` — luk krung, `luk_thung` — luk thung, `lullaby` — lullaby, `lundu` — lundu, `lute_song` — lute song, `landlermusik` — ländlermusik, `machine_rock` — machine rock, `mad` — mad, `madchester` — madchester, `maddahi` — maddahi, `madrigal` — madrigal, `mafioso_rap` — mafioso rap, `maftirim` — maftirim, `mahori` — mahori, `mahraganat` — mahraganat, `mainstream_rock` — mainstream rock, `makina` — makina, `makossa` — makossa, `malaguena_venezolana` — malagueña venezolana, `malay_gamelan` — malay gamelan, `malhun` — malhun, `mallsoft` — mallsoft, `malouf` — malouf, `maloya` — maloya, `maloya_electronique` — maloya électronique, `maloya_elektrik` — maloya élektrik, `mambo` — mambo, `mambo_chileno` — mambo chileno, `mambo_urbano` — mambo urbano, `mandopop` — mandopop, `manele` — manele, `mangambeu` — mangambeu, `mangue_beat` — mangue beat, `manila_sound` — manila sound, `mantra` — mantra, `manyao` — manyao, `mappila` — mappila, `marabi` — marabi, `maracatu` — maracatu, `march` — march, `marching_band` — marching band, `marchinha` — marchinha, `mariachi` — mariachi, `marinera` — marinera, `marrabenta` — marrabenta, `martial_industrial` — martial industrial, `mashcore` — mashcore, `maskanda` — maskanda, `mass` — mass, `mataali` — mataali, `math_pop` — math pop, `math_rock` — math rock, `mathcore` — mathcore, `maxixe` — maxixe, `mazurka` — mazurka, `mbalax` — mbalax, `mbaqanga` — mbaqanga, `mbole` — mbolé, `mbube` — mbube, `mchiriku` — mchiriku, `medieval` — medieval, `medieval_lyric_poetry` — medieval lyric poetry, `medieval_metal` — medieval metal, `medieval_rock` — medieval rock, `mega_funk` — mega funk, `meiji_shinkyoku` — meiji shinkyoku, `melbourne_bounce` — melbourne bounce, `melodic_bass` — melodic bass, `melodic_black_metal` — melodic black metal, `melodic_death_metal` — melodic death metal, `melodic_dubstep` — melodic dubstep, `melodic_hardcore` — melodic hardcore, `melodic_house` — melodic house, `melodic_metalcore` — melodic metalcore, `melodic_techno` — melodic techno, `melodic_trance` — melodic trance, `memphis_rap` — memphis rap, `mento` — mento, `menzuma` — menzuma, `merecumbe` — merecumbé, `merengue` — merengue, `merengue_tipico` — merengue típico, `merenhouse` — merenhouse, `merequetengue` — merequetengue, `merseybeat` — merseybeat, `metalcore` — metalcore, `meyxana` — meyxana, `mgodro` — mgodro, `miami_bass` — miami bass, `microfunk` — microfunk, `microhouse` — microhouse, `microsound` — microsound, `microtonal_classical` — microtonal classical, `midtempo_bass` — midtempo bass, `midwest_emo` — midwest emo, `miejski_folk` — miejski folk, `military_cadence` — military cadence, `milonga` — milonga, `min_yo` — min'yō, `minatory` — minatory, `mincecore` — mincecore, `minimal_drum_and_bass` — minimal drum and bass, `minimal_synth` — minimal synth, `minimal_techno` — minimal techno, `minimal_wave` — minimal wave, `minimalism` — minimalism, `minneapolis_sound` — minneapolis sound, `minstrelsy` — minstrelsy, `mobb_music` — mobb music, `mod` — mod, `mod_revival` — mod revival, `moda_de_viola` — moda de viola, `modal_jazz` — modal jazz, `modern_blues` — modern blues, `modern_classical` — modern classical, `modern_creative` — modern creative, `modern_hardtek` — modern hardtek, `modern_laiko` — modern laiko, `modinha` — modinha, `moe_song` — moe song, `monodrama` — monodrama, `mood_kayo` — mood kayō, `moogsploitation` — moogsploitation, `moombahcore` — moombahcore, `moombahton` — moombahton, `mor_lam` — mor lam, `mor_lam_sing` — mor lam sing, `morenada` — morenada, `morna` — morna, `moroccan_chaabi` — moroccan chaabi, `motet` — motet, `motown` — motown, `moutya` — moutya, `movimiento_alterado` — movimiento alterado, `mozarabic_chant` — mozarabic chant, `mpb` — mpb, `muak` — muak, `mugham` — mugham, `mugithi` — mugithi, `muineira` — muiñeira, `mulatos` — mulatós, `muliza` — muliza, `murga` — murga, `murga_uruguaya` — murga uruguaya, `musette` — musette, `music_hall` — music hall, `musical` — musical, `musique_concrete` — musique concrète, `musique_concrete_instrumentale` — musique concrète instrumentale, `muzika_mizrahit` — muzika mizrahit, `muzika_yehudit_mekorit` — muzika yehudit mekorit, `muzikat_dika_on` — muzikat dika'on, `muziki_wa_dansi` — muziki wa dansi, `melodie` — mélodie, `meringue` — méringue, `metis_fiddling` — métis fiddling, `musica_cebolla` — música cebolla, `musica_criolla` — música criolla, `musica_de_intervencao` — música de intervenção, `musica_festera` — música festera, `musica_llanera` — música llanera, `musica_tipica_chilena` — música típica chilena, `musiqa_lubnaniyya` — mūsīqā lubnāniyya, `nagauta` — nagauta, `nanguan` — nanguan, `narcocorrido` — narcocorrido, `narodnozabavna_glasba` — narodnozabavna glasba, `nasheed` — nasheed, `nashville_sound` — nashville sound, `native_american_new_age` — native american new age, `nature_sounds` — nature sounds, `natya_sangeet` — natya sangeet, `nederbeat` — nederbeat, `nederpop` — nederpop, `neo_kyma` — neo kyma, `neo_rave` — neo rave, `neo_soul` — neo soul, `neo_acoustic` — neo-acoustic, `neo_bop` — neo-bop, `neo_city_pop` — neo-city pop, `neo_grime` — neo-grime, `neo_medieval_folk` — neo-medieval folk, `neo_progressive_rock` — neo-progressive rock, `neo_psychedelia` — neo-psychedelia, `neo_rockabilly` — neo-rockabilly, `neo_traditional_country` — neo-traditional country, `neoclassical_dark_wave` — neoclassical dark wave, `neoclassical_metal` — neoclassical metal, `neoclassical_new_age` — neoclassical new age, `neoclassicism` — neoclassicism, `neocrust` — neocrust, `neofolk` — neofolk, `neofolklore` — neofolklore, `neon_pop_punk` — neon pop punk, `neoperreo` — neoperreo, `neoromanticism` — neoromanticism, `nepali_lok_geet` — nepali lok geet, `nerdcore` — nerdcore, `nerdcore_techno` — nerdcore techno, `neue_deutsche_harte` — neue deutsche härte, `neue_deutsche_todeskunst` — neue deutsche todeskunst, `neue_deutsche_welle` — neue deutsche welle, `neurofunk` — neurofunk, `neurohop` — neurohop, `new_age` — new age, `new_beat` — new beat, `new_complexity` — new complexity, `new_jack_swing` — new jack swing, `new_jazz` — new jazz, `new_mexico_music` — new mexico music, `new_orleans_blues` — new orleans blues, `new_orleans_r_b` — new orleans r&b, `new_rave` — new rave, `new_romantic` — new romantic, `new_wave` — new wave, `new_york_drill` — new york drill, `ngoma` — ngoma, `ngam_tho` — ngâm thơ, `nhac_tien_chien` — nhạc tiền chiến, `nhac_vang` — nhạc vàng, `nhac_o` — nhạc đỏ, `night_full_on` — night full-on, `nightcore` — nightcore, `nigun` — nigun, `nintendocore` — nintendocore, `nitzhonot` — nitzhonot, `njuup` — njuup, `no_melody_trap` — no melody trap, `no_wave` — no wave, `nocturne` — nocturne, `noh` — noh, `noiadance` — noiadance, `noise` — noise, `noise_pop` — noise pop, `noise_rock` — noise rock, `noisecore` — noisecore, `noisegrind` — noisegrind, `non_music` — non-music, `nortec` — nortec, `norteno` — norteño, `northern_soul` — northern soul, `nouveau_zydeco` — nouveau zydeco, `nova_canco` — nova cançó, `novelty_piano` — novelty piano, `novo_dub` — novo dub, `nu_disco` — nu disco, `nu_jazz` — nu jazz, `nu_metal` — nu metal, `nu_skool_breaks` — nu skool breaks, `nu_style_gabber` — nu style gabber, `nueva_cancion` — nueva canción, `nueva_cancion_chilena` — nueva canción chilena, `nueva_cancion_espanola` — nueva canción española, `nueva_cumbia_chilena` — nueva cumbia chilena, `nueva_trova` — nueva trova, `nuevo_cancionero` — nuevo cancionero, `nuevo_flamenco` — nuevo flamenco, `nuevo_tango` — nuevo tango, `nustyle` — nustyle, `nwobhm` — nwobhm, `nyu_myujikku` — nyū myūjikku, `neo_trad` — néo-trad, `nota` — nóta, `oberek` — oberek, `occult_rock` — occult rock, `odissi_classical` — odissi classical, `ogene_music` — ogene music, `oi` — oi, `old_roman_chant` — old roman chant, `old_school_death_metal` — old school death metal, `old_school_hip_hop` — old school hip hop, `old_time` — old-time, `omutibo` — omutibo, `onda_nueva` — onda nueva, `ondo` — ondō, `onkyo` — onkyo, `opera` — opera, `opera_buffa` — opera buffa, `opera_semiseria` — opera semiseria, `opera_seria` — opera seria, `opera_ballet` — opera-ballet, `operatic_pop` — operatic pop, `operetta` — operetta, `opm` — opm, `opera_comique` — opéra comique, `oratorio` — oratorio, `orchestral` — orchestral, `orchestral_jazz` — orchestral jazz, `orchestral_song` — orchestral song, `organic_house` — organic house, `ori_deck` — ori deck, `oriental_ballad` — oriental ballad, `orkes_gambus` — orkes gambus, `orthodox_pop` — orthodox pop, `outlaw_country` — outlaw country, `outrun` — outrun, `outsider_house` — outsider house, `overture` — overture, `p_funk` — p-funk, `pachanga` — pachanga, `pacific_reggae` — pacific reggae, `pagan_black_metal` — pagan black metal, `pagan_folk` — pagan folk, `paghjella` — paghjella, `pagode` — pagode, `pagode_romantico` — pagode romântico, `pagodao` — pagodão, `paisley_underground` — paisley underground, `palingsound` — palingsound, `palm_wine` — palm-wine, `palo_de_mayo` — palo de mayo, `pandilla` — pandilla, `pansori` — pansori, `paramaribop` — paramaribop, `parang` — parang, `parlour_music` — parlour music, `partido_alto` — partido alto, `partyschlager` — partyschlager, `pasillo` — pasillo, `pasodoble` — pasodoble, `passion_setting` — passion setting, `payada` — payada, `peak_time_techno` — peak time techno, `pep_band` — pep band, `persian_classical` — persian classical, `persian_pop` — persian pop, `philly_club` — philly club, `philly_club_rap` — philly club rap, `philly_drill` — philly drill, `philly_soul` — philly soul, `phleng_phuea_chiwit` — phleng phuea chiwit, `phonk` — phonk, `phonk_house` — phonk house, `piano_blues` — piano blues, `piano_rock` — piano rock, `picopop` — picopop, `piedmont_blues` — piedmont blues, `pigfuck` — pigfuck, `pilon` — pilón, `pimba` — pimba, `pinpeat` — pinpeat, `piosenka_aktorska` — piosenka aktorska, `pipe_band_music` — pipe band music, `piphat` — piphat, `pirekua` — pirekua, `piseiro` — piseiro, `piyyut` — piyyut, `pizzica` — pizzica, `plainchant` — plainchant, `plena` — plena, `plugg` — plugg, `pluggnb` — pluggnb, `plunderphonics` — plunderphonics, `poetry` — poetry, `polca_criolla` — polca criolla, `polifonia_occitana` — polifonia occitana, `political_hip_hop` — political hip hop, `polka` — polka, `polka_paraguaya` — polka paraguaya, `polonaise` — polonaise, `pon_chak_disco` — pon-chak disco, `pop_ghazal` — pop ghazal, `pop_kreatif` — pop kreatif, `pop_metal` — pop metal, `pop_minang` — pop minang, `pop_punk` — pop punk, `pop_rap` — pop rap, `pop_rai` — pop raï, `pop_rock` — pop rock, `pop_screamo` — pop screamo, `pop_soul` — pop soul, `pop_yeh_yeh` — pop yeh-yeh, `porn_groove` — porn groove, `pornogrind` — pornogrind, `porro` — porro, `post_bop` — post-bop, `post_britpop` — post-britpop, `post_classical` — post-classical, `post_dubstep` — post-dubstep, `post_grunge` — post-grunge, `post_hardcore` — post-hardcore, `post_industrial` — post-industrial, `post_metal` — post-metal, `post_minimalism` — post-minimalism, `post_punk` — post-punk, `post_punk_revival` — post-punk revival, `post_rock` — post-rock, `powada` — powada, `power_electronics` — power electronics, `power_metal` — power metal, `power_noise` — power noise, `power_pop` — power pop, `power_soca` — power soca, `powerstomp` — powerstomp, `powerviolence` — powerviolence, `praise_worship` — praise & worship, `praise_break` — praise break, `prank_calls` — prank calls, `prelude` — prelude, `process_music` — process music, `production_music` — production music, `progressive` — progressive, `progressive_bluegrass` — progressive bluegrass, `progressive_breaks` — progressive breaks, `progressive_country` — progressive country, `progressive_electronic` — progressive electronic, `progressive_folk` — progressive folk, `progressive_house` — progressive house, `progressive_metal` — progressive metal, `progressive_metalcore` — progressive metalcore, `progressive_pop` — progressive pop, `progressive_psytrance` — progressive psytrance, `progressive_rock` — progressive rock, `progressive_soul` — progressive soul, `progressive_trance` — progressive trance, `proto_punk` — proto-punk, `psichedelia_occulta_italiana` — psichedelia occulta italiana, `psybient` — psybient, `psybreaks` — psybreaks, `psychedelic` — psychedelic, `psychedelic_folk` — psychedelic folk, `psychedelic_pop` — psychedelic pop, `psychedelic_rock` — psychedelic rock, `psychedelic_soul` — psychedelic soul, `psychobilly` — psychobilly, `psychploitation` — psychploitation, `psycore` — psycore, `psystyle` — psystyle, `psytrance` — psytrance, `pub_rock` — pub rock, `puirt_a_beul` — puirt à beul, `pumpcore` — pumpcore, `pungmul` — pungmul, `punk` — punk, `punk_blues` — punk blues, `punk_poetry` — punk poetry, `punk_rap` — punk rap, `punk_rock` — punk rock, `punta` — punta, `punto` — punto, `purple_sound` — purple sound, `puxa` — puxa, `pasztordal` — pásztordal, `piobaireachd` — pìobaireachd, `q_pop` — q-pop, `qaraami` — qaraami, `qasidah_modern` — qasidah modern, `qawwali` — qawwali, `quan_ho` — quan họ, `queercore` — queercore, `quiet_storm` — quiet storm, `quyi` — quyi, `r_b` — r&b, `rabbit_song` — rabbit song, `rabiz` — rabiz, `raga_rock` — raga rock, `rage` — rage, `ragga` — ragga, `ragga_hip_hop` — ragga hip-hop, `ragga_jungle` — ragga jungle, `raggacore` — raggacore, `raggatek` — raggatek, `ragtime` — ragtime, `ragtime_song` — ragtime song, `rain_sounds` — rain sounds, `ranchera` — ranchera, `rap_metal` — rap metal, `rap_rock` — rap rock, `rapcore` — rapcore, `rapso` — rapso, `raqs_baladi` — raqs baladi, `rara` — rara, `rasin` — rasin, `rasqueado_cuiabano` — rasqueado cuiabano, `rasteirinha` — rasteirinha, `ratchet_music` — ratchet music, `rautalanka` — rautalanka, `rave` — rave, `raw_punk` — raw punk, `rawphoric` — rawphoric, `rawstyle` — rawstyle, `rai` — raï, `rebetiko` — rebetiko, `red_dirt` — red dirt, `red_disco` — red disco, `red_song` — red song, `reductionism` — reductionism, `regalia` — regalia, `reggae` — reggae, `reggae_rock` — reggae rock, `reggae_pop` — reggae-pop, `reggaeton` — reggaeton, `regional_mexicano` — regional mexicano, `renaissance` — renaissance, `reparto` — reparto, `repente` — repente, `requiem` — requiem, `revue` — revue, `rhumba` — rhumba, `ricercar` — ricercar, `riddim_dubstep` — riddim dubstep, `rigsar` — rigsar, `ring_shout` — ring shout, `riot_grrrl` — riot grrrl, `ripsaw` — ripsaw, `ritmada` — ritmada, `ritual_ambient` — ritual ambient, `rizitika` — rizitika, `rkt` — rkt, `rock` — rock, `rock_and_roll` — rock and roll, `rock_andaluz` — rock andaluz, `rock_andino` — rock andino, `rock_kapak` — rock kapak, `rock_musical` — rock musical, `rock_opera` — rock opera, `rock_rural` — rock rural, `rock_urbano` — rock urbano, `rock_urbano_mexicano` — rock urbano mexicano, `rockabilly` — rockabilly, `rocksteady` — rocksteady, `rom_kbach` — rom kbach, `romanian_popcorn` — romanian popcorn, `romantic_classical` — romantic classical, `romantic_flow` — romantic flow, `romantische_oper` — romantische oper, `rominimal` — rominimal, `roots_reggae` — roots reggae, `roots_rock` — roots rock, `rumba` — rumba, `rumba_catalana` — rumba catalana, `rumba_cubana` — rumba cubana, `rumba_flamenca` — rumba flamenca, `runo_song` — runo song, `russian_chanson` — russian chanson, `russian_orthodox_liturgical_music` — russian orthodox liturgical music, `russian_romance` — russian romance, `rustic_stomp` — rustic stomp, `ryukoka` — ryūkōka, `rokyoku` — rōkyoku, `sa_idi` — sa'idi, `sacred_harp` — sacred harp, `sacred_steel` — sacred steel, `saeta` — saeta, `salegy` — salegy, `salsa` — salsa, `salsa_choke` — salsa choke, `salsa_dura` — salsa dura, `salsa_romantica` — salsa romántica, `saluang_klasik` — saluang klasik, `samba` — samba, `samba_de_breque` — samba de breque, `samba_de_gafieira` — samba de gafieira, `samba_de_roda` — samba de roda, `samba_de_terreiro` — samba de terreiro, `samba_rap` — samba rap, `samba_soul` — samba soul, `samba_cancao` — samba-canção, `samba_choro` — samba-choro, `samba_enredo` — samba-enredo, `samba_exaltacao` — samba-exaltação, `samba_jazz` — samba-jazz, `samba_joia` — samba-joia, `samba_reggae` — samba-reggae, `samba_rock` — samba-rock, `sambalanco` — sambalanço, `sambass` — sambass, `sample_drill` — sample drill, `sampledelia` — sampledelia, `samri` — samri, `sanjo` — sanjo, `sante_engage` — santé engagé, `sarala_gee` — sarala gee, `sardana` — sardana, `sarum_chant` — sarum chant, `sasscore` — sasscore, `sawt` — sawt, `saya_afroboliviana` — saya afroboliviana, `scam_rap` — scam rap, `schlager` — schlager, `schottische` — schottische, `schranz` — schranz, `scottish_country_dance_music` — scottish country dance music, `screamo` — screamo, `scrumpy_and_western` — scrumpy and western, `sea_shanty` — sea shanty, `sean_nos` — sean-nós, `seapunk` — seapunk, `seggae` — seggae, `seguidilla` — seguidilla, `seishun_punk` — seishun punk, `semba` — semba, `semi_trot` — semi-trot, `serenade` — serenade, `seresta` — seresta, `serialism` — serialism, `sermon` — sermon, `sertanejo` — sertanejo, `sertanejo_raiz` — sertanejo raiz, `sertanejo_romantico` — sertanejo romântico, `sertanejo_universitario` — sertanejo universitário, `seto_leelo` — seto leelo, `sevdalinka` — sevdalinka, `sevillanas` — sevillanas, `sexy_drill` — sexy drill, `shaabi` — shaabi, `shabad_kirtan` — shabad kirtan, `shan_ge` — shan'ge, `shangaan_electro` — shangaan electro, `shanto` — shanto, `shashmaqam` — shashmaqam, `shatta` — shatta, `shibuya_kei` — shibuya-kei, `shidaiqu` — shidaiqu, `shima_uta` — shima-uta, `shinkyoku` — shinkyoku, `shitgaze` — shitgaze, `shoegaze` — shoegaze, `shoor` — shoor, `shomyo` — shōmyō, `sichuan_opera` — sichuan opera, `sierreno` — sierreño, `sigidrigi` — sigidrigi, `sigilkore` — sigilkore, `sinawi` — sinawi, `sinfonia_concertante` — sinfonia concertante, `singeli` — singeli, `singer_songwriter` — singer-songwriter, `singspiel` — singspiel, `sissy_bounce` — sissy bounce, `sitarsploitation` — sitarsploitation, `sizhu_music` — sizhu music, `ska` — ska, `ska_punk` — ska punk, `skacore` — skacore, `skate_punk` — skate punk, `sketch_comedy` — sketch comedy, `skiffle` — skiffle, `skiladiko` — skiladiko, `skinhead_reggae` — skinhead reggae, `skullstep` — skullstep, `skweee` — skweee, `slack_key_guitar` — slack-key guitar, `slacker_rock` — slacker rock, `slam_death_metal` — slam death metal, `slam_poetry` — slam poetry, `slap_house` — slap house, `sleaze_rock` — sleaze rock, `slimepunk` — slimepunk, `slow_waltz` — slow waltz, `slowcore` — slowcore, `slowed_reverb` — slowed & reverb, `sludge_metal` — sludge metal, `slushwave` — slushwave, `smooth_jazz` — smooth jazz, `smooth_soul` — smooth soul, `snap` — snap, `soca` — soca, `soft_rock` — soft rock, `soft_visual` — soft visual, `son_calentano` — son calentano, `son_cubano` — son cubano, `son_de_pascua` — son de pascua, `son_huasteco` — son huasteco, `son_istmeno` — son istmeño, `son_jarocho` — son jarocho, `son_montuno` — son montuno, `son_nica` — son nica, `sonata` — sonata, `songo` — songo, `sonorism` — sonorism, `sophisti_pop` — sophisti-pop, `soukous` — soukous, `soul` — soul, `soul_blues` — soul blues, `soul_jazz` — soul jazz, `sound_art` — sound art, `sound_collage` — sound collage, `sound_effects` — sound effects, `sound_poetry` — sound poetry, `southeast_asian_classical` — southeast asian classical, `southern_gospel` — southern gospel, `southern_hip_hop` — southern hip hop, `southern_metal` — southern metal, `southern_rock` — southern rock, `southern_soul` — southern soul, `sovietwave` — sovietwave, `space_age_pop` — space age pop, `space_ambient` — space ambient, `space_disco` — space disco, `space_rock` — space rock, `space_rock_revival` — space rock revival, `spacesynth` — spacesynth, `spamwave` — spamwave, `spectralism` — spectralism, `speech` — speech, `speed_garage` — speed garage, `speed_house` — speed house, `speed_metal` — speed metal, `speedcore` — speedcore, `spiritual_art_song` — spiritual art song, `spiritual_jazz` — spiritual jazz, `spirituals` — spirituals, `splittercore` — splittercore, `spoken_word` — spoken word, `spouge` — spouge, `standup_comedy` — standup comedy, `staifi` — staïfi, `steampunk` — steampunk, `steel_band` — steel band, `stenchcore` — stenchcore, `sticheron` — sticheron, `stochastic_music` — stochastic music, `stomp_and_holler` — stomp and holler, `stoner_metal` — stoner metal, `stoner_rap` — stoner rap, `stoner_rock` — stoner rock, `stornello` — stornello, `street_punk` — street punk, `stride` — stride, `string_quartet` — string quartet, `stutter_house` — stutter house, `sufi_rock` — sufi rock, `sufiana_kalam` — sufiana kalam, `sundanese_pop` — sundanese pop, `sungura` — sungura, `sunshine_pop` — sunshine pop, `suomisaundi` — suomisaundi, `surf` — surf, `surf_punk` — surf punk, `surf_rock` — surf rock, `sutartines` — sutartinės, `swamp_blues` — swamp blues, `swamp_pop` — swamp pop, `swamp_rock` — swamp rock, `swancore` — swancore, `sweet_jazz` — sweet jazz, `swing` — swing, `swing_revival` — swing revival, `symphonic_black_metal` — symphonic black metal, `symphonic_metal` — symphonic metal, `symphonic_mugham` — symphonic mugham, `symphonic_poem` — symphonic poem, `symphonic_prog` — symphonic prog, `symphonic_rock` — symphonic rock, `symphony` — symphony, `synth_funk` — synth funk, `synth_pop` — synth-pop, `synthwave` — synthwave, `sega` — séga, `sega_tambour` — séga tambour, `sokyoku` — sōkyoku, `t_pop` — t-pop, `taarab` — taarab, `tajaraste` — tajaraste, `takamba` — takamba, `talempong` — talempong, `talempong_goyang` — talempong goyang, `talking_blues` — talking blues, `tallava` — tallava, `tamborera` — tamborera, `tamborito` — tamborito, `tamborzao` — tamborzão, `tammurriata` — tammurriata, `tango` — tango, `tanjidor` — tanjidor, `taoist_ritual_music` — taoist ritual music, `tape_music` — tape music, `tappa` — tappa, `taquirari` — taquirari, `tarana` — tarana, `tarantella` — tarantella, `tarawangsa` — tarawangsa, `tarraxinha` — tarraxinha, `tassa` — tassa, `tassu` — tassu, `tbm` — tbm, `tchinkoume` — tchinkoumé, `tearout` — tearout, `tearout_brostep` — tearout brostep, `tech_house` — tech house, `tech_trance` — tech trance, `technical_death_metal` — technical death metal, `technical_thrash_metal` — technical thrash metal, `techno` — techno, `techno_bass` — techno bass, `techno_kayo` — techno kayō, `technobanda` — technobanda, `technoid` — technoid, `techstep` — techstep, `tecnobrega` — tecnobrega, `tecnofunk` — tecnofunk, `tecnomerengue` — tecnomerengue, `tecnorumba` — tecnorumba, `teen_pop` — teen pop, `tejano` — tejano, `tembang_cianjuran` — tembang cianjuran, `terror_plugg` — terror plugg, `terrorcore` — terrorcore, `tex_mex` — tex-mex, `texas_blues` — texas blues, `texas_country` — texas country, `thai_classical` — thai classical, `thall` — thall, `theme_and_variations` — theme and variations, `third_stream` — third stream, `third_wave_ska` — third wave ska, `thrash_metal` — thrash metal, `thrashcore` — thrashcore, `thumri` — thumri, `tibetan_buddhist_chant` — tibetan buddhist chant, `tiento` — tiento, `timba` — timba, `timbila` — timbila, `tin_pan_alley` — tin pan alley, `tivaner_inngernerlu` — tivaner inngernerlu, `tizita` — tizita, `toada_de_boi` — toada de boi, `toccata` — toccata, `tonada_asturiana` — tonada asturiana, `tonada_potosina` — tonada potosina, `tonadilla` — tonadilla, `tondero` — tondero, `tontipop` — tontipop, `totalism` — totalism, `tough_guy_hardcore` — tough guy hardcore, `township_bubblegum` — township bubblegum, `township_jive` — township jive, `toypop` — toypop, `toytown_pop` — toytown pop, `toytown_techno` — toytown techno, `tradi_moderne_congolais` — tradi-moderne congolais, `tradi_moderne_ivoirien` — tradi-moderne ivoirien, `traditional_black_gospel` — traditional black gospel, `traditional_bluegrass` — traditional bluegrass, `traditional_country` — traditional country, `traditional_doom_metal` — traditional doom metal, `traditional_pop` — traditional pop, `traditional_sega` — traditional séga, `tragedie_en_musique` — tragédie en musique, `trallalero` — trallalero, `trampska_hudba` — trampská hudba, `trance` — trance, `trance_2_0` — trance 2.0, `trance_metal` — trance metal, `trancestep` — trancestep, `trap` — trap, `trap_dancehall` — trap dancehall, `trap_edm` — trap edm, `trap_latino` — trap latino, `trap_metal` — trap metal, `trap_shaabi` — trap shaabi, `trap_soul` — trap soul, `trapfunk` — trapfunk, `tread` — tread, `tribal_ambient` — tribal ambient, `tribal_guarachero` — tribal guarachero, `tribal_house` — tribal house, `trikitixa` — trikitixa, `trip_hop` — trip hop, `troparion` — troparion, `tropical_house` — tropical house, `tropical_rock` — tropical rock, `tropicanibalismo` — tropicanibalismo, `tropicalia` — tropicália, `tropipop` — tropipop, `trot` — trot, `trova` — trova, `trova_yucateca` — trova yucateca, `truck_driving_country` — truck driving country, `tsapiky` — tsapiky, `tsonga_disco` — tsonga disco, `tsugaru_jamisen` — tsugaru-jamisen, `tumba` — tumba, `tumba_francesa` — tumba francesa, `tumbele` — tumbélé, `turbo_folk` — turbo-folk, `turkish_classical` — turkish classical, `turkish_folk` — turkish folk, `turkish_pop` — turkish pop, `turntablism` — turntablism, `twee_pop` — twee pop, `twerk` — twerk, `twoubadou` — twoubadou, `tan_co_giao_duyen` — tân cổ giao duyên, `uaajeerneq` — uaajeerneq, `udigrudi` — udigrudi, `uk_drill` — uk drill, `uk_funky` — uk funky, `uk_garage` — uk garage, `uk_hardcore` — uk hardcore, `uk_jackin` — uk jackin, `uk_street_soul` — uk street soul, `uk82` — uk82, `unakesa` — unakesa, `underground_hip_hop` — underground hip hop, `unyago` — unyago, `upopo` — upopo, `uptempo_hardcore` — uptempo hardcore, `urban_contemporary_gospel` — urban contemporary gospel, `urban_cowboy` — urban cowboy, `urtiin_duu` — urtiin duu, `urumi_melam` — urumi melam, `us_power_metal` — us power metal, `utopian_virtual` — utopian virtual, `uyghur_muqam` — uyghur muqam, `uzun_hava` — uzun hava, `v_pop` — v-pop, `vaigat` — vaigat, `valaam_chant` — valaam chant, `vallenato` — vallenato, `vals_criollo` — vals criollo, `vals_venezolano` — vals venezolano, `valsa_brasileira` — valsa brasileira, `vanera` — vanera, `vapornoise` — vapornoise, `vaportrap` — vaportrap, `vaporwave` — vaporwave, `vaudeville` — vaudeville, `vaudeville_blues` — vaudeville blues, `vedic_chant` — vedic chant, `verbunkos` — verbunkos, `verismo` — verismo, `vietnamese_bolero` — vietnamese bolero, `vietnamese_classical` — vietnamese classical, `viking_metal` — viking metal, `viking_rock` — viking rock, `villancico` — villancico, `vinahouse` — vinahouse, `visa` — visa, `visual_kei` — visual kei, `vocal_house` — vocal house, `vocal_jazz` — vocal jazz, `vocal_surf` — vocal surf, `vocal_trance` — vocal trance, `vocalese` — vocalese, `volkstumliche_musik` — volkstümliche musik, `vude` — vude, `wa_euro` — wa euro, `waila` — waila, `waka` — waka, `waltz` — waltz, `wangga` — wangga, `war_metal` — war metal, `wassoulou` — wassoulou, `waulking_song` — waulking song, `wave` — wave, `weightless` — weightless, `west_coast_breaks` — west coast breaks, `west_coast_hip_hop` — west coast hip hop, `west_coast_swing` — west coast swing, `western` — western, `western_classical` — western classical, `western_swing` — western swing, `whale_song` — whale song, `whistling` — whistling, `white_voice` — white voice, `winter_synth` — winter synth, `witch_house` — witch house, `wong_shadow` — wong shadow, `wonky` — wonky, `wonky_techno` — wonky techno, `work_song` — work song, `world_fusion` — world fusion, `worldbeat` — worldbeat, `wyrd_folk` — wyrd folk, `xaxado` — xaxado, `xian_psych` — xian psych, `xote` — xote, `xtra_raw` — xtra raw, `xuc` — xuc, `xam` — xẩm, `yacht_rock` — yacht rock, `yakousei` — yakousei, `yangzhou_opera` — yangzhou opera, `yanyue` — yanyue, `yaravi` — yaraví, `yayue` — yayue, `yodeling` — yodeling, `ytpmv` — ytpmv, `yu_mex` — yu-mex, `yue_opera` — yue opera, `yukar` — yukar, `ye_ye` — yé-yé, `zamacueca` — zamacueca, `zamba` — zamba, `zamrock` — zamrock, `zarzuela` — zarzuela, `zarzuela_barroca` — zarzuela barroca, `zeitoper` — zeitoper, `zema` — zema, `zemirot` — zemirot, `zenonesque` — zenonesque, `zess` — zess, `zeuhl` — zeuhl, `zeybek` — zeybek, `zhongguo_feng` — zhongguo feng, `ziglibithy` — ziglibithy, `zinli` — zinli, `znamenny_chant` — znamenny chant, `zoblazo` — zoblazo, `zohioliin_duu` — zohioliin duu, `zolo` — zolo, `zouglou` — zouglou, `zouk` — zouk, `zouk_love` — zouk love, `zydeco` — zydeco, `entekhno` — éntekhno, `etude` — étude, `ozgun_muzik` — özgün müzik, `calgija` — čalgija, `ote_a` — ʻōteʻa

- **`eras`** — Era / Stylistic Timeframe (chips)  
  control `multi-select` · binding **`prose`** · imported from `generate_music_hybrid_model/music_studio/data/era_vocabulary.json` (14 values)
  - default: `[]` — no default era: the guide treats the timeframe as an optional refinement, and imposing one would silently date every track the user did not date
  - constraints: `{"max_selected": 2, "max_selected_evidence": "Google's own construction combines at most one modifier with one decade ('early 90s'), so two selections is the widest shape the source demonstrates"}`
  - value origin: data/era_vocabulary.json - Google's own Lyria 3 prompting guide (2026-04-07, read [FULL] 2026-08-18) instructs 'Reference genres and eras ... stylistic timeframe (e.g. the 1950s, early 90s)'; kept OUT of genres because AcousticBrainz taxonomy practice strips era tokens from genre lists (research contradiction CT-8, resolved by giving era its own axis)
  - selectable: `era_1920s` — 1920s, `era_1930s` — 1930s, `era_1940s` — 1940s, `era_1950s` — 1950s, `era_1960s` — 1960s, `era_1970s` — 1970s, `era_1980s` — 1980s, `era_1990s` — 1990s, `era_2000s` — 2000s, `era_2010s` — 2010s, `era_2020s` — 2020s, `era_modifier_early` — Early, `era_modifier_classic` — Classic, `era_modifier_modern` — Modern

- **`moods`** — Mood / Emotion (chips)  
  control `multi-select` · binding **`prose`** · imported from `generate_music_hybrid_model/music_studio/data/mood_vocabulary.json` (114 values)
  - default: `[]` — no default mood; the creative_goal clause already carries one
  - constraints: `{"max_selected": 6}`
  - value origin: data/mood_vocabulary.json - GEMS 9 factors and the GEMIAC extension classes (Coutinho & Scherer, GEneva Music-Induced Affect Checklist preprint, Tables 1-3), Russell's 1980 circumplex reference angles and his 15 text-stated measured word angles with valence/arousal derived from them by the model's own axis definition, and the 29 MIREX Popular Set labels (Hu & Downie, ISMIR 2007, Table 1). Every transcribed string and number is asserted to occur in its archived capture by scripts/build_mood_vocabulary.py, which refuses the whole batch on one mismatch (it caught a real transcription failure on first run). MIREX cluster numbers are deliberately NOT emitted: the capture's table collapsed row-major and the column of the ragged rows is unrecoverable, so assigning them would be invention
  - selectable: `epic` — Epic, `uplifting` — Uplifting, `nostalgic` — Nostalgic, `mysterious` — Mysterious, `hopeful` — Hopeful, `melancholic` — Melancholic, `dark` — Dark, `aggressive` — Aggressive, `energetic` — Energetic, `melancholy` — Melancholy, `peaceful` — Peaceful, `tense_suspenseful` — Tense & Suspenseful, `calm` — Calm, `warm` — Warm, `gentle` — Gentle, `confident` — Confident, `anthemic` — Anthemic, `filled_with_wonder` — Filled with wonder, `enchanted` — Enchanted, `feelings_of_transcendence` — Feelings of transcendence, `inspired` — Inspired, `full_of_tenderness` — Full of tenderness, `warmhearted` — Warmhearted, `dreamy` — Dreamy, `sentimental` — Sentimental, `relaxed` — Relaxed, `soothed` — Soothed, `powerful` — Powerful, `strong` — Strong, `lively` — Lively, `joyful` — Joyful, `wanting_to_dance` — Wanting to dance, `tense` — Tense, `nervous` — Nervous, `aroused` — Aroused, `agitated` — Agitated, `sad` — Sad, `gloomy` — Gloomy, `feelings_of_harmony` — Feelings of harmony, `feelings_of_beauty` — Feelings of beauty, `interested` — Interested, `discovering_novelty` — Discovering novelty, `insight` — Insight, `moved` — Moved, `touched` — Touched, `indifferent` — Indifferent, `bored` — Bored, `passionate` — Passionate, `enthusiastic` — Enthusiastic, `in_awe` — In awe, `apprehensive` — Apprehensive, `uneasy` — Uneasy, `astonished` — Astonished, `amazed` — Amazed, `irritated` — Irritated, `angry` — Angry, `filled_with_wonder_amazed` — Filled with wonder, amazed, `moved_touched` — Moved, touched, `enchanted_in_awe` — Enchanted, in awe, `inspired_enthusiastic` — Inspired, enthusiastic, `energetic_lively` — Energetic, lively, `joyful_wanting_to_dance` — Joyful, wanting to dance, `powerful_strong` — Powerful, strong, `full_of_tenderness_warmhearted` — Full of tenderness, warmhearted, `relaxed_peaceful` — Relaxed, peaceful, `melancholic_sad` — Melancholic, sad, `nostalgic_sentimental` — Nostalgic, sentimental, `indifferent_bored` — Indifferent, bored, `tense_uneasy` — Tense, uneasy, `agitated_aggressive` — Agitated, aggressive, `pleasure` — Pleasure, `excitement` — Excitement, `arousal` — Arousal, `distress` — Distress, `misery` — Misery, `depression` — Depression, `sleepiness` — Sleepiness, `contentment` — Contentment, `happy` — Happy, `delighted` — Delighted, `excited` — Excited, `alarmed` — Alarmed, `miserable` — Miserable, `droopy` — Droopy, `tired` — Tired, `sleepy` — Sleepy, `serene` — Serene, `pleased` — Pleased, `rowdy` — Rowdy, `literate` — Literate, `witty` — Witty, `volatile` — Volatile, `rousing` — Rousing, `amiable_good_natured` — Amiable/ Good natured, `wistful` — Wistful, `humorous` — Humorous, `fiery` — Fiery, `sweet` — Sweet, `bittersweet` — Bittersweet, `whimsical` — Whimsical, `visceral` — Visceral, `boisterous` — Boisterous, `fun` — Fun, `autumnal` — Autumnal, `wry` — Wry, `rollicking` — Rollicking, `brooding` — Brooding, `campy` — Campy, `tense_anxious` — Tense/anxious, `cheerful` — Cheerful, `poignant` — Poignant, `quirky` — Quirky, `intense` — Intense, `silly` — Silly

- **`prompt_blocks`** — Prompt Presets / Blocks (8 reusable blocks)  
  control `chips` · binding **`prose`** · free text (no closed value set)
  - default: `[]` — png shows 8 role cards; block text is user-authored
  - value origin: user library (stored per account) + 8 starter blocks visible in the png
    - `role`: one of `hook` — Hook / Main Theme, `texture` — Texture / Atmosphere, `percussion` — Percussion / Groove, `harmony` — Harmony / Chords, `climax` — Climax / Impact, `transition` — Transition / Rise, `bass` — Bass / Low End, `outro` — Outro / Resolve
    - `text`: max_length=280
    - `weight`: min=0.0; max=1.0; step=0.1

#### Panel 2 — Composition, References, Vocal & Lyric (13 parameters)

- **`tempo_bpm`** — Tempo (BPM) + Tap Tempo  
  control `slider` · binding **`prose`** · 8 predefined values
  - default: `120` — png sample is 128; 120 is the neutral midpoint the UI opens on - marked UI-default, not a musical claim
  - constraints: `{"min": 40, "max": 220, "step": 1}`
  - value origin: png shows 128 BPM; slider range 40-220 covers largo to extreme d&b; the combo presets below are the named tempo anchors the UI offers beside the slider; requested value is MEASURED back (beat tracking) and returned in measured.*
  - selectable: `60` — 60 BPM (largo / ballad), `80` — 80 BPM (downtempo), `100` — 100 BPM (mid-tempo), `120` — 120 BPM (house / pop), `128` — 128 BPM (trailer / EDM), `140` — 140 BPM (uptempo), `160` — 160 BPM (drum & bass low), `174` — 174 BPM (drum & bass)

- **`key`** — Key / Scale (C Minor, Aeolian)  
  control `combo` · binding **`prose`** · generated: 12 roots x 9 modes = 108 combinations
  - default: `"C|minor"` — png shows 'C Minor / Aeolian' (minor = aeolian); the wire shape is the generated 'root|mode' id — the id set models.py validates against, so the default is expressible in its own value set (a dict default here would be refused by the endpoint's own validator)
  - value origin: music_theory_canon - closed set: 12 chromatic roots x 2 tonalities + 7 diatonic modes; generated by models.py at load (root x mode product), never hand-enumerated
  - selectable: `C|major`, `C|minor`, `C|ionian`, `C|dorian`, `C|phrygian`, `C|lydian`, `C|mixolydian`, `C|aeolian`, `C|locrian`, `C#|major`, `C#|minor`, `C#|ionian`, `C#|dorian`, `C#|phrygian`, `C#|lydian`, `C#|mixolydian`, `C#|aeolian`, `C#|locrian`, `D|major`, `D|minor`, `D|ionian`, `D|dorian`, `D|phrygian`, `D|lydian`, `D|mixolydian`, `D|aeolian`, `D|locrian`, `D#|major`, `D#|minor`, `D#|ionian`, `D#|dorian`, `D#|phrygian`, `D#|lydian`, `D#|mixolydian`, `D#|aeolian`, `D#|locrian`, `E|major`, `E|minor`, `E|ionian`, `E|dorian`, `E|phrygian`, `E|lydian`, `E|mixolydian`, `E|aeolian`, `E|locrian`, `F|major`, `F|minor`, `F|ionian`, `F|dorian`, `F|phrygian`, `F|lydian`, `F|mixolydian`, `F|aeolian`, `F|locrian`, `F#|major`, `F#|minor`, `F#|ionian`, `F#|dorian`, `F#|phrygian`, `F#|lydian`, `F#|mixolydian`, `F#|aeolian`, `F#|locrian`, `G|major`, `G|minor`, `G|ionian`, `G|dorian`, `G|phrygian`, `G|lydian`, `G|mixolydian`, `G|aeolian`, `G|locrian`, `G#|major`, `G#|minor`, `G#|ionian`, `G#|dorian`, `G#|phrygian`, `G#|lydian`, `G#|mixolydian`, `G#|aeolian`, `G#|locrian`, `A|major`, `A|minor`, `A|ionian`, `A|dorian`, `A|phrygian`, `A|lydian`, `A|mixolydian`, `A|aeolian`, `A|locrian`, `A#|major`, `A#|minor`, `A#|ionian`, `A#|dorian`, `A#|phrygian`, `A#|lydian`, `A#|mixolydian`, `A#|aeolian`, `A#|locrian`, `B|major`, `B|minor`, `B|ionian`, `B|dorian`, `B|phrygian`, `B|lydian`, `B|mixolydian`, `B|aeolian`, `B|locrian`

- **`time_signature`** — Time Signature (4/4)  
  control `combo` · binding **`prose`** · 11 predefined values
  - default: `"4/4"` — png shows 4/4
  - value origin: png (4/4) + turkish_tradition_research axis 7: the aksak additive meters are MANDATORY members - a Western-only list was named an amateurish design in the architecture s3.3
  - selectable: `4/4` — 4/4, `3/4` — 3/4, `6/8` — 6/8, `2/4` — 2/4, `5/4` — 5/4, `7/8` — 7/8 (aksak), `9/8` — 9/8 (aksak), `12/8` — 12/8, `5/8` — 5/8, `7/4` — 7/4, `10/8` — 10/8 (aksak)

- **`duration`** — Duration (02:15 exact)  
  control `combo` · binding **`enforced`** · no value set
  - default: `{"target_seconds": 135, "tolerance_seconds": 2, "on_miss": "trim"}` — png shows 02:15; on_miss=trim because duration is not requestable on lyria-002 (measured 139.26/146.73/159.63 s unasked)
  - value origin: our_stage (generate-measure-conform); Lyria 3 launch names 'duration controls' - if the $0 probe proves a real field, binding upgrades to typed (lyria_launch_probe_pending)
    - `target_seconds`: min=10; max=180; step=1; note=180 s cap = Lyria 3 Pro documented ~3 min ceiling (Google launch blog, read 2026-08-14)
    - `tolerance_seconds`: min=0; max=10; default=2
    - `on_miss`: one of `trim` — Trim to target (musically-aware fade), `regenerate` — Regenerate (costs another pass), `accept` — Accept the delivered length

- **`structure`** — Structure Builder (8 named sections, bars)  
  control `chips` · binding **`compiled`** · no value set
  - default: `[{"section": "intro", "bars": 8}, {"section": "build", "bars": 8}, {"section": "verse", "bars": 16}, {"section": "pre_chorus", "bars": 8}, {"section": "chorus", "bars": 16}, {"section": "bridge", "bars": 8}, {"section": "drop", "bars": 8}, {"section": "outro", "bars": 8}]` — the png's own 8-section example
  - constraints: `{"max_sections": 12}`
  - value origin: png section names + architecture_contract s3.1 (compiled to Lyria [mm:ss] prose + section directives; Lyria 3 Composer mode is lyria_launch_probe_pending - typed if proven)
    - `section`: one of `intro` — Intro, `build` — Build, `verse` — Verse, `pre_chorus` — Pre-Chorus, `chorus` — Chorus, `bridge` — Bridge, `drop` — Drop, `outro` — Outro, `interlude` — Interlude, `solo` — Solo, `breakdown` — Breakdown
    - `bars`: min=1; max=64; step=1

- **`arrangement_ai`** — Arrangement Intelligence (toggle)  
  control `toggle` · binding **`our_stage`** · 2 predefined values
  - **runtime binding (from the planner's own report): `reported_not_compiled`** — suggestion engine not built: 'on' is recorded and returns no suggestions yet; the toggle is honest state, never a silent capability claim
  - default: `true` — png shows the toggle ON
  - value origin: our_stage (Gemini arrangement adviser: proposes structure/energy/instrument edits; every suggestion is a diff the user applies, never a silent change)
  - selectable: `on` — On (suggestions offered as applyable diffs), `off` — Off (no suggestions)

- **`energy_curve`** — Energy Curve (editable envelope)  
  control `envelope` · binding **`compiled`** · no value set
  - **runtime binding (from the planner's own report): `prose`** — preset label prose; stepwise intensity requires points
  - default: `{"preset": "cinematic"}` — png dropdown shows 'Cinematic'
  - value origin: architecture_contract s3.1: sampled at structure boundaries, compiled to per-section intensity directives; binding returned as compiled_stepwise (honest about not being continuous inside a section)
    - `preset`: one of `cinematic` — Cinematic (slow rise, chorus peak, warm resolve), `linear_rise` — Linear rise, `double_peak` — Double peak, `front_loaded` — Front-loaded, `valley` — Valley (quiet middle), `flat` — Flat, `custom` — Custom (edit points)
    - `points`

- **`instruments`** — Instrument Palette (6 + Add)  
  control `multi-select` · binding **`prose`** · imported from `generate_music_hybrid_model/music_studio/data/instrument_vocabulary.json` (1057 values)
  - default: `["strings_ensemble", "brass_section", "hybrid_drums", "percussion_timpani", "synth_atmos", "choir_ahh"]` — the png's six visible tiles
  - constraints: `{"max_selected": 12}`
  - value origin: data/instrument_vocabulary.json - VALUE SET from MusicBrainz instrument entities (CC0 core data; commercial use allowed per https://metabrainz.org/datasets/postgres-dumps), reconciled 2026-08-18 between the web service and the browse list (1046 entities = 806 matched + 227 repaired by individual lookup + 13 service-only, with 15 browse rows PROVEN not to be entities). Each entry carries MusicBrainz's own `type` as the UI grouping axis and capability UNPROVEN, because per-instrument rendering quality on the Google routes is unmeasured. General MIDI was REJECTED as the spine for a licence reason, not a quality one: MMA0007/RP003 states 'ALL RIGHTS RESERVED. NO PART OF THIS DOCUMENT MAY BE REPRODUCED' (D-SSM-35). The png's six tiles and the research corpus tags remain as their own earlier sourced groups
  - selectable: `strings_ensemble` — Strings Ensemble, `brass_section` — Brass Section, `hybrid_drums` — Hybrid Drums, `percussion_timpani` — Percussion / Timpani, `synth_atmos` — Synth Atmos, `choir_ahh` — Choir 'Ahh', `piano` — Piano, `synthesizer` — Synthesizer, `acoustic_guitar` — Acoustic Guitar, `string_orchestra` — String Orchestra, `electronic_drums` — Electronic Drums, `nylon_guitar` — Nylon Guitar, `bass_guitar` — Bass Guitar, `rising_synth` — Rising Synth, `baglama_saz` — Bağlama / Saz, `ney` — Ney, `darbuka` — Darbuka, `12_string_guitar` — 12 string guitar, `17_string_bass_koto` — 17-string bass koto, `anglo_concertina` — Anglo concertina, `appalachian_dulcimer` — Appalachian dulcimer, `baltic_psalteries` — Baltic psalteries, `bata_drum` — Batá drum, `blaster_beam` — Blaster Beam, `cembalet` — Cembalet, `chapman_stick` — Chapman stick, `cretan_lyra` — Cretan lyra, `cristal_baschet` — Cristal Baschet, `denis_d_or` — Denis d'or, `dubreq_stylophone` — Dubreq Stylophone, `e_flat_clarinet` — E-flat clarinet, `ewi` — EWI, `english_concertina` — English concertina, `english_flageolet` — English flageolet, `french_horn` — French horn, `german_concertina` — German concertina, `german_harp` — German harp, `gravikord` — Gravikord, `great_highland_bagpipe` — Great Highland bagpipe, `guitaret` — Guitaret, `hammond_organ` — Hammond organ, `hawaiian_guitar` — Hawaiian guitar, `indonesian_rebab` — Indonesian rebab, `irish_bouzouki` — Irish bouzouki, `irish_flute` — Irish flute, `irish_harp_clarsach` — Irish harp / clàrsach, `lyricon` — Lyricon, `magyar_duda` — Magyar duda, `mark_tree` — Mark tree, `marxophone` — Marxophone, `mexican_vihuela` — Mexican vihuela, `minimoog` — Minimoog, `moog` — Moog, `northumbrian_pipes` — Northumbrian pipes, `otamatone` — Otamatone, `paraguayan_harp` — Paraguayan harp, `pianet` — Pianet, `pierrot_ensemble` — Pierrot ensemble, `portuguese_guitar` — Portuguese guitar, `radhika_s_mohan_veena` — Radhika's Mohan veena, `reactable` — Reactable, `rhodes_piano` — Rhodes piano, `saraswati_veena` — Saraswati veena, `schwyzerorgeli` — Schwyzerörgeli, `scottish_smallpipes` — Scottish smallpipes, `serbo_croatian_tamburica_orchestra` — Serbo-Croatian tamburica orchestra, `stroh_violin` — Stroh violin, `the_great_stalacpipe_organ` — The Great Stalacpipe Organ, `tonette` — Tonette, `vm_bhatt_s_mohan_veena` — VM Bhatt's Mohan veena, `vietnamese_guitar` — Vietnamese guitar, `wagner_tuba` — Wagner tuba, `warr_guitar` — Warr guitar, `wiener_horn` — Wiener Horn, `wurlitzer_electric_piano` — Wurlitzer electric piano, `xaphoon` — Xaphoon, `accordina` — accordina, `accordion` — accordion, `acoustic_bass_guitar` — acoustic bass guitar, `acoustic_fretless_guitar` — acoustic fretless guitar, `aeolian_harp` — aeolian harp, `afoxe` — afoxé, `agogo` — agogô, `ajaeng` — ajaeng, `akete` — akete, `akkordolia` — akkordolia, `alfaia` — alfaia, `algozey` — algozey, `alphorn` — alphorn, `alto_clarinet` — alto clarinet, `alto_flute` — alto flute, `alto_saxophone` — alto saxophone, `alto_viol` — alto viol, `amadinda` — amadinda, `aman_khuur` — aman khuur, `analog_synthesizer` — analog synthesizer, `angklung` — angklung, `ankle_rattlers` — ankle rattlers, `antara` — antara, `anvil` — anvil, `archlute` — archlute, `archtop_guitar` — archtop guitar, `arghul` — arghul, `arpeggione` — arpeggione, `arrabel` — arrabel, `ashiko` — ashiko, `atabaque` — atabaque, `atarigane` — atarigane, `autoharp` — autoharp, `baandu` — baandu, `baglamas` — baglamas, `bagpipe` — bagpipe, `bajo_sexto` — bajo sexto, `balafon` — balafon, `balalaika` — balalaika, `bandoneon` — bandoneón, `bandora` — bandora, `bandura` — bandura, `bandurria` — bandurria, `bangu` — bangu, `banhu` — banhu, `banjitar` — banjitar, `banjo` — banjo, `banjo_ukulele` — banjo-ukulele, `banjolin` — banjolin, `bansuri` — bansuri, `barbat` — barbat, `baritone_guitar` — baritone guitar, `baritone_horn` — baritone horn, `baritone_saxophone` — baritone saxophone, `baroque_guitar` — baroque guitar, `baroque_rackett` — baroque rackett, `baroque_trumpet` — baroque trumpet, `barrel_drum` — barrel drum, `barrel_organ` — barrel organ, `baryton` — baryton, `bass` — bass, `bass_clarinet` — bass clarinet, `bass_drum` — bass drum, `bass_flute` — bass flute, `bass_harmonica` — bass harmonica, `bass_oboe` — bass oboe, `bass_pedals` — bass pedals, `bass_recorder` — bass recorder, `bass_saxophone` — bass saxophone, `bass_synthesizer` — bass synthesizer, `bass_trombone` — bass trombone, `bass_trumpet` — bass trumpet, `bass_viol` — bass viol, `bass_violin` — bass violin, `basset_clarinet` — basset clarinet, `basset_horn` — basset horn, `bassoon` — bassoon, `bateria` — bateria, `bawu` — bawu, `bayan` — bayan, `bazooka` — bazooka, `baglama_saz_family` — bağlama (saz) family, `bedug` — bedug, `bell` — bell, `bell_plate` — bell plate, `bell_tree` — bell tree, `bellowed_reed` — bellowed reed, `bendir` — bendir, `berda` — berda, `berimbau` — berimbau, `bhapang` — bhapang, `bicycle_bell` — bicycle bell, `bin_sasara` — bin-sasara, `bin_sitar` — bin-sitar, `biniou` — biniou, `birbyne` — birbynė, `birch_lur` — birch lur, `bisernica` — bisernica, `biwa` — biwa, `boatswain_s_pipe` — boatswain's pipe, `bodhran` — bodhrán, `body_percussion` — body percussion, `bolon` — bolon, `bombarde` — bombarde, `bombo_leguero` — bombo legüero, `bonang` — bonang, `bonang_barung` — bonang barung, `bonang_panembung` — bonang panembung, `bonang_panerus` — bonang panerus, `bones` — bones, `bongos` — bongos, `boobam` — boobam, `boomwhacker` — boomwhacker, `bouzar_gouzouki` — bouzar / gouzouki, `bouzouki` — bouzouki, `bowed_lute` — bowed lute, `bowed_lyre` — bowed lyre, `bowed_piano` — bowed piano, `bowed_psaltery` — bowed psaltery, `bowed_string_instruments` — bowed string instruments, `brass` — brass, `brac` — brač, `bronze_lur` — bronze lur, `brushes` — brushes, `bugarija` — bugarija, `bugle` — bugle, `buisine` — buisine, `buk` — buk, `bulbul_tarang` — bulbul tarang, `bullroarer` — bullroarer, `button_accordion` — button accordion, `buzuq` — buzuq, `bin` — bīn, `cabasa` — cabasa, `cabrette` — cabrette, `caixa` — caixa, `cajon` — cajón, `calabash` — calabash, `calliope` — calliope, `calung` — calung, `castanets` — castanets, `cavaquinho` — cavaquinho, `caxixi` — caxixi, `celesta` — celesta, `cello` — cello, `chacha` — chacha, `chakhe` — chakhe, `chalumeau` — chalumeau, `chamber_organ` — chamber organ, `chamberlin` — chamberlin, `chande` — chande, `chanzy` — chanzy, `chap` — chap, `charango` — charango, `charumera` — charumera, `chau_gong` — chau gong, `chikuzen_biwa` — chikuzen biwa, `chime_bar` — chime bar, `ching` — ching, `chirimia` — chirimía, `chirimia_and_drum` — chirimía and drum, `chitarra_battente` — chitarra battente, `chitra_veena` — chitra veena, `chromatic_button_accordion` — chromatic button accordion, `chromatic_harmonica` — chromatic harmonica, `chuurqin` — chuurqin, `cimbalom` — cimbalom, `cimbasso` — cimbasso, `cimpoi` — cimpoi, `citole` — citole, `cittern` — cittern, `cizhonghu` — cizhonghu, `clapper` — clapper, `clapstick` — clapstick, `clarinet` — clarinet, `classical_guitar` — classical guitar, `classical_kemence` — classical kemençe, `claves` — claves, `clavichord` — clavichord, `clavinet` — clavinet, `claviola` — claviola, `clavioline` — clavioline, `claviorganum` — claviorganum, `cobla` — cobla, `cobla_de_tres_quartans` — cobla de tres quartans, `concert_flute` — concert flute, `concert_harp` — concert harp, `concertina` — concertina, `conch` — conch, `concussion_idiophone` — concussion idiophone, `congas` — congas, `continuum` — continuum, `contrabass_clarinet` — contrabass clarinet, `contrabass_flute` — contrabass flute, `contrabass_recorder` — contrabass recorder, `contrabass_saxophone` — contrabass saxophone, `contrabassoon` — contrabassoon, `cor_anglais` — cor anglais, `cornamuse` — cornamuse, `cornemuse_du_centre` — cornemuse du Centre, `cornet` — cornet, `cornett` — cornett, `cowbell` — cowbell, `craviola` — craviola, `crotales` — crotales, `crumhorn` — crumhorn, `crwth` — crwth, `cuatro` — cuatro, `cuica` — cuíca, `cylindrical_drum` — cylindrical drum, `cymbal` — cymbal, `co_ke` — cò ke, `cumbus` — cümbüş, `daegeum` — daegeum, `daf` — daf, `daire` — daire, `daluo` — daluo, `danso` — danso, `daruan` — daruan, `davul` — davul, `dhol` — dhol, `dholak` — dholak, `diatonic_button_accordion` — diatonic button accordion, `diddley_bow` — diddley bow, `didgeridoo` — didgeridoo, `dilruba` — dilruba, `ding_tac_ta` — ding tac ta, `disk_drive` — disk drive, `diyingehu` — diyingehu, `dizi` — dizi, `djembe` — djembe, `djoza` — djoza, `dohol` — dohol, `dolceola` — dolceola, `dombra` — dombra, `domra` — domra, `donso_ng_ni` — donso ngɔni, `doshpuluur` — doshpuluur, `double_bass` — double bass, `double_reed` — double reed, `doyra` — doyra, `dramyin` — dramyin, `drum_machine` — drum machine, `drums_drum_set` — drums (drum set), `duck_call` — duck call, `duduk` — duduk, `dudy_podhalanskie` — dudy podhalanskie, `dudy_wielkopolskie` — dudy wielkopolskie, `duggi` — duggi, `dulce_melos` — dulce melos, `dulcian` — dulcian, `dulcitone` — dulcitone, `dulzaina` — dulzaina, `dunun` — dunun, `dutar` — dutar, `duxianqin` — duxianqin, `dudmaisis` — dūdmaišis, `ebow` — ebow, `effects` — effects, `electric_bass_guitar` — electric bass guitar, `electric_cello` — electric cello, `electric_fretless_guitar` — electric fretless guitar, `electric_grand_piano` — electric grand piano, `electric_guitar` — electric guitar, `electric_harp` — electric harp, `electric_lap_steel_guitar` — electric lap steel guitar, `electric_piano` — electric piano, `electric_sitar` — electric sitar, `electric_upright_bass` — electric upright bass, `electric_viola` — electric viola, `electric_violin` — electric violin, `electronic_drum_set` — electronic drum set, `electronic_instruments` — electronic instruments, `electronic_organ` — electronic organ, `electronic_shruti_box` — electronic shruti box, `elektronium` — elektronium, `end_blown_flute` — end-blown flute, `erhu` — erhu, `esraj` — esraj, `euphonium` — euphonium, `farfisa` — farfisa, `fiddle` — fiddle, `fife` — fife, `finger_cymbals` — finger cymbals, `finger_snaps` — finger snaps, `fipple_flute` — fipple flute, `fiscorn` — fiscorn, `five_string_banjo` — five-string banjo, `flageolet` — flageolet, `flamenco_guitar` — flamenco guitar, `floppy_disk_drive` — floppy disk drive, `flugelhorn` — flugelhorn, `flumpet` — flumpet, `flute` — flute, `flutina` — flutina, `flute_d_amour` — flûte d'amour, `folk_harp` — folk harp, `foot_stomps` — foot stomps, `footbass` — footbass, `four_string_banjo` — four-string banjo, `frame_drum` — frame drum, `free_reed` — free reed, `fretless_bass` — fretless bass, `friction_drum` — friction drum, `friction_idiophone` — friction idiophone, `frottoir` — frottoir, `fujara` — fujara, `fundeh` — fundeh, `gadulka` — gadulka, `gaida` — gaida, `gaita_asturiana` — gaita asturiana, `gaita_de_boto` — gaita de boto, `gaita_gallega` — gaita gallega, `gaita_sanabresa` — gaita sanabresa, `gajdy` — gajdy, `gambang` — gambang, `game_console_sound_chip` — game console sound chip, `gamelan` — gamelan, `gankogui` — gankogui, `ganza` — ganzá, `gaohu` — gaohu, `garifuna_drum` — garifuna drum, `garklein_recorder` — garklein recorder, `garmon` — garmon, `gayageum` — gayageum, `gehu` — gehu, `gemshorn` — gemshorn, `gender` — gendèr, `gender_barung` — gendèr barung, `gender_panerus` — gendèr panerus, `gender_wayang` — gendèr wayang, `geomungo` — geomungo, `ghatam` — ghatam, `ghaychak` — ghaychak, `ghijak` — ghijak, `gittern` — gittern, `gizmo` — gizmo, `glass_harmonica` — glass harmonica, `glass_harp` — glass harp, `glockenspiel` — glockenspiel, `goblet_drum` — goblet drum, `gong` — gong, `gong_bass_drum` — gong bass drum, `gong_chime` — gong-chime, `gopichant` — gopichant, `gralla` — gralla, `gramorimba` — gramorimba, `grand_piano` — grand piano, `great_bass_recorder_c_bass_recorder` — great bass recorder / c-bass recorder, `guan` — guan, `guban` — guban, `gudok` — gudok, `guitalele` — guitalele, `guitar` — guitar, `guitar_family` — guitar family, `guitar_synthesizer` — guitar synthesizer, `guitarron_chileno` — guitarrón chileno, `guitarron_mexicano` — guitarrón mexicano, `guitorgan` — guitorgan, `gumbri` — gumbri, `guqin` — guqin, `gusli` — gusli, `guzheng` — guzheng, `guira` — güira, `guiro` — güiro, `haegeum` — haegeum, `hammered_dulcimer` — hammered dulcimer, `handbell` — handbell, `handclaps` — handclaps, `handpan` — handpan, `hard_disk_drive` — hard disk drive, `hardingfele` — hardingfele, `harmonica` — harmonica, `harmonium` — harmonium, `harp` — harp, `harp_guitar` — harp guitar, `harpejji` — harpejji, `harpsichord` — harpsichord, `heckelphone` — heckelphone, `heike_biwa` — heike biwa, `helicon` — helicon, `hi_hat` — hi-hat, `hichiriki` — hichiriki, `hmong_flute` — hmông flute, `horn` — horn, `hotchiku` — hotchiku, `hourglass_drum` — hourglass drum, `hue_puruhau` — hue puruhau, `hue_puruwai` — hue puruwai, `hulusi` — hulusi, `hummel` — hummel, `huqin` — huqin, `hurdy_gurdy` — hurdy gurdy, `hydraulophone` — hydraulophone, `hyoshigi` — hyoshigi, `harjedalspipa` — härjedalspipa, `hummelchen` — hümmelchen, `idiophone` — idiophone, `igil` — igil, `janggu` — janggu, `jantar` — jantar, `jegogan` — jegogan, `jeli_ng_ni` — jeli ngɔni, `jing` — jing, `jing_erhu` — jing'erhu, `jinghu` — jinghu, `jouhikko` — jouhikko, `jublag` — jublag, `jug` — jug, `junjung` — junjung, `k_long_put` — k'lông pút, `kacapi` — kacapi, `kacapi_indung` — kacapi indung, `kacapi_rincik` — kacapi rincik, `kacapi_siter` — kacapi siter, `kachva_sitar` — kachva sitar, `kagurabue` — kagurabue, `kamale_ng_ni` — kamale ngɔni, `kamancheh` — kamancheh, `kanjira` — kanjira, `kankles` — kanklės, `kannel` — kannel, `kantele` — kantele, `kantilan` — kantilan, `kanun` — kanun, `kartal` — kartal, `kaval` — kaval, `kazoo` — kazoo, `kecer` — kecer, `kemanak` — kemanak, `kemenche` — kemenche, `kemence_of_the_black_sea` — kemençe of the Black Sea, `kempli` — kempli, `kempul` — kempul, `kempyang` — kempyang, `kendang` — kendang, `kendang_lanang` — kendang lanang, `kendang_wadon` — kendang wadon, `kendhang_batangan` — kendhang batangan, `kendhang_gendhing` — kendhang gendhing, `kendhang_indung` — kendhang indung, `kendhang_ketipung` — kendhang ketipung, `kendhang_kulanter` — kendhang kulanter, `kendhang_wayangan` — kendhang wayangan, `kenong` — kenong, `kepyak` — kepyak, `kethuk` — kethuk, `kettle_drum` — kettle drum, `keyboard` — keyboard, `keyboard_bass` — keyboard bass, `keyed_box_zither` — keyed box zither, `keyed_brass_instruments` — keyed brass instruments, `keytar` — keytar, `khamak` — khamak, `khene` — khene, `khim` — khim, `khlui` — khlui, `khong_wong` — khong wong, `khong_wong_lek` — khong wong lek, `khong_wong_yai` — khong wong yai, `khulsan_khuur` — khulsan khuur, `khen_meo` — khèn Mèo, `ki_pah` — ki pah, `kinnari_vina` — kinnari vina, `kinnor` — kinnor, `kithara` — kithara, `kkwaenggwari` — kkwaenggwari, `klong_khaek` — klong khaek, `klong_song_na` — klong song na, `klong_that` — klong that, `klong_yao` — klong yao, `kokle` — kokle, `kokyu` — kokyu, `komuz` — komuz, `kora` — kora, `kortholt` — kortholt, `koto` — koto, `kotsuzumi` — kotsuzumi, `krakeb` — krakeb, `krap` — krap, `krap_khu` — krap khū, `krap_phuang` — krap phuang, `krap_sepha` — krap sēphā, `krar` — krar, `kudum` — kudüm, `ken_bau` — kèn bầu, `ken_la` — kèn lá, `kos` — kös, `koauau` — kōauau, `koauau_ponga_ihu` — kōauau ponga ihu, `lamellaphone` — lamellaphone, `langeleik` — langeleik, `laouto` — laouto, `lap_harp` — lap harp, `lap_steel_guitar` — lap steel guitar, `laser_harp` — laser harp, `lasso_d_amore` — lasso d'amore, `launeddas` — launeddas, `lautenwerck` — lautenwerck, `lavta` — lavta, `limbe` — limbe, `lira_da_braccio` — lira da braccio, `lirone` — lirone, `lithophone` — lithophone, `liuqin` — liuqin, `low_whistle` — low whistle, `lute` — lute, `lute_family` — lute family, `lutheal` — luthéal, `lyra_viol` — lyra viol, `lyre` — lyre, `madal` — madal, `maddale` — maddale, `mandocello` — mandocello, `mandoguitar` — mandoguitar, `mandola` — mandola, `mandolin` — mandolin, `mandolute` — mandolute, `mandora_gallichon` — mandora / gallichon, `maracas` — maracas, `marimba` — marimba, `marimba_lumina` — marimba lumina, `marimbula` — marímbula, `mashak` — mashak, `matstsyanka` — matstsyanka, `mbira` — mbira, `mellophone` — mellophone, `mellotron` — mellotron, `melodica` — melodica, `melophone` — melophone, `membranophone` — membranophone, `metallophone` — metallophone, `mezwed` — mezwed, `mijwiz` — mijwiz, `minipiano` — minipiano, `mirliton` — mirliton, `monkey_stick` — monkey stick, `morin_khuur` — morin khuur, `morsing` — morsing, `mouth_harp` — mouth harp, `mouth_organ` — mouth organ, `mridangam` — mridangam, `mukkuri` — mukkuri, `musette_de_cour` — musette de cour, `musical_bow` — musical bow, `musical_box` — musical box, `musical_saw` — musical saw, `nabal` — nabal, `nadaswaram` — nadaswaram, `nagadou_daiko` — nagadou-daiko, `nagak` — nagak, `nai` — nai, `naobo` — naobo, `natural_brass_instruments` — natural brass instruments, `natural_horn` — natural horn, `natural_trumpet` — natural trumpet, `neyanban` — neyanban, `nguru` — nguru, `ng_ni` — ngɔni, `njarka` — njarka, `nohkan` — nohkan, `nose_flute` — nose flute, `nose_whistle` — nose whistle, `nyatiti` — nyatiti, `nyckelharpa` — nyckelharpa, `oboe` — oboe, `oboe_d_amore` — oboe d'amore, `oboe_da_caccia` — oboe da caccia, `ocarina` — ocarina, `ocean_drum` — ocean drum, `octave_mandolin` — octave mandolin, `octavilla` — octavilla, `octavina` — octavina, `octoban` — octoban, `octobass` — octobass, `oktawka` — oktawka, `olifant` — olifant, `omnichord` — omnichord, `ondes_martenot` — ondes Martenot, `ondioline` — ondioline, `ophicleide` — ophicleide, `organ` — organ, `orpharion` — orpharion, `orphica` — orphica, `other_instruments` — other instruments, `oud` — oud, `oval_spinet` — oval spinet, `pahu` — pahū, `pahu_pounamu` — pahū pounamu, `paiban` — paiban, `pakhawaj` — pakhawaj, `pan_flute` — pan flute, `pang_gu_ly_hu_hmong` — pang gu ly hu hmông, `pardessus_de_viole` — pardessus de viole, `parkapzuk` — parkapzuk, `pedal_accordion` — pedal accordion, `pedal_piano` — pedal piano, `pedal_steel_guitar` — pedal steel guitar, `pemade` — pemade, `percussion` — percussion, `percussion_idiophone` — percussion idiophone, `phach` — phách, `pi` — pi, `pi_nai` — pi nai, `piano_accordion` — piano accordion, `piano_duo` — piano duo, `piano_four_hands` — piano four hands, `piano_quartet` — piano quartet, `piano_spinet` — piano spinet, `piano_trio` — piano trio, `piccolo` — piccolo, `piccolo_oboe` — piccolo oboe, `piccolo_trumpet` — piccolo trumpet, `piffero` — piffero, `pipa` — pipa, `pipe_and_tabor` — pipe and tabor, `pipe_organ` — pipe organ, `piri` — piri, `piva` — piva, `pkhachich` — pkhachich, `plucked_idiophone` — plucked idiophone, `plucked_string_instruments` — plucked string instruments, `pluriarc` — pluriarc, `pocket_trumpet` — pocket trumpet, `poi` — poi, `poi_awhiowhio` — poi āwhiowhio, `porotiti` — porotiti, `portative` — portative, `post_horn` — post horn, `practice_chanter` — practice chanter, `prepared_piano` — prepared piano, `primero` — primero, `psaltery` — psaltery, `pi_thiu` — pí thiu, `pakuru` — pākuru, `pate` — pātē, `porutu` — pōrutu, `pukaea` — pūkaea, `pumotomoto` — pūmotomoto, `pupakapaka` — pūpakapaka, `purerehua` — pūrerehua, `putatara` — pūtātara, `putorino` — pūtōrino, `qilaut` — qilaut, `quadruple_reed` — quadruple reed, `quena` — quena, `quijada` — quijada, `quinto` — quinto, `rainstick` — rainstick, `rammana` — rammana, `ranat_ek` — ranat ek, `ranat_kaeo` — ranat kaeo, `ranat_thum` — ranat thum, `ratchet` — ratchet, `rauschpfeife` — rauschpfeife, `ravanahatta` — ravanahatta, `rebab` — rebab, `rebec` — rebec, `reclam_de_xeremies` — reclam de xeremies, `reco_reco` — reco-reco, `recorder` — recorder, `reed_organ` — reed organ, `reeds` — reeds, `regal` — regal, `rehu` — rehu, `renaissance_rackett` — renaissance rackett, `repeater` — repeater, `repinique` — repinique, `resonator_guitar` — resonator guitar, `reyong` — reyong, `rhythm_sticks` — rhythm sticks, `riq` — riq, `rondador` — rondador, `ronroco` — ronroco, `rototom` — rototom, `ruan` — ruan, `rubab` — rubab, `rudra_veena` — rudra veena, `ryuteki` — ryuteki, `roria` — rōria, `sabar` — sabar, `sac_de_gemecs` — sac de gemecs, `sackbut` — sackbut, `saduk` — saduk, `saluang` — saluang, `samba_whistle` — samba whistle, `samica` — samica, `sampler` — sampler, `sanshin` — sanshin, `santoor` — santoor, `sanxian` — sanxian, `sarangi` — sarangi, `sarod` — sarod, `saron_barung` — saron barung, `saron_demung` — saron demung, `saron_family` — saron family, `saron_panerus` — saron panerus, `saron_peking` — saron peking, `saron_wayang` — saron wayang, `sarrusophone` — sarrusophone, `sasando` — sasando, `satsuma_biwa` — satsuma biwa, `saw_duang` — saw duang, `saw_sam_sai` — saw sam sai, `saw_u` — saw u, `saxophone` — saxophone, `saxophone_quartet` — saxophone quartet, `scraped_idiophone` — scraped idiophone, `segunda` — segunda, `seni_rebab` — seni rebab, `serpent` — serpent, `setar` — setar, `shaken_idiophone` — shaken idiophone, `shakers` — shakers, `shakuhachi` — shakuhachi, `shamisen` — shamisen, `shawm` — shawm, `shehnai` — shehnai, `shekere` — shekere, `sheng` — sheng, `shichepshin` — shichepshin, `shime_daiko` — shime-daiko, `shinobue` — shinobue, `sho` — sho, `shofar` — shofar, `shruti_box` — shruti box, `shudraga` — shudraga, `siku` — siku, `singing_bowl` — singing bowl, `single_reed` — single reed, `sistrum` — sistrum, `sitar` — sitar, `slapstick` — slapstick, `slenthem` — slenthem, `slentho` — slentho, `slide_brass_instruments` — slide brass instruments, `slide_guitar` — slide guitar, `slide_whistle` — slide whistle, `slit_drum` — slit drum, `snare_drum` — snare drum, `somu_dudas` — somu dūdas, `song_loan` — song loan, `sopilka` — sopilka, `sopranino_recorder` — sopranino recorder, `sopranino_saxophone` — sopranino saxophone, `soprano_clarinet` — soprano clarinet, `soprano_flute` — soprano flute, `soprano_recorder` — soprano recorder, `soprano_saxophone` — soprano saxophone, `soprano_violin` — soprano violin, `sordellina` — sordellina, `sousaphone` — sousaphone, `spike_fiddle` — spike-fiddle, `spilapipa` — spilåpipa, `spinet` — spinet, `spinettone` — spinettone, `spoons` — spoons, `steel_guitar` — steel guitar, `steel_string_acoustic_guitar` — steel-string acoustic guitar, `steelpan` — steelpan, `stick_zither` — stick zither, `string_quartet` — string quartet, `string_quintet` — string quintet, `string_synthesizer` — string synthesizer, `string_trio` — string trio, `strings` — strings, `struck_idiophone` — struck idiophone, `struck_string_instruments` — struck string instruments, `subcontrabass_recorder` — subcontrabass recorder, `suikinkutsu` — suikinkutsu, `suka` — suka, `suling` — suling, `suona` — suona, `surbahar` — surbahar, `surdo` — surdo, `sursingar` — sursingar, `swaragat` — swaragat, `swarmandal` — swarmandal, `synclavier` — synclavier, `syrinx` — syrinx, `sao_meo` — sáo meò, `sao_truc` — sáo trúc, `sackpipa` — säckpipa, `senh_tien` — sênh tiền, `t_rung` — t'rưng, `tabla` — tabla, `table_steel_guitar` — table steel guitar, `tabor` — tabor, `tack_piano` — tack piano, `taepyeongso` — taepyeongso, `taiko` — taiko, `taishogoto` — taishogoto, `talharpa` — talharpa, `talkbox` — talkbox, `talking_drum` — talking drum, `tamborim` — tamborim, `tambourine` — tambourine, `tambura` — tambura, `tanbou_ka` — tanbou ka, `tanbur` — tanbur, `tangent_piano` — tangent piano, `tanpura` — tanpura, `taonga_puoro` — taonga pūoro, `tap_dance` — tap dance, `tape` — tape, `taphon` — taphon, `tar` — tar, `taragot` — taragot, `tarota` — tarota, `te_ku` — te kū, `tef` — tef, `telharmonium` — telharmonium, `temple_blocks` — temple blocks, `temur_khuur` — temür khuur, `tenor_banjo` — tenor banjo, `tenor_guitar` — tenor guitar, `tenor_horn_alto_horn` — tenor horn / alto horn, `tenor_recorder` — tenor recorder, `tenor_saxophone` — tenor saxophone, `tenor_trombone` — tenor trombone, `tenor_viol` — tenor viol, `tenor_violin` — tenor violin, `tenora` — tenora, `thavil` — thavil, `theatre_organ` — theatre organ, `theorbo` — theorbo, `theremin` — theremin, `thon` — thon, `three_hole_pipe` — three-hole pipe, `ti_bwa` — ti bwa, `tible` — tible, `timbales` — timbales, `timpani` — timpani, `tin_whistle` — tin whistle, `tinya` — tinya, `tiple` — tiple, `tieu` — tiêu, `tololoche` — tololoche, `tom_tom` — tom-tom, `tonkori` — tonkori, `topshuur` — topshuur, `torupill` — torupill, `toy_piano` — toy piano, `traditional_basque_ensemble` — traditional basque ensemble, `transverse_flute` — transverse flute, `trautonium` — trautonium, `treble_flute` — treble flute, `treble_recorder_alto_recorder` — treble recorder / alto recorder, `treble_viol` — treble viol, `treble_violin` — treble violin, `tres` — tres, `triangle` — triangle, `trikiti` — trikiti, `tritantri_veena` — tritantri veena, `tromba_marina` — tromba marina, `trombone` — trombone, `trumpet` — trumpet, `trumpet_family` — trumpet family, `tram_ple` — tràm plè, `trang_jau` — trắng jâu, `trang_lu` — trắng lu, `trong_bong` — trống bông, `tsampouna` — tsampouna, `tuba` — tuba, `tubax` — tubax, `tube_zither` — tube zither, `tubon` — tubon, `tubular_bells` — tubular bells, `tubulum` — tubulum, `tulum` — tulum, `tumbi` — tumbi, `tumutumu` — tumutumu, `tun_tuna` — tun tuna, `tungso` — tungso, `turntable` — turntable, `txalaparta` — txalaparta, `txistu` — txistu, `typewriter` — typewriter, `tzoura` — tzoura, `tokere` — tōkere, `udu` — udu, `ugal` — ugal, `uilleann_pipes` — uilleann pipes, `ukeke` — ukeke, `ukulele` — ukulele, `upright_piano` — upright piano, `vacuum_cleaner` — vacuum cleaner, `valiha` — valiha, `valve_trombone` — valve trombone, `valved_brass_instruments` — valved brass instruments, `veena` — veena, `venu` — venu, `vertical_viola` — vertical viola, `vessel_flute` — vessel flute, `veuze` — veuze, `vibrandoneon` — vibrandoneon, `vibraphone` — vibraphone, `vibraslap` — vibraslap, `vichitra_veena` — vichitra veena, `vielle` — vielle, `vihuela` — vihuela, `viol_consort` — viol consort, `viol_family` — viol family, `viola` — viola, `viola_caipira` — viola caipira, `viola_d_amore` — viola d'amore, `viola_da_gamba` — viola da gamba, `viola_organista` — viola organista, `violin` — violin, `violin_family` — violin family, `violin_octet` — violin octet, `violino_piccolo` — violino piccolo, `viololyra` — viololyra, `violoncello_piccolo` — violoncello piccolo, `violone` — violone, `violotta` — violotta, `virginal` — virginal, `vocoder` — vocoder, `voice_synthesizer` — voice synthesizer, `vuvuzela` — vuvuzela, `walaycho` — walaycho, `washboard` — washboard, `washtub_bass` — washtub bass, `water_drum` — water drum, `waterphone` — waterphone, `wavedrum` — wavedrum, `whistle` — whistle, `willow_flute` — willow flute, `wind_chime` — wind chime, `wind_instruments` — wind instruments, `wind_synthesizer` — wind synthesizer, `wire_strung_harp` — wire-strung harp, `wood_block` — wood block, `wooden_fish` — wooden fish, `woodwind` — woodwind, `wot` — wot, `xalam` — xalam, `xeremies` — xeremies, `xiao` — xiao, `xiaoluo` — xiaoluo, `xun` — xun, `xylophone` — xylophone, `xylorimba` — xylorimba, `yangqin` — yangqin, `yatga` — yatga, `yayl_tanbur` — yaylı tanbur, `yazh` — yazh, `yehu` — yehu, `yonggo` — yonggo, `yoochin` — yoochin, `yu` — yu, `yueqin` — yueqin, `zabumba` — zabumba, `zampogna` — zampogna, `zarb` — zarb, `zhaleika` — zhaleika, `zhonghu` — zhonghu, `zhongruan` — zhongruan, `zhuihu` — zhuihu, `zill` — zill, `zither` — zither, `zurna` — zurna, `cevgen` — çevgen, `utogardon` — ütőgardon, `ing_buot` — đing buốt, `ing_nam` — đing năm, `an_bau` — đàn bầu, `an_nguyet` — đàn nguyệt, `an_nhi` — đàn nhị, `an_tam` — đàn tam, `an_tam_thap_luc` — đàn tam thập lục, `an_tranh` — đàn tranh, `an_tu` — đàn tứ, `an_tu_day` — đàn tứ dây, `an_ty_ba` — đàn tỳ bà, `giga` — ģīga, `otsuzumi` — ōtsuzumi, `sargija` — šargija, `zafzafa` — żafżafa, `zaqq` — żaqq, `zummara` — żummara

- **`sonic_tags`** — Sonic Tags (10 free tags)  
  control `chips` · binding **`prose`** · 10 predefined values
  - default: `[]` — empty; png chips are suggestions
  - constraints: `{"max_selected": 10}`
  - value origin: png chips as suggestions; free entry allowed (tags fold into the prompt on the Google-only routes; the ACE typed-tag carrier was removed by D-SSM-24)
  - selectable: `cinematic_swell` — cinematic swell, `warm_analog` — warm analog, `nostalgic_texture` — nostalgic texture, `hybrid_orchestral` — hybrid orchestral, `punchy_low_end` — punchy low-end, `no_vocals` — no vocals, `dramatic_hits` — dramatic hits, `wide_stereo` — wide stereo, `ethereal_pads` — ethereal pads, `dark_undertone` — dark undertone

- **`mood_orbit`** — Mood Orbit (2-D mood vector)  
  control `radar` · binding **`compiled`** · no value set
  - default: `null` — optional; the png's orbit shows the six pole labels used here
  - value origin: architecture_contract s3.2: resolved through the versioned lexicon data/mood_orbit_lexicon.json (magnitude selects intensity tier, angle selects blend); the sent clause is returned in bindings.mood_orbit.sent
    - `axes`: one of `epic` — Epic, `uplifting` — Uplifting, `hopeful` — Hopeful, `melancholic` — Melancholic, `dark` — Dark, `aggressive` — Aggressive
    - `value_range`: min=0.0; max=1.0

- **`vocal`** — Vocal Mode: Instrumental  
  control `combo` · binding **`prose`** · no value set
  - default: `{"mode": "instrumental", "language": "en", "language_policy": "strict"}` — png shows Instrumental selected; strict is the honest default - a silent fallback is the deception class
  - value origin: png's seven vocal-mode tiles; instrumental maps to the TYPED instrumental_only field on music_lyria (worker_enum); voice character is prose + MEASURE (speech_config.voice was measured INERT - no named-voice claim is made)
    - `mode`: one of `instrumental` — Instrumental, `male` — Male, `female` — Female, `duet` — Duet, `choir` — Choir, `spoken` — Spoken, `plan_decides` — Plan Decides
    - `language`: one of `en` — English, `tr` — Türkçe, `zh` — 中文 (Mandarin), `ja` — 日本語, `ko` — 한국어, `ru` — Русский, `es` — Español, `fr` — Français, `de` — Deutsch, `it` — Italiano, `pt` — Português
    - `language_policy`: one of `strict` — Strict (refuse an unproven language), `prefer_proven` — Prefer proven (fall back and report language_fallback)

- **`lyrics`** — Lyric Mode: None  
  control `combo` · binding **`typed`** · free text (no closed value set)
  - default: `{"mode": "none", "verify": true}` — png shows None selected; verify=true because the returned PER number is the product's differentiator
  - value origin: png's three lyric modes; custom text rides Lyria's measured 'Lyrics:' prompt convention (generation-proven 2026-08-13, 7/8 Turkish words); ai_write is our Gemini stage; R1 phoneme drive applies per the language registry route
    - `mode`: one of `none` — None, `custom` — Custom (your exact words, character-for-character), `ai_write` — AI Write (theme-driven)
    - `text`: max_length=2000; active_when=mode=custom
    - `theme`: max_length=1000; active_when=mode=ai_write; note=png cap 0/1000
    - `verify`: type=boolean; note=runs the PER gate on the separated vocal stem via stt_vertex (Gemini 2.5 Pro); returns lyrics_verification.*
    - `language`: one of `en` — English, `tr` — Türkçe, `zh` — 中文 (Mandarin), `ja` — 日本語, `ko` — 한국어, `ru` — Русский, `es` — Español, `fr` — Français, `de` — Deutsch, `it` — Italiano, `pt` — Português
    - `script`: one of `latin` — Latin, `auto` — Auto-detect; note=G2P/Romanisation hint for the R1 phoneme drive

- **`references`** — References / Inspiration (3 named tracks)  
  control `upload` · binding **`compiled`** · free text (no closed value set)
  - default: `[]` — empty; the png's three named commercial tracks are the REFUSAL example, not a default
  - constraints: `{"max_items": 3}`
  - value origin: architecture s1.3 (legal boundary) + D-SSM-24: kind=user_audio is analysed by OUR OWN code on GCE into descriptors that drive Lyria (no third-party service); kind=midi is parsed by our code into structure/tempo/key descriptors; kind=descriptor is prose; a NAMED commercial track is refused BY NAME with the legal reason (D-SSM-14)
    - `kind`: one of `user_audio` — Your own audio file, `midi` — Your MIDI file (analysed to descriptors; note-exact conditioning has no Google path today and is NOT promised), `descriptor` — Sonic description (text)
    - `url`: type=uri; active_when=kind in [user_audio, midi]
    - `text`: max_length=500; active_when=kind=descriptor

#### Panel 3 — Generation & Output, Response-only, Rights & Compliance, Versions (12 parameters)

- **`output_package`** — Output Package (Single Track)  
  control `combo` · binding **`our_stage`** · 3 predefined values
  - default: `"single_track"` — png shows Single Track
  - value origin: png dropdown + architecture s2.2
  - selectable: `single_track` — Single Track, `variations` — Variations (n takes; seed is not bit-deterministic here - measured 23.87 dB apart on identical requests - so variations are REAL alternatives), `stems_bundle` — Stems Bundle (master + 7 stems)

- **`route`** — Model selector (BT-Music v2.0)  
  control `combo` · binding **`typed`** · 4 predefined values
  - default: `"auto"` — png shows the alias; auto is the conductor's contract (route.why is returned)
  - value origin: worker_enum music_lyria MODELS (D-SSM-24: Google models only); the UI label 'BT-Music v2.0' is the product alias for the auto route
  - selectable: `auto` — BT-Music v2.0 (auto: the conductor picks per request), `lyria-3-pro-preview` — Lyria 3 Pro (full songs, vocals; generation-proven), `lyria-3-clip-preview` — Lyria 3 Clip (30 s clips), `lyria-002` — Lyria 2 (instrumental only, 16-bit 48 kHz PCM; GA)

- **`quality`** — Quality Mode (Draft / Balanced / Ultra)  
  control `combo` · binding **`our_stage`** · 3 predefined values
  - default: `"balanced"` — png marks Balanced 'Recommended'
  - value origin: png's three tiles; maps to clip-vs-pro route choice + our conform/master depth; NO vendor quality knob is claimed (none is measured)
  - selectable: `draft` — Draft (fast: clip model, single pass, no mastering), `balanced` — Balanced (pro model + two-pass master), `ultra` — Ultra (pro model + full stage chain + verification gates)

- **`controls`** — Harmony Complexity 7/10  
  control `slider` · binding **`compiled`** · no value set
  - default: `{"harmony_complexity": 7, "rhythm_density": 6, "sonic_polish": 8}` — the png's own slider positions
  - value origin: architecture s3.4: graded lexicon prose (prose_graded) on the Google-only routes; the knob-mapping A/B (build step 6b, his decision) may upgrade any of the three to a measured mapping. THE NAMED PRESETS ARE IMPORTED, NOT INLINED: data/knob_grade_lexicon.json owns the five tiers and each knob's clause per tier, so the UI combos, the planner's prompt clause and this spec can never disagree by hand (MANDATE CLAUSE 23). Added 2026-08-15 after a live render-contract control measured these three sliders as the only ones offering NO predefined values while tempo_bpm offered eight - a violation of his order 'tüm herşeyde maximum predefined değerlerimiz olmalı'. NOTE THE KEY NAME: this is `presets_import`, NOT `values_import`. A first attempt reused `values_import` and models.load_vocabulary REFUSED it - 'vocabulary data/knob_grade_lexicon.json carries zero entries' - because that key contracts a groups[].entries[] vocabulary and this lexicon is tier-shaped. The gate was right; a different shape gets its OWN typed key rather than a reused one that would have to be loosened.
  - graded presets from `generate_music_hybrid_model/music_studio/data/knob_grade_lexicon.json` (5 tiers x 3 knobs) — the clause each position SENDS, returned in `bindings.controls.<knob>.sent`
    - tier `very_low` (Very low (0-2)) — slider 0-2
    - tier `low` (Low (3-4)) — slider 3-4
    - tier `medium` (Medium (5-6)) — slider 5-6
    - tier `high` (High (7-8)) — slider 7-8
    - tier `very_high` (Very high (9-10)) — slider 9-10
    - `harmony_complexity` clauses:
      - `very_low` → "harmony built on two or three plain chords that stay put"
      - `low` → "simple diatonic harmony with one clear turnaround"
      - `medium` → "diatonic harmony with a few borrowed chords and one modulation"
      - `high` → "rich harmony with extended chords, secondary dominants and a key change"
      - `very_high` → "dense chromatic harmony that shifts key more than once and leans on altered chords"
    - `rhythm_density` clauses:
      - `very_low` → "sparse, patient percussion"
      - `low` → "steady, unhurried percussion on the main beats"
      - `medium` → "a full backbeat with regular eighth-note movement"
      - `high` → "busy percussion with sixteenth-note movement and fills between phrases"
      - `very_high` → "dense, driving sixteenth-note percussion"
    - `sonic_polish` clauses:
      - `very_low` → "raw and unpolished, room sound left in"
      - `low` → "lightly cleaned up, still natural and close"
      - `medium` → "a clean balanced mix with even levels"
      - `high` → "a polished mix with clear separation and controlled low end"
      - `very_high` → "a fully finished master, wide and glossy, every part sitting in its own space"
    - `harmony_complexity`: min=0; max=10; step=1
    - `rhythm_density`: min=0; max=10; step=1; note=deliberately NOT wired to any vendor knob - an invented mapping presented as a control is the accepted-and-ignored class
    - `sonic_polish`: min=0; max=10; step=1

- **`mastering`** — Mixing / Mastering Target  
  control `combo` · binding **`enforced`** · no value set
  - default: `{"target": "cinematic_trailer", "loudness_lufs": "-9", "true_peak_db": -1.0}` — png shows Cinematic Trailer and -9 LUFS; measured loudness/true-peak are returned in measured.*
  - value origin: our_stage (two-pass loudness, film-law s15 pattern: never single-pass, measured LRA 11.5->4.1 silently on one pass); target list = png + the delivery contexts the mastering stage documents
    - `target`: one of `cinematic_trailer` — Cinematic Trailer, `streaming` — Streaming (music platforms), `broadcast` — Broadcast / TV, `game` — Game / interactive, `social` — Social media, `none` — No mastering (raw model master)
    - `loudness_lufs`: one of `-9` — -9 LUFS (trailer-loud), `-11` — -11 LUFS, `-14` — -14 LUFS (streaming norm), `-16` — -16 LUFS, `-23` — -23 LUFS (EBU R128 broadcast)
    - `true_peak_db`: min=-3.0; max=0.0; default=-1.0

- **`export`** — Export Format (24-bit WAV)  
  control `combo` · binding **`enforced`** · 5 predefined values
  - default: `"wav24_48k"` — png shows 24-bit WAV
  - value origin: our transcode stage (native|transcoded|refused per architecture s1.2); export.upsampled_from names the true source depth - a 24-bit container from a 16-bit source is packaging, not information
  - selectable: `wav24_48k` — 24-bit WAV 48 kHz (transcoded; upsampled_from returned), `wav16_48k` — 16-bit WAV 48 kHz (native on lyria-002), `flac_48k` — FLAC 48 kHz (lossless transcode), `mp3_320` — MP3 320 kbps, `mp3_native` — MP3 (native on lyria-3, 44.1 kHz measured)

- **`stems`** — Stems to Include (7 checkboxes)  
  control `multi-select` · binding **`our_stage`** · 7 predefined values
  - default: `["master"]` — master always delivered; others opt-in (each costs a stage run)
  - value origin: png's seven checkboxes; mechanism per stem locked by Berk's approval of option (a), 2026-08-14 18:55: separated = our own open-weights separator software on GCE; generated = Lyria beds; rendered = our master stage; every stem returns origin
  - selectable: `drums` — Drums, `bass` — Bass, `music` — Music, `vocals` — Vocals, `fx` — FX, `ambience` — Ambience, `master` — Master

- **`rights`** — Rights & Licensing (Commercial, full sync)  
  control `toggle` · binding **`response_field`** · no value set
  - default: `{"commercial_use": true, "sync": true}` — png badge; copyright_warranted is ALWAYS false and stated
  - value origin: architecture s1.4: the badge may say COMMERCIAL USE, never COPYRIGHT (USCO Part 2 + Thaler v. Perlmutter: no copyright vests in a wholly AI-generated work)
  - response shape (this parameter is RETURNED, never sent): `{"commercial_use": true, "sync": true, "copyright_warranted": false, "basis": "returned verbatim with every job"}`

- **`compliance`** — C2PA Proof (Verified)  
  control `toggle` · binding **`response_field`** · no value set
  - default: `{"c2pa": true, "ddex_ai_credit": true}` — both mandatory; a green tick without a read-back is the decoration class
  - value origin: Lyria 3 outputs carry SynthID + C2PA natively (Google launch material, read 2026-08-14); our read-back verifier proves the manifest SURVIVED our render stages (survived_render); DDEX AI-credit is our own stage; EU AI Act Art. 50(2) binding since 2026-08-02 (D-SSM-15)
  - response shape (this parameter is RETURNED, never sent): `{"c2pa": {"state": "signed|absent", "survived_render": "boolean", "verified_by": "reader id"}, "ddex_ai_credit": {"state": "written|absent"}}`

- **`seed`** — Reproducible seed (implied by Versions)  
  control `text` · binding **`typed`** · free text (no closed value set)
  - default: `null` — server assigns and RETURNS a seed when absent, so every version is at least provenance-addressable
  - constraints: `{"type": "integer", "min": 0}`
  - value origin: worker_enum (seed is a real field on 5 workers); HONEST LIMIT carried in the label: a seed is a provenance record, not a re-render promise (same request twice measured 23.87 dB apart)

- **`webhook_url`** — Generate button (async job)  
  control `text` · binding **`our_stage`** · free text (no closed value set)
  - default: `null` — optional; polling via job status remains available
  - constraints: `{"type": "https_uri"}`
  - value origin: async job contract (job_id returned immediately; completion pushed)

- **`analysis_outputs`** — Sonic DNA radar (6 axes)  
  control `radar` · binding **`response_field`** · no value set
  - default: `null` — response-only; the UI renders these, the request never sends them
  - value origin: architecture s3.5: computed from the DELIVERED audio by our estimators; any axis without a passing control returns NOT_RUN, never a number
  - response shape (this parameter is RETURNED, never sent): `{"sonic_dna": "6 axes with estimator+confidence each", "arrangement": "[{section, start_seconds, end_seconds, source: planned|detected, peaks_url}]"}`

### Language — the honest state per language, imported not asserted

Read from `generate_music_hybrid_model/music_studio/data/language_registry.json` (11 entries). A language's STATE is what has been measured about SINGING in it, and `language_policy: strict` (the default) REFUSES rather than silently substituting — a silent fallback is the deception class.

| Language | State | Evidence recorded in the registry |
|---|---|---|
| `en` —  | **None** | GTSinger (NeurIPS 2024) + Mureka FAQ/changelog both enumerate English for singing; our English ground-truth control exists (DiffRhythm-protocol artefact); voice_vertex_tts route li |
| `tr` —  | **None** | D-SSM-19: zero absent articulations vs the 9 covered languages (74-phone MFA table); R1 phoneme drive committed (MFA dict v3.0.0 + rules + learned OOV); Lyria 3 measured 7/8 dictat |
| `zh` —  | **None** | GTSinger + Mureka |
| `ja` —  | **None** | GTSinger + Mureka |
| `ko` —  | **None** | GTSinger + Mureka |
| `ru` —  | **None** | GTSinger + Mureka |
| `es` —  | **None** | GTSinger + Mureka |
| `fr` —  | **None** | GTSinger + Mureka |
| `de` —  | **None** | GTSinger + Mureka |
| `it` —  | **None** | GTSinger + Mureka |
| `pt` —  | **None** | Mureka only (not in GTSinger) |

### Live verification — 2026-08-15 (measured, not asserted)

| Leg | What was exercised | Result, from the artefact on disk |
|---|---|---|
| Direct invoke | `aws lambda invoke ssm-content-worker-generate-music-hybrid-model` | route `lyria-3-clip-preview`, delivered **30.772 s** mp3 44100 Hz 2ch; spend $0.08 |
| HTTP route | `POST https://v2pjhwhk0m.execute-api.eu-central-1.amazonaws.com/prod/generate-music-hybrid-model` with `x-api-key`, async job polled to completion | job status **COMPLETED**, route `lyria-3-clip-preview`, delivered **30.772 s**; spend $0.08 |

Both delivered files were **downloaded to local disk and measured there** — `ffprobe` for duration/codec/rate/channels and a **full `ffmpeg -xerror` decode of both streams (exit 0)**, which is the test skipped on 2026-08-13 when a master no consumer player could open was reported as delivered. Their SHA-256 hashes differ, proving two distinct generations rather than one file served twice.

**The refusal path is proven live too, and it costs nothing:** an unknown genre returns HTTP 400 `INVALID_REQUEST` on a direct invoke, and through the route the job record reaches `FAILED` at `progressMessage: planning` with the full allowed list — no generation call is made. A validator that cannot refuse is not a validator (MANDATE CLAUSE 7).

### Capabilities endpoint (how the UI should fetch this surface at runtime)

```json
POST /generate-music-hybrid-model  {"capabilities": true}
```

Returns the same 34-parameter surface as machine-readable JSON (`parameters`, `languages`, `routes`, `bindings_legend`) projected from the very same `param_spec.json` this section is generated from — so the UI can render panels without parsing markdown, and the doc and the runtime answer can never disagree. Verified live this session: 34 parameters, 11 languages, 4 routes, HTTP 200, $0.

_Generated 2026-08-18T15:14:49+00:00 from `param_spec.json` sha256 `105e0c486ee27ad602bb023eb895e284`._

<!-- END GENERATED: generate-music-hybrid-model -->

## 9b.1 voice-vertex-tts

**Status:** ✅ **VERIFIED LIVE 2026-08-13** — direct invoke and route invoke
(`POST /create-voice-vertex-tts`, job `6eb66eed-…`), delivered file downloaded from the CDN and
**ffprobed: 2.931 s, 24 kHz mono `pcm_s16le`**, worker duration matches to **0.000 s**.

**THIS IS THE SURFACE WHERE THE VOICE NAME ACTUALLY WORKS.** On the Omni video surface
`speech_config.voice` was measured INERT (§6.2b). Here `prebuiltVoiceConfig.voiceName` genuinely
selects the voice — **measured, not assumed**, by
`scripts/measure_vertex_tts_named_voice_control.py`: the same sentence in 4 named voices, an explicit
autocorrelation F0 estimator, and a CONTROL (one voice's own two halves) fixing the instrument's
noise floor at **6.72 Hz**. Median F0: **Charon 129.56 · Fenrir 144.14 · Aoede 190.48 ·
Kore 205.13 Hz** → **4 of 6 pairs separated** above max(3×floor, 5 Hz) = 20.17 Hz.
*(Aoede↔Kore 14.65 Hz and Charon↔Fenrir 14.59 Hz are same-register and NOT separable by pitch alone —
a limit of the pitch instrument, not evidence they are one voice.)*

**Endpoint:** `POST /create-voice-vertex-tts` → `ssm-content-worker-voice-vertex-tts`
(S3 prefix `voice/vertex-tts/`).

### Models

| Model | Status | Measured |
|---|---|---|
| `gemini-2.5-pro-tts` (default) | GA | **live-proven** |
| `gemini-2.5-flash-tts` | GA | **live-proven** (1.291 s delivery) |
| `gemini-3.1-flash-tts-preview` | Public Preview | **live-proven** (1.600 s delivery) |

### Parameters (request-body root)

| Field | Type | Req | Notes |
|---|---|---|---|
| `text` | string | **Yes** | For a two-speaker read, label lines with the ALL-CAPS speaker names used in `speakers[]` |
| `model` | string | No | one of the three above |
| `voice_name` | string | cond. | **One of 30 prebuilt names.** Mutually exclusive with `speakers[]` and with the clone fields. An unknown name is REFUSED here because the schema itself does not validate it |
| `speakers[]` | array | cond. | **EXACTLY two** `{speaker, voice_name}` — `multiSpeakerVoiceConfig`'s own stated limit. *(Offline-validated; NOT live-tested yet)* |
| `voice_sample_url` / `voice_sample_base64` | string | cond. | **Voice CLONING** via `replicatedVoiceConfig`. Sources: `https://`, `s3://`, `gs://`. **SCHEMA-ONLY — no live clone has been run**, and the Zip runtime REFUSES it (no ffmpeg to reach the schema's stated 24 kHz mono 16-bit wav) rather than sending an unstated format |
| `language_code` | string | No | BCP-47, on `speechConfig.languageCode` |
| `system_instruction` | string | No | Delivery direction (pace, tone) |
| `output_mime_type` | string | No | `audio/wav` (default) · `audio/mpeg` · `audio/ogg` · `audio/opus`. **See the honesty note below** |
| `sample_rate`, `bit_rate` | integer | No | Applied by POST-conversion, not as vendor parameters |
| `temperature`, `seed`, `audio_timestamp` | -- | No | Passed through `generationConfig` |
| `s3_bucket`, `output_path` | string | No | Delivery overrides |

> **AUDIO FORMAT IS NOT A VENDOR PARAMETER ON THIS VERB.** The `AudioResponseFormat` schema
> (mime/sample-rate/bit-rate) is NOT part of `:generateContent`, so nothing about format is sent to
> Google — it is applied by post-conversion. The surface returns
> `audio/L16;codec=pcm;rate=24000` (**headerless PCM**), and no ffmpeg layer exists in this account,
> so the Zip deployment wraps the PCM in a real RIFF/WAVE header with the standard library and the
> response states, per request, exactly which requested properties were **NOT** applied
> (`format_conversion`, `delivered_mime_type`). **A requested mp3/ogg is currently delivered as
> wav** and the response says so. The container Dockerfile carries ffmpeg but is not deployed.

### Response extras

`route` (`voiceConfig` / `multiSpeakerVoiceConfig`) · `voices[]` · `requested_output_mime_type` vs
`delivered_mime_type` · `source_mime_type` · `format_conversion` · `measured_by` ·
`riff_header_present` · `prebuilt_voice_count`.

---

# 9c. SPEECH-TO-TEXT & NATIVE AUDIO (Vertex AI) -- NEW 2026-08-13

## 9c.1 stt-vertex

**Status:** ✅ **VERIFIED LIVE 2026-08-13** through `POST /create-stt-vertex` (job `2c8bd496-…`) with
a **ROUND-TRIP proof**: it transcribed this session's own TTS output and returned **all 11 source
words, in order** — `"Merhaba Berk. Bu ses Vertex AI üzerinde ismiyle seçilmiş bir sestir."`

**Endpoint:** `POST /create-stt-vertex` → `ssm-content-worker-stt-vertex`
(S3 prefix `transcription/vertex/`; the transcript is stored as JSON and its URL returned).

### Models

| Model | Status | Measured verdict |
|---|---|---|
| `gemini-2.5-pro` (default), `gemini-2.5-flash`, `gemini-3.5-flash`, `gemini-live-2.5-flash-native-audio` | GA | `gemini-2.5-pro` **live-proven** |
| `chirp-2`, `chirp-3` | PP / Private Preview | **404 on the Vertex publisher surface in BOTH `global` and `us-central1`.** Root cause measured: Chirp is served by **`speech.googleapis.com` (Speech-to-Text v2)**, and that API is **NOT ENABLED** on project `contentanalyticsplatform` (`gcloud services list --enabled` returns nothing for it; v2 `recognizers` → 403). An **enablement** gap, not a capability gap — enabling it is Berk's decision |
| `video-speech-transcription` | GA | **REFUSED BY NAME**: it is a *Video Intelligence* model, not a Vertex publisher model on `generateContent` |

### Parameters (request-body root)

| Field | Type | Req | Notes |
|---|---|---|---|
| `audio_url` | string | cond. | `https://` · `s3://` · **`gs://` travels as a `fileData` reference so the bytes never enter the worker** |
| `audio_base64` | string | cond. | Alternative to `audio_url`; inline audio is capped at 18 MB (stage larger files in GCS) |
| `audio_mime_type` | string | No | wav/mpeg/mp3/ogg/opus/flac/aac/m4a/webm/mp4 |
| `language_codes[]` | array | No | BCP-47 hints. Omit for automatic detection |
| `language_auto` | boolean | No | Mutually exclusive with `language_codes` |
| `custom_vocabulary[]`, `adaptation_phrases[]` | array | No | ASR biasing (≤500 phrases each) |
| `word_timestamps` | boolean | No | `wordTimestamp` — a **BOOLEAN** |
| `diarization` | boolean | No | `diarization` — a **BOOLEAN**. Sending `{"mode":"speaker"}` was measured to fail: `400 Starting an object on a scalar field`. The string form belongs to the other schema family, which this verb does not use |
| `instruction` | string | No | What to do with the audio (transcribe verbatim by default) |
| `temperature`, `labels` | -- | No | Passed through |

> **STATED LIMIT (accepted-and-ignored class, unresolved):** `diarization` and `word_timestamps` were
> ACCEPTED, and the response carried **`structured_segments: 0`** — no per-word or per-speaker
> structure came back. The worker reports the model's output verbatim and never reshapes it into a
> structure that was not returned.

## 9c.2 audio-live-gemini

**Status:** ✅ **VERIFIED LIVE 2026-08-13** through `POST /create-audio-live-gemini` (job `f87d143e-…`,
re-run after the duration fix), delivered file downloaded and **ffprobed: 2.072 s, 24 kHz mono
`pcm_s16le`**, Δ **0.000 s** against the worker's report. Turkish speech, `Kore`/`Charon` voices.

**Endpoint:** `POST /create-audio-live-gemini` → `ssm-content-worker-audio-live-gemini`
(S3 prefix `audio/gemini-native/`; **`GOOGLE_LOCATION=us-central1`** — see below).

### THE SURFACE: WebSocket, not `generateContent` (measured, and a previous claim retracted)

`gemini-live-2.5-flash-native-audio` is **GA** but is **not served by `:generateContent`**:
- `:generateContent` @ `locations/global` → **404** "Publisher model … was not found".
- `:generateContent` @ `locations/us-central1` → **400 "gemini-live-2.5-flash-native-audio is not
  supported in the generateContent API."** — a 400 that NAMES the model proves the model exists and
  the VERB was wrong. Reading only the 404 would have produced a false "it does not exist".
- The discovery document shows no `bidiGenerateContent` method **because the Live surface is a
  WebSocket service, not a REST method**. The earlier conclusion "no duplex exists" was WRONG and is
  retracted here rather than quietly removed.

The endpoint and message sequence are cross-verified across four primary sources including Google's
own `gemini/multimodal-live-api/intro_multimodal_live_api.ipynb`:

```
wss://{LOCATION}-aiplatform.googleapis.com
   /ws/google.cloud.aiplatform.{v1|v1beta1}.LlmBidiService/BidiGenerateContent

client -> {"setup": {"model": "projects/P/locations/L/publishers/google/models/M",
                     "system_instruction": {...}, "generation_config": {...}}}
client -> {"client_content": {"turns": [{"role": "user", "parts": [...]}],
                              "turn_complete": true}}
server -> {"serverContent": {"modelTurn": {"parts": [{"inlineData": {...}}]},
                             "turnComplete": true}}
```

Audio arrives as base64 PCM **chunks** and is concatenated until `turnComplete`, then wrapped in a
RIFF/WAVE header (24 kHz mono 16-bit — the rate Google's own notebook plays this surface at).
`websockets` 17.0.1 is **vendored into the deployment package** because it is not in the shared layer.

### Parameters (request-body root)

| Field | Type | Req | Notes |
|---|---|---|---|
| `text` | string | cond. | Text and/or audio input; at least one required |
| `audio_url` / `audio_base64` | string | cond. | `https://` · `s3://` · `gs://` (the last travels as a `fileData` reference) |
| `audio_mime_type` | string | No | wav/mpeg/mp3/ogg/opus/flac/webm |
| `voice_name` | string | No | One of the 30 prebuilt names; mutually exclusive with `speakers[]` |
| `speakers[]` | array | No | Exactly two `{speaker, voice_name}` |
| `language_code` | string | No | On `speech_config.languageCode` |
| `response_modalities[]` | array | No | `["AUDIO"]` default; `TEXT` allowed. Sent lowercase, as this protocol expects |
| `return_transcript` | boolean | No | Enables input+output audio transcription; the frames come back in `transcriptions[]` |
| `system_instruction`, `temperature`, `seed` | -- | No | Carried in `setup` |
| `api_version` | string | No | `v1` (default, GA) or `v1beta1` |

### REFUSED BY NAME (with the reason, so nobody builds duplex on a single-turn endpoint)

`stream` · `session_id` · `interrupt` · `realtime_input` — the **protocol** is bidirectional, but a
Lambda behind API Gateway cannot hold a session open past its response. Continuous duplex needs a
long-lived client against the same `wss` URL. The response states this explicitly in
`duplex_protocol_available: true` / `duplex_in_this_endpoint: false`.

> **`GOOGLE_LOCATION=global` is REFUSED** by this worker with the measured reason (404 on global for
> this model), instead of sending a request that cannot succeed.

### Verification tooling for all four new endpoints

| Script | What it proves |
|---|---|
| `scripts/test_vertex_audio_worker_contracts.py` | **50/50** offline contract controls, pass AND refuse sides, all four workers loaded BY PATH (all four name their module `models.py`) |
| `scripts/test_vertex_audio_routes_e2e.py` | **4/4** through API Gateway → job_creator → DynamoDB `COMPLETED` |
| `scripts/verify_vertex_audio_route_artifacts.py` | **4/4** deliveries downloaded from the CDN and ffprobed; the worker's claimed duration compared to the file (0.000 s on all three audio endpoints); the transcript compared word-by-word to the known source |
| `scripts/measure_vertex_tts_named_voice_control.py` | Named-voice control with its own measured noise floor |
| `scripts/test_wave_duration_measurement.py` | **6/6** — reproduces the lying-header bug and proves the fix |
| `scripts/probe_vertex_audio_preview_models.py` | **4/6** preview/extra models produce a completed generation; the 2 refusals carry their root cause |
| `scripts/print_vertex_transcription_config_types.py` | Per-field TYPES from the discovery document (how the boolean-vs-object defect was found) |
| `scripts/find_vertex_live_audio_surface.py` · `scripts/probe_vertex_model_regions.py` | Surface/region enumeration behind the Live-API finding |

---

# 10. SFX -- Sound Effects (6 Provider)
> S3 prefix: `sfx/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Models | Max Duration | Output |
|---|----------|----------|--------|-------------|--------|
| 1 | Beatoven SFX | `sfx-beatoven` | `beatoven/sound-effect-generation` | 35s | wav |
| 2 | Mirelo V1.5 | `sfx-mirelo` | `mirelo-ai/sfx-v1.5/video-to-audio` | 10s | wav (multi) |
| 3 | MMAudio V2 | `sfx-mmaudio` | `fal-ai/mmaudio-v2` | 50s | mp4 |
| 4 | ElevenLabs SFX | `sfx-elevenlabs` | ElevenLabs Sound Generation | 22s | mp3 |
| 5 | ACE SFX | `sfx-ace` | `fal-ai/ace-step` | -- | wav |
| 6 | Multi (aggregator) | `sfx-multi` | Multi-provider routing | -- | -- |

## 10.1 sfx-beatoven

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sfx-beatoven` |
| **Lambda** | `ssm-content-worker-sfx-beatoven` |
| **Provider** | Beatoven SFX via fal.ai |
| **Package** | ZIP |
| **Prompt Limit** | **5,000 chars** |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max 5,000 chars |
| `duration` | float | No | -- | `1` - `35` seconds |
| `seed` | integer | No | -- | -- |

**Output:** wav. Short sound effects.

---

## 10.2 sfx-mirelo

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sfx-mirelo` |
| **Lambda** | `ssm-content-worker-sfx-mirelo` |
| **Provider** | Mirelo SFX V1.5 (video-to-audio) via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_url` | string | **Yes** | -- | Source video URL |
| `text_prompt` | string | No | -- | Guide audio generation |
| `num_samples` | integer | No | -- | `2` - `8` (number of variations) |
| `seed` | integer | No | -- | -- |
| `duration` | float | No | -- | `1` - `10` seconds |
| `start_offset` | float | No | -- | Video offset (seconds) |

**Output:** wav. Returns **multiple audio samples** (`all_samples` array). Video-synchronized SFX.

---

## 10.3 sfx-mmaudio

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sfx-mmaudio` |
| **Lambda** | `ssm-content-worker-sfx-mmaudio` |
| **Provider** | MMAudio V2 via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Describe desired audio/SFX |
| `video_url` | string | No | -- | Source video (audio baked into video) |
| `negative_prompt` | string | No | -- | What to avoid |
| `seed` | integer | No | -- | `0` - `65535` |
| `num_steps` | integer | No | -- | `1` - `30` |
| `duration` | float | No | -- | `4.0` - `50.0` seconds |
| `cfg_strength` | float | No | -- | `0.0` - `20.0` |
| `mask_away_clip` | boolean | No | -- | -- |

**Output:** mp4 (video with generated audio baked in) or audio if no video.

---

## 10.4 sfx-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sfx-elevenlabs` |
| **Lambda** | `ssm-content-worker-sfx-elevenlabs` |
| **Provider** | ElevenLabs Sound Generation (Direct API) |
| **Package** | ZIP |
| **Prompt Limit** | **1,000 chars** |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Max 1,000 chars. Describe the sound effect |
| `duration_seconds` | float | No | -- | `0.5` - `22.0` |
| `prompt_influence` | float | No | -- | `0.0` - `1.0` |

**Output:** mp3

---

## 10.5 sfx-ace

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sfx-ace` |
| **Lambda** | `ssm-content-worker-sfx-ace` |
| **Provider** | ACE-Step via fal.ai |
| **Package** | ZIP |
| **Model:** `fal-ai/ace-step` (hardcoded) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Describe the sound effect |
| `tags` | string | No | -- | Comma-separated genre/style tags |
| `duration` | float | No | -- | Duration in seconds |
| `num_inference_steps` | integer | No | -- | `60` - `200` |
| `guidance_scale` | float | No | -- | -- |
| `lyrics` | string | No | -- | Optional lyrics/vocal content |
| `seed` | integer | No | -- | -- |

**Output:** wav

---

## 10.6 sfx-multi (Aggregator)

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sfx-multi` |
| **Lambda** | `ssm-content-worker-sfx-multi` |
| **Provider** | Multi-provider: ElevenLabs + Stability AI (auto-routes) |
| **Package** | ZIP |

**Intelligent routing**: Short sounds (<5s, UI/UX) --> ElevenLabs. Longer/ambient --> Stability.

### Common Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Describe the sound effect |
| `provider` | string | No | `elevenlabs` | `elevenlabs`, `stability` |
| `duration` | float | No | `1.0` | Duration in seconds |
| `category` | string | No | -- | SFXCategory enum (e.g. `ui_click`, `ui_hover`, `ui_success`, `ui_error`, `ui_notification`, `explosion_*`, `weapon_*`, `magic_*`, `footstep_*`, `ambient_*`, etc.) |
| `style` | string | No | -- | `realistic`, `cartoon`, `retro_8bit`, `retro_16bit`, `cinematic`, `minimal`, `synthwave`, `organic`, `digital`, `hybrid` |
| `intensity` | string | No | -- | `subtle`, `soft`, `medium`, `strong`, `intense` |
| `quality` | string | No | `standard` | `draft`, `standard`, `high`, `ultra` |
| `preset` | string | No | -- | Named preset (e.g. `ui_click`, `collect_coin`) |
| `seed` | integer | No | `0` | -- |

---

#### Provider: `elevenlabs`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `output_format` | string | No | `mp3` | `mp3`, `wav`, `pcm` |
| `prompt_influence` | float | No | `0.3` | `0.0` - `1.0` |

---

#### Provider: `stability`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `output_format` | string | No | `mp3` | `mp3`, `wav` |
| `cfg_scale` | float | No | -- | Guidance scale |
| `steps` | integer | No | -- | Generation steps |

**Also supports GET** to return presets, categories, styles metadata.

---

# 11. 3D (7 Provider)
> S3 prefix: `3d/{provider}/`. All 3D handlers output `.glb` or `.obj` mesh files.

### Provider & Model Overview

| # | Provider | Endpoint | Models | Input | Output |
|---|----------|----------|--------|-------|--------|
| 1 | Vertex AI | `threed-vertex` | Imagen multi-view | Image | .glb |
| 2 | Meshy V6 | `threed-meshy` | `fal-ai/meshy/v6/text-to-3d`, `fal-ai/meshy/v6/image-to-3d` | Text/Image | .glb |
| 3 | Hunyuan3D | `threed-hunyuan3d` | `fal-ai/hunyuan3d` | Image | .glb |
| 4 | TRELLIS | `threed-trellis` | `fal-ai/trellis` | Image | .glb |
| 5 | TripoSR | `threed-triposr` | `fal-ai/triposr` | Image | .glb/.obj |
| 6 | Tripo3D v2.5 | `threed-tripo3d` | `tripo3d/tripo/v2.5/image-to-3d` | Image | .glb |
| 7 | Stability AI 3D | `threed-stability` | Stability 3D | Image | .glb |

## 11.1 threed-vertex

**Status:** ⏳ Will Be Deployed Soon (Vertex AI 3D endpoint not yet in API Gateway)

| | |
|---|---|
| **Endpoint** | `POST /3d-create-vertex` *(PLANNED -- not yet in API Gateway)* |
| **Lambda** | `ssm-content-worker-threed-vertex` *(not yet deployed)* |
| **Provider** | Google Vertex AI |
| **Package** | Docker (ECR) |
| **Status** | **PLANNED** -- not yet deployed. Vertex AI 3D model handler placeholder. |

*Vertex AI 3D model handler -- uses Imagen for multi-view generation. Not yet implemented.*

---

## 11.2 threed-meshy

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /3d-create-meshy` |
| **Lambda** | `ssm-content-worker-threed-meshy` |
| **Provider** | Meshy via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/meshy/v6/text-to-3d` | Text to 3D (default) |
| `fal-ai/meshy/v6/image-to-3d` | Image to 3D (auto-selected when `image_url` is provided) |

### Parameters — `fal-ai/meshy/v6/text-to-3d`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max **600 chars** |
| `model` | string | No | `fal-ai/meshy/v6/text-to-3d` | See models |
| `mode` | string | No | `full` | `preview`, `full` |
| `art_style` | string | No | `realistic` | `realistic`, `sculpture` |
| `seed` | integer | No | -- | -- |
| `enable_prompt_expansion` | boolean | No | -- | AI prompt expansion |

### Parameters — `fal-ai/meshy/v6/image-to-3d`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Reference image URL |
| `model` | string | No | `fal-ai/meshy/v6/image-to-3d` | See models |
| `save_pre_remeshed_model` | boolean | No | -- | Keep original mesh before remesh |

### Shared Parameters (both models)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `topology` | string | No | `triangle` | `quad`, `triangle` |
| `target_polycount` | integer | No | `30000` | `100` - `300000` |
| `should_remesh` | boolean | No | `true` | Remesh output |
| `symmetry_mode` | string | No | `auto` | `off`, `auto`, `on` |
| `enable_pbr` | boolean | No | `false` | PBR textures |
| `pose_mode` | string | No | -- | `a-pose`, `t-pose`, `""` |
| `texture_prompt` | string | No | -- | Texture guidance |
| `texture_image_url` | string | No | -- | Texture reference image |
| `enable_rigging` | boolean | No | -- | Auto-rig output |
| `rigging_height_meters` | float | No | -- | Rigging reference height |
| `enable_animation` | boolean | No | -- | Auto-animate |
| `animation_action_id` | string | No | -- | Animation preset ID |
| `enable_safety_checker` | boolean | No | -- | Content safety |

**Output:** .glb

---

## 11.3 threed-hunyuan3d

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /3d-create-hunyuan3d` |
| **Lambda** | `ssm-content-worker-threed-hunyuan3d` |
| **Provider** | Hunyuan3D via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `input_image_url` | string | **Yes** | -- | Reference image URL |
| `seed` | integer | No | -- | -- |
| `num_inference_steps` | integer | No | -- | `1` - `50` |
| `guidance_scale` | float | No | -- | `0` - `20` |
| `octree_resolution` | integer | No | -- | `1` - `1024` |
| `textured_mesh` | boolean | No | -- | -- |

**Output:** .glb

---

## 11.4 threed-trellis

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /3d-create-trellis` |
| **Lambda** | `ssm-content-worker-threed-trellis` |
| **Provider** | TRELLIS via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Reference image URL |
| `seed` | integer | No | -- | -- |
| `ss_guidance_strength` | float | No | -- | `0` - `10` |
| `ss_sampling_steps` | integer | No | -- | `1` - `50` |
| `slat_guidance_strength` | float | No | -- | `0` - `10` |
| `slat_sampling_steps` | integer | No | -- | `1` - `50` |
| `mesh_simplify` | float | No | -- | `0.9` - `0.98` |
| `texture_size` | integer | No | -- | `512`, `1024`, `2048` |

**Output:** .glb

---

## 11.5 threed-triposr

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /3d-create-triposr` |
| **Lambda** | `ssm-content-worker-threed-triposr` |
| **Provider** | TripoSR via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Reference image URL |
| `output_format` | string | No | `glb` | `glb`, `obj` |
| `do_remove_background` | boolean | No | -- | -- |
| `foreground_ratio` | float | No | -- | `0.5` - `1.0` |
| `mc_resolution` | integer | No | -- | `32` - `1024` (marching cubes) |

**Output:** .glb or .obj

---

## 11.6 threed-tripo3d

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /3d-create-tripo3d` |
| **Lambda** | `ssm-content-worker-threed-tripo3d` |
| **Provider** | Tripo3D v2.5 via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Reference image URL |
| `seed` | integer | No | -- | -- |
| `texture` | string | No | `standard` | `no`, `standard`, `HD` |
| `texture_seed` | integer | No | -- | -- |
| `pbr` | boolean | No | -- | PBR materials |
| `face_limit` | integer | No | -- | Max polygon faces |
| `auto_size` | boolean | No | -- | -- |
| `quad` | boolean | No | -- | Quad mesh topology |
| `texture_alignment` | string | No | -- | `original_image`, `geometry` |
| `orientation` | string | No | -- | `default`, `align_image` |

**Output:** .glb

---

## 11.7 threed-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /3d-create-stability` |
| **Lambda** | `ssm-content-worker-3d` (Docker, routed via WORKER_ALIAS) |
| **Provider** | Google Vertex AI (via AWS-GCP WIF integration) |
| **Package** | Docker (ECR) |

> **Note (v4.0):** This endpoint was rerouted from `ssm-content-worker-threed-stability` (Zip)
> to `ssm-content-worker-3d` (Docker) for Vertex AI compatibility via Workload Identity Federation.

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes*** | -- | One of `prompt`, `image_url`, or `image_base64` required |
| `image_url` | string | **Yes*** | -- | Reference image URL |
| `image_base64` | string | **Yes*** | -- | Base64-encoded image |
| `art_style` | string | No | `stylized` | `realistic`, `stylized`, `low_poly`, `cartoon`, `anime`, `hand_painted`, `clay` |
| `category` | string | No | `prop` | `character`, `prop`, `environment`, `vehicle`, `weapon`, `creature`, `furniture` |
| `texture_resolution` | integer | No | `1024` | Texture resolution |
| `negative_prompt` | string | No | -- | Free text |
| `count` | integer | No | `1` | Number of outputs |
| `foreground_ratio` | float | No | `0.85` | `0.0` - `1.0` |
| `remesh` | string | No | -- | Remesh option |

**Output:** .glb

---

# 12. EDITING & UTILITY (13 Handler)
> Goruntu duzenleme, altyazi, lip sync, virtual try-on, dubbing, ses izolasyonu.

### Handler & Provider Overview

| # | Type | Provider | Endpoint | Models |
|---|------|----------|----------|--------|
| 1 | upscale | Vertex AI | `upscale-vertex` | `imagen-4.0-upscale-preview` |
| 2 | upscale | fal.ai | `upscale-fal` | `fal-ai/creative-upscaler`, `fal-ai/video-upscaler` |
| 3 | subtitle | AWS | `subtitle-aws` | AWS Transcribe (native) |
| 4 | lipsync | Kling (fal.ai) | `lipsync-kling` | `fal-ai/kling-video/lipsync/audio-to-video` |
| 5 | lipsync | Sync (fal.ai) | `lipsync-fal` | `fal-ai/sync-lipsync/v2`, `fal-ai/sync-lipsync/v2/pro` |
| 6 | lipsync | OmniHuman (fal.ai) | `lipsync-omnihuman` | `fal-ai/bytedance/omnihuman` |
| 7 | lipsync | HeyGen (fal.ai) | `lipsync-heygen` | `fal-ai/heygen/avatar-iv` |
| 8 | tryon | Kling (fal.ai) | `tryon-kling` | `fal-ai/kling/v1-5/kolors-virtual-try-on` |
| 9 | erase | fal.ai | `erase-fal` | `fal-ai/finegrain-eraser`, `fal-ai/bria/eraser` |
| 10 | bgremove | Bria (fal.ai) | `bgremove-fal` | `fal-ai/bria/background/remove` |
| 11 | outpaint | fal.ai | `outpaint-fal` | `fal-ai/image-apps-v2/outpaint` |
| 12 | dubbing | ElevenLabs | `dubbing-elevenlabs` | ElevenLabs Dubbing API |
| 13 | isolate | ElevenLabs | `isolate-elevenlabs` | ElevenLabs Audio Isolation |

## 12.1 upscale-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-upscale-vertex` |
| **Lambda** | `ssm-content-worker-upscale-vertex` |
| **Provider** | Google Vertex AI — Imagen Upscale attempt + Gemini image fallback |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

> **Updated 2026-08-12:** `imagen-4.0-upscale-preview` returns 404 in this project/region (measured;
> Google's docs still list it — contradiction preserved in the research). The worker now tries the
> documented Imagen upscaler first and, on 404, falls back to `gemini-3.1-flash-image`
> image-to-image at 2K (x2) / 4K (x3, x4). The response's `model` and `upscale_method` fields state
> which path produced the output (`imagen_upscaler` vs `generative_resynthesis` — the fallback is a
> regeneration, not pixel-faithful super-resolution).

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image` | string (base64) | **Yes*** | -- | Base64-encoded image. Mutually exclusive with `image_url` |
| `image_url` | string | **Yes*** | -- | Image URL to download. Mutually exclusive with `image` |
| `model` | string | No | `imagen-4.0-upscale-preview` | `imagen-4.0-upscale-preview` (auto-fallback), `gemini-3.1-flash-image` |
| `upscale_factor` | string | No | `x2` | `x2`, `x3`, `x4` |
| `prompt` | string | No | `Upscale the image` | Imagen-path prompt |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType, live-verified 2026-08-12) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |

**Output:** png

---

## 12.2 subtitle-aws

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-subtitle-aws` |
| **Lambda** | `ssm-content-worker-subtitle-aws` |
| **Provider** | AWS Transcribe + AWS Translate |
| **Package** | ZIP |
| **Auth** | IAM Role |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `audio_url` | string | **Yes*** | -- | One of three audio sources required |
| `audio_s3_uri` | string | **Yes*** | -- | One of three audio sources required |
| `audio_base64` | string | **Yes*** | -- | One of three audio sources required |
| `language` | string | No | Config default | AWS Transcribe language code |
| `output_formats` | array | No | `["srt", "vtt"]` | `srt`, `vtt`, `json` |
| `enable_speaker_diarization` | boolean | No | `false` | -- |
| `max_speakers` | integer | No | `2` | -- |
| `translate_to` | array | No | -- | Target language codes |

**Output:** .srt, .vtt, .json files. Supports 23+ languages. Speaker diarization. Multi-language translation.

---

## 12.3 lipsync-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-lipsync-kling` |
| **Lambda** | `ssm-content-worker-lipsync-kling` |
| **Provider** | Kling LipSync via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `audio_url` | string | **Yes** | -- | Audio source URL |
| `video_url` | string | **Yes*** | -- | Video input. One of `video_url` or `image_url` required |
| `image_url` | string | **Yes*** | -- | Image input (animate still). One of `video_url` or `image_url` required |

**Output:** mp4. Two modes: video+audio lip sync OR image+audio animate.

---

## 12.4 tryon-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-tryon-kling` |
| **Lambda** | `ssm-content-worker-tryon-kling` |
| **Provider** | Kling Kolors v1.5 Virtual Try-On via fal.ai |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `human_image_url` | string | **Yes** | -- | Human/model photo URL |
| `garment_image_url` | string | **Yes** | -- | Clothing item photo URL |
| `seed` | integer | No | -- | -- |

**Output:** png/jpg. Virtual try-on: human + garment --> result.

---

## 12.5 upscale-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-upscale-fal` |
| **Lambda** | `ssm-content-worker-upscale-fal` |
| **Provider** | fal.ai Creative Upscaler / Video Upscaler |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/creative-upscaler` | Image upscale (default) |
| `fal-ai/video-upscaler` | Video upscale |

### Parameters — `fal-ai/creative-upscaler` (Image)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | `fal-ai/creative-upscaler` | `fal-ai/creative-upscaler` |
| `scale` | integer | No | `2` | `1` - `5` |
| `creativity` | float | No | -- | `0.0` - `1.0`. AI creative fill amount |
| `detail` | float | No | -- | `0.0` - `5.0`. Detail enhancement level |
| `shape_preservation` | float | No | -- | `0.0` - `3.0`. Shape fidelity |
| `prompt` | string | No | -- | Free text. Guide upscale direction |
| `negative_prompt` | string | No | -- | Free text |

### Parameters — `fal-ai/video-upscaler` (Video)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_url` | string | **Yes** | -- | Source video URL |
| `model` | string | **Yes** | -- | `fal-ai/video-upscaler` |
| `scale` | integer | No | `2` | `2`, `4` |

---

## 12.6 erase-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-erase-fal` |
| **Lambda** | `ssm-content-worker-erase-fal` |
| **Provider** | fal.ai Object Erasure |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/finegrain-eraser` | Text-prompt based removal with shadow cleanup (default) |
| `fal-ai/bria/eraser` | Mask-based object removal |

### Parameters — `fal-ai/finegrain-eraser`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `prompt` | string | **Yes** | -- | Object to remove (free text) |
| `model` | string | No | `fal-ai/finegrain-eraser` | `fal-ai/finegrain-eraser` |
| `quality` | string | No | `standard` | `express`, `standard`, `premium` |

### Parameters — `fal-ai/bria/eraser`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `mask_url` | string | **Yes** | -- | Mask indicating area to erase |
| `model` | string | **Yes** | -- | `fal-ai/bria/eraser` |

---

## 12.7 bgremove-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-bgremove-fal` |
| **Lambda** | `ssm-content-worker-bgremove-fal` |
| **Provider** | Bria RMBG 2.0 via fal.ai |
| **Package** | ZIP |
| **Model:** `fal-ai/bria/background/remove` (hardcoded) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `output_format` | string | No | `png` | `png`, `jpeg` |

**Output:** PNG with transparent background.

---

## 12.8 outpaint-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-outpaint-fal` |
| **Lambda** | `ssm-content-worker-outpaint-fal` |
| **Provider** | fal.ai Image Outpaint |
| **Package** | ZIP |
| **Model:** `fal-ai/image-apps-v2/outpaint` (hardcoded) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `prompt` | string | No | -- | What to fill in expanded area |
| `expand_left` | integer | No | -- | `0` - `700` (pixels) |
| `expand_right` | integer | No | -- | `0` - `700` (pixels) |
| `expand_top` | integer | No | -- | `0` - `700` (pixels) |
| `expand_bottom` | integer | No | -- | `0` - `700` (pixels) |
| `zoom_out_percentage` | float | No | -- | `0` - `90` (%) |
| `num_images` | integer | No | -- | `1` - `4` |
| `output_format` | string | No | -- | Passthrough |

---

## 12.9 lipsync-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-lipsync-fal` |
| **Lambda** | `ssm-content-worker-lipsync-fal` |
| **Provider** | Sync Lipsync 2.0 via fal.ai |
| **Package** | ZIP |

### Models

| Model Value | Notes |
|-------------|-------|
| `fal-ai/sync-lipsync/v2` | Standard quality (default) |
| `fal-ai/sync-lipsync/v2/pro` | Pro quality, preserves facial details |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `video_url` | string | **Yes** | -- | Source video URL |
| `audio_url` | string | **Yes** | -- | Audio source URL |
| `model` | string | No | `fal-ai/sync-lipsync/v2` | See models |
| `sync_mode` | string | No | -- | `cut_off`, `loop`, `bounce`, `silence`, `remap` |

**Output:** mp4

---

## 12.10 lipsync-omnihuman

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-lipsync-omnihuman` |
| **Lambda** | `ssm-content-worker-lipsync-omnihuman` |
| **Provider** | ByteDance OmniHuman 1.5 via fal.ai |
| **Package** | ZIP |
| **Model:** `fal-ai/bytedance/omnihuman` (hardcoded) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Portrait image URL |
| `audio_url` | string | **Yes** | -- | Audio URL |
| `resolution` | string | No | -- | `720p`, `1080p` |
| `turbo_mode` | boolean | No | -- | Fast generation mode |
| `prompt` | string | No | -- | Expression/gesture guidance |

**Output:** mp4. Generates realistic talking avatar video from portrait + audio.

---

## 12.11 lipsync-heygen

**Status:** ⏳ Will Be Deployed Soon (fal.ai API path changed, worker update needed)

| | |
|---|---|
| **Endpoint** | `POST /create-lipsync-heygen` |
| **Lambda** | `ssm-content-worker-lipsync-heygen` |
| **Provider** | HeyGen Avatar IV via fal.ai |
| **Package** | ZIP |
| **Model:** `fal-ai/heygen/avatar-iv` (hardcoded) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `avatar_image_url` | string | **Yes** | -- | Avatar portrait image URL |
| `audio_url` | string | **Yes*** | -- | Audio source. One of `audio_url` or `script`/`text` required |
| `script` / `text` | string | **Yes*** | -- | Script for TTS mode. One of `audio_url` or `script`/`text` required |
| `voice_id` | string | No | -- | Voice selection (TTS mode) |
| `language` | string | No | -- | Language code |

**Output:** mp4. Two modes: audio-driven or TTS-driven avatar video.

---

## 12.12 dubbing-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-dubbing-elevenlabs` |
| **Lambda** | `ssm-content-worker-dubbing-elevenlabs` |
| **Provider** | ElevenLabs Dubbing API (Direct) |
| **Package** | ZIP |
| **Max File:** 1GB, 2.5 hours |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `source_url` | string | **Yes*** | -- | Audio/video URL. One of `source_url` or `file_url` required |
| `file_url` | string | **Yes*** | -- | File download URL. One of `source_url` or `file_url` required |
| `target_lang` | string | No | `en` | 32 supported language codes |
| `source_lang` | string | No | -- | Auto-detected if omitted |
| `num_speakers` | integer | No | -- | Number of speakers to detect |
| `highest_resolution` | boolean | No | -- | High-res output |
| `watermark` | boolean | No | -- | Add watermark |

**Content-Type:** Auto-detected from source file (not hardcoded).

**Output:** mp3/mp4. Automatic dubbing with speaker separation, emotion/timing preservation.

---

## 12.13 isolate-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-isolate-elevenlabs` |
| **Lambda** | `ssm-content-worker-isolate-elevenlabs` |
| **Provider** | ElevenLabs Audio Isolation (Direct) |
| **Package** | ZIP |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `audio_url` | string | **Yes** | -- | Source audio URL |

**Output:** mp3. Removes background noise, isolates voice from music/ambient.

---

# 13. INPAINT / FILL (4 Provider)
Mask-based image inpainting -- replace or fill specific areas of an image with AI-generated content using a mask.

### Provider & Model Overview

| # | Provider | Endpoint | Models |
|---|----------|----------|--------|
| 1 | fal.ai (SDXL) | `inpaint-fal` | `fal-ai/inpaint` (`SD`, `SDXL`) |
| 2 | Stability AI | `inpaint-stability` | `stable-image-edit-inpaint` (mask mode + search mode) |
| 3 | OpenAI | `inpaint-openai` | `gpt-image-1.5`, `gpt-image-1`, `dall-e-2` |
| 4 | Vertex AI | `inpaint-vertex` | `gemini-3.1-flash-image` prompt-driven editing (insert, remove, background-swap, outpaint; `imagen-3.0-capability-001` retired 2026-06-30) |

## 13.1 inpaint-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-inpaint-fal` |
| **Lambda** | `ssm-content-worker-inpaint-fal` |
| **Provider** | fal.ai -- SDXL Inpainting |
| **Model** | `fal-ai/inpaint` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | png / jpg / webp image |

### Models

| Model Value | Description | Speed |
|-------------|------------|-------|
| `SD` | Stable Diffusion 1.5 Inpaint | Fast |
| `SDXL` | Stable Diffusion XL Inpaint (default) | Normal |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL (JPEG/PNG/WebP) |
| `mask_url` | string | **Yes** | -- | Mask image URL -- white pixels = area to inpaint, black = keep |
| `model_name` | string | No | `SDXL` | `SD`, `SDXL` |
| `prompt` | string | No | -- | What to generate in masked area. Max **5000** chars |
| `negative_prompt` | string | No | -- | What to avoid generating. Max **5000** chars |
| `strength` | float | No | -- | Denoising strength. `0.0` = no change, `1.0` = full regeneration. Range: **0.0--1.0** |
| `num_inference_steps` | integer | No | -- | Number of denoising steps. Higher = better quality, slower. Range: **1--100** |
| `guidance_scale` | float | No | -- | Classifier-free guidance scale. Higher = more prompt adherence. Range: **0.0--20.0** |
| `seed` | integer | No | random | Reproducibility seed for deterministic output |
| `num_images` | integer | No | `1` | Number of images to generate. Range: **1--4** |
| `image_size` | string | No | -- | `square_hd`, `square`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9` |
| `output_format` | string | No | auto | `png`, `jpg`, `webp` |

**S3 Path:** `inpaint/fal/{inpaint_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 13.2 inpaint-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-inpaint-stability` |
| **Lambda** | `ssm-content-worker-inpaint-stability` |
| **Provider** | Stability AI -- Stable Image Edit Inpaint |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/edit/inpaint` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |
| **Output** | png / jpeg / webp image |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Description of what to generate in masked area. Max **10000** chars |
| `image_url` | string | **Yes** | -- | Source image URL. Supported: JPEG, PNG, WebP. Resolution: **0.25--4 megapixels** |
| `mode` | string | No | `mask` | `mask`, `search` |
| `mask_url` | string | **Yes** (when mode=`mask`) | -- | Mask image URL -- black pixels = keep, white pixels = replace |
| `search_prompt` | string | **Yes** (when mode=`search`) | -- | What to find and replace in image. Max **10000** chars |
| `negative_prompt` | string | No | -- | What to avoid. Max **10000** chars |
| `seed` | integer | No | random | Range: **0--4294967294** |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `grow_mask` | integer | No | -- | Expand mask boundary by N pixels. Range: **0--20** |

> **Note:** A syntax bug in the multipart form-data payload construction has been fixed. The `mode` and `search_prompt` fields are now correctly included in API requests.

**S3 Path:** `inpaint/stability/{inpaint_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 13.3 inpaint-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-inpaint-openai` |
| **Lambda** | `ssm-content-worker-inpaint-openai` |
| **Provider** | OpenAI Images Edit API |
| **API URL** | `https://api.openai.com/v1/images/edits` |
| **Package** | Zip (Lambda Layer: `ssm-content-requests-layer`) |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |
| **Output** | Dynamic (png/jpg/webp based on output_format) |

### Models

| Model Value | Description | Max Prompt |
|-------------|------------|------------|
| `gpt-image-1.5` | GPT Image 1.5 (default, best quality) | 32000 chars |
| `gpt-image-1` | GPT Image 1 | 32000 chars |
| `dall-e-2` | DALL-E 2 (legacy) | 1000 chars |

### Parameters — `gpt-image-1.5` / `gpt-image-1`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | What to generate in masked/edited area. Max **32000** chars |
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | `gpt-image-1.5` | `gpt-image-1.5`, `gpt-image-1` |
| `mask_url` | string | No | -- | Mask image URL. Transparent areas indicate where to edit |
| `size` | string | No | -- | `1024x1024`, `1024x1536`, `1536x1024`, `auto` |
| `quality` | string | No | -- | `low`, `medium`, `high`, `auto` |
| `n` | integer | No | `1` | Number of images. Range: **1--4** |
| `background` | string | No | -- | `transparent`, `opaque`, `auto` |
| `output_format` | string | No | `png` | `png`, `jpg`, `webp` |
| `output_compression` | integer | No | -- | `0`--`100` (JPEG/WebP compression) |
| `moderation` | string | No | -- | `low`, `auto` |
| `input_fidelity` | float | No | -- | Input fidelity strength |
| `user` | string | No | -- | User identifier for abuse tracking |

### Parameters — `dall-e-2`

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | What to generate in masked/edited area. Max **1000** chars |
| `image_url` | string | **Yes** | -- | Source image URL. Must be a valid PNG |
| `model` | string | **Yes** | -- | `dall-e-2` |
| `mask_url` | string | No | -- | Mask image URL. Transparent areas indicate where to edit |
| `size` | string | No | -- | `256x256`, `512x512`, `1024x1024` |
| `n` | integer | No | `1` | Number of images. Range: **1--4** |
| `output_format` | string | No | `png` | `png`, `jpg`, `webp` |
| `user` | string | No | -- | User identifier for abuse tracking |

**S3 Path:** `inpaint/openai/{inpaint_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 13.4 inpaint-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-inpaint-vertex` |
| **Lambda** | `ssm-content-worker-inpaint-vertex` |
| **Provider** | Google Vertex AI -- Gemini image (prompt-driven editing) |
| **Model** | `gemini-3.1-flash-image` |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation (AWS --> GCP) |
| **Output** | png image |

> **Migration note (2026-08-12, live-verified):** `imagen-3.0-capability-001` was discontinued by
> Google on 2026-06-30 and mask-based editing has NO official replacement. The worker now runs
> prompt-driven editing on `gemini-3.1-flash-image:generateContent`. Consequences: mask_mode
> `background`/`foreground` become edit instructions; `user-provided` masks are forwarded as a
> reference image and the result carries `mask_is_approximate: true` (pixel-precise adherence is not
> guaranteed); mask_mode `semantic` is REJECTED (no equivalent); `guidance_scale`, `mask_dilation`,
> `sample_count`, `safety_setting`, `language` are accepted but ignored.

### Edit Modes

| Mode | Description |
|------|-------------|
| `inpaint-insert` | Insert new content into masked area (default) |
| `inpaint-remove` | Remove objects from masked area, fill with background |
| `background-swap` | Replace background while keeping foreground |
| `outpaint` | Extend image beyond its original boundaries |

### Mask Modes

| Mode | Description |
|------|-------------|
| `user-provided` | Use mask_url image (default). Requires `mask_url` |
| `background` | Auto-detect and mask background |
| `foreground` | Auto-detect and mask foreground |
| `semantic` | Mask by semantic class IDs (requires `semantic_class`) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Description of what to generate/edit |
| `image_url` | string | **Yes** | -- | Source image URL |
| `model` | string | No | `gemini-3.1-flash-image` | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` |
| `edit_mode` | string | No | `inpaint-insert` | `inpaint-insert`, `inpaint-remove`, `background-swap`, `outpaint` |
| `mask_mode` | string | No | `user-provided` | `user-provided`, `background`, `foreground` (`semantic` → 400, no Gemini equivalent) |
| `mask_url` | string | **Yes** (when mask_mode=`user-provided`) | -- | Mask image URL — forwarded as reference image, approximate (`mask_is_approximate: true`) |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |
| `negative_prompt` | string | No | -- | Folded into the prompt text |
| `seed` | integer | No | random | Reproducibility seed |
| `guidance_scale` | float | No | -- | Accepted but ignored (no Gemini equivalent) |
| `mask_dilation` | float | No | -- | Accepted but ignored (no Gemini equivalent) |
| `sample_count` | integer | No | -- | Accepted but ignored (single output) |
| `semantic_class` | string | No | -- | No longer usable (`semantic` mask mode rejected) |
| `safety_setting` / `language` | string | No | -- | Accepted but ignored |

**S3 Path:** `inpaint/vertex/{inpaint_YYYYMMDD_HHMMSS_xxxxxxxx}.png`

---

---

# 14. STYLE TRANSFER (2 Provider)
> Bir gorsel uzerine baska bir gorselin veya onceden tanimli bir stilin uygulanmasi. S3 prefix: `styletransfer/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Description |
|---|----------|----------|-------------|
| 1 | fal.ai | `styletransfer-fal` | fal.ai Style Transfer (15 preset + custom) |
| 2 | Stability AI | `styletransfer-stability` | Stability Style Control |

## 14.1 styletransfer-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-styletransfer-fal` |
| **Lambda** | `ssm-content-worker-styletransfer-fal` |
| **Provider** | fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/image-apps-v2/style-transfer` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Style Presets
`impressionism`, `cubism`, `surrealism`, `pop_art`, `art_nouveau`, `abstract`, `watercolor`, `oil_painting`, `sketch`, `anime`, `pixel_art`, `low_poly`, `vaporwave`, `psychedelic`, `minimalist`

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `content_image_url` | string | **Yes** | -- | Source image URL (alias: `image_url`) |
| `style` | string | Conditional | -- | One of 15 presets above. Required if `style_image_url` not provided |
| `style_image_url` | string | Conditional | -- | Custom style reference URL. Required if `style` not provided |
| `prompt` | string | No | -- | Additional guidance. Max **5000** chars |
| `strength` | float | No | -- | Style strength. Range: **0.0--1.0** |
| `image_size` | string | No | -- | fal.ai size preset |
| `num_images` | integer | No | -- | Range: **1--4** |
| `output_format` | string | No | -- | Output format |

**S3 Path:** `styletransfer/fal/{styletransfer_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 14.2 styletransfer-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-styletransfer-stability` |
| **Lambda** | `ssm-content-worker-styletransfer-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/control/style` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Desired output description. Max **10000** chars |
| `image_url` | string | **Yes** | -- | Style reference image URL |
| `negative_prompt` | string | No | -- | What to avoid. Max **10000** chars |
| `fidelity` | float | No | -- | Style fidelity. Range: **0.0--1.0** |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |
| `aspect_ratio` | string | No | -- | Stability aspect ratios |

**S3 Path:** `styletransfer/stability/{styletransfer_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 15. SKETCH TO IMAGE (2 Provider)
> Cizim/sketch'ten gorsel uretimi. ControlNet (scribble) tabanli. S3 prefix: `sketch/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Description |
|---|----------|----------|-------------|
| 1 | fal.ai | `sketch-fal` | ControlNet SDXL Scribble |
| 2 | Stability AI | `sketch-stability` | Stability Sketch Control |

## 15.1 sketch-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sketch-fal` |
| **Lambda** | `ssm-content-worker-sketch-fal` |
| **Provider** | fal.ai ControlNet |
| **API URL** | `https://queue.fal.run/fal-ai/controlnetsdxl` (controlnet_type=scribble) |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Sketch/scribble image URL |
| `prompt` | string | **Yes** | -- | Desired output description. Max **5000** chars |
| `negative_prompt` | string | No | -- | What to avoid. Max **5000** chars |
| `controlnet_conditioning_scale` | float | No | -- | ControlNet strength. Range: **0.0--2.0** |
| `guidance_scale` | float | No | -- | Prompt adherence. Range: **0.0--20.0** |
| `num_inference_steps` | integer | No | -- | Denoising steps. Range: **1--100** |
| `seed` | integer | No | -- | Reproducibility seed |
| `image_size` | string | No | -- | fal.ai size preset |
| `num_images` | integer | No | -- | Range: **1--4** |

**S3 Path:** `sketch/fal/{sketch_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 15.2 sketch-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sketch-stability` |
| **Lambda** | `ssm-content-worker-sketch-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/control/sketch` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Desired output. Max **10000** chars |
| `image_url` | string | **Yes** | -- | Sketch image URL |
| `negative_prompt` | string | No | -- | What to avoid. Max **10000** chars |
| `control_strength` | float | No | -- | Sketch adherence. Range: **0.0--1.0** |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `sketch/stability/{sketch_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 16. SEARCH & REPLACE (1 Provider)
> Gorseldeki bir nesneyi bulup baskasıyla degistirme. S3 prefix: `searchreplace/stability/`.

## 16.1 searchreplace-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-searchreplace-stability` |
| **Lambda** | `ssm-content-worker-searchreplace-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/edit/search-and-replace` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | What to replace WITH. Max **10000** chars |
| `search_prompt` | string | **Yes** | -- | What to FIND in the image. Max **10000** chars |
| `image_url` | string | **Yes** | -- | Source image URL |
| `negative_prompt` | string | No | -- | What to avoid. Max **10000** chars |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |
| `grow_mask` | integer | No | -- | Mask expansion in pixels |

**S3 Path:** `searchreplace/stability/{searchreplace_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 17. RECOLOR (1 Provider)
> Gorseldeki belirli bir nesnenin rengini degistirme. S3 prefix: `recolor/stability/`.

## 17.1 recolor-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-recolor-stability` |
| **Lambda** | `ssm-content-worker-recolor-stability` |
| **Provider** | Stability AI |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/edit/search-and-recolor` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Desired color/style description. Max **10000** chars |
| `select_prompt` | string | **Yes** | -- | Object to recolor. Max **10000** chars |
| `image_url` | string | **Yes** | -- | Source image URL |
| `negative_prompt` | string | No | -- | What to avoid. Max **10000** chars |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |
| `grow_mask` | integer | No | -- | Mask expansion in pixels |

**S3 Path:** `recolor/stability/{recolor_stability_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 18. COLORIZE (1 Provider)
> Siyah-beyaz gorseli renkli hale getirme. S3 prefix: `colorize/fal/`.

## 18.1 colorize-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-colorize-fal` |
| **Lambda** | `ssm-content-worker-colorize-fal` |
| **Provider** | fal.ai (DDColor) |
| **API URL** | `https://queue.fal.run/fal-ai/ddcolor` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Black & white image URL |
| `prompt` | string | No | -- | Color guidance. Max **5000** chars |

**S3 Path:** `colorize/fal/{colorize_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 19. FACE SWAP (1 Provider)
> Bir gorseldeki yuzu baska bir yuzle degistirme. S3 prefix: `faceswap/fal/`.

## 19.1 faceswap-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-faceswap-fal` |
| **Lambda** | `ssm-content-worker-faceswap-fal` |
| **Provider** | fal.ai |
| **API URL** | `https://queue.fal.run/fal-ai/face-swap` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `source_image_url` | string | **Yes** | -- | Face source image URL (sent to API as `swap_image_url`) |
| `target_image_url` | string | **Yes** | -- | Target image to swap onto (sent to API as `base_image_url`) |

**S3 Path:** `faceswap/fal/{faceswap_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 20. FACE ID / IDENTITY-PRESERVING GENERATION (2 Provider)
> Kimlik koruyarak yeni gorseller uretme. S3 prefix: `faceid/{provider}/`.

### Provider & Model Overview

| # | Provider | Endpoint | Description |
|---|----------|----------|-------------|
| 1 | fal.ai PuLID | `faceid-fal` | PuLID identity-preserving generation |
| 2 | fal.ai InstantID | `faceid-instantid` | InstantID face-preserving generation |

## 20.1 faceid-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-faceid-fal` |
| **Lambda** | `ssm-content-worker-faceid-fal` |
| **Provider** | fal.ai PuLID |
| **API URL** | `https://queue.fal.run/fal-ai/pulid` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `reference_images` | array\<string\> | **Yes** | -- | Face reference image URLs |
| `prompt` | string | **Yes** | -- | Output description |
| `model` | string | No | `fal-ai/pulid` | `fal-ai/pulid`, `fal-ai/ip-adapter-face-id` |
| `negative_prompt` | string | No | -- | What to avoid |
| `id_scale` | float | No | -- | Identity preservation strength |
| `mode` | string | No | -- | Generation mode |
| `image_size` | string | No | -- | fal.ai size preset |
| `seed` | integer | No | -- | Reproducibility seed |
| `guidance_scale` | float | No | -- | Prompt adherence |
| `num_inference_steps` | integer | No | -- | Denoising steps |

**S3 Path:** `faceid/fal/{faceid_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

## 20.2 faceid-instantid

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-faceid-instantid` |
| **Lambda** | `ssm-content-worker-faceid-instantid` |
| **Provider** | fal.ai InstantID |
| **API URL** | `https://queue.fal.run/fal-ai/instant-id` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `face_image_url` | string | **Yes** | -- | Face reference image URL |
| `prompt` | string | **Yes** | -- | Output description |
| `negative_prompt` | string | No | -- | What to avoid |
| `ip_adapter_scale` | float | No | -- | Face preservation scale |
| `controlnet_conditioning_scale` | float | No | -- | Pose control |
| `image_size` | string | No | -- | fal.ai size preset |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `guidance_scale` | float | No | -- | Prompt adherence |
| `num_inference_steps` | integer | No | -- | Denoising steps |

**S3 Path:** `faceid/instantid/{faceid_instantid_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 21. LIVE PORTRAIT (1 Provider)
> Statik bir portreyi, bir video kaynagiyla canlandirma. Cikti: mp4 video. S3 prefix: `liveportrait/fal/`.

## 21.1 liveportrait-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-liveportrait-fal` |
| **Lambda** | `ssm-content-worker-liveportrait-fal` |
| **Provider** | fal.ai Live Portrait |
| **API URL** | `https://queue.fal.run/fal-ai/live-portrait` |
| **Package** | Zip (Lambda Layer) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |
| **Output** | mp4 video |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Portrait image URL |
| `video_url` | string | **Yes** | -- | Driving video URL (expressions/movements) |
| `dsize` | integer | No | -- | Detection size |
| `scale` | float | No | -- | Scale factor |
| `vx_ratio` | float | No | -- | Horizontal shift ratio |
| `vy_ratio` | float | No | -- | Vertical shift ratio |
| `lip_zero` | boolean | No | -- | Zero out lip movement |

**S3 Path:** `liveportrait/fal/{liveportrait_fal_YYYYMMDD_HHMMSS_xxxxxxxx}.mp4`

---

# 22. RESTYLE (1 Provider)
> Mevcut bir gorseli farkli stilde yeniden olusturma. S3 prefix: `restyle/kling/`.

## 22.1 restyle-kling

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-restyle-kling` |
| **Lambda** | `ssm-content-worker-restyle-kling` |
| **Provider** | Kling AI |
| **API URL** | `https://api.klingai.com/v1/images/generations` |
| **Package** | Zip (Lambda Layer with `PyJWT`) |
| **Auth** | JWT Bearer (HS256 from `KLING_ACCESS_KEY` + `KLING_SECRET_KEY`) |

### Modes

| Mode Value | Description |
|------------|-------------|
| `subject` | Subject-focused restyling (default) |
| `face` | Face-focused restyling |

### Models

| Model Value | Notes |
|-------------|-------|
| `kling-v1` | Kling v1 |
| `kling-v1-5` | Kling v1.5 |
| `kling-v2` | Kling v2 (default) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Desired style description |
| `image_url` | string | **Yes** | -- | Source image URL (sent as `image_reference` in mode) |
| `model_name` | string | No | `kling-v2` | `kling-v1`, `kling-v1-5`, `kling-v2` |
| `mode` | string | No | `subject` | `subject`, `face` |
| `aspect_ratio` | string | No | -- | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16` (validated) |
| `num_images` | integer | No | -- | Range: **1--4** (sent as `n`) |
| `image_fidelity` | float | No | -- | Image fidelity strength |
| `human_fidelity` | float | No | -- | Human fidelity strength (face/subject mode) |

**S3 Path:** `restyle/kling/{restyle_kling_YYYYMMDD_HHMMSS_xxxxxxxx}.{ext}`

---

# 23. TEXTURE / PBR MATERIAL (2 Provider)
> Gorsel uzerinde texture transform veya PBR material uretimi. S3 prefix: `texture/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `texture-fal` | `fal-ai/image-apps-v2/texture-transform` |
| 2 | Stability AI | `texture-stability` | SD3 (sd3 endpoint) |

## 23.1 texture-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-texture-fal` |
| **Lambda** | `ssm-content-worker-texture-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/image-apps-v2/texture-transform` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `texture` | string | **Yes** | -- | Texture type (e.g. `marble`, `wood`, `metal`, `fabric`) |
| `prompt` | string | No | -- | Additional guidance. Max **5000** chars |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `texture/fal/{texture_fal_...}.{ext}`

---

## 23.2 texture-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-texture-stability` |
| **Lambda** | `ssm-content-worker-texture-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/sd3` |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |
| **Content-Type** | `multipart/form-data` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Texture description. Max **10000** chars |
| `image_url` | string | No | -- | Reference image (enables img2img) |
| `strength` | float | No | `0.5` | Img2img strength. Range: **0.0--1.0** |
| `negative_prompt` | string | No | -- | Max **10000** chars |
| `aspect_ratio` | string | No | `1:1` | Stability aspect ratios |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `texture/stability/{texture_stability_...}.{ext}`

---

# 24. SKYBOX / HDRI (2 Provider)
> 360 derece panoramik skybox/HDRI uretimi. S3 prefix: `skybox/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `skybox-fal` | `fal-ai/hunyuan_world` |
| 2 | Blockade Labs | `skybox-blockade` | `blockade-skybox-model3` |

## 24.1 skybox-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-skybox-fal` |
| **Lambda** | `ssm-content-worker-skybox-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/hunyuan_world` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL (panorama basis) |
| `prompt` | string | No | -- | Description. Max **5000** chars |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `skybox/fal/{skybox_fal_...}.{ext}`

---

## 24.2 skybox-blockade

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-skybox-blockade` |
| **Lambda** | `ssm-content-worker-skybox-blockade` |
| **API URL** | `https://backend.blockadelabs.com/api/v1/skybox` |
| **Auth** | `BLOCKADE_API_KEY` Header: `x-api-key: {key}` |
| **Output** | Equirectangular 360 panoramic image |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Skybox description. Max **2000** chars |
| `skybox_style_id` | integer | No | -- | Style ID from `/styles?model_version=3` |
| `negative_text` | string | No | -- | What to avoid. Max **1000** chars |
| `enhance_prompt` | boolean | No | -- | AI prompt enhancement |
| `seed` | integer | No | -- | Range: **0--2147483647** |
| `remix_imagine_id` | integer | No | -- | Previous skybox ID for remix |
| `control_image` | string | No | -- | Control image URL (equirect 2:1, max 50MB) |
| `control_model` | string | No | `remix` | Control model type |
| `init_image` | string | No | -- | Init image URL (equirect 2:1, max 50MB) |
| `init_strength` | float | No | `0.5` | Range: **0.11--0.9** |

**S3 Path:** `skybox/blockade/{skybox_blockade_...}.{ext}`

---

# 25. DEPTH MAP (2 Provider)
> Gorsellerden derinlik haritasi cikarma. S3 prefix: `depthmap/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `depthmap-fal` | `fal-ai/imageutils/depth` |
| 2 | fal.ai Marigold | `depthmap-marigold` | `fal-ai/imageutils/marigold-depth` |

## 25.1 depthmap-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-depthmap-fal` |
| **Lambda** | `ssm-content-worker-depthmap-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/imageutils/depth` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |

**S3 Path:** `depthmap/fal/{depthmap_fal_...}.{ext}`

---

## 25.2 depthmap-marigold

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-depthmap-marigold` |
| **Lambda** | `ssm-content-worker-depthmap-marigold` |
| **API URL** | `https://queue.fal.run/fal-ai/imageutils/marigold-depth` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |

**S3 Path:** `depthmap/marigold/{depthmap_marigold_...}.{ext}`

---

# 26. NORMAL MAP (1 Provider)
> Gorsellerden normal map cikarma. S3 prefix: `normalmap/fal/`.

## 26.1 normalmap-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-normalmap-fal` |
| **Lambda** | `ssm-content-worker-normalmap-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/image-preprocessors/midas` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |

**S3 Path:** `normalmap/fal/{normalmap_fal_...}.{ext}`

---

# 27. SEGMENTATION (1 Provider)
> SAM (Segment Anything) ile gorsel segmentasyonu. S3 prefix: `segment/fal/`.

## 27.1 segment-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-segment-fal` |
| **Lambda** | `ssm-content-worker-segment-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/imageutils/sam` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Source image URL |
| `prompt` | string | No | -- | Text prompt for segment. Max **5000** chars |
| `point_prompts` | array | No | -- | Point coordinates for segmentation |
| `box_prompts` | array | No | -- | Bounding box prompts |

**S3 Path:** `segment/fal/{segment_fal_...}.{ext}`

---

# 28. PATTERN / TILEMAP (2 Provider)
> Seamless tileable pattern uretimi. S3 prefix: `pattern/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `pattern-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Stability AI | `pattern-stability` | SD3 (`tile-texture` preset) |

## 28.1 pattern-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-pattern-fal` |
| **Lambda** | `ssm-content-worker-pattern-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Pattern description. Max **5000** chars. Should include "seamless tileable pattern" |
| `aspect_ratio` | string | No | `square_hd` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3` (mapped to fal size) |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `guidance_scale` | float | No | -- | Prompt adherence |

**S3 Path:** `pattern/fal/{pattern_fal_...}.{ext}`

---

## 28.2 pattern-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-pattern-stability` |
| **Lambda** | `ssm-content-worker-pattern-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/sd3` |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Max **10000** chars |
| `aspect_ratio` | string | No | `1:1` | Stability aspect ratios |
| `style_preset` | string | No | `tile-texture` | Stability style presets |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `pattern/stability/{pattern_stability_...}.{ext}`

---

# 29. COLORING PAGE (2 Provider)
> Boyama sayfasi (siyah-beyaz line art) uretimi. Prompt otomatik olarak "black and white coloring page line art of" ile baslar. S3 prefix: `coloring/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `coloring-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Stability AI | `coloring-stability` | SD3 (`line-art` preset) |

## 29.1 coloring-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-coloringpage-fal` |
| **Lambda** | `ssm-content-worker-coloringpage-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Subject description. Max **5000** chars. Auto-prefixed |
| `aspect_ratio` | string | No | -- | fal.ai size or aspect ratio |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `coloring/fal/{coloring_fal_...}.{ext}`

---

## 29.2 coloring-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-coloringpage-stability` |
| **Lambda** | `ssm-content-worker-coloringpage-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/sd3` |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Subject description. Max **10000** chars. Auto-prefixed |
| `aspect_ratio` | string | No | `1:1` | Stability aspect ratios |
| `style_preset` | string | No | `line-art` | Stability style presets |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `coloring/stability/{coloring_stability_...}.{ext}`

---

# 30. STICKER / EMOJI (3 Provider)
> Die-cut sticker tasarimi. Prompt otomatik "die-cut sticker design, transparent background," ile baslar. S3 prefix: `sticker/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `sticker-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Stability AI | `sticker-stability` | SD3 |
| 3 | OpenAI | `sticker-openai` | `gpt-image-1` |

## 30.1 sticker-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sticker-fal` |
| **Lambda** | `ssm-content-worker-sticker-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sticker description. Max **5000** chars. Auto-prefixed |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3` |
| `negative_prompt` | string | No | -- | Max **5000** chars |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `sticker/fal/{sticker_fal_...}.{ext}`

---

## 30.2 sticker-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sticker-stability` |
| **Lambda** | `ssm-content-worker-sticker-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/sd3` |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sticker description. Max **10000** chars. Auto-prefixed |
| `aspect_ratio` | string | No | `1:1` | Stability aspect ratios |
| `negative_prompt` | string | No | -- | Max **10000** chars |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `sticker/stability/{sticker_stability_...}.{ext}`

---

## 30.3 sticker-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-sticker-openai` |
| **Lambda** | `ssm-content-worker-sticker-openai` |
| **API URL** | `https://api.openai.com/v1/images/generations` |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |

### Models

| Model Value | Notes |
|-------------|-------|
| `gpt-image-1` | Default |
| `gpt-image-1.5` | Enhanced version |
| `gpt-image-1-mini` | Smaller, faster |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Sticker description. Max **32000** chars. Auto-prefixed |
| `model` | string | No | `gpt-image-1` | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` |
| `size` | string | No | `1024x1024` | `1024x1024`, `1024x1536`, `1536x1024`, `auto` |
| `quality` | string | No | -- | `low`, `medium`, `high` |
| `background` | string | No | `transparent` | `transparent`, `opaque`, `auto` |
| `n` | integer | No | -- | Range: **1--4** |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `output_compression` | integer | No | -- | `0`--`100` (JPEG/WebP compression) |
| `moderation` | string | No | -- | `low`, `auto` |

**S3 Path:** `sticker/openai/{sticker_openai_...}.{ext}`

---

# 31. QR ART (1 Provider)
> QR kod gorselini artistik stilde donusturme. S3 prefix: `qrart/fal/`.

## 31.1 qrart-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-qrart-fal` |
| **Lambda** | `ssm-content-worker-qrart-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/illusion-diffusion` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | QR code image URL |
| `prompt` | string | **Yes** | -- | Art style description. Max **5000** chars |
| `negative_prompt` | string | No | -- | Max **5000** chars |
| `guidance_scale` | float | No | `7.5` | Prompt adherence |
| `num_inference_steps` | integer | No | -- | Range: **1--100** |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `qrart/fal/{qrart_fal_...}.{ext}`

---

# 32. MOCKUP (1 Provider)
> Urun gorselini bir yuzey/mockup uzerine yerlestirme. S3 prefix: `mockup/fal/`.

## 32.1 mockup-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-mockup-fal` |
| **Lambda** | `ssm-content-worker-mockup-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/inpaint` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `product_image_url` | string | **Yes** | -- | Product/design image URL |
| `mockup_image_url` | string | **Yes** | -- | Target surface/mockup URL |
| `prompt` | string | No | `place the product design naturally on the surface` | Placement instruction. Max **5000** chars |
| `mask_url` | string | No | -- | Mask URL for placement area |
| `strength` | float | No | -- | Inpaint strength. Range: **0.0--1.0** |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `mockup/fal/{mockup_fal_...}.{ext}`

---

# 33. PRODUCT PHOTO (3 Provider)
> Urun fotografi arka plan degisimi / profesyonel urun cekimi. S3 prefix: `productphoto/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `productphoto-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Stability AI | `productphoto-stability` | Stability Search & Replace |
| 3 | Vertex AI | `productphoto-vertex` | `gemini-3.1-flash-image` prompt-driven editing (`imagen-3.0-capability-001` retired 2026-06-30) |

## 33.1 productphoto-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-productphoto-fal` |
| **Lambda** | `ssm-content-worker-productphoto-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Product image URL |
| `prompt` | string | **Yes** | -- | Scene description. Max **5000** chars |
| `negative_prompt` | string | No | -- | Max **5000** chars |
| `aspect_ratio` | string | No | -- | `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `1:1` |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `guidance_scale` | float | No | -- | Range: **0.0--20.0** |

**S3 Path:** `productphoto/fal/{productphoto_fal_...}.{ext}`

---

## 33.2 productphoto-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-productphoto-stability` |
| **Lambda** | `ssm-content-worker-productphoto-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/edit/search-and-replace` |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Product image URL |
| `prompt` | string | **Yes** | -- | New background description. Max **10000** chars |
| `search_prompt` | string | No | `background` | Object to replace. Max **10000** chars |
| `negative_prompt` | string | No | -- | Max **10000** chars |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `productphoto/stability/{productphoto_stability_...}.{ext}`

---

## 33.3 productphoto-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-productphoto-vertex` |
| **Lambda** | `ssm-content-worker-productphoto-vertex` |
| **Provider** | Vertex AI — Gemini image (prompt-driven editing) |
| **Model** | `gemini-3.1-flash-image` |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

> **Migration note (2026-08-12, live-verified):** `imagen-3.0-capability-001` was discontinued by
> Google on 2026-06-30. Background swap now runs as prompt-driven editing on
> `gemini-3.1-flash-image:generateContent` with an explicit keep-the-product instruction. An optional
> `mask_image_url` is forwarded as a reference image (`mask_is_approximate: true` in the response);
> `sample_count` and `guidance_scale` are accepted but ignored.

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `image_url` | string | **Yes** | -- | Product image URL |
| `prompt` | string | **Yes** | -- | New background description |
| `model` | string | No | `gemini-3.1-flash-image` | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` |
| `edit_mode` | string | No | `background-swap` | Edit mode (kept for compatibility; drives the instruction) |
| `mask_mode` | string | No | `background` | Mask mode (kept for compatibility) |
| `mask_image_url` | string | No | -- | Optional mask, forwarded as reference image (`mask_is_approximate: true`) |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |
| `negative_prompt` | string | No | -- | Folded into the prompt text |
| `seed` | integer | No | -- | Reproducibility seed |
| `sample_count` | integer | No | -- | Accepted but ignored (single output) |

**S3 Path:** `productphoto/vertex/{productphoto_vertex_...}.{ext}`

---

# 34. VOICE CLONE (1 Provider)
> Ses klonlama. S3 prefix: `voiceclone/elevenlabs/`.

## 34.1 voiceclone-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voiceclone-elevenlabs` |
| **Lambda** | `ssm-content-worker-voiceclone-elevenlabs` |
| **API URL** | `https://api.elevenlabs.io/v1/voices/add` |
| **Auth** | `ELEVENLABS_API_KEY` Header: `xi-api-key: {key}` |
| **Content-Type** | `multipart/form-data` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `name` | string | **Yes** | -- | Voice name |
| `audio_urls` | array\<string\> | **Yes** | -- | Audio sample URLs (min 1) |
| `description` | string | No | -- | Voice description |
| `labels` | object | No | -- | Key-value labels |

**S3 Path:** `voiceclone/elevenlabs/{voiceclone_elevenlabs_...}.json`

---

# 35. SPEECH-TO-SPEECH (1 Provider)
> Ses donusumu -- bir sesi baska bir ses ile yeniden sentezleme. S3 prefix: `speechtospeech/elevenlabs/`.

## 35.1 speechtospeech-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-speechtospeech-elevenlabs` |
| **Lambda** | `ssm-content-worker-speechtospeech-elevenlabs` |
| **API URL** | `https://api.elevenlabs.io/v1/speech-to-speech/{voice_id}` |
| **Auth** | `ELEVENLABS_API_KEY` Header: `xi-api-key: {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `audio_url` | string | **Yes** | -- | Source audio URL |
| `voice_id` | string | **Yes** | -- | Target voice ID |
| `model_id` | string | No | `eleven_english_sts_v2` | ElevenLabs STS model |
| `stability` | float | No | -- | Range: **0.0--1.0** |
| `similarity_boost` | float | No | -- | Range: **0.0--1.0** |
| `style` | float | No | -- | Range: **0.0--1.0** |
| `use_speaker_boost` | boolean | No | -- | Speaker boost |

**S3 Path:** `speechtospeech/elevenlabs/{speechtospeech_elevenlabs_...}.mp3`

---

# 36. VOICE DESIGN (1 Provider)
> Metin aciklamasindan yeni ses olusturma. S3 prefix: `voicedesign/elevenlabs/`.

## 36.1 voicedesign-elevenlabs

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-voicedesign-elevenlabs` |
| **Lambda** | `ssm-content-worker-voicedesign-elevenlabs` |
| **API URL** | `https://api.elevenlabs.io/v1/text-to-voice/create-previews` |
| **Auth** | `ELEVENLABS_API_KEY` Header: `xi-api-key: {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `voice_description` | string | **Yes** | -- | Voice description. Max **1000** chars. Recommended min ~100 chars |
| `text` | string | **Yes** | -- | Preview text to speak |
| `output_format` | string | No | -- | ElevenLabs output format (sent as query param to API) |

**S3 Path:** `voicedesign/elevenlabs/{voicedesign_elevenlabs_...}.mp3`

---

# 37. DIALOGUE / SCRIPT (2 Provider)
> Coklu karakter diyalog/script uretimi. S3 prefix: `dialogue/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | OpenAI | `dialogue-openai` | `gpt-4o` / `gpt-4o-mini` |
| 2 | Vertex AI | `dialogue-vertex` | `gemini-2.5-pro` (default), `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash` |

## 37.1 dialogue-openai

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-dialogue-openai` |
| **Lambda** | `ssm-content-worker-dialogue-openai` |
| **API URL** | `https://api.openai.com/v1/chat/completions` |
| **Auth** | `OPENAI_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Dialogue scenario/instructions |
| `characters` | array\<object\> | No | -- | `[{name, personality, voice_style}]` |
| `scene_context` | string | No | -- | Scene description |
| `tone` | string | No | -- | Dialogue tone |
| `model` | string | No | `gpt-4o` | `gpt-4o`, `gpt-4o-mini` |
| `max_tokens` | integer | No | `2000` | Max output tokens |
| `temperature` | float | No | `0.8` | Range: **0.0--2.0** |

**S3 Path:** `dialogue/openai/{dialogue_openai_...}.json`

---

## 37.2 dialogue-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-dialogue-vertex` |
| **Lambda** | `ssm-content-worker-dialogue-vertex` |
| **Provider** | Vertex AI Gemini |
| **Models** | `gemini-2.5-pro` (default), `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash` |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

### Parameters

> **Corrected 2026-08-12 (audited against the deployed worker source):** default model is
> `gemini-2.5-pro` (not `-flash`); `characters`/`scene_context` are NOT accepted — the worker takes
> `system_prompt`, `character_name`, `language`, `num_dialogues` instead.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Dialogue scenario/instructions |
| `model` | string | No | `gemini-2.5-pro` | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash` (invalid value → 400) |
| `system_prompt` | string | No | built-in | Overrides the default system prompt |
| `character_name` | string | No | -- | Character the lines belong to |
| `tone` | string | No | -- | Dialogue tone |
| `language` | string | No | `en` | Output language |
| `num_dialogues` | integer | No | `5` | `1`-`10` |
| `max_tokens` | integer | No | `2000` | `100`-`4096` |
| `temperature` | float | No | `0.8` | `0.0`-`2.0` |
| `top_p` / `top_k` / `stop_sequences` | -- | No | -- | Forwarded to `generationConfig` |

**S3 Path:** `dialogue/vertex/{dialogue_vertex_...}.json`

---

# 38. TRANSLATION (2 Provider)
> Metin ceviri. S3 prefix: `translation/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | DeepL | `translation-deepl` | DeepL API |
| 2 | Vertex AI | `translation-vertex` | `gemini-2.5-flash` (default), `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-2.0-flash` |

## 38.1 translation-deepl

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-translation-deepl` |
| **Lambda** | `ssm-content-worker-translation-deepl` |
| **API URL** | `https://api-free.deepl.com/v2/translate` |
| **Auth** | `DEEPL_API_KEY` Header: `Authorization: DeepL-Auth-Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Text to translate |
| `target_lang` | string | **Yes** | -- | Target language code (e.g. `EN`, `DE`, `FR`, `TR`, `JA`, `KO`, `ZH`) |
| `source_lang` | string | No | auto-detect | Source language code |
| `formality` | string | No | -- | `default`, `more`, `less`, `prefer_more`, `prefer_less` |
| `preserve_formatting` | boolean | No | -- | Preserve formatting |
| `tag_handling` | string | No | -- | `xml`, `html` |
| `glossary_id` | string | No | -- | DeepL glossary ID |

**S3 Path:** `translation/deepl/{translation_deepl_...}.json`

---

## 38.2 translation-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-translation-vertex` |
| **Lambda** | `ssm-content-worker-translation-vertex` |
| **Provider** | Vertex AI Gemini |
| **Models** | `gemini-2.5-flash` (default), `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-2.0-flash` |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

### Parameters

> **Corrected 2026-08-12 (audited against the deployed worker source):** the required field is
> **`target_language`**, not `target_lang` — a request with `target_lang` alone FAILS with
> `target_language is required`. Source field is `source_language`. `tone` is not accepted;
> `formality` is.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Text to translate |
| `target_language` | string | **Yes** | -- | Target language name or code |
| `model` | string | No | `gemini-2.5-flash` | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash` (invalid value silently falls back to default) |
| `source_language` | string | No | auto-detect | Source language |
| `context` | string | No | -- | Additional context for better translation |
| `formality` | string | No | `neutral` | `formal`, `informal`, `neutral` (other values → 400) |
| `temperature` | float | No | `0.3` | Forwarded to `generationConfig` |
| `top_p` / `top_k` | -- | No | -- | Forwarded to `generationConfig` |

**S3 Path:** `translation/vertex/{translation_vertex_...}.json`

---

# 39. TRANSCRIPTION (2 Provider)
> Ses/video dosyasini metne donusturme. S3 prefix: `transcription/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | AWS | `transcription-aws` | Amazon Transcribe |
| 2 | fal.ai | `transcription-fal` | Whisper (fal.ai) |

## 39.1 transcription-aws

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-transcription-aws` |
| **Lambda** | `ssm-content-worker-transcription-aws` |
| **Provider** | AWS Transcribe |
| **Auth** | IAM Role (Lambda execution role) |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `audio_url` | string | **Yes** | -- | Audio/video file URL |
| `language_code` | string | No | auto-detect | AWS language code (e.g. `en-US`, `tr-TR`, `de-DE`) |
| `media_format` | string | No | auto-detect | `mp3`, `mp4`, `wav`, `flac`, `ogg`, `amr`, `webm` |

**S3 Path:** `transcription/aws/{transcription_aws_...}.json`

---

## 39.2 transcription-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-transcription-fal` |
| **Lambda** | `ssm-content-worker-transcription-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/whisper` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `audio_url` | string | **Yes** | -- | Audio/video file URL |
| `language` | string | No | auto-detect | ISO language code |
| `task` | string | No | `transcribe` | `transcribe`, `translate` |
| `chunk_level` | string | No | -- | `segment`, `word` |
| `version` | string | No | -- | Whisper model version |

**S3 Path:** `transcription/fal/{transcription_fal_...}.json`

---

# 40. COMIC / STORYBOARD (2 Provider)
> Cizgi roman / storyboard panel uretimi. S3 prefix: `comic/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `comic-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Vertex AI | `comic-vertex` | Imagen |

## 40.1 comic-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-comic-fal` |
| **Lambda** | `ssm-content-worker-comic-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Panel/scene description. Max **5000** chars |
| `comic_style` | string | No | `manga` | `manga`, `western`, `webcomic`, `graphic_novel`, `franco_belgian` |
| `panel_layout` | string | No | `single` | `single`, `strip_3`, `strip_4`, `grid_2x2`, `grid_2x3` |
| `aspect_ratio` | string | No | -- | fal.ai aspect ratio |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `comic/fal/{comic_fal_...}.{ext}`

---

## 40.2 comic-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-comic-vertex` |
| **Lambda** | `ssm-content-worker-comic-vertex` |
| **Provider** | Vertex AI — Gemini image (`gemini-3.1-flash-image`) |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

### Parameters

> **Corrected 2026-08-12 (live-measured):** the deployed worker requires `panels`, not a bare
> `prompt` — a prompt-only request FAILS with `panels is required (array of {prompt, panel_number})`.

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `panels` | array\<object\> | **Yes** | -- | `[{prompt: string, panel_number: integer}]` — one entry per panel |
| `prompt` | string | No | -- | Overall scene description (panel prompts drive generation) |
| `model` | string | No | `gemini-3.1-flash-image` | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` |
| `comic_style` | string | No | `manga` | Same as comic-fal |
| `panel_layout` | string | No | `single` | Same as comic-fal |
| `aspect_ratio` | string | No | -- | Vertex aspect ratios |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |
| `negative_prompt` | string | No | -- | Folded into the prompt text |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `comic/vertex/{comic_vertex_...}.{ext}`

---

# 41. TATTOO DESIGN (2 Provider)
> Dovme tasarimi uretimi. Prompt otomatik olarak stil/placement/size bilgisi ile zenginlestirilir. S3 prefix: `tattoo/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `tattoo-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Stability AI | `tattoo-stability` | SD3 |

### Tattoo Styles (Her iki provider icin ortak)
`minimal` (default), `tribal`, `watercolor`, `japanese`, `blackwork`, `geometric`, `traditional`, `neo_traditional`, `dotwork`, `realistic`

### Placements
`arm`, `back`, `chest`, `leg`, `wrist`, `ankle`, `shoulder`, `ribs`

### Sizes
`small`, `medium`, `large`

## 41.1 tattoo-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-tattoo-fal` |
| **Lambda** | `ssm-content-worker-tattoo-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Tattoo description. Max **5000** chars |
| `style` | string | No | `minimal` | See styles table above (10 values) |
| `placement` | string | No | -- | See placements above (8 values) |
| `size` | string | No | -- | `small`, `medium`, `large` |
| `aspect_ratio` | string | No | `1:1` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3` |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `guidance_scale` | float | No | -- | Range: **0.0--20.0** |

**S3 Path:** `tattoo/fal/{tattoo_fal_...}.{ext}`

---

## 41.2 tattoo-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-tattoo-stability` |
| **Lambda** | `ssm-content-worker-tattoo-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/sd3` |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Tattoo description. Max **10000** chars |
| `negative_prompt` | string | No | -- | Free text |
| `style` | string | No | `minimal` | See styles table above (10 values) |
| `placement` | string | No | -- | See placements above (8 values) |
| `size` | string | No | -- | `small`, `medium`, `large` |
| `aspect_ratio` | string | No | `1:1` | Stability aspect ratios |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |
| `image_url` | string | No | -- | Source image for img2img tattoo generation |
| `strength` | float | No | 0.5 | Img2img denoising strength (0.0-1.0) |

**S3 Path:** `tattoo/stability/{tattoo_stability_...}.{ext}`

---

# 42. ARCHITECTURAL RENDER (2 Provider)
> Mimari render uretimi. Iki mod: text-to-image ve image-guided (ControlNet/Structure). S3 prefix: `archrender/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `archrender-fal` | FLUX Pro / ControlNet SDXL |
| 2 | Stability AI | `archrender-stability` | SD3 / Structure Control |

### Render Types (ortak)
`interior` (default), `exterior`, `aerial`, `section`, `elevation`

### Styles (ortak)
`modern`, `minimalist`, `classical`, `industrial`, `scandinavian`, `japanese`, `art_deco`

### Lighting (ortak)
`natural`, `studio`, `warm`, `cool`, `dramatic`, `golden_hour`

## 42.1 archrender-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-archrender-fal` |
| **Lambda** | `ssm-content-worker-archrender-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` (text) / `https://queue.fal.run/fal-ai/controlnetsdxl` (image-guided) |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Render description. Max **5000** chars |
| `image_url` | string | No | -- | Reference image (switches to ControlNet depth mode) |
| `render_type` | string | No | `interior` | `interior`, `exterior`, `aerial`, `section`, `elevation` |
| `style` | string | No | -- | `modern`, `minimalist`, `classical`, `industrial`, `scandinavian`, `japanese`, `art_deco` |
| `lighting` | string | No | -- | `natural`, `studio`, `warm`, `cool`, `dramatic`, `golden_hour` |
| `aspect_ratio` | string | No | `16:9` | Standard aspect ratios (text mode only) |
| `num_images` | integer | No | -- | Range: **1--4** |
| `seed` | integer | No | -- | Reproducibility seed |
| `guidance_scale` | float | No | -- | Range: **0.0--20.0** |
| `controlnet_conditioning_scale` | float | No | -- | Range: **0.0--2.0** (image-guided only) |

**S3 Path:** `archrender/fal/{archrender_fal_...}.{ext}`

---

## 42.2 archrender-stability

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-archrender-stability` |
| **Lambda** | `ssm-content-worker-archrender-stability` |
| **API URL** | `https://api.stability.ai/v2beta/stable-image/generate/sd3` (text) / `.../control/structure` (image-guided) |
| **Auth** | `STABILITY_API_KEY` Header: `Authorization: Bearer {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Render description. Max **10000** chars |
| `image_url` | string | No | -- | Reference image (switches to structure control mode) |
| `render_type` | string | No | `interior` | `interior`, `exterior`, `aerial`, `section`, `elevation` |
| `style` | string | No | -- | See styles above (7 values) |
| `lighting` | string | No | -- | See lighting above (6 values) |
| `aspect_ratio` | string | No | `16:9` | Stability aspect ratios (text mode only) |
| `output_format` | string | No | `png` | `png`, `jpeg`, `webp` |
| `seed` | integer | No | -- | Reproducibility seed |
| `control_strength` | float | No | -- | Range: **0.0--1.0** (image-guided only) |

**S3 Path:** `archrender/stability/{archrender_stability_...}.{ext}`

---

# 43. VECTOR / SVG (1 Provider)
> Vektor/SVG illustrasyon uretimi. Recraft V3 ile. S3 prefix: `vector/fal/`.

## 43.1 vector-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-vector-fal` |
| **Lambda** | `ssm-content-worker-vector-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/recraft/v3/text-to-image` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Vector description. Max **5000** chars |
| `style` | string | No | `vector_illustration` | `vector_illustration`, `icon`, `logo`, `flat_2` |
| `output_format` | string | No | `svg` | `svg`, `png` |
| `colors` | array\<string\> | No | -- | Hex color strings (e.g. `["#FF0000", "#00FF00"]`) |
| `aspect_ratio` | string | No | `1:1` | `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `1:1` |

**S3 Path:** `vector/fal/{vector_fal_...}.svg`

---

# 44. PRESENTATION / SLIDE (2 Provider)
> Sunum slayt gorselleri uretimi (batch). S3 prefix: `presentation/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `presentation-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Vertex AI | `presentation-vertex` | `gemini-3.1-flash-image` (default), `gemini-3-pro-image`, `gemini-2.5-flash-image` (legacy `imagen-*` values aliased; Imagen retired 2026-06-30) |

### Styles (ortak)
`corporate` (default), `creative`, `minimal`, `dark`, `gradient`, `tech`, `academic`, `startup`

## 44.1 presentation-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-presentation-fal` |
| **Lambda** | `ssm-content-worker-presentation-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `slides` | array\<object\> | **Yes** | -- | `[{title: string, content: string}]` -- each slide generates one image |
| `style` | string | No | `corporate` | See styles above (8 values) |
| `brand_color` | string | No | -- | Color string (e.g. `#2563EB`) |
| `seed` | integer | No | -- | Reproducibility seed (incremented per slide) |

**S3 Path:** `presentation/fal/{presentation_fal_...}_slide{N}.{ext}`

---

## 44.2 presentation-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-presentation-vertex` |
| **Lambda** | `ssm-content-worker-presentation-vertex` |
| **Provider** | Vertex AI — Gemini image (`gemini-3.1-flash-image`) |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

> **Migration note (2026-08-12, live-verified):** migrated off the retired Imagen `:predict` models
> to `gemini-3.1-flash-image:generateContent` (legacy `imagen-*` model values are aliased).
> `negative_prompt` is folded into the prompt; `add_watermark`, `enhance_prompt`, `language`,
> `safety_setting` are accepted but ignored (SynthID always on).

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `slides` | array\<object\> | **Yes** | -- | `[{title: string, content: string}]` |
| `model` | string | No | `gemini-3.1-flash-image` | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` (legacy `imagen-*` aliased) |
| `style` | string | No | `corporate` | See styles above (8 values) |
| `brand_color` | string | No | -- | Color string |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |
| `negative_prompt` | string | No | -- | Folded into the prompt text |
| `seed` | integer | No | -- | Reproducibility seed (incremented per slide) |

**S3 Path:** `presentation/vertex/{presentation_vertex_...}_slide{N}.{ext}`

---

# 45. INFOGRAPHIC (2 Provider)
> Infografik gorsel uretimi. S3 prefix: `infographic/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `infographic-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Vertex AI | `infographic-vertex` | `gemini-3.1-flash-image` (Imagen retired 2026-06-30; legacy `imagen-*` values aliased) |

### Infographic Types (ortak)
`timeline`, `comparison`, `process`, `statistics` (default), `funnel`, `flowchart`, `checklist`, `hierarchy`, `mind_map`

### Styles (ortak)
`flat` (default), `gradient`, `isometric`, `minimal`, `bold`, `corporate`, `infographic_classic`

## 45.1 infographic-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-infographic-fal` |
| **Lambda** | `ssm-content-worker-infographic-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Infographic description. Max **5000** chars |
| `infographic_type` | string | No | `statistics` | See types above (9 values) |
| `style` | string | No | `flat` | See styles above (7 values) |
| `title` | string | No | -- | Infographic title |
| `data_points` | array\<object\> | No | `[]` | `[{label: string, value: string}]` -- max 20 items |
| `color_scheme` | string | No | -- | Color scheme description |
| `width` | integer | No | `1080` | Output width px |
| `height` | integer | No | `1920` | Output height px |
| `seed` | integer | No | -- | Reproducibility seed |
| `num_images` | integer | No | -- | Range: **1--4** |

**S3 Path:** `infographic/fal/{infographic_fal_...}.{ext}`

---

## 45.2 infographic-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-infographic-vertex` |
| **Lambda** | `ssm-content-worker-infographic-vertex` |
| **Provider** | Vertex AI — Gemini image (`gemini-3.1-flash-image`) |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Infographic description |
| `model` | string | No | `gemini-3.1-flash-image` | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` |
| `infographic_type` | string | No | `statistics` | See types above (9 values) |
| `style` | string | No | `flat` | See styles above (7 values) |
| `title` | string | No | -- | Infographic title |
| `data_points` | array\<object\> | No | `[]` | `[{label, value}]` -- max 20 |
| `aspect_ratio` | string | No | `9:16` | Vertex aspect ratios |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |
| `negative_prompt` | string | No | -- | Folded into the prompt text |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `infographic/vertex/{infographic_vertex_...}.{ext}`

---

# 46. TERRAIN / HEIGHTMAP (1 Provider)
> Oyun icin terrain heightmap ve splatmap uretimi. S3 prefix: `terrain/fal/`.

## 46.1 terrain-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-terrain-fal` |
| **Lambda** | `ssm-content-worker-terrain-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Terrain Types
`mountains` (default), `desert`, `plains`, `volcanic`, `islands`, `canyon`, `arctic`, `forest`, `alien`, `underwater`, `custom`

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Terrain description. Max **5000** chars |
| `terrain_type` | string | No | `mountains` | See terrain types above (11 values) |
| `map_type` | string | No | `heightmap` | `heightmap`, `splatmap`, `both` |
| `resolution` | integer | No | `1024` | `256`, `512`, `1024`, `2048`, `4096` |
| `seed` | integer | No | -- | Reproducibility seed (splatmap gets seed+1) |
| `erosion_level` | string | No | `medium` | Erosion descriptor (used in prompt) |
| `seamless` | boolean | No | `true` | Seamless tiling |

**S3 Path:** `terrain/fal/{terrain_fal_...}_heightmap.png` / `{...}_splatmap.png`

---

# 47. VFX / PARTICLE EFFECTS (1 Provider)
> Oyun VFX sprite sheet / tek frame / sekans uretimi. S3 prefix: `vfx/fal/`.

## 47.1 vfx-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-vfx-fal` |
| **Lambda** | `ssm-content-worker-vfx-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Effect Types
`explosion` (default), `fire`, `smoke`, `fog`, `lightning`, `magic`, `sparkle`, `water_splash`, `blood`, `dust`, `snow`, `rain`, `portal`, `shield`, `laser`, `custom`

### Output Formats

| Format | Description |
|--------|-------------|
| `sprite_sheet` | Single image grid (default) |
| `single_frame` | Single VFX frame |
| `sequence` | Multiple individual frames |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | VFX description. Max **5000** chars |
| `effect_type` | string | No | `explosion` | See effect types above (16 values) |
| `output_format` | string | No | `sprite_sheet` | `sprite_sheet`, `single_frame`, `sequence` |
| `grid_cols` | integer | No | `4` | Sprite sheet columns |
| `grid_rows` | integer | No | `4` | Sprite sheet rows |
| `frame_size` | integer | No | `256` | Frame size in pixels |
| `color_palette` | string | No | -- | Color palette description |
| `intensity` | string | No | `medium` | Intensity descriptor |
| `transparent_bg` | boolean | No | `true` | Transparent background |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `vfx/fal/{vfx_fal_...}.png`

---

# 48. FONT / TYPOGRAPHY (1 Provider)
> Tipografi gorsel / glyph sheet uretimi. S3 prefix: `font/fal/`.

## 48.1 font-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-font-fal` |
| **Lambda** | `ssm-content-worker-font-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Font Styles
`serif`, `sans_serif`, `script`, `display` (default), `handwritten`, `monospace`, `gothic`, `art_deco`, `grunge`, `pixel`, `retro`, `futuristic`, `calligraphy`, `brush`, `stencil`, `custom`

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `text` | string | **Yes** | -- | Characters/word to render |
| `prompt` | string | No | -- | Additional style description |
| `font_style` | string | No | `display` | See font styles above (16 values) |
| `color` | string | No | `white` | Text color |
| `background` | string | No | `transparent` | Background type |
| `weight` | string | No | `bold` | Font weight descriptor |
| `generate_alphabet` | boolean | No | `false` | Generate A-Z + 0-9 glyph sheet |
| `seed` | integer | No | -- | Seed (incremented per glyph if alphabet) |

**S3 Path:** `font/fal/{font_fal_...}.png`

---

# 49. DOCUMENT DESIGN (2 Provider)
> Dokuman gorsel sablonu uretimi (resume, certificate, flyer, poster, vb). S3 prefix: `document/{provider}/`.

| # | Provider | Endpoint | Model |
|---|----------|----------|-------|
| 1 | fal.ai | `document-fal` | `fal-ai/flux-pro/v1.1` |
| 2 | Vertex AI | `document-vertex` | `gemini-3.1-flash-image` (default), `gemini-3-pro-image`, `gemini-2.5-flash-image` (legacy `imagen-*` values aliased; Imagen retired 2026-06-30) |

### Document Types (ortak)
`resume`, `certificate`, `brochure`, `flyer` (default), `poster`, `business_card`, `letterhead`, `invoice`, `menu`, `event_ticket`, `id_card`, `report_cover`

### Styles (ortak)
`modern` (default), `classic`, `minimal`, `creative`, `corporate`, `elegant`, `bold`, `playful`

## 49.1 document-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-document-fal` |
| **Lambda** | `ssm-content-worker-document-fal` |
| **API URL** | `https://queue.fal.run/fal-ai/flux-pro/v1.1` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Document description. Max **5000** chars |
| `doc_type` | string | No | `flyer` | See doc types above (12 values) |
| `style` | string | No | `modern` | See styles above (8 values) |
| `title` | string | No | -- | Document title |
| `subtitle` | string | No | -- | Subtitle |
| `brand_color` | string | No | -- | Brand color |
| `company_name` | string | No | -- | Company name |
| `seed` | integer | No | -- | Reproducibility seed |
| `num_images` | integer | No | -- | Range: **1--4** |

> Output dimensions auto-selected by `doc_type` (e.g. poster=1080x1920, business_card=1050x600).

**S3 Path:** `document/fal/{document_fal_...}.{ext}`

---

## 49.2 document-vertex

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-document-vertex` |
| **Lambda** | `ssm-content-worker-document-vertex` |
| **Provider** | Vertex AI — Gemini image (`gemini-3.1-flash-image`) |
| **Package** | ZIP |
| **Auth** | Workload Identity Federation |

### Parameters

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `prompt` | string | **Yes** | -- | Document description |
| `model` | string | No | `gemini-3.1-flash-image` | `gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image` (legacy `imagen-*` aliased) |
| `doc_type` | string | No | `flyer` | See doc types above (12 values) |
| `style` | string | No | `modern` | See styles above (8 values) |
| `title` | string | No | -- | Document title |
| `aspect_ratio` | string | No | `3:4` | Vertex aspect ratios |
| `sample_image_size` | string | No | -- | `512`, `1K`, `2K`, `4K` |
| `person_generation` | string | No | -- | `allow_all`, `allow_adult`, `dont_allow` |
| `output_mime_type` | string | No | `image/png` | `image/png`, `image/jpeg` (honoured in stored file + ContentType) |
| `compression_quality` | integer | No | -- | `0`-`100` (JPEG only) |
| `negative_prompt` | string | No | -- | Folded into the prompt text |
| `seed` | integer | No | -- | Reproducibility seed |

**S3 Path:** `document/vertex/{document_vertex_...}.{ext}`

---

# 50. POSE GENERATION / ESTIMATION (1 Provider)
> Iki mod: (1) `generate` -- prompt'tan poz gorseli uretimi, (2) `estimate` -- gorsellerden poz tahmini. S3 prefix: `pose/fal/`.

## 50.1 pose-fal

**Status:** ✅ Ready on Production

| | |
|---|---|
| **Endpoint** | `POST /create-pose-fal` |
| **Lambda** | `ssm-content-worker-pose-fal` |
| **API URL** | Generate: `https://queue.fal.run/fal-ai/flux-pro/v1.1` / Estimate: `https://queue.fal.run/fal-ai/dwpose` |
| **Auth** | `FAL_API_KEY` Header: `Key {key}` |

### Modes

| Mode | Description |
|------|-------------|
| `generate` | Text-to-pose image generation (default) |
| `estimate` | Pose estimation from existing image |

### Pose Types (generate mode)
`standing` (default), `walking`, `running`, `sitting`, `jumping`, `fighting`, `dancing`, `idle`, `crouching`, `flying`, `swimming`, `custom`

### Character Types (generate mode)
`human` (default), `anime`, `cartoon`, `robot`, `creature`, `chibi`

### Parameters (generate mode)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `mode` | string | No | `generate` | `generate`, `estimate` |
| `prompt` | string | **Yes** | -- | Pose description. Max **5000** chars |
| `pose_type` | string | No | `standing` | See pose types above (12 values) |
| `character_type` | string | No | `human` | See character types above (6 values) |
| `view_angle` | string | No | `front` | View angle descriptor |
| `num_poses` | integer | No | `1` | Range: **1--4** |
| `with_skeleton` | boolean | No | -- | Add skeletal overlay |
| `seed` | integer | No | -- | Reproducibility seed |

### Parameters (estimate mode)

| Parameter | Type | Required | Default | Allowed Values |
|-----------|------|----------|---------|----------------|
| `mode` | string | **Yes** | -- | Must be `estimate` |
| `image_url` | string | **Yes** | -- | Image URL to estimate pose from |

**S3 Path:** `pose/fal/{pose_fal_...}.{ext}`

---

# APPENDIX: Full Handler Index (173 Deployed Worker Lambda)

| # | Content Type | Provider | Endpoint | Lambda Function |
|---|-------------|----------|----------|-----------------|
| 1 | image | vertex | `/create-image-vertex` | `ssm-content-worker-image-vertex` |
| 2 | image | openai | `/create-image-openai` | `ssm-content-worker-image-openai` |
| 3 | image | stability | `/create-image-stability` | `ssm-content-worker-image-stability` |
| 4 | image | fal | `/create-image-fal` | `ssm-content-worker-image-fal` |
| 5 | image | luma | `/create-image-luma` | `ssm-content-worker-image-luma` |
| 6 | image | kling | `/create-image-kling` | `ssm-content-worker-image-kling` |
| 7 | image | runway | `/create-image-runway` | `ssm-content-worker-image-runway` |
| 8 | image | flux | `/create-image-flux` | `ssm-content-worker-image-flux` |
| 9 | image | ideogram | `/create-image-ideogram` | `ssm-content-worker-image-ideogram` |
| 10 | image | recraft | `/create-image-recraft` | `ssm-content-worker-image-recraft` |
| 11 | image | nano | `/create-image-nano` | `ssm-content-worker-image-nano` |
| 12 | image | qwen | `/create-image-qwen` | `ssm-content-worker-image-qwen` |
| 13 | image | seedream | `/create-image-seedream` | `ssm-content-worker-image-seedream` |
| 14 | avatar | vertex | `/create-avatar-vertex` | `ssm-content-worker-avatar-vertex` |
| 15 | avatar | openai | `/create-avatar-openai` | `ssm-content-worker-avatar-openai` |
| 16 | avatar | stability | `/create-avatar-stability` | `ssm-content-worker-avatar-stability` |
| 17 | avatar | fal | `/create-avatar-fal` | `ssm-content-worker-avatar-fal` |
| 18 | avatar | luma | `/create-avatar-luma` | `ssm-content-worker-avatar-luma` |
| 19 | avatar | kling | `/create-avatar-kling` | `ssm-content-worker-avatar-kling` |
| 20 | avatar | runway | `/create-avatar-runway` | `ssm-content-worker-avatar-runway` |
| 21 | avatar | flux | `/create-avatar-flux` | `ssm-content-worker-avatar-flux` |
| 22 | avatar | ideogram | `/create-avatar-ideogram` | `ssm-content-worker-avatar-ideogram` |
| 23 | avatar | recraft | `/create-avatar-recraft` | `ssm-content-worker-avatar-recraft` |
| 24 | logo | vertex | `/create-logo-vertex` | `ssm-content-worker-logo-vertex` |
| 25 | logo | openai | `/create-logo-openai` | `ssm-content-worker-logo-openai` |
| 26 | logo | stability | `/create-logo-stability` | `ssm-content-worker-logo-stability` |
| 27 | logo | fal | `/create-logo-fal` | `ssm-content-worker-logo-fal` |
| 28 | logo | luma | `/create-logo-luma` | `ssm-content-worker-logo-luma` |
| 29 | logo | kling | `/create-logo-kling` | `ssm-content-worker-logo-kling` |
| 30 | logo | runway | `/create-logo-runway` | `ssm-content-worker-logo-runway` |
| 31 | logo | flux | `/create-logo-flux` | `ssm-content-worker-logo-flux` |
| 32 | logo | ideogram | `/create-logo-ideogram` | `ssm-content-worker-logo-ideogram` |
| 33 | logo | recraft | `/create-logo-recraft` | `ssm-content-worker-logo-recraft` |
| 34 | icon | vertex | `/create-icon-vertex` | `ssm-content-worker-icon-vertex` |
| 35 | icon | openai | `/create-icon-openai` | `ssm-content-worker-icon-openai` |
| 36 | icon | stability | `/create-icon-stability` | `ssm-content-worker-icon-stability` |
| 37 | icon | fal | `/create-icon-fal` | `ssm-content-worker-icon-fal` |
| 38 | icon | luma | `/create-icon-luma` | `ssm-content-worker-icon-luma` |
| 39 | icon | kling | `/create-icon-kling` | `ssm-content-worker-icon-kling` |
| 40 | icon | runway | `/create-icon-runway` | `ssm-content-worker-icon-runway` |
| 41 | icon | flux | `/create-icon-flux` | `ssm-content-worker-icon-flux` |
| 42 | icon | ideogram | `/create-icon-ideogram` | `ssm-content-worker-icon-ideogram` |
| 43 | icon | recraft | `/create-icon-recraft` | `ssm-content-worker-icon-recraft` |
| 44 | sprite | vertex | `/create-sprite-vertex` | `ssm-content-worker-sprite-vertex` |
| 45 | sprite | openai | `/create-sprite-openai` | `ssm-content-worker-sprite-openai` |
| 46 | sprite | stability | `/create-sprite-stability` | `ssm-content-worker-sprite-stability` |
| 47 | sprite | fal | `/create-sprite-fal` | `ssm-content-worker-sprite-fal` |
| 48 | sprite | luma | `/create-sprite-luma` | `ssm-content-worker-sprite-luma` |
| 49 | sprite | kling | `/create-sprite-kling` | `ssm-content-worker-sprite-kling` |
| 50 | sprite | runway | `/create-sprite-runway` | `ssm-content-worker-sprite-runway` |
| 51 | sprite | flux | `/create-sprite-flux` | `ssm-content-worker-sprite-flux` |
| 52 | sprite | ideogram | `/create-sprite-ideogram` | `ssm-content-worker-sprite-ideogram` |
| 53 | sprite | recraft | `/create-sprite-recraft` | `ssm-content-worker-sprite-recraft` |
| 54 | video | vertex | `/create-video-vertex` | `ssm-content-worker-video-vertex` |
| 55 | video | vertex-v3 | `/create-video-vertex-v3` | `ssm-content-worker-video-vertex-v3` |
| 55b | video | vertex-omni-flash | `/create-video-vertex-omni-flash` | `ssm-content-worker-video-vertex-omni-flash` |
| 56 | video | openai | `/create-video-openai` | `ssm-content-worker-video-openai` |
| 57 | video | luma | `/create-video-luma` | `ssm-content-worker-video-luma` |
| 58 | video | kling | `/create-video-kling` | `ssm-content-worker-video-kling` |
| 59 | video | runway | `/create-video-runway` | `ssm-content-worker-video-runway` |
| 60 | video | fal | `/create-video-fal` | `ssm-content-worker-video-fal` |
| 61 | video | minimax | `/create-video-minimax` | `ssm-content-worker-video-minimax` |
| 62 | video | mochi | `/create-video-mochi` | `ssm-content-worker-video-mochi` |
| 63 | video | pixverse | `/create-video-pixverse` | `ssm-content-worker-video-pixverse` |
| 64 | video | hunyuan | `/create-video-hunyuan` | `ssm-content-worker-video-hunyuan` |
| 65 | video | heygen | `/create-video-heygen` | `ssm-content-worker-video-heygen` |
| 66 | video | ltx | `/create-video-ltx` | `ssm-content-worker-video-ltx` |
| 67 | animation | vertex | `/create-animation-vertex` | `ssm-content-worker-animation-vertex` |
| 68 | animation | luma | `/create-animation-luma` | `ssm-content-worker-animation-luma` |
| 69 | animation | kling | `/create-animation-kling` | `ssm-content-worker-animation-kling` |
| 70 | animation | runway | `/create-animation-runway` | `ssm-content-worker-animation-runway` |
| 71 | animation | fal | `/create-animation-fal` | `ssm-content-worker-animation-fal` |
| 72 | voice | elevenlabs | `/create-voice-elevenlabs` | `ssm-content-worker-voice-elevenlabs` |
| 73 | voice | gemini | `/create-voice-gemini` | `ssm-content-worker-voice-gemini` |
| 74 | voice | minimax | `/create-voice-minimax` | `ssm-content-worker-voice-minimax` |
| 75 | voice | xai | `/create-voice-xai` | `ssm-content-worker-voice-xai` |
| 76 | voice | dia | `/create-voice-dia` | `ssm-content-worker-voice-dia` |
| 77 | voice | f5 | `/create-voice-f5` | `ssm-content-worker-voice-f5` |
| 78 | voice | chatterbox | `/create-voice-chatterbox` | `ssm-content-worker-voice-chatterbox` |
| 79 | voice | inworld | `/create-voice-inworld` | `ssm-content-worker-voice-inworld` |
| 80 | music | elevenlabs | `/create-music-elevenlabs` | `ssm-content-worker-music-elevenlabs` |
| 81 | music | minimax | `/create-music-minimax` | `ssm-content-worker-music-minimax` |
| 82 | music | stable | `/create-music-stable` | `ssm-content-worker-music-stable` |
| 83 | music | ace | `/create-music-ace` | `ssm-content-worker-music-ace` |
| 84 | music | beatoven | `/create-music-beatoven` | `ssm-content-worker-music-beatoven` |
| 85 | sfx | beatoven | `/create-sfx-beatoven` | `ssm-content-worker-sfx-beatoven` |
| 86 | sfx | mirelo | `/create-sfx-mirelo` | `ssm-content-worker-sfx-mirelo` |
| 87 | sfx | mmaudio | `/create-sfx-mmaudio` | `ssm-content-worker-sfx-mmaudio` |
| 88 | threed | meshy | `/3d-create-meshy` | `ssm-content-worker-threed-meshy` |
| 89 | threed | hunyuan3d | `/3d-create-hunyuan3d` | `ssm-content-worker-threed-hunyuan3d` |
| 90 | threed | trellis | `/3d-create-trellis` | `ssm-content-worker-threed-trellis` |
| 91 | threed | triposr | `/3d-create-triposr` | `ssm-content-worker-threed-triposr` |
| 92 | threed | tripo3d | `/3d-create-tripo3d` | `ssm-content-worker-threed-tripo3d` |
| 93 | upscale | vertex | `/create-upscale-vertex` | `ssm-content-worker-upscale-vertex` |
| 94 | upscale | fal | `/create-upscale-fal` | `ssm-content-worker-upscale-fal` |
| 95 | subtitle | aws | `/create-subtitle-aws` | `ssm-content-worker-subtitle-aws` |
| 96 | lipsync | kling | `/create-lipsync-kling` | `ssm-content-worker-lipsync-kling` |
| 97 | lipsync | fal | `/create-lipsync-fal` | `ssm-content-worker-lipsync-fal` |
| 98 | lipsync | omnihuman | `/create-lipsync-omnihuman` | `ssm-content-worker-lipsync-omnihuman` |
| 99 | lipsync | heygen | `/create-lipsync-heygen` | `ssm-content-worker-lipsync-heygen` |
| 100 | tryon | kling | `/create-tryon-kling` | `ssm-content-worker-tryon-kling` |
| 101 | erase | fal | `/create-erase-fal` | `ssm-content-worker-erase-fal` |
| 102 | bgremove | fal | `/create-bgremove-fal` | `ssm-content-worker-bgremove-fal` |
| 103 | outpaint | fal | `/create-outpaint-fal` | `ssm-content-worker-outpaint-fal` |
| 104 | dubbing | elevenlabs | `/create-dubbing-elevenlabs` | `ssm-content-worker-dubbing-elevenlabs` |
| 105 | isolate | elevenlabs | `/create-isolate-elevenlabs` | `ssm-content-worker-isolate-elevenlabs` |
| 106 | sfx | elevenlabs | `/create-sfx-elevenlabs` | `ssm-content-worker-sfx-elevenlabs` |
| 107 | sfx | ace | `/create-sfx-ace` | `ssm-content-worker-sfx-ace` |
| 108 | sfx | multi | `/create-sfx-multi` | `ssm-content-worker-sfx-multi` |
| 109 | music | stability | `/create-music-stability` | `ssm-content-worker-music-stability` |
| 110 | threed | stability | `/3d-create-stability` | `ssm-content-worker-3d` |
| 111 | animation | minimax | `/create-animation-minimax` | `ssm-content-worker-animation-minimax` |
| 112 | inpaint | fal | `/create-inpaint-fal` | `ssm-content-worker-inpaint-fal` |
| 113 | inpaint | stability | `/create-inpaint-stability` | `ssm-content-worker-inpaint-stability` |
| 114 | inpaint | openai | `/create-inpaint-openai` | `ssm-content-worker-inpaint-openai` |
| 115 | inpaint | vertex | `/create-inpaint-vertex` | `ssm-content-worker-inpaint-vertex` |
| 116 | styletransfer | fal | `/create-styletransfer-fal` | `ssm-content-worker-styletransfer-fal` |
| 117 | styletransfer | stability | `/create-styletransfer-stability` | `ssm-content-worker-styletransfer-stability` |
| 118 | sketch | fal | `/create-sketch-fal` | `ssm-content-worker-sketch-fal` |
| 119 | sketch | stability | `/create-sketch-stability` | `ssm-content-worker-sketch-stability` |
| 120 | searchreplace | stability | `/create-searchreplace-stability` | `ssm-content-worker-searchreplace-stability` |
| 121 | recolor | stability | `/create-recolor-stability` | `ssm-content-worker-recolor-stability` |
| 122 | colorize | fal | `/create-colorize-fal` | `ssm-content-worker-colorize-fal` |
| 123 | faceswap | fal | `/create-faceswap-fal` | `ssm-content-worker-faceswap-fal` |
| 124 | faceid | fal | `/create-faceid-fal` | `ssm-content-worker-faceid-fal` |
| 125 | faceid | instantid | `/create-faceid-instantid` | `ssm-content-worker-faceid-instantid` |
| 126 | liveportrait | fal | `/create-liveportrait-fal` | `ssm-content-worker-liveportrait-fal` |
| 127 | restyle | kling | `/create-restyle-kling` | `ssm-content-worker-restyle-kling` |
| 128 | texture | fal | `/create-texture-fal` | `ssm-content-worker-texture-fal` |
| 129 | texture | stability | `/create-texture-stability` | `ssm-content-worker-texture-stability` |
| 130 | skybox | fal | `/create-skybox-fal` | `ssm-content-worker-skybox-fal` |
| 131 | skybox | blockade | `/create-skybox-blockade` | `ssm-content-worker-skybox-blockade` |
| 132 | depthmap | fal | `/create-depthmap-fal` | `ssm-content-worker-depthmap-fal` |
| 133 | depthmap | marigold | `/create-depthmap-marigold` | `ssm-content-worker-depthmap-marigold` |
| 134 | normalmap | fal | `/create-normalmap-fal` | `ssm-content-worker-normalmap-fal` |
| 135 | segment | fal | `/create-segment-fal` | `ssm-content-worker-segment-fal` |
| 136 | pattern | fal | `/create-pattern-fal` | `ssm-content-worker-pattern-fal` |
| 137 | pattern | stability | `/create-pattern-stability` | `ssm-content-worker-pattern-stability` |
| 138 | coloringpage | fal | `/create-coloringpage-fal` | `ssm-content-worker-coloringpage-fal` |
| 139 | coloringpage | stability | `/create-coloringpage-stability` | `ssm-content-worker-coloringpage-stability` |
| 140 | sticker | fal | `/create-sticker-fal` | `ssm-content-worker-sticker-fal` |
| 141 | sticker | openai | `/create-sticker-openai` | `ssm-content-worker-sticker-openai` |
| 142 | sticker | stability | `/create-sticker-stability` | `ssm-content-worker-sticker-stability` |
| 143 | qrart | fal | `/create-qrart-fal` | `ssm-content-worker-qrart-fal` |
| 144 | mockup | fal | `/create-mockup-fal` | `ssm-content-worker-mockup-fal` |
| 145 | productphoto | fal | `/create-productphoto-fal` | `ssm-content-worker-productphoto-fal` |
| 146 | productphoto | stability | `/create-productphoto-stability` | `ssm-content-worker-productphoto-stability` |
| 147 | productphoto | vertex | `/create-productphoto-vertex` | `ssm-content-worker-productphoto-vertex` |
| 148 | voiceclone | elevenlabs | `/create-voiceclone-elevenlabs` | `ssm-content-worker-voiceclone-elevenlabs` |
| 149 | speechtospeech | elevenlabs | `/create-speechtospeech-elevenlabs` | `ssm-content-worker-speechtospeech-elevenlabs` |
| 150 | voicedesign | elevenlabs | `/create-voicedesign-elevenlabs` | `ssm-content-worker-voicedesign-elevenlabs` |
| 151 | dialogue | openai | `/create-dialogue-openai` | `ssm-content-worker-dialogue-openai` |
| 152 | dialogue | vertex | `/create-dialogue-vertex` | `ssm-content-worker-dialogue-vertex` |
| 153 | translation | deepl | `/create-translation-deepl` | `ssm-content-worker-translation-deepl` |
| 154 | translation | vertex | `/create-translation-vertex` | `ssm-content-worker-translation-vertex` |
| 155 | transcription | aws | `/create-transcription-aws` | `ssm-content-worker-transcription-aws` |
| 156 | transcription | fal | `/create-transcription-fal` | `ssm-content-worker-transcription-fal` |
| 157 | comic | fal | `/create-comic-fal` | `ssm-content-worker-comic-fal` |
| 158 | comic | vertex | `/create-comic-vertex` | `ssm-content-worker-comic-vertex` |
| 159 | tattoo | fal | `/create-tattoo-fal` | `ssm-content-worker-tattoo-fal` |
| 160 | tattoo | stability | `/create-tattoo-stability` | `ssm-content-worker-tattoo-stability` |
| 161 | archrender | fal | `/create-archrender-fal` | `ssm-content-worker-archrender-fal` |
| 162 | archrender | stability | `/create-archrender-stability` | `ssm-content-worker-archrender-stability` |
| 163 | vector | fal | `/create-vector-fal` | `ssm-content-worker-vector-fal` |
| 164 | presentation | fal | `/create-presentation-fal` | `ssm-content-worker-presentation-fal` |
| 165 | presentation | vertex | `/create-presentation-vertex` | `ssm-content-worker-presentation-vertex` |
| 166 | infographic | fal | `/create-infographic-fal` | `ssm-content-worker-infographic-fal` |
| 167 | infographic | vertex | `/create-infographic-vertex` | `ssm-content-worker-infographic-vertex` |
| 168 | terrain | fal | `/create-terrain-fal` | `ssm-content-worker-terrain-fal` |
| 169 | vfx | fal | `/create-vfx-fal` | `ssm-content-worker-vfx-fal` |
| 170 | font | fal | `/create-font-fal` | `ssm-content-worker-font-fal` |
| 171 | document | fal | `/create-document-fal` | `ssm-content-worker-document-fal` |
| 172 | document | vertex | `/create-document-vertex` | `ssm-content-worker-document-vertex` |
| 173 | pose | fal | `/create-pose-fal` | `ssm-content-worker-pose-fal` |

> **173 unique worker Lambda endpoints documented above** + `threed-vertex` (planned, not yet deployed) + `job_creator` orchestrator Lambda + `job_status` query Lambda = **176 total Lambda functions** (173 deployed workers + 1 planned + 2 infrastructure).

---

# APPENDIX: Provider Summary

| Provider | Auth Method | Content Types | Total Handlers |
|----------|------------|---------------|----------------|
| **Google Vertex AI** | Workload Identity Federation | image, avatar, logo, icon, sprite, video (2), animation, threed, upscale, inpaint, comic, dialogue, translation, presentation, infographic, document, productphoto | 19 |
| **OpenAI** | Bearer token | image, avatar, logo, icon, sprite, video, inpaint, sticker, dialogue | 9 |
| **Stability AI** | Bearer token | image, avatar, logo, icon, sprite, threed, inpaint, styletransfer, sketch, searchreplace, recolor, texture, pattern, coloringpage, sticker, tattoo, archrender, productphoto | 18 |
| **fal.ai (gateway)** | Key header | image (5), avatar, logo, icon, sprite, video (7), animation, voice (6), music (4), sfx (3), threed (5), lipsync, erase, bgremove, outpaint, upscale, inpaint, styletransfer, sketch, colorize, faceswap, faceid (2), liveportrait, texture, skybox, depthmap (2), normalmap, segment, pattern, coloringpage, sticker, qrart, mockup, productphoto, transcription, comic, tattoo, archrender, vector, presentation, infographic, terrain, vfx, font, document, pose | 62 |
| **Luma Labs** | Bearer token | image, avatar, logo, icon, sprite, video, animation | 7 |
| **Kling AI** | JWT (HS256) | image, avatar, logo, icon, sprite, video, animation, lipsync, tryon, restyle | 10 |
| **Runway ML** | Bearer + version header | image, avatar, logo, icon, sprite, video, animation | 7 |
| **ElevenLabs** | xi-api-key header | voice, music, sfx, dubbing, isolate, voiceclone, speechtospeech, voicedesign | 8 |
| **AWS** | IAM Role | subtitle, transcription | 2 |
| **Blockade Labs** | x-api-key header | skybox | 1 |
| **DeepL** | DeepL-Auth-Key header | translation | 1 |
| **Marigold (fal)** | Key header (fal gateway) | depthmap | 1 |
| **InstantID (fal)** | Key header (fal gateway) | faceid | 1 |

---

# APPENDIX: Prompt Character Limits Quick Reference

| Provider | Limit |
|----------|-------|
| OpenAI GPT Image | **32,000 chars** |
| OpenAI DALL-E 3 | **4,000 chars** |
| Stability AI | **10,000 chars** |
| Gemini TTS | **50,000 chars** |
| xAI TTS | **15,000 chars** |
| ElevenLabs Voice | ~**5,000 chars** (API limit) |
| ElevenLabs Music | **5,000 chars** |
| MiniMax Voice | **5,000 chars** |
| MiniMax Music | **600 chars** |
| Inworld Voice | **5,000 chars** |
| Music Stable | **5,000 chars** |
| Music Beatoven | **5,000 chars** |
| SFX Beatoven | **5,000 chars** |
| Vertex AI / fal.ai / Luma / Kling / Runway | No explicit code-level limit (API-defined) |

---

*Document base: March 2026 · v5 revision 2026-08-15 | 179 Active Endpoints + 1 PLANNED (registry lines
counted and reconciled against live `v2pjhwhk0m` and the live router on 2026-08-15; the gateway holds
180 POST resources, the extra being the non-generation helper `/enhance-prompt`) | 25+ AI Providers |
50 Content Types*

---

# APPENDIX: Lambda Environment Variables
All Lambda functions under `ssm-content-worker-*` require these environment variables to be set in AWS Lambda configuration. These are stored in the project `.env` file and deployed via AWS CLI `--environment` flag.

### Common (All Workers)

| Variable | Description |
|----------|-------------|
| `S3_BUCKET` | Default S3 bucket for output assets (`beforetomorrow-content-prod`) |

### Provider-Specific API Keys

| Variable | Provider | Used By |
|----------|----------|---------|
| `OPENAI_API_KEY` | OpenAI (DALL-E 3, GPT Image 1, GPT-4o) | image-openai, avatar-openai, logo-openai, icon-openai, sprite-openai, video-openai, inpaint-openai, sticker-openai, dialogue-openai |
| `STABILITY_API_KEY` | Stability AI (SD3.5, Stable Audio, Fast 3D) | image-stability, avatar-stability, logo-stability, icon-stability, sprite-stability, threed-stability, music-stability, sfx-multi, inpaint-stability, styletransfer-stability, sketch-stability, searchreplace-stability, recolor-stability, texture-stability, pattern-stability, coloringpage-stability, sticker-stability, tattoo-stability, archrender-stability, productphoto-stability |
| `FAL_API_KEY` | fal.ai gateway (multi-model) | 62 handlers (see fal.ai row in Provider Summary) |
| `LUMA_API_KEY` | Luma Labs (Photon, Ray 2) | image-luma, avatar-luma, logo-luma, icon-luma, sprite-luma, video-luma, animation-luma |
| `KLING_ACCESS_KEY` | Kling AI (JWT auth, access key) | image-kling, avatar-kling, logo-kling, icon-kling, sprite-kling, video-kling, animation-kling, lipsync-kling, tryon-kling, restyle-kling |
| `KLING_SECRET_KEY` | Kling AI (JWT auth, secret key) | Same as KLING_ACCESS_KEY |
| `RUNWAY_API_KEY` | Runway ML (Gen4, Gen4.5, Veo3, Act Two) | image-runway, avatar-runway, logo-runway, icon-runway, sprite-runway, video-runway, animation-runway |
| `ELEVENLABS_API_KEY` | ElevenLabs (TTS, Music, SFX) | voice-elevenlabs, music-elevenlabs, sfx-elevenlabs, dubbing-elevenlabs, isolate-elevenlabs, voiceclone-elevenlabs, speechtospeech-elevenlabs, voicedesign-elevenlabs |
| `BLOCKADE_API_KEY` | Blockade Labs (Skybox AI 360° HDRI) | skybox-blockade |
| `BLOCKADE_SECRET_KEY` | Blockade Labs (secret key) | skybox-blockade |
| `DEEPL_API_KEY` | DeepL (translation) | translation-deepl |

### Google Cloud / Vertex AI (Workload Identity Federation -- keyless)

| Variable | Value |
|----------|-------|
| `GOOGLE_PROJECT_ID` | `contentanalyticsplatform` |
| `GOOGLE_PROJECT_NUMBER` | `1084529532925` |
| `GOOGLE_LOCATION` | `us-central1` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `ssmcontentassetcreator-user@contentanalyticsplatform.iam.gserviceaccount.com` |

Used by: image-vertex, avatar-vertex, logo-vertex, icon-vertex, sprite-vertex, video-vertex, video-vertex-v3, video-vertex-omni-flash, animation-vertex, upscale-vertex, inpaint-vertex, comic-vertex, dialogue-vertex, translation-vertex, presentation-vertex, infographic-vertex, document-vertex, productphoto-vertex

> **Per-worker `GOOGLE_LOCATION` differs and it matters (measured 2026-08-12):** the Gemini image
> workers and the editing workers run with `GOOGLE_LOCATION=global`; `video-vertex` / `video-vertex-v3`
> use `us-central1` (Veo GA is region-pinned); `video-vertex-omni-flash` calls the `locations/global`
> Interactions path and additionally requires **`GCS_STAGING_BUCKET`**
> (`contentanalyticsplatform-video-staging`) because that surface delivers artefacts by `gs://` URI.

### Frontend Environment Variables (Next.js `.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SSM_CONTENT_API_URL` | API Gateway base URL: `https://v2pjhwhk0m.execute-api.eu-central-1.amazonaws.com/prod` |
| `SSM_CONTENT_API_KEY` | API Gateway API key for the `beforetomorrow-content-prod-key` usage plan. **NOT `NEXT_PUBLIC_`** - a NEXT_PUBLIC_ variable is inlined into the browser bundle; this one is read server-side only |
| `NEXT_PUBLIC_SSM_CDN_URL` | CDN base URL: `https://cdn.BeforeTomorrow.io` |

