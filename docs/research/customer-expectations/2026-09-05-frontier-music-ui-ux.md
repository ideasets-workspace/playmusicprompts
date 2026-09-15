# Standards ledger

| Governing standard | How this run satisfies it | Status |
| --- | --- | --- |
| `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (1,310 lines read from disk this session; marked block 64,383 bytes, sha256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8`, recomputed 2026-09-05) | R4 discovery-first (first external action = 4 parallel broad scoping searches), R8 raw-first captures, R9 five-part records, R10 three-source rule, R11 floors, R15 report schema, R17 read-back | applied |
| `C:\Users\berke\.cursor\rules\00-berk-constitution.mdc` | delivered in full via the always-applied rule channel this turn (carrier digest 0249379f50830bb5); Law Zero applied: every number below carries its source ID and the locator in the opened text | applied |
| `C:\Users\berke\.cursor\rules\10-no-narrowing.mdc` | read from disk this session; the brief listed 7 angles (CONTEXT-02) — all 7 are answered below, each with its own evidence table row; angle coverage count 7/7 | applied |
| Owner order (Berk, 2026-09-05 15:49, verbatim, never corrected) | "EMRİM ŞUDUR DÜNYADA BUGÜNE KADAR YAPILAMAMIŞ EN İLERİ SEVİYEDE uı ux VE KULLANICI DENEYİMİ İSTİYORUM WEN, MOBİL APP VE TABLET APP LERDE. Kullanıcı bir prompt girer ve bizim alanları isterse doldurur ve sonrasında çalan müzik aıkları tüm bugüne kadar develop ettiklerimiz bu arayüzlerde ultra şekilde sunulacak." | preserved |

Path resolution: the parent fixed the report path (CONTEXT-13) to `docs/research/customer-expectations/2026-09-05-frontier-music-ui-ux.md`; captures under `docs/research/_sources/` with prefix `2026-09-05-cx-`. No other file was modified (CONTEXT-16).

Prior in-repo evidence for this axis, read this session (headings + Pandora citation only): `docs/research/customer-expectations/2026-08-13-ai-song-generation.md` (49,642 bytes) and `docs/research/2026-09-03-ads-slice-e-monetisation-web-and-mobile.md` (53,429 bytes). This report does NOT duplicate the 2026-08-13 professional/consumer split; it adds the 2024–2026 UI/UX-specific expectation evidence the parent asked for and re-opens the Pandora primary itself (CONTEXT-18).

# Scope plan / decision served / why / project context

- **Decision served (CONTEXT-01):** which measured user expectations must shape the state design (waiting, empty, error), the prompt-first-versus-control-density hierarchy, the ad-break UX, the tablet layouts and the accessibility floor of PlayMusicPrompts' rebuilt web, phone and tablet surfaces.
- **Why now (CONTEXT-04):** the owner judged the current UI "çöp seviyesinde" and ordered a frontier rebuild; the three design directions must rest on measured expectations, not assumptions.
- **Project context (CONTEXT-03):** prompt-to-music real-time generative player; 101-parameter engine; playlist = 3 takes (one heard, two prepared), buffer ≥ 2, generation at track start and T−90 s, generation takes tens of seconds with no progress stream; skip <10 s = reject; ≥90 % listen = exploit; $0.08/take; Google audio ad breaks 3–5/h after a full listen, banner, no rewarded ads; free visitors 12/h and 40/day; surfaces: web `/`, `/musics`, `/t/<id>`; Flutter Home, Player, Queue, Library, Musics, Studio (101 params), Profile, Login; ONE listening queue; like/playlists/share.
- **Subquestions = the seven angles of CONTEXT-02:** (1) app-store review corpora; (2) forums/communities; (3) peer-reviewed user studies; (4) accessibility user research; (5) tablet-specific expectations; (6) ad-supported listening tolerance; (7) trust/transparency for AI-generated music.
- **Falsifiers:** a review corpus where generation wait or credit anxiety is NOT among the top complaint classes; a labelling study showing AI labels raise engagement; an ad-load experiment showing no listening loss; a tablet corpus where scaled-up phone layouts are praised.
- **Planned artefacts:** 1 report (this file) + raw captures under `_sources/` + 1 capture manifest. Produced: 1 report + 12 captures + 1 manifest (`2026-09-05-cx-source-captures.manifest.json`, 6,459 bytes) — machine-counted in the completion audit.

# Outcome first

1. **The dominant complaint class in generative-music app corpora is not audio quality — it is money and control:** credit expiry / forced renewal / unresponsive billing support (S09, S11, S12, S13, S27, S28, S35) and prompt non-adherence / no way to fix one detail without regenerating (S03, S04, S05, S06, S11, S12). Both are verified across ≥3 independent families. For PlayMusicPrompts this means: the quota/credit state ("12/h, 40/day", subscription state, what happens at expiry) must be a first-class UI object with no surprise, and the player must expose "regenerate / keep melody, change X" affordances rather than a blind re-roll.
2. **Reliability of the player itself is the top-voted mobile complaint:** the three most-helpful Suno Play reviews (369 / 272 / 124 helpful votes, S09, retrieved 2026-09-05, listing updated 2026-09-01) complain that the app "wont load, or it wont play, or it wont pause", that a song "working on" disappears, and that the in-app player cannot shuffle and is not at parity with web. Spotify's 2026 Android redesign produced the same class (infinite skip loop, blank home, S17, S33, S34). Design implication: waiting/generating/failed states must be explicit, recoverable and never silent.
3. **Ad load has a measured, linear, long-run cost:** the Pandora RCT (S01, 34,390,962 listener-observations, 21 months) gives −2.082 % hours (SE 0.1157) and −1.911 % active days (SE 0.0662) per additional audio ad per hour; listeners prefer more frequent but shorter breaks; higher ad load raises paid conversion. `[single-source official-experiment]` — no second RCT exists in the searched scope; the qualitative direction is uncontested.
4. **Trust paradox, verified by three independent families:** 80 % of 9,000 respondents in 8 countries want fully-AI music labelled and 40 % of streaming users say they would skip such music unheard (S08); yet an "AI" label measurably suppresses narrative engagement even on human music (S02, N = 300, F(1, 2091) = 21.03, p < .0001); S07 confirms the label effect across studies while recording null/reversed cases. Implication: label honestly, but frame the product around the user's own prompt and authorship ("your prompt → your track") rather than "AI made this".
5. **Tablet:** users spent years asking for a non-scaled layout; when Spotify shipped side-by-side browsing in April 2026 a measurable minority immediately asked for a toggle back to single-pane and reported the Now Playing pane vanishing on app switch (S20, S21, S22). Implication: adaptive orientation is expected, but forced split-view is not — the Now Playing surface must be a stable, user-controllable region.
6. **Accessibility:** the recurring barriers across streaming players are unlabeled controls, broken focus order, missing dynamic announcements ("track changed"), and regressions shipped by redesigns (S23, S24, S25, S26). A generative player adds a fifth: the generating/prepared state must be announced.

# Framing and falsifiers

The frontier bar is "ultra" presentation of everything the engine already does. The expectation evidence below says users punish opacity (black-box generation, silent failures, credits vanishing) and reward legible control. Anything in the rebuild that hides state or hides cost works against the measured expectations. Falsifiers are listed in the scope plan; none was found in the searched scope, but the label-effect literature contains null/reversed cases (S07) which are preserved in the contradiction ledger.

# Inclusion, exclusion, geography, dates, languages, constraints

- Included: public app-store listings and review pages, public forum threads, peer-reviewed papers and preprints (2023–2026), an official platform survey (Deezer/Ipsos 2025), a university thesis (2026), one open dataset provenance record (WSDM Cup 2019 / MSSD).
- Excluded from load-bearing use: competitor-authored comparison blogs (S38 NeuroBeatX is itself a focus-music vendor), affiliate review sites (S37, S39, S40) — kept in the register as discovery leads only; the student XGBoost paper (IJIREEICE 2025) — synthetic-looking dataset, not opened.
- Geography GLOBAL. Languages reached this session: English, Turkish (Şikayetvar, S13). Japanese/Chinese/Korean/Spanish/Portuguese review corpora: **NOT FOUND IN THE SEARCHED SCOPE** — the one mixed-language query (Q9) returned only Turkish and English results; a dedicated per-language pass was not run within the 60-minute limit and is listed as a gap.
- Dates: newest first; every source carries the date shown on the opened page.
- Access: no login-gated content; Reddit threads were reached only via secondary quotation (Billboard, Music Ally, The Verge, enmlounge mirror) and are marked as such.

# Methodology and exact query/action log

| # | Query / action | Tool | Date/time (UTC+3) | Yield / fate |
| --- | --- | --- | --- | --- |
| Q1 | `Suno app reviews complaints 2025 2026 App Store Google Play credits generation` | web search | 2026-09-05 16:09 | S09 (Play listing), S10 (App Store AU reviews), S35-class billing complaints; secondary S36 |
| Q2 | `AI music generator user study CHI 2025 creativity support agency control Suno Udio` | web search | 16:09 | S03, S04, S05, S06 full texts auto-captured; S37 (excluded) |
| Q3 | `music streaming app UX complaints 2026 Spotify redesign users hate` | web search | 16:09 | S17, S18, S19, S33, S34 |
| Q4 | `Udio review complaints users Reddit r/udiomusic 2025 credits quality` | web search | 16:09 | S14, S15, S16; enmlounge Reddit mirror (de-listed post, discovery only) |
| Q5 | `W3C Media Accessibility User Requirements media player screen reader music app accessibility complaints 2025` | web search | 16:10 | S23, S24, S25, S26; the W3C MAUR document itself was NOT returned — gap recorded |
| Q6 | `listeners attitudes AI-generated music disclosure labelling study 2025 survey perceived authenticity Deezer` | web search | 16:10 | S08 (via S32 lead), S07 full text, S02 lead |
| Q7 | `Spotify sequential skip prediction challenge dataset paper skip behaviour listening context smartphone study ISMIR` | web search | 16:10 | S29, S30, S31 |
| Q8 | `iPad music app layout complaints landscape split view Spotify iPad app phone layout stretched 2025` | web search | 16:10 | S20, S21, S22 + Trusted Reviews (same event) |
| F1 | fetch `https://arxiv.org/abs/2412.05516` | fetch | 16:16 | S01 full text (712 lines) — Pandora primary re-opened by this worker, as CONTEXT-18 requires |
| Q9 | `Wu Holmes narrative listening AI label composer human preregistered 399 participants paper 2026` | web search | 16:16 | S02 Springer full text (282 lines) |
| Q10 | `Suno uygulama yorumları şikayet kredi OR "Suno" アプリ レビュー 不満 クレジット` | web search | 16:16 | S13 (Turkish), S11, S12 (Trustpilot full pages); no Japanese result |
| Q11 | `Endel app review complaints subscription 2025 Brain.fm reviews App Store complaints Mubert app reviews` | web search | 16:16 | S27, S28; S38–S40 secondary (excluded from load-bearing) |
| F2 | fetch Google Play `com.suno.android` | fetch | 16:22 | S09 full listing text |
| F3 | fetch Deezer newsroom 2025-11-12 | fetch | 16:22 | S08 full press release with methodology note |
| R1–R6 | grep-reads of S01, S02, S03, S04, S05, S06 captured texts for N, method, tables | shell | 16:20–16:23 | five-part records below |

Discovery-round marginal yield: round 1 (Q1–Q4) established the universe (4 academic full texts + 3 review corpora + 5 forum threads). Round 2 (Q5–Q8) added accessibility, trust, skip-dataset and tablet lanes (13 new families). Round 3 (Q9–Q11, F1–F3) converted leads into opened primaries (S01, S02, S08, S09) and added Turkish and functional-audio (Endel) corpora; 2 secondary families excluded. Yield was still non-zero at stop; stop was forced by the 60-minute limit, not by saturation — see gaps.

# Universe and coverage ledger

| universe_id | entity / work | why in scope | discovery path | screened | included | gaps |
| --- | --- | --- | --- | --- | --- | --- |
| U-academic | CRPI (Springer), Frontiers Psychology, IJCAI, CHIIR (ACM), arXiv cs.SD/HC, Stockholm University DiVA | user studies on gen-music tools, label effects, skip behaviour | Q2, Q6, Q7, Q9 | 9 | 9 (S01–S07, S29, S30) | CHI/ISMIR/NIME/DIS proceedings not searched by venue name individually; Stanford (Wu) and Reed reached via S02; MIT/CMU/QMUL/KTH/Georgia Tech/Aalto/Toronto/UW **NOT FOUND IN THE SEARCHED SCOPE** for this exact topic — one query per named lab was not run |
| U-official | Deezer newsroom/Ipsos; Google Play listing; Spotify Community (official forum) | platform-run survey; store corpus; vendor-hosted complaints | Q6/F3, Q1/F2, Q3/Q5/Q8 | 3 platforms | 3 | Apple App Store page opened only as a search fragment (S10 [PARTIAL]) |
| U-forums | Reddit r/udiomusic (via Billboard, Music Ally, Verge, enmlounge), Spotify Community, Plex forum, Trustpilot, Şikayetvar | switching triggers, unmet needs | Q3, Q4, Q5, Q8, Q10 | 12 threads/pages | 12 | Suno/Udio Discord public changelogs, Hacker News, Product Hunt **NOT FOUND IN THE SEARCHED SCOPE** (no query returned them; not queried by name) |
| U-frontier-company | Spotify Research, Google, Apple, Meta listening-behaviour research | asked in CONTEXT-07 | Q7 | Spotify only (dataset provenance via S31, S29, S30) | 1 | Google/Apple/Meta first-party listening research **NOT FOUND IN THE SEARCHED SCOPE** |
| U-standards | W3C WAI Media Accessibility User Requirements | accessibility floor | Q5 | 0 returned | 0 | MAUR primary **NOT OPENED** — Q5 returned practitioner/forum evidence instead; gap |
| U-datasets | Spotify Music Streaming Sessions Dataset (WSDM Cup 2019) | skip behaviour provenance | Q7 | 3 | 3 (S29, S30, S31) | dataset itself not downloaded (multi-GB; not needed for this axis) |
| U-non-English | Turkish (Şikayetvar) | GLOBAL scope | Q10 | 1 | 1 (S13) | JA/ZH/KO/ES/PT **NOT FOUND IN THE SEARCHED SCOPE**; not queried per language |

# Source register and read-status counts

| source_id | title / producer | date on page | class | academic? | read status | capture (under `docs/research/_sources/`) / locator |
| --- | --- | --- | --- | --- | --- | --- |
| S01 | Huang, Reiley, Riabov — *Measuring Consumer Sensitivity to Audio Advertising: A Long-Run Field Experiment on Pandora Internet Radio*, arXiv 2412.05516 | this version 2024-08-26 (fetched 2026-09-05 via arxiv.org/abs) | working paper / RCT | yes | [FULL] | `2026-09-05-cx-S01-pandora-ad-load-rct-arxiv-2412.05516.txt` 124,486 B sha256 5b52482e… |
| S02 | Wu S.H. (Stanford) & Holmes K.J. (Reed) — *Is there a "mind" behind the music? Attributing music to AI can suppress narrative meaning-making*, Cognitive Research: Principles and Implications 11 | published 2026-03-02 | peer-reviewed, preregistered | yes | [FULL] | `…S02-wu-holmes-2026-…txt` 40,125 B sha256 797fdb1d… |
| S03 | *AI-Assisted Music Production: A User Study on Text-to-Music Models*, arXiv 2509.23364 | 2025 (arXiv id month 09) | preprint user study | yes | [FULL] | `…S03-ttm-user-study-17-producers-…txt` 38,278 B sha256 542cd23e… |
| S04 | *Evaluating Human-AI Interaction via Usability, UX and Acceptance Measures for MMM-C*, IJCAI 2023 proceedings 0640 | 2023 | peer-reviewed | yes | [FULL] | `…S04-ijcai-2023-mmm-cubase-…txt` 51,202 B sha256 5879797c… |
| S05 | *How AI-music production tools can support the professional user without taking over the process completely*, Stockholm University bachelor thesis (DiVA diva2:2070538), supervisor Tobias Falk | spring 2026 | thesis (grey academic) | yes | [FULL] | `…S05-stockholm-univ-thesis-2026-…txt` 123,155 B sha256 e344377e… |
| S06 | *Opening Musical Creativity? Embedded Ideologies in Generative-AI Music Systems*, arXiv 2508.08805 | 2025 (arXiv id month 08) | preprint, digital ethnography | yes | [FULL] | `…S06-opening-musical-creativity-…txt` 70,133 B sha256 07b20fa9… |
| S07 | *Human–AI emotional resonance in generative music: a mini-review*, Frontiers in Psychology, 10.3389/fpsyg.2026.1889696 | 2026 | peer-reviewed review | yes | [PARTIAL] (abstract + evidence table row Rigole et al. 2025 read) | `…S07-frontiers-psych-2026-…txt` 64,186 B sha256 9d036afb… |
| S08 | Deezer newsroom — *Deezer/Ipsos survey: 97% of people can't tell the difference…* (Ipsos Digital, fielded 2025-10-06..10, n = 9,000 adults 18–65, 8 markets; streaming users n = 6,791) | 2025-11-12 | official platform survey | no | [FULL] page | fetched inline 2026-09-05 16:22; not stored (press release, quoted below) |
| S09 | Google Play listing *Suno – AI Music & Songs Maker* (com.suno.android), Suno Inc. | "Updated on Sep 1, 2026"; header "2.28M reviews", body "2.22M reviews" (both strings present on the page as fetched), "10M+ downloads", "#5 top free music & audio" | official store listing + 3 top reviews with helpful counts | no | [FULL] page | fetched inline 2026-09-05 16:22; star value not rendered in text (search fragment showed 4.8 — [PARTIAL] for the star value) |
| S10 | Apple App Store AU — Suno ratings & reviews page (id6480136315) | undated review text | store reviews | no | [PARTIAL] (search fragment) | apps.apple.com/au/app/suno-ai-songs-music/id6480136315 |
| S11 | Trustpilot suno.com (AU view) | reviews dated 2025 in text | review corpus | no | [FULL] page | `…S11-trustpilot-suno-com-au.txt` 26,270 B sha256 c5b0e50c… |
| S12 | Trustpilot www.suno.ai (NZ view, 277 reviews) | undated summary + reviews | review corpus | no | [FULL] page | `…S12-trustpilot-suno-ai-nz-277-reviews.txt` 24,892 B sha256 4d0e67b9… |
| S13 | Şikayetvar — Suno complaints (Turkish) | complaints dated 2026-02-15, 2026-02-18 | complaint corpus (TR) | no | [PARTIAL] | sikayetvar.com/suno-sunocom/… |
| S14 | Billboard Pro — *Udio-UMG Deal Prompts Reddit Backlash* | 2025 (post-2025-10-29) | trade press quoting r/udiomusic | no | [PARTIAL] | billboard.com/pro/udio-umg-deal-reddit-backlash-legal-claims/ |
| S15 | Music Ally — *Udio faces backlash due to blocking downloads after UMG deal* | 2025-10-31 | trade press quoting r/udiomusic | no | [PARTIAL] | musically.com/2025/10/31/… |
| S16 | The Verge — *Udio users can't download their AI music creations anymore* | 2025-11-22 | press | no | [PARTIAL] | theverge.com/ai-artificial-intelligence/827096/… |
| S17 | Spotify Community — *Spotify free Android app broken after recent redesign* | 2026 (thread td-p/7433058) | vendor forum | no | [PARTIAL] | community.spotify.com/t5/Android/…/td-p/7433058 |
| S18 | Spotify Community — *Fix your atrocious UI mess. Focus on making the core listening experience better.* | 2026 (td-p/7456348) | vendor forum | no | [PARTIAL] | community.spotify.com/…/td-p/7456348 |
| S19 | Android Police — *I paid for music, but Spotify has turned into a YouTube clone* | 2026 | press + reader comment | no | [PARTIAL] | androidpolice.com/spotify-identity-crisis/ |
| S20 | Android Authority — *Your tablet's Spotify app is getting a massive facelift*; Trusted Reviews — *Spotify on the iPad is about to look very different* (2026-04-17) | April 2026 | press (two outlets, one event) | no | [PARTIAL] | androidauthority.com/spotify-tablet-interface-redesign-3658177/ ; trustedreviews.com/news/spotify-on-the-ipad-… |
| S21 | Spotify Community — *New UI on latest iPad OS update* (Now Playing pane disappears; "worst change in UI history") | 2026 (td-p/7396011; iPadOS 18, app 9.1.42.62 quoted) | vendor forum | no | [PARTIAL] | community.spotify.com/t5/iOS-iPhone-iPad/…/td-p/7396011 |
| S22 | Spotify Community Ideas — *Allow us to turn off the split screen on ipad.* | 2026 (idi-p/7432100) | vendor idea board | no | [PARTIAL] | community.spotify.com/t5/Live-Ideas/…/idi-p/7432100 |
| S23 | Brady Gerber — *Music Tech Accessibility: A Screen Reader Audit for Streaming* | 2025 | practitioner audit | no | [PARTIAL] | bradygerber.com/music-tech-accessibility/ |
| S24 | Spotify Community — *Accessibility: Major issue, can't navigate playlist view with screen reader* (NVDA, JAWS) | td-p/6702404 | vendor forum | no | [PARTIAL] | community.spotify.com/t5/Desktop-Windows/…/td-p/6702404 |
| S25 | Spotify Community — *Accessibility: Screen reader accessibility issues for search results* (desktop 1.2.86) | td-p/7396596 | vendor forum | no | [PARTIAL] | community.spotify.com/t5/Desktop-Windows/…/td-p/7396596 |
| S26 | Plex forum — *iOS PlexAmp – Not Accessible to Blind People* (VoiceOver, PlexAmp 4.12.4) | 2025-08-03 | vendor forum | no | [PARTIAL] | forums.plex.tv/t/ios-plexamp-not-accessible-to-blind-people/927882 |
| S27 | Trustpilot endel.io | 2025 (charge dated 2025-09-11 quoted) | review corpus | no | [PARTIAL] | trustpilot.com/review/endel.io |
| S28 | Apple App Store US — Endel reviews (Mac view) | review updated 2026-05-05 | store reviews | no | [PARTIAL] | apps.apple.com/us/app/endel-focus-sleep-sounds/id1346247457 |
| S29 | *Skip prediction using boosting trees based on acoustic features of tracks in sessions*, arXiv 1903.11833 (WSDM Cup 2019) | 2019 | peer-reviewed workshop | yes | [PARTIAL] | `…S29-skip-prediction-boosting-trees-arxiv-1903.11833.txt` 23,692 B sha256 61a22487… |
| S30 | *Why People Skip Music? On Predicting Music Skips using Deep Reinforcement Learning*, CHIIR 2023, doi 10.1145/3576840.3578312 | 2023 | peer-reviewed | yes | [PARTIAL] | `…S30-why-people-skip-music-drl-chiir-2023.txt` 87,314 B sha256 eea326f3… |
| S31 | AIcrowd — Spotify Sequential Skip Prediction Challenge page | 2019 | dataset provenance | no | [PARTIAL] | aicrowd.com/challenges/spotify-sequential-skip-prediction-challenge |
| S32 | Music Business Worldwide — Deezer 50,000 AI tracks/day (same provenance family as S08) | 2025-11 | press | no | [PARTIAL] | not counted as independent |
| S33 | TechBriefly — *Spotify acknowledges Android app freezing and playback issues* | 2026-08-04 | press quoting Reddit + moderator | no | [PARTIAL] | techbriefly.com/2026/08/04/… |
| S34 | PiunikaWeb — *Spotify "Something went wrong" error on Android* (app 9.1.46.1936; moderator ack 2026-05-19) | 2026-05-11, updated 2026-05-19 | press | no | [PARTIAL] | piunikaweb.com/2026/05/11/… |
| S35 | Content IL — *Suno AI: Billing Failures & No Customer Support* (single professional account; 2026-03-11 event) | 2026 | anecdote | no | [PARTIAL] | content-il.com/suno-ai-billing-failure-no-support/ — anecdotal only |
| S36 | AI Tools Guidebook — *Suno Credits Not Refreshing After Renewal* (cites Suno help docs "as of June 2026") | 2026 | secondary how-to | no | [PARTIAL] | discovery lead only |
| S37 | MusicProductionWiki — Mureka review 2026 | 2026 | affiliate/secondary | no | [PARTIAL] | `…S37-…txt` 32,612 B — EXCLUDED from load-bearing |
| S38–S40 | NeuroBeatX (vendor), Nubia Magazine, gohomerelax — Endel/Brain.fm reviews | 2026 | secondary/affiliate | no | [PARTIAL] | EXCLUDED from load-bearing; used only to locate S27/S28 |
| S41 | in-repo `docs/research/customer-expectations/2026-08-13-ai-song-generation.md` | 2026-08-13 | prior project evidence | — | headings read | not re-verified; not cited for numbers |
| S42 | in-repo `docs/research/2026-09-03-ads-slice-e-monetisation-web-and-mobile.md` (cites S01) | 2026-09-03 | prior project evidence | — | Pandora lines read | S01 reopened independently; numbers match (−2.082 / −1.911) |

**Counts (R11.2, deduplicated by provenance family):** independent authoritative families = **28** (S01, S02, S03, S04, S05, S06, S07, S08(+S32), S09, S10, S11+S12, S13, S14, S15, S16, Spotify Community threads counted as ONE platform family (S17, S18, S21, S22, S24, S25), S19, S20 (two outlets, one event = 1), S23, S26, S27, S28, S29, S30, S31, S33, S34, S35). Academic sources = **9** (S01–S07, S29, S30). Academic [FULL] with five-part records = **6** (S01–S06). Primary [FULL] = **10** (S01–S06, S08, S09, S11, S12). Floors (≥20 / ≥5 / ≥5 full): met.

# Findings by subquestion / angle

## Angle 1 — App-store review corpora (S09, S10, S11, S12, S13, S27, S28)

- **Scale of the Suno corpus (S09, fetched 2026-09-05):** listing text shows "2.28M reviews" in the header and "2.22M reviews" in the body, "10M+ Downloads", "#5 top free music & audio", "Updated on Sep 1, 2026". Star value: not present in the fetched text; a search fragment showed "4.8" — reported as [PARTIAL]. Star distribution: **NOT FOUND IN THE SEARCHED SCOPE** (Play does not expose the histogram in page text).
- **The three most-helpful Suno Play reviews (S09, helpful votes as printed):** 369 — "the app wont load, or it wont play, or it wont pause… several little annoyances"; 272 — "the song it's 'working on' dissappears… Might end up canceling my subscription… cleared cache… Nothing."; 124 — "the web version is best… when they're in the player, there's no way to shuffle… subscribed a few times to get the credits needed for binge prompting". Class: reliability of playback + generation state + player parity with web + credit purchasing as a routine.
- **App Store AU (S10, [PARTIAL]):** "you need to use ALL the credits you're given in the time frame, or else you will be robbed when it lapses… minus 2 stars alone"; "when you're deleting songs you aren't given any 'are you sure?' prompt. The interface is very touchy… download a song and slip, you can straight up delete the song"; "rewriting the structure of your lyrics… repeating the song at the end, adding random talking at the end, ignoring prompts". Class: credit expiry, destructive-action safety, prompt adherence.
- **Trustpilot (S11 AU page, S12 NZ page 277 reviews, [FULL] page):** S12's own summary: "Most reviewers were unhappy… customer service responsiveness… accidental payments and unauthorized plan changes… unexpected charges after cancellation… output does not accurately follow prompts, leading to wasted credits… mixing up words or producing incorrect pronunciations". S11: "credits expire after just one month. I had 6,000 credits remaining, and suddenly they were gone without warning"; "1-month plan… hides a forced renewal".
- **Turkish corpus (S13, Şikayetvar, dated 2026-02-15 and 2026-02-18):** paid 1,239.99 TL/month; since 18.02.2026 "söz yazmama rağmen yalnızca müzik oluşuyor ve vokal/söz kısmı gelmiyor"; 414.99 TL credit pack charged, credits vanished; a 9,999.99 TL annual charge made by a child on a stored card without consent. Class identical to the English corpus: billing + silent output regression + no support reply.
- **Functional-audio apps (S27 Endel Trustpilot, S28 Endel App Store):** trial-to-annual conversion without a visible warning ($119.99, $59.99 quoted), inability to find the subscription to cancel, refund page "not eligible", 10-minute free-tier pause perceived as a bug. Class: monetisation opacity dominates even where audio quality is praised.

**Generalisable vs anecdotal:** the *class* (billing/credit opacity; prompt non-adherence; playback reliability) recurs across ≥6 independent families in three languages → generalisable at the class level. Individual amounts and dates are anecdotes and are reported as such.

## Angle 2 — Forums and communities (S14, S15, S16, S17, S18, S19, S21, S22, S33, S34)

- **Switching trigger with the largest footprint in the period: loss of ownership/export.** Udio disabled downloads on 2025-10-29 after the UMG settlement; r/udiomusic reaction quoted by three independent outlets (S14 Billboard, S15 Music Ally 2025-10-31, S16 The Verge 2025-11-22): "I've spent 10+ hours every day for 15+ months… 300+ songs… I'm asking for a time-limited FULL export window"; "hundreds of $$$ and countless hours… you can't just pull the plug and call that a 'transition'"; Udio's compensation was 1,200 credits + 1,000 non-expiring credits (S14). Upvote counts: **NOT FOUND IN THE SEARCHED SCOPE** (Reddit reached only via press quotation).
- **Core-listening-first vs feature bloat (S18, S19):** "Why is the lyrics toggle buried in the Now Playing screen while virtually every other playback control lives in Settings?"; "Spotify is not TikTok… Stop cluttering the interface with gimmicks and focus on making the core listening and discovery experience and UI better" (S18); "there's a silent majority that wants a record player" (S19).
- **Redesign-induced breakage is punished immediately (S17, S33, S34):** blank Home, playlists empty, artwork missing, "songs instantly skip before playback starts… infinite skip loop"; Spotify moderator acknowledged the beta defect 2026-05-19 (S34); Android freezing/slow loading acknowledged 2026-08-04 (S33).
- **Udio generation-quality anger tied to credits (Q4, enmlounge mirror of a de-listed r/udiomusic post, ~1 year old):** "Half my gens are gibberish… Udio should be refunding credits for all the errors" — anecdotal, single post.

## Angle 3 — Peer-reviewed user studies (five-part records: S01–S06)

### S01 — Huang, Reiley, Riabov, Pandora ad-load RCT (arXiv 2412.05516, version 2024-08-26) [FULL]
1. **Problem (authors' framing):** the sensitivity of consumers to advertising load in ad-supported digital content is "an important topic of study" for which no large-scale long-run experiment existed (capture line 35).
2. **Method:** randomised field experiment on Pandora, June 2014–April 2016 (21 months of consistent assignment); 19 % of listeners into ten groups — nine 1 % treatment groups in a 3×3 design (3, 4 or 6 commercial interruptions ["pods"] per hour × 1, 1.5 or 2 ads per pod) plus a 10 % control at the status quo (4 pods × 1.5 ads); mobile apps (Android/iOS) only, ≈80 % of listening at the time; outcomes = total hours (ad-supported + subscription), active days per month, probability of listening at all, probability of buying an ad-free subscription; 2SLS with realised ads/hour instrumented by assignment; clustered (listener-level) SEs (lines 71–83, 176).
3. **Numbers (Table 5, line 188–200):** ads per hour → total hours **−2.082 % (SE 0.1157)**, active days **−1.911 % (SE 0.0662)**, constant 107.6 / 106.9, observations **34,390,962**, first-stage F 157,839.4. Realised ads/hour ranged 2.735–5.021 across groups (Table 3, line 124); highest group received 84 % more ads/hour than lowest (line 118). Demand curve "strikingly linear" (line 172). Long-run elasticity ≈ 3× the one-month estimate (line 11). Holding ad load fixed, "consumers prefer more frequent but shorter ad breaks"; "significant increase in paid subscriptions as ad load increases" (line 57).
4. **Limitations — stated:** experiment on mobile only; realised load differs from assigned load (hence 2SLS); observational methods would have biased estimates (line 59). **Analyst:** 2014–2016 Pandora radio listeners are not 2026 generative-player users; the tracks were full-length label recordings, not ~60 s generated takes; no experiment on ad *placement relative to a track start* exists in the searched scope.
5. **Application here:** the owner's "3–5 audio breaks/h after a full listen" sits inside Pandora's tested 2.7–5.0 ads/h band; each extra ad/hour predicts ≈2 % fewer hours, so the ad-break UI must (a) prefer more frequent SHORT breaks over rare long pods, (b) place breaks only at user-initiated boundaries (after a full listen, never at T−90 s generation time), (c) surface the "why an ad now" state honestly, and (d) offer the ad-free upgrade in the same surface, because higher load measurably converts to paid.

### S02 — Wu & Holmes 2026, CRPI, "Is there a 'mind' behind the music?" [FULL]
1. **Problem:** narrative listening (imagining a story while music plays) "requires some form of common ground between composer and listener"; if listeners believe the composer is an AI, that common ground may be absent (abstract, line 14).
2. **Method:** two preregistered studies. Study 1: 99 US adults (MTurk via CloudResearch; 22 excluded) heard six human-composed instrumental MIDI pieces (Beethoven, Mozart, Debussy, Ravel among them) unlabeled, reported narrativity (SRQ, 0/1), narrative engagement (NE) and composer-intuition ratings (line 36, 46). Study 2: 300 participants (40 excluded), eight clips — four human, four AIVA-generated, piano timbre matched — each labelled "Composer: Human" or "Composer: AI" centrally while playing; measures SRQ, NE, communicative intention, five impression items (1–6); preregistered linear mixed-effects models (lines 86–98).
3. **Numbers:** Study 2 narrative engagement main effect of label **F(1, 2091) = 21.03, p < .0001, η²p = .01**; AI-labelled **M = 3.23 (SD 1.15)** vs human-labelled **M = 3.42 (SD 1.15)** (line 108). Narrativity main effect F(1, 6.36) = 12.67, p = .01, η²p = .67 (Springer page). Power > 99 % for η²p = .03 (line 86). Effect nominally stronger for actual AI compositions (line 122).
4. **Limitations — stated:** two earlier cover-story studies were underpowered and are reported as preliminary (line 112); acoustic markers of AI may co-drive the effect; semantic content of narratives did not change (line 124). **Analyst:** US-only, instrumental classical/AIVA stimuli, short clips; the effect size on engagement is small (η²p = .01) though robust.
5. **Application here:** an "AI-generated" badge as the *hero* label of a track measurably lowers engagement. Label truthfully (S08 says users want it) but make the *user's prompt and choices* the visible authorship object ("Your prompt: …", "Your settings: …") so the communicative intention the listener looks for is theirs.

### S03 — arXiv 2509.23364, TTM user study with 17 producers [FULL]
1. **Problem:** TTM models "still struggle to interpret musicians' controls" and their integration into workflows is underexplored (line 28).
2. **Method:** custom tool = MusicGen (three sizes, duration and prompt controls) + HT Demucs 6-stem separation; 17 international producers from 7 countries (8 Italy, 2 India, 2 USA, 2 China, 1 each Korea/Greece/Spain; 4 in person, 13 via Zoom); pre/post questionnaires adapted from prior CSI-style instruments + Goldsmiths MSI; semi-structured interviews; thematic analysis (lines 32, 40–65).
3. **Numbers:** experience 10.5 % >5 y, 42.1 % 3–5 y, 21.1 % 1–3 y, 26.3 % <1 y; DAWs Logic 35.7 %, Ableton 28.6 %, Reaper 14.3 %; 76.5 % had used AI tools before; **94.12 % would use the tool "during the ideation phase"**, 47.06 % for variations/experimentation, 35.29 % composition/arrangement; 52.94 % strong interest in AI source separation, 41.18 % only in specific scenarios, 5.88 % prefer manual (lines 71, 98–100). Perceptions of control "varied" (Fig. 4).
4. **Limitations — stated:** small N, open-source models rather than Suno/Udio (deliberately, for reproducibility), single session. **Analyst:** producers, not listeners; percentages on N = 17 are ±~12 pp per respondent.
5. **Application here:** the Studio (101 params) should expose exactly the controls the participants asked for by name — **tempo/BPM alignment, key selection, loop/segment duration, multi-modal prompts** (lines 106) — and the player should present a generated take as a *sketch to steer*, not a finished artefact.

### S04 — IJCAI 2023, MMM-Cubase usability with 18 expert composers [FULL]
1. **Problem:** market generative-music tools lack "affordances in designing their interfaces for practical scenarios"; MMM-C tests a "1-parameter" plugin inside Cubase (line 32).
2. **Method:** 3-part mixed-method remote unmoderated study; 8 hobbyist + 10 professional expert composers from Steinberg's beta pool (34 onboarded, 18 completed ≥1 task); three tasks (arrangement, variation, original, 16 bars); SUS, adapted CSI (one statement per factor, 5-point), TAM-style acceptance, open coding (lines 52–93).
3. **Numbers:** **SUS Task 1 = 73.75 (SD 10), Task 2 = 75.71 (SD 11.59), Task 3 = 71.43 (SD 14.48)** — all "acceptable" (>70); enjoyment highest CSI factor **3.85 (SD 0.66)**; no significant hobbyist/professional difference except task-friendliness Task 1 5.94/10 (SD 0.75) vs Task 3 (line 103–113). Demographics: 17/18 male; 16/18 self-identified expert.
4. **Limitations — stated:** small sample, beta-tester pool, single DAW. **Analyst:** symbolic MIDI, not audio; 2023 model.
5. **Application here:** the paper's central tension — "easy to use" (SUS >70) yet "participants struggle with steering the tool… any type of parameters makes it feel like a more random process than a creative one" (line 103–109) — is the exact prompt-first-vs-control-density decision the parent must make; the evidence says: keep the first surface one-parameter simple, but make steering discoverable one gesture away.

### S05 — Stockholm University thesis 2026 (Suno, Udio, Stable Audio, Lyria 3.0 with 5 professional artists) [FULL]
1. **Problem:** tools "heavily marketed to professional artists… function in practice as unpredictable 'Black-boxes' that force the user into a 'trial-and-error' approach rather than actually having control" (line 169).
2. **Method:** qualitative; five professional artists (≥1 year active) in different genres; task-based interaction sessions (produce music in their own signature style) followed by semi-structured interviews; thematic analysis; ISO 9241 usability framing; Norman's gulf of evaluation applied to prompt-to-song (lines 21, 227, 273–285).
3. **Numbers:** none quantitative beyond N = 5 and 4 tools; results are thematic: "ease of usability does not necessarily equate to high-value outputs"; "if an unwanted detail occurs, the user cannot trace it to a parameter and correct it" (line 227). Cites a 2024 analysis of >11,000 reviews of generative-AI apps (Alabduljabbar 2024) — not opened here, [ABS] via S05.
4. **Limitations — stated:** N = 5, professionals only, no IP/legal analysis. **Analyst:** bachelor-level thesis; strong on mechanism, weak on generalisability.
5. **Application here:** the "gulf of evaluation" must be closed in the UI: after a take plays, show *which of the user's fields produced which audible property* (the 101 params become an explanation surface, not just an input surface), and offer "change only this" regeneration.

### S06 — arXiv 2508.08805, "Opening Musical Creativity?" (digital ethnography of Suno/Udio/Stable Audio/… communities) [FULL]
1. **Problem:** "unlocking musical creativity" is the dominant marketing narrative; the paper tests it against user discourse (line 28).
2. **Method:** three stages — autoethnography (Jordanous 14-point creativity framework), digital ethnography of company rhetoric, digital ethnography of the four systems' Discord communities (Reddit minor) with targeted keyword searches; Braun & Clarke thematic analysis, constructivist epistemology (lines 49, 83, 109–139).
3. **Numbers:** qualitative; corpus size given as "at least one post per minute" on Discord (footnote 14, line 129); no counts of themes.
4. **Limitations:** Discord-heavy, self-selected enthusiasts; no listener population. **Analyst:** confirms the control paradox from the user side — randomness "viewed as both creatively essential, and a barrier to control" (§4.3.3).
5. **Application here:** the community wants *surprise* AND *steerability* — design the take-selection surface (3 takes: one heard, two prepared) as the place where surprise lives, and the field editor as the place where control lives; do not blend them.

## Angle 4 — Accessibility user research (S23, S24, S25, S26)

Recurring barriers (S23 audit table): unlabeled buttons ("Play" reads as "Button"), inconsistent focus (cursor jumps from search bar to unrelated region), nonstandard components (custom sliders/modals undetectable), no announcements for dynamic changes ("Song added to library"). Regressions shipped by redesigns: Spotify desktop 1.2.86 removed headings/landmarks from search results so NVDA/JAWS users lost navigation (S25); playlist view became non-navigable after a column-chooser button was added (S24); PlexAmp iOS entirely unusable with VoiceOver while the main Plex app was usable (S26, 2025-08-03). The W3C MAUR primary was **not opened** (Q5 did not return it) — floor definitions below therefore rest on S23 + the project's own rule 14 (WCAG 2.2 AA floor), and this is flagged as a gap.

## Angle 5 — Tablet-specific expectations (S20, S21, S22)

Spotify's April 2026 tablet redesign (S20, two outlets) introduced adaptive orientation, a collapsible sidebar and side-by-side "parallel browsing" after years of a scaled-up phone layout that was "usable but not a great experience". Within weeks: "The Now Playing section just completely disappears when you're in either landscape or portrait mode, switch to a different app, and switch back" (S21); "Can't stand the split screen on iPad. Allow us to turn it off and go back to the single screen" (S22, idea board). Expectation: use the space, but keep Now Playing stable and let the user choose density.

## Angle 6 — Ad-supported listening tolerance (S01)

Covered in the S01 five-part record. Spotify ad-tier satisfaction studies: **NOT FOUND IN THE SEARCHED SCOPE** (no query returned a primary; not queried by name within the time limit).

## Angle 7 — Trust and transparency (S08, S02, S07, S06)

S08 (Ipsos for Deezer, n = 9,000, 8 countries, fielded 2025-10-06..10): **97 %** failed a 3-track blind test; **52 %** uncomfortable at not being able to tell; **80 %** want 100 %-AI music clearly labelled; **73 %** of streaming users want to know if a service recommends it; **45 %** want a filter; **40 %** say they would skip 100 %-AI music without listening; **66 %** would listen once out of curiosity; **69 %** think payouts should be lower. Deezer reports ~50,000 fully-AI tracks/day = 34 % of deliveries, ~0.5 % of streams, up to 70 % of those streams fraudulent. S02 shows the label itself lowers engagement; S07 (mini-review) records "lower liking, perceived quality, authenticity, or engagement when music is attributed to AI, although null and occasionally reversed label effects have also been observed"; S06 shows makers frame AI as "a collaborator who will take my direction".

## Skip behaviour (dataset lane, S29, S30, S31)

S29 relays "According to reports by Spotify [7], a track has a 24 % likelihood of being skipped in the first 5 seconds and 35 % of being skipped before 30 seconds" — `[single-source, relayed]`: the Spotify report itself was not opened. S30 (CHIIR 2023) on the MSSD (≈150 M sessions, 66 days, 10–20 tracks/session, no user IDs) finds users' behaviour features are most discriminative and documents a temporal data-leakage problem in the dataset. Relevance to the owner's <10 s reject rule: the 5-second skip mass is real at Spotify scale; the UI must make the first 5–10 seconds of a generated take legible (what am I hearing, what changes if I skip).

## Five-part academic records — index

S01 (RCT, N = 34,390,962 obs), S02 (preregistered, N = 99 + 300), S03 (N = 17 producers), S04 (N = 18 expert composers), S05 (N = 5 professional artists), S06 (Discord ethnography) — all six recorded above in Angle 3 with parts 1–5 and line locators into the captured texts.

# Claim cross-verification and independence ledger

| claim_id | exact claim / scope | type | sources (independent families) | independence rationale | support status | freshness | flag |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Credit/quota expiry, forced renewal and unresponsive billing support are the dominant *complaint class* for consumer generative-music apps (2025–2026) | SOURCE CLAIM (class) | S10 (Apple), S11+S12 (Trustpilot), S13 (Şikayetvar, TR), S27+S28 (Endel, two stores), S35 | four platforms, three languages, two products | verified 3+ | 2026-09 | — |
| C2 | Users cannot steer output to intent (prompt non-adherence; no "fix one detail" path) and this is the dominant *product* complaint and the central academic finding | SOURCE CLAIM | S03, S04, S05, S06 (academic), S10, S12 (corpora) | four research groups + two review platforms | verified 3+ | 2026 | — |
| C3 | Each additional audio ad per hour reduces listening hours by 2.082 % and active days by 1.911 %; listeners prefer more frequent shorter breaks; higher load increases paid conversion | PRIMARY FACT (experiment) | S01 only (S42 in-repo relays S01) | unique RCT | supported by the primary | 2014–2016 data, 2024 paper | `[single-source official-experiment]` |
| C4 | Listeners want fully-AI music labelled (80 %) AND an AI label lowers engagement even on human music | PRIMARY FACT + SOURCE CLAIM | S08 (Ipsos n = 9,000), S02 (preregistered N = 300), S07 (review of multiple studies) | platform survey, university experiment, independent review | verified 3+ | 2025-11 / 2026-03 | contradiction recorded (K2) |
| C5 | Listeners punish feature bloat that hides core playback; "core listening first" is the stated expectation | SOURCE CLAIM (anecdotal class) | S18, S19 (+ reader comment), S33 | forum, press, press | verified 3+ (anecdotal strength) | 2026 | — |
| C6 | Tablet users reject scaled-up phone UIs but also reject forced split-view; Now Playing must stay stable across app switches | SOURCE CLAIM | S20 (two outlets), S21, S22 | press + two forum threads | verified 3+ | 2026-04..05 | contradiction recorded (K3) |
| C7 | Streaming-player accessibility failures cluster in unlabeled controls, focus order, missing live announcements, and redesign regressions | SOURCE CLAIM | S23, S24, S25, S26 | practitioner audit + two Spotify threads + Plex thread | verified 3+ | 2025 | MAUR primary not opened |
| C8 | ~24 % of Spotify tracks are skipped within 5 s and 35 % before 30 s | SOURCE CLAIM (relayed) | S29 citing Spotify report [7] | one relay | supported only by relay | 2019 | `[single-source, relayed]` |
| C9 | Removal of download/export after the Udio–UMG deal caused a mass switching trigger; users expect ownership/export of what they generated | SOURCE CLAIM | S14, S15, S16 | three outlets independently quoting r/udiomusic | verified 3+ | 2025-10/11 | upvote counts not found |
| C10 | Playback/generation reliability defects ("won't play/pause", generation disappears, infinite skip) are the top-voted mobile complaints | SOURCE CLAIM | S09 (helpful counts 369/272/124), S10, S17, S33, S34 | store + forum + press across two products | verified 3+ | 2025–2026 | — |
| C11 | 94.12 % of producers would use TTM in the ideation phase | PRIMARY FACT | S03 | N = 17, one study | supported | 2025 | `[single-source]` |
| C12 | 40 % of streaming users would skip 100 %-AI music unheard; 45 % want a filter | PRIMARY FACT | S08 | Deezer-commissioned Ipsos survey | supported | 2025-10 | `[single-source official]` |
| C13 | The 2026 Suno Play listing shows 2.22–2.28 M reviews, 10 M+ downloads, updated 2026-09-01 | PRIMARY FACT | S09 | store listing | supported | 2026-09-05 | `[single-source official]`; star value [PARTIAL] |

Counts: **verified 3+ = 8** (C1, C2, C4, C5, C6, C7, C9, C10); **single-source = 5** (C3, C8, C11, C12, C13); **unverified = 0** (nothing below is asserted without an opened source; items not found are named as NOT FOUND, not asserted).

# Contradictions, corrections, retractions, uncertainty, and gaps

| id | contradiction / gap | sources | resolution |
| --- | --- | --- | --- |
| K1 | More control vs simpler prompts: producers ask for BPM/key/duration controls (S03) and experts say a 1-parameter tool "feels like a more random process than a creative one" (S04), yet the same S04 users score the 1-parameter UI SUS >70 and community users prize randomness as "creatively essential" (S06); the owner's order is prompt-first with optional fields | S03, S04, S06, owner order | preserved, not averaged: the evidence supports a two-layer surface — prompt-first + one-gesture-away steering — and says nothing about hiding the 101 params permanently |
| K2 | 80 % want AI labelled (S08) vs the label itself suppresses engagement (S02); S07 notes null and reversed label effects in some studies | S08, S02, S07 | preserved; design implication is truthful labelling with user-authorship framing; the size of the engagement penalty in a prompt-authored context is **unmeasured** |
| K3 | Tablet users demanded a non-scaled layout for years, then a measurable minority rejected the split-view that answered it | S20 vs S21/S22 | preserved; implication is user-controllable density and a stable Now Playing region |
| K4 | S09 page shows two different review counts (2.28M header, 2.22M body) on the same fetch | S09 | reported as seen; not reconciled |
| G1 | Star-rating distributions for any app: not exposed in page text | S09, S10 | NOT FOUND IN THE SEARCHED SCOPE |
| G2 | Reddit upvote counts for feature requests | S14–S16 | NOT FOUND (Reddit reached only via press) |
| G3 | W3C MAUR primary; Spotify ad-tier satisfaction study; Google/Apple/Meta first-party listening research; CHI/ISMIR/NIME/DIS proceedings searched by venue; JA/ZH/KO/ES/PT review corpora; Suno/Udio Discord changelogs; Hacker News; Product Hunt | — | NOT FOUND IN THE SEARCHED SCOPE — not queried by name within the 60-minute limit; listed for the parent's next round |
| G4 | No study measures wait-time tolerance for tens-of-seconds generation with no progress signal | — | NOT FOUND IN THE SEARCHED SCOPE; the closest evidence is the "song 'working on' disappears" review class (S09) and the black-box/gulf-of-evaluation finding (S05) |

# Synthesis — adopt / build / avoid

- **ADOPT** truthful state exposure everywhere: quota/credit state, generation state, ad-break reason, AI-origin label (C1, C4, C10).
- **BUILD** a two-layer control model (prompt-first + one-gesture steering with BPM/key/duration named first), a "change only this" regeneration path, an explanation surface mapping fields → audible result, and a stable user-controllable Now Playing region on tablet (C2, C6, K1, K3).
- **AVOID** silent failures, destructive actions without confirmation (S10), credit expiry without warning, forced split-view, ad breaks at generation time or mid-track, and "AI made this" as the hero label (C1, C3, C4, C6, C10).

# Committed recommendation

Design the three directions around **legibility of state and authorship**: the user's prompt + fields are the visible author; every wait, quota and ad is explained in place; steering is one gesture away from a one-field first screen. Falsifier: a corpus showing users prefer opaque one-shot generation and tolerate silent credit loss — none found.

# Expectation → design implication

| expectation | evidence IDs | strength | implication for web / phone / tablet |
| --- | --- | --- | --- |
| Know exactly what my credits/quota are, when they expire, and never be charged or drained silently | C1: S10, S11, S12, S13, S27, S28 | generalisable (class, 4 platforms, 3 languages) | Web+phone+tablet: persistent quota object ("12/h · 40/day · resets at …", subscription state) on Home and Player; expiry warnings ahead of time; every paid action confirms cost |
| Generation must never disappear or fail silently; playback must not stall | C10: S09 (369/272 helpful), S17, S33, S34 | generalisable | Explicit generating / prepared / failed / retry states on the queue and player; the 3-take buffer visualised; failure copy names the cause and the recovery |
| Let me steer, not re-roll | C2: S03, S04, S05, S06, S12 | generalisable | Prompt-first first screen; steering (BPM, key, duration first) one gesture away; "regenerate keeping X" actions; explanation of which field produced which audible result |
| Keep surprise, but keep it separate from control | S06, S04 | generalisable (qualitative) | Take-selection surface = surprise; field editor = control; do not blend |
| Ads: fewer per hour, shorter and more frequent, only at boundaries, with the paid exit visible | C3: S01 | single-source RCT (uncontested direction) | Audio breaks only after a full listen; short pods; in-place "why an ad now" + upgrade affordance; never at T−90 s or mid-take |
| Tell me if it is AI, but do not make "AI" the headline | C4: S08, S02, S07 | generalisable | Truthful origin label in metadata; hero = "Your prompt / your track"; per-track provenance sheet |
| Core listening first; no clutter | C5: S18, S19, S33 | anecdotal class | Player and Home carry playback + prompt; secondary features behind clear entry points |
| Tablet: use the space but let me choose, and never lose Now Playing | C6: S20, S21, S22 | generalisable | Adaptive orientation; sidebar collapsible; Now Playing pinned and restored after app switch; single-pane toggle |
| Screen-reader usable, focus-stable, state announced | C7: S23, S24, S25, S26 | generalisable | Every control labelled; logical focus order incl. queue; live-region announcements for track change, generation ready, ad start; regression test before every redesign |
| Destructive actions need confirmation | S10 | anecdotal | Delete/remove-from-queue behind confirm or undo on all three surfaces |
| I own what I made — export/download must not vanish | C9: S14, S15, S16 | generalisable (event-level) | Download/share/export visible on `/t/<id>` and Library; any change to export rights announced with a window |
| The first 5–10 s decide the skip | C8: S29 (relayed) + owner rule | single-source relayed | Make the take's identity legible in the first seconds (prompt echo, field chips, waveform) so the <10 s reject is informed |

# Artifact index and produced-vs-planned count

Planned: 1 report + N captures + 1 manifest. Produced: this report; 12 captures `docs/research/_sources/2026-09-05-cx-S{01,02,03,04,05,06,07,11,12,29,30,37}-*.txt`; manifest `docs/research/_sources/2026-09-05-cx-source-captures.manifest.json` (6,459 bytes). No other file modified.

# Completion audit

- Covenant read in full; block sha256 recomputed = 07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8 (64,383 bytes).
- Floors: 28 independent families ≥ 20; 9 academic ≥ 5; 6 academic [FULL] with five-part records ≥ 5; 10 primary [FULL].
- Claims: 8 verified 3+, 5 single-source (flagged in place), 0 unverified.
- Angles: 7/7 answered; gaps named per angle, not silently dropped.
- Read-back hash of this file: recorded in the worker's return message (computed after the final write).



---

# EXTENSION 1 — follow-up run, 2026-09-05 (appended; nothing above this line was altered)

Written 2026-09-05 13:58–14:10 UTC under the same covenant (COVENANT_SHA256 07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8). The parent's six follow-up items are answered in order. Every number below was read from a capture on disk in `docs/research/_sources/` during this run; the capture file name is the evidence pointer. Translations from JA/ZH-TW/KO/ES/PT-BR/DE are MINE and are marked `[my translation]`.

## E1.0 Source register — additions (S101–S121)

| ID | Source (title, venue, date) | Type | Read | Capture (sha256 prefix, bytes) |
|---|---|---|---|---|
| S101 | Buell & Norton, "The Labor Illusion: How Operational Transparency Increases Perceived Value", *Management Science* 57(9):1564–1579, Sept 2011, doi:10.1287/mnsc.1110.1376 | academic, peer-reviewed | [FULL] | `cx-S101-…` 83b87be4bd320f1a, 83,382 B |
| S102 | Wang, Kang, Rau (Peking U / Tsinghua U), "The Magic of Slow-to-Fast and Constant: Evaluating Time Perception of Progress Bars by Bayesian Model", arXiv preprint, 2022-11-25 | academic preprint (not peer-reviewed) | [FULL] | `cx-S102-…` a56030bb7986b5ab, 39,339 B |
| S103 | Copenhagen Business School master's thesis on waiting-screen design and perceived waiting time (38-s wait, N=461) | grey literature (thesis, not peer-reviewed) | [FULL] | `cx-S103-…` 6bcb7e4fe90bf782, 304,045 B |
| S104 | "While We Wait: …" — user perceptions of waiting time and generation cues in AI image generation, CHI EA 2025, doi:10.1145/3706599.3719725 | academic, peer-reviewed (extended abstract) | [FULL] | `cx-S104-…` 8a8f83900e81d95f, 48,811 B |
| S105 | Grokipedia "progress bar" article | tertiary — EXCLUDED from floors, not cited for any claim | [PARTIAL] | `cx-S105-…` dffa55059a063787, 32,628 B |
| S106 | Material Design 3 — Progress indicators guideline page | first-party guidance — **CAPTURE FAILED**: the fetched body is the HTML/CSS shell only; 0 guidance sentences matched `determinate|indeterminate|wait|loading` (measured this run). NOT usable; no claim rests on it. | n/a | `cx-S106-…` f8684e2e95380d22, 58,513 B |
| S109 | W3C, *Media Accessibility User Requirements* (MAUR), W3C Working Group Note, 3 December 2015 | standards primary | [FULL] | `cx-S109-…` eb340b3440ee6d18, 74,626 B |
| S110 | Spotify Q2 2026 earnings call transcript (relayed by The Globe and Mail's transcript page; Spotify's own IR PDF was NOT fetched) | industry primary, relayed copy | [FULL] | `cx-S110-…` 0d3f60e0fafbfb75, 64,017 B |
| S111 | Mäntymäki & Islam, "Gratifications from using freemium music streaming services: Differences between basic and premium users", ICIS 2015 (UTUPub copy) | academic, peer-reviewed conference | [PARTIAL] — abstract, introduction and results paragraphs read; not the full method section | `cx-S111-…` 7d67d689e19dd861, 53,736 B |
| S112 | Frontiers review on AI/automation in digital music-streaming-platform subscription responses | academic review | [ABS] — captured, not read beyond title/abstract | `cx-S112-…` 1369981c0e086dcc, 92,255 B |
| S113 | *Scientific Reports* paper on music-streaming churn prediction with attention-graph deep learning | academic | [ABS] — captured, not read beyond title/abstract | `cx-S113-…` 1e36fa7529aa936e, 54,163 B |
| S120 | Google Play reviews for Suno (`com.suno.android`) via the Play `batchexecute` review RPC, 40 reviews per locale, sorted most-relevant, locales ja-JP, zh-TW, ko-KR, es-ES, pt-BR, de-DE, fetched 2026-09-05 13:54 UTC | public review corpus | [FULL] (all 240 records opened) | six files `cx-S120-play-suno-reviews-<hl>.json`, 10,148–30,130 B each |
| S121 | Apple App Store "most helpful" customer-review RSS (`itunes.apple.com/<cc>/rss/customerreviews/id=<id>/sortby=mosthelpful/json`) for Suno 6480136315, Udio 6511211165, Mubert 1154429580, Endel 1346247457 in jp, tw, kr, es, br, de, cn; plus a Chinese-storefront "suno ai" 6746319213 by a third-party publisher; fetched 2026-09-05 13:54 UTC | public review corpus | 27 of 28 feeds returned **0 entries** (feed envelope only, 863–880 B); udio/kr returned 2 entries | 28 files `cx-S121-appstore-<app>-<cc>-<id>-mosthelpful.json` |
| S122 | Hacker News launch threads via the Algolia HN API: Suno item 39746163 (2024-03-18) and Udio item 39993930 (2024-04-10), full comment trees | public forum corpus | [FULL] (comment trees walked by regex) | `cx-hn-suno-launch-39746163.json` a5a49bffc74d6421, 110,057 B; `cx-hn-udio-launch-39993930.json` 51b94676284852b4, 65,547 B |
| S123 | Google Play listing HTML for Suno (raw), fetched 2026-09-05 13:46 UTC — used only for the star histogram | listing page | [FULL] for the histogram `aria-label`s | `cx-play-suno-raw.html` cb820470581762de, 1,282,303 B |

**Not fetched this run (so not cited):** Nielsen Norman Group's response-time article and Apple HIG "Progress indicators" page. Both are relayed inside S103 and S104 as citations ([20] in S104 = NN/g; Nielsen 1993 in S103) and are reported below as relays, never as primaries.

## E1.1 Item 1 — Wait-time tolerance for tens-of-seconds generation (PMP: 42–92 s per track, median ≈60 s)

### Five-part record — S101 Buell & Norton 2011 [FULL]
1. **Problem (authors' framing):** does showing the labour a service performs ("operational transparency") raise perceived value even when the outcome is identical and the customer must wait for it?
2. **Method:** three between-participants experiments on a rebranded travel-search interface. Exp 1 N=266 online (M_age 35.8, 26% male), transparent vs blind conditions × wait lengths; Exp 2 N=118 laboratory, choice between an instantaneous service and a waiting service at 30 s and 60 s; Exp 3 N=143 online, transparent vs "list" vs blind at 30 s.
3. **Numbers:** Exp 1 — main effect of transparency F(1,212)=10.68, p<.01; value M=5.36 (SD 0.79) with transparency vs lower without; wait-time main effect F(5,212)=4.47, p<.01 (value trends down with time); no interaction F(1,212)=0.55, p=.73, i.e. transparency lifts value at every wait length. Exp 2 — participants **preferred the waiting service over the instantaneous one 62% (30 s) and 63% (60 s) when the wait was transparent; 42% (30 s) and only 23% (60 s) when blind.** Exp 3 — perceived effort: transparent M=5.19 > list M=4.43 (t(62)=2.54, p<.01) > blind M=3.44 (t(41)=2.21, p<.05).
4. **Limitations:** travel-search domain, 2011, lab/online panels, waits ≤60 s; reciprocity/effort mechanism tested by self-report.
5. **Application to PMP:** a 60-s wait is *exactly* the longest condition tested, and at 60 s a blind wait drove preference to 23% while a transparent wait held 63%. PMP's staged modal must therefore show *what the engine is doing* (labelled stages: prompt analysis → arrangement → rendering → mastering) and not a bare spinner or a bare percent bar.

### Five-part record — S102 Wang, Kang & Rau 2022 (preprint) [FULL]
1. **Problem:** which progress-bar velocity profile is *perceived* as fastest for a fixed real duration?
2. **Method:** Bayesian adaptive point-of-subjective-equality (PSE) measurement; a constant 5-s bar compared against four non-constant-speed 5-s bars, 40 trials per bar, with eye tracking; small lab sample (the abstract names the design; the participant count is inside the body and I did not extract it — [PARTIAL on N]).
3. **Numbers:** constant and speed-up (slow-to-fast) bars are perceived as the quickest; the anchoring effect fits: **the final segment of the bar dominates time perception**.
4. **Limitations:** 5-s waits only, preprint, 0 citations at capture, single institution.
5. **Application:** if PMP shows a determinate bar it must **never decelerate near the end** (the classic "99% stall" is the worst case for perceived speed); either keep it constant or let the last stage move visibly faster than the earlier ones.

### Five-part record — S103 CBS thesis (grey literature) [FULL]
1. **Problem:** which waiting-screen designs shorten perceived waiting time (PWT) at a long, fixed wait?
2. **Method:** online experiment, 38-second wait chosen because the literature's average tolerable wait *with* progress-bar feedback is ≈38 s (Nah 2004, relayed), six designs, N=461 valid of 498 (Prolific), 70–85 per condition; hypotheses H1–H9 across expectation-confirmation, attention-gate and emotion theories.
3. **Numbers:** H1 supported — positive temporal contrast (bar finishing sooner than expected) shortens PWT; the tested velocity manipulations failed to evoke that contrast (H2 not supported); hedonic/entertaining element showed no significant PWT difference (M 3.01 vs 3.24, t(450.36)=1.23, p=.2188).
4. **Limitations:** thesis, not peer-reviewed; single 38-s duration; self-reported PWT.
5. **Application:** entertaining filler during PMP's wait is *not* evidence-backed; **setting a conservative expectation and beating it** is (announce "about 90 seconds", deliver at 60). Do not promise the median.

### Five-part record — S104 CHI EA 2025 "While We Wait" [FULL]
1. **Problem:** how do users perceive waiting and "generation cues" while an AI image generator works (the only 2023–2026 study of waiting for generative output that this run found).
2. **Method:** 11 semi-structured Zoom interviews, Dec 2024–Jan 2025, Prolific recruits, hands-on with three tools (Canva, Google Gemini, Bing Image Creator).
3. **Findings (qualitative; no inferential statistics):** users **accept and even value the wait** as inherent to a creative act; they **associate a longer wait with higher quality** ("effort signalling", anthropomorphising the model); they **rarely notice the generation cues**; acceptance breaks when the wait **exceeds their expectation** ("a little bit slower than I thought", P5) — the paper cites NN/g's 10-s attention threshold [20] and percent-done research as the baseline it departs from.
4. **Limitations:** N=11, images not music, interview self-report, vendor tools with short (seconds) waits.
5. **Application:** for PMP, framing the 60-s wait as *composition effort* is consistent with S101 and S104; the risk is the expectation gap — the UI must state the range up front, and the "Prepared takes" state must land *inside* the stated range.

### First-party guidance status
- Material 3 progress indicators (S106): **capture failed** (HTML shell). Not cited.
- Nielsen Norman Group 10-s limit and Apple HIG: **not fetched this run**; NN/g is relayed by S104 [20] and Nielsen 1993 by S103. Relay only.

### Design implication for Prompt → Prepared-takes (synthesised from S101–S104)
1. **Staged, labelled transparency, not a spinner** (S101: 63% vs 23% at 60 s). Each stage names the work being done on the user's behalf.
2. **State the range before starting** ("Usually 45–90 s") and **beat it** (S103 H1; S104 expectation break). Never show a median that half of runs will miss.
3. **If determinate, constant or accelerating — never a terminal stall** (S102 anchoring on the last segment).
4. **No hedonic filler as a substitute** for 1–3 (S103: no significant effect).
5. **Frame the wait as composition effort** (S104), which the "Prepared takes" language already does; keep the user able to leave and return (S103 relays multi-tasking as the purpose of a progress bar).

## E1.2 Item 2 — W3C Media Accessibility User Requirements (S109, W3C Note 2015-12-03) [FULL]

MAUR is written for time-based media in user agents; the requirements below are the ones that bind an *audio* player with instrumental output (captions and sign language do not apply, and are recorded as n/a):

- **§3.1 Access to interactive controls/menus** — every interaction possibility of a media element must be available to all users, including those who use assistive technology; the note names control of **playback rate** and **content navigation on the same level (next/prev) and between levels (up/down)** as "a particularly important requirement on mobile devices or devices without a keyboard". → PMP transport (play/pause, next/prev, seek) must be reachable by keyboard and exposed to AT on every form factor.
- **§3.3 Time-scale modification** — "a standard control API must support the ability to speed up or slow down content presentation without altering audio pitch". → playback-rate control with pitch preservation is a stated user requirement, not a nicety.
- **Content navigation [CN-1]–[CN-10]** — navigation by semantic structure (chapters/sections), hierarchical titles, direct access to any structural element, pausing primary content for ancillary content, skipping ancillary content, keeping all representations in sync. For PMP this maps to take/section markers inside a generated track.
- **Described video [DV-7]/[DV-8]** — volume of the description relative to the programme audio under user control ("speed of volume change should be under user control"; author-provided fade and pan controls synchronised to the soundtrack). Instrumental music has no described video; the transferable requirement is **independent volume channels** (e.g., PMP's optional spoken cues or previews must have a separate, user-controlled level from the music).
- **[API-1]–[API-3]** — the existence of alternative-content tracks must be exposed to the user agent and to accessibility APIs regardless of whether they are in-band or out-of-band. → any transcript/lyrics/metadata track PMP ships must be exposed in the DOM, not painted on canvas.
- **[VP-2]–[VP-4]** — user override of text rendering characteristics, resizing time-based media up to the full viewport, contrast/brightness control of the playback viewport. → visualiser and now-playing text must honour user font/contrast settings.

## E1.3 Item 3 — Spotify ad-tier satisfaction: what exists, what does not

**Industry primary (S110, Spotify Q2 2026 earnings call, relayed transcript, [FULL]):** Ad-Supported Revenue €446 M, +3% constant currency, "as strength in automated channels offset declines in direct sales"; automated channels = 40% of ad-supported revenue (from 30%); active advertisers 33,000 (+60% YoY); MAU 777 M (+12% YoY, +16 M net adds, **1 M below management guidance**); Premium subscribers 300 M; ARPU €4.89 (+7.4% cc, "primarily due to price increases"); Q3 MAU guidance 788 M. Management's own words (Norström): "We've carefully introduced some friction in both ad load and some limitations in our free tier" in select emerging markets, "with a goal of driving higher user conversion", and it "will show itself in our Q3 MAU". **An ad-supported MAU figure and an ad-supported ARPU figure are NOT stated in the captured transcript** (grep for `ad-supported … million` returned only the revenue line). → The company itself is treating free-tier friction as a conversion lever and accepting an MAU cost; that is the closest thing to a first-party "ad-tier tolerance" statement in 2026.

**Peer-reviewed (S111, Mäntymäki & Islam, ICIS 2015, [PARTIAL]):** N=374 Spotify users, SEM + ANOVA; enjoyment, discovering new music and ubiquity drive continuance; social connectivity has no effect; premium users report higher enjoyment and ubiquity than basic users; **enjoyment is the only predictor of continuance among basic (free) users** and has no effect among premium users. Dated 2015 — pre-dates the current ad load; [single-source] for the basic-vs-premium split.

**NOT FOUND in this run:** a peer-reviewed 2024–2026 study measuring *satisfaction or churn of ad-supported music-streaming users* specifically. Queries run (via the fetch script and the earlier search pass): "ad-supported music streaming satisfaction churn peer-reviewed 2025", "freemium music streaming churn study", "Spotify free tier user satisfaction study". Two candidates were captured but not read (S112 Frontiers review on AI/automation and subscription responses; S113 Sci. Rep. churn-prediction model) — they are churn-*prediction* and platform-strategy papers, not satisfaction studies of the ad tier; they remain [ABS]. The Pandora RCT (S01, earlier in this report) remains the only causal ad-load evidence.

## E1.4 Item 4 — Non-English review corpora (S120 Google Play, S121 App Store)

**Coverage measured:** Google Play returned 40 reviews per locale for Suno (240 total; ja-JP, zh-TW, ko-KR, es-ES, pt-BR, de-DE). Google Play has **no listing** for Udio, Mubert or Endel under the package IDs tried (HTTP 404, 1,673-byte error bodies in `cx-play-{udio,mubert,endel}-raw.html`, fetched 13:46 UTC) — measured absence for those IDs, not proof the apps are absent under other IDs. App Store "most helpful" RSS returned **0 entries in 27 of 28 storefront feeds**; only udio/kr returned 2 (one 3★, one 5★). The App Store review content for these apps in these storefronts is therefore **NOT CAPTURED** by the RSS route; the iTunes Search API did return storefront ratings (Suno: JP 4.77/40,282 ratings, TW 4.91/5,799, KR 4.88/20,262, ES 4.86/25,085, BR 4.93/47,309, DE 4.85/49,899; Udio: JP 4.11/345, TW 4.66/64, KR 4.48/105, ES 3.82/157, BR 4.31/343, DE 3.86/463, CN 4.61/108; Endel: JP 4.60/2,079, TW 4.75/490, KR 4.61/589, ES 4.55/1,105, BR 4.77/1,907, DE 4.46/5,071, CN 4.62/4,253; Mubert JP 4.24/468 with `currentVersionReleaseDate` 2023-12-28, i.e. an app not updated in ~2.7 years). The CN storefront "Suno" hit (id 6746319213, publisher Yaochih Net Limited) is a **third-party app, not Suno Inc.** — recorded so nobody cites its 4.83/2,292 as Suno's.

**Top-voted low-score (≤2★) Suno Play complaints, per locale, [my translation], helpful votes and dates as captured:**

| Locale | Votes / date | Complaint class [my translation] |
|---|---|---|
| ja-JP | 👍7 · 2026-07-31 | Account created on the web cannot be deleted from the web — deletion path only inside the app (account-deletion dark pattern) |
| ja-JP | (top-5 set) | Silent updates that break things; credits consumed by failed outputs; lyric paste broken; forced social feed on launch; instrumental option removed; kanji read with the wrong pronunciation |
| zh-TW | (top set) | Paid credits not delivered (payment); unfriendly to novices; mobile playlist capped at 50 songs and shuffle exits the playlist; v5.5 output templated and ignores the prompt; no Chinese UI language; text box lacks cut/paste |
| ko-KR | +25 · 2026-04-06 | Since v5.5, lyrics that resemble any song trip the copyright filter — cannot create |
| ko-KR | +20, +13 | Uploads blocked even for the user's own songs; remix impossible |
| ko-KR | +16, +14, +12 | Pitch errors after update; Korean lyrics always forced into ballad genre with no negative-genre control; shorter outputs while credits burn |
| es-ES | +227 · 2025-03-22 | "user since before the app existed… the mobile app has been failing lately" — reliability regression |
| es-ES | +50, +23, +16, +13 | Watermark on Pro share; word limits / banned words; does not follow lyrics (52 songs); covers blocked |
| pt-BR | +126 | Studio stuck in infinite loading; no stems/MIDI export |
| pt-BR | +17, +16, +13, +8 | Uploads broken; free plan degraded; cannot regenerate one section without burning credits; no visible path to cancel the subscription |
| de-DE | +19 · 2026-03-20 | Style tags "only semi-followed"; error messages; audio glitches and volume jumps |
| de-DE | +16 · 2026-05-19 | Last update "a catastrophe": auto-scrolling lyrics run out of sync with playback, manual scroll removed |
| de-DE | +14 ×3 | Uploads play back in fragments at poor quality, instructions ignored, melodies repeat; "artificially built-in errors that rip off credits"; Discord auth fails, app has far fewer features than the browser |
| de-DE | +13, +12 | Terms consumer-unfriendly, automatic subscription after 7 days; UX very poor, buttons/popups unusable, 5.5 model "produces nothing new" |

**Do the non-English classes reproduce the English/Turkish classes?** Yes for the core: **credit burn on faulty output, prompt/lyric non-adherence, app-vs-web feature gap, playback reliability, billing/cancellation opacity** appear in all six locales, as they did in the English (Angle 1) and Turkish (S13) corpora. Three classes are **more prominent outside English**: (a) **copyright-filter over-blocking after v5.5** (KO +25, ZH-TW, DE +12), (b) **model-version regression** ("5.5 templated / nothing new": KO, ZH-TW, DE), and (c) **language-specific failures** (JA kanji readings; KO genre lock-in for Korean lyrics; ZH-TW no Chinese UI). Class-level generalisation holds across 8 languages; individual vote counts are anecdotes.

## E1.5 Item 5 — Wait-time expectations from the field (S122 Hacker News; Reddit NOT CAPTURED)

- **Suno launch thread (HN 39746163, 2024-03-18, 139 points, 169 comments):** 11 comments matched `wait|latency|slow|seconds`; the substantive latency remark is a user observing Suno can "invent 4 genres in parallel in 10 seconds" — praise, not complaint.
- **Udio launch thread (HN 39993930, 2024-04-10, 234 points, 121 comments):** 7 matches; the sharpest is user *jaggs*, 2024-04-10: "Service is completely slammed. Taking upwards of 40 minutes and counting to generate any tracks. Suno does it in 10 seconds or so." Others state they accept longer waits for higher quality.
- **Comment-level upvotes:** the HN API exposes points only for the story, not for comments — comment upvotes are **structurally unavailable**, not merely uncaptured.
- **Reddit:** four `redlib` mirrors were tried at 13:54 UTC (results: HTTP 403; HTTP 200 without a `post_score` element; HTTP 302; timeout) after `www.reddit.com/…/.json` and `old.reddit.com/…/.json` returned an HTML interstitial rather than JSON earlier in the session. **Reddit upvote counts remain NOT CAPTURED.**
- **Discord changelogs via public mirrors and Product Hunt:** NOT FETCHED in this run (time limit); recorded as an open gap, not as absence.

**Field baseline for PMP:** the community's reference point for "fast" is Suno's ~10 s (2024); a 40-minute queue was reported as a failure. PMP's 42–92 s sits between the two and is *not* the market's fastest — which makes the transparency and expectation-setting in E1.1 the compensating design lever, not an optional polish.

## E1.6 Item 6 — Star histogram (captured) and Reddit votes (not captured)

**Suno Google Play star histogram (S123, read from `aria-label`s in the raw listing HTML fetched 2026-09-05 13:46 UTC):** header "Rated 4.8 stars out of five stars"; 5★ 1,954,395 · 4★ 186,634 · 3★ 39,758 · 2★ 11,564 · 1★ 30,460 → total 2,222,811 (= the "2.22M reviews" body figure in Angle 1); shares 87.9% / 8.4% / 1.8% / 0.5% / 1.4% (my arithmetic). The 1★ bucket (30,460) is 2.6× the 2★ bucket — the classic bimodal complaint tail. This closes the "NOT FOUND" mark in Angle 1 for the histogram.
**Udio / Mubert / Endel Play histograms:** no Play listing under the IDs tried (see E1.4). **App Store histograms:** the Search API returns only the mean and count (listed in E1.4), not the per-star distribution; the listing HTML was not parsed for it in this run.
**Reddit:** NOT CAPTURED (E1.5).

## E1.7 Ledger extensions

**Query ledger (additions):** Play `batchexecute` review RPC ×6 locales (13:54 UTC, all HTTP 200, 40 reviews each); iTunes Search `term=<app>&country=<cc>&entity=software` ×28; App Store customerreviews RSS ×28 (27 empty); Algolia HN `items/39746163` and `items/39993930`; redlib mirrors ×4 (all failed); the arXiv/ACM/INFORMS/W3C/CBS fetches that produced S101–S104, S109; Spotify transcript and ICIS paper fetches (S110, S111); Material 3 guideline fetch (S106, failed body).

**Claim ledger (additions):**
- C-E1 Operational transparency preserves preference for a waiting service at 60 s (63% vs 23%) — S101 [FULL]; corroborated in mechanism by S104 (effort signalling) and S103 (expectation confirmation) → **3-source verified at the mechanism level; the 60-s number itself is [single-source]**.
- C-E2 Users of generative-AI tools accept and value waits as creative effort until the wait exceeds expectation — S104 [FULL], N=11 qualitative; consistent with S101 → 2 sources, marked [single-source] for the generative-AI population.
- C-E3 The final segment of a progress bar dominates perceived duration; constant/accelerating profiles feel fastest — S102 (preprint) [single-source].
- C-E4 Hedonic filler does not shorten perceived wait at 38 s — S103 (thesis) [single-source].
- C-E5 MAUR requires AT-reachable transport, pitch-preserving rate control, structural navigation and independent volume — S109 [FULL], normative primary [single-source by nature].
- C-E6 Spotify is deliberately adding free-tier friction and accepting an MAU cost (Q2 2026) — S110 [FULL], first-party [single-source].
- C-E7 Complaint classes (credit burn, non-adherence, app/web gap, reliability, billing opacity) reproduce across JA/ZH-TW/KO/ES/PT-BR/DE — S120 (240 reviews) + Angle 1 English + S13 Turkish → **3+ verified**.
- C-E8 Suno Play rating distribution 87.9/8.4/1.8/0.5/1.4 — S123 [FULL] [single-source, first-party listing].
- C-E9 Community "fast" reference is ~10 s (Suno 2024); 40-min queue is reported as failure — S122 [FULL], two threads → 2 sources, [single-source] per number.

**Contradiction ledger (additions):**
- X-E1 Classic HCI (NN/g 10-s limit, relayed by S103/S104) says waits >10 s lose attention; S104 and S101 show users *prefer* longer transparent waits for perceived-effort outputs. Resolution: both hold — the 10-s rule governs *unexplained* waits; transparency and effort framing extend tolerance (S101 to ≥60 s). PMP is in the second regime only if it explains the wait.
- X-E2 S104 participants said they "rarely notice" generation cues, yet S101 shows cues change preference by 40 points. Resolution: conscious noticing ≠ effect; do not A/B on self-reported noticing.
- X-E3 S110 Spotify frames free-tier friction as conversion-positive; S01 Pandora RCT measured ad load reducing listening (−2.08% hours) — same lever, opposite framing; Spotify's own MAU miss (1 M below guidance) is consistent with S01.

## E1.8 "Expectation → design implication" table — additions

| # | Expectation (source) | Design implication for PMP |
|---|---|---|
| 21 | A 60-s wait is preferred over instant when the work is shown (S101) | Staged, labelled generation modal; each stage names the engine's work; no bare spinner |
| 22 | Waits that exceed the stated expectation break acceptance (S103, S104) | Announce "45–90 s" before starting; land inside it; never advertise the median |
| 23 | Final progress segment dominates perceived time (S102) | Constant or accelerating progress; forbid a terminal stall at 95–99% |
| 24 | Entertainment during the wait does not shorten it (S103) | Spend the wait on transparency and on letting the user keep browsing, not on animation |
| 25 | Community reference for fast is ~10 s; 40 min = failure (S122) | Treat >120 s as an error state with an explicit message and a retry, not a longer spinner |
| 26 | Playback rate without pitch shift, AT-reachable transport, structural navigation (S109) | Rate control with pitch preservation; keyboard/AT transport on web, phone, tablet; take/section markers as navigable structure |
| 27 | Independent volume for any spoken/ancillary audio (S109 DV-7/8 by analogy) | Separate level control for previews/cues vs music |
| 28 | Model-version regression and copyright over-blocking anger non-English users (S120 KO/ZH-TW/DE) | Version-pin a take's engine settings; explain any block in the user's language with a path forward |
| 29 | Language-specific failures (kanji, Korean genre lock, no Chinese UI) (S120) | Localised UI and explicit negative-genre/style controls; pronunciation guidance where vocals exist |
| 30 | Free-tier friction is an industry lever with a measured MAU cost (S110, S01) | If PMP adds friction, meter it and expose the trade-off; never silent |

## E1.9 Honest floor status after Extension 1

- **Independent authoritative families:** 28 before (line "Counts (R11.2)" above; 42 S-ids) → **39** after (+11 usable: S101, S102, S103, S104, S109, S110, S111, S120, S121, S122, S123; S105 excluded as tertiary, S106 excluded as failed capture, S112 and S113 excluded because unread beyond title). Floor ≥20: met.
- **Academic sources:** 9 before → **13** after (S101, S102, S104, S111 added; S103 is a thesis, grey; S112/S113 captured but unread, not counted). **Academic [FULL] with five-part records:** 6 before → **9** after (S101, S102, S104; S103 carries a five-part record but is grey literature and is *not* counted toward the academic floor). Floor ≥5 academic [FULL]: met. **Primary [FULL]:** 10 before → **19** after (S101, S102, S103, S104, S109, S110, S120, S122, S123).
- **Claims:** C-E1…C-E9 added; 3+-verified: C-E1 (mechanism), C-E7; single-source: C-E2…C-E6, C-E8, C-E9; unverified: none written as fact.
- **Open gaps carried forward (not absence):** Reddit vote counts; App Store review text in non-English storefronts; Discord/Product Hunt latency threads; a 2024–2026 peer-reviewed ad-tier satisfaction study; Material 3, NN/g and Apple HIG first-party progress guidance (not fetched/failed capture); S102 participant count; S111/S112/S113 full reads.
