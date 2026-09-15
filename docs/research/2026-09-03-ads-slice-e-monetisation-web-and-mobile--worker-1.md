# Standards ledger

| Governing standard | How this slice implements it | Evidence / status |
| --- | --- | --- |
| Deep-research covenant `C:\Users\berke\.claude\skills\deep-research\SKILL.md`, COVENANT_SHA256 `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB` (re-hashed this session, 117,893 bytes, 929 lines) | Part I, R0–R13, R15, R17 read this session; search-first (R4.1) obeyed: first external action was three broad scoping searches; no URL guessed — three dead locators recorded as FAILED, never varied | COVENANT ACKNOWLEDGED: yes |
| Law Zero (R1.1) | Every number below carries a source ID from the register; nothing quoted from recollection; read status `[FULL]` / `[PARTIAL]` / `[ABS]` per source | see `# Sources` and the companion register file |
| No-narrowing (R1.2, rules/10) | All 8 numbered SLICE-E items answered in `# Findings by subquestion`; where a sub-item could not be evidenced it is reported as a gap, not dropped | 8/8 items present; gaps enumerated in `# Contradictions … gaps` |
| Owner constraints: no new paid vendor / revenue-share vendor without Berk's approval; no synthetic data | Every non-Google vendor (Mediavine Journey 70 % rev-share, Raptive 75 %, Ezoic, Audiomob, Odeeo, AdsWizz, Triton) is FLAGGED FOR APPROVAL in `# Recommendation`; the break-even model uses only the measured $0.08/take and clearly labelled secondary eCPM inputs | flags in §8 |
| Licence-lawfulness | `google_mobile_ads` plugin licence Apache-2.0 (S17); no code copied from sources; only short quotations | S17 |
| Project research path convention `docs/research/YYYY-MM-DD-<topic>.md` | This file + `2026-09-03-ads-slice-e-source-register.md`; no other file touched | 2 files written |
| Slice floor (SLICE-E): ≥12 authoritative `[FULL]`, ≥1 academic `[FULL]` | 23 authoritative primaries `[FULL]`, 1 academic primary `[FULL]` (S25) — counts in `# Source register summary` | floor met; run-level 5-academic floor is the parent's duty (this slice contributes 1) |
| Execution limit (CONTEXT-17: saturation or 45 min) | Stopped at the 45-minute wall-time limit; saturation NOT reached for item 3's non-Google networks — stated in `# Contradictions … gaps` | honest status: **NOT EXHAUSTIVE** |

# Decision served and slice scope

**Decision served (from SLICE-E.md, verbatim):** "Which ad networks/mediation and which formats to integrate for (a) the web player page and (b) the Flutter apps, under what eligibility/policy conditions (AI-generated music site, login-free, GDPR/KVKK consent already in place), with expected revenue ranges from primary sources, and the exact integration path (SDKs, packages, consent requirements, app-ads.txt/ads.txt, review timelines)."

**Berk's order (SLICE-E.md, Turkish, verbatim):** "playmusicprompts u hep kullanıcılar için free ama reklamlı yapmak istiyorum. bu kapsamda google dan nasıl reklam çekebliriz veya vereden reklam çekebiliriz. hem web hem de mobil/tablet appler için." Approved 2026-09-03 ("başla").

**Local state read this session (rules/17, filesystem):** `deploy/payload/next.config.ts` — homepage is `public/site/index.html` served by a `beforeFiles` rewrite of `/`; there is **no `headers()` block, therefore no Content-Security-Policy header is currently emitted by Next.js** (measured: the file contains only `rewrites()` and `redirects()`). `public/site/index.html` lines 373–375 load `/site/analytics.js`, `https://www.googletagmanager.com/gtag/js?id=G-JHCLCF9L0B` and `/site/consent.js`. `consent.js` is a two-button custom banner (Accept analytics / Reject analytics) wired to Consent Mode v2 — it is **not** an IAB TCF consent management platform and emits no TC string. `app/pubspec.yaml` dependencies: `http ^1.6.0`, `just_audio ^0.10.6`, `shared_preferences ^2.5.5`; **no ads dependency exists today**; Dart SDK `^3.12.0`. Grep of the repository (excluding `node_modules`) for `adsense|admob|google_mobile_ads|ads.txt` returned hits only in memory/rule files — no prior ads implementation exists.

# Outcome first

1. **Google is the only network the site can join today with zero traffic gate, but the one-prompt player page is at real risk of an AdSense "low value content / screens without publisher-content" refusal** (S01 §"Google-served ads on screens without publisher-content", S02). AdSense's eligibility page names no traffic or word-count minimum (S02), yet the Publisher Policies forbid Google-served ads on "screens without publisher-content or with low-value content" and on screens "used for alerts, navigation or other behavioral purposes" (S01). A login-free page whose only content is a prompt box and a player is exactly that shape. **Committed sequencing:** apply for AdSense only after the pending public `/musics` catalogue (real track pages with prompt text, metadata and playable audio) exists, so the reviewed site has publisher-content pages; keep the player page itself ad-light.
2. **Personalised ads in the EEA/UK/Switzerland require a Google-certified, TCF-integrated CMP since 16 Jan 2024 (EEA/UK) and 31 Jul 2024 (CH)** (S06, S03). The current custom banner does not qualify; without a certified CMP AdSense/AdMob traffic from those regions is "Restricted ad personalization" — non-personalised or limited ads only (S06, S47). **Committed choice:** use Google's own certified CMP ("Google LLC CMP", TCF CMP ID 300, platform "Web and app", S06) delivered via the AdSense/AdMob "Privacy & messaging" tab on web and the UMP SDK in Flutter — no new paid vendor.
3. **Mobile: `google_mobile_ads` 9.1.0 (published 2026-08-12) is the current plugin; Android `minSdk 24`, `compileSdk 36`; Google requires Flutter 3.38.1+; GMA Android SDK 25.4.0, iOS SDK 13.7.0, UMP Android 4.0.0 / iOS 3.1.0** (S17, S18, S19, S20). Our `pubspec.yaml` has no ads dependency yet, so this is a green-field integration.
4. **A rewarded ad "watch to generate one more track" is allowed** under AdMob's rewarded policy if the reward is non-monetary, in-app only, non-transferable, disclosed before each ad, and served only after an explicit opt-in tap; the ad must be skippable and skipping must not impede normal use (S12). It fits our spend guard (12 takes/hour, 40/day) as a *top-up* beyond the free quota, never as a gate on the base experience.
5. **Interstitials must not fire at app load/exit, not more than one per two user actions, only at logical breaks** (S11); Google ads may not run "in apps or web pages that run in the background" (S01 §"Out of context ads"). Therefore **no Google display ad can monetise background listening**; the track boundary while the screen is on is the only lawful Google slot, and audio-native networks are the route for background listening.
6. **The strongest evidence on listener tolerance is the 35-million-listener, 21-month Pandora randomised experiment (S25):** each additional audio ad per hour reduces total listening hours by 2.08 % ± 0.23 % and active days by 1.91 % ± 0.13 %; ~40 % of the loss is listeners leaving entirely; the long-run elasticity is three times the one-month estimate; listeners prefer more, shorter breaks; each extra ad/hour raises paid ad-free subscriptions by 0.14 percentage points. Pandora's control group heard 3.63 ads/hour (Table 3), served **only at track end**. Application: put any audio/interstitial slot at the track boundary (as our buffer algorithm already fires generation at track start), keep total load ≤ ~3–4 ads/hour, prefer 1-ad breaks.
7. **Ads cannot pay for unlimited generation.** With the measured $0.08 per take, one playlist round (3 takes) costs $0.24; a banner refreshing every 60 s for a 10-minute session (~10 impressions) needs an eCPM of **$24** to break even, versus Tier-1 banner eCPMs reported at $0.50–1.50 by secondary aggregators (S44, `[secondary, unverified]`). One rewarded view at $15–30 eCPM (S44/S45, secondary) yields $0.015–0.030, i.e. 19–38 % of one take. **Conclusion (CALCULATION):** ad revenue covers generation only when combined with the catalogue-reuse strategy of slices A–D and a per-visitor free quota; ads are a contribution, not the cost base.
8. **Türkiye payout is supported by AdSense and AdMob in TRY: payment threshold ₺200, payment-method selection ₺20, verification "$10 equivalent"; payments issue on or around the 21st monthly; wire transfers take up to ~10 days; a postal PIN (up to 3 weeks) is required before the first payment** (S05, S14, S15, S16).
9. **Non-Google web networks gate us out for now:** Ezoic requires 250,000 monthly users for new sign-ups since 19 Feb 2026 (Incubator: 20 sites/month) (S30, S31); Raptive requires 25,000 pageviews/month with ≥50 % traffic from US/UK/CA/NZ/AU and a 6-month-old domain (S29); Mediavine "Official" requires $5,000+ annual ad revenue, and "Journey by Mediavine" needs 1,000+ sessions at a 70 % revenue share (S28, `[single-source]` on the 70 %). All are revenue-share vendors — flagged for Berk.
10. **Audio-native publisher networks exist (AdsWizz SDK, Triton Digital SDK/On-Demand API, Audiomob, Odeeo) but every one is contract-gated and none publishes a self-serve minimum or Türkiye payout term** (S38–S42, all `[PARTIAL]`); they belong in a later phase after traffic exists.

# Methodology and query log (exact queries, 2026-09-03, Europe/Istanbul)

Run window 11:44–12:35 (≈51 min wall time incl. covenant read; external research ≈45 min). Tools: web search, web fetch, `curl.exe` for three `developers.google.com` pages that timed out in the fetch tool (converted HTML→text locally; no raw capture kept on disk per CONTEXT-13). No credentials, no paywall bypass.

| # | Query / action | System | Yield → fate |
| --- | --- | --- | --- |
| Q01 | `Google AdSense eligibility requirements 2026 AI-generated content low value content policy` | web search | 5 SEO blogs — all EXCLUDED (CONTEXT-05: undated secondary/blogspam); redirected to official help centre |
| Q02 | `Google AdMob Flutter google_mobile_ads plugin latest version 2026 minimum Android iOS` | web search | pub.dev 9.1.0, GitHub release v9.1.0, build.gradle, quick-start → S17–S20 |
| Q03 | `in-app audio ad networks publisher SDK 2026 Audiomob Odeeo Instreamatic Gadsme AdsWizz music app monetization` | web search | Odeeo, Audiomob, AdsWizz surfaces → S39, S41, S42 (Instreamatic snippet only, Gadsme none) |
| F01 | fetch `support.google.com/adsense/answer/9724` (first attempt) | fetch | timeout → retried without `?hl=en`, success → S02 |
| F02 | fetch `support.google.com/adsense/answer/9335564` | fetch | S01 `[FULL]` |
| F03 | fetch `support.google.com/adsense/answer/1348695` | fetch | S04 `[FULL]` |
| F04 | fetch `google.com/about/company/user-consent-policy/` | fetch | S03 `[FULL]` |
| F05 | fetch `support.google.com/adsense/answer/13554116` | fetch | FAILED ACCESS (timeout) 2026-09-03; replaced by S06 found via Q04 |
| F06 | fetch `support.google.com/adsense/answer/1709871` | fetch | S05 `[FULL]` |
| Q04 | `support.google.com adsense "Google-certified CMP" EEA UK requirement TCF v2.2 January 16 2024 serving ads` | web search | S06, S47 |
| Q05 | `support.google.com/adsense "Low value content" site approval "Getting ready" minimum content requirements help` | web search | only SEO blogs — EXCLUDED; finding recorded: Google publishes no article-count / traffic minimum (S02) |
| Q06 | `support.google.com admanager "Ad Manager" vs AdSense which product is right eligibility small business 360` | web search | S08 (fetched `[FULL]`), S09, S10 |
| F07 | fetch `support.google.com/adsense/answer/13790256` | fetch | S06 `[FULL]` incl. full certified-CMP table |
| F08 | fetch `support.google.com/adsense/answer/12171612` | fetch | S07 `[FULL]` |
| F09 | fetch `support.google.com/admob/answer/6201362` | fetch | S11 `[FULL]` |
| F10 | fetch `support.google.com/admanager/answer/9234653` | fetch | S08 `[FULL]` |
| F11 | fetch `developers.google.com/admob/flutter/privacy` | fetch | timeout ×2 → `curl.exe` success → S21 `[FULL]` |
| F12 | fetch `support.google.com/admob/answer/9363762` | fetch | S13 `[FULL]` |
| F13 | fetch `support.google.com/admob/answer/7009980` | fetch | **404 — FAILED LOCATOR**, not varied (R4.3) |
| F14 | fetch `support.google.com/admob/answer/7261809` | fetch | **404 — FAILED LOCATOR**, not varied |
| Q07 | `support.google.com/admob rewarded ads policy "rewarded" implementation guidance disallowed requirements` | web search | S12 |
| Q08 | `support.google.com/admob payment threshold $100 payment timeline "AdMob" get paid Türkiye wire transfer` | web search | S14, S15, S16 |
| Q09 | `developers.google.com/admob/flutter privacy "User Messaging Platform" ConsentInformation Flutter GDPR ATT` | web search | S21, S24 |
| F15 | fetch `support.google.com/admob/answer/7313578` | fetch | S12 `[FULL]` |
| F16 | fetch `developers.google.com/admob/flutter/banner/anchored-adaptive` | fetch | **404 — FAILED LOCATOR**; real page is `/admob/flutter/banner` → S22 |
| F17 | fetch `developers.google.com/admob/flutter/test-ads` | fetch | S23 `[FULL]` |
| C01 | `curl.exe` → `/admob/flutter/privacy`, `/admob/flutter/quick-start`, `/admob/flutter/banner` | shell | 148,197 / 133,009 / 151,034 bytes HTML → S21, S20, S22 |
| Q10 | `Pandora field experiment advertising load music streaming listening hours churn Huang Reiley Riabov …` | web search | S25 (arXiv 2412.05516, HTML v1 read `[FULL]`), S26, S49 |
| Q11 | `Mediavine requirements 50,000 sessions Raptive 100,000 pageviews Ezoic no minimum traffic requirements official 2026` | web search | S28, S29 leads; stale "no minimum" claims for Ezoic detected |
| Q12 | `AdsWizz AudioMax publisher SDK requirements Triton Digital a2x publisher eligibility minimum streams small music app` | web search | S38, S39, S40 |
| F18 | fetch `betterads.org/standards/` | fetch | S27 `[FULL]` |
| F19 | fetch `help.mediavine.com/what-does-it-take-to-get-approved-by-mediavine` | fetch | S28 `[FULL]` |
| Q13 | `raptive.com "Who is eligible for Raptive" 25,000 pageviews; ezoic.com "requirements" 250,000 monthly users February 2026` | web search | S29 (fetched `[FULL]`), Ezoic contradiction surfaced |
| Q14 | `ezoic.com requirements "250,000" monthly "Incubator" new publishers 2026 official Ezoic requirements page` | web search | S30, S31 — contradiction resolved newest-first (250k since 2026-02-19) |
| Q15 | `AppLovin OR Unity OR ironSource official eCPM benchmark report 2025 2026 rewarded interstitial banner by country Turkey United States Germany` | web search | S43 (tables are images), S44–S46 secondary |
| F20 | fetch `developer.apple.com/app-store/user-privacy-and-data-use/` | fetch | S32 `[FULL]` |
| F21 | fetch `support.google.com/googleplay/android-developer/answer/10787469` | fetch | timeout; search-saved copy exists → S34 `[PARTIAL]` |
| F22 | fetch `support.google.com/googleplay/android-developer/answer/9893335` | fetch | S33 `[FULL]` |
| F23 | fetch `adsense.google.com/start/` | fetch | S48 — calculator renders no numbers server-side |
| F24 | fetch `mevzuat.gov.tr/mevzuat?MevzuatNo=6698…` (KVKK Law 6698) | fetch | **FAILED ACCESS** — page returned only the index shell, no article text |
| Q16 | `Regulation (EU) 2022/2065 Digital Services Act Article 26 "Advertising on online platforms" text eur-lex` | web search | S36 (three mirrors of the article text agree verbatim; EUR-Lex itself not fetched) |
| Q17 | `support.google.com googleplay android-developer "Data safety" … AdMob data disclosure` | web search | S34, S35 |

Discovery-round marginal yield: round 1 (Q01–Q03) 0 usable primaries on AdSense (blogspam) but 4 on AdMob/Flutter; round 2 (F01–F10, Q04–Q06) 9 Google primaries; round 3 (AdMob/Flutter) 8 primaries; round 4 (academic + alternatives) 1 academic FULL + 8 vendor pages; round 5 (legal) 4 primaries, 1 failed. Not run for lack of time: Media.net, Amazon Publisher Services, Unity Ads / AppLovin MAX / Unity LevelPlay / Meta Audience Network / InMobi / Digital Turbine official eligibility & payout pages; Instreamatic and Gadsme developer docs; Spotify free-tier ad-frequency primary; IAB TCF v2.2 policy text; IAB Tech Lab audio spec / OpenRTB 2.6; Google "made for advertising" (MFA) policy page; COPPA statute text. These are listed as gaps, not as absences.

# Universe and coverage ledger

| universe_id | entity / work | why in scope | discovery path | screened | included / excluded | latest checked | evidence IDs | gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U-GOOGLE-WEB | AdSense policies, eligibility, EU consent, CMP list, ads.txt, payments | item 1 | seed + Q04–Q06 | yes | included | 2026-09-03 | S01–S08, S47, S48 | "made for advertising" policy page not read |
| U-GOOGLE-GAM | Ad Manager (Small Business vs 360) | item 1 | Q06 | yes | included | 2026-09-03 | S08–S10 | 360 impression thresholds are per-country and not published on the pages read — `[UNVERIFIED]` |
| U-GOOGLE-APP | AdMob policies, UMP, app-ads.txt, payments, Flutter plugin, formats, test IDs | item 2 | seed + Q02, Q07–Q09 | yes | included | 2026-09-03 | S11–S24 | native / app-open / rewarded-interstitial format pages not opened individually (listed in S20 table) |
| U-ALT-WEB | Mediavine, Raptive, Ezoic | item 3 | Q11, Q13, Q14 | yes | included | 2026-09-03 | S28–S31 | Media.net, Amazon Publisher Services **not swept** |
| U-ALT-APP | Unity Ads, AppLovin MAX, ironSource/LevelPlay, Meta Audience Network, InMobi, Digital Turbine | item 3 | Q15 only (mediation adapter list seen in S20/S21 nav) | partial | **not included — no official page read** | — | S20 nav lists AdMob mediation adapters for AppLovin, InMobi, ironSource, Meta Audience Network, Unity Ads and 14 others | eligibility, minimums, payout, Türkiye terms **all unread** |
| U-AUDIO | AdsWizz, Triton Digital, Audiomob, Odeeo, Instreamatic, Gadsme | items 3–4 | Q03, Q12 | partial | AdsWizz/Triton/Audiomob/Odeeo included `[PARTIAL]`; Instreamatic snippet only; Gadsme none | 2026-09-03 | S38–S42 | no minimums/payout/Türkiye terms published on pages read |
| U-ACADEMIC | Pandora ad-load RCT (Goli/Huang/Reiley/Riabov); Goli/Reiley/Zhang 2024 personalisation | item 4 | Q10 | yes | S25 `[FULL]`; S26 `[PARTIAL]` | 2026-09-03 | S25, S26 | Spotify Research / Deezer Research / other RCTs not swept |
| U-STANDARDS | Better Ads Standards; IAB TCF (via Google page); ads.txt/app-ads.txt spec (via Google pages) | items 1, 6 | seed | yes | S27 `[FULL]`; TCF/ads.txt spec texts themselves **not read** | 2026-09-03 | S06, S07, S13, S27 | IAB primaries unread |
| U-LEGAL | Apple ATT; Play Families; Play Data safety; DSA Art. 26 (+ Art. 19 SME exemption); KVKK 6698; COPPA | item 6 | seed, Q16, Q17, F24 | yes | S32, S33 `[FULL]`; S34–S36 `[PARTIAL]`; KVKK **FAILED ACCESS**; COPPA only via S01 §COPPA and S33 | 2026-09-03 | S32–S36 | KVKK text and COPPA statute unread |
| U-REVENUE | Tenjin/CAS benchmark (first-party data, image tables); secondary aggregators | item 5 | Q15 | yes | S43 `[PARTIAL]`; S44–S46 `[secondary]` | 2026-09-03 | S43–S46 | no first-party eCPM number readable as text; Türkiye eCPM only from S46 (secondary) |

Coverage statement: **NOT exhaustive.** Items 1, 2, 4 (academic), 6 (ATT, Families, DSA) are evidenced from primaries; item 3 is covered for the web tier and audio tier at `[PARTIAL]` depth and **uncovered for the mobile mediation tier**; item 5 rests on a CALCULATION whose eCPM inputs are secondary.

# Source register summary and read-status counts

Full records with URLs, access times, first-200-character quotes and SHA-256 of fetched text (where computable) are in `docs/research/2026-09-03-ads-slice-e-source-register.md`.

| Count | Value | Members |
| --- | --- | --- |
| Independent authoritative sources consulted | 33 provenance families (S01–S49 after de-duplication of mirrors and Google help-centre twins) | see register |
| Authoritative primaries read `[FULL]` | **23** | S01, S02, S03, S04, S05, S06, S07, S08, S11, S12, S13, S18, S19, S20, S21, S22, S23, S27, S28, S29, S32, S33, S36 |
| Academic sources | 2 | S25 (arXiv 2412.05516, v1 Dec 2024), S26 (Goli, Reiley & Zhang 2024, Marketing Science) |
| Academic `[FULL]` with five-part record | **1** | S25 |
| Primary `[PARTIAL]` | 14 | S09, S10, S14, S15, S16, S17, S24, S26, S30, S31, S34, S35, S38–S42, S43, S47 |
| Secondary (excluded from load-bearing use; labelled where cited) | 4 | S44, S45, S46, S49 |
| FAILED ACCESS / FAILED LOCATOR | 6 | F05, F13, F14, F16, F21 (partial recovery), F24 |

# Findings by subquestion

## Item 1 — Google AdSense for the website

**Eligibility (S02 `[FULL]`).** Three conditions only: "your own unique and interesting content" that is "high-quality, original, and attract[s] an audience"; compliance with the Program policies; applicant aged 18+. Access to the site's HTML source is required. **No traffic minimum, no article count and no site-age rule appear on the eligibility page** (absence measured by reading the whole page). The SEO-blog figures ("15–25 articles", "1–14 days review") returned by Q01/Q05 are community folklore and are excluded.

**AI-generated content stance.** No clause in the Google Publisher Policies (S01, read in full) mentions AI-generated content, and none requires AI disclosure. What binds is content-neutral: (a) *"Google-served ads on screens without publisher-content"* — ads are not allowed on screens "without publisher-content or with low-value content", "under construction", or "used for alerts, navigation or other behavioral purposes"; (b) *"screens with replicated content"* — no ads on "embedded or copied content from others without additional commentary, curation, or otherwise adding value"; (c) *"More ads … than publisher-content"*; (d) *"Spam policies for Google web search"* apply to monetised screens. **Risk reading for our home page (INFERENCE):** a one-prompt player with a JSON-LD block and no browsable text content is the shape clause (a) targets; the reviewer sees a tool, not a publication. The pending `/musics` public catalogue (per-track pages carrying prompt, parameters, duration, playable audio) is what converts the site into publisher-content. The `deploy/payload/public/site/index.html` already carries `application/ld+json` and analytics — it lacks About/Contact/Privacy pages that S04 makes mandatory once ads run (privacy policy must disclose third-party cookies, Google's advertising cookies, and link to Ads Settings / aboutads.info).

**Site approval process and timelines.** S02 references an "AdSense site approvals video series" but publishes no SLA. S47 documents the post-approval *ad serving statuses* ("Restricted ad personalization" when no certified CMP; "Low coverage" when TC strings are missing on part of the inventory; recovery "may take up to 48 hours" after adopting a certified CMP). ads.txt changes "may take a few days … up to a month" to reflect for low-request sites (S07). **Review duration: `[UNVERIFIED]` — Google publishes none; do not plan against blog figures.**

**Ad formats fit for a player page (S08 `[FULL]`, S27 `[FULL]`, S01).** AdSense is positioned by Google for "blogs, forums, and online services" with Auto ads (S08). The Better Ads Standards (S27), which S01 makes binding, exclude on mobile web: pop-ups, prestitials, ad density >30 %, flashing animated ads, auto-playing video with sound, postitials with countdown, full-screen scroll-overs, **large sticky ads**, sticky pop-out video; on desktop: pop-ups, auto-play video with sound, prestitials with countdown, large sticky ads, density >50 % (>30 % with sticky video). S01 additionally bans ads that "overlay or are adjacent to navigational or other action items", that "severely interfere with consumption of content", and on "dead end" screens. **Fit (INFERENCE from S01+S27):** one anchored (non-large) banner or one in-page unit below the player controls, outside the prompt/controls hit area; **no vignette/interstitial on the player page** (it is a single-screen app with no page transitions, so there is no "logical break" as S11 defines it for apps); Auto ads acceptable only if vignette and anchor-overlay are disabled in the AdSense UI so the player's transport controls are never covered.

**Consent Mode v2 / IAB TCF v2.2 in the EEA/UK/CH (S03, S06 `[FULL]`).** The EU user consent policy requires legally valid consent to cookies/local storage "where legally required" and to "the collection, sharing, and use of personal data for personalization of ads", retention of consent records, and clear revocation instructions (S03). S06: "a certified CMP integrated with the TCF is required when serving personalized ads to users in the EEA and UK" as of **16 January 2024**, and in Switzerland as of **31 July 2024**; "Only traffic from a certified CMP is eligible for personalized ads"; non-certified-CMP traffic "may be eligible for non-personalized ads or limited ads (including programmatic limited ads) where supported". Google's own message ("European regulations message" in the Privacy & messaging tab) is certified: the list contains **"Google LLC CMP — TCF CMP ID 300 — Web and app"** (S06). Our `consent.js` is not a TCF CMP → without change, EEA/UK/CH traffic gets "Restricted ad personalization" (S47). **Google does not certify CMPs for GDPR compliance itself** ("Google does not check CMPs for full compliance with the TCF or applicable privacy laws", S06) — the legal responsibility stays with us.

**ads.txt (S07 `[FULL]`).** Not mandatory but "highly recommended"; one line `google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0` at `https://www.playmusicprompts.com/ads.txt`; S01 makes it a *policy* violation to serve Google ads on a domain whose ads.txt exists but omits Google as authorised seller — so if we create the file, Google's line must be in it. In Next.js this is a static file at `deploy/payload/public/ads.txt` (served at root by default; the `beforeFiles` rewrite only touches `/`).

**Payment thresholds and Türkiye (S05 `[FULL]`).** TRY row: tax-info threshold N/A, verification "$10 equivalent", payment-method selection **₺20**, payment **₺200**, cancellation ₺20. USD row: $10 / $10 / $100 / $10. Türkiye is not in the sanctions list (Crimea, Cuba, DNR/LNR, Iran, North Korea — S01). Payment mechanics (from the AdMob twin pages S15/S16, `[PARTIAL]`, identical payments platform): monthly cycle, finalised in the first days of the next month, paid "on or around the 21st", wire transfer "allow ten days", postal PIN "may take up to 3 weeks", forms of payment "depend on your country" — the exact TR method list was **not read** (`[UNVERIFIED]`).

**Google Ad Manager vs AdSense (S08 `[FULL]`, S09/S10 `[PARTIAL]`).** Google's own decision table: AdSense = ad network, web only, cannot negotiate direct-sold deals, cannot add third-party networks; Ad Manager = platform for "large publishers who have significant direct sales", web + app, supports third-party networks/exchanges, "requires you to sign up for a paid account when you reach a specific impression threshold" (S10). **When GAM is needed for us:** only if we (i) sell direct audio/display sponsorships, (ii) run header bidding / third-party demand against Google's, or (iii) want one reporting plane across web and app. None applies at launch → **AdSense + AdMob first; GAM Small Business later**. The per-country free-impression ceilings quoted by secondaries (90–200 M/month) were **not found on a Google page — `[UNVERIFIED]`**.

## Item 2 — Google AdMob for Flutter (Android + iOS + tablet)

**Plugin and platform minimums.** `google_mobile_ads` **9.1.0**, published 2026-08-12, Apache-2.0 (S17, S18). Release notes (S18): Ad Preloading APIs (PR 1445), `AdManagerBannerAd.isMounted` (PR 1443), `setConsentSyncId()` on `ConsentRequestParameters` (PR 1452), `ageRestrictedTreatment` on `RequestConfiguration` (PR 1455), null-safe returns (PR 1461); GMA Android SDK **25.4.0**, GMA Next-Gen Android **1.3.1**, iOS SDK **13.7.0**, UMP Android **4.0.0**, UMP iOS **3.1.0**. Android `build.gradle` on master (S19): `minSdk 24`, `compileSdk 36`, `agp 8.13.1`, `play-services-ads:25.3.0` (legacy path) or `ads-mobile-sdk:1.1.1` (Next-Gen via `USE_NEXT_GEN_SDK` dart-define), `user-messaging-platform:4.0.0`. Quick-start (S20, page updated 2026-09-02): "Flutter version 3.38.1 or higher"; the plugin "only supports Android and iOS, and doesn't support web and desktop platforms"; `MobileAds.instance.initialize()` returns a Future that completes on init "or after 30 seconds"; app ID goes in `AndroidManifest.xml` `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID">` and `Info.plist` `GADApplicationIdentifier`. **iOS minimum deployment target is not stated on S20; a 2024 forum thread (S24-adjacent, Google Group) reports iOS 15 as a working target — `[UNVERIFIED]`, read it from the Podspec at integration time.** Our app targets Dart `^3.12.0`; Flutter version on the build machine must be checked against 3.38.1 before adding the dependency.

**Formats (S20 table `[FULL]`, S22 `[FULL]`).** Banner (anchored adaptive, inline adaptive for scrolling layouts, collapsible, fixed size), Interstitial, Native (with templates), Rewarded, Rewarded interstitial, App open. S22: anchored adaptive banners have a ~320×50 aspect, height constant across refreshes so "the content surrounding the ad stays in place"; **large anchored adaptive** allows "up to 20 % of screen height, between 50 and 150 dp" and is "optimized for video content"; obtain size via `AdSize.getLargeAnchoredAdaptiveBannerAdSize(width)` (or the non-large variant); on iOS the `AdWidget` must sit in a sized container; refresh "occurs only if the banner is visible on screen"; dispose in `onAdFailedToLoad` and when removed. Test ad unit IDs for banners: Android `ca-app-pub-3940256099942544/9214589741`, iOS `ca-app-pub-3940256099942544/2435281174` (S22); generic sample banner IDs `…/6300978111` (Android) and `…/2934735716` (iOS) (S23). Sample app ID `ca-app-pub-3940256099942544~3347511713` (S20).

**Policies relevant to a music player.** (a) *Background audio + ads:* S01 "Out of context ads — We do not allow Google-served ads … in apps or web pages that run in the background … when the user's attention is expected to be elsewhere and not on the screen hosting the ad." S11: "Ads should not be placed in applications that are running in the background of the device or outside of the app environment." → **No Google ad may be shown or counted while our player runs with the screen off or another app foregrounded.** (b) *Interstitial timing (S11 `[FULL]`):* not on app load or exit (use App Open ads instead when "loading an app or switching back to it"); "no more than one interstitial ad after every two user actions"; never "immediately after another interstitial"; only at "logical breaks in between your app's content (e.g. pages, stages, or levels)"; pre-load to avoid latency-induced surprise. For us the only defensible logical break is the **track boundary on a screen the user is looking at**, and a frequency cap far below 1-per-2-actions is warranted by S25 (below). (c) *Rewarded "generate one more track free" (S12 `[FULL]`):* allowed — the reward is an "indirect or non-monetary item" that is "only redeemable and usable … within the publisher's … app" and "non-transferable"; requirements: "clear, accurate and conspicuous disclosure of the action(s) required and reward(s) offered prior to each instance"; served "only after a user affirmatively and unambiguously opts in (such as by tapping a button)"; must be skippable; skipping "must not impede or interfere with the normal usage"; no nudging copy such as "watch this ad to support our business"; publisher must deliver the reward and must not imply Google endorses it. **Interaction with paid generations (INFERENCE):** the reward must be a *credit toward one generation* consumed by our existing spend guard (12/hour, 40/day) as an extra allowance; the base free quota must remain available without watching anything, otherwise the ad "impedes normal usage".

**UMP SDK consent flow (S21 `[FULL]`, page updated 2026-09-02).** Create the message in AdMob → Privacy & messaging; at **every app launch** call `ConsentInformation.instance.requestConsentInfoUpdate(params, onSuccess, onError)`; then `ConsentForm.loadAndShowConsentFormIfRequired(...)`; check `ConsentInformation.instance.getPrivacyOptionsRequirementStatus() == PrivacyOptionsRequirementStatus.required` and, if required, render a visible "privacy options" entry point calling `ConsentForm.showPrivacyOptionsForm(...)`; gate ad requests on `await ConsentInformation.instance.canRequestAds()` (returns false until `requestConsentInfoUpdate()` has run; on error the SDK uses the previous session's status); guard against double ad-loading with a boolean. Testing: `ConsentDebugSettings(debugGeography: DebugGeography.debugGeographyEea, testIdentifiers: [...])`; `ConsentInformation.instance.reset()` for testing only. **ATT on iOS (S24 `[PARTIAL]`, S32 `[FULL]`):** add `NSUserTrackingUsageDescription` to `Info.plist`, link `AppTrackingTransparency`; the UMP SDK can present an IDFA explainer before the system ATT prompt; the ATT prompt appears once per install; "If a user denies ATT, continue to request ads … The Google Mobile Ads Flutter Plugin doesn't send IDFA in the ad request" (S24). Apple: tracking permission may not be gated or incentivised (App Review 5.1.2(i)); fingerprinting is forbidden; the developer is responsible for every SDK's tracking (S32).

**app-ads.txt (S13 `[FULL]`).** Requires the app to be listed on Play/App Store with a **developer website** in the listing (Play: Store settings → "Store listing contact details" → website; Apple: "marketing URL"); crawler fetches `https://<host>/app-ads.txt` on the registered host, drops `www.` and `m.`, climbs one subdomain level, follows redirects; format per IAB "Authorized Sellers for Apps"; up to 24 h to crawl; "Check for updates" in AdMob → Apps → View all apps → app-ads.txt. For us: the developer website will be `https://www.playmusicprompts.com`, so the crawler checks `https://playmusicprompts.com/app-ads.txt` → the apex must resolve (CloudFront E24H3DG0V4RCWB alias or redirect to www) and `deploy/payload/public/app-ads.txt` must exist alongside `ads.txt`.

**Store requirements.** Play Data safety (S34 `[PARTIAL]`, S35 `[PARTIAL]`): all data collected "through any third-party libraries or SDKs" must be declared; Google publishes an AdMob-specific disclosure page listing IP address (coarse location), app interactions, diagnostics, and "Android advertising (ad) ID", noting AAID collection "is optional … you can prevent the collection of ad IDs by updating the app's manifest file" (S35). Apple privacy nutrition labels (S32): third-party SDK data must be described; privacy manifests and SDK signatures now apply. **Play Families (S33 `[FULL]`):** applies only if a declared target audience includes children; a music player for a general audience should declare an adult/general target audience in Play Console "Target Audience and Content"; if it ever includes children it must use only Families self-certified ad SDK versions, no personalised ads, neutral age screen, no interstitial at launch, rewarded ads closable after 5 s.

**Mediation (S20/S21 navigation `[FULL]` for adapter list).** AdMob mediation adapters are documented for AppLovin, BidMachine, Chartboost, DT Exchange, i-mobile, InMobi, ironSource, Liftoff Monetize, LY Ads Network, maio, Meta Audience Network, Mintegral, Moloco, myTarget, Pangle, PubMatic OpenWrap, Unity Ads, Vpon, Zucks (19 adapters listed in the Flutter docs nav). S23: mediated ads do **not** render the "Test Ad" label — each network's test mode must be enabled separately. AdMob mediation vs AppLovin MAX as the *host* mediator: **not evidenced this session** — MAX's official docs were not read (gap).

**Payout (S14–S16 `[PARTIAL]`).** Same thresholds as AdSense (TRY ₺200 payment / ₺20 method selection / "$10 equivalent" verification); monthly cycle, paid on or around the 21st; identity verification, postal PIN (≤3 weeks), payment-method selection, tax info; forms of payment by country include cheques, EFT, wire transfer, SEPA EFT (S16) — the Türkiye-specific list was not read.

## Item 3 — Alternatives and complements beyond Google

| Vendor | Class | Eligibility / minimum (as read) | Formats | Payout / share | Türkiye-based publisher | Source, status |
| --- | --- | --- | --- | --- | --- | --- |
| Mediavine "Official" | web display, managed | "$5,000+ in annual ad revenue"; "good standing with Google AdSense/Ad Exchange"; evaluates traffic countries of origin, sources, demographics | display (not enumerated on page) | 75 % rev-share `[single-source, secondary S49-adjacent]` | not stated | S28 `[FULL]` |
| Journey by Mediavine | web display, on-ramp | "over 1,000 sessions" | display via Grow plugin | 70 % rev-share `[single-source: jupiter.co / thisweekinblogging, secondary]` | not stated | S28 `[FULL]` for the 1,000-session gate |
| Raptive | web display, managed | 25,000 pageviews/month; 25k–99,999: ≥50 % traffic from US/UK/CA/NZ/AU, long-form content on most pages, Google Analytics, **domain ≥6 months old**; ≥100k: ≥40 % Tier-1 traffic | display, video (site) | not on eligibility page | not stated; the Tier-1 traffic rule makes a Türkiye-heavy audience ineligible | S29 `[FULL]` |
| Ezoic | web display, AI platform | **250,000 monthly users for new sign-ups since 2026-02-19**; Incubator: 20 sites/month, apply once; accounts active before 2026-02-18 grandfathered | display, video, native | not read | not stated | S30, S31 `[PARTIAL]` |
| Media.net | web contextual | **NOT READ** | — | — | — | gap |
| Amazon Publisher Services / Amazon Ads | web header bidding | **NOT READ** | — | — | — | gap |
| Unity Ads, AppLovin (MAX), ironSource / Unity LevelPlay, Meta Audience Network, InMobi, Digital Turbine | mobile networks / mediation | **official pages NOT READ**; all six except Digital Turbine appear as AdMob mediation adapters in the Flutter docs nav (S20) | — | — | — | gap |
| AdsWizz (SiriusXM) | audio SSP + SDK | contract; SDK requirements iOS 13.0+, Xcode 15.2+, Swift 5.10+, SPM from v7.9.2; last updated 2026-07-27 | in-stream audio pre/mid/post-roll, companion display, ShakeMe, Voice Ads | not published | not stated | S38 `[FULL]`, S39 `[PARTIAL]` |
| Triton Digital (Tap / Yield-Op / a2x) | audio ad server + programmatic | contract ("service agreement"); client must integrate the latest Triton SDK or On-Demand API; app-ads.txt / ads.txt expected for programmatic | in-stream audio, companion | not published | not stated | S40 `[PARTIAL]` |
| Audiomob | in-app audio (games) | contract; iOS/Android SDK + Unity plugin; SDK 10 adds ILRD, OM SDK certification, CMP support (OneTrust, Sourcepoint), webhooks | rewarded/skippable audio, "Moments" | not published | not stated | S41 `[PARTIAL]` |
| Odeeo | in-app audio (games) | contract; SDK 3.5 (deep links, UID2/RampID/ID5), MAX mediation support, display companion | in-game audio, rewarded audio | not published | not stated | S42 `[PARTIAL]` |
| Instreamatic | audio (mobile web `Xman.min.js`) | snippet only | — | — | — | gap |
| Gadsme | in-game audio/display | **nothing retrieved** | — | — | — | gap |

**Finding:** no non-Google network read this session is joinable today by a zero-traffic, Türkiye-based, login-free AI-music site; every audio network is sales-led. Absence of published Türkiye terms is *not found*, not *not existing*.

## Item 4 — Audio-native monetisation for a generative music player

**Slot placement vs Berk's algorithm.** Pandora served ads "only … at the end of a track" and its eligibility timers reset per pod (S25 §2). Our buffer algorithm fires generation at track START and recalibrates at T−90 s; an ad slot at **T−90 s would interrupt a track mid-play**, the pattern S11 calls "interstitials that unexpectedly launch" and S25's listeners never experienced. The track boundary is the only slot consistent with both Google policy and the experimental evidence; the T−90 recalibration can *decide* whether the next boundary carries an ad (e.g. only when the buffer is healthy so the ad never masks a generation stall).

**Listener tolerance (S25 `[FULL]`, five-part record below).** −2.08 % hours and −1.91 % active days per +1 ad/hour; 40 % of the hour loss is listeners leaving the platform; weak preference for more, shorter breaks; effects need 12–15 months to stabilise. Control realised load 3.63 ads/hour, 3.00 pods/hour, 1.23 ads/pod (Table 3).

**Ad-load benchmark for music streaming.** The only primary read is Pandora's 2014–16 control (3.63 ads/hour). **Spotify free-tier ad frequency: no primary source located this session — `[UNVERIFIED]`, do not quote a number.**

**Skip behaviour.** S25 measures the *extensive* margin (session initiation, active days) as the main response, hours per active day only −0.40 %; Google's rewarded policy requires skippability (S12); our EARLY_SKIP (<10 s) signal already exists in `session.js` / `listening_session.dart` and can log skips *of ads* as a separate reject signal.

**Companion banners:** supported by AdsWizz and Triton (S39, S40) as display synchronised with the audio break; on the web page a companion would occupy the same slot as the AdSense in-page unit — one or the other per break.

**Sponsored generation (rewarded before a paid generation):** lawful under S12 as an *extra* credit (see Item 2); audio networks (Audiomob, Odeeo) offer rewarded audio with server webhooks (S41) — usable later for a "listen to a 15-s audio ad, earn one generation" variant without a full-screen video.

## Item 5 — Revenue expectations and break-even model

**Primary numbers available:** none readable as text. Tenjin/CAS publishes per-country eCPM tables for banner/interstitial/rewarded (Q1–Q2 2024) but as images (S43); AdSense's public calculator renders no server-side value (S48). **All eCPM figures below are secondary and `[UNVERIFIED]`:** Tier-1 banner $0.50–1.50, interstitial $5–8, rewarded $15–30; global averages $0.20–0.80 / $2.50–5.00 / $8–18 (S44); US rewarded $16.49 Android / $19.63 iOS, interstitial ~$10, banner ~$1.2–1.3 (S45); rewarded CPM "CIS, Turkey $4–12" vs "USA, UK $15–35" (S46).

**Break-even (CALCULATION, own derivation).** Let C = $0.08 per take (measured), N = takes generated in a session, I_f = impressions of format f, e_f = eCPM in USD. Ad revenue R = Σ_f I_f · e_f / 1000. Break-even requires R ≥ C·N. Single-format break-even eCPM: **e* = 1000 · C · N / I**.

| Scenario | N | Impressions | e* needed | Secondary eCPM range | Covered? |
| --- | --- | --- | --- | --- | --- |
| Playlist round, banner only, 10-min session, 60-s refresh | 3 | 10 banner | **$24.0** | $0.50–1.50 (S44) | no (2–6 %) |
| Same, 30-min session | 3 | 30 banner | $8.0 | $0.50–1.50 | no (6–19 %) |
| One rewarded per take | 1 | 1 rewarded | $80.0 | $15–30 Tier-1 / $4–12 TR (S44, S46) | no (19–38 % Tier-1; 5–15 % TR) |
| Rewarded + banner, playlist round, 30 min | 3 | 3 rewarded + 30 banner | mix | 3×$0.02 + 30×$0.001 ≈ $0.09 (Tier-1 mid) | ≈ 38 % of $0.24 |
| Reuse hit-rate h from slices A–D (only (1−h)·N takes generated) | 3, h = 0.6 | 3 rewarded + 30 banner | cost $0.096 | ≈ $0.09 | ≈ break-even |

Sensitivity: revenue scales linearly with impressions and eCPM; cost scales with (1−h)·N. At Türkiye eCPMs the required reuse hit-rate is ≥ 0.85 for the last row. **Conclusion:** ads alone never cover fresh generation at current $0.08/take; they cover it only with catalogue reuse and quotas.

## Item 6 — Policy and legal constraints

- **GDPR/EEA/UK/CH:** personalised ads need a certified TCF CMP (S06); non-personalised/limited ads otherwise; consent records and revocation path mandatory (S03). Google's Personalized advertising policy forbids targeting on sensitive categories (S01).
- **KVKK (Türkiye):** the official text at mevzuat.gov.tr **could not be read** (F24) — `[UNVERIFIED]` in this slice; the parent should re-fetch. Our existing banner already names KVKK as a legal basis; extending it to advertising cookies is a wording/legal task.
- **EU DSA Art. 26 (S36, three mirrors agree verbatim):** for each ad, label it as an ad, name the advertiser and the payer, give "meaningful information … about the main parameters used to determine the recipient"; no ads based on profiling with GDPR Art. 9 special-category data. **Art. 19 exempts micro/small enterprises (<250 staff and ≤ €50 M turnover) from Arts. 25–26** per Heuking (S36-adjacent, `[single-source, secondary]`) — the parent should confirm against EUR-Lex Art. 19 and 29.
- **Google AI-content / MFA:** no AI clause in S01; "made for advertising" policy page **not read** (gap).
- **COPPA / age:** a general-audience music player is not "for kids"; declare a general/adult target audience in Play Console "Target Audience and Content" (S33); S01 requires COPPA handling only for child-directed properties; Google's personalised-ads policy bars personalisation for users "known … to be under 13" (S01). In AdMob use `RequestConfiguration(tagForChildDirectedTreatment: no, tagForUnderAgeOfConsent: …)` only if we ever learn age — `ageRestrictedTreatment` was added in 9.1.0 (S18).
- **Apple ATT (S32 `[FULL]`):** required for IDFA/cross-app tracking on iOS 14.5+; cannot be gated or incentivised; IDFV allowed for own analytics; separate GDPR consent screens allowed but must never override the ATT answer.
- **Play Families (S33 `[FULL]`):** not applicable unless children are declared as a target audience.

## Item 7 — Implementation path for THIS project

**Web (`deploy/payload`).** (1) Add `public/ads.txt` and `public/app-ads.txt` (root-served static files; the `/` rewrite does not affect them). (2) Add About / Contact / Privacy pages (S04 wording elements) as real HTML under `public/site/` or Next routes — required before the AdSense application. (3) Replace `consent.js`'s ad-consent scope with Google's certified "European regulations message" (Privacy & messaging, CMP ID 300) or another certified CMP; keep the existing GA4 Consent Mode v2 signalling. (4) Ad slot: one anchored-adaptive-height container below the player transport, reserved height to avoid layout shift, hidden while the CMP has not returned a decision for EEA/UK/CH; no vignette/anchor overlays (S01, S27). (5) **CSP:** none exists today; when one is added it must allow `pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`, `tpc.googlesyndication.com`, `fundingchoicesmessages.google.com` (CMP) and the existing `googletagmanager.com` — **the exact host list must be taken from Google's CSP guidance page at implementation time; it was not read this session (`[UNVERIFIED]`)**. (6) Application order: catalogue pages live → legal pages → CMP → apply.

**Flutter (`app/`).** (1) Verify `flutter --version` ≥ 3.38.1 (S20); `android/app/build.gradle` `minSdk ≥ 24` (S19). (2) `google_mobile_ads: ^9.1.0` in `pubspec.yaml`. (3) `AndroidManifest.xml` `APPLICATION_ID` meta-data; `Info.plist` `GADApplicationIdentifier` + `NSUserTrackingUsageDescription` (S20, S24). (4) Start-up: UMP flow (S21) → `canRequestAds()` → `MobileAds.instance.initialize()`. (5) Ad-unit strategy per screen: player screen — one anchored adaptive banner only while the screen is foreground; playlist/track-boundary — optional interstitial capped to ≤1 per N boundaries and never in background (S01, S11, S25); "one more track" — rewarded with pre-disclosure and opt-in button (S12); app-open on cold start/resume instead of interstitial (S11). (6) Test IDs from S22/S23 during development; register test devices; remove before release (S23). (7) Release checklist: app-ads.txt verified (S13), Play Data safety incl. AdMob disclosure (S34, S35), Apple privacy labels incl. SDK data (S32), Families declaration = general audience (S33), remove `ConsentDebugSettings` and `reset()` (S21).

**Accounts Berk must open himself:** Google AdSense account (payee name, address in Türkiye, TRY or USD reporting currency, tax info), Google AdMob account (same payments profile family), Google payments profile with payout method (wire/EFT list for TR to be read at signup), Play Console developer website field and App Store marketing URL set to `https://www.playmusicprompts.com` (S13). **Data Berk decides:** payout country (TR) and currency (TRY ₺200 threshold vs USD $100), business vs individual payments profile, whether the reviewed site is the current one-prompt page or the post-catalogue site.

## Item 8 — Recommendation for this slice, ordered by dependency

1. **Accounts** — AdSense + AdMob under one Google payments profile (TR). No cost.
2. **Consent CMP** — Google's certified message (CMP ID 300) on web and UMP in-app; keep GA4 Consent Mode v2. No cost.
3. **Web** — legal pages + ads.txt/app-ads.txt first; apply to AdSense after `/musics` catalogue pages exist; one non-large anchored banner below the player; no overlays.
4. **App** — `google_mobile_ads ^9.1.0`; banner on player screen; rewarded "one more generation" as extra quota; interstitial only at track boundary with a hard cap; never in background.
5. **Audio ads later** — AdsWizz/Triton/Audiomob/Odeeo are contract-gated; revisit once monthly listening hours justify a sales conversation.

**Falsifiers:** (a) AdSense approves the current one-prompt page without catalogue pages → reorder step 3; (b) a Google page states an AI-content or MFA clause hitting generated audio → re-evaluate; (c) measured eCPM in our own AdMob reports exceeds the secondary ranges by >2× → banner-only could approach break-even at longer sessions; (d) Pandora's elasticity does not transfer to short-session generative listening (test with our own EARLY_SKIP/FULL_LISTEN signals over ≥3 months before scaling load).

**PAID or revenue-share vendors flagged for Berk's approval (none adopted by this slice):** Mediavine Journey (70 %), Mediavine Official (75 %), Raptive (75 %), Ezoic, AdsWizz, Triton Digital, Audiomob, Odeeo, any AdMob mediation partner (AppLovin, Unity, ironSource, Meta, InMobi…). Google AdSense/AdMob are pre-approved platforms under owner constraint 42.

## Five-part academic records (each [FULL] primary)

### S25 — Goli, Huang, Reiley & Riabov, "Measuring Consumer Sensitivity to Audio Advertising: A Long-Run Field Experiment on Pandora Internet Radio", arXiv:2412.05516 (v1, 4 Dec 2024; first version 21 Apr 2018). Read `[FULL]`: main text §1–6, Online Appendices A–D, references.

1. **Problem in the authors' framing.** Ad quantity is "an implicit price that consumers pay for access to free content"; platforms must "determine the optimal level of advertising that maximizes revenue without driving away users"; large-scale, long-run ad-load experiments were "uncommon", and observational estimates are biased (§1).
2. **Method.** RCT on Pandora's mobile apps, June 2014–April 2016 (21 months): 19 % of listeners randomised — nine 1 % treatment cells in a 3×3 design (3/4/6 pods per hour × 1/1.5/2 ads per pod) plus a 10 % control equal to the 4×1.5 status quo; assignment by hashed user ID, persistent, new users enrolled continuously; ads served only at track end when a timer had elapsed; realised load < intended because inventory is sold by forward contracts with frequency caps. Estimation: 2SLS with treatment-group dummies instrumenting realised ads/hour (eq. 1); outcomes normalised to control = 100; decomposition into hours/active day × days/active listener × P(active) (§3.4); pod-length model (eq. 6); subscription/churn IV (Table 10); heterogeneity by age (Appendix B); panel-IV robustness (Appendix D).
3. **Real numbers.** Table 3: control 3.628 ads/hour, 3.002 pods/hour, 1.229 ads/pod; highest cell 6×2 = 5.021 ads/hour (84 % more than 3×1 at 2.735). Table 4: final-month total hours 97.149 (6×2) vs 101.761 (3×1), control 100. Table 5: **−2.082 % hours (SE 0.1157) and −1.911 % active days (SE 0.0662) per additional ad/hour**, n = 34,390,962, first-stage F = 157,839. Table 6: −0.9152 % P(active), −0.9545 % days per active listener, −0.4033 % hours per active day → 40 % / 42 % / 18 % of the loss. §3.3: elasticity grows from ≈ −0.02 (month 1) to −0.070 (hours) / −0.076 (days); "underestimated … by a factor of 3" with a 1–2-month experiment. Table 9: pods of length 1 = −1.966, length 2 = −4.116 (hours); test 2β₁−β₂ = 0.4073 (p<0.05) for active days → slight preference for shorter, more frequent pods. Table 10: +0.00145 subscription probability and +0.00336 churn per ad/hour; ≈ 0.75 ¢/listener/month extra subscription revenue per ad/hour at $4.99. Appendix B: 18–24 churn:subscribe ratio ≈ 2.7:1 (0.33 % vs 0.09 %), 55+ ≈ 1:1 (0.22 % vs 0.21 %). Table 7/8: observational OLS/IV/panel overstate the hours effect up to 5.5× (−11.51 IV vs −2.08).
4. **Stated limitations.** Treatment only on mobile (≈80 % of listening) while outcomes span all devices → possible attenuation (§6); word-of-mouth spillovers (fn. 11); selection via differential churn cannot be fully excluded (App. D); agreement with Pandora forbids cost-benefit discussion; results are for non-interactive radio in the US, 2014–16, single platform. **Analyst-identified:** ads were ≤ 2 per pod and audio-only — no evidence on full-screen video interstitials or on very short generative sessions; no Türkiye or EU population.
5. **Application here.** (a) Ad slot only at the track boundary (`session.js` / `listening_session.dart` "track START" event), never at T−90 s. (b) Budget total load ≤ ~3–4 ads/hour and prefer 1-ad breaks. (c) Expect 40 % of any ad-load damage to show up as lost anonymous visitors, not shorter sessions — instrument `P(return)` and active days per `anonId`, not session length. (d) Measure over ≥ 3 months; a 2-week A/B underestimates by ~3×. (e) Younger audiences churn rather than pay — an ad-free tier will convert older/committed listeners; keep the base experience light for the young. (f) Use our own experimental variation (randomised ad-load cells per `anonId`) — observational tuning would mislead, exactly as Tables 7–8 show.

## Companies / APIs / repositories

| Entity | Surface read | Version / date | Status |
| --- | --- | --- | --- |
| Google AdSense | eligibility, publisher policies, EU consent policy, privacy-policy requirement, CMP requirement + certified list, ads.txt, payment thresholds, ad-serving statuses, start page | pages undated except CMP dates 2024-01-16 / 2024-07-31; accessed 2026-09-03 | S01–S07, S47, S48 |
| Google Ad Manager | product comparison, account types | accessed 2026-09-03 | S08–S10 |
| Google AdMob | interstitial policy, rewarded policy, app-ads.txt, payments | accessed 2026-09-03 | S11–S16 |
| `googleads/googleads-mobile-flutter` | release v9.1.0 (2026-08-12, author malandr2), `packages/google_mobile_ads/android/build.gradle` (master; file says version '9.0.0', deps `play-services-ads:25.3.0`) | 9.1.0 | S17–S19 — **VERSION-CONFLICT between master gradle (9.0.0 / 25.3.0) and release note (9.1.0 / 25.4.0)**, preserved |
| developers.google.com/admob/flutter | quick-start, privacy (UMP), banner, test-ads, idfa | "Last updated 2026-09-02 UTC" on quick-start, privacy, test-ads | S20–S24 — **internal contradiction on quick-start: page summary says "Flutter 3.27.0+", body says "3.38.1 or higher"** |
| Apple | User privacy and data use / ATT | accessed 2026-09-03 | S32 |
| Google Play | Families policies; Data safety; AdMob Play data disclosure | accessed 2026-09-03 | S33–S35 |
| Coalition for Better Ads | Standards | accessed 2026-09-03 | S27 |
| Mediavine / Raptive / Ezoic | eligibility pages, Incubator page, PR (2026-02-19) | 2026 | S28–S31 |
| AdsWizz / Triton / Audiomob / Odeeo | SDK reference (2026-07-27), insertion suite, spec/ToS docs, SDK 10 and SDK 3.5 posts | 2023–2026 | S38–S42 |
| Tenjin / CAS | benchmark report (image tables) | Q1 2024–Q1 2026 | S43 |

## Hidden and contrary evidence

- **Contrary to the "AI content is banned" folklore:** the full Publisher Policies text contains no AI clause (S01); the binding risk is *low-value / no-publisher-content screens*.
- **Contrary to "Ezoic has no minimum":** the 2026-02-19 change to 250,000 monthly users is on Ezoic's own Incubator page and in its press release (S30, S31); older secondaries (ppc.land, S43-adjacent) are STALE.
- **Contrary to "more ads = fewer subscribers":** observational data on Pandora shows the wrong sign; the experiment shows +0.14 pp subscriptions per ad/hour (S25 Table 10 vs A2).
- **Under-indexed:** Google's Flutter docs nav lists 19 mediation adapters — evidence that AdMob mediation, not a second SDK, is the documented path to Unity/AppLovin/Meta demand (S20).
- **Under-indexed:** the app-ads.txt crawler strips `www.` and probes the apex host (S13) — a `www`-only site fails verification unless the apex resolves or redirects.

# Claim cross-verification ledger

| claim_id | claim | type | sources (independent?) | status |
| --- | --- | --- | --- | --- |
| C01 | Certified TCF CMP required for personalised ads in EEA/UK since 2024-01-16, CH since 2024-07-31 | PRIMARY FACT | S06 (AdSense), S06-twins in AdMob/GAM help centres (same producer), S47 | **[single-source official]** — one producer (Google), three surfaces |
| C02 | AdSense/AdMob TRY payment threshold ₺200, method-selection ₺20 | PRIMARY FACT | S05, S14 (same payments platform) | [single-source official] |
| C03 | `google_mobile_ads` current = 9.1.0, minSdk 24, Flutter ≥ 3.38.1 | PRIMARY FACT | S17 (pub.dev), S18 (GitHub release), S19 (gradle), S20 (docs) — 3 independent surfaces, one producer | verified 3+ surfaces; producer single |
| C04 | Google ads may not be served while the app runs in background | PRIMARY FACT | S01, S11 | [single-source official], two pages |
| C05 | Rewarded "extra generation" is policy-compliant if non-monetary, in-app, opt-in, skippable | PRIMARY FACT + INFERENCE | S12 (rule), S32 (no incentivised ATT), S33 (Families 5-s rule if ever kids) | rule single-source official; application INFERENCE |
| C06 | +1 audio ad/hour → −2.08 % hours, −1.91 % active days (long-run) | PRIMARY FACT | S25 Table 5; S25 App. D panel (−2.187 %); S49 (NN/g secondary restating the 2018 version: low-ad −25 % → +1.7 % hours; high-ad +38 % → −2.8 %) | one experiment, three estimators; [single-source academic] |
| C07 | Raptive 25,000 pv/month + Tier-1 traffic share; Mediavine $5,000/yr or Journey 1,000 sessions; Ezoic 250,000 users | PRIMARY FACT | S29, S28, S30+S31 — each vendor its own page | each [single-source official] |
| C08 | Break-even eCPM e* = 1000·C·N/I; banner-only needs ≈ $24 for a 3-take, 10-impression session | CALCULATION | C = $0.08 (project measurement, CONTEXT-03); eCPM ranges S44–S46 (secondary) | derivation verified arithmetically; inputs **[UNVERIFIED]** |
| C09 | DSA Art. 26 obligations; SME exemption via Art. 19 | PRIMARY FACT (mirror) / SOURCE CLAIM | S36 ×3 mirrors agree verbatim; exemption from Heuking only | Art. 26 text 3-source consistent (mirrors, not EUR-Lex); exemption **[single-source, secondary]** |
| C10 | Better Ads Standards forbid large sticky ads, prestitials, >30 % density on mobile web | PRIMARY FACT | S27; made binding by S01 | [single-source official] |
| C11 | ATT cannot be gated or incentivised; IDFA all-zeros without permission | PRIMARY FACT | S32; S24 (Google states ads still requestable without IDFA) | two producers, consistent |
| C12 | AdSense review duration; GAM 360 impression thresholds; Türkiye payout method list; Spotify free-tier ad load; KVKK article text | UNKNOWN | — | **[UNVERIFIED]** — no primary read |

Counts: 3+-source verified (independent surfaces): 2 (C03, C09-text); single-source official/academic: 8 (C01, C02, C04, C05, C06, C07, C10, C11); unverified: 2 groups (C08 inputs, C12).

# Contradictions, corrections, uncertainty, gaps

**Contradictions preserved (not averaged):**
1. Ezoic minimum: "no pageview limits" (ppc.land, undated; hilltopads) vs **250,000 monthly users since 2026-02-19** (Ezoic Incubator page S30, PR Newswire S31). Resolution newest-first: 250,000; older claims STALE.
2. Google Flutter quick-start: page summary "Flutter 3.27.0+" vs body "Flutter version 3.38.1 or higher" (S20, same page, updated 2026-09-02). Take the body (normative prose); flag to Google if needed.
3. `google_mobile_ads` master `build.gradle` says `version '9.0.0'` and `play-services-ads:25.3.0` (S19) vs release note 9.1.0 / 25.4.0 (S18). Take the tagged release; the master file may be ahead/behind the tag.
4. Pandora effect size: NN/g's restatement of the 2018 draft (S49) quotes 3.6 ads/hour control and −2.8 % hours for +38 % ads; the 2024 arXiv version (S25) reports 3.628 ads/hour and a linear −2.08 % per ad/hour. Consistent in direction; use S25.
5. Mediavine share: 70 % Journey / 75 % Official come only from secondaries; Mediavine's own page (S28) states the gates but not the share.

**Uncertainty / unverified (each attached to its claim above):** AdSense review time; iOS minimum deployment target for the plugin; GAM 360 thresholds; Türkiye payout methods; every eCPM number; Spotify free-tier ad frequency; KVKK text; DSA Art. 19 exemption; Google CSP host list; "made for advertising" policy.

**Gaps (scope atoms with no primary read):** Media.net; Amazon Publisher Services; Unity Ads, AppLovin MAX, ironSource/LevelPlay, Meta Audience Network, InMobi, Digital Turbine official eligibility/payout; Instreamatic and Gadsme docs; IAB TCF v2.2 policy text; IAB Tech Lab audio spec / OpenRTB 2.6; AdMob mediation vs MAX-as-host comparison; native/app-open/rewarded-interstitial Flutter pages individually; Spotify Research / Deezer Research ad-load papers; COPPA statute. Stopping reason: 45-minute execution limit (CONTEXT-17), not saturation.

# Synthesis — adopt / build / avoid for PlayMusicPrompts

**ADOPT:** Google AdSense (web) + Google AdMob via `google_mobile_ads ^9.1.0` (app), one payments profile in Türkiye; Google's certified CMP (ID 300) on web and UMP SDK in-app; ads.txt + app-ads.txt at the apex; anchored adaptive banner as the only always-on format; rewarded ad as an *additional* generation credit; app-open ad instead of load-time interstitial.

**BUILD:** (1) publisher-content pages (`/musics` catalogue, About/Contact/Privacy) before applying; (2) a per-`anonId` randomised ad-load experiment (2–3 cells, ≥3 months) reporting P(return), active days and EARLY_SKIP, following S25's design rather than observational tuning; (3) an ad-slot scheduler bound to the track-boundary event with a hard cap (start ≤ 1 interstitial/rewarded per 3 boundaries and ≤ ~3 ads/hour, tune by experiment); (4) the reuse hit-rate `h` from slices A–D as the primary economic lever — ads are additive.

**AVOID:** ads while the screen is off or the app is backgrounded (S01, S11); interstitials at app open/exit or at T−90 s mid-track (S11); large sticky / prestitial / auto-play-with-sound web formats (S27); gating or incentivising ATT (S32); applying to Raptive/Mediavine/Ezoic now (gates not met: S28–S31); any audio network contract before traffic exists; quoting eCPM numbers to Berk as facts (all secondary).

# Recommendation for this slice with falsifiers

**One committed recommendation:** Launch ad-supported free tier on Google only — AdSense on the web (after catalogue + legal pages + certified CMP), AdMob in Flutter (banner on the player screen, rewarded "one more generation", app-open on resume, interstitial only at track boundaries with a hard cap) — and treat ad revenue as a partial offset to the $0.08/take cost, with catalogue reuse (slices A–D) and the existing quota as the actual cost control. Order: accounts → CMP → web slots → app slots → audio ads later. Falsifiers are listed under Item 8. Vendors requiring Berk's approval are listed under Item 8.

# Sources (complete citations, stable locators, access date 2026-09-03)

S01 Google, "Google Publisher Policies", AdSense Help, https://support.google.com/adsense/answer/9335564 `[FULL]`.
S02 Google, "Eligibility requirements for AdSense", https://support.google.com/adsense/answer/9724 `[FULL]`.
S03 Google, "EU user consent policy", https://www.google.com/about/company/user-consent-policy/ `[FULL]`.
S04 Google, "Required content" (privacy policy), https://support.google.com/adsense/answer/1348695 `[FULL]`.
S05 Google, "Payment thresholds", AdSense, https://support.google.com/adsense/answer/1709871 `[FULL]`.
S06 Google, "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)", https://support.google.com/adsense/answer/13790256 `[FULL]`.
S07 Google, "Ads.txt guide", https://support.google.com/adsense/answer/12171612 `[FULL]`.
S08 Google, "Google Ad Manager, AdSense, and AdMob", https://support.google.com/admanager/answer/9234653 `[FULL]`.
S09 Google, "Compare Google Ad Manager and AdSense", https://support.google.com/admanager/answer/4599464 `[PARTIAL]`.
S10 Google, "Advertising with Ad Manager", https://support.google.com/admanager/answer/6022000 `[PARTIAL]`.
S11 Google, "Disallowed interstitial implementations", AdMob, https://support.google.com/admob/answer/6201362 `[FULL]`.
S12 Google, "Policies for ad units that offer rewards", AdMob, https://support.google.com/admob/answer/7313578 `[FULL]`.
S13 Google, "Set up an app-ads.txt file for your app", AdMob, https://support.google.com/admob/answer/9363762 `[FULL]`.
S14 Google, "Payment thresholds", AdMob, https://support.google.com/admob/answer/2772208 `[PARTIAL]`.
S15 Google, "Payments and transactions", AdMob, https://support.google.com/admob/answer/2772140 `[PARTIAL]`.
S16 Google, "Steps to getting paid", AdMob, https://support.google.com/admob/checklist/2998383 `[PARTIAL]`.
S17 pub.dev, `google_mobile_ads` 9.1.0, Apache-2.0, https://pub.dev/packages/google_mobile_ads `[PARTIAL]`.
S18 GitHub, googleads/googleads-mobile-flutter release v9.1.0 (2026-08-12), https://github.com/googleads/googleads-mobile-flutter/releases/tag/v9.1.0 `[FULL]`.
S19 GitHub, `packages/google_mobile_ads/android/build.gradle` (master), https://github.com/googleads/googleads-mobile-flutter/blob/master/packages/google_mobile_ads/android/build.gradle `[FULL]`.
S20 Google, "Set up Google Mobile Ads Flutter Plugin", https://developers.google.com/admob/flutter/quick-start (updated 2026-09-02) `[FULL]`.
S21 Google, "Set up UMP SDK | Flutter", https://developers.google.com/admob/flutter/privacy (updated 2026-09-02) `[FULL]`.
S22 Google, "Banner ads | Flutter", https://developers.google.com/admob/flutter/banner `[FULL]`.
S23 Google, "Enable test ads | Flutter", https://developers.google.com/admob/flutter/test-ads (updated 2026-09-02) `[FULL]`.
S24 Google, "Present IDFA message | Flutter", https://developers.google.com/admob/flutter/privacy/idfa `[PARTIAL]`.
S25 Goli, A., Huang, J., Reiley, D., Riabov, N. M., "Measuring Consumer Sensitivity to Audio Advertising: A Long-Run Field Experiment on Pandora Internet Radio", arXiv:2412.05516 v1 (2024-12-04), https://arxiv.org/abs/2412.05516 ; HTML https://arxiv.org/html/2412.05516v1 ; author PDF https://www.davidreiley.com/papers/PandoraListenerDemandCurve.pdf `[FULL]` (academic).
S26 Goli, A., Reiley, D. H., Zhang, H., "Personalizing Ad Load to Optimize Subscription and Ad Revenues", Marketing Science 2024, https://www.davidreiley.com/papers/PersonalizedVersioning.pdf `[PARTIAL]` (academic).
S27 Coalition for Better Ads, "The Better Ads Standards", https://www.betterads.org/standards/ `[FULL]`.
S28 Mediavine, "What does it take to get approved by Mediavine?", https://help.mediavine.com/what-does-it-take-to-get-approved-by-mediavine `[FULL]`.
S29 Raptive, "Who is eligible for Raptive?", https://help.raptive.com/hc/en-us/articles/360032840891-Who-is-eligible-for-Raptive `[FULL]`.
S30 Ezoic, "Incubator", https://www.ezoic.com/incubator `[PARTIAL]`.
S31 PR Newswire, "Ezoic Raises Bar to 250K…", 2026-02-19, https://www.prnewswire.com/news-releases/ezoic-raises-bar-to-250k-js-integration-for-full-revenue-platform-surges-in-popularity-with-web-builders-302692672.html `[PARTIAL]`.
S32 Apple, "User privacy and data use", https://developer.apple.com/app-store/user-privacy-and-data-use/ `[FULL]`.
S33 Google, "Google Play Families Policies", https://support.google.com/googleplay/android-developer/answer/9893335 `[FULL]`.
S34 Google, "Provide information for Google Play's Data safety section", https://support.google.com/googleplay/android-developer/answer/10787469 `[PARTIAL]`.
S35 Google, "Google Play data disclosure | Android", https://developers.google.com/admob/android/privacy/play-data-disclosure `[PARTIAL]`.
S36 Regulation (EU) 2022/2065 Art. 26 text via mirrors https://www.eu-digital-services-act.com/Digital_Services_Act_Article_26.html , https://dsa-library.com/article/26/ , https://overview.legal/laws/dsa/art-26 `[FULL article text; EUR-Lex not fetched]`; Art. 19 SME note: Heuking, https://www.heuking.de/en/news-events/newsletter-articles/detail/online-marketing-pursuant-to-the-digital-services-act.html `[PARTIAL, secondary]`.
S37 KVKK Law 6698, https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6698&MevzuatTur=1&MevzuatTertip=5 — **FAILED ACCESS 2026-09-03 (index shell only)**.
S38 AdsWizz, "AdswizzSDK Reference – iOS" (updated 2026-07-27), https://api.sdk.adswizz.com/ios/index.html `[FULL]`.
S39 AdsWizz, "Insertion Suite", https://www.adswizz.com/publishers/insertion-suite/ `[PARTIAL]`.
S40 Triton Digital, "Advertising Technical Specification" (2023-09-18), https://help.tritondigital.com/docs/advertising-specification ; "Tap (Third-Party Application)", https://help.tritondigital.com/docs/tap-third-party-application ; "Requirements", https://help.tritondigital.com/docs/requirements `[PARTIAL]`.
S41 Audiomob, "Audiomob SDK 10 Has Arrived", https://audiomob.io/blog/audiomob-sdk-10-has-arrived ; "Integrations", https://audiomob.io/integrations `[PARTIAL]`.
S42 Odeeo, "Developers", https://odeeo.io/developers ; "SDK 3.5 Is Here", https://blog.odeeo.io/sdk-3.5-is-here-smarter-integration-dynamic-control-and-elevated-experiences `[PARTIAL]`.
S43 Tenjin & CAS.AI, "Ad Monetization Benchmark Report 2026", https://tenjin.com/blog/ad-mon-gaming-2026/ `[PARTIAL — eCPM tables are images]`.
S44 Playwire, "AdMob eCPM Benchmarks", https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect `[secondary]`.
S45 Playio, "Rewarded Ad Benchmarks for 2026", https://blog.playio.co/rewarded-ad-benchmarks-2026 `[secondary]`.
S46 Adexium, "How to make money on Telegram Mini Apps in 2026", https://adexium.io/blog/how-to-earn-money-telegram-mini-apps-2026 `[secondary]`.
S47 Google, "Understand policy issues, regulatory issues, advertiser preferences, and ad serving statuses", https://support.google.com/adsense/answer/15689616 `[PARTIAL]`.
S48 Google, AdSense start page and earnings calculator, https://adsense.google.com/start/ `[FULL — no numeric output]`.
S49 Nielsen Norman Group, "Annoying Online Ads Cost Business", https://www.nngroup.com/articles/annoying-ads-cost-business/ `[secondary]`.

