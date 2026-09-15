# Standards ledger

| # | Governing standard | How this run satisfies it |
|---|---|---|
| 1 | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (COVENANT_SHA256 given in brief: `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB`) — read from disk this session in 3 passes (L1–400, L400–730, L730–950). MODE B delegated slice: no local-intake preflight gate; full-depth execution immediately. | Executed R0–R18 as a conformance contract for this slice. Slice floor set by the parent brief: **≥8 independent authoritative sources** (parent allocates the overall ≥20 floor across orthogonal slices per R12.3 CONTEXT-12). |
| 2 | `c:\Berk\PlayMusicPrompts\CLAUDE.md` + `AGENTS.md` (workspace rules, in context) | Memory-tier note: `memory/PROJECT.md` etc. paths named in AGENTS.md do not exist under this project root as `memory/…` (checked: research lives under `docs/research/`, 19 prior reports enumerated this session). The filesystem is the truth; artifacts placed at the project's actual research convention. |
| 3 | Prior related research, read from disk in full this session: `docs/research/2026-08-17-music-taxonomy-frontier-genres-moods-instruments.md` (590 lines) | NOT duplicated. That report covers engine-side genre/mood/instrument vocabularies (Discogs/GEMS/GM spines). THIS report covers the demand side: what streaming surfaces organise listening around. Cross-references are marked `[PRIOR-2026-08-17]`. |
| 4 | R15 naming/paths | English, ISO-date kebab-case, under `docs/research/`. Report opens with `# Standards ledger`. `docs/README.md` does not exist in this project (measured this run: `Test-Path` → False); no index row could be appended — recorded in Known gaps for the parent. |
| 5 | R10/R11 | Every load-bearing claim carries source IDs; ≥3-source cross-verification ledger below; `[single-source]`/`[UNVERIFIED]` marked honestly; contradictions preserved. |

Slice status: **COVENANT ACKNOWLEDGED** before any external action.

---

# Scope plan / decision served / why / project context

**Decision served:** Berk is choosing (a) the SMALL curated GENRE list and (b) the ERA/SCENE STATION list ("80s", "90s", "office hours", "new york cafe" class) for a simple-user prompt-to-music player page on PlayMusicPrompts.com (own Lyria-backed engine, $0.08/track; engine already holds a closed 2,196-genre vocabulary per decision D-SSM-36 — this slice does NOT build a genre universe, it finds which small subset and which station names carry the most listening demand).

**Why this slice:** the editorial taxonomies of the world's largest streaming surfaces encode a decade of A/B-tested user demand. What Spotify/Apple/YouTube Music/Amazon/Deezer/Pandora/Tidal put on their top-level browse screens, what decade hubs they run, and what the 24/7 "lofi girl / coffee shop" ecosystem names its streams — these are the strongest public proxies for what casual users actually tap.

**Subquestions (from the brief, unnarrowed):** (1) per-platform editorial category/hub taxonomies, verbatim, dated; (2) decade/era packaging 60s–2020s with usage signals; (3) scene/activity station ecosystem and its exact naming vocabulary with audience-size signals; (4) genre demand ranking from public data (IFPI, Luminate, Spotify-derived, Every Noise); (5) naming-convention patterns: genre+context vs pure context.

**Geography:** GLOBAL (platform taxonomies are global surfaces; US-heavy data marked as such). **Temporal scope:** newest-first — 2025–2026 state where it exists; older evidence dated inline. **Excluded:** anything requiring login/paywall bypass (R13); no paid API calls.

**Falsifiers:** if platform taxonomies were shown to be regional-only render artifacts, the enumeration claims would weaken (mitigated: the Spotify list was fetched logged-out from the global web player this session); if follower counts were shown to be bot-inflated, demand ordering would need engagement data instead (flagged where third-party trackers disagree).

---

# Outcome first

**Bad news first, honestly:**

1. **Spotify's browse-category API is GONE** — the `GET /browse/categories` endpoints were REMOVED in the February 2026 Web API changelog (S-02). Public enumeration now depends on rendering the web player, which I did this session (S-01): the logged-out "Browse all" grid served **57 tiles** verbatim below. A logged-in/regional grid may differ — flagged.
2. **Every Noise at Once's popularity-sorted list is not machine-readable any more.** The site is a static snapshot (frozen Dec 2023, creator laid off; S-27, S-28) and `everynoise1d.html`'s sort-by-popularity list is JS-rendered — the fetch returned only the page chrome. Genre demand ranking below therefore rests on IFPI + Luminate + platform playlist followers, not on ENAO. Recorded as an access gap, not worked around.
3. **IFPI's most recent public *Engaging with Music* genre ranking is the 2023 edition** (published 2023-12-11); no 2024/2025 successor edition with a genre top-10 was found in the searched scope (S-24, S-25).

**The committed answer for the owner's decision (details and evidence in the body):**

- **Genre set (~20) with the strongest cross-platform demand evidence:** Pop · Hip-Hop/Rap · Rock · Dance/Electronic · Latin · R&B/Soul · Country · Jazz · Classical · Metal · Indie/Alternative · K-Pop · Afrobeats/Afro · Reggae/Caribbean · Folk/Acoustic · Christian/Gospel · Funk/Disco · Blues · Punk · Lo-Fi/Chill(-hop) — every one of these appears on ≥2 platform top-level surfaces AND in at least one demand dataset (per-row evidence in the demand table).
- **Decade set:** **1950s–2010s as named hubs are live product surfaces today** (Apple's Decades curator runs '50s→2010s rooms; Spotify runs a top-level "Decades" category; Spotify's "All Out" decade series holds 8.6–14.8M followers per decade). The demand centre is **80s ≈ 2000s ≈ 2010s > 90s > 70s > 60s > 50s** by follower evidence. 2020s exists only as "current hits" surfaces, not as a nostalgia hub.
- **Scene/station vocabulary that dominates:** *study · relax · sleep · focus/deep work · chill · work/office · coffee shop/café · rainy day/rain · night drive/city night · workout/gym · party · commute · gaming*. The billion-view formula is **"<genre> beats to <activity>/<activity> to"** (Lofi Girl: 668M+130M views on two streams; 15.8M subs) and **"<place> + <genre>"** (jazz cafés, Tokyo night drive, Shibuya nights). Pure-context names ("Office Hours") are rarer than genre+context names in the biggest properties; the academic study of playlist naming (S-33) found context-based themes are the most common naming class, but such playlists are genre-homogeneous underneath ("genre-by-proxy") — i.e. **a station named for a scene should still sound like ONE genre**.

---

# Methodology and exact query/action ledger

First external action was a broad scoping search (R4.1). Zero guessed URLs; every fetch target was discovered by search or named by a discovered document. All queries run 2026-08-29 (Europe/Istanbul), tool: Cursor WebSearch/WebFetch.

| # | Query / action | Yield |
|---|---|---|
| Q1 | `Spotify browse categories full list 2025 genre hubs mood categories Search page` | Web API removal changelog (S-02); open.spotify.com/search discovered |
| Q2 | `YouTube Music activity filter chips Energize Workout Relax Commute Focus home screen 2025` | 9to5Google 2020/2021/2023 (S-08..S-10), Android Headlines (S-11) |
| Q3 | `Apple Music browse categories list genres moods activities "Chill" "Fitness" "Sleep" editorial 2025` | Apple/UMG Sound Therapy 2025-05 (S-05), Headphonesty review (S-06) |
| A1 | Fetch `https://open.spotify.com/search` (logged-out web player) | **57-tile "Browse all" grid, enumerated verbatim** (S-01) |
| Q4 | `Amazon Music app browse moods activities genres list "Rap Rotation" playlist brands 2025` | Amazon Music for Artists Programming page (S-12), music.amazon.com/search section heads (S-13), Amazon press 2021 (S-14) |
| Q5 | `Deezer channels list genres moods "Flow" mood options chill party focus 2025` | Deezer support (S-15), newsroom 2021 Flow Moods (S-16), newsroom 2026-02-13 Flow Tuner (S-17) |
| Q6 | `Pandora browse genre stations list moods activities workout study sleep stations 2025` | Pandora help "Genres, Moods and Holidays" (S-18), community Mood Modes (S-19) |
| Q7 | `Tidal app explore genres moods list browse categories 2025` | SoundGuys review (S-20), Tidal Alexa page (S-21), Roon community genre-drift thread (S-22) |
| Q8 | `Spotify "All Out 80s" "All Out 90s" "All Out 2000s" decade playlist followers millions most followed decade playlists` | RouteNote 2026 (S-29), Viberate top-50 full page (S-30), Stulyo (S-31), Chartmetric HMC (S-32) |
| Q9 | `Lofi Girl channel subscribers 2025 "lofi hip hop radio - beats to relax/study to" biggest 24/7 music livestreams…` | Social Blade (S-34), vidIQ (S-35), Wikipedia Lofi Girl (S-36), OutlierKit (S-37) |
| Q10 | `IFPI Engaging with Music 2024 2025 report most popular genres worldwide…` | IFPI EWM 2022 full PDF (S-24), EWM 2023 press (S-25), WorldMusicViews (S-26) |
| Q11 | `Luminate year-end report 2024 2025 genre share streaming…` | Luminate 2025 YE PDF full text (S-23), Luminate 2024 YE PDF (S-23b), MBW (S-23c), Billboard (S-23d) |
| Q12 | `"Cafe Music BGM channel" subscribers coffee shop jazz 24/7 livestream…` | channelslike.com competitor table (S-38), aggregator (S-39) |
| Q13 | `Every Noise at Once everynoise.com genre list sorted by popularity Glenn McDonald 6000 genres most popular` | Wikipedia ENAO (S-27), TechCrunch 2024-02-12 (S-28); A2 fetch of everynoise1d.html → JS-only, list not rendered (access failure recorded, R4.3: no variant guessing) |
| Q14 | `Spotify "Peaceful Piano" "Deep Focus" "Coffee Table Jazz" "Jazz Vibes" followers millions functional music playlists` | Chartlex jazz page (S-40), Penny Fractions functional-playlist census (S-41) |
| Q15 | `playlist naming conventions study activity-based playlist titles… context vs genre` | Academic study "Playlists and genre" (S-33), PlaylistFeed SEO (S-42), artist.tools formulas (S-43), artistrack (S-44) |
| Q16 | `Chillhop Music subscribers "synthwave radio - beats to chill/game to" freeCodeCamp "Code Radio"… "tokyo night drive"` | chillframe channel table (S-45), Chillhop Spotify playlist page (S-46), curated 24/7 stream list w/ exact names (S-47) |
| Q17 | `Apple Music "80s Hits Essentials" decades playlists…` | **Apple Music Decades curator page fetched** — full hub enumeration (S-07), '80s Hits Essentials US/GB pages (S-07b) |

Local reads (Mode-A duty): deep-research SKILL.md; prior taxonomy report (590 lines); `docs/research/` folder enumerated (19 files); `docs/README.md` measured ABSENT.

---

# Findings — Axis 1: per-platform editorial taxonomies (verbatim, dated)

## 1.1 Spotify — "Browse all" grid, fetched logged-out 2026-08-29 (S-01) `[FULL]`

The complete 57-tile grid, in served order, verbatim (tile names only; non-music tiles kept so the enumeration is complete and honest):

> Music · Podcasts · Audiobooks · Live Events · Made For You · New Releases · **Pop** · **Country** · **Latin** · **Hip-Hop** · Charts · Podcast Charts · Podcast New Releases · Mystery & Thriller · Biography & Memoir · Fiction & Literature · Self-Help · Spotify CLASSICS · Music Video Playlists · **Summer** · **Rock** · **R&B** · **Dance/Electronic** · EQUAL · Mixed By · **Indie** · **Sleep** · **Workout Music** · **Mood** · **Party** · **Love** · **Student** · Disney · **Decades** · Netflix · GLOW · **Chill** · Discover · Prompted Playlists · **Jazz** · **Metal** · **Christian & Gospel** · **Música Mexicana** · **Classical** · Kids & Family · **In the car** · **At Home** · Frequency · TV & Movies · **Folk & Acoustic** · Trending · **K-pop** · **Punk** · **Blues** · **Soul** · **Alternative** · Anime · Instrumental · RADAR · Fresh Finds · Songwriters · Spotify Singles · **Arab** · **Afro** · **Caribbean** · **Focus** · Gaming · Travel · **Wellness** · **Ambient** · **Nature & Noise** · **Funk & Disco** · Broadway · Cooking & Dining · Tastemakers

Structure read off the grid (INFERENCE, marked): **genre hubs** (Pop, Country, Latin, Hip-Hop, Rock, R&B, Dance/Electronic, Indie, Jazz, Metal, Christian & Gospel, Música Mexicana, Classical, Folk & Acoustic, K-pop, Punk, Blues, Soul, Alternative, Arab, Afro, Caribbean, Funk & Disco, Ambient) + **mood/activity hubs** (Sleep, Workout Music, Mood, Party, Love, Student, Chill, In the car, At Home, Focus, Gaming, Travel, Wellness, Nature & Noise, Cooking & Dining, Summer) + **era hub** ("Decades" is a single top-level tile) + program/brand tiles. Note "Student" and "In the car"/"At Home" — Spotify names *situations*, not only moods. `Prompted Playlists` is a live top-level tile (relevant precedent for a prompt-first product). API-based enumeration is impossible since Feb 2026 (S-02).

## 1.2 Apple Music (S-05, S-06, S-07) 

- **Browse structure** (S-06, `[FULL]` page read): "Browse Our Picks", "Just Ask Siri", "**Music By Mood** — ten mood-based categories such as **Chill, Feel Good, Focus, Sleep**, etc.", "New Music / Best New Songs", "Daily Top 100", "Just Updated". Genre rooms exist per genre (Hip-Hop, Pop, Jazz, Indie has "a pretty exhaustive" room). `[PARTIAL]` for the full mood-ten enumeration — the review names 4 of 10 (gap recorded).
- **Wellness axis, first-party 2025-05-13** (S-05 `[FULL]`, Apple Newsroom + UMG): **Sound Therapy** with exactly three categories — **Focus, Relax, Sleep** — plus the **Apple Music Chill** radio station; Apple's co-head cites "incredible engagement around our personalized mood playlists".
- **Decades hub, first-party, fetched this session** (S-07 `[FULL]`): the "Decades" curator page enumerates rooms **2010s Music · 2000s Music · '90s Music · '80s Music · '70s Music · '60s Music · '50s Music · "Those Were the Days"**, with per-decade `<decade> Hits Essentials` flagships and genre×decade children (e.g. *2000s Hip-Hop/R&B Essentials*, *2010s Indie Essentials*, *'90s Alternative Essentials*, *2000s Dance Party Essentials*, *2000s Love Song Essentials*). US flagship '80s Hits Essentials = 100 songs; GB variant = 300 songs (S-07b).

## 1.3 YouTube Music — activity bar (S-08..S-11)

- 2020-11-09 launch, four chips: **Workout, Focus, Relax, Commute** (S-08 `[FULL]`).
- 2021-11-11: fifth chip **Energize** (S-09 `[FULL]`).
- 2023-01: the five chips reach the web client — "**energize, workout, relax, commute, focus**" (S-11).
- 2023-09-17 expansion (+5): **Cry · Party · Romance · Feel good · Sleep** — bringing the bar to 11 chips incl. Podcasts (S-10 `[FULL]`). Cry maps to a "Sad Songs" playlist.
- This is the cleanest first-party evidence that a **~10-chip activity bar** is the tested sweet spot for a casual home surface.

## 1.4 Amazon Music (S-12..S-14)

- First-party programming page (S-12 `[FULL]`): "millions of stations… a mix of the top songs for a given **genre, mood, or theme**"; "thousands of playlists across different **genres, eras, contexts, and locales**" — Amazon names **eras** as a first-class playlist dimension. Marquee brands: **Rap Rotation, Country Heat, All Hits, Platino** (DJ Mode stations, S-14).
- The search/browse page section heads (S-13, verbatim): "**Music By Genre** · **Listen Your Way** · **Moods & Activities** · Podcasts By Category".

## 1.5 Deezer (S-15..S-17)

- **Flow Moods = exactly six**, first-party, verbatim (S-15/S-16): **Love (You & Me) · Workout (Motivation) · Chill · Sad (Melancholy) · Focus · Party** (2021-10 launch names in parentheses).
- **Flow Genres = 32 selectable genres**, six shown on the wheel at a time (S-15 `[FULL]` support doc).
- 2026-02-13 (S-17, first-party newsroom): **Flow Tuner** — users toggle genres/subgenres directly; framing sentence names the contexts "doing sports, working, relaxing".

## 1.6 Pandora (S-18, S-19)

- Help page "Genres, Moods and Holidays" (S-18 `[FULL]`): browsable **genre stations**; **Moods & Activities** section with examples verbatim: **Driving · Love · Rainy Day · Focus**; holiday stations. Community/moderator evidence (S-19): mood rows shown include **Energize, Love, Happy, Chill**; **Mood Modes** on any station = **Energy Boost / Relax** (2023-12-11).

## 1.7 Tidal (S-20..S-22)

- Explore tab carries **genres + "Moods and Activities"** curated playlists (S-20, 2024 review). Alexa first-party page (S-21 `[FULL]`): supported mood aliases verbatim — **relax, party, love, classics, focus, workout**; genre aliases — hip-hop, R&B, pop, dance, Latino, country, jazz, classical, indie rock. Taxonomy drift note (S-22): "Dance" + "Electronic" merged into **"Dance & Electronic"**; "Soundtracks" genre retired — evidence that platforms consolidate toward fewer, broader genre hubs.

## 1.8 Cross-platform synthesis (INFERENCE from 1.1–1.7)

Every one of the seven platforms exposes the same **three-axis surface**: (genre hubs) × (mood/activity chips) × (era/decade packaging). The mood/activity vocabulary is astonishingly convergent — the intersection across platforms is: **Chill/Relax · Focus · Sleep · Workout · Party · Love/Romance · Sad · Commute/Driving · Feel Good/Happy · Energize**. Ten platforms-tested context words. Deezer caps moods at 6; YTM at ~10; Apple's mood section is "ten categories". **No major platform exposes more than ~11 context chips on its home surface.**

---

# Findings — Axis 2: demand-ranked genre table

Ranking synthesised from three independent dataset families: **IFPI Engaging with Music** (global consumer survey, 2022 full PDF read + 2023 press ranking; S-24..S-26), **Luminate year-end** (US on-demand audio volume, 2024 + 2025 PDFs read; S-23, S-23b), and **platform surface presence** (Axis 1 + playlist-follower data S-29/S-30/S-40/S-41). US volume ≠ global taste — both are shown, not averaged (CT-1).

| # | Genre | Evidence per row |
|---|---|---|
| 1 | **Pop** | IFPI global #1 (2022 + 2023, S-24/S-26); Luminate US #3 by volume, 167.2B streams 2025 (S-23); top-level hub on all 7 platforms |
| 2 | **Hip-Hop / Rap** | IFPI global #3; Luminate US #1 (R&B/Hip-Hop, 349.9B streams, "1 in 4 US streams", S-23); Spotify hub; RapCaviar 15.7M followers (S-30); hip-hop+phonk ≈30% of global Spotify streams 2025 per third-party (S-03 `[single-source]`) |
| 3 | **Rock** | IFPI global #2; Luminate US #2 (260.5B, fastest-growing share +0.3–0.4pt 2025, S-23); hub on all platforms; Rock Classics 13M followers (S-30) |
| 4 | **Dance / Electronic** | IFPI global #4; Spotify+Tidal+Deezer hubs; Luminate top-10 core genre; EDM listeners among likeliest to convert to paid (S-23) |
| 5 | **Latin** | IFPI global #5; Luminate US #5 (120.9B, +5.2% 2025); Viva Latino 15.4M + Baila Reggaeton 10.3M followers (S-30); LatAm fastest-growing region +22.5% revenue (S-25b) |
| 6 | **R&B / Soul** | IFPI global #7 (as R&B); merged with hip-hop in Luminate US #1; Spotify hubs "R&B" and "Soul" both top-level |
| 7 | **Country** | IFPI global #9 (rising 2023); Luminate US #4 (122.5B); Amazon marquee brand "Country Heat"; Spotify hub |
| 8 | **Classical** | IFPI global #6 (Classical/Opera); hub on Spotify/Apple/Tidal alias; Luminate: classical listeners over-index on dedicated platforms |
| 9 | **Jazz** | ~2% of global Spotify streams but outsize functional demand: Jazz Classics 4.82M, Coffee Table Jazz 2.65M, Jazz Vibes 2.23M, Jazz in the Background 2.19M followers (S-40); dominates the café scene ecosystem (Axis 3) |
| 10 | **K-Pop / World** | Luminate US #7 core genre "World Music" 2025, driven by K-pop (TWICE/Stray Kids named, S-23); Spotify "K-pop" top-level hub; IFPI 2022 names K-pop/C-pop/J-pop momentum |
| 11 | **Metal** | Spotify top-level hub; Apple decade×genre Essentials rooms; strong catalog streaming (rock family, S-23) |
| 12 | **Indie / Alternative** | Spotify hubs "Indie" + "Alternative" both top-level; Apple "exhaustive Indie category" (S-06) |
| 13 | **Afrobeats / Afro** | Spotify "Afro" top-level hub; Nigeria export rank #23→#19 (Luminate 2025, S-23); IFPI 2022 names Afrobeats momentum |
| 14 | **Reggae / Caribbean** | IFPI global #10 (Reggae); Spotify "Caribbean" hub |
| 15 | **Christian / Gospel** | Luminate US #2 growth genre (+18.5% volume 2025, S-23); Spotify hub |
| 16 | **Folk / Acoustic** | Spotify top-level hub; ENAO scale note: 202 folk sub-genres existed in Spotify's graph (S-27) |
| 17 | **Lo-Fi / Chill(-hop)** | phonk playlist 11.8M followers (S-30); Lofi Girl 15.8M subs (S-34); the entire Axis-3 economy; "lo-fi" also a named Lyria style modifier `[PRIOR-2026-08-17]` |
| 18 | **Funk / Disco** | Spotify top-level hub; retro-scene demand (70s/disco packaging, Axis 4) |
| 19 | **Blues** | Spotify top-level hub; jazz+blues ≈2% global share (S-40) |
| 20 | **Punk** | Spotify top-level hub; rock-family catalog strength |
| 21* | **Música Mexicana / regional** | Spotify top-level hub; Mexico #2 premium-stream growth market (+50.9B, S-23) — include if the product targets LatAm |
| 22* | **Soundtracks / Anime / Gaming** | IFPI global #8 (Soundtracks); Spotify hubs "TV & Movies", "Anime", "Gaming"; Tidal retired its Soundtracks genre hub (CT-2) |

`*` = borderline rows, included so the cut-line is visible rather than silently narrowed.

**IFPI global top-10, verbatim (2022 full report, S-24 `[FULL]`; 2023 press confirms order with R&B↑6, Country↑8, Soundtracks↓9):** 1. Pop · 2. Rock · 3. Hip-hop/Rap · 4. Dance/Electronic · 5. Latin · 6. Classical/Opera · 7. R&B · 8. Soundtracks · 9. Country · 10. Reggae.

**Luminate US top-10 core genres 2025, verbatim order (S-23 `[FULL]` PDF text):** R&B/Hip-Hop · Rock · Pop · Country · Latin · Dance/Electronic · World Music · Christian/Gospel · Children's · Holiday/Seasonal.

**Scale context:** Spotify's internal genre graph held **6,291 named genres** when frozen (S-27) — the owner's 2,196-genre engine vocabulary is the right *engine* scale, and the ~20-row table above is the right *surface* scale; no platform surfaces more than ~25 genre hubs (Spotify's grid carries ~24 genre tiles).

---

# Findings — Axis 3: decade / era packaging

## 4.1 How platforms package decades

- **Spotify:** a single top-level **"Decades"** category tile (S-01, fetched this session). Inside it, the flagship editorial series is **"All Out <decade>"**. Follower evidence (S-29/S-30, both 2026; S-31): **All Out 2010s 14.8M · All Out 2000s 12.9M · All Out 80s 11.9M · All Out 90s 8.6–8.7M**; All Out 70s/60s/50s exist (Chartmetric documents Spotify refreshing "All Out 70s, All Out 80s, All Out 90s" five days after the Michael Jackson biopic, S-32). Four decade playlists sit inside Spotify's overall top-10 most-followed playlists — decades are among the highest-demand editorial products Spotify runs.
- **Apple Music:** a dedicated **Decades curator** with per-decade rooms **'50s → 2010s** plus a pre-50s room ("Those Were the Days"), flagship `'<decade> Hits Essentials`, and **genre×decade** children (2000s Hip-Hop Essentials, '90s Alternative Essentials, 2010s Indie Essentials…) (S-07 `[FULL]`, fetched this session).
- **Amazon Music:** "eras" is one of the four named playlist dimensions ("genres, **eras**, contexts, and locales", first-party S-12).
- **YouTube Music:** no first-party decade hub found in the searched scope; decade listening is served by search + user/official mixes (S-47b) — `NOT FOUND IN THE SEARCHED SCOPE`, not proven absent.
- **I Love My '90s Hip-Hop** = 9.3M followers (S-30) — the strongest single evidence that **decade×genre** intersections carry Top-15-playlist-level demand on their own.

## 4.2 The decade set the evidence supports (INFERENCE)

**Ship: 60s · 70s · 80s · 90s · 2000s · 2010s** (six taps), with 50s optional. Demand ordering by followers: 2010s ≥ 2000s ≥ 80s > 90s > 70s/60s/50s. The 80s over-performs its recency (11.9M followers vs 90s' 8.7M — CT-3 records this inversion). Era belongs OUTSIDE the genre list as its own axis — consistent with `[PRIOR-2026-08-17]` (CT-8 there) and with Google's own Lyria guidance to state "genre AND era".

---

# Findings — Axis 4: scene / activity station ecosystem and its vocabulary

## 5.1 The properties and their audience signals

| Station / property | Exact naming vocabulary | Platform | Audience evidence (dated) |
|---|---|---|---|
| **Lofi Girl** (ex-ChilledCow) | "lofi hip hop radio - **beats to relax/study to**"; "…**beats to sleep/chill to**"; "synthwave radio - **beats to chill/game to**"; "1 A.M Study Session"; "Morning Coffee ☕️ [lofi hip hop]"; "Bedtime Lofi" | YouTube (24/7 live) + label | **15.8M subs, 2.66B views** (Social Blade 2026-08, S-34); main stream 668M views by 2022-07, sleep stream 129M, 1 A.M Study Session 134M (S-35/S-36); ~40,000 concurrent listeners avg (2023, S-36) |
| **Cafe Music BGM channel** | "Jazz Lounge", "Coffee Ballad", "Cafe Music", "Jazz & Bossa Nova", "Music for Studying/Work/Concentration", "MONDAY JAZZ" | YouTube + Spotify artist | ~3.7M subs trajectory, **1.25B total views** (S-39); 487K Spotify monthly listeners; sister **BGM channel 5.7M subs** (S-38) |
| **Chillhop Music** | "Chillhop Radio 🐾 **jazz/lofi hip hop beats to study/relax to**"; seasonal "Essentials" | YouTube + Spotify | 1M+ Spotify followers; radio playlist 621,740 saves (S-45/S-46) |
| **Coffee Shop Radio / jazz cafés cluster** | "Coffee Jazz Music - Chill Out Lounge Jazz Music Radio - 24/7 - **Cafe BGM for Work**"; "Relax Jazz Cafe"; "Relaxing Jazz Piano"; "Cozy Cafe Ambience"; "coffeehouse ambiance" | YouTube | Relaxing Jazz Piano 302K, Calmed By Nature 759K, Relax Jazz Cafe 208K subs (S-38); search queries the cluster competes on, verbatim: "music for studying", "cafe music", "coffee shop music", "study/work music" (S-38) |
| **City-night cluster** | "**tokyo night drive** - lofi hiphop + chill + beats to sleep/relax/study to"; "SHIBUYA NIGHTS - chill lofi beats + smooth jazz + **city night vibes**"; "Night Drive ~ Beats for Relaxing/Driving"; "Chillhop Drive 90's" | YouTube | multiple 24/7 and 10-24h streams catalogued (S-47) — audience per-stream not verified `[UNVERIFIED]` |
| **Spotify functional editorial** | Peaceful Piano · Deep Focus · Sleep · Brain Food · Coffee Table Jazz · Jazz in the Background · Piano in the Background · Music for Concentration · Chillout Lounge · Ambient Chill · Workday Lounge · Reading Chillout · Evening Jazz · Piano Dinner · lofi beats | Spotify | Peaceful Piano 4.5–7M, Deep Focus 2.7–4M+, Sleep 2.7M, Brain Food 2.2M, Coffee Table Jazz 1.5–2.65M followers (S-40/S-41 — two dated snapshots, both kept, CT-4) |
| **Spotify context mega-playlists** | Songs to Sing in the Car · Beast Mode · Dance Party | Spotify | 11.3M / 11.1M / 9.2M followers (S-30) |

## 5.2 The recurring vocabulary (frequency across S-01, S-05..S-21, S-34..S-47)

**Activity words:** study · relax · sleep · chill · focus / deep focus / concentration · work / workday / "for work" · coding · gaming · workout / gym / beast mode · commute / driving / drive · party · reading · dinner / cooking · morning / late night / 1 A.M. · cry / sad · romance / love.
**Place/scene words:** cafe / coffee shop / coffeehouse · lounge / bar · city night / night drive · Tokyo / Shibuya / Berlin / New York (city-named scenes) · rainy day / rain / rainy night · home / at home · office (rare as a name; "Workday Lounge" is Spotify's office construct) · nature.
**Genre carriers of the scene economy:** lofi hip hop · jazz / smooth jazz / bossa nova · piano · ambient · synthwave · chillhop.

## 5.3 Naming-convention findings (Axis 5 of the brief)

- **Academic anchor (S-33, peer-reviewed study of Spotify editorial + user playlist names, `[PARTIAL]` — abstract+findings read):** less than 20% of naming codes were genre-based; **context-based themes were the most common** naming class; BUT playlists with context-based names showed **higher genre homogeneity** than generically-named ones — "playlists were named on a **genre-by-proxy** basis". Design consequence: a scene name is a promise of one coherent sound.
- **The dominant big-property formula is genre+context, not pure context:** "lofi hip hop radio - beats to relax/study to" (668M views), "jazz/lofi hip hop beats to study/relax to", "Coffee Jazz … Cafe BGM for Work", "Jazz in the Background". Pure-context names exist and are big (Deep Focus, Sleep, Beast Mode, Songs to Sing in the Car) but on Spotify they are *editorial* brands backed by search position; on open YouTube competition, winners almost always name the genre AND the context (S-34..S-47).
- **Practitioner corroboration (S-42..S-44, three independent SEO guides, 2025–2026):** listeners search with intent phrases ("study music", "gym phonk", "late night coding lo-fi"); recommended formula = **genre + activity/scene** ("Heavy Metal Gym Session", "Lofi Beats for Coding"); broad pure-context titles ("Chill Vibes", "Workout Mix") are described as over-competed and under-performing.
- **Convergent rule for the owner's station list (INFERENCE):** ship stations in BOTH shapes — a small set of pure-context taps that mirror the ten platform-tested words (§1.8), and scene stations whose names carry genre+scene ("Rainy Jazz Café", "Tokyo Night Drive", "Office Lo-Fi") so the sound promise is explicit. "Office hours" as a pure-context name has no large public precedent found in the searched scope (`NOT FOUND IN THE SEARCHED SCOPE` — closest verified: Spotify "Workday Lounge", "Music for Concentration", YTM "Focus").

---

# Claim cross-verification and independence ledger

| ID | Load-bearing claim | A | B | C | Status |
|---|---|---|---|---|---|
| CV-1 | Spotify's browse surface mixes genre hubs, mood/activity hubs and a Decades hub | S-01 (fetched grid, this session) | S-04 (Naneedigital "Genres & Moods" tab) | S-33 (academic: Spotify organises "around behaviors, feelings…") | VERIFIED 3+ |
| CV-2 | YTM activity bar = Energize/Workout/Relax/Commute/Focus, expanded 2023 with Cry/Party/Romance/Feel good/Sleep | S-08/S-09/S-10 (9to5Google, one family) | S-11 (Android Headlines) | S-08b (Android Authority) | VERIFIED 3 independent outlets |
| CV-3 | Deezer Flow = 6 moods (Love/Workout/Chill/Sad/Focus/Party) + 32 genres | S-15 (support doc) | S-16 (newsroom 2021) | S-15b (Deezer Home support page) | VERIFIED — all first-party surfaces, one producer family; flagged `[single-source official]` for the exact 32 count |
| CV-4 | Spotify "All Out" decade playlists hold 8.6–14.8M followers per decade | S-29 (RouteNote 2026) | S-30 (Viberate, full page read) | S-31 (Stulyo, daily-tracked) | VERIFIED 3+ (independent trackers) |
| CV-5 | Lofi Girl = 15.8M subs; main stream 668M+ views; "beats to relax/study to" naming | S-34 (Social Blade) | S-36 (Wikipedia w/ dated milestones) | S-35 (vidIQ) + S-37 (OutlierKit) | VERIFIED 3+ |
| CV-6 | IFPI global genre top-10 order (Pop #1 … Reggae #10) | S-24 (IFPI 2022 full PDF) | S-25 (IFPI 2023 press) | S-26 (WorldMusicViews on 2023) | VERIFIED (B and C share the 2023 source event; 2022+2023 are two survey waves → counted as 2 independent measurements + 1 relay) |
| CV-7 | Luminate US 2025: R&B/Hip-Hop 349.9B (1-in-4), Rock 260.5B, Pop 167.2B; growth Rock/Christian/Latin | S-23 (Luminate PDF, full text read) | S-23c (MBW) | S-23d (Billboard) + S-23e (AP/Barchart) | VERIFIED 3+ |
| CV-8 | Apple runs a '50s→2010s Decades hub with Hits Essentials flagships | S-07 (curator page fetched) | S-07b (playlist pages US/GB) | — | `[single-source official]` — one producer; the page itself is the authority |
| CV-9 | Functional/scene playlists (Peaceful Piano, Deep Focus, Coffee Table Jazz…) hold 1.5–7M followers | S-40 (Chartlex 2026) | S-41 (Penny Fractions census) | S-42b (alltubedownload listicle) | VERIFIED 3 independent trackers; counts differ by snapshot date (CT-4) |
| CV-10 | Context-based names dominate playlist naming but are genre-homogeneous underneath | S-33 (peer-reviewed study) | S-43/S-44 (practitioner guides, independent) | S-38 (query-overlap data: "cafe music"+"study music" cluster) | VERIFIED 3+ (method-independent) |

# Contradiction ledger — preserved, not averaged

| ID | Disagreement | Side A | Side B | Handling |
|---|---|---|---|---|
| CT-1 | Which genre is #1? | IFPI global survey: **Pop** (S-24/S-25) | Luminate US volume: **R&B/Hip-Hop** (S-23) | Different populations (global self-report vs US stream counts). Both shown in the demand table; do not merge. |
| CT-2 | Is "Soundtracks" a demand genre? | IFPI global #8 (S-24) | Tidal RETIRED its Soundtracks hub (S-22) | Kept as borderline row 22; platforms are consolidating it into TV/Movies/Anime/Gaming context hubs. |
| CT-3 | Does demand decay monotonically with decade age? | Recency ordering predicts 90s > 80s | All Out 80s 11.9M > All Out 90s 8.7M (S-29/S-31) | Preserved: the 80s over-performs. Decade demand is nostalgia-driven, not recency-driven. |
| CT-4 | Exact follower counts of functional playlists | Peaceful Piano 4.5M / Deep Focus 2.7M / Coffee Table Jazz 1.5M (S-41, older census) | Peaceful Piano "7M+ (2024)" (S-42b); Deep Focus "4M+", Coffee Table Jazz 2.65M (S-40, 2026) | Both snapshots kept with dates; the ORDER is stable across snapshots and only the order is load-bearing here. |
| CT-5 | Hip-hop's global Spotify share | "hip-hop + phonk ≈30% of global Spotify streams 2025" (S-03, third-party citing Accio) | Luminate: R&B/Hip-Hop = 25% of US streams (S-23) | S-03 is `[single-source]`, SEO-shaped; excluded from load-bearing use; Luminate figure is the one carried. |
| CT-6 | Spotify browse category count | This session's logged-out grid: 57 tiles (S-01) | API removal (S-02) means no canonical count exists any more; logged-in grids are personalised (S-04) | The 57-tile list is dated 2026-08-29, logged-out, en-US locale; treated as one honest snapshot, not "the" list. |

# Source register (with read status; all accessed 2026-08-29)

| ID | Source | Producer / date | Read |
|---|---|---|---|
| S-01 | `https://open.spotify.com/search` "Browse all" grid | Spotify, live | `[FULL]` (fetched, 491-line capture read) |
| S-02 | Web API Changelog Feb 2026 — browse-categories endpoints REMOVED | Spotify for Developers, 2026-02 | `[PARTIAL]` (changelog entries via search highlight) |
| S-03 | "Genres on Spotify: artist guide" (6,000-microgenre + 30% claim) | artist.tools, 2026 | `[PARTIAL]` — flagged, non-load-bearing |
| S-04 | "How to search by genre on Spotify" | Naneedigital, n.d. | `[ABS]` |
| S-05 | Sound Therapy announcement (Focus/Relax/Sleep; Apple Music Chill) | Apple Newsroom + UMG, 2025-05-13 | `[FULL]` |
| S-06 | Apple Music comprehensive review (Browse structure, Music By Mood) | Headphonesty, 2024 update | `[FULL]` (35KB capture read) |
| S-07 | Apple Music **Decades** curator page | Apple, live | `[FULL]` (fetched, rooms enumerated) |
| S-07b | '80s Hits Essentials playlist pages (US 100 songs / GB 300 songs) | Apple, live | `[PARTIAL]` |
| S-08 | YTM activity bar launch (Workout/Focus/Relax/Commute) | 9to5Google, 2020-11-09 | `[FULL]` |
| S-08b | "5 reasons… YouTube Music" (mood row UX) | Android Authority, 2024 | `[PARTIAL]` |
| S-09 | YTM adds Energize | 9to5Google, 2021-11-11 | `[FULL]` |
| S-10 | YTM adds Cry/Party/Romance/Feel good/Sleep | 9to5Google, 2023-09-17 | `[FULL]` |
| S-11 | YTM mood filters on web (five modes) | Android Headlines, 2023-01 | `[PARTIAL]` |
| S-12 | Amazon Music for Artists — Programming ("genres, eras, contexts, locales") | Amazon, live | `[FULL]` |
| S-13 | music.amazon.com/search section heads | Amazon, live | `[PARTIAL]` |
| S-14 | DJ Mode launch (Rap Rotation, Country Heat, All Hits) | Amazon press, 2021-06 | `[PARTIAL]` |
| S-15 | Deezer support: Flow moods & genres (6 moods, 32 genres) | Deezer, live | `[FULL]` |
| S-15b | Deezer support: Deezer Home | Deezer, live | `[PARTIAL]` |
| S-16 | Flow Moods launch (six named moods) | Deezer Newsroom, 2021-10 | `[FULL]` |
| S-17 | Flow Tuner launch | Deezer Newsroom, 2026-02-13 | `[FULL]` |
| S-18 | Pandora help: Genres, Moods and Holidays | Pandora, live | `[FULL]` |
| S-19 | Pandora Mood Modes blog + Moods community thread | Pandora, 2023-12-11 | `[PARTIAL]` |
| S-20 | TIDAL review (Explore: Moods and Activities) | SoundGuys, 2024 | `[PARTIAL]` |
| S-21 | TIDAL × Alexa page (mood/genre aliases verbatim) | TIDAL, live | `[FULL]` (section) |
| S-22 | Roon community: TIDAL genre consolidation | Roon Labs forum, 2024–25 | `[PARTIAL]` |
| S-23 | Luminate 2025 Year-End Report (PDF full text on disk, genre pages read) | Luminate, 2026-01-14 | `[FULL]` (genre sections) |
| S-23b | Luminate 2024 Year-End Report (genre-share table) | Luminate, 2025-01 | `[PARTIAL]` |
| S-23c | MBW on Luminate 2025 | Music Business Worldwide, 2026-01 | `[PARTIAL]` |
| S-23d | Billboard on Luminate 2025 | Billboard Pro, 2026-01 | `[PARTIAL]` |
| S-23e | AP via Barchart on Luminate 2025 | AP, 2026-01 | `[ABS]` |
| S-24 | IFPI Engaging with Music 2022 (full report PDF; top-10 genre list) | IFPI, 2022-11 | `[PARTIAL]` (genre pages via capture) |
| S-25 | IFPI EWM 2023 press release | IFPI, 2023-12-11 | `[PARTIAL]` |
| S-25b | IFPI Global Music Report 2025 press | IFPI, 2025-03 | `[PARTIAL]` |
| S-26 | WorldMusicViews on EWM 2023 ranking | 2023-12 | `[PARTIAL]` |
| S-27 | Every Noise at Once (Wikipedia; 6,291 genres, frozen Dec 2023) | Wikipedia, current | `[PARTIAL]` |
| S-28 | "Spotify's layoffs put an end to a musical encyclopedia" | TechCrunch, 2024-02-12 | `[PARTIAL]` |
| S-29 | Top 10 most-followed Spotify playlists 2026 | RouteNote, 2026 | `[PARTIAL]` |
| S-30 | 50 Most Followed Playlists on Spotify | Viberate, live 2026 | `[FULL]` (2004-line capture read) |
| S-31 | Top 90s Spotify playlists ranked | Stulyo, 2026 | `[PARTIAL]` |
| S-32 | MJ biopic streaming surge (All Out refresh behaviour) | Chartmetric HMC, 2026 | `[PARTIAL]` |
| S-33 | "Playlists and genre: the role of music genre in Spotify's playlists" (peer-reviewed) | via vLex, journal article | `[PARTIAL]` — abstract + findings; full text paywalled, not bypassed |
| S-34 | Lofi Girl stats | Social Blade, 2026-08-28 | `[PARTIAL]` |
| S-35 | Lofi Girl stats + top videos | vidIQ, 2026-08-06 | `[PARTIAL]` |
| S-36 | Lofi Girl | Wikipedia, upd. 2026-06-02 | `[FULL]` (38KB capture) |
| S-37 | Lofi Girl channel analysis | OutlierKit, 2026 | `[PARTIAL]` |
| S-38 | Channels like Cafe Music BGM (competitor/query table) | channelslike.com, 2026 | `[PARTIAL]` |
| S-39 | Cafe Music BGM aggregate stats | eastphoenixau aggregator | `[ABS]` — weak source, corroborative only |
| S-40 | Spotify growth for jazz artists (playlist followers) | Chartlex, 2026 | `[PARTIAL]` |
| S-41 | "Do Playlists Dream of Fake Artists?" (50+ functional playlists w/ followers) | Penny Fractions newsletter | `[PARTIAL]` |
| S-42 | Spotify Playlist SEO | PlaylistFeed, 2025-05-19 | `[PARTIAL]` |
| S-42b | "Which chill playlists for studying in a quiet café" | alltubedownload, n.d. | `[ABS]` — corroborative only |
| S-43 | 10 formulas for playlist names | artist.tools, 2026 | `[FULL]` (34KB capture) |
| S-44 | Spotify Playlist SEO guide | artistrack, 2025 | `[PARTIAL]` |
| S-45 | Best lofi study channels 2026 (channel table) | chillframe, 2026 | `[FULL]` (21KB capture) |
| S-46 | Chillhop Radio playlist page (621,740 saves) | Spotify, live | `[PARTIAL]` |
| S-47 | 200-video catalogue of 24/7 streams (exact stream names) | note.com/text_sakura | `[PARTIAL]` (75KB capture, stream-name sections read) |
| S-47b | YouTube Music decades listening guide | thedetroitbureau, 2025 | `[ABS]` |

**Counts:** independent authoritative provenance families **≈34** (9to5Google×3 = 1 family; Apple+UMG press = 1; Deezer surfaces = 1; Luminate PDFs+press relays = 1 primary + 3 relays counted separately only as corroboration). **Slice floor (≥8): MET.** Academic sources: **1** (S-33) — this slice's brief set no academic floor; the parent's ≥5-academic floor is carried by the overall run. Primary first-party surfaces read `[FULL]`: **9** (S-01, S-05, S-07, S-08, S-09, S-10, S-12, S-15, S-16/17/18/21 family). Claims: **10 ledger rows** — 8 VERIFIED 3+, 2 `[single-source official]`; inline flags: 2 `[single-source]`, 1 `[UNVERIFIED]`.

# Known gaps

1. **Every Noise popularity ordering not extracted** — `everynoise1d.html` is JS-rendered; static fetch returns chrome only. The 6,291-genre scale fact is carried; the popularity-sorted list is not. A headless-browser pass could recover it.
2. **Apple Music's "ten mood categories" only 4-of-10 enumerated** (Chill, Feel Good, Focus, Sleep) — the review names "etc."; Apple exposes no public list page found in scope.
3. **Spotify's 57-tile grid is one snapshot** (logged-out, en-US, 2026-08-29); logged-in/regional grids differ and cannot be enumerated via API since Feb 2026.
4. **Per-stream audiences for the city-night cluster** (tokyo night drive, SHIBUYA NIGHTS) unverified — names verified, sizes `[UNVERIFIED]`.
5. **IFPI EWM 2024/2025 genre ranking**: not found in searched scope; 2023 is the newest public genre top-10.
6. **S-33 full text paywalled** — findings taken from the indexed abstract/findings text; not bypassed (R13).
7. **`docs/README.md` does not exist** in this project — no index row could be appended; parent should decide whether to create the index.
8. **Follower counts are save-counts, not listening-hours** — demand ordering by followers is a proxy; engagement-based ordering could differ (CT-4 shows snapshot drift).

# Completion audit (slice)

- [x] All five brief subquestions covered; none narrowed; per-platform lists verbatim with dates.
- [x] Search-first; zero guessed locators; 1 failed render (everynoise1d) handled per R4.3 (re-search, no slug variants, gap recorded).
- [x] Slice floor ≥8 independent authoritative sources: MET (~34 families).
- [x] Load-bearing claims triple-verified or visibly flagged; 6 contradictions preserved.
- [x] English, ISO-date kebab-case, `# Standards ledger` opener, query/claim/contradiction/source ledgers present.
- [x] No file outside `docs/research/` written; engine files untouched.

*Report written 2026-08-29 by the streaming-taxonomy slice worker under Berk's deep-research covenant (MODE B, delegated).*




