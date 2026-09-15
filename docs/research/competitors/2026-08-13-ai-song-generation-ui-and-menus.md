# Standards ledger

Governance files read IN FULL this session, before any external action:

| Governing file | Path | Evidence |
|---|---|---|
| Deep-research covenant (merged rule + skill; PART I + R0–R18 + annexes P1–P5) | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` | SHA-256 `35DE1E582310915D42386C177348FA1B39D949D4D207FED37463D43C3581398E`, 117,261 bytes, re-hashed from disk this session |
| Project contract | `c:\Berk\SsmContentAssetCreator\AGENTS.md` | SHA-256 `D18A2C1CD201C4C3BFDB9F62FF22502C5B48CDCBA201C2728EC7ABB4083B1B4E` |
| Research standard + delegation mandate | `c:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | read from disk this session |
| Approved R3 scope plan | `c:\Berk\SsmContentAssetCreator\docs\research\_runs\2026-08-13-ai-song-generation-platform.scope-plan.md` | read from disk this session |

Governed research root per R15.1/R18.4: `docs/research/`. Artefact language: ENGLISH; the owner's Turkish appears only as verbatim quoted evidence.

---

# BAD NEWS FIRST — the honest limit of this document, stated before any content

**I did not see any of these products' interfaces.** Every one of them requires an account to reach the Create screen, and the brief forbids creating accounts, starting trials or spending money. Berk's own standing law also forbids me describing visual quality I cannot see.

**Therefore this document reconstructs each product's navigation and control surface *exclusively* from the vendors' own written descriptions of it** — help-centre step-by-step instructions, release notes that name menus and the click paths to them, pricing-page feature grids, and API/console documentation. Those are strong sources for **structure** (what screens exist, what a menu contains, where a control lives, what the create flow's steps are) and they are **no evidence at all** for **appearance** (layout, spacing, typography, colour, motion, responsiveness quality).

Every row is therefore labelled:
- **`PATH-DOCUMENTED`** — the vendor itself wrote the click path or named the menu.
- **`GRID-NAMED`** — the control appears as a named row/feature on the vendor's own pricing or feature grid.
- **`CHANGELOG-NAMED`** — the vendor's release notes name the screen or control, with a date.
- **`CONSOLE-DOCUMENTED`** — a first-party console walkthrough (Google only).
- **`[3P]`** — a third-party description of the interface. Useful for discovering that a control exists; never adopted as fact.
- **`NOT OBSERVED`** — with the reason.

**Visual quality: UNVERIFIED for every product in this document.** If a visual judgment is needed, the screens that must be looked at by a human are named at the end.

**Observation date: 2026-08-13.**

# Outcome first — the four navigation facts that most change the BUILD decision

1. **The category has converged on one information architecture, and it is not a form — it is a two-mode create screen plus a right-click action menu on every song.** Suno and Udio both put *Simple/Custom* (or auto/Manual) at the top, hide the power controls behind a disclosure labelled **Advanced Options**, and expose every transformation (Cover, Extend, Remix, Replace Section, Crop, Get Stems, Mashup, Use as Sample, Make a Persona) from the **`...` / right-click More Actions menu on a song row**. Suno documents that path in its own release notes repeatedly: "**Right-click on any sound in Suno, then choose Mashup or Use as Sample from the Remix/Edit options.**"
2. **Advanced controls are a *paid disclosure*, not a screen.** Suno's Exclude Styles, Creative Sliders, Replace Section, Crop, Sounds and Advanced Split are each gated to Pro/Premier by the vendor's own announcements; Udio's Inpaint, upload, Edit and Sessions are "available only for paid subscribers", with Styles-in-Sessions "exclusively for Pro subscribers". The interface pattern is: **the control is visible but locked, and unlocking it is the upsell.**
3. **Google is deliberately building the opposite interface: a conversation instead of a panel.** Flow Music's feature grid names **"Producer"** — a Gemini-powered agent you talk to ("make the bass punchier") — and there is no evidence of numeric sliders anywhere in its surface. Google's own Vertex console surface is likewise minimal: Music → Task: Text-to-music → Model → optional Input assets → Prompt → Run. **The category is splitting into slider-panel products and conversational products.**
4. **Two products have a real timeline/DAW surface, and both put it behind the top tier.** Suno Studio (Premier only) is "the first-ever generative audio workstation" with a multitrack timeline, BPM/volume/pitch control, Warp Markers, Time Signature Support, Remove FX, Alternates, and stem/**MIDI** export. Udio Sessions is "Udio's timeline editing view", waveform-centric, all paid tiers, with Styles inside it for Pro. **A generation API that returns only a finished mix cannot feed either of these surfaces — stems and structure metadata are what a timeline needs.**

---

# A1 Suno — the screen inventory and every documented click path

**Sources:** `https://www.suno.com/release-notes` read in full 2026-08-13 `[FULL]` (995 lines; archived at `docs/research/_sources/2026-08-13-suno-release-notes-changelog.txt`); `https://suno.com/pricing` `[FULL]`; the help-centre article "How do I exclude elements of a song?" `[via search-result page text]`.

## Screens and sections Suno names itself

| Screen / area | How Suno refers to it, and what it contains | Class |
|---|---|---|
| **Create** | the generation screen; has a **Custom** toggle ("Go to Create and select 'Custom'") and a **Custom dropdown** that now also contains **Sounds** ("go to Create, choose Sounds from the Custom dropdown"); holds the prompt box, Lyrics field, Styles field, the **Duration slider** (2026-07-20, v5.5, web), the **Creative Sliders**, **Advanced Options**, a **"Need ideas?"** section, a **Use Random Style** button, **Inspire**, **Magic Song Descriptions**, **Magic Wand** (applies My Taste), a **Lyrics Model Selector** (mobile 2026-05-14), **Vocal Gender** male/female, **Memory** (remembers last prompt), and a **Create a new Workspace** link "under the prompt box" | CHANGELOG-NAMED + PATH-DOCUMENTED |
| **Advanced Options** | a disclosure inside Custom Mode; per Suno's help centre "**Click on Advanced Options to open a menu that starts with Exclude**". At launch the control was an **"Exclude Styles" switch** that reveals a text section | PATH-DOCUMENTED |
| **Lyrics editor** | redesigned 2026-07-09: **full-screen editor**, **Lyricist** (save example lyrics as a reusable voice), **natural-language editing**, **Variations and References** (highlight a word → rhymes or a full line), **Song structure labels** ("Add labels like 'Verse' and 'Outro'"), **autosave** | CHANGELOG-NAMED |
| **Song row `...` / right-click → More Actions** | the transformation hub. Documented sub-menus: **Create** → "Cover Song", "Make a Persona"; **Edit** → "Replace Section", "Crop Song", "Song Details", "Get Stems"; **Remix/Edit** → "Mashup", "Use as Sample"; plus "Reuse Prompt", "Extend", **Move to Trash**, **Song Radio** | PATH-DOCUMENTED (multiple release notes give the exact hover/click sequence) |
| **Edit Mode** (Replace Section) | entered from Edit → Replace Section; "You'll be taken into Edit Mode with the song. Select the song portion you wish to recreate (**must be 10-30 seconds long**). Lyrics (if present) will automatically be populated into the **Lyrics box**"; generates **two versions** with a **Select** button on each | PATH-DOCUMENTED |
| **Crop** UI | "Use the **pink waveform selectors** to pick the start / end"; **desktop-only** at launch — "We are working to port these to tablet-web and mobile-web" | PATH-DOCUMENTED |
| **Song Editor** (2025-06-03) | "reorder, rewrite, and remake your track **section by section, directly from the waveform**" | CHANGELOG-NAMED |
| **Song Page** | holds **Styles** section (excluded styles shown with a leading `-`, e.g. `-piano`), **Edit Displayed Lyrics** at the bottom of the page (with the caveat "editing Lyrics will not update the lyrics sung in the song"), Song Details, comments, cover art / looping video art (10 s or less, 9:16, MP4, 720 px tall) | PATH-DOCUMENTED |
| **Song Preview sidebar** | shows the Styles list including exclusions | CHANGELOG-NAMED |
| **Suno Studio** (Premier) | "the first-ever generative audio workstation": upload samples / pull from library / break into stems; "Create infinite stem variations"; "Edit in a **multitrack timeline**… Control **BPM, volume, pitch**"; "Export everything → Send stems out as **audio or MIDI**". Studio 1.2 (2026-02-16) added **Remove FX, Warp Markers, Time Signature Support, Alternates** | CHANGELOG-NAMED |
| **Library** | search across **Song Titles / Style / Lyrics**; page-number jump ("click on the Page Number to enter a page number"); multi-select with shift; **View Trash** under More Actions with restore and Delete Permanently; Following/Followers lists; playlists | PATH-DOCUMENTED |
| **Workspaces** | created from under the prompt box; remixes auto-save into the original's workspace; bulk move via shift-select then right-click | PATH-DOCUMENTED |
| **Explore / Home** | Global Trending "in multiple languages", creator recommendations, playlists, infinite scroll, New/Trending/Liked categories, Suno Showcase, **Explore Styles** (click a style on a song to see others), **Song Radio** | CHANGELOG-NAMED |
| **Search** | public song search by Title / Tags / Lyrics; **Users** search (`/search?type=user`); playlist search (`/search?type=playlist`) | PATH-DOCUMENTED (Suno prints the URL patterns) |
| **Profile** | Edit Profile → display name + handle (`suno.com/@handle`); upload profile/cover/playlist images and regenerate them via prompt (Pro/Premier); **Pin Favs with Caption** (up to 5, mobile); Manage Profile (cover image, bio, social links); playlists on profile | PATH-DOCUMENTED |
| **Listen & Rank** | rate other creators' clips to earn credits | CHANGELOG-NAMED |
| **Hooks** | pair your own video with a song to make a short-form music video; free | CHANGELOG-NAMED |
| **Sounds** mode | one-shot vs **loop** choice; for loops, **key and tempo (bpm) selectors** | CHANGELOG-NAMED |
| **Scenes** (iOS) | photos/videos → soundtrack; US-only at launch | CHANGELOG-NAMED |
| Feedback affordance | thumbs up / thumbs down on every clip, repeatedly described as the mechanism that improves Exclude Styles and Covers | PATH-DOCUMENTED |

## Suno's create flow, step by step, as the vendor documents it

1. Go to **Create**; choose **Simple** or select **Custom** (or pick **Sounds** from the Custom dropdown).
2. In Custom: write or generate **Lyrics** (or toggle **Instrumental**), optionally adding `[Verse]`/`[Chorus]`/`[Instrumental Break]`/`[drum break]` structure labels and `[female vocals]`-style directions inside the lyrics.
3. Fill the **Styles** field (positive description).
4. Optionally set the **Duration slider** (web, v5.5).
5. Optionally set the **Creative Sliders** — "fine-tune how weird, structured, or reference-driven your generations get" (Pro/Premier).
6. Open **Advanced Options** → **Exclude** → enter unwanted instruments/styles/vocal-styles (Pro/Premier).
7. Optionally **Upload Audio** (record or file, 6–60 s for audio input; up to 8 min Free / 30 min paid for full uploads) and choose **extend** from a chosen **time stamp**.
8. Optionally apply a **Persona** or a **Custom Model** (trained from ≥6 of your own tracks) or a **Voice** (your recorded voice).
9. **Create** → results land in Create and Library; iterate via the `...` menu (Extend, Cover, Replace Section, Crop, Get Stems, Mashup, Use as Sample, Remaster).

**Mobile vs web, from Suno's own notes:** Vocal Gender came to mobile in May 2026 "just like on web" — i.e. web led; Crop and Edit Details were **desktop-only** at launch; the **Duration slider is web-only**; iOS gained **Extend** in Feb 2025 with "Covers & Personas coming soon"; iOS adds **iMessage keyboard** creation, **Notes** lyric sharing (auto-transcribed), **Voice Memos** audio attach, **Scenes**, and **CarPlay/Android Auto** playback. **Feature parity is web-first, with mobile-exclusive input affordances.**

---

# A2 Udio — the screen inventory and documented click paths

**Sources:** `https://www.udio.com/pricing` `[FULL]` (feature-grid row names); help-centre articles "Create Music with Your Own Audio" (2025-07-23), "Edit Your Song Music and Lyrics" (2026-01-06), "Sessions: Udio's timeline editing view", "Credits and credit limits" (2025-10-29) `[via search-result page text]`, one of which I also fetched directly `[FULL]`; `https://www.udio.com/blog/two-minute-model-new-controls` fetched `[FULL]`.

| Screen / area | Contents, as Udio describes them | Class |
|---|---|---|
| **Create** | prompt box; **Suggested Tags**; a **Manual Mode** toggle located "**above the 'Suggested Tags'**" `[3P]` which disables Udio's automatic prompt enhancement; a **Lyrics** option defaulting to **Auto-Generated** with a **Custom** alternative `[3P]`; an **Instrumental** marking for a section; the **advanced features dropdown** | `[3P]` for placement; the controls themselves are first-party |
| **advanced features dropdown** | Udio's own blog names four: **random seed** (manual mode only), **prompt strength**, **lyrics strength**, **clip start-time** (0% = beginning, 50% = middle, 90% = from the end), **generation-quality slider** (quality ↔ speed). Third-party adds **Context Length** and **Style Reduction** `[3P]` | CHANGELOG-NAMED (first four+slider) |
| **Upload button** | "towards the **top right**, or from the many 'upload audio' prompts throughout the service"; opens five choices: **Extend** (before or after your audio, your choice), **Inpaint** (select all or part), **Session** (waveform-centric editor), **Remix**, **Style** | PATH-DOCUMENTED |
| **Library** | select a song → **Edit** opens the editor | PATH-DOCUMENTED |
| **Editor** | "Choose what to modify: **Replace Section** (Change mood, instruments, or style) / **Edit Lyrics** (Adjust words, lines, or entire verses)"; "Highlight the section you want to edit using the **selection tool**"; then **Edit** to apply | PATH-DOCUMENTED |
| **Sessions** | "Udio's **timeline editing view**", waveform-centric; available to all paid subscribers; **Styles within Sessions** is "an experimental **Early Access** feature exclusively for **Pro** subscribers"; extensions and replacements inside Sessions bill credits identically to outside | PATH-DOCUMENTED |
| **Pricing/feature grid rows** (the closest thing to a menu map Udio publishes) | Create Brand New Songs · Create 32 second songs · Create 130 second songs · **Create songs with Udio's library of Voices** · **Save & reuse your own Voices** · Upload your own audio files · Transform Songs · Extend songs · Remix songs · **Create with Styles (use a musical reference)** · **Use premium Artist Styles** · **Blend Styles** · **Reduce Styles** · Edit music and lyrics · Share & Upload Your Music · Generate cover art · Upload your own cover art · **Adjust song access permissions** | GRID-NAMED |
| **Credit display** | changed by user request from credits-used to **credits-remaining**, with hover for "a detailed breakdown as well as a **countdown to your next refresh**" | CHANGELOG-NAMED |
| **Left panel** | `My Creations`, `Liked Songs`, **`Following`** feed | CHANGELOG-NAMED |
| **Error messaging** | "more fine-grained messaging for generation errors… a better understanding of what is triggering a **moderation** error" | CHANGELOG-NAMED |
| **Download UI** | **REMOVED** — "downloading of audio, video, and stems has been disabled" (2026-02-17) | PATH-DOCUMENTED |
| Mobile | **NOT OBSERVED.** No first-party Udio mobile app documentation was retrieved; no App Store/Play listing was opened | NOT OBSERVED — explicit gap |

**Udio's create flow as documented:** enter a prompt (optionally enable **Manual Mode** to stop auto-enhancement) → accept auto-generated lyrics or switch to **Custom** (third-party guidance notes each snippet is short, so "keep the lyrics short at 200–350 characters" `[3P]`) → optionally open **advanced features** and set seed / prompt strength / lyrics strength / clip start-time / generation quality → **Create** (which produces **two** songs) → iterate with **Extend**, **Remix**, **Inpaint**, **Edit**, **Sessions**, **Trim** (free).

**The interaction consequence of Udio's credit model on its own UI:** because "Every time you click Create, Extend, Remix, Inpaint or Edit, **two** new songs are created", the interface is inherently an **A/B chooser** at every step — the same pattern Suno uses for Replace Section ("Two versions will be generated. Listen to both and click 'Select'"). **Both leaders present a pairwise choice rather than a single result.** That is a product-design fact worth carrying: it converts model non-determinism into a feature.

---

# A3 Google Flow Music and B1 the Vertex console — the conversational alternative

| Surface | Contents | Class |
|---|---|---|
| **Flow Music feature grid** (`flowmusic.app/pricing`, fetched `[FULL]`) | Rows named by Google itself: **Credits** (with "Daily top-ups") · **Concurrent generations** (2/8/12/16) · **Lyria Models** · **Producer** · **Projects** · **Downloads (mp3, wav, m4a)** · **Stem downloads** · **Publishing** · **Image and Video generation** · **Progress** · **Member access** (badge, exclusive events, exclusive merch, early feature access) | GRID-NAMED |
| **Producer** | the conversational editing agent. `[3P]`: "chat with an AI 'Producer' like you're in a studio, tweaking every detail"; edits expressed as natural language such as "make the bass punchier" or "translate lyrics". `[3P]` also reports **no** slider panel — "Granular editing and style transformations are handled through this interface rather than manual knobs or faders" | `[3P]` for behaviour, GRID-NAMED for existence |
| Other reported surfaces | `[3P]`: remix audio with effects, stem splitting, AI music videos via Veo, a **"Vibe-code"** feature for building custom audio plugins/music games/DAW environments inside the platform, publishing + playlists + following, style learning over time; web-based, "no dedicated mobile app" per one source while another reports an **iOS app in May 2026** — **contradiction, both `[3P]`, unresolved** | `[3P]` |
| **Vertex AI Studio console** (`cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music`, fetched `[FULL]`) | The complete first-party click path: "**Generate Media > Generate media** page → click **Music** → from the **Task** menu select **Text-to-music** → from the **Model** menu select a model → *Optional:* in the **Input assets** section click **Add** → in the **Prompt** box enter your text prompt **in US English** → click **Run**." Then: "Generated audio clips are available for preview and **downloadable as WAV files**." | CONSOLE-DOCUMENTED |

**Two observations that matter for our own UI.** First, **Google's own console exposes an "Input assets" control for music that has no documented Lyria 3 audio-input parameter** — a console/API asymmetry worth probing rather than assuming. Second, **Google is betting that a chat agent replaces the advanced panel entirely.** If that bet is right, a product that ships a 20-slider panel is building last year's interface; if it is wrong, the panel is the moat. This document cannot resolve which — it can only record that the two leading architectures now disagree.

---

# The rest of the universe — UI evidence, item by item, including where there is none

| # | Entity | UI / control-surface evidence | Class |
|---|---|---|---|
| A4/B2 | **ElevenLabs Eleven Music** | Its *product* UI was not observed. What **is** first-party and structural: the pricing page names **"Music"** as one product among Text to Speech, Speech to Text, Voice Changer, Sound Effects, Voice Isolator, Image & Video, Automatic Dubbing, **Dubbing Studio**, Voices, **Studio**, **Productions**, with **"20 Projects in Studio"** at Starter and 3 at Free — i.e. a **Studio project container** and a **workspace-seat** model (3 at Scale, 10 at Business). The **JSON composition plan is effectively the UI** for developers: the docs' own worked examples show the shape a UI would bind to, and the guide explicitly teaches a two-step "generate a plan from a prompt, **modify the plan**, then compose" flow — which is a *documented editing model*, not a screen | GRID-NAMED + API-DOCUMENTED |
| A5 | **Mureka** | Product UI NOT OBSERVED. `[3P]` reports a lyrics-first flow, reference-track upload, stem separation and DAW/Ableton integration | `[3P]` |
| A6 | **MiniMax** | Consumer UI NOT OBSERVED. The API's own two-step cover flow (**preprocess → returns `formatted_lyrics` + `structure_result` with segment types and timestamps → user edits lyrics → generate**) is an explicit, documented *editing UX contract* even though I never saw a screen | API-DOCUMENTED |
| A7 | **Boomy** | NOT OBSERVED, first-party or otherwise, beyond price. Explicit gap |
| B3 | **Stability / StableAudio.com** | Web product named in the announcement ("You can try Stable Audio 2.5 now at StableAudio.com") but the site was **not opened**. The KB's own prompt guidance is a *usage* surface: descriptive prompts recommended, instructive prompts ("Make this into a metal track") explicitly discouraged, `strength` starting at 0.8 with 0.6–0.9 as the working range | MARKETING-NAMED + KB `[FULL]` |
| B6 | **Soundraw** | Generation described as driven by **Genre, Mood, Theme** selectors plus "customize it easily" — i.e. a **selector-based** rather than prompt-based interface, which is a genuinely different UX family from everything else in this document. Screens NOT OBSERVED | `[via search-result page text]` |
| B7 | **Loudly** | Named product surfaces on its own pages: **Music Generator**, **Music Catalog**, **Text-to-music**, **AI Remixes**, **Stem Splitter**, stem packs, sample packs, **Loudly Distribution**, "Fast generation queue"; consumer tier prints "**30 minutes maximum song length**" | `[via search-result page text]` |
| B8 | **Mubert** | **Mubert Render** is the named consumer surface with Subscription / **Perpetual License** and Monthly / Annual toggles; API plans page has Trial/Startup/Startup+/Custom. Screens NOT OBSERVED; the plan grid did not render reliably | `[PARTIAL]` |
| B9 | **Beatoven.ai** | NOT OBSERVED. Explicit gap |
| B10 | **AIVA** | NOT OBSERVED first-party. `[3P]` reports composer-oriented export (MIDI, sheet music), which implies a score/notation surface unlike any other product here — **worth a targeted look** |
| C1 | **ACE-Step** | No product UI. But the paper's **17-point Usability Checklist** is the most explicit statement of UX requirements published by anyone in this field, and it is first-party research: "Installation Complexity — **User-ready packaged solution (e.g. pip/conda installable), not a fragmented research repository**"; "Time-to-Result — generation latency **must not break the user's creative 'flow state'**"; "The Serendipity Coefficient — rapidly produce high-volume diverse candidates to maximize 'happy accidents'"; "Prompt Robustness — the **'Anti-Gacha' requirement: no mode collapse on weak prompts**"; "Non-Destructive Editing — surgical 'Repaint' capabilities allowing partial edits without regenerating the entire track"; "Identity Consistency — maintain a consistent sonic identity across multiple generations"; "**Exploratory Playability** — Interface allowing fluid toggling between **structured planning and unstructured jamming**"; "Professional Terminology — strict adherence to technical instructions (e.g. 'Sidechain Compression', 'Phrygian Mode', 'TB-303 Acid Line')"; "World Knowledge Grounding — e.g. '1920s Shanghai Jazz', 'Cyberpunk 2077 Soundscape' **without anachronistic hallucination**" | PAPER `[FULL]` |
| C2–C7 | Open weights | No product UI. Community front-ends exist but were not examined | NOT OBSERVED |
| D1–D3 | Tencent / ByteDance / Alibaba | NOT FOUND IN THE SEARCHED SCOPE; no CN-language query was run. Explicit blind spot |
| E1–E6 | Gateways | Developer playgrounds (fal, Replicate, eachlabs "Interactive Playground… fine-tune parameters, and export results without code") — relevant as a pattern: **every serious API vendor ships a parameter playground**, which our own product API would be expected to match | `[via search-result page text]` |

**The one checklist worth adopting wholesale:** ACE-Step's 17 points are the only *published, structured* UX requirement set in this field, they come from a research group that also publishes measured numbers, and several map directly onto this project's existing laws (Anti-Gacha ≈ robustness against weak prompts; Non-Destructive Editing ≈ per-segment regeneration; Identity Consistency ≈ our measured named-voice selection).

---

# Where each advanced control physically lives (the brief's item (d), answered per control)

| Control | Its documented location in the interface | Vendor |
|---|---|---|
| Negative styles / Exclude | **Create → Custom → Advanced Options → Exclude** (the menu "starts with Exclude"); at launch a toggle switch that reveals a text section; results echoed in the **Song Preview sidebar** and on the **Song Page** as `-piano` | Suno |
| Style reduction | a **"Reduce Styles"** row on the plan grid; third-party places it in **Advanced Controls** | Udio |
| Weirdness / Style Influence / Audio Influence | **Create → Custom**, described by Suno as fine-tuning "how weird, structured, or reference-driven" a generation is; third-party places the three sliders **below the Lyrics field** | Suno |
| Seed | **advanced features dropdown**, and **only in Manual Mode** | Udio |
| Prompt strength / lyrics strength | **advanced features dropdown** | Udio |
| Clip start-time | **advanced features dropdown** (0% / 50% / 90% of the song) | Udio |
| Generation quality ↔ speed | **advanced features dropdown** | Udio |
| Duration | a **slider in the Create form**, web only, v5.5 | Suno |
| Key + BPM | **only inside Sounds mode**, and only for **loops** (not full songs); BPM/pitch also inside **Studio**'s timeline | Suno |
| Time signature | **Studio 1.2** only (Premier) | Suno |
| Structure tags | typed **inside the Lyrics field** as `[Verse]`, `[Chorus]`, `[Instrumental Break]`, `[drum break]`; also as **Song structure labels** in the redesigned lyrics editor | Suno |
| Vocal gender | a **Vocal Gender** control in Create (mobile since 2026-05-14, "just like on web"); the documented workaround is `[female vocals]` in Lyrics + "male vocals" in Exclude | Suno |
| Persona | created from a song: **`...` → Create → Make a Persona**, with a **Public/Private toggle**; public personas get their own page and appear in library and profile | Suno |
| Voice (your own singing) | **Voices** — record once in the app (iOS/Android since 2026-08-07), then apply to any song | Suno |
| Custom model | trained by uploading **≥6 tracks**; selectable as a model | Suno |
| Style reference audio | **Upload → Style** ("creates a song that matches the vibe of what you uploaded"); also **Create with Styles**, **Blend Styles**, **premium Artist Styles** as grid rows | Udio |
| Melody / humming seed | **`...` → Create → Cover Song** after uploading a clip of "singing, humming, or playing an instrument" | Suno |
| Inpaint / replace section | **`...` → Edit → Replace Section** → Edit Mode → select **10–30 s** → two candidates → Select | Suno |
| Inpaint (upload path) | **Upload → Inpaint** ("select all or part of the song") | Udio |
| Crop | **`...` → Edit → Crop Song** → pink waveform selectors (desktop-only at launch) | Suno |
| Stems | **`...` → Get Stems**, or **Edit menu → Get Stems**; three modes at the 2026-06-11 update (Auto Split 12 categories / Split from Mix / **Advanced Split ~100 instruments**, Premier) | Suno |
| Mashup / Sample | **right-click any sound → Remix/Edit → Mashup** or **Use as Sample** | Suno |
| Timeline / DAW | **Suno Studio** (Premier) — multitrack timeline, Warp Markers, Alternates, Remove FX, stem/MIDI export | Suno |
| Timeline (waveform) | **Sessions** (all paid; Styles-in-Sessions Pro Early Access) | Udio |
| Conversational editing | **Producer** (chat) — no slider panel evidenced | Flow Music |
| Per-section everything | **the `composition_plan` JSON object** — sections/chunks each carrying text, duration_ms, positive/negative styles, context_adherence, conditioning_ref + condition_strength | ElevenLabs |
| Remix permissions | **Song Details / access permissions** — Suno: "control if your songs can be remixed"; Udio grid row "Adjust song access permissions" | both |
| Feedback | thumbs up / thumbs down on every clip; **Listen & Rank** as a dedicated screen | Suno |

---

# Contradictions preserved

| # | Subject | A | B | Status |
|---|---|---|---|---|
| 1 | Flow Music mobile | One `[3P]` review: "web-based… **no dedicated mobile app**" | Another `[3P]`: "The **iOS app launched in May 2026**; an Android app is in development" | **UNRESOLVED**, both third-party |
| 2 | Suno's three slider names | Changelog names the concept only | Two `[3P]` guides name Weirdness / Style Influence / Audio Influence and cite "Suno, Creative Sliders documentation" | Existence first-party; **names `[3P]`** |
| 3 | Udio Manual Mode placement | — | `[3P]`: "located above the 'Suggested Tags'" | `[3P]` only; not adopted as fact |
| 4 | Flow Music slider absence | `[3P]`: "no official FX Fuzz sliders… conversational agent… rather than manual knobs or faders" | No first-party page enumerates controls either way | **Absence NOT established** — reported as NOT FOUND IN THE SEARCHED SCOPE, not as "there are no sliders" |

# Query log (bearing on this axis)

From the session's 17 queries: #1 broad scoping · #3 Suno advanced options / exclude styles / persona (which surfaced Suno's own help-centre click path) · #6 Udio help centre credits + advanced controls + inpainting + stems · #13 Riffusion/Flow Music sliders and pricing · #14 the B6–B10 vendors.
Direct fetches bearing on UI: `suno.com/release-notes` (995 lines, the single richest UI source in this document) · `suno.com/pricing` · `udio.com/pricing` · `udio.com/blog/two-minute-model-new-controls` · `help.udio.com` ×2 · `flowmusic.app/pricing` · `cloud.google.com/.../music/generate-music` · `elevenlabs.io/pricing` · `elevenlabs.io/docs/.../composition-plans.mdx` · `kb.stability.ai/.../tips-for-using-the-audio-to-audio-api`.

# Known gaps and blind spots in THIS document

1. **No interface was seen.** Zero screenshots, zero logged-in sessions, zero visual assessment. **Visual quality is UNVERIFIED for every product here** and no claim in this document should be read as one.
2. **Udio mobile: nothing.** No first-party mobile documentation or store listing was opened.
3. **ElevenLabs', Mureka's, MiniMax's, Boomy's, Beatoven's, AIVA's, Soundraw's and StableAudio.com's actual product screens: none observed.**
4. **Suno's and Udio's in-product credit/settings/billing screens: not observed** (login-gated).
5. **No accessibility, responsive-breakpoint, keyboard-navigation, empty-state, error-state or loading-state assessment was possible** — all of which this project's own UI law requires before any UI claim.
6. **Flow Music's own feature documentation** beyond the pricing grid was not found; its control surface rests partly on `[3P]`.
7. **No CN/JP/KR interface was examined at all.**

# If a visual verdict is needed, these are the exact screens to look at

Named so a human can do in minutes what I cannot do at all: (1) **Suno → Create → Custom → Advanced Options** (the Exclude field and the three Creative Sliders in one frame); (2) **Suno → `...` → Edit → Replace Section → Edit Mode** (the 10–30 s selection interaction); (3) **Suno Studio** timeline (Premier); (4) **Udio → Create → advanced features dropdown** (seed, prompt/lyrics strength, clip start, quality); (5) **Udio → Sessions** timeline; (6) **Flow Music → Producer** chat during an edit; (7) **Vertex AI Studio → Generate Media → Music** (the one surface we already have access to and can screenshot without a purchase).

# Source counts for this document

First-party/official surfaces used for UI structure: **Suno release notes, Suno pricing, Suno help centre (exclude), Udio pricing, Udio blog, Udio help centre ×2 (upload, edit) + Sessions + credits, Flow Music pricing, Google Vertex console docs, ElevenLabs pricing, ElevenLabs composition-plan guide, Stability KB, Stability announcement, Soundraw API page, Loudly consumer + developer pages, Mubert Render + API plans, MiniMax API guide** = **20 official surfaces**. Papers used for UX requirements: **arXiv 2602.00744 `[FULL]`** (the 17-point usability checklist).

# Universe coverage completion for this document (every enumerated entity accounted for)

Entities without their own row above, stated explicitly rather than dropped (no-narrowing law):

| Entity | UI / control-surface status and reason |
|---|---|
| **C2 DiffRhythm / DiffRhythm 2** | **NOT APPLICABLE — no product interface.** It is inference code plus checkpoints (`github.com/xiaomi-research/diffrhythm2`). Its one UI-relevant published fact is a *control trade-off a UI would have to expose*: block size 5→100 moves PER 0.11→0.23 while RTF moves 0.455→0.176 — i.e. an intelligibility-vs-speed dial, which is exactly the axis Udio ships as its "generation quality" slider |
| **C3 YuE** | **NOT APPLICABLE — no product interface.** Open research model; no vendor surface exists to document |
| **C4 LeVo / SongGeneration (Tencent AI Lab)** | **NOT APPLICABLE — no product interface.** Open repository release; no consumer or console surface retrieved |
| **C5 HeartMuLa** | **NOT APPLICABLE — no product interface.** Open model family; benchmark presence only |
| **C6 Meta AudioCraft / MusicGen** | **NOT APPLICABLE — no first-party product interface found in the searched scope.** Community front-ends exist but were **not examined** |
| **C7 Stable Audio Open** | **NOT APPLICABLE — open weights, no dedicated interface.** Stability's own hosted surface is StableAudio.com (B3 row), which was **not opened** |
| **E3 WaveSpeedAI / E4 CloudSway** | Covered by the E1–E6 row: **developer playgrounds and API consoles**, not music interfaces. Their UI relevance is the pattern itself — every serious API vendor in this market ships a **parameter playground** with prompt fields, a run button and downloadable results, which is the surface our own product API would be expected to match. Their screens were **not observed** |

**One coverage note on Tier C as a whole:** none of these has an interface to compare, but two of them publish the only *explicit written UX requirements* in this field — ACE-Step's 17-point usability checklist (quoted in full above) and DiffRhythm 2's measured quality/latency trade-off table. In a document where I could see no screens, those are the most useful UI evidence available, and both were read `[FULL]`.

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT