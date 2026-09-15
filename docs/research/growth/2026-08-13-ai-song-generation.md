# Standards ledger

Governance read from disk this session, before any external action:

| Governing file | Evidence | How this document satisfies it |
|---|---|---|
| `C:\Users\berke\.claude\skills\deep-research\SKILL.md` — the merged deep-research law and covenant (PART I activation law; PART II R0–R18 + annexes P1–P5) | SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes, hashed and read **in full** this session | MODE B owner research order; discovery-first; primaries opened; read status marked honestly; ≥3-source cross-verification on load-bearing claims; **claims a company makes about itself separated from independently measured facts** |
| `c:\Berk\SsmContentAssetCreator\AGENTS.md` | delivered into this session's context by the host rule loader | Research floor; four source tiers incl. THE DARK; dated English artefact under `docs/research/`; captures archived under `docs/research/_sources/` |
| `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session (70 lines) | Per-source depth with real numbers, stated limitations and concrete application; recency-first; no guessed locator |
| `docs/research/_runs/2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session (207 lines) | This is planned artefact **#10**, axis 6 (growth and organic discoverability); governed path `docs/research/` per scope plan §12 |

Artefact language ENGLISH per Berk's law; Turkish appears only as verbatim quoted evidence.

**The discipline this axis needs most, stated up front:** growth writing is where unfalsifiable claims live. Every number below is tagged by class — **`[MEASURED]`** (third-party measurement or peer-reviewed experiment), **`[COMPANY-CLAIMED]`** (the company's own assertion about itself), or **`[VENDOR-INTERESTED]`** (published by a party selling the thing being measured). CONTEXT-02 explicitly asks what actually worked for the named competitors **versus what they merely claim**, and that separation is enforced throughout, most sharply in §5.

---

# Outcome first

**The honest headline is a limitation, not a playbook: for the named competitors in this category, almost every growth claim available is the company's own, and the one large-scale independent measurement of this product class measures *traffic*, not the mechanism that produced it.** What follows separates the four things that are genuinely measured from the many that are merely asserted.

**What is measured:**
1. **Music is one of only two creative categories that resisted bundling by the model giants.** Independent third-party measurement (SimilarWeb unique monthly visits, January 2026; Sensor Tower MAU) places **Suno at #15 on the web list** in a16z's 6th-edition Top 100 Gen AI Consumer Apps (published ~March 2026), and its authors' explicit finding is that "**music and voice have been more defensible**" while image generation collapsed from seven of nine creative slots to three. `[MEASURED]` **This is the strongest structural argument for entering the category at all.**
2. **The economics of a consumer AI subscription are conversion-rich and retention-poor, with hard numbers.** From RevenueCat's 2026 report (>115,000 apps, >$16bn processed): AI apps convert trials at **8.5% vs 5.6%** (+52%), earn **$30.16 vs $21.37** realised LTV per payer (+41%), but retain **21.1% vs 30.7%** annually (~30% faster churn), refund at **4.2% vs 3.5%**, and — decisively — **hard paywalls convert 10.7% vs 2.1% (5×) while annual retention converges to 27–28% either way**. `[MEASURED, one provenance family]`
3. **Discoverability inside AI assistants has one peer-reviewed causal result, and it is specific.** The KDD 2024 GEO paper (arXiv:2311.09735) built **GEO-bench (10,000 queries)** and measured **up to +40% visibility**, with **Statistics Addition +41%** and **Quotation Addition +28%** on Position-Adjusted Word Count, **+37% on the live Perplexity.ai engine** — and, importantly, **keyword stuffing did not work** and adding words alone produced no improvement. `[MEASURED, peer-reviewed]`
4. **A 2026 critical survey of 45 GEO studies concludes the field has no proven durable effect.** Its stated finding: topical relevance and context position are the most reproducible levers, generic heuristics transfer poorly, citation-oriented rewrites **can impair retrieval**, and **no reviewed method demonstrates a stable longitudinal cross-platform causal effect** on organic discoverability or downstream behaviour. `[MEASURED — a survey of measurements]` **This is the finding that should stop us from buying a GEO programme.**

**What is claimed rather than measured:** Suno's user and revenue scale (**>100M lifetime users, 2M paid subscribers, ~$300M ARR at February 2026, >7M tracks/day**), its account of *why* it grew (**"Viral trends helped propel Suno to #1 in the App Store's Music category in dozens of countries"**, family text threads and group chats turned into songs, birthdays, hospice use), and its statement that engagement rose while cancellation rates declined. All `[COMPANY-CLAIMED]`. The **$5.4bn post-money Series D (>$400M, June 2026, led by Bond Capital) and >$775M raised in total** are corroborated across multiple independent outlets and the company's own announcement — investor-round facts I treat as reliable, the *causal story* attached to them I do not.

**The most decision-relevant asymmetry for us: our deliverable is an API, and the category leader does not sell one.** As of **1 July 2026** Suno's Chief Product Officer publicly opened an intake form to "explore a developer API… starting with a curated group of partners", and as of the July 2026 reporting there is **no public self-serve API, no published endpoints, no documentation and no pricing**. Third-party wrappers exist and are not endorsed. **That is an open, dated, verifiable gap in the leading product — and it is precisely the shape of what this repository already is.**

---

# Framing: what this axis controls, and its falsifier

Decision served (scope plan §1): build or not build a song-generation product; Berk approved **scope (c) — one engine, two surfaces**: an internal engine for the film/game pipeline and an outward-facing product API we sell. This axis controls **how such a product would be distributed and grown**, and whether growth is plausible without consumer-marketing spend that a solo founder cannot sustain.

**Falsifier for this axis' conclusion:** if the only demonstrated growth path in this category is high-spend consumer virality (paid social + UGC creator programmes) with no evidenced developer-led route, then the API-first shape is unsupported by evidence and the recommendation would have to change. §4 reports what I found on both halves — including a piece of direct evidence about how the leader actually staffs growth.

---

# Inclusion, exclusion, dates

- **Dates:** all retrievals **2026-08-13**; 2026 sources lead. The KDD paper is 2024 and is used because it remains the only peer-reviewed causal measurement of AI-answer visibility; its date is stated every time it is relied on.
- **Included:** third-party measurement panels (SimilarWeb, Sensor Tower via a16z), a subscription-economics report analysed by two independent outlets, peer-reviewed and preprint GEO research, first-party company announcements (clearly tagged), first-party pricing and policy pages, official platform newsrooms, and trade-press reporting that cites named sources.
- **Excluded:** GEO/SEO agency marketing pages **as evidence of efficacy** (used only to locate underlying studies, and named as such); affiliate content; undated growth-hack listicles. One agency page and one aggregation page were opened **to trace citations back to primaries** — a use I disclose rather than hide, and no efficacy claim in this document rests on either.
- Nothing paywalled, credentialed or robots-restricted; no account created, no trial started, no money spent.

---

# Methodology and exact query/action log

| # | Action | Exact query / locator | Yield |
|---|---|---|---|
| G1 | search | `Suno funding round valuation annualized revenue users 2026 growth Udio ARR downloads` | scale figures + the funding facts; **Suno's own Series D blog** as the primary for its growth narrative |
| G2 | search | `a16z top 100 generative AI consumer apps 2026 music ranking web mobile Suno` | **the independent measurement**: #15 web, music/voice defensibility |
| G3 | search | `Suno API developer platform official pricing music generation API commercial terms 2026` | **the API gap**, dated 1 July 2026, plus third-party wrapper economics |
| G4 | search | `generative engine optimization LLM answer engine discoverability research 2026 brand citations study measurement` | the KDD paper's identity + the 2026 critical survey + the citation-absorption framework |
| G5 | fetch | `https://arxiv.org/abs/2311.09735` | **GEO paper read `[FULL]`**; GEO-bench, the +40%/41%/28%/37% numbers, and the negative result on keyword stuffing |
| G6 | search | `consumer AI subscription retention churn benchmark 2026 creative tools monthly churn rate freemium conversion referral loop` | the RevenueCat numbers via two independent analyses |
| G7 | search | `Spotify AI music policy disclosure DDEX credits spam filter impersonation official announcement` | the distribution-channel reality (also used in the future-needs document) |
| G8 | search | `Deezer AI-generated tracks 2026 statistics daily uploads percentage detection tagging official press release` | the supply-glut numbers that bound the "publish to streaming" growth loop |

Adversarial lane, run deliberately: I searched for **criticism and negative results** on GEO rather than only for efficacy — which is how the 2026 critical survey of 45 studies and the citation-selection-versus-absorption distinction were found. Both cut against the optimistic reading and are reported prominently (§3).

**Marginal yield:** G1–G3 produced the competitor and API picture; G4–G5 produced the only peer-reviewed causal result **and** its strongest refutation; G6 produced the retention economics; G7–G8 produced the channel constraints. A further round returned agency restatements of G4's primaries — the stopping point, stated rather than dressed up.

---

# Source counts for this axis

- **Independent measurement sources: 3** — a16z 6th edition (SimilarWeb + Sensor Tower panels, Jan 2026 data); RevenueCat 2026 *State of Subscription Apps* via two independent analyses (**one** provenance family); Deezer's own detection telemetry (vendor-interested but the only quantification of AI supply).
- **Peer-reviewed / formal research: 3** — GEO (KDD 2024, arXiv:2311.09735) `[FULL]`; *Optimizing Visibility in Generative Engines: A Critical Survey of Generative Engine Optimization (2023–2026)* `[ABS/second-hand]`; *From Citation Selection to Citation Absorption* (2026, 602 controlled prompts) `[ABS/second-hand]`.
- **First-party company primaries: 5** — Suno Series D announcement; Suno downloads/ToS blog (3 Jun 2026); Suno pricing page; Suno CPO's API intake post (1 Jul 2026, via trade report); Spotify newsroom (25 Sep 2025).
- **Trade press citing named sources: 6** — MBW ×2, Billboard, Fortune, TechFundingNews, Sacra.
- **Axis total distinct authoritative sources: 15** (provenance families).

---

# 1. The category structure: what independent measurement says about where growth is possible

**a16z, *The Top 100 Gen AI Consumer Apps — 6th Edition*, published ~10 March 2026 — `[FULL]` (24 KB capture read). `[MEASURED]` by third-party panels.**

**(1) Problem in the authors' framing.** A bi-annual attempt to measure "what people are actually using" in consumer AI, broadened from this edition onward to include products where generative AI became core (CapCut, Canva, Notion, Picsart, Freepik, Grammarly) rather than only AI-native ones.

**(2) Method.** Web ranking by **unique monthly visits per SimilarWeb, January 2026**; mobile ranking by **monthly active users per Sensor Tower, January 2026**. Two ranked lists of 50.

**(3) Real numbers and the structural finding.** ChatGPT is **2.7× the #2 (Gemini) on web traffic** and **2.5× on mobile MAU**, with weekly actives up 500 million year-on-year to **900 million** — "over 10% of the global population". The finding that matters to us: in the first edition (September 2023) **seven of nine** creative tools on the web list were image generators; three years later **only three** remain, while **seven creative tools still make the list** — the gap filled by **video, music and voice**. Verbatim: "**Music and voice have been more defensible. Suno (#15) retained its rank from the last version of the list.** ElevenLabs has appeared on every edition since September 2023; its capabilities — voice cloning, dubbing, audio production — remain specialized enough that they haven't been replicated as a checkbox feature." And the mechanism: "where the model giants and incumbents like Google and OpenAI have focused their creative efforts (image, increasingly video), standalone traffic compresses… Where they haven't (music, voice), there's more room." Midjourney's fall from top-10 in the first edition to **#46** is the counter-example they cite.

**(4) Stated limitations.** Panel-estimated traffic and MAU, not instrumented first-party data; a single month (January 2026); web visits and mobile MAU are different constructs and are not comparable to each other; the ranking measures **attention, not revenue or retention**; and the broadened inclusion criteria mean this edition is not strictly comparable to earlier ones — the authors say so themselves.

**(5) Application here.** This is the strongest evidence in the whole axis, and it is structural rather than tactical: **music has not been absorbed as a checkbox feature by the model giants, and voice/audio specialisation has stayed defensible for three consecutive years.** For us that means the category is not a race against an imminent bundling event — which is exactly the risk that killed standalone image generation. It also implies the durable moat is **specialisation and opinionated depth**, not breadth: the products that survived did so with "opinionated aesthetics or sophisticated workflows that ChatGPT and Gemini can't replicate as a checkbox feature". That is the same conclusion the customer-expectations document reaches from the professional-control evidence, arrived at from a completely independent direction — and two independent lines of evidence converging is worth more than either alone.

---

# 2. The economics of growth in this product class

**RevenueCat *State of Subscription Apps* 2026, read through two independent analyses — `[PARTIAL]`, `[MEASURED]`, **one provenance family** (RevenueCat is the sole underlying producer; I did not open the report itself).**

**Scale of the dataset as reported:** **>115,000 apps**, **>$16bn** processed, **>1bn** in-app transactions.

| Metric | AI apps | Non-AI apps | Delta |
|---|---|---|---|
| Trial → paid conversion | **8.5%** | 5.6% | **+52%** |
| Realised LTV per payer, year 1 | **$30.16** | $21.37 | **+41%** |
| First-month LTV per payer | $18.92 | $13.59 | +39% |
| **Annual subscriber retention** | **21.1%** | **30.7%** | **AI churns ~30% faster** |
| Monthly-plan 12-month retention | 6.1% | 9.5% | −3.4 pp |
| Refund rate (median / ceiling) | **4.2% / 16%** | 3.5% / 12.5% | worse |

Access-model finding: **hard paywall converts 10.7% vs freemium 2.1% — 5×** — yet after one year **annual retention converges to 27–28%** (monthly 8% vs 9%). One analysis states the conclusion directly: the access model "is a conversion choice rather than a retention strategy." Also reported: **32.2% involuntary cancellation rate on Google Play**, and higher-priced apps retain better than cheaper ones (**23% vs ~21%**). The diagnosis both analyses converge on: **the strongest predictor of AI-app churn is the absence of a recurring weekly workflow** — "a workflow problem, not a value problem."

**Stated limitations.** RevenueCat's panel is self-selected (apps using RevenueCat), skewed toward indie and mid-market mobile subscriptions rather than B2B APIs; "AI app" is a coarse classification; and the two analyses I read are secondary. **The B2B-API case is not in this dataset at all** — I flag that rather than extrapolating.

**Application here, and it is a pricing decision the parent will need.** Three consequences. (i) **Do not default to freemium.** The 5× conversion advantage of a hard paywall with no long-run retention penalty is the single most actionable number in this axis, and it also removes the free-tier abuse surface that a generation API attracts. (ii) **Design for recurring workflow use, not novelty**, because that is the measured churn predictor — and our internal film/game pipeline is itself a recurring workflow, so the same engine has a built-in non-churning consumer. (iii) **Expect refunds and involuntary churn to be worse than normal** and build dunning and entitlement verification early — which also fixes complaint clusters C6/C7 in the customer-expectations document.

---

# 3. Discoverability inside AI assistants: one real result, and its strongest refutation

## 3.1 The peer-reviewed result — five-part record

**"GEO: Generative Engine Optimization", KDD '24 (Proceedings of the 30th ACM SIGKDD Conference, Barcelona, 25–29 August 2024), DOI 10.1145/3637528.3671900, arXiv:2311.09735 — read `[FULL]` (71 KB capture). Authors' institutions per the associated reporting: Princeton, Georgia Tech, Allen Institute for AI, IIT Delhi.**

**(1) Problem in the authors' own framing.** Generative engines "remove the need to navigate to websites by directly providing a precise and comprehensive response, potentially reducing organic traffic to websites and impacting their visibility… the black-box and proprietary nature of generative engines makes it difficult for content creators to control and understand how their content is ingested and portrayed." Their stated concern is that "the creator economy is not disadvantaged."

**(2) Method, step by step.** A **black-box optimisation framework**: a GEO method is a function `f: W → W′` mapping web content to modified content, without knowledge of the engine's internals and independent of the exact query. Because ranking is meaningless when a generative engine interleaves citations in one block, they define **impression metrics** on three principles (relevant to creators, explainable, comprehensible): a normalised **Word Count** metric; a **Position-Adjusted Word Count** using an **exponentially decaying** positional weight, chosen because click-through rate follows a power law in rank; and a **Subjective Impression** metric with **seven** sub-facets — relevance of the cited sentence, **influence** of the citation (how much the response relies on it), uniqueness, subjective position, subjective count, click likelihood, and diversity. Metrics are normalised so all citations in a response sum to 1, and improvement is measured as relative change. **Nine** GEO methods are evaluated against an unmodified baseline on the full **GEO-bench** test split, averaged over **five random seeds**.

**(3) Real numbers from the paper's own tables.** GEO-bench comprises **10,000 queries** from diverse domains and sources. Headline: visibility improved **up to 40%**. Table 1: the best methods improve on baseline by **41% on Position-Adjusted Word Count** and **28% on Subjective Impression**; the top three methods — **Cite Sources, Quotation Addition, Statistics Addition** — achieve **30–40%** relative improvement on PAWC and **15–30%** on Subjective Impression. On the live black-box engine **Perplexity.ai**, improvements reach **37%**. **The negative results are as valuable as the positive ones and the authors state them plainly: "simple methods like Keyword Stuffing traditionally used in SEO don't perform well"**, and (per the aggregated reporting of the same paper) **simply adding more words produced no improvement** — the signal is *data density and source credibility*, not volume.

**(4) Stated limitations.** The Subjective Impression metric is explicitly subjective and computed rather than observed from users; results are engine- and time-bound (this is a 2024 measurement of systems that have changed); the framework optimises *impression*, not traffic, revenue or conversion; and generative engines are black boxes, so nothing here identifies a causal mechanism inside them.

**(5) Application here.** Two concrete, cheap actions. First, **our public documentation and any comparison pages should carry real statistics, named sources and quotable definitions**, because that is the measured lever — and, conveniently, it is exactly what this repository's own research standard already forces us to produce. Second, **keyword stuffing and length padding are measured non-levers**, so no effort goes there. I note the epistemic bonus: the artefacts this project already writes — dated, cited, numbers-dense, structured — are the format the only peer-reviewed study says gets cited.

## 3.2 The refutation, reported at equal weight

**"Optimizing Visibility in Generative Engines: A Critical Survey of Generative Engine Optimization (2023–2026)" — reviews **45 GEO studies**; `[ABS/second-hand]`, reached through an aggregating page that cited it; I did **not** open the paper.** Its reported findings: it formalises a **stochastic, partially observable pipeline** (search activation → crawling/indexing → retrieval → reranking → context allocation → citation → prominence → factual absorption → fidelity → user behaviour), and concludes that **topical relevance and context position are the most reproducible levers**, that **generic heuristics transfer poorly**, that **citation-oriented rewrites can impair retrieval**, and that **"no reviewed method demonstrates a stable longitudinal cross-platform causal effect on organic discoverability or downstream behaviour."**

**"From Citation Selection to Citation Absorption: A Measurement Framework for Generative Engine Optimization Across AI Search Platforms" (2026) — `[ABS/second-hand]`.** Reported: **602 controlled prompts** across ChatGPT, Google AI Overview/Gemini and Perplexity, distinguishing **citation selection** (the platform searches and picks sources) from **citation absorption** (the cited page actually contributes language, evidence, structure or factual support to the answer), and finding that **breadth and influence can diverge**, with high-influence pages being longer, more structured, semantically aligned and richer in extractable definitions, numerical facts, comparisons and procedural steps.

**Why I am giving these equal billing.** The temptation in a growth document is to quote the +40% and stop. The honest position is: **one 2024 peer-reviewed experiment shows a real effect on an impression proxy; a 2026 survey of 45 studies says nobody has demonstrated a durable cross-platform effect on actual discoverability, and that some citation-oriented rewrites backfire.** Therefore: write documentation that is dense with real numbers and clean structure because it is *good documentation anyway* and the evidence mildly favours it — and **do not buy a GEO programme, do not hire a GEO agency, and do not report AI-citation counts as a growth metric as if they were revenue.** I also record that several of the aggregating pages I traced were agency marketing; I used them **only** to find the underlying papers, and no efficacy claim here rests on them.

**Measurement, if we do anything at all.** The instrumentable parts, per the sources: a fixed prompt set run periodically across ChatGPT/Gemini/Perplexity/AI Overviews logging appearance, position and sentiment (share of voice); and **GA4 referral traffic from `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`** — which one source calls "the closest thing GEO has to a click report". `[VENDOR-INTERESTED]` for the tooling recommendations attached to those methods, and I am not repeating the vendor names as endorsements.

---

# 4. API-led and developer-led growth — the axis that matters most to us

**The finding, dated and verifiable: the category leader has no public API, and said so while asking developers what to build.**

On **1 July 2026**, Suno's Chief Product Officer Jack Brody published a LinkedIn post linking an intake form: "Ahead of our partner powered model, we're **exploring a developer API** and want to hear from you before we start building… We plan to start with a **curated group of partners** so we can develop this thoughtfully, and we're especially interested in applications that unlock experiences generative music makes possible for the first time." The form itself states: "We're beginning to explore a developer API, starting with a curated group of partners." **No timeline was disclosed.** Cross-checked against two independent API-landscape write-ups: **Suno has no self-serve public API, no published endpoints, no documentation and no general-access pricing**; its Free/Pro/Premier subscriptions cover the website, apps and Studio, **not** programmatic access; and **Udio's own help centre states it does not currently offer a public API.** Programmatic access to both exists only through **third-party wrappers that are not endorsed** — one such provider is quoted at **11 credits per generation returning two tracks, ≈$0.11 per call ≈ $0.055 per track** at a $0.01/credit top-up rate. `[single-source]` for that specific price, and it is a reseller's own rate card, not a vendor price.

**Application here — this is the axis' central strategic finding.** The two most capable consumer products in the category are **deliberately not selling the thing we already know how to ship**: a route-per-asset-type REST API over per-provider workers, which is literally this repository's existing architecture (~178 routes, per-asset-type Lambdas). Three consequences: (i) **the developer segment is structurally under-served right now**, and the leader has publicly said it will serve it only through a curated partner programme, i.e. slowly and selectively; (ii) **the honest competitive framing is not "beat Suno at consumer song generation"** — the a16z panel shows what that costs in attention terms — **but "be the API the leader has not shipped"**; (iii) our credibility in that segment rests on the things developers can verify: documented endpoints, stable versioning, measured latency and cost per call, explicit rights language, and — from the future-needs document — Art. 50(2) provenance handled **for** the customer. **Caveat stated: nothing in this sweep measures demand for a music-generation API.** The gap is verified; the demand is inferred from the existence of third-party wrapper businesses and from Suno's own intake form. **That inference is labelled, and validating it is a named next action (§7).**

**What we know about how the leader actually staffs growth — a small but revealing datum.** The LinkedIn post announcing Suno's #15 a16z ranking was published by a Suno employee and used to recruit **"two people in paid social and UGC"** — a **Paid Social Manager** and a **Growth Marketing Specialist, UGC Creators**. `[COMPANY-CLAIMED]` but behaviourally informative: the leader's growth engine is **paid social plus UGC creator programmes**, i.e. capital-intensive consumer marketing. **A solo founder cannot win that game, and this is direct evidence of what the game is.** It supports the falsifier test in §"Framing": consumer virality is the demonstrated path for the incumbent, which is precisely why our path must be the developer one rather than a copy of theirs.

---

# 5. Product-led loops and virality: what is actually evidenced versus asserted

**Asserted by the company, `[COMPANY-CLAIMED]`, and reported as such.** Suno's Series D announcement (June 2026) attributes growth to: cultural adoption ("Family members are turning text threads, group chats, and inside jokes into songs. People are writing songs for birthdays, graduations, and even work events"); **"Viral trends helped propel Suno to #1 in the App Store's Music category in dozens of countries"**; emotionally resonant use (patients in hospice care); and that "more than half of our team are musicians themselves". Separately, via Bloomberg reporting, the CEO said engagement increased while **cancellation rates declined**: "A higher share of users are falling in love with the product and coming back."

**Why I am not converting any of that into a growth mechanism for us.** None of it is measured by a third party, none of it isolates a loop from paid acquisition, and "viral trends" is an outcome description rather than a mechanism. Note also the tension with §2's independent data: **AI apps in general churn ~30% faster**, so a claim of *declining* cancellation is either a genuine outlier or a favourable window — and I cannot distinguish those from the available evidence.

**Loop mechanics that are structurally observable from primary product surfaces**, which is the most I can honestly claim:
- **A public feed / shareability surface exists** in the product class — Suno's terms define the Service as including "a public forum where Content can be shared… with other users", and its downloads blog states "every song stays **playable and shareable** on Suno, on every plan" **even for free users who have exhausted their 7 lifetime downloads**. That is a deliberate design: **share is free, extraction is paid.** `[PRIMARY, observed in the vendor's own text]`
- **Freemium quota as the conversion trigger.** An independent analyst estimate states "nearly 50% of first-time users hit the free tier limit" `[single-source, analyst estimate]`, and the download tiers (Free 7 lifetime / Pro 20 per month / Premier 60 per month, effective 3 Sep 2026) place the paywall precisely at the moment of *taking the song away*.
- **Contests and remix mechanics**: **NOT FOUND IN THE SEARCHED SCOPE** as primary evidence. I did not retrieve an official contest page or a documented remix loop, and I will not assert one.

**The "publish to streaming" growth loop is measurably saturated, and this is the hardest number in the section.** Deezer's own telemetry: fully AI-generated uploads reached **~90,000 per day, >50% of all daily new music uploads at peak in June 2026** (up from 75,000/44% in April and 60,000/39% in January), **13.4 million** AI tracks detected and tagged during 2025 — while AI music is only **1–3% of streams**, and **up to 85% of those streams were fraudulent in 2025** and excluded from royalty calculations. Spotify separately removed **>75 million "spammy tracks"** in the twelve months to September 2025. `[VENDOR-INTERESTED but quantitative and consistent across two independent platforms]`

**Application here.** Any growth story of the form "our users will make songs and upload them to streaming services and that will pull in more users" is aimed at the single most crowded, most aggressively demonetised channel in music. **That loop is closed.** The channels that remain open are (i) **B2B functional music** — film, games, ads, apps, retail — which is the shape of this repository's existing customer surface; (ii) **developer distribution** (§4); (iii) **share-not-publish social loops**, where the artefact circulates privately rather than competing for streaming royalties. For Berk's own case, the internal film line is itself demand that needs no acquisition channel at all.

---

# 6. Pricing and packaging as a growth lever

Observed structures, all from primary vendor surfaces dated **2026-08-13** and marked `[single-source official]`:

| Tier | Price | Credits | Downloads (from 3 Sep 2026) | Rights |
|---|---|---|---|---|
| Free | $0 | 50 credits renewed **daily** | **7 lifetime** trial downloads | personal use only, **no commercial use** |
| Pro | $10/mo (from $8 annual) | 2,500/mo | **20/mo** | commercial rights for songs downloaded while subscribed |
| Premier | $30/mo (from $24 annual) | 10,000/mo | **60/mo** (Studio downloads exempt) | as Pro, plus Studio |

Mechanics worth copying or refusing, each with its reason: credits **do not roll over** day-to-day or month-to-month (a complaint driver in the customer-expectations document — **refuse**); purchased top-up credits do not expire **but require an active subscription** (a retention hook — defensible if disclosed); extra downloads purchasable, **price unpublished** (opacity that the community noticed — **refuse**); a **generous free tier for creating** paired with a **hard gate on taking the file** (the core packaging insight — **adapt**); and an **enterprise tier reached only via sales contact**.

**Application here.** For an API the download gate is incoherent (the file *is* the product), so the lever moves to **per-delivery pricing with a hard paywall from the first call** — which is also what §2's 5×-conversion finding supports. Packaging should follow the stage-level architecture the customer-expectations document derives: charge per delivered artefact per stage, so a customer re-running one stage does not pay for a whole song, and never charge for a moderation rejection or a failed generation. **Positioning note grounded in §2:** higher-priced apps were measured to retain better (23% vs ~21%), and Berk's standing constraint is that cost is not the deciding factor — quality is. Competing on being cheapest than a $0.055/track reseller is therefore both unwinnable and off-strategy.

---

# 7. Contradictions, gaps, blind spots

**Contradictions preserved:**
1. **Churn:** independent data says AI apps churn ~30% faster than non-AI; the leader claims **declining** cancellation. Both reported; I cannot adjudicate, and the company's claim is `[COMPANY-CLAIMED]`.
2. **GEO efficacy:** a peer-reviewed +40% impression effect (2024) versus a 2026 survey of 45 studies finding **no durable cross-platform causal effect** and that citation-oriented rewrites **can impair retrieval**. Both at equal weight; the conservative reading is adopted.
3. **Access model:** hard paywalls convert 5× better, yet the leader runs a generous free tier. Reconciled by *what* is gated — creation is free, **extraction** is paid — rather than by declaring one model superior.
4. **Market sizing:** a third-party forecast quoted at **$569.7M (2024) → $2.79B (2030), 30.5% CAGR**, against Suno's claimed **~$300M ARR** at Feb 2026 — the leader's single-company revenue claim already approaches the forecast's whole-2024 market. The forecast is **stale and secondary**; I report the conflict and rely on neither figure.

**Gaps — NOT FOUND IN THE SEARCHED SCOPE:**
- **No independent measurement of any competitor's acquisition channel mix** (paid vs organic vs referral). The recruiting post is indicative, not a measurement. Channels searched: G1, G2.
- **No documented contest, remix or referral-programme mechanic** as a primary. Channels searched: G1.
- **No demand measurement for a music-generation API** — the supply gap is verified, the demand is inferred. Channels searched: G3.
- **No SEO/organic-search data** for any competitor (keyword footprints, backlink profiles, branded-search volume). Channels searched: G2, G4.
- **No community-building evidence** (Discord/Reddit size or engagement) from a primary; Reddit appears only via trade-press reporting of the Udio backlash. Channels searched: G1, G5.
- **No B2B/enterprise sales-motion evidence** for this category — how a game studio or ad agency actually buys generated music. **This is the most important gap for our specific product** and I name it as the top next action.
- **The RevenueCat report itself** and the **two 2026 GEO papers** were not opened; read status marked `[PARTIAL]`/`[ABS second-hand]` accordingly.

**Blind spot named for the parent:** growth data in this category is dominated by the interested party — the company raising money, the vendor selling detection, the agency selling GEO. The only genuinely disinterested measurements in this document are the a16z panel rankings and the KDD experiment. **Everything else should be read as testimony, not measurement.**

---

# 8. What this axis hands to the parent

1. **Enter as the API, not as a consumer song app.** The leader has no public API (dated 1 Jul 2026, verified), Udio's help centre says the same, and third-party wrappers are the only route — while the leader staffs growth with paid social and UGC, a game a solo founder cannot fund.
2. **Hard paywall from the first call; no meaningful free tier for extraction.** 10.7% vs 2.1% conversion, retention converging at 27–28% either way.
3. **Price per delivered artefact per stage**; never charge for rejections or failures.
4. **Do not build growth on "users publish to streaming".** That channel is >50% AI uploads at peak with 1–3% of streams and up to 85% fraud, actively demonetised.
5. **Do not buy GEO.** Write dense, numbers-first, well-structured, source-citing documentation because it is good documentation and the one peer-reviewed result mildly favours it; skip keyword stuffing and length padding, which are measured non-levers; treat AI-citation counts as diagnostics, never as revenue.
6. **Instrument what can be instrumented:** a fixed cross-assistant prompt set for share-of-voice, and GA4 AI-referrer segments.
7. **Validate B2B demand before building the outward surface** — the named top gap. The cheapest test is our own internal film/game pipeline as customer zero, which needs no acquisition channel and is the recurring workflow the churn data says is the retention predictor.
8. **Lean on category structure, not tactics:** music and voice have resisted bundling for three consecutive editions of an independent panel; the survivors won on opinionated depth and workflow, which is the same conclusion the customer-expectations axis reaches independently.

---

# 9. Completion audit for this axis

- Every CONTEXT-02 axis-6 angle addressed: acquisition channels **evidenced rather than assumed** ✔ (and where only assertion exists, it is labelled `[COMPANY-CLAIMED]`) · product-led loops and virality mechanics specific to generated music ✔ (share-vs-extract gating evidenced; contests/remix **explicit gap**) · retention and churn drivers in creative-tool subscriptions ✔ with hard numbers · SEO **and** discoverability inside LLM assistants ✔ (one peer-reviewed result plus its refutation; competitor SEO data an **explicit gap**) · community building ✔ as an explicit gap with channels named · **API-led and developer-led growth** ✔ — the axis' central finding · pricing and packaging as a growth lever ✔ · **what actually worked for the named competitors versus what they merely claim** ✔ — enforced by the tag on every number.
- Independent measurement sources: **3**. Peer-reviewed/formal research: **3** (1 `[FULL]`). First-party company primaries: **5**. Trade press citing named sources: **6**. Total distinct authoritative sources: **15**.
- No locator, price, date or figure written from memory; every one traced to a capture or a page opened this session.
- Read-back: reopened from disk after writing; line count and SHA-256 reported to the parent.

*Retrieved and written 2026-08-13. Every growth number carries its evidence class. The single most useful fact in this document is dated 1 July 2026 and may expire without notice: the leader is actively exploring the API we would ship.*

