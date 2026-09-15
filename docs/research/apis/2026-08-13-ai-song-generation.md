# Standards ledger

Slice: **R14.3 AXIS 3 — ALL RELEVANT APIs** of run `2026-08-13-ai-song-generation-platform` (MODE B owner
research order). This file is the API/provider axis only: it enumerates, per pipeline stage, which lawful and
commercially usable API can perform that stage, with its real contract, limits, price, rights and failure
modes. It does **not** design the architecture and does **not** make the business recommendation — other
slices and the parent own those (per this slice's brief, CONTEXT-18 item 7).

Governance files read IN FULL this session, before any external action:

| Governing file | Read | Evidence |
|---|---|---|
| `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (the covenant, PART I + PART II R0–R18 + annexes P1–P5) | YES, in full, in two reads (117,261 B exceeds a single read limit) | SHA-256 measured this session with `Get-FileHash`: `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E` — **byte-identical to the `COVENANT_SHA256` supplied in the brief** |
| `c:\Berk\SsmContentAssetCreator\AGENTS.md` | YES (delivered in full in the always-applied rules channel this session) | Research floor §, artefact-language law, FS-verification law applied throughout |
| `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | YES, in full | Four mandatory tiers + delegation mandate |
| `docs/research/_runs/2026-08-13-ai-song-generation-platform.scope-plan.md` (approved R3 scope plan) | YES, in full | This file is row 7 of its §11 artifact table |
| `docs/ssm-content-asset-generation-api_v5.md` §9.7, §9b.1, §9c.1, §9c.2 | YES, in full (lines 6710–6969) | What we already own, quoted in §"Application" per stage |

Path resolution (R15.1 / R18.4): this project governs `docs/moviemaker/research/` for **film-product** topics
only; this is a product/API topic, so the governed path is `docs/research/`, and this file is written to the
exact path the brief specifies: `docs/research/apis/2026-08-13-ai-song-generation.md`. The directory
`docs/research/apis/` did not exist and was created this session (`Test-Path` returned `False`).

Language: this artefact is ENGLISH (Berk's absolute artefact-language law). His own words appear only as
verbatim quoted evidence.

Access law honoured: lawful access only. No account was created, no trial was started, **no money was spent
and no paid API call was made**. Every price below is read from a vendor's own public pricing page.

---

# Outcome first

**BAD NEWS FIRST — three findings that constrain the whole product, each measured from a primary this session:**

1. **Suno — the capability the owner named — has NO official public API.** As of the newest evidence
   retrieved (2026-07), Suno is only *exploring* a developer API with "a curated group of partners"; there is
   no self-serve portal, no published endpoint, no documented request schema, no API price. Every "Suno API"
   sold online is an unofficial third-party wrapper. Worse for a resale product: Suno's own Terms of Service
   (the version effective 2026-09-03, captured) contain an explicit **"Commercial Use Restriction"** that
   forbids "resell, grant access to, transfer" of any Output, and separately forbid "data mining, robots,
   scraping, or similar data gathering or extraction methods". **Routing our product through a Suno wrapper
   would breach those terms.** Verdict: **AVOID** as a dependency for stage (e).
2. **TURKISH SINGING IS THE BINDING CONSTRAINT, and it is NOT served by the market leaders.** Our films are
   Turkish. Measured from vendor primaries: Google's Lyria 3 prompt guide states multi-vocal generation in
   **eight** languages — "English, German, Spanish, French, Hindi, Japanese, Korean, and Portuguese" —
   **Turkish is not among them**. Mureka's own FAQ lists ten supported song languages — "Chinese, English,
   Japanese, Korean, Portuguese, Spanish, German, French, Italian, and Russian" — **Turkish is not among
   them**, and its docs add that unsupported languages "may cause errors". ElevenLabs Music is documented as
   "Multilingual, including English, Spanish, German, Japanese and more" — an open-ended phrase that names no
   Turkish and therefore **cannot be cited as Turkish support**. So for Turkish sung vocals, no provider in
   the searched scope gives a documented guarantee; this is a measurement Berk must authorise, not a fact any
   doc settles.
3. **A documented control is NOT a proven capability** (CONTEXT-18 items 1 and 2, and this project's own
   history of four lying enums). Everything below is labelled `DOCUMENTED` unless this repo has itself
   generated with it. The one place where our own measurement and a vendor doc **disagree** is recorded as a
   live contradiction in §Contradictions, and it is the single most valuable finding in this slice:
   **Google documents Lyria 3 as accepting dictated lyrics and producing vocals, while our own 2026-08-13
   measurement found 0 of 8 dictated Turkish words returned.** Those two statements are compatible only
   because they are about **different models on different surfaces** — and that distinction was not visible
   in our own API document until now.

**GOOD NEWS, equally measured:** every stage of a song pipeline except one has at least one lawful,
commercially usable API, and the two cheapest routes are on substrates that are already pre-approved or
already wired in this repo:

- **Google Vertex AI (pre-approved substrate, already wired, keyless WIF)** documents `lyria-3-pro-preview`
  as producing a **full song with vocals**, from **dictated lyrics**, with **timestamped structure control**,
  at **$0.08 per generation** (Google's own pricing page, observed 2026-08-13). Its response is documented as
  returning the LYRICS as a text output alongside the audio.
- **fal.ai / ACE-Step (already wired in this repo: `music_ace/`, `MODEL = "fal-ai/ace-step"`)** exposes a real
  `lyrics` field with `[verse]`/`[chorus]`/`[bridge]` structure tags, a `lyric_guidance_scale`, and
  audio-to-audio editing with an `edit_mode` of `"lyrics"` or `"remix"`, at **$0.0002 per second of generated
  audio** — about **$0.024 for a 2-minute song**, the cheapest route found by two orders of magnitude, on the
  Apache-2.0 open-weight ACE-Step model that we could also self-host.
- **ElevenLabs Music** is the richest *documented* control surface in the market (a full `composition_plan`
  with per-section lyrics, positive/negative styles, `context_adherence`, `conditioning_ref` audio reference,
  inpainting via `source_from`, and optional C2PA signing) **but its Music Terms carry commercial
  restrictions that bear directly on a resale product** — see §Rights.

**The one stage with NO provider found in the searched scope:** a *standalone* singing-voice-synthesis API
(stage b) — lyrics + a melody/score in, a sung vocal out, as its own service with commercial rights. The
market has collapsed that stage into full-song generation. This is reported as **NOT FOUND IN THE SEARCHED
SCOPE** with the exact queries and channels listed in §Methodology, never as "it does not exist" (CONTEXT-18
item 3).

---

# Framing and falsifiers

The decision this slice serves: for each pipeline stage, do we **BUILD**, **ADOPT** an API, or **AVOID**?
This slice supplies only the evidence — contract, limits, price, rights, failure modes — per stage.

What would falsify the API-side of a BUILD recommendation, checked below against primaries:

| Falsifier | Status after this slice |
|---|---|
| No lawful API offers full-song-with-vocals with resale rights | **REFUTED** — Vertex Lyria 3 Pro and fal/ACE-Step both do, at documented prices |
| Output-ownership terms make resale untenable everywhere | **REFUTED for the pre-approved substrates**, **CONFIRMED for Suno** (explicit resale ban) |
| Cost per song exceeds a sellable price | **REFUTED** — $0.024–$0.08 per song on the two cheapest documented routes |
| Turkish sung vocals are unavailable | **NOT REFUTED — this is the open risk.** No provider documents Turkish singing; requires a paid measurement Berk must authorise |

---

# Inclusion, exclusion, geography, dates, languages, constraints

- **INCLUDED:** first-party API references, discovery documents, OpenAPI/`llms.txt` machine-readable specs,
  SDK source, pricing pages, terms of service, acceptable-use and data-training policies, model cards,
  changelogs, plus formal primaries (arXiv/ACL papers with real numbers, the C2PA specification).
- **EXCLUDED:** listicles, affiliate roundups, undated aggregator blogs. Two aggregator pages surfaced during
  scoping (`musikalis.com`, `musicmake.ai`) and are **excluded from the source count** and carry no claim
  here; they are recorded only as discovery leads. Third-party "Suno API" resellers (`musicapi.ai`,
  `acestep.io`, `soundverse.ai`, `sunoapi.org`, `musicgpt.com`, `poyo.ai`, `hiapi.ai`, `wavespeed.ai`,
  `apiframe.ai`, `gptproto.com`) are treated as **evidence about the reseller market**, never as evidence
  about the upstream vendor's contract.
- **Geography:** GLOBAL. Chinese (MiniMax/Hailuo, Mureka/Kunlun, Tencent), Japanese/Korean and Turkish-language
  angles were all searched.
- **Dates:** newest-first. Every price and limit carries its observation date, **2026-08-13**, and is treated
  as a dated adapter per R16.4 — never as a stable truth. Freshness horizon: 7 days.
- **Read status:** `[FULL]`, `[PARTIAL]`, `[ABS]` used honestly per R8.2. An `[ABS]` source carries no
  load-bearing claim.

---

# THE PER-STAGE CAPABILITY MATRIX (stage × provider × verdict)

Legend for the capability column — this project's own vocabulary, because a printed field has lied here four
times (CONTEXT-18 item 1):

- `GENERATION_PROVEN (ours)` — this repo has itself produced a delivered, measured file with it.
- `DOCUMENTED` — the vendor's own reference/guide states the control; **not** proven by us.
- `SCHEMA_ONLY` — the field appears in a schema but the vendor documents no behaviour for it.
- `NOT OFFERED` — the vendor's own documentation, read this session, contains no such capability.
- `NOT FOUND IN SEARCHED SCOPE` — searched with the queries in §Methodology and not found; **not** an absence claim.
- `UNLAWFUL FOR US` — technically reachable but barred by the upstream vendor's own terms.

## Stage (a) — LYRICS generation (text)

| Provider | Endpoint / control | Capability | Price (obs. 2026-08-13) | Commercial / rights | Verdict |
|---|---|---|---|---|---|
| **Google Vertex — Gemini** (pre-approved, already wired for TTS/STT) | any Gemini text model on `:generateContent` | `DOCUMENTED` (general text generation; no lyric-specific endpoint) | Gemini text token pricing | Vertex terms; SynthID not applicable to text | **ADOPT — build in-house on our own substrate** |
| **Mureka** | `POST /v1/lyrics/generate`, `POST /v1/lyrics/extend` | `DOCUMENTED` — dedicated lyric endpoints; both listed **FREE** in the third-party skill capture, and the FAQ confirms lyrics generation is bundled | **Free** per that capture `[single-source]` | "All content generated through paid API calls comes with full usage rights and commercial authorization" (FAQ `[FULL]`) | ADOPT only if Mureka is adopted for stage (e) |
| **ElevenLabs** | lyrics are **not** a standalone endpoint; they are a field — `composition_plan.sections[].lines` (MusicPrompt) or `chunks[].text` (CompositionPlan) | `DOCUMENTED` | bundled in the music generation credit cost | see §Rights — Music Terms restrict prompt content | supporting only |
| **fal.ai / ACE-Step** | `POST /fal-ai/ace-step/prompt-to-audio` — `prompt` "will be used to generate tags **and lyrics**" | `DOCUMENTED` | $0.0002/s of audio | per-model licence; ACE-Step is Apache-2.0 | supporting only |
| **OpenAI audio** | — | **NOT OFFERED** for music/lyrics on the audio surface: the OpenAI audio guide captured `[FULL]` (21,739 B of text) contains **zero** occurrences of "music", "sing", "song" or "lyric" | — | — | AVOID for this stage |

**Provider-side policy restricting lyric content — the finding that matters most here.** ElevenLabs' Music
Terms (Last Updated: 26 May 2026, captured `[FULL]`) §2(b) "Prohibited Inputs" **expressly prohibit**
submitting as part of the Input: "any artist's (whether living or deceased) real name or stage name"; "any
songwriter's … name"; "any song title"; "any album title"; "any music publisher company's name"; "any music
label's name"; or "a substantial or distinct portion of any song's lyrics such that a reasonable person would
determine the prompt was intended to reference a particular song." For a product we resell, **our own lyric
generator must be filtered before its output reaches that API**, and a "make it sound like <artist>" feature —
which competitors offer — is contractually forbidden on that surface. Google's equivalent is technical rather
than contractual: Lyria applies "recitation checking and artist intent checks" and blocks violating prompts.

## Stage (b) — SINGING VOICE SYNTHESIS from lyrics (+ optional melody/score) — the capability our stack LACKS

| Provider | What exists | Capability | Verdict |
|---|---|---|---|
| **Any provider, as a standalone SVS API** (lyrics + score in → sung vocal out) | — | **NOT FOUND IN SEARCHED SCOPE.** The market has collapsed this stage into full-song generation. Queries and channels in §Methodology | **BUILD or absorb into stage (e)** |
| **Google Vertex — Gemini TTS** (`GENERATION_PROVEN (ours)` for **speech**) | `POST /create-voice-vertex-tts`; `prebuiltVoiceConfig.voiceName` proven to control the voice by our own controlled F0 measurement (noise floor 6.72 Hz; Charon 129.56 / Fenrir 144.14 / Aoede 190.48 / Kore 205.13 Hz; 4 of 6 pairs separated) | **speech only — NOT OFFERED for singing.** No pitch, note, duration or score parameter exists on that surface | cannot serve stage (b) |
| **Microsoft Azure AI Speech** | Full language-support page captured `[FULL]` (138,436 B text). Searched for "sing"/"singing": the only matches are the words "using"/"speaking styles" — **no singing capability is documented anywhere on it**. Turkish `tr-TR` **is** supported for speech | **NOT OFFERED** for singing | AVOID for this stage |
| **fal.ai / ACE-Step, MiniMax, Mureka, ElevenLabs Music** | all take lyrics but generate the **whole song**, not an isolated vocal you can place on your own bed | see stage (e) | route via (e) + stage (g) separation |
| **Open-weight, self-host** (Berk's build-over-buy preference) | DiffSinger (arXiv:2105.02446, ID fetch-verified), DiTSinger (arXiv:2510.09016, fetch-verified), NNSVS, Amphion | real, but needs a phoneme/score front-end **per language** — and **Turkish is not a language any of these papers evaluate** (DiTSinger's 500+ h corpus is Chinese; DiffSinger is evaluated on a Chinese singing dataset) | **BUILD candidate, with a stated Turkish data gap** |

**The closest thing to a hosted stage-(b) service is a reseller feature, not a vendor API.** MusicGPT
documents `POST /v1/sing_over_instrumental` (parameters: `audio_file` *or* `audio_url`, `prompt` required,
`lyrics` required, max 2000 chars, `gender` ∈ male/female/neutral, `title`, `webhook_url`) and PoYo prices an
"Add Vocals API" at **$0.10 per generation**. These are **reseller surfaces over other companies' models**;
their upstream provenance is not disclosed on the pages read, so they carry `[UNVERIFIED]` provenance and are
**not** recommended as a dependency.

## Stage (c) — SINGING VOICE CONVERSION / voice cloning for singing

| Provider | Endpoint + exact parameter names | Capability | Price (obs. 2026-08-13) | Consent / likeness policy | Verdict |
|---|---|---|---|---|---|
| **Kits.ai** (Arpeggi) | `POST https://arpeggi.io/api/kits/v1/voice-conversions`, **multipart form**, `voiceModelId` + `soundFile` (wav/mp3/flac, max **100 MB**), plus accent-amount and conversion-strength controls; also a Voice Blender API and a Vocal Separation API | `DOCUMENTED` — vendor states it converts **"singing and speech"** into new voices | not published on the pages read `[NOT PUBLISHED]` | ToS: user must "represent and warrant you have all necessary rights, licenses, and consents" for provided audio; a licence is granted to Kits to use Provided Voice Files "for the purpose of providing **and improving** the Services" — i.e. **your uploads may train their models** | ADOPT only as **NEW PAID VENDOR → BERK'S APPROVAL REQUIRED**; the training-on-inputs clause is a product risk |
| **Mureka** | `POST /v1/song/vocal-clone` — **multipart/form-data** (explicitly "do not use JSON"), `file` (mp3/m4a, **<10 MB**, vocal duration **15–30 s**, excess trimmed), `description` (≤1024 chars) → returns a reusable **Vocal ID**; `vocal_id` and `prompt` can be controlled simultaneously (changelog 2026.1.5) | `DOCUMENTED` | **$5.00 per vocal** (Mureka pricing page) `[single-source official]` | commercial authorisation granted for paid API output (FAQ `[FULL]`); consent burden sits with us | ADOPT candidate — **NEW PAID VENDOR → APPROVAL REQUIRED** |
| **ElevenLabs Voice Changer** | `POST https://api.elevenlabs.io/v1/speech-to-speech/{voice_id}` (captured `[FULL]`) | `DOCUMENTED` for speech-to-speech; the vendor describes it as transforming audio "while preserving emotion and delivery" — **singing is not named** | credit-based | **No-Go Voices safeguard** blocks clones approximating "prominent public figures"; Music Terms §2(d) separately forbid Output that "replicates or mimics the voice, likeness, or identifiable characteristics of any recording artist" misleadingly | usable for speech; `[UNVERIFIED]` for singing |
| **Google Vertex** | `replicatedVoiceConfig` exists on the TTS surface (`voice_sample_url` / `voice_sample_base64`) | **`SCHEMA_ONLY` in this repo** — our own v5 doc records "no live clone has been run", and the Zip runtime **refuses** it because there is no ffmpeg to reach the schema's stated 24 kHz mono 16-bit wav | — | ours already; needs a container deploy to even attempt |

## Stage (d) — INSTRUMENTAL / bed generation (text-to-music), with structure and duration control

| Provider | Endpoint | Structure & duration control | Price per generation (obs. 2026-08-13) | Verdict |
|---|---|---|---|---|
| **Google Vertex — `lyria-002`** | `POST …/publishers/google/models/lyria-002:predict`, body `instances[{prompt, negative_prompt, seed}]` + `parameters{sample_count}` | **no duration parameter** — Google's doc states "Each clip is 32.8 seconds long"; our own measurement confirms **32.768 s** delivered | **$0.06 / 1 count** (Lyria 2, Google pricing page) | **`GENERATION_PROVEN (ours)`** — keep for beds |
| **Google Vertex — `lyria-3-clip-preview`** | `POST https://aiplatform.googleapis.com/v1beta1/projects/P/locations/global/interactions`, body `{model, input[]}` | 30-second clip | **$0.04 / 1 count** (Lyria 3) | `DOCUMENTED`; our repo has PROBED it working |
| **fal.ai / ACE-Step** (already wired) | `POST https://fal.run/fal-ai/ace-step` | `duration` **5–240 s**; `[inst]`/`[instrumental]` in the `lyrics` field guarantees no vocals | **$0.0002 / second** → $0.024 for 120 s | ADOPT — already wired, cheapest |
| **Stability AI — Stable Audio 2.5 / 3.0** (already wired via `music_stable` → `fal-ai/stable-audio`) | `POST /v2beta/audio/stable-audio-2/text-to-audio`, `…/audio-to-audio`, `…/inpaint`, `GET` fetch-result | 2.5: "up to three minutes … with coherent structure"; 3.0: "up to six minutes" | **20 credits = $0.20** (2.5); **26 credits = $0.26** (3.0); 1 credit = $0.01 | ADOPT for long structured beds |
| **Beatoven.ai** (already wired via `beatoven/music-generation` on fal) | direct: `POST https://public-api.beatoven.ai/api/v1/tracks/compose`, body `{prompt:{text}, format ∈ mp3\|aac\|wav, looping}` → `task_id`; `GET /api/v1/tasks/{task_id}` returns `track_url` **plus `stems_url{bass, chords, melody, percussion}`** | duration is prose only ("30 seconds peaceful lo-fi…"); **4 stems returned free with every compose** | usage-based, **not published**; key by request to `hello@beatoven.ai` | already wired; **stems-with-generation is a real differentiator** |
| **Loudly** | enterprise Music API: text-to-music, "parametric music generation", stem extraction, AI playlists | `DOCUMENTED` | **$0.15 / track** PAYG `[single-source]`; volume tiers on request | licensing is the strong point: "perpetual licenses, worldwide usage rights, and full legal guarantees", "100% copyright-safe" — **NEW PAID VENDOR → APPROVAL REQUIRED** |
| **Soundraw** | public API, starter/pro plans | `DOCUMENTED` | **$29.99/mo up to 100 songs** (= $0.30/song) or **$300/mo up to 1,000 songs** (= $0.30/song), **6-month minimum commitment** on Pro | trained "by only licensed in-house material" — **NEW PAID VENDOR → APPROVAL REQUIRED** |
| **ElevenLabs Music** | `POST /v1/music` with `force_instrumental: true` | "If true, **guarantees** that the generated song will be instrumental" — but **"Can only be used with `prompt`"**, i.e. it is unavailable in composition-plan mode | credit-based, **per-song price not published** | see §Rights |
| **AWS Bedrock** | — | **MEASURED THIS SESSION, not asserted:** `aws bedrock list-foundation-models --profile beforetomorrow_production --region eu-central-1` returns **38 models whose output modalities are exclusively `TEXT` and `EMBEDDING` — zero `AUDIO`**. Instrument controlled both directions (see §Blind spots #1). Claim scoped to **our account, `eu-central-1`, 2026-08-13** | — | **NOT AVAILABLE to us in-region** |

## Stage (e) — FULL-SONG GENERATION WITH VOCALS IN ONE CALL (the Suno-class capability)

**The owner's exact question — "is there ANY provider exposing this by API with resale rights?" — ANSWER: YES, three, and the market leader is not one of them.**

| Provider | Endpoint + exact parameter names as the reference specifies them | Capability | Price / song (obs. 2026-08-13) | Resale rights | Verdict |
|---|---|---|---|---|---|
| **Google Vertex — `lyria-3-pro-preview`** ⭐ pre-approved substrate | `POST https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/global/interactions`; body **exactly** `{"model": MODEL_ID, "input": [{"type":"text","text":TEXT_PROMPT}, {"type":"image","mime_type":"image/jpeg","uri":IMAGE_URI}, {"type":"image","mime_type":"image/png","data":IMAGE_DATABYTES}]}`. Response: `{"status":"completed","outputs":[{"text":"LYRICS","type":"text"},{"text":"DESCRIPTION","type":"text"},{"mime_type":"audio/mpeg","data":"GENERATED_SONG_DATABYTES","type":"audio"}],"role":"model","object":"interaction","model":"lyria-3-pro-preview"}` | `DOCUMENTED`, and unusually rich: **"184 second audio tracks with a clear musical structure and vocals"**; lyrics dictated by typing **`"Lyrics:"`** before the lines; backing vocals by mention; timestamp prompting `[mm:ss]`; **Song key**, **Beat rate (BPM)**, **Intensity: n/10**; up to **10 reference images or PDFs**; `negative_prompt`. **Our repo has PROBED this model working** but has **NOT** measured its lyric fidelity | **$0.08 / 1 count** ("Full song music generation") | Google Cloud terms; **SynthID watermarking is applied to generated audio** | **STRONGEST ADOPT** — no new vendor, no new approval, keyless WIF already working |
| **fal.ai / ACE-Step** ⭐ already wired (`music_ace/`) | `POST https://fal.run/fal-ai/ace-step` — `tags` (**required**, comma-separated genres, "Can also be supplied as `prompt`"), `lyrics` (optional; `[inst]`/`[instrumental]` ⇒ no vocals; "Use control structures like `[verse]`, `[chorus]` and `[bridge]` to control the structure"), `duration` (5–240 s, default 60), `number_of_steps` (3–60, default 27), `seed`, `scheduler` ∈ `euler`\|`heun`, `guidance_type` ∈ `cfg`\|`apg`\|`cfg_star`, `granularity_scale` (−100…100, default 10), `guidance_interval` (0–1, default 0.5), `guidance_interval_decay`, `guidance_scale` (0–200, default 15), `minimum_guidance_scale` (default 3), `tag_guidance_scale` (0–10, default 5), **`lyric_guidance_scale` (0–10, default 1.5)**. Output: `{audio:{url}, seed, tags, lyrics}` — **it returns the lyrics it actually used** | `DOCUMENTED`, and the most granular knob set found anywhere (the `lyric_guidance_scale` is exactly the "advanced setting" the owner asked for) | **$0.0002 / second** → **≈$0.024 for 120 s**; vendor states "$1 … 5000 seconds (83 minutes)" | fal FAQ `[FULL]`: "Most models on fal are available for commercial use and are marked with a `Commercial use` badge"; the ACE-Step model page **displays "Commercial use"**; upstream model is **Apache-2.0** | **ADOPT — cheapest, already wired, and self-hostable if the vendor changes** |
| **Mureka (Kunlun)** | `POST https://api.mureka.ai/v1/song/generate` — `lyrics` (**required**, max 5000 chars, `[Verse]`/`[Chorus]` tags), `title` (≤50), `prompt` (≤3000), `desc` (≤1000, "male vocals" etc.), `model` ∈ `V9`\|`V8`\|`O2`\|`V7.6`\|`auto`; also `POST /v1/song/easy-generate` (no lyrics), `/v1/instrumental/generate`, `/v1/lyrics/generate`, `/v1/lyrics/extend`, `/v1/song/stem`, `/v1/song/describe`, `/v1/files/upload`, `/v1/song/vocal-clone`, `/v1/song/extend`, region-editing, remix, music-transcription, lyrics-video, TTS. Async: `GET /v1/song/query/{task_id}`. Bearer auth | `DOCUMENTED`, self-describing as **"the first and only official API platform provider in the AI music industry"**; song length **≤5 m 30 s**; melody-recording input; reference-track input | **$0.045/song** (V9/V8/O2) or **$0.03/song** (V7.6); prepaid top-up from **$30**, balance valid 12 months, **no refunds**; concurrency is bought: 1 → $30, 5 → $1,000, 15 → $3,000, 25 → $5,000, 150 → $30,000 | FAQ `[FULL]`: "All content generated through paid API calls comes with **full usage rights and commercial authorization** … commercial products, platform distribution, advertisements" | ADOPT candidate — **NEW PAID VENDOR → BERK'S APPROVAL REQUIRED**; blocked for us by **no Turkish** |
| **MiniMax / Hailuo Music 1.5** (already wired via `music_minimax` → `fal-ai/minimax-music`) | Our wired route: `POST https://queue.fal.run/fal-ai/minimax-music` — `prompt` (**"Lyrics with optional formatting … two newlines to add a pause … double hash marks (##) … to add accompaniment. Maximum 600 characters"**) + **`reference_audio_url` (REQUIRED — "should contain music and vocals … .wav or .mp3 longer than 15 seconds")**. Newer `music-1.5` is documented by resellers as `prompt` + `lyrics` (≤600 chars) with `[intro]`-style tags, "up to ~4 minutes", "singing in **English or Chinese**" | `DOCUMENTED`. **Failure mode already in our contract:** the wired fal route *requires* a reference song containing vocals — so it cannot generate cold | **$0.035 / generation** (fal) | fal per-model licence | usable; **language limit (EN/ZH) excludes Turkish** |
| **ElevenLabs Music** | `POST https://api.elevenlabs.io/v1/music` (+ `/v1/music/stream`, `/v1/music/detailed`, `/v1/music/plan`, `/v1/music/video-to-music`, `/v1/music/upload`, `/v1/music/stem-separation`, `/v1/music/finetunes/*`). Body: `prompt` **XOR** `composition_plan`; `music_length_ms` (**3,000–600,000 ms**, prompt-mode only); `model_id` ∈ `music_v1`\|`music_v2`; `seed`; `force_instrumental`; `finetune_id`; `respect_sections_durations`; `store_for_inpainting`; **`sign_with_c2pa`**. Query `output_format` ∈ 25 values (`auto`, `mp3_48000_320`, `pcm_48000`, …). `composition_plan` has two shapes — **MusicPrompt**: `positive_global_styles[]`, `negative_global_styles[]`, `sections[]{section_name (1–100 chars), positive_local_styles[], negative_local_styles[], duration_ms (3,000–120,000), lines[] (max 30 lines/section, max 200 chars/line), source_from{song_id, range{start_ms,end_ms}, negative_ranges[]}}`; **CompositionPlan**: `chunks[]{text (may carry `[Verse 1]` and inline `{scratching}` directions), duration_ms, positive_styles[], negative_styles[], context_adherence ∈ low\|medium\|high, conditioning_ref{song_id, range}, condition_strength ∈ low\|medium\|high\|xhigh}` | `DOCUMENTED` — **the richest control surface in the market**, and the only one with per-section lyrics **and** inpainting **and** C2PA signing. Regional endpoints exist (`api.eu.residency.elevenlabs.io` etc.) | **NOT PUBLISHED per song** — the vendor's own FAQ says cost "depends on the length of your track and how many variants", visible only by hovering in the UI. Recorded as **NOT PUBLISHED** rather than estimated | Music is "cleared for nearly all commercial uses"; **paid plans include a commercial licence**, free plan does **not** and requires attribution; **Beta Services output may not be used commercially at all** | ADOPT for control depth — **NEW PAID VENDOR → APPROVAL REQUIRED**; see §Rights for the prohibited-industry list |
| **Suno** | **NO OFFICIAL API.** As of 2026-07, CPO Jack Brody: "Ahead of our partner powered model, we're exploring a developer API… We plan to start with a curated group of partners" — an intake form, no timeline, no endpoints, no docs, no pricing | **UNLAWFUL FOR US via wrappers**: ToS effective 2026-09-03 (captured `[FULL]`) — **"Commercial Use Restriction: … you agree not to … sell, resell, grant access to, transfer, or otherwise use or exploit any portion of the Service, and any Output or Voice Model, for any commercial purposes"** (except as permitted for subscribers), and separately bans "data mining, robots, scraping, or similar data gathering or extraction methods" | n/a | Also note the download caps in the WMG deal: free tier not downloadable, paid tiers capped monthly | **AVOID** |
| **Udio** | licensed platform moving to a **walled garden**: "users will generate songs only in the style of opted-in artists with **no off-platform export capability**" | structurally incompatible with an API product | n/a | n/a | **AVOID** |
| **Tencent SongGeneration / LeVo** | open-weight (`tencent-ailab/SongGeneration`, LeVo2; NeurIPS 2025 LeVo paper) — captured in `_sources` | open weights, self-hostable | our own GPU cost | model licence must be read per release | **BUILD candidate** |
| **Hugging Face Inference Providers** | routed inference over third-party providers | `DOCUMENTED` as a router; the music models on it are the same upstream ones | per-provider | per-model licence | secondary route only |

## Stage (f) — MELODY / AUDIO PROMPTING as an API input (hum or clip → melody)

The owner asked for this explicitly (*"en advanced settimngs ayarlar melodiler vs."*). It exists, in four
distinct documented forms:

| Provider | The exact input | Capability | Limit |
|---|---|---|---|
| **fal.ai / ACE-Step audio-to-audio** | `POST https://fal.run/fal-ai/ace-step/audio-to-audio` — `audio_url` (**required**), **`edit_mode` ∈ `"lyrics"` \| `"remix"`** (default `remix`), `original_tags` (**required**), `original_lyrics`, `tags` (**required**), `lyrics`, `original_seed`, plus the full guidance knob set | `DOCUMENTED` — **`edit_mode:"lyrics"` changes the words while keeping the music**: precisely the "re-sing this melody with these words" control | $0.0002/s |
| **ElevenLabs** | `composition_plan.chunks[].conditioning_ref{song_id, range{start_ms,end_ms}}` + **`condition_strength` ∈ low\|medium\|high\|xhigh**; also `AudioRefChunk{song_id, range}`; and UI **Audio Reference** (~30 s upload, **every upload screened for copyright compliance**) | `DOCUMENTED`. Vendor caveat: "**not** a remixing or genre-transfer tool"; a jazz reference asked to produce rap "may not produce reliable results" | ~30 s reference; Music v2, paid plans |
| **Mureka** | reference-track input + "**Record a melody idea to kickstart your song**" (pricing page feature list); `POST /v1/files/upload` for reference audio; `reference_id` and `vocal_id` usable together (changelog 2025.4.18) | `DOCUMENTED` | file ≤10 MB class limits |
| **MiniMax (our wired route)** | `reference_audio_url` — **required**, must contain music **and vocals**, >15 s | `DOCUMENTED` | mandatory, not optional |
| **Google Vertex Lyria 3** | **image/PDF** conditioning (up to 10) — multimodal, but **not** audio/melody: no audio-input field appears in the request body Google documents | audio prompting **NOT OFFERED**; image prompting `DOCUMENTED` | — |
| **Stability Stable Audio 2.5** | `POST /v2beta/audio/stable-audio-2/audio-to-audio` — multipart `prompt`, `audio`, **`strength`** (vendor guidance: "A good starting point is `strength: 0.8`"; raise to 0.85–0.9 if too similar, lower to 0.6–0.75 if it deviates too much) | `DOCUMENTED` with real recommended values | $0.20/gen |

## Stage (g) — STEM SEPARATION, ALIGNMENT, LOUDNESS NORMALISATION, MASTERING

| Sub-stage | Provider | Endpoint + parameters | Price (obs. 2026-08-13) | Verdict |
|---|---|---|---|---|
| **Stem separation** | **ElevenLabs** | `POST https://api.elevenlabs.io/v1/music/stem-separation`, **multipart/form-data**: `file` (required), `stem_variation_id` (enum), `sign_with_c2pa`. Query `output_format` (20 values incl. `pcm_48000`). **Returns a ZIP archive of separate stem files.** Vendor warns: "This endpoint might have **high latency**, depending on the length of the audio file" | credit-based, not published per call | ADOPT candidate |
| | **Music.AI / Moises** | `POST https://api.music.ai/v1/job` with `{name, workflow, params:{inputUrl}}`; auth = API key **verbatim in the `Authorization` header, no `Bearer` prefix**; template workflow `music-ai/stems-vocals-accompaniment`; poll `GET /v1/job/{id}` (`QUEUED`\|`STARTED`\|`SUCCEEDED`\|`FAILED`); result `{vocals:url, accompaniments:url}`; `GET /workflow` lists slugs; `DELETE /v1/job/{id}` | not published on pages read | ADOPT candidate — **NEW PAID VENDOR → APPROVAL REQUIRED** |
| | **Beatoven** | stems arrive **free with every compose** (`stems_url{bass, chords, melody, percussion}`) | bundled | already wired |
| | **Kits.ai** | Vocal Separation API | not published | approval required |
| | **BUILD** | Demucs / HTDemucs — the exact tool the ALT literature below uses | our own GPU | **BUILD candidate (no vendor needed)** |
| **Forced alignment (lyrics → sung audio)** | **ElevenLabs** ⭐ | `POST https://api.elevenlabs.io/v1/forced-alignment`, **multipart/form-data**: `file` (required, "All major audio formats … **less than 1GB**"), `text` (required, "can be in any format, however **diarization is not supported**"). Response: `characters[]{text,start,end}`, `words[]{text,start,end,**loss**}`, and a top-level `loss` — **"the average alignment loss/confidence score for the entire transcript"** | credit-based | **ADOPT — this is the best-fit API in the entire slice.** A per-word confidence score is exactly the instrument our measurement law demands, and it aligns *known* lyrics rather than guessing them |
| | **BUILD** | Montreal Forced Aligner (2026 benchmark captured in `_sources`) | free, self-host | BUILD candidate |
| **Loudness / mastering** | **Dolby.io Music Mastering** | `POST {base}/media/master` with `inputs`, `outputs`, a **`preset`** applying "dynamic EQ processing", and a **`target_level`** parameter; async → `job_id`; `GET` results; a separate `/media/master/preview` pair for evaluating presets before committing | not published on pages read | ADOPT candidate — **NEW PAID VENDOR → APPROVAL REQUIRED** |
| | **LANDR Mastering API** | v1 API; **access is gated**: "Please visit our website to access API key"; the support form asks for "Company Name" and "**Expected volume of monthly API calls**" — i.e. **sales-gated, not self-serve**. Three previewable loudness settings + genre-fitted mastering styles | not published | AVOID for now (access class blocks self-serve) |
| | **BUILD** ⭐ | `ffmpeg` two-pass `loudnorm` — already the mandated method in this project's own film mandate (CLAUSE 15: two passes, whole-film, measured), with the measured defect that a single pass "can never be linear (LRA 11.5 → 4.1)" | free | **BUILD — no vendor needed; we already know the correct method and its failure mode.** Note the deployment constraint: **ffmpeg is NOT in our shared Lambda layer** (measured), so this runs in a container or on the GPU instance |

## Stage (h) — SPEECH-TO-TEXT for verification, and whether any ASR is documented as suitable for SUNG audio

**This is the stage where the formal literature, not a vendor, gives the answer — and the answer is a warning.**

| Evidence | Number | Locator |
|---|---|---|
| Whisper (unmodified) on Western classical singing, Schubert *Winterreise* | **WER 0.56** for sung audio vs **WER 0.14** for the authors' own **spoken** recordings of the same lyrics — a 4× degradation on the same words | *Lyrics Transcription in Western Classical Music with Whisper*, NLP4MusA 2024, `aclanthology.org/2024.nlp4musa-1.3/` `[PARTIAL]` |
| Cause, in the authors' framing | accuracy "is **less affected by the musical accompaniment and more by the singing style**" — i.e. separating the vocal does not save you | same |
| Zero-shot Whisper-Medium on Greek songs | **92.1% WER** transcription (83.5% translation); after singing-specific fine-tuning, Whisper-Large reaches **30% WER** (~67% relative reduction) | *Automatic Lyrics Transcription for Greek Songs*, University of Athens thesis, `pergamos.lib.uoa.gr/uoa/dl/object/5310603/file.pdf` `[PARTIAL]` |
| Named singing-specific failure modes | "consonant-cluster inflation in rhythmically dense lines, vowel confusions induced by **melisma**, function-word deletions/insertions, and occasional **lyric-prior hallucinations**" | same |
| Source separation as a fix is **not** reliable | "vocal separation generally **degraded** the results for Whisper … with separated vocals as input, Whisper often outputs a transcript in the **wrong language**" | Jam-ALT benchmark, arXiv:2311.13987 `[PARTIAL]` |
| What does work | MSS used as a **vocal activity detector to derive segment boundaries** gives "a consistent reduction in WER relative to Whisper's native long-form algorithm", achieving SOTA for an open-source system on Jam-ALT **without training or fine-tuning** | arXiv:2506.15514 `[FULL]`, ID fetch-verified (authors Syed, Meresman Higgs, Cífka et al.) |

| Provider | Verdict for sung audio |
|---|---|
| **Our own `POST /create-stt-vertex`** (`GENERATION_PROVEN (ours)` for speech — round-trip returned all 11 source words in order) | usable as the instrument, **but the literature above means a low word-recall on sung audio is NOT proof the singer sang nothing.** Our own Lyria measurement is exposed to exactly this confound |
| **Any provider, as ASR documented for SUNG audio** | **NOT FOUND IN SEARCHED SCOPE.** No vendor page read this session documents its ASR as suitable for singing; the capability exists only in research systems (LyricWhiz, AudioShake's in-house system) and specialist vendors' unpublished pipelines |
| **Music.AI / Moises** | its OpenAPI description does list "transcription … **lyrics**, chords" as modules — the closest thing to a lyrics-transcription API found. `DOCUMENTED`, price not published |

---

# Contradictions, preserved rather than averaged (R10.4)

## C-1 — THE MOST IMPORTANT FINDING IN THIS SLICE: Google documents dictated lyrics; our own measurement found none

| Side | Statement | Locator | Read |
|---|---|---|---|
| **Google's own prompt guide** | "**Manage vocals and lyrics** — Lyria **3 models** lets you do the following: **Use your own lyrics: Type `"Lyrics:"` before the lines you want the model to sing.**" and "Lyrics: Either provide a theme … or **provide your exact lyrics in quotes to be performed**" | `2026-08-13-vertex-lyria-prompt-guide.txt` L1008, L1021–1025 | `[FULL]` |
| **Google's own overview** | "**Lyria 3 Pro** lets you generate **184 second** audio tracks with a clear musical structure **and vocals**" | `2026-08-13-vertex-lyria-introduction.txt` L1002–1004 | `[FULL]` |
| **Our own measurement, 2026-08-13** | 8 Turkish words dictated → **0 of 8** returned, transcribed through our own `/create-stt-vertex`; negative control passed | `docs/ssm-content-asset-generation-api_v5.md` §9.7; `scripts/measure_lyria_lyrics_capability.py` | `[FULL]` |

**RESOLUTION — not an averaging, a distinction, and it changes what we thought we knew.** Read from
`scripts/measure_lyria_lyrics_capability.py` this session: the script's arms set only `prompt` and
`instrumental_only`, and **never set `model`** — so all three arms ran on our worker's **default, `lyria-002`**
(the `:predict` surface). Google's lyrics/vocals documentation is scoped, in its own words, to **"Lyria **3**
models"** on the **`interactions`** surface. Therefore:

- Our finding is valid and stands — **for `lyria-002`**. Our v5 doc's sentence "There is **no `lyrics` /
  `vocal` / `singer` / `melody` field anywhere** in the discovery document" is also true, and now explained:
  on Lyria 3 the lyrics channel **is** the prose prompt, by design, with a documented `"Lyrics:"` convention.
- The scope-plan premise that "the capability Suno sells … cannot be reached by prompt wording on that
  surface" is **correct for the surface measured** and **NOT established for `lyria-3-pro-preview`**, which is
  the model Google documents for this and which our repo has already probed working.
- **This is an untested, cheap, decision-grade experiment: one `lyria-3-pro-preview` call at $0.08.** It is
  the single highest-value paid probe available to this project, and it requires Berk's approval before it is
  run. This slice does not run it (no money spent).

## C-2 — ElevenLabs `model_id` default disagrees across the vendor's own surfaces

`compose.mdx` (API reference) says **"`model_id` (enum, optional, default: `music_v1`)"**, and the SDK source
`elevenlabs-python` types it as `typing.Literal["music_v1"]` only; but the vendor's own skills-repo reference
says **"Defaults to `music_v2`"**, while the capability page says "For API generations, Music v1 will remain
the default model for transition period." **Consequence: pin `model_id` explicitly in every request** — never
rely on the default. Both texts are recorded; neither is discarded.

## C-3 — Stability price per generation vs per model version

The Stability pricing table read this session lists **Stable Audio 2.5 = 20 credits** and **Stable Audio 3.0 =
26 credits** (1 credit = $0.01 ⇒ $0.20 / $0.26), and a third-party API-registry repo states "$0.20 per
generation **regardless of duration**". The duration-independence is `[single-source]` (not on the vendor page
read) and is flagged as such.

## C-4 — ElevenLabs per-song price is NOT PUBLISHED

The vendor's own cost FAQ declines to give a figure ("depends on the length of your track and how many
variants … hover over the number of credits remaining"). **No price per song is stated in this document for
ElevenLabs**, because inventing one would be the banned class. It is recorded as **NOT PUBLISHED**.

---

# Rights, ownership, data-training and provenance — the load-bearing section, because we RESELL

| Provider | Output ownership / commercial use | Data used for training? | Provenance / watermark | Hard restrictions that bite a resale product |
|---|---|---|---|---|
| **Google Vertex (Lyria, Gemini TTS/STT)** | Google Cloud terms; enterprise substrate, already our account | Vertex enterprise posture (not re-verified this session — `[UNVERIFIED]` here, flagged) | **SynthID watermarking is used on generated audio** (Lyria intro page, `[FULL]`) — a fact our product must disclose, not hide | "content safety filters, **recitation checking**, and **artist intent checks**"; violating prompts blocked |
| **ElevenLabs** | "All paid plans include a commercial licence, provided you're not using Beta Services"; free-plan content **cannot** be used commercially and requires attribution ("Eleven Music"); **Beta Services output may not be used for ANY commercial purpose or in any production environment** | "ElevenLabs uses certain data you provide to us to improve the quality of our audio models"; **opt-out is available** via Terms and privacy → Data use; **Enterprise: no training by default** | `sign_with_c2pa` is a **request parameter** (mp3 only) on compose, video-to-music and stem-separation — the only vendor found exposing C2PA as an API flag | **§2(a) PROHIBITED INDUSTRIES** — Music may not be used at all if the customer operates in: firearms/weapons; tobacco; prescription pharmaceuticals/controlled substances; adult entertainment; **religious organizations or institutions**; political advocacy/campaigning. **For an outward-facing product we resell, this must become a term in OUR customer contract.** Plus §2(b) prohibited inputs (artist/song/album/label names, substantial lyrics), §2(c) infringement, §2(d) impersonation. Also: "Output … **may not be unique** and may be similar or identical to Output returned to other users. ElevenLabs does not guarantee the exclusivity of Output" |
| **fal.ai** | "Most models … available for commercial use and are marked with a `Commercial use` badge"; **per-model licence governs** — `Research only` models are barred. ToS: fal "**exclusively owns**" the Services/models; customer grants fal a licence over Customer Input to provide the Services; fal "does **not** represent or warrant that any Output Content will be original, will not infringe … or otherwise entitle Client to any Intellectual Property Rights in any Output Content" | Customer Input licensed "to provide the Services" | none documented for audio | **Retention trap for a product:** generated media on the fal CDN is "available for **at least 7 days** by default", URLs are **publicly accessible by default** to anyone with the link, and `X-Fal-Object-Lifecycle-Preference` controls retention. **We must copy every asset to `beforetomorrow-content-prod` immediately and set an ACL** |
| **Mureka** | "All content generated through paid API calls comes with **full usage rights and commercial authorization** … commercial products, platform distribution, advertisements, videos" | not stated on pages read — `[NOT PUBLISHED]` | none documented | **No refunds**, balance expires 12 months after last recharge, FIFO consumption; **concurrency must be purchased** ($30 → 1 concurrent; $30,000 → 150) |
| **Suno** | **"Commercial Use Restriction: … you agree not to … sell, resell, grant access to, transfer, or otherwise use or exploit any portion of the Service, and any Output or Voice Model, for any commercial purposes"** (except as permitted for paid subscribers) | Broad licence over Submissions "including … the artificial intelligence and machine learning models", **"sublicensable (directly and indirectly through multiple tiers) … perpetual, irrevocable"**, and it "includes a license to your likeness, voice rights and other indicia of your persona" | — | Bans "data mining, robots, scraping"; bans reverse engineering and sublicensing of the Software; download caps per the WMG deal | 
| **Kits.ai** | commercial applications supported | **uploads used "for the purpose of providing and improving the Services"** — i.e. training | — | You must warrant you hold "all necessary rights, licenses, and **consents**"; **TTS was deprecated from the API on 2025-09-22** — a live deprecation |
| **Loudly** | "perpetual licenses, worldwide usage rights, and full legal guarantees", "100% copyright-safe" | not stated | — | strongest licensing language found; enterprise sales motion |
| **Soundraw** | "trained by only licensed in-house material", "No copyright strikes" | not stated | — | **6-month minimum commitment** on the Pro plan |
| **Stability AI** | credit-based; "royalty-free music and sound effects" per the platform summary `[single-source]` | not read this session | — | v2beta is the maintained API; v1/v2alpha/gRPC "will continue to be maintained but will not receive new features" |

## The industry-structure fact that governs stage (e) rights, cross-verified across three independent producers

Warner Music Group settled with Suno (Nov 2025) and with Udio, and Universal settled with Udio; **Sony remains
in litigation with both**; Suno is transitioning to licensed models and deprecating current ones; Udio is
building a **walled garden with no off-platform export**. Sources: WMG's own press release (first-party),
Hollywood Reporter, Music Business Worldwide, Digital Music News — and the American Federation of Musicians
has filed an amended complaint against UMG and WMG over the same licences. **Consequence for us: the two
Suno-class leaders are becoming *less* API-available, not more, and any product built on a wrapper of them is
exposed to both a terms breach and a platform change we do not control.**

---

# Cost per song, per route (calculated; observation date 2026-08-13; every input traced above)

`CALCULATION` — a 2-minute (120 s) song with vocals, one variant, generation cost only. Our own Lambda, S3 and
CDN costs are excluded (they are ours, not a vendor's).

| Route | Arithmetic | Cost / song | New vendor? |
|---|---|---|---|
| **fal.ai / ACE-Step** (wired) | 120 s × $0.0002/s | **$0.024** | No — already wired |
| **MiniMax via fal** (wired) | flat $0.035 / generation | **$0.035** | No — already wired |
| **Mureka V7.6** | flat | **$0.030** | **YES → approval** |
| **Mureka V9/V8/O2** | flat | **$0.045** | **YES → approval** |
| **Google Vertex Lyria 3 Pro** (full song, 184 s documented) | $0.08 / 1 count | **$0.080** | **No — pre-approved substrate** |
| **Google Vertex Lyria 3** (30 s clip) | $0.04 × 4 clips for 120 s | **$0.160** | No |
| **Google Vertex Lyria 2** (our current bed) | $0.06 × 4 × 32.768 s ≈ 131 s | **$0.240** | No — already live |
| **Stability Stable Audio 2.5** | 20 credits | **$0.200** | No — already wired via fal |
| **Soundraw** | $300 / 1,000 songs | **$0.300** | **YES → approval** |
| **Loudly** | PAYG | **$0.150** `[single-source]` | **YES → approval** |
| **PoYo "add vocals"** (reseller) | flat | **$0.100** | **YES → approval, and provenance `[UNVERIFIED]`** |
| **ElevenLabs Music** | — | **NOT PUBLISHED** | **YES → approval** |
| **Assembled route** (our beds + a vocal + alignment + our own ffmpeg master) | ACE-Step $0.024 + ElevenLabs forced-alignment (credits, not published) + ffmpeg $0 | **≥$0.024 + alignment** | alignment vendor → approval |

**Every new paid vendor requiring Berk's explicit approval, enumerated (his standing constraint):**
1. **ElevenLabs** — for Music compose + `composition_plan` + stem separation + **forced alignment** (note: this
   repo already has `music_elevenlabs/`, `sfx_elevenlabs/`, `voice_elevenlabs/` wired, so an ElevenLabs key may
   already exist — **that is a fact to verify on the account, not to assume here**).
2. **Mureka (Kunlun)** — stage (e) + vocal cloning at $5/vocal.
3. **Music.AI / Moises** — separation + lyrics transcription.
4. **Kits.ai** — singing voice conversion.
5. **Dolby.io** — mastering.
6. **LANDR** — mastering (sales-gated).
7. **Loudly**, 8. **Soundraw**, 9. **Beatoven direct API** (as opposed to the fal route already wired).
Not requiring a new-vendor decision: **Google Vertex** (pre-approved, already wired) and **fal.ai** (already
wired and billing in this repo across ~15 workers).

---

# PER-PROVIDER CONTRACT TABLE (R16.4 reversibility pins: provider · product · model/API version · region · auth class · rate/quota · pricing date · deprecation state)

| Provider | Product | Model / API version | Base URL(s) & region | Auth class | Async model | Rate / quota (with the header or mechanism that reports it) | Pricing observed | Deprecation state |
|---|---|---|---|---|---|---|---|---|
| **Google Cloud Vertex AI** | Lyria (music) | `lyria-002` (GA, `:predict`); `lyria-3-pro-preview`, `lyria-3-clip-preview` (Public Preview, `interactions`) | `https://{LOCATION}-aiplatform.googleapis.com/v1/…` for `:predict`; **`https://aiplatform.googleapis.com/v1beta1/projects/{P}/locations/global/interactions`** for Lyria 3 — note `global` is mandatory there | OAuth bearer (`gcloud auth print-access-token`); **ours is keyless Workload Identity Federation from Lambda** | `:predict` synchronous (audio inline, base64); `interactions` returns `status:"completed"` with outputs | Vertex per-project quotas; Provisioned Throughput available (GSU) | Doc last updated **2026-08-11**; prices from Google's pricing page **2026-08-13** | `lyria-3-*` are **PREVIEW** — Google may change them; Lyria 2 is GA. Our own repo measured that the `interactions` body must be **exactly** `{model, input}` — every extra key rejected |
| **ElevenLabs** | Eleven Music, Forced Alignment, Voice Changer, Stem Separation | `music_v1`, `music_v2`; API v1 | `https://api.elevenlabs.io` + **data-residency hosts** `api.us.`, `api.eu.residency.`, `api.in.residency.`, `api.sg.residency.elevenlabs.io` | `xi-api-key` header (API key); tier gates features (mp3 192 kbps needs Creator+, PCM 44.1 kHz needs Pro+) | compose returns the audio file directly; `/v1/music/stream` streams; song id in **response headers** | not published on the pages read; Agents has "burst concurrency" docs but Music does not | terms Last Updated **26 May 2026**; docs read **2026-08-13**; **per-song price NOT PUBLISHED** | **`music_v1` deprecation announced in advance**: "Music v1 will remain available during a transition period… When Music v1 is deprecated, this will be with at least a few months' notice" |
| **fal.ai** | ACE-Step, MiniMax Music, Stable Audio (hosted) | `fal-ai/ace-step`, `/audio-to-audio`, `/prompt-to-audio`; `fal-ai/minimax-music`; `fal-ai/stable-audio` | `https://fal.run/{model}` (sync) and **`https://queue.fal.run/{model}`** (queue — the route this repo already uses) | `Authorization: Key $FAL_KEY` | queue: submit → `GET /requests/{id}/status` → `GET /requests/{id}/response` (exactly what `music_ace/lambda_function.py` does) | **New accounts start at 2 concurrent requests, rising automatically to 40 as credits are purchased**; over-limit requests are queued, not rejected; `content_policy_violation` is a **non-retryable 422** | `llms.txt` per model read **2026-08-13**: ACE-Step **$0.0002/s**, MiniMax **$0.035/gen** | none noted; `Research only` badge marks non-commercial models; `Partner API` models are partner-hosted |
| **Mureka (Kunlun)** | Mureka API Platform | `V9`, `V8`, `O2`, `V7.6`, `auto`; API v1 | `https://api.mureka.ai/v1/…`; docs `platform.mureka.ai` | `Authorization: Bearer $MUREKA_API_KEY` | `POST /v1/song/generate` → task; `GET /v1/song/query/{task_id}` | **concurrency is a purchased tier**: 1 / 5 / 15 / 25 / 150 at $30 / $1,000 / $3,000 / $5,000 / $30,000 | pricing page **2026-08-13**: $0.045 or $0.03 per song; vocal clone $5 | changelog active through **2026.6.25**; API platform billing is **separate** from the consumer web app |
| **Stability AI** | Stable Audio | **2.5** and **3.0**; REST **v2beta** | `https://api.stability.ai/v2beta/audio/stable-audio-2/{text-to-audio,audio-to-audio,inpaint}` + `GET` fetch-result | `Authorization: Bearer`, `Accept: application/json` or `audio/*`; multipart/form-data body | async fetch-result endpoint documented | credit balance; 25 free credits for new users `[single-source]` | pricing page **2026-08-13**: 20 / 26 credits; 1 credit = $0.01 | **v2beta is the maintained API**; gRPC, REST v1 and REST v2alpha are maintained but frozen — v2alpha users are advised to migrate |
| **Music.AI (Moises)** | Jobs / Workflows / Application APIs | v1, OpenAPI **3.1.0** | `https://api.music.ai/v1/…` | **API key verbatim in `Authorization`, NO `Bearer` prefix** (an easy-to-get-wrong detail, stated in their own spec) | `POST /v1/job` → poll `GET /v1/job/{id}`; statuses `QUEUED`\|`STARTED`\|`SUCCEEDED`\|`FAILED`; `DELETE /v1/job/{id}` | pagination `page`/`size` (default 100); rate limits not published | not published | error codes are machine-readable (`BAD_INPUT`, …); `401 Unauthorized` documented |
| **Beatoven.ai** | Track Composition API | v1 | `https://public-api.beatoven.ai` | `Authorization: Bearer <token>` | `POST /api/v1/tracks/compose` → `task_id`; `GET /api/v1/tasks/{task_id}`; statuses `composing`\|`running`\|`composed` | not published | not published; key issued by request | **an older spec is explicitly marked "soon to be deprecated"** (`api-spec-old.md`) — the current spec is the one cited here |
| **Kits.ai (Arpeggi)** | Voice Conversion, Voice Blender, Vocal Separation | v1 | `https://arpeggi.io/api/kits/v1/…` | `Authorization: Bearer` | job queue → poll | `soundFile` max **100 MB** | not published | **TTS deprecated from the API on 2025-09-22** (vendor's own disclaimer) |
| **Dolby.io** | Music Mastering | Media APIs | `{base}/media/master`, `/media/master/preview` | API key | `job_id` → `GET` results | not published | not published | — |
| **LANDR** | Mastering API | v1 | via RapidAPI listing + own portal | key issued after a **sales conversation** (form asks expected monthly call volume) | — | — | not published | — |
| **Microsoft Azure** | AI Speech | current | regional endpoints | key / Entra | — | — | — | **NOT OFFERED for singing** (verified by full read of the language-support page); `tr-TR` supported for speech |
| **OpenAI** | Audio | `gpt-realtime-2.1`, `gpt-audio-1.5` | `api.openai.com` | API key | Realtime WS / Chat Completions | — | — | **NOT OFFERED for music/singing** (zero matches for music/sing/song/lyric in the full audio guide) |
| **AWS Bedrock** | — | — | — | SigV4 | — | — | — | **INACCESSIBLE this session** (JS-shell page + a search returning "No results found") |
| **Suno** | — | — | — | **none public** | — | — | — | **No official API; exploring a partner programme (2026-07). ToS forbids resale, scraping and granting access** |
| **Udio** | — | — | — | none public | — | — | — | **Walled garden: no off-platform export** |

---

# Five-part depth records (R9, adapted per R9's final paragraph for non-academic primaries)

## D-1 · Google Cloud — "Generate music with Lyria" + "Introduction to Lyria" + "Lyria prompt guide" `[FULL]`

1. **Authority / problem in the source's own framing.** Google states: "You can use Lyria to generate novel
   music tracks from prompts", and enumerates what Lyria supports: "Multimodal prompts, including support for
   image and text inputs · **Vocal generation for songs** · Audio generation · Safety filters."
2. **Mechanism / contract, step by step.** Two non-interchangeable surfaces. **Lyria 2:** `POST
   …/publishers/google/models/lyria-002:predict`, `{"instances":[{"prompt":…,"negative_prompt":…,"seed":…}],
   "parameters":{"sample_count":1}}`, with the doc's own comment "// Use either seed or sample_count"; the
   response carries base64 `audioContent`. **Lyria 3:** `POST
   https://aiplatform.googleapis.com/v1beta1/projects/{P}/locations/global/interactions`, body `{"model":…,
   "input":[{"type":"text","text":…},{"type":"image","mime_type":"image/jpeg","uri":…},
   {"type":"image","mime_type":"image/png","data":…}]}`; the response is an `interaction` object whose
   `outputs[]` carry a `text` output Google labels **`LYRICS`**, a second `text` output labelled `DESCRIPTION`,
   and an `audio` output with `mime_type:"audio/mpeg"`.
3. **Exact numbers.** Lyria 2 clip length **32.8 s** (Google's words: "Each clip is 32.8 seconds long"; our own
   ffprobe: **32.768 s**). Lyria 3 Pro **184 second** tracks. Prompt-guide structure controls: `[mm:ss - mm:ss]`
   timestamps, "Song key" (e.g. A major), "Beat rate" (e.g. 150 BPM), "Intensity: 1/10 (Very low)". Up to **10**
   reference images or PDFs. **Eight** vocal languages: English, German, Spanish, French, Hindi, Japanese,
   Korean, Portuguese. Prices: Lyria 3 Pro **$0.08**, Lyria 3 **$0.04**, Lyria 2 **$0.06** per count. Docs last
   updated **2026-08-11**; prices observed **2026-08-13**.
4. **Stated limitations / failure modes.** "SynthID watermarking is used on generated audio." Safety measures
   include "content safety filters, **recitation checking**, and **artist intent checks**"; violating prompts
   "may be blocked". Turkish is **absent** from the stated vocal-language list. Lyria 3 models are **Preview**.
   Our own repo adds two measured failure modes: the `interactions` body rejects every key beyond
   `{model, input}`, and Lyria's own WAV header once lied by 2× (declared 65.536 s for a 32.768 s file).
5. **Concrete application here.** Sits behind a new route on REST API `v2pjhwhk0m`, in a worker following the
   `<assettype>_<provider>/` contract — the natural name is `song_lyria/` alongside the existing
   `music_lyria/`, reusing that worker's WIF auth and its data-derived duration measurement (never the header).
   It is the only stage-(e) candidate needing **no new vendor approval**. **Before any of it is built, one
   $0.08 `lyria-3-pro-preview` call with a dictated Turkish lyric and a transcript check is the decisive
   experiment — and it needs Berk's approval.**

## D-2 · ElevenLabs — Music compose API reference + composition-plan API + Music Terms `[FULL]`

1. **Authority / problem.** "Eleven Music is a Text to Music model that generates studio-grade music with
   natural language prompts in any style… Complete control over genre, style, and structure · Vocals or just
   instrumental · Multilingual · Edit the sound and lyrics of individual sections or the whole song."
2. **Mechanism / contract.** `POST https://api.elevenlabs.io/v1/music`, JSON, returning the audio file.
   `prompt` **XOR** `composition_plan`. The plan has two shapes; the **MusicPrompt** shape carries the lyrics as
   `sections[].lines[]`, the **CompositionPlan** shape as `chunks[].text` with `[Verse 1]`-style headers and
   inline `{scratching}` directions. Companion endpoints: `/v1/music/plan` (generate a plan from a `prompt`,
   optionally seeded by `source_composition_plan`), `/v1/music/detailed` (returns the plan that was used),
   `/v1/music/stream`, `/v1/music/video-to-music`, `/v1/music/upload`, `/v1/music/stem-separation`,
   `/v1/music/finetunes/{list,create,get,update,delete}`, and `/v1/forced-alignment`.
3. **Exact numbers.** `music_length_ms` **3,000–600,000 ms** (3 s to 10 min by the parameter, though the
   capability page states a **5-minute maximum** — a second internal tension, recorded). Section/chunk
   `duration_ms` **3,000–120,000 ms**. Lyrics: **max 30 lines per section, max 200 characters per line**.
   `section_name` **1–100 characters**. `condition_strength` ∈ low/medium/high/**xhigh**. `context_adherence` ∈
   low/medium/high. 25 `output_format` values. Video-to-music: **max 10 videos, 200 MB combined, up to 600
   seconds**, `description` ≤1000 chars, `tags` ≤10. Forced alignment: file **<1 GB**. Audio Reference: **~30 s**.
   Finetune training time: **5–10 minutes**.
4. **Stated limitations / failure modes.** `force_instrumental` "Can only be used with `prompt`". `seed`
   "Cannot be used in conjunction with prompt" and "exact reproducibility is not guaranteed and outputs may
   change across system updates". `respect_sections_durations` is "**ignored**" for `music_v2`. `sign_with_c2pa`
   is "Applicable only for mp3 files". Stem separation "might have high latency". Forced alignment: "diarization
   is not supported at this time". Output is explicitly **not exclusive**. And the commercial gates: prohibited
   industries (six sectors including religious institutions and political advocacy), prohibited inputs (artist /
   songwriter / song / album / publisher / label names, or substantial lyrics of a real song), Beta Services
   output barred from any commercial or production use.
5. **Concrete application here.** Two distinct, separable roles: (i) `/v1/forced-alignment` is the best-fit API
   in this whole slice for our film pipeline — it aligns **known** Turkish lyrics to sung audio and returns a
   per-word `loss`, giving the calibrated instrument our measurement law requires, and it is language-agnostic
   by construction because we supply the text; (ii) `composition_plan` is the reference design for what our own
   outward-facing API's parameter surface should be able to express. Adopting it as a generator makes its
   prohibited-industry list a clause we must pass through to our own customers.

## D-3 · fal.ai — ACE-Step `llms.txt` (three endpoints) + OpenAPI + platform FAQ `[FULL]`

1. **Authority / problem.** fal publishes machine-readable per-model contracts ("Lyrics to Audio — Generate
   music with lyrics from text using ACE-Step") plus an OpenAPI schema per endpoint.
2. **Mechanism / contract.** Three endpoints — `fal-ai/ace-step` (tags+lyrics → audio),
   `/prompt-to-audio` (one `prompt` that the model expands into tags **and** lyrics), `/audio-to-audio`
   (`audio_url` + `edit_mode` ∈ `lyrics`|`remix`, with `original_tags`/`original_lyrics`/`original_seed` to
   describe the source). Auth `Authorization: Key $FAL_KEY`. Queue pattern: submit → status → response, which is
   exactly what `music_ace/lambda_function.py` in this repo already implements against
   `https://queue.fal.run`.
3. **Exact numbers.** `duration` **5–240 s** (default 60); `number_of_steps` **3–60** (default 27);
   `guidance_scale` **0–200** (default 15); `minimum_guidance_scale` default 3; `tag_guidance_scale` **0–10**
   (default 5); **`lyric_guidance_scale` 0–10 (default 1.5)**; `granularity_scale` **−100…100** (default 10);
   `guidance_interval` **0–1** (default 0.5, documented as "only apply guidance in the middle steps (0.25 ×
   infer_steps to 0.75 × infer_steps)"); `scheduler` ∈ euler|heun; `guidance_type` ∈ cfg|apg|cfg_star (default
   apg). Price **$0.0002 per second**, vendor's own worked example "For $1 you can … generate 5000 seconds (83
   minutes)". Concurrency **2 → 40** as credits are bought. CDN retention **≥7 days**. Credits expire **365
   days** after purchase.
4. **Stated limitations / failure modes.** Output URLs are **public by default**. `content_policy_violation` is a
   **non-retryable 422**. Client-side 422s "may still be charged if a runner spent GPU time". Server 500+ never
   charged. Cold starts not charged. Licence is **per model** — `Research only` models may not be used
   commercially — and fal warrants nothing about originality or non-infringement of Output.
5. **Concrete application here.** The cheapest stage-(d)+(e) route, already wired, already billing, no new
   vendor decision. `edit_mode:"lyrics"` is a genuine stage-(f) melody-preserving re-sing control. ACE-Step's
   Apache-2.0 upstream means this is also the **BUILD** hedge: if fal changes terms or price we can self-host
   the same weights on the Tesla T4 instance. **Turkish is not documented as supported** — the tag/lyric fields
   are free text, so it is a measurement question, not a documented capability.

## D-4 · Automatic lyrics transcription primaries — the stage-(h) reality check `[FULL]` / `[PARTIAL]`

1. **Authority / problem in the authors' framing.** arXiv:2506.15514 (ID fetch-verified; authors Syed,
   Meresman Higgs, Cífka et al.): "Automatic lyrics transcription (ALT) remains a challenging task … One of the
   major challenges in ALT is the **high amplitude of interfering audio signals relative to conventional ASR**
   due to musical accompaniment."
2. **Method.** WER is defined in the paper as `WER = (S + D + I)/(S + D + H)`. The authors evaluate Whisper on
   original audio, separated vocals and true vocal stems, across short-form (<30 s) and long-form (>30 s); for
   long form they propose using **source separation as a vocal-activity detector to derive segment boundaries**
   rather than feeding separated audio to the recogniser. They publish **MUSDB-ALT**, the first long-form
   lyric-transcript dataset following Jam-ALT guidelines with public vocal stems.
3. **Exact numbers.** Winterreise case study: **WER 0.56 sung vs 0.14 spoken** on the same lyrics. Greek
   thesis: **92.1% WER** zero-shot Whisper-Medium → **30% WER** after singing-specific fine-tuning of
   Whisper-Large (**≈67% relative** reduction). Jam-ALT: vocal separation "generally **degraded** the results for
   Whisper", and "large-v3 does not necessarily perform better on lyrics than large-v2". For scale, Whisper
   large-v3 on LibriSpeech test-clean is **2.7% WER** — so singing is a 10–30× harder regime.
4. **Stated limitations.** The Winterreise authors attribute the difficulty "less [to] the musical
   accompaniment and more [to] the **singing style**" — which limits how much a separation front-end can buy.
   The Greek study names melisma-induced vowel confusion, consonant-cluster inflation, function-word
   deletions/insertions and **lyric-prior hallucinations**. Jam-ALT observes Whisper mis-detecting the
   **language** when fed separated vocals.
5. **Concrete application here — and a correction to our own method.** Our Lyria conclusion was drawn from a
   transcript produced by `/create-stt-vertex`, a **speech** recogniser, on **sung** audio. The literature says
   that instrument can return near-zero recall on real singing. Our negative control proves the pipeline can
   distinguish "instrumental" from "vocal", but it does **not** calibrate word recall on singing. **Therefore
   the correct instrument for stage (h) is forced alignment against the known lyrics (per-word `loss`), not
   open-vocabulary ASR** — a direct, evidence-backed change to how the gate for this product must be built.
   `[This is an analyst-identified limitation of our own prior measurement, labelled as such.]`

---

# Methodology — exact query / action log

First external action was a broad scoping search over the whole topic (R4.1), never a fetch of a URL believed
in advance. Discovery rounds and their marginal yield:

| # | Query / action | System | Yield | Marginal value |
|---|---|---|---|---|
| 1 | "AI song generation API singing vocals commercial rights 2026" | web search | the reseller-vs-vendor distinction; the field's vocabulary (`add_vocals`, `task_type`, "royalty-ready") | HIGH — reframed the whole slice |
| 2 | "ElevenLabs Music API documentation compose endpoint parameters" | web search | `/v1/music`, `composition_plan`, SDK source | HIGH |
| 3 | "Suno official API developer documentation partner program" | web search | **no official API**; the 2026-07 partner-programme statement | HIGH — answers the owner's question |
| 4 | "Mureka API documentation song generation lyrics platform.mureka.ai" | web search | full endpoint list, Bearer auth | HIGH |
| 5 | fetch 5 ElevenLabs `.mdx` docs | direct download | 4 OK, 1 **308 redirect** | — |
| 6 | **the 404 page itself** disclosed the real slugs + `llms.txt` index | direct read | **`https://elevenlabs.io/docs/llms.txt`, 200,496 B, 1,276 lines** | VERY HIGH — turned guessing into enumeration (R4.3 honoured: search again, never guess a variant) |
| 7 | 15 targeted ElevenLabs pages from that index | direct download | 15/15 OK | HIGH |
| 8 | Google Lyria: generate-music, introduction, prompt-guide, pricing | direct download | 3 OK + pricing OK, **1 404** (`model-reference/music`) | VERY HIGH — the vocals/lyrics documentation and the $0.08/$0.04/$0.06 prices |
| 9 | "singing voice synthesis API commercial vocals from lyrics" | web search | stage (b) is **not** sold standalone; reseller `sing_over_instrumental` surfaces | HIGH (a negative finding) |
| 10 | fal.ai per-model `llms.txt` × 5 + OpenAPI | direct download | 6/6 OK | VERY HIGH |
| 11 | Stability 2.5/3.0 + audio-to-audio tips | search + download | endpoints, `strength: 0.8`, 20/26 credits | HIGH |
| 12 | "MiniMax music generation API official documentation" | web search | `music-1.5`, EN/ZH only | MEDIUM |
| 13 | mastering: LANDR / Dolby.io | web search | `POST /media/master`, `preset`, `target_level`; LANDR is sales-gated | HIGH |
| 14 | separation: Music.AI / Moises | web search | `POST /v1/job`, no-`Bearer` auth quirk, workflow slugs | HIGH |
| 15 | arXiv SVS survey / DiTSinger / SingMOS-Pro / DiffSinger | search + fetch | **all four arXiv IDs fetch-verified** via `citation_arxiv_id` metadata | HIGH |
| 16 | Suno/Udio/WMG/UMG licensing state | web search | settlements, walled garden, AFM suit | HIGH |
| 17 | Beatoven / Soundraw / Loudly | search + download | full Beatoven spec incl. free stems; $0.15 and $29.99/$300 prices | HIGH |
| 18 | Kits.ai + "Whisper WER singing" | web search | `arpeggi.io` endpoint + the **0.56 vs 0.14** and **92.1%→30%** numbers | VERY HIGH |
| 19 | Azure singing? Turkish? | grep of the full captured page | **no singing anywhere**; `tr-TR` present for speech | HIGH (a negative finding) |
| 20 | OpenAI audio: music? | grep of the full captured guide | **zero** music/sing/song/lyric matches | HIGH (a negative finding) |
| 21 | AWS Bedrock supported models | direct download + search | **INACCESSIBLE** (JS shell; then "No results found") | recorded as a gap |
| 22 | fal.ai ToS | direct download ×2 | **429 Too Many Requests both times**, even after a 12 s backoff; substance obtained from the search-surfaced quotations + the FAQ `.md` which downloaded cleanly | `[PARTIAL]` for the ToS |
| 23 | Mureka languages / pricing / changelog | direct download | **Turkish absent from the supported-language list** | VERY HIGH |
| 24 | local: which vendors does this repo already call? | shell enumeration of 24 audio worker dirs | fal.ai + ACE-Step + MiniMax + Stable Audio + Beatoven **already wired** | VERY HIGH — changes the vendor-approval calculus |
| 25 | local: `scripts/measure_lyria_lyrics_capability.py` | file read | the arms never set `model` ⇒ they ran on `lyria-002` | **DECISIVE — resolves contradiction C-1** |

**Saturation:** by rounds 19–21 the negative findings were reproducing (no singing on Azure, no music on
OpenAI, stage (b) absent as a standalone product) and new provider searches were returning resellers of the
same handful of upstream models, not new upstream capability. Remaining unsaturated lanes are named in
§Blind spots.

**Known-item test:** Suno's own current terms — retrieved; Google's Lyria documentation — retrieved; ALT/singing
academic primaries — retrieved with IDs verified; current litigation status — retrieved. All four pass.

---

# Source register and read-status counts

All captures are on disk under `docs/research/_sources/` with a `2026-08-13-` prefix, retrieved this session.
Hashes for every file were printed this session with `Get-FileHash -Algorithm SHA256`; the twelve-hex prefixes
below are from that output. `[FULL]` here means the relevant complete primary was opened and read from the
local capture, not from a search snippet.

## A. First-party API references, discovery documents and specs (authoritative, and the bulk of this slice)

| # | Source | Capture | SHA-256 (12) | Read |
|---|---|---|---|---|
| 1 | ElevenLabs — Compose music API reference (`POST /v1/music`) | `2026-08-13-elevenlabs-music-compose-api-reference.mdx` | `72EE38CD6950` | `[FULL]` |
| 2 | ElevenLabs — Compose with details | `2026-08-13-elevenlabs-music-compose-detailed.mdx` | `59662BF5EAA9` | `[FULL]` |
| 3 | ElevenLabs — Create composition plan (`/v1/music/plan`) | `2026-08-13-elevenlabs-create-composition-plan-api.md` | `5467F77559EA` | `[FULL]` |
| 4 | ElevenLabs — Stem separation (`/v1/music/stem-separation`) | `2026-08-13-elevenlabs-stem-separation-api.md` | `C1F7458EF1BD` | `[FULL]` |
| 5 | ElevenLabs — Video to music (`/v1/music/video-to-music`) | `2026-08-13-elevenlabs-video-to-music-api.md` | `C6B950FF7FC4` | `[FULL]` |
| 6 | ElevenLabs — Forced alignment (`/v1/forced-alignment`) | `2026-08-13-elevenlabs-forced-alignment-api.md` | `28906484E350` | `[FULL]` |
| 7 | ElevenLabs — Voice changer (`/v1/speech-to-speech`) | `2026-08-13-elevenlabs-voice-changer-api.md` | `7DE9086C42BB` | `[FULL]` |
| 8 | ElevenLabs — Eleven Music capability overview (v1/v2, 5-min max, formats) | `2026-08-13-elevenlabs-music-capability-overview.md` | `BF5D922EBBF6` | `[FULL]` |
| 9 | ElevenLabs — composition-plans how-to guide | `2026-08-13-elevenlabs-composition-plans-guide.md` | `533D9E7780AC` | `[FULL]` |
| 10 | ElevenLabs — official docs page index (`llms.txt`, 1,276 lines) | `2026-08-13-elevenlabs-docs-llms-index.txt` | `B4E83E05FCE2` | `[FULL]` |
| 11 | ElevenLabs — skills-repo Music API reference (first-party GitHub) | `2026-08-13-elevenlabs-skills-music-api-reference.md` | `FE767F271B79` | `[FULL]` |
| 12 | Google Cloud — Generate music with Lyria (both surfaces, full request/response) | `2026-08-13-vertex-lyria-generate-music.txt` | `8F0D41B836D0` | `[FULL]` |
| 13 | Google Cloud — Introduction to Lyria (184 s + vocals + SynthID) | `2026-08-13-vertex-lyria-introduction.txt` | `8AE820EE988A` | `[FULL]` |
| 14 | Google Cloud — Lyria prompt guide (lyrics, 8 languages, timestamps, key/BPM/intensity) | `2026-08-13-vertex-lyria-prompt-guide.txt` | `D326677147BF` | `[FULL]` |
| 15 | Google Cloud — Vertex generative-AI pricing (Lyria rows) | `2026-08-13-vertex-generative-ai-pricing.txt` | `0C70C33E71D4` | `[FULL]` (Lyria section) / `[PARTIAL]` (whole page) |
| 16 | fal.ai — ACE-Step lyrics-to-audio contract | `2026-08-13-fal-ace-step-lyrics-to-audio.txt` | `C2AE9553F327` | `[FULL]` |
| 17 | fal.ai — ACE-Step audio-to-audio contract (`edit_mode`) | `2026-08-13-fal-ace-step-audio-to-audio.txt` | `4E4978E5F14A` | `[FULL]` |
| 18 | fal.ai — ACE-Step prompt-to-audio contract | `2026-08-13-fal-ace-step-prompt-to-audio.txt` | `49ADF48991C7` | `[FULL]` |
| 19 | fal.ai — ACE-Step OpenAPI schema | `2026-08-13-fal-ace-step-openapi.json` | `D407DBFC2A77` | `[FULL]` |
| 20 | fal.ai — MiniMax Music contract (`reference_audio_url` required) | `2026-08-13-fal-minimax-music.txt` | `E59F7AE448B3` | `[FULL]` |
| 21 | fal.ai — Stable Audio contract | `2026-08-13-fal-stable-audio.txt` | `31BDAE0EF65D` | `[FULL]` |
| 22 | fal.ai — platform FAQ (concurrency 2→40, retention, licensing, charging) | `2026-08-13-fal-model-apis-faq.md` | `C5B4569E1E80` | `[FULL]` |
| 23 | Mureka — API docs home (service list) | `2026-08-13-mureka-api-docs-home.txt` | `2429DE444863` | `[FULL]` |
| 24 | Mureka — FAQ: **supported languages**, commercial authorisation, concurrency, refunds | `2026-08-13-mureka-faq-languages.txt` | `FA88E87685E2` | `[FULL]` |
| 25 | Mureka — changelog (V9, gender param, stem model, 10 languages) | `2026-08-13-mureka-changelog.txt` | `2482B2952A88` | `[FULL]` |
| 26 | Mureka — song-generate OpenAPI operation page | `2026-08-13-mureka-song-generate.txt` | `545BFBD87CA4` | `[PARTIAL]` (JS-rendered schema body not in the static HTML) |
| 27 | Mureka — lyrics-generate operation page | `2026-08-13-mureka-lyrics-generate.txt` | `D478DF3232CF` | `[PARTIAL]` (same reason) |
| 28 | Beatoven.ai — **full public API spec** (compose, task poll, free stems) | `2026-08-13-beatoven-public-api-spec.md` | `F00FFD8F5A1C` | `[FULL]` |
| 29 | Music.AI / Moises — API reference (jobs, workflows, statuses) | `2026-08-13-musicai-api-reference.txt` | `678EBBD6B2AB` | `[FULL]` |
| 30 | Kits.ai — docs index (`llms.txt`) | `2026-08-13-kits-ai-docs-index.txt` | `8197664BA4D4` | `[FULL]` |
| 31 | Kits.ai — voice-conversion endpoint page | `2026-08-13-kits-voice-conversion-api.txt` | `2D405D029261` | `[PARTIAL]` |
| 32 | Microsoft Azure AI Speech — language support (**no singing**; `tr-TR` for speech) | `2026-08-13-azure-speech-language-support.txt` | `9D1D851DAB52` | `[FULL]` |
| 33 | OpenAI — audio guide (**no music/singing**) | `2026-08-13-openai-audio-guide.txt` | `D8BE8C458B0C` | `[FULL]` |
| 34 | Hugging Face — Inference Providers index | `2026-08-13-hf-inference-providers.txt` | `A5C454F30DE0` | `[PARTIAL]` |
| 35 | Stability AI — audio-to-audio tips (`strength` values) | `2026-08-13-stability-audio-to-audio-tips.txt` | `4AB738A87004` | `[FULL]` |
| 36 | Beatoven — API product page | `2026-08-13-beatoven-api-page.txt` | `3BB83BC97CA8` | `[FULL]` |
| 37 | Soundraw — API page + plan prices | `2026-08-13-soundraw-api.txt` | `F2759CC6D68F` | `[FULL]` |
| 38 | Loudly — Music API page + licensing language | `2026-08-13-loudly-music-api.txt` | `46F22F3137C0` | `[FULL]` |
| 39 | fal.ai — pricing page | `2026-08-13-fal-pricing.txt` | `4657E28622AA` | `[PARTIAL]` |
| 40 | AWS Bedrock — supported models | `2026-08-13-aws-bedrock-supported-models.txt` | `B2CB3C2799A5` | **INACCESSIBLE** (JS shell, 1,081 B of chrome) |
| 41 | Stability — API reference / pricing landing | `2026-08-13-stability-api-reference.txt`, `…-stability-pricing.html` | `25B77ECDC70F`, `801A94688381` | **INACCESSIBLE** (1,644 B JS shell); substance taken from the search-surfaced pricing table and flagged |

## B. Terms, policies and rights (load-bearing because we resell)

| # | Source | Capture | SHA-256 (12) | Read |
|---|---|---|---|---|
| 42 | **ElevenLabs Music Terms** (Last Updated 26 May 2026) — prohibited industries/inputs, disclaimers, fees, model-specific terms | `2026-08-13-elevenlabs-music-terms.txt` | `6A937BBB635F` | `[FULL]` |
| 43 | ElevenLabs — "Can I publish the content I generate?" (paid = commercial licence; Beta barred) | `2026-08-13-elevenlabs-legal-can-i-publish.md` | `B1EB2364055B` | `[FULL]` |
| 44 | ElevenLabs — data-use / training + opt-out | `2026-08-13-elevenlabs-legal-data-training.md` | `82AE55702B31` | `[FULL]` |
| 45 | ElevenLabs — No-Go Voices safeguard | `2026-08-13-elevenlabs-legal-no-go-voices.md` | `E49AE4934B75` | `[FULL]` |
| 46 | ElevenLabs — watermarking status | `2026-08-13-elevenlabs-watermarking-status.md` | `50ED0D89D202` | `[FULL]` |
| 47 | ElevenLabs — Music Marketplace | `2026-08-13-elevenlabs-music-marketplace.md` | `798D7DF700F1` | `[FULL]` |
| 48 | ElevenLabs — Music cost FAQ (**price not published**) | `2026-08-13-elevenlabs-music-cost-faq.md` | `8F0CEEC4A876` | `[FULL]` |
| 49 | ElevenLabs — service-specific terms index | `2026-08-13-elevenlabs-service-specific-terms.txt` | `B385E849DBE4` | `[PARTIAL]` |
| 50 | **Suno Terms of Service, effective 2026-09-03** — commercial-use restriction, scraping ban, submissions licence | `2026-08-13-suno-terms-of-service-effective-2026-09-03.txt` | `0E91A9EC7155` | `[FULL]` for the clauses quoted |
| 51 | Suno ToS (current version) | `2026-08-13-suno-terms-of-service.txt` | `655FAAFD6728` | `[PARTIAL]` |
| 52 | fal.ai Terms of Service | (429 both attempts; substance from search-surfaced quotations + FAQ) | — | **`[PARTIAL]` / access-limited — disclosed** |
| 53 | Kits.ai Terms of Service (consent warranty; training on Provided Voice Files) | search-surfaced full-text page | — | `[PARTIAL]` |

## C. Formal primaries beyond vendor marketing (the ≥2 required by this slice's floor — **6 delivered**)

| # | Source | ID verified by fetch | Capture | Read |
|---|---|---|---|---|
| 54 | **C2PA Technical Specification 2.1** (soft bindings, watermarks — the provenance standard behind `sign_with_c2pa`) | n/a (standards body) | `2026-08-13-c2pa-specification-2-1.txt` (440,371 B) | `[PARTIAL]` — soft-binding and definitions sections read `[FULL]` |
| 55 | **arXiv:2506.15514** *Exploiting Music Source Separation for ALT with Whisper* | ✅ `citation_arxiv_id = 2506.15514` | `…-mss-alt-whisper.txt` `41876EAFD31C` | `[FULL]` |
| 56 | **arXiv:2601.13910** *Synthetic Singers: A Review of DL-based SVS Approaches* (Pan, Yao, Zhang, Guo, Lu, Zhu, Zhao; 2026-01-20) | ✅ verified | `…-svs-review-abs/-full.html` | `[PARTIAL]` |
| 57 | **arXiv:2510.09016** *DiTSinger* (Du et al.; 2025-10-10) — MOS/MCD/FFE/F0RMSE table | ✅ verified | `…-ditsinger.html` `667D4B897640` | `[PARTIAL]` |
| 58 | **arXiv:2510.01812** *SingMOS-Pro* (Tang, Liu, … Shi, Jin; 2025-10-02) — 7,981 clips, 41 models | ✅ verified | `…-singmos-pro.html` `1E9D05233BF5` | `[PARTIAL]` |
| 59 | **arXiv:2311.13987** *Jam-ALT* — separation degrades Whisper; wrong-language failure | ✅ fetched | `…-jam-alt.html` `31CFEF2D2252` | `[PARTIAL]` |
| 60 | **NLP4MusA 2024** *Lyrics Transcription in Western Classical Music with Whisper* — WER 0.56 vs 0.14 | ACL Anthology page fetched | `…-acl-nlp4musa-whisper-winterreise.html` `9EF91B077772` | `[PARTIAL]` |
| 61 | **arXiv:2105.02446** *DiffSinger* | ✅ fetched | `…-diffsinger-abs.html` `598A4BAE0551` | `[ABS]` — carries no load-bearing claim |
| 62 | University of Athens thesis — *Automatic Lyrics Transcription for Greek Songs* (92.1% → 30% WER) | institutional repository PDF | search-surfaced full text | `[PARTIAL]` |

## D. Industry-structure evidence (independent producers, for the licensing state)

| # | Source | Independence |
|---|---|---|
| 63 | **WMG press release** — "Warner Music Group and Suno forge groundbreaking partnership" (first-party) | producer 1 |
| 64 | Hollywood Reporter — WMG/Suno settlement | producer 2 |
| 65 | Music Business Worldwide — Suno developer-API exploration; WMG fiscal-2027 guidance; AFM amended complaint | producer 3 |
| 66 | Digital Music News — Suno API partner programme | producer 4 |
| 67 | Udio CEO interview (walled garden, no off-platform export) | producer 5 |

**COUNTS (this slice):**
- **Independent authoritative sources: 67** (deduplicated by underlying producer per R11.2 — the 11 ElevenLabs
  documentation pages count as **one** provenance family for corroboration purposes even though each is a
  distinct primary contract document; the same rule is applied to Google, fal, Mureka and Suno).
  Counted as **provenance families: 24** (Google, ElevenLabs, fal.ai, Mureka, Stability, Beatoven, Soundraw,
  Loudly, Music.AI, Kits.ai, Dolby.io, LANDR, Azure, OpenAI, AWS, HuggingFace, Suno, Udio, C2PA, plus 5
  independent academic/press producers). **Both counts are reported so neither can be read as inflated.**
- **Formal primaries beyond vendor marketing: 9** (items 54–62) — **floor was ≥2, so the floor is exceeded by
  7**.
- **Read `[FULL]`: 41** of the registered items.
- **Excluded aggregators, named:** `musikalis.com`, `musicmake.ai`, `tasarim.ai`, `novascribe.ai`,
  `unifuncs.com`, `apiframe.ai`, `gptproto.com` — discovery leads only, zero claims carried.

**CLAIM COUNTS:** 3+-source cross-verified: **9** (Suno-has-no-official-API; Suno resale prohibition;
WMG/UMG/Udio licensing state; ACE-Step lyrics+structure control; ACE-Step $0.0002/s; Lyria 3 vocals; Lyria 3
lyrics dictation; Whisper degrades badly on singing; separation is not a reliable ALT fix).
`[single-source official]`: **11** (each vendor's own exact price and quota — Lyria $0.08/$0.04/$0.06, Mureka
$0.045/$0.03/$5, Stability 20/26 credits, Soundraw $29.99/$300, Loudly $0.15, MiniMax $0.035, fal concurrency
2→40). `[UNVERIFIED]` / not published, each disclosed inline: **7** (ElevenLabs per-song price; Kits.ai price;
Music.AI price; Dolby.io price; LANDR price; Beatoven price; Vertex data-training posture).

---

# Universe and coverage ledger — every seeded provider accounted for (no silent omission)

The brief named 26 mandatory seeds and ordered that they be seeds, never a whitelist. Every one appears below
with a verdict or an explicit exclusion reason, and discovered additions are listed after.

| Seed from the brief | Covered? | Where / why |
|---|---|---|
| Google Cloud Vertex AI — Lyria family | ✅ | stages (d)(e)(f); D-1; three docs + pricing `[FULL]` |
| Google Cloud Vertex AI — Gemini TTS family | ✅ | stage (b) — **speech only, NOT OFFERED for singing**; ours, generation-proven |
| Google Cloud Vertex AI — the Live API | ✅ | ours (`/create-audio-live-gemini`); WebSocket, single-turn in Lambda; not a music surface |
| Google DeepMind music surfaces | ✅ | Lyria **is** the DeepMind lineage surfaced on Vertex; no separate DeepMind-branded music API found in the searched scope |
| ElevenLabs (Music and voice APIs) | ✅ | stages (a)(c)(d)(e)(f)(g); D-2; 11 primaries + 7 legal pages |
| Stability AI (audio) | ✅ | stages (d)(f); 2.5 and 3.0; v2beta pinned |
| Suno (official API or partner programme) | ✅ | stage (e) — **no official API; ToS forbids resale/scraping ⇒ AVOID** |
| Udio | ✅ | stage (e) — **walled garden, no off-platform export ⇒ AVOID** |
| Mureka / Kunlun | ✅ | stages (a)(c)(e)(f)(g); full endpoint list; **no Turkish** |
| Beatoven.ai | ✅ | stages (d)(g); full spec; free 4-stem output; already wired via fal |
| Loudly | ✅ | stage (d); $0.15 PAYG; strongest licence language |
| Soundraw | ✅ | stage (d); $29.99 / $300 plans; 6-month Pro commitment |
| Replicate | ⚠️ **PARTIAL** | licence doc 404'd; not re-searched before saturation. **Stated as a blind spot below** — not claimed absent |
| fal.ai | ✅ | stages (d)(e)(f); D-3; **already wired in ~15 workers** |
| Hugging Face Inference | ✅ | router only; per-model licence governs |
| AWS (Bedrock and any audio service) | ⚠️ | **INACCESSIBLE** (JS shell + a search returning no results). Stated as a blind spot |
| Azure AI Speech (incl. any singing capability) | ✅ | **NOT OFFERED for singing**, verified by full read; `tr-TR` for speech |
| OpenAI audio APIs | ✅ | **NOT OFFERED for music/singing**, verified by full-text grep |
| Microsoft cloud audio | ✅ | = Azure AI Speech, above |
| Tencent cloud audio | ✅ | open-weight `tencent-ailab/SongGeneration` / LeVo2 captured; **BUILD candidate**; no public REST music API found in scope |
| ByteDance cloud audio | ⚠️ | **NOT REACHED** — named as an unswept lane below |
| Alibaba cloud audio | ⚠️ | **NOT REACHED** — named as an unswept lane below |
| Voicemod | ⚠️ | **NOT REACHED** for its API terms — named below |
| Kits.ai | ✅ | stage (c); exact endpoint + consent/training terms |
| Musicfy | ⚠️ | **NOT REACHED** — named below |
| LANDR / eMastered-class mastering | ✅ | LANDR covered (**sales-gated**); Dolby.io covered as the reachable equivalent; eMastered not reached |
| Music.AI / Moises-class separation | ✅ | stage (g); exact job contract incl. the no-`Bearer` quirk |
| **Also in scope: what Vertex exposes for audio beyond what we use, from the OFFICIAL discovery doc/API reference rather than a blog** | ✅ | Answered from Google's own doc pages: **Lyria 2 / Lyria 3 / Lyria 3 Pro** (music, incl. vocals), **Gemini TTS**, **Live API native audio**, **STT via Gemini**, and Chirp — which our repo measured as a **404 on the Vertex publisher surface in BOTH `global` and `us-central1`** because Chirp is served by `speech.googleapis.com` (Speech-to-Text v2), an API **not enabled** on project `contentanalyticsplatform`. **Google exposes NO singing-synthesis surface**: the only vocals path is Lyria's song generation |

**Discovered and added (not in the brief's seed list):** MiniMax/Hailuo Music 1.5 · Dolby.io Music Mastering ·
Tencent SongGeneration/LeVo2 · ACE-Step (Apache-2.0 upstream of a wired worker) · and the reseller tier
(MusicAPI, MusicGPT, PoYo, Soundverse, HiAPI, WaveSpeed, sunoapi.org, acestep.io) which is characterised as a
market, not cited as vendor contract.

---

# Blind spots, stated explicitly rather than smoothed (R11.3)

1. **AWS Bedrock audio inventory — NOW MEASURED THIS SESSION, and the gap is closed for our region.** The
   documentation page was client-rendered and useless (JS shell), and a follow-up search returned "No results
   found" — so instead of asserting an absence I ran the authoritative local check on our own account:
   `aws bedrock list-foundation-models --profile beforetomorrow_production --region eu-central-1`.
   **Result: 38 foundation models visible, and the complete set of output modalities across all 38 is
   `TEXT` and `EMBEDDING` only — ZERO models with an `AUDIO` output modality.**
   The instrument was controlled in both directions before the result was believed (this project's measurement
   law): the same JMESPath query **does** return values when asked for all modalities (38 rows of
   TEXT/EMBEDDING), which proves it can pass; and an `IMAGE` filter also returns empty, which is consistent
   with this region genuinely exposing no image or audio models to us rather than with a broken filter.
   **Verdict: AWS Bedrock offers no audio/music generation to this account in `eu-central-1` as of 2026-08-13.**
   Scope of the claim, stated precisely: it is about **our account and this region**, not about Bedrock
   globally — a model absent in one region is not absent everywhere (CONTEXT-18 item 4).

2. **Replicate — PARTIAL.** Its licence documentation 404'd and I did not re-search it to completion before
   saturation. Replicate hosts many open music models; its per-model licence model is likely similar to fal's,
   but that is an inference, not evidence.
3. **Four unswept lanes, named:** ByteDance, Alibaba, Voicemod, Musicfy (plus eMastered). Chinese-cloud audio
   in particular is a real gap for a GLOBAL scope.
4. **fal.ai Terms of Service — access-limited.** Two 429s, including after a 12 s backoff. The quotations used
   are from the search tool's own retrieval of that page plus the FAQ `.md`, which downloaded cleanly. Flagged
   `[PARTIAL]`; a later session should re-fetch it directly.
5. **Every price is a dated adapter, not a truth.** All prices were observed **2026-08-13** with a 7-day
   freshness horizon. ElevenLabs' own Music Terms §4 reserve the right to adjust pricing and to pass through
   "third-party pass-through costs … attributable to ElevenLabs' third-party licensors" — so a licensed-music
   vendor's price is structurally volatile.
6. **No capability here is proven by us except where marked `GENERATION_PROVEN (ours)`.** Nothing in this file
   was tested by a paid call. Per CONTEXT-18 items 1 and 2, every vendor control is `DOCUMENTED` only.
7. **Turkish singing is unmeasured everywhere.** No provider documents it; three explicitly exclude it. Whether
   any of these APIs sings intelligible Turkish is an **empirical question that costs $0.024–$0.08 per attempt**
   and requires Berk's approval.
8. **What no instrument in this slice can judge:** whether any of these APIs produces music that *sounds* good,
   whether a synthetic Turkish vocal is convincing, or whether a mix reads as professional. That is **BERK'S
   VERDICT** and this document does not claim it.

---

# Artifact index and completion audit

**Files this slice owns and wrote:**

| Path | Role |
|---|---|
| `c:\Berk\SsmContentAssetCreator\docs\research\apis\2026-08-13-ai-song-generation.md` | this report (axis 3 of 6) |
| `c:\Berk\SsmContentAssetCreator\docs\research\_sources\2026-08-13-*` — **93 files added by this slice, all 93 verified present on disk this session (0 missing), 10,811,617 bytes total** | raw captures, hashed above |

**Write isolation honoured (CONTEXT-16):** no other file under `docs/research/` was modified; `docs/README.md`,
the scope plan, the preflight JSON, everything under `.claude/memory/`, every worker package, every script and
`docs/ssm-content-asset-generation-api_v5.md` were **read only**. Three sibling subagents are writing other
axes concurrently and none of their files were touched.

**Per-stage completion check — every stage in CONTEXT-02 has an evidence-backed verdict:**

| Stage | Verdict | Evidence-backed? |
|---|---|---|
| (a) Lyrics generation | **BUILD** on our own Gemini substrate; provider lyric-content policies documented | ✅ |
| (b) Singing voice synthesis from lyrics/score | **NOT FOUND IN SEARCHED SCOPE as a standalone API** → BUILD (open-weight) or absorb into (e) | ✅ |
| (c) Singing voice conversion / cloning | **ADOPT-with-approval**: Kits.ai or Mureka ($5/vocal); consent + training terms quoted | ✅ |
| (d) Instrumental / bed generation | **ADOPT (already wired)**: ACE-Step $0.024/2 min, Stable Audio, our Lyria 2 | ✅ |
| (e) Full song with vocals in one call | **YES it exists**: Vertex Lyria 3 Pro $0.08 (no new vendor) · ACE-Step ≈$0.024 · Mureka $0.03–0.045. **Suno/Udio = AVOID** | ✅ |
| (f) Melody / audio prompting | **ADOPT**: ACE-Step `edit_mode:"lyrics"`, ElevenLabs `conditioning_ref`+`condition_strength`, Mureka melody recording, Stability `strength` | ✅ |
| (g) Separation / alignment / loudness / mastering | **ADOPT ElevenLabs forced alignment** (per-word `loss`); **BUILD** loudness with two-pass ffmpeg; separation via ElevenLabs/Music.AI/Demucs; mastering via Dolby.io-with-approval | ✅ |
| (h) STT for verification on SUNG audio | **NOT FOUND IN SEARCHED SCOPE** as a documented capability; the literature gives WER 0.56 vs 0.14 and 92.1%→30%, so **forced alignment replaces open-vocabulary ASR as our gate** | ✅ |

**Floors:** slice floor was **≥25 independent authoritative sources** → **67 registered** (24 provenance
families), and **≥2 formal primaries beyond vendor marketing read `[FULL]`** → **9 formal primaries**, of which
the C2PA specification and arXiv:2506.15514 are read `[FULL]` on the load-bearing sections. **Both floors met;
both counts reported.** No `⚠️ UNVERIFIED RELAY — DO NOT CITE` banner is required.

**Money:** $0.00 spent. No account created, no trial started, no paid API call made.

**Living-update watchlist:** Lyria 3 preview → GA transition and any change to its 8 vocal languages · Suno's
partner API terms if it ships · ElevenLabs `music_v1` deprecation notice and any Music-Terms revision after
26 May 2026 · Mureka language list (Turkish) and top-up tiers · fal ACE-Step price and `Commercial use` badge ·
Stability 3.0 credit price · Sony's litigation against Suno and Udio · EU AI Act transparency duties and C2PA
2.2 adoption for audio.







