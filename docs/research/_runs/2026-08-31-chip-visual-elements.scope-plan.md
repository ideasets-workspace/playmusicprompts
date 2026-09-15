# Scope plan (R3) — Visual elements for chip/selector components (genre/era/mood/vocal/energy)

Date: 2026-08-31 · Project: PlayMusicPrompts (c:\Berk\PlayMusicPrompts) · Mode: B (owner research order)
Covenant: C:\Users\berke\.claude\skills\deep-research\SKILL.md · COVENANT_SHA256: F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB

## 1. Exact decision served
Which visual elements (icons, color-coding, imagery, micro-illustration) should be added to
the page-1 chip/selector rows (Genres, Eras, Moods, Vocals, Energy — currently Radix
ToggleGroup text-only chips, screenshot reviewed by Berk 2026-08-31) to reach a much more
advanced visual level, and how to source those elements without inventing values or paying
for a new vendor.

## 2. Why
Berk's order (2026-08-31, verbatim): "bunalrın heposi çok ama çok daha ileri seviyede
görselde elemenltlerle olmalı araştır" — referring to the chip decks screenshot he attached.
Design taste/values stay his (rules/14); this research supplies the KNOWLEDGE floor (what
the most advanced products and the perception literature actually do) so the implementation
choice is evidence-grounded, not agent-invented.

## 3. Project context
PlayMusicPrompts page 1 (THE STAGE direction, approved). Chip decks currently render via
`components/ui/chip-toggle-group.tsx` (Radix ToggleGroup, text-only). Counts, fixed and
small: Eras 8, Vocals 8, Energy 7 (+ curated Genres 20 of 2,196 live, Moods 9 of 114 live).
Any visual-element plan must state per-row feasibility (small closed sets vs 2,196/114 open
live sets) — inventing 2,196 custom icons is not proposed; the research must find what
advanced products actually do at THAT scale (color-family coding, not per-item bespoke art).

## 4. Complete topic and subquestions
1. How do the most advanced consumer/pro products visually enhance chip/tag/multi-select
   rows (icon-per-item, color-coded categories, gradient swatches, micro-illustration,
   waveform/shape glyphs)? Seeds: Spotify, Apple Music, Discord tags/roles, Notion select
   properties, Linear labels, Arc browser spaces, Duolingo, Headspace, Ableton/Serum/Vital
   device & oscillator icons, mood-wheel apps, generative-music tool visual language
   (MusicFX chips, Endel).
2. What does the perception/HCI literature establish about icon+text vs text-only chip
   recognition speed, categorical color-coding correctness, pre-attentive visual search,
   dual-coding (icon+label) retention, and chunking limits for a selector row?
3. For MUSIC-specific visual encoding at open-vocabulary scale (thousands of genres, 114
   moods): what real products do when the set is too large for bespoke icons per item
   (family/cluster color-coding, gradient-by-attribute, generative micro-art per CLUSTER not
   per item)?
4. Feasible, zero/low-cost asset sourcing for the SMALL closed sets (era 8, vocal 8, energy
   7): open-license icon systems (exact license, coverage) vs a small batch of AI-generated
   glyphs through the already-approved SSM Content API icon-vertex endpoint (real cost per
   icon, real turnaround) — never a new paid vendor.

## 5. Reversal / falsification evidence
Evidence that icon-augmented chips measurably HURT scan speed or add clutter (over-iconing)
would flip the recommendation toward color-coding only. Evidence that color-coding without
icons is judged less premium/advanced by the target design tier would strengthen icons.

## 6. Inclusion / exclusion
INCLUDE: first-party product design docs/blogs, published design systems, HCI/perception
primaries, icon-library license pages, the SSM Content API's own icon-vertex contract
(already read this session). EXCLUDE: paid stock-icon marketplaces, any new paid vendor.

## 7. Verticals derived from project vision
(a) Advanced-product visual-selector patterns, (b) perception/cognition grounding, (c)
music-specific visual-encoding precedent, (d) real, immediately implementable asset sourcing.
Geography: GLOBAL.

## 8-9. Geography / temporal scope
GLOBAL. Newest-first (2024-2026 product examples); foundational perception literature
(Treisman 1980, Cleveland & McGill 1984, Paivio 1971/1986, Miller 1956) retained as
still-controlling.

## 10. Candidate universes
Product/design (Spotify, Apple Music, Discord, Notion, Linear, Arc, Duolingo, Headspace,
Ableton, Xfer Serum, Vital Audio, MusicFX, Endel, Material Design, Radix/shadcn examples);
academic (visual perception, HCI iconography, color cognition, information visualization);
icon libraries (Lucide, Radix Icons, Phosphor, Heroicons, Tabler); this project's own
icon-vertex contract (ssm-content-generation-api v5 doc, already on disk).

## 11. Planned folder/file tree (exact count: 5)
1. docs/research/_runs/2026-08-31-chip-visual-elements.scope-plan.md (this file)
2. docs/research/2026-08-31-advanced-chip-selector-visual-patterns.md (slice A, worker)
3. docs/research/2026-08-31-icon-color-perception-hci.md (slice B, worker)
4. docs/research/2026-08-31-icon-asset-sourcing-feasibility.md (slice C, worker)
5. docs/research/2026-08-31-chip-visual-elements-synthesis.md (synthesis, main report, by parent)

## 12. Hard-law check
R1.2 no-narrowing: all 5 chip rows covered, not a subset. rules/14: every palette/icon-style
CHOICE stays OWNER-DECISION in the synthesis; this research supplies KNOWLEDGE only. Floors:
≥20 independent sources and ≥5 academic [FULL] aggregate across the 3 slices.

## 13. Completion semantics
Complete when all 3 slices delivered with ledgers, floors met, and the synthesis maps each
chip row (genre/era/mood/vocal/energy) to a concrete, sourced, feasible visual-element
recommendation with owner-decision points named.
