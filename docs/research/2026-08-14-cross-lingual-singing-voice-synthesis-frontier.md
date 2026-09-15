# Standards ledger

Standards ledger: governance files read from disk IN FULL this session (2026-08-14), before any external
research action: `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (the merged deep-research law and
covenant, PART I activation law + PART II R0–R18 + provenance annexes P1–P5) ·
`C:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` (project research standard + delegation
mandate) · `C:\Berk\SsmContentAssetCreator\.cursor\rules\19-supreme-law.mdc` (the six absolute prohibitions
and the ten-link chain) · `C:\Berk\SsmContentAssetCreator\AGENTS.md` (project contract including the
RESEARCH FLOOR section) · `C:\Berk\SsmContentAssetCreator\docs\music-studio-single-endpoint-architecture.md`
(the decision this research serves). Also carried per-turn and obeyed: the MOVIE MAKER UNIT MANDATE
(`.cursor/rules/movie-maker-unit-mandate.mdc`, Clauses 4/6/7/16/24/26), the fs-verification law, the
no-narrowing law, and rule 98 state recall.

**Path resolution (R15.1):** the brief names the exact output path
`docs/research/2026-08-14-cross-lingual-singing-voice-synthesis-frontier.md`. This is the project's default
governed research root (`docs/research/`), not the film-product path `docs/moviemaker/research/`, because the
decision served is the Music Studio endpoint, not the film line. Sources archived under
`docs/research/_sources/` with the `2026-08-14-<kebab-source-name>.<ext>` pattern as instructed.

**Language:** ENGLISH, UTF-8, per `AGENTS.md` ("EVERY ARTEFACT IS WRITTEN IN ENGLISH").

---

# Decision served, why, and project context

**The decision:** how do we engineer frontier-quality SUNG vocals in a language that NO song-generation
provider covers — instead of shortening our language list? Turkish is the immediate case; the answer must
generalise to any language.

**Why:** the owner's order of 2026-08-14 (Turkish, verbatim) — *"diller ekleyelim ve emin olduğıunu 100% en
ileri sveiyede olan dilelri destekle sadece ve bunu api parametresi yaparız… önemli olan yaztığımız dünyada
en ileri seviyede yapmamız"* and his correction of an attempt to ship a short list: *"bak sana türkçe yi
kaldır diye izin verdim sen hemen scopu u küçüllttün… dünyada bugüne kadar yapılamamış en ileri seviyede
olmalı. gerekirse en ileri sevieyde araştır internetten dökümanlardan."* A language's evidence STATE is a
BUILD BACKLOG, never a shipping filter (architecture document §2b.3).

**Project:** `C:\Berk\SsmContentAssetCreator` — 180 AWS Lambda asset-generation packages, account
`723322847393`, region `eu-central-1`, one REST API, keyless Vertex access via Workload Identity Federation.
Ten music/voice/sfx workers are live and generation-proven (`music_lyria` → `lyria-002` +
`lyria-3-pro-preview`; `music_ace` → ACE-Step with typed duration and typed lyrics; `music_elevenlabs` →
typed `composition_plan`; `voice_vertex_tts` → Gemini TTS with named voices). The goal is one endpoint,
`POST /create-music-studio`, with 48 typed controls and a MEASURED per-song lyric-intelligibility number.
Stage 6 of that pipeline (verify lyrics → PER against the requested lyric) is the product differentiator.
A GPU instance on Google Cloud is available, so open weights are a real option, not a theoretical one.

---

# Outcome first

**The single most important finding, and it is GOOD news for the plan, with one hard caveat.** The frontier
has, in the last six months, published exactly the mechanism this decision needs — and it is not
"wait for a provider to add Turkish". Two independent 2025–2026 lines of evidence show that **lyric
intelligibility in singing is controlled by the PHONEME REPRESENTATION and its TIMING, not by a
"supported-language" list**: (a) **Transinger** (Sensors, 2025-06-26, `[FULL]`) synthesises a language
absent from its training set by decomposing IPA phonemes into base letters + diacritics and recombining
them, and measures the effect; (b) **MPEcho** (arXiv 2607.26698, `[FULL]`) cuts PER from **45.62 % to
18.65 %** on full-song generation purely by adding explicit phoneme-level conditioning with a length
regulator to an ACE-Step/SongEcho backbone — no new language data. The hard caveat, stated first because it
is bad news for the naive reading: **Transinger's own table contradicts its own prose** on which encoding is
better (§Axis 2 and the contradiction ledger), and **no source measured ANY of this on Turkish singing** —
the Turkish evidence that exists is speech/alignment corpora (~19 minutes of a cappella makam), not sung
generation. So the mechanism is evidenced; the Turkish NUMBER must be measured by us.

**The recommended mechanism, in one line:** route uncovered-language vocals through
**G2P → IPA/phoneme sequence with decomposed articulatory features → phoneme-level timing (length
regulator) → an OPEN-WEIGHT score-conditioned SVS model (SoulX-Singer, Apache-2.0, 42,000 h) rendering the
vocal, mixed against a separately generated instrumental bed**, and gate every delivery with an
ALT-based PER measured against a per-language human floor.

---

# Source register

Read-status vocabulary per R8.2. `[FULL]` = the raw captured primary text was opened and read in this
session; `[PARTIAL]` = more than an abstract (verbatim table/section text from the captured page) but not the
complete primary; `[ABS]` = abstract/metadata only. Every capture listed as archived lives in
`C:\Berk\SsmContentAssetCreator\docs\research\_sources\` (23 files, machine-counted this session).

| # | Title | Author / org | Date | URL | Read | Academic? | Archived as |
|---|---|---|---|---|---|---|---|
| S01 | SoulX-Singer: Towards High-Quality Zero-Shot Singing Voice Synthesis | Qian, Meng, … Xie, Wang — Soul AI Lab / Tianjin Univ. / NPU ASLP | 2026-02-08 | https://arxiv.org/abs/2602.07803 | `[FULL]` | yes | `2026-08-14-soulx-singer-arxiv-2602-07803.txt` |
| S02 | Soul-AILab/SoulX-Singer repository (licence, weights, 888 stars, created 2026-02-06) | Soul AI Lab | 2026-02 | https://github.com/Soul-AILab/SoulX-Singer | `[PARTIAL]` | no | — |
| S03 | TCSinger 2: Customizable Multilingual Zero-shot Singing Voice Synthesis | Zhang, Guo, Pan, … Zhao — Zhejiang Univ. | ACL Findings 2025 (arXiv 2505.14910) | https://aclanthology.org/2025.findings-acl.687.pdf | `[FULL]` | yes | `2026-08-14-tcsinger2-acl-findings-2025-687.txt` |
| S04 | AaronZ345/TCSinger2 repository | Zhejiang Univ. | 2025 | https://github.com/AaronZ345/TCSinger2 | `[PARTIAL]` | no | — |
| S05 | Transinger: Cross-Lingual Singing Voice Synthesis via IPA-Based Phonetic Alignment | Shen, Zhao, Fu, Gan, Du — Nanjing Tech Univ. | 2025-06-26 (Sensors) | https://doi.org/10.3390/s25133973 | `[FULL]` | yes | `2026-08-14-transinger-sensors-2025-ipa-cross-lingual-svs.txt` |
| S06 | MPEcho: A Melody and Phoneme-Aware Generative Framework for Controllable Cover Song Generation | NTU Taiwan et al. (NSTC-funded) | 2026-07 (arXiv 2607.26698v1) | https://arxiv.org/html/2607.26698v1 | `[FULL]` | yes | `2026-08-14-mpecho-arxiv-2607-26698.txt` |
| S07 | Self-Supervised Singing Voice Pre-Training towards Speech-to-Singing Conversion (SVPT) | Li, Huang, Wang, Hong, Zhao — Zhejiang Univ. | ACL Findings 2024 | https://aclanthology.org/2024.findings-acl.585.pdf | `[FULL]` | yes | `2026-08-14-svpt-acl-findings-2024-585.txt` |
| S08 | AlignSTS: Speech-to-Singing Conversion via Cross-Modal Alignment | Li, Huang, Zhang, Liu, Zhao — Zhejiang Univ. | ACL Findings 2023 (arXiv 2305.04476) | https://aclanthology.org/2023.findings-acl.442.pdf | `[PARTIAL]` | yes | `2026-08-14-alignsts-acl-findings-2023-442.txt` |
| S09 | YuE: Scaling Open Foundation Models for Long-Form Music Generation | Yuan, Lin, … (M-A-P) | 2025 (arXiv 2503.08638) | https://arxiv.org/html/2503.08638 | `[PARTIAL]` | yes | `2026-08-14-yue-arxiv-2503-08638.txt` |
| S10 | DiffRhythm 2: Efficient and High Fidelity Song Generation via Block Flow Matching | Ning, Chen, Jiang, … Xie — NPU ASLP | 2025-10 (arXiv 2510.22950v3) | https://arxiv.org/html/2510.22950v3 | `[PARTIAL]` | yes | `2026-08-14-diffrhythm-2-arxiv-2510-22950.txt` |
| S11 | DiffRhythm+: Controllable and Flexible Full-Length Song Generation with Preference Optimization | NPU ASLP | 2025-07 (arXiv 2507.12890v2) | https://arxiv.org/html/2507.12890v2 | `[PARTIAL]` | yes | `2026-08-14-diffrhythm-plus-arxiv-2507-12890.txt` |
| S12 | ACE-Step 1.5: Pushing the Boundaries of Open-Source Music Generation | ACE Studio / StepFun | 2026-02 (arXiv 2602.00744) | https://www.arxiv.org/pdf/2602.00744v2 | `[PARTIAL]` | yes | `2026-08-14-ace-step-1-5-arxiv-2602-00744.txt` |
| S13 | ACE-Step 1.5 project page (50+ languages claim, stated limitations) | ACE Studio | 2026-02 | https://ace-step.github.io/ace-step-v1.5.github.io/ | `[PARTIAL]` | no | — |
| S14 | Jam-ALT: A Formatting/Readability-Aware Lyrics Transcription Benchmark | Cífka, Schreiber, Miner, Stöter — AudioShake | 2023-11 arXiv 2311.13987; ISMIR 2024 | https://doi.org/10.48550/arxiv.2311.13987 | `[PARTIAL]` | yes | `2026-08-14-jam-alt-arxiv-2311-13987.txt` |
| S15 | Jam-ALT benchmark page + HF dataset card (79 songs, 4 languages, v1.4.0) | AudioShake / Jamendo | 2024–2025 | https://audioshake.github.io/jam-alt/ | `[PARTIAL]` | no | — |
| S16 | audioshake/alt-eval toolkit (metric definitions, CER-for-CJK rule) | AudioShake | 2024–2025 | https://github.com/audioshake/alt-eval/ | `[PARTIAL]` | no | — |
| S17 | Exploiting Music Source Separation for Automatic Lyrics Transcription with Whisper (MUSDB-ALT, RMS-VAD) | Syed, Meresman-Higgs, Cífka, Sandler — QMUL / AudioShake | 2025-06 (arXiv 2506.15514); ICME 2025 workshop | https://arxiv.org/abs/2506.15514 | `[PARTIAL]` | yes | `2026-08-14-mss-alt-whisper-arxiv-2506-15514.txt` |
| S18 | SingMOS-Pro: A Comprehensive Benchmark for Singing Quality Assessment | Tang, Liu, Feng, Zhao, Han, Yu, Shi, Jin — Renmin Univ. / CMU / Georgia Tech | 2025-10-02 arXiv 2510.01812; ICASSP 2026 | https://arxiv.org/html/2510.01812v3 | `[PARTIAL]` | yes | `2026-08-14-singmos-pro-arxiv-2510-01812.txt` |
| S19 | South-Twilight/SingMOS predictor (models, versions, train data) | Renmin Univ. | 2025-11-29 (v1.1.2) | https://github.com/South-Twilight/SingMOS | `[PARTIAL]` | no | — |
| S20 | STARS: A Unified Framework for Singing Transcription, Alignment, and Refined Style Annotation | Guo, Zhang, Pan, … Zhao — Zhejiang Univ. | 2025-07-09 (arXiv 2507.06670); ACL Findings 2025 | https://aclanthology.org/2025.findings-acl.781.pdf | `[PARTIAL]` | yes | `2026-08-14-stars-arxiv-2507-06670.txt` |
| S21 | Research on the Recognition and Application of Montreal Forced Aligner for Singing Audio | (journal article) | n.d. (DOI 10.54097/ohpdubg1) | https://doi.org/10.54097/ohpdubg1 | `[PARTIAL]` | yes | — |
| S22 | Phonological Features for 0-Shot Multilingual Speech Synthesis | Staib et al. — Papercup | Interspeech 2020 | https://doi.org/10.21437/interspeech.2020-1821 | `[PARTIAL]` | yes | `2026-08-14-phonological-features-zero-shot-multilingual-tts-interspeech-2020.txt` |
| S23 | Text-to-Speech for Under-Resourced Languages: Phoneme Mapping and Source Language Selection in Transfer Learning (PHOIBLE 37-feature mapping) | — | SIGUL 2022 | https://aclanthology.org/2022.sigul-1.3.pdf | `[PARTIAL]` | yes | `2026-08-14-phoneme-mapping-under-resourced-tts-sigul-2022.txt` |
| S24 | Unify and Conquer: How Phonetic Feature Representation Affects Polyglot TTS | Amazon | 2022-07 (arXiv 2207.01547) | https://ar5iv.labs.arxiv.org/html/2207.01547 | `[PARTIAL]` | yes | `2026-08-14-unify-and-conquer-polyglot-tts-arxiv-2207-01547.txt` |
| S25 | Phonological-feature (FUL) input for multilingual TTS incl. UNSEEN languages | — | arXiv 2204.07228v2 | https://arxiv.org/html/2204.07228v2 | `[PARTIAL]` | yes | `2026-08-14-phonological-feature-input-tts-arxiv-2204-07228.txt` |
| S26 | Few-Shot Cross-Lingual TTS Using Transferable Phoneme Embedding | Huang et al. | Interspeech 2022 | https://www.isca-archive.org/interspeech_2022/huang22g_interspeech.pdf | `[PARTIAL]` | yes | `2026-08-14-few-shot-cross-lingual-tts-phoneme-embedding-interspeech-2022.txt` |
| S27 | PHOIBLE 2.0 (3020 inventories, 3183 segment types, 2186 languages; IPA pivot + distinctive features) | Moran & McCloy | 2019 (release 2.0) | https://phoible.org/ | `[PARTIAL]` | no | — |
| S28 | Turkish Şarkı Vocal Dataset (12 performances / 11 compositions, phrase-aligned lyrics, Praat TextGrid) | Dzhambazov & Serra — MTG, Universitat Pompeu Fabra | Zenodo DOI 10.5281/zenodo.1283350 | https://doi.org/10.5281/zenodo.1283350 | `[PARTIAL]` | no | — |
| S29 | Turkish Makam Acapella Sections Dataset (clean a cappella; section, word AND phoneme-level annotations) | MTG, UPF | Zenodo record 1287656 | https://zenodo.org/records/1287656 | `[PARTIAL]` | no | — |
| S30 | On the Use of Note Onsets for Improved Lyrics-to-Audio Alignment in Turkish Makam Music (12 a cappella recordings, 19 min, 732 words) | Dzhambazov, Şentürk, Serra — MTG UPF | ISMIR 2016 | https://sertansenturk.com/uploads/publications/dzhambazov2016onsetLyrics_ismir.pdf | `[PARTIAL]` | yes | `2026-08-14-turkish-makam-note-onsets-lyrics-alignment-ismir-2016.txt` |
| S31 | MTG/turkish-makam-acapella-sections-dataset (annotated on word and phoneme level) | MTG UPF | 2014– | https://github.com/MTG/turkish-makam-acapella-sections-dataset | `[PARTIAL]` | no | — |
| S32 | Turkish phonology — 8 vowels, 21 consonants, no phonemic diphthongs, no aspiration | Wikipedia (tertiary, corroborated by S33/S34) | retrieved 2026-08-14 | https://en.wikipedia.org/wiki/Turkish_phonology | `[PARTIAL]` | no | `2026-08-14-turkish-phonology-inventory.txt` |
| S33 | Comparative Turkish/English phoneme-inventory study (Turkish lacks /w/ /ŋ/ /θ/ /ð/ /æ/; English lacks /ɣ/) | Dergipark (Turkish journal, non-English source — THE DARK) | n.d. | https://dergipark.org.tr/tr/download/article-file/3649926 | `[PARTIAL]` | yes | `2026-08-14-turkish-english-phonology-contrast-dergipark.txt` |
| S34 | Phonemic-inventory counts and PHOIBLE description; Turkish 8 vowels / 21 consonants, velarised vs non-velarised lateral | Khan, T. A. — J. Language and Linguistic Studies 17(S1) | 2021 | https://www.jlls.org/index.php/jlls/article/download/2061/705 | `[PARTIAL]` | yes | `2026-08-14-phoible-phoneme-inventory-counts-jlls-2021.txt` |
| S35 | ASLP-lab/DiffRhythm repository (v1.2, model cards, English+Chinese) | NPU ASLP | 2025-05-09 | https://github.com/ASLP-lab/DiffRhythm | `[PARTIAL]` | no | — |
| S36 | AudioShake research blog — Jam-ALT motivation and system comparison table | AudioShake | 2024 | https://www.audioshake.ai/post/new-benchmark-for-higher-quality-lyrics-transcription-from-audioshake-research | `[PARTIAL]` | no | — |
| S37 | IWSLT 2026 low-resource track (multilingual-first framing for under-served languages) | IWSLT | 2026 | https://iwslt.org/2026/low-resource | `[ABS]` | no | — |
| S38 | multimodal-art-projection/YuE repository (language list, annealing-checkpoint issue 12, per-language IDs) | M-A-P | 2025 | https://github.com/multimodal-art-projection/YuE | `[PARTIAL]` | no | — |

## Source counts (machine-counted from the table above)

- **Total independent authoritative sources: 38** (floor ≥20 — met).
- **Academic sources: 23** (S01, S03, S05, S06, S07, S08, S09, S10, S11, S12, S14, S17, S18, S20, S21, S22,
  S23, S24, S25, S26, S30, S33, S34) — floor ≥5 — met.
- **Academic primaries read `[FULL]` with complete five-part R9 records: 5** (S01 SoulX-Singer, S03
  TCSinger 2, S05 Transinger, S06 MPEcho, S07 SVPT) — floor ≥5 — met, exactly at the floor.
- **Provenance families deduplicated (R11.2):** the SoulX-Singer paper + its repository are ONE family (S01,
  S02) and are counted once for corroboration purposes; likewise TCSinger 2 (S03/S04), DiffRhythm
  (S10/S11/S35), ACE-Step (S12/S13), Jam-ALT (S14/S15/S16/S36), SingMOS-Pro (S18/S19), YuE (S09/S38), and the
  MTG Turkish corpora (S28/S29/S30/S31). Counted as **38 URLs across 25 independent underlying works.**

# AXIS 1 — State of the art, 2026-first

Ordered NEWEST FIRST. Every date is the source's own stated publication date.

| Date | System | What it is | Languages it claims | Load-bearing number |
|---|---|---|---|---|
| **2026-07** | **MPEcho** (S06) | phoneme + melody conditioned cover-song generation on an ACE-Step/SongEcho backbone; adds a phoneme encoder + length regulator; ships **Phonsa**, a Whisper-based phoneme aligner | Mandarin only (explicit limitation) | **PER 45.62 % → 18.65 %** by adding phoneme conditioning; Phonsa alignment MAE **233.9 ms (MFA) → 32.6 ms** |
| **2026-02-08** | **SoulX-Singer** (S01) | open-weight zero-shot SVS, flow-matching DiT, **MIDI-score OR F0-melody** conditioning, note-level duration control, + an SVC variant | Mandarin, English, Cantonese (≈20 k h + 20 k h + 2 k h of 42,000 h) | **cross-lingual WER 0.110** (score mode) vs Vevosing **0.717**, SIM 0.898; GT cross-lingual WER **0.148** |
| **2026-02** | **ACE-Step 1.5** (S12, S13) | LM-planner + DiT music foundation model; **stochastic Romanisation** of 50 % of non-Roman lyrics | "50+ languages" (project page); paper evaluates English/Chinese prompts only | own limitation list includes "Vocal Quality: Coarse vocal synthesis lacking nuance" |
| **2026-01** | Latent flow matching for expressive SVS (arXiv 2601.00217, cited by S06 ref [30]) | flow-matching SVS | not established this session | `[UNVERIFIED]` — discovered via citation, not opened |
| **2025-12** | YingMusic-Singer (arXiv 2512.04779, via S01 ref [18]) / YingMusic-SVC (2512.04793) | annotation-free melody-guided zero-shot SVS/SVC | not established | measured BY S01: YingMusic-Singer CN WER 0.099 melody mode |
| **2025-10** | **DiffRhythm 2** (S10) | block-flow-matching full-song generation | English + Chinese (S35) | **PER 0.13**, best in its table; measured with Qwen3 ASR + G2P→IPA |
| **2025-10** | **SingMOS-Pro** (S18) | 7,981 clips / 41 models / 12 datasets, **five annotators per clip**, three dimensions: **lyrics, melody, overall** | Chinese + Japanese only (11.15 h) | first multilingual multi-task MOS dataset for singing |
| **2025-08** | Vevo2 (arXiv 2508.x, via S01 ref [17]) | unified prosody learning, controllable speech+singing | not established | measured BY S01 as "Vevosing": cross-lingual WER **0.717** (severe leakage) |
| **2025-07** | **DiffRhythm+** (S11) | preference-optimised full-song generation | English + Chinese | **PER 14.85 % / 14.96 %**, beating YuE **15.14 %**; RTF 0.036–0.039 vs YuE 10.385 |
| **2025-07** | **STARS** (S20) | first unified singing transcription + alignment + style annotation; beats MFA and SOFA on BER/IOU | Chinese, + Chinese∪English multilingual test | BER **18.6** vs ROSVOT variant; GTSinger used **under CC BY-NC-SA 4.0** |
| **2025-07** | ACL: TCSinger 2 (S03) | see Axis 2 | 9 languages | STS style transfer FFE **0.24**, Cos **0.89** |
| **2025-06-26** | **Transinger** (S05) | IPA letters + diacritics decomposed; **dynamic IPA adaptation for UNSEEN languages**; VISinger2 + Conformer + RVQ | trained CN/JA/KO, **tested on unseen English** | multilingual CN WER **22.77 %** vs monolingual **35.64 %** (≈36 % relative reduction, p<0.001); GT WER **7.61 %** |
| **2025-06** | **MSS+ALT with Whisper** (S17) | RMS-VAD segmentation from separated vocals; publishes MUSDB-ALT | Jam-ALT's 4 languages | **20.35 % WER** on Jam-ALT (open-source SOTA, no training); **14.98 %** on vocal stems |
| **2025-03** | YuE (S09) | open lyrics-to-song foundation model, LLaMA2, dual-NTP track decoupling | EN, ZH, Cantonese, JA, KO + code-switching | **fine-tuning to a new language within a 40 B-token budget**; JA lyrics-following **70 %**, ZH 60 %, KO 55 %; 7 B model WER ≈**20 %** vs 0.5 B ≈70 % |
| 2024-08 | SVPT (S07) | STS via self-supervised singing pre-training; no text annotation needed | trained 161.7 h ZH + 18.2 h EN | see Axis 3 |
| 2024 (still SOTA for its task) | GTSinger (S03 ref) | largest recorded singing corpus | 9 languages, 20 singers, 80 h | **CC BY-NC-SA 4.0 — non-commercial** (stated in both S03 and S20) |
| 2023-07 | AlignSTS (S08) | rhythm adaptor + cross-modal aligner STS | English test set | LSD **5.519**, RCA 0.941, MOS-Q 3.41 |

**What this ordering proves and what it refutes.** The parent brief's measured facts survive contact with the
newest evidence with two corrections: (a) TCSinger 2 is NOT the frontier any more — SoulX-Singer (Feb 2026)
beats it by a large margin on every reported axis (English score-mode WER **0.149 vs TCSinger 0.410** on
GMO-SVS, S01 Table 1), and it is the one that is Apache-2.0 with released weights; (b) "song-generation
providers enumerate ~10 languages" remains true of PRODUCTS, but the OPEN research frontier now measures
**cross-lingual synthesis as a first-class evaluated task with published numbers** — which is exactly the
capability the Music Studio needs. **Turkish appears in NONE of the systems above.** Confirmed by explicit
language lists in S01 (3), S03 (9), S05 (4), S06 (1), S09 (5+), S10/S35 (2), S18 (2). That absence is
`[VERIFIED — 7 independent sources]`.

# AXIS 2 — The phoneme-inventory hypothesis (the load-bearing question)

**The question:** is "supported language" a proxy for PHONEME COVERAGE, and does feeding a G2P phoneme
sequence instead of orthography let a model pronounce an unseen language?

**The answer from the evidence: YES for the phoneme-representation half, with a measured ceiling.** Four
independent lines converge; one internal contradiction is preserved rather than averaged.

## 2.1 Five-part depth record — Transinger (S05) `[FULL]` — the only paper that DIRECTLY tests an unseen language in SINGING

1. **Problem in the authors' own framing.** "Current SVS research shows scant exploration of cross-lingual
   generalization, as fragmented, language-specific phoneme encodings (e.g., Pinyin, ARPA) hinder unified
   phonetic modeling." They name the mechanism of the failure: "This linguistic compartmentalization creates
   systemic incompatibilities in multilingual modeling."
2. **Method, with its architecture and assumptions.** Built on VISinger2 (CVAE: posterior encoder, prior
   encoder, decoder). Three changes: (a) **all four languages re-transcribed into IPA**, using the 107 IPA
   letters plus SVS-specific symbols **SP** (silence) and **AP** (aspiration); the official 40 IPA diacritics
   are refined, and **tone/word-accent diacritics are DELETED** on the stated experimental ground that "tones
   and word accents have minimal impact on the final singing voice"; (b) **IPA phonemes are DECOMPOSED into a
   base letter and its diacritics, embedded SEPARATELY, and combined by element-wise addition** — so
   aspiration `[ʰ]` learned on `[p]` and `[t]` transfers to an unseen `[kʰ]`; diphthongs like `[aw]` are kept
   as single units deliberately, "ensuring that this natural and coherent transition is accurately captured";
   (c) Conformer + **Residual Vector Quantization** in both encoders, and the KL term of the CVAE is
   REPLACED by a three-part composite loss L = λ1·L_MSE + λ2·L_cos + λ3·L_L1 (Eq. 1–4), where cosine
   similarity is justified specifically because "both symbol and modifier components must align directionally
   for accurate sub-phoneme modeling". Zero-shot assumption stated honestly: "Since the text encoder cannot
   process phonemes unseen during training, we incorporated these phonemes into the embedding vectors prior to
   training."
3. **Real numbers from the paper's own tables.**
   - Multilingual training vs monolingual, same model, Chinese test: WER **22.77 % (±2.11) vs 35.64 %
     (±2.37)** — a ≈36 % relative reduction, **p < 0.001**. Ground truth on the same set: **7.61 % (±1.40)**.
   - Transinger vs modified VISinger2 on the multilingual corpus: CN WER **22.77 % vs 26.73 %** (p<0.05);
     pronunciation MOS **3.69 vs 3.59** (p<0.05); F0_RMSE **5.31 vs 6.88** (22.8 % better); MCD 6.593 vs
     6.700; expressiveness MOS **3.37±0.06 vs 3.08±0.07** (p<0.001); ABX win rate **60.6 %** multilingual.
   - **The cost of multilinguality, measured and admitted:** VS_E (voiced/silence error) **rises from 5.56 %
     monolingual to 9.75 % multilingual**.
   - **Zero-shot unseen-language table (trained CN/JA/KO, tested on English, 32 segments):**
     `Merged L&D` → PER **1.127 %**, PRR 3.105 %, F0-RMSE 7.4398, MSD 75.1204, VS_E 16.3 %, SA 9.01 %;
     `Split (L + D)` → PER **9.219 %**, PRR 22.65 %, F0-RMSE 6.4204, MSD 59.2089, VS_E 12.86 %, SA 15.89 %.
4. **Stated limitations (the authors' own).** "It is worth noting that the performance on non-Chinese
   languages tends to be slightly lower across most metrics. Striking the right balance between shared
   representations … and language-specific components … remains a key challenge." And: "Although multilingual
   training enhances expressive capabilities across languages, it may slightly compromise the accuracy of
   certain audio aspects."
5. **Concrete application to THIS decision.** This is the primary evidence that the Music Studio's
   `lyrics.script` / phonemisation layer must emit **IPA decomposed into base letter + diacritic**, not a
   language-tagged phoneme set, and that a language's `state` in the registry should be predicted by its
   **IPA feature overlap** with the trained inventory — a computable quantity (PHOIBLE, S27) rather than a
   vendor list. It also fixes a parameter: tone/accent diacritics may be dropped for singing, with this
   citation as the basis (Mandate Clause 4 forbids unsourced values).

**PRESERVED CONTRADICTION (do not average).** Transinger's PROSE says decomposition wins: "breaking down IPA
phonemes into letters and diacritics further improves cross-language performance… highlight the substantial
application value of separating IPA phonemes." Its TABLE shows `Split (L+D)` with **8× WORSE PER (9.219 % vs
1.127 %)** and worse PRR, while being better on F0-RMSE, MSD, VS_E and SA. Both readings cannot be true. Two
candidate resolutions, neither verifiable from the captured text: the columns may be transposed relative to
the caption, or PER/PRR may be defined inversely (as recognition RATES rather than error rates) — the paper's
PRR is defined as a *Recognition Rate*, where HIGHER is better, and it sits in the same table as PER without a
per-column arrow. **Consequence for us: the DIRECTION of the decomposition effect is `[UNVERIFIED]` and must
be measured on our own material before it becomes a design commitment.** What IS verified from this paper is
the multilingual-vs-monolingual gain (22.77 % vs 35.64 %, p<0.001), which is stated identically in prose and
table.

## 2.2 Five-part depth record — MPEcho (S06) `[FULL]` — the strongest measured effect in the entire corpus

1. **Problem in the authors' framing.** "Neither the coarse, sentence-level lyrics control used by the
   backbone LTS model nor the V/UV tags offers the fine-grained phoneme-level temporal resolution requisite
   for accurate lyric rendering, leading to noticeable lyrical errors (45.62 % PER)."
2. **Method.** Take a pretrained lyrics-to-song backbone (ACE-Step DiT) + SongEcho's melody conditioning
   (RMVPE F0 + IA-EiLM adapters), and ADD a phoneme branch: phoneme sequence **P** and duration sequence **D**
   → embeddings → 4-layer/2-head FFT block (D_p = 256) → **length regulator repeats each phoneme embedding
   according to its duration** → downsample/pad to the DiT hidden length → fuse with melody before injection.
   Trained with flow matching (Eq. 1). Inference uses **multi-condition CFG on APG** (Eq. 4) with three
   guidance scales ω_t, ω_l, ω_a. Trainable parameters: 53.3 M adapters + 330 k melody encoder + **12.1 M
   phoneme encoder**. The timings come from **Phonsa**: Whisper encoder + chunked self-attention (4 heads,
   500-frame/10 s chunks, 50 % overlap), CTC + frame-level CE multi-task loss, and **special breath and
   boundary tokens** — the boundary token exists specifically to let Viterbi segment consecutive identical
   phonemes.
3. **Real numbers.** Phonsa vs MFA: MAE **32.6 ms vs 233.9 ms**, PCO **0.965 vs 0.767**, PCAS **0.897 vs
   0.680**; unsupervised segmentation FA 0.849, BD F1 0.534 (MFA cannot do this task at all). CSG: SongEcho
   (melody only) PER **0.4562**; MPEcho phoneme-only **0.2292** but melody collapses (RPA 0.0667); **melody +
   SVS-style phoneme = PER 0.1865** with RPA 0.5764 restored; best guidance config (15.0, 7.5, 5.0) → PER
   **0.1793**, RPA 0.6241. The **JAM-style word-level** phoneme arrangement gives PER **0.7125** — worse than
   no phoneme control at all. Reference points in the same table: ACE-Step from scratch PER **0.4348**; real
   songs are the Audiobox ceiling (CE 7.3402). Subjective MOS (25 participants): melody-only 2.92 overall →
   melody+phoneme 3.21 → +MC guidance **3.57**.
4. **Stated limitations.** "MPEcho is limited to single-singer scenarios. Future work will explore
   multi-singer generation, **multilingual phoneme modeling**, and richer prosodic control." Also: "boundary
   detection in singing voice remains challenging, as reflected by the relatively low BD F1 scores under a
   strict 20 ms tolerance." All data is Mandarin (30.92 h train / 16.54 h test for Phonsa; 13,045 tracks /
   ~1,427 h for MPEcho).
5. **Concrete application.** Three hard design consequences for the Music Studio. (i) **Phoneme-level timing,
   not word-level** — the JAM-style word-level variant measured 0.7125 PER vs 0.1865, so a "word timings are
   good enough" shortcut is refuted with a number. (ii) **Never ship phoneme conditioning WITHOUT melody
   conditioning** — phoneme-only degraded RPA to 0.0667 and Audiobox CE to 4.17; this is the exact
   "conflicting conditions" failure our energy-curve/structure compiler could walk into. (iii) The whole
   effect was obtained with a **12.1 M-parameter adapter on a frozen backbone**, i.e. it is affordable on the
   existing GPU instance rather than requiring a foundation-model retrain.

## 2.3 The speech-domain corroboration: phonological features carry UNSEEN languages

- **S22 (Interspeech 2020)** replaces the phoneme embedding table with a single linear layer over **binary
  phonological feature vectors** mapped from IPA by dictionary lookup, explicitly "enabling zero-shot
  multilingual synthesis", and notes the parameter count DROPS because the feature vector is smaller than the
  phoneme inventory.
- **S25 (arXiv 2204.07228v2)** measures the ceiling honestly: FUL-feature input models "were able to produce
  speech with moderate intelligibility in seen languages" and, with more data, "even unseen languages",
  where "performance in unseen languages remained lower than in seen languages" but "intelligibility MOS
  scores indicated that the outputs were generally intelligible, **even with only 100 hours of training
  data**, which is several orders of magnitude smaller than the tens of thousands to millions of hours…".
- **S23 (SIGUL 2022)** gives the computable mapping rule: **PHOIBLE's fixed set of 37 binary phonological
  features per IPA segment**; for a target phoneme absent from the source language, initialise from "the
  candidate with the most similar sets of PHOIBLE phonological features (represented as a vector of length
  37)", tie-broken by cosine similarity of adjacent-phoneme distributions; diphthongs/long vowels are
  decomposed when no single match exists.
- **S24 (Amazon, arXiv 2207.01547)** frames the design space precisely — unified (IPA/**X-SAMPA**) vs separate
  per-language tokens — and states its own gap: "we could also consider a comparison with a representation
  based on phonological features."
- **S26 (Interspeech 2022)** reports the transfer-learning floor from the literature it reviews: Microsoft's
  multilingual training on 50 languages "enables the model to adapt to a new language using only **6 minutes**
  of paired data."

## 2.4 Which systems actually ACCEPT phoneme input — measured, per system

| System | Accepts phonemes? | Exact evidence, read this session |
|---|---|---|
| **SoulX-Singer** (S01) | **YES for English**, pinyin for Mandarin/Cantonese | "For Mandarin and Cantonese, the modeling units are defined as character-level pinyin, whereas **English is represented using phonemes**… wrapped with `<BOW>`/`<EOW>`… language-specific tags are appended to the pinyin tokens" |
| **Transinger** (S05) | **YES — IPA letters + diacritics, separately embedded** | §Prior Encoder, verbatim above |
| **TCSinger 2** (S03) | YES — lyrics+notes into the BBC Encoder, with boundaries deliberately BLURRED | "we randomly mask m tokens at each phoneme and note boundaries"; **m = 8**, chosen "considering our compression rate and sample rate" |
| **MPEcho / Phonsa** (S06) | **YES — phoneme sequence + per-phoneme duration** | §3.1, verbatim above |
| **ACE-Step 1.0/1.5** (S12) | PARTIAL — internal, not an API surface: "stochastic Romanization strategy, converting **50 %** of lyrics into phonemic representations during training… enables the model to **share phonological representations across languages**, significantly enhancing pronunciation accuracy for rare tokens without expanding the vocabulary size" | S12 §2 |
| **DiffRhythm 2** (S10) | Internal for EVALUATION: lyrics → IPA via a G2P tokenizer to compute PER | S10 §objective evaluation |
| **YuE** (S09) | NO phoneme surface; lyrics as text with `[verse]`/`[chorus]` labels; language support adjusted by **annealing-checkpoint mixing ratios** | S38 README point 2 |
| **Our live routes** (project) | `music_ace` typed lyrics; `music_lyria` `Lyrics:` prose convention; `music_elevenlabs` `composition_plan` — **none accepts IPA today** | architecture doc §2.2, read this session |

**Verdict on the hypothesis.** "Supported language" is a proxy for TWO things, and the evidence separates
them: **(a) phoneme/feature COVERAGE, which IS transferable** — S22/S23/S25/S26 in speech, S05 in singing, S12
by construction; and **(b) language-specific PROSODY, RHYTHM and STRESS, which is NOT** — S05's VS_E rising
5.56 % → 9.75 %, S12's own admission that "Romanization (50 % stochastic) may degrade prosody or lyric stress
patterns", and S01's decision to keep language tags on pinyin precisely to "distinguish pronunciation patterns
across languages". For Turkish this split is favourable on (a) and risky on (b): Turkish has **8 vowels and 21
consonants, no phonemic diphthongs and NO aspirated consonants** (S32, S34), and it LACKS /w/, /ŋ/, /θ/, /ð/,
/æ/ while adding /ɣ/ (S33) — i.e. its inventory is close to a SUBSET of the union of the 9 GTSinger languages
plus one segment, which is the best possible case for feature recombination. But Turkish is **agglutinative
with vowel harmony and word-final devoicing** (S32, S34) — a prosody/rhythm profile no trained singing model
has seen. **Prediction to be tested, not asserted: Turkish segment ACCURACY will transfer; Turkish syllable
TIMING and stress will not, and that is what phoneme-level duration conditioning (Axis 4) is for.**

# AXIS 3 — Speech-to-singing (STS) as the language-agnostic path

## 3.1 Five-part depth record — SVPT (S07) `[FULL]`

1. **Problem in the authors' framing.** "Speech-to-singing voice conversion (STS) task always suffers from
   data scarcity, because it requires paired speech and singing data. Compounding this issue are the
   challenges of content-pitch alignment and the suboptimal quality of generated outputs."
2. **Method.** Three-stage paradigm (semantic extraction → semantic-to-acoustic → waveform). Semantic tokens
   from **XLSR-53 layer 12** (chosen because layer 12 is "most relevant to pronunciation features"; layer 18 is
   more semantic) + k-means to K1 centroids. Acoustic tokens from a self-trained **SoundStream, 8 codebooks**,
   of which the **first 3** are modelled autoregressively and BigVGAN reconstructs 24 kHz. Two perturbations
   remove exactly what must not leak: (a) pitch/timbre corruption chain y = f_s(p_r(p_eq(y))) — formant shift
   ratio sampled from (1, 1.4), pitch shift (1, 2), pitch range (1, 1.5), plus a 10-filter parametric EQ;
   (b) **Pseudo Random Resampling** (Algorithm 1) with average segment length **l_r = 0.4 s**, scaling factors
   r_min = 0.5, r_max = 1.5. The l_r value is JUSTIFIED, not guessed: "on average there are about 3.7 phonemes
   per second… the average phoneme duration is about 0.27 seconds, and the minimum segment length in our
   setting is l_r × r_min = 0.4 × 0.5 = 0.2 seconds"; "any choice between 0.35–0.5 would work". Pre-perturbed
   **N_r = 20** times. Architecture: 20-layer global + 6-layer local multi-scale Transformer, patch size
   **P = 3**, 420.2 M parameters total, trained 6 days on 6× V100.
3. **Real numbers (English test set, Table 2).** GT (vocoder) LSD **2.512**, RCA 0.988, MOS-Q 4.13. Parekh
   2020: LSD 8.045 / RCA 0.842 / MOS-Q 3.01. Wu & Yang 2020: 6.913 / 0.896 / 3.15. AlignSTS: **5.519 / 0.941 /
   3.41**. SVPT: **5.213 / 0.967 / 3.61**; SVPT (Mandarin, in-language): **5.066 / 0.982 / 3.69**; SVPT
   (18-layer feat): 5.462 / 0.956 / 3.39. **SVS comparison (Mandarin, Table 3):** GT (HiFi-GAN) LSD 2.392 /
   RCA 0.992 / MOS-Q 4.27; DiffSinger **4.643 / 0.967 / MOS-Q 3.60 / MOS-S 3.30**; SVPT **4.750 / 0.971 /
   MOS-Q 3.56 / MOS-S 3.48**. Ablations: removing PRR costs CMOS-Q **−0.45**; removing pitch/timbre corruption
   costs CMOS-S −0.25; N_r = 1 costs CMOS-P −0.42.
4. **Stated limitations.** "Firstly, the training and inference procedure **only involves fine-grained F0
   contours, which may not be applicable in practice.** Secondly, utilizing language models incurs significant
   computational overhead, necessitating further experiments to ascertain whether such computational demands
   are justified…" And on SVS: "**Although SVPT does not match the overall quality of DiffSinger**, it offers
   insights into scaling up SVS models."
5. **Concrete application.** SVPT is the paper that proves the language-agnostic claim mechanically AND prices
   it. Its own explanation is the key sentence for our decision: "**STS models only map the syllables to the
   target rhythm and pitch frames, without regard to the semantic meanings. Therefore, as long as the two
   languages share partially similar phonemes, mutual promotion exists.**" That is the phoneme-inventory
   hypothesis stated by the authors themselves, and it is corroborated by their measured cross-lingual result:
   a model trained on 161.7 h Mandarin + 18.2 h English **beat English-trained baselines on the English test
   set**.

## 3.2 Does STS remove the language constraint, and what does it cost?

**It removes the TEXT constraint, not the language constraint, and the cost is measurable.**

- **Removes text:** S07 states it directly — "STS models do not need textual annotations"; the pipeline is
  "fully annotation-free". S08 (AlignSTS) is built for the "text-free situation".
- **Does NOT remove language:** the residual language dependence is the phoneme overlap (S07 §4.5) and the
  prosody profile. Neither paper tested a language outside {Mandarin, English}.
- **The measured quality cost, three ways.**
  1. **Against native SVS:** SVPT LSD **4.750 vs DiffSinger 4.643** and MOS-Q **3.56 vs 3.60** — i.e. STS is
     ≈0.1 LSD and ≈0.04 MOS behind a native score-conditioned synthesiser on the SAME language, and the
     authors concede the gap. Against ground truth the gap is far larger: **4.750 vs 2.392 LSD**, MOS-Q 3.56
     vs 4.27.
  2. **Cross-lingual STS vs in-language STS:** SVPT English **5.213** vs SVPT Mandarin **5.066** LSD;
     RCA 0.967 vs 0.982; MOS-Q 3.61 vs 3.69. So crossing the language boundary costs ≈0.15 LSD, ≈0.015 RCA and
     ≈0.08 MOS-Q — **small, and this is the single most encouraging number in the STS literature for our
     case.**
  3. **Against the 2026 frontier:** the whole STS family is now well behind score-conditioned SVS.
     SoulX-Singer (S01) reports English score-mode **WER 0.149 / SingMOS 4.303**, and its GT is WER 0.197 /
     SingMOS 4.441. TCSinger 2's STS style transfer (S03 Table 3) reports FFE **0.24**, Cos 0.89, MOS-Q 3.97,
     MOS-S 3.96 — versus GT (vocoder) FFE 0.06, MOS-Q 4.21.
- **A dependency that disqualifies STS as our PRIMARY path:** both S07 and S08 need a target **F0 contour**,
  and S07 names it as limitation #1. Our product's caller supplies tempo, key, time signature and structure —
  **not** an F0 contour. Generating an F0 contour to feed STS re-introduces exactly the melody-modelling
  problem STS was supposed to avoid. TCSinger 2's STS route needs only a SPEECH PROMPT for style (not a
  melody), which is a materially better fit, and its value is real: "enabling users who cannot sing to
  customize their singing voice using only speech prompts."

**Verdict:** STS is our **fallback and our voice-identity tool**, not the primary generator. It is the correct
mechanism for the architecture document's §6 contingency (route Turkish lyrics through `voice_vertex_tts` then
align them onto the bed) — and this research upgrades that contingency: instead of aligning TTS speech onto a
bed, use TTS speech as the **STS/timbre prompt** into a score-conditioned SVS model, which is a measured 2026
capability (S03 Table 3, S01 SVC).

---

# AXIS 4 — Melody-conditioned and score-conditioned control

**This is where the 2026 frontier moved, and it is directly relevant because our product exposes tempo, key,
time signature and structure.**

## 4.1 Five-part depth record — SoulX-Singer (S01) `[FULL]` — the recommended engine

1. **Problem in the authors' framing.** Prior scaled systems (Vevo2, YingMusic-Singer) "adopt a melody-driven
   synthesis paradigm and **do not provide note-level duration control**, which leads to two key limitations.
   First, melody extraction from existing songs is required, preventing song generation purely from musical
   scores and lyrics. Second, the absence of explicit note duration modeling makes syllable-level timing
   uncontrollable, resulting in temporal misalignment between the synthesized vocals and the original
   accompaniment. This severely limits practical usage in music production workflows."
2. **Method.** Non-autoregressive flow-matching DiT predicting mel, then a neural vocoder. A **Singing Content
   Encoder** fuses lyrics, note pitch, note type and F0. Note-level data representation: each note is a tuple
   of (text token, pitch class, **note type ∈ {1 = rest, 2 = lyric, 3 = slur}**). **Both** melodic inputs
   (discrete note pitch, continuous F0) pass **binary gating layers**; during training one of the two is
   randomly dropped, "during inference, the model can flexibly enable the corresponding gate to perform
   melody-based or score-based generation" — this is the mechanism that gives two control modes from one model.
   A **length regulator** expands note-type/pitch/text embeddings by each note's duration to the mel time
   scale and sums them element-wise, "explicitly enforcing note-to-mel alignment". Two-stage training:
   2–16 s segments with a NON-ADJACENT prompt (forces reliance on the conditions, not local continuity), then
   30–90 s concatenated segments with an ADJACENT prompt. Data pipeline: Mel-Band Roformer lead-vocal
   separation → Mel-Band Roformer de-reverberation → language ID (fine-tuned SenseVoiceSmall) → ASR
   (Paraformer for ZH/Cantonese, **Parakeet-TDT-0.6B-V2** for English) → **ROSVOT** note transcription;
   samples with insertion/deletion errors are DISCARDED and substitutions corrected against reference lyrics.
3. **Real numbers (its own tables).** GMO-SVS, English: SoulX-Singer score mode **WER 0.149 / SIM 0.926 /
   SingMOS 4.303**; melody mode 0.151 / 0.918 / FFE **0.036** / 4.323; TCSinger **0.410 / 0.879 / 3.662**;
   Vevosing 0.239 / 0.922 / 4.321; **GT 0.197 / — / 4.441**. Chinese: SoulX 0.065–0.069 vs GT **0.074** (i.e.
   at or below GT WER), StyleSinger 0.367, TCSinger 0.270, YingMusic-Singer 0.099. Zero-shot
   (SoulX-Singer-Eval, 50 unseen singers): SoulX score mode CN **WER 0.069 / SIM 0.922**, EN **0.129 / 0.914**;
   GT CN 0.089 / EN 0.208. **Cross-lingual (Mandarin prompt → English singing), Table 3:** GT WER **0.148**;
   TCSinger score 0.333 / SIM 0.789; Vevosing melody **0.717 / 0.877**; SoulX melody 0.122 / 0.866;
   **SoulX score 0.110 / SIM 0.898 / SingMOS 4.337**. Lyric-editing robustness: melody-based methods degrade
   (Vevosing EN 0.239 → 0.484) while **SoulX score mode degrades far less (0.149 → 0.213)** because it relies
   on the explicit score rather than the source melody. SVC variant: GMO-SVS EN WER 0.267, FFE 0.030.
4. **Stated limitations.** The paper is a technical report and states its language scope (three languages) and
   an ethics boundary on voice impersonation; it does NOT claim any language beyond Mandarin/English/Cantonese,
   and it reports that score mode has HIGHER FFE than melody mode (EN 0.164 vs 0.036) — i.e. score control
   trades pitch-contour fidelity for timing/pronunciation control.
5. **Concrete application.** This is the engine to run on our GPU instance. Its **score-control mode maps
   1:1 onto our request contract**: `tempo_bpm` + `key` + `time_signature` + `structure[].bars` compile to
   note (pitch, duration) pairs; `lyrics.text` compiles through G2P to per-note text tokens; `note type 3 =
   slur` is exactly how a Turkish syllable held over two notes must be expressed. And it gives us the
   **cross-lingual number to beat**: WER 0.110 with GT at 0.148.

## 4.2 How the rest of the frontier accepts melody/score — and what is measured about fidelity

| System | Melody/score interface | Measured control fidelity |
|---|---|---|
| SoulX-Singer (S01) | MIDI score OR F0 contour, gated; note type incl. slur; length regulator | FFE **0.036** (melody) / 0.164 (score) EN; RPA n/a |
| MPEcho (S06) | RMVPE-extracted F0 + IA-EiLM adapters, fused with phonemes | RPA **0.6241** / RCA 0.6344 at best config; phoneme-only collapses to RPA 0.0667 |
| TCSinger 2 (S03) | music scores (lyric + note) into BBC Encoder; **F0 supervision from the first block's output**; CFG scale **γ = 3** (γ=1 → CMOS-Q −0.26; γ=5 → −0.25) | FFE **0.21** parallel, 0.22 style control, **0.24** STS; GT (vocoder) 0.04–0.06 |
| STARS (S20) | outputs note onset/pitch/offset + phoneme boundaries (COnPOff, RPA) | BER **18.6**, IOU 80.9; beats MFA and SOFA |
| DiffRhythm (S10) | timestamp conditioning (its stated alignment mechanism) | PER 0.13; the paper says both DiffRhythm's and ACE-Step's fixes "come at the cost of reduced creativity or musicality" |
| Our routes today | NO note-level interface anywhere; `music_elevenlabs.composition_plan` per-section `duration_ms` is the finest control we have | architecture doc §3.1: `energy_curve.binding = "compiled_stepwise"` |

**The gap this closes.** The architecture document §3.6 records that MIDI upload cannot be honoured because
"MIDI appears in NO worker in this repository and on NO vendor surface researched on 2026-08-13", so MIDI is
rendered to audio and used as a reference — with the honest caveat "**What that does NOT give: note-exact
conditioning.**" **That limitation is now removable.** SoulX-Singer accepts symbolic MIDI natively
(score-control mode, S01 §2.2.3) under Apache-2.0 with released weights (S02, S03 of the register). Running it
on the GPU instance converts `references[].converted_from: "midi"` from a documented downgrade into a real
note-level control path — and it is the same mechanism that gives Turkish syllable timing.

# AXIS 5 — Measurement: how lyric intelligibility in SINGING is measured at the frontier, and the HUMAN FLOOR

**Bad news first, because it changes our contract:** the parent brief's working figure of **16.14 % PER as the
human/ground-truth floor** could **NOT be corroborated by any source found this session**, and the metric
family it belongs to is not what the frontier benchmark uses. **Jam-ALT does NOT use PER at all** — S14/S15/S16
define case-insensitive **WER**, a case-error rate, and F-measures for punctuation, parentheses, line breaks
and section breaks; the alt-eval toolkit adds a rule that for writing systems without spaces "each character
is considered as a separate word… making the WER equivalent to CER". So a PER threshold cannot be calibrated
against Jam-ALT numbers directly. Our 16.14 % figure remains **`[single-source, internal, UNVERIFIED
externally]`** and must be treated as one measurement of one instrument on one control set — not as the
field's floor.

## 5.1 What the ground-truth / human floor actually measures — every figure found, per source

| Source | Instrument | Material | The floor number | Exact wording / locator |
|---|---|---|---|---|
| **S14 Jam-ALT** | case-insensitive WER, alt-eval | the ORIGINAL JamendoLyrics transcripts scored against AudioShake's revision | **WER 11.1 %** (≈14 % for English and Spanish) | "the WER of 11.1 % (∼14 % for English and Spanish) **attests to the scale of our revisions**" — this is a HUMAN-vs-HUMAN transcript disagreement, i.e. an annotation-noise floor |
| **S17 MSS+ALT** | Whisper + RMS-VAD, Jam-ALT metrics | Jam-ALT original mixes | **20.35 % WER** (open-source SOTA); **14.98 %** on ground-truth vocal STEMS; 17.51 % stems/native | Table IV, read this session |
| **S01 SoulX-Singer** | Paraformer (ZH) / **Whisper-large-v3** (EN) | **real human singing recordings** (GroundTruth rows) | **CN WER 0.074–0.089; EN WER 0.197–0.208; cross-lingual set 0.148** | Tables 1, 2, 3 |
| **S05 Transinger** | Whisper | real human singing, Chinese | **WER 7.61 % (±1.40)**; ALL languages 8.35 % (±1.31) | Table 1 "Ground Truth" row |
| **S06 MPEcho** | SongPrep, Mandarin, **PER** | real songs (reference row) | PER not reported for real songs; **ACE-Step from-scratch 0.4348** is the only reference PER | Table 2 |
| **S18 SingMOS-Pro** | human MOS, ≥5 annotators/clip, separate **lyrics / melody / overall** dimensions | 578 ground-truth samples inside 7,981 clips | GT MOS distribution not extracted this session | `[PARTIAL]` — dataset card + abstract |
| **S03 TCSinger 2** | human MOS only (no WER/PER anywhere) | GT and GT(vocoder) | MOS-Q GT **4.56–4.58**; GT(vocoder) 4.21–4.36 | Tables 1–3 |

**The single most important measurement fact in this whole report:** **the human floor is LANGUAGE-DEPENDENT
and LARGE.** In S01, measured with the same protocol on the same benchmark, real human singing scores **WER
0.074 in Chinese and 0.197–0.208 in English** — a factor of **≈2.7**. That is not a model deficiency; it is the
instrument's behaviour on real singing in different languages. **Therefore a single global PER/WER threshold
for the Music Studio gate would be wrong by construction, and the architecture's `bar` field MUST be
per-language and calibrated from real human recordings in THAT language** — precisely what the architecture
document already demands (§2b.3 step 2) and which this evidence now quantifies.

## 5.2 PER versus WER in singing — which to use, on evidence

- **WER is what the singing benchmark ecosystem uses** (S14, S15, S16, S17) and what most SVS papers report
  (S01, S03 via MOS, S05).
- **PER is what full-song generation papers use** (S06 0.1865, S10 0.13, S11 14.85 %) precisely because it is
  **less brittle to homophones and to ASR vocabulary**, which matters when the singer is synthetic and the
  language is under-resourced. S05 states the necessary softening rule explicitly: "detections that match the
  correct word **or its homophones** were not counted as errors. Moreover, **if only a subset of the phonemes in
  a word is correctly detected, those correctly identified phonemes are also considered accurate.**"
- **Both are needed, and for a different reason each:** PER is the sensitive number for a language whose ASR
  is weak (Turkish), and WER is the number comparable to the published frontier. Our response contract already
  has room for both (`lyrics_verification.per` + `protocol`).
- **The measurement chain matters more than the metric choice — measured.** S17 proves that changing only the
  SEGMENTATION (RMS-VAD instead of Whisper's native long-form algorithm) moves Jam-ALT WER from **23.02 % to
  20.35 %**, and that source separation moves the stem-level result to **14.98 %**. It also names a failure
  mode our gate must not misread: "Even with perfect vocal isolation, Whisper systematically fails to
  transcribe non-lexical vocables (like 'ooh' and 'ah') and backing vocals, **with over half of such words
  being deleted regardless of separation quality**." A Music Studio song full of "ooh"s would therefore score
  as unintelligible when it is correct.

## 5.3 Forced alignment on singing — MFA is NOT the instrument, with three independent measurements

| Source | MFA result | Better instrument | Delta |
|---|---|---|---|
| **S06 MPEcho/Phonsa** | MAE **233.9 ms**, PCO 0.767, PCAS 0.680 | **Phonsa** | MAE **32.6 ms** — **7.2× better**; PCO 0.965 |
| **S20 STARS** | baseline for lyric alignment (BER/IOU) | **STARS** (also beats **SOFA**, a singing-specific aligner) | STARS BER 18.6 / IOU 80.9 |
| **S21 (MFA-on-singing study)** | "the recognition accuracy of samples with high accuracy is relatively low, **only 10.08 %**… the recognition effectiveness of the MFA open-source model for singing audio is not ideal" | MFA **retrained** on manually calibrated singing TextGrids | "significant improvement… before and after training" |
| **S05 Transinger** (corroborating practice) | uses MFA only "with music-adapted acoustic models **to initialize** temporal boundaries", then **three certified music annotators cross-validate in Praat** | manual refinement | — |

**Verdict:** using off-the-shelf MFA as the timing instrument for a Turkish singing gate would be an
instrument-not-controlled violation of this project's MEASUREMENT LAW. The lawful choices are Phonsa/STARS-class
singing-specific aligners, or MFA **retrained** on calibrated singing material, with a control set proving the
aligner can both agree and disagree.

## 5.4 SingMOS / SingMOS-Pro — the perceptual instrument, and why it matters here

S18 (arXiv 2510.01812, ICASSP 2026): **7,981 clips from 41 models across 12 datasets**; 3,425 SVS + 1,307 SVC +
2,671 SVR + **578 ground-truth**; each clip rated by **≥5 professional annotators**; the extension annotates
**three separate dimensions — lyrics score, melody score, overall MOS** — which is exactly the decomposition
our product claims to sell. Coverage is **Chinese and Japanese only, 11.15 h, mostly 16 kHz**. Predictors are
released (`singmos_pro` on wav2vec2-large-ll60k; `singmos_v1` on wav2vec2-base-960; repo v1.1.2, 2025-11-29 —
S19), and the preview version was the Singing Track of the **ASRU 2024 VoiceMOS Challenge** (an
evaluation-campaign result, Axis 7). S01 uses SingMOS AND **Sheet-SSQA** from MOS-Bench as its two learned
quality metrics.

**Honest limit for us, stated in the same sentence as the recommendation: SingMOS-Pro contains NO Turkish and
no Indo-European/Turkic material at all, so a SingMOS number on a Turkish song is an out-of-domain prediction
and must be labelled as such** — it can rank our own candidates against each other, but it cannot be quoted as
an absolute quality claim.

## 5.5 The measurement protocol this evidence supports (each element with its basis)

1. **Separate vocals first** — S17: separation improves substitution rate and enables the segmentation gain;
   S01's own data pipeline uses two-stage Mel-Band Roformer separation + de-reverberation.
2. **Derive segment boundaries from vocal activity, not from the ASR's own long-form heuristic** — S17,
   23.02 % → 20.35 % WER on Jam-ALT from this change alone.
3. **Transcribe with a per-language-appropriate ASR, named in the artefact** — S01 uses Paraformer for
   Mandarin and Whisper-large-v3 for English; for Turkish this is an open choice and must be selected with a
   control (Axis 7 gap).
4. **Compute BOTH PER (primary, homophone- and partial-credit-softened per S05's stated rule) and
   case-insensitive WER (comparability, per S14/S16 alt-eval)**.
5. **Calibrate the bar per language from ≥5 real human sung recordings in that language** — justified by the
   S01 CN 0.074 vs EN 0.197 spread (factor 2.7) and by the S14 human-vs-human floor of 11.1 %.
6. **Run the three negative controls the architecture already specifies** (instrumental → no words; wrong
   lyric → FAIL; human recording → PASS) — and add a fourth from S17: **a non-lexical-vocable control**
   ("ooh"/"ah" material must not be scored as a lyric failure).
7. **Report the protocol with the number** — separator, VAD, ASR, phonemiser, language, and the
   ground-truth control value, exactly as the response contract's `lyrics_verification.protocol` block already
   provides.

# AXIS 6 — Reproducible and open assets: exact repository, licence, provenance

We can run models on a Google Cloud GPU instance, so licence terms are load-bearing, not academic. **Licence
terms that would forbid commercial use are flagged in bold.**

| Asset | Repository / host | Licence | Provenance signals read this session | Commercial use |
|---|---|---|---|---|
| **SoulX-Singer** (code + SVS/SVC weights + preprocessing models) | `github.com/Soul-AILab/SoulX-Singer`; weights `huggingface.co/Soul-AILab/SoulX-Singer` and `…/SoulX-Singer-Preprocess` | **Apache 2.0** — repo metadata field "License: Apache License 2.0" AND README §License: "We use the Apache 2.0 license. Researchers and developers are free to use the codes and **model weights** of our SoulX-Singer." | created **2026-02-06**; **888 stars / 137 forks / 32 open issues** at read time; HF Space demo live 2026-02-09; MIDI editor Space 2026-02-08; SVC weights `model-svc.pt` released 2026-02-1x | **YES** (Apache 2.0), subject to the repo's ethical usage disclaimer on impersonation/consent |
| **TCSinger 2** | `github.com/AaronZ345/TCSinger2` | licence not established this session — `[UNVERIFIED]` | PyTorch impl of the ACL 2025 paper; official code linked from the paper | **UNKNOWN — must be read before use** |
| **GTSinger** (the 9-language, 80 h corpus — the ONLY multilingual singing corpus at this scale) | via the NeurIPS 2024 paper / OpenReview | **CC BY-NC-SA 4.0 — NON-COMMERCIAL.** Stated twice, independently: S03 Appendix B "We use all these datasets under the CC BY-NC-SA 4.0 license" and S20 "We use the dataset under the CC BY-NC-SA 4.0 license" | 20 singers, 1,366 songs, 80.59 h, realistic music scores | **NO — forbids commercial use.** Usable for RESEARCH and for CALIBRATION experiments only; a commercial model must not be trained on it |
| Opencpop / M4Singer / OpenSinger / PopBuTFy | per-dataset | Opencpop/M4Singer/GTSinger bundled under **CC BY-NC-SA 4.0** in S03's statement | Chinese/English, 5–85 h each | **NO for the CC BY-NC-SA members** |
| **alt-eval** (the Jam-ALT metric implementation) | `github.com/audioshake/alt-eval` | licence not read this session — `[UNVERIFIED]` | AudioShake official; implements WER/case-WER + P/B/L/S F-scores; uses `sacremoses` | must be read before shipping |
| **Jam-ALT dataset** | `huggingface.co/datasets/jamendolyrics/jam-alt` (rev v1.4.0) | not read — `[UNVERIFIED]`; audio is Jamendo-derived | 79 songs, 4 languages; line-level timings added by the ICME 2025 workshop paper | evaluation use; verify before redistribution |
| **MUSDB-ALT** | published with S17 | not read — `[UNVERIFIED]`; MUSDB18 lineage | "first dataset of long-form lyric transcripts following the Jam-ALT guidelines **for which vocal stems are publicly available**" | evaluation |
| **SingMOS / SingMOS-Pro** predictor + dataset | `github.com/South-Twilight/SingMOS`; `huggingface.co/datasets/TangRain/SingMOS-Pro` | not read — `[UNVERIFIED]` | v1.1.2 (2025-11-29); 7,981 clips; models on wav2vec2-large-ll60k / base-960 | verify |
| **ACE-Step 1.5** | `ace-step.github.io/ace-step-v1.5.github.io/` (project page; repo not opened this session) | not established — `[UNVERIFIED]` | claims **<4 GB VRAM**, ~2 s per full song on A100, "<1x s on an RTX 3090", 50+ languages, local personalisation | verify |
| **DiffRhythm v1.2** (base 1m35s / full 4m45s / vae) | `github.com/ASLP-lab/DiffRhythm` + 5 HF model cards | not read — `[UNVERIFIED]` | v1.2 launched 2025-05-09; training code released; English + Chinese only | verify |
| **YuE** | `github.com/multimodal-art-projection/YuE` | not read — `[UNVERIFIED]` | LLaMA2-based; per-language annealing checkpoints; **new language for a 40 B-token fine-tune budget** | verify |
| **Turkish Şarkı Vocal Dataset** | Zenodo DOI **10.5281/zenodo.1283350** | not read — `[UNVERIFIED]` | MTG/UPF; 12 performances of 11 compositions (8 female, 4 male); **phrase-aligned lyrics in Praat TextGrid**; citation required (Dzhambazov & Serra, SMC 2015) | verify — it is the only Turkish sung-and-aligned material found |
| **Turkish Makam Acapella Sections Dataset** | Zenodo record **1287656**; `github.com/MTG/turkish-makam-acapella-sections-dataset` | not read — `[UNVERIFIED]` | **clean a cappella, no accompaniment**, semi-professional singers, recorded in Istanbul June 2014, "**Annotated on word and phoneme level**", TextGrid | verify — this is the highest-value Turkish asset for calibration |
| **ROSVOT / SOFA / RMVPE / Mel-Band Roformer / Parakeet-TDT-0.6B-V2 / SenseVoiceSmall / Paraformer** | HF + GitHub, all named in S01/S06/S20 | not read individually — `[UNVERIFIED]` | these are the exact preprocessing components the frontier uses; SoulX ships its own preprocessing bundle | verify per component |

**The one asset decision this axis settles.** SoulX-Singer is the only system in the corpus that is
simultaneously (a) the measured 2026 SOTA on cross-lingual singing WER (0.110), (b) score-conditioned with
note-level duration control, (c) shipped with **open weights under Apache 2.0** including a commercial grant on
the weights themselves, and (d) accompanied by its own preprocessing stack. **The trap in the same breath:**
Apache-2.0 code and weights do NOT launder the training data, and the largest multilingual singing corpus in
the field (GTSinger) is CC BY-NC-SA. SoulX states its 42,000 h came from its own pipeline over songs, not from
GTSinger (which it uses only for EVALUATION, explicitly excluded from training) — but the provenance of those
42,000 h is not disclosed in the report, and that is a **legal-review item, not a technical one**.

---

# AXIS 7 — THE DARK: sources where people do not look (mandatory axis)

| Kind of dark source | What was found, and why it matters |
|---|---|
| **Non-English publication** | **S33**, a Turkish-language journal article (dergipark.org.tr) giving the exact Turkish/English phoneme-inventory delta: Turkish has 21 consonants vs English 24; **Turkish lacks /w/, /ŋ/, /θ/, /ð/ and /æ/; English lacks /ɣ/**; Turkish `c` = /dʒ/ and `j` = /ʒ/. This is the single most decision-relevant Turkish fact in the whole report and it exists only in a Turkish-language source. |
| **Specialist regional corpora nobody cites in SVS papers** | The **MTG/UPF CompMusic Turkish makam** family (S28–S31): 12 a cappella performances of 11 compositions, **19 minutes total, 732 words**, phrase boundaries released as a contribution, **6 recordings additionally annotated with MIDI notes** placed deliberately "on the time instant, at which the pitch becomes steady", and a GitHub repo whose README states word- AND phoneme-level annotation. Zero SVS papers in this corpus cite them. |
| **Issue trackers / checkpoint notes** | **YuE issue #12** is named in the official README as the place where "the default top language distribution during the annealing phase is revealed", and "a language ID on a specific annealing checkpoint indicates that we have adjusted the mixing ratio to enhance support for that language" — i.e. the practical recipe for adding a language to an open song model is a *published annealing-mix change*, documented in an issue rather than a paper. |
| **Repository changelogs** | SoulX-Singer's dated release log (SVC weights, HF Space, MIDI editor, all within February 2026) and DiffRhythm's "2025.5.9 DiffRhythm-v1.2 Official Launch! Version 1.2 largely resolves repetition and omission issues" — omission being exactly the lyric-loss failure our gate measures. SingMOS's version log (v1.1.0 trained on SingMOS-Pro, 2025-11-06). |
| **Stated-limitation lists (self-reported negatives)** | ACE-Step 1.5's own numbered weakness list, verbatim: "**Output Inconsistency: Highly sensitive to random seeds and input duration, leading to varied 'gacha-style' results**"; "**Vocal Quality: Coarse vocal synthesis lacking nuance**"; "Control Granularity: Needs finer-grained musical parameter control". This corroborates, from the vendor's own page, this project's measured finding that a seed is not a re-render promise. |
| **Reviewer/analysis commentary on gaps** | The emergentmind analysis of ACE-Step 1.5 names the exact open question our decision faces: "Romanization (50 % stochastic) **may degrade prosody or lyric stress patterns**; quantify pronunciation accuracy and intelligibility across 50+ languages… **Evaluation uses only English/Chinese prompts; extend to low-resource languages and script families** with explicit metrics for alignment, intelligibility, and lyric timing." |
| **Evaluation campaigns** | **VoiceMOS Challenge 2024 (ASRU) Singing Track** used SingMOS as its dataset (S18/S19) — the only recurring community evaluation for singing quality found. **No Singing Voice Conversion Challenge edition was located this session** for 2025/2026; recorded as a gap, not as an absence (R18.11). |
| **Workshop papers** | The ICME 2025 workshop paper that added **line-level timings** to Jam-ALT (S15, and it is S17's own venue) — a detail invisible from the main ISMIR citation but decisive if we want line-level intelligibility instead of song-level. |
| **Cross-domain shared task** | **IWSLT 2026 low-resource track** (S37) explicitly reframes the problem as "explicitly multilingual systems that can handle speech from as many diverse languages as possible… general recipes aimed at improving speech translation broadly for a wide typology of languages" — the same architectural posture this report recommends for singing. |
| **A cited-but-unread frontier item** | "Latent flow matching for expressive singing voice synthesis", Yun & Choi, **arXiv 2601.00217**, 2026 — surfaced only as reference [30] inside MPEcho. Newer than everything except MPEcho itself. **`[UNVERIFIED]` — not opened this session; the highest-priority next read.** |

# CROSS-VERIFICATION LEDGER

Every load-bearing claim, its type (R10.1), and the ≥3 independent sources supporting it. Independence is
judged by producer/dataset/method (R7.2), so a paper and its own repository are ONE family.

| # | Claim (scope stated) | Type | Source A | Source B | Source C | Status |
|---|---|---|---|---|---|---|
| C01 | **No song-generation system or singing corpus in the 2024–2026 corpus covers Turkish for SINGING.** | PRIMARY FACT | S01 (3 languages, explicit) | S03 (9 languages, explicit list) | S05 (4), S09 (5+), S10/S35 (2), S18 (2), S06 (1) | **VERIFIED, 7 independent families** |
| C02 | **Explicit phoneme-level conditioning with per-phoneme duration massively improves lyric intelligibility in song generation.** | PRIMARY FACT | S06 (PER 0.4562 → 0.1865; word-level variant 0.7125) | S01 (score mode attains the lowest WER; "MIDI-based timing constraints help stabilize pronunciation and rhythm, particularly for complex phonemes") | S03 (BBC Encoder built on phoneme+note modelling; ablation w/o BBC costs CMOS-Q −0.36) | **VERIFIED, 3 independent** |
| C03 | **A shared phoneme/feature representation (IPA or phonological features) enables synthesis in languages absent from training.** | PRIMARY FACT | S05 (unseen-English zero-shot experiment in SINGING) | S22 (binary phonological features "enabling zero-shot multilingual synthesis") | S25 (unseen languages "generally intelligible" with 100 h) + S23 (PHOIBLE 37-feature mapping rule) + S26 | **VERIFIED, 4+ independent; SINGING evidence is single-family (S05)** |
| C04 | **Multilingual training IMPROVES in-language intelligibility rather than diluting it.** | PRIMARY FACT | S05 (CN WER 35.64 % → 22.77 %, p<0.001) | S07 ("despite our model being trained primarily on data in Mandarin, it still outperforms the baselines on the English test set… mutual promotional effect") | S12 (stochastic Romanisation "significantly enhancing pronunciation accuracy for rare tokens") | **VERIFIED, 3 independent** |
| C05 | **The human/ground-truth intelligibility floor is language-dependent and far above zero.** | PRIMARY FACT | S01 (GT WER CN 0.074–0.089 vs EN 0.197–0.208, same protocol) | S05 (GT WER 7.61 % CN / 8.35 % all) | S14 (human-vs-human transcript WER 11.1 %, ~14 % EN/ES) | **VERIFIED, 3 independent** |
| C06 | **MFA is not an adequate forced aligner for singing without retraining.** | PRIMARY FACT | S06 (MAE 233.9 ms vs Phonsa 32.6 ms) | S20 (STARS beats MFA and SOFA on BER/IOU) | S21 ("only 10.08 %… not ideal") + S05 (uses MFA only to initialise, then 3 annotators in Praat) | **VERIFIED, 4 independent** |
| C07 | **STS removes the TEXT requirement but is measurably behind native score-conditioned SVS.** | PRIMARY FACT | S07 (LSD 4.750 vs DiffSinger 4.643; "does not match the overall quality of DiffSinger") | S01 (score-mode EN WER 0.149; SVC variant degrades to 0.267) | S03 (STS FFE 0.24 vs parallel 0.21; GT vocoder 0.06) | **VERIFIED, 3 independent** |
| C08 | **Melody/pitch conditioning and phoneme conditioning must be used TOGETHER; either alone fails.** | PRIMARY FACT | S06 (phoneme-only: PER 0.2292 but RPA 0.0667 and Audiobox CE 4.17; combined: PER 0.1865, RPA 0.5764) | S01 (dual gating; F0 supervision; score mode has higher FFE, melody mode lower WER-stability under editing) | S03 (F0 supervision ablation: removing it degrades CMOS-Q, -S and -C simultaneously) | **VERIFIED, 3 independent** |
| C09 | **Source separation + vocal-activity-derived segmentation materially improves ALT before any model change.** | PRIMARY FACT | S17 (23.02 % → 20.35 % WER; stems 14.98 %) | S01 (two-stage Roformer separation + de-reverb in its own data pipeline) | S09 ("Vocal-only tracks consistently achieve lower ΔWER compared to mixtures") | **VERIFIED, 3 independent** |
| C10 | **SoulX-Singer is Apache-2.0 including model weights.** | PRIMARY FACT / SOURCE CLAIM | S02 repo metadata "License: Apache License 2.0" | S02 README §License verbatim grant on "codes and model weights" | third-party summary confirming Apache 2.0 + commercial use | **VERIFIED but `[single-source official]`** — A and B are the SAME family (the repo); the third is not authoritative. **The LICENSE file itself must be opened before any commercial deployment.** |
| C11 | **GTSinger — the only 9-language singing corpus — is CC BY-NC-SA 4.0 (non-commercial).** | PRIMARY FACT | S03 Appendix B verbatim | S20 verbatim, different authors/venue | — | **`[2-source]`, both citing the same upstream licence; treated as BINDING because both are independent users stating the same restriction** |
| C12 | **Turkish's phoneme inventory is small (8 vowels / 21 consonants), has no phonemic diphthongs and no aspirated consonants, and lacks /w/ /ŋ/ /θ/ /ð/ /æ/ while adding /ɣ/.** | PRIMARY FACT | S32 (8 vowels, 21 consonants, no diphthongs, tabulated IPA per vowel) | S34 (peer-reviewed: "eight systematic vowels and 21 consonants… do not use aspirated sounds") | S33 (Turkish-language source: the exact missing/extra segment list) | **VERIFIED, 3 independent** |
| C13 | **Adding a language to an open song model is a bounded fine-tune, not a retrain.** | PRIMARY FACT | S09 ("fine-tuning to multiple languages (Chinese, Korean, Japanese) within a **40 B-token budget**"; JA lyrics-following 70 %) | S38 (annealing-mix ratios per language, documented in issue #12) | S06 (the whole PER gain came from a **12.1 M-parameter** phoneme adapter on a frozen backbone) | **VERIFIED, 3 independent** |
| C14 | **PER, not WER, is the metric of choice for song-generation lyric accuracy in 2025–2026 papers.** | SOURCE CLAIM | S06 (PER) | S10 (PER 0.13, Qwen3 ASR + G2P→IPA) | S11 (PER 14.85 %) | **VERIFIED, 3 independent (but see contradiction X2: the ALT benchmark ecosystem uses WER)** |
| C15 | **Jam-ALT does not define a PER metric.** | PRIMARY FACT | S14 (metric list: WER, case error, P/B/L/S F-measures) | S16 (alt-eval implementation: WER, case-sensitive WER, P/R/F for punctuation, parentheses, line breaks, section breaks) | S15 (benchmark page: "Apart from the classical word error rate… metrics that take into account letter case, punctuation and line/section breaks") | **VERIFIED, 3 within one provenance family (AudioShake) — flagged `[single-family]`; it is the definitional authority for its own benchmark** |
| C16 | **Turkish sung, phoneme-annotated material exists but is tiny (~19 minutes).** | PRIMARY FACT | S30 (12 a cappella performances, 11 compositions, "total duration of 19 minutes", 732 words) | S29 (acapella sections dataset, same recordings, word+phoneme annotation) | S28 (Şarkı vocal dataset, 12 performances, phrase-level TextGrid) | **VERIFIED, 3 records of one research family (MTG/UPF) — flagged `[single-family]`** |

---

# CONTRADICTION LEDGER

Contradictions are preserved with both positions, never averaged (R10.2).

| ID | Position A | Position B | Resolution status |
|---|---|---|---|
| **X1** | **S05 prose:** decomposing IPA into letters + diacritics "further improves cross-language performance… substantial application value of separating IPA phonemes." | **S05's OWN Table 2:** `Split (L+D)` PER **9.219 %** vs `Merged L&D` **1.127 %** (8× worse), PRR 22.65 % vs 3.105 % — while Split is BETTER on F0-RMSE (6.4204 vs 7.4398), MSD (59.2 vs 75.1), VS_E (12.86 % vs 16.3 %) and SA (15.89 % vs 9.01 %). | **UNRESOLVED — preserved.** Candidate explanations: transposed columns, or PER/PRR defined as rates-where-higher-is-better (the paper defines PRR as a *Recognition Rate*). **Consequence: the DIRECTION of the decomposition effect is `[UNVERIFIED]` and must be measured on our own material before it becomes a design commitment.** Both readings are recorded in the design so neither is silently chosen. |
| **X2** | Song-generation papers standardise on **PER** (S06, S10, S11) and SVS papers on **WER** (S01, S05). | The dedicated ALT benchmark ecosystem standardises on **WER + formatting F-measures and explicitly has no PER** (S14, S15, S16). | **RESOLVED BY SCOPE, both kept.** They measure different objects: PER scores a GENERATED vocal against a KNOWN target lyric (our case); Jam-ALT WER scores a TRANSCRIPTION of real music against a human reference. **Our gate must report both and name which is which** — quoting a PER against a Jam-ALT WER figure would be the "adjacent property" error banned by name in this project. |
| **X3** | **S07:** STS is worth it — SVPT beats English-trained STS baselines while trained mostly on Mandarin, and "as long as the two languages share partially similar phonemes, mutual promotion exists." | **S07's own conclusion:** "Although SVPT **does not match the overall quality of DiffSinger**" — i.e. the same paper prices its approach below native SVS; and S01's 2026 numbers put the whole STS family further behind. | **RESOLVED, both kept.** STS wins on *language-agnosticism* and loses on *quality*. Hence STS is our fallback/voice-identity path, not the primary generator (Axis 3 verdict). |
| **X4** | **ACE-Step 1.5 project page:** "strict adherence to prompts across **50+ languages**". | **The same paper's evaluation** uses only English/Chinese prompts, and its own limitation list includes "Multilingual Lyrics Compliance" as an area still being improved plus "Vocal Quality: Coarse vocal synthesis lacking nuance". | **RESOLVED as a capability-vs-evidence gap.** "50+ languages" is a SCHEMA-class claim, not a generation-proven one. This is exactly the "a printed enum is never capability evidence" law of this project. **Turkish must not be assumed supported because a page says 50+.** |
| **X5** | **S07** justifies l_r = 0.4 s from a measured 3.7 phonemes/second average in ITS corpus (Mandarin/English). | Turkish is agglutinative with vowel harmony and different syllable timing (S32, S34) — the phoneme-rate premise behind 0.4 s is not established for Turkish. | **UNRESOLVED — recorded as a parameter that must be re-derived per language, never copied.** (Mandate Clause 4: no unsourced value.) |
| **X6** | **S01** reports its GT English WER as **0.197–0.208** on real human singing. | **S05** reports GT WER **7.61 %** and **S14** reports a human-vs-human floor of **11.1 %**. | **RESOLVED as instrument+material dependence, all three kept.** Different ASR (Whisper-large-v3 vs Whisper vs human), different material (pop multitrack stems vs studio GTSinger vs Jamendo mixes), different language mixes. **This is the direct evidence that a threshold must be calibrated against OUR OWN chain, never imported.** |

---

# HONEST LIMITS — what could not be verified this session, and why

1. **No Turkish SUNG-GENERATION measurement exists in any source found.** Every Turkish source located is
   speech phonology (S32–S34) or lyrics-to-audio ALIGNMENT on ~19 minutes of makam a cappella (S28–S31). The
   project's own single Lyria-3 datapoint (7 of 8 dictated words; `çal` → `çota`/`çalıyma`) therefore remains
   the ONLY Turkish singing measurement in existence for our purposes, n = 1.
2. **The 16.14 % PER human floor could not be corroborated or refuted.** No external source found this session
   reports a PER floor for human singing in any language. It stays `[single-source, internal]`.
3. **X1 is unresolved** and it is the most decision-relevant contradiction in the report (see above).
4. **Licences NOT read at the primary file this session:** TCSinger 2, alt-eval, Jam-ALT dataset, MUSDB-ALT,
   SingMOS/SingMOS-Pro, ACE-Step 1.5 repo, DiffRhythm, YuE, and both Zenodo Turkish datasets. Only
   SoulX-Singer's licence was read as repository metadata + README grant, and even there **the LICENSE file
   body was read only as an Apache-2.0 boilerplate excerpt from a search capture, not opened from the repo**.
5. **arXiv 2601.00217** (Latent flow matching for expressive SVS, 2026) was discovered as a citation and NOT
   opened. It is newer than every source here except MPEcho. `[UNVERIFIED]`.
6. **SingMOS-Pro's ground-truth MOS distribution** was not extracted (the paper was read `[PARTIAL]`), so the
   perceptual floor per dimension (lyrics / melody / overall) is not quantified here.
7. **No Singing Voice Conversion Challenge 2025/2026 edition was located.** Reported as `NOT FOUND IN THE
   SEARCHED SCOPE`, not as non-existence (R18.11).
8. **SoulX-Singer's 42,000 h training-data provenance is not disclosed** in its technical report. Legal review
   is required before commercial deployment; this is not a technical gap I can close by reading more papers.
9. **Nothing in this report is a measurement I made.** Every number is a number the cited authors report,
   read from the captured primary text this session. No audio was generated, no model was run, no PER was
   computed. **The Turkish numbers this decision needs do not exist yet and must be produced by us.**
10. **Search-tool mediation:** primaries were read from the search tool's full-page text captures written to
    disk, then archived. For the five `[FULL]` academic primaries this included the complete body and result
    tables; figures and some appendix material are not present in text captures, and any claim that would
    depend on reading a FIGURE is not made here.

# APPLICATION TO THE MUSIC STUDIO DECISION

**The committed recommendation, in one sentence:** engineer an uncovered language by owning the
**phonetic-and-timing layer** ourselves and rendering the vocal on an **open-weight, score-conditioned SVS
model on our GPU instance**, mixed against a separately generated instrumental bed — because the measured
2026 evidence shows lyric intelligibility is governed by phoneme representation and phoneme timing, not by a
vendor's language list, and because the one system that is simultaneously SOTA on cross-lingual singing WER
and Apache-2.0 with open weights exists as of 2026-02-08.

## The mechanism, element by element, with the measured basis for each

| # | Element | What it does | The measured basis (this session) |
|---|---|---|---|
| **A1** | **`lyrics.script` becomes a real IPA/phoneme layer** — G2P per language → IPA, with each phoneme carried as **base letter + diacritic set** (not one atomic token), tone/word-accent diacritics dropped, SP/AP symbols for silence and aspiration | makes an unseen inventory COMPOSITIONAL instead of out-of-vocabulary | S05 (the whole method + the CN 22.77 % vs 35.64 % gain, p<0.001); S22/S23/S25/S26 in speech; S12's Romanisation rationale. **Direction of the letter/diacritic SPLIT is `[UNVERIFIED]` per X1 — implement BOTH encodings behind one flag and let our own measurement choose** |
| **A2** | **A phoneme-inventory COVERAGE score, computed not asserted** — map the target language's inventory to PHOIBLE's 37 binary features, compute per-phoneme nearest-neighbour distance to the engine's trained inventory, and store the score in the language registry as the predictor of expected quality | replaces "is it on the vendor list?" with a computable number, which is what makes the registry a BUILD BACKLOG rather than a filter | S23 (the exact 37-feature nearest-neighbour rule, with cosine tie-breaking on adjacent-phoneme distributions); S27 (PHOIBLE 2.0: 3,183 segment types, IPA as pivot, features for every phoneme); for Turkish the delta is already known: lacks /w/ /ŋ/ /θ/ /ð/ /æ/, adds /ɣ/ (S33, C12) |
| **A3** | **Phoneme-level DURATION conditioning via a length regulator** — the note/section plan compiles to per-phoneme onsets/offsets, never to word-level timings | this is the single largest measured intelligibility lever in the corpus | S06: PER **0.4562 → 0.1865** with phoneme+melody; **word-level (JAM-style) = 0.7125**, i.e. worse than nothing. S01's length regulator "explicitly enforcing note-to-mel alignment" |
| **A4** | **NEVER phoneme-only: melody/pitch conditioning stays on** | prevents the measured collapse of musicality when rigid timing fights free pitch | S06: phoneme-only RPA **0.0667**, Audiobox CE 4.17 vs 6.97 combined; S03's F0-supervision ablation; S01's dual gating |
| **A5** | **Primary engine: SoulX-Singer score-control mode on the GPU instance** (MIDI notes + lyrics; note type 3 = slur for held Turkish syllables) | gives note-exact conditioning, removes the §3.6 "MIDI is only a reference" downgrade, and is the measured cross-lingual leader | S01: cross-lingual WER **0.110** (GT 0.148), SIM 0.898, SingMOS 4.337; lyric-edit robustness 0.149 → 0.213 vs melody-based 0.239 → 0.484; Apache-2.0 weights (S02, C10 — **licence file to be opened before commercial use**) |
| **A6** | **Fallback / voice-identity path: speech prompt → STS style transfer**, using `voice_vertex_tts` (Turkish, generation-proven in this repo) as the prompt rather than as the final vocal | keeps the architecture document's §6 contingency but upgrades it from "align TTS onto a bed" to a 2026-measured capability | S03 STS style transfer FFE **0.24**, Cos 0.89, MOS-S 3.96 ("enabling users who cannot sing to customize their singing voice using only speech prompts"); S07's language-agnosticism, priced at LSD 4.750 vs DiffSinger 4.643 |
| **A7** | **Route the instrumental bed and the vocal SEPARATELY, then mix** | the existing typed controls (`composition_plan`, ACE-Step duration/tags) stay authoritative for the bed while the vocal gets note-level control | S06 is precisely an adapter over a frozen LTS backbone (12.1 M params) — the two-path architecture is what the frontier itself does |
| **A8** | **The intelligibility gate: separate → RMS-VAD-style vocal-activity segmentation → per-language ASR → BOTH softened PER and case-insensitive WER** | each stage is a measured improvement, not a habit | S17: 23.02 % → **20.35 %** from segmentation alone; **14.98 %** on stems; S05's softening rule (homophones + partial phoneme credit); S16 for WER comparability |
| **A9** | **The bar is PER-LANGUAGE and calibrated from ≥5 real human sung recordings in that language** — never one global threshold | a global threshold is wrong by construction | S01: same protocol, GT WER **0.074 (CN) vs 0.197–0.208 (EN)** — factor ≈2.7; S14 human-vs-human 11.1 %; X6 |
| **A10** | **Four negative controls, all of which must be able to FAIL** — human recording PASSES, instrumental yields no words, wrong lyric FAILS, and **non-lexical vocables ("ooh"/"ah") do NOT count as lyric failure** | an instrument without a failing control is banned by this project's MEASUREMENT LAW | S17: "over half of such words being deleted regardless of separation quality"; the first three are already in the architecture (§2b.3) |
| **A11** | **The aligner is Phonsa/STARS-class, or MFA RETRAINED on calibrated singing — never off-the-shelf MFA** | off-the-shelf MFA on singing is a broken instrument, measured three ways | S06 MAE **233.9 → 32.6 ms**; S20 (beats MFA and SOFA); S21 ("only 10.08 %") |
| **A12** | **Turkish calibration corpus: the MTG/UPF makam a cappella set (word- AND phoneme-level annotation) + our own commissioned recordings** | it is the only Turkish sung, phoneme-annotated material that exists — and it is ~19 minutes, so it seeds the gate but cannot train a model | S29/S31 (phoneme-level annotation, clean a cappella); S30 (19 min, 732 words, 6 recordings with MIDI); S28 (phrase-aligned TextGrid) |
| **A13** | **If a language still misses the bar after A1–A11: a bounded fine-tune, not a shrug** | adding a language is a measured, budgeted operation | S09 (**40 B-token** budget for CN/KO/JA; JA lyrics-following 70 %); S38 (annealing mixing-ratio recipe); S06 (12.1 M-parameter adapter) — **and GTSinger may NOT be used for a commercial fine-tune (C11, CC BY-NC-SA)** |
| **A14** | **The registry stores the coverage score, the measured PER, the bar, the protocol and the date per language; the API enum is GENERATED from it by import** | keeps the two lists in agreement BY IMPORT, as the architecture already requires | architecture doc §2b.3 step 4, read this session; Supreme Law prohibition 6 (two lists kept in agreement by discipline is forbidden by name) |

## What this changes in the architecture document (the application ledger)

| Architecture location | Current state (read this session) | Change this research requires |
|---|---|---|
| §2b.1 evidence-state table | states are `SINGING_PROVEN` … `UNDOCUMENTED`, driven by vendor enumeration | ADD a computed `phoneme_coverage` field (A2) so `UNDOCUMENTED` stops meaning "unknown" and starts meaning "predicted at X coverage, unmeasured" |
| §2b.4 `lyrics.script` | "G2P/Romanisation hint; ACE-Step Romanises non-Roman scripts" | becomes a real typed phonetic layer: `{ g2p: "...", ipa: [...], encoding: "merged|split", diacritics: [...] }` (A1) |
| §3.6 MIDI | "no provider accepts symbolic music… Presenting it as note-level control would be the substitution class" | **removable** for the vocal path: SoulX-Singer accepts MIDI natively in score-control mode (A5) |
| Stage 3 (Generate) | four hosted routes | add a fifth route: **`svs_soulx` on the GPU instance**, and split vocal-vs-bed generation (A5, A7) |
| Stage 6 (Verify lyrics) | "separate vocal → ASR → PER vs the requested lyric" with `ground_truth_control_per: 0.1614` | insert the VAD stage (A8); make `bar` per-language (A9); add the vocable control (A10); **re-label 0.1614 as `[single-source, internal]` until re-measured** |
| §6 open question (Turkish) | "BERK'S VERDICT" on Lyria-3 Turkish, with the TTS-onto-bed fallback | keep the verdict as his, but the fallback is upgraded (A6) and there is now a PRIMARY path to try first (A5) |

## The one number to beat, and the falsifier

**Beat:** SoulX-Singer's cross-lingual WER **0.110** against a ground truth of **0.148** (S01 Table 3) — i.e.
the frontier already generates cross-lingual singing that an ASR transcribes MORE accurately than it
transcribes real human singing on the same set. **Our Turkish target is therefore a measured Turkish PER at or
below a Turkish human floor we measure ourselves, on ≥3 songs per route** (n≥3 because this project measured
that a seed is not bit-deterministic).

**What would falsify this recommendation:** (a) a Turkish PER measurement on the A1–A5 chain that is not
materially better than the current Lyria-3 prose route — which would move the answer toward A6/A13;
(b) SoulX-Singer's LICENSE or training-data provenance turning out to forbid our use — which would move the
primary engine to a licence-clean alternative and is why A5 carries a legal gate; (c) X1 resolving in favour of
merged encoding so strongly that the split layer is dead weight — which the flag in A1 already anticipates.

**Nothing in this report authorises spend, a generation run, or a code change.** It is research, applied only
as the change ledger above, for his decision.

---

# Artefact index

- Main report: `C:\Berk\SsmContentAssetCreator\docs\research\2026-08-14-cross-lingual-singing-voice-synthesis-frontier.md` (this file)
- Archived raw captures: `C:\Berk\SsmContentAssetCreator\docs\research\_sources\2026-08-14-*.txt` — **23 files**
- Planned artefacts: 1 report + source archive. Produced: 1 report + 23 archived captures. **Parity: met.**








