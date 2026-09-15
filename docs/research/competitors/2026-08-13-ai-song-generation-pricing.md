# Standards ledger

Governance files read IN FULL in this session, before any external action:

| Governing file | Path | Evidence |
|---|---|---|
| Deep-research covenant (rule + skill, one merged document; PART I activation law and PART II R0–R18 + annexes P1–P5) | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` | SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes — hash re-computed from disk this session with `Get-FileHash -Algorithm SHA256`, matches the hash carried in the delegation brief |
| Project contract | `c:\Berk\SsmContentAssetCreator\AGENTS.md` | SHA-256 `D18A2C1CD201C4C3BFDB9F62FF22502C5B48CDCBA201C2728EC7ABB4083B1B4E`, delivered in full in the always-applied rule channel this session |
| Research standard + delegation mandate | `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session (70 lines) |
| Approved R3 scope plan for this run | `c:\Berk\SsmContentAssetCreator\docs\research\_runs\2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session (207 lines) |

Path resolution recorded per R15.1 / R18.4: this is a product/API topic, not a film-product topic, so the governed research root is `docs/research/` and this file sits at the competitor path mandated by R14.4.

Artefact language: ENGLISH (Berk's absolute artefact-language law). The owner's Turkish wording appears only as verbatim quoted evidence.

---

# Document scope, role and honest status

**Role:** R14.3 axis 1 (exhaustive competitor/capability analysis) — the **PRICING** deliverable of four.
**Decision served:** do we BUILD our own song-generation product (prompt → complete song with lyrics, structure, sung vocals and a mix), and if so on which layers — or not build it. This document supplies the price reality. It does **not** recommend an architecture (that is another slice's job by explicit instruction).
**Observation date for every price in this document: 2026-08-13** unless a different date is stated on the row. Freshness horizon set by the brief: 7 days.

**Status — read this before citing any number.** Prices in this class change frequently and several vendors render prices only in JavaScript or behind an account. Every row below carries its read status:

- `[FULL]` — I opened the vendor's own page/document this session and the number was in the text I read.
- `[PARTIAL]` — I opened the page but the specific value did not render in the text (e.g. a checkmark grid or a JS-only toggle), or I read only part of it. Stated as such, never smoothed.
- `[via search-result page text]` — the page body was returned to me as page text by the search tool rather than by a direct fetch. Weaker than `[FULL]`; treated as a single official source and labelled.
- `[third-party]` — a non-vendor source. Never load-bearing on its own.

**No account was created, no trial started, and no money was spent** in producing this document (brief instruction, and the project's spend discipline). Therefore *in-product* prices that are only visible after login are marked NOT OBSERVED rather than guessed.

# Outcome first — the four price facts that most change the BUILD decision

1. **The consumer subscription price of this whole category has converged on the same two numbers: ~$8–$10/month entry and ~$24–$30/month top consumer tier.** Suno Pro $8/mo annual, Udio Standard $8/mo annual ($10 monthly), Google Flow Music Starter $8/mo, Suno Premier $24/mo annual, Udio Pro $24/mo annual ($30 monthly), Flow Music Plus $24/mo — all four vendors' own pricing pages, opened 2026-08-13. Price is therefore **not** a place to win; there is no room under the leaders and no evidence that consumers pay above ~$64/mo (Flow Music Member, the highest consumer tier I found first-party).
2. **The wholesale API price of a generated song has collapsed to cents, and the cheapest first-party route is Google's own.** Lyria 3 Pro: **$0.08 per full song up to 3 minutes**; Lyria 3 (clip): **$0.04 per 30-second clip**; Lyria 2: **$0.06 per 30 seconds** — Google Cloud's own pricing table, read this session. Eleven Music: **900 credits per generated minute** on ElevenLabs' own credit table, which arithmetically equals **$0.149/min at Pro ($99 / 600,000 credits)** and **$0.18/min at Starter ($6 / 30,000 credits)**. MiniMax and Mureka bill **per song** at **$0.03–$0.05** on reseller price sheets. A build must therefore beat ~$0.03–$0.15 per song of *marginal* cost, not $10/month.
3. **Suno — the category leader and the product Berk named — has NO purchasable API at any price.** As of 2026-07-01 Suno's own Chief Product Officer said the company is only "exploring a developer API… starting with a curated group of partners." There is no published endpoint, schema, rate limit or price. Every "Suno API" for sale is a third-party gateway operating without a sanctioned developer programme. **This is the single most important pricing fact in this document for a BUILD decision**: the leader's capability is not buyable at any listed price.
4. **Udio has removed the deliverable entirely.** Udio still sells $8–$30/month subscriptions, but **downloading of audio, video and stems is disabled** (Udio's own help centre, article updated 2026-02-17). A paying Udio subscriber cannot export a file. Any product that resold Udio would be selling something it cannot deliver.

**Bad news for a resale product, stated first:** the two vendors with the best measured vocal quality (Suno, Udio) are respectively **unpurchasable by API** and **unable to export**; the vendors that *are* purchasable by API are cheap but each carries a hard contractual limit (ElevenLabs bans whole industries and bans song/artist/label names in the prompt; Stable Audio is effectively instrumental/sound-design; Lyria's dictated-lyrics path is undocumented). Pricing is not the constraint — **licence terms and API availability are**.

---

# The enumerated competitor universe used across all four documents

Every entity below appears in **all four** deliverables. Where an entity has no meaningful entry for a given document, it is listed explicitly as NOT APPLICABLE with the reason, never dropped (no-narrowing law).

**Tier A — consumer full-song generators with sung vocals (the direct product class)**
A1 Suno · A2 Udio · A3 Google Flow Music (formerly Riffusion → ProducerAI) · A4 ElevenLabs Eleven Music · A5 Mureka (Kunlun Tech) · A6 MiniMax Music (Hailuo) · A7 Boomy

**Tier B — first-party generation APIs (music as infrastructure)**
B1 Google Lyria 2 / Lyria 3 / Lyria 3 Pro on Vertex AI · B2 ElevenLabs Music API · B3 Stability AI Stable Audio 2.5 / 3.0 · B4 Mureka API · B5 MiniMax Music API · B6 Soundraw API · B7 Loudly API · B8 Mubert API · B9 Beatoven.ai · B10 AIVA

**Tier C — open-weight models (the self-host option; a real competitor to buying)**
C1 ACE-Step / ACE-Step v1.5 (ACE Studio + StepFun) · C2 DiffRhythm / DiffRhythm 2 (Xiaomi Research + ASLP-lab) · C3 YuE · C4 LeVo / SongGeneration (Tencent AI Lab) · C5 HeartMuLa · C6 Meta AudioCraft / MusicGen · C7 Stable Audio Open

**Tier D — regional / big-tech surfaces**
D1 Tencent (LeVo/SongGeneration, published openly) · D2 ByteDance · D3 Alibaba

**Tier E — the reseller/gateway layer (not vendors, but they set the market price a buyer sees)**
E1 fal · E2 Replicate · E3 WaveSpeedAI · E4 CloudSway · E5 CometAPI / MusicAPI-class gateways · E6 sunoapi.org-class unofficial Suno gateways

**Discovery honesty:** A3's identity chain (Riffusion → ProducerAI → Google Flow Music) and entities A6, C1–C5, D1 and the whole of Tier E were **not** in the seed list given to me; they were discovered during scoping and added. Two seeds were tested and reclassified: "Riffusion" now resolves to A3, and "Meta AudioCraft-derived products" resolves to C6 with no current commercial product surface of its own found in the searched scope.

---

# A1 — Suno (Suno, Inc.)

**Locator:** `https://suno.com/pricing`, fetched and read 2026-08-13 `[FULL]`. **Note on the toggle:** the page rendered with the **Annual** option active, so the three prices below are the *annual-equivalent monthly* figures the page itself printed, together with the page's own savings lines. The monthly-billing figures did not render in my capture and are therefore `[PARTIAL]` from the page plus `[third-party]` corroboration.

| Item | Free Plan | Pro Plan | Premier Plan |
|---|---|---|---|
| Price as printed on the page (annual toggle) | `$0/month` | `$8/month` | `$24/month` |
| Page's own savings line | — | "Saves $24 by billing yearly!" | "Saves $72 by billing yearly!" |
| Monthly-billing price | `$0` | `$10/month` `[PARTIAL]` — derived from the page's own "$8 + saves $24/yr" arithmetic and corroborated by three independent third-party audits dated June 2026 | `$30/month` `[PARTIAL]`, same basis |
| Tax | "Taxes calculated at checkout" | same | same |
| Credits | 50 credits **renew daily** | 2,500 credits, refreshes monthly | 10,000 credits, refreshes monthly |
| Song downloads | "**No** monthly song downloads (starting 9/3/26)" | "**20** song downloads per month (starting 9/3/26)" | "**60** song downloads per month (starting 9/3/26)" |
| Commercial use | "No commercial use" | "Commercial use rights for new songs made" | "Commercial use rights for new songs made" |
| Model access | v4.5-all | v4, v4.5, v4.5+, v5, v5.5 | v4, v4.5, v4.5+, v5, v5.5 |
| Concurrency | 4 in a **shared** queue | 10 in a **priority** queue | 10 in a **priority** queue |
| Add-on credits | "No add-on credit purchases" | "Available to purchase" | "Available to purchase" |
| Stem separation | "**No** stem separation" | "2 stem separation types (Auto; Split from mix)" | "3 stem separation types (Auto; Split from mix and Advanced split)" |
| Audio upload limit | Up to 8 min | Up to 30 min | Up to 30 min |
| Suno Studio | no | no | **yes** |
| Custom model tuning | no | "Tune custom versions of v5.5 using your own audio" | same |

**Credit-consumption prices Suno has published itself, from its own release notes (`https://www.suno.com/release-notes`, full changelog read 2026-08-13 `[FULL]`):**
- Personas: "You get **200 free songs** to make with Personas — after that, each new song made with Personas will cost **10 credits**" (Introducing Personas, 2024-10-31).
- Covers: "**Your first 200 covers are free!** Once the initial 200 covers are used, each new cover generation will cost **10 credits**, similar to generating new songs" (Covers, 2024-09-12) — this is the only first-party statement I found that pins a *normal* generation at ~10 credits.
- Hooks (short-form music video pairing): "Hooks are **free** to create — they don't cost credits" (2025-09-22).
- Pro/Premier daily top-up: "all Pro/Premier creators will receive **50 free credits per day** once all monthly credits have been completely used" (2024-08-12).

**Derived unit economics `[CALCULATION]`, from the two first-party numbers above:** at 10 credits/song, Pro's 2,500 credits ≈ **250 songs/month for $8–$10** ≈ **$0.032–$0.040 per generation**; Premier's 10,000 credits ≈ **1,000 songs/month for $24–$30** ≈ **$0.024–$0.030 per generation**. Third-party audits state 500 and 2,000 songs respectively (i.e. ~5 credits/song) — **contradiction preserved, unresolved**: Suno's own pages give 10 credits/cover and 10 credits/persona-song but I did not find a first-party page stating the base cost of a plain v5.5 generation, so the songs-per-month figure is `[UNVERIFIED]` in both directions.

**Credit expiry, verbatim from the pricing page:** "Credits included in subscriptions do not carry over from day to day or month to month. Purchased top up credits do not expire, but require an active subscription to use."

**API pricing:** **NONE PUBLISHED.** See §"The Suno API question" below.

**Enterprise terms:** the pricing page shows no enterprise tier; it directs questions to an email address. NOT FOUND IN THE SEARCHED SCOPE (queries: "Suno official pricing page plans Pro Premier credits commercial use terms"; "Suno official API developers api.suno.ai enterprise access announcement 2026").

---

# A2 — Udio (Uncharted Labs, Inc.)

**Locator:** `https://www.udio.com/pricing`, fetched 2026-08-13, capture archived at `docs/research/_sources/2026-08-13-udio-pricing-page.txt` `[FULL]` for prices, `[PARTIAL]` for the feature grid (the comparison table's per-tier cells rendered as empty checkmark columns, so I can read the feature *names* but not reliably which tier each belongs to; I do not guess them).

| Item | Free | Standard | Pro |
|---|---|---|---|
| Monthly price | `$0/month` | `$10` monthly / `$8/month` annual | `$30` monthly / `$24/month` annual |
| Annual total, as printed | `$0 billed annually` | `$96 billed annually` | `$288 billed annually` |
| Credits | **10 credits per day and 100 credits per month** (no rollovers) | **2,400 credits/month** (monthly limit, no rollovers) | **6,000 credits/month** (monthly limit, no rollovers) |
| Daily credit limit | 10/day | "No limit" | "No limit" |
| Concurrency | "Generate up to **4 songs** at the same time" / grid row: 2 sets (4 songs) | up to **6 songs** / 3 sets | up to **10 songs** / 5 sets |
| Full-length cap | "Limit of **3** full length (2:10s) song generations per day" | "Make 2-minute song generations without the limit of 3 per day" | same, unrestricted |
| A-la-carte credits | **100 credits – $3.00** and **1,000 credits – $25.00**; "These credits never expire" | same | same |

**Credit consumption, from Udio's own help centre (`https://help.udio.com/en/articles/10739134-credits-and-credit-limits`, article dated 2025-10-29, read 2026-08-13 `[FULL]`):**
- "Every time you click **Create**, **Extend**, **Remix**, **Inpaint** or **Edit**, **two** new songs are created." (So every action bills for two outputs — a structural cost fact, not a marketing one.)
- "Each set of two **32-second** songs costs **two credits** (one credit for each song)."
- "Each set of two **130-second** songs costs **four credits** (two credits for each song)."
- "**Trimming** a song does not cost any credits."
- Trials: "Trials do **not** come with increased credit limits… capped at creating **3** u-130 songs per day."
- On cancellation: "if your subscription ends… your account will revert to the free-account credit limits."

**Derived unit economics `[CALCULATION]`:** at 2 credits per 130-second song, Standard's 2,400 credits ≈ **1,200 full-length songs/month for $8–$10** ≈ **$0.007–$0.008 per song**; Pro's 6,000 ≈ **3,000 songs for $24–$30** ≈ **$0.008–$0.010**. A-la-carte: $3.00/100 credits = **$0.03/credit → $0.06 per 130-second song**; $25.00/1,000 credits = **$0.025/credit → $0.05 per 130-second song**. Udio is nominally the cheapest per-song consumer price in the set — **and the output cannot be downloaded**, which is what makes that price meaningless for our purposes.

**The download removal, first-party and dated.** Udio's help centre article "Changes associated with the Universal Music Group ('UMG') partnership" (`https://help.udio.com/en/articles/12683565-...`, dated **2026-02-17**, fetched 2026-08-13 `[FULL]`) states, verbatim: "**Note that downloading of audio, video, and stems has been disabled**", alongside: "All subscribers have been given a one-time grant of 1000 extra, non-expiring credits", "The Standard subscription monthly credit limit has been increased from **1200 to 2400**", "The Pro subscription monthly credit limit has been increased from **4800 to 6000**", "Pro subscribers can now create **5 sets** of songs (10 songs) at the same time, up from 4 sets." Udio's CEO stated the same in first person on the company blog (`https://www.udio.com/blog/a-new-era`, read `[FULL]`): "**Starting today, downloads from the platform will be unavailable.**"

**Cross-verification of the download disablement (3 independent families):** (1) Udio help centre, 2026-02-17 `[FULL]`; (2) Udio CEO blog post `[FULL]`; (3) UMG's own press release of 2025-10-29 describing creations "controlled within a walled garden" `[via search-result page text]`. Independent trade reporting (Billboard) is a fourth family. **VERIFIED 3+.**

**API pricing:** NOT FOUND IN THE SEARCHED SCOPE. No Udio developer or API pricing page was retrieved by any query run in this session.

---

# A3 — Google Flow Music (identity chain: Riffusion → ProducerAI → Google Flow Music)

**Locator:** `https://www.flowmusic.app/pricing?plan=monthly`, fetched 2026-08-13 `[FULL]` (monthly toggle explicitly in the URL, so these are monthly-billing prices).

| Item | Free | Starter | Plus | Member |
|---|---|---|---|---|
| Monthly price | `$0/month` | `$8/month` | `$24/month` | `$64/month` |
| Credits | "Daily top-up credits" only | **3,000 credits monthly (~600 songs)** + top-ups | **10,000 credits monthly (~2000 songs)** + top-ups | **30,000 credits monthly (~6000 songs)** + top-ups |
| Concurrent generations | **2** | **8** | **12** | **16** |
| Core features | "All core features" | "All core features" | "All core features" | "All core features" |
| Member extras | — | — | — | Member badge, member events and swag, early access to new features |
| Credit purchase | "Only available on paid plans while your subscription is active" | yes | yes | yes |

**The vendor's own songs-per-credit statement is on the page**: 3,000 credits ≈ 600 songs, i.e. **5 credits per song**, consistent across all three paid tiers (10,000 ≈ 2,000; 30,000 ≈ 6,000). `[CALCULATION]` → **$8/600 = $0.0133 per song** at Starter; **$24/2,000 = $0.012**; **$64/6,000 = $0.0107**. This is the only vendor in Tier A that publishes an explicit credits→songs conversion on its pricing page, which makes it the most directly comparable consumer price in the set.

**Feature gating rows read from the page's comparison table `[FULL]` for row names, `[PARTIAL]` for tier assignment** (same checkmark-grid limitation as Udio): Lyria Models · Producer · Projects · Downloads (mp3, wav, m4a) · Stem downloads · Publishing · Image and Video generation · Progress · Member access. Third-party review states stem downloads and publishing begin at Starter and image/video at Plus `[third-party]` — recorded as unverified, not adopted.

**Annual pricing:** the page carries a Monthly/Yearly toggle; the yearly figures did not render in my monthly-URL capture. A third-party review states $6/$18/$48 per month billed annually `[third-party]` — **NOT VERIFIED against the vendor page** and therefore not carried as a price here.

**Acquisition fact bearing on price durability `[via search-result page text]`, cross-verified across three independent families:** Google acquired ProducerAI (formerly Riffusion) on **2026-02-24**, the team went to Google Labs and Google DeepMind, and the product relaunched as Google Flow Music in **April 2026** running Lyria 3 Pro. One source additionally reports that **Google retains a perpetual, royalty-free licence to all user-produced content** `[single-source]` — flagged, not carried, because I did not open Flow Music's own terms page in this session (see Gaps).

**Relationship to B1 that matters for a BUILD decision:** Flow Music's consumer price of ~$0.011–$0.013 per song sits *below* Google's own published API price for the same underlying model (Lyria 3 Pro at $0.08/song). Google is subsidising the consumer surface relative to its own wholesale rate — meaning a reseller building on Lyria 3 Pro cannot undercut Google's own consumer app on price.

---

# A4 / B2 — ElevenLabs Eleven Music (consumer plans and API are the same wallet)

**Locator:** `https://elevenlabs.io/pricing`, fetched and read 2026-08-13 `[FULL]`. Music is not sold separately — it draws on one shared credit pool with every other ElevenLabs product, which is the most important structural difference in this whole document.

| Plan | Monthly price | Credits/month | Music-relevant entitlement, as printed |
|---|---|---|---|
| Free | `$0` | **10,000** | "Music" listed as included; **music commercial use NOT listed** |
| Starter | `$6` | **30,000** | "Commercial License", "**Music commercial use**", Instant Voice Cloning, 20 Studio projects |
| Creator | `$22` (page shows "$11 per month" first-month 50% off) | **121,000** | Professional Voice Cloning, additional credits |
| Pro | `$99` | **600,000** | "**44.1kHz PCM audio output via API**", "192kbps quality audio" |
| Scale | `$299` | **1,800,000** | 3 workspace seats, team collaboration |
| Business | `$990` | **6,000,000** | 10 seats, low-latency TTS "as low as 5c/minute" |
| Enterprise | Custom | Custom | Custom terms, DPA/SLA, BAA/HIPAA, SSO, elevated concurrency, "significant discounts at scale" |

Page footer, verbatim: "Prices exclude all taxes, levies and duties."

**The credit price of music, verbatim from the pricing FAQ `[FULL]`:** "**Eleven Music 900 credits per minute**". Same FAQ for context: Text to Speech 1 credit/character; Speech to Text 330 credits/min; Sound Effects 200 credits/generation; Voice Changer and Voice Isolator 1,000 credits/min; Dubbing 2,000–10,000 credits/min.

**Effective cost per generated minute of music `[CALCULATION]`, dividing plan price by plan credits and multiplying by 900:**

| Plan | $/credit | **$ per generated minute of music** | $ per 3-minute song |
|---|---|---|---|
| Starter $6 / 30k | $0.000200 | **$0.180** | $0.540 |
| Creator $22 / 121k | $0.000182 | **$0.164** | $0.491 |
| Pro $99 / 600k | $0.000165 | **$0.1485** | $0.446 |
| Scale $299 / 1.8M | $0.000166 | **$0.1495** | $0.449 |
| Business $990 / 6M | $0.000165 | **$0.1485** | $0.446 |

This arithmetic independently reproduces the ~$0.15/generated-minute figure quoted by a third-party API price aggregator, which is a useful cross-check but **the arithmetic above is the load-bearing evidence** because both inputs came from ElevenLabs' own page.

**Credit rollover, verbatim `[FULL]`:** "Unused credits roll over for up to two months — up to 2× your monthly quota — so your balance can reach at most 3× your monthly quota… Rollover does not apply to the Free plan. Pay-as-you-go top-up credits are separate and are not subject to this rollover cap." And: "If you downgrade or cancel your subscription… any unused paid credits will expire."

**Regeneration policy, verbatim `[FULL]`:** "Credits are charged **per generation request, not per download**. If you are not satisfied with the output, a limited number of **free regenerations** may be available as long as the content and certain settings do not change." — this is the only free-retry policy I found first-party in the whole set, and it is a genuine cost advantage for iterative work.

**Annual billing, verbatim `[FULL]`:** "annual price = monthly price × 10" (two months free); equivalent monthly: **$5 Starter, $18.33 Creator, $82.50 Pro, $249.17 Scale, $825 Business**.

**Single-request cap `[PARTIAL]`:** the FAQ confirms "There is a maximum number of credits that can be used in a single generation request. The limit depends on whether you are on the Free tier or a paid subscription" — but the actual numbers are not on the page. NOT OBSERVED.

**Price-change and pass-through clauses that a reseller must price in — verbatim from the Music Terms (`https://elevenlabs.io/music-terms`, "Last Updated: 26 May 2026", read 2026-08-13 `[FULL]`):** "ElevenLabs reserves the right to adjust its pricing from time to time"; "Pricing for Music may vary based on multiple factors, including Customer's subscription plan, volume of usage, and **the nature of the applicable use case**"; and a **third-party pass-through** clause: "ElevenLabs may pass through to Customer certain fees… attributable to ElevenLabs' third-party licensors. ElevenLabs may, at its sole discretion and for a limited period of time, elect to absorb or waive such pass-through fees." **Read plainly: the licensing cost of the licensed training data is contractually passable to the customer at ElevenLabs' discretion, and is currently being absorbed.** That is a forward price risk, in the vendor's own words.

---

# B1 — Google Lyria on Vertex AI (the route this project already owns)

**Locator:** `https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing`, Lyria section, page text read 2026-08-13; capture archived at `docs/research/_sources/2026-08-13-google-cloud-generative-ai-pricing.txt` `[FULL]` for the Lyria rows. Corroborated by the Lyria API reference page's own sentence "Lyria 2 usage is priced at **$0.06 per 30 seconds** of output music generated."

| Model | Billing unit, verbatim from Google's table | Price (USD) | Output |
|---|---|---|---|
| **Lyria 3 Pro** | "Full song music generation… from multimodal inputs such as text or images" | **$0.08 / 1 count** | Full song |
| **Lyria 3** | "30 second music clip generation… high-fidelity, 30-second audio clips from text or image prompts" | **$0.04 / 1 count** | 30-second clip |
| **Lyria 2** | "Generate music from a text prompt" | **$0.06 / 1 count** | Music (measured 32.8 s per clip per Google's own docs) |

**Per-minute equivalents `[CALCULATION]`:** Lyria 3 Pro at up to 3 minutes = **$0.027/min floor**; Lyria 3 clip = **$0.08/min**; Lyria 2 at 32.8 s = **$0.11/min**. Lyria 3 Pro is the cheapest first-party full-song rate found anywhere in this document.

**Model IDs and endpoints, from `https://cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music` `[FULL]`:** Lyria 3 uses `lyria-3-clip-preview` and `lyria-3-pro-preview` on `POST https://aiplatform.googleapis.com/v1beta1/projects/PROJECT_ID/locations/global/interactions`; Lyria 2 uses `lyria-002` on `POST https://LOCATION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/LOCATION/publishers/google/models/lyria-002:predict`. **Both Lyria 3 model IDs carry `-preview` in the name and Google's own docs place them on `locations/global`** — a version and region constraint that must be priced as preview risk, and which matches this project's recorded asymmetry note that the Interactions surface is `global`-only.

**What Lyria 3 Pro's documented response contains, verbatim from the docs' example response `[FULL]`:** `outputs` array with `{"text": "LYRICS", "type": "text"}`, `{"text": "DESCRIPTION", "type": "text"}` and `{"mime_type": "audio/mpeg", "data": "GENERATED_SONG_DATABYTES", "type": "audio"}`. **The documented response returns LYRICS as a text output alongside the audio.** For a project whose measured finding is that Lyria (via `lyria-002`) does not sing dictated words, this is the single most decision-relevant line in Google's documentation — but note precisely what it is: **documentation of a response shape, not proof that dictated lyrics are sung.** Per this project's standing law that a printed schema is never capability evidence, this must be settled by a controlled generation on `lyria-3-pro-preview`, at $0.08 per attempt, before any BUILD claim rests on it. I have not run it (no spend authority in this slice).

**Free tier / credits:** Google Cloud's standard "$300 in free credits" for new customers is stated on the Lyria docs page `[FULL]`; there is no music-specific free tier.
**Enterprise terms:** standard Google Cloud contract; no separate music enterprise price found. Committed-use or negotiated discounts NOT OBSERVED.

---

# B3 — Stability AI Stable Audio 2.5 / 3.0

- **Announcement primary** (`https://stability.ai/news-updates/stability-ai-introduces-stable-audio-25-...`, read 2026-08-13 `[FULL]`): "**less than two seconds** on a GPU, for tracks **up to three minutes**"; text-to-audio, audio-to-audio and **audio inpainting**; "Like all Stable Audio models, Stable Audio 2.5 is **commercially safe and trained on a fully licensed dataset**"; available "through the Stability AI API… partner platforms such as fal, Replicate, and ComfyUI; and **on-premises with an enterprise license**."
- **Price:** an APIs.io provider record states Stability's platform bills credits at **1 credit = $0.01** and Stable Audio 2.5 at **$0.20 per generation regardless of duration** `[via search-result page text]`; an independent API price aggregator lists **Stable Audio 2.5 $0.20/generation (up to 3 min)** and **Stable Audio 3.0 $0.26/generation (up to 6 min)** `[third-party]`. **I did not open `platform.stability.ai/pricing` itself in this session** — a direct search for it returned no results, and I did not guess the URL (search-first law). So the Stability price is **`[UNVERIFIED]` pending the vendor's own pricing page**, and it is the largest single price gap in this document.
- **Per-minute `[CALCULATION]` if those figures hold:** 2.5 = $0.067/min at 3 min; 3.0 = $0.043/min at 6 min.
- **On-premises enterprise licence** is offered but priced only via "contact us" — NOT OBSERVED, and it is the only route in the entire universe that would let us run a licensed commercial model on our own infrastructure.

---

# B4 — Mureka (Kunlun Tech)

- **First-party platform** `https://platform.mureka.ai/docs/` and `.../api/operations/post-v1-song-generate.html` read 2026-08-13 `[PARTIAL]` — the OpenAPI viewer renders its schema client-side, so I could read the endpoint (`POST /v1/song/generate`), the auth scheme (Bearer), and the async contract ("Use the song/query/{task_id} API to poll") **but not the parameter table**. The quickstart at `.../quickstart.html` returned **404** on direct fetch; per the failed-locator rule I did not try guessed variants. Its body was however returned as page text by search `[via search-result page text]`, giving the base URL `https://api.mureka.ai` and a working `curl` example with `lyrics`, `model: "auto"` and `prompt`.
- **Mureka's own positioning claim, verbatim:** "Mureka is the **first and only official API platform provider in the AI music industry**." Recorded as a vendor marketing claim, not a verified fact — and materially it is contradicted by ElevenLabs, Google, Stability, MiniMax, Soundraw, Loudly and Mubert all publishing music APIs.
- **Price `[third-party]`, two independent resellers agreeing:** **$0.045 per generated song** (WaveSpeedAI's Mureka V9 page, which also states "`prompt`, `output_format`, `reference_id`, `vocal_id`, and `melody_id` do not affect pricing"), and an aggregator's "**Mureka API $0.05 per song**". A further third-party figure states **vocal cloning costs a one-time $5 per vocal ID** and that subscription recharge starts at **$30** `[single-source, third-party]` — flagged, not carried.
- **Mureka's own pricing page was NOT retrieved.** NOT FOUND IN THE SEARCHED SCOPE (queries: "Mureka API documentation platform.mureka.ai song generate reference_id vocal_id lyrics endpoint pricing").

---

# B5 — MiniMax Music (Hailuo)

**Locator:** `https://platform.minimax.io/docs/api-reference/music-generation`, full OpenAPI spec fetched and read 2026-08-13 `[FULL]`.

- **Free tier exists at the API level and is explicit in the spec, verbatim:** `music-3.0-free`, `music-2.6-free`, `music-cover-free` are "Available to all users via API Key, with an **RPM of 3**"; the paid `music-3.0`, `music-2.6`, `music-cover` are "Available to **Token Plan and paid users only**, with an **RPM of 120**." **This is the only vendor in the set whose free tier is exposed as separate model IDs on the API with a published rate limit** — a directly usable evaluation path at zero cost.
- **A free step in a paid workflow, verbatim from the guide:** "Call the Music Cover Preprocess API to extract audio features and structured lyrics. **This step is free (no charge).**"
- **Price:** MiniMax's own price table was not in the API reference I read. Reseller price points, two independent families: **$0.03 per song** (WaveSpeedAI, `minimax/music-v1.5`) and per-song flat billing "independent of duration" (HiAPI) `[third-party]`. MiniMax's own pricing page NOT OBSERVED.
- **Cost-relevant limits from the spec `[FULL]`:** lyrics 1–3,500 characters (10–1,000 for cover); prompt up to 2,000 characters; `sample_rate` ∈ {16000, 24000, 32000, 44100}; `bitrate` ∈ {32000, 64000, 128000, 256000}; `format` ∈ {mp3, wav, pcm}; reference audio 6 s–6 min, max 50 MB; **`url` output links expire after 24 hours**; `cover_feature_id` valid 24 hours. Error code `1008` is "Insufficient balance" — i.e. prepaid balance model.

---

# B6–B10 — the B2B / royalty-free API vendors (the price band a product API actually competes in)

These matter because they are the vendors already selling *the thing this project would sell*: music generation as an API, with a sub-licence.

| Vendor | Plan / unit, as printed on the vendor's own page | Price | Read status |
|---|---|---|---|
| **B6 Soundraw API** (`https://soundraw.io/api`, page dated "Aug 4, 2026", read 2026-08-13) | API Starter — "Up to **100 songs/month**", "For indie developers and companies with up to 3 employees" | **$29.99/month** (page prints "$29,99") | `[via search-result page text]` |
| | API Pro — "Up to **1000 songs/month**", "For startups/small companies", "**Minimum commitment: 6 months**" | **$300/month** | same |
| | Both tiers: "No copyright strikes", each with its own linked licence document | — | same |
| | Vendor's own FAQ hedge, verbatim: "API pricing is typically based on usage… For exact pricing, contact the SOUNDRAW team." | — | same |
| **B7 Loudly API** (`https://www.loudly.com/developers/pricing`) | Pay-as-you-go, 1,000 track generations | **$0.15/track**, $150 one-off; "Track credits never expire" | `[via search-result page text]` |
| | Subscription, 1,000 track generations/month | **$0.125/track**, $125/month | same |
| | Both include: "Text-to-music", "Music Generator", "Music Catalog", "**Sub-license**"; "All Subscription partners are automatically protected with **corporate indemnification**" | — | same |
| **B7b Loudly consumer** (`https://www.loudly.com/music/pricing`) | Pro tier: 3,000 VEGA 1 track creations, 200 MANTA 1, 160 AI Remixes, **30 minutes maximum song length**, 500 downloads, 20 stem packs, 50 Stem Splitter audio minutes, "Pro license - commercial use" | **$24/month** | `[via search-result page text]` |
| **B8 Mubert API** (`https://mubert.com/api/plans`) | Trial / Startup / Startup+ / Custom — the page rendered price tokens **$99, $249, $199, $999, $499** three times over without stable label pairing | **NOT RELIABLY OBSERVED** — I will not guess which price belongs to which plan | `[PARTIAL]` |
| | Mubert Render (consumer) disclaimer, verbatim: "On all plans, tracks are **not licensed for Content ID, standalone release on streaming platforms, or stock music sites**." | — | `[via search-result page text]` |
| | Mubert site-wide footer, verbatim: music "licensed by Mubert® Inc **only for personal use**… Public reproduction, recording, distribution of this music is prohibited." | — | same |
| **B9 Beatoven.ai** | Usage-based on minutes of audio downloaded rather than flat tiers | **NOT OBSERVED first-party** | `[third-party]` |
| **B10 AIVA** | Pro plan required for "full copyright ownership and unrestricted commercial use", ~**€33/month** | **NOT OBSERVED first-party** | `[third-party]` |
| **A7 Boomy** | Personal plan including commercial licence and distribution, **$2.99/month** | **NOT OBSERVED first-party** | `[third-party]` |

**Contradiction preserved on Mubert:** the API plans page advertises commercial integration and sub-licensing while the site footer restricts music to "personal use" only. Both are Mubert's own text. Unresolved — a buyer would need the actual licence document, which I did not obtain.

**The price band that matters:** Loudly's **$0.125–$0.15 per track with a sub-licence and corporate indemnification** is the closest existing analogue to what an outward-facing SsmContentAssetCreator music API would sell. Soundraw's **$29.99/100 songs = $0.30/song** and **$300/1,000 = $0.30/song** is the high end. So the sellable B2B price of a *licensed, indemnified* generated track is roughly **$0.12–$0.30**, against a wholesale generation cost of **$0.03–$0.15**. That gross-margin band — not the $10/month consumer price — is the commercial fact this document contributes to the BUILD decision.

---

# C1–C7 — open-weight models: the cost is compute, and the published compute numbers are small

Not "free", but the marginal price per song is our own GPU time, and two 2026 primaries state that time precisely.

| Model | Published speed/hardware claim, from the paper itself | Read status |
|---|---|---|
| **C1 ACE-Step v1.5** (arXiv 2602.00744, ACE Studio + StepFun) | "**under 2 seconds per full song on an A100** and **under 10 seconds on an RTX 3090**"; "runs locally with **less than 4GB of VRAM**"; distillation "reduces inference from 50 to **8 steps**… achieving **200× speedup** to generate **240-second tracks in ~1 second on an NVIDIA A100**"; LoRA personalisation "from just a few songs" | `[FULL]` — read in full, archived |
| **C1b ACE-Step v1.0** (arXiv 2506.00045) | "synthesizes up to **4 minutes of music in just 20 seconds on an A100** — **15× faster** than LLM-based baselines" | `[ABS]` — abstract only, so this figure may **not** carry a load-bearing claim; the full text was archived but not read in this slice |
| **C2 DiffRhythm 2** (arXiv 2510.22950, Xiaomi Research + ASLP-lab) | songs "up to **210 seconds**"; Table 6 on an **RTX 4090**: DiffRhythm+ 18.3 s (RTF 0.153), ACE-Step 15.2 s (RTF 0.127); Table 3 block-size trade-off: RTF 0.455 → 0.154 as block size goes 5 → 20, with PER rising 0.11 → 0.17 | `[FULL]` |
| C3 YuE · C4 LeVo/SongGeneration (Tencent) · C5 HeartMuLa · C6 MusicGen · C7 Stable Audio Open | present in the enumerated universe and benchmarked in C1/C2's tables; individual papers not opened in this slice | `[ABS]` — may not carry a load-bearing claim |

**Cost `[CALCULATION]`, using a public on-demand A100 rate of ~$1.50–$4.00/hour as an order of magnitude (rate NOT verified first-party in this session, so treat the result as an order of magnitude only):** at 1–2 s per 240-second track, one GPU-hour yields on the order of 1,800–3,600 songs → **$0.0004–$0.002 per song**, i.e. **10–100× cheaper than the cheapest API**, before amortising the engineering. That is the arithmetic that makes BUILD financially interesting; the quality gap is the counterweight and is quantified in the functions-and-services document.

**Licence caution:** open weights are not automatically commercially usable, and this document does not assert any licence for C1–C7. Their licences were NOT examined in this slice — recorded as a gap for the business-model document and the architecture slice.

---

# D1–D3 and E1–E6 — regional surfaces and the gateway layer

| Entity | Pricing finding | Status |
|---|---|---|
| **D1 Tencent** | Publishes LeVo / SongGeneration openly (repo cited by both C1 and C2 as `github.com/tencent-ailab/songgeneration`). No consumer or API price surface retrieved. | NOT APPLICABLE for pricing — research/open-source posture, no price to observe in the searched scope |
| **D2 ByteDance** | No first-party music-generation pricing surface retrieved by any query in this session. | NOT FOUND IN THE SEARCHED SCOPE. Explicit blind spot: Chinese-domestic surfaces (e.g. domestic-only apps and their in-app RMB pricing) were not reachable/observed here |
| **D3 Alibaba** | Same as D2. | NOT FOUND IN THE SEARCHED SCOPE |
| **E1 fal** | Hosts `fal-ai/stable-audio-25/audio-to-audio` with the full parameter schema published; per-call price not captured in my read | `[PARTIAL]` |
| **E2 Replicate** | Hosts `minimax/music-2.6`; readme read via search text; price not captured | `[PARTIAL]` |
| **E3 WaveSpeedAI** | Publishes explicit per-song prices for models it resells: **Mureka V9 $0.045/song** ("Total price = $0.045 × number_of_songs"), **MiniMax music-v1.5 $0.03/song** | `[via search-result page text]` — reseller price, not the vendor's own |
| **E4 CloudSway** | Republishes the Mureka parameter contract with its own endpoint; no price captured | `[via search-result page text]` |
| **E5 Aggregators (CometAPI-class)** | Publish a comparative table: Lyria 3 Pro $0.08/song · Lyria 3 Clip $0.04/30 s · Lyria 2 $0.06/30 s · Eleven Music $0.15/min · Stable Audio 2.5 $0.20/gen · Stable Audio 3.0 $0.26/gen · Mureka $0.05/song. **The three Lyria rows and the Eleven Music row independently reproduce what I verified first-party**, which is why this family is usable as corroboration for the Stability rows — while remaining `[third-party]` for Stability specifically | `[third-party]` |
| **E6 Unofficial Suno gateways** | An OpenAPI description of `api.sunoapi.org` states plainly: "**Suno itself does not publish a sanctioned developer API as of May 2026**; this OpenAPI describes the public-facing endpoints documented at docs.sunoapi.org… **Exactly two songs are returned per successful task**", with stream URLs in ~30–40 s and downloadable URLs in 2–3 minutes | `[via search-result page text]` — and see the Suno API question below |

---

# The Suno API question — the pricing fact with the largest consequence

**There is no Suno API price because there is no Suno API.** Evidence, three independent families:

1. **Suno's own executive, quoted in trade press:** Chief Product Officer **Jack Brody**, LinkedIn post of **Wednesday 1 July 2026**: "Ahead of our partner powered model, we're **exploring** a developer API and want to hear from you before we start building… We plan to start with a **curated group of partners**… we're especially interested in applications that unlock experiences generative music makes possible for the first time." The intake form on Suno's own Typeform reads: "We're beginning to explore a developer API, starting with a curated group of partners." `[via search-result page text]` — Music Business Worldwide.
2. **An independent trade outlet reporting the same post** with the same quotes, plus: "Suno has not disclosed a timeline for the API's potential launch." `[via search-result page text]`
3. **A third-party API vendor's own OpenAPI metadata** conceding Suno publishes no sanctioned developer API as of May 2026 `[via search-result page text]`.

**VERIFIED 3+ that no official Suno API pricing exists as of the searched scope on 2026-08-13.** Per the brief's rule, I state this as NOT FOUND IN THE SEARCHED SCOPE rather than "does not exist" — the queries run were: "Suno official API developers api.suno.ai enterprise access announcement 2026" and "Suno help center advanced options styles exclude styles weirdness persona official documentation".

**Consequence for the decision, stated without recommending an architecture:** any plan whose cost model assumes buying Suno-grade song generation wholesale has **no price to put in the spreadsheet**. The purchasable options are Lyria ($0.04–$0.08/count), Eleven Music (~$0.15/min), Stable Audio (~$0.20–$0.26/gen, unverified), Mureka (~$0.045/song, third-party) and MiniMax (~$0.03/song, third-party) — plus self-hosted open weights at GPU cost.

---

# Cross-vendor comparison at one duration — 3 minutes of finished song

`[CALCULATION]` from the first-party unit prices above. Consumer rows convert credits at the vendor's own published credits-per-song where it exists.

| Route | Marginal price for one 3-minute song | Basis | Read status of the inputs |
|---|---|---|---|
| Self-hosted ACE-Step v1.5 / DiffRhythm 2 | **~$0.0004–$0.002** (order of magnitude) | 1–2 s/track on A100 × unverified hourly rate | speed `[FULL]`, GPU rate unverified |
| MiniMax `music-3.0` | **~$0.03** | reseller per-song | `[third-party]` |
| Mureka V9 | **~$0.045** | reseller per-song, "does not affect pricing" note | `[third-party]` |
| Google **Lyria 3 Pro** | **$0.08** | Google's own table, "Full song… $0.08 / 1 count", up to 3 min | `[FULL]` |
| Google Lyria 3 clip ×6 | **$0.24** | $0.04 × 6 clips | `[FULL]` |
| Google Lyria 2 ×6 (32.8 s each) | **$0.36** | $0.06 × 6 | `[FULL]` |
| ElevenLabs Eleven Music @ Pro | **$0.446** | 900 credits/min × 3 ÷ 600,000 × $99 | `[FULL]` both inputs |
| ElevenLabs Eleven Music @ Starter | **$0.540** | 900 × 3 ÷ 30,000 × $6 | `[FULL]` both inputs |
| Stable Audio 2.5 | **~$0.20** | per generation regardless of duration | `[UNVERIFIED]` vendor page not opened |
| Suno (consumer, Premier) | **~$0.024–$0.030** *plus a hard 60-download/month cap from 2026-09-03* | 10 credits/song ÷ 10,000 credits ÷ $24–$30 | price `[FULL]`, credits-per-song `[UNVERIFIED]` |
| Udio (consumer, Pro) | **~$0.008–$0.010** but **NOT DELIVERABLE** — downloads disabled | 2 credits/130 s | `[FULL]` |
| Loudly API (what a reseller charges) | **$0.125–$0.15 per track, sub-licence + indemnification included** | vendor developer pricing page | `[via search-result page text]` |
| Soundraw API (what a reseller charges) | **$0.30 per song** at both tiers | $29.99/100 and $300/1,000 | `[via search-result page text]` |

**The spread is ~750× between self-hosting and the most expensive API route**, and the *sellable* price sits at $0.125–$0.30. Every figure above is marginal generation cost only; none includes engineering, storage, egress, moderation, watermarking or the licence risk quantified in the business-model document.

---

# Commercial-use rights per tier — the pricing dimension that is actually a legal dimension

| Vendor | Tier | Commercial right, in the vendor's own words | Locator / status |
|---|---|---|---|
| Suno | Free/Basic | "**No commercial use**" (pricing page). ToS: use Output "solely for your lawful, internal, personal and non-commercial purposes, **provided that you give attribution credit to Suno** in each case" | `https://suno.com/pricing` + `https://suno.com/terms-of-service` `[FULL]` |
| Suno | Pro & Premier | "Suno hereby **assigns to you all of its right, title and interest** in and to any Output owned by Suno and generated from Submissions made by you through the Service **during the term of your paid-tier subscription**. However, due to the nature of machine learning, Suno **makes no representation or warranty to you that any copyright will vest** in any Output." | ToS `[FULL]` |
| Suno | Any tier, if Remix enabled | "all Remixes shall be a **joint work owned jointly and equally** by you and the Remixer… the Remix **may only be used for lawful, internal, personal and non-commercial purposes**" — **regardless of paid tier** | ToS `[FULL]` |
| Suno | Any tier | "In no event will you use the Output or your Voice Model to **compete with Suno**, including to create a competing product or service"; and no use of the Service or Output "to create, develop or improve any competing products or services or to power, enable or train other artificial intelligence and machine learning models" | ToS `[FULL]` — **directly relevant: building a competing music product on Suno output is contractually barred** |
| Udio | All tiers | Downloads disabled; export impossible → commercial delivery impossible from the current product | Help centre 2026-02-17 `[FULL]` |
| ElevenLabs | Free | Music listed but "Music commercial use" **absent** from the Free column | pricing page `[FULL]` |
| ElevenLabs | Starter → Business | "**Music commercial use**" listed from Starter ($6) upward | pricing page `[FULL]` |
| ElevenLabs | Self-serve vs Enterprise | Third-party audits state self-serve commercial use covers online/offline **except film, TV and Studio Games**, which require Enterprise; and that Enterprise outputs "cannot be used in music libraries containing more than 100 outputs for licensing or distribution" | `[third-party]` — **the elevenlabs.io/music commercial-rights table itself was NOT opened this session**; recorded as a gap, not adopted |
| ElevenLabs | All tiers | Music Terms ban entire **industries** (firearms, tobacco, prescription pharma, adult, religious organisations, political advocacy) and ban as **inputs** any artist/songwriter name, song title, album title, publisher name, label name, or "a substantial or distinct portion of any song's lyrics" | `https://elevenlabs.io/music-terms`, 26 May 2026 `[FULL]` |
| Google Lyria | Vertex AI | Governed by Google Cloud terms; no music-specific commercial-rights table found | `[PARTIAL]` |
| Stability | All | "commercially safe and trained on a fully licensed dataset"; ToS "require that uploads be free of copyrighted material" | announcement `[FULL]` |
| Loudly | API subscription | "Sub-license" included; "All Subscription partners are automatically protected with **corporate indemnification**" | developer pricing `[via search-result page text]` |
| Loudly | Consumer Pro $24 | "Pro license - commercial use", plus Loudly Distribution: "**100% payout on streaming royalties**" | consumer pricing `[via search-result page text]` |
| Mubert | Render plans | "tracks are **not licensed for Content ID, standalone release on streaming platforms, or stock music sites**" | `[via search-result page text]` |
| Soundraw | API Starter / Pro | "No copyright strikes"; each tier links to its own separate licence document | `[via search-result page text]` |

**The one clause that most constrains a BUILD-and-resell plan:** Suno's ToS bars using its Output to build a competing product or to train models. ElevenLabs' Music Terms bar naming any artist, song, album, label or publisher **in the prompt** — which forecloses the "sounds like X" prompt affordance that consumers actually use, for anyone building on that API.

---

# Contradictions preserved (not averaged)

| # | Subject | Source A | Source B | Resolution |
|---|---|---|---|---|
| 1 | Suno songs per month | Suno's own release notes: 10 credits per cover / per persona-song → 250 (Pro) / 1,000 (Premier) | Three third-party audits: 500 (Pro) / 2,000 (Premier), i.e. ~5 credits/song | **UNRESOLVED.** Suno publishes no first-party base-generation credit cost that I could retrieve. Both figures reported; neither adopted |
| 2 | Suno monthly-vs-annual price | Pricing page rendered annual only: $8 / $24 | Third-party: $10 / $30 monthly, $8 / $24 annual | **CONSISTENT** once the toggle is accounted for; the page's own "saves $24/$72 yearly" arithmetic confirms $10/$30 monthly `[PARTIAL]` |
| 3 | Mubert licence scope | API plans page: commercial integration + sub-licensing | Site footer: "only for personal use… public reproduction, recording, distribution… prohibited" | **UNRESOLVED**, both are Mubert's own text |
| 4 | Flow Music annual price | Vendor page: monthly $8/$24/$64; yearly toggle unrendered | Third-party review: $6/$18/$48 annual | **UNRESOLVED**; only the monthly figures are carried |
| 5 | Stable Audio price | APIs.io provider record: $0.20/generation, 1 credit = $0.01 | Aggregator: $0.20 (2.5) / $0.26 (3.0) | **AGREE with each other but NEITHER IS THE VENDOR.** Marked `[UNVERIFIED]` |
| 6 | ElevenLabs music commercial scope | Pricing page: "Music commercial use" from Starter, unqualified | Third-party: excludes film, TV, Studio Games below Enterprise | **UNRESOLVED** — the vendor's own commercial-rights table was not opened |
| 7 | Whether Lyria can sing dictated lyrics | Google docs: Lyria 3 Pro response contains a `LYRICS` text output | This project's own measurement: 0 of 8 dictated Turkish words returned on `lyria-002` | **NOT A CONTRADICTION** — different models (`lyria-3-pro-preview` vs `lyria-002`), and the doc shape is not capability evidence. Requires a controlled $0.08 probe |

---

# Query log for this document (exact queries, so an absence claim can be re-tested)

1. `AI song generation platforms 2026 comparison Suno Udio Riffusion Mureka ElevenLabs Music advanced controls` — broad scoping (first external action, per R4.1)
2. `Suno official pricing page plans Pro Premier credits commercial use terms`
3. `Suno help center advanced options styles exclude styles weirdness persona official documentation`
4. `Suno official API developers api.suno.ai enterprise access announcement 2026`
5. `Udio terms of service pricing plans downloads disabled Universal Music Group settlement announcement official`
6. `Udio help center credits and credit limits Standard Pro subscription price advanced controls inpainting stems`
7. `ElevenLabs Music API reference documentation compose music_length_ms composition plan endpoint`
8. `ElevenLabs Eleven Music licensing Merlin Kobalt agreement announcement commercial rights terms pricing plans 2026`
9. `Mureka API documentation platform.mureka.ai song generate reference_id vocal_id lyrics endpoint pricing`
10. `Vertex AI Lyria generate music API documentation model card lyria-002 pricing per second Google Cloud`
11. `Stability AI Stable Audio 3.0 API documentation parameters pricing credits license commercial use` — **returned zero results**; re-searched as #12 rather than guessing a URL
12. `Stable Audio 2.5 API platform.stability.ai audio-to-audio inpaint steps strength documentation`
13. `Riffusion pricing plans FX Fuzz sliders official 2026 ProducerAI Google acquisition`
14. `Beatoven.ai Soundraw Boomy Loudly AIVA Mubert pricing plans API commercial license 2026 official`
15. `MiniMax music generation API documentation music_1.5 lyrics reference audio parameters pricing platform`
16. `arXiv ACE-Step YuE DiffRhythm open-source full-song generation lyrics-to-song 2025 2026 paper benchmark`
17. `GEMA v Suno Munich court ruling judgment 2026 copyright lyrics decision official`

Direct fetches performed: suno.com/pricing · suno.com/release-notes · udio.com/pricing · udio.com/blog/two-minute-model-new-controls · help.udio.com (2 articles) · elevenlabs.io/pricing · elevenlabs.io/music-terms · elevenlabs.io/docs/api-reference/music/compose.mdx · elevenlabs.io/docs/.../composition-plans.mdx · cloud.google.com/vertex-ai/.../music/generate-music · platform.minimax.io/docs/api-reference/music-generation · platform.mureka.ai/docs/api/operations/post-v1-song-generate.html · flowmusic.app/pricing · stability.ai announcement · kb.stability.ai audio-to-audio · gema.de/de/w/suno-entscheidung-2026.
**Failed fetches, recorded rather than worked around:** `platform.mureka.ai/docs/quickstart.html` → **404** (twice, with and without query string). Per R4.3 I returned to search instead of trying guessed slug variants.

# Known gaps and blind spots in THIS document, stated explicitly

1. **Stability AI's own pricing page was never opened** — the Stable Audio prices are `[UNVERIFIED]`. This is the largest gap.
2. **The ElevenLabs Music commercial-rights table** (`elevenlabs.io/music`) was not opened; the film/TV/Studio-Games carve-out is `[third-party]` only.
3. **Suno's base credit cost per plain generation** has no first-party source; songs-per-month is unresolved.
4. **Mubert's plan↔price pairing** could not be read reliably and is not guessed.
5. **Beatoven.ai, AIVA, Boomy first-party pricing pages** were not opened — all three are `[third-party]` only.
6. **Chinese-domestic surfaces (ByteDance, Alibaba, and RMB in-app pricing)** were not reached. A CN/JP/KR-language pass is required to close this; the brief authorised those languages and I did not exhaust them.
7. **No in-product prices** (in-app purchase tiers, credit top-up sheets behind login) were observed anywhere, by design — no accounts, no trials, no spend.
8. **GPU hourly rates** used in the open-weight cost arithmetic were not verified first-party; that row is an order of magnitude only.
9. **Whether any vendor's price changed in the last 7 days** cannot be established from a single observation date; nothing here has a price-history check.

# Source counts for this document

Distinct first-party vendor/official surfaces opened or read as page text for pricing evidence: **Suno pricing, Suno ToS, Suno release notes, Udio pricing, Udio help ×2, Udio blog, ElevenLabs pricing, ElevenLabs Music Terms, ElevenLabs API reference, ElevenLabs composition-plan guide, Google Cloud pricing, Google Lyria docs ×2, MiniMax API reference, Mureka platform docs ×2, Flow Music pricing, Stability announcement, Stability KB, Soundraw API, Loudly developer pricing, Loudly consumer pricing, Mubert API plans, Mubert Render pricing, GEMA press release** = **25 official/first-party surfaces**. Academic/legal primaries: **arXiv 2602.00744 `[FULL]`, arXiv 2510.22950 `[FULL]`** (both with the complete five-part R9 record), **arXiv 2506.00045 `[ABS]`** (archived but read at abstract level only — corrected after read-back; it carries no load-bearing claim), **GEMA v Suno** (GEMA's own release `[FULL]` + four independent legal analyses; the 143-page judgment text itself `[PARTIAL]` — not obtained). **Honest count against the slice floor of ≥2 academic-or-legal primaries read `[FULL]`: 2 arXiv primaries `[FULL]` + 1 official legal primary (GEMA's release) `[FULL]` = 3.**

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT