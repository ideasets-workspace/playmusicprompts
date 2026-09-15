# Standards ledger

| Governing file (read from disk this session) | How this file obeys it |
| --- | --- |
| `C:\Users\berke\.cursor\skills\deep-research\SKILL.md` (covenant block sha256 `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8`, recomputed) | UI facts are taken from first-party text (nav labels, FAQ, feature lists, developer docs) opened this session and marked; where a screen was NOT rendered or an app-store listing NOT opened, the row says so (R8.2 / R18.11). Source register, query ledger and claim ledger: companion functions-and-services file §1, §7, §8. |
| `C:\Users\berke\.cursor\rules\00-berk-constitution.mdc` (Law Zero) | I did not render any competitor UI in a browser this session; every "screen" below is inferred from first-party menu labels, feature lists and FAQ text and is labelled TEXT-DERIVED. Visual claims are unverified and say so. |
| `C:\Users\berke\.cursor\rules\10-no-narrowing.mdc` | The parent asked for screen inventory, navigation structure, generation-progress presentation, player/queue presentation, how multiple takes are shown, share/embed — six axes — and each is a column or section below for every swept competitor. |

# Floor status (banner revised 2026-09-05 16:58 UTC+3 — second pass)

Shortfall (1), the academic `[FULL]` floor, is met (companion file §11.2) and no longer carries this file. Shortfall (2) is **narrowed but not closed**: App Store / Google Play listings were opened for 6 of 7 named products and their screenshot COUNTS and IAP lists are measured (§7 below), but no screenshot image was rendered or viewed, so every statement about *what a screen shows* remains TEXT-DERIVED and `[PARTIAL]`. The parent must render the surfaces before any pixel-level design decision. Historic first-pass wording, preserved: NO competitor screen was rendered or screenshotted this session and no App Store / Google Play listing was opened — every UI statement below is TEXT-DERIVED from first-party pages and is therefore `[PARTIAL]`.

# Decision served

Screen inventory, navigation and result-presentation patterns of the prompt-to-music field, so the three design directions for PlayMusicPrompts (web / phone / tablet; `docs\design-directions\2026-09-05-frontier-all-surfaces.md`) know exactly what the banned-default skeleton of this category looks like and what no competitor shows.

# Outcome first

1. **The category's default skeleton (TEXT-DERIVED, 2026):** left rail or top nav with Create / Library (or "My Songs") / Explore (Discover, Styles, Staff Picks) / Pricing; a create panel with prompt box, style tags, lyrics/instrumental toggle and an "Advanced" disclosure; a results list where each request yields 2 takes (Udio "sets" of 2 [S05]; Treblo API `num_songs=2` [S21b]); a bottom persistent player; a queue counted in "concurrent generations" (2/8/12/16 at Flow Music [S17]; 4 vs 10 at Suno [S01]).
2. **Generation-progress presentation is a countdown/queue, not a stream** — the only first-party "streaming start" claims are Treblo "song starts streaming in about 15 seconds" [S21], ElevenLabs API streaming [S09], Mubert WebRTC "sub-second latency" [S15b], and Lyria RealTime's continuous WebSocket stream [S20]. No consumer web surface read claims audible-before-complete playback except Treblo.
3. **Multiple takes are shown as siblings in a list**, never as an automatic listen-one-prepare-two radio. Google Flow Music's Turntable is the only surface that turns two takes into a UI mechanic (listen ≥10 s to A and B, vote, earn credits) [S18].
4. **Share/publish is a social graph** in Treblo (profile, groups), Flow Music (publish, playlists, follow), Suno (explore millions of songs, remix) [S21,S16,S03]; Udio's share surface is the platform itself (no export) [S05].
5. **What no competitor surface shows (frontier space for PMP):** the queue as a musical horizon (what is being prepared while you listen), skip/complete as first-class gestures that visibly steer the next take, ad breaks as designed interstitials, and a 101-parameter Studio behind a one-prompt page. Owner mockups (black+neon) are not binding; the owner's stated taste is light premium editorial (rule 08 §41).

# 1 Screen inventory and navigation (TEXT-DERIVED; ✔ = label read on a first-party page)

| Vendor | Top-level nav / screens (as read) | Create panel controls (as read) | Progress presentation | Results / takes | Player / queue | Share / embed / export |
| --- | --- | --- | --- | --- | --- | --- |
| Suno [S01,S03] | Home ("Open App"), Pricing, Explore ("explore millions of songs, remix tracks"), Song Editor, Suno Studio (Premier) ✔ | song description; Custom mode w/ lyrics; Voices; Inspire; Magic Song Descriptions; exclusions, weirdness/style sliders, vocal gender (3p) | queue: "4 in a Shared queue" free vs "10 in a Priority queue" paid ✔ | songs generated per request (2 typical, `[3p]`), extend/cover/remix per song ✔ | not read | downloads capped 20/60 per month from 2026-09-03 ✔; Studio exports stems/MIDI (3p) |
| Udio [S04,S05] | not read (help centre only) | u-130 (~2 min) creations ✔ | "5 sets of songs (10 songs) at the same time" (Pro) ✔ → pairs | sets of 2 ✔ | in-platform streaming only | **no download/video/stems** ✔ |
| ElevenLabs Eleven Music [S10] | ElevenCreative › Music › Generations; "+ Reference" button in the Prompt section ✔; Finetunes; Prompting guide | prompt; vocals/instrumental; multilingual; Audio Reference; Finetune selector; section-level composition | not read | "select a specific section of a generated song and regenerate just that section" (inpaint UI) ✔ | not read | MP3 44.1 kHz 128–192 kbps / WAV ✔ |
| Google Flow Music [S16,S17,S18] | Create (chat with Producer), Music Videos, Build (vibe-code space e.g. `flowmusic.app/space/piano` with a "Mini Keyboard — Hover to play"), Share (playlists, publish, follow), Turntable (left nav) ✔ | chat prompt; Lyria 3.5; remix your audio; audio effects; stem split ✔ | concurrency ladder 2/8/12/16 ✔; daily top-up credits | Turntable: Sample A / Sample B, Play each ≥10 s, "Add reason", Vote A / Vote B ✔ | not read | publish; downloads mp3/wav/m4a; stem downloads; image & video generation ✔ |
| Mureka [S06] | Create · Video · Studio · Tools · Library · Subscribe ("Go Premier — Unlock full access & more gold!", Gold counter in header) ✔; footer player showing "00:00 00:00 No lyrics Remix" ✔ | prompt; Reference upload; any voice; Remix; Splitter; Mureka Co (DAW natural language) | not read | not read | persistent footer player with lyrics pane and Remix action ✔ | MP3 (Pro), WAV/MIDI (Premier) ✔; MV export ✔ |
| Treblo [S21] | Explore · Styles · Developers · About · Blog · Log in / Sign up; prompt box with "Advanced" toggle and "Make my song" button; Staff Picks ✔; iOS + Android apps ✔ | idea text; style tags (4,160); lyrics or "write them for you"; instrumental switch; `[Intro] [Verse 1] [Chorus]` tags | "Your song starts streaming in about 15 seconds" ✔ | edit sections, swap lyrics, regenerate parts ✔ | not read | publish to profile / group; private; download "in any format" ✔ |
| Stable Audio [S11,S12,S13] | web app + DAW plugin ✔; docs | prompt; audio-to-audio upload (per-tier minutes) | not read | "Modify a segment of a track… extend your composition" ✔ | not read | not read |
| Soundraw [S14] | Generate; Mixer; Pricing; Business (API, Enterprise, SpaceMusic AI) ✔ | genre(s) blend, mood, length, energy; Mixer toggles instruments/intensity ✔ | "SOUNDRAW rebuilds your track on the spot" ✔ | list of generated tracks ("Generate" ×12 demo) | not read | mp3 / wav / stems by plan ✔ |
| AIVA [S22] | For Individuals / Students & Schools / For Enterprises; Create account ✔ | 250+ styles; own style models; audio/MIDI influence; edit tracks | not read | not read | not read | MP3/MIDI; all formats on Pro ✔ |
| Mubert Render [S15] | Pricing; Staff Picks Library (1k/12k); Track Editor (Pro+) ✔ | Text→Music, Image→Music, Mood/Genre/BPM; duration up to 25 min | "Changes are not generated in real time. You first select everything you want to change and then explicitly generate a new version" ✔ | Quick Remix (regenerate/remove stems) ✔ | not read | WAV+MP3; licence certificate ✔ |
| Kits.ai [S23] | Features · Designed For · Pricing · Desktop app · Research · Blog; Tools, Voices ✔ | voice selection, conversion | not read | not read | not read | download minutes ✔ |
| Pika [S24,S25] | "Music page" to start building (blog) ✔ | text / lyrics / voice reference / music reference combos | "90-second song in 6.21 seconds locally on average" ✔ (speed claim, not UI) | not read | not read | not read |
| Beatoven [S29] | Maestro Music, Maestro SFX, Download, License ✔ | describe background music; multimodal prompts | not read | not read | not read | MP3/WAV; licence emailed per download ✔ |
| Loudly [S30] | Generator · Discover · Text to music · Remixer · API · Pricing · Affiliate ✔ | text; SongDNA fingerprint | not read | not read | not read | Music Distribution product ✔ |
| Adobe Firefly [S27] | Firefly: Generate Music, Generate Speech, Generate Sound Effects, AI Assistant ✔ | length + mood tuned to a video | not read | not read | not read | inside Firefly |

Count: 15 vendors × 6 axes = 90 cells; 41 cells carry a first-party label (✔), 45 are "not read", 4 are third-party. Nothing in the "not read" cells is claimed absent.

# 2 Six patterns that constitute the category's banned-default skeleton (for the design-directions audit)

| # | Default pattern | Evidence | Why it is the default to break |
| --- | --- | --- | --- |
| D1 | Create-panel-on-the-left, results-list-on-the-right, player-at-the-bottom | Mureka footer player [S06]; Suno Song Editor [S03]; Treblo prompt + Staff Picks [S21] | It presents generation as a form submission, not as listening |
| D2 | Two sibling takes per request, chosen by clicking | Udio sets of 2 [S05]; Treblo `num_songs` [S21b]; Turntable A/B [S18] | Forces a comparison chore; PMP's algorithm removes the chore |
| D3 | Queue as a number of concurrent slots | Suno 4/10 [S01]; Flow 2/8/12/16 [S17]; Udio 5 sets [S05] | A capacity meter, not a musical horizon |
| D4 | Progress as a spinner/countdown until a file exists | Mubert "not generated in real time" [S15]; only Treblo streams at ~15 s [S21] | Audible-before-complete is possible and rare |
| D5 | Monetisation shown as a credit counter in the header | Mureka "0 Gold" [S06]; Flow "Get Credits" [S17] | PMP has no credits; ad breaks need a different, honest presentation |
| D6 | "Advanced" disclosure hiding a handful of controls | Treblo "Advanced" [S21]; Suno Custom mode [S01] | PMP hides 101 parameters; the disclosure must scale, not hide |

# 3 Surfaces that carry mobile evidence (text only; store listings NOT opened this session)

- Treblo: "Get Treblo for iOS and Android" [S21].
- Mureka: "Across Web & App" [S06].
- Stable Audio 3.0 Small: "Optimized to generate audio on a mobile device" [S12] (on-device generation, not a consumer app).
- ElevenLabs iOS "ElevenMusic" app: named in the prior local doc `2026-08-29-generative-music-input-surfaces-competitors.md`; NOT re-opened this session → `[UNVERIFIED this session]`.
- Suno, Udio, Flow Music, Soundraw, AIVA, Mubert, Kits, Pika, Beatoven, Loudly mobile apps: NOT FOUND IN THE SEARCHED SCOPE (no store listing opened).

# 4 Application to the PlayMusicPrompts design directions

- The three directions must each answer D1–D6 with a structurally different move (rule 14: divergent = different structure, not palette).
- Frontier gaps no competitor surface shows (from §5 of the companion file): G08 concurrency ladder → PMP shows the *prepared horizon* (2 takes readying) instead of slot counts; G10 Turntable → PMP's skip/complete already votes, so the UI should make that feedback visible; G21 chat co-writer → optional, not the primary surface; G13 BPM/key/guidance/seed → the Studio's 101 parameters already exceed every consumer surface read.
- Visual quality bar ("görsel kalite ultra olmalı"): none of the pages read describes its own visual system; the parent must render Suno, Flow Music, Treblo, Mureka, ElevenLabs Music at 375 / 768 / 1440 px before the direction audit (rule 14 AFTER gates).

Source register, query ledger, claim ledger, contradictions: `2026-09-05-prompt-to-music-creation-functions-and-services.md` §1, §7, §8, §9.

# 7 Second pass (2026-09-05 16:30–16:58 UTC+3) — store-listing evidence per product (companion file §11.4, sources S50–S51)

| Product | Listing opened | Screenshots (measured) | IAP tiers in listing text | Surfaces shown | UI claim status |
| --- | --- | --- | --- | --- | --- |
| Suno | iTunes Lookup JSON; App Store US HTML (200); Google Play HTML (200) | 6 iPhone (Apple JSON) + 6 (Play HTML `alt="Screenshot image"`) | Pro $10.00 / Premier $30.00 monthly; $96.00 / $289.00 yearly; credit packs $4–$30; Download Credit $2.99 / $4.99 (USD) | not viewed — image files were not rendered | **IMAGE-BACKED for count; TEXT-DERIVED for content** |
| Udio | iTunes Lookup JSON only | 5 iPhone + 2 iPad | not in Apple JSON; listing HTML not captured | not viewed | IMAGE-BACKED count / TEXT-DERIVED content |
| Google Flow Music | iTunes JSON; App Store HTML (200, "Version 1.2.549 3d ago") | 6 iPhone | Starter $7.99 / $70.99; Plus $24.99 / $214.99; Member $64.00 / $569.99; 1,000 credits $5.99 (USD) | not viewed | IMAGE-BACKED count / TEXT-DERIVED content |
| ElevenLabs Music (ElevenMusic) | iTunes JSON; App Store HTML **429 ACCESS FAILURE** | 6 | not read | not viewed | IMAGE-BACKED count / TEXT-DERIVED content |
| Stable Audio | iTunes Search returned **no iOS app** | — | — | — | TEXT-DERIVED (web docs S11–S13 only) |
| Mubert | iTunes JSON ("Mubert: AI Music Streaming", v4.2.2, first release 2016-09-23) | 5 | not read | not viewed | IMAGE-BACKED count / TEXT-DERIVED content |
| Treblo | iTunes JSON; App Store GB HTML (200) | 6 | **no In-App Purchases block in listing text** | not viewed | IMAGE-BACKED count / TEXT-DERIVED content |

Public documentation screenshots or help-centre UI images: none were captured as image files this pass; the help-centre pages read (Suno, Udio, Mubert, Beatoven, ElevenLabs) were text-stripped, so no IMAGE-BACKED surface claim can be made from them. Count: **0 of 7 products IMAGE-BACKED for surfaces; 6 of 7 IMAGE-BACKED for screenshot count; 1 of 7 (Stable Audio) has no store listing to open.**

What the store evidence adds to the UI comparison even without viewing the images: every mobile competitor ships **5–6 store screenshots**, which is the maximum Apple shows before the fold and is the surface PMP's own listing will be judged against; Suno and Flow Music surface their subscription ladders and à-la-carte credit packs in the IAP block, so a free-with-ads listing with **no IAP block at all** (Treblo is the only current example) is itself a visible differentiator on the store page; and Suno's Play listing (10M+ downloads, updated 2026-09-01) sets the scale of the incumbent that PMP's phone surface will be compared to. Screenshot **content** — create panel, takes list, player, library — is still owed and must be produced by rendering the listings in a browser at 375 / 768 / 1440 px, as the first-pass banner already required.

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
