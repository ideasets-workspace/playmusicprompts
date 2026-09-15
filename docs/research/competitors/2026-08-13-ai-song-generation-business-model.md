# Standards ledger

Governance files read IN FULL this session, before any external action:

| Governing file | Path | Evidence |
|---|---|---|
| Deep-research covenant (merged rule + skill; PART I + R0–R18 + annexes P1–P5) | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` | SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes, re-hashed from disk this session |
| Project contract | `c:\Berk\SsmContentAssetCreator\AGENTS.md` | SHA-256 `D18A2C1CD201C4C3BFDB9F62FF22502C5B48CDCBA201C2728EC7ABB4083B1B4E` |
| Research standard + delegation mandate | `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session |
| Approved R3 scope plan | `c:\Berk\SsmContentAssetCreator\docs\research\_runs\2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session |

Governed research root per R15.1/R18.4: `docs/research/`. Artefact language: ENGLISH; the owner's Turkish appears only as verbatim quoted evidence.

**This document is not legal advice.** It reports what vendor contracts, court decisions and official announcements say, with locators, so that a decision can be made against primary text rather than against a summary.

---

# Document scope

**Role:** R14.3 axis 1 — the **BUSINESS MODEL AND INCENTIVES** deliverable of four: how these companies make money, what they upsell, what licence and ownership they grant over output, their training-data stance, the rights they claim over user content, distribution deals, and litigation exposure.

**Observation date: 2026-08-13.** Read statuses as defined in the pricing document: `[FULL]`, `[PARTIAL]`, `[via search-result page text]`, `[third-party]`.

**Why this axis is load-bearing rather than background, in the brief's own terms:** the approved product scope is one engine with two surfaces, one of which is an outward-facing product API. That makes licensing, ownership and rights terms a **product specification**, not context.

# Outcome first — the business-model facts that most change the BUILD decision

1. **A European court has already ruled that training a music generator on protected works infringes, even when the training happened in the United States — and it ordered the US conduct to stop.** Munich Regional Court I, **case 42 O 763/25**, judgment **31 July 2026**, against Suno, on GEMA's claim. Penalty for each future violation: **up to €250,000 or up to six months' custodial detention.** The court applied **US fair use** to the US training and **rejected** it, expressly distinguishing *Bartz v Anthropic* and *Kadrey v Meta*. Jurisdiction was taken because the models were stored on servers in Germany and served EU users. Not final; appealable.
2. **The industry's answer to that risk has become the business model itself.** Udio settled with UMG (2025-10-29) and **disabled all downloads** — pivoting from a creation tool to a licensed "walled garden". ElevenLabs launched Eleven Music with **pre-agreed Merlin and Kobalt licences**, opt-in artist participation and royalty pools. Stability markets Stable Audio as "**commercially safe and trained on a fully licensed dataset**". Soundraw markets "trained by **only licensed in-house material**". **Licensing provenance is now the product differentiator, not audio quality.**
3. **Every vendor grants *contractual permission*, and every vendor disclaims *copyright*.** Suno's paid grant is an **assignment** of whatever Suno holds, immediately followed by: "Suno makes **no representation or warranty** to you that any copyright will vest in any Output." That distinction — permission ≠ ownership — is uniform across the category and must be reproduced honestly in any terms we write.
4. **Two vendors contractually forbid exactly what a BUILD-on-their-output plan would do.** Suno: "In no event will you use the Output or your Voice Model to **compete with Suno**, including to create a competing product or service", and no use of Output "to power, enable or **train** other artificial intelligence and machine learning models". ElevenLabs bans six whole **industries** and bans artist/song/album/label/publisher names and substantial lyrics **as inputs**.

**Bad news first:** the legal centre of gravity has moved against unlicensed training in the EU with an extraterritorial remedy and a per-violation penalty; the category's own leaders are responding by *removing* user freedoms (Udio's downloads) or *restricting* prompts (ElevenLabs' input bans). Any outward-facing music product we ship inherits this environment on day one, and our own upstream vendor's terms — not our code — will set the ceiling on what we may promise customers.

---

# Revenue model per competitor (the enumerated universe, item by item)

Universe as enumerated in the pricing document: **A1–A7, B1–B10, C1–C7, D1–D3, E1–E6.**

| # | Entity | How it makes money | What it upsells | Read status |
|---|---|---|---|---|
| A1 | **Suno** | Consumer subscription only (Free / Pro / Premier). **No API revenue** — no purchasable API exists | Credits → **commercial rights** → **downloads** (20/mo Pro, 60/mo Premier from 2026-09-03) → **Suno Studio** (Premier only) → **Advanced Split stems** (Premier only) → **add-on credit packs** → **custom model tuning**. Suno's own pricing page prints "Suno revenue share: 0%" per a third-party audit `[3P]` | pricing `[FULL]`, ToS `[FULL]` |
| A2 | **Udio** | Consumer subscription (Free / Standard / Pro) **plus a la carte credits** ($3/100, $25/1,000, "never expire") — and, going forward, a **UMG-licensed subscription service** | Credits → 2-minute generations → concurrency (4→6→10 songs) → Sessions/Styles (Pro Early Access) → premium **Artist Styles**. **Downloads are no longer an upsell — they are gone** | pricing `[FULL]`, help `[FULL]`, blog `[FULL]` |
| A3 | **Google Flow Music** | Consumer subscription (Free / $8 / $24 / $64) **and** bundled into Google AI subscription tiers `[3P]`; upstream monetisation is Lyria on Vertex | Credits → concurrency (2→8→12→16) → stem downloads → publishing → image/video generation → Member badge/events/merch/early access | pricing `[FULL]` |
| A4/B2 | **ElevenLabs** | **One shared credit pool across every product** (TTS, STT, music, SFX, dubbing, voice cloning) sold as 7 tiers $0→$990→Enterprise; music consumes 900 credits/min | Credits → commercial licence (from $6) → voice cloning → 44.1 kHz PCM via API (Pro) → workspace seats (3 → 10) → Enterprise (DPA/SLA/BAA/SSO, "significant discounts at scale") → **Music Finetunes** | pricing `[FULL]`, Music Terms `[FULL]` |
| A5/B4 | **Mureka** | Consumer product **plus** a first-party API platform; per-song API billing (~$0.045 `[3P]`) | `[3P]`: **vocal cloning at a one-time $5 per vocal ID**, concurrency tiers, recharge from $30. Also sells a **"Content service… ready-to-use access to trending tracks"** (its own docs `[FULL]`) | mixed |
| A6/B5 | **MiniMax** | Prepaid balance + Token Plan; free model IDs at RPM 3, paid at RPM 120 | RPM (3 → 120) is the upsell; error `1008` = insufficient balance | API spec `[FULL]` |
| A7 | **Boomy** | Subscription with distribution `[3P]` | distribution/monetisation `[3P]` | `[3P]` only |
| B1 | **Google Lyria (Vertex)** | Usage-based cloud metering: $0.08/song (3 Pro), $0.04/clip (3), $0.06/30 s (2) | Model tier is the upsell; GCP-wide commitments | GCP pricing `[FULL]` |
| B3 | **Stability** | API credits (1 credit = $0.01 `[via search text]`), ~$0.20/generation, **plus on-premises Enterprise licensing**, **plus custom fine-tuning services** ("our team can fine-tune Stable Audio models on an organization's sound library"), **plus an agency partnership** (amp/Landor/WPP, distribution through **WPP Open**) | enterprise licence, custom model, professional services | announcement `[FULL]` |
| B6 | **Soundraw** | API subscription by song volume ($29.99/100, $300/1,000, **6-month minimum** on Pro) + consumer | volume tier; "custom plan" via a booked call | `[via search text]` |
| B7 | **Loudly** | **Two-model API pricing**: pay-as-you-go $0.15/track (credits never expire) or subscription $0.125/track — plus consumer tiers, plus **Loudly Distribution** ("100% payout on streaming royalties", 50+ stores) | volume discount, **sub-licence**, **corporate indemnification**, distribution | `[via search text]` |
| B8 | **Mubert** | API plans (Trial/Startup/Startup+/Custom) + consumer Render subscriptions + **perpetual licence** option | plan tier; sub-licensing rights `[3P]` | `[PARTIAL]` |
| B9 | **Beatoven.ai** | Usage-based on minutes downloaded `[3P]` | — | `[3P]` |
| B10 | **AIVA** | Subscription; **copyright ownership sold as a tier feature** — Pro (~€33/mo) required for "full copyright ownership and unrestricted commercial use" `[3P]` | ownership itself is the upsell — the clearest example in the set of rights-as-a-SKU | `[3P]` |
| C1–C7 | **Open weights** | Not a revenue model. ACE-Step is "co-led by **ACE Studio and StepFun**" with StepFun providing compute — i.e. a commercial studio funding an open model as ecosystem strategy; DiffRhythm 2 is **Xiaomi Research + ASLP-lab**; LeVo is **Tencent AI Lab** | n/a | papers `[FULL]` |
| D1 | **Tencent** | Publishes LeVo/SongGeneration openly; commercial surface not examined | n/a | NOT APPLICABLE for revenue |
| D2/D3 | **ByteDance / Alibaba** | NOT FOUND IN THE SEARCHED SCOPE | — | explicit blind spot |
| E1–E5 | **Gateways (fal, Replicate, WaveSpeed, CloudSway, aggregators)** | Margin on upstream inference; per-call resale ($0.03 MiniMax, $0.045 Mureka) | speed/uptime/unified billing | `[via search text]` |
| E6 | **Unofficial Suno gateways** | Resell access to a service whose vendor publishes **no** developer programme — a business built on the absence of an official API | — | `[via search text]` |

**Three structural observations for our own model.** (i) **Nobody in Tier A sells outcome-based pricing** — it is credits or subscriptions everywhere, and credits are what let vendors reprice silently. (ii) **The only vendors monetising *rights* explicitly are AIVA (ownership as a tier) and Loudly (sub-licence + indemnification as a tier feature)** — and indemnification is the single scarcest thing on offer. (iii) **ElevenLabs' shared credit pool across nine products is the closest analogue to this repo's own shape** (178 routes over per-asset-type workers): one wallet, many asset types.

---

# Rights over user content and over output — the exact contract language

## A1 Suno — `https://suno.com/terms-of-service`, read 2026-08-13 `[FULL]` (archived at `docs/research/_sources/2026-08-13-suno-terms-of-service.txt`)

**The licence the user grants Suno over their own uploads (verbatim):** "you grant to Suno and our affiliates, successors, assigns, and designees a **worldwide, non-exclusive, fully paid-up, sublicensable (directly and indirectly through multiple tiers), assignable, royalty-free, perpetual, irrevocable right and license** to use, reproduce, store, modify, distribute, create derivative works based on, perform, display, communicate, transmit and otherwise make available any and all Content (in whole or in part) and any rights you may have in your **Voice Model**, in each case, in any media now known or hereafter developed…"

**Training on user submissions is an express warranty the user must give (verbatim):** the user warrants that "no other licenses, permissions, consents or authorizations must be obtained… arising out of or related to our use of your Submissions, including to create your Output or your Voice Model **and/or to train, develop, fine-tune or otherwise improve the Service and any related artificial intelligence or machine learning models**."

**The paid grant (verbatim):** "if you are a user who has subscribed to the **Pro or Premier** paid tier… Suno hereby **assigns to you all of its right, title and interest** in and to any Output owned by Suno and generated from Submissions made by you through the Service **during the term of your paid-tier subscription**. However, due to the nature of machine learning, Suno makes **no representation or warranty** to you that any copyright will vest in any Output."

**The free/Basic limit, including the attribution duty that most write-ups omit (verbatim):** "you will only use Outputs… **solely for your lawful, internal, personal and non-commercial purposes, provided that you give attribution credit to Suno in each case**."

**The Remix trap (verbatim):** "all Remixes shall be a **joint work owned jointly and equally** by you and the Remixer… and **regardless of whether you are a free Service tier user or a subscriber to a paid Service tier**, you additionally covenant… that the Remix may only be used for **lawful, internal, personal and non-commercial purposes**." — i.e. enabling remix on your own track downgrades that track to non-commercial for you too.

**Anti-competition and anti-training clauses (verbatim, two separate places):** "In no event will you use the Output or your Voice Model to **compete with Suno**, including to create a competing product or service." And in the prohibited-conduct list: "use the Services (and any Output or Voice Model) to **create, develop or improve any competing products or services** or to **power, enable or train other artificial intelligence and machine learning models**, tools or technologies."

**Voice Model policy (verbatim):** "you expressly agree **not to create, or attempt to create, a voice model of another person**… We reserve the right to remove your Voice Model at any time if we determine in our sole discretion it is not your own voice."

**Non-exclusivity of output (verbatim):** "Output may **not be unique** across users and the Service may generate the same or similar output for a third party… Output that is requested by and generated for other users is not your Content."

**Also in the ToS `[FULL]`:** users indemnify Suno; disputes go to **binding arbitration** with a class-action waiver; Suno "may establish general practices and limits… including the maximum period of time that data or other content will be retained" and "reserves the right to terminate accounts (and all of their corresponding Submissions and Output) that are **inactive** for an extended period"; Feedback is unrestricted and uncompensated; content may be preserved/disclosed for legal process.

## A4/B2 ElevenLabs — `https://elevenlabs.io/music-terms`, "Last Updated: 26 May 2026", read `[FULL]`

- **Precedence stack (verbatim):** "(A) the **Model-Specific Terms**; (B) the Service Terms; and (C) the Underlying ElevenLabs Agreement" — so the operative licence can change per model version. The current Model-Specific Terms are linked as "Eleven Music Model-Specific Terms" (**not opened this session** — gap).
- **Prohibited industries (verbatim list):** "i. firearms or weapons manufacturing or distribution; ii. tobacco products or related paraphernalia; iii. prescription pharmaceuticals or controlled substances; iv. adult entertainment or pornographic content; v. **religious organizations or institutions**; or vi. **political advocacy or campaigning**… electoral services or other political causes." **Customers in those sectors are "expressly prohibited from accessing and using Music" at all.**
- **Prohibited inputs (verbatim list):** any artist's real or stage name (living or deceased), any songwriter's name, **any song title**, **any album title**, any music publisher company's name, any music label's name, or "**a substantial or distinct portion of any song's lyrics** such that a reasonable person would determine the prompt was intended to reference a particular song."
- **Impersonation ban (verbatim):** no Output that "replicates or mimics the voice, likeness, or identifiable characteristics of any recording artist" in a misleading way.
- **Non-uniqueness disclaimed (verbatim):** "Output you generate using Music may not be unique and may be similar or identical to Output returned to other users… You shall have no rights in or to such third-party output."
- **The commercial fee clauses** (price adjustment, use-case-dependent variable pricing, and third-party licensor **pass-through** currently absorbed at ElevenLabs' discretion) are quoted in full in the pricing document. They are the mechanism by which licensing cost reaches the customer.
- **Input/Output definition (verbatim):** submitting sound recordings "and the embodied musical compositions" as input "constitutes 'Input'", and Output includes "audio output generated and returned by one or more Music Models".

## A2 Udio — the walled garden, in the vendor's and the licensor's own words

- **Udio help centre, 2026-02-17 `[FULL]`:** "**Note that downloading of audio, video, and stems has been disabled**" — plus 1,000 non-expiring bonus credits, Standard 1200→2400, Pro 4800→6000, Pro concurrency 4→5 sets.
- **Udio CEO Andrew Sanchez, company blog `[FULL]`:** "**Starting today, downloads from the platform will be unavailable.** I understand this represents a significant sacrifice, and I hate eliminating functionality for our users. We make this change with a heavy heart, but it is necessary to help achieve the vision we're working towards."
- **UMG press release, 2025-10-29 `[via search-result page text]`:** "the companies **settled copyright infringement litigation**"; "In addition to the compensatory legal settlement, the new license agreements for **recorded music and publishing** will provide further revenue opportunities for UMG artists and songwriters"; the 2026 platform "will be powered by new cutting-edge generative AI technology that will be **trained on authorized and licensed music**"; "Udio's existing product will remain available… with creations **controlled within a walled garden** and the service amended in multiple ways—including **fingerprinting, filtering, and other measures**".
- **Trade reporting, independent family `[via search-result page text]`:** UMG artists participate **opt-in**; a source states users "will not be able to export works made within Udio's forthcoming platform" and that capabilities will include "mashups, remixes and tempo changes to existing, licensed works as well as **voice swapping with UMG artists' voices** who have chosen to make their vocals available"; a **48-hour download window** was granted from 2025-11-03 under the pre-deal terms after user backlash; one outlet raises possible **consumer-protection** exposure for removing a paid-for capability.
- **Business-model reading:** Udio converted from "creation tool that produces files you own" to "**licensed fan-engagement service whose outputs stay inside**". That is a different business: retention and licensing revenue, not asset production. For our purposes it removes Udio as a supply option entirely.

---

# Training-data stance, vendor by vendor

| Entity | Stance, in the vendor's own or the court's words | Class |
|---|---|---|
| **Suno** | Trained on GEMA repertoire **without a licence, which Suno itself had already conceded before trial**: GEMA's release states "Dass die Systeme mit diesen und anderen Werken der GEMA trainiert wurden, ohne eine Lizenzvergütung zu zahlen, **hatte SUNO im Vorfeld bereits eingestanden**, die Vergütungspflicht aber stets bestritten" (Suno had already admitted the training but always denied the obligation to pay). Suno's ToS separately requires **users** to warrant training rights over their uploads | court/official `[FULL]` |
| **Udio** | Post-settlement, the new platform "will be **trained on authorized and licensed music**" (UMG) | official `[via search text]` |
| **ElevenLabs** | Pre-agreed licences with **Merlin** (independent labels/distributors) and **Kobalt** (publisher) announced 2025-08-05; "Eleven Music was built in partnership with artists, labels, and publishers, and includes **guardrails to protect rightsholders**"; opt-in participation; royalty pools | official announcement `[via search text]`, corroborated by two independent trade families |
| **Stability** | "Like all Stable Audio models, Stable Audio 2.5 is **commercially safe and trained on a fully licensed dataset**"; uploads must be "free of copyrighted material" enforced with "**advanced content recognition**" | vendor `[FULL]` |
| **Soundraw** | "trained by **only licensed in-house material**"; "**No copyright strikes**" | vendor `[via search text]` |
| **Loudly** | "**100% copyright-safe**"; corporate indemnification for subscription partners | vendor `[via search text]` |
| **Google (Lyria)** | No training-data disclosure retrieved this session. Model card exists and is referenced by the docs but **was not opened** — explicit gap. Third-party reports SynthID watermarking on Flow Music outputs | NOT OBSERVED |
| **Mureka / MiniMax** | No training-data statement retrieved | NOT FOUND IN THE SEARCHED SCOPE |
| **ACE-Step v1.5** | Fully disclosed *pipeline* but not provenance: **27M-sample corpus**, 5M annotated by Gemini 2.5 Pro, 20M text-to-music pairs in pre-training, 6M stem-separated tracks, 2M high-quality SFT subset. **The source of the 27M samples is not stated in the paper** | paper `[FULL]` — and the omission is itself the finding |
| **DiffRhythm 2** | Training data provenance not stated in the sections I read | `[PARTIAL]` |

**The pattern:** the commercial vendors have split into "licensed and saying so loudly" (ElevenLabs, Stability, Soundraw, Loudly, post-deal Udio) and "litigating" (Suno). The open-weight papers publish extraordinary methodological detail and **no provenance** — which means adopting open weights transfers the provenance question to us, unanswered.

---

# Litigation and regulatory exposure

## GEMA v Suno — Munich Regional Court I, case 42 O 763/25, judgment 31 July 2026

**Sources:** GEMA's own press release (`https://www.gema.de/de/w/suno-entscheidung-2026`, fetched and read in full 2026-08-13 `[FULL]`, in German), plus three independent legal analyses (Reed Smith, Bristows, JUVE Patent) and a detailed report of the judgment text `[via search-result page text]`, archived at `docs/research/_sources/2026-08-13-gema-v-suno-munich-judgment-report.txt`. **The 143-page judgment itself was NOT obtained** — `[PARTIAL]`.

**Procedural facts (cross-verified across ≥3 independent families):** claim filed **21 January 2025**; oral hearing **9 March 2026**; judgment **31 July 2026** (postponed from 12 June); 42nd Civil Chamber, presiding judge **Elke Schwager**; six works at issue — "**Forever Young**", "**Atemlos**", "**Mambo No. 5**", "**Rasputin**", "**Big in Japan**", "**Daddy Cool**"; an English translation of the judgment circulated **3 August 2026**; **not final, appealable**.

**Holdings, as reported:**
- **Memorisation is reproduction.** The works were "reproducibly contained (i.e. memorized) in certain versions of Suno's AI system, which were **stored on servers located in Germany**", infringing §16 UrhG and **not** covered by the §44b TDM exception.
- **Extraterritorial reach.** The injunction expressly orders Suno to stop copying the works "**within the territory of the United States of America** for the purpose of training an artificial intelligence (AI) model to generate music".
- **US fair use applied and rejected.** Under the *Schutzlandprinzip* the court analysed **17 U.S.C. §107** itself and found fair use inapplicable, **expressly distinguishing *Bartz v Anthropic* and *Kadrey v Meta*** on the ground that here "outputs were substantially similar, from **non-specific prompts**".
- **Prompting did not break attribution.** Even where prompts were repeated many times, "the prompts were simple and open-ended, specifying only the lyrics and the desired musical style", so the **model** — not the user — was the source.
- **Remedies:** injunctions on (i) training use, (ii) storage within the model, (iii) offering the model in Germany, (iv) creating infringing adaptations; **information/disclosure** and **declaratory entitlement to damages** (three works and one chorus since **1 July 2023**); publication of the operative part in a national newspaper; **€5,049.70** pre-trial fees; **penalty up to €250,000 per violation or up to six months' detention**. The §19a making-available claim was **rejected**; an unnamed right of communication to the public succeeded instead. Damages **not quantified**.
- **GEMA's stated position, verbatim from its release `[FULL]`** (Dr Tobias Holzmüller, CEO): "**KI-Modelle, die auf dem Diebstahl geistigen Eigentums beruhen, sind von der Rechtsordnung nicht geschützt. KI-Anbieter müssen Lizenzen erwerben**… Wenn Systeme in Europa betrieben werden, kann auch vor europäischen Gerichten geklagt werden." And Dr Kai Welp, General Counsel: "**Erstaunlich ist, dass die KI-Systeme offenbar in erheblichem Umfang beinahe vollständige Werke speichern**" — that the systems apparently store nearly complete works to a considerable extent.
- **Precedent chain:** GEMA won against **OpenAI** at the same court in **November 2025** over stored/reproduced song lyrics; **OpenAI has appealed** to the OLG München. GEMA represents **over 100,000 members** and rights for over two million rightsholders.

**Why this is load-bearing for our BUILD decision, stated as fact not advice:** the theory that succeeded is **memorisation inside model parameters on servers in the jurisdiction**, and the remedy reached **training conducted abroad**. Any plan involving self-hosted open weights of unstated provenance, served to EU users from cloud infrastructure, sits squarely inside the fact pattern this judgment addressed.

## Other live exposure

| Matter | Status | Class |
|---|---|---|
| **UMG v Udio** | **SETTLED** 2025-10-29, with licences for recorded music and publishing and a joint 2026 platform | official `[via search text]`, 3 families |
| **Major-label suits against Suno and Udio (filed June 2024, "copyright infringement on an 'almost unimaginable scale'")** | UMG's part against Udio resolved by the settlement; a **Sony** action against Suno is reported still open `[3P]`; Warner reported settled with Udio in Q1 2026 `[3P]` | `[3P]` — **NOT verified against any court docket this session.** Explicit gap |
| **GEMA v OpenAI** | Won by GEMA Nov 2025; **on appeal** | official `[FULL]` via GEMA release |
| **Consumer-protection risk from Udio's download removal** | Raised by one trade outlet by analogy to an Amazon Prime claim; **no filed case observed** | `[single-source, third-party]` |
| **EU AI Act transparency / C2PA / watermarking obligations** | Not researched in this slice. ElevenLabs exposes `sign_with_c2pa`; Google reportedly applies SynthID `[3P]` | explicit gap — belongs to the future-needs axis |

---

# Distribution and rightsholder deals

| Deal | Terms as reported, with the reporting family | Class |
|---|---|---|
| **UMG × Udio** (2025-10-29) | Settlement + recorded-music and publishing licences; joint platform launching 2026; **opt-in** artist participation; walled garden with fingerprinting and filtering; voice-swapping with consenting UMG artists' voices | UMG press release + Udio blog + Udio help centre + trade press = 4 families, **VERIFIED 3+** |
| **ElevenLabs × Merlin** (2025-08-05) | Merlin represents "**30,000 independent labels and distributors**"; opt-in; "similar safeguards and a similar remuneration structure to Kobalt's" per a source | official announcement + two trade families |
| **ElevenLabs × Kobalt** (2025-08-05) | **Worldwide, two-year term**; "**pro-rata share of a royalty pool based on how many of [the artist/songwriters'] works were used to train the model relative to others**"; approximately **50/50 split between publishing and recorded music** ("parity"); **Most Favored Nation clause** — if any recorded-music rightsholder negotiates better terms, Kobalt is automatically upgraded; eligibility requires "**100% of the mechanical rights** for the composition are controlled by Kobalt, **and** the corresponding master recording is cleared through Merlin"; Kobalt's CEO calls it a "**pilot**" | trade reporting citing a client note obtained by the outlet; `[via search-result page text]`, 2 independent families |
| **Stability × amp (Landor / WPP)** | Co-developing enterprise sound-identity solutions; **Stable Audio 2.5 available to WPP's global client base through WPP Open** | Stability announcement `[FULL]` |
| **Google × Believe** | Believe, "one of the world's largest independent music distribution companies", partnered with Google to offer Flow Music to professional artists | `[3P]`, single family — flagged |
| **Loudly Distribution** | 50+ stores incl. Spotify, TikTok, Apple Music, YouTube Music, Amazon; "**100% payout on streaming royalties**"; Distro Plus included with annual plans; up to 200 songs | vendor `[via search text]` |
| **Boomy** | Distribution bundled at $2.99/mo | `[3P]` |
| **Suno** | **No rightsholder licensing deal observed.** Instead: an adverse judgment, and "Listen & Rank" — a scheme paying users in credits to rank clips, i.e. **acquiring preference data from its own customers instead of licensing catalogue** | changelog `[FULL]` + court record `[FULL]` |

**The structural lesson for a product that will be sold outward:** the two economically meaningful protections a buyer can obtain today are (a) **licensed-training provenance** (ElevenLabs, Stability, Soundraw, Loudly) and (b) **indemnification** (Loudly explicitly; ElevenLabs Enterprise implicitly via custom terms). Everything else — "no copyright strikes", "royalty-free", "commercially safe" — is a marketing formulation whose contractual content must be read in the licence document, and in three cases (Soundraw's two tier-specific licence documents, Mubert's licence, the Eleven Music Model-Specific Terms) **I did not obtain that document**.

---

# Cross-verification ledger for this document

| Claim | Source A (primary) | Source B (independent) | Source C (independent) | Status |
|---|---|---|---|---|
| Suno paid tiers get an assignment of Suno's rights, with no copyright warranty | Suno ToS §Content `[FULL]` | Suno pricing page "Commercial use rights for new songs made" `[FULL]` | Three independent third-party terms audits quoting the same clause | **VERIFIED 3+** |
| Free-tier Suno output is non-commercial **and requires attribution** | Suno ToS `[FULL]` | Suno pricing "No commercial use" `[FULL]` | third-party audit that specifically notes the attribution clause is "routinely omitted from other write-ups" | **VERIFIED 3+** |
| Udio downloads disabled | Udio help centre 2026-02-17 `[FULL]` | Udio CEO blog `[FULL]` | UMG press release "walled garden" + trade reporting | **VERIFIED 3+** |
| Munich court ruled against Suno on 31 July 2026 in 42 O 763/25 with €250k per-violation penalty | GEMA press release `[FULL]` | Reed Smith legal analysis | Bristows analysis + JUVE Patent + judgment report | **VERIFIED 3+** |
| The injunction reaches training conducted in the USA | Judgment report quoting §K1.6(aa) | Bristows: "thereby giving the injunction extra-territorial effect" | Reed Smith: "first major European ruling to hold that training… outside the EU can infringe" | **VERIFIED 3+** |
| ElevenLabs holds Merlin and Kobalt licences | ElevenLabs/BusinessWire announcement `[via search text]` | Billboard | Music Business Worldwide (with the MFN and 50/50 detail) | **VERIFIED 3+** |
| Suno has no official API | Suno CPO's own post as quoted | second trade outlet with identical quotes | third-party OpenAPI metadata conceding it | **VERIFIED 3+** |
| ElevenLabs bans six industries and five categories of prompt input | ElevenLabs Music Terms `[FULL]` | — | — | **`[single-source official]`** — disclosed, not waived. The vendor's own contract is the only possible source |
| Kobalt MFN clause and 50/50 parity | MBW citing a client note it obtained | Billboard (royalty pool, two-year term, worldwide) | — | **2 families — `[single-source]` on the MFN specifically.** Flagged |
| Sony's action against Suno remains open | third-party roundups | — | — | **`[UNVERIFIED]`** — no docket checked |
| Google retains a perpetual royalty-free licence to Flow Music user content | one third-party news write-up | — | — | **`[single-source]`, NOT adopted.** Flow Music's terms were not opened |

---

# Contradictions preserved

| # | Subject | A | B | Status |
|---|---|---|---|---|
| 1 | Mubert's licence scope | API plans page sells commercial integration and sub-licensing | Site footer: music is "licensed by Mubert® Inc **only for personal use**… Public reproduction, recording, distribution of this music is prohibited"; Render disclaimer bars Content ID, standalone streaming release and stock-music sites | **UNRESOLVED**, both Mubert's own text |
| 2 | ElevenLabs commercial scope | Pricing page: "Music commercial use" from Starter, unqualified | Third-party: film, TV and Studio Games excluded below Enterprise; Enterprise barred from music libraries >100 outputs; Free/Starter/Enterprise reportedly barred from streaming distribution | **UNRESOLVED** — the vendor's commercial-rights table was not opened. The tier-by-tier streaming restriction claim is `[3P]` and notably *counterintuitive* (Enterprise restricted), which is exactly why it must not be relayed as fact |
| 3 | "Commercially safe" as a category claim | Stability, Soundraw, Loudly all assert copyright-safety | The Munich judgment shows a court will examine **memorisation inside the model**, not the vendor's characterisation of its dataset | Not a factual contradiction but a **risk-model contradiction**: vendor assurance ≠ judicial finding. Recorded |
| 4 | Whether users can export from the new Udio platform | UMG release: a licensed environment to "customize, stream and share" | A source close to the deal: users "**will not be able to export**" works made in the forthcoming platform | **UNRESOLVED**; the second is `[3P, single-source]` |

---

# What this axis contributes to the BUILD / ADOPT / AVOID decision (facts only — the recommendation belongs to the parent)

1. **Supply-side constraint, measured:** of the enumerated universe, the vendors that both (a) expose a purchasable API and (b) assert licensed training data are **ElevenLabs, Stability, Soundraw and Loudly**. Of those, only **ElevenLabs** documents sung-lyrics generation with per-section control, and it is the one that bans six industries and bans reference-by-artist-name in prompts.
2. **The "own the whole stack" option carries the provenance question, not the licence fee:** ACE-Step v1.5 and DiffRhythm 2 publish complete method detail and **no dataset provenance**. The Munich judgment's operative theory was memorisation inside the model on servers in the jurisdiction. Those two facts together are the central risk of a self-hosted BUILD, and they are facts, not opinions.
3. **Rights language we would have to write ourselves:** every vendor in the set separates *contractual permission to use* from *copyright ownership*, and every vendor disclaims output uniqueness. Any terms we publish must do the same or over-promise.
4. **Two contractual walls block the cheap shortcuts:** Suno's output may not be used to build a competing product or to train models (so no distillation, no bootstrapping); ElevenLabs' prompt-input bans remove the "sounds like X" affordance for any product built on it.
5. **The scarce, sellable asset in this market is indemnified, provenance-clean output** — Loudly is the only vendor observed advertising corporate indemnification as a standard subscription feature, and AIVA the only one selling ownership as a tier. That is where margin exists ($0.125–$0.30/track) above generation cost ($0.03–$0.15, or GPU cents self-hosted).

---

# Query log (bearing on this axis)

From the 17 queries run this session: #2 Suno pricing/commercial terms · #4 Suno API/enterprise · #5 Udio ToS/pricing/downloads/UMG settlement · #6 Udio credits/limits · #8 ElevenLabs licensing Merlin/Kobalt/commercial rights · #14 Beatoven/Soundraw/Boomy/Loudly/AIVA/Mubert licensing · #17 GEMA v Suno Munich ruling.
Direct fetches: `suno.com/terms-of-service` · `suno.com/pricing` · `suno.com/release-notes` · `help.udio.com` ×2 · `udio.com/blog/a-new-era` (via search text) · `udio.com/pricing` · `elevenlabs.io/music-terms` · `elevenlabs.io/pricing` · `gema.de/de/w/suno-entscheidung-2026` · `stability.ai` announcement.

# Known gaps and blind spots in THIS document

1. **The 143-page GEMA v Suno judgment text was not obtained** — all holdings are from GEMA's release plus three legal analyses and one detailed report. `[PARTIAL]`.
2. **No court docket was checked for any matter.** The status of Sony v Suno, Warner v Udio and the 2024 major-label actions is `[3P]` only.
3. **The Eleven Music Model-Specific Terms were not opened**, and they contractually **override** the Music Terms I did read. This is the most consequential document gap in this axis.
4. **The elevenlabs.io/music commercial-rights table was not opened**, so tier-by-tier streaming-distribution rights are unverified.
5. **Suno's Privacy Policy and its Community Guidelines** were not read; only the ToS.
6. **Flow Music / Google Labs terms of service were not opened** — the reported perpetual-licence claim is unverified and not adopted.
7. **Mureka, MiniMax, Boomy, Beatoven.ai, AIVA terms and licences: none opened.**
8. **Soundraw's two tier-specific licence documents and Mubert's licence certificate: not obtained.**
9. **Open-weight model licences (C1–C7): not examined at all** — an essential input to any self-host decision.
10. **EU AI Act, C2PA and watermarking obligations: out of scope here** by design, but they are business-model-shaping and belong to the future-needs axis.
11. **No CN/JP/KR-language sources were consulted**, so Chinese vendors' training-data and rights posture (Mureka/Kunlun, MiniMax, Tencent, ByteDance, Alibaba) is a genuine blind spot despite the brief authorising those languages.

# Source counts for this document

First-party/official surfaces bearing on business model, opened or read as page text: **Suno ToS, Suno pricing, Suno release notes, Udio help ×2, Udio blog, Udio pricing, UMG press release, ElevenLabs Music Terms, ElevenLabs pricing, ElevenLabs launch announcement, GEMA press release, Stability announcement, Soundraw API page, Loudly developer pricing, Loudly consumer pricing/FAQ, Mubert API plans, Mubert Render pricing, Mureka docs index** = **19 official surfaces**. Legal/academic primaries: **GEMA v Suno** (via GEMA's own release `[FULL]` + Reed Smith + Bristows + JUVE + judgment report — judgment text `[PARTIAL]`), **GEMA v OpenAI** (referenced, `[ABS]`), plus the three arXiv primaries read `[FULL]` for training-corpus disclosure.

# Universe coverage completion for this document (every enumerated entity accounted for)

Entities not given their own row above, stated explicitly rather than dropped (no-narrowing law):

| Entity | Business-model status and reason |
|---|---|
| **C3 YuE** | **NOT APPLICABLE — no revenue model.** Open research model (arXiv 2503.08638), present in this universe only as a benchmark row in ACE-Step v1.5 Table 1 (AudioBox CE 6.58, Lyric Align −4.6). Its licence was **not examined** (see gap 9) |
| **C4 LeVo / SongGeneration (Tencent AI Lab)** | **NOT APPLICABLE — no revenue model.** Published openly at `github.com/tencent-ailab/songgeneration` (repo path cited by both papers read `[FULL]`). Corporate-lab open release; commercial terms and licence **not examined** |
| **C5 HeartMuLa** | **NOT APPLICABLE — no revenue model.** "A family of open sourced music foundation models" (arXiv 2601.10547, cited in ACE-Step v1.5's reference list); benchmark row only. Licence **not examined** |
| **C6 Meta AudioCraft / MusicGen** | **NOT APPLICABLE — no commercial product surface found in the searched scope.** Named as a seed in the brief; resolves to a research/open-weight lineage with no vendor pricing, terms or rights surface retrieved. Licence **not examined** |
| **C7 Stable Audio Open** | Shares Stability's commercial posture (B3 row) but as an **open-weight release**; its own licence was **not examined**. Its VAE is used as a baseline in DiffRhythm 2 Table 5 |
| **C2 DiffRhythm / DiffRhythm 2** | Covered in the C1–C7 row: **Xiaomi Research + ASLP-lab**, open release, no revenue model, **training-data provenance not stated** in the sections read — which is itself the business-relevant finding |
| **E3 WaveSpeedAI / E4 CloudSway** | Covered in the E1–E5 row: **margin on upstream inference**, per-call resale ($0.03 MiniMax, $0.045 Mureka). Neither holds rights in the models it resells; their terms were **not examined** |

**The single business-model conclusion that spans all of Tier C:** these are not competitors for revenue — they are competitors for *supply*. Each publishes method and weights while publishing **no dataset provenance**, which transfers the unresolved question in *GEMA v Suno* (memorisation inside model parameters) from the vendor to whoever self-hosts them.

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT