# Emulator paid run — real generation on Android, three device-only defects found and closed

Date: 2026-09-04 (evening, UTC+3). Lane: `d575a0b1-81c4-4cbd-93d8-78ab7b8a857d`. Item 6 of the approved list
("emulator: real production + playlist + share sheet, billed part under separate approval").

Berk's approval chain, verbatim: 19:33 "tüm görev eksizsiz bitene kadar durma ve devam et tamamla, onay veriyorum.
ben yoruldum birez uyuyacağım"; after the D1 brief (run the billed emulator generation now, recommended, cost stated
$0.16): "durma devam et". The run was executed inside the stated figure: one delivered take.

Every number below was read from the production database, the emulator (`adb`, Medium_Phone_API_36.1,
1080×2400) or the repository in this session. Nothing is recalled.

## 1. What was run on the device (chronological)

| # | Action | Result | Evidence |
|---|--------|--------|----------|
| 1 | Home → prompt "Warm lo-fi beat with soft piano and vinyl crackle, calm and focused" → **Generate First Track** | Upstream refused: `Vertex error 400 … "code":"content_blocked"` → website 502 `GENERATION_FAILED` (class `upstream`) in 32.6 s; the app showed "Generation did not complete … The music model refused this brief. Reword it materially" with the request id | `music_jobs` id `cmtn9f16v0000o4xqedzry7sx`, status FAILED, requestId `124e4c5b-7861-449e-a0c4-4cf93d4d100a`, anon=t; screenshot `2026-09-04-emulator-gen-3-result.png` |
| 2 | Same field cleared, "Gentle instrumental study music with soft piano, mellow chords and a slow relaxed groove" → **Generate First Track** | SUCCEEDED in 95.0 s (took 00:01:34.999); 129 s mastered, −14 LUFS / −0.9 dBTP, "96 of 100 studio generations left today" | requestId `691bd79c-327f-4aa5-8db9-50e0127471bf`; screenshots `-gen-4-progress.png`, `-gen-5-result.png` |
| 3 | **Play now** | LIVE PLAYER: "Take 1 · Instrumental", model badge, `v4 signed`, `-14 LUFS · -0.9 dBTP`, request id, Like / Add to playlist / Share row, seekable timeline 0:02 → 2:09, played to the end | `-gen-6-player.png`, `-gen-8-track-ended.png` |
| 4 | Catalogue ingest of the delivered take (automatic, server side) | `music_tracks` row `09355ff0-0810-4798-8e8e-822cdfc014af`, take 1, `storageKey media/09355ff0-….wav`, sha256 present; catalogue 23 → 24 rows; the Musics screen shows it first ("24 tracks in the catalogue · showing 24") | DB query via SSM; `emu-now.png` (Musics) |
| 5 | **Share** in the player (first build) | **FAILED on device**: toast "That did not work: Invalid argument(s): uri and text cannot be provided at the same time" — the OS sheet never opened | `-gen-7-share-sheet.png` |
| 6 | **Share** on the first Musics card (fixed build, run5 APK) | Android chooser (`com.android.intentresolver/.ChooserActivityLauncher` was the resumed activity) with "Sharing text": clipped title, "… — made with the Ideasets Hybrid Music Composer Model on PlayMusicPrompts https://www.playmusicprompts.com/t/09355ff0-0810-4798-8e8e-822cdfc014af"; targets Quick Share, Chrome, Drive, Messages | `-gen-9-share-sheet-fixed.png` |

Spend this run: 1 delivered take (the $0.08 class); the refused request delivered nothing and, per the platform's
own error class, is not a generation.

## 2. Defects found only because a real device ran the code

### 2.1 Mojibake in the generation sheet — `app/lib/src/widgets/generation_dialog.dart`
Rendered "25â€“145 s", "Â·", "â€œ…â€" (screenshot `-gen-2-dialog.png`). Root cause measured: the file was stored
with a UTF-8 BOM and every non-ASCII character (– — · “ ”) was double-encoded (UTF-8 bytes re-encoded as UTF-8).
Dart compiles such a file without complaint, so only a rendered screen could show it. Repair: reverse decode
(CP1252 with Latin-1 fallback for the undefined 0x9D byte of ”), BOM stripped, CRLF count preserved 345/345,
17 mojibake sites → 0, file 17,180 → 17,103 bytes; non-ASCII set now exactly `· – — “ ”`.
Guard added: `app/test/source_encoding_test.dart` scans every `lib/**/*.dart` for a BOM and for the re-encoding
lead sequences and fails with path:line. Repo-wide search for the same markers (excluding docs, node_modules,
memory): only this file and `migration-manifest.json` (a data manifest, not shipped; left untouched, named here).

### 2.2 Share sheet never opened — `app/lib/src/data/share_service.dart`
`ShareParams` was built with both `uri` and `text`. The downloaded contract
(`docs/external-api/share_plus/share_plus_platform-ShareParams.dart.txt`, lines 42–43) says `text` "Cannot be
provided at the same time as [uri], as the share method will use one or the other", and share_plus 13.3.0
enforces it (`lib/share_plus.dart` line 83, `ArgumentError`). I wrote code against a contract I had on disk and
the fake test port accepted what the plugin rejects — my error. Fix: `text` only (it carries the link and is
"Supported platforms: All"), `title` + `subject` + `sharePositionOrigin` unchanged; `RecordingSharePort` in
`app/test/musics_screen_test.dart` now throws the plugin's own `ArgumentError` on `uri && text`, and the test
asserts `p.uri == null`. Device proof: table row 6.

### 2.3 Transport shows "pause" over a finished track — `app/lib/src/state/playback_controller.dart`
After the only track completed, just_audio kept `playing == true`, so the button showed pause and a tap would
have called `pause()` on a finished source (screenshot `-gen-8-track-ended.png`). Fix: `_onEnded` with no next
track now calls `_restAtEnd()` (pause + seek 0) so the transport shows Play and one tap replays.
**UNPROVEN on the device**: after the reinstall the in-memory session was gone and a second billed take was not
spent to reproduce it; proven only by code reading and by the suite passing (analyze 0, 41 tests).

## 3. Findings that are not defects of this build but need Berk's decision

- **Ad-break boundary on Android needs a playlist.** `PlaybackController._onEnded` runs `maybeRunBreak` only when a
  next track exists (`next >= 0`), exactly like the web policy (ads between tracks). One generated take therefore
  produced 0 `ad_opportunities` rows (table count 0 at 18:15Z). The DECLINED(no-ad-tag) row for `surface=android`
  requires "Make it a playlist" = 3 takes = $0.24, above the $0.16 stated in the brief — not spent.
- **Two audio players.** `MusicsScreen` owns its own `AudioPlayer` (`musics_screen.dart` line 61) and disposes it
  when the screen closes; the session `PlaybackController` is a second player. Measured: a catalogue track played
  inline while the Player screen showed "Nothing is playing yet" (`-gen-10-rest-at-end.png`); nothing prevents both
  playing at once. The 2026-09-04 18:2x STATE entry saying Musics plays "via PlaybackController" was inaccurate —
  corrected in STATE.md. Whether catalogue playback should join the session player (one transport, one queue) is a
  product decision.

## 4. Deterministic evidence this session
- `flutter analyze` → No issues found (run twice after the fixes).
- `flutter test` → 41 passed, 2 skipped (live tests) — includes the new encoding guard and the tightened share test.
- `flutter build apk --debug` run5 → exit 0; `app-debug.apk` 192,880,802 bytes, 21:18:36; `adb install -r` → Success.

## 5. Screenshots (all in this folder)
`2026-09-04-emulator-gen-1-prompt.png`, `-gen-2-dialog.png` (mojibake, before), `-gen-3-result.png` (refusal),
`-gen-4-progress.png`, `-gen-5-result.png`, `-gen-6-player.png`, `-gen-7-share-sheet.png` (failure, before),
`-gen-8-track-ended.png`, `-gen-9-share-sheet-fixed.png` (OS chooser, after), `-gen-10-rest-at-end.png`.
