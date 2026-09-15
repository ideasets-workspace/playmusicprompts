# Standards ledger

| Governing file (read from disk this session) | How this file obeys it |
| --- | --- |
| `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (covenant block sha256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8`, recomputed) | R16.4: every price is dated 2026-09-05, carries its source ID and a status; prices not readable on a first-party surface are marked `[single-source third-party]`; the source register, query ledger and claim ledger live in the companion functions-and-services file and are referenced by ID here. |
| `C:\Users\berke\.cursor\rules\00-berk-constitution.mdc` (Law Zero) | No price, credit count or cap below was written from recollection; each cell names its S-id from `2026-09-05-prompt-to-music-creation-functions-and-services.md` §7. |
| `C:\Users\berke\.cursor\rules\10-no-narrowing.mdc` | Every plan and tier of every swept competitor is listed — free tiers, add-on credits, annual equivalents, enterprise/API rungs; competitors whose plans could not be read are named with the reason, never dropped. |

# Floor status (banner removed 2026-09-05 16:58 UTC+3 — second pass)

The academic `[FULL]` floor is now met (5 primaries `[FULL]`, companion file §11.2). Pricing facts below carry their own status; the second-pass corrections and additions are in §1.16.

# Decision served

Pricing and monetisation design for the rebuilt PlayMusicPrompts surfaces (Berk, 2026-09-05): whether the free-for-visitors, ad-supported quota model (12/h, 40/day) is a differentiator or a liability against a market converged on $8–12 entry tiers with credit meters, and which limits (downloads, concurrency, commercial rights) competitors attach to each rung.

# Outcome first

1. **Entry price converged at $8–12/month (annual) for ~500–600 songs.** Suno Pro $10 ($8 annual) 2,500 credits ≈ 500 songs [S01,S02]; Google Flow Music Starter $8 3,000 credits ≈ 600 songs [S17]; Mureka Pro ≈ $9 5,000 Gold ≈ 500 songs `[single-source third-party]` [S07b]; Stable Audio Solo $12 660 credits [S11]; ElevenLabs Starter $6 30k credits ≈ 33 music-minutes [S08].
2. **Top consumer tier converged at $24–30/month** with the "studio" unlock (stems, MIDI, DAW): Suno Premier $30 ($24 annual) [S02], Flow Music Plus $24 [S17], Mureka Premier ≈ $27 [S07b], Stable Audio Session $30 [S11], Udio Pro $30 (aggregators, Q2) `[single-source third-party]`.
3. **Free tiers are daily-metered, non-commercial and increasingly export-locked:** Suno 50 credits/day (10 songs), no downloads, no commercial use [S01]; Udio 3 u-130 songs/day and NO downloads for anyone since 2025-10-29 [S04,S05]; Flow Music "daily top-up credits", 2 concurrent [S17]; Mureka free Gold expires in 24 h, downloads blocked `[3p]` [S07b]; Treblo is the outlier — unlimited, free, downloadable, no ads on the surface read [S21].
4. **Download caps are the newest lever:** Suno 20 (Pro) / 60 (Premier) song downloads per month from 2026-09-03 [S01]; Soundraw sells download counts 10 / 20 / unlimited [S14]; Mubert Free 5 downloads/month [S15]; Beatoven sells download minutes, $3/min PAYG `[3p]` [S29b]; Kits.ai sells download minutes 15 / 60 / unlimited [S23].
5. **Commercial rights attach at generation time to the plan active then, not retroactively:** Suno [S01]; Mubert "cannot use previously generated tracks in new projects after the subscription ends" [S15]; Mureka FAQ asks exactly this question [S06]; Udio (Q5, `[3p]`). ElevenLabs reportedly upgrades prior output retroactively (RightsDocket, Q2) `[single-source third-party]`.
6. **PMP position:** free ad-supported listening with no export paywall is unique among the 13 swept vendors except Treblo; the competitors' download caps show where the industry expects revenue — export, not listening.

# 1 Plan-by-plan tables (every tier read; vendor currency; A = annual-equivalent per month)

## 1.1 Suno — S01 (pricing page text), S02 (hub), S03 (home FAQ)
| Plan | Price | Credits | Songs | Downloads | Commercial | Models | Concurrency | Upload | Stems | Other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Free | $0 | 50/day (renew daily) | 10/day | "No monthly song downloads" | No | v4.5-all | 4 shared queue | ≤8 min | — | Standard features; Basic editing (crop, fade) |
| Pro | $10/mo; A $8 (S02 "Starts At $8/Month", 20% annual) | 2,500/mo | "up to 500" | 20/month "(starting 9/3/26)" | "for new songs made" | v4, v4.5, v4.5+, v5, v5.5 | 10 priority | ≤30 min | 2 types (Auto; Split from mix) | Voices, advanced editing, Custom Models, add-on credits, early access |
| Premier | $30/mo; A $24 | 10,000/mo | "up to 2,000" | 60/month (starting 9/3/26) | yes | same | 10 priority | ≤30 min | 3 types (+Advanced split) | Suno Studio, MIDI export [S03] |
| Add-on credits | "do not expire, but require an active subscription" [S01] | — | — | — | — | — | — | — | — | not on Free |

Status: credits, caps, features first-party [S01]; $8/$24 first-party [S02]; $10/$30 monthly = third-party ×3 (claim C01, 3+ verified).

## 1.2 Udio — S04, S05 (help centre, 2026-02-17)
| Plan | Price | Credits | Concurrency | Downloads | Notes |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | 10/day + 100/mo (Q2,Q5 `[3p]`); 3 u-130 (~2 min) songs/day [S04] | — | **disabled** | trials keep free limits [S04] |
| Standard | $10/mo `[3p]` | 2,400/mo (was 1,200) [S05] | — | **disabled** | +1,000 one-time non-expiring credits [S05] |
| Pro | $30/mo `[3p]` | 6,000/mo (was 4,800) [S05] | 5 sets (10 songs) at once [S05] | **disabled** | same grant |
| A-la-carte | at udio.com/pricing; "never expire" [S04] | | | | |

## 1.3 ElevenLabs (Eleven Music inside the shared credit pool) — S08, S10
| Plan | Price /mo | Credits /mo | ≈ Music min (900 cr/min) | Music commercial use | Notes |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | 10,000 | ≈11 | No | 3 Studio projects |
| Starter | $6 (A $5) | 30,000 | ≈33 | **Yes** ("Music commercial use") | Instant Voice Cloning |
| Creator | $22 (first month $11; A $18.33) | 121,000 | ≈134 | Yes | Professional Voice Cloning |
| Pro | $99 (A $82.50) | 600,000 | ≈666 | Yes | 44.1 kHz PCM via API |
| Scale | $299 (A $249.17) | 1,800,000 | ≈2,000 | Yes | 3 seats |
| Business | $990 (A $825) | 6,000,000 | ≈6,666 | Yes | 10 seats |
| Enterprise | custom | custom | — | Yes | DPA/SLA, SSO |

Rollover ≤2 months (≤3× quota) while paid; downgrade forfeits [S08]. Finetunes / Audio Reference on paid plans [S10]. API $0.15 per generated minute (CometAPI Q9 `[3p]`).

## 1.4 Google — Flow Music, Lyria APIs — S17, S18, S19
| Plan | Price /mo | Annual-equiv (whataidoineed Q11 `[3p]`) | Credits | ≈ Songs | Concurrent | Google AI mapping [S18] |
| --- | --- | --- | --- | --- | --- | --- |
| Free | $0 | — | daily top-up credits | — | 2 | — |
| Starter | $8 | $6 | 3,000/mo + top-ups | ~600 | 8 | Google AI Plus |
| Plus | $24 | $18 | 10,000/mo + top-ups | ~2,000 | 12 | Google AI Pro |
| Member | $64 | $48 | 30,000/mo + top-ups | ~6,000 | 16 | Google AI Ultra (+badge, events, swag, early access) |

Extra credits "only available on paid plans while your subscription is active" [S17]; Turntable votes earn credits [S18]. Downloads mp3/wav/m4a, stem downloads, publishing, image & video generation are listed features (per-plan allocation not readable in the capture) [S17]. API: Lyria 2 `lyria-002` **$0.06 per 30 s** [S19]; Lyria 3 Clip $0.04 / Lyria 3 Pro $0.08 per song (CometAPI Q9 `[3p]`).

## 1.5 Mureka — S06 (features first-party), S07 (API FAQ), S07b (prices `[single-source third-party]`)
| Plan | Price | Gold | ≈ Songs | Unlocks (first-party S06) |
| --- | --- | --- | --- | --- |
| Free | $0 | small daily Gold, expires 24 h `[3p]` | 2–3 test songs `[3p]` | no commercial licence |
| Pro | ≈$9/mo, A ≈$7.17 `[3p]` | 5,000/mo `[3p]` | ~500 `[3p]` | V9/V8/O2 models, commercial rights, extensions, editing, MP3 |
| Premier | ≈$27/mo, A ≈$21.59 `[3p]` | 20,000/mo `[3p]` | ~2,000 `[3p]` | 12-stem Splitter, any-style Remix, any voice as singer, Mureka Studio, MIDI/WAV |
| Metered `[3p]` | stem/MIDI extraction 100 Gold; music video 400 Gold; studio regeneration 10 Gold | | | |

API: separate wallet; top-ups valid 12 months, FIFO; paid API output carries commercial authorisation [S07]; ≈$0.045–0.05/song (CometAPI Q9 `[3p]`).

## 1.6 Treblo (ex-Sonauto) — S21, S21b
| Surface | Plan | Price | Credits | Songs | Notes |
| --- | --- | --- | --- | --- | --- |
| Consumer app | Free | $0 | none | "No daily limits" | "no usage restrictions from us on songs you create"; iOS/Android |
| Developer API | Free trial | $0 | 1,500 | 15 | all endpoints, streaming, v2 & v3 |
| | Starter | $11/mo | 20,000 | 200 | PAYG $0.06 / 100 cr |
| | Pro | $88/mo | 160,000 | 1,600 | PAYG $0.06 / 100 cr |
| | Scale | $330/mo | 660,000 | 6,600 | PAYG $0.05 / 100 cr |
| | Enterprise | $1,150/mo | 2,875,000 | 28,750 | PAYG $0.04 / 100 cr |

One song = 100 credits; `num_songs=2` = 150 credits; plan credits do not roll over; PAYG never expires; attribution required [S21b].

## 1.7 Stability AI — Stable Audio — S11 (pricing), S12, S13
| Plan | Price /mo | Credits /mo | Notes |
| --- | --- | --- | --- |
| Solo | $12 | 660 | web app + DAW plugin on all plans |
| Session | $30 | 1,800 | |
| Producer | $90 | 6,000 | |
| Studio | $199 | 14,000 | |
| Enterprise | contact | — | for >$1M annual revenue; self-hosted deployment, fine-tuning, support [S11] |

CONTRADICTION X1: user guide [S13] and a 2026 review name tiers Free/Pro/Studio/Max with 10/250/675/2,250 tracks at $11.99/$29.99/$89.99 — STALE relative to the pricing page; upload allowances Free 6 min/mo (cropped 30 s), Pro 30, Studio 60, Max 90 min (cropped 6 min) [S13]. Open weights 3.0 Small/Medium; community licence "free under $1M revenue" (Cinevva Q1 `[3p]`). API $0.20 (2.5) / $0.26 (3.0) per generation (CometAPI Q9 `[3p]`).

## 1.8 Soundraw — S14
| Plan | Monthly | Annual /mo | Downloads /mo | Formats | Rights |
| --- | --- | --- | --- | --- | --- |
| Creator | $16.99 | $11.04 | Unlimited | mp3 | background use; distribute & monetise; individuals & <10 employees |
| Artist Starter | $29.99 | $19.49 | 10 | mp3 | perpetual commercial licence, 100% royalties |
| Artist Pro | $35.99 | $23.39 | 20 | mp3, wav, stems | |
| Artist Unlimited | $50 | $32.50 | Unlimited | mp3, wav, stems | |
| Enterprise | Ask | — | Unlimited | mp3, wav, stems | API access; 10+ employees |

"Get up to 67% off with Annual"; exports stay licensed after cancellation [S14].

## 1.9 AIVA — S22 (EUR, +VAT)
| Plan | Price | Downloads /mo | Duration | Formats | Copyright |
| --- | --- | --- | --- | --- | --- |
| Free | €0 | 3 | ≤3 min | MP3 & MIDI | AIVA; credit required; no monetisation |
| Standard (annual) | €11/mo, "26% OFF" | 15 | ≤5 min | MP3 & MIDI | AIVA; limited monetisation (YouTube, Twitch, TikTok, Instagram) |
| Pro (annual) | €33/mo, "33% OFF" | 300 | ≤5:30 | all formats, HQ WAV | **owned by you**, full monetisation |

## 1.10 Mubert Render — S15
| Plan | Monthly | Annual /mo | Generations /mo | Downloads | Duration | Formats | Commercial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ambassador | Free | — | 25 (30 min/day) | 5/mo | fixed | MP3 | Non-commercial |
| Creator | $14 | $11.69 | 500 | unlimited | ≤25 min | WAV+MP3 | Non-commercial |
| Pro | $39 | $32.49 | 500 | unlimited | ≤25 min | WAV+MP3 | Commercial; Full Track Editor |
| Business | $199 | $149.29 | 1,000 | unlimited | ≤25 min | WAV+MP3 | Apps, agency, sub-licensing |

Bans on all plans: no DSP publishing, no Content ID, no standalone redistribution; non-refundable [S15]. Music API priced separately [S15b].

## 1.11 Kits.ai — S23
Free $0 (15 conversion min, 0 download min) · Starter $10 (2 voice slots, 15 download min) · Producer $30 (unlimited slots, 60 download min) · Professional $60 (unlimited download min); annual "up to 47% off"; download minutes roll over [S23].

## 1.12 Pika (Pika Music inside Pika credits) — eesel Q11 `[single-source third-party]`
Free 80 cr · Standard $8/mo annual (~$10 monthly) 700 cr, watermarked, non-commercial · Pro $28 annual (~$35) 2,300 cr, watermark-free, commercial · Fancy $76 annual (~$95) 6,000 cr. Pika's own claim: audio models "up to 20× cheaper than other audio models" [S25].

## 1.13 Beatoven.ai (S29b), Loudly (S30b), Boomy (S28) — all `[single-source third-party]`
Beatoven: Free (10 generations, no downloads) · Creator $10/mo or $100/yr (30 download min) · Visionary $20/mo or $200/yr (60 min, exclusive licence) · PAYG $3/download-minute · API contract-priced. Loudly: Free · Personal $14.99/mo ($5.99 annual) · Pro $39.99/mo ($14.99 annual; 3,000 track creations/mo, 30-min tracks) · Enterprise. Boomy: Free · Creator $9.99 · Pro $29.99 (250 downloads/mo).

## 1.14 Adobe Firefly Generate Music — S27
Inside Firefly plans (not separately priced on the surface read); free AI Assistant tier with a daily generation allowance (aimusicpreneur Q13 `[3p]`).

## 1.15 Not priced this session
Alibaba HappyShrimp (beta; no pricing in S26); Ecrett ($7.99/$24.99) and Tad AI ($8/$24) snippet-only `[UNVERIFIED]`; Splash Pro, Amper, Lemonaide — NOT FOUND IN THE SEARCHED SCOPE.

# 2 Cross-vendor comparison (normalised, 2026-09-05)

| Vendor | Entry paid /mo | ≈ at entry | Top consumer /mo | Free allowance | Free download? | Rights attach | Export caps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Suno | $10 ($8 A) | 500 songs | $30 ($24 A) | 10 songs/day | No | at generation, paid only | 20 / 60 downloads per month from 2026-09-03 |
| Udio | $10 `[3p]` | 2,400 cr | $30 `[3p]` | 3 songs/day | **nobody can download** | at generation | 0 |
| ElevenLabs | $6 | ≈33 min | $99 (Pro) | ≈11 min/mo | yes (non-commercial) | retroactive upgrade `[3p]` | none stated |
| Google Flow Music | $8 | 600 songs | $64 | daily top-ups | downloads listed as plan feature | — | not readable |
| Mureka | ≈$9 `[3p]` | 500 songs | ≈$27 `[3p]` | 2–3 songs `[3p]` | blocked `[3p]` | at generation | metered stems/MIDI |
| Treblo | free | unlimited | free | unlimited | **yes** | "no usage restrictions from us" | none |
| Stable Audio | $12 | 660 cr | $199 | (free tier absent from pricing page) | — | Creator licence Pro+ `[3p]` | upload minutes |
| Soundraw | $16.99 ($11.04 A) | unlimited mp3 | $50 | trial | — | perpetual | 10 / 20 / unlimited |
| AIVA | €11 (A) | 15 downloads | €33 (A) | 3 downloads/mo | yes (credit AIVA) | Pro = ownership | 3 / 15 / 300 |
| Mubert | $14 ($11.69 A) | 500 gens | $199 | 25 gens/mo, 30 min/day | 5/mo | plan-bound, no DSP | licence certificate |
| Kits.ai | $10 | 15 download min | $60 | 15 conversion min | 0 download min | — | download minutes |
| PlayMusicPrompts (today) | free | 12/h, 40/day takes | — | 12/h, 40/day | share link /t/<id>; no export paywall | — | none |

# 3 Application to PlayMusicPrompts (pricing design implications)

- Keep the ad-supported free listening lane (unique with Treblo) and design the "export / keep" lane as the monetisation lever every competitor uses — download caps, stems, WAV, MIDI (G06/G07 in the companion file).
- Songs-per-month is the market's mental unit (5 credits = 1 song at Suno; 100 credits at Treblo; ~5 credits at Flow). If PMP ever prices, publish "takes per month", not credits.
- Concurrency is sold explicitly (2/8/12/16; 4 vs 10; 5×2). PMP's 3-take prepare-ahead queue is effectively "3 concurrent" for free — state it as a feature.
- Listener labour (Turntable A/B votes → credits [S18]) is a proven exchange; PMP's skip/complete telemetry could earn quota the same way without rewarded ads.

Source register, query ledger and claim ledger: `2026-09-05-prompt-to-music-creation-functions-and-services.md` §1, §7, §8, §9 (contradictions X1–X5 apply here).

## 1.16 Second pass (2026-09-05 16:30–16:58 UTC+3) — corrections and newly priced names (source IDs in the companion file §11.6; claims C18–C29; contradictions X6–X10)

**Corrections to §1.13 (C17 superseded):**
- Beatoven: Creator **$6/mo = 15 min**, Visionary **$10/mo = 30 min**, **$20/mo = 60 min**, PAYG $3/min, Free 5 generations — 5 aggregators agree (C20); the earlier "$10 / $20" two-source row was wrong. First-party `/pricing` still 404.
- Loudly: Personal **$10/mo or $8/mo annual = 2,500 credits**; Pro **$30/mo or $24/mo annual = 10,000 credits**; Free 30-s cap + 1 download/day — 3 aggregators agree (C21); costbench's $14.99 / $39.99 (the earlier row) is preserved as contradiction X8. First-party page is JS-rendered.
- Boomy: Free (25 saves, 1 release, no downloads) / Creator **$9.99** (500 saves, 3 releases/mo, 10 MP3) / Pro **$29.99** (unlimited saves, 10 releases, commercial); annual −17 % — 4 aggregators agree (C22); the JS shell exposes no pricing endpoint.
- Mureka (§1.5): Free 50 Gold/day; Pro **$9/mo or $86/yr = 5,000 Gold**; Premier **$27/mo or $259/yr = 20,000 Gold** — now 4 aggregators (C19); first-party `/pricing` 404, `/subscribe` JS.

**App Store price lists read from listing text (USD, C26–C27):**
- Suno iOS: Pro Plan $10.00 / Premier Plan $30.00 monthly; Pro $96.00 / Premier $289.00 yearly; credit packs 500 = $4.00, 1,000 = $8.00, 2,000 = $16.00, 4,000 = $30.00; "1 Download Credit" $2.99 and $4.99. Google Play Suno: 10M+ downloads, updated 2026-09-01, IAP present, no "Contains ads" badge.
- Google Flow Music iOS: Starter $7.99/mo or $70.99/yr; Plus $24.99/mo or $214.99/yr; Member $64.00/mo or $569.99/yr; 1,000 credits $5.99 — differs from the web page's $8 / $24 / $64 (X10; both first-party, channel pricing).
- Treblo iOS (GB listing): no In-App Purchases block in the listing text — consistent with "free, no daily limits".
- ElevenMusic iOS: App Store page **429 ACCESS FAILURE**; iTunes JSON confirms Free app, 6 screenshots. Udio and Mubert: Free apps per iTunes JSON; IAP lists not read.

**Newly priced or newly classified (§1.15 items closed):**
- Gemini app (Google): Lyria **3.5** music generation for all users since 2026-09-04; free = "standard limits"; AI Plus 2×, Pro 4×, Ultra 5×/20× compute limits; Workspace editions 30-s tracks 10/10/50/60/100 per day, ≤ 3-min tracks 5/5/20/30/50 per day (C18, first-party).
- Lemonaide (BeatStars, adjacent MIDI/loop generator): Starter 50 / Professional 250 seed credits per month within BeatStars plans; Collab Club $4.99 per model per month (Professional) or $9.99 (others), 150 credits per model per month, no rollover (C24).
- Tad AI: from **$8/mo** (first-party hub); Standard $10/mo or $8 annual = 500 credits, upper tier $30/mo or $25 annual = 3,000 credits `[single aggregator]`.
- Ecrett Music: Free (watermarked) / Individual $4.99/mo annual / Business $14.99/mo annual `[single aggregator]`.
- Tencent QQ Music "AI做歌": **pay-per-generation ¥5 (entry) / ¥8 (lyric mode)** — the only per-song micro-payment model in the set `[single aggregator zh]` (C29).
- Endel (adjacent): IAP $2.99–$19.99 monthly, $34.99–$119.99 yearly, Lifetime $124.99 (Apple listing); free = ≤ 10-minute sessions. brain.fm (adjacent): $14.99/mo (7-day trial) or $99.99/yr (14-day trial); no free tier.
- Artlist: AI plans sold by monthly credits (AI Starter from 7,500 cr; music from 16,500 cr; AI Creator/Professional/Pro Plus 80k–4M cr; Max 7,500–120k cr incl. stock) — dollar figures JS-rendered, **not read**. Soundful: tiers and licence scope captured, **dollar figures not in HTML**. Uppbeat: **429 ACCESS FAILURE**.
- Retired / discontinued, excluded from the live set: Splash Pro (2024-04-22), Amper Music (folded into Shutterstock after the 2020-11-11 asset acquisition) (C23).

**Ad-supported free tier:** none found on any captured surface (0 of 47 captures; companion §11.5) — recorded as an absence-based, FLAGGED finding, not as three positive confirmations.

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
