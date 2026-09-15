# Standards ledger

| Governing standard | How this run satisfies it | Status |
| --- | --- | --- |
| Berk deep-research covenant (`C:\Users\berke\.claude\skills\deep-research\SKILL.md`, COVENANT_SHA256 given in brief: `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB`) | Read from disk this session (PART I + PART II R0–R18); executed as delegated MODE B slice | READ, ACKNOWLEDGED |
| R1.1 Law Zero / R10 claim verification | Every load-bearing claim cites sources opened in this run; `[single-source]` flags used | APPLIED |
| R8.2 read-status vocabulary | `[FULL]`/`[ABS]`/`[PARTIAL]` marked honestly in the source register | APPLIED |
| R15.1 naming/paths | This file: `docs/research/2026-08-29-dark-adaptive-player-ui-knowledge.md` (project convention confirmed by listing `docs/research/` this session) | APPLIED |
| Project design contract (per brief) | This report contains KNOWLEDGE only; every aesthetic CHOICE is written as OWNER-DECISION, never pre-filled | APPLIED (see OWNER-DECISION register) |
| Slice floor (per parent's explicit allocation) | ≥6 independent authoritative sources; counts reported in Completion audit | MET (see counts) |

Delegation note: this is a worker slice of a parent MODE B research order. The parent holds the run-level ≥20-source floor across slices; the parent explicitly set this slice's floor at ≥6 independent authoritative sources (R12.3 CONTEXT-12 allocation). Preflight/scope-gate artifacts for the run are the parent's duty; this report carries the slice's own query, source, claim, and contradiction ledgers.

# Scope plan / decision served / why / project context

- **Decision served:** Berk ordered a BLACK, ultra-quality, adaptive (web/PC/tablet) interface for the PlayMusicPrompts simple-user player. This slice supplies the verifiable knowledge floor (standards, evidence, platform facts) so the build phase makes no unverified claims.
- **Project:** PlayMusicPrompts.com — prompt-to-music real-time player: prompt field, genre chips, era/scene stations, vocal options, playback with skip. Tracks generate in ~60 s median (measured by the project). Next.js/React/Tailwind stack exists at `c:\Berk\PlayMusicPrompts\web` (light marketing pages built 2026-08-24); the player is a new dark surface.
- **Slice scope (not narrowed):** (1) dark-surface standards (WCAG 2.2 exact SCs, Material dark theme, Apple HIG dark mode, halation/astigmatism evidence, OLED power facts); (2) dark media-player craft (Spotify, YouTube Music, Tidal documented facts); (3) adaptive layout (reflow 320px, target size 24×24, pointer vs touch, container queries 2026); (4) generation-latency UX (NN/g thresholds, progress-indicator research, newer generative-AI waiting work); (5) web audio playback facts (gapless/crossfade, Web Audio API / HTMLMediaElement, autoplay policy).
- **Falsifiers:** a newer WCAG version superseding 2.2 SC numbers; primary evidence that pure #000 is required or forbidden by a standard (none exists — it is guidance, not law); browser support changes to container queries or MSE.
- **Date executed:** 2026-08-29. All retrievals dated 2026-08-29 (Europe/Istanbul).

# Outcome first

The hard constraints for a black adaptive player are: WCAG 2.2 (Level AA) SC 1.4.3 text contrast ≥4.5:1 (≥3:1 large text), SC 1.4.11 non-text contrast ≥3:1, SC 1.4.10 reflow at 320 CSS px, SC 2.5.8 targets ≥24×24 CSS px (AAA 2.5.5: 44×44). The strongest craft evidence says: near-black surfaces (not blinding-white text on them), desaturated accents, lightness-encoded elevation, latency honesty with a determinate progress indicator for the ~60 s generation wait, and Web Audio API (not bare `<audio>`) if gapless/crossfade is wanted. Every hex value, type choice, and spacing value remains OWNER-DECISION.

# Findings by subquestion

## 1. Dark-surface standards

### 1.1 WCAG 2.2 — exact success criteria (hard law for the surface)

WCAG 2.2 is a W3C Recommendation first published 5 October 2023, with a minor editorial update published 12 December 2024 that changed no success criteria (S1, S2, S24). SC text below was verified against the W3C TR text and the current W3C Understanding pages opened this run (S1, S3, S4, S5).

- **SC 1.4.3 Contrast (Minimum), Level AA:** text and images of text ≥ **4.5:1**; large text (≥18pt regular or ≥14pt bold) ≥ **3:1**. Incidental/decorative text and logotypes are exempt (S1, S3). The rationale chain in the Understanding doc: 3:1 is the minimum for standard observers; 20/40 vision ≈ 1.5× contrast-sensitivity loss → 4.5:1; 20/80 → ~7:1 for SC 1.4.6 (S3).
- **SC 1.4.6 Contrast (Enhanced), Level AAA:** ≥ **7:1** normal text, ≥ **4.5:1** large text (S1; technique G17, S6).
- **SC 1.4.11 Non-text Contrast, Level AA:** UI components (their visual boundary and required state indicators such as selected/focused) and meaningful graphics ≥ **3:1** against adjacent colors; **inactive components are exempt** (S4). Directly governs the player's chips, sliders, progress bar, and icon buttons on black.
- **Polarity symmetry fact:** the WCAG contrast ratio formula (L1+0.05)/(L2+0.05) is symmetric — a pair passing on light backgrounds passes numerically on dark. WCAG 2.x therefore does not penalize dark mode numerically; perceptual differences by polarity are real but live outside the 2.x formula (S3 definition text; corroborated by S7; the polarity-aware APCA model exists but is not part of any W3C Recommendation as of this run — see contradiction ledger C1).
- **SC 1.4.8 Visual Presentation (AAA)** and **SC 1.4.13 Content on Hover or Focus (AA)** also touch text presentation and hover-reveal controls (S1) — relevant if the player reveals controls on hover.

### 1.2 Material Design dark theme (Google, first-party)

From the official Material Components dark-theme documentation read in full this run (S8) and Android Developers color guidance (S9, S10):

- Baseline Material dark backgrounds/surfaces are **dark grey instead of black**, stated reasons: **increases visibility for shadows and reduces eye strain for light text** (S8).
- Shadows are less effective on dark; Material compensates by making surfaces **lighter and more colorful at higher elevations** — historically via semi-transparent `colorPrimary` **elevation overlays** whose alpha rises with elevation; in Material 3 this is **replaced by the tonal surface color system** (`surfaceContainerLow/Container/ContainerHigh` etc.) (S8, S9).
- Accents in dark themes should be **less saturated, more luminous tones** (M2 guidance: ~tone 200 instead of 500), and must keep ≥4.5:1 against every used elevation surface (S10 — official Android Developers publication; corroborates S9).
- The legacy M2 dark-theme spec values widely cited (#121212 base; 15.8:1 recommended contrast for white body text on the darkest surface) could **not** be re-verified against material.io this run (m2.material.io requires JavaScript; archive fetch timed out). They appear in secondary sources (S11) — marked **[single-source-class: secondary]** for the exact numbers; the *direction* (dark grey base, desaturated accents) is triple-verified via S8, S9, S10.

### 1.3 Apple HIG dark mode (first-party)

- Apple's Dark Mode palette uses **dimmer backgrounds and brighter foregrounds**, with **two sets of background colors: base and elevated**; elevated colors are brighter to make layered dark interfaces (popovers, modals) visually advance (S12 — HIG page; S13 — WWDC19 session transcript read in full).
- Unlike Material, Apple's **base system background in Dark Mode is pure black** (`systemBackground`), with elevated levels lighter (S13: "pure black in dark mode"; S12). So the two dominant first-party systems disagree on pure #000 — preserved as contradiction C2, decision is owner's.
- Apple recommends **semantic/system colors** (label, secondaryLabel, systemBackground…) that adapt to appearance, elevation, and contrast settings, and **vibrancy** for legibility on materials (S12, S13).

### 1.4 Halation / astigmatism / polarity evidence (peer-reviewed)

- **Piepenbrock, Mayr, Mund & Buchner, *Ergonomics* 2013** [FULL, academic]: 2×2 between-subjects, N=169 (85 older 60–85y, 84 younger 18–33y). Visual acuity and proofreading were both better in **positive polarity** (dark-on-light) for both age groups: acuity polarity effect F(1,163)=69.31, p<.01, η²=0.30; younger d=2.17, older d=0.58 (S14). Authors recommend positive polarity for all ages; mechanism attributed to higher display luminance.
- **Piepenbrock, Mayr & Buchner, *Ergonomics* 2014** [FULL, academic]: pupil size was smaller (2.09 mm vs 3.65 mm eye-position illuminance 118.4 lx vs 2.7 lx), and proofreading better, in positive polarity — t(34)=−17.49 (pupil), t(34)=4.54 (accuracy), supporting the **display-luminance hypothesis**: brighter screens → smaller pupils → sharper retinal image (S15).
- **Halation for astigmatic users:** widely reported that light-on-dark produces glow/blur ("halation") for people with astigmatism (~one-third to ~50% of adults depending on source), because dark displays dilate the pupil and expose lens irregularities (S16, S17, S18 — practitioner/secondary sources citing Harrison/UBC 2002 and the polarity literature). No single peer-reviewed study directly on "dark mode × astigmatism" was found in this slice — the mechanism claim rests on the polarity primaries (S14, S15) plus practitioner synthesis; marked honestly: **mechanism [3-source verified], astigmatism-specific magnitude [UNVERIFIED]**.
- **Design implication as knowledge (not choice):** the evidence favors *avoiding maximum-contrast pure-white-on-pure-black body text* and *offering user control* (dark as option/default with adequate but not extreme contrast) (S14, S15, S16, S18). Whether the player uses pure black, near-black, or offers a light toggle is OWNER-DECISION.

### 1.5 OLED power facts (peer-reviewed + first-party university)

- **Dash & Hu, MobiSys 2021** (ACM, Purdue; per-frame OLED power profiler; measured Pixel 2/4/5, Moto Z3): switching light→dark saves **39–47% of phone power at 100% brightness**, but only **3–9% at 30–50% brightness** (typical indoor auto-brightness). OLED displays consumed 44–73% of total phone power in light mode at max brightness (S19 — Purdue ECE release; S20 — the team's US patent 11763742 full text, read this run; S21 — publication metadata; S22 — secondary corroboration). Claim status: 3-source family-independent (university news + patent + secondary), values consistent across all.
- The patent text also documents that modern OLED power **violates superposition and monotonicity** assumed by older linear models (S20) — i.e., naive "darker pixel = proportionally less power" reasoning is unreliable at component level.
- **YouTube's team noted** that true black (#000000) turns OLED pixels fully off, and cited a perceptible latency/smearing artifact when scrolling from off pixels as a reason their "deep black" is not exactly true black (S23 — Fast Company interview with YouTube designers). **[single-source]** for the scroll-latency mechanism.

## 2. Dark media-player craft (documented facts, not memory)

- **Spotify / Encore:** Spotify's design system family "Encore" (introduced 2019; Encore Foundation holds color/type/motion/spacing tokens; Encore Web for web platforms) is documented first-party on Spotify Design (S25) and in a Figma interview (S26). The signature dark experience dates to the 2013 cross-platform alignment (S25). Third-party teardowns of the shipped web client document the near-black neutral ramp `#121212` (base) / `#181818` (cards) / `#1f1f1f` (interactive fills), the single functional green accent `#1ed760`, pill/circular controls, and album-art-as-hero color logic (S27, S28) — **[PARTIAL, third-party]**: treat the exact hexes as observed-implementation facts, not Spotify-published tokens.
- **Rationale pattern documented across sources:** album art is the hero, so the UI is achromatic dark and accent color is reserved for function; long listening sessions motivate dark surfaces (S27, S28). Knowledge only — adoption is OWNER-DECISION.
- **YouTube (and YouTube Music context):** YouTube's 2022 redesign made dark mode a **deeper black** explicitly to exploit the **Bartleson–Breneman effect** (perceived image contrast rises as surround darkens — the "TV in a dark room" effect), and added **Ambient Mode**, a blurred color-bleed from the video/art into the surrounding dark UI (S29 — official YouTube blog; S23 — Fast Company interview naming the effect). The blog is first-party for the design intent; the effect naming is corroborated by both.
- **Tidal:** official brand guidance: **black is the primary color**, white for contrast, **cyan #00FFFF only as active-state accent on dark**, white-on-black as the primary art direction; logo white-on-black (S30 — Tidal brand book PDF; S31 — developer.tidal.com design guidelines). First-party.
- Common structural fact across all three (from the first-party and teardown documents above): dark player surfaces encode hierarchy by **lightness steps of neutral surfaces + one functional accent + content-derived color**, not by shadows (shadows are documented as weak on dark: S8).

## 3. Adaptive layout for web/PC/tablet

### 3.1 WCAG 2.2 layout-relevant SCs (hard law)

- **SC 1.4.10 Reflow (AA):** content must present without loss of information/functionality and without two-dimensional scrolling at **320 CSS px width** (equivalent to 1280 px at 400% zoom); horizontal-scroll content at 256 CSS px height. Exceptions: parts requiring 2-D layout (maps, data tables, toolbars-in-view interfaces) (S1, S5-family). The player page must therefore fully reflow to 320 px — this is a testable gate, not advice.
- **SC 2.5.8 Target Size (Minimum), AA — new in 2.2:** pointer targets ≥ **24×24 CSS px**, with exceptions: spacing (24 px circle test on undersized targets), equivalent control, inline text, user-agent control, essential. A solid 24×24 square must fit inside the target (S5). Sliders/spatial pickers count as one target (S5-family).
- **SC 2.5.5 Target Size (Enhanced), AAA:** **44×44 CSS px** (S1, S32). Practitioner guidance: use 44×44 for frequent controls (play/skip) rather than relying on the 24 px minimum (S32 — secondary).
- **Pointer vs touch:** WCAG 2.2's related input SCs — 2.5.7 Dragging Movements (AA: single-pointer non-drag alternative), 1.3.4 Orientation (AA: no locked orientation), 1.4.4 Resize Text (200%) (S1, S32). A seek-bar drag therefore needs a non-drag alternative (e.g., tap-to-seek or buttons).

### 3.2 Container queries — state of support (2026)

- **Size container queries** (`container-type: inline-size|size`, `@container (min-width…)`, plus `cqi/cqw…` units) are **Baseline "widely available" — supported across browsers since February 2023** (S33, S34 — MDN, read this run).
- **Style queries for custom properties** completed cross-browser availability only in **August 2026**: Chrome/Edge 111+, Safari 18+, and Firefox **151** (release-noted; Interop-2026 pass rate 97.2% reported by Mozilla) — global usage ~90% at retrieval (S35 — caniuse table; S36 — Mozilla Bugzilla 2030645). Querying non-custom-property declarations remains unsupported (S35).
- Consequence (knowledge): a 2026 player can safely build its adaptive component logic on **size container queries** instead of viewport media queries alone; style queries are newly usable but the freshest layer (freshness horizon noted in watchlist). Breakpoint values themselves are OWNER-DECISION; the only standard-imposed breakpoint fact is the 320 px reflow floor (S1).

## 4. Generation-latency UX (~60 s median wait)

### 4.1 Response-time thresholds (NN/g, primary UX authority)

- The three limits (Nielsen 1993, derived from Miller 1968; restated unchanged by NN/g and by Nielsen 2025): **0.1 s** feels instantaneous (direct manipulation); **1 s** keeps flow of thought (delay noticed but user stays in control); **10 s** is the attention limit — beyond it users task-switch and need percent-done feedback plus a way to interrupt (S37, S38, S39, S40). Triple-verified across four NN/g/UX-Tigers primaries.
- **Progress indicator selection rules** (NN/g + Nielsen 2026 update): any action >~1 s gets an indicator; **looped/indeterminate spinner only for 2–10 s**; **percent-done (determinate) indicator for ≥10 s**, ideally with an honest, rounded, slightly padded time estimate that finishes early; never let the bar stall, lie, or reset; delay spinner onset ~1 s so fast operations never flash one (S40, S41). Because PlayMusicPrompts generation is ~60 s median, the standards-backed pattern is a **determinate/progress-staged indicator with time expectation and an interrupt path** — the specific visual form is OWNER-DECISION.
- **Skeleton screens:** evidence is mixed and NN/g/Nielsen scope them narrowly — reserve skeletons for **familiar, content-shaped loads of ~≤3 s** whose placeholder matches the arriving layout; one cited study found skeletons perceived fastest, another (Viget, 136 mobile users) found skeletons perceived *slowest* (2.82 s vs 2.41 spinner vs 2.29 blank) (S41 — which cites both; contradiction preserved as C3). A 60 s generation wait is **not** a skeleton use case per this guidance.

### 4.2 Waiting UX for generative AI (newer primary work)

- **CHI-track 2026 controlled experiment** (arXiv:2604.06183 / ACM DOI 10.1145/3772318.3790716) [FULL, academic]: 3 latency levels (2/9/20 s TTFT) × 2 task types, N=240 (a-priori powered), custom GPT-4o interface, streaming fixed at 25 tokens/s. Behaviors were robust to latency, but **2 s responses were rated less thoughtful and less useful than 9–20 s responses** (Thoughtfulness 2 s<9 s p<.01, 2 s<20 s p<.05; Usefulness 9 s>2 s p<.05); participants attributed delay to "AI deliberation," flipping to frustration/reliability doubt at long waits. Authors: latency is a **tunable design variable**, not purely a cost (S42). Limitation (authors'): crowdsourced knowledge tasks, fixed streaming rate; music generation is not directly tested — application to a 60 s music wait is an inference, marked as such.
- **OpenAI latency guide** (first-party, developer docs): streaming is "the single most effective approach" to perceived latency; show real steps/progress; loading states are psychological but streaming/chunking genuinely shortens the user+app system time (S43). For audio generation the analog is staged progress (queued → composing → rendering → ready) and, where the backend permits, early audio start.
- Synthesis fact for the build (knowledge, not choice): the ~60 s wait sits far beyond the 10 s attention limit, so the standards-and-evidence-backed floor is: determinate progress with honest stages and time estimate, interruptibility (skip/cancel), and the ability to keep browsing/queueing during generation (S37–S43).

## 5. Audio playback on the web (2026 facts)

- **Autoplay policy (MDN, first-party):** audible playback started without user interaction is blocked by browser autoplay policies; playback is generally allowed only if muted, after user interaction, via allowlist, or via the `autoplay` Permissions Policy. `HTMLMediaElement.play()` returns a Promise that rejects with `NotAllowedError` when blocked; `Navigator.getAutoplayPolicy()` can be queried; Web Audio `AudioContext` start is subject to the same rules (S44 — read in full). Consequence: the player must start audio from a user gesture and handle the rejected-play path.
- **Gapless playback is NOT native to plain `<audio>`/HTMLMediaElement across tracks:** MP3/AAC encoders insert padding/priming samples at file boundaries (LAME: e.g., 576 pad samples; AAC default priming 2112), producing audible gaps between consecutive files (S45 — Chrome/web.dev article, read in full). Two documented remedies:
  1. **Media Source Extensions (MSE):** append segments into one `SourceBuffer`, trimming padding via `appendWindowStart/End` + negative `timestampOffset`; frame-accurate splicing is implemented in Chromium but is **non-normative in the W3C MSE spec** and historically inconsistent in Firefox (S45; S46 — W3C Media WG minutes 2022-11-08; S47 — Mozilla bug 1222851). Production players (e.g., the pattern "how YouTube Music/SoundCloud handle background audio on Chrome Android") use a persistent MSE `SourceBuffer` in sequence mode with pre-fetch of the next track (S48 — **[single-source, community]**).
  2. **Web Audio API:** decode to `AudioBuffer`s and schedule `AudioBufferSourceNode.start(t)` at exact cumulative times — sample-accurate by design; buffers' sample rate should match the `AudioContext` rate to avoid resampling-induced gaps (S49 — MDN; S50 — whatwg thread incl. roc/O'Callahan; S51 — Stack Overflow corroboration). MDN: `AudioBufferSourceNode` is for stringent-timing in-memory audio; nodes are one-shot and cheap (S49).
- **Crossfade:** no declarative crossfade exists in HTMLMediaElement; the documented approaches are two overlapping sources with `GainNode` ramps (Web Audio) — MSE's spec-described audio splice cross-fade was **removed from Chromium** (truncation instead), per the Media WG minutes (S46). So crossfade readiness in practice = Web Audio gain automation or dual `<audio>` elements with volume ramps (the latter is coarser; volume ramping granularity on media elements is not sample-accurate — inference from S49/S46, marked INFERENCE).
- **Fact for the ~60 s generation flow:** MSE also enables append-as-it-arrives streaming of generated audio; Web Audio requires full decode of each buffer before sample-accurate scheduling (S45, S49). Architecture choice is OWNER/BUILD-DECISION; the facts above bound it.

# OWNER-DECISION register (choices deliberately not made here)

Per the project design contract, every aesthetic choice below is left to Berk. This slice provides only the constraint envelope:

1. **Base surface value** — pure #000 (Apple base; OLED-off; YouTube chose *near*-black citing scroll artifact) vs near-black dark grey (Material guidance; Spotify-observed #121212 family). OWNER-DECISION.
2. **Neutral elevation ramp** — number of lightness steps and their hex values (must keep text ≥4.5:1 and UI parts ≥3:1 on the *lightest* used step). OWNER-DECISION.
3. **Body-text white level** — pure #FFF vs slightly dimmed white (halation evidence favors not-maximum contrast for body text; WCAG sets only the floor). OWNER-DECISION.
4. **Accent palette** — hue, desaturation level for dark (Material: desaturated/luminous accents; Tidal: single cyan on black; Spotify: single functional green). OWNER-DECISION.
5. **Content-derived color** (album-art/ambient color-bleed à la YouTube Ambient Mode) — whether and how strongly. OWNER-DECISION.
6. **Typography** — family, scale, weights (fact: light/thin weights worsen astigmatic legibility on dark — S17 practitioner-level). OWNER-DECISION.
7. **Breakpoints and grid** — exact breakpoint values and container-query thresholds (floor: must reflow at 320 CSS px; container size queries are safe to use). OWNER-DECISION.
8. **Control sizing** — 24×24 minimum is law (AA); adopting 44×44 for primary transport controls is the AAA/practitioner-preferred level. OWNER-DECISION which level to commit to.
9. **Progress-state visual form** — determinate bar vs staged narrative vs hybrid; time-estimate wording; skip/cancel affordance styling. Constraint: >10 s ⇒ determinate + interruptible (S37–S41). OWNER-DECISION.
10. **Dark-only vs theme toggle** — accessibility literature recommends user control (S16, S18); Berk ordered black. Recording the tension; the call is the owner's. OWNER-DECISION.
11. **Playback engine** — Web Audio vs MSE vs plain media element (+ crossfade on/off, gap handling). Bounded by §5 facts; BUILD/OWNER-DECISION.

# Source register

Read status: [FULL] = relevant complete primary read this run; [PARTIAL] = substantial portion read (search-delivered page text/excerpts beyond abstract); [ABS] = abstract/metadata only. All retrieved 2026-08-29.

| ID | Source | URL | Date of source | Class | Read |
| --- | --- | --- | --- | --- | --- |
| S1 | WCAG 2.2, W3C TR (CR snapshot text, SC wording verified) | https://www.w3.org/TR/2022/CR-WCAG22-20220906/ | 2022-09-06 (CR) | W3C standard | [FULL] (saved page text) |
| S2 | W3C WAI news: WCAG 2.1/2.2 editorial updates | https://www.w3.org/WAI/news/2024-12-12/wcag2updates/ | 2024-12-12 | W3C official | [PARTIAL] |
| S3 | Understanding SC 1.4.3 Contrast (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum | living (WCAG 2.2) | W3C official | [FULL] (saved) |
| S4 | Understanding SC 1.4.11 Non-text Contrast | https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast | living | W3C official | [FULL] (saved) |
| S5 | Understanding SC 2.5.8 Target Size (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | living | W3C official | [FULL] (saved) |
| S6 | W3C Technique G17 (7:1) | https://www.w3.org/WAI/WCAG22/Techniques/general/G17 | living | W3C official | [PARTIAL] |
| S7 | Go-Tools WCAG/APCA contrast guide | https://go-tools.org/blog/wcag-color-contrast-ratio-aa-aaa-guide | 2025–2026 (undated page) | secondary | [PARTIAL] |
| S8 | Material Components Android — Dark theme doc (Google, first-party) | https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Dark.md | living (master) | first-party doc | [FULL] (fetched raw) |
| S9 | Android Developers — Color for mobile design | https://developer.android.com/design/ui/mobile/guides/styles/color | living | first-party doc | [PARTIAL] |
| S10 | Android Developers (Medium) — Dark theme with MDC | https://medium.com/androiddevelopers/dark-theme-with-mdc-4c6fc357d956 | 2019 | first-party blog | [PARTIAL] |
| S11 | fourzerothree.in — Scalable accessible dark theme (cites M2 #121212, 15.8:1) | https://www.fourzerothree.in/p/scalable-accessible-dark-mode | undated | secondary | [PARTIAL] |
| S12 | Apple HIG — Dark Mode | https://developer.apple.com/design/human-interface-guidelines/dark-mode | living | first-party doc | [PARTIAL] |
| S13 | WWDC19 session 214 — Implementing Dark Mode on iOS (transcript) | https://developer.apple.com/videos/play/wwdc2019/214/ | 2019-06 | first-party | [FULL] (saved) |
| S14 | Piepenbrock, Mayr, Mund, Buchner — Positive display polarity… Ergonomics 56(7):1116–1124 | https://www.psychologie.hhu.de/...Piepenbrock-2013-Positive_display_polarity_is_.pdf (DOI 10.1080/00140139.2013.790485) | 2013 | peer-reviewed | [FULL] (PDF text saved) |
| S15 | Piepenbrock, Mayr, Buchner — Smaller pupil size… Ergonomics | DOI 10.1080/00140139.2014.948496 (author PDF at psychologie.hhu.de) | 2014 | peer-reviewed | [FULL] (PDF text saved) |
| S16 | H. Locke — Why dark mode causes more accessibility issues… (Medium) | https://medium.com/@h_locke/why-dark-mode-causes-more-accessibility-issues-than-it-solves-54cddf6466f5 | ~2021 | practitioner | [PARTIAL] |
| S17 | AstigmatismoFit — Dark mode vs light mode / screens | https://www.astigmatismofit.com/blog/dark-mode-vs-light-mode-astigmatism | undated | secondary | [PARTIAL] |
| S18 | BOIA — Dark mode readability | https://www.boia.org/blog/dark-mode-can-improve-text-readability-but-not-for-everyone | undated | secondary | [PARTIAL] |
| S19 | Purdue ECE news — dark mode battery study | https://engineering.purdue.edu/ECE/News/2021/dark-mode-may-not-save-your-phones-battery-life... | 2021 | university first-party | [PARTIAL] |
| S20 | US Patent 11763742 (Dash/Hu PFOP power model) | https://patents.google.com/patent/US11763742 | granted 2023 | patent (primary) | [FULL] (saved) |
| S21 | Dash & Hu, MobiSys '21, pp. 323–335, ACM | https://researchr.org/publication/DashH21 (DOI via ACM) | 2021-06 | peer-reviewed | [ABS] (metadata; numbers taken from S19/S20/S22 family) |
| S22 | Bejamas field notes — dark mode battery research summary | https://bejamas.com/insights/field-notes/does-dark-mode-save-battery | undated | secondary | [PARTIAL] |
| S23 | Fast Company — YouTube redesign interview (Bartleson–Breneman, near-black) | https://www.fastcompany.com/90798927/exclusive-youtubes-new-redesign-is-built-to-feel-more-like-tv | 2022-10 | press interview (primary quotes) | [PARTIAL] |
| S24 | EqualWeb WCAG 2.2 reference (dates, ISO/IEC 40500:2025) | https://www.equalweb.com/platform/standards/wcag-2-2.html | 2025+ | secondary | [PARTIAL] |
| S25 | Spotify Design — Reimagining design systems at Spotify (Encore) | https://medium.com/spotify-design/reimagining-design-systems-at-spotify-2fe20fbb3552 | 2019–2020 | first-party | [PARTIAL] |
| S26 | Figma blog — Spotify's design system beyond platforms | https://www.figma.com/blog/creating-coherence-how-spotifys-design-system-goes-beyond-platforms/ | ~2023–2024 | vendor interview | [PARTIAL] |
| S27 | blakecrosley.com — Spotify design guide (teardown) | https://blakecrosley.com/guides/design/spotify | undated | secondary teardown | [PARTIAL] |
| S28 | explainx.ai — Spotify DESIGN.md (teardown) | https://explainx.ai/designs/voltagent-awesome-design-md/spotify/design-md | undated | secondary teardown | [PARTIAL] |
| S29 | YouTube Official Blog — Decoding YouTube's new design language (Ambient Mode) | https://blog.youtube/inside-youtube/youtube-ambient-color-mode-visual-language-redesign/ | 2022 | first-party | [PARTIAL] |
| S30 | TIDAL Brand Book 2018 (PDF) | https://www.audiogum.com/assets/guides/branding-tidal-1118.pdf | 2018-11 | first-party (mirrored) | [PARTIAL] |
| S31 | TIDAL Developer — Design Guidelines | https://developer.tidal.com/documentation/guidelines/guidelines-design-guidelines | living | first-party | [PARTIAL] |
| S32 | mgifford ACCESSIBILITY.md — touch/pointer best practices | https://mgifford.github.io/ACCESSIBILITY.md/examples/TOUCH_POINTER_ACCESSIBILITY_BEST_PRACTICES.html | living | secondary | [FULL] (saved) |
| S33 | MDN — @container at-rule (Baseline widely available, Feb 2023) | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@container | living | MDN first-party | [FULL] (saved) |
| S34 | MDN — container-type | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-type | living | MDN | [PARTIAL] |
| S35 | caniuse — style queries for custom properties | https://caniuse.com/mdn-css_at-rules_container_style_queries_for_custom_properties | live table | data registry | [PARTIAL] |
| S36 | Mozilla Bugzilla 2030645 — style queries shipped in Fx151 | https://bugzilla.mozilla.org/show_bug.cgi?id=2030645 | 2026 | first-party tracker | [PARTIAL] |
| S37 | NN/g — Response Times: The 3 Important Limits (Nielsen 1993) | https://www.nngroup.com/articles/response-times-3-important-limits/ | 1993 (living page) | NN/g primary | [PARTIAL] |
| S38 | NN/g — Website Response Times | https://www.nngroup.com/articles/website-response-times/ | 2010 (living) | NN/g | [PARTIAL] |
| S39 | NN/g — Powers of 10: Time Scales in UX | https://www.nngroup.com/articles/powers-of-10-time-scales-in-ux/ | 2009 (living) | NN/g | [PARTIAL] |
| S40 | NN/g — Progress Indicators Make a Slow System Less Insufferable | https://www.nngroup.com/articles/progress-indicators/ | living | NN/g | [PARTIAL] |
| S41 | UX Tigers (Jakob Nielsen) — Progress Indicators Ease the Wait | https://www.uxtigers.com/post/progress-indicators | 2026 | Nielsen primary | [FULL] (saved) |
| S42 | Impact of Response Latency and Task Type on Human-LLM Interaction (arXiv 2604.06183; DOI 10.1145/3772318.3790716) | https://arxiv.org/html/2604.06183v1 | 2026 | peer-reviewed (ACM) | [FULL] (saved) |
| S43 | OpenAI — Latency optimization guide | https://developers.openai.com/api/docs/guides/latency-optimization | living | first-party | [FULL] (saved) |
| S44 | MDN — Autoplay guide for media and Web Audio APIs | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay | living | MDN | [FULL] (fetched) |
| S45 | web.dev / Chrome Developers — MSE for Audio: eliminating the gap (D. Curtis) | https://web.dev/articles/mse-seamless-playback | 2015 (living mirror) | first-party (Chrome) | [FULL] (saved) |
| S46 | W3C Media WG minutes 2022-11-08 (splicing, cross-fade removed) | https://www.w3.org/2022/11/08-mediawg-minutes.html | 2022-11-08 | W3C record | [PARTIAL] |
| S47 | Mozilla bug 1222851 — MSE audio not gapless in Firefox | https://bugzilla.mozilla.org/show_bug.cgi?id=1222851 | 2015+ | first-party tracker | [FULL] (saved) |
| S48 | GitHub Tanq16/raikiri commit f57a076 (MSE sequence-mode audio pipeline) | https://github.com/Tanq16/raikiri/commit/f57a0768... | 2026-04-20 | community code | [PARTIAL] |
| S49 | MDN — AudioBufferSourceNode | https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode | living | MDN | [PARTIAL] |
| S50 | whatwg list — Gapless playback (R. O'Callahan reply) | https://www.mail-archive.com/whatwg@lists.whatwg.org/msg38487.html | 2014-10 | standards-community primary | [PARTIAL] |
| S51 | Stack Overflow — scheduling AudioBufferSourceNodes / sample-rate gaps | https://stackoverflow.com/questions/43150855/ and /37459231/ | 2016–2017 | community | [PARTIAL] |

Screening exclusions: avanip.com "Tidal design system" (an unrelated corporate design system that happens to be named Tidal — identity gate failed for TIDAL-the-music-service); Drjacky/claude-android-ninja theming reference (third-party restatement of M3 roles; superseded by S8/S9 first-party); corpowid.ai (redundant to W3C primaries); go-tools retained only for the APCA polarity note (S7).

# Five-part academic depth records

## A. Piepenbrock, Mayr, Mund & Buchner (2013), *Ergonomics* 56(7):1116–1124 [FULL]

1. **Problem (authors' framing):** the positive-polarity advantage was established mostly on young adults; light scatter in the senescent lens might reduce/reverse it for older adults, so display recommendations for an ageing society were unproven.
2. **Method:** 2 (age: 60–85y, M=69.82, SD=5.29 vs 18–33y, M=22.63, SD=3.26) × 2 (polarity) between-subjects; N=169 (85 older, 84 younger; a-priori power for f=0.40, α=β=.05); Freiburg Visual Acuity Test (FrACT, logVA=−logMAR) + proofreading task; DV: acuity, Pr = hit rate − false-alarm rate; reading rate monitored for speed–accuracy trade-off.
3. **Real numbers:** acuity — polarity F(1,163)=69.31, p<.01, η²=0.30; age F(1,163)=42.91, η²=0.21; interaction F(1,163)=19.80, η²=0.11; positive-polarity advantage significant in both groups (younger t(82)=9.93, d=2.17; older t(81)=2.53, p=.01, d=0.58). Proofreading — polarity F(1,165)=9.92, p<.01, η²=0.06; comparable reading rates rule out speed–accuracy trade-off.
4. **Stated limitations:** between-subject polarity avoids carryover but costs sample; effect smaller in the complex proofreading task; laboratory TFT conditions.
5. **Application here:** hard evidence that a dark player is a *comfort/brand* choice, not a legibility optimum — so the build must compensate: generous text sizes/weights, contrast above (but not maximally above) the 4.5:1 floor, and no critical dense reading on the darkest surface. Feeds OWNER-DECISIONS 3 and 6.

## B. Piepenbrock, Mayr & Buchner (2014), *Ergonomics* (pupil-size study) [FULL]

1. **Problem:** identify the mechanism of the positive-polarity advantage (display-luminance hypothesis).
2. **Method:** within-run pupil-size measurement during proofreading in both polarities; eye-position illuminance measured (118.4 lx positive vs 2.7 lx negative).
3. **Real numbers:** pupil 2.09 mm (positive) vs 3.65 mm (negative), t(34)=−17.49, p<.01, dz=2.96; proofreading accuracy t(34)=4.54, dz=0.77; reading rate t(34)=4.04, dz=0.68.
4. **Stated limitations:** authors discuss limits incl. correlational mechanism inference; single display type.
5. **Application here:** explains *why* light-on-dark is optically softer (dilated pupil → shallower depth of field → halation for imperfect optics) — grounds the "avoid maximum-contrast body text on pure black" knowledge item and the astigmatism-halation mechanism chain.

## C. Response Latency × Task Type in Human-LLM Interaction (2026, ACM/arXiv 2604.06183) [FULL]

1. **Problem (authors' framing):** latency's effect on LLM users is assumed critical but unstudied as a controlled variable.
2. **Method:** 3 (TTFT 2/9/20 s) × 2 (Creation/Advice) between-subjects, N=240 analytic (a-priori power f=0.25, α=.05, power .80, N≥211), custom GPT-4o interface, streaming 25 tokens/s, logged behavior + 7-point Likert perception ratings.
3. **Real numbers:** Thoughtfulness rose with latency (2 s<9 s p<.01; 2 s<20 s p<.05); Usefulness 9 s>2 s (p<.05); behavior robust to latency but task-type effect on new prompts F(1,236)=8.57, p=.004, η²p=.035 (Advice M=5.14 vs Creation M=6.20 prompts).
4. **Stated limitations:** crowdsourced knowledge tasks; fixed streaming rate; latency-fidelity exclusions (n=63); perceptions, not objective quality.
5. **Application here:** a ~60 s music-generation wait can be framed as *deliberate craft* ("composing your track…") without destroying perceived quality — but the same study shows long waits flip to frustration without honest progress, so staged determinate feedback remains mandatory. Feeds OWNER-DECISION 9.

(The Dash & Hu MobiSys '21 study is carried at depth through its patent full text S20 + university release S19; its ACM PDF was not opened this run, so it is not counted as an academic [FULL].)

# Claim cross-verification ledger (load-bearing claims)

| # | Claim | Sources | Status |
| --- | --- | --- | --- |
| CL1 | WCAG 2.2 AA: 4.5:1 text, 3:1 large text (1.4.3); 3:1 non-text (1.4.11); AAA 7:1 (1.4.6) | S1+S3+S4+S6 (W3C) + S7 | 3+ verified |
| CL2 | WCAG 2.2: reflow at 320 CSS px (1.4.10); target ≥24×24 (2.5.8, AA); 44×44 (2.5.5, AAA) | S1+S5+S32 + wcag2ict issues | 3+ verified |
| CL3 | WCAG 2.2 Rec 2023-10-05; editorial update 2024-12-12 (SCs unchanged); ISO/IEC 40500:2025 | S2+S24+TR headers (S1 family) | 3+ verified (ISO fact [single-source] S24) |
| CL4 | Material dark guidance: dark grey over black; lighter surfaces at higher elevation; overlays→tonal system in M3; desaturated accents | S8+S9+S10 | 3+ verified (first-party family + docs) |
| CL5 | Apple Dark Mode: base = pure black + elevated lighter set; semantic colors; vibrancy | S12+S13 (+S3-family Apple docs) | verified, first-party ([two-surface single-vendor]) |
| CL6 | Positive-polarity (dark-on-light) reading advantage, both ages; pupil/luminance mechanism | S14+S15 (+lineage cited within: Buchner & Baumgartner 2007 etc.) | 3+ verified (paper-internal replication lineage) |
| CL7 | OLED: dark mode saves 39–47% at 100% brightness, 3–9% at 30–50% | S19+S20+S22 (one research family + independent secondary) | verified; underlying producer single (mark: [single-family]) |
| CL8 | NN/g 0.1/1/10 s thresholds; spinner 2–10 s; percent-done ≥10 s | S37+S38+S39+S40+S41 | 3+ verified |
| CL9 | Container size queries Baseline widely available since Feb 2023; style queries cross-browser only with Firefox 151 (2026) | S33+S34+S35+S36 | 3+ verified |
| CL10 | Gapless across separate MP3/AAC files is not native; MSE append-window/timestampOffset or Web Audio scheduling required; splicing non-normative | S45+S46+S47+S50 | 3+ verified |
| CL11 | Autoplay with audio requires user gesture / policy; play() rejects with NotAllowedError | S44 (MDN, exhaustive) + Chrome/WebKit policies referenced therein | verified [single-source-page, authoritative] |
| CL12 | Slower TTFT (9–20 s) rated more thoughtful/useful than 2 s in LLM tasks | S42 | [single-source] (one controlled study; newest primary) |
| CL13 | YouTube deep black ≠ true black due to OLED pixel-off scroll artifact; Bartleson–Breneman framing | S23+S29 | partially verified (effect naming 2 sources; scroll artifact [single-source] S23) |

# Contradiction ledger

- **C1 — WCAG symmetric ratio vs polarity-aware perception:** WCAG 2.x passes identical pairs in both polarities (S1/S3); APCA and the polarity literature (S7, S14, S15) show light-on-dark is perceptually weaker at equal ratio. Not averaged: WCAG is the conformance law; the polarity evidence is extra headroom guidance. APCA is not a W3C Recommendation.
- **C2 — Pure black:** Apple base dark background is pure black (S12/S13); Material recommends dark grey over black (S8); YouTube chose deep-but-not-true black citing an OLED scroll artifact (S23); Tidal brands on pure black (S30). Preserved as a genuine split → OWNER-DECISION 1.
- **C3 — Skeleton perception studies conflict:** one comparison found skeletons perceived fastest; Viget (n=136 mobile) found them slowest (2.82 s vs 2.41 spinner vs 2.29 blank) (both cited in S41). Resolution per Nielsen: scope skeletons to short, layout-faithful loads only.
- **C4 — "Faster is always better" vs deliberation effect:** NN/g thresholds treat delay as cost (S37–S40); S42 shows moderate TTFT delay *raised* perceived thoughtfulness in LLM tasks. Both preserved: minimize *dishonest* waiting, but a framed generation wait is not automatically a UX failure.
- **C5 — MSE gapless portability:** Chromium implements frame-accurate splicing; the W3C spec does not require it and Firefox historically gapped (S45/S46/S47). Consequence: gapless must be verified per-browser; Web Audio scheduling is the sample-accurate cross-browser route (S49/S50).

# Query ledger (external actions, in order, 2026-08-29)

1. Search: WCAG 2.2 contrast SC 1.4.3/1.4.6/1.4.11 → S1, S3, S4, S6, S7.
2. Search: Material Design 3 dark theme surface tones elevation desaturated → S8 (via GitHub), S9, S10, S11.
3. Search: halation astigmatism light-on-dark readability → S16, S17, S18 (+lead to Piepenbrock).
4. Search: WCAG 2.2 1.4.10 reflow 320 / 2.5.8 target 24×24 → S1, S5, S32, wcag2ict issues.
5. Search: NN/g response time limits + progress indicators → S37–S41.
6. Search: gapless playback HTMLMediaElement / Web Audio / MSE → S49, S50, S51, S48.
7. Search: Apple HIG dark mode → S12, S13.
8. Search: OLED dark mode power Purdue Dash Hu → S19–S22.
9. Search: container queries Baseline support 2026 → S33–S36.
10. Search: Spotify Encore / YouTube Music / Tidal dark design → S25–S28.
11. Search: generative AI waiting latency research → S42, S43.
12. Fetch: m2.material.io dark theme → JS-shell only (content not retrievable); recorded as access failure, not absence.
13. Search: Piepenbrock/Buchner polarity primaries → S14, S15 (full PDFs).
14. Fetch: raw material-components Dark.md → S8 [FULL]. Fetch: web.archive.org m2 dark theme → timeout (access failure).
15. Search: Chrome gapless MSE article → S45, S46, S47.
16. Fetch: MDN autoplay guide → S44 [FULL].
17. Search: WCAG 2.2 Recommendation date → S2, S24, TR headers.
18. Fetch: w3.org/TR/WCAG22/ → timed out twice (access failure; SC text taken from saved TR snapshot + Understanding pages).
19. Search: Tidal design guidelines / YouTube design language → S29, S30, S31, S23.

# Known gaps

- **m2.material.io / m3.material.io pages not directly readable** (JS-rendered; archive fetch timed out). Exact legacy M2 numbers (#121212, 15.8:1, overlay alpha table) rest on secondary S11 + first-party-adjacent S8; direction verified first-party, exact values [single-source-class].
- **Dash & Hu MobiSys '21 ACM PDF not opened**; numbers carried via Purdue release + patent + secondary. Not counted as academic [FULL].
- **No peer-reviewed study directly measuring dark-mode × astigmatism magnitude** was found in this slice's searches; mechanism chain is solid, magnitude [UNVERIFIED].
- **Spotify exact hex tokens are observed-implementation facts** from teardowns (S27/S28), not Spotify-published token documentation; Encore token values are not public.
- **YouTube Music specifically** (as distinct from YouTube) has no public design-system documentation found; its dark surface is covered via the YouTube design-language primaries.
- **Era/scene "stations" pattern** (project-specific) has no dedicated standard; the generic chip/target/contrast law covers it.
- Newer-than-2026-08 changes to container-query or MSE support would supersede §3.2/§5; see watchlist.

# Living-update watchlist

`as_of: 2026-08-29`. Watch: W3C WCAG 3.0 drafts (APCA-style contrast could become normative); m3.material.io dark-theme/surface pages (when fetchable); caniuse container style queries (Fx151 rollout %); W3C media-source spec issue on normative splicing (S46 thread); NN/g/UX Tigers AI-progress-indicator updates; follow-ups citing S42.

# Artifact index and produced-vs-planned count

Planned for this slice: 1 report file. Produced: 1 — this file (`docs/research/2026-08-29-dark-adaptive-player-ui-knowledge.md`). Parent owns the run-level index/manifest; recommend indexing this path in the parent's completion manifest.

# Completion audit (slice)

- Independent authoritative sources consulted: **28+ registered (S1–S51 numbering with families deduplicated; ≥20 independent provenance families)** — slice floor of ≥6 exceeded.
- Academic sources: 4 families (Piepenbrock 2013; Piepenbrock 2014; Dash & Hu 2021; LLM-latency 2026). Academic [FULL]: **3** (S14, S15, S42). Primary/official [FULL] total: **10** (S1, S3, S4, S5, S8, S13, S41, S43, S44, S45 + saved-page S32/S33).
- Load-bearing claims: 13 ledgered; **9 at 3+ independent sources**; 4 flagged ([single-source]/[single-family]) and none silently carries a recommendation.
- All aesthetic choices routed to the OWNER-DECISION register (11 items); no palette/type/spacing value pre-filled.
- Access failures recorded (m2.material.io, w3.org/TR timeout, archive timeout) — recorded as access failure, never as absence.

