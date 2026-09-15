# Verification — Approved item 3: SHARE (web `/t/<id>` landing + Web Share; Flutter share sheet)

Date: 2026-09-04 · Lane: d575a0b1-81c4-4cbd-93d8-78ab7b8a857d · Task: `w9-share`
Berk's order (2026-09-02, verbatim): "player a share opsiyonu ekleyelim en ileri seviyede"; task list approved 2026-09-04 "basla".

## What was built

| Layer | Artefact | Caller (wiring proof) |
| --- | --- | --- |
| DB | `deploy/payload/prisma/migrations/20260904160000_catalogue_share_function/migration.sql` → `fn_catalogue_public_ids(p_limit)` | `catalogueRepository.publicIds()` ← `app/sitemap.ts` |
| Config | `deploy/payload/lib/catalogue/config.ts` `shareConfig` (origin, `/t/` prefix, OG image 1200×630, clip limits, sitemap cap, GA id) | `app/t/[id]/page.tsx`, `app/sitemap.ts` |
| SSR page | `deploy/payload/app/t/[id]/page.tsx` — OG/Twitter/canonical/JSON-LD `MusicRecording`, native `<audio preload=metadata>`, full track facts, `data-track` for the client | Next.js route `/t/:id` (404 for unknown / non-public) |
| Client | `public/site/share.js` (Web Share API → clipboard → manual field; GA `share` event), `public/site/track.js` (mounts Share/Like/Add, counts plays), `public/site/track.css`, `public/site/chrome.css` (extracted homepage chrome, built by `scripts/build_create_page.py`) | `/t/[id]` page, `musics.js` cards, `player.js` now-playing row |
| CSS | `public/site/ui.css` `.soc-share` joins the `.soc-like/.soc-add` pill family | all three surfaces |
| Sitemap | `deploy/payload/app/sitemap.ts` — static entries + every public track `/t/<id>` with `lastmod = createdAt` | `/sitemap.xml` |
| Flutter | `app/lib/src/config/share_config.dart`, `app/lib/src/data/share_service.dart` (`SharePort` seam, `TrackShareService`), `ShareButton` in `app/lib/src/widgets/social_actions.dart` | `player_screen.dart` `_SocialRow`, `musics_screen.dart` `_TrackCard` |
| Dependency | `share_plus ^13.3.0` (pub 2026-07-23; Flutter ≥3.38.1, local 3.44.6) — contract archived under `docs/external-api/share_plus/` | `SharePlusPort` |

## Evidence produced this session

### Web — live host, real pointer clicks (`scripts/verify-tools/verify-share.cjs`, 14/14 PASS, exit 0)
```
counts: {"cards":23,"shares":23,"webShare":"function"}
PASS  every /musics card has a Share button (23 cards)
after share: {"clip":"https://www.playmusicprompts.com/t/024e79fe-…","last":"copied","toast":"Link copied - paste it anywhere."}
PASS  clipboard holds https://www.playmusicprompts.com/t/<id> of the clicked card
PASS  share method recorded "copied" and toast shown
PASS  og:url and canonical are this track's /t URL
PASS  og:title + og:audio present (audio https://www.playmusicprompts.com/media/<id>.mp3)
PASS  JSON-LD MusicRecording with the page URL
PASS  native <audio> carries the track source (/media/<id>.mp3)
PASS  Share + Like + Add-to-playlist mounted on the track page
PASS  Share on the track page copies its own URL
PASS  375px: overflow 0px, SC 2.5.8 violations 0
PASS  768px: overflow 0px, SC 2.5.8 violations 0
PASS  1440px: overflow 0px, SC 2.5.8 violations 0 (targets under 24px but spaced: 3)
```
- HTTP on host: `/t/<id>` 200 · `/t/does-not-exist` 404 · `/sitemap.xml` 200 with 23 `/t/` URLs · `/site/{chrome.css,share.js,track.js}` 200.
- Audio on `/t`: `readyState 4`, `duration 132.78 s`, `play()` → `currentTime 1.72 s` after 2.5 s (really plays; the "0:00/0:00" in the screenshot is the pre-metadata frame).
- The 3 sub-24 px targets at 1440 px are the homepage header nav links (39–80×20 px, 30 px gaps); measured 24 px-circle intersections = 0, so they pass WCAG 2.2 SC 2.5.8 through the **spacing exception**. They belong to Berk's homepage design and are unchanged.
- Screenshots: `docs/verification/share-375.png`, `share-768.png`, `share-1440.png` (375 read back visually: card, chips, native audio, prompt/duration/file/model/take facts, toast).
- `tsc --noEmit` exit 0; `node --check` on share.js/track.js/player.js/musics.js clean.

### Flutter (`flutter analyze` 0 issues; `flutter test` 32 passed, 2 skipped as before)
- `share button sends the /t/<id> link through the OS share sheet with every documented field` — real `tester.tap` on the card pill; recorded `ShareParams`: `uri` = `/t/<id>` of that card, `text` ends with the URL and names the model, `title` = clipped prompt, `subject` = `PlayMusicPrompts: <title>`, `sharePositionOrigin` = the tapped pill rect (≥24×24); "Shared." shown only because the port returned `success`.
- `dismissed shows a notice` — "Share cancelled." shown, no success claim.
- `unavailable claims nothing` — one call recorded, no notice (platform cannot report).
- `share params: url shape, title clipping and email subject match the web shareConfig` — 149-char title clipped to exactly 70 with `…`, whitespace normalised, `subject` format, `sharePositionOrigin` null when no rect.
- Goldens regenerated (card footer gained the Share pill).

### Test-harness finding (root cause measured, not guessed)
A first version ran the *dismissed* and *unavailable* scenarios in ONE `testWidgets` with two `pumpWidget`s; the second tap recorded 0 calls. Measured: pill and lingering SnackBar do not overlap, no "not hit" warning; cause is Flutter's `State` reuse across same-shaped trees — `late final _share = widget.shareService ?? …` kept the first port. One scenario per test is the correct design (same pattern the existing `_repo`/`_social` fields use; production never swaps the service at runtime).

## Not proven this session (named, not hidden)
- The OS share sheet itself opening on a real iOS/Android device or emulator — no device run in this session (item 6 of the approved list, emulator proof, is a separate billed task). What IS proven is the exact `ShareParams` payload handed to `share_plus`, and `share_plus` 13.3.0's documented mapping of those fields (README archived).
- Rich-card unfurl by third-party messengers (WhatsApp/iMessage/Slack) — not fetched by those services in this session; what is proven is the server HTML they read: og:title/description/url/image/audio + JSON-LD, on a 200 page with no JS required.
