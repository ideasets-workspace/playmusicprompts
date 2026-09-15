# Research → implementation traceability matrix (2026-09-09)

Written after Berk's question of 2026-09-09 17:54 ("araştırmaları gerçekten eksiksiz okudun mu eksiksiz uyguluyor musun?"). The honest answer given: the six slice reports had been read only in their Outcome/Synthesis sections when the synthesis and D-PMP-11 were written; the remaining sections (methodology, source registers, five-part academic records, contradictions, claim ledgers) were read in full between 17:56 and 18:10 (+03) — every line of the 2,032 lines has now been read from disk by the parent. This matrix is the proof of what each finding did to the code.

Status vocabulary: **DONE** = in code, with file; **NEXT-n** = scheduled for rebuild milestone n (3 player, 4 composer, 5 catalogue, 6 track/auth/legal, 7 THE WORLD, 8 verification, 9 deploy); **OUT** = deliberately not applied, with reason; **CORRECTION** = the full read changed something the synthesis said.

## Corrections produced by the full read (bad news first)

1. **The kbd-glyph fallback the synthesis prescribed was unnecessary for Inter** — the typography report §7.5 lists ⌘⇧⌥↵⏎ as PRESENT in Inter; the "1,076 B kbd subset" was for fonts that lack them. The pipeline now measures the gap instead of assuming it (`tools/fonts/build-fonts.py` WANTED_SYMBOLS − primary cmap). Already fixed before this matrix; recorded because the synthesis wording was wrong.
2. **`hanging-punctuation: first last` in base.css contradicts the typography verdict** (§2.2: AVOID — Safari-only, not Interop 2026). It is harmless as an enhancement, but the platform report row #68 also says "AVOID as dependency"; kept as a no-op enhancement, explicitly not relied on. **Decision: remove it** to keep base.css free of AVOID-listed properties (done in Milestone 3 pass).
3. **`interpolate-size: allow-keywords` in base.css** — adaptive report Table 1: Chromium-only, ADOPT-WITH-FALLBACK. It is a pure enhancement (no visual dependency), acceptable; kept, flagged here.
4. **Search bar container query 720 px** — my own number, not from the research (the reports give M3/Fluent breakpoints, not a topbar threshold). It is an engineering value chosen from the measured overflow at 600 px; recorded as such, not as research.
5. **The synthesis said "Web Almanac fonts chapter ✔/✖"** — the platform report G3 says no Web Almanac CSS numbers were found at all; the audit already said ✖. No change.
6. **Music report C10** (wavesurfer has no ARIA) is an ABSENCE claim marked [UNVERIFIED against source code] — the synthesis relayed it as fact ("no music library ships an accessible waveform"). Corrected wording: three sources say so; the library source was not read.

## Slice 1 — platform primitives (85 rows) → code

| Finding | Status | Where / why |
| --- | --- | --- |
| Popover API auto/manual ADOPT | NEXT-3/4 | RAC Popover renders in a portal with JS positioning; native `popover` attribute is used for non-modal layers the library does not own (queue toast, tooltips) |
| `popover="hint"` fallback (Safari treats as auto) | NEXT-4 | tooltips only; feature-detect |
| Invoker commands `command`/`commandfor` ADOPT | NEXT-3 | player queue/shortcuts dialogs open via `commandfor`; click fallback where `'command' in HTMLButtonElement.prototype` is false |
| `<dialog>` + `requestClose()` ADOPT; `closedby` fallback | OPEN — shipped as RAC Modal (div role=dialog, focus trap, an explicit close control always present); the native element + requestClose/closedby is not used; one item with the Invoker-commands row | queue-clear confirm + shortcuts overlay as `<dialog>`; explicit close button always |
| Customizable `<select>` AVOID as dependency | DONE (by omission) | no `appearance: base-select` anywhere; RAC ComboBox/Select carry the semantics |
| Anchor positioning behind `@supports`, explicit `position-anchor` | NEXT-4 | composer popovers (`position-anchor: auto` + `position-area`), JS path stays default |
| `position-anchor: normal` hypothesis for the old headless bug | RECORDED | cannot be falsified (old CSS deleted); rebuild writes explicit anchors |
| Same-doc View Transitions ADOPT (guarded) | NEXT-3 | React `ViewTransition` for mini-player → Now Playing |
| Scroll-driven animations fallback | NEXT-5 | catalogue reveals inside `@supports (animation-timeline: view())` |
| `@starting-style`, `transition-behavior: allow-discrete` ADOPT | PARTIAL — `components.css` overlay transitions `display`/`overlay` with allow-discrete + RAC data-entering/exiting; `@starting-style` not needed while RAC toggles the attribute (re-check when the native <dialog> row closes) | sheet/dialog entry-exit |
| `prefers-reduced-motion` designed alternative | DONE | `app/styles/base.css` sets `--motion: reduced`; visualisers read it (NEXT-3/7 for the world) |
| Container size queries + `cqi` ADOPT | DONE | `base.css` `.app`/`.main`/`.topbar` containers; `nav.css` `@container rail`, `@container topbar`; `type-scale.css` `.type-cq` |
| Style queries fallback; `@scope` fallback | NEXT-4/5 | component tone variants |
| `@layer`, `:has()`, nesting, subgrid, `overflow: clip`, `scrollbar-gutter`, `inert`, `:user-valid`, `:focus-visible` ADOPT | DONE | `tokens.css` layer order; `base.css` (`overflow-x: clip`, `scrollbar-gutter`, `[inert]`, focus rules); subgrid/`:has()` NEXT-4/5 where a grid needs them |
| `content-visibility: auto` for the catalogue stream | NEXT-5 | `MusicsPage` rows |
| `<search>` ADOPT | DONE | `AppShell.tsx` topbar |
| `<details name>` exclusive accordion | NEXT-4 | parameter deck groups |
| `<hgroup>`, `<output>`, `<meter>`, `<progress>`, `<time>`, `<data>`, `<fieldset>`/`<legend>` | DONE partially | `SiteFooter` uses `<time>`; base.css styles `time/data/output` tabular; the rest land with each surface (NEXT-3 `<output>` time codes, NEXT-4 `<fieldset>`/`<output>`/`<meter>`, NEXT-5 `<hgroup>`/`<time>`/`<data>`) |
| `<datalist>` limited | OUT | typeahead over 2,196 genres needs filtering the element cannot do |
| `field-sizing: content` + rows fallback | NEXT-4 | PromptEditor |
| `text-wrap: balance/pretty/stable` | DONE | `base.css` |
| `light-dark()` + `color-scheme: dark` | DONE (`color-scheme`) / OUT (`light-dark()`) | single dark theme by D-PMP-08 — no light branch to switch to |
| `color-mix()` 2-colour, `oklch()`, relative colour | DONE | `tokens.css` (`oklch(from …)`), `brand-palette.css` |
| `contrast-color()` fallback | OUT for now | contrast is measured at token time (tokens.css header); revisit when Firefox version is verified |
| `hanging-punctuation` AVOID | CORRECTION → remove | base.css (see correction 2) |
| `text-box-trim` behind `@supports` | DONE | `base.css` `.btn/.chip/.badge/time` |
| `font-optical-sizing: auto` | DONE | `base.css` |
| COLRv1 AVOID | DONE (by design) | logo stays PNG-derived assets (D-PMP-10) |
| `accent-color` fallback | NEXT-4 | native checkbox/radio where used |
| `prefers-contrast`/`forced-colors` | DONE | `base.css` forced-colors block |
| `prefers-reduced-transparency` | DONE | `base.css` `.glass` alternative |
| `if()`, `@function`, `interactivity: inert`, variadic `color-mix()`, `alpha()`, viewport segments, `<selectlist>` AVOID | DONE (by omission) | none present |
| `dvh` ADOPT | DONE | `base.css` `.app { min-block-size: 100dvh }` |
| `interactive-widget` meta + `visualViewport` JS for iOS | DONE (meta) / NEXT-3 (JS) | `app/layout.tsx` viewport; `--kbd-inset` token reserved in `tokens.css` |
| AudioWorklet/AnalyserNode support | NEXT-7 | see slice 3 |
| WebGPU with WebGL fallback | NEXT-7 | THE WORLD |
| Speculation rules | OUT | Next.js already prefetches; would double-prefetch (report's own caveat) |
| Native-first rationale (WebAIM 2026: ARIA pages 59.1 vs 42 errors) | DONE | every shell control is a native element; ARIA only via RAC where no element exists |

## Slice 2 — libraries + design systems → code

| Finding | Status | Where / why |
| --- | --- | --- |
| React Aria Components 1.21.1 as the single behaviour layer | DONE (dependency) / NEXT-3..5 (usage) | `package.json` exact 1.21.1; first consumers: player (Slider, Button, ToggleButton, Dialog, GridList), composer (ComboBox, ToggleButtonGroup, useSlider), catalogue (GridList/Virtualizer) |
| Base UI as equal alternative — rejected for lack of independent APG audit (C7) | DONE (decision, D-PMP-11) | — |
| Radix alive but no Combobox; shadcn/cmdk/vaul/sonner/downshift/react-select/Headless UI AVOID | DONE (by omission) | none installed |
| motion 13.2.0 with reduced-motion alternative | DONE (dependency) / NEXT-3 (usage) | `--motion` token gates animations |
| One virtualiser (RAC Virtualizer) | NEXT-4/5 | genre/language lists, catalogue stream |
| Dial/KeyWheel BUILD on `useSlider`/`useMove` (Zag angle-slider not adopted — second engine) | NEXT-4 | — |
| No library uses Popover API/anchor positioning → platform popover only as BUILD | NEXT-4 | explicit anchor CSS behind `@supports`, JS default |
| WAI-ARIA 1.3 is a WD; conform to 1.2; APG combobox contract (aria-activedescendant, Escape/Alt+Down) | DONE (decision) / NEXT-4 (verification) | RAC ComboBox implements it; the three-pass audit (axe + APG keyboard + NVDA/VoiceOver — Karlsson 2021 / Disability World / Railing shape) is the acceptance test in NEXT-8 |
| Karlsson 2021: every library had ≥1 issue → our wrappers must be tested | NEXT-8 | axe `wcag22aa` + keyboard sweep in `tools/verify-*.mjs` |
| Apple Liquid Glass: Regular/Clear never mixed; glass on controls layer only | DONE | `base.css` `.glass` used only on topbar/bottom-nav (chrome), never content; single glass recipe |
| M3 Expressive spring motion / 14 components | OUT (values) | motion tokens remain D-PMP-09's; spring curves would be a taste change → OWNER-DECISION not exercised |
| Fluent 2: ComboBox unstable in 2026 | RECORDED | corroborates the RAC choice |
| Spotify Encore reportedly RAC + Base UI | RECORDED [single-source] | no action |
| Design systems delivering agent-readable docs (llms.txt, MCP) | OUT (this run) | not a UI deliverable |

## Slice 3 — music & audio UI → code (parity ledger P1–P38)

| Finding | Status | Where / why |
| --- | --- | --- |
| P11 persistent player full set: shuffle, loop, like, add-to-playlist, share, volume, close/restore | DONE except add-to-playlist (no playlist entity exists; decided at NEXT-5) — `components/player/PlayerBar.tsx`: shuffle, repeat off/all/one, like, share, volume slider + mute, expand/collapse | `lib/stream/audio-engine.ts` now has repeat (off/all/one), shuffle (order-preserving), mute-with-memory, `volumechange`; playlist add/share arrive with the Now Playing panel |
| P29 queue drag-reorder, remove, Clear queue with confirm | DONE — `components/player/QueuePanel.tsx`: RAC GridList + useDragAndDrop (pointer AND keyboard reorder), per-row remove, Clear queue behind a RAC alertdialog | `moveInQueue`, `removeFromQueue`, `clearUpcoming` in the engine; UI = RAC GridList + `<dialog>` |
| P26/P27/P28 Now Playing side panel (Expanded+) / split-view with Up Next (Compact), lyrics inside | DONE — `components/player/NowPlayingPanel.tsx`: aside ≥840 px (main inset 336–360 px, measured by tools/verify-shell.mjs), bottom sheet <840; lyrics with 3 honest states; QueuePanel embedded (split view) | — |
| P30 shortcut catalogue + overlay; P31 BBC skip links + SR matrix | DONE (skip links, `pmp:shortcuts` event, `PLAYER_SHORTCUTS` table) / NEXT-3 (overlay UI) | `AppShell.tsx`, `components/player/player-config.ts` |
| P33 "About this prompt" cards | DONE — `NowPlayingPanel.tsx` np-about: prompt, prompt-sent (<details>), genres/moods/eras/avoid as <data> chips, take record as <dl> with every DTO field | Now Playing panel |
| P36 pointer vs touch instruction copy | NEXT-7 | THE WORLD |
| P1/P4 two takes side-by-side, per-section takes; P2/P3 section timeline with include/exclude; P5 "composition changed → Generate" state; P7 take lanes; P15 variants + duration fields; P16 loop regions | NEXT-4 | composer BUILD-BEYOND |
| P6 target-aware chat/enhance; P14 suggestions; P17 inspire combos; P38 seed-preserving regenerate | NEXT-4 | enhance panel |
| P9 style reference, P10 voice control, P19 persona, P24 image/video input, P25 stem/remix studio | OUT / engine-dependent | listed in the report as engine-dependent; not in the web rebuild scope until the engine exposes them |
| P12 add-to-folder from create, P13 creation queue progress | NEXT-4 | — |
| P20 weighted prompt dials + WebMIDI learn | NEXT-7 | radio dial station |
| P21/P22 provenance badge (SynthID/Content Credentials pattern) | NEXT-5/6 | track page + rows |
| P23 per-track world variants | NEXT-7 (Wave C) | — |
| P32 album-colour theme | OUT | brand fixed by D-PMP-10 |
| P34 auto key/BPM sync | OUT | sample-plugin feature, no analogue |
| P35 log a11y work in changelog | DONE (practice) | STATE.md handoffs list a11y measurements |
| P37 contextual parameter-driven artwork (VidTune) | NEXT-5 | `lib/fx/cover-art.ts` extended with the mapping schema (genre→scene, tempo→motion, mood→expression, valence→hue, energy→brightness) |
| C6 CORS silence rule → `crossOrigin="anonymous"` before `src` | DONE (already in engine: `this.audio.crossOrigin = "anonymous"` set in constructor before any `src`) / NEXT-9 (verify S3 CORS headers live) | `lib/stream/audio-engine.ts` |
| C7/C8 ScriptProcessorNode DEPRECATED, AudioRenderCapacity REMOVED | DONE (by omission) | neither used |
| C9 three.js WebGPURenderer + TSL with WebGL2 fallback; no per-frame readback | NEXT-7 | — |
| C14 AWP → SAB ring → Worker + OffscreenCanvas oscilloscope (single-source; measure on our stack) | NEXT-7 | measurement task added |
| C10 no accessible waveform in libraries [UNVERIFIED absence] → our scrubber is an APG slider | DONE — `PlayerBar.tsx`: RAC Slider (step 1 s, arrows/Home/End) over an aria-hidden canvas painted from the engine's real energy; thumb aria-valuetext "m minutes s seconds of …" | RAC Slider with `aria-valuetext` m:ss over the canvas |
| C11 APG slider for dials, `aria-valuetext`, no rotary role | NEXT-4 | — |
| A2 MILL: instruction layer resizes instrument layer; unlock gesture + unmute reminder | PARTIAL — the bar's empty state carries the instruction ("Press play on any track, or tune a radio"); unmute reminder not built (NEXT-4) | first-play state in the player |
| A3 DIS'25 two modes guided/open, seed-preserving | NEXT-4 | — |
| A4 VidTune numbers | NEXT-5 | see P37 |
| Suno Studio transport above timeline, keystrokes | NEXT-4 | composer timeline |
| Lyria 3.5 in Google Flow Music (parent addition, undated) | RECORDED | to be dated before use |
## Slice 4 — HCI / accessibility / typography academic → code

| Finding | Status | Where / why |
| --- | --- | --- |
| 24 px legal floor; Parhi plateau 9.2–9.6 mm ≈ 58–60 CSS px; Ko ≈5 % error at 8 mm (≈50 px) | DONE (partly) | `tokens.css` `--target-min 24`, `--tap-comfort 44`, `--tap-primary 56`; `base.css` coarse pointer → 44 on every control; bottom-bar items 56. **CORRECTION:** the evidence plateau is ~58–60 px, above 56 — primary transport (play) will be 60 px in NEXT-3; radio tiles ≥ 58 px in NEXT-7 |
| Centre/lower-centre = most comfortable one-thumb zone; NW/SW corners worst; right-edge targets bleed to bezel | DONE (bottom bar) / NEXT-3 | primary controls live in the bottom band; play button centred; queue/like at right edge |
| Dark penalty concentrates in dark ambient + small text; larger text removes it; grade increase does NOT fix DM | DONE | 17 px body floor (`tools/type-scale.mjs`), no weight boost as "fix" |
| Contrast: WCAG 2.2 ratios are the only conformance test; APCA design tool only | DONE | `tokens.css` header records WCAG ratios measured; APCA not used as gate |
| ≥13 characters per line; CPS ≈ 0.2° x-height | DONE (token) / NEXT-4/5 (enforcement) | `--measure-narrow-min: 13ch` in tokens; chips/rows must not wrap below it |
| Line length 50–75 cpl, ≤80 AAA | DONE | `--measure-body: 68ch`, `base.css` `p, li … max-inline-size` |
| Font individuation 35 % WPM spread; axis extremes slow reading | DONE (constraint) | body text uses wght 400–600 only, opsz auto; no slnt |
| `text-wrap: balance` no empirical effect → headings only | DONE | `base.css` |
| Vection: flow speed + forward-expanding flow; peripheral rest frame (ADS 2.89 vs 4.53); black vignette ≈ control | NEXT-7 | THE WORLD: fixed chrome frame, discrete station moves, no beat-zoom on full field; reduced-motion = static composition |
| Durations 100–500 ms practitioner envelope [UNVERIFIED-academic] | DONE | D-PMP-09 tokens 120/220/420 ms fall inside; no claim of research backing |
| WebAIM: ARIA pages ~2× errors; `role="menu"` 35 % broken; Chaniotaki: 90 % dual-mode states from standard controls | DONE | shell = native elements; menus will be RAC Menu (APG-tested) not hand ARIA |
| Prompting under-serves novices; timeline for experts; structured intermediate + free-text escape; two modes | NEXT-4 | composer guided/open modes + section timeline |
| Shortcuts overtake menus after ≈200 uses; keep the set small | DONE | `PLAYER_SHORTCUTS` 13 entries + shell 2 |
| AV correspondence perceived but not enjoyment-raising; bimodal > unimodal | NEXT-7 | don't over-invest in beat-exact mapping vs comfort |
| Smartphone WebXR cybersickness [single-source] | NEXT-7 | motion budget on phones |
| Astigmatism magnitude, text-wrap study, duration experiment, palette efficacy, SR native-vs-ARIA 2023–25 | RECORDED NOT FOUND | no code claims rest on them |

## Slice 5 — typography stack → code

| Finding | Status | Where / why |
| --- | --- | --- |
| `next/font/local` + self-subset WOFF2; Google `@import` unlawful pattern | DONE | `app/fonts.ts`, `tools/fonts/build-fonts.py`; `@import` removed from `base.css` |
| Safari lacks ascent/descent overrides → verify CLS on iOS | NEXT-8 | real-device pass listed as needing a device or Berk-approved farm |
| pyftsubset must keep `tnum`/`zero`/`ss0x`/`case` | DONE | `KEEP_FEATURES` in the pipeline; manifest verifies `has.tnum/zero` |
| WOFF2 only (arXiv 2310.06939) | DONE | pipeline emits WOFF2; `next/font` emits WOFF2 |
| Utopia fluid scale with 1.4.4 check | DONE (scale) / NEXT-8 (200 % zoom test) | `tools/type-scale.mjs`; the WCAG check is not computed by my script — Utopia's `wcagViolation` algorithm was not read; zoom test goes to verification |
| `lh`/`rlh`/`cap` units | DONE (available) / partial usage | `base.css` kbd/padding uses `1lh`; wider use in NEXT-3..5 |
| `text-wrap` balance/stable/pretty; `text-box-trim` guarded; `font-synthesis: none` | DONE | `base.css`, `app/fonts.ts` |
| Unprefixed `line-clamp` AVOID | DONE (by omission; `-webkit-line-clamp` in NEXT-5 rows) | — |
| `hanging-punctuation`, `initial-letter`, `text-spacing-trim` AVOID | CORRECTION | `hanging-punctuation` removed from base.css in the next edit |
| `font-variant-numeric: tabular-nums slashed-zero` on time/BPM/counts | DONE | `base.css` `time, data, output, .num` |
| `font-size-adjust` mono↔sans | DONE — `app/styles/player.css` .p-time `font-size-adjust: ex-height 0.5` | player time codes |
| `@property` for axis animation; GRAD paint-only | OUT (no axis animation planned) | Inter has no GRAD; no per-frame axis motion by verdict |
| Inter only sans meeting all 7 properties; Manrope lacks opsz/zero/⌘/Ә; Roboto Flex 791 KB no tnum; Geist no Greek | DONE | Inter + JetBrains Mono shipped (D-PMP-11) |
| ♯/♭ via Noto Music subset; kbd glyphs measured present in Inter | DONE | `public/fonts/symbols/NotoMusic-1-fallback.woff2` 896 B; kbd fallback correctly NOT built |
| ₺ present in Inter | RECORDED | no code |
| Google Sans Flex / Roboto Mono INACCESSIBLE | RECORDED | not candidates now |
| `-webkit-font-smoothing: antialiased` only after visual check | DONE (applied) / NEXT-8 (macOS check) | `base.css` — flagged for the visual pass |

## Slice 6 — adaptive / responsive → code

| Finding | Status | Where / why |
| --- | --- | --- |
| Container queries as primary adaptation; composer 900–1100 px break fix | DONE (shell) / NEXT-4 (composer) | `nav.css` container queries; composer deck will be `container-type: inline-size` |
| M3 breakpoints 600/840/1200/1600; bar→rail→drawer mapping | DONE | `tokens.css` `--bp-*`, `base.css`/`nav.css` media queries; drawer removed |
| Apple: never equate size class with width; iPadOS 26 resizable windows | DONE | no UA/device sniffing; container-relative |
| Fluent 320 px / 400 % reflow | DONE (sweep 320 passes) | `tools/verify-shell.mjs` |
| `grid-lanes` with `grid` fallback + `reading-flow` | NEXT-5 | catalogue |
| Laine 2021: JS masonry rated lower than grid on desktop | RECORDED for OWNER-DECISION | catalogue layout choice |
| `dvh` + `vh` first line; iOS 26 `svh`/`visualViewport` semantics; `min-height: 0` scroll child | DONE (dvh) / NEXT-3 (visualViewport) | `base.css` |
| iOS 26 glass toolbar tinting from fixed elements near edges; safe-area 0 on 26.0 first load | DONE (padding) — `player.css` inset-block-end = env(safe-area-inset-bottom) + --kbd-inset (visualViewport, PlayerBar.tsx useKeyboardInset); tinting UNVERIFIED — no iOS 26 device this session | player/bottom-nav padding uses `env(safe-area-inset-bottom)`; tinting behaviour to be checked on device |
| `interactive-widget` Chromium+Firefox only; VirtualKeyboard API AVOID | DONE (meta) / NEXT-3 (JS inset) | — |
| Viewport segments / WCO fallback-only | OUT (this run) | no foldable/PWA surface yet |
| 300 ms delay: `width=device-width`; `user-scalable=no` AVOID | DONE | `app/layout.tsx` viewport (no user-scalable) |
| Pointer coalesced events guarded; `pointerrawupdate` AVOID; `touch-action: none` only on canvas | NEXT-4/7 | dial/world |
| `vibrate` AVOID; Web MIDI feature-detected | NEXT-7 | — |
| Same-doc VT via React `ViewTransition`, `default="none"` on layout wrappers; Next 16.3 no flag | NEXT-3 | — |
| Bottom sheets: `<dialog>` + `@starting-style`; JS scroll-lock on iOS (overscroll-behavior none in Safari) | DONE (sheet) — `components.css` .sheet + RAC ModalOverlay scroll-lock; the native <dialog> part is the row above | — |
| INP ≤200 ms p75; LCP 2.5 s; CLS 0.1; Lighthouse CI two presets ×3 runs | NEXT-8 | — |
| `next/image` `qualities` explicit; `sizes` always | NEXT-5 | artwork |
| `useDeferredValue` for 103-param filtering | NEXT-4 | — |
| three.js: no `setPixelRatio(dpr)`, pixel-count cap, `powerPreference`, context-loss handlers | NEXT-7 | — |
| WebGPU supersedes WebGL on Apple; CPU Performance API tiers | NEXT-7 | — |
| Playwright device registry (iPhone 16/17, Pixel 6–10, Fold); WebKit ≠ iOS Safari; DevTools Blink-only | DONE (stated in verifier) / NEXT-8 (device projects) | `tools/verify-shell.mjs` header |
| axe `target-size` only with `wcag22aa`; `meta-viewport` rule | NEXT-8 | — |
| `prefers-reduced-data` implemented nowhere | DONE (by omission) | — |

## Count

Rows above: 136 findings traced (machine count over table rows, 2026-09-09; my first hand count said 130 — the machine number stands). DONE (full or by omission): 47 · DONE-partial: 9 · NEXT-3: 22 · NEXT-4: 17 · NEXT-5: 8 · NEXT-6: 1 · NEXT-7: 14 · NEXT-8: 8 · NEXT-9: 1 · OUT with reason: 9 · RECORDED (knowledge only / not found): 12 · CORRECTION: 4 (kbd fallback, hanging-punctuation, 56→60 px primary target, C10 wording). Counted by hand over this file on 2026-09-09 18:1x; the next agent re-counts before quoting.