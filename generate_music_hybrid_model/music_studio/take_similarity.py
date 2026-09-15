"""Between-take carbon-copy gate (D-SSM-31, axis 2) — Serrà Qmax cross-recurrence + Haitsma-Kalker BER.

NOTE FOR OTHER AGENTS, read before touching this module:
  · WHY THIS EXISTS: Berk's verdict on every music output shown to date (D-SSM-31, 2026-08-17,
    verbatim: "hep aynı ristm carbon copy bu çöp") — take-to-take sameness must be a MEASURED gate
    that fails BEFORE anything reaches him again. This module is that instrument's axis 2.
  · EVERY PARAMETER lives in `data/take_similarity.json` with its evidence (a primary source read
    2026-08-17, captures archived under docs/research/_sources/). NOTHING here is a judgement call;
    the module REFUSES to construct if a parameter is missing (CLAUSE 4). Do not inline a constant.
  · THE PASS/FAIL BAR DOES NOT EXIST YET, on purpose: Serrà's system is a ranker and publishes no
    threshold. Until `bar_calibration.py` produces the negatives-first bar artefact, verdicts are
    `NOT_CALIBRATED` with raw scores (CLAUSE 7). Loosening this into a guessed constant is the exact
    0.08-motion-floor mistake this project already paid for.
  · CONTROLS: scripts/test_take_similarity_gate.py proves the instrument can both PASS (a take vs a
    different take) and FAIL (a take vs itself / its near-copy) before any verdict counts.
  · Axis 1 (within-take monotony: SI on fitness scape plots + cyclic tempogram) is a SEPARATE module,
    not this one; its absence today is recorded in STATE.md.

Method provenance, from the primaries read 2026-08-17 (equation numbers are the papers' own):
  · Serrà, Serrà & Andrzejak, "Cross recurrence quantification for cover song identification",
    New J. Phys. 11:093017 (2009) [FULL]: CRP eq. (2) with per-state kappa nearest-neighbour
    thresholds; cumulative Qmax recurrence eq. (5) with gap penalties gamma(z) eq. (6); delay
    embedding m=10, tau=1; 12-bin chroma at 464 ms / 50% overlap; OTI key alignment.
  · Haitsma & Kalker, "A highly robust audio fingerprinting system", ISMIR 2002 [FULL]: 33 log
    bands 300-2000 Hz, sign of the band-energy double difference, 32-bit sub-fingerprints every
    11.6 ms, block BER with the 0.35 near-copy operating point (P_f = 3.6e-20).
  · Friedman & Dieng, "The Vendi Score", TMLR 2023: VS = exp(Shannon entropy of eigenvalues of
    K/n) over a PSD similarity kernel with k(x,x)=1 — the batch's effective number of distinct takes.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping, Sequence

try:
    import numpy as np
except ImportError as _numpy_error:  # pragma: no cover — environment-dependent
    raise ImportError(
        "music_studio.take_similarity requires numpy, which is not importable here. REFUSING at the "
        "boundary rather than failing mid-measurement (bar_calibration's scipy pattern): this gate "
        "runs on measurement machines, never inside the bare Lambda runtime — if a Lambda code path "
        "imported this module, that path is the defect to fix, not this guard.") from _numpy_error

_PKG_DIR: Final[Path] = Path(__file__).resolve().parent
_PARAMS_RELATIVE: Final[str] = "data/take_similarity.json"


class TakeSimilarityError(Exception):
    """A fault in the gate layer itself (missing parameters, malformed audio input)."""


class TakeSimilarityRefused(TakeSimilarityError):
    """The input cannot lawfully yield a score — the reason names exactly what is missing."""


@lru_cache(maxsize=1)
def _parameters() -> Mapping:
    path = _PKG_DIR / _PARAMS_RELATIVE
    if not path.exists():
        raise TakeSimilarityError(
            f"gate parameters missing at {path} — every value must arrive with its provenance "
            f"(CLAUSE 4); there are no in-code defaults to fall back to")
    document = json.loads(path.read_text(encoding="utf-8"))
    for key in ("chroma", "delay_embedding", "cross_recurrence", "qmax", "fingerprint", "calibration"):
        if key not in document:
            raise TakeSimilarityError(f"{_PARAMS_RELATIVE} lacks {key!r} — an absent parameter block "
                                      f"must fail loudly, never default silently")
    return document


def _value(block: str, key: str) -> float:
    entry = _parameters()[block][key]
    if not isinstance(entry, Mapping) or "value" not in entry or "_evidence" not in entry:
        raise TakeSimilarityError(
            f"{_PARAMS_RELATIVE}:{block}.{key} must carry both 'value' and '_evidence' — a value "
            f"without its evidence is the construction CLAUSE 4 forbids")
    return entry["value"]


@dataclass(frozen=True)
class TakePair:
    """One pair's measurement — N pairs mean N rows (CLAUSE 24), never a blended average."""

    take_a: str
    take_b: str
    qmax_normalised: float
    fingerprint_ber: float | None
    near_exact_copy: bool


def chroma_time_series(samples: np.ndarray, sample_rate: int) -> np.ndarray:
    """12-bin chroma at the primary's 464 ms / 50% frame geometry (librosa chroma_cqt, ISC).

    librosa is imported lazily so the Lambda package (which ships this module for its data files)
    never pays the import unless the gate actually runs — mirroring bar_calibration's scipy pattern.
    """
    import librosa  # noqa: PLC0415 — lazy by design, see docstring

    if samples.ndim != 1 or samples.size == 0:
        raise TakeSimilarityRefused("audio must be a non-empty mono array — the gate does not guess "
                                    "a downmix; the caller owns channel handling")
    frame_seconds = _value("chroma", "frame_seconds")
    overlap = _value("chroma", "overlap_fraction")
    hop = max(1, int(sample_rate * frame_seconds * (1.0 - overlap)))
    chroma = librosa.feature.chroma_cqt(y=samples, sr=sample_rate, hop_length=hop,
                                        n_chroma=int(_value("chroma", "bins")))
    return chroma.T  # frames x 12


def optimal_transposition(chroma_a: np.ndarray, chroma_b: np.ndarray) -> np.ndarray:
    """OTI (the primary's key alignment): rotate B by the shift maximising global-profile dot product."""
    profile_a = chroma_a.mean(axis=0)
    profile_b = chroma_b.mean(axis=0)
    shifts = [profile_a @ np.roll(profile_b, s) for s in range(chroma_b.shape[1])]
    return np.roll(chroma_b, int(np.argmax(shifts)), axis=1)


def _delay_embed(frames: np.ndarray) -> np.ndarray:
    m = int(_value("delay_embedding", "m"))
    tau = int(_value("delay_embedding", "tau"))
    if frames.shape[0] < (m - 1) * tau + 1:
        raise TakeSimilarityRefused(
            f"take too short for delay embedding: {frames.shape[0]} frames < (m-1)*tau+1 = "
            f"{(m - 1) * tau + 1} — a score from a truncated embedding would be a different instrument")
    windows = [frames[i * tau: frames.shape[0] - (m - 1 - i) * tau] for i in range(m)]
    return np.concatenate(windows, axis=1)


def cross_recurrence_plot(states_x: np.ndarray, states_y: np.ndarray) -> np.ndarray:
    """CRP per the primary's eq. (2): R[i,j]=1 iff each state is within the OTHER's kappa-quantile radius."""
    kappa = _value("cross_recurrence", "kappa")
    distances = np.linalg.norm(states_x[:, None, :] - states_y[None, :, :], axis=2)
    eps_x = np.quantile(distances, kappa, axis=1, keepdims=True)   # per row of X
    eps_y = np.quantile(distances, kappa, axis=0, keepdims=True)   # per column (state of Y)
    return ((distances <= eps_x) & (distances <= eps_y)).astype(np.uint8)


def qmax(recurrence: np.ndarray) -> float:
    """The primary's eq. (5)/(6): cumulative curved-trace recurrence with gap penalties.

    Q[i,j] = max(Q[i-1,j-1], Q[i-2,j-1], Q[i-1,j-2]) + 1                       if R[i,j] == 1
    Q[i,j] = max(0, Q[i-1,j-1]-g(R[i-1,j-1]), Q[i-2,j-1]-g(R[i-2,j-1]),
                    Q[i-1,j-2]-g(R[i-1,j-2]))                                  if R[i,j] == 0
    with g(1)=gamma_onset and g(0)=gamma_extension.
    """
    gamma_onset = _value("qmax", "gamma_onset")
    gamma_extension = _value("qmax", "gamma_extension")
    n_x, n_y = recurrence.shape
    if n_x < 3 or n_y < 3:
        raise TakeSimilarityRefused(f"CRP {n_x}x{n_y} too small for the eq. (5) recursion (needs >= 3x3)")
    q = np.zeros((n_x, n_y), dtype=np.float64)

    def penalty(z: int) -> float:
        return gamma_onset if z == 1 else gamma_extension

    for i in range(2, n_x):
        for j in range(2, n_y):
            if recurrence[i, j]:
                q[i, j] = max(q[i - 1, j - 1], q[i - 2, j - 1], q[i - 1, j - 2]) + 1.0
            else:
                q[i, j] = max(
                    0.0,
                    q[i - 1, j - 1] - penalty(int(recurrence[i - 1, j - 1])),
                    q[i - 2, j - 1] - penalty(int(recurrence[i - 2, j - 1])),
                    q[i - 1, j - 2] - penalty(int(recurrence[i - 1, j - 2])),
                )
    return float(q.max())


def band_fingerprint(samples: np.ndarray, sample_rate: int) -> np.ndarray:
    """Haitsma-Kalker sign-of-double-difference fingerprint (the primary's exact construction)."""
    bands = int(_value("fingerprint", "bands"))
    low = _value("fingerprint", "band_low_hz")
    high = _value("fingerprint", "band_high_hz")
    frame_seconds = _value("fingerprint", "frame_seconds")
    overlap = _value("fingerprint", "frame_overlap_fraction")
    frame = int(sample_rate * frame_seconds)
    hop = max(1, int(frame * (1.0 - overlap)))
    if samples.size < frame:
        raise TakeSimilarityRefused(f"audio shorter than one fingerprint frame ({frame} samples)")
    edges = np.logspace(math.log10(low), math.log10(high), bands + 1)
    freqs = np.fft.rfftfreq(frame, d=1.0 / sample_rate)
    window = np.hanning(frame)
    energies = []
    for start in range(0, samples.size - frame + 1, hop):
        spectrum = np.abs(np.fft.rfft(samples[start:start + frame] * window)) ** 2
        energies.append([spectrum[(freqs >= edges[b]) & (freqs < edges[b + 1])].sum()
                         for b in range(bands)])
    energy = np.asarray(energies)
    if energy.shape[0] < 2:
        raise TakeSimilarityRefused("audio yields fewer than 2 fingerprint frames — no bits derivable")
    double_diff = (energy[1:, :-1] - energy[1:, 1:]) - (energy[:-1, :-1] - energy[:-1, 1:])
    return (double_diff > 0).astype(np.uint8)  # (frames-1) x 32 bits


def fingerprint_ber(bits_a: np.ndarray, bits_b: np.ndarray) -> float:
    """Block bit-error rate over the aligned common prefix (the primary compares aligned blocks)."""
    block = int(_value("fingerprint", "block_subfingerprints"))
    common = min(bits_a.shape[0], bits_b.shape[0])
    if common < block:
        raise TakeSimilarityRefused(
            f"takes share only {common} sub-fingerprints < one block ({block}) — BER undefined")
    return float(np.mean(bits_a[:common] != bits_b[:common]))


def vendi_score(similarity: np.ndarray) -> float:
    """Friedman & Dieng: VS = exp(entropy of eigenvalues of K/n) — effective number of distinct takes."""
    if similarity.ndim != 2 or similarity.shape[0] != similarity.shape[1]:
        raise TakeSimilarityRefused("Vendi needs a square pairwise similarity matrix")
    kernel = (similarity + similarity.T) / 2.0 / similarity.shape[0]
    eigenvalues = np.linalg.eigvalsh(kernel)
    eigenvalues = eigenvalues[eigenvalues > 0]
    entropy = -float(np.sum(eigenvalues * np.log(eigenvalues)))
    return float(np.exp(entropy))


def near_copy_ber_threshold() -> float:
    """Public accessor for the published near-exact BER operating point (single source of truth).

    Exists so sibling instruments (rhythm_monotony's tile rule) can consume the SAME sourced
    constant by import instead of retyping it — two lists that must agree, agreeing by import.
    """
    return float(_value("fingerprint", "ber_near_copy_threshold"))


def compare_takes(samples_a: np.ndarray, samples_b: np.ndarray, sample_rate: int,
                  *, take_a: str, take_b: str) -> TakePair:
    """Full two-stage comparison of one pair; the verdict field stays with the CALLER's bar artefact.

    Stage 1: near-exact screen (BER against the primary's published operating point).
    Stage 2: musical sameness (normalised Qmax over the OTI-aligned chroma CRP).
    """
    ber: float | None
    try:
        ber = fingerprint_ber(band_fingerprint(samples_a, sample_rate),
                              band_fingerprint(samples_b, sample_rate))
    except TakeSimilarityRefused:
        ber = None  # too short for a block — stage 2 still runs; the None is REPORTED, not hidden
    near_exact = ber is not None and ber < _value("fingerprint", "ber_near_copy_threshold")

    chroma_a = chroma_time_series(samples_a, sample_rate)
    chroma_b = optimal_transposition(chroma_a, chroma_time_series(samples_b, sample_rate))
    score = qmax(cross_recurrence_plot(_delay_embed(chroma_a), _delay_embed(chroma_b)))
    shorter = min(chroma_a.shape[0], chroma_b.shape[0])
    return TakePair(take_a=take_a, take_b=take_b,
                    qmax_normalised=score / float(shorter),
                    fingerprint_ber=ber, near_exact_copy=near_exact)


#: The calibrated-bar artefact both gates consume; produced ONLY by scripts/calibrate_dssm31_gates.py.
_BARS_RELATIVE: Final[str] = "data/dssm31_gate_bars.json"


def _load_bars(bars_path: Path | None) -> Mapping | None:
    """The calibrated-bar artefact, or None while absent — injectable for the control suite."""
    path = bars_path if bars_path is not None else _PKG_DIR / _BARS_RELATIVE
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def batch_report(pairs: Sequence[TakePair], take_ids: Sequence[str],
                 *, bars_path: Path | None = None) -> dict:
    """Per-pair rows + the batch Vendi scalar; verdicts appear ONLY with a CALIBRATED bar artefact."""
    if not pairs:
        raise TakeSimilarityRefused("no pairs measured — an empty batch has no diversity to report")
    ids = list(take_ids)
    index = {t: k for k, t in enumerate(ids)}
    kernel = np.eye(len(ids))
    for pair in pairs:
        similarity = min(1.0, pair.qmax_normalised)
        kernel[index[pair.take_a], index[pair.take_b]] = similarity
        kernel[index[pair.take_b], index[pair.take_a]] = similarity
    calibration_status = _parameters()["calibration"]["status_until_calibrated"]["value"]
    bars = _load_bars(bars_path)
    if bars is None or bars.get("status") != "CALIBRATED":
        return {
            "pairs": [pair.__dict__ for pair in pairs],
            "effective_distinct_takes_vendi": vendi_score(kernel),
            "take_count": len(ids),
            "verdict": calibration_status,
            "verdict_reason": (
                f"no CALIBRATED bar artefact ({'absent' if bars is None else bars.get('status')}); "
                f"the musical-sameness bar has no published value (Serrà ranks, never thresholds); "
                f"it is set negatives-first via bar_calibration.py, and until that artefact exists "
                f"the gate refuses to pass or fail anything (CLAUSE 7)"),
        }
    qmax_bar = float(bars["axis2_similarity"]["qmax_norm_bar"]["bar"])
    pair_rows = []
    flagged_count = 0
    for pair in pairs:
        flagged = pair.qmax_normalised > qmax_bar or pair.near_exact_copy
        flagged_count += int(flagged)
        pair_rows.append(pair.__dict__ | {
            "verdict": "CARBON_COPY_FLAGGED" if flagged else "PASS"})
    return {
        "pairs": pair_rows,
        "effective_distinct_takes_vendi": vendi_score(kernel),
        "take_count": len(ids),
        "verdict": "CARBON_COPY_FLAGGED" if flagged_count else "PASS",
        "flagged_pairs": f"{flagged_count}/{len(pairs)}",
        "verdict_basis": {"qmax_norm_bar": qmax_bar,
                          "corpus_genre": bars.get("corpus_genre"),
                          "scope_rule": bars.get("scope_rule")},
    }
