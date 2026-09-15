# Prompt Enhancement API — Complete Documentation

**Endpoint:** `POST /enhance-prompt`
**Base URL:** `https://i3ob0ck5m2.execute-api.eu-central-1.amazonaws.com/prod`
**Auth:** `x-api-key` header required
**Lambda:** `ssm-content-worker-prompt-enhance` (Python 3.12, Zip-based)
**LLM Backend:** AWS Bedrock — Claude Sonnet 4.5 (`eu.anthropic.claude-sonnet-4-5-20250929-v1:0`)

---

## 1. Overview

A universal prompt enhancement endpoint that improves user-provided prompts for **all 58 content types** across **40+ provider/model combinations**. The system dynamically adapts enhancement strategy based on:

- **Content type** (image, video, music, sfx, voice, 3d, avatar, logo, icon, sprite, etc.)
- **Target provider** (OpenAI, Stability, Vertex AI, Runway, Luma, Kling, fal.ai, ElevenLabs, etc.)
- **Target model** (DALL-E 3, GPT Image 1, SD3.5, FLUX Pro, Imagen 4, Gen4, Meshy, etc.)
- **User parameters** (aspect_ratio, style_preset, duration, quality, etc.)

### Research Foundation

Enhancement logic encodes findings from 15 academic papers:

| Paper | Key Finding | Implementation |
|-------|-------------|----------------|
| Long-CLIP (2025) | First tokens carry 17.1% more influence | Front-load subject in first 10-15 words |
| DetailMaster 2025 | Long prompts degrade quality; models follow <50% | Optimal word ranges per model |
| NegOpt 2024 | Automated negative prompt optimization | Model-specific negative generation |
| Semantic Gravity Wells 2026 | Priming paradox: naming unwanted things triggers them 87.5% | Abstract negatives only |
| PromptBridge (UC Santa Cruz 2025) | Same prompt → 32-48% different results across models | Provider-specific format adaptation |
| CompCon (ICCV 2025) | Cross-model prompt compatibility | Format transformation per encoder type |
| DSPy/MIPROv2 (Stanford) | Cost-quality tiering for LLM usage | Enhancement level → model mapping |
| HAPO (Berkeley 2026) | Section-level prompt structure validation | Modular system prompt blocks |
| DialectGen 2025 | Provider+model-specific format is mandatory | DIALECT_BLOCK per target model |
| Yale 2025 Temporal Prompting | Temporal structure improves video coherence | Duration-based action density |

---

## 2. Request Flow

```
Client → API Gateway (POST /enhance-prompt, x-api-key)
  → job_creator Lambda (async proxy)
    → DynamoDB: PENDING
    → self-invoke with _execute=True
      → Invokes ssm-content-worker-prompt-enhance (synchronous)
        → Builds modular system prompt
        → Calls AWS Bedrock Converse API (Claude Sonnet 4.5)
        → Parses JSON response
        → Post-processes: length enforcement, front-load validation, negative guardrails
        → Returns enhanced prompt
      → DynamoDB: COMPLETED/FAILED
  → Client polls /jobs/{jobId}
```

---

## 3. Request Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | The prompt to enhance. 1-100,000 characters. |
| `content_type` | string | Target content type (see Section 6 for full list). |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `provider` | string | `""` | Target generation provider (openai, stability, fal, vertex, runway, luma, kling, elevenlabs, etc.) |
| `model` | string | `""` | Target generation model (dall-e-3, flux-pro, sd35-large, gen4, meshy-4, etc.) |
| `negative_prompt` | string | `""` | User's initial negative prompt to enhance |
| `enhancement_level` | string | `"standard"` | One of: `minimal`, `standard`, `creative`, `maximum` |
| `llm_model` | string | `""` | Override the Bedrock LLM model ID |
| `model_id` | string | `""` | Alternative to llm_model (same effect) |
| `language` | string | `"en"` | Prompt language code (en, tr, de, etc.) |
| `preserve_style` | boolean | `false` | If true, preserves the user's stylistic choices |
| `params` | object | `{}` | Generation parameters that influence enhancement |

### `params` Object — Parameter Influence Map

These parameters dynamically modify the enhancement strategy:

| Parameter | Influences | Example |
|-----------|-----------|---------|
| `aspect_ratio` | Composition guidance (16:9→landscape, 9:16→portrait, 1:1→centered) | `"16:9"` |
| `quality` | Detail level (draft→simple, hd/ultra→maximum detail) | `"hd"` |
| `style_preset` | Vocabulary alignment (anime, photographic, cinematic, etc.) | `"anime"` |
| `duration` | Action density scaling for video/music/sfx | `10` |
| `generation_type` | Focus shift (image2video→motion only, extend→continuation) | `"image2video"` |
| `image_url` / `image` | Triggers img2img behavior — describe modification, not full scene | URL string |
| `strength` | img2img intensity (0.0-1.0: low=subtle, high=major change) | `0.7` |
| `style_ref` / `character_ref` / `image_ref` | Reference-based: don't re-describe the reference | URL string |
| `ip_adapter_image_url` | IP adapter: style from reference, prompt for content only | URL string |
| `guidance_scale` / `cfg_scale` | Prompt adherence (high→precise, low→creative freedom) | `7.5` |
| `seed` | Reproducibility hint: maintain exact descriptions | `42` |
| `count` / `num_images` | Multiple outputs: add variety hints | `4` |
| `genre` | Music: primary musical context | `"orchestral"` |
| `mood` | Music: emotional tone | `"epic"` |
| `instruments` | Music: must be mentioned in enhanced prompt | `"strings, brass"` |
| `bpm` | Music: translated to tempo descriptor (120→energetic) | `150` |
| `use_case` | Music: emotional arc (boss_battle, menu, cinematic) | `"boss_battle"` |
| `emotion` | Voice: adjust word choices for emotion delivery | `"happy"` |
| `speed` | Voice: sentence length (fast→short, slow→flowing) | `"fast"` |
| `art_style` | 3D: vocabulary (realistic, low_poly, cartoon, anime) | `"realistic"` |
| `topology` | 3D: mesh description (quad→clean edge flow, triangle→game-ready) | `"quad"` |
| `category` | 3D: object vocabulary (character, prop, weapon, creature) | `"weapon"` |
| `brand_name` / `text` | Logo: preserved exactly, never modified | `"NeuralFlow"` |
| `background` | transparent→add isolation language | `"transparent"` |
| `rendering_speed` | Ideogram: TURBO→simpler, QUALITY→more detail | `"QUALITY"` |
| `raw` | FLUX: true→direct literal prompting | `true` |
| `enhance_prompt` / `expand_prompt` | Native enhancer: triggers double-enhancement warning | `true` |

### Example Requests — Full Parameter Sets

#### 1. Image — DALL-E 3 (OpenAI, native rewrite always-on)

```json
{
  "prompt": "a sunset over mountains",
  "content_type": "image",
  "provider": "openai",
  "model": "dall-e-3",
  "negative_prompt": "",
  "enhancement_level": "standard",
  "language": "en",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "16:9",
    "quality": "hd",
    "style_preset": "cinematic",
    "count": 1,
    "seed": 42
  }
}
```

#### 2. Image — GPT Image 1 (OpenAI, literal prompt following, transparent bg)

```json
{
  "prompt": "a cyberpunk hacker girl sitting at a holographic desk",
  "content_type": "avatar",
  "provider": "openai",
  "model": "gpt-image-1",
  "negative_prompt": "",
  "enhancement_level": "creative",
  "language": "en",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "1:1",
    "quality": "hd",
    "background": "transparent",
    "count": 1
  }
}
```

#### 3. Image — Imagen 4 (Vertex AI, native enhance_prompt param)

```json
{
  "prompt": "a golden retriever playing in autumn leaves",
  "content_type": "image",
  "provider": "vertex",
  "model": "imagen-4",
  "negative_prompt": "blurry, cartoon, oversaturated",
  "enhancement_level": "standard",
  "language": "en",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "4:3",
    "quality": "high",
    "enhance_prompt": false,
    "count": 2,
    "seed": 12345
  }
}
```

#### 4. Image — SD3.5 (Stability, hybrid NL+tags, full negative support, style_preset)

```json
{
  "prompt": "anime girl with a katana standing on a rooftop at night",
  "content_type": "image",
  "provider": "stability",
  "model": "sd35-large",
  "negative_prompt": "bad hands, extra fingers",
  "enhancement_level": "creative",
  "language": "en",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "9:16",
    "quality": "hd",
    "style_preset": "anime",
    "guidance_scale": 7.5,
    "count": 1,
    "seed": 99999
  }
}
```

#### 5. Image — SD3.5 img2img (Stability, with image_url + strength)

```json
{
  "prompt": "transform into watercolor painting style",
  "content_type": "image",
  "provider": "stability",
  "model": "sd35-large",
  "negative_prompt": "photorealistic, sharp edges",
  "enhancement_level": "standard",
  "language": "en",
  "preserve_style": false,
  "params": {
    "image_url": "https://example.com/photo.jpg",
    "strength": 0.65,
    "style_preset": "analog-film",
    "guidance_scale": 8.0,
    "aspect_ratio": "1:1"
  }
}
```

#### 6. Image — FLUX Pro (fal.ai, T5 encoder, photography-style, raw mode)

```json
{
  "prompt": "modern minimalist office interior with floor-to-ceiling windows",
  "content_type": "image",
  "provider": "fal",
  "model": "flux-pro",
  "negative_prompt": "",
  "enhancement_level": "maximum",
  "language": "en",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "16:9",
    "quality": "hd",
    "style_preset": "photographic",
    "enhance_prompt": false,
    "raw": true,
    "guidance_scale": 3.5,
    "count": 1,
    "seed": null
  }
}
```

#### 7. Image — FLUX Pro with IP Adapter (style from reference)

```json
{
  "prompt": "a futuristic spaceship cockpit interior",
  "content_type": "image",
  "provider": "fal",
  "model": "flux-pro",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "aspect_ratio": "16:9",
    "ip_adapter_image_url": "https://example.com/style-reference.jpg",
    "enhance_prompt": false,
    "raw": false
  }
}
```

#### 8. Image — FLUX Dev (fal.ai, supports negative prompt)

```json
{
  "prompt": "steampunk clocktower at sunset",
  "content_type": "image",
  "provider": "fal",
  "model": "flux-dev",
  "negative_prompt": "modern buildings, cars",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "aspect_ratio": "3:2",
    "enhance_prompt": false,
    "guidance_scale": 5.0,
    "num_images": 2,
    "seed": 77777
  }
}
```

#### 9. Image — Ideogram V3 (fal.ai, text rendering, text-first format)

```json
{
  "prompt": "tech startup logo NeuralFlow with abstract neural network icon",
  "content_type": "logo",
  "provider": "fal",
  "model": "ideogram",
  "negative_prompt": "complex background, photorealistic",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "brand_name": "NeuralFlow",
    "style": "DESIGN",
    "aspect_ratio": "1:1",
    "rendering_speed": "QUALITY",
    "expand_prompt": false
  }
}
```

#### 10. Image — Recraft V3 (fal.ai, design/illustration)

```json
{
  "prompt": "flat vector illustration of a mountain landscape",
  "content_type": "image",
  "provider": "fal",
  "model": "recraft-v3",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "style": "flat_vector",
    "aspect_ratio": "16:9",
    "colors": ["#2563EB", "#10B981", "#F59E0B"]
  }
}
```

#### 11. Image — Luma Photon (short prompts, reference-based)

```json
{
  "prompt": "transform into ethereal dreamscape with soft pastel colors",
  "content_type": "image",
  "provider": "luma",
  "model": "photon",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "aspect_ratio": "16:9",
    "image_ref": "https://example.com/reference.jpg",
    "style_ref": "https://example.com/style.jpg",
    "character_ref": "https://example.com/character.jpg"
  }
}
```

#### 12. Image — Kling (full negative support, fidelity params)

```json
{
  "prompt": "warrior princess in golden armor standing on a cliff",
  "content_type": "image",
  "provider": "kling",
  "model": "kling-v2",
  "negative_prompt": "blurry, distorted, bad anatomy",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "aspect_ratio": "9:16",
    "image_fidelity": 0.8,
    "human_fidelity": 0.9,
    "count": 1
  }
}
```

#### 13. Video — Runway Gen4 (SHORT prompts, cinematic director)

```json
{
  "prompt": "a bird flying over a sparkling ocean at sunrise",
  "content_type": "video",
  "provider": "runway",
  "model": "gen4",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "duration": 10,
    "generation_type": "text_to_video",
    "aspect_ratio": "16:9"
  }
}
```

#### 14. Video — Runway Gen4 image-to-video (reference_images required)

```json
{
  "prompt": "the subject slowly turns to camera and smiles, soft wind in hair",
  "content_type": "video",
  "provider": "runway",
  "model": "gen4",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "duration": 5,
    "generation_type": "image_to_video",
    "image_url": "https://example.com/portrait.jpg",
    "aspect_ratio": "9:16"
  }
}
```

#### 15. Video — Kling (duration scaling, mode, generation_type)

```json
{
  "prompt": "a spaceship launching from a desert planet with massive dust clouds",
  "content_type": "video",
  "provider": "kling",
  "model": "kling-v2",
  "negative_prompt": "jittery, flickering",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "duration": 10,
    "generation_type": "text2video",
    "mode": "pro",
    "aspect_ratio": "16:9"
  }
}
```

#### 16. Video — Kling image2video (motion only)

```json
{
  "prompt": "the character slowly raises their hand and waves",
  "content_type": "video",
  "provider": "kling",
  "model": "kling-v2",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "duration": 5,
    "generation_type": "image2video",
    "image_url": "https://example.com/character.jpg",
    "mode": "std"
  }
}
```

#### 17. Video — Google Veo 3 (supports audio, temporal, camera)

```json
{
  "prompt": "a thunderstorm rolling over a vast wheat field at dusk",
  "content_type": "video",
  "provider": "vertex",
  "model": "veo-3",
  "enhancement_level": "maximum",
  "language": "en",
  "params": {
    "duration": 15,
    "generation_type": "text_to_video",
    "aspect_ratio": "21:9"
  }
}
```

#### 18. Video — Luma Ray (concise cinematic, duration-scaled)

```json
{
  "prompt": "ocean waves crashing on rocks with golden sunset light",
  "content_type": "video",
  "provider": "luma",
  "model": "ray-2",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "duration": 9,
    "generation_type": "video",
    "aspect_ratio": "16:9"
  }
}
```

#### 19. Video — OpenAI Sora (mini-screenplay format)

```json
{
  "prompt": "a cat jumping from a bookshelf and landing gracefully on a couch",
  "content_type": "video",
  "provider": "openai",
  "model": "sora",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "duration": 10,
    "aspect_ratio": "16:9"
  }
}
```

#### 20. Music — ElevenLabs (lyrics with structure tags)

```json
{
  "prompt": "epic orchestral battle music with rising tension and heroic finale",
  "content_type": "music",
  "provider": "elevenlabs",
  "model": "music",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "genre": "orchestral",
    "mood": "epic",
    "bpm": 150,
    "instruments": "strings, brass, timpani, choir",
    "use_case": "boss_battle",
    "duration": 120
  }
}
```

#### 21. Music — Stability (genre/mood/bpm/instruments weaving, quality)

```json
{
  "prompt": "relaxing lo-fi beats for studying",
  "content_type": "music",
  "provider": "stability",
  "model": "stable-audio",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "genre": "lo-fi hip hop",
    "mood": "relaxed",
    "bpm": 85,
    "instruments": "piano, vinyl crackle, soft drums",
    "quality": "high",
    "duration": 180,
    "use_case": "menu"
  }
}
```

#### 22. Music — ACE-Step (fal.ai, strictly 3-7 tags)

```json
{
  "prompt": "dark ambient, eerie, synthesizer drones, slow, atmospheric",
  "content_type": "music",
  "provider": "fal",
  "model": "ace-step",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "genre": "ambient",
    "mood": "eerie",
    "duration": 60
  }
}
```

#### 23. SFX — ElevenLabs (sound physics, max 1000 chars)

```json
{
  "prompt": "thunder rolling in the distance",
  "content_type": "sfx",
  "provider": "elevenlabs",
  "model": "sfx",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "duration": 5
  }
}
```

#### 24. SFX — MMAudio (fal.ai, video-to-audio matching)

```json
{
  "prompt": "footsteps on gravel approaching, then door opening and closing",
  "content_type": "sfx",
  "provider": "fal",
  "model": "mmaudio",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "video_url": "https://example.com/scene.mp4",
    "duration": 8
  }
}
```

#### 25. Voice — ElevenLabs TTS (script with emotion/speed)

```json
{
  "prompt": "Welcome to AllInsights, the world's first game intelligence platform. We track over 250,000 mobile games across 140 countries.",
  "content_type": "voice",
  "provider": "elevenlabs",
  "model": "voice",
  "enhancement_level": "minimal",
  "language": "en",
  "preserve_style": true,
  "params": {
    "emotion": "happy",
    "speed": "normal"
  }
}
```

#### 26. Voice — ElevenLabs TTS (fast speech, angry emotion)

```json
{
  "prompt": "Bu kabul edilemez. Derhal düzeltin. Müşterilerimiz bekliyor.",
  "content_type": "voice",
  "provider": "elevenlabs",
  "model": "voice",
  "enhancement_level": "minimal",
  "language": "tr",
  "preserve_style": true,
  "params": {
    "emotion": "angry",
    "speed": "fast"
  }
}
```

#### 27. Avatar — GPT Image (transparent bg, pose, style)

```json
{
  "prompt": "warrior elf girl with silver hair and emerald eyes",
  "content_type": "avatar",
  "provider": "openai",
  "model": "gpt-image-1",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "aspect_ratio": "1:1",
    "background": "transparent",
    "avatar_style": "realistic",
    "pose": "half_body",
    "expression": "confident",
    "quality": "hd",
    "count": 1
  }
}
```

#### 28. Logo — Ideogram V3 (text rendering, brand_name, DESIGN style)

```json
{
  "prompt": "modern tech startup logo called NeuralFlow with abstract neural network icon",
  "content_type": "logo",
  "provider": "fal",
  "model": "ideogram",
  "negative_prompt": "complex background, photorealistic, gradients",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "brand_name": "NeuralFlow",
    "style": "DESIGN",
    "aspect_ratio": "1:1",
    "rendering_speed": "QUALITY",
    "expand_prompt": false
  }
}
```

#### 29. Icon — Vertex Imagen 4 (square, simple)

```json
{
  "prompt": "settings gear icon, flat design",
  "content_type": "icon",
  "provider": "vertex",
  "model": "imagen-4",
  "negative_prompt": "detailed background, text, complex scene",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "aspect_ratio": "1:1",
    "background": "transparent",
    "enhance_prompt": false
  }
}
```

#### 30. Sprite — OpenAI GPT Image (game-ready, transparent)

```json
{
  "prompt": "pixel art knight character with sword and shield",
  "content_type": "sprite",
  "provider": "openai",
  "model": "gpt-image-1",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "aspect_ratio": "1:1",
    "background": "transparent",
    "sprite_type": "single",
    "quality": "hd"
  }
}
```

#### 31. 3D — Meshy (HARD 600 char limit, object-focused)

```json
{
  "prompt": "a medieval longsword with leather-wrapped grip",
  "content_type": "threed",
  "provider": "fal",
  "model": "meshy-4",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "art_style": "realistic",
    "topology": "quad",
    "category": "weapon",
    "symmetry": true,
    "pose_mode": null
  }
}
```

#### 32. 3D — Stability (art_style, category, flexible)

```json
{
  "prompt": "a cartoon treasure chest with gold coins overflowing",
  "content_type": "3d",
  "provider": "stability",
  "model": "3d-model",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "art_style": "cartoon",
    "category": "prop"
  }
}
```

#### 33. 3D — Tripo3D (fal.ai, supports negative)

```json
{
  "prompt": "a sci-fi plasma rifle with glowing energy core",
  "content_type": "threed",
  "provider": "fal",
  "model": "tripo",
  "negative_prompt": "blurry, low quality, flat",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "art_style": "stylized",
    "category": "weapon"
  }
}
```

#### 34. Skybox — Blockade Labs (360° panoramic, enhance_prompt param)

```json
{
  "prompt": "alien planet with purple sky and twin suns over crystal mountains",
  "content_type": "skybox",
  "provider": "blockade",
  "model": "skybox",
  "enhancement_level": "creative",
  "language": "en",
  "params": {
    "enhance_prompt": false
  }
}
```

#### 35. Inpaint — Stability (partial enhancement, masked area)

```json
{
  "prompt": "a red sports car replacing the blue sedan",
  "content_type": "inpaint",
  "provider": "stability",
  "model": "sd35-large",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "image_url": "https://example.com/street-scene.jpg",
    "strength": 0.8,
    "guidance_scale": 7.0
  }
}
```

#### 36. Style Transfer — Stability (target style reference)

```json
{
  "prompt": "transform into Van Gogh Starry Night painting style",
  "content_type": "styletransfer",
  "provider": "stability",
  "model": "sd35-large",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "image_url": "https://example.com/photo.jpg",
    "strength": 0.7,
    "style_preset": "analog-film"
  }
}
```

#### 37. Non-English (Turkish) — Language preservation

```json
{
  "prompt": "gün batımında deniz kenarında oturan yaşlı bir balıkçı",
  "content_type": "image",
  "provider": "openai",
  "model": "dall-e-3",
  "enhancement_level": "standard",
  "language": "tr",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "16:9",
    "quality": "hd"
  }
}
```

#### 38. Maximum Enhancement with LLM Override

```json
{
  "prompt": "a dragon",
  "content_type": "image",
  "provider": "fal",
  "model": "flux-pro",
  "enhancement_level": "maximum",
  "llm_model": "eu.anthropic.claude-sonnet-4-5-20250929-v1:0",
  "language": "en",
  "preserve_style": false,
  "params": {
    "aspect_ratio": "21:9",
    "quality": "ultra",
    "style_preset": "fantasy-art",
    "enhance_prompt": false,
    "raw": false,
    "guidance_scale": 5.0,
    "num_images": 4
  }
}
```

#### 39. Texture — Stability (tileable, material)

```json
{
  "prompt": "weathered red brick wall texture",
  "content_type": "texture",
  "provider": "stability",
  "model": "sd35-large",
  "negative_prompt": "seams, non-tileable, objects, text",
  "enhancement_level": "standard",
  "language": "en",
  "params": {
    "style_preset": "tile-texture",
    "aspect_ratio": "1:1"
  }
}
```

#### 40. Upscale — Non-Enhanceable (returns original)

```json
{
  "prompt": "any prompt here — will be returned as-is",
  "content_type": "upscale",
  "provider": "stability",
  "model": "upscale"
}
```

---

## 4. Response Schema

### Success Response (was_enhanced: true)

```json
{
  "enhanced_prompt": "A dramatic sunset blazing over rugged mountain peaks...",
  "negative_prompt": "blurry, low quality, distorted, watermark...",
  "enhancement_notes": "Added composition guidance for 16:9, lighting details, quality descriptors.",
  "was_enhanced": true,
  "model_used": "eu.anthropic.claude-sonnet-4-5-20250929-v1:0",
  "enhancement_level": "standard",
  "target_provider": "openai",
  "target_model": "dall-e-3",
  "content_type": "image",
  "prompt_format": "natural_language",
  "elapsed_ms": 5497
}
```

### Non-Enhanceable Response (was_enhanced: false)

```json
{
  "enhanced_prompt": "test prompt",
  "negative_prompt": null,
  "enhancement_notes": "Content type 'upscale' does not support prompt enhancement. Original returned.",
  "was_enhanced": false,
  "elapsed_ms": 0
}
```

### Error Response (graceful fallback)

On internal error, the original prompt is returned instead of failing:

```json
{
  "enhanced_prompt": "original user prompt",
  "negative_prompt": null,
  "enhancement_notes": "Enhancement failed — original prompt returned.",
  "was_enhanced": false,
  "error": "internal_error",
  "elapsed_ms": 1234
}
```

### Validation Error (400)

```json
{
  "error": "'prompt' is required and must be non-empty."
}
```

### Optional Response Fields

| Field | When Present |
|-------|-------------|
| `double_enhancement_warning` | When target model has native prompt rewriting (DALL-E 3 always-on, or enhance_prompt param active) |
| `partial_enhancement_note` | When content_type has limited enhancement scope (inpaint, styletransfer, sketch, etc.) |
| `negative_prompt` | Only when target model supports dedicated negative prompt field (SD3, SDXL, Kling, FLUX Dev, Ideogram, Tripo3D) |

---

## 5. Enhancement Levels

| Level | LLM Temperature | Behavior |
|-------|-----------------|----------|
| `minimal` | base - 0.3 (min 0.2) | Grammar fix, 1-2 quality tags. No creative expansion. |
| `standard` | base | Add composition, lighting, style details. Moderate creative expansion. |
| `creative` | base | Rich descriptive enhancement. Evocative language. Artistic direction. |
| `maximum` | base + 0.1 (max 1.0) | Deepest enhancement. Complex composition. Advanced techniques. |

Base temperature varies by content type:

| Content Type | Temperature |
|-------------|-------------|
| image, video, animation | 0.7 |
| music | 0.8 |
| logo, icon | 0.4 |
| voice | 0.3 |
| translation | 0.2 |
| sfx, threed, 3d | 0.5 |
| sprite, sticker, tattoo, comic | 0.6 |

---

## 6. Supported Content Types

### Fully Enhanceable (40 types)

`image`, `avatar`, `logo`, `icon`, `sprite`, `video`, `animation`, `voice`, `music`, `sfx`, `threed`, `3d`, `sticker`, `comic`, `tattoo`, `qrart`, `skybox`, `texture`, `archrender`, `productphoto`, `pattern`, `coloringpage`, `mockup`, `vector`, `infographic`, `presentation`, `terrain`, `vfx`, `font`, `document`, `pose`, `dialogue`, `translation`

### Partially Enhanceable (7 types)

Only the creative/descriptive portion is enhanced:

`inpaint`, `styletransfer`, `sketch`, `restyle`, `outpaint`, `searchreplace`, `faceid`

### Non-Enhanceable (18 types)

Original prompt returned unchanged:

`upscale`, `subtitle`, `transcription`, `lipsync`, `tryon`, `erase`, `bgremove`, `colorize`, `depthmap`, `normalmap`, `segment`, `faceswap`, `liveportrait`, `voiceclone`, `speechtospeech`, `dubbing`, `isolate`, `recolor`

---

## 7. Provider/Model Rules

### Prompt Format Types

Each model receives a format-specific prompt:

| Format | Models | Description |
|--------|--------|-------------|
| `natural_language` | DALL-E 3, GPT Image, Imagen 3/4, Luma Photon, Kling | Clear descriptive sentences |
| `hybrid_nl_tags` | SD3.5, Stable Image Ultra/Core | NL subject + comma-separated quality tags |
| `tag_weighted` | SDXL | Parenthesized weights: `(masterpiece:1.2)` |
| `photography_nl` | FLUX Pro, FLUX Dev | Photography-style descriptions |
| `cinematic_director` | Runway Gen3/Gen4, Kling Video, Luma Ray, Veo, Sora, Minimax, Mochi, Hunyuan, PixVerse, LTX | Film director language with camera/temporal flow |
| `music_tags` | ElevenLabs Music, Stability Music | Genre+mood+bpm+instruments+structure |
| `sound_physics` | ElevenLabs SFX, Beatoven, Mirelo, MMAudio | Physical sound properties |
| `tts_script` | ElevenLabs Voice, HeyGen, Gemini TTS | Script with pacing, grammar fix only |
| `object_focused` | Meshy, Stability 3D, Hunyuan3D, Trellis, Tripo | Object geometry+material, no scene |
| `short_tags` | ACE-Step | Strictly 3-7 descriptive tags |
| `text_first_nl` | Ideogram V3 | Quoted text first, then scene description |
| `design_nl` | Recraft V3 | Vector/illustration vocabulary |
| `passthrough` | DeepL Translation | Grammar fix only, preserve meaning |

### Negative Prompt Strategies

| Strategy | Models | Behavior |
|----------|--------|----------|
| `full_support` | SD3.5, Stable Image, Kling, FLUX Dev, Ideogram, Seedream, Nano, Qwen, Tripo | Generates dedicated negative_prompt field |
| `limited_effect` | Kling Video | Generates negative but warns about limited effect |
| `embed_in_main` | DALL-E 3, GPT Image, Hunyuan3D | Embeds "without X, no Y" at end of main prompt |
| `not_applicable` | FLUX Pro, Runway, Luma, all video/music/voice/sfx/3D (most) | No negative prompt generated |

### Native Enhancement Detection

| Model | Type | Behavior |
|-------|------|----------|
| DALL-E 3 | `always_on` | GPT-4 rewrites internally. Enhancement focuses on specificity, not verbosity. |
| Imagen 3/4 | `param_controlled` | `enhance_prompt` param. Warns if active. |
| FLUX Pro/Dev | `param_controlled` | `enhance_prompt` param. Warns if active. |
| Ideogram V3 | `param_controlled` | `expand_prompt` param. Warns if active. |
| Blockade Labs | `param_controlled` | `enhance_prompt` param. Warns if active. |

### Token/Character Limits per Model

| Model | Hard Limit | Optimal Range (words) |
|-------|------------|----------------------|
| DALL-E 3 | 4,000 chars | 50-200 words |
| GPT Image 1 | 32,000 chars | 50-500 words |
| Imagen 4 | 2,000 chars | 25-125 words |
| SD3.5 | 10,000 chars (512 T5 tokens) | 20-100 words |
| FLUX Pro/Dev | 5,000 chars (512 T5 tokens) | 50-200 words |
| Runway Gen4 | 1,500 chars | 12-50 words |
| Luma Photon | 2,000 chars | 12-75 words |
| Kling Image | 2,500 chars | 25-100 words |
| Meshy | 600 chars | 8-40 words |
| ElevenLabs SFX | 1,000 chars | 5-50 words |
| ElevenLabs Voice | 50,000 chars | 3-1000 words |

---

## 8. System Architecture

### Modular System Prompt Blocks (Framework §12)

The LLM system prompt is assembled dynamically from 16 ordered blocks:

1. **ROLE_BLOCK** — Expert prompt engineer persona, absolute rules
2. **FORMAT_BLOCK** — Model-specific prompt format instructions
3. **FRONT_LOAD_BLOCK** — Subject front-loading requirement (Long-CLIP)
4. **DIALECT_BLOCK** — Target model dialect: encoder, strengths, weaknesses, limits, quirks
5. **STRATEGY_BLOCK** — Rich model-specific enhancement strategy (multi-line instructions)
6. **DOUBLE_ENHANCE_BLOCK** — Native enhancement warning (if applicable)
7. **PARAM_CONTEXT_BLOCK** — Raw parameter values + dynamic enhancement instructions per parameter
8. **CONTENT_TYPE_NEGATIVES** — Domain-specific negative terms (avatar, logo, icon, etc.)
9. **CONTENT_TYPE_RULES** — Domain-specific enhancement guidelines
10. **NEGATIVE_PROMPT_BLOCK** — Negative prompt generation strategy with priming paradox guard
11. **LENGTH_BLOCK** — Optimal range and hard limit (DetailMaster 2025)
12. **ENHANCEMENT_LEVEL_BLOCK** — minimal/standard/creative/maximum instructions
13. **LANGUAGE_BLOCK** — Non-English prompt handling
14. **STYLE_PRESERVATION_BLOCK** — Preserve user's style choices (if enabled)
15. **QUALITY_TAGS_BLOCK** — Quality boosters for hybrid/tag formats
16. **OUTPUT_FORMAT_BLOCK** — JSON response structure

### Post-Processing Pipeline

After LLM response:

1. **JSON Parsing** — Handles markdown fences, nested braces, raw text fallback
2. **Length Enforcement** — Truncates at sentence boundary if exceeding hard limit
3. **Front-Load Validation** — Warns if subject not in first 30 words (Long-CLIP)
4. **Negative Prompt Guardrails** — Removes negative for NOT_APPLICABLE models, truncates to 500 chars for FULL_SUPPORT, nullifies for EMBED_IN_MAIN

### File Structure

```
prompt_enhance/
├── lambda_function.py    # Handler, Bedrock invocation, post-processing
├── config.py             # MODEL_RULES (40+ models), lookup functions, mappings
├── system_prompts.py     # Modular template blocks, system prompt builder
└── requirements.txt      # No external deps (boto3 in Lambda runtime)
```

---

## 9. AWS Infrastructure

| Resource | Value |
|----------|-------|
| Lambda Function | `ssm-content-worker-prompt-enhance` |
| Runtime | Python 3.12 (Zip deployment) |
| Memory | 256 MB |
| Timeout | 30 seconds |
| Region | eu-central-1 |
| IAM Role | `ssm-content-lambda-role` |
| Bedrock Model | `eu.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| API Gateway | REST API `i3ob0ck5m2` — route `/enhance-prompt` → `job_creator` → `prompt-enhance` worker |
| Deploy Script | `deploy_prompt_enhance.ps1` (PowerShell) |
| AWS Profile | `ideasets_production` |
| Account | `060768936870` |

### IAM Permissions Required

```json
{
  "Effect": "Allow",
  "Action": [
    "bedrock:InvokeModel",
    "bedrock:InvokeModelWithResponseStream"
  ],
  "Resource": [
    "arn:aws:bedrock:*::foundation-model/anthropic.claude-*",
    "arn:aws:bedrock:*::foundation-model/amazon.nova-*",
    "arn:aws:bedrock:*:060768936870:inference-profile/*"
  ]
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BEDROCK_MODEL_ID` | `eu.anthropic.claude-sonnet-4-5-20250929-v1:0` | Bedrock model to use |
| `BEDROCK_REGION` | `eu-central-1` | Bedrock API region |
| `BEDROCK_MAX_TOKENS` | `1024` | Max output tokens |
| `LOG_LEVEL` | `INFO` | CloudWatch log level |

### Model Override Priority

1. Request body `llm_model` or `model_id` (highest priority)
2. Environment variable `BEDROCK_MODEL_ID`
3. `ENHANCEMENT_LEVEL_MODELS` mapping (lowest priority)

---

## 10. Deployment

```powershell
# From repository root
.\deploy_prompt_enhance.ps1
```

The script:
1. Zips `prompt_enhance/` directory
2. Checks if Lambda exists (create or update)
3. Sets environment variables including Bedrock model ID
4. Deploys to `eu-central-1` using `ideasets_production` profile

---

## 11. Verified Test Results (2026-04-02)

All content types tested and operational:

| # | Content Type | Provider/Model | Format | Negative | Length | Time |
|---|-------------|----------------|--------|----------|--------|------|
| 1 | IMAGE | OpenAI/DALL-E 3 | natural_language | NO | 511 | 5,497ms |
| 2 | IMAGE | Stability/SD3.5 | hybrid_nl_tags | YES | 352 | 5,673ms |
| 3 | IMAGE | fal/FLUX Pro | photography_nl | NO | 474 | 5,312ms |
| 4 | VIDEO | Runway/Gen4 | cinematic_director | NO | 243 | 5,143ms |
| 5 | MUSIC | ElevenLabs/Music | music_tags | NO | 231 | 4,528ms |
| 6 | SFX | ElevenLabs/SFX | sound_physics | NO | 167 | 4,392ms |
| 7 | AVATAR | OpenAI/GPT Image | natural_language | NO | 543 | 5,729ms |
| 8 | LOGO | fal/Ideogram | text_first_nl | YES | 263 | 6,063ms |
| 9 | 3D | fal/Meshy | object_focused | NO | 222 | 3,959ms |
| 10 | VOICE | ElevenLabs/Voice | tts_script | NO | 69 | 3,587ms |
| 11 | UPSCALE | (non-enhanceable) | — | NO | 11 | 0ms |

Average latency: ~5,000ms (includes Bedrock Converse API call).

---

## 12. Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing `prompt` | 400: `'prompt' is required and must be non-empty.` |
| Missing `content_type` | 400: `'content_type' is required.` |
| Invalid `enhancement_level` | 400: `Invalid enhancement_level: '...'. Use: minimal/standard/creative/maximum.` |
| Prompt > 100,000 chars | 400: `'prompt' exceeds maximum length.` |
| Non-enhanceable content type | 200: Returns original prompt with `was_enhanced: false` |
| Bedrock API failure | 200: Returns original prompt with `was_enhanced: false, error: "internal_error"` |
| LLM JSON parse failure | Falls back to raw LLM text as enhanced prompt |

The graceful fallback design ensures the client always receives a usable prompt — never a hard failure.
