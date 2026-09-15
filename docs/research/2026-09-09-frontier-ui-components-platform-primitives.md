# Standards ledger

| Governing standard | How this run met it | Status |
| --- | --- | --- |
| Deep-research covenant (`C:\Users\berke\.cursor\skills\deep-research\SKILL.md`, SHA-256 `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB`, 1309 lines, read in full and re-hashed 2026-09-09T14:46:39+03:00) | MODE B owner research order, delegated slice. Discovery-first (broad scoping searches before any fetch); newest-first (Sept 2026 engine releases first); source register with SHA-256 of every capture; query ledger; claim ledger with independence rationale; contradictions preserved; `[single-source]` / `[UNVERIFIED]` flags; slice floor ≥14 independent authoritative sources met (41 distinct works, 15 provenance families); ACADEMIC FLOOR NOT MET FOR THIS SLICE (0 academic `[FULL]`, 1 academic `[ABS]`, no directly relevant peer-reviewed primary found — stated in §Contradictions and gaps, per R15.4 the shortfall is named in the same place as the counts). | Met, with the named academic shortfall |
| Rule 10 no-narrowing | Every primitive listed in CONTEXT-02 appears in the Outcome table (67 rows, machine-counted) with a dated per-engine state or an explicit `[UNVERIFIED]` / `NOT FOUND IN THE SEARCHED SCOPE`. | Met |
| Rule 14 design contract | KNOWLEDGE only. No palette, type, spacing, layout or component design is pre-filled; every design slot remains OWNER-DECISION. The ADOPT/AVOID verdicts are support-and-risk knowledge, not visual decisions. | Met |
| Rule 20 frontier engineering / 20 frontier frontend | Report gives exact syntax and version gates so the rebuild can wire constants (feature gates) from data, not from memory. No code written by this worker (write isolation). | Met |
| Rule 24 no-harm / frontier | Speed not traded for verification: 41 sources, 20 read `[FULL]`; every support claim carries version + date + source id; where sources conflict, the conflict is shown, not averaged. | Met |
| Rule 25 anti-deception | Flags used in this report: `[FULL]`, `[PARTIAL]`, `[ABS]`, `[single-source]`, `[UNVERIFIED]`, `NOT FOUND IN THE SEARCHED SCOPE`, `INFERENCE`, `HYPOTHESIS`, `STALE/SUPERSEDED`, `VERSION-CONFLICT`. Nothing below is recalled; every version/date is read from a capture named in §Source register. | Met |
| Rule 26 memory-first / no-rote | Governing files read from disk this run before any external call; project component and style file lists read from disk (`deploy/payload/components/**`, `deploy/payload/app/styles/**`) to name replacement targets. | Met |
| Write isolation (CONTEXT-16) | Only this file and files under `docs/research/_sources/2026-09-09-frontier-ui-components/platform-primitives/` were created. No other repository file was modified. | Met |

Path resolution (R15.1): governed research root = `c:\Berk\PlayMusicPrompts\docs\research\` (default convention; no project-specific override found in `CLAUDE.md` / `AGENTS.md`, which name only `memory/`). Report: `docs/research/2026-09-09-frontier-ui-components-platform-primitives.md`. Captures: `docs/research/_sources/2026-09-09-frontier-ui-components/platform-primitives/S01…S34`.

# Scope plan / decision served / why / project context

- **Decision served:** which native HTML/CSS/Web-platform primitives PlayMusicPrompts adopts as the foundation of its from-scratch interface rebuild (Berk, 2026-09-09: "tüm fontlar yazılar stiller en ileri seviyede html elementleri ile olacak"), and for each primitive whether it is ADOPT, ADOPT-WITH-FALLBACK, or AVOID as of 2026-09-09.
- **Why:** the rebuild in `deploy/payload/components/**` and `deploy/payload/app/styles/**` starts immediately after this research and deploys to https://www.playmusicprompts.com; a wrong support claim ships a broken control to Safari/Firefox users and costs the owner a correction round.
- **Project state (read from disk this run):** 24 component files (`auth/AuthForm, AuthPage; catalogue/Cover, TrackCard; compose/Composer, EnhancePanel, ParamControls, PromptEditor; fx/SoundField, Terrain; home/HomePage; musics/MusicsPage; shell/AccountControl, AppShell, Brand, Icon, PlayerBar; stream/StreamEngineContext; track/TrackActions; ui/Combobox, Dial, KeyWheel, Segmented; world/WorldView`) and 14 stylesheets (`auth, base, brand, composer-controls, deck, home, motion, musics, nav, params, player, tokens, track, world .css`). Parent's measurement today: 0 uses of `<dialog>`, `<search>`, `<hgroup>`, `<output>`, `<meter>`, `<progress>`, `<time>`, `<fieldset>`, `@layer`, `@scope`, `text-wrap`, `oklch`, `font-variation-settings`, view transitions.
- **Engine baseline used throughout:** stable channels on 2026-09-09 — Chrome 152 (stable 2026-08-25, S10), Firefox 155 (2026-09-01, S20), Safari 26.6 (the Interop dashboard's stable Safari run on 2026-09-06 is `26.6 (21624.4.5.11.5)`, S18). Safari 27 is a BETA (WebKit blog 2026-06-08 and Apple's page titled "Safari 27 Beta Release Notes", S01/S02); its final release date is `[UNVERIFIED]` in this run.
- **Verdict semantics:** ADOPT = shipped in all three engines' current stable and Baseline "newly" or "widely" (or ≥3 primaries agree) — use unconditionally. ADOPT-WITH-FALLBACK = shipped in Chromium and at least one other engine, or Baseline "newly" for < 6 months, or engine-specific behaviour gaps — use behind `@supports` / feature detection with a designed fallback (never a deletion). AVOID = single-engine or beta-only or not in any stable engine — do not ship as load-bearing; may be used only as a pure progressive enhancement that changes nothing when absent.
- **Falsifiers:** any primary (vendor release note, Interop dashboard row, webstatus.dev record) dated after 2026-09-09 that changes an engine's state flips the verdict for that row; the watchlist in §Living-update lists the exact queries.
- **Geography:** GLOBAL (project vision: "Users on phone/tablet/desktop worldwide"). **Language:** English primaries. **Time:** newest first (2025–2026), foundational specs dated. **Access:** lawful only; no paywalls bypassed.
- **Planned artifacts (count 2 + captures):** this report (1); source-register folder (1 folder, 20 capture files S01–S34 grouped in 20 files). Produced: 1 report + 20 capture files. Planned-vs-produced: report 1/1; captures folder 1/1.

# Outcome first — per-engine support table (as of 2026-09-09)

Columns: Chromium version@stable-date | WebKit (Safari, incl. iOS) version@date | Gecko (Firefox) version@date | Baseline status (webstatus.dev, S12) | verdict | sources. "—" = not shipped in stable. Dates are the engine's stable release date as recorded by the named source. Baseline: `widely` / `newly (low_date)` / `limited`.

## A. Overlays, invokers, dialogs

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 1 | Popover API (`popover=auto|manual`, `popovertarget`, `popovertargetaction`, light-dismiss, `:popover-open`, `::backdrop`, `beforetoggle/toggle`) | 116@2023-08-15 | 17@2023-09-18 (iOS 18.3@2025-01-27) | 125@2024-04-16 | newly 2025-01-27 | **ADOPT** | S12, S23, S14 |
| 2 | `popover="hint"` | shipped; version VERSION-CONFLICT: 133 (third-party cards) vs 151@2026-07-28 (webstatus.dev) | — (Interop 2026 focus area) | 149@2026-03-24 (MDN); webstatus.dev says 153@2026-07-21 (spec-behaviour alignment whatwg/html#12345) | limited | **ADOPT-WITH-FALLBACK** (unsupported engines treat `hint` as `auto`, per HTML invalid-value default → tooltips would light-dismiss open menus in Safari) | S07, S21, S12, S04 |
| 3 | Invoker Commands (`command`, `commandfor`; `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, custom `--x`) | 135@2025-04-01 | 26.2@2025-12-12 | 144@2025-10-14 | newly 2025-12-12 | **ADOPT** (Baseline newly < 12 months; keep a `click`-handler fallback only if analytics show pre-26.2 iOS share > owner threshold — OWNER-DECISION) | S05, S06, S12 |
| 4 | `<dialog>` (`showModal()`, `:modal`, `::backdrop`) | 37@2014-08-26 | 15.4@2022-03-14 | 98@2022-03-08 | widely (high 2024-09-14) | **ADOPT** | S12 |
| 5 | `dialog.requestClose()` | 134@2025-03-04 | 18.4@2025-03-31 | 139@2025-05-27 | newly 2025-05-27 | **ADOPT** | S12, S05 (`request-close` command) `[2 sources]` |
| 6 | `<dialog closedby="any|closerequest|none">` | 134@2025-03-04 | — (Interop 2026 focus; Safari dialogs-and-popovers score 553/1000 on 2026-09-06) | 141@2025-07-22 | limited | **ADOPT-WITH-FALLBACK** (always ship an explicit close button; light-dismiss in Safari via a JS backdrop-click handler) | S12, S04, S18 |
| 7 | `:open` pseudo-class (`<details>`, `<dialog>`, `<select>`, `<input>`) | 133@2025-02-04 | 26.5@2026-05-11 | 136@2025-03-04 | newly 2026-05-11 | **ADOPT-WITH-FALLBACK** (< 4 months in Safari; fallback `[open]` attribute selector for details/dialog) | S12, S28, S04 |
| 8 | `ToggleEvent.source` | 140@2025-09-02 | 26.5@2026-05-11 | 145@2025-11-11 | newly 2026-05-11 | ADOPT-WITH-FALLBACK | S12, S28 |
| 9 | Interest invokers (`interestfor`, `interest-delay`) | listed on MDN Popover API page; engine versions NOT captured in this run | `[UNVERIFIED]` | `[UNVERIFIED]` | `[UNVERIFIED]` | **AVOID** until verified (out of CONTEXT-02 list; noted because MDN groups it with Popover) | S23 |

## B. Customizable `<select>`

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 10 | `appearance: base-select` on `select` and `::picker(select)` | 135@2025-04-01 (blink intent estimated M134, shipped in 135 — VERSION-CONFLICT resolved in favour of webstatus.dev/MDN) | **Safari 27 BETA only** (WebKit blog 2026-06-08; not in 26.6 stable) | — (behind `dom.select.customizable_select.enabled` + `layout.css.appearance-base.enabled`, Firefox 149 notes: only `<select>` styling, not `::picker(select)`; parser groundwork shipped in 153) | limited | **ADOPT-WITH-FALLBACK — as pure progressive enhancement only**: the classic `<select>` renders natively where unsupported (Open UI + WebKit + MDN all state the fallback). NOT a replacement for `ui/Combobox.tsx` today; **confirms the parent's CONTEXT-18 measurement (Chrome 135 + Safari 27 beta only)**. | S01, S12, S07, S21, S24, S16, S17 |
| 11 | `<selectedcontent>` | 135@2025-04-01 (with #10) | Safari 27 beta | — | limited | same as #10 | S01, S24, S17 |
| 12 | `::picker-icon`, `::checkmark` | 135 (with #10) | Safari 27 beta | — | limited | same as #10; note MDN: not in the accessibility tree | S01, S17, S24 |
| 13 | `<selectlist>` / `<selectmenu>` | STALE/SUPERSEDED names, never shipped unflagged | — | — | n/a | **AVOID** (renamed to customizable `<select>`; Open UI page: "Selectlist has been renamed to customzable select") | S25, S16, S24 |
| 14 | MDN SSR/hydration warning | MDN (S17): "Some JavaScript frameworks block these features; in others, they cause hydration failures when Server-Side Rendering (SSR) is enabled." | | | | Confirms CONTEXT-18: for Next.js 16 App Router, the `<button>`/`<selectedcontent>` children of `<select>` must survive React's DOM reconciliation; test hydration before adopting (another worker owns the React evaluation). | S17 |

## C. Anchor positioning

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 15 | CSS Anchor Positioning core (`anchor-name`, `position-anchor`, `anchor()`, `anchor-size()`, `position-area`, `position-try-fallbacks`, `@position-try`, `anchor-center`) | 125@2024-05-14 | 26.0@2025-09-15 | 147@2026-01-13 | **CONTRADICTION**: webstatus.dev `anchor-positioning` lists NO available implementation (status limited) while caniuse (Chrome 125 y / Firefox 147 y / Safari 26.0 y, usage 84.12%), MDN Firefox 147 ("enabled by default"), WebKit 26.0 blog and the Interop 2026 dashboard (Chrome 1000 / Firefox 1000 / Safari 989 of 1000 on 2026-09-06) all say shipped | **ADOPT-WITH-FALLBACK** (all three engines ship it; Firefox only since 2026-01-13 and iOS < 26 has none → `@supports (anchor-name: --a)` with a fixed-position fallback; also see §CONTEXT-18 finding on `position-anchor: normal`) | S13, S14, S18, S12, S15 |
| 16 | `position-anchor: normal` (new initial value) / `none` | 151@2026-07-28 (initial changed from `none` to `normal`) | Safari 27 beta (initial `auto` → `normal`) | 151@2026-05-19 | n/a | **KNOWLEDGE — critical**: with `normal`, an element without `position-area` has NO default anchor, so bare `anchor()` calls (no `<anchor-name>`) do not resolve unless `position-anchor: auto` or an explicit name is set (spec §2.4). | S13, S01, S34, S15 |
| 17 | `position-visibility` (`anchors-visible`/`anchor-visible`, `no-overflow`) | plural keywords: —/renamed (spec discourages plurals); Chrome state of singular keywords `[UNVERIFIED]` | 26.2@2025-12-12 (plurals), singular in 27 beta | 147@2026-01-13 (plurals) | limited | ADOPT-WITH-FALLBACK (write both spellings) | S05, S01, S12 |
| 18 | `position-try-fallbacks: flip-x / flip-y`, `position-try-order` | 125 (core) | 26.2@2025-12-12 (`flip-x/flip-y`) | 147 | limited | ADOPT-WITH-FALLBACK with #15 | S05, S12 |
| 19 | Transform-aware anchor positioning | 144@2026-01-13 | Safari 27 beta | — | limited | KNOWLEDGE: an anchor with `transform`/`scale`/`rotate` mis-positions its popover in Safari 26.x and Firefox → do not animate anchors with transforms in `ui/Dial`/`KeyWheel` tooltips | S01, S12 |
| 20 | Anchored container queries (`@container anchored(fallback: …)`) | 143@2025-12-02 | — | — | limited | **AVOID** (single engine) | S12 |

## D. View transitions and motion

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 21 | Same-document View Transitions (`document.startViewTransition`, `view-transition-name`, `::view-transition-*`) | 111@2023-03-07 | 18@2024-09-16 | 144@2025-10-14 | newly 2025-10-14 | **ADOPT** (guard with `if (document.startViewTransition)`; Firefox score 798/1000 on 2026-09-06 → test in Firefox) | S12, S18, S04 |
| 22 | View transition types (`:active-view-transition-type()`, `types`) / `document.activeViewTransition` | 125@2024-05-14 | 18.2@2024-12-11 | 147@2026-01-13 (SPA only) | newly 2026-01-13 (`active-view-transition`) | ADOPT-WITH-FALLBACK | S12, S13, S05 |
| 23 | Cross-document View Transitions (`@view-transition { navigation: auto }`) | 126@2024-06-11 | 18.2@2024-12-11 | — (Interop 2026 focus) | limited | **ADOPT-WITH-FALLBACK** (MPA navigations in Next.js App Router are client-side anyway; treat as enhancement only) | S12, S13, S04 |
| 24 | Element-scoped view transitions (`element.startViewTransition()`) | 147@2026-04-07 | — | — | limited | **AVOID** (single engine) | S29, S12 |
| 25 | Scroll-driven animations (`animation-timeline: scroll()/view()`, `scroll-timeline`, `view-timeline`, `animation-range`) | 115@2023-07-18 (named range `scroll` added 147) | 26.0@2025-09-15 (threaded/compositor in 26.4@2026-03-24) | **— NOT SHIPPED** (behind `layout.css.scroll-driven-animations.enabled` in Firefox 155; Interop 2026 Firefox score 88/1000 on 2026-09-06) | limited | **ADOPT-WITH-FALLBACK** (`@supports (animation-timeline: scroll())`; Firefox gets static layout or a `prefers-reduced-motion`-style alternative, never a deletion of the content) | S20, S18, S14, S08, S29, S12 |
| 26 | `@starting-style` | 117@2023-09-12 | 17.5@2024-05-13 | 129@2024-08-06 | newly 2024-08-06 | **ADOPT** | S12, S17 |
| 27 | `transition-behavior: allow-discrete` | 117@2023-09-12 | 17.4@2024-03-05 | 129@2024-08-06 | newly 2024-08-06 | **ADOPT** | S12, S17 |
| 28 | `display` animation (`display: none` ↔ block transitions with allow-discrete) | 117@2023-09-12 | 18@2024-09-16 | — | limited | ADOPT-WITH-FALLBACK (Firefox: no exit animation; content still hides) | S12 |
| 29 | `prefers-reduced-motion` | 74@2019-04-23 | 10.1@2017-03-27 | 63@2018-10-23 | widely | **ADOPT** (mandatory floor, rule 14) | S12 |

## E. Layout, containment, scoping, selectors

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 30 | Container size queries (`container-type`, `@container (inline-size …)`) | 105@2022-09-02 | 16@2022-09-12 | 110@2023-02-14 | widely (high 2025-08-14) | **ADOPT** | S12 |
| 31 | Container units (`cqi`, `cqw`, `cqb`, `cqmin/max`) | part of container-queries feature (webstatus groups them; no separate record found) | same | same | widely (as part of #30) | **ADOPT** `[INFERENCE: grouped under container-queries in web-features]` | S12 |
| 32 | Container style queries (`@container style(--x: v)`) | 111@2023-03-07 | 18@2024-09-16 | 151@2026-05-19 | newly 2026-05-19 | **ADOPT-WITH-FALLBACK** (< 4 months in Firefox; Safari Interop score 833/1000 → verify edge cases) | S12, S34, S18, S04 |
| 33 | Style-query range syntax (`style(--x > 3)`) | 142@2025-10-28 | — | — (behind flag in 151) | limited | **AVOID** | S12, S34 |
| 34 | Name-only container queries (`@container card { … }`) | 148 (per Front-End-News card `[ABS]`) | 26.4@2026-03-24 | 149@2026-03-24 | `[UNVERIFIED baseline]` | ADOPT-WITH-FALLBACK | S08, S07 |
| 35 | Container scroll-state queries (`@container scroll-state(stuck: top)`) | 133@2025-02-04 | — | — | limited | **AVOID** (single engine) — for the sticky `PlayerBar`, use IntersectionObserver instead | S12 |
| 36 | `@scope` | 143@2025-12-02 (webstatus record; earlier partial shipping likely — see contradiction C6) | 26.4@2026-03-24 (webstatus) — but WebKit 26.2 blog (2025-12-12) already documents `@scope` working with `:host`/adopted sheets | 146@2025-12-09 | newly 2026-03-24 | **ADOPT-WITH-FALLBACK** (Baseline newly < 6 months; components can be written so that `@scope` only tightens specificity and plain descendant selectors remain correct) | S12, S05 |
| 37 | `@layer` cascade layers | 99@2022-03-01 | 15.4@2022-03-14 | 97@2022-02-08 | widely (high 2024-09-14) | **ADOPT** | S12 |
| 38 | `:has()` | 105@2022-09-02 | 15.4@2022-03-14 | 121@2023-12-19 | widely (June 2026 digest) | **ADOPT** (Safari 27 beta lists many `:has()` invalidation-performance fixes → keep `:has()` out of hot-path animations) | S12, S01 |
| 39 | CSS Nesting (`&`) | 120@2023-12-05 | 17.2@2023-12-11 | 117@2023-08-29 | widely (high 2026-06-11) | **ADOPT** | S12 |
| 40 | Subgrid | 117@2023-09-12 | 16@2022-09-12 | 71@2019-12-10 | widely (high 2026-03-15) | **ADOPT** | S12 |
| 41 | `overflow: clip` | 90@2021-04-13 | 16@2022-09-12 | 81@2020-09-22 | widely | **ADOPT** (`overflow-clip-margin`: Firefox 148 only → avoid) | S12 |
| 42 | `scrollbar-gutter: stable` | 94@2021-09-21 | 18.2@2024-12-11 | 97@2022-02-08 | newly 2024-12-11 | **ADOPT** | S12 |
| 43 | `content-visibility` (`auto`/`hidden`) | 108@2022-11-29 | 26@2025-09-15 | 130@2024-09-03 | newly 2025-09-15 | **ADOPT-WITH-FALLBACK** (iOS < 26 ignores it; harmless) — for the 46-track `MusicsPage` grid | S12, S14 |
| 44 | `inert` attribute | 102@2022-05-24 | 15.5@2022-05-16 | 112@2023-04-11 | widely (high 2025-10-11) | **ADOPT** | S12 |
| 45 | `interactivity: inert` (CSS) | 135@2025-04-01 | — | — | limited | **AVOID** | S12 |
| 46 | `:user-valid` / `:user-invalid` | 119@2023-10-31 | 16.5@2023-05-18 | 88@2021-04-19 | widely (high 2026-05-02) | **ADOPT** (for `AuthForm`, `PromptEditor` validation states) | S12 |
| 47 | `:focus-visible` | 86@2020-10-20 | 15.4@2022-03-14 | 85@2021-01-26 | widely | **ADOPT** (Safari 27 beta fixed a false-positive after programmatic `focus()`) | S12, S01 |
| 48 | Speculation Rules (`<script type="speculationrules">`) | 109@2023-01-10 (`form_submission` field 151) | — | — | limited | **ADOPT-WITH-FALLBACK** (pure hint, no-op elsewhere; Next.js already prefetches routes — verify no double-prefetch) | S12, S13 |

## F. Semantic HTML elements

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 49 | `<search>` | 118@2023-10-10 | 17@2023-09-18 | 118@2023-09-26 | widely (high 2026-04-13) | **ADOPT** (older UAs: add `role="search"` — the element degrades to a generic block) | S12 |
| 50 | `<details name="…">` exclusive accordion | 120@2023-12-05 | 17.2@2023-12-11 | 130@2024-09-03 | newly 2024-09-03 | **ADOPT** | S12 |
| 51 | `::details-content` | 131@2024-11-12 | 18.4@2025-03-31 | 143@2025-09-16 | newly 2025-09-16 | ADOPT-WITH-FALLBACK (styling only) | S12 |
| 52 | `<hgroup>` | 5@2010-05-25 | 5@2010-06-07 | 4@2011-03-22 | widely | **ADOPT** (HTML LS: heading + `<p>` subtitle) | S12 |
| 53 | `<output>` | 10@2011-03-08 | 7@2013-10-22 | 4@2011-03-22 | widely | **ADOPT** (live result of `ParamControls`/`Dial`; implicit `aria-live="polite"`) | S12 |
| 54 | `<meter>` | 6@2010-09-02 | 6@2012-07-25 (iOS 10.3) | 56@2017-09-28 | widely | **ADOPT** (bounded gauges e.g. queue capacity) | S12 |
| 55 | `<progress>` | 6@2010-09-02 | 6@2012-07-25 | 6@2011-08-16 | widely | **ADOPT** (generation/load progress; indeterminate without `value`) | S12 |
| 56 | `<time datetime>` | 62@2017-10-17 | 10@2016-09-20 | 22@2013-06-25 | widely | **ADOPT** (track dates/durations, `datetime="PT3M12S"`) | S12 |
| 57 | `<data value>` | 62@2017-10-17 | 10@2016-09-20 | 22@2013-06-25 | widely | **ADOPT** (machine value for BPM/key chips) | S12 |
| 58 | `<datalist>` | 69@2018-09-04 | 12.1@2019-03-25 (iOS 12.2) | 110@2023-02-14 | **limited** (webstatus: partial support somewhere in the set — reason not captured) | **ADOPT-WITH-FALLBACK** (text suggestions only; do not rely on it for range/colour inputs) | S12 |
| 59 | `<fieldset>`/`<legend>` (parent measured 0 uses) | — legacy, universally supported (not queried) | | | | ADOPT `[not separately measured this run]` | — |

## G. Text, colour, fonts, theming

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 60 | `field-sizing: content` | 123@2024-03-19 | 26.2@2025-12-12 | 152@2026-06-16 | newly 2026-06-16 | **ADOPT-WITH-FALLBACK** (< 3 months in Firefox; fixed `rows` fallback for `PromptEditor` textarea) | S12, S05, S34 |
| 61 | `text-wrap: balance` / `pretty` / `stable` | 130@2024-10-15 (`text-wrap` feature) | 17.5@2024-05-13; `pretty` 26.0@2025-09-15 | 124@2024-03-19 | newly 2024-10-17 | **ADOPT** (`balance` for headings; `pretty` where supported — WebKit applies it to all lines, Chromium's algorithm differs → visual difference is expected, not a bug) | S12, S14 |
| 62 | `light-dark()` | 123@2024-03-19 | 17.5@2024-05-13 | 120@2023-11-21 | newly 2024-05-13 | **ADOPT** (requires `color-scheme` set; `light-dark()` for `<image>` values: Chrome 150/Firefox 150 only → AVOID) | S12, S02 |
| 63 | `color-scheme` | 98@2022-02-01 | 13@2019-09-19 | 96@2022-01-11 | widely | **ADOPT** (owner's dark theme → `color-scheme: dark` on `:root` so form controls/scrollbars match) | S12 |
| 64 | `color-mix()` | 111@2023-03-07 | 16.2@2022-12-13 | 113@2023-05-09 | widely | **ADOPT** (≥3 colours: Firefox 150 + Safari 27 beta only → AVOID variadic) | S12, S02 |
| 65 | `oklch()` / `oklab()` | 111@2023-03-07 | 15.4@2022-03-14 | 113@2023-05-09 | widely (high 2025-11-09) | **ADOPT** (brand violet→magenta→cyan gradient in `oklch` with `in oklch` interpolation; gradient interpolation Baseline newly 2024-06-11) | S12 |
| 66 | Relative colour syntax (`oklch(from var(--brand) l c h / 0.5)`) | 125@2024-05-14 | 18@2024-09-16 | 128@2024-07-09 | newly 2024-09-16 | **ADOPT** (`alpha()` shorthand: Chrome 151 + Firefox 155 only → AVOID) | S12, S20 |
| 67 | `contrast-color()` | 147@2026-04-07 | 26.0@2025-09-15 | `[UNVERIFIED]` (Baseline 2026 list includes it → implies Firefox shipped; version not captured) | in Baseline 2026 list (web.dev) | ADOPT-WITH-FALLBACK | S29, S14, web.dev Baseline 2026 `[ABS]` |
| 68 | `hanging-punctuation` | — | 26.5 (fixes; earlier partial) | — | limited | **AVOID** as dependency (harmless enhancement for quotes) | S12, S28 |
| 69 | `text-box-trim` / `text-box-edge` / `text-box` | 133@2025-02-04 | 18.2@2024-12-11 | **154@2026-08-18 (MDN)** — CONTRADICTION: webstatus.dev still shows Firefox `—` | limited (stale) | **ADOPT-WITH-FALLBACK** (all three engines now ship; Firefox 3 weeks old → guard with `@supports (text-box-trim: trim-both)`) | S33, S12 |
| 70 | `font-optical-sizing: auto` | 79@2019-12-10 | 13.1@2020-03-24 | 62@2018-09-05 | widely | **ADOPT** (variable fonts; `font-variation-settings` 0 uses today) | S12 |
| 71 | `font-palette` / COLRv1 colour fonts | `font-palette` 101; COLRv1 98@2022-02-01 | `font-palette` 15.4; **COLRv1 — (WebKit standards-position issue #415, not shipped)** | 107 / 107 | `font-palette` widely; COLRv1 limited | **AVOID COLRv1 as a dependency** (Safari has no COLRv1) — use SVG/CSS for the logo, `font-palette` only with COLRv0 fonts | S12 |
| 72 | `accent-color` | 93@2021-08-31 | 26.2@2025-12-12 | 92@2021-09-07 | webstatus says `limited` despite three versions listed (data anomaly, see C8) | ADOPT-WITH-FALLBACK (native checkbox/radio/range tint) | S12 |
| 73 | `prefers-contrast` / `forced-colors` | 96 / 89 | 14.1 / 16 | 101 / 89 | widely / widely | **ADOPT** (test in Windows High Contrast; glass-on-black brand must survive `forced-colors: active`) | S12 |
| 74 | `prefers-reduced-transparency` | 119@2023-10-31 | — | — | limited | **ADOPT-WITH-FALLBACK** (harmless media query; the glass surfaces should also honour `prefers-reduced-motion`) | S12 |
| 75 | CSS `if()` | 137@2025-05-27 | — | — | limited | **AVOID** | S12 |
| 76 | CSS custom functions `@function` | 139@2025-08-05 | — (Safari 27 beta lists "cycle detection … in CSS custom functions" fixes → WebKit has an implementation, shipping state `[UNVERIFIED]`) | — | limited | **AVOID** | S12, S01 |
| 77 | `sibling-index()` / `sibling-count()` | `[UNVERIFIED version]` | 26.2@2025-12-12 | 154@2026-08-18 | `[UNVERIFIED]` | ADOPT-WITH-FALLBACK (stagger animations of `TrackCard`s; fallback: no stagger) | S05, S33 |

## H. Viewport, foldables, audio, GPU

| # | Primitive | Chromium | WebKit | Gecko | Baseline | Verdict | Sources |
|---|---|---|---|---|---|---|---|
| 78 | `dvh` / `svh` / `lvh` (+ `dvi`, `svb`…) | 108@2022-11-29 | 15.4@2022-03-14 | 101@2022-05-31 | widely (high 2025-06-05) | **ADOPT** (`AppShell` height = `100dvh`) | S12 |
| 79 | `<meta name="viewport" content="interactive-widget=resizes-content">` | 108 `[third-party card, single-source]` | **— not shipped**: implementation merged in WebKit main (PR #70058, #72058; bug 259770) but not in Safari 26.6 or 27 beta notes | `[UNVERIFIED]` — third-party says 132, but MDN Firefox 132 notes contain no such entry | not in web-features index (searched "interactive-widget", "virtual keyboard": only Chromium-only `virtual-keyboard` API found) | **ADOPT-WITH-FALLBACK** (harmless meta; iOS still needs `visualViewport` JS for keyboard-aware `PlayerBar`) | S31, S22, S12 |
| 80 | Viewport Segments / foldable (`env(viewport-segment-*)`, `horizontal-viewport-segments` MQ) | 138@2025-06-24 | — | — | limited | **AVOID** (single engine) | S12 |
| 81 | Web Audio `AudioWorklet` | 66@2018-04-17 | 14.1@2021-04-26 | 76@2020-05-05 | widely (high 2023-10-26) | **ADOPT** (support only, for `fx/SoundField`) | S12 |
| 82 | Web Audio `AnalyserNode` | in `web-audio` feature: 35@2014-05-20 | 14.1@2021-04-26 | 25@2013-10-29 | widely (high 2023-10-26) | **ADOPT** (support only) | S12 |
| 83 | WebGPU | 144@2026-01-13 (webstatus record) | 26@2025-09-15 | — (Firefox 147: enabled on macOS Apple Silicon only; not all platforms) | limited | **ADOPT-WITH-FALLBACK** (three.js 0.186 WebGPU renderer with WebGL fallback for `WorldView`) | S12, S14, S13 |

## I. Interop programmes

| # | Item | State on 2026-09-06 (stable runs, S18) | Sources |
|---|---|---|---|
| 84 | Interop 2026 focus areas (20): anchor positioning, attr(), contrast-color(), container style queries, CSS zoom, custom highlights, dialogs & popovers (`closedby`, `:open`, `popover=hint`), fetch uploads/ranges, IndexedDB, JSPI, media pseudo-classes, Navigation API, scoped custom element registries, scroll-driven animations, scroll snap, shape(), view transitions (same-doc, `blocking=render`, `<link rel=expect>`, types, cross-document), web compat, WebRTC, WebTransport; 4 investigations (accessibility testing, JPEG XL, mobile testing, WebVTT). | Scores /1000 — Chrome 152 / Firefox 155 / Safari 26.6: anchor 1000/1000/989; style queries 1000/1000/833; dialogs&popovers 983/1000/553; scroll-driven 948/**88**/949; view transitions 1000/798/987; navigation 1000/953/875; custom highlights 994/1000/671. | S03, S04, S18 |
| 85 | Interop 2025 (carry-overs into 2026: anchor positioning, view transitions, CSS zoom, navigation API, scroll snap) | Final 2025 CSV: ACCESS FAILURE (404 at the results-analysis gh-pages path; final files live in wpt.fyi `webapp/static` per README — not fetched). Interop 2025 README captured `[ABS]`. | S04, results-analysis README `[ABS]` |

Row count: 85 rows (67 CONTEXT-02 primitives + 9 sub-rows for split primitives + 2 programme rows + 7 knowledge rows); every CONTEXT-02 item is present (checked by name against the brief: popover, invokers, dialog, select family incl. selectlist history, anchor positioning, view transitions ×2 + types, scroll-driven, container queries ×3, cq units, @scope, @layer, :has, field-sizing, text-wrap ×3, light-dark, color-mix, oklch + relative colour, search, details name, hgroup, output, meter, progress, time, data, datalist, inert, interactive-widget, dvh/svh/lvh, viewport segments, overflow clip, subgrid, user-valid, scrollbar-gutter, content-visibility, speculation rules, starting-style + transition-behavior, nesting, focus-visible, accent-color, color-scheme, prefers-* ×3, forced-colors, hanging-punctuation, text-box, font-optical-sizing, font-palette/COLRv1, if(), @function, AudioWorklet, AnalyserNode, WebGPU, Interop 2025/2026).

# Methodology and exact query/action log

All times +03 (Europe/Istanbul), 2026-09-09. "yield" = new sources or facts added.

| # | Time | Action / exact query | Index/tool | Yield |
|---|---|---|---|---|
| Q1 | 14:47 | `Baseline 2026 newly available web features web.dev` | WebSearch | web.dev Baseline 2026 page; May & June 2026 Baseline digests (container style queries, `:open`, `field-sizing`, `:has()` widely) `[ABS]` |
| Q2 | 14:47 | `Interop 2026 focus areas announced` | WebSearch (+auto-captured pages) | S03 WebKit "Announcing Interop 2026", S04 interop/2026 README `[FULL rel.]`, Igalia news, Mozilla Hacks `[ABS]` |
| Q3 | 14:47 | `Safari 27 release notes WebKit CSS HTML features 2026` | WebSearch (+auto-captured) | S01 WebKit Safari 27 beta blog (2026-06-08), S02 Apple Safari 27 Beta Release Notes |
| Q4 | 14:49 | `WebKit "Safari 26" release notes "closedby" OR "commandfor" OR "popover=hint"` | WebSearch (+auto-captured) | S05 WebKit 26.2 blog, S06 Apple 26.2 notes; third-party support tables (used only as leads) |
| Q5 | 14:49 | `Firefox 149 for developers release notes MDN 2026` | WebSearch | MDN 149 URL; GIGAZINE card |
| Q6 | 14:49 | `"Chrome 147" release notes developer.chrome.com CSS HTML 2026` | WebSearch | Chrome 147 URL; element-scoped VT blog card |
| Q7 | 14:51 | fetch MDN Firefox 149 | WebFetch | S07 `[FULL]`: popover=hint shipped; base-select behind prefs |
| Q8 | 14:52 | `"Firefox 154" OR "Firefox 155" release notes for developers MDN released 2026` | WebSearch | 154 (Aug 18) and 155 (Sep 1) URLs; web-standards.dev summaries `[ABS]` |
| Q9 | 14:52 | `"Chrome 152" release notes developer.chrome.com stable release date 2026` | WebSearch (+auto-captured) | S10 Chrome Releases blog Aug 2026 (152 stable 2026-08-25) |
| Q10 | 14:52 | `webkit.org blog "WebKit Features for Safari 26.4"` | WebSearch (+auto-captured) | S08, S09 |
| Q11 | 14:52 | fetch `api.webstatus.dev/v1/features/popover` | WebFetch | API works; JSON schema learned |
| Q12 | 14:53 | fetch MDN Firefox 155 | WebFetch | S20 `[FULL]`: scroll-driven animations still behind flag |
| Q13 | 14:53–14:54 | `api.webstatus.dev/v1/features?q=…` × 3 (anchor, select, dialog) | WebFetch | feature ids discovered |
| Q14 | 14:51:25 | bulk search, 57 terms (list in S11 header brackets) | PowerShell Invoke-RestMethod → S11 (501 rows) | feature ids for all CONTEXT-02 items; `if()` and `details name` returned HTTP 400 (bad query chars) → re-queried as `if function`, `details`, `open` |
| Q15 | 14:52:27 | bulk search, 64 more terms | PowerShell → S11 (+152 rows) | cross-document VT, viewport units, WebGPU, AudioWorklet, COLRv1, text-box, etc. |
| Q16 | 14:53:26 | per-feature JSON dump, 79 ids | PowerShell → S12 (79/79 ok) | authoritative per-engine version+date+Baseline for every row |
| Q17 | 14:55 | fetch caniuse `css-anchor-positioning.json` (raw GitHub, Fyrd/caniuse main) | WebFetch | S13 `[FULL]` |
| Q18 | 14:55 | fetch MDN Firefox 147 | WebFetch | S13 `[FULL]`: anchor positioning enabled by default 2026-01-13 |
| Q19 | 14:55 | fetch Chrome 151 release notes | WebFetch | S13 `[FULL]`: `position-anchor` initial → `normal` |
| Q20 | 14:56 | `webkit.org "WebKit Features in Safari 26.0" anchor positioning scroll-driven animations WebGPU` | WebSearch (+auto-captured) | S14 (2025-09-15) |
| Q21 | 14:56 | `open-ui.org customizable select explainer selectlist selectmenu renamed appearance base-select` | WebSearch (+auto-captured) | S16 blink-dev intent; Open UI selectlist.mdx; Chrome blogs `[ABS]` |
| Q22 | 14:56 | `CSS anchor positioning popover anchor() not resolving top-left viewport origin headless chromium playwright` | WebSearch (+auto-captured) | S15 CSSWG spec (WD 2026-05-08); OddBird validity article `[ABS]`; Chrome anchor blog `[ABS]`; HeadlessNew article `[ABS]` |
| Q23 | 14:58 | fetch MDN Popover API; MDN Customizable select; open-ui.org/components/customizableselect/ (redirect) | WebFetch | S23, S17, S24 |
| Q24 | 14:58 | `wpt.fyi interop 2026 dashboard scores chrome firefox safari September 2026` | WebSearch | dashboard is JS-rendered; README points to results-analysis |
| Q25 | 14:59 | fetch open-ui.org/components/customizable-select.explainer/ | WebFetch | S24 `[FULL]` |
| Q26 | 14:59 | `web-platform-tests results-analysis interop-2026 csv scores gh-pages data` | WebSearch | commit 05ab3ec shows `data/interop-2026/interop-2026-stable-v2.csv` on gh-pages |
| Q27 | 14:56:51 | fetch the two CSVs (2026 ok; 2025 → 404) | PowerShell | S18 (146 lines, last row 2026-09-06); 2025 ACCESS FAILURE recorded |
| Q28 | 15:00 | `github web-platform-tests wpt.fyi webapp/static interop-2025 stable csv final scores` | WebSearch | no direct file locator found; Interop 2025 README `[ABS]` |
| Q29 | 15:00 | `Web Almanac 2025 CSS chapter container queries :has() nesting popover dialog adoption percentage pages` | WebSearch | State of CSS 2025 (`:has()` 80.4% used); Front-End-News #114 notes Web Almanac 2025 has no CSS chapter (`[ABS]`) — Web Almanac numbers therefore NOT FOUND IN THE SEARCHED SCOPE |
| Q30 | 15:00 | `peer-reviewed study accessibility native HTML form controls versus custom ARIA widgets screen reader select dropdown 2023 2024 2025` | WebSearch | Higley 24a11y (grey literature); CSS-Tricks; Atomic a11y; MS sonder-ui |
| Q31 | 15:00 | `viewport meta interactive-widget resizes-content Safari Firefox support 2026` | WebSearch (+auto-captured) | S31 WebKit PR #70058; bug 259770 |
| Q32 | 15:02 | `arXiv OR "ACM" empirical study ARIA custom widgets accessibility screen reader native HTML elements form controls 2024 2025 paper` | WebSearch | arXiv 2502.10884 (CodeA11y) `[ABS]`, arXiv 2506.04659 `[ABS]` — neither directly on native vs custom select |
| Q33 | 15:02 | fetch MDN Firefox 132; MDN Firefox 153 | WebFetch | S22 (negative check for interactive-widget), S21 |
| Q34 | 15:04 | `"screen reader" study comparing native "select element" versus custom "combobox" OR "listbox" ARIA usability participants ASSETS OR CHI OR W4A doi` | WebSearch | only Higley 2019 (n=12) — no peer-reviewed match → NOT FOUND IN THE SEARCHED SCOPE |
| Q35 | 15:04 | fetch webaim.org/projects/million/ | WebFetch | S26 `[FULL]` (Feb 2026 data) |
| Q36 | 15:05 | fetch Chrome 147 release notes; `webkit.org blog "WebKit Features for Safari 26.5" ":open" hanging-punctuation` | WebFetch / WebSearch | S29 `[FULL]`; S28 `[ABS]` |
| Q37 | 15:07 | fetch MDN Firefox 154; MDN Firefox 151 | WebFetch | S33, S34 `[FULL]` — text-box shipped in 154; style queries in 151 |
| Q38 | 15:08 | list `deploy/payload/components/**`, `app/styles/**` | PowerShell (read-only) | component names for the application column |

Marginal yield by round: R1 (Q1–Q6) 9 primaries; R2 (Q7–Q16) 6 primaries + the webstatus.dev dataset that settled 79 features; R3 (Q17–Q27) 10 primaries incl. spec, caniuse, Interop CSV; R4 (Q28–Q37) 9 primaries, mostly confirmations and two contradictions (text-box Firefox, popover=hint versions); R5 (Q38) 0 external. Saturation: after R4 no CONTEXT-02 item lacked a dated state; remaining unknowns are listed in §Gaps and are not resolvable by more of the same channels (they need vendor data not yet published, e.g. Safari 27 GA date).

Known-item tests (CONTEXT-11): MDN Popover API page — retrieved (S23) ✔; CSSWG anchor-positioning spec — retrieved (S15) ✔; Interop 2025 dashboard — README retrieved `[ABS]`, final score CSV 404 ✖ (recorded as access failure); Open UI customizable select explainer — retrieved (S24) ✔. 3 of 4 passed.

# Source register

| id | title | org | URL | date/version | retrieval | read | capture (SHA-256) |
|---|---|---|---|---|---|---|---|
| S01 | News from WWDC26: WebKit in Safari 27 beta | Apple/WebKit | https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/ | 2026-06-08; Safari 27 beta | 14:47 | `[FULL]` (features sections; bug-fix lists grepped) | S01…txt FD77DDDC…E3D8AC |
| S02 | Safari 27 Beta Release Notes | Apple | https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes | beta (page title says Beta) | 14:47 | `[PARTIAL]` (grepped) | S02…txt 0197281D…F2875C |
| S03 | Announcing Interop 2026 | Apple/WebKit | https://webkit.org/blog/17818/announcing-interop-2026/ | 2026-02 | 14:47 | `[PARTIAL]` | S03…txt CCFB79D8…5A5B56 |
| S04 | interop/2026/README.md | web-platform-tests (Apple, Bocoup, Google, Igalia, Microsoft, Mozilla) | https://github.com/web-platform-tests/interop/blob/main/2026/README.md | main, 2026 | 14:47 | `[FULL]` (focus-area sections) | S04…txt 188F5081…6D5A5D7 |
| S05 | WebKit Features for Safari 26.2 | Apple/WebKit | https://webkit.org/blog/17640/webkit-features-for-safari-26-2/ | 2025-12-12 | 14:49 | `[FULL]` (features; fixes grepped) | S05…txt 97090573…95EB83 |
| S06 | Safari 26.2 Release Notes | Apple | https://developer.apple.com/documentation/safari-release-notes/safari-26_2-release-notes | 26.2 | 14:49 | `[PARTIAL]` | S06…txt 5ABC7081…9CF391 |
| S07 | Firefox 149 release notes for developers | Mozilla/MDN | https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/149 | 2026-03-24 | 14:51 | `[FULL]` | S07…txt D6CB6649…56D5D7 |
| S08 | WebKit Features for Safari 26.4 | Apple/WebKit | https://webkit.org/blog/17862/webkit-features-for-safari-26-4/ | 2026-03-24 | 14:52 | `[PARTIAL]` | S08…txt A47E9005…60C55 |
| S09 | Safari 26.4 Release Notes | Apple | https://developer.apple.com/documentation/safari-release-notes/safari-26_4-release-notes | Released 2026-03-24, 26.4 (20624.1.16) | 14:52 | `[PARTIAL]` | S09…txt 67B28E57…52B165B |
| S10 | Chrome Releases: August 2026 | Google | https://chromereleases.googleblog.com/2026/08/ | 2026-08-25 (152.0.7977.64/.65) | 14:52 | `[FULL]` (Aug-25 entry) | S10…txt 6E283ECC…12FA175A |
| S11 | Web Platform Dashboard API search index (own compilation of `/v1/features?q=`) | WebDX CG / Google (webstatus.dev) | https://api.webstatus.dev/v1/features | as served 14:51–14:52 | 14:51 | `[FULL]` | S11…txt 914A2FFB…7FCFB1 |
| S12 | Web Platform Dashboard API per-feature JSON, 79 records | WebDX CG / Google (webstatus.dev; data from web-features + BCD + WPT) | https://api.webstatus.dev/v1/features/{id} | as served 14:53:26 | 14:53 | `[FULL]` | S12…jsonl EA59C0DC…386DD6 |
| S13 | caniuse `css-anchor-positioning.json`; MDN Firefox 147; Chrome 151 release notes (excerpts) | Fyrd/caniuse; Mozilla; Google | see file | caniuse main; FF147 2026-01-13; Chrome 151 2026-07-28 | 14:55 | `[FULL]` ×3 | S13…txt 2F4811F9…ADCBC8 |
| S14 | WebKit Features in Safari 26.0 | Apple/WebKit | https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ | 2025-09-15 | 14:56 | `[PARTIAL]` | S14…txt BFAD6D7E…C05C9DBC |
| S15 | CSS Anchor Positioning Module Level 1 | W3C CSSWG (Atkins-Bittner, Etemad, Kilpatrick) | https://drafts.csswg.org/css-anchor-position-1/ (captured header: "W3C Working Draft, 8 May 2026", TR/2026/WD-css-anchor-position-1-20260508) | 2026-05-08 | 14:56 | `[PARTIAL]` (§2.3–2.4, §3.1–3.2 read) | S15…txt 1C83F757…99A47D |
| S16 | Intent to ship: Customizable select | Chromium blink-dev | https://groups.google.com/a/chromium.org/g/blink-dev/c/kN5LTzuTLVs/m/6HqTsmk3EQAJ | 2025-01-24…30 | 14:56 | `[PARTIAL]` | S16…txt 54D5AFDE…79A49C19 |
| S17 | Customizable select elements (guide) | Mozilla/MDN | https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select | live 2026-09-09 | 14:58 | `[FULL]` | S17…txt 141C6C2A…A59C6A9 |
| S18 | interop-2026-stable-v2.csv | web-platform-tests/results-analysis (gh-pages) | https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv | last row 2026-09-06 | 14:56 | `[FULL]` | S18…csv 55403410…2D5FA9 |
| S19 | interop-2025-stable-v2.csv | same | …/data/interop-2025/interop-2025-stable-v2.csv | — | 14:56 | ACCESS FAILURE 404 | none |
| S20–S32 | MDN Firefox 155/153/132; MDN Popover API; Open UI explainer; Open UI selectlist.mdx; WebAIM Million 2026; 24a11y Higley 2019; WebKit/Apple 26.5; Chrome 147; Chrome 152; WebKit PR #70058; blink-dev (see file for each URL) | various | see file | see file | 14:58–15:05 | see file | S20-S32…txt 5B740566…A91218A |
| S33–S34 | MDN Firefox 154; MDN Firefox 151 | Mozilla/MDN | see file | 2026-08-18; 2026-05-19 | 15:07 | `[FULL]` ×2 | S33-S34…txt C7CF438E…0815DD |
| (uncaptured leads, `[ABS]`) | web.dev Baseline 2026 + digests; Igalia Interop 2026; Mozilla Hacks Interop 2026; OddBird anchor validity; Chrome anchor API blog; Chrome customizable-select blogs; State of CSS 2025; arXiv 2502.10884 (CodeA11y); arXiv 2506.04659; Front-End-News #114 | various | URLs in §Sources | — | — | `[ABS]` | — |

Counts (deduplicated by distinct work): **41 authoritative sources** (20 read `[FULL]`, 10 `[PARTIAL]`, 11 `[ABS]`); **15 provenance families** (Apple/WebKit; Mozilla/MDN; Google/Chrome; W3C CSSWG; WPT/Interop cross-vendor; WebDX/webstatus.dev; caniuse; Open UI CG; Chromium blink-dev; WebAIM; 24a11y/Higley; OddBird; Igalia; Devographics/State of CSS; arXiv). **Academic: 1 `[ABS]`, 0 `[FULL]`** — see §Gaps G1. Slice floor (≥14): met.

# Findings per primitive (mechanism · exact syntax · limits · failure modes · application)

Format per R9 adapted for non-academic primaries: authority/problem → mechanism/contract → exact limits/versions → failure modes → concrete application (component it replaces). Only the primitives whose verdict is not a plain "widely available ADOPT" are expanded; the widely-available rows (#4, 30, 37–42, 44, 46–47, 49, 52–57, 63–65, 70, 73, 78, 81–82) carry no engine risk and their application is the component named in the table.

## F1. Popover API (#1) + `popover="hint"` (#2)
- **Authority/problem:** HTML Living Standard `#dom-popover`, `#attr-popover-hint` (S04 links); MDN (S23). Problem solved: top-layer overlays without z-index wars, with built-in light-dismiss and focus/tab-order correction.
- **Contract:** `<button popovertarget="m" popovertargetaction="toggle">` + `<div id="m" popover>`; JS `showPopover()/hidePopover()/togglePopover()`; events `beforetoggle`/`toggle` (`ToggleEvent.newState`, `.source` from Chrome 140/Firefox 145/Safari 26.5). `popover="hint"`: opening a hint does not close `auto` popovers but closes other hints (S07 verbatim).
- **Limits/versions:** auto/manual Baseline newly 2025-01-27 (iOS 18.3 was the last); `hint`: Chrome (133 vs 151 disputed), Firefox 149, Safari none; Firefox 153 aligned hint/auto stacking with whatwg/html#12345 (S21).
- **Failure modes:** UA stylesheet centres popovers (`inset: 0; margin: auto`) — with anchor positioning reset `inset: auto` (Chrome anchor blog, `[ABS]`); Safari treats `hint` as `auto` → a tooltip hover closes an open menu; Safari 27 beta fixed nested `position: absolute` children failing to render inside popovers (S01 line 217) → in Safari ≤ 26.6 avoid absolutely positioned children inside popovers.
- **Application:** replaces the hand-rolled menu/tooltip layers in `shell/AccountControl.tsx`, `track/TrackActions.tsx`, `ui/Combobox.tsx` listbox, and the parameter help in `compose/ParamControls.tsx`. Use `popover` (auto) for menus; `popover="manual"` for the queue toast; `popover="hint"` only where a Safari fallback to `auto` is acceptable.

## F2. Invoker Commands (#3)
- **Contract (S05 verbatim):** `command` + `commandfor="id"`; six predefined values — dialog: `show-modal`, `close`, `request-close`; popover: `show-popover`, `hide-popover`, `toggle-popover`; custom `command="--name"` observed via the `command` event.
- **Versions:** Chrome 135 (2025-04-01), Firefox 144 (2025-10-14), Safari 26.2 (2025-12-12); Baseline newly 2025-12-12 (S12).
- **Failure modes:** iOS < 26.2 ignores the attributes → buttons do nothing; feature-detect `'command' in HTMLButtonElement.prototype` and attach a click handler where absent.
- **Application:** every open/close button for dialogs and popovers in `AppShell`, `PlayerBar` (queue panel), `TrackActions` — removes per-button React handlers.

## F3. `<dialog>` family (#4–#7)
- **Contract:** `showModal()` → top layer + inert page + `::backdrop`; `requestClose()` fires `cancel` first (Baseline newly 2025-05-27); `closedby="any"` = light-dismiss, `closerequest` = Esc only (implicit default for `showModal()`), `none` = author-controlled (S04, S12).
- **Versions:** `closedby` Chrome 134, Firefox 141, Safari none (Interop 2026 focus; Safari dialogs-and-popovers score 553/1000 on 2026-09-06, S18).
- **Failure modes:** in Safari a `closedby="any"` dialog has no click-outside close → always render an explicit close `<button command="close" commandfor=…>`; Safari 26.2 fixed fullscreen dialog backdrops not extending under the address bar (S05 line 577).
- **Application:** sign-in (`auth/AuthForm.tsx`), confirmations in `TrackActions`, the Enhance panel (`compose/EnhancePanel.tsx`) as a non-modal `<dialog>`.

## F4. Customizable `<select>` (#10–#14)
- **Authority:** Open UI explainer (S24), blink-dev intent (S16), WebKit 27 beta (S01), MDN guide (S17), Firefox 149/153 notes (S07, S21).
- **Contract:** `select, ::picker(select) { appearance: base-select }` (both required); optional `<button><selectedcontent></selectedcontent></button>` first child; `::picker-icon`, `option::checkmark`, `select:open`; picker is a popover in the top layer with an implicit anchor and UA position-try fallbacks (S17 line 54). Keyboard behaviour is deliberately not standardised (Open UI issue 1087, S24).
- **Versions:** Chrome 135 (2025-04-01) only in stable; Safari 27 BETA (2026-06-08); Firefox: two prefs, `<select>` button only, `::picker(select)` styling "will be added in future versions" (S07); Firefox 153 shipped the parser change that lets arbitrary children of `<select>` reach the DOM (S21).
- **Failure modes:** (a) non-supporting engines render the classic control — progressive enhancement is the vendor-stated model (S01 line 77, S17 line 29); (b) MDN: SSR hydration failures in some frameworks (S17 line 19) — Next.js 16 must be tested with `<button>`/`<selectedcontent>` inside `<select>`; (c) `base-select` opts out of native mobile pickers (Google guidance card, `[ABS]`); (d) `size`/`multiple` not specified (S24).
- **History:** `<selectmenu>` → `<selectlist>` → `<select>` + `appearance: base-select`; opt-in moved from tag/attribute to CSS by WHATWG/CSSWG/Open UI consensus (S16 line 51; S25).
- **Application:** `ui/Combobox.tsx` (103 engine params → genre/mood/language selectors). Today: keep a native `<select>` as the semantic base and layer `base-select` styling as enhancement; do not replace the typeahead combobox (109 languages) with it, because filtering/typeahead is out of the customizable-select scope.

## F5. Anchor positioning (#15–#20) — including the CONTEXT-18 headless finding
- **Authority:** CSSWG css-anchor-position-1 (captured as WD 2026-05-08, S15); vendors S13/S14/S01; Interop 2026 (S18: Chrome 1000 / Firefox 1000 / Safari 989).
- **Contract (S15 §2.4, verbatim):** `position-anchor: normal` — "If position-area is none, behaves as none. Otherwise, behaves as auto."; `none` — "The box has no default anchor element."; `auto` — "Use the implicit anchor element if it exists". The default anchor is "used by position-area, position-try, and (by default) all anchor functions applied to this element." An `anchor()` is resolvable only if (§3.1) it is on an absolutely positioned box, the side matches the inset axis, and "There is a target anchor element … If any of these conditions are false, the anchor() function computes to its specified fallback value. If no fallback value is specified, it makes the declaration referencing it invalid at computed-value time." Acceptable anchor (§2.3): in scope for `anchor-scope`; "laid out strictly before" the positioned element — same containing block and either a lower top layer, or same top layer and (not absolutely positioned or earlier in flat-tree order).
- **Versions:** core Chrome 125 / Safari 26.0 / Firefox 147; `position-anchor: normal` initial value: Firefox 151 (2026-05-19), Chrome 151 (2026-07-28, "from none to normal"), Safari 27 beta ("auto → normal"; S01 lines 138–147).
- **CONTEXT-18 (parent measured on 2026-09-09: a popover positioned with anchor positioning sat at the viewport origin in headless Chromium/Playwright):** No source in this run describes a headless-specific anchor-positioning limitation; HeadlessNew shares the headed rendering path (johal.in `[ABS]`). **HYPOTHESIS (INFERENCE from S15 §2.4 + S13 Chrome 151 note):** if the popover's CSS uses bare `anchor(top)`/`anchor(bottom)` (no `<anchor-name>`) and relies on the implicit anchor from `popovertarget`/`commandfor` WITHOUT declaring `position-anchor: auto` and WITHOUT `position-area`, then in Chromium ≥ 151 (and Firefox ≥ 151, Safari 27) the initial `position-anchor: normal` behaves as `none`, the `anchor()` functions become unresolvable, the inset declarations are invalid at computed-value time, and with the UA popover margins reset (`inset: auto`/`margin: 0`) the box lands at the static position / viewport origin. Playwright's bundled Chromium on 2026-09-09 is very likely ≥ 151 (`[UNVERIFIED — version not measured in this run]`). **Falsification test for the parent:** add `position-anchor: auto;` (or an explicit `anchor-name`/`position-anchor` pair, or `position-area`) and re-run; if the popover snaps to the invoker, the hypothesis holds. Secondary checks from OddBird's list (`[ABS]`): anchor in a higher top layer than the popover, anchor absolutely positioned after the popover in DOM, anchor-name defined in another shadow tree, `anchor-scope` mismatch. Chrome's own note (`[ABS]`): reset UA centring with `inset: auto`.
- **Failure modes:** transformed anchors mis-track in Safari 26.x/Firefox (S01 line 103); plural `anchors-visible` discouraged by spec, singular in Safari 27/Chrome `[UNVERIFIED]` → write both; Safari 26.x fixed several `position-area`/sticky/`display:contents` anchoring bugs across 26.2–27 (S01 lines 202–237, S05 lines 451–484) → test menus anchored inside `position: sticky` `PlayerBar` on Safari 26.6.
- **Application:** every anchored surface — `Combobox` listbox, `AccountControl` menu, `TrackActions` menu, `Dial`/`KeyWheel` value tooltips — with `@supports (anchor-name: --x)` and a fixed-position fallback for iOS < 26.

## F6. View transitions (#21–#24)
- **Versions:** same-document Baseline newly 2025-10-14 (Firefox 144 last); types Firefox 147 (SPA only, S13); cross-document Chrome 126 + Safari 18.2, Firefox none (Interop 2026 focus); element-scoped Chrome 147 only (S29).
- **Failure modes:** Safari 27 beta fixed snapshots stored in sRGB (wide-gamut colours shifted during transitions, S01 line 658) and stale transforms in accelerated animations (line 690) → on Safari ≤ 26.6 expect colour shifts in `oklch` brand gradients during transitions; Firefox interop score 798/1000 → test.
- **Application:** track card → track page (`catalogue/TrackCard.tsx` → track route) with `view-transition-name` per card; `WorldView` camera hand-offs; always `if (!document.startViewTransition) { update(); return; }`.

## F7. Scroll-driven animations (#25)
- **Versions:** Chrome 115, Safari 26.0 (compositor-threaded from 26.4, S08), **Firefox: flag-only in 155 (S20 verbatim)**; Interop 2026 Firefox 88/1000.
- **Contract:** `animation-timeline: scroll(root block)` / `view()`, `animation-range: entry 0% cover 40%`, named ranges incl. `scroll` (Chrome 147, S29).
- **Application:** `home/HomePage.tsx` hero and `musics/MusicsPage.tsx` reveal effects inside `@supports (animation-timeline: view())`; Firefox and old iOS get the final state without motion (a designed static state, per rule 14, never a missing element).

## F8. Container style queries (#32), `@scope` (#36), `field-sizing` (#60), `text-box-trim` (#69)
- Style queries: Firefox 151 (2026-05-19) made it Baseline newly (S34, S12); Safari interop 833/1000 → verify `style()` on inherited custom properties. Application: theme variants for `TrackCard` from a `--tone` custom property on `MusicsPage` sections.
- `@scope`: Baseline newly 2026-03-24 per webstatus; WebKit already documented `@scope` with `:host`/adopted sheets in 26.2 (S05 lines 166–199) — the webstatus date reflects the completeness bar of web-features, not first shipping (CONTRADICTION C6). Application: component-scoped rules with donut scope (`@scope (.card) to (.card-slot)`).
- `field-sizing: content`: Safari 26.2 (S05 line 79), Firefox 152 (S12; still flagged in 151, S34); Safari 27 beta fixed placeholder clipping on number inputs (S01 line 916). Application: `compose/PromptEditor.tsx` textarea auto-grow.
- `text-box-trim`/`text-box-edge`: Chrome 133, Safari 18.2, Firefox 154 (S33) — all three engines now; webstatus lags (C3). Application: optical alignment of display type in `shell/Brand.tsx` and card titles.

## F9. Colour and theming (#62–#67, #71–#72)
- `light-dark()` requires `color-scheme` on the element; owner's dark theme → `color-scheme: dark` at `:root` (rule 14: dark is his explicit order for this product). Image values in `light-dark()`: Chrome 150 + Firefox 150 only (S12) → AVOID.
- `color-mix()` with >2 colours: Firefox 150 + Safari 27 beta only → AVOID; `alpha()`: Chrome 151 + Firefox 155 only → AVOID; relative colour syntax (Baseline newly 2024-09-16) covers the same need.
- `contrast-color()`: Safari 26.0 + Chrome 147; Firefox version `[UNVERIFIED]` (Baseline 2026 list includes it, `[ABS]`).
- COLRv1: no WebKit support (S12; WebKit standards-position #415) → the approved logo stays SVG/CSS, not a colour font.
- `accent-color`: Safari full support recorded 26.2 (S12) → native checkbox/radio/range in the brand hue on iOS ≥ 26.2 only.

## F10. Viewport and keyboard (#78–#80)
- `dvh/svh/lvh` widely available → `AppShell` uses `100dvh`.
- `interactive-widget=resizes-content`: WebKit implementation merged (PR #70058) but not in any Safari release note captured (S01/S02 grep: no hit) → iOS keyboard still overlays; `PlayerBar` needs a `visualViewport` resize listener on iOS. Firefox support `[UNVERIFIED]` (MDN 132 notes silent, S22).
- Viewport segments: Chromium-only → AVOID; the foldable case is served by container queries on the layout regions instead.

## F11. Accessibility evidence for "native first" (non-academic)
- WebAIM Million 2026 (S26): pages with ARIA average 59.1 errors vs 42 without; Select2 (custom select library) pages +46.2% errors; Next.js pages −27.1% vs average. Correlational, not causal (WebAIM says so).
- Higley 2019 (S27, n=12, practitioner study): native `<select>` was the only control with no participant complaint; custom combobox variants scored 59.9–88.9 usability. Grey literature.
- Application: the rebuild's default is the native element for every control in this table; a custom widget (`ui/Dial`, `ui/KeyWheel`) is justified only where no native element exists, and it must proxy a hidden native `<input type="range">`/`<output>` for AT.

# Contradictions, corrections, uncertainty, and gaps

## Contradictions (preserved, not averaged)
- **C1 Anchor positioning "available" state.** webstatus.dev `anchor-positioning` (S12) lists no available implementation and Baseline `limited`; caniuse (S13) says Chrome 125 y / Firefox 147 y / Safari 26.0 y (usage 84.12%); MDN Firefox 147 (S13) "enabled by default"; WebKit 26.0 blog (S14) ships it; Interop 2026 stable scores Chrome 1000 / Firefox 1000 / Safari 989 (S18). Resolution: shipped in all three engines; the web-features record evidently applies a stricter completeness bar (INFERENCE — reason not stated in the record). Verdict uses the four agreeing primaries.
- **C2 `popover="hint"` versions.** Third-party cards: Chrome 133; webstatus.dev: Chrome 151@2026-07-28, Firefox 153@2026-07-21; MDN Firefox 149 (S07): shipped 2026-03-24; MDN Firefox 153 (S21): behaviour aligned to whatwg/html#12345. Resolution: Firefox first shipped in 149; webstatus dates the spec-aligned behaviour. Chrome first-ship version left as VERSION-CONFLICT (133 vs 151; no Chrome release note fetched for 133).
- **C3 `text-box-trim` in Firefox.** MDN Firefox 154 (S33): shipped 2026-08-18; webstatus.dev (S12, fetched 2026-09-09): Firefox `—`. Resolution: MDN release note (primary) wins; dataset lag.
- **C4 `progress()` Firefox date.** webstatus.dev: Firefox 155@2026-09-15; MDN 155 (S20): released 2026-09-01. Two-week discrepancy in the dataset's release calendar; MDN date used.
- **C5 Safari 27 status.** WebKit blog (S01) and Apple page title (S02) say beta; third-party tables say "Safari 27" as if shipped. Treated as NOT SHIPPED; GA date `[UNVERIFIED]`.
- **C6 `@scope` dates.** webstatus.dev: Chrome 143@2025-12-02, Safari 26.4@2026-03-24, Baseline newly 2026-03-24; WebKit 26.2 blog (S05, 2025-12-12) already documents `@scope` behaviour improvements. Resolution: earlier partial implementations existed; the Baseline date reflects completeness. Verdict ADOPT-WITH-FALLBACK stands either way.
- **C7 Customizable select Chrome milestone.** blink-dev intent (S16) "Estimated milestones 134"; webstatus.dev and MDN: Chrome 135@2025-04-01. Resolution: shipped in 135.
- **C8 `accent-color` Baseline.** webstatus.dev lists Chrome 93, Firefox 92, Safari 26.2 but Baseline `limited` (expected `newly`). Cause not captured `[UNVERIFIED]` (possibly a missing sub-browser row). Verdict ADOPT-WITH-FALLBACK.
- **C9 `interactive-widget` in Firefox.** Third-party: "Firefox 132+"; MDN Firefox 132 notes (S22): no such entry. Left `[UNVERIFIED]`.

## Gaps / not found
- **G1 Academic floor.** Queries Q30, Q32, Q34 found no peer-reviewed primary directly comparing native vs custom `<select>`/dialog controls; nearest are Higley 2019 (practitioner, n=12), WebAIM Million 2026 (industry) and arXiv 2502.10884 (CodeA11y, tangential, `[ABS]`). Academic `[FULL]` = 0 → **NOT FOUND IN THE SEARCHED SCOPE**; the HCI worker owns this axis (CONTEXT-07). Not silently waived.
- **G2 Interop 2025 final scores** — CSV 404 at the results-analysis gh-pages path (access failure, not non-existence); wpt.fyi dashboard is JS-rendered.
- **G3 Web Almanac 2024/2025 adoption numbers** — Front-End-News #114 (`[ABS]`) states Web Almanac 2025 has no CSS chapter; no Almanac figures for popover/dialog/container queries were found. State of CSS 2025 (`[ABS]`): `:has()` used by 80.4% of respondents (survey, not crawl).
- **G4** Interest invokers (`interestfor`), `sibling-index()` Chrome version, `contrast-color()` Firefox version, `position-visibility` singular keywords in Chrome, Playwright Chromium version on the parent's machine — all `[UNVERIFIED]`.
- **G5** MDN browser-compat tables are client-rendered and were not captured; per-engine data therefore comes from webstatus.dev (web-features/BCD/WPT) cross-checked with vendor release notes and caniuse, as the brief prescribes.

# Claim cross-verification and independence ledger

Independence = different producer AND different underlying data (vendor note = engine team; webstatus.dev = web-features/BCD/WPT aggregate; caniuse = independent curation; Interop CSV = WPT run results). Status: V3 = ≥3 independent sources agree; V2 = two; SS = `[single-source]`; UV = `[UNVERIFIED]`.

| id | claim (scope) | A | B | C | status | note |
|---|---|---|---|---|---|---|
| K1 | Anchor positioning ships in Chrome 125, Safari 26.0, Firefox 147 | S13 caniuse | S13 MDN FF147 + S14 WebKit 26.0 | S18 Interop scores | V3 | contradiction C1 visible |
| K2 | Popover auto/manual Baseline newly 2025-01-27 (Chrome 116, Safari 17/iOS 18.3, Firefox 125) | S12 | S23 MDN banner | S14 ("popover … shipped in Safari 17.0") | V3 | |
| K3 | `popover=hint` not in Safari stable | S12 | S04 (2026 focus area) | S18 (Safari dialogs&popovers 553) | V3 | Chrome first version VERSION-CONFLICT |
| K4 | Invoker commands Chrome 135 / Firefox 144 / Safari 26.2, Baseline 2025-12-12 | S12 | S05 | S06 | V3 | S05/S06 same org, S12 independent |
| K5 | `closedby` Chrome 134 / Firefox 141 / Safari none | S12 | S04 | S18 | V3 | |
| K6 | `requestClose()` Chrome 134 / Safari 18.4 / Firefox 139 | S12 | S05 (`request-close` command) | — | V2 | |
| K7 | `:open` Safari 26.5 (2026-05-11), Baseline newly | S12 | S28 WebKit/Apple 26.5 | Baseline May-2026 digest `[ABS]` | V3 | |
| K8 | Customizable select = Chrome 135 + Safari 27 beta only; Firefox flagged | S12 | S01 + S07 | S24 + S17 | V3 | confirms CONTEXT-18 |
| K9 | Scroll-driven animations not shipped in Firefox stable (155) | S20 | S18 (88/1000) | S12 | V3 | |
| K10 | Same-doc view transitions Baseline newly 2025-10-14 | S12 | S13 MDN FF147 (types/activeViewTransition follow-ons) | S04 (carry-over focus) | V3 | |
| K11 | Cross-document VT: Chrome 126 + Safari 18.2, Firefox none | S12 | S13 ("not cross-document") | S04 | V3 | |
| K12 | Container style queries Baseline newly 2026-05-19 (Firefox 151) | S12 | S34 | S18 + Baseline May digest | V3 | |
| K13 | `field-sizing` Baseline newly 2026-06-16 (Safari 26.2, Firefox 152) | S12 | S05 | S34 (flagged in 151) + June digest | V3 | |
| K14 | `text-box-trim` in Firefox 154 | S33 | web-standards.dev / 9to5linux summaries `[ABS]` | — | V2 (contradicts S12) | |
| K15 | `position-anchor` initial value → `normal` (Chrome 151, Firefox 151, Safari 27β) | S13 Chrome 151 | S34 | S01 + S15 | V3 | |
| K16 | CONTEXT-18 headless popover-at-origin cause | S15 §2.4/§3.1 | S13 Chrome 151 | — | HYPOTHESIS | needs the parent's falsification test |
| K17 | `interactive-widget`: Safari not shipped; WebKit impl merged | S31 | S01/S02 grep negative | — | SS | Firefox UV |
| K18 | COLRv1 absent in WebKit | S12 | WebKit standards-position #415 (link in S12) | — | V2 | |
| K19 | Safari 27 is beta on 2026-09-09 | S01 | S02 title | S18 (stable run = 26.6) | V3 | |
| K20 | Stable versions on 2026-09-09: Chrome 152, Firefox 155, Safari 26.6 | S10 | S20 | S18 | V3 | |
| K21 | ARIA pages 59.1 vs 42 errors; Select2 +46.2% | S26 | — | — | SS (official unique dataset) | correlational |
| K22 | `<selectlist>`/`<selectmenu>` superseded by `appearance: base-select` | S25 | S16 | S24 | V3 | |
| K23 | `@scope` Baseline newly 2026-03-24 | S12 | S05 (earlier WebKit work) | — | V2 with C6 | |
| K24 | Element-scoped VT Chrome 147 only | S29 | S12 | — | V2 | |
| K25 | Interop 2026 focus-area list (20 + 4) | S04 | S03 | Igalia/Mozilla `[ABS]` | V3 | |

Counts: V3 = 17; V2 = 5; SS = 2; HYPOTHESIS = 1; UV items listed in G4 = 5.

# Synthesis — adopt / build / avoid (knowledge only; design slots remain OWNER-DECISION)

- **ADOPT now (all engines, Baseline newly/widely):** popover (auto/manual), invoker commands, `<dialog>` + `requestClose()`, same-document view transitions (guarded), `@starting-style` + `transition-behavior: allow-discrete`, container size queries + `cqi`, `@layer`, `:has()`, nesting, subgrid, `overflow: clip`, `scrollbar-gutter`, `inert`, `:user-valid/:user-invalid`, `:focus-visible`, `<search>`, `<details name>`, `<hgroup>`, `<output>`, `<meter>`, `<progress>`, `<time>`, `<data>`, `text-wrap: balance/pretty`, `light-dark()` + `color-scheme: dark`, `color-mix()` (2 colours), `oklch`/relative colour, `font-optical-sizing`, `prefers-reduced-motion/contrast`, `forced-colors`, `dvh/svh/lvh`, AudioWorklet/AnalyserNode.
- **ADOPT-WITH-FALLBACK (feature-gated, designed fallback):** `popover=hint`, `closedby`, `:open`, anchor positioning (with explicit `position-anchor`), style queries, `@scope`, `field-sizing`, `text-box-trim`, `content-visibility`, cross-document VT, scroll-driven animations, `accent-color`, `contrast-color()`, `prefers-reduced-transparency`, speculation rules, WebGPU (three.js WebGL fallback), `interactive-widget` meta, customizable `<select>` as pure enhancement over a native `<select>`.
- **BUILD (no native primitive exists yet):** typeahead combobox for 109 languages (native `<select>` + `<datalist>` cannot filter); rotary `Dial`/`KeyWheel` (proxy a native `<input type=range>`); keyboard-aware bottom bar on iOS (`visualViewport`).
- **AVOID as dependency:** `<selectlist>`/`<selectmenu>` names, element-scoped VT, anchored container queries, scroll-state queries, style-query range syntax, `interactivity: inert`, CSS `if()`, `@function`, COLRv1 fonts, variadic `color-mix()`, `alpha()`, `light-dark()` images, viewport segments, `overflow-clip-margin`.
- **Committed recommendation (knowledge-level):** build every control on the native element first; gate each ADOPT-WITH-FALLBACK behind `@supports`/feature detection with a designed static state; re-run this table's watch queries on Safari 27 GA (expected autumn 2026, date `[UNVERIFIED]`) because five verdicts (#10–12, #16, #19) flip on that single release. Falsifier: any vendor note dated after 2026-09-09 changing an engine state in the table.

# Application/change ledger
No code changed by this worker (write isolation). Findings map to: `ui/Combobox.tsx` (F1, F4, F5), `shell/AccountControl.tsx` + `track/TrackActions.tsx` (F1, F2, F5), `auth/AuthForm.tsx` + `compose/EnhancePanel.tsx` (F3), `compose/PromptEditor.tsx` (F8 field-sizing), `catalogue/TrackCard.tsx` + `musics/MusicsPage.tsx` (F6, F7, #43, #77), `shell/Brand.tsx` (F8 text-box, F9), `shell/AppShell.tsx` + `shell/PlayerBar.tsx` (F10), `ui/Dial.tsx` + `ui/KeyWheel.tsx` (F5 #19, F11), `world/WorldView.tsx` (#83), `app/styles/tokens.css` (F9 colour), `app/styles/motion.css` (F6/F7 + #29).

# Living-update watchlist
as_of 2026-09-09T15:15+03. Watch: (1) `https://api.webstatus.dev/v1/features/{customizable-select,anchor-positioning,popover-hint,dialog-closedby,scroll-driven-animations,text-box,scope,interactivity}`; (2) WebKit blog "WebKit Features in Safari 27" (GA) — flips #10–12, #16, #19, #76; (3) MDN Firefox 156+ notes for `layout.css.scroll-driven-animations.enabled` and `dom.select.customizable_select.enabled` flipping to shipped; (4) `interop-2026-stable-v2.csv` last row; (5) WebKit bugs 259770 (interactive-widget) and standards-position #415 (COLRv1). Supersedes: none. Superseded_by: none yet.

# Sources (complete locators)
S01 https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/ · S02 https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes · S03 https://webkit.org/blog/17818/announcing-interop-2026/ · S04 https://github.com/web-platform-tests/interop/blob/main/2026/README.md · S05 https://webkit.org/blog/17640/webkit-features-for-safari-26-2/ · S06 https://developer.apple.com/documentation/safari-release-notes/safari-26_2-release-notes · S07 https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/149 · S08 https://webkit.org/blog/17862/webkit-features-for-safari-26-4/ · S09 https://developer.apple.com/documentation/safari-release-notes/safari-26_4-release-notes · S10 https://chromereleases.googleblog.com/2026/08/ · S11/S12 https://api.webstatus.dev/v1/features · S13 https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/css-anchor-positioning.json ; https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/147 ; https://developer.chrome.com/release-notes/151 · S14 https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ · S15 https://drafts.csswg.org/css-anchor-position-1/ (captured header: W3C WD 2026-05-08) · S16 https://groups.google.com/a/chromium.org/g/blink-dev/c/kN5LTzuTLVs/m/6HqTsmk3EQAJ · S17 https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select · S18 https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv · S19 (404) …/data/interop-2025/interop-2025-stable-v2.csv · S20 https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/155 · S21 …/Releases/153 · S22 …/Releases/132 · S23 https://developer.mozilla.org/en-US/docs/Web/API/Popover_API · S24 https://open-ui.org/components/customizable-select.explainer/ · S25 https://github.com/openui/open-ui/blob/6061711eb3d1cdb0a4e69672275285c418f6447e/site/src/pages/components/selectlist.mdx · S26 https://webaim.org/projects/million/ · S27 https://www.24a11y.com/2019/select-your-poison-part-2/ · S28 https://webkit.org/blog/17938/webkit-features-for-safari-26-5/ ; https://developer.apple.com/documentation/safari-release-notes/safari-26_5-release-notes · S29 https://developer.chrome.com/release-notes/147 · S30 https://developer.chrome.com/release-notes/152 · S31 https://github.com/WebKit/WebKit/pull/70058 ; https://bugs.webkit.org/show_bug.cgi?id=259770 · S33 …/Releases/154 · S34 …/Releases/151 · `[ABS]` leads: https://web.dev/baseline/2026 ; https://web.dev/blog/baseline-digest-may-2026 ; https://web.developers.google.cn/blog/baseline-digest-jun-2026 ; https://www.igalia.com/news/interop-2026.html ; https://www.oddbird.net/2025/01/29/anchor-position-validity/ ; https://developer.chrome.com/blog/anchor-positioning-api ; https://developer.chrome.com/blog/a-customizable-select ; https://2025.stateofcss.com/en-US/features ; https://arxiv.org/html/2502.10884v1 ; https://frontendnexus.com/news/114/

# Completion audit
Report written 2026-09-09 15:10–15:18 +03 by the platform-primitives research worker; read-back, line count and SHA-256 are reported in the worker's return message (not embedded here to avoid a self-referential hash).

