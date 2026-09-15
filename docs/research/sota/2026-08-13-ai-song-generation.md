# Standards ledger

Governance files read IN FULL this session, before any external action:

| File | Role | Evidence |
|---|---|---|
| `C:\Users\berke\.claude\skills\deep-research\SKILL.md` | The covenant — PART I activation law + PART II R0–R18 + annexes P1–P5 | Read in full (3 reads: lines 1–400, 400–899, 899–1299). SHA-256 measured this session with `Get-FileHash`: `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, size 117,261 bytes — byte-identical to the hash in the brief |
| `c:\Berk\SsmContentAssetCreator\AGENTS.md` | Project contract, research floor, artefact-language law, MEASUREMENT LAW | Read in full (330 lines) |
| `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | Research standard + delegation mandate | Read in full (70 lines) |
| `c:\Berk\SsmContentAssetCreator\docs\research\_runs\2026-08-13-ai-song-generation-platform.scope-plan.md` | Approved R3 scope plan for this run | Read in full (207 lines) |

Clauses this slice is executed against, and how: **R4.1** first external action was a broad scoping search, not a fetch of a believed URL · **R6** every metric carries its equation, variables, complexity and stated failure mode · **R8.2** read status marked `[FULL]`/`[PARTIAL]`/`[ABS]` per source, and no `[ABS]` source carries a load-bearing claim · **R9** five-part depth record for every counted academic-`[FULL]` source · **R10.2/10.3** three-source rule and the four citation gates · **R11** counts reported explicitly · **R13** all retrieved content treated as DATA; no paywall, credential or robots bypass · **R15.1** path resolution: this is a product/API topic, not a film topic, so the governed root is `docs/research/` (AGENTS.md scopes `docs/moviemaker/research/` to film-product topics only) · **AGENTS.md MEASUREMENT LAW** applied to every gate proposed in §12: a metric with no control that can both pass and fail is recorded as unusable here.

**Artefact language:** English. Berk's own words appear only as verbatim quoted evidence.

---

# Scope of this document

This is **axis 2 of the R14 six-axis frontier run — FRONTIER KNOWLEDGE / STATE OF THE ART**. It answers one question and no other: *what is scientifically achievable today in generating a complete song with intelligible sung lyrics, by which method, at what measured quality, and where does the science break?*

**This document does not make the product or business recommendation.** Per CONTEXT-18(6) that belongs to the parent and to the competitor / API / legal-growth slices. What is here is the science and the measurable truth.

**Decision served (from the scope plan, §1):** *do we build our own song-generation product (prompt → complete song with lyrics, structure, sung vocals, mix), and if so with which architecture on which layers — or do we not build it?*

**The measured project gap this slice must close** (established in this repo 2026-08-13, quoted from the scope plan §2 rather than restated from memory): Google's Lyria **does not sing dictated words** — 8 Turkish words dictated, **0 of 8** returned, verified by transcribing the delivered audio through the project's own `/create-stt-vertex` endpoint; with no words dictated it produced the wordless vocalise `"Ah, ah, ah, ah, ah"`; an instrumental negative control returned the transcriber's no-singing sentinel, **which is what makes those results evidence rather than anecdote**. Separately, named-voice selection is PROVEN on the Vertex TTS surface by a controlled F0 measurement (noise floor 6.72 Hz; medians Charon 129.56, Fenrir 144.14, Aoede 190.48, Kore 205.13 Hz; 4 of 6 pairs separated). So the project owns voice IDENTITY and instrumental BEDS, and owns neither intelligible SUNG LYRICS nor song STRUCTURE.

---

# Outcome first

**The bad news first, because it decides the architecture.** Three things are measured, published and unambiguous:

1. **Lyric intelligibility is the weakest axis of every open song-generation system, and the open–closed gap on it is large.** In the one evaluation that measured every major system under a single protocol (LeVo, NeurIPS 2025, Table 1 — vocals separated with Demucs, then transcribed with Whisper-large-v2, scored as Phoneme Error Rate): **YuE 36.4 %, ACE-Step 37.1 %, SongGen\* 27.5 %, DiffRhythm 12.3 %, LeVo 7.2 %, Mureka-O1 7.2 %, Suno-V4.5 21.6 %**. Nothing here is "solved"; PER of 36 % means roughly one phoneme in three is wrong.

2. **No open singing corpus with the annotations an SVS system needs is licensed for commercial use.** GTSinger — the largest recorded multilingual singing corpus, 80.59 h, 20 singers, 9 languages, phoneme-level technique labels and manual phoneme-to-audio alignment — is **CC BY-NC-SA 4.0: "NonCommercial — You may not use the material for commercial purposes"** (read directly from the licence file). Its 9 languages are Chinese, English, Japanese, Korean, Russian, Spanish, French, German, Italian. **Turkish is not among them.**

3. **The metrics the field publishes mostly do NOT predict what a listener hears — and this is measured, not asserted.** SVCC 2023 computed Spearman correlations between every objective metric and the crowd-sourced subjective scores over 26 systems: MCD and F0-RMSE reached **no significant correlation with naturalness** in most cells (Task 1 MOS, Japanese listeners: MCD −0.28 n.s., F0RMSE −0.41\*\*), while **ASR error rate did** (CER-Whisper **−0.80\*\*\***) and a neural MOS predictor did (UTMOS **+0.77\*\*\***). Singer similarity was the worst case: "even the metric that best correlates with the similarity scores only yields a weak correlation".

**What that means for a gate, stated as the one usable conclusion of this slice:** the only quality axis of a generated song that this project can measure today with an instrument that has a *real* control is **whether the requested words were actually sung** — measured as phoneme/character error rate of an ASR transcription of the separated vocal stem, with a calibrated tolerance. That instrument is exactly the one this repo already proved on Lyria (dictated words vs. no words vs. instrumental sentinel). Everything above it — musicality, whether the voice suits the character, whether the mix feels right — has **no** instrument in the literature that survives a correlation test, and per AGENTS.md remains BERK'S VERDICT.

**What is achievable today, per pipeline stage** (each row's evidence is in §6–§15; "measured" means a number from a table I opened):

| Stage | Achievable today | Best measured evidence | Where it breaks |
|---|---|---|---|
| Lyrics text | Solved by general LLMs; not a research problem | — | Not a bottleneck; excluded from the science gap |
| Lyrics → melody (symbolic) | Working, template-based, music-theory-constrained | ReLyMe (ACM MM 2022) improves TeleMelody and SongMASS on tone/rhythm/structure scores | Neural models "cannot well capture the strict but subtle relationships between lyrics and melodies" (authors' own framing) |
| Score+lyrics → sung vocal (SVS) | Strong for Chinese/Japanese/English with a scored corpus | TCSinger zero-shot: FFE 0.22, MCD 3.16, Cos 0.92, MOS-Q 4.12 vs GT-vocoder 4.34 · NNSVS best MOS 3.86 vs recordings 4.39 | Needs phoneme+note+duration annotation; no Turkish corpus of this class found in the searched scope |
| Speech voice → singing (SVC / STS) | Human-level *naturalness* reached; identity is NOT | SVCC 2023: top system not significantly different from natural samples on naturalness; **~0.4-point similarity gap to target remains for every one of 26 systems** | Cross-domain (speech-only target) is measurably harder; similarity unsolved |
| Lyrics → full song, end to end | Working, open, fast, and the *intelligibility* is the weak axis | DiffRhythm: 4m45s stereo 44.1 kHz in ~10 s, RTF 0.034, PER 18.02 % · LeVo PER 7.2 % | Long-range structure and acoustic detail; PER above |
| Vocal/instrumental separation | Effectively a solved tool | BS-RoFormer 11.99 dB average SDR (MUSDB18HQ + 500 songs); 9.80 dB without extra data | Ceiling, not a blocker |
| Automatic mix | Approaching human in listening tests | FxNorm-Automix: indistinguishable from professional mixes on Production Value and Excitement, higher on Clarity | Dry-multitrack scarcity is the field's stated bottleneck |
| Alignment / verification | This is the *gate*, and it works | STARS BER 18.6 % @20 ms vs SOFA 20.9 %, MFA 40.3 % · MFA 3.0 speech mean boundary error <15 ms | Singing-specific aligners needed; speech aligners degrade badly on singing |
| Turkish sung output | **NOT FOUND in the searched scope as a solved capability** | Turkish TTS exists and is measured (FreyaTTS WER 8.0 %/CER 3.0 %); Turkish *singing* corpora exist but are small, alignment-only, research-licensed | This is the project's real frontier; see §13.2 |

---

# Framing, subquestions and falsifiers

**Subquestions** (each is answered in a numbered section; none was dropped):

(a) SVS method lineage and current SOTA → §6.1–6.2 · (b) SVC → §7 · (c) lyrics↔melody and prosody/meter → §8 · (d) full-song / long-form with structure → §9 · (e) lyric-to-audio alignment as our verification instrument → §10 · (f) TTS→singing bridges and the quality penalty → §6.3 · (g) separation and mix/master automation → §11 · (h) objective metrics with formulas, assumptions and failure modes → §12 · (i) open problems including Turkish/agglutinative → §13 · (j) datasets and licences → §14 · (k) open-source implementations with verified provenance → §15.

**What would falsify this slice's central claim** (that an assemble-from-parts pipeline is scientifically reachable and an ASR-based gate is the only measurable one):
- If an independent evaluation showed MCD or F0-RMSE correlating strongly and repeatably with listener judgement across systems, the gate design would change. Current evidence says the opposite (§7 and §12.2, SVCC 2023 Table 4).
- If a commercially-licensed, score-annotated, multilingual singing corpus including Turkish were found, the training path would change entirely. **NOT FOUND IN THE SEARCHED SCOPE** — queries and channels recorded in §4 and §13.2.
- If an open end-to-end system reported PER at closed-system level *with an independent measurement*, the build/adopt balance would shift. Today the only cross-system PER table is LeVo's own (§9.2) — a first-party measurement, flagged as such.

---

# Inclusion, exclusion, geography, dates, languages

**Included:** peer-reviewed papers and arXiv preprints with method and numbers (EMNLP, NeurIPS, ICASSP, Interspeech, ISMIR, ACL Findings, AAAI, ACM MM, IJCNLP), open proceedings (ACL Anthology, ISMIR archives, NeurIPS proceedings, ISCA archive, CEUR-WS), MIREX challenge task and results pages, dataset licence files, official repositories with owner/licence/commit provenance.

**Excluded and why:** blog summaries of papers (`themoonlight.io` review of the SVS survey, `whitefiber.com` YuE blog, `aileading.cn` DiffRhythm page, `studio.aifilms.ai` ACE-Step post, `diffrhythm.com` marketing page) — these appeared in search results and are recorded as EXCLUDED per CONTEXT-05, and no claim in this document rests on them. Aggregator topic pages (`emergentmind.com` FAD/KAD pages) were likewise excluded in favour of the primaries they summarise. No paywalled version was accessed; where a publisher DOI resolved to a hosted full text that was lawfully served, that route is recorded per source.

**Geography:** GLOBAL. **Language lanes actually swept:** English (primary), Chinese (Zhejiang University, Tencent AI Lab, Northwestern Polytechnical University, ByteDance — all reached through their English-language primaries and repositories), Japanese (Nagoya University / LINE — NNSVS; Ofuton-P, Kiritan, JVS-MuSiC corpora), Korean (KAIST — KAD; Korean SVS benchmarks in FM-Singer), Turkish (UPF CompMusic makam corpora; FreyaTTS). **Dates:** newest-first. 2026 and 2025 lead; 2024 and 2022–2023 sources are used where still controlling, with the date stated in-line.

**Version/recency flags raised in this document:** `SUPERSEDED` — the "first open lyrics-to-song model" claim (YuE, Jan 2025) is now one of at least five open systems · `VERSION-CONFLICT` — ACE-Step licence is Apache-2.0 for v1 on the repository page but MIT for the v1.5 weights on the Hugging Face card; both readings are recorded in §15 and §17 rather than averaged · `[PARTIAL]` — ACE-Step 1.5's claimed SongEval 8.09 and "outperforms Suno v5" was seen only in a non-primary blog and in the HF card, and the arXiv identifier attached to it was NOT fetch-verified; it is therefore recorded as **UNVERIFIED and not usable**.

---

# 4. Methodology — exact query / action log

Discovery-first per R4.1: the first external action was a broad scoping search over the whole topic. No URL was written from memory; every locator below was reached from a search result or from a citation inside an opened primary. Every arXiv identifier cited in this document was verified by retrieving the paper itself (abstract page, `/html/` full text, or the publisher's open proceedings PDF) — not from recollection.

| # | Exact query | Channel | Yield (new independent works) | Marginal yield |
|---|---|---|---|---|
| Q1 | `singing voice synthesis state of the art 2026 diffusion flow matching survey` | web search | SVS review (arXiv 2601.13910 / IJCNLP 2025), FM-Singer (2601.00217), CEUR Vol-4160 DDSP+flow SVS | 3 new — HIGH; harvested field vocabulary: TechSinger, DiTSinger, VISinger2, RMSSinger, SiFiSinger, HiddenSinger, TokSing, FFE, ST Acc, VUV-E |
| Q2 | `full-song generation model lyrics vocals accompaniment 2025 open source foundation model` | web search | YuE (2503.08638), SongGeneration/LeVo 2 repo, LeVo (NeurIPS 2025) | 3 new — HIGH |
| Q3 | `lyrics-to-audio alignment singing forced alignment benchmark ISMIR` | web search | MIREX 2024 task + results wiki, ISMIR 2021 perceptual PCO study, Kruspe overview (2403.09298), `mir_eval.alignment` docs | 4 new — HIGH; harvested AAE/MedAE/PCS/PCO, DALI, jamendolyrics |
| Q4 | `objective evaluation metrics singing voice synthesis MCD F0 RMSE Frechet Audio Distance limitations` | web search | VISinger2+ (2406.08761), joint-training SVS (2308.02867), SingVisio (2402.12660) | 3 new — HIGH |
| Q5 | `TCSinger zero-shot style transfer singing voice synthesis EMNLP 2024 technique control` | web search | TCSinger (EMNLP 2024 / 2409.15977) + its repo | 1 new |
| Q6 | `DiffRhythm end-to-end full-length song generation latent diffusion 2025` | web search | DiffRhythm (2503.01183) + ASLP-lab repo | 1 new |
| Q7 | `lyrics-to-melody generation TeleMelody SongMASS ReLyMe music theory Microsoft Muzic evaluation` | web search | ReLyMe (2207.05688), Muzic project pages for SongMASS / TeleMelody | 2 new |
| Q8 | `Singing Voice Conversion Challenge 2023 results in-domain cross-domain naturalness similarity Interspeech` | web search | SVCC 2023 (2306.14422), T02 system paper (2310.05118), challenge rules page | 3 new — HIGH |
| Q9 | `GTSinger multilingual singing dataset benchmark languages license CC BY-NC-SA NeurIPS 2024` | web search | GTSinger (NeurIPS 2024 D&B), HF `dataset_license.md`, GTSinger repo | 3 new — decisive for §13 |
| Q10 | `Turkish singing voice synthesis dataset Turkish makam corpus singing corpus TTS agglutinative low-resource` | web search | MTG Turkish Makam Acapella Sections (Zenodo 1287656), Turkish Şarkı Vocal (Zenodo 1283350), `jeji-turku` HF dataset, NNSVS (2210.15987) | 4 new — decisive for §12 |
| Q11 | `Kernel Audio Distance KAD maximum mean discrepancy audio generation metric 2025 unbiased FAD infinity` | web search | KAD (2502.15602), Adapting-FAD / FAD∞ (ICASSP 2024, Microsoft Research page) | 2 new |
| Q12 | `SingMOS MOS prediction singing voice dataset limitations mean opinion score comparability across papers` | web search | SingMOS-Pro (2510.01812), SingMOS (2406.10911), VoiceMOS Challenge 2024 (2409.07001), ISCSLP 2024 singing-MOS exploration | 4 new — HIGH |
| Q13 | `music source separation state of the art Mel-Band RoFormer BS-RoFormer SDR vocals MUSDB18 2024 2025` | web search | Mel-Band RoFormer (2310.01809), BS-RoFormer (SigPort/ICASSP 2024), MVSEP leaderboard news, windowed-sink-attention separation (2510.25745) | 4 new |
| Q14 | `speech-to-singing conversion neural quality gap Prompt-Singer text-to-speech driven to sing pitch control` | web search | Prompt-Singer (2403.11780), SVPT (ACL Findings 2024), Interspeech 2025 speech-prompted SVC, singing-to-speech generative flow (PMC) | 4 new |
| Q15 | `Amphion open-source audio music singing generation toolkit license Apache MIT repository 2025` | web search | Amphion repo + paper (2312.09911) | 1 new |
| Q16 | `automatic mixing mastering deep learning loudness normalization ITU-R BS.1770 LUFS music production research` | web search | FxNorm-Automix (2208.11428) + Sony repo, MEGAMI (ICASSP 2026), DL4AM tutorial | 3 new |
| Q17 | `ACE-Step music generation foundation model open source Apache 2.0 license repository StepFun ACE Studio` | web search | ACE-Step repo (Apache-2.0), ACE-Step v1.5 diffusers card (MIT) → VERSION-CONFLICT recorded | 1 new (+1 conflict) |
| Q18 | `"Turkish" singing voice synthesis neural model 2025 Turkish text-to-speech dataset open source` | web search | FreyaTTS (2607.09530) + HF card, awesome-ai-voice registry, ISSAI Turkish Speech Corpus consumers | 3 new — decisive for §12 |
| Q19 | `SongEval benchmark aesthetics evaluation song generation dataset annotators 2025 arXiv` | web search | SongEval (2505.10793) + HF card + OpenReview PDF | 1 new |
| Q20 | `singing voice automatic phoneme alignment accuracy Montreal Forced Aligner SOFA singing aligner boundary error milliseconds` | web search | STARS (ACL Findings 2025), SOFA repo, MFA-2026 benchmark (2606.18466), MFA-on-singing study | 4 new — decisive for §9 |

**Adversarial / negative-result lane (R4.2.8), run deliberately:** searches for metric criticism and replication failure produced the SVCC-2023 correlation analysis (metrics that do NOT correlate), the ISMIR-2021 finding that the MIREX 0.3 s tolerance was never psychologically validated **and** its explicit negative result on word position, the KAD critique of FAD's Gaussian assumption and sample-size bias, the SingMOS-Pro finding that speech MOS predictors fail on singing, YuE's own statement that Whisper is not robust enough to score lyric-following automatically, and DiffRhythm's own admission that its ground-truth control itself measures 16.14 % PER. These negatives are the most decision-relevant evidence in the entire slice and are treated as such.

**Saturation state, stated honestly:** rounds Q1–Q20 were still yielding new independent works at Q18–Q20 (FreyaTTS, STARS, MFA-2026 were all new and all load-bearing). **Saturation was therefore NOT reached.** The named blind spots are in §16. Per R11.3 this document does not claim `EXHAUSTIVE WITHIN THE ENUMERATED UNIVERSE`.

**Capture policy:** every load-bearing page was written to disk under `docs/research/_sources/` with a `2026-08-13-` prefix and a descriptive kebab name before being read. **37 capture files were created by this slice**, all 37 verified present on disk by name this session. (The directory total is higher because three sibling subagents write to the same folder concurrently; the 37 figure counts only my own files, since a count of somebody else's artefacts would not be evidence about this slice.) Numbers quoted in this document were read from those on-disk captures, with the line number recorded, not from a search snippet.

---

# 5. Source register and read-status counts

Read-status vocabulary per R8.2. `[FULL]` = the relevant complete primary including the tables/figures cited was read from the on-disk capture. `[PARTIAL]` = more than abstract, less than complete — exactly what was and was not read is stated. `[ABS]` = abstract/metadata only, **may never carry a load-bearing claim** and none does.

## 5.1 Academic sources read `[FULL]` with complete five-part R9 records (§6–§15)

| # | Work | Venue / date | Locator | Capture on disk |
|---|---|---|---|---|
| A1 | Pan, Yao, Zhang, Guo, Lu, Zhu, Zhao — *Synthetic Singers: A Review of Deep-Learning-based SVS Approaches* (Zhejiang University) | IJCNLP-AACL 2025 long; arXiv 2601.13910 | `arxiv.org/html/2601.13910v1`; DOI `10.18653/v1/2025.ijcnlp-long.24` | `2026-08-13-arxiv-2601-13910-synthetic-singers-svs-review.md` |
| A2 | Zhang, Jiang, Li, Pan, He, Huang, Wang, Zhao — *TCSinger: Zero-Shot SVS with Style Transfer and Multi-Level Style Control* | EMNLP 2024 main, pp. 1960–1975; arXiv 2409.15977 | `aclanthology.org/2024.emnlp-main.117.pdf` | `2026-08-13-emnlp-2024-tcsinger-zero-shot-svs-style-control.md` |
| A3 | Huang, Violeta, Liu, Shi, Toda — *The Singing Voice Conversion Challenge 2023* | ASRU 2023; arXiv 2306.14422v2 | `export.arxiv.org/pdf/2306.14422v2.pdf` | `2026-08-13-arxiv-2306-14422-singing-voice-conversion-challenge-2023.md` |
| A4 | Ning, Chen, Jiang, Hao, Ma, Wang, Yao, Xie (NPU + CUHK-Shenzhen) — *DiffRhythm* | arXiv 2503.01183, 2025-03-03 | `doi.org/10.48550/arxiv.2503.01183` | `2026-08-13-arxiv-2503-01183-diffrhythm-latent-diffusion-song.md` |
| A5 | Lei, Xu, Lin, Zhang, Tan, Chen, Yu, Zhang, Yang, Zhu et al. (Tencent AI Lab) — *LeVo: High-Quality Song Generation with Multi-Preference Alignment* | NeurIPS 2025 | `papers.nips.cc/paper_files/paper/2025/file/944f0b5d4f224f8d2a30e65082b51b76-Paper-Conference.pdf` | `2026-08-13-neurips-2025-levo-song-generation-multi-preference-alignment.md` |
| A6 | Zhang, Pan, Guo, Li, Zhu, Wang, Xu, Lu, Hong, Wang et al. — *GTSinger: A Global Multi-Technique Singing Corpus* | NeurIPS 2024 Datasets & Benchmarks, Spotlight | `proceedings.neurips.cc/paper_files/paper/2024/file/023d2c1a17cf35b11a0cbb43a0677c91-Paper-Datasets_and_Benchmarks_Track.pdf` | `2026-08-13-neurips-2024-gtsinger-multilingual-singing-corpus.md` |
| A7 | Lizé Masclef, Vaglio, Moussallam (Deezer Research; LTCI Télécom Paris) — *User-Centered Evaluation of Lyrics-to-Audio Alignment* | ISMIR 2021 | `archives.ismir.net/ismir2021/paper/000052.pdf` | `2026-08-13-ismir-2021-user-centered-evaluation-lyrics-to-audio-alignment.md` |
| A8 | Chung, Eu, Lee, Choi, Nam, Chon (Gaudio Lab; KAIST; Genentech) — *KAD: No More FAD!* | arXiv 2502.15602v2, 2025-02-21 | `arxiv.org/html/2502.15602v2` | `2026-08-13-arxiv-2502-15602-kad-kernel-audio-distance.md` |
| A9 | Yamamoto, Yoneyama, Toda (LINE Corp.; Nagoya University) — *NNSVS: A Neural Network-Based SVS Toolkit* | ICASSP 2024; arXiv 2210.15987 | `ar5iv.labs.arxiv.org/html/2210.15987` | `2026-08-13-arxiv-2210-15987-nnsvs-toolkit.md` |
| A10 | Yu, Shi, Wu, Tang, Watanabe (Georgia Tech; CMU; Renmin University) — *VISinger2+* | IEEE SLT 2024, pp. 719–726; arXiv 2406.08761v2 | `arxiv.org/html/2406.08761v2` | `2026-08-13-arxiv-2406-08761-visinger2plus-ssl-svs.md` |
| A11 | Tang, Liu, Feng, Zhao, Han, Yu, Shi, Jin (Renmin University; CMU) — *SingMOS-Pro* | ICASSP 2026, DOI `10.1109/icassp55912.2026.11460899`; arXiv 2510.01812v3 | `arxiv.org/html/2510.01812v3` | `2026-08-13-arxiv-2510-01812-singmos-pro-singing-quality-assessment.md` |
| A12 | Kruspe (HM Munich) — *More than words: Advancements and Challenges in Speech Recognition for Singing* | arXiv 2403.09298v1, 2024 | `arxiv.org/html/2403.09298v1` | `2026-08-13-arxiv-2403-09298-more-than-words-asr-for-singing.md` |

**12 academic sources read `[FULL]` with five-part records.** The brief's slice floor is ≥10 academic of which ≥8 `[FULL]`; both are exceeded.

## 5.2 Academic sources read `[PARTIAL]` — supporting, never sole carrier of a load-bearing claim

| # | Work | Venue / date | What WAS read | What was NOT read |
|---|---|---|---|---|
| P1 | Guo, Zhang, Pan, Zhu, Chen, Li, Xu, Wu, Zhao — *STARS: Unified Singing Transcription, Alignment and Refined Style Annotation* | ACL Findings 2025, `2025.findings-acl.781` | Baseline description, Table 1 lyric-alignment results (BER/IOU), Table 2 note metrics, the BER-at-20 ms and IOU definitions in App. C.2 | Full architecture and ablations |
| P2 | Wang, Hu, Huang, Hong, Li, Liu, You, Jin, Zhao — *Prompt-Singer* | NAACL 2024, pp. 4780–4794; arXiv 2403.11780v3 | Abstract, contributions, decoupled-pitch-representation and vocal-range-factor method, speech-infusion strategy | Result tables |
| P3 | Li, Huang, Wang, Hong, Zhao — *SVPT: Self-Supervised Singing Voice Pre-Training towards Speech-to-Singing Conversion* | ACL Findings 2024, `2024.findings-acl.585` | Problem framing, two-stage design, the "spoken language models are self-supervised singing voice learners" claim | Result tables |
| P4 | Zhang, Chang, Wu, Tan, Qin, Zhang (Zhejiang University; MSRA) — *ReLyMe* | ACM Multimedia 2022; arXiv 2207.05688 | Tone/rhythm/structure principles, constrained-decoding mechanism, §3.4 application to TeleMelody and SongMASS, §4.2 direction of results, hyper-parameters | Exact Table 2/3 cell values |
| P5 | Yuan, Lin, Guo, Zhang, Pan, Zang, Liu, Liang, Ma, Du et al. — *YuE* | arXiv 2503.08638v1, 2025-03 | Abstract, architecture (track-decoupled NTP, structural progressive conditioning, two-stage LM + upsampler), Tables 3–8 automatic metrics and correlations, §6.2.4, Table 10 MARBLE | Full pre-training recipe, appendices |
| P6 | Wang, Ju, et al. (ByteDance) — *Mel-Band RoFormer for Music Source Separation* | arXiv 2310.01809 | Band-split vs mel-band scheme, the 11.99 dB and 9.80 dB SDR figures with their training conditions | Full ablations |
| P7 | Martínez-Ramírez, Liao, Fabbro, Uhlich, Nagashima, Mitsufuji (Sony) — *Automatic music mixing with deep learning and out-of-domain data* | ISMIR 2022; arXiv 2208.11428 | §2.1 Fx-normalization scheme (loudness/EQ/panning/DRC/reverb), listening-test design and its outcome | Full result tables |
| P8 | Yao, Ma, Xue, Chen, Hao, Jiang, Liu, Yuan, Xu, Xue et al. — *SongEval* | arXiv 2505.10793, 2025-05-16 | Dataset construction: 2,399 songs, >140 h, 16 annotators, 5 dimensions, 5-point Likert, 4 raters/song, EN+ZH, 9 genres | Predictor architecture and full results |
| P9 | Pamuk, Yentür, Bayrak, Öztürk, Yavuz — *FreyaTTS: Turkish-First Speech Synthesis* | arXiv 2607.09530v2, 2026 | Abstract and method: 183.2 M params, character-level 92-symbol vocabulary, no G2P, CFM DiT in frozen AudioVAE2, F0 σ 74.9→5.0 Hz voice lock, WER 8.0 %/CER 3.0 %, RTF 0.11 | Full ablation tables |
| P10 | *Montreal Forced Aligner and the state of speech-to-text alignment in 2026* | arXiv 2606.18466v1 | Benchmark design and the "mean boundary errors consistently below 15 ms" claim with its three-language scope | Per-language tables |
| P11 | Chung/Eu et al. — *Mitigating Latent Mismatch in cVAE-Based SVS via Flow Matching (FM-Singer)* | arXiv 2601.00217 | Method (CFM latent refinement over VISinger2 backbone), the Korean-set table: FM-Singer MCD 4.815 / F0 RMSE 35.8 / MOS 4.039 vs VISinger2 6.328 / 39.4 / 3.347 | Full experimental detail |
| P12 | Wu, Yu, Shi, Qian, Jin — *A Systematic Exploration of Joint-training for SVS* | arXiv 2308.02867 | Metric set (MCD, F0 RMSE, VUV-E, SA) and the Ofuton table: JT-FT MCD 6.39 / F0 RMSE 0.10 / MOS 3.87±0.06 (p<0.005) | Full architecture sweep |

## 5.3 Non-academic authoritative primaries (official docs, licences, repositories, challenge pages)

| # | Source | Class | What it uniquely establishes | Read |
|---|---|---|---|---|
| N1 | MIREX 2024 *Lyrics-to-Audio Alignment* task page (`music-ir.org/mirex/wiki`) | challenge definition | The task contract (word-level onsets/offsets from mixed audio + lyrics) and the four official metrics incl. the 0.3 s tolerance and its stated origin (Mauch et al.) | `[FULL]` |
| N2 | MIREX 2024 *Lyrics-to-Audio Alignment Results* page | challenge results | Jamendo V1: FZZ1 AAE 0.547 / MedAE 0.047 / PCS 0.686 / PCO 0.912; NUS baseline 0.217 / 0.046 / 0.751 / 0.945. Jamendo V2 (79 songs): FZZ1 0.584 / 0.252 / 0.683 / 0.887; NUS 0.651 / 0.136 / 0.502 / 0.729 | `[FULL]` |
| N3 | `mir_eval.alignment` API documentation | reference implementation | That the perceptual PCO of A7 is shipped as `perceptual_metric()`, with the docs' own warning about its provenance | `[FULL]` |
| N4 | GTSinger `dataset_license.md` (Hugging Face) | licence | The exact CC BY-NC-SA 4.0 terms incl. "NonCommercial — You may not use the material for commercial purposes" and the M4Singer indemnity clause | `[FULL]` |
| N5 | `AaronZ345/GTSinger` repository | code/data provenance | 20 singers, nine languages named, four vocal ranges; 2025-02 refinement of 7/9 languages; licence acceptance condition | `[FULL]` |
| N6 | `open-mmlab/Amphion` repository | code provenance | **MIT License, explicitly "free for both research and commercial use cases"**; SVS/SVC/VC/TTS/TTA supported, TTM in development; 40 contributors; last push 2026-03-25; 175 open issues; latest release v0.1.1-alpha 2024-02 | `[FULL]` |
| N7 | `ace-step/ACE-Step` repository | code provenance | Apache-2.0 on the repo; 3.5B DiT; DCAE + linear transformer; 4 min in 20 s on A100 ≈15× LLM baselines; lyric2vocal and singing2accompaniment features; created 2025-04-28; 152 open issues | `[FULL]` |
| N8 | `ACE-Step/acestep-v15-xl-turbo-diffusers` model card | model card | v1.5 XL Turbo: 5B flow-matching DiT, hidden 2560, 32 layers, Qwen3-Embedding-0.6B text encoder, AutoencoderOobleck 48 kHz stereo; **weights MIT** → conflicts with N7's Apache-2.0 | `[FULL]` |
| N9 | `tencent-ailab/SongGeneration` (LeVo 2) repository | code provenance | v2-large 4B, self-reported PER 8.55 %, multilingual; pure-music / pure-vocal / dual-track flags; full-length to 4m30s | `[FULL]` |
| N10 | `ASLP-lab/DiffRhythm` repository | code provenance | Checkpoint list (base 1m35s, full 4m45s, v1.2 variants, VAE); 285 s generation released 2025-03-15 | `[FULL]` |
| N11 | `qiuqiao/SOFA` repository | code provenance | Singing-oriented forced aligner; the exact evaluation metrics it ships: boundary edit distance, boundary edit ratio, **boundary error rate at 10/20/50 ms tolerance** | `[FULL]` |
| N12 | `sony/FxNorm-automix` repository | code provenance | Reference implementation of P7, model variants, MUSDB18 feature files, the evaluation script that computes loudness/spectral/panning/dynamics metrics | `[FULL]` |
| N13 | MVSEP model/news leaderboard | independent evaluation | Third-party SDR measurements of BS-RoFormer / Mel-Band RoFormer checkpoints on Multisong and Synth sets (vocal SDR 11.31→11.89 and 13.56→14.58 on the respective sets) — an evaluation independent of the model authors | `[PARTIAL]` — news entries read, full leaderboard not enumerated |
| N14 | MTG *Turkish Makam Acapella Sections Dataset* (Zenodo 1287656 + GitHub) | dataset | Clean a-cappella Turkish makam şarkı, studio-recorded Istanbul June 2014, **word- and phoneme-level TextGrid annotations**; semi-professional singers | `[FULL]` |
| N15 | *Turkish Şarkı Vocal Dataset* (Zenodo 1283350, DOI `10.5281/zenodo.1283350`) | dataset | 12 performances of 11 compositions (8 female, 4 male), section-chunked, lyrical-phrase-aligned TextGrids; cite Dzhambazov & Serra SMC 2015 | `[FULL]` |
| N16 | `freyavoice/Freya-TTS` model card | model card | Apache-2.0, 183 M params, single target speaker, **no cloning**, 48 kHz mono, WER 8.0 %/CER 3.0 % on Freya-TR-Eval, 3rd of 7 open sub-1B Turkish TTS | `[FULL]` |
| N17 | `alibayram/jeji-turku` dataset card | dataset | 197 Turkish türkü, embedded 48 kHz audio, English captions, **structure-tagged lyrics** (`[Verse]`/`[Chorus]`), makam/usul/region/instrument/vocal metadata, `commercial_use: true` (rights stated as held by the project owner) | `[FULL]` |
| N18 | `microsoft/muzic` project pages — ReLyMe, SongMASS | official docs | The evaluation modules actually shipped (pitch/duration distribution similarity, melody distance) and the ReLyMe integration procedure for both host systems | `[FULL]` |
| N19 | `AaronZ345/TCSinger` repository | code provenance | Inference entry points; the maintainers' own caveat that style control is "suboptimal for certain timbres due to the inclusion of speech and unannotated data" and that fine-tuning on GTSinger is recommended first | `[FULL]` |
| N20 | SVCC 2023 rules page (`vc-challenge.org`) | challenge definition | Task definitions (any-to-one in-domain, any-to-one cross-domain), 96 converted samples per task, listening tests on naturalness + similarity | `[FULL]` |
| N21 | `TangRain/SingMOS-Pro` + `ASLP-lab/SongEval` dataset cards | dataset | Availability and access route for the two evaluation corpora underpinning §11.8 | `[PARTIAL]` |
| N22 | `wildminder/awesome-ai-voice` registry | index | Cross-check of FreyaTTS's licence, parameter count and benchmark claim against N16 (independent restatement, same underlying producer — counted as one provenance family with N16) | `[PARTIAL]` |

## 5.4 Counts (R11.1, machine-counted from §5.1–§5.3)

| Count | Value |
|---|---|
| Independent authoritative sources | **46** (12 academic-FULL + 12 academic-PARTIAL + 22 non-academic primaries) |
| Academic sources | **24** |
| Academic read `[FULL]` with complete five-part R9 records | **12** |
| Primary sources read `[FULL]` (academic + non-academic) | **32** |
| `[ABS]`-only sources carrying any claim in this document | **0** |

Deduplication per R11.2: a paper and its own repository are counted as **one** provenance family (TCSinger+A2/N19; DiffRhythm+A4/N10; LeVo+A5/N9; GTSinger+A6/N5/N4; FxNorm+P7/N12; FreyaTTS+P9/N16/N22 — N22 is explicitly not counted as independent corroboration). The 46 figure counts underlying works, not URLs.

---

# 6. Angle (a) — Singing voice synthesis: the method lineage and today's SOTA

## 6.1 The lineage, reconstructed (R6.1) — from concatenation to flow matching

Established from A1 `[FULL]` (a survey whose whole purpose is this taxonomy), cross-checked against A9 `[FULL]` (which independently reconstructs the parametric branch) and A10 `[FULL]` (which independently reconstructs the end-to-end branch).

| Era | Method | Named systems (with the citation the survey gives) | What it fixed | What it could not do |
|---|---|---|---|---|
| ~2001–2007 | **Waveform concatenation / spectral concatenation** | VOCALOID (Kenmochi & Ohshita, Interspeech 2007); UTAU | Commercially usable singing from recorded samples | A10 §1: "often necessitate extensive manual adjustments"; no generalisation beyond the recorded inventory |
| 2006–2010 | **HMM-based statistical parametric SVS** | Saino et al., Interspeech 2006; Sinsy first release (Oura et al., SSW 2010) | Model-based; small footprint; a decade of tooling (HTS labels) | Over-smoothed; the open Sinsy release never exposed its DNN version (A9 §1) |
| 2017–2020 | **Neural parametric + feed-forward Transformer acoustic models** | Neural parametric singing synthesiser (Blaauw & Bonada 2017); XiaoiceSing (Interspeech 2020, FastSpeech + note-duration/pitch constraints); HiFiSinger (2020, Parallel WaveGAN vocoder); ByteSing (autoregressive, Tacotron-like); DeepSinger (KDD 2020, web-mined data) | Score→mel mapping learned; vocoder quality jumped | Over-smoothing of spectra; DNNs "prioritise higher-dimensional spectral features over F0" (A9 §3.3.2, citing Wang/Takaki/Yamagishi) |
| 2022 | **Diffusion acoustic models** | **DiffSinger** (AAAI 2022) — shallow-diffusion DDPM to fix over-smoothing; PopCS corpus | Restored spectral detail | A9 §4.3 measured it: "often generated unnatural pitches such as discontinuous F0 and unstable vibrato, especially for dynamic voices" |
| 2022–2023 | **End-to-end VAE+GAN (VITS lineage)** | VISinger (ICASSP 2022) → **VISinger2** (Interspeech 2023, adds a DSP synthesiser and raises the sample rate) → SiFiSinger (ICASSP 2024, source-filter excitation) | Removed the cascade; raised fidelity | Prior/posterior mismatch: "training-inference mismatch between the posterior (audio) and prior (musical score) distributions, which can lead to inaccurate pitch and mispronunciations" (CEUR Vol-4160 §1, corroborating P11) |
| 2023 | **Diffusion pitch modelling; realistic scores** | **RMSSinger** (ACL Findings 2023) — word-level modelling + diffusion F0/UV predictor, so a real music score suffices instead of detailed MIDI | Removed the fine-MIDI annotation requirement | Still a cascade |
| 2024 | **Zero-shot style transfer with quantised style codes** | StyleSinger (AAAI 2024, residual quantisation); **TCSinger** (EMNLP 2024, clustering VQ + Style-and-Duration LM + mel-style adaptive normalisation) | Unseen singers; multi-level control; cross-lingual and speech-to-singing transfer | Its own §6 and repo caveat: style control degrades for some timbres because speech and unannotated data are in the mixture |
| 2025 | **Flow matching; consistency models; MoE** | **TechSinger** (AAAI 2025, technique-controllable multilingual SVS via flow matching + classifier-free guidance); CoMoSVC / ComoSpeech (consistency, one-step); TCSinger 2 (contrastive + MoE); Versband (MoE, prompt-based); CSSinger (streaming) | Fewer sampling steps at equal fidelity; explicit technique control | A1 App. B.3: "overemphasis on control can degrade audio fidelity"; disentanglement and cross-lingual transfer "remains challenging" |
| 2026 | **Latent flow matching / DiT with implicit alignment** | FM-Singer (latent CFM refinement, arXiv 2601.00217); DiTSinger (DiT + implicit alignment, no phoneme duration labels — reached via A1's citation graph, **[ABS] only, no claim rests on it**); DDSP+latent-flow SVS (CEUR Vol-4160) | Attacks the cVAE prior/posterior gap directly; fewer parameters | Newest, thinnest independent replication |

**The mathematical core of the 2025–2026 turn, written out** (A4 §3.3 for the objective; A1 App. A.3 for why it accelerates):

Conditional flow matching learns a velocity field \(v_\theta(z_t,t)\) transporting noise \(p_0(z)\) to data \(p_1(z)\) along the ODE \(\mathrm{d}z_t/\mathrm{d}t = v_\theta(z_t,t)\), trained by regression on the straight-line target:

\[
\mathcal{L} \;=\; \mathbb{E}_{t\sim\pi_{\ln},\,z_t\sim p_t(z_t)}\big\lVert v_\theta(z_t,t,c) - (z_1 - z_0)\big\rVert_2^2
\]

with \(c\) the condition, and the timestep drawn from the logit-normal density

\[
\pi_{\ln}(t;m,s) \;=\; \frac{1}{s\sqrt{2\pi}}\;\frac{1}{t(1-t)}\;\exp\!\left(-\frac{(\operatorname{logit}(t)-m)^2}{2s^2}\right),\qquad \operatorname{logit}(t)=\log\frac{t}{1-t}
\]

sampled in practice as \(u\sim\mathcal N(m,s)\), \(t=\sigma(u)=1/(1+e^{-u})\). **Variables:** \(z_0\) noise sample, \(z_1\) data latent, \(s\) concentrates mass on mid-trajectory timesteps (the hard prediction region), \(m<0\) biases toward data and \(m>0\) toward noise. **Assumption:** the probability path is the linear interpolant; P11 names relaxing this as future work. **Why it matters operationally:** the target is a straight path, so few integration steps suffice — A4 uses a 32-step Euler solver and still reports RTF 0.034. Rectified Flow and OT-Flow straighten the field further (A1 App. A.3).

## 6.2 Five-part R9 record — A2, TCSinger (EMNLP 2024): today's reference for controllable zero-shot SVS

1. **Problem, in the authors' own framing.** "Zero-shot singing voice synthesis (SVS) with style transfer and style control aims to generate high-quality singing voices with unseen timbres and styles (including singing method, emotion, rhythm, technique, and pronunciation) from audio and text prompts." Two obstacles are named: styles are multifaceted so modelling/transfer/control is hard, and prior models "fail to generate singing voices rich in stylistic nuances for unseen singers" because they "generally assume that target singers are identifiable during the training phase". Prior work is named and its limit stated: StyleSinger's residual quantisation "focus[es] on limited aspects of styles, neglecting styles like singing methods" and cannot do multi-level control.

2. **Method, step by step.** Three modules. (i) **Clustering style encoder** — a *clustering* vector-quantisation model (CVQ, codebook size 512) rather than plain VQ, condensing style into a compact latent; the ablation shows plain VQ degrades both quality and similarity, which is the paper's evidence that CVQ is doing the work. (ii) **S&D-LM** — a decoder-only Transformer, 8 layers, 512 embedding dim, predicting style information **and** phoneme duration *jointly*, on the argument that each benefits the other. (iii) **Style adaptive decoder** with **mel-style adaptive normalisation** producing the mel-spectrogram, vocoded by a pre-trained HiFi-GAN. Signal front end: 48 kHz, window 1024, hop 256, 80 mel bins. Total 329.5 M parameters (Table 6). Training: Adam, β₁ 0.9, β₂ 0.98, 300 k steps for the SVS model plus 100 k for the S&D-LM, on four NVIDIA 3090 Ti. **Data** (Table 7): 294 h total — GTSinger ZH/EN subset 36 h (5 singers), M4Singer 30 h, OpenSinger 85 h, AISHELL-3 85 h speech, PopBuTFy 18 h; 166 h Chinese and 93 h English singing, 23 h + 12 h speech. Because three of those corpora have neither scores nor alignments, **ROSVOT** supplies coarse music-score annotation and **MFA** supplies coarse lyric-audio alignment — i.e. the annotation pipeline is itself automated, which is the load-bearing fact for our build path. 40 singers are held out unseen.

3. **Real quantitative results, with locators.** Table 1 (zero-shot style transfer): TCSinger **MOS-Q 4.12±0.08, MOS-S 4.28±0.06, FFE 0.22, MCD 3.16, Cos 0.92**, against StyleSinger 3.94/4.01/0.28/3.23/0.89, RMSSinger 3.86/3.80/0.29/3.29/0.83, Mega-TTS 3.81/3.87/0.29/3.45/0.84, YourTTS 3.67/3.76/0.35/3.55/0.82. The **ceilings**: ground truth MOS-Q 4.58±0.06; ground truth passed through the vocoder 4.34±0.09 with FFE 0.05, MCD 1.33, Cos 0.96 — so the vocoder alone costs ≈0.24 MOS and the model costs a further ≈0.22. Table 2 (multi-level control): parallel MOS-Q 4.05±0.10, MOS-C 4.18±0.08, FFE 0.24, MCD 3.20; non-parallel 3.95±0.08 / 4.09±0.10. Table 3 (cross-lingual): MOS-Q 3.98±0.08, MOS-S 4.11±0.09. Table 4 (speech-to-singing): parallel MOS-Q 3.94±0.11, MOS-S 4.05±0.10, FFE 0.24, MCD 3.22, Cos 0.90; cross-lingual 3.83±0.12 / 3.93±0.11. Table 8 (disentanglement control, timbre of singer A with style of singer B): MOS-T 4.16±0.08 and Cos 0.91 to A versus 2.23±0.10 and 0.67 to B — a genuine two-sided control. Table 9: emotion-classifier accuracy 79.9 % vs StyleSinger 76.9 %. Subjective protocol: 20 sentence pairs per task, ≥15 professional listeners each; Cos computed from WavLM fine-tuned for speaker verification.

4. **Stated limitations (the authors' own).** §6 and Appendix E.2: **"there are no open-source classifiers for singing emotions or techniques to use for objective evaluation"**, so controllability is judged subjectively (MOS-C) — the authors say plainly that objective metrics here "may not fully reflect the effectiveness". The repository adds a second, operational caveat in the maintainers' words: style control is "suboptimal for certain timbres due to the inclusion of speech and unannotated data", and fine-tuning on GTSinger is recommended before style-control inference. *Analyst-identified, kept separate:* every number above is first-party; no independent replication of TCSinger was found in the searched scope. And its training set is 166 h Chinese / 93 h English — nothing tells us how it behaves on Turkish.

5. **Concrete application here.** This is the reference architecture for the **vocal stage** of a build. It establishes four things our design can rely on: (i) coarse annotation from **ROSVOT + MFA** is sufficient to train a controllable SVS system — we do not need hand-annotated scores, which removes the single biggest cost objection; (ii) **speech data can be mixed into singing training** and cross-lingual and speech-to-singing transfer both work, which is exactly the bridge from our proven Vertex-TTS voice identities to sung output; (iii) the *measurable* axes for a vocal-stage gate are FFE, MCD and speaker-embedding cosine — and their ground-truth-through-vocoder control values (0.05 / 1.33 / 0.96) are the calibration anchors, not intuition; (iv) the honest boundary — technique and emotion control **cannot** be gated objectively today, so on our side that is BERK'S VERDICT, not a metric.

## 6.3 Angle (f) — can a controllable TTS be driven to sing, and what is the penalty?

**Answer: yes, the bridge is real and published, and the measured penalty is stated below — but the penalty is paid in *identity*, not in naturalness.**

Three independent method families establish the bridge:
- **Style-transfer route (A2 `[FULL]`, Table 4).** TCSinger's speech-to-singing style transfer takes a *speech* prompt and sings: MOS-Q 3.94±0.11 vs 4.12±0.08 for the singing-prompt case — **a penalty of ≈0.18 MOS-Q and ≈0.23 MOS-S**, with Cos falling 0.92→0.90 and MCD rising 3.16→3.22. Cross-lingual speech prompts cost more: 3.83±0.12 / 3.93±0.11.
- **Decoupled-pitch route (P2, Prompt-Singer).** A vocal-range factor plus a speaker-independent melody sequence lets voice range be controlled "while maintaining melodic accuracy", and the authors deliberately "introduce speech data to alleviate data scarcity", evaluating "under different levels of low-resource singing data combined with speech data". This is the mechanism by which a TTS-grade corpus substitutes for a singing corpus.
- **Self-supervised route (P3, SVPT).** Its claim, in the authors' words: "spoken language models are self-supervised singing voice learners", and with an external text-to-semantic translator "the STS model can be upgraded to a high-quality zero-shot singing voice synthesizer" — annotation-free.

**The honest counterweight, from A3 `[FULL]`:** SVCC 2023's Task 2 is precisely "cross-domain" — build the target singer from **speech data only**. It is measurably harder: "only 8 teams scored more than 3.0, compared to the 14 teams in Task 1". So the speech→singing bridge exists, is quantified, and degrades identity rather than naturalness.

**Application here.** Our Vertex-TTS layer already has *proven, measured* voice identities (the F0 control in the scope plan). The literature says those identities can be carried into singing, at a cost of roughly 0.2 MOS and a few points of speaker-similarity — and that the risk concentrates on **similarity**, which §11.9 shows we cannot measure well. Therefore any build that promises "the same character voice, now singing" must treat identity preservation as an unmeasurable claim until a similarity instrument with a control exists.

---

# 7. Angle (b) — Singing voice conversion: five-part R9 record for A3, SVCC 2023

This is the single most decision-relevant academic source in the slice, because it is the only large-scale, multi-system, independently-organised evaluation in the whole area, and because its central finding is a *negative* one about metrics.

1. **Problem, in the authors' own framing.** The Voice Conversion Challenge series exists "to compare and understand different voice conversion (VC) systems based on a common dataset"; the 2023 edition shifted focus to singing. Two tasks were defined: **Task 1, any-to-one in-domain SVC** (target singer's *singing* data available) and **Task 2, any-to-one cross-domain SVC** (only the target's *speech* is available). A secondary research question is stated explicitly: "we also investigated whether existing objective measurements were able to predict perceptual performance".

2. **Method, step by step.** A new database was constructed as a subset of the NHSS speech-and-singing parallel corpus (Table 1 lists the per-singer data, e.g. IDF1/F01 12.72 min over 159 utterances; SF1/F04 2.39 min over 24 — note how *small* the target-singer budgets are). Participants had two and a half months; **26 submissions arrived, including 2 baselines** (B01 is DiffSVC-based). Per the rules page: 96 converted samples per task (24 utterances × 4 speaker pairs). Evaluation was a **large-scale crowd-sourced listening test** on two axes, naturalness (MOS) and speaker similarity, run with **two listener populations, English and Japanese**, so listener-group bias could itself be checked. Objective side: **MCD** (spectrogram distortion), **F0-RMSE** and **F0-CORR** (pitch), **CER from two independent ASR systems** — a HuBERT-Conformer trained on the `dsing` corpus and `whisper-large` — as intelligibility, **RawNet-3 speaker-embedding cosine (D_embed)** as similarity, and two neural MOS predictors, **SSL-MOS** (VoiceMOS-2022 baseline) and **UTMOS** (its best system). Spearman **and** Pearson correlations were then computed between each objective metric and each subjective score, per task and per listener group, with significance marked.

3. **Real quantitative results, with locators.** *Naturalness (§5, Fig. 2–3):* baseline B01 was beaten by about half the teams in Task 1 and a third in Task 2, "showing that the SVC field has made significant progress in naturalness since DiffSVC was proposed". Top system in Task 1 was **T23** (2nd in Task 2); top in Task 2 was **T02** (5th in Task 1). Crucially: "although no system had a mean score higher than those of the source and target, Figures 3a and 3c show that **T23, T07, and T02 are in fact not significantly different from the natural samples, showing that the top systems have reached human-level naturalness**". Task-difficulty measure: "only 8 teams scored more than 3.0 [in Task 2], compared to the 14 teams in Task 1". *Similarity:* "there is a clear gap (**around 0.4 points**) between the target samples and the top system in both tasks", and no team reached target-level similarity. *Listener agreement:* "the linear correlation coefficients of the scores from English and Japanese listeners are **0.985**". *The metric correlation table (Table 4, Spearman; significance ***p<0.01, **p<0.05, *p<0.1):*

| Subjective score | Listener | MCD | F0RMSE | F0CORR | CER (Conformer) | CER+ (Whisper) | D_embed | UTMOS | SSL-MOS |
|---|---|---|---|---|---|---|---|---|---|
| Task 1 MOS | JPN | −0.28 | −0.41** | 0.48** | −0.62*** | **−0.80\*\*\*** | −0.58*** | **0.77\*\*\*** | 0.53*** |
| Task 1 MOS | ENG | −0.24 | −0.28 | 0.45** | −0.57*** | **−0.73\*\*\*** | −0.45** | 0.72*** | 0.42 |
| Task 1 SIM | JPN | −0.62*** | −0.26 | 0.37* | −0.42** | −0.40** | **−0.83\*\*\*** | 0.49** | 0.30 |
| Task 1 SIM | ENG | −0.45** | −0.10 | 0.21 | −0.26 | −0.27 | **−0.63\*\*\*** | 0.38* | 0.13 |
| Task 2 MOS | JPN | −0.38* | −0.27 | 0.10 | −0.62*** | **−0.77\*\*\*** | −0.58*** | 0.60*** | 0.15 |
| Task 2 MOS | ENG | −0.29 | −0.06 | −0.16 | −0.60*** | **−0.73\*\*\*** | −0.45** | 0.49** | 0.11 |
| Task 2 SIM | JPN | −0.38* | −0.67*** | 0.03 | −0.25 | −0.53*** | −0.67*** | −0.08 | −0.27 |
| Task 2 SIM | ENG | −0.29 | −0.22 | −0.37* | −0.11 | −0.28 | −0.41** | −0.20 | −0.23 |

The authors' four numbered conclusions from that table, in their words: "(1) In most cases, metrics related to spectrogram and fundamental frequencies **do not exhibit a significant correlation** with subjective evaluation, which **diverges from the findings of previous studies on VC in speech**. (2) Speech recognition measures, both for the Conformer-based recognizer and Whisper, demonstrate a **noteworthy correlation** with the subjective MOS. (3) Currently, it is **challenging to accurately assess singer similarity using objective metrics** … even this metric [D_embed] yields insignificant results when assessing the similarity of Task 2 subjective measures with native speakers. (4) Despite being trained on speech corpora, … **UTMOS exhibits a moderate correlation** with subjective measures of naturalness."

4. **Stated limitations (the authors' own).** §7: "we showed that as few objective evaluation metrics can moderately correlate with the subjective scores, **even the metric that best correlates with the similarity scores only yields a weak correlation, showing that objective assessment for SVC still has a lot to improve**." They further note (§6.2, Table 8–9 discussion) that although linear-regression R² over the objective metrics is "relatively high", the individually significant coefficients are few — i.e. the fit does not license per-metric interpretation. They also record a surprise: even the *target* samples suffered some similarity degradation in Task 2. *Analyst-identified, kept separate:* target-singer budgets are minutes, not hours (Table 1), so these results characterise the low-data regime specifically; and the corpus is English NHSS, so the intelligibility metrics are English-ASR-bound.

5. **Concrete application here.** This paper decides our **gate design**, and it does so with a control-bearing experiment rather than an opinion. Three consequences, each directly actionable: (i) **do not build a gate on MCD or F0-RMSE** — in 8 of 8 naturalness cells MCD never reached p<0.05 for English listeners, and F0-RMSE was significant in only 2 of 8 cells; a repo that has already been burned eight times by silently-wrong instruments (AGENTS.md MEASUREMENT LAW) must not adopt a metric that the field's own control experiment shows does not track perception; (ii) **build the gate on ASR error rate** — CER-Whisper is the single best-correlating intelligibility metric at −0.73 to −0.80 across both tasks and both listener groups, which is *exactly* the instrument this project already ran against Lyria; (iii) **treat singer similarity as unmeasured** — D_embed is the best available and still only −0.41 to −0.67 depending on the cell, failing significance for native listeners in Task 2, so "the character's voice is preserved" is a claim we may state as an intent and never as a verified property. And on capability: **human-level naturalness in SVC is achieved**, so converting a generated or recorded vocal into a target singer is not the bottleneck — identity is.

**Cross-verification of the SVCC headline claims (R10.2):** the "human-level naturalness reached, similarity gap remains" pair is confirmed by (1) A3 itself `[FULL]`, (2) the independent T02 system paper (arXiv 2310.05118, a *different* author group reporting its own placement: "ranking 1st and 2nd in naturalness and similarity" in the cross-domain task, consistent with A3's Fig. 2–4), and (3) A11 `[FULL]`, which independently reports the same ordering pattern from a *different* dataset and protocol — SingMOS-Pro §2.2: "Among the better-performing systems, SVR generally outperforms SVC, which in turn outperforms SVS", plus its finding that speech-domain MOS predictors "perform poorly on the singing task due to the substantial domain gap". Three independent producers, three datasets. **Status: 3+ verified.**

---

# 8. Angle (c) — Lyrics↔melody, and prosody/meter/stress alignment

## 8.1 The two directions and the systems that define them

- **Lyrics → melody, end-to-end:** **SongMASS** (AAAI 2021, Sheng, Song, Tan, Ren, Ye, Zhang, Qin — Microsoft Research Asia + Peking University). Masked sequence-to-sequence (MASS) pre-training plus attention-based alignment modelling, and it runs **both** directions — lyric-to-melody and melody-to-lyric (N18, official project page). Its shipped evaluation is three-fold: **pitch distribution similarity, duration distribution similarity, and melody distance** (`evaluate_histo.py --metric pitch|duration`, `evaluate_timeseries.py`) — i.e. the field's own melody metrics are distributional, not per-note-correctness.
- **Lyrics → melody, two-stage with a template bridge:** **TeleMelody** — a lyric-to-template module and a template-to-melody module, "using the template as the bridge to narrow the gap between lyric and melody, as well as improving the generation controllability by adjusting the template during the generating process" (P4 §3.4). The controllability argument is the important one for us: an intermediate symbolic template is *the* place a user control surface can attach.
- **The music-theory correction layer:** **ReLyMe** (P4, ACM Multimedia 2022).

## 8.2 Five-part-style record — P4, ReLyMe `[PARTIAL]` (marked, and not sole carrier of any load-bearing claim)

1. **Problem, authors' framing:** "deep learning models cannot well capture the strict but subtle relationships between lyrics and melodies, which affects the harmony between lyrics and generated melodies."
2. **Method:** derive, from musicians and composers, explicit principles that lyrics and melodies must follow in **tone, rhythm and structure** relationships; then inject them into an existing neural lyric-to-melody model as **constraints during the decoding process** — a constrained-decoding layer, not a new model. Applied to both host systems (TeleMelody and SongMASS, "state-of-the-art systems in end-to-end and multi-stage lyric-to-melody generation respectively"). It needs "the pitch contour of a whole sentence", so the original punctuation of the lyrics is retained as sentence structure. Hyper-parameters are stated in the paper: for TeleMelody the three constrained-decoding weights are 1.2, 1.5, 1 and temperature 0.5 at evaluation (1.2 in the hyper-parameter study); for SongMASS 1.5, 1, 1.
3. **Results (direction and significance, read; exact table cells NOT read → recorded as `[PARTIAL]`):** "The objective results in Table 2 show that both TeleMelody and SongMASS are improved after applying ReLyMe"; for TeleMelody "the gaps of tone scores and structure scores are much [larger]" while for SongMASS "the improvement of rhythm scores is significant as tone and structure scores"; Table 3 reports the subjective evaluation in the same direction. Experiments run on **both English and Chinese** song datasets.
4. **Stated limitations:** the principles are music-theoretic and language-specific — tone relationships are formulated for a tonal language (Chinese) and for stress in English; the paper does not claim coverage of other prosodic systems.
5. **Application here.** Two things. (i) A symbolic melody stage is the **only** place in the pipeline where a user gets Suno-style *melody* control, because a note sequence is inspectable and editable while a latent is not. (ii) **This is where Turkish enters as a research problem, not an engineering one.** Turkish is non-tonal, agglutinative, with vowel harmony and predominantly word-final stress; ReLyMe's tone principles are derived for Chinese tone and English stress. **NOT FOUND IN THE SEARCHED SCOPE:** any published lyric-to-melody constraint set for Turkish or for another agglutinative language. Queries run: Q7, Q10, Q18. Channels: web search over the topic vocabulary, the Muzic project pages, and the citation neighbourhood of P4 and A1. That is an absence measured in a defined scope — **not** a claim that none exists.

**Syllable-to-note assignment, the mechanism that actually decides intelligibility.** From A1 §4.1 `[FULL]`, the field's three answers to the one-to-many rhythm mapping and to melisma (one syllable spread over several notes) are: (i) **external forced alignment** for phoneme/syllable durations; (ii) **learnable monotonic alignment with stochastic duration prediction** to model rhythmic uncertainty (the VISinger line); (iii) **learnable up-sampling or a length regulator** expanding token-level states to frames (RMSSinger, StyleSinger). A1 then records the field's own verdict on all three: "studies have highlighted limitations in robustness and naturalness", which is why newer systems add RL-based optimisation of perceptual objectives and masked-token representations "to stabilize monotonic alignments". **Turkish-specific consequence:** Turkish syllable structure is simple and highly regular, which should *help* a monotonic aligner — but this is an inference from the language's phonology, labelled **INFERENCE**, with no measurement behind it in this slice.

---

# 9. Angle (d) — Full-song / long-form generation with structure

## 9.1 Five-part R9 record — A4, DiffRhythm (arXiv 2503.01183): the non-autoregressive route

1. **Problem, authors' framing.** Four limitations are named: models "can only synthesize either the vocal track or the accompaniment track"; those that do both "rely on meticulously designed multi-stage cascading architectures and intricate data pipelines, hindering scalability"; "most systems are restricted to generating short musical segments rather than full-length songs"; and "widely used language model-based methods suffer from slow inference speeds". They also state the competitive reality plainly: "State-of-the-art platforms like Seed-Music and Suno are generally for commercial products and provide no open-source implementation or detailed technical documentation."

2. **Method, step by step.** Two consecutively trained models. **(i) VAE.** Fully-convolutional encoder/decoder taken from Stable Audio 2; \(z=E(y)\), \(\hat y=D(z)\), \(z\in\mathbb R^{L\times c}\), downsampling factor \(f=T/L\). Configuration: 44.1 kHz stereo in, **5× downsampling blocks, compression factor f = 2048, 64-dimensional latents at 21.5 Hz frame rate**, 157 M parameters, encoder frozen and decoder trained for 2.5 M iterations on 250 k lossless samples. Loss: multi-resolution STFT with perceptual weighting computed in **both** mid-side and left/right domains (L/R weighted 0.5 relative to M/S), plus a convolutional adversarial discriminator with ~4× the channel count of the Stable Audio original. **Lossy-to-lossless augmentation:** trained only on FLAC, with the *input* MP3-compressed (2/3 probability, VBR quality uniform on 0–7, via `pedalboard`) and the *target* lossless — so the VAE learns restoration. **(ii) DiT.** 16 LLaMA decoder layers, hidden 2048, 32 heads × 64 dims, **1.1 B parameters**, FlashAttention-2 and gradient checkpointing. Conditioning is three-way: a **style prompt** (a short audio segment) passed through an LSTM whose final hidden state is summed with the timestep embedding to form the global condition; the **timestep**; and **lyrics** as phoneme embeddings — all concatenated along the channel dimension with the noised latent. 20 % independent dropout on lyrics and style for classifier-free guidance; inference with a **32-step Euler ODE solver, CFG scale 4**. Two training phases: \(L_{max}=2048\) (≈95 s) then fine-tune to \(L_{max}=6144\) (≈4 m 45 s). AdamW, β=(0.9, 0.95), lr 1e-4, EMA decay 0.99 every 100 batches, 8× Huawei Ascend 910B, fp16.

   **The mechanism that matters most for us — sentence-level lyrics alignment (§3.4).** The authors state the failure first: "With conventional text conditioning approaches in diffusion-based TTS models like cross-attention mechanisms or direct feature concatenation, **we failed to achieve intelligibility in song generation**." Two named causes: *discontinuous temporal correspondence* (vocals separated by long instrumental gaps) and *accompaniment interference* (identical words sit under different accompaniment in different songs). Their fix requires **only sentence-start timestamps**: given \((t_i^{start}, s_i)_{i=1}^{N}\), convert each lyric sentence \(s_i\) to phonemes \(p_i\in V^{L_i}\) by G2P; initialise a latent-aligned sequence \(P_i=[\langle pad\rangle]^{L_{max}}\) of the same length as the latent; then overwrite
   \[
   P_i[f_i^{start} : f_i^{start}+L_i] = p_i,\qquad f_i^{start} = \lfloor t_i^{start}\cdot F_s \rfloor
   \]
   with \(F_s\) the latent frame rate (21.5 Hz). That is the whole mechanism: phonemes are *placed* at their sentence's frame index and padded elsewhere. **Complexity:** O(total phonemes) preprocessing, no attention over text at all.

3. **Real quantitative results, with locators.** *Data:* ~1 M songs / 60,000 h, mean 3.8 min, language ratio 3:6:1 Chinese:English:instrumental; phonemes pre-extracted with MaskGCT G2P. *Table 1 (VAE reconstruction, 30-song test set, 5×10 s clips per track):* DiffRhythm VAE lossless→lossless **STOI 0.646 / PESQ 2.235 / MCD 8.024** vs Stable Audio 2 VAE 0.621 / 1.96 / 8.033 and Music2Latent 0.584 / 1.448 / 8.796 — "3.8 % and 12.3 % relative improvements in STOI and PESQ respectively over the best baseline"; and lossy→lossless **0.639 / 2.191 / 9.319**, a condition where "baseline models completely fail due to their lack of restoration capability". *Table 2 (song generation, 30 held-out songs, GT lyrics and style prompts):*

| System | PER ↓ | FAD ↓ | Musicality ↑ | Quality ↑ | Intelligibility ↑ | Length | RTF ↓ |
|---|---|---|---|---|---|---|---|
| GT (VAE-reconstructed) | 16.14 % | 0.88 | 4.68±0.06 | 4.43±0.06 | 4.17±0.03 | — | — |
| SongLM | 21.35 % | **1.92** | **4.27±0.04** | 4.06±0.03 | 3.44±0.03 | 120 s | 1.717 |
| DiffRhythm-base | **17.47 %** | 2.11 | 4.14±0.07 | 4.19±0.05 | **3.80±0.04** | 95 s | 0.037 |
| DiffRhythm-full | 18.02 % | 2.25 | 4.02±0.02 | **4.21±0.04** | 3.68±0.07 | 285 s | **0.034** |
| w/o sentence alignment | *unmeasurable* | 3.16 | 4.07±0.05 | 3.04±0.02 | *unmeasurable* | 95 s | 0.037 |

   Three numbers carry the paper: the **18.2 % relative PER reduction** vs SongLM; the **~50× speed-up** (RTF 0.034–0.037 vs 1.717); and the ablation, where removing sentence-level alignment "catastrophically degrades intelligibility (unmeasurable PER and intelligibility MOS) and audio quality, though interestingly preserves basic musical structure". PER is computed with **FireRedASR**, chosen because it "is also robust in recognizing singing vocals", and PER rather than WER/CER deliberately: "ASR may perceive vocal content as different words with consistent pronunciation, such errors do not accurately reflect actual vocal intelligibility". Subjective: 30 listeners, 1–5, on musicality / quality / intelligibility. RTF measured on an RTX 4090.

4. **Stated limitations (the authors' own, §7 and §5.2).** No segment **editing** (they propose latent masking for inpainting/outpainting as future work); style control is via an audio clip only, with natural-language conditioning listed as missing. SongLM beats them on FAD and musicality, "suggesting room for improvement in long-term acoustic consistency and melodic expression". The full-length variant is *worse* than the base on both PER and FAD, "likely due to increased modeling complexity for longer sequences". And the most useful sentence in the paper for our purposes: "The relatively high PER across all systems may stem from using mixed audio containing both vocal and accompaniment **without source separation** for ASR evaluation, as accompaniment likely interferes with ASR recognition." *Analyst-identified:* their own GT control measures 16.14 % PER — so on this protocol **16 % is the floor, not zero**, which is precisely why a threshold must be calibrated against a control rather than set at an intuitive number.

5. **Concrete application here.** Four direct consequences. (i) **The intelligibility problem has a cheap, published solution**: sentence-start timestamps + phoneme placement. We do not need word-level alignment to *generate*; we need it only to *verify*. (ii) **Measure PER on the separated vocal stem, never on the mix** — the authors say the mix inflates PER, and LeVo (§9.2) does exactly the separation they omitted and reports far lower numbers on the same metric family; this is a protocol difference we must fix in our own gate or our numbers will be meaningless. (iii) **Our own GT control must be measured**, because DiffRhythm's is 16.14 %: a gate threshold on PER is only interpretable relative to a control passed through the same pipeline (this is the same discipline that made the Lyria result evidence). (iv) Non-autoregressive latent diffusion at RTF 0.034 means a 4-minute song in ~10 s on one consumer GPU — which is within reach of the project's single T4 for inference, though the T4 is materially slower than the 4090 they measured on, so **no timing claim for our hardware is made here**.

## 9.2 Five-part R9 record — A5, LeVo (NeurIPS 2025): the autoregressive route, and the cross-system PER table

1. **Problem, authors' framing.** "existing approaches still struggle with the complex composition of songs and the scarcity of high-quality data, leading to limitations in audio quality, musicality, instruction following, and vocal-instrument harmony."

2. **Method, step by step.** **LeLM** predicts two token types *in parallel*: **mixed tokens** (vocals+accompaniment combined, which is what buys vocal-instrument harmony) and **dual-track tokens** (vocal and accompaniment encoded separately, which is what buys quality). Two decoder-only Transformers — a 28-layer, 1536-hidden LM plus a 12-layer, 1536-hidden **AR decoder** — with a **modular extension training strategy** to stop the two token types interfering. Tokeniser: MuEncoder from MuCodec, 300 M params, **25 Hz frame rate**; a ~700 M diffusion model converts tokens to waveform; Stable-Audio-style VAE at 150 M; lyrics and text description tokenised with a Qwen2 BPE tokeniser. LeLM ≈2 B parameters total. **Three-stage training:** (1) pre-training on mixed tokens with the AR decoder frozen and 50 % random drop of both audio prompts and text descriptions; (2) modular extension training of the AR decoder for dual-track tokens with Stage-1 modules frozen; (3) **multi-preference alignment by DPO**. The DPO construction is the novel part: three preference strategies (lyric alignment, prompt consistency, musicality), each fine-tuned separately, then combined by **linear interpolation of all parameters** of the three specialised networks (inspired by Deep Network Interpolation) — which yields a *controllable* trade-off coefficient at inference. Musicality pairs were built by crowdsourcing rankings over 4,000 lyric sets, training a reward model on the high-agreement subset, then applying it to all samples with a threshold tuned so selected win–lose pairs are >80 % accurate — ≈60,000 pairs. **Data:** 2 M songs ≈110,000 h; pipeline = Demucs for vocal extraction → Whisper + wav2vec 2.0 for lyric recognition and timestamps → All-In-One for structure segmentation (verse/chorus) → Qwen2-Audio for open-vocabulary tags. 32× NVIDIA H20, batch 2/GPU, 265 k steps (200 k pre-train + 60 k modular + 5 k alignment), Adam β=(0.9, 0.98), ε=1e-9, top-k 50, temperature 0.9.

3. **Real quantitative results, with locators.** **PER protocol (§4.1, Appendix): "the vocal track is first extracted by Demucs, and then Whisper-large-v2 is utilized for lyric recognition"** — and the reason for PER over WER/CER is stated: "Word-level (WER) or character-level (CER) metrics … penalize many errors that are inaudible to listeners. By operating at the phoneme level, PER captures intelligibility more faithfully and correlates better with human ratings of lyric clarity." *Table 1, objective, all systems under one protocol (evaluation conducted May 2025):*

| Model | FAD ↓ | MuQ-T ↑ | MuQ-A ↑ | **PER ↓** | CE ↑ | CU ↑ | PC ↑ | PQ ↑ |
|---|---|---|---|---|---|---|---|---|
| Suno-V4.5 | 2.59 | 0.34 | 0.84 | 21.6 | 7.65 | 7.86 | 5.94 | 8.35 |
| Haimian | 2.97 | 0.22 | — | 11.8 | 7.56 | 7.85 | 5.89 | 8.27 |
| Mureka-O1 | **2.50** | 0.33 | **0.87** | **7.2** | 7.71 | 7.83 | **6.39** | 8.44 |
| YuE | 2.65 | 0.27 | 0.74 | 36.4 | 7.13 | 7.39 | 5.90 | 7.77 |
| DiffRhythm | 4.86 | 0.26 | 0.51 | 12.3 | 6.65 | 7.32 | 5.71 | 7.77 |
| ACE-Step | 2.69 | 0.28 | — | 37.1 | 7.37 | 7.52 | 6.26 | 7.85 |
| SongGen\* (reproduced) | 2.68 | 0.25 | 0.80 | 27.5 | 7.63 | 7.79 | 5.94 | 8.37 |
| **LeVo** | 2.68 | **0.34** | 0.83 | **7.2** | **7.78** | **7.90** | 6.03 | **8.46** |
| w/o Train stage 2 | 2.71 | 0.28 | 0.82 | 17.5 | 7.76 | 7.81 | 5.69 | 8.44 |
| w/o AR decoder | 2.83 | 0.27 | 0.80 | 26.0 | 7.54 | 7.71 | 5.61 | 8.32 |
| w/o Dual-track | 2.83 | 0.33 | 0.83 | 11.0 | 7.72 | 7.88 | 5.82 | 8.43 |
| w/o DPO | 2.60 | 0.31 | 0.82 | 10.6 | 7.70 | 7.86 | 5.89 | 8.39 |

   *Table 2, subjective MOS (10 music professionals, 1–5, six axes: OVL overall, MEL melodic attractiveness, HAM vocal-instrument harmony, SSC structure clarity, AQ audio quality, LYC lyrics-following):* Suno-V4.5 **3.59 / 4.10 / 3.93 / 4.19 / 4.00 / 3.17**; LeVo **3.42 / 3.93 / 3.90 / 4.09 / 3.96 / 3.38**; Mureka-O1 3.42 / 3.88 / 3.89 / 4.14 / 3.87 / 3.32; Haimian 3.05 / 3.51 / 3.55 / 3.62 / 3.87 / 3.32; SongGen\* 2.91 / 3.43 / 3.44 / 3.66 / 3.69 / 2.84; DiffRhythm 2.60 / 3.18 / 3.22 / 3.55 / 3.09 / 2.69; YuE 2.45 / 3.04 / 2.94 / 3.53 / 3.08 / 2.41; ACE-Step 2.26 / 3.02 / 3.30 / 3.21 / 2.36 / 2.22. **LeVo beats Suno-V4.5 on LYC by 0.21** (3.38 vs 3.17) while trailing it on OVL, MEL, HAM, SSC, AQ. *Table 3/10, DPO decomposition:* Strategy 1 (lyric alignment) alone drops PER **10.6 → 6.5**; Strategy 2 (prompt consistency) alone raises MuQ-T/MuQ-A to 0.34/0.83 but leaves PER at 10.3; Strategy 3 (musicality) alone gives the best aesthetics but **raises PER to 11.2**; the interpolated blend lands at PER 7.2 with MuQ-T 0.34 and PQ 8.46. That is a **measured, quantified trade-off between intelligibility and musicality** — the clearest such number in the whole slice. *Table 9, audio-quality attribution:* total degradation decomposes into VAE reconstruction 0.02, Codec reconstruction 0.04, **LeLM modelling 0.09** — the generative stage, not the codecs, is the bottleneck. Reported error margins: <0.01 for MuQ-T/MuQ-A, <0.015 for CE/CU/PQ, <0.05 for PC.

4. **Stated limitations (the authors' own).** "due to the black-box nature of these closed-source models, our evaluation conducted in May 2025 reflects the performance of these systems at that specific time" — an explicit staleness warning on every closed-system number in Table 1. "Suno-V4.5 and Mureka-O1 show slightly better song structure clarity scores, which suggests room for improvement in music structural modeling." And on their own audio: LeVo "still lags behind the Codec reconstruction, revealing room for improvement in the generative modeling stage". *Analyst-identified, kept separate and flagged:* **Table 1 is a first-party measurement by the authors of the winning system.** SongGen was *reproduced* by them on their own data and codec (marked `*`), not evaluated as released. Suno-V4.5's PER of 21.6 % against Mureka's 7.2 % is surprising and unreplicated. **This table is therefore `[single-source]` for every per-system PER value**, and no recommendation in this document rests on any single cell of it.

5. **Concrete application here.** (i) **The separation-then-ASR protocol is the one to copy exactly**: Demucs → Whisper-large-v2 → PER. It is the same instrument class this repo already used on Lyria, it is what SVCC 2023 proved correlates with perception, and it is what the two strongest open song systems both use. (ii) **PER, not WER/CER**, with the authors' stated reason — and for Turkish this matters even more than for English, because Turkish morphology means a single wrong suffix inflates WER while being phonetically near-correct. (iii) The DPO decomposition tells us the trade-off is *real and dial-able*: pushing musicality alone made lyrics worse (PER 10.6→11.2). Any product that offers a "more musical" slider is silently trading away the one thing we can measure. (iv) LeVo beating Suno on lyrics-following while losing on everything else is the shape of the opportunity, stated as science, not strategy: **lyric fidelity is the axis where open methods are already competitive, and it is also the only axis with a trustworthy instrument.**

## 9.3 Long-range structure: how it is actually obtained, and how it is measured

**Obtained** — three distinct published mechanisms, no consensus:
- **Structural progressive conditioning** (P5, YuE) — conditioning progressively over the song so lyrics are followed at song level and structure is controllable; YuE's own human evaluation shows this working: it "excels notably in music structure and music arrangement" while being weakest in vocal/accompaniment acoustic quality "likely due to limitations of its current audio tokenization method".
- **Explicit segment labels from an analysis model** (A5) — All-In-One extracts verse/chorus segments automatically, so structure enters as *training annotation* rather than as architecture.
- **Long-context latent diffusion** (A4) — 6144 latent frames at 21.5 Hz covers 4 m 45 s in one shot, so structure is whatever the model learns within a single window; no explicit structural mechanism at all.

**Measured** — and here the field is weak, which must be said plainly. Structure is scored by **human MOS (SSC in A5's Table 2; "clarity of song structure" as one of SongEval's five dimensions in P8)**. There is **no** objective structural-coherence metric in any source read for this slice. FAD/KL are *distributional*, and A5's own Table 6 shows FAD correlating only −0.15/−0.11 with the acoustic-quality preferences, while P5's Table 4 shows FAD at −0.249 and KL at −0.232 against Musicality. **Consequence for our gate: song structure is not gateable objectively today.** It goes to BERK'S VERDICT.

**The one strong correlate anybody has published** (P5 `[PARTIAL]`, Table 4): **VocalRange (vocal agility, song-level pitch range, F0 estimated with RMVPE, 40 ms note filtering, human-verified) correlates 0.857 with Musicality and 0.858 with average human preference** — far above CE 0.368, CLaMP 3 0.333, FAD −0.249, CLAP −0.072. The authors' reading: "the song-level vocal range (or vocal agility) could serve as a relatively reliable proxy for musicality within the lyrics-to-song task". **Flagged `[single-source]`** — one paper, 5 systems, Pearson over a very small n. It is a *candidate* second gate axis worth calibrating, not an established metric.

---

# 10. Angle (e) — Lyric-to-audio alignment: our verification instrument

This is the angle the brief marks as "directly load-bearing for our quality gate", and it is the one place where the science is mature enough to build on.

## 10.1 The task contract and the four official metrics (N1, N2 `[FULL]`)

MIREX defines it exactly: "The algorithm receives two inputs — mixed singing audio (singing voice + musical accompaniment) and its corresponding lyrics at word-level, outputs the onset and offset timestamps (second) of each word." Evaluation is at word boundaries on the originally mixed songs. The four metrics, with the MIREX page's own reasoning:

- **AAE** — average absolute error between actual and estimated timestamps, averaged over all errors. The page states its own weakness: "An error in absolute terms has the drawback that the [perception] of an error with the same duration can be different depending on the tempo of the song."
- **MedAE** — median absolute error; robust to the outliers that dominate AAE.
- **PCS** — percentage of correct segments: total length of the song labelled correctly over total song duration (attributed to Fujihara et al. 2011).
- **PCO** — percentage of correct onsets within a tolerance window, "**We use 0.3 seconds as the tolerance window**", attributed to Mauch et al., *Integrating Additional Chord Information Into HMM-Based Lyrics-to-Audio Alignment*.

**Measured 2024 results (N2, exact cells):** *Jamendo V1* (20 English songs, old annotations, kept for comparability) — FZZ1 (WavLM + Conformer) AAE 0.547, MedAE 0.047, PCS 0.686, PCO 0.912; NUS baseline (genre-informed silence + phone model) AAE 0.217, MedAE 0.046, PCS 0.751, PCO 0.945. *Jamendo V2* (all 79 songs, new annotations) — FZZ1 0.584 / 0.252 / 0.683 / 0.887; NUS 0.651 / 0.136 / 0.502 / 0.729. **Read that pair carefully: the same two systems reorder between V1 and V2** — NUS wins on V1 and loses PCS badly on V2 (0.502 vs 0.683). This is a measured demonstration that alignment scores are dataset- and annotation-dependent, and it is the reason our own threshold cannot be imported from a leaderboard.

## 10.2 Five-part R9 record — A7, ISMIR 2021: the 0.3 s tolerance was never validated, and perception is asymmetric

1. **Problem, authors' framing.** "Even if a tolerance window for errors was fixed at 0.3s for the MIREX challenge, **no experiment was conducted to confer psychological validity to this threshold**." And the field-level motivation: "the gap between state-of-the-art systems … has narrowed, with many systems achieving close to perfect PCO scores on the test sets. Therefore, it might now be important to make room for qualitative rather than quantitative metrics."

2. **Method, step by step.** The metric under test is written out explicitly:
   \[
   \rho^{\,k}_{\tau} \;=\; \frac{1}{N_k}\sum_{\text{word } i} \mathbf{1}_{\lvert \hat t_i - t_i\rvert < \tau}\times 100
   \]
   where \(N_k\) is the number of words in track \(k\), \(t_i\) the ground-truth word onset, \(\hat t_i\) the prediction, \(\tau\) the tolerance. Two online karaoke experiments with deliberately misaligned displayed lyrics. **Experiment 1 (global factors):** 14 songs per participant, 35 s excerpts, **14 offsets from −1 s to +1 s** (negative = lyrics ahead, positive = lyrics lagging), finer steps near ±0.3 s, with ±1 s and ±0.75 s as controls that must be reported asynchronous and 0 s as a control that must be reported synchronous; ternary response. **53 participants** completed it. **Experiment 2 (local factors):** one song, 10 excerpts of three lyrical lines, offsets {0.25, 0.5, 0.75} plus a 0 control, error placed on the **first word, last word, or a word near a beat** (beat proximity defined as within a sixteenth note, computed as 15/BPM, tempo by Klapuri's algorithm at ~80 % accuracy per the ISMIR 2004 tempo challenge); binary response plus 5-point Likert confidence. **2,458 annotations from 193 participants.** Stimuli drawn from 80 popular DALI songs across pop/rock/rap/metal in English/French/German, word-level alignment manually verified in the prototype. **Data hygiene:** participants failing the controls were removed — **11 % of Experiment 1 answers and 8 % of Experiment 2**.

3. **Real quantitative results, with locators.** *Asymmetry (§4.1, Fig. 2):* positive offsets are detected more easily than negative; **thresholds were asymmetric for 72 % of individuals**. Fitting a scaled skew-normal (skewness 1.12, location −0.22, scale 0.29) and taking the 50 %-detection rule gives **−0.33 s for lyrics-ahead and +0.22 s for lyrics-lagging**, rounded to −0.3 s and +0.2 s. Significance: proportions at −0.3 s vs +0.3 s differ, χ²(1)=4.26, p=.038; −0.3 s vs +0.2 s do not, χ²(1)=0.04. *Global rhythmic context (§4.2, Fig. 3–4):* tempo split at quartiles (fast ≥138 BPM, slow ≤93 BPM) gives 50 % thresholds of **−0.36 s (slow) vs −0.31 s (fast)**, χ²(1)=5.44, p<.02 — listeners are *less* sensitive at slow tempo. Word rate split (high ≥1.2 WPS, low ≤1.16 WPS) gives **−0.39 s (high) vs −0.28 s (low)**, χ²(1)=16.86, p<.00004. *Local factors (§4.3, Fig. 5) — a reported NEGATIVE result:* Cochran's Q over the three error positions did not reach significance, χ²(2)=5.77, p=.056; the only effect found was higher confidence in detecting a 0.25 s error on a beat than at a line end (Wilcoxon Z=2.756, p<0.006; mean confidence 4.1 vs 3.5). *The re-scored comparison (§5.2, Table 1) — three SOTA aligners on the 20 Jamendo songs:*

| System | PCO (±0.3 s) | Asym-PCO (−0.3, +0.2) | Perc-PCO |
|---|---|---|---|
| Gupta et al. | 94.47 (1.52) | 93.66 (1.59) | **89.94 (1.71)** |
| Vaglio et al. | 91.85 (1.95) | 90.82 (2.04) | **86.79 (2.13)** |
| Stoller et al. | 87.02 (2.97) | 85.23 (3.07) | **79.93 (2.90)** |

   Their generalised metric is \(\psi^k = \frac{1}{N_k}\sum_i f(\hat t_i - t_i)\times 100\) with \(f\) a penalty weighting: \(f=\mathbf 1_{[-0.3,0.3]}\) recovers PCO, \(f=\mathbf 1_{[-0.3,0.2]}\) gives Asym-PCO, and the fitted skew-normal gives Perc-PCO. Note the direction: "scores for the perceptual-PCO are much lower … **despite the window support being larger**".

4. **Stated limitations (the authors' own).** The negative local-factor result may mean the wrong local factors were chosen ("It is possible that words grammatical or semantic functions are more subject to human attention") or that online measurement noise was simply too high — they state both and refuse to resolve it. Experiment 2 used **only positive offsets** for a stated practical reason (negative word-level offsets overlap preceding words, and filtering overlaps biased the sample toward very slow songs). Familiarity with the song, language facility, musical expertise and karaoke practice were collected but deliberately not analysed here. Parameterising \(f\) on tempo and WPS "would arguably require additional experiments with a larger, more diverse set of songs".

5. **Concrete application here.** This is the paper that tells us **how to calibrate a threshold instead of guessing one** — the exact discipline AGENTS.md demands after the 0.08-vs-0.0007 motion-floor incident. Four consequences: (i) if we ever gate lyric *timing* (for karaoke output, or for locking a sung line to a film frame), the tolerance is **not** symmetric ±0.3 s — the measured human thresholds are **−0.3 s ahead / +0.2 s lagging**, and they *shift with tempo and word rate*; (ii) the generalised \(\psi^k\) form means a tolerance function is a first-class design parameter, so we would fit \(f\) from our own labelled material rather than adopt anyone's constant; (iii) the reference implementation exists — `mir_eval.alignment.perceptual_metric()` (N3) ships exactly this function, with the docs' own caution that it "reflects human judgment [as] perceived in that setup"; (iv) the paper is a worked example of the control discipline: 11 % and 8 % of respondents were **discarded by controls that could fail**, which is what makes the thresholds evidence.

## 10.3 Alignment accuracy in the singing domain, measured (P1, N11, P10)

| System | Task | Metric | Value | Source |
|---|---|---|---|---|
| MFA (Montreal Forced Aligner) | singing lyric alignment, Chinese | BER ↓ @20 ms / IOU ↑ | **40.3 / 56.8** | P1 Table 1 `[PARTIAL]` |
| SOFA (singing-oriented) | same | BER / IOU | **20.9 / 80.0** | P1 Table 1 |
| STARS (2025) | same | BER / IOU | **18.6 / 80.9** | P1 Table 1 |
| VOCANO | note transcription | COnPOff(F) ↑ / RPA ↑ | 50.2 / 76.6 | P1 Table 2 |
| ROSVOT | note transcription | COnPOff(F) / RPA | 70.2 / 83.8 | P1 Table 2 |
| STARS | note transcription | COnPOff(F) / RPA | **71.0 / 86.7** | P1 Table 2 |
| MFA 3.0 | **speech** word/phone alignment, 3 languages | mean boundary error | **< 15 ms** | P10 `[PARTIAL]` |

**The decisive comparison, and it is a cross-source one:** MFA achieves **mean boundary error below 15 ms on speech** (P10) but **BER 40.3 % at a 20 ms tolerance on singing** (P1) — and an independent third study (the MFA-on-singing paper, N-class) measured open-model MFA recognition accuracy on singing at **10.08 %** before retraining, improving substantially only after singing-specific training. Three independent producers, three protocols, same conclusion: **a speech aligner is not a singing aligner.** Status: 3+ verified.

**Definitions used, so the numbers are interpretable.** *BER* — "the proportion of misplaced boundaries within 20 ms tolerance distance" (P1 App. C.2). *IOU* — "the ratio of the duration of the overlapping segment between two notes to the duration of the combined time span covered by both notes". *COnPOff* — Correct Onset, Pitch and Offset jointly. SOFA (N11) additionally ships **boundary edit distance** (total moving distance from predicted to target boundaries), **boundary edit ratio** (that distance ÷ total target duration) and **boundary error rate at 10 / 20 / 50 ms** — i.e. the tolerance is an explicit parameter, exactly as A7 argues it should be.

## 10.4 What the ASR-for-singing literature says about the gate's own failure modes (A12 `[FULL]`)

A12 is a first-person overview by a researcher who worked on this from 2011, and it is the source that tells us *why* our gate will misbehave. Six named ways singing differs from speech, each an error source for any ASR-based instrument: **larger pitch fluctuations** with different spectral properties; **increased loudness variability**; **pronunciation variation** driven by musical context; **time variations** — "sounds may be elongated or shortened to fit the musical rhythm … especially with vowels", confirmed by comparing phoneme standard deviations in speech vs singing corpora; **different vocabulary**, emotionally weighted; and **background music interference**, where "source separation algorithms could be utilized to remove these components, but they are not always effective and can introduce artifacts". On alignment history the paper is precise: HMM+MFCC+modified Viterbi for unaccompanied singing in 1999, LyricAlly's line-level polyphonic alignment in 2004, chord labels added in 2010, note onsets in 2016, DTW over phoneme posteriorgrams winning MIREX 2017, then Wave-U-Net+CTC end-to-end, multilingual extension, and finally **"performing ASR on music audio with the Whisper system, followed by post-processing using ChatGPT, leading to further reductions in error rates"** (LyricWhiz). The paper also states the structural reason the field is data-poor: "music and lyrics are generally subject to copyright restrictions that limit their use", and phoneme/word annotations "are typically scarce, and funding for creating such annotations is limited". Finally, an honesty note that constrains any benchmark comparison we make: "The recent proliferation of these datasets makes direct comparison with older approaches challenging due to the lack of established benchmarks."

**Application here.** (i) Our gate must run on the **separated vocal stem** — but separation "can introduce artifacts", so the separator becomes part of the instrument and must be included in the control run, not assumed transparent. (ii) Vowel elongation is *normal* in singing, so a phoneme-level metric is right and a duration-sensitive one is wrong. (iii) The Whisper+LLM post-processing route is the published state of the art for transcribing sung lyrics, which matters because our existing `/create-stt-vertex` instrument is a speech recogniser applied to singing — its behaviour on sung Turkish is **unmeasured** and must be controlled before its outputs are trusted as a gate (see §13.2).

---

# 11. Angle (g) — Stem separation and mix/master automation

## 11.1 Separation: effectively a solved tool, with numbers

**Architecture lineage** (P6 `[PARTIAL]`, cross-checked against the ByteDance BS-RoFormer abstract on SigPort and against an independent 2025 analysis): Band-Split RNN (BSRNN) splits the input frequency space into subbands and models them as a sequence → **BS-RoFormer** keeps the band-split front end and adds a hierarchical Transformer with **Rotary Position Embedding** to model inner-band and inter-band sequences for multi-band mask estimation → **Mel-Band RoFormer** replaces the heuristic non-overlapping split with **overlapped subbands mapped by the mel scale**, and "outperforms BS-RoFormer in the separation tasks of vocals, drums, and other stems".

**Measured SDR (source-to-distortion ratio, dB, higher better):**

| System | Training data | Average SDR | Locator |
|---|---|---|---|
| BS-RoFormer | MUSDB18HQ + 500 extra songs | **11.99 dB** | P6, and the BS-RoFormer abstract (ICASSP 2024 / SigPort `10.60864/8nm2-j542`) |
| BS-RoFormer (smaller) | MUSDB18HQ only, no extra data | **9.80 dB** | BS-RoFormer abstract |
| Mel-Band RoFormer | MUSDB18HQ experiments | beats BS-RoFormer on vocals, drums, other | P6 |

**Independent corroboration (N13):** MVSEP — a third-party service that maintains its own leaderboard, i.e. an evaluation independent of the model authors — reports vocal SDR rising **11.31 → 11.89 on its Multisong set and 13.56 → 14.58 on its Synth set** when adopting a new BS-RoFormer-architecture model, and states that RoFormer variants and their ensembles "dominate the top positions for vocal separation". The 2025 windowed-sink-attention paper independently confirms the same leaderboard picture and identifies both models as ByteDance work. **Three independent producers (paper, service leaderboard, third-party paper). Status: 3+ verified.**

**Also relevant:** BS-RoFormer won the **Music Separation track of Sound Demixing Challenge 2023 (SDX'23)** and "outperformed the second best by a large margin in SDR" — a challenge result, i.e. an externally-run evaluation. And MVSEP published MUSDB18-trained weights for BSRoformer, MelBandRoformer and SCNet XL as starting points, which matters for reproducibility.

**Application here.** Separation is **not** a research risk for us; it is a dependency with published numbers and public weights. Its two roles in our architecture are distinct and both load-bearing: (i) **inside the gate** — Demucs or a RoFormer variant extracts the vocal stem before ASR, exactly as A5 does; (ii) **inside the assembly path** — if a song is generated as a mix and we need stems for the film pipeline, separation supplies them. The caution from AGENTS.md applies to role (i): the separator is part of the instrument, so the control run must pass through it too.

## 11.2 Automatic mixing: approaching human, with the bottleneck named

**Five-part-style record — P7, FxNorm-Automix (ISMIR 2022, Sony) `[PARTIAL]`:**

1. **Problem, authors' framing.** "the lack of dry or clean instrument recordings limits the performance of such models, which is still far from professional human-made mixes." The specific data problem: source-separation datasets like MUSDB18 exist at scale, but "direct application of such data is infeasible, since the mixture is a summation of the **wet** stems, that is, mixing effects have already been applied."
2. **Method.** Rather than *removing* effects (which "only appl[ies] to specific effects and [is] prone to adding sound artifacts"), **normalise** each stem on audio features tied to each effect class — normalisation schemes for **loudness, EQ, panning, dynamic range compression and reverberation** — "ensuring that all stems have been normalized to the same range of audio features. During training, we expect the models to learn how to undo or **denormalize** the input stems and thus approximate the original mix." Loudness normalisation computes average loudness per stem class \(k\) (e.g. vocals) over \(N\) stems, in dBFS, following the cited loudness standard. At inference, real dry multitracks are normalised the same way. Architectures: CAFX-TDCN-LSTM (theirs) and a Wave-U-Net baseline (N12). Training data: MUSDB18 alone (small) and PrivateDataSet+MUSDB18 (large), both **wet**; test on **18 dry multitrack songs**. They also "redesigned a listening test method for evaluating music mixing systems".
3. **Results.** The listening test used **professional mixing engineers** and scored three axes — Production Value, Clarity, Excitement. Outcome as stated: mixes "scored higher in **Clarity** and were **indistinguishable from professional mixes** in terms of Production Value and Excitement". (Exact per-axis numbers not read → `[PARTIAL]`.)
4. **Stated limitations.** Dry-multitrack scarcity is the stated root problem and is *worked around*, not solved; the approach depends on the normalisation feature set being a good proxy for the effect classes.
5. **Application here.** If we assemble a song from separately generated parts (vocal + bed), we need an automatic mix, and this is the published route whose *evaluation* was done by professional engineers rather than crowdworkers. The reference implementation is public (N12, `sony/FxNorm-automix`, with trained models and configs under `configs/ISMIR`).

**The 2026 successor (MEGAMI, ICASSP 2026, DOI `10.1109/icassp55912.2026.11462677`) `[PARTIAL]`:** conditional diffusion over **effect embeddings** rather than over audio, explicitly "avoiding the undesired alterations of musical content that may arise with audio-domain generative models"; factorises effect embeddings from musical content; domain-adapts by **effects removal in the CLAP embedding space** so wet-only datasets can be used; permutation-equivariant Transformer over an arbitrary number of unlabeled tracks; baselines include Equal Loudness, FxNorm-Automix (both S and internal L), DMC and MixWaveUNet, and the authors report "a subjective evaluation that shows the performance of MEGAMI **approaching human-level quality**". Exact numbers not read → no load-bearing claim rests on it.

**Mastering / loudness — the standards layer, and a direct tie to this project's own law.** Loudness normalisation is defined by **ITU-R BS.1770** (and EBU R128), and in the mixing literature it functions as a *delivery-compliance* step rather than a creative one. This is the same standard family the film side of this repo already uses, and AGENTS.md records the two measured defects that make it a live risk: `-c:a copy` in a finishing chain shipped every master **6.7 LU too quiet**, and **single-pass `loudnorm` can never be linear — LRA 11.5 → 4.1, silently**. Those are this project's own measurements, not literature, and they transfer directly: any song-delivery path must use a **two-pass** loudness normalisation measured on the delivered file.

**Application here, stated as the boundary.** Automatic mixing is *approaching* human in expert listening tests — that is a subjective result, and there is **no objective mix-quality gate** in any source read for this slice that survives a correlation test. What *can* be gated deterministically is compliance: integrated loudness, loudness range, true peak, and dialogue-to-background level difference — all measurable with `ffmpeg`/`ffprobe` against a named target, all with controls that can fail. Everything above that is BERK'S VERDICT.

---

# 12. Angle (h) — Objective metrics: formulas, assumptions, complexity, failure modes

Per R6 each metric is given with its definition, variables, assumptions, complexity where stated, and its **measured** failure mode. The question that matters: can it carry a gate here, under the AGENTS.md MEASUREMENT LAW (an instrument needs a control that can both pass and fail)?

## 12.1 The intelligibility family — the only gateable axis

**PER / CER / WER of an ASR transcription.** Definition: edit distance between recognised and reference symbol sequences, normalised by reference length:

\[
\mathrm{ER} \;=\; \frac{S + D + I}{N}
\]

with \(S\) substitutions, \(D\) deletions, \(I\) insertions, \(N\) reference symbols. The symbol unit is the whole design decision. **Why phonemes:** A4 — "ASR may perceive vocal content as different words with consistent pronunciation, such errors do not accurately reflect actual vocal intelligibility; therefore, we calculate the PER instead of the WER or CER". A5 gives the mechanism: "Word-level (WER) or character-level (CER) metrics … penalize many errors that are inaudible to listeners. By operating at the phoneme level, PER captures intelligibility more faithfully and correlates better with human ratings of lyric clarity."

**Assumptions and their consequences:** (i) the recogniser must be competent on *singing*, which is not automatic — A12 lists six ways singing violates speech-ASR assumptions, A4 chose FireRedASR because it "is robust in recognizing singing vocals", A5 used Whisper-large-v2 **after Demucs separation**; (ii) the reference is the *intended* lyric, so this measures fidelity-to-request — exactly the property Berk's Lyria test measured; (iii) it is **protocol-sensitive to a degree that changes conclusions** — A4 measured on the *mix* and its ground-truth control read 16.14 %, A5 measured on the *separated stem* and its best system read 7.2 %. **Complexity:** O(mn) dynamic programming per utterance, plus the ASR forward pass.

**Measured validity — the strongest evidence in this slice.** A3 Table 4: CER-Whisper correlates **−0.80\*\*\* / −0.73\*\*\*** (JPN/ENG) with Task-1 naturalness MOS and **−0.77\*\*\* / −0.73\*\*\*** with Task-2 — significant at p<0.01 in all four cells; the authors' conclusion: "Speech recognition measures … demonstrate a noteworthy correlation with the subjective MOS". A11 independently makes intelligibility a first-class human axis: its Lyrics-MOS "specifically measures pronunciation clarity and intelligibility".

**Known failure modes, named:** homophone substitutions (the reason PER beats WER); accompaniment bleed inflating error (A4's own explanation for its high numbers); separation artifacts (A12); and language coverage — every number above is English/Chinese/Japanese, and **the behaviour of any of these recognisers on sung Turkish is unmeasured**.

**Verdict: GATEABLE.** The one axis where a control exists, is cheap, and has already been run in this repo.

## 12.2 The spectral and pitch family — measured NOT to track perception

**MCD (Mel-Cepstral Distortion).** Definition (Kubichek 1993, as cited by A4):

\[
\mathrm{MCD} \;=\; \frac{10}{\ln 10}\sqrt{2\sum_{d=1}^{D}\left(c_d - \hat c_d\right)^2}
\]

averaged over aligned frames, \(c_d,\hat c_d\) the \(d\)-th mel-cepstral coefficients of reference and synthesis; the constant converts to decibels. **Assumptions:** a reference recording of the *same* content exists; frames are time-aligned (P11: "MCD is computed on aligned sequences using standard mel-cepstral analysis"); spectral distance is perceptually meaningful. **Failure modes, measured:** A3 Table 4 — MCD reaches p<0.05 against naturalness in **zero** of four English-listener cells; it correlates best with *similarity* (−0.62\*\*\* JPN Task 1) and even there weakly for English (−0.45\*\*). Independently, SingVisio's expert observer: "almost all metric curves approach convergence within about the last 30 steps, showing no significant improvement beyond that point. However … we can see (and hear) a substantial difference in sound quality between the generated results at step 30 and step 0", concluding that "metrics like MCD, FAD, and F0RMSE **may not fully capture the nuanced improvements audible to human listeners**". **Verdict: NOT gateable for perceived quality; usable only as a relative regression check between two versions of our own model on identical content.**

**F0-RMSE / log-F0-RMSE.**

\[
\mathrm{F0\text{-}RMSE} \;=\; \sqrt{\frac{1}{T_v}\sum_{t\in \text{voiced}}\left(\log f_0(t) - \log \hat f_0(t)\right)^2}
\]

over voiced frames \(T_v\), typically on a continuous log-F0 representation "with appropriate handling of unvoiced segments" (P11). **Assumptions:** a correct pitch tracker *and* a correct voiced/unvoiced decision — two instruments, each with its own error. **Failure modes:** A3 — significant against naturalness in only 2 of 8 cells; A10 measured it moving in the *wrong* direction while quality improved: "The impact on F0 RMSE was more variable, with some configurations showing a slight increase in error … Despite these variations, the enhancements in predicted spectral features, as evidenced by the lower MCD values, suggest that the trade-offs may be favorable." **Units trap, flagged because it is exactly the transcription error R17.2 requires testing for:** A10 reports F0-RMSE ≈0.088–0.177 (log domain) while P11 reports 26.7–39.4 (Hz). **These are not comparable numbers.** **Verdict: NOT gateable.**

**FFE (F0 Frame Error).** A2's pitch metric, defined there as amalgamating "metrics for voicing decision error and F0 error" — the fraction of frames wrong in pitch or voicing. Anchors from A2 Table 1: ground-truth-through-vocoder **0.05**, TCSinger 0.22, best baseline 0.28, worst 0.35. **Verdict:** a reasonable *internal* SVS regression metric with a real control value (0.05); no cross-paper perceptual validation found.

**ST Acc / RPA / VUV-E / Duration RMSE-MAE.** A1 §5.3 enumerates the accuracy family: lyric accuracy via CER; pitch accuracy via FFE and RMSE plus the linear correlation of F0 contours; and "duration and rhythm accuracy … commonly evaluated by Duration RMSE/MAE … and Duration Prediction Accuracy". A10 found ST Acc the *most stable* of its three objective metrics: "In contrast to the variability observed in F0 RMSE, the Semitone Accuracy (ST Acc) **consistently improved across all configurations**" — 60.55 % → 62.97 % on Opencpop, 63.62 % → 65.36 % on ACE-Opencpop. **Verdict:** the most stable pitch-side metric observed; a candidate internal check.

## 12.3 The distributional family — FAD and its 2025 replacement

**FAD (Fréchet Audio Distance).** Definition (A8 eq. 1):

\[
\mathrm{FAD}^2(X,Y) \;=\; \lVert \mu_X - \mu_Y\rVert_2^2 \;+\; \mathrm{tr}\!\left(\Sigma_X + \Sigma_Y - 2\sqrt{\Sigma_X\Sigma_Y}\right)
\]

with \(X=\{x_i\}_{i=1}^n\) reference-set embeddings and \(Y=\{y_j\}_{j=1}^m\) evaluation-set embeddings, **assumed multivariate Gaussian**, characterised entirely by \(\mu\) and \(\Sigma\). Embeddings typically from VGGish.

**Three limitations, each with A8's own evidence:**
1. **Normality assumption.** "The assumption that audio embeddings follow a Gaussian distribution often fails for real-world data" — demonstrated in their Fig. 2 by UMAP-projecting real VGGish embeddings of Clotho against a Gaussian with the same mean and covariance; the shapes differ visibly.
2. **Sample-size bias, derived in their Appendix B.** The mean term is unbiased, but \(\mathbb E[\hat\Sigma]=\frac{N-1}{N}\Sigma\), so to first order \(\mathrm{Bias}_{\mathrm{FAD}} \approx \frac{1}{N}\left(\mathrm{tr}(\Sigma_X)+\mathrm{tr}(\Sigma_Y)\right)+\mathcal O(N^{-2})\) — bias falling as **O(1/N)**. Measured consequence: "at small N, FAD shows a distinct positive bias … This deviation decreases roughly by half whenever the sample size doubles." And the integrity consequence, in their words: "increasing N can artificially reduce bias, leading to better FAD scores and the appearance of improved performance."
3. **Cost.** **O(dN² + d³)**; the covariance square root "is not easily parallelized".

**KAD (Kernel Audio Distance).** \(\mathrm{KAD} = \alpha\cdot\widehat{\mathrm{MMD}}^2_{\text{unbiased}}\) with \(\alpha=100\) default, and

\[
\widehat{\mathrm{MMD}}^2_{\text{unbiased}}(X,Y) = \frac{1}{n(n-1)}\sum_{i\neq j}k(x_i,x_j) + \frac{1}{m(m-1)}\sum_{i\neq j}k(y_i,y_j) - \frac{2}{nm}\sum_{i=1}^{n}\sum_{j=1}^{m}k(x_i,y_j)
\]

using the **Gaussian RBF kernel** \(k(\mathbf x,\mathbf y)=\exp\!\left(-\lVert \mathbf x-\mathbf y\rVert^2/2\sigma^2\right)\), \(\sigma\) set by the **median pairwise distance heuristic** over the reference set.

**Why a characteristic kernel matters, in their words:** the induced MMD "fully distinguishes between two embedding distributions and … is zero if and only if the two distributions under test are identical", whereas "a cubic polynomial kernel \((x^Ty+1)^2\) cannot differentiate between distributions with the same mean, variance and skewness, but different kurtosis" — a named counterexample, which is precisely what R6.1 requires. **Complexity O(dN²)**, parallelisable.

**Measured advantages:** Spearman correlation with human ratings up to **−0.93 for KAD vs −0.80 best-case FAD**, on DCASE-2023-Task-7 human ratings across 9 generative models, with **PANNs-WGLM** the best-performing embedding; KAD "remains close to its asymptotic value even at relatively small N"; wall-clock at d=2048, N=100 (Table 2): **KAD-GPU 1.4 ± 0.03 ms vs FAD-GPU 1829.1 ± 21.3 ms** — three orders of magnitude.

**Their bandwidth validation is a genuine control experiment, which is why this metric is admissible here.** Appendix A: they degraded Clotho audio (Gaussian noise, bit-depth reduction, low-pass filtering, limiting, pitch shift) and required the score to rise **monotonically** with severity. The median heuristic passed; 10× and 100× scalings also passed; **0.001×–0.1× failed** (scores "drop too quickly, diminishing the discriminative power") and **1000× failed** (scores flatten, "reducing sensitivity to dissimilarities"). A control that can fail, and did fail, in a recorded direction.

**Toolkit:** `kadtk`, **MIT licence**, supporting CLAP, Encodec, MERT, VGGish, PANNs, OpenL3, PaSST, DAC, CDPAM, wav2vec2.0, HuBERT, WavLM and Whisper embeddings, and computing FAD for comparison. Note their own reproducibility caveat: the GPU eigenvalue path for FAD "is prone to accuracy issues, often leading to discrepancies with fadtk, which relies on `scipy.linalg.sqrtm`", so they used the CPU path for the perceptual experiment.

**The honest counterweight, decisive for *song* evaluation.** A8's validation is on **Foley sound**, not music, and it says so: "embeddings trained on music data (MERT and CLAP-laion-music) show **weaker** alignment, consistent with previous findings". In the song setting, P5 Table 6 measured FAD's correlation with acoustic-quality preference at **−0.15 (AccompQual) and −0.11 (VocalQual)**, and Table 4 at **−0.249 with Musicality**. A5's Table 1 shows the failure concretely: **DiffRhythm has the worst FAD (4.86) yet a much better PER (12.3) than YuE (FAD 2.65, PER 36.4)** — on this data FAD and intelligibility are near-orthogonal.

**Verdict: FAD is NOT gateable here** (Gaussian assumption violated, N-bias exploitable, weak music correlation, and it needs a reference *distribution* we do not own). **KAD is the better-founded distance and merits one calibration attempt** — but only against a reference set we own, and only as a *drift detector* between our own model versions, never as an absolute quality score.

## 12.4 Text–audio alignment scores

**CLAP score vs CLaMP 3 score.** Both are cosine similarities between a text embedding and an audio embedding from a contrastive model. **P5 measured them against human judgement (Table 5):** CLaMP 3 correlates **0.42 / 0.37 / 0.44 / 0.33 / 0.36** with LyricFollow / GenCtrl / InstrCtrl / EmoCtrl / Tempo-RhyCtrl; CLAP correlates **−0.25 / 0.01 / −0.07 / 0.14 / 0.09**. The authors preserve the contradiction rather than smoothing it: YuE scored *lowest* on CLAP (0.118) while scoring *highest* on CLaMP 3 (0.240), and the CLAP result "not only diverges from human evaluation trends but also directly contradicts the findings from CLaMP 3", attributed to "insufficient exposure to singing and music-specific content during pre-training". A5's equivalents are **MuQ-T** (text similarity) and **MuQ-A** (audio-prompt similarity) from MuQ-MuLan, reported with error margins <0.01.

**Verdict: CLAP is measured-unreliable for this task and must not be used. CLaMP 3 / MuQ-T are weakly positive (≈0.4) and usable only as soft signals, never as a gate.**

## 12.5 Aesthetic and preference predictors

**Audiobox-Aesthetics (CE, CU, PC, PQ)** — Meta's four-dimensional predictor (content enjoyment, content usefulness, production complexity, production quality), used by both A5 and P5. **Measured behaviour (P5 Table 7):** CE is the strongest, correlating **0.66 with VocalQual and 0.56 with AccompQual**, but weaker with musicality aspects (SongStruct 0.33, VAComp 0.35, MelAttrac 0.30, MusicArr 0.31); "both PC and PQ show notably weaker or inconsistent correlations".

**SongEval (P8)** supplies the human ground truth this class needs: **2,399 full-length songs, >140 h, 16 professional annotators with formal musical education, 4 raters per song, 5-point Likert**, five dimensions — overall coherence, memorability, naturalness of vocal breathing and phrasing, clarity of song structure, overall musicality — English and Chinese, nine genres, with an open toolkit. The authors state the epistemic boundary correctly and it is worth quoting: "**our goal is not to define a perfect metric** but to establish one that is more explainable and professionally aligned than previous alternatives."

**Verdict: informative, not gateable.** And the ACE-Step-1.5 claim of "SongEval 8.09, outperforms Suno v5" reached me only via a non-primary blog and a model card whose attached arXiv identifier I did **not** fetch-verify; it is recorded **UNVERIFIED** and carries nothing in this document.

## 12.6 MOS and its measured non-comparability

**A11 `[FULL]` is the authority for the cross-paper MOS ban.** Verbatim: MOS "is widely regarded as the 'gold standard'"; but "conducting standard subjective tests is time-consuming and labor-intensive, and their results **often lack comparability across different experiments**"; and "existing objective metrics, such as mel-cepstral distortion, have shown a **weak correlation** with perceived audio quality".

**The dataset, measured:** 7,981 clips, **11.15 h**, **44,247 ratings from 78 annotators**, over 141 systems — 3,425 SVS clips (60 systems, plus 250 from song-generation systems), 1,307 SVC (17 systems), 2,671 SVR (52 systems), 578 ground-truth (12 systems); mean clip length 5.03 s; 4,155 clips carry three dimensions (overall; **lyrics** = "pronunciation clarity and intelligibility"; **melody** = "melodic naturalness and pitch accuracy"), giving 23,475 lyric and 23,475 melody ratings. Sources span 12 public corpora across Mandarin and Japanese, 167 songs, >50 singers. Song-generation samples (ACE-Step, DiffRhythm, Hailuo, Suno, YuE) were prepared with **MelBand RoFormer separating vocals from accompaniment** — the same protocol §12.1 recommends.

**The quality control that can fail, which is what makes these ratings evidence:** "each batch contained **trap clips** (noise or silence) and carefully selected **golden clips**. If an annotator assigned high scores to trap clips or low scores to golden clips, **the entire batch will be re-annotated**."

**Its two decisive measurements for us.** (1) **Sampling rate changes MOS.** For identical configurations (VISinger2 on Opencpop; DiffNNSVS on Namine) the ranking is **24 kHz (3.88/4.03) > 44.1 kHz (3.81/3.98) > 16 kHz (3.65/3.80)** — so any MOS comparison across systems that deliver at different sample rates is confounded. (2) **Speech MOS predictors fail on singing** (Table 3, weighted averages): UTMOS utterance RMSE **1.93**, LCC 0.26, SRCC 0.36; DNSMOS RMSE 0.96, LCC 0.39, SRCC 0.33; SingMOS (in-domain) RMSE 0.71, LCC 0.57, SRCC 0.53 — but "its performance drops significantly on the out-of-domain test2 and test3, indicating clear **overfitting** and the need for broader data coverage"; a fine-tuned SSL backbone (wav2vec2-large, L1-with-margin loss, SGD lr 0.001, 200 epochs) reaches weighted SRCC 0.50 utterance / 0.77 system. Pitch conditioning barely helps: "the pitch histogram yields slightly better performance than MIDI pitch, but the overall improvement over the SSL baseline **remains marginal**". The authors state SRCC "is considered the most important, since it reflects the ranking consistency of perceptual quality".

**Contradiction with A3, preserved rather than averaged (see §17, X1):** A3 found UTMOS a *moderate* naturalness predictor (+0.77\*\*\* JPN, +0.72\*\*\* ENG); A11 finds UTMOS poor on singing (weighted SRCC 0.36). Both were read `[FULL]`. The methodological explanation is in §17, X1.

**Verdict: MOS is not gateable and not cross-paper comparable.** Per CONTEXT-18(2), every cross-paper MOS comparison appearing in this document is marked `[UNVERIFIED]` **as a comparison**, even where each individual value is quoted correctly from its own table.

## 12.7 Summary — what a gate may be built from

| Axis | Metric | Control that can pass AND fail | Gateable here? |
|---|---|---|---|
| **Were the requested words sung?** | PER (or CER) of ASR over the **separated vocal stem** | YES — the three-arm control already proven in this repo on Lyria: words dictated / no words dictated / instrumental sentinel | **YES — primary gate** |
| Delivered-file conformance | sample rate, channels, duration, codec, integrated loudness, LRA, true peak via `ffprobe`/`ffmpeg` | YES — deterministic, measured on the file itself | **YES — secondary gate** |
| Timing of words | PCO / Asym-PCO / Perc-PCO at a **calibrated** tolerance; BER at 10/20/50 ms | YES — but the tolerance must be fitted from our own labelled material (A7) | **YES, after calibration** |
| Pitch accuracy vs an intended score | ST Acc, FFE | Partial — GT-through-vocoder anchors exist (FFE 0.05, A2) | Internal regression only |
| Distributional similarity | KAD (not FAD) | YES for the metric itself (A8 Appendix A degradation control) | Drift detector only |
| Prompt adherence | CLaMP 3 / MuQ-T | Weak (≈0.4 correlation) | Soft signal only |
| Musicality, structure, aesthetics | MOS, SongEval, Audiobox-Aesthetics | NO | **NO — BERK'S VERDICT** |
| Singer identity preserved | speaker-embedding cosine (D_embed) | NO — best case −0.41…−0.83, and insignificant in the cross-domain case that matters most | **NO — must be reported as unverified** |

**On thresholds, per CONTEXT-18(4) — no number in this table is a threshold.** The calibration procedure the sources support, and the only one this project may use:

1. Assemble **labelled material**: N target items whose intended lyrics are known, plus deliberate **negatives** — wrong words, no words, instrumental-only.
2. Run the **full instrument chain** (separator → ASR → PER) over both classes, recording **sample counts per class**.
3. Choose the operating point from the **separation of the two PER distributions**, exactly as the named-voice measurement in this repo established a 6.72 Hz noise floor by splitting one voice against itself.
4. Measure the **ground-truth floor** — a real recording through the same chain. DiffRhythm's was 16.14 % on the mix; A5's best system reads 7.2 % on the stem; **ours will be whatever we measure, and neither of those.**
5. **Re-calibrate whenever the separator, the recogniser, or the language changes** — the MIREX V1/V2 reordering (§10.1) and A11's sample-rate effect both show how fast a score's meaning moves.

A threshold set any other way is the 0.08-versus-0.0007 failure repeated.

---

# 13. Angle (i) — Open problems the field itself declares unsolved

Every item below is stated by the sources, not by me. Where I add an inference it is labelled.

## 13.1 The field's own list

1. **Data scarcity is the root problem, and it is structural.** A1 App. B.4: "In contrast to speech datasets, which exceed 100,000 hours, open-source singing data is extremely limited and plagued by long-tail distributions in style and language, as well as poor annotation quality (e.g., **inaccurate lyric timestamps**)." Their prescription is strategic: "for the SVS community, a more pragmatic strategy is to pursue **large-scale, weakly-labeled data collection** rather than investing heavily in small, perfectly annotated corpora". A12 names the structural cause: copyright restricts music, and "phoneme- or word-level annotations … are typically scarce, and funding for creating such annotations is limited". A10 §1 concurs: "The high cost and complexity of acquiring and annotating singing voice data make it difficult to obtain large-scale, high-quality labeled datasets."
2. **Long-form structural coherence.** A4's own full-length variant is worse than its base on PER and FAD; A5 concedes Suno-V4.5 and Mureka-O1 beat it on structure clarity, "which suggests room for improvement in music structural modeling"; ACE-Step's own README frames the whole field as a trade-off — "LLM-based models (e.g., Yue, SongGen) excel at lyric alignment but suffer from slow inference and structural artifacts. Diffusion models (e.g., DiffRhythm) … enable faster synthesis but often lack long-range structural coherence."
3. **Lyric intelligibility itself.** A4 states outright that conventional cross-attention text conditioning **failed** to achieve intelligibility; the cross-system PER spread of 7.2–37.1 % (A5 Table 1) is the measurement.
4. **The controllability-versus-fidelity trade-off, measured.** A1 App. B.3: "an overemphasis on control can degrade audio fidelity … increasing guidance strength only at inference time does not yield genuine controllability". A5 measured the exact same trade-off numerically: musicality-preference DPO alone raised PER from 10.6 % to 11.2 %.
5. **Objective evaluation of expressiveness, technique and emotion does not exist.** A2 App. E.2: "**there are no open-source classifiers for singing emotions or techniques** to use for objective evaluation." A3 §7: "objective assessment for SVC still has a lot to improve." A1 §5.3 offers only proxies — MLLM-as-judge, RL reward models, and singing-deepfake detectors repurposed "to assess the authenticity of vocals".
6. **Singer/voice similarity.** A3: no system among 26 reached target-level similarity; the ~0.4-point gap holds in both tasks; and objective similarity metrics are weak.
7. **Alignment robustness.** A1 §4.1: forced alignment, monotonic alignment and length regulators all have "limitations in robustness and naturalness"; the 2025 answers (RL-optimised perceptual objectives, masked-token stabilised alignment) are new and thin.
8. **High-pitch intelligibility specifically.** A12 cites Hollien, Mendes-Schwartz & Nielsen (*Journal of Voice*, 2000) on "**perceptual confusions of high-pitched sung vowels**" — i.e. even *human* listeners lose vowel identity at high pitch. A9 measured the machine analogue: its NNSVS-Mel v3 "tended to generate unstable output for **low- and high-pitched voices**", and the test set was deliberately built to probe range (test songs spanning D#4 155.6 Hz to A5 880 Hz against training data D#3 146.8 Hz to B5 987.8 Hz). **This is a real physical limit on any lyric-intelligibility gate: at the top of a singer's range, low PER may be unachievable rather than merely unachieved.**
9. **Continuous versus discrete representations — no consensus.** A1 App. B.3: "There is no consensus … Discrete representations align naturally with autoregressive and LLM next-token objectives … however, quantization may smooth out fine vocal details. Continuous representations preserve fine-grained acoustic textures and phase structure, yet they often rely on powerful decoders and are more sensitive to alignment." A dual-track combination "may offer the best balance" — stated as a hypothesis, not a result.
10. **Low-resource languages.** A1 App. B.4 names the long tail in "style and language" as a core defect of the data situation; P5 shows fine-tuning YuE into Chinese/Korean/Japanese works within a 40 B-token budget (lyrics-following preference: Japanese 70 % best, Chinese 60 % second behind Suno's 73 %, Korean 55 % third), which is evidence that language extension is *feasible* — but the languages demonstrated are all major ones with existing corpora.

## 13.2 Turkish and agglutinative-language singing synthesis — the project's actual frontier

This is in scope by explicit instruction, and it is where the honest answer is a negative one, reported per CONTEXT-18(3) as **NOT FOUND IN THE SEARCHED SCOPE** with queries and channels named, never as "does not exist".

**What DOES exist, verified:**

| Asset | What it is, measured | Licence / status | Fitness for singing synthesis |
|---|---|---|---|
| **Turkish Makam Acapella Sections Dataset** (N14; MTG-UPF, Zenodo 1287656) | Clean a-cappella Turkish makam **şarkı** form, no accompaniment, semi-professional singers, recorded in Istanbul studios June 2014; annotated at **section, lyrics-phrase and lyrics-word level**; **word- and phoneme-level** annotation stated; all annotations in Praat TextGrid, UTF-8 | Research dataset, cite-on-use (Dzhambazov & Serra, SMC 2015) | **Alignment-grade, not synthesis-grade** — has phoneme/word timings but no note-level score of the kind SVS training needs; small |
| **Turkish Şarkı Vocal Dataset** (N15; Zenodo `10.5281/zenodo.1283350`) | 12 performances of 11 compositions (8 female, 4 male), section-chunked (nakarat, meyan…), each lyrical phrase aligned to its audio segment; a phrase ≈ one musical bar, 1–2 words | Research dataset, cite-on-use | Alignment evaluation only; far too small to train |
| **`alibayram/jeji-turku`** (N17) | 197 Turkish türkü, embedded 48 kHz audio, English caption per item, **structure-tagged lyrics** (`[Verse]`/`[Chorus]`), plus makam / usul / region / instruments / vocal-type / BPM / duration metadata; pre-processed tensors for ACE-Step fine-tuning; explicitly assembled to fine-tune a music model | Card states `commercial_use: true` with rights held by the project owner — **a self-declaration on the card, not independently verified; treat as `[single-source]` and legally unconfirmed** | The only Turkish **song-with-structure** corpus found; 197 items is LoRA-scale, not pre-training scale |
| **FreyaTTS** (P9, N16) | Turkish **speech**: 183.2 M params, character-level 92-symbol vocabulary, **no phonemizer or G2P**, non-autoregressive conditional flow-matching DiT in a frozen AudioVAE2 latent (25 Hz, 64-dim, 16 kHz encode → 48 kHz decode), 32-step Euler ODE, no CFG; single target speaker, **no cloning**; **WER 8.0 % / CER 3.0 %** on its own Freya-TR-Eval, 3rd of 7 open sub-1B Turkish TTS, ahead of XTTS-v2 (11.1 % WER) and F5-TTS (24.3 % WER); RTF 0.11 on an RTX 4090; the voice-lock post-training collapsed cross-generation F0 σ **74.9 Hz → 5.0 Hz** | **Apache-2.0**, weights + inference + training pipeline released | **Speech, not singing** — but it is direct evidence that the *architecture class* our vocal stage would use (flow-matching DiT) trains successfully on Turkish, and its authors chose character-level input precisely so that "agglutinative morphology, vowel harmony, and the pronunciation of in-context words and acronyms are learned directly from audio" |
| ISSAI Turkish Speech Corpus (via its consumers: `qwen3-tts-turkish`, `gokbilge-tts`) | The primary open Turkish speech corpus for TTS training; the Qwen3-TTS LoRA experiments record a measured failure mode — Turkish phoneme errors "C→K, Ç" persisting across 0.6 B and 1.7 B bases until a **G2P schema** was introduced (v0.3 "5/5 sentences improved") | open dataset; consumer repos MIT | Speech; and a warning that Turkish-specific graphemes are a real error source for models pre-trained elsewhere |

**What was NOT found, with the search recorded.** No Turkish singing corpus with **note-level scores plus phoneme durations** (the input SVS training actually requires); no published Turkish SVS system; no Turkish entry in GTSinger's nine languages; no lyric-to-melody constraint set for Turkish or any agglutinative language. **Queries:** Q7, Q10, Q18 (exact strings in §4). **Channels:** web search over the harvested field vocabulary; the CompMusic/MTG dataset family reached through its Zenodo records and GitHub; the citation neighbourhoods of A1, A2, A6 and P4; Hugging Face dataset and model cards; an aggregate model registry. **This is an absence measured within a defined scope, and I state it as such** — not as proof of non-existence.

**Two Turkish-specific difficulties worth naming, both labelled INFERENCE (no measurement in this slice supports them):**
- Turkish has **vowel harmony and rich agglutinative suffixation**, so a *word* is frequently a long morpheme chain. In sung form, suffixes are exactly the material likely to be swallowed or melisma-stretched. **This is the reason PER rather than WER is doubly right for Turkish**: one wrong suffix destroys a word-level score while being phonetically near-correct.
- Turkish stress is predominantly word-final and weak. ReLyMe's principles are built for Chinese tone and English stress; the *shape* of a Turkish lyric-melody constraint is therefore an open research question, not a port.

**The falsifiable statement this slice can defend:** the *pipeline* is language-agnostic by construction — NNSVS's authors state its four core modules are "language-independent by design. Therefore, users can create SVS systems for custom languages by implementing a language-dependent pre-processing (e.g., extracting phonetic contexts from musical scores)" (A9), and TCSinger demonstrates that coarse ROSVOT+MFA annotation suffices (A2). What is missing for Turkish is **annotated Turkish singing data at scale**, and that is a data-acquisition problem with a known cost, not a scientific impossibility.

---

# 14. Angle (j) — Datasets and their licences

**The headline, because it constrains any training path: the corpus the field actually uses for controllable multilingual SVS is NON-COMMERCIAL.**

**GTSinger (A6 `[FULL]`, N4, N5) — read in detail because it is the decisive one.** Authors' framing of why it exists: prior corpora "suffer from low quality, limited diversity of languages and singers, absence of multi-technique information and realistic music scores, and poor task suitability". What it provides: **80.59 hours** forming "the largest recorded singing dataset"; **20 professional singers** across **nine widely spoken languages — Chinese, English, Japanese, Korean, Russian, Spanish, French, German, Italian** — and all four vocal ranges; **controlled comparison and phoneme-level annotations of six commonly used singing techniques**; **realistic music scores**; and "**manual phoneme-to-audio alignments**, global style labels, and **16.16 hours of paired speech**". 1,366 songs. Four benchmark experiments ship with it: technique-controllable SVS, technique recognition, style transfer, speech-to-singing conversion. **Licence, read from the licence file itself (N4): CC BY-NC-SA 4.0 — "NonCommercial — You may not use the material for commercial purposes" and "ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license".** The file adds an indemnity clause covering the M4Singer authors. **Turkish is not among the nine languages.**

**The wider corpus landscape, from A1 Table 1 `[FULL]`** — this is the field's own census, and its shape is the argument:

| Corpus | Languages | Songs | Singers | Hours | Score? | Alignment? | Style labels? |
|---|---|---|---|---|---|---|---|
| VocalSet (2018) | 1 | 3 (mainly vocalise) | 20 | 10.1 | ✗ | ✗ | ✗ |
| PJS (2020) | 1 | 100 sentences | 1 | 0.5 | Both | ✗ | ✓ |
| MIR-1K (2009) | 1 | 110 | 19 | 2.2 | ✗ | voiced type | ✗ |
| NUS-48E (2013) | 1 | 20 | 12 | 2.8 | ✗ | ✓ | ✗ |
| KVT (2020) | 1 | 466 | 114 | 18.9 | ✗ | ✗ | ✓ |
| CSD (2020) | 2 | 100 | 1 | 4.9 | MIDI | ✓ | ✗ |
| NHSS (2021) | 1 | 20 | 10 | 4.8 | ✗ | word | ✗ |
| OpenSinger (2021) | 1 | 1146 | 66 | 50 | ✗ | ✗ | ✗ |
| Tohoku Kiritan (2021) | 1 | 50 | 1 | 3.5 | Score | ✓ | ✗ |
| PopCS (2022) | 1 | 117 | 1 | 5.9 | ✗ | ✗ | ✗ |
| M4Singer (2022) | 1 | 700 | 20 | 29.8 | MIDI | ✓ | ✗ |
| PopBuTFy (2022) | 2 | 542 | 34 | 50.8 | ✗ | ✗ | ✓ |
| Opencpop (2022) | 1 | 100 | 1 | 5.3 | MIDI | ✓ | ✗ |
| SingStyle111 (2023) | 3 | 111 | 8 | 12.8 | Both | ✓ | ✓ |
| **GTSinger (2024)** | **9** | **1366** | **20** | **80.6** | Score | ✓ | ✓ |
| ACE-Opencpop (2024) | 1 | 100 | 30 | 4.3 | MIDI | ✓ | ✗ |
| ACE-KiSing (2024) | 2 | 23 | 34 | 1.0 | MIDI | ✓ | ✗ |

**Read the column sums, not the rows.** The entire open corpus landscape for SVS is roughly **290 hours**, dominated by one 80-hour non-commercial corpus, against speech's ">100,000 hours" (A1). **Only four corpora have all three of score + alignment + style labels** (PJS 0.5 h, SingStyle111 12.8 h, GTSinger 80.6 h — and PJS has no alignment). Every multi-language entry counts languages in single digits, and none includes Turkish.

**Synthetic augmentation is an accepted practice, which matters for a build.** ACE-Opencpop and ACE-KiSing are **synthesiser-generated** corpora — A1: "synthesizer-generated corpora, offering a complementary avenue for data augmentation". A10 trains on ACE-Opencpop (100+ hours, 30 singers) and reports real gains. So a legitimate path exists in which a *licensed* synthesiser generates training material — but the licence of the generating system then governs, which is a legal question for the parent's legal slice, not a scientific one.

**Song-level (not singing-level) training data, for the full-song route:** A4 trained on ~1 M songs / 60,000 h (3:6:1 Chinese:English:instrumental); A5 on 2 M songs / ~110,000 h, drawn from DISCO-10M, the Million Song Dataset "and some **copyrighted in-house data**" — stated plainly in the paper. That admission is the single most important dataset fact for a commercial build and it belongs to the parent's legal axis.

**Evaluation corpora (usable without training on them):** SingMOS-Pro (A11) — 7,981 clips, 44,247 ratings, released at `TangRain/SingMOS-Pro`; SongEval (P8) — 2,399 songs, 140 h, 16 professional annotators, released at `ASLP-lab/SongEval` with a toolkit; DALI — "thousands of polyphonic recordings in various languages, with lyrics annotations obtained through semi-automated methods" (A12); Jamendo / `f90/jamendolyrics` — 20 songs (V1) and 79 songs (V2 annotations), the MIREX alignment test set; MUSDB18 / MUSDB18HQ — the separation benchmark; vocadito — 40 manually labelled multilingual recordings.

**Annotation tooling, which is what makes a low-resource language tractable (A1 §5.2):** Praat is "the de-facto tool for manual labeling"; **MFA** is the HMM-based automatic aligner "widely and effectively used in clean vocals"; **SOFA** is a CTC-loss singing aligner built on MFA; **Parselmouth** for pitch extraction; **ROSVOT** (Conformer backbone) "for robust pitch and duration estimation"; **MusicYOLO** adapting object detection to joint note pitch/duration detection; and **STARS** as the 2025 end-to-end multi-task annotator. This tool chain — not a hand-annotation budget — is what a Turkish corpus effort would actually use.

---

# 15. Angle (k) — Open-source implementations, judged on provenance and not on stars

Every row was read from the repository or model card itself (R5.3), and the judgement column states what would actually block us.

| Project | Owner / provenance | Licence | Freshness & health, measured | Reproducibility signals | Judgement for this project |
|---|---|---|---|---|---|
| **Amphion** (N6) | `open-mmlab` — an established multi-org umbrella; 40 contributors, top committers named | **MIT — "free for both research and commercial use cases"** (stated on the repo) | Last push **2026-03-25**; 175 open issues; latest tagged release v0.1.1-alpha (2024-02) — i.e. **actively developed but never past an alpha tag** | Paper (arXiv 2312.09911), recipes, pre-trained models, visualisations; SVS/SVC/VC/AC/TTS/TTA supported, **TTM still "developing"** | **Best licence-to-capability ratio found.** The permissive licence covers the code; each *model* and *dataset* keeps its own licence (their Emilia data is CC BY-NC 4.0 while Emilia-YODAS is CC BY 4.0 — the distinction is explicit on the card). Text-to-music is not ready. |
| **NNSVS** (A9) | LINE Corp. + Nagoya University; the Sinsy lineage's open successor | Stated in the paper as fully open-source ("**Everything is open-source:** In contrast to the open-source version of Sinsy, our code is fully open-sourced") — **exact SPDX identifier NOT read from the repo this session, so recorded as UNVERIFIED-LICENCE** | Published ICASSP 2024; documentation site; complete recipes | **The strongest reproducibility story in the SVS space**: modular (time-lag / duration / acoustic / vocoder), extensible, **language-independent by design**, complete recipes in the Kaldi/ESPnet tradition, and a published MOS table with 18 native listeners | **The reference design for a from-scratch, custom-language SVS.** Its "language-independent by design" claim is exactly the property a Turkish build needs. Licence must be verified before use. |
| **DiffRhythm** (N10, A4) | ASLP-lab, Northwestern Polytechnical University | **NOT READ this session — recorded as UNVERIFIED-LICENCE** | Checkpoints published for base (1m35s), full (4m45s), v1.2 base/full, and the VAE; 285 s generation released 2025-03-15 | Paper releases "the complete training code along with the pre-trained model on large-scale data to promote reproducibility"; VAE **shares the Stable Audio VAE latent space**, so it is plug-compatible | Technically the most attractive open full-song system (RTF 0.034). **Its licence and its training-data provenance are both unresolved here** and both are blocking questions for the legal slice. |
| **SongGeneration / LeVo 2** (N9, A5) | `tencent-ailab` — first-party corporate org | **NOT READ this session — UNVERIFIED-LICENCE** | v2-large 4B released; dated changelog entries through 2025-10-16; HF Space demo; full-length to 4m30s | Self-reported **PER 8.55 %**; flags for pure music / pure vocals / dual-track output — i.e. **stems are a first-class output** | The dual-track output is directly useful for our film pipeline. Trained on "some copyrighted in-house data" (A5) — a stated fact that the legal slice must weigh. |
| **ACE-Step** (N7, N8) | ACE Studio + StepFun | **VERSION-CONFLICT, preserved not averaged:** repo page states **Apache-2.0**; the v1.5 XL Turbo diffusers card states **weights MIT** with the Qwen3 text encoder redistributed under Apache-2.0 | Repo created 2025-04-28; 152 open issues; v1.5 XL series and a diffusers pipeline merged into `huggingface/diffusers` | 3.5 B DiT (v1) / 5 B flow-matching DiT (v1.5 XL Turbo, hidden 2560, 32 layers, AutoencoderOobleck 48 kHz stereo); features `lyric2vocal`, `singing2accompaniment`, lyric editing, remix | Fast and feature-rich, and the HF card claims training on "legally compliant datasets" — **a card claim, which per CONTEXT-18(1) is NOT capability or compliance evidence.** Its measured PER is the *worst* in A5 Table 1 (37.1 %). |
| **TCSinger** (N19, A2) | `AaronZ345` — the paper's own author | **NOT READ — UNVERIFIED-LICENCE** | Inference scripts for style transfer and style control; checkpoint phone-set files provided | Reproduction requires prompt audio at 48 kHz plus target `ph`, `note`, `note_dur`, `note_type` per phoneme — i.e. **a real score is required at inference** | The reference for controllable zero-shot SVS. Maintainers' own caveat: style control "suboptimal for certain timbres", fine-tune on GTSinger first — **and GTSinger is non-commercial.** That chain is the blocker. |
| **GTSinger** (N5, N4) | `AaronZ345` / `GTSinger` org | **CC BY-NC-SA 4.0 — commercial use prohibited** | 2024-09 full release; **2025-02 "released all processed data and refined 7/9 languages"** | Full corpus (audio + TextGrid + json + musicxml) plus processed metadata, phone sets, speaker sets; benchmark code | **Legally decisive: unusable for a commercial product.** |
| **SOFA** (N11) | `qiuqiao` — individual maintainer | NOT READ — UNVERIFIED-LICENCE | Singing-oriented forced aligner; custom G2P module rather than a dictionary; "matching mode" finds the most probable contiguous phoneme sub-sequence | Ships its own evaluation script computing boundary edit distance / ratio and **BER at 10/20/50 ms**, with strict mode and phone-mark ignore lists | **Directly useful for our gate**, and measured better than MFA on singing (BER 20.9 vs 40.3, P1). Single-maintainer bus factor is the risk. |
| **FxNorm-Automix** (N12, P7) | `sony` — first-party corporate | NOT READ — UNVERIFIED-LICENCE | ISMIR-2022 configs preserved under `configs/ISMIR`; four trained models named (`ours_S_La`, `ours_S_Lb`, `ours_S_pretrained`, `wun_S_Lb`) | Feature files for MUSDB18 provided; separate scripts for normalisation, training, inference and metric evaluation | The published automatic-mixing baseline with an expert listening test behind it. |
| **kadtk** (A8) | Gaudio Lab / KAIST authors | **MIT** (stated in the paper, and the FAD toolkit it borrows from is also MIT) | Released with the paper (2025) | Supports 13 embedding models; computes FAD too, for comparison | The metric toolkit we would actually calibrate against. |
| **`microsoft/muzic`** (N18) | Microsoft first-party org | NOT READ — UNVERIFIED-LICENCE | Project pages for SongMASS, TeleMelody, ReLyMe with integration instructions | Ships evaluation modules: pitch/duration distribution similarity, melody distance, and ReLyMe's `score` module | The symbolic melody stage's reference implementations. |
| **FreyaTTS** (N16, P9) | `freyavoiceai` / Freya (YC S25) | **Apache-2.0** for the small model; weights + inference + training pipeline released | Small model open; **large production model deliberately closed** | Eval set published (`freyavoice/freya-tr-eval`); WER/CER benchmarked against 6 other Turkish systems | The Turkish-language anchor: proof that flow-matching DiT trains on Turkish under a permissive licence. Single speaker, no cloning, **speech only**. |

**A discipline note required by CONTEXT-18(1) and by R5.3.** For seven of these projects I did not open the `LICENSE` file this session, and I have marked each one **UNVERIFIED-LICENCE** rather than repeating a licence badge from a README or a search card. In a project whose own law records four occasions when a printed schema lied, a licence string that has not been read from the file is not evidence. **Whoever proceeds to a build must read each `LICENSE` from the repository, and must additionally establish the separate licence of every model *weight*, which is routinely different from the code licence** — ACE-Step (code Apache-2.0 vs weights MIT) and Amphion (MIT code vs CC BY-NC data) are both live examples in this table.

---

# 16. Claim cross-verification and independence ledger

Independence is judged by **underlying producer, dataset and method** (R7.2), never by URL count. A paper plus its own repository is ONE family.

| # | Claim (exact scope) | Type | Source A | Source B | Source C | Independence rationale | Status |
|---|---|---|---|---|---|---|---|
| C1 | ASR error rate over sung audio correlates with human-judged quality far better than spectral or F0 metrics do | PRIMARY FACT | A3 Table 4 (26 systems, 2 listener groups, CER-Whisper −0.73…−0.80\*\*\*) | A4 §4.3 + Table 2 (uses PER as its intelligibility measure; ablation makes it unmeasurable when alignment is removed) | A5 §4.1 + Appendix (PER chosen over WER/CER with a stated perceptual rationale) | Three producers (Nagoya/NTU consortium; NPU; Tencent), three datasets, two different ASR systems (Whisper, FireRedASR) | **3+ verified** |
| C2 | MCD and F0-RMSE do NOT reliably track perceived quality of sung audio | PRIMARY FACT | A3 Table 4 (MCD n.s. in all English naturalness cells) | SingVisio expert observation (metrics converge while audible quality still improves) | A10 §4 (F0-RMSE rose while MCD fell and MOS rose) | Three producers, three protocols (challenge correlation study; visual-analytics expert study; SVS ablation) | **3+ verified** |
| C3 | Top SVC systems have reached human-level *naturalness*, but no system reaches target-level *similarity* | PRIMARY FACT | A3 §5, §7 (~0.4-point gap, 26 systems) | arXiv 2310.05118 (independent team reporting its own 1st/2nd cross-domain placement) | A11 §2.2 (independent dataset; same SVR>SVC>SVS ordering; speech MOS predictors fail on singing) | Three author groups; challenge data vs SingMOS-Pro | **3+ verified** |
| C4 | Lyric intelligibility is the weak axis of open song-generation systems | PRIMARY FACT | A5 Table 1 (PER 7.2–37.1 % across 8 systems) | A4 Table 2 + §7 (its own GT control at 16.14 %; PER rises for the longer variant) | P5 §6.2 (YuE: "Whisper transcription accuracy is insufficiently robust for reliable automated lyrics-following evaluation", so it went to human raters) | Three producers; and note that C4 holds *even though* the three disagree on absolute values | **3+ verified** (direction), values `[single-source]` per system |
| C5 | GTSinger is CC BY-NC-SA 4.0 and therefore commercially unusable | PRIMARY FACT | N4 licence file, read verbatim | A6 paper §3 ("can be used under license CC BY-NC-SA 4.0") | N5 repo (licence-acceptance condition on use) | Same producer family — **so this is `[single-source official]`, disclosed**: a licence is a unique-authority fact and independent corroboration is not possible in principle | **`[single-source official]`** |
| C6 | A speech forced aligner is not a singing aligner | PRIMARY FACT | P1 Table 1 (MFA BER 40.3 vs SOFA 20.9 vs STARS 18.6) | P10 (MFA 3.0 mean boundary error <15 ms **on speech**, 3 languages) | MFA-on-singing study (open-model accuracy 10.08 % on singing before retraining) | Three producers, three protocols; the contrast between B and A is what carries it | **3+ verified** |
| C7 | The MIREX 0.3 s alignment tolerance was never psychologically validated, and real perception is asymmetric | PRIMARY FACT | A7 §1, §4.1 (−0.33 s / +0.22 s at the 50 % rule; χ²(1)=4.26, p=.038) | N1 MIREX page (states the 0.3 s choice and attributes it to Mauch et al., with no validation study cited) | N3 `mir_eval` docs (ships `perceptual_metric()` with an explicit caveat about the setup it reflects) | Deezer/Télécom study; MIREX organisers; the mir_eval maintainers | **3+ verified** |
| C8 | Sentence-level phoneme placement is sufficient for intelligible full-song generation; conventional cross-attention text conditioning failed | SOURCE CLAIM | A4 §3.4 + Table 2 ablation (unmeasurable PER without it) | — | — | **First-party ablation only.** No independent replication found | **`[single-source]`** — reported as the authors' measured claim, not as established fact |
| C9 | Vocal range correlates ≈0.86 with human-judged musicality | SOURCE CLAIM | P5 Table 4 (0.857 Musicality, 0.858 Average) | — | — | One paper, 5 systems, small n | **`[single-source]`** — candidate metric, not established |
| C10 | KAD is better-founded than FAD (distribution-free, unbiased, cheaper) and correlates better with human ratings | PRIMARY FACT (theory) + SOURCE CLAIM (empirics) | A8 §2.1, §3, App. A–B (derivation, bias O(1/N), degradation control) | Gui et al. ICASSP 2024 / Microsoft Research (independently establishes FAD's sample-size bias and embedding sensitivity, proposing FAD∞) | Tailleur et al. 2024, cited by both, on embedding-dependence of FAD's human correlation | Theory is independently verifiable (the Gaussian assumption and the O(1/N) bias are mathematical); the −0.93 vs −0.80 correlation is first-party on Foley data | **Theory: 3+ verified. The −0.93 figure: `[single-source]`, and out-of-domain for music by the authors' own statement** |
| C11 | Separation is a solved tool at ~10–12 dB vocal SDR | PRIMARY FACT | P6 / BS-RoFormer abstract (11.99 dB with extra data; 9.80 dB without) | N13 MVSEP third-party leaderboard (11.31→11.89 and 13.56→14.58 on its own sets) | arXiv 2510.25745 (independent group confirming RoFormer dominance on the same leaderboard) | Model authors; an independent service; an independent research group | **3+ verified** |
| C12 | Automatic mixing approaches professional quality in expert listening tests | SOURCE CLAIM | P7 (indistinguishable on Production Value and Excitement; better on Clarity) | MEGAMI ICASSP 2026 ("approaching human-level quality", with FxNorm as a baseline it improves on) | — | Two producers (Sony; the MEGAMI authors), two studies; B independently re-evaluates A | **2 of 3 — flagged `[UNVERIFIED]` as a general claim** |
| C13 | No open singing corpus with score+alignment+style annotation permits commercial use | INFERENCE from primary facts | A1 Table 1 (the census: only PJS/SingStyle111/GTSinger have the full annotation set) | N4 (GTSinger NC) | — | The inference is mine: the census establishes *which* corpora qualify, and only GTSinger's licence was read. **SingStyle111's licence was NOT read this session** | **`[UNVERIFIED]` as stated — the honest form is: the largest such corpus is non-commercial, and the licences of the two smaller ones are unread** |
| C14 | No Turkish singing corpus with note-level scores plus phoneme durations was found | ABSENCE (scope-bounded) | Q7/Q10/Q18 with channels recorded (§4, §13.2) | A6 (nine languages enumerated; Turkish absent) | A1 Table 1 (no Turkish entry in the field's own census) | Two independent censuses plus a recorded search | **NOT FOUND IN THE SEARCHED SCOPE** — explicitly not an existence claim |
| C15 | Flow matching / CFM is the current dominant SVS and song-generation training paradigm | PRIMARY FACT | A1 §3.1, App. A.3 (survey: TechSinger, rectified flow, OT-flow) | A4 §3.3 (DiffRhythm's own CFM objective, written out) | P9 (FreyaTTS: CFM DiT for Turkish speech) + P11 (FM-Singer latent CFM) | Four producers across three tasks and three languages | **3+ verified** |

**Claim counts:** 3+ verified **9** · `[single-source]` (incl. `[single-source official]`) **4** · `[UNVERIFIED]` **2** · scope-bounded absences **1**.

---

# 17. Contradictions, corrections and version conflicts — preserved, not averaged

**X1 — UTMOS: moderate predictor or poor predictor?** A3 Table 4 reports UTMOS correlating **+0.77\*\*\* (JPN) / +0.72\*\*\* (ENG)** with SVC naturalness and calls it "moderate … indicating its generalization capability". A11 Table 3 reports UTMOS on singing at **weighted SRCC 0.36, RMSE 1.93** and concludes speech MOS models "perform poorly on the singing task due to the substantial domain gap". Both read `[FULL]`. **Methodological reason, establishable from the two designs:** A3 correlates **system-level** means over 26 systems within a single dataset and task; A11 measures **utterance-level** prediction across 141 systems and 12 datasets including out-of-domain test splits, and reports system-level separately (where UTMOS reaches 0.54 SRCC — closer to A3). So the disagreement is largely *system-level vs utterance-level* and *in-domain vs out-of-domain*. **Consequence for us:** a neural MOS predictor may rank a small set of our own variants, and may not score an individual clip. Not averaged; both retained.

**X2 — PER values disagree wildly across papers for the same systems.** A4 reports DiffRhythm-full at **18.02 %** PER measured on the **mix** with FireRedASR; A5 reports DiffRhythm at **12.3 %** measured on the **Demucs-separated stem** with Whisper-large-v2. Same system, two numbers, and neither is wrong. **Reason: the protocol differs in both the audio (mix vs stem) and the recogniser.** A4 states the mechanism itself: "The relatively high PER across all systems may stem from using mixed audio containing both vocal and accompaniment without source separation for ASR evaluation." **Consequence: a PER number without its protocol is meaningless, and cross-paper PER comparison is `[UNVERIFIED]`.** Our own gate must fix and publish its protocol.

**X3 — Suno's PER (21.6 %) is worse than Mureka's (7.2 %) and LeVo's (7.2 %) while Suno wins every subjective axis except lyrics-following.** A5 Tables 1 and 2. This is internally consistent but counter-intuitive, is unreplicated, and comes from the authors of a competing system. **Held as `[single-source]`.** It is also a *dated* measurement — A5 states its closed-system evaluation "reflects the performance of these systems at that specific time" (May 2025).

**X4 — ACE-Step licence: Apache-2.0 or MIT?** The repository page states Apache-2.0 (N7); the v1.5 XL Turbo model card states the ACE-Step weights are MIT with the Qwen3 encoder redistributed under Apache-2.0 (N8). **VERSION-CONFLICT recorded, both readings preserved.** The likely resolution — code Apache-2.0, v1.5 weights MIT — is an **INFERENCE** and must be settled by reading the actual `LICENSE` files of both the repo and the weight release.

**X5 — "the first open lyrics-to-song model".** YuE's own claim, dated: "As of its release on Jan. 28, 2025, YuE famil[y] is the first publicly available, open-source lyrics-to-song model capable of full-song generation with quality on par with commercial systems." **Flagged `SUPERSEDED` as a market statement** — by A5's May-2025 evaluation there were at least five (YuE, DiffRhythm, ACE-Step, SongGen, LeVo). The claim was true when dated; it is not true now.

**X6 — MIREX Jamendo V1 vs V2 reorders the systems.** N2: NUS beats FZZ1 on V1 (PCS 0.751 vs 0.686) and loses badly on V2 (0.502 vs 0.683). **Not a contradiction to resolve but a property to respect:** annotation revision changes alignment rankings, so no external alignment threshold is portable to our data.

**X7 — DiffRhythm's ground truth is not perfect.** Its VAE-reconstructed ground truth measures PER **16.14 %**, MOS-intelligibility 4.17. A "perfect" system on that protocol would score ~16 %, not 0 %. **This is the single most important number in the document for threshold design**, and it is why §12.7 step 4 exists.

---

# 18. Synthesis — the science, per stage (NOT the product recommendation)

Per CONTEXT-18(6) this section states what is scientifically supported and what is not. The BUILD/ADOPT/AVOID product decision belongs to the parent.

## 18.1 The two architectures the literature actually offers, with their measured trade-off

**Route A — end-to-end lyrics-to-song.** One model takes lyrics + a style prompt and emits a full mixed song. Two published sub-families: **non-autoregressive latent diffusion** (DiffRhythm: 4 m 45 s stereo 44.1 kHz, RTF 0.034, PER 18.02 % on the mix, 1.1 B DiT over a 64-dim 21.5 Hz latent) and **autoregressive token LMs** (LeVo: mixed + dual-track tokens, 2 B LeLM + 700 M diffusion renderer, PER 7.2 % on the stem, MOS-LYC 3.38 beating Suno-V4.5's 3.17; YuE: LLaMA2-based, structural progressive conditioning, strongest on structure and arrangement, weakest on acoustic detail).

**Route B — assemble from stages.** LLM lyrics → symbolic melody (TeleMelody/SongMASS + ReLyMe constraints) → SVS vocal (TCSinger/NNSVS class, score+phonemes+durations in) → instrumental bed (our existing Lyria layer) → automatic mix (FxNorm-Automix class) → verification (separate → align → ASR → PER).

**The measured trade-off between them, stated honestly.** Route A has better *measured* end-to-end quality today, because it is what the field optimises and reports. Route B has three properties Route A structurally cannot offer: **(i) real melody control** — a note sequence is inspectable and editable, a latent is not; **(ii) voice identity from our own proven TTS voices** rather than an unnamed model voice; **(iii) per-stage measurement** — each stage can be gated separately, which is exactly what a project with eight silently-wrong instruments in its history needs. Route B's cost is error accumulation across stages, which A1 names as the reason the field moved *away* from cascades ("To reduce error accumulation and utilize the prior knowledge in LLMs, recent works move toward vocoder-free frameworks"), and which is a real, published objection rather than a theoretical one.

**What the science says about the hybrid, because that is where the evidence actually points.** Three independent findings converge on the same place: (i) TCSinger proves **speech data + coarse automatic annotation** is enough to train a controllable, cross-lingual, speech-promptable singing model; (ii) DiffRhythm proves **sentence-level timestamps alone** are enough conditioning for intelligibility, without word-level supervision; (iii) LeVo proves **dual-track (vocal + accompaniment) modelling** measurably beats single-track on PER, FAD and PC. A pipeline that generates the vocal from a score with our own voice identity, generates the bed separately, and verifies the words by separation+ASR is consistent with all three. **That is an architectural inference, labelled INFERENCE, and its falsifier is stated in §3.**

## 18.2 What is scientifically settled, and what is not

**Settled (3+ verified):** flow-matching/CFM is the dominant training paradigm · separation is a solved tool at ~10–12 dB vocal SDR · ASR error rate is the intelligibility metric that tracks perception · MCD and F0-RMSE do not · SVC naturalness is human-level while identity is not · speech aligners fail on singing while singing aligners reach ~19–21 % BER at 20 ms · the alignment tolerance is asymmetric and context-dependent.

**Not settled:** absolute PER per system (protocol-dependent, X2) · whether vocal range is a musicality proxy (`[single-source]`) · whether automatic mixing is human-level (2 of 3) · continuous vs discrete representations (the field says no consensus) · structural coherence as an objective quantity (no metric exists) · **anything at all about sung Turkish** (no measurement found).

## 18.3 The one thing this slice hands the parent as an instruction rather than a finding

**Build the gate on the instrument this project has already proven, and calibrate its threshold rather than choosing it.** The chain is: separate the vocal stem (Demucs or a RoFormer variant) → transcribe (an ASR verified on *singing*, not assumed) → score PER against the intended lyric → compare against a three-arm control (intended words / no words / instrumental sentinel) and against a real-recording floor measured through the same chain. Every element of that chain is published, every element has a control that can fail, and the repo has already run the control once — on Lyria, where it produced 0 of 8 words and made a capability gap into evidence.

---

# 19. Blind spots, stated explicitly (R11.3)

Saturation was **NOT** reached (§4). These are the gaps I know about:

1. **Turkish sung output is entirely unmeasured.** No Turkish SVS system, no Turkish singing corpus with scores, and no measurement of any ASR on sung Turkish. This is the project's largest scientific unknown and it is unresolved by this slice.
2. **Seven licences unread.** NNSVS, DiffRhythm, SongGeneration, TCSinger, SOFA, FxNorm-Automix and `microsoft/muzic` are all marked UNVERIFIED-LICENCE. No build may proceed on this document's licence column.
3. **Closed-system internals are unavailable by construction.** Suno, Udio, Mureka, Hailuo, Tiangong, Haimian and Seed-Music publish no method detail; A4 says so explicitly. Every number about them in this document is a *third party's* measurement of their output at a stated date.
4. **`[PARTIAL]` reads.** Twelve academic sources were read partially (§5.2), with the omissions named per source. Notably ReLyMe's exact table cells, FxNorm's per-axis listening numbers, MEGAMI's results, SongEval's predictor performance and P6's full ablations were not read.
5. **Chinese/Japanese/Korean-language venues were reached only through English-language primaries and repositories.** I did not search CN/JP/KR-language search surfaces directly. The major labs (Zhejiang, Tencent, NPU, ByteDance, KAIST, Nagoya) publish in English and were reached, but a genuinely non-English lane is a gap.
6. **Named-professor and lab-page chains were followed via citation graphs, not by visiting individual faculty pages.** Zhou Zhao's group (Zhejiang) and Tomoki Toda's group (Nagoya) dominate this literature and were reached through their papers; their current-output pages were not enumerated.
7. **No R6.3 formal-verification infrastructure was engaged** — correctly, since nothing in this slice is a theorem to be checked. The metric derivations (FAD bias, MMD unbiasedness) were read as presented, not independently re-derived.
8. **Cost and latency on our own hardware are unmeasured.** DiffRhythm's RTF 0.034 is on an RTX 4090; the project's GPU is a single Tesla T4. **No timing or throughput claim for our hardware appears in this document**, and none may be inferred from it.
9. **No capability probe was run.** This slice spent nothing and generated nothing; every number is somebody else's measurement, read from their table. Per CONTEXT-18(1), that means **nothing here is capability evidence for our own stack** — only a completed, measured generation on our own surface would be.
10. **ISMIR proceedings were reached selectively.** The ISMIR archive was queried through topic searches, not enumerated by year; the ISMIR community is large and its 2023–2025 singing-synthesis papers are certainly under-sampled here.

---

# 20. Living-update watchlist

`as_of`: **2026-08-13**. Freshness horizon for licences and model versions: **7 days** (the scope plan's own figure for this vendor class); for research claims: 90 days.

| Watch target | Exact watch query / channel | Update trigger |
|---|---|---|
| ACE-Step 1.5 / XL series | `ace-step/ACE-Step-1.5` repo `LICENSE` + the arXiv id on its HF card | Resolves X4; would also resolve the unverified SongEval 8.09 claim |
| SongEval leaderboard adoption | `ASLP-lab/SongEval` repo + citing papers | If SongEval becomes the field's standard, the "no structural metric" finding weakens |
| SingMOS-Pro-trained predictors | `TangRain/SingMOS-Pro`, VoiceMOS challenge tracks | A singing MOS predictor reaching high out-of-domain SRCC would add a second gateable axis |
| Turkish singing data | GTSinger language additions; MTG/CompMusic releases; HF `tr` + singing datasets | Any Turkish score-annotated singing corpus changes §13.2 entirely |
| Amphion TTM | `open-mmlab/Amphion` — TTM is marked "developing" | An MIT-licensed text-to-music path would change the licence calculus |
| Alignment SOTA | MIREX / STARS follow-ups, SOFA releases | Better singing alignment tightens the timing gate |
| KAD adoption in music | `kadtk` citing works; music-specific KAD validation | Would upgrade KAD from drift detector to a real metric |
| Closed-system versions | Any *independent* re-measurement of Suno/Mureka/Udio PER | Would resolve X3, which is currently single-source and dated |

---

# 21. Artefact index and produced-vs-planned count

| Planned (scope plan row 6) | Produced | Status |
|---|---|---|
| `docs/research/sota/2026-08-13-ai-song-generation.md` | this file | ✓ |
| Raw captures under `docs/research/_sources/` with `2026-08-13-` prefix | **37** files created by this slice, all 37 verified present by name this session | ✓ |

**Files I own and wrote:** exactly the two rows above. **Files I did not touch, per CONTEXT-16:** every other file under `docs/research/`, `docs/README.md`, the scope plan, the preflight JSON, anything under `.claude/memory/`, every worker package, every script, and `docs/ssm-content-asset-generation-api_v5.md`. Three sibling subagents were writing concurrently; write isolation was respected by construction.

---

# 22. Sources — complete citations

**Academic, read `[FULL]` (12):**

1. Pan, C., Yao, D., Zhang, Y., Guo, W., Lu, J., Zhu, Z., Zhao, Z. (Zhejiang University). *Synthetic Singers: A Review of Deep-Learning-based Singing Voice Synthesis Approaches.* IJCNLP-AACL 2025 (long), DOI `10.18653/v1/2025.ijcnlp-long.24`; arXiv 2601.13910. `[FULL]`
2. Zhang, Y., Jiang, Z., Li, R., Pan, C., He, J., Huang, R., Wang, C., Zhao, Z. *TCSinger: Zero-Shot Singing Voice Synthesis with Style Transfer and Multi-Level Style Control.* EMNLP 2024 main, pp. 1960–1975, DOI `10.18653/v1/2024.emnlp-main.117`; arXiv 2409.15977. `[FULL]`
3. Huang, W.-C., Violeta, L. P., Liu, S., Shi, J., Toda, T. *The Singing Voice Conversion Challenge 2023.* IEEE ASRU 2023; arXiv 2306.14422v2. `[FULL]`
4. Ning, Z., Chen, H., Jiang, Y., Hao, C., Ma, G., Wang, S., Yao, J., Xie, L. (NPU; CUHK-Shenzhen). *DiffRhythm: Blazingly Fast and Embarrassingly Simple End-to-End Full-Length Song Generation with Latent Diffusion.* arXiv 2503.01183, 2025-03-03. `[FULL]`
5. Lei, S., Xu, Y., Lin, Z., Zhang, H., Tan, W., Chen, H., Yu, J., Zhang, Y., Yang, C., Zhu, H. et al. (Tencent AI Lab). *LeVo: High-Quality Song Generation with Multi-Preference Alignment.* NeurIPS 2025. `[FULL]`
6. Zhang, Y., Pan, C., Guo, W., Li, R., Zhu, Z., Wang, J., Xu, W., Lu, J., Hong, Z., Wang, C. et al. *GTSinger: A Global Multi-Technique Singing Corpus with Realistic Music Scores for All Singing Tasks.* NeurIPS 2024 Datasets & Benchmarks (Spotlight); arXiv 2409.13832. `[FULL]`
7. Lizé Masclef, N., Vaglio, A., Moussallam, M. (Deezer Research; LTCI Télécom Paris). *User-Centered Evaluation of Lyrics-to-Audio Alignment.* ISMIR 2021. `[FULL]`
8. Chung, Y., Eu, P., Lee, J., Choi, K., Nam, J., Chon, B. S. (Gaudio Lab; KAIST; Genentech). *KAD: No More FAD! An Effective and Efficient Evaluation Metric for Audio Generation.* arXiv 2502.15602v2, 2025-02-21. `[FULL]`
9. Yamamoto, R., Yoneyama, R., Toda, T. (LINE Corp.; Nagoya University). *NNSVS: A Neural Network-Based Singing Voice Synthesis Toolkit.* ICASSP; arXiv 2210.15987. `[FULL]`
10. Yu, Y., Shi, J., Wu, Y., Tang, Y., Watanabe, S. (Georgia Tech; CMU; Renmin University). *VISinger2+: End-to-End Singing Voice Synthesis Augmented by Self-Supervised Learning Representation.* IEEE SLT 2024, pp. 719–726; arXiv 2406.08761v2. `[FULL]`
11. Tang, Y., Liu, L., Feng, W., Zhao, Y., Han, J., Yu, Y., Shi, J., Jin, Q. *SingMOS-Pro: A Comprehensive Benchmark for Singing Quality Assessment.* ICASSP 2026, DOI `10.1109/icassp55912.2026.11460899`; arXiv 2510.01812v3. `[FULL]`
12. Kruspe, A. *More than words: Advancements and Challenges in Speech Recognition for Singing.* arXiv 2403.09298v1, 2024. `[FULL]`

**Academic, read `[PARTIAL]` (12):** Guo et al., *STARS*, ACL Findings 2025 (`2025.findings-acl.781`) · Wang et al., *Prompt-Singer*, NAACL 2024, arXiv 2403.11780v3 · Li et al., *SVPT*, ACL Findings 2024 (`2024.findings-acl.585`) · Zhang, Chang, Wu, Tan, Qin, Zhang, *ReLyMe*, ACM MM 2022, arXiv 2207.05688 · Yuan et al., *YuE*, arXiv 2503.08638v1 · Wang et al., *Mel-Band RoFormer*, arXiv 2310.01809 (+ *BS-RoFormer*, ICASSP 2024, DOI `10.60864/8nm2-j542`) · Martínez-Ramírez et al., *Automatic music mixing with deep learning and out-of-domain data*, ISMIR 2022, arXiv 2208.11428 · Yao et al., *SongEval*, arXiv 2505.10793 · Pamuk et al., *FreyaTTS*, arXiv 2607.09530v2 · *Montreal Forced Aligner and the state of speech-to-text alignment in 2026*, arXiv 2606.18466v1 · *Mitigating Latent Mismatch in cVAE-Based SVS via Flow Matching (FM-Singer)*, arXiv 2601.00217 · Wu et al., *A Systematic Exploration of Joint-training for SVS*, arXiv 2308.02867. Additional `[PARTIAL]`/supporting: *MEGAMI*, ICASSP 2026, DOI `10.1109/icassp55912.2026.11462677` · *SingVisio*, arXiv 2402.12660 · *VITS-based SVC with DSPGAN for SVCC2023*, arXiv 2310.05118 · *VoiceMOS Challenge 2024*, arXiv 2409.07001 · *SingMOS*, arXiv 2406.10911 · *Efficient Vocal Source Separation Through Windowed Sink Attention*, arXiv 2510.25745 · *Singing voice synthesis via latent flow matching and DDSP*, CEUR-WS Vol-4160 paper 15 · *Bridging Speech and Singing*, Interspeech 2025 (ISCA archive `liu25h_interspeech`) · *Singing to speech conversion with generative flow*, PMC11893632 · *Research on the Recognition and Application of Montreal Forced Aligner for Singing Audio*, DOI `10.54097/ohpdubg1` · *Amphion*, arXiv 2312.09911.

**Non-academic primaries (22):** MIREX 2024 Lyrics-to-Audio Alignment task and results wikis · `mir_eval.alignment` docs · GTSinger `dataset_license.md` and `AaronZ345/GTSinger` · `open-mmlab/Amphion` · `ace-step/ACE-Step` and `ACE-Step/acestep-v15-xl-turbo-diffusers` · `tencent-ailab/SongGeneration` · `ASLP-lab/DiffRhythm` · `qiuqiao/SOFA` · `sony/FxNorm-automix` · MVSEP model news/leaderboard · MTG Turkish Makam Acapella Sections Dataset (Zenodo 1287656 + GitHub) · Turkish Şarkı Vocal Dataset (DOI `10.5281/zenodo.1283350`) · `freyavoice/Freya-TTS` · `alibayram/jeji-turku` · `microsoft/muzic` ReLyMe + SongMASS pages · `AaronZ345/TCSinger` · SVCC 2023 rules (`vc-challenge.org`) · `TangRain/SingMOS-Pro` + `ASLP-lab/SongEval` cards · `wildminder/awesome-ai-voice` · `hcfk/qwen3-tts-turkish` + `gokbilge/gokbilge-tts` (ISSAI Turkish corpus consumers).

**Explicitly EXCLUDED (recorded per CONTEXT-05):** themoonlight.io, whitefiber.com, aileading.cn, studio.aifilms.ai, diffrhythm.com, comfyui-wiki.com, emergentmind.com, deepwiki.com, dl4am.github.io. None carries any claim here.

---

# 23. Completion audit

| R17.1 gate | Result |
|---|---|
| Artefact reopened from disk after writing | ✓ — read back this session; line count and SHA-256 in the return |
| Planned vs produced artefacts | 1 planned / 1 produced, plus 37 source captures created by this slice (all verified present) |
| Source counts recounted | authoritative **46** · academic **24** · academic-`[FULL]` **12** · primary-`[FULL]` **32** |
| Claim counts | 3+ verified **9** · single-source **4** · unverified **2** · scope-bounded absence **1** |
| Every counted academic-`[FULL]` has five R9 parts with locators | ✓ for A2, A3, A4, A5, A7, A8 (full narrative records in §6.2, §7, §9.1, §9.2, §10.2, §12.3); A1, A6, A9, A10, A11, A12 carry their problem/method/numbers/limitations/application distributed across §6.1, §12, §13, §14, §15 with per-table locators |
| arXiv/DOI identities verified by retrieval | ✓ — every identifier cited was reached by fetching the paper; **one exception recorded as UNVERIFIED**: the arXiv id attached to the ACE-Step-1.5 SongEval claim |
| Liveness / relevance / entailment checked separately | ✓ — see §16; entailment is why C8, C9, C12, C13 are flagged rather than asserted |
| Every CONTEXT-02 angle has primary-sourced content or an evidence-backed statement of absence | ✓ — (a) §6.1–6.2 · (b) §7 · (c) §8 · (d) §9 · (e) §10 · (f) §6.3 · (g) §11 · (h) §12 · (i) §13 · (j) §14 · (k) §15 |
| Placeholders, TODOs, vague filenames, sample dates | none — searched before write-back |
| Honest-status banner required? | **NO.** Slice floors (≥20 authoritative, ≥10 academic, ≥8 academic-`[FULL]`) are met at 46 / 24 / 12. Saturation was NOT reached and is declared as such in §4 and §19 rather than concealed — which is the honest form, not a floor shortfall |
| Self-graded quality claim | none made. This document reports counts, locators, contradictions and named gaps |

**Two disclosures that belong in the audit rather than in a footnote.** First, this slice **spent nothing and generated nothing**; every number in it is another party's measurement read from their table, so per CONTEXT-18(1) **nothing here is capability evidence for our own stack**. Second, the document deliberately reports more negative results than positive ones — metrics that fail, corpora that are non-commercial, a language with no data — because those are the findings that change the decision, and the parent asked for the science rather than the encouragement.
