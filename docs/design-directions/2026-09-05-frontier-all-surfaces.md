# Three structurally divergent directions — web, phone, tablet, players

Date: 2026-09-05 · Lane: d575a0b1 · Task: `i3-uiux-directions` · Status: **AWAITING `APPROVED BY BERK: <direction name>`** (rules/14 — no build before that literal line is written by him).

# Standards ledger

| Standard (read from disk this session) | Path | How this document obeys it |
| --- | --- | --- |
| Design contract (rules/14) | `C:\Berk\PlayMusicPrompts\.cursor\rules\14-design-contract.mdc` | Knowledge loaded (§2), surface classes named (§1), ≥3 STRUCTURALLY divergent directions (§4–§6), every taste/brand slot written as `OWNER-DECISION` and left empty, banned-skeleton audit per direction (§7), all seven states designed (§3.2), floors (§3.3), evidence gates before "done" (§9) |
| Frontier protocol (rules/09) + deep-research covenant | `C:\Berk\PlayMusicPrompts\.cursor\rules\09-frontier-protocol.mdc`; main report `C:\Berk\PlayMusicPrompts\docs\research\2026-09-05-frontier-music-ui-ux-frontier.md` | Every KNOWLEDGE claim below cites a slice file + source id; 6/6 slices accepted by the parent after disk verification and primary re-opening (lane ledger 2026-09-05) |
| No-narrowing (rules/10) | `C:\Berk\PlayMusicPrompts\.cursor\rules\10-no-narrowing.mdc` | His items: web + mobile app + tablet app; prompt → optional fields → playing music; everything developed so far presented "ultra"; players included; mockups not binding. Each direction covers all three surfaces and all screens (§4.4/§5.4/§6.4) |
| Owner profile (rules/08), clauses 41, 8, 9, 10 | `C:\Berk\PlayMusicPrompts\.cursor\rules\08-owner-profile.mdc` | Theme polarity is an OWNER-DECISION (clause 41 light vs his 2026-08-29 black-theme order for the player lane); every one of the 101 capability parameters is reachable (clause 8); real API shape read (§2.4); no mock/synthetic data anywhere (clause 10) |
| Frontier frontend law (rules/20-frontend) | `C:\Berk\PlayMusicPrompts\.cursor\rules\20-frontier-frontend-development-law.mdc` | All request parameters the API supports must be enterable and wired — carried as a hard requirement into every direction (§3.4) |
| Multi-agent write safety (rules/13) | `C:\Berk\PlayMusicPrompts\.cursor\rules\13-multiagent-write-safety.mdc` | This file is new; the shared tier (lane ledger) is appended, never rewritten |

Measured absences (rules/17, this session): `berk-ui` and `berk-dashboards` skills ABSENT in both skill trees (`C:\Users\berke\.claude\skills\`, `C:\Users\berke\.cursor\skills\`); project `design-knowledge/` corpus ABSENT; `docs/architecture/` banned-skeleton inventory ABSENT; `SURFACE-CLASSES.md` and project `DESIGN-CONTRACT.md` ABSENT. The knowledge floor is therefore carried by the six research slices of this run (§2) and the banned-skeleton inventory is the one the competitor slices documented (D1–D6, `docs/research/competitors/2026-09-05-prompt-to-music-creation-ui-and-menus.md` §2) plus the player-vertical defaults recorded in `…live-adaptive-player-ui-and-menus.md`.

# 1. Surface classes (rules/14 "before" step)

| Surface | Class | Why |
| --- | --- | --- |
| Web `/` (one prompt → player), `/musics`, `/t/<id>`, legal, auth | **page/site + embedded player** | Public, indexable, login-free generation; `/t` and `/musics` are growth artefacts (growth slice f-S01: passive-broadcast artefacts +246 % peer adoption) |
| Phone app (Flutter iOS/Android) | **portal + player** | Personal, session-centric, background/lock-screen listening is where hours accrue (APIs slice S104: Live Activities 8 h/12 h; SOTA C6) |
| Tablet app (Flutter iPadOS/Android) | **portal + player, tablet-native** | Competitor evidence: only Apple Music ships a tablet-native shell; YouTube Music/Amazon/TIDAL/Deezer ship portrait phone shapes (player slice RUN 3, image-backed); Spotify's forced split-view drew "let us turn it off" (cx slice S20–S22) — a real differentiation space |
| The players (mini-bar, full player, lock-screen/Live Activity, CarPlay/Android Auto, embed iframe) | **player class across all three** | His order names players explicitly |

The four SURFACE-CLASSES.md questions cannot be answered from that file (ABSENT); the equivalents are answered here: who (anonymous first, then account), what they do (type a prompt, optionally fill fields, listen for a long time, share), how long (minutes → hours; prepare-ahead sessions), where (phone in pocket/car, tablet on a table, web at a desk).

# 2. Knowledge loaded this session (KNOWLEDGE — citable facts, not taste)

Each row: fact → source (slice file, id, locator re-opened by the parent where marked ✔).

## 2.1 Interaction and state
- K1. Language is the entry, structure is the refinement: users cannot express temporal intent in free text; an editable structured intermediate (our `prompt_sent` + `bindings.*.sent`) plus 3 simultaneous takes is what two independent 2025 studies converge on. — SOTA S01 (CHI'25, n=17), S02 (DIS'25, n=11+7), C1.
- K2. Exposing the model's interpretation raises trust (SUS 62.5 but feedback-clarity 4.0/5; 14 curators). — SOTA S05, S08, C2. Contradiction preserved: transparency-vs-usability.
- K3. At a 60 s wait, 63 % prefer the waiting service when the labour is shown vs 23 % when blind; transparency p<.01, wait length n.s. — cx S101 Buell & Norton 2011 ✔ (capture line 97). Users of generative tools value the wait as effort until it exceeds the stated expectation. — cx S104 (CHI EA 2025). The last segment of a progress bar anchors perceived duration; never a terminal stall. — cx S102.
- K4. Latency is design material: speculative execution −26 ms perceived at 2.6 % error (SOTA S04); live music models have a ≥2 s control-to-sound floor, 10 s context (SOTA S57 NeurIPS'25 ✔ via A2.12). Skip must commit visually in <100 ms and roll back if the prepared take is not ready.
- K5. Prompt non-adherence with no "fix one detail" path is both the top product complaint and the central academic finding. — cx C2 (S03–S06, S12).
- K6. Skip is graded information: non-skip rate ≈ 34–35 % constant across positions (MSSD, player A-01); "how the previous track ended" feature is worth −28 % accuracy if removed (Meggetto 2023, player A-04 ✔ line 173); skip-contrastive loss +8–20 % HR@1 (A-03).
- K7. Gapless continuity is a precondition, not polish: Haruvi 2022 names it a confound of the focus effect (player A-02); Apple AutoMix beat-matched transitions with a visible "Mixing" state are a parity gap (player G-3).

## 2.2 Perception, motion, accessibility
- K8. Light mode reads faster on emissive screens (CHI'23 Google, F=12.8, p<.01 — SOTA S30 ✔ capture line 201); dark wins on optical see-through HMDs (SOTA S31). Owner mockups are black + neon; his 2026-08-29 order for the player lane was BLACK. → OWNER-DECISION, not resolved here. SC 1.4.11 3:1 is the checkable constraint for neon-on-black.
- K9. WCAG 2.2 floors: 2.5.8 targets 24×24 px, 2.5.7 non-drag alternative for seek/volume, 2.4.11 focus not obscured, 2.2.2/2.3.3 motion; `prefers-reduced-motion` does not govern JS/GPU loops (SOTA C6). WCAG 3.0 WD Guideline 2.1.9 "Accessible media player" (SOTA S59). W3C MAUR: playback rate, pitch-preserving time-scale, independent volume, tracks exposed to accessibility APIs (cx S109). EN 301 549 V4.1.1 (2026-09) aligned to WCAG 2.2 (future S22).
- K10. Perceptual budgets: drag JND 11 ms direct / 33 ms mean, tap 64–82 ms, one 60 Hz frame perceptible; AV asynchrony JND 25–50 ms transient → visualiser end-to-end ≤ 40 ms, controls ≤ 1 frame. — APIs A01–A04.
- K11. Motion primitives available: Flutter `SpringSimulation`, `Curves.easeInOutCubicEmphasized`; no M3 Expressive token API in 3.44–3.47 (APIs S156–S162). Web: GSAP 3.15 free under Webflow Standard licence; three.js r185.1 MIT (APIs S15, S17).

## 2.3 Rendering substrate (what "ultra" can physically be)
- K12. Flutter: Impeller sole renderer on iOS, default Android API 29+, web still Skia; `FragmentProgram` GLSL 100–460, no vertex shaders, `ImageFilter.shader` Impeller-only; no WebGPU path in Flutter (APIs S27–S30, S42). Released `just_audio` 0.10.6 has NO visualiser API (0 symbols); waveform/FFT streams exist only on the `visualizer` branch 0.11.0 (APIs S198 ✔ lines 109–132) → audio-reactive visuals on Flutter need a pinned branch or a native FFT tap (OWNER/ENGINEERING DECISION, §8).
- K13. Web: WebGPU default in Chrome/Edge ≥113 desktop, Chrome ≥121 Android, Safari 26, Firefox partial → WebGL2 fallback mandatory (APIs S01–S04); Web Audio `AnalyserNode` + `AudioWorklet` 128-frame quantum (APIs S05, A05); Beat This! beat F1 89.1 / downbeat 78.3, worse continuity → precompute per-take beat grids server-side (SOTA S27, C4).
- K14. Web gates: INP good ≤ 200 ms, LoAF ≥ 50 ms frames, Lighthouse v13 (APIs S62–S64).
- K15. Colour/typography standards at CRD level: OKLCH (CSS Color 4), canvas `display-p3`, WebGPU extended-range tone mapping; browser HDR shipping [UNVERIFIED] (SOTA S35–S37). Variable fonts via CSS `font-variation-settings` / Flutter `FontVariation` (SOTA Angle 5).

## 2.4 Real API shape (rules/02, rules/20-frontend)
- K16. Capabilities capture `C:\Berk\PlayMusicPrompts\artifacts\capabilities-live-20260901.json` (530,221 B, 2026-09-01): **101 parameters**; today the web `/` page compiles 8 home-owned parameters + Enhance, `/studio/workbench` exposes 96 request inputs, the Flutter Studio exposes all 101 grouped by real engine sections (STATE.md 2026-09-02 entries). Every direction must keep every one of the 101 reachable (rules/20-frontend), and must surface every field the generation response returns (`route.why`, `mix_plan.refusals[]`, `render_plan.verification`, `lyrics_verification.per/verdict`, LUFS/dBTP, `processed_url_kind`, quota) — rules/08 clause 8.

## 2.5 Monetisation, growth, regulation constraints
- K17. Ad load: −2.082 % hours and −1.911 % active days per extra ad/hour, N=34,390,962; shorter/more frequent pods weakly preferred (0.4073, p<.05) — player A-06 ✔ lines 193/197/202/954. No first-party ad-cadence disclosure exists at any of six free tiers (player RUN 2, 6/6 NOT FOUND). Spotify deliberately adds free-tier friction for conversion (cx S110 ✔ lines 49/85) — a lever PMP does not have (no paid tier).
- K18. DSA Art. 26(1)(a)–(c): the platform presenting the ad must mark it as an ad in real time, name on whose behalf and who paid — a UI duty on PMP's surfaces (future S20 ✔ lines 940–946); Art. 28(2) no profiling ads to known minors.
- K19. EU AI Act Art. 50(2) marking for every generated track by **2 Dec 2026** (Reg. 2026/1744 Art. 111(4), future S02 ✔ line 304); Commission Guidelines para 65: queue/recommender exempt, generated tracks inside (future S24 ✔ line 1065). Player/track surfaces must be able to SHOW provenance; Studio export must never strip it.
- K20. Growth artefacts: passive-broadcast artefacts +246 % peer adoption vs +98 % for personalised invites (RCT n=9,687, growth f-S01); Spotify oEmbed contract (`/oembed`, rich iframe 152 px) is the embed template and Suno has none (growth f-S10–S13); our live `/t/<id>` has OG 11 / Twitter 4 / JSON-LD 2 but oEmbed 0 and `/api/oembed` 404 (future+growth ADDENDUM 2 live measurement).
- K21. Dominant complaint class across Apple/Play/Trustpilot/Şikayetvar and 240 JA/ZH-TW/KO/ES/PT-BR/DE reviews: credit expiry, forced renewal, silent billing, non-adherence, app/web parity gaps, player reliability (cx C1, C10, S120). PMP has no credits — "genuinely free and unlimited" is a truthful headline.
- K22. Trust paradox: 80 % want AI labelled, yet an "AI" label lowers narrative engagement even on human music (Wu & Holmes F(1,2091)=21.03 ✔ line 108) → say "Composed for you by Ideasets Hybrid Music Composer", keep Art. 50 marking machine-readable and in a provenance panel, not as a headline badge. OWNER-DECISION on wording.

# 3. What all three directions share (KNOWLEDGE-derived, structure-neutral)

## 3.1 The state skeleton (SOTA slice, line 242 recommendation — evidence-scoped)
`Prompt → Compiled (prompt_sent + bindings shown) → Prepared takes (≥2 visible) → Playing (beat-locked visual) → Recalibrating (T−90 s, visible) → Skip/Rollback (<100 ms visual commit) → Ad break (Google audio ad, −14 LUFS, marked per DSA Art. 26)`. The directions diverge on WHERE these states live and HOW the user moves between them — never on palette.

## 3.2 The seven states every surface designs (rules/14; none defaulted)
1. **Loading** — no layout shift on resolve; capabilities-fed lists render with reserved geometry.
2. **Empty** — no session yet: the prompt is the only thing that speaks; catalogue-first entry is offered, never forced.
3. **Partial / degraded** — engine bundled-offline (Flutter `source=bundled`), one take failed of three, catalogue reachable but generation quota exhausted (visitor 12/h, 40/day) — each is a distinct, truthful state; "there is no data" and "we could not load the data" are never conflated.
4. **Failed** — the four backend error classes (validation 400, content_blocked, upstream, quota) each with their own copy and recovery; >120 s generation = error state, not an endless bar (K3).
5. **Stale** — signed delivery URL expired (v4 refresh, free), catalogue list older than N minutes, prepared take older than its expiry.
6. **Unauthorised** — anonymous vs account surfaces (playlists/likes need identity; generation does not).
7. **Success** — with every returned field surfaced (K16).
Plus the generative-specific eighth: **Generating / Prepared** announced to assistive tech (cx C7: "the generating/prepared state must be announced").

## 3.3 Floors (law, never traded)
320 CSS px reflow; 24×24 px targets; visible focus; contrast per SC 1.4.3/1.4.11; `prefers-reduced-motion` served by a designed alternative (reduced-motion visualiser = static beat-locked geometry, never a deletion) AND the GPU loop honours it explicitly (K9); semantic DOM under any canvas; WCAG 2.2 AA; MAUR transport (rate, pitch-preserving stretch, independent volume); every image/gesture has a non-drag equivalent (SC 2.5.7).

## 3.4 Hard requirements from the laws (not design taste)
- All 101 capability parameters reachable and wired to the request (rules/20-frontend; K16).
- Every returned field surfaced (rules/08 clause 8).
- DSA Art. 26 ad marking on every ad surface (K18); Art. 50 provenance panel on every track surface (K19).
- One listening queue for generated + catalogue tracks (D-PMP-05, 2026-09-05).
- Ad cadence unchanged from the approved item-5 model (3–5/hour, after full listen); no rewarded ads (D-PMP-05).
- No credits, no limits UI, no "upgrade" friction (K17, K21).

## 3.5 OWNER-DECISION slots (empty until Berk fills them; agents decide none of these)
- OWNER-DECISION: theme polarity (light per rules/08 cl. 41 vs black+neon per his 2026-08-29 order and 24 mockups) — evidence K8 on both sides.
- OWNER-DECISION: palette values, type family, type scale, spacing scale, grid, breakpoints, motion curves and durations, component inventory, copy voice.
- OWNER-DECISION: the wording of the composer attribution and of the provenance panel (K22).
- OWNER-DECISION: whether the generation-wait ad slot (§8, item R1) is pursued — money + brand.
- OWNER-DECISION: whether the Flutter audio-reactive visual uses the pinned `just_audio` visualizer branch or a native FFT tap (K12) — engineering risk he owns.

# 4. Direction A — THE STREAM (time is the spine)

## 4.1 Structural idea
One continuous vertical (phone) / horizontal (web, tablet-landscape) **time stream** is the whole product. Left/past: what played and how it ended (skip reason, full listen — K6 made visible). Centre/now: the playing take with its beat-locked visual. Right/future: the ≥2 prepared takes as real, audible-on-tap stops, then the "horizon" where the next generation is being composed (K3 labour shown as stages). The prompt is not a form above the player; it is the **source** at the head of the stream, and every later stop carries the compiled `prompt_sent` + bindings that produced it (K1, K2). Ad breaks are stops on the same stream, marked before they arrive (K18). Catalogue tracks join the stream as stops with a different origin glyph (one queue).

## 4.2 How the states appear
Empty = a stream with only its source; Compiled = the source expands into its bindings and a first prepared stop appears; Prepared = stops at the right edge fill in; Playing = the centre stop is the stage; Recalibrating = the horizon shows "listening to how you listen — next take adapts" with the T−90 s marker; Skip = the stream slides one stop left in <100 ms, the skipped stop stays in the past with its reason; Ad break = a marked stop with "Advertisement · on behalf of X · paid by Y"; Failed/Degraded = the stop itself renders its error class in place — nothing modal.

## 4.3 Players
Mini-bar = the centre stop compressed to one line with the next stop peeking; full player = the stream at full height; lock screen / Live Activity = now + next (4 KB, K12/S104); CarPlay/Android Auto = the stream reduced to "now / next / skip"; embed iframe = a single stop with the source line (oEmbed, K20).

## 4.4 Surfaces
- Web `/`: the stream fills the viewport horizontally on ≥1024 px, vertically below; `/musics` is a stream of catalogue stops filterable by genre/mood/era; `/t/<id>` is one stop with its source and provenance panel, embeddable.
- Phone: vertical stream, thumb-reach transport pinned at the bottom, Studio (101 params) opens as the source's full expansion, not a separate tab.
- Tablet: two-lane stream — the time stream on the left two-thirds, the source/bindings/Studio rail on the right third; landscape reflows to a single long horizontal stream with the rail below (Android 16 sw≥600dp cannot lock orientation — future S14).

## 4.5 Banned-skeleton audit (against D1–D6 and the player defaults)
D1 create-left/results-right/player-bottom → broken (no panel/list/bottom triad; one spine). D2 sibling takes chosen by click → broken (takes are sequential stops, audible-on-tap, never a comparison chore). D3 queue as slot count → broken (queue is a horizon, count is incidental). D4 spinner until file exists → broken (labour stages + audible prepared stops). D5 credit counter → absent by design. D6 "Advanced" disclosure → replaced by the source expanding into 101 parameters grouped by engine section. Player defaults (bottom transport + art square + list) → the art square is gone; transport lives on the stream itself.

## 4.6 Evidence for / against
For: K1, K2, K3, K6 (past stops show how they ended → the algorithm's own signal made legible), K7 (continuity is visible as an unbroken line). Against/risks: horizontal streams on web need careful keyboard/scroll semantics (SC 2.1.1, 2.4.11); a stream metaphor can read as a "timeline app" and hide the prompt's importance on first visit — the empty state must make the source dominant.

# 5. Direction B — THE FIELD (space is the spine)

## 5.1 Structural idea
A single **spatial field** rendered on one GPU surface (WebGPU/WebGL2 on web; Impeller `FragmentProgram` on Flutter — K12, K13). The playing take is the centre body, beat-locked to its server-precomputed beat grid (K13). The ≥2 prepared takes are **bodies in orbit** at distances that encode readiness (near = ready, far = still composing — the labour of K3 made spatial). The prompt and its compiled bindings are **rings** around the centre: each binding class a ring, each sent value a marker on it; tapping a ring opens that parameter group of the 101 (D6 replaced by scaling geometry). Skip = the nearest orbiting body falls into the centre in <100 ms and the old centre drifts to the "past" edge with its ending reason. The ad break is a body of a different material that announces itself one orbit ahead (K18). Catalogue is the same field zoomed out: constellations by genre/mood/era. Reduced-motion = the same geometry, static, with position and colour still carrying state (floor §3.3).

## 5.2 How the states appear
Empty = an unlit field with the prompt as its only light; Compiled = rings form; Prepared = bodies appear at distance and approach as their audio lands; Playing = centre pulses on the beat grid (≤40 ms AV budget, K10); Recalibrating = the outermost ring rotates and labels "adapting to how you listened"; Failed = a body collapses in place with its error class; Degraded/offline = the field dims to a flat map, still navigable.

## 5.3 Players
Mini-bar = the centre body as a small disc with orbit count; full player = the field; lock screen/Live Activity = disc + next; CarPlay/Android Auto = disc + "next" list (no field rendering); embed = a static field snapshot with a play control (no GPU in the iframe).

## 5.4 Surfaces
- Web `/`: full-viewport field; the DOM under the canvas carries the full semantic structure (list of takes, bindings, transport) — K9/§3.3. `/musics` = zoomed-out constellation with a facet rail. `/t/<id>` = one body with its rings and provenance panel.
- Phone: field fills the screen; transport pinned bottom; Studio = the rings opened as a full-screen radial index.
- Tablet: field left, **rings expanded as a persistent right-hand parameter rail** (the tablet-native shell only Apple Music has, player slice RUN 3); landscape/portrait reflow keeps the field centred.

## 5.5 Banned-skeleton audit
D1 → broken (no panel/list/bar). D2 → broken (takes are orbiting bodies, sequential by readiness). D3 → broken (queue is orbit, not slot count). D4 → broken (distance encodes progress, audible when near). D5 → absent. D6 → rings scale to all 101 parameters. Player defaults → no art square, no bottom list.

## 5.6 Evidence for / against
For: K3 (labour shown as approach), K4 (visual commit latency is native to the metaphor), K7/K13 (beat-locked centre), K2 (rings expose interpretation). Against/risks: GPU cost and battery on phones (rules/14 performance gate; INP/LoAF K14); the Flutter visualiser dependency risk (K12 — OWNER/ENGINEERING DECISION); a spatial metaphor can be beautiful and illegible at once — the semantic DOM and the reduced-motion twin are non-negotiable, and the empty state must not read as a screensaver.

# 6. Direction C — THE DIALOGUE (language is the spine)

## 6.1 Structural idea
The whole product is a **conversation between the listener and the composer**, because language is the proven entry point (K1) and exposing interpretation is the proven trust lever (K2). Every prompt is a message; the composer's reply is a **compiled card** (`prompt_sent`, bindings, `route.why`, refusals) that the user can edit inline — the "fix one detail" path users lack everywhere (K5). The takes arrive **inside the thread** as playable cards; "Make it a playlist" is a reply; steering is typed or spoken inline ("warmer", "no vocals", "keep this tempo") — the in-player natural-language steering that Spotify DJ has and no generative player ships (player gap G-2). The queue is the thread's future: prepared cards visible below the playing one, each with its own compiled card. Ad breaks arrive as a clearly marked message from the sponsor (K18). Catalogue = other listeners' threads, browsable; a shared queue = a shared thread (Jam gap G-1).

## 6.2 How the states appear
Empty = one composer greeting and the input; Compiled = the compiled card streams in field by field (labour visible, K3); Prepared = take cards attach; Playing = the playing card expands into the player with its beat visual; Recalibrating = the composer posts "adapting the next take to how you listened" with the T−90 s countdown; Skip = the next card slides up in <100 ms, the skipped card keeps its ending reason; Failed = the composer says exactly what failed and offers the recovery; Degraded/offline = the composer says the engine surface is bundled/offline and what still works.

## 6.3 Players
Mini-bar = the playing card collapsed to one line with the next card's title; full player = the card expanded to full height, thread scrollable behind; lock screen/Live Activity = card title + next; CarPlay/Android Auto = card list; embed = a single card with its compiled summary (oEmbed).

## 6.4 Surfaces
- Web `/`: thread centred with the player docked; `/musics` = a wall of threads with facets; `/t/<id>` = one card thread, embeddable, quotable text for GEO (K20).
- Phone: native chat ergonomics — input pinned above the keyboard, transport above the input.
- Tablet: **threads list left, active thread right**, Studio opens as the compiled card expanded to all 101 parameters; landscape/portrait preserved.

## 6.5 Banned-skeleton audit
D1 → broken (thread, not panel/list/bar). D2 → broken (takes arrive as sequential replies). D3 → broken. D4 → broken (compiled card streams in; take cards become audible as they land). D5 → absent. D6 → the compiled card expands to the full 101 grouped by engine section. Player defaults → no persistent art square; the card is the artwork.

## 6.6 Evidence for / against
For: K1, K2, K5 (strongest evidence base of the three for the creation vertical), G-1/G-2 parity gaps closed structurally, GEO (quotable threads). Against/risks: chat idioms carry expectations of an assistant that "talks back" — copy discipline and latency honesty are critical (K3: announce 45–90 s and land inside it); long threads need virtualisation; the trust paradox (K22) means the composer must never be labelled "AI" in the headline.

# 7. Cross-direction banned-skeleton audit (summary table)

| Default pattern (source) | A THE STREAM | B THE FIELD | C THE DIALOGUE |
| --- | --- | --- | --- |
| D1 panel-left / list-right / player-bottom | broken — one time spine | broken — one field | broken — one thread |
| D2 sibling takes chosen by click | broken — sequential stops | broken — bodies by readiness | broken — sequential reply cards |
| D3 queue as slot count | broken — horizon | broken — orbit | broken — thread future |
| D4 spinner until file exists | broken — labour stages + audible stops | broken — approach distance | broken — streaming compiled card |
| D5 credit counter | absent | absent | absent |
| D6 "Advanced" hides controls | source expands to 101 | rings scale to 101 | compiled card expands to 101 |
| Player default: art square + bottom list + transport bar | transport on the stream | transport on the field | card is the artwork |
| Tablet default: scaled phone (4/5 competitors) | two-lane stream | field + parameter rail | threads + active thread |

Structural divergence check (rules/14 "three palettes over one skeleton is one direction"): the three differ in spine (time / space / language), in where the 101 parameters live (source / rings / compiled card), in where prepared takes live (stops / orbits / cards), in the tablet shell, and in the empty state. They share only the evidence-backed state skeleton (§3.1), the laws (§3.4) and the OWNER-DECISION slots (§3.5). PASS.

# 8. Product features the research says every direction should carry (from the owner's brainstorming request of 2026-09-05 17:01 — free forever, ads-only)

Ranked by the parent on measured evidence; each is a candidate task, not a decision:
- R1. Generation-wait ad slot + instant catalogue first sound (K3 transparency, reuse research 2026-09-03 P2/P3; **policy compliance with Google IMA/AdMob placement rules [UNVERIFIED] — item 11 research worker checks**).
- R2. Continuous stations by genre/mood/era/scene from the catalogue + beat-matched transitions (K7, era row shipped by no leader per 2026-08-29 research).
- R3. Lock screen / Live Activities / CarPlay / Android Auto / background (K12 S104; player gaps G-5/G-6).
- R4. Public pages default-on + oEmbed + genre/mood/era landing pages (K20).
- R5. Shared listening room (player gap G-1).
- R6. Graded skip taxonomy feeding next-take selection (K6).
- R7. Take voting with attribution instead of credits (Turntable model, comp-creation S18).
- R8. Weekly/yearly listener artefact (growth ADDENDUM 2 cards — evidence thin, [ABS]).
- R9. Re-engagement notifications (requires Flutter analytics, currently ABSENT — analytics audit §2).
- R10. Provenance panel + composer attribution wording (K19, K22).
Not to do (evidence): raise ad load (K17); add credits/limits (K21); rewarded ads (D-PMP-05); headline "AI" label (K22).

# 9. Evidence gates before any "done" on the chosen direction (rules/14 "after")
1. Banned-skeleton audit of the BUILT surfaces against §7 (structural moves listed and judged).
2. `tsc` / `next build` / `eslint` = 0; `flutter analyze` = 0; `flutter test` all green — numbers, not adjectives.
3. Responsive proof: width sweep tool at 375 / 768 / 1440 minimum plus 320 reflow and 2560; 0 px overflow; tablet portrait AND landscape.
4. Performance in a real browser: INP ≤ 200 ms, long-task count, TBT; visualiser end-to-end ≤ 40 ms; first paint independent of GPU init; Flutter frame-time trace on a mid-range device.
5. Rendered visual evidence: screenshots at every checked width + reduced-motion state, read back and self-audited before presentation (rules/02 "visual: unverified" until then).
6. Accessibility: axe/Lighthouse a11y, keyboard-only pass, screen-reader announcement of Generating/Prepared, MAUR transport check.
7. Every one of the 101 parameters reachable — machine-counted against the live capabilities response; every response field surfaced — machine-counted.
8. DSA Art. 26 marks present on every ad surface; provenance panel present on every track surface.
9. Commit-first evaluation record written before each visual check.
Records live in `docs/verification/` with dates.

# 10. Approval

Three directions are presented. The parent's committed recommendation is stated in the chat brief (rules/16 D5), not written here as a decision, because the choice is the owner's (rules/14).

`APPROVED BY BERK: THE STREAM (centre stop rendered as THE FIELD, source edited as THE DIALOGUE)` — his word "onaylıyorum", 2026-09-05 18:44 +03, in reply to the parent's committed recommendation of 18:4x (chat). Resolved with the same approval: theme black + neon (his 2026-08-29 order stands; K8 mitigated by SC 1.4.11 3:1 and larger body type); brand colours = measured `/create` CTA gradient #E62BA4→#B014D5→#5805E4→#0A0FE6→#0075FA + logo palette #7F00FF/#0000FF/#FF00FF/#00FFFF; type = Manrope (bundled, OFL); Flutter/web audio-reactive visual = server-precomputed beat grid + loudness envelope delivered with each take (no `just_audio` visualizer branch, no client FFT); generation-wait = instant catalogue first sound + banner, NO extra audio ad; composer attribution "Composed for you by Ideasets Hybrid Music Composer", Art. 50 marking machine-readable in a provenance panel; tablet = two-lane stream with a closable parameter rail; feature wave 1 = R2, R3, R4, R6, R10; wave 2 = R5, R7, R9.

Status: **APPROVED — build authorised** (rules/14 "before" gate closed).

