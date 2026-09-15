"""
SSM Content Asset Creator — GENERATE_MUSIC_HYBRID_MODEL Lambda v1.0
==================================================================
The Music Studio conductor. `POST /generate-music-hybrid-model` — the endpoint name is Berk's,
verbatim (his order 2026-08-14: *"endpointimizin adı generate-music-hybrid-model"*).

Endpoint contract (the repo-wide envelope):
  success  -> {success: true, request_id, route, bindings, measured, tracks[], ...}
  failure  -> {success: false, error, error_code, request_id, refused[]}

WHAT THIS WORKER IS, in one sentence: a CONDUCTOR, not a wrapper — it owns the request schema,
chooses the generation route and states WHY, delegates the paid call to the deployed and
generation-proven `music_lyria` worker, then MEASURES what came back and reports per control what
the route actually did with it.

THE FOUR PROPERTIES, each one a recorded lesson of this project:
  1. ONE SOURCE OF TRUTH. Validation and planning are `music_studio.models` / `music_studio.planner`,
     driven by `music_studio/param_spec.json` — the same document the UI renders from and the v5 doc
     section is generated from (D-SSM-23). This file declares NO field list of its own.
  2. THE ROUTE IS PART OF THE ANSWER. `route.model` and `route.why` are returned; the delegated
     worker's own reported surface/model are echoed under `route.delegate_reported`, because naming a
     model is not proof that model ran (engine-identity law).
  3. NOTHING IS CLAIMED THAT WAS NOT MEASURED ON THE DELIVERED FILE. Duration/codec/sample-rate come
     from the delegate's own measurement block (`music_lyria` walks MPEG frames / reads WAV data
     bytes — never a header guess), and if that block says `duration_measured: false`, THIS response
     says so too instead of quoting a number.
  4. HEAVY STAGES EXECUTE IN-LAMBDA WHERE POSSIBLE. Conform (5) and master (7) run with ffmpeg
     inside the container image (Dockerfile installs it; MUS-API-001). Stem separation (6) still
     needs a GPU and returns a plan pointing at the instance. The response's `render_plan` reports
     what actually ran (`executed: true`) and what did not, with the reason named.

ONE generation attempt per invocation. Retrying is the job system's deliberate act, never a hidden
loop inside a worker (Clause 22).
"""

from __future__ import annotations

import json
import os
import sys
import traceback
import urllib.request
import uuid
from datetime import datetime, timezone
from typing import Any, Dict

import boto3

# The shared contract package is VENDORED beside this file at build time (see build_zip.sh), so the
# import works identically in the Lambda and in the local harness.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import StudioConfig  # noqa: E402
from models import ERROR_CODES, ErrorCode, StudioValidationError, parse_event  # noqa: E402
from music_studio import capabilities as studio_capabilities  # noqa: E402
from music_studio import planner as studio_planner  # noqa: E402

CONFIG = StudioConfig.from_env()
_lambda = boto3.client("lambda", region_name=CONFIG.aws_region)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,x-api-key",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
}


def _report_progress(meta: Dict[str, Any], progress: int, message: str) -> None:
    """DynamoDB progress via the repo-wide `_jobId` convention. Best-effort, never fatal."""
    job_id, table_name = meta.get("job_id"), meta.get("job_table")
    if not job_id or not table_name:
        return
    try:
        ddb = boto3.resource("dynamodb", region_name=CONFIG.aws_region)
        ddb.Table(table_name).update_item(
            Key={"jobId": job_id},
            UpdateExpression="SET progress = :p, progressMessage = :m, updatedAt = :u",
            ExpressionAttributeValues={":p": progress, ":m": message,
                                       ":u": datetime.now(timezone.utc).isoformat()})
    except Exception as exc:  # noqa: BLE001 — progress must never break a delivery
        print(f"[PROGRESS] failed: {exc}")


def _invoke_lyria(payload: Dict[str, Any]) -> Dict[str, Any]:
    """ONE synchronous invoke of the deployed Lyria worker. No retry, no fallback model.

    Delegation rather than re-implementation is deliberate: `music_lyria` is the module whose Vertex
    call, container sniffing and duration measurement are already control-proven (50/50 offline, MP3
    frame-walk within 0.0003 s of ffprobe on three real deliveries). Re-implementing the Vertex call
    here would create a second Lyria client whose behaviour would drift from the proven one.
    """
    response = _lambda.invoke(FunctionName=CONFIG.lyria_function_name,
                              InvocationType="RequestResponse",
                              Payload=json.dumps(payload).encode("utf-8"))
    raw = response["Payload"].read()
    if response.get("FunctionError"):
        return {"success": False,
                "error": f"delegate {CONFIG.lyria_function_name} raised: {raw[:400]!r}"}
    try:
        body = json.loads(raw)
    except json.JSONDecodeError:
        return {"success": False, "error": f"delegate returned non-JSON: {raw[:400]!r}"}
    # The delegate may answer either as a bare body (direct invoke) or as an HTTP envelope.
    if isinstance(body, dict) and "body" in body and isinstance(body["body"], str):
        try:
            return json.loads(body["body"])
        except json.JSONDecodeError:
            return {"success": False, "error": f"delegate envelope body not JSON: {body['body'][:300]}"}
    return body


def _download_track(uri: str, dest: 'Path') -> None:
    """Download a track from S3 (s3://...) or HTTPS URL to a local path."""
    from pathlib import Path
    if uri.startswith("s3://"):
        parts = uri.replace("s3://", "").split("/", 1)
        bucket, key = parts[0], parts[1]
        s3 = boto3.client("s3")
        s3.download_file(bucket, key, str(dest))
    elif uri.startswith("http"):
        req = urllib.request.Request(uri)
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
    else:
        raise ValueError(f"unsupported track URI scheme: {uri[:80]}")


def _upload_processed(local_path: 'Path', original_uri: str) -> str:
    """Upload a processed file back to S3 beside the original, with a `-mastered` suffix.
    Returns the new S3 URI."""
    from pathlib import Path
    if not original_uri.startswith("s3://"):
        return str(local_path)
    parts = original_uri.replace("s3://", "").split("/", 1)
    bucket, key = parts[0], parts[1]
    stem = key.rsplit(".", 1)[0] if "." in key else key
    ext = local_path.suffix or ".wav"
    new_key = f"{stem}-mastered{ext}"
    s3 = boto3.client("s3")
    s3.upload_file(str(local_path), bucket, new_key,
                   ExtraArgs={"ContentType": "audio/wav" if ext == ".wav" else "audio/mpeg"})
    return f"s3://{bucket}/{new_key}"


def _render_plan(request: Dict[str, Any], track_uri: str | None) -> Dict[str, Any]:
    """Stages 5-7: conform (trim), master (loudness) execute IN THIS LAMBDA (ffmpeg is in the
    container image since MUS-API-001). Stem separation is the only stage that still needs the GPU
    instance (SCNet XL model). If ffmpeg is absent at runtime, the stages fall back to plan-only
    with `executed: false` and the reason named — never a silent skip.
    """
    import shutil
    import tempfile
    from pathlib import Path

    from music_studio import mastering

    stems = request.get("stems") or []
    wants_separated = [s for s in stems if s in ("drums", "bass", "music", "vocals")]
    duration_cfg = request.get("duration") or {}
    mastering_cfg = request.get("mastering") or {}
    quality = request.get("quality", "balanced")

    has_ffmpeg = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None

    # If ffmpeg is not available (e.g. zip-deployed Lambda without the container image),
    # fall back to the old plan-only response — never claim execution that did not happen.
    if not has_ffmpeg or not track_uri:
        return _render_plan_only(request, track_uri)

    result = {"executed": True, "stages": {}}

    try:
        # Download the delivered track to /tmp for processing
        tmp_dir = Path(tempfile.mkdtemp(prefix="music_render_"))
        src_path = tmp_dir / "source.mp3"
        _download_track(track_uri, src_path)

        current_path = src_path
        delivered_duration = mastering.probe_duration(src_path)

        # STAGE 5 — CONFORM (duration trim with bar-aligned fade)
        target_seconds = duration_cfg.get("target_seconds")
        on_miss = duration_cfg.get("on_miss", "accept")
        tolerance = duration_cfg.get("tolerance_seconds", 2)
        tempo = request.get("tempo_bpm", 120)
        meter = request.get("time_signature", "4/4")

        if target_seconds and quality != "draft":
            plan = mastering.plan_conform(
                delivered_duration, float(target_seconds), float(tolerance),
                on_miss, float(tempo), meter)
            if plan["action"] == "trim":
                conformed_path = tmp_dir / "conformed.wav"
                conform_result = mastering.conform(current_path, conformed_path, plan)
                result["stages"]["conform"] = conform_result
                if conform_result["ok"]:
                    current_path = conformed_path
            else:
                result["stages"]["conform"] = plan
        else:
            result["stages"]["conform"] = {"action": "skipped",
                                           "reason": "no target_seconds or quality=draft"}

        # STAGE 7 — MASTER (two-pass loudness normalisation)
        target_lufs = float(mastering_cfg.get("loudness_lufs", -14))
        true_peak = float(mastering_cfg.get("true_peak_db", -1.0))
        master_target = mastering_cfg.get("target", "streaming")

        if master_target != "none" and quality != "draft":
            mastered_path = tmp_dir / "mastered.wav"
            master_result = mastering.master(current_path, mastered_path, target_lufs, true_peak)
            result["stages"]["master"] = master_result
            if master_result.get("ok"):
                current_path = mastered_path
                # Verify the final file
                verification = mastering.verify_loudness(current_path)
                result["stages"]["master"]["verification"] = verification
        else:
            result["stages"]["master"] = {"action": "skipped",
                                          "reason": f"target={master_target} or quality=draft"}

        # Upload processed file back to S3 if we actually did work
        if current_path != src_path:
            final_url = _upload_processed(current_path, track_uri)
            result["processed_url"] = final_url
            result["processed_duration_seconds"] = round(mastering.probe_duration(current_path), 3)

        # STAGE 6 — STEM SEPARATION (GPU required, plan-only for now)
        result["stages"]["stems"] = {
            "executed": False,
            "requested": stems,
            "separated_requested": wants_separated,
            "separator": "SCNet XL IHF (4-stem: drums/bass/other/vocals), MIT",
            "reason": "stem separation requires a GPU (SCNet XL model); this stage runs on the "
                      "instance when started (MUS-API-005)"
        } if wants_separated else {"requested": stems, "note": "no separated stems requested"}

    except Exception as exc:  # noqa: BLE001
        result["executed"] = "partial"
        result["error"] = f"{type(exc).__name__}: {str(exc)[:300]}"

    return result


def _render_plan_only(request: Dict[str, Any], track_uri: str | None) -> Dict[str, Any]:
    """Fallback: the old plan-only response when ffmpeg is not available in the runtime."""
    stems = request.get("stems") or []
    wants_separated = [s for s in stems if s in ("drums", "bass", "music", "vocals")]
    return {
        "executed": False,
        "why_not_here": "ffmpeg not available in this runtime (zip-deployed Lambda without the "
                        "container image); deploy with the Dockerfile to enable in-Lambda processing",
        "instance": CONFIG.render_instance,
        "zone": CONFIG.render_zone,
        "project": CONFIG.render_project,
        "stages": {
            "conform": {"module": "music_studio.mastering.plan_conform + conform",
                        "target_seconds": (request.get("duration") or {}).get("target_seconds"),
                        "on_miss": (request.get("duration") or {}).get("on_miss")},
            "master": {"module": "music_studio.mastering.master",
                       "target": (request.get("mastering") or {}).get("target"),
                       "loudness_lufs": (request.get("mastering") or {}).get("loudness_lufs"),
                       "true_peak_db": (request.get("mastering") or {}).get("true_peak_db")},
            "stems": {"requested": stems, "separated_requested": wants_separated},
        },
    }


def _envelope(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {"statusCode": status, "headers": CORS_HEADERS,
            "body": json.dumps(body, ensure_ascii=False)}


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:  # noqa: ANN401
    request_id = str(uuid.uuid4())
    try:
        body, meta = parse_event(event)

        if (meta.get("http_method") or "").upper() == "OPTIONS":
            return {"statusCode": 204, "headers": CORS_HEADERS, "body": ""}

        # ASYNC MODE: when the caller sends `async: true`, the Lambda immediately returns a job_id
        # and re-invokes itself with InvocationType=Event (fire-and-forget). The caller polls via
        # the job-status endpoint or receives the result at webhook_url. This bypasses the API
        # Gateway 29,000 ms integration timeout for long jobs (multi-take variations, large files).
        if body.get("async") is True and not meta.get("is_async_execution"):
            job_id = meta.get("job_id") or f"music-{request_id}"
            job_table = meta.get("job_table") or os.environ.get("JOB_TABLE", "ssm-content-jobs")
            # Write initial job record
            try:
                ddb = boto3.resource("dynamodb", region_name=CONFIG.aws_region)
                ddb.Table(job_table).put_item(Item={
                    "jobId": job_id, "status": "processing", "progress": 0,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "request_id": request_id})
            except Exception:  # noqa: BLE001
                pass
            # Re-invoke self asynchronously (Event = fire-and-forget)
            async_event = dict(event)
            async_event["_asyncMeta"] = {"is_async_execution": True, "job_id": job_id,
                                         "job_table": job_table}
            function_name = (context.function_name if context else
                             os.environ.get("AWS_LAMBDA_FUNCTION_NAME", "PlayMusicPromptsModel"))
            _lambda.invoke(FunctionName=function_name,
                           InvocationType="Event",
                           Payload=json.dumps(async_event).encode())
            return _envelope(202, {"success": True, "async": True, "job_id": job_id,
                                   "request_id": request_id,
                                   "poll": f"POST with {{\"job_status\": true, \"job_id\": \"{job_id}\"}}",
                                   "note": "generation is running asynchronously; poll for status or "
                                           "receive the result at webhook_url"})

        # JOB STATUS QUERY: poll an async job's current state from DynamoDB
        if body.get("job_status") is True and body.get("job_id"):
            job_table = os.environ.get("JOB_TABLE", "ssm-content-jobs")
            try:
                ddb = boto3.resource("dynamodb", region_name=CONFIG.aws_region)
                item = ddb.Table(job_table).get_item(Key={"jobId": body["job_id"]}).get("Item")
                if item:
                    return _envelope(200, {"success": True, "job_id": body["job_id"], **item})
                return _envelope(404, {"success": False, "error": f"job {body['job_id']} not found"})
            except Exception as exc:  # noqa: BLE001
                return _envelope(500, {"success": False, "error": str(exc)[:200]})

        # Detect async execution context (the re-invoked call)
        if event.get("_asyncMeta"):
            am = event["_asyncMeta"]
            meta["is_async_execution"] = True
            meta["job_id"] = am["job_id"]
            meta["job_table"] = am["job_table"]

        # GET …/capabilities — the discoverable matrix, generated from param_spec.json (principle 3:
        # capability is discoverable BEFORE it is paid for; four printed enums have lied here).
        path = (event.get("path") or event.get("rawPath") or "")
        if (meta.get("http_method") or "").upper() == "GET" or path.endswith("/capabilities") \
                or body.get("capabilities") is True:
            return _envelope(200, {"success": True, "request_id": request_id,
                                   **studio_capabilities.capabilities()})

        CONFIG.validate()
        _report_progress(meta, 5, "planning")

        # STAGE 1 — PLAN. Validation + route + prompt compilation, all from the shared spec.
        plan = studio_planner.plan(body)
        if not plan["ok"]:
            return _envelope(ErrorCode.INVALID_REQUEST.http_status,
                             {"success": False,
                              "error": "; ".join(plan["refusals"]),
                              "error_code": ErrorCode.INVALID_REQUEST.value,
                              "error_code_meaning": ErrorCode.INVALID_REQUEST.meaning,
                              "error_class": ErrorCode.INVALID_REQUEST.error_class.value,
                              "caller_action": ErrorCode.INVALID_REQUEST.caller_action,
                              "request_id": request_id,
                              "refused": plan["refusals"]})

        route, payload = plan["route"], plan["generation_payload"]
        takes = int(payload.get("takes", 1))
        _report_progress(meta, 20, f"generating on {route['model']}"
                                   + (f" ({takes} takes)" if takes > 1 else ""))

        # STAGE 3 — GENERATE (delegated). ONE delegate invoke per take, sequential, NO retry:
        # `takes` comes from the planner (output_package=variations, wired 2026-08-23 MUS-API-009).
        # A single uniform N-invoke path serves BOTH surfaces, because sampleCount is a :predict-only
        # envelope field and the Interactions body was measured to accept only {model, input}
        # (music_lyria/models.py) — two surface-specific paths would be two lists kept in agreement
        # by discipline. A failure mid-run STOPS the run (Clause 22: no hidden retry) and the takes
        # already delivered are reported per item, never blended away.
        delegate_payload = {
            "prompt": payload["prompt"],
            "model": payload["model"],
            "instrumental_only": payload["instrumental_only"],
            "output_path": CONFIG.s3_base_prefix,
        }
        if body.get("seed") is not None:
            delegate_payload["seed"] = body["seed"]
        # negative_prompt is DELIBERATELY NOT forwarded typed (changed back 2026-08-23): the planner
        # already compiles it as the "Avoid: ..." clause inside the prompt (the exact form that
        # PASSED the vendor's content policy on the delivered generation of 2026-08-23 09:48), and
        # forwarding it typed made the delegate fold the SAME list a second time on the Interactions
        # surface ("Do NOT include...") — the only new negation in the request that was blocked
        # content_blocked at 12:01. One carrier, and it is the measured-good one.
        if body.get("labels"):
            # Provenance metadata, forwarded verbatim (the delegate's own Dict[str, str] contract;
            # wired 2026-08-23 MUS-API-009 — the worker supported it, the API could not carry it).
            delegate_payload["labels"] = body["labels"]

        deliveries: list[Dict[str, Any]] = []
        failure: Dict[str, Any] | None = None
        for take_index in range(takes):
            delivered = _invoke_lyria(delegate_payload)
            if not delivered.get("success"):
                failure = {"failed_take": take_index + 1, "error": str(delivered.get("error"))[:600]}
                break
            deliveries.append(delivered)
            if takes > 1:
                _report_progress(meta, 20 + round(50 * (take_index + 1) / takes),
                                 f"take {take_index + 1}/{takes} delivered")

        if failure is not None:
            return _envelope(ErrorCode.GENERATION_FAILED.http_status,
                             {"success": False,
                              "error": failure["error"],
                              "error_code": ErrorCode.GENERATION_FAILED.value,
                              "error_code_meaning": ErrorCode.GENERATION_FAILED.meaning,
                              "error_class": ErrorCode.GENERATION_FAILED.error_class.value,
                              "caller_action": ErrorCode.GENERATION_FAILED.caller_action,
                              "request_id": request_id,
                              "route": route,
                              "bindings": plan["bindings"],
                              # Per-item accounting (Clause 24): the takes that DID deliver are
                              # named with their artefacts, never erased by the failure after them.
                              "failed_take": failure["failed_take"],
                              "takes_requested": takes,
                              "tracks_delivered_before_failure": [
                                  {"url": d.get("url"), "public_url": d.get("public_url")}
                                  for d in deliveries]})

        delivered = deliveries[0]

        _report_progress(meta, 80, "measuring")

        # STAGE 4 — MEASURE. Every number here comes from the delegate's own measurement of the
        # delivered bytes; when it reports `duration_measured: false`, so does this response.
        # With N takes the per-take artefacts are aggregated per item (Clause 24), and the
        # `measured` block carries the FIRST take's numbers with the take index named.
        all_tracks: list = []
        for take_index, take_delivered in enumerate(deliveries):
            take_tracks = take_delivered.get("tracks") or (
                [{"url": take_delivered.get("url"), "public_url": take_delivered.get("public_url")}]
                if take_delivered.get("url") else [])
            for track in take_tracks:
                track = dict(track)
                track["take"] = take_index + 1
                all_tracks.append(track)
        tracks = all_tracks
        first = (delivered.get("tracks") or [delivered])[0]
        measured = {
            "duration_seconds": first.get("duration_seconds"),
            "duration_measured": first.get("duration_measured", delivered.get("duration_measured")),
            "measured_by": first.get("measured_by", delivered.get("measured_by")),
            "codec": first.get("codec", delivered.get("codec")),
            "sample_rate": first.get("sample_rate", delivered.get("sample_rate")),
            "channels": first.get("channels", delivered.get("channels")),
        }
        if takes > 1:
            measured["measured_take"] = 1
        if measured.get("duration_measured") is False:
            measured["honesty"] = ("the delegate could not measure the delivered file; the duration "
                                   "above is NOT a measurement and must not be quoted as one")

        response = {
            "success": True,
            "request_id": request_id,
            "endpoint": "generate-music-hybrid-model",
            "route": {
                **route,
                "worker": CONFIG.lyria_function_name,
                "delegate_reported": {"surface": delivered.get("surface"),
                                      "model": delivered.get("model")},
                "identity_note": "the delegate's OWN reported surface/model are echoed because naming "
                                 "a model is not proof that model ran",
            },
            "prompt_sent": payload["prompt"],
            "bindings": plan["bindings"],
            "measured": measured,
            "takes_delivered": len(deliveries),
            "tracks": tracks,
            "language_fallback": plan.get("language_fallback"),
            "render_plan": _render_plan(body, (tracks[0].get("url") if tracks else None)),
            "spend_note": f"this endpoint issued {len(deliveries)} generation call(s) for this "
                          f"invocation — one per take, no retry and no fallback model (Clause 22)",
        }

        # WEBHOOK DELIVERY (wired 2026-08-23, MUS-API-009 — the field was previously consumed by
        # ZERO code lines). Best-effort POST of the response envelope, bounded so a dead endpoint
        # can never consume the generation budget; the outcome is echoed, never silent. The URL's
        # https scheme was already enforced by the validator (models.validate_request block 4c).
        webhook_url = body.get("webhook_url")
        if webhook_url:
            try:
                webhook_request = urllib.request.Request(
                    webhook_url,
                    data=json.dumps(response, ensure_ascii=False).encode("utf-8"),
                    headers={"Content-Type": "application/json"}, method="POST")
                with urllib.request.urlopen(webhook_request, timeout=10) as webhook_response:
                    response["webhook"] = {"delivered": True, "status": webhook_response.status}
            except Exception as exc:  # noqa: BLE001 — a webhook failure must never void a delivery
                response["webhook"] = {"delivered": False, "error": str(exc)[:200]}

        _report_progress(meta, 100, "delivered")

        # For async executions: write the full result to DynamoDB so the poller can retrieve it
        if meta.get("is_async_execution") and meta.get("job_id") and meta.get("job_table"):
            try:
                ddb = boto3.resource("dynamodb", region_name=CONFIG.aws_region)
                ddb.Table(meta["job_table"]).update_item(
                    Key={"jobId": meta["job_id"]},
                    UpdateExpression="SET #s = :s, #r = :r, completedAt = :c",
                    ExpressionAttributeNames={"#s": "status", "#r": "result"},
                    ExpressionAttributeValues={
                        ":s": "completed",
                        ":r": json.dumps(response, ensure_ascii=False)[:400000],
                        ":c": datetime.now(timezone.utc).isoformat()})
            except Exception as exc:  # noqa: BLE001
                print(f"[ASYNC] failed to write result to DDB: {exc}")

        return _envelope(200, response)

    except StudioValidationError as exc:
        # `exc.code` is an `ErrorCode` member (see generate_music_hybrid_model/models.py): the status and
        # the caller guidance come FROM the catalogue rather than being typed at this raise site, which is
        # what stops six raise sites from drifting apart. `to_envelope()` builds the repo-standard body.
        return _envelope(exc.http_status, {**exc.to_envelope(request_id),
                                          "error_code_meaning": exc.code.meaning})
    except ValueError as exc:
        # CONFIG.validate() and the spec loader raise ValueError subclasses on deployment faults.
        print(f"[CONFIG] {exc}")
        return _envelope(ErrorCode.CONFIG_ERROR.http_status,
                         {"success": False, "error": str(exc),
                          "error_code": ErrorCode.CONFIG_ERROR.value,
                          "error_code_meaning": ErrorCode.CONFIG_ERROR.meaning,
                          "error_class": ErrorCode.CONFIG_ERROR.error_class.value,
                          "caller_action": ErrorCode.CONFIG_ERROR.caller_action,
                          "request_id": request_id})
    except Exception as exc:  # noqa: BLE001 — the boundary must never leak a traceback
        print(f"[ERROR] {exc}\n{traceback.format_exc()}")
        return _envelope(ErrorCode.INTERNAL_ERROR.http_status,
                         {"success": False,
                          "error": f"internal error: {type(exc).__name__}",
                          "error_code": ErrorCode.INTERNAL_ERROR.value,
                          "error_code_meaning": ErrorCode.INTERNAL_ERROR.meaning,
                          "error_class": ErrorCode.INTERNAL_ERROR.error_class.value,
                          "caller_action": ErrorCode.INTERNAL_ERROR.caller_action,
                               "request_id": request_id})
