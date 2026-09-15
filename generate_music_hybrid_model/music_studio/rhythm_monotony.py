"""Within-take rhythmic-monotony gate (D-SSM-31, axis 1) — Structureness Indicator + tempogram stability.

NOTE FOR OTHER AGENTS, read before touching this module:
  · WHY THIS EXISTS: Berk's verdict on every music output shown to date (D-SSM-31, 2026-08-17,
    verbatim: "hep aynı ristm carbon copy bu çöp") — WITHIN-take rhythmic monotony must be a
    MEASURED gate that fails BEFORE anything reaches him again. This module is that instrument's
    axis 1; axis 2 (between-take carbon-copy) lives in `take_similarity.py`.
  · EVERY PARAMETER lives in `data/rhythm_monotony.json` with its evidence (primaries read
    2026-08-17, captures archived under docs/research/_sources/). Nothing here is a judgement call;
    the module REFUSES to construct if a parameter is missing (CLAUSE 4). Do not inline a constant.
  · NO BEAT TRACKING ANYWHERE, on purpose: the research's F8 finding (beat trackers degrade to
    F1 0.473-0.595 on soft-onset expressive material) makes beat-dependent statistics pop-only.
    This gate uses fixed-window chroma frames and the continuous Fourier tempogram so it stays
    valid on the ballad/cinematic material the engine actually generates.
  · THE PASS/FAIL BARS DO NOT EXIST YET, on purpose: the published SI separation (naive-repeat
    83.6 vs real 43.8 vs weak 32.5, Wu & Yang ICASSP 2023) proves the DIRECTION on symbolic-origin
    audio; the absolute values do not transfer to Lyria material. Bars are calibrated locally via
    `bar_calibration.py` on labelled takes; until then verdicts are `NOT_CALIBRATED` (CLAUSE 7).
  · CONTROLS: scripts/test_rhythm_monotony_gate.py proves the instrument can both PASS (varied
    construction) and FAIL (looped construction) before any verdict counts.

Method provenance, from the primaries read 2026-08-17:
  · Mueller & Jiang, ISMIR 2012 (fitness scape plot) via libfmp (MIT, verified from installed
    metadata this session) — the method authors' own reference implementation; SI per Wu & Yang,
    ICASSP 2023 (arXiv:2209.08212 [FULL]): SI_band = max fitness over segments in a duration band.
  · Grosche, Mueller & Kurth, ICASSP 2010 [FULL]: Fourier tempogram of the spectral-flux novelty
    curve (30-480 BPM, 6 s window), folded to the cyclic tempogram; our monotony statistic is the
    mean column-to-column correlation plus temporal entropy of the cyclic columns.
  · Wu & Yang section 5 [FULL]: the deterministic over-repetition tile rule (>6 consecutive
    identical bars / >4 consecutive identical bar pairs; 5.5% bad vs 0.5% real).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping

try:
    import numpy as np
except ImportError as _numpy_error:  # pragma: no cover — environment-dependent
    raise ImportError(
        "music_studio.rhythm_monotony requires numpy, which is not importable here. REFUSING at the "
        "boundary rather than failing mid-measurement: this gate runs on measurement machines, never "
        "inside the bare Lambda runtime — if a Lambda code path imported this module, that path is "
        "the defect to fix, not this guard.") from _numpy_error

_PKG_DIR: Final[Path] = Path(__file__).resolve().parent
_PARAMS_RELATIVE: Final[str] = "data/rhythm_monotony.json"


class RhythmMonotonyError(Exception):
    """A fault in the gate layer itself (missing parameters, missing measurement dependency)."""


class RhythmMonotonyRefused(RhythmMonotonyError):
    """The input cannot lawfully yield a statistic — the reason names exactly what is missing."""


@lru_cache(maxsize=1)
def _parameters() -> Mapping:
    path = _PKG_DIR / _PARAMS_RELATIVE
    if not path.exists():
        raise RhythmMonotonyError(
            f"gate parameters missing at {path} — every value must arrive with its provenance "
            f"(CLAUSE 4); there are no in-code defaults to fall back to")
    document = json.loads(path.read_text(encoding="utf-8"))
    for key in ("chroma", "scape_plot", "tempogram", "tile_rule", "calibration"):
        if key not in document:
            raise RhythmMonotonyError(f"{_PARAMS_RELATIVE} lacks {key!r} — an absent parameter block "
                                      f"must fail loudly, never default silently")
    return document


def _value(block: str, key: str):
    entry = _parameters()[block][key]
    if not isinstance(entry, Mapping) or "value" not in entry or "_evidence" not in entry:
        raise RhythmMonotonyError(
            f"{_PARAMS_RELATIVE}:{block}.{key} must carry both 'value' and '_evidence' — a value "
            f"without its evidence is the construction CLAUSE 4 forbids")
    return entry["value"]


@dataclass(frozen=True)
class MonotonyMeasurement:
    """One take's axis-1 statistics — raw numbers; the verdict belongs to the calibrated bar."""

    take_id: str
    si_short: float
    si_mid: float
    si_long: float | None
    tempogram_column_correlation: float
    tempogram_temporal_entropy: float
    max_consecutive_identical_windows: int
    tile_rule_flag: bool


def _chroma(samples: np.ndarray, sample_rate: int) -> tuple[np.ndarray, float]:
    """Fixed-window chroma (frames x 12) plus the frame period in seconds — NO beat decisions."""
    import librosa  # noqa: PLC0415 — lazy: measurement machines only

    if samples.ndim != 1 or samples.size == 0:
        raise RhythmMonotonyRefused("audio must be a non-empty mono array — the gate does not guess "
                                    "a downmix; the caller owns channel handling")
    frame_seconds = float(_value("chroma", "frame_seconds"))
    hop = max(1, int(sample_rate * frame_seconds * (1.0 - float(_value("chroma", "overlap_fraction")))))
    chroma = librosa.feature.chroma_cqt(y=samples, sr=sample_rate, hop_length=hop,
                                        n_chroma=int(_value("chroma", "bins")))
    return chroma, hop / sample_rate


def structureness_indicators(chroma: np.ndarray, frame_period_seconds: float,
                             take_seconds: float) -> tuple[float, float, float | None]:
    """SI per band = max fitness over scape-plot segments whose duration falls in the band.

    Uses libfmp (MIT, the method authors' reference implementation) end to end: path-enhanced SSM
    (forward+backward smoothing over the published relative-tempo set), thresholded score matrix
    with the reference penalty, and the O(N^2)-segment fitness scape plot.
    """
    import libfmp.c4 as fmp  # noqa: PLC0415 — lazy: measurement machines only

    smooth = int(_value("scape_plot", "smoothing_filter_length"))
    tempo_set = list(_value("scape_plot", "tempo_relative_set"))
    penalty = float(_value("scape_plot", "penalty"))
    threshold = float(_value("scape_plot", "threshold"))
    strategy = str(_value("scape_plot", "threshold_strategy"))
    # libfmp's documented pipeline (API signatures + defaults MEASURED from the installed package
    # this session): normalise features -> smoothed transposition-invariant SM -> relative
    # threshold with the reference defaults -> fitness scape plot.
    import libfmp.c3 as fmp_c3  # noqa: PLC0415

    features = fmp_c3.normalize_feature_sequence(chroma, norm="2", threshold=1e-3)
    # Feature smoothing + downsampling BEFORE the SM — part of the measured reference pipeline
    # (L=21, H=5 from the installed signature). Omitting it was a measured defect: a 270 s take
    # produced a ~1150-frame scape input and >14 min of compute; the reference chain includes
    # this stage by construction, and the frame period below carries the downsampling factor.
    smooth_len = int(_value("scape_plot", "feature_smoothing_length"))
    down = int(_value("scape_plot", "feature_downsampling"))
    features, _ = fmp_c3.smooth_downsample_feature_sequence(
        features, 1.0 / frame_period_seconds, filt_len=smooth_len, down_sampling=down)
    features = fmp_c3.normalize_feature_sequence(features, norm="2", threshold=1e-3)
    effective_period = frame_period_seconds * down
    sm, _ = fmp.compute_sm_ti(features, features, L=smooth, tempo_rel_set=np.array(tempo_set),
                              shift_set=np.array([0]), direction=2)
    sm_thresh = fmp.threshold_matrix(sm, thresh=threshold, strategy=strategy, scale=True,
                                     penalty=penalty, binarize=False)
    # The library's OWN documented precondition for the scape-plot DP: "S must satisfy
    # S(n,m) <= 1 and S(n,n) = 1" (compute_accumulated_score_matrix docstring, read from the
    # installed source 2026-08-17). Relative thresholding can zero diagonal cells (measured:
    # diagonal min 0.0000 on a real take), which broke the fitness bound and produced
    # si_short = 1.4817 > 1 on the D-SSM-31 re-measurement — caught by the calibrator's
    # out-of-range refusal. normalization_properties_ssm is the library's own repair for
    # exactly this precondition.
    sm_thresh = fmp.normalization_properties_ssm(sm_thresh)
    scape = fmp.compute_fitness_scape_plot(sm_thresh)[0]

    bands = _value("scape_plot", "timescale_bands_seconds")
    n = scape.shape[0]

    def band_max(low_s: float, high_s: float | None) -> float | None:
        low_frames = max(1, int(round(low_s / effective_period)))
        high_frames = n if high_s is None else min(n, int(round(high_s / effective_period)))
        if low_frames >= high_frames:
            return None
        return float(np.nanmax(scape[low_frames:high_frames, :]))

    si_short = band_max(*bands["short"])
    si_mid = band_max(*bands["mid"])
    si_long = band_max(bands["long"][0], bands["long"][1])
    if si_short is None or si_mid is None:
        raise RhythmMonotonyRefused(
            f"take too short for the SI bands (duration {take_seconds:.1f}s vs short band "
            f"{bands['short']}) — a truncated band would be a different instrument")
    return si_short, si_mid, si_long


def tempogram_stability(samples: np.ndarray, sample_rate: int) -> tuple[float, float]:
    """Cyclic-tempogram monotony statistics: mean adjacent-column correlation + temporal entropy.

    Continuous Fourier tempogram (no beat/peak decisions — the F8 genre constraint), folded to the
    cyclic form per Grosche/Mueller/Kurth 2010. A take whose cyclic columns are near-identical for
    its whole duration is rhythmically static — exactly the "hep aynı ritim" defect as a number.
    """
    import librosa  # noqa: PLC0415

    window_seconds = float(_value("tempogram", "novelty_window_seconds"))
    hop = 512  # librosa onset_strength's documented default hop; the tempogram window is the
    # research-sourced value, this hop only sets novelty resolution and is the library's own default.
    onset_env = librosa.onset.onset_strength(y=samples, sr=sample_rate, hop_length=hop)
    win_length = max(4, int(round(window_seconds * sample_rate / hop)))
    tempogram = np.abs(librosa.feature.tempogram(onset_envelope=onset_env, sr=sample_rate,
                                                 hop_length=hop, win_length=win_length))
    bpms = librosa.tempo_frequencies(tempogram.shape[0], sr=sample_rate, hop_length=hop)
    lo, hi = float(_value("tempogram", "bpm_min")), float(_value("tempogram", "bpm_max"))
    keep = (bpms >= lo) & (bpms <= hi)
    if keep.sum() < 2 or tempogram.shape[1] < 2:
        raise RhythmMonotonyRefused("take too short or band too narrow for a tempogram statistic")
    cyclic = tempogram[keep]
    columns = cyclic / (np.linalg.norm(cyclic, axis=0, keepdims=True) + np.finfo(float).eps)
    correlations = np.sum(columns[:, :-1] * columns[:, 1:], axis=0)
    mean_correlation = float(np.mean(correlations))
    mean_profile = np.mean(columns, axis=1)
    probabilities = mean_profile / (mean_profile.sum() + np.finfo(float).eps)
    entropy = float(-np.sum(probabilities * np.log2(probabilities + np.finfo(float).eps)))
    return mean_correlation, entropy


def tile_repetition(samples: np.ndarray, sample_rate: int,
                    window_seconds: float) -> tuple[int, bool]:
    """Wu & Yang's over-repetition rule transferred to audio via the PUBLISHED near-exact criterion.

    Windows stand in for bars because the gate is beat-free by construction (F8). 'Exactly
    repeated' is decided by the Haitsma-Kalker fingerprint BER against its published 0.35
    operating point, consumed BY IMPORT from take_similarity (single source of truth) — the
    first draft's self-referencing similarity quantile degenerated on the all-identical case
    and was caught by this gate's own control suite.
    """
    from . import take_similarity  # noqa: PLC0415 — sibling instrument, lazy like the rest

    frames_per_window = int(round(window_seconds * sample_rate))
    total_windows = samples.size // frames_per_window
    if total_windows < 2:
        raise RhythmMonotonyRefused("take too short for the tile rule (fewer than 2 windows)")
    prints = []
    for k in range(total_windows):
        window = samples[k * frames_per_window:(k + 1) * frames_per_window]
        prints.append(take_similarity.band_fingerprint(window, sample_rate))
    threshold = take_similarity.near_copy_ber_threshold()
    near_exact = []
    for left, right in zip(prints[:-1], prints[1:]):
        common = min(left.shape[0], right.shape[0])
        near_exact.append(bool(np.mean(left[:common] != right[:common]) < threshold))
    longest = run = 0
    for flag in near_exact:
        run = run + 1 if flag else 0
        longest = max(longest, run)
    limit = int(_value("tile_rule", "single_bar_consecutive_limit"))
    return longest + 1, (longest + 1) > limit


def measure_take(samples: np.ndarray, sample_rate: int, *, take_id: str,
                 tile_window_seconds: float) -> MonotonyMeasurement:
    """Full axis-1 measurement of one take; verdicts stay with the calibrated bar artefact.

    `tile_window_seconds` is per-production DATA (the bar duration at the take's tempo — the
    caller derives it from the request's tempo_bpm and time_signature, both typed request fields),
    because a bar length hardcoded here would burn one production's tempo into the engine
    (Clause 23).
    """
    chroma, frame_period = _chroma(samples, sample_rate)
    take_seconds = samples.size / sample_rate
    si_short, si_mid, si_long = structureness_indicators(chroma, frame_period, take_seconds)
    correlation, entropy = tempogram_stability(samples, sample_rate)
    longest_run, tile_flag = tile_repetition(samples, sample_rate, tile_window_seconds)
    return MonotonyMeasurement(take_id=take_id, si_short=si_short, si_mid=si_mid, si_long=si_long,
                               tempogram_column_correlation=correlation,
                               tempogram_temporal_entropy=entropy,
                               max_consecutive_identical_windows=longest_run,
                               tile_rule_flag=tile_flag)


#: The calibrated-bar artefact both gates consume; produced ONLY by scripts/calibrate_dssm31_gates.py.
_BARS_RELATIVE: Final[str] = "data/dssm31_gate_bars.json"


def _load_bars(bars_path: Path | None) -> Mapping | None:
    """The calibrated-bar artefact, or None while it does not exist (NOT_CALIBRATED state).

    `bars_path` is injectable so the control suite can prove BOTH verdict directions with a
    synthetic artefact without touching the package data directory; production callers use the
    default. An artefact whose status is not CALIBRATED is treated as absent WITH its status
    reported — a failed calibration must never quietly gate anything.
    """
    path = bars_path if bars_path is not None else _PKG_DIR / _BARS_RELATIVE
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def take_report(measurement: MonotonyMeasurement, *, bars_path: Path | None = None) -> dict:
    """Raw statistics + the verdict IF a calibrated bar exists; refusal otherwise (CLAUSE 7)."""
    report = {
        "take": measurement.take_id,
        "structureness": {"si_short": measurement.si_short, "si_mid": measurement.si_mid,
                          "si_long": measurement.si_long},
        "tempogram": {"column_correlation": measurement.tempogram_column_correlation,
                      "temporal_entropy": measurement.tempogram_temporal_entropy},
        "tile_rule": {"max_consecutive_identical_windows": measurement.max_consecutive_identical_windows,
                      "flagged": measurement.tile_rule_flag},
    }
    bars = _load_bars(bars_path)
    if bars is None or bars.get("status") != "CALIBRATED":
        report["verdict"] = _parameters()["calibration"]["status_until_calibrated"]["value"]
        report["verdict_reason"] = (
            f"no CALIBRATED bar artefact ({'absent' if bars is None else bars.get('status')}); the "
            f"SI/tempogram bars have no transferable published values — they are calibrated locally "
            f"via bar_calibration.py, and until then the gate refuses to pass or fail (CLAUSE 7)")
        return report
    si_bar = float(bars["axis1_monotony"]["si_short_bar"]["bar"])
    flagged = measurement.si_short > si_bar or measurement.tile_rule_flag
    report["verdict"] = "MONOTONE_FLAGGED" if flagged else "PASS"
    report["verdict_basis"] = {
        "si_short_bar": si_bar,
        "si_above_bar": measurement.si_short > si_bar,
        "tile_rule_flag": measurement.tile_rule_flag,
        "corpus_genre": bars.get("corpus_genre"),
        "scope_rule": bars.get("scope_rule"),
    }
    return report
