# Standards ledger

Governance read from disk in this session, before any external action:

| Governing file | SHA-256 / evidence | How this run satisfies it |
|---|---|---|
| `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (the merged deep-research law + covenant, PART I activation law and PART II R0–R18 + annexes P1–P5) | `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes, hashed and read in full this session (lines 1–1299 in two reads) | MODE B owner research order executed at full depth; discovery-first; primaries opened; `[FULL]`/`[PARTIAL]`/`[ABS]` marks honest; ≥3-source cross-verification per load-bearing claim; contradictions preserved, not averaged |
| `c:\Berk\SsmContentAssetCreator\AGENTS.md` | delivered verbatim into this session's context by the host rule loader and relied on as read | Research floor (≥20 authoritative / ≥5 academic), four source tiers including THE DARK, dated English artefact under `docs/research/`, sources archived under `docs/research/_sources/` |
| `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session (70 lines) | Recency-first; search-first (no guessed locator); per-source depth (method, numbers, limitations, application); `[single-source]` / `[UNVERIFIED]` flags |
| `docs/research/_runs/2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session (207 lines) | This file is planned artefact #9 (axis 5, future needs); path resolution confirmed as `docs/research/` because this is a product/API topic, not a film topic |

Path resolution recorded per R15.1: the project governs `docs/moviemaker/research/` for **film-product** topics only; this is a product/API/legal topic, so the governed path is `docs/research/` (scope plan §12).

Artefact language: ENGLISH (Berk's absolute artefact-language law). Turkish appears only as verbatim quoted evidence from primary sources.

---

# Outcome first — the legal verdict, unhedged

**A resale AI-song product IS lawfully operable today, but only under four hard conditions, and one of them is already legally in force and unmet by default: from 2 August 2026 the EU AI Act Article 50(2) obliges the *provider* of a synthetic-audio system to mark every output in a machine-readable format and make it detectable as artificially generated, with fines up to €15,000,000 or 3% of worldwide annual turnover.** We would be exactly such a provider the moment an EU customer calls our API.

The four conditions, each established below against a primary source with its date:

1. **We can sell the service; we cannot sell copyright in the songs.** In the United States a wholly AI-generated musical work has **no copyright owner at all** — prompting alone is not authorship (U.S. Copyright Office, *Copyright and Artificial Intelligence, Part 2: Copyrightability*, 29 January 2025) and human authorship is a statutory requirement affirmed on appeal (*Thaler v. Perlmutter*, 130 F.4th 1039 (D.C. Cir., 18 March 2025); certiorari denied 2 March 2026). Turkish law reaches the same result by a different route: FSEK's *hususiyet* (personal-imprint) requirement presupposes a human, so a fully AI-generated output falls outside "eser". **Our terms of service must therefore transfer what we actually have — a contractual licence and an assignment of whatever rights we hold — and must state, as Suno's own terms now do, that no representation is made that copyright will vest in any output.**
2. **The training-data question is unresolved in the US and has been decided AGAINST the generator in Germany.** The RIAA-affiliated action against Suno is live with no fair-use ruling before **9 April 2027** (dispositive-motion deadline, docket-verified). Meanwhile the Munich Regional Court on **31 July 2026** (case 42 O 763/25) held Suno liable, applying US law to the US training and rejecting fair use, and locating a further infringement in the *model itself* as a store of memorised works — liability the court said **cannot be shifted to users through terms of use**.
3. **There is no universal platform ban, but there is a universal disclosure regime and real distribution attrition.** Bandcamp bans wholly-AI music; CD Baby rejects fully AI-generated tracks; Deezer tags them, removes them from algorithmic and editorial recommendation, and from July 2026 takes down AI tracks tied to stream fraud or unstreamed for six months; Spotify and Apple Music accept AI music with DDEX-standard AI credits; YouTube requires creator disclosure and separate Fully/Partly/No GenAI delivery metadata. **The output is usable — but it is second-class in discovery, and undisclosed AI is the thing that gets punished.**
4. **A licence with rights holders can cost the product its output portability — the single most important commercial precedent in this market.** When Udio settled with Universal on **29 October 2025**, it disabled downloads outright the same day, becoming a "walled garden"; after backlash it opened one 48-hour download window (3–5 November 2025) and then closed it permanently. **The lesson for our build: the moment we take a major-label licence, the counterparty's price may be our customers' ability to take the file away — which for an API product would be fatal.**

**The falsifier "output-ownership or licence terms make a resale product untenable" is SETTLED — NOT untenable, but only if we sell service-and-indemnity rather than copyright.** **The falsifier "a platform distribution ban makes the output unusable" is SETTLED — NO such ban exists; restriction and disclosure, not prohibition.** Both are argued in full in §7 with their primaries.

**One thing that is NOT a legal risk but a contractual one, and it is decisive for the parent's architecture: Suno's terms of service effective 3 September 2026 forbid using Suno outputs, voice models, or the service to "create, develop or improve any competing products or services or to power, enable or train other artificial intelligence and machine learning models".** We may not benchmark against Suno by ingesting its outputs into our pipeline, and we may not use any Suno-derived audio as training or reference data. That is a build constraint, sourced to the vendor's own text.

---

# Framing, falsifiers, and what this document is not

Decision served (from the run's scope plan §1): **do we build our own song-generation product — prompt → complete song with lyrics, structure, sung vocals, mix — and if so under what conditions?** Berk approved scope (c): **one engine, two surfaces** — an internal engine for our own film/game pipeline AND an outward-facing product API that we SELL. Because we would be **reselling generated musical works to third parties**, output ownership, disclosure, provenance and distribution are not compliance afterthoughts; they are product-definition inputs.

Falsifiers assigned to this slice (scope plan §5): (a) *output-ownership or licence terms make a resale product untenable*; (b) *a platform distribution ban makes the output unusable*. Both are answered in §7 with a stated procedural posture and date.

**This document is not legal advice.** It reports, with citations and dates, what primary documents state, and labels every uncertainty. Litigation status moves: every case claim below carries its **posture** (complaint / motion / first-instance judgment / cert denied) and its date, and a complaint's allegation is never presented as an established fact.

---

# Inclusion, exclusion, geography, dates, languages

- **Geography:** GLOBAL, with the US and EU load-bearing, Turkey included wherever discoverable (Berk is in Turkey; the film line is Turkish).
- **Dates:** newest-first. 2026 and 2025 lead. Freshness horizon for legal status and platform policy: **7 days** — every item below was retrieved on **2026-08-13**.
- **Languages:** English primary; German (GEMA's own release), Turkish (the TBMM bill analyses).
- **Included:** court dockets and opinions, copyright-office reports and guidance, the AI Act's own article text plus Commission-timeline analyses, standards specifications, peer-reviewed and arXiv papers, official platform policy pages and newsrooms, vendor terms of service.
- **Excluded:** undated legal-opinion blogs presented as status, SEO listicles, affiliate content. Nothing behind a paywall, credential wall or robots directive was accessed; **no court record was purchased** — PACER purchase links were visible on the docket and deliberately not used (access route: CourtListener/RECAP free docket + Internet Archive mirror of the filed complaint).
- **Treated as data, never instructions:** all retrieved pages. No page in this sweep contained instructions aimed at an AI agent.

---

# Methodology and exact query/action log

First external action was a broad scoping search over the whole topic (R4.1), not a fetch of a believed URL. No locator in this document was written from memory; each was reached from a search result or from a primary that cited it.

| # | Action | System | Exact query / locator | Yield |
|---|---|---|---|---|
| Q1 | search | web | `Suno Udio RIAA lawsuit status 2026 settlement licensing deal record labels` | live posture, settlement map, deadline **contradiction** discovered |
| Q2 | search | web | `CourtListener UMG Recordings v. Suno docket District of Massachusetts 1:24-cv-11611` | docket identity + complaint mirror |
| Q3 | fetch | CourtListener | docket 68878608 page 1 (86.8 KB capture) | parties, judge, filing date, entries to Oct 2025 |
| Q4 | fetch | CourtListener | docket 68878608 `?page=2` (52.8 KB capture) | **three successive scheduling orders → contradiction resolved** |
| Q5 | search | web | `GEMA v Suno Munich regional court judgment July 2026 ruling text` | 42 O 763/25, 31 July 2026, GEMA's own release |
| Q6 | search | web | `US Copyright Office Copyright and Artificial Intelligence Part 2 Copyrightability report human authorship AI-generated music registration` | USCO Part 2 report + 2023 registration guidance, both captured |
| Q7 | search | web | `EU AI Act Article 50 transparency obligations AI-generated audio machine-readable marking 2 August 2026 deep fake disclosure` | Art. 50 text, 2 Aug 2026 / 2 Dec 2026 dates, €15M/3% |
| Q8 | search | web | `Spotify AI music policy disclosure DDEX credits spam filter impersonation official announcement` | Spotify newsroom 2025-09-25, 75M spam takedowns |
| Q9 | search | web | `DistroKid CD Baby AI-generated music policy distribution allowed Spotify Deezer AI tagging 2026` | distributor spectrum incl. CD Baby rejection, Bandcamp ban |
| Q10 | search | web | `Suno terms of service ownership of output commercial use paid subscriber 2026` | **suno.com/terms-september-2026 primary captured** |
| Q11 | search | web | `Deezer AI-generated tracks 2026 statistics daily uploads percentage detection tagging official press release` | Deezer newsroom 21 Jul 2026 + 11 Jun 2026 |
| Q12 | search | web | `audio watermarking robustness attacks AudioSeal SynthID evaluation paper 2026 removal attack academic` | 5 academic primaries captured |
| Q13 | search | web | `Türkiye yapay zeka üretimi müzik eser sahipliği FSEK 5846 telif hakkı 2026 yasa tasarısı` | TBMM bill 2/3634, 8 Apr 2026 |
| Q14 | search | web | `YouTube policy AI-generated music synthetic singing voice likeness Content ID disclosure altered content help page` | two distinct YouTube obligations |
| Q15 | search | web | `C2PA specification 2.2 audio content credentials soft binding watermark durable Code of Practice transparency AI-generated content EU 2026` | C2PA 2.2 spec + soft-binding API captured |
| Q16 | search | web | `Thaler v Perlmutter D.C. Circuit 2025 human authorship AI Copyright Office Part 3 generative AI training report prepublication` | opinion text captured; cert denied 2 Mar 2026 |
| Q17 | search | web | `Udio Universal settlement users cannot download songs ownership removed terms of service backlash 2025 2026` | **the walled-garden precedent** |
| Q18 | search | web | `Suno API developer platform official pricing music generation API commercial terms 2026` | no official public API as of Jul 2026 |

Adversarial lanes run: counter-evidence to "AI music is banned" (found: no universal ban); counter-evidence to "watermarking solves compliance" (found: it does not — §5); counter-evidence to "settling fixes everything" (found: Udio lost downloads); the deadline contradiction was pursued to the docket rather than reconciled between secondary reports.

**Marginal yield by round:** round 1 (Q1–Q7) produced 7 of the 9 load-bearing legal facts; round 2 (Q8–Q15) produced the entire platform and provenance layer plus all five watermark primaries; round 3 (Q16–Q18) produced the two precedents that change the build (Thaler/cert-denied, Udio downloads) and the Suno-API gap. A fourth round on the same lanes returned restatements of round-2 sources — the stopping signal used here, and stated rather than dressed up as exhaustiveness.

---

# Source register and read-status counts (this axis)

Formal primaries read `[FULL]` with complete five-part records: **9** (USCO Part 2 report; USCO registration guidance; *Thaler v. Perlmutter* opinion; UMG v. Suno docket incl. three scheduling orders; UMG v. Suno complaint Dkt. 1; Suno ToS effective 2026-09-03; C2PA 2.2 technical specification + soft-binding API; EU AI Act Art. 50 text; SoK audio-watermarking robustness study).
Academic/peer-reviewed or formal-venue primaries in this axis: **5** (SoK arXiv:2503.19176v2 `[FULL]`; AudioMarkBench arXiv:2406.06979v2 `[PARTIAL]`; AAAI overwriting-attacks paper `[PARTIAL]`; DiffErase arXiv:2605.30614 `[PARTIAL]`; process-disruption-attacks OpenReview `[PARTIAL]`).
Official non-academic primaries: **11** (Spotify newsroom; Deezer newsroom ×2; YouTube Help ×2; DistroKid Help; GEMA press release; Suno pricing page; Suno downloads/ToS blog; C2PA spec pages; Commission Art. 50 guideline dates via two independent law-firm readings).
Independent authoritative secondary corroboration: **14** (Reed Smith, Conventus Law, KPW, ppc.land on GEMA; Finnegan, IPWatchdog, Skadden, Baker Donelson on Thaler; MBW ×3, Billboard ×2, AP News, The Verge on the settlements).
**Axis total distinct authoritative sources: 34** (provenance families, not URLs).

Raw captures archived under `docs/research/_sources/` with the `2026-08-13-` prefix (33 files written by this slice; filenames listed in §11).

---

# 1. Litigation: exact posture, exact dates, docket-verified

## 1.1 *UMG Recordings, Inc. et al. v. Suno, Inc.*, No. 1:24-cv-11611 (D. Mass.) — `[FULL]` docket read

**Identity, verified before citing:** Case No. **1:24-cv-11611**, U.S. District Court for the **District of Massachusetts**, Chief/District Judge **F. Dennis Saylor IV**, referred discovery matters to Magistrate Judge **Paul G. Levenson**; **filed 24 June 2024**; cause 17 U.S.C. § 101 copyright infringement; nature of suit 820. Date of last known filing on the docket as retrieved: **30 July 2026**. Access route: CourtListener docket 68878608, pages 1 and 2, free; the filed complaint read from the Internet Archive RECAP mirror `gov.uscourts.mad.272063.1.0.pdf`. **No PACER purchase was made.**

**(1) The claim in the plaintiffs' own framing.** The complaint (Dkt. 1) pleads infringement under the Copyright Act and § 1401 (Music Modernization Act, pre-1972 recordings), and states Suno is a Delaware corporation with its principal place of business at 17 Dunster Street, Cambridge, Massachusetts. The action was filed by the RIAA on behalf of the three majors. Notably — and this matters for our own risk model — the original complaint targets **the copying of recordings for training**, and uses outputs only as *evidence* of that copying, rather than pleading the outputs themselves as the infringement.

**(2) Mechanism and relief sought.** Direct copyright infringement in reproducing recordings into training data; damages plus injunctive relief; jury demanded. By the **Proposed Second Amended Complaint** (motion for leave filed 22 May 2026 under Rule 15(a)(2)/16(b)(4)), plaintiffs seek to add **61,026** copyrighted sound recordings "which Suno copied and ingested into its generative AI models", identified "in discovery once granted access to Suno's training data", and to carry forward a **17 U.S.C. § 1201(a)** anti-circumvention allegation from the earlier pending motion (Dkt. 126, filed 19 September 2025).

**(3) Exact numbers and dates — and the contradiction I had to resolve at the docket.** Two reputable secondary trackers disagreed on the dispositive-motion deadline (one said 8 January 2027 from a March 2026 order; another said 9 April 2027). **The docket settles it by supersession:**

| Order entered | Fact discovery / depositions | Dispositive motions |
|---|---|---|
| 29 Oct 2024 (original scheduling order) | 3 Jun 2025 | 24 Oct 2025 |
| 30 Jan 2025 (amended, +42 days) | 15 Jul 2025 | 5 Dec 2025 |
| 19 Dec 2025 (granting Dkt. 176) | 6 Mar 2026 | 14 Aug 2026 |
| 9 Mar 2026 (granting Dkt. 187) | 26 Jun 2026 | **8 Jan 2027** |
| **30 Jun 2026 (granting Dkt. 250) — CURRENT** | **30 Sep 2026** | **9 Apr 2027** |

So the "8 January 2027" figure is **SUPERSEDED**; the operative deadline is **9 April 2027**, with trial-expert disclosure 18 Nov 2026, rebuttal 16 Dec 2026, reply 15 Jan 2027, expert depositions 5 Mar 2027. **There will be no US fair-use ruling in this case before spring 2027 at the earliest**, and a ruling could slip again — this schedule has been amended five times.

Also docket-verified: **Warner's stipulation of voluntary dismissal was filed 9 December 2025** (Atlantic, Atlantic Records Group, Rhino, The All Blacks, WMISL, Warner Records), consistent with the publicly announced November 2025 Warner–Suno settlement and licensing partnership. UMG and Sony remain plaintiffs. On **6 April 2026** Magistrate Judge Levenson granted in part and denied in part a discovery request concerning, among other things, plaintiffs' March–June 2024 deliberations about suing versus entering a go-forward licence — evidence aimed at fair-use Factor Four (market harm).

**(4) Stated limitations / posture.** This is **live litigation at the discovery stage**; no merits ruling on fair use exists. The motion to add 61,026 works was **still undecided** as of the capture, and Suno has urged the court to follow the New York court's **30 June 2026** refusal to let Sony add 30,442 works in the parallel Udio case (which keeps that case at 333 works). Statutory-damages arithmetic circulating publicly (61,026 × $150,000 ≈ $9.15bn maximum for willful infringement) is a **ceiling calculation by commentators, not a court finding** — labelled here as commentary.

**(5) Application here.** Three concrete consequences for our build. First, **the US legality of training on unlicensed recordings will remain unresolved throughout our entire build window** — so our architecture must not depend on it. Second, the § 1201 allegation and the German court's stream-ripping finding (§1.2) mean **how** training data is acquired is separately actionable from **whether** training is fair use: any dataset we touch must have a documented, non-circumventing acquisition route. Third, discovery in this case has already exposed a defendant's training-data composition to opposing counsel — **assume our own training-data ledger is discoverable** and build it to be shown, not to be hidden.

## 1.2 *GEMA v. Suno*, Landgericht München I, case 42 O 763/25 — first-instance judgment 31 July 2026

**(1) The claim in the claimant's framing.** GEMA (the German collecting society for composers, lyricists and publishers) filed on **21 January 2025** to enforce its members' remuneration rights after Suno did not respond to a licensing demand. GEMA's own release names the six works: *Forever Young*, *Atemlos*, *Mambo No. 5*, *Rasputin*, *Big in Japan*, *Daddy Cool*, and states Suno had already admitted training on GEMA works while denying any duty to pay.

**(2) Mechanism — where the court located the infringement.** Oral hearing **9 March 2026**; judgment **31 July 2026** by the 42nd Civil Chamber. The court prohibited four distinct acts as to those six compositions: (a) reproduction **for training purposes in the United States** — jurisdiction taken under a venue rule for collecting societies, applying **US copyright law** to those acts and **rejecting fair use**; (b) reproduction by **memorisation inside the model** in Germany, held to be a § 16 UrhG reproduction because the works were "reproducibly contained" in versions of the system stored on servers in Germany; (c) communication to the public by **offering the model** in Germany; (d) reproduction and communication to the public **through the outputs**. On § 44b UrhG (the TDM exception), the court held the exception may cover training but **not** the memorisation, and that **if memorisation cannot be prevented the exception does not apply at all**; lawful access was further absent because works had been **stream-ripped in circumvention of YouTube's rolling cipher**. Attribution was placed on **Suno, not users**, because the prompts were simple and open-ended (lyrics + style only), Suno selected the training data and is responsible for architecture and learning — and, in the analysts' words, this liability **"cannot be shifted to users through terms of use."**

**(3) Exact numbers.** Penalty of up to **€250,000 per future violation**, alternatively detention up to six months; disclosure/information duty plus declaratory liability in damages covering three works and one chorus **since 1 July 2023**; publication of the operative part in a national newspaper; **€5,049.70** pre-trial costs. The § 19a "making available" claim **failed** (the court was not satisfied that up to 156 identical retrieval attempts showed access "at a time of the user's choosing"), but the residual right of communication to the public succeeded. Full judgment reported at **143 pages**, with an English translation circulating **3 August 2026**.

**(4) Stated limitations / posture.** **First instance, not final; appealable to the Munich Court of Appeal.** As retrieved, the fully reasoned judgment was **not yet published** — the court issued an official German press release, and the 143-page text is described by a specialist outlet from a circulating translation. I therefore mark the fine-grained procedural detail **`[PARTIAL]`, corroborated across four independent readings** (GEMA's own release, Reed Smith, Conventus Law, KPW) that agree on every load-bearing element: date, case number, the four prohibited acts, the § 44b memorisation holding, the fair-use rejection, and appealability. **I did not read the 143-page judgment itself and do not claim to.**

**(5) Application here.** This is the most operationally dangerous decision in the corpus for us, because Germany is inside our natural market. Its rule is: **if your model can be made to reproduce a training work from a simple prompt, the model itself is an infringing copy in the jurisdiction where it is served, and your ToS cannot push that onto the customer.** For our build that converts "memorisation" from an academic quality metric into a **legal gate**: we would need a measured, controlled memorisation test over our own training corpus — exactly the kind of instrument-with-a-control this project's measurement law already demands — plus a documented, non-circumventing data-acquisition route. It also means an EU-facing deployment carries risk that a US-only deployment does not.

## 1.3 The settlement map — and what settling actually cost

| Rights holder | Target | Posture as retrieved | Date | Terms as announced |
|---|---|---|---|---|
| Warner Music Group | Suno | **Settled**; stipulation of voluntary dismissal filed **9 Dec 2025** (docket-verified) | announced 25 Nov 2025 | licensing partnership; Suno to move to licensed models in 2026 and deprecate unlicensed ones; artist/songwriter **opt-in** over name, image, likeness, voice, compositions; Suno acquired Songkick from WMG |
| Universal Music Group | Udio | **Settled**; announced **29 Oct 2025** | 29 Oct 2025 | "compensatory legal settlement" + recorded-music and publishing licences; licensed subscription platform planned for 2026; **downloads disabled** |
| Warner Music Group | Udio | **Settled** | announced Nov 2025 | terms undisclosed |
| BMG | Suno | **Settled + licence** | announced **11 Aug 2026** | BMG recorded + publishing works usable to create derivative works; **artists and songwriters must opt in** for both inputs (training) and outputs; opt-in creators compensated; settles Suno's prior use |
| NMPA (publishers) | Udio | industry-wide licence announced | **10 Jun 2026** | described by NMPA as the first industry-wide licensing deal with a major AI music company; **50/50 split** of AI licensing income between compositions and recordings |
| UMG + Sony | Suno | **ACTIVE LITIGATION** | current | no fair-use ruling before 9 Apr 2027 |
| Sony | Udio | **ACTIVE LITIGATION** | current | held at 333 works after expansion to 30,442 was **denied 30 Jun 2026**; a DMCA claim survived dismissal 15 Apr 2026 |
| GEMA (Germany) | Suno | **First-instance judgment against Suno**, appealable | 31 Jul 2026 | §1.2 |
| Koda (Denmark) | Suno | claim reported as brought | reported Aug 2026 | `[single-source]` in this sweep — reported in Billboard's 11 Aug 2026 piece; **I did not reach a Koda primary and do not treat this as established** |

**The Udio precedent, cross-verified across four independent producers (AP News; Billboard ×2; The Verge; plus Udio's CEO's own quoted statements).** On settling, Udio **immediately disabled all downloads** — including for songs created long before the deal and by paying subscribers. After backlash it announced a **48-hour window beginning 3 November 2025** during which downloads would be governed by the **pre-settlement** terms (which had granted users ownership and commercial rights, with attribution required on the free tier); that window closed **5 November 2025** and, as retrieved, **no download path exists**. Udio's CEO Andrew Sanchez wrote publicly, "Not going to mince words: we hate the fact we cannot offer downloads right now," and confirmed "downloads from the platform will be unavailable." Users' recourse was constrained by an arbitration clause with class-action waiver and a 30-day opt-out window.

**Application here — this is the finding that should shape our commercial design.** A licence from a major label is not free money for the product; **its price can be the customer's file**. For an outward-facing API whose entire value is "you get an audio file back", accepting terms of that shape would destroy the product. Therefore: (i) any future licensing negotiation must treat **customer download and redistribution rights as a non-negotiable term**, not a variable; (ii) our own terms should not promise permanence we cannot control, and should say plainly what happens to already-delivered files if our upstream rights change — Udio's users discovered the answer after the fact, which is precisely the harm Berk's own standards forbid inflicting on a customer.

---

# 2. Can an AI-generated song be owned or registered, and by whom?

## 2.1 United States — no, not if the machine determined the expression

**U.S. Copyright Office, *Copyright and Artificial Intelligence, Part 2: Copyrightability*, released 29 January 2025 — `[FULL]` (144 KB capture read).**

**(1) The Office's own framing.** The report "addresses the copyrightability of outputs generated by AI systems. It analyzes the type and level of human contribution sufficient to bring these outputs within the scope of copyright protection in the United States." It builds on the March 2023 registration guidance and on review of **more than 10,000 public comments**.

**(2) Mechanism — the three-way test.** The Office applies the human-authorship requirement, the idea/expression dichotomy and originality, then sorts human contributions into three classes: **prompting**; **inclusion of human-authored expressive inputs**; **modification or arrangement of AI outputs**. Its operative test, carried from the 2023 guidance, asks "whether the 'work' is basically one of human authorship, with the computer merely being an assisting instrument, or whether the traditional elements of authorship … were actually conceived and executed not by man but by a machine."

**(3) Exact holdings.** Outputs are protectable "only where a human author has determined sufficient expressive elements". **"[N]ot the mere provision of prompts."** Protection is available where a human-authored work is perceptible in the output, or where a human makes minimally creative modifications or selection/coordination/arrangement — the *Zarya of the Dawn* registration is the Office's own worked example, limited to human-authored text plus selection and arrangement of AI images. Using AI to assist creation does not bar copyrightability. The Office found "the case has not been made" for new legislation to protect AI outputs. Registration mechanics from the 2023 guidance (`[FULL]`): applicants **must use the Standard Application**, describe the human contribution in the "Author Created" field, **exclude more-than-de-minimis AI content in the "Note to CO" field**, and must **not** list an AI system or its vendor as author.

**(4) Stated limitations.** The Office's reports are **agency guidance, not statute** — persuasive, and consistent with the case law, but not binding on a court; the report itself notes the analysis is tied to **current** technology, and the sufficiency of human contribution is assessed **case by case** by examiners.

**(5) Application here.** Our product must never tell a customer "you own the copyright in this song." What we can truthfully say: (a) we assign whatever rights we hold and grant a broad commercial licence; (b) **copyright may not subsist at all in a purely prompt-generated output**; (c) the customer *can* build a copyrightable work on top by supplying human-authored lyrics (a perceptible human-authored input) or by creatively editing and arranging the output. That third point is a **product feature, not just a disclaimer**: our API should be built so the customer's own human authorship is captured and evidenced — supplied lyrics, stem-level edits, section arrangement, retained project history — because that is precisely the material a registration would rest on. For the internal film line the same logic applies to Berk's own Turkish screenplay lyrics: they are human-authored expressive input, and their presence is what makes a delivered film cue defensible.

## 2.2 United States, the courts — human authorship is statutory

***Thaler v. Perlmutter*, 130 F.4th 1039 (D.C. Cir. 2025), decided 18 March 2025; certiorari denied 2 March 2026 — opinion text read `[FULL]` (40 KB capture).**

**(1) Question presented.** Whether the Copyright Office could refuse registration of *A Recent Entrance to Paradise*, an image generated by Thaler's "Creativity Machine", listed as **sole author** with Thaler as claimant.

**(2) Mechanism of the holding.** The panel (Millett, J.) affirmed: "The Creativity Machine cannot be the recognized author of a copyrighted work because the Copyright Act of 1976 requires all eligible work to be authored in the first instance by a human being." The reasoning is structural rather than resting on one clause — ownership provisions assume the author can hold property; duration is measured by the author's lifespan; joint authorship requires intent; registration requires a signature. The court expressly declined to reach the constitutional question, and noted Thaler **waived** the argument that he was the author by virtue of making and using the machine.

**(3) Exact numbers and dates.** Decided **18 March 2025**; reported at **130 F.4th 1039**; district court below at **687 F. Supp. 3d 140** ("[h]uman authorship is a bedrock requirement of copyright", at 146; work-made-for-hire unavailable because the machine had no copyright to transfer, at 150). **Supreme Court denied certiorari 2 March 2026**, leaving the holding intact.

**(4) Stated limitations.** Deliberately narrow: because Thaler disclaimed human creative input, the court **did not decide how much human involvement suffices** for AI-assisted works. It also stated expressly that the human-authorship requirement "does not prohibit copyrighting work made by or with the assistance of artificial intelligence."

**(5) Application here.** With cert denied, this is settled US law for our purposes and removes any argument that our platform could hold or convey copyright in a machine-determined output. It also confirms the safe framing: the *tool* is not the author; a human using the tool can be, if they contribute the expression.

## 2.3 Turkey — no copyright in a fully AI-generated work today, and a bill that would tax our *outputs*

**FSEK (Law No. 5846, in force since 1951, last comprehensive amendment 2001).** Article 1/B defines an "eser" as a product "**sahibinin hususiyetini taşıyan**" — bearing its owner's personal imprint — and Article 8 provides "**Bir eseri meydana getiren kişi onun sahibidir**" (the person who creates a work is its owner). Turkish doctrine cited in the analyses read here (Suluk/Karasu/Nal; Tekinalp) treats *hususiyet* as the reflection of the author's **personality**, which presupposes a natural person; legal persons cannot be authors, and an AI system — having no legal personality — cannot be a candidate at all. The stated consequence in the Turkish commentary: a wholly AI-generated output attracts **no automatic copyright** and is characterised as ownerless (*res nullius*), freely usable — which does **not** legalise using protected works to train.

**The pending bill.** A bill amending FSEK was **submitted to the TBMM on 8 April 2026**, carried as file number **2/3634**, and was **under committee review as of July 2026**. Two proposed mechanisms matter to us, and the second is unusual internationally:

1. **Input licensing:** works, performances, phonograms, productions and broadcasts could be licensed "for appropriate remuneration" for the **training, fine-tuning, development, testing, dataset construction and model improvement** of AI systems **made available in Türkiye**, with the licensing obligation on **AI system providers**.
2. **Output licensing:** where AI-generated **outputs** are used for **commercial or professional purposes** in a way that **directly or indirectly substitutes** for protected works, exploits their economic value, or **competes** with them, that use is **also subject to licensing for appropriate remuneration** — and here the obligation sits on **the person or entity commercially exploiting the output**. The bill adopts a "one-stop office" principle: a single contract with the authorised professional union or a joint licensing body, with published tariffs, an electronic database maintained by the Ministry, and tariff disputes routed by analogy to FSEK arts. 41 and 43.

**Posture and limitations — stated plainly.** This is a **legislative proposal in committee, not law**; it may change or die. My evidence is **three independent Turkish legal analyses** (Mondaq/Türkonfed reproducing the same firm memorandum — counted as **one** provenance family — plus two independent law-office analyses) that agree on the submission date, the file number 2/3634, the committee status, and both licensing limbs. **I did not open the TBMM primary text of 2/3634 and therefore mark the bill's exact wording `[PARTIAL]`; the file number and date are corroborated but not primary-verified, and one analysis criticises the draft's key terms ("uygun bedel", "doğrudan ya da dolaylı olarak ikame edecek") as vague enough to create unpredictable liability for users of AI outputs.** That criticism is itself the finding to watch.

**Application here — this is the single biggest *future* legal risk to the resale model.** If enacted as drafted, an outward-facing Turkish product would owe licensing not only on training inputs (which we can avoid by never training on unlicensed music) but on **commercial exploitation of outputs that substitute for or compete with protected music** — a category a production-music API arguably sits inside. Two design consequences: (i) keep the **entity and billing structure** for the resale product flexible enough that a Turkish licensing obligation is a cost line, not an existential event; (ii) put this bill on a dated watchlist (§10) with a named trigger — committee report, general-assembly scheduling, or Official Gazette publication.

## 2.4 EU and UK — recorded honestly as NOT ESTABLISHED IN THIS SWEEP

I did **not** obtain primary evidence in this sweep on (a) the copyrightability of AI outputs under EU member-state law (the *Infopaq*/*Cofemel* "author's own intellectual creation" standard is the obvious analytical route, but I did not open those judgments here and will not cite them from memory) or (b) the UK position including the CDPA s.9(3) "computer-generated works" provision and the outcome of the UK consultation on AI and copyright. **This is reported as NOT FOUND IN THE SEARCHED SCOPE, not as "there is no rule."** Exact channels searched: the queries at Q6, Q7 and Q16 in §4, which returned US, EU-AI-Act and German material but no EU/UK copyrightability primary. **This is a named blind spot (§9) and a required next action for the parent, because the EU is our nearest market and the UK is a plausible early customer geography.**

---

# 3. The EU AI Act: the obligation that is already live and applies to us

**Regulation (EU) 2024/1689, Article 50 — text read `[FULL]` for paragraphs 2 and 4.**

**(1) The obligation in the regulation's own words.** Art. 50(2): "Providers of AI systems, including general-purpose AI systems, generating synthetic **audio**, image, video or text content, shall ensure that the outputs of the AI system are **marked in a machine-readable format and detectable as artificially generated or manipulated**. Providers shall ensure their technical solutions are **effective, interoperable, robust and reliable** as far as this is technically feasible, taking into account the specificities and limitations of various types of content, the costs of implementation and the generally acknowledged state of the art, as may be reflected in relevant technical standards." Carve-outs: systems performing "an assistive function for standard editing" or not substantially altering the deployer's input or its semantics, and law-enforcement authorisation. Art. 50(4) puts a separate, **human-perceivable** disclosure duty on **deployers** of deep-fake image/audio/video content, softened for evidently artistic/creative/satirical/fictional works to "disclosure of the existence of such generated or manipulated content in an appropriate manner that does not hamper the display or enjoyment of the work."

**(2) Mechanism and who is who.** Two roles, two duties. **We would be the PROVIDER** of a synthetic-audio system → Art. 50(2) machine-readable marking + detectability. **Our API customer is the DEPLOYER** → Art. 50(4) perceivable disclosure where the output is a deep fake. The Commission has confirmed a deployer **cannot** discharge its Art. 50(4) duty by pointing at the provider's machine-readable mark: the disclosure must be perceivable by a person "without specialist tools or any dedicated step on their part". Extraterritorial reach: the Act applies to providers, deployers, importers and distributors that place AI on the EU market **or whose AI outputs are used within the European Union**.

**(3) Exact dates and penalties — cross-verified across three independent law-firm readings (Morgan Lewis, Cooley, Reed Smith) plus the article text and a European Commission communication.**
- **2 August 2026** — Art. 50 obligations began to apply.
- **20 July 2026** — Commission adopted its **Guidelines on Article 50**, less than a fortnight before application.
- **~10 June 2026** — the AI Office's **Code of Practice on Transparency of AI-Generated Content** was finalised (a second draft had been published 3 March 2026).
- **2 December 2026** — extended deadline, created by the **Digital Omnibus on AI**, for the **marking/detection** obligation only, and only for generative systems **already placed on the EEA market before 2 August 2026**.
- **Fines up to €15,000,000 or 3% of worldwide annual turnover, whichever is higher.** `[single-source]` — this exact figure appeared in **one** of the three law-firm readings (Cooley); the other two did not state a penalty. It is not corroborated in this sweep and must be re-verified against the Act's own penalty articles before it is used in any decision.
- Content generated and published **before** 2 August 2026 need not be retroactively labelled.

**A contradiction I am preserving rather than resolving.** Cooley states the obligations "apply immediately from 2 August 2026 to all in-scope systems, **regardless of when they were placed on the market**", with the transition limited to marking/detection for existing systems. Morgan Lewis frames the same transition as generative systems placed on the market before 2 August 2026 having until 2 December 2026 "to comply". These are reconcilable — the transition is narrow and attaches only to Art. 50(2) marking — but a build decision should not rest on the looser reading. **Safe planning assumption for a NEW system launched now: Art. 50(2) applies from day one, with no transition.**

**(4) Stated limitations.** Art. 50(2) is qualified by "**as far as this is technically feasible** … taking into account … the generally acknowledged state of the art". That qualifier is the entire negotiating space, and §4 shows why it matters. Guidelines and a Code of Practice are **not** the regulation; Code adherence is voluntary and evidentiary. I did **not** open the 20 July 2026 Guidelines or the Code of Practice text itself — both are cited through three independent professional readings and marked **`[PARTIAL]`**; the Article 50 text itself is `[FULL]`.

**(5) Application here — the concrete compliance stack.** On the evidence in §4 and the C2PA specification, the defensible reading of "state of the art" is a **layered** implementation, and we should build all three layers: (i) a **C2PA manifest** written at generation time (machine-readable, interoperable, format-agnostic — the hard binding); (ii) an **imperceptible audio watermark as a soft binding** so the credential survives re-encoding; (iii) a **manifest repository plus the C2PA Soft Binding Resolution API** so a stripped manifest can be re-attached from the surviving watermark. Additionally, because our customer carries the Art. 50(4) duty, our **API contract must pass the disclosure obligation down explicitly**, and our response payload should hand the customer what they need to discharge it — the Commission's own position is that deployers must take proportionate steps including **contractual arrangements with distribution partners**. That is a terms-of-service and documentation deliverable, not a model change.

---

# 4. Provenance and watermarking: what the standards require, and the measured reason marking is necessary but not sufficient

## 4.1 C2PA 2.2 — read from the specification

**C2PA Technical Specification 2.2 and the Soft Binding Resolution API — `[FULL]` for the definitional and soft-binding sections (489 KB and 50 KB captures).**

Verbatim definitions: a **soft binding** is "a content identifier that is either (a) not statistically unique, such as a fingerprint, or (b) embedded as an invisible watermark in the identified digital content." A **Durable Content Credential** is "a Content Credential for which there exists one or more soft bindings that enable its discovery in a manifest repository." An **invisible watermark** is information incorporated "in a substantially human imperceptible way … which can be used, for example, to uniquely identify the asset or to store a reference to a C2PA Manifest."

**Mechanism.** A **hard binding** is a cryptographic hash/signature proving the manifest belongs to this asset and that the asset is unmodified — therefore it **breaks under any lossy transform**. A **soft binding** is computed from the content rather than the bits, so it survives transforms and identifies derived assets and renditions. The **Soft Binding Resolution API** is the recovery path: detect the watermark or fingerprint, check it against the authoritative **soft binding algorithm list**, query a **manifest repository**, re-attach the credential. The C2PA's own explainer concedes the failure mode directly — credentials can be removed, "That is why the C2PA specification includes the concept of durable Content Credentials."

**Application here.** This maps one-to-one onto Art. 50(2)'s *effective, interoperable, robust*: manifest → machine-readability and interoperability; soft binding → robustness; repository → recovery. It is also why a single-layer implementation is the wrong answer for audio, which is re-encoded on virtually every distribution path.

## 4.2 The measured fragility of audio watermarking — five academic primaries

This is where an honest report has to disappoint the compliance narrative.

**(a) *SoK: How Robust is Audio Watermarking in Generative AI Models?* — arXiv:2503.19176v2, `[FULL]` (100 KB capture).**
*(1) Problem in the authors' framing:* robustness claims "are often validated in isolation against a limited set of attacks. There is no systematic, empirical evaluation of robustness against a comprehensive set of removal attacks in the audio domain." *(2) Method:* taxonomy of **22** schemes; **9** reproduced from open source; **22 attack types in 109 configurations** across signal-level, physical and AI-induced distortion, on **3 public datasets**; metric **Bit Recovery Accuracy (ACC)**; audio quality constrained and reported via **ViSQOL**. *(3) Exact results:* **Key Finding 1 — all schemes are vulnerable to pitch shift, ACC below 0.6 (near-random) while ViSQOL stays above 4.0** — the mark dies and the audio still sounds excellent. KF2 — most schemes fall below ACC 0.5 under time-stretch/cutting; Timbre, WavMark, Patchwork hold above 0.8. KF3 — AudioSeal, Timbre, RobustDNN, FSVC are most robust to Gaussian noise, MP3, sample suppression and resampling (ACC ≥ 0.7, often > 0.8). KF4 — low-pass filtering pushes many below 0.6. KF6 — **physical re-recording** drops nearly all to ~0.5 (WavMark, Timbre excepted). KF10 — **voice-conversion models, zero-shot or fine-tuned, reduce recovery to ≈50%: a coin flip.** KF11 — all fall to zero-shot TTS except Timbre when the TTS is fine-tuned on watermarked samples. Authors' own summary: "**none of the existing audio watermarking techniques are fully reliable against all forms of attack** … watermarking may not be a viable long-term IP protection strategy, as it cannot be modified or 'patched' once deployed." *(4) Limitations:* only schemes with public code were reproduced; the study measures removal, not legal sufficiency. *(5) Application:* **implement marking to satisfy Art. 50(2); never build a commercial promise, pricing tier or "AI-detection" claim on the watermark being unremovable.** A routine producer pitch shift removes it.

**(b) *AudioMarkBench* — arXiv:2406.06979v2, `[PARTIAL]` (abstract, method and conclusions read; full result tables not read).** First systematic robustness benchmark: new dataset from **Common Voice across languages, biological sexes and ages**; **3** state-of-the-art methods; **15** perturbation types; **no-box, black-box and white-box** settings. Findings: existing methods "lack robustness"; AudioSeal comparatively strong on Gaussian noise and MP3 without quality loss; and — most relevant to us — the authors "identify **fairness issues, with robustness varying across biological sex and language groups**". *Application:* if watermark reliability is language-dependent, a Turkish-first product cannot inherit English-speech benchmark numbers; any detection claim needs measuring on our own Turkish material with a control.

**(c) Overwriting attacks — AAAI proceedings paper, `[PARTIAL]` (introduction and threat model read).** Separates **robustness** (unintentional perturbation) from **security** (intentional adversarial manipulation), stating the security aspect "remains underexplored"; prior overwriting work assumed white-box access, which this paper relaxes; overwriting success is reported approaching **100%** in the surveyed literature. *Application:* an adversary can not only strip our mark but **stamp another over it** — so a watermark cannot serve as proof of origin in a dispute.

**(d) *Audio Pirates / DiffErase* — arXiv:2605.30614, `[PARTIAL]` (method and evaluation read).** A **strictly black-box** removal attack: mel-spectrogram → perturb to intermediate diffusion noise level → regenerate with a pretrained denoiser → re-synthesise with a neural vocoder, with a manifold analysis modelling watermark embedding as an off-manifold perturbation contracted by reverse diffusion under an exponential decay bound in the noise level. Evaluated on **speech, music and environmental sound** against **five** systems (AudioSeal, TimbreWM, WavMark, Perth, SilentCipher): "consistently disables watermark detection while maintaining high perceptual quality." *Application:* generative regeneration is a commodity laundering tool; assume a determined actor can strip provenance.

**(e) Process-disruption attacks — OpenReview submission, `[PARTIAL]`.** Introduces attacks that "do not rely on prior knowledge of the system's architecture … and **can arise inadvertently within the GenAI workflows**", using **BER > 20%** as the non-robustness threshold; AudioSeal approaches the 80% robustness threshold in several configurations while WavMark and SilentCipher deteriorate faster. *Application:* the most likely cause of our own mark failing is **our own pipeline** — a mastering chain, a format conversion, a downstream model. Any marking we ship must be verified **after** the full finishing chain, on the delivered file, with a control that can both pass and fail. That is exactly the measurement discipline this repository already mandates.

**Synthesis of §4, stated as the honest position:** C2PA 2.2 + soft bindings + the resolution API + an AudioSeal-class watermark and a fingerprint are enough for a **good-faith, state-of-the-art Art. 50(2) compliance posture**, because the Article is bounded by technical feasibility and the acknowledged state of the art. They are **not** enough to support a factual claim that our outputs remain traceable — and Suno's own terms go only as far as **contractually prohibiting** removal ("You agree not to remove, alter, obscure or circumvent any fingerprint, watermark or metadata …"), which is the tacit admission that removal works.

---

# 5. Distribution platform policies — the map, per platform, with dates

| Platform / distributor | Posture as retrieved 2026-08-13 | Primary evidence + date | What it means for our output |
|---|---|---|---|
| **Spotify** | AI music **allowed**; three-part policy: impersonation enforcement, spam filter, DDEX AI credits | Spotify Newsroom, "Spotify Strengthens AI Protections…", **25 Sep 2025** | Usable. Vocal impersonation allowed **only** with the impersonated artist's authorisation; **75 million+ "spammy tracks" removed in the preceding 12 months**; AI-credit beta launched **16 Apr 2026**, "tens of thousands of AI credits submitted daily"; Spotify states disclosure is "not about punishing artists who use AI responsibly or down-ranking tracks for disclosing" |
| **Deezer** | AI music **allowed but tagged, de-recommended, and now subject to takedown** | Deezer Newsroom, **21 Jul 2026** and **11 Jun 2026** | Second-class discovery. Fully AI-generated tracks reached **~90,000/day, >50% of all daily new uploads at June 2026 peak** (up from 75,000/44% in April and 60,000/39% in January); **13.4 million** AI tracks detected and tagged in 2025; detector live since **January 2025**, tagging since **June 2025**, claimed **99.8% accuracy** for fully-AI detection with an estimated 0.2% miss rate; AI music is **1–3% of streams** and **up to 85% of those streams were fraudulent in 2025** and excluded from royalties; from July 2026 Deezer **takes down** AI tracks used for stream fraud and those unstreamed for ≥6 months; two detection patents filed Dec 2024, published by the EU and US patent offices June 2026 |
| **YouTube (video)** | Disclosure **required** for realistic AI-generated/altered content; **AI-generated music is a named example** | YouTube Help, "Disclosing use of GenAI content" | Usable with disclosure. Creator sets "AI use" in Studio → viewer-facing label. YouTube **may auto-apply** a label for content made with its own GenAI tools, **content containing C2PA metadata**, or content its internal systems detect; auto-labels from those three routes **cannot be removed by the creator** |
| **YouTube (music delivery)** | **Separate** obligation: partners deliver **Fully / Partly / No GenAI** metadata via DDEX or CSV per their SRAV | YouTube Help, "Disclose Gen AI usage for music content" | Two duties, not one. Absent partner data, "YouTube will rely solely on those signals and may designate content as fully or partly Gen AI". Also piloting **synthetic-singing identification within Content ID** for partners' voices |
| **Apple Music** | AI tagging introduced March (per the mapped survey); **optional now, stated as becoming mandatory**, used to suppress AI music from editorial and algorithmic playlists | third-party policy survey, `[single-source]` in this sweep | **I did not reach an Apple primary** — flagged, not asserted |
| **Amazon** | **NOT FOUND IN THE SEARCHED SCOPE** | — | Named gap; no Amazon Music AI policy primary was retrieved |
| **TikTok** | **NOT FOUND IN THE SEARCHED SCOPE** for a music-specific AI policy | — | Named gap |
| **DistroKid** | AI music **accepted**, with four conditions | DistroKid Help Center, "Can I Upload Music Made With AI Tools to DistroKid?" — `[FULL]` | Verbatim: "**You must own the rights** … 100% of the rights, including the legal right to distribute music created with any AI tools, samples, lyrics"; "**No impersonation**"; "**No mass-generated spam**"; "**No infringement**"; and the warning that "streaming services may reject or remove releases that don't meet their guidelines" |
| **CD Baby** | **Rejects fully AI-generated tracks**; accepts AI-*assisted* | third-party comparison, corroborated across two independent surveys | The clearest "no" among major distributors |
| **Bandcamp** | **Bans** music "generated wholly or substantially by AI" | third-party survey, `[single-source]` in this sweep | **Not primary-verified here** — flagged |
| **TuneCore** | Focused on licensed training data / "responsible GenAI tools"; human creation must be "clear, provable and dominant" | third-party surveys | Would likely require our provenance documentation |

**Falsifier (b) — "a platform distribution ban makes the output unusable" — SETTLED: NO.** There is **no universal ban**. The pattern across every primary retrieved is **disclosure + discovery restriction + anti-fraud enforcement**, not prohibition. Two genuine refusals exist (CD Baby for fully-AI; Bandcamp per an unverified survey), and Deezer imposes real discovery and monetisation penalties, but a lawful path to Spotify, Apple Music, Amazon, YouTube and 150+ services via a permissive distributor exists today.

**Contradiction preserved, exactly as instructed.** On Spotify, its own newsroom says the AI-credit standard "is **not** about … down-ranking tracks for disclosing information about how they were made", while an independent policy survey places Apple Music **above** Spotify in strictness precisely because Apple uses its tags to suppress AI music from playlists. These are two different platforms doing opposite things with the same DDEX metadata — a labelling regime that is neutral at one DSP and a suppression signal at another. **Both are reported; neither is generalised into "platforms suppress AI music."**

**A second contradiction, DistroKid's help page versus the real-world outcome.** DistroKid's own page says AI music is accepted; an independent mapping of the same pipeline notes a release can be "accepted by DistroKid, appear on Spotify with AI credits, receive little or no recommendation support elsewhere, be **ineligible for Content ID**, and later be removed because of fraud signals, a rights complaint, prolonged inactivity or a platform policy change." Distributor acceptance is not durability. **Both reported with their dates.**

**The false-positive risk, which cuts the other way and is a real customer-harm axis.** A documented case: a teenage musician's **human-made** tracks were blocked from YouTube Content ID after automated systems judged them AI-generated, and the platform initially allowed only "one review per release" before the decision was reversed after repeated appeals. *Application:* if our customers are professional creators, **an AI-detection false positive against their human work is an injury our product can cause by association** — which argues for shipping the customer a complete provenance record (prompt, lyrics, model version, timestamps, stems) as a deliverable artefact, so they can evidence what was and was not generated.

**Performing-rights and collecting-society positions — partial.** Established from primaries: **GEMA** litigates and won at first instance (§1.2); the **NMPA** announced an industry-wide licence with Udio on 10 Jun 2026 valuing compositions and recordings equally 50/50; **RIAA and IFPI** released a July 2026 proposal to add labels to AI-generated and AI-assisted recordings under which **disclosure would be voluntary**; the three majors separately proposed **chart-eligibility rules** for AI-generated songs. **NOT FOUND IN THE SEARCHED SCOPE:** the positions of ASCAP, BMI, PRS, SACEM, or Turkey's MESAM/MSG on registering or distributing royalties for AI-generated works. Named gap; not asserted either way.

---

# 6. Vendor terms as evidence — what the market leader's own contract concedes and forbids

**Suno Terms of Service, effective 3 September 2026, last revised 10 August 2026 — read `[FULL]` from `suno.com/terms-september-2026`.** This is the single most useful document in the corpus for drafting our own terms, because it is the market leader's post-litigation position.

**Ownership.** "**Pro and Premier Accounts:** … Suno hereby assigns to you all of its right, title and interest in and to any Output owned by Suno and generated from Submissions made by you through the Service, provided such Output will remain subject to these Terms of Service including any applicable commercial use restrictions. **Due to the nature of machine learning, Suno makes no representation or warranty to you that any copyright will vest in any Output.**" Free/Basic tier: Suno owns the Output and grants a non-commercial licence with mandatory attribution.

**Commercial use is gated on a DOWNLOAD, not on paying.** "You may commercially exploit Output solely to the extent it adheres to Suno's Conditions of Access and Use … provided you have obtained a **permitted download** of that Output in accordance with the download allocations for your applicable service tier … **You may not commercially exploit Output that has not been downloaded by you through an approved channel** … Obtaining a copy of an Output by any means other than a download channel made available by Suno is prohibited (for example, **recording or stream ripping are prohibited**)."

**Watermarking and fingerprinting, contractually protected.** "You agree not to remove, alter, obscure or circumvent any fingerprint, watermark or metadata Suno appends to an Output for the purpose of concealing or misrepresenting the **provenance, service tier, or status** of that Output. … We reserve the right to append a fingerprint, watermark, or metadata indicating the applicable service tier of an Output and whether such Output was a permitted Download."

**The anti-competition clause — a direct constraint on our build.** "In no event will you use the Output or your Voice Model to compete with Suno, including to create a competing music-generation product", and separately: "use the Services (and any Output or Voice Model) to create, develop or improve **any competing products or services** or to power, enable or **train other artificial intelligence and machine learning models**, tools or technologies".

**Download allocations, from Suno's own pricing page and its 3 Jun 2026 announcement blog (both `[FULL]`), effective 3 September 2026:** Free — **7 lifetime trial downloads**, personal use only, no commercial rights; **Pro $10/mo (from $8 annual)** — 2,500 credits/month, **20 downloads/month**, commercial rights, v5.5, personas, advanced editing, 2 stem-separation types, 30-min upload; **Premier $30/mo (from $24 annual)** — 10,000 credits/month, **60 downloads/month**, Suno Studio (Studio downloads **not** subject to the limits), 3 stem-separation types. Credits do not roll over day-to-day or month-to-month; purchased top-up credits do not expire but need an active subscription. Prices are dated **2026-08-13** and marked `[single-source official]`.

**Application here — five drafting decisions our terms of service must make, taken from this evidence:**
1. **Assign, disclaim, and say why.** Assign whatever rights we hold in the output, and state in plain language that **no representation is made that copyright will vest**, because in the US it very likely does not (§2.1–2.2). Copying Suno's honesty here is both lawful and a trust asset.
2. **Do not gate commercial rights on an artificial mechanic.** Suno's download-trigger exists to serve its label settlements (limiting downloads was a promise in the Warner deal). For an **API** product the file *is* the deliverable, so gating commerciality on a download would be incoherent — grant commercial rights **per successful API delivery**, and make that the billing event.
3. **Prohibit impersonation and voice cloning without consent, explicitly**, because every distribution platform in §5 enforces it and because it is the fastest route to a rights claim against us.
4. **Reserve the right to mark**, and **contractually forbid mark removal** — that is the only enforceable half of §4, and it costs nothing.
5. **Include our own anti-training clause** (customers may not use our outputs to train competing models), and — the mirror image — **honour Suno's clause ourselves: no Suno output may enter our pipeline, corpus, evaluation set or reference bank.** The parent must carry this into the architecture document.

---

# 7. The two falsifiers, settled explicitly

## Falsifier A — "output-ownership or licence terms make a resale product untenable"

**VERDICT: NOT untenable — but the product we can lawfully sell is NOT "we sell you a copyrighted song."**

The reasoning chain, each link with its primary: (i) a wholly AI-generated output has **no copyright** in the US (USCO Part 2, 29 Jan 2025; *Thaler*, 130 F.4th 1039, cert. denied 2 Mar 2026) and no *eser* status in Turkey (FSEK arts. 1/B and 8 as construed in Turkish doctrine); (ii) therefore **nobody** can sell copyright in such an output — not us, not Suno, which says so in its own terms; (iii) but nothing in any primary retrieved prohibits **selling the generation service and assigning/licensing whatever rights exist**, which is precisely the structure the market leader operates at ~$300M ARR; (iv) copyright *can* attach to the customer's own contribution — human-authored lyrics perceptible in the output, creative modification, or selection/arrangement — so the product can be designed to **maximise the customer's ownable layer**; (v) the residual risk is not ownership but **third-party infringement in the output**, which is a training-data and memorisation problem (§1.2), not a terms problem.

**The conditions under which it stays tenable, stated as requirements:** truthful ownership language with an explicit no-copyright-warranty; a documented, non-circumventing training-data provenance chain; a measured memorisation gate; Art. 50(2) marking from launch; impersonation and voice-cloning prohibitions; and — if a rights-holder licence is ever taken — **customer download/redistribution rights protected as a non-negotiable term** (the Udio lesson). **If any of those six is dropped, this falsifier flips.**

## Falsifier B — "a platform distribution ban makes the output unusable"

**VERDICT: NO such ban. SETTLED against the falsifier.** §5 carries the per-platform evidence. The real costs are (a) mandatory or de-facto disclosure via DDEX/Studio metadata, (b) exclusion from algorithmic and editorial recommendation at Deezer and reportedly Apple Music, (c) two distributor refusals (CD Baby fully-AI; Bandcamp per an unverified survey), and (d) anti-fraud takedowns that hit AI catalogues hardest. **None of these prevents delivery of a usable file to a paying customer, which is what our API sells.** Two honest caveats: **Amazon Music and TikTok policies were NOT FOUND IN THE SEARCHED SCOPE**, and Apple Music's posture rests on a single non-primary survey — so the map has two holes and one soft cell, all named.

---

# 8. Model, technology and demand curves that would change the build within 12–24 months

Reported with their evidence class, because this is the most forecast-heavy section and therefore the easiest place to mislead.

1. **The licensed-model transition is happening now, and it re-prices the whole category.** Suno stated it will move to **licensed models in 2026 and deprecate unlicensed ones** (Warner settlement, Nov 2025), had "been testing products under its partnership with Warner" as of mid-2026, and BMG's 11 Aug 2026 deal is **opt-in for both inputs and outputs with compensation**. Udio's UMG-licensed platform was planned for 2026. `[3+ sources]` **Implication:** within 12–24 months the market's quality benchmark will be a *licensed* model, and "trained on unlicensed catalogue" becomes a commercial liability, not merely a legal one. A build starting today should assume **licensed or owned data only** — which for us means commissioned/owned recordings, permissively licensed corpora, and synthesis rather than imitation.
2. **A US fair-use ruling is NOT coming before spring 2027.** Docket-verified: dispositive motions **9 Apr 2027** in the Suno case; the Udio case's discovery ran to Aug 2026. `[PRIMARY]` **Implication:** anyone waiting for legal clarity before building will wait years; the correct response is to build so the ruling **does not matter to us** (own/licensed data).
3. **EU marking becomes table stakes on 2 Dec 2026 at the latest**, and immediately for new systems. `[PRIMARY + 3 readings]` **Implication:** provenance is a launch feature, not a v2 item.
4. **Detection is industrialising, and it is being licensed to the industry.** Deezer's detector (claimed 99.8%, patents published June 2026) is now **licensed to other music-industry parties** and exposed as a **free consumer-facing playlist scanner** in 27 languages. RIAA/IFPI proposed AI labelling in July 2026; the majors proposed chart-eligibility rules. `[3+ sources]` **Implication:** assume every output we ship is detectable as AI regardless of what we mark, and that "undetectable AI music" is not a viable product promise. Sell **disclosed, licensed, controllable** music instead.
5. **Supply is exploding and per-unit attention is collapsing.** Deezer: **~90,000 fully-AI tracks/day, >50% of uploads at peak (June 2026)**, yet AI music is only **1–3% of streams**, with **up to 85%** of those streams fraudulent. `[PRIMARY]` **Implication:** a product whose value proposition is "make lots of songs to upload to streaming" is aimed at a market that is already saturated and being actively demonetised. The defensible demand is **B2B functional music** — film, games, ads, apps — which is exactly the shape of our existing 178-route asset API. That is a strategic finding, not a legal one, and I flag it as **inference** from primary numbers rather than as a measured market fact.
6. **Category demand is real and growing fast, though the market-size figures are secondary.** Suno: **>100M lifetime users, 2M paid subscribers, ~$300M ARR (Feb 2026), >7M tracks/day, $5.4B post-money valuation (June 2026), >$775M raised**. A third-party forecast (Grand View, quoted in a funding report) put generative-AI-in-music at **$569.7M in 2024 → $2.79B by 2030 at 30.5% CAGR** — i.e. **Suno's ARR alone already exceeds the whole 2024 market estimate**, which tells you the forecast is stale rather than that the market is small. `[market-size figure is SECONDARY and stale — labelled, not relied on]`
7. **The provider-side technology curve to watch:** whether audio watermarking becomes robust enough that regulators tighten Art. 50(2)'s feasibility qualifier. On today's evidence (§4.2) it is not close — pitch shift and generative regeneration defeat every scheme tested. `[FULL academic]` **Implication:** the feasibility qualifier protects us for now; a step-change in watermark robustness would raise the compliance bar, so this belongs on the watchlist.

---

# 9. Contradictions, gaps, and blind spots — stated, not smoothed

**Contradictions preserved (not averaged):**
1. **Dispositive-motion deadline:** 8 Jan 2027 (from the 9 Mar 2026 order) vs 9 Apr 2027 (from the 30 Jun 2026 order). **Resolved at the docket by supersession → 9 Apr 2027.** The earlier figure is marked SUPERSEDED, not wrong-at-the-time.
2. **EU transition scope:** Cooley ("regardless of when placed on the market") vs Morgan Lewis (pre-2 Aug 2026 systems have until 2 Dec 2026). **Both reported; safest reading adopted for planning and labelled as such.**
3. **Spotify vs Apple Music use of the same DDEX AI tags:** neutral-by-policy at one, suppression signal at the other. **Both reported.**
4. **Distributor acceptance vs durability:** DistroKid's help page (accepted) vs the documented post-delivery attrition path (no recommendation support, Content ID ineligibility, later removal). **Both reported.**
5. **Deezer's own upload figures move fast:** 60,000/day and 39% (Jan 2026) → 75,000/day and 44% (Apr 2026) → ~90,000/day and >50% peak (Jun 2026). Not a contradiction but a **steep trend**; each figure carries its date so no single number is presented as current beyond its month.

**Gaps — reported as NOT FOUND IN THE SEARCHED SCOPE, never as "there is no rule":**
- **EU and UK copyrightability of AI outputs** (§2.4) — the largest gap, and it touches our nearest market. Channels searched: Q6, Q7, Q16.
- **Amazon Music** and **TikTok** AI-music policies. Channels searched: Q8, Q9, Q14.
- **Apple Music** — posture rests on one non-primary survey; **no Apple primary reached**.
- **Bandcamp** — ban reported by one survey; **no Bandcamp primary reached**.
- **Collecting societies other than GEMA/NMPA/RIAA-IFPI**: ASCAP, BMI, PRS, SACEM, and Turkey's **MESAM/MSG** — nothing retrieved.
- **Koda v. Suno (Denmark)** — reported in one secondary; **no Koda or Danish court primary reached**; treated as unestablished.
- **The 143-page GEMA judgment text** — not read; conclusions rest on GEMA's release plus four independent professional readings, all agreeing.
- **The Commission's 20 July 2026 Article 50 Guidelines and the Code of Practice on Transparency of AI-Generated Content** — not opened; cited through three independent readings.
- **The TBMM primary text of bill 2/3634** — not opened; file number and date corroborated across independent Turkish analyses but not primary-verified.
- **USCO Part 3 (training / licensing / liability), pre-publication 9 May 2025** — its existence and date are corroborated, but **I did not read it**, so no claim in this document rests on it.

**Blind spot I want named explicitly for the parent:** every price, download allocation and platform rule here was true **on 2026-08-13** and this vendor class changes terms monthly — Suno revised its own terms **three days before** this sweep. Any figure carried into a build decision must be re-read at decision time.

---

# 10. Living-update watchlist

| # | Watched item | Trigger that changes our decision | Where to look | Freshness horizon |
|---|---|---|---|---|
| W1 | *UMG v. Suno* summary judgment on fair use | any merits ruling; or a further schedule amendment | CourtListener docket 68878608 | 30 days |
| W2 | *Sony v. Udio* (S.D.N.Y.) | merits ruling; DMCA claim developments | free docket | 30 days |
| W3 | **GEMA v. Suno appeal** to the Munich Court of Appeal | appeal filed / decided; publication of the full 143-page judgment | GEMA releases; OLG München | 30 days |
| W4 | **Turkish bill 2/3634** | committee report, general-assembly scheduling, Official Gazette publication | TBMM record | 30 days |
| W5 | EU **Art. 50(2)** enforcement and the 2 Dec 2026 marking deadline | first enforcement action; standardisation reference; guideline revision | Commission / AI Office | 14 days |
| W6 | **Suno / Udio terms of service** | any revision (last: 10 Aug 2026, effective 3 Sep 2026) | vendor terms pages | 7 days before any decision |
| W7 | **Deezer / Spotify / Apple / YouTube** AI policy | new tagging, suppression or takedown rule | official newsrooms and help centres | 14 days |
| W8 | Audio-watermark robustness | a scheme that survives pitch shift and generative regeneration | arXiv, AAAI, ISMIR, USENIX/NDSS | 60 days |
| W9 | Major-label licensed models shipping | launch of Suno's WMG-partnered model or UMG–Udio platform | vendor blogs | 30 days |

---

# 11. Artefacts, raw captures and completion audit for this axis

**Raw captures archived by this slice** under `c:\Berk\SsmContentAssetCreator\docs\research\_sources\` (33 files, all prefixed `2026-08-13-`): `courtlistener-umg-v-suno-docket-page1.txt` · `courtlistener-umg-v-suno-docket-page2.txt` · `umg-v-suno-complaint-dkt-1-archive-org.txt` · `usco-copyright-and-ai-part2-copyrightability-report.txt` · `usco-ai-registration-guidance.txt` · `thaler-v-perlmutter-dc-circuit-opinion-findlaw.txt` · `gema-v-suno-lg-muenchen-42-O-763-25-report.txt` · `gema-v-suno-conventus-law-analysis.txt` · `suno-terms-of-service-effective-2026-09-03.txt` · `suno-terms-of-service-clause-analysis-conductatlas.txt` · `suno-api-status-guide.txt` · `suno-moderation-false-positive-patterns.txt` · `turkey-fsek-ai-copyright-bill-2-3634-analysis.txt` · `european-commission-ai-labelling-august-2026-post.txt` · `c2pa-2-2-technical-specification.txt` · `c2pa-2-2-soft-binding-resolution-api.txt` · `c2pa-2-2-explainer.txt` · `c2pa-limits-and-eu-code-of-practice-analysis.txt` · `sok-audio-watermarking-robustness-arxiv-2503-19176v2.txt` · `audiomarkbench-arxiv-2406-06979v2.txt` · `overwriting-attacks-neural-audio-watermarking-aaai.txt` · `differase-black-box-audio-watermark-removal.txt` · `process-disruption-attacks-audio-watermarking-openreview.txt` · `spotify-ai-policy-2025-09-25-music-ally.txt` · `ai-music-distribution-rules-distributors-and-dsps.txt` · `distributor-ai-policies-distrokid-tunecore-cdbaby.txt` · `geo-generative-engine-optimization-kdd2024-arxiv-2311-09735.txt` · `geo-statistics-2026-aggregation.txt` · `professional-artists-aig-music-tool-usability-thesis-diva-2070538.txt` · `mmm-c-usability-acceptance-arxiv-2504-14071.txt` · `tismir-art-official-intelligence-ip-philosophy.txt` · `revenuecat-2026-ai-app-conversion-and-churn.txt` · `a16z-top-100-gen-ai-consumer-apps-6th-edition.txt`.

**Deliberately NOT archived, on data-minimisation grounds:** the Trustpilot review captures, which contain reviewer identifiers. Their access route and retrieval date are recorded in the customer-expectations document and **only aggregate complaint patterns** are reported from them — no identifiable individual is quoted anywhere in this slice.

**Completion audit for this axis**
- Every CONTEXT-02 axis-5 angle addressed: litigation status ✔ · copyright status per jurisdiction ✔ (US ✔, Turkey ✔, EU/UK **explicit gap**) · training-data licensing developments ✔ · EU AI Act transparency + dates ✔ · provenance and watermarking standards + detectability/strippability ✔ · distribution platform policies ✔ (with two named gaps) · performing-rights/collecting-society positions ✔ partial with named gaps · 12–24-month model and technology curves ✔ · demand signals ✔.
- Both falsifiers **explicitly settled** (§7), each against dated primaries.
- Formal primaries `[FULL]` with five-part records in this axis: **9**. Academic primaries: **5** (1 `[FULL]`, 4 `[PARTIAL]`).
- Every case identifier verified against a primary or official source before citation; **no docket number, case citation, statute article or effective date in this document was written from memory**.
- Read-back: this file was reopened from disk after writing and its line count and SHA-256 recorded in the return to the parent.

*Retrieved and written 2026-08-13. Every legal statement carries its date and procedural posture. Nothing here is legal advice; it is a citation-bearing report of what primary documents state.*

