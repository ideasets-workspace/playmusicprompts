# Standards ledger

| Governing standard | How this run implemented it | Evidence / status |
| --- | --- | --- |
| Deep-research covenant `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (SHA-256 `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB`, 1309 lines, hash re-measured this run) | Read in full in three segments before any external action; R4.1 broad discovery first; R8 raw captures + hashes under `_sources`; R10 three-source rule with `[single-source]`/`[UNVERIFIED]`; R11 slice floor; R17 read-back + hashes | Source register §6, claim ledger §9, `SHA256SUMS.txt` (180 lines) in the sources folder |
| Rule 24 (no harm / frontier) and rule 25 (no deception) — read from disk this run | Every number below is either read from a file/page opened this run or labelled; contradictions preserved (§8); faults reported first | §0 status line; §8 |
| Rule 14 (design contract) — knowledge only | Typeface CHOICE is left as OWNER-DECISION; this report supplies measured facts and a fact-backed shortlist, never a taste verdict | §2 table 3, §7.4 |
| Rules 10 / 20 / 26 (no narrowing, coding standards, memory-first) | Every angle (a)–(f) and every typeface named in the brief has a dated row or an explicit INACCESSIBLE/NOT FOUND; measurement scripts carry file headers and no invented constants | §2, §7, sources folder |
| Path resolution (R15.1) | Report at `docs/research/2026-09-09-frontier-ui-components-typography.md`; sources at `docs/research/_sources/2026-09-09-frontier-ui-components/typography/` (created this run); no other repository file modified | §12 |

## 0. Status line (bad news first)

- **Floors:** ≥14 independent authoritative sources met (32 provenance families in §6). Academic: 1 peer-reviewed primary read `[FULL]` (arXiv 2310.06939, five-part record §7.7); 3 further academic items `[PARTIAL]`/`[ABS]`. No peer-reviewed paper on **fallback-metric matching (size-adjust/ascent-override)** exists in the searched scope — reported as NOT FOUND IN THE SEARCHED SCOPE, not as non-existence.
- **Access failures (recorded, not hidden):** GitHub REST API rate-limited (HTTP 403) after two listing rounds → 2 of 36 Google-Fonts-hosted candidates (Google Sans Flex, Roboto Mono) were **not** downloaded and measured; their axes come from the Google Fonts metadata JSON only. GitHub HTML pages timed out in the fetch tool; release tags/dates/assets were resolved via shell redirects instead (all 11 succeeded).
- **Two parent beliefs are wrong and one is right** (§8, C-1..C-3): Manrope IS a variable font (wght 200–800) on Google Fonts; `text-wrap: pretty` shipped in **Safari 26.0 on 2025-09-15** (not Chromium-only until late 2025) and is still absent in Firefox 155; `text-box-trim` Safari 18.2 / Chrome 133 is correct, and Firefox 154 (2026-08-18) completed it.
- **Highest-impact finding for the rebuild:** Safari (through 26.6, current stable measured 2026-07-27) does **not** support `ascent-override` / `descent-override` / `line-gap-override`; only `size-adjust` works there. `next/font`'s automatic fallback therefore only partially matches metrics on Safari/iOS — CLS mitigation must be verified in Safari, not assumed.

# 1. Scope plan / decision served / why / project context

- **Decision served (CONTEXT-01):** the loading mechanism, font technology, production-safe CSS typography features (as of 2026-09-09) and the fact-backed shortlist of open-licensed variable typefaces for PlayMusicPrompts' from-scratch rebuild on Next.js 16.3.4 / React 19.2.8 / TypeScript 7.0.2 (`deploy/payload/package.json` lines 12–13, 31, read this run).
- **Local state measured this run:** `deploy/payload/app/styles/base.css:15` loads Manrope 400–800 through a render-blocking `@import url("https://fonts.googleapis.com/css2?...")`; `tokens.css:58–59` define `--font-sans: "Manrope", …` and `--font-mono: "JetBrains Mono", ui-monospace, …`; the only `font-variant-numeric: tabular-nums` is `player.css:45` (`.p-time`); `lib/fx/radio-dial.ts:28` hard-codes `"700 64px Manrope"` on a canvas; `kbd` hints in `nav.css:92`, `deck.css:34`, `world.css:23`; D-PMP-08 (2026-09-09) supersedes the visual layer of D-PMP-06 (which approved Manrope) and orders a black/dark, 3D interface.
- **Why downstream (CONTEXT-04):** wrong support data ships broken text on Safari; a wrong license is a legal fault; a wrong glyph-coverage claim breaks Turkish/Cyrillic titles. Hence every coverage claim below is read from the font's own `cmap`, not from a catalogue.
- **Falsifiers:** a Safari release shipping metric overrides (WebKit bug 219735); Firefox shipping `text-wrap: pretty` (bug 1960910) or unprefixed `line-clamp` by default; a newer Inter/Geist release changing coverage; the owner rejecting sans-serif altogether.
- **Geography:** GLOBAL (users worldwide; titles in many scripts). **Time:** newest first; browser data as of web-features 3.37.0 (published 2026-09-07) and caniuse tables read 2026-09-09. **Language:** English artifacts; German court texts read in German.

# 2. Outcome first

## 2.1 Table 1 — Loading mechanism

| Mechanism | Evidence (this run) | Verdict |
| --- | --- | --- |
| `@import` of Google Fonts CSS in a stylesheet (current `base.css:15`) | Render-blocking CSS import; browser connects to `fonts.googleapis.com` + `fonts.gstatic.com` → transmits the visitor IP to Google. LG München I 20.01.2022, 3 O 17493/20 (judgment read `[FULL]`): dynamic Google Fonts embedding without consent violates the right to informational self-determination; €100 damages; injunction. LG München I 30.03.2023, 4 O 13063/22 (`[PARTIAL]`, two law-firm summaries): crawler-driven mass warnings held abusive, but the underlying unlawfulness of consent-less dynamic embedding was restated. | **AVOID** (performance + GDPR exposure) |
| `next/font/google` | Next.js 16 docs (`[FULL]`, 906-line capture): "CSS and font files are downloaded at build time and self-hosted with the rest of your static assets. No requests are sent to Google by the browser." Auto `size-adjust`/`ascent-override`/`descent-override` fallback (`adjustFontFallback: true` default). `axes` accepts only axis-name strings (`['opsz']`), values must be set with `font-variation-settings`; GitHub issue #64960 (`[PARTIAL]`): extra axes reported "not compatible with automatic fallbacks". Serves the Google Fonts build of the family (Inter = "Version 4.001;git-66647c0bb", measured). | ADOPT only if the chosen family's Google Fonts build is the wanted build; otherwise prefer local |
| `next/font/local` with a self-subset variable WOFF2 | Docs (`[FULL]`): `src` string/array, `weight: '100 900'` ranges, `display` default `'swap'`, `preload` default `true` (injects `<link rel=preload>`), `adjustFontFallback: 'Arial' \| 'Times New Roman' \| false` (default `'Arial'`), `declarations: [{prop, value}]` for extra descriptors (e.g. `font-feature-settings`, manual `ascent-override`). Lets the team ship the **exact upstream release** (Inter 4.1 `InterVariable.woff2` measured 350,156 B; Geist 1.7.2 `Geist[wght].woff2` 69,104 B) and custom `unicode-range` subsets (§7.1). | **ADOPT** (primary mechanism) |
| Fallback metric overrides (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`) | web-features 3.37.0: `size-adjust` Baseline **high** since 2023-09-18 (Chrome 92, Firefox 92, Safari 17). `ascent/descent/line-gap-override`: Chrome 87, Firefox 89, **Safari: none** (caniuse `mdn-css_at-rules_font-face_ascent-override` "3.1–27: Not supported"; WebKit bug 219735: implementation landed 2026-07 behind a testable flag, "Shipping/default-on remains a separate decision"). | **ADOPT-WITH-FALLBACK**: rely on `size-adjust` everywhere; treat vertical-metric matching as Chromium/Firefox-only; verify CLS in Safari with a real device |
| `font-display` | Baseline high since 2020-01-15 (Chrome 60, Firefox 58, Safari 11.1). `swap` = FOUT with shift unless metrics match; `optional` = zero shift, font may never appear on first view. Vincent Bernat 2024 (`[PARTIAL]`): metric overrides took field CLS to 0 over a month. | `swap` + metric-matched fallback for body; consider `optional` for display-only faces |
| `<link rel="preload" as="font">` / `fetchpriority` | `link-rel-preload` Baseline high since 2021-01-26. `next/font` injects it automatically when `preload: true` and (for Google) `subsets` are given. | ADOPT via `next/font`; do not hand-add duplicates |
| Subsetting: `fontTools varLib.instancer` + `pyftsubset --flavor=woff2` + `unicode-range` | fontTools 4.62.1 + brotli available on this machine; measured this run: Noto Music accidentals subset (♯♭♮♪♩) = **920 B**, Noto Sans Symbols 2 kbd subset (⌘⇧⌥⏎) = **1,076 B**. fontTools docs (`[PARTIAL]`): default-preserved layout features are calt, ccmp, clig, curs, dnom, frac, kern, liga, locl, mark, mkmk, numr, rclt, rlig, rvrn; `tnum`/`zero`/`ss01` must be kept explicitly. | **BUILD** a scripted subset pipeline (keep `tnum,zero,ss01,case,cv*` explicitly) |
| WOFF2 vs TTF/OTF/WOFF | Dornauer, Vigl, Felderer, arXiv 2310.06939 (`[FULL]`, §7.7): 500 trials/format, Firefox Nightly 115 profiler — WOFF2 median load 161.5 ms vs TTF 210.0 ms; lowest CPU cycles and energy; ~2.5× more memory allocations than OTF. | ADOPT WOFF2 only (no WOFF fallback needed for the Baseline-2023 target) |

## 2.2 Table 2 — CSS typography features, support as of 2026-09-09

Sources per row: web-features 3.37.0 `data.json` (published 2026-09-07, tarball SHA-256 in `SHA256SUMS.txt`; queries saved as `web-features/baseline-query-1.txt` and `-2.txt`), cross-checked with caniuse tables and engine release notes where named. Browser "current stable" in that dataset: Chrome 152 (2026-08-25), Firefox 155 (2026-09-01), Safari 26.6 (2026-07-27). Baseline "low" = Newly available, "high" = Widely available.

| Feature | Chrome / Safari / Firefox (first version, date where read) | Baseline | Verdict |
| --- | --- | --- | --- |
| `text-wrap: balance` | 114 / 17.5 / 121 | low since 2024-05-13 | ADOPT (headlines, captions; Chromium caps at 4 lines, WebKit unlimited — WebKit blog `[FULL]`) |
| `text-wrap: stable` (+ `text-wrap-mode` / `text-wrap-style` longhands) | 130 / 17.5 / 124 | low since 2024-10-17 | ADOPT for the prompt editor and any live-editing text (WebKit blog: "should be used for editable text") |
| `text-wrap: pretty` | 117 (2023-09-12) / **26 (2025-09-15**, Safari 26.0 release notes `[FULL]`) / **none** (bug 1960910; Mozilla position positive) | false — "blocked since September 2025 by Firefox" (web-features explorer) | ADOPT-WITH-FALLBACK (progressive enhancement; Firefox falls back to `auto`; not an Interop 2026 focus area — interop issue #1136 says it has no MUST-level testable requirements) |
| `text-box-trim` / `text-box-edge` / `text-box` | 133 (2025-02) / 18.2 (2024-12) / **154 (2026-08-18)** | property keys `low` since 2026-08-18; overall feature `false` in 3.37.0 only because the `<text-edge>` type keys lack Firefox data (BCD lag) — web.dev Aug-2026 post calls it Baseline Newly available | ADOPT-WITH-FALLBACK (`text-box: trim-both cap alphabetic` for buttons/chips/time codes; older Safari/Firefox simply keep half-leading) |
| `line-clamp` (unprefixed, CSS Overflow 4) | none by default in any engine: Chrome behind experimental flag; Safari 18.2 shipped it by accident, 18.4 re-flagged (`CSSLineClampEnabled`, BCD PR #26771); Firefox 154/155 behind `layout.css.line-clamp.enabled` | false, support `{}` | AVOID unprefixed; use `-webkit-line-clamp` + `display:-webkit-box` + `-webkit-box-orient:vertical` (legacy but universal); flag DEPRECATED-IN-WAITING |
| `hanging-punctuation` | none / 26.5 (web-features; Safari-only) / none | false | AVOID (Safari-only; not Interop 2026) |
| `text-spacing-trim` | 123 / none / none | false | AVOID for Latin UI (CJK-only relevance) |
| `text-autospace` (`normal`, `no-autospace`) | 140 / 18.4 / 145 | low since 2025-11-11 (only the `normal`/`no-autospace` values; `auto`, `ideograph-*` lack Chrome) | ADOPT only as `text-autospace: normal` no-op safety; irrelevant for Latin/Cyrillic/Greek titles |
| `initial-letter` | 110 / none in 3.37.0 / none | false | AVOID |
| `hyphens: auto` + `hyphenate-character` | 88 / 17 / 43 | high since 2026-03-18 | ADOPT on long prompt text with `lang` set; Turkish dictionary availability per engine `[UNVERIFIED]` |
| `hyphenate-limit-chars` | 109 / none / 137 | false | ADOPT-WITH-FALLBACK (harmless where unsupported) |
| `text-underline-offset` / `text-underline-position` / `text-decoration-skip-ink` | 87/12.1/70 · 33/12.1/74 · 64/15.4/70 | high (2023-05-19 · 2023-01-28 · 2024-09-14) | ADOPT |
| `font-size: math` / math font family | `font-family-math` low since 2026-03-24 (109 / 26.2 / 149); `font-size: math` not a web-features entry (NOT FOUND) | low / NOT FOUND | AVOID (no need in this UI) |
| Container queries + `cqi`/`cqw` units | 105 / 16 / 110 | high since 2025-08-14 (units not a separate entry; covered by the feature) | ADOPT for component-scoped fluid type (Utopia `relativeTo: 'container'` emits `cqi`) |
| `lh` / `rlh` units | 109/16.4/120 · 111/16.4/120 | high since 2026-05-21 | ADOPT (`margin-block: 1lh`, `gap: 0.5lh`) |
| `cap` unit | 118 / 17.2 / 97 | high since 2026-06-11 | ADOPT (icon sizing to cap height) |
| `min()/max()/clamp()` | 79 / 13.1 / 75 | high since 2020-07-28 | ADOPT (Utopia formula, §7.3) |
| `white-space-collapse` | 114 / 17.4 / 124 | low since 2024-03-19 | ADOPT-WITH-FALLBACK (keep `white-space` shorthand for older) |
| `font-optical-sizing` | 79 / 13.1 / 62 | high since 2022-09-24 | ADOPT (`auto`; Inter opsz 14–32, Roboto Flex 8–144, Fraunces 9–144, Literata 7–72 measured) |
| `font-variation-settings` | 62 / 11 / 62 | high since 2021-03-05 | ADOPT for custom axes only (GRAD, XTRA, SOFT, WONK, CASL, MONO); MDN: it overrides high-level properties and resets unnamed axes |
| `font-synthesis` (+ `-weight`, `-style`, `-small-caps`) | 97 / 9 / 34 (longhands 97 / 16.4 / 111) | high (2024-07-06; longhands 2023-03-27) | ADOPT `font-synthesis: none` on any face shipped without italic/bold masters |
| `font-palette` | 101 / 15.4 / 107 | high since 2025-05-15 | ADOPT-WITH-FALLBACK — but COLRv1 itself is Chrome 98 / Firefox 107 / **no Safari** (`colrv1` false); `font-palette-animation` Chrome-only |
| `font-feature-settings` / `font-variant-numeric` | 48/9.1/34 · 52/9.1/34 | high (2019-10-05 · 2022-07-15) | ADOPT `font-variant-numeric: tabular-nums slashed-zero` (high-level, cascades); `font-feature-settings` only for `ss01`/`cv*` |
| `font-size-adjust` (incl. two-value `ex-height from-font`) | 127 / 17 (two-value) / 92 | low since 2024-07-25 | ADOPT-WITH-FALLBACK for mono↔sans x-height matching in mixed rows |
| `font-stretch` / `font-width` | 62/11.1/62 · `font-width` Safari 18.4 only | high / false | Use `font-stretch` (alias) now; `font-width` is the spec name but Safari-only |
| `text-rendering`, `-webkit-font-smoothing`, `-moz-osx-font-smoothing` | not in web-features (non-standard); MDN `font-smooth` page (`[PARTIAL]`): macOS-only; `antialiased`/`grayscale` "makes light text on dark backgrounds look lighter" | NOT FOUND (non-standard) | ADOPT `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale` on the dark root **only after visual check** (macOS Mojave+ already disabled subpixel AA system-wide — Tsai 2018 `[PARTIAL]`); avoid `text-rendering: optimizeLegibility` on large text bodies (kerning cost — `[UNVERIFIED]` magnitude) |
| `@property` (registered custom properties) | 85 / 16.4 / 128 | low since 2024-07-09 | ADOPT for animating axis values (`<number>` syntax) — §7.6 |

## 2.3 Table 3 — Typeface facts (measured from the font files this run)

Method: variable TTF downloaded from `github.com/google/fonts` (`main`, REST contents API; cached run 1), read with fontTools 4.62.1; coverage = presence in `cmap`; "woff2 full" = the whole variable file re-encoded to WOFF2 (brotli) — the delivered size **before** subsetting. TR = İ ı Ğ ğ Ş ş Ç Ö; Cyr = А я; Grk = Α ω; tnum/zero = GSUB feature present; "dig=" = default digits already uniform width. License = name-table ID 13/14 (all measured Google-hosted files declare SIL OFL 1.1). Google Fonts `lastModified` from `google-fonts-metadata-2026-09-09.json` (1,946 families). Full per-family JSON: `measurements-google-fonts.json`, `measurements-upstream-releases.json`.

| Typeface | License | Axes (measured fvar) | TR / Cyr / Grk | tnum / zero / dig | Version (name ID 5) · GF lastModified · upstream release | woff2 full | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Inter** (rsms) | OFL 1.1 | opsz 14–32, wght 100–900 (italic in a second file) | Y / Y (incl. Ә) / Y | Y / Y / n | GF "4.001;git-66647c0bb" · 2025-09-10 · **v4.1 2024-11-16** (`InterVariable.woff2` 350,156 B, name ID 5 also "4.001;git-9221beed3") | 349,200 B | 2,933 glyphs; ⌘⇧⌥↵⏎ present; ss01/cv* rich; no ♯♭ |
| Inter Tight | OFL 1.1 | wght 100–900 | Y / Y / Y | Y / Y / n | 3.004 · 2025-09-16 | 233,428 B | display-tracked sibling |
| **Manrope** | OFL 1.1 | **wght 200–800 (variable)** — no opsz | Y / Y (no Ә) / Y | Y / n / n | 4.504 · 2025-09-04 · sharanda/manrope (GitHub unreachable this run) | 53,704 B | 742 glyphs; no italic; no ⌘⇧ |
| **Geist** (Vercel) | OFL 1.1 | wght 100–900 | Y / Y / **n** | Y / n / n | 1.800 · 2026-05-13 · v1.7.2 2026-06-01 | 69,056 B (upstream 69,104 B) | 975 glyphs; no Greek; ⇧↵ only |
| Geist Mono | OFL 1.1 | wght 100–900 | Y / Y / n | n / n / **Y** | 1.701 · 2026-06-08 · v1.7.2 | 70,960 B | mono; no Greek; no slashed-zero feature (zero glyph style `[UNVERIFIED]`) |
| Instrument Sans | OFL 1.1 | wdth 75–100, wght 400–700 | Y / n / n | Y / n / n | 1.000 · 2025-09-04 | 88,672 B | Latin only |
| Onest | OFL 1.1 | wght 100–900 | Y / Y / n | Y / n / n | 2.001 · 2026-08-25 | 83,780 B | no italic on GF |
| Figtree | OFL 1.1 | wght 300–900 | Y / n / n | Y / n / n | 2.002 · 2025-09-11 | 27,604 B | Latin only, smallest file |
| Plus Jakarta Sans | OFL 1.1 | wght 200–800 | Y / n / n | Y / n / n | 2.071 · 2025-09-10 | 60,220 B | Latin (+cyrillic-ext subset flag but А/я absent in cmap → treat as Latin) |
| Outfit | OFL 1.1 | wght 100–900 | Y / n / n | Y / n / n | 1.100 · 2025-09-04 | 44,704 B | display-leaning, no `case` |
| Space Grotesk | OFL 1.1 | wght 300–700 | Y / n / n | Y / Y / n | 2.000 · 2025-09-04 | 49,276 B | tnum+zero+lnum |
| Sora | OFL 1.1 | wght 100–800 | Y / n / n | Y / n / n | 2.000 · 2025-09-08 | 49,316 B | |
| Urbanist | OFL 1.1 | wght 100–900 | Y / n / n | **n** / n / n | 1.303 · 2025-09-16 | 38,416 B | no tabular figures |
| Albert Sans | OFL 1.1 | wght 100–900 | Y / n / n | **n** / n / n | 1.025 · 2025-09-11 | 52,364 B | no tabular figures |
| Hanken Grotesk | OFL 1.1 | wght 100–900 | Y / n / n | n / n / Y | 3.013 · 2025-09-02 | 57,036 B | digits already uniform |
| Bricolage Grotesque | OFL 1.1 | opsz 12–96, wdth 75–100, wght 200–800 | Y / n / n | Y / n / n | 1.001 · 2025-09-11 | 204,836 B | 3 axes; Latin only |
| Fraunces | OFL 1.1 | opsz 9–144, wght 100–900, SOFT 0–100, WONK 0–1 | Y / n / n | n / n / n | 1.000 · 2025-09-10 | 194,780 B | display serif; no tnum feature |
| Newsreader | OFL 1.1 | opsz 6–72, wght 200–800 | Y / n / n | Y / n / Y | 1.003 · 2025-09-08 | 215,576 B | |
| Literata | OFL 1.1 | opsz 7–72, wght 200–900 | Y / Y / Y | Y / Y / n | 3.103 · 2025-09-11 | 397,852 B | 1,789 glyphs; reading serif |
| Source Sans 3 (Adobe) | OFL 1.1 | wght 200–900 | Y / Y / Y | **n** / Y / Y | 3.052 · 2025-09-04 · 3.052R 2023-04-04 | 172,568 B | 2,478 glyphs; ⌘⇧⌥; digits uniform by default (no tnum tag) |
| Source Serif 4 (Adobe) | OFL 1.1 | opsz 8–60, wght 200–900 | Y / Y / Y | Y / Y / Y | 4.004 · 2025-09-11 · 4.005R upstream | 424,428 B | |
| IBM Plex Sans | OFL 1.1 | wdth 75–100, wght 100–700 | Y / Y / Y | n / Y / Y | 3.201 · 2025-09-08 · IBM/plex `@ibm/plex-sans@1.1.0` 2024-11-13 (zip has **static** split WOFF2 only, 0 variable files) | 230,128 B | digits uniform by default |
| IBM Plex Mono | OFL 1.1 | **none on GF (static 100–700)**; variable not in the 1.1.0 release zip either | Y / Y / n | n / Y / Y | 2.3 · 2025-09-16 | 40,292 B (Bold static) | |
| **Roboto Flex** (Google/Font Bureau) | OFL 1.1 | 13 axes: opsz 8–144, wght 100–1000, GRAD −200–150, wdth 25–151, slnt −10–0, XOPQ 27–175, YOPQ 25–135, XTRA 323–603, YTUC 528–760, YTLC 416–570, YTAS 649–854, YTDE −305–−98, YTFI 560–788 | Y / Y / Y | **n** / n / Y | 3.200 · 2025-09-04 · release 3.200 2023-06-30 | **791,036 B** | digits uniform but no `tnum`/`pnum`; GRAD is the dark-mode weight-compensation axis |
| Noto Sans (variable) | OFL 1.1 | wdth 62.5–100, wght 100–900 | Y / Y / Y | Y / Y / Y | 2.015 · 2025-09-11 · notofonts LGC `NotoSans-v2.015` | 882,436 B | 4,515 glyphs — largest; subset before shipping |
| JetBrains Mono | OFL 1.1 | wght 100–800 | Y / Y (no Ә) / Y | n / Y / Y | 2.211 (GF) · 2025-09-11 · v2.304 2023-01-14 | 71,644 B | ⌘⇧⌥; current project mono |
| Commit Mono | OFL 1.1 (name ID 13) | **static** (400/700 ×2) | Y / **n** / n | n / n / Y | 1.143 · 2023-12-28 | 67,864 B (400 Regular) | not on GF; no Cyrillic |
| Berkeley Mono (TX-02) | **Proprietary** (U.S. Graphics EULA) | wght, wdth, slnt (TX-02 datasheet `[FULL]`) | Latin Ext A/B only (datasheet) | — | 2.000 | — | paid; web fonts +USD 45, variable +USD 24 over USD 75 developer license `[single-source]` third-party report; commercial use "UI elements only" — note only, not a candidate under rule 08 item 42 without Berk's approval |
| **Monaspace** (GitHub Next) | OFL 1.1 | wght, wdth, slnt (5 families) | Y / Y / Y | n / n / Y | 1.400 · 2026-03-28 | Neon 510,832 · Argon 540,384 · Xenon 583,680 · Radon 796,308 · Krypton 445,408 B | **only candidate with ♯♭♮**; texture healing via `calt`; ⌘⌥⏎ absent |
| Recursive | OFL 1.1 (URL absent in name table) | MONO 0–1, CASL 0–1, wght 300–1000, slnt −15–0, CRSV 0–1 | Y / n / partial (Α yes, ω no) | n / Y / Y | 1.085 · 2025-09-04 · v1.085 2022-06-30 | 718,364 B | one file = sans+mono |
| *Additions found:* DM Sans | OFL 1.1 | opsz 9–40, wght 100–1000 | Y / n / n | n / n / n | 4.004 · 2025-09-11 | 88,784 B | opsz but no Cyrillic/Greek |
| Mona Sans (GitHub) | OFL 1.1 | wdth 75–125, wght 200–900 | Y / n / n | Y / n / n | 2.000 · 2025-09-04 | 170,484 B | |
| Geologica | OFL 1.1 | wght, CRSV, SHRP, slnt | Y / Y / Y | Y / n / n | 1.010 · 2025-09-10 | 120,064 B | LGC + tnum |
| Golos Text | OFL 1.1 | wght 400–900 | Y / Y / n | Y / n / n | 2.004 | 76,480 B | |
| Schibsted Grotesk | OFL 1.1 | wght 400–900 | Y / n / n | Y / Y / n | 1.100 | 77,776 B | |
| Martian Mono | OFL 1.1 | wdth 75–112.5, wght 100–800 | Y / Y / n | n / n / Y | 1.000 · v1.1.0 2025-02-10 | 63,252 B | |
| Google Sans Code | OFL 1.1 | wght 300–800 (GF metadata also lists MONO 0–1) | Y / n / n | n / n / Y | 6.001 (GF) · 2026-04-14 · v7.001 2026-06-09 | 58,500 B | |
| Google Sans Flex | OFL (GF `isOpenSource: true`) | GRAD 0–100, ROND 0–100, opsz 6–144, slnt −10–0, wdth 25–151, wght 1–1000 (metadata only) | metadata subsets: latin/latin-ext/math/symbols (no Cyrillic/Greek) | — | GF 2026-07-30; `size: 0` in metadata | INACCESSIBLE (API 403) | not measured |
| Roboto Mono | OFL (moved to `ofl/`; `apache/robotomono` → 404) | wght 100–700 (metadata) | metadata: cyrillic/greek/latin-ext | — | GF 2026-05-05 | INACCESSIBLE (API 403) | not measured |

**Symbol fallbacks measured (BUILD):** Noto Music v2.003 covers ♯♭♮♪♩ (56,324 B subset served by Google; **920 B** after `pyftsubset` to U+2669–266F); Noto Sans Symbols 2 v2.008 covers ⌘⇧⌥⏎ (**1,076 B** subset); Noto Sans Math v3.000 covers ♯♭♮ and ⇧⏎ in one 270,516 B file. None of the 34 measured UI/mono candidates except Monaspace contains ♯ or ♭.

# 3. Framing and falsifiers

Subquestions answered: (a) loading; (b) font technology; (c) CSS feature support; (d) typeface facts; (e) music/number glyphs; (f) motion cost. What would flip a verdict is listed per row in §2 and in the watchlist §11.

# 4. Inclusion, exclusion, geography, dates, languages, constraints

Included: engine release notes, web-features/BCD data, caniuse, W3C-linked spec references, first-party repos and release artifacts, court texts, one peer-reviewed measurement paper. Excluded from load-bearing use: search snippets, AI summaries, tutorial blogs (used only as `[PARTIAL]` corroboration, marked). Geography GLOBAL; dates newest-first; languages EN/DE (court), TR probes in glyph tests. Lawful access only: GitHub REST rate limit was respected (no token, no retries beyond one).

# 5. Methodology and exact query/action log

| # | Time (+03) | Action | Yield |
| --- | --- | --- | --- |
| 1 | 14:52 | Read covenant (3 segments), rules 24/25; `Get-FileHash` covenant → matches brief | gate |
| 2 | 14:54 | Local intake: `rg` over `deploy/payload` for `fonts.googleapis|font-family|@font-face|next/font|Manrope`; `tokens.css`, `base.css`, `player.css`, DECISIONS D-PMP-06/08 | 24 hits; state in §1 |
| 3 | 14:56 | WebSearch "text-box-trim browser support 2026 Safari Chrome Firefox baseline" | web.dev Aug-2026, caniuse, Chrome blog, Firefox 154 notes |
| 4 | 14:56 | WebSearch "text-wrap pretty Safari Firefox support 2025 2026 release notes" | web-features explorer, WebKit blog 16547 (captured), STP 216 notes, bugzilla 1731541 |
| 5 | 14:56 | WebSearch "next/font localFont variable font Next.js 16 documentation adjustFontFallback size-adjust" | nextjs.org font API reference (captured, 906 lines) |
| 6 | 14:56 | WebSearch "Inter 4.1 release notes github rsms/inter variable opsz" | rsms releases (v4.1 2024-11-16, v4.0 2023-11-20), MDN variable-fonts guide (captured) |
| 7 | 14:58 | WebFetch caniuse css-text-box-trim; WebSearch Roboto Flex axes; WebSearch LG München 3 O 17493/20; WebSearch Manrope axes | full caniuse table; 13-axis list; judgment sources; fontsource `axes:[wght]` |
| 8 | 15:00 | WebSearch web-features npm; WebFetch explorer text-wrap-pretty; WebSearch line-clamp unprefixed; WebSearch Capsize/fontaine/size-adjust | package location; interop #725; BCD PR #26771 |
| 9 | 15:02 | `npm pack web-features` (3.37.0, tarball SHA `…` in SUMS); `node query.cjs`, `query2.cjs` | 60+ feature rows, by_compat_key detail, browser release dates |
| 10 | 15:05 | WebSearch ascent-override Safari; WebSearch Google Fonts metadata JSON | caniuse two tables; WebKit 219735; `fonts.google.com/metadata/fonts` |
| 11 | 15:07 | `Invoke-WebRequest fonts.google.com/metadata/fonts` (2,702,054 B); `gf-query.cjs`, `gf-query2.cjs` | axes/subsets/lastModified for 60 families; `languages` array empty for all |
| 12 | 15:10–15:20 | `measure-google-fonts.py` ×3 (run 1: UnicodeEncodeError on cp1252 stdout after measurement; run 2: HTTP 403 rate limit; run 3: cache-first) | 34/36 families measured |
| 13 | 15:22 | GitHub `releases/latest` redirects for 18 repos; tag pages + `expanded_assets` for 11 | dates + asset URLs |
| 14 | 15:25 | `measure-upstream-releases.py` (Inter 4.1, Geist 1.7.2, Monaspace 1.400, Commit Mono 1.143, IBM Plex Sans 1.1.0) | 12 files measured; 2 zips static-only |
| 15 | 15:28 | Google Fonts CSS2 API for Noto Music / Noto Sans Symbols 2 / Symbols / Math; `pyftsubset` to accidentals and kbd subsets | ♯♭ coverage; 920 B / 1,076 B subsets |
| 16 | 15:30 | WebSearch axis-animation cost; font-smoothing dark; academic (2 rounds); Safari 26 notes; next/font axes issue; Berkeley Mono; Utopia; Capsize/fontaine; pyftsubset/glyphhanger; Interop 2026; gesetze-bayern `[FULL]`; Chrome text-box-trim blog `[FULL]` | see §6 |
| 17 | 15:36 | `SHA256SUMS.txt` over 180 artifacts (`-LiteralPath` after a bracket-in-filename fault) | integrity |

Marginal yield: round 1 (browser features) saturated after the web-features dataset — later searches only corroborated; round 2 (typefaces) saturated after direct file measurement; round 3 (academic) produced one `[FULL]` measurement paper and no paper on metric matching after two formulations — recorded as NOT FOUND IN THE SEARCHED SCOPE.

# 6. Source register and read-status counts

Counts (provenance families, deduplicated): **authoritative 32**; **academic 4** (1 `[FULL]`, 3 `[ABS]/[PARTIAL]`); **primary `[FULL]` 12**. Captures and hashes: `docs/research/_sources/2026-09-09-frontier-ui-components/typography/SHA256SUMS.txt`; in-session-only reads: `access-records-in-session.md` in the same folder.

| ID | Source (organisation, date/version) | Class | Status | Capture |
| --- | --- | --- | --- | --- |
| S1 | Next.js docs — `next/font` API reference (Vercel, current for v16) | official docs | FULL | `nextjs-docs-app-api-reference-components-font.txt` |
| S2 | web-features 3.37.0 `data.json` (web-platform-dx, 2026-09-07) | standards data | FULL (queried) | `web-features/` tarball + queries |
| S3 | caniuse css-text-box-trim; mdn-css_at-rules_font-face_ascent-override; wf-font-metric-overrides (read 2026-09-09) | compat data | FULL | access record |
| S4 | WebKit blog 16547 "Better typography with text-wrap pretty" (Jen Simmons, 2025-04-08) | engine blog | FULL | `webkit-blog-16547-text-wrap-pretty.txt` |
| S5 | Safari 26.0 Release Notes (Apple, 2025-09-15) + WebKit blog 17333 | engine notes | FULL | `apple-safari-26.0-release-notes.txt`, `webkit-blog-17333-…txt` |
| S6 | Chrome for Developers "CSS text-box-trim" (Adam Argyle, 2025-01-14) | engine blog | FULL | access record |
| S7 | web.dev "New to the web platform in August" (2026) | engine blog | PARTIAL | access record |
| S8 | MDN Firefox 154 release notes; MDN Experimental features | vendor docs | PARTIAL / FULL | `mdn-firefox-experimental-features.txt` |
| S9 | web-features explorer — text-wrap: pretty | standards data | FULL | access record |
| S10 | WebKit bug 219735 (metric overrides) | bug tracker | PARTIAL | access record |
| S11 | interop issues #725, #1136, #1029, #1043; BCD PR #26771 | standards process | PARTIAL | access record |
| S12 | LG München I, 20.01.2022, 3 O 17493/20 (gesetze-bayern.de) | court | FULL | access record |
| S13 | LG München I, 30.03.2023, 4 O 13063/22 via llp-law.de and mkm.legal; heise 2022 | court (secondary) | PARTIAL | access record |
| S14 | MDN Variable fonts guide; MDN font-variation-settings; MDN font-smooth | vendor docs | FULL / PARTIAL / PARTIAL | `mdn-guides-fonts-variable-fonts.txt` |
| S15 | Google Fonts metadata JSON (2026-09-09) + Developer API docs | first-party data | FULL (queried) | `google-fonts-metadata-2026-09-09.json` |
| S16 | google/fonts repository, `main`, 34 variable TTFs (measured) | first-party code | FULL (measured) | `fonts/**` |
| S17 | rsms/inter v4.1 (2024-11-16) release zip | first-party code | FULL (measured) | `upstream/rsms_inter/` |
| S18 | vercel/geist-font v1.7.2 (2026-06-01) | first-party code | FULL (measured) | `upstream/vercel_geist-font/` |
| S19 | githubnext/monaspace v1.400 (2026-03-28) webfont-variable | first-party code | FULL (measured) | `upstream/githubnext_monaspace/` |
| S20 | eigilnikolajsen/commit-mono v1.143 (2023-12-28) | code | FULL (measured) | `upstream/eigilnikolajsen_commit-mono/` |
| S21 | IBM/plex `@ibm/plex-sans@1.1.0` (2024-11-13) | first-party code | FULL (inspected) | `upstream/IBM_plex/` |
| S22 | googlefonts/roboto-flex 3.200 (2023-06-30); FontLab blog 2025-05-06; typeyeah axis list | code + secondary | FULL (measured) / PARTIAL | `fonts/robotoflex/` |
| S23 | Noto Music v2.003, Noto Sans Symbols 2 v2.008, Noto Sans Symbols v2.003, Noto Sans Math v3.000 via Google Fonts CSS2 API | first-party fonts | FULL (measured) | `symbol-fallback/` |
| S24 | Dornauer, Vigl, Felderer — "On the Role of Font Formats in Building Efficient Web Applications", arXiv 2310.06939 (Univ. Innsbruck / Cologne / DLR, 2023; replication package DOI 10.5281/zenodo.8391883) | academic | **FULL** | `arxiv-2310.06939-…txt` |
| S25 | "Differentiable Variable Fonts", arXiv 2510.07638 (2025) | academic | ABS | `arxiv-2510.07638-…txt` |
| S26 | Wallace et al./Adobe et al., "Personalized Font Recommendations…", ACM DIS 2022, doi 10.1145/3532106.3533457 | academic | ABS (readability is the HCI worker's slice) | `acm-dis2022-…txt` |
| S27 | arXiv 2111.09960 "Reining in Mobile Web Performance with Document and Permission Policies" | academic | PARTIAL (font-display-late-swap, CLS) | `arxiv-2111.09960-…txt` |
| S28 | vercel/next.js issue #64960 / discussion #64959 (`axes`) | code issues | PARTIAL | access record |
| S29 | seek-oss/capsize (+ @capsizecss/metrics 4.2.0, 2026-07-20); unjs/fontaine (last push 2026-04-22) | code | PARTIAL | access record |
| S30 | Utopia (utopia.fyi calculator; trys/utopia-core; postcss-utopia) | tooling | PARTIAL | access record |
| S31 | fontTools subset docs; zachleat/glyphhanger; WFO.com and MRW subsetting guides | tooling | PARTIAL | access record |
| S32 | U.S. Graphics TX-02 Berkeley Mono datasheet (2.000) + product page; notes.inegales.com price report | vendor / secondary | FULL / PARTIAL | `usgraphics-tx-02-berkeley-mono-datasheet.txt` |
| S33 | Chrome for Developers "Improved font fallbacks", "Framework tools for font fallbacks" (Hempenius) | engine blog | PARTIAL | access record |
| S34 | web-font-optimization.com (3 pages), webvitals.tools, vincent.bernat.ch 2024, DebugBear | practitioner | PARTIAL (corroboration only) | `wfo-*.txt`, `webvitals-tools-…txt` |
| S35 | Michael Tsai 2018 (Mojave subpixel AA); Tab Atkins www-style 2012 | secondary / standards list | PARTIAL | access record |
| S36 | @fontsource-variable/manrope 5.3.0 (2026-07-19) | package | PARTIAL | access record |

# 7. Findings per angle

## 7.1 Angle (a) — Loading

- **Mechanism contract (S1, FULL).** `next/font/local` emits one `@font-face` per `src` entry with `font-display` (default `swap`), hashes the file into `/_next/static/media/*.p.woff2` and injects `<link rel="preload">` when `preload: true`; a second `@font-face` `__X_Fallback` with `src: local('Arial')` carries `size-adjust`/`ascent-override`/`descent-override`/`line-gap-override` (mechanism confirmed by Chrome's framework post S33 and the larsmagnus capture). `declarations` allows arbitrary descriptors (e.g. `{prop:'font-feature-settings', value:'"ss01"'}`), so OpenType defaults can ride in the face itself.
- **Failure mode 1 — Safari metrics (S3, S10).** Safari ignores the three override descriptors (caniuse: "3.1–27: Not supported"; WebKit 219735 comment 18: implemented 2026-07-01 behind a flag). On Safari the auto-fallback only scales width via `size-adjust`; vertical rhythm of the fallback stays Arial's. Application: measure CLS on iOS Safari after implementing; if a display face with unusual ascent (e.g. Manrope 2132/2000 upm, Plus Jakarta 1038/1000) is chosen, expect a vertical shift on Safari that Chromium will not show.
- **Failure mode 2 — `axes` (S1, S28).** `next/font/google` `axes: ['opsz']` includes the axis in the downloaded file but values are only settable via `font-variation-settings`; a maintainer-adjacent comment reports axes "not compatible with automatic fallbacks". `next/font/local` sidesteps this because the local file carries whatever axes the build keeps.
- **Legal (S12 FULL, S13).** The Munich judgment's Leitsatz 2: no legitimate interest exists because "Google Fonts kann … auch genutzt werden, ohne dass … eine Übertragung der IP-Adresse … an Google stattfindet" — i.e. self-hosting is the court-named remedy. The 2023 ruling ended the warning-letter business model but restated that dynamic embedding without consent is unlawful. The current `base.css:15` is exactly that pattern.
- **Subsetting pipeline (S31, measured).** `fonttools varLib.instancer <font> wght=300:800 opsz=drop` → `pyftsubset --unicodes=<latin,latin-ext,cyrillic,greek ranges> --layout-features+=tnum,zero,ss01,case,cv11 --flavor=woff2 --no-hinting --desubroutinize`, one file per `unicode-range` block. Baseline: default-kept features exclude `tnum`/`zero`/`ss*` (fontTools docs) — omitting `+=` silently drops tabular figures.
- **Academic (S24, FULL, §7.7):** WOFF2 median load 161.5 ms vs WOFF 172.0 / OTF 196.0 / TTF 210.0 ms (n=500 each); ship WOFF2 only.

## 7.2 Angle (b) — Font technology

- **Registered axes ↔ high-level properties (S14 MDN):** wght→`font-weight`, wdth→`font-stretch` (spec name `font-width`, Safari 18.4-only per S2), slnt→`font-style: oblique <angle>`, ital→`font-style: italic`, opsz→`font-optical-sizing`. Custom axes (GRAD, XTRA, SOFT, WONK, CASL, MONO, CRSV, SHRP, ELSH) need `font-variation-settings`, which "will always override" the high-level properties and resets any axis not listed (S14, S34) — keep one custom-property-per-axis pattern and assemble the string in one place.
- **Optical size (measured):** Inter opsz 14–32 (default 14), Roboto Flex 8–144, Fraunces 9–144, Literata 7–72, Newsreader 6–72, Source Serif 4 8–60, Bricolage 12–96, DM Sans 9–40. `font-optical-sizing: auto` (Baseline high) maps CSS px to opsz; Chromium/WebKit/Gecko agree on this mapping for `auto` (S14).
- **Dark-background compensation:** Roboto Flex `GRAD −200…150` and Google Sans Flex `GRAD 0…100` are the only measured candidates with a grade axis (changes stroke weight without changing advance widths → no reflow when toggled). All other candidates need `font-weight` changes (reflow) or `-webkit-font-smoothing: antialiased` (macOS-only, thins light-on-dark text — MDN S14).
- **Numerics:** `font-variant-numeric: tabular-nums slashed-zero` is Baseline high (2022-07-15) and cascades; `tnum` feature measured present in Inter, Manrope, Geist, Instrument, Onest, Figtree, Plus Jakarta, Outfit, Space Grotesk, Sora, Bricolage, Newsreader, Literata, Source Serif 4, Noto Sans, Inter Tight, Mona Sans, Geologica, Golos, Schibsted; **absent** in Urbanist, Albert Sans, Hanken, Fraunces, Source Sans 3 (digits uniform by default), IBM Plex Sans (uniform by default), Roboto Flex (uniform by default), Recursive, DM Sans. `zero` (slashed zero) present in Inter, Space Grotesk, Literata, Source Sans 3, Source Serif 4, IBM Plex Sans/Mono, Noto Sans, JetBrains Mono, Recursive, Inter Tight, Schibsted; absent in Manrope, Geist, Geist Mono, Roboto Flex, Monaspace, Commit Mono.
- **COLRv1 / `font-palette`:** `font-palette` is Baseline high but COLRv1 fonts do not render in Safari (S2 `colrv1: false`, no Safari key) — a gradient logo-glyph via COLRv1 needs an SVG fallback.
- **`font-synthesis`:** Baseline high; set `font-synthesis: none` where a face has no italic (Manrope, Onest, Outfit, Sora, Roboto Flex on GF all ship upright only) to stop faux-italic/faux-bold.

## 7.3 Angle (c) — CSS features

Full matrix in §2.2. Additional mechanism notes: `text-wrap: balance` — Chromium limits balancing to 4 lines, WebKit balances all lines (S4); `pretty` — Chromium adjusts the last 4 lines only, WebKit whole paragraph incl. rag and hyphenation, "not yet rivers" (S4), and Safari 26.0 release notes list "Added support for text-wrap-style: pretty (145577976)" (S5). Fluid type: Utopia's `calculateTypeScale` returns `clamp(minRem, interceptRem + slopeVi, maxRem)` and flags WCAG SC 1.4.4 200 % zoom violations per step (`wcagViolation`), with `relativeTo: 'container'` emitting `cqi` (S30) — use it rather than hand-written `clamp()` (16 occurrences in the current CSS were hand-written).

## 7.4 Angle (d) — Typefaces (facts only; choice is OWNER-DECISION)

Fact-backed shortlist by requirement class — **not a recommendation of taste**:
- *Full Turkish + Cyrillic + Greek, variable, tabular figures, slashed zero, kbd glyphs, opsz:* only **Inter** (4.1 upstream / 4.001 on GF) meets all seven measured properties. Inter Tight adds the display-tracked variant (no opsz).
- *Turkish + Cyrillic + Greek, variable, tnum:* Literata (serif), Source Serif 4 (serif), Noto Sans (4,515 glyphs, 882 KB full), Geologica (custom CRSV/SHRP/slnt axes).
- *Turkish + Cyrillic (no Greek):* Manrope (current, wght-only, no Ә, no kbd glyphs), Geist (no Greek, no slashed zero), Onest, Golos Text, JetBrains Mono, Martian Mono, Monaspace (Greek yes), Geist Mono.
- *Latin only (Turkish yes, no Cyrillic/Greek):* Instrument Sans, Figtree, Plus Jakarta Sans, Outfit, Space Grotesk, Sora, Urbanist, Albert Sans, Hanken Grotesk, Bricolage Grotesque, Fraunces, Newsreader, Recursive (partial Greek), DM Sans, Mona Sans, Schibsted Grotesk, Commit Mono, Google Sans Code, Berkeley Mono (proprietary).
- *Many-axis systems:* Roboto Flex (13 axes, 791 KB full — needs `instancer` to drop parametric axes before shipping), Google Sans Flex (6 axes, not measured), Recursive (5 axes, 718 KB).
- *Google Fonts build vs upstream:* Inter on GF is the 4.0-era build (`git-66647c0bb`); rsms v4.1 (2024-11-16) carries Cyrillic/Greek glyph fixes per the release notes and 2,937 vs 2,933 glyphs measured. Geist on GF (1.800) equals upstream 1.7.2. JetBrains Mono on GF is 2.211 vs upstream 2.304.

## 7.5 Angle (e) — Music/number UI glyphs

- **Time codes / BPM:** any `tnum` face above, or a face with uniform digits by default (Source Sans 3, IBM Plex Sans, Roboto Flex, Hanken, Newsreader). Current `.p-time` already uses `tabular-nums`; the catalogue rows (`musics.css:31`, `home.css:127`) do not.
- **Key names with ♯/♭:** **no** measured sans/mono candidate except Monaspace has U+266F/U+266D. Measured remedy: Noto Music (♯♭♮♪♩) subset = 920 B WOFF2, declared with `unicode-range: U+2669-266F` in a second `@font-face` under the same family name, so `C♯m` renders without a fallback jump; Noto Sans Math (270 KB) also covers them but is oversized.
- **kbd hints (⌘ ⇧ ⌥ ↵ ⏎):** present in Inter/Inter Tight (all five), Source Sans 3 and JetBrains Mono (⌘⇧⌥), Commit Mono (⌘⇧), Geist (⇧↵), Geist Mono (⇧↵⏎), Manrope (↵ only). Remedy where missing: Noto Sans Symbols 2 kbd subset = 1,076 B.
- **₺ (Turkish lira U+20BA):** present in Inter, Manrope, Onest, Plus Jakarta, Space Grotesk, Albert, Bricolage, Fraunces, Newsreader, Literata, Source Sans 3/Serif 4, IBM Plex, Roboto Flex, Noto Sans, Recursive, Inter Tight, DM Sans, Mona Sans, Geologica, Schibsted; **absent** in Geist, Geist Mono, Instrument, Figtree, Outfit, Sora, Urbanist, Hanken, JetBrains Mono, Google Sans Code, Martian Mono, Golos.

## 7.6 Angle (f) — Motion typography

- `font-variation-settings` is a string-valued property: two strings do not interpolate; register each axis with `@property --wght { syntax: '<number>'; inherits: true; initial-value: 400 }` (Baseline low since 2024-07-09: Chrome 85, Safari 16.4, Firefox 128) and transition the custom property (S34 ×3, S14). Where `@property` is unsupported the value snaps — safe degradation.
- Cost: every frame of an axis change re-shapes glyph outlines and usually re-lays-out text (advance widths change with wght/wdth) — paint **and** layout work on the main thread, not compositor-only (S34; author-labelled practitioner sources, `[PARTIAL]`, no engine-published benchmark found → magnitude `[UNVERIFIED]`). Mitigations in the same sources: keep sweeps short (≤300 ms) and interaction-triggered, never scroll-linked per frame; gate behind `prefers-reduced-motion`; pause off-screen animations with `IntersectionObserver` (FontLab 2026-02-03); prefer `transform: scale()` for size-only effects; `font-palette` animation is Chromium-only (S2).
- `GRAD` (Roboto Flex / Google Sans Flex) is the exception: grade changes stroke weight **without** changing advance widths (Google Fonts specimen text, S22), so a hover/active weight pulse on GRAD avoids layout — paint only.

## 7.7 Five-part academic record — S24 (arXiv 2310.06939, FULL)

1. **Problem (authors' framing):** "we have not identified any scientific literature yet examining the performance of font formats in terms of several efficiency criteria" — the RQ: how do TTF/OTF/WOFF/WOFF2 compare in client-side load time, CPU, memory and energy.
2. **Method:** controlled experiment, one test page with three faces (Source Sans, Raleway Extrabold v3.000, Montserrat Semibold v3.100) in each of 4 formats; WOFF/WOFF2 produced with ttf2woff 3.0.0 / ttf2woff2 5.0.0; Firefox Nightly 115.0a1 Profiler at 0.5 ms sampling, cache disabled, window = DOMContentLoaded→Load; 500 trials per format; one-way ANOVA + Tukey HSD after Brown-Forsythe and Lilliefors checks.
3. **Numbers (Table, "median (Q1, Q3)"):** load time ms — OTF 196.0 (189.1, 205.1), TTF 210.0 (203.5, 219.1), WOFF 172.0 (164.9, 180.1), **WOFF2 161.5 (155.8, 169.3)**; CPU cycles — WOFF2 27,888,552 vs OTF 32,667,944; memory allocations — OTF 2264.5, TTF 2727.5, WOFF 6235.8, WOFF2 5746.6 (WOFF2 ≈2.53× OTF); energy mWh — WOFF2 2.59, WOFF 2.72, OTF 3.13, TTF 3.27. ANOVA load time F(3,1996)=1138, p<2.2e-16, η²=0.631; all pairwise Tukey p_adj=0.
4. **Limitations:** authors — single browser (Firefox Nightly, because only its profiler exposes memory/energy), single device, three faces, generalisability "adversely impact[ed]"; analyst — 2023 static fonts, no variable fonts, no CLS, WOFF2 decompression cost on low-end mobile not covered, conversions via npm wrappers rather than official builds.
5. **Application here:** ship WOFF2 only (drop `format()` fallbacks); accept the ~2.5× allocation overhead; the 48 ms median gap (TTF→WOFF2) is per page load on desktop — on the mobile `/musics` rows with many text nodes the format choice is fixed by `next/font` anyway (it emits WOFF2).

# 8. Contradictions, corrections, uncertainty and gaps

| ID | Contradiction / gap | Resolution |
| --- | --- | --- |
| C-1 | Parent belief: "Manrope has no variable axis, static weights only on Google Fonts" | **Wrong.** GF metadata `axes:[wght 200–800]`, measured `Manrope[wght].ttf` fvar wght 200–800, fontsource `axes:[wght]`. Correct part: no `opsz`, no italic. |
| C-2 | Parent belief: "`text-wrap: pretty` is Chromium-only until late 2025" | **Wrong on Safari, right on Firefox.** Safari 26.0 shipped it 2025-09-15 (S5, S9); Firefox 155 still none (S9, bug 1960910). |
| C-3 | Parent belief: "`text-box-trim` shipped in Safari 18.2 and Chrome 133" | **Right**, and Firefox 154 (2026-08-18) completed the trio (S3, S7, S8). |
| C-4 | web-features 3.37.0 marks the `text-box` *feature* `false` while its property compat keys are `low` (2026-08-18) and web.dev calls it Baseline Newly available | Cause visible in `by_compat_key`: the `css.types.text-edge*` keys carry no Firefox version yet (BCD lag). Treat as Baseline Newly available with the caveat recorded. |
| C-5 | Inter version strings: rsms v4.1 release zip reports name ID 5 "Version 4.001;git-9221beed3"; Google Fonts file "Version 4.001;git-66647c0bb" | Upstream does not bump the name-table version for 4.1; distinguish builds by git hash (and glyph count 2,937 vs 2,933). |
| C-6 | Roboto Mono in `google/fonts`: expected `apache/robotomono` → HTTP 404; GF metadata `dateAdded 2025-05-12` | Family was re-added (likely under `ofl/`); not re-listed because the API rate limit hit. INACCESSIBLE this run. |
| C-7 | Berkeley Mono prices | Only a third-party 2024-12 blog states USD 75 / +45 web / +24 variable; vendor page shows tiers without prices in the captured text → `[single-source]`, re-verify at purchase time (R16.4). |
| C-8 | MDN `font-smooth` says `antialiased` makes light-on-dark text look lighter; Tsai 2018 notes Mojave disabled subpixel AA system-wide | Not contradictory: on Mojave+ the property still switches Chrome/Safari from macOS "font smoothing" (dilated) to plain grayscale; effect only on macOS; magnitude unmeasured here → visual check required. |
| G-1 | No peer-reviewed study of `size-adjust`/`ascent-override` metric matching after two academic search formulations | NOT FOUND IN THE SEARCHED SCOPE; primary evidence is engine documentation (S33) + one field report (S34 Bernat). |
| G-2 | Turkish hyphenation dictionary availability per engine | `[UNVERIFIED]` — not tested. |
| G-3 | Google Sans Flex and Roboto Mono not measured | INACCESSIBLE (GitHub API 403); metadata rows only. |
| G-4 | Axis-animation cost magnitude | `[UNVERIFIED]` — practitioner sources only; no engine benchmark found. |
| G-5 | GitHub HTML pages timed out in the fetch tool | Resolved via shell redirects/expanded_assets; release *notes text* (e.g. Inter 4.1 changelog) read only via search excerpt → `[PARTIAL]`. |

# 9. Claim ledger (load-bearing)

| ID | Claim | Sources (independent) | Status |
| --- | --- | --- | --- |
| K-1 | `next/font` self-hosts Google Fonts at build time; no browser request to Google | S1 (docs), S33 (Chrome), S34 (larsmagnus CSS sample) | 3+ verified |
| K-2 | Safari through 26.6 lacks `ascent/descent/line-gap-override`; `size-adjust` supported since Safari 17 | S3 (2 caniuse tables), S2 (web-features), S10 (WebKit bug), S34 (phpied) | 3+ verified |
| K-3 | `text-box-trim`: Chrome 133, Safari 18.2, Firefox 154 | S3, S6, S7, S8, S2 | 3+ verified |
| K-4 | `text-wrap: pretty`: Chrome 117, Safari 26.0 (2025-09-15), Firefox none | S9, S5, S4, S2, S11 | 3+ verified |
| K-5 | Unprefixed `line-clamp` shipped by default nowhere; Safari 18.2 accident reverted 18.4 | S11 (interop #725, BCD PR), S8 (Firefox flag), S2 (`support {}`) | 3+ verified |
| K-6 | Dynamic Google Fonts embedding without consent unlawful (DE), €100 damages | S12 (judgment), S13 (2 firms + heise), gdprhub | 3+ verified |
| K-7 | Manrope is variable wght 200–800, no opsz, Cyrillic+Greek basic | measured fvar/cmap (S16), S15 metadata, S36 fontsource | 3+ verified |
| K-8 | Inter covers TR+Cyr+Grk, tnum+zero, ⌘⇧⌥↵⏎, opsz 14–32; latest upstream v4.1 2024-11-16 | measured S16 + S17 (two builds), rsms releases page | 3+ verified (two builds are one provenance family for glyph facts → coverage `[single-source official]`, disclosed) |
| K-9 | Roboto Flex has 13 axes with the ranges in §2.3 | measured fvar (S22), FontLab blog, typeyeah list, GF metadata | 3+ verified |
| K-10 | No measured sans/mono candidate except Monaspace has ♯/♭; Noto Music covers them | measured cmap of 34 GF files + 12 upstream files + 4 Noto files | measured (single method, 50 files) |
| K-11 | WOFF2 fastest median load (161.5 ms) among four formats | S24 only | `[single-source]` academic; corroborated qualitatively by S34/S31 |
| K-12 | `font-variation-settings` cannot interpolate as a string; `@property` `<number>` enables transitions; `@property` Baseline low 2024-07-09 | S14 (MDN), S2, S34 ×2 | 3+ verified |
| K-13 | `font-palette` Baseline high but COLRv1 has no Safari support | S2 (`font-palette` high; `colrv1` support lacks safari) | `[single-source]` (one dataset, two keys) |
| K-14 | Chromium `balance`/`pretty` limited to 4 lines; WebKit whole paragraph | S4 (WebKit blog citing Chrome article), S5 | 2 sources → `[single-source]` on the Chromium limit (Chrome article not opened) |

Counts: 3+ verified **10**; single-source **4** (K-8 coverage nuance, K-11, K-13, K-14); unverified **4** (G-2, G-4, Geist Mono zero style, `text-rendering` cost).

# 10. Synthesis — ADOPT / BUILD / AVOID (typography stack knowledge; typeface choice remains OWNER-DECISION)

- **ADOPT:** `next/font/local` with self-subset variable WOFF2; `display: 'swap'` + `adjustFontFallback` (verify Safari CLS separately); `font-variant-numeric: tabular-nums slashed-zero` on every time/BPM/count surface; `font-optical-sizing: auto`; `text-wrap: balance` (headings) / `stable` (prompt editor) / `pretty` (long prompt text, progressive); `text-box: trim-both cap alphabetic` on buttons/chips/time codes; `lh`/`cap`/`cqi` units; Utopia-generated `clamp()` scale with WCAG 1.4.4 check; `font-synthesis: none` on upright-only faces; `@property`-registered axis variables for any axis motion.
- **BUILD:** a scripted subset pipeline (`varLib.instancer` + `pyftsubset --layout-features+=tnum,zero,ss01,case`) producing per-script `unicode-range` files plus the 920 B accidentals subset and the 1,076 B kbd subset under the same family names; a Safari-specific CLS test in the verification suite.
- **AVOID:** the `@import` to `fonts.googleapis.com` (performance + GDPR); unprefixed `line-clamp`; `hanging-punctuation`, `initial-letter`, `text-spacing-trim`; relying on `ascent-override` for Safari; COLRv1 without SVG fallback; per-frame JS-driven `font-variation-settings`; the paid Berkeley Mono without owner approval (rule 08 item 42).

# 11. Living-update watchlist

- WebKit bug 219735 (metric overrides shipping) — check each Safari release note; Firefox bug 1960910 (`text-wrap: pretty`); `layout.css.line-clamp.enabled` default flip; web-features `text-box` feature flag turning `low` once BCD adds Firefox to `text-edge`; rsms/inter next release; vercel/geist-font releases (1.7.2 → ?); googlefonts `robotomono` directory; Interop 2027 proposals for `pretty`/`line-clamp`/`hanging-punctuation`. `as_of: 2026-09-09`; freshness horizon 90 days for browser data, 180 days for typeface data.

# 12. Artifact index and produced-vs-planned count

Planned: 1 report + 1 sources folder (CONTEXT-16). Produced: this report; sources folder with 180 hashed files (`SHA256SUMS.txt`): 36 captured pages/logs/queries/scripts at top level, `web-features/` (tarball + package + 2 query outputs), `google-fonts-metadata-2026-09-09.json`, `fonts/` (34 TTF + 34 WOFF2 re-encodings), `upstream/` (5 release zips + extracted variable files), `github-releases/` (22 HTML pages), `symbol-fallback/` (4 CSS + 13 WOFF2 + 2 subsets), `access-records-in-session.md`. No other repository file was modified (verify: `git status` is not the witness — the only writes were under `docs/research/`).

# 13. Sources — complete citations

1. Vercel, "Font | Next.js API Reference (App Router)", https://nextjs.org/docs/app/api-reference/components/font — FULL.
2. web-platform-dx, `web-features` 3.37.0, https://registry.npmjs.org/web-features/-/web-features-3.37.0.tgz (published 2026-09-07) — FULL (queried).
3. caniuse, https://caniuse.com/css-text-box-trim ; https://caniuse.com/mdn-css_at-rules_font-face_ascent-override ; https://caniuse.com/wf-font-metric-overrides — FULL.
4. Jen Simmons (WebKit), "Better typography with text-wrap pretty", 2025-04-08, https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/ — FULL.
5. Apple, "Safari 26.0 Release Notes", 2025-09-15, https://developer.apple.com/documentation/safari-release-notes/safari-26-release-notes ; WebKit, "WebKit Features in Safari 26.0", https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ — FULL.
6. Adam Argyle (Chrome), "CSS text-box-trim", 2025-01-14, https://developer.chrome.com/blog/css-text-box-trim — FULL.
7. web.dev, "New to the web platform in August", 2026, https://web.dev/blog/web-platform-08-2026 — PARTIAL.
8. MDN, Firefox 154 release notes, https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/154 ; Experimental features, https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features — PARTIAL / FULL.
9. web-features explorer, "text-wrap: pretty", https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-pretty/ — FULL.
10. WebKit Bugzilla 219735, https://bugs.webkit.org/show_bug.cgi?id=219735 — PARTIAL.
11. web-platform-tests/interop issues #725, #1136, #1029, #1043; mdn/browser-compat-data PR #26771 — PARTIAL.
12. LG München I, Endurteil 20.01.2022 – 3 O 17493/20, https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612 — FULL.
13. LG München I, 30.03.2023 – 4 O 13063/22 via https://www.llp-law.de/… and https://mkm.legal/… ; heise online 2022-11 — PARTIAL.
14. MDN, "Variable fonts" guide; "font-variation-settings"; "font-smooth" — FULL / PARTIAL / PARTIAL.
15. Google Fonts metadata, https://fonts.google.com/metadata/fonts (2026-09-09); Developer API docs https://developers.google.com/fonts/docs/developer_api — FULL / PARTIAL.
16. google/fonts `main` (34 variable TTFs listed in `measurements-google-fonts.json`) — FULL (measured).
17. rsms/inter v4.1, 2024-11-16, https://github.com/rsms/inter/releases/tag/v4.1 — FULL (measured).
18. vercel/geist-font v1.7.2, 2026-06-01 — FULL (measured).
19. githubnext/monaspace v1.400, 2026-03-28 — FULL (measured).
20. eigilnikolajsen/commit-mono v1.143, 2023-12-28 — FULL (measured).
21. IBM/plex `@ibm/plex-sans@1.1.0`, 2024-11-13 — FULL (inspected).
22. googlefonts/roboto-flex 3.200, 2023-06-30; FontLab blog 2025-05-06 https://blog.fontlab.com/2025/05/06/roboto-flex-thirteen-axes/ ; https://typeyeah.com/fonts/roboto-flex/ — FULL (measured) / PARTIAL.
23. Google Fonts CSS2 API: Noto Music, Noto Sans Symbols 2, Noto Sans Symbols, Noto Sans Math — FULL (measured).
24. B. Dornauer, W. Vigl, M. Felderer, "On the Role of Font Formats in Building Efficient Web Applications", arXiv:2310.06939 (2023), replication DOI 10.5281/zenodo.8391883 — FULL.
25. "Differentiable Variable Fonts", arXiv:2510.07638 (2025) — ABS.
26. S. Wallace et al., "Personalized Font Recommendations…", ACM DIS 2022, doi:10.1145/3532106.3533457 — ABS.
27. arXiv:2111.09960, "Reining in Mobile Web Performance with Document and Permission Policies" — PARTIAL.
28. vercel/next.js issue #64960, discussion #64959 — PARTIAL.
29. seek-oss/capsize; @capsizecss/metrics 4.2.0; unjs/fontaine — PARTIAL.
30. Utopia, https://utopia.fyi/type/calculator/ ; trys/utopia-core; trys/postcss-utopia — PARTIAL.
31. fontTools subset docs https://fonttools.readthedocs.io/en/latest/subset/index.html ; zachleat/glyphhanger — PARTIAL.
32. U.S. Graphics, TX-02 Berkeley Mono datasheet and product page; notes.inegales.com 2024-12-27 — FULL / PARTIAL.
33. K. Hempenius (Chrome), "Improved font fallbacks"; "Framework tools for font fallbacks" — PARTIAL.
34. web-font-optimization.com (3 pages), webvitals.tools font-loading guide, V. Bernat 2024 "Fixing layout shifts caused by web fonts", DebugBear — PARTIAL.
35. M. Tsai, "macOS 10.14 Mojave Removes Subpixel Anti-aliasing", 2018-07-13; T. Atkins, www-style 2012-10-01 — PARTIAL.
36. @fontsource-variable/manrope 5.3.0 — PARTIAL.

# 14. Completion audit

Every angle (a)–(f) has a section; every typeface in CONTEXT-02 (30 names) has a row, plus 9 additions; 2 rows are INACCESSIBLE and say so; floors: authoritative 32 ≥ 14; academic 1 FULL (the brief required "≥1 if it exists"); read-back and SHA-256 of this report are recorded in the worker's return message (the file cannot hash itself before it is closed).
