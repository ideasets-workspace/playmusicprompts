"""Turkish phoneme-level syllable SEGMENTER — the sourced syllabifier research item TR-GATE requires.

NOTE FOR OTHER AGENTS — READ BEFORE CHANGING THIS FILE
------------------------------------------------------
This module SEGMENTS a post-G2P phoneme sequence into syllables under the three structural
constraints read from S15 (Özçelik, *The Phonology of Turkish*, OUP 2024) THIS session and quoted
verbatim in `data/syllabification.json`. It deliberately does NOT judge coda-cluster wellformedness
and does NOT apply repair processes (epenthesis, shortening, degemination): those live in S15's
chapter-3 BODY, which the archived publisher preview does not carry — a rule written for them here
would be a guessed parameter (MANDATE CLAUSE 4). Callers needing wellformedness receive a named
refusal, never a guess. The nucleus test is PHOIBLE's `syllabic` feature via `FeatureTable`, the
SAME table the functional-load metric measures in — a vowel list here would be the two-lists
construction CLAUSE 23 forbids.

WHY THIS MODULE EXISTS: `per_gate.companion_metrics` refused `syllable_error_rate` with the unlock
condition "a syllabifier built from S15's constraints with a control set proving it can both agree
and disagree with hand-syllabified words". This is that syllabifier; the control set is
`scripts/test_syllabification.py`, whose known answers are S15's OWN worked pair
[ha.jat] / [ha.jaː.ta] (Introduction §1.1).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Mapping, Sequence

from .phonology import FeatureTable, PhonologyError

_PACKAGE_DIR = Path(__file__).resolve().parent
_CONSTRAINTS_RELATIVE = "data/syllabification.json"

#: PHOIBLE feature names used by the segmenter — read from the same table the metric uses.
#: They are module-level names (not inline strings) so the control suite can assert the exact
#: features this module depends on, and a PHOIBLE schema change fails loudly in one place.
NUCLEUS_FEATURE = "syllabic"
LENGTH_FEATURE = "long"


class SyllabificationError(PhonologyError):
    """A segmentation request this module refuses BY NAME rather than serving with a guess."""


@dataclass(frozen=True)
class Syllable:
    """One syllable: onset (0..1 consonants by S15's no-complex-onset fact), nucleus, coda.

    `rhyme_violation` is True when the syllable breaks S15's two-position rhyme ban (long-vowel
    nucleus AND a coda). It is a FLAG, never a repair: the repair process (vowel shortening,
    S15 §3.4.1.1) has conditions the archived preview does not carry, so repairing here would be
    inventing phonology.
    """

    onset: tuple[str, ...]
    nucleus: str
    coda: tuple[str, ...]
    rhyme_violation: bool

    @property
    def phonemes(self) -> tuple[str, ...]:
        return self.onset + (self.nucleus,) + self.coda

    def as_dict(self) -> dict:
        return {
            "onset": list(self.onset),
            "nucleus": self.nucleus,
            "coda": list(self.coda),
            "rhyme_violation": self.rhyme_violation,
        }


class TurkishSyllabifier:
    """Deterministic segmenter over post-G2P phonemes, constraints imported from data (never inline).

    THE ALGORITHM, derived from the three sourced constraints and nothing else:
      1. locate nuclei (PHOIBLE `syllabic` = '+');
      2. a consonant run BETWEEN two nuclei contributes its LAST consonant to the following
         syllable's onset and everything before it to the preceding syllable's coda — this IS
         S15's "no complex onsets on the surface" fact turned into a split rule;
      3. adjacent nuclei split heterosyllabically (S15 §3.4.2.1's own title);
      4. word-initial consonants before the first nucleus form that syllable's onset ONLY if the
         run is a single consonant; a longer initial run is REFUSED, because resolving it requires
         the epenthesis/prothesis repairs (§3.3.2) whose conditions are outside the archived text;
      5. word-final consonants after the last nucleus are that syllable's coda;
      6. a long-vowel nucleus with a coda raises `rhyme_violation` (S15's two-position rhyme ban).
    """

    def __init__(self, features: FeatureTable | None = None,
                 constraints: Mapping | None = None) -> None:
        self._features = features or FeatureTable.load()
        self._constraints = constraints or self._load_constraints()

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_constraints() -> Mapping:
        path = _PACKAGE_DIR / _CONSTRAINTS_RELATIVE
        if not path.exists():
            raise SyllabificationError(
                f"the sourced syllabification constraints are absent at {path}. They carry S15's own "
                f"sentences; segmenting without them would be syllabifying from memory, which is the "
                f"guessed-parameter class (CLAUSE 4)."
            )
        return json.loads(path.read_text(encoding="utf-8"))

    @property
    def constraints(self) -> Mapping:
        return self._constraints

    def _is_nucleus(self, phoneme: str) -> bool:
        if not self._features.has(phoneme):
            raise SyllabificationError(
                f"PHOIBLE carries no feature vector for {phoneme!r}, so its syllabicity cannot be "
                f"MEASURED. Refused rather than guessed — a mis-classed nucleus silently corrupts "
                f"every downstream syllable count."
            )
        return self._features.vector(phoneme).values.get(NUCLEUS_FEATURE) == "+"

    def _is_long(self, phoneme: str) -> bool:
        return self._features.vector(phoneme).values.get(LENGTH_FEATURE) == "+"

    def syllabify_word(self, phonemes: Sequence[str]) -> tuple[Syllable, ...]:
        """Split ONE word's post-G2P phoneme sequence into syllables.

        The input contract (constraint `post_suffixation_input`): phonemes of the COMPLETE word
        form. Raw text is not accepted anywhere in this module — the G2P owns text.
        """
        if not phonemes:
            raise SyllabificationError("an empty phoneme sequence has no syllables; refusing")
        flags = [self._is_nucleus(p) for p in phonemes]
        if not any(flags):
            raise SyllabificationError(
                f"no nucleus in {list(phonemes)!r} — a syllable requires one (PHOIBLE `syllabic` '+'). "
                f"A vowelless token is not a Turkish word form; refusing rather than inventing one."
            )
        nucleus_positions = [i for i, is_nucleus in enumerate(flags) if is_nucleus]

        first = nucleus_positions[0]
        if first > 1:
            raise SyllabificationError(
                f"{list(phonemes)!r} opens with {first} consonants before the first nucleus. S15: "
                f"complex onsets do not surface in Turkish; the REPAIRS (epenthesis/prothesis, "
                f"§3.3.2) have conditions outside the archived preview, so this module refuses "
                f"rather than repairing or serving an unpronounceable split."
            )

        syllables: list[Syllable] = []
        for index, position in enumerate(nucleus_positions):
            onset: tuple[str, ...]
            if index == 0:
                onset = tuple(phonemes[:position])          # 0 or 1 consonants, proven above
            else:
                previous = nucleus_positions[index - 1]
                gap = position - previous - 1
                # The junction rule (constraint `no_complex_onsets`): the LAST consonant of the
                # run opens this syllable; the rest closed the previous one (handled below).
                onset = (phonemes[position - 1],) if gap >= 1 else ()
            if index + 1 < len(nucleus_positions):
                following = nucleus_positions[index + 1]
                # Coda = the run between this nucleus and the next, MINUS the one consonant the
                # next syllable takes as its onset.
                coda = tuple(phonemes[position + 1:following - 1]) if following - position > 1 \
                    else ()
            else:
                coda = tuple(phonemes[position + 1:])
            nucleus = phonemes[position]
            syllables.append(Syllable(
                onset=onset, nucleus=nucleus, coda=coda,
                rhyme_violation=bool(coda) and self._is_long(nucleus),
            ))
        return tuple(syllables)

    def syllable_strings(self, phonemes: Sequence[str]) -> tuple[str, ...]:
        """Each syllable as a space-joined phoneme string — the unit the error rate aligns on."""
        return tuple(" ".join(s.phonemes) for s in self.syllabify_word(phonemes))
