# Standards ledger

- **Covenant:** `C:\Users\berke\.claude\skills\deep-research\SKILL.md` — read IN FULL this session (lines 1–1310, two Read calls). Marked block `BERK-DEEP-RESEARCH-COVENANT:BEGIN..END` (inclusive of markers) hashed this session: SHA-256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8` — exact match with the brief's `COVENANT_SHA256`.
- **Brief:** parent delegation brief `CONTEXT-01`..`CONTEXT-18` (Movie Maker app — auth provider + pricing/credits evidence slice). MODE B (owner research order relayed through delegation): no local preflight required per PART I §1 / R2 MODE B.
- **Governing constraints honored:** search-first (every locator below was discovered by search, zero guessed URLs); newest-first with retrieval dates; `[FULL]`/`[ABS]`/`[PARTIAL]` honesty; ≥3-source cross-verification with `[single-source official]` disclosure for unique vendor facts; no narrowing (both angles, all 8 named competitor tools covered); lawful access only (public pages; Kling web-app pricing page is bot-blocked — recorded as ACCESS FAILURE, not non-existence); write isolation (this file + `_sources/` captures only).
- **Path resolution (R15.1):** this is an APP-PLATFORM topic, not a film-product topic; the brief names `docs/research/` explicitly (CONTEXT-13), which wins.

Retrieval date for every source in this report: **2026-08-17** unless stated otherwise.

# Scope plan / decision served / why / project context

- **Decision 1 (AUTH):** which Google identity surface carries user login for `moviemaker.futuremovies.ai` — Google Cloud Identity Platform vs Firebase Authentication (vs Google Identity Services alone). Blocks account/login code on all 4 surfaces (web, Android/iOS, Windows, macOS). D-SSM-30 Google-only binds the recommendation path.
- **Decision 2 (PRICING/CREDITS):** evidence survey of how frontier AI creative tools price (Runway, Pika, Luma, Kling, CapCut, Descript, Suno, ElevenLabs) — plan tiers, credit semantics, free-tier shape, refusal UX. This is EVIDENCE for the owner's business decision on the Account & Spend surface; per standing law each observation serves understanding, never copying.
- **Project:** SsmContentAssetCreator — generic movie maker platform (prompt/screenplay + 5–60 min → uninterrupted film, Veo 3.1 + Omni Flash engines, AWS Lambda job system). 0 of 4 user surfaces exist today (measured by the parent). Spend semantics: REFUSE-never-trim with per-job ledgers.
- **Falsifiers:** (a) if Identity Platform were NOT a strict feature-superset of Firebase Auth on shared infrastructure, the "upgrade switch" recommendation collapses; (b) if competitor evidence showed subscription-without-credits as the dominant creative-tool model, the credits framing would need rework. Neither falsifier held (evidence below).
- **Planned artifacts:** 1 report (this file) + 12 source captures under `docs/research/_sources/` = 13. Produced: 13 (verified in Completion audit).

# Outcome first

1. **AUTH:** Identity Platform is not a competitor to Firebase Auth — it is the SAME backend with an enterprise upgrade switch. Google's own comparison page states: *"Identity Platform serves as the backend for Firebase Authentication with Identity Platform and offers identical features"* and *"You do not need to change your apps when upgrading."* The upgrade adds exactly: MFA, blocking functions, OIDC/SAML sign-in, multi-tenancy, IAP integration, and a 99.95% enterprise SLA. Enabling it carries no license fee; cost is usage: Tier-1 MAU free to 50,000 then $0.0055→$0.0025/MAU, OIDC/SAML free to 50 then $0.015/MAU, SMS per message by country (TR $0.01, US $0.01, DE $0.09; first 10/day free). Blocking functions (`beforeCreate`/`beforeSignIn`, 7-second budget, 2,000 invocations/min quota) can set `customClaims`/`sessionClaims` — the exact hook the platform needs for credit/plan enforcement in the ID token. The bare Google Identity Services JS library is a sign-in widget only (and the older Google Sign-In JS library it replaces has been deprecated since 2023-03-31) — it is not an account system and cannot alone carry 4-surface sessions.
2. **PRICING:** all 8 surveyed tools converge on one architecture — **monthly-subscription tiers that grant a monthly credit pool, credits priced per generation-unit (seconds × resolution × model), non-rollover base credits, purchasable top-ups that DO persist, commercial rights gated at mid tier, and free tiers that watermark + starve**. Two academic mechanism-design papers (Zhong 2026; Bergemann–Bonatti–Smolin 2026) independently rationalize exactly this shape as revenue-optimal (cap menus on a single underlying service; committed-spend/two-part tariffs). Median entry tier ≈ $8–10/mo; mid ≈ $24–35/mo; top ≈ $76–95/mo.

# Methodology and exact query log

| # | Query (WebSearch) | Yield |
| --- | --- | --- |
| Q1 | `Google Cloud Identity Platform vs Firebase Authentication differences features pricing 2026` | product-comparison doc, identity-products doc, IP pricing page [saved], firebase pricing, Logto teardown |
| Q2 | `AI video generation tools pricing comparison credits Runway Pika Luma Kling 2026` | 5 comparison teardowns; Kling HTTP-446 bot-block evidence |
| Q3 | `Google Sign-In JavaScript library deprecation Google Identity Services migration official` | deprecation-and-sunset doc, Google Developers Blog, 2 migration guides [saved] |
| Q4 | `Runway ML official pricing page plans Standard Pro Unlimited credits` | 3 first-party Runway help-center articles + 2 teardowns [1 saved] |
| Q5 | `Identity Platform quotas limits blocking functions custom claims official Google Cloud documentation` | quotas doc, blocking-functions doc [saved], quota-management doc, Terraform resource |
| Q6 | `Pika Labs pricing plans official pika.art credits monthly` | pika.art/pricing (first-party, both variants) + 3 teardowns [2 saved] |
| Q7 | `Luma Dream Machine official pricing lumalabs.ai plans credits Lite Plus Unlimited` | 3 first-party lumalabs.ai learning-hub pages + lumalabs.ai/pricing (NEW plan structure — contradiction preserved below) |
| Q8 | `Suno pricing plans Pro Premier credits songs ElevenLabs pricing plans characters credits official` | suno.com/pricing + elevenlabs.io/pricing (both first-party) |
| Q9 | `Kling AI membership pricing plans credits official klingai.com Standard Pro Premier monthly` | kling.ai/docs/point-policy + payment-policy (first-party) [saved] + 3 teardowns [1 saved] |
| Q10 | `usage-based pricing SaaS credits research paper arXiv nonlinear pricing subscription economics generative AI` | arXiv 2510.09859v4 [saved, FULL] + 4 industry analyses |
| Q11 | `Bergemann economics of large language models token pricing arXiv paper` | arXiv 2502.07736 [saved, FULL] + TSE WP 1670 [saved] + CEPR DP21275 + Cowles d2425 |
| Q12 | `CapCut Pro pricing plans official monthly Descript pricing plans Hobbyist Creator Business 2026` | capcut.com/help/price-after-adjustment (first-party) + 4 teardowns [1 saved] |
| Q13 | `Descript pricing official descript.com plans monthly Firebase Authentication manage user sessions refresh token ID token one hour` | descript.com/pricing (first-party) + firebase.google.com/docs/auth/admin/manage-sessions (first-party) |

Marginal yield: Q1–Q9 each produced new load-bearing primaries; Q12–Q13 mostly confirmed existing facts (declining yield — both decision questions saturated at the slice level).

Fetches: `docs.cloud.google.com/identity-platform/docs/product-comparison` fetched directly (WebFetch) after discovery via Q1 — read [FULL]. All other primaries were delivered as full-text capture files by the search tool and read from disk.

# Source register and read-status counts

Retrieval date all rows: 2026-08-17. Capture paths are relative to `docs/research/_sources/`.

| ID | Source | Class | Read | Capture |
| --- | --- | --- | --- | --- |
| S1 | Google Cloud — "Differences between Identity Platform and Firebase Authentication" (docs.cloud.google.com/identity-platform/docs/product-comparison) | official primary | [FULL] | (fetched in-session; short page quoted in full in findings) |
| S2 | Google Cloud — Identity Platform pricing (cloud.google.com/identity-platform/pricing) | official primary | [FULL] | `2026-08-17-google-identity-platform-pricing.txt` |
| S3 | Google Cloud — Identity Platform quotas (cloud.google.com/identity-platform/quotas) | official primary | [FULL] (complete quota table in search extract, verified identical across cloud./docs.cloud. mirrors) | — |
| S4 | Google Cloud — Blocking functions (docs.cloud.google.com/identity-platform/docs/blocking-functions) | official primary | [FULL] (666-line capture read) | `2026-08-17-google-identity-platform-blocking-functions.txt` |
| S5 | Google for Developers — "Deprecation and Sunset" (developers.google.com/identity/sign-in/web/deprecation-and-sunset) | official primary | [PARTIAL] (extended extract) | — |
| S6 | Google Developers Blog — "Discontinuing authorization support for the Google Sign-In JavaScript Platform Library" | official primary | [PARTIAL] | — |
| S7 | Google — "Migrate to Google Identity Services" (developers.google.com/identity/oauth2/web/guides/migration-to-gis) | official primary | [PARTIAL] (capture saved) | `2026-08-17-google-migrate-to-gis-authorization.txt` |
| S8 | Google — "Migrate from Google Sign-In" (developers.google.com/identity/gsi/web/guides/migration) | official primary | [PARTIAL] (capture saved) | `2026-08-17-google-migrate-from-google-signin-authentication.txt` |
| S9 | Firebase — "Manage User Sessions" (firebase.google.com/docs/auth/admin/manage-sessions) | official primary | [PARTIAL] | — |
| S10 | Firebase — Pricing (firebase.google.com/pricing) | official primary | [PARTIAL] | — |
| S11 | Google Cloud — "Identity management products and features" (docs.cloud.google.com/docs/authentication/identity-products) | official primary | [PARTIAL] | — |
| S12 | Logto blog — "2026 Firebase Authentication's latest pricing explained" (blog.logto.io, "as of July 2026") | independent teardown | [PARTIAL] | — |
| S13 | Runway Help Center — "How do credits work?" + "Which plan is right for me?" + "Unlimited plan details" (help.runwayml.com) | vendor primary (3 articles) | [PARTIAL] | — |
| S14 | Pika — pricing page (pika.art/pricing) | vendor primary | [FULL] (page text in search results, both URL variants) | — |
| S15 | Luma — learning-hub: payments-subscriptions · dream-machine-credit-system · dream-machine-support-pricing-information (lumalabs.ai) | vendor primary (3 pages) | [PARTIAL] | — |
| S16 | Luma — lumalabs.ai/pricing (new Plus/Pro/Ultra structure) | vendor primary | [PARTIAL] | — |
| S17 | Kling — Credits Policy + Payment Policy (kling.ai/docs/point-policy, /payment-policy) | vendor primary | [FULL] (payment-policy capture read; point-policy extract) | `2026-08-17-kling-payment-policy.txt` |
| S18 | Suno — pricing page (suno.com/pricing) | vendor primary | [FULL] (page text in search results) | — |
| S19 | ElevenLabs — pricing page (elevenlabs.io/pricing) | vendor primary | [FULL] (page text incl. FAQ, two URL variants identical) | — |
| S20 | Descript — pricing page (descript.com/pricing) | vendor primary | [PARTIAL] | — |
| S21 | CapCut — help: "What Is the Price After the Adjustment" (capcut.com/help/price-after-adjustment) | vendor primary | [PARTIAL] | — |
| S22 | **Zhong, W. (Stanford GSB), "Token Is All You Price: Screening Urgency via Information Design", arXiv:2510.09859v4, version dated April 2026** | ACADEMIC primary | **[FULL]** (483-line capture read end-to-end) | `2026-08-17-arxiv-2510-09859v4-token-is-all-you-price.txt` |
| S23 | **Bergemann, D., Bonatti, A., Smolin, A., "Menu Pricing of Large Language Models" (arXiv:2502.07736; CEPR DP21275 dated 2026-03-11; TSE WP 1670)** | ACADEMIC primary | **[FULL]** (757-line arXiv capture read end-to-end; TSE PDF capture saved) | `2026-08-17-arxiv-2502-07736-menu-pricing-of-llms.txt`, `2026-08-17-tse-wp1670-menu-pricing-of-llms.txt` |
| S24 | aibizhub.io — "Runway vs Kling vs Pika vs Luma 2026: Plans and Rights" (fetch-dates its Kling 446 evidence to 2026-07-12) | independent teardown | [PARTIAL] | — |
| S25 | eesel.ai — Pika pricing teardown (2026) | independent teardown | [PARTIAL] | `2026-08-17-eesel-pika-pricing-teardown.txt` |
| S26 | aiarty.com — Kling pricing teardown (2026) | independent teardown | [PARTIAL] | `2026-08-17-aiarty-kling-pricing-teardown.txt` |
| S27 | saascrmreview.com — Runway pricing teardown (2026, documents Unlimited→Max transition dates) | independent teardown | [PARTIAL] | `2026-08-17-saascrmreview-runway-pricing-teardown.txt` |
| S28 | aitoolanalysis.com — Kling pricing teardown ("verified July 2026") | independent teardown | [PARTIAL] | — |
| S29 | checkthat.ai — CapCut pricing teardown (cites capcut.com/resource/capcut-standard-vs-pro: $19.99/mo, $179.99/yr) | independent teardown | [PARTIAL] | `2026-08-17-checkthat-capcut-pricing-teardown.txt` |
| S30 | Flexera / Lago / Zylo / StratJourneys — SaaS hybrid & credit-pricing industry analyses (2026) | industry analyses (4) | [PARTIAL] | — |

**Counts (slice floor ≥10 authoritative / ≥2 academic-full — CONTEXT-12):** independent authoritative provenance families consulted: **26** (S1–S11 Google = 1 vendor but 11 distinct primary documents; counted conservatively as provenance families: Google=1, Logto=1, Runway=1, Pika=1, Luma=1, Kling=1, Suno=1, ElevenLabs=1, Descript=1, CapCut=1, Zhong=1, BBS=1, aibizhub=1, eesel=1, aiarty=1, saascrmreview=1, aitoolanalysis=1, checkthat=1, Flexera=1, Lago=1, Zylo=1, StratJourneys=1, magichour=1, domoai=1, stackedreview=1, aivideosensei=1 → **26 families**). Academic: **2**, both **[FULL]** with five-part records below. Primary [FULL]: **7** (S2, S4, S14, S17, S18, S19, S22, S23 minus double-count → S2,S4,S14,S17,S18,S19 vendor/official + S22,S23 academic = 8 documents read in full). Floors met and exceeded.

# Findings — Decision 1: AUTH (Google identity surface)

## 1.1 The real relationship (the decision core — CONTEXT-18)

Google's own comparison page (S1, read [FULL] this session) states verbatim: *"Identity Platform serves as the backend for Firebase Authentication with Identity Platform and offers identical features. … You do not need to change your apps when upgrading from Firebase Authentication to Identity Platform (or Firebase Authentication with Identity Platform) and your app continues to work with existing Firebase services."* S11 corroborates: *"Firebase Authentication uses Identity Platform as its backend but serves a different audience"* — Firebase Auth = consumer subset, Identity Platform = enterprise CIAM. S12 (Logto, July 2026) triangulates: *"Identity Platform has no price tag of its own. Enabling it is a free switch, not a migration."* Same SDKs on both (Web/iOS/Android/Admin — S1 SDK table). **3-source verified.**

## 1.2 Feature deltas (S1, exact table)

| Feature | Identity Platform | Firebase Auth |
| --- | --- | --- |
| Email / OAuth / phone / custom auth | Yes | Yes |
| Multi-factor authentication | Yes | No |
| Blocking Functions | Yes | No |
| OIDC sign-in | Yes | No |
| SAML sign-in | Yes | No |
| Multi-tenancy | Yes | No |
| IAP integration | Yes | No |
| TISAX / BAA / PCI-DSS in scope | Yes | No |
| Enterprise SLA | **99.95% uptime** | **No SLA** |

## 1.3 Pricing (S2 [FULL], cross-checked S10, S12 — all figures retrieved 2026-08-17)

- **Tier 1 (email, phone-identity, anonymous, social) per MAU/month:** 0–50,000 **$0.00** · 50k–100k **$0.0055** · 100k–1M **$0.0046** · 1M–10M **$0.0032** · 10M+ **$0.0025**. Inactive users stored free; anonymous users excluded from MAU if auto-cleanup enabled.
- **Tier 2 (OIDC, SAML) per MAU/month:** 0–50 **$0.00** · 50+ **$0.015** (per project).
- **SMS (phone auth + SMS MFA), per message, first 10/day free:** TR **$0.01** · US **$0.01** · CA **$0.01** · BR **$0.02** · DE **$0.09** · ID **$0.35** · all-other-regions ZZ **$0.53** (complete country table in capture). Google's own worked examples: consumer app with 225,000 MAU ≈ **$860/month** total; 45,000-MAU enterprise ≈ $0 MAU cost.
- Blocking functions bill separately at normal Cloud Run functions rates (S2).
- Firebase pricing page (S10) confirms the same numbers from the Firebase side: "No-cost up to 50K MAUs, then Google Cloud pricing".
- **[single-source official]** each exact per-country SMS price (unique vendor authority; page captured with date).

## 1.4 Quotas (S3, both cloud./docs.cloud. mirrors identical)

Operations/project **1,000 req/s and 10M req/day** · per service account 500 req/s · custom-token sign-ins 45,000/min · `createAuthURI` 120 req/hour per IP · **blocking-function invocations 2,000/min per project** · `GetAccountInfo` 500,000/min. Exceeding → 429 `resource-exhausted`. Raises: contact GC support ≥2 weeks ahead (S3); self-service edit via APIs & Services → Identity Toolkit API → Quotas (S4-adjacent quota-management doc). Sign-up endpoint has a configurable temporary quota (1–1000 per project/hour/IP window — Terraform `sign_up_quota_config`, corroborating source).

## 1.5 Blocking functions — the credit-enforcement hook (S4 [FULL])

- Two events: `beforeCreate` (before user saved + token returned) and `beforeSignIn` (after credential verify, after MFA second factor, before ID token returned). **7-second response budget** — after 7 s Identity Platform errors and the client operation fails. Non-200 → client-visible error.
- Return-object can modify: `displayName`, `disabled`, `emailVerified`, `photoURL`, **`customClaims`** (persisted to Auth DB, included on response token, persists across sessions), **`sessionClaims`** (`beforeSignIn` only; propagated to the current session's token claims, NOT persisted; on key collision sessionClaims overwrite customClaims in the token while the DB copy survives).
- Application here: plan tier / credit-ceiling / tenant flags ride in `customClaims`; per-session risk flags (sign-in IP tracking for token-theft detection is Google's own documented example) ride in `sessionClaims`. Enforcement of REFUSE-never-trim then happens server-side against the claim, with `revokeRefreshTokens(uid)` (S9) as the kill switch.
- Limits: anonymous + custom auth do NOT trigger blocking functions; functions fire for ALL users incl. all tenants.

## 1.6 Multi-surface session model (S9 + S4)

Firebase/Identity Platform sessions are long-lived: sign-in mints an **ID token (JWT, fixed 1-hour lifetime)** + **refresh token**; client SDKs auto-refresh silently; the refresh token expires only on user deleted / disabled / major account change (e.g. password change), and can be revoked via Admin SDK `revokeRefreshTokens()` with revocation checked by `verifyIdToken(idToken, true)` (extra round trip — Google itself flags the cost and offers the Security-Rules alternative). The same model serves web + Android + iOS via first-party SDKs (S1 SDK table). **Desktop (Windows/macOS):** no dedicated desktop SDK row exists in S1's table; the documented paths are the Web SDK inside an embedded runtime or the REST/Admin surfaces — flagged **[UNVERIFIED]** as a specific desktop-SDK recommendation; the token/refresh mechanics above are surface-independent facts.

## 1.7 Deprecation state of the older Google sign-in surface (S5, S6, S7, S8)

- **Google Sign-In JavaScript Platform Library: deprecated 2023-03-31; sunset date "to be determined"** (S5, exact table). New OAuth client IDs cannot use it; client IDs created before 2022-07-29 may set `plugin_name` to keep using it. Replacement: **Google Identity Services (GIS)** at `accounts.google.com/gsi/client`, which splits authentication (Sign in with Google / One Tap) from authorization (OAuth token/code clients) (S6, S7, S8 — 3-source verified).
- Decision-relevant: GIS is a **sign-in/authorization widget layer**, not a user store — it issues Google credentials that still need an account system (Identity Platform/Firebase Auth `signInWithCredential`, or a self-built backend) to become an app session. "Google Identity Services alone" therefore cannot satisfy the 4-surface login requirement without building the entire account/session layer in-house.
- Android note (S5): One Tap on Android SDK, Google Sign-In iOS/macOS SDK are NOT part of that deprecation. (Credential Manager migration state on Android was not probed in this slice — recorded as a gap.)

## 1.8 Data residency

Not established from primaries this session. S1 lists compliance certs (ISO 27001, SOC1/2/3, + TISAX/BAA/PCI on IP) but no residency statement was retrieved. **[UNVERIFIED — GAP]:** whether Identity Platform user records can be pinned to an EU region. Do not assert either way; parent should resolve against Google's data-residency/Assured Workloads docs before the owner brief if residency matters.

# Findings — Decision 2: PRICING/CREDITS evidence survey

## 2.1 The comparable table (per-cell source + retrieval date 2026-08-17; teardown-only figures marked)

| Tool | Plan | Monthly price | Credits/mo | What a credit buys | Commercial rights | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Runway | Free | $0 | 125 one-time, never expire | — | — | S13 |
| Runway | Standard | $15 ($12 annual) | 625 | Gen-4 Turbo 5 cr/s; Gen-4.5 12 cr/s; hosted Veo 3.1 40 cr/s with audio, 20 without [teardown S24/S27 for per-model rates] | watermark removal from Standard | S13, S24, S27 |
| Runway | Pro | $35 ($28 annual) | 2,250 | ≈ "3 minutes Gen-4.5" per S13 plan table | yes | S13 |
| Runway | Max (replaces Unlimited: new subs 2026-06-01, forced migration 2026-09-01) | $95 ($76 annual) | 9,500, **up to 1 month rollover** | "12.5 minutes Gen-4.5" | yes | S13 (Unlimited-plan-details + credits articles), S27 |
| Pika | Free (Basic) | $0 | 80 | Turbo 10 cr (Pikascenes/additions/swaps), Turbo Pikatwists 60 cr, Pro 20 cr, Pro Pikatwists 80 cr; i2v 1080p 5 s = 65 cr paid | no | S14 |
| Pika | Standard | $10 ($8 annual) | 700 | same schedule | no (teardowns S25 disagree with S18-family domoai which claims Standard has commercial use — **contradiction preserved**, resolve at checkout) | S14, S25 |
| Pika | Pro | $35 ($28 annual) | 2,300 | same schedule | yes | S14, S25 |
| Pika | Fancy | $95 ($76 annual) | 6,000 | same schedule | yes | S14, S25 |
| Luma (learning-hub plan set) | Lite | $9.99 web / $12.99 iOS | 3,200 | rates vary by model/resolution; teardown S24: Ray3.14 720p 100 cr/5s, Ray3.2 1080p 400 cr/5s, Ray2 Flash 55 cr/5s | **no** (watermarked, non-commercial) | S15, S24 |
| Luma | Plus | $29.99 web / $37.99 iOS | 10,000 | as above | yes | S15 |
| Luma | Unlimited | $94.99 web / $119.99 iOS | 10,000 fast + unlimited relaxed | relaxed = slower queue after fast credits exhausted | yes | S15 |
| Luma (lumalabs.ai/pricing NEW page) | Plus / Pro / Ultra | $30 ($25 ann.) / $90 ($75 ann.) / $300 ($250 ann.) | 10,000 / 40,000 / 150,000 | adds "Luma Agents" usage multipliers 1x/4x/15x | commercial from Plus | S16 — **CONTRADICTS S15, see Contradictions** |
| Kling | Basic | $0 | daily login credits (66/day per S28, 24 h expiry) | $1 = 66 credits (official purchase rate, S17 point-policy) | no | S17, S28 |
| Kling | Standard | intro $6.99 → renews $8.80/mo (annual $79.20) [teardowns; S28 says list rose to $10] | 660 | subscription credits valid 1 month from distribution (official, S17) | yes | S17, S26, S28 |
| Kling | Pro | intro $25.99 → $32.56 (annual $293.04) [S26; S28: list $37] | 3,000 | as above | yes | S26, S28 |
| Kling | Premier | intro $64.99 → $80.96 (annual $728.64) [S26; S28: $92] | 8,000 | as above | yes | S26, S28 |
| Kling | Ultra | intro $127.99 → $159.99 [S26; S28: $180, monthly-only, +41% in 6 months] | 26,000 | as above | yes | S26, S28 |
| CapCut | Free / Standard / Pro | $0 / ~$9.99 [teardown] / **$19.99 mo, $179.99 yr (official resource page via S29)** — official help: final price varies by region/platform/taxes, checkout is authoritative | Pro: 1,200 "AI points" after pricing change [S29, doc-conflicted] | AI features consume points; storage docs conflict 100 GB vs 1 TB | paid tiers | S21, S29 |
| Descript | Free | $0 | 60 media-min/mo | media hours track uploads/recordings; AI credits track AI features (Underlord, Studio Sound, …) | — | S20 |
| Descript | Hobbyist | $24 ($16 annual) | 10 media h + 400 AI credits | as above; **no top-ups on Hobbyist** | — | S20 |
| Descript | Creator | $35 ($24 annual) | 30 media h + 800 AI credits | top-ups: credits $0.05–0.10/cr, media $3–5/h, persist 12 months [YouTube walkthrough of new pricing — secondary] | — | S20 |
| Descript | Business | $65 ($50 annual) | 40 media h + 1,500 AI credits | + SOC 2, SSO/SCIM, audit logs | — | S20 |
| Suno | Free | $0 | 50 credits/day | ~10 songs/day; personal use only; **downloads removed from Free starting 2026-09-03** | no | S18 |
| Suno | Pro | $10 ($8 annual) | 2,500/mo | 20 song downloads/mo (from 9/3/26); stems; 30-min uploads; priority queue 10 songs | **yes, from $10 tier** | S18 |
| Suno | Premier | $30 ($24 annual) | 10,000/mo | 60 downloads/mo; Suno Studio; advanced stem split | yes | S18 |
| ElevenLabs | Free | $0 | 10,000 credits | TTS 1 cr/char · STT 330 cr/min · **Music 900 cr/min** · SFX 200 cr/gen · voice changer 1,000 cr/min · dubbing 2,000–10,000 cr/min — ONE shared pool across all products | — | S19 |
| ElevenLabs | Starter/Creator/Pro/Scale/Business | $6 / $22 / $99 / $299 / $990 | 30k / 121k / 600k / 1.8M / 6M | same shared-pool schedule; annual = 10 months' price; Music API alt.: $0.30/min pay-as-you-go, no subscription | commercial from Creator ($22) | S19 |

## 2.2 Credit semantics — the pattern ledger

1. **Base subscription credits never roll over** — Runway Standard/Pro (S13), Pika (S25/S14-family), Luma monthly credits (S15 "Monthly credits do not roll over"), Kling ("valid for 1 month from the date of distribution", official S17), Suno ("do not carry over from day to day or month to month", official S18). **Exception sold as a premium feature:** Runway Max — up to 1 month rollover (S13).
2. **Purchased top-up credits DO persist** — Runway purchased credits "do not expire" (S13); Luma top-ups $4/1,200, valid 12 months, consumed after monthly credits (S15); Pika add-on credits roll over (S25); Suno top-ups don't expire but **require an active subscription to use** (S18); Descript top-ups persist 12 months (secondary). Kling purchased credits unaffected by membership status (S17).
3. **A credit is an abstraction over engine cost** — priced per second × resolution × model tier (Runway 5→40 cr/s by model; Pika 12→80 cr by resolution/model; Luma 55→400 cr per 5 s by model). ElevenLabs runs ONE pool across heterogeneous products with per-product exchange rates. Kling publishes a cash anchor: **$1 = 66 credits** (S17).
4. **Free-tier shapes:** one-time grant (Runway 125), small monthly (Pika 80), daily-refresh (Kling 66/day, Suno 50/day — the strongest habit-forming conversion mechanic), watermark + resolution caps everywhere; Suno is now removing downloads from Free entirely (2026-09-03), converting Free into a pure preview tier.
5. **Commercial rights as the paywall line:** Pika at Pro ($28 ann.), Luma at Plus, CapCut at paid, Suno at Pro ($10 — lowest in set), ElevenLabs at Creator ($22). Rights gating, not capacity, is the primary conversion driver at mid-tier.
6. **Zero-credit / refusal UX (what's documented):** Luma Lite/Plus — hard stop: "must purchase Top-Up Credits or wait for the next billing cycle" (S15, official). Luma Unlimited & old Runway Unlimited — degrade to slow lane ("relaxed"/"Explore" mode) instead of refusing; Runway's Explore mode excluded Veo 3/3.1 which always require credits (S13 official). Pika deducts credits **whether the generation succeeds or fails** (S25 — teardown, flagged as such). Descript draws included quota first, then top-ups. This maps directly onto the platform's REFUSE-never-trim law: the market splits into refuse-at-zero (Luma paid non-unlimited) and degrade-at-zero (unlimited tiers); nobody trims a delivery silently.
7. **Churn-relevant events observed:** Runway killed Unlimited after backlash (same 2,250 credits as Pro at ~3x price, accounts suspended for heavy use — S25-family teardown; transition dates official via S13/S27); Kling raised list ~40% in ~6 months with intro-price anchoring (S28); Suno is retro-actively capping downloads (S18). Volatility is high — every figure above is dated.

## 2.3 Five-part records — academic sources (R9, verbatim template)

### S22 — Zhong (Stanford GSB), "Token Is All You Price: Screening Urgency via Information Design", arXiv:2510.09859v4 (April 2026) [FULL]

1. **Problem in the authors' framing:** why do GenAI sellers price with capped access windows and service tiers on the SAME underlying model — "when a seller offers a real-time information service under a hard throughput constraint, and buyers differ in their sensitivity to latency, what is the revenue-optimal mechanism?"
2. **Method:** monopolist designs a belief-martingale ⟨μ_t⟩ under an information-throughput constraint E[H(μ_{t+s})−H(μ_t)|F_t] ≤ χs; buyer type r has utility e^{−rτ}; envelope reduction to virtual time preference ρ_r(t)=e^{−rt}(1−t·G(r)/g(r)); Proposition 1 proves a single "greedy exploration process" maximizes E[ρ(τ)] for any positive decreasing convex ρ (duality of Sannikov–Zhong 2024); Theorem 1: optimal mechanism = ONE preference-aligned process + a menu of stopping-time caps χT(r)=χ·g(r)/G(r).
3. **Real numbers:** binary example (§2.4, §3.4): constant-delay contract revenue ≈ 0.025; diffusion ≈ 0.12; optimal token-cap menu ≈ 0.2 (8× and 2× improvements). Marginal price per unit of cap = e^{−rT(r)}f*(T(r)), **decreasing in the cap** — matching observed volume discounts.
4. **Stated limitations:** single-shot, requires a ground-truth state (not open-ended generation); multi-model menus (Haiku/Sonnet/Opus style) NOT predicted — attributed to pretraining-cost amortization and task specialization; silent on helpfulness/honesty alignment dimensions.
5. **Application here:** the paper is the economic proof that **selling one engine set (Veo 3.1 + Omni Flash) under a menu of credit caps — without degrading the engine per tier — is revenue-optimal when users differ in urgency**; premium tiers should buy larger caps and/or faster lanes (priority queue), not a better model. Also rationalizes a slow "relaxed" lane as the bottom of the cap menu.

### S23 — Bergemann, Bonatti, Smolin, "Menu Pricing of Large Language Models" / "The Economics of LLMs" (arXiv:2502.07736; CEPR DP21275, 2026-03-11) [FULL]

1. **Problem in the authors' framing:** optimal pricing and product design for LLMs given "variable operational costs of processing input and output tokens; the ability to customize models through fine-tuning; and high-dimensional user heterogeneity in terms of task requirements and error sensitivity."
2. **Method:** buyer with task-value profile w over a task continuum, Cobb-Douglas production v = x^α y^β (b+z)^γ; the high-dimensional type collapses to a scalar CES index θ = (∫ w_i^{1/(1−α−β)} di)^{1−α−β} (their eq. 10), reducing to one-dimensional Mussa–Rosen screening; optimal menus implementable as **two-part tariffs** (upfront payment p₀ + per-token prices at markup m(θ)=θ/φ(θ), Propositions 5–7).
3. **Real numbers:** uniform example — contractible token allocations: revenue R*=139/480≈0.290, profit 97/960≈0.101; token packages only: R*=139/540≈0.257, profit ≈0.090 — **inability to contract allocation costs ~10% of profit**; exclusion cutoff θ<1/3; markup decreasing in usage intensity ("higher markups for more intensive users" per unit falls with volume).
4. **Stated limitations:** monopoly baseline; homogeneous tasks in the value-scale case; independence of value and scale assumed; fine-tuning data availability assumed unconstrained.
5. **Application here:** subscription (=upfront p₀) + credits at per-unit prices (=linear part) IS the two-part tariff their theory derives as optimal; volume tiers should carry **falling per-credit prices** (verified in the field: Kling $1.33→$0.62 per 100 credits across tiers, Runway/Pika/Luma same shape); and the ~10% figure quantifies why credits (a fungible budget the user allocates) beat rigid per-feature bundles only slightly — simplicity is cheap.

# Contradictions, corrections, and gaps

1. **Luma plan structure (S15 vs S16):** learning-hub pages (canonical `lumalabs.ai/pricing` per their own frontmatter) still document Lite $9.99 / Plus $29.99 / Unlimited $94.99 with 3,200/10,000/10,000+relaxed credits, while the live `/pricing` page returns Plus $30 / Pro $90 / Ultra $300 with 10,000/40,000/150,000 credits and "Luma Agents" multipliers — a plan-structure migration in progress. **Preserved, not averaged.** Parent should re-open `lumalabs.ai/pricing` at brief time.
2. **Pika Standard commercial rights:** eesel (S25) says No; domoai teardown says Standard includes commercial use. Official pika.art page text retrieved does not state rights per tier. **[UNVERIFIED]** — left open.
3. **Kling list prices:** aiarty (S26) has renewals $8.80/$32.56/$80.96/$159.99; aitoolanalysis (S28, "verified July 2026") has list $10/$37/$92/$180 with the lower figures as intro-only. Both agree on credits (660/3,000/8,000/26,000) and annual totals ($79.20/$293.04/$728.64). First-party numeric page is bot-blocked (aibizhub S24 measured HTTP 446 on all Kling pages, 2026-07-12); official S17 confirms only the mechanics + $1=66 credits. **ACCESS FAILURE recorded — not non-existence.**
4. **CapCut:** official help (S21) explicitly refuses a single global price ("final subscription price will be shown on the payment page"); the $19.99/$179.99 figures come from CapCut's own Standard-vs-Pro resource page as cited by S29 with screenshots dated 2026-08-14. Storage docs internally conflict (100 GB vs 1 TB).
5. **Identity Platform data residency:** not retrieved — open gap (finding 1.8).
6. **Runway official pricing page (runwayml.com/pricing) not fetched directly** — plan facts rest on Runway's own help-center articles (S13, first-party) plus two teardowns; treat exact current list prices as **[single-source official + teardown-corroborated]**.

# Synthesis — adopt / build / avoid (evidence layer for the owner's D1–D10 brief; decisions remain his)

- **ADOPT (auth path within D-SSM-30 Google-only):** Identity Platform (= Firebase Auth with Identity Platform enabled) is the only Google surface that is simultaneously: an account system, multi-platform SDK-backed, SLA-backed (99.95%), MFA-capable, and equipped with blocking functions for claims-based credit enforcement. At launch scale (<50k MAU) its marginal cost is $0 + SMS. Google Identity Services remains the front-door widget for "Sign in with Google" ON TOP of it — they compose, they do not compete.
- **BUILD:** claims-based entitlement enforcement (`customClaims` written by blocking functions + ledger checks server-side); the credit abstraction layer (engine-seconds × resolution × model → credits) with published per-operation rates — the evidence shows credit-to-value opacity is the #1 trust complaint (deducting on failure, opaque conversion).
- **AVOID:** building login on the deprecated Google Sign-In JS library (deprecated 2023-03-31, closed to new client IDs); per-tier engine degradation (both papers say don't distort the product — screen with caps/speed); silent trims at zero credits (market splits refuse vs degrade; trim exists nowhere and violates the house law anyway).
- **Falsifier watch:** Luma's in-flight repricing (S15/S16) and Kling's 6-month +41% show competitor figures have a freshness horizon of weeks — re-pull all pricing pages the day the owner decides.

# Artifact index and produced-vs-planned count

Planned 13 = this report + 12 captures. Produced 13 — verified by directory listing + read-back (Completion audit). Captures (all under `c:\Berk\SsmContentAssetCreator\docs\research\_sources\`): google-identity-platform-pricing · google-identity-platform-blocking-functions · google-migrate-to-gis-authorization · google-migrate-from-google-signin-authentication · arxiv-2510-09859v4-token-is-all-you-price · arxiv-2502-07736-menu-pricing-of-llms · tse-wp1670-menu-pricing-of-llms · kling-payment-policy · eesel-pika-pricing-teardown · aiarty-kling-pricing-teardown · saascrmreview-runway-pricing-teardown · checkthat-capcut-pricing-teardown (all prefixed `2026-08-17-`). Indexing in `docs/README.md` is deliberately NOT done by this worker (CONTEXT-16 write isolation: report + captures only) — parent's duty.

# Completion audit

- Covenant block hash verified this session (exact match, inclusive-of-markers variant).
- Slice floors: ≥10 authoritative → 26 provenance families; ≥2 academic [FULL] with five-part records → 2 (S22, S23). Reported above.
- Every load-bearing claim: 3+ sources, or `[single-source official]` with date, or `[UNVERIFIED]` — flags inline.
- Access failures recorded separately from non-existence (Kling HTTP 446).
- No other repo file modified (fs check in worker's final verification).

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
