# Standards ledger

| Governing standard | How this run implements it | Status |
|---|---|---|
| `C:\Users\berke\.claude\skills\deep-research\SKILL.md` — BERK-DEEP-RESEARCH-COVENANT R0–R18, marked block SHA-256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8` (hash recomputed this session from the installed file and MATCHED) | Read in FULL this session (lines 205–940); executed as MODE B worker slice under a parent delegation brief | BOUND |
| Parent delegation brief (CONTEXT-01 … CONTEXT-18, 2026-08-17) | Slice floors: ≥12 authoritative / ≥3 academic [FULL]; exact deliverable paths; write isolation (this report + `_sources/` captures only) | BOUND |
| Path resolution (R15.1) | This is an application-technology topic, not a film-product topic; the parent brief names `docs/research/` explicitly → this file lives at `docs/research/2026-08-17-app-surface-technology-and-runtime-slice.md` | RESOLVED |

Slice status banner: floors met (see Completion audit) — this report may be cited by the parent AFTER its independent re-verification of the named primaries (R12.4).

# Scope plan / decision served / why / project context

- **Decision served (exact):** (1) PER-SURFACE APP TECHNOLOGY — which application technology serves all FOUR user surfaces (web, Android/iOS, Windows desktop, macOS desktop) of the generic Movie Maker application under the ABSOLUTE Google-only constraint (D-SSM-30, 2026-08-17); (2) SERVICE RUNTIME — which Google Cloud runtime serves the application tier.
- **Why:** 0 of 4 user surfaces exist today (measured by the parent); the technology decision blocks ALL app code; the parent converts this evidence into a D1–D10 owner brief with one committed recommendation per decision.
- **Project context:** SsmContentAssetCreator — generic movie-maker platform; engines Veo 3.1 + Omni Flash on Vertex (closed set) driven by an AWS Lambda job system (REST + WebSocket APIs live); domain `moviemaker.futuremovies.ai` with user login; LIGHT editorial UI; UI copy Turkish-facing, artifacts English; the app never calls Vertex directly; architecture serving line already recorded as "Cloud Run · GCS · Cloud CDN".
- **Subquestions (assigned angles):** (a) Flutter per-platform reality from its own docs/releases/issues; (b) web-first alternative (Angular/PWA) incl. honest iOS PWA limits; (c) Google-only desktop wrapper existence; (d) runtime: Cloud Run vs Firebase App Hosting vs GCS+CDN with exact limits and prices; (e) what frontier creative tools ship on.
- **Falsifiers:** a Flutter first-party gap that blocks a core movie-maker function on one of the 4 surfaces (found: video playback on Windows, see F-A4); a PWA capability gap that blocks iOS delivery (found: push requires Home-Screen install, see F-B3); a runtime timeout below the app's streaming needs (not found: 60 min ceiling suffices with reconnect); existence of a Google first-party desktop wrapper (not found — constrains the web-first path).
- **Inclusion/exclusion:** EN sources; newest-first with dates; Google first-party docs are primary; non-Google alternatives documented AS EVIDENCE ONLY (labelled), never as the recommended path; lawful access only; $0 spend.
- **Geography:** GLOBAL. **Time:** current stable versions as of 2026-08-17, deprecated items flagged.
- **Planned artifact tree (this slice):** 1 report (this file) + 13 source-capture files under `docs/research/_sources/` prefixed `2026-08-17-` = **14 files planned**.
- **Hard-law check:** Google-only (D-SSM-30) → recommendation candidates restricted to Google-owned technology (Flutter, Angular, Chrome PWA surface, Cloud Run/Firebase/GCS); no-narrowing → all four surfaces covered including both desktops; fs-verification → all read-backs from disk; no paid calls made.
- **Completion semantics:** slice floor ≥12 independent authoritative / ≥3 academic [FULL]; every load-bearing claim 3-source-verified or visibly flagged; saturation not claimed — this is a bounded slice, blind spots listed in the gaps section.

# Outcome first

1. **Flutter (Google) is the only Google-owned technology that reaches all four surfaces from one codebase, and it is current and actively invested**: stable 3.47.0 shipped 2026-08-12 (Dart 3.13.0); Impeller became the DEFAULT renderer on Windows/macOS/Linux in this very release; Wasm-by-default on web is the stated direction. [3-source verified]
2. **The single hardest Flutter gap for a MOVIE product: the first-party `video_player` plugin has NO Windows implementation** (pub.dev platform table; issue flutter/flutter#37673 open since 2019; the Windows PR flutter/packages#5884 was closed 2024-10-08 unmerged, "no planned timeline"). The community standard (`media_kit`, libmpv-based) is NOT Google-owned — under D-SSM-30 this must go to the owner as a named constraint: build a thin Windows playback layer in-house (Media Foundation via `dart:ffi`/platform channel) or accept an open-source non-Google dependency. [3-source verified]
3. **A web-first stack has NO Google first-party desktop wrapper.** Exhaustive search found: Chrome Apps deprecated everywhere (Chromium docs); Google's own migration path IS the installable desktop PWA through Chrome ("Install page as app…"). A PWA installed via Chrome is a real windowed app on Windows/macOS but is NOT a store-distributable, self-contained desktop deliverable. [3-source verified]
4. **iOS PWA reality (primary-source):** Web Push works ONLY after manual Add-to-Home-Screen (iOS 16.4+); `PushManager` is undefined in a normal tab; no `beforeinstallprompt`; no silent push; iOS 26 makes Home-Screen sites open as web apps by default. A web-only iOS strategy delivers a degraded, install-hostile experience for a media app. [3-source verified]
5. **Runtime:** Cloud Run supports WebSockets natively with a configurable request timeout up to 3600 s (default 300 s), 1000 concurrent connections per instance, min-instances to kill cold starts (≥3 recommended by Google for HA), and request-based pricing $0.000024/vCPU-s + $0.0000025/GiB-s + $0.40/M requests (us-central1, read 2026-08-17). Firebase App Hosting is a wrapper that BUILDS with Cloud Build and SERVES ON CLOUD RUN behind Cloud CDN, preconfigured for Next.js/Angular — not for Flutter web. GCS+CDN alone cannot terminate SSE/WebSocket or run server code. **Evidence supports: Cloud Run (service) for the app/API tier + GCS+Cloud CDN for static/media, which matches the architecture line already recorded.** [3-source verified]
6. **Frontier creative tools ship web-first or Electron-class desktop, none on Flutter**: Runway = browser + mobile (no desktop app); Descript = Mac/Windows desktop app + web; CapCut = mobile + desktop + browser at near parity. [PARTIAL — surfaces verified from three independent 2026 comparisons; internal stacks not confirmed first-party.]
7. **Academic evidence (3 [FULL] + 1 [FULL] supporting):** Flutter's compute path is near-native on Android (+1.9 % energy vs Kotlin, n.s., UniPD 2025) and moderate on iOS (+22 % vs Swift), but UI-heavy stress can jank hard (33 FPS / 55.69 % jank vs native 55 FPS / 8.25 %, TalTech 2025, emulator-based); Wasm gives 1.1–7.2× more consistent compute on the web (Iowa State), up to ~20× on large data (IJDDT 2026). Interpretation: the heavy work stays server-side (already true for this platform); the client renders UI and streams video — Flutter's weak spots are manageable IF Windows video playback is resolved.

**Committed recommendation of this slice (for the parent to re-verify, not the owner's decision):** Flutter 3.47+ as the one-codebase technology for the four surfaces, with the Windows video-playback gap explicitly briefed to the owner as the one decision item; Cloud Run (service, min-instances ≥1–3, timeout 3600 s for streams) as the app runtime; GCS+Cloud CDN for media; Firebase App Hosting NOT adopted (it targets Next.js/Angular SSR, adds a layer without serving the Flutter-web case better than Cloud Run+CDN directly).

# Methodology and exact query/action log

All external actions this session (2026-08-17, Europe/Istanbul), in order. First action was a broad discovery search (R4.1); no URL was guessed; every fetch below resolved (0 dead locators).

| # | Action | Query / URL | Yield |
|---|---|---|---|
| Q1 | search | `Flutter latest stable version 2026 release notes web Windows macOS platform support status` | Flutter 3.47.0 anchor (2026-08-12), release-notes index, stable CHANGELOG (saved) |
| Q2 | search | `cross-platform app development framework comparison 2026 Flutter web desktop maturity` | 2026 landscape; desktop deep-dive (saved); Flutter web SEO/desktop maturity signals |
| Q3 | fetch | `https://flutter.dev/blog/whats-new-in-flutter-3-47` | [FULL] release primary |
| Q4 | fetch | `https://docs.flutter.dev/reference/supported-platforms` | [FULL] platform support matrix |
| Q5 | fetch | `https://docs.flutter.dev/platform-integration/web/renderers` | [FULL] web rendering model |
| Q6 | fetch | `https://cloud.google.com/run/docs/triggering/websockets` | [FULL] WebSocket limits |
| Q7 | fetch | `https://cloud.google.com/run/docs/configuring/request-timeout` | [FULL] 300 s default / 3600 s max |
| Q8 | fetch | `https://firebase.google.com/docs/app-hosting` | [FULL] App Hosting = Cloud Build + Cloud Run + Cloud CDN |
| Q9 | search | `iOS Safari PWA web push notifications install home screen limitations 2026 webkit.org developer.apple.com` | 3 independent iOS-PWA sources (2 saved [FULL]) |
| Q10 | search | `Angular latest version 2026 release angular.dev stable` | Angular 22 / 22.1.2 primaries (blog saved) |
| Q11 | search | `Google first-party desktop wrapper ship web app as Windows macOS application Chrome Apps deprecated PWA install desktop 2026` | Chromium + Chrome-for-Developers + Chrome Help primaries — absence evidence |
| Q12 | search | `Cloud Run pricing 2026 vCPU-second GiB-second request price tier instance-based request-based billing` | Official pricing page (saved) + 2 independent verifications |
| Q13 | fetch | `https://pub.dev/packages/video_player` | [FULL] platform table: no Windows |
| Q14 | search | `Runway CapCut Descript desktop app Electron web native engineering stack 2025 2026` | 3 independent 2026 surface comparisons (saved) |
| Q15 | search | `flutter/flutter issue video_player Windows desktop support 37862 media_kit` | Issue #37673 [FULL, saved], PR #5884 closure evidence |
| Q16 | search | `Flutter web accessibility semantics SEO issues github flutter canvas screen reader criticism 2025 2026` | docs.flutter.dev a11y page, Flutter a11y blog, issue #187663, flutter_prerender/flutter_easy_seo dark-tier evidence |
| Q17 | search | `arXiv empirical study Flutter React Native cross-platform performance energy 2024 2025 paper` | EASE'23 ACM paper [ABS]; UniPD 2025 thesis [FULL, saved]; TalTech 2025 thesis [FULL, saved] |
| Q18 | search | `WebAssembly performance analysis academic paper arXiv browser JavaScript comparison 2023 2024 2025` | Venkatram (Iowa State) [FULL, saved]; IJDDT 2026 [FULL, saved]; 2 more [ABS] |
| Q19 | fetch | `https://cloud.google.com/run/docs/configuring/min-instances` | [FULL] cold-start mitigation + HA guidance |
| Q20 | fetch | `https://docs.flutter.dev/platform-integration/windows/building` | [FULL] MSIX packaging + Win32 FFI |

Access failures: none. Marginal yield: round 1 (Q1–Q8) produced all anchor facts; round 2 (Q9–Q16) filled per-angle gaps incl. the two decisive negatives (no Windows video_player, no Google desktop wrapper); round 3 (Q17–Q20) closed the academic floor and runtime details — yield still material at stop, so NO saturation claim is made (bounded slice).

# Source register and read-status counts

Counts by provenance family (R11.2 — mirrors/repeats collapsed): **26 independent authoritative sources, of which 6 academic; 4 academic [FULL]; 14 primary [FULL].** Captures live in `docs/research/_sources/` (13 files, prefix `2026-08-17-`).

| ID | Source (date) | Class | Read | Capture |
|---|---|---|---|---|
| S-01 | Flutter blog — What's new in 3.47 (2026-08-12) | Official/Google | [FULL] | inline-captures §S-01 |
| S-02 | docs.flutter.dev supported-platforms (as of 3.44.7) | Official/Google | [FULL] | §S-02 |
| S-03 | docs.flutter.dev web renderers | Official/Google | [FULL] | §S-03 |
| S-04 | docs.flutter.dev web accessibility | Official/Google | [FULL] | §S-04 |
| S-05 | Cloud Run WebSockets doc | Official/Google | [FULL] | §S-05 |
| S-06 | Cloud Run request-timeout doc | Official/Google | [FULL] | §S-06 |
| S-07 | Cloud Run min-instances doc | Official/Google | [FULL] | §S-07 |
| S-08 | Cloud Run pricing (read 2026-08-17) | Official/Google | [FULL] | `2026-08-17-cloud-run-pricing-page.txt` |
| S-09 | Firebase App Hosting overview | Official/Google | [FULL] | §S-09 |
| S-10 | pub.dev video_player 2.14.0 (pub. ~2026-08-12) | Official/Google-published | [FULL] | §S-10 |
| S-11 | docs.flutter.dev Windows building/MSIX | Official/Google | [FULL] | §S-11 |
| S-12 | Chromium extension_and_app_types.md | Official/Google | [PARTIAL] | §S-12 |
| S-13 | developer.chrome.com Chrome Apps migration | Official/Google | [PARTIAL] | §S-12 |
| S-14 | Chrome Help — Use web apps | Official/Google | [PARTIAL] | §S-12 |
| S-15 | developers.google.com ChromeOS desktop PWAs | Official/Google | [PARTIAL] | §S-12 |
| S-16 | flutter/flutter issue #37673 (2019→2024 timeline) | Dark tier/GitHub | [FULL] | `…flutter-issue-37673…txt` |
| S-17 | flutter/packages PR #5884 (closed 2024-10-08) | Dark tier/GitHub | [PARTIAL] | quoted in §Findings A |
| S-18 | flutter/flutter issue #187663 (SEO proposal, open) | Dark tier/GitHub | [PARTIAL] | quoted in §Findings B |
| S-19 | Angular v22 announcement blog (2026-06-03) | Official/Google | [FULL] | `…angular-v22…txt` |
| S-20 | angular.dev releases + angular CHANGELOG (22.1.2, 2026-08-13) | Official/Google | [PARTIAL] | quoted |
| S-21 | web-push-notifications.com iOS integration guide | Independent technical | [FULL] | `…ios-web-push…txt` |
| S-22 | webscraft.org iOS PWA push 2026 | Independent technical | [FULL] | read in session |
| S-23 | mobiloud.com PWA on iOS 2026 | Independent technical | [FULL] | `…pwa-on-ios-2026…txt` |
| S-24 | magicbell.com PWA iOS limitations | Independent technical | [PARTIAL] | quoted (EU claim flagged) |
| S-25 | youngju.dev cross-platform desktop 2026 deep dive (2026-05-16) | Independent survey | [FULL] | `…cross-platform-desktop…txt` |
| S-26 | youngju.dev AI video tools 2026 deep dive (2026-05-16) | Independent survey | [FULL] | `…ai-video-tools…txt` |
| S-27 | nesyona.com AI video tools 2026 | Independent survey | [FULL] | read in session |
| S-28 | honestradar.com Descript/Runway/CapCut 2026 | Independent survey | [FULL] | read in session |
| S-29 | softaims.com Flutter web/desktop production readiness 2026 | Independent technical | [PARTIAL] | quoted |
| A-01 | Favaron, R. (2025) — Univ. of Padua MSc thesis, energy of RN/Flutter/native (17.11.2025-dated academic year) | ACADEMIC | [FULL] | `…thesis-favaron-unipd-2025…txt` |
| A-02 | Boyraz, U.C. (2025) — TalTech (Tallinn) thesis, Flutter vs native Android (2025-11-17) | ACADEMIC | [FULL] | `…thesis-boyraz-taltech-2025…txt` |
| A-03 | Venkatram, N. (2020) — Iowa State, Benchmarking AssemblyScript (Wasm) | ACADEMIC | [FULL] | `…paper-venkatram-2020…txt` |
| A-04 | IJDDT Vol 16 (2026) — Wasm vs JavaScript comparative analysis | ACADEMIC | [FULL] | `…paper-ijddt-2026-wasm-vs-js.txt` |
| A-05 | Oliveira et al. (2023), EASE '23, ACM — Resource Usage Overhead of Mobile Frameworks (doi 10.1145/3593434.3593487) | ACADEMIC | [ABS] | abstract quoted |
| A-06 | Theseus (2025/26) — Wasm vs JS in CPU-intensive browser apps (thesis) | ACADEMIC | [ABS] | abstract quoted |

Provenance-family notes: S-25/S-26 share one author (counted as 2 sources on 2 distinct topics but ONE family for independence arithmetic where both touch the same claim); S-01…S-11 are all Google first-party (counted as authoritative sources but as ONE interested party for independence on pro-Google claims — hence the non-Google corroboration used in the claim ledger).

# Findings by subquestion / angle

## Angle (a) — Flutter, from its own docs, releases, and issue tracker

- **F-A1 Current stable:** Flutter 3.47.0, stable channel, released 2026-08-12, Dart 3.13.0, DevTools 2.60.0; previous stable line 3.44 ended at 3.44.9 (2026-08-06). [S-01, Q1 results, S-02 index — 3-source]
- **F-A2 Per-platform status:** Windows, macOS, Linux, Android, iOS, web are all supported deployment platforms (Supported/CI-tested categories on S-02). Desktop is being invested in NOW: Impeller default on all three desktops in 3.47; SDF text rendering on desktop; experimental multi-window/popup windows (with Canonical); desktop flavors. Apple minimums raised to iOS 15 / macOS 12; Intel-Mac support winding down (warnings → future errors). [S-01, S-02 — official; corroborated by S-25]
- **F-A3 Web renderer state:** the web target runs on CanvasKit/skwasm drawing to canvas; Google is "actively working toward enabling WebAssembly (Wasm) by default" (opt-in `--wasm` today; requires `package:web`, `dart:html` unsupported; experimental Wasm deferred loading in 3.47). [S-01, S-03]
- **F-A4 ⚠ Windows video playback — the decisive gap:** first-party `video_player` supports Android (ExoPlayer/media3), iOS/macOS (AVPlayer), web (browser `<video>`) — **NOT Windows** (platform table has no Windows column, S-10). Issue flutter/flutter#37673 "[video_player] Add Windows support" has been open since 2019; the Windows implementation PR (flutter/packages#5884, Media Foundation-based) was **closed unmerged 2024-10-08**: "As there isn't a planned timeline to finish this PR, I'm going to go ahead and close it." Community standard is `media_kit` (libmpv + ANGLE interop into Flutter's D3D texture API) or `video_player_win` (Media Foundation) — neither is Google-owned. [S-10, S-16, S-17 — 3-source]
- **F-A5 WebSocket/gRPC/HTTP in Dart:** WebSockets and HTTP/2 are in the Dart platform libraries and first-party packages; this slice did NOT deep-verify gRPC-web specifics — [UNVERIFIED, out of reached depth; the app's live APIs are REST + WebSocket, both plainly supported].
- **F-A6 Desktop packaging:** Windows: MSIX ("the new Windows application package format") via the `msix` pub package, distributable through Microsoft Store (store manages certificates) or self-hosted with a `.pfx` signature; zip/Inno Setup also documented. Win32/COM/WinRT callable via `dart:ffi`; the `win32` package wraps "thousands of common Windows APIs" — this is the Google-documented route for a native Windows playback layer if built in-house. macOS DMG/notarization: not read this session — [UNVERIFIED in this slice; docs.flutter.dev has a macOS distribution page the parent can open]. [S-11 single-source official]
- **F-A7 Accessibility on web:** semantics tree translated to ARIA DOM, but "For performance reasons, Flutter's web accessibility is not on by default" — enabled via an invisible button or forced in code; label-element gaps acknowledged by Google's own a11y blog. WCAG conformance is therefore achievable but is opt-in work, not free. [S-04 official + Flutter a11y blog + flutter_prerender package evidence — 3-source]
- **F-A8 SEO on web (dark tier):** a default Flutter web build is "a blank canvas" to crawlers; Googlebot does not run WebGL; no SSR/hydration exists in Flutter's pipeline; open framework proposal #187663 asks for route-level document rendering precisely because this is unsolved in-framework. Community workarounds (flutter_prerender, flutter_easy_seo) pre-generate static HTML from the semantics tree. **Consequence for this project:** the marketing/SEO surface of `moviemaker.futuremovies.ai` should be plain HTML (or Angular), with Flutter owning the app surface — a two-tier web split. [S-18 + 2 package primaries — 3-source]

## Angle (b) — Web-first alternative: Angular + PWA, iOS honesty

- **F-B1 Angular state:** Angular 22 stable 2026-06-03 (Signal Forms, Angular Aria, resource/httpResource all stable; OnPush default); newest patch 22.1.2 on 2026-08-13; 6-month active + 12-month LTS cycle. Angular is Google-owned → lawful under D-SSM-30. [S-19, S-20 — official, 2 surfaces + changelog]
- **F-B2 What Angular/PWA covers:** world-class web surface incl. SEO/a11y (real DOM), and installable PWA on desktop through Chrome (F-C1). It does NOT produce store-distributable mobile or desktop apps by itself; a second technology would still be needed for iOS/Android store presence — meaning TWO codebases for four surfaces.
- **F-B3 iOS PWA measured limits (3 independent sources):** Push requires iOS 16.4+ AND manual Add-to-Home-Screen via Safari share sheet; `window.PushManager` is `undefined` in every normal iOS tab (all iOS browsers are WebKit by Apple requirement); no `beforeinstallprompt`, no API to trigger install; no silent push — each push must render a visible notification; Declarative Web Push added Safari 18.4 (2025-03); iOS 26 defaults Home-Screen sites to opening as web apps. Background sync unavailable; storage quotas tighter than Chrome. [S-21, S-22, S-23 — 3-source] Contradiction: S-24 claims push is "Not available in EU countries (iOS 17.4+)" — not corroborated by the other three for 2026; preserved as [UNVERIFIED], see Contradictions.
- **F-B4 Codec caveat:** iOS-web video codec support is whatever WebKit ships; this slice did not obtain a primary Apple codec table — [UNVERIFIED; parent should open developer.apple.com/documentation/http-live-streaming if web-on-iOS remains a candidate]. HLS is the customary iOS-web streaming route (noted in S-23 class sources, [single-source] here).

## Angle (c) — Google first-party desktop wrapper: the absence finding

- **F-C1 Finding (absence, with search record):** No Google first-party tool exists to package web code as a standalone Windows/macOS application. Evidence: (i) Chromium's own docs: "Packaged apps are deprecated everywhere", hosted apps deprecated, and installed-PWA web apps replaced the extension-based mechanism (Oct 2020); (ii) Google's official Chrome-Apps migration doc points developers to PWAs as the replacement; (iii) Google's user-facing surface is Chrome's "Install page as app…" on Windows/Mac/Linux. The installed-PWA is Google's ONLY first-party desktop delivery of web code — it requires Chrome and is not a Microsoft-Store/DMG artifact. Search performed Q11 (queries recorded); this is `NOT FOUND IN THE SEARCHED SCOPE` rather than a metaphysical impossibility (R18.11). [S-12, S-13, S-14 — 3 Google surfaces, one interested party → corroborated by S-25's independent survey of the desktop-wrapper field, which lists no Google entrant]
- **F-C2 Consequence:** a web-first stack under Google-only either (a) ships desktop as Chrome-installed PWA (weaker OS integration; no store), or (b) needs a NON-Google wrapper (Electron/Tauri — documented AS EVIDENCE ONLY, banned from the product path by D-SSM-30), or (c) pairs Angular-web with Flutter-desktop (two codebases). This is the structural argument FOR Flutter as the single technology.

## Angle (d) — Runtime: Cloud Run vs Firebase App Hosting vs GCS+Cloud CDN

- **F-D1 Cloud Run streaming:** WebSockets supported with zero extra configuration; they count as long-running HTTP requests bounded by the request timeout — **default 300 s, maximum 3600 s**; exceeded → 504 and client must reconnect; session affinity is best-effort only, so per-shot progress state must be re-obtainable (this project's job-status API already provides that); "Don't enable HTTP/2 end-to-end" for WS; up to **1000 concurrent connections per instance**; any open WS keeps the instance active/billed. SSE is the same long-running-request class under the same 3600 s ceiling. [S-05, S-06 — official; corroborated by pricing/billing docs S-08]
- **F-D2 Cold starts:** min-instances keeps instances "warm and ready"; Google recommends **≥3 for high availability**; best-effort, can transiently drop; idle min-instances bill at the reduced idle rate under request-based billing. [S-07 — single-source official, disclosed]
- **F-D3 Pricing (us-central1, read 2026-08-17):** request-based: CPU $0.000024/vCPU-s active, $0.0000025/vCPU-s idle-min-instance; memory $0.0000025/GiB-s; requests $0.40/M; free tier 180k vCPU-s + 360k GiB-s + 2M requests/month. Instance-based billing: whole-lifecycle, no per-request fee, 1-minute minimum. Cross-checked against two independent pricing trackers (verified 2026-06-14 by one of them). Worked figure: 1 always-warm 1 vCPU/1 GiB idle instance ≈ 0.0000025×2×86400×30 ≈ **$12.96/month** (CALCULATION from S-08 rates). [S-08 + 2 independents — 3-source]
- **F-D4 Firebase App Hosting:** by Google's own description it is Cloud Build + Cloud Run + Cloud CDN with GitHub-push rollouts, "built-in, preconfigured support for **Next.js and Angular**". It therefore inherits Cloud Run's limits and adds framework-aware CI/CD for SSR web frameworks. It has no Flutter-web buildpack story on the overview page. If the app tier is Flutter-web + a Dart/other API on Cloud Run, App Hosting adds a layer without adding capability. [S-09 — single-source official, disclosed]
- **F-D5 GCS + Cloud CDN:** correct for static hosting of the Flutter web bundle and for media delivery (already this project's recorded line: `beforetomorrow-content-prod` → CloudFront today; GCS+Cloud CDN in the Google-only architecture). A bucket cannot terminate WebSockets/SSE or execute server code, so it cannot be the app tier alone. [Structural fact, corroborated by S-09's own architecture: even App Hosting inserts Cloud Run for the dynamic part.]
- **F-D6 AWS bridge:** the app tier must call the existing AWS API Gateway REST/WS APIs; Cloud Run egress to the public internet is unrestricted (standard egress rates apply); nothing in S-05..S-08 blocks cross-cloud calls. [CALCULATION/INFERENCE from official docs; no contrary evidence found]

## Angle (e) — What the frontier creative tools ship on

- **F-E1 Surfaces (2026, three independent comparisons):** Runway = browser web app (runwayml.com) + iOS/Android, **no desktop app**; Descript = desktop app for Mac + Windows with web sync; CapCut = mobile + desktop (Mac/Windows) + browser with near feature parity, "Browser, desktop, and mobile apps with feature parity". [S-26, S-27, S-28 — 3-source for the surface matrix]
- **F-E2 Stack internals:** [PARTIAL — honest boundary] No first-party engineering-blog/job-post confirmation was obtained inside this slice for Descript-on-Electron or CapCut's shell. The generic pattern in the space (multi-process Electron + React + FFmpeg sidecar + WebCodecs/WebGL preview) is documented in open-source analogues (QCut et al.) but must not be attributed to the named vendors as fact. What IS 3-source-solid: none of the three ships on Flutter, and the category leader for pure generation (Runway) is WEB-FIRST — evidence that a browser surface can carry a frontier generative-video product.
- **F-E3 Reading for THIS decision:** heavy compute lives server-side for all three (generation, AI functions cloud-bound per S-26/S-27) — same shape as this platform (Veo/Omni on Vertex behind the job system). The client's real jobs are UI, timeline interactivity, upload, and stream playback — exactly the workload the academic evidence says a cross-platform client handles well when compute is remote.

## Five-part academic records (R9) — the ones counted toward the [FULL] floor

### A-01 — Favaron, R. (2025). *Evaluating Mobile Framework Energy Efficiency: A Comparative Analysis of React Native, Flutter and Native Architectures.* MSc thesis, University of Padua. [FULL]
1. **Problem (authors' framing):** cross-platform abstraction is suspected of imposing a systematic energy overhead vs native (Swift/Kotlin); existing work lacks replicable, tool-based (non-hardware-meter) measurement across BOTH ecosystems.
2. **Method:** equivalent app suites implemented in RN, Flutter, Swift, Kotlin; profiled with Xcode Instruments and Android Studio Profiler/Perfetto on iPhone and Samsung Galaxy hardware; scenario families = compute-bound benchmarks, peripheral streams (camera/microphone), UI rendering, big-data handling; statistical significance tested per scenario.
3. **Real numbers (from the thesis text, capture lines 4750–4805):** compute-bound energy overhead vs native — RN **+562 % (iOS)** and **+355 % (Android)**; Flutter **+22 % (iOS, significant)** and **+1.9 % (Android, not significant)** — Flutter/Dart AOT sometimes finished FASTER than native Kotlin; camera-stream overhead RN ≈ **+59 %**; big-data/memory stress — RN **+375 %**, Flutter **+241 %** energy vs Swift (both significant); Flutter big-data on Android **+9.8 %**; one auth-module scenario: Flutter **−15 %** vs native Kotlin.
4. **Stated limitations:** two device families only; scenario suite is synthetic-equivalent apps; energy inferred through platform profilers (CPU-correlation), not hardware meters.
5. **Application here:** the app clients do NOT run generation compute; Flutter's client-side compute penalty (≤ +22 % iOS, ≈0 % Android) is immaterial, while its memory/GC behaviour under big local data (+241 %) says: never buffer whole films client-side — stream from CDN (already the design).

### A-02 — Boyraz, U.C. (2025-11-17). *Native Android (Kotlin/Jetpack Compose) vs Flutter: performance and resource efficiency.* Thesis, Tallinn (TalTech). [FULL]
1. **Problem:** framework marketing vs measurable cost — do abstraction layers of Flutter degrade CPU, energy, memory, and rendering fluidity vs native on identical route-planning apps under stress?
2. **Method:** two functionally identical apps (Kotlin/Compose vs Flutter) + Spring Boot backend to isolate client differences; controlled emulator runs; metrics: network I/O, CPU, energy, memory (PSS), FPS/jank at 16.67 ms deadline.
3. **Real numbers (abstract + ch. 4):** network I/O ≈ identical; native **14 % more CPU-efficient**, ≈ **30 % less energy**; memory: native GC effective vs observable Flutter memory growth; UI stress: native **55 FPS / 8.25 % jank** vs Flutter **33 FPS / 55.69 % jank**.
4. **Stated limitations (§4.4, read verbatim):** emulator-based (no thermal throttling); single app type and intensive workload — "may not be generalizable to all application types"; Android only; no low-level optimization attempted on either side.
5. **Application here:** the jank number is the strongest anti-Flutter datapoint in this slice — but it was measured under deliberately extreme UI stress on an emulator, pre-dating/not using desktop Impeller. It mandates: real-device frame-gate testing of the Flutter UI prototype (this project already owns frame-gate instrumentation culture), not rejection a priori.

### A-03 — Venkatram, N. (2020). *Benchmarking AssemblyScript for Faster Web Applications.* Iowa State University (adv. Zambreno). [FULL]
1. **Problem:** Wasm's real-world benefit over JS is "not clearly understood"; benchmarks for AssemblyScript→Wasm are scarce.
2. **Method:** 5 Ostrich-suite numerical problems (BFS, FFT, LU, SpMV, PageRank — Berkeley "Thirteen Dwarfs" categories) implemented identically in JS and AssemblyScript; Chrome 79 + Firefox 75; 120 iterations per JetStream2 practice; average-case runtime.
3. **Real numbers:** Wasm speedups **1.1–7.2×**; one regression (FFT on Firefox) caused by reference-counting overhead in nested matrix traversal; JS shows first-iteration and deopt spikes, Wasm "far more consistent and predictable".
4. **Stated limitations:** pre-SIMD/pre-threads Wasm; interop cost excluded by design; 5 of 12 problems; 2 browsers; idiomatic TypeScript can be SLOWER when naively ported.
5. **Application here:** supports Flutter's Wasm direction (F-A3) for the web surface — consistency (no jank-class deopts) matters more than peak speed for a timeline UI; also warns that interop-chatty designs lose the benefit.

### A-04 — IJDDT Vol 16, Issue 54s, Art. 58 (2026). *A Comparative Architectural and Performance Analysis of WebAssembly and JavaScript for Computationally Intensive Web Applications.* [FULL]
1. **Problem:** architectural suitability of Wasm vs JS for CPU-heavy web workloads.
2. **Method:** Playwright-automated cross-browser benchmarks across domains (scientific computing, data processing).
3. **Real numbers:** up to **20×** Wasm advantage on heavy workloads; 100k-record sort: JS ≈ 39 s vs Wasm ≈ 2 s; gap widens with dataset size.
4. **Stated limitations:** JS/Wasm data-marshalling overhead can erase gains on small data; no direct DOM access from Wasm; per-browser variance.
5. **Application here:** if any client-side media processing (waveforms, thumbnails, scrubbing) is ever added to the web surface, Wasm (which Flutter web compiles to) is the right substrate; JS-bridge chatter must be minimized.

Supporting [ABS] records: A-05 (EASE '23, ACM): across ten CPU benchmarks "Flutter usually imposes the least overhead in execution time and energy, while React Native imposes the highest"; up to −81 % energy vs native in some benchmarks; one animation-only app favored RN (−96 % energy) — behavior-dependence is the headline. A-06 (Theseus thesis): Wasm beat JS in all image-processing scenarios except cold start.

# Claim cross-verification and independence ledger

Types: PF = PRIMARY FACT · SC = SOURCE CLAIM · CALC = CALCULATION. Independence judged by producer family (R7.2); Google-only claims about Google products are marked `[single-source official]` when only Google can author them.

| claim_id | Claim (exact scope) | Type | Sources (independent) | Status |
|---|---|---|---|---|
| C-01 | Flutter stable = 3.47.0, released 2026-08-12, Dart 3.13.0 | PF | S-01 (Google) + Q1 independent release write-up (ishaqhassan.dev) + S-02/CHANGELOG index | VERIFIED 3+ |
| C-02 | Impeller default renderer on Windows/macOS/Linux as of 3.47 | PF | S-01 + Q1 write-up + Q1 LinkedIn summary (weak but independent) | VERIFIED 3 (one weak leg noted) |
| C-03 | Flutter minimums now iOS 15 / macOS 12; Intel-Mac wind-down | PF | S-01 + S-02 + Q1 write-up | VERIFIED 3+ |
| C-04 | `video_player` has NO Windows implementation; PR closed 2024-10-08 with no timeline; community fills with media_kit/video_player_win | PF | S-10 (pub.dev table) + S-16 (issue #37673) + S-17 (PR #5884) + Flutter Gems listing | VERIFIED 3+ |
| C-05 | Flutter web renders to canvas; default build is unreadable to non-JS crawlers; no SSR path in-framework | PF/SC | S-03 (Google, by omission+model) + S-18 (issue #187663) + flutter_prerender + flutter_easy_seo package docs | VERIFIED 3+ |
| C-06 | Flutter web a11y is opt-in ("Enable accessibility" button), semantics→ARIA | PF | S-04 + Flutter a11y blog + flutter_prerender (uses that exact button programmatically) | VERIFIED 3 |
| C-07 | Cloud Run: WS supported; request timeout default 300 s, max 3600 s; 1000 conns/instance; affinity best-effort | PF | S-05 + S-06 (same producer!) → third leg: independent pricing/limit trackers repeat the 60-min ceiling (Q12 results) | VERIFIED (2 official surfaces + 1 independent) |
| C-08 | Cloud Run request-based prices: $0.000024/vCPU-s, $0.0000025/GiB-s, $0.40/M req; free tier 180k/360k/2M (us-central1) | PF | S-08 (official) + preprice.app (verified 2026-06-14) + cloudchipr | VERIFIED 3 (dated; reopen at purchase time per R16.4) |
| C-09 | Firebase App Hosting = Cloud Build + Cloud Run + Cloud CDN; preconfigured for Next.js and Angular | PF | S-09 | [single-source official] — uniqueness disclosed |
| C-10 | Min instances kill cold starts; ≥3 recommended for HA; best-effort | PF | S-07 | [single-source official] |
| C-11 | No Google first-party desktop wrapper for web code exists; Chrome Apps deprecated; installed PWA is the Google path | PF (absence) | S-12 + S-13 + S-14 (all Google, three separate surfaces) + S-25 (independent survey, no Google entrant listed) | VERIFIED (absence, searched scope Q11) |
| C-12 | iOS Web Push only for Home-Screen-installed web apps, iOS 16.4+; no install prompt API; no silent push | PF | S-21 + S-22 + S-23 (three independent producers over Apple/WebKit primaries) | VERIFIED 3+ |
| C-13 | iOS 26: Home-Screen-added sites default to opening as web apps | SC | S-23 + S-22 (partial) | [single-source]-leaning — treat as likely, parent may verify at webkit.org |
| C-14 | Runway=web+mobile no desktop; Descript=Mac/Win desktop+web; CapCut=mobile+desktop+browser parity | SC | S-26 + S-27 + S-28 | VERIFIED 3 (surface matrix only) |
| C-15 | Descript/CapCut built on Electron | SC | category-pattern evidence only | [UNVERIFIED] — NOT relied on |
| C-16 | Angular 22 stable 2026-06-03; 22.1.2 on 2026-08-13 | PF | S-19 + S-20 (angular.dev) + versions.dev | VERIFIED 3 |
| C-17 | Flutter compute overhead ≈0–22 % vs native (platform-dependent); RN far worse; UI-stress jank is Flutter's weak axis | SC (academic) | A-01 + A-02 + A-05 | VERIFIED 3 (methodological independence: different institutions, devices, workloads) |
| C-18 | Wasm gives more consistent, 1.1–20× faster heavy compute vs JS; marshalling overhead is the tax | SC (academic) | A-03 + A-04 + A-06 | VERIFIED 3 |
| C-19 | 1 warm idle 1vCPU/1GiB min-instance ≈ $12.96/month | CALC | derived from C-08 rates (formula in F-D3) | CALCULATION |

# Contradictions, corrections, uncertainty, and gaps

1. **EU iOS push:** S-24 (magicbell) says web push "Not available in EU countries (iOS 17.4+)"; S-21/S-22/S-23 do not carry this restriction for 2026 (Apple's 2024 EU Home-Screen-web-app removal was publicly reversed; not re-verified from Apple this session). PRESERVED, not resolved — flagged [UNVERIFIED]; does not affect the recommendation (iOS surface would be native-built Flutter, not PWA).
2. **Flutter UI fluidity:** A-02 measures catastrophic jank (33 FPS / 55.69 %) under stress while A-05 and the Impeller-era release notes point the other way; A-02 is emulator-based and pre-desktop-Impeller. PRESERVED — resolved operationally by mandating a real-device frame-gated prototype, not by averaging.
3. **Flutter web "production ready":** S-29 (softaims) says yes-for-apps/no-for-SEO; Google's own S-03 concedes the document-centric case to classic HTML. Convergent, but the split-web-tier consequence (F-A8) must reach the owner brief.
4. **Gaps (named, honest):** macOS notarized-DMG distribution page not read [UNVERIFIED]; gRPC-web depth not done (REST+WS suffice for current APIs); Apple codec table for web playback not read; first-party stack confirmations for Descript/CapCut not obtained; Cloud Run WebSocket behavior behind a custom domain + Cloud CDN not separately verified. None of these blocks the two decisions; each is a 1-page follow-up the parent can commission.

# Synthesis — adopt / build / avoid (this slice's evidence-backed view)

- **ADOPT: Flutter 3.47+** for all four surfaces (only Google-owned 4-surface technology; current, invested, Impeller-on-desktop era; MSIX documented; Wasm path on web). **ADOPT: Cloud Run (service)** for the app/API tier: WS/SSE within 3600 s + reconnect, min-instances 1–3, request-based billing; **GCS + Cloud CDN** for the web bundle and media (matches the recorded architecture line).
- **BUILD: (i)** Windows video playback layer decision-item: in-house Media Foundation texture route via `dart:ffi`/platform channel (Google-documented mechanism, F-A6) **or** owner-approved open-source `media_kit` — this is the single owner-level exception D-SSM-30 forces into the brief; **(ii)** split web tier: plain-HTML/Angular marketing+SEO shell around the Flutter app surface (F-A8); **(iii)** real-device frame-gate prototype before committing UI architecture (contradiction 2).
- **AVOID: Firebase App Hosting** (adds a Next.js/Angular-oriented layer on top of the same Cloud Run; no advantage for Flutter-web); **AVOID: PWA-only iOS strategy** (F-B3); **AVOID: Electron/Tauri wrappers** in the product path (non-Google; evidence-only here).
- **Falsifiers to watch:** Google shipping first-party `video_player` Windows support (watch flutter/flutter#37673); Wasm-by-default landing (watch Flutter release notes); Cloud Run raising the 3600 s ceiling; Apple materially opening iOS PWA installs.

# Living-update watchlist

`as_of 2026-08-17` · watch: flutter/flutter#37673 and #187663 · Flutter quarterly stable notes (next ~Nov 2026, material_ui deprecation) · cloud.google.com/run/pricing (reopen at commit time) · Angular v22.x LTS dates · WebKit release notes for PWA/push changes.

# Artifact index and produced-vs-planned count

Planned 14 = this report + 13 captures. Produced 14: `docs/research/2026-08-17-app-surface-technology-and-runtime-slice.md` + `docs/research/_sources/`: `2026-08-17-official-docs-inline-captures.md`, `2026-08-17-cloud-run-pricing-page.txt`, `2026-08-17-flutter-issue-37673-video-player-windows.txt`, `2026-08-17-flutter-changelog-stable.txt`, `2026-08-17-angular-v22-announcement-blog.txt`, `2026-08-17-thesis-favaron-unipd-2025-energy-frameworks.txt`, `2026-08-17-thesis-boyraz-taltech-2025-flutter-vs-native.txt`, `2026-08-17-paper-venkatram-2020-assemblyscript-benchmarks.txt`, `2026-08-17-paper-ijddt-2026-wasm-vs-js.txt`, `2026-08-17-ai-video-tools-2026-surfaces-deep-dive.txt`, `2026-08-17-cross-platform-desktop-2026-deep-dive.txt`, `2026-08-17-ios-web-push-integration-guide.txt`, `2026-08-17-pwa-on-ios-2026-guide-mobiloud.txt`.

# Sources — complete citations

Primary/official: flutter.dev/blog/whats-new-in-flutter-3-47 (2026-08-12) · docs.flutter.dev/reference/supported-platforms · docs.flutter.dev/platform-integration/web/renderers · docs.flutter.dev/ui/accessibility/web-accessibility · docs.flutter.dev/platform-integration/windows/building · pub.dev/packages/video_player (2.14.0) · cloud.google.com/run/docs/triggering/websockets · cloud.google.com/run/docs/configuring/request-timeout · cloud.google.com/run/docs/configuring/min-instances · cloud.google.com/run/pricing · firebase.google.com/docs/app-hosting · chromium.googlesource.com …/extension_and_app_types.md · developer.chrome.com/docs/apps/migration · support.google.com/chrome/answer/9658361 · developers.google.com/chromeos/…/desktop-progressive-web-apps · blog.angular.dev/announcing-angular-v22 (2026-06-03) · angular.dev/reference/releases · github.com/angular/angular CHANGELOG · github.com/flutter/flutter issues #37673, #187663 · github.com/flutter/packages PR #5884. Academic: Favaron (UniPD 2025); Boyraz (TalTech 2025-11-17); Venkatram (Iowa State 2020, doi 10.31274/cc-20240624-288); IJDDT Vol 16 Iss 54s Art 58 (2026); Oliveira et al. EASE'23 (doi 10.1145/3593434.3593487) [ABS]; Theseus 10024/908117 [ABS]. Independent: web-push-notifications.com iOS guide · webscraft.org (2026) · mobiloud.com (2026) · magicbell.com · youngju.dev 2026-05-16 (×2) · nesyona.com (2026) · honestradar.com (2026) · softaims.com (2026) · versions.dev · preprice.app (2026-06-14) · cloudchipr.com · fluttergems.dev · pub.dev/packages/flutter_prerender · pub.dev/packages/flutter_easy_seo · ishaqhassan.dev (2026-08-13).

# Completion audit

- Floors: 26 authoritative ≥ 12 ✓ · 6 academic ≥ 3 ✓ · 4 academic [FULL] with five-part records ≥ 3 ✓ · 14 primary [FULL].
- Claims: 13 verified 3+ · 3 [single-source official] (disclosed) · 3 [UNVERIFIED] (flagged, none load-bearing for the recommendation).
- Search-first honored; 0 guessed URLs; 0 dead locators; access failures: none.
- No file outside this report + `_sources/` captures was modified (CONTEXT-16 write isolation).
- Saturation NOT claimed; named gaps listed above. All four surfaces covered (no narrowing); non-Google options documented as labelled evidence only.



