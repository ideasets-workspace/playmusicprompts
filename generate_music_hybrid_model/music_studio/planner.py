"""The conductor's brain: validated request -> route + compiled prompt + bindings report.

PURE FUNCTIONS ONLY. No network, no filesystem writes, no clock — everything here is a deterministic
function of (request, spec, data files), which is what makes it fully controllable offline and what
makes `bindings` an honest report: the same request always compiles to the same sent artefacts.

WHAT COMPILATION MEANS HERE (architecture s2c/s3, D-SSM-24 Google-only route set):
  - the PROMPT follows Google's own Lyria formula — archived guide L1002:
    [Genre & style] + [Mood] + [Instrumentation] + [Tempo & rhythm] + [Vocal style & language] + [Lyrics]
    — with every clause drawn from a versioned lexicon or the caller's own words, never improvised;
  - `structure` + `energy_curve` compile to [mm:ss] timestamp prose (the guide's own timestamp-prompting
    mechanism) with per-section intensity from the energy curve (s3.1, compiled_stepwise);
  - `mood_orbit` resolves through data/mood_orbit_lexicon.json (s3.2, deterministic);
  - `lyrics` ride the measured `Lyrics:`-in-quotes convention (generation-proven 2026-08-13; the guide's
    own L1008: "provide your exact lyrics in quotes to be performed") — R0 raw orthography is the
    DEFAULT per D-SSM-25 (the R0/R1 round measured tr-R0 at 8/8 x3; R1 is the escalation, not default);
  - the ROUTE is chosen from the spec's own Google-only model list, and `route.why` states the reason.

Every compiled artefact lands in the bindings report so the caller can always distinguish a setting
from a wish. Controls: scripts/test_music_studio_planner.py (determinism, formula shape, refusal of
uncompilable states — both directions).
"""

from __future__ import annotations

import json
from pathlib import Path

from . import models

_PKG_DIR = Path(__file__).resolve().parent


def _lexicon(name: str) -> dict:
    p = _PKG_DIR / "data" / name
    if not p.exists():
        raise models.SpecError(f"lexicon missing: data/{name}")
    return json.loads(p.read_text(encoding="utf-8"))


def _label_for(param_name: str, value_id: str) -> str:
    """The human label the spec carries for a predefined id (labels are part of the contract)."""
    spec = models.load_spec()
    for p in spec["parameters"]:
        if p["name"] != param_name:
            continue
        ids = models.allowed_value_ids(p)
        if ids and value_id in ids:
            for v in p.get("values", []):
                if v["id"] == value_id:
                    return v["label"]
            imp = p.get("values_import")
            if isinstance(imp, str) and imp.startswith("data/"):
                for e in models.load_vocabulary(imp):
                    if e["id"] == value_id:
                        return e["label"]
    return value_id.replace("_", " ")


def _era_axis_index() -> dict[str, str]:
    """id -> axis ('decade' or 'period_modifier') for the era vocabulary, read from the DATA file.

    WHY THIS READS THE FILE'S OWN `axis` FIELD instead of pattern-matching the id: the era phrase
    Google demonstrates puts the modifier BEFORE the decade ("early 90s"), so the compiler needs to
    know which selected value is which. Deriving that from the id text (e.g. "starts with
    era_modifier_") would be a convention this module invented; the vocabulary's groups already
    declare `axis`, so the grouping is IMPORTED rather than re-guessed — the same single-source-of-
    truth rule that the two-lists-must-agree clause requires.
    """
    spec = models.load_spec()
    parameter = next((p for p in spec["parameters"] if p["name"] == "eras"), None)
    if parameter is None:
        return {}
    relative_path = parameter.get("values_import")
    if not isinstance(relative_path, str) or not relative_path.startswith("data/"):
        return {}
    document = models.load_vocabulary_document(relative_path)
    axis_of: dict[str, str] = {}
    for group in document.get("groups", []):
        axis = group.get("axis", "")
        for entry in group.get("entries", []):
            axis_of[entry["id"]] = axis
    return axis_of


def _field_label(param_name: str, field: str, value_id: str) -> str:
    """Label lookup for FIELD-level value sets (spec parameters carrying `fields`, not `values`).

    Needed because _label_for reads only top-level values/values_import; energy_curve presets and
    prompt_block roles live under fields.<name>.values — measured 2026-08-17 when the preset label
    lookup silently fell back to the bare id and lost the spec's own shape parenthetical.
    """
    spec = models.load_spec()
    for p in spec["parameters"]:
        if p["name"] != param_name:
            continue
        for v in (p.get("fields", {}).get(field, {}) or {}).get("values", []):
            if v["id"] == value_id:
                return v["label"]
    return value_id.replace("_", " ")


def choose_route(req: dict) -> dict:
    """Google-only route choice (D-SSM-24), with the reason stated — never a silent default."""
    explicit = (req.get("route") or {}).get("model") if isinstance(req.get("route"), dict) else req.get("route")
    if explicit and explicit != "auto":
        return {"model": explicit, "why": "caller pinned the model explicitly"}
    vocal_mode = (req.get("vocal") or {}).get("mode", "instrumental")
    quality = req.get("quality", "balanced")
    target = ((req.get("duration") or {}).get("target_seconds")) or 135
    if vocal_mode != "instrumental" or (req.get("lyrics") or {}).get("mode", "none") != "none":
        return {"model": "lyria-3-pro-preview",
                "why": "vocals/lyrics requested: lyria-3-pro is the only surface measured to sing dictated words (findings 2026-08-13)"}
    if quality == "draft" and target <= 30:
        return {"model": "lyria-3-clip-preview",
                "why": "draft quality + <=30 s target: the clip model is the documented fast surface"}
    return {"model": "lyria-3-pro-preview",
            "why": "instrumental full-length: lyria-3-pro carries the documented ~3 min ceiling; "
                   "lyria-002 remains available by explicit pin (16-bit 48 kHz PCM delivery)"}


def _mmss(seconds: int) -> str:
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def compile_structure(req: dict) -> tuple[str, list[dict]]:
    """structure + energy_curve -> [mm:ss] timestamp prose (the guide's own mechanism), s3.1.

    Bars convert to seconds through the requested tempo and meter (beats-per-bar from the time
    signature's numerator); intensity per section is sampled from the energy curve preset or points.
    Returns (prose, compiled_plan) — the plan goes into bindings so the caller sees every number.
    """
    structure = req.get("structure")
    if not structure:
        return "", []
    tempo = req.get("tempo_bpm", 120)
    ts = req.get("time_signature", "4/4")
    beats_per_bar = int(str(ts).split("/")[0])
    seconds_per_bar = beats_per_bar * 60.0 / float(tempo)

    curve = req.get("energy_curve") or {}
    points = curve.get("points") or []
    target = ((req.get("duration") or {}).get("target_seconds")) or max(
        1, round(sum(s["bars"] for s in structure) * seconds_per_bar))

    def intensity_at(t: float) -> float | None:
        if not points:
            return None
        prev = points[0]
        for pt in points:
            if pt["t"] >= t:
                span = pt["t"] - prev["t"]
                if span <= 0:
                    return pt["v"]
                w = (t - prev["t"]) / span
                return prev["v"] + w * (pt["v"] - prev["v"])
            prev = pt
        return points[-1]["v"]

    plan, lines, at = [], [], 0.0
    for sec in structure:
        start = at
        length = sec["bars"] * seconds_per_bar
        at += length
        entry = {"section": sec["section"], "start_seconds": round(start, 1),
                 "end_seconds": round(at, 1), "bars": sec["bars"]}
        line = f"[{_mmss(int(start))}] {sec['section'].replace('_', '-')}"
        level = intensity_at(start + length / 2.0)
        if level is not None:
            entry["intensity_1_to_10"] = max(1, min(10, round(level * 10)))
            line += f", intensity {entry['intensity_1_to_10']}/10"
        plan.append(entry)
        lines.append(line)
    # The end marker may only follow the LAST section: an out-of-order timestamp ("[00:37] outro;
    # [00:30] end", measured 2026-08-17 on a 30 s target with a longer structure) hands the model a
    # contradictory timeline. When the structure overruns the target the marker is omitted and the
    # overrun is REPORTED in the plan (duration enforcement trims later; the report keeps it honest).
    if target - at > 1.0:
        lines.append(f"[{_mmss(int(target))}] end")
    elif at - target > 1.0:
        plan.append({"warning": f"structure spans {round(at, 1)}s but duration.target_seconds is "
                                f"{target}s — no end marker sent; the delivery stage enforces the "
                                f"target on the delivered file"})
    return "Song structure: " + "; ".join(lines) + ".", plan


def compile_mood_orbit(req: dict) -> str:
    """mood_orbit vector -> deterministic clause via the versioned lexicon (s3.2).

    THE WIRE SHAPE IS THE SPEC'S OWN: `{"axes": {"<pole>": 0..1}}` (param_spec.json `mood_orbit.fields`).
    WHY THIS IS STATED (measured 2026-08-17, differential wiring audit): this compiler previously
    assumed a FLAT `{pole: value}` dict while the spec declared `axes` — so a spec-conformant request
    raised TypeError here (a 500 on the live route, not even a refusal), and only the two R&D scripts
    that happened to use the flat shape ever exercised this path. The validator now enforces the
    spec's shape (models.validate_request block 5), and this compiler consumes exactly that shape —
    served, enforced and compiled are one shape, by import of the same spec document.
    """
    orbit = req.get("mood_orbit")
    vec = orbit.get("axes") if isinstance(orbit, dict) else None
    if not vec:
        return ""
    lex = _lexicon("mood_orbit_lexicon.json")
    ranked = sorted(((v, k) for k, v in vec.items() if v > 0 and k in lex["poles"]), reverse=True)[:2]
    if not ranked:
        return ""
    parts = []
    for value, pole in ranked:
        tier = next(t for t in lex["intensity_tiers"] if t["min"] <= value < t["max"])
        parts.append(f"{tier['adverb']} {lex['poles'][pole]}")
    return "The mood is " + ", and ".join(parts) + "."


def compile_controls(req: dict) -> tuple[str, dict]:
    """0-10 knobs -> graded prose per the knob lexicon's OWN combination rule (s3.4), verbatim.

    The rule (data/knob_grade_lexicon.json `combination_rule`, quoted): each knob renders as its
    tier's clause; clauses join with '; ' in the fixed order harmony_complexity, rhythm_density,
    sonic_polish. THE ABSENCE OF THIS FUNCTION WAS A MEASURED SILENT DROP (2026-08-17): the
    lexicon's own `consumed_by` names planner.py, the bindings claimed "compiled", and no clause
    was ever sent — rhythm_density among the dropped knobs, which is exactly the axis of Berk's
    D-SSM-31 monotony verdict.
    """
    controls = req.get("controls")
    if not controls:
        return "", {}
    lexicon = _lexicon("knob_grade_lexicon.json")
    tiers = lexicon["tiers"]
    clauses, detail = [], {}
    for knob in ("harmony_complexity", "rhythm_density", "sonic_polish"):  # the rule's fixed order
        if knob not in controls:
            continue
        value = int(controls[knob])
        tier = next(t for t in tiers if t["min"] <= value <= t["max"])
        clause = lexicon["knobs"][knob]["clauses"][tier["id"]]
        clauses.append(clause)
        detail[knob] = {"value": value, "tier": tier["id"], "sent_clause": clause}
    if not clauses:
        return "", {}
    return "Character: " + "; ".join(clauses) + ".", detail


def compile_prompt(req: dict) -> tuple[str, dict]:
    """The full Lyria prompt per Google's own formula. Returns (prompt, bindings_detail)."""
    bindings: dict = {}
    parts: list[str] = []

    goal = req.get("creative_goal")
    if goal:
        clause = _lexicon("creative_goal_lexicon.json")["clauses"].get(goal)
        if clause is None:
            raise models.SpecError(f"creative_goal '{goal}' passed validation but has no lexicon clause "
                                   f"— the spec and the lexicon have drifted, which is a deployment fault")
        parts.append(clause)
        bindings["creative_goal"] = {"binding": "prose", "sent": clause}

    genres = req.get("genres") or []
    if genres:
        sent = "Genre and style: " + ", ".join(_label_for("genres", g) for g in genres) + "."
        parts.append(sent)
        bindings["genres"] = {"binding": "prose", "sent": sent}

    # ERA / STYLISTIC TIMEFRAME — a SEPARATE axis, compiled into the same slot Google's framework
    # puts it in. Its guide (2026-04-07, read [FULL] 2026-08-18) states: "Reference genres and eras:
    # Clearly state the musical category (for example, Rock or Pop) and stylistic timeframe (e.g. the
    # 1950s, early 90s)." The era is therefore emitted right after the genre clause rather than mixed
    # into it, because AcousticBrainz taxonomy practice strips era tokens out of genre vocabularies
    # (research contradiction CT-8). The modifier-before-decade order reproduces Google's own
    # "early 90s" construction, and the ORDER IS TAKEN FROM THE VOCABULARY'S OWN axis field rather
    # than from the order the caller happened to send.
    eras = req.get("eras") or []
    if eras:
        era_axis_of = _era_axis_index()
        modifiers = [identifier for identifier in eras
                     if era_axis_of.get(identifier) == "period_modifier"]
        decades = [identifier for identifier in eras if era_axis_of.get(identifier) == "decade"]
        unclassified = [identifier for identifier in eras
                        if identifier not in modifiers and identifier not in decades]
        phrase = " ".join(_label_for("eras", identifier)
                          for identifier in (*modifiers, *decades, *unclassified))
        sent = f"Stylistic timeframe: {phrase}."
        parts.append(sent)
        bindings["eras"] = {"binding": "prose", "sent": sent}

    moods = req.get("moods") or []
    if moods:
        sent = "Mood: " + ", ".join(_label_for("moods", m) for m in moods) + "."
        parts.append(sent)
        bindings["moods"] = {"binding": "prose", "sent": sent}
    orbit_clause = compile_mood_orbit(req)
    if orbit_clause:
        parts.append(orbit_clause)
        bindings["mood_orbit"] = {"binding": "compiled", "sent": orbit_clause}

    instruments = req.get("instruments") or []
    if instruments:
        sent = "Instrumentation: " + ", ".join(_label_for("instruments", i) for i in instruments) + "."
        parts.append(sent)
        bindings["instruments"] = {"binding": "prose", "sent": sent}

    sent_bits = []
    if req.get("tempo_bpm"):
        sent_bits.append(f"Tempo {req['tempo_bpm']} BPM")
    if req.get("time_signature"):
        sent_bits.append(f"time signature {req['time_signature']}")
    key = req.get("key")
    if isinstance(key, str) and "|" in key:
        root, mode = key.split("|", 1)
        sent_bits.append(f"key {root} {mode}")
    if sent_bits:
        sent = "Tempo and rhythm: " + ", ".join(sent_bits) + "."
        parts.append(sent)
        for name in ("tempo_bpm", "time_signature", "key"):
            if req.get(name):
                bindings[name] = {"binding": "prose", "sent": sent}

    structure_prose, plan = compile_structure(req)
    if structure_prose:
        parts.append(structure_prose)
        bindings["structure"] = {"binding": "compiled", "sent": structure_prose, "plan": plan}

    # DURATION PROSE HINT (wired 2026-08-23, MUS-API-009). Neither Lyria surface has a duration
    # field (measured; music_lyria REFUSED_FIELDS), so the only request-time carrier is PROSE — the
    # exact sentence form the delegate worker itself uses for duration_hint_seconds (music_lyria/
    # models.py build_prompt, the measured route). Before this date the target reached the model
    # only implicitly via structure timestamps; measured miss on 2026-08-23: 135 s asked, 182.6 s
    # delivered. The prose is a REQUEST, not a control: enforcement stays with the conform stage
    # (duration.on_miss), and the binding class says so honestly.
    duration_target = ((req.get("duration") or {}).get("target_seconds"))
    if duration_target:
        sent = (f"The piece is approximately {int(duration_target)} seconds long, "
                f"continuous from beginning to end.")
        parts.append(sent)
        bindings["duration"] = {
            "binding": "prose_hint_plus_enforced", "sent": sent,
            "note": "prose length request (no vendor duration field exists — measured); the conform "
                    "stage enforces target±tolerance on the delivered file per duration.on_miss "
                    "when it runs (render_plan.conform)"}

    curve = req.get("energy_curve") or {}
    if curve:
        if curve.get("points"):
            # Real points sampled per section inside compile_structure — genuinely stepwise.
            bindings["energy_curve"] = {"binding": "compiled_stepwise", "plan": plan}
        else:
            # Preset WITHOUT points: no numeric shape exists anywhere in the spec, and inventing
            # one is forbidden (CLAUSE 4). The spec's own label parenthetical IS the preset's
            # defined meaning, so it compiles as prose — and the binding says PROSE, because
            # claiming compiled_stepwise here was a measured bindings lie (2026-08-17).
            label = _field_label("energy_curve", "preset", curve.get("preset", ""))
            shape = label.split("(", 1)[1].rstrip(")") if "(" in label else label
            sent = f"Energy over time: {shape}."
            parts.append(sent)
            bindings["energy_curve"] = {"binding": "prose", "sent": sent,
                                        "note": "preset label prose; stepwise intensity requires points"}

    controls_prose, controls_detail = compile_controls(req)
    if controls_prose:
        parts.append(controls_prose)
        bindings["controls"] = {"binding": "compiled", "sent": controls_prose,
                                "knobs": controls_detail}

    tags = req.get("sonic_tags") or []
    if tags:
        sent = "Sound character: " + ", ".join(_label_for("sonic_tags", t) for t in tags) + "."
        parts.append(sent)
        bindings["sonic_tags"] = {"binding": "prose", "sent": sent}

    blocks = req.get("prompt_blocks") or []
    if blocks:
        # WEIGHT AS ORDER (wired 2026-08-23, MUS-API-009): no measured vendor mechanism weights a
        # prose clause, so POSITION is the only lawful carrier — blocks render highest-weight-first
        # (stable sort: equal weights keep the caller's order). Before this date the weight was
        # accepted and reported but changed nothing about what was sent.
        ordered_blocks = sorted(blocks, key=lambda b: float(b.get("weight", 0.0)), reverse=True)
        block_sentences = []
        for block in ordered_blocks:
            role_label = _field_label("prompt_blocks", "role", block.get("role", "")).split("/")[0].strip()
            block_sentences.append(f"{role_label}: {block.get('text', '').strip()}")
        sent = " ".join(s.rstrip(".") + "." for s in block_sentences if s.split(":", 1)[1].strip())
        if sent:
            parts.append(sent)
        bindings["prompt_blocks"] = {
            "binding": "prose", "sent": sent,
            "weight": "compiled_as_order — blocks are sent highest-weight-first (position is the only "
                      "carrier a prose surface offers; no vendor field weights a clause); the sent "
                      "order is exactly the order in `sent`",
            "sent_order": [b.get("role") for b in ordered_blocks]}

    references = req.get("references") or []
    if references:
        descriptor_texts = [r.get("text", "").strip() for r in references
                            if r.get("kind") == "descriptor" and r.get("text", "").strip()]
        media_kinds = [r.get("kind") for r in references if r.get("kind") != "descriptor"]
        sent = ""
        if descriptor_texts:
            sent = "Inspired by this sonic character: " + "; ".join(descriptor_texts) + "."
            parts.append(sent)
        bindings["references"] = {"binding": "compiled" if sent else "reported_not_compiled",
                                  "sent": sent,
                                  "media_note": (f"{len(media_kinds)} audio/midi reference(s) NOT "
                                                 f"compiled — no analysis stage exists yet; reported, "
                                                 f"never silently dropped") if media_kinds else None}

    if req.get("prompt"):
        parts.append(req["prompt"])
        bindings["prompt"] = {"binding": "typed"}

    # ---- PARAMETERS WHOSE CONSUMPTION IS NOT A PROMPT CLAUSE, EACH WITH ITS HONEST CLASS ----
    # (added 2026-08-17 after the differential wiring audit measured all three as ACCEPTED-AND-
    # IGNORED: no production change, no declaration — the exact L53 class in new places.)
    if req.get("project"):
        # Metadata, consumed by the DELIVERY stage: the render plan's deliver step names the track
        # from it (lambda_function._render_plan), and the response echoes it for provenance.
        bindings["project"] = {"binding": "metadata",
                               "consumed_by": "render_plan.deliver (track naming) + response echo",
                               "value": req["project"]}
    enhance = req.get("prompt_enhance") or {}
    if enhance:
        # The rewrite stage is NOT BUILT. A pretend-rewrite would be the fake class, and injecting
        # meta-instructions into a MUSIC prompt is banned by the prompt laws — so the honest state
        # is a named declaration, never a silent drop (the references media_note pattern).
        bindings["prompt_enhance"] = {
            "binding": "reported_not_compiled",
            "note": ("rewrite stage not built: enabled=true returns the ORIGINAL prompt and this "
                     "note; a silent pretend-rewrite or a meta-instruction injected into the music "
                     "prompt would each be the banned class"),
            "requested": enhance}
    if req.get("arrangement_ai"):
        bindings["arrangement_ai"] = {
            "binding": "reported_not_compiled",
            "note": ("suggestion engine not built: 'on' is recorded and returns no suggestions "
                     "yet; the toggle is honest state, never a silent capability claim"),
            "requested": req["arrangement_ai"]}

    vocal = req.get("vocal") or {}
    lyr = req.get("lyrics") or {}
    if vocal.get("mode") and vocal["mode"] != "instrumental":
        sent = f"Vocal style: a {vocal['mode'].replace('_', ' ')} voice, singing in {vocal.get('language', 'en')}."
        parts.append(sent)
        bindings["vocal"] = {"binding": "prose", "sent": sent}
    if lyr.get("mode") == "custom" and lyr.get("text"):
        # The measured convention (generation-proven 2026-08-13): exact words, in quotes.
        # R0 raw orthography is the DEFAULT per D-SSM-25; R1 escalates only on a measured failure.
        sent = f'The singer sings these exact words, slowly and clearly: "{lyr["text"]}".'
        parts.append(sent)
        bindings["lyrics"] = {"binding": "typed", "convention": "Lyrics-in-quotes (measured)",
                              "orthography_route": "R0 (default per D-SSM-25)"}
    elif lyr.get("mode") == "ai_write":
        # THEME-DRIVEN LYRICS (wired 2026-08-17 — the differential audit measured ai_write as
        # accepted-and-ignored: the theme reached nothing). The model that sings is the model that
        # writes here: lyria-3-pro composes its own words when ASKED IN THE PROMPT, which is the
        # same generation surface the quotes convention rides. The theme is the user's DATA and is
        # quoted verbatim; the validator (models.py block 3) refuses ai_write+instrumental the same
        # way it refuses custom+instrumental, so this clause can never be silently voiceless.
        theme = (lyr.get("theme") or "").strip()
        sent = (f'The singer sings original lyrics about: "{theme}".' if theme
                else "The singer sings original lyrics fitting the mood and story of the music.")
        parts.append(sent)
        bindings["lyrics"] = {"binding": "prose", "sent": sent,
                              "note": "ai_write: the generation model composes the words; the theme "
                                      "is quoted verbatim as DATA"}

    negatives = req.get("negative_prompt") or []
    if negatives:
        sent = "Avoid: " + ", ".join(_label_for("negative_prompt", n) for n in negatives) + "."
        parts.append(sent)
        bindings["negative_prompt"] = {
            "binding": "prose",
            "sent": sent,
            "note": "single carrier by measurement (2026-08-23): this prose form passed the vendor's "
                    "content policy on a delivered generation; forwarding the list typed as well made "
                    "the delegate fold it a second time and the doubled negation was the only new "
                    "element in a content_blocked request"}

    return " ".join(parts), bindings


def plan(req: dict) -> dict:
    """validate -> route -> compile. The single entry the transport shell calls."""
    result = models.validate_request(req)
    if not result.ok:
        return {"ok": False, "refusals": result.refusals}
    route = choose_route(req)
    prompt, bindings = compile_prompt(req)
    bindings.update({k: v for k, v in result.bindings.items() if k not in bindings})

    # TAKES (wired 2026-08-23, MUS-API-009): output_package=variations drives N separate delegate
    # generations in the conductor — one uniform path on BOTH surfaces, because sampleCount is a
    # :predict-only envelope field and the Interactions body was measured to accept only
    # {model, input} (music_lyria/models.py). The default count comes from the SPEC's own default
    # (single source of truth), never from a number typed here.
    takes = 1
    if req.get("output_package") == "variations":
        spec_params = {p["name"]: p for p in models.load_spec()["parameters"]}
        spec_default = ((spec_params.get("variation_count") or {}).get("default") or {}).get("value", 2)
        takes = int(req.get("variation_count") or spec_default)
        bindings["output_package"] = {
            "binding": "our_stage",
            "takes": takes,
            "note": "variations: the conductor issues this many separate generations (each bills one "
                    "call, Clause 22); seed is not bit-deterministic (measured 23.87 dB apart), so "
                    "every take is a REAL alternative"}

    return {
        "ok": True,
        "route": route,
        "generation_payload": {
            "prompt": prompt,
            "model": route["model"],
            "instrumental_only": (req.get("vocal") or {}).get("mode", "instrumental") == "instrumental",
            "takes": takes,
        },
        "bindings": bindings,
        "language_fallback": result.language_fallback,
    }
