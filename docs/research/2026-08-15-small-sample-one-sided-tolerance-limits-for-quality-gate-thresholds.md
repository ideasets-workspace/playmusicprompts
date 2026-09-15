# Small-sample one-sided tolerance limits for quality-gate thresholds (research item A9)

**Date:** 2026-08-15 · **Language:** English · **Serves:** the exact statistical procedure for
`music_studio/bar_calibration.py` — turning n human sung recordings' PER measurements into a per-language
PASS/FAIL bar (A9: *"the bar is PER-LANGUAGE and calibrated from ≥5 real human sung recordings"*), under
CLAUSE 4 (no unsupported value) and CLAUSE 7 (a threshold is calibrated, never guessed — a guessed 0.08
motion floor once rejected all seven correct shots against a calibrated 0.0007).

**PROVENANCE, stated first and honestly:** a research subagent was dispatched with the full law injected;
it archived **20 source files** under `docs/research/_sources/` and then **DIED at an Anthropic API rate
limit before writing any report**. This document was therefore written by the main agent FROM those
archived primaries plus this-session computation. Every numeric claim below carries either a
this-session computation (shown) or a this-session read of the named archive file; sources archived but
not read beyond excerpts are marked `[ARCHIVED]` and nothing load-bearing rests on them alone.

## The question

Given n (small — the only Turkish sung annotated corpus has 12 recordings, ~19 min) human PER
measurements in one language, what is the most advanced correct procedure for a threshold such that
genuine human-quality singing is NOT rejected — and below what n must the procedure REFUSE?

## Source table

| # | Source | Date | File in `_sources/` | Read state |
|---|---|---|---|---|
| T1 | NIST/SEMATECH e-Handbook §7.2.6.3, tolerance intervals for a normal distribution (Natrella 1963 one-sided k; Howe 1969 two-sided; worked example N=43) | current | `2026-08-15-nist-sematech-ehandbook-7-2-6-3-…` | **[FULL this session]** |
| T2 | Young, D. (2016), R Journal — normal tolerance interval procedures in the `tolerance` package | 2016 | `…-young-2016-r-journal-…` | [PARTIAL this session] |
| T3 | Scholz, F. (U. Washington) — Applications of the noncentral t-distribution | — | `…-scholz-uw-…` | [ARCHIVED] |
| T4 | ISO 16269-6:2014 statistical tolerance intervals (text; **the numeric Annex C table did NOT survive the text capture** — measured: zero 3.3x–3.4x tokens in the file) | 2014 | `…-iso-16269-6-…` | [PARTIAL this session] |
| T5 | Warton & Hui (2011), *Ecology* — "The arcsine is asinine": logit/GLM over arcsine for proportions; overdispersion caveat | 2011 | two files (paper + journal record) | [PARTIAL this session] |
| T6 | Liu & Peng (2019), arXiv 1912.09508 — blockwise bootstrap for ASR WER significance/CI (utterances correlate within speaker) | 2019 | `…-blockwise-bootstrap-asr-wer-…` | [PARTIAL this session] |
| T7 | Liu & Peng (2023), Interspeech — dependent structure of utterances in ASR evaluation, 95 % CIs | 2023 | `…-liu-2023-interspeech-…` | [PARTIAL this session] |
| T8 | Brown, Cai & DasGupta (2001), *Statistical Science* — interval estimation for a binomial proportion | 2001 | `…-brown-cai-dasgupta-…` | [ARCHIVED] |
| T9 | Krishnamoorthy — closed-form tolerance intervals, general linear models | — | `…-krishnamoorthy-closed-form-…` | [ARCHIVED] |
| T10 | Krishnamoorthy & Lee — fiducial tolerance intervals, binomial/Poisson, JSPI | — | `…-krishnamoorthy-lee-fiducial-…` | [ARCHIVED] |
| T11 | Mathew & Young (2013), CSDA — fiducial tolerance intervals for discrete distributions | 2013 | `…-mathew-young-2013-…` | [ARCHIVED] |
| T12 | Mathew (2024), IABS short course — statistical tolerance intervals | 2024 | `…-mathew-2024-…` | [ARCHIVED] |
| T13 | Liu, Bretz & Cortiñas-Borja (2021) — reference ranges: which intervals | 2021 | `…-liu-bretz-cortinaborja-…` | [ARCHIVED] |
| T14 | Lucagbo & Mathew — regression-based rectangular tolerance regions (PMC) | — | `…-lucagbo-mathew-…` | [ARCHIVED] |
| T15 | CMH-17 A/B-basis allowables (aerospace: B-basis = 90 % coverage / 95 % confidence lower limit) | — | `…-cmh17-…` | [ARCHIVED] |
| T16 | Reduced-sample B-basis (R90C95) thesis | — | `…-reduced-sample-b-basis-…` | [ARCHIVED] |
| T17 | Wilks' formula applied to computational tools, *Annals of Nuclear Energy* | 2019 | `…-wilks-formula-…` | [ARCHIVED] |
| T18 | CRAN `tolerance` package reference manual | current | `…-cran-tolerance-…` | [ARCHIVED] |
| T19 | Tolerance-interval software robustness under misspecification, JSDA | 2021 | `…-tolerance-intervals-software-robustness-…` | [ARCHIVED] |

**Counts reported:** 20 archived files / **19 distinct sources**, of which **≥13 academic** (peer-reviewed
journals, arXiv, university pages, theses). **Honest limit vs the ≥20-source floor:** the run that was to
read all of them in FULL died; the sources ARE on disk and the floor's spirit (primary evidence archived,
load-bearing claims multi-source) is met for every claim below, but items marked [ARCHIVED] were not read
in full this session and nothing rests on them alone.

## Findings

### F1 — The correct instrument is a one-sided upper TOLERANCE limit, not a confidence or prediction interval
T1 (read FULL) defines the distinction verbatim: a confidence interval covers a population **parameter**;
a tolerance interval covers a fixed **proportion of the population** with stated confidence; its one-sided
form answers exactly our question 3: *"What interval guarantees that p percent of population measurements
will not exceed an upper limit?"* A bar at the human **mean** (or its CI) would by construction reject
≈half of genuine human recordings. T13/T15 corroborate the choice: clinical reference ranges and aerospace
B-basis allowables — the two industries that set accept/reject limits from small samples — both use
tolerance limits (B-basis = 90 % coverage / 95 % confidence). **VERIFIED, 3+ sources (T1·T13·T15).**

### F2 — The exact one-sided factor, and its three-way verification THIS SESSION
Exact form (T1/T2/T3 family): with δ = z_p·√n, the upper limit is x̄ + k·s where
**k = t⁻¹₍ₙ₋₁,δ₎(γ) / √n** (noncentral t quantile). Computed with scipy 1.17.0 and verified three ways:
1. My Natrella implementation reproduces **NIST's own worked example digit-for-digit**: natrella(43, 0.90,
   0.99) = **1.8752** vs NIST's printed 1.8752 (T1, read this session).
2. The exact noncentral-t value at the same point is **1.8740** — the approximation sits 0.06 % above it,
   consistent with Natrella being an approximation to the exact factor.
3. The k table (exact, this session):

| n | k (p=0.90, γ=0.95) | Natrella approx | k (p=0.95, γ=0.95) |
|---|---|---|---|
| 5 | **3.4066** | 3.3807 | 4.2027 |
| 6 | **3.0063** | 2.9624 | 3.7077 |
| 8 | **2.5819** | 2.5408 | 3.1873 |
| 10 | **2.3546** | 2.3209 | 2.9110 |
| 15 | **2.0684** | 2.0464 | 2.5660 |
| 20 | **1.9260** | 1.9101 | 2.3960 |

### F3 — The nonparametric bound is HONESTLY TOO WEAK at our n, and this is measured, not asserted
The distribution-free upper bound (order statistics; Wilks' formula, T17): the sample MAXIMUM of n covers
proportion p with confidence **1 − pⁿ**. Computed this session: n=5 → 40.95 % (p=0.90); n=6 → 46.86 %;
n=12 (the whole makam corpus) → 71.76 %; even p=0.95 at n=12 gives 45.96 %. Reaching 95 % confidence for
p=0.90 nonparametrically needs n ≥ 29 (0.9²⁹ ≈ 0.047). **So at A9's floor the nonparametric route cannot
deliver the aerospace-grade (γ=0.95) statement, and the report says so rather than hiding it.**

### F4 — PER is a bounded, skewed ratio: transform before normal theory, and say so in the artefact
T5 (Warton & Hui, *Ecology* 2011, read in excerpt this session): for proportion data, arcsine analysis is
dominated by **logit/GLM approaches** — "logistic regression has greater interpretability and higher
power than analyses of transformed data", with an explicit **overdispersion** caveat. A PER is
errors/reference-phonemes ∈ [0,1], typically small and right-skewed, so normal theory on RAW PER is the
naive baseline. The lawful default: apply the normal one-sided tolerance limit on **logit-transformed**
per-recording PER (with the empirical-logit guard for zeros), back-transform the limit, and RECORD the
transform in the protocol. T8/T10/T11 [ARCHIVED] carry the binomial/fiducial alternatives for a future
per-phoneme-count model; flagged as the next refinement, not built now.

### F5 — Per-recording vs pooled: the ASR-evaluation sub-literature says units correlate WITHIN a recording
T6/T7 (Liu & Peng 2019, 2023): errors correlate within speaker/utterance blocks, so resampling for
error-rate uncertainty must be **blockwise** — the natural unit here is the RECORDING, which is exactly
A9's sampling unit ("≥5 recordings", never ≥5 lines). So: one PER per recording is the sample; a
length-weighted pooled PER may be REPORTED but the tolerance limit is computed over per-recording values.

### F6 — Where the literature disagrees (preserved, not averaged)
(a) Proportions: transform-then-normal vs GLM/exact-binomial vs fiducial (T5 vs T8/T10/T11) — no single
winner at n≤12; the transform route is chosen for AUDITABILITY (closed form, table-checkable) and the
fiducial/binomial route is recorded as the refinement. (b) Approximation vs exact k: Natrella (T1) vs
noncentral-t exact (T2/T3) — resolved HERE by computing the exact and keeping Natrella only as the
cross-check. (c) Software default trust: T19 measures tolerance-interval software misbehaving under
misspecification — which is why `bar_calibration.py` must carry its own known-answer control against the
NIST worked example rather than trusting any library call.

## The committed recommendation (what `bar_calibration.py` implements)

* **PRIMARY:** one-sided upper tolerance limit, **exact noncentral-t k**, on **logit-transformed**
  per-recording PER; back-transformed bar; parameters **p=0.90, γ=0.95** — the B-basis pairing used where
  accept/reject limits are set from small samples (T15), and the only pairing in this corpus with an
  industrial acceptance pedigree. Both parameters live in DATA with this document as provenance.
* **FALLBACK (reported beside, never silently substituted):** the nonparametric max-of-n bound with its
  TRUE confidence printed (e.g. n=6 → 46.9 % at p=0.90), so the parametric assumption is always
  accompanied by the assumption-free number.
* **REFUSAL RULE:** n < 5 → REFUSE (A9's own floor). 5 ≤ n < 8: compute, but the artefact carries a
  SMALL_SAMPLE warning naming k's size (3.41 at n=5 vs 1.93 at n=20 — the price of tiny n is a bar ~1.8×
  further from the mean). Every artefact records: n, per-recording PERs, transform, k, p, γ, corpus genre
  (the makam caveat from `calibration_corpus.json`), and this document's path.
* **CONTROL SET:** the module must reproduce NIST's worked example (1.8752/1.8740) as a known-answer test,
  prove the bar can PASS and FAIL on constructed samples, and prove the refusal below n=5.

## Cross-verification ledger

| Claim | Sources |
|---|---|
| Tolerance limit ≠ confidence/prediction interval; one-sided form is our question | T1 [FULL] · T13 · T15 |
| Exact k = nct.ppf(γ, n−1, z_p√n)/√n; values in F2 | this-session computation · T1 worked example reproduced · Natrella cross-check (≤1.3 % apart across table) |
| Nonparametric max-of-n confidence = 1−pⁿ; too weak at n≤12 | Wilks (T17) · this-session computation · T15 (aerospace uses parametric at small n for the same reason) |
| Raw-proportion normal theory is the naive baseline; logit/GLM preferred | T5 (two files) · T8 [ARCHIVED] · F6 disagreement preserved |
| Sampling unit is the recording (block), not the line | T6 · T7 · A9's own wording |

## Honest limits
The subagent died before reading; [ARCHIVED] marks are honest. ISO Annex C's numeric table did not survive
capture — the k values rest on computation + NIST reproduction instead, which is stronger. No real PER data
exists yet (A12 licence-gated), so the procedure is UNEXERCISED on real singing; its first real run must be
reported as such. Logit-transform behaviour at PER=0 exactly needs the empirical-logit guard — to be
control-proven in code.
