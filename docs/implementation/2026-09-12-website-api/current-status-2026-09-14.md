# Website integration — current, incomplete

Checked on 2026-09-14. Local application: http://127.0.0.1:4177/index.html.
This report supersedes older current-status descriptions without changing their historical evidence.

## What prevents new music from reaching the listener

The current `/api/connection` response distinguishes a reachable generation API from unavailable owned delivery: `available:true`, `delivery.available:false`, `generationAvailable:false`. Windows Code Integrity event 3077 names the configured FFprobe executable and policy `{0283ac0f-fff1-49ae-ada1-8a933130cad6}`. The executable is not signed. Its SHA-256 is `19202b23c0043f15ad1b7bce2344f406fd52bd6efd8f995ce02e7392a1cec52f`; the retained distributor archive matches the installer pin. This establishes the specific failure, not an exception to the device policy.

Exact executable: `C:/Berk/PlayMusicPrompts/website/.state/tools/gyan-9.0.1/ffmpeg-9.0.1-essentials_build/bin/ffprobe.exe`.

No endpoint protection or code-integrity policy was changed. A device-policy-permitted FFprobe package or administrator resolution of this exact executable is required before the current media pipeline can run. The checked installed-application and bundled-runtime directories did not contain another FFprobe executable. Allowed FFmpeg graph output was investigated, but did not supply a complete equivalent of the required media validation, so it was not installed as a substitute.

Read-only database snapshot: 4 ready jobs, 5 `ingest_failed`, 1 failed; 0 active. These are jobs, not a claim of ten newly playable songs. The five failed transfers retain generation responses and delivery identifiers; they do not yet have confirmed listening copies. Their recovery must use the existing delivery requests, never another paid generation. The separate provider refusal is not a transfer failure.

Detailed evidence: `memory/lanes/website-api-20260912/evidence/R14-TRANSFER-RECOVERY.json`.

## Endpoint wiring versus completion

| Public music API endpoint | Actual application caller | Remaining proof boundary |
| --- | --- | --- |
| `GET /health` | Engine health → `/api/connection` → composer availability | Live connection checked; owned delivery checked separately |
| `GET /v1/music/capabilities` | Engine capabilities → controls schema → quick/all controls | Source/tests cover projection; accepting all fields is not proof of every audible combination |
| `POST /v1/music` | Durable music worker; non-generating preview; Enhance worker | Generation-to-owned-listening is currently blocked; audio/MIDI reference branches remain restricted |
| `GET /v1/music/jobs/{id}` | Durable status poller → owner-scoped job/group response → creation dialog | Local polling/retry/restart checks pass; complete new live flow has not passed |
| `GET /v1/music/originality/{id}` | Originality poller → safe job summary → result disclosure | A completed opted-in live analysis remains unverified |
| `POST /v1/music/delivery-url` | Owned-media ingestion obtains a renewed lease for a recorded output | Tool-policy failure currently prevents completed ingestion; production CDN mappings are unconfigured |

The Cloud Tasks job runner is internal according to the API documentation and is intentionally not a public browser endpoint. All six public adapter chains exist. Full API integration is **not complete**: user-audio/MIDI imports, live callback configuration and synchronous callback correlation, structured recovery for source-only render failures, and remaining live response branches still need work.

## Changes and verification in this continuation

- New admission and retry admission check real media availability. A blocked retry does not consume retry/generation quota, alter the saved result, wake the worker or make another generation POST. Owner/CSRF refusal checks are included.
- The shared creation dialog can check delivery for failed/partial directions. It does not retry ready directions or provider refusals. Repeated clicks are suppressed while an action is running; actual recovery errors remain visible. The message promises retention of the generation record, not an unverified local audio file.
- Preview results now carry returned language/fallback, timing, mastering, fades, channels and stem plans into the actual preview renderer. Zero, false, empty and missing values remain distinct. Raw credentials, URLs and unrelated metadata are excluded. Three previously stored real API preview responses were reprojected with current code without any new upstream request. This is historical-input verification, not a new live generation or current remote capability proof.
- Internal player selection uses an owner-bound, expiring POST context and a clean `/player-three.html` address. Actual browser navigation selected the requested existing track without playing it. Return to Create now stays in the same tab and was exercised after reload. Public sharing remains a separate explicit action.
- The shared component layer applies native modal semantics, container-based layout, progressive disclosures and reduced-motion behavior from the existing local frontend research. React Aria is not installed. Current worker desktop rendering was inspected earlier in this logical turn; the new preview's actual mobile/rendered state remains unverified. This is not acceptance of the entire UI redesign.

Full local regression: **613 tests, 602 passed, 11 failed**, exit 1. All 11 failures are in the real media suite while FFprobe cannot execute. Evidence: `website/.state/test-full-20260914-reconciled.log`. The failures remain failures; other passing suites do not substitute for playable new music.

Syntax/entry check: **130 JavaScript modules**, six pages connected, exit 0. Evidence: `website/.state/check-20260914-reconciled.log`.

Preservation: all **717** baseline files in the three approved template trees match their recorded hashes. Evidence: `memory/lanes/website-api-20260912/evidence/R14-PROTECTED.json`.

The local server was restarted only after a read-only check found no active generation jobs. No new music generation was initiated in this continuation after the global-rules request.

## Requirements that remain open

The complete website/API parent remains open. So do actual uninterrupted adaptive next-song playback, all parameter branch/effect acceptance, full UI/device verification, Google audio/banner/rewarded-download integration, configured identity, native TV/mobile applications and production EC2/media deployment. Guest creation/listening and login-required playlist/download rules remain retained. Advertising, identity and device configuration must not be represented as live simply because interfaces exist.

The newly requested global-rule review also exposes engineering conformance debt: the existing server includes SQL in JavaScript and mixed functional/class architecture. Reading the rules does not establish that this implementation already complies with every engineering article. Reconcile that work explicitly before a production-completion claim.

The next media action requires resolution of the documented device-policy dependency, followed by real FFprobe health, the complete media suite, and recovery of existing transfer jobs. New generation-to-playback acceptance follows a healthy pipeline; old-track playback is not its substitute.
