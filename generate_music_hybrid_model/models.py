"""
SSM Content Asset Creator — GENERATE_MUSIC_HYBRID_MODEL · transport contract and typed error surface
====================================================================================================

WHAT THIS MODULE IS FOR, for the next agent who opens it
--------------------------------------------------------
This is the TRANSPORT BOUNDARY of the Music Studio endpoint: it turns whatever AWS hands the Lambda into
a typed request, and it turns a refusal into the repo's error envelope. It contains NO musical knowledge
and NO field list. Those live in ONE place — `music_studio/param_spec.json` (34 parameters, 48 UI
controls, every value with its provenance) — and the validation/planning logic lives in
`music_studio/models.py` and `music_studio/planner.py`.

WHY IT DELEGATES INSTEAD OF RE-DECLARING (MANDATE CLAUSE 23)
------------------------------------------------------------
The UI renders from `param_spec.json`, the v5 doc section is GENERATED from it, and the worker validates
against it. A second copy of the field list inside this Lambda would be a THIRD list kept in agreement by
discipline — the exact class that produced four converter bands the gate could not measure while both
harnesses were green (Mandate Appendix A #8). The build vendors `music_studio/` and imports it.

WHY THE ERROR SURFACE IS AN ENUM OVER A DATA FILE, AND NOT PROSE IN THIS FILE
-----------------------------------------------------------------------------
Berk's order, 2026-08-15, quoted character-for-character and never softened:
    "yazdığın kodlar çok ama çok katitesiz koladrın içine statik metinler yazmışsın …
     kafana göre hiçbir variable a değişkene sen değer veremezsin, kodun içinde değer veremezsin."
The previous version of THIS FILE carried six error codes whose explanatory prose, HTTP status and caller
guidance were written as string literals inside a module-level dict (lines 31-42 of that version). He
named it as the defect and he was right: those are VALUES, and a value in code is unversionable,
untestable against the documentation, and invisible to the UI. They now live in
`music_studio/data/error_catalogue.json`; `ErrorCode` below is a real `Enum` whose members are ASSERTED
against that file at import time, so a code added to one and forgotten in the other fails loudly at load
instead of silently at runtime.

THE TYPES IN THIS FILE
----------------------
    ErrorCode              the closed set of envelope codes, each resolving its metadata from the catalogue
    ErrorClass             who can fix it: the caller, the upstream engine, or us
    InvocationShape        how the payload arrived (API Gateway proxy vs direct invoke) — DETECTED, never assumed
    RequestEnvelope        the parsed request: body, invocation metadata, and the shape it was detected as
    StudioError            the one exception type this boundary raises, carrying its code and refusals

READING ORDER FOR THE WHOLE ENDPOINT
------------------------------------
    1. docs/music-studio-single-endpoint-architecture.md   the committed design and every binding class
    2. music_studio/param_spec.json                        the parameter surface (single source of truth)
    3. music_studio/models.py                              validation against that surface
    4. music_studio/planner.py                             route choice and prompt compilation
    5. this file                                           transport in, envelope out
    6. generate_music_hybrid_model/lambda_function.py       the conductor that sequences the stages
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from types import MappingProxyType
from typing import Any, Final, Mapping

# ---------------------------------------------------------------------------------------------------
# THE CATALOGUE IMPORT
#
# The catalogue is DATA and it is loaded once, at import time, from the vendored shared package. Loading
# it lazily would move a deployment defect (a package built without the file) from the cold start — where
# it is obvious and cheap — to the first paid request, where it is expensive and looks like a model
# failure. That is the "fail loud, never fail open" rule the catalogue itself records for CONFIG_ERROR.
# ---------------------------------------------------------------------------------------------------

_CATALOGUE_RELATIVE_PATH: Final[str] = "data/error_catalogue.json"


def _resolve_catalogue_path() -> Path:
    """Locate the vendored catalogue, whether `music_studio` sits beside us or on `sys.path`.

    The Lambda package places `music_studio/` next to this module; a local test run may import it from
    the repository root. Both are resolved by asking the PACKAGE where it lives rather than by guessing a
    relative depth, because a guessed `../..` is the class of value this file exists to eliminate.
    """
    from music_studio import models as shared_models  # noqa: PLC0415 — import-time by design

    return Path(shared_models.__file__).resolve().parent / _CATALOGUE_RELATIVE_PATH


def _load_catalogue() -> Mapping[str, Mapping[str, Any]]:
    """Return `{code: entry}` from the catalogue, keyed by the `code` field it declares."""
    path = _resolve_catalogue_path()
    if not path.exists():
        raise RuntimeError(
            f"the error catalogue is absent at {path}. It is a REQUIRED data file: the packager's "
            f"import-closure check exists precisely to prevent this, so a missing file here means the "
            f"deployment artefact was not built by scripts/build_generate_music_hybrid_model_zip.py."
        )
    document = json.loads(path.read_text(encoding="utf-8"))
    return {entry["code"]: entry for entry in document["codes"]}


_CATALOGUE: Final[Mapping[str, Mapping[str, Any]]] = _load_catalogue()


class ErrorClass(Enum):
    """Who is able to act on a failure — which decides the HTTP status class and the report's tone.

    CALLER_FIXABLE  the request itself is wrong; the caller can change it and succeed. 4xx.
    UPSTREAM        we asked correctly and the engine refused or returned something unmeasurable. 5xx,
                    and never retried silently: a model refusal is terminal (MANDATE CLAUSE 22).
    OURS            our deployment or our code is at fault. 5xx, reported as ours rather than blamed on
                    the caller or the vendor.
    """

    CALLER_FIXABLE = "caller_fixable"
    UPSTREAM = "upstream"
    OURS = "ours"


class ErrorCode(Enum):
    """The closed set of envelope codes, each backed by its catalogue entry.

    Every member's metadata — meaning, HTTP status, caller action, the law that governs it — is read from
    `music_studio/data/error_catalogue.json`, never written here. `assert_catalogue_agrees()` proves the
    two sides carry the SAME set, which is what makes this an enum rather than a comment.
    """

    INVALID_REQUEST = "INVALID_REQUEST"
    LANGUAGE_NOT_PROVEN = "LANGUAGE_NOT_PROVEN"
    GENERATION_FAILED = "GENERATION_FAILED"
    MEASUREMENT_FAILED = "MEASUREMENT_FAILED"
    CONFIG_ERROR = "CONFIG_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"

    @property
    def entry(self) -> Mapping[str, Any]:
        """This code's catalogue entry. Raises if the catalogue lost it — never returns a default."""
        return _CATALOGUE[self.value]

    @property
    def http_status(self) -> int:
        """The status the envelope must carry, from the catalogue rather than from each raise site."""
        return int(self.entry["http_status"])

    @property
    def error_class(self) -> ErrorClass:
        return ErrorClass(self.entry["class"])

    @property
    def meaning(self) -> str:
        return str(self.entry["meaning"])

    @property
    def caller_action(self) -> str:
        return str(self.entry["caller_action"])

    @property
    def law(self) -> str:
        """The project law this code enforces, so a future edit cannot quietly change its semantics."""
        return str(self.entry["law"])


def assert_catalogue_agrees() -> None:
    """Prove the enum and the catalogue describe the SAME closed set. Called at import time.

    This is the control that makes the split safe. Two lists that must agree are kept in agreement BY
    IMPORT, and where an import is impossible (an Enum's members must be literal for static analysis) the
    agreement is PROVEN at load. A code present in only one side is a loud failure here rather than a
    KeyError on a caller's first refusal.
    """
    declared = {member.value for member in ErrorCode}
    catalogued = set(_CATALOGUE)
    if declared != catalogued:
        only_enum = sorted(declared - catalogued)
        only_file = sorted(catalogued - declared)
        raise RuntimeError(
            f"error surface drift — enum and catalogue disagree. In the enum only: {only_enum}. "
            f"In {_CATALOGUE_RELATIVE_PATH} only: {only_file}."
        )
    for member in ErrorCode:
        ErrorClass(member.entry["class"])  # raises on an unknown class, at load, not at runtime


assert_catalogue_agrees()


class InvocationShape(Enum):
    """How the payload reached us — DETECTED by inspection, because guessing looks like an empty request.

    API_GATEWAY_STRING  proxy integration: the payload is a JSON string in `event["body"]`.
    API_GATEWAY_OBJECT  a test invocation or a non-proxy integration: `event["body"]` is already a dict.
    DIRECT_INVOKE       `aws lambda invoke` / an internal caller: the event IS the body, minus the repo's
                        private `_`-prefixed orchestration keys.
    """

    API_GATEWAY_STRING = "api_gateway_string"
    API_GATEWAY_OBJECT = "api_gateway_object"
    DIRECT_INVOKE = "direct_invoke"


@dataclass(frozen=True)
class InvocationMetadata:
    """The orchestration context the repo's job runner attaches, separated from the caller's own fields.

    `job_id` and `job_table` are the async-job convention every worker in this repo shares (the router
    sets them); `http_method` is present only on a gateway path and is what a CORS preflight is detected
    from. They are kept OUT of the request body so a caller can never inject them.
    """

    job_id: str | None = None
    job_table: str | None = None
    http_method: str | None = None

    @property
    def is_async_job(self) -> bool:
        """True when a job record exists to report progress into."""
        return bool(self.job_id and self.job_table)


@dataclass(frozen=True)
class RequestEnvelope:
    """A parsed request: the caller's body, the orchestration metadata, and the detected shape."""

    body: Mapping[str, Any]
    metadata: InvocationMetadata
    shape: InvocationShape

    @property
    def is_capabilities_request(self) -> bool:
        """True when the caller asked for the discoverable parameter surface rather than a generation."""
        return bool(self.body.get("capabilities"))

    @property
    def is_cors_preflight(self) -> bool:
        return (self.metadata.http_method or "").upper() == "OPTIONS"


@dataclass
class StudioError(Exception):
    """The single exception type this boundary raises, carrying everything the envelope needs.

    `refused` is a LIST OF NAMED VIOLATIONS, never a count and never a summary: "the request is invalid"
    is the blended-report class this project forbids, so each violated field arrives with its own reason
    and its allowed values.
    """

    code: ErrorCode
    detail: str
    refused: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        Exception.__init__(self, self.detail)

    @property
    def http_status(self) -> int:
        return self.code.http_status

    def to_envelope(self, request_id: str) -> dict[str, Any]:
        """The repo-standard error envelope: `success`, `error`, `error_code`, `request_id`.

        The caller-facing guidance comes from the catalogue, so the same code always explains itself the
        same way in the API, in the generated documentation and in the tests.
        """
        return {
            "success": False,
            "error": self.detail,
            "error_code": self.code.value,
            "error_class": self.code.error_class.value,
            "caller_action": self.code.caller_action,
            "refused": list(self.refused),
            "request_id": request_id,
        }


# Backwards-compatible alias: the first version of this module raised `StudioValidationError`, and the
# offline control and the conductor both import that name. Keeping the alias means the rename cannot
# break a caller silently — the alias IS the migration record, not an oversight.
StudioValidationError = StudioError


class EventParser:
    """Turns a raw Lambda event into a `RequestEnvelope`, deciding the shape by INSPECTION.

    Stateless by construction (every method is pure), but a class rather than a loose function because
    the shape rules are a single cohesive contract: adding a fourth invocation shape should mean adding a
    branch HERE, with its detection test, not another `if` in the handler.
    """

    #: Keys the repo's orchestration layer adds to a direct invoke. Stripped from the caller's body so a
    #: caller cannot forge a job identity by sending them.
    PRIVATE_KEY_PREFIX: Final[str] = "_"

    @classmethod
    def parse(cls, event: Mapping[str, Any]) -> RequestEnvelope:
        metadata = cls._read_metadata(event)
        raw_body = event.get("body")

        if isinstance(raw_body, str):
            return RequestEnvelope(body=cls._decode_json_body(raw_body), metadata=metadata,
                                   shape=InvocationShape.API_GATEWAY_STRING)
        if isinstance(raw_body, Mapping):
            return RequestEnvelope(body=dict(raw_body), metadata=metadata,
                                   shape=InvocationShape.API_GATEWAY_OBJECT)
        return RequestEnvelope(body=cls._strip_private_keys(event), metadata=metadata,
                               shape=InvocationShape.DIRECT_INVOKE)

    @staticmethod
    def _read_metadata(event: Mapping[str, Any]) -> InvocationMetadata:
        request_context = event.get("requestContext") or {}
        http_context = request_context.get("http") or {} if isinstance(request_context, Mapping) else {}
        return InvocationMetadata(
            job_id=event.get("_jobId"),
            job_table=event.get("_jobTable"),
            http_method=event.get("httpMethod") or http_context.get("method"),
        )

    @staticmethod
    def _decode_json_body(raw: str) -> dict[str, Any]:
        """Decode a proxy-integration body, treating an empty body as an empty request, not an error."""
        try:
            decoded = json.loads(raw or "{}")
        except json.JSONDecodeError as exc:
            raise StudioError(
                code=ErrorCode.INVALID_REQUEST,
                detail=f"request body is not valid JSON at position {exc.pos}: {exc.msg}",
                refused=[f"body: not valid JSON ({exc.msg})"],
            ) from exc
        if not isinstance(decoded, dict):
            raise StudioError(
                code=ErrorCode.INVALID_REQUEST,
                detail=f"request body decoded to {type(decoded).__name__}, not an object",
                refused=["body: must be a JSON object"],
            )
        return decoded

    @classmethod
    def _strip_private_keys(cls, event: Mapping[str, Any]) -> dict[str, Any]:
        return {key: value for key, value in event.items()
                if not key.startswith(cls.PRIVATE_KEY_PREFIX)}


def parse_event(event: Mapping[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    """Legacy tuple-returning adapter, retained so existing callers and controls keep working.

    New code uses `EventParser.parse()` and gets a typed `RequestEnvelope`. This adapter exists because
    silently changing a signature that other modules import is the overwrite class (SUPREME LAW LINK 6):
    the migration is explicit and both surfaces are covered by the same control.
    """
    envelope = EventParser.parse(event)
    metadata = {
        "job_id": envelope.metadata.job_id,
        "job_table": envelope.metadata.job_table,
        "http_method": envelope.metadata.http_method,
        "invocation_shape": envelope.shape.value,
    }
    return dict(envelope.body), metadata


#: The closed set of code VALUES, derived from the Enum and never typed a second time. For a caller that
#: wants the set without importing the Enum (a documentation generator, an offline control).
ERROR_CODE_VALUES: Final[tuple[str, ...]] = tuple(member.value for member in ErrorCode)

#: `{code: meaning}`, projected from the catalogue. This name and this SHAPE are kept because the
#: conductor and the offline control already index it by code (`ERROR_CODES["INTERNAL_ERROR"]`) — changing
#: a shape other modules depend on, without reading them first, is exactly how a rewrite becomes a
#: regression. Measured this session: the first version of this rewrite made it a tuple, and
#: `scripts/test_generate_music_hybrid_model.py` caught it as `TypeError: tuple indices must be integers`
#: on the very next run. It is a `MappingProxyType` so a caller cannot mutate the surface at runtime.
ERROR_CODES: Final[Mapping[str, str]] = MappingProxyType(
    {member.value: member.meaning for member in ErrorCode}
)
