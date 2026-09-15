# Standards ledger

Read from disk in the session that opened this run (2026-08-17): `.claude/memory/DECISIONS.md`
(D-SSM-31, his verdict verbatim) · `.claude/memory/BOOT.md` (law 5: never guess a threshold) ·
`generate_music_hybrid_model/music_studio/bar_calibration.py` (the project's calibrated-threshold
pattern) · the deep-research covenant `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (marked
block SHA-256 recomputed this session:
`69d557a1ab2b80027be1815c4fc07c37f5bd2c310448d48a6dce64617c14aa17`).

# Rhythmic monotony and take-similarity gate — frontier measurement methods (R3 scope plan)

## 1. The decision this research serves

Berk's verdict on every music output shown to date (D-SSM-31, 2026-08-17, verbatim: *"hep aynı ristm
carbon copy bu çöp"*) names two defects: rhythmic monotony WITHIN a take and carbon-copy sameness
BETWEEN takes. Under the presentation ban, no output reaches him until BOTH are measured gates that
can fail. The engine has ZERO such measurement today (absence search recorded in the preflight).
**This research establishes: the frontier MIR methods for both axes, with real published numbers,
implementable in our own Python (Google-only binds SERVICES, not our own algorithm code), and the
lawful calibration procedure for each threshold (never guessed — BOOT law 5).**

## 2. Subquestions

1. WITHIN-take monotony: which methods does the MIR literature use for repetitiveness/self-similarity
   of a music track — self-similarity matrices and novelty (Foote), tempogram/rhythmogram stability,
   beat-synchronous feature entropy, structure-segmentation-based repetition scores, and whatever is
   NEWER than these (2023-2026 work on generated-music evaluation, diversity metrics for music LLMs)?
2. BETWEEN-take similarity ("carbon copy"): cover-song/near-duplicate detection (chroma cross-
   similarity, Qmax/dmax), audio fingerprinting, embedding-space distances (CLAP/MERT-class open
   models — licence check per model), FAD-class distribution metrics and their per-pair variants?
3. Which of these carry PUBLISHED numbers separating repetitive from varied material (benchmarks,
   datasets, reported thresholds/AUCs)?
4. Calibration: how does the literature set pass/fail bars for such gates (labelled sets, tolerance
   limits, ROC operating points), and what does that mean for OUR bar procedure (bar_calibration.py's
   tolerance-limit pattern)?
5. Genre validity: do the methods hold for pop/ballad/cinematic (what the engine generates)?

## 3. Falsifiers

A metric shown in its own paper to fail on exactly our genre class → excluded with the citation ·
a method requiring a paid/non-Google SERVICE → excluded (D-SSM-30) · a model whose licence is NC →
flagged, never silently used.

## 4. Inclusion / exclusion

INCLUDE: peer-reviewed MIR papers (ISMIR/ICASSP/TASLP), arXiv, librosa/madmom/essentia docs as
implementation references (licence checked), generated-music evaluation papers, THE DARK (theses,
workshop papers, benchmark repos). EXCLUDE: blogspam, aggregator listicles as authorities.

## 5. Planned artifacts (produced must equal planned)

1. This report · 2. per-source captures `docs/research/_sources/2026-08-17-*` · 3. preflight JSON
(written) · 4. completion manifest `docs/research/_runs/2026-08-17-rhythmic-monotony-and-take-similarity-gate.completion.json`
· 5. `docs/README.md` index row. **Total: 5 artifact classes.**

## 6. Hard-law check

Clause 4 (no unsourced value) · Clause 7 (instrument needs a control; threshold calibrated or NOT RUN)
· BOOT law 5 (0.08 lesson) · D-SSM-30 ($0, no paid services) · research floors ≥20/≥5 [FULL].

## 7. Completion semantics

Done when: both axes each end with ≥2 candidate methods carrying real published numbers + an
implementation path in our own code + a stated calibration procedure; cross-verification ledger
covers every load-bearing claim; artifacts 5/5 produced and indexed.

# Outcome first

Run totals: **27 independent authoritative source families / 20 academic / 5 academic read [FULL] with
five-part records** (Foote & Cooper 2002 · Grosche/Müller/Kurth 2010 · Serrà/Serra/Andrzejak 2009 ·
Wu & Yang 2023 · Haitsma & Kalker 2002); 22 raw captures archived under `docs/research/_sources/2026-08-17-*`.

**Committed recommendation, axis 1 (WITHIN-take rhythmic monotony):** implement the
**Structureness-Indicator family on the fitness scape plot** (Müller & Jiang 2012; used as the
generated-music monotony metric by Wu & Yang, ISMIR 2020 and ICASSP 2023) **computed from a
beat/tempo-robust SSM in our own numpy/librosa code (ISC — lawful)**, PLUS the **cyclic-tempogram
stability statistic** (Grosche/Müller/Kurth, ICASSP 2010) as the rhythm-specific axis: the published
separation is large and monotone — naive 1-bar repeats score SI_short **83.6 ± 8.6 %** vs real pop
**43.8 ± 7.1 %** vs an under-structured transformer **32.5 ± 3.3 %** — so a MONOTONY gate fails a take
whose SI sits in the naive-repeat band (bar calibrated, never guessed, per §Calibration below). The
"over-repetition" red-flag definition published by the same authors (one bar exactly repeated > 6
consecutive times, or two bars > 4 times: 5.5 % of bad generations vs 0.5 % of real data) transfers as a
deterministic side-check on the beat-synchronous self-similarity diagonal.

**Committed recommendation, axis 2 (BETWEEN-take carbon-copy):** implement **chroma cross-similarity with
the Serrà Qmax cumulative recurrence measure** (New J. Phys. 11:093017, 2009 — MIREX-winning, mean average
precision 0.667 out-of-sample / 0.661 MIREX-2008, full equations in this report, plain numpy
implementable, no model download, no licence risk) as the primary between-take similarity instrument,
with the **Haitsma-Kalker 32-band sign-of-energy-difference fingerprint BER** as the cheap first-stage
near-exact-duplicate screen (published operating point BER 0.35 over 8192 bits → false-positive rate
3.6·10⁻²⁰; MP3-transcode BER measured 0.078–0.085). **CLAP `laion/larger_clap_music` (Apache-2.0,
lawful) MAY back an embedding distance later; MERT (all checkpoints CC-BY-NC-4.0) is FORBIDDEN for this
commercial product — and that NC poison transfers to MAD, whose reference implementation is MAUVE over
MERT-v1-330M.**

**Calibration (both axes):** no published universal threshold exists for either gate — Serrà's own MIREX
system is a RANKER (no absolute threshold published) and Haitsma's 0.35 is for near-exact copies only.
The lawful path is the project's own `bar_calibration.py` pattern: label ≥ 5 known-varied vs known-monotone
takes per genre bucket, transform the bounded score to logit, and set the bar as the exact
noncentral-t one-sided upper tolerance limit — exactly how the MusicLM memorization gate set ITS
threshold (τ = 0.85 calibrated on the empirical matching-cost distribution of permuted NEGATIVE pairs,
< 0.01 % false positives) — negatives-first calibration, never a guessed constant.

# Per-method table

| Axis | Method | Key equation / idea | Published numbers (dataset) | Licence / implementation path | Verdict |
|---|---|---|---|---|---|
| 1 | Foote SSM + checkerboard novelty (Foote 2000 ICME; Foote & Cooper SPIE 2002) [FULL] | S(i,j)=d_cos(v_i,v_j); novelty = Gaussian-tapered checkerboard kernel correlated along the diagonal; lag-domain band K=256 cuts compute > 96 % | Segmentation of "Wild Honey" (U2): automatic boundaries within ~1 s of manual (Table 1, SPIE02); no repetitiveness score published — it is the SUBSTRATE | Public-domain algorithm; librosa (ISC) has `segment` utilities; plain numpy | ADOPT as substrate for SI, not as the gate itself |
| 1 | Fitness scape plot + Structureness Indicator SI (Müller & Jiang ISMIR 2012 [PARTIAL]; Wu & Yang ISMIR 2020 / ICASSP 2023 [FULL]) | fitness φ(α) of every segment α=[s:t] from path-enhanced chroma SSM; SI_range = max φ over segments in a duration band (Wu-Yang 2023 bands: 4–12 s, 12–32 s, > 32 s) | Real pop **43.8±7.1 / 43.1±8.4 / 34.8±12 %** (short/mid/long); naive 1-bar repeats **83.6/88.3/75.7 %**; CP Transformer 32.5/29.9/17.9 % (Pop1K7-derived audio, Table 2, arXiv:2209.08212) | SM Toolbox is MATLAB, but MusDr repo added "Python support for SSM and fitness scape plot computation" (librosa-based); own numpy port lawful | **ADOPT — primary monotony gate.** HIGH SI band = monotone (fails); band edges calibrated |
| 1 | Cyclic tempogram (Grosche/Müller/Kurth ICASSP 2010) [FULL] | Fourier tempogram T^F(t,τ)=|F(t,τ/60)| of the spectral-flux novelty curve (Hann 6 s); C(t,[τ])=Σ_{λ∈[τ]}T(t,λ) folds tempo octaves (τ range 30–480 BPM); rhythm monotony statistic = temporal variance/entropy of C columns | Qualitative segmentation demos (Zager & Evans / Beethoven Pathétique / Brahms No. 5): tempo-class segments recovered where MFCC/chroma homogeneity fails; NO quantitative benchmark in the paper | `librosa.feature.tempogram` + `tempogram_ratio` (ISC); FMP notebooks (AudioLabs) give reference code | ADOPT as the rhythm-specific axis: a take whose cyclic-tempogram columns are near-constant for its whole duration is rhythmically static — statistic yes, threshold must be calibrated locally |
| 1 | Beat-synchronous feature entropy / groove consistency (Wu & Yang ISMIR 2020 "Jazz Transformer" metrics H, GS) [PARTIAL via ICASSP 2023 + MusDr] | H = entropy of 1-/4-bar chroma histograms; GS = 1 − HammingDistance(g_a,g_b) over ALL bar-pair groove vectors (onset positions per sub-beat) | CP Transformer got LOWER H and HIGHER GS than real data (Table 2 discussion, arXiv:2209.08212) — i.e. blander harmony + more uniform rhythm; exact GS values not printed in the ICASSP paper | MusDr repo (GitHub, symbolic parts event-based; GS re-derivable from onsets via librosa onset detection); numpy | ADOPT GS as secondary within-take statistic (it is exactly "same rhythm every bar"); H optional |
| 1 | Compression ratio / repetition rate / information rate (Chuan & Herremans 2018; Yuan et al. 2024; Lattner et al. 2018 — via survey arXiv:2509.00051 [PARTIAL]) | repetitiveness ≈ len(compressed)/len(raw) of a tokenised representation; information rate from a variable Markov oracle | Survey lists them as standard symbolic repetition metrics; no audio-domain separation numbers printed in the survey text we captured | Trivial in Python (zlib/LZ77 on quantised beat-synchronous chroma); no licence issue | KEEP as cheap cross-check only — weaker evidence trail on AUDIO than SI |
| 1/2 | Vendi Score (Friedman & Dieng, TMLR 2023, arXiv:2210.02410) [PARTIAL] | VS_k = exp(Shannon entropy of eigenvalues of K/n), K = pairwise similarity matrix, k(x,x)=1; interpretable as the effective number of unique elements; estimator converges ∝ 1/√n | GAN mode-collapse and molecule (MOSES) experiments: VS exposed an HMM generating exact duplicates that IntDiv missed (Fig. 3); no music-audio numbers in the paper | `vertaix/Vendi-Score` (GitHub); definition is 5 lines of numpy (eigvalsh + entropy) | ADOPT as the BATCH-level diversity number over the between-take similarity matrix: VS ≈ 1 means the batch is one effective take — "carbon copy" made a single scalar |
| 2 | Chroma cross-similarity + Qmax (Serrà/Serra/Andrzejak, New J. Phys. 11:093017, 2009) [FULL] | 12-bin HPCP, 464 ms frames; optimal-transposition-index key alignment; delay embedding m=10, τ=1; CRP with κ=0.1 nearest-neighbour threshold (eq. 2); cumulative Q matrix (eq. 5) with gap penalties γo=5, γe=0.5; Qmax = longest curved, disrupted trace | In-sample Ψ=0.813; out-of-sample Ψ=**0.667** (1,953-song / 500-cover-set collection); MIREX 2008 Ψ=**0.661** raw, **0.750** with set post-processing — highest MIREX cover-song accuracy to that date | Full equations in the open-access paper; plain numpy (~100 lines); librosa supplies chroma_cqt (HPCP-class) | **ADOPT — primary between-take instrument.** Same music re-rendered = the extreme easy case of a cover; normalised Qmax/|y| is the similarity score |
| 2 | Spectral band-energy fingerprint BER (Haitsma & Kalker, ISMIR 2002) [FULL] | 32-bit sub-fingerprint per 11.6 ms: sign of E(n,m)−E(n,m+1)−(E(n−1,m)−E(n−1,m+1)) over 33 log bands 300–2000 Hz; block = 256 sub-prints (3 s); similarity = bit error rate | Threshold **α=0.35** ⇒ P_f = erfc(6.4)/2 = **3.6·10⁻²⁰** (with the measured ×3 correlation correction, σ_BER measured 0.0148 vs 0.0055 i.i.d. on 10,000 songs); MP3@128k BER 0.078–0.085; ±4 % speed change breaks it (BER > 0.35) | Chromaprint (LGPL-2.1 as a whole — flag: dynamic linking obligations; own-code MIT) or ~60-line numpy reimplementation of the PUBLISHED algorithm (lawful, no licence) | ADOPT as stage-1 near-exact screen; NOT sufficient alone — it is deliberately blind to re-renders that differ in fine texture |
| 2 | CLAP embedding cosine distance (Wu et al. 2023, arXiv:2211.06687) [PARTIAL] | pairwise cosine of `get_audio_features` embeddings; batch diversity via Vendi over the same kernel | GTZAN zero-shot 91.5 % / ESC-50 90.14 % for the music checkpoint (repo README); no published near-duplicate threshold | **`laion/larger_clap_music` HF card: `license: apache-2.0` (read this session); LAION-AI/CLAP repo: CC0-1.0.** LAWFUL | ADOPT (second stage, optional first release): catches "same arrangement, different notes" sameness that chroma misses |
| 2 | MERT embeddings / MAD (Li et al. 2023; Huang et al. 2025, arXiv:2503.16669) [PARTIAL] | MAD = MAUVE divergence computed on MERT-v1-330M embeddings | MAD τ=0.62 (p=0.07) with human preference ranking vs FAD-VGGish τ=0.14 (MusicPrefs, Table 2); MAD 0.84 avg τ vs FAD 0.49 on synthetic meta-eval (abstract) | **MERT-v1-95M and v1-330M model cards: `license: cc-by-nc-4.0` — NonCommercial. FATAL for this product (D-SSM-30 constraint set + commercial use)** | **AVOID (licence).** The methodology (self-supervised embeddings beat VGGish/CLAP-discriminative for eval) still informs the CLAP choice |
| 2 | Pairwise/per-song FAD & KL (Kilgour 2019; Gui et al. 2024 FAD∞; Chung et al. 2025 KAD — via arXiv:2311.01616 [PARTIAL], 2504.21815 [PARTIAL], survey [PARTIAL]) | Fréchet distance between Gaussian fits of embedding sets; per-song FAD = one song vs reference set | Per-song FAD–MOS Pearson correlations reported per test set (arXiv:2311.01616 Fig. 5, CLAP variants best); FAD assumes Gaussian embeddings — "often false" (survey §3.1.1); KAD/MMD fixes small-sample bias | fadtk / own numpy over CLAP embeddings | AVOID for take-vs-take (it is a SET metric, needs a reference distribution); the Gaussian-assumption contradiction is preserved below |
| 2 | Token-level memorization matching (MusicLM arXiv:2301.11325 [PARTIAL]; MusicGen arXiv:2306.05284 [PARTIAL]) | exact + approximate token-sequence match; approximate = optimal transport (Sinkhorn) between token histograms; **threshold τ=0.85 CALIBRATED on permuted negative pairs → < 0.01 % false approximate matches** | MusicLM: exact matches < 0.2 % at 10 s prompts; matched sequences have LOW token entropy (4.6 bits average vs 1.0 bits for matches) — low internal diversity predicts duplication; MusicGen: exact + 80 %-partial match rates vs prompt length (Fig. 2b) | We have no Lyria tokens (hosted model) — method not portable; its CALIBRATION PROCEDURE is | ADOPT the calibration procedure (negatives-first empirical distribution), not the metric |
| 3 | Exact noncentral-t one-sided upper tolerance limit (project `bar_calibration.py`, read this session) | k = nct.ppf(γ, n−1, z_p√n)/√n on logit-transformed bounded scores; Wilks nonparametric companion 1−pⁿ reported beside it | NIST worked example reproduced digit-for-digit (Natrella k1=1.8752; exact 1.8740); k(5,0.90,0.95)=3.4066 | Already in-repo; scipy required | **ADOPT — the bar-setting procedure for BOTH new gates** |
| 4 | Beat-weak material failure evidence (Grosche/Müller/Sapp ISMIR 2010 [PARTIAL]; Chiu et al. TASLP 2023 [PARTIAL]; Davies & Plumbley ISMIR 2004 [PARTIAL]) | soft onsets blur the novelty curve → beat-tracking and beat-synchronous features degrade on non-percussive material; PPT tempo assumptions fail under expressive tempo (oracle-activation F1 still < 0.80 on Maz-5) | madmom HMM baseline F1 0.473 (ASAP) / 0.595 (Maz-5) vs PLPDP 0.493 / 0.838 (TASLP 2023, abstract + §IV); HFC onset detection "performs poorly" on bowed strings (ISMIR 2004 §2.2) | n/a (evidence, not an instrument) | CONSTRAINT: for cinematic/ballad takes, never make the gate beat-tracker-DEPENDENT — SI on time-regular (not beat-synchronous) chroma frames and the Fourier tempogram (no discrete beat decisions) remain valid; a beat-grid-based GS is pop-only |

# Findings with real numbers

**F1 — SI separates monotone from varied material with a published, three-way-ordered gap.** On audio
synthesized from Pop1K7-class material (arXiv:2209.08212 Table 2, read [FULL]): naive 1-bar repetition
SI_short **83.6 ± 8.6 %**, real pop **43.8 ± 7.1 %**, an under-structured generator **32.5 ± 3.3 %**. The
monotony gate direction is the HIGH side (naive-repeat band); the same table shows the LOW side detects
structureLESSness. Both defect classes Berk heard ("hep aynı ritm" = high-side; wandering mush = low-side)
are measurable on one instrument. Timescale bands are genre parameters (Wu-Yang 2020 used 3/8/15 s; the
2023 paper reset them to 4–12/12–32/> 32 s — evidence that bands are TUNED per corpus, i.e. per-genre data,
never engine constants; Mandate Clause 23).

**F2 — The same authors publish a deterministic over-repetition red flag.** "One bar of melody being
exactly and consecutively repeated over 6 times, or two neighboring bars repeated over 4 times" — 5.5 % of
their un-pretrained generations vs **0.5 % of real data** (arXiv:2209.08212 §5). Transferable to audio as
exact-tile detection on the beat-synchronous (pop) or fixed-window (cinematic) chroma self-similarity
diagonal band.

**F3 — Qmax with published parameters is the strongest self-implementable between-take instrument.** All
equations open-access (NJP 11:093017, read [FULL]): HPCP 12 bins/464 ms → OTI transposition → delay
embedding m=10, τ=1 → CRP κ=0.1 → cumulative Q with γo=5, γe=0.5. Accuracy: Ψ 0.667 out-of-sample on
1,953 songs; MIREX 2008 0.661/0.750 (highest ever to that date). For our use the task is EASIER than cover
ID (same engine, same prompt family, near-identical tempo), so the discriminative margin is larger than the
published cover-song figures. Note the guessed-threshold lesson INSIDE the paper: broad optima
(7 < (m−1)τ < 17, κ 0.05–0.15) mean the STRUCTURE parameters are robust, but the pass/fail bar on
normalised Qmax is ours to calibrate — Serrà never publishes one because MIREX ranks instead of thresholding.

**F4 — Fingerprint BER gives a mathematically grounded near-exact operating point.** Haitsma & Kalker
(read [FULL]): with 8192-bit blocks and the measured correlation factor 3 (σ_BER = 0.0148 measured on
100,000 random pairs from 10,000 songs vs 0.0055 i.i.d.), threshold 0.35 yields P_f = erfc(6.4)/2 =
**3.6·10⁻²⁰**; MP3@128kbps produces BER ≈ 0.078–0.085, GSM ≈ 0.16, so anything ≤ 0.35 is the same
recording in the near-exact sense. Two independent corroborations of the same operating point:
Schreiber ISMIR 2011 (τ = 0.35) and the TU/e report (both archived). Limitation measured in the primary:
> ±2.5 % linear speed change breaks the fingerprint — so it screens re-deliveries and byte-level near-copies,
not "same song, slightly different render".

**F5 — Embedding licences split cleanly.** MERT-v1-95M/330M model cards: `license: cc-by-nc-4.0`
(NonCommercial — CC deed: "You may not use the material for commercial purposes"); `laion/larger_clap_music`
HF card: `license: apache-2.0`; LAION-AI/CLAP code repo: CC0-1.0; librosa: ISC; madmom: BSD code but
**CC BY-NC-SA 4.0 model/data files** ("contact Gerhard Widmer" for commercial) — so madmom's PRE-TRAINED
beat models are as forbidden as MERT; essentia is AGPL (copyleft — would infect the Lambda; avoid). Every
recommended implementation path above is numpy/librosa(ISC)/own-code — lawful under D-SSM-30 (no paid
service; our own implementations of published algorithms).

**F6 — The frontier eval literature sets thresholds negatives-first.** MusicLM (arXiv:2301.11325):
approximate-match threshold τ = 0.85 chosen from the empirical matching-cost distribution of PERMUTED
NEGATIVE pairs at < 0.01 % false positives; and the diagnostic that approximate-matched sequences have
average token entropy 1.0 bits vs 4.6 bits normal — low internal diversity CO-OCCURS with duplication,
tying axis 1 to axis 2. Haitsma sets 0.35 from an explicit false-positive model confirmed by measurement.
MusicGen (arXiv:2306.05284) uses exact + 80 %-partial token match rates. None of the three guesses a
constant; all derive it from a measured negative/null distribution — the same logic as `bar_calibration.py`.

**F7 — Vendi Score turns the pairwise similarity matrix into one batch-diversity number.** VS = exp of the
Shannon entropy of the eigenvalues of K/n (any PSD kernel with k(x,x)=1 — ours: normalised Qmax or CLAP
cosine); interpretable as the effective number of distinct takes; estimator error ∝ 1/√n (Bach 2022, cited
in the primary). A 6-take batch with VS ≈ 1.x IS the "carbon copy" verdict as a scalar. Order-q cousins
(Pasarkar & Dieng, AISTATS 2024) let rare-but-duplicated modes weigh more if needed.

**F8 — Genre validity (pop/ballad/cinematic).** The beat-tracking literature (Grosche/Müller/Sapp 2010;
Davies 2004; Chiu 2023, F1 0.473→0.838 numbers above) proves onset/beat-dependent statistics degrade
precisely on soft-onset, tempo-fluid material — the ballad/cinematic end of our output. Therefore: SI on
fixed-window chroma SSM (no beat decisions) and Fourier-tempogram statistics (continuous, no peak-picking)
are the genre-safe core; groove-vector (GS) and bar-tile checks run ONLY when a tempogram-stability
precondition proves a stable pulse exists (pop). This mirrors Clause 7: the instrument must carry a
control proving it can pass AND fail on OUR material before its verdict counts.

# Cross-verification ledger

| # | Claim | Source A | Source B | Source C | Status |
|---|---|---|---|---|---|
| 1 | Foote checkerboard-kernel novelty on the SSM is the canonical boundary method | Foote 2000 (DOI 10.1109/icme.2000.869637) [ABS] | Foote & Cooper SPIE 2002 [FULL] | FMP C4S4 notebook (AudioLabs) + Müller GI tutorial 2017 | VERIFIED 3+ |
| 2 | SI = max fitness-scape value in a timescale band; separation naive 83.6 / real 43.8 / weak-model 32.5 (SI_short) | arXiv:2209.08212 Table 2 [FULL] | MusDr repo (metric definition + timescale_bounds 3 8 15) | Müller & Jiang ISMIR 2012 (fitness/scape definition) + Taiwan AI Labs write-up | VERIFIED 3+ (the NUMBERS themselves are the paper's own table → [single-source] as exact values; the METRIC is 3-source) |
| 3 | Cyclic tempogram folds tempo octaves, C(t,[τ])=Σ T(t,λ); robust mid-level tempo representation | Grosche/Müller/Kurth ICASSP 2010 [FULL] | FMP C6S2 (equations restated) | IEEE DOI record + librosa tempogram docs | VERIFIED 3+ |
| 4 | Qmax: eq. (5) with γo=5, γe=0.5, m=10, τ=1, κ=0.1; Ψ=0.667 out-of-sample, MIREX 0.661/0.750 | Serrà et al. NJP 2009 [FULL] | UPF repository preprint (same text, independent host) | Serrà MIREX 2009 abstract (NOTI=2, m=9 variant, tuned in-house) | VERIFIED (family-adjacent: B and C share authors — flagged; independent third party is the MIREX published result table itself) |
| 5 | Haitsma-Kalker BER threshold 0.35 → P_f 3.6·10⁻²⁰; MP3 BER ≈ 0.078 | ISMIR 2002 paper [FULL] | Schreiber ISMIR 2011 (τ=0.35 restated, independent authors) | TU/e technical report (independent host, same numbers) | VERIFIED 3+ |
| 6 | MERT checkpoints are CC-BY-NC-4.0 (NC = no commercial use) | m-a-p/MERT-v1-95M model card (license line) | khersh conversion card ("inherits CC-BY-NC-4.0") | CC BY-NC 4.0 deed + SPDX full text (NonCommercial clause) | VERIFIED 3+ |
| 7 | laion/larger_clap_music is Apache-2.0; LAION CLAP code CC0-1.0 | HF model card README (`license: apache-2.0`) | HF file-tree page ("License: apache-2.0") | LAION-AI/CLAP repo LICENSE (CC0) + repo metadata | VERIFIED 3+ |
| 8 | Chromaprint as a whole is LGPL-2.1 (MIT own code + FFmpeg parts); AcoustID DB is CC-BY-SA (not needed offline) | chromaprint LICENSE.md (master) | LICENSE.md at v1.6.0 tag | acoustid.org/license | VERIFIED 3+ |
| 9 | librosa is ISC | GitHub repo metadata | setup.cfg (`license = ISC`) | PyPI record | VERIFIED 3+ |
| 10 | madmom: BSD source + CC BY-NC-SA 4.0 models ("contact for commercial") | CPJKU/madmom README | PyPI license field ("BSD, CC BY-NC-SA") | archived PyPI capture | VERIFIED 3+ |
| 11 | MusicLM calibrated its approximate-match threshold on permuted negative pairs (τ=0.85, < 0.01 % FP) | ar5iv HTML of 2301.11325 | PDF mirror (rivista.ai capture) | HF-mirror paper page | VERIFIED (3 hosts, ONE provenance family — [single-source official] for the exact numbers) |
| 12 | FAD's Gaussian assumption is contested; MAD (MAUVE+MERT) correlates better with humans (τ 0.62 vs 0.14) | arXiv:2503.16669 [PARTIAL, capture read] | Survey arXiv:2509.00051 §3.1.1 | arXiv:2504.21815 (uses MAD/KAD, reports model orderings) | VERIFIED 3+ |
| 13 | Beat tracking degrades on soft-onset/expressive material | Grosche/Müller/Sapp ISMIR 2010 | Chiu et al. TASLP 2023 (F1 0.473/0.595 baselines; 0.838 with PLPDP on Maz-5) | Davies & Plumbley ISMIR 2004 §2.2 | VERIFIED 3+ |
| 14 | Vendi Score = exp(entropy of eigenvalues of K/n), reference-free, effective-number semantics | arXiv:2210.02410 [PARTIAL, capture read] | vertaix/Vendi-Score README (formula restated) | Pasarkar & Dieng AISTATS 2024 (PMLR, definition + order-q extension) | VERIFIED 3+ |

# Contradiction ledger

| # | Contradiction | State |
|---|---|---|
| C1 | **FAD is the de-facto standard** (used by MusicLM/MusicGen eval sections) **vs FAD "correlates poorly with human preferences" and its Gaussian assumption "often false"** (MAD paper; survey; Vinay & Lerch cited therein). | PRESERVED. Resolved for OUR decision by irrelevance: FAD is a set-vs-set metric; our gates are take-level. We adopt neither side's metric, only the finding that self-supervised embeddings beat discriminative ones — which steers the optional stage to CLAP-music embeddings used as a SIMILARITY kernel, not as FAD. |
| C2 | **MAD is the best human-aligned eval** (τ=0.62) **vs MAD is built on MERT (CC-BY-NC)** — the frontier method is licence-poisoned for commercial use. | PRESERVED and decisive: AVOID MAD despite its metrics superiority; the NC flows through. If m-a-p ever re-licences MERT, revisit. |
| C3 | **Wu-Yang 2020 timescale bounds 3/8/15 s vs the same authors' 2023 bounds 4–12/12–32/>32 s.** | PRESERVED — proves bounds are corpus-tuned data, not constants; our bounds must come from OUR calibration takes (Clause 4/23). |
| C4 | **Serrà's Qmax parameters differ between the NJP paper (m=10, κ=0.1, γo=5, γe=0.5) and their own MIREX 2009 submission (m=9, κ=0.1, NOTI=2, γo=γe=0.5).** | PRESERVED — both in-family tunings; broad optima (their Fig. 7) mean either works; we start from the JOURNAL values (the peer-reviewed primary). |
| C5 | **madmom is routinely described as "BSD"** (e.g. casual citations) **vs its models are CC BY-NC-SA.** | PRESERVED — the split licence is the primary fact; any beat-tracking use of madmom's shipped models in this product is forbidden without the Widmer contact. |

# Committed recommendation per axis

**AXIS 1 — build `rhythm_monotony_gate` in our own numpy/librosa code, in this order:**
1. Fixed-window (not beat-synchronous) log-chroma SSM → path-enhanced fitness scape plot → **SI_short/mid/long**
   with per-genre timescale bands stored in per-production DATA (start from the published 4–12/12–32/>32 s
   as the calibration STARTING grid, never as the shipped constant).
2. **Cyclic-tempogram stability**: Fourier tempogram (librosa, 30–480 BPM, 6 s Hann), fold to C60, statistic =
   mean column-to-column correlation + temporal entropy over the take. Near-1 correlation for the whole take
   = rhythmically static evidence (his exact complaint), reported beside SI.
3. Deterministic tile check (F2): exact/near-exact consecutive repetition count on the SSM diagonal band.
4. Bar: label ≥ 5 known-monotone + ≥ 5 known-varied takes per genre bucket (his own verdicts are the labels —
   D-SSM-31 already labels the existing corpus monotone), logit-transform SI, set the fail bar with
   `bar_calibration.py`'s exact noncentral-t upper tolerance limit; gate reports NOT RUN until calibrated
   (Clause 7). Control: the gate must fail the D-SSM-31 takes and pass a licence-clean human reference set
   (vocadito / LM-SSD, CC BY 4.0 — already identified in `2026-08-17-human-sung-calibration-corpus.md`).

**AXIS 2 — build `take_similarity_gate` in our own numpy code, two stages:**
1. Stage 1 (cheap, near-exact): own ~60-line implementation of the Haitsma-Kalker 33-band sign fingerprint;
   BER < 0.35 across any 3-s aligned block = near-copy (operating point carried from the primary WITH its
   published false-positive model; re-verified on our negatives at calibration).
2. Stage 2 (musical sameness): 12-bin chroma (chroma_cqt), OTI transposition, delay embedding m=10/τ=1,
   CRP κ=0.1, Qmax with γo=5, γe=0.5, score = Qmax/|y|. Pairwise matrix over the batch → per-pair verdicts
   (Clause 24) + **Vendi Score of the batch** as the single "effective number of distinct takes".
3. Bar: negatives-first (F6) — empirical Qmax/|y| distribution over pairs of DIFFERENT songs (our own
   corpus + human reference), bar at the tolerance-limit of that null distribution, exactly the MusicLM
   procedure; then verify it FAILS the D-SSM-31 carbon-copy pairs. CLAP-music (Apache-2.0) cosine distance
   is the sanctioned second-generation addition; MERT/MAD are licence-refused (C2).

# Honest limits

- SI's published separation numbers (F1) come from SYMBOLIC-origin piano/pop renditions, not Lyria audio;
  the gap direction is 3-source-verified but the absolute band values do NOT transfer — that is exactly why
  the bar is calibrated locally, not copied.
- No source publishes a pass/fail threshold for Qmax on same-engine regenerations (the task is novel);
  the null-distribution calibration is the lawful substitute, and its first run must be reported as a first run.
- MAD/MERT numbers were read from the archived capture [PARTIAL] (key sections + tables), not cover-to-cover;
  Vendi, MusicLM, MusicGen, MSAF, scape-plot likewise [PARTIAL] — all captures archived for the parent's
  re-verification. The 5 [FULL] floor is carried by Foote, Grosche-2010, Serrà-2009, Wu&Yang-2023, Haitsma-2002.
- The GS groove statistic's exact published values are not printed in the ICASSP paper text (only the
  direction); its use here is as a secondary statistic, never load-bearing.
- $0 spent; no audio was processed in this run (methods research only, per the execution limits).
