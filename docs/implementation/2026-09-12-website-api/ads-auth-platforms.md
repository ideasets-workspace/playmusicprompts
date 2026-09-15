# Standards ledger

Status: bounded findings recorded, product and release dependencies open, 2026-09-12. This document is the assigned slice artifact; no ad account, publisher settings, accepted frontend trees, production infrastructure or credentials may be changed. Current user scope, conveyed by the parent, replaces the earlier reward-for-extra-generation assumption: guest listening/generation, signed-in playlists, signed-in rewarded file download, server-owned audio delivery/radio, Google audio between tracks and an unobtrusive banner; web first, with phone/tablet iOS/Android and Samsung/LG TV clients later.

Read this turn: `.cursor/rules/00-berk-rank0-law.mdc`, `.cursor/rules/09-deep-research-covenant.mdc`, lane CURRENT/ledger and brief, prior frontend source audit, relevant sections of the September 3 ads/auth synthesis and E/G reports/registers, September 4 official IMA/GAM/UMP digest, and September 5 consent report. The Codex global deep-research skill path is absent; the installed Claude copy was read, with identical-sized Cursor copy found. This is a primary-only Google/platform contract slice; it must not be represented as a new completed 20-independent-source/5-academic research effort. Prior report source counts are not this session's evidence.

## Scope and preflight

Decision: determine what can honestly be implemented now and which external publisher/identity/platform dependencies remain before any ad-gated export promise is made. Why: a forged or policy-ineligible reward must not become a download entitlement, and a desktop browser proof must not be reported as TV/mobile support.

Atomic questions: A1 reward policy for downloadable music and portable commercial files; A2 GPT web reward events versus cryptographically verifiable server callbacks; A3 AdMob native server-side verification; A4 Google IMA audio request, user gesture, audibility, ad-break and account enablement; A5 consent/banner/account dependencies; A6 web/Android/iOS/Samsung/LG capability and fallback boundaries. Each remains open until its official primary is read. Falsifiers: explicit Google policy permission for portable music export; a documented signed GPT server callback; explicit IMA support for the named TV surface/version; current account evidence of audio demand enablement.

Universe: current Google Publisher Policies, GAM/GPT, AdMob/UMP/IMA reference/support tables, Google-owned SDK repositories; Samsung/LG official platform documentation where needed. Global scope, English product, English artifact. Existing research is provenance and discovery, not current fact. No revenue forecast, no ad registration/configuration, no deployment and no simulated ad success. One assigned document is planned; query/source/claim/contradiction records are maintained here within write ownership.

Preflight local conclusion: the accepted frontend has no configured service/account adapters (`website_html_templates_beyond/config.js:3–6`); historical research explicitly used a different reward and did not verify the project's publisher account. These gaps led to broad external discovery followed by actual official-page reading below. Integration and actual-device/ad verification are parent follow-on work.

## Decision brief — 2026-09-12

The latest instruction leaves AWS versus Google Cloud undecided. Nothing below selects a hosting, storage, identity or CDN vendor. Google advertising is a separate integration decision from where PlayMusicPrompts runs. This slice establishes published requirements; it does not establish publisher account approval, policy approval for this product, ad fill, implementation, or device compatibility.

1. **Google audio ads between songs have an official integration path.** Use IMA for actual audio ad playback and GAM for inventory/demand; support depends on the client and account. A website music player and an enabled, monetizing publisher account are different prerequisites. [Audio inventory][S06], [IMA audio-only guide][S09]
2. **Ordinary downloadable MP3/WAV as the rewarded benefit is not established as eligible.** Google requires in-platform use and non-transferability, without explicitly classifying music exports. Inference: portable outside-use/sharing conflicts with those conditions; login alone does not resolve it. Obtain a written Google classification of the exact file/licence benefit before offering it. Do not replace Berk's download requirement with generation credit. [Reward policy][S01]
3. **GPT rewarded web has no server-side verification.** Google states this explicitly. A client `rewardedSlotGranted` event can drive the documented UX; it is not a Google-signed server proof. A nonce, login, CSRF protection, elapsed timer and rate limit can reduce abuse, but cannot prove that an adversarial browser watched an ad. Do not implement an endpoint that trusts `{watched: true}` and describe it as verified completion. [GAM rewarded web][S02]
4. **AdMob native verification is different.** A signed callback authenticates native reward evidence; it changes neither reward policy nor GPT's capabilities. [AdMob SSV][S04]
5. **Universal product, platform-specific playback and advertising.** Shared identities, library, tracks, playlists and entitlements are appropriate; one desktop HTML page does not establish Samsung/LG, background mobile audio, or TV ad support. [IMA compatibility][S08], [Additional platforms][S05]

## A1–A3 — reward contract and server boundary

The product requirements remain: guests can listen and generate; playlists require sign-in; file download requires sign-in plus a qualifying rewarded ad. Server-owned radio/media delivery is independent. The previous synthesis's extra-generation reward is superseded. An account-bound, in-platform benefit is materially different from a portable export; neither its legal classification nor Google's approval can be inferred from it being free or non-cash.

Reward opt-in must disclose the actual action and benefit before each ad; decline/dismiss must preserve ordinary use, and the promised reward must be delivered after the qualifying action. Avoid donation-style pressure and claims that Google endorses the reward. In this product, declining a download reward should leave guest listening/generation available. [Reward implementation requirements][S01]

| Surface | Authoritative completion signal | Server trust | Required UX |
| --- | --- | --- | --- |
| Desktop/mobile/tablet web | GPT `rewardedSlotGranted` | Client report; Google explicitly provides no web SSV | `rewardedSlotReady` precedes the offer; close and video-complete are not grant signals. Video and display demand are both possible. [S02][S02] |
| Eligible web page | GPT format support check | No grant when slot creation returns `null` | Mobile-optimized, neutral zoom page; this does not mean mobile-only. Unsupported/no-fill is an actual unavailable state. [S03][S03] |
| Native AdMob application | Signed SSV callback | Verify Google's signature and application binding | Show pending until verified when reward validity is critical. [S04][S04] |
| Samsung/LG TV | No universal reward flow established by this slice | Do not assume GPT or AdMob mobile SSV applies | Preserve the requirement as a separate certified target; do not expose a pretend reward success. [S05][S05] |

Recommended server design, explicitly an implementation proposal: create a reward attempt bound to the signed-in user, track, exact benefit and nonce; record its provider/surface and evidence class. Validate authentic provider callbacks where available, then atomically issue one durable entitlement. For native SSV, validate the unchanged signed query before application decoding, check the expected ad unit and user/custom-data binding, and deduplicate `transaction_id`. Keep callback handling durable and quick. Google documents rotating keys (cache no longer than 24 hours) and only five retry attempts at one-second intervals for an unreachable/non-200 endpoint. A localhost server is not a reachable production callback. [SSV verification and FAQ][S04]

For web, the absence of SSV is a real product/security decision, not an implementation defect that server code can eliminate. A deliberately accepted client-attested reward would still need policy eligibility, abuse controls and honest wording; it must not be called cryptographically verified. Until those two issues are resolved, do not enable the promised ad-gated file export. Continue the independently authorized generation, storage, streaming and sign-in/playlist work. No simulation of a granted reward is a substitute for a production acceptance test.

## A4 — actual audio ad integration

GAM audio inventory requires Audio VAST sizing, audio creatives/eligible demand, and appropriate line items. Audio tags require `ad_type=audio` (or `audio_video` for an actual mixed format), `env=instream` and truthful `vpmute=0`. AdSense/Ad Exchange demand involves a linked account; Programmatic Direct requires a mapped Ad Exchange account. These documents do not prove this project's account is enabled, or that every Google audio route is GAM 360-only. [GAM audio setup][S06]

For the web radio, IMA accepts the content `<audio>` element and still requires its own ad display container. The audio-only guide hides that container and uses SDK-controlled pause/resume/volume plus an accessible skip button governed by IMA's current skippable state. Use actual audio creative demand; hiding an ordinary video advertisement is not the audio-only integration described by Google. [Audio-only controls][S09]

Initialize IMA directly inside the initial user click/tap. Do not defer that initialization to a later asynchronous media event and assume it retains user activation. Preserve the SDK iframe/container through page navigation. In the accepted main-page architecture, the persistent player/ad host belongs outside the replaceable `#main` content; the standalone Three.js page needs its own lifecycle or an explicit shared playback owner. [AdDisplayContainer][S10], [Framework compatibility][S08]

Proposed runtime acceptance: an eligible between-track break pauses content once, requests/plays a real ad, exposes ad-specific status and permitted controls, and resumes the correct next track exactly once on completion or recoverable ad error/no-fill. A content track ending, a UI timer, an ad request, or a loading animation is not an impression/completion. Track pending content, ad, error and user-paused states separately; never overlap music and the ad. Persist listening position without replaying a completed ad on navigation. Frequency is an explicit product/configuration choice still to be settled, not a made-up Google requirement.

Do not promise gapless ad transitions across all devices: HTML5 IMA media preloading is unavailable on mobile web iOS and connected smart TVs, and preload is not offline ad serving. [IMA preload limitations][S11]

Server-owned radio can return a sequenced content session while the supported client performs IMA ad breaks. That is not Google DAI. Google describes DAI as server-combined ad/content video and requires Ad Manager 360 Advanced. Its existence is not proof of an audio-only DAI contract for this product, nor permission to proxy/rewrite Google ad creatives. Start from the documented client-side audio path; investigate DAI separately only if the final broadcast requirement demands it. [IMA integration modes][S14]

## A5 — banner and consent

Reserve a stable, responsive ad area using CSS so a late creative does not move the prompt or player controls. A small banner should occupy a dedicated region, not cover the artwork, waveform, 3D drag surface, seek bar, play/next controls or remote focus target. Google AdMob specifically warns against placing banners near interactive controls and continuously interactive screens; use that mobile guidance and separately validate the web placement. [GPT layout stability][S26], [AdMob banner guidance][S24]

A free-floating generic cookie checkbox is not the ad consent integration. Google's publisher requirements call for a certified TCF CMP for personalized advertising in EEA/UK/Switzerland. The page distinguishes personalized, non-personalized and limited eligibility; do not claim that rejecting personalization automatically makes ordinary non-personalized ads permissible, or that non-certified traffic can never receive any ad. Certification also does not certify compliance with every privacy law. [Publisher CMP requirements][S17]

TCF strings generated on/after 2026-03-01 must be v2.3; do not ship the older research's v2.2 label as the current target. GPT/IMA consume CMP consent signals. Google's TCF table says ordinary non-personalized ads still require the applicable device-storage consent; limited ads are a separate case. [Google TCF integration][S16]

Native Flutter uses UMP with account-configured privacy messages: refresh consent information each launch, show required forms, respect the privacy-options entry point and use `canRequestAds()` rather than a home-grown cached boolean. Guard initialization to prevent duplicate ad requests. [UMP setup][S15]

Implementation dependency: publisher/domain/app IDs, actual inventory, approved demand, privacy policy/data inventory, CMP vendor/message configuration and target-region behavior must be established. The historical country table is not a verified global legal permission to default all other countries to tracking. The CTV CMP help page contains old enforcement-date text; do not extrapolate a 2026 TV exemption from it. Production consent and ads remain externally unverified.

## A6 — platform map

| Target | Evidence and actual boundary | Proposed implementation/verification |
| --- | --- | --- |
| Desktop web and mobile/tablet browsers | IMA lists desktop Chrome/Firefox/Safari/Edge/Opera and Android/iOS browsers; audio appears in its feature table. [S08][S08] | Web IMA audio + GPT banner/reward adapters, consent and user activation; verify real browsers, memory limits, focus and interruption recovery. |
| Native Android phone/tablet | Official IMA guide provides an audio `Service` and `createAudioAdDisplayContainer`. [S19][S19] | Native media/ad adapter, foreground/background lifecycle and supported OS permission checks; AdMob reward + verified server entitlement if policy permits. |
| Native iOS phone/tablet | Official IMA guide requires background audio mode, suitable `AVAudioSession`, `enableBackgroundPlayback`, and handling background pause/resume. [S13][S13] | Native adapter and real lock-screen/interruption tests. A working Safari tab does not establish native background behavior. |
| Flutter mobile shell | Retrieved official package README says background audio ads and DAI are unsupported; the September 4 repo snapshot agrees. The web tool labels this README crawl three months old, so it is not proof of the latest release. [S20][S20] | Recheck the pinned package source before selection. Plan a native audio bridge if this limitation remains; do not claim the stock plugin covers the radio requirement. |
| Samsung Tizen / LG webOS TV | Google's additional-platform page directs Samsung/LG publishers to an account manager and explicitly says the examples do not imply official IMA support. [S05][S05] | Separate TV adapter and real model/year tests; confirm Google inventory/support and consent UX first. Remote navigation, codec/media delivery and 3D quality tiers require a separate device audit. |

Architecture proposal: share the provider-independent API contract for account/session, anonymous generation, library/track identity, playlist ownership, playback sessions and download entitlements. Keep media, advertising, consent and rendering adapters per surface. Each capability is explicit (`audioAds`, `rewardEvidence`, `backgroundAudio`, `downloads`, `visualTier`); an unsupported feature has an honest UI state and does not fabricate success. Storage/CDN and identity implementations remain replaceable pending the AWS/GCP decision.

Server-owned files need stable internal asset identity and access checks for both stream and download. Keep original storage credentials and long-lived master URLs server-side; issue narrowly scoped delivery access. Technical limitation: playable audio bytes can be captured by the listener, so an authenticated download endpoint controls the official export benefit, not absolute prevention of copying streamed music. Do not sell a hidden button as copy protection.

## Requirement and release-evidence ledger

| Item | Current disposition | Evidence needed to close implementation |
| --- | --- | --- |
| Guest listening/generation | User requirement preserved; no ad/account dependency should silently gate it | Real API generation → durable server asset → guest playback, limits and recovery |
| Server-owned radio/media | Vendor independent, design proposed | Actual server storage/delivery, range/seek behavior, correct next-track session, expiry/restart recovery |
| Signed-in playlist | Must be enforced by server ownership, not a localStorage flag | Real login/session, unauthorized rejection, durable playlist and cross-client retrieval |
| Signed-in rewarded file download | OPEN: portable reward classification and web authenticity gap | Written product-specific Google classification; chosen evidence/fraud model; actual ad integration and atomic entitlement/download proof |
| Google between-track audio | Official path found; account unverified | Publisher inventory/demand readiness, consent, SDK integration, real ad and no-fill/error behavior |
| Unobtrusive banner | Layout recommendation grounded; not rendered in this slice | Approved inventory, real creative and empty-state layout, keyboard/touch/remote separation |
| Consent | Current Google requirements refreshed; global product/legal configuration open | Actual CMP/UMP configuration and target-region evidence; rejection/withdrawal/relaunch behavior |
| All named platforms | Shared contract proposed; target support not demonstrated | Native and TV adapter proof on named devices/models; actual policy/account support and performance/accessibility acceptance |
| AWS or GCP | Undecided per latest user correction | Parent's comparable architecture/cost/security evidence and owner decision |

## Source, query and contradiction ledger

All linked sources below were opened through web tools on 2026-09-12 and relevant operative sections read. Google pages form one issuing-authority family, not many independent confirmations. Access date is not a claim of current publisher account state. No community monetization article is used as policy authority. Dates shown inside SDK pages vary; claims use the actual operative text rather than generated page summaries.

| ID | Primary and locator used | Claim supported / boundary |
| --- | --- | --- |
| S01 | [Reward policy][S01], Rewards requirements and Implementation requirements | Benefit restrictions, opt-in and reward delivery; no explicit music-export ruling |
| S02 | [GAM rewarded web][S02], Requirements, setup, events | Desktop/mobile/tablet; **explicit no web SSV**; grant event distinction |
| S03 | [GPT rewarded sample][S03], Usage notes | Null unsupported slot; mobile-optimized page; embedded demo was not executed |
| S04 | [AdMob SSV][S04], validation/custom data/FAQ | Signature, exact query, rotation, callback delays/retries; live callback not tested |
| S05 | [IMA additional platforms][S05], compatibility table/disclaimer | Samsung/LG account-manager dependency; no universal support claim |
| S06 | [GAM audio setup][S06], Inventory/Trafficking | Audio tag parameters, inventory and linked-demand prerequisites |
| S08 | [IMA compatibility][S08], frameworks/platform/feature tables | Audio surfaces and DOM preservation; table is not device QA |
| S09 | [HTML5 audio-only][S09], full operative guide | Audio element, hidden container, SDK controls and skip handling |
| S10 | [AdDisplayContainer][S10], initialize/lifecycle | Direct user gesture and preserved SDK iframe |
| S11 | [IMA preload][S11], Limitations/FAQ | iOS web/CTV restriction and no offline ads |
| S13 | [iOS background audio][S13], setup/Important | Native session and background lifecycle |
| S14 | [IMA overview][S14], client-side versus DAI | DAI 360 Advanced requirement; SDK access is not demand enablement |
| S15 | [Flutter UMP][S15], update/form/options/canRequestAds | Native consent flow and stale-cache caution |
| S16 | [Google TCF][S16], timeline/general/requirements | v2.3 new-string deadline, CMP signals and NPA distinction |
| S17 | [Publisher CMP requirements][S17], requirements/eligibility | Regions and limited-certification meaning; old CTV extension not treated as current |
| S19 | [Android background audio][S19], service/container | Native audio ad route; app/runtime not built here |
| S20 | [Flutter package README][S20], support/NOTE | Plugin limitation; old indexed crawl plus September 4 snapshot, current release unresolved |
| S24 | [AdMob banner guidance][S24], placement paragraphs | Mobile accidental-click avoidance |
| S26 | [GPT layout shift][S26], reserve-space guidance | Web reserved responsive layout |

Discovery queries were broad before directed verification. Q1: `site:support.google.com rewarded ads rewards downloadable content non transferable within publisher platform`; `site:developers.google.com publisher tag rewarded ads server side verification web`; `site:developers.google.com interactive media ads HTML5 audio supported platforms Samsung LG`. Q2: `site:developers.google.com interactive media ads HTML5 audio adDisplayContainer audio autoplay`; `site:support.google.com admanager get started audio ads enabled Ad Exchange account manager`; `site:developers.google.com interactive media ads support compatibility browsers connected TV background audio`. Q3: `site:developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/audio "audioPlayer"`; `site:support.google.com admanager consent management requirements EEA UK Switzerland all ads CMP 2026`; `site:developers.google.com/admob/flutter/privacy canRequestAds requestConsentInfoUpdate`; `site:github.com/flutter/packages interactive_media_ads Background Audio ads currently not supported`. Q4: `site:github.com "interactive_media_ads" "Background Audio"`; `site:support.google.com/admob banner ads adjacent interactive elements placement`; `site:developers.google.com/publisher-tag banner sizes responsive layout shift`.

Contradictions and exclusions: old extra-generation reward does not answer the revised download request; a stock Flutter plugin is not equivalent to native IMA audio support; the generic support table's older native minimums are not used as current package requirements; the historical all-audio-requires-360 assertion is not established by the current setup guide; current DAI has an explicit separate 360 Advanced dependency. An attempted open of GAM `answer/1734048` returned an internal retrieval error and is not used as a read source. Third-party monetization interpretations were excluded. No revenue, fill rate, country-law completeness, account permission or device performance is estimated.

### Standards closeout

A1 policy terms, A2 web trust boundary, A3 native SSV mechanism, A4 audio integration, A5 Google consent/banner requirements and A6 published platform boundaries were individually checked against the sources above. Product-specific eligibility, account configuration, current Flutter release, universal privacy law and real runtime/device behavior remain open as shown in the ledger. This document is research, not delivered advertising functionality.

⚠️ UNVERIFIED RELAY — DO NOT CITE

The installed research covenant's complete-run floor (20 independent authoritative sources and 5 academic sources) is not met by this bounded official-platform contract slice. Do not represent it as a completed new full research dossier. The parent should independently reopen the decisive primary pages before relying on the relay; cite those primary pages, not this document as an independent authority. The warning does not convert the unresolved product-specific policy judgment into a verified prohibition or permission.

[S01]: https://support.google.com/admanager/answer/7496282?hl=en
[S02]: https://support.google.com/admanager/answer/9116812?hl=en
[S03]: https://developers.google.com/publisher-tag/samples/display-rewarded-ad
[S04]: https://developers.google.com/admob/android/ssv
[S05]: https://developers.google.com/interactive-media-ads/docs/sdks/other
[S06]: https://support.google.com/admanager/answer/7642796?hl=en
[S08]: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/compatibility
[S09]: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/audio
[S10]: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/class/google.ima.AdDisplayContainer
[S11]: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/preload
[S13]: https://developers.google.com/interactive-media-ads/docs/sdks/ios/client-side/background_ad_playback
[S14]: https://developers.google.com/interactive-media-ads
[S15]: https://developers.google.com/admob/flutter/privacy
[S16]: https://support.google.com/admanager/answer/9805023?hl=en
[S17]: https://support.google.com/adsense/answer/13554116?hl=en-GB
[S19]: https://developers.google.com/interactive-media-ads/docs/sdks/android/client-side/background-ad-playback
[S20]: https://raw.githubusercontent.com/flutter/packages/main/packages/interactive_media_ads/README.md
[S24]: https://support.google.com/admob/answer/6128877?hl=en
[S26]: https://developers.google.com/publisher-tag/guides/minimize-layout-shift
