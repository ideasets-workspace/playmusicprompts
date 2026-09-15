# Standards ledger

Governance files read IN FULL in this session, before any external action:

| Governing file | Path | Evidence |
|---|---|---|
| Deep-research covenant (rule + skill merged; PART I + PART II R0–R18 + annexes P1–P5) | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` | SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes — re-hashed from disk this session, matches the brief |
| Project contract | `c:\Berk\SsmContentAssetCreator\AGENTS.md` | SHA-256 `D18A2C1CD201C4C3BFDB9F62FF22502C5B48CDCBA201C2728EC7ABB4083B1B4E` |
| Research standard + delegation mandate | `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session |
| Approved R3 scope plan | `c:\Berk\SsmContentAssetCreator\docs\research\_runs\2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session |

Governed research root resolved per R15.1/R18.4: `docs/research/` (product/API topic, not a film topic). Artefact language: ENGLISH. The owner's Turkish appears only as verbatim quoted evidence.

---

# Document scope and the evidence-class rule that governs every row

**Role:** R14.3 axis 1 — the **FUNCTIONS AND SERVICES** deliverable of four. This is the document that answers the owner's approved scope, quoted verbatim as the requirement it is: *"evet ve suno daki gibi en advanced settimngs ayarlar melodiler vs. vs."*

**Observation date: 2026-08-13.**

**THE EVIDENCE-CLASS RULE, applied to every capability in this document.** This project has been burned four times by treating a printed schema or a marketing page as capability evidence. So every capability below is labelled with *what kind of evidence I have*, and these are never blurred:

- **`API-SPECIFIED`** — the parameter exists in a first-party API reference I opened, with its name, type and limits. This is the strongest class in this document and it still is **not** proof the parameter does anything.
- **`DOC-DESCRIBED`** — a first-party help-centre or documentation page describes the control and how to reach it in the UI.
- **`CHANGELOG-DATED`** — the vendor's own release notes announce it, with a date.
- **`MARKETING-CLAIMED`** — asserted on a product/announcement page only.
- **`THIRD-PARTY-DESCRIBED`** — described by a non-vendor source. Never load-bearing alone.
- **`PAPER-MEASURED`** — a number from a table in a paper I read in full.
- **`NOT OBSERVED`** / **`NOT FOUND IN THE SEARCHED SCOPE`** — with the queries recorded.

**Nothing in this document was verified by generation.** No account, no trial, no spend. Therefore **no row here is GENERATION_PROVEN**, and the honest consequence is stated up front: this document establishes *what the vendors specify and document*, which is exactly what a parity decision needs, and it does **not** establish that any control works.

# Outcome first — the capability facts that most change the BUILD decision

1. **The single richest *documented* control surface in this category is not Suno's — it is ElevenLabs' `composition_plan`.** It is the only API I found that lets a caller specify, per section of the song, the lyrics lines, the section duration in milliseconds, positive styles, negative styles, and how strongly that section adheres to its neighbours — plus word-level timestamps, section-level inpainting against a stored song, and audio conditioning with a four-level strength. That is Suno's advanced panel expressed as JSON, and it is purchasable today.
2. **The controls NO vendor exposes by API anywhere in the enumerated universe:** a *weirdness*-type creativity slider · a *style-influence* slider as a numeric parameter · a persona/voice-identity handle that carries a singer across songs (except Mureka's `vocal_id`, which is a clone ID, not a persona) · a hard key/BPM/time-signature *lock* · lyric-timing control expressed as target timestamps you set (ElevenLabs returns timestamps, it does not accept them) · MIDI or stem *output* from the generation call · a numeric vocal-gender parameter. Each is documented below with the exact scope of the absence.
3. **The gap between our project's current capability and the category is one function, not many.** Every Tier A product's core loop is: lyrics with `[Verse]`/`[Chorus]` tags + a style prompt → an intelligible sung, structured, mixed song. This project owns the instrumental bed (Lyria) and voice identity (Vertex TTS, F0-measured) but has measured that its music surface returns **0 of 8 dictated words**. The category's differentiator is precisely *intelligible sung lyrics on a structural grid*.
4. **Open weights now publish that same control set, with numbers.** ACE-Step v1.5 documents cover generation, repainting, track extraction, layering, completion, vocal-to-BGM, zero-shot timbre cloning and LoRA personalisation from a few songs, at **under 2 s per full song on an A100**, **<4 GB VRAM**, **50+ languages**, and reports **Lyric Align 26.3 vs Suno-v5's 34.2** on its own metric. DiffRhythm 2 reports **PER 0.13 vs Suno V4.5's 0.28** — i.e. an open model beating a commercial one on transcribable lyric accuracy while still losing on musicality.

**Bad news first:** the two products with the best measured musicality (Suno, Udio) expose **no public API at all**, so their advanced controls are unreachable programmatically; and the one strong first-party control surface that *is* reachable (ElevenLabs) forbids naming any artist, song, album, label or publisher in the prompt, which removes the reference-by-example affordance users expect.

---

# The enumerated competitor universe (identical across all four documents)

**Tier A — consumer full-song generators:** A1 Suno · A2 Udio · A3 Google Flow Music (Riffusion → ProducerAI) · A4 ElevenLabs Eleven Music · A5 Mureka · A6 MiniMax Music · A7 Boomy
**Tier B — first-party APIs:** B1 Google Lyria 2/3/3 Pro · B2 ElevenLabs Music API · B3 Stability Stable Audio 2.5/3.0 · B4 Mureka API · B5 MiniMax Music API · B6 Soundraw API · B7 Loudly API · B8 Mubert API · B9 Beatoven.ai · B10 AIVA
**Tier C — open weights:** C1 ACE-Step / v1.5 · C2 DiffRhythm / 2 · C3 YuE · C4 LeVo/SongGeneration (Tencent) · C5 HeartMuLa · C6 MusicGen/AudioCraft · C7 Stable Audio Open
**Tier D — regional/big-tech:** D1 Tencent · D2 ByteDance · D3 Alibaba
**Tier E — gateways:** E1 fal · E2 Replicate · E3 WaveSpeedAI · E4 CloudSway · E5 aggregators · E6 unofficial Suno gateways

---

# THE ADVANCED-CONTROLS MATRIX — all 24 control categories the brief named, across the universe

Legend: **A**=API-SPECIFIED · **D**=DOC-DESCRIBED · **C**=CHANGELOG-DATED · **M**=MARKETING-CLAIMED · **3P**=THIRD-PARTY-DESCRIBED · **P**=PAPER-MEASURED · **—**=not found in searched scope · **n/o**=not observed.
Columns: Suno (A1) · Udio (A2) · Flow Music (A3) · ElevenLabs (A4/B2) · Mureka (A5/B4) · MiniMax (A6/B5) · Lyria (B1) · Stable Audio (B3) · Open weights (C1/C2).

| # | Control category (brief's wording) | Suno | Udio | Flow | 11Labs | Mureka | MiniMax | Lyria | StableAudio | Open |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Persona / voice consistency across songs** | **C** Personas (2024-10-31) + Voices/Custom Models (v5.5, 2026-03-26) | **D** "Save & reuse your own Voices" (pricing grid) | — | — | **A** `vocal_id` (timbre ID) | — | — | — | **P** zero-shot timbre cloning + LoRA (ACE-Step v1.5) |
| 2 | **Style reference audio (audio → style)** | **C** Audio Inputs (2024-06-12/28); Sample; Mashup | **D** "Style creates a song that matches the vibe of what you uploaded"; "Create with Styles (use a musical reference)"; "Blend Styles"; premium **Artist Styles** | **M** remix audio with effects | **A** `conditioning_ref{song_id,range,condition_strength}` | **A** `reference_id` | **A** `audio_url`/`audio_base64` (cover model), 6 s–6 min, ≤50 MB | **A** Lyria 3 accepts an **image** input, not audio | **A** `audio_url` + `strength` (audio-to-audio) | **P** structural guidance from arbitrary audio references |
| 3 | **Audio/MELODY prompting (hum/clip as melodic seed)** | **C** "Try uploading a clip of your singing, **humming**, or playing an instrument and try covering" (Covers, 2024-09-12) | **D** upload → Extend/Inpaint/Session/Remix/Style | — | via #2 conditioning only | **A** **`melody_id`** — a dedicated melody-purpose reference; "After selection, prompt, reference_id, and vocal_id become invalid" | via cover model only | — | via #2 strength only | **P** "Completion (orchestrating full arrangements around a single motif)" |
| 4 | **Stem separation / export** | **C** up to **12 stems**; 2026-06-11 upgrade: **Advanced Split ~100 instruments** (Premier), Split-from-mix, Auto-split 12 categories | **D** stems existed; **DISABLED** with downloads (2026-02-17) | **D** "Stem downloads" row | **3P** stem separation added Mar 2026 (not in the API ref I read) | **3P** stem separation | — | — | — | **P** "Track Extraction"; "Stem Separation" is item 11 of ACE-Step's own 17-point usability checklist |
| 5 | **Section / structure tags (verse/chorus/bridge)** | **C** "Song structure labels: Add labels like 'Verse' and 'Outro'" (2026-07-09) | **D** section-by-section editing; "Instrumental" section marking | — | **A** `text` = "Section name in square brackets (`[Verse 1]`)"; `section_name` 1–100 chars | **A** `[Verse]`/`[Chorus]` in `lyrics` (curl example) | **A** explicit enum: `[Intro] [Verse] [Pre Chorus] [Chorus] [Interlude] [Bridge] [Outro] [Post Chorus] [Transition] [Break] [Hook] [Build Up] [Inst] [Solo]` | — | — | **P** LM planner emits structure in YAML |
| 6 | **Inpainting / replace section** | **C** Replace Section (2024-10-10), selection **10–30 s**; Song Editor from the waveform (2025-06-03) | **D** **Inpaint** on upload and on any track; Replace Section; paid only | **M** granular edit via conversational agent | **A** `source_from{song_id,range,negative_ranges}` + `store_for_inpainting`; dedicated inpainting guide | — | — | — | **A/M** audio **inpainting** ("select where they want it to start") | **P** "Repainting for seamless segment regeneration"; "Non-Destructive Editing" (checklist #10) |
| 7 | **Extend** | **C** Extend (iOS 2025-02-06); Remix→Extend | **D** Extend before **or** after the upload | — | via composition-plan chunks | **D** "Song Extension" (one of four standard API features) | — | — | **A** `total_seconds` | **P** 10-min compositions |
| 8 | **Cover / upload-and-cover** | **C** Covers (2024-09-12): "keep the melody… adopt them into a different style"; first 200 free then 10 credits | **D** Remix "crafts something similar to what you've uploaded" | — | — | **D** cover via `reference_id` | **A** dedicated **`music-cover`** model + free **Music Cover Preprocess** returning `formatted_lyrics`, `structure_result` (segment types + timestamps), `audio_duration` | — | audio-to-audio ≈ cover | **P** "Cover Generation by re-synthesizing timbre while retaining melodic skeletons" |
| 9 | **Remaster** | **C** Remaster (v4, 2024-11-19); v5 "remaster your old tracks… **control the level of variation** from the original" | — | — | — | — | — | — | — | — |
| 10 | **Key control** | **C** Sounds mode (2026-01-27): loops let you "**select your key and tempo (bpm)**" — for loops/samples, not full songs. **3P**: "key signatures" were a stated V3-Alpha weakness in Suno's own note | — | — | **A** *as a style string only* — docs' own example puts `"C major"` and `"D minor"` inside `positive_styles` | — | **3P** "E minor, 90 BPM" as prompt text | — | — | **P** LM emits key in CoT metadata |
| 11 | **Tempo / BPM control** | **C** same Sounds mode bpm selector; Studio "Control BPM, volume, pitch" (2025-09-25) | — | — | **A** *style string only* — `"120 BPM"`, `"80 BPM"` in `positive_styles` | — | **3P** prompt text | — | — | **P** BPM in CoT metadata |
| 12 | **Time signature** | **C** "**Time Signature Support**" in Studio 1.2 (2026-02-16), with Remove FX, Warp Markers, Alternates | — | — | — | — | — | — | — | — |
| 13 | **Negative style prompt** | **C** **Exclude Styles** (2024-09-19), Pro/Premier, shown as `-piano` in the sidebar | **D** "**Reduce Styles**" row on the pricing grid | — | **A** `negative_global_styles` (required array) + `negative_local_styles` per section + `negative_styles` per chunk, **max 50** | — | — | **A** `negative_prompt` (e.g. "vocals, slow tempo") | — | — |
| 14 | **"Weirdness" slider** | **C** Creative Sliders (2025-06-03): "fine-tune how **weird**, structured, or reference-driven your generations get", Pro & Premier | — | — | **NO** | — | — | — | — | — |
| 15 | **Style-influence slider** | **C** same Creative Sliders trio (Weirdness / Style Influence / Audio Influence) | **3P** Prompt Strength 0–100% | — | **partial**: `context_adherence` ∈ {low,medium,high} and `condition_strength` ∈ {low,medium,high,xhigh} — **enums, not sliders** | — | — | — | **A** `guidance_scale` (fal-hosted), default 1 | — |
| 16 | **Audio-influence slider** | **C** third Creative Slider | **3P** Context Length | — | `condition_strength` (4 levels) | — | — | — | **A** `strength` default 0.8, KB-recommended 0.6–0.9 | — |
| 17 | **Lyric-timing control** | **C** natural-language lyric editing; "editing Lyrics will **not** update the lyrics sung in the song" (2024-07-12) | **3P** Lyric Strength; syllable-stress markers | — | **A** `with_timestamps=True` returns **word-level timestamps** (output, not input); per-chunk `duration_ms` is the only *input* timing control | — | ASR-derived `structure_result` timestamps from the cover preprocess | — | — | **P** ACE-Step's AAS metric optimises lyric-audio sync; DiffRhythm 2 aligns "without relying on external labels" |
| 18 | **Instrumental-only mode** | **C** Instrumental toggle; `[Instrumental]` / `[Instrumental Break]` tags; "Add instrumental" row | **D** mark a section "Instrumental" | — | **A** `force_instrumental` (bool, prompt mode only) | **A** `instrumental_id` | **A** `is_instrumental` (bool) | **A** `negative_prompt: "vocals"` is the documented idiom | **A** effectively instrumental/SFX-first | **P** vocal-to-BGM conversion |
| 19 | **Vocal gender / register** | **C** "**Vocal Gender** so you can choose male or female vocals, just like on web" (mobile, 2026-05-14); documented idiom: `[female vocals]` in lyrics + "male vocals" in Exclude | — | — | **A** as a style string: `"female vocalist with clear tone"`, `"confident male voice"` | — | **3P** "male vocal" in prompt | — | — | — |
| 20 | **Language support** | **C** "Expanded language support" (V3 Alpha); Global Trending "in multiple languages" | — | — | **A** styles **must be English**; "**lyrics can be any language**" | **D** 10 languages `[3P]` | **A** lyrics free-form, CN/EN examples in the spec | **A** prompt must be **US English (en-us)** | **A** prompt English | **P** "**50+ languages**"; 50% stochastic romanisation for CJK/Thai |
| 21 | **Duration limits** | **C** **Duration slider on web** (2026-07-20, v5.5); history: 2 min (V3α) → 4 min (v3.5) → 8 min upload | **D** 32 s and 130 s generations; 2-min model | **3P** up to 3 min (Lyria 3 Pro) | **A** `music_length_ms` 3,000–600,000 (**10 min**); chunk 3,000–120,000; ≤30 chunks | **3P** ~4 min | **A** lyrics ≤3,500 chars drives length | **A** Lyria 2 = **32.8 s** per clip; Lyria 3 clip = 30 s; Pro = full song | **M** up to 3 min (2.5) / 6 min (3.0 `[3P]`) | **P** 10-min (ACE-Step 1.5); **210 s** (DiffRhythm 2) |
| 22 | **Output formats / sample rates** | **C** `.wav` for Pro/Premier since v3.5 | **D** downloads **disabled** | **D** "Downloads (mp3, wav, m4a)" | **A** 25-value enum incl. `mp3_48000_320`, `pcm_48000`, `opus_48000_192`; auto = `mp3_44100_128` (v1) / `mp3_48000_192` (v2) | **3P** mp3/wav/flac via reseller | **A** `sample_rate` {16k,24k,32k,44.1k} × `bitrate` {32k,64k,128k,256k} × `format` {mp3,wav,pcm} | **A** WAV, base64; docs cite 48 kHz | — | **P** 48 kHz stereo VAE (ACE-Step 1.5) |
| 23 | **Editing history / versioning** | **C** Workspaces (2025-01-14); Trash + restore; "See every remix made from a track, **trace originals**" | **D** Sessions timeline; Alternates | **D** "Projects" row | `song_id` + `store_for_inpainting` is the versioning primitive | — | `cover_feature_id` valid 24 h | — | — | — |
| 24 | **Collaboration** | **C** Co-write with Suno; comments; Remix permission control; Hooks | **D** "Adjust song access permissions" | **M** publish/playlists/follow | **A** workspace **seats**: 3 (Scale) / 10 (Business) | — | — | GCP IAM | enterprise licence | — |
| 25 | **API availability** *(added: the brief's item (a) list ends with it and it is decisive)* | **NONE** — "exploring", curated partners only (2026-07-01) | **NONE found** | **NONE** (product is the surface; Lyria is the API) | **YES, richest** | **YES** | **YES**, incl. free model IDs | **YES** | **YES** | self-host |

**Machine count of the brief's named advanced-settings items:** the brief named 23 distinct control categories in item (a); this matrix carries **25 rows** (the 23 plus `remaster` split from `inpainting`, and `API availability` made explicit). Nothing from the brief's list was dropped.

---

# The exact API contracts, parameter by parameter (five-part depth records)

## B2 — ElevenLabs Music API — the reference control surface of this category

**Locators, both fetched and read in full 2026-08-13:** `https://elevenlabs.io/docs/api-reference/music/compose.mdx` `[FULL]` and `https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans.mdx` `[FULL]`.

**(1) The vendor's own framing.** "Compose a song from a prompt **or** a composition plan." And: "Composition plans provide fine-grained control over music generation… Use text prompts for quick prototyping and composition plans when you need **specific chunk structure, precise lyrics timing, or complex arrangements**."

**(2) The mechanism, step by step, from the API reference `[FULL]` — `POST https://api.elevenlabs.io/v1/music`:**

| Parameter | Type / allowed values | Documented semantics and limits |
|---|---|---|
| `prompt` | string, nullable | "Cannot be used in conjunction with `composition_plan`" |
| `composition_plan` | object — **two alternative shapes**: `MusicPrompt` or `CompositionPlan` | mutually exclusive with `prompt` |
| `MusicPrompt.positive_global_styles` | list[string], **required** | "styles and musical directions that should be present in the **entire** song. Use English language for best result" |
| `MusicPrompt.negative_global_styles` | list[string], **required** | whole-song negative styles |
| `MusicPrompt.sections[]` | list[object], required | the song's sections |
| `…section_name` | string, required | 1–100 characters |
| `…positive_local_styles` / `…negative_local_styles` | list[string], required | per-section positive/negative |
| `…duration_ms` | integer, required | **3,000–120,000 ms** |
| `…lines` | list[string], required | the section's lyrics; **max 30 lines**, **max 200 chars per line** |
| `…source_from{song_id, range{start_ms,end_ms}, negative_ranges[]}` | object, nullable | "Optional source to extract the section from. **Used for inpainting**"; `song_id` "in the response headers when you generate a song" |
| `CompositionPlan.chunks[]` | list, required, **≤30** | ordered chunks; each generates one section |
| `…text` | string, required | "Can contain section name in square brackets, e.g. `[Verse 1]`, lyrics lines, and **inline directions in curly braces**, e.g. `{scratching}`" |
| `…duration_ms` | integer, required | 3,000–120,000 ms |
| `…positive_styles` | list[string], required, **max 50** | "The styles for the **first chunk are the most important**… Aim to have at least **6-7 styles** in early chunks" |
| `…negative_styles` | list[string], optional, max 50 | "Leaving empty is a good default" |
| `…context_adherence` | enum `low` \| `medium` \| `high` (default `high`) | "How much the model adheres to the context of its surrounding chunks. Low adherence means the model can deviate… and be more creative" |
| `…conditioning_ref{song_id, range}` | object, nullable | "The **first chunk is the most important** as it will influence the generation of all subsequent chunks" |
| `…condition_strength` | enum `low` \| `medium` \| `high` \| **`xhigh`** | "How strongly the model adheres to the conditioning reference" |
| `AudioRefChunk{song_id, range}` | alternative chunk type | insert real audio from a stored song as a chunk |
| `music_length_ms` | integer, nullable | **3,000–600,000 ms** (10 min); "Used **only** in conjunction with `prompt`" |
| `model_id` | enum `music_v1` \| `music_v2` (default `music_v1`) | chunk plans **require `music_v2`** |
| `seed` | integer, nullable | "Providing the same seed with the same parameters can help achieve more consistent results, but **exact reproducibility is not guaranteed** and outputs may change across system updates. **Cannot be used in conjunction with prompt**" |
| `force_instrumental` | bool, default false | "guarantees… instrumental. **Can only be used with `prompt`**" |
| `finetune_id` | string, nullable | ID of a **music finetune** to generate with |
| `respect_sections_durations` | bool, default true | "only applies to `music_v1`; for `music_v2` section durations are **always enforced** and this is ignored" |
| `store_for_inpainting` | bool, default false | store the output so it can later be inpainted |
| **`sign_with_c2pa`** | bool, default false | "Whether to **sign the generated song with C2PA**. Applicable only for mp3 files" |
| `output_format` (query) | 25-value enum | `auto`, `mp3_48000_{128,192,240,320}`, `mp3_44100_{32,64,96,128,192}`, `mp3_{22050_32,24000_48}`, `pcm_{8000…48000}`, `ulaw_8000`, `alaw_8000`, `opus_48000_{32,64,96,128,192}`; auto = `mp3_44100_128` (v1) / `mp3_48000_192` (v2) |
| Regional servers | — | `api.elevenlabs.io`, `api.us.`, `api.eu.residency.`, `api.in.residency.`, `api.sg.residency.` — **data-residency endpoints**, which no other music vendor in this set publishes |

**Adjacent methods (from ElevenLabs' own published skill reference `[via search-result page text]`, corroborated by the two `[FULL]` docs for the ones I could confirm):** `music.compose`, `music.stream` ("paid plans"), `music.composition_plan.create`, `music.compose_detailed` (audio + plan + metadata; `store_for_inpainting=True`), `music.compose_detailed_stream` (SSE with plan, metadata, optional word timestamps), **`music.video_to_music`** (background music from uploaded video files), `music.upload` (upload audio for inpainting, optionally extracting its composition plan **or word-level timestamps**), and `music.finetunes.{list,create,get,update,delete}` (train a finetune from uploaded audio).

**(3) Exact numbers.** ≤30 chunks · chunk 3–120 s · total 3 s–10 min · ≤50 styles per list · ≤30 lyric lines/section · ≤200 chars/line · section_name 1–100 chars · 4 condition-strength levels · 3 context-adherence levels · 25 output formats · 5 regional endpoints · price 900 credits/generated minute.

**(4) Stated limitations, in the vendor's own words.** Seed "exact reproducibility is **not** guaranteed". Styles "must be in English". `force_instrumental` and `music_length_ms` are prompt-mode only; `seed` is plan-mode only. Copyright guard: "If you include copyrighted content in styles, the API returns a **`bad_composition_plan` error with a suggested alternative**." Plus the Music Terms' industry bans and the prohibited-input list (no artist/songwriter name, song title, album title, publisher, label, or "a substantial or distinct portion of any song's lyrics").

**(5) Concrete application here.** This is the parameter surface a competitive `music_*` worker in this repo would have to match or exceed: a per-section object carrying `text` (with bracket tags and brace cues), `duration_ms`, positive/negative style arrays, an adherence level, and an optional audio reference with a strength level — plus `store_for_inpainting`-style persistence so a later call can replace one section by time range, and C2PA signing as a first-class request flag.

## B5 — MiniMax Music API — the only vendor exposing a free tier as model IDs, and the only one with a documented 14-tag structure enum

**Locator:** `https://platform.minimax.io/docs/api-reference/music-generation`, full OpenAPI 3.1.0 spec fetched and read 2026-08-13 `[FULL]`. Server `https://api.minimax.io`, bearer auth, `POST /v1/music_generation`.

**(1) Framing.** "Use this API to generate a song from lyrics and a prompt."

**(2) Mechanism — every documented parameter:**

| Parameter | Type / values | Documented semantics |
|---|---|---|
| `model` (**required**) | enum `music-3.0` \| `music-2.6` \| `music-cover` \| `music-3.0-free` \| `music-2.6-free` \| `music-cover-free` | paid IDs: "Token Plan and paid users only, **RPM 120**"; `-free` IDs: "Available to all users via API Key, **RPM 3**" |
| `prompt` | string ≤2,000 | "**Required**" for instrumental mode and for cover (10–300 chars, "Describes the target cover style"); optional 0–2,000 for vocal mode |
| `lyrics` | string, 1–3,500 | "using `\n` to separate lines"; **required** for non-instrumental; 10–1,000 for cover; auto-generated when `lyrics_optimizer: true` and empty |
| **structure tags** | closed enum of **14** | `[Intro] [Verse] [Pre Chorus] [Chorus] [Interlude] [Bridge] [Outro] [Post Chorus] [Transition] [Break] [Hook] [Build Up] [Inst] [Solo]` |
| `lyrics_optimizer` | bool, default false | auto-write lyrics from `prompt`; not supported on the cover models |
| `is_instrumental` | bool, default false | no vocals; `lyrics` then unnecessary |
| `audio_url` / `audio_base64` | string | cover models only, **exactly one**; reference audio **6 s–6 min**, **≤50 MB**, "mp3, wav, flac, etc." |
| `cover_feature_id` | string | from the **free** Music Cover Preprocess API; mutually exclusive with the two above; valid **24 h**; "Same audio content returns the same `cover_feature_id`"; requires `lyrics` 10–1,000 |
| `stream` | bool, default false | streaming; when true `output_format` must be `hex` |
| `output_format` | enum `url` \| `hex`, default `hex` | "`url` links **expire after 24 hours**" |
| `audio_setting.sample_rate` | 16000 \| 24000 \| 32000 \| 44100 | — |
| `audio_setting.bitrate` | 32000 \| 64000 \| 128000 \| 256000 | — |
| `audio_setting.format` | mp3 \| wav \| pcm | — |
| response | `data.status` (1 in progress, 2 complete), `data.audio` (hex), `extra_info{music_duration, music_sample_rate, music_channel, bitrate, music_size}`, `trace_id` | the example returns `music_duration: 25364` ms, 44,100 Hz, 2 channels |
| error codes | `1002` rate limit · `1004` auth · **`1008` insufficient balance** · `1026` content flagged sensitive · `2013` invalid params · `2049` invalid API key | — |

**Two-step cover workflow, from MiniMax's own guide `[via search-result page text]`, corroborated by the `cover_feature_id` field in the `[FULL]` spec:** call Music Cover Preprocess ("This step is **free** (no charge)") → receive `cover_feature_id`, **`formatted_lyrics`** (structured with section tags), **`structure_result`** (JSON of segment types **and timestamps**) and `audio_duration` → modify the lyrics → generate. **This is the closest thing in the whole universe to a documented "give me the structure and timing of this song so I can rewrite it"** primitive, and it is free.

**(4) Limitations.** Free IDs at RPM 3 are evaluation-only. `url` outputs expire in 24 h, so a product must re-host immediately. `1026` shows server-side content moderation on lyrics. Cover reference audio must be rights-cleared by the caller (not stated in the spec — a gap).

**(5) Application here.** The 14-tag enum and the preprocess→edit→cover loop are directly transposable to a worker contract in this repo, and MiniMax's free model IDs make a **zero-cost** capability probe possible before any spend.

## B4 — Mureka API — the mutual-exclusion control model

**Locators:** `https://platform.mureka.ai/docs/` and `.../api/operations/post-v1-song-generate.html` `[PARTIAL]` (client-rendered schema — endpoint, auth and async contract readable, parameter table not); base URL `https://api.mureka.ai`, quickstart body `[via search-result page text]`; parameter semantics from two independent reseller republications of the contract `[3P]`.

- **Endpoint:** `POST /v1/song/generate`; async — "Use the `song/query/{task_id}` API to poll for task information". First response fields: `id`, `created_at`, `model`, `status: "preparing"`, `trace_id`.
- **Four standard features, in Mureka's own words `[FULL]` from the docs index:** "Song Generation, Instrumental Generation, Lyrics Generation, Song Extension."
- **The control model, from the reseller republication `[3P]`, notable because it is a *mutual-exclusion lattice* rather than a flat parameter list:** `lyrics` (required) · `model` (`auto`, or version IDs) · `n` ≤3 · `prompt` ≤1,024 chars — "**Other control options will be disabled after selection**" · `reference_id` (purpose: reference) — "After selection, **prompt and melody_id become invalid**" · `vocal_id` (purpose: vocal/timbre) — "After selection, prompt and melody_id become invalid" · **`melody_id`** (purpose: melody) — "After selection, **prompt, reference_id, and vocal_id become invalid**" · `instrumental_id` (pure-music reference) · `stream` (bool; "Not supported by the o1 model").
- **Why this matters:** Mureka is the **only** vendor in the universe with a *dedicated melody-purpose reference ID* — the literal answer to the owner's word *"melodiler"*. And its exclusion rules encode a real engineering truth: melody conditioning and text conditioning fight each other. Any surface we build must decide the same precedence question explicitly.
- **Lyrics limit `[3P]`:** up to **3,000 characters**.
- **Status honesty:** the parameter names are `[3P]`, republished identically by two independent resellers (CloudSway and WaveSpeedAI) plus a third aggregator — three families agreeing, but **none is Mureka**. Mureka's own parameter table was not readable. Flagged.

## B1 — Google Lyria — the sparsest documented surface, and the one we already own

**Locators:** `https://cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music` `[FULL]`; Lyria API reference `[via search-result page text]`.

- **Lyria 2 (`lyria-002`, GA):** `instances[{prompt, negative_prompt, seed}]` + `parameters{sample_count}`. Documented constraints: `prompt` is "The text description **in US English (en-us)**"; **"Cannot be used with `sample_count` in the same request"** (seed and sample_count are mutually exclusive); response `predictions[].audioContent` base64 + `mimeType: audio/wav`; **"Each clip is 32.8 seconds long."** That is the entire control surface: **3 instance fields and 1 parameter.**
- **Lyria 3 (`lyria-3-clip-preview`, `lyria-3-pro-preview`):** a different surface entirely — `POST .../v1beta1/projects/PROJECT_ID/locations/**global**/interactions` with `{"model": …, "input": [{type:"text",text:…},{type:"image",mime_type:…,uri:…},{type:"image",…,data:…}]}`. **Documented inputs are text and IMAGE. There is no documented audio input, no negative prompt, no seed, no section structure, no lyrics field.** The response `outputs` array contains `{"text":"LYRICS"}`, `{"text":"DESCRIPTION"}` and `{"mime_type":"audio/mpeg","data":…}`.
- **The decisive observation for this project, stated with its evidence class:** Lyria 3 Pro's documented response **emits lyrics** but the documented request has **no lyrics input field**. So on the documented surface, the model *writes* the words rather than *singing yours*. That is consistent with this project's own measurement (0 of 8 dictated Turkish words returned via `lyria-002`) and it is the crux of the capability gap. **DOC-DESCRIBED only — a controlled $0.08 probe on `lyria-3-pro-preview` is required before anything rests on it.**
- **Console surface `[FULL]`:** Vertex AI Studio → Generate Media → Music, Task menu "Text-to-music", Model menu, optional "Input assets" (Add), Prompt box "in US English", Run; "Generated audio clips are available for preview and downloadable as **WAV** files." The presence of an "Input assets" control in the console that has no documented API equivalent for Lyria 3 is an asymmetry worth probing.

## B3 — Stability Stable Audio 2.5 — the best-documented *continuous* controls

**Locators:** Stability announcement `[FULL]`; Stability KB "Tips for using the Stable Audio 2.5 Audio-to-Audio API" `[FULL]`; fal's hosted schema `[via search-result page text]`.

- **Endpoint (Stability's own KB):** `POST /v2beta/audio/stable-audio-2/audio-to-audio`, "an input audio file, a text prompt, and optional generation parameters such as `strength`".
- **`strength`, with the vendor's own recommended values `[FULL]`:** "controls how much the output diverges from the original input audio. A good starting point is **`strength: 0.8`**. Increase slightly (e.g. **0.85–0.9**) if the output is too similar… Decrease slightly (e.g. **0.6–0.75**) if the output deviates too much."
- **Prompt-style guidance, verbatim `[FULL]`** — the only vendor that publishes an explicit *anti-pattern* list: recommended "Distorted metal guitar, driving bassline, punchy drums, aggressive energy"; **avoid** "Make this into a metal track", "Turn this into lo-fi", "Convert to orchestral style". I.e. **descriptive, not instructive** — which is the same law this project already enforces on its film prompts.
- **Full schema on the fal-hosted route `[3P]`:** `prompt` (req) · `audio_url` (req) · `strength` float default **0.8** ("A value of 0 would yield audio that is identical to the input. A value of 1 would be as if you passed in no audio at all") · `num_inference_steps` int default **8** · `total_seconds` int ("If not provided, it will be set to the duration of the input audio") · `guidance_scale` float default **1** ("How strictly the diffusion process adheres to the prompt text") · `seed` int.
- **Inpainting `[M]`:** "users can input their own audio, **select where they want it to start**, and the model will use the context to generate the rest of the track"; a third-party source names `mask_start`/`mask_end` `[3P, single-source]` — flagged, not adopted.
- **Speed and structure `[M]`:** "inference speed of **less than two seconds** on a GPU, for tracks up to **three minutes**"; ARC post-training; "generating multi-part compositions (**intro, development, and outro**)".
- **What it is not:** nothing in Stability's own material documents a lyrics input or sung vocals. Treat as instrumental/sound-design.

---

# A1 Suno — the complete feature enumeration from its own changelog, dated

Every entry below is `CHANGELOG-DATED` from `https://www.suno.com/release-notes`, read in full 2026-08-13, archive at `docs/research/_sources/2026-08-13-suno-release-notes-changelog.txt`. This is the "dark" surface the brief asked for: the release notes reveal controls no marketing page lists.

| Date | Feature | The capability, in Suno's own words (condensed) |
|---|---|---|
| 2026-08-07 | Updates to Voices | "We brought **Voices** to both iOS and Android. **Record your voice once and use it on any song.** Now available to try on free plans" |
| 2026-07-31 | Cover Art Improvements | image→image with a text prompt; "produce either a new image **or a video**" |
| **2026-07-20** | **Duration Slider on Web** | "Drag the new **Duration slider** in the Create form to pick your song length. Available on Web using **V5.5**" |
| 2026-07-15 | iMessage Keyboard | create and send songs inside iMessage; recipients can reply with their own song |
| **2026-07-09** | Lyrics improvements (Web) | **Lyricist** ("Add examples of your lyrics to save as a 'lyricist'"), **natural-language editing** ("make this line funnier"), **Variations and References** (highlight a word for rhymes), full-screen editor, **Song structure labels**, autosave |
| 2026-07-07 | Soccer anthem | 4 questions → a team song (mobile) |
| **2026-06-11** | **Stem Separation improvements** | "three ways": **Advanced Split** — "Choose exactly what to extract from a list of **nearly 100 instruments**, from drum kit to didgeridoo. **For Premier subscribers only**"; **Split from Mix** — "Pull any instrument or voice from the mix and get **two stems**"; **Auto Split** — "**12 stem categories**" |
| 2026-06-04 | iOS share-ins | share lyrics from Notes (auto-transcribed into the lyrics form); share audio from Voice Memos (auto-attached) |
| **2026-05-14** | Mobile improvements | **Vocal Gender** (male/female) "just like on web"; **Memory** (remembers last prompt); **Lyrics Model Selector** ("choose between our lyrics models"); Pin Favs |
| 2026-05-13 | CarPlay / Android Auto | dashboard streaming, library browse |
| **2026-03-26** | **v5.5 + Voices + Custom Models + My Taste** | "**Custom Models** Upload **at least 6 tracks** from your catalog to train a personalized version of v5.5 that knows your sound"; "**Voices** Record or upload your own audio and Suno will let you sing on your creations"; "**My Taste** Suno learns your go-to genres, moods, and references over time, then applies them whenever you use the **Magic Wand**" |
| **2026-02-16** | **Studio 1.2** | "**Remove FX, Warp Markers, Time Signature Support and Alternates**" |
| **2026-01-27** | **Sounds** | one-shot samples and loops from scratch; for loops "**select your key and tempo (bpm)**"; Pro/Premier only |
| **2026-01-20** | **Mashup + Sample** | Mashup "combine any two songs"; Sample "select a section of sound as the jumping off point… a snippet from a Suno song, a melody in your voice memos or something you heard"; reached by right-click → Remix/Edit |
| 2025-10-21 | v4.5-all | free model for everyone |
| **2025-09-25** | **Suno Studio** | "the first-ever generative audio workstation": upload samples / pull from library / break into stems; "Create infinite stem variations"; "multitrack timeline… Control **BPM, volume, pitch**"; "Export everything → Send stems out as **audio or MIDI**" |
| 2025-09-23 | v5 | "More creative control over every element"; "**remaster** your old tracks with v5 and **control the level of variation** from the original song" |
| 2025-09-22 | Hooks | short-form music videos paired to a song; free, no credits |
| 2025-08-29 | Listen & Rank | rate others' clips to earn credits — an RLHF data loop **and** a growth loop |
| **2025-06-03** | **"A whole new level of creative control"** | **Song Editor** ("reorder, rewrite, and remake your track section by section, directly from the waveform"); **Stem Extraction** ("up to 12 clean stems"); **Extended Uploads** (full songs up to 8 min); **Creative Sliders** ("fine-tune how **weird, structured, or reference-driven** your generations get"). "Available now on **Pro & Premier**" |
| 2025-05-21 | Remix across Suno | Cover / Extend / Reuse Prompt on **other people's** tracks; "See every remix made from a track, trace originals, and **control if your songs can be remixed**" |
| 2025-05-01 | v4.5 | genre accuracy, richer vocals, "**Prompt enhancement helper** — Simple genre tags can expand into detailed descriptions"; "Upgraded cover + personas" |
| 2025-01-14 | Workspaces | organise/curate; remixes auto-saved to the original's workspace; shift-multi-select |
| 2024-11-19 | v4 | **Remaster**, **Lyrics by ReMi** (a named lyrics model), Cover Art, Covers, Personas |
| **2024-10-31** | **Personas** | "save the essence of a song — **vocals, style, vibe** — and reimagine it across your creations"; public/private toggle; 200 free then 10 credits |
| 2024-10-16 | Suno Scenes | photos/videos → soundtrack (iPhone) |
| **2024-10-10** | **Replace Section** | "Select the song portion you wish to recreate (**must be 10-30 seconds long**). Lyrics (if present) will automatically be populated"; try typing `[drum break]`; **two versions generated**, you pick one |
| 2024-09-24 | Crop Songs | waveform selectors; desktop-only at launch; "Edit Displayed Lyrics" |
| **2024-09-19** | **Exclude Styles** | Pro/Premier; "excluding specific instruments, specific styles, or even specific **vocal-styles**"; shown as `-piano`; **Early-Access Beta**. Tip: "prompting specific vocals (eg: female vocals) by including `[female vocals]` in the Lyrics section and excluding 'male vocals' in Exclude Styles" |
| **2024-09-12** | **Covers** | "keep the melody of your songs but adopt them into a different style"; lyrics auto-pulled; **"Try uploading a clip of your singing, humming, or playing an instrument and try covering"**; honest caveat: "Covers will **sometimes return the original song** you're covering" |
| 2024-07-23 | Instrumental and Vocal Stems | two clips: instrumentals and vocals |
| 2024-07-12 | Edit Lyrics on Song Page | **"editing Lyrics will not update the lyrics sung in the song"** |
| 2024-06-28 / 06-12 | Audio Inputs | record or upload; "**between 6 - 60 seconds** in length"; then "choose **extend** from the uploaded clip. Choose a **time stamp** to extend from, provide a genre, and include your own lyrics" |
| 2024-05-30 / 05-24 | v3.5 | "**4-minute** songs… in a single generation"; "**2-minute max song extensions**"; wav download for Pro/Premier |
| **2024-02-22** | **V3 Alpha, and Suno's own admission of its control limits** | "V3 Alpha **struggles to follow certain prompts like key signatures and BPM**, and its songs don't always sound perfectly mixed and mastered… it can also be **prone to hallucination — especially when fed short prompts**" |
| 2024-01-27 | QoL | Trash + restore + permanent delete; **Use Random Style** button |
| 2023-12-22 | Holidays | Continue button; **Continue Part Labels** ("Clips which are continuations… show which part number they are") |

**The Suno help-centre page for the negative control, `DOC-DESCRIBED` `[via search-result page text]`** (`https://help.suno.com/en/articles/3161921`, "How do I exclude elements of a song?"): "Click on **Advanced Options** to open a menu that **starts with Exclude**. Enter any information (instruments, etc) that you do not want in your track." Third-party guides date the last edit of that page to 2025-12-19 `[3P]`.

**The three Creative Sliders — the exact names, and what is and is not verified.** Suno's own changelog names the *concept* ("how weird, structured, or reference-driven"). The slider **names** — **Weirdness**, **Style Influence**, **Audio Influence** — and their placement "below the Lyrics field" in Custom Mode come from two independent third-party guides `[3P]` that cite "Suno, Creative Sliders documentation". **I did not retrieve a first-party Suno page naming the three sliders.** So: the *existence* of three creativity sliders on Pro/Premier is `CHANGELOG-DATED` and solid; their *exact names and ranges* (Loose→Strong for Style Influence) are `[3P]` and flagged.

**Suno's own documented control limits, worth more than its feature list** (aggregated from Suno's V3-Alpha note `[C]` and consistent third-party testing `[3P]`): exact BPM is guidance, not a lock; key signatures are unreliable; mixing jargon ("sidechain compression") is not interpreted; negative instructions in the Style field are unreliable — the Exclude field is the official channel; artist names are unreliable and may be filtered. **Every one of these is a documented failure of a control this project would need to expose properly.**

---

# A2 Udio — functions, and the controls that make it the "most advanced panel" in reputation

**First-party sources read this session:** pricing feature grid `[FULL]` for row names; help-centre articles "Create Music with Your Own Audio" (2025-07-23), "Edit Your Song Music and Lyrics" (2026-01-06), "Sessions: Udio's timeline editing view", "Credits and credit limits" (2025-10-29) `[via search-result page text]`; blog "Two-Minute Model, New Controls, and More" (2024-05-29) fetched `[FULL]`.

**Feature rows from Udio's own pricing comparison table `[FULL]` for names, `[PARTIAL]` for tier mapping:** Create Brand New Songs · Create 32 second songs · Create 130 second songs · **Create songs with Udio's library of Voices** · **Save & reuse your own Voices** · Upload your own audio files · Transform Songs · **Extend songs** · **Remix songs** · **Create with Styles (use a musical reference)** · **Use premium Artist Styles** · **Blend Styles** · **Reduce Styles** · **Edit music and lyrics** · Share & Upload Your Music · Generate cover art · Upload your own cover art · Adjust song access permissions.

**The upload verbs, verbatim from the help centre `[via search-result page text]`:** "**Extend** instructs Udio to create a new song and add on to your upload what it feels would fit either (per your choice) **before or after** your audio. **Inpaint** lets you immediately edit the audio you've uploaded by selecting all or part of the song. **Session** initiates a… session with the waveform-centric editor. **Remix** crafts something similar to what you've uploaded. **Style** creates a song that matches the vibe of what you uploaded." Upload policy, verbatim: "Acapella vocals (**not prohibited, but unfortunately also not likely to work great at the moment**; we're working on supporting this better!)" — a rare first-party admission of a capability boundary.

**The advanced controls, from Udio's own blog of 2024-05-29 `[FULL]` — this is the authoritative first-party list and it names four:**
1. **Random seed** — "you can now set the random seed to make clips reproducible (**in manual mode**). Using the same seed while varying the prompt or lyrics can sometimes help maintain certain features of a clip, without prompting for these features explicitly."
2. **Prompt strength / lyrics strength** — "**Higher prompt-strength improves adherence, but may lead to less natural sounding music. Lower lyrics-strength can lead to more natural vocals, but sometimes lyrics can be ignored.**" (This single sentence is the most valuable engineering statement I found from any vendor: it states the adherence↔naturalness trade-off as a product fact.)
3. **Clip start-time** — "0% corresponds to the beginning, 50% to the middle, and **90% to a clip from the end** of the song… especially useful in combination with the extension feature."
4. **Generation-quality slider** — "lets you trade **quality for speed-of-generation**, and vice versa."
Also in the same post: two-minute model launched "at a **discounted credit-rate** to pro-subscribers only"; "more fine-grained messaging for **generation errors**… what is triggering a **moderation** error."

**Third-party-only Udio controls, flagged as such:** **Context Length** (how much prior audio conditions the next section), **Manual Mode** as the switch that disables Udio's automatic prompt enhancement, and **Style Reduction** as a named Advanced Controls item `[3P]`. Two independent third-party guides describe Manual Mode identically ("Udio is programmed to auto-enhance your prompt… To disable auto-enhancement, enable 'Manual Mode'") and one adds the practitioner numbers (Prompt Strength 100%, Lyric Strength 0–60%) `[3P]`. **Not first-party. Not adopted as capability.**

**Sessions, from the help centre `[via search-result page text]`:** "The Sessions interface is available to **all paid subscribers**… the **Styles feature within Sessions** is offered as an experimental **Early Access feature exclusively for Pro subscribers**… all extensions and replacements made within Sessions use credits in exactly the same way as outside."

**The function that no longer exists:** export. Downloads of audio, video and stems are disabled (2026-02-17, first-party). **A capability matrix that ignored this would be a lie: Udio's advanced controls are real and unreachable as deliverable output.**

---

# A3 Flow Music, A5 Mureka product, A6 MiniMax product, A7 Boomy, B6–B10 — function notes

| Entity | Functions established, with class |
|---|---|
| **A3 Google Flow Music** | Pricing-page feature rows `[FULL]`: **Lyria Models**, **Producer** (the conversational agent), **Projects**, **Downloads (mp3, wav, m4a)**, **Stem downloads**, **Publishing**, **Image and Video generation**, **Progress**, Member access. `[M]`/`[3P]`: a Gemini-powered "Producer" chat for edits ("make the bass punchier"), Lyria 3/3.5 backend, Veo-based music videos, and a "**Vibe-code**" feature for building custom audio plugins/games/DAW environments inside the platform. **Notable structural fact:** the natural-language agent *replaces* the slider panel — there is no evidence of numeric sliders. Also `[3P]`: "All outputs carry **SynthID** watermarks." |
| **A5 Mureka (product)** | `[3P]`: reference-track style matching, **lyrics-first** composition, stem separation, 10-language support, DAW/Ableton integration, vocal **timbre cloning** across tracks. First-party product-page enumeration NOT OBSERVED |
| **A6 MiniMax (product)** | Consumer surface not examined; the API is the surface of record here (see B5) |
| **A7 Boomy** | `[3P]` only: generation + distribution with commercial licence at $2.99/mo. **NOT OBSERVED first-party.** Explicit gap |
| **B6 Soundraw** | `[via search-result page text]`: "Let users generate fully licensed **tracks, stems, and custom soundtracks** programmatically"; generation by **Genre, Mood, Theme**; "trained by **only licensed in-house material**"; API tiers by songs/month |
| **B7 Loudly** | `[via search-result page text]`: **VEGA 1** and **MANTA 1** named models, **AI Remixes**, **Stem Splitter** (billed in audio minutes), stem packs, sample packs, **30-minute maximum song length**, mp3+wav, "Fast generation queue", Text-to-music + Music Generator + Music Catalog + **Sub-license**, Loudly Distribution to 50+ stores |
| **B8 Mubert** | `[via search-result page text]`: "Generate music in **200+ moods and themes**. Integrate Mubert API into your apps, **AI agents**, games and **live streams**" — the only vendor explicitly naming AI agents and live streams as targets |
| **B9 Beatoven.ai** | `[3P]` only; minutes-of-download billing. First-party functions NOT OBSERVED. Explicit gap |
| **B10 AIVA** | `[3P]` only, but with one capability that is genuinely unique in the set: **exports editable MIDI and sheet music** — "something the big three do not do" — targeting composers and screen scoring. First-party NOT OBSERVED |
| **D1 Tencent** | LeVo/SongGeneration published as open source (`github.com/tencent-ailab/songgeneration`), benchmarked in C1 and C2's tables; **no commercial product surface examined**. NOT APPLICABLE as a product |
| **D2 ByteDance / D3 Alibaba** | NOT FOUND IN THE SEARCHED SCOPE. Explicit blind spot: no CN-language query was run |
| **E1–E6 gateways** | Re-expose upstream vendors' parameters; fal's Stable Audio schema and WaveSpeed's Mureka schema were the most complete republications I found. E6's own metadata concedes it is unsanctioned |

---

# C1 / C2 — the open-weight capability set, with the measured numbers (PAPER-MEASURED)

These are the only sources in this document that contain **measured comparisons against the commercial leaders**, which is why they carry the quality half of the parity question.

## C1 ACE-Step v1.5 — arXiv **2602.00744**, ACE Studio + StepFun, read `[FULL]` (archived)

**(1) Authors' framing.** "a significant disparity remains between closed-source capabilities and open-source alternatives"; v1.0 "operated primarily as a proof-of-concept" with fidelity "bottlenecked by mel-spectrogram representations".

**(2) Method.** Hybrid Reasoning-Diffusion: a **Qwen-based LM as "Composer Agent"** emitting Chain-of-Thought metadata — **BPM, key, duration, structure — in YAML** — to condition a **~2B-parameter DiT**. **1D waveform VAE**: 48 kHz stereo → 64-dim latent at 25 Hz = **1920× compression**, Muon optimiser, 600k adversarial steps on **120 A100s**, KL dropped and adversarial weight 0.1→0.5 in the last 100k steps. Hybrid attention: odd layers sliding-window, even layers global GQA. **FSQ tokeniser** compresses 25 Hz latents to **5 Hz discrete codes** (codebook ≈64k). Masked Generative Framework yields **six modalities from one model**: text-to-music, **cover generation**, **repainting**, **track extraction**, **layering**, **completion**. Four LM interaction modes: **Planner, Listener, Co-Pilot, Refiner**. Adversarial Dynamic-Shift Distillation (Decoupled DMD2 + GAN, ConvNeXt discriminator, shift ∈ {1,2,3}) cuts 50 steps → **8 steps** without CFG. Intrinsic RL: **DiffusionNFT** on the DiT with an **Attention Alignment Score** (coverage + monotonicity + path confidence via DTW) and **GRPO** on the LM with a **PMI** reward weighted **50% style / 30% lyrics / 20% metadata**.

**(3) Real numbers from the paper's own tables.** Data: 27M-sample corpus, 5M Gemini-2.5-Pro-annotated golden set, 4M contrastive pairs, 2,000+ styles, **50+ languages**, 50% stochastic romanisation for non-Roman scripts, 30-second timbre context windows. Speed: **<2 s per full song on A100**, **<10 s on RTX 3090**, **240-second track in ~1 s on A100**, **200× speedup**, **<4 GB VRAM**. AAS "achieves **>95% correlation with human judgments** for lyric-audio synchronization".

Table 1 (AudioBox / SongEval / alignment), the rows that matter for parity:

| Model | AudioBox CU | AudioBox PQ | SongEval Coh. | SongEval Mus. | **Style Align** | **Lyric Align** |
|---|---|---|---|---|---|---|
| Suno-v5 | 7.87 | 8.29 | 4.72 | 4.62 | **46.8** | **34.2** |
| Suno-v4.5 | 7.85 | 8.25 | 4.64 | 4.51 | 40.5 | 32.7 |
| MinMax-2.0 | 7.95 | **8.38** | 4.61 | 4.51 | 43.1 | 29.5 |
| Mureka-V7.6 | 7.71 | 8.13 | 4.43 | 4.29 | 36.2 | 22.4 |
| Udio-v1.5 | 7.65 | 8.03 | 4.15 | 3.96 | 34.9 | 24.8 |
| **ACE-Step 1.5** | **8.09** | 8.35 | **4.72** | **4.67** | 39.1 | 26.3 |
| DiffRhythm 2 | 7.61 | 7.99 | 3.99 | 3.79 | 32.1 | 3.8 |
| HeartMuLa | 7.89 | 8.25 | 4.68 | 4.55 | 31.7 | 28.6 |
| LeVo | 7.78 | 8.31 | 3.55 | 3.35 | 29.4 | −1.2 |
| ACE-Step 1.0 | 7.52 | 7.76 | 3.99 | 3.73 | 28.5 | 0.9 |
| Yue | 7.29 | 7.39 | 3.01 | 2.80 | 26.8 | −4.6 |

Subjective: "ACE-Step 1.5's subjective quality **ranks between Suno-v4.5 and Suno-v5**" on Music Arena Bradley-Terry.

**(4) Authors' stated limitations.** "current capabilities remain bounded by the parameter constraints necessary for consumer-grade accessibility"; future work is "**refine precise lyric alignment**", acoustic richness, more languages, and "**agentic audio editing workflows**". Note also that Style/Lyric Align are the authors' **own proprietary reward models** — self-scored metrics, which is a validity threat the paper does not flag and I do.

**(5) Application here.** Two things transfer regardless of whether we ever run this model. First, the **LM-as-planner** pattern: a language model emitting BPM/key/duration/structure as YAML *before* audio synthesis is exactly the missing structural layer between our lyrics and our audio surfaces. Second, and more important for this project's measurement law: **AAS is a published, control-validated instrument for lyric-audio alignment** (coverage, monotonicity, path confidence via DTW, >95% human correlation) — a gate we could implement rather than judging sung intelligibility by ear.

## C2 DiffRhythm 2 — arXiv **2510.22950**, Xiaomi Research + ASLP-lab, read `[FULL]` (archived)

**(1) Framing.** Non-autoregressive frameworks "often struggle with the alignment between lyrics and vocal"; DiffRhythm 1 solved it "by conditioning on sentence-level timestamps" which "significantly reduces creativity and diversity"; ACE-Step's REPA/mHuBERT constraints "significantly reduced musicality, creating a **delicate trade-off between lyric alignment and generation quality**".

**(2) Method.** **Block flow matching**: latents split into fixed-length blocks, each generated non-autoregressively by flow matching while **autoregressive dependencies are kept between blocks** — "enables faithful lyric alignment **without relying on external labels and constraints**". Plus stochastic block REPA loss, grouped pairwise multi-preference optimisation (instead of model merging), and a high-compression music VAE.

**(3) Numbers.** Up to **210-second** songs. Table 1 (objective; **PER = phoneme error rate from Qwen3 ASR transcription — lower is better** — and Mulan-T/A style similarity):

| Model | **PER ↓** | Mulan-T ↑ | Mulan-A ↑ | CE | CU | PC | PQ | CO | MU |
|---|---|---|---|---|---|---|---|---|---|
| SUNO V4.5 | 0.28 | 0.38 | — | 7.78 | 7.85 | 6.28 | **8.44** | **4.27** | 4.01 |
| Mureka-O1 | **0.09** | 0.37 | — | 7.65 | 7.81 | 6.31 | 8.35 | 4.14 | **4.06** |
| DiffRhythm 2 | **0.13** | **0.40** | 0.75 | 7.48 | 7.59 | 6.12 | 7.91 | 4.09 | 3.93 |
| DiffRhythm+ | 0.15 | 0.25 | 0.69 | 7.44 | 7.51 | 6.22 | 7.85 | 3.63 | 3.39 |
| LeVo | 0.19 | 0.35 | **0.81** | 7.51 | 7.78 | 5.68 | 8.12 | 3.74 | 3.56 |
| ACE-Step | 0.23 | 0.28 | — | 7.26 | 7.51 | 6.25 | 7.79 | 3.77 | 3.46 |

Table 2 (subjective MOS, 10 listeners with professional music backgrounds): SUNO V4.5 OVP **3.92 ± 0.10**, Mureka-O1 3.87 ± 0.11, DiffRhythm 2 (open best) below both. Table 3 (block size ↔ quality/speed): PER 0.11 → 0.13 → 0.17 → 0.23 as block size goes 5 → 10 → 20 → 100, while **RTF drops 0.455 → 0.213 → 0.154** then worsens to 0.176. Table 6 (RTX 4090): DiffRhythm+ 18.3 s / RTF 0.153; ACE-Step 15.2 s / RTF 0.127. Table 5 (VAE reconstruction): Stable Audio 2 VAE 21.5 Hz / 44.1 kHz / PESQ 1.981 / STOI 0.634 / PER 0.148 vs ACE-Step DCAE 10 Hz / PESQ 2.176 / STOI 0.647 / PER 0.117.

**(4) Authors' stated limitations.** "in vocal quality, since our system **neither leverages semantic constraints nor separately models the vocal track**, it falls slightly behind ACE-Step and LeVo. Overall, though, **commercial models still maintain a clear advantage over open-source systems**." Also: a lower frame rate makes "perfect fidelity" hard.

**(5) Application here.** **PER via ASR transcription is precisely the instrument this project already built and used** — our Lyria measurement transcribed the delivered audio through `/create-stt-vertex` and counted 0 of 8 words. DiffRhythm 2 validates that method as the field's own objective metric and supplies the reference values to beat: **Suno V4.5 = 0.28, Mureka-O1 = 0.09, DiffRhythm 2 = 0.13.** Our 8/8 miss corresponds to PER ≈ 1.0. That is the numeric gap, and it is now expressible in the field's own units.

**Cross-verification of "commercial still leads on musicality, open source now leads on lyric intelligibility":** (1) ACE-Step 1.5 Table 1 — Suno-v5 Lyric Align 34.2 > ACE-Step 26.3 `[FULL]`; (2) DiffRhythm 2 Table 1 — DiffRhythm 2 PER 0.13 **better** than Suno V4.5's 0.28, while Suno wins PQ/CO `[FULL]`; (3) DiffRhythm 2 Table 2 subjective — commercial models above all open models `[FULL]`. Three independent primaries (two labs), and note they **disagree in direction on lyric accuracy** depending on the metric — contradiction preserved below.

---

# The controls NO vendor exposes by API — stated with the exact scope of each absence

Per the brief's explicit instruction, each of these is **NOT FOUND IN THE SEARCHED SCOPE**, never "does not exist". Queries are listed at the end of this document.

| Control | Where it exists | Where it does NOT exist as an API parameter, in the surfaces I opened | Consequence for a BUILD |
|---|---|---|---|
| **Weirdness / creativity slider** | Suno UI only (Pro/Premier, changelog-dated 2025-06-03) | Not in the ElevenLabs compose schema, the MiniMax OpenAPI spec, the Lyria request bodies, or the Stability/fal schema | Nobody sells stochastic-diversity control programmatically. **An open axis to win.** |
| **Style-influence as a number** | Suno UI slider; Udio prompt-strength `[3P]` | ElevenLabs offers 3-level `context_adherence` and 4-level `condition_strength` **enums**; Stability offers `guidance_scale` (prompt adherence, not style-reference weight); Lyria and MiniMax offer nothing | Continuous, separable *style-vs-reference-vs-lyric* weighting is unoccupied. |
| **Persona / singer identity across songs** | Suno Personas + Voices + Custom Models (UI); Udio "Save & reuse your own Voices" (UI); Mureka `vocal_id` (**the only API handle found**) | Not in ElevenLabs Music (its finetunes are *style* models, `finetune_id`), not in Lyria, not in MiniMax, not in Stability | **This is the single biggest API-surface gap in the category**, and this project has already measured that it can select a named voice deterministically on the Vertex TTS surface. |
| **Hard key / BPM / time-signature lock** | Suno: bpm+key for *loops* only; time signature in Studio only | Everywhere else it is a **string inside a style array** (`"120 BPM"`, `"C major"`). Suno itself admits key/BPM adherence is unreliable | Nobody exposes a musical constraint that is actually enforced. A verifiable BPM/key gate would be a first. |
| **Lyric timing you specify** | — | ElevenLabs *returns* word-level timestamps and accepts per-chunk `duration_ms`; MiniMax *returns* ASR timestamps from cover-preprocess. **No vendor accepts target timestamps per word or line as input** | Karaoke-grade or film-sync-grade timing control is unoccupied. Directly relevant to the film line's dialogue-cue needs. |
| **Stems as an output of the generation call** | Suno (separate UI action, ≤12 or ~100 instruments), Loudly (Stem Splitter), Flow Music (stem downloads) | **No API in the set returns stems from the generation request.** ACE-Step documents track extraction as a *model* capability | Multi-stem delivery in one API call is unoccupied. |
| **MIDI / notation output** | AIVA `[3P]`; Suno Studio exports MIDI (UI, Premier) | No API in the set | Unoccupied. |
| **Numeric vocal gender/register** | Suno UI toggle (male/female) | Everywhere else it is prose in a style string | Unoccupied. |
| **A published quality gate on the output** | — | No vendor publishes a per-generation intelligibility/alignment score with the audio | The papers give the instruments (PER, AAS) that no vendor exposes. **This project's measurement law makes this a natural differentiator.** |

---

# Parity ledger against this project's current measured state

Measured facts about our own system, taken from the approved scope plan read this session (not from memory): 7 music workers, 9 voice workers, 6 SFX workers, `stt_vertex`, `audio_live_gemini`; Lyria returned **0 of 8** dictated Turkish words with an instrumental negative control passing; `prebuiltVoiceConfig.voiceName` genuinely selects voice (F0 noise floor 6.72 Hz, 4 of 6 pairs separated).

| Capability the category treats as table stakes | Our state | Gap class |
|---|---|---|
| Intelligible sung lyrics from dictated text | **ABSENT** (PER ≈ 1.0 equivalent on the measured arm) | **The core gap** |
| Section/structure tags driving the arrangement | ABSENT on our music surface | Core |
| Per-section duration control | ABSENT | Core |
| Negative style prompt | **PRESENT** — `negative_prompt` on `lyria-002` | at parity |
| Seed | **PRESENT** — `seed` on `lyria-002` (mutually exclusive with `sample_count`) | at parity, with the documented exclusion |
| n-draws per request | **PRESENT** — `sample_count` | at parity |
| Instrumental bed | **PRESENT** and control-proven | at parity |
| Voice identity selection | **PRESENT and measured** on Vertex TTS — better evidence than any competitor publishes | **ahead on evidence class** |
| Style reference audio | ABSENT | gap |
| Melody/humming seed | ABSENT | gap (only Mureka has an API for it) |
| Inpainting / replace-section | ABSENT | gap |
| Extend | ABSENT | gap |
| Cover from reference | ABSENT | gap |
| Stems | ABSENT | gap |
| Word-level timestamps | **ADJACENT** — we own `stt_vertex`, which is how the 0/8 was measured | **latent advantage** |
| Duration up to 10 min | ABSENT (32.8 s clips) | gap |
| Output format matrix | PARTIAL (WAV base64) | gap |
| C2PA signing flag | ABSENT | gap (only ElevenLabs exposes it) |
| Published quality gate | **This project's measurement law already demands one** — no vendor has it | **potential differentiator** |

---

# Contradictions preserved

| # | Subject | A | B | Status |
|---|---|---|---|---|
| 1 | Does open source beat Suno on lyric accuracy? | ACE-Step 1.5 Table 1: Suno-v5 Lyric Align 34.2 > ACE-Step 26.3 | DiffRhythm 2 Table 1: DiffRhythm 2 PER 0.13 **better** than Suno V4.5 0.28 | **UNRESOLVED — different metrics** (a proprietary reward model vs ASR phoneme error rate) and different Suno versions. Both reported; neither averaged |
| 2 | Suno's Creative Slider names | Changelog names the concept only | Two third-party guides name Weirdness / Style Influence / Audio Influence and cite "Suno, Creative Sliders documentation" | Existence `[C]`; names `[3P]`, flagged |
| 3 | Udio Style Reduction | Pricing grid row "Reduce Styles" `[FULL]` | Third-party calls it "Style Reduction" in Advanced Controls | Same feature, name variant; grid row adopted |
| 4 | Lyria and dictated lyrics | Google docs show a `LYRICS` **output** for Lyria 3 Pro | Our own measurement: 0/8 dictated words on `lyria-002`; and Lyria 3's documented **request** has no lyrics field | **NOT a contradiction — an untested question.** Requires a controlled probe on `lyria-3-pro-preview` |
| 5 | Mureka "first and only official API platform" | Mureka's own docs claim it | ElevenLabs, Google, Stability, MiniMax, Soundraw, Loudly, Mubert all publish music APIs | **Vendor claim contradicted by seven observed APIs.** Recorded as marketing |
| 6 | ElevenLabs stem separation | Not in the compose API reference I read `[FULL]` | Third-party reports stems + inpainting API added March 2026 | UNRESOLVED; inpainting **is** in the schema (`source_from`, `store_for_inpainting`), stems are not |

---

# Query log

Same 17 queries as the pricing document (reproduced there in full), of which these bore on functions: #1 broad scoping; #3 Suno advanced options/exclude/weirdness/persona; #6 Udio credits + advanced controls + inpainting + stems; #7 ElevenLabs compose/composition-plan; #9 Mureka song/generate parameters; #10 Lyria API/model card; #12 Stable Audio 2.5 audio-to-audio/inpaint/steps/strength; #13 Riffusion/Fuzz sliders; #15 MiniMax music_1.5 parameters; #16 ACE-Step/YuE/DiffRhythm papers.
Direct fetches bearing on functions: ElevenLabs compose.mdx + composition-plans.mdx · MiniMax OpenAPI spec · Mureka post-v1-song-generate · Google generate-music · Stability KB audio-to-audio + announcement · Suno pricing + release-notes (995 lines) · Udio pricing + two-minute-model blog + two help articles · Flow Music pricing.
**Failed fetch:** `platform.mureka.ai/docs/quickstart.html` → 404 twice; re-searched rather than guessing variants (R4.3).

# Known gaps and blind spots in THIS document

1. **Nothing here is GENERATION_PROVEN.** No control was exercised. Every row is schema/doc/changelog evidence, which this project's own law says is never capability.
2. **Suno's and Udio's in-product panels were never seen** — both require login. The UI document states this too.
3. **Mureka's own parameter table** was not readable (client-rendered); its contract is `[3P]` from three agreeing resellers.
4. **ElevenLabs' inpainting guide and prompting best-practices pages** were referenced by the docs I read but not opened.
5. **Stability's `platform.stability.ai` API reference** was never opened; the text-to-audio and inpainting parameter names are incomplete.
6. **C3 YuE, C4 LeVo, C5 HeartMuLa, C6 MusicGen, C7 Stable Audio Open papers** were not opened — `[ABS]`, present only via C1/C2's tables.
7. **Open-weight licences** were not examined at all.
8. **No CN/JP/KR-language search was run**, so D2/D3 and regional products are a genuine blind spot despite the brief authorising those languages.
9. **Boomy, Beatoven.ai, AIVA** have no first-party functional evidence here.

# Source counts for this document

First-party/official surfaces used for functional evidence: **25** (as enumerated in the pricing document's count, all of which also carry functional content). Academic primaries read `[FULL]` with the complete five-part record: **2** (arXiv 2602.00744, arXiv 2510.22950). Papers at `[ABS]` only, which therefore carry **no** load-bearing claim: **7** — arXiv 2506.00045 (ACE-Step v1.0; corrected after read-back, previously mislabelled `[FULL]` here), YuE 2503.08638, LeVo 2506.07520, HeartMuLa 2601.10547, SongEval 2505.10793, AudioBox-Aesthetics 2502.05139, SongBloom 2506.07634 — all identified from the reference lists of the two papers read in full.

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT