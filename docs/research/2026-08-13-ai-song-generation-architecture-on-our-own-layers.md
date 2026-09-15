# Standards ledger

Governance read from disk in the session that produced this document (2026-08-13):
`C:\Users\berke\.claude\skills\deep-research\SKILL.md` IN FULL (117,261 B, sha256
`35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, byte-identical across four
installs) · `AGENTS.md` · `CLAUDE.md` · `.cursor/rules/movie-maker-unit-mandate.mdc` ·
`.cursor/rules/berk-research.mdc` · `.claude/memory/{BOOT,STATE,MEMORY,DECISIONS,infra}.md` ·
`docs/ssm-content-asset-generation-api_v5.md`.
Path resolution per R15.1/R18.4: this is a PRODUCT/API topic, so the governed research root is
`docs/research/` with `docs/README.md` as its index; `docs/moviemaker/research/` is this project's
FILM-product convention and is deliberately not used here.
Artefact language: ENGLISH. Berk's Turkish appears only as verbatim quoted evidence.

# Song-generation engine — the architecture on our own layers, and what each stage costs us

Decision served: **do we build our own song-generation product (prompt → a complete song with lyrics,
structure, sung vocals and a mix), and with which architecture — or do we not build it?**
Owner order: *"peki biz suno gibi bu müzik ve ses layer ı kullanarak en ileri sveiyed ekendi müzik
üretim api mizi yapamaz mıyız ? araştırır mısın"* → scope approved: *"evet ve suno daki gibi en
advanced settimngs ayarlar melodiler vs. vs."* = **(c) one engine, two surfaces** (internal
film/game engine AND an outward-facing product API).

Evidence base: the four axis documents of run `2026-08-13-ai-song-generation-platform` (competitors ×4,
sota, apis, customer-expectations, future-needs, growth) plus this repo's own measurements. Every
claim below is marked with its evidence class: **[MEASURED HERE]** (this repo, this session, with the
command), **[PRIMARY]** (I opened the vendor/paper page myself), **[RELAYED]** (an axis worker's
evidence, not re-verified by me), **[OPEN]** (not established).

---

# Outcome first

**BUILD — but not a Suno clone, and not on the axis Suno competes on.**

Three findings decide it, and none of them is about audio quality:

1. **The leader's capability is not purchasable at any price.** Suno has no API (only an "exploring,
   curated partners" intake, 2026-07-01) and its terms effective 2026-09-03 forbid resale, granting
   access and scraping [PRIMARY: ToS capture L129, L85]. Udio charges $8–$30/month and has disabled
   downloads entirely [RELAYED]. So there is no buy option for the finished product — the only routes
   are assemble-it or don't have it.
2. **A full song with vocals IS buyable with resale rights on substrates we already own.** Vertex
   `lyria-3-pro-preview` ≈$0.08/song and fal/ACE-Step ≈$0.024 per 2 minutes, the latter already wired
   here as `music_ace/` [RELAYED prices]. Neither needs a new vendor approval.
3. **The market's unmet need is CONTROL, not fidelity.** 97 % of listeners cannot hear the difference;
   professionals reject autonomy rather than AI — only **13 %** generate whole songs, and
   controllability measures **5.23/10 achieved against 9.54/10 desired** [RELAYED]. Meanwhile **no
   vendor anywhere exposes by API**: a weirdness slider (Suno has one in its own UI and gives it to
   nobody), style-influence as a number, a persona/singer handle (only Mureka's `vocal_id`), an
   enforced key/BPM/time-signature lock, **settable** lyric timing (all return timestamps, none accept
   them), stems from the generation call, MIDI, or any published per-generation quality score
   [RELAYED, from first-party surfaces].

That third point is the product. **The differentiator is a controllable, measurable, API-first song
engine** — exactly what he asked for with *"en advanced settimngs ayarlar melodiler"* — not a better
autonomous generator.

**And two hard boundaries that shape everything below:**

- **We cannot sell copyright.** A wholly AI-generated song has no US copyright: USCO Part 2 —
  *"prompts alone do not provide sufficient human control to make users of an AI system the authors of
  the output"* [PRIMARY: capture L632]; *Thaler v. Perlmutter* — the Copyright Act *"requires all
  eligible work to be authored in the first instance by a human being"* [PRIMARY: capture L23]. The
  product sells GENERATION and DELIVERY. **EU/UK copyrightability is [OPEN] — NOT FOUND in the
  searched scope, and it is our nearest market.**
- **Machine-readable provenance marking is a day-one requirement, not a feature.** EU AI Act Article
  50(2) has applied since **2 August 2026** and binds the PROVIDER [PRIMARY: European Commission's own
  page, *"Article 50 of the AI Act applies from 2 August 2026"*, archived this session]. **[MEASURED
  HERE] ZERO of our 24 audio workers apply any marking today** (searched every
  `(music|voice|sfx|audio|stt)_*/*.py` for `c2pa|synthid|watermark|sign_with`; the pattern was
  control-proven against the API research document in the same command). Recorded as **D-SSM-15**.

---

# The pipeline, stage by stage, with a decision and its basis

| # | Stage | Decision | Route | Basis |
|---|---|---|---|---|
| 1 | **Lyrics** (text, structure, syllable-aware) | **BUILD** | Our own Gemini on Vertex — already wired, no new vendor | ElevenLabs' Music terms forbid artist/song/label names and substantial real lyrics as inputs [RELAYED]; we need Turkish prosody control anyway |
| 2 | **Song with sung vocals** | **ADOPT + measure** | `lyria-3-pro-preview` (≈$0.08) as primary; fal/ACE-Step (≈$0.024) as the second arm and the self-host hedge (Apache-2.0 upstream) | The only lawful routes with resale rights [RELAYED]; both pre-approved substrates |
| 3 | **Standalone singing synthesis** (lyrics+melody → an isolated vocal) | **DEFER, and say why** | none | **NOT FOUND IN THE SEARCHED SCOPE as a hosted API** — the market folded it into stage 2 [RELAYED]. Open-weight exists (DiffSinger, NNSVS, Amphion) but needs a phoneme/score front-end **per language** and **no paper evaluates Turkish** [RELAYED] |
| 4 | **Melody / audio prompting** (hum or clip as the seed) | **ADOPT** | ACE-Step `edit_mode:"lyrics"`; ElevenLabs `conditioning_ref` + `condition_strength`; MiniMax's wired route *requires* a reference containing vocals | The controls exist and are documented [RELAYED]; this is the direct answer to *"melodiler"* |
| 5 | **Stems / separation** | **ADOPT** | BS-RoFormer class (11.99 dB SDR) [RELAYED] | Needed for the gate (isolate the vocal before ASR) AND as a product feature no generation API exposes |
| 6 | **Lyric alignment + intelligibility gate** | **BUILD** | Separate vocal → ASR → **PER**, protocol published beside every number | This is the whole quality claim, and it must be ours: see the gate section below |
| 7 | **Loudness / master** | **BUILD** | two-pass ffmpeg, normalised against a named delivery arm | Already this project's law (film mandate Clause 15); no vendor needed |
| 8 | **Provenance marking** | **BUILD, day one** | C2PA-class manifest + soft binding, never advertised as traceability | D-SSM-15; Article 50(2) [PRIMARY] |

**AVOID, explicitly:** Suno (no API, resale forbidden, and **D-SSM-14** bans its output from our
corpus, eval set and reference bank entirely) · Udio (cannot export) · any third-party "Suno API"
reseller (downstream of the same terms) · GTSinger as training data — **CC BY-NC-SA 4.0,
"noncommercially used"** [PRIMARY: NeurIPS paper L523], and Turkish is not among its nine languages
anyway.

---

# The binding risk, named plainly: Turkish

Our films are Turkish, and Turkish is the one thing no route documents.

- Google documents **eight** vocal languages — *"English, German, Spanish, French, Hindi, Japanese,
  Korean, and Portuguese"* — and **"Turkish" appears nowhere in its prompt guide (zero matches)**
  [PRIMARY: capture L1034 + a zero-match search I ran myself]. Mureka documents ten, Turkish absent
  [RELAYED]. ElevenLabs says "and more", which names no Turkish and therefore cannot be cited as
  support [RELAYED].
- **Sung Turkish is entirely unmeasured in the literature**: no Turkish SVS system, no
  score-annotated Turkish singing corpus [RELAYED, reported as NOT FOUND with queries named].
- What exists: MTG's phoneme-annotated Turkish makam a-cappella corpora, a 197-song türkü set, and
  FreyaTTS (Apache-2.0, WER 8.0 %) proving flow-matching trains on Turkish — **for speech** [RELAYED].

**Absence of a documented guarantee is not proof of incapability.** These fields are free text on
every route, so Turkish is a MEASUREMENT question, and it is the first experiment this project should
run. One ≈$0.08 probe on `lyria-3-pro-preview`, with the documented `Lyrics:` convention and a Turkish
lyric, answers both open questions at once — and it needs Berk's spend approval.

---

# The gate — the one thing that must be ours, and the two errors already made building it

Our quality claim is "you can hear the words". That is the only axis in this product class with a
measurable instrument, and the science says so: **ASR error rate is the only objective metric measured
to track what listeners perceive**. SVCC 2023 computed Spearman correlations between objective and
subjective metrics and reports both `CER(Conformer)` and `CER(Whisper)` columns beside MCD and F0RMSE
[PRIMARY: I opened the capture — L131 states the correlation analysis, L205–L207 carry Table 4 and the
per-team table]. **Honest limit: the specific `−0.80 / −0.73` correlation cells and the "MCD
significant in zero English cells" claim are [RELAYED] — I could not locate those exact cells with my
queries.**

**The gate design, and every parameter of it either measured or explicitly deferred to calibration:**

```
delivered song
  → separate the vocal stem            (BS-RoFormer class; the ASR must not hear the backing)
  → ASR the vocal                       (the model is pinned and published, not "whatever is default")
  → PHONEME error rate vs the requested lyric
  → verdict, with the protocol printed beside the number
```

Four rules, each with its reason:

1. **PER, not WER or CER.** Both DiffRhythm and LeVo state why [RELAYED], and for Turkish the argument
   is stronger than for English: one wrong suffix destroys a word-level score while barely moving a
   phoneme-level one, so a WER gate on Turkish would reject correct singing.
2. **THE FLOOR IS NOT ZERO — and this is where my first instrument was wrong.** DiffRhythm's own
   ground-truth control measures **16.14 % PER** [RELAYED]: the pipeline errs on real human singing.
   A threshold near zero would reject correct output. This is this project's calibrated-0.0007
   vs guessed-0.08 lesson repeating in a new domain, so **no threshold is written here** — it is
   calibrated from labelled material, with the sample counts recorded, or the gate reports NOT RUN.
3. **A PER NUMBER WITHOUT ITS PROTOCOL IS MEANINGLESS.** Two of this run's own slices reported
   different values for the same systems — competitor axis *Suno 0.28 / Mureka 0.09 / DiffRhythm 0.13*
   versus SOTA axis *Suno 21.6 % / Mureka 7.2 % / DiffRhythm 18.02 % (mix) or 12.3 % (stem)*
   [both RELAYED]. **They are different protocols and different paper tables, and they are recorded
   side by side rather than averaged.** I also found, while checking, that the LeVo 2 repository
   reports **PER 8.55 %** for `v2-large` [PRIMARY: capture L36] — so "LeVo 7.2 %" and "LeVo 2 8.55 %"
   are different systems/protocols. Our gate therefore publishes: separation model, ASR model,
   phonemiser, language, and the ground-truth control value, beside every number it emits.
4. **THE INSTRUMENT NEEDS A CONTROL THAT CAN FAIL, on real material.** Eight instruments in this
   project have been silently wrong and every one passed its author's fixtures. The control set:
   a real human recording of the same lyric (must pass), an instrumental (must produce no words),
   and a deliberately wrong lyric (must fail). My own first version of this instrument used an
   open-vocabulary ASR sentinel — and the literature measures Whisper at WER 0.56 on sung versus 0.14
   on spoken audio [RELAYED], meaning **a low ASR yield is not proof that nobody sang.** That is why
   the vocal must be separated first and why forced alignment against KNOWN lyrics (we always know
   them — we wrote them) is the right shape rather than open transcription.

**What NO gate of ours may claim, because the field has no instrument for it** [RELAYED, and the
authors say so themselves]: long-form structural coherence (no objective metric exists),
expressiveness/technique/emotion (no open classifier exists), and singer identity (not measurable to a
useful standard). Those are **BERK'S VERDICT** axes by construction — the same rule the film mandate
already sets for "reads as real". A gate that claimed them would be the lie class.

---

# The parameter surface we would expose — built from the measured gap, not from imagination

Everything in this list is a control that **no vendor exposes by API today** [RELAYED, from
first-party surfaces], mapped to how we would implement it on the routes above:

| Control | Why it is ours to offer | Implementation route |
|---|---|---|
| `weirdness` / `creativity` as a NUMBER | Suno ships it in its own UI and exposes it to nobody | maps onto ACE-Step's `guidance_scale` / `guidance_type` / `granularity_scale` family and Lyria's `Intensity: n/10` prose control |
| `style_influence`, `audio_influence` as NUMBERS | same class | ACE-Step `tag_guidance_scale`, ElevenLabs `condition_strength` (if approved) |
| `singer_persona` — a stable handle across songs | only Mureka has anything (`vocal_id`) | our own: a fixed voice + fixed seed + a stored reference, verified by the F0/similarity instrument we already proved on TTS |
| `key`, `bpm`, `time_signature` as ENFORCED, not requested | every vendor takes them as prose or not at all | request in prose, then MEASURE the delivery and reject/regenerate — the enforcement is our gate, not the vendor's promise |
| `lyric_timing` — settable, not just returned | every vendor returns timestamps, none accepts them | forced alignment + our own retiming at assembly |
| `stems` from the generation call | no generation API returns them | separation stage (5) inside our own worker |
| `per_generation_quality` score in the response | nobody publishes one | our PER gate value, with its protocol, returned as a field |
| `lyrics_verified` boolean + the measured PER | nobody offers it | the gate's own output |

That last pair is the actual product claim: **we are the only route that tells you, per song, whether
the words came out — with a number and its protocol.** It is honest, it is measurable, and it is what
this repo's laws force us to build anyway.

---

# Cost, and what it does to a price

Per song, generation only [RELAYED prices, each dated 2026-08-13 and `[single-source official]`
unless noted]: ACE-Step ≈**$0.024** / 2 min · Lyria 3 Pro ≈**$0.08** / up to ~3 min · Mureka
$0.045–$0.03 · MiniMax $0.035 · ElevenLabs ≈$0.1485/min. Add our own stages: separation, ASR, alignment
and mastering are compute, not licence — the Tesla T4 instance already exists. **Sellable comparison:
licensed+indemnified tracks retail $0.125–$0.30** [RELAYED], so the margin band exists at the low end
and the room is in the CONTROL layer, not in undercutting.

**Not measured and not estimated:** our own per-song infrastructure cost, and the cost of the gate
itself (separation + ASR are the expensive stages, not the generation). Both are [OPEN] until a real
pass runs.

---

# What must happen before a line of this is built

1. **The Lyria-3 Turkish lyric probe** — ≈$0.08, needs Berk's approval. It settles two [OPEN]
   questions at once: does `lyria-3-pro-preview` honour the documented `Lyrics:` convention, and does
   it sing Turkish. Until then every stage-2 claim is documentation, not capability.
2. **A provenance instrument** — before any compliance posture is claimed, we need a measurement that
   opens a delivered file and reports whether a provenance manifest is present, because our own TTS
   worker rewraps PCM into a new WAV container and **nothing in this repo measures whether that drops
   metadata-borne provenance** [MEASURED HERE: zero workers reference marking at all].
3. **The gate's calibration set** — labelled Turkish singing material: a human recording, an
   instrumental, and a deliberately-wrong-lyric arm. Without it the gate has no threshold and must
   report NOT RUN.
4. **Legal answers he must obtain, not us:** EU/UK copyrightability [OPEN]; whether an AWS-hosted
   endpoint called by an EU customer makes us an Article 50 "provider placing on the market in the
   Union" [OPEN]; and the terms of service language for a product that sells generation without
   warranting copyright.

# Application/change ledger for this document

| Finding | Change already made in this repo | Evidence |
|---|---|---|
| My Lyria lyrics verdict was model-unscoped | `--model` added to the measurement script; `findings-<model>.json`; scope corrections written into `music_lyria/models.py`, `docs/ssm-content-asset-generation-api_v5.md` §9.7, `infra.md`; MEMORY.md **L37** written | syntax + CLI verified this session; first run's evidence preserved by rename |
| Suno's terms forbid using output to build a competitor | **D-SSM-14** recorded in `DECISIONS.md` | ToS capture L129, L85 [PRIMARY] |
| Article 50(2) binds providers since 2026-08-02 | **D-SSM-15** recorded in `DECISIONS.md`; Commission page archived as a primary capture | Commission page [PRIMARY] |
| Zero of 24 audio workers mark provenance | recorded in `infra.md` with the control-proven query | [MEASURED HERE] |
| PER is the gate metric, with a non-zero floor | written into `music_lyria/models.py` beside `instrumental_only`, with the literature baselines and the calibration duty | this document + the SOTA axis |

**Nothing in this document authorises a build.** It is the decision brief for one: the committed
recommendation is BUILD the control-and-measurement layer on adopted generation, and the four
prerequisites above are the gate on starting.

