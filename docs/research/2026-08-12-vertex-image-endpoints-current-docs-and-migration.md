# Vertex AI image endpoints — current documentation state and the fix for all 10 failing workers

**Date:** 2026-08-12 · **Mode:** MODE B owner research order (his words: *"vertexai imagegen api lerinin en
güncel dökümantasyonlarını inceleyip hatta bilgisayara research altına indirip tüm hataları düzeltir misin"*)
· **Decision served:** repair the 10 failing Vertex image-class endpoints measured this session
(live test `scripts/test_vertex_image_endpoints.ps1`, 2026-08-12: 3 COMPLETED / 10 FAILED).

# Standards ledger

Read this session before this report: `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (activation
law + R0–R18 headings + R2/R3/R4), `.claude/skills/ssm-provider-migration/SKILL.md`,
`docs/research/2026-08-04-google-vertex-imagen4-to-gemini-image-migration.md`, `AGENTS.md` (rules channel),
`.cursor/rules/*` (rules channel), worker sources `upscale_vertex/lambda_function.py`,
`inpaint_vertex/lambda_function.py`, `productphoto_vertex/lambda_function.py`,
`presentation_vertex/lambda_function.py`, `document_vertex/lambda_function.py` (migrated reference),
`buildspecs/buildspec_vertex_gemini_migration.yml`, and the live AWS state (Lambda LastModified, ECR tags,
CodeBuild history) via CLI this session.

## 1. The measured fault inventory (this session, live)

13 Vertex image-class endpoints POSTed through `v2pjhwhk0m` (all 202-accepted), polled to terminal state:

| Endpoint | Verdict | Failing model (from worker error/CloudWatch) |
|---|---|---|
| comic / infographic / document | **COMPLETED** | — (run `gemini-3.1-flash-image`, deployed 2026-08-04) |
| image / avatar / logo / icon / sprite / animation | FAILED | `imagen-4.0-generate-001` → 404 (deployed images 2026-06-22) |
| presentation | FAILED | `imagen-4.0-generate-001` → 404 (code not migrated) |
| inpaint / productphoto | FAILED | `imagen-3.0-capability-001` → 404 (code not migrated) |
| upscale | FAILED | `imagen-4.0-upscale-preview` → 404 (code not migrated) |

Deploy-chain root cause for the 6 Docker workers, measured: CodeBuild project
`ssm-content-vertex-gemini-migration` ran ONCE (2026-08-04 18:35, FAILED in 20 s) —
`cd /codebuild/output/src…/src/image_vertex: No such file or directory`: the source zip
`airithms-ssm-content-assets-creator/build/vertex-gemini-migration-src.zip` did not have the worker
directories at its root. ECR still holds only the pre-migration `latest` tags (verified this session).

## 2. Current documentation state (all read/fetched 2026-08-12)

### 2.1 Generation — settled, and re-verified current

- `gemini-3.1-flash-image` (Nano Banana 2): **GA 2026-05-28, retirement ≥ 2027-05-28** — confirmed by
  the Google Cloud model page, the Gemini API model page, and Firebase AI Logic lifecycle table
  (3 independent Google-primary surfaces, sources S1, S3, S2). Capabilities row on the Cloud model page:
  *"Image generation … Supported · **Edit images, Multi-turn image editing Supported** · Interleaved
  images and text Supported · C2PA Supported"*. Resolutions 512/1K/2K/4K; 15 aspect ratios.
- Google's own Vertex release-notes migration table (S12, S13) maps **every** discontinued
  `imagen-*` / `imagegeneration@*` endpoint to the Gemini image family. `gemini-2.5-flash-image` is the
  name printed in that table, but the lifecycle tables (S2, and 2026-08-04 research) retire
  `gemini-2.5-flash-image` on **2026-10-02** — so the durable target remains `gemini-3.1-flash-image`,
  exactly as decided on 2026-08-04. **No change to the 2026-08-04 model decision.**
- API shape unchanged since 08-04: `:generateContent`, `contents[].parts[]`, response
  `candidates[0].content.parts[].inlineData.data`; `generationConfig.imageConfig.{aspectRatio,imageSize}`;
  recommended location **`global`** (host `aiplatform.googleapis.com`, no region prefix). Production
  proof in OUR account this session: comic/infographic/document workers deliver on exactly this shape.

### 2.2 Editing (inpaint / bgswap / outpaint / product photo) — the mask gap is real and Google-official

- `imagen-3.0-capability-001` (and `-002`): **discontinued 2026-06-30** (Google model page S6, Firebase
  lifecycle S2, release notes S12 — 3 sources; plus our live 404 this session as ground truth).
- Google's official replacement row: `imagen-3.0-capability-001` → `gemini-2.5-flash-image` (S12, S13) —
  i.e. **prompt-driven editing**, method `:generateContent` with the source image as an
  `inlineData` part + a text instruction (canonical REST body in the "Edit images with Gemini" page, S15).
- **Mask-based editing has NO equivalent replacement.** Google's developer forum thread (S8) states the
  replacement "doesn't appear to support explicit mask image input"; ChatForest's migration analysis (S7)
  and Skywork's server-side guide (S9: *"There is no documented client-supplied mask/bounding-box API"*)
  independently confirm. **Cross-verified ×3.** Consequence: `user-provided` mask workflows are
  approximated, not preserved — the mask can be attached as an additional reference image with an
  instruction to restrict the edit to its white region (Gemini 3.1 accepts up to 14 reference images, S16),
  but pixel-precise adherence is `[UNVERIFIED]` and is labelled as approximation in the API response.
- Auto-mask modes (`background`/`foreground`) translate cleanly to prompt instructions
  ("replace the background…, keep the subject unchanged") — the pattern Google's own editing docs use (S15, S9).

### 2.3 Upscale — documentation and our measurement CONTRADICT (preserved, not averaged)

- Google's upscale doc (S10, fetched today) still documents
  `imagen-4.0-upscale-preview:predict` (x2/x3/x4, ≤17 MP) — **but its "The following models support
  upscaling images:" list renders EMPTY**, and the model page (S21) shows *Launch stage: Preview* with a
  *"None"* row under versions-related lifecycle data. Third-party trackers (S18) still call it "Current".
- **Our live measurement (2026-08-11/12, this project, us-central1): HTTP 404 "was not found or your
  project does not have access to it."** A Preview model may be regionally restricted or
  allowlist-gated; the 404 wording covers both absence and access. A direct region sweep could not be
  run this session (local `gcloud` credentials need interactive reauth — recorded as an access failure,
  not evidence of absence, R4.3).
- **Applied decision:** the migrated upscale worker tries `imagen-4.0-upscale-preview` on the documented
  endpoint first (doc-exact request), and on 404 **falls back** to `gemini-3.1-flash-image`
  image-to-image with `imageConfig.imageSize: "2K"/"4K"` (documented resolutions, S1/S16). The response
  JSON always names the model that actually produced the output (engine-identity law T1). Note the
  fallback is generative re-synthesis, not pixel-faithful SR — the SR literature distinction (SR3,
  arXiv 2104.07636 [FULL], cascaded diffusion 2106.15282 [ABS]) is the reason the response labels the
  fallback explicitly: a regenerated image is not guaranteed identity-preserving.

### 2.4 Watermark / parameter surface (unchanged from 08-04, re-confirmed)

- SynthID watermark is ALWAYS ON for Gemini image output; `add_watermark` has no equivalent
  (post-hoc, model-independent pixel-space system — SynthID-Image, arXiv 2510.09263 [FULL], S22).
- `negative_prompt` and `guidance_scale` have no `generateContent` equivalent — folded into prompt text /
  logged, exactly as the already-working document/comic/infographic workers do.

## 3. What gets changed (application of findings)

1. **6 Docker workers** (`image/avatar/logo/icon/sprite/animation_vertex`): code already migrated 08-04 —
   rebuild the source zip with worker dirs at the zip ROOT, run CodeBuild
   `ssm-content-vertex-gemini-migration` (IMAGE_TAG dated), point the 6 Lambdas at the new images.
2. **`presentation_vertex`**: port to `gemini-3.1-flash-image` `:generateContent` on the `global` host —
   same pattern as `document_vertex` (per-slide loop kept).
3. **`inpaint_vertex` + `productphoto_vertex`**: port to prompt-driven Gemini editing (image `inlineData`
   part + instruction derived from edit_mode/mask_mode; user-provided masks forwarded as an extra
   reference image and labelled approximate in the response).
4. **`upscale_vertex`**: doc-exact Imagen upscale attempt + measured 404 fallback to Gemini
   image-to-image at 2K/4K; producing model always in the response.
5. Live re-test of all 13 endpoints through the API Gateway; per-endpoint verdicts.

## 4. Source register (S-numbers; fetched/read 2026-08-12 unless noted)

| # | Source | Mark | Archive |
|---|---|---|---|
| S1 | docs.cloud.google.com — Gemini 3.1 Flash Image model page | [ABS] | search capture |
| S2 | firebase.google.com/docs/ai-logic/models (lifecycle tables) | [FULL] | `_sources/2026-08-12-firebase-ai-logic-models-lifecycle.txt` |
| S3 | ai.google.dev — gemini-3.1-flash-image model page | [ABS] | search capture |
| S4 | cloud.google.com — Generate images with Gemini (Vertex) | [FULL] | `_sources/2026-08-12-gcloud-generate-images-with-gemini.txt` |
| S5 | docs.cloud.google.com — image-generation (Agent Platform mirror) | [FULL] | `_sources/2026-08-12-gcloud-agent-platform-image-generation.txt` |
| S6 | cloud.google.com — imagen-3.0-capability-001 model page (discontinued 2026-06-30) | [ABS] | search capture |
| S7 | chatforest.com — Imagen retirement migration checklist | [ABS] | search capture |
| S8 | discuss.google.dev — "imagen-3.0-capability-001 retiring… no mask replacement" | [ABS] | search capture |
| S9 | skywork.ai — server-side editing on Vertex with Gemini image | [ABS] | search capture |
| S10 | cloud.google.com — Upscale images using Imagen | [FULL] | fetched this session (body quoted above) |
| S11 | ai.google.dev/gemini-api/docs/imagen — deprecation warning page | [FULL] | `_sources/2026-08-12-ai-google-dev-imagen-deprecation.txt` |
| S12 | docs.cloud.google.com — Vertex generative-ai release notes (migration table) | [FULL] | `_sources/2026-08-12-vertex-generative-ai-release-notes.txt` |
| S13 | docs.cloud.google.com — Vertex AI release notes (full) | [FULL] | `_sources/2026-08-12-vertex-ai-release-notes-full.txt` |
| S14 | googleapis python-genai SDK guide — upscale_image | [ABS] | search capture |
| S15 | docs.cloud.google.com — Edit images with Gemini (REST body) | [FULL] | fetched this session (body quoted above) |
| S16 | ai.google.dev — image generation/editing (Gemini 3 family, 14 ref images) | [FULL] | `_sources/2026-08-12-ai-google-dev-image-generation-editing.txt` |
| S17 | firebase.google.com — Generate & edit images using Gemini | [FULL] | `_sources/2026-08-12-firebase-generate-images-gemini.txt` |
| S18 | innfactory.ai — Google Imagen model tracker | [ABS] | search capture |
| S19 | igly.ai — Imagen shutdown migration guide | [ABS] | search capture |
| S20 | kingy.ai — Imagen-4 Aug-17 shutdown tracker (→ gemini-3.1-flash-image) | [ABS] | search capture |
| S21 | Imagen 4.0 upscale Preview model page (mirror) | [ABS] | search capture |
| S22 | arXiv 2510.09263 — SynthID-Image (academic) | [FULL] | `_sources/2026-08-12-arxiv-2510-09263-synthid-image.txt` |
| S23 | arXiv 2104.07636 — SR3 super-resolution (academic) | [FULL] | `_sources/2026-08-12-arxiv-2104-07636-sr3-super-resolution.txt` |
| S24 | arXiv 2106.15282 — Cascaded Diffusion Models (academic) | [ABS] | search capture |
| S25 | ai.google.dev — SynthID responsible-AI page (Nature text paper pointer) | [ABS] | search capture |
| — | plus the 15 sources of `2026-08-04-google-vertex-imagen4-to-gemini-image-migration.md` (prior run, model decision unchanged) | | |

**Counts, reported honestly:** 25 sources this run (+15 in the 08-04 companion = 40 across the topic);
academic this run = 4 (S22–S25), of which 2 read [FULL]. **The ≥5-academic / 5-academic-[FULL] floor is
NOT met by this run alone** — vendor-API migration evidence is documentation-borne; the academic items
here anchor only the watermark and SR-vs-resynthesis claims. Recorded as a known gap, not narrated away.

## 5. Claim / cross-verification ledger

| Claim | Sources | State |
|---|---|---|
| C1: `gemini-3.1-flash-image` GA, retirement ≥2027-05-28 | S1, S2, S3 | ✅ ×3 |
| C2: All `imagen-*` → Gemini image family (official table) | S12, S13, S11 | ✅ ×3 |
| C3: `imagen-3.0-capability-001` discontinued 2026-06-30 | S6, S2, S12 + our live 404 | ✅ ×3 + measured |
| C4: Mask-based editing has NO replacement | S8, S7, S9 | ✅ ×3 |
| C5: Editing = `generateContent` + inlineData part + instruction | S15, S16, S17 | ✅ ×3 |
| C6: Gemini image output resolutions incl. 2K/4K | S1, S3, S15 (REST `imageSize: "4K"`) | ✅ ×3 |
| C7: `imagen-4.0-upscale-preview` availability | S10/S18/S21 say documented-current; our us-central1 measurement says 404 | ⚠️ CONTRADICTION preserved → resolved at runtime by attempt-then-fallback, producing model recorded |
| C8: SynthID always on, post-hoc pixel-space | S22, S25, S9 | ✅ ×3 |
| C9: `gemini-2.5-flash-image` retires 2026-10-02 (do not target) | S2 + 08-04 sources 4/5 | ✅ ×3 |
| C10: Zip-root layout broke the 08-04 CodeBuild run | CodeBuild log read this session | measured, [single-source] by nature |
| C11 (added 10:4x): REST `generation_config.image_config` has NO `outputMimeType`/`outputCompressionQuality` fields — Vertex returns 400 `Cannot find field`; the correct REST shape is `imageOutputOptions.{mimeType,compressionQuality}` (Google's edit-images REST sample), and the SDK's snake_case `output_mime_type` maps correctly on its own | Vertex 400 fieldViolations (measured 2026-08-12 10:3x) + S15 REST sample + post-fix live run with `.jpg` delivered (154 KB vs 4.4 MB png) | ✅ measured ×2 + doc |

## 6. Honest limits

- The upscale region sweep could not be executed (local gcloud reauth is interactive); C7 is settled by
  runtime measurement instead. `scripts/probe_vertex_image_models.py` is staged for when auth is available.
- Mask-fidelity of the reference-image approximation (2.2) is `[UNVERIFIED]` until measured on real masks.
- Academic floor: see §4 counts — not met by this run alone; the load-bearing claims here are
  vendor-documentation claims, each ×3-verified on independent surfaces.
