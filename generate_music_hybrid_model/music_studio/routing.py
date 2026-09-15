"""Research item A7 — TWO GENERATION PATHS AND A MIX STAGE, with the one path that is refused named.

WHAT A7 ASKS FOR, and what the constraints did to it
----------------------------------------------------
A7 (docs/research/2026-08-14-cross-lingual-singing-voice-synthesis-frontier.md): *"Route the instrumental bed
and the vocal SEPARATELY, then mix"* — the typed controls stay authoritative for the bed while the vocal gets
note-level control. In the research that vocal path was SoulX-Singer.

Three facts, each read from disk this session, decide what is buildable:

1. **D-SSM-24** (his order 2026-08-14, *"herşey kesinlikle vertex ve google ın kendi servisleir ile olmalı"*)
   removes SoulX-Singer as a third-party MODEL wherever it runs. The architecture's own §2c.3 states the
   consequence without softening it: *"note-level vocal timing has NO Google path today, and that is stated,
   not hidden."*
2. The only Google sung surface, `lyria-3-pro-preview`, returns a **MIXED** song — vocal together with its own
   accompaniment. **No Google service generates a vocal-only signal.**
3. **MANDATE CLAUSE 15**, verbatim: *"A separated stem is analysis-grade and may never be shipped."*

So the vocal-over-bed form of A7 would have to separate a Lyria mix and ship the stem, which clause 15
forbids. That is a REFUSAL derived from the law, not a scope reduction chosen to make the work smaller — and
it is recorded as a refusal with the exact clause, so it can be revisited when a vocal-only surface exists or
when he suspends the clause himself.

**WHAT IS LAWFULLY TWO-PATH, and it is not a consolation prize:** the MUSIC bed and the FX/AMBIENCE beds are
each generated WHOLE by Lyria from their OWN prompts. Architecture §2c.3 moved FX/ambience generation onto
"Lyria prompt-directed beds" precisely because the third-party SFX routes were ineligible. Two independently
prompted, engine-generated, shippable layers mixed together is exactly A7's structure — and the `stems`
parameter already exposes `fx` and `ambience` as their own stems.

DESIGN NOTES A FUTURE READER NEEDS
----------------------------------
* `DeliveryClass` is **derived from `SourceOrigin`, never stored**. A settable field would let a separated stem
  be shipped by writing one word into a payload; the guard has to be structural to be a guard.
* Capability facts live in `data/generation_paths.json`, not here. This module contains no engine name, no
  availability flag and no refusal prose — only the mechanism that reads them.
* The mix stage does not re-implement loudness: `music_studio/mastering.py` owns that (single source of truth).
* Nothing here spends. A plan is built and refused for free, BEFORE any billable call — which is the whole
  point of refusing at plan time.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Callable, Final, Mapping, Sequence

_PACKAGE_DIR: Final[Path] = Path(__file__).resolve().parent
_PATHS_RELATIVE: Final[str] = "data/generation_paths.json"


class RoutingError(Exception):
    """A routing fault that must stop the run: a missing evidence file, or an unlawful mix."""


class SourceOrigin(Enum):
    """How a layer's audio came into existence. This, and only this, decides whether it may ship."""

    ENGINE_GENERATED = "ENGINE_GENERATED"
    SEPARATED_STEM = "SEPARATED_STEM"


class DeliveryClass(Enum):
    """Whether a layer may reach a delivered file.

    DERIVED from `SourceOrigin` by `SourceOrigin.delivery_class`, never stored on a layer and never accepted
    from a payload — see this module's docstring for why that has to be structural.
    """

    SHIPPABLE = "SHIPPABLE"
    ANALYSIS_ONLY = "ANALYSIS_ONLY"


# The one mapping that encodes MANDATE CLAUSE 15. It is a module constant rather than a data field because it
# is a LAW, not a measurement: data files carry what was measured, laws are quoted where they are enforced.
_DELIVERY_CLASS_BY_ORIGIN: Final[Mapping[SourceOrigin, DeliveryClass]] = {
    SourceOrigin.ENGINE_GENERATED: DeliveryClass.SHIPPABLE,
    SourceOrigin.SEPARATED_STEM: DeliveryClass.ANALYSIS_ONLY,
}


class LayerRole(Enum):
    """The parts a song is assembled from. Membership is checked against the evidence file at load time."""

    MUSIC_BED = "MUSIC_BED"
    FX_BED = "FX_BED"
    AMBIENCE_BED = "AMBIENCE_BED"
    LEAD_VOCAL = "LEAD_VOCAL"
    #: A6's fallback voice-identity path: a spoken prompt (voice_vertex_tts, Google, generation-proven)
    #: styled into singing by an STS stage. The role EXISTS so the refusal is a first-class, queryable
    #: capability answer rather than a silent absence — the evidence file records why it is unavailable
    #: (every published STS engine is a third-party model, the D-SSM-24 class that removed SoulX-Singer).
    STS_VOCAL = "STS_VOCAL"


@dataclass(frozen=True)
class LayerCapability:
    """What the evidence file records about one layer: whether it exists, on what engine, and on what proof."""

    role: LayerRole
    available: bool
    origin: SourceOrigin
    engine_candidates: tuple[str, ...]
    control_surface: str
    evidence: str
    measured_caveat: str | None
    refusal: Mapping | None

    @property
    def delivery_class(self) -> DeliveryClass:
        return _DELIVERY_CLASS_BY_ORIGIN[self.origin]


@dataclass(frozen=True)
class GenerationLayer:
    """One planned generation path: a role, the engine that will render it, and its own prompt intent.

    `prompt_intent` is deliberately not a finished prompt: prompt compilation belongs to `planner.py`, and
    duplicating it here would create two prompt builders that must agree by discipline.
    """

    role: LayerRole
    engine: str
    origin: SourceOrigin
    prompt_intent: str
    evidence: str
    measured_caveat: str | None = None

    @property
    def delivery_class(self) -> DeliveryClass:
        return _DELIVERY_CLASS_BY_ORIGIN[self.origin]

    def as_dict(self) -> dict:
        return {
            "role": self.role.value,
            "engine": self.engine,
            "origin": self.origin.value,
            "delivery_class": self.delivery_class.value,
            "prompt_intent": self.prompt_intent,
            "evidence": self.evidence,
            "measured_caveat": self.measured_caveat,
        }


@dataclass(frozen=True)
class LayerRefusal:
    """A layer the caller may have wanted, refused with the law that forbids it and what would unblock it.

    A refusal is first-class DATA in the response, not a log line: the UI's refusal screen is a designed
    surface, and a caller who cannot see WHY cannot act on it.
    """

    role: LayerRole
    reason: str
    law: str
    what_is_still_lawful: str
    what_would_unblock_it: tuple[str, ...]

    def as_dict(self) -> dict:
        return {
            "role": self.role.value,
            "refused": True,
            "reason": self.reason,
            "law": self.law,
            "what_is_still_lawful": self.what_is_still_lawful,
            "what_would_unblock_it": list(self.what_would_unblock_it),
        }


@dataclass(frozen=True)
class MixPlan:
    """The layers to render and combine, plus every refusal, plus the honest state of the mix itself."""

    layers: tuple[GenerationLayer, ...]
    refusals: tuple[LayerRefusal, ...] = ()
    stage_id: str = ""
    stage_position: str = ""
    unmeasured: str = ""
    reuses: str = ""

    @property
    def is_multi_path(self) -> bool:
        """True when this genuinely realises A7's two-path structure rather than one path with a label."""
        return len(self.layers) > 1

    #: A7's own vocabulary, kept as a name in the code rather than only in a docstring. The research item and
    #: the research-application ledger both call this structure `two_path`; a mechanism whose research name
    #: appears nowhere in the code cannot be audited by name, which is how A7 sat PARTIAL while it was built.
    two_path = is_multi_path

    @property
    def unshippable(self) -> tuple[GenerationLayer, ...]:
        return tuple(layer for layer in self.layers
                     if layer.delivery_class is DeliveryClass.ANALYSIS_ONLY)

    def assert_shippable(self) -> None:
        """Refuse the plan if any layer may not be delivered. Called BEFORE any billable call.

        This is the enforcement point for MANDATE CLAUSE 15. It raises rather than warns because a warning
        that reaches a log while the render proceeds is not a gate.
        """
        offenders = self.unshippable
        if offenders:
            named = ", ".join(f"{layer.role.value} (origin {layer.origin.value})" for layer in offenders)
            raise RoutingError(
                f"MANDATE CLAUSE 15 refuses this mix: {named}. 'A separated stem is analysis-grade and may "
                f"never be shipped.' A separated stem is lawful for MEASUREMENT (the A8 intelligibility "
                f"gate reads it) and never for delivery."
            )

    def as_dict(self) -> dict:
        return {
            "research_item": "A7",
            "stage": {"id": self.stage_id, "position": self.stage_position, "reuses": self.reuses},
            "multi_path": self.is_multi_path,
            "layer_count": len(self.layers),
            "layers": [layer.as_dict() for layer in self.layers],
            "refusals": [refusal.as_dict() for refusal in self.refusals],
            "unmeasured": self.unmeasured,
        }


class GenerationPathRegistry:
    """The evidence file, parsed and validated. Read-only; authored by nobody at runtime."""

    def __init__(self, document: Mapping) -> None:
        self._document = document
        self._capabilities: dict[LayerRole, LayerCapability] = {}
        for entry in document.get("layers", ()):
            role = self._role(entry)
            self._capabilities[role] = LayerCapability(
                role=role,
                available=bool(entry["available"]),
                origin=SourceOrigin(entry["origin"]),
                engine_candidates=tuple(entry.get("engine_candidates", ())),
                control_surface=str(entry.get("control_surface", "")),
                evidence=str(entry.get("evidence", "")),
                measured_caveat=entry.get("measured_caveat"),
                refusal=entry.get("refusal"),
            )
        if not self._capabilities:
            raise RoutingError(f"{_PATHS_RELATIVE} declares no layers; there is nothing to route.")
        self._validate()

    @staticmethod
    def _role(entry: Mapping) -> LayerRole:
        try:
            return LayerRole(entry["role"])
        except (KeyError, ValueError) as error:
            raise RoutingError(
                f"{_PATHS_RELATIVE} names a layer role this module does not know: {entry.get('role')!r}. "
                f"Known roles: {[role.value for role in LayerRole]}. A role present in data but absent from "
                f"the enum would be silently ignored, which is how a capability goes missing without anyone "
                f"noticing."
            ) from error

    def _validate(self) -> None:
        """Every unavailable layer MUST carry a refusal, and every available one MUST name an engine.

        Without this, an unavailable layer with no reason would read as "not implemented yet" instead of
        "forbidden by a named law", and the difference is the whole honesty of the response.
        """
        for role, capability in self._capabilities.items():
            if capability.available and not capability.engine_candidates:
                raise RoutingError(f"{role.value} is marked available with no engine candidates.")
            if not capability.available and not capability.refusal:
                raise RoutingError(
                    f"{role.value} is unavailable with no recorded refusal. An unavailable layer without its "
                    f"reason is an unexplained gap, and this project's law is that a refusal names its cause."
                )

    @classmethod
    @lru_cache(maxsize=2)
    def load(cls, relative_path: str = _PATHS_RELATIVE) -> "GenerationPathRegistry":
        path = _PACKAGE_DIR / relative_path
        if not path.exists():
            raise RoutingError(
                f"the generation-path evidence file is absent at {path}. It records which layers can be "
                f"generated separately and which are refused BY WHICH LAW; without it this module would "
                f"have to assume a capability, and a printed assumption is what MANDATE CLAUSE 6 forbids."
            )
        return cls(json.loads(path.read_text(encoding="utf-8")))

    @property
    def roles(self) -> tuple[LayerRole, ...]:
        return tuple(self._capabilities)

    def capability(self, role: LayerRole) -> LayerCapability:
        if role not in self._capabilities:
            raise RoutingError(f"{role.value} is not described in {_PATHS_RELATIVE}.")
        return self._capabilities[role]

    def mix_stage(self) -> Mapping:
        stage = self._document.get("mix_stage")
        if not stage:
            raise RoutingError(f"{_PATHS_RELATIVE} describes no mix stage, so A7's second half is missing.")
        return stage

    def constraint_chain(self) -> tuple[str, ...]:
        return tuple(self._document.get("the_constraint_chain_that_shapes_this_file", ()))


class TwoPathRouter:
    """Builds A7's MixPlan from a validated request.

    Composition over inheritance, and the two collaborators are injected so the router can be tested without
    touching disk or the planner:
      · `registry`      the evidence file (which layers exist, on what proof, refused by what law)
      · `route_chooser` the EXISTING Google-only model chooser in `planner.choose_route` — imported, never
                        re-implemented, because a second model-choice rule would drift from the first
    """

    def __init__(self, registry: GenerationPathRegistry | None = None,
                 route_chooser: Callable[[dict], dict] | None = None) -> None:
        self._registry = registry or GenerationPathRegistry.load()
        if route_chooser is None:
            from . import planner  # local import: the router is usable without the planner in tests
            route_chooser = planner.choose_route
        self._route_chooser = route_chooser

    @property
    def registry(self) -> GenerationPathRegistry:
        return self._registry

    def _engine_for(self, capability: LayerCapability, request: dict) -> str:
        """The engine for a layer: the shared chooser's answer when it is a candidate, else the first candidate.

        The chooser stays authoritative because it carries the measured reasons (which surface sings, which
        has the ~3 min ceiling). When its answer is not a candidate for this layer, the layer's own first
        candidate is used and the divergence is visible in the plan rather than silently reconciled.
        """
        chosen = str(self._route_chooser(request).get("model", ""))
        if chosen in capability.engine_candidates:
            return chosen
        return capability.engine_candidates[0]

    @staticmethod
    def _wants_layer(role: LayerRole, request: dict) -> bool:
        """Whether the request asks for this layer, read from the REAL field names in param_spec.json.

        Measured field contract (scripts/print_request_field_contract.py, this session): `stems` is a
        multi-select whose legal ids include `fx` and `ambience`; `vocal.mode` is a combo whose ids are
        instrumental / male / female / duet / choir / spoken; `lyrics.mode` is none / custom / ai_write.
        """
        stems = request.get("stems") or []
        if role is LayerRole.MUSIC_BED:
            return True                                    # every song has a musical bed
        if role is LayerRole.FX_BED:
            return "fx" in stems
        if role is LayerRole.AMBIENCE_BED:
            return "ambience" in stems
        if role is LayerRole.LEAD_VOCAL:
            vocal_mode = (request.get("vocal") or {}).get("mode", "instrumental")
            lyrics_mode = (request.get("lyrics") or {}).get("mode", "none")
            return vocal_mode != "instrumental" or lyrics_mode != "none"
        return False

    def _refusal_for(self, capability: LayerCapability) -> LayerRefusal:
        refusal = capability.refusal or {}
        return LayerRefusal(
            role=capability.role,
            reason=str(refusal.get("reason", "")),
            law=str(refusal.get("law", "")),
            what_is_still_lawful=str(refusal.get("what_is_still_lawful", "")),
            what_would_unblock_it=tuple(refusal.get("what_would_unblock_it", ())),
        )

    def mix_plan(self, request: dict) -> MixPlan:
        """The A7 plan for this request: the layers to render, and every layer refused with its law.

        Named `mix_plan` because that is what A7 and the research-application ledger call the artefact this
        produces. `plan_mix` remains as the verb-form alias below so existing callers keep working.

        Deliberately does NOT raise on a refused layer. The caller receives a plan that renders what is
        lawful and REPORTS what is not — because a request for a sung song is still fulfillable as a
        single-path Lyria take, and turning that into an exception would refuse the whole song over a
        layering technique the user never asked for by name.
        """
        layers: list[GenerationLayer] = []
        refusals: list[LayerRefusal] = []
        for role in self._registry.roles:
            if not self._wants_layer(role, request):
                continue
            capability = self._registry.capability(role)
            if not capability.available:
                refusals.append(self._refusal_for(capability))
                continue
            layers.append(GenerationLayer(
                role=role,
                engine=self._engine_for(capability, request),
                origin=capability.origin,
                prompt_intent=capability.control_surface,
                evidence=capability.evidence,
                measured_caveat=capability.measured_caveat,
            ))
        stage = self._registry.mix_stage()
        plan = MixPlan(
            layers=tuple(layers),
            refusals=tuple(refusals),
            stage_id=str(stage.get("id", "")),
            stage_position=str(stage.get("position", "")),
            unmeasured=str(stage.get("unmeasured", "")),
            reuses=str(stage.get("reuses", "")),
        )
        # The guard runs HERE, at plan time, at $0 — not after a paid render has already produced files.
        plan.assert_shippable()
        return plan

    #: Verb-form alias. `mix_plan` is the research vocabulary (A7, the application ledger); `plan_mix` reads
    #: naturally at a call site. One implementation, two names — never two implementations.
    plan_mix = mix_plan
