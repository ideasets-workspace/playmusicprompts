# UI/UX quality pass — measured result after the fixes (web + Flutter phone + tablet)

Date: 2026-09-04 (UTC+3 evening). Order: "şuan UI ve UX olacak 1000 üzerinden 5 kalitesindeyiz hemen onları
düzelt önce. hepsi , başla şimdi." Scope confirmed "hepsi" (web + phone + tablet). Baseline and defect list:
`2026-09-04-ui-ux-audit-baseline.md` in this folder. Direction: Berk's own designs (rules/14 — craft raised to
his design, no new direction).

Every number below was produced by a tool in this session: `scripts/verify-tools/ux-audit-web.cjs` (headless Edge,
CDP, live site) for the web, `flutter analyze` / `flutter test` and the Android emulators for Flutter. Judgement
lines are labelled as judgement.

## 1. Web — live measurement after deploy #5 (report generated 2026-09-04T20:26:06.080Z)

`web-metrics.json` in this folder; full-page screenshots `web-<page>-<width>.png`.

| page | width | overflow px | targets < 24 px | text < 12 px | contrast < AA (tool) | console errors |
|---|---|---|---|---|---|---|
| / | 375 | 0 | 0 | 0 | 4 | 0 |
| / | 768 | 0 | 0 | 3 | 4 | 0 |
| / | 1440 | 0 | 0 | 3 | 4 | 0 |
| /musics | 375 | 0 | 0 | 0 | 2 | 0 |
| /musics | 768 | 0 | 0 | 3 | 2 | 0 |
| /musics | 1440 | 0 | 0 | 3 | 2 | 0 |
| /t/984310cf-… | 375 | 0 | 0 | 0 | 2 | 0 |
| /t/984310cf-… | 768 | 0 | 0 | 3 | 2 | 0 |
| /t/984310cf-… | 1440 | 0 | 0 | 3 | 2 | 0 |

Baseline for the same cells (from the baseline document): targets < 24 px were 4 / 4 / 8 / 0 / 3 / 0 / 3, text
< 12 px was 20 / 20 / 20 / 20 / 20 / 9 / 8, contrast rows 21 / 21 / 21 / 25 / 25 / 12 / 12, /t had 1 React #418.

What the remaining non-zero cells are (read from `web-metrics.json`, not inferred):

- text < 12 px = 3 at 768 / 1440 on every page: `span.tag "CREATE • CONTROL • FEEL"` and its two bullet
  glyphs at 10.5 px — Berk's brand eyebrow under the logo (hidden at 375). Left as designed; changing it is an
  OWNER-DECISION.
- contrast = 4 on the homepage: `h1`, `span.hear`, `span.dot` report 1.00:1 because they are gradient text
  (`-webkit-text-fill-color: transparent`) — a measurement artefact, not a defect; and `i "3"` at 4.33:1 vs 4.5
  needed — the step-3 numeral in Berk's accent violet `#7A4DFF` on the dark panel. Raising it means changing his
  accent colour: OWNER-DECISION, left untouched.
- contrast = 2 on /musics and /t: the gradient `h1` + `.dot` artefact only.

### Behaviour probes (the audit tool's new `probe` field — the enhancements actually mounted in a real browser)

- `/` — `factsHeads: 4` (four W8 icon headers rendered).
- `/musics` — `enhanced: 3`, `modes: listbox ×3`, `nativeSelectsVisible: 0`, trigger text
  `Voice All | Language All | Sort Newest`, clicking the first trigger opened a `role="listbox"` with 5 options and
  `aria-expanded="true"`.
- `/t/<id>` — `audioHasControls: false`, `transportHidden: false`, `timelineRole: slider`, `duration: 2:14`,
  `playLabel: Play`.

### Defects W1–W8 — status per item

| id | defect (baseline) | fix (files) | evidence |
|---|---|---|---|
| W1 | 375 header: CTA wrapped under the logo; /musics and /t chrome differed from home | `ui.css` (.top nowrap, compact brand, `.btn-session`), brand bullets in `musics.template.html`, `app/t/[id]/page.tsx`, `components/legal/LegalPage.tsx` | `check1-home-375.png`, `check1-headers-375.png`; deploys #1–#2 |
| W2 | Enhance button over the textarea placeholder | `ui.css` promptbox column layout | `check1-home-375.png` |
| W3 | footer legal links 15 px, no separators | `consent.js` renders `<nav class="legal-nav">` after the footer on every page | targets < 24 px = 0 on 9/9 |
| W4 | 8.5 / 10.5 / 11 px type | `scripts/raise_type_floor.py` (28 single-match edits in musics.css / track.css / chrome.css / ui.css), `.wcard span` 12.5 px override | text < 12 px: only the brand tag remains (see above) |
| W5 | `--dim` / `--faint` 3.84–4.05:1 | `ui.css` tokens `--dim #B9B4D3`, `--faint #9A95B8` | contrast list: no `--dim` / `--faint` row remains |
| W6 | /t React #418 hydration mismatch | `app/t/[id]/page.tsx`: consent/social/share/track through `next/script strategy="afterInteractive"` | console errors 0 on 9/9 |
| W7a | /t native grey `<audio controls>` | `page.tsx` server-renders the product transport; `track.js` `mountTransport()` drives it from the same `<audio>` (play/pause, click+drag+keyboard seek, buffered, times, mute); `track.css` layout; `ui.css` `.timeline` 24 px hit target with the 10 px drawn bar | behaviour probe above; `web-track-1440.png`; targets < 24 px = 0 |
| W7b | /musics native `<select>` ×3 | new `select-enhancer.js` (progressive enhancement: native select stays the form control, homepage `.sel` trigger + `.dd` listbox on fine pointers, platform picker on coarse pointers); `musics.template.html` wrappers with the homepage icons; `musics.css` modes; `musics.js` dispatches `pmp:filters-synced` | behaviour probe above; `web-musics-1440.png` |
| W8 | 1440 "What PlayMusicPrompts is" text wall | `scripts/build_create_page.py` FACTS_SECTION header rows with the "why"-card `.wic` tiles; `ui.css` `.facts-grid` (12.5 / 13 px body, 1.6 line-height, column rules) | `factsHeads: 4`; `web-home-1440.png` |

Deploys this pass: 5 × `DEPLOY_NO_NGINX_COMPLETE` (SSM on i-0c52f530769d1ac88), each followed by a served-file
curl check and a full audit run.

Coarse-pointer (touch) mode of `select-enhancer.js` is UNPROVEN in a browser this session: the audit runs a
desktop Edge with a fine pointer, so `data-mode="native"` was never exercised; the code path exists and is
covered by the CSS in `musics.css`, but no touch device or emulation ran it.

## 2. Flutter — phone + tablet

- `flutter analyze`: `No issues found!` (7.1 s). `flutter test`: `+41: All tests passed!` (goldens regenerated
  22:44: phone home/library/musics/player/profile/studio, tablet home/musics/studio).
- run6 debug APK `app/build/app/outputs/flutter-apk/app-debug.apk` 192,884,750 B (22:44:59) installed on the
  phone AVD and on `Pixel_Tablet_API_36_1`.
- F1 Studio plumbing → product voice: `app/lib/src/theme/pmp_strings.dart` (new), `studio_screen.dart`
  (capture hash / schema id / binding enums / raw parameter keys removed from the visible surface; keys moved
  to tooltips; human badge labels; provenance footer). Evidence `phone-after-02-studio.png`,
  `phone-after-03-studio-mid.png`, `tablet-after-studio.png`.
- F2 Home selectors: `value_picker.dart` shows the unset state in `PmpColors.faint`, distinct from a chosen value.
  Evidence `phone-after-01-home.png`.
- Tablet: opaque bottom bar (`PmpColors.bottomBar 0xFF0A0818`, `app_shell.dart`) — the translucent bar showed page
  content through it (`tablet-01-bottombar-crop.png`); single-column screens constrained to
  `PmpDimens.tabletSingleColumnMaxWidth = 624` (library, player, profile, queue, studio, musics). Evidence
  `tablet-after-home.png`, `tablet-after-studio.png`, `sheet-m6-tablet-after.png`.
- F3 (repetitive dark empty-state cards) — judgement item in the baseline, NOT changed this pass: the empty
  states are Berk's design language; recorded, not fixed.

## 3. Item 6 evidence taken during this pass (playlist on the phone emulator)

Live database, read this session: `ad_opportunities` rows with `surface='android'`: 4, all
`decision='DECLINED'`, `declineReason='no-ad-tag'`, `boundaryIndex` 1..4, `listenedSeconds` 132 / 265 / 397 / 531,
`createdAt` 19:43:32Z .. 19:50:17Z; `fn_ad_daily_summary(1)` → android opportunities 4, requested 0, filled 0.
Screens `m6-01..08-*.png`; `_restAtEnd` observed on device (`m6-06-rest-at-end.png`). A real audio ad on device is
UNPROVEN: the server policy has no `ADS_AUDIO_TAG_URL`, so every boundary is declined before the IMA SDK is
asked. The number of paid takes in this run was NOT measured from the database this session (the query used a
wrong physical table name and errored); the previous STATE entry's "5 takes" is therefore unverified here.
