# Standards ledger

| Governing standard | How this run implements it | Evidence / status |
| --- | --- | --- |
| Deep-research covenant `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (1,310 lines read in full this session) | R0–R18 executed as a delegated slice (axis c — APIs/tech). Marked block SHA-256 recomputed this session: `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8` (64,383 bytes) — matches the parent's `COVENANT_SHA256`. | COVENANT ACKNOWLEDGED |
| `C:\Users\berke\.cursor\rules\00-berk-constitution.mdc` (Law Zero) | Every load-bearing number below comes from a page or file opened THIS session; anything not opened is marked `[UNVERIFIED]`, `[single-source official]` or `INACCESSIBLE`. | read from disk this session |
| `C:\Users\berke\.cursor\rules\10-no-narrowing.mdc` | All 7 angles of CONTEXT-02 have a section (§F1–§F7); the count of angles in the brief (7) equals the count of finding sections (7). | read from disk this session |
| `C:\Berk\PlayMusicPrompts\.cursor\rules\23-external-api-integrations-law.mdc` | Official docs only; every register row carries URL, declared version/date, fetch time, byte size and SHA-256 of the saved capture under `docs/research/_sources/2026-09-05-apis-*`. Blog hearsay is recorded only in the contradiction ledger as the *claim being refuted*, never as evidence. | read from disk this session |
| Report path per CONTEXT-13 | Exactly one report: this file. Captures only under `docs/research/_sources/` with prefix `2026-09-05-apis-`. No other file modified. | see §Artifact index |

**Status banner:** floors met on this session's own counts (≥20 authoritative independent works, ≥5 academic `[FULL]`) — see §Source register counts. Two things did NOT meet the bar and are named here first: (1) Apple developer pages (`MPNowPlayingInfoCenter`, `MPRemoteCommandCenter`, `ActivityKit`, `Core Haptics`) returned a JavaScript shell to both the raw capture and the fetch tool, so their capabilities are recorded as `[PARTIAL]`/`INACCESSIBLE` and carry **no** numbers in this report; (2) the CarPlay audio-app page `https://developer.apple.com/documentation/carplay/supporting-carplay-in-your-audio-app` returned HTTP **404** (capture S56) — access failure, not non-existence.

# Scope plan / decision served / why / project context

- **Decision served (CONTEXT-01):** which platform APIs, rendering technologies and SDKs can deliver "ultra" visual quality and a frontier player experience on (1) web — Next.js app + static one-prompt page, (2) Flutter phone (Android+iOS), (3) Flutter tablet — with exact capabilities, versions, limits, performance characteristics, licences, deprecations and failure modes, so the parent can choose the technical substrate of three design directions and the rebuild.
- **Owner order, verbatim (Berk, 2026-09-05 15:49):** "EMRİM ŞUDUR DÜNYADA BUGÜNE KADAR YAPILAMAMIŞ EN İLERİ SEVİYEDE uı ux VE KULLANICI DENEYİMİ İSTİYORUM WEN, MOBİL APP VE TABLET APP LERDE … görsel kalite ultra olmalı."
- **Project (CONTEXT-03):** PlayMusicPrompts. Web = Next.js App Router under `deploy\payload` (`package.json` read this session: `next 16.3.3`, `react 19.2.8`, `tailwindcss ^4`, `playwright ^1.62.1`) + static one-prompt page `deploy\payload\public\create\index.html` built by `scripts\build_create_page.py`. Flutter app under `app\` (`pubspec.yaml` read this session: `sdk ^3.12.0`, `just_audio ^0.10.6`, `share_plus ^13.3.0`, `flutter_appauth ^12.1.0`, `flutter_secure_storage ^11.0.0`, `interactive_media_ads ^0.3.0`, `google_mobile_ads ^9.1.0`, `http ^1.6.0`, `shared_preferences ^2.5.5`, Manrope variable font). Owner algorithm: 3-take playlist, buffer ≥2, generation at track start/T−90 s, skip → next prepared; ONE listening queue; IMA audio breaks between tracks + banner; NO rewarded.
- **Why downstream (CONTEXT-04):** a wrong capability claim = a design direction that cannot be built. Hence every capability below carries version + date + deprecation state.
- **Geography:** GLOBAL. **Temporal scope:** newest official first (2026 releases), foundational academic work retained where still controlling (touch-latency perception 2012–2017).
- **Verticals (from project vision):** web player/creator surface; phone player; tablet player — the three surfaces named in the owner order.
- **Planned artifact tree:** 1 report (this file) + N source captures under `_sources/` (planned ≥75, produced 75 in batch 1 + batch 2 count reported in §Artifact index).
- **Hard-law check:** rules/23 (official docs only) → pass, non-official pages appear only as refuted claims; rules/10 → 7/7 angles; Law Zero → `[UNVERIFIED]` marks present where a page was unreadable; ads SDK re-research excluded per CONTEXT-18.
- **Completion semantics:** complete enough when every angle has (a) the current official version/date, (b) explicit limits, (c) deprecation state, (d) a PMP application line; explicit blind spots listed in §Contradictions/gaps.

# Outcome first

1. **Flutter renderer state (official, 2026-09-05):** Impeller is the *only* renderer on iOS; default on Android API 29+ with fallback to the legacy renderer below API 29 / non-Vulkan and an opt-out flag *still documented*; default on macOS/Windows/Linux since 3.47 (2026-08-12); web still Skia (CanvasKit). The widely-circulated blog claim "Flutter 3.44 removed Skia from Android 10+" is **contradicted** by the official 3.44 post and the Impeller doc — Skia removal on Android is the 2026 *roadmap intent*, not shipped as of 3.47 [S28][S29][S30][S31].
2. **Fragment shaders are the frontier visual primitive on Flutter:** `FragmentProgram` (GLSL 100–460, no vertex shaders, no UBO/SSBO, `sampler2D` only, no bool/uint), `ImageFilter.shader` **Impeller-only**, 3.44 added uniform binding by name + Skia-incompatibility warnings [S27][S29]. No official WebGPU/compute path exists in Flutter; the engine lead closed the request ("no plans") [S-issue-159941, GitHub issue read this session].
3. **just_audio 0.10.6 (pub 2026-06-29) DOES expose visualiser feeds** — experimental Waveform (Android, iOS) and FFT (Android, iOS, macOS) streams per its own README table, tied to issue #97 (still Open); **not on web**. This corrects the brief's assumption "just_audio lacks PCM tap" [S33][S71].
4. **Web GPU substrate:** WebGPU is a W3C Candidate Recommendation Draft (2026); shipping default in Chrome/Edge ≥113 (desktop), Chrome ≥121 on Android 12+ (ARM/Qualcomm/Intel), Firefox 141 (Windows) / 145 (macOS 26), Safari 26 (macOS/iOS/iPadOS 26). Firefox Linux/Android still Nightly/flag [S01][S02][S03][S04]. WebGL2 remains the universal fallback; three.js r185.1 ships a WebGPU renderer [S14][S15].
5. **Web audio analysis substrate:** Web Audio API 1.1 — `AnalyserNode` for visualisers, `AudioWorklet` for real-time features on the audio thread (128-frame render quantum), `ScriptProcessorNode` DEPRECATED [S05][S06][S07]. Academic evidence: buffer-based WASM/C++ AudioWorklets are the safest performance bet; JS is competitive if GC is avoided [A06].
6. **Perceptual budgets (academic, `[FULL]`):** touch-drag latency JND ≈ 11 ms direct / 33 ms mean; tap JND ≈ 64–82 ms; users detect a single 60 Hz frame (16.7 ms) improvement [A01][A02][A03]. Audio-visual asynchrony JND 25–50 ms for beeps/flashes, 75–258 ms for complex stimuli [A04]. → visualiser pipeline budget ≤ 40 ms end-to-end; player controls ≤ 1 frame response.
7. **Web performance gates (official):** INP good ≤ 200 ms, poor > 500 ms [S62]; LoAF reports frames ≥ 50 ms [S63]; Lighthouse current release line v13.4.1 [S64].
8. **Licences (official pages):** GSAP 3.15.0 — Webflow "Standard 'No Charge'" licence (effective 2025-04-30), commercial use free, formerly-paid plugins included; prohibited use = no-code animation builders competing with Webflow [S17][S18]. three.js, @react-three/fiber, motion, @rive-app/canvas, lottie-web, tone, butterchurn = MIT; wavesurfer.js = BSD-3-Clause [S15–S25].

# Framing and falsifiers

- Falsifier 1: if Flutter 3.50 (Nov 2026) removes Skia on Android 10+, the Impeller row becomes "sole renderer on Android ≥10" — watch `docs.flutter.dev/perf/impeller` and the 3.50 post.
- Falsifier 2: if WebGPU ships in Firefox stable on Android/Linux, the "WebGL2 fallback mandatory" claim weakens; watch the gpuweb Implementation-Status wiki.
- Falsifier 3: if just_audio moves the visualiser API out of "Experimental" or drops it, the phone/tablet audio-feature plan changes; watch issue #97.

# Inclusion, exclusion, geography, dates, languages, constraints

Included: W3C/WHATWG/Khronos specs, vendor docs (Google/Flutter/Chrome/Android, Apple, Mozilla, Microsoft), registries (npm, pub.dev), official repos/issues, peer-reviewed/academic primaries. Excluded as evidence: blogs, tutorials, newsletters (used only as the *refuted claim* in the contradiction ledger). Ads SDKs excluded per CONTEXT-18 (contract exists at `docs\external-api\google-ima\`). Language: English sources; two captured Google pages served localised (pt-BR for LoAF, ru for Macrobenchmark) — the quoted facts were read in those languages and translated by me; marked accordingly. Geography GLOBAL.

# Methodology and exact query/action log

| # | Time (UTC+3) | Action | System | Result / fate |
| --- | --- | --- | --- | --- |
| Q01 | 16:08 | Broad scoping search: "frontier music player UI rendering technologies 2026 WebGPU Flutter Impeller fragment shaders audio visualizer web mobile tablet" | web search | 5 hits; harvested vocabulary: "Impeller default", "Skia removal", "flutter_gpu", "nitro_webgpu", flutter/flutter#159941 (official issue, kept), 2 blogs (excluded as evidence) |
| Q02 | 16:08 | "docs.flutter.dev Impeller rendering engine Android iOS web default status 2026 Skia deprecated" | web search | official: flutter.dev 2026 roadmap, engine impeller FAQ; 3 blogs excluded |
| Q03 | 16:08 | "W3C WebGPU specification Candidate Recommendation 2026 status browser support Safari Firefox Chrome" | web search | W3C TR, w3c/transitions#676, Chrome overview, web.dev, gpuweb wiki — all official |
| Q04 | 16:08 | "docs.flutter.dev Writing and using fragment shaders FragmentProgram GLSL limitations" | web search | official doc found; 3 tutorials excluded |
| Q05 | 16:08 | "Web Audio API 1.1 W3C specification AudioWorklet AnalyserNode 2026" | web search | W3C TR + editor draft + MDN |
| Q06 | 16:08 | "Flutter release notes stable 2026 What's new docs.flutter.dev release archive" | web search | SDK archive (2026 schedule), 3.41/3.44/3.47 posts, release-notes index |
| Q07 | 16:10 | Raw capture batch 1 (75 URLs) via `capture-2026-09-05-apis.cjs`, concurrency 6 | Node fetch | 74 × HTTP 200, 1 × 404 (S56) |
| Q08 | 16:10 | Fetch+read: Flutter 3.44 post, Impeller doc, fragment-shaders doc, GSAP licence, pub.dev just_audio | fetch tool | all read `[FULL]` |
| Q09 | 16:12 | Academic: "arxiv perceived latency threshold touch interaction user detection milliseconds study" | web search | 5 PDFs (Deber CHI'15, Cattan CHI'17, Annett GI'14, Jota CHI'13, Ng UIST'12) full text saved |
| Q10 | 16:12 | Academic: "arxiv audio-visual synchrony perception threshold music visualization latency real-time GPU study" | web search | Frontiers VR 2025 (Erdmann), IJICT 2025, PEAVS arXiv 2404.07336 |
| Q11 | 16:12 | Academic: "arxiv mobile GPU fragment shader power consumption energy rendering frame rate smartphone measurement" | web search | UH 2012 preprint, UPC theses (Anglada; Arnau) |
| Q12 | 16:12 | Academic: "arxiv Flutter rendering performance frame time jank measurement cross-platform framework empirical study" | web search | 0 academic hits (5 blogs) → recorded as NOT FOUND IN THE SEARCHED SCOPE |
| Q13 | 16:12 | Academic: "Web Audio Conference paper AudioWorklet real-time feature extraction FFT performance latency browser measurement" | web search | WAC 2024 Faust spectral, WAC 2022 AudioWorklets comparison, TISMIR Essentia.js, WAC 2025 latency-test repo |
| Q14 | 16:14 | Raw capture batch 2 (22 URLs: academic PDFs + extra official) | Node fetch | see §Artifact index |
| Q15 | 16:14 | Fetch: ActivityKit doc, Flutter web renderers, M3 motion overview | fetch tool | ActivityKit = JS shell (INACCESSIBLE); web-renderers page = generic overview (no renderer table on that URL); M3 motion read |
| Q16 | 16:15 | Regex extraction over saved captures (INP, LoAF, fftSize, VibrationEffect primitives, predictive back, spec statuses, npm/pub versions) | node | recorded in §Findings |

Marginal yield: round 1 (scoping) established vocabulary + 3 contradictions; round 2 (official fetches) settled versions; round 3 (academic) reached 5 `[FULL]`; round 4 (extraction) added 0 new sources → saturation for the 60-minute slice, not for the topic.

# Findings by angle — per-API table

Column key: **API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs**. Read-status: `[FULL]` = the relevant official page/spec section read in full this session; `[PARTIAL]` = capture saved but only partly readable; `INACCESSIBLE` = JS shell / 404.

## F1 — WEB rendering & motion (CONTEXT-02 angle 1)

| API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WebGPU (W3C) | Candidate Recommendation Draft; W3C Process 2025-08-18; group moving to "Living Recommendation" mode (transition issue #676) | Chrome/Edge ≥113 desktop (Win D3D12, macOS, ChromeOS); Chrome ≥121 Android 12+ ARM/Qualcomm/Intel, Imagination Android 16+ at 139, Samsung Xclipse "probably 154"; Linux Intel Gen12+ 144, NVIDIA Wayland 147; Windows ARM64 behind flag. Firefox 141 Windows, 145 macOS 26+, 147 all macOS; Linux/Android Nightly/flag (Mozilla "expects 2026"). Safari/WebKit 26 (macOS/iOS/iPadOS/visionOS 26) | GPU render + compute, WGSL, modern-API mapping (Metal/Vulkan/D3D12) | No implementation report yet; CTS used for interop; Firefox mobile absent in stable | GPU-bound; offloads main thread | W3C royalty-free (patent policy) | EXPERIMENTAL-to-shipping; **not universal** (Firefox Android/Linux) → WebGL2 fallback mandatory for PMP | S01 `[FULL]` (status section), S02 `[FULL]`, S03 `[FULL]`, S04 `[FULL]` |
| WebGL2 | (not separately fetched this session) | universal modern browsers per S03/S04 context | fallback rasteriser for three.js | — | — | Khronos RF | stable; superseded-in-intent by WebGPU, not deprecated | `[UNVERIFIED]` — inferred from S03/S04 fallback language; parent to re-verify |
| three.js | r185.1 (npm `three@0.185.1`) | web | WebGPU renderer + WebGL renderer, post-processing, shaders | version cadence monthly; API churn between releases | scene-dependent | MIT | active | S14 `[PARTIAL]` (release list), S15 `[FULL]` |
| @react-three/fiber | 9.7.0 | React 19 web | React reconciler for three.js | React 19 peer | overhead of reconciler | MIT | active | S16 `[FULL]` |
| GSAP | 3.15.0 | web | timeline/tween animation, plugins (SplitText, MorphSVG now included) | **Prohibited use:** no-code visual animation builders competing with Webflow; licence amendable by Webflow, continued use = acceptance | main-thread JS | Webflow "Standard 'No Charge' GSAP License", effective 2025-04-30, last modified 2025-05-30; commercial free | active | S17 `[FULL]`, S18 `[FULL]` |
| Motion (`motion` / `framer-motion`) | 13.2.0 both | web (React + vanilla) | declarative animation, layout animations | — | — | MIT | active; `framer-motion` name kept as alias | S19 `[FULL]`, S20 `[FULL]` |
| Rive web runtime | `@rive-app/canvas` 2.42.0 | web | state-machine vector animation, canvas/WebGL renderers | WebGL context limits noted in Rive Flutter docs | GPU or canvas | MIT | active | S21 `[FULL]`, S74 `[PARTIAL]` |
| Lottie | `lottie-web` 5.13.0 | web | After-Effects JSON playback (svg/canvas/html) | — | CPU-heavy for complex vectors | MIT | active | S22 `[FULL]` |
| wavesurfer.js | 7.12.11 | web | waveform rendering + playback | — | — | BSD-3-Clause | active | S23 `[FULL]` |
| tone.js | 15.1.22 | web | Web Audio scheduling/synthesis framework | — | — | MIT | active | S24 `[FULL]` |
| butterchurn | 2.6.7 | web | Milkdrop-preset WebGL visualiser | WebGL-based | GPU | MIT | active (last version metadata only) | S25 `[FULL]` |
| Web Animations API | W3C Working Draft 2023-06-05 (latest TR) | all major browsers (per MDN, not fetched) | compositor-friendly element animation | WD status | compositor thread | W3C RF | stable WD | S08 `[FULL]` (status) |
| CSS View Transitions L2 | Editor's Draft 2026-08-31 | Chromium shipping, others per caniuse (not fetched) | cross-document/same-document transitions | ED | compositor | W3C RF | EXPERIMENTAL (ED) | S09 `[FULL]` (status) |
| Scroll-driven Animations L1 | Editor's Draft 2026-05-14 | — | `animation-timeline: scroll()/view()` | ED | compositor | W3C RF | EXPERIMENTAL (ED) | S10 `[FULL]` (status) |
| CSS Painting API (Houdini) L1 | Editor's Draft 2026-02-25 | — | `paint()` worklets | ED; Safari/Firefox support `[UNVERIFIED]` | worklet thread | W3C RF | EXPERIMENTAL | S11 `[FULL]` (status) |
| WebCodecs | W3C Working Draft 2026-08-27 | — | low-level encode/decode of audio/video frames | WD | — | W3C RF | WD | S12 `[FULL]` (status) |
| OffscreenCanvas | MDN page captured | — | canvas rendering in workers | — | frees main thread | — | stable | S13 `[PARTIAL]` |
| Next.js | 16.3.4 latest on npm (project pins 16.3.3) | web | App Router, RSC streaming, **Cache Components** (`cacheComponents: true` in `next.config.ts`) — the current caching model; docs route "partial-prerendering" resolves to Cache Components guide | project one patch behind | — | MIT | PPR page redirected → Cache Components is the current name | S26 `[FULL]`, S73 `[PARTIAL]` |

## F2 — FLUTTER rendering, shaders, animation, audio feeds, adaptive (angle 2)

| API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Flutter SDK | stable 3.47.0 (2026-08-12); 2026 cadence 3.41 Feb / 3.44 May 18 / 3.47 Aug / 3.50 Nov (branch cutoff 2026-10-06) | all | — | project's installed SDK 3.44.6 (parent's measurement) is one stable behind | — | BSD-3 | — | S30 `[FULL]`, S32 `[FULL]`, S29 `[FULL]` |
| Impeller | default iOS (sole renderer, no Skia switch); default Android API 29+, **legacy renderer fallback** below API 29/non-Vulkan, opt-out `io.flutter.embedding.android.EnableImpeller=false` still documented; default macOS/Windows/Linux since 3.47 (opt-out "will be removed in a future release"); **web = Skia** ("might use Impeller in the future") | iOS, Android, desktop | AOT-compiled shaders, no runtime shader jank, Metal/Vulkan/GLES backends, SDF text on desktop (3.47) | web excluded; Android <29 fallback | predictable frame times (official objective) | BSD-3 | Skia removal on Android 10+ = **2026 roadmap intent** (S31), not shipped in 3.44/3.47 official posts | S28 `[FULL]`, S29 `[FULL]`, S30 `[FULL]`, S31 `[FULL]` |
| `FragmentProgram` / `FragmentShader` | doc current at 3.47; 3.44 added `getUniformFloat('name')` binding by name and compiler warnings for Skia-incompatible shaders | Skia + Impeller backends | GLSL 100–460 `.frag` via `pubspec.yaml: flutter: shaders:`; `Paint.shader`; `ImageFilter.shader` (**Impeller-only**) for `BackdropFilter`/`ImageFiltered`; `FlutterFragCoord()`; hot-reload recompiles | no vertex shaders; no UBO/SSBO; only `sampler2D`; two-arg `texture()` only; no extra varyings; precision hints ignored on Skia; no uint/bool; `TileMode.clamp` only; premultiplied 0–1 colour; GLES y-flip for engine textures | Skia: runtime compile → precache before animation; reuse `FragmentShader` across frames | BSD-3 | active, growing | S27 `[FULL]`, S29 `[FULL]` |
| WebGPU/compute in Flutter | — | — | **none official**; flutter/flutter#159941 closed 2024-12-08 by engine lead: "We have no plans to incorporate Dawn into the flutter engine nor to expose WebGPU as an API in Flutter." | third-party `nitro_webgpu`/`flutter_gpu` only | — | — | not on roadmap | issue #159941 `[FULL]` (read this session), S42 `[FULL]` (`flutter_gpu` pub 0.0.1, 2023-07-26 — placeholder package) |
| `CustomPainter` | (framework) | all | canvas drawing on raster thread | — | DevTools frame chart splits UI vs raster; jank = frame over budget | BSD-3 | stable | S65 `[PARTIAL]` |
| Rive Flutter | `rive` 0.14.11 (2026-08-03) | Flutter | `Factory.rive` (Rive Renderer) or `Factory.flutter` (Skia/Impeller); shared render texture for many graphics; avoids WebGL context limits on web | some features require Rive Renderer | — | MIT (pub) | active | S37 `[FULL]`, S74 `[PARTIAL]` |
| lottie (Flutter) | 3.5.1 (2026-07-08), sdk ^3.12 | Flutter | Lottie JSON playback | — | CPU | — | active | S38 `[FULL]` |
| flutter_animate | 4.5.2 (2024-11-25) | Flutter | declarative effects chains | last publish 21 months ago → maintenance risk | — | — | STALE risk | S39 `[FULL]` |
| just_audio | 0.10.6 (2026-06-29), sdk ^3.6 | Android, iOS, macOS, web (+Windows/Linux via federated) | gapless playlists, HLS/DASH, headers, clipping, speed/pitch; **Experimental: Waveform visualizer (Android, iOS), FFT visualizer (Android, iOS, macOS)** — see #97 (Open, opened 2020-05-27) | visualiser **not on web**; experimental status; gapless not on web | — | Apache-2.0 / MIT | active | S33 `[FULL]`, S71 `[PARTIAL]` |
| audio_session | 0.2.4 (2026-06-29) | Android, iOS, macOS, web | audio focus/interruptions | — | — | — | active | S36 `[FULL]` |
| audio_service | 0.18.19 (2026-06-29) | Android, iOS, macOS, web | background audio, media notifications, lock-screen controls | — | — | — | active | S34 `[FULL]` |
| just_audio_background | 0.0.1-beta.17 (2025-05-13) | — | thin wrapper over audio_service | beta, 16 months old | — | — | BETA/STALE | S35 `[FULL]` |
| audio_waveforms | 2.0.2 (2026-01-09) | Android, iOS | recorder/player waveforms | no macOS/web | — | — | active | S40 `[FULL]` |
| flutter_audio_capture | 1.1.12 (2025-12-28) | Android, iOS, Linux | mic PCM capture (not player tap) | not a playback tap | — | — | active | S41 `[FULL]` |
| Adaptive/foldables | docs current | all | `SafeArea`/`MediaQuery`, large screens & foldables guidance, `NavigationRail` | — | — | — | active | S67 `[PARTIAL]` |
| Predictive back | Android 14+ default for system gestures; Flutter built-in for default page routes; opt-in `android:enableOnBackInvokedCallback="true"` on Android 13+; `PopScope` for custom | Android | predictive back animations | Android only | — | — | active | S68 `[FULL]` |
| Material 3 motion | m3.material.io motion overview read | — | motion system tokens | Flutter mapping not fetched | — | — | active | S69 `[PARTIAL]` (fetched text file 4a8090a3) |

## F3 — OS media integration (angle 3)

| API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Android Media3 `MediaSession` / `MediaSessionService` / `MediaLibraryService` | current developer.android.com pages | Android | playback control surface; `MediaSessionService` auto-publishes MediaStyle notification; Android 13+ derives action buttons from Player state | — | — | Apache-2.0 | current (Media3 supersedes support-lib MediaSession) | S51 `[PARTIAL]`, S52 `[FULL]` (quoted), S75 `[PARTIAL]` |
| Android Auto / AAOS | current | Android | requires `MediaBrowserService` or `MediaLibraryService` + `MediaSession` | — | — | — | current | S57 `[PARTIAL]` |
| Apple `MPNowPlayingInfoCenter` / `MPRemoteCommandCenter` | — | iOS | Now Playing + remote commands | — | — | — | — | S53, S54 **INACCESSIBLE** (JS shell) — capabilities `[UNVERIFIED]` this session |
| Apple ActivityKit / Live Activities / Dynamic Island | — | iOS | — | payload/duration limits **not read** this session | — | — | — | S55 **INACCESSIBLE** (JS shell) — `[UNVERIFIED]`; parent must fetch the Markdown variant Apple advertises ("A Markdown version of the page content is available") |
| Apple CarPlay audio app | — | iOS | — | — | — | — | — | S56 **HTTP 404** — access failure recorded; not evidence of non-existence |
| Background audio (Flutter) | audio_service 0.18.19 / just_audio_background beta.17 | Android/iOS/macOS/web | see F2 | — | — | — | — | S34, S35 |

## F4 — Fonts / colour (angle 4)

| API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CSS Color 4 | W3C Candidate Recommendation Draft **2026-09-01** | web | `color(display-p3 …)`, oklch etc. | CRD | — | W3C RF | current | S58 `[FULL]` (status) |
| Variable fonts (CSS) | MDN guide captured | web | `font-variation-settings`, weight axes (PMP already ships Manrope variable) | — | one file vs many | — | stable | S59 `[PARTIAL]` |
| Flutter wide gamut | flutter/flutter#127855 "Implement wide gamut color support in the Framework" — **Closed**; body: wide-gamut support in iOS engine after #55092 and Android after #127852; asks for `Color.displayP3(...)` API | iOS, Android | framework-level P3 colours | Impeller status per platform beyond the issue body `[UNVERIFIED]` | — | — | closed issue (implemented state inferred, `[single-source official]`) | S70 `[PARTIAL]` |

## F5 — Haptics (angle 5)

| API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Android `VibrationEffect.Composition` | current reference | Android | primitives read from the page: `PRIMITIVE_CLICK`, `PRIMITIVE_LOW_TICK`, `PRIMITIVE_QUICK_FALL`, `PRIMITIVE_QUICK_RISE`, `PRIMITIVE_SLOW_RISE`, `PRIMITIVE_SPIN`, `PRIMITIVE_THUD`, `PRIMITIVE_TICK`; `addPrimitive(id, scale, delayMs)` | device support varies (`areAllPrimitivesSupported` not verified this session) | — | Apache-2.0 | current | S61 `[FULL]` (primitives list) |
| Apple Core Haptics | — | iOS | — | — | — | — | — | S60 **INACCESSIBLE** (JS shell) `[UNVERIFIED]` |
| Flutter `HapticFeedback` / `haptic_feedback` plugin | plugin 0.6.5 (2026-07-10), Android+iOS | Flutter | standard haptic types | composition primitives not exposed by the core `HapticFeedback` class (`[UNVERIFIED]`; api.flutter.dev page in batch 2) | — | — | active | S50 `[FULL]`, S83 (batch 2) |

## F6 — Performance measurement (angle 6)

| API/tech | version/date | platforms | capability | limits | perf cost | licence | deprecation state | source IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INP (web.dev) | current | web | good ≤ 200 ms; needs improvement 200–500 ms; poor > 500 ms (p75) | field metric | — | CC-BY | current Core Web Vital | S62 `[FULL]` |
| Long Animation Frames API | current (page served pt-BR) | Chromium | reports frames ≥ 50 ms incl. render-less frames with `renderStart 0`; "LoAF of INP" diagnosis | Chromium only | — | — | current | S63 `[FULL]` |
| Lighthouse | releases list: v13.4.1 latest, v13.4.0, v13.3.0, v13.2.0, v13.1.0, v13.0.x | web | lab audits | — | — | Apache-2.0 | 13.x current (brief said "12/13") | S64 `[FULL]` |
| Flutter DevTools Performance view | current | Flutter | frames chart UI/Raster, jank, shader compilation, frame analysis, timeline, track builds/layouts/paints | profile mode on real device required | — | BSD-3 | current | S65 `[PARTIAL]` |
| Android Macrobenchmark | current (page served ru) | Android | `StartupTimingMetric`, `FrameTimingMetric`, UI Automator driving | — | — | Apache-2.0 | current | S66 `[PARTIAL]` |
| Battery/GPU guidance | — | — | academic evidence only (A11 and theses): fragment shading + texture memory traffic dominate mobile GPU energy | — | — | — | — | A11 `[PARTIAL]`, theses `[ABS]` |

## F7 — Existing PMP dependencies verified on registries (angle 7)

| Package | pinned in project | latest (registry, this session) | published | status |
| --- | --- | --- | --- | --- |
| next | 16.3.3 | 16.3.4 | — | one patch behind |
| react / react-dom | 19.2.8 | not fetched | — | `[UNVERIFIED]` |
| just_audio | ^0.10.6 | 0.10.6 | 2026-06-29 | current |
| google_mobile_ads | ^9.1.0 | 9.1.0 | 2026-08-11 | current (ads not re-researched, CONTEXT-18) |
| interactive_media_ads | ^0.3.0 | 0.3.0+17 | 2026-08-28 | current |
| share_plus | ^13.3.0 | 13.3.0 | 2026-07-23 | current |
| flutter_appauth | ^12.1.0 | 12.1.0 | 2026-08-29 | current |
| flutter_secure_storage | ^11.0.0 | 11.0.0 | 2026-08-06 | current |
| http | ^1.6.0 | 1.6.0 | 2025-11-10 | current |
| shared_preferences | ^2.5.5 | 2.5.5 | 2026-03-25 | current |

Sources: S26, S33, S43–S49 `[FULL]` (registry JSON read by script this session).

# Five-part academic records (counted toward the ≥5 `[FULL]` floor)

**A01 — Deber, Jota, Forlines, Wigdor. "How Much Faster is Fast Enough? User Perception of Latency & Latency Improvements in Direct and Indirect Touch." CHI 2015. `[FULL]` (PDF full text read this session).**
1. *Problem (authors' framing):* prior work disagrees on the minimum perceivable latency (2–100 ms) because form-factor (direct vs indirect) and task (tap vs drag) were confounded; designers lack guidance on whether *incremental* latency improvements are perceivable.
2. *Method:* JND via adaptive staircase (step 7.86 ms, "queue length 8" on a high-performance touch prototype validated with oscilloscope + photosensor); Exp.1: 12 sessions × 2 tasks × 2 form-factors × 2 reps = 96 staircases, 8,556 latency-pair comparisons, 14 participants (mean age 28, sd 5.4); repeated-measures ANOVA on JND. Exp.2: percent-correct on base-latency × improvement grid.
3. *Numbers:* mean JND 33 ms dragging vs 82 ms tapping (F1,22 = 55.79, p < .001); 40 ms direct vs 75 ms indirect (F1,22 = 48.43, p < .001); dragging JND 11 ms direct vs 55 ms indirect (F1,11 = 77.11). Exp.2: participants identified the lower-latency drag correctly far above chance; tapping 68.2 % correct overall; direct 69.3 % vs indirect 67.1 % (n.s., p = .17); "removal of just a single 60 Hz frame (16.7 ms) … perceptibly noticeable under many circumstances" (Tables 1–2, 95 % CI 5–21 %).
4. *Limitations (authors):* lab prototype, university sample, JND at 75 % criterion; *analyst:* projector-based output, not commodity phone panels; no audio component.
5. *Application to PMP:* scrubbing/seek drag on the player must render within ~1 frame (≤ 16.7 ms) of touch; tap-to-play feedback within ≤ 64–82 ms; a 120 Hz Impeller path is perceptually justified for drag surfaces (waveform scrub, volume/tempo sliders).

**A02 — Jota, Ng, Dietz, Wigdor. "How fast is fast enough? A study of the effects of latency in direct-touch pointing tasks." CHI 2013. `[FULL]`.**
1. *Problem:* commercial touchscreens show 50–125 ms latency; effect on pointing *performance* and its perception unknown.
2. *Method:* Fitts-law pointing on an FPGA high-performance-touch prototype at 1/10/25/50 ms latency; 45 participants (Exp.1); movement phases analysed; Exp.2 JND staircases for land-on feedback.
3. *Numbers:* significant latency × width effect on error rate (F6,264 = 2.581, p = .019); Fitts fits per latency (F2,88 = 79–158); no significant difference between 1 ms and 10 ms, significant between 10 ms and 25/50 ms; Exp.2 land-on JND range 20–100 ms, mean 64 ms (sd 24).
4. *Limitations:* single hardware, pointing-only; *analyst:* 2013 panels.
5. *Application:* a ≤ 10 ms internal latency floor buys nothing perceptible for taps; spend engineering on ≤ 25 ms for drag and on consistency (no dropped frames) instead.

**A03 — Ng, Lepinski, Wigdor, Sanders, Dietz. "Designing for low-latency direct-touch input." UIST 2012. `[FULL]`.**
1. *Problem:* what is the lowest latency users can discriminate when dragging.
2. *Method:* 1 ms reference vs probe staircase; 10 participants (3 female, ages 24–40, mean 27.8, sd 4.73); JND at 75 % criterion; H1 "< 20 ms discernible".
3. *Numbers:* participants discriminate latencies far below current hardware (~50–200 ms); the paper's headline JND (≈ 2.38 ms, quoted in A02 as "as little as 2.38 ms") is the dragging floor.
4. *Limitations:* small N; drag only; likely detecting finger–object spatial gap rather than time (A02's own critique).
5. *Application:* for any "finger-follows" element (scrubber, draggable sheet) render position must be extrapolated/predicted, not merely fast.

**A04 — Erdmann, von Berg, Steffens. "Development and evaluation of a mixed reality music visualization for a live performance based on music information retrieval." Frontiers in Virtual Reality 2025, doi 10.3389/frvir.2025.1552321, CC-BY. `[FULL]`.**
1. *Problem:* XR music visualisation research documents systems but rarely measures human perception; whether MIR-driven visuals (loudness→size, dissonance→sharpness, pitch→vertical, DL mood→colour) improve audiovisual congruence and aesthetic experience.
2. *Method:* within-subjects, 62 participants (18–62, mean 32.8, sd 9.8; 44 % female); same guitar piece performed live twice with MIR-driven (MIR-V) vs random (Rand-V) visuals in an HMD; SuperCollider → real-time analysis → OSC → Unity render; AESTHEMOS 21 subscales, Gold-MSI; EFA on congruence items (KMO 0.68); Wilcoxon signed-rank; mixed-effects models.
3. *Numbers:* synchrony rated higher for MIR-V (Z = −4.36, p < .001, r = 0.66); colour congruence higher (Z = −2.72, p < .01, r = 0.42); one aesthetic factor n.s. (Z = −0.60, p = .597) → H3 partly confirmed. Cited perceptual budgets: DMI latency quality best 0–10 ms (Jack et al. 2018); AV asynchrony JND 75–258 ms for complex stimuli (Vroomen & Keetels 2010), 25–50 ms for beeps/flashes.
4. *Limitations (authors):* single piece, single musician, small visual vocabulary, HMD context; *analyst:* live-performance not playback; no latency measurement of their own pipeline.
5. *Application:* PMP visualiser must be *feature-driven* (loudness/onset/pitch/spectral) not random; end-to-end audio→pixel budget ≤ 40 ms keeps transient-linked visuals (beat pulses) under the 25–50 ms JND; slow mood/colour mappings tolerate 75+ ms.

**A05 — "Comparing approaches for new AudioWorklets." Web Audio Conference 2022, zenodo 10.5281/zenodo.6767468. `[FULL]`.**
1. *Problem:* is WebAssembly worth it over JavaScript for *new* AudioWorklets (not ports)?
2. *Method:* sine oscillator and low-pass filter worklets in pure JS, Emscripten C++ (per-sample and buffer-based), AssemblyScript; instantiate worklets progressively until reference oscillator distorts; steps of 50 worklets; M1 Pro 2021, Firefox 99 and Chrome 100; O3 builds.
3. *Numbers:* Figure 7 maximum worklet counts per approach/browser (values in figure, not in extracted text — recorded as "figure-only"); qualitative results: buffer-based always faster than per-sample; pure JS competitive (esp. Firefox) if GC avoided; Emscripten/C++ buffer-based "safest bet".
4. *Limitations:* single machine, two browsers, synthetic workloads; *analyst:* 2022 engines.
5. *Application:* PMP web feature-extractor = buffer-based WASM (C++/Rust) AudioWorklet with ring buffer to main thread; JS fallback acceptable if allocation-free.

**A06 — Correya, Alonso-Jiménez, Marcos-Fernández, Serra, Bogdanov. "Audio and Music Analysis on the Web using Essentia.js." TISMIR, doi 10.5334/tismir.111. `[FULL]`.**
1. *Problem:* no extensive, easy reference library for audio feature extraction on web clients.
2. *Method:* Essentia C++ compiled via Emscripten to Wasm; >200 algorithms bound; TypeScript high-level API; AudioWorklet integration; real-time feasibility estimated as per-frame compute time < frame duration on worst-case platform.
3. *Numbers:* >200 algorithms; Table 1 compares Meyda, JS-Xtract etc.; real-time apt if per-frame time < frame duration (their criterion).
4. *Limitations:* AGPLv3 licence; Wasm build size; not all algorithms real-time.
5. *Application:* **AVOID** Essentia.js in PMP's proprietary web bundle unless AGPL obligations are accepted (owner decision); use Web Audio `AnalyserNode` + own WASM DSP instead.

Additional academic reads: A07 Faust spectral AudioWorklet (WAC 2024) `[FULL]` — 128-sample process blocks, ring buffers to avoid copies; A08 PEAVS arXiv 2404.07336 `[PARTIAL]` — cites ITU AV-sync detection window −125 ms … +45 ms; A09 Cattan CHI'17 `[PARTIAL]` — latency effect from 25 ms, training reduces gap 54 %; A10 Annett GI'14 `[PARTIAL]` — inking JND ~50 ms, 97 ms without visual referent; A11 UH 2012 mobile games power `[PARTIAL]` — fragment shading dominates time/power vs pixel stage.

# Claim cross-verification and independence ledger

| claim_id | claim | type | A | B | C | independence | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Impeller default iOS (sole) & Android API 29+; fallback below 29; desktop default since 3.47 | PRIMARY FACT | S28 docs.flutter.dev | S30 3.47 blog | S29 3.44 blog | same producer (Google/Flutter), 3 documents; independent corroboration: Impeller FAQ (GitHub) | VERIFIED 3 docs (single producer — flagged) |
| C2 | Skia NOT yet removed on Android in 3.44/3.47 | PRIMARY FACT | S29 (no such statement) | S28 (opt-out still documented) | S31 (roadmap: "we are completing… by finally removing") | same producer | VERIFIED 3 docs; contradicts blogs |
| C3 | `ImageFilter.shader` Impeller-only; no vertex shaders; GLSL 100–460 | PRIMARY FACT | S27 | S29 (shader diagnostics) | api.flutter.dev (S84, batch 2, not read) | — | `[single-source official]` for the limits list (S27) |
| C4 | WebGPU shipping: Chrome 113/121, Firefox 141/145, Safari 26 | PRIMARY FACT | S02 gpuweb wiki | S03 Chrome | S04 web.dev (Google) + Firefox/Apple statements quoted within | S02 is multi-vendor maintained; S03/S04 same producer | VERIFIED 3 |
| C5 | WebGPU spec status = W3C CR Draft | PRIMARY FACT | S01 | w3c/transitions#676 | S02 | W3C + WG | VERIFIED 3 |
| C6 | just_audio 0.10.6 has experimental waveform+FFT visualiser (Android/iOS(/macOS)), not web | PRIMARY FACT | S33 pub README | S71 issue #97 | pub API JSON (S76 batch 2) | same author (ryanheise) | `[single-source official]` (one producer) |
| C7 | GSAP free for commercial use under Webflow Standard licence, effective 2025-04-30 | PRIMARY FACT | S17 gsap.com | S18 npm licence field | — | same producer | `[single-source official]` |
| C8 | INP good ≤ 200 ms / poor > 500 ms | PRIMARY FACT | S62 | S85 (batch 2, not read) | — | Google | `[single-source official]` |
| C9 | Touch drag latency JND ≈ 11 ms direct; tap JND 64–82 ms | SOURCE CLAIM | A01 | A02 | A03 | overlapping author group (Wigdor lab) → **one provenance family**; A10 Annett independent (Alberta) | VERIFIED 2 families + 1 |
| C10 | AV asynchrony JND 25–50 ms (simple) / 75–258 ms (complex) | SOURCE CLAIM | A04 (citing Vroomen & Keetels 2010) | A08 PEAVS (ITU −125/+45 ms) | IJICT 2025 (≈50 ms) `[ABS]` | independent | VERIFIED 3 (one `[ABS]`) |
| C11 | Buffer-based WASM AudioWorklets fastest; JS viable if GC-free | SOURCE CLAIM | A05 | A07 | A06 | independent groups | VERIFIED 3 |
| C12 | Flutter has no official WebGPU/compute API | PRIMARY FACT | issue #159941 (engine lead) | S42 flutter_gpu 0.0.1 placeholder | S28 (no mention) | same producer | `[single-source official]` |
| C13 | Registry versions (three 0.185.1, gsap 3.15.0, motion 13.2.0, next 16.3.4, rive 0.14.11, lottie 3.5.1, audio_service 0.18.19 …) | PRIMARY FACT | registry JSON read by script | — | — | registry is the unique authority | `[single-source official]`, dated 2026-09-05 |

# Contradictions, corrections, retractions, uncertainty, and gaps

| # | Contradiction | Resolution |
| --- | --- | --- |
| X1 | Medium/levelup blog: "Flutter 3.44 removed Skia from Android 10+, opt-out gone" vs official 3.44 post (Vulkan improvements only) + Impeller doc (opt-out still documented) + 2026 roadmap (future tense) | **Official wins.** Skia removal on Android = pending 2026 intent. Blog claim recorded as refuted; not evidence. |
| X2 | Blog "Flutter 4.0 / Impeller default on web via WebGPU" vs docs.flutter.dev "Flutter on the web currently uses Skia… might use Impeller in the future" | Official wins; no Flutter 4.0 exists in the SDK archive (2026 schedule ends at 3.50 Nov). |
| X3 | Parent brief: "just_audio lacks PCM tap — verify" vs pub.dev README experimental visualiser table | README wins: waveform/FFT streams exist (experimental, mobile only, issue #97 Open). Parent to re-verify API names in the package source before design. |
| X4 | Prior in-repo research (2026-08-17 slice) says stable 3.47.0 shipped 2026-08-12; parent says installed SDK 3.44.6 | Both consistent: latest stable 3.47.0; project SDK one stable behind — upgrade decision is Berk's. |
| X5 | Brief mentions "Lighthouse 12/13" | Release list shows 13.x current (v13.4.1). |
| X6 | Brief mentions Next.js "partial prerendering" | Docs route now resolves to "Cache Components" (`cacheComponents: true`); PPR naming superseded in docs. |
| G1 | Apple pages (MPNowPlayingInfoCenter, MPRemoteCommandCenter, ActivityKit, Core Haptics) unreadable (JS shell) | INACCESSIBLE this session; Apple advertises a Markdown variant — parent should fetch it. |
| G2 | CarPlay audio-app doc 404 | access failure; find current URL via search. |
| G3 | Academic study on Flutter frame-time performance | NOT FOUND IN THE SEARCHED SCOPE (Q12: 0 academic hits). |
| G4 | Material 3 expressive motion tokens → Flutter mapping | not read this session. |
| G5 | Impeller wide-gamut per-platform status | only issue #127855 body read; `[UNVERIFIED]` beyond it. |
| G6 | WebGL2 row | inferred, `[UNVERIFIED]`. |

# Synthesis — adopt / build / avoid (capabilities only; design is the owner's)

- **ADOPT (web):** Web Audio `AnalyserNode` + buffer-based WASM `AudioWorklet` feature extractor (C11); three.js r185 with WebGPU renderer **and** WebGL2 fallback (C4, C5); Motion 13 or GSAP 3.15 (licence acceptable, C7) for UI motion; INP ≤ 200 ms + LoAF instrumentation as the gate (C8).
- **ADOPT (Flutter):** Impeller as given (C1); `FragmentProgram` shaders for GPU visuals with `ImageFilter.shader` effects (Impeller-only, C3); just_audio experimental visualiser streams for phone/tablet feature feeds (C6, after API re-verification); audio_service 0.18.19 + Media3 MediaSessionService semantics for OS integration.
- **BUILD:** own DSP (onset/loudness/spectral) once, share the mapping vocabulary across web (WASM) and Flutter (Dart/FFI) so visuals are feature-driven (A04).
- **AVOID:** Essentia.js (AGPLv3) in the proprietary bundle unless Berk accepts AGPL; `flutter_animate` (stale since 2024-11) as a core dependency; `just_audio_background` beta as the sole background layer; any design that requires WebGPU on Firefox mobile; third-party WebGPU-in-Flutter plugins as a substrate (no official path, C12).

# Living-update watchlist

Flutter 3.50 post (Nov 2026) for Android Skia removal; gpuweb Implementation-Status wiki; ryanheise/just_audio#97; Webflow GSAP licence page (amendable); W3C css-color-4 CRD; Apple ActivityKit docs (re-fetch as Markdown).

# Source register and read-status counts

Columns: id | URL | HTTP | bytes | SHA-256 (capture, first 16 hex) | fetched (UTC) | read status. Read status is what I actually did this session: FULL = page/section read; PARTIAL = captured, partly read or regex-extracted; JSON = registry JSON parsed by script; INACCESSIBLE = JS shell or non-200.

| id | URL | HTTP | bytes | sha256 | fetched | read |
|---|---|---|---|---|---|---|
| S06-mdn-analysernode | https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode | 200 | 163143 | 5d2c06d14f3379bf… | 2026-09-05T13:10:44.871Z | PARTIAL |
| S07-mdn-audioworklet | https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet | 200 | 154167 | 77e5ab787fed8d0f… | 2026-09-05T13:10:45.061Z | PARTIAL |
| S05-w3c-webaudio-1-1 | https://www.w3.org/TR/webaudio-1.1/ | 200 | 2986767 | 2d584403703fe982… | 2026-09-05T13:10:44.870Z | FULL |
| S01-w3c-webgpu-spec | https://www.w3.org/TR/webgpu/ | 200 | 4518515 | 0d023bfca4b19c7b… | 2026-09-05T13:10:44.788Z | FULL |
| S08-w3c-web-animations-1 | https://www.w3.org/TR/web-animations-1/ | 200 | 1000120 | e814a799ef2442a6… | 2026-09-05T13:10:45.119Z | FULL |
| S04-webdev-webgpu-major-browsers | https://web.dev/blog/webgpu-supported-major-browsers | 200 | 103301 | 29ef58068e4a48b9… | 2026-09-05T13:10:44.869Z | FULL |
| S10-csswg-scroll-animations-1 | https://drafts.csswg.org/scroll-animations-1/ | 200 | 472007 | c9f27f36bf71fd92… | 2026-09-05T13:10:45.267Z | FULL |
| S09-csswg-view-transitions-2 | https://drafts.csswg.org/css-view-transitions-2/ | 200 | 927525 | 959b5f6e4b86f9a2… | 2026-09-05T13:10:45.236Z | FULL |
| S13-mdn-offscreencanvas | https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas | 200 | 163236 | c627ecb19d330045… | 2026-09-05T13:10:45.743Z | PARTIAL |
| S12-w3c-webcodecs | https://www.w3.org/TR/webcodecs/ | 200 | 1745708 | 29bafbf1f6c8bae2… | 2026-09-05T13:10:45.709Z | FULL |
| S02-gpuweb-implementation-status | https://github.com/gpuweb/gpuweb/wiki/Implementation-Status | 200 | 1651882 | 3895158e9e794997… | 2026-09-05T13:10:44.867Z | FULL |
| S11-houdini-paint-api | https://drafts.css-houdini.org/css-paint-api/ | 200 | 270382 | 69e407157b696e08… | 2026-09-05T13:10:45.418Z | FULL |
| S15-npm-three | https://registry.npmjs.org/three/latest | 200 | 4052 | eaf6cab853d8114d… | 2026-09-05T13:10:45.792Z | JSON |
| S18-npm-gsap | https://registry.npmjs.org/gsap/latest | 200 | 2137 | 787e4fdba7edc45b… | 2026-09-05T13:10:45.919Z | JSON |
| S16-npm-react-three-fiber | https://registry.npmjs.org/@react-three/fiber/latest | 200 | 3802 | 9ce1f90e35dc2dd2… | 2026-09-05T13:10:45.886Z | JSON |
| S19-npm-motion | https://registry.npmjs.org/motion/latest | 200 | 3636 | 6e694966abb051ab… | 2026-09-05T13:10:46.176Z | JSON |
| S20-npm-framer-motion | https://registry.npmjs.org/framer-motion/latest | 200 | 4389 | fd84659798822ae8… | 2026-09-05T13:10:46.262Z | JSON |
| S21-npm-rive-canvas | https://registry.npmjs.org/@rive-app/canvas/latest | 200 | 2417 | 4f7ce4e623605406… | 2026-09-05T13:10:46.304Z | JSON |
| S03-chrome-webgpu-overview | https://developer.chrome.com/docs/web-platform/webgpu/overview | 200 | 109934 | c1f59715d10c0db8… | 2026-09-05T13:10:44.868Z | FULL |
| S22-npm-lottie-web | https://registry.npmjs.org/lottie-web/latest | 200 | 2353 | 1f93f1fa62dddad0… | 2026-09-05T13:10:46.458Z | JSON |
| S23-npm-wavesurfer | https://registry.npmjs.org/wavesurfer.js/latest | 200 | 3414 | 525578da1d2eb001… | 2026-09-05T13:10:46.500Z | JSON |
| S24-npm-tone | https://registry.npmjs.org/tone/latest | 200 | 3929 | 53aba9471d54a1c0… | 2026-09-05T13:10:46.556Z | JSON |
| S26-npm-next | https://registry.npmjs.org/next/latest | 200 | 3069 | bb435dde0aa268df… | 2026-09-05T13:10:46.713Z | JSON |
| S25-npm-butterchurn | https://registry.npmjs.org/butterchurn/latest | 200 | 2911 | ef59261fa062fa77… | 2026-09-05T13:10:46.695Z | JSON |
| S27-flutter-fragment-shaders-doc | https://docs.flutter.dev/ui/design/graphics/fragment-shaders | 200 | 244309 | e04cb9c5156a25fb… | 2026-09-05T13:10:46.745Z | FULL |
| S28-flutter-impeller-doc | https://docs.flutter.dev/perf/impeller | 200 | 153647 | 7a9c84def181033d… | 2026-09-05T13:10:46.814Z | FULL |
| S32-flutter-sdk-archive | https://docs.flutter.dev/install/archive | 200 | 149986 | 3e743fa5b38c15ec… | 2026-09-05T13:10:47.081Z | FULL |
| S29-flutter-blog-3-44 | https://flutter.dev/blog/whats-new-in-flutter-3-44 | 200 | 133335 | 86d5d2fa18afded9… | 2026-09-05T13:10:46.969Z | FULL |
| S30-flutter-blog-3-47 | https://flutter.dev/blog/whats-new-in-flutter-3-47 | 200 | 107804 | 6fb2de93eeb04e0c… | 2026-09-05T13:10:47.032Z | FULL |
| S31-flutter-roadmap-2026 | https://flutter.dev/blog/flutter-darts-2026-roadmap | 200 | 61955 | 3e88b879dc503099… | 2026-09-05T13:10:47.036Z | FULL |
| S14-threejs-releases | https://github.com/mrdoob/three.js/releases | 200 | 1474867 | 542a8c0e33e8934f… | 2026-09-05T13:10:45.791Z | PARTIAL |
| S33-pub-just-audio | https://pub.dev/api/packages/just_audio | 200 | 150332 | a96ecd5633eed086… | 2026-09-05T13:10:47.144Z | FULL |
| S34-pub-audio-service | https://pub.dev/api/packages/audio_service | 200 | 72807 | 5062f16fb3cb0420… | 2026-09-05T13:10:47.198Z | JSON |
| S36-pub-audio-session | https://pub.dev/api/packages/audio_session | 200 | 50187 | c8618123be62ecb5… | 2026-09-05T13:10:47.240Z | JSON |
| S35-pub-just-audio-background | https://pub.dev/api/packages/just_audio_background | 200 | 17097 | 0f0b207b747b625c… | 2026-09-05T13:10:47.207Z | JSON |
| S38-pub-lottie | https://pub.dev/api/packages/lottie | 200 | 54948 | dfd2f935b47acd40… | 2026-09-05T13:10:47.480Z | JSON |
| S39-pub-flutter-animate | https://pub.dev/api/packages/flutter_animate | 200 | 21253 | 43e52aeb8062af68… | 2026-09-05T13:10:47.508Z | JSON |
| S40-pub-audio-waveforms | https://pub.dev/api/packages/audio_waveforms | 200 | 21464 | 38b95a8f2bd414f7… | 2026-09-05T13:10:47.564Z | JSON |
| S37-pub-rive | https://pub.dev/api/packages/rive | 200 | 110268 | bff68c9d14654ac7… | 2026-09-05T13:10:47.348Z | JSON |
| S42-pub-flutter-gpu | https://pub.dev/api/packages/flutter_gpu | 200 | 1068 | 2ed6a1c4ed66d546… | 2026-09-05T13:10:47.672Z | JSON |
| S43-pub-google-mobile-ads | https://pub.dev/api/packages/google_mobile_ads | 200 | 45685 | 04e4f67f34d2877d… | 2026-09-05T13:10:47.734Z | JSON |
| S41-pub-flutter-audio-capture | https://pub.dev/api/packages/flutter_audio_capture | 200 | 14813 | 243ffecfc9f1a4dc… | 2026-09-05T13:10:47.591Z | JSON |
| S45-pub-share-plus | https://pub.dev/api/packages/share_plus | 200 | 127978 | 484b40b649b70245… | 2026-09-05T13:10:47.835Z | JSON |
| S17-gsap-licensing | https://gsap.com/licensing/ | 200 | 76456 | 8a46358ae964cd8c… | 2026-09-05T13:10:45.901Z | FULL |
| S48-pub-http | https://pub.dev/api/packages/http | 200 | 74692 | dc9987f63ae34b50… | 2026-09-05T13:10:47.999Z | JSON |
| S46-pub-flutter-appauth | https://pub.dev/api/packages/flutter_appauth | 200 | 91996 | 65abe8293b6377c1… | 2026-09-05T13:10:47.915Z | JSON |
| S44-pub-interactive-media-ads | https://pub.dev/api/packages/interactive_media_ads | 200 | 92316 | e98189765cdd2ead… | 2026-09-05T13:10:47.806Z | JSON |
| S49-pub-shared-preferences | https://pub.dev/api/packages/shared_preferences | 200 | 113389 | 04c88094d29b922a… | 2026-09-05T13:10:48.033Z | JSON |
| S50-pub-haptic-feedback | https://pub.dev/api/packages/haptic_feedback | 200 | 43184 | 4279590fd93a79c5… | 2026-09-05T13:10:48.091Z | JSON |
| S47-pub-flutter-secure-storage | https://pub.dev/api/packages/flutter_secure_storage | 200 | 73157 | ae709a30a2b47c46… | 2026-09-05T13:10:47.928Z | JSON |
| S52-android-media-notifications | https://developer.android.com/media/implement/surfaces/mobile | 200 | 415200 | 67009ded779d8126… | 2026-09-05T13:10:48.207Z | FULL |
| S54-apple-mpremotecommandcenter | https://developer.apple.com/documentation/mediaplayer/mpremotecommandcenter | 200 | 17564 | dc192824487330be… | 2026-09-05T13:10:48.374Z | INACCESSIBLE (JS shell) |
| S55-apple-activitykit | https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities | 200 | 17859 | c2c30ce9e949111d… | 2026-09-05T13:10:48.389Z | INACCESSIBLE (JS shell) |
| S53-apple-mpnowplayinginfocenter | https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter | 200 | 17518 | c905ee6994058d20… | 2026-09-05T13:10:48.314Z | INACCESSIBLE (JS shell) |
| S59-mdn-variable-fonts | https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Fonts/Variable_fonts | 200 | 358108 | b06d6eb95c18286c… | 2026-09-05T13:10:48.827Z | PARTIAL |
| S58-csswg-css-color-4 | https://www.w3.org/TR/css-color-4/ | 200 | 1195737 | 5014190ce56b60cb… | 2026-09-05T13:10:48.807Z | FULL |
| S51-android-media3-mediasession | https://developer.android.com/media/media3/session/control-playback | 200 | 434544 | 8b4e8e75de613293… | 2026-09-05T13:10:48.201Z | PARTIAL |
| S60-apple-core-haptics | https://developer.apple.com/documentation/corehaptics | 200 | 17370 | 12d89b1b3d3c111a… | 2026-09-05T13:10:48.875Z | INACCESSIBLE (JS shell) |
| S56-apple-carplay-audio | https://developer.apple.com/documentation/carplay/supporting-carplay-in-your-audio-app | 404 | 15658 | 256d5e439d8c8047… | 2026-09-05T13:10:48.412Z | INACCESSIBLE (404) |
| S65-flutter-devtools-performance | https://docs.flutter.dev/tools/devtools/performance | 200 | 153372 | 2075799883626d5b… | 2026-09-05T13:10:49.242Z | PARTIAL |
| S57-android-auto-media | https://developer.android.com/training/cars/media | 200 | 281303 | a92a555e72c36a9b… | 2026-09-05T13:10:48.670Z | PARTIAL |
| S62-webdev-inp | https://web.dev/articles/inp | 200 | 149483 | fa22e39d14d19096… | 2026-09-05T13:10:48.949Z | FULL |
| S67-flutter-adaptive-layouts | https://docs.flutter.dev/ui/adaptive-responsive | 200 | 132691 | 7b55acdc4d020cdb… | 2026-09-05T13:10:49.435Z | PARTIAL |
| S68-flutter-predictive-back | https://docs.flutter.dev/platform-integration/android/predictive-back | 200 | 148811 | 85e2c353a6e5e620… | 2026-09-05T13:10:49.576Z | FULL |
| S63-chrome-loaf | https://developer.chrome.com/docs/web-platform/long-animation-frames | 200 | 274515 | 3ea340496d22f068… | 2026-09-05T13:10:49.003Z | FULL |
| S61-android-vibrationeffect-composition | https://developer.android.com/reference/android/os/VibrationEffect.Composition | 200 | 2289257 | fe16f3bf968fcb2a… | 2026-09-05T13:10:48.887Z | FULL |
| S64-lighthouse-releases | https://github.com/GoogleChrome/lighthouse/releases | 200 | 490914 | c9d8617cb71ec685… | 2026-09-05T13:10:49.230Z | FULL |
| S72-flutter-web-renderers | https://docs.flutter.dev/platform-integration/web/renderers | 200 | 138423 | 56e0c5bff77d898f… | 2026-09-05T13:10:50.071Z | PARTIAL |
| S69-m3-motion-expressive | https://m3.material.io/styles/motion/overview | 200 | 61571 | 6186ed17c52b48aa… | 2026-09-05T13:10:49.609Z | PARTIAL |
| S73-nextjs-ppr | https://nextjs.org/docs/app/getting-started/partial-prerendering | 200 | 861366 | 90fe702a11e7bd43… | 2026-09-05T13:10:50.102Z | PARTIAL |
| S66-android-macrobenchmark | https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview | 200 | 395323 | a2d4c0facc7b6704… | 2026-09-05T13:10:49.321Z | PARTIAL |
| S74-rive-flutter-docs | https://rive.app/docs/runtimes/flutter/flutter | 200 | 857317 | 7c5ec406d1cc584b… | 2026-09-05T13:10:50.217Z | PARTIAL |
| S71-just-audio-visualizer-issue | https://github.com/ryanheise/just_audio/issues/97 | 200 | 297690 | 336e58fff15882bd… | 2026-09-05T13:10:49.773Z | PARTIAL |
| S70-flutter-wide-gamut-issue | https://github.com/flutter/flutter/issues/127855 | 200 | 295210 | d2fc6838c5d8844b… | 2026-09-05T13:10:49.747Z | PARTIAL |
| S75-android-mediastyle-notification-ref | https://developer.android.com/reference/androidx/media3/session/MediaStyleNotificationHelper | 200 | 2948903 | f17c471b331adbe0… | 2026-09-05T13:10:50.452Z | PARTIAL |
| A01-deber-chi2015-how-much-faster | https://www.tactuallabs.com/papers/howMuchFasterIsFastEnoughCHI15.pdf | 200 | 912677 | e8b7cd6e81b39db5… | 2026-09-05T13:14:09.033Z | FULL (academic) |
| A03-ng-uist2012-low-latency-direct-touch | https://www.tactuallabs.com/papers/designingLowLatencyDirectTouchInputUIST12.pdf | 200 | 1347693 | 7b75ef238ea93257… | 2026-09-05T13:14:09.070Z | FULL (academic) |
| A06-wac2022-comparing-audioworklets | https://zenodo.org/records/6767468 | 200 | 75401 | 2c098e1792133823… | 2026-09-05T13:14:09.073Z | FULL (academic) |
| A04-erdmann-frontiers-vr-2025-mr-music-visualization | https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2025.1552321/full | 200 | 927651 | 982ca6159fb52ab4… | 2026-09-05T13:14:09.071Z | FULL (academic) |
| A08-peavs-arxiv-2404-07336 | https://arxiv.org/abs/2404.07336 | 200 | 42893 | ecf4fea7e278707c… | 2026-09-05T13:14:09.686Z | PARTIAL |
| A07-wac2024-faust-spectral-audioworklet | https://zenodo.org/records/10825715 | 200 | 92534 | 3267bd3255a1d275… | 2026-09-05T13:14:09.579Z | FULL (academic) |
| A09-cattan-chi2017-latency-learning | http://tripet.imag.fr/publs/2017/CHI17_Cattan_lag_learn.pdf | 200 | 596196 | 65b1dcb5f251a710… | 2026-09-05T13:14:09.756Z | PARTIAL |
| S76-pub-just-audio-api-json | https://pub.dev/api/packages/just_audio | 200 | 150332 | a96ecd5633eed086… | 2026-09-05T13:14:10.184Z | JSON |
| A02-jota-chi2013-how-fast-is-fast-enough | https://www.tactuallabs.com/papers/howFastIsFastEnoughCHI13.pdf | 200 | 1403635 | 1fc344e2f6d20e6e… | 2026-09-05T13:14:09.069Z | FULL (academic) |
| S77-mdn-analysernode-fftsize | https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize | 200 | 155830 | fee606198a8cfdc7… | 2026-09-05T13:14:10.347Z | PARTIAL |
| S78-apple-activitykit-root | https://developer.apple.com/documentation/activitykit | 200 | 17412 | 179a6ba8aa4a752d… | 2026-09-05T13:14:10.362Z | INACCESSIBLE (JS shell) |
| S81-flutter-can-i-use-impeller | https://docs.flutter.dev/perf/impeller#availability | 200 | 153647 | 7a9c84def181033d… | 2026-09-05T13:14:10.953Z | PARTIAL |
| S79-apple-carplay-audio-doc | https://developer.apple.com/documentation/carplay/supporting-carplay-in-your-audio-app | 404 | 15658 | 256d5e439d8c8047… | 2026-09-05T13:14:10.491Z | INACCESSIBLE (404) |
| S80-apple-carplay-root | https://developer.apple.com/carplay/ | 200 | 116734 | e65952f984a1d55b… | 2026-09-05T13:14:10.514Z | INACCESSIBLE (JS shell) |
| A11-uh2012-mobile-games-power | http://graphics.cs.uh.edu/wp-content/papers/2012/2012-Computer-MobileGameAnalysis-preprint.pdf | 200 | 467392 | 29c0fca144f4ccf8… | 2026-09-05T13:14:09.956Z | PARTIAL |
| A05-correya-tismir-essentia-js | https://transactions.ismir.net/articles/10.5334/tismir.111 | 200 | 572660 | b8ffd1f7d648951f… | 2026-09-05T13:14:09.072Z | FULL (academic) |
| S83-flutter-hapticfeedback-api | https://api.flutter.dev/flutter/services/HapticFeedback-class.html | 200 | 14060 | de1a03195215134d… | 2026-09-05T13:14:11.210Z | PARTIAL |
| S84-flutter-fragmentprogram-api | https://api.flutter.dev/flutter/dart-ui/FragmentProgram-class.html | 200 | 10824 | 1a0ea87ad2a0a04d… | 2026-09-05T13:14:11.237Z | PARTIAL |
| S82-android-vibrationeffect | https://developer.android.com/reference/android/os/VibrationEffect | 200 | 2302962 | 32d3173c209e3458… | 2026-09-05T13:14:11.130Z | PARTIAL |
| A10-annett-gi2014-latency-inking | https://webdocs.cs.ualberta.ca/~wfb/publications/C-2014-GI-Latency.pdf | 200 | 1589675 | ddf76fc7f2ce621f… | 2026-09-05T13:14:09.794Z | PARTIAL |
| S85-webdev-vitals-thresholds | https://web.dev/articles/vitals | 200 | 161744 | 548bf8558d8bf41d… | 2026-09-05T13:14:11.254Z | PARTIAL |
| S86-android-16-media | https://developer.android.com/about/versions/16/features | 200 | 336507 | 6cc0831cd527b123… | 2026-09-05T13:14:11.475Z | PARTIAL |

Capture totals: 97 URLs attempted, 95 HTTP 200, 2 non-200. Full SHA-256 values are recoverable by hashing the files under docs/research/_sources/2026-09-05-apis-*.

## Counts (this session, by provenance family, not URL)

- Authoritative independent document families with HTTP 200 and at least partial read: **43** (W3C WebGPU spec; gpuweb wiki; Chrome WebGPU overview; web.dev WebGPU; W3C Web Audio 1.1; MDN AnalyserNode; MDN AudioWorklet; MDN OffscreenCanvas; MDN variable fonts; W3C Web Animations; CSSWG view-transitions-2; CSSWG scroll-animations-1; Houdini paint API; W3C WebCodecs; W3C css-color-4; three.js releases+npm; GSAP licence+npm; npm motion/framer-motion; npm rive; npm lottie-web; npm wavesurfer; npm tone; npm butterchurn; npm next; docs.flutter.dev Impeller; docs.flutter.dev fragment shaders; Flutter SDK archive; Flutter predictive back; Flutter adaptive; Flutter DevTools; Flutter web overview; flutter.dev 3.44; flutter.dev 3.47; flutter.dev roadmap 2026; flutter/flutter#159941; flutter/flutter#127855; pub.dev (18 packages, one family); ryanheise/just_audio#97; developer.android.com Media3 session; Android media notifications; Android Auto media; Android VibrationEffect.Composition; Android Macrobenchmark; web.dev INP; Chrome LoAF; Lighthouse releases; m3.material.io motion; rive.app Flutter docs; nextjs.org docs) — counted by hand from the register above.
- Academic sources consulted: 11 (A01–A11).
- Academic read [FULL] with complete five-part records: 6 (A01, A02, A03, A04, A05, A06). A07 read FULL (no five-part record). A08–A11 PARTIAL/ABS.
- Primary non-academic [FULL]: 25 (the FULL set in the register).

# Artifact index and produced-vs-planned count

- Planned: 1 report + ≥75 captures. Produced: 1 report (this file) + **97** capture attempts (75 batch 1 + 22 batch 2) → 95 files with HTTP 200 written under `C:\Berk\PlayMusicPrompts\docs\research\_sources\2026-09-05-apis-*`, 2 non-200 (S56 and S79, both the same CarPlay audio-app URL, HTTP 404 — the 404 body was saved as evidence of the failure). Note: Apple JS-shell pages (S53, S54, S55, S60, S78, S80) are HTTP 200 files that contain no documentation text — counted as captured, NOT as read.
- Academic full-text captures on disk: A01–A11 (11 files, all HTTP 200).
- No other project file was modified. The capture script and URL lists live outside the project at `C:\Users\berke\.cursor\projects\c-Berk-PlayMusicPrompts\agent-tools\capture-2026-09-05-apis.cjs`, `capture-batch1.json`, `capture-batch2.json`, `capture-batch1.out.jsonl`, `capture-batch2.out.jsonl` (the two `.out.jsonl` files are UTF-16 because PowerShell redirection wrote them).
- Index entry in `docs/research/README.md` and the `_runs` manifest: **NOT written** — CONTEXT-16 restricts this worker to the one report + captures; the parent owns the index and the manifest.

# Completion audit

- [x] Covenant read in full (1,310 lines), block hash recomputed and matched.
- [x] First external action was a broad scoping search (Q01); no locator guessed — every URL came from a search result, a registry, or a link on an official page.
- [x] 7/7 angles of CONTEXT-02 have a findings section.
- [x] ≥20 authoritative independent families: 43 counted by hand from the register.
- [x] ≥5 academic `[FULL]` with five-part records: 6.
- [x] Contradictions preserved (X1–X6), gaps named (G1–G6).
- [ ] NOT met: Apple platform capabilities (Now Playing, Remote Command Center, Live Activities/Dynamic Island limits, Core Haptics, CarPlay) — INACCESSIBLE this session; **the parent must not cite this report for any Apple limit**.
- [ ] NOT met: academic evidence on Flutter frame-time performance — none found in the searched scope (Q12).
- [ ] NOT met: API-name-level verification of just_audio's visualiser streams (README table read; Dart API not opened).
- Read-back: performed by the parent-visible verification step below (line count + SHA-256 of this file recorded in the return message, not here, because a file cannot contain its own final hash).




---

# Gap-closure appendix (follow-up run, appended 2026-09-05T13:58:31.334Z)

**Append-only extension of the report above.** Pre-append read-back of this file, immediately before the write: 63767 bytes, 399 lines, sha256 `9a5a98d278df4cf46f2eaf27536c1e8ffec79274a7534b12895901079016bb00`. Nothing above this heading was modified. Gap IDs below use the numbering of the gap table above (G1 Apple pages, G2 CarPlay 404, G3 academic Flutter frame-time, G4 M3 expressive motion → Flutter, G5 Impeller wide gamut); the parent's follow-up items "just_audio visualiser" and "repos S12–S14" are closed here as G6 and G7. New source IDs S101–S204 are registered in "Source register — appendix" below; every locator is `<SID> L<n>` = line n of the capture file `docs/research/_sources/2026-09-05-apis-<SID>-*`.

## G1 — Apple documentation: real text obtained (mechanism, attempts, limits)

**Mechanism (measured, not guessed).** Every `developer.apple.com/documentation/...` page is served as Markdown by appending `.md` to the page path (e.g. `https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter.md` → HTTP 200, 10,608 bytes, S101). The Markdown starts with an HTML comment carrying the DocC availability block (`"iOS: 5.0.0 -"` etc.) — the same metadata the JSON shell uses. The DocC JSON the page shell fetches is at `https://developer.apple.com/tutorials/data/documentation/<path>.json` (S129 200/86,406 B; S130 200/133,106 B) and, for the Human Interface Guidelines, at `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json` (S166 200/98,950 B; S167 200/51,525 B; S168 200/22,865 B). **The `.md` form does NOT exist for HIG pages** — `…/design/human-interface-guidelines/live-activities.md`, `playing-haptics.md`, `carplay.md`, `components/system-experiences/live-activities.md` all returned 404 (S105, S124, S123, S169: each 404 with the 15,658-byte JS shell); the HIG facts below were taken from the DocC JSON (route b) and flattened with a scratch script. I did not find Apple's own written statement advertising the `.md` mechanism this session — the mechanism is established by measurement (33 `.md` URLs → 200 with Markdown bodies), and this is recorded as `[single-source official, mechanism observed]`. Route (c) swift-docc GitHub archives was **not needed** and was not used.

**Attempt ledger (every URL, status, bytes — measured from the batch outputs and the files on disk, 2026-09-05):** 33 `.md` pages 200 (S101–S104, S106–S115, S117–S120, S125–S128, S170–S175, S177–S181; sizes 1,011–46,321 bytes each, per-row bytes in the source register below); 7 `.md` 404 (S105, S116 `avfaudio/configuring-your-app-for-media-playback.md`, S122 CarPlay audio retry, S123, S124, S169, S176 `avaudiosession/category.md` — the correct path is `category-swift.struct.md`, S114 200; each 404 body is the 15,658-byte JS shell); 5 JSON 200 (S129, S130, S166, S167, S168); 1 PDF 200 (S121 CarPlay App Programming Guide, 20,840,702 bytes, captured, **not read**). Naming note: capture id S171 is labelled `chhapticengine-notifywhenplayersfinished` but its URL is `chhapticengine/capabilitiesforhardware().md` — the id is misnamed, the content is the capabilities page.

### G1.a MPNowPlayingInfoCenter / MPRemoteCommandCenter (S101, S102, S126, S127)
- Availability `iOS 5.0+`, `macOS 10.12.2+` (S101 L4, L7). Apple: "provide values for as many information properties as you can in the `nowPlayingInfo` dictionary" to work with the widest range of accessories (S101 L46); "You don't have direct control over what information the system displays, or its formatting" (S101 L64). `MPMediaItemProperty*` keys listed L50–L62 (album title, track count/number, artist, **artwork**, composer, disc count/number, genre, media type, persistent ID, **playback duration**, title). `supportedAnimatedArtworkKeys` exists (S101 L87) — animated artwork is a Now Playing capability. `playbackState` is macOS-only ("Setting the playback state in macOS", S101 L91–L97). Journal-app donation opt-out note, iOS 17.2+ (S101 L69).
- `MPRemoteCommandCenter` `iOS 7.1+` (S102 L4); `shared()` (L44); **21 command properties** listed S102 L50–L136: pause, play, stop, togglePlayPause, nextTrack, previousTrack, changeRepeatMode, changeShuffleMode, changePlaybackRate, seekBackward, seekForward, skipBackward, skipForward, changePlaybackPosition, rating, like, dislike, bookmark, enableLanguageOption, disableLanguageOption, plus the base `MPRemoteCommand` reference row. **PMP fit:** nextTrack maps to the owner's "skip → next prepared" rule; like/dislike map to take-preference signals; there is no "regenerate" command — a custom action must live in the app UI or a Live Activity button.
- "Becoming a now playable app" is a sample-code article (S127 L13 `"role" : "sampleCode"`, iOS 12.2+ L6) tied to WWDC19-501 (L24).

### G1.b AVAudioSession playback category and background audio (S113, S114, S115, S117, S181)
- `AVAudioSession.Category.playback` `iOS 3.0+` (S115 L4): "your app audio continues with the Silent switch set to silent or when the screen locks … To continue playing audio when your app transitions to the background … add the `audio` value to the UIBackgroundModes" (S115 L37); non-mixable by default, `mixWithOthers` to mix (L39). `UIBackgroundModes` Info.plist key page captured (S117, 35 lines) and Xcode "Configuring background execution modes" (S181 L12–L34: capability added via Background Modes; "Use background execution modes sparingly", L26). **PMP fit:** the Flutter side already carries this via `audio_service`/`just_audio_background` (F3 above); the IMA audio ad break must run in the same session category or the ad will not survive lock.

### G1.c ActivityKit / Live Activities — exact limits (S104, S106, S125, S128, S166)
| Limit | Value | Locator |
|---|---|---|
| Active lifetime | up to **8 hours**, then system ends it and removes it from the Dynamic Island | S104 L50 |
| Lock Screen persistence after end | up to **4 additional hours**; **maximum 12 hours** on the Lock Screen | S104 L50 |
| Data size | static + dynamic data incl. updates and push payloads **≤ 4 KB combined** | S104 L58 |
| Height | system **may truncate above 160 pt** | S104 L151 |
| Minimal-presentation image | must not exceed **45×36.67 pt**; oversized image may fail to start the activity | S104 L54 |
| Presentations | compact leading/trailing, minimal (two apps → one attached, one detached), expanded (touch-and-hold, also shown briefly on updates); StandBy shows minimal at top | S104 L32–L42, L160–L212 |
| Surfaces | Lock Screen, Dynamic Island, **CarPlay**, paired Mac / Apple Watch | S104 L14, L18 |
| Info.plist | `NSSupportsLiveActivities = YES` | S104 L69 |
| Push budget | "a certain budget of ActivityKit push notifications per hour" — Apple states no number; `apns-priority 10` (default) counts toward it, **`5` does not**; exceeding → throttling | S106 L325–L330 |
| Frequent updates | `NSSupportsLiveActivitiesFrequentUpdates = YES`; user can disable in Settings; detect via `frequentPushesEnabled` / `frequentPushEnablementUpdates` | S106 L334–L341 |
| Push headers | `apns-push-type: liveactivity`, `apns-topic: <bundleID>.push-type.liveactivity`, `apns-priority` 5 or 10; `timestamp` in payload; optional `stale-date`; push-to-start on iOS 18+ | S106 L137–L160, L122–L131 |
| Dynamic Island sizes (HIG) | 430×932 screen: compact leading/trailing 62.33×36.67, minimal 36.67–45×36.67, expanded 408×84–160, Lock Screen 408×84–160; 393×852 screen: 52.33×36.67 / 36.67–45×36.67 / 371×84–160 / 371×84–160 | S166 flattened L58 |
| Dynamic Island width (pt), HIG | compact/minimal: **250** on iPhone 17 Pro Max / Air / 16 Pro Max / 16 Plus / 15 Pro Max / 15 Plus / 14 Pro Max; **230** on iPhone 17 Pro / 17 / 16 Pro / 16 / 15 Pro / 15 / 14 Pro; expanded: 408 on the 250-class, 371 on the 230-class; corner radius 44 pt | S166 flattened L59–L60 |

**PMP fit:** a 3-take playlist state (current take, next prepared, T−90 s countdown) fits inside 4 KB with room to spare if artwork is bundled, not transmitted; the 8-hour ceiling is above any single listening queue; "regenerate"/"next take" can be Live Activity buttons via App Intents (WidgetKit doc not captured — `[UNVERIFIED]`). Local `Activity.update` calls have no documented hourly budget in the captured text; the budget language is attached to **push** updates (S106 L325).

### G1.d Core Haptics (S107–S112, S171–S175, S180)
- `CHHapticEngine` `iOS 13.0+` (S108 L4). Engine lifecycle: `start()` (S180), `stop`, `resetHandler` / `stoppedHandler` with `StoppedReason` (S108 L168–L190), `isAutoShutdownEnabled` (L222), `playsHapticsOnly`, `isMutedForAudio`, `isMutedForHaptics` (L118–L126); players `makePlayer(with:)` and `makeAdvancedPlayer(with:)` (L104–L108); `capabilitiesForHardware()` → `CHHapticDeviceCapability` with `supportsHaptics`, `supportsAudio`, `attributes(forDynamicParameter:)`, `attributes(forEventParameter:eventType:)` (S108 L204–L216; S172 L39–L53).
- Event parameter IDs (S112 L44–L82): `hapticIntensity`, `hapticSharpness`, `attackTime`, `decayTime`, `releaseTime`, `sustained`, `audioVolume`, `audioPan`, `audioPitch`, `audioBrightness`. Numeric ranges per parameter are on the per-parameter pages, which were **not captured** — ranges `[UNVERIFIED]` in this report.
- Dynamic modulation: `CHHapticDynamicParameter` changes a value abruptly at `relativeTime` across all events; intensity/volume multiply, others add (S174 L37–L39); `CHHapticParameterCurve` interpolates linearly between control points and applies to all events in a pattern (S175 L37–L41). **PMP fit:** beat-locked haptics = a parameter curve driven from the visualiser's FFT energy; the engine reset handler is mandatory because the engine stops on audio-session interruptions (ad break).
- HIG "Playing haptics" (S167) carries no numeric limits; last change 2024-05-07 (S167 flattened L32).

### G1.e / G2 CarPlay audio-app template (S118, S119, S120, S121, S177, S178, S179)
- The 404 URL `carplay/supporting-carplay-in-your-audio-app` stays 404 in `.md` form (S122). Current authority: CarPlay root (S118) — "Templates that are available exclusively to apps with the audio entitlement" → `CPNowPlayingTemplate` (S118 L95–L105); `CPListTemplate`, `CPGridTemplate`, `CPTabBarTemplate` general-purpose (L75–L85).
- `CPNowPlayingTemplate` `iOS 14.0+` (S119 L4): a shared system template (`shared`, L49) that displays `MPNowPlayingInfoCenter` / `MPRemoteCommandCenter` data (L34, L40); playback buttons set via `nowPlayingButtons` / `updateNowPlayingButtons(_:)` (L55–L61) from six concrete classes — `CPNowPlayingImageButton`, `AddToLibraryButton`, `MoreButton`, `PlaybackRateButton`, `RepeatButton`, `ShuffleButton` (L67–L89); `isAlbumArtistButtonEnabled` / `isUpNextButtonEnabled` (L93–L99) require a `CPNowPlayingTemplateObserver` (L36, L107–L115).
- Entitlement `com.apple.developer.carplay-audio` requested at CarPlay Contact Us, reviewed by Apple, plus the CarPlay Entitlement Addendum and additional App Store Review guidelines (S179 L18–L23, L65–L70). The App Programming Guide PDF (S121, 20.8 MB) is captured and **unread** — list-depth and item-count limits therefore remain `[UNVERIFIED]`.
- **Flutter reality check:** none of this is reachable from Dart without a platform plugin; `just_audio`/`audio_service` expose Now Playing but not CarPlay templates — a native Swift target is required for the CarPlay direction.


## G6 (parent item 2) — just_audio visualiser: the code, not the README

- **Released 0.10.6 has no visualiser.** The pub.dev archive `just_audio-0.10.6.tar.gz` (S150, 323,292 bytes, gzip magic `1f 8b` verified) and `master/just_audio/lib/just_audio.dart` (S153, 4,617 lines) contain **0** occurrences of "visualizer" (case-insensitive grep). The master README nevertheless advertises "Waveform visualizer (See #97) ✅ Android ✅ iOS" and "FFT visualizer ✅ Android ✅ iOS ✅ macOS" (S152 L441–L442) — **README/code mismatch on the shipped line**: the feature table describes the unreleased branch.
- **The `visualizer` branch is where the feature lives** (S197: head `fcba2a3`, 2026-06-29T13:34:37Z, "Merge branch 'feature/agp9' into visualizer"; pubspec `version: 0.11.0`, S202 L3). Compared with the default branch `minor` (head `454a24c`, 2026-06-29T13:31:16Z, S204) it is **106 commits ahead, 1 behind, 27 files changed** (S203 `status: diverged`). Native files added: `android/src/main/java/com/ryanheise/just_audio/BetterVisualizer.java` (+89), `darwin/…/AndroidFFT.mm` (+195) and `AndroidFFT.h` (+41), plus `example/lib/example_visualizer.dart` (+367) in both `just_audio` and `just_audio_background` examples (S203 files list).
- **Dart API as coded on that branch (S198 `just_audio/lib/just_audio.dart`, 4,775 lines):** `Stream<VisualizerWaveformCapture> get visualizerWaveformStream` (L489), `Stream<VisualizerFftCapture> get visualizerFftStream` (L493); `Future<void> startVisualizer({bool enableWaveform = true, bool enableFft = true, int? captureRate, int? captureSize})` (L1399–L1410, doc L1393–L1397: "capturing [captureSize] samples of audio at [captureRate] **millihertz**"); `Future<void> stopVisualizer()` (L1414–L1416); `class VisualizerWaveformCapture { final int samplingRate; final Uint8List data; }` (L1927–L1935); `class VisualizerFftCapture { final int samplingRate; final Int8List data; }` (L1941–L1953, doc L1946: "frequency range from 0 to [samplingRate]"). The request is re-sent after a platform re-init (L1772–L1773).
- **Platform interface (S199, 1,650 lines):** `visualizerWaveformStream`/`visualizerFftStream` getters throw `UnimplementedError` in the base class (L80–L88); `startVisualizer(StartVisualizerRequest)` / `stopVisualizer(StopVisualizerRequest)` (L217–L225); message classes `StartVisualizerRequest/Response`, `StopVisualizerRequest/Response` (L928–L966). **Method channel (S200):** event-channel-backed streams (L50–L63) and `invokeMethod('startVisualizer' | 'stopVisualizer', request.toMap())` (L221–L232).
- **Platform coverage as coded:** Android (`BetterVisualizer.java`, Android `Visualizer` API — requires `android.permission.RECORD_AUDIO` and a runtime permission request, S201 L282–L291) and Darwin (`AndroidFFT.mm`, an FFT port for iOS/macOS). The branch README table says "Waveform/FFT visualizer ✅ Android ✅ iOS" only (S201 L444) — no web, no Windows/Linux. **Web is not covered by either README or code** — for the PMP web player the visualiser must come from Web Audio `AnalyserNode` (see the web findings above), not from just_audio.
- **Issue #97 "Provide a simple Audio Visualizer"** (S147): state **open**, created 2020-05-27, updated 2025-05-14, **103 comments** (S148 100 + S149 3). Latest comment 2025-05-14T01:04:59Z by the maintainer ryanheise: the visualiser in scope is "the one we get by tapping into the realtime audio buffers of the player, while audio is decoded and played … ahead-of-time waveform extraction … shouldn't be done by the player, but independently by an external plugin (e.g. just_waveform)". No comment dated 2026 exists in the captured pages; the branch was nevertheless merged forward on 2026-06-29 (S197).
- **PMP decision input:** depending on the visualiser means depending on a **pre-release branch (0.11.0, git dependency)** whose default-branch README already over-claims it; the alternative is a platform-channel FFT of our own (as the master report's F-row proposes) or a pinned fork. Both are engineering choices, not owner-taste — the report records the facts only.

## G4 (parent item 3) — Material 3 Expressive motion in Flutter 3.44–3.47

- **Release notes 3.44.0 (S156, 341,669 bytes) and 3.47.0 (S157, 338,152 bytes) contain no "expressive", "spring" or "motion token" framework entry.** Grep hits are limited to: "Add new motion accessibility features to iOS" (S156 L494, PR 178102), predictive-back work (`fallbackColor` for `PredictiveBackPageTransitionBuilder`, S156 L1470; `displayCornerRadii` for predictive back, L1474, PR 181326; FlutterFragment predictive back, L1764), "reduced motion/disable animations on the web" (L1957, PR 180041); in 3.47.0 only tool-side `MotionEvent` log filtering (S157 L2011, L2479). **Finding: Flutter 3.44–3.47 ship no Material 3 Expressive motion-token API** (measured absence in the two release notes; the intermediate 3.45/3.46 notes were not captured — `[gap]`).
- **What exists today, versioned "since Flutter 0.0" by the API index:** `SpringSimulation` / `SpringDescription` in `flutter/physics` (S160 L117, L167); `Curves.easeInOutCubicEmphasized` — the M3 "emphasized" easing — in `flutter/animation` (S161 L1414–L1415); `ThemeData(useMaterial3: …)` (S162 L175–L189). The library index pages S158/S159 are 249/252-byte redirect stubs (canonical `../material/`, `../animation/`) — recorded, not read.
- **Consequence for the directions:** M3 Expressive spring motion must be composed from `SpringSimulation` + `AnimationController.animateWith` (or a package) — there is no first-party token set to import; this is a known, bounded engineering cost, not a blocker.

## G5 — Impeller wide gamut (closed by issue record)

`flutter/flutter#127855` "Implement wide gamut color support in the Framework" is **closed 2024-09-30T16:32:42Z**, locked 2024-10-14 (S164; S165 17 comments, last the auto-lock notice). Together with the master report's F-row this fixes the state as: framework-level `Color` wide-gamut API landed 2024-09; rendering as wide gamut is iOS/Impeller only (per S164/S165 thread; Android status `[UNVERIFIED in this run]`).

## G7 (parent item 4) — repository metadata S12–S14 and the other repos, from GitHub API JSON

| Repo | Licence (API `license.spdx_id`) | Latest release tag / date | Latest tag(s) | Latest commit date | Open issues | Stars | Default branch | Source IDs |
|---|---|---|---|---|---|---|---|---|
| mrdoob/three.js | MIT | r185 / 2026-07-01 | — | pushed_at 2026-09-04 | 379 | 115,141 | dev | S131, S132 |
| pmndrs/react-three-fiber | MIT | v9.7.0 / 2026-07-31 | — | pushed_at 2026-09-04 | 67 | 32,099 | master | S141, S142 |
| greensock/GSAP | **null (no SPDX licence detected by GitHub; GSAP's own licence text is not in the API JSON)** | `/releases/latest` **404** (S144) | 3.15.0, 3.14.2, 3.14.1 (S183) | 13e2b79 / 2026-04-13T13:08:30Z (S189) | 5 | 28,253 | master | S143 |
| motiondivision/motion | MIT | `/releases/latest` **404** (S146) | v13.2.0, v13.1.1 (S184) | pushed_at 2026-09-02 | 108 | 33,493 | main | S145 |
| ryanheise/just_audio | **null** | just_audio-v0.10.6 / 2026-06-29 | — | pushed_at 2026-06-29; `commits?sha=master` **404** (S188, no `master` branch — default is `minor`) | 344 | 1,216 | minor | S133, S134, S182 |
| rive-app/rive-flutter | MIT | 0.8.4 / **2022-03-15** (GitHub releases are stale; tags also stop at 0.8.4, S187) | 0.8.4 | b5f9209 / 2026-09-04T16:46:22Z (S190) | 88 | 1,512 | master | S135, S136 |
| gpuweb/gpuweb | NOASSERTION ("Other") | `/releases/latest` **404** (S138) | WGSLv1 (S185) | pushed_at 2026-09-01 | 456 | 5,466 | main | S137 |
| flutter/flutter | BSD-3-Clause | 3.19.0-0.1.pre / 2024-01-11 (GitHub releases are not the stable channel) | v1.16.3… (tags API is not version-sorted, S186) | pushed_at 2026-09-05T13:26:05Z | 13,110 | 178,783 | master | S139, S140 |

Reading notes: GitHub "latest release" is not a version-of-record for rive-flutter, flutter or GSAP — pub.dev/npm remain the version authorities (as in the master report); GSAP's licence must be read from its own licence page (captured in the master run) because the API reports none.

## G3 (parent item 5) — academic re-probe: Flutter / Impeller / Skia frame-time or jank studies

Queries run (all captured, S191–S196): arXiv `all:"Flutter" AND (all:jank OR all:"frame time" …)` → **totalResults 0** (S191, 846 bytes). arXiv `all:Impeller OR all:Skia AND (all:rendering …)` → 25 entries, **all fluid-dynamics impellers**, 0 relevant (S192). arXiv `"cross-platform" AND mobile AND …` → 4 entries, 0 relevant (S193). Crossref `Flutter cross-platform mobile rendering performance frame…` → 20 items: 17 chapters of one "Advanced Flutter" book (no dates in JSON), 2 comparative RN-vs-Flutter papers in low-tier journals, 1 non-English survey — **0 measured frame-time studies** (S194). OpenAlex `Flutter framework rendering performance frame time` → 607 hits, 20 read: 1 related ("Analyzing the Resource Usage Overhead of Mobile App Development Frameworks", 2023, 12 citations — resource usage, not frame time) (S195). OpenAlex `Skia OR Impeller mobile GPU rendering jank measurement` → 15 hits: "Flutter versus React Native: a case study considering resource consumption, graphical interface aspects…" (2025, institutional repository, 0 citations) and "QUAREM: Maximising QoE Through Adaptive Resource Management in Mobile MPSoC Platforms" (ACM TECS 2022, 14 citations — QoE/frame deadlines, not Flutter) (S196). **Verdict: NOT FOUND** — no peer-reviewed Flutter/Impeller/Skia frame-time or jank measurement study located in arXiv, Crossref or OpenAlex with these six queries; the two nearest items are named above with their limits. The gap stays open and is `[measured absence, six queries]`, not "does not exist".

## Contradiction table — appendix rows

| # | Claim A | Claim B | Resolution |
|---|---|---|---|
| C-A1 | just_audio master README: waveform/FFT visualiser ✅ Android/iOS (S152 L441–L442) | Released 0.10.6 and master `just_audio.dart`: 0 visualiser symbols (S150, S153) | README describes the `visualizer` branch (S197–S203); the shipped package has no visualiser. |
| C-A2 | Apple: Live Activity update "budget" exists (S106 L325) | No numeric value anywhere in the captured Apple text | Budget is real but unquantified by Apple; `apns-priority 5` bypasses it (S106 L330). |
| C-A3 | GitHub `/releases/latest`: rive-flutter 0.8.4 (2022), flutter 3.19.0-0.1.pre (2024) | Commits/pushes in 2026-09 for both (S190, S139) | GitHub releases are not the version authority for these repos; pub.dev is (master report). |

## Claim ledger — appendix additions (verification status)

3+ independent producers: Live Activity 8 h / 12 h / 4 KB / 160 pt limits (Apple .md S104 + Apple JSON S130 + HIG JSON S166 — three Apple documents, one producer; counted as **[single-source official]**, not 3+). Honest count for this appendix: **0 new claims reach 3 independent producers** (all Apple, GitHub, arXiv/Crossref/OpenAlex facts have one authoritative producer each); **[single-source official]**: 31 (Apple limits and API names listed in G1.a–G1.e, the 8 repo rows, the just_audio branch API facts); **[UNVERIFIED]**: 5 (Core Haptics per-parameter numeric ranges; CarPlay list-depth/item limits inside the unread PDF S121; Live Activity button actions via App Intents; Android wide-gamut status; Flutter 3.45/3.46 release notes not captured).

## Gap list — updated

| Gap | Status after this run |
|---|---|
| G1 Apple pages as JS shell | **CLOSED** — 33 `.md` + 5 JSON pages read; mechanism recorded. |
| G2 CarPlay audio-app article 404 | **CLOSED by substitution** — CarPlay root + `CPNowPlayingTemplate` + entitlements pages read; original URL still 404 (S122); programming-guide PDF captured unread (S121). |
| G3 Academic Flutter frame-time | **OPEN — NOT FOUND** after 6 additional queries (S191–S196). |
| G4 M3 Expressive → Flutter | **CLOSED** — no first-party token API in 3.44/3.47; primitives named. 3.45/3.46 notes not captured. |
| G5 Impeller wide gamut | **CLOSED (iOS)** via #127855; Android status open. |
| G6 just_audio visualiser source | **CLOSED** — branch API, native files, README mismatch, issue #97 latest comment recorded. |
| G7 Repos S12–S14 metadata | **CLOSED** — 8 repos tabulated; GSAP licence absent from API. |
| New: G8 Core Haptics parameter ranges | OPEN — per-parameter pages not captured. |
| New: G9 CarPlay PDF unread | OPEN — 20.8 MB PDF captured, 0 pages read. |

## Floor status — re-run (honest)

Capture files on disk with prefix `2026-09-05-apis-`: **201** (97 before this run → 201 after; 104 new rows in the register below, of which 12 are 404/redirect stubs). Authoritative sources (official docs, specs, registries, official repos, API JSON) read at least in part this run: 33 Apple `.md` + 5 Apple JSON + 3 GitHub-raw just_audio files + 26 GitHub API JSON + 2 Flutter release notes + 3 Flutter API pages = 72, added to the master report's count. **Academic floor: unchanged — the five-part records remain the 6 from the master run; this run's academic probe added 0 [FULL] academic primaries** (nothing relevant was found to read). Floors as owner-fixed: ≥20 authoritative **met**; ≥5 academic [FULL] — **met only by the master run's 6**, no addition here.

## Source register — appendix (new captures S101–S204)

| SID | URL | HTTP | bytes | sha256 (first 16) | fetched (UTC) | read status |
|---|---|---|---|---|---|---|
| S101-apple-md-mpnowplayinginfocenter | https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter.md | 200 | 10608 | 641545a9fb146e7f… | 2026-09-05T13:30:33.009Z | FULL |
| S102-apple-md-mpremotecommandcenter | https://developer.apple.com/documentation/mediaplayer/mpremotecommandcenter.md | 200 | 5482 | df47e80d73b063d7… | 2026-09-05T13:30:33.040Z | FULL |
| S103-apple-md-activitykit-root | https://developer.apple.com/documentation/activitykit.md | 200 | 5403 | e01095c2cbdabe54… | 2026-09-05T13:30:33.041Z | NOT READ |
| S104-apple-md-activitykit-displaying-live-data | https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities.md | 200 | 46321 | fbf8601223128230… | 2026-09-05T13:30:33.042Z | FULL |
| S105-apple-md-hig-live-activities | https://developer.apple.com/design/human-interface-guidelines/live-activities.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:30:33.043Z | INACCESSIBLE (404) |
| S106-apple-md-activitykit-push | https://developer.apple.com/documentation/activitykit/starting-and-updating-live-activities-with-activitykit-push-notifications.md | 200 | 32382 | 0f3b9d2ace39f8cb… | 2026-09-05T13:30:33.043Z | PARTIAL |
| S107-apple-md-corehaptics-root | https://developer.apple.com/documentation/corehaptics.md | 200 | 5263 | 8a7863e7f04dd5c5… | 2026-09-05T13:30:33.552Z | NOT READ |
| S108-apple-md-chhapticengine | https://developer.apple.com/documentation/corehaptics/chhapticengine.md | 200 | 9021 | 743ace9b01b1c808… | 2026-09-05T13:30:33.619Z | FULL |
| S109-apple-md-chhapticpattern | https://developer.apple.com/documentation/corehaptics/chhapticpattern.md | 200 | 5136 | 82c58ba7785909b4… | 2026-09-05T13:30:33.629Z | PARTIAL |
| S110-apple-md-chhapticevent | https://developer.apple.com/documentation/corehaptics/chhapticevent.md | 200 | 4711 | a6ba6d3c248884cb… | 2026-09-05T13:30:33.653Z | PARTIAL |
| S111-apple-md-chhapticeventparameter | https://developer.apple.com/documentation/corehaptics/chhapticeventparameter.md | 200 | 3055 | effb568aca75043a… | 2026-09-05T13:30:33.658Z | PARTIAL |
| S112-apple-md-chhapticevent-parameterid | https://developer.apple.com/documentation/corehaptics/chhapticevent/parameterid.md | 200 | 3160 | 51eeef9e21e0ce7b… | 2026-09-05T13:30:33.799Z | PARTIAL |
| S113-apple-md-avaudiosession | https://developer.apple.com/documentation/avfaudio/avaudiosession.md | 200 | 23029 | 6d3cbf4c593a7341… | 2026-09-05T13:30:34.061Z | PARTIAL |
| S114-apple-md-avaudiosession-category | https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct.md | 200 | 4001 | c1b84567850bf8ae… | 2026-09-05T13:30:34.106Z | PARTIAL |
| S115-apple-md-avaudiosession-category-playback | https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/playback.md | 200 | 1827 | 20a036f3b97d1758… | 2026-09-05T13:30:34.115Z | FULL |
| S116-apple-md-configuring-media-playback | https://developer.apple.com/documentation/avfaudio/configuring-your-app-for-media-playback.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:30:34.142Z | INACCESSIBLE (404) |
| S117-apple-md-uibackgroundmodes | https://developer.apple.com/documentation/bundleresources/information-property-list/uibackgroundmodes.md | 200 | 1169 | dd3c3dcbefc8271a… | 2026-09-05T13:30:34.151Z | FULL |
| S118-apple-md-carplay-root | https://developer.apple.com/documentation/carplay.md | 200 | 9386 | f8bef192f5f24125… | 2026-09-05T13:30:34.294Z | PARTIAL |
| S119-apple-md-cpnowplayingtemplate | https://developer.apple.com/documentation/carplay/cpnowplayingtemplate.md | 200 | 5263 | 4cae6164783c4d74… | 2026-09-05T13:30:34.307Z | FULL |
| S120-apple-md-carplay-displaying-content | https://developer.apple.com/documentation/carplay/displaying-content-in-carplay.md | 200 | 7168 | 21aeaa6482f4abc1… | 2026-09-05T13:30:34.343Z | PARTIAL |
| S121-apple-carplay-programming-guide-pdf | https://developer.apple.com/carplay/documentation/CarPlay-App-Programming-Guide.pdf | 200 | 20840702 | 6f1d6e32cd54d342… | 2026-09-05T13:30:34.356Z | NOT READ (20.8 MB PDF captured only) |
| S122-apple-md-carplay-audio-retry | https://developer.apple.com/documentation/carplay/supporting-carplay-in-your-audio-app.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:30:34.558Z | INACCESSIBLE (404) |
| S123-apple-md-hig-carplay | https://developer.apple.com/design/human-interface-guidelines/carplay.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:30:34.727Z | INACCESSIBLE (404) |
| S124-apple-md-hig-playing-haptics | https://developer.apple.com/design/human-interface-guidelines/playing-haptics.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:30:34.795Z | INACCESSIBLE (404) |
| S125-apple-md-activitykit-activity | https://developer.apple.com/documentation/activitykit/activity.md | 200 | 8155 | 9a5a41093fa4b9f8… | 2026-09-05T13:30:34.799Z | PARTIAL |
| S126-apple-md-mpnowplayinginfo-nowplayinginfo | https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter/nowplayinginfo.md | 200 | 1059 | 4821bcba41caa1f2… | 2026-09-05T13:30:34.837Z | FULL |
| S127-apple-md-becoming-now-playable | https://developer.apple.com/documentation/mediaplayer/becoming-a-now-playable-app.md | 200 | 1319 | 6394f9684a22a25c… | 2026-09-05T13:30:34.904Z | FULL |
| S128-apple-md-activityattributes | https://developer.apple.com/documentation/activitykit/activityattributes.md | 200 | 2205 | 2c9f301a832d5ae5… | 2026-09-05T13:30:34.997Z | PARTIAL |
| S129-apple-json-mpnowplayinginfocenter | https://developer.apple.com/tutorials/data/documentation/mediaplayer/mpnowplayinginfocenter.json | 200 | 86406 | b36b2c52c7e45222… | 2026-09-05T13:30:35.165Z | NOT READ (Markdown twin S101 used) |
| S130-apple-json-activitykit-displaying | https://developer.apple.com/tutorials/data/documentation/activitykit/displaying-live-data-with-live-activities.json | 200 | 133106 | 12f424373f9ce9cf… | 2026-09-05T13:30:35.388Z | NOT READ (Markdown twin S104 used) |
| S131-gh-api-threejs-repo | https://api.github.com/repos/mrdoob/three.js | 200 | 5185 | 3182f1e5fd5e60eb… | 2026-09-05T13:30:35.401Z | FULL |
| S132-gh-api-threejs-latest-release | https://api.github.com/repos/mrdoob/three.js/releases/latest | 200 | 26419 | f979cb4aeb7f862a… | 2026-09-05T13:30:35.411Z | FULL |
| S133-gh-api-just-audio-repo | https://api.github.com/repos/ryanheise/just_audio | 200 | 5164 | baced21bee11414d… | 2026-09-05T13:30:35.416Z | FULL |
| S134-gh-api-just-audio-latest-release | https://api.github.com/repos/ryanheise/just_audio/releases/latest | 200 | 1997 | 3b1f2da46cc6183f… | 2026-09-05T13:30:35.611Z | FULL |
| S135-gh-api-rive-flutter-repo | https://api.github.com/repos/rive-app/rive-flutter | 200 | 6475 | 3a7879ddd3e86423… | 2026-09-05T13:30:35.684Z | FULL |
| S136-gh-api-rive-flutter-latest-release | https://api.github.com/repos/rive-app/rive-flutter/releases/latest | 200 | 1903 | 93be98fa9bf84f03… | 2026-09-05T13:30:35.795Z | FULL |
| S137-gh-api-gpuweb-repo | https://api.github.com/repos/gpuweb/gpuweb | 200 | 5987 | 4987ef491e487617… | 2026-09-05T13:30:35.848Z | FULL |
| S138-gh-api-gpuweb-latest-release | https://api.github.com/repos/gpuweb/gpuweb/releases/latest | 404 (JS shell captured) | 130 | d9e37600354c1839… | 2026-09-05T13:30:35.888Z | INACCESSIBLE (404) |
| S139-gh-api-flutter-repo | https://api.github.com/repos/flutter/flutter | 200 | 6647 | 9ffa0e04ce2011b6… | 2026-09-05T13:30:35.928Z | FULL |
| S140-gh-api-flutter-latest-release | https://api.github.com/repos/flutter/flutter/releases/latest | 200 | 55692 | 244c1506c2820719… | 2026-09-05T13:30:35.966Z | FULL |
| S141-gh-api-r3f-repo | https://api.github.com/repos/pmndrs/react-three-fiber | 200 | 6541 | 804df1fe0b6249fd… | 2026-09-05T13:30:36.048Z | FULL |
| S142-gh-api-r3f-latest-release | https://api.github.com/repos/pmndrs/react-three-fiber/releases/latest | 200 | 6143 | e299153e4f93eacf… | 2026-09-05T13:30:36.080Z | FULL |
| S143-gh-api-gsap-repo | https://api.github.com/repos/greensock/GSAP | 200 | 6074 | f2890de828ec6aab… | 2026-09-05T13:30:36.098Z | FULL |
| S144-gh-api-gsap-latest-release | https://api.github.com/repos/greensock/GSAP/releases/latest | 404 (JS shell captured) | 130 | d9e37600354c1839… | 2026-09-05T13:30:36.192Z | INACCESSIBLE (404) |
| S145-gh-api-motion-repo | https://api.github.com/repos/motiondivision/motion | 200 | 6622 | a4fcc07788b789ff… | 2026-09-05T13:30:36.274Z | FULL |
| S146-gh-api-motion-latest-release | https://api.github.com/repos/motiondivision/motion/releases/latest | 404 (JS shell captured) | 130 | d9e37600354c1839… | 2026-09-05T13:30:36.347Z | INACCESSIBLE (404) |
| S147-gh-api-just-audio-issue-97 | https://api.github.com/repos/ryanheise/just_audio/issues/97 | 200 | 5179 | 5645a8dd8bfb8155… | 2026-09-05T13:30:36.397Z | FULL |
| S148-gh-api-just-audio-issue-97-comments-p1 | https://api.github.com/repos/ryanheise/just_audio/issues/97/comments?per_page=100&page=1 | 200 | 215832 | eccd584aab170886… | 2026-09-05T13:30:36.398Z | PARTIAL (dates/authors scanned, latest read) |
| S149-gh-api-just-audio-issue-97-comments-p2 | https://api.github.com/repos/ryanheise/just_audio/issues/97/comments?per_page=100&page=2 | 200 | 6357 | 7a4837983501bbff… | 2026-09-05T13:30:36.503Z | FULL |
| S150-pub-archive-just-audio-0-10-6 | https://pub.dev/api/archives/just_audio-0.10.6.tar.gz | 200 | 323292 | e60aa97b233ddea0… | 2026-09-05T13:30:36.562Z | PARTIAL (README, pubspec, lib/just_audio.dart scanned) |
| S151-gh-api-just-audio-tags | https://api.github.com/repos/ryanheise/just_audio/tags?per_page=30 | 200 | 13140 | 0afd417b0ddffc92… | 2026-09-05T13:30:36.610Z | PARTIAL |
| S152-gh-raw-just-audio-readme-master | https://raw.githubusercontent.com/ryanheise/just_audio/master/just_audio/README.md | 200 | 29275 | 0bf843ab64b43233… | 2026-09-05T13:30:36.640Z | PARTIAL (visualizer rows) |
| S153-gh-raw-just-audio-lib-master | https://raw.githubusercontent.com/ryanheise/just_audio/master/just_audio/lib/just_audio.dart | 200 | 167191 | 4c806e95ecdcf61f… | 2026-09-05T13:30:36.765Z | PARTIAL (symbol scan) |
| S154-gh-raw-just-audio-platform-interface-master | https://raw.githubusercontent.com/ryanheise/just_audio/master/just_audio_platform_interface/lib/just_audio_platform_interface.dart | 200 | 50506 | 776c69612f72fbef… | 2026-09-05T13:30:36.923Z | PARTIAL (symbol scan) |
| S155-gh-raw-just-audio-method-channel-master | https://raw.githubusercontent.com/ryanheise/just_audio/master/just_audio_platform_interface/lib/method_channel_just_audio.dart | 200 | 8707 | 5af173cc07bb2a58… | 2026-09-05T13:30:37.092Z | PARTIAL (symbol scan) |
| S156-flutter-release-notes-3-44 | https://docs.flutter.dev/release/release-notes/release-notes-3.44.0 | 200 | 341669 | 1bd41ae53b580919… | 2026-09-05T13:30:37.094Z | PARTIAL (keyword scan) |
| S157-flutter-release-notes-3-47 | https://docs.flutter.dev/release/release-notes/release-notes-3.47.0 | 200 | 338152 | 23e7dee90fe5a798… | 2026-09-05T13:30:37.187Z | PARTIAL (keyword scan) |
| S158-flutter-api-material-library | https://api.flutter.dev/flutter/material/material-library.html | 200 | 249 | e47fedf895b7ffaf… | 2026-09-05T13:30:37.305Z | NOT READ |
| S159-flutter-api-animation-library | https://api.flutter.dev/flutter/animation/animation-library.html | 200 | 252 | 258fbf1855de13d3… | 2026-09-05T13:30:37.321Z | NOT READ |
| S160-flutter-api-spring-simulation | https://api.flutter.dev/flutter/physics/SpringSimulation-class.html | 200 | 15986 | 1fe3b248fe1ae9a1… | 2026-09-05T13:30:37.333Z | PARTIAL |
| S161-flutter-api-curves | https://api.flutter.dev/flutter/animation/Curves-class.html | 200 | 77134 | 18a25bce0dd8ac87… | 2026-09-05T13:30:37.423Z | PARTIAL |
| S162-flutter-api-themedata | https://api.flutter.dev/flutter/material/ThemeData-class.html | 200 | 123620 | 453a775d548e4159… | 2026-09-05T13:30:37.554Z | PARTIAL |
| S163-flutter-wide-gamut-doc | https://docs.flutter.dev/platform-integration/ios/wide-gamut | 404 (JS shell captured) | 125774 | 8c3d169a55b8ced5… | 2026-09-05T13:30:37.555Z | INACCESSIBLE (404) |
| S164-flutter-issue-127855-json | https://api.github.com/repos/flutter/flutter/issues/127855 | 200 | 5754 | de9a19a10e2da131… | 2026-09-05T13:30:37.648Z | FULL |
| S165-flutter-issue-127855-comments | https://api.github.com/repos/flutter/flutter/issues/127855/comments?per_page=100 | 200 | 41164 | 188957c58b0f80e8… | 2026-09-05T13:30:37.650Z | FULL |
| S166-apple-json-hig-live-activities | https://developer.apple.com/tutorials/data/design/human-interface-guidelines/live-activities.json | 200 | 98950 | f9b894e9a5044d01… | 2026-09-05T13:31:22.832Z | FULL (flattened DocC JSON) |
| S167-apple-json-hig-playing-haptics | https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json | 200 | 51525 | 68bab380a07eff7a… | 2026-09-05T13:31:22.869Z | PARTIAL (flattened DocC JSON) |
| S168-apple-json-hig-carplay | https://developer.apple.com/tutorials/data/design/human-interface-guidelines/carplay.json | 200 | 22865 | ad82dc60d7179fdb… | 2026-09-05T13:31:22.870Z | NOT READ |
| S169-apple-md-hig-components-live-activities | https://developer.apple.com/design/human-interface-guidelines/components/system-experiences/live-activities.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:31:22.871Z | INACCESSIBLE (404) |
| S170-apple-md-activity-request | https://developer.apple.com/documentation/activitykit/activity/request(attributes:content:pushtype:).md | 200 | 4139 | 880a61b1701fbc24… | 2026-09-05T13:31:22.871Z | NOT READ |
| S171-apple-md-chhapticengine-notifywhenplayersfinished | https://developer.apple.com/documentation/corehaptics/chhapticengine/capabilitiesforhardware().md | 200 | 1011 | 5e9699b08d190c5e… | 2026-09-05T13:31:22.872Z | NOT READ |
| S172-apple-md-chhapticdevicecapability | https://developer.apple.com/documentation/corehaptics/chhapticdevicecapability.md | 200 | 1747 | b284242fc462dea0… | 2026-09-05T13:31:23.166Z | FULL |
| S173-apple-md-chhapticpattern-init-events | https://developer.apple.com/documentation/corehaptics/chhapticpattern/init(events:parameters:).md | 200 | 1190 | 5e75fce718399b25… | 2026-09-05T13:31:23.434Z | NOT READ |
| S174-apple-md-chhapticdynamicparameter | https://developer.apple.com/documentation/corehaptics/chhapticdynamicparameter.md | 200 | 3123 | a2dc9f07306fef35… | 2026-09-05T13:31:23.446Z | FULL |
| S175-apple-md-chhapticparametercurve | https://developer.apple.com/documentation/corehaptics/chhapticparametercurve.md | 200 | 3122 | 3ed027428c9524e1… | 2026-09-05T13:31:23.449Z | FULL |
| S176-apple-md-avaudiosession-category-swift-struct | https://developer.apple.com/documentation/avfaudio/avaudiosession/category.md | 404 (JS shell captured) | 15658 | 256d5e439d8c8047… | 2026-09-05T13:31:23.468Z | INACCESSIBLE (404) |
| S177-apple-md-carplay-cplisttemplate | https://developer.apple.com/documentation/carplay/cplisttemplate.md | 200 | 7607 | 56f7b84c32d48e4e… | 2026-09-05T13:31:23.633Z | NOT READ |
| S178-apple-md-carplay-cptabbartemplate | https://developer.apple.com/documentation/carplay/cptabbartemplate.md | 200 | 4912 | 28df5e0e8679b537… | 2026-09-05T13:31:23.748Z | NOT READ |
| S179-apple-md-carplay-requesting-entitlements | https://developer.apple.com/documentation/carplay/requesting-carplay-entitlements.md | 200 | 5125 | e173db83d45aea43… | 2026-09-05T13:31:23.788Z | FULL |
| S180-apple-md-chhapticengine-start | https://developer.apple.com/documentation/corehaptics/chhapticengine/start().md | 200 | 1023 | 66f878d7dbf6b32f… | 2026-09-05T13:31:23.888Z | NOT READ |
| S181-apple-md-uibackgroundmodes-audio | https://developer.apple.com/documentation/xcode/configuring-background-execution-modes.md | 200 | 9707 | c953845989ba4929… | 2026-09-05T13:31:23.915Z | PARTIAL |
| S182-gh-api-just-audio-branches | https://api.github.com/repos/ryanheise/just_audio/branches?per_page=100 | 200 | 1032 | 80a91af596abc12c… | 2026-09-05T13:35:36.453Z | FULL |
| S183-gh-api-gsap-tags | https://api.github.com/repos/greensock/GSAP/tags?per_page=5 | 200 | 2011 | 4f24f752fd2dc5c2… | 2026-09-05T13:35:36.482Z | FULL |
| S184-gh-api-motion-tags | https://api.github.com/repos/motiondivision/motion/tags?per_page=5 | 200 | 2187 | 4849857fbfae54d9… | 2026-09-05T13:35:36.483Z | FULL |
| S185-gh-api-gpuweb-tags | https://api.github.com/repos/gpuweb/gpuweb/tags?per_page=5 | 200 | 404 | 0c0b13d327bf32e8… | 2026-09-05T13:35:36.483Z | FULL |
| S186-gh-api-flutter-tags | https://api.github.com/repos/flutter/flutter/tags?per_page=10 | 200 | 4139 | 96be599d31311d07… | 2026-09-05T13:35:36.484Z | FULL |
| S187-gh-api-rive-flutter-tags | https://api.github.com/repos/rive-app/rive-flutter/tags?per_page=5 | 200 | 2121 | 36425deaf645702e… | 2026-09-05T13:35:36.484Z | FULL |
| S188-gh-api-just-audio-commits-master | https://api.github.com/repos/ryanheise/just_audio/commits?sha=master&per_page=1 | 404 (JS shell captured) | 118 | 60e109409399f697… | 2026-09-05T13:35:36.784Z | INACCESSIBLE (404) |
| S189-gh-api-gsap-commits | https://api.github.com/repos/greensock/GSAP/commits?per_page=1 | 200 | 10097 | 833dcefca1982e19… | 2026-09-05T13:35:36.789Z | FULL |
| S190-gh-api-rive-flutter-commits | https://api.github.com/repos/rive-app/rive-flutter/commits?per_page=1 | 200 | 47199 | 9e4abc890107b3fc… | 2026-09-05T13:35:36.789Z | FULL |
| S191-arxiv-flutter-jank | https://export.arxiv.org/api/query?search_query=all:%22Flutter%22+AND+(all:jank+OR+all:%22frame+time%22+OR+all:%22rendering+performance%22)&max_results=25 | 200 | 846 | 81ee7b6c621ca81d… | 2026-09-05T13:35:36.790Z | FULL |
| S192-arxiv-impeller-skia | https://export.arxiv.org/api/query?search_query=all:Impeller+OR+all:Skia+AND+(all:rendering+OR+all:%22frame+rate%22)&max_results=25 | 200 | 56639 | b961243b392a5f2f… | 2026-09-05T13:35:36.792Z | FULL (titles) |
| S193-arxiv-cross-platform-mobile-perf | https://export.arxiv.org/api/query?search_query=all:%22cross-platform%22+AND+all:mobile+AND+(all:Flutter+OR+all:%22React+Native%22)+AND+all:performance&max_results=25 | 200 | 11848 | d37e481695e4d94d… | 2026-09-05T13:35:36.822Z | FULL (titles) |
| S194-crossref-flutter-performance | https://api.crossref.org/works?query=Flutter+cross-platform+mobile+rendering+performance+frame+jank&filter=from-pub-date:2022-01-01&rows=20&select=DOI,title,container-title,published,author | 200 | 7015 | 43d6a59d0dad6792… | 2026-09-05T13:35:36.998Z | FULL (titles) |
| S195-openalex-flutter-performance | https://api.openalex.org/works?search=Flutter%20framework%20rendering%20performance%20frame%20time&filter=publication_year:2022-2026&per-page=20&select=id,doi,title,publication_year,primary_location,cited_by_count | 200 | 22649 | e34e17a4b6f08cbd… | 2026-09-05T13:35:37.031Z | FULL (titles) |
| S196-openalex-skia-impeller | https://api.openalex.org/works?search=Skia%20OR%20Impeller%20mobile%20GPU%20rendering%20jank%20measurement&filter=publication_year:2022-2026&per-page=20&select=id,doi,title,publication_year,primary_location,cited_by_count | 200 | 16259 | 7b9a125f826bb04e… | 2026-09-05T13:35:37.043Z | FULL (titles) |
| S197-gh-api-just-audio-branch-visualizer | https://api.github.com/repos/ryanheise/just_audio/branches/visualizer | 200 | 3973 | 801fab0348bfe2c8… | 2026-09-05T13:36:50.006Z | FULL |
| S198-gh-raw-just-audio-visualizer-lib | https://raw.githubusercontent.com/ryanheise/just_audio/visualizer/just_audio/lib/just_audio.dart | 200 | 172607 | ef0e65356759ad65… | 2026-09-05T13:36:50.083Z | PARTIAL (visualizer API region read) |
| S199-gh-raw-just-audio-visualizer-platform-interface | https://raw.githubusercontent.com/ryanheise/just_audio/visualizer/just_audio_platform_interface/lib/just_audio_platform_interface.dart | 200 | 53177 | 4e6f8ea257639004… | 2026-09-05T13:36:50.085Z | PARTIAL (visualizer API region read) |
| S200-gh-raw-just-audio-visualizer-method-channel | https://raw.githubusercontent.com/ryanheise/just_audio/visualizer/just_audio_platform_interface/lib/method_channel_just_audio.dart | 200 | 9988 | 16c6dd9ffeecc036… | 2026-09-05T13:36:50.086Z | PARTIAL (visualizer API region read) |
| S201-gh-raw-just-audio-visualizer-readme | https://raw.githubusercontent.com/ryanheise/just_audio/visualizer/just_audio/README.md | 200 | 29429 | f858026c2faba08e… | 2026-09-05T13:36:50.087Z | PARTIAL (visualizer rows + permission section) |
| S202-gh-raw-just-audio-visualizer-pubspec | https://raw.githubusercontent.com/ryanheise/just_audio/visualizer/just_audio/pubspec.yaml | 200 | 1331 | b978629fc6ca1f9b… | 2026-09-05T13:36:50.088Z | FULL |
| S203-gh-api-just-audio-compare-minor-visualizer | https://api.github.com/repos/ryanheise/just_audio/compare/minor...visualizer | 200 | 487004 | 53d6acb3598edc12… | 2026-09-05T13:36:50.462Z | PARTIAL (file list read) |
| S204-gh-api-just-audio-commits-minor | https://api.github.com/repos/ryanheise/just_audio/commits?sha=minor&per_page=1 | 200 | 3556 | 136e1b4f74d58f9a… | 2026-09-05T13:36:50.485Z | FULL |
