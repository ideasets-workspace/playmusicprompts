# Standards ledger

Governance read from disk this session (2026-08-13), before any external action:
`C:\Users\berke\.claude\skills\deep-research\SKILL.md` **IN FULL** — 117,261 B, sha256
`35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, hashed and found byte-identical
across all four installs (`.claude`, `.cursor`, `.codex`, `.agents`) · `AGENTS.md` · `CLAUDE.md` ·
`.cursor/rules/movie-maker-unit-mandate.mdc` · `.cursor/rules/berk-research.mdc` ·
`.claude/memory/{BOOT,STATE,MEMORY,DECISIONS,infra}.md` · `docs/ssm-content-asset-generation-api_v5.md`.

| Governing standard | How this run satisfied it | Status |
|---|---|---|
| R0.2 frontier trigger (`en ileri seviyede`) | all six R14 axes executed, one dated file per axis | met |
| R2 preflight before the first external call | `_runs/…preflight.json` — 23 files hashed from disk, all `read_back: true`, plus recorded code- and document-absence searches | met |
| R3 scope gate before browsing | `_runs/…scope-plan.md`, 13 clauses, written and APPROVED by Berk before dispatch | met |
| R11 floor ≥20 authoritative / ≥5 academic `[FULL]` | reported per slice: 25 + 46 + 67 + 65 authoritative; 12 academic-`[FULL]` in the SOTA slice alone | met (relayed counts, see the register's honest limits) |
| R12 delegation carries the covenant + CONTEXT-01…18 | four briefs, each naming the covenant file and its SHA-256, all eighteen labels non-empty | met |
| R12.5 concurrency | four workers dispatched in PARALLEL; the old ≤1–2 ceiling is `SUPERSEDED/DEAD` per R18.7 | met |
| R14.4 competitor closing block | all four competitor files end with the mandatory ALL-CAPS block — verified by reading `[-1]` of each file | met |
| R15.1/R18.4 path resolution | product/API topic → `docs/research/`; `docs/moviemaker/research/` is the FILM convention and deliberately unused | met |
| R16.2 application | five changes already made in the repo, listed in the architecture document's change ledger | met |
| R17 completion manifest | `_runs/2026-08-13-ai-song-generation-platform.json` | see it |
| Berk's artefact-language law | every artefact ENGLISH; his words quoted verbatim as evidence only | met |
| Spend | **$0.00** external spend on this run; every capability probe is held for his approval | met |

# Scope plan

Reproduced in full at `docs/research/_runs/2026-08-13-ai-song-generation-platform.scope-plan.md`
(13 clauses: decision, why, project context, subquestions, falsifiers, inclusion/exclusion,
verticals with their justifying quotes, geography GLOBAL, temporal scope, candidate universes,
the 14-artefact tree, hard-law check, completion semantics). It was written and approved BEFORE the
first external call, per MANDATE CLAUSE 29 over the research law's immediacy clause — the conflict
itself is recorded as **D-SSM-13**.

# Outcome first

**BUILD — the control-and-measurement layer on adopted generation. Not a Suno clone.**

Four facts decide it, and only one is technical:

1. **The leader's capability cannot be bought at any price.** Suno has no API and its terms
   (effective 2026-09-03) forbid resale, granting access and scraping — read at the primary
   (capture L129, L85). Udio charges $8–$30/month and has disabled downloads.
2. **A full song with vocals IS buyable with resale rights, on substrates we already own** — Vertex
   `lyria-3-pro-preview` ≈$0.08/song and fal/ACE-Step ≈$0.024 per 2 min (already wired as
   `music_ace/`). No new vendor approval needed for either.
3. **The unmet need is CONTROL, not fidelity.** 97 % of listeners cannot hear the difference; among
   professionals only **13 %** generate whole songs, and controllability measures **5.23/10 achieved
   vs 9.54/10 desired**. Meanwhile **no vendor exposes by API**: a weirdness slider (Suno has one in
   its own UI and gives it to nobody), style-influence as a number, a persona/singer handle, an
   enforced key/BPM lock, settable lyric timing, stems from the generation call, or any per-generation
   quality score.
4. **We can measure the one thing that matters and nobody publishes.** Lyric intelligibility is the
   weakest axis of every open system (PER 7.2–37.1 % under a single protocol) and ASR-based error rate
   is the only objective metric measured to track perception. Our product can return that number with
   its protocol.

The committed architecture, per stage, is in
`docs/research/2026-08-13-ai-song-generation-architecture-on-our-own-layers.md`.

**AVOID:** Suno (no API, resale forbidden, and **D-SSM-14** bans its output from our corpus entirely) ·
Udio (cannot export) · every third-party "Suno API" reseller · GTSinger as training data
(**CC BY-NC-SA 4.0**, "noncommercially used", read at the NeurIPS paper L523 — and Turkish is not
among its nine languages).

# Framing and falsifiers — each settled against a dated primary

| Falsifier from the scope plan | Verdict | Evidence |
|---|---|---|
| No lawful provider offers API-accessible singing with commercial rights | **REFUTED** — Vertex Lyria 3 and fal/ACE-Step both do | API axis, vendor primaries |
| Output-ownership/licence terms make a resale product untenable | **REFUTED for our substrates, CONFIRMED for Suno** | Suno ToS L129 [PRIMARY] |
| Measured cost per song exceeds a sellable price | **REFUTED** — $0.024–$0.08 generation vs $0.125–$0.30 retail for licensed tracks | API + competitor axes |
| A platform distribution ban makes output unusable | **REFUTED** — restriction and disclosure, not prohibition (Deezer tags/removes; CD Baby rejects fully-AI) | future-needs axis |
| **Turkish sung vocals unavailable** | **NOT REFUTED — this is the open risk** | Google documents 8 vocal languages, Turkish absent, zero matches in its own guide [PRIMARY]; sung Turkish entirely unmeasured in the literature |

# Findings by axis — where each lives

| Axis | Document | Headline |
|---|---|---|
| 1 competitors — pricing | `competitors/2026-08-13-ai-song-generation-pricing.md` | plan-by-plan, credit-by-credit, with observation dates |
| 1 competitors — functions | `…-functions-and-services.md` | the advanced-control matrix and the controls NOBODY exposes |
| 1 competitors — business model | `…-business-model.md` | every vendor grants contractual permission and disclaims copyright |
| 1 competitors — UI and menus | `…-ui-and-menus.md` | reconstructed from vendors' own written click paths — **no interface was ever seen; every visual claim is UNVERIFIED** |
| 2 science / SOTA | `sota/2026-08-13-ai-song-generation.md` | PER is the only perception-tracking metric; the floor is not zero (16.14 % on ground truth); long-form structure, expressiveness and singer identity have NO instrument |
| 3 APIs | `apis/2026-08-13-ai-song-generation.md` | per-stage verdicts, 8 stages, with contracts and prices |
| 4 user expectations | `customer-expectations/2026-08-13-ai-song-generation.md` | professionals reject autonomy, not AI |
| 5 future needs / law | `future-needs/2026-08-13-ai-song-generation.md` | Article 50(2) live since 2026-08-02; no US copyright; Munich judgment |
| 6 growth | `growth/2026-08-13-ai-song-generation.md` | hard paywall, per-delivery pricing, API as the open door |
| parent — architecture | `2026-08-13-ai-song-generation-architecture-on-our-own-layers.md` | the committed design, stage by stage |
| parent — source register | `2026-08-13-ai-song-generation-source-register.md` | 172 captures, 15,441,195 B, hashed, with citation-coverage measured |

# Contradictions preserved, not averaged

1. **Lyria 3 lyrics: "documented" vs "no request field".** Both slices were half right. There is NO
   dedicated `lyrics` request parameter; lyrics ride INSIDE the prompt text via Google's documented
   `Lyrics:` convention (prompt guide L1023, L1008 — read by the parent). A convention has no schema
   and returns no error when ignored, so only a generation settles it.
2. **PER values differ between our own slices** — competitor axis *Suno 0.28 / Mureka 0.09 /
   DiffRhythm 0.13* vs SOTA axis *Suno 21.6 % / Mureka 7.2 % / DiffRhythm 18.02 % (mix), 12.3 %
   (stem)*. Different protocols and tables. Also found by the parent: LeVo 2's repository reports
   **PER 8.55 %** (capture L36), a different system from "LeVo 7.2 %". **Consequence: a PER number
   without its protocol is meaningless, and our gate must publish its protocol.**
3. **EU transition vehicle** — one source attributes the 2026-12-02 backstop to Article 111(4) as
   amended, another to a May 2026 "AI Omnibus" agreement. Unresolved; likely moot for anything we
   place on the market now.
4. Preserved by the axis documents themselves: UTMOS good vs poor (system- vs utterance-level),
   ACE-Step Apache-2.0 vs MIT `VERSION-CONFLICT`, Spotify neutral vs Apple suppressive on identical
   DDEX tags, Turkish TTS quality "accurate" vs "ş/ç problematic", 4.9/5 app rating vs negative
   Trustpilot.

# Known gaps and blind spots — stated, not smoothed

- **EU and UK copyrightability: NOT FOUND IN THE SEARCHED SCOPE.** Our nearest market. The largest
  legal hole in this run.
- **Sung Turkish is entirely unmeasured** — no Turkish SVS system, no score-annotated Turkish singing
  corpus.
- **Saturation NOT reached on the science axis** (rounds 18–20 still yielded load-bearing work).
- **7 repository licences unread** (`UNVERIFIED-LICENCE`) — which directly gates any self-host path.
- **No CN/JP/KR-language search lane** in the competitor or science axes → ByteDance and Alibaba are a
  real blind spot despite the brief authorising those languages.
- **No interface was ever seen** — every visual claim in the UI document is UNVERIFIED.
- Never opened: the 143-page Munich judgment, the Commission Guidelines PDF, the Code of Practice,
  Stability's own pricing page, the Eleven Music Model-Specific Terms, USCO Part 3.
- **NO CAPABILITY PROBE WAS RUN.** Nothing in this run is evidence about our own stack beyond the
  measurements already in `infra.md`.
- **78 captures (of 172) are cited nowhere by filename** — a traceability weakness of this run,
  measured and reported in the source register.

# Committed recommendation

**BUILD the control-and-measurement layer; ADOPT generation.** The product claim is: *the only song
API that tells you, per song, whether the words came out — with a number and its protocol* — plus the
advanced controls the leaders keep behind their own UI.

**Four prerequisites before a line is written**, in order:
1. The **≈$0.08 Lyria-3 Turkish lyric probe** (needs Berk's spend approval) — settles both open
   capability questions at once.
2. A **provenance instrument** — open a delivered file and report whether a manifest survives our own
   processing. **[MEASURED] zero of our 24 audio workers mark anything today.**
3. The **gate's calibration set** — labelled Turkish material: human recording (must pass),
   instrumental (must yield no words), deliberately wrong lyric (must fail).
4. **Legal answers only he can obtain:** EU/UK copyrightability; whether an AWS endpoint called by an
   EU customer makes us an Article 50 provider; the terms-of-service language for selling generation
   without warranting copyright.

# Artifact index and produced-vs-planned count

Planned in the scope plan: **14**. Produced: **14** (this file is #10 of the list; the R17 manifest is
#14). Machine-counted in the completion manifest, not asserted here.

# Living-update watchlist

Suno's partner API (intake open, no timeline) · Udio's export policy after the UMG settlement ·
Lyria 3 language list (Turkish absent today) · the EU Code of Practice on Transparency of AI-generated
Content · the Munich appeal · the US docket (dispositive motions 2027-04-09 per the 2026-06-30 order,
relayed) · ACE-Step and LeVo licence and weight terms.
