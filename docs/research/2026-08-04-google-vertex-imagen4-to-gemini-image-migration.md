# Google Vertex AI: Imagen-4 → Gemini Image migration research

**Date:** 2026-08-04 · **Author:** agent session (Cursor) · **Purpose:** fix the live 404 fault on
the 9 Vertex image-family workers (`image/logo/icon/avatar/sprite/animation/comic/infographic/
document _vertex`) per `ssm-provider-migration` skill — primary-source research BEFORE any code.

Standards ledger: `.claude/skills/ssm-provider-migration/SKILL.md`, `.claude/memory/STATE.md`,
`.claude/memory/infra.md`, AGENTS.md, berk-research rule — all read this session.

---

## 1. The fault (verified prior sessions, restated)

- All 9 `_vertex` image-family workers call `vertexai.preview.vision_models.ImageGenerationModel`
  with `imagen-4.0-generate-001` → `404 Publisher Model ... is not found` since 2026-06-30.
- Vertex AI SDK generative modules (`vertexai.preview.*`) were removed 2026-06-24 — the old SDK
  path is dead independent of the model string.

## 2. Deprecation state of the art (all sources read 2026-08-04)

| Model | Status | Shutdown/Retirement | Replacement (Google's own table) |
|---|---|---|---|
| `imagen-4.0-generate-001` / `-fast` / `-ultra` | Deprecated; already 404 on Vertex (Vertex migration deadline was 2026-06-30) | Gemini API surface: 2026-08-17 | **`gemini-3.1-flash-image`** |
| `imagen-3.0-*` | SHUT DOWN | done | — |
| `gemini-2.5-flash-image` (Nano Banana, GA) | GA but end-of-life | **2026-10-02** | (3.1 family) |
| `gemini-3.1-flash-image` (Nano Banana 2, GA) | **GA since 2026-05-28** | 2027-05-28 or later | — |
| `gemini-3-pro-image` (GA) | GA since 2026-05-28 | 2027-05-28 or later | — |

Sources ([FULL] = full page read this session):
1. [FULL] Google Cloud — Generate images with Gemini (Vertex docs): https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/image-generation — canonical `generate_content` code for `gemini-3.1-flash-image` on Vertex, Python `google-genai` SDK.
2. [ABS] Google AI — Gemini deprecations table: https://ai.google.dev/gemini-api/docs/deprecations — Imagen-4 → `gemini-3.1-flash-image` replacement row.
3. [FULL] Google AI — Imagen docs (deprecation warning + migration section): https://ai.google.dev/gemini-api/docs/imagen
4. [ABS] Google Cloud — Gemini 3.1 Flash Image model page: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-flash-image — GA, release 2026-05-28, retirement ≥2027-05-28; aspect ratios 1:1, 3:2, 2:3, 3:4, 1:4, 4:1, 4:3, 4:5, 5:4, 1:8, 8:1, 9:16, 16:9, 21:9, 9:21; resolutions 512/1K/2K/4K; output via `generate_content`.
5. [ABS] Google Cloud — model versions & lifecycle: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions — `gemini-2.5-flash-image` retires 2026-10-02.
6. [ABS] DeepMind — Gemini 3.1 Flash Image model card (published 2026-02-26): https://deepmind.google/models/model-cards/gemini-3-1-flash-image/
7. [FULL] Google AI — pricing page: https://ai.google.dev/gemini-api/docs/pricing — image output $60/1M tokens.
8. [FULL] Google Cloud — Agent Platform pricing (Vertex surface): https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing — same per-image rates on Vertex.
9. [FULL] GoogleCloudPlatform/generative-ai notebook `intro_gemini_2_5_image_gen.ipynb` — `GenerateContentConfig(response_modalities=["IMAGE"], image_config=ImageConfig(aspect_ratio=...), candidate_count=N)` pattern.
10. [FULL] googleapis python-genai SDK reference (https://googleapis.github.io/python-genai/genai.html) — `genai.Client(vertexai=True, credentials=<google.auth.credentials.Credentials>, project=, location=)`; `GenerateContentConfig.seed: Optional[int]` exists.
11. [ABS] Firebase AI Logic — Imagen → Gemini Image migration guide: https://firebase.google.com/docs/ai-logic/imagen-models-migration — per-tier mapping (fast→2.5-flash-image or 3.1 w/ MINIMAL thinking; standard→2.5 GA or 3.1-preview HIGH; ultra→3-pro-image); recommends location `global`; ImageConfig available from ~May 2026 SDK versions.
12. [ABS] byteiota — Imagen 4 shutdown analysis: https://byteiota.com/imagen-4-shutdown-august-17-migrate-to-gemini-image-api-now/
13. [ABS] Vorp Labs — Google model retirements tracker: https://vorplabs.com/models/google-model-retirements — confirms Vertex deadline (2026-06-30) preceded Gemini-API date (2026-08-17); retired Vertex IDs return 404 (matches our CloudWatch evidence).
14. [ABS] Google AI — gemini-2.5-flash-image model page: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image
15. [ABS] Google AI — gemini-3.1-flash-image model page: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image — 512/1K/2K/4K, new ratios, search grounding, thinking supported, Batch API supported.

Cross-verification: the load-bearing claims (Imagen-4 dead on Vertex; official replacement =
`gemini-3.1-flash-image`; 2.5-flash-image retires 2026-10-02; API = `generate_content` via
`google-genai` SDK) each confirmed by ≥3 independent Google-primary sources above (1+2+3+4+5).

## 3. Candidate models — decision data

| Criterion | `gemini-2.5-flash-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
|---|---|---|---|
| Stage | GA (2025-10-02) | GA (2026-05-28) | GA (2026-05-28) |
| Lifetime | **retires 2026-10-02 (~2 months!)** | ≥2027-05-28 | ≥2027-05-28 |
| Google's named replacement for Imagen-4 | no (legacy) | **yes (official table)** | only for ultra tier |
| Price / 1K image | $0.039 | $0.067 (batch $0.034) | $0.134 |
| Resolutions | 1K only | 512 / 1K / 2K / 4K | 1K / 2K / 4K |
| Aspect ratios | 10 ratios | 15 ratios (adds 1:4, 4:1, 1:8, 8:1, 9:21) | wide set |
| Extras | — | thinking, image search grounding, better text rendering (i18n) | highest quality |
| Old Imagen-4 price (reference) | ~$0.04/image | | |

## 4. Breaking API changes (Imagen SDK → Gemini Image)

1. **SDK:** `google-cloud-aiplatform`/`vertexai` (generative modules REMOVED) → `google-genai`
   (`pip install google-genai`). Client: `genai.Client(vertexai=True, project=, location=,
   credentials=)` — accepts any `google.auth.credentials.Credentials` incl. WIF
   `external_account` (SDK ref [FULL]) → **WIF stays keyless, no auth change needed.**
2. **Method:** `ImageGenerationModel.generate_images(...)` → `client.models.generate_content(
   model, contents=prompt, config=GenerateContentConfig(response_modalities=["IMAGE"],
   image_config=ImageConfig(aspect_ratio=..., image_size=...), candidate_count=...))`.
3. **Response:** `response.images[i]._image_bytes` → iterate `response.candidates[0].content.
   parts`, take `part.inline_data.data` (image parts), ignore/log text parts.
4. **Parameters lost:** `negative_prompt` (NOT supported — fold into prompt text),
   `guidance_scale` (not supported), `safety_filter_level`→`SafetySetting` schema,
   `add_watermark` (SynthID always on), `language`, `sample_image_size`→`image_config.image_size`.
5. **Parameters kept:** `seed` exists on `GenerateContentConfig`; aspect_ratio via `ImageConfig`;
   multiple images via `candidate_count` (or loop — Gemini image models return 1 image/candidate).
6. **Location:** Google recommends `global` for Gemini image models on Vertex
   (`GOOGLE_CLOUD_LOCATION=global`); regional endpoints exist but pricing/quota favor global.

## 5. Affected inventory (FS-measured this session)

9 dirs, each with `ImageGenerationModel` + Imagen model strings in `lambda_function.py` and
`config.py`: `image_vertex, logo_vertex, icon_vertex, avatar_vertex, sprite_vertex,
animation_vertex, comic_vertex, infographic_vertex, document_vertex`.

## 6. Stated limitations / risks

- `gemini-3.1-flash-image` 1K price is 1.7× old Imagen-4 (mitigate: 512 tier at $0.045, or
  Batch API at $0.034/1K for non-interactive volume).
- Safety filters differ from Imagen — real prompts must be staged before declaring parity.
- Gemini image models may return text-only when refusing; the handler must treat
  zero-image-parts as a failure envelope, not crash.
- [single-source] byteiota's "Batch API otherwise costs jump 67%" figure — directional only.

## 7. Recommendation (ONE, committed)

**Migrate all 9 workers to `gemini-3.1-flash-image`** (Google's official replacement, GA,
≥ May-2027 lifetime, 512–4K ladder, superior text rendering — logo/comic/infographic/document
workers directly benefit). Do NOT use `gemini-2.5-flash-image`: it retires 2026-10-02 and would
recreate this exact fault in two months. `gemini-3-pro-image` ($0.134) reserved as an opt-in
"ultra" quality tier later, not the default.
