# Scope plan (R3) — AI song-generation platform: can we build our own, most-advanced, on our own layers?

Run id: `2026-08-13-ai-song-generation-platform`
Mode: **B — owner research order** (his words: *"peki biz suno gibi bu müzik ve ses layer ı kullanarak en
ileri sveiyed ekendi müzik üretim api mizi yapamaz mıyız ? araştırır mısın"*, then his approval
*"evet ve suno daki gibi en advanced settimngs ayarlar melodiler vs. vs."*)
Frontier trigger: **ENGAGED** — `en ileri seviyede` is an R0.2 trigger, so all six R14 axes apply.
Covenant: `C:\Users\berke\.claude\skills\deep-research\SKILL.md` ·
SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E` ·
117,261 bytes · byte-identical across the `.claude`, `.cursor`, `.codex` and `.agents` installs
(all four hashed this session) · read IN FULL this session before any external action.

## 1. Exact decision served

**Do we build our own song-generation product (prompt → complete song with lyrics, structure, sung
vocals, mix), and if so with which architecture on which layers — or do we not build it?**
Not "research music AI". The output must be a committed BUILD / ADOPT / AVOID decision with the
architecture named per stage, plus the legal and cost conditions under which it is viable.

## 2. Why — the exact work this controls

Four Vertex audio endpoints went live in this repo TODAY and are route-verified
(`/create-music-lyria`, `/create-voice-vertex-tts`, `/create-stt-vertex`,
`/create-audio-live-gemini`; per-item evidence in `.claude/memory/infra.md`, entry
"FOUR VERTEX AUDIO WORKERS DEPLOYED + ROUTE-VERIFIED"). A measurement made in the same session
established the exact gap this research must close:

- **Lyria does not sing dictated words.** `scripts/measure_lyria_lyrics_capability.py`, 3 arms +
  negative control, each delivered file transcribed by our own `/create-stt-vertex`: with 8 Turkish
  words dictated, **0 of 8** came back; with no words dictated, the transcript was
  `"Ah, ah, ah, ah, ah"` ×3 (a vocal texture, no language); the instrumental control returned the
  transcriber's "nobody sings" sentinel, which is what makes the other two arms evidence.
- So the capability Suno sells — **intelligible, structured, sung lyrics** — is NOT in our current
  layer, and cannot be reached by prompt wording on that surface.

This research controls whether we assemble that capability ourselves (lyrics → melody → sung vocal →
instrumental bed → alignment → mix/master), which external components are unavoidable, and what the
product/legal shape must be. Downstream: new worker package(s) under this repo's
`<assettype>_<provider>/` contract, new routes on REST API `v2pjhwhk0m`, and the v5 API document.

## 3. Project context

`SsmContentAssetCreator` — an AI asset-generation suite exposed as ~178 REST routes over
per-asset-type/provider AWS Lambdas (account `723322847393`, `eu-central-1`, API `v2pjhwhk0m`,
CDN `cdn.BeforeTomorrow.io`). Audio inventory counted from disk this session: **7 music workers**
(`music_lyria`, `music_ace`, `music_beatoven`, `music_elevenlabs`, `music_minimax`,
`music_stability`, `music_stable`), **9 voice workers** (incl. today's `voice_vertex_tts`),
**6 SFX workers**, `stt_vertex`, `audio_live_gemini`. The second live line of work is a film
product (`docs/moviemaker/`) whose bar is real-photography quality. Measured capability that this
research builds on: **`prebuiltVoiceConfig.voiceName` genuinely selects the voice on the Vertex TTS
surface** — controlled F0 measurement, noise floor 6.72 Hz, medians Charon 129.56 / Fenrir 144.14 /
Aoede 190.48 / Kore 205.13 Hz, 4 of 6 pairs separated
(`scripts/measure_vertex_tts_named_voice_control.py`).

**Scope approved by him this turn: (c) — one engine, two surfaces:** an internal engine for our own
film/game pipeline AND an outward-facing product API. Therefore business model, user content rights
and copyright exposure are IN scope, not optional.

## 4. Complete topic and subquestions

1. What exactly does Suno ship — every feature, every advanced control, every setting, model
   versions, limits, prices, plans, licence terms? Same for every discovered competitor.
2. What ARE the "advanced settings" in this product class (his words: *"en advanced settimngs
   ayarlar melodiler vs."*) — persona/voice consistency, style reference audio, melody/audio
   prompting, stems, sections/structure tags, inpainting/extend/remaster, key/tempo/BPM control,
   negative style, weirdness/style-influence sliders, lyric-timing control, upload-and-cover?
3. Which of those controls exist as an API on any provider we may lawfully use?
4. What is the academic state of the art for singing-voice synthesis, lyrics-to-melody, score/lyric
   alignment, singing-voice conversion, and full-song generation — with methods, equations and real
   benchmark numbers?
5. Can a Suno-class song be ASSEMBLED from parts we already have or can build (LLM lyrics + singing
   synthesis + instrumental bed + alignment + mix), and where exactly does that architecture break?
6. What is measurable quality here, and what gate would we build (the project's measurement law
   demands an instrument with a control, not an ear)?
7. Copyright/licensing: training-data litigation state, output ownership, commercial-use terms,
   platform policies (Spotify/YouTube/Apple), provenance/watermarking obligations.
8. Cost per song across every route, and our own infrastructure cost.
9. What do users actually complain about and switch for?
10. What is coming (regulation, standards, model curves) that would invalidate a build?
11. How does this product class grow, including organic discovery?

## 5. Reversal / falsification evidence

The BUILD recommendation is refuted if any of these is established: no lawful provider offers
API-accessible singing synthesis with commercial rights AND the open-source path cannot reach
acceptable quality on measurable axes; or output-ownership/licence terms make a resale product
untenable; or the measured cost per song exceeds what the product can price; or a platform
distribution ban makes the output unusable. Each falsifier must be checked against primaries, not
assumed.

## 6. Inclusion / exclusion criteria

INCLUDE: first-party vendor documentation, APIs, pricing pages, terms and model cards; peer-reviewed
and arXiv papers with method and numbers; named university labs and professors; official
repositories with provenance; standards and regulator material; court filings and legal analyses;
user studies, reviews, forums and complaint corpora; grey literature, theses, workshop papers,
changelogs, issue trackers. EXCLUDE: SEO listicles and affiliate "best AI music tool" roundups,
undated blog aggregations, unverifiable rumour, anything requiring paywall/robots/credential bypass.
Languages: English primary, plus Turkish/Chinese/Japanese/Korean sources where the field leads there
(singing-synthesis research and products are strong in CN/JP/KR). Dates: newest-first, 2026 and 2025
lead; older work only where still controlling, with its date stated.

## 7. Verticals derived from the project's own language

- **Song/music generation as a product surface** — justified by his order: *"kendi müzik üretim
  api mizi"* (our own music-generation API) and by this repo's own structure, which is a route-per
  asset-type API (`docs/ssm-content-asset-generation-api_v5.md`, "Music (7 endpoints)").
- **Singing voice / vocals** — justified by *"suno daki gibi"* and by the measured gap (Lyria
  returns no intelligible words).
- **Advanced controllability** — justified verbatim: *"en advanced settimngs ayarlar melodiler vs."*
- Geography is NOT a vertical here (R3.7): no line in this project's vision scopes it regionally.

## 8. Geography

**GLOBAL.** The project's own contract states the aim is world-first quality and surpassing the
market leader; no document narrows it to a region. Narrowing would require
`[YOUR DECISION REQUIRED]`.

## 9. Temporal scope

Newest window: 2026 releases and the current model/API versions, checked at their own pages with
version and date recorded. Historical lineage required where load-bearing: singing-synthesis lineage
(concatenative → HMM → neural → diffusion/flow), lyrics-to-melody lineage, and the alignment
literature. Freshness horizon for prices/limits/terms: **7 days**, because this class of vendor
changes plans frequently; every price is dated and `[single-source official]` unless independently
corroborated.

## 10. Candidate universes to sweep

Academic (Stanford, MIT, Berkeley, CMU, Yale, Oxford, Cambridge, ETH, EPFL, Princeton, Harvard,
Caltech, UW, UCL, Toronto, Tsinghua, NUS, NTU + every topic-derived lab: music/audio labs, ISMIR
community, named PIs) · frontier companies (Google/DeepMind incl. Lyria and MusicLM/MusicFX lineage,
OpenAI, Meta/FAIR incl. AudioCraft/MusicGen, Microsoft Research incl. Muzic/VALL-E lineage, NVIDIA,
Stability, ElevenLabs, Suno, Udio, Kunlun/Mureka, Tencent/ByteDance/Alibaba audio labs) · code
(GitHub first-party orgs + the singing-synthesis repos: DiffSinger, NNSVS, so-vits-svc family,
Amphion, Muzic, AudioCraft, Matcha/Flow-matching TTS, alignment tooling) · APIs (every provider that
exposes music or singing generation, with commercial terms) · standards/regulator (EU AI Act
transparency, C2PA provenance, watermarking, US Copyright Office guidance, live litigation) ·
hidden evidence (ISMIR workshop papers, theses, issue trackers, model cards, deprecation notes,
non-English) · math/algorithms (R6: alignment, pitch/F0 modelling, vocoding, flow matching,
objective quality metrics — with formulas and complexity).

## 11. Planned artifact tree — **14 files created, 1 index updated**

| # | Path | Role |
|---|---|---|
| 1 | `docs/research/2026-08-13-ai-song-generation-platform-frontier.md` | main report, opens with Standards ledger + this scope plan |
| 2 | `docs/research/competitors/2026-08-13-ai-song-generation-pricing.md` | axis 1 |
| 3 | `docs/research/competitors/2026-08-13-ai-song-generation-functions-and-services.md` | axis 1 |
| 4 | `docs/research/competitors/2026-08-13-ai-song-generation-business-model.md` | axis 1 |
| 5 | `docs/research/competitors/2026-08-13-ai-song-generation-ui-and-menus.md` | axis 1 |
| 6 | `docs/research/sota/2026-08-13-ai-song-generation.md` | axis 2 |
| 7 | `docs/research/apis/2026-08-13-ai-song-generation.md` | axis 3 |
| 8 | `docs/research/customer-expectations/2026-08-13-ai-song-generation.md` | axis 4 |
| 9 | `docs/research/future-needs/2026-08-13-ai-song-generation.md` | axis 5 |
| 10 | `docs/research/growth/2026-08-13-ai-song-generation.md` | axis 6 |
| 11 | `docs/research/2026-08-13-ai-song-generation-architecture-on-our-own-layers.md` | the BUILD design: stage-by-stage architecture on our layers + measurable gates |
| 12 | `docs/research/2026-08-13-ai-song-generation-source-register.md` | source + read-status register, claim/contradiction/query ledgers |
| 13 | `docs/research/_runs/2026-08-13-ai-song-generation-platform.preflight.json` | R2 preflight |
| 14 | `docs/research/_runs/2026-08-13-ai-song-generation-platform.json` | R17 completion manifest |
| — | `docs/README.md` | index UPDATED (append; never overwrite) |

Raw captures go under `docs/research/_sources/` with `2026-08-13-` prefixes; they are evidence
files, counted in the source register rather than in the artifact count above.

## 12. Hard-law check

- **Deep-research covenant R11 floor** — ≥20 independent authoritative sources, ≥5 academic, ≥5
  academic `[FULL]` with the five-part R9 record; both counts reported. Held by the source register
  and recounted at R17.
- **R14 six axes** — one dated file per axis (rows 2–10 above); a missing axis file means NOT DONE.
- **Competitor parity law + mandatory closing block** — every competitor file ends with
  `NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT`.
- **R15.1 path resolution** — this project governs `docs/moviemaker/research/` for FILM-product
  topics only (`AGENTS.md`: *"film-product topics: `docs/moviemaker/research/`"*). This is a
  product/API topic, so the governed path is `docs/research/` and the index is `docs/README.md`.
  Recorded here per R15.1 and R18.4.
- **R12 delegation** — every subagent brief carries the covenant path + `COVENANT_SHA256`, the four
  MODE B items (WHY/PROJECT/SCOPE/RETURN) and all `CONTEXT-01`…`CONTEXT-18` labels non-empty. Noted
  tension: R12.2 demands the full marked block pasted inline, while PART I §1 / R2 MODE B (dated
  later, 2026-08-09/10) states naming the file plus its hash is sufficient *because pasting "made
  delegation unaffordable"*. The later text governs; the brief names the file, carries the hash, and
  orders the worker to read it in full before browsing.
- **R12.5 concurrency** — parallel fan-out is ACTIVE law; the old `≤1–2` Bedrock ceiling is
  `SUPERSEDED/DEAD` (R18.7). Concurrency is sized to slice independence and reduced only on observed
  throttling.
- **Berk's artefact-language law** — every file above is ENGLISH; his own words appear only as
  verbatim quoted evidence. Chat with him is Turkish.
- **MEASUREMENT LAW (this project)** — any quality claim about generated audio requires an
  instrument with a control that can both pass and fail. Eight instruments here have been silently
  wrong; the architecture document must specify the gate, not an opinion.
- **Spend** — research spends nothing. Any capability probe that would cost money is presented to
  Berk for approval BEFORE the call; nothing is bought inside this run without it.

## 13. Completion semantics

`Complete enough` = every axis file exists with primary-sourced content; the R11 counts are met and
reported; every load-bearing claim has 3 independent sources or a visible `[single-source]` /
`[UNVERIFIED]` flag; every falsifier in §5 checked against a primary; produced file count == 14 with
the index updated; the R17 manifest written, every artefact reopened and hashed. Known-item test:
the run must retrieve Suno's own current pricing/terms pages, Google's Lyria documentation, at least
one ISMIR-community singing-synthesis primary, and the current litigation status — if any of those
four is not retrieved, the strategy is repaired rather than reported. Explicit expected blind spots,
to be stated rather than smoothed: exact training-data composition of closed models, unpublished
provider roadmaps, and any subjective verdict on how the music SOUNDS — that last one is BERK'S
VERDICT and no instrument here may claim it.
