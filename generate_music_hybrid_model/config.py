"""
SSM Content Asset Creator — GENERATE_MUSIC_HYBRID_MODEL configuration
====================================================================
Deploy-time configuration for the music-studio conductor endpoint.

Every value is environment-supplied or carries its measurement source — no unsourced constants
(project law T10/M17). The values that mirror `music_lyria/config.py` are IDENTICAL by intent: this
worker delegates generation to the same deployed Lyria worker rather than re-implementing the Vertex
call, so a divergence in region/bucket/CDN between the two would produce two different truths for one
product (the two-lists-kept-in-agreement-by-discipline defect this repo has measured four times).
"""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class StudioConfig:
    """Read once per cold start."""

    # --- delegation target: the deployed, generation-proven Lyria worker ---
    # Named as an ENV VAR rather than hardcoded because the deploy target is deployment DATA
    # (rules/03). Default is the live name measured in .claude/memory/infra.md on 2026-08-13
    # (`ssm-content-worker-music-lyria`, sha256 JBaSYy/0e2… deployed that day).
    lyria_function_name: str
    stt_function_name: str

    # --- AWS output (same bucket/prefix family as every other worker in this repo) ---
    s3_bucket: str
    s3_base_prefix: str
    cdn_base_url: str
    aws_region: str

    # --- the GPU instance where stages 5-7 run (architecture s3: "Lambda has no ffmpeg and no GPU.
    # Stages 5-7 need both", Clause 20: never on Berk's machine, natively on the Google instance).
    # This worker does NOT run those stages in the request path; it records the target so the
    # response can state where the heavy work will happen and a job can be launched detached.
    render_instance: str
    render_zone: str
    render_project: str
    render_staging_bucket: str

    @classmethod
    def from_env(cls) -> "StudioConfig":
        return cls(
            lyria_function_name=os.environ.get("LYRIA_FUNCTION_NAME",
                                               "ssm-content-worker-music-lyria"),
            stt_function_name=os.environ.get("STT_FUNCTION_NAME",
                                             "ssm-content-worker-stt-vertex"),
            s3_bucket=os.environ.get("S3_BUCKET", "beforetomorrow-content-prod"),
            s3_base_prefix=os.environ.get("S3_BASE_PREFIX", "music/studio-hybrid/"),
            cdn_base_url=os.environ.get("CDN_BASE_URL", "https://cdn.BeforeTomorrow.io"),
            aws_region=os.environ.get("AWS_REGION", "eu-central-1"),
            render_instance=os.environ.get("RENDER_INSTANCE", "music-studio"),
            render_zone=os.environ.get("RENDER_ZONE", "us-central1-a"),
            render_project=os.environ.get("RENDER_PROJECT", "contentanalyticsplatform"),
            render_staging_bucket=os.environ.get(
                "RENDER_STAGING_BUCKET",
                "gs://contentanalyticsplatform-video-staging/tools/music_studio"),
        )

    def validate(self) -> None:
        missing = [name for name, value in (
            ("LYRIA_FUNCTION_NAME", self.lyria_function_name),
            ("S3_BUCKET", self.s3_bucket),
        ) if not value]
        if missing:
            raise ValueError("Missing required environment variables: " + ", ".join(missing))
