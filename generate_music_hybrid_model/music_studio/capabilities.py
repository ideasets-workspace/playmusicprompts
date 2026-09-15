"""GET /generate-music-hybrid-model/capabilities — generated FROM the spec, never hand-written.

Architecture principle 3 (s2.1): "CAPABILITY IS DISCOVERABLE BEFORE IT IS PAID FOR. The capabilities
endpoint returns the live per-route matrix, so the UI can disable what a chosen route cannot do
instead of accepting a setting and dropping it. Origin: four printed enums lied here, one at a
measured $1.01."

DESIGN RULE (D-SSM-23, same as models.py): nothing here is hand-maintained. The matrix is a pure
projection of `param_spec.json` + the data files it imports — the same single source of truth the
validator and the UI read. If the spec changes, the matrix changes on the next call; a drift is
structurally impossible because there is no second copy to drift.

Per parameter the matrix carries: the binding class, the control type, panel/section placement, the
resolved predefined-value ids (imports resolved to their real lists), defaults with their evidence,
constraints, and — for `vocal`/`lyrics` — the LANGUAGE REGISTRY projection with each language's
measured state (D-SSM-17), so the UI shows the honest badge instead of a silent list.

Controls: scripts/test_music_studio_capabilities.py — proves the matrix matches the source (every
spec entry present, every import-resolved count equal, registry states verbatim) and that it can
FAIL (a fabricated entry is detected).
"""

from __future__ import annotations

from . import models


def _resolve_field_imports(fields: dict) -> dict:
    """Resolve every FIELD-LEVEL `values_import` to real value entries, so served == enforced.

    MEASURED DEFECT this repairs (2026-08-15): the spec carried two field-level imports — `vocal.language`
    and `lyrics.language` — and BOTH were served to clients as a bare prose sentence with no `values`, while
    `models._check_language` enforces the language against `data/language_registry.json` per axis. Served and
    enforced therefore agreed only by DISCIPLINE (Supreme Law prohibition 6 forbids that construction by
    name), and a UI reading the matrix could not know which of the 11 codes the validator would accept.
    Parameter-level imports were already resolved (genres 21, moods 17, instruments 17) — only the nested
    ones were missed, and the module docstring claimed the projection existed, which is how the gap survived.

    The root cause was prose where a typed field belongs: `values_import` held the SENTENCE "GENERATED from
    titles/languages/ registry …" instead of a path, so no resolver could ever have loaded it. The spec now
    carries the real path (`models.LANGUAGE_REGISTRY_PATH`) with the prose preserved in `values_origin`, and
    dispatch here is on the TYPED TARGET — never on a field's name, so a future `chorus_language` field
    cannot silently regress to prose (Clause 23: the rule is about the target, not today's spelling).

    Returns a NEW mapping; the spec document is never mutated (it is cached and shared with the validator).
    """
    resolved: dict = {}
    for name, definition in fields.items():
        if not isinstance(definition, dict):
            resolved[name] = definition
            continue
        target = definition.get("values_import")
        if not isinstance(target, str):
            resolved[name] = definition
            continue
        projected = dict(definition)
        if target == models.LANGUAGE_REGISTRY_PATH:
            # The registry is `languages[]`, not a groups[].entries[] vocabulary — its own projection,
            # carrying the per-axis states the validator branches on (the honest badge, D-SSM-17).
            projected["values"] = models.language_value_entries()
        elif target.startswith("data/"):
            projected["values"] = models.load_vocabulary(target)
        else:
            # An unresolvable import is NOT passed through as prose: that silence is precisely how these two
            # fields went unnoticed. Fail loudly at the boundary, naming what must be fixed.
            raise models.SpecError(
                f"field {name!r} declares values_import {target!r}, which is neither the language registry "
                f"path ({models.LANGUAGE_REGISTRY_PATH!r}) nor a data/ vocabulary. Serving it unresolved "
                f"would offer the UI a sentence where the validator enforces a list.")
        projected["value_count"] = len(projected["values"])
        resolved[name] = projected
    return resolved


def capabilities() -> dict:
    """The full discoverable matrix. Pure projection of (spec, data files); no I/O beyond them."""
    spec = models.load_spec()
    registry = models.load_language_registry()

    parameters = []
    for p in spec["parameters"]:
        entry: dict = {
            "name": p["name"],
            "ui_control": p.get("ui_control"),
            "panel": p.get("panel"),
            "section": p.get("section"),
            "control": p.get("control"),
            "binding": p.get("binding"),
            "free_text": bool(p.get("free_text")),
        }
        ids = models.allowed_value_ids(p)
        if ids is not None:
            entry["value_count"] = len(ids)
            # Predefined lists with labels: inline values keep their labels; imports resolve to
            # the vocabulary entries so the UI renders the SAME document the validator enforces.
            if p.get("values"):
                entry["values"] = p["values"]
            elif isinstance(p.get("values_import"), str):
                entry["values_import"] = p["values_import"]
                entry["values"] = models.load_vocabulary(p["values_import"])
            elif p.get("values_generated"):
                entry["values_generated"] = p["values_generated"]
        if p.get("fields"):
            entry["fields"] = _resolve_field_imports(p["fields"])
        if p.get("constraints"):
            entry["constraints"] = p["constraints"]
        # RESPONSE-ONLY parameters carry no request value set — their contract IS their shape. Projecting
        # it is not decoration: without it the UI cannot know what a badge or a radar will contain, and a
        # `response_field` entry would arrive looking like a broken request parameter. Added 2026-08-15
        # after a live render-contract control measured `rights`, `compliance` and `analysis_outputs`
        # arriving with neither values nor shape.
        if p.get("response_shape"):
            entry["response_shape"] = p["response_shape"]
        # GRADED SLIDER PRESETS: a tier-shaped lexicon (its own typed key, not `values_import`, whose
        # contract is a groups[].entries[] vocabulary) is resolved here into per-field named presets, so
        # the UI's combos beside each slider come from the SAME file the planner compiles its prose from.
        if isinstance(p.get("presets_import"), str):
            entry["presets_import"] = p["presets_import"]
            lexicon = models.load_knob_lexicon(p["presets_import"])
            tiers = lexicon["tiers"]
            entry["preset_tiers"] = tiers
            fields = entry.setdefault("fields", {})
            for field_name, field_def in fields.items():
                knob = lexicon["knobs"].get(field_name)
                if not knob:
                    continue
                field_def = dict(field_def)
                field_def["values"] = [
                    {"id": tier["id"], "label": tier["label"], "range": [tier["min"], tier["max"]],
                     "sent_clause": knob["clauses"][tier["id"]]}
                    for tier in tiers
                ]
                field_def["binding"] = knob["binding"]
                fields[field_name] = field_def
        if p.get("default") is not None:
            entry["default"] = p["default"]
        if p.get("covers_ui_controls"):
            entry["covers_ui_controls"] = p["covers_ui_controls"]
        parameters.append(entry)

    return {
        "endpoint": spec["endpoint"],
        "schema_id": spec["$schema_id"],
        "bindings_legend": spec["bindings_legend"],
        "parameters": parameters,
        "languages": {
            "source": "music_studio/data/language_registry.json (D-SSM-17: a language enters ONLY "
                      "with evidence; states are measured, never asserted)",
            "entries": registry["languages"],
        },
        "routes": next(p for p in spec["parameters"] if p["name"] == "route")["values"],
        "honesty": {
            "generated_from": "music_studio/param_spec.json + its imported data files, at call time",
            "note": "a binding class is a CONTRACT statement, not a capability proof; fields marked "
                    "lyria_launch_probe_pending in the spec's values_origin upgrade only after a "
                    "generation-proven probe (SCHEMA IS NEVER CAPABILITY)",
        },
    }
