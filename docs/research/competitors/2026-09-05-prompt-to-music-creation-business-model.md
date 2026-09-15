# Standards ledger

| Governing file (read from disk this session) | How this file obeys it |
| --- | --- |
| `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (covenant block sha256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8`, recomputed) | R7.2 producer-class separation (first-party terms vs press vs review); R10 status per claim; R16.3 living-state dates on every partnership/transition fact. Source register, query ledger and claim ledger are in the companion functions-and-services file (§1, §7, §8). |
| `C:\Users\berke\.cursor\rules\00-berk-constitution.mdc` (Law Zero) | Business-model statements are quoted from the vendor's own pricing/help/terms text where read; label-deal and revenue statements are marked with their producer class; nothing is inferred from recollection. |
| `C:\Users\berke\.cursor\rules\10-no-narrowing.mdc` | All four axes the parent named (credits vs subscription, free tier, licensing, label deals, API monetisation, ads) are covered for every swept competitor; not-swept names are listed, not dropped. |

# Floor status (banner removed 2026-09-05 16:58 UTC+3 — second pass; companion file §11.8)

# Decision served

Whether PlayMusicPrompts' business model — free generative listening for visitors, monetised by Google audio ad breaks (3–5/h after a full listen, −14 LUFS) and banners, no rewarded ads, $0.08/take cost — is positioned correctly against a 2026 field that monetises almost exclusively by subscription credits, export caps and API, and whose leaders are converting to label-licensed walled gardens.

# Outcome first

1. **Subscription-with-credit-meter is the universal consumer model** across the 13 swept vendors; **none of them is ad-supported** on the surfaces read this session (Suno, Udio, Eleven, Flow Music, Mureka, Stable Audio, Soundraw, AIVA, Mubert, Kits, Pika, Beatoven, Loudly). Treblo is free without a visible ad or credit model [S21] — its revenue surface is the developer API [S21b]. PMP's ad model is therefore **structurally unique** in this vertical (measured on the surfaces opened; absence of ads on unopened surfaces is NOT claimed).
2. **Label licensing is the 2025–2026 axis of competition:** Udio ↔ UMG partnership (2025-10-29) with downloads disabled and a licensed relaunch planned [S05]; Suno's terms transition and download caps effective 2026-09-03 [S01], described by third parties as tied to a Warner Music deal (Q12) `[single-source third-party]`; ElevenLabs "built in partnership with artists, labels, and publishers", "trained on licensed stems and music" [S09,S10]; Alibaba HappyShrimp launched WITH Taihe Music Group [S26]; Soundraw "trained only on music we create in-house" and a supporter of "aiformusic, alongside Roland and UMG" [S14]; Adobe Firefly "universally licensed" output [S27]; Stability "trained on fully licensed datasets… legal indemnification under our Enterprise license" [S12]. Provenance is now a pricing feature, not a footnote.
3. **API monetisation is a second business in every serious vendor:** ElevenLabs `POST /v1/music`, 900 credits/min [S08,S09]; Google Lyria 2 $0.06 per 30 s [S19]; Treblo API $11–$1,150/mo [S21b]; Mureka separate API wallet [S07]; Mubert Music API (Restream, Picsart "3,000,000 unique tunes generated monthly", Canva plugin) [S15b]; Soundraw API plans and Enterprise [S14]; Beatoven Composition API on request `[3p]` [S29b]; Stability API + Enterprise licence [S11,S12].
4. **Free tiers are acquisition funnels with hard export walls:** every free tier read is non-commercial, most block download (Suno, Udio, Mureka), and several meter the free tier daily rather than monthly (Suno 50/day; Udio 3 songs/day; Flow Music daily top-ups; Mubert 30 min/day) [S01,S04,S17,S15].
5. **Distribution/publishing is the other revenue frontier:** Soundraw Artist tiers promise "Distribute on Spotify, Apple Music, TikTok… Collect 100 % of your song royalties" [S14]; Loudly lists "Music Distribution" [S30]; Flow Music has "Publishing" and Member perks (badge, events, merch) [S17]; Mubert forbids DSP publishing entirely [S15].

# 1 Business model per competitor (first-party evidence unless marked)

| Vendor | Revenue mechanism | Free tier role | Licensing / rights model | Label / data deals | API monetisation | Ads on surface read? |
| --- | --- | --- | --- | --- | --- | --- |
| Suno [S01,S02,S03] | Subscription (Pro/Premier) + add-on credits (paid only) + download caps from 2026-09-03 | 10 songs/day, no download, no commercial use → upgrade funnel | Commercial rights for songs made while paid; not retroactive; Custom Models require owning uploaded audio (Q12 `[3p]`) | Terms transition 2026-09-03 [S01]; Warner deal per third parties (Q12) `[3p]`; UMG litigation active per Q2 `[3p]` | none stated on surfaces read — NOT FOUND IN THE SEARCHED SCOPE | no |
| Udio [S04,S05] | Subscription + a-la-carte credits (never expire) | 3 songs/day, no export | Walled garden: streaming inside platform only since 2025-10-29 | **UMG partnership 2025-10-29** [S05]; Warner, Merlin, Kobalt per Q5 `[3p]` | none stated | no |
| ElevenLabs [S08,S09,S10] | One shared credit subscription across TTS/STT/Music/SFX/Dubbing; Music 900 cr/min; rollover ≤2 months; annual = 10 months | 10k credits, Music without commercial licence | "Music commercial use" from Starter; "cleared for nearly all commercial uses… film and television to podcasts…" [S10]; rights vary by tier [S09] | "Built in partnership with artists, labels, and publishers… trained on licensed stems and music" [S09] | `POST /v1/music`, streaming, SDKs; customers listed: Synthesia, Meta, Perplexity, Twilio, Lovable [S09] | no |
| Google Flow Music / Lyria [S16–S20] | Consumer subscription $8/$24/$64 bundled into Google AI Plus/Pro/Ultra; extra credits only while subscribed; Member perks (badge, events, swag) | daily top-ups, 2 concurrent; Turntable labour-for-credits | Not read this session (`[UNVERIFIED]`); RightsDocket Q2 says consumer rights undefined, enterprise indemnified `[3p]` | Lyria 3.5 in Flow Music [S16]; SynthID watermark on Lyria 2 [S19] | Vertex Lyria 2 $0.06/30 s [S19]; Lyria RealTime experimental [S20] | no |
| Mureka (Kunlun) [S06,S07] | Subscription in "Gold" + metered actions (stems/MIDI/video) + separate API wallet (12-month validity, FIFO, non-refundable) | free Gold expires 24 h `[3p]` | commercial rights Pro+; paid API output carries commercial authorisation [S07] | none stated on surfaces read | separate API platform [S07] | no |
| Treblo [S21,S21b] | **Consumer product free**; revenue = developer API ($11–$1,150/mo + PAYG) with mandatory attribution | the whole consumer product | "no usage restrictions from us on songs you create" [S21] | none stated | yes, primary | no |
| Stability AI [S11,S12] | Web-app subscription $12–$199 + API + Enterprise licence (>$1M revenue) + open weights (Small/Medium) | not on pricing page | Enterprise legal indemnification; "fully licensed datasets" [S12] | licensed datasets (partners page not read) | Stability AI API [S12] | no |
| Soundraw [S14] | Subscription split by persona (Creator vs Artist tiers) with download-count caps + Enterprise/API + "SpaceMusic AI" for physical venues | free trial only | Perpetual worldwide licence; in-house trained catalogue; 100% royalties for artists | supporter of aiformusic with Roland and UMG [S14]; collabs with French Montana, Fivio Foreign, Trippie Redd [S14] | API plans [S14] | no |
| AIVA [S22] | Subscription (EUR) with download caps; copyright transfer only on Pro | 3 downloads/mo, credit AIVA | Free/Standard: AIVA owns copyright; Pro: user owns | none stated | none stated | no |
| Mubert [S15,S15b] | Render subscription (Ambassador/Creator/Pro/Business) + Music API for apps/streams; licence certificates | 25 gens/mo, 5 downloads | Use-within-content licence only; **no DSP, no Content ID, no redistribution**; rights end with subscription for new projects | none stated | API partners Restream, Picsart, Canva [S15b] | no |
| Kits.ai [S23] | Subscription metered by download minutes and voice slots | 15 conversion min | not read | none stated | "API" in nav [S23] | no |
| Pika [S24,S25] | Credit subscription shared with video; commercial/watermark-free only Pro+ (eesel Q11 `[3p]`) | 80 cr `[3p]` | `[3p]` | none stated | "lowest-priced audio models on the market— up to 20× cheaper" [S25] | no |
| Beatoven [S29,S29b] | Subscription download-minutes + PAYG $3/min + API on request | 10 generations, no download `[3p]` | licence emailed per download [S29] | none stated | Composition API `[3p]` | no |
| Loudly [S30,S30b] | Subscription + API + Music Distribution + sample packs | free tier `[3p]` | "Rights-safe AI audio engine" [S30] | none stated | Music API [S30] | no |
| Adobe Firefly [S27] | Inside Creative Cloud / Firefly generative credits; free AI Assistant with daily allowance `[3p]` | daily allowance | "universally licensed" output; indemnification for enterprise (Adobe PDFs Q13) | Firefly trained on licensed + public-domain content (Adobe PDFs Q13) | Firefly Services (not read) | no |
| Alibaba HappyShrimp [S26] | beta; no pricing | beta | not published | **Taihe Music Group** co-creation at launch [S26] | not published | — |

# 2 The five business-model patterns and where PMP sits

| Pattern | Who | Mechanism | PMP today | Implication |
| --- | --- | --- | --- | --- |
| P1 Credit subscription + export caps | Suno, Udio, Flow Music, Mureka, Stable Audio, Soundraw, AIVA, Mubert, Kits, Pika | monthly credits; downloads/stems/WAV gated by tier | none | Export is the industry's paywall; PMP has no export product at all |
| P2 Label-licensed walled garden | Udio (UMG), Suno (caps + terms), ElevenLabs (licensed training), Soundraw (in-house), Adobe (universal licence), Alibaba (Taihe) | provenance sold as safety; downloads restricted or licence-tagged | PMP engine is proprietary (Ideasets Hybrid Composer) | Provenance statement belongs on the surface (G18 licence certificate) |
| P3 Free consumer + paid API | Treblo | consumer acquisition, developer revenue | PMP has a 101-parameter engine and no public API surface read | API is the one revenue line every vendor has and PMP does not list |
| P4 Bundled into a platform subscription | Google (AI Plus/Pro/Ultra), Adobe (Creative Cloud), ElevenLabs (shared credits) | music is a feature of a larger plan | none | Not applicable to a solo product; watch as a threat |
| P5 Ad-supported free listening | **PlayMusicPrompts only** (on surfaces read) | audio ad breaks between tracks, banners, no rewarded ads | yes | Unique; its risk is CPM vs $0.08/take generation cost — the 3-take design multiplies cost per listened minute ×3 unless prepared takes are re-used |

# 3 Living-state watchlist (dates that change the map)

- 2025-10-29 Udio–UMG partnership; downloads disabled [S05]. Watch: licensed relaunch date.
- 2026-02-17 Udio help article updated (credit increases, 1,000 grant) [S05].
- 2026-03 (third-party) Suno v5.5, Voices, Custom Models (Q12) `[3p]`.
- 2026-05 Stable Audio 3.0 family [S12/Q7 `[3p]` for the month].
- 2026-06-01 Lyria RealTime doc last updated [S20].
- 2026-08-17 Alibaba HappyShrimp beta [S26]; 2026-08-18 Pika Music [S24]; 2026-08-20 Adobe Firefly Generate Music GA [S27].
- 2026-09-03 Suno download caps and terms transition [S01].

# 4 Application to PlayMusicPrompts

- ADOPT: publish a provenance/licence statement on every generated take (P2 is now table stakes); expose the API as a product line (P3) — the engine already has 101 documented parameters.
- BUILD: an "export/keep" product (download, stems, WAV) as the paid lane while listening stays free with ads — no competitor combines P1 and P5.
- AVOID: rewarded ads (owner constraint) and any DSP-publishing promise before rights language is settled (Mubert forbids it; Soundraw sells it; the two extremes show it is a legal decision, not a UX one).

Source register, query ledger, claim ledger and contradictions: `2026-09-05-prompt-to-music-creation-functions-and-services.md` §1, §7, §8, §9.

# 7 Second pass (2026-09-05 16:30–16:58 UTC+3) — the ad-model uniqueness check and the newly classified business models

## 7.1 Ad-supported free tier — the owner's one claimed-unique axis (companion §11.5, claim C28)

Method and result, measured this session: 47 first-party and aggregator captures swept for `\bads\b|ad-supported|advertis|sponsor`; the only hits are (a) App Store privacy labels "Developer's Advertising or Marketing" on Suno and Treblo, which are data-use disclosures and not ad units, (b) commercial-use clauses that *permit the user* to place generated music in advertisements (Beatoven, ElevenLabs, Mubert, Mureka, Soundful, Suno), and (c) Treblo's marketing line about other sites' "free" tiers. The Google Play Suno listing carries no "Contains ads" badge. Free tiers are gated by credits (Suno 50/day, ElevenLabs 10k/mo, Mureka 50 Gold/day, Gemini compute limits), by download bans (Suno, Udio, Loudly 1/day), by watermark (Ecrett, Soundraw-class), by session length (Endel ≤ 10 min) or by trial (brain.fm) — never by advertising.

**Verdict:** 0 explicit ad-supported free tiers found across 47 captured surfaces; 0 "Contains ads" badges in captured store HTML. This is an **absence-based finding and is FLAGGED**, because the owner's rule requires three positive confirmations and a measured absence is not a positive confirmation. What would close it: three independent industry sources stating that no major AI-music generator monetises free users with ads, or the Google Play "Contains ads" badge checked for every listed Android app (only Suno's was captured).

## 7.2 Business-model classes added or corrected by the second pass

| Model class | Who (source IDs in companion §11.6) | Note for PMP |
| --- | --- | --- |
| **Per-song micro-payment** (¥5–¥8 per generation, no subscription) | Tencent QQ Music "AI做歌" (S49, `[single aggregator zh]`) | the only pay-per-generation consumer model in the set; PMP's free three-take flow undercuts it at the point of first use |
| **Bundled into a general assistant** (music as one capability of a paid AI tier) | Google Gemini app — Lyria 3.5 since 2026-09-04; free standard limits, AI Plus 2×, Pro 4×, Ultra 5×/20× (S31, S32) | the newest and largest distribution channel; competes on convenience, not on a music-first surface |
| **Platform-embedded credit sub-account** | Lemonaide inside BeatStars (Starter 50 / Professional 250 seeds; Collab Club $4.99–$9.99 per model per month, no rollover) (S33) | producer-marketplace model; adjacent, not a listener product |
| **Stock-library credit ladders** (AI generation sold inside a stock-music subscription) | Artlist AI/Max tiers 7,500–4,000,000 credits/month (S37); Soundful Business/Enterprise (S35); Uppbeat (S36, 429) | licence-first businesses; prices JS-rendered or blocked, not read |
| **Functional-audio subscription** (no generation control, wellness framing) | Endel $2.99–$19.99/mo, $124.99 lifetime, free ≤ 10-min sessions (S47); brain.fm $14.99/mo, trial-only (S48) | the closest analogue to PMP's *passive listening* posture, but without prompts or takes |
| **Open-weights supply side** | ACE-Step, YuE, DiffRhythm, Magenta RT all Apache-2.0; audiocraft code MIT, weights licence `[UNVERIFIED]` (S42–S46) | commodity engines make the *experience layer* the moat, which is PMP's thesis |
| **Retired / absorbed** | Splash Pro retired 2024-04-22; Amper Music folded into Shutterstock Music (C23) | two of the earliest consumer AI-music brands did not survive as standalone businesses |
| **Corrected credit-subscription figures** | Beatoven $6 / $10 / $20 by minutes (C20, corrects §3); Loudly $10 / $30 (C21, corrects §3; costbench $14.99 / $39.99 preserved as X8); Boomy $9.99 / $29.99 ×4 (C22); Mureka $9 / $27 ×4 (C19) | the two earlier rows that carried the wrong figures are superseded, not deleted |
| **Channel pricing divergence** | Google Flow Music web $8 / $24 / $64 vs iOS IAP $7.99 / $24.99 / $64.00 (X10); Suno iOS Premier yearly $289 vs web $288 (C27) | if PMP ever sells through the App Store, expect Apple tier rounding to change the published number |

## 7.3 What changed in the recommendation

Nothing in the second pass weakens P1 (ad-funded listening) or P5 (paid export/keep lane) as the combination no competitor has; two facts sharpen it. First, the Gemini app now gives every consumer free music generation inside an assistant they already open, so PMP's differentiation cannot be "free generation" alone — it has to be the *prepared listening session* (three takes ready, skip-and-continue, no create-then-wait loop). Second, the ad-model uniqueness is real in the measured text but FLAGGED for lack of positive confirmations; it should be stated in product copy as "no subscription, no credits" (first-party-provable) rather than "the only ad-supported one" until the three confirmations exist.

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
