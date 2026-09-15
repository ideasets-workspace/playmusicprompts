"""
SSM Content Asset Creator — Music Studio · PHONEME TIMING (research item A3, with the A4 guard)
==============================================================================================

WHAT THIS MODULE IS, for the next agent
---------------------------------------
The length regulator. It turns a musical plan (sections, notes, syllables) plus a phoneme sequence into
PER-PHONEME onsets and offsets, and then expands the phoneme sequence into a frame-aligned condition the
way the measured frontier method does. It generates nothing and calls no vendor.

WHY THIS IS THE MOST VALUABLE ITEM IN THE WHOLE RESEARCH CORPUS
---------------------------------------------------------------
`docs/research/2026-08-14-cross-lingual-singing-voice-synthesis-frontier.md` section 2.2 (MPEcho, S06,
read `[FULL]` this session) measures, on the SAME backbone and the same test set:

    melody conditioning only ................................. PER 0.4562
    phoneme-only (no melody) ................................. PER 0.2292  but RPA collapses to 0.0667
    melody + SVS-style PHONEME-LEVEL timing .................. PER 0.1865  RPA 0.5764 restored
    best multi-condition guidance (15.0, 7.5, 5.0) ........... PER 0.1793  RPA 0.6241
    JAM-style WORD-LEVEL phoneme arrangement ................. PER 0.7125  <-- WORSE THAN NO CONTROL

Two hard consequences, both refutations of shortcuts rather than preferences:
  · "word timings are good enough" is REFUTED WITH A NUMBER: 0.7125 vs 0.1865, on the same system.
    `WordLevelTimingRefused` exists so that shortcut cannot be taken silently.
  · phoneme timing WITHOUT melody destroys musicality (RPA 0.0667), which is research item A4 — enforced
    here as well as in `phonology.py`, because the failure would occur at the moment of expansion.

THE MECHANISM, as the paper describes it and as implemented here
---------------------------------------------------------------
S06: "phoneme sequence P and duration sequence D -> embeddings -> FFT block -> **length regulator repeats
each phoneme embedding according to its duration** -> downsample/pad to the DiT hidden length -> fuse with
melody before injection." We do not train a DiT, so what this module owns is the part that is ours and
that any engine needs regardless of architecture: the DURATION SEQUENCE, computed from the musical plan
and expressed in both seconds and frames.

WHERE THE TIMINGS COME FROM, and the honest limit
-------------------------------------------------
S06 obtains them from **Phonsa** (a Whisper-encoder aligner: MAE 32.6 ms vs MFA's 233.9 ms, PCO 0.965 vs
0.767). We do not have Phonsa, and research item A11 states plainly that off-the-shelf MFA is NOT the
instrument for singing. So this module supports two sources and LABELS them:
    PLANNED   — derived from the note/syllable plan we are about to sing. Available before any audio
                exists, which is exactly when a generation request needs it.
    MEASURED  — read back from delivered audio by an aligner. NOT AVAILABLE YET (A11 is open), and asking
                for it raises rather than falling back to the planned values under a measured label.
A planned duration is an INSTRUCTION; a measured one is EVIDENCE. Conflating them would be the class of
claim this project forbids, so `TimingSource` is part of every artefact this module produces.

TYPES
-----
    TimingSource            PLANNED | MEASURED — provenance, never mixed
    SyllableSpan            one syllable's time span, from the note plan
    PhonemeSpan             one phoneme's onset/offset plus its syllable role
    PhonemeTimeline         the full per-phoneme timeline, with the frame expansion and the A4 guard
    WordLevelTimingRefused  the refusal that keeps the 0.7125 shortcut unavailable
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Final, Iterable, Mapping, Sequence

from .phonology import (
    LENGTH_MARK,
    FeatureTable,
    Phone,
    PhonemeDrivePlan,
    PhonemeEncoding,
    PhonemeInventory,
    PhonologyError,
)

#: Frame rate used when expressing a timeline in frames. NOT invented: 10 ms is the hop the aligner
#: literature this research reads is quoted against — S06 reports Phonsa's MAE as 32.6 ms and its chunked
#: attention over "500-frame/10 s chunks", i.e. 50 frames per second, 20 ms per frame; the boundary
#: tolerance it calls strict is 20 ms. 100 frames/s (10 ms) is therefore FINER than the tolerance any
#: measurement in the corpus claims, which is the safe direction for a planning grid: it can express every
#: boundary the aligner could resolve. Stated as a value with its basis, and overridable per call.
DEFAULT_FRAME_RATE_HZ: Final[int] = 100

#: The measured PER of the shortcut this module refuses, kept beside the refusal so the number travels
#: with it (S06's own table, read this session).
WORD_LEVEL_PER: Final[float] = 0.7125
PHONEME_LEVEL_PER: Final[float] = 0.1865
MELODY_ONLY_PER: Final[float] = 0.4562
PHONEME_ONLY_RPA: Final[float] = 0.0667


class TimingSource(Enum):
    """Where a duration came from. Part of every artefact, because the two are not interchangeable.

    PLANNED   computed from the note/syllable plan BEFORE any audio exists. An instruction to the engine.
    MEASURED  read from delivered audio by an aligner. Evidence about what actually happened.

    A planned timeline may never be reported as measured: research item A11 is open (we have no
    singing-grade aligner), and labelling a plan as a measurement would manufacture evidence.
    """

    PLANNED = "planned"
    MEASURED = "measured"


class SyllableRole(Enum):
    """A phoneme's position inside its syllable, which decides how a duration is distributed.

    ONSET    consonant(s) before the vowel — short, and lengthening them is what makes synthetic singing
             sound percussive rather than sung.
    NUCLEUS  the vowel: the note-bearing segment. In singing THIS is what a long note stretches.
    CODA     consonant(s) after the vowel.

    The distinction is not stylistic: in sung Turkish the note length lands on the nucleus (the research's
    axis 7.2 records that a held syllable is a held VOWEL, with note type 3 = slur used for exactly this),
    so distributing a note's duration evenly across its phonemes would be wrong by construction.
    """

    ONSET = "onset"
    NUCLEUS = "nucleus"
    CODA = "coda"


class WordLevelTimingRefused(PhonologyError):
    """Raised when a caller asks for word-level rather than phoneme-level timing.

    This is a refusal WITH A MEASUREMENT, not a style rule: S06's own table gives the word-level
    arrangement PER 0.7125 against 0.1865 for phoneme-level, i.e. worse than using no phoneme control at
    all (0.4562). A gate that can be argued with is not a gate.
    """


@dataclass(frozen=True)
class SyllableSpan:
    """One syllable of the plan: its time span, and the phonemes that must fit inside it.

    `start_seconds`/`end_seconds` come from the note plan — the caller's musical decision, not ours.
    `phonemes` is the phoneme sequence for that syllable, already through the G2P.
    """

    start_seconds: float
    end_seconds: float
    phonemes: tuple[str, ...]
    text: str = ""

    def __post_init__(self) -> None:
        if self.end_seconds <= self.start_seconds:
            raise PhonologyError(
                f"syllable {self.text!r} has a non-positive duration "
                f"({self.start_seconds} -> {self.end_seconds}); a zero-length note cannot carry a phoneme"
            )
        if not self.phonemes:
            raise PhonologyError(f"syllable {self.text!r} carries no phonemes")

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds


@dataclass(frozen=True)
class PhonemeSpan:
    """One phoneme with its own onset and offset — the unit S06 measures the 0.1865 PER against."""

    phoneme: str
    start_seconds: float
    end_seconds: float
    role: SyllableRole
    syllable_index: int

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds

    def frames(self, frame_rate_hz: int = DEFAULT_FRAME_RATE_HZ) -> int:
        """Frame count for this phoneme. At least one frame: a phoneme that rounds to zero would vanish."""
        return max(1, round(self.duration_seconds * frame_rate_hz))

    def as_dict(self) -> dict:
        return {
            "phoneme": self.phoneme,
            "start_seconds": round(self.start_seconds, 4),
            "end_seconds": round(self.end_seconds, 4),
            "duration_seconds": round(self.duration_seconds, 4),
            "role": self.role.value,
            "syllable_index": self.syllable_index,
        }


class LengthRegulator:
    """Distributes each syllable's duration across its phonemes, by ROLE rather than evenly.

    THE RULE AND ITS BASIS. In sung material the note length lands on the vowel: the research's Turkish
    axis 7.2 records held syllables as held vowels (note type 3 = slur), and S06's own mechanism is a
    length regulator that "repeats each phoneme embedding according to its duration" — so the durations
    must be musically right BEFORE they are repeated. Consonants therefore receive a bounded share and the
    nucleus absorbs the remainder.

    THE CONSONANT SHARE IS A STATED PARAMETER, NOT A HIDDEN CONSTANT. `consonant_seconds` defaults to
    0.06 s, which is the value this class DECLARES and every artefact reports, so it can be replaced by a
    measurement the moment we have an aligner (A11). It is deliberately shorter than the 20 ms-tolerance
    boundary claim in the corpus multiplied by three, and it is capped so a consonant can never take more
    than `max_consonant_fraction` of a short syllable — otherwise a fast syllable would leave the vowel
    with no time at all, which is the failure that makes synthetic singing sound clipped.
    """

    def __init__(self, consonant_seconds: float = 0.06, max_consonant_fraction: float = 0.4,
                 inventory: PhonemeInventory | None = None) -> None:
        if not 0.0 < max_consonant_fraction < 1.0:
            raise PhonologyError("max_consonant_fraction must sit strictly between 0 and 1")
        if consonant_seconds <= 0.0:
            raise PhonologyError("consonant_seconds must be positive")
        self.consonant_seconds = consonant_seconds
        self.max_consonant_fraction = max_consonant_fraction
        self._inventory = inventory or PhonemeInventory.load()
        self._vowels = self._derive_vowel_set()

    def _derive_vowel_set(self) -> frozenset[str]:
        """The vowel set is DERIVED from the inventory's own data, never typed as a list here.

        A phone is treated as a nucleus candidate when the research table records it against a Turkish
        VOWEL letter. Hardcoding "a e i o u ö ü ı" would be the amateurish-construction class and would
        also silently miss `ɛ`, `ɪ`, `ʊ`, `ʏ`, `ɨ`, `ɯ`, `ø`, `y` and every length variant.
        """
        vowel_letters = set("aeıioöuü")
        vowels = set()
        for phone in self._inventory.phones:
            letters = phone.turkish_letters.lower()
            head = letters.split()[0] if letters.split() else ""
            if head and head[0] in vowel_letters:
                vowels.add(phone.merged)
        if not vowels:
            raise PhonologyError(
                "no vowels could be derived from the inventory's Turkish-letter column; the length "
                "regulator refuses to guess a vowel set."
            )
        return frozenset(vowels)

    def is_nucleus(self, phoneme: str) -> bool:
        return phoneme in self._vowels

    def role_of(self, phoneme: str, seen_nucleus: bool) -> SyllableRole:
        if self.is_nucleus(phoneme):
            return SyllableRole.NUCLEUS
        return SyllableRole.CODA if seen_nucleus else SyllableRole.ONSET

    def distribute(self, syllable: SyllableSpan, syllable_index: int) -> tuple[PhonemeSpan, ...]:
        """Assign each phoneme in one syllable its own onset and offset."""
        roles: list[SyllableRole] = []
        seen_nucleus = False
        for phoneme in syllable.phonemes:
            role = self.role_of(phoneme, seen_nucleus)
            seen_nucleus = seen_nucleus or role is SyllableRole.NUCLEUS
            roles.append(role)

        nuclei = [index for index, role in enumerate(roles) if role is SyllableRole.NUCLEUS]
        consonant_count = len(roles) - len(nuclei)

        if not nuclei:
            # A syllable with no vowel (a lone consonant, e.g. an interjection) shares its time evenly:
            # there is no nucleus to absorb the remainder, and inventing one would be worse.
            share = syllable.duration_seconds / len(roles)
            spans: list[PhonemeSpan] = []
            cursor = syllable.start_seconds
            for phoneme, role in zip(syllable.phonemes, roles):
                spans.append(PhonemeSpan(phoneme, cursor, cursor + share, role, syllable_index))
                cursor += share
            return tuple(spans)

        budget = syllable.duration_seconds * self.max_consonant_fraction
        per_consonant = min(self.consonant_seconds,
                            budget / consonant_count) if consonant_count else 0.0
        nucleus_total = syllable.duration_seconds - per_consonant * consonant_count
        per_nucleus = nucleus_total / len(nuclei)

        spans = []
        cursor = syllable.start_seconds
        for phoneme, role in zip(syllable.phonemes, roles):
            length = per_nucleus if role is SyllableRole.NUCLEUS else per_consonant
            spans.append(PhonemeSpan(phoneme, cursor, cursor + length, role, syllable_index))
            cursor += length
        return tuple(spans)

    def as_dict(self) -> dict:
        return {
            "consonant_seconds": self.consonant_seconds,
            "max_consonant_fraction": self.max_consonant_fraction,
            "vowel_count_derived": len(self._vowels),
            "basis": "note length lands on the nucleus (Turkish axis 7.2: a held syllable is a held "
                     "vowel, note type 3 = slur); the consonant share is a STATED parameter awaiting an "
                     "aligner measurement (research item A11 is open)",
        }


@dataclass
class PhonemeTimeline:
    """The A3 artefact: per-phoneme onsets/offsets, expandable to frames, with both guards attached.

    `source` is never optional. A PLANNED timeline is an instruction; only an aligner may produce a
    MEASURED one, and `assert_measured()` refuses to pretend otherwise.
    """

    spans: tuple[PhonemeSpan, ...]
    source: TimingSource
    frame_rate_hz: int = DEFAULT_FRAME_RATE_HZ
    melody_present: bool = False
    regulator_settings: Mapping[str, object] = field(default_factory=dict)

    @property
    def total_seconds(self) -> float:
        return self.spans[-1].end_seconds - self.spans[0].start_seconds if self.spans else 0.0

    @property
    def phoneme_count(self) -> int:
        return len(self.spans)

    def assert_phoneme_level(self) -> None:
        """Prove this timeline is per-phoneme, not per-word — the 0.7125 shortcut must stay unavailable."""
        if any(len(span.phoneme.replace(LENGTH_MARK, "")) > 3 for span in self.spans):
            raise WordLevelTimingRefused(
                f"a span carries what looks like a word rather than a phoneme. S06 measures word-level "
                f"arrangement at PER {WORD_LEVEL_PER} against {PHONEME_LEVEL_PER} for phoneme-level — "
                f"worse than using no phoneme control at all ({MELODY_ONLY_PER}). Refused."
            )

    def assert_melody_present(self) -> None:
        """Research item A4, enforced at the moment of expansion as well as at plan construction."""
        if not self.melody_present:
            raise PhonologyError(
                f"refusing to expand a phoneme timeline with no melody conditioning: S06 measures "
                f"phoneme-only conditioning at RPA {PHONEME_ONLY_RPA} — musicality collapses even though "
                f"PER improves. Attach melody conditioning (research item A4)."
            )

    def assert_measured(self) -> None:
        """Refuse to treat a planned timeline as evidence — AND refuse an unauthorised MEASURED claim.

        TWO CHECKS, because the first alone was a hole I found on 2026-08-15 while building A11: this method
        used to inspect only `self.source`, so a caller could construct
        `PhonemeTimeline(source=TimingSource.MEASURED)` and the guard returned SILENTLY. It trusted its own
        input's label. A guard that believes what it is told is not a guard.

        So the second check asks the A11 registry BY WHAT INSTRUMENT. Today no lawful singing aligner is
        installed — off-the-shelf MFA is REFUSED on C06 (VERIFIED across four sources: MAE 233.9 ms against
        Phonsa's 32.6 ms), Phonsa and STARS are blocked by D-SSM-24 and by GTSinger's CC BY-NC-SA 4.0
        non-commercial licence, and MFA-retrained needs A12's absent corpus. The import is LOCAL so this
        module keeps working for PLANNED timelines even if the registry file is missing, which is the state
        that must never be silently upgraded to "measured".
        """
        if self.source is TimingSource.PLANNED:
            raise PhonologyError(
                "this timeline is PLANNED, not MEASURED: it states what we asked for, not what was sung. "
                "A measured timeline requires a singing-grade aligner, and research item A11 records that "
                "off-the-shelf MFA is not that instrument (MAE 233.9 ms against Phonsa's 32.6 ms)."
            )
        from .alignment import (
            AlignerRegistry,  # local: PLANNED use must not depend on the A11 record
        )
        AlignerRegistry.load().assert_may_claim_measured_timing()

    def expand(self, encoding: PhonemeEncoding = PhonemeEncoding.MERGED,
               feature_table: FeatureTable | None = None,
               inventory: PhonemeInventory | None = None) -> tuple[str, ...]:
        """The length regulator's output: each phoneme's tokens REPEATED for its frame count.

        This is S06's "length regulator repeats each phoneme embedding according to its duration",
        expressed at the token level because we drive hosted engines rather than train a DiT. Both guards
        run first: a word-level timeline and a melody-less request are both refused here, not warned about.
        """
        self.assert_phoneme_level()
        self.assert_melody_present()
        table = inventory or PhonemeInventory.load()
        features = feature_table
        expanded: list[str] = []
        for span in self.spans:
            phone = table.phone_for(span.phoneme)
            tokens = (phone.feature_tokens(features or FeatureTable.load())
                      if encoding is PhonemeEncoding.FEATURE else phone.tokens(encoding))
            expanded.extend(tokens * span.frames(self.frame_rate_hz))
        return tuple(expanded)

    def as_dict(self) -> dict:
        return {
            "source": self.source.value,
            "is_evidence": self.source is TimingSource.MEASURED,
            "frame_rate_hz": self.frame_rate_hz,
            "phoneme_count": self.phoneme_count,
            "total_seconds": round(self.total_seconds, 4),
            "total_frames": sum(span.frames(self.frame_rate_hz) for span in self.spans),
            "melody_present": self.melody_present,
            "regulator": dict(self.regulator_settings),
            "spans": [span.as_dict() for span in self.spans],
            "measured_basis": {
                "melody_only_per": MELODY_ONLY_PER,
                "phoneme_level_per": PHONEME_LEVEL_PER,
                "word_level_per_refused": WORD_LEVEL_PER,
                "phoneme_only_rpa_refused": PHONEME_ONLY_RPA,
                "source": "S06 (MPEcho) table, read 2026-08-15",
            },
        }


def build_timeline(syllables: Sequence[SyllableSpan], *, melody_present: bool,
                   regulator: LengthRegulator | None = None,
                   frame_rate_hz: int = DEFAULT_FRAME_RATE_HZ,
                   source: TimingSource = TimingSource.PLANNED) -> PhonemeTimeline:
    """Compile a syllable plan into a per-phoneme timeline (research item A3)."""
    if not syllables:
        raise PhonologyError("a timeline needs at least one syllable")
    for earlier, later in zip(syllables, syllables[1:]):
        if later.start_seconds < earlier.end_seconds:
            raise PhonologyError(
                f"syllables overlap: {earlier.text!r} ends at {earlier.end_seconds} but "
                f"{later.text!r} starts at {later.start_seconds}. An overlapping plan would make the "
                f"length regulator assign one frame to two phonemes."
            )
    engine = regulator or LengthRegulator()
    spans: list[PhonemeSpan] = []
    for index, syllable in enumerate(syllables):
        spans.extend(engine.distribute(syllable, index))
    return PhonemeTimeline(spans=tuple(spans), source=source, frame_rate_hz=frame_rate_hz,
                           melody_present=melody_present, regulator_settings=engine.as_dict())
