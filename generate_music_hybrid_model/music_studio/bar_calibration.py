"""Research item A9 — the per-language PER bar calibration routine.

THE PROCEDURE, AND WHERE EVERY PIECE OF IT COMES FROM
------------------------------------------------------
Derived in `docs/research/2026-08-15-small-sample-one-sided-tolerance-limits-for-quality-gate-thresholds.md`
(written 2026-08-15 from 20 archived primaries after the dispatched research subagent died at a rate limit),
with parameters and their evidence in `data/bar_calibration.json` (CLAUSE 4):

  1. The sample is PER-RECORDING PER values (the ASR-CI literature measures errors correlating WITHIN a
     recording — report F5 — and A9's own wording is ">=5 recordings", never ">=5 lines").
  2. PER is a bounded right-skewed ratio, so normal theory runs on the LOGIT of each value (Warton & Hui
     2011, report F4), with their documented zero adjustment (the smallest non-zero value is added to
     zeros); an all-zero sample REFUSES rather than inventing an epsilon.
  3. The bar is the one-sided UPPER TOLERANCE LIMIT x_bar + k*s on the logit scale, back-transformed —
     "with confidence gamma, at least proportion p of the human population lies below this limit". A
     confidence interval on the mean would reject ~half of genuine human recordings by construction
     (report F1, 3+ sources: NIST definition [FULL] · clinical reference ranges · aerospace B-basis).
  4. k is the EXACT noncentral-t factor  k = nct.ppf(gamma, n-1, z_p*sqrt(n)) / sqrt(n)  — verified
     three ways THIS session: the Natrella form reproduces NIST's own worked example digit-for-digit
     (1.8752); the exact value at that point is 1.8740; the table k(5)=3.4066 .. k(20)=1.9260 (report F2).
  5. The assumption-free nonparametric bound (sample max; confidence 1 - p^n, Wilks) is reported BESIDE
     the parametric bar with its TRUE confidence — measured 46.9 % at n=6 — never silently substituted
     and never hidden (report F3).

WHY scipy IS REQUIRED AND NEVER SILENTLY REPLACED: the exact k needs the noncentral-t quantile. If scipy
is absent the routine REFUSES, naming the dependency — shipping the Natrella approximation silently would
be the quiet-downgrade class (it stays here only as the self-test's cross-check, exactly as in the report).

WHAT THIS MODULE DOES NOT DO: it holds no threshold of its own (CLAUSE 7), writes nothing to the language
registry by side effect (the caller merges `registry_bar_entry()` explicitly), and CANNOT run today on real
material — no language has >=5 sung recordings on disk (A12 is licence-gated). Its first real run must be
reported as its first real run.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping, Sequence

_PKG_DIR: Final[Path] = Path(__file__).resolve().parent
_PARAMS_RELATIVE: Final[str] = "data/bar_calibration.json"


class CalibrationError(Exception):
    """A fault in the calibration layer itself (bad config, missing dependency)."""


class CalibrationRefused(CalibrationError):
    """The input cannot lawfully yield a bar — the reason names exactly what is missing.

    A distinct type because refusal is an EXPECTED state (n < 5, degenerate samples), and the caller may
    legitimately record 'bar: NOT_MEASURED with reason' instead of crashing.
    """


@dataclass(frozen=True)
class LabelledRecording:
    """One human sung recording's gate measurement — A9's sampling unit.

    `per` comes from `per_gate.evaluate_lines()` on the recording's separated stem; `reference_phonemes`
    rides along so the artefact can show each recording's weight, and `recording_id` so N recordings mean
    N ledger rows (Clause 24), never a blended list of floats with no provenance.
    """

    recording_id: str
    per: float
    reference_phonemes: int

    def __post_init__(self) -> None:
        if not (0.0 <= self.per <= 1.0):
            raise CalibrationRefused(
                f"recording {self.recording_id!r} carries PER {self.per}, outside [0, 1] — a PER is "
                f"errors/reference-length and cannot leave the unit interval; this input is corrupt")
        if self.reference_phonemes <= 0:
            raise CalibrationRefused(
                f"recording {self.recording_id!r} carries {self.reference_phonemes} reference phonemes — "
                f"a recording with no reference cannot have produced a PER")


@lru_cache(maxsize=1)
def _parameters() -> Mapping:
    path = _PKG_DIR / _PARAMS_RELATIVE
    if not path.exists():
        raise CalibrationError(f"calibration parameters missing at {path} — every value here must arrive "
                               f"with its provenance (CLAUSE 4), so there are no in-code defaults to fall "
                               f"back to")
    document = json.loads(path.read_text(encoding="utf-8"))
    for key in ("coverage_p", "confidence_gamma", "minimum_recordings", "small_sample_warning_below",
                "zero_adjustment", "procedure"):
        if key not in document:
            raise CalibrationError(f"{_PARAMS_RELATIVE} lacks {key!r} — an absent parameter must fail "
                                   f"loudly, never default silently")
    return document


def tolerance_factor_exact(n: int, p: float, gamma: float) -> float:
    """The EXACT one-sided upper tolerance factor via the noncentral t distribution (report F2).

    k = t^{-1}_{n-1, delta}(gamma) / sqrt(n)  with noncentrality  delta = z_p * sqrt(n).
    Verified this session against NIST's worked example (their Natrella k1 = 1.8752 at N=43, p=0.90,
    gamma=0.99; the exact value there is 1.8740) and tabulated in the report for n=5..20.
    """
    if n < 2:
        raise CalibrationRefused(f"n={n}: a tolerance factor needs at least 2 observations to estimate s")
    try:
        from scipy import stats
    except ImportError as error:  # pragma: no cover — environment-dependent
        raise CalibrationError(
            "scipy is required for the exact noncentral-t tolerance factor and is not importable. "
            "REFUSING rather than silently substituting the Natrella approximation — a silent downgrade "
            "is the violation (Supreme Law LINK 10); install scipy or raise the gap to Berk.") from error
    delta = stats.norm.ppf(p) * math.sqrt(n)
    return float(stats.nct.ppf(gamma, n - 1, delta) / math.sqrt(n))


def tolerance_factor_natrella(n: int, p: float, gamma: float) -> float:
    """Natrella (1963) approximation — the SELF-TEST's cross-check, never the shipped factor.

    Kept because it is the form NIST's own worked example prints (1.8752), so the control suite can prove
    our implementation against a published number without trusting any library (report F6c: tolerance
    software has been measured misbehaving under misspecification).
    """
    from scipy import stats

    z_p, z_g = float(stats.norm.ppf(p)), float(stats.norm.ppf(gamma))
    a = 1.0 - z_g * z_g / (2.0 * (n - 1))
    b = z_p * z_p - z_g * z_g / n
    return (z_p + math.sqrt(z_p * z_p - a * b)) / a


def nonparametric_confidence(n: int, p: float) -> float:
    """Confidence that the sample MAXIMUM covers proportion p: 1 - p^n (Wilks; report F3).

    Reported beside every parametric bar so the normality assumption always travels with the
    assumption-free number — measured honestly weak at our n (46.9 % at n=6, p=0.90).
    """
    return 1.0 - p ** n


def _logit(value: float) -> float:
    return math.log(value / (1.0 - value))


def _inverse_logit(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def calibrate_bar(recordings: Sequence[LabelledRecording], *, language: str,
                  corpus_genre: str) -> dict:
    """Turn n labelled recordings into the per-language PER bar artefact — or REFUSE with the exact reason.

    Every number in the returned artefact is inspectable: the per-recording inputs, the transform and its
    zero adjustment, k with its (p, gamma), the parametric bar, and the nonparametric companion with its
    TRUE confidence. `corpus_genre` is mandatory because a bar may never be silently widened beyond the
    material that calibrated it (data/bar_calibration.json scope_rule — today's only candidate corpus is
    ~19 minutes of şarkı-form makam singing).
    """
    parameters = _parameters()
    minimum = int(parameters["minimum_recordings"]["value"])
    if not language or not language.strip():
        raise CalibrationRefused("no language named — A9's whole point is that the bar is PER-LANGUAGE")
    if not corpus_genre or not corpus_genre.strip():
        raise CalibrationRefused(
            "no corpus genre named — the scope rule forbids a bar that does not carry the genre of the "
            "material that calibrated it (a makam bar is not a pop bar)")
    if len(recordings) < minimum:
        raise CalibrationRefused(
            f"{len(recordings)} recording(s) for {language!r}: A9 requires >= {minimum} real human sung "
            f"recordings (its own wording), and a bar from fewer would be the guessed-threshold class — "
            f"the 0.08 motion floor that rejected all seven correct shots is this project's paid lesson")
    identifiers = [r.recording_id for r in recordings]
    if len(set(identifiers)) != len(identifiers):
        raise CalibrationRefused(f"duplicate recording ids in the sample ({identifiers}) — one recording "
                                 f"counted twice would fake the n the floor demands")

    values = [r.per for r in recordings]
    nonzero = sorted(v for v in values if v > 0.0)
    if not nonzero:
        raise CalibrationRefused(
            f"all {len(values)} recordings measure PER 0.0 — a zero-variance all-perfect sample cannot "
            f"support a variance estimate, and Warton & Hui's zero adjustment needs a smallest NON-ZERO "
            f"value to exist. More (or harder) material is the fix, never a synthetic epsilon")
    # Warton & Hui's documented practice (their own paper added the smallest non-zero response, 0.48 %,
    # to zeros before the logit) — the adjustment is RECORDED in the artefact, never applied silently.
    adjustment = nonzero[0]
    adjusted = [v if v > 0.0 else v + adjustment for v in values]
    if any(v >= 1.0 for v in adjusted):
        raise CalibrationRefused(
            f"a recording measures PER >= 1.0 after adjustment ({max(adjusted):.4f}) — logit(1) is "
            f"undefined and a fully-unintelligible 'human reference' recording is not a reference; "
            f"inspect the recording before calibrating on it")

    transformed = [_logit(v) for v in adjusted]
    n = len(transformed)
    mean = sum(transformed) / n
    variance = sum((t - mean) ** 2 for t in transformed) / (n - 1)
    if variance == 0.0:
        raise CalibrationRefused(
            f"zero variance across {n} recordings (all PER exactly {values[0]}) — a tolerance limit "
            f"collapses to the mean and the bar would reject any deviation at all; identical repeated "
            f"measurements suggest a pipeline fault, not a population")
    deviation = math.sqrt(variance)

    p = float(parameters["coverage_p"]["value"])
    gamma = float(parameters["confidence_gamma"]["value"])
    k = tolerance_factor_exact(n, p, gamma)
    bar = _inverse_logit(mean + k * deviation)

    warn_below = int(parameters["small_sample_warning_below"]["value"])
    artefact = {
        "research_item": "A9",
        "language": language,
        "bar": round(bar, 6),
        "verdict_rule": f"a generated take PASSES the intelligibility gate when its PER <= {round(bar, 6)}",
        "recordings": [{"id": r.recording_id, "per": r.per, "reference_phonemes": r.reference_phonemes}
                       for r in recordings],
        "n": n,
        "method": {
            "procedure": parameters["procedure"]["id"],
            "transform": "logit",
            "zero_adjustment_applied": adjustment if any(v == 0.0 for v in values) else None,
            "logit_mean": round(mean, 6),
            "logit_sd": round(deviation, 6),
            "k_exact_noncentral_t": round(k, 4),
            "coverage_p": p,
            "confidence_gamma": gamma,
        },
        "nonparametric_companion": {
            "sample_max_per": max(values),
            "coverage_p": p,
            "true_confidence": round(nonparametric_confidence(n, p), 4),
            "note": "the assumption-free bound: with THIS confidence (not gamma), at least p of the "
                    "population lies below the sample maximum — reported so the normality assumption "
                    "never travels alone",
        },
        "scope": {"corpus_genre": corpus_genre,
                  "rule": "this bar judges material of this genre; widening it is a new calibration"},
        "provenance": str(parameters["provenance_report"]),
        "warnings": ([f"SMALL_SAMPLE: n={n} < {warn_below}; k={k:.4f} sits "
                      f"{k / tolerance_factor_exact(20, p, gamma):.2f}x further from the mean than at n=20"]
                     if n < warn_below else []),
    }
    return artefact


def registry_bar_entry(artefact: Mapping) -> dict:
    """Project a calibration artefact into the language registry's `bar` field shape (A14's contract).

    The caller writes it into data/language_registry.json explicitly — a calibration that silently mutated
    the registry would be a side effect no control could anchor."""
    return {
        "value": artefact["bar"],
        "method": artefact["method"]["procedure"],
        "n_recordings": artefact["n"],
        "corpus_genre": artefact["scope"]["corpus_genre"],
        "provenance": artefact["provenance"],
        "warnings": list(artefact["warnings"]),
    }
