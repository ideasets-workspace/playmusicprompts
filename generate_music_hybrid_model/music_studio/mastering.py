"""Stage 5 (CONFORM) + Stage 7 (MASTER) for generate-music-hybrid-model — audio-only, measured.

EVERY MECHANISM HERE IS THE ONE THIS PROJECT ALREADY PROVED, with the evidence read this session:

  * TWO-PASS LINEAR LOUDNORM — `server/film_finish.py` measure_loudnorm()/build_audio_args(),
    corrected by the control run `scripts/control_audio_normalisation.py` (2026-08-10): single-pass
    `loudnorm` reports `Normalization Type: Dynamic` and squeezed LRA 11.5 -> 4.1 LU even with the
    LRA target set to the material's own measured value. `linear=true` is only reachable when
    `measured_I/LRA/TP/thresh` from a prior analysis pass are supplied — linear normalisation is a
    two-pass operation BY CONSTRUCTION (film mandate Clause 15; music spec `mastering` field).
  * VERIFICATION IS A SEPARATE INSTRUMENT — ebur128, not the loudnorm numbers that produced the
    master (grading a master with the numbers that made it would be circular; film_finish.py's own
    words). Two instrument defects carried over because they were measured: ebur128 reads MONO
    3.01 LU low without `dualmono=true`; on a file with NO audio stream ffmpeg exits 0 and prints
    NOTHING, so absence returns {"has_audio": False} and is never a zero.
  * CONFORM IS MUSICALLY AWARE BY DERIVATION, NOT BY A GUESSED CONSTANT — the spec's `duration`
    field promises "Trim to target (musically-aware fade)". The cut lands on the BAR BOUNDARY
    nearest the target inside the tolerance window, and the fade spans exactly ONE BAR — both
    derived from the request's own `tempo_bpm` and `time_signature` (bar = beats-per-bar x 60 /
    tempo). No fade length or cut point is invented; the rule itself is this stage's documented
    contract (values_origin `our_stage` in the spec) and is returned verbatim in the report.
  * PADDING IS REFUSED, NEVER FABRICATED — a delivery SHORTER than target-tolerance cannot be
    trimmed to target, and inventing audio to fill the gap would be the synthetic-work class. The
    stage reports the miss and `on_miss` decides (regenerate is a PAID decision, never taken here).

Where this runs in production: the GPU instance per Clause 20 (Lambda has no ffmpeg). This module
is pure subprocess-over-ffmpeg with no cloud dependency, precisely so the SAME file runs in the
local harness first and on the instance second (Clause 25 order).

Controls: scripts/test_music_studio_conform_master.py — on the REAL stage-3 take, both directions.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


def _run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def probe_duration(path: Path) -> float:
    done = _run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=nw=1:nk=1", path.as_posix()])
    if done.returncode != 0 or not done.stdout.strip():
        raise RuntimeError(f"ffprobe could not read {path}: {done.stderr.strip()[:200]}")
    return float(done.stdout.strip())


def bar_seconds(tempo_bpm: float, time_signature: str) -> float:
    """One bar in seconds, from the request's own tempo and meter (numerator = beats per bar)."""
    beats = int(str(time_signature).split("/")[0])
    if tempo_bpm <= 0 or beats <= 0:
        raise ValueError(f"cannot derive a bar from tempo={tempo_bpm}, meter={time_signature}")
    return beats * 60.0 / float(tempo_bpm)


def plan_conform(delivered_seconds: float, target_seconds: float, tolerance_seconds: float,
                 on_miss: str, tempo_bpm: float, time_signature: str) -> dict:
    """The conform DECISION, separated from execution so it is unit-controllable at $0.

    Returns a dict with `action` in {accept, trim, refuse_pad, regenerate_required} and, for trim,
    the derived cut point and fade length with the derivation shown.
    """
    if abs(delivered_seconds - target_seconds) <= tolerance_seconds:
        return {"action": "accept", "reason": "delivered duration is inside target±tolerance",
                "delivered_seconds": delivered_seconds}
    if delivered_seconds < target_seconds - tolerance_seconds:
        # Too SHORT: trimming cannot create material and padding would fabricate audio.
        if on_miss == "regenerate":
            return {"action": "regenerate_required",
                    "reason": f"delivered {delivered_seconds:.3f} s is below target-tolerance "
                              f"({target_seconds - tolerance_seconds:.3f} s); regeneration is a PAID "
                              f"decision and is not taken by this stage"}
        return {"action": "refuse_pad" if on_miss == "trim" else "accept",
                "reason": f"delivered {delivered_seconds:.3f} s < target-tolerance; padding would "
                          f"fabricate audio (banned class). on_miss={on_miss!r} "
                          f"{'cannot be honoured by trimming a short take' if on_miss == 'trim' else 'accepts the delivered length'}",
                "delivered_seconds": delivered_seconds}
    # Too LONG: trim at the bar boundary nearest the target inside the window; fade one bar.
    bar = bar_seconds(tempo_bpm, time_signature)
    lo, hi = target_seconds - tolerance_seconds, target_seconds + tolerance_seconds
    candidates = [n * bar for n in range(1, int(delivered_seconds / bar) + 1) if lo <= n * bar <= hi]
    cut = min(candidates, key=lambda c: abs(c - target_seconds)) if candidates else target_seconds
    fade = min(bar, cut)  # a fade can never be longer than the material it fades
    return {"action": "trim",
            "cut_seconds": round(cut, 3),
            "fade_seconds": round(fade, 3),
            "derivation": {"bar_seconds": round(bar, 4), "tempo_bpm": tempo_bpm,
                           "time_signature": time_signature,
                           "bar_aligned": bool(candidates),
                           "rule": "cut at the bar boundary nearest target inside ±tolerance "
                                   "(exact target when no boundary falls in the window); fade-out "
                                   "spans one bar, both derived from the request's own tempo/meter"},
            "delivered_seconds": delivered_seconds}


def conform(src: Path, dst: Path, plan: dict) -> dict:
    """Execute a `trim` plan: cut + one-bar fade-out, sample-exact, then MEASURE the result."""
    if plan["action"] != "trim":
        raise ValueError(f"conform() executes only 'trim' plans, got {plan['action']!r}")
    cut, fade = plan["cut_seconds"], plan["fade_seconds"]
    done = _run(["ffmpeg", "-v", "error", "-y", "-i", src.as_posix(),
                 "-af", f"afade=t=out:st={cut - fade}:d={fade}",
                 "-t", f"{cut}", "-c:a", "pcm_s24le", "-ar", "48000", dst.as_posix()])
    if done.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
        return {"ok": False, "error": (done.stderr or "")[-400:]}
    return {"ok": True, "measured_duration_seconds": round(probe_duration(dst), 3),
            "plan": plan}


def measure_loudnorm(path: Path, target_lufs: float, true_peak_db: float) -> dict:
    """PASS 1: analysis-mode loudnorm — the numbers that make pass 2 LINEAR (proven mechanism)."""
    done = _run(["ffmpeg", "-v", "info", "-nostats", "-i", path.as_posix(),
                 "-af", f"loudnorm=I={target_lufs}:TP={true_peak_db}:print_format=json",
                 "-f", "null", "-"])
    text = (done.stdout or "") + (done.stderr or "")
    match = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", text, re.DOTALL)
    if not match:
        return {"measured": False, "raw_tail": text[-400:]}
    try:
        return {"measured": True, "stats": json.loads(match.group(0))}
    except json.JSONDecodeError:
        return {"measured": False, "raw_tail": match.group(0)[:400]}


def master(src: Path, dst: Path, target_lufs: float, true_peak_db: float) -> dict:
    """Stage 7: loudness to the named target WITHOUT riding the gain. Two modes, chosen by the
    measured numbers — never by hope:

      * `two_pass_linear_loudnorm` — when the required gain fits under the true-peak ceiling,
        the proven film mechanism applies unchanged (one constant gain, LRA preserved).
      * `linear_gain_plus_true_peak_limiter` — when it does NOT fit (measured on THIS session's
        real take: input -13.86 LUFS / +0.10 dBTP against a -14 LUFS / -1.0 dBTP target, where
        loudnorm degraded to Dynamic and squeezed LRA 14.40 -> 6.70 LU — the exact banned
        behaviour). The frontier alternative: ONE constant `volume` gain to the integrated
        target, then `alimiter` touching ONLY the peaks above the ceiling (`level=false`, or the
        filter's auto-level would re-normalise the whole signal). alimiter is a sample-peak
        device, so true peak may overshoot the ceiling slightly; the overshoot is MEASURED with
        ebur128 and corrected by exactly the measured amount in one re-limit pass — a
        measurement-driven correction, never a guessed safety margin.

    Both modes report themselves in `mode`, with the numbers that chose them."""
    p1 = measure_loudnorm(src, target_lufs, true_peak_db)
    if not p1.get("measured"):
        return {"ok": False, "error": f"pass-1 measurement failed: {p1.get('raw_tail', '')[:200]}"}
    s = p1["stats"]
    input_i, input_tp = float(s["input_i"]), float(s["input_tp"])
    required_gain_db = target_lufs - input_i

    if input_tp + required_gain_db <= true_peak_db:
        # The proven two-pass linear path fits: one constant gain, no limiter needed.
        lra = max(float(s["input_lra"]), 1.0)
        filt = (f"loudnorm=I={target_lufs}:TP={true_peak_db}:LRA={lra}"
                f":measured_I={s['input_i']}:measured_LRA={s['input_lra']}"
                f":measured_TP={s['input_tp']}:measured_thresh={s['input_thresh']}"
                f":offset={s.get('target_offset', 0.0)}:linear=true:print_format=summary")
        done = _run(["ffmpeg", "-v", "info", "-nostats", "-y", "-i", src.as_posix(),
                     "-af", filt, "-c:a", "pcm_s24le", "-ar", "48000", dst.as_posix()])
        if done.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
            return {"ok": False, "error": (done.stderr or "")[-400:]}
        text = (done.stdout or "") + (done.stderr or "")
        kind = re.search(r"Normalization Type:\s*(\w+)", text)
        return {"ok": True, "mode": "two_pass_linear_loudnorm", "pass1": s,
                "normalization_type": kind.group(1) if kind else "UNREPORTED",
                "target": {"lufs": target_lufs, "true_peak_db": true_peak_db}}

    # The ceiling binds: constant gain + true-peak limiter, with measured overshoot correction.
    limit_db = true_peak_db
    for attempt in (1, 2):
        limit_amp = 10.0 ** (limit_db / 20.0)
        filt = (f"volume={required_gain_db:.4f}dB,"
                f"alimiter=limit={limit_amp:.6f}:level=false")
        done = _run(["ffmpeg", "-v", "error", "-y", "-i", src.as_posix(),
                     "-af", filt, "-c:a", "pcm_s24le", "-ar", "48000", dst.as_posix()])
        if done.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
            return {"ok": False, "error": (done.stderr or "")[-400:]}
        v = verify_loudness(dst)
        if not v.get("measured"):
            return {"ok": False, "error": f"post-limit verification unmeasurable: {v}"}
        overshoot = (v["true_peak_dbtp"] or 0.0) - true_peak_db
        if overshoot <= 0.0 or attempt == 2:
            return {"ok": True, "mode": "linear_gain_plus_true_peak_limiter",
                    "pass1": s, "applied_gain_db": round(required_gain_db, 4),
                    "limiter_limit_db": round(limit_db, 4),
                    "relimit_passes": attempt - 1,
                    "residual_overshoot_db": round(max(overshoot, 0.0), 3),
                    "why_not_loudnorm": f"input_tp {input_tp} + required gain "
                                        f"{required_gain_db:.2f} dB exceeds the {true_peak_db} dBTP "
                                        f"ceiling; loudnorm would degrade to Dynamic (measured: it "
                                        f"squeezed LRA 14.40->6.70 on this material)",
                    "target": {"lufs": target_lufs, "true_peak_db": true_peak_db}}
        # Sample-peak limiter under-caught the TRUE peak: lower the limit by the measured overshoot.
        limit_db -= overshoot
    return {"ok": False, "error": "unreachable"}


def verify_loudness(path: Path) -> dict:
    """The SEPARATE verification instrument: ebur128 on the delivered file (never the maker's own
    numbers). Mono is read with dualmono=true (measured 3.01 LU low otherwise); a file with no
    audio returns has_audio=False, never a zero."""
    ch = _run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
               "stream=channels", "-of", "default=nw=1:nk=1", path.as_posix()])
    channels = next((int(c) for c in ch.stdout.splitlines() if c.strip().isdigit()), 0)
    if channels == 0:
        return {"has_audio": False}
    filt = "ebur128=peak=true:framelog=verbose" + (":dualmono=true" if channels == 1 else "")
    done = _run(["ffmpeg", "-v", "info", "-nostats", "-i", path.as_posix(),
                 "-af", filt, "-f", "null", "-"])
    text = (done.stdout or "") + (done.stderr or "")
    integrated = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", text)
    lra = re.findall(r"LRA:\s*([\d.]+)\s*LU", text)
    peak = re.findall(r"Peak:\s*(-?[\d.]+)\s*dBFS", text)
    if not integrated:
        return {"has_audio": True, "measured": False, "raw_tail": text[-400:]}
    return {"has_audio": True, "measured": True, "channels": channels,
            "integrated_lufs": float(integrated[-1]),
            "lra_lu": float(lra[-1]) if lra else None,
            "true_peak_dbtp": float(peak[-1]) if peak else None,
            "measured_by": "ebur128 (separate from the loudnorm that made the file)"}
