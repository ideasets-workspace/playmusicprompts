"""Research item A8, stage 2 — RMS-VAD vocal-activity segmentation, and the honest ASR boundary.

WHAT THIS IS, AND WHY IT IS NOT A HABIT
---------------------------------------
Whisper-class ASR accepts audio under 30 s, so a full song must be SEGMENTED, and the choice of boundaries
is not a detail: S17 (arXiv:2506.15514, Syed/Meresman-Higgs/Cífka/Sandler, ICMEW 2025, read in FULL this
session) measures Jam-ALT WER moving from **23.02 % to 20.35 %** by changing ONLY the segmentation — from
Whisper's native timestamp-chaining to vocal-activity boundaries derived from the separated vocals. That is
the largest single improvement in the corpus that costs no model change and no training.

EVERY PARAMETER HERE CAME FROM A PRIMARY SOURCE, and the two the primary left open are REQUIRED arguments
rather than silent defaults:

    frame length 2048 · hop 512 @ 16 kHz          S17 code, `librosa.feature.rms(...)` in `get_speech_timestamps_rms`
    peak normalisation rms / max(rms)              S17 code + paper eq. (3)
    onset 0.1 · offset 0.1                         S17 paper, verbatim
    minimum silence 1 s · max segment 30 s         S17 paper, verbatim
    min silence at max speech 98 ms                S17 code
    min speech duration · speech pad               NOT stated in the paper -> REQUIRED, no default

The paper defines the frame size N only SYMBOLICALLY (equation 2) and never gives its value, which is why the
authors' own published code was read as a second primary. A threshold invented to fill that gap would be the
exact defect MANDATE CLAUSE 7 exists for: a guessed motion floor of 0.08 once rejected all seven correct
shots where the calibrated value was 0.0007.

WHAT THIS MODULE DELIBERATELY DOES NOT DO
-----------------------------------------
* It does not decode audio. `numpy`/`librosa` are not dependencies of this package, and the film side already
  owns ffmpeg-based measurement. The RMS envelope is an INPUT here, computed by whatever runs on the instance,
  and `EnvelopeSpec` states the exact contract that envelope must satisfy — so this module is testable at $0
  with a synthetic envelope and cannot silently accept one computed with different parameters.
* It does not transcribe, and it does not pretend our numbers are comparable to S17's. Our ASR is
  `stt_vertex` (D-SSM-24: everything Vertex/Google), not Whisper-large-v2, so **20.35 % is the METHOD's
  evidence and never our expected result** — `SegmentationPlan` carries that statement in its own payload.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping, Sequence

_PACKAGE_DIR: Final[Path] = Path(__file__).resolve().parent
_GATE_RELATIVE: Final[str] = "data/intelligibility_gate.json"


class VocalActivityError(Exception):
    """A segmentation fault that must stop the measurement rather than produce a plausible number."""


class SegmentState(Enum):
    """Why a segment exists. Recorded per segment because the two are not equally trustworthy."""

    ACTIVITY = "ACTIVITY"
    #: Produced by the min-cut fallback: the segment hit the maximum length with no silence to cut at, so it
    #: was split at the quietest frame of its own second half. S17's code does this; a listener may hear the
    #: cut mid-word, and a segment marked this way is a known risk rather than a clean boundary.
    MIN_CUT = "MIN_CUT"


@dataclass(frozen=True)
class EnvelopeSpec:
    """The contract the RMS envelope must satisfy, so a mismatched envelope is REFUSED, not silently used.

    An envelope computed with a different frame length or hop is a different instrument: the thresholds below
    are calibrated against S17's 2048/512 @ 16 kHz peak-normalised envelope and mean nothing against another.
    """

    sampling_rate_hz: int
    frame_length_samples: int
    hop_samples: int
    normalisation: str

    @property
    def hop_seconds(self) -> float:
        return self.hop_samples / self.sampling_rate_hz

    @property
    def frame_seconds(self) -> float:
        return self.frame_length_samples / self.sampling_rate_hz

    def assert_matches(self, other: "EnvelopeSpec") -> None:
        if (self.sampling_rate_hz, self.frame_length_samples, self.hop_samples) != (
                other.sampling_rate_hz, other.frame_length_samples, other.hop_samples):
            raise VocalActivityError(
                f"the supplied envelope was computed at {other.sampling_rate_hz} Hz / frame "
                f"{other.frame_length_samples} / hop {other.hop_samples}, but the thresholds are calibrated "
                f"for {self.sampling_rate_hz} Hz / frame {self.frame_length_samples} / hop {self.hop_samples} "
                f"(S17). Different framing is a different instrument; the mismatch is refused rather than "
                f"measured."
            )

    def as_dict(self) -> dict:
        return {"sampling_rate_hz": self.sampling_rate_hz,
                "frame_length_samples": self.frame_length_samples,
                "hop_samples": self.hop_samples,
                "hop_seconds": round(self.hop_seconds, 6),
                "frame_seconds": round(self.frame_seconds, 6),
                "normalisation": self.normalisation}


@dataclass(frozen=True)
class VadThresholds:
    """S17's Cut & Merge parameters. Every field carries its source in `sources`; none has a default here.

    `min_speech_duration_s` and `speech_pad_s` are REQUIRED with no default on purpose: the paper does not
    state them, and a default would be an unsourced threshold wearing a library's clothes.
    """

    onset: float
    offset: float
    min_silence_duration_s: float
    max_segment_length_s: float
    min_silence_at_max_speech_s: float
    min_speech_duration_s: float
    speech_pad_s: float
    sources: Mapping[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not 0.0 < self.onset <= 1.0 or not 0.0 < self.offset <= 1.0:
            raise VocalActivityError(
                f"onset/offset are fractions of the PEAK-normalised envelope and must lie in (0, 1]; got "
                f"onset={self.onset}, offset={self.offset}. A value above 1 can never trigger, which would "
                f"silently produce zero segments and read as 'no singing'."
            )
        if self.offset > self.onset:
            raise VocalActivityError(
                f"offset ({self.offset}) is above onset ({self.onset}): the gate would close before it "
                f"opened. S17 uses equal thresholds of 0.1; hysteresis may lower the offset, never raise it."
            )
        if self.max_segment_length_s <= self.min_silence_duration_s:
            raise VocalActivityError(
                f"max segment ({self.max_segment_length_s} s) must exceed the minimum silence "
                f"({self.min_silence_duration_s} s), or every silence would end the segment it is inside."
            )
        if self.min_speech_duration_s <= 0 or self.speech_pad_s < 0:
            raise VocalActivityError("min speech duration must be positive and speech pad non-negative.")

    def as_dict(self) -> dict:
        return {"onset": self.onset, "offset": self.offset,
                "min_silence_duration_s": self.min_silence_duration_s,
                "max_segment_length_s": self.max_segment_length_s,
                "min_silence_at_max_speech_s": self.min_silence_at_max_speech_s,
                "min_speech_duration_s": self.min_speech_duration_s,
                "speech_pad_s": self.speech_pad_s,
                "sources": dict(self.sources)}


@dataclass(frozen=True)
class VocalSegment:
    """One vocal-activity span, in SECONDS, with the reason it ends where it does."""

    start_s: float
    end_s: float
    state: SegmentState

    @property
    def duration_s(self) -> float:
        return self.end_s - self.start_s

    def as_dict(self) -> dict:
        return {"start_s": round(self.start_s, 3), "end_s": round(self.end_s, 3),
                "duration_s": round(self.duration_s, 3), "state": self.state.value}


@dataclass(frozen=True)
class SegmentationPlan:
    """The segments to transcribe, plus the honesty the numbers need to be read correctly."""

    segments: tuple[VocalSegment, ...]
    envelope: EnvelopeSpec
    thresholds: VadThresholds
    method: str
    comparability_warning: str
    total_active_s: float
    min_cut_count: int

    @property
    def segment_count(self) -> int:
        return len(self.segments)

    def segment_activity(self) -> tuple[dict, ...]:
        """The per-segment vocal-activity record, under A8's own name for this measurement.

        Named `segment_activity` because that is what the research item and the application ledger call the
        output of this stage. It is the ONE place a caller reads the activity per segment, so the ASR stage
        and the report cannot disagree about which spans were considered sung.

        Each record carries the span, its duration, and WHY it ends where it does — a MIN_CUT boundary was
        forced by the length budget with no silence available, so it may fall inside a sung word, and a
        consumer that treats it as a clean phrase boundary would mis-attribute an error to the singing.
        """
        return tuple(segment.as_dict() for segment in self.segments)

    @property
    def activity_ratio(self) -> float | None:
        """Active seconds over the whole span the segments cover, or None when nothing is active.

        None rather than 0.0 on an empty plan: zero would read as "measured, and it was silent", while the
        honest statement is that there is no activity to take a ratio of (A10's second control).
        """
        if not self.segments:
            return None
        span = max(segment.end_s for segment in self.segments) - min(
            segment.start_s for segment in self.segments)
        return (self.total_active_s / span) if span > 0 else None

    def assert_transcribable(self) -> None:
        """Refuse a plan that cannot be handed to the ASR, instead of transcribing nothing and scoring 100 %.

        A song with no detected activity is a REAL possibility (an instrumental take), and it must be
        reported as "no vocal activity" rather than measured as unintelligible singing — that distinction is
        A10's second negative control.
        """
        if not self.segments:
            raise VocalActivityError(
                "no vocal activity was detected, so there is nothing to transcribe. This is NOT a lyric "
                "failure: an instrumental take legitimately produces zero segments (A10 control 2). The "
                "caller must report NO_VOCAL_ACTIVITY, never a PER of 1.0."
            )
        over = [segment for segment in self.segments
                if segment.duration_s > self.thresholds.max_segment_length_s + 1e-6]
        if over:
            raise VocalActivityError(
                f"{len(over)} segment(s) exceed the {self.thresholds.max_segment_length_s} s maximum "
                f"(longest {max(s.duration_s for s in over):.2f} s). Whisper-class models accept 30 s; a "
                f"longer segment would be silently truncated, which loses lyrics without any error."
            )

    def as_dict(self) -> dict:
        return {
            "research_item": "A8",
            "stage": "stage_2_rms_vad",
            "method": self.method,
            "segment_count": self.segment_count,
            "total_active_s": round(self.total_active_s, 3),
            "min_cut_count": self.min_cut_count,
            "envelope": self.envelope.as_dict(),
            "thresholds": self.thresholds.as_dict(),
            "comparability_warning": self.comparability_warning,
            "activity_ratio": (round(self.activity_ratio, 4)
                               if self.activity_ratio is not None else None),
            "segment_activity": list(self.segment_activity()),
        }


class IntelligibilityGateSpec:
    """The A8 evidence file, parsed. Supplies the thresholds and the envelope contract; invents nothing."""

    def __init__(self, document: Mapping) -> None:
        self._document = document
        stage = document.get("stage_2_rms_vad")
        if not stage:
            raise VocalActivityError(f"{_GATE_RELATIVE} has no stage_2_rms_vad block.")
        self._stage = stage

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _GATE_RELATIVE) -> "IntelligibilityGateSpec":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise VocalActivityError(
                f"the A8 evidence file is absent at {path}. It carries S17's measured VAD parameters with "
                f"their sources; without it this module would have to invent a threshold, which MANDATE "
                f"CLAUSE 7 forbids by name."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")))

    @staticmethod
    def _value(entry: object, name: str) -> float:
        """Read a `{value, source}` record, refusing a bare number.

        A bare number in the data file would have no provenance, which is the same defect as a hardcoded
        constant — it would simply be hardcoded one layer down.
        """
        if not isinstance(entry, Mapping) or "value" not in entry:
            raise VocalActivityError(
                f"{name} in {_GATE_RELATIVE} is not a {{value, source}} record. Every threshold must carry "
                f"the source it was read from; a bare number is a hardcoded constant in a data file."
            )
        return float(entry["value"])

    def envelope(self) -> EnvelopeSpec:
        stage = self._stage
        return EnvelopeSpec(
            sampling_rate_hz=int(self._value(stage.get("signal", {}).get("sampling_rate_hz")
                                             if isinstance(stage.get("signal"), Mapping)
                                             and "value" in stage.get("signal", {})
                                             else {"value": stage["signal"]["sampling_rate_hz"],
                                                   "source": stage["signal"]["source"]},
                                             "sampling_rate_hz")),
            frame_length_samples=int(self._value(stage["rms_frame_length_samples"],
                                                 "rms_frame_length_samples")),
            hop_samples=int(self._value(stage["rms_hop_samples"], "rms_hop_samples")),
            normalisation=str(stage["normalisation"]["formula"]),
        )

    def thresholds(self, *, min_speech_duration_s: float, speech_pad_s: float) -> VadThresholds:
        """S17's sourced thresholds, plus the two the paper never stated — which the CALLER must supply.

        Requiring them as keyword arguments is the mechanism: an unsourced value cannot enter through this
        module's own defaults, only through a caller that has decided it explicitly and can be asked why.
        """
        stage = self._stage
        return VadThresholds(
            onset=self._value(stage["onset_threshold"], "onset_threshold"),
            offset=self._value(stage["offset_threshold"], "offset_threshold"),
            min_silence_duration_s=self._value(stage["min_silence_duration_s"], "min_silence_duration_s"),
            max_segment_length_s=self._value(stage["max_segment_length_s"], "max_segment_length_s"),
            min_silence_at_max_speech_s=self._value(stage["min_silence_at_max_speech_ms"],
                                                    "min_silence_at_max_speech_ms") / 1000.0,
            min_speech_duration_s=min_speech_duration_s,
            speech_pad_s=speech_pad_s,
            sources={
                "onset/offset/min_silence/max_segment": self._document["primary_sources_read_this_session"]
                ["S17_paper"]["verbatim_parameters"],
                "frame/hop/normalisation/min_silence_at_max_speech": "S17 code, "
                + self._document["primary_sources_read_this_session"]["S17_code"]["url"],
                "min_speech_duration_s/speech_pad_s": "NOT stated in S17's paper — supplied by the caller "
                                                      "and recorded here as unsourced",
            },
        )

    def comparability_warning(self) -> str:
        return str(self._document["stage_3_asr"]["our_asr"]["consequence_stated_not_hidden"])

    def vocable_rule(self) -> Mapping:
        return self._document["stage_5_the_vocable_exemption"]


class RmsVadSegmenter:
    """S17's RMS-VAD, implemented over a supplied peak-normalised RMS envelope.

    The envelope is an argument rather than something this class computes: that keeps the audio decoder out of
    the contract package, makes every branch testable at $0 with a synthetic envelope, and forces the framing
    parameters to be declared so a mismatch is refused instead of measured.
    """

    def __init__(self, spec: IntelligibilityGateSpec | None = None, *,
                 min_speech_duration_s: float, speech_pad_s: float) -> None:
        self._spec = spec or IntelligibilityGateSpec.load()
        self._expected_envelope = self._spec.envelope()
        self._thresholds = self._spec.thresholds(min_speech_duration_s=min_speech_duration_s,
                                                 speech_pad_s=speech_pad_s)

    @property
    def thresholds(self) -> VadThresholds:
        return self._thresholds

    @property
    def expected_envelope(self) -> EnvelopeSpec:
        return self._expected_envelope

    def _frames_to_seconds(self, frame_index: int) -> float:
        return frame_index * self._expected_envelope.hop_seconds

    def segment(self, envelope: Sequence[float], envelope_spec: EnvelopeSpec,
                audio_duration_s: float | None = None) -> SegmentationPlan:
        """Turn a peak-normalised RMS envelope into vocal-activity segments.

        The state machine follows S17's `get_speech_timestamps_rms`: hysteresis on onset/offset, a silence
        must last `min_silence_duration_s` to close a segment, a segment that reaches the maximum is closed at
        the last silence if one is available and otherwise MIN-CUT at the quietest frame of its second half
        (ties resolved to the LAST index, as in their code), and short spans are dropped.
        """
        self._expected_envelope.assert_matches(envelope_spec)
        if not envelope:
            raise VocalActivityError("the envelope is empty; there is nothing to segment.")
        peak = max(envelope)
        if peak <= 0.0:
            raise VocalActivityError(
                "the envelope's peak is zero — the signal is silent, or the envelope was not computed. "
                "Refused rather than returned as 'no singing', because those are different findings."
            )
        if peak > 1.0 + 1e-6:
            raise VocalActivityError(
                f"the envelope's peak is {peak:.4f}, so it is NOT peak-normalised. S17's thresholds are "
                f"fractions of max(RMS) (eq. 3); against an un-normalised envelope 0.1 means an absolute "
                f"amplitude and the segmentation would be arbitrary."
            )

        thresholds = self._thresholds
        hop = self._expected_envelope.hop_seconds
        # S17's code shortens the budget BEFORE comparing, and the shortening is not cosmetic:
        #   max_speech_samples = sampling_rate * max_speech_duration_s - window_size_samples
        #                        - 2 * speech_pad_samples
        # Two reasons, both measured by this module's control. (a) The comparison fires on the frame AFTER the
        # budget is exceeded, so without the one-hop allowance a segment lands one frame OVER the limit — the
        # control measured exactly 30.02 s against a 30 s maximum. (b) Padding is added to the first and last
        # segment afterwards, so the budget must reserve room for it or the padded segment breaks the ceiling.
        # A segment over 30 s is silently TRUNCATED by a Whisper-class model, which loses lyrics with no error.
        max_frames = ((thresholds.max_segment_length_s - hop - 2 * thresholds.speech_pad_s)
                      / hop)
        if max_frames <= 0:
            raise VocalActivityError(
                f"the speech pad ({thresholds.speech_pad_s} s) consumes the whole "
                f"{thresholds.max_segment_length_s} s budget, leaving no room for audio. S17's formula "
                f"reserves one hop plus twice the pad; with these values the segmenter could only emit "
                f"empty segments."
            )
        min_silence_frames = thresholds.min_silence_duration_s / hop
        tolerated_silence_frames = thresholds.min_silence_at_max_speech_s / hop
        min_speech_frames = thresholds.min_speech_duration_s / hop

        raw: list[tuple[int, int, SegmentState]] = []
        triggered = False
        start_frame = 0
        silence_start: int | None = None
        last_safe_end: int | None = None

        for index, score in enumerate(envelope):
            if score >= thresholds.onset:
                if not triggered:
                    triggered, start_frame = True, index
                    silence_start, last_safe_end = None, None
                elif silence_start is not None:
                    # The gap was too short to close the segment; S17 also clears the pending end here.
                    if index - silence_start > tolerated_silence_frames:
                        last_safe_end = silence_start
                    silence_start = None
            elif triggered and score < thresholds.offset:
                if silence_start is None:
                    silence_start = index
                elif index - silence_start >= min_silence_frames:
                    if silence_start - start_frame > min_speech_frames:
                        raw.append((start_frame, silence_start, SegmentState.ACTIVITY))
                    triggered, silence_start, last_safe_end = False, None, None

            if triggered and index - start_frame > max_frames:
                if last_safe_end is not None and last_safe_end > start_frame:
                    raw.append((start_frame, last_safe_end, SegmentState.ACTIVITY))
                    start_frame = last_safe_end
                else:
                    second_half = start_frame + (index + 1 - start_frame) // 2
                    window = list(enumerate(envelope[second_half:index + 1], start=second_half))
                    quietest = min(score for _, score in window)
                    cut = max(frame for frame, score in window if score == quietest)
                    raw.append((start_frame, cut, SegmentState.MIN_CUT))
                    start_frame = cut
                silence_start, last_safe_end = None, None

        if triggered and len(envelope) - start_frame > min_speech_frames:
            raw.append((start_frame, len(envelope), SegmentState.ACTIVITY))

        limit = audio_duration_s if audio_duration_s is not None else self._frames_to_seconds(len(envelope))
        segments: list[VocalSegment] = []
        for order, (first, last, state) in enumerate(raw):
            start_s = self._frames_to_seconds(first)
            end_s = self._frames_to_seconds(last)
            if order == 0:
                start_s = max(0.0, start_s - thresholds.speech_pad_s)
            if order == len(raw) - 1:
                end_s = min(limit, end_s + thresholds.speech_pad_s)
            segments.append(VocalSegment(start_s=start_s, end_s=min(end_s, limit), state=state))

        return SegmentationPlan(
            segments=tuple(segments),
            envelope=self._expected_envelope,
            thresholds=thresholds,
            method="RMS-VAD (S17, arXiv:2506.15514) — peak-normalised RMS envelope, Cut & Merge hysteresis, "
                   "min-cut fallback at the maximum length",
            comparability_warning=self._spec.comparability_warning(),
            total_active_s=sum(segment.duration_s for segment in segments),
            min_cut_count=sum(1 for segment in segments if segment.state is SegmentState.MIN_CUT),
        )
