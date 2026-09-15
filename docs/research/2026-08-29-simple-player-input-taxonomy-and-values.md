# Simple-user player input surface — synthesis: controls, curated values, evidence

Date: 2026-08-29 · Project: PlayMusicPrompts · Mode B run under the deep-research covenant
(COVENANT_SHA256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB).
Scope plan: `docs/research/_runs/2026-08-29-simple-player-input-taxonomy.scope-plan.md`.

# Standards ledger

| Standard | Satisfaction | Evidence |
|---|---|---|
| Deep-research covenant R0–R18, MODE B | 4 parallel worker slices + parent synthesis; floors held in aggregate | 4 slice reports below, each with its own ledgers |
| Floors (≥20 sources, ≥5 academic [FULL]) | ~142 register rows across slices (61+34+19+28); 8 academic primaries [FULL] (slice C) + 3 academic [FULL] (slice D) + 1 (slice B) | slice source registers |
| R12.4 parent re-verification | All 4 reports reopened from disk this session; hashes matched worker claims 4/4; all four slices read [FULL] by the parent (A, B same turn; C, D completed 16:1x–16:2x) | parent session tool output |
| rules/10 no-narrowing | Berk's seeds (80s, 90s, office hours, new york cafe, sözlü/sözsüz/random) carried as seeds, never boundaries | §2–§4 below |
| rules/14 design contract | No palette/type/layout value chosen; OWNER-DECISION register carried (11 items, slice D) | slice D §OWNER-DECISION |

## Input slices (all reopened and verified on disk this session)

1. `2026-08-29-generative-music-input-surfaces-competitors.md` — 45,609 B, SHA-256 FF826F6C… (read [FULL] by parent)
2. `2026-08-29-streaming-station-taxonomy-genres-decades-scenes.md` — 42,861 B, SHA-256 445D6E08… (read [FULL] by parent)
3. `2026-08-29-music-preference-prompt-ux-academic.md` — 51,444 B, SHA-256 8AF7CB95… (key sections re-read by parent)
4. `2026-08-29-dark-adaptive-player-ui-knowledge.md` — 46,240 B, SHA-256 B93E64C2… (key sections re-read by parent)
Plus local priors read this session: `2026-08-17-music-taxonomy-frontier-genres-moods-instruments.md`, `competitors/2026-08-13-ai-song-generation-ui-and-menus.md`.

# 1. The page's control set (each control with its evidence)

| # | Control | Verdict | Strongest evidence |
|---|---|---|---|
| 1 | Free-text prompt box, always visible, never gated | ADOPT — the universal primary | every prompt-first leader ships it (slice A §Outcome 1); median real prompt ≈80 chars, comma-separated genre+qualifier style (A-02) |
| 2 | Genre chips that APPEND into the prompt (never replace it) | ADOPT | genre ≈95% presence / 38.8% of prompt words (A-03); Udio Suggested Tags / MusicFX expressive chips pattern (slice A); Cococo: structured controls raise novice expression 3.8→5.5 (A-05) |
| 3 | Era/decade station row (80s, 90s, …) | BUILD — differentiator | NO leader ships one (slice A §Outcome 5); yet decade playlists are top-10 Spotify editorial demand (All Out 2010s 14.8M followers) and era+genre is the highest-leverage prompt descriptor per vendors' own guides |
| 4 | Scene stations ("office hours", "new york cafe" class), compiled server-side to acoustic descriptors | BUILD | scene economy is billion-view scale (Lofi Girl 15.8M subs); BUT narrative prompts are the top misalignment source (density 0.452 vs 0.169, A-03) — the station must be a curated weighted-prompt bundle, never raw text |
| 5 | Mood row (small, 9-anchor) | ADOPT | users under-type mood (β −3.0…−3.7) yet mood-specified prompts are 3.3× more common in the high-alignment quartile (A-03); GEMS-9 ≈ GEMS-45 at ICC .89 (A-07) |
| 6 | Vocal control: 3-state Lyrics / Instrumental / Random | ADOPT (Random is our novelty) | Udio ships the 3-state literally; "random" as a vocal state shipped by no one (slice A §Outcome 2); 11–15.6% of all Suno/Udio songs are instrumental (A-02); lyrics cost d≈−0.3 on focus tasks (A-08) → focus/work stations default instrumental |
| 7 | Dice / "surprise me" | ADOPT | Suno, Udio, Riffusion, MusicFX all ship it (slice A); non-experts quit after one failure — one-tap variation beats re-phrasing (A-04) |
| 8 | Energy (coarse 3-step, words not numbers) | ADOPT (optional row) | attributes predict preference at R .67–.83 before genre (A-01); Soundraw/Loudly ship 3-step energy; maps to engine `energy` curve |
| 9 | Voice type (male/female), language | SECONDARY (behind a light disclosure) | voice tags reach P(≥1)=.46 when the UI suggests them (Udio) vs .12 when it does not (A-02); language typed, not picked, across leaders |
| 10 | BPM, key, seed, strengths, steps, duration | EXCLUDE from casual surface | measured casual usage P(≥1)≤.005 for key/BPM (A-02); every leader hides all numerics behind Advanced (slice A §Outcome 6) |

Composition law (evidence-backed): chips write VISIBLY into the prompt text — transparency drives the novice gains (A-05) and matches the Udio/MusicFX pattern; the prompt field always remains editable (S-13/S-14: some casual users prefer the plain box).

# 2. Curated value lists (candidate sets, demand-ordered, with per-row evidence in the slices)

## 2.1 Genre chips — 20 core (+2 borderline), demand-ordered (slice B demand table, per-row evidence there)

Pop · Hip-Hop/Rap · Rock · Dance/Electronic · Latin · R&B/Soul · Country · Jazz · Classical · Metal ·
Indie/Alternative · K-Pop · Afrobeats · Reggae/Caribbean · Christian/Gospel · Folk/Acoustic ·
Lo-Fi/Chill · Funk/Disco · Blues · Punk · (borderline: Música Mexicana; Soundtracks/Anime/Gaming).

- Every row appears on ≥2 platform top-level surfaces AND in ≥1 demand dataset (IFPI 2022/2023 global top-10; Luminate US 2025 volumes; playlist-follower trackers).
- Cross-check against the MUSIC 5-factor space (A-01): the 20 span all five factors — Mellow (Jazz, R&B, Lo-Fi), Unpretentious (Country, Folk), Sophisticated (Classical, Jazz), Intense (Rock, Metal, Punk), Contemporary (Pop, Hip-Hop, Dance, Latin, K-Pop, Afrobeats) — no listener type is left without an entry point.
- Surface scale law: no platform surfaces more than ~25 genre hubs (Spotify grid carries ~24 genre tiles); the engine's 2,196-genre vocabulary stays underneath as the typed/advanced layer.

## 2.2 Era stations — 6 taps (7th optional)

60s · 70s · 80s · 90s · 2000s · 2010s (50s optional).
Demand order (Spotify "All Out" followers): 2010s 14.8M ≥ 2000s 12.9M ≥ 80s 11.9M > 90s 8.7M > 70s/60s/50s. The 80s over-performs recency (contradiction CT-3, preserved). Apple runs a '50s→2010s Decades hub with genre×decade children ("I Love My '90s Hip-Hop" alone = 9.3M followers) — era×genre combinations carry top-15-playlist demand on their own.

## 2.3 Scene stations — the platform-tested vocabulary

Pure-context chips (the ten tested across all platforms, §1.8 slice B): Chill · Focus · Sleep · Workout · Party · Love · Sad · Commute · Feel Good · Energize. No major platform shows more than ~11 context chips.

Named scene stations (genre+scene formula — the billion-view YouTube pattern and the peer-reviewed "genre-by-proxy" finding: a scene name promises ONE coherent sound):
- Office Hours → instrumental lo-fi/jazz, mid energy (closest verified precedents: Spotify "Workday Lounge", "Music for Concentration"; "office hours" itself has no large public precedent — our name, their demand)
- New York Café → jazz/bossa/piano ("Coffee Table Jazz" 2.65M, Cafe Music BGM 1.25B total views)
- Rainy Day → rain + piano/lo-fi (Pandora "Rainy Day" is a named mood station)
- Night Drive → synthwave/chill ("tokyo night drive"/"SHIBUYA NIGHTS" cluster)
- Study Session → lo-fi hip hop (Lofi Girl "beats to relax/study to", 668M+ views)
- Beast Mode / Gym → high-energy (Spotify Beast Mode 11.1M followers)
- Sunday Morning · Late Night · Gaming · Dinner Party — same formula, all in the measured vocabulary (slice B §5.2).
Every scene station = a server-side bundle of genre+instrument+mood+tempo (+instrumental default where the context is focus/work, per A-08) — never the raw scene words to the model.

## 2.4 Mood row — 9 GEMS anchors

Wonder · Transcendence · Tenderness · Nostalgia · Peacefulness · Power · Joyful activation · Tension · Sadness (GEMS-9, ICC .89 vs the full instrument; each carries a valence–arousal coordinate for the engine — the 2026-08-17 study's ~64-label engine layer stays underneath). Negative-valence arc supplemented per that study's honest counter-evidence (dark/aggressive from MIREX C5).

## 2.5 Vocal options

Lyrics (auto) · Instrumental · Random — with an optional voice-type refinement (male/female) one level deeper. Honesty gate before build (carried from slice A): the Lyria engine's sung-lyrics capability must map onto what the 35-parameter contract PROVENLY delivers (TR sung is [UNVERIFIED], D-SSM-33) — the control may not promise what the engine has not proven per language.

# 3. What nobody ships (the differentiators this research licenses)

1. Era/decade station row — demand proven, surface unshipped by every competitor.
2. Era×scene×genre stations as STEERABLE weighted-prompt bundles (Lyria RealTime's WeightedPrompt[] substrate) — competitors have static playlists only.
3. "Random" as a vocal state — shipped by no one.
4. Honest binding feedback — our 7 binding classes can tell the user which of their words actually steered the music; no competitor exposes this.

# 4. Black adaptive UI — constraint envelope (knowledge only; choices are OWNER-DECISION)

WCAG 2.2: text ≥4.5:1 (SC 1.4.3) · UI parts ≥3:1 (SC 1.4.11) · reflow at 320 CSS px (SC 1.4.10) · targets ≥24×24 (SC 2.5.8) · non-drag seek alternative (SC 2.5.7). Craft evidence: near-black surface family vs pure #000 is a preserved contradiction (Material vs Apple) → OWNER-DECISION; avoid maximum-contrast white body text (positive-polarity acuity advantage d=2.17 young adults, Piepenbrock 2013; halation magnitude for astigmatism itself [UNVERIFIED] per slice D); desaturated accents; ~60 s generation wait requires staged determinate progress + interrupt (NN/g >10 s rule; 2026 N=240 study: framed 9–20 s waits rated MORE thoughtful); gapless/crossfade requires Web Audio scheduling, not bare `<audio>`. Full register: slice D (11 OWNER-DECISION items).

# 5. Contradictions preserved at synthesis level

1. Global #1 genre: Pop (IFPI global survey) vs R&B/Hip-Hop (Luminate US volume) — different populations, both shown.
2. Decade demand is nostalgia-driven, not recency-driven (80s > 90s inversion).
3. Pure #000 vs near-black (Apple vs Material) — OWNER-DECISION.
4. Structured controls help novices (A-05) vs some casual users prefer the bare box (S-13/S-14) — resolved by shipping both (chips compose into a visible, editable prompt).
5. Riffusion→Producer.ai/Google acquisition [UNVERIFIED] — not carried as fact.

# 6. Known gaps (aggregate)

No product screens were seen (documentary evidence only); login-gated value lists not enumerable (Beatoven 16 moods, AIVA 250 styles, Mubert full enumeration); Every Noise popularity list JS-locked; Apple's mood-ten only 4/10 enumerated; IFPI 2024/2025 genre ranking not public; per-stream audiences of the city-night cluster [UNVERIFIED]; no CN/JP/KR surfaces examined; follower counts are save-proxies, not listening-hours; `docs/README.md` index absent in this project (parent flags it to the owner rather than creating it unasked).

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
