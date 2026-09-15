# PlayMusicPrompts website

The connected application lives in this directory. The three accepted visual editions remain separate and unchanged. This is a working local integration, not a production deployment.

Open **http://127.0.0.1:4177/index.html** for Create, Explore, Radio and Library. Open **http://127.0.0.1:4177/player-three.html** for the listening room. Choose **Enter listening room** in a song menu to carry that song into 3D.

## Start after restarting Windows

Run `START.cmd` as Berk's usual Windows user. It starts the application hidden and reports the local address; it does not stop other players. It detects this application's recorded process and reuses it when healthy.

Prerequisites already installed on the development machine: Node 24.13.1, locked dependencies, FFmpeg/FFprobe 9.0.1. On a fresh checkout run `npm ci` in this directory and use `scripts/install-media-tools.ps1` for the pinned, hash-checked Windows media tools. The private runtime configuration stores their absolute locations. Production Linux requires separately installed, maintained native media tools via `PMP_FFMPEG` and `PMP_FFPROBE`.

The supplied music API key was imported into `.secrets-owner/music-key.dpapi`, protected with Windows DPAPI and an owner/SYSTEM-only ACL. Its plaintext handoff file was removed after the owner-account roundtrip check. The encrypted file is tied to that Windows account. Do not run `read-key.ps1` interactively, print its output, copy the private directories into the public directory, or commit them.

Local Google identity uses the existing developer `gcloud` session. If it expires, sign in through the normal Google CLI flow; the website will report that the music connection is unavailable. Restarting the website does not regenerate previous songs.

## Current priority: complete the music API integration

Advertising, accounts and device expansion are paused. This branch currently connects all six documented public engine methods in server code; the internal worker `/run` endpoint is deliberately excluded. Wiring is separate from live acceptance:

| Engine endpoint | Website connection | Verification scope |
| --- | --- | --- |
| `GET /health` | `/api/connection`, bounded safe readiness projection; background page check | Local transport/HTTP checks; live receipt in the dated evidence |
| `GET /v1/music/capabilities` | `/api/capabilities` and `/api/controls-schema` | Live contract; 100 request fields, three response-only fields |
| `POST /v1/music` | Durable `/api/jobs` or separate `/api/previews` | Two actual music deliveries; actual 100-field dry-run and browser preview |
| `GET /v1/music/jobs/{id}` | Persistent worker; owner-scoped website job status | Actual asynchronous creation flow; failure/restart tests are local |
| `POST /v1/music/delivery-url` | Owned ingest renews only persisted output identifiers | Actual stored/decoded deliveries; recovery/expiry boundaries also tested locally |
| `GET /v1/music/originality/{id}` | Durable independent analysis worker and job summary | Wired and locally tested; no live opted-in verdict was obtained |

**All controls** uses the current engine schema, including nested values and request modes. Off/default/omitted values remain distinct. Explicit `async:false` is retained; the website still records a local durable job while the worker waits for the synchronous upstream reply. Preview and capability inspection never enter the song catalogue. Enhance enables the real `prompt_enhance` option, with a separate compiled-request preview; it does not append canned prose.

The single 100-field live compilation returned HTTP 200. Its received list contains 99 fields; `dry_run:true` is confirmed separately. All 100 corresponding binding records exist. This proves that representative request's transport and compilation, **not** the audible effect of every field or every combination. A later browser preview also returned a genuine plan without producing music.

Creation details report requested versus measured length, available takes, privately saved master/listening/source files, supplied/refused stems, actual loudness, lyric measurement scope and deferred originality status. Full envelopes remain private; this safe view is not a claim that every response metadata property is surfaced.

Core gaps remain explicit: audio/MIDI reference import needs a verified upload/storage/analysis contract; normal generation webhooks need an actual operator receiver configured with `PMP_WEBHOOK_URL`; error-only raw output recovery needs a structured source identifier or render-retry contract; live originality and all parameter combinations are unverified. The current descriptor-reference path works. These gaps prevent calling the complete API integration finished.

## Product behavior

| Action | Current behavior |
| --- | --- |
| Create and listen | Available to a guest, with server-side limits. Real API jobs and delivered music; no demo-song catalogue. |
| Own media | Generated masters and related outputs are copied to private storage, hashed and probed. A separate MP3 rendition is published for listening. |
| Radio | Plays a sequence from the actual owned catalogue. This is a personal listening queue, not a synchronized broadcast station. Empty station categories report that they need music. |
| Save songs and playlists | Requires a verified server account. The OIDC integration and ownership routes are implemented; an actual identity provider must be configured. No local fake account bypass. |
| Download music | Requires an account and a verified eligible rewarded-ad flow. Currently unavailable: no browser event can grant a master-file entitlement. |
| Audio ads | Real Google IMA integration at song boundaries, consent and initial user gesture required. Publisher configuration is currently absent, so no ad SDK loads. |
| Banner | Reserved discreet Google Publisher Tag placement; only loads with configured publisher and consent. |
| 3D | Uses the copied accepted living-world scenes and actual owned listening audio. Local visual-frame capture saves an image on the device. |

The official download restriction protects the original master. Audio made available for listening can still be captured by a listener; the application does not claim that browser playback prevents copying.

## Remote controls and devices

Use the **TV controls** button to exercise the remote focus system in a desktop browser. Detected TV browsers activate it automatically. Arrows move a visible focus marker, OK activates the focused control, and Back first leaves an input or closes the current dialog. Unhandled Back at the root remains available to the TV/browser. Desktop text editing and native range inputs retain their usual key behavior.

| Input | Key codes / behavior |
| --- | --- |
| Left, Up, Right, Down | 37, 38, 39, 40 |
| OK / Enter | 13 |
| Samsung Back | 10009 |
| LG Back | 461 |
| Escape fallback | 27 |
| Play / Pause / Stop | 415 / 19 / 413 |
| Rewind / Fast forward | 412 / 417; seek in ten-second steps |
| Play-pause / Previous / Next | 10252 / 10232 / 10233, plus supported named media events |

Samsung's packaged app must declare the `tv.inputdevice` privilege; the adapter registers only the media keys reported by the device. Registration failures are reported rather than treated as success. LG Magic Remote transport remains available through focusable buttons. OS Media Session controls and the two players share the advertising transport boundary.

Responsive web and the shared input/media contracts are implemented. Samsung/LG physical remotes, device firmware, TV codecs, iOS/Android native apps, tablet background playback, store packaging and publisher SDK certification require their own device acceptance runs. This repository does not claim those apps have been delivered.

## Private state and recovery

- `.state/website.sqlite`: durable jobs, hashed sessions, ownership, playlists, admission counters and original engine responses. SQLite uses WAL and FULL synchronization.
- `.state/media`: private masters, separate listening assets, manifests and transfer status. Raw upstream responses and signed delivery URLs remain private.
- `.state/server.*.log`: bounded-field operational messages, without raw engine bodies or credentials.
- `.state/runtime.local.json`: native-tool locations only.

A same-host instance guard is acquired before database recovery. Two local processes cannot open the same application state through normal startup. It is **not** a distributed lock for multiple hosts or containers.

The admission record and idempotency key are saved before submission. An interrupted submission becomes **Confirmation needed**, never an automatic new paid request. Polling, reloading and transfer retries do not submit a new generation. Available takes from a partial delivery stay playable; **Retry transfer** recovers the already-generated outputs. Two concurrent playlist edits receive a revision conflict instead of silently replacing each other.

The default admission ceiling is 1000 creations/day globally, 1000/day per guest session, 1000/day per client IP, and at most four active jobs globally (owner order 2026-09-15, "limiti 1000 yap"; every value lives in `server/admission-limits.mjs`, and the 429 body names the scope that was exhausted). These are admission limits, not bot identity proof. Production needs the reviewed edge anti-abuse controls and abuse monitoring. The engine's own per-key daily quota (docs/api/02, default 100/day) is enforced upstream and is not raised by these website limits.

## Configuration

Server configuration is read from environment variables. `.env` files are not automatically loaded. Do not place server variables in browser scripts.

| Variable | Purpose |
| --- | --- |
| `PORT`, `PMP_ORIGIN` | Local default 4177 and its loopback origin. Production requires the exact public HTTPS origin. |
| `PMP_STATE_DIR` | Private durable directory outside `public/`. |
| `PMP_FFMPEG`, `PMP_FFPROBE` | Absolute maintained native media-tool paths. |
| `PMP_WEBHOOK_URL` | Optional exact operator-owned HTTPS callback; arbitrary generation destinations are refused. No callback receiver is deployed by this setting. |
| `PMP_DAILY_ADMISSION_LIMIT`, `PMP_GUEST_DAILY_LIMIT`, `PMP_IP_DAILY_LIMIT` | May lower the corresponding defaults; global ceiling cannot exceed 100. |
| `NODE_ENV=production` | Enables secure host cookie, HTTPS/HSTS and authenticated proxy contract. |
| `PMP_PROXY_SECRET` | At least 32 characters, installed privately in the application and trusted loopback gateway. Never exposed to a client. |
| `PMP_CREDENTIAL_MODE=aws-wif` | Production Google workload identity from the EC2 role via Google federation. |
| `PMP_API_KEY_SECRET_ID`, `AWS_REGION` | The actual API-key secret in AWS Secrets Manager and its region. No hardcoded AWS credentials. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Reviewed external-account federation configuration, not a downloaded service-account private key. |
| `PMP_OIDC_ISSUER`, `PMP_OIDC_CLIENT_ID`, `PMP_OIDC_CLIENT_SECRET` | Actual identity provider. Redirect URI is `<PMP_ORIGIN>/auth/callback`; code flow with PKCE, state, nonce and ID-token signature validation. |

For production API requests, the application listens only on loopback and requires the gateway to overwrite `X-PMP-Client-IP` with a verified client address and `X-PMP-Proxy-Secret` with the private shared value. Arbitrary `X-Forwarded-For` is never trusted. The gateway must accept only expected ingress and remove client-supplied copies of these headers. Health/static access is separate from authenticated API proxy checks.

### Google publisher and consent configuration

Ads default to off. Set `PMP_ADS_ENABLED=true` only with actual publisher configuration and the tested CMP:

- `PMP_CMP_ID`, `PMP_CMP_SCRIPT_URL`, `PMP_CMP_CERTIFICATION_REVIEWED=true`.
- `PMP_AD_AUDIO_TAG_URL`: actual Google Ad Manager single-break audio tag. Consent parameters must come from the current CMP, not be frozen in the URL.
- `PMP_AD_INTERVAL_TRACKS` defaults to 3; `PMP_AD_REQUEST_TIMEOUT_MS` defaults to 10000.
- `PMP_AD_BANNER_UNIT`; optional `PMP_AD_BANNER_SIZES_JSON`, default `[[320,50],[728,90]]`.
- The JSON arrays `PMP_CMP_RESOURCE_ORIGINS_JSON`, `PMP_AD_RESOURCE_ORIGINS_JSON`, `PMP_AD_MEDIA_ORIGINS_JSON` list actual observed HTTPS origins needed by that publisher/CMP. These are not unrestricted URL allowlists.

The consent adapter observes the actual TCF API, current CMP identity, Google vendor disclosure and consent restrictions. Undetermined/denied consent does not load ads; revocation tears them down. A non-TCF jurisdiction needs a real, reviewed provider adapter. Merely setting `PMP_CMP_NON_TCF_ADAPTER_ID` does not manufacture a decision.

Ad-enabled HTML receives a fresh nonce, propagated to dynamically loaded scripts. GPT SafeFrame is forced and expansion disabled. Creative/media/CMP origin coverage still requires an actual publisher run under the resulting CSP. The default disabled state has no external ad-script permission.

Rewarded downloads remain an open dependency. The Google web rewarded event is not a signed server reward callback. Actual downloadable-file eligibility and an acceptable verification model must be resolved before issuing download entitlements. No native AdMob verification or successful monetized ad delivery is claimed by local lifecycle tests.

## EC2 production handoff

EC2 is the owner's chosen application direction. The existing Google generator remains upstream. The current implemented storage adapter is private local storage and the current database is SQLite; it is not a deployed S3/CloudFront/global database system.

Before production: establish the actual AWS account/region/topology; isolate media workers; configure the EC2 role, private secret, Google federation and least-privilege invocation; implement and exercise the selected durable storage/CDN/database adapters; install an HTTPS gateway with the verified client-address contract; test encrypted backups/restoration, process failure, transfer recovery, quotas and abuse controls. Verify real identity, consent, ads and target devices. No cloud resources or IAM policies were changed by this local implementation.

See `../docs/implementation/2026-09-12-website-api/ec2-platform-direction.md` for the retained owner decision and proposed responsibilities.

## Checks and evidence

Run `npm test` for server/contract/media/identity/access/input/advertising/consent tests and `npm run check` for source checks. Test fixture identities, publishers and media are isolated from the live catalogue.

The two authorized intentional live generation submissions were used: one instrumental result measured 14 seconds for a 15±2 second request, and one custom-lyrics result measured 30 seconds. Both were copied to owned storage and played through the actual browser. There is no automatic paid smoke command. Do not submit additional billed validation requests without a new allowance.

The final dated evidence and remaining dependency ledger are under `../docs/implementation/2026-09-12-website-api/` and `../memory/lanes/website-api-20260912/`.
