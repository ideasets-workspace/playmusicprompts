# Verification — Approved item 5: Google audio ad breaks (web + Flutter), UMP, banner/rewarded, legal pages

Date: 2026-09-04 · Lane: d575a0b1-81c4-4cbd-93d8-78ab7b8a857d · Author: Cursor agent (this session)

Every row below carries the evidence produced in THIS session. Rows marked **UNPROVEN** are
not delivered; they are named here so no reader mistakes them for proven work.

## 1. Contract on disk (rules/23 external-api law)

| Artefact | Path | Measured this session |
|---|---|---|
| Google IMA / GAM / UMP docs | `docs/external-api/google-ima/` | README.md index; `github-interactive_media_ads-README.md` L17-18 "Background Audio ads … not supported", L58-76 desugaring, L154-198 + L275-278 + L327 Dart API; `admob-flutter-*.html` (banner, rewarded, privacy-ump, quick-start) |
| Plugin versions | `docs/external-api/google-ima/pub-api-google_mobile_ads.json`, `pub-api-interactive_media_ads.json` | google_mobile_ads latest 9.1.0 (2026-08-11); interactive_media_ads 0.3.0+17 (2026-08-28) — fetched from pub.dev API |
| Audio sample tag | — | Google publishes NO audio sample tag (README index, L88-L133 lists 22 video/VMAP samples only) → the tag is OWNER-HELD (Berk's GAM audio unit) |

## 2. Web half — live on production host (proven earlier this session, recorded in STATE.md 21:0x)

| Component | Caller → input → output | Evidence |
|---|---|---|
| `prisma/migrations/20260904200000_ad_opportunities` | deploy → `_prisma_migrations` | row `finished_at` not null; `fn_ad_opportunity_open`, `fn_ad_event_record`, `fn_ad_daily_summary` executed |
| `app/api/ads/policy/route.ts` | player boot → GET | `{"enabled":false,"reason":"no-ad-tag",…}` (ADS_AUDIO_TAG_URL unset) |
| `app/api/ads/events/route.ts` | ads.js → POST open/event | 201 open; 404 unknown id; 200 STARTED/COMPLETE; 400 BOGUS event; row `adId=a1 dur 30 audible 29.5` |
| `public/site/ads.js` | `<script>` in index (1 ref) | served 200, 13,506 B |
| Legal pages `/privacy`, `/terms`, `/cookies-and-ads` | sitemap + footer | 3× HTTP 200, h2 counts 8/9/6, owner-review note present; `legal.css` 200; sitemap 3 locs |

## 3. Flutter half — code proven off-device this session

| Component | Caller | Evidence |
|---|---|---|
| `lib/src/config/ads_config.dart` | AdUnitResolver ← BannerSlot/RewardedAdService | `flutter analyze` 0 issues (whole app) |
| `lib/src/data/ads_policy_repository.dart` | AdBreakController.loadPolicy / open / event | 5/5 tests in `test/ad_break_controller_test.dart` assert the real POST bodies (`kind`, `decision`, `declineReason`, `sessionId`, `boundaryIndex`) |
| `lib/src/data/consent_gate.dart` | AdsBootstrap.start | analyze 0; host gate proven by `screenshot_capture_test.dart` 7/7 passing after fix (§5) |
| `lib/src/features/ads/ad_break_controller.dart` | `PlaybackController._advanceThroughAdBreak` (every track boundary) | tests: no-ad-tag → DECLINED(no-ad-tag), music not paused; tag but no container → DECLINED(background); `wireName` camel→UPPER_SNAKE; consent-denied appends `npa=1&ltd=1` |
| `lib/src/features/ads/display_ads.dart` BannerSlot | `MusicsScreen` list tail | analyze 0 (SDK path device-only, see §4) |
| `lib/src/features/ads/ads_bootstrap.dart` | `main.dart` `_PlayMusicPromptsAppState.initState` post-frame | analyze 0; `SessionState.ads` set; `playback.adBreak` attached |
| Player/Musics/Profile wiring | `player_screen.dart` AdBreakSurface; `musics_screen.dart` BannerSlot; `profile_screen.dart` "Privacy options" when UMP requires | analyze 0; full suite 40/40 |
| Android build config | `build.gradle.kts` desugaring + `admobAppId` placeholder; `AndroidManifest.xml` APPLICATION_ID meta-data | debug APK build: see §6 |

Full suite: `flutter test` → **40 passed, 0 failed** (2 skipped by their own `skip:` flags, pre-existing).

## 4. UNPROVEN — named, not delivered

1. **`RewardedAdService.showOnce` has no caller.** The only 429 in the app is the server spend-guard, which has no reward entitlement; a "watch an ad → retry" button would be FAKE (rules/must-engineering). What the reward unlocks is an OWNER-DECISION for Berk and needs a server-side entitlement first.
2. **IMA ad break on a device** (AdDisplayContainer → AdsLoader → AdsManager events) — cannot run off-device; also cannot request a real ad until Berk's GAM audio tag exists (`ADS_AUDIO_TAG_URL`). Item 6 (emulator) and Berk's GAM unit.
3. **UMP consent form on a device** — same; the code path is documented-API-exact but unexercised.
4. **`PmpDimens.adBreakSurfaceHeight = 250`** — OWNER-DECISION; the downloaded docs prescribe no minimum for an audio creative container (grep of `docs/external-api/google-ima/` for 300x250: 0 relevant hits).
5. **iOS**: `GADApplicationIdentifier` in Info.plist and the IMA iOS setup are not written (Berk's AdMob id + Apple side pending, same as item 4's Team ID).
6. **Release build**: `ProductionAdIds` empty and `-PadmobAppId` unset → ads disabled by design until Berk supplies ids; verified only by code reading, not by a release build.

## 5. Errors made and corrected this session (rules/25 Art. 5)

| My error | How it was caught | Correction |
|---|---|---|
| `google_mobile_ads: ^6.0.0` written from recollection | pub.dev API → latest 9.1.0 | pinned `^9.1.0`, JSON saved |
| `DELAY_APP_MEASUREMENT_INIT` manifest flag from recollection | grep of downloaded docs → 0 hits | removed |
| "300×250 minimum" comment from recollection | grep → not in docs | rewritten as OWNER-DECISION + UNVERIFIED |
| `AnonIdentity.absorb`, `AdSize.getLargeAnchoredAdaptiveBannerAdSize(Orientation,int)` | analyzer 3 errors | real names read from source: `remember`, `…WithOrientation` |
| ConsentGate entered on the widget-test host → `MissingPluginException` (7 pre-existing tests broke) | `flutter test` | `sdkHostSupported` = dart:io `Platform.isAndroid||isIOS` (flutter_test reports `defaultTargetPlatform == android` on Windows, measured) |
| my tests posted 0 events | test output | `SharedPreferences.setMockInitialValues` (AnonIdentity reads prefs) |

## 6. Debug APK build

Log: `.claude/memory/lane-tasks/apk-debug-build-2026-09-04.log` — result appended below once the build finishes.

Result (2026-09-04 20:47 local): run 1 FAILED Failed to find target with hash string 'android-37' (flutter_secure_storage 11.0.0 compileSdk=37; Google ships API 37 only as platforms;android-37.0/37.1/37.2 — sdkmanager --list); run 2 FAILED It is too late to set compileSdk (afterEvaluate); run 3 FAILED checkDebugAarMetadata … requires 37 (app on 36); **run 4 exit 0 — √ Built build\app\outputs\flutter-apk\app-debug.apk, 169,390,049 B**. Fixes: root ndroid/build.gradle.kts ndroidComponents.finalizeDsl { compileSdkMinor = 0 } for library modules on major 37; app compileSdk = 37; compileSdkMinor = 0. Logs: .claude/memory/lane-tasks/apk-debug-build-2026-09-04*.log.

## 7. Emulator (item 6, non-billed part) — Medium_Phone_API_36.1, emulator-5554, 1080×2400

| Step | Evidence |
|---|---|
| Install + launch | db install -r Success; first process killed by the system during a WebView package update (Killing 3883 … stop com.google.android.webview due to installPackageLI — not our code); relaunch pid 6181 stable |
| UMP consent flow ran on device | logcat pid 6181: UserMessagingPlatform: Use new ConsentDebugSettings.Builder().addTestDeviceHashedId("B3EEABB8EE11C2BE770B684D95219ECB") + stored-info probes |
| Google Mobile Ads SDK initialised | I Ads : JS: The jsLoaded GMSG has been sent (…/mads/static/sdk/native/sdk-core-v40.html:1086) |
| BannerSlot requested and rendered a real Google TEST banner | I Ads : This request is sent from a test device. ×2; screenshot 2026-09-04-emulator-musics-tail.png shows "Test Ad — You've loaded a test ad from AdMob. Way to go!" under the Musics list |
| App talks to production | Library header "ENGINE LIVE" (2026-09-04-emulator-library.png); Musics list populated from /api/musics (-musics.png) |
| Screens | 2026-09-04-emulator-home.png, -library.png, -musics.png, -musics-tail.png, -add-to-playlist.png |

**NOT done on device (needs Berk):** the IMA ad-break boundary (PlaybackController._onEnded) fires only for tracks in the listening queue, which are produced by paid Lyria generation — a real production generation + playlist run was NOT executed because it spends money and the task list marks it "faturalı, ayrı onay". The catalogue "Add to playlist" is the server-side social playlist, not the listening queue, so it does not reach the boundary. Rewarded ad: no caller (see §4.1).
