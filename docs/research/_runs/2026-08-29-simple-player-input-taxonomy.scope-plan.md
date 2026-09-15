# Scope plan (R3) — Simple-user player input surface: genres, styles/scenes, options, prompt patterns

Date: 2026-08-29 · Project: PlayMusicPrompts (c:\Berk\PlayMusicPrompts) · Mode: B (owner research order)
Covenant: C:\Users\berke\.claude\skills\deep-research\SKILL.md · COVENANT_SHA256: F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB

## 1. Exact decision served
Which input controls the simple-user PlayMusicPrompts player page exposes, and the exact curated
value lists each control offers: (a) the genre chips, (b) the style/era/scene stations ("80s",
"90s", "office hours", "new york cafe"-class), (c) the vocal option (lyrics / instrumental /
random), (d) any further high-frequency inputs users expect, and (e) how these compose with a
free-text prompt field — on a black, ultra-quality design, adaptive across web/PC/tablet.

## 2. Why
Berk's order (2026-08-29, verbatim): "şimdi şunu araştır, basit kullanıcı için bir arayüz black
ama ultra bir design olacak, web, pc, tablet adaptive olacak. ama kullanıcı genres, tars 80'ler
90 lar, office hours, new york cafe gibi vs. tarzlar seçebileicek, şarkı sözlü veya sözsüz veya
random opsiyonları gibi opsiyonlar olacak. sayfada prompt girilecek alan ve sonrasinda olmasi
gereken kulalncilarin genelde kullandikları inputlar ve bunları alabilaicğei deşerler nelerdir,
yani genres neler olmalı, tarslar neler olmalı başka ne eklemeliyiz gibi bunu en ileri sveieyde
en derin araştır." This research feeds the player UI design (design decisions themselves remain
OWNER-DECISION per rules/14) and the prompt→Intent-Vector compiler of the Temporal Music Fabric
algorithm analysed earlier this session. NOTE: the BLACK theme is Berk's explicit order — the
recorded exception to his light-surface default (rules/08 item 41).

## 3. Project context
PlayMusicPrompts.com — prompt-to-music platform on its own engine (Lambda `PlayMusicPromptsModel`
→ Lyria; 35-parameter contract, 7 binding classes; measured $0.08/track, median ~60 s generation,
135 s default duration). The new surface is a simple-user real-time generative player: prompt →
first track; hidden 3-track buffer; skip-adaptive; "make playlist" commit button. Full vocabulary
already closed at engine level (D-SSM-36: 2,196 genres / 114 moods / 1,057 instruments / 14 eras)
— this research decides the USER-FACING CURATED SUBSET and its organisation, not the engine
vocabulary.

## 4. Complete topic and subquestions
1. What input controls do simple users actually use on generative-music and music-streaming
   surfaces, and with what observed frequency/priority?
2. What genre list should the page offer (count, which ones, ordering, tiering)?
3. What style/era/scene stations should exist ("80s/90s" decades; "office hours", "new york
   cafe" activity/scene class) — the full candidate universe and the curated set?
4. Vocal options: lyrics / instrumental / random — how do leading products expose this, and
   what adjacent options (language, voice gender/type) do users expect?
5. What else belongs on the page (mood/energy, tempo, duration, instrument accents, reference-
   artist descriptors within provider terms, seed/variation, playlist commit)?
6. What do users actually TYPE into music prompts (prompt-pattern corpora, guides, communities)
   — so the prompt field's placeholder, suggestions and parsing match real usage?
7. Dark ("black but ultra") UI knowledge for adaptive web/PC/tablet music surfaces: contrast,
   OLED, depth/elevation on dark, media-player conventions — KNOWLEDGE only; every aesthetic
   choice stays OWNER-DECISION.

## 5. Reversal / falsification evidence
- Evidence that curated small lists outperform large taxonomies for casual users (or the
  opposite) changes list sizes.
- Evidence that scene/activity stations dominate genre picks (or the opposite) changes the
  page's primary axis.
- Provider-terms constraints (artist-name prompts) can remove a candidate control.

## 6. Inclusion / exclusion
INCLUDE: first-party product surfaces and docs of generative-music and streaming leaders;
academic primaries on music preference structure, mood models, choice architecture, prompt UX;
platform editorial taxonomies; community prompt corpora; W3C/WCAG and platform design docs for
dark adaptive UI. EXCLUDE: piracy/scraped-user-data sources; anything requiring auth bypass;
third-party model marketplaces (D-SSM-24 Google-only engine is out of this research's scope —
inputs are engine-agnostic). Languages: EN primary, TR where natural. Dates: newest-first;
foundational works retained.

## 7. Verticals derived from project vision
Vision (founding conversation): Music Creation OS for everyone — "Spark" tier = casual user.
Verticals: (a) casual-creator input surfaces, (b) listening-context stations (the "moment"
frame of the temporal player), (c) prompt literacy of non-musicians, (d) adaptive dark player
craft. Geography: GLOBAL (vision is global; no geo vertical).

## 8. Geography
GLOBAL.

## 9. Temporal scope
Products/taxonomies as of 2026 (newest-first, exact dates recorded); foundational academic
lineage (MUSIC five-factor model, valence-arousal, GEMS, choice-overload meta-analyses) retained
as still-controlling.

## 10. Candidate universes
Academic (music psychology, MIR, HCI/prompt UX); frontier companies (Google/DeepMind Lyria &
MusicFX, Suno, Udio, Stability/Stable Audio, Meta MusicGen, OpenAI, Mubert, Endel, AIVA, Boomy,
Soundraw, Beatoven, Loudly, brain.fm); streaming editorial (Spotify, Apple Music, YouTube Music,
Pandora, Deezer, Tidal, Amazon Music; Every Noise at Once; lofi radio ecosystem); code/data
(prompt datasets, taxonomy dumps); standards (WCAG 2.2, platform HIG for adaptive/dark).

## 11. Planned folder/file tree (exact count: 8)
1. docs/research/_runs/2026-08-29-simple-player-input-taxonomy.scope-plan.md (this file)
2. docs/research/2026-08-29-generative-music-input-surfaces-competitors.md (slice A, worker)
3. docs/research/2026-08-29-streaming-station-taxonomy-genres-decades-scenes.md (slice B, worker)
4. docs/research/2026-08-29-music-preference-prompt-ux-academic.md (slice C, worker)
5. docs/research/2026-08-29-dark-adaptive-player-ui-knowledge.md (slice D, worker)
6. docs/research/2026-08-29-simple-player-input-taxonomy-and-values.md (synthesis, main report)
7. docs/research/2026-08-29-simple-player-input-taxonomy-source-register.md (combined register)
8. docs/research/_runs/2026-08-29-simple-player-input-taxonomy.manifest.json (completion manifest)
Plus: index entry update (existing docs index), not a new file.

## 12. Hard-law check
R1.2 no-narrowing: Berk's example values ("80'ler", "90'lar", "office hours", "new york cafe",
sözlü/sözsüz/random) are mandatory seeds, never the boundary. rules/14: all palette/layout/type
choices recorded as OWNER-DECISION. rules/06: workers get covenant path + hash + WHY/PROJECT/
SCOPE/RETURN. Floors: ≥20 independent sources and ≥5 academic primaries [FULL] aggregate,
≥3-source cross-verification on load-bearing claims. D-SSM-14: reference inputs stay
descriptor-only (no third-party audio upload).

## 13. Completion semantics
Complete when: all 4 slices delivered with their own ledgers; floors met in aggregate;
synthesis maps every input control to (control, candidate values, evidence, contradiction
state); known gaps named. Known blind spots accepted: no first-party access to competitors'
internal usage analytics — frequency claims will rest on public/editorial/secondary evidence
and are marked accordingly.
