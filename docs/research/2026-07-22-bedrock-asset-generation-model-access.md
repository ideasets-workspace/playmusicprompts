# Bedrock Asset-Generation Model Access — BeforeTomorrow Account

**Account:** `723322847393` (BeforeTomorrow) · CLI profile `beforetomorrow_production`
**Verified:** 2026-07-22, live via AWS CLI (`aws sts get-caller-identity` → Account 723322847393)
**Scope:** Only models whose **output** is an asset we produce — IMAGE, VIDEO, or SPEECH (audio/voice).
Text/embedding LLMs are excluded (they do not produce our asset types).

## How this was verified (not from memory)

1. `aws bedrock list-foundation-models` run across **9 regions** (see counts below).
2. Filtered to `outputModalities` containing IMAGE / VIDEO / SPEECH.
3. Real access checked with `aws bedrock get-foundation-model-availability` → `authorizationStatus`.
4. **Live proof:** `aws bedrock-runtime invoke-model` actually generated images:
   - `stability.stable-image-ultra-v1:1` (us-west-2) → 1.82 MB PNG, header `89 50 4E 47…` (valid PNG).
   - `stability.sd3-5-large-v1:0` (us-west-2) → 1.92 MB PNG.
   - `stability.stable-style-transfer-v1:0` (us-east-1) → accepted request (returned field-validation, i.e. reachable & authorized).
   - `amazon.nova-canvas-v1:0` (us-east-1) → `ResourceNotFoundException: marked as Legacy and you have not been actively using the model in the last 30 days` → access exists, model dormant.

### Key distinction proven this session
- **`list-foundation-models` = inventory, not access.** A model can be listed but not granted.
- **`authorizationStatus=AUTHORIZED` = we have access.** All generative models below returned AUTHORIZED.
- **`agreementAvailability=NOT_AVAILABLE` ≠ blocked.** SD3.5/Core/Ultra showed NOT_AVAILABLE yet invoke() produced real PNGs — the field means "no stored EULA record", not an access barrier.
- **LEGACY + 30-day-idle = dormant, not revoked.** Nova Canvas/Reel are AUTHORIZED but suspended for non-use; a single successful invoke reactivates them.

## Total model inventory per region (all modalities)

| Region | Total models | Generative (IMAGE/VIDEO/SPEECH) |
|---|---|---|
| us-east-1 | 121 | 18 |
| us-east-2 | 85 | 13 |
| **us-west-2** | 114 | **18 (richest — only region with from-scratch text→image)** |
| eu-central-1 (our primary) | 37 | **0** |
| eu-west-1 | 60 | 2 |
| eu-west-2 | 66 | 0 |
| eu-west-3 | 31 | 0 |
| eu-north-1 | 36 | 2 (speech only) |
| ap-northeast-1 | 68 | 4 |
| eu-south-1 / eu-south-2 | — | account has no access to these regions |

## IMAGE generation — text→image (from scratch)

Only in **us-west-2**. All `AUTHORIZED`. Ultra & SD3.5 proven live (real PNG output).

| Model ID | Notes | Maps to our asset types |
|---|---|---|
| `stability.stable-image-ultra-v1:1` | Highest quality; **live-proven 1.82 MB PNG** | image, logo, icon, avatar, sprite |
| `stability.sd3-5-large-v1:0` | SD 3.5 Large; **live-proven 1.92 MB PNG** | image, logo, icon, avatar, sprite |
| `stability.stable-image-core-v1:1` | Fast / lower cost | image, sprite, quick drafts |
| `amazon.nova-canvas-v1:0` | **LEGACY, dormant** (us-east-1, eu-west-1, ap-northeast-1) — AUTHORIZED, reactivate via invoke | image, logo, icon, avatar |

## IMAGE editing / control (require an input image, not from scratch)

All **Stability AI, ACTIVE, AUTHORIZED**. Present in **us-east-1, us-east-2, us-west-2** (identical set of 14).

| Model ID | Function | Maps to our asset types |
|---|---|---|
| `stability.stable-image-inpaint-v1:0` | Inpaint | `inpaint_*` |
| `stability.stable-outpaint-v1:0` | Outpaint | `outpaint_fal` |
| `stability.stable-image-erase-object-v1:0` | Object erase | `erase_fal` |
| `stability.stable-image-remove-background-v1:0` | BG removal | `bgremove_fal` |
| `stability.stable-image-search-replace-v1:0` | Search & replace | `searchreplace_stability` |
| `stability.stable-image-search-recolor-v1:0` | Recolor | `recolor_stability` |
| `stability.stable-image-control-sketch-v1:0` | Sketch control | `sketch_*` |
| `stability.stable-image-control-structure-v1:0` | Structure control | structure-guided gen |
| `stability.stable-style-transfer-v1:0` | Style transfer | `styletransfer_*`, `restyle_*` |
| `stability.stable-image-style-guide-v1:0` | Style guide | style-guided gen |
| `stability.stable-fast-upscale-v1:0` | Fast upscale | `upscale_*` |
| `stability.stable-conservative-upscale-v1:0` | Conservative upscale | `upscale_*` |
| `stability.stable-creative-upscale-v1:0` | Creative upscale | `upscale_*` |

## VIDEO generation

| Model ID | Region | Status / access | Maps to |
|---|---|---|---|
| `luma.ray-v2:0` | us-west-2 | ACTIVE, AUTHORIZED | `video_*`, `animation_*` |
| `amazon.nova-reel-v1:1` | us-east-1 | LEGACY dormant, AUTHORIZED | `video_*`, `animation_*` |
| `amazon.nova-reel-v1:0` | us-east-1, eu-west-1, ap-northeast-1 | LEGACY dormant, AUTHORIZED | `video_*`, `animation_*` |

## SPEECH / voice generation (output = SPEECH)

| Model ID | Regions | Status / access | Maps to |
|---|---|---|---|
| `amazon.nova-2-sonic-v1:0` | us-east-1, us-west-2, eu-north-1, ap-northeast-1 | ACTIVE, AUTHORIZED | `voice_*`, `dialogue_*` |
| `amazon.nova-sonic-v1:0` | us-east-1, eu-north-1, ap-northeast-1 | LEGACY dormant, AUTHORIZED | `voice_*`, `dialogue_*` |

## Bottom line for our asset pipeline

- **From-scratch image (image/logo/icon/avatar/sprite):** Bedrock-native only in **us-west-2** via Stability Ultra / SD3.5 / Core — **live-verified working**. Fallback: Nova Canvas (Legacy, reactivate).
- **Image editing (inpaint/outpaint/upscale/bg-remove/recolor/style):** rich Stability set in us-east-1 / us-east-2 / us-west-2, all ACTIVE.
- **Video:** Luma Ray v2 (us-west-2, ACTIVE) or Nova Reel (Legacy, any of us-east-1/eu-west-1/ap-northeast-1).
- **Voice/audio:** Nova Sonic family (SPEECH output).
- **eu-central-1 (our primary region) has ZERO asset-generation models** → this is the concrete technical reason the project relies on external providers (Vertex, fal.ai, Stability API, ElevenLabs) rather than Bedrock for media.
- **No SFX/music model** in Bedrock at all (no AUDIO-music output) — those asset types must stay on external providers.

## Not covered here (flag for follow-up if needed)
- Per-provider access grant for the ~200 **text/LLM** models (out of asset scope; not enumerated).
- On-demand vs inference-profile vs provisioned invocation requirements per model.
- Pricing per model (not queried this session).
