"""Request validation for POST /generate-music-hybrid-model — driven ENTIRELY by param_spec.json.

THE ONE DESIGN RULE (D-SSM-23): this module contains NO hand-maintained field list, enum, cap or
default. Everything is loaded from `music_studio/param_spec.json` and the data files it imports —
the same document the BeforeTomorrow UI renders from and the v5 doc section is generated from.
Three consumers, one source of truth, agreement BY IMPORT (two lists kept in agreement by
discipline is the defect measured four times in this repository).

What this layer does, at the system boundary:
  - an UNKNOWN top-level field is REFUSED BY NAME with the allowed list (the accepted-and-ignored
    class is banned: `speech_config.voice` was documented, sent, and measured INERT);
  - every value is validated against the spec's predefined values / ranges / caps;
  - `active_when` dependencies are enforced (e.g. lyrics.text only with mode=custom);
  - `vocal.language` / `lyrics.language` are validated against the LANGUAGE REGISTRY
    (data/language_registry.json, D-SSM-17): sung requires SINGING_PROVEN, spoken requires
    SPEECH_PROVEN; anything else is refused WITH ITS STATE AND ITS UNLOCK, or falls back under
    `language_policy: prefer_proven` with an explicit `language_fallback` record — never silently;
  - the per-parameter BINDING class from the spec is carried into the bindings report the response
    returns, so a caller can always distinguish a setting from a wish.

Error envelope on refusal matches the repo standard: {success: false, error, error_code, request_id}.
Controls: scripts/test_music_studio_contracts.py (both directions — pass AND refuse).
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

_PKG_DIR = Path(__file__).resolve().parent
SPEC_PATH = _PKG_DIR / "param_spec.json"
EXPECTED_SCHEMA = "berk.music-studio-param-spec/v1"

#: The registry's spec-relative path — the SAME string the spec's field-level `values_import` carries, so the
#: import target and the loader agree by this one constant instead of by two spellings kept in step.
LANGUAGE_REGISTRY_PATH = "data/language_registry.json"

_spec_cache: dict | None = None
_vocab_cache: dict[str, dict] = {}


class SpecError(RuntimeError):
    """The spec itself is unusable — a deployment fault, never a caller fault."""


def load_spec() -> dict:
    """Load and sanity-check the spec. Fails LOUDLY: a worker running without its contract
    document must not accept a single request (fail-open here would be the unwired class)."""
    global _spec_cache
    if _spec_cache is None:
        if not SPEC_PATH.exists():
            raise SpecError(f"param spec missing at {SPEC_PATH}")
        spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
        if spec.get("$schema_id") != EXPECTED_SCHEMA:
            raise SpecError(f"spec schema is {spec.get('$schema_id')!r}, expected {EXPECTED_SCHEMA!r}")
        if not spec.get("parameters"):
            raise SpecError("spec carries zero parameters")
        _spec_cache = spec
    return _spec_cache


def load_vocabulary(rel_path: str) -> list[dict]:
    """Resolve a values_import to its flat entry list; broken imports fail loudly at load."""
    if rel_path not in _vocab_cache:
        p = _PKG_DIR / rel_path
        if not p.exists():
            raise SpecError(f"vocabulary import missing: {rel_path}")
        doc = json.loads(p.read_text(encoding="utf-8"))
        entries: list[dict] = []
        for group in doc.get("groups", []):
            entries.extend(group.get("entries", []))
        if not entries:
            raise SpecError(f"vocabulary {rel_path} carries zero entries")
        _vocab_cache[rel_path] = {"doc": doc, "entries": entries}
    return _vocab_cache[rel_path]["entries"]


def load_vocabulary_document(rel_path: str) -> dict:
    """The WHOLE vocabulary document for a values_import, including its group-level fields.

    WHY THIS EXISTS BESIDE load_vocabulary (added 2026-08-18 for the era axis): load_vocabulary
    flattens the groups away, which is right for validation — the allowed set is the union of the
    entries. But some group-level facts are load-bearing for COMPILATION, not just for provenance:
    era_vocabulary.json declares `axis` per group ("decade" vs "period_modifier"), and the planner
    must know which selected value is which to reproduce Google's own "early 90s" word order. This
    accessor returns the already-cached document rather than re-reading the file, so there is exactly
    one loader and the two views cannot drift apart.
    """
    load_vocabulary(rel_path)  # populates and validates the cache entry, or raises SpecError
    return _vocab_cache[rel_path]["doc"]


def load_language_registry() -> dict:
    if LANGUAGE_REGISTRY_PATH not in _vocab_cache:
        p = _PKG_DIR / LANGUAGE_REGISTRY_PATH
        if not p.exists():
            raise SpecError("language registry missing (D-SSM-17: the enum is GENERATED from it)")
        _vocab_cache[LANGUAGE_REGISTRY_PATH] = {"doc": json.loads(p.read_text(encoding="utf-8"))}
    return _vocab_cache[LANGUAGE_REGISTRY_PATH]["doc"]


def language_value_entries() -> list[dict]:
    """Project the language registry into VALUE ENTRIES for the discoverable surface (research item A14).

    WHY THIS EXISTS — a measured served-vs-enforced divergence, 2026-08-15. `_check_language` below enforces
    the language from THIS registry, per axis (`sung` needs SINGING_PROVEN, `spoken` needs SPEECH_PROVEN),
    while `capabilities()` served `vocal.fields.language` as a PROSE SENTENCE and nothing else. So a client
    could not know which codes the validator would accept: the two lists agreed only by DISCIPLINE, which
    Supreme Law prohibition 6 forbids by name. This function is the import that replaces that discipline.

    A separate projection rather than `load_vocabulary` because the shapes genuinely differ — the registry is
    `languages[]` keyed by `code`, not `groups[].entries[]` — the same reason `load_knob_lexicon` exists
    (documented there: loosening `load_vocabulary` would have made it accept a document it cannot read).

    Each entry carries the per-axis STATE the validator tests, so the UI renders the honest badge instead of a
    silent list, plus the measured `bar`/`measured_per`/`coverage_score` values (which today are all
    `NOT_MEASURED` with their reasons — A9's calibration corpus, A12, does not exist).

    AND EACH ENTRY NOW CARRIES `intelligibility_gate`, PROJECTED FROM THE GATE ITSELF (2026-08-17).
    The same served-versus-enforced divergence had reappeared in a second place: `per_gate` gained a
    per-language dispatch table (English joined Turkish), it returns `NOT_RUN` for a language with no
    sourced phonemiser, and this projection said nothing about it — so a client could select any of
    the eleven registry languages and only discover at scoring time that its lyric could not be
    phonemised at all. The state is read from `per_gate.supported_languages()`, never restated here,
    so the surface and the gate cannot drift apart.
    """
    registry = load_language_registry()
    # Imported INSIDE the function on purpose: `per_gate` pulls in the phonemiser modules, and the
    # spec/vocabulary path of this module is used by callers that never score a lyric. The import is
    # cheap (the dispatch table holds lazy loaders; no lexicon is read until a word is phonemised).
    from . import per_gate

    gate_languages = per_gate.supported_languages()
    entries: list[dict] = []
    for language in registry["languages"]:
        code = language["code"]
        gate = gate_languages.get(code)
        entries.append({
            "id": code,
            "label": language.get("label", code),
            # The two axes the validator actually branches on — never a single blended "supported" flag.
            "singing": language.get("singing"),
            "speech": language.get("speech"),
            "coverage_score": language.get("coverage_score"),
            "measured_per": language.get("measured_per"),
            "bar": language.get("bar"),
            "protocol": language.get("protocol"),
            "established": language.get("established"),
            # Whether the intelligibility gate can phonemise this language AT ALL — the honest
            # precondition of every PER number, projected from the gate's own dispatch table.
            "intelligibility_gate": ({"state": "PHONEMISER_AVAILABLE", **gate} if gate else
                                     {"state": "NO_PHONEMISER",
                                      "reason": "no sourced phonemiser for this language exists in "
                                                "this package, so per_gate returns NOT_RUN; a "
                                                "substituted phonemiser would measure the "
                                                "substitute, not the singing (D-SSM-34: every "
                                                "registry language earns this path by getting its "
                                                "own sourced grapheme-to-phoneme module)"}),
        })
    if not entries:
        raise SpecError(
            "the language registry projected zero entries; serving an empty list would silently offer the "
            "user no language at all (D-SSM-17: the enum is GENERATED from the registry)")
    return entries


def load_knob_lexicon(rel_path: str) -> dict:
    """Resolve a `presets_import` — a TIER-SHAPED lexicon, which is not a groups[].entries[] vocabulary.

    WHY A SECOND LOADER RATHER THAN LOOSENING `load_vocabulary`: on 2026-08-15 the knob lexicon was first
    pointed at `values_import`, and `load_vocabulary` correctly REFUSED it ("carries zero entries")
    because that key's contract is a flat id/label vocabulary. Widening that loader to accept a second
    shape would have made both shapes unverifiable at the boundary. A different shape gets its own typed
    key and its own loader, and this one VALIDATES the shape it contracts: five tiers partitioning the
    slider range, and one clause per tier per knob. A missing clause is a loud failure at load, never a
    silently empty combo in the UI.
    """
    if rel_path not in _vocab_cache:
        p = _PKG_DIR / rel_path
        if not p.exists():
            raise SpecError(f"knob preset lexicon missing: {rel_path}")
        doc = json.loads(p.read_text(encoding="utf-8"))
        tiers = doc.get("tiers") or []
        knobs = doc.get("knobs") or {}
        if not tiers or not knobs:
            raise SpecError(f"{rel_path} carries no tiers or no knobs")
        tier_ids = [t["id"] for t in tiers]
        covered: set[int] = set()
        for tier in tiers:
            covered.update(range(tier["min"], tier["max"] + 1))
        if len(covered) != sum(t["max"] - t["min"] + 1 for t in tiers):
            raise SpecError(f"{rel_path}: tiers overlap — a slider value would land in two tiers")
        for knob_name, knob in knobs.items():
            missing = [t for t in tier_ids if t not in (knob.get("clauses") or {})]
            if missing:
                raise SpecError(f"{rel_path}: knob {knob_name} has no clause for tier(s) {missing}")
            if not knob.get("binding"):
                raise SpecError(f"{rel_path}: knob {knob_name} declares no binding class")
        _vocab_cache[rel_path] = {"doc": doc}
    return _vocab_cache[rel_path]["doc"]


def allowed_value_ids(param: dict) -> set[str] | None:
    """The predefined id set for a spec entry, resolving imports and generated products.
    None means the entry is free-form by contract (free_text or fields-shaped)."""
    if param.get("values"):
        return {v["id"] for v in param["values"]}
    imp = param.get("values_import")
    if isinstance(imp, str) and imp.startswith("data/"):
        return {e["id"] for e in load_vocabulary(imp)}
    gen = param.get("values_generated")
    if gen and "roots" in gen and "modes" in gen:
        return {f"{r}|{m}" for r in gen["roots"] for m in gen["modes"]}
    return None


@dataclass
class ValidationResult:
    ok: bool
    normalized: dict = field(default_factory=dict)
    refusals: list[str] = field(default_factory=list)
    bindings: dict = field(default_factory=dict)
    language_fallback: dict | None = None

    def envelope(self, request_id: str) -> dict | None:
        """The repo-standard error envelope, or None when the request is valid."""
        if self.ok:
            return None
        return {
            "success": False,
            "error": "; ".join(self.refusals),
            "error_code": "INVALID_REQUEST",
            "request_id": request_id,
            "refused": self.refusals,
        }


def _check_language(mode: str, lang: str, policy: str, result: ValidationResult) -> None:
    """Registry validation per D-SSM-17: sung needs SINGING_PROVEN, spoken needs SPEECH_PROVEN.
    Refusals carry the language's STATE and its UNLOCK; prefer_proven records an explicit fallback."""
    reg = load_language_registry()
    by_code = {l["code"]: l for l in reg["languages"]}
    entry = by_code.get(lang)
    if entry is None:
        result.refusals.append(
            f"language '{lang}' is not in the registry; registered: {sorted(by_code)} "
            f"(D-SSM-17: a language enters ONLY through data/language_registry.json with evidence)")
        return
    if mode == "instrumental":
        return  # no vocal, no language proof needed
    axis = "speech" if mode == "spoken" else "singing"
    needed = "SPEECH_PROVEN" if axis == "speech" else "SINGING_PROVEN"
    state = entry.get(axis)
    if state == needed:
        return
    proven = [l["code"] for l in reg["languages"] if l.get(axis) == needed]
    if policy == "prefer_proven" and proven:
        result.language_fallback = {
            "requested": lang, "requested_state": state,
            "delivered": proven[0],
            "reason": f"{axis} for '{lang}' is {state}, not {needed}; prefer_proven fell back — never silently",
        }
        return
    result.refusals.append(
        f"vocal.language '{lang}' refused for mode={mode}: {axis} state is {state}, {needed} required. "
        f"Evidence: {entry.get('evidence', 'none recorded')}. "
        f"Unlock: the calibration protocol of D-SSM-17 (>=3 songs past a bar calibrated on {lang} material). "
        f"Currently {needed} languages: {proven if proven else 'NONE — the measurement round has not run'}")


def validate_request(body: dict) -> ValidationResult:
    """Validate one request body against the spec. Pure function of (body, spec, data files)."""
    spec = load_spec()
    params = {p["name"]: p for p in spec["parameters"]}
    result = ValidationResult(ok=True)

    if not isinstance(body, dict):
        result.ok = False
        result.refusals.append("request body must be a JSON object")
        return result

    # 1. Unknown fields: refused BY NAME with the allowed list (never accepted-and-ignored).
    request_params = {n for n, p in params.items() if p.get("binding") != "response_field"}
    unknown = sorted(set(body) - request_params)
    if unknown:
        result.refusals.append(
            f"unknown field(s) {unknown} refused; this endpoint accepts exactly: {sorted(request_params)}")

    # 1b. Required fields: prompt is the only field without which generation cannot proceed.
    #      Every other field has a meaningful default; prompt does not (the spec's own default is null
    #      with evidence "no default"). Catching it here returns 400 INVALID_REQUEST instead of letting
    #      the request reach the delegate which would return 502 GENERATION_FAILED with "prompt is
    #      required" — the exact anomaly recorded as MUS-API-006 (2026-08-19).
    prompt_val = body.get("prompt")
    if not prompt_val or (isinstance(prompt_val, str) and not prompt_val.strip()):
        result.refusals.append("prompt is required (the only field with no meaningful default)")

    # 2. Per-parameter validation against the spec's own value sets, ranges and caps.
    for name, value in body.items():
        p = params.get(name)
        if p is None:
            continue  # already refused above
        result.bindings[name] = {"binding": p.get("binding")}
        ids = allowed_value_ids(p)
        control = p.get("control")

        if control == "combo" and ids is not None and not p.get("fields"):
            if not isinstance(value, str) or value not in ids:
                result.refusals.append(f"{name}: {value!r} is not one of the predefined values {sorted(ids)}")
        elif control == "multi-select" and ids is not None:
            if not isinstance(value, list):
                result.refusals.append(f"{name}: expected a list of predefined ids")
            else:
                bad = [v for v in value if v not in ids]
                if bad:
                    result.refusals.append(f"{name}: unknown value(s) {bad}; allowed: {sorted(ids)}")
                cap = (p.get("constraints") or {}).get("max_selected")
                if cap and len(value) > cap:
                    result.refusals.append(f"{name}: {len(value)} selected, max_selected is {cap}")
        elif control == "slider" and isinstance(value, (int, float)):
            c = p.get("constraints") or {}
            if "min" in c and value < c["min"] or "max" in c and value > c["max"]:
                result.refusals.append(f"{name}: {value} outside [{c.get('min')}, {c.get('max')}]")
        elif control == "text" and isinstance(value, str):
            cap = (p.get("constraints") or {}).get("max_length")
            if cap and len(value) > cap:
                result.refusals.append(f"{name}: {len(value)} chars exceeds max_length {cap}")

    # 3. Structured fields with dependencies (the active_when contracts of the spec).
    vocal = body.get("vocal") or {}
    lyr = body.get("lyrics") or {}
    if isinstance(vocal, dict) and vocal:
        mode = vocal.get("mode", "instrumental")
        vp = params["vocal"]
        mode_ids = {v["id"] for v in vp["fields"]["mode"]["values"]}
        if mode not in mode_ids:
            result.refusals.append(f"vocal.mode: {mode!r} not in {sorted(mode_ids)}")
        else:
            _check_language(mode, vocal.get("language", "en"),
                            vocal.get("language_policy", "strict"), result)
    if isinstance(lyr, dict) and lyr:
        lmode = lyr.get("mode", "none")
        if lmode == "custom" and not (lyr.get("text") or "").strip():
            result.refusals.append("lyrics.mode=custom requires lyrics.text (active_when contract)")
        if lmode != "custom" and lyr.get("text"):
            result.refusals.append("lyrics.text is only active when lyrics.mode=custom; sending it "
                                   "otherwise would be accepted-and-ignored, which is the banned class")
        if lmode == "custom" and isinstance(vocal, dict) and vocal.get("mode", "instrumental") == "instrumental":
            result.refusals.append("lyrics.mode=custom contradicts vocal.mode=instrumental — dictated "
                                   "words with no voice would be silently dropped by the model; choose one")
        if lmode == "ai_write" and isinstance(vocal, dict) and vocal.get("mode", "instrumental") == "instrumental":
            # Same contradiction class as custom+instrumental (wired 2026-08-17 with the ai_write
            # compile clause): theme-driven lyrics with no voice would be accepted-and-ignored.
            result.refusals.append("lyrics.mode=ai_write contradicts vocal.mode=instrumental — "
                                   "AI-written words with no voice would be silently dropped; choose one")

    # 4. References: a named commercial track is a LEGAL refusal (architecture s1.3, D-SSM-14).
    for i, ref in enumerate(body.get("references") or []):
        kind = (ref or {}).get("kind")
        if kind not in {"user_audio", "midi", "descriptor"}:
            result.refusals.append(f"references[{i}].kind {kind!r} not in ['user_audio','midi','descriptor'] "
                                   "(a NAMED commercial track is refused: provider terms forbid artist/song "
                                   "names as inputs, and D-SSM-14 bans competitor output)")

    # 4b. VARIATION COUNT depends on output_package=variations (active_when contract, wired 2026-08-23
    # MUS-API-009). Sending it otherwise would be accepted-and-ignored — the banned class — and
    # variations without a count would silently mean an agent-chosen N, which CLAUSE 4 forbids.
    if body.get("variation_count") is not None and body.get("output_package") != "variations":
        result.refusals.append("variation_count is only active when output_package=variations; sending it "
                               "otherwise would be accepted-and-ignored, which is the banned class")

    # 4c. WEBHOOK URL scheme (wired 2026-08-23, MUS-API-009): the spec declared type https_uri and no
    # code enforced it — served and enforced agreed only by discipline. The conductor will POST the
    # response envelope to this URL, so a non-https target would leak the delivery over plaintext.
    webhook = body.get("webhook_url")
    if webhook is not None and (not isinstance(webhook, str) or not webhook.startswith("https://")):
        result.refusals.append("webhook_url must be an https:// URL (the spec's declared https_uri type; "
                               "the response envelope is POSTed there and plaintext delivery is refused)")

    # 4d. LABELS shape (wired 2026-08-23, MUS-API-009): the delegate contract is Dict[str, str]
    # (music_lyria/models.py `labels`); anything else would fail inside the paid call instead of here.
    labels = body.get("labels")
    if labels is not None and (not isinstance(labels, dict)
                               or not all(isinstance(k, str) and isinstance(v, str)
                                          for k, v in labels.items())):
        result.refusals.append("labels must be an object of string keys to string values "
                               "(the delegate worker's own contract: music_lyria labels Dict[str, str])")

    # 5. Mood orbit: validated against the spec's OWN declared shape ({axes: {pole: 0..1}}) and the
    # spec's own axis ids and value_range — BY IMPORT, never a retyped pole list. WHY THIS BLOCK
    # EXISTS (measured 2026-08-17 by the differential wiring audit): the spec declared the `axes`
    # wire shape, this validator never checked the field at all, and the compiler assumed a FLAT
    # dict — so a spec-conformant request crashed compile_mood_orbit with a TypeError (a 500 on the
    # live route, not even a refusal). Served, enforced and compiled must be ONE shape.
    orbit = body.get("mood_orbit")
    if orbit is not None:
        orbit_param = params["mood_orbit"]
        axis_ids = {v["id"] for v in orbit_param["fields"]["axes"]["values"]}
        value_range = orbit_param["fields"]["value_range"]
        axes = orbit.get("axes") if isinstance(orbit, dict) else None
        if not isinstance(axes, dict) or not axes:
            result.refusals.append(
                "mood_orbit must be {\"axes\": {\"<pole>\": 0..1, ...}} — the spec's declared wire "
                f"shape; poles: {sorted(axis_ids)}")
        else:
            bad_axes = sorted(set(axes) - axis_ids)
            if bad_axes:
                result.refusals.append(f"mood_orbit.axes unknown pole(s) {bad_axes}; "
                                       f"allowed: {sorted(axis_ids)}")
            bad_values = {k: v for k, v in axes.items()
                          if not isinstance(v, (int, float)) or
                          not (value_range["min"] <= v <= value_range["max"])}
            if bad_values:
                result.refusals.append(f"mood_orbit.axes values outside "
                                       f"[{value_range['min']}, {value_range['max']}]: {bad_values}")

    result.ok = not result.refusals
    if result.ok:
        result.normalized = body
    return result
