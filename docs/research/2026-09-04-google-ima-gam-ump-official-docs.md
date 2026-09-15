# Standards ledger

Bound by Berk's global contract; read from disk this session before any external action: `C:\Users\berke\.claude\CLAUDE.md` (first 400 lines of 1305), `C:\Users\berke\.claude\rules\00-berk-constitution.md`, `C:\Users\berke\.claude\rules\23-external-api-integrations-law.md`, `C:\Users\berke\.claude\rules\24-no-harm-and-frontier-mandate.md`, `C:\Users\berke\.claude\rules\25-no-deception-and-anti-fraud-law.md`, `C:\Users\berke\.claude\rules\13-multiagent-write-safety.md`. Law Zero applies: every statement below is either read from a downloaded file in this session or labelled [UNVERIFIED].

# Google IMA SDK, Ad Manager audio ads, and UMP — official documentation download and API-surface digest (2026-09-04)

## 1. Purpose and decision served

Berk decided on 2026-09-04: "google en iyi çözüm sesli reklamlar için". Audio ads between tracks in PlayMusicPrompts playlist mode are to be served through Google Ad Manager (audio ad unit) + Google IMA SDK, with a consent gate (UMP on mobile, TCF/CMP on web) and AdMob banner/rewarded as a side item. The EXTERNAL API INTEGRATIONS LAW requires the platform's official documentation to be downloaded into the project and documented BEFORE any integration code. This note is the step-1 record; the register and the identifier digest live in `docs/external-api/google-ima/README.md`.

## 2. What was downloaded (measured)

- 62 files under `c:\Berk\PlayMusicPrompts\docs\external-api\google-ima\`, all fetched with HTTP 200 on 2026-09-04 via `curl.exe -L` with a browser User-Agent; byte sizes and SHA-256 prefixes recorded per file in the README register.
- Sources: developers.google.com (IMA HTML5 guides + 10 reference pages; AdMob Flutter UMP/banner/rewarded/test-ads/quick-start), `imasdk.googleapis.com/js/sdkloader/ima3.js`, pub.dev API JSON + dartdoc for `interactive_media_ads`, pub.dev API JSON for `google_mobile_ads`, GitHub raw README/CHANGELOG/pubspec/example for both packages, support.google.com/admanager (14 pages), support.google.com/publisherpolicies (4 pages), support.google.com/adspolicy (1 page).
- Failed fetches recorded: 3 GitHub raw URLs at a guessed doubled path (HTTP 404, corrected and re-fetched from the pub.dev `repository` field) and `…/reference/js/google.ima.AdEvent.Type` (HTTP 404; enum lives inside the `AdEvent` page).

## 3. Findings per scope item (citations are file names in `docs/external-api/google-ima/`)

### 3.1 IMA SDK for HTML5 — audio
- Audio is supported by constructing `google.ima.AdDisplayContainer(adContainer, audioPlayer)` with an `<audio>` element as `videoElement`, hiding the container (`display:none`), and driving playback with `AdsManager.pause()/resume()/setVolume()`; skippable audio needs a custom button using `getAdSkippableState()`, `AdEvent.getAdData()`, `Ad.getSkipTimeOffset()` on `AD_PROGRESS`, and `adsManager.skip()` (`ima-html5-audio.html`).
- Events: `google.ima.AdEvent.Type` = 29 values incl. `LOADED`, `STARTED`, `FIRST_QUARTILE`, `MIDPOINT`, `THIRD_QUARTILE`, `COMPLETE`, `SKIPPED`, `CONTENT_PAUSE_REQUESTED`, `CONTENT_RESUME_REQUESTED`, `ALL_ADS_COMPLETED`, `AD_PROGRESS`, `VOLUME_CHANGED`, `VOLUME_MUTED` (`ima-html5-ref-AdEvent.html`); errors via `google.ima.AdErrorEvent.Type.AD_ERROR` with `AdError.ErrorCode` values (`ima-html5-ref-AdError.html`).
- Autoplay: `AdsRequest.setAdWillAutoPlay`, `setAdWillPlayMuted`; mobile requires user interaction to initialize the container and start the AdsManager (`ima-html5-get-started.html` L90, L1145; `ima-html5-autoplay.html`).
- Consent: TC string consumed automatically from a TCF CMP (release notes 3.351.1, 3.744.0 for TCF v2.3; `gam-tcf-publisher-integration.html` L64); manual flags on the tag URL `&npa=1`, `&tfua=1` (`ima-html5-consent-eu.html`), `&rdp=1`, `gpp=`/`gpp_sid=` (`ima-html5-ccpa-rdp.html`).
- Sample tags: 22 video tags; **no audio sample tag exists** ("audio" count 0 on `ima-html5-sample-tags.html`).
- Newest SDK release row: 3.782.0, 2026-08-06 (`ima-html5-release-notes.html`).

### 3.2 IMA SDK for Flutter (`interactive_media_ads`)
- Latest 0.3.0+17 published 2026-08-28T04:10:30Z; Dart `^3.12.0`, Flutter `>=3.44.0`; Android SDK 24+, iOS 13.0+ (`pubdev-api-interactive_media_ads.json`, `github-interactive_media_ads-README.md`).
- Key question answered by the README, verbatim: "Background Audio ads and Google Dynamic Ad Insertion methods are currently not supported." Ads "play in a separate video player positioned on top of the app's content video player." `AdDisplayContainer` is a `Widget` that must be on screen; "audio" occurs 0 times across the 9 saved dartdoc pages; no `setVolume` on the Dart `AdsManager` page; no consent API in Dart.
- Dart API: `AdsLoader(container:, onAdsLoaded:, onAdsLoadError:)`, `AdsRequest(adTagUrl:, contentProgressProvider:, adWillAutoPlay, adWillPlayMuted, continuousPlayback, contentDuration, contentKeywords, contentTitle, liveStreamPrefetchMaxWaitTime, vastLoadTimeout, adsResponse)`, `AdsManager.init/start/pause/resume/skip/discardAdBreak/destroy/setAdsManagerDelegate`, `AdEventType` (31 values), `CompanionAdSlot(size:, onClicked:)`, `ImaSettings(ppid, language, maxRedirects, featureFlags, autoPlayAdBreaks, playerType, playerVersion, sessionID)`.

### 3.3 Google Ad Manager — audio
- Ad unit: select "Audio" as VAST Master size; companion sizes on the same unit (`gam-create-configure-ad-unit.html`).
- Tag: `ad_type=audio` (or `audio_video`), `env=instream`, `vpmute=0`; `ad_type` unset ⇒ "no audio ads to be returned"; `aconp` for continuous audio play; `ciu_szs` for companions; `output=vast|xml_vast4`; `npa`, `rdp`, `ltd`, `gdpr`, `gdpr_consent` for privacy (`gam-audio-get-started.html`, `gam-vast-ad-tag-parameters.html`).
- Creative formats: MP4/AAC and MP3 at 320/128/64 kbps targets; uploads up to 1.9 GB or 20 minutes; minimum 0.3 seconds (`gam-video-audio-formats-transcoding.html`, `gam-traffic-video-audio-creative.html`).
- Companions: up to 6 per VAST creative; sizes come from `ciu_szs` examples (728x90, 300x250, 300x200); 320x50 not stated in the downloaded audio docs (`gam-companion-ads-video-audio.html`).
- Tag generator: Inventory → Ad units → Tags → "Google Publisher Tag for Video and Audio" (`gam-generate-video-audio-ad-tags.html`).
- Account types: "Ad Manager account" (paid only after an impression threshold) vs "Ad Manager 360 account"; the phrase "Small Business" is absent from the downloaded pages; per-network audio feature enablement is [UNVERIFIED] until checked in the account UI (`gam-advertising-with-ad-manager-account-types.html`, `gam-traffic-video-audio-creative.html`).

### 3.4 UMP + AdMob (Flutter) and web CMP
- `google_mobile_ads` 9.1.0 published 2026-08-11T21:00:29Z; UMP Android 4.0.0 / iOS 3.1.0; `setConsentSyncId()` on `ConsentRequestParameters` (`pubdev-api-google_mobile_ads.json`, `github-google_mobile_ads-CHANGELOG.md`).
- UMP flow: `ConsentInformation.instance.requestConsentInfoUpdate(params, …)` → `ConsentForm.loadAndShowConsentFormIfRequired(…)` → `canRequestAds()`; `getPrivacyOptionsRequirementStatus()` / `showPrivacyOptionsForm`; `ConsentDebugSettings(testIdentifiers:, debugGeography: DebugGeography.debugGeographyEea)` (`admob-flutter-privacy-ump.html`).
- Test ad unit IDs quoted from the official pages: banner Android `ca-app-pub-3940256099942544/9214589741`, iOS `ca-app-pub-3940256099942544/2435281174` (`admob-flutter-banner.html`); banner sample in test-ads code Android `…/6300978111`, iOS `…/2934735716` (`admob-flutter-test-ads.html`); rewarded Android `…/5224354917`, iOS `…/1712485313` (`admob-flutter-rewarded.html`).
- Web: Google's "Privacy & messaging" CMP is inside the Ad Manager/AdMob/AdSense account (account required); a Google-certified TCF CMP is required for personalized ads in EEA/UK/CH; TCF v2.3 mandatory since 2026-03-01; IMA SDK reads the TC string from the CMP automatically; vendor ID 755 must be disclosed (`gam-about-privacy-and-messaging.html`, `gam-consent-management-requirements-eea.html`, `gam-tcf-publisher-integration.html`, `gam-tcf-troubleshooting.html`, `gam-limited-ads.html`).

### 3.5 Policy
- Publisher restrictions: audio ads must not be requested/served in muted in-stream placements; declare `vpmute` and `plcmt` accurately (`publisherpolicies-google-publisher-restrictions.html`, `publisherpolicies-video-inventory-restrictions.html`).
- AI-generated content: the only publisher-policy text found is "Automatically generated content without manual review or curation" under replicated content (`publisherpolicies-replicated-content.html` L52); the July 2026 AI-labeling page is advertiser-side and covers image/video creatives ("audio" count 0) (`adspolicy-ai-labeling-requirements-july-2026.html`). No Google publisher policy specific to AI-generated music was found in the downloaded set (absence measured on these pages only).

## 4. Implications for the implementer (facts, not decisions)
- Web (Next.js): the HTML5 audio pattern is fully documented; the ad tag must carry `ad_type=audio&env=instream&vpmute=0` plus `ciu_szs` if companions are used; consent arrives via TCF CMP automatically or via `npa`/`rdp`/`tfua` flags.
- Flutter app: the official plugin documents no audio-only path and excludes background audio ads; a decision on whether to render ads into an on-screen `AdDisplayContainer` or to bridge the native Android `createAudioAdDisplayContainer` (documentation NOT yet downloaded) belongs to Berk — this note records the gap and does not resolve it.
- Open verification: the law's VERIFICATION clause (one real success + one real failure ad request) was not performed in this session because no Ad Manager network/ad unit for this project was available; it stays OPEN.

## 5. Artifacts
- `c:\Berk\PlayMusicPrompts\docs\external-api\google-ima\README.md` — register (62 rows) + digest (a)–(d).
- `c:\Berk\PlayMusicPrompts\docs\external-api\google-ima\*` — 62 raw documents.
- This note.
