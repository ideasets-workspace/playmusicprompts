"""
SSM Content Asset Creator — Music Studio · PHONOLOGY LAYER (research items A1, A2, A4)
=====================================================================================

WHAT THIS MODULE IS, for the next agent
---------------------------------------
The typed phonology layer the cross-lingual singing research requires. It turns a phoneme sequence into
the representations an engine can actually be driven with, and it computes how much of a language's
inventory the engine has plausibly heard. It performs NO generation and holds NO vendor knowledge.

WHICH RESEARCH ITEMS IT IMPLEMENTS, and the measurement behind each
-------------------------------------------------------------------
`docs/research/2026-08-14-cross-lingual-singing-voice-synthesis-frontier.md`, section "The mechanism,
element by element", read this session; the item ids are the ones
`music_studio/data/research_application_ledger.json` tracks:

  A1  THE PHONEME LAYER IS COMPOSITIONAL, NOT ATOMIC. Every phone is carried as BASE SYMBOL + DIACRITIC
      SET rather than as one opaque token, so a phone the engine never saw is still reachable through
      parts it did see. Measured basis (S05, `[FULL]`): the only paper that directly tests an unseen
      language in SINGING reports Mandarin PER 35.64 % -> 22.77 %, p<0.001, from exactly this
      representation. THE DIRECTION OF THE SPLIT IS `[UNVERIFIED]` (open question X1), so BOTH encodings
      are implemented behind one flag — `PhonemeEncoding` — and OUR OWN measurement chooses. Shipping
      only one of them would be choosing on a guess.

  A2  COVERAGE IS COMPUTED, NEVER ASSERTED. A language's expected quality is predicted by how much of
      its inventory the engine's trained inventory contains — not by whether a vendor lists the language.
      Measured basis: the 69-phone x 9-language table in
      `docs/research/2026-08-14-turkish-singing-phonology-and-g2p-for-synthesis.md` section 2.2, parsed
      into `data/turkish_phoneme_inventory.json` by `scripts/extract_turkish_phoneme_table.py` (69 rows,
      9 columns, 3 genuinely absent phones — all three length-only).

  A4  NEVER PHONEME-ONLY. A phoneme sequence without pitch/melody conditioning collapses musicality:
      S06 measures phoneme-only RPA at 0.0667 and Audiobox CE 4.17 versus 6.97 for the combined
      condition. `PhonemeDrivePlan.assert_melody_present()` refuses to emit a phoneme-driven request that
      carries no melodic conditioning, and the refusal names the measurement.

WHAT IS DELIBERATELY NOT HERE
-----------------------------
  · No thresholds. A bar belongs to the gate and must be CALIBRATED (A9); a number invented here would
    be the guessed-0.08 defect this project has already paid for.
  · No vendor field names. Whether a route accepts a phoneme string is a measured capability recorded in
    the parameter spec, never assumed by this module.
  · No language-specific rules. Those are DATA (`g2p_tr.py` holds the Turkish tiers; the inventory is a
    data file), because a language is DATA and never engine code (MANDATE CLAUSE 23).

TYPES
-----
    PhonemeEncoding        merged | split — the X1 flag, both implemented
    PresenceState          how a language's inventory contains a phone (present / length-only / other
                           convention / absent), read from the research table's own legend
    Phone                  one phone: merged form, base, diacritics, length
    PhonemeInventory       a language's inventory, loaded from the extracted data file
    CoverageScore          the A2 prediction for one language, with its counts and its honest label
    PhonemeDrivePlan       a phoneme sequence prepared for an engine, with the A4 guard
"""

from __future__ import annotations

import json
import unicodedata
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import ClassVar, Final, Iterable, Mapping, Sequence

_PACKAGE_DIR: Final[Path] = Path(__file__).resolve().parent
_INVENTORY_RELATIVE: Final[str] = "data/turkish_phoneme_inventory.json"
_FEATURES_RELATIVE: Final[str] = "data/phoible_segment_features.json"
_CONVENTION_RELATIVE: Final[str] = "data/symbol_convention_map.json"

#: MODIFIER LETTER TRIANGULAR COLON — the IPA length mark. Named as a constant because a bare "\u02d0"
#: inside a comparison is exactly the unexplained literal this project forbids.
LENGTH_MARK: Final[str] = "\u02d0"


class PhonologyError(ValueError):
    """Raised when the phonology layer cannot proceed. Never returns a default instead."""


class PhonemeEncoding(Enum):
    """The representations of a phone sequence. THREE, because two of them were measured insufficient.

    MERGED    each phone is one token in NFC form (`t̪`, `aː`). What most tokenizers were trained on.
    SPLIT     ORTHOGRAPHIC split: base codepoint plus its combining marks (`t` + BRIDGE BELOW). Honest but
              PARTIAL — measured this session: only 5 of the 39 codepoints in the Turkish inventory carry
              a `WITH <modification>` Unicode name, so `ɫ` and `ʎ` do not decompose at all under Unicode.
    FEATURE   ARTICULATORY split: the phone plus its PHOIBLE positive features. This is what S05's
              mechanism actually requires — the transferable unit is the articulatory property, not the
              glyph — and it works for every one of the 3,142 segments PHOIBLE covers.

    X1 (the open question) asks which direction of splitting wins. All three are implemented so OUR OWN
    measurement answers it; shipping one of them alone would be answering it with a guess.
    """

    MERGED = "merged"
    SPLIT = "split"
    FEATURE = "feature"


class PresenceState(Enum):
    """How a language's inventory contains a Turkish phone — the research table's own four states.

    PRESENT                  the phone appears in that inventory as read in the research session.
    PRESENT_WITHOUT_LENGTH   the plain articulation exists; the geminate does not (`len` in the table).
    PRESENT_OTHER_CONVENTION the same articulation under a different diacritic convention (`art`).
    ABSENT                   not present.

    The distinction matters for A2: counting `len` as full coverage would overstate the prediction, and
    counting it as absence would understate it, so both counts are reported separately and never blended.
    """

    PRESENT = "present"
    PRESENT_WITHOUT_LENGTH = "present_without_length"
    PRESENT_OTHER_CONVENTION = "present_other_convention"
    ABSENT = "absent"


@dataclass(frozen=True)
class Phone:
    """One phone, decomposed so the A1 layer can address its parts.

    `merged` is the NFC form an engine sees as a single token; `base` is the phone without its combining
    marks; `diacritics` are the Unicode NAMES of those marks, because a name survives a font, an editor
    and a copy-paste in a way a raw combining character does not.
    """

    merged: str
    base: str
    diacritics: tuple[str, ...]
    is_long: bool
    turkish_letters: str = ""
    presence_by_language: Mapping[str, PresenceState] = field(default_factory=dict)
    in_covered_union: bool = True

    @classmethod
    def from_symbol(cls, symbol: str) -> "Phone":
        """Decompose an arbitrary IPA symbol. Used for phones outside the loaded inventory."""
        decomposed = unicodedata.normalize("NFD", symbol)
        base = "".join(ch for ch in decomposed
                       if not unicodedata.combining(ch) and ch != LENGTH_MARK)
        marks = tuple(unicodedata.name(ch) for ch in decomposed
                      if unicodedata.combining(ch) or ch == LENGTH_MARK)
        return cls(merged=unicodedata.normalize("NFC", symbol),
                   base=unicodedata.normalize("NFC", base),
                   diacritics=marks,
                   is_long=LENGTH_MARK in symbol)

    def tokens(self, encoding: PhonemeEncoding) -> tuple[str, ...]:
        """This phone as engine tokens under the requested encoding (A1's both-encodings rule).

        MEASURED LIMIT OF THE UNICODE ROUTE, and the reason `feature_tokens()` exists beside this method:
        Unicode NFD is an ORTHOGRAPHIC decomposition, not an articulatory one. Measured this session over
        the 39 distinct codepoints in the Turkish inventory, only **5** carry a `WITH <modification>`
        Unicode name (`ɨ`, `ɫ`, `ɲ`, `ø`, `ɾ`); `ɫ` (dark l) and `ʎ` (palatal lateral) are single
        codepoints that S05's method must still be able to reach through shared parts, and `tʃ` is two
        letters that must stay ONE unit (the paper keeps diphthongs and affricates whole deliberately).
        So this method gives the ORTHOGRAPHIC split — useful, honest, and clearly not the whole mechanism
        — and the articulatory split comes from PHOIBLE features via `feature_tokens()`.
        """
        if encoding is PhonemeEncoding.MERGED:
            return (self.merged,)
        return (self.base, *self.diacritics)

    def feature_tokens(self, table: "FeatureTable") -> tuple[str, ...]:
        """The ARTICULATORY decomposition S05 actually specifies: base symbol + SIGNED feature tokens.

        S05's mechanism, quoted from the depth record read this session: "IPA phonemes are DECOMPOSED into
        a base letter and its diacritics, embedded SEPARATELY, and combined by element-wise addition — so
        aspiration `[ʰ]` learned on `[p]` and `[t]` transfers to an unseen `[kʰ]`". Element-wise addition
        over a distinctive-feature vector requires the SIGN: `-nasal` is as much a shared property as
        `+coronal`, and a phonological feature is defined by its VALUE, not by its presence.

        MEASURED, and it is why this emits signed tokens rather than positives only: the first version of
        this method emitted `+feature` tokens alone, and the control caught that `p` and `t` then shared
        exactly ONE token — the transfer mechanism collapsed. With signed tokens the same pair shares
        **25 of 29** (`p`/`k`: 25 of 29; `ɫ`/`l`: 28 of 33). PHOIBLE's `0` (not applicable to this segment
        class) is EXCLUDED, because "this feature does not apply to either of us" is not a shared
        property and counting it would make every consonant resemble every vowel.

        A phone absent from PHOIBLE returns its merged form with an explicit marker rather than a bare
        symbol, so a gap is visible instead of looking like a successful decomposition.
        """
        if not table.has(self.merged):
            return (self.merged, "FEATURES_UNAVAILABLE")
        vector = table.vector(self.merged)
        signed = tuple(f"{value}{name}" for name, value in vector.values.items()
                       if value in {"+", "-"})
        return (self.merged, *signed)


@dataclass(frozen=True)
class CoverageScore:
    """The A2 prediction for one language against a reference inventory.

    THREE NUMBERS, NEVER ONE, because they answer different questions and blending them would hide the
    length-only class the research measured separately:
        `present_ratio`          phones the inventory contains outright
        `inclusive_ratio`        plus those present under another convention or without length
        `absent`                 phones genuinely missing

    `label` is the honest state this score licenses. It is deliberately NOT a pass/fail: a coverage score
    PREDICTS expected quality and never substitutes for a measured PER (A9). Calling a prediction a
    verdict is the class of claim this project forbids.
    """

    language: str
    reference_language: str
    total_phones: int
    present: int
    partial: int
    absent: int

    @property
    def present_ratio(self) -> float:
        return self.present / self.total_phones if self.total_phones else 0.0

    @property
    def inclusive_ratio(self) -> float:
        return ((self.present + self.partial) / self.total_phones) if self.total_phones else 0.0

    @property
    def label(self) -> str:
        return (f"predicted from inventory overlap only — {self.present}/{self.total_phones} phones "
                f"present, {self.partial} partial, {self.absent} absent; NOT a measured intelligibility "
                f"result (A9 requires a calibrated per-language PER)")

    def as_dict(self) -> dict:
        return {
            "language": self.language,
            "reference_language": self.reference_language,
            "total_phones": self.total_phones,
            "present": self.present,
            "partial": self.partial,
            "absent": self.absent,
            "present_ratio": round(self.present_ratio, 4),
            "inclusive_ratio": round(self.inclusive_ratio, 4),
            "is_measurement": False,
            "label": self.label,
        }


class PhonemeInventory:
    """A language's phone inventory, loaded from the extracted research table.

    The inventory is DATA produced by `scripts/extract_turkish_phoneme_table.py`, which PARSES the
    research document rather than transcribing it. This class only reads it — so a change to the
    linguistics is a change to the document, then a re-run of the extractor, and never an edit here.
    """

    def __init__(self, document: Mapping) -> None:
        self._document = document
        self._phones: tuple[Phone, ...] = tuple(
            Phone(
                merged=entry["merged"],
                base=entry["base"],
                diacritics=tuple(entry["diacritics"]),
                is_long=entry["is_long"],
                turkish_letters=entry.get("turkish_letters", ""),
                presence_by_language={
                    language: PresenceState(state)
                    for language, state in entry["presence_by_language"].items()
                },
                in_covered_union=entry["in_covered_union"],
            )
            for entry in document["phones"]
        )

    @classmethod
    @lru_cache(maxsize=4)
    def load(cls, relative_path: str = _INVENTORY_RELATIVE) -> "PhonemeInventory":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise PhonologyError(
                f"the phoneme inventory is absent at {path}. It is GENERATED from the research document "
                f"by scripts/extract_turkish_phoneme_table.py — run that, do not hand-write this file."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")))

    @property
    def language(self) -> str:
        return str(self._document["language"])

    @property
    def phones(self) -> tuple[Phone, ...]:
        return self._phones

    @property
    def covered_languages(self) -> tuple[str, ...]:
        return tuple(self._document["covered_languages"])

    @property
    def absent_from_union(self) -> tuple[str, ...]:
        """The phones NO covered language contains — the honest limit, surfaced rather than hidden."""
        return tuple(self._document["absent_from_union"])

    @property
    def provenance(self) -> Mapping:
        return self._document["generated_from"]

    def coverage_for(self, engine_language: str) -> CoverageScore:
        """Compute A2 for one engine-trained language against this inventory."""
        if engine_language not in self.covered_languages:
            raise PhonologyError(
                f"{engine_language!r} is not one of the languages the research table measured "
                f"({', '.join(self.covered_languages)}). A coverage score for an unmeasured language "
                f"would be an invention, so it is refused rather than estimated."
            )
        present = partial = absent = 0
        for phone in self._phones:
            state = phone.presence_by_language[engine_language]
            if state is PresenceState.PRESENT:
                present += 1
            elif state is PresenceState.ABSENT:
                absent += 1
            else:
                partial += 1
        return CoverageScore(language=self.language, reference_language=engine_language,
                             total_phones=len(self._phones), present=present, partial=partial,
                             absent=absent)

    def union_coverage(self) -> CoverageScore:
        """Coverage against the UNION of every measured language — the number A2 actually predicts from.

        The union is what matters because a multilingual engine has heard all of them: a phone present in
        any one covered language has been heard. The research's own answer section states the union
        lacks exactly three phones, and the extraction control asserts that same set.
        """
        present = partial = absent = 0
        for phone in self._phones:
            states = set(phone.presence_by_language.values())
            if PresenceState.PRESENT in states:
                present += 1
            elif states - {PresenceState.ABSENT}:
                partial += 1
            else:
                absent += 1
        return CoverageScore(language=self.language, reference_language="union",
                             total_phones=len(self._phones), present=present, partial=partial,
                             absent=absent)

    def phone_for(self, symbol: str) -> Phone:
        """The inventory's own Phone for a symbol, or a decomposed one if the inventory lacks it."""
        for phone in self._phones:
            if phone.merged == symbol:
                return phone
        return Phone.from_symbol(symbol)


@dataclass(frozen=True)
class FeatureVector:
    """One segment's PHOIBLE distinctive-feature vector, as the values PHOIBLE itself records.

    A value is not a plain boolean and pretending otherwise would falsify the source: PHOIBLE uses `+`,
    `-`, `0` (not applicable to this segment class) and comma-joined multi-values where it records a
    genuine within-segment contrast (measured this session: 2,332 cells read `-,+`). `distance_to()`
    therefore compares per feature with those states treated explicitly, and it REPORTS how many features
    were comparable rather than silently averaging over the ones that were not.
    """

    segment: str
    values: Mapping[str, str]

    #: PHOIBLE's own value legend, measured from the file rather than assumed. Kept here as the single
    #: place the semantics of a cell are defined for every consumer of this class.
    NOT_APPLICABLE: ClassVar[str] = "0"

    def distance_to(self, other: "FeatureVector") -> tuple[int, int]:
        """Return (differing features, comparable features).

        A feature is comparable only when BOTH segments have a defined value for it — a `0` means the
        feature does not apply to that segment class, so counting it as agreement would make every
        consonant look similar to every vowel in the dimensions neither uses.
        """
        differing = comparable = 0
        for feature, mine in self.values.items():
            theirs = other.values.get(feature)
            if theirs is None or mine == self.NOT_APPLICABLE or theirs == self.NOT_APPLICABLE:
                continue
            comparable += 1
            if mine != theirs:
                differing += 1
        return differing, comparable

    def normalised_distance_to(self, other: "FeatureVector") -> float | None:
        """Differing features as a fraction of comparable ones, or None when nothing is comparable."""
        differing, comparable = self.distance_to(other)
        return (differing / comparable) if comparable else None


class FeatureTable:
    """PHOIBLE 2.0 segment features plus the reference inventories, loaded from the extracted data file.

    MEASURED FACTS ABOUT THIS TABLE, from `scripts/extract_phoible_features.py` this session, so no
    downstream claim rests on a remembered number:
        105,484 language-phoneme rows read · 3,142 unique segments · 38 feature columns
        (the 2.0 release announcement states 3,183 segments and the singing research's summary says
        "37 binary features" — BOTH discrepancies are recorded in the data file rather than reconciled)
    LICENCE: PHOIBLE 2.0 is CC BY-SA 3.0. Share-alike is a legal constraint on anything derived from it.
    """

    def __init__(self, document: Mapping) -> None:
        self._document = document
        self._segments: Mapping[str, Mapping[str, str]] = document["segments"]
        self._convention = self._load_convention()

    @staticmethod
    def _load_convention() -> Mapping[str, str]:
        """The MEASURED research-symbol -> PHOIBLE-symbol bridge, loaded as data.

        Without it, 4 of the 69 Turkish phones (every affricate) are unmeasurable, because PHOIBLE writes
        a postalveolar affricate with an explicit RETRACTED diacritic (`d̠ʒ`, U+0064 U+0320 U+0292) and the
        research corpus writes it plain (`dʒ`). Measured this session; the file carries the enumeration
        that established it. A mapping is NEVER invented here — an unmapped phone stays unmeasurable.
        """
        path = _PACKAGE_DIR / _CONVENTION_RELATIVE
        if not path.exists():
            raise PhonologyError(
                f"the symbol-convention map is absent at {path}. Research finding C-01 states that a "
                f"mixed symbol set silently inflates PER, so proceeding without the bridge is refused "
                f"rather than allowed to corrupt every distance computed downstream."
            )
        document = json.loads(path.read_text(encoding="utf-8"))
        return {entry["research"]: entry["phoible"] for entry in document["research_to_phoible"]}

    def canonical(self, segment: str) -> str:
        """The PHOIBLE spelling of a research symbol, or the symbol itself when no bridge is needed."""
        return self._convention.get(segment, segment)

    @property
    def convention_map(self) -> Mapping[str, str]:
        return dict(self._convention)

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _FEATURES_RELATIVE) -> "FeatureTable":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise PhonologyError(
                f"the PHOIBLE feature table is absent at {path}. It is GENERATED by "
                f"scripts/extract_phoible_features.py from PHOIBLE 2.0's own phoible.csv — research item "
                f"A2 cannot be computed without it, and inventing features here would be the exact "
                f"substitution the research forbids."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")))

    @property
    def feature_names(self) -> tuple[str, ...]:
        return tuple(self._document["feature_columns"])

    @property
    def segment_count(self) -> int:
        return int(self._document["segment_count"])

    @property
    def licence(self) -> str:
        return str(self._document["licence"])

    @property
    def citation(self) -> str:
        return str(self._document["citation"])

    def has(self, segment: str) -> bool:
        return self.canonical(segment) in self._segments

    def vector(self, segment: str) -> FeatureVector:
        canonical = self.canonical(segment)
        if canonical not in self._segments:
            raise PhonologyError(
                f"PHOIBLE has no feature vector for {segment!r} (canonical form tried: {canonical!r}). "
                f"Its absence is a FINDING — the symbol may use a convention the measured bridge does not "
                f"cover — and it is reported, never filled in with a nearest guess."
            )
        return FeatureVector(segment=canonical, values=self._segments[canonical])

    def inventory(self, label: str) -> tuple[str, ...]:
        """The PHOIBLE inventory for one of the nine researched languages, by its research label."""
        inventories = self._document["reference_inventories"]
        if label not in inventories:
            raise PhonologyError(
                f"{label!r} is not one of the nine languages the singing research measured "
                f"({', '.join(sorted(inventories))})."
            )
        return tuple(inventories[label])

    def nearest_in(self, segment: str, label: str) -> tuple[str | None, float | None]:
        """A2's nearest-neighbour step: the closest segment in `label`'s inventory, by feature distance.

        Returns (nearest segment, normalised distance). An exact match returns distance 0.0. When the
        segment is absent from PHOIBLE the pair is (None, None) — an unmeasurable case reported as such,
        which is what keeps the coverage score honest rather than optimistic.
        """
        if not self.has(segment):
            return None, None
        target = self.vector(segment)
        best: tuple[str | None, float | None] = (None, None)
        for candidate in self.inventory(label):
            if not self.has(candidate):
                continue
            distance = target.normalised_distance_to(self.vector(candidate))
            if distance is None:
                continue
            if best[1] is None or distance < best[1]:
                best = (candidate, distance)
                if distance == 0.0:
                    break
        return best


@dataclass(frozen=True)
class FeatureCoverage:
    """The A2 score computed the way the research specifies: feature-space nearest-neighbour distance.

    THIS IS A PREDICTION AND SAYS SO IN ITS OWN LABEL. It predicts expected quality from inventory
    overlap; it is NOT a measured intelligibility result, and A9's calibrated per-language PER is the only
    thing that may be called that. Reporting a prediction as a measurement is the class of claim this
    project forbids by name.
    """

    language: str
    reference_language: str
    exact_matches: int
    near_matches: int
    unmeasurable: int
    total: int
    mean_distance: float | None
    worst: tuple[str, str | None, float | None] | None

    @property
    def exact_ratio(self) -> float:
        return self.exact_matches / self.total if self.total else 0.0

    def as_dict(self) -> dict:
        return {
            "language": self.language,
            "reference_language": self.reference_language,
            "total_phones": self.total,
            "exact_matches": self.exact_matches,
            "near_matches": self.near_matches,
            "unmeasurable": self.unmeasurable,
            "exact_ratio": round(self.exact_ratio, 4),
            "mean_feature_distance": None if self.mean_distance is None else round(self.mean_distance, 4),
            "worst_phone": None if not self.worst else
                           {"phone": self.worst[0], "nearest": self.worst[1],
                            "distance": None if self.worst[2] is None else round(self.worst[2], 4)},
            "is_measurement": False,
            "label": "A2 PREDICTION from PHOIBLE feature-space nearest-neighbour distance. NOT a "
                     "measured PER; A9 requires a per-language bar calibrated on real sung material.",
        }


def compute_feature_coverage(inventory: "PhonemeInventory", reference_language: str,
                             table: FeatureTable | None = None) -> FeatureCoverage:
    """Compute A2 for one engine-trained language, in PHOIBLE feature space."""
    features = table or FeatureTable.load()
    exact = near = unmeasurable = 0
    distances: list[float] = []
    worst: tuple[str, str | None, float | None] | None = None
    for phone in inventory.phones:
        nearest, distance = features.nearest_in(phone.merged, reference_language)
        if distance is None:
            unmeasurable += 1
            continue
        distances.append(distance)
        if distance == 0.0:
            exact += 1
        else:
            near += 1
        if worst is None or (worst[2] is not None and distance > worst[2]):
            worst = (phone.merged, nearest, distance)
    return FeatureCoverage(
        language=inventory.language, reference_language=reference_language,
        exact_matches=exact, near_matches=near, unmeasurable=unmeasurable,
        total=len(inventory.phones),
        mean_distance=(sum(distances) / len(distances)) if distances else None,
        worst=worst,
    )


@dataclass(frozen=True)
class PhonemeDrivePlan:
    """A phoneme sequence prepared for an engine, carrying the A4 guard with it.

    `melody_present` is not a courtesy flag: `assert_melody_present()` REFUSES to hand a phoneme-driven
    request to a generator without melodic conditioning, because S06 measures that condition's RPA at
    0.0667 — the collapse the research explicitly warns against. A guard that can be ignored is not a
    guard, so the refusal is an exception rather than a logged warning.
    """

    phones: tuple[Phone, ...]
    encoding: PhonemeEncoding
    melody_present: bool
    source_text: str = ""
    feature_table: "FeatureTable | None" = None

    @property
    def tokens(self) -> tuple[str, ...]:
        """The engine tokens for this plan under its encoding.

        FEATURE encoding needs the PHOIBLE table; it is loaded on demand rather than required at
        construction so a MERGED plan costs nothing, and the load raises loudly if the data file is
        missing instead of silently degrading to the orthographic split.
        """
        if self.encoding is PhonemeEncoding.FEATURE:
            table = self.feature_table or FeatureTable.load()
            return tuple(token for phone in self.phones for token in phone.feature_tokens(table))
        return tuple(token for phone in self.phones for token in phone.tokens(self.encoding))

    @property
    def token_string(self) -> str:
        return " ".join(self.tokens)

    def assert_melody_present(self) -> None:
        if not self.melody_present:
            raise PhonologyError(
                "refusing a phoneme-only drive: S06 measures phoneme-only conditioning at RPA 0.0667 "
                "and Audiobox CE 4.17 against 6.97 for phoneme+melody, so pitch/melody conditioning is "
                "mandatory (research item A4). Attach melodic conditioning or do not phoneme-drive."
            )

    def as_dict(self) -> dict:
        return {
            "encoding": self.encoding.value,
            "phone_count": len(self.phones),
            "token_count": len(self.tokens),
            "tokens": list(self.tokens),
            "melody_present": self.melody_present,
            "guard": "A4 — phoneme-only is refused, not warned about",
        }


def build_drive_plan(phones: Iterable[str] | Sequence[Phone], *, encoding: PhonemeEncoding,
                     melody_present: bool, source_text: str = "",
                     inventory: PhonemeInventory | None = None,
                     feature_table: FeatureTable | None = None) -> PhonemeDrivePlan:
    """Assemble a `PhonemeDrivePlan` from symbols or Phones, resolving symbols against the inventory."""
    resolved: list[Phone] = []
    table = inventory or PhonemeInventory.load()
    for item in phones:
        resolved.append(item if isinstance(item, Phone) else table.phone_for(item))
    return PhonemeDrivePlan(phones=tuple(resolved), encoding=encoding,
                            melody_present=melody_present, source_text=source_text,
                            feature_table=feature_table)
