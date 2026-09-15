# Standards ledger

| Governing standard | How this run satisfies it | Evidence |
|---|---|---|
| Deep-research covenant (merged rule + skill, PART I + R0–R18) | Read from disk this session before any external action | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (117,893 chars; brief carried COVENANT_SHA256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB) |
| Prior competitor UI study (do-not-duplicate order) | Read in full this session; this file covers ONLY the input-control-and-values layer | `docs/research/competitors/2026-08-13-ai-song-generation-ui-and-menus.md` [FULL] |
| Parent scope plan | On disk before this slice ran | `docs/research/_runs/2026-08-29-simple-player-input-taxonomy.scope-plan.md` |
| R8 read-status vocabulary | Every source below carries [FULL]/[PARTIAL]/[ABS]; search-extract-only sources are [PARTIAL] | Source register, this file |
| R10 three-source rule | Load-bearing claims cross-checked; [single-source] flagged | Claim notes inline + contradiction ledger |
| R15 language/path/naming | English, ISO-date kebab-case, governed root `docs/research/` | this file's path |

Slice: COMPETITOR INPUT-CONTROL-AND-VALUES layer only. Delegated worker under MODE B (owner research order relayed by parent). Date of all observations: 2026-08-29 unless stated.

# Scope plan echo — decision served

**Decision:** exactly which input controls PlayMusicPrompts' simple-user prompt-to-music player page exposes, and which curated values each control offers (genre chips; era/scene "stations"; vocal option lyrics/instrumental/random; anything else users demonstrably expect).
**Slice:** first-party surfaces + documentation of Suno, Udio, Google MusicFX / Music AI Sandbox / Lyria (incl. RealTime) / Flow Music, Stable Audio, Mubert, Endel, AIVA, Boomy, Soundraw, Beatoven.ai, Loudly, brain.fm, plus discovered 2025–2026 entrants (ElevenLabs Eleven Music/ElevenMusic, Riffusion/Producer.ai, Sonauto, Mureka). Seeds, never a whitelist.
**Honest access boundary (unchanged from the 2026-08-13 study):** no account was created and no product screen was seen. Every claim below is reconstructed from vendor documentation, vendor blogs/help centers, app-store listings, and third-party walkthroughs, each marked. Visual claims: none.

# Outcome first — the seven facts that decide the input surface

1. **Every prompt-first leader ships the same casual trio: one free-text prompt box + an Instrumental toggle + a dice/random button.** Suno Simple Mode (description box, Instrumental switch, dice icon, "Inspiration" bubbles), Riffusion Prompt Mode (Create bar, Instrumental toggle, random dice), Udio (prompt box, dice, Lyrics selector with Instrumental state), Sonauto Simple Mode (+ Instrumental toggle usable in any mode), MusicFX ("I'm feeling lucky" + suggested prompts). This trio is the demonstrated user expectation floor.
2. **Lyrics handling has converged on a three-state control, not a binary:** Auto-generated / Custom (write your own) / Instrumental. Udio ships it literally as a three-way Lyrics selector; Sonauto ships it as four modes (Simple, Custom Auto, Custom Manual, Instrumental); Suno ships it as Simple-vs-Custom plus an Instrumental toggle; Riffusion ships Instrumental toggle + "Add lyrics" box + Ghostwriter (AI lyrics from a prompt). "Random" as a vocal state is NOT shipped by anyone as a named option — the dice randomizes the prompt/style, not the vocal mode. A lyrics/instrumental/**random** three-way would be a (small) novelty.
3. **Curated value chips are dynamic and prompt-composing, not static menus, in the prompt-first family.** Udio's "Suggested Tags" are generated from the typed prompt and click-append into it; MusicFX's "expressive chips" make each word of the prompt tappable with a dropdown of related words; Riffusion offers saved "Vibes" (10-second audio clips) as reusable prompt tokens. Static curated pickers live only in the parametric family (Soundraw, Boomy, Mubert, Beatoven, Loudly, AIVA) — where they ARE the whole interface.
4. **The parametric family proves which curated dimensions casual users accept: Mood + Genre + Theme/Activity + Tempo(3-step) + Length.** Soundraw is the cleanest exemplar (verbatim lists below). Mubert adds Activity as a first-class equal of Genre and Mood ("Run 160", "Christmas") and a track-type choice (Track / Loop / Jingle / Mix). Loudly adds Energy (Low / Original / High) and Structure presets (Classic / To the bone / Wait for it / Slow burn).
5. **Scene/state "stations" are a proven separate product family, and it is the closest existing pattern to the owner's "80s / office hours / new york cafe" idea.** Endel: 4 core soundscapes (Focus, Relax, Sleep, Move) + timed Scenarios; brain.fm: 4 mental states (Focus, Relax, Sleep, Meditate) × 4 activities each × genre selector; ElevenMusic (2026): daily mixes with mood stations Focus, Energy, Relax, Late Night, Cosmic, Chill + live stations. **No leader ships a decade/era station picker** — era is expressed in free text ("90s house", "1980s synth-pop") and in best-practice guides as genre+era tags. An explicit era row would be a differentiator, not a copy.
6. **Everything numeric is hidden from casual users behind an "Advanced" disclosure, everywhere.** Seed, prompt strength, lyrics strength, weirdness/style-influence sliders, steps, BPM, key, clip-start, quality-vs-speed: Suno (Advanced Options, paid), Udio (advanced features dropdown), Riffusion (Advanced toggle in Compose), Stable Audio ("Add Extras"), Loudly (parametric but pro-facing). The casual surface never shows a number.
7. **Two-variant output is part of the input contract.** Suno, Udio, Riffusion and clones return two takes per Create; Loudly returns three; Soundraw returns a batch of 15+. The "input surface" leaders ship is therefore prompt → A/B choice, which converts model nondeterminism into a feature and doubles perceived hit-rate. A single-track real-time player (our design) must compensate with skip-adaptivity — which is exactly what the buffer design already does.

# Per-product findings — prompt-first family

## P1 Suno (v5.5-era, 2026)

Sources: prior 2026-08-13 study of `suno.com/release-notes` (995 lines, archived) [FULL, this session]; startwebtools.com walkthrough [3P, PARTIAL]; james-palm Medium 2025-beginners guide [3P, PARTIAL]; geekonai guide [3P, PARTIAL]; musci.io tag compendium [3P, FULL]; apipass 50-tips [3P, PARTIAL].

1. **Casual (Simple) mode exposes:** one Song Description box; an **Instrumental** on/off switch; a **dice icon** (random prompt); **"Inspiration" bubbles** — clickable genre suggestions ("genres that Suno knows work well" [3P]); Create. Two variants returned per run [3P, 3 sources].
2. **Exact value lists:** Suno publishes **no static curated genre list** on the create surface. Its curation is behavioral: dice, Inspiration bubbles, "Need ideas?" section, **Use Random Style** button (first-party, release notes), Explore-page style wheel to copy styles from. The community fills the vacuum with tag compendia (musci.io lists 100+ genre tags in 9 families, ~36 mood/energy tags, ~80 instrument tags — verbatim samples below), which is itself evidence that users WANT a value list the product does not give them.
3. **Prompt/control composition:** Simple = one field, AI decides everything. Custom splits Lyrics / Style / (web) Duration slider / Vocal Gender (Male/Female, first-party) / Advanced Options (Exclude styles; Creative Sliders ~ Weirdness / Style Influence / Audio Influence — names [3P]). Structure and voice direction are typed INSIDE lyrics as square-bracket tags (`[Verse]`, `[female vocals]`).
4. **Lyrics/instrumental/random:** Instrumental toggle in both modes; custom lyrics only in Custom; no "random vocals" state — dice randomizes the whole prompt.
5. **Conspicuously NOT exposed to casual users:** duration (web-only slider, Custom), BPM/key (only in Sounds loops and Studio), seed (never), negative styles (paid Advanced), vocal gender (Custom), language picker (none — language inferred from prompt/lyrics).

## P2 Udio (2026)

Sources: help.udio.com "Prompt Like a Master" [official, PARTIAL]; howtogeek walkthrough [3P, PARTIAL]; AI-wiki Udio prompt guide (updated 2026-05-27) [3P, FULL]; musicradiocreative tutorial [3P, PARTIAL]; prior study's udio.com/pricing + blog [FULL, archived].

1. **Casual mode exposes:** prompt box (expands on click); **dice** for random ideas; **Suggested Tags** generated from the typed prompt, click-to-add; **Lyrics selector = Auto-Generated / Custom / Instrumental** (three-state, the cleanest in the field); clip length choice **30 s / 2 min** [3P video]; Create → two variants.
2. **Exact value lists:** Suggested Tags are **dynamic** (derived from the prompt), so there is no fixed list to quote; first-party confirms the mechanism ("Below the text box, you'll find tag suggestions – click to add them"). In-lyrics vocabulary is curated via a slash-menu of guidance tags and documented square-bracket commands: `[Scream]`, `[Whisper]`, `[Falsetto]`, `[Chorus]`, `[Guitar Solo]`, `[Bass Drop]`, `[Drum Fill]`, `[Piano Interlude]`, `[Build Up]`, `[Break Down]`, `[Bridge]`, `[Outro]` (official + [3P] agree).
3. **Composition:** chips append into the SAME prompt string; Manual Mode (above Suggested Tags [3P]) turns OFF Udio's automatic prompt rewriting so only exact tags are used.
4. **Lyrics/instrumental/random:** the three-state selector; per-section `[Instrumental]` marking also possible; dice = random prompt only.
5. **NOT exposed casually:** seed (Manual Mode only), prompt strength, lyrics strength, clip start-time (0/50/90%), quality↔speed slider, Style Reduction — all inside the "advanced features" dropdown; no duration beyond the 30s/2min binary; no language picker.

## P3 ElevenLabs — Eleven Music web + ElevenMusic iOS app (2025-08 web launch; 2026-04-01 app)

Sources: elevenlabs.io/docs/eleven-creative/products/music [official, FULL]; docs best-practices [official, PARTIAL]; blog "Composer" + "Introducing Music v2" [official, PARTIAL]; MBW app launch report 2026-04 [3P, PARTIAL]; TechCrunch 2026-04-02 [3P, PARTIAL].

1. **Casual mode exposes (app, per MBW+TechCrunch, both citing the product):** natural-language prompt; **song length control**; **lyrics on/off**; **"writing style"** option; remix-by-text of any discovered song; 7 free songs/day. Web adds: **Variants count**, **Duration = fixed (30s, 1m, …) or Auto**, optional **Audio Reference** (≤~30 s upload, copyright-screened), optional **Finetune** picker (curated finetunes "across global genres and styles" or custom) [official].
2. **Exact value lists:** the app's discovery surface ships **mood stations: Focus, Energy, Relax, Late Night, Cosmic, Chill** (TechCrunch, naming the daily-mix moods) — the clearest 2026 example of scene-station curation inside a generator. Duration bounds: **3 s min, 10 min max** [official]. Vocal languages: **English, Spanish, German, Japanese** listed by name [official].
3. **Composition:** prompt is primary; duration/variants are separate fields; era/genre/BPM/key all go INSIDE the prompt text ("90s house", "128 BPM", "in A minor") per the official prompting guide; instrumental is a prompt phrase ("instrumental only"), not a toggle, on the Creative surface [official].
4. **Lyrics/instrumental/random:** model defaults to generating lyrics; "instrumental only" in prompt disables; own lyrics accepted; per-section lyric rewrite via Composer (2026). No random button documented.
5. **NOT exposed casually:** composition plans (JSON), per-section include/exclude styles (editor, not create), stems, seed (API only).

## P4 Riffusion / Producer.ai (2025–2026)

Sources: riffusion.com/docs/create/vibes [official, PARTIAL]; allthings.how tutorial [3P, PARTIAL]; musicful review [3P, PARTIAL]; nerds-life guide [3P, PARTIAL]; 2025 video tutorial [3P, PARTIAL]. Status note: a search synthesis dated the rebrand to Producer.ai (mid-2025) and a Google acquisition (2026-02) integrating with Lyria 3 — **[UNVERIFIED]**, no primary was read; riffusion.com docs were still live at access time.

1. **Casual (Prompt) mode exposes:** Create bar (free text); **Instrumental toggle**; **dice/Random**; Generate → two songs.
2. **Compose mode exposes (still consumer-grade):** Lyrics box OR **Ghostwriter** (AI lyrics from a prompt); **Sound** field (genre/vibe words); **Vibes** = saved 10-second audio clips usable as prompt tokens ("a new vocabulary for music creation" [official]); Advanced toggle → up to 4 sound layers with strength + start/end time, lyrics-strength, weirdness, seed, negative prompts.
3. **Exact value lists:** none static; Vibes are user-curated audio chips (official doc quoted in register).
4. **Lyrics/instrumental/random:** toggle + own lyrics + Ghostwriter; dice for random prompt.
5. **NOT exposed casually:** everything behind the Advanced toggle (strengths, seed, timestamps, negatives).

## P5 Sonauto (2026, V3-era) and P6 Mureka (2026, V9.5)

Sources: reviewnexa Sonauto review [3P, FULL-file saved, PARTIAL-read]; creativeaininja Medium [3P, PARTIAL]; grokmusic tool page [3P, PARTIAL]; Google Play Mureka listing (2026-08-24 update) [official store, PARTIAL]; examples.com roundup [3P, PARTIAL].

- **Sonauto casual surface:** three visible modes — **Simple** (describe the song, AI does lyrics+style+title), **Fancy/Advanced** (own lyrics, comma-separated style tags, structure labels), **Instrumental**. Genre coverage marketed by family (Electronic/Rock/Hip-Hop/Pop/Folk/Metal/World with named subgenres — table quoted in register). Bracketed tags understood (`[electronic] [808] [synthwave] [dark]`).
- **Mureka casual surface:** generate from **text, images, or video**; scene-based radios on the listening side; remix-into-any-style; voice cloning; "studio-level control over lyrics, style, and vocals" in create [official store]. No verbatim value list retrievable without login — explicit gap.

# Per-product findings — Google family (MusicFX, MusicFX DJ, Lyria RealTime, Flow Music)

Sources: blog.google (ImageFX/MusicFX update; Jacob Collier Lab Sessions) [official, PARTIAL]; deepmind.google MusicFX DJ post [official, PARTIAL]; ai.google.dev Lyria RealTime docs + model page [official, PARTIAL — direct fetch timed out twice; content recovered via search extracts + two independent developer write-ups that quote the parameter table]; androidpolice MusicFX guide [3P, PARTIAL]; musicradar [3P, PARTIAL]; undetectr 2026 review [3P, PARTIAL]; webeducationservices [3P, PARTIAL]; prior study's flowmusic.app grid + Vertex console path [FULL, archived].

1. **MusicFX (classic) casual surface:** prompt box; **"I'm feeling lucky"** random; **suggested prompts** underneath; **expressive chips** — every adjective/noun in the typed prompt becomes tappable with a **dropdown of related words** (first-party: "explore prompts with expressive chips"); **Track length** setting (up to 70 s per first-party blog; 30/50/70 s per [3P]); **Looping** toggle; two clips per run [3P].
2. **MusicFX DJ (2026 live surface):** prompt chips are mixed as **weighted layers** — each prompt gets its own slider (up to ten layers [3P musicradar]); dice = random prompt; shuffle = randomize layer levels; instrumentation add/remove (**bass, drums, other instruments** — first-party); texture controls **bright↔dark, repetitive↔random, smooth↔rough** (first-party); **fast/slow** (first-party via Collier post); built-in tag dropdowns for Instruments / Genre / Tempo / Effects [3P].
3. **Lyria RealTime API (the engine behind our own product's family):** input = **WeightedPrompt[]** (text + weight); config = `guidance` 0–6 (default 4), `bpm` 60–200, `density` 0–1, `brightness` 0–1, `scale` (12-value key+mode enum), `mute_bass`, `mute_drums`, `only_bass_and_drums`, `music_generation_mode` QUALITY/DIVERSITY/VOCALIZATION, `temperature` 0–3 (default 1.1), `top_k`, `seed` [official docs, cross-confirmed by 2 independent developer articles]. bpm/scale changes need a context reset; density/brightness/guidance change smoothly. Instrumental-only engine; no lyrics input; 48 kHz stereo PCM; ~2 s control latency; 10-min session cap [3P + official].
4. **Flow Music (consumer, 2026):** conversational "Producer" agent instead of a control panel (prior study, unchanged). No numeric sliders evidenced.
5. **What Google does NOT expose to casual users:** lyrics/vocals anywhere on the consumer surfaces (MusicFX family is instrumental-first; VOCALIZATION mode is wordless vocal-as-instrument); duration beyond 70 s; seed on DJ surface.

# Per-product findings — parametric/selector family

## P7 Soundraw

Sources: aumiqx review [3P, FULL]; soundraw.io homepage copy [official, PARTIAL]; toolchase 2026-08-02 check [3P, PARTIAL]; cybernews review [3P, PARTIAL].

1. **Casual surface = a structured picker, no prompt at all** ([3P aumiqx: "This is not a text prompt system"; official copy now also markets genre-blending]): choose **Mood + Genre + Theme**, then **Tempo (Slow / Normal / Fast)**, **Duration (10 s – 5 min)**, optional instrument emphasis → batch of **15+ tracks** in ~10 s.
2. **Verbatim value lists (aumiqx, 2026):** Moods: **Busy, Dark, Dreamy, Elegant, Euphoric, Funny, Happy, Hopeful, Mysterious, Peaceful, Romantic, Sad, Scary, Angry**. Genres: **Pop, Hip Hop, Electronic, Rock, Latin, Acoustic, Classical, Jazz, R&B, Cinematic** (site markets 30+ incl. trap, lo-fi, house, ambient, EDM, corporate). Themes: **Corporate, Travel, Vlog, Wedding, Sports, Gaming, Fashion, Cooking, Technology, Nature**. Multi-select/blending allowed on all three.
3. **Post-pick controls:** per-section energy Low/Med/High, instrument toggles, length per section — the editor, not the create surface.
4. **No vocals at all**; no era options; no language.

## P8 Mubert (Render)

Sources: mubert.com/render/how-it-works, /render/genres, /api [official, PARTIAL]; codingem review [3P, PARTIAL]; fahimai [3P, PARTIAL].

1. **Casual surface:** three entry methods — **text prompt, mood/genre picker, or image upload**; then **Set type: Track / Loop / Jingle / Mix**; then **Duration 15 s (5 s per /genres copy) – 25 min**; Generate.
2. **Value-list scale (first-party, counts only):** "**150+ genres**", "**more than 50 moods and themes**", elsewhere "**200+ moods and themes**" (inconsistent — contradiction ledger #5). Activity is a first-class dimension: examples observed in [3P] review: mood "**Run 160**", activity "**Christmas**". API exposes genre/mood/activity/BPM filters and an enumeration endpoint (`/music-library/params`).
3. **No lyrics/vocals**; intensity (low/high) exists API-side; no era options.

## P9 Endel and P10 brain.fm — the scene-station family

Sources: endel.io, /soundscapes, /technology, zendesk FAQ [official, FAQ FULL]; App Store listing [official store, PARTIAL]; brain.fm Play/App Store listings [official store, PARTIAL]; brainfm helpscout KB (Focus, Relaxation) [official, PARTIAL]; workbrighter walkthrough [3P, PARTIAL].

1. **Endel input surface = one choice + one timer.** Soundscapes: **Focus, Relax, Sleep, Move** (free core; "Wind Down" named as a free core on Alexa). Plus timed **Scenarios** for specific tasks; **Autoplay** picks the soundscape for you from time-of-day/state. No prompt, no genre, no duration beyond the timer. Personalization is sensor-driven (time, weather, heart rate, motion, light), not control-driven.
2. **brain.fm input surface = state → activity → (genre, neural-effect level).** States: **Focus, Relax, Sleep, Meditate**. Activities per state [3P workbrighter, consistent with official KB category pages]: Focus → **Deep Work, Creative Flow, Study & Read, Light Work**; Relax → **Chill, Recharge, Destress, Unwind**; Sleep → **Deep Sleep, Guided Sleep, Sleep & Wake, Wind Down**; Meditate → **Guided, Unguided**. Then session length; then **genre**: music styles **acoustic, cinematic, electronic, piano, post-rock** (+ LoFi, Classical per store listing) and **nature sounds: beach, forest, rain, river, thunder, wind**; then **neural effect level** (low/med/high, ADHD boost).
3. **Neither exposes:** prompts, lyrics, era, BPM, key. This family proves a casual listener will happily drive a generative audio product with 2–3 taps of curated values and zero text.

## P11 Loudly, P12 Beatoven.ai, P13 Boomy, P14 AIVA, P15 Stable Audio

- **Loudly** [official pages + blog, PARTIAL; AI-wiki FULL-file saved]: song-formula picker — **Genre + subgenre (50+; ambient, drum'n'bass, EDM, epic score, hip hop, house, lo-fi, reggaeton, synthwave, techno, trance, trap, downtempo, rock…)**, **genre blend** (two genres, ratio), **Duration**, **Instruments (up to 7 of: Drums, Brass/Woodwind, Strings, Keys, FX, Synth, Bass, Vocals, Guitar, Tonal Percussion — or random)**, **Energy: Low / Original / High**, **Structure: Classic / To the bone / Wait for it / Slow burn**, **Tempo 60–200 BPM**, **Key**; also a plain text-to-music tab. Three tracks per run. Vocals only as an "instrument" layer, no lyrics.
- **Beatoven.ai** [appsumo + best-aitool + aiindigo, 3P PARTIAL; API spec archived in project _sources]: **8 genres** (incl. Cinematic, Electronic, Pop, Rock, Jazz…) × **16 moods** (named across sources: motivational, triumphant, dreamy, happy, sad, energetic, calm, tense/serious, melancholic…full 16 not retrievable without login — gap); duration, tempo, per-section mood assignment; instrumental only.
- **Boomy** [toolscompare, 3P PARTIAL]: pick a **style category first**: **EDM/Electronic Dance, Lo-Fi/Chill, Hip-Hop/Rap Beats, Ambient, Global Groove, Relaxing Meditation, Cinematic, Experimental, Custom** → instant generation → reject/save loop. No prompt in the base flow; no custom lyrics (Auto-Vocal add-on).
- **AIVA** [aiva.crisp.help manual official PARTIAL; aiva.ai PARTIAL; AI-wiki + fullstackcreators 3P PARTIAL]: **Create Track → From a Style (250+ preset styles, filterable by category) / From a Chord Progression / From an Influence (audio/MIDI upload) / Step-by-step**; then Key Signature, Time Signature, Tempo, **Duration (30 s–5:30 by plan)**, Number of compositions. Music-theory vocabulary throughout — explicitly NOT a casual surface ([3P]: "assumes some musical knowledge").
- **Stable Audio (stableaudio.com)** [allthings.how + aiupdate + audiocipher 3P PARTIAL; stability.ai 2.5 prompt guide official PARTIAL]: prompt box; **Prompt Library** of preset style cards (click to pre-fill the prompt — audition-able); Model selector; **Duration stepper** (45 s free / 90 s pro / up to 3 min on 2.5); Input audio (audio-to-audio); "Add Extras": **Steps (50→100), Number of Results (≤5, pro), Seed, Prompt Strength (default 80%)**. First-party prompt guide teaches a fixed casual grammar: **Genre + Tempo (Slow/Medium/Building/Fast or BPM band) + Mood**, with named BPM bands (60-80 ballads/blues; 80-100 R&B/house; 100-120 pop/rock ballads/jazz; 120-140 disco/upbeat pop/rock/techno; 140-160 dubstep/metal).

# Consolidated comparison — controls × products (casual/simple mode only)

Legend: ✔ = present on the casual surface · A = present but behind an Advanced/paid disclosure · E = present only in the editor after generation · P = expressed inside the prompt text, no dedicated control · — = absent/not found · ? = not retrievable without login.

| Control | Suno | Udio | ElevenMusic | Riffusion | Sonauto | MusicFX (DJ) | Stable Audio | Mubert | Soundraw | Loudly | Beatoven | Boomy | AIVA | Endel | brain.fm |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Free-text prompt | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔(opt) | — | ✔(opt) | — | — | — | — | — |
| Genre picker (static values) | — (bubbles) | — (dynamic tags) | — (Finetunes≈) | — (Vibes≈) | — | (tag dropdowns) | (prompt library≈) | ✔ | ✔ | ✔ | ✔ | ✔ (styles) | ✔ (250+ styles) | — | ✔ |
| Mood picker | P | P | P | P | P | P | P | ✔ | ✔ | — (energy) | ✔ | — | (per style) | — | (state) |
| Scene/activity/theme preset | — | — | ✔ (stations) | — | — | — | — | ✔ (activities) | ✔ (themes) | — | — | — | — | ✔ (4+scenarios) | ✔ (4×4) |
| Era/decade option | P | P | P | P | P | P (chips) | P | — | — | — | — | — | — | — | — |
| Vocal: instrumental toggle | ✔ | ✔ (3-state) | P ("instrumental only") | ✔ | ✔ | n/a (no vocals) | P | n/a | n/a | (voice layer) | n/a | limited | n/a | n/a | n/a |
| Vocal: auto vs own lyrics | ✔ (Custom) | ✔ (selector) | ✔ | ✔ (+Ghostwriter) | ✔ (4 modes) | — | — | — | — | — | — | — | — | — | — |
| Vocal gender/voice pick | A (M/F) | A (Voices) | A (Vocals 2026-07) | — | A | — | — | — | — | — | — | — | — | — | — |
| Language picker | — (P) | — (P) | — (P; 4 langs documented) | — | — | — | — | — | — | — | — | — | — | — | — |
| Duration/length | A (web slider) | ✔ (30s/2min) | ✔ (fixed or Auto; 3s–10min) | — | ✔ (≤4.5min V3) | ✔ (≤70s) | ✔ (stepper) | ✔ (15s–25min) | ✔ (10s–5min) | ✔ | ✔ | — | ✔ | timer | timer |
| Tempo/energy (coarse) | — | — | P | — | P | ✔ (fast/slow) | P (3-step words) | (intensity API) | ✔ (3-step) | ✔ (3-step energy) | ✔ | — | ✔ (BPM) | — | ✔ (neural level) |
| Random/dice | ✔ | ✔ | — | ✔ | — | ✔ (+shuffle) | — | — | — | (random instr.) | — | ✔ (implicit) | — | (Autoplay) | — |
| Chips that append to prompt | ✔ (bubbles) | ✔ (Suggested Tags) | — | ✔ (Vibes) | — | ✔ (expressive chips) | ✔ (library pre-fill) | — | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Variants per run | 2 | 2 | ✔ (selectable) | 2 | 1–2 | 2 | 1 (≤5 pro) | 1 | 15+ | 3 | 1 | many | selectable | ∞ stream | ∞ stream |
| Seed / strengths / steps / BPM / key | A | A | API | A | A (seed) | — | A ("Add Extras") | API | E | ✔ (pro-facing) | E | — | ✔ | — | — |
| Reference-audio input | A (upload) | A (upload) | ✔ (Audio Reference) | ✔ (Vibes) | — | — | ✔ (input audio) | (image!) | — | ✔ (audio clip) | (video upload) | — | ✔ (influence) | — | — |

# Verbatim value lists (best exemplars found)

**Soundraw** ([3P aumiqx 2026, quoted verbatim]):
- Moods: `Busy, Dark, Dreamy, Elegant, Euphoric, Funny, Happy, Hopeful, Mysterious, Peaceful, Romantic, Sad, Scary, Angry`
- Genres: `Pop, Hip Hop, Electronic, Rock, Latin, Acoustic, Classical, Jazz, R&B, Cinematic`
- Themes: `Corporate, Travel, Vlog, Wedding, Sports, Gaming, Fashion, Cooking, Technology, Nature`
- Tempo: `slow, normal, fast` · Duration: 10 s – 5 min

**brain.fm** (official KB + [3P] walkthrough):
- Mental states: `Focus, Relax, Sleep, Meditate`
- Focus activities: `Deep Work, Creative Flow, Study & Read, Light Work` · Relax: `Chill, Recharge, Destress, Unwind` · Sleep: `Deep Sleep, Guided Sleep, Sleep & Wake, Wind Down` · Meditate: `Guided, Unguided`
- Genres: `acoustic, cinematic, electronic, piano, post-rock` + `LoFi, Classical` (store) · Nature: `beach, forest, rain, river, thunder, wind`

**Endel** (official): Soundscapes `Focus, Relax, Sleep, Move` (+ `Wind Down` on Alexa free core); artist soundscapes named on the store listing (Wind Down, AI Lullaby, Deeper Focus, Wiggly Wisdom, Clarity Trip).

**ElevenMusic app** ([3P TechCrunch, naming product values]): daily-mix mood stations `Focus, Energy, Relax, Late Night, Cosmic, Chill`; documented vocal languages `English, Spanish, German, Japanese` [official].

**Boomy** ([3P toolscompare]): style categories `EDM / Electronic Dance, Lo-Fi / Chill, Hip-Hop / Rap Beats, Ambient, Global Groove, Relaxing Meditation, Cinematic, Experimental, Custom`.

**Loudly** (official blog): instruments `Drums, Brass/Woodwind, Strings, Keys, FX, Synth, Bass, Vocals, Guitar, Tonal Percussion`; energy `low, original, high`; structure `Classic, To the bone, Wait for it, Slow burn`; tempo `60–200 BPM`; genres marketed `ambient, drum 'n' bass, EDM, epic score, hip hop, house, lo-fi, reggaeton, synthwave, techno, trance, trap, downtempo, rock` (50+ claimed).

**Stable Audio 2.5 prompt grammar** (official guide): tempo words `Slow, Medium, Building, Fast`; BPM bands `60–80 (ballads, blues), 80–100 (R&B, house), 100–120 (pop, rock ballads, jazz), 120–140 (disco, upbeat pop, rock, techno), 140–160 (dubstep, metal)`.

**Udio in-lyrics command vocabulary** (official help + [3P]): `[Scream] [Whisper] [Falsetto] [Chorus] [Guitar Solo] [Bass Drop] [Drum Fill] [Piano Interlude] [Build Up] [Break Down] [Bridge] [Outro] [Instrumental] [Acoustic Guitar] [Violin] [Synthesizer]`.

**Suno community tag families** ([3P musci.io 2026-01-04, read FULL] — community-curated, NOT first-party UI values; quoted as demonstrated user vocabulary): genre families Electronic/Dance (21 tags: EDM, House, Deep House, Tech House, Techno, Trance, Dubstep, Drum and Bass, Ambient, Synthwave, Retrowave, Chillwave, Future Bass, Trap, Electro, Industrial, IDM, Downtempo, Chillstep, Hardstyle…), Hip-Hop/R&B (12), Rock/Alternative (23), Pop (12: Pop, Synth Pop, Electropop, Indie Pop, Dream Pop, Bedroom Pop, Art Pop, Dance Pop, K-Pop, J-Pop, City Pop, Teen Pop…), Country/Folk (10), Jazz/Blues (11), World/Latin (10: Afrobeat, Reggae, Dancehall, Salsa, Bachata, Reggaeton, Flamenco…), Classical/Orchestral (14), Other (10); moods (21: Uplifting, Melancholic, Haunting, Dark, Joyful, Nostalgic, Somber, Romantic, Intense, Dreamy, Peaceful, Anxious, Euphoric, Mysterious, Aggressive, Playful, Epic, Intimate, Bittersweet, Triumphant); energy (10: High/Medium/Low Energy, Chill, Driving, Explosive, Building, Relaxed, Frantic, Steady); vocal gender/style/effect/emotion tags (~40); era best practice `[1980s Synthwave]`, `[90s Boom Bap]`, `[70s Disco]` — "Adding a time period dramatically improves genre accuracy."

# What this means for the PlayMusicPrompts input surface (slice-level synthesis)

- **ADOPT (users demonstrably expect it):** one prompt box; Instrumental/vocal three-state (auto-lyrics / instrumental — plus our "random" as a genuine novelty); a dice/random affordance; genre chips that APPEND to the prompt rather than replace it (the Udio/MusicFX pattern); a small curated mood row (Soundraw's 14 moods are the field's cleanest set); scene/activity stations (Endel/brain.fm/ElevenMusic prove 2-tap listening works); duration only if we want it (leaders disagree; a real-time player can omit it).
- **BUILD (nobody ships it):** an explicit **era/decade station row** (80s, 90s…) — every leader buries era in free text although their own guides say era+genre is the highest-leverage descriptor; combined era×scene stations ("new york cafe", "office hours") exist only as static playlists (ElevenMusic mixes) — never as *steerable generation presets*. With Lyria RealTime's weighted-prompt mixing underneath, a station = a curated weighted-prompt bundle, which no consumer competitor exposes.
- **AVOID on the casual surface (every leader hides these):** seed, strengths, steps, BPM, key, negative prompts, quality/speed. Also avoid a static mega genre menu as the primary input — prompt-first leaders deliberately don't ship one.
- **Vocal caution:** our Lyria engine is instrumental-first (VOCALIZATION = wordless). The lyrics/instrumental/random control must map honestly onto what the 35-parameter contract can deliver; verify before promising sung lyrics. [project-side check, out of this slice's scope]

# Source register

Legend: date accessed 2026-08-29 for all. [FULL] = complete page text read this session; [PARTIAL] = extended extracts read via search tool; [ABS] = title/snippet only.

| # | Source (URL) | Class | Read | Supports |
|---|---|---|---|---|
| 1 | docs/research/competitors/2026-08-13-ai-song-generation-ui-and-menus.md (local) | project primary | [FULL] | Suno/Udio/Flow/Vertex structure baseline; no-duplication boundary |
| 2 | elevenlabs.io/docs/eleven-creative/products/music | official | [FULL] | ElevenMusic create flow, Duration/Auto, Variants, Audio Reference, Finetunes, 3s–10min, 4 languages, include/exclude styles |
| 3 | elevenlabs.io/docs/overview/capabilities/music/best-practices(.mdx) | official | [PARTIAL] | "instrumental only" phrase, BPM/key in prompt, length in prompt |
| 4 | elevenlabs.io/blog/composer-section-by-section-song-editing-in-elevenmusic | official | [PARTIAL] | Composer, per-section edit, Vocals (2026-07-22), Sounds (2026-08-13) |
| 5 | elevenlabs.io/blog/introducing-music-v2 | official | [PARTIAL] | Music v2, three platforms |
| 6 | musicbusinessworldwide.com — ElevenMusic iOS launch | 3P news | [PARTIAL] | app controls: length, lyrics on/off, writing style; 7/day |
| 7 | techcrunch.com 2026-04-02 ElevenMusic | 3P news | [PARTIAL] | mood stations Focus/Energy/Relax/Late Night/Cosmic/Chill |
| 8 | musicbusinessworldwide.com — Eleven Music launch (2025-08) | 3P news | [PARTIAL] | launch date, licensing posture |
| 9 | help.udio.com "Prompt Like a Master" | official | [PARTIAL] | Suggested Tags, Custom Lyrics Editor, Instrumental Mode, Manual Mode |
| 10 | howtogeek.com Udio UX article | 3P | [PARTIAL] | dice, Manual Mode placement, Lyrics 3-state, 200–350 char advice |
| 11 | artificial-intelligence-wiki.com Udio prompt guide (2026-05-27) | 3P | [FULL] | bracket commands, prompt/lyric strength, Manual vs Auto, Style Reduction |
| 12 | producer.musicradiocreative.com Udio tutorial | 3P | [PARTIAL] | Instrumental/Custom/Auto-generated selector |
| 13 | YouTube "Mastering UDIO" transcript | 3P | [PARTIAL] | clip length 30s/2min, suggested-tag pick-up ("rare grooves") |
| 14 | startwebtools.com Suno how-to | 3P | [PARTIAL] | Simple Mode contents, dice, two variants |
| 15 | james-palm.medium.com Suno beginner guide | 3P | [PARTIAL] | Instrumental toggle, Inspiration bubbles, Weirdness/Style Influence behavior |
| 16 | geekonai.com Suno guide | 3P | [PARTIAL] | Use Random Style button, Explore wheel |
| 17 | musci.io Suno tags compendium (2026-01-04) | 3P | [FULL] | community tag families, era best practice, tag-count guidance |
| 18 | apipass.dev 50 Suno tips | 3P | [PARTIAL] | slider recs, bookmark/steal-style patterns |
| 19 | blog.google ImageFX/MusicFX update | official | [PARTIAL] | expressive chips, 70s length, loops |
| 20 | deepmind.google MusicFX DJ post | official | [PARTIAL] | weighted prompt mixing, bass/drums add-remove, bright/dark etc. |
| 21 | blog.google Jacob Collier Lab Sessions | official | [PARTIAL] | fast/slow + bright/dark controls, 60s sharing |
| 22 | androidpolice MusicFX guide | 3P | [PARTIAL] | I'm feeling lucky, chips dropdown, Looping, DJ sliders, temperature |
| 23 | musicradar MusicFX DJ | 3P | [PARTIAL] | ≤10 layers, dice, shuffle, no export |
| 24 | undetectr MusicFX 2026 review | 3P | [PARTIAL] | 2026 state: chips stacking, 30–70s, DJ = live not export |
| 25 | webeducationservices MusicFX marketing guide | 3P | [PARTIAL] | DJ tag dropdowns: Instruments/Genre/Tempo/Effects |
| 26 | ai.google.dev/gemini-api/docs/realtime-music-generation | official | [PARTIAL] (fetch timed out ×2; parameter table recovered verbatim via search extract) | full Lyria RealTime config |
| 27 | ai.google.dev/gemini-api/docs/models/lyria-realtime-exp | official | [PARTIAL] | model card: PCM 48kHz, 2s latency |
| 28 | qiita.com kai_kou Lyria RealTime write-up | 3P dev | [PARTIAL] | independent confirmation of parameter table, 10-min cap, no vocals |
| 29 | fallendeity.github.io Gemini cookbook (TS) | 3P dev | [PARTIAL] | WeightedPrompt/config shapes, scale enum example |
| 30 | riffusion.com/docs/create/vibes | official | [PARTIAL] | Vibes mechanics verbatim |
| 31 | allthings.how Riffusion how-to | 3P | [PARTIAL] | Prompt vs Compose, Ghostwriter, advanced options |
| 32 | musicful.ai Riffusion review | 3P | [PARTIAL] | Prompt/Compose split, 4 layers, negative prompts |
| 33 | nerds-life.com Riffusion guide | 3P | [PARTIAL] | same controls, independent |
| 34 | stability.ai Stable Audio 2.5 prompt guide | official | [PARTIAL] | Genre+Tempo+Mood grammar, BPM bands, title trick |
| 35 | allthings.how Stable Audio how-to | 3P | [PARTIAL] | Prompt Library, Duration, Add Extras (Steps/Results/Seed/Strength) |
| 36 | aiupdate.substack Stable Audio | 3P | [PARTIAL] | extras semantics, audio-to-audio flow |
| 37 | audiocipher.com Stable Audio 2.0 review | 3P | [PARTIAL] | prompt library cards, model selector, input audio |
| 38 | mubert.com/render/how-it-works | official | [PARTIAL] | 3 entry methods, Track/Loop/Jingle/Mix, 15s–25min |
| 39 | mubert.com/render/genres | official | [PARTIAL] | genre picker copy, 5s–25min claim |
| 40 | mubert.com/api | official | [PARTIAL] | 150+ genres / 50+ moods; params endpoint; intensity |
| 41 | codingem.com Mubert review | 3P | [PARTIAL] | "Run 160", "Christmas", Set type observed |
| 42 | endel.io + /soundscapes + /technology | official | [PARTIAL] | 4 soundscapes, Scenarios, Autoplay, inputs |
| 43 | endel.zendesk.com FAQ | official | [FULL] | free core soundscapes incl. Wind Down (Alexa), Scenarios+timer, controls |
| 44 | Endel App Store listing | official store | [PARTIAL] | artist soundscapes list |
| 45 | brain.fm Google Play + App Store listings | official store | [PARTIAL] | 4 modes, genres, stimulation level, ADHD boost, Pomodoro |
| 46 | brainfm.helpscoutdocs.com (Focus; Relaxation) | official KB | [PARTIAL] | activity definitions verbatim |
| 47 | workbrighter.co brain.fm walkthrough | 3P | [PARTIAL] | full state×activity×genre×neural-effect flow |
| 48 | soundraw.io homepage | official | [PARTIAL] | genre blending, mixer, 30+ genres |
| 49 | aumiqx.com Soundraw review | 3P | [FULL] | verbatim mood/genre/theme lists, tempo/duration, batch-of-15, editor |
| 50 | toolchase.com Soundraw (checked 2026-08-02) | 3P | [PARTIAL] | 30+ genres list variant |
| 51 | cybernews Soundraw review | 3P | [PARTIAL] | parameter set confirmation |
| 52 | loudly.com/ai-music-generator + blog song-formula | official | [PARTIAL] | full formula: genre/blend/duration/instruments/energy/structure/BPM/key |
| 53 | flow-music.app Loudly page + AI-wiki Loudly guide + YT tutorial | 3P | [PARTIAL] | blend ratio, 3 tracks/run, structure names |
| 54 | appsumo Beatoven listing | official-adjacent | [PARTIAL] | 8 genres × 16 moods, per-section moods |
| 55 | best-aitool + aiindigo + windowsreport Beatoven | 3P | [PARTIAL] | flow: genre→cuts→moods→compose |
| 56 | toolscompare.ai Boomy | 3P | [PARTIAL] | style category list, create flow |
| 57 | aiva.crisp.help General User Manual | official | [PARTIAL] | Create Track menu, styles/chords/influence, settings |
| 58 | aiva.ai homepage | official | [PARTIAL] | 250+ styles, durations by plan |
| 59 | fullstackcreators + AI-wiki AIVA | 3P | [PARTIAL] | preset examples, theory-heavy UX judgment |
| 60 | reviewnexa Sonauto review + creativeaininja Medium + grokmusic | 3P | [PARTIAL] | 3 modes, genre table, bracket tags |
| 61 | Google Play Mureka listing (2026-08-24) | official store | [PARTIAL] | V9.5, text/image/video input, scene radios |

Counts: **61 register rows; ~28 first-party/official surfaces; 7 sources read [FULL] (incl. 1 project primary); 0 [ABS] used for claims.** Slice floor (≥8 independent authoritative sources read, primary-first): exceeded.

# Query ledger (exact searches run, in order)

1. `AI music generator 2026 simple mode input controls genre picker mood vocal toggle comparison`
2. `new AI music generation apps launched 2025 2026 text-to-music entrants Riffusion ElevenLabs Music Mureka Sonauto`
3. `Suno help center Create simple mode "styles" field "Use Random Style" "Inspire" genre suggestions 2026`
4. `Udio create page "suggested tags" list auto mode lyrics instrumental toggle help.udio.com`
5. `ElevenLabs Eleven Music web app controls song length instrumental vocals toggle "writing style" documentation`
6. `Google MusicFX DJ input controls genre chips suggested prompts track length loop mode labs.google`
7. Fetch `ai.google.dev/gemini-api/docs/music-generation` — timed out (×2, second attempt with same URL)
8. `Riffusion Producer.ai create song controls prompt vibes instrumental toggle 2025 2026`
9. `stableaudio.com web app controls duration slider prompt library steps model selector audio input` — search error on first attempt; retried as #10
10. `Stable Audio web app interface prompt duration slider "add extras" genre mood tempo user guide`
11. `Mubert Render generate track by mood genre activity duration list of moods genres activities`
12. `Lyria RealTime API MusicGenerationConfig bpm density brightness scale guidance mute_bass prompts weighted`
13. `Endel app modes list Focus Relax Sleep Activity scenes soundscapes how it works`
14. `brain.fm app choose mental state Focus Relax Sleep activities list deep work study meditation genre options`
15. `Soundraw select mood genre theme length tempo list of genres moods themes 2026`
16. `AIVA create track from style list preset styles emotion key signature duration options`
17. `Boomy create song style categories "Electronic Dance" "Rap Beats" "Lo-Fi" "Global Groove" "Classical" choose style`
18. `Beatoven.ai select genre mood list 16 moods genres tempo duration controls`
19. `Loudly AI music generator choose genre energy instruments duration structure controls list`
20. `MusicFX DJ prompt suggestions categories instruments genres "vibes" list examples review`
21. `Sonauto AI music generator input controls tags styles list Mureka simple mode controls genre mood selection`

Full-page reads from saved captures: Endel FAQ, ElevenLabs Music docs, aumiqx Soundraw, AI-wiki Udio guide, musci.io Suno tags; plus the local 2026-08-13 UI study and the covenant.

# Contradiction ledger

| # | Subject | A | B | Status |
|---|---|---|---|---|
| 1 | Riffusion → Producer.ai rebrand + Google acquisition (2026-02) with Lyria 3 integration | Search-engine synthesis asserted it | riffusion.com docs still live and branded Riffusion at access | **[UNVERIFIED]** — no primary read; do not carry as fact |
| 2 | Suno Creative Slider names (Weirdness/Style Influence/Audio Influence) | Named consistently by [3P] guides | First-party names the concept, not the labels | names remain **[3P]** (carried over from 2026-08-13 study) |
| 3 | MusicFX classic track length | First-party blog: "up to 70 seconds" | [3P] 2026 review: "typically around 30 to 70 seconds" | compatible; exact stepper values NOT OBSERVED |
| 4 | Soundraw genre count | toolchase (2026-08-02): 30+ | unrola: 25+; aumiqx names 10 primary | counts differ by date/counting method; primary list adopted from aumiqx verbatim |
| 5 | Mubert value-count claims | /api page: "150+ genres, 50+ moods and themes" | /render page: "200+ moods and themes" | both first-party, inconsistent; preserved, not averaged |
| 6 | Mubert minimum duration | /render/how-it-works: "from 15s" | /render/genres: "from a short 5-second intro" | both first-party; unresolved |
| 7 | brain.fm human vs AI music | Google Play: "composed by real humans, not AI" | App Store: "patented A.I. on top of human-composed music" | reconcilable (human-composed, AI-modulated) but wording conflicts; preserved |
| 8 | Udio Manual Mode placement ("above Suggested Tags") | [3P howtogeek] | no first-party placement statement | [3P] only |
| 9 | ElevenMusic app control list | MBW and TechCrunch give identical lists (length, lyrics toggle, writing style) | both are 3P describing the same product | treated as 2-source corroborated product fact; first-party app-store copy not read — residual [PARTIAL] |
| 10 | Beatoven's 16 moods full enumeration | appsumo names 3 examples; aiindigo names 5 different examples | no source enumerates all 16 | **NOT FOUND IN THE SEARCHED SCOPE** — login-gated |

# Known gaps

1. **No product screen was seen; zero screenshots.** All control claims are documentary. Visual layout, control order, and defaults remain UNVERIFIED for every product.
2. **Login-gated value lists not enumerable:** Suno's live "Inspiration" bubble values; Udio's live Suggested Tags (dynamic by design); Beatoven's full 16 moods and 8 genres; Mureka's create-screen values; Boomy's current sub-styles; AIVA's 250+ style names; Mubert's full 150+ genre / 50+ mood enumeration (the API `params` endpoint would enumerate it — requires a key).
3. **Lyria RealTime official docs page could not be fetched directly** (timeout ×2); the parameter table was recovered verbatim from search extracts and corroborated by two independent developer articles. Treat as [PARTIAL] official.
4. **Suno first-party help-center pages were not re-fetched this session**; Suno facts rest on the archived 2026-08-13 release-notes capture plus [3P] guides.
5. **No CN/JP/KR product surfaces examined** (Tencent/ByteDance/Alibaba music apps; carried over as a standing blind spot from the 2026-08-13 study).
6. **ElevenMusic iOS App Store listing itself was not opened**; its control list is 2×[3P] press describing the product.
7. Riffusion/Producer.ai corporate status (gap tied to contradiction #1).

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT





