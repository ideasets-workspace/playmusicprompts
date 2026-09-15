"""Research item A10, control 4 — the vocable exemption: words an ASR deletes whatever we do.

WHY THIS IS A MEASUREMENT PROBLEM AND NOT A COURTESY
----------------------------------------------------
S17 (arXiv:2506.15514, read [FULL] this session) measures that **over half** of non-lexical vocables and
backing vocals are deleted by Whisper *"regardless of separation quality"*, and that *"the high values
observed even with vocal stems indicate that this issue cannot be resolved by improved source separation."*
So counting them as lyric errors measures the ASR's shortcoming and reports it as bad singing: a song full
of "ooh"s would score as unintelligible while being sung exactly as written.

THE FRONTIER'S OWN ANSWER IS TO DISAGGREGATE, NOT TO DELETE. S17 verbatim: *"Counting the number of
deletions where the reference words are nonlexical vocables D_NL and backing vocals D_BV, we define
DR_NL = D_NL/N and DR_BV = D_BV/N to disaggregate the deletion rate by reference word type."* This module
follows that exactly: the exempt words are REPORTED with their own rates and are removed only from the
PASS/FAIL decision. Dropping them from the report would hide how much of a song is vocables, which is a
number a producer needs.

TWO HONEST LIMITS, BOTH LOAD-BEARING
------------------------------------
1. **Turkish is `NOT_SOURCED`.** No source for Turkish non-lexical vocables exists in this project's corpus
   (the 102,700 B Turkish phonology report has no mention of vocables — grepped this session) and none was
   researched. Writing one from my own knowledge would be invented vocabulary. So for Turkish the exemption
   reports UNAVAILABLE, Turkish vocables still count as errors, and **the Turkish PER is therefore
   PESSIMISTIC by an unmeasured amount** — said here so no one reads a Turkish number as final.
2. **Backing vocals can only ever be deleted.** An ASR does not emit parentheses, so a parenthesised word
   cannot appear as a hit. That asymmetry is S17's too, and it is why the rate is disaggregated rather than
   compared against the hypothesis.

The word lists live in `data/vocable_exemption.json` with their sources; this module holds none.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping, Sequence

_PACKAGE_DIR: Final[Path] = Path(__file__).resolve().parent
_EXEMPTION_RELATIVE: Final[str] = "data/vocable_exemption.json"

#: The explicit tag a user may write around a word to declare it a vocable themselves. OUR convention, and
#: labelled as ours in the data file: S17's datasets needed MANUAL vocable annotation precisely because no
#: lexicon is complete, so a lyric author must be able to state it.
_TAG_PATTERN: Final[re.Pattern[str]] = re.compile(r"\[v\](.+?)\[/v\]", re.IGNORECASE | re.DOTALL)
#: The delimiters themselves, stripped from tokens so markup never enters the word count. Measured defect,
#: 2026-08-15: without this, `[v]aman[/v]` produced three tokens — 'v', 'aman', '/v' — and the two delimiters
#: were classified as LEAD LYRICS, inflating the lead denominator with markup on every tagged line.
_TAG_DELIMITER_PATTERN: Final[re.Pattern[str]] = re.compile(r"\[/?v\]", re.IGNORECASE)
#: Parentheses mark backing vocals — an industry lyrics-transcription convention, not our heuristic
#: (S17: "It is common practice... to enclose them in parentheses to distinguish them from the lead vocals").
_PARENTHESES_PATTERN: Final[re.Pattern[str]] = re.compile(r"\(([^()]*)\)")


class ExemptionError(Exception):
    """A fault in the exemption layer that must stop the measurement rather than silently exempt nothing."""


class WordClass(Enum):
    """What a reference word is, for the purpose of the intelligibility decision."""

    LEAD_LYRIC = "LEAD_LYRIC"
    NON_LEXICAL_VOCABLE = "NON_LEXICAL_VOCABLE"
    BACKING_VOCAL = "BACKING_VOCAL"

    @property
    def is_exempt(self) -> bool:
        """Exempt from the PASS/FAIL decision — NEVER from the report."""
        return self is not WordClass.LEAD_LYRIC


class LexiconState(Enum):
    """Whether a language's vocable lexicon rests on a source. Reported, never hidden."""

    SOURCED = "SOURCED"
    NOT_SOURCED = "NOT_SOURCED"


class NegativeControl(Enum):
    """A10's four controls, NAMED IN CODE so a caller can ask which ones a measurement actually satisfied.

    A10 verbatim: *"four negative controls that must each be able to FAIL: human PASSES, instrumental yields
    no words, wrong lyric FAILS, and non-lexical vocables do NOT count as lyric failure"*.

    They live here as an enum rather than only in a test file because the ENGINE must be able to report its
    own control state on a delivery. A control that exists only in a script cannot be cited by a response
    payload, and a claim of "gated" that no field can substantiate is the class of claim this project bans.
    """

    HUMAN_PASSES = "C1_human_passes"
    INSTRUMENTAL_NO_WORDS = "C2_instrumental_no_words"
    WRONG_LYRIC_FAILS = "C3_wrong_lyric_fails"
    VOCABLES_NOT_FAILURE = "C4_vocables_not_failure"


class ControlState(Enum):
    """Whether a control is BUILT, only PARTIAL, or not built. Reported per control, never blended."""

    BUILT = "BUILT"
    PARTIAL = "PARTIAL"
    UNBUILT = "UNBUILT"


@dataclass(frozen=True)
class NegativeControlState:
    """One control's state with the evidence for it and, when partial, exactly what is missing."""

    control: NegativeControl
    state: ControlState
    mechanism: str
    evidence: str
    missing: str | None = None

    def as_dict(self) -> dict:
        return {"control": self.control.value, "state": self.state.value,
                "mechanism": self.mechanism, "evidence": self.evidence, "missing": self.missing}


def negative_control_states(document: Mapping) -> tuple[NegativeControlState, ...]:
    """A10's per-control state, read from the evidence file — never asserted from code.

    The file records `buildable_at_zero_cost` and `implemented_by` per control, and C1 carries the reason it
    cannot be satisfied here. This function projects that data; it does not decide it, so the engine cannot
    claim a control the evidence layer does not support.
    """
    entries = document.get("the_four_negative_controls")
    if not entries:
        raise ExemptionError(
            f"{_EXEMPTION_RELATIVE} does not list the_four_negative_controls, so A10's state cannot be "
            f"reported. An unreported control state would let a delivery imply gating nobody verified."
        )
    states: list[NegativeControlState] = []
    for entry in entries:
        control = NegativeControl(entry["id"])
        buildable = bool(entry.get("buildable_at_zero_cost"))
        states.append(NegativeControlState(
            control=control,
            state=ControlState.BUILT if buildable else ControlState.PARTIAL,
            mechanism=str(entry.get("implemented_by") or entry.get("why", "")),
            evidence=str(entry.get("requirement", "")),
            missing=None if buildable else str(entry.get("why", "")),
        ))
    if len(states) != len(NegativeControl):
        raise ExemptionError(
            f"{_EXEMPTION_RELATIVE} describes {len(states)} controls but A10 requires "
            f"{len(NegativeControl)}. A missing control would silently read as satisfied."
        )
    return tuple(states)


@dataclass(frozen=True)
class ClassifiedWord:
    """One reference word with its class and the reason that class was assigned."""

    surface: str
    normalised: str
    word_class: WordClass
    reason: str

    def as_dict(self) -> dict:
        return {"surface": self.surface, "normalised": self.normalised,
                "class": self.word_class.value, "reason": self.reason}


@dataclass(frozen=True)
class ExemptionReport:
    """The per-word classification of a reference lyric, with S17's disaggregated denominators.

    `lead_word_count` is the denominator the PASS/FAIL decision uses. `total_word_count` is the denominator
    the REPORT uses. Keeping both is the whole point: a PER computed over lead words only, presented without
    saying how many words were exempted, would be a different measurement wearing the same name.
    """

    words: tuple[ClassifiedWord, ...]
    language: str
    lexicon_state: LexiconState
    lexicon_note: str

    @property
    def total_word_count(self) -> int:
        return len(self.words)

    @property
    def lead_words(self) -> tuple[ClassifiedWord, ...]:
        return tuple(word for word in self.words if word.word_class is WordClass.LEAD_LYRIC)

    @property
    def lead_word_count(self) -> int:
        return len(self.lead_words)

    @property
    def vocable_count(self) -> int:
        return sum(1 for word in self.words if word.word_class is WordClass.NON_LEXICAL_VOCABLE)

    @property
    def backing_count(self) -> int:
        return sum(1 for word in self.words if word.word_class is WordClass.BACKING_VOCAL)

    @property
    def exempt_ratio(self) -> float:
        """Share of the reference that is exempt. A high value is a WARNING, not a pass."""
        return 0.0 if not self.words else (self.total_word_count - self.lead_word_count) / self.total_word_count

    def assert_scorable(self) -> None:
        """Refuse a lyric with no lead words instead of scoring a vocable-only reference.

        A reference that is entirely "ooh"s has NOTHING to measure intelligibility against: every word is
        exempt, the lead denominator is zero, and a PER over zero words is undefined rather than perfect.
        """
        if not self.words:
            raise ExemptionError("the reference lyric is empty; there is nothing to classify.")
        if self.lead_word_count == 0:
            raise ExemptionError(
                f"every one of the {self.total_word_count} reference words is exempt "
                f"({self.vocable_count} vocables, {self.backing_count} backing). There are no lead lyrics to "
                f"measure, so intelligibility is UNDEFINED here — not 0.0 and not a pass. Report "
                f"NO_LEAD_LYRIC."
            )

    def as_dict(self) -> dict:
        return {
            "research_item": "A10 control 4",
            "language": self.language,
            "lexicon_state": self.lexicon_state.value,
            "lexicon_note": self.lexicon_note,
            "total_word_count": self.total_word_count,
            "lead_word_count": self.lead_word_count,
            "vocable_count": self.vocable_count,
            "backing_count": self.backing_count,
            "exempt_ratio": round(self.exempt_ratio, 4),
            "denominator_rule": "PASS/FAIL uses lead_word_count; the report uses total_word_count. S17 "
                                "disaggregates (DR_NL, DR_BV) rather than deleting the words.",
            "words": [word.as_dict() for word in self.words],
        }


class VocableLexicon:
    """The per-language vocable lists and the backing-vocal convention, loaded from the evidence file."""

    def __init__(self, document: Mapping) -> None:
        self._document = document
        vocables = document.get("non_lexical_vocables")
        backing = document.get("backing_vocals")
        if not vocables or not backing:
            raise ExemptionError(
                f"{_EXEMPTION_RELATIVE} must describe BOTH non_lexical_vocables and backing_vocals; S17 "
                f"measures the two deletion classes separately (DR_NL and DR_BV) and so must we."
            )
        self._per_language: Mapping[str, Mapping] = vocables.get("per_language", {})
        if not self._per_language:
            raise ExemptionError(f"{_EXEMPTION_RELATIVE} lists no languages at all.")
        self._normalisation = vocables.get("normalisation", {})
        self._backing = backing

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _EXEMPTION_RELATIVE) -> "VocableLexicon":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise ExemptionError(
                f"the vocable-exemption evidence file is absent at {path}. It carries the word lists WITH "
                f"their sources and the per-language sourced/not-sourced state; without it this module would "
                f"have to carry a word list of its own, which is the invented-vocabulary class."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")))

    @property
    def languages(self) -> tuple[str, ...]:
        return tuple(self._per_language)

    def state(self, language: str) -> LexiconState:
        entry = self._per_language.get(language)
        if entry is None:
            raise ExemptionError(
                f"{language!r} is not described in {_EXEMPTION_RELATIVE}. An undescribed language would "
                f"silently exempt nothing, which reads as 'this language has no vocables' — a claim nobody "
                f"measured. Add the language with its state, even if that state is NOT_SOURCED."
            )
        return LexiconState(entry["state"])

    def words(self, language: str) -> frozenset[str]:
        self.state(language)
        return frozenset(str(word).lower() for word in self._per_language[language].get("words", ()))

    def note(self, language: str) -> str:
        entry = self._per_language[language]
        if LexiconState(entry["state"]) is LexiconState.NOT_SOURCED:
            return (f"{language}: NOT_SOURCED — {entry.get('why_empty', '')} "
                    f"CONSEQUENCE: {entry.get('consequence', '')}")
        return (f"{language}: SOURCED for {entry.get('sourced_subset')} "
                f"({entry.get('sourced_subset_evidence', '')}). "
                f"HONESTY: {entry.get('unsourced_extension_honesty', '')}")

    @property
    def collapse_elongation(self) -> bool:
        """Whether repeated vowels are collapsed before lookup — sourced, not a convenience.

        S17: vocables are "often inconsistently annotated, using variable numbers of vowels to emphasize
        syllable length", so 'ooooh' and 'ooh' are the same vocable and must match the same entry.
        """
        return "vowel" in str(self._normalisation.get("elongation", "")).lower()

    @property
    def backing_convention(self) -> str:
        return str(self._backing.get("detection", ""))

    def negative_controls(self) -> tuple[NegativeControlState, ...]:
        """A10's four control states, projected from this lexicon's own evidence document.

        Exposed on the lexicon because the lexicon is what a caller already holds when it classifies a lyric:
        the exemption and its control state travel together, so a report cannot carry one without the other.
        """
        return negative_control_states(self._document)


class ExemptionClassifier:
    """Classifies each reference word as lead lyric, vocable or backing vocal.

    The lexicon is injected so the classifier is testable without disk, and so a caller can supply Berk's own
    Turkish list (his list would be authority) without editing this module.
    """

    def __init__(self, lexicon: VocableLexicon | None = None) -> None:
        self._lexicon = lexicon or VocableLexicon.load()

    @property
    def lexicon(self) -> VocableLexicon:
        return self._lexicon

    def _normalise(self, word: str) -> str:
        """Lower-case, strip punctuation, and collapse elongation when the evidence file says to.

        Case-insensitivity follows alt-eval's case-insensitive WER convention (S14/S16); the elongation
        collapse follows S17's finding about inconsistent vowel counts.
        """
        folded = unicodedata.normalize("NFC", word).lower()
        stripped = "".join(character for character in folded
                           if character.isalpha() or character in "'’-")
        if not self._lexicon.collapse_elongation or not stripped:
            return stripped
        collapsed: list[str] = []
        for character in stripped:
            if collapsed and character == collapsed[-1] and character in "aeiouâîûöüıéè":
                continue
            collapsed.append(character)
        return "".join(collapsed)

    def classify(self, lyric: str, language: str) -> ExemptionReport:
        """Classify every word of a reference lyric. Order and surface forms are preserved for the report."""
        if not isinstance(lyric, str):
            raise ExemptionError(f"the lyric must be text, got {type(lyric).__name__}.")
        state = self._lexicon.state(language)
        vocables = self._lexicon.words(language)

        # Spans first: parentheses mark backing vocals, [v]…[/v] marks an explicitly declared vocable. Both
        # are recorded as CHARACTER RANGES so a word's class is decided by where it sits, not by re-parsing.
        backing_spans = [match.span(1) for match in _PARENTHESES_PATTERN.finditer(lyric)]
        tagged_spans = [match.span(1) for match in _TAG_PATTERN.finditer(lyric)]

        def inside(start: int, end: int, spans: Sequence[tuple[int, int]]) -> bool:
            """True when the token OVERLAPS a marked span.

            Overlap, not "the first character is inside": the token `[v]aman[/v]` STARTS on `[`, which sits
            OUTSIDE the tag's inner span, so a start-position test classified it as a lead lyric. Measured
            2026-08-15, after the delimiter-stripping fix moved the defect rather than removing it — the
            second version of the same bug, which is why the test is now about overlap.
            """
            return any(start < span_end and end > span_start for span_start, span_end in spans)

        words: list[ClassifiedWord] = []
        for match in re.finditer(r"[^\s()]+", lyric):
            surface = match.group(0)
            # The tag DELIMITERS are markup, not lyrics. Measured defect, 2026-08-15: tokenising on
            # `[^\s()\[\]]+` split `[v]aman[/v]` into 'v', 'aman', '/v' and classified the two delimiters as
            # LEAD LYRICS — inflating the lead denominator with markup, which lowers the PER of every tagged
            # line. Delimiters are stripped from the token stream here rather than filtered by their surface
            # text, so a delimiter can never reach the report as a word.
            cleaned = _TAG_DELIMITER_PATTERN.sub("", surface)
            normalised = self._normalise(cleaned)
            if not normalised:
                continue
            start, end = match.span()
            if inside(start, end, tagged_spans):
                words.append(ClassifiedWord(cleaned, normalised, WordClass.NON_LEXICAL_VOCABLE,
                                            "declared by the author with [v]…[/v]"))
            elif inside(start, end, backing_spans):
                words.append(ClassifiedWord(cleaned, normalised, WordClass.BACKING_VOCAL,
                                            f"inside parentheses ({self._lexicon.backing_convention}) — "
                                            f"S17: industry convention for backing vocals"))
            elif normalised in vocables:
                words.append(ClassifiedWord(cleaned, normalised, WordClass.NON_LEXICAL_VOCABLE,
                                            f"in the {language} vocable lexicon ({state.value})"))
            else:
                words.append(ClassifiedWord(cleaned, normalised, WordClass.LEAD_LYRIC, "lead lyric"))

        return ExemptionReport(words=tuple(words), language=language, lexicon_state=state,
                               lexicon_note=self._lexicon.note(language))
