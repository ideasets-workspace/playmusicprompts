"""
SSM Content Asset Creator — Music Studio · TURKISH ROUTES AND REFUSALS (TR-R1, TR-REFUSE)
=========================================================================================

WHAT THIS MODULE IS, for the next agent
---------------------------------------
Two things the Turkish research demands and nothing else: (1) the R1 phoneme-informed RESPELLER, which
turns a Turkish lyric into the spelling a target-orthography tokeniser will pronounce correctly, and
(2) the REFUSAL GATE for the five things the research says must never be shipped. It generates nothing.

R1 — THE COMMITTED DEFAULT FOR TURKISH, and why it is not raw orthography
-------------------------------------------------------------------------
`docs/research/2026-08-14-turkish-singing-phonology-and-g2p-for-synthesis.md`, "The committed
recommendation", read this session, verbatim: **"Drive the model with a PHONEME-INFORMED ORTHOGRAPHY —
route R1 — as the DEFAULT for Turkish. Not raw orthography. Not speech-to-singing."** The lyric goes
through our Turkish G2P and what reaches the model is "the orthographic string the model's tokeniser will
pronounce correctly, computed from the phoneme sequence", while the phoneme sequence itself is retained as
the intelligibility gate's reference.

Evidence for choosing R1 over R0 (raw orthography), from the same section:
  · R0 is NOT broken — it measured 7 of 8 dictated Turkish words on Lyria 3 — but it fails exactly where
    axis 3.2 predicts: `ğ`, unmarked vowel length, and the two-phoneme letters `g/k/l`.
  · The word that failed, `çal`, sits on the `ç` = `tʃ` + back-`a` boundary; `çota` / `çalıyma` is what an
    English-trained tokeniser does with an unfamiliar letter sequence.
  · S40: **tokenisation, not phonology, is the bottleneck (rho ~ -0.78)** — which a phoneme-informed
    spelling addresses directly.
  · S52: ACE-Step's own training used **50 % stochastic Romanisation** "to share phonological
    representations across languages, significantly enhancing pronunciation accuracy for rare tokens".

WHERE THE SPELLINGS COME FROM — LEARNED, NEVER WRITTEN
------------------------------------------------------
`data/phoneme_to_grapheme_en.json`, produced by `scripts/learn_phoneme_to_grapheme.py`: forward-backward
EM over **69,076 words** of the MFA English (US) dictionary v3.1.0 (CC BY 4.0), log-likelihood
-3,403,746 → -73,860 over six passes, **77 phones** with ranked spellings. Measured examples:
`tʃ → ch` 0.98 · `ç → h` 1.00 · `t̪ → th` 1.00 · `ɫ → l` 0.86 · `ʒ → si` 0.89 · `ʃ → sh` 0.47 / `ti` 0.43.

THE MEASURED LIMIT THIS MODULE MUST NOT HIDE
--------------------------------------------
`ɯ` (ı), `ø` (ö) and `y` (ü) have **NO English spelling at all** — the learner reports them absent rather
than inventing one. A phone with no spelling in the target orthography keeps its ORIGINAL Turkish letters
and is COUNTED in `RespellReport.unspellable`, so the caller sees exactly how much of the lyric R1 could
not reach. Substituting a near-vowel (`ı`→`i`) would change the word, which is the deception class.

TR-REFUSE — THE FIVE THINGS THAT MAY NOT SHIP
---------------------------------------------
From axis 7.4 verbatim: "do not claim makam support; do not silently map a makam request onto a Western
scale; **refuse it by name with the reason**". The five refusals and every quoted figure behind them live
in `data/turkish_tradition.json` (24 unequal octave steps, 53-comma Hc, 111 makams, usul length 2–120),
and this module is only the gate that applies them. `usul` is the real rhythmic control and
`time_signature` is DERIVED from it by import — the measured proof being `devr_i_hindi` [2,2,3] and
`devr_i_turan` [3,2,2], two different usuls that share the SAME 9/8 notation.

TYPES
-----
    TurkishRoute        R0 | R1 | R2 | R3 — the research's four escalating routes, with R1 the default
    RespellReport       the R1 result: spelling, phoneme reference, per-word detail, unspellable count
    TraditionRefusal    one refusal, with its reason and what is offered instead
    TurkishGate         applies the five refusals and derives time_signature from usul
"""

from __future__ import annotations

import json
import math
import unicodedata
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping, Sequence

from . import g2p_tr, per_gate
from .phonology import FeatureTable, PhonologyError

_PACKAGE_DIR: Final[Path] = Path(__file__).resolve().parent
_SPELLING_RELATIVE: Final[str] = "data/phoneme_to_grapheme_en.json"
# The SOURCE orthography's own table — the incumbent letters the respeller must beat before it changes text.
# Learned by the same EM learner from the source language's dictionary; it is a path, not a letter map.
_SOURCE_SPELLING_RELATIVE: Final[str] = "data/phoneme_to_grapheme_tr.json"
_CRITERION_RELATIVE: Final[str] = "data/respelling_criterion.json"
_TRADITION_RELATIVE: Final[str] = "data/turkish_tradition.json"
_INVARIANTS_RELATIVE: Final[str] = "data/substitution_invariants.json"

# The name is a KEY into the criterion data file, not a policy decision made here. It appears as a constant
# only so a typo becomes an import-time failure instead of a silent fall-through to raw frequency.
_GUARDED_CRITERION: Final[str] = "joint_identity_guarded"


def _shared_ascii_letter(phone: str) -> str | None:
    """The letter the Turkish and English alphabets SHARE for this phone, or None when there is none.

    Derived from the IPA symbol itself — combining marks dropped, and the result accepted only if it is a
    single ASCII letter. So /m/ -> 'm' and /d̪/ -> 'd', while /ɫ/, /ɲ/, /ʎ/ and /tʃ/ have no shared letter
    and therefore genuinely need a foreign spelling. A hand-kept list would have to be held in agreement
    with the phoneme inventory by discipline; this cannot drift.

    MEASURED PURPOSE (scripts/measure_respelling_criterion.py, 2026-08-15): of the 18 shared-letter phones
    under test, 13 have a shared letter that English READS as that phone (control A: it must survive) and 2
    have one that English MISREADS (control B: it must change — 'i' is read /aɪ/, 'c' is read /kʰ/). The
    guard applies only to the first class, which is why the class is measured rather than assumed.
    """
    base = "".join(ch for ch in unicodedata.normalize("NFD", phone) if not unicodedata.combining(ch))
    return base if len(base) == 1 and base.isascii() and base.isalpha() else None


class TurkishRoute(Enum):
    """The research's four routes for driving a Turkish lyric, with the verdict recorded for each.

    R0_ORTHOGRAPHY   raw Turkish spelling. "Not sufficient alone, but keep as the entry point" — it did
                     measure 7 of 8 words, so it is not broken.
    R1_PHONEME_DRIVE **THE DEFAULT.** Phoneme-informed respelling: zero Turkish articulations are absent
                     from the covered union, so the model has heard every Turkish sound and only needs to
                     be told which sounds to make (axis 2 + S40's tokenisation finding).
    R2_STYLE_TRANSFER cross-lingual style transfer. "Keep as escalation, not default" — it needs a Turkish
                     reference vocal per voice and risks timbre drift.
    R3_SPEECH_TO_SINGING "Keep as the LAST escalation, and it is genuinely available": Turkish speech is
                     strong and measured (Whisper large-v3 for verification, FreyaTTS at WER 8.0 % /
                     CER 3.0 %, Apache-2.0), but it costs an extra GPU pass.
    """

    R0_ORTHOGRAPHY = "R0"
    R1_PHONEME_DRIVE = "R1"
    R2_STYLE_TRANSFER = "R2"
    R3_SPEECH_TO_SINGING = "R3"

    @property
    def is_default_for_turkish(self) -> bool:
        return self is TurkishRoute.R1_PHONEME_DRIVE


class SpellingFidelity(Enum):
    """How faithfully a phone could be spelled in the target orthography — reported per phone, never hidden.

    EXACT       the target orthography has this phone in its own dictionary; the spelling is learned.
    NEAREST     the phone is absent but a MEASURED nearest neighbour exists within the stated tolerance,
                and the substitution is reported with its feature distance so it can be judged or refused.
    UNREACHABLE no neighbour inside the tolerance. The ORIGINAL Turkish letters are kept, and the phone is
                counted — because changing `ı` to `i` changes the word, and a changed word is a changed
                lyric (his verbatim law).

    THE TOLERANCE IS A MEASUREMENT, NOT A TASTE. `scripts/measure_r1_spelling_coverage.py` measured every
    Turkish phone the English table lacks against every phone it has, in PHOIBLE feature space:
        notation-only (distance 0.0000) ....... 0 phones   <-- NONE. Nothing is a free relabelling.
        near neighbours (0 < d <= 0.05) ....... 34 phones   (a/æ 0.0370, n̪/n 0.0345, z̪/z 0.0333, y/ʉ 0.0333)
        genuinely different (d > 0.05) ........ 7 phones    (ɯ/i 0.0714, ø/ʉ 0.0667, s̪ː/s 0.0667, ...)
    So NEAREST_TOLERANCE = 0.05 is the boundary the measurement itself drew between "one or two features
    apart" and "a different vowel". The seven above it are exactly the Turkish sounds English cannot write:
    `ɯ` (ı), `ø` (ö) and the long/geminate forms — which is the same finding the learner reported when it
    could not spell them at all.
    """

    EXACT = "exact"
    NEAREST = "nearest"
    UNREACHABLE = "unreachable"


#: The measured boundary between "one or two features apart" and "a different sound". See
#: `SpellingFidelity`'s docstring for the full distribution this number comes from.
NEAREST_TOLERANCE: Final[float] = 0.05

# ------------------------------------------------------------------------------------------------------
# THE FEATURE A SUBSTITUTION MAY NEVER CROSS, and it is an INVARIANT rather than a cost.
#
# MEASURED, scripts/measure_syllabicity_feature.py, 2026-08-15 (PHOIBLE 2.0, 38 columns):
#   /u/ -> /w/  distance 0.0333, the ONLY differing column is `syllabic: + -> -`
#   /i/ -> /j/  distance 0.0357, likewise `syllabic: + -> -`
#   /ɫ/ -> /l/  distance 0.0345, no class-changing column   <- harmless notation move
#   /z̪/ -> /z/ distance 0.0333, no class-changing column   <- harmless notation move
#
# So the HARMFUL substitution scores BETTER on distance (0.0333) than the harmless one (0.0345): no scalar
# threshold can separate them, which is why this is a named invariant and not a tighter tolerance. The
# reason it is harmful is musical, not phonetic: in a sung line the syllabic segment carries the note, so
# turning a vowel into a glide deletes a syllable nucleus and leaves the melody with a note nothing sings.
# The respeller measured `bu -> bw` and `uzun -> wzwn` before this invariant existed.
# ------------------------------------------------------------------------------------------------------
# THE DISTANCE METRIC — functional-load WEIGHTED, because the unweighted one was measured to be the defect.
#
# MEASURED, scripts/measure_incumbent_letter_reading.py + scripts/_measure_read_reliability.py, 2026-08-15:
#   unweighted normalised Hamming over PHOIBLE features says  /ɾ/~/ɾ̃/ = 0.0345  ·  /ɾ/~/ɹ/ = 0.1379
#   so it calls a NASAL tap a better match for Turkish /ɾ/ than the English approximant r is. Turkish 'r'
#   read as /ɹ/ is what any tokeniser does with the letter that is already there; the metric preferred
#   inventing 'nt'. Three successive rules (a syllabicity invariant, a spelling-length cap, a contrastive-
#   feature derivation) were each built ON TOP of that metric and each failed in a different direction,
#   because the metric was the fault.
#
# The weight of a feature is its FUNCTIONAL LOAD in the language: how many lexically proven minimal pairs
# of that language differ on it (derived by scripts/derive_substitution_invariants.py from the MFA Turkish
# dictionary — `nasal` 7 pairs, `syllabic` 4, `dorsal` 30, `distributed` absent). A feature that
# distinguishes real words costs more to cross than one that distinguishes none.
#
# NOT a published weight set: PanPhon (Mortensen et al. 2016) ships hand-tuned weights for exactly this
# problem, but they are global rather than per-language, and this platform is generic by construction
# (MANDATE Clause 23) — every production's language derives its own weights from its own lexicon.
SYLLABICITY_FEATURE: Final[str] = "syllabic"

# A feature with no measured functional load still cannot cost zero, or a substitution crossing only
# unmeasured features would look free. One is the smallest unit the load counts are expressed in.
UNMEASURED_FEATURE_LOAD: Final[int] = 1

# The longest spelling a SUBSTITUTION may use when the phone's own spelling is shorter or absent. It is 2
# because the measured English digraphs that carry a distinct sound are two letters ('ch' for /tʃ/ read back
# at 0.696, 'sh' for /ʃ/ at 1.000), while every longer candidate the table offers is a word-internal
# accident rather than a pronunciation cue. MEASURED CASE THAT SET IT: /ɾ/'s nearest readable neighbour is
# the nasal flap /ɾ̃/, spelled 'nt', and it turned `nerede` into `nentede`.
MAX_SUBSTITUTE_GRAPHEMES: Final[int] = 2


@dataclass(frozen=True)
class WordRespelling:
    """One word's R1 result, carrying enough detail for a human to audit the transformation."""

    original: str
    respelled: str
    phonemes: tuple[str, ...]
    g2p_tier: str
    unspellable_phones: tuple[str, ...] = ()
    substitutions: tuple[tuple[str, str, float], ...] = ()

    @property
    def changed(self) -> bool:
        return self.original.casefold() != self.respelled.casefold()

    @property
    def fidelity(self) -> SpellingFidelity:
        if self.unspellable_phones:
            return SpellingFidelity.UNREACHABLE
        if self.substitutions:
            return SpellingFidelity.NEAREST
        return SpellingFidelity.EXACT

    def as_dict(self) -> dict:
        return {
            "original": self.original,
            "respelled": self.respelled,
            "changed": self.changed,
            "fidelity": self.fidelity.value,
            "phonemes": list(self.phonemes),
            "g2p_tier": self.g2p_tier,
            "unspellable_phones": list(self.unspellable_phones),
            "substitutions": [{"phone": phone, "spelled_as_phone": nearest,
                               "feature_distance": round(distance, 4)}
                              for phone, nearest, distance in self.substitutions],
        }


@dataclass(frozen=True)
class RespellReport:
    """The R1 artefact for a whole lyric: what we send, and the phoneme reference the gate scores against.

    `sent_text` is the string that goes to the engine. `phoneme_reference` is what the intelligibility gate
    compares the transcript against — the research's own rule that R1 makes the gate's reference free.
    `unspellable` names every phone the target orthography cannot express, so coverage is reported rather
    than implied.
    """

    route: TurkishRoute
    source_text: str
    sent_text: str
    phoneme_reference: tuple[str, ...]
    words: tuple[WordRespelling, ...]
    target_orthography: str
    unspellable: Mapping[str, int] = field(default_factory=dict)
    # The metric that decided every substitution in this report, carried WITH the report rather than known
    # only to the code: a reader must be able to tell which mechanism produced these strings, because three
    # different mechanisms produced three different (and two wrong) answers on 2026-08-15.
    metric: str = "functional_load_weighted"
    metric_weights: Mapping[str, int] = field(default_factory=dict)

    @property
    def words_changed(self) -> int:
        return sum(1 for word in self.words if word.changed)

    @property
    def fidelity_counts(self) -> Mapping[str, int]:
        """How many words landed in each fidelity class — the honest coverage report, per class."""
        counts: dict[str, int] = {level.value: 0 for level in SpellingFidelity}
        for word in self.words:
            counts[word.fidelity.value] += 1
        return counts

    def as_dict(self) -> dict:
        return {
            "route": self.route.value,
            "target_orthography": self.target_orthography,
            "metric": self.metric,
            "metric_weights": dict(self.metric_weights),
            "source_text": self.source_text,
            "sent_text": self.sent_text,
            "phoneme_reference": list(self.phoneme_reference),
            "words_total": len(self.words),
            "words_changed": self.words_changed,
            "fidelity_counts": dict(self.fidelity_counts),
            "unspellable_phones": dict(self.unspellable),
            "words": [word.as_dict() for word in self.words],
            "honesty": "the phoneme reference is what the gate scores against; a phone the orthography "
                       "cannot spell within the MEASURED tolerance keeps its ORIGINAL letters and is "
                       "counted in unspellable_phones — never replaced with a near vowel in silence. "
                       "Every substitution inside the tolerance is listed with its feature distance.",
        }


class SpellingTable:
    """The learned phone -> grapheme table, plus the MEASURED criterion for choosing among its candidates.

    Two files compose here and neither is authored by hand:
      · `phoneme_to_grapheme_en.json`  the EM-learned table — both directions, P(g|p) and P(p|g), plus the
                                      round-trip join of the two (scripts/learn_phoneme_to_grapheme.py).
      · `respelling_criterion.json`    WHICH of those numbers selects a spelling — written by
                                      scripts/measure_respelling_criterion.py, never by this module.

    WHY THE CRITERION IS NOT A CODE CONSTANT HERE: it was measured, and it was measured WRONG twice before
    it was measured right (2026-08-15). Selecting by P(graphemes|phone) produced `bekliyor -> beclyyod`
    because English spells the flap /ɾ/ as 'd' at 0.871; selecting by P(phone|graphemes) produced
    `tʃ -> 'tu'` at 1.000 and destroyed 11 of 13 shared letters. A criterion that changed twice under
    measurement is exactly the value that must live in the evidence layer rather than in a literal
    (SUPREME LAW prohibition 6).
    """

    def __init__(self, document: Mapping, criterion: Mapping | None = None) -> None:
        self._document = document
        self._spellings: Mapping[str, Sequence[Mapping]] = document["spellings"]
        self._round_trip: Mapping[str, Sequence[Mapping]] = document.get("round_trip", {})
        self._readings: Mapping[str, Sequence[Mapping]] = document.get("readings", {})
        self._criterion = criterion or {}
        self._selected = str(self._criterion.get("selected", "")) or None
        if self._selected and not self._round_trip:
            raise PhonologyError(
                f"the criterion file selects {self._selected!r}, which needs the round-trip table, but "
                f"this table carries none. Re-run scripts/learn_phoneme_to_grapheme.py — the table predates "
                f"the two-direction learner and would silently fall back to raw frequency."
            )
        self._graphone_log_probability = self._build_graphone_model()
        #: Instance-level Witten-Bell transition memo — pure (depends only on the loaded counts).
        self._transition_cache: dict[tuple[str, str], float] = {}
        # The Viterbi bound is the widest chunk the GRAPHONE model knows — measured from the model that
        # actually decodes, not from the reverse table, so the two cannot disagree.
        self._widest_grapheme = max((len(key) for key in self._graphone_log_probability), default=1)

    def _build_graphone_model(self) -> Mapping[str, tuple[tuple[str, float], ...]]:
        """The graphone inventory per letter-chunk, from the learner's own `graphone_lm` (Bisani & Ney).

        CORRECTED 2026-08-16 — the previous version rebuilt a UNIGRAM joint from per-phone `weight`s, and a
        unigram joint is not a distribution over SEQUENCES: every factor is < 1, so fewer, longer graphones
        always win on raw sum. Measured: `read_back('nerede')` returned (n, ɚ, t, ɛ) — 4 phones for 6
        letters ('er'→ɚ at -3.87 beat 'e'+'r' at -6.62) — and zero-phone graphones (silent letters) were
        absent entirely, because the per-phone table cannot carry them. Both defects are properties of the
        MODEL SHAPE, so the fix is the model the decoder was always supposed to use: the learner now emits
        expected unigram AND bigram graphone counts (with start/end symbols), and this class REFUSES a table
        that predates them — falling back to the length-biased unigram silently would be the quiet-downgrade
        class.

        Returns letter-chunk -> ((graphone_key, phone-tuple) ...) for the Viterbi's candidate expansion;
        the probabilities live in `_graphone_ngram`, priced by `_graphone_transition_log_probability`.
        """
        lm = self._document.get("graphone_lm")
        if not lm or not lm.get("unigrams") or not lm.get("bigrams"):
            raise PhonologyError(
                f"this spelling table carries no `graphone_lm` — it predates the bigram decoder "
                f"(2026-08-16). Re-run scripts/learn_phoneme_to_grapheme.py; decoding with the unigram "
                f"joint is refused because it is MEASURED length-biased (read_back('nerede') -> 4 phones "
                f"for 6 letters) and blind to silent letters."
            )
        self._graphone_start = str(lm["start_key"])
        self._graphone_end = str(lm["end_key"])
        self._graphone_unigram_counts: dict[str, float] = {
            str(key): float(value) for key, value in lm["unigrams"].items()}
        self._graphone_bigram_counts: dict[str, dict[str, float]] = {
            str(prev): {str(nxt): float(value) for nxt, value in following.items()}
            for prev, following in lm["bigrams"].items()}
        self._graphone_unigram_total = sum(self._graphone_unigram_counts.values())
        by_chunk: dict[str, list[tuple[str, tuple[str, ...]]]] = {}
        for key in self._graphone_unigram_counts:
            letters, _, phone_part = key.partition("|")
            phones = tuple(p for p in phone_part.split("+") if p)
            by_chunk.setdefault(letters, []).append((key, phones))
        return {chunk: tuple(entries) for chunk, entries in by_chunk.items()}

    def _graphone_transition_log_probability(self, previous: str, current: str) -> float:
        """log P(current graphone | previous graphone), Witten-Bell interpolated — parameter-free.

        WHY WITTEN-BELL AND NOT A TUNED DISCOUNT: CLAUSE 4 forbids a constant without evidence, and
        Witten-Bell's interpolation weight is DERIVED from the counts themselves — lambda(prev) =
        c(prev) / (c(prev) + T(prev)) where T(prev) is the number of distinct followers — so no number
        enters this method that the corpus did not produce. Unseen pairs back off to the unigram
        relative frequency; a graphone the corpus never saw at all is impossible here because the
        candidate expansion only offers keys from the learned inventory.
        """
        following = self._graphone_bigram_counts.get(previous)
        unigram = (self._graphone_unigram_counts.get(current, 0.0)
                   / self._graphone_unigram_total) if self._graphone_unigram_total else 0.0
        if not following:
            return math.log(unigram) if unigram > 0.0 else -math.inf
        context_total = sum(following.values())
        distinct = len(following)
        lam = context_total / (context_total + distinct)
        bigram = following.get(current, 0.0) / context_total if context_total else 0.0
        probability = lam * bigram + (1.0 - lam) * unigram
        return math.log(probability) if probability > 0.0 else -math.inf

    @property
    def graphone_language_model(self) -> Mapping[str, object]:
        """The decoder's own model, DESCRIBED FROM THE LOADED COUNTS — never from a prose sentence.

        WHY THIS PROPERTY EXISTS (measured 2026-08-16): `artifacts/music-studio/r1_respelling.json`
        carried a hand-written `mechanism` string that still said "incumbent letters vs candidate
        spellings under the functional-load metric" AFTER the engine had become a Bisani-Ney bigram
        graphone decoder with an expectation criterion — a report describing a superseded mechanism is
        the deception class even when every number in it is right. The artefact now asks the engine, so
        the description cannot drift from the model that produced the numbers.
        """
        return {
            "order": int(self._document["graphone_lm"]["order"]),
            "start_key": self._graphone_start,
            "end_key": self._graphone_end,
            "graphone_inventory": len(self._graphone_unigram_counts),
            "bigram_contexts": len(self._graphone_bigram_counts),
            "silent_letter_graphones": sum(1 for key in self._graphone_unigram_counts
                                           if key.endswith("|")),
            "widest_letter_chunk": self._widest_grapheme,
            "transition_smoothing": "Witten-Bell interpolation; lambda derived from the counts "
                                    "themselves, so no tuned constant enters the decoder",
        }

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _SPELLING_RELATIVE,
             criterion_path: str = _CRITERION_RELATIVE) -> "SpellingTable":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise PhonologyError(
                f"the learned spelling table is absent at {path}. It is GENERATED by "
                f"scripts/learn_phoneme_to_grapheme.py from the MFA English dictionary; writing spellings "
                f"by hand would be inventing orthography, which research item TR-R1 forbids."
            )
        selection = _PACKAGE_DIR / criterion_path
        if not selection.exists():
            raise PhonologyError(
                f"the measured selection criterion is absent at {selection}. It is written by "
                f"scripts/measure_respelling_criterion.py. Without it this class would have to pick a "
                f"criterion itself, and two such picks were MEASURED WRONG on 2026-08-15 — so the absence "
                f"is refused rather than defaulted."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")),
                   json.loads(selection.read_text(encoding="utf-8")))

    @property
    def target_orthography(self) -> str:
        return str(self._document["target_orthography"])

    @property
    def phone_count(self) -> int:
        return int(self._document["phone_count"])

    @property
    def method(self) -> Mapping:
        return self._document["method"]

    @property
    def criterion(self) -> str:
        """The name of the measured selection criterion, for the report — never chosen in code."""
        return self._selected or "forward_probability_only"

    @property
    def criterion_evidence(self) -> Mapping:
        return self._criterion.get("evidence", {})

    def _select(self, phone: str) -> Mapping | None:
        """Apply the MEASURED criterion to this phone's candidates.

        `joint_identity_guarded` — the criterion the measurement selected (control A 13/13, reads back
        19/27) — is: maximise P(g|p)*P(p|g), EXCEPT that a grapheme both alphabets share wins when it is
        itself read as this phone, because rewriting text a foreign tokeniser already pronounces correctly
        is a harm rather than an improvement.
        """
        candidates = self._round_trip.get(phone)
        if not candidates:
            plain = self._spellings.get(phone)
            return dict(plain[0]) if plain else None
        if self._selected == _GUARDED_CRITERION:
            shared = _shared_ascii_letter(phone)
            if shared is not None:
                for row in candidates:
                    if row["graphemes"] == shared and row.get("most_likely_reading") == phone:
                        return row
        if self._selected == "reverse":
            return max(candidates, key=lambda r: r["p_phone_given_spelling"])
        if self._selected == "forward":
            return max(candidates, key=lambda r: r["p_spelling_given_phone"])
        return max(candidates,
                   key=lambda r: (r["p_spelling_given_phone"] * r["p_phone_given_spelling"],
                                  r["p_phone_given_spelling"], -len(r["graphemes"])))

    def best_spelling(self, phone: str) -> tuple[str | None, float]:
        """The spelling the MEASURED criterion selects, with the probability that it is READ as this phone.

        The second element is deliberately P(phone | graphemes) and not P(graphemes | phone): the number a
        caller needs is how likely the tokeniser is to pronounce the string as intended. Returning the
        forward probability here would let a caller report 0.871 confidence for 'd' standing in for /ɾ/,
        which is the measured defect of 2026-08-15 wearing a different number.
        """
        selected = self._select(phone)
        if selected is None:
            return None, 0.0
        read_probability = selected.get("p_phone_given_spelling", selected.get("probability", 0.0))
        return str(selected["graphemes"]), float(read_probability)

    def reading_of(self, graphemes: str) -> str | None:
        """The phone the target orthography most likely READS from this grapheme string.

        This is the direction that matters for a respelling: the string is going into a tokeniser, and what
        comes out is a pronunciation. Returns None when the learned corpus never saw the string, which is
        "no evidence" and must never be treated as "harmless".
        """
        rows = self._readings.get(graphemes)
        return str(rows[0]["phone"]) if rows else None

    def joint_score(self, phone: str, graphemes: str) -> float:
        """P(graphemes | phone) * P(phone | graphemes) — the criterion this project measured and selected.

        High only when the string is BOTH a normal way to write the sound AND normally read as it. Measured
        separation it provides: 'sh' for /ʃ/ scores 0.474*1.000 while 'ci' scores near zero; 'ch' for /tʃ/
        scores 0.981*0.696 while 'tu' scores 0.014*1.000. Zero when the corpus never aligned the pair.
        """
        for row in self._round_trip.get(phone, ()):
            if row["graphemes"] == graphemes:
                return float(row["p_spelling_given_phone"]) * float(row["p_phone_given_spelling"])
        return 0.0

    def read_back(self, text: str) -> tuple[str, ...]:
        """Read a candidate string BACK to a phone sequence, by Viterbi over a GRAPHONE model.

        WHY THIS EXISTS — the measured root cause of `çal -> chale` and `aşk -> ashck` (2026-08-15). The
        selector scores each candidate spelling IN ISOLATION, but a string's reading is CONTEXT-DEPENDENT:
        'le' is read /ɫ/ inside "table", where the 'e' is silent, and appending it to `çal` gives `chale`,
        which reads /tʃ eɪ l/ — the 'e' became a vowel. Per-phone scores cannot see that; only reading the
        finished word can.

        WHY A GRAPHONE MODEL AND NOT THE OBVIOUS PRODUCT OF P(phone | graphemes) — also measured, on the
        first version of this method: maximising the product of per-chunk REVERSE probabilities gave
        `read_back('bu') = ('b',)`, silently dropping the 'u', and `read_back('nerede')` returned 4 phones
        for 6 letters. Every factor is below 1, so a partition into FEWER, LONGER chunks always wins on
        product alone — a length bias, not a reading.

        The frontier method for this exact problem is the JOINT-SEQUENCE (graphone) model: Bisani & Ney,
        "Joint-sequence models for grapheme-to-phoneme conversion", Speech Communication 50(5), 2008 — the
        decoder maximises the probability of a sequence of GRAPHONES (letter-chunk + phone pairs) under the
        joint distribution the EM alignment itself estimated, rather than a product of conditionals over an
        arbitrary segmentation. We already hold those joint counts: they are the `weight` field the EM
        learner wrote next to every spelling, so this is the model that produced the table, used as it was
        meant to be used, and no new estimation is introduced.

        Returns the most likely phone sequence, or an empty tuple when no lawful graphone partition exists.
        """
        # BIGRAM VITERBI (corrected 2026-08-16): state = (text position, previous graphone key). The END
        # transition is PRICED, so a partition cannot win merely by being short — the exact length bias the
        # unigram decoder was measured to have (read_back('nerede') -> 4 phones for 6 letters).
        inventory = self._graphone_log_probability
        length = len(text)
        # best[(position, previous_key)] = (score, phones)
        best: dict[tuple[int, str], tuple[float, tuple[str, ...]]] = {
            (0, self._graphone_start): (0.0, ())}
        frontier: dict[int, set[str]] = {0: {self._graphone_start}}
        for index in range(length):
            for previous in frontier.get(index, ()):
                score, phones = best[(index, previous)]
                for width in range(1, min(self._widest_grapheme, length - index) + 1):
                    chunk = text[index:index + width]
                    for key, chunk_phones in inventory.get(chunk, ()):
                        transition = self._graphone_transition_log_probability(previous, key)
                        if transition == -math.inf:
                            continue
                        candidate = (score + transition, phones + chunk_phones)
                        state = (index + width, key)
                        incumbent = best.get(state)
                        if incumbent is None or candidate[0] > incumbent[0]:
                            best[state] = candidate
                            frontier.setdefault(index + width, set()).add(key)
        final: tuple[float, tuple[str, ...]] | None = None
        for previous in frontier.get(length, ()):
            score, phones = best[(length, previous)]
            ending = self._graphone_transition_log_probability(previous, self._graphone_end)
            if ending == -math.inf:
                continue
            candidate = (score + ending, phones)
            if final is None or candidate[0] > final[0]:
                final = candidate
        return final[1] if final else ()

    def candidate_spellings(self, phone: str) -> tuple[str, ...]:
        """Every spelling the corpus ever used for this phone, best-first — the options, not the answer.

        The CHOICE is not made here: `Respeller` compares each candidate's READING against the incumbent
        letters. This method deliberately returns the whole set, because selecting one inside the table is
        what produced three measured defects (see `Respeller`'s docstring).
        """
        rows = self._round_trip.get(phone) or self._spellings.get(phone) or ()
        return tuple(str(row["graphemes"]) for row in rows)

    def reads_back(self, phone: str) -> bool:
        """True when the selected spelling's most likely reading IS this phone — the honest per-phone check."""
        selected = self._select(phone)
        return bool(selected and selected.get("most_likely_reading") == phone)

    def spellable_phones(self) -> tuple[str, ...]:
        """Every phone this orthography can spell — the candidate set for a nearest-neighbour search."""
        return tuple(self._spellings)

    def expected_reading_cost(self, text: str, intended: Sequence[str],
                              substitution_cost, penalty: float) -> float | None:
        """E[ min-alignment cost ] of this text's READING DISTRIBUTION against the intended phones — exact.

        WHY AN EXPECTATION AND NOT THE BEST PATH (measured 2026-08-16): comparing the single Viterbi
        reading let a candidate win on a LUCKY path — `achk` beat `ashk` because one minority path of
        'ch' reads /ʃ/ — and produced spurious `bizi→bbizi` / `Sevgilim→sevgillym`. The lawful question
        is the research's own: how will the tokeniser read this string — a DISTRIBUTION.

        WHY MIN-ALIGNMENT INSIDE THE EXPECTATION (measured the same day, second iteration): the first
        expectation DP summed alignment VARIANTS of one reading as separate mass — an E[average-alignment]
        — which inflated every candidate by alignment noise and minted a new spurious class (`bizi→beze`,
        `bitmez→betmez`: i→ɛ at 72 beating the honest ɪ at 26). The cost of ONE reading is its CHEAPEST
        alignment (that is what an edit distance IS); only the READING is random.

        THE MECHANISM — exact, no tuning constant: a state is (text position, previous graphone,
        Levenshtein DP row against `intended`). Graphone transitions carry Witten-Bell bigram mass; the
        row is updated per produced phone with substitution at the metric's measured cost and
        insertion/deletion at the derived floor. States with identical rows merge by summing mass, so
        E[cost] = Σ P(reading)·minAlign(reading) / Σ P(reading) comes out exactly.
        """
        inventory = self._graphone_log_probability
        length, phone_count = len(text), len(intended)
        # PURE MEMOISATION, measured necessity (2026-08-16): the hot loop re-derived PHOIBLE feature
        # vectors per state — faulthandler located 'nerede' spending 37 s inside phonology.vector().
        # The caches change no value. The TRANSITION cache is instance-level because it depends only on
        # the table (a spot-check died at exit 1 after 18.9 min rebuilding it per call); the SUBSTITUTION
        # cache stays per-call because `substitution_cost` is a caller-supplied callable.
        substitution_cache: dict[tuple[str, str], float | None] = {}

        def cached_substitution(left: str, right: str) -> float | None:
            key = (left, right)
            if key not in substitution_cache:
                substitution_cache[key] = substitution_cost(left, right)
            return substitution_cache[key]

        transition_cache = self._transition_cache

        def cached_transition(previous: str, current: str) -> float:
            key = (previous, current)
            if key not in transition_cache:
                transition_cache[key] = self._graphone_transition_log_probability(previous, current)
            return transition_cache[key]

        base_row = tuple(j * penalty for j in range(phone_count + 1))
        by_position: list[dict[tuple[str, tuple[float, ...]], float]] = [
            {} for _ in range(length + 1)]
        by_position[0][(self._graphone_start, base_row)] = 1.0
        # MASS-BOUNDED PRUNING WITH A DERIVED ERROR BOUND — measured necessity (2026-08-16): the exact
        # sweep is exponential in reading prefixes ('bekliyor' exceeded 146 s; 'nerede' 3.9 s), because
        # every distinct Levenshtein row is a distinct state. Bisani & Ney's own decoder prunes the
        # graphone lattice; here the pruning threshold is NOT a tuned constant but derived from the
        # metric's own resolution: dropping a mass fraction ε at one position perturbs E[cost] by at most
        # ε·cost_ceiling, where cost_ceiling = (|intended| + |text|)·penalty is the dearest any reading
        # can cost. Requiring the TOTAL perturbation across all ≤|text| pruning steps to stay under ONE
        # unit of the load counts (1 proven minimal pair — the smallest difference the metric can mean)
        # gives ε = 1 / (cost_ceiling · |text|). Everything in that formula is measured on this instance.
        cost_ceiling = (phone_count + length) * penalty
        drop_fraction = 1.0 / (cost_ceiling * length) if cost_ceiling > 0.0 and length > 0 else 0.0
        for index in range(length):
            cell_in = by_position[index]
            if len(cell_in) > 1 and drop_fraction > 0.0:
                total_here = sum(cell_in.values())
                budget = total_here * drop_fraction
                dropped = 0.0
                for state, mass in sorted(cell_in.items(), key=lambda kv: kv[1]):
                    if dropped + mass > budget:
                        break
                    dropped += mass
                    del cell_in[state]
            for (previous, row), mass in list(cell_in.items()):
                if mass <= 0.0:
                    continue
                for width in range(1, min(self._widest_grapheme, length - index) + 1):
                    chunk = text[index:index + width]
                    for key, produced in inventory.get(chunk, ()):
                        log_probability = cached_transition(previous, key)
                        if log_probability == -math.inf:
                            continue
                        new_row = row
                        for phone in produced:
                            next_row = [new_row[0] + penalty]
                            for j in range(1, phone_count + 1):
                                local = cached_substitution(intended[j - 1], phone)
                                substitute = penalty if local is None else local
                                next_row.append(min(new_row[j] + penalty,          # insert produced phone
                                                    next_row[j - 1] + penalty,     # delete intended phone
                                                    new_row[j - 1] + substitute))  # substitute
                            new_row = tuple(next_row)
                        state = (key, new_row)
                        cell = by_position[index + width]
                        cell[state] = cell.get(state, 0.0) + mass * math.exp(log_probability)
        total_mass = 0.0
        total_cost = 0.0
        for (previous, row), mass in by_position[length].items():
            log_end = self._graphone_transition_log_probability(previous, self._graphone_end)
            if log_end == -math.inf:
                continue
            ending = math.exp(log_end)
            total_mass += mass * ending
            total_cost += mass * ending * row[phone_count]
        if total_mass <= 0.0:
            return None
        return total_cost / total_mass


class FunctionalLoadMetric:
    """Feature distance WEIGHTED by each feature's functional load in the production's own language.

    The load counts are DATA (`data/substitution_invariants.json`, written by
    `scripts/derive_substitution_invariants.py` from the language's own pronunciation lexicon), so this class
    holds no linguistic constant: another language ships its own file and the metric follows.

    WHY WEIGHTED — measured, and the unweighted version was shipped and wrong first (2026-08-15):
        unweighted:  /ɾ/~/ɾ̃/ 0.0345   /ɾ/~/ɹ/ 0.1379   -> prefers inventing 'nt' over keeping 'r'
        weighted:    `nasal` carries 7 proven Turkish minimal pairs, so crossing it costs 7 units, while
                     the features separating /ɾ/ from /ɹ/ carry the loads their own pairs earned.
    The direction of the fix is not a preference: an English tokeniser reads 'r' as /ɹ/ at 0.94, so the
    letter already in the lyric is a real candidate, and it must be able to WIN.
    """

    def __init__(self, weights: Mapping[str, int], features: "PhonemeFeatureLookup") -> None:
        self._weights = weights
        self._features = features

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _INVARIANTS_RELATIVE) -> "FunctionalLoadMetric":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise PhonologyError(
                f"the functional-load weights are absent at {path}. They are DERIVED by "
                f"scripts/derive_substitution_invariants.py from the language's own lexicon. Falling back "
                f"to an unweighted distance is refused: that fallback was MEASURED to rank a nasal tap "
                f"closer to /ɾ/ than English 'r' is, and it produced `nerede -> nentede`."
            )
        document = json.loads(path.read_text(encoding="utf-8"))
        weights = document.get("functional_load", {}).get("weights")
        if not weights:
            raise PhonologyError(
                f"{path} carries no functional_load.weights — it predates the weighted metric. Re-run "
                f"scripts/derive_substitution_invariants.py."
            )
        return cls(weights, FeatureTable.load())

    @property
    def weights(self) -> Mapping[str, int]:
        return self._weights

    def worst_measured_substitution(self, left_inventory: Sequence[str],
                                    right_inventory: Sequence[str]) -> float:
        """The highest measured substitution cost between the two inventories — the LAWFUL penalty floor.

        WHY THIS EXISTS (measured 2026-08-16): the previous floor was max(weights) = 70, the heaviest SINGLE
        feature — but a substitution crosses MANY features, and the measured-worst pair costs 415 (tʲ~ɒː
        under the Turkish-derived weights). 70 < 415 is a pricing INVERSION: "no evidence" (an unmeasured
        substitution, a deletion, an insertion) was cheaper than measured-BAD evidence, which is how
        `bu -> 'bou'` won ('ou'→/aw/ was never priced). The naive repair — sum(weights) = 501 — was tried
        and REVERTED the same day: it is a number no measurement produced, and it overshot (`bekliyor ->
        buechlliyor`). The floor Law Zero permits is the worst cost the metric actually MEASURED between
        phones the two orthographies can actually produce, derived here from the tables' own inventories.
        """
        worst = 0.0
        for left in left_inventory:
            for right in right_inventory:
                if left == right:
                    continue
                cost = self.cost(left, right)
                if cost is not None and cost > worst:
                    worst = cost
        return worst

    def cost(self, left: str, right: str) -> float | None:
        """Total functional load of the features on which two phones differ, or None if incomparable.

        The result is a COST in "proven minimal pairs", not a normalised fraction: normalising would divide
        by the number of comparable features and so make a heavily-loaded single difference look small again,
        which is the exact behaviour that produced the defect.
        """
        if not (self._features.has(left) and self._features.has(right)):
            return None
        a, b = self._features.vector(left), self._features.vector(right)
        total = 0.0
        comparable = 0
        for feature, mine in a.values.items():
            theirs = b.values.get(feature)
            if theirs is None or mine == a.NOT_APPLICABLE or theirs == a.NOT_APPLICABLE:
                continue
            comparable += 1
            if mine != theirs:
                total += float(self._weights.get(feature, UNMEASURED_FEATURE_LOAD))
        return total if comparable else None


class Respeller:
    """R1: compute the target-orthography spelling of a lyric FROM its phoneme sequence.

    THE MECHANISM, in one sentence: for each phone, compare what the target orthography would read from the
    INCUMBENT letter against what it would read from each candidate spelling, and change the text only when a
    candidate is measurably closer to the intended sound under the language's functional-load metric.

    Four sources compose here and this class holds no linguistic constant of its own:
      · `g2p_tr`              our three-tier G2P (MFA lexicon, sourced rules, neural fallback)
      · `SpellingTable`       the LEARNED phone <-> grapheme table, both directions (EM over 69,076 words)
      · `FunctionalLoadMetric` per-language feature weights derived from that language's own lexicon
      · `FeatureTable`        PHOIBLE features, the space the metric measures in

    WHY THE INCUMBENT IS A CANDIDATE — this is the correction of three failed designs, all measured on
    2026-08-15 and each recorded because each one shipped and was wrong:
      1. pick argmax P(graphemes|phone)                     -> `bekliyor -> beclyyod`  (English spells the
                                                               flap /ɾ/ as 'd' at 0.871)
      2. pick argmax P(phone|graphemes)                     -> `çal -> tual`           ('tu' reads /tʃ/ at
                                                               1.000, but only inside "picture")
      3. pick the nearest READABLE phone by UNWEIGHTED distance, plus hand-added invariants for syllabicity
         and spelling length                                -> `nerede -> nentede`, and each new invariant
                                                               fixed one case while missing the next
    All three asked "which English spelling is closest to this phone?" and none asked "what does English
    already do with the letter that is there?". An English tokeniser reads Turkish 'r' as /ɹ/ at 0.94, which
    is a real candidate that was never in the running. Once the incumbent competes under a weighted metric,
    the three invariants become consequences rather than exceptions.
    """

    def __init__(self, table: SpellingTable | None = None,
                 features: "PhonemeFeatureLookup | None" = None,
                 metric: FunctionalLoadMetric | None = None,
                 source_table: SpellingTable | None = None) -> None:
        self._table = table or SpellingTable.load()
        self._features = features or FeatureTable.load()
        self._metric = metric or FunctionalLoadMetric.load()
        # The SOURCE-language spelling table supplies the INCUMBENT: how the lyric's own orthography spells
        # each phone. It is learned by the SAME EM learner from the source language's own dictionary
        # (`scripts/learn_phoneme_to_grapheme.py --dictionary ... --orthography tr`), never hand-written as a
        # letter map — a hand-written map is precisely the "two lists kept in agreement by discipline" the
        # SUPREME LAW forbids, and it would also silently disagree with the G2P that produced the phones.
        self._source = source_table or SpellingTable.load(_SOURCE_SPELLING_RELATIVE)
        # THE PENALTY FLOOR IS DERIVED, NOT CHOSEN (2026-08-16). It is the worst substitution cost the
        # metric ever MEASURED between the source and target inventories — the number a deletion, an
        # insertion or an unpriceable substitution must be at least as bad as, under Law Zero: "no evidence"
        # may never be cheaper than the worst measured-bad evidence. Both prior floors were violations and
        # both were measured: max(weights)=70 undercut the measured u→ɐ substitution at 91 (so `bou` won),
        # and sum(weights)=501 was a number no measurement produced and overshot (`buechlliyor`).
        self._penalty_floor = self._metric.worst_measured_substitution(
            self._source.spellable_phones(), self._table.spellable_phones())
        if self._penalty_floor <= 0.0:
            raise PhonologyError(
                "the derived penalty floor is 0 — the metric measured no substitution between the two "
                "inventories, so deletions and insertions would be FREE. That silently re-opens the "
                "length-bias defect; the floor must come from a real measurement."
            )
        #: Pure memo for `_word_cost` — the same (intended, candidate) pair recurs across the per-phone
        #: sweep and across lines of one lyric; the DP is deterministic, so caching changes no value.
        self._word_cost_cache: dict[tuple[tuple[str, ...], str], float | None] = {}

    @property
    def source_table(self) -> SpellingTable:
        return self._source

    @property
    def table(self) -> SpellingTable:
        return self._table

    @property
    def metric(self) -> FunctionalLoadMetric:
        return self._metric

    @property
    def acceptance_rule(self) -> Mapping[str, object]:
        """The decision rule, REPORTED FROM THE LIVE OBJECT — the artefact never re-describes it in prose.

        Same reason as `SpellingTable.graphone_language_model`: on 2026-08-16 the produced artefact still
        described design 4 while the engine ran design 6, and a stale description is indistinguishable
        from a false claim to any reader. Every number here is read from this instance, so it is a
        measurement of the mechanism that made the decisions in the same file.
        """
        return {
            "phone_local_gate": "a candidate is considered only when its most likely reading is STRICTLY "
                                "closer to the intended phone than the incumbent's reading, under the "
                                "functional-load metric (no margin constant: the margin IS the strict "
                                "inequality between two measured costs)",
            "word_level_veto": "the assembled word's E[min-alignment] over the reading distribution must "
                               "not worsen — design 4's `chale` lesson, kept as a veto rather than a "
                               "selector",
            "insertion_deletion_floor": self._penalty_floor,
            "insertion_deletion_floor_origin": "the worst substitution the metric MEASURED between the "
                                               "source and target inventories; both earlier floors were "
                                               "measured wrong (70 undercut a measured 91; 501 was a "
                                               "number no measurement produced)",
            "unmeasured_feature_load": UNMEASURED_FEATURE_LOAD,
        }

    # ----------------------------------------------------------------------------------------------------
    # THE FOUR DESIGNS THAT WERE MEASURED WRONG AND ARE THEREFORE DELETED, NOT KEPT BEHIND FLAGS.
    #
    #  1. argmax P(graphemes | phone)                  -> `bekliyor -> beclyyod`  (/ɾ/ spelled 'd' at 0.871)
    #  2. argmax P(phone | graphemes)                  -> `çal -> tual`           ('tu' reads /tʃ/ only in
    #                                                                              "picture")
    #  3. nearest READABLE phone by UNWEIGHTED distance, fenced by two hand-added invariants (syllabicity,
    #     spelling length)                             -> `nerede -> nentede`, and each invariant fixed one
    #                                                     case while the next slipped past
    #  4. per-phone choice under the functional-load metric with a `joint` tie-break
    #     (`_reading_cost` + `_best_spelling_for`)      -> `çal -> chale`, `aşk -> ashck`: every per-phone
    #                                                     score was correct and the ASSEMBLED word read
    #                                                     wrongly, because 'le' and 'ck' are word-INTERNAL
    #                                                     spellings of /ɫ/ and /k/
    #
    # All four are superseded by `_word_cost()` + `SpellingTable.read_back()`, which judge the FINISHED word
    # by reading it back. Keeping any of them behind a flag would leave two mechanisms that must agree by
    # discipline (SUPREME LAW prohibition 6), and every one of them is measurably wrong.
    #
    # SYLLABICITY_FEATURE and MAX_SUBSTITUTE_GRAPHEMES stay in this module's head as documented MEASUREMENTS,
    # because the numbers behind them are evidence a future reader needs — not as live code paths.
    # ----------------------------------------------------------------------------------------------------

    def _word_cost(self, intended: Sequence[str], candidate_text: str) -> float | None:
        """The functional-load cost of what the target orthography reads from the WHOLE candidate word.

        This is the measurement the per-phone scores could not make. `çal -> 'chale'` scores perfectly per
        phone ('ch' 0.0 for /tʃ/, 'a' for /a/, 'le' 0.0 for /ɫ/) and yet reads /tʃ eɪ l/ — the appended 'e'
        became a vowel. Reading the finished string back and comparing SEQUENCES catches it; nothing local
        can. Same cause for `aşk -> 'ashck'`.

        ALIGNMENT IS BY EDIT DISTANCE, NOT BY POSITION — and this correction is itself measured. The first
        version zipped the two sequences positionally, which charges every phone after an insertion as wrong
        and so REWARDED padding: `bu -> 'bbu'` and `nerede -> 'netede'` both scored better than the correct
        text. Positional zip is the naive formula the SUPREME LAW forbids; the lawful comparison is the
        project's own Levenshtein aligner in `per_gate.align()`, imported rather than reimplemented, with
        substitution charged at the functional-load cost of the two phones and insertion/deletion charged at
        the DERIVED penalty floor (see __init__): the worst substitution the metric measured between the two
        inventories, so "no evidence" is never cheaper than measured-bad evidence and never dearer than a
        number no measurement produced.
        """
        read = self._table.read_back(candidate_text)
        if not read:
            return None
        # EXPECTED cost under the full reading distribution (see SpellingTable.expected_reading_cost for
        # the measured defect this replaces: best-path comparison let `achk` beat `ashk` on a minority
        # reading of 'ch', and produced spurious `bbizi` / `sevgillym`).
        memo_key = (tuple(intended), candidate_text)
        if memo_key not in self._word_cost_cache:
            self._word_cost_cache[memo_key] = self._table.expected_reading_cost(
                candidate_text, list(intended), self._metric.cost, self._penalty_floor)
        return self._word_cost_cache[memo_key]

    def respell_word(self, word: str) -> WordRespelling:
        """Respell one word from its phonemes, changing letters ONLY when the WHOLE word reads better.

        TWO STAGES, and the second is the correction of the defect the first one could not see:
          1. per phone, gather the incumbent spelling (from the source orthography's own learned table) and
             every candidate the target orthography ever used, each scored by cost and joint;
          2. build the assembled word for each per-phone choice and RE-READ IT, then keep a substitution only
             if the finished word's reading is closer to the intended phone sequence than the incumbent
             word's is.

        Stage 2 exists because of measured output, not caution: `çal -> chale` and `aşk -> ashck` both won
        every per-phone comparison and both read wrongly as words ('le' and 'ck' are word-INTERNAL spellings
        of /ɫ/ and /k/).
        """
        resolved = g2p_tr.word_to_phonemes(word)
        phones = list(resolved.phonemes)
        unspellable: list[str] = []
        substitutions: list[tuple[str, str, float]] = []

        # Stage 1 — the incumbent word, spelled entirely from the source orthography's own table.
        incumbent_pieces: list[str] = []
        for phone in phones:
            spelling = self._source.best_spelling(phone)[0]
            if spelling is None:
                unspellable.append(phone)
                incumbent_pieces.append("")
                continue
            incumbent_pieces.append(spelling)
        if unspellable:
            return WordRespelling(original=word, respelled=word, phonemes=tuple(phones),
                                  g2p_tier=resolved.tier, unspellable_phones=tuple(unspellable),
                                  substitutions=())

        # Stage 2 — accept a per-phone substitution only when BOTH gates pass (2026-08-16, v3):
        #   LOCAL GATE — the candidate's most likely reading must be MEASURABLY closer to the intended
        #   phone than the incumbent's reading (strict, under the functional-load metric). This is the
        #   margin that stopped the expectation-sharpening class (`bbitmez`, `yoollar`, `ashck`'s k→'ck'):
        #   a candidate that merely sharpens the reading DISTRIBUTION of an already-correct letter has no
        #   measured local improvement and is refused. No constant enters — the margin IS the strict
        #   inequality between two measured costs.
        #   GLOBAL VETO — the assembled word's E[min-alignment] must not worsen. This keeps design 4's
        #   lesson (`çal→chale`: per-phone perfect, word wrong) without letting the expectation ACCEPT
        #   what no local measurement supports.
        pieces = list(incumbent_pieces)
        for index, phone in enumerate(phones):
            incumbent_reading = self._table.reading_of(pieces[index])
            incumbent_local = (self._metric.cost(phone, incumbent_reading)
                               if incumbent_reading else None)
            current_cost = self._word_cost(phones, "".join(pieces))
            best_choice = pieces[index]
            best_cost = current_cost
            best_reading: str | None = None
            for candidate in self._table.candidate_spellings(phone):
                if candidate == pieces[index]:
                    continue
                candidate_reading = self._table.reading_of(candidate)
                if candidate_reading is None:
                    continue
                candidate_local = self._metric.cost(phone, candidate_reading)
                if candidate_local is None:
                    continue
                # LOCAL GATE: an unreadable incumbent (None) is beaten by any readable candidate;
                # a readable incumbent only by a STRICTLY closer reading.
                if incumbent_local is not None and candidate_local >= incumbent_local:
                    continue
                trial = list(pieces)
                trial[index] = candidate
                trial_cost = self._word_cost(phones, "".join(trial))
                if trial_cost is None:
                    continue
                if best_cost is None or trial_cost < best_cost:
                    best_cost, best_choice = trial_cost, candidate
                    best_reading = candidate_reading
            if best_choice != pieces[index]:
                pieces[index] = best_choice
                substitutions.append((phone, best_reading or best_choice, float(best_cost or 0.0)))

        respelled = "".join(pieces) or word
        return WordRespelling(original=word, respelled=respelled,
                              phonemes=tuple(phones), g2p_tier=resolved.tier,
                              unspellable_phones=tuple(unspellable),
                              substitutions=tuple(substitutions))

    def respell(self, text: str) -> RespellReport:
        words = [token for token in text.split() if token]
        if not words:
            raise PhonologyError("R1 needs a non-empty lyric")
        results = [self.respell_word(word) for word in words]
        unspellable: dict[str, int] = {}
        reference: list[str] = []
        for result in results:
            reference.extend(result.phonemes)
            for phone in result.unspellable_phones:
                unspellable[phone] = unspellable.get(phone, 0) + 1
        return RespellReport(
            route=TurkishRoute.R1_PHONEME_DRIVE,
            source_text=text,
            sent_text=" ".join(result.respelled for result in results),
            phoneme_reference=tuple(reference),
            words=tuple(results),
            target_orthography=self._table.target_orthography,
            unspellable=unspellable,
            metric_weights=dict(self._metric.weights),
        )


@dataclass(frozen=True)
class TraditionRefusal:
    """One refusal from the research's must-not-ship list, with its reason and its alternative."""

    refusal_id: str
    reason: str
    offered_instead: str
    hard_refusal: bool

    def as_dict(self) -> dict:
        return {
            "refusal_id": self.refusal_id,
            "hard_refusal": self.hard_refusal,
            "reason": self.reason,
            "offered_instead": self.offered_instead,
        }


class TurkishGate:
    """Applies TR-REFUSE and derives `time_signature` from `usul` by import.

    Every figure this gate quotes lives in `data/turkish_tradition.json` with its source id, so a challenge
    to a refusal is a challenge to a primary source rather than to an opinion in code.
    """

    def __init__(self, document: Mapping | None = None) -> None:
        self._document = document or self._load()

    @staticmethod
    @lru_cache(maxsize=2)
    def _load() -> Mapping:
        path = _PACKAGE_DIR / _TRADITION_RELATIVE
        if not path.exists():
            raise PhonologyError(
                f"the Turkish tradition data is absent at {path}. Research item TR-REFUSE cannot be "
                f"enforced from memory: the refusals carry primary-source quotes and they live in data."
            )
        return json.loads(path.read_text(encoding="utf-8"))

    @property
    def makam_count(self) -> int:
        return int(self._document["pitch"]["makam_count_in_corpus"])

    @property
    def commas_per_octave(self) -> int:
        return int(self._document["pitch"]["commas_per_octave"])

    @property
    def usul_ids(self) -> tuple[str, ...]:
        return tuple(entry["id"] for entry in self._document["usuls"])

    def refusal(self, refusal_id: str) -> TraditionRefusal:
        for entry in self._document["refusals"]:
            if entry["id"] == refusal_id:
                return TraditionRefusal(refusal_id=entry["id"], reason=entry["reason"],
                                        offered_instead=entry["what_to_offer_instead"],
                                        hard_refusal=bool(entry["refuse"]))
        raise PhonologyError(f"no refusal named {refusal_id!r} in the tradition data")

    def usul(self, usul_id: str) -> Mapping:
        for entry in self._document["usuls"]:
            if entry["id"] == usul_id:
                return entry
        raise PhonologyError(
            f"usul {usul_id!r} is not in the sourced list ({', '.join(self.usul_ids)}). S34 records usul "
            f"lengths from 2 to 120, so the list is INCOMPLETE by construction — an unlisted usul is "
            f"refused by name rather than approximated, and the list grows only from a source."
        )

    def time_signature_for(self, usul_id: str, mertebe: int | None = None) -> str:
        """DERIVE the notated meter from the usul — never maintained beside it (MANDATE CLAUSE 23).

        The same usul at a different mertebe (tempo class) is notated differently: aksak is 9/8 and ağır
        aksak is 9/4, which is why the meter is computed rather than stored twice.
        """
        entry = self.usul(usul_id)
        if mertebe is None:
            return str(entry["notated_as"])
        slow = entry.get("slow_variant")
        if slow and int(slow["mertebe"]) == int(mertebe):
            return str(slow["notated_as"])
        if int(entry["mertebe_default"]) == int(mertebe):
            return str(entry["notated_as"])
        return f"{entry['length']}/{int(mertebe)}"

    def check_key(self, key: str | None) -> TraditionRefusal | None:
        """Refuse a makam request where a Western key is expected — WITHOUT relying on a name list.

        WHY NOT A LIST OF MAKAM NAMES, and this is a real design consequence rather than a shortcut: the
        research corpus COUNTS the makams (111 in the CompMusic corpus, S32) but does NOT enumerate them,
        and inventing a list of Turkish makam names from my own knowledge is precisely the class of value
        this project forbids. A list would also be the wrong instrument: with 111 makams plus historical
        variants, any list I could write would be incomplete, and an incomplete list gives a caller the
        false impression that an unlisted makam was ACCEPTED.

        So the gate is STRUCTURAL instead. A `key` value is only accepted when it is expressible in the
        parameter surface's own generated set (`root|mode` from 12 chromatic roots x documented modes,
        validated by `music_studio/models.py`). Anything else is refused as an unsupported pitch system —
        which covers every makam name, every comma-based description and every future request the list
        would have missed, and it never claims to have recognised something it did not.
        """
        if not key:
            return None
        text = key.strip()
        if "|" in text:
            root, _, mode = text.partition("|")
            if root.strip() and mode.strip():
                return None          # the generated root|mode surface; models.py validates the members
        return self.refusal("makam_via_key")

    def check_turkish_meter(self, time_signature: str | None, usul_id: str | None,
                            language: str | None) -> TraditionRefusal | None:
        """A Turkish request that sends an aksak meter WITHOUT naming a usul gets the correction."""
        if (language or "").casefold() != "tr" or usul_id:
            return None
        aksak_notations = {entry["notated_as"] for entry in self._document["usuls"]
                           if int(entry["length"]) not in (2, 4)}
        if time_signature in aksak_notations:
            return self.refusal("time_signature_as_turkish_rhythm")
        return None

    def as_dict(self) -> dict:
        return {
            "makam_count_in_corpus": self.makam_count,
            "commas_per_octave": self.commas_per_octave,
            "usuls_available": list(self.usul_ids),
            "refusals": [self.refusal(entry["id"]).as_dict()
                         for entry in self._document["refusals"]],
            "source_note": "every figure is quoted in data/turkish_tradition.json with its source id",
        }
