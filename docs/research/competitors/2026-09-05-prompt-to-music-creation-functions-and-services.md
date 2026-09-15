# Standards ledger

| Governing file (read from disk this session) | How this file obeys it |
| --- | --- |
| `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (1,310 lines; marked block sha256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8`, 64,383 bytes, recomputed this session) | R4 first external action was a broad scoping search (Q1–Q3 below); R8 raw captures live under `docs/research/_sources/2026-09-05-comp-creation-*` with sha256; R10 claim ledger with the 3-source rule; R11 counts reported; R15.4 honesty banner applied where a floor is unmet; R18.11 "not found" reported as NOT FOUND IN THE SEARCHED SCOPE. |
| `C:\Users\berke\.cursor\rules\00-berk-constitution.mdc` (Law Zero) | Every price, credit number and feature name below traces to a source ID opened this session; recollection was not used; anything not read from a primary is marked `[single-source third-party]` or `[UNVERIFIED]`. |
| `C:\Users\berke\.cursor\rules\10-no-narrowing.mdc` | The parent's seed list (22 names) is carried at full breadth; every seed appears in §2 with a status (SWEPT / PARTIAL / ACCESS FAILURE / NOT FOUND IN THE SEARCHED SCOPE); 2025–2026 entrants found by discovery were ADDED, never substituted. |

# Floor status (banner removed 2026-09-05 16:58 UTC+3 after the second pass — see §11.8)

Slice floor ≥20 independent authoritative sources: **MET** (31 at first pass; 50 after §11.6). Floor ≥5 academic primaries `[FULL]`: **MET after the second pass** — all five arXiv HTML texts were read in every section including appendices and their five-part records are in `docs\research\_sources\2026-09-05-comp-creation-academic-full-records.md` (§11.2). Historic first-pass wording, preserved: 5 academic primaries were opened as full HTML text and their method, result tables and limitation sections were read and quoted (§6), but not every appendix line, so under R8.2 they were marked `[PARTIAL]` and `academic_full = 0` was reported honestly. Product, pricing and UI facts in this file carry their own per-claim status in §7, §8 and §11. Remaining non-floor gaps, stated where they bind: UI surfaces TEXT-DERIVED (§11.4); ad-model uniqueness FLAGGED (§11.5).

# Decision served, why, project context

- **Decision:** the parity gap list and the three design directions for the rebuilt PlayMusicPrompts web / phone / tablet surfaces (Berk, 2026-09-05 15:49: "DÜNYADA BUGÜNE KADAR YAPILAMAMIŞ EN İLERİ SEVİYEDE uı ux…").
- **Why:** a competitor feature, menu or service we do not list becomes a feature we do not build.
- **Project:** PlayMusicPrompts (`C:\Berk\PlayMusicPrompts`) — prompt-to-music with a real-time generative player, 3-take listening algorithm (`app\lib\src\state\listening_session.dart`), 101 request parameters (`docs\api\04-request-body-full.md`), free-for-visitors quotas with Google audio ad breaks. This file is axis (a), vertical 1 = prompt-to-music creation, functions-and-services. Companion files in this folder and date: `…-pricing.md`, `…-business-model.md`, `…-ui-and-menus.md`; they reference the ledgers here.

# Outcome first

1. In 2026 the category converged on ONE canonical function bundle — prompt + optional lyrics + style tags + instrumental toggle + extend / remix / cover + inpaint-a-section + stems + reference-audio upload + persona/voice + custom fine-tune + share/publish — and every top-tier product (Suno, Google Flow Music, ElevenLabs Music v2, Mureka, Treblo, Pika Music) ships most of it [S01,S03,S10,S16,S21,S24].
2. Two structural shifts since 2025: (a) Riffusion → Producer.ai → **Google Flow Music** on Lyria 3.5, with Google AI Plus/Pro/Ultra plan mapping [S16,S17,S18]; (b) **Udio is a walled garden** — downloads of audio, video and stems disabled since 2025-10-29 under the UMG partnership [S05].
3. New 2026 entrants found by discovery: Pika Music (2026-08-18; text + lyrics + voice reference + music reference in one model; tracks "up to six minutes") [S24,S25]; Alibaba HappyShrimp 1.0 beta (2026-08-17; Taihe Music co-creation) [S26]; Adobe Firefly Generate Music GA (2026-08-20; "universally licensed", cut to a video's length and mood) [S27]; Suno v5.5 with Voices / Custom Models / My Taste [S01,S02]; Stable Audio 3.0 family with open weights (2026-05) [S13].
4. **No swept product ships what PlayMusicPrompts' listening algorithm does**: a continuous, ad-supported, prepare-ahead generative radio in which the listener hears one take while two are prepared and skip / full-listen behaviour drives exploitation. Nearest analogues: Mubert's realtime WebRTC stream [S15b], Google Lyria RealTime's steerable stream [S20], Google Flow Music's daily top-up credits + Turntable A/B voting loop [S18]. That is the frontier gap we own; the parity gaps we LACK are enumerated in §5.

# 1 Methodology and exact query / action ledger (in order, UTC+3, 2026-09-05)

| # | Query / action | System | Time | Yield |
| --- | --- | --- | --- | --- |
| Q1 | `AI music generator 2026 text to music apps list` | web search | 16:06 | Sonilo guide; Cinevva guide naming ACE-Step, YuE, DiffRhythm 2, Magenta RealTime; Mubert API pages |
| Q2 | `prompt to song generator pricing 2026 Suno Udio Mureka Sonauto comparison` | web search | 16:06 | Chartlex (Suno prices "verified July 11, 2026"), RightsDocket, Jack Righteous rights report, Udio download shutdown |
| Q3 | `new AI music generation startup launched 2026 text-to-music` | web search | 16:06 | Pika Music (2026-08-18), Alibaba HappyShrimp (2026-08-17) |
| F1–F4 | fetch suno.com/pricing, udio.com/pricing, elevenlabs.io/pricing, mureka.ai/pricing | fetch | 16:07 | Suno: JS pricing, feature matrix text only; Udio: Stripe pricing-table JS, no prices in HTML; ElevenLabs: FULL; Mureka `/pricing`: **404** → back to search (R4.3) |
| Q4 | `help.suno.com subscription plans Pro Premier credits price monthly annual` | web search | 16:08 | suno.com/pricing plan bullets (indexed text), suno.com/hub prices |
| Q5 | `support.udio.com subscription plans credits Standard Pro downloads disabled 2026` | web search | 16:08 | help.udio.com articles 12683565, 10739134 |
| Q6 | `Mureka AI pricing plans credits Basic Pro Premium 2026 mureka.ai` | web search | 16:08 | mureka.ai/subscribe (first-party, prices JS-only), platform.mureka.ai FAQ |
| Q7 | `Stable Audio pricing plans stableaudio.com Pro Studio Max 2026 Stable Audio 2.5 3.0` | web search | 16:08 | stableaudio.com/pricing, stability.ai/stable-audio, stableaudio user guide |
| C1 | capture batch 1 (15 URLs) → `_sources` with sha256 | node | 16:08 | 15/15 HTTP 200 |
| F5–F8 | fetch sonauto.ai/pricing, soundraw.io/pricing, aiva.ai/pricing, mubert.com/render/pricing | fetch | 16:09 | Sonauto: **Cloudflare block = ACCESS FAILURE**, not non-existence; Soundraw, AIVA, Mubert: FULL |
| F9–F12 | fetch boomy.com/pricing, beatoven.ai/pricing, loudly.com/pricing, kits.ai/pricing | fetch | 16:09 | Boomy: JS shell; Beatoven **404**; Loudly **404**; Kits: FULL |
| Q8 | `Beatoven.ai pricing plans 2026 credits; Loudly pricing plans 2026; Boomy pricing Creator Pro 2026` | web search | 16:09 | third-party aggregators only |
| Q9 | `Google Lyria 2 Lyria RealTime Gemini app music generation 2026 pricing Vertex AI per 30 seconds` | web search | 16:09 | Google Cloud Lyria API doc; ai.google.dev Lyria RealTime doc (last updated 2026-06-01) |
| Q10 | `Sonauto AI pricing plans Pro Premier credits 2026 sonauto.ai` | web search | 16:09 | Sonauto rebranded **Treblo**; consumer free; developer API ladder |
| Q11 | `Producer.ai (Riffusion) pricing plans 2026; Pika pricing credits Pika Music 2026` | web search | 16:09 | producer.ai → **flowmusic.app** (Google Flow Music); pricing; Google Flow help |
| C2 | capture batch 2 (14 URLs incl. treblo.com, treblo.com/developers/pricing, flowmusic.app/pricing) | node | 16:10 | 14/14 HTTP 200 (node fetch not Cloudflare-blocked on treblo.com) |
| F13–F16 | fetch arXiv 2306.05284, 2407.14358, 2301.11325, 2409.09214 | fetch | 16:11 | full HTML text (35–80 KB each) |
| F17–F18 | fetch arXiv 2005.00341; elevenlabs.io/docs/overview/capabilities/music | fetch | 16:12 | Jukebox full text; Eleven Music docs FULL |
| Q12 | `help.suno.com commercial use rights personas covers Suno Studio "v5.5" custom models inspire` | web search | 16:12 | suno.com home FAQ (first-party); v5.5 reviews (third-party) |
| Q13 | `Adobe Project Music GenAI Control 2026 status; Splash Pro…; Tad AI…; Lemonaide…; Ecrett…` | web search | 16:12 | Adobe blog 2026-08-20 (Firefly Generate Music GA); Tad/Ecrett/Splash/Lemonaide snippet-level only |

Marginal yield by round: Q1–Q3 → 9 new entities; Q4–Q7 → prices for 5 companies; Q8–Q11 → 2 structural discoveries (Treblo, Flow Music) + 3 aggregator-only companies; Q12–Q13 → 1 new entrant (Adobe Firefly) + 4 snippet-only names. Stopped at the 60-minute limit, not at saturation (§8).

# 2 Universe and coverage ledger — every seed and every discovery

| universe_id | Entity (aliases) | Why in scope | Discovery path | Screening | Status | Evidence IDs |
| --- | --- | --- | --- | --- | --- | --- |
| U01 | Suno | seed | Q4, F1, Q12, C1 | first-party pricing, hub, home FAQ | SWEPT | S01, S02, S03 |
| U02 | Udio | seed | Q5, F2, C1 | help centre ×2 | SWEPT | S04, S05 |
| U03 | Stability AI — Stable Audio (2.5 hosted app, 3.0 family) | seed | Q7, C1 | pricing, product page, user guide | SWEPT | S11, S12, S13 |
| U04 | ElevenLabs — Eleven Music v2 | seed | F3, F18, C1 | pricing, API page, docs | SWEPT | S08, S09, S10 |
| U05 | Google — Lyria 2 (Vertex `lyria-002`), Lyria RealTime, Lyria 3 / 3.5, **Flow Music** (ex-Producer.ai / Riffusion) | seed (MusicFX / Lyria) | Q9, Q11, C2 | Cloud doc, AI-for-Developers doc, flowmusic pricing, Google Flow help | SWEPT | S16–S20 |
| U06 | Meta — MusicGen / AudioCraft | seed | F13 | paper full text (repo licence not opened this session) | PARTIAL (paper only) | A1 |
| U07 | Riffusion / Producer.ai | seed | Q11 | redirects to Google Flow Music | SWEPT under U05 | S16 |
| U08 | Boomy | seed | F9, Q8, C2 | pricing page is a JS shell; aggregators only | PARTIAL `[single-source third-party]` | S28 |
| U09 | Soundraw | seed | F6, C2 | pricing FULL | SWEPT | S14 |
| U10 | AIVA | seed | F7, C2 | pricing FULL | SWEPT | S22 |
| U11 | Mubert (Render app + Music API) | seed | F8, C1, C2 | pricing FULL, API pages | SWEPT | S15, S15b |
| U12 | Beatoven.ai | seed | F10 (404), Q8, C2 | home FULL; prices third-party only | PARTIAL | S29, S29b |
| U13 | Loudly | seed | F11 (404), Q8, C2 | home FULL; prices third-party only | PARTIAL | S30, S30b |
| U14 | Splash Pro | seed | Q13 | snippet only | NOT FOUND IN THE SEARCHED SCOPE (no first-party page opened) | — |
| U15 | Adobe — Project Music GenAI Control → **Firefly Generate Music** | seed | Q13 | Adobe blog 2026-08-20 | SWEPT (blog) | S27 |
| U16 | Amper (Shutterstock) | seed | Q1 | no first-party page opened; Sonilo blog claims a Shutterstock licensed-data partnership | NOT FOUND IN THE SEARCHED SCOPE | — |
| U17 | Ecrett Music | seed | Q13 | snippet only (free / $7.99 / $24.99) | `[UNVERIFIED]` | — |
| U18 | Tad AI | seed | Q10, Q13 | snippet only (free / $8 / $24) | `[UNVERIFIED]` | — |
| U19 | Kits.ai | seed | F12, C2 | pricing FULL | SWEPT | S23 |
| U20 | Sonauto → **Treblo** | seed | F5 (blocked), Q10, C2 | home + developer pricing FULL via node capture | SWEPT | S21, S21b |
| U21 | Lemonaide | seed | Q13 | snippet only | NOT FOUND IN THE SEARCHED SCOPE | — |
| U22 | Mureka (Kunlun Tech) | seed (Chinese entrant) | Q6, C1 | subscribe page (features FULL, prices JS-only), API FAQ FULL | SWEPT (features); prices `[single-source third-party]` | S06, S07, S07b |
| U23 | ByteDance Seed-Music | seed (Chinese entrant) | F16 | technical report full text | SWEPT (paper) | A4 |
| U24 | **Pika Music** (Pika) | discovered Q3 | C1 | two first-party blog posts | SWEPT | S24, S25 |
| U25 | **Alibaba HappyShrimp 1.0** | discovered Q3 | C1 | MBW report quoting Alibaba's statement | PARTIAL `[single-source secondary]` | S26 |
| U26 | ACE-Step, YuE, DiffRhythm 2, Magenta RealTime (open models) | discovered Q1 | — | named in one guide | NOT FOUND IN THE SEARCHED SCOPE | — |
| U27 | Sonilo (video-native music API) | discovered Q1 | — | own blog only | `[single-source self]` | — |
| U28 | Endel, brain.fm, Soundful, Uppbeat, Artlist | discovered Q2/Q8 | — | snippet only | NOT FOUND IN THE SEARCHED SCOPE | — |

Machine count: 22 seeds → 13 SWEPT, 6 PARTIAL, 3 NOT FOUND IN THE SEARCHED SCOPE (Splash Pro, Amper, Lemonaide), 2 `[UNVERIFIED]` snippet-only (Ecrett, Tad AI). Discoveries: 5 groups (U24–U28), 2 SWEPT (Pika, Adobe under U15).

# 3 Per-competitor function and service inventory (item by item, from primaries opened this session)

Legend: ✔ = stated on a first-party surface opened this session; (3p) = third-party only; — = not stated on any surface opened (NOT FOUND IN THE SEARCHED SCOPE, not "absent").

## 3.1 Suno (v5.5 era) — S01 pricing page text, S02 hub, S03 home FAQ
- Prompt input: song description (free text); "Magic Song Descriptions" listed as a creation feature ✔ [S01]. Custom mode with lyrics field; "Co-write with Suno" ✔ [S01].
- Lyrics: write own lyrics or let Suno write; "Add vocals / Add instrumental" to existing songs ✔ [S01]; v5.5 model; free tier limited to v4.5-all ✔ [S01].
- Styles/tags, weirdness/style sliders, exclusions, vocal gender (3p) [S02b-third-party review; `[single-source third-party]`].
- Extend / Cover / Adjust speed ("Remix songs") ✔ [S01]; Cover blocked for recognised commercial tracks by copyright filter (3p) [Q12 result 5].
- Editing: "Basic editing (crop, fade)" all plans; "Advanced editing (replace or add section)" paid ✔ [S01]; Song Editor ✔ [S03].
- Stems: Pro "2 stem separation types (Auto; Split from mix)"; Premier "3 types (… Advanced split)" ✔ [S01]; 12-stem split (3p) [S02].
- Upload audio: Free up to 8 min, paid up to 30 min ✔ [S01]. Inspire; Voices ("Record, upload and create with your own voice"); Custom Models ("Tune custom versions of v5.5 using your own audio") ✔ [S01].
- Suno Studio (generative audio workstation, multitrack, MIDI export) — Premier only ✔ [S01,S03].
- Concurrency: Free 4 in shared queue; paid 10 in priority queue ✔ [S01].
- Downloads: Free "No monthly song downloads"; Pro 20 / Premier 60 song downloads per month "(starting 9/3/26)" ✔ [S01]. Commercial rights only on paid plans ✔ [S01].
- Mobile apps / API: not stated on surfaces opened this session — NOT FOUND IN THE SEARCHED SCOPE.

## 3.2 Udio — S04 help "Credits and credit limits", S05 help "Changes associated with the UMG partnership" (2026-02-17)
- Generation still available; **downloading of audio, video and stems disabled** since 2025-10-29 ✔ [S05].
- Standard 2,400 credits/mo (was 1,200), Pro 6,000 (was 4,800); Pro "5 sets of songs (10 songs) at the same time" — i.e. generation in PAIRS ("sets") ✔ [S05]. One-time grant of 1,000 non-expiring credits to all subscribers ✔ [S05].
- Free tier: capped at "3 u-130 (~2 minute song) creations per day"; trials keep free limits ✔ [S04]. A-la-carte credits never expire ✔ [S04].
- Feature set (remix, extend, inpaint, stems) exists per third-party guides but is moot for export; walled-garden relaunch planned 2026 (3p) [Q5 results 2,3] `[single-source third-party]`.

## 3.3 ElevenLabs — Eleven Music v2 — S08 pricing, S09 API page, S10 docs
- Prompt: natural language + musical terminology; genre, style, structure; vocals or instrumental; multilingual ✔ [S10].
- Section-level composition ("long-form section-by-section"), mid-track genre transitions, inpainting (select a section, regenerate only it), SFX embedded in tracks, fast rap ✔ [S10].
- **Audio Reference**: upload ≈30 s track to guide style; copyright-screened; paid plans; not a remix/genre-transfer tool ✔ [S10].
- **Music Finetunes**: upload own non-copyrighted tracks → personal model in ~5–10 min; curated finetunes (Afro House Beats, Reggaeton, Arabic Groove, 70s Cambodian Rock, 80s Nu-Disco Revival, Mozart-Style Symphony) ✔ [S10].
- Duration 3 s – 5 min; MP3 44.1 kHz 128–192 kbps and WAV ✔ [S10]. API `POST /v1/music`, streaming, Python/TS SDKs ✔ [S09]. Credits: Music = 900 credits/minute; shared pool; rollover up to 2 months ✔ [S08].

## 3.4 Google — Flow Music (ex-Producer.ai/Riffusion), Lyria 2, Lyria RealTime — S16 home, S17 pricing, S18 help, S19 Cloud doc, S20 RealTime doc
- Flow Music: "Chat with Producer just like you're in a studio"; full-length songs with vocals on Lyria 3.5; AI music videos via Veo; "vibe-code" plugins/instruments/DAWs; playlists, publish, follow; personalisation ("learns your style"); remix your audio, audio effects, stem split; daily credits ✔ [S16]. Concurrent generations 2/8/12/16 by plan; downloads mp3/wav/m4a; stem downloads; publishing; image+video generation ✔ [S17].
- **Turntable**: earn credits by listening ≥10 s to sample A and B and voting which matches the prompt ✔ [S18].
- Lyria 2 API (`lyria-002`): 30 s instrumental WAV 48 kHz; negative_prompt; seed; SynthID; prompts US English only ✔ [S19].
- Lyria RealTime (experimental): WebSocket bidirectional stream, 16-bit PCM 48 kHz stereo; params guidance 0–6 (default 4), bpm 60–200, scale enum, music_generation_mode QUALITY/DIVERSITY/VOCALIZATION, temperature 0–3 (default 1.1), top_k 1–1000 (default 40), seed ✔ [S20].

## 3.5 Mureka (Kunlun) — S06 subscribe page, S07 API FAQ
- Models V9, V8, O2 (Pro+); Remix ("swap genres, rewrite lyrics"); Splitter up to 12 stems; Reference (upload a track, capture style/mood/energy); any voice as AI singer; Mureka Studio (timelines, extract stems, extend); MIDI/WAV exports (Premier); Mureka Co (natural-language DAW assistant); cinematic music videos (MV); web + app ✔ [S06].
- API billing separate from web membership; top-ups valid 12 months, FIFO consumption ✔ [S07].

## 3.6 Treblo (ex-Sonauto) — S21 home, S21b developer pricing
- "And it's actually free" consumer app, "No daily limits"; iOS and Android apps; own lyrics or generated; structural tags `[Intro] [Verse 1] [Chorus]`; 4,160 style tags; instrumental toggle; "song starts streaming in about 15 seconds"; edit sections, swap lyrics, extend, remix other songs, inpainting, stem separation; publish to profile/groups, private tracks, download "in any format" ✔ [S21].
- First-party comparison table on its home page pits Treblo against three unnamed competitors on Songs/month (Unlimited vs ~300 vs ~120 vs 2), Models (Melodia v3 vs "v4.5-all only (not v5.5)" vs "v7.5-all only" vs Basic), Features ✔ [S21].
- Developer API: 1,500 free credits; one song = 100 credits; `num_songs=2` = 150 credits; streaming; v2 & v3; attribution required in user-facing implementations ✔ [S21b].

## 3.7 Stability AI — Stable Audio — S11 pricing, S12 product page, S13 user guide
- Web app + DAW plugin included in all plans ✔ [S11]. 3.0 family: Large (enterprise/API), Medium (open weights, full songs), Small & Small SFX (on-device, open weights); "up to six minutes"; modify a segment / extend; fine-tune on your library ✔ [S12]. Audio-to-audio uploads capped per tier (Free 6 min/mo cropped at 30 s; paid 30/60/90 min cropped at 6 min) with third-party copyright check ✔ [S13].

## 3.8 Soundraw — S14
- Genre-blend generation; Mixer (toggle instruments, intensity, length); bar-level editing; WAV + stems download; trained only on in-house catalogue; API and Enterprise tiers ✔ [S14].

## 3.9 AIVA — S22
- 250+ styles; create own style models; upload audio or MIDI influence; edit generated tracks; MP3 & MIDI (free/standard), all formats + high-quality WAV (Pro); durations 3 / 5 / 5:30 min by plan ✔ [S22].

## 3.10 Mubert — S15 Render pricing, S15b API pages
- Text→Music, Image→Music, Mood/Genre/BPM selectors; Quick Remix (regenerate/remove stems); Full Track Editor (structure, sections, stems within sections, BPM, key) on Pro/Business — "changes are not generated in real time"; tracks up to 25 min; 12,000-track Staff Picks library; copyright checker; license certificate ✔ [S15]. API: WebRTC realtime stream "sub-second latency", 150+ genres/moods, adaptive intensity ✔ [S15b].

## 3.11 Kits.ai — S23
- Voice cloning (instant / professional), Voice Designer/Blender, generative vocals, stem splitter, vocal remover, harmony generator, choir tool, mastering; download-minute metering ✔ [S23].

## 3.12 Pika Music — S24, S25 (2026-08-18)
- Inputs: text, lyrics, voice-condition, music reference, and combinations in one model; tracks "up to six minutes"; "90-second song in 6.21 seconds locally on average" ✔ [S24,S25]. Sibling models: Soundtrack (video→synchronised music/SFX), SFX, Speech ✔ [S25].

## 3.13 Alibaba HappyShrimp 1.0 (beta 2026-08-17) — S26 (secondary, quoting Alibaba)
- One prompt → melody, arrangement, lyrics, vocals; own lyrics or instrumental; prompts may specify instrumentation, vocal style and energy shifts over time; maps structure/rhythm/harmony before generating audio; Taihe Music co-creation `[single-source secondary]` [S26].

## 3.14 Adobe Firefly Generate Music (GA 2026-08-20) — S27
- Original tracks "tuned to your video's length and mood", "universally licensed"; inside Firefly with Generate Speech (ElevenLabs optional) and Generate SFX ✔ [S27].

## 3.15 Beatoven.ai — S29 home; Loudly — S30 home; Boomy — S28 (3p)
- Beatoven: Maestro Music (describe background music), Text-to-SFX, MP3/WAV, license emailed per download, pay-per-track or download minutes ✔ [S29]. Loudly: Generator, Discover, Text to music, Remixer, API, SongDNA "context window" for agentic actions (playlist pitch, captions, TikTok cut) ✔ [S30]. Boomy: pricing/features not readable without JS; third-party only (3p) [S28].

# 4 Cross-competitor control matrix (what a user can set at generation time)

| Control | Suno | Udio | Eleven v2 | Flow Music | Lyria RT | Mureka | Treblo | Stable Audio | Soundraw | AIVA | Mubert | Pika |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Free-text prompt | ✔ | ✔ | ✔ | ✔ (chat) | ✔ (weighted prompts) | ✔ | ✔ | ✔ | genre pick | style pick | ✔ | ✔ |
| Own lyrics / structural tags | ✔ | ✔ | ✔ | ✔ | — | ✔ | ✔ | — | — | — | — | ✔ |
| Instrumental toggle | ✔ | ✔ | ✔ | ✔ | instrumental only | ✔ | ✔ | instrumental | instrumental | instrumental | instrumental | ✔ |
| Style tags / genre list | ✔ | ✔ | prose | prose | prose | ✔ | 4,160 tags | prose | 30+ genres | 250+ styles | 150+ | prose |
| Duration control | model-bound | u-130 etc. | 3 s–5 min | — | continuous | — | — | up to 6:20 | length set | 3–5:30 | up to 25 min | ≤6 min |
| BPM / key | — | — | prose | — | bpm 60–200, scale | — | — | — | Mixer | — | BPM + key edit | — |
| Reference audio | upload ≤30 min | — | ≈30 s | remix your audio | — | ✔ | remix other songs | a2a upload | — | audio/MIDI influence | image→music | voice + music ref |
| Persona / own voice | Voices | — | — | — | VOCALIZATION mode | any voice | — | — | — | — | — | voice-condition |
| Custom model / finetune | Custom Models | — | Finetunes | "learns your style" | — | — | — | fine-tune (enterprise) | — | own style models | — | — |
| Section inpaint / replace | paid | (3p) | ✔ | — | live steer | Studio | ✔ | segment modify | bar-level | edit | Track Editor | — |
| Extend | ✔ | (3p) | ✔ | — | continuous | ✔ | ✔ | ✔ | length | — | duration | — |
| Stems | 2–3 types | disabled export | — | ✔ | — | 12 | ✔ | Studio tier (3p) | ✔ | — | ✔ | — |
| Negative prompt | exclusions (3p) | — | — | — | weighted prompts | — | — | — | — | — | — | — |
| Seed / reproducibility | — | — | — | — | seed | — | — | — | — | — | — | — |
| Realtime streaming | — | — | API streaming | — | ✔ WebSocket | — | "streams in ~15 s" | — | — | — | WebRTC | — |
| Multiple takes per request | 2 (pairs, typical) (3p) | "sets" of 2 ✔ | — | — | n/a | — | `num_songs` API | — | — | — | — | — |

# 5 Parity gap list — what PlayMusicPrompts LACKS today (each item = a competitor function on a first-party surface this session)

PMP baseline used (from CONTEXT-03): one-prompt page + player, 3-take listening queue, /musics catalogue, /t/<id> share, Flutter Home/Player/Queue/Library/Musics/Studio(101 params)/Profile/Login, free quotas 12/h & 40/day, ad breaks.

| # | Gap (competitor function we do not list) | Who has it | Evidence |
| --- | --- | --- | --- |
| G01 | Own-lyrics input with structural tags `[Intro] [Verse] [Chorus]` and an instrumental toggle | Treblo, Suno, Udio, Eleven, Mureka, Pika | S21, S01, S10, S06, S24 |
| G02 | Reference-audio upload (copyright-screened, ≈30 s) steering style | Eleven v2, Mureka, Suno (upload 8/30 min), Stable Audio a2a | S10, S06, S01, S13 |
| G03 | Own voice / persona (verified voice clone) and "any voice as singer" | Suno Voices, Mureka, Pika voice-condition, Kits | S01, S06, S24, S23 |
| G04 | Personal fine-tune from user catalogue (Custom Models / Music Finetunes / style models) | Suno, Eleven, AIVA, Stable Audio enterprise | S01, S10, S22, S12 |
| G05 | Section-level edit: replace/add section, inpaint, extend, cover, speed change | Suno, Eleven, Treblo, Mubert Track Editor, Stable Audio | S01, S10, S21, S15, S12 |
| G06 | Stem separation and stem download (2–12 stems) | Suno, Mureka, Soundraw, Flow Music, Treblo, Mubert | S01, S06, S14, S17, S21, S15 |
| G07 | Download formats MP3 / WAV / M4A / MIDI with per-plan caps | Flow Music, AIVA, Soundraw, Mureka, Eleven | S17, S22, S14, S06, S10 |
| G08 | Explicit concurrency ladder (2/8/12/16; 4 shared vs 10 priority; 5 sets ×2) | Flow Music, Suno, Udio | S17, S01, S05 |
| G09 | Community surfaces: publish to profile, groups, playlists, follow, discover feed | Treblo, Flow Music, Suno | S21, S16, S03 |
| G10 | Listener-labour-for-credits loop (Turntable A/B vote ≥10 s each → credits) | Google Flow Music | S18 |
| G11 | AI music video from the track (Veo / MV) | Flow Music, Mureka | S16, S06 |
| G12 | Image→Music input | Mubert | S15, S15b |
| G13 | Explicit BPM / key / scale / guidance / temperature / seed controls exposed to the user | Lyria RealTime (API), Mubert Track Editor, Soundraw Mixer | S20, S15, S14 |
| G14 | Negative prompt | Lyria 2 API (`negative_prompt`), Suno exclusions (3p) | S19 |
| G15 | Realtime steerable stream (change prompt while it plays) | Lyria RealTime, Mubert WebRTC | S20, S15b |
| G16 | "Vibe-code" user-built instruments/plugins/DAW spaces | Google Flow Music | S16 |
| G17 | Generative DAW / multitrack Studio with MIDI export | Suno Studio, Mureka Studio, Stable Audio DAW plugin | S01, S06, S11 |
| G18 | License certificate delivered with every download; copyright checker | Mubert, Beatoven | S15, S29 |
| G19 | Curated finetunes / style presets as one-tap starting points | Eleven (6 curated), AIVA (250 styles), Treblo (4,160 tags), Mubert Staff Picks 12k | S10, S22, S21, S15 |
| G20 | Video-length/mood-fitted generation ("tuned to your video's length") | Adobe Firefly, Beatoven | S27, S29 |
| G21 | Chat-style co-writer ("Chat with Producer", "Co-write with Suno", Mureka Co) | Flow Music, Suno, Mureka | S16, S01, S06 |
| G22 | Native iOS + Android apps with feature parity to web | Treblo, Mureka ("Web & App"), Eleven (iOS app per prior local doc — not re-opened this session, `[UNVERIFIED this session]`) | S21, S06 |

Count: 22 gap items enumerated. Items PMP already exceeds (not gaps): continuous prepare-ahead 3-take queue; 101-parameter Studio; free-for-visitor generation with ad breaks (only Treblo is comparably free, and it has no ads on the surface I read).

# 6 Academic and technical depth records (five primaries; first-pass summaries marked `[PARTIAL]` per R8.2 because appendices were not read line by line — SUPERSEDED 2026-09-05 second pass: all five are now `[FULL]`, see §11.2 and `_sources\2026-09-05-comp-creation-academic-full-records.md`; the `[PARTIAL]` tags on A1–A5 below are the historic first-pass status and are kept unedited)

## A1 — MusicGen: "Simple and Controllable Music Generation" (Copet et al., Meta AI, arXiv 2306.05284) `[PARTIAL]`
1. Problem (authors' framing): text-to-music needs long-range, full-spectrum modelling at 32–48 kHz; prior systems cascade hierarchical models; creators need controls (key, instruments, melody, genre).
2. Method: a single-stage transformer LM over 4 parallel EnCodec codebook streams with a "delay" interleaving pattern (Fig. 1); text conditioning; unsupervised chromagram-based melody conditioning; stereo at no extra cost via 8 codebooks; classifier-free guidance.
3. Real numbers (Table 1, MusicCaps test): MusicGen 1.5B FAD_vgg 3.4, KL 1.23, CLAP 0.32, Ovl 80.74±1.17, Rel 83.70±1.21; 3.3B Ovl 84.81±0.95; MusicLM FAD 4.0, Ovl 80.51, Rel 82.35; Riffusion FAD 14.8. Table 3 stereo: Stereo Partial Delay Ovl 86.73±1.06.
4. Stated limitations: "does not allow us to have fine-grained control over adherence… we rely mostly on CF guidance"; audio conditioning needs augmentation research. Analyst limitation: 32 kHz mono/stereo, ≤30 s generations in the paper.
5. Application to PMP: chromagram/melody conditioning is the mechanism behind competitor "reference audio" (G02); a guidance slider is a legitimate user control (G13) — expose it as "adherence" in the Studio, not as raw CFG.

## A2 — "Stable Audio Open" (Evans et al., Stability AI, arXiv 2407.14358) `[PARTIAL]`
1. Problem: most text-to-audio models are private; open weights on CC-licensed data are needed as baselines.
2. Method: latent diffusion (DiT) over an autoencoder latent, T5 text conditioning, **timing conditioning** for variable-length output; DiT trained 338 h on 64×A100, batch 4, LR 5e-5, latent length 1024 ≈ 47 s.
3. Real numbers (Table 2, Song Describer): Stable Audio Open FD_openl3 96.51, KL 0.55, CLAP 0.41 vs Stable Audio 2.0 71.25/0.37/0.42 vs MusicGen-large-stereo 190.47/0.52/0.31. Table 1 (AudioCaps): SAO FD 78.24.
4. Stated limitations (§6.1): struggles with connector prompts ("and, followed, while…"), cannot generate intelligible speech, "not competitive against state-of-the-art music models", mainly English prompts. 
5. Application: timing conditioning = the mechanism behind "duration control" (Table §4); PMP's ad-break scheduler should request exact durations rather than trimming.

## A3 — "MusicLM: Generating Music From Text" (Agostinelli et al., Google Research, arXiv 2301.11325) `[PARTIAL]`
1. Problem: coarse captions → rich long-form audio with many stems is open; paired text-audio data is scarce.
2. Method: hierarchical seq-to-seq over MuLan (joint music-text) tokens → semantic (w2v-BERT) tokens → acoustic (SoundStream) tokens; 24 kHz; melody conditioning from hummed/whistled input; MusicCaps dataset (5.5k pairs) released.
3. Real numbers (Table 1, MusicCaps): MusicLM FAD_Trill 0.44, FAD_VGG 4.0, KLD 1.01, MCC 0.51, Wins 312; Mubert 0.45/9.6/1.58/0.32/97; Riffusion 0.76/13.4/1.19/0.34/158; reference MusicCaps Wins 472.
4. Stated limitations: "misunderstands negations and does not adhere to precise temporal ordering"; MCC is favourable to their own method; future work: lyrics, song structure (intro/verse/chorus), higher sample rate.
5. Application: negation failure is why negative prompts (G14) exist as a separate field in Lyria 2; PMP's prompt UI should offer explicit "avoid" chips rather than trusting "no drums" in prose. The A-vs-B pairwise rating protocol is the same shape as Flow Music's Turntable (G10).

## A4 — "Seed-Music: A Unified Framework for High Quality and Controlled Music Generation" (ByteDance Seed Team, arXiv 2409.09214) `[PARTIAL]`
1. Problem: vocal music creation is multi-stage and hard for non-experts; evaluation needs expertise.
2. Method: three intermediate representations (audio tokens / symbolic lead-sheet tokens / vocoder latents, Table 1); AR LM Generator + diffusion Renderer; applications Lyrics2Song, Lyrics2Leadsheet2Song (editable melody/rhythm lead sheet), MusicEDiT (lead-sheet-conditioned in-painting to edit lyrics/melody in existing audio), zero-shot singing voice conversion from a 10-second recording.
3. Real numbers: the report presents listening demos, not benchmark tables; Table 1 is qualitative (Compression/Interpretability/Generator-/Renderer-friendly). Stated honestly: no empirical metric table read.
4. Stated limitations (§6 Ethics and Safety): voice impersonation risk → multi-step voice verification, multi-level watermarking, duplication checks. Analyst limitation: closed system, no public API surface opened.
5. Application: lead-sheet editing is the most advanced "edit after generation" affordance seen; a PMP take could expose an editable structure lane (sections/energy) that re-renders only the changed part (G05).

## A5 — "Jukebox: A Generative Model for Music" (Dhariwal et al., OpenAI, arXiv 2005.00341) `[PARTIAL]`
1. Problem: raw-audio music with singing is ~10M samples for 4 minutes at 44.1 kHz; prior models lacked long-range coherence and lyrics.
2. Method: 3-level VQ-VAE + autoregressive transformers; conditioning on artist, genre, timing (position in song) and lyrics; 1.2M-song dataset (600k English) with LyricWiki metadata.
3. Real numbers: "around an hour to generate 1 minute of top level tokens… around 8 hours to upsample one minute" — a human-in-the-loop co-composition loop where "the top-level model generates multiple samples, the person picks a favorite… and then the model continues generating multiple samples".
4. Stated limitations: speed; babbling vocals without lyrics conditioning.
5. Application: the 2020 "generate several, pick one, continue" loop is the ancestor of PMP's 3-take queue; PMP's contribution is making it continuous and passive (listen/skip instead of pick), which no 2026 product surfaced this session does.

# 7 Source register (one row per underlying work; all retrieved 2026-09-05 16:06–16:13 UTC+3; captures under `docs\research\_sources\2026-09-05-comp-creation-*`)

| ID | Title / surface | Organisation | URL | Class | Read | Capture (sha256 prefix) |
| --- | --- | --- | --- | --- | --- | --- |
| S01 | Suno Pricing (plan bullets, feature matrix; Free "$0/month, 50 credits renew daily (10 songs), No monthly song downloads, No commercial use") | Suno | https://suno.com/pricing | first-party | FULL (text; Pro/Premier $ rendered at checkout) | suno-pricing.html aae13c9c… 231,580 B |
| S02 | "Is Suno AI Music Software Worth the Monthly Subscription?" (Pro from $8/mo, Premier from $24/mo, 20% annual) | Suno | https://suno.com/hub/ai-music-software | first-party | FULL | suno-hub-ai-music-software.html ab170534… |
| S03 | Suno home FAQ (10 songs/day free; Pro 500 songs/mo; Premier 2,000 songs/mo, Studio, MIDI export) | Suno | https://suno.com/ | first-party | PARTIAL (search-indexed FAQ text) | — |
| S04 | Credits and credit limits | Udio | https://help.udio.com/en/articles/10739134-credits-and-credit-limits | first-party help | FULL | udio-help-credits.html dbebe314… |
| S05 | Changes associated with the UMG partnership (2026-02-17) | Udio | https://help.udio.com/en/articles/12683565-… | first-party help | FULL | udio-help-umg-changes.html bd22997f… |
| S06 | Subscribe / Compare Plans page (features; prices JS-only) | Mureka (Kunlun) | https://www.mureka.ai/subscribe | first-party | PARTIAL | mureka-subscribe.html 5b4bf909… |
| S07 | API Platform FAQ | Mureka | https://platform.mureka.ai/docs/en/faq.html | first-party | FULL | mureka-api-faq.html aeb84b7f… |
| S07b | Mureka prices Pro $9 / Premier $27, 5,000 / 20,000 Gold, annual $7.17 / $21.59 | future-stack-reviews.com; musicproductionwiki.com; melodycraft.app | (three third-party pages, Q6) | third-party | PARTIAL | `[single-source third-party]` (one provenance family: all cite the JS pricing page) |
| S08 | Pricing (Free $0 10k cr; Starter $6 30k; Creator $22 121k; Pro $99 600k; Scale $299 1.8M; Business $990 6M; Music 900 cr/min; rollover ≤2 months) | ElevenLabs | https://elevenlabs.io/pricing | first-party | FULL | elevenlabs-pricing.html 8fd0d26e… |
| S09 | Eleven Music API page | ElevenLabs | https://elevenlabs.io/eleven-music-api | first-party | PARTIAL (search text) | elevenlabs-music-api.html d71f03ed… |
| S10 | Docs: Eleven Music (v2, Audio Reference, Finetunes, 3 s–5 min) | ElevenLabs | https://elevenlabs.io/docs/overview/capabilities/music | first-party docs | FULL | — |
| S11 | Stable Audio Pricing (Solo $12 660 cr; Session $30 1,800; Producer $90 6,000; Studio $199 14,000; enterprise >$1M revenue) | Stability AI | https://stableaudio.com/pricing | first-party | FULL | stableaudio-pricing.html 037a8d99… |
| S12 | Stable Audio 3.0 product page | Stability AI | https://stability.ai/stable-audio | first-party | PARTIAL | stability-stable-audio.html cc122c1a… |
| S13 | User guide: audio-to-audio upload allowances | Stability AI | https://stableaudio.com/user-guide/audio-to-audio | first-party | PARTIAL (redirected to /docs on capture) | stableaudio-userguide-a2a.html d54dce1b… |
| S14 | SOUNDRAW pricing (Creator $16.99/$11.04; Artist Starter $29.99/$19.49; Artist Pro $35.99/$23.39; Artist Unlimited $50/$32.50; Enterprise) | Soundraw | https://soundraw.io/pricing | first-party | FULL | soundraw-pricing.html 19f7faa9… |
| S15 | Mubert Render pricing (Ambassador free 25 tracks; Creator $14/$11.69; Pro $39/$32.49; Business $199/$149.29) | Mubert | https://mubert.com/render/pricing | first-party | FULL | mubert-render-pricing.html ccfac7a9… |
| S15b | Mubert API use-case pages (WebRTC realtime, 150+ genres, 12k library, 25-min mixes) | Mubert | https://mubert.com/api/use-cases/developers | first-party | PARTIAL | mubert-api-developers.html d0bfd91f… |
| S16 | Google Flow Music home (Lyria 3.5, Producer chat, Veo videos, vibe-code, publish) | Google | https://www.producer.ai/?from-riffusion=true → flowmusic.app | first-party | FULL | producer-ai-home.html bcabb252… |
| S17 | Google Flow Music pricing (Free; Starter $8 3,000 cr; Plus $24 10,000; Member $64 30,000; concurrency 2/8/12/16) | Google | https://www.flowmusic.app/pricing?plan=monthly | first-party | FULL | flowmusic-pricing.html 3b4c7e86… |
| S18 | Manage your AI credits & Google Flow Music subscription plan (AI Plus→Starter, Pro→Plus, Ultra→Member; Turntable) | Google | https://support.google.com/flow/answer/17083870 | first-party help | FULL | google-flow-help-credits.html e5185e85… |
| S19 | Lyria API (`lyria-002`, $0.06 per 30 s, negative_prompt, SynthID) | Google Cloud | https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/lyria-music-generation | first-party docs | PARTIAL | gcloud-lyria-api.html 691e2683… |
| S20 | Real-time music generation using Lyria RealTime (updated 2026-06-01) | Google AI for Developers | https://ai.google.dev/gemini-api/docs/realtime-music-generation | first-party docs | PARTIAL | google-lyria-realtime-docs.html 70d74573… |
| S21 | Treblo home (free, 4,160 styles, ~15 s streaming, iOS/Android, comparison table) | Treblo (ex-Sonauto) | https://treblo.com/ | first-party | FULL | treblo-home.html 4967adf3… |
| S21b | Treblo developer pricing (Starter $11 20k; Pro $88 160k; Scale $330 660k; Enterprise $1,150 2.875M; 100 cr/song) | Treblo | https://treblo.com/developers/pricing | first-party | FULL | treblo-dev-pricing.html 21f984b7… |
| S22 | AIVA pricing (Free €0; Standard €11/mo annual; Pro €33/mo annual) | AIVA | https://www.aiva.ai/pricing | first-party | FULL | aiva-pricing.html 8c8ce3bd… |
| S23 | Kits.ai pricing (Free; Starter $10; Producer $30; Professional $60) | Kits AI | https://www.kits.ai/pricing | first-party | FULL | kits-pricing.html c98f2093… |
| S24 | Introducing Pika Music (2026-08-18) | Pika | https://experiment.pika.art/blog/pika-music | first-party blog | FULL | pika-music-blog.html d65736c5… |
| S25 | Everything You Want to Hear (Pika audio models) | Pika | https://experiment.pika.art/blog/pika-audio-models | first-party blog | PARTIAL | pika-audio-models-blog.html 4209d05c… |
| S26 | Alibaba launches HappyShrimp 1.0 (2026-08-18) | Music Business Worldwide | https://www.musicbusinessworldwide.com/alibaba-launches-ai-song-generator-happyshrimp-1-0-… | secondary press | FULL | mbw-alibaba-happyshrimp.html ad8fe844… |
| S27 | Adobe Firefly expands its creative AI studio (2026-08-20) | Adobe | https://blog.adobe.com/en/publish/2026/08/20/… | first-party blog | PARTIAL (search text) | — |
| S28 | Boomy pricing ($9.99 Creator / $29.99 Pro, 250 downloads) | costbench.com; posteverywhere.ai | (Q8) | third-party | PARTIAL | `[single-source third-party]`; boomy-pricing.html c74e33ab… is a 1,575-byte JS shell |
| S29 | Beatoven.ai home (Maestro Music, Text-to-SFX, download minutes, license per download) | Beatoven | https://www.beatoven.ai/ | first-party | FULL | beatoven-home.html 25c9a8d1… |
| S29b | Beatoven prices (Free; Creator $10/mo, $100/yr, 30 min; Visionary $20/mo, $200/yr, 60 min; PAYG $3/min) | costbench.com; apis.io | (Q8) | third-party | PARTIAL | `[single-source third-party]` |
| S30 | Loudly home (Generator, Text to music, Remixer, API, SongDNA) | Loudly GmbH | https://www.loudly.com/ | first-party | FULL | loudly-home.html dea6c7f3… |
| S30b | Loudly prices (Free; Personal $14.99/mo or $5.99 annual; Pro $39.99/mo or $14.99 annual; 3,000 tracks/mo) | costbench.com; posteverywhere.ai | (Q8) | third-party | PARTIAL | `[single-source third-party]` |
| A1–A5 | five arXiv primaries (§6) | Meta / Stability / Google / ByteDance / OpenAI | arXiv 2306.05284, 2407.14358, 2301.11325, 2409.09214, 2005.00341 | academic | PARTIAL | paper-*.txt (bec711ae…, b5965a19…, f612f538…, 506ad6c8…, 32d427fb…) |

**Counts (R11):** independent authoritative sources (distinct organisations/works, primaries opened) = 31 (26 product/first-party organisations or works S01–S30 excluding third-party rows, + 5 academic); academic = 5; academic `[FULL]` = 0 (honest: `[PARTIAL]`); primary `[FULL]` (product surfaces read end-to-end) = 17 (S01, S02, S04, S05, S07, S08, S10, S11, S14, S15, S16, S17, S18, S21, S21b, S22, S23, S24, S26, S29, S30 → 21 rows, of which 17 first-party). Third-party-only rows: 4 (S07b, S28, S29b, S30b).

# 8 Claim ledger (load-bearing claims; independence = distinct producer/provenance)

| claim_id | Claim | A | B | C | Status |
| --- | --- | --- | --- | --- | --- |
| C01 | Suno Pro = $10/mo ($8 annual), 2,500 credits; Premier = $30/mo ($24 annual), 10,000 credits | S02 (Suno hub: $8/$24 annual) + S01 (credits) | Chartlex Q2 ("verified July 11, 2026 at suno.com/pricing") | aitoolspolice / undetectr Q4 | **3+ verified** (monthly $ is third-party ×2 + first-party annual; disclosed) |
| C02 | Suno free = 50 credits/day (10 songs), no downloads, no commercial use; paid download caps 20/60 per month from 2026-09-03 | S01 | S03 (home FAQ) | RightAIChoice Q4 | **3+ verified** |
| C03 | Udio downloads (audio, video, stems) disabled since 2025-10-29; Standard 2,400 / Pro 6,000 credits | S05 | S04 | Chartlex Q2; artifactr Q5 | **3+ verified** |
| C04 | ElevenLabs plans $0/$6/$22/$99/$299/$990; Music 900 credits/min; commercial music use from Starter | S08 | S10 | Chartlex Q2 ("from the $6 per month Starter plan") | **3+ verified** |
| C05 | Google Flow Music = ex-Producer.ai/Riffusion; plans $8/$24/$64 with 3k/10k/30k credits; AI Plus/Pro/Ultra mapping; Turntable | S16 (producer.ai redirect) | S17 | S18; whataidoineed Q11 | **3+ verified** |
| C06 | Stable Audio hosted plans Solo $12 / Session $30 / Producer $90 / Studio $199 with 660/1,800/6,000/14,000 credits | S11 | — | — | `[single-source official]` — CONTRADICTS third-party review (Pro $11.99 / Studio $29.99 / Max $89.99 by tracks) and the user-guide tier names Free/Pro/Studio/Max [S13]; first-party pricing page is newest → third-party marked STALE |
| C07 | Lyria 2 API $0.06 per 30 s; Lyria RealTime params (guidance, bpm, scale, modes) | S19 | S20 | CometAPI Q9 | **3+ verified** (prices); params `[single-source official]` |
| C08 | Treblo (ex-Sonauto) consumer app free without daily limits; API $11/$88/$330/$1,150 | S21 | S21b | vouchaitools / aitoolnotes / tunesona Q10 | **3+ verified** |
| C09 | Mureka Pro ≈ $9/mo 5,000 Gold, Premier ≈ $27/mo 20,000 Gold; Premier unlocks 12 stems, MIDI/WAV, Studio, voice | S06 (features only) | S07b (3 third-party pages, one provenance family) | — | features **first-party**; prices `[single-source third-party]` |
| C10 | Soundraw Creator $16.99 / Artist Starter $29.99 / Artist Pro $35.99 / Artist Unlimited $50 (annual $11.04/$19.49/$23.39/$32.50) | S14 | Cinevva Q1 ("~$17/mo") | — | `[single-source official]` + 1 corroboration |
| C11 | AIVA Free €0 / Standard €11 / Pro €33 (annual) | S22 | MUSICΔ Q2 (€11/€33) | RightAIChoice Q4 ("AIVA starts around $11/mo") | **3+ verified** |
| C12 | Mubert Render Free / $14 / $39 / $199 (annual $11.69/$32.49/$149.29); no DSP publishing | S15 | costbench Q8 ("Mubert Free–$199/month") | posteverywhere Q8 ("~$14/mo") | **3+ verified** |
| C13 | Kits.ai Free / $10 / $30 / $60 | S23 | — | — | `[single-source official]` |
| C14 | Pika Music launched 2026-08-18; inputs text/lyrics/voice-ref/music-ref; up to 6 min | S24 | S25 | — | `[single-source official]` (two pages, one provenance family) |
| C15 | Alibaba HappyShrimp 1.0 beta 2026-08-17 with Taihe Music | S26 | runtimewire Q3 (cites Bloomberg) | aimusicpreneur Q3 | **3+ verified** (all secondary; no Alibaba first-party page opened) |
| C16 | Adobe Firefly Generate Music GA 2026-08-20 | S27 | aimusicpreneur Q13 | — | 2 sources; `[single-source official]` + 1 |
| C17 | Boomy $9.99 / $29.99; Beatoven $10 / $20 / $3 per min; Loudly $14.99 / $39.99 | S28, S29b, S30b | — | — | `[single-source third-party]` — first-party pages 404 or JS-only |

Counts: 3+ verified = 10 (C01–C05, C07, C08, C11, C12, C15); single-source (official or third-party, disclosed) = 7 (C06, C09, C10, C13, C14, C16, C17); unverified = 2 (Ecrett, Tad AI prices — snippet only, §2).

# 9 Contradictions, corrections, freshness

| # | Contradiction | Resolution |
| --- | --- | --- |
| X1 | Stable Audio tiers: first-party pricing page says Solo/Session/Producer/Studio with credits [S11]; third-party review (amrytt, Q7) and the first-party user guide [S13] say Free/Pro/Studio/Max with track counts. | The pricing page is the live commercial surface; user guide + review are STALE. Preserved, not averaged. |
| X2 | Suno commercial ownership: RightsDocket (Q2) says Suno "assigns all of its right, title, and interest" to paid users; two 2026 reviews (Q12) say terms now read "generally not considered the owner" with "commercial use rights". | Both preserved; Suno's own pricing page says only "Commercial use rights for new songs made" [S01]. Ownership wording → `[UNVERIFIED]` pending a read of Suno ToS. |
| X3 | Suno credits per song: hub says 2,500 credits = "roughly 500 songs" [S02]; undetectr says 5 credits/song (Q4). | Consistent (2,500/5 = 500). No conflict. |
| X4 | Udio plan prices: aggregators say $10/$30 (Q2, Q5) but the first-party Stripe table was unreadable [F2]. | Prices `[single-source third-party]`; credits first-party [S04, S05]. |
| X5 | Sonauto: one review says "No free plan" (tad.ai Q10) vs Treblo home "it's actually free… No daily limits" [S21]. | First-party wins; tad.ai claim marked wrong/STALE. |

Freshness horizon: every price above is dated 2026-09-05 and should be re-opened before any pricing decision (R16.4). Suno's download caps start 2026-09-03 [S01]; Udio's transition state is dated 2026-02-17 [S05]; Lyria RealTime doc updated 2026-06-01 [S20].

# 10 Known gaps and un-swept names (honest)

- Un-swept / not opened first-party this session: Splash Pro, Amper (Shutterstock), Lemonaide, Ecrett, Tad AI, Boomy (JS shell), Beatoven pricing page (404), Loudly pricing page (404), Udio pricing table (Stripe JS), Mureka price figures (JS), Sonauto/Treblo consumer pricing (Cloudflare block on `/pricing`; home page captured instead), ACE-Step / YuE / DiffRhythm 2 / Magenta RealTime repos, Meta audiocraft repo licence, Google Gemini-app Lyria 3 consumer surface, ElevenMusic iOS app listing, App Store / Google Play listings for every mobile app, Suno ToS text, Endel / brain.fm / Soundful / Uppbeat / Artlist, Tencent Music AI, Kunlun's own investor material, Sonilo pricing.
- Academic floor NOT MET as `[FULL]` (see banner). Access failures recorded separately from non-existence in §1.
- Time: 60-minute limit reached at the writing stage; discovery stopped before saturation (marginal yield of the last round was still >0).

# 11 Second pass (follow-up, 2026-09-05 16:30–16:58 UTC+3) — extends §1, §6, §7, §8, §9, §10; nothing above was deleted

Scratch record of every measurement behind this section: `docs\research\_sources\2026-09-05-comp-creation-followup-findings.md`; five-part academic records: `docs\research\_sources\2026-09-05-comp-creation-academic-full-records.md` (23,779 B, 40 lines, 5 `## A1–A5 [FULL]` headings measured).

## 11.1 Query ledger extension (§1 cont.)

| Q# | Query / fetch | Time (UTC) | Outcome |
| --- | --- | --- | --- |
| Q14 | arXiv HTML full text of 2306.05284, 2407.14358, 2301.11325, 2409.09214, 2005.00341 (every section incl. appendices) | 13:2x–13:47 | 5 captures `paper-*.txt` 65,792 / 35,533 / 59,945 / 80,419 / 83,793 B = 325,482 B read |
| Q15 | iTunes Lookup/Search API for Suno, Udio, Google Flow Music, ElevenMusic, Mubert, Treblo, Stable Audio | 13:48 | 6 JSON hits; Stable Audio: no iOS app returned |
| Q16 | apps.apple.com listings (us/gb) + play.google.com Suno | 13:48–13:49 | Suno US 200, Flow Music 200, Treblo GB 200, ElevenMusic **429 ACCESS FAILURE**, Play Suno 200 |
| Q17 | GitHub API repo + releases/latest for ace-step/ACE-Step, facebookresearch/audiocraft, ASLP-lab/DiffRhythm, magenta/magenta-realtime, multimodal-art-projection/YuE | 13:49 | 5 repo JSON |
| Q18 | `mureka.ai/pricing` (404), `beatoven.ai/pricing` (404), `loudly.com/music/pricing` (200 JS shell), `boomy.com/pricing` (200 JS shell, no fetch URL in HTML), `sonauto.ai/pricing` (404 → treblo.com) | 13:50 | recorded per item in 11.3 |
| Q19 | WebSearch "Mureka pricing 2026 Pro Premier Gold credits", "Beatoven.ai pricing 2026 Creator Visionary", "Loudly pricing 2026 Personal Pro", "Boomy pricing 2026 Creator Pro", "Splash Pro AI music status 2026", "Suno terms of service ownership output" | 13:50–13:51 | aggregator rows 11.3 |
| Q20 | "Amper Music Shutterstock AI music generator 2026 status discontinued"; "Lemonaide AI music generator 2026 pricing status BeatStars"; "Gemini app Lyria 3 generate music free users limits 2026 official" | 13:51–13:52 | first-party hits captured Q21 |
| Q21 | Fetch blog.google/…/better-tracks-lyria-gemini (200, 389,154 B), support.google.com/gemini/answer/16275805 (200), …/14620100 (200), beatstars.com/studio/lemonaide (200, 95,995 B) | 13:52–13:53 | S31–S34 |
| Q22 | "Ecrett Music pricing 2026"; "Tad AI music generator pricing 2026"; "Tencent Music Entertainment AI song generation 2026 consumer product"; "Endel pricing 2026 free version"; "brain.fm pricing 2026"; "Endel brain.fm Soundful Uppbeat Artlist pricing 2026 free plan ads" | 13:53 | 11.3 rows; last query returned NO highlights for Soundful/Uppbeat/Artlist |
| Q23 | Fetch soundful.com/pricing (200, 89,688 B), uppbeat.io/pricing (**429 ACCESS FAILURE**, 32,184 B), artlist.io/pricing (200 → /page/pricing/max, 696,330 B) | 13:54 | S35–S37 |
| Q24 | Regex sweep `\bads\b|ad-supported|advertis|sponsor` over 47 non-paper captures (all first-party/aggregator HTML on disk) | 13:55 | 0 hits describing an ad-supported tier; see 11.5 |

## 11.2 Academic floor — A1–A5 promoted from `[PARTIAL]` to `[FULL]`

All five arXiv HTML full texts were read section by section including appendices (325,482 B of captured text, Q14). The complete five-part records (problem in the authors' framing; method with equations/algorithm/assumptions; real numbers from the tables; stated limitations; concrete application to PMP's one-prompt → 3-take → prepare-ahead listening flow) are written in `docs\research\_sources\2026-09-05-comp-creation-academic-full-records.md` and supersede the §6 summaries, which are kept as written. What the full read added beyond §6, per paper:

- **A1 MusicGen `[FULL]`** — appendices give the codebook-pattern ablation (delay vs flattening vs parallel) and the human-study protocol (Ovl/Rel, 5-point scale, ≥ 1,000 ratings); the single-stage model makes a 30-s take in one pass — the mechanism that lets a 3-take request be batched as one conditioned decode with three seeds, which is how PMP's prepare-ahead queue should call any MusicGen-class engine.
- **A2 Stable Audio Open `[FULL]`** — A1–A6.1 read: 486k CC-licensed training clips, 44.1 kHz stereo up to 47 s, DiT + autoencoder; the licence/rights appendix is the primary reason its output is safe for a free, ad-funded surface; latency table (≈ 8 s for 47 s on an H100) sets the ceiling for "next take ready before this one ends".
- **A3 MusicLM `[FULL]`** — hierarchical semantic → acoustic tokens, MusicCaps 5.5k captions, melody conditioning appendix; the paper's own memorisation study (≈ 1 % exact-match tokens) is the citable basis for a provenance/dedupe check before a take is served publicly at `/t/<id>`.
- **A4 Seed-Music `[FULL]`** — three routes (AR token, diffusion, vocoder), lyrics-to-song, singing-voice conversion, and *post-generation editing* (lyric/melody edit while keeping the rest): the editing route is the frontier form of G05 and is what a "keep this take, change one line" control on PMP's player should call.
- **A5 Jukebox `[FULL]`** — appendices A–H: VQ-VAE codebook collapse fixes (random restarts), top-level prior sampling cost (≈ 9 h for 1 min in 2020) and the "primed" continuation mode; its "generate several, pick, continue" loop is the documented ancestor of PMP's 3-take queue, which PMP turns from an active pick into a passive listen/skip.

Academic counts after this pass: academic = 5; academic `[FULL]` = 5 (floor ≥ 5 **MET**).

## 11.3 Unswept items closed (extends §10; NOT FOUND rows carry the exact query)

| Item | Status this pass | Evidence (source ID / capture / query) |
| --- | --- | --- |
| Splash Pro | **RETIRED 2024-04-22** — exclude from live set | toolpilot.ai quoting vendor notice; aimusicpreneur 2026-05-20 ("retired… creation via Alexa Skill and in-game"); soundverse blog; musically 2023-09-19 historic tiers $10 / $49 (Q19) → S38 `[secondary ×3, vendor notice relayed]` |
| Amper / Shutterstock | **DISCONTINUED as standalone** — folded into Shutterstock Music | Shutterstock investor release 2020-11-11 "acquisition of certain assets from Amper Music" (first-party) + 4 aggregators (2026); ampermusic.com legacy FAQ still online; an unrelated iOS app "Amper Music: AI Song Generator" shares the name (Q20) → S39 |
| Lemonaide | **LIVE, owner BeatStars since Jan 2026**; adjacent (MIDI/loop "Seeds", not full-song) | beatstars.com/studio/lemonaide capture 95,995 B (S33) + help.beatstars.com: Starter 50 seed credits/mo, Professional 250/mo; Collab Club $4.99/model/mo (Professional) or $9.99 (others), 150 credits/model/mo, **no rollover**; aimusicpreneur 2026-07-16 says $9.99/mo 150 credits **with rollover** → X6 |
| Ecrett Music | prices `[single aggregator]` — first-party page not fetched | toolmage.com (en/zh/fr mirrors, data 2026-06-15): Free $0 watermarked; Individual $4.99/mo annual; Business $14.99/mo annual (Q22) → S40 |
| Tad AI | entry price **first-party**; tier table `[single aggregator]` | tad.ai/hub "starting at only $8 per month"; bestfor.ai (2026-06-11): Free non-commercial; Standard $10/mo or $8 annual = 500 credits ≈ 100 songs, 3 concurrent; upper tier $30/mo or $25 annual = 3,000 credits ≈ 600 songs, 6 concurrent; V2.0 reference-audio upload (Q22) → S41 |
| Boomy | prices `[aggregator ×4 agree]`; first-party JS shell exposes **no pricing endpoint** (grep `fetch|json|api|src=` NO MATCH in 1,575 B) | Free 25 saves + 1 release; Creator $9.99/mo (500 saves, 3 releases/mo, 10 MP3); Pro $29.99/mo (unlimited saves, 10 releases, commercial); annual −17 % (costbench 2026-06-05, propicked, toolchase, melodycraft) (Q18, Q19) → S28 upgraded from ×2 to ×4 |
| Beatoven pricing | first-party `/pricing` **404** (5,890 B); prices `[aggregator ×5 agree]` | Free 5 generations; Creator $6/mo 15 min; Visionary $10/mo 30 min; $20/mo 60 min; PAYG $3/min; API on request (apis.io, toolchase Aug 2026, aitrendtool 2026-07-23, saasworthy, soundraw blog) (Q18, Q19) → S29b **CORRECTED**: earlier row said Creator $10 / Visionary $20; the five agreeing sources give $6 / $10 / $20 by minutes → X7 |
| Loudly pricing | first-party `/music/pricing` **200 but JS-rendered** (17,586 B, no `$`); prices `[aggregator ×3 agree, ×1 contradicts]` | Personal $10/mo or $8 annual = 2,500 credits; Pro $30/mo or $24 annual = 10,000 credits; Free 30-s cap + 1 download/day (aitoolscoop, toolchase, saasworthy 2025-09-18); costbench 2026-04-24 says $14.99 / $39.99 (Q18, Q19) → S30b **CORRECTED** to $10 / $30 majority; X8 preserved |
| Mureka prices | first-party `/pricing` **404**; `/subscribe` JS shell (features only); prices `[aggregator ×4 agree]` | Free 50 Gold/day; Pro $9/mo or $86/yr = 5,000 Gold; Premier $27/mo or $259/yr = 20,000 Gold; "SAVE 20 % yearly" text is first-party (toolchase 2026-08-02, melodycraft, toolporto, tunesona) (Q18, Q19) → S07b upgraded ×3 → ×4 |
| Sonauto `/pricing` | **404 → redirects to treblo.com/pricing** (not Cloudflare); rebrand confirmed | `sonauto-pricing-retry.html` (Q18); consumer pricing = Treblo S21 |
| ACE-Step / YuE / DiffRhythm / Magenta RT / audiocraft repos | measured from GitHub API JSON (stars = non-quality signal) | ACE-Step **Apache-2.0**, 4,801★, pushed 2026-02-15; YuE **Apache-2.0**, 6,415★, pushed 2025-06-04; DiffRhythm **Apache-2.0**, 2,338★, pushed 2025-11-27 (DiffRhythm 2 lives in the same repo); magenta-realtime **Apache-2.0**, 1,786★, latest release **v2.0.3 2026-07-30**; facebookresearch/audiocraft code **MIT**, 23,608★, pushed 2026-03-03 — model-weights licence (LICENSE_weights, CC-BY-NC) **not read this session → `[UNVERIFIED]`** (Q17) → S42–S46 |
| Gemini-app Lyria consumer surface | **FIRST-PARTY, 2026-09-04 — newest fact in the sweep**: Lyria **3.5** in the Gemini app for all users globally (web + mobile), genre select/describe, vocal/instrumental, templates, short or longer tracks; also in Flow Music, AI Studio, Vids | blog.google capture 389,154 B (S31); support.google.com/gemini/16275805: compute-based limits since 2026-05-17, AI Plus 2×, Pro 4×, Ultra 5×/20×; music "consumes more" (S32); Workspace table 30-s tracks 10/10/50/60/100 per day, ≤ 3-min tracks 5/5/20/30/50 per day (S32b) (Q21) |
| Suno ToS ownership (X2) | **partially resolved from first-party**: user keeps ownership of *Submissions* (inputs); the Free-vs-Paid *output* ownership split is **not** in the captured ToS text | `suno-terms.html` grep: "Nothing in these Terms of Service transfers or assigns to Suno any ownership interest in your Submissions…" (Q19) |
| Endel | adjacent functional-music vendor; free tier **time-capped (≤ 10-min sessions), not ad-supported** | apps.apple.com id1346247457 IAP list ($2.99–$19.99/mo, $34.99–$119.99/yr, Lifetime $124.99) + endel.zendesk.com help (first-party); brain.fm blog claims Endel $14.99/mo → X9 (Q22) → S47 |
| brain.fm | trial-only ($14.99/mo 7-day trial; $99.99/yr 14-day trial); no free tier, no ads | brain.fm blog (first-party) + neurobeatx (Q22) → S48 |
| Soundful | pricing page captured (89,688 B); tier prices are JS-rendered (regex for `$` next to tier names NO MATCH); text confirms Business/Enterprise tiers, "TV shows and TV ads" licence scope | soundful.com/pricing (Q23) → S35; prices **NOT FOUND in HTML** — query used: `Endel brain.fm Soundful Uppbeat Artlist pricing 2026 free plan ads` (no highlight returned) |
| Uppbeat | **ACCESS FAILURE 429** on uppbeat.io/pricing (32,184 B challenge page) | (Q23) → S36; prices **NOT FOUND** — same query as above, no highlight returned |
| Artlist | captured (696,330 B): AI plans by monthly credits — AI Starter 7,500 cr (voiceover only) → from 16,500 cr adds music; AI Creator/Professional/Pro Plus 80,000–4,000,000 cr; Max 7,500–120,000 cr incl. stock; Max Business; **dollar prices JS-rendered, not in HTML** | artlist.io/page/pricing/max (Q23) → S37 |
| Tencent Music AI | **LIVE (China)**: QQ Music in-app "AI做歌 / 启明星·AI作歌", modes 极速/歌词/图片, **pay-per-song ¥5–¥8** by mode, 3–5 min generation, publish to QQ Music; TME Venus platform (y.qq.com/venus) AI Songwriter + DeepSeek-R1 lyrics; 琴乐 model (Tencent AI Lab + 天琴 Lab) | musicbusinessworldwide (TME ESG relay), aiproducthub.cn (zh aggregator), developer.cloud.tencent.com, news.aibase (Q22) → S49 `[no first-party consumer page fetched; prices single aggregator zh]` |

## 11.4 Store-listing evidence (IMAGE-BACKED vs TEXT-DERIVED; details also in the ui-and-menus file §7)

| Product | Apple iTunes Lookup (first-party JSON) | Store HTML measured | IAP tiers read from listing text | UI claim status |
| --- | --- | --- | --- | --- |
| Suno | 6 iPhone screenshots; Free; v1.87.0; first release 2024-07-01 | App Store US 200 (privacy label "Developer's Advertising or Marketing"); Google Play 200: **6 screenshots**, "Updated on Sep 1, 2026", **10M+ downloads**, IAP flag, no "Contains ads" badge | Pro Plan $10.00 / Premier Plan $30.00 monthly; Pro $96.00 / Premier $289.00 yearly; 500 cr $4.00, 1,000 cr $8.00, 2,000 cr $16.00, 4,000 cr $30.00; 1 Download Credit $2.99 / $4.99 (USD) | **IMAGE-BACKED for screenshot count (6 + 6)**; surfaces shown remain **TEXT-DERIVED** (image files were not opened) |
| Udio | 5 iPhone + 2 iPad screenshots; Free; v0.22.0; first 2025-05-21 | listing HTML not captured | not read (Apple JSON carries no IAP list) | IMAGE-BACKED count / surfaces TEXT-DERIVED |
| Google Flow Music | 6 iPhone screenshots; Free; v1.2.549; first 2026-05-18 | App Store 200, "Version 1.2.549 3d ago" | Starter $7.99 mo / $70.99 yr; Plus $24.99 mo / $214.99 yr; Member $64.00 mo / $569.99 yr; 1,000 credits $5.99 (USD) — **App Store prices differ from web S17 ($8 / $24 / $64)** → X10 | IMAGE-BACKED count / surfaces TEXT-DERIVED |
| ElevenMusic (ElevenLabs) | 6 screenshots; Free; v1.2.3; first 2026-04-01 | App Store **429 ACCESS FAILURE** | not read | IMAGE-BACKED count (JSON) / surfaces TEXT-DERIVED |
| Mubert | 5 screenshots; Free; v4.2.2; first 2016-09-23 ("Mubert: AI Music Streaming"; name shared by several apps) | not captured | not read | IMAGE-BACKED count / surfaces TEXT-DERIVED |
| Treblo | 6 screenshots; Free; v1.5.1; first 2026-07-06 | App Store GB 200: **no In-App Purchases block in listing text** (consistent with "free, no daily limits" S21); privacy label "Developer's Advertising or Marketing" | none listed | IMAGE-BACKED count / surfaces TEXT-DERIVED |
| Stable Audio | **no iOS app returned** by iTunes Search (Q15) — web-only | — | — | TEXT-DERIVED (web docs S11–S13) |

Honest boundary: screenshot **counts** are measured from Apple/Google JSON and HTML; the **content** of the screenshots (create panel, takes list, player, library) was not rendered or viewed by this agent, so every "surfaces shown" statement in the ui-and-menus file stays TEXT-DERIVED. 0 of 7 products reach IMAGE-BACKED for surfaces.

## 11.5 Ad-supported free tier check (T4) — the owner's one claimed-unique axis

Method: (a) 47 non-paper captures swept with `\bads\b|ad-supported|advertis|sponsor` (Q24); (b) Google Play Suno listing checked for the "Contains ads" badge; (c) first-party free-tier descriptions re-read for Suno, Udio, Flow Music, ElevenLabs, Mureka, Treblo, Stable Audio, Soundraw, AIVA, Mubert, Kits, Loudly, Beatoven, Endel, brain.fm, Gemini app.

| Competitor | Free tier mechanism (first-party) | Ads on free tier? | Evidence |
| --- | --- | --- | --- |
| Suno | 50 credits/day, no downloads, no commercial use | **No ad found** | S01; Play listing: no "Contains ads" badge; only privacy label "Developer's Advertising or Marketing" (data-use disclosure, not an ad unit) |
| Udio | credit cap; downloads disabled | No ad found | S04, S05 |
| Google Flow Music / Gemini app | credits; compute-based limits; Turntable listener-labour loop | No ad found | S17, S18, S31, S32 |
| ElevenLabs | 10k credits/mo free | No ad found | S08 |
| Treblo | free, no daily limits ("Free means free here. Most AI music sites advertise a 'free' tier…" = marketing copy about *other* sites' limits, not ads) | No ad found | S21 grep hit read in context |
| Stable Audio, Soundraw, AIVA, Mubert, Kits, Mureka | credit/track caps, watermark or licence restriction | No ad found | S11, S14, S22, S15, S23, S06 |
| Loudly, Beatoven, Boomy | 1 download/day, 5 generations, 25 saves | No ad found | S30, S29, aggregators |
| Endel, brain.fm | ≤ 10-min sessions / trial-only | No ad found | S47, S48 |
| Tencent QQ Music AI做歌 | pay-per-song ¥5–¥8 | not determinable from aggregator text | S49 |

**Verdict:** across 47 captured first-party/aggregator surfaces there are **0 explicit statements** of an ad-supported (audio or display) free tier, and 0 "Contains ads" badges in the store HTML captured. This is an **absence measured in captured text**, not three positive confirmations that "no competitor runs ads"; it therefore stays **FLAGGED `[ABSENCE-BASED, 0/3 positive confirmations]`** per the owner's rule. What would upgrade it: three independent industry sources stating "no major AI-music generator monetises free users with ads", or a per-app check of the Google Play "Contains ads" badge for every listed Android app (only Suno's Play page was captured).

## 11.6 Source register extension (§7 cont.) — S31–S49, plus upgrades to S07b, S28, S29b, S30b

| ID | Title / surface | Organisation | URL | Class | Read | Capture (sha256 prefix, bytes) |
| --- | --- | --- | --- | --- | --- | --- |
| S31 | "Create your best tracks yet with Lyria 3.5 in Gemini" (2026-09-04) | Google | https://blog.google/innovation-and-ai/products/gemini-app/better-tracks-lyria-gemini/ | first-party blog | FULL | google-blog-lyria35-gemini.html 51017b1e… 389,154 B |
| S32 | Gemini app usage limits (compute-based since 2026-05-17; Plus 2×, Pro 4×, Ultra 5×/20×) | Google | https://support.google.com/gemini/answer/16275805 | first-party help | FULL | google-gemini-limits-16275805.html 91df6ba6… 1,640,947 B |
| S32b | Gemini for Workspace feature-limit table (music 30-s / ≤ 3-min per-day caps by edition) | Google | https://support.google.com/gemini/answer/14620100 | first-party help | PARTIAL (table row grepped) | google-gemini-workspace-limits-14620100.html c027dc96… 1,627,657 B |
| S33 | Lemonaide inside BeatStars Studio (Seeds, Collab Club credits) | BeatStars (owner since Jan 2026) | https://www.beatstars.com/studio/lemonaide | first-party | FULL | beatstars-lemonaide.html 548c3c08… 95,995 B |
| S34 | Shutterstock acquires certain assets from Amper Music (2020-11-11) | Shutterstock IR | investor.shutterstock.com (search-surfaced) | first-party release | PARTIAL (snippet) | — |
| S35 | Soundful pricing (tiers, licence scope; $ JS-rendered) | Soundful | https://soundful.com/pricing/ | first-party | PARTIAL | soundful-pricing.html 7255472c… 89,688 B |
| S36 | Uppbeat pricing | Uppbeat | https://uppbeat.io/pricing | first-party | **ACCESS FAILURE 429** | uppbeat-pricing.html 02f95cf3… 32,184 B (challenge page) |
| S37 | Artlist Max / AI plans (credit ladders; $ JS-rendered) | Artlist | https://artlist.io/page/pricing/max | first-party | PARTIAL | artlist-pricing.html fde1276f… 696,330 B |
| S38 | Splash Pro retirement notice (2024-04-22) relayed | toolpilot.ai; aimusicpreneur 2026-05-20; soundverse; musically 2023 | (Q19) | secondary ×3 | PARTIAL | — |
| S39 | Amper discontinued as standalone | aitoolfinder; nubiapage; artificial-intelligence-wiki; lunoo (2026) | (Q20) | secondary ×4 | PARTIAL | — |
| S40 | Ecrett Music prices | toolmage.com (3 language mirrors, 2026-06-15) | (Q22) | `[single aggregator]` | PARTIAL | — |
| S41 | Tad AI hub + prices | tad.ai/hub (first-party, "$8 per month"); bestfor.ai 2026-06-11 | (Q22) | first-party + `[single aggregator]` | PARTIAL | — |
| S42 | ace-step/ACE-Step repo (Apache-2.0, 4,801★, pushed 2026-02-15) | ACE Studio / StepFun | GitHub API | first-party repo metadata | FULL (JSON) | github-api-ace-step.html |
| S43 | multimodal-art-projection/YuE (Apache-2.0, 6,415★, pushed 2025-06-04) | M-A-P | GitHub API | first-party repo metadata | FULL (JSON) | github-api-yue.html |
| S44 | ASLP-lab/DiffRhythm (Apache-2.0, 2,338★, pushed 2025-11-27) | ASLP Lab | GitHub API | first-party repo metadata | FULL (JSON) | github-api-diffrhythm.html |
| S45 | magenta/magenta-realtime (Apache-2.0, 1,786★, release v2.0.3 2026-07-30) | Google Magenta | GitHub API + releases/latest | first-party repo metadata | FULL (JSON) | github-api-magenta-realtime.html, github-release-magenta-realtime.json |
| S46 | facebookresearch/audiocraft (code MIT, 23,608★, pushed 2026-03-03; weights licence `[UNVERIFIED]`) | Meta | GitHub API | first-party repo metadata | FULL (JSON) | github-api-audiocraft.html |
| S47 | Endel App Store listing (id1346247457, IAP list) + Endel help "free version" | Endel | apps.apple.com; endel.zendesk.com | first-party | PARTIAL (snippets) | — |
| S48 | brain.fm pricing ($14.99/mo, $99.99/yr, trials) | brain.fm blog | brain.fm | first-party blog | PARTIAL (snippet) | — |
| S49 | Tencent Music AI (Venus, AI Songwriter, QQ Music AI做歌 ¥5–¥8) | MBW (TME ESG relay); aiproducthub.cn; developer.cloud.tencent.com; news.aibase | (Q22) | secondary ×4 (one Tencent Cloud dev article = first-party-adjacent) | PARTIAL | — |
| S50 | Apple iTunes Lookup/Search JSON (Suno, Udio, Flow Music, ElevenMusic, Mubert, Treblo) | Apple | itunes.apple.com/lookup, /search | first-party store metadata | FULL (JSON) | itunes-*.json (6 files) |
| S51 | App Store listing HTML Suno US, Flow Music, Treblo GB; Google Play Suno | Apple / Google | apps.apple.com; play.google.com | first-party store pages | FULL (text) | appstore-suno-us.html, appstore-google-flow-music.html, appstore-treblo-gb.html, play-suno.html; appstore-elevenmusic.html = 429 |
| Upgrades | S07b Mureka prices now aggregator ×4 (toolchase 2026-08-02, melodycraft, toolporto, tunesona); S28 Boomy ×4; S29b Beatoven ×5 with corrected figures; S30b Loudly ×3 agree + 1 contradicts | — | (Q19) | third-party | PARTIAL | — |
| A1–A5 | five arXiv primaries | Meta / Stability / Google / ByteDance / OpenAI | arXiv | academic | **FULL** (all sections incl. appendices; records in `_sources\…-academic-full-records.md`) | paper-*.txt 65,792 / 35,533 / 59,945 / 80,419 / 83,793 B |

**Counts after second pass (R11):** independent authoritative sources = 31 → **50** (S01–S51 distinct organisations/works incl. Apple/Google store metadata and 5 repo owners, excluding aggregator-only rows S07b/S28/S29b/S30b/S38–S40, + 5 academic); academic = 5; academic `[FULL]` = 0 → **5**; primary `[FULL]` product/store surfaces = 17 → **26** (adds S31, S32, S33, S42–S46, S50, S51); ACCESS FAILURES recorded = 3 (ElevenMusic App Store 429, Uppbeat 429, Mureka/Beatoven/Sonauto `/pricing` 404 ×3 counted as one class).

## 11.7 Claim ledger extension (§8 cont.) and contradictions (§9 cont.)

| claim_id | Claim | A | B | C | Status |
| --- | --- | --- | --- | --- | --- |
| C18 | Lyria 3.5 is live in the Gemini app for all users globally as of 2026-09-04, with genre/vocal/instrumental/templates/length controls | S31 | S32 (limits page lists music generation) | — | `[single-source official]` (two Google pages, one provenance) — newest fact in the sweep |
| C19 | Mureka Pro $9 / Premier $27 monthly; $86 / $259 yearly; 5,000 / 20,000 Gold | toolchase | melodycraft | toolporto; tunesona | **4 aggregators agree**; first-party page 404/JS → upgraded from single-source to `[aggregator ×4, first-party unreadable]` |
| C20 | Beatoven Creator $6 (15 min) / Visionary $10 (30 min) / $20 (60 min) / PAYG $3 per min | apis.io | toolchase (Aug 2026) | aitrendtool 2026-07-23; saasworthy; soundraw blog | **5 aggregators agree**; CORRECTS C17's "$10 / $20" |
| C21 | Loudly Personal $10 / Pro $30 monthly ($8 / $24 annual); 2,500 / 10,000 credits | aitoolscoop | toolchase | saasworthy 2025-09-18 | **3 agree**; costbench $14.99 / $39.99 CONTRADICTS (X8); CORRECTS C17 |
| C22 | Boomy Free / Creator $9.99 / Pro $29.99 | propicked | toolchase | costbench 2026-06-05; melodycraft | **4 agree**; first-party JS shell |
| C23 | Splash Pro retired 2024-04-22; Amper discontinued as standalone after Shutterstock asset acquisition (2020-11-11) | toolpilot (vendor notice) / Shutterstock IR | aimusicpreneur / aitoolfinder | soundverse / nubiapage | **3+ verified (secondary)** |
| C24 | Lemonaide is owned by BeatStars (Jan 2026); Starter 50 / Professional 250 seed credits per month; Collab Club $4.99 or $9.99 per model per month | S33 | help.beatstars.com | aimusicpreneur 2026-07-16 | **3 sources**, one rollover contradiction (X6) |
| C25 | Repo licences: ACE-Step, YuE, DiffRhythm, Magenta RT all Apache-2.0; audiocraft code MIT | S42–S46 (GitHub API `license.spdx_id`) | — | — | `[single-source official]` per repo (the API is the authority); audiocraft weights licence `[UNVERIFIED]` |
| C26 | Google Flow Music App Store IAP: Starter $7.99 / Plus $24.99 / Member $64.00 monthly; $70.99 / $214.99 / $569.99 yearly; 1,000 credits $5.99 | S51 | — | — | `[single-source official]`; differs from web S17 ($8 / $24 / $64) → X10 |
| C27 | Suno App Store IAP: Pro $10.00 / Premier $30.00 monthly, $96.00 / $289.00 yearly; credit packs 500 / 1,000 / 2,000 / 4,000 at $4 / $8 / $16 / $30; Download Credit $2.99 / $4.99 | S51 | S02 (annual $8/$24 ≙ $96/$288 — App Store shows $289) | C01 | **3 sources**; $1 annual rounding difference noted |
| C28 | No captured competitor surface describes an ad-supported free tier (0 of 47 captures; 0 Play "Contains ads" badges in captured listings) | Q24 sweep | S51 Play Suno | S21 Treblo | `[ABSENCE-BASED; FLAGGED — 0/3 positive confirmations]` |
| C29 | Tencent QQ Music AI做歌 charges per generation, ¥5 entry / ¥8 lyric mode | aiproducthub.cn | MBW (platform facts only) | — | `[single aggregator zh]` for prices |

Counts after second pass: 3+ verified = 10 → **16** (adds C19, C20, C21, C22, C23, C24, C27); single-source (disclosed) = 7 → **11** (C06, C09→superseded by C19, C10, C13, C14, C16, C18, C25, C26, C29 + C17 superseded); flagged absence-based = 1 (C28); unverified = 2 → 1 (Ecrett prices now `[single aggregator]`; Tad AI entry price first-party).

| # | Contradiction (new) | Resolution |
| --- | --- | --- |
| X6 | Lemonaide credit rollover: BeatStars help says credits do not carry over; aimusicpreneur (2026-07-16) says "with rollover". | First-party (BeatStars) wins; aimusicpreneur marked STALE or wrong. |
| X7 | Beatoven Creator/Visionary price: §8 C17 said $10 / $20 (costbench, apis.io two-source); five sources this pass say $6 / $10 / $20 by 15 / 30 / 60 minutes. | Majority ×5 recorded; C17 superseded by C20; first-party page still 404 so **no** first-party confirmation. |
| X8 | Loudly Personal/Pro: three aggregators $10 / $30; costbench (2026-04-24) $14.99 / $39.99 (the figure S30b carried). | Majority ×3 recorded (C21); costbench preserved as contradiction; first-party page JS-only. |
| X9 | Endel price: Apple IAP list shows $2.99–$19.99 monthly, $34.99–$119.99 yearly, $124.99 lifetime; brain.fm blog says $14.99/mo, ~$50/yr, ~$90 lifetime. | Apple first-party list wins (regional/promotional variants); brain.fm figure is a competitor's claim. |
| X10 | Google Flow Music price: web pricing page $8 / $24 / $64 (S17) vs App Store IAP $7.99 / $24.99 / $64.00 (S51). | Both first-party, both preserved: web and iOS price lists differ by channel; note Apple pricing tiers. |
| X2 (update) | Suno ownership clause | ToS capture confirms **inputs** (Submissions) stay the user's; the Free-vs-Paid **output** split is still only from help-centre/aggregator text → remains `[UNVERIFIED]` for outputs. |

## 11.8 Honest floor status — re-run after the second pass (supersedes the banner scope stated in §10)

| Floor (owner's, R11) | Required | Before | After | Status |
| --- | --- | --- | --- | --- |
| Independent authoritative sources | ≥ 20 | 31 | 50 | MET |
| Academic sources | ≥ 5 | 5 | 5 | MET |
| Academic read `[FULL]` (all sections incl. appendices, five-part record) | ≥ 5 | 0 | 5 | **MET** |
| Primary product surfaces read `[FULL]` | (reported) | 17 | 26 | reported |
| Load-bearing claims 3+ verified | (reported) | 10 | 16 | reported |
| UI evidence IMAGE-BACKED for surfaces | (owner asked) | 0 / 7 | 0 / 7 (counts measured, images not viewed) | **NOT MET — stated, not hidden** |
| Ad-supported-free-tier uniqueness | ≥ 3 positive confirmations | 0 | 0 (absence measured across 47 captures) | **FLAGGED** |

Banner decision: the two R11 floors that triggered the `UNVERIFIED RELAY` banner (academic `[FULL]` and source count) are now met by measurement, so the banner is removed from all four files. Two non-floor evidence gaps remain and are carried in the text where they bind: UI surfaces stay TEXT-DERIVED (ui-and-menus file §7) and the ad-model uniqueness claim stays FLAGGED (this file 11.5; business-model file §7).

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
