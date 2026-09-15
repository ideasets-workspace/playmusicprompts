# UI/UX audit — measured baseline before the quality pass (Berk: "1000 üzerinden 5")

Date: 2026-09-04 22:0x (UTC+3). Order: "şuan UI ve UX olacak 1000 üzerinden 5 kalitesindeyiz hemen onları
düzelt önce." → scope confirmed "hepsi" (web + phone + tablet), approval "başla şimdi".
Direction: Berk's own designs are the approved direction (`docs/Designs/PlayMusicPrompts_One_Prompt_Interface.png`,
`docs/Designs/mobile_app/*`, `docs/Designs/tablet/*`); this pass raises craft to those designs, it does not
invent a new direction (rules/14).

## 1. Web — measured by `scripts/verify-tools/ux-audit-web.cjs` (CDP, headless Edge, live site)
Report: `web-metrics.json`; screenshots `web-<page>-<width>.png` (full page) and `crop-*-375-*.png` (viewport slices).

| page | width | overflow | targets < 24 px | text < 12 px | contrast < AA | console errors |
|---|---|---|---|---|---|---|
| / | 375 | 0 | 4 (footer legal links 15 px tall) | 20 (8.5 / 10.5 / 11 px) | 21 | 0 |
| / | 768 | 0 | 4 | 20 | 21 | 0 |
| / | 1440 | 0 | 8 (+ 4 nav links 18 px tall) | 20 | 21 | 0 |
| /musics | 375 | 0 | 0 | 20 | 25 (cap) | 0 |
| /musics | 1440 | 0 | 3 nav links 18 px | 20 | 25 (cap) | 0 |
| /t/<id> | 375 | 0 | 0 | 9 | 12 | **1 — React #418 hydration mismatch** |
| /t/<id> | 1440 | 0 | 3 nav links 20 px | 8 | 12 | 1 |

Note on the contrast column: `h1` / `.hear` / `.dot` at 1.00:1 are gradient text (`-webkit-text-fill-color:
transparent`) — a measurement artefact of the tool, not a defect; every other row is real (muted token `--dim`
#A49FBE and `--faint` on the dark panels give 3.84–4.05:1 at 11–12 px, AA needs 4.5).

Visual findings from the screenshots (judgement, labelled as such):
- W1 Header at 375 on all three pages: "Start a session" wraps under the logo and collides with the hero; on
  /musics and /t the chrome differs from the homepage (tag "CREATE CONTROL FEEL" loses its coloured bullets —
  `chrome.css` styles `.tag i/u` but the bullets render as plain spaces in the template; the "Start a session"
  button is rendered as an underlined link).
- W2 Home 375: the Enhance button sits over the textarea placeholder text (overlap).
- W3 Footer legal links run together without separators ("PrivacyTermsCookies & AdsPrivacy choices"), 15 px tall.
- W4 Type floor: 8.5 px brand tag, 10.5 px eyebrow, 11 px field labels / counters / dt labels / facet counts.
- W5 Muted-token contrast (see table).
- W6 /t: React #418 in production (SSR/CSR text mismatch) — must be root-caused.
- W7 /t uses the browser's default `<audio>` control — visually foreign to the product; /musics uses native
  `<select>` and `<input type=range>` — foreign to the homepage's custom dropdowns.
- W8 "What PlayMusicPrompts is" block at 1440 is a dense four-column text wall; readable but low craft.

## 2. Flutter phone — `phone-01..10-*.png`, contact sheets `sheet-phone-1.png`, `sheet-phone-2.png` (run5 APK)
- F1 Studio exposes engineering plumbing to the user: "Source: live capabilities capture 8efe0bb0-…", the schema id
  `schema.text.music-studio-param-spec/v1`, binding badges "PROSE" / "SUR_STAGE", raw parameter keys
  (`creative_goal`, `prompt_enhance`) under human labels. Owner profile 44 forbids surfacing plumbing as message.
- F2 Home selectors show "—" for unset values where the web shows "Choose a genre" etc.; Voice shows "—" while
  Vocal shows "Instrumental".
- F3 Empty states (Player, Library Pinned/Recently added) are correct in content; visually repetitive dark cards.
- F4 No tablet AVD existed; `Pixel_Tablet_API_36_1` created from the installed API 36.1 image (audit pending).

## 3. Fix order (this pass)
Web W1 → W3 → W2 → W4/W5 (token + floor) → W6 (root cause) → W7 → W8; Flutter F1 → F2 → tablet audit → fixes.
Each fix lands with: tsc/build (web) or analyze/test (Flutter), re-run of the audit tool, and screenshots.
