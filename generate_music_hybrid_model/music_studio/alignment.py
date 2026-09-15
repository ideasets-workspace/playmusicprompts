"""Research item A11 — the aligner registry, and the authority a MEASURED timing claim must obtain.

WHY THIS MODULE IS A REGISTRY AND A REFUSAL RATHER THAN AN ALIGNER
-----------------------------------------------------------------
A11 says: *"the aligner is Phonsa/STARS-class, or MFA RETRAINED on calibrated singing — never off-the-shelf
MFA"*, and its own requirement permits either **an aligner module OR an explicit refusal recording that no
lawful aligner is installed**. Measured this session, every candidate is blocked, and by DIFFERENT things:

    phonsa    BLOCKED  third-party model (D-SSM-24) · Mandarin-only data (30.92 h) · not installed
    stars     BLOCKED  third-party model · GTSinger corpus is CC BY-NC-SA 4.0 NON-COMMERCIAL · not installed
    mfa       REFUSED  C06, VERIFIED across FOUR sources: MAE 233.9 ms vs Phonsa's 32.6 ms; S21 "only 10.08 %"
    mfa+retrain BLOCKED  needs A12's calibrated singing corpus, which is ABSENT — but has NO licence and NO
                         owner-scope blocker, so it is the shortest lawful route
    sofa      UNRESEARCHED  named by S20 as a baseline it beats; its licence and languages were NOT read

So the honest artefact is a REFUSAL WITH ITS REASONS, not a stub aligner. A placeholder aligner would be the
banned class twice over: fake work, and an uncontrolled instrument.

THE HOLE THIS CLOSES, AND IT WAS REAL
-------------------------------------
`music_studio/phoneme_timing.py` already refuses to treat a PLANNED timeline as evidence. But its
`assert_measured()` checked the LABEL: a caller could construct `PhonemeTimeline(source=MEASURED)` and the
guard returned silently, because nothing asked *by what instrument*. A11 supplies that authority:
`assert_may_claim_measured_timing()` refuses the claim while no lawful aligner is registered. A guard that
trusts its own input's label is not a guard.

WHAT THIS DOES **NOT** BLOCK, stated because a wrong reading would stall two working stages:
  · PLANNED timelines (A3's length regulator) — they are instructions and need no aligner.
  · A8's PER — it aligns two PHONEME SEQUENCES by edit distance and never touches audio time.
  · The MFA **DICTIONARY** (`data/lexicon/turkish_mfa.dict`, CC BY 4.0, 41,377 words) — C06 indicts MFA's
    ACOUSTIC MODEL, not its lexicon. Grepped this session: zero forced-alignment code in `music_studio/`.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Final, Mapping

_PACKAGE_DIR: Final[Path] = Path(__file__).resolve().parent
_ALIGNERS_RELATIVE: Final[str] = "data/aligners.json"


class AlignmentError(Exception):
    """A fault in the alignment authority layer — raised rather than defaulting to 'no aligner needed'."""


class NoLawfulAlignerError(AlignmentError):
    """Raised when a MEASURED timing claim is made while no lawful aligner is registered.

    A distinct type because it is not a bug: it is the EXPECTED state today, and a caller may legitimately
    catch it to report "timing unmeasured" instead of crashing a delivery.
    """


class AlignerState(Enum):
    """Why a candidate cannot be used — or that it can.

    LAWFUL is deliberately reachable: the registry must be able to say yes, or the refusal would be a
    permanent verdict dressed as a measurement (MANDATE CLAUSE 7 — a control that cannot pass is not a
    control).
    """

    LAWFUL = "LAWFUL"
    BLOCKED = "BLOCKED"
    REFUSED = "REFUSED"
    UNRESEARCHED = "UNRESEARCHED"

    @property
    def is_usable(self) -> bool:
        return self is AlignerState.LAWFUL


class BlockerKind(Enum):
    """The KINDS of blocker, because they are cleared by different people and different acts.

    Keeping them distinct is the point: an owner-scope blocker needs BERK, a licence blocker needs a legal
    reading, a corpus blocker needs work, and a measured-unfit blocker can never be cleared by trying harder.
    """

    OWNER_SCOPE = "OWNER_SCOPE"
    LICENCE = "LICENCE"
    LANGUAGE = "LANGUAGE"
    CORPUS_ABSENT = "CORPUS_ABSENT"
    NOT_INSTALLED = "NOT_INSTALLED"
    MEASURED_UNFIT = "MEASURED_UNFIT"
    UNRESEARCHED = "UNRESEARCHED"

    @property
    def cleared_by(self) -> str:
        return {
            BlockerKind.OWNER_SCOPE: "Berk widening the scope explicitly — nobody else",
            BlockerKind.LICENCE: "a qualified legal reading of the licence; not a technical decision",
            BlockerKind.LANGUAGE: "a measurement on the target language; never an assumption",
            BlockerKind.CORPUS_ABSENT: "building or acquiring the corpus (A12)",
            BlockerKind.NOT_INSTALLED: "installing the artefact and verifying it on disk",
            BlockerKind.MEASURED_UNFIT: "NOTHING — a measured-unfit instrument stays unfit",
            BlockerKind.UNRESEARCHED: "reading the source at the required depth",
        }[self]


@dataclass(frozen=True)
class Blocker:
    """One reason a candidate is unusable, with who or what clears it."""

    kind: BlockerKind
    detail: str

    def as_dict(self) -> dict:
        return {"kind": self.kind.value, "detail": self.detail, "cleared_by": self.kind.cleared_by}


@dataclass(frozen=True)
class AlignerCandidate:
    """One aligner considered for this project, with its measured quality and every blocker against it."""

    identifier: str
    name: str
    aligner_class: str
    state: AlignerState
    blockers: tuple[Blocker, ...]
    measured_quality: Mapping[str, object]
    architecture: str
    note: str

    @property
    def is_usable(self) -> bool:
        """Usable only if the state says so AND nothing blocks it — both, so the two cannot drift apart."""
        return self.state.is_usable and not self.blockers

    def blocker_kinds(self) -> tuple[BlockerKind, ...]:
        return tuple(blocker.kind for blocker in self.blockers)

    def as_dict(self) -> dict:
        return {"id": self.identifier, "name": self.name, "class": self.aligner_class,
                "state": self.state.value, "usable": self.is_usable,
                "measured_quality": dict(self.measured_quality),
                "architecture": self.architecture, "note": self.note,
                "blockers": [blocker.as_dict() for blocker in self.blockers]}


class AlignerRegistry:
    """The A11 record: every candidate, its state, and the verdict — projected from data, never decided here."""

    def __init__(self, document: Mapping) -> None:
        self._document = document
        entries = document.get("candidates")
        if not entries:
            raise AlignmentError(
                f"{_ALIGNERS_RELATIVE} lists no candidates. An empty registry would answer 'no aligner' for "
                f"the same reason as a full one, which makes the refusal unfalsifiable."
            )
        self._candidates: dict[str, AlignerCandidate] = {}
        for entry in entries:
            candidate = self._parse(entry)
            self._candidates[candidate.identifier] = candidate
        self._validate()

    @staticmethod
    def _parse(entry: Mapping) -> AlignerCandidate:
        try:
            state = AlignerState(entry["state"])
        except (KeyError, ValueError) as error:
            raise AlignmentError(
                f"candidate {entry.get('id')!r} has state {entry.get('state')!r}, which is not one of "
                f"{[state.value for state in AlignerState]}. An unknown state would be neither usable nor "
                f"refused, and the registry would silently skip it."
            ) from error
        blockers: list[Blocker] = []
        for raw in entry.get("blockers", ()):
            try:
                kind = BlockerKind(raw["kind"])
            except (KeyError, ValueError) as error:
                raise AlignmentError(
                    f"candidate {entry.get('id')!r} carries blocker kind {raw.get('kind')!r}, which this "
                    f"module does not know. A blocker nobody can classify cannot be reported to the person "
                    f"who would clear it."
                ) from error
            detail = str(raw.get("detail", "")).strip()
            if not detail:
                raise AlignmentError(
                    f"candidate {entry.get('id')!r} has a {kind.value} blocker with no detail. A blocker "
                    f"without its reason is an unexplained gap."
                )
            blockers.append(Blocker(kind=kind, detail=detail))
        return AlignerCandidate(
            identifier=str(entry["id"]), name=str(entry.get("name", "")),
            aligner_class=str(entry.get("class", "")), state=state, blockers=tuple(blockers),
            measured_quality=entry.get("measured_quality", {}),
            architecture=str(entry.get("architecture", "")), note=str(entry.get("note", "")),
        )

    def _validate(self) -> None:
        """A non-LAWFUL candidate MUST carry at least one blocker, and a LAWFUL one MUST carry none.

        Without this, a candidate could be marked BLOCKED with no reason (an unexplained gap) or LAWFUL while
        still carrying a licence blocker (a usable aligner that is not actually usable).
        """
        for identifier, candidate in self._candidates.items():
            if candidate.state.is_usable and candidate.blockers:
                raise AlignmentError(
                    f"{identifier} is LAWFUL yet carries {len(candidate.blockers)} blocker(s) "
                    f"{[b.kind.value for b in candidate.blockers]}. A candidate cannot be usable and blocked."
                )
            if not candidate.state.is_usable and not candidate.blockers:
                raise AlignmentError(
                    f"{identifier} is {candidate.state.value} with no blockers recorded. A11 requires the "
                    f"REASON, not just the verdict — that is the difference between a refusal and a shrug."
                )

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _ALIGNERS_RELATIVE) -> "AlignerRegistry":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise AlignmentError(
                f"the A11 aligner record is absent at {path}. A11 permits an aligner OR an explicit refusal "
                f"record; with neither on disk, a MEASURED timing claim would pass unchallenged, which is the "
                f"hole this module exists to close."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")))

    @property
    def candidates(self) -> tuple[AlignerCandidate, ...]:
        return tuple(self._candidates.values())

    def candidate(self, identifier: str) -> AlignerCandidate:
        if identifier not in self._candidates:
            raise AlignmentError(f"{identifier!r} is not in {_ALIGNERS_RELATIVE}.")
        return self._candidates[identifier]

    def lawful(self) -> tuple[AlignerCandidate, ...]:
        return tuple(candidate for candidate in self._candidates.values() if candidate.is_usable)

    @property
    def has_lawful_aligner(self) -> bool:
        return bool(self.lawful())

    def shortest_route(self) -> str:
        return str(self._document.get("verdict", {}).get("shortest_route_to_unblock", ""))

    def verdict(self) -> Mapping:
        verdict = self._document.get("verdict")
        if not verdict:
            raise AlignmentError(f"{_ALIGNERS_RELATIVE} records no verdict.")
        return verdict

    def refusal_message(self) -> str:
        """The exact refusal text, assembled from the record so it can never drift from the data."""
        lines = [
            "A11: NO LAWFUL SINGING ALIGNER IS INSTALLED, so a MEASURED phoneme timing cannot be claimed.",
            "Candidates and what blocks each one:",
        ]
        for candidate in self._candidates.values():
            kinds = ", ".join(kind.value for kind in candidate.blocker_kinds()) or "none"
            lines.append(f"  · {candidate.identifier}: {candidate.state.value} [{kinds}]")
        lines.append(f"Shortest lawful route: {self.shortest_route()}")
        lines.append("A PLANNED timeline remains lawful and useful; only the claim that a timing was "
                     "MEASURED is refused.")
        return "\n".join(lines)

    def assert_may_claim_measured_timing(self) -> AlignerCandidate:
        """The authority `TimingSource.MEASURED` requires. Returns the aligner, or refuses with every reason.

        This is the enforcement point for A11. It exists because a label is not an instrument: before it,
        `PhonemeTimeline(source=MEASURED)` was accepted purely because it said so.
        """
        lawful = self.lawful()
        if not lawful:
            raise NoLawfulAlignerError(self.refusal_message())
        if len(lawful) > 1:
            raise AlignmentError(
                f"{len(lawful)} aligners are marked lawful ({[c.identifier for c in lawful]}). Two timing "
                f"instruments would produce two different 'measured' truths for the same audio; the record "
                f"must name ONE, with the control set that proved it."
            )
        return lawful[0]

    def as_dict(self) -> dict:
        return {
            "research_item": "A11",
            "has_lawful_aligner": self.has_lawful_aligner,
            "verdict": dict(self.verdict()),
            "candidates": [candidate.as_dict() for candidate in self._candidates.values()],
            "blockers_by_who_clears_them": {
                kind.value: kind.cleared_by
                for kind in sorted({blocker.kind for candidate in self._candidates.values()
                                    for blocker in candidate.blockers}, key=lambda k: k.value)
            },
        }
