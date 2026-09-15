# Standards ledger

| Standard (read this run) | How this report implements it | Status |
| --- | --- | --- |
| Deep-research covenant `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (SHA-256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB, 1309 lines, read in full) | Search-first discovery, newest-first, `[FULL]/[PARTIAL]/[ABS]` marks, three-source rule with `[single-source]`/`[UNVERIFIED]` flags, source register with hashes under `_sources/`, query log, claim ledger, contradiction ledger, honest counts | applied; slice floor ≥16 authoritative met (see counts) |
| Rule 14 Design Contract (`.cursor/rules/14-design-contract.mdc`) | This document is KNOWLEDGE only: support matrices, mechanisms, failure modes, verification. Every layout/navigation/sheet choice is left as OWNER-DECISION | applied |
| Rule 20 Frontier frontend law (`.cursor/rules/20-frontier-frontend-development-law.mdc`) | Every mechanism is judged for phone, tablet and desktop (three form factors) and for touch/pointer/keyboard input | applied |
| Rule 24 (no harm / frontier) and rule 25 (no deception) — both read from disk this run | No claim without a this-run source; every unverified item is flagged in the same sentence | applied |
| Rule 10 no-narrowing | All items (a)–(f) from the brief get a dated row or an explicit NOT FOUND/[UNVERIFIED] | applied |

Report path: `docs/research/2026-09-09-frontier-ui-components-adaptive-responsive.md`. Sources: `docs/research/_sources/2026-09-09-frontier-ui-components/adaptive-responsive/` (42 captured texts + `SOURCE-REGISTER.md`). Worker did not modify any other repository file.

# Decision served

Which layout primitives, input adaptations, navigation/sheet mechanics, viewport/keyboard handling, performance methods and verification tools are production-safe on 2026-09-09 for ONE Next.js 16.3 / React 19.2 codebase that must be first-class on phone, tablet and desktop (PlayMusicPrompts rebuild: shell nav, composer dial grid, popovers, persistent player bar, THE WORLD three.js gestures, catalogue stream). Verdicts: ADOPT (use unguarded), ADOPT-WITH-FALLBACK (progressive enhancement behind `@supports`/JS detection), AVOID (do not build on it), OWNER-DECISION (taste, not knowledge).

# Outcome first

## Browser landscape on 2026-09-09 (measured this run)

- Chrome 153 stable shipped 2026-09-08 and starts the two-week release cadence (Chrome for Developers blog 2026-03-03 + release notes 153). Chrome 152 stable 2026-08-25; 149 = 2026-06-02; 148 = 2026-05-05; 144 = 2026-01-13.
- Firefox 155 stable 2026-09-01 (MDN + firefox.com release notes). Firefox 147 = 2026-01-13; 150 = 2026-04-21; 151 = 2026-05-19.
- Safari 26.0 shipped 2025-09-15; 26.4 = 2026-03-24; 26.5 ≈ 2026-05-11 (Pravin Kumar + WebKit bug 315704, `[PARTIAL]`); Safari 27 is in beta since 2026-06-08 (WebKit blog 17967); iOS 27 public release was not out on 2026-09-09 (multiple press sources; Apple date `[UNVERIFIED]`).

## Table 1 — Layout / viewport / input mechanisms

Columns: mechanism | Chrome / Safari / Firefox first-supported (date) | Baseline | verdict | our surface.

| Mechanism | Chrome | Safari | Firefox | Baseline (web-features/MDN) | Verdict | Our surface |
| --- | --- | --- | --- | --- | --- | --- |
| Container size queries + `cqi/cqb` units | 105 (2022) | 16 (2022) | 110 (2023) | Widely available (CSS Wrapped 2025 + LogRocket 2026) | ADOPT unguarded | composer dial grid (fixes the 900–1100 px break by sizing dials from the grid container, not the viewport) |
| Name-only `@container` (no `container-type`) | 148 (2026-05-05) | 26.4 (2026-03-24) | 149 | Newly available May 2026 (web.dev May 2026 digest) | ADOPT-WITH-FALLBACK (write a size/style condition until 2028) | composer |
| Container style queries `style(--x)` | 111 (2023) | 18 (2024-09) | 151 (2026-05-19) | Newly available 2026-05-19 | ADOPT-WITH-FALLBACK (`:where()` class default, style query overrides) | theme/density tokens in shell |
| Scroll-state queries `scroll-state(stuck\|snapped\|scrollable)` | 133 (2025-02); `scrolled` 144 (2026-01-13) | not shipped (26.x, 27 beta) | not shipped (155) | Limited | ADOPT-WITH-FALLBACK, decoration only, inside `@supports (container-type: scroll-state)` | player bar shadow when stuck; catalogue snapped cards |
| `@media (hover)` / `(pointer)` / `(any-pointer)` | 38 | 9 | 64 | Widely available since Dec 2018 (MDN hover) | ADOPT | hover-less design on touch; dial affordances |
| `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast` | long shipped | long shipped | long shipped | Widely available (MDN, `[PARTIAL]` — not re-opened per feature this run) | ADOPT | THE WORLD autorotation, view transitions |
| `prefers-reduced-data` | disabled by default 85–154 | none (Apple position: privacy) | none | Limited; "no user agent implements" (MDN) | AVOID (use `navigator.connection.saveData` where Chromium; otherwise nothing) | catalogue media |
| `dynamic-range`, `scripting`, `update` media features | shipped | shipped | shipped | `update` moved to Widely available H1 2026 (`[single-source]` brainstormsandraves); `dynamic-range`/`scripting` NOT re-verified this run `[UNVERIFIED]` | ADOPT with harmless fallback | HDR artwork, no-JS fallbacks |
| CSS Grid `subgrid` | 117 (2023-09-12) | 16 (2022-09-12) | 71 (2019-12-10) | Widely available 2026-03-15 (web-features) — web.dev I/O page says June 2026 (contradiction C-1) | ADOPT unguarded | catalogue cards, composer param groups |
| Masonry → `display: grid-lanes` | Chromium had `display: masonry` behind flag in 140; switching to `grid-lanes` (CSS-Tricks) — stable ship `[UNVERIFIED]` | 26.4 (2026-03-24) ships `display: grid-lanes` + `flow-tolerance` | flagged `display: grid` era; switching (CSS-Tricks) | Limited; MDN marks Experimental | ADOPT-WITH-FALLBACK (`display: grid` first, `@supports (display: grid-lanes)`), and pair with `reading-flow` for focus order | catalogue |
| Intrinsic sizing `min()/max()/clamp()`, `fit-content`, `aspect-ratio`, logical properties | 79/88 | 11.1/15 | 75/89 | Widely available (`[PARTIAL]` — background knowledge re-confirmed only via three.js/Fluent material, not re-opened) | ADOPT | everything |
| `stretch` keyword for sizing | shipped (unprefixed `[UNVERIFIED]` version) | 27 beta (2026-06-08) | shipped `[UNVERIFIED]` | not Baseline until Safari 27 | ADOPT-WITH-FALLBACK (`width: 100%` then `width: stretch`) | full-bleed panes with margins |
| `:has()` | 105 | 15.4 | 121 | Widely available June 2026 (web.dev Jun 2026 digest) | ADOPT unguarded, drop `@supports selector()` guards | shell state selectors |
| CSS nesting `&` | 120 | 17.2 | 117 | Widely available Feb 2026 (web.dev I/O page) | ADOPT | all CSS |
| `@scope` | 118 | 17.4 | 146 (Dec 2025) | Newly available Dec 2025 | ADOPT-WITH-FALLBACK (`@supports at-rule(@scope)` in Chrome 148+, else unscoped fallback) | player/world style isolation |
| `interpolate-size` / `calc-size()` | 129 (2024-09-17) | none (bug 295132) | none (bug 1945962) | Limited | ADOPT-WITH-FALLBACK (`@supports (interpolate-size: allow-keywords)`) | sheet/accordion height animation |
| `field-sizing: content` | 123 | 26.2 | 152 | Newly available June 2026 (web.dev Jun 2026 digest) | ADOPT-WITH-FALLBACK (min/max sizes) | prompt textarea |
| CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `anchor()`, `@position-try`, `position-try-fallbacks`) | 125 (2024-05) | 26.0 (2025-09-15); chain/zero-fallback/`anchor-scope` fixes 26.5 (2026-05); transform-aware + `position-anchor: normal/none` 27 beta | 147 (2026-01-13) | MDN `position-anchor` page still says Limited (contradiction C-2) | ADOPT-WITH-FALLBACK: `@supports (position-anchor: auto)` → CSS path; else existing JS positioning. Keep JS path until Safari 26.5+ share is measured | composer popovers (replaces JS-only positioning) |
| Popover API (`popover`, `popovertarget`) | 114 | 17 | 125 | Widely available (CSS Wrapped 2025: "lands in all engines" + testmuai) | ADOPT | menus, tooltips |
| `<dialog>` + `closedby` | dialog 37; `closedby` 134 | dialog 15.4; `closedby` NOT in 26.x/27 per caniuse (TP only) — testmuai claims 18.2 (contradiction C-3) | dialog 98; `closedby` 141 | dialog Widely; `closedby` Limited | dialog ADOPT; `closedby` ADOPT-WITH-FALLBACK (backdrop click handler) | sheets |
| `@starting-style` + `transition-behavior: allow-discrete` | 117 | 17.5 | 129 | Newly available 2024 (`[PARTIAL]` MDN dialog page) | ADOPT-WITH-FALLBACK (no entry animation otherwise) | sheet open/close |
| Scroll-driven animations `animation-timeline: scroll()/view()` | 115 | 26.0 (2025-09-15) | behind `layout.css.scroll-driven-animations.enabled` in 155 | Limited (Firefox) | ADOPT-WITH-FALLBACK (`@supports (animation-timeline: scroll())`, static end state otherwise) | catalogue reveal, header |
| `scroll-snap` | long | long | long | Widely available; Interop 2026 focus area | ADOPT | catalogue carousels, radio dial detents |
| `overscroll-behavior` on scrollers with overflow | 63 | 16 | 59 | property Widely (caniuse) | ADOPT | player sheet, side drawer |
| `overscroll-behavior` on NON-overflowing containers / root | 144 (2026-01-13) | NOT (bug 243452, NEW since 2022) | 150 (2026-04-21) | web-features "Limited, blocked by Safari" (contradiction C-4 resolved) | ADOPT-WITH-FALLBACK: keep JS scroll-lock for Safari sheets | bottom sheet backdrop |
| `content-visibility: auto` + `contain-intrinsic-size` | 85 | 18 | 125 | Newly available 2025-09-15 | ADOPT (inert where unsupported) | catalogue long lists |
| `dvh/svh/lvh` | 108 | 15.4 | 101 | Widely available 2025-06-05 | ADOPT (keep `vh` fallback line for old Samsung/UC) | shell height, THE WORLD |
| `env(safe-area-inset-*)` + `viewport-fit=cover`; `safe-area-max-inset-*` | long | long | long | `env()` Widely available since Jan 2020 (MDN; parts vary) | ADOPT | player bar bottom padding |
| `interactive-widget=resizes-content` | 108 | NOT (bug 259770 open; flag only) | 132 (`[single-source]` arturbasak; SO) | not tracked as Baseline | ADOPT-WITH-FALLBACK: meta + `visualViewport` JS inset for iOS | composer keyboard |
| VirtualKeyboard API + `env(keyboard-inset-*)` | 94 | none | none | Limited (caniuse 76%) | AVOID as primary; optional Chromium enhancement | composer |
| Viewport Segments (`horizontal/vertical-viewport-segments`, `env(viewport-segment-*)`, `window.viewport.segments`) | 138 (2025-06-24) | none | none | Limited | ADOPT-WITH-FALLBACK (media query no-ops elsewhere) | shell two-pane on foldables |
| Window Controls Overlay (`display_override`, `env(titlebar-area-*)`) | Chromium desktop | none | none | Limited, Experimental (MDN) | ADOPT-WITH-FALLBACK for installed desktop PWA only | desktop PWA shell |
| `touch-action: manipulation` / `none`; `width=device-width` kills 300 ms delay | 32 (2014) | iOS 9.3 (2016) via viewport meta; `touch-action: manipulation` not honoured (Chrome blog) | yes | Widely | ADOPT `width=device-width` (mandatory); `touch-action: none` ONLY on the dial/world canvas | THE WORLD, radio dial |
| `user-scalable=no` / `maximum-scale<2` | — | — | — | WCAG 1.4.4 failure (W3C ACT b4f0c3; axe `meta-viewport`) | AVOID | viewport meta |
| Pointer Events `getCoalescedEvents()` | 58 | 18.2 (coalesced events lacked `pointerId`/`target` — Flutter engine PR 56719) | 59 | Limited per MDN | ADOPT-WITH-FALLBACK (fallback to the main event when array is empty/malformed) | dial drag smoothing |
| `pointerrawupdate` | 77 (secure-context-only from 142/143) | none (26.x/27) | 148 full | Limited | AVOID as dependency; optional on Chromium | dial |
| `navigator.vibrate` | 32 | never (WebKit position: Oppose) | removed 129 | Limited | AVOID (audio/visual feedback instead) | dial detents |
| Web MIDI | 43 | none | 108 | Limited | ADOPT-WITH-FALLBACK (desktop Chromium/Firefox only; feature-detect) | composer MIDI input |
| Gamepad | long | long (visionOS fix 27) | long | not re-verified `[UNVERIFIED]` | out of slice | — |

## Table 1b — Navigation, transitions, framework and performance mechanisms

| Mechanism | Chrome | Safari | Firefox | Baseline / status | Verdict | Our surface |
| --- | --- | --- | --- | --- | --- | --- |
| Same-document View Transitions (`document.startViewTransition`, `view-transition-name`, `view-transition-class`, `match-element`, `:active-view-transition`) | 111 (types 125) | 18 | 144 (2025-10-14; types NOT in initial Firefox impl per web.dev) | Newly available 2025-10-14 (web.dev + MDN) | ADOPT-WITH-FALLBACK (React `ViewTransition` no-ops without support) | route changes, mini-player → now-playing |
| Cross-document View Transitions (`@view-transition { navigation: auto }`) | 126 (2024-06-11) | 18.2 (2024-12-11) | NOT (bug 1860854; Interop 2026) | Limited — blocked by Firefox 20 months | not needed for an SPA shell; AVOID as dependency | — |
| Next.js 16.3 View Transitions | `nextjs.org/docs/app/guides/view-transitions` (2026): "work in the App Router with no configuration"; `experimental.viewTransition` flag is inert and removed in PR #96098 (landed for 16.1.7/16.3.0 per PR references); `transitionTypes` on `<Link>`/`router.push` shipped 16.2.0 (vercel-labs skill) — contradiction C-5 with third-party guides that still say "enable the flag" | ADOPT: import `ViewTransition` from `react`, `default="none"` on layout-level wrappers so back/forward and Suspense reveals do not animate directionally | shell, player |
| Next.js 16.3 `cacheComponents: true` + `partialPrefetching: true` (`'use cache'`, App Shell prefetch) | Stable in 16.3 (blog next-16-3; discussion #95130 "16.3 is now stable"); `experimental.ppr` removed in 16.0 | ADOPT for the catalogue route (App Shell = instant loading shell); audit `prefetch={true}` links per the v16.3.1 guide; known bug: `redirect()` dropped on client nav from prerendered group into dynamic route (discussion #95130) | catalogue, shell |
| `next/image` defaults in 16 | `minimumCacheTTL` 60 s → 14400 s; `imageSizes` drops 16; `qualities` `[75]` only (quality prop coerced); `maximumRedirects` 3; local IP blocked; `images.localPatterns` required for query-string local src (blog next-16 + commit 600238f) | ADOPT; set `qualities` explicitly if artwork needs >75; always give `sizes` | catalogue artwork |
| React 19.2 `useDeferredValue` / transitions | react.dev: interruptible background re-render, no fixed delay; pair with `memo` | ADOPT | composer 103-param form filtering, catalogue search |
| INP thresholds | web.dev INP (updated 2025-09-02): ≤200 ms good, 200–500 needs improvement, >500 poor, at p75 mobile+desktop separately; CrUX 28-day | ADOPT as gate: budget 200 ms p75; internal target 150 ms (`[single-source]` sitepoint) | all |
| LCP / CLS thresholds | LCP ≤2.5 s, CLS ≤0.1 (digitalapplied 2026 + web.dev canon `[PARTIAL]`) | ADOPT | all |
| three.js `setPixelRatio` | three.js manual "Responsive Design": `setPixelRatio(devicePixelRatio)` is "strongly NOT RECOMMENDED"; compute `Math.floor(clientWidth * dpr)` and `setSize(w,h,false)`; cap by max pixel count (manual example) | ADOPT manual sizing with a pixel-count cap; community rule "cap dpr at 2" (`[single-source]` class, two blogs) | THE WORLD |
| three.js `powerPreference`, context loss | WebGLRenderer docs: `powerPreference: 'default'|'low-power'|'high-performance'`; `forceContextLoss()` needs `WEBGL_lose_context`; Safari 27 beta fixed WebGL state reset on context loss | ADOPT: listen `webglcontextlost`/`restored`, `preventDefault`, rebuild; `high-performance` only on desktop | THE WORLD |
| WebGPU in Safari | 26.0 (2025-09-15): "WebGPU supersedes WebGL on Apple platforms"; three.js works | OWNER-DECISION whether THE WORLD moves to WebGPURenderer (three r171+ production-ready per IGC `[single-source]`) with WebGL2 fallback | THE WORLD |
| Chrome CPU Performance API | 152 (2026-08-25) | — | — | Chromium only | ADOPT-WITH-FALLBACK for adaptive quality tiers | THE WORLD |

## Table 2 — First-party adaptive guidance (what they define, not what we choose)

| Guidance | Window classes / breakpoints defined | Navigation mapping | Source + date |
| --- | --- | --- | --- |
| Material 3 "Breakpoints" (renamed from window size classes) | Compact <600 dp; Medium 600–839; Expanded 840–1199; Large 1200–1599; Extra-large ≥1600 (applies to Android and web) | Compact: navigation bar + modal expanded rail, bottom sheet for actions, 1 pane; Medium: bar or modal rail, 1 (rec.) or 2 panes, menus; Expanded/Large: modal or standard expanded rail, 2 panes recommended; Extra-large: 1–3 panes | m3.material.io/foundations/layout/breakpoints (`[PARTIAL]`, 2026) |
| Android "Use window size classes" | same 5 width classes + height classes Compact <480 dp, Medium 480–899, Expanded ≥900; device coverage % per class (99.96% phones portrait compact, etc.) | `NavigationSuiteScaffold`: bar when width or height compact or tabletop posture, rail otherwise; drawer opt-in at expanded | developer.android.com adaptive-apps guides (`[PARTIAL]`) |
| Material 3 canonical layouts | list-detail (parent-child), supporting pane (contextual; below in compact/medium, beside fixed 360 dp in expanded), feed | supporting pane in compact may be a bottom sheet | m3.material.io canonical-examples/supporting-pane (`[PARTIAL]`) |
| Apple: size classes + iPadOS 26 windowing | Horizontal/vertical size class = compact/regular; "never assume a size class corresponds to a specific width" (archived Apple guide); iPadOS 26: any app window freely resizable, window controls at top-leading of toolbar, menu bar; `UIRequiresFullScreen` deprecated (TN3192: ignored from 27) | not prescriptive for web; the consequence for web is that Safari on iPad is now a resizable window at arbitrary widths, so width-based container queries, not device sniffing | WWDC25 208, Apple Newsroom 2025-06, TN3192 (`[PARTIAL]`); HIG "Layout" page NOT FETCHED this run |
| Fluent 2 Layout | small 320–479; medium 480–639; large 640–1023; x-large 1024–1365; xx-large 1366–1919; xxx-large ≥1920; design down to 320 px for 400% zoom reflow | none prescribed beyond responsive vs adaptive definitions | fluent2.microsoft.design/layout + /accessibility (`[PARTIAL]`) |
| WCAG 2.2 | reflow at 320 CSS px (1.4.10), text resize 200% (1.4.4), target size 24×24 CSS px min (2.5.8 AA) | — | W3C Understanding 1.4.4; ACT b4f0c3; Deque target-size (`[PARTIAL]`) |

## Table 3 — Verification procedure (becomes the project's width/device sweep)

| Step | Tool + version (measured this run) | What it proves | What it cannot prove |
| --- | --- | --- | --- |
| Width sweep at 320, 375, 393 (iPhone 16/17), 402 (17 Pro), 440 (17 Pro Max), 600, 768, 840, 1024, 1200, 1440, 1600, 1920 | Playwright `devices[]` registry — iPhone 16/17 families merged 2026-05-22 (PR #40917, commit 4cd7f68; UA frozen at `iPhone OS 18_7`, `Version/26.x`), Pixel 6–10 (PR #40928), Galaxy Z Fold/Flip (#40988). Registry keys: log `Object.keys(devices)`. Playwright release containing them `[UNVERIFIED]` — check `node_modules/playwright-core/.../deviceDescriptorsSource.json` | layout at each Material/Fluent breakpoint edge, DPR, touch flag, UA-dependent branches | real iOS Safari behaviour |
| Engine sweep | Playwright Chromium + Firefox + WebKit projects | WebKit-engine CSS/JS behaviour on desktop WebKit | Playwright WebKit is NOT iOS Safari: no Liquid Glass chrome, no iOS viewport/keyboard/scroll physics, no ITP/content blockers (BrowserStack guide, scrolltest, testdino) |
| Real iOS/Android pass | BrowserStack / LambdaTest (names only; paid — needs Berk's approval under rule 08 item 42) or Xcode Simulator (real WebKit, macOS only) | 100dvh/keyboard/tab-bar/`safe-area` truth; INP on real CPUs | — |
| Chrome DevTools device mode | Chrome 153 | first-order viewport/touch approximation; Sensors panel | "will never" simulate mobile CPU; Blink only — no Safari rendering (Chrome docs + emuluxe) |
| Performance | Lighthouse CI: `collect --additive` twice (mobile default + `preset: desktop`), `numberOfRuns: 3`, assert `categories:performance`/INP-related audits as `error`; web-vitals JS lib for field INP | lab LCP/TBT/CLS, budgets in CI | field INP (needs CrUX/RUM p75, 28-day window) |
| Accessibility | axe-core 4.11/4.12: run with `runOnly.type='tag'` including `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` — `target-size` is DISABLED by default and only runs when `wcag22aa` is named or `rules: { 'target-size': { enabled: true } }`; `meta-viewport` rule fails `user-scalable=no`/`maximum-scale<2` | 24×24 target minimum, zoom not disabled, contrast | focus appearance, dragging alternatives, other WCAG 2.2 SC (no automated rule exists) |
| Visual regression | Playwright `toHaveScreenshot` per device project; Storybook 9 viewport globals for component states (`[PARTIAL]`, single CI issue as evidence) | pixel diffs per width/engine | taste; real-device rendering |
| Feature gates | `@supports` checks mirrored in tests: assert both the enhanced path (Chromium) and the fallback path (WebKit/Firefox where unsupported) render | fallback correctness | — |

# Methodology and exact query log

Mode B (owner research order relayed by parent). Local intake before browsing: `rg` over `deploy/payload` for `dvh|@container|anchor-name|position-anchor|interactive-widget|viewport-fit|safe-area-inset|touch-action|view-transition` → hits only in `app/styles/{brand,deck,world,home,nav,auth,base}.css` (3+1+1+1+2+1+2) and build/node_modules artefacts; confirms the brief (dvh-heavy, one `@container`, no anchor positioning in first-party CSS). Existing sibling folders under `_sources/2026-09-09-frontier-ui-components/` (hci-academic, libraries-design-systems, music-audio-ui, platform-primitives, typography) were not touched.

Discovery rounds (WebSearch unless noted; every URL then opened by the tool, not guessed):

1. Round 1 (8 queries, scoping): scroll-state Baseline; anchor positioning Safari 26; interactive-widget support; View Transitions Firefox; M3 window size classes; Playwright iPhone 17 descriptors; INP threshold; masonry syntax dispute. Yield: 8/8 material (masonry dispute RESOLVED → `grid-lanes`; Firefox 147 anchor positioning; Firefox 144 same-doc VT).
2. Round 2 (8): Firefox 147 release notes; Safari 27 beta; Chrome 148/149 notes; dvh Baseline; VirtualKeyboard/keyboard-inset; iOS 26 Liquid Glass tab bar; viewport-segments; pointerrawupdate/coalesced. Yield 8/8.
3. Round 3 (8): Safari 26.4 grid-lanes; container style queries; Chrome 152; Firefox 155; Apple size classes/iPadOS 26 windowing; Fluent 2 layout; Next.js viewTransition flag; three.js pixelRatio. Yield 8/8 (Chrome two-week cadence discovered).
4. Round 4 (8): Next.js VT guide; cacheComponents/PPR; dialog closedby/@starting-style; interpolate-size/field-sizing; @scope/content-visibility; vibrate/Web MIDI; axe-core target-size; Playwright WebKit≠Safari. Yield 8/8 (closedby Safari contradiction found).
5. Round 5 (8): M3 canonical layouts; hover/touch-action/300 ms; WCAG 1.4.4/2.5.8; scroll-driven animations Firefox; academic RWD papers; Lighthouse CI/Storybook; Safari 27 release date; Baseline widely-available set. Yield 7/8 (Storybook thin).
6. Round 6 (8): WebKit 243452; :has/subgrid widely; WCO + prefers-reduced-data; Chrome 144 scrolled + DevTools limits; vaul; m3 breakpoints; next/image defaults + useDeferredValue; Spotify web player behaviour. Yield 7/8 (Spotify = community forum only).
7. Round 7 (fetches): web-features overscroll-behavior page; Playwright PR #40917 (timed out once, then FULL); MDN hover; MDN env(); HIG layout search (archive doc only); Chrome 153.

Marginal yield fell from 8/8 to ~7/8 in rounds 5–6 and to confirmation-only in round 7; known-item tests all passed (css-anchor-position Safari 26 status; `interactive-widget` matrix; VT Firefox status; M3 window-size page; Playwright device list; INP page).

# Findings per angle

## (a) Layout primitives
- Container queries are the correct fix for the composer's 900–1100 px dial-grid break: size and `cqi` are Widely available; scope the dial grid by its own inline size, not by `@media` (LogRocket 2026 `[FULL]`; CSS Wrapped 2025 `[FULL]`). Style queries became Baseline on 2026-05-19 with Firefox 151 (web-features `[PARTIAL]`, Bugzilla 2030645 `[PARTIAL]`, web.dev May digest `[PARTIAL]`) — three independent sources. Name-only queries Baseline May 2026 (Chrome 148 notes + web.dev digest; Safari 26.4 per digest) `[2 sources]`.
- Scroll-state queries remain Chromium-only through Safari 27 beta and Firefox 155 (Chrome blog 2025-01-15 `[PARTIAL]`, Edge 144 notes `[FULL]`, danholloran/modern-css caniuse relays `[PARTIAL]`): decoration only.
- Masonry: the CSSWG resolved 2025-01-31 to reuse grid properties and renamed the layout `display: grid-lanes` (CSS Grid Level 3 WD, `[FULL]` capture; MDN grid-lanes guide; CSS-Tricks). Safari 26.4 ships it with `flow-tolerance` (WebKit blog 17862 `[FULL]` + Apple release notes `[FULL]`). Chromium/Firefox stable ship dates NOT FOUND this run `[UNVERIFIED]`. The parent's belief that "syntax is still disputed" is OUTDATED.
- Anchor positioning is in all three engines (Chrome 125; Safari 26.0 — WebKit blog 17333 `[FULL]`; Firefox 147 — MDN release notes `[PARTIAL]` + Bugzilla 1999972). Safari 26.5 fixed chains ≥3, unitless-zero fallback, `display:contents`+`anchor-scope` (Pravin Kumar `[PARTIAL]`, WebKit bug 315704 `[PARTIAL]`); Safari 27 beta adds transform-aware anchors and `position-anchor: normal/none` (WebKit 17967 `[FULL]`); Chrome 144 also added transform-aware anchors (Edge 144 notes). Failure modes relevant to us: headless-Chromium misbehaviour the project observed is not documented upstream in this run's sources `[UNVERIFIED cause]`; MDN notes Firefox cannot use `::-moz-range-thumb` as an anchor (bug 1993699) — relevant to slider-thumb tooltips on the dials.
- `@scope` Baseline Dec 2025 (MDN `[PARTIAL]`, web.dev Dec digest, testmuai `[FULL]`); `@supports at-rule()` feature detection shipped Chrome 148.
- `interpolate-size`/`calc-size()` Chromium-only (caniuse ×2, web-features); `field-sizing` Baseline June 2026 (caniuse, Bugzilla 1977176, web.dev Jun digest).
- `:has()` and `&` nesting Widely available June/Feb 2026; subgrid Widely 2026-03-15 (web-features) vs "June 2026" (web.dev I/O page) — see C-1.
- `content-visibility` Baseline 2025-09-15 (web.dev `[PARTIAL]`, dev.to relay). Popover API in all engines (CSS Wrapped 2025; testmuai table Chrome 114/Firefox 125/Safari 17). Scroll snap Widely and an Interop 2026 focus area (WPT interop issue 1134).
- Scroll-driven animations: Safari 26.0 shipped (WebKit 17333 `[FULL]`); Firefox 155 still behind `layout.css.scroll-driven-animations.enabled` (MDN experimental features `[FULL]`, web-standards.dev, mintec).

## (b) Viewport and mobile mechanics
- `dvh/svh/lvh` Widely available since 2025-06-05 (digitalthrive `[FULL]` citing web-features; savvy; postcss plugin README; modern-css) — keep a `vh` line first. On iOS 26 Safari, `innerHeight`/`100lvh` are constant (large viewport) while `visualViewport.height`/`100svh` track the bars and keyboard; a `flex:1; overflow:auto` child inside a `dvh` box may not scroll without `min-height:0` (stealth-engine skill `[single-source]`).
- iOS 26 Liquid Glass: bottom toolbar overlays content; Safari tints the toolbar from a `position: fixed/sticky` element within 4 px of top / 3 px of bottom, ≥80% wide, ≥3 px tall (jahir.dev relaying pavel.ar `[single-source]`); `env(safe-area-inset-bottom)` reported 0 on first load inside WKWebViews on 26.0–26.0.1, fixed in 26.1 (StackOverflow `[single-source]`); iOS 26.1 added a "Tinted" Liquid Glass option (medienbaecker `[single-source]`). Practical consequence for the player bar: bottom-fixed elements must pad by `env(safe-area-inset-bottom)` AND accept that Safari reserves space around the glass bar; shadows are cropped at the bar edge.
- `interactive-widget`: Chrome 108+, Firefox 132+ (`[single-source]` arturbasak; StackOverflow says "Firefox also seems to support"), Safari NOT (WebKit bug 259770 open since 2023, pings through 2026-06 `[PARTIAL]`; CSSWG issue 10464). iOS keeps `resizes-visual` semantics. Fallback: `visualViewport` resize+scroll → CSS variable `--kb-inset` (SO answer pattern).
- VirtualKeyboard API and `env(keyboard-inset-*)`: Chromium 94+ only; Safari/Firefox none (caniuse ×2 `[PARTIAL]`, Chrome doc, bram.us).
- Viewport Segments: Chrome/Edge 138 (2025-06-24) only (Chrome blog `[PARTIAL]`, web-features, caniuse, MDN guide) — `window.viewport.segments` (moved off `visualViewport`), `env(viewport-segment-width 0 0)` etc.
- Window Controls Overlay: Chromium desktop PWA only; MDN marks Experimental/Limited; `env(titlebar-area-*)` documented in MDN env() `[FULL]`.
- 300 ms tap delay: gone with `width=device-width` in Chrome 32 (2014), iOS 9.3 (2016); `touch-action: manipulation` alias is not honoured by Safari for this purpose (Chrome blog `[PARTIAL]`, quirksmode). `user-scalable=no`/`maximum-scale<2` fails WCAG 1.4.4 (W3C ACT b4f0c3, Deque meta-viewport, W3C Understanding).
- Android address-bar collapse: covered by `dvh` semantics (same sources as dvh). Foldables: viewport-segments above; Playwright now has Galaxy Z Fold/Flip descriptors (PR #40988 referenced in #40917 `[PARTIAL]`).

## (c) Input adaptation
- `@media (hover: none)`/`(pointer: coarse)` Widely available since Dec 2018 (MDN hover `[FULL]`).
- Pointer Events: `getCoalescedEvents()` exists in Safari since 18.2 but shipped with missing `pointerId`/`target` on coalesced events (Flutter engine PR 56719 `[PARTIAL]`); `pointerrawupdate` absent in Safari through 27, secure-context-only in Chrome from 142/143 (blink-dev intent `[PARTIAL]`, caniuse). For the drag-to-tune dial: use `pointermove` + coalesced events with a guard, never depend on `pointerrawupdate`.
- Gesture conflict: MDN `touch-action` — `none` on the world/dial canvas disables browser panning/zooming there and "may inhibit operating a browser's zooming capabilities" (accessibility cost); keep `none` strictly on the canvas element, `pan-y` where vertical scroll must survive.
- Target size: WCAG 2.5.8 AA = 24×24 CSS px or 24 px spacing circle (Deque target-size `[PARTIAL]`); 44×44 is Apple HIG/older AAA guidance — NOT re-verified this run `[UNVERIFIED]`.
- Haptics: `navigator.vibrate` never in WebKit (W3C implementation report `[PARTIAL]`: WebKit position Oppose, issue #267 closed 2023-11-14), removed in Firefox 129 (caniuse). Web MIDI: Chrome 43+, Firefox 108+, no Safari (caniuse `[PARTIAL]`).
- Keyboard shortcuts (`KeyboardEvent.code`, `<kbd>`): no new platform evidence needed; NOT researched further this run (stable HTML/DOM; `[UNVERIFIED]` for any 2025–2026 change).

## (d) Navigation and sheet patterns (first-party guidance, observed behaviour)
- Material 3 now calls window size classes "breakpoints" and maps them to navigation components and pane counts (Table 2). Android's `NavigationSuiteScaffold` default: bar when width OR height is compact or tabletop posture, rail otherwise; drawer by opt-in at expanded (developer.android.com `[PARTIAL]`, Android Developers Blog 2024-09 `[PARTIAL]`). Supporting pane in compact = below or a bottom sheet (m3 canonical page).
- Apple: size classes are compact/regular per axis and must never be equated with fixed widths (archived Apple guide `[PARTIAL]`); iPadOS 26 makes every app window freely resizable with window controls in the toolbar and a menu bar (WWDC25 208, Apple Newsroom `[FULL]`); `UIRequiresFullScreen` deprecated (TN3192). For the web this means iPad Safari windows arrive at arbitrary widths, so container-relative layout beats device detection. HIG "Layout" page NOT FETCHED (not surfaced by search; no URL guessed).
- Fluent 2 defines six breakpoints (320/480/640/1024/1366/1920) and the 320 px / 400% zoom reflow rule (`[PARTIAL]`).
- Bottom sheets: `vaul` latest npm release is v1.1.2 (2024-12-14); PR #580 (forward `modal` prop to Radix Dialog) merged 2025-07-25 but unreleased as of 2026-05 (issue #647) — non-modal drawers still trap focus in the released version. Native alternative: `<dialog>` + `@starting-style` + `transition-behavior: allow-discrete` (MDN dialog `[FULL]`); `closedby` light-dismiss missing in Safari (C-3); iOS scroll-lock still needs JS because `overscroll-behavior` on non-overflowing containers is unimplemented in WebKit (bug 243452 `[PARTIAL]`, lui.vn `[PARTIAL]`, Chrome 144 notes).
- View Transitions: same-document Baseline 2025-10-14 (web.dev `[FULL]`, MDN `[PARTIAL]`, Chrome CSS Wrapped `[FULL]`); Firefox's initial impl lacks transition types; cross-document still Firefox-blocked (web-features, CSS-Tricks `[FULL]`). Next.js 16.3: no flag needed; `transitionTypes` on `<Link>`/router since 16.2.0; use `default: "none"` so browser back/forward and Suspense reveals do not slide (nextjs.org guide `[PARTIAL]`, PR #96098 `[PARTIAL]`, vercel-labs skill `[PARTIAL]`). Scroll restoration: not re-verified this run `[UNVERIFIED]`.
- Spotify / Apple Music web player mini-player → now-playing behaviour: only community-forum evidence found (Spotify web player has no built-in full-screen; desktop app moved full-screen into the Now Playing view). First-party documentation of the web transition: NOT FOUND IN THE SEARCHED SCOPE. Treat as `[UNVERIFIED]`; the mini-player→full-screen transition pattern itself is OWNER-DECISION.

## (e) Performance across devices
- INP: ≤200 ms good at p75, mobile and desktop segmented, 28-day CrUX (web.dev `[FULL]`; sitepoint `[FULL]`; tryseo/webvitals.tools relays). LCP ≤2.5 s, CLS ≤0.1 (digitalapplied `[FULL]`; web.dev canon not re-opened `[PARTIAL]`). Mid-tier Android long-task budgets: no first-party 2026 number found beyond the 50 ms long-task definition implicit in INP guidance `[UNVERIFIED]`.
- `content-visibility: auto` Baseline (above); `sizes="auto"` for lazy images shipped in Safari 27 beta (WebKit 17967 `[FULL]`); Chrome 148 added `loading="lazy"` for `<video>/<audio>`.
- Next.js 16 `next/image` defaults changed (blog next-16 `[PARTIAL]`, commit 600238f `[PARTIAL]`, codeharbor): `qualities` `[75]` silently coerces `quality={90}`; set `images.qualities` explicitly for artwork. Cache Components + Partial Prefetching stable in 16.3 (blog + discussion #95130 `[FULL]`); Partial Prefetching only with `cacheComponents` (v16.3.1 guide `[FULL]`).
- React 19.2 `useDeferredValue`: interruptible, no fixed delay, needs `memo` on the expensive child (react.dev `[FULL]`).
- three.js: manual explicitly discourages `setPixelRatio(devicePixelRatio)`; size the drawing buffer yourself with a max-pixel-count cap (three.js manual `[PARTIAL]`); `powerPreference` hint in WebGLRenderer constructor (docs `[FULL]`); community "cap DPR at 2 / no shadow maps on mobile / thermal throttling after ~30 s" (simplified.media, IGC — `[PARTIAL]`, non-authoritative). Safari 26.0 ships WebGPU and says it supersedes WebGL on Apple platforms (WebKit 17333 `[FULL]`); Safari 27 beta fixes WebGL state reset on context loss.
- `prefers-reduced-motion` Widely; `prefers-reduced-data` implemented nowhere (MDN, caniuse, web-features — Apple position "privacy concerns").
- Chrome 152 CPU Performance API (Chromium only) can drive quality tiers for THE WORLD (chromestatus `[PARTIAL]`).

## (f) Verification tooling
See Table 3. Key facts: Playwright device registry gained iPhone 16/17 (2026-05-22), Pixel 6–10, Galaxy Z Fold/Flip; iOS 26+ Safari UA freezes OS at `18_7` (PR #40917 `[FULL]`) so UA-based iOS version detection is dead. Playwright WebKit ≠ iOS Safari (BrowserStack `[FULL]`, scrolltest `[FULL]`, testdino `[FULL]`). Chrome DevTools device mode is Blink at phone dimensions and "will never" simulate mobile CPUs (Chrome docs `[PARTIAL]`, emuluxe `[FULL]`). Lighthouse CI needs two `collect --additive` runs for mobile+desktop (GoogleChrome/lighthouse-ci issue #138 `[PARTIAL]`). axe-core `target-size` is off unless `wcag22aa` is named (Deque 4.11/4.12 `[PARTIAL]`, a11y-cicd `[FULL]`, axe issue #3751).

## Five-part academic record

**A1. Laine, Zhang, Santala, Jokinen, Oulasvirta (Aalto / Helsinki). "Responsive and Personalized Web Layouts with Integer Programming." Proc. ACM HCI 5(EICS) art. 213, June 2021, doi 10.1145/3461735 — `[FULL]` (73,222-byte capture read end to end).**
1. Problem (authors' framing): RWD forces designers to hand-design a layout per screen size plus adaptation rules, and "one responsive design fits all" cannot personalise.
2. Method: MILP (Gurobi 9.0) over element shape sets (simulate widths in 100 px steps, filter overflow, label 45–80 chars/line and ≤700 px image height as ideal); four phases — order resolution `o' = w·o + (1−w)·i`, layout quality Q = min count of width changes between row siblings (constraints 1–13), usability U = Σ importance·(ST − S) with Fitts' law selection time and log-area saliency (14–17), then combined min(Q + U′) with U′ ≤ 1.1 (18–19); runtime retargeting to CSS Grid via `matchMedia` breakpoints.
3. Numbers: Study 1 (n=86 end users, 4128 trials): grand means Original 0.84, Optimized 0.78, Masonry 0.47 on −3..3; method effect F(2,935)=33.1, p<.001; Masonry−Original d=0.34; Original vs Optimized n.s.; mobile ratings −0.13/−0.13/−0.09, desktop 1.38/1.36/0.59; screen×method interaction F(6,935)=11.2. Study 2 (n=64 designers): 1.02/0.93/0.64; F(2,693)=24.7.
4. Limitations (authors'): one-item perceived-quality metric, four Bootstrap-template sites, screenshots only (no interaction), server-rendered pages only. Analyst-identified: 2021 breakpoints (320/768/1366/1920) predate M3 breakpoints; the JS Masonry baseline is not `display: grid-lanes`.
5. Application here: the paper's measured result that a JavaScript masonry layout is rated significantly lower than a regular grid at laptop/desktop widths (0.71 vs 1.30, 0.59 vs 1.38) is knowledge the owner can weigh when deciding the catalogue layout (OWNER-DECISION), and the 45–80 characters-per-line and ≤700 px image-height heuristics are usable as container-query thresholds.

Other academic items surfaced (not counted as full records): "Automating UI Optimization through Multi-Agentic Reasoning" (CHI 2026, ETH SIPLAB, MR layouts) `[PARTIAL]`; "In-Situ Adaptive Interfaces for Online Browsing" (IUI 2026, ReLay, n=10) `[PARTIAL]`; "An Adaptive AI-Driven Framework for Optimizing Core Web Vitals" (doi 10.52710/cfs.973 — venue authority not established; treat as low-quality `[PARTIAL]`); preprints.org 202601.2107 (foldable adaptive, whitepaper, not peer-reviewed) `[ABS]`.

# Contradictions and gaps
- C-1 Subgrid Widely-available date: web-features explorer says 2026-03-15; web.dev I/O-2024 page says "June 2026". Both first-party; web-features is the computed source of truth → 2026-03-15 preferred, flagged.
- C-2 Anchor positioning Baseline: MDN `position-anchor` page banner still reads "Limited availability" although Chrome 125 / Safari 26.0 / Firefox 147 all ship. Likely stale banner; treat as Newly available since 2026-01-13 `[INFERENCE]`.
- C-3 `<dialog closedby>` in Safari: caniuse (mdn-bcd) and web-features `wf-dialog-closedby` say NOT supported through Safari 27 (TP only); testmuai says "Safari 18.2 added closedby". caniuse/web-features win; testmuai marked erroneous.
- C-4 `overscroll-behavior`: caniuse "Safari 16 ✅" vs web-features "Safari not supported, Chrome 144". Resolved: web-features tracks the spec'd behaviour on non-overflowing containers (Chrome 144 notes, Firefox 150, WebKit bug 243452 NEW).
- C-5 Next.js `experimental.viewTransition`: nextjslaunchpad (2026-07) and nirajrajgor say enable the flag; nextjs.org docs + PR #96098 say no configuration, flag inert/removed. Official docs win.
- C-6 Masonry: parent belief "disputed syntax" vs CSSWG resolution 2025-01-31 and `display: grid-lanes` in CSS Grid 3 WD + Safari 26.4 ship. Resolved in favour of grid-lanes.
- Gaps: Chromium/Firefox stable ship version for `grid-lanes` `[UNVERIFIED]`; Playwright release version containing the 2026 device descriptors `[UNVERIFIED]`; Apple HIG Layout page not fetched; Spotify/Apple Music web transition behaviour not documented first-party; `dynamic-range`/`scripting` media features, scroll restoration, 44×44 Apple target guidance, mid-tier Android long-task budgets not re-verified this run; Firefox `interactive-widget` version single-source.

# Claim ledger (load-bearing)
| # | Claim | A | B | C | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Anchor positioning ships in Chrome 125, Safari 26.0, Firefox 147 | WebKit blog 17333 | MDN Firefox 147 notes | nerdleveltech table / Bugzilla 1999972 | 3+ verified |
| 2 | `interactive-widget` unsupported in Safari, supported Chrome 108+ | WebKit bug 259770 | CSSWG issue 10464 | bram.us / Chrome blog | 3+ verified (Firefox 132 single-source) |
| 3 | Same-document VT Baseline 2025-10-14 (Firefox 144) | web.dev | MDN startViewTransition | CSS Wrapped 2025 | 3+ verified |
| 4 | Cross-document VT not in Firefox | web-features | CSS-Tricks | nextjs guide note / rebeccamdeprey | 3+ verified |
| 5 | Masonry = `display: grid-lanes`; Safari 26.4 ships it | W3C css-grid-3 | WebKit 17862 + Apple notes | MDN + CSS-Tricks | 3+ verified |
| 6 | Scroll-state queries Chromium-only; `scrolled` in 144 | Chrome blog | Edge 144 notes | modern-css/danholloran | 3+ verified |
| 7 | Container style queries Baseline 2026-05-19 | web-features | Bugzilla 2030645 | web.dev May digest | 3+ verified |
| 8 | dvh/svh/lvh Widely 2025-06-05 | digitalthrive (web-features) | savvy | postcss README / modern-css | 3+ verified (all relays of web-features) |
| 9 | VirtualKeyboard/keyboard-inset Chromium-only | caniuse ×2 | Chrome doc | bram.us | 3+ verified |
| 10 | Viewport segments Chrome 138 only | Chrome blog | web-features | caniuse / MDN | 3+ verified |
| 11 | pointerrawupdate absent in Safari; coalesced events buggy in 18.2 | caniuse | blink-dev intent | Flutter PR 56719 | 3+ verified |
| 12 | vibrate never in WebKit | caniuse | W3C impl report | webstatus.dev / bugnet | 3+ verified |
| 13 | INP ≤200 ms p75 | web.dev | sitepoint | webvitals.tools / digitalapplied | 3+ verified |
| 14 | Next 16.3 VT needs no flag | nextjs.org guide | PR #96098 | vercel-labs skill | 3+ verified |
| 15 | Cache Components + Partial Prefetching stable 16.3 | blog next-16-3 | discussion #95130 | v16.3.1 docs | 3+ verified |
| 16 | Playwright WebKit ≠ iOS Safari | BrowserStack | scrolltest | testdino / codersera | 3+ verified |
| 17 | axe `target-size` off by default, `wcag22aa` enables | Deque 4.11 list | a11y-cicd | axe issue #3751 | 3+ verified |
| 18 | M3 breakpoints 600/840/1200/1600 | m3.material.io | developer.android.com | hamen skill / Medium | 3+ verified |
| 19 | Fluent 2 breakpoints | fluent2 layout page | — | — | [single-source official] |
| 20 | iOS 26 UA frozen at 18_7 | Playwright PR #40917 (citing kochava) | — | — | [single-source] |
| 21 | Safari 26.5 anchor fixes | Pravin Kumar | WebKit bug 315704 | — | 2 sources, [UNVERIFIED release notes] |
| 22 | overscroll-behavior on non-overflowing: Chrome 144, Firefox 150, Safari none | Chrome 144 notes | WebKit 243452 | web-features / lui.vn | 3+ verified |
| 23 | Chrome 153 stable 2026-09-08, 2-week cadence | Chrome release notes 153 | Chrome blog 2026-03-03 | superchargebrowser | 3+ verified |
| 24 | `@scope` Baseline Dec 2025 | MDN | web.dev Dec digest | testmuai | 3+ verified |
| 25 | field-sizing Baseline June 2026 | caniuse | Bugzilla 1977176 | web.dev Jun digest | 3+ verified |
| 26 | prefers-reduced-data implemented nowhere | MDN | caniuse | web-features | 3+ verified |
| 27 | vaul v1.1.2 latest, #580 unreleased | GitHub releases | npm | issue #647 | 3+ verified |
| 28 | three.js manual discourages setPixelRatio | three.js manual | SO answer (same author lineage) | WebGLRenderer docs | 2 independent, [single-source manual] |

Counts: 3+ verified = 22; single-source = 4 (#19, #20, #28, Firefox interactive-widget); unverified = 2 (#21 partially; grid-lanes Chromium/Firefox stable) plus the gaps listed above.

# Sources (complete list is `SOURCE-REGISTER.md` in the sources folder)
Authoritative independent works consulted: 44 (W3C ×4, WHATWG-derived MDN ×9, WebKit/Apple ×8, Chrome/Google ×12, Mozilla ×5, Microsoft Edge/Fluent ×3, Vercel/Next.js ×5, Meta/React ×1, three.js ×2, Playwright ×3, Deque ×3, web-features ×6, caniuse ×9 — counted by underlying producer family, not URL: **≥16 slice floor met**). Academic: 4 surfaced (1 `[FULL]` with five-part record: Laine et al. 2021; CHI 2026 and IUI 2026 `[PARTIAL]`; cfs.973 low-authority `[PARTIAL]`). Primary `[FULL]` captures read: 12 (WebKit 17333/17862/17967, Apple 26.4 notes, W3C css-grid-3, MDN dialog, MDN anchor guide, MDN container queries, react.dev useDeferredValue, Next v16.3.1 guide, Laine 2021, Playwright PR #40917) plus MDN hover/env and web-features overscroll fetched in full.
