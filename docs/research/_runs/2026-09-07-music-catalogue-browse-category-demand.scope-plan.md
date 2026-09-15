# R3 Scope plan — music-catalogue-browse-category-demand

Written before the first external call of this run, per the delegating agent's explicit instruction and per R3/R14.2.

## 1. Exact decision served

Which curated genre x mood x era "category cells", at what relative track-count weight, should Berk's team target for a **10,000-track pre-generated batch** that seeds a new "Browse" / catalogue-discovery experience (homepage quick-play + category-card browsing) on PlayMusicPrompts — so the batch matches **real global listening demand** rather than an ad hoc guess. This research supplies the underlying facts; final UI copy/design remains Berk's own decision (rule 14 design-contract).

## 2. Why

PlayMusicPrompts is 100% ads-funded (no subscriptions). Revenue scales with listening time per generated track. The live catalogue DB (measured 2026-09-07 by the delegating agent) holds only 45 tracks, 9/45 genre-tagged, 0/45 era-tagged — too thin for a browse experience. Berk is about to spend real Vertex AI Lyria generation cost on ~10,000 tracks; the category weighting decides where that cost goes.

## 3. Project context

PlayMusicPrompts (www.playmusicprompts.com), live ads-only prompt-to-music product, Google Vertex AI Lyria backend on Cloud Run. Music API request-parameter surface (delegator-measured, 2026-09-07): 103 parameters, incl. `genres` (2,196 entries), `moods` (114), `eras` (14), `instruments` (1,057), `vocal.mode` (instrumental/male/female/duet/choir/spoken). Current catalogue is 84% instrumental (delegator-measured).

## 4. Complete topic and subquestions (carried at full breadth, none narrowed)

1. Global genre-popularity ranking (top 15-25), 2024-2026, with explicit non-US/UK coverage (K-Pop, Afrobeats, Latin/reggaeton, Bollywood/Indian film music, Chinese C-pop where documented).
2. Mood/use-case/activity listening-context popularity (focus, sleep, workout, commute, party, romantic, sad, background/ambient, gaming) — platform + academic evidence.
3. Era/decade/nostalgia listening popularity, incl. the exact current catalogue-vs-new-release streaming-share figure (Luminate/MRC primary).
4. Instrumental/vocal split and language — whether this product's 84%-instrumental profile matches real demand for functional/background AI-generated music (lo-fi/ambient/focus-music analogs), distinct from mainstream vocal-pop demand.
5. Cross-reference the recommended cells against this product's own API vocabulary scale (2,196 genres / 114 moods / 14 eras) at a generic taxonomy level (not the literal proprietary list, which this subagent cannot access) — flag as a downstream integration step for the delegator/Berk.

## 5. Reversal/falsification evidence

The genre/era rankings would be falsified if: (a) a newer IFPI/Luminate/Billboard edition materially reorders the top genres from the 2026-08-29 prior-local snapshot; (b) the catalogue-share figure is shown to have reversed; (c) functional/instrumental-music platforms show LOWER engagement than mainstream vocal platforms per-listener, undermining the instrumental-weighting recommendation.

## 6. Inclusion/exclusion criteria

Include: IFPI, Luminate/MRC, Billboard, Spotify/YouTube Music/Apple Music/Amazon Music/Deezer first-party publications, Chartmetric, peer-reviewed MIR/music-psychology venues (ISMIR, Music Perception, HCI venues), YouTube Culture & Trends. Exclude: paywalled full-text bypass, login-gated data, unlawful scraping. Newest-first; 2024-2026 preferred, older only if still-controlling and dated.

## 7. Verticals derived from project vision

Genre, mood/activity, era/decade, instrumental/vocal split — all four are explicit in the delegating brief's "EXACT SCOPE" section (items 1-4); none may be dropped (rule 10 no-narrowing).

## 8. Geography

GLOBAL — delegating brief explicitly: "do not default to a US/UK-only view of 'global'."

## 9. Temporal scope

2024-2026 preferred; multi-year-stable structural trends (e.g., catalogue-share direction, decade-nostalgia pattern) noted explicitly with their own dates.

## 10. Candidate universes

Academic (ISMIR proceedings, Music Perception, HCI/CHI venues, MIR labs — UPF-MTG, QMUL C4DM, Waterloo, Aalborg); industry-official (IFPI, Luminate, Spotify, Apple, YouTube, Amazon, Deezer, Chartmetric, Billboard); hidden/grey (industry blogs, platform engineering posts on lo-fi/ambient channel economics).

## 11. Planned folder/file tree (exact, count = 4)

1. `docs/research/2026-09-07-music-catalogue-browse-category-demand.md` — main report (this is the primary deliverable).
2. `docs/research/_runs/2026-09-07-music-catalogue-browse-category-demand.preflight.json` — already written.
3. `docs/research/_runs/2026-09-07-music-catalogue-browse-category-demand.scope-plan.md` — this file.
4. `docs/research/_runs/2026-09-07-music-catalogue-browse-category-demand.completion.json` — R17 completion manifest, written last.

(R14 frontier axes / competitor-file tree does NOT apply — R0.2's frontier trigger was not fired by the delegating brief; this is a MODE B research order under R0.1, not a frontier push under R0.2.)

## 12. Hard-law check

- Rule 10 (no-narrowing): all 5 subquestions and all 4 verticals carried; item counts machine-checked at completion.
- Rule 14 (design-contract): this report supplies FACTS only; UI copy/labels/design remain OWNER-DECISION, stated explicitly in the final synthesis.
- R11 (floor): ≥20 authoritative + ≥5 academic `[FULL]`, met and counted at completion, this session's own fetches for load-bearing claims.
- R1.2 (no narrowing of universe): global, non-US/UK-only, explicitly enforced in query design.
- Rule 06/12 (delegation): this subagent does not further delegate (system constraint: no spawning additional subagents); all fetches performed directly.

## 13. Completion semantics

"Complete enough" = every one of the 5 subquestions has ≥3-source-verified findings or an explicit `[UNVERIFIED]`/`NOT FOUND IN THE SEARCHED SCOPE` flag; the 30-50 ranked category cells are each traceable to a named evidence row; the floor counts are met and reported; contradictions are preserved, not averaged; known gaps are named explicitly. Given the ~1-session budget, exhaustive-universe saturation (R11.3) is not claimed — this report states its exact boundary rather than claiming false completeness.
