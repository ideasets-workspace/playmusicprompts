# Standards ledger

Status: evidence-backed architecture recommendation for parent review, 2026-09-12. Parent lane: `website-api-20260912`, task `API-01-CLOUD`. Owner has not selected AWS or Google Cloud. Goal: compare an owner-operated radio path against managed media products for a global generated-music catalogue, radio, Google audio ads and universal clients. Quality and verified suitability protect Berk's finite time and money; lower software licence cost alone does not establish a better outcome. This report proves documented component capabilities and limitations, not an operating service, benchmark, security certification or the completion of the parent research programme.

Authority: project rank-0 law and research covenant read; installed full covenant previously read in this session, parent SHA-256 `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB`. This delegate owns only this report. No installation, cloud mutation, execution of external code, ads/account changes, credential access or accepted frontend changes. Shared source register/index/manifest integration belongs to the parent.

## Scope, preflight and atomic questions

Current project evidence: the latest brief and ledger require server-owned ingestion, retained masters/takes, radio and distinct download permissions; hosting remains undecided. The accepted frontend is a browser playback/visual experience, not evidence of an operating radio backend. Local research filename/content search found no existing Liquidsoap/Icecast design; FFmpeg references in unrelated UI/analysis research do not answer this architecture decision.

OR-1: Read current first-party Liquidsoap, Icecast, FFmpeg, HLS.js and Shaka documentation, releases and licence evidence relevant to radio. OR-2: Distinguish continuous station playout, personalized track queues, packaging/distribution and ad insertion. OR-3: Test claimed fit against Google IMA audio and SSAI/DAI restrictions. OR-4: Identify operations, security, fidelity and cross-device burdens, with AWS/GCP-neutral architecture and falsifiers. OR-5: Produce decision/source/depth/query/contradiction records and read back/hash this file. All implementation and runtime proof remain separate.

Assigned floor: five relevant primary project/standards works, with dependencies counted by issuing family. The register below contains 29 primary pages/documents from five project families: Savonet/Liquidsoap, Xiph/Icecast, FFmpeg, Video-dev/HLS.js and Google/Shaka/IMA. Google IMA and Shaka are not counted as independent corroboration of each other. No academic papers were assigned to this slice. The parent combines its academic and other research; its broader floors are not established here. A moving documentation page or search crawl does not prove an exact current binary. Product-specific facts below are `[single-source]` unless explicitly designated as architectural inference; source code/licence does not provide a service SLA or measured capacity.

## Decision and architecture

**Recommendation — architectural inference:** use server-owned, personalized track sessions as the primary radio/listening design to compare on AWS and GCP. Ingest every actual take/master once, create listening renditions once, and let a durable session service choose each next track from our catalogue. The browser plays these owned assets and hands control to Google IMA at eligible song boundaries. This supports guests, personal choices, skipping and the accepted Three.js experience without requiring an always-running encoder for every listener. It does not reduce the owner's radio requirement to upstream signed URLs or a browser-only playlist.

Add a synchronized, continuously advancing station only where the product deliberately needs listeners to hear the same programme. Liquidsoap is a credible playout engine for that separate mode; Icecast is an optional continuous-stream delivery component. Neither is necessary merely to retain our own music and control listening sessions. Liquidsoap describes stream composition and explicitly excludes being a complete radio application; Icecast separates the content-producing source client from the listener-facing server. `[single-source: S01; S09-S12]`

| Product mode | Concrete design | Material tradeoff |
| --- | --- | --- |
| Personalized owned radio — recommended primary path | Server selects eligible track IDs and ad opportunities; immutable catalogue assets reach each listener through a CDN; session survives navigation/restart. | Requires our durable queue, ownership, metadata and ad state machine. It preserves each listener's position through an ad. |
| Shared live station | Liquidsoap schedules and mixes approved local/cache assets, then emits one programme per station/rendition. HLS publication serves web/app clients; optional Icecast serves compatible continuous-stream clients. | Requires continuous playout operations, timeline continuity and explicit live-edge semantics. A station keeps advancing while one listener hears a personalized ad. |
| Personalized server-side stitched stream | A manifest/stitching service constructs per-session content/ad timelines and performs the required signalling and measurement. | This is additional engineering or an eligible managed ad service, not an automatic feature obtained by installing Liquidsoap or FFmpeg. |

The table is a proposed architecture, not a claim that any deployed pipeline already exists. Component premises and ad restrictions are sourced below. For example, if an individual hears a 30-second ad while a shared station advances, simply resuming the station either misses content or leaves the listener behind live. This follows from the two independent clocks; choose reserved break windows with filler, or an explicit buffered/DVR policy, rather than promising both perfect personalization and unchanged shared timing.

### Why GCP could win this comparison

**Conditional architecture recommendation:** the current project already identifies a Cloud Run music-generation service. If that remains the upstream engine, owner-controlled GCS storage, Google-side compute and a qualified CDN path can keep ingestion, identity and incident investigation within one operational environment. The owned track-session design does not require buying a managed television-oriented channel pipeline. This is a reason to evaluate GCP first for this product, not proof of lower prices or a completed GCS/CDN configuration. The current project brief establishes the engine context; cloud feature/pricing verification belongs to the parent's independent provider comparison.

The same components can instead run with AWS compute, S3 and a qualified CDN. Cross-cloud transfer, operating two identity environments and duplicate logs are costs to evaluate if generation stays on Google. Conversely, AWS can win if a specifically verified managed synchronized-radio/ad-stitching product meets audio-only, Google-ad, target-device and recovery requirements and reduces actual engineering/on-call burden enough to justify its cost. No generic managed-video feature list establishes that result. The vendor decision should compare identical listening behaviour, rendition quality, regions and operational guarantees.

### Proposed provider-neutral flow

1. **Ingest:** durable generation job → copy every actual output into private owned storage → checksum, media probe and metadata record → publish availability only after all required integrity checks. Copy retries must reuse the existing generation output.
2. **Prepare:** isolated, versioned media worker reads an immutable master and writes derived listening files or HLS renditions. Keep originals and transformation provenance. Publish a manifest only after its referenced assets are accessible.
3. **Listen:** server validates guest/session access and returns a catalogue track, stream location and metadata version. CDN serves listening assets; the application receives authoritative track events and renews access when needed.
4. **Advertise:** session marks an eligible between-track boundary; consent and SDK readiness determine whether IMA may request an ad; SDK events govern ad controls and content resumption. No-fill/error returns to the next eligible track. The server records the opportunity and outcome without treating a browser event as cryptographic proof.
5. **Download:** a separate authenticated entitlement service evaluates the login/reward rules before granting access to a master/download object. A listening URL is never reused as the master-download permission.

These are design requirements inferred from the owner brief and the mechanisms below. No provider SDK, billing resource, account configuration or software package was installed or changed.

## What the components establish, and what they do not

**Liquidsoap scheduling and transitions.** Stable 2.4.5 documents external request-list callbacks, prepared request queues, customizable transitions and autocue-assisted crossfades. These can connect our catalogue and scheduling policy to station playout. They are not proof of harmonic/beat-aware mixing or a complete editorial scheduler. Auditioning transitions against our music remains necessary. The request-source prose describes older queue restrictions; the 2.4.5 release adds removal methods, so implementation must use the pinned API rather than copying that older description. `[single-source: S02-S03, S07]`

**Liquidsoap HLS.** The 2.4.5 guide documents multi-rendition file output, segment retention, a file-change publication hook and restart persistence. It recommends placing its direct HLS server behind caching rather than using it as the public listener server. fMP4 output is supported, but that guide explicitly says it has no in-stream MP4 metadata. Therefore a player that understands metadata cannot manufacture cues absent from the origin. Keep authoritative sidecar timeline/track events, or prove an alternative supported metadata path. Persistence on orderly shutdown is not proof of crash-safe high availability. `[single-source: S04]`

**Icecast.** It can mirror complete stations or selected mounts, with on-demand relays to avoid fetching empty-listener streams. Its documented listener/source authentication can consult our service, but it does not supply our account, playlist or reward ledger. Mount fallback requires matching stream formats; a legacy configuration guide warns that an untimed fallback file on a master can overrun relays. These are useful mechanisms with operational caveats, not a replacement for globally cached HLS or personalized ad sessions. Exact 2.5 behaviour must be checked because the public documentation paths remain older. `[single-source: S11-S13]`

**FFmpeg preparation.** The HLS muxer documents MPEG-TS/fMP4, audio variants, playlists and temporary-file publication; the filters document crossfading and EBU R128 loudness normalization with measured single/double-pass options. Use these as building blocks for owned renditions. A transcoder invocation does not persist our schedule, authenticate listeners or implement ad accounting. Its online manuals track the newest code, so qualify flags against the chosen binary. `[single-source: S15-S17]`

**Audio fidelity — design inference.** Preserve the actual original; do not advertise a higher-resolution master by resampling a lesser source. Derive listening renditions once and avoid repeated lossy transcodes. Mixing two tracks requires decoded audio processing and subsequent encoding for a compressed output; stream-copy is a different path. Choose a loudness target only after measuring the source catalogue, ad transitions and true peaks, with original loudness retained in metadata. No fixed LUFS target or bitrate is claimed to be universally best. A practical AAC compatibility baseline and optional higher-fidelity renditions must be qualified on the target devices, not selected from marketing labels. Relevant processing mechanisms: S01, S16-S17; listening quality remains unmeasured.

**HLS.js or Shaka, behind our controls.** HLS.js documents audio-only formats, MSE/native-HLS conditions and CORS for HLS resources. Shaka documents adaptive audio/video, HLS/DASH and advertising interfaces. Select one appropriate playback adapter per client; do not load two engines to claim more capability. Retain the accepted player interface and Three.js scene while separating content, ads and media events. Library support does not establish gapless transitions, background playback, low-power behaviour or ad compatibility on every device. `[single-source: S19, S22, S25]`

For same-origin delivery, an application route alone does not secure media; authorization must also protect direct origin/CDN paths. For cross-origin delivery, qualify CORS and credential handling on manifests, segments and keys, and confirm the visualizer can receive the permitted audio signal. Do not solve cross-origin failures by exposing the master bucket. These are proposed security/integration requirements, not measured browser behaviour.

## Google audio advertising is a separate dependency

Google's HTML5 audio guide explicitly accepts an `<audio>` content element. It requires an ad display container even for audio, allows it to be hidden for that audio-only case, and requires custom ad playback/volume/skip controls. Skip availability comes from the SDK. This maps well to a persistent audio host behind the approved player. `[single-source: S26]`

The IMA overview distinguishes client-side playback from Google-side DAI and states that DAI requires Ad Manager 360 Advanced. Availability of the client-side SDK does not establish publisher approval, paid demand, fill or permission for every platform. Google Ad Manager audio inventory requires the correct audio/VAST setup and request parameters, including an unmuted context; linked account/inventory readiness must be established with the actual publisher account. `[single-source: S27, S29]`

**Design decision:** use IMA client-side audio as the first integration candidate for owned track sessions. Do not concatenate fetched ad files into Liquidsoap and call that a Google-certified personalized SSAI integration. FFmpeg/Liquidsoap can join audio, but the selected ad programme's consent, selection, tracking and eligibility obligations remain. The existence of a Shaka DAI adapter does not grant DAI entitlement. DAI's audio-only support for the intended product/account is still `[UNVERIFIED]` here. Banner and rewarded-download requirements remain in the parent ads/auth report; this radio design neither resolves reward eligibility nor creates web SSV.

On Samsung Tizen and selected LG TVs, Google's additional-platform document directs publishers to an account manager and explicitly avoids a general support promise. Shaka's matrix marks Tizen 2017+ actively tested, Tizen 2016 community-supported/untested, and WebOS community-supported/untested. These are distinct support signals, not universal playback+advertising certification. Web, native iOS/Android and each actual TV model need separate acceptance evidence. `[single-source: S22, S28]`

## Current versions, dependencies and licensing

All observations accessed 2026-09-12. Release facts are maintainer-reported `[single-source]`; no binary was downloaded, authenticated, executed or scanned.

| Component | Observed maintained state | Decision implication | Licence evidence |
| --- | --- | --- | --- |
| Liquidsoap | Stable 2.4.5, 2026-06-15, commit `d2bf3eb`; 2.4.6 appears as unreleased rolling work. S06-S08. | Pin release assets/digests and stage changes. README still names FFmpeg 7/8 as supported; do not assume FFmpeg 9 bindings work. | GPL version 2 or later in the project's licence paragraph, S06. |
| Icecast | 2.5.0, 2025-12-31. 2.4.4 receives only security fixes until 2026-12-31. S09. | Do not begin on the expiring branch; qualify 2.5 with the actual deployment and legacy-doc discrepancies. | GNU GPL version 2 in official project text, S09. |
| FFmpeg | Latest stable page: 9.0.1, 2026-08-12. S14. | A standalone preparation worker can have a different qualified dependency set from Liquidsoap's bindings. Moving manuals are not a binary compatibility guarantee. | Default LGPL 2.1+; enabled GPL components change the licence of that build. Optional nonfree dependencies and codec patents need build-specific review. S18. |
| HLS.js | 1.7.3, 2026-09-11, commit `e5ff358`; fixes include audio selection and live playlist reload recursion. S20. | A fresh stable release still needs target-browser regression. Actual codecs depend on the runtime. | Apache 2.0; retain the included derived-code notices. S21. |
| Shaka | Maintained-branches file names 5.2 latest, 5.1 previous; 4.16 LTS until 2027-01-31. Exact latest 5.2 patch not established here. S23. | Choose and record a tested exact version; avoid inferring native or TV delivery from browser support. | Apache 2.0 with MIT-licensed third-party notices in the licence file. S24. |

Licence labels are not a legal clearance of a final build. No complete transitive dependency/SBOM or distribution analysis was performed; Liquidsoap/Icecast licence identification relies on their explicit official declarations rather than a legal interpretation of every GPL clause. FFmpeg's legal page was read in full, as were HLS.js and Shaka licence files. Source-code permission does not independently grant rights to all music, advertising inventory or patented codecs. These remain separate checks for the actual selected build and distribution model.

### Negative evidence that changes the adoption plan

Liquidsoap's unreleased 2.4.6 notes list fixes for divergent HLS segment grids with different encoder frame sizes, crossfade/track metadata callbacks, buffer growth and HLS shutdown error handling. These are concrete regression targets before choosing stable 2.4.5 for a continuous multi-rendition station; they do not prove every 2.4.5 deployment fails. Do not silently promote a rolling build to production to obtain them. `[single-source: S08, section 2.4.6 UNRELEASED; linked issues #5319, #5379, #5287, #5260]`

The direct HLS metadata limitation, stale Icecast documentation, Liquidsoap's FFmpeg support wording and device-specific library support all prevent a credible claim that this is a turnkey universal radio system. They do not invalidate the owned catalogue/session architecture, which can use prebuilt track assets independently of continuous station encoding.

## Operations, security and acceptance gates

The following are proposed falsifiers/acceptance duties, not executed tests or numerical service guarantees.

| Gate | Evidence required before adoption | What would reject or change this design |
| --- | --- | --- |
| Ownership and ingest | Actual takes/masters checksum and probe; missing/partial copy recovery; only existing output copied after retry; metadata round trip. | Lost takes, expired upstream URL without recovery, or a packaging retry triggers paid generation again. |
| Personalized continuity | Real music → eligible actual ad → next owned track, with pause/skip/no-fill/error and reload recovery; no double audio or duplicate advancement. | Ad leaves the session stuck, skips unintended music, or advances twice. |
| Shared-station continuity, if selected | Long-running segment/cue/metadata checks; encoder restart, cache loss and storage outage; same-format fallback; aligned renditions and declared live/DVR policy. | Drift grows over time; repeated/stale cues; restart reuses incompatible sequence/timeline state; unbounded memory or a fallback outage. |
| Origin publication | Segment exists before manifest reference; failed writes do not publish partial files; correct expiry and stale-window retention. | Healthy manifests point to unavailable assets, cached access outlives the intended permission, or auth disables effective caching unexpectedly. |
| Fidelity | Audition source/renditions/transitions, measure loudness/peaks and verify durations, sample rate, channels and metadata. | Clipping, audible extra transcodes, incorrect gap/overlap, or advertised fidelity exceeds source fidelity. |
| Least privilege | Separate ingest, preparation, playback and download permissions; origin bypass denied; expired grants rejected; no secrets in player/logs. | A guest stream token retrieves a master, an arbitrary URL/path reaches a decoder, or public cache leaks private entitlement. |
| Media worker containment | Allowlisted internal asset IDs, decoded-file size/time/resource limits, isolated worker and bounded fetch access; dependency update and rollback evidence. | Untrusted playlist/URL can reach internal services or command execution, or malformed media exhausts shared application capacity. |
| Actual surfaces | Web audio/autoplay/visualizer behaviour first; later native background/audio-focus and real Samsung/LG model tests, remote focus and ad controls. | A nominally supported library does not function with our selected codec, controls, ad product or device. |
| Economics and operations | Same regions/listener-hours/renditions compared across providers; storage/CDN/request/compute/logging and engineering/on-call costs included. | Required recovery coverage exceeds available operating capacity or the measured all-in cost favours a qualified managed alternative. |

A continuous station additionally needs a single authorized writer per station timeline, durable schedule/state, a hot-asset cache and a tested standby/fencing strategy. A generic restart manager and `persist_at` alone do not establish this. Observe stream silence, playlist age, segment publication delay, decoder failures, buffer growth, track/ad cue mismatch and recovery time. Keep request-oriented web services separate from any always-running playout process. These are architecture duties inferred from the failure modes and the component production guidance, S04-S05/S08/S13.

Open guest listening and authenticated official master downloads are compatible as separate access policies. However a listener necessarily receives a playable representation and can capture playback; protecting the master endpoint is not a guarantee that heard music cannot be recorded. Browser ad events alone also cannot establish an unforgeable rewarded-download entitlement. Those trust limits remain regardless of AWS, GCP, Liquidsoap or a CDN.

## Source register and reading depth

`FULL` means the complete substantive body of the named short page/work was read, excluding navigation. `PARTIAL` records the exact relevant sections read from a larger work; it never means the full manual/repository was audited. All sources below were opened through the web tool in this session, accessed 2026-09-12. Extraction line locators can drift; section/version names are the durable locators. No raw web-byte/source-archive hash is claimed because the browser extraction does not establish those bytes. The report's read-back SHA-256 is returned separately to the parent.

| ID / family | Primary source | Read scope; use |
| --- | --- | --- |
| S01 / Savonet | [Liquidsoap 2.4.5 introduction](https://www.liquidsoap.info/doc-2.4.5/index.html) | FULL, substantive introduction/features/nonfeatures; component boundary. |
| S02 / Savonet | [Request sources](https://www.liquidsoap.info/doc-2.4.5/request_sources) | FULL, request preparation/queues/callbacks, lines 45-88; scheduling interface and stale queue prose. |
| S03 / Savonet | [Crossfading](https://www.liquidsoap.info/doc-2.4.5/crossfade) | FULL, guide and examples, lines 46-300; customizable transitions/autocue. |
| S04 / Savonet | [HLS output](https://www.liquidsoap.info/doc-2.4.5/hls_output) | FULL, guide and examples, lines 45-196; publication, retention, persistence, metadata limitations. |
| S05 / Savonet | [In production](https://www.liquidsoap.info/doc-2.4.5/in_production) | FULL, short production guidance, lines 37-43; daemon/log/staging guidance, not HA proof. |
| S06 / Savonet | [Repository README](https://github.com/savonet/liquidsoap) | PARTIAL, substantive README lines 197-303 through licence; maintained versions, FFmpeg bindings, mutable assets, licence declaration. |
| S07 / Savonet | [Release 2.4.5](https://github.com/savonet/liquidsoap/releases/tag/v2.4.5) | FULL release notes, 2026-06-15, `d2bf3eb`; queue API change and fixes. |
| S08 / Savonet | [Release archive](https://github.com/savonet/liquidsoap/releases) | PARTIAL, full 2.4.6 UNRELEASED notes and relevant 2.4.5/2.4.4 notes; current rolling defects, not production results. |
| S09 / Xiph | [Icecast project and release news](https://icecast.org/) | FULL substantive current news/about, lines 22-116; 2.5.0, 2.4.4 EOL, licence. |
| S10 / Xiph | [Documentation index](https://icecast.org/docs/) | FULL; current/staging links contrasted with older documentation labels. |
| S11 / Xiph | [Authentication](https://icecast.org/docs/icecast-latest/auth/) | PARTIAL, listener and source URL authentication, player caveat, lines 13-24 and 46-246; no exhaustive player support. |
| S12 / Xiph | [Relaying](https://icecast.org/docs/icecast-latest/relaying/) | FULL, lines 6-74 including examples; distribution/on-demand mechanism. |
| S13 / Xiph | [Configuration](https://icecast.org/docs/icecast-trunk/config_file/) | PARTIAL, mount/fallback settings lines 149-215; legacy-document warning retained. |
| S14 / FFmpeg | [Download and releases](https://www.ffmpeg.org/download.html) | FULL substantive page, lines 25-248; version/date, source/binary and signature distinction. |
| S15 / FFmpeg | [Documentation index](https://www.ffmpeg.org/documentation.html) | FULL substantive index; current online manuals generated from newest revision. |
| S16 / FFmpeg | [Formats manual: 4.46 HLS](https://www.ffmpeg.org/ffmpeg-formats.html#hls) | PARTIAL manual: HLS lines 3157-3521 and 3555-3627, including segment types, encryption, publication, variants; intervening subtitle examples not relied on. |
| S17 / FFmpeg | [Filters manual](https://www.ffmpeg.org/ffmpeg-filters.html) | PARTIAL manual: full acrossfade section lines 1374-1419 and loudnorm section 6579-6634; no complete filter audit. |
| S18 / FFmpeg | [Legal](https://www.ffmpeg.org/legal.html) | FULL substantive page, lines 29-76; build-specific licensing and codec patent boundary. |
| S19 / Video-dev | [HLS.js README](https://github.com/video-dev/hls.js/) | PARTIAL, audio/features/limitations and compatibility/CORS sections, lines 203-311 and 450-604. |
| S20 / Video-dev | [HLS.js releases](https://github.com/video-dev/hls.js/releases) | PARTIAL archive, FULL 1.7.3 release section, lines 158-228; current version/negative fixes. |
| S21 / Video-dev | [HLS.js licence](https://github.com/video-dev/hls.js/blob/master/LICENSE) | FULL 28-line source body; Apache 2.0 and derived-code notice. |
| S22 / Google | [Shaka README](https://github.com/shaka-project/shaka-player) | PARTIAL, substantive overview/formats/browser/platform/ad support, lines 208-560; TV support qualifiers. |
| S23 / Google | [Shaka maintained branches](https://github.com/shaka-project/shaka-player/blob/main/maintained-branches.md) | FULL 15-line source body; latest/previous/LTS branch dates, not an inferred patch version. |
| S24 / Google | [Shaka licence](https://raw.githubusercontent.com/shaka-project/shaka-player/refs/heads/main/LICENSE) | FULL, lines 0-247; Apache 2.0 and all three included MIT notices. |
| S25 / Google | [Shaka monetization tutorial](https://shaka-project.github.io/shaka-player/docs/api/tutorial-ad_monetization.html) | PARTIAL, full IMA client-side/DAI sections, lines 370-507; adapters vs external service entitlement. |
| S26 / Google | [IMA audio-only guide](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/audio) | FULL substantive guide/examples, lines 61-191; updated 2026-02-02. |
| S27 / Google | [IMA overview](https://developers.google.com/interactive-media-ads) | FULL substantive overview, lines 30-67; client-side/DAI distinction and account requirement. |
| S28 / Google | [Additional IMA platforms](https://developers.google.com/interactive-media-ads/docs/sdks/other) | FULL substantive page, lines 37-67; updated 2024-08-21, still controlling qualification. |
| S29 / Google | [Google Ad Manager audio](https://support.google.com/admanager/answer/7642796?hl=en) | FULL substantive guide read in the earlier ads slice; inventory/tag sections freshly reopened here, lines 23-56; account and unmuted inventory conditions. |

## Query, screening and contradiction records

Queries were run newest-first on 2026-09-12 through the web tool; source-following then opened official documentation/release/licence links. Exact query strings:

1. `Liquidsoap latest release 2026 radio crossfade fallback HLS license`
2. `Icecast latest release 2026 documentation fallback authentication license`
3. `FFmpeg latest stable release HLS audio AAC license 2026`
4. `hls.js Shaka Player audio only HLS support latest release license`
5. `site:github.com/video-dev/hls.js README audio only AAC license releases`
6. `site:gitlab.xiph.org/xiph/icecast v2.5.0 doc fallback`
7. `site:icecast.org docs 2.5.0 fallback mount authentication`
8. `site:github.com/savonet/liquidsoap releases 2.4.5 GPL license`
9. `site:shaka-project.github.io/shaka-player audio element ads IMA`
10. `site:icecast.org 2.5.0 fallback mount authentication`
11. `site:github.com/savonet/liquidsoap releases 2.4.5 license`
12. `site:icecast.org/docs fallback-mount fallback-override relaying`
13. `site:icecast.org "gitlab.xiph.org" icecast`
14. `site:shaka-project.github.io/shaka-player docs api audio only`

Queries 6-9 were attempted in a mixed search/link call whose response did not establish search coverage; the relevant topics were searched again in 9-11. Query 9 was repeated. Do not infer exhaustive GitLab discovery from that attempt. Searches surfaced third-party forums, mirrors and promotional comparisons; those were excluded from evidence. The older Liquidsoap academic paper was surfaced but not counted/read by this slice because the parent assigned academics separately. A GitHub raw README link failed; the rendered official README was used with explicit read boundaries. Stars, framework popularity and maintainer promotional performance language were not treated as measurements.

| ID | Contradiction/negative result | Resolution and consequence |
| --- | --- | --- |
| X01 | Cached search results reported older HLS.js releases; fresh official release archive showed 1.7.3. | Use current opened release section, retain exact date/commit, recheck at implementation. S20. |
| X02 | Liquidsoap says it supports the last two FFmpeg majors but explicitly lists 7/8; FFmpeg now lists 9.0.1 stable. | Do not assume 9 bindings; qualify/pin separately. S06 vs S14. |
| X03 | Liquidsoap 2.4.5 is stable, while rolling notes document relevant HLS/metadata/runtime defects. | Stable label is not scope-matching validation; stage targeted long-run/failure tests. S07-S08. |
| X04 | Icecast 2.5.0 is released, but latest documentation introduction still labels 2.4.1 and the index lists development documentation. | Treat relevant legacy settings as candidates; confirm with pinned 2.5 configuration/runtime before adoption. S09-S10. |
| X05 | Liquidsoap's HLS guide makes a broad MP3/AAC-only standards statement; modern player documentation lists additional audio codecs/containers. | Do not repeat that statement as a universal HLS limit. Codec/container/runtime compatibility is specific. S04 vs S19/S22. |
| X06 | A player understands metadata, but Liquidsoap's fMP4 output guide says no in-stream metadata. | Add/prove origin cue transport and timing; client feature alone is insufficient. S04 vs S19/S22. |
| X07 | Library ad/TV support can look like turnkey Google-ad support. | Separate media engine, actual device, Google account/product and SDK eligibility. S22/S25 vs S27-S28. |
| X08 | Older request-source prose restricts queue editing; stable 2.4.5 adds removal methods. | Use pinned current API/release behaviour. S02 vs S07. |

## Claim/dependency and decision record

| Claim | Evidence status | Parent action before reuse |
| --- | --- | --- |
| Owned radio has a feasible open-component alternative. | Architectural inference from five project families; component capabilities sourced, integration not executed. | Reopen scheduling/HLS/relay/FFmpeg/player primaries and verify the proposed interfaces in the actual implementation. |
| Personalized sessions better fit guest generation, choices, track-boundary ads and this player. | Explicit product-design inference from current brief plus S26-S27; not a market/benchmark fact. | Preserve the owner's ability to choose synchronized stations; verify actual user journey. |
| GCP-first can avoid unnecessary managed-channel and cross-cloud complexity. | Conditional architecture inference from current Cloud Run engine and portable component responsibilities. | Combine independent GCP/AWS feature/pricing evidence; obtain owner's vendor decision. |
| Latest releases and support/licence labels. | Maintainer facts, `[single-source]`, exact version boundaries above. | Reopen release/licence sources; pin actual artifact/dependency hashes and audit selected build. |
| Google IMA audio can fit the web path; DAI/TV eligibility is separate. | Google's own authority, `[single-source]`; account readiness and real device execution `[UNVERIFIED]`. | Reopen S26-S29 and validate actual publisher and platform prerequisites. |
| Delivery/ad/failover/security quality is sufficient. | `[UNVERIFIED]`; no implementation, performance or abuse tests performed. | Keep all acceptance gates open; do not relay this as operating-service evidence. |

Decision D01: compare owned personalized track sessions first, with optional continuous Liquidsoap stations separately costed. D02: keep vendor interfaces replaceable; favour GCP only conditionally until the full provider comparison and owner selection. D03: use actual IMA audio integration for the web candidate; do not equate audio concatenation with compliant ad stitching. D04: treat master entitlement as distinct from listenable media access and retain unresolved reward-policy/web-verification work.

## Reconciliation and handoff

OR-1 produced current primary documentation/release/licence evidence with explicit partial-read and build-audit boundaries. OR-2 and OR-3 separate all three delivery/ad models and their limitations. OR-4 supplies operational duties and falsifiers. OR-5 supplies this report's source/query/contradiction/claim/decision records; parent owns index/manifest integration and independent re-verification. Planned artifact count for this delegate: one; produced: one. No accepted website tree or previous ads report was changed.

Known gaps are precise: no actual owner-storage/CDN radio service, pin/compile/SBOM, streaming benchmark, cost measurement, live ad/account validation, reward-eligibility resolution, browser playback, failover run or native/TV test. No universal quality, security, fill or service-level result is claimed. This bounded slice contributes 29 primary pages from five project families and zero academic works to the parent's combined research; it does not certify that whole effort's source/academic/claim floors. Parent must read the report and decisive primaries before presenting conclusions as its own evidence.
