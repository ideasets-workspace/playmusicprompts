# Standards ledger

Governance read from disk this session, before any external action:

| Governing file | Evidence | How this document satisfies it |
|---|---|---|
| `C:\Users\berke\.claude\skills\deep-research\SKILL.md` — the merged deep-research law and covenant (PART I activation law; PART II R0–R18 + provenance annexes P1–P5) | SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes, hashed and read **in full** this session | MODE B owner research order; discovery-first; primaries opened and marked `[FULL]`/`[PARTIAL]`/`[ABS]`; ≥3-source cross-verification for load-bearing claims; anecdote and generalisable pattern kept separate; contradictions preserved |
| `c:\Berk\SsmContentAssetCreator\AGENTS.md` | delivered into this session's context by the host rule loader | Research floor; four source tiers including THE DARK; dated English artefact under `docs/research/`; captures archived under `docs/research/_sources/` |
| `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session (70 lines) | Per-source depth (method, real numbers, stated limitations, application here); recency-first; no guessed locator |
| `docs/research/_runs/2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session (207 lines) | This is planned artefact **#8**, axis 4 (customer expectations); governed path `docs/research/` because this is a product/API topic, not a film topic (scope plan §12) |

Artefact language ENGLISH per Berk's absolute artefact-language law; Turkish appears only as verbatim quoted evidence.

**Privacy discipline applied throughout (CONTEXT-15):** app-store and review-platform corpora are reported as **aggregate patterns only**. No reviewer is named, no review is quoted in a way that could identify an individual, and the review captures containing reviewer identifiers were deliberately **not** archived into the repository. Where a specific documented incident is described, it is one already published in the press by a named journalist with the subject's participation.

---

# Outcome first

**The most consequential user-expectation finding is a negative one, and it disqualifies the obvious product framing: the two populations in this market want opposite things, and the population with money wants the thing that prompt-to-song architecturally cannot give them — granular control.** A 2026 qualitative study of five professional artists across four tools (Suno, Udio, Stable Audio, Lyria 3.0) concluded the tools "are very usable for novice users seeking quick, unreliable, generic outputs. However, they serve less purpose for professional users," who "perceive the 'prompt-based' interaction model as insufficient," describing it as "a single input-output cycle and 'trial-and-error' process" with a "lack of functions, detailed control and creative ownership."

Six findings that should shape the product:

1. **Professionals do not reject AI; they reject autonomy.** An independent 1,200-respondent industry survey found **87%** already use AI, **79%** for technical tasks (mixing, mastering, restoration) and **66%** creatively — yet only **13%** used a tool to produce an **entire song**. The demand is for *stages*, not songs.
2. **Controllability is the measured gap, quantified.** In a formal mixed-method study of 18 expert composers, ease of control scored **5.23/10** while "more control is desirable" scored **9.54/10 (SD 0.93)** — the highest-consensus number in that paper, and effectively unanimous.
3. **The recurring complaint set is remarkably stable and mostly not about musical taste.** Aggregated across two review platforms and an app-store corpus: lyrics ignored, replaced with invented words, mispronounced or sung in the wrong section; style/genre descriptors ignored; wrong vocal gender; abrupt endings; buzzing and level jumps; **credits disappearing without generation**; billing charged with no access; support unresponsive or automated-only; edits that change the whole song.
4. **Blind listeners cannot tell the difference, and still want it disclosed.** A vendor-commissioned 8-country Ipsos survey found **97%** could not distinguish fully-AI from human-made music in a blind test, while **80%** agreed AI music should be clearly labelled and **73%** want to know when a platform is recommending it. Quality is no longer the differentiator; **trust and control are.**
5. **Turkish works but is not solved, and this matters directly for Berk's film line.** Turkish-language community guidance converges on: write lyrics in native Turkish script with ş/ç/ğ/ı/ö/ü; use English **genre** tags; name Turkish instruments; use explicit section tags; and fall back to phonetic or de-diacriticised spelling when specific words are mispronounced — with `ş` and `ç` named as the recurring offenders and Turkish folk named as the weakest genre. **This is community-consensus evidence, not measured evidence, and is labelled as such.**
6. **Moderation false positives are a first-order product risk, worst in non-English.** Documented patterns include space/hyphen stripping that collapses benign text into blocked strings, collisions with producer tags, and cumulative "aggression scoring" of an entire lyric; error messages name no trigger. Reports of higher false-block rates for non-English lyrics are **community-sourced and `[UNVERIFIED]`** — but the mechanism is plausible and the design response is cheap: **tell the user which line failed and why.**

**The switching triggers are therefore not "better music."** They are: control that survives iteration, section-level editing without destroying the track, a stable named voice, honest billing, and a support channel that answers.

---

# Framing: the decision this axis serves, and what would change it

Decision served (scope plan §1): do we build our own song-generation product — prompt → complete song with lyrics, structure, sung vocals, mix — and if so under what conditions? Berk approved **scope (c): one engine, two surfaces** — internal engine for our film/game pipeline **and** an outward-facing product API we sell.

This axis controls **which capabilities customers would actually pay for versus which are vanity features**, and it does so by separating two populations that must never be blended:

- **P1 — casual/first-time creators.** Value: speed, zero skill floor, emotional/personal use. Tolerance for genericity: high. Willingness to pay: proven at scale but with high churn.
- **P2 — professional and semi-professional musicians, producers, and media makers.** Value: precision, stems, repeatability, ownership, integration into an existing workflow. Tolerance for a black box: **low**. This is the population our API-shaped product would actually serve.

**What would falsify the product-shaped conclusion below:** evidence that professionals' stated preference for control does not translate into paid adoption (i.e. that they say "control" and buy "convenience"), or evidence that the casual segment's willingness to pay is durable rather than churn-limited. §6 reports the one hard number I found on the second point, and it cuts against durability.

---

# Inclusion, exclusion, dates, languages

- **Dates:** newest-first; all retrievals **2026-08-13**. Studies from 2025–2026 lead; older work cited only where it is the origin of a measurement still relied on (Louie et al. 2020; Roberts et al. 2019, both via a 2025 primary).
- **Languages:** English primary; **Turkish** sources for the Turkish-language user question.
- **Included:** peer-reviewed and formal-venue studies, a university thesis, an ISMIR-community journal article, industry surveys with stated sample sizes, app-store and review-platform aggregate corpora, community troubleshooting corpora (as community evidence, labelled), an accessibility review by a disability organisation, and a published press account of a moderation false positive.
- **Excluded:** SEO listicles, affiliate "best AI music tool" roundups, undated blog aggregations. Nothing paywalled, credentialed or robots-restricted was accessed; **no account was created and no trial was started** — therefore no first-party UI walkthrough exists in this axis, which is a stated limitation, not a silent one.

---

# Methodology and exact query/action log

| # | Action | Exact query | Yield |
|---|---|---|---|
| U1 | search | `user study musicians attitudes AI music generation tools survey ISMIR CHI 2026 professional versus amateur creative agency` | **4 formal primaries** + 1 industry survey (the professional/novice split) |
| U2 | search | `Suno complaints users credits generation failures style drift App Store reviews Trustpilot refund 2026` | complaint corpora across 3 independent platforms + a documented billing case |
| U3 | search | `Suno Turkish lyrics pronunciation problem non-English languages quality complaints AI music multilingual singing` | Turkish-language community consensus, incl. Turkish-language sources |
| U4 | search | `AI music generator moderation false positive lyrics blocked accessibility disabled musicians assistive music creation` | moderation-mechanism corpus + **accessibility review** + a false-positive press case |
| U5 | search | `consumer AI subscription retention churn benchmark 2026 creative tools monthly churn rate freemium conversion referral loop` | the retention numbers that bound willingness-to-pay (carried in the growth document; used here for the P1 durability question) |
| U6 | grep | captured thesis PDF: `participants\|interview\|SUS\|method\|Stockholm` | method and sample of the professional study, read from the capture |
| U7 | grep | captured arXiv HTML: `SUS score\|participants\|hobbyist\|professional\|controllability` | the 5.23/9.54 controllability numbers and SUS values |

Adversarial lane run: I searched specifically for evidence that professionals *like* full-song generation, and for positive reviews balancing the complaint corpora. Both exist and are reported (§2 "the positive cases", §3 rating context) rather than omitted.

**Marginal yield:** U1 produced all four formal primaries; U2–U4 produced the complaint, language and accessibility layers; U5 produced the one hard durability number. A further round on the same lanes returned restatements. Stopping recorded here rather than described as exhaustiveness.

---

# Source counts for this axis

- **Formal/academic primaries: 4** — (i) Stockholm University master's thesis, 5 professional artists × 4 tools, `[FULL]`; (ii) *Evaluating Human-AI Interaction … for MMM-C*, arXiv:2504.14071, 18 expert composers, `[FULL]` for method and quantitative results; (iii) *Art Official Intelligence*, TISMIR (Transactions of ISMIR), `[PARTIAL]`; (iv) AFB *AccessWorld* accessibility review of Riffusion, `[FULL]` — a formal review by a disability organisation, counted as a formal primary for the accessibility angle.
- **Industry surveys with stated N: 2** — LANDR study of **1,200** respondents; Deezer/Ipsos **8-country** blind-listening survey.
- **Review/complaint corpora: 3 independent platforms** — Apple App Store aggregate (headline **4.9 stars from 287,927 ratings**, with a 1–3-star complaint breakdown), Trustpilot (two distinct domain profiles), plus a documented individual billing case published with dates.
- **Community troubleshooting corpora: 4** (labelled community evidence, never load-bearing alone).
- **Turkish-language sources: 3.**
- **Axis total distinct authoritative sources: 16** (provenance families).

---

# 1. The two populations, measured — and why they must never be blended

## 1.1 Professionals: five-part record on the strongest primary for this axis

**"How AI-music production tools can support the professional user without taking over the process completely" — master's thesis, Stockholm University (DiVA record 2070538), `[FULL]` (119.6 KB capture read).**

**(1) Problem in the authors' own framing.** "AI-tools are, in general, productive and have created monetary value … however, the best-performing AI-tools are still performing simpler tasks. When users try more advanced or detailed work, the outputs tend to be 'good enough' rather than precise, which limits the user and especially impacts the expert user." The stated aim: whether AI tools can "become a part of the music production process rather than alienating them from it," and the explicit motivation that "the gap between marketing claims and actual usability for the professional target group leaves a real user group underserved."

**(2) Method, step by step.** Qualitative design with thematic analysis (Braun & Clarke six-phase). **Five professional artists**, each with ≥1 year of production experience, across different genres. **Four tools: Suno, Udio, Stable Audio, Lyria 3.0.** Each artist received an identical **written** briefing (not verbal, for consistency), was asked to produce a song "as close as possible to their own established musical style," and was free to use any function the tool offered. Two data-collection phases: **task-based interaction sessions** with real-time observation, then **semi-structured interviews of 10–20 minutes**, manually transcribed. Codes generated independently by both authors, collated into candidate themes, refined against the full dataset, finalised into three themes. Conducted under the ALLEA Code of Conduct.

**(3) Real results.** The conclusion, verbatim: the tools "are very usable for novice users seeking quick, unreliable, generic outputs. However, they serve less purpose for professional users. When recreating music in their own signature styles, the artists perceived a gap between their creative intent and the output of the system. Hence, the tools fail to provide necessary granular control for complex tasks requiring high precision and creative accuracy. The professional users perceive the 'prompt-based' interaction model as insufficient in comparison to their traditional music production. This is due to a lack of functions, detailed control and creative ownership. They describe it as a single input-output cycle and 'trial-and-error' process." The failure is theorised as **both** a *gulf of execution* ("granular musical intent cannot be translated into available actions") **and** a *gulf of evaluation* ("the Black-box output offers no interpretable feedback to act on"). The authors also record that "ease of usability does not necessarily equate to high-value outputs," and that "professional artists take a strong stand against AI involvement in music production due to the minimal musical skill required in the creative process."
**The positive cases, reported so the finding is not one-sided:** participants acknowledged genuine value for **background music and simple instrument sounds**, and one artist named commercial ambient use — cheaper for a retailer than licensing a famous recording. A separate artist described an uncanny-valley reaction to a synthetic voice singing their lyrics with "faked empathy," and two emphasised that AI-generated music lacks the cultural apparatus of music — emotional expression, artistic identity, concerts, fans, fashion.

**(4) Stated limitations, in the authors' words.** Explicitly excludes "any analysis of intellectual property, legal terms, or copyright"; strictly an HCI/usability perspective; **"limited to a small selection of major AIG-music production tools and a limited number of five artist interviews, which may affect the generalizability of the outcomes."** The authors also note the tools differ in target audience — Suno and Udio claim to serve professionals **and** beginners, while Stable Audio does not claim to target professionals — which affects cross-tool comparison. **This is a master's thesis with n=5: it is a strong, method-transparent qualitative signal, NOT a generalisable population statistic, and I do not present it as one.**

**(5) Application here.** This is the single most decision-relevant primary in the axis, because our deliverable is an **API** — the most granular interface there is. It says the market leader's weakness is precisely the surface we would naturally build: parameterised, stage-addressable, inspectable. Concretely, our engine should expose **stages** (lyrics → melody/structure → vocal → instrumental bed → alignment → mix) as separately callable and separately re-runnable, so the customer can iterate one stage without re-rolling the song. That directly attacks both the gulf of execution (each stage has real parameters) and the gulf of evaluation (each stage returns an inspectable intermediate artefact rather than an opaque finished track).

## 1.2 Expert composers, quantified: the controllability numbers

**"Evaluating Human-AI Interaction via Usability, User Experience and Acceptance Measures for MMM-C: A Creative AI System for Music Composition" — arXiv:2504.14071, `[FULL]` for method and quantitative results.**

**(1) Problem framing.** Whether a co-creative AI composition system is actually adopted by expert composers, measured rather than asserted, with usability, user experience and technology acceptance treated as three distinct constructs.

**(2) Method.** The Multi-Track Music Machine integrated into **Cubase** as a deliberately minimal **"1-parameter" plugin** (MMM-C). Three-part mixed-method study across **two groups of expert-level composers**, recruited from Steinberg's beta-tester pool: **8 hobbyist experts** (composition is not their main revenue) and **10 professional experts** (composition is their paid occupation) — 18 of 34 who onboarded actually completed at least one task. Three typical multi-track composition tasks. Instruments: **SUS**, a Creativity Support Index, a custom two-question 10-point controllability scale, perceived-authorship measures, and **TAM** (12 questions, 5-point, split evenly between perceived ease of use and perceived usefulness). Ethics approval SFU REB #30000223. Participant effort **20–30 hours** each over four to five weeks. Demographics reported honestly, including a severe gender skew (17/18 male).

**(3) Real numbers.** **SUS: Task 1 = 73.75 (SD 10), Task 2 = 75.71 (SD 11.59), Task 3 = 71.43 (SD 14.48)** — acceptable across the board. **Controllability: ease of control over the system = 5.23/10 (SD 2.52); "more control is desirable" = 9.54/10 (SD 0.93).** Qualitative sub-themes with counts: **"difficulty steering the system" 9/18**, "easy to use" 4/18, "lack of parameters" 4/18, "want more flexibility" 6/18. **No significant difference was found between hobbyists and professionals** on SUS or user-friendliness (one task-level exception). CSI completed by 13/18. Participant P1, verbatim: "It seemed hard to understand the actual effects of the single control for the system. As such it was hard to feel in control of the result. However, using the system experimentally without specific results in mind was enjoyable." The paper also carries forward, from Louie et al. (2020, 21 novice musicians), the finding that **semantically-relevant control features improved creative ownership, self-efficacy and collaboration**, with increases in controllability, comprehensibility and trust — and from Roberts et al. (2019, 89 responses on Magenta Studio) that 66% found outputs easy to use in their work while only 41% found it easy to achieve the desired musical effect.

**(4) Stated limitations.** N=18 experts recruited from one vendor's beta pool (self-selected toward tolerance for new tools); heavy gender skew; a deliberately minimal one-parameter interface, so low controllability is partly *by design* — the authors' point is that even with high usability, steering remains the bottleneck.

**(5) Application here.** Three things. First, **usability and controllability are orthogonal**: a product can score 73–76 SUS and still fail, so our own evaluation must measure steering separately from ease of use. Second, the **9.54/10 with SD 0.93** is as close to unanimity as this literature gets — control is not a niche request. Third, the Louie finding tells us *which kind* of control pays: **semantically meaningful** parameters (voice lanes, semantic sliders, alternatives to choose between), not raw numeric knobs. For our API that means named, musically-meaningful parameters and **n-alternatives per stage**, not a temperature float.

## 1.3 The industry survey that quantifies the split

**LANDR study, 1,200 respondents from its global community, reported 2026 — `[PARTIAL]`, secondary report of a vendor-run survey.**
**87%** use AI in their workflows; **79%** for technical tasks (mixing, mastering, audio restoration); **66%** creatively (songwriting, melodies, instruments, vocals); **52%** for visual/promotional work; **84%** want AI for promotional activities. Critically: **29%** use AI to generate vocals, drums or instrumentals, **but only 13% used a tool to produce an entire song**; 16–18% already generate vocals/instrumentals/beats **for existing arrangements**; **65%** are open to using generators at some stage of their workflow. Polarisation is explicit: of the 31% not using more AI than last year, **76% have no plans to increase use**; **>40%** cited concerns about **low-quality output and the ethics/legality of AI trained on humans**.

**Limitations, stated:** this is a **vendor-run survey of that vendor's own community** — a population already predisposed to AI audio tools — reported through a secondary outlet; I did not obtain the underlying instrument or full methodology. It is therefore corroborative of direction, not authoritative on magnitude.

**Application here.** The 66%-creative-versus-13%-whole-song gap is the commercial shape of the finding in §1.1: **stage-level generation is a mass-market professional need; whole-song generation is a niche within it.** An engine with two surfaces should therefore expose stages as first-class products — "generate a vocal over my arrangement", "generate an instrumental bed under my vocal", "separate and replace this section" — and treat full-song generation as one composition of those stages rather than the only product.

---

# 2. The complaint corpus: what actually goes wrong, by pattern

**Method and honesty note.** Below I separate **generalisable patterns** (appearing independently across ≥2 platforms or explicitly identified as a recurring cluster by the aggregating source) from **anecdotes** (a single account, however vivid). Aggregate ratings are given for context so the complaints are not mistaken for the whole picture: the iOS app carries **4.9 stars from 287,927 ratings**, and the aggregator's own framing is that "even apps with strong overall ratings accumulate 1-3 star reviews when users hit specific issues." The Trustpilot profiles skew strongly negative, which is the known selection bias of complaint-driven review platforms — **stated, not hidden.**

## 2.1 Generalisable patterns

| # | Pattern | Independent corroboration | Product consequence for us |
|---|---|---|---|
| C1 | **Lyrics not honoured** — ignored, replaced with invented words, mispronounced, or sung in the wrong section; profanity inserted that was never supplied; lyrics appearing in tracks explicitly requested as instrumental | App-store cluster ("AI ignores user inputs", ranked **High**) + Trustpilot cluster ("unresponsive to prompts", "doesn't follow lyrics") | A **lyric-fidelity gate is mandatory**, not optional. Our own repo already has the instrument: transcribe the delivered audio and compare to the dictated words — this is exactly the controlled measurement that established Lyria returns 0 of 8 Turkish words. Ship that as a gate, and expose the score to the customer. |
| C2 | **Style/genre drift** — descriptors treated as hints; the same song regardless of prompt; a default fallback (community reports: a slow piano ballad) when no genre anchor is given; silent truncation of over-long style fields | Trustpilot cluster + two independent community troubleshooting corpora describing the same mechanics and the same fixes | Style adherence needs a **measured** score and a **hard** mode. If a field silently truncates, that is a bug we must not reproduce: **validate and report**, never truncate in silence. |
| C3 | **Wrong vocal attributes** — male vocals when female requested and vice versa; unwanted vocal runs/humming; inappropriate instruments overriding a supplied melody reference | Trustpilot (two profiles) | Voice must be a **selected, verifiable parameter**, not a hope. Our repo has already measured that named-voice selection genuinely works on the Vertex TTS surface via F0 (Charon 129.56 / Fenrir 144.14 / Aoede 190.48 / Kore 205.13 Hz, noise floor 6.72 Hz) — so a controlled voice-identity check is buildable today. |
| C4 | **Structural and audio defects** — abrupt endings, buzzing, sudden loudness changes, vocals going faint | Trustpilot + app-store audio-quality cluster | Delivery gates on **true peak/loudness, abrupt-termination detection and level continuity**, measured on the delivered file. |
| C5 | **Credit/quota loss without generation** — credits vanishing on page refresh or browser change with no track created; credits consumed on failed uploads; no roll-over | Trustpilot (multiple independent accounts, same mechanism) + pricing page confirming **credits do not roll over day-to-day or month-to-month** | **Bill on delivered artefact only.** Any failed or rejected generation must be released, not charged. This is the same discipline as this project's own spend-ledger law (commitments settled in a `finally` block at actual use, or released with a reason). |
| C6 | **Billing/entitlement failures** — charged with the account left on a free tier; subscriptions not activating; difficulty cancelling; declined transactions with funds available | Trustpilot (both domain profiles) + one documented case with dates | Entitlement must be **verified post-payment automatically**, with a self-serve status page. |
| C7 | **Support unresponsive or automated-only** — described as "nonexistent", long waits, automated replies | Trustpilot cluster (identified by the platform's own summarisation) + the documented case | A named human escalation path is a **differentiator**, not overhead — see §2.2. |
| C8 | **Editing destroys the track** — "Can't edit any tracks without it completely changing the song altogether" | Trustpilot; consistent with the professional study's "single input-output cycle" finding | **Section-level, non-destructive editing is the highest-value feature in this entire corpus**, because it is the one complaint that appears in both the casual and professional evidence. |
| C9 | **Moderation false positives with no explanation** | §4 | Explain the rejection and name the offending span. |

## 2.2 One documented case, reported because its dates are specific

A professional user's published account (with dates) describes an **annual subscription** charged while the account remained on Basic/Free, locking the user out of premium features, credits and commercial rights; on **11 March 2026** support acknowledged the disruption and offered **5,000 credits** as goodwill, which the user rejected on the ground that virtual currency cannot compensate a service breach; on **17 March 2026**, after a final demand, a **full refund** was issued and the subscription terminated **within roughly 180 seconds**. **This is one account, self-published by the aggrieved party — an anecdote, not a pattern, and I label it so.** It is included because it illustrates the escalation shape that C6+C7 produce, and because the remedy offered (credits) versus the remedy owed (money) is a policy choice we will have to make ourselves.

**Application:** our terms should state, up front, that a service failure is refunded in **money**, not credits. That is cheap to promise, expensive to break, and directly targets the loudest complaint cluster in the market leader's own review corpus.

---

# 3. Perception and disclosure expectations — the number that reframes "quality"

**Deezer/Ipsos 8-country survey, published November (reported 2026) — `[PARTIAL]`, vendor-commissioned, conducted by Ipsos, reported through the vendor's newsroom and independently in the trade press.**

- **97%** of respondents **could not distinguish** fully AI-generated music from human-made music in a **blind** listening test.
- **80%** agreed fully AI-generated music **should be clearly labelled**.
- **73%** want to know when their streaming platform is recommending synthetic tracks.
- **43%** of users switching to Deezer already had AI tracks in their playlists.

**Limitations, stated:** commissioned by a company that sells AI detection and has a commercial interest in labelling — a clear directional interest. The 97% figure is corroborated identically across the vendor newsroom and two independent trade reports, but they share one underlying producer, so this is **one provenance family**; sample sizes per country were not in the material I read. **`[single-source family]`.**

**Application here, and it is a strategic reframe.** If listeners cannot hear the difference, then **audio quality is no longer a defensible product axis** for consumer-facing AI music — which is precisely why §1 matters: the differentiators become **control, disclosure, rights clarity and workflow fit**. And since 80% want labelling, **disclosure is a trust asset rather than a confession** — it aligns with the EU Art. 50(2) obligation established in the future-needs document, so the compliant design is also the preferred-by-users design. For Berk's internal film line the conclusion is different and must not be blurred: his bar is not "listeners cannot tell" but real-photography-grade craft, and **no instrument in this corpus can judge that** — it remains BERK'S VERDICT.

---

# 4. Moderation, error transparency, and accessibility

## 4.1 Moderation false positives — mechanisms, from community corpora

Three mechanisms are described consistently across independent community sources, with concrete examples:
1. **String collapse.** Spaces and hyphens appear to be stripped before matching against a blocklist, so an innocuous place name can pattern-match a slur once context is removed (the river/country "Niger" is the named example, with "Congo" reported as passing in identical sentence structures).
2. **Producer-tag collisions.** The same stripping causes spelled-out numbers to collide with real producer tags ("ninety-three" → "ninetythree"; "eighty-eight" → matching a known tag), so a lyric about a birth year is rejected as an artist reference. Writing digits sidesteps it. A separate documented rejection message names a **producer credit collision** on the word "low-light" and, notably, actually told the user which term collided.
3. **Cumulative aggression scoring.** Not a word list: individually benign words ("fire", "wound", "tears", "burning") are said to be scored together, so stacking four in a verse can tip the whole prompt into rejection; softening one term restores it. The vendor's own moderation help page (reported second-hand here) lists well-known artist/person names, copyrighted or trademarked terms, derogatory or defamatory terms and excessive profanity as flag categories.

**The user-facing failure is the error message.** The recurring complaint is that the platform reports only "Prompt contained inappropriate material" **with no indication of which word or line caused it**, forcing a bisection ritual ("remove half the lyrics and test") to find the trigger.

**Non-English is reported as worse.** Community sources claim higher false-block rates for non-English lyrics, including West African languages, on the theory that the filter's training skews English; one source quantifies content moderation as "approximately 30% less accurate on non-English text". **I mark this `[UNVERIFIED]`: it is community-sourced, the 30% figure carries no citation I could open, and I did not find a formal study of multilingual music-moderation accuracy in this sweep.** The *mechanism* is plausible and the *complaint* is real; the *magnitude* is not established.

**Application here — three cheap, high-value design rules.** (i) **Name the span.** Return the exact offending substring or line index with the rejection; the corpus shows a single vendor message that did this and it was immediately actionable. (ii) **Never charge for a moderation rejection** (ties to C5). (iii) **Do not deploy an English-trained lyric filter against Turkish content without measuring it on Turkish material with a control** — a false block on Berk's own screenplay lines would be exactly the class of self-inflicted defect this project's measurement law exists to prevent.

## 4.2 Accessibility — the one formal review found

**American Foundation for the Blind, *AccessWorld* — accessibility review of Riffusion (a music-generation service), `[FULL]`.** Findings: the interface is "generally well-structured" and "impressively accessible" for screen-reader users, with labelled tabs that correctly indicate state, labelled input fields and most buttons, appropriate headings, and predictable screen-reader cursor behaviour — attributed partly to it being a simpler HTML site than most modern web apps. Defects named specifically: an **unlabelled clear-content button**; **unlabelled checkboxes** in Compose mode (mitigated by adjacent text); an unlabelled "Add random tags" button; an unlabelled "Edit Seed" button when Advanced is selected; a workflow break where finishing the lyric-writing dialog returns the user to the main page requiring re-entry; and **the most significant barrier — the terms-of-service screen at account creation is "entirely unreadable without OCR"**, bypassable only with a screen reader's OCR and mouse routing or sighted help.

**Application here.** Two concrete requirements. First, for any UI we build: **every control labelled, state announced, and — specifically — the legal/consent screen must be real text**, since that is where the reviewed product failed hardest and where consent must be informed. Second, and more strategically: **an API is inherently the most accessible interface**, because it lets assistive-technology users and third-party accessible clients bypass our UI entirely. That is a genuine, evidence-backed argument for the API-first shape Berk has already approved.

## 4.3 Accessibility as assistive creation — and a false-positive harm

A published press account describes a neurodiverse teenage musician whose **human-made** tracks were blocked from YouTube Content ID after automated systems judged them AI-generated; the platform initially applied a "one review per release" rule, and the decision was reversed only after repeated contact and a long written appeal. **This is one documented case, not a pattern**, and it appears in the future-needs document too because it is simultaneously a platform-policy fact and a user-expectation fact. **Application:** ship the customer a **complete provenance record** (prompt, supplied lyrics, model version, timestamps, stems, per-stage intermediates) as a deliverable artefact, so that a creator accused of undisclosed AI use — or wrongly accused of it — has evidence. For disabled creators who rely on generative tools as assistive technology, that record is the difference between an appeal they can win and one they cannot.

---

# 5. Turkish and non-English expectations — decision-relevant for the film line

**Status of the evidence, stated first: this section is COMMUNITY-CONSENSUS evidence, not measured evidence.** I found **no** peer-reviewed or vendor-published measurement of Turkish singing quality or Turkish lyric intelligibility in any AI music generator. What follows is the convergent guidance of three independent sources (two in Turkish, one bilingual), plus one Turkish-language comparison table. It is reported because it is actionable and because Berk's films are Turkish — **not** because it is verified.

**Convergent guidance (all three sources agree):**
- Write lyrics in **native Turkish script including ş, ç, ğ, ı, ö, ü**, in the tool's custom/lyrics mode rather than relying on a language tag.
- Use **explicit structure tags** (`[Verse 1]`, `[Chorus]`, `[Bridge]`).
- Use **English genre tags** and specific ones (`turkish pop`, `turkish arabesque`, `anatolian psychedelic rock`) rather than "Turkish music"; generic prompts drift toward a generic "Middle Eastern" sound rather than a Turkish one.
- Name **Turkish instruments** explicitly (bağlama, saz, ney, ud, darbuka, kemençe, davul, zurna) — sources report the models recognise them by name.
- Keep lines **short and grammatically clean**; avoid complex rhyme schemes; avoid mixing languages within a section.
- Add an explicit instruction that all lyrics are Turkish, to stop drift into English.

**Reported failure modes:** specific words mispronounced, with **`ş` and `ç` named as the recurring offenders**; the workarounds offered are phonetic respelling in parentheses (`gül-üş`) or, as a last resort, de-diacriticising (ç→c, ş→s, ğ→g, ı→i, ü→u, ö→o). One Turkish source ranks **Turkish folk (halk müziği) as the weakest genre** ("Suno kötü"), and states plainly that Turkish quality is "sınırlı ama çalışıyor" — limited but working — and that if you are "looking for perfect Turkish quality" the tools are "not yet full studio quality." A Turkish comparison table in the same source rates **Udio's Turkish as weaker than Suno's**, Stable Audio as having **no Turkish**, and MusicGen as instrumental-only.

**Contradiction preserved.** One bilingual source states "Suno's Turkish pronunciation is generally quite accurate" and that Turkish's consistent phonetics help; another states outright that `ş` and `ç` are problematic and folk music is bad. **Both are reported.** Neither is measured, and the honest reading is that Turkish works well enough for pop-adjacent material and degrades on traditional forms and specific phonemes.

**Application here — and this is where our own measured evidence beats the community's.** This project has already established, by controlled measurement on 2026-08-13, that **Google's Lyria does not sing dictated words at all**: 8 Turkish words dictated, **0 of 8** returned, verified by transcribing the delivered audio through this repo's own `/create-stt-vertex` endpoint, with a wordless "Ah, ah, ah" vocalise when no words were dictated and an instrumental negative control that passed — the control being what makes the other two arms evidence. So the Turkish question for us is not "how do I prompt around mispronunciation" but **"which component can sing Turkish words at all, and how do we measure it."** The instrument already exists in this repository. **The requirement this axis hands to the parent: a Turkish lyric-intelligibility gate — transcribe the delivered vocal, align to the dictated Turkish text, report per-word recall with a control — and it must be run on Turkish material specifically, because English-derived benchmarks do not transfer** (the same conclusion the AudioMarkBench fairness finding reaches for watermarking, in the future-needs document).

---

# 6. Switching triggers, unmet needs, and willingness to pay

**Switching triggers, ranked by strength of evidence rather than by intuition:**

| Rank | Trigger | Evidence class |
|---|---|---|
| 1 | **Loss of output portability / commercial rights** — the strongest observed trigger in the entire market: when Udio disabled downloads on settling with UMG (29 Oct 2025), the trade press documented an "apparent exodus among paying users", user threats of legal action, and an organised campaign to opt out of arbitration | **Behavioural**, multi-source, documented in the future-needs document |
| 2 | **Billing failure with no support** | Complaint clusters across two platforms + a dated case |
| 3 | **Credit loss / quota mechanics perceived as unfair** (no roll-over, credits vanishing) | Complaint clusters + vendor pricing page |
| 4 | **Inability to control or edit** — the professional exit route | Two formal primaries (§1.1, §1.2) |
| 5 | **Style/lyric non-compliance repeated over months** | One long-form complaint account describing the same defects persisting "from 9 months ago" — **anecdote**, but consistent with C1/C2 clusters |
| 6 | **Moderation false positives without explanation** | Community corpora, §4.1 |

**Explicitly stated unmet needs, taken from users' own words in the corpora:** a **persona/voice feature that can be trained on the user's own voice** and a library of "well-trained, high-quality, reliable" vocal presets (named as purchase conditions by one reviewer); melody-reference input that is actually respected rather than overridden by added bass and random instruments; **section-level editing that does not change the whole song**; credit roll-over; a real support channel; and — from the professional study — **granular, stage-level control with interpretable feedback**.

**Willingness to pay and its durability — the number that bounds the casual segment.** An independent analysis of RevenueCat's 2026 *State of Subscription Apps* (**>115,000 apps, >$16bn processed, >1bn transactions**) reports that AI apps **convert far better but retain far worse**: trial-to-paid **8.5% vs 5.6%** for non-AI (**+52%**); realised **LTV per payer $30.16 vs $21.37** (**+41%**); but **annual retention 21.1% vs 30.7%** (AI churns ~30% faster), monthly 12-month retention **6.1% vs 9.5%**, and a **refund rate of 4.2% vs 3.5%** with an AI ceiling of **16%**. Hard paywalls convert **10.7% vs 2.1%** for freemium — 5× — yet annual retention converges to **27–28%** either way, which the analysis reads as: the access model is a conversion choice, not a retention strategy. The stated diagnosis is that the strongest predictor of AI-app churn is **the absence of a recurring weekly workflow**. `[PARTIAL]` — I read two independent analyses of the report, not the report itself; RevenueCat is the single underlying producer, so this is **one provenance family** and the figures are marked accordingly.

**Application here, and it is the commercial hinge of this axis.** The casual segment pays well and leaves fast; the professional segment is harder to satisfy but is defined by a **recurring weekly workflow** — which is exactly the retention property the churn data says is missing. Combined with §1.3 (66% use AI creatively, 13% generate whole songs), the evidence points at a product that sells **stages inside a professional workflow**, priced for repeat use, rather than a novelty song generator priced for a month of fun. For our specific case that conclusion is doubly convenient, because the **internal** surface (Berk's film and game pipeline) *is* a recurring production workflow, and it is the same engine.

---

# 7. Contradictions, gaps, blind spots

**Contradictions preserved:**
1. **Turkish quality:** "generally quite accurate" vs "ş and ç are problematic, folk is bad". Both reported; neither measured.
2. **Aggregate satisfaction vs complaint corpora:** 4.9/5 from 287,927 iOS ratings against strongly negative Trustpilot profiles. Both reported, with the selection bias of each named — these measure different populations (app users vs users motivated to file a complaint), and averaging them would be meaningless.
3. **Professional attitude:** the thesis records professionals taking "a strong stand against AI involvement in music production", while the 1,200-respondent survey has 87% already using AI. Reconciled by *scope*, not by splitting the difference: professionals reject AI **making the creative decisions**, not AI **in the toolchain** — the thesis's own participants named legitimate uses (background music, simple instrument sounds).
4. **Hobbyist vs professional difference:** the MMM-C study found **no significant difference** between hobbyist and professional experts on usability, while the thesis frames novice-versus-professional as the central divide. Both stand: MMM-C compared two **expert** groups (hobbyist-expert vs professional-expert), the thesis compared **novices vs professionals**. The distinction is real and I am keeping it visible rather than collapsing it.

**Gaps — NOT FOUND IN THE SEARCHED SCOPE (never "there is no evidence"):**
- **No measured study of Turkish (or any non-English) singing intelligibility** in commercial AI music generators. Channels searched: U1, U3.
- **No peer-reviewed study of moderation false-positive rates** in music generation, in any language. Channels searched: U4.
- **No systematic app-store review corpus analysis** with counts per complaint category — the aggregator I used ranks categories (High/Medium) but publishes no per-category counts, and I did not scrape the store. Channels searched: U2.
- **No formal accessibility evaluation of Suno or Udio** — the only formal review found covers Riffusion. Channels searched: U4.
- **No first-party UI walkthrough** — deliberate: creating an account or starting a trial was outside the access rules for this run.
- **Discord and Reddit corpora** were not systematically sampled; Reddit content is referenced only where the trade press reported on it. Channels searched: U2, U4.
- **Enterprise/B2B buyer expectations** (game studios, ad agencies, production-music libraries) — the population our API would actually sell to — are **not represented by any source in this axis**. This is the biggest gap for the build decision and I am naming it as such: everything above is about individual creators.

**Blind spot named for the parent:** review corpora and community guidance decay fast; the model versions referenced (v4.5, v5, v5.5) and the fixes that work against them will not be current for long. Every claim here is stamped **2026-08-13**.

---

# 8. What this axis hands to the parent, per item

Requirements, each traceable to the evidence above — the parent owns the architecture, so these are stated as requirements, not designs:

1. **Stage-addressable engine** (lyrics → melody/structure → vocal → bed → alignment → mix), each stage separately callable, re-runnable and returning an inspectable intermediate. → §1.1 (both gulfs), §1.3 (13% vs 66%).
2. **Semantically meaningful parameters plus n-alternatives per stage**, not raw numeric knobs. → §1.2 (Louie via MMM-C).
3. **Non-destructive section-level editing.** → C8, the only complaint appearing in both populations.
4. **Lyric-fidelity gate** with per-word recall against the dictated text, run on Turkish material, with a control that can both pass and fail. → C1, §5, and this repo's own Lyria measurement.
5. **Verifiable voice identity** as a selected parameter, measurable (F0-class control already proven here). → C3.
6. **Delivery gates** on loudness/true peak, abrupt-termination and level continuity, measured on the delivered file. → C4.
7. **Bill only on delivered artefact; release every unfulfilled commitment; refund service failures in money, not credits.** → C5, C6, §2.2.
8. **Transparent moderation:** name the offending span, never charge for a rejection, never deploy an English-trained filter on Turkish without measuring it. → §4.1.
9. **Provenance record as a customer deliverable** (prompt, supplied lyrics, model version, timestamps, stems, per-stage intermediates). → §4.3, and it doubles as the Art. 50 disclosure material in the future-needs document.
10. **Honest ownership language** — no promise of copyright; maximise the customer's own authorship layer. → future-needs §2, and the "creative ownership" complaint in §1.1.
11. **Accessibility:** every control labelled, state announced, consent screens as real text. → §4.2.
12. **Price and package for a recurring workflow**, not a novelty month. → §6.

---

# 9. Completion audit for this axis

- Every CONTEXT-02 axis-4 angle addressed: app-store and review-platform corpora ✔ · forum/community corpora ✔ (labelled as community evidence) · the nine named complaint patterns ✔ (vocal artefacts, lyric mispronunciation, credit exhaustion, generation failures, style drift, inability to edit a section, loss of a version, refunds, moderation false positives — all present as C1–C9 plus §2.2) · switching triggers ✔ ranked by evidence class · explicitly stated unmet needs ✔ · accessibility ✔ (one formal review + assistive-use case) · **professional vs casual populations kept strictly separate** ✔ · ownership and monetisation expectations ✔ · non-English/Turkish ✔ with its evidence class stated · formal user studies of this product class ✔ (4).
- Anecdote versus generalisable pattern distinguished throughout, per §2's stated method.
- Formal/academic primaries: **4** (3 `[FULL]`, 1 `[PARTIAL]`). Surveys with stated N: **2**. Complaint platforms: **3**. Turkish sources: **3**. Total distinct authoritative sources: **16**.
- Privacy: no identifiable individual quoted or named; review captures containing reviewer identifiers deliberately **not** archived.
- Read-back: reopened from disk after writing; line count and SHA-256 reported to the parent.

*Retrieved and written 2026-08-13. Community-sourced claims are labelled; the Turkish quality question is explicitly unmeasured, and the instrument to measure it already exists in this repository.*

