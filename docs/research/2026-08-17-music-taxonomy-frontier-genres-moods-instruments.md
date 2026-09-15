# Standards ledger

Governance files read from disk, in full, THIS session, before any external action:

| # | Governing file | Role in this run |
|---|---|---|
| 1 | `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (117,893 chars, read in 3 passes: L1–400, L400–858, L858–1310) | The merged deep-research law + covenant. PART I activation law, PART II R0–R18, provenance annexes P1–P5. This run is **MODE B** (owner commanded the research), so no local-intake precondition gated the first external call. |
| 2 | `C:\Berk\SsmContentAssetCreator\.cursor\rules\research-standard.mdc` | Project research standard: four source tiers, ≥20/≥5 floors, `[FULL]`/`[ABS]` marks, cross-verification ledger, documentation + indexing duty, source archive. |
| 3 | `C:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` | Research standard + the delegation mandate at full breadth. |
| 4 | `C:\Berk\SsmContentAssetCreator\.cursor\rules\19-supreme-law.mdc` | The six absolute prohibitions and the ten-link chain. LINK 3 (measure then speak) and LINK 10 (build the advanced version, name the frontier) govern every recommendation below. |
| 5 | `C:\Berk\SsmContentAssetCreator\AGENTS.md` | Project contract, RESEARCH FLOOR section, artefact-language law (English), file-verification law. |

Local project evidence read from disk this session (measured, not relayed):

| Path | Measured |
|---|---|
| `generate_music_hybrid_model/music_studio/data/genre_vocabulary.json` | 6 source groups, **21** entries (4+7+4+2+2+2) |
| `generate_music_hybrid_model/music_studio/data/mood_vocabulary.json` | 4 source groups, **17** entries (8+4+2+3) |
| `generate_music_hybrid_model/music_studio/data/instrument_vocabulary.json` | 4 source groups, **17** entries (6+5+3+3) |
| `docs/research/_sources/2026-08-13-vertex-lyria-prompt-guide.txt` | 1,174 lines. L1003/L1004/L1005 verified character-for-character against the citations in the three vocabulary files — **the existing provenance is honest** |
| `docs/research/_sources/2026-08-13-elevenlabs-music-what-can-i-generate.md` | 18 lines, first-party ElevenLabs capability statement |

Artefact language: ENGLISH (AGENTS.md "Critical rules"). Execution limit honoured: **no file under `generate_music_hybrid_model/` was edited** — this run researches and documents only.

---

# Scope plan / decision served / why / project context

## The exact decision served

**What are the world's most advanced, defensible taxonomies for (a) musical GENRE/style, (b) musical MOOD/emotion and (c) musical INSTRUMENT, such that the three closed vocabularies of the music studio can be expanded to the frontier with EVERY entry carrying a primary source?**

The output becomes data files the engine validates against (`param_spec.json` → `*.values_import`) and the UI renders from, on four surfaces (web · Android/iOS · Windows · macOS). A wrong or unsourced taxonomy would ship into a product surface, so provenance is a delivery criterion, not a nicety.

## Why now

Owner order, 2026-08-17, verbatim: *"evet dünyadaki en ileri sveiyeye çıkart unutma dünyada bir numara olacağız"* — raise it to the world's most advanced level, we will be number one in the world. Standing order, 2026-08-14, verbatim: *"tüm herşeyde maximum predefined değerlerimiz olmalı kullanıcının arayüzde combolarla seçimlerle seçebileceği"* — every control must offer the MAXIMUM set of predefined values selectable from combos in the interface.

## Project context

`C:\Berk\SsmContentAssetCreator` is an AWS Lambda asset-generation suite (account 723322847393, `eu-central-1`). Its newest line is a MUSIC STUDIO: `POST /generate-music-hybrid-model` → `ssm-content-worker-generate-music-hybrid-model`, which validates a 34-parameter request against `music_studio/param_spec.json`, compiles a Lyria prompt from versioned lexicons, and delegates to `ssm-content-worker-music-lyria` (Vertex AI Lyria). It is live and generation-proven.

## Hard constraints checked by name

- **D-SSM-24** (*"herşey kesinlikle vertex ve google ın kendi servisleir ile olmalı"*): engine may use ONLY Google Cloud / Vertex AI + our own code. **Satisfied** — this document recommends TAXONOMIES (category lists + their evidence). It proposes **no** third-party API, no paid classification service, no dataset download. Every recommended list is either first-party Google, an open standard, or a CC-licensed published taxonomy that is lawful to cite and to model a list on.
- **D-SSM-23 / MANDATE Clause 4** (predefined-value provenance): every recommended value is delivered inside a **source group** so the existing `groups[].source` structure can carry it.
- **Clause 23** (generic by construction): no production identity enters engine code; these are per-vocabulary DATA.

## Subquestions

1. Genre/style: what are the frontier taxonomies, their real sizes/structures, licences, and the published criticism of genre as a category?
2. Mood/emotion: dimensional vs categorical, with the real agreement numbers.
3. Instrument: organology (Hornbostel–Sachs/MIMO), General MIDI, AudioSet, OpenMIC/MedleyDB, and world/folk (incl. Turkish) coverage.
4. How many is "maximum" — what does the choice-overload literature actually measure, and what STRUCTURE does the evidence support?

## What would falsify the recommendation

- If a large flat option list were shown to be harmless regardless of grouping → the grouping requirement would drop.
- If Lyria were shown to respond to a controlled vocabulary rather than free text → the taxonomy would become an enum contract instead of a prompt-assembly palette.
- If a source's taxonomy licence forbade modelling a list on it → that tier would be removed.

---

# Outcome first

**Bad news first, three items:**

1. **I did not reach the ≥5-academic-`[FULL]` floor on the first attempt and had to spend extra turns to reach it honestly.** The web-search tool writes full page text to disk, which *looks* like a full read but is not one. I initially held only search-extracted snippets. I then actually opened and read five academic primaries end-to-end. **Reported below as 5 academic `[FULL]`, not more** — several other academic sources are marked `[PARTIAL]`/`[ABS]` and carry no load-bearing claim alone.
2. **Google's own two first-party surfaces CONTRADICT each other on vocal languages, and Turkish is on the wrong side of it.** The Vertex AI/Google Cloud blog (2026-04-07) states Lyria 3 supports multi-vocal generation in **eight** languages — English, German, Spanish, French, Hindi, Japanese, Korean, Portuguese — **Turkish is not among them**. The Gemini API docs for the same model family state instead that "Lyria 3 generates lyrics in the language of your prompt" with no closed list. I preserved the disagreement rather than averaging it. This bears directly on the two Turkish genre entries and three Turkish instrument entries already in our vocabularies, whose notes already say quality is UNPROVEN.
3. **Our archived Lyria guide is stale relative to the live product.** We cite a 2026-08-13 capture; Google has since shipped **Lyria 3 / Lyria 3 Pro** (`lyria-3-pro-preview`, `lyria-3-clip-preview`) with a new prompting guide dated **2026-04-07** that adds an axis we do not model at all: **ERA / stylistic timeframe**.

**The committed recommendation:** do **not** simply make the three lists longer. Adopt a **two-level, source-grouped, coordinate-annotated structure** and grow the lists inside it:

| Vocabulary | Now | Recommend | Structure |
|---|---|---|---|
| Genre/style | 21 | **~120** (14 families × ~8) | 2 levels: family → genre. Discogs 15-genre spine, AllMusic/Lastfm/Tagtraum + MTG-Jamendo for the leaf layer |
| Mood/emotion | 17 | **~64** (9 GEMS factors + 4 circumplex quadrants as grouping) | Categorical labels, each carrying a **(valence, arousal)** coordinate |
| Instrument | 17 | **~160** (16 GM families as the spine) | 2 levels: family → instrument, GM-1 128 as the machine-readable backbone + world/folk extension |
| **New 4th axis** | — | **~12** | **ERA / decade** — split OUT of genre, on Google's own first-party instruction |

**Why this beats "a bigger flat list", in one number each:** a 745-subgenre flat taxonomy scores per-label F **0.032–0.115** (AcousticBrainz baseline, `[FULL]`); with only **5** mood categories humans agree just **67.8%** of the time (MIREX 2007, `[FULL]`); and choice overload is **not** driven by the count (`b=.002, z=1.48, p=.140`; quadratic `R²=0.02`, Scheibehenne 2010 `[FULL]`) but is removed by **pre-arranging options into categories** (Mogilner et al. 2008, as reported in that meta-analysis). Size is safe; **structure** is what carries it.

---

# Inclusion, exclusion, geography, dates, languages, constraints

- **Geography: GLOBAL.** The project vision is global (`AGENTS.md`: *"dünyada bugüne kadar yapılamamış en ileri seviyede"*), so no geographic narrowing was applied. Turkish material is included as an in-scope world tradition, not as a narrowing.
- **Dates:** recency-first. Newest first-party source is **2026-04-07** (Google Cloud Lyria 3 guide). Foundational sources (Hornbostel–Sachs 1914, Russell 1980, Aucouturier & Pachet 2003, Hu & Downie 2007) are used **only** where they remain the controlling reference, and their dates are stated inline.
- **Languages:** English sources; Turkish owner quotations preserved verbatim as evidence.
- **Excluded by law, not by convenience:** any paid classification API (D-SSM-24); any large dataset download (execution limit); any audio corpus retrieval.
- **Excluded by appraisal:** `gemilab.net` (third-party, claimed Lyria 3 Pro outputs "48kHz stereo" — **contradicted** by Google's own docs which say **44.1 kHz**; treated as unreliable and not cited for any load-bearing claim); `freqblog.com` (SEO-shaped, used only as a corroborating pointer and flagged).

---

# Methodology and exact query/action log

First external action was a broad scoping search (R4.1), not a guessed URL. **Zero URLs were guessed.** Every fetch target was discovered by search first, except two derived fetches whose paths were NAMED in a discovered document (the AudioSet ontology instrument page, named on the AudioSet ontology site; and the Google Cloud Lyria 3 blog, returned as search result #2). One fetch returned an empty render (`github.com/MTG/mtg-jamendo-dataset/blob/master/README.md` → 0 lines); per R4.3 I did **not** try slug variants, I re-searched and obtained the same tag counts from four independent renderings of the repo/dataset site.

| # | Query / action | System | Yield |
|---|---|---|---|
| Q1 | `MTG-Jamendo dataset genre mood theme instrument tag taxonomy number of tags paper` | web search | UPF repository record, GitHub repo, dataset site, Zenodo |
| Q2 | `AcousticBrainz Genre Dataset four genre taxonomies Discogs AllMusic Lastfm Tagtraum Bogdanov` | web search | ISMIR 2019 PDF (captured), MediaEval 2017 CEUR paper, repo, Zenodo |
| Q3 | `Geneva Emotional Music Scale GEMS nine factors Zentner Grandjean Scherer 2008 music emotion` | web search | DOI record, GEMS project page, GEMIAC preprint (captured) |
| Q4 | `General MIDI 1 sound set 128 program numbers 16 instrument families MIDI Association specification` | web search | midi.org GM-1 page, CMU patch map, Somascape family table |
| Q5 | `MIREX Audio Mood Classification five mood clusters Hu Downie 2007 exploring mood metadata` | web search | MIREX wiki 2007 + 2010, ISMIR 2007 PDF (captured), ISMIR 2008 lessons PDF (captured) |
| Q6 | `AudioSet ontology musical instrument branch 632 audio event classes hierarchy Gemmeke 2017` | web search | ICASSP DOI record, Google Research pub page, ontology instrument page |
| Q7 | `Hornbostel Sachs classification of musical instruments MIMO revision 2011 taxonomy four five classes` | web search | MIMO revision PDF (captured), City Univ. KO paper, Fondazione Levi abstracts |
| Q8 | `choice overload meta-analysis Scheibehenne 2010 Chernev 2015 assortment size number of options` | web search | both meta-analyses (both captured) |
| Q9 | `Vertex AI Lyria music generation prompt guide genre mood instrument Google Cloud documentation` | web search | **Lyria 3 docs + the 2026-04-07 Google Cloud blog** — the recency find |
| Q10 | `OpenMIC-2018 dataset 20 instrument classes MedleyDB instrument taxonomy labels` | web search | ISMIR 2018 PDF (captured), MIREX 2026 instrument task wiki, MedleyDB record |
| Q11 | `MusicBrainz genre list number of genres official documentation genres endpoint` | web search | MusicBrainz API doc (`/genre/all`), Funkwhale spec, OpenAPI mirror |
| Q12 | `Spotify Web API audio features deprecation November 2024 …` | web search | Spotify developer blog 2024-11-27, TechCrunch |
| Q13 | `"mtg-jamendo-dataset" data tags genre list file moodtheme instrument txt raw` | web search | `data/tags/*.txt` paths + four independent tag-count renderings |
| Q14 | `music genre taxonomy problem Aucouturier Pachet 2003 …` | web search | JNMR paper (captured), Sturm MGR critique (captured) |
| Q15 | `Turkish makam instruments bağlama ney kanun kemençe zurna davul … CompMusic Bozkurt` | web search | CompMusic UPF instrument page, Bozkurt et al. 2014 JNMR (captured), UIUC CSAMES sheet |
| Q16 | `Discogs genre list 15 genres official database guidelines style` | web search | Discogs Database Guidelines 9 — the 15 genres enumerated |
| Q17 | `MPEG-7 audio ISO/IEC 15938-4 descriptors timbre melody standard` | web search | ISO catalogue entry, MPEG Audio page, IEEE overview (captured), IRCAM/Peeters ICMC |
| A1 | Fetch Google Cloud Lyria 3 prompting guide | WebFetch | **2026-04-07**, 8 vocal languages, era axis, timestamp prompting |
| A2 | Fetch AudioSet ontology → Musical instrument | WebFetch | **20** immediate children, 117,343 annotations — counted from the fetched page |
| A3 | `Get-Content` L1000–L1006 of archived Lyria guide | local FS | provenance of our own 3 vocabularies VERIFIED |
| A4 | `Select-String` on Gemini API Lyria 3 capture | local FS | "lyrics in the language of your prompt", 44.1 kHz — the contradiction |
| A5 | `Get-ChildItem` on `_sources/` | local FS | 84 archived files; located Lyria/ElevenLabs/Suno/Udio/Stability captures |
| A6 | `Select-String` genre/mood/instrument in 5 archived competitor docs | local FS | Suno changelog 21 match-lines; Udio pricing **0**; Stability 1; ElevenLabs 3+3 |

---

# Source register and read-status counts

## REPORTED COUNTS (the floors are the owner's, not mine to judge)

| Metric | Count | Floor | Status |
|---|---|---|---|
| Independent authoritative sources (provenance families) | **34** | ≥20 | **MET** |
| Academic sources | **18** | ≥5 | **MET** |
| Academic sources read `[FULL]` with R9 depth records | **5** | ≥5 | **MET (exactly at floor — reported honestly, see Honest limits)** |
| Primary sources read `[FULL]` (academic + official) | **11** | — | — |
| Load-bearing claims verified across ≥3 independent sources | **9** | — | — |
| Load-bearing claims `[single-source]` | **4** | — | flagged inline |
| Load-bearing claims `[UNVERIFIED]` | **1** | — | flagged inline |

Deduplication note (R11.2): the four renderings of the MTG-Jamendo README (GitHub, dataset site, a mirror, a fork) are **ONE** provenance family and are counted once. The ISMIR 2019 AcousticBrainz paper and the MediaEval 2017 task paper are counted as **two** because they report different recording counts from different snapshots — they are separately citable and they disagree.

## ACADEMIC TIER (18 works; universities/professors/labs)

| ID | Work | Institution | Date | Read | Archive |
|---|---|---|---|---|---|
| A-01 | Hu & Downie, "Exploring Mood Metadata: Relationships with Genre, Artist and Usage Metadata", ISMIR 2007 | UIUC / IMIRSEL | 2007 | `[FULL]` | `_sources/2026-08-17-hu-downie-2007-exploring-mood-metadata-ismir.txt` |
| A-02 | Hu, Downie, Laurier, Bay, Ehmann, "The 2007 MIREX Audio Mood Classification Task: Lessons Learned", ISMIR 2008 | UIUC + UPF-MTG | 2008 | `[FULL]` | `…-mirex-2007-audio-mood-classification-lessons-learned-ismir2008.txt` |
| A-03 | Humphrey, Durand & McFee, "OpenMIC-2018", ISMIR 2018 | Spotify + **NYU (MARL)** | 2018 | `[FULL]` | `…-openmic-2018-instrument-taxonomy-ismir2018.txt` |
| A-04 | Bogdanov, Porter, Schreiber, Urbano, Oramas, "The AcousticBrainz Genre Dataset", ISMIR 2019 | **UPF-MTG** + TU Delft + tagtraum + **Pandora** | 2019 | `[FULL]` | `…-acousticbrainz-genre-dataset-ismir2019.txt` |
| A-05 | Scheibehenne, Greifeneder & Todd, "Can There Ever Be Too Many Options?", J. Consumer Research 37(3) | Basel / Mannheim / **Indiana** | 2010 | `[FULL]` | `…-scheibehenne-2010-choice-overload-meta-analysis-jcr.txt` |
| A-06 | Russell, "A Circumplex Model of Affect", JPSP 39(6) 1161–1178 | Univ. British Columbia | 1980 | `[PARTIAL]` (abstract, intro, Study 1 complete, Study 2 opening; 150/328 lines) | `…-russell-1980-circumplex-model-of-affect-jpsp.txt` |
| A-07 | Chernev, Böckenholt & Goodman, "Choice overload: A conceptual review and meta-analysis", J. Consumer Psychology 25(2) | **Kellogg, Northwestern** | 2015 | `[PARTIAL]` (abstract, contents, conceptual framework; 100/441 lines) | `…-chernev-2015-choice-overload-meta-analysis-jcp.txt` |
| A-08 | Zentner, Grandjean & Scherer, "Emotions evoked by the sound of music", Emotion 8(4) 494–521 | **Univ. Geneva** | 2008 | `[ABS]` | — (DOI record) |
| A-09 | Coutinho & Scherer, "GEMIAC" preprint | **Univ. Liverpool + Geneva** | n.d. | `[PARTIAL]` | `…-gemiac-geneva-music-induced-affect-checklist-preprint.txt` |
| A-10 | Warriner, Kuperman & Brysbaert, "Norms of valence, arousal, and dominance for 13,915 English lemmas", Behav. Res. Methods 45(4) | McMaster / **Ghent** | 2013 | `[PARTIAL]` | `…-warriner-2013-vad-norms-13915-lemmas.txt` |
| A-11 | Gemmeke, Ellis, Freedman, Jansen, Lawrence, Moore, Plakal, Ritter, "Audio Set", ICASSP 2017 | **Google** | 2017 | `[PARTIAL]` | `…-audioset-ontology-gemmeke-2017-icassp-record.txt` |
| A-12 | Aucouturier & Pachet, "Representing Musical Genre: A State of the Art", J. New Music Research 32(1) 83 | Sony CSL Paris | 2003 | `[PARTIAL]` | `…-aucouturier-pachet-2003-representing-musical-genre-jnmr.txt` |
| A-13 | Sturm, MGR state-of-the-art / evaluation critique | (repository copy) | 2013–14 | `[PARTIAL]` | `…-sturm-music-genre-recognition-state-of-the-art-critique.txt` |
| A-14 | Bozkurt et al., Turkish makam music computational study, JNMR | **KTH** / Bahçeşehir + CompMusic | 2014 | `[PARTIAL]` | `…-bozkurt-2014-turkish-makam-music-jnmr.txt` |
| A-15 | Bittner, Salamon, Tierney, Mauch, Cannam, Bello, "MedleyDB", ISMIR 2014 | **NYU MARL** | 2014 | `[ABS]` | — (Zenodo record) |
| A-16 | Hornbostel–Sachs knowledge-organization analysis | **City, Univ. of London** | 2019 | `[ABS]` | — (open-access record) |
| A-17 | Peeters, "Instrument Sound Description in the Context of MPEG-7", ICMC 2000 | **IRCAM** + IUA/UPF | 2000 | `[ABS]` | — |
| A-18 | "Overview of MPEG-7 Audio", IEEE Trans. Circuits & Systems for Video Technology | — | 2001 | `[PARTIAL]` | `…-mpeg7-audio-overview-ieee-tcsvt.txt` |

## FRONTIER-COMPANY / FIRST-PARTY / STANDARDS TIER (16 works)

| ID | Work | Producer | Date | Read |
|---|---|---|---|---|
| C-01 | Lyria music generation prompt guide (archived capture, 1,174 lines) | **Google Cloud** | captured 2026-08-13 | `[FULL]` (local) |
| C-02 | **"Ultimate prompting guide for Lyria 3 models"** | **Google Cloud Blog** (K. Nguyen, H. Chinoy) | **2026-04-07** | `[FULL]` |
| C-03 | "Generate music with Lyria 3" (Gemini API, legacy generateContent) | **Google AI for Developers** | live | `[PARTIAL]` |
| C-04 | AudioSet ontology → *Musical instrument* branch | **Google Research** | live | `[FULL]` |
| C-05 | General MIDI Level 1 specification page (RP-003) | **MIDI Association** | live | `[PARTIAL]` (spec PDF is member-gated) |
| C-06 | Revision of the Hornbostel–Sachs Classification | **MIMO Consortium / CIMCIM (ICOM)**, EU-funded | 2011 | `[PARTIAL]` |
| C-07 | MusicBrainz API — `/genre/all` | **MetaBrainz** | live | `[PARTIAL]` |
| C-08 | Database Guidelines 9: Genres / Styles | **Discogs** | live | `[FULL]` |
| C-09 | "Introducing some changes to our Web API" | **Spotify for Developers** | 2024-11-27 | `[FULL]` |
| C-10 | mtg-jamendo-dataset (repo + dataset site + Zenodo) | **UPF-MTG** | live | `[PARTIAL]` |
| C-11 | acousticbrainz-genre-dataset site + repo | **UPF-MTG** | live | `[PARTIAL]` |
| C-12 | Turkish instruments field notes | **CompMusic / UPF** (X. Serra) | live | `[FULL]` |
| C-13 | Eleven Music — "What can I generate" (archived) | **ElevenLabs** | captured 2026-08-13 | `[FULL]` (local) |
| C-14 | ISO/IEC 15938-4:2002 (MPEG-7 Part 4: Audio) | **ISO/IEC** | 2002 | `[ABS]` (paywalled — declared, not worked around) |
| C-15 | MIREX wiki: 2007 + 2010 Audio Mood Classification; 2026 Audio Instrument Recognition | **IMIRSEL, UIUC** | live | `[PARTIAL]` |
| C-16 | MPEG-7 Audio standard description page | **MPEG (chiariglione.org)** | live | `[PARTIAL]` |

**THE DARK (tier 3) — what was found where people do not look:** the MIREX **2026** Audio Instrument Recognition task wiki (a live, current task page that pins the evaluation vocabulary to OpenMIC's 20 labels and documents the label-mapping rules — `drum kit`/`drums`/`drum set` → `drums`); the `data/tags/*.txt` taxonomy files *inside* the MTG-Jamendo repo (the tag lists themselves, not the paper); the AcousticBrainz authors' **manual post-processing rule** that deletes era and location names from a genre taxonomy; the AudioSet ontology's **56 blacklisted** and **22 abstract** nodes; Google's **two mutually inconsistent** first-party language statements; and Udio's pricing page containing **zero** occurrences of genre/mood/instrument.

---

# AXIS 1 — GENRE / STYLE

## 1.1 The candidate taxonomies, with their real sizes and structures

| Taxonomy | Genres | Subgenres | Structure | Annotation basis | Licence / citability |
|---|---|---|---|---|---|
| **Vertex AI Lyria prompt guide** (C-01, L1003) | 5 named + 3 style modifiers | — | flat examples, **not a closed enum** | first-party model guidance | Google docs — decisive for what the model responds to |
| **Google Cloud Lyria 3 guide** (C-02, 2026-04-07) | genre **+ era** named as separate things | — | prose framework | first-party | decisive; newest |
| **Discogs** (C-08) | **15** | ~300 (AcousticBrainz count) | 2-level, genre → style | editorial, expert/enthusiast | guidelines page public; *the 15 names are facts about a public taxonomy* |
| **AllMusic** (A-04 Table 2) | **21** | **745** | up to 3 levels, flattened to 2 | editorial, expert | AcousticBrainz's AllMusic-derived data is **research-only**, non-commercial — see limits |
| **Lastfm** (A-04 Table 2) | **30** | **297** | 2-level, auto-inferred from folksonomy | crowd tags | CC BY-NC-SA 4.0 (the genre metadata) |
| **Tagtraum** (A-04 Table 2) | **31** | **265** | 2-level, auto-inferred | crowd tags (beaTunes) | CC BY-NC-SA 4.0 |
| **MTG-Jamendo** (C-10) | **95** genre tags in the genre subset; **87** in the splits | — | flat | uploader tags, filtered ≥50 unique artists | open dataset, CC-licensed audio |
| **FMA** (A-03 §1.3; A-04 Table 1) | **16** coarse | **161** fine | 2-level | curated | open |
| **MusicBrainz** (C-07) | curated list, size varies over time (`genre-count` field) | — | flat, with `disambiguation` | community-curated | public API, CC0-ish metadata |
| **GTZAN** (A-04 Table 1) | 10 | — | flat | — | the field's legacy baseline |
| **ISMIR04** (A-04 Table 1) | 6 | — | flat | — | legacy |
| **APM production library** (A-02 §2.1.1) | **27** genres | — | flat | commercial library metadata | contract, academic use only |

## 1.2 Five-part depth record — A-04, AcousticBrainz Genre Dataset `[FULL]`

1. **Problem in the authors' own framing.** "The evaluation of MGR systems is difficult due to subjectivity in genre annotations, with little inter-annotator agreement." Previous work used "a small number of broad genre categories": per Sturm's 2012 survey the most popular public datasets were GTZAN (10 genres) and ISMIR04 (6), and **only 3.7% of surveyed systems used 25 or more labels**. Single-label ground truth "is not adequate" when responses are diverse.
2. **Method.** Four parallel taxonomies mapped onto AcousticBrainz recordings via MusicBrainz IDs. AllMusic scraped (no public API); Discogs via public API; Lastfm via API; Tagtraum from beaTunes. Folksonomy hierarchies were **automatically inferred by exploiting asymmetric co-occurrence** ("Alternative Rock almost always co-occurs with Rock, Rock does not necessarily co-occur with Alternative Rock"), then **manually post-processed to consolidate spelling variants and to REMOVE location and era names (e.g. "50s", "Canadian") and non-genre labels (e.g. "awesomelyrics")**. Complexity compared by conditional pseudo-entropy H̃(X|Y). Splits 70/15/15, no recording in two sets, no shared release groups (avoiding the "album effect"), each label ≥40 recordings from ≥6 release groups in training. Baseline: 2,669 input features → 256-unit hidden layer (ReLU, dropout 0.5) → sigmoid multi-label output, binary cross-entropy, Adam, ≤100 epochs; then a fusion network stacking four ℓ2-normalised 256-d embeddings into 1,024-d.
3. **Real numbers.** Table 2: AllMusic 1,935,991 recordings / 233,789 release groups / 21 genres / 745 subgenres / 1.33 genres·track⁻¹ / 3.14 subgenres·track⁻¹; Discogs 1,290,489 / 169,109 / 15 / 300 / 1.37 / 1.70; Lastfm 806,627 / 164,290 / 30 / 297 / 1.14 / 1.28; Tagtraum 692,217 / 98,333 / 31 / 265 / 1.13 / 1.72. Total >2,086,000 recordings. Conditional pseudo-entropy diagonal (genre+subgenre): AllMusic **59.6** (most complex), Discogs 21.2, Lastfm 11.2, Tagtraum 10.6. Table 4 ROC AUC single-source: AllMusic **0.648**, Discogs 0.759, Lastfm 0.828, Tagtraum 0.802; multi-source 0.812 / 0.886 / 0.906 / 0.887. **Table 5 per-label F (all labels), single-source: AllMusic 0.032, Discogs 0.095, Lastfm 0.095, Tagtraum 0.115**; multi-source 0.074 / 0.122 / 0.133 / 0.140. Full intersection of all four training sets: 247,716 recordings; AllMusic∩Discogs 831,744. MediaEval 2017–18: >100 submissions from 7 teams.
4. **Stated limitations.** "We did not aim to create a representative or unbiased dataset"; biases "likely exist due to the coverage of MusicBrainz, AcousticBrainz, and the sources"; clear bias toward pop/rock/electronic; artist effect **not** filtered (only album effect); hierarchies in Lastfm and Tagtraum are **not explicit**, so hierarchical metrics could not be used; the same label "may have different meanings in different sources"; individual (single-source) models are "hardly usable".
5. **Concrete application HERE.** (a) The **per-label F of 0.032 on the 745-subgenre AllMusic taxonomy** is the decisive number against copying a deep editorial taxonomy into our combo: even a well-built model cannot separate those classes, so a human cannot be expected to choose meaningfully among them either. (b) The **entropy ordering** tells us which spine to take: Discogs (15/300, diagonal 21.2) is complex enough to be expressive and shallow enough to be usable — adopt it as the FAMILY layer. (c) The authors' own **removal of era names from genre** is first-class evidence, from the opposite direction to Google's advice, that **era must be its own axis** — which is exactly what this document recommends. (d) Because the same label means different things in different sources, our `groups[].source` field is not bureaucracy: it is the disambiguator, and it must be shown in the UI tooltip.

## 1.3 Five-part depth record — A-12 Aucouturier & Pachet 2003 + A-13 Sturm `[PARTIAL]`

1. **Problem.** "Genre is intrinsically ill-defined and attempts at defining genre precisely have a strong tendency to end up in circular, ungrounded projections of fantasies." Is genre intrinsic to the signal (like tempo) or extrinsic to the piece?
2. **Method.** A three-way classification of *approaches*: **manual**, **prescriptive** (feature extraction + supervised learning against a pre-existing taxonomy), and **emergent** (co-occurrence / data mining). Argues for artist-level rather than title-level classification as the precision/scalability trade-off.
3. **Real numbers / findings.** Signal-based success "is limited to small taxonomies (distinction between 1–5 families), and very distinct genres (classical music and techno)"; "for a given genre taxonomy, correlation between genre classes and timbre similarity can be very poor." Sturm adds that **91%** of MGR evaluation is effectively "reproducing by any means possible the ground-truth genre labels of a dataset", and that a formal definition of genre is "rare to find in any" of the surveyed work. Genre branching is intrinsically asymmetric — electronic dance music has many narrow subgenres, pop-rock has few broad ones — and "one must accept these inconsistencies rather than imposing unrealistically broad or narrow categories … to avoid dissymmetry in the genre structure."
4. **Stated limitations.** Prescriptive systems "tend to be based on contrived taxonomies"; cluster labelling is an unsolved technical problem in the emergent approach; genre judgements depend on *extrinsic* properties the audio does not contain.
5. **Concrete application HERE.** This is the source that forbids two tempting mistakes. First: **do not balance the tree.** Our Electronic family may legitimately hold 12 leaves while Blues holds 4; forcing 8-per-family would be inventing categories, which is exactly the "contrived taxonomy" failure. Second: genre is a **prompt-assembly palette**, not a ground-truth label — so the vocabulary's job is to give the user vocabulary Lyria responds to, and the `source` string is what keeps each entry defensible. The disagreement between this source and the AcousticBrainz programme (which builds large taxonomies anyway) is **preserved, not resolved**: see the contradiction ledger, CT-2.

## 1.4 What the first-party engine documentation actually names (decisive tier)

Verified character-for-character from the archived capture this session:

- **C-01 L1002** — the framework: `[Genre & style] + [Mood] + [Instrumentation] + [Tempo & rhythm] + [Vocal style & language] + [Lyrics]`
- **C-01 L1003** — genre & style examples: `"cinematic orchestral fantasy"`, `"electronic dance"`, `"classical"`, `"jazz"`, `"ambient"`; stylistic characteristics `"8-bit"`, `"cinematic"`, `"lo-fi"`
- **C-02 (2026-04-07)** — "**Reference genres and eras**: Clearly state the musical category (for example, Rock or Pop) **and stylistic timeframe (e.g. the 1950s, early 90s)**"; worked example blends "classic Bossa Nova and modern R&B"; "**Specify key instruments**: Mention the important instruments driving the track, **or Lyria chooses defaults based on the genre**"
- **C-03** — "Lead your prompt with the genre of music you want, such as hip hop, rock, and rap. You can specify a mix of genres"; "a dance track isn't going to include a saxophone unless you ask for it"

**Interpretation, stated as inference not fact:** Lyria takes **free text**, not an enum. Therefore our vocabulary is a *curated palette that composes into prose*, and its value is (i) discoverability for the user and (ii) determinism for us. This means a larger vocabulary carries **no model-side risk** — only a UI-side risk, which is what Axis 4 addresses.

## 1.5 Recommendation — GENRE

**ADOPT: Discogs' 15 genres as the FAMILY spine, extended to ~14–16 families, with ~120 leaf genres drawn from the four AcousticBrainz sources + MTG-Jamendo + Lyria's own named examples.**

The 15 Discogs families, enumerated from the primary source (C-08): Blues · Brass & Military · Children's · Classical · Electronic · Folk, World, & Country · Funk / Soul · Hip-Hop · Jazz · Latin · Non-Music · Pop · Reggae · Rock · Stage & Screen.

**Why it beats the alternatives, with the deciding numbers:**
- vs **AllMusic 21/745** — 745 leaves score per-label F **0.032**; unusable and (for the AcousticBrainz-derived data) research-licence-encumbered.
- vs **Lastfm 30 / Tagtraum 31** — auto-inferred, hierarchies **not explicit** (A-04 §3.3), so they cannot supply a reliable family layer; excellent as a *leaf* source.
- vs **MTG-Jamendo 95 flat** — no hierarchy at all; excellent leaf source, cannot be the spine.
- vs **GTZAN 10 / ISMIR04 6** — legacy, and Sturm's survey shows the field's over-reliance on them is the criticism, not the model.
- **For Discogs:** it is the only expert-curated, publicly-documented, explicitly 2-level taxonomy with a *stated* rationale for capping depth — "excess styles … cause the drop down list on the Submission Form to become unmanageable, and more confusing to use" (C-08 §9.1.2). **That is a UI argument made by a taxonomy owner operating at catalogue scale, and it independently corroborates our Axis-4 finding.**
- **Two Discogs families need a decision from the owner:** `Non-Music` and `Children's` are catalogue categories, not generation targets. Recommend carrying `Children's` and **dropping `Non-Music`** — flagged as the one place I narrowed a source list, and it is stated here rather than done silently.

**Genre must NOT contain era.** Split `era` out (Axis 4b below). Evidence in both directions: Google says name the era (C-02); AcousticBrainz *deletes* era from genre taxonomies (A-04 §2.1). Both are satisfied by a separate axis whose value is concatenated into the prompt.

---

# AXIS 2 — MOOD / EMOTION

## 2.1 The dimensional-versus-categorical debate, with numbers on both sides

| Model | Type | Size | Its own evidence |
|---|---|---|---|
| **Russell circumplex** (A-06, 1980) | dimensional, 2 axes | 2 axes; 28 words placed on the circle; 8 octant anchors | 2-D MDS stress **.001** for the 8 anchors; MDS stress by dimensionality .288/.073/.053/.039/.029/.022 → **elbow at 2** |
| **PAD / VAD** (A-06 refs; A-10) | dimensional, 3 axes | 3 axes | dominance recovered as a 3rd dimension (Russell & Mehrabian 1977); Warriner et al. give VAD for **13,915** lemmas on a 9-point scale |
| **GEMS** (A-08 / A-09, 2008) | categorical, music-specific | **9** factors, **45** labels; short forms GEMS-25, GEMS-9; **3** superfactors | Study 3 n=**801** (festival field study, CFA); Study 4 n=**238** replication; outperformed basic-emotion and dimensional models |
| **MIREX 5 clusters** (A-01/A-02, 2007) | categorical, MIR-operational | **5** clusters over **29** of 40 AMG terms | derived from AMG's **179** mood labels; human agreement **67.8%** |
| **AMG raw** (A-01) | categorical, editorial | **179** mood labels | distribution "very uneven": some >100 albums, some as few as **3** |
| **Warriner norms** (A-10) | dimensional lexicon | 13,915 lemmas | 9-point scale; 22.5% adjectives / 63.5% nouns / 12.6% verbs |
| **Spotify audio features** (C-09) | dimensional, product | 12 numbers incl. valence, energy, danceability | **DEPRECATED 2024-11-27** — see §2.5 |

## 2.2 Five-part depth record — A-01 Hu & Downie 2007 `[FULL]`

1. **Problem.** "Mood as a music access feature … is not well understood in that the terms used to describe it are not standardized and their application can be highly idiosyncratic … there has yet to emerge a generally accepted mood taxonomy." Each prior study used different categories, "making meaningful comparisons between them difficult."
2. **Method.** Three datasets from AMG's 179 mood labels: **Whole Set** (all 179; 7,134 album-mood pairs, 8,288 song-mood pairs), **Popular Set** (moods with >50 albums AND >50 songs → **40** labels; 2,748 album-mood pairs), **Cluster Set**. Clustering: co-occurrence matrix over the 40 popular labels → **Pearson correlation** as pairwise similarity → **agglomerative hierarchical clustering with Ward's criterion**, run **independently** on Top-Albums and Top-Songs views; the two solutions were then intersected. Significance throughout by **Fisher's Exact Test**. External corroboration against an independent Last.fm harvest.
3. **Real numbers.** **29 of the 40** labels were consistently grouped into **5 clusters at a similar distance level** in *both* views. Whole Set: 3,903 unique albums, 22 genres, 7,134 pairs, of which 4,564 involve "Rock". 262 significant genre-mood pairs with Rock, 205 without, **170 significant in both**, involving 17 genres — "each genre is associated with **10 significant moods on average** and the mood labels cut across the genre categories… strong evidence that genre and mood are **independent**." Last.fm corroboration: **21 of 28** genre-mood pairs, **12 of 14** genre-cluster pairs, **17 of 22** artist-mood pairs, **15 of 17** artist-cluster pairs. Usage-mood corroborated only **3** pairs and **2** cluster pairs — unstable. Cluster distribution: albums 355/285/486/493/372, artists 14/16/85/87/46.
4. **Stated limitations.** "Mood term vocabulary size (and its uneven distribution across items) is a **huge impediment** to the construction of useable ground-truth sets (e.g., AMG's 179 mood terms)." Usage-mood relationships "are not stable enough to warrant further consideration." Clusters are deliberately **left unlabelled** — "we are NOT going to assign a term label to any of these clusters in order to stress that the 'mood space' … is really the aggregation of the mood terms represented within each column."
5. **Concrete application HERE.** Three direct consequences. (a) **Genre and mood are statistically independent** — so the two vocabularies must remain independent controls, and the UI must never filter moods by the chosen genre. (b) The authors' key sentence — "decreasing mood vocabulary size in some ways actually **clarified** the underlying mood of the items being described" — is the strongest available argument that mood is the ONE axis where "maximum values" must be interpreted as *grouped* rather than *long*. (c) Their refusal to name a cluster is a design instruction: our mood **groups** should be named by their evidence (GEMS factor, circumplex quadrant) rather than by a single invented adjective.

## 2.3 Five-part depth record — A-02 MIREX 2007 Lessons Learned `[FULL]`

1. **Problem.** Mood classification could not be compared across studies; MIREX needed a defensible ground truth for an Audio Mood Classification task.
2. **Method.** Adopted A-01's 5 clusters. Candidate pool: the **APM** production library — **206,851** tracks, **19** sub-libraries, **27** genres, with a `category` field containing **32** mood-related descriptors. Rule-based pre-labelling (e.g. `if 'Moods-Quirky' ∈ Song.category then Cluster 4`), tracks <50 s removed, same-CD/library duplicates removed → **1,250** candidates (250 per cluster) → truncated to 30-second clips taken from the **middle** of each track. Human assessment via **Evalutron 6000**, with three explicit controls: **ignore lyrics**, **mandatory mini-training on unanimously-judged exemplars before registration**, and an **"Other"** escape category. Evaluation: 3-fold cross-validation, single-label, accuracy; Friedman's ANOVA then Tukey–Kramer HSD.
3. **Real numbers — the inter-annotator agreement the brief asked for.** Of clips with 3 or 2 judgments: **586 / 864 = 67.8% agreed**, 278 (32.2%) no agreement. Per cluster: **C1 102/177 = 57.6%**, C2 105/164 = 64.0%, **C3 147/184 = 79.9%**, C4 95/157 = 60.5%, **C5 137/182 = 75.3%**. Reclassification (Table 3): only **59.8%** of Cluster-1 pre-labels survived, with **17.6%** reassigned to "Other"; all other clusters retained ≥84.2% (C2 89.5%, C3 92.5%, C4 84.2%, C5 89.8%). Final ground truth 600 clips = 153 (3-judge agreement) + 134 (2-of-3) + 313 (2-judge). Nine systems: accuracy **25.67%–61.50%**, mean **52.65%**, median **55.83%**, sd **11.19%**. By judgment set: Set 1 mean **0.59**, Set 2 **0.38**, Set 3 **0.54** — Friedman χ²(2,16)=16.22, p<0.01; the ambiguous set is significantly harder. Cluster-level significance: (C3,C1) and (C5,C1) differ.
4. **Stated limitations.** Not enough agreed clips existed for Clusters 1, 2 and 4, so the lab **ran in-house assessment to fill the gap** — a stated compromise in the ground truth. Training set "too small (for each fold, only 80 training clips per cluster)", so high-level features showed no advantage over spectral ones. Recommend excluding disagreed pieces in future.
5. **Concrete application HERE.** This is the number that sets the ceiling on mood granularity: **with only five categories, trained listeners given exemplar training and explicit instructions still disagreed on a third of the material.** Any proposal to ship 200 flat mood adjectives is therefore not "advanced" — it is below the evidence. It also gives a concrete UI rule: because Cluster 1 (passionate/rousing/confident/boisterous/rowdy) was the confusable one and 17.6% of it escaped to "Other", **our mood control must keep a free-text escape** alongside the closed list, and the closed list must be **grouped so neighbours are visible** (a user who cannot decide between "passionate" and "rousing" should see them adjacent, not 90 rows apart).

## 2.4 Five-part depth record — A-06 Russell 1980 `[PARTIAL]`

1. **Problem.** Factor-analytic tradition concluded there are "between six and twelve independent monopolar factors of affect" and treated each as separate. Russell's thesis: they are not independent — "affective states are, in fact, best represented as a circle in a two-dimensional bipolar space."
2. **Method.** 28 emotion-denoting adjectives scaled **four** ways: Ross's (1938) circular-ordering technique; non-metric MDS (Guttman–Lingoes SSA-1) on perceived similarity; unidimensional scaling on hypothesised pleasure–displeasure and arousal axes; and PCA of self-reports. Study 1: 36 UBC undergraduates sorted 28 words into 8 categories, then arranged the 8 categories in a circle. Study 2 used 34 subjects **who had never taken a psychology course**, sorting into 4/7/10/13 groups.
3. **Real numbers.** 8 anchors at pleasure 0°, excitement 45°, arousal 90°, distress 135°, displeasure/misery 180°, depression 225°, sleepiness 270°, relaxation/contentment 315°. 10 of 36 subjects reproduced the predicted ordering exactly; per-subject correlations with the theoretical matrix ranged **.19–1.00, median .80**; the averaged matrix gave a 2-D SSA-1 solution with stress **.001**. Ross precision values **P = .71–.97**. Measured angles include happy 7.8°, delighted 24.9°, excited 48.6°, astonished 69.8°, aroused 73.8°, tense 92.8°, alarmed 96.5°, miserable 188.7°, sad 207.5°, droopy 256.6°, tired 267.7°, sleepy 271.9°, calm 316.2°, serene 328.6°, pleased 353.2°. MDS stress by dimensionality: .288, .073, .053, .039, .029, .022 — "elbow" at two dimensions.
4. **Stated limitations.** Affective space "lacks **simple structure**": terms do **not** cluster near the axes but "spread out more or less continuously around the perimeter". Each emotion word is "a label for a **fuzzy set** … a class without sharp boundaries"; the most deviant case in the sort was the word *sad*. Russell notes empirical work on the fuzzy-set implication "ha[s] not been carried out."
5. **Concrete application HERE.** The fuzzy-set finding is the design key. Because mood words are overlapping regions on a continuum, **no closed list is ever "complete"** — so the right frontier move is not more words but **coordinates on the words we ship**: give every mood entry a `(valence, arousal)` pair so (i) the UI can lay the palette out as a wheel/2-D picker ordered by angle instead of alphabetically, (ii) "similar mood" and "opposite mood" become computable rather than hand-maintained, and (iii) the prompt compiler can blend two adjacent moods deterministically. The 15 angles above are real, citable coordinates for 15 entries; GEMS supplies the grouping; Warriner supplies VAD for any English label we add.

## 2.5 Spotify audio features — asked for in the brief, and the honest answer is negative

**Spotify's audio-feature dimensions are not available to us and must not enter the design.** Verified first-party (C-09, dated **2024-11-27**): Spotify removed new-application access to **Related Artists, Recommendations, Audio Features, Audio Analysis, Get Featured Playlists, Get Category's Playlists, 30-second preview URLs, and algorithmic/editorial playlists**. Only apps with pre-existing extended access are unaffected. Corroborated by TechCrunch (same date) which names "danceability", "energy" and acousticness as the lost fields. A third pointer states there is still no replacement as of 2026 and that new apps receive `403` — **`[single-source]`, SEO-shaped site, flagged, and not load-bearing**.

Two independent reasons this axis is closed for us: (1) **access** — deprecated for new apps; (2) **law** — D-SSM-24 restricts the engine to Google/Vertex + our own code, so a Spotify dependency was never lawful here regardless. The *concept* (numeric affect dimensions attached to labels) is still adopted — sourced from **Russell** and **Warriner** instead, which are published, citable, and carry no vendor dependency. This is the frontier method obtained without the forbidden dependency, not a downgrade.

## 2.6 Recommendation — MOOD

**ADOPT: GEMS-9 as the grouping layer + the Russell circumplex as the coordinate system; ~64 labels total, every one carrying `(valence, arousal)`.**

- **Grouping (9 + 3):** the nine GEMS factors — **wonder, transcendence, tenderness, nostalgia, peacefulness, power, joyful activation, tension, sadness** — with their three superfactors (**sublimity** = wonder+transcendence+tenderness+nostalgia+peacefulness; **vitality** = joyful activation+power; **unease** = tension+sadness) available as a coarse filter.
- **Coordinates:** `valence` and `arousal` on every entry; the 15 labels above ship with Russell's measured angles; others take Warriner VAD or are marked `coordinate: estimated`.
- **Keep the 5 MIREX clusters as a cross-reference field**, not as the primary grouping — they are pop-corpus-specific (A-01: "root in the social-cultural context of pop music") and one of the five is measurably confusable (57.6%).
- **Keep a free-text escape** — justified by the measured 17.6% "Other" rate.

**Why GEMS beats the alternatives:** it is the only model in the table that is **music-specific** and was shown, in its own Study 4 (n=238), to account for music-elicited emotion **better than both the basic-emotion and the dimensional models** — a like-for-like comparison the other candidates do not offer. Its 9×45 shape is also the right size: 9 groups is inside the range where MIREX measured usable human agreement, and 45 labels is ~2.6× our current 17.

**Honest counter-evidence, preserved:** GEMS's own authors' circle records two limitations (A-09) — negative valence is **underrepresented** ("emotions felt while listening to music being more frequently positive"), only **five** genres were used in construction (Classical, Jazz, Rock, Pop, World), and the final scales were "fine-tuned for Classical (western art) music". Therefore **do not** take GEMS as complete: the `tension`/`sadness` groups must be filled out from Russell's negative-valence arc and from the MIREX C5 terms (aggressive, fiery, tense/anxious, intense, volatile, visceral), which is exactly where our existing `dark` and `aggressive` entries belong.

---

# AXIS 3 — INSTRUMENT

## 3.1 The candidate taxonomies, with their real sizes and structures

| Taxonomy | Size | Structure | Basis | Licence / citability |
|---|---|---|---|---|
| **General MIDI Level 1** (C-05) | **128** programs | **16 families × 8** | industry standard (MMA RP-003) | spec PDF member-gated; the 128 names + 16 families are published in many independent reproductions |
| **Hornbostel–Sachs / MIMO 2011** (C-06) | **5** top classes, **>300** basic categories | Dewey-Decimal-style deep hierarchy | organology, museum standard | CIMCIM/ICOM resource, EU-funded, public PDF |
| **AudioSet ontology, Musical instrument branch** (C-04) | **20** immediate children (counted this session), 117,343 annotations | lattice (a node may have 2 parents), not a tree | Google, WordNet-derived | ontology released as JSON |
| **OpenMIC-2018** (A-03) | **20** classes | flat | crowd-annotated, 20,000 clips | **CC BY 4.0** |
| **MedleyDB** (A-03 Table 1; A-15) | **80** instruments over **122** songs | flat labels from a predefined taxonomy | expert stem annotation | research dataset |
| **NSynth** (A-03 Table 1) | **1,006** | note-level | synthesised/isolated notes | open |
| **RWC** (A-03 Table 1) | **50** | scale-level | commercial DB | licence-restricted |
| **MusicNet / IRMAS** (A-03 Table 1) | **11** each | flat | — | research |
| **MPEG-7 Part 4 timbre** (C-14, A-18) | **4** classes of instrument sound | descriptor scheme, not an instrument list | ISO/IEC 15938-4:2002 | **paywalled** |
| **MIREX 2026 instrument task** (C-15) | **20** (OpenMIC vocabulary) | flat + documented mapping rules | current evaluation standard | public wiki |

## 3.2 Five-part depth record — A-03 OpenMIC-2018 `[FULL]`

1. **Problem.** "We as a community lack a common data-set which is large, freely available, diverse, and representative of naturally occurring recordings." Existing sets are "small, biased, and not freely available, which ultimately impedes scientific progress." Models built on isolated-instrument data "often do not generalize to the polyphonic case."
2. **Method — and this is the part that matters for taxonomy design.** The authors did **not** invent a taxonomy. They took the **AudioSet** ontology (632 classes, itself WordNet-derived), **manually identified the classes corresponding to musical instruments → more than 70 relevant classes**, then **MERGED them into coarser "instruments"**: "'Acoustic Guitar', 'Electric Guitar', and 'Tapping (guitar technique)' become **guitar**, while 'Cello' and 'Violin' remain **distinct**." They state the resolution is "intentionally approximate". Then: filter AudioSet's 1.8 M clips to those classes, cap at 1,500 examples, add 8,000 non-musical negatives → 206 K clips / ~570 hours / **23** instruments. Train `InstrumentDNN` (200+ random architectures searched; winner 7 layers, widths [1024,512,256,1024,256,1024,23], batch-norm on first four, Adam, lr 1e-4, β₁ 0.99). Score all FMA tracks, sample by percentile, annotate on CrowdFlower with **one instrument per task** (their *second* design — the first, asking several instruments at once, "resulted in poor agreement, unhappy annotators").
3. **Real numbers.** Final: **20,000** clips × **20** instruments (10 s each). **Three classes were CUT after manual inspection** — **harp, bagpipes, harmonica** — because the model "cannot reliably detect [them], are poorly represented in FMA, or both", taking K from 23 → 20. Model selection: ~15% of architectures statistically equivalent, mean macro-F1 **0.514** (σ=0.0095), micro-F1 **0.656** (σ=0.0056). Annotation: **>230,000 judgements** from **>2,500** contributors; ≥500 confirmed positives and ≥1,500 confirmed positive-or-negative per class; 33,250 candidate positives + 10,000 candidate negatives ≈ **10%** of all clip-instrument pairs. Baseline random forest beats both the bias point and InstrumentDNN by **>10 percentage points**; RF spread across instruments **20 pp** vs InstrumentDNN's **34 pp**. The 20 classes: accordion, banjo, bass, cello, clarinet, cymbals, drums, flute, guitar, mallet_percussion, mandolin, organ, piano, saxophone, synthesizer, trombone, trumpet, ukulele, violin, voice.
4. **Stated limitations.** "The dataset is not 'complete' in that not every clip has been annotated for the presence or absence of every instrument." Sampling "does introduce some systematic bias, increasing representation of styles with distinctive instrumentation, such as classical or jazz". Agreement is asymmetric per instrument — "some instruments produce more agreement for absence than presence (accordion, violin), while the reverse is true for others (synthesizer)". Control questions were hard to build for the rare classes, "notably mandolin and clarinet". They explicitly plan to expand "in breadth of instrument classes, and in depth to provide refinements of classes, such as **alto saxophone and tenor saxophone** rather than saxophone".
5. **Concrete application HERE.** (a) The **merge rule is transferable and is the frontier practice**: keep a coarse *selectable* label and let specificity live one level down — so our palette should offer `Guitar` at family level and `Nylon Guitar` / `Acoustic Guitar` / `Electric Guitar` as leaves, which is precisely the shape our existing `nylon_guitar` entry already implies. (b) The **cut of harp/bagpipes/harmonica for lack of evidence** is the exact discipline our Turkish entries need: keep them, but keep the honest badge. (c) The **one-instrument-per-task** finding is a UI finding, not just an annotation finding: asking a user to judge many instrument checkboxes at once produced measurably worse results than a focused control — so the instrument picker should be **family-tabbed**, not one 160-row scroll. (d) OpenMIC is **CC BY 4.0**, so it is the safest possible licence basis for a shipped list.

## 3.3 General MIDI — the machine-readable backbone

Verified from two independent reproductions this session (CMU course reference and Somascape), with the first-party MIDI Association page confirming the standard's requirement ("Support a minimum of **128** MIDI Program Numbers (conforming to the GM 1 Instrument Patch Map) and **47** percussion sounds (conforming to the GM 1 Percussion Key Map)"; **Channel 10 reserved for percussion**; 24 voices; 16 channels).

The **16 families**, in program order: 1–8 Piano · 9–16 Chromatic Percussion · 17–24 Organ · 25–32 Guitar · 33–40 Bass · 41–48 Strings · 49–56 Ensemble · 57–64 Brass · 65–72 Reed · 73–80 Pipe · 81–88 Synth Lead · 89–96 Synth Pad · 97–104 Synth Effects · 105–112 Ethnic · 113–120 Percussive · 121–128 Sound Effects.

**Why GM is the right spine and not merely the familiar one:**
- It is **exactly the size the frontier evidence supports**: 16 groups × 8 items. That is inside the grouping regime the choice literature endorses, and it is a *published* grouping rather than one I invented — which matters under Clause 4.
- It is **machine-readable and stable since 1991**, with a fixed integer per name — so `instrument.gm_program` becomes a real key for future MIDI/stem work, sample selection, or a piano-roll editor, at zero extra cost today.
- It is **directly meaningful to a music model**: these are the standard English instrument names Lyria's prompt guide asks for ("piano", "synthesizer", "acoustic guitar", "string orchestra", "electronic drums" — C-01 L1005; four of those five map straight onto GM programs).
- **Its limits are known and stated:** GM's `105–112 Ethnic` family is 8 slots for the entire non-Western world, and its 1991 vintage predates most electronic-instrument taxonomy. That is why GM is the *spine*, not the whole list.

## 3.4 Hornbostel–Sachs / MIMO 2011 — the organological authority, and why it is a classifier not a picker

Verified from the MIMO Consortium's own revision document (C-06) plus the City University knowledge-organization analysis (A-16) and Wikipedia's structural summary:

- **Five top-level classes** in the 2011 revision: **1 Idiophones · 2 Membranophones · 3 Chordophones · 4 Aerophones · 5 Electrophones**. Classes 1–4 are Hornbostel & Sachs 1914 (published in *Zeitschrift für Ethnologie*; English translation Galpin Society Journal 1961); **class 5 Electrophones is the 2011 addition**, based on **Maarten Quanten**'s (Musical Instrument Museum, Brussels) modular thesis, abbreviated for MIMO into separate categories for instruments and modules "facilitating their allocation to different classes by non-specialists".
- Modelled on the **Dewey Decimal Classification**, "over **300** basic categories in total". Idiophones subdivide by playing method: struck (11), plucked (12), friction (13), blown (14).
- The MIMO database holds **54,076** instrument records; the revision was EU-funded, delivered under **CIMCIM** (ICOM's International Committee for Musical Instrument Museums and Collections).
- **Its own stated purpose was NOT to rethink structure** but "predominantly to incorporate … new knowledge" (A-16), and it was "designed for a shared, [online] environment".
- **The published criticism, which the brief asked for:** Blench (Fondazione Levi abstracts) — H-S "by definition … focuses on a single descriptive feature, **morphology**, and thus it cannot encompass multiple different aspects of a given instrument". A rule in the revision itself shows the strain: "Unmodified acoustic instruments with attached microphones or pickups are classed within groups 1–4, according to the primary source of acoustic or mechanical vibration" — i.e. an electric guitar is a **chordophone**, not an electrophone.

**Consequence for us:** Hornbostel–Sachs is a **classification of how sound is produced**, which is the wrong grouping for a person choosing a sound. A user looking for "Electric Guitar" will not look under *Chordophones*; a user looking for "Synth Pad" will not look under *Electrophones*. **Recommendation: carry H-S as a per-entry ATTRIBUTE (`hornbostel_sachs: "3"` / `"321.322"` where known), never as the UI grouping.** That gives us the organological authority for provenance and search without inflicting a morphological taxonomy on the picker. This is the one place where I recommend *against* the most academically authoritative option, and the reason is stated rather than assumed.

## 3.5 AudioSet instrument branch — measured, not recalled

Fetched and counted this session (C-04): the *Musical instrument* node carries **117,343 annotations** and **20 immediate children**: Plucked string instrument (44,565) · Keyboard (musical) (10,473) · Percussion (16,948) · Orchestra (8,414) · Brass instrument (7,513) · Bowed string instrument (10,296) · Wind instrument/woodwind (6,083) · Harp (2,043) · Choir (6,709) · Bell (1,844) · Harmonica (2,216) · Accordion (2,894) · Bagpipes (1,776) · Didgeridoo (1,240) · Shofar (329) · Theremin (631) · Singing bowl (895) · Musical ensemble · Bass (instrument role) · Scratching (performance technique).

Three structural facts worth carrying: the ontology is a **lattice, not a tree** (one class may have two parents — A-03 §2.1, A-11); of 632 classes **56 are blacklisted** as obscure (the cited example is literally "Alto saxophone") or confusing, and **22 are abstract** intermediate nodes; and the branch mixes **instruments** with **roles** ("Bass (instrument role)") and **techniques** ("Scratching"). **Contradiction preserved (CT-4):** the class count is reported as **632** (ICASSP paper, Medium review, one ResearchGate citation), **635** (Google Research's own publication page) and **527** (the released dataset's label set, per multiple later papers). I did not average these; each figure is attached to what it counts.

**Consequence for us:** AudioSet supplies **families and the world/folk long tail** (didgeridoo, shofar, singing bowl, theremin, bagpipes) with a first-party Google provenance — but its role/technique nodes must **not** be imported as instruments. Note the pleasing convergence: AudioSet's branch has **20** immediate children and OpenMIC settled on **20** classes; neither is arbitrary and they were derived by different routes.

## 3.6 World / folk coverage, including Turkish — sourced names

Requested explicitly in the brief. Sourced from **CompMusic / UPF** field notes (C-12, first-party research programme under Xavier Serra) and **Bozkurt et al. 2014 JNMR** (A-14), with the UIUC CSAMES teaching sheet as a third corroboration:

| Instrument | Sourced description | H-S class | Corroboration |
|---|---|---|---|
| **Bağlama / Saz** | long-necked plucked lute, "mainly used in folk music and in fact **the most common instrument in Turkey**" | 3 chordophone | C-12, A-14 (tuning studies), CSAMES |
| **Tanbur** | long-necked fretted plucked lute, central to Ottoman classical music | 3 | C-12, A-14 (instrument in Dura 2001 classifier set) |
| **Kanun** | plucked zither, "**twenty-six courses** of strings and **three strings per course**", with **mandal** latches giving "typically **6 parts per semitone**" microtonal division | 3 | C-12 (recorded with Ruhi Ayangil), A-14, CSAMES |
| **Ney** | end-blown reed flute, played obliquely; "very much used in Ottoman and Sufi music"; river cane, **seven holes** | 4 aerophone | C-12, A-14, CSAMES |
| **Kemençe** | small **three-string** bowed instrument; classical-music form stops strings "by pressing **sideways with the fingernails**" | 3 | C-12, A-14, CSAMES |
| **Zurna** | double-reed wind instrument, "very loud and only used outside" | 4 | CSAMES, salamuzik |
| **Davul** | large double-sided bass drum, played with a large beater and a small switch | 2 membranophone | CSAMES |
| **Darbuka** | goblet-shaped single-headed percussion | 2 | salamuzik, CSAMES |
| **Bendir / Def** | frame drum | 2 | salamuzik |
| **Ud** | plucked lute of Turkish art music | 3 | A-14 (in Özbek & Savacı 2009 set), CSAMES |

**The measured negative finding, stated because it is the one that matters:** Bozkurt et al. report that computational work on Turkish instruments used tiny corpora — Dura (2001): "**12 single note recordings** for each instrument" for ney, kanun, kemençe, tanbur — and that these studies "provide very little information for understanding the timbre or acoustics of Turkish music instruments. Their design and testing does not include any **culture specific** information or analysis." The onset-annotation collection covers **11** instruments of which only **four** are Turkish (kemençe, ney, tanbur, oud).

**Therefore:** the names above are **well-sourced as instrument names** (safe to ship as vocabulary entries with citations) while **Lyria's rendering quality for them remains UNPROVEN** — exactly what our current `instrument_vocabulary.json` notes already say for bağlama/ney/darbuka. That badge convention is correct and must be extended to every new world/folk entry, not quietly dropped. Google's own docs give no per-instrument capability list, so a claim either way would be `[UNVERIFIED]`; the honest resolution is a $0 probe of our own before any of these is promoted (see Application ledger).

## 3.7 Recommendation — INSTRUMENT

**ADOPT: General MIDI's 16 families as the spine and ~128 GM names as the core, extended by ~30 world/folk + modern-electronic entries from AudioSet/OpenMIC/CompMusic → ~160 total; Hornbostel–Sachs carried as a per-entry attribute; OpenMIC's merge rule applied to keep the family layer coarse.**

**Why this beats the alternatives, with the deciding facts:**
- vs **OpenMIC 20** — the current evaluation standard and the safest licence, but its own authors call the resolution "intentionally approximate" and plan to refine it; 20 selectable instruments would be a *regression* against "maximum predefined values".
- vs **MedleyDB 80** — real expert stem labels, but derived from only **122** songs and distributed as a research dataset; excellent corroboration, weak spine.
- vs **NSynth 1,006** — note-level synthesis classes, not user-facing instruments.
- vs **Hornbostel–Sachs / MIMO 300+** — the authority, but morphological; §3.4 gives the reason it becomes an attribute instead.
- vs **MPEG-7 timbre 4 classes** — a *descriptor* scheme (attack, brightness, richness), not an instrument list, and **paywalled** (ISO/IEC 15938-4:2002). Note honestly: two of its four sound classes were "deemed to be of lower priority due to their relative rarity" and only harmonic-sustained and percussive-nonsustained were developed. Not usable as a vocabulary; recorded for completeness because the brief named it.
- **For GM:** 16×8 published grouping · fixed integer keys · stable 35 years · names that match Lyria's own examples · and it is the only candidate that is simultaneously a *standard*, *machine-readable*, and *shaped like a UI*.

---

# AXIS 4 — HOW MANY IS "MAXIMUM"? (the choice-overload evidence)

## 4.1 Five-part depth record — A-05 Scheibehenne, Greifeneder & Todd 2010 `[FULL]`

1. **Problem.** "The choice overload hypothesis states that an increase in the number of options to choose from may lead to adverse consequences… A number of studies found strong instances of choice overload in the lab and in the field, but others found no such effects or found that more choices may instead facilitate choice and increase satisfaction." Direct replications of Iyengar & Lepper had **failed** (Scheibehenne 2008 jam study in Germany; Greifeneder 2008 chocolates; a jelly-bean attempt).
2. **Method.** Random-effects meta-analysis, `dᵢ = Δ + uᵢ + eᵢ`, restricted-maximum-likelihood estimation of τ² (Viechtbauer 2006, R 2.9.1); Cohen's *d* scaled by pooled SD, positive = overload, negative = more-is-better; one-degree-of-freedom contrasts (Rosenthal & DiMatteo) where >2 assortment sizes; then a **meta-regression** on 8 codeable moderators; trimming test (Wilcox); funnel plot; quadratic fit against assortment size.
3. **Real numbers — the decisive ones.** **63 conditions from 50 experiments, N = 5,036** (13 published/forthcoming articles + 16 unpublished manuscripts, 2000–2009). **Mean effect size Δ = 0.02, CI₉₅ [−0.09, 0.12] — virtually zero.** Between-study variance τ² = 0.12, Q(62) = 192 (p<.001), I² = **68%**. Trimmed 20%: Δ = **−0.001**, CI₉₅ [−0.08, 0.07], I² falls to **22%**. Typical sizes: small assortments mean **7** (IQR 5–6), large mean **34** (IQR 24–30); mean n per data point 80. **Meta-regression (Table 2): size of the large choice set b = .002, SE .001, z = 1.48, p = .140 — NOT significant.** Significant instead: consumption as DV b=.87 (z=4.13, p<.001, *more is better*), expertise/prior preferences b=.50 (z=2.49, p=.013, *more is better*), journal publication b=.27 (p=.007, publication bias), publication year b=.05 (p=.035). Hypothetical vs real choice p=.898; outside-US p=.540. All moderators together explain **56%** of variance. **Quadratic fit of effect size against assortment size: R² = 0.02** — "a curvilinear relationship cannot be substantiated". Original Iyengar & Lepper figures reproduced in the paper: 6 vs 24 jams → **30% vs 3%** purchase; 6 vs 30 chocolates → satisfaction **6.3 vs 5.5** on a 7-point scale, and **48% vs 12%** taking chocolates over money.
4. **Stated limitations.** "No sufficient conditions could be identified." Slight publication bias in favour of overload; possible bimodal true distribution (split at d=0.2 gives two homogeneous subsets, "should be interpreted with caution"); several idiosyncratic moderators could not be tested meta-analytically and were reviewed qualitatively instead.
5. **Concrete application HERE — and this is the finding that authorises the owner's order.** The count is **not** the risk factor: `p = .140` for set size, and *R²* = 0.02 for any curve. So "maximum predefined values" is **not** in tension with usability evidence — the fear that a big list is inherently harmful is **not supported by the strongest available synthesis**. What the same paper identifies as the real moderators maps one-to-one onto our design: **(a) categorisation** — in its qualitative review, "Mogilner et al. (2008) found that an increase in the number of options decreased satisfaction **only if the options were not prearranged into categories**", because "categories make it easier to navigate the choice set and decrease the cognitive burden… especially in unfamiliar situations" → **so grouping is the mechanism that makes the large list safe**; **(b) information quantity, measured as entropy**, is driven "more strongly by the number of **attributes**" than by the number of options → so keep each entry's visible surface to *label + one-line gloss*, not a spec sheet; **(c) time pressure** (Inbar et al. 2008, Haynes 2009) produced overload where it was absent otherwise → never gate generation behind a countdown; **(d) prior preferences reverse the effect** (b=.50) → a musician who knows they want a Rhodes benefits from the long list, which is precisely our user.

## 4.2 The opposing meta-analysis, preserved not averaged — A-07 Chernev, Böckenholt & Goodman 2015 `[PARTIAL]`

Same question, opposite conclusion. **99 observations, N = 7,202.** Four moderators — **choice set complexity, decision task difficulty, preference uncertainty, decision goal** — each with "a reliable and significant impact"; higher task difficulty, greater set complexity, higher preference uncertainty and a "more prominent, effort-minimising goal" all facilitate overload. Their explicit contradiction of A-05: "when moderating variables are taken into account the overall effect of assortment size on choice overload **is significant — a finding counter to the data reported by prior meta-analytic research**." They also find four DVs (satisfaction/confidence, regret, choice deferral, switching likelihood) are "equally powerful… and can be used interchangeably", and they report one worked example at d=1.18 for satisfaction / d=.84 for choice likelihood. The same authors had earlier published a direct commentary on Scheibehenne et al. in JCR 37(3) 426–428 — this is a live dispute in the literature, not a settled question.

**How I resolved it — by taking the intersection, not the average (CT-1).** Both papers agree on the *mechanism* even while disagreeing on the *main effect*:
- both name **preference uncertainty / expertise** as decisive (A-05: b=.50; A-07: a named moderator) → our users are music-literate and self-selected, which is the *protective* side on both accounts;
- both name **set complexity, not set size**, as the operative variable (A-05: attributes dominate entropy; A-07: "choice set complexity" is one of the four) → **complexity is what we must hold down, and grouping + a one-line gloss is how**;
- both name **decision task difficulty / effort-minimising goals** → provide search and defaults so no user is ever *forced* to traverse the list.

**Therefore the recommendation is identical under either meta-analysis**, which is the strongest position available while the dispute is open: **grow the lists, and spend the design effort on grouping, search, defaults and per-entry brevity.** Under A-05 the growth is free; under A-07 the grouping is what pays for it. Neither paper supports a flat list, and neither supports a small one.

## 4.3 What taxonomy owners and competitors actually do (corroboration)

- **Discogs (C-08), a taxonomy owner at catalogue scale, states the UI reason for capping depth in its own guidelines:** "Discogs aims to limit the number of accepted styles for the style field. This is because excess styles, or sub-sub-genres, cause the drop down list on the Submission Form to become **unmanageable, and more confusing to use**." It solves this with exactly the structure recommended here: **15 broad genres, then styles revealed only after a genre is chosen** ("The 'Styles' field will only appear after you've selected a genre, because the available styles depend on the genre"). That is progressive disclosure, published by a practitioner, and it independently corroborates the academic finding.
- **AllMusic** demonstrates the opposite pole: **179 mood labels** whose distribution is so uneven that some carry **3** albums (A-01 §2.1) — evidence that an unmanaged vocabulary decays into unusable tails.
- **AudioSet** blacklists **56 of 632** classes from its own annotators for being obscure or confusing — a first-party admission that a big ontology needs a *presentation* filter.
- **Competitor surfaces, measured on our own archives this session:** ElevenLabs' first-party capability page (C-13) describes **free-text prompting** with example genre strings ("Traditional Spanish flamenco with palmas, nylon guitar, and Spanish-language vocals") and sectional structure (Intro, Verse, Chorus, Breakdown, Outro) — **no published closed vocabulary**. Suno's archived changelog contains **21** lines mentioning genre/mood/instrument; Udio's pricing page contains **0**; Stability's audio-to-audio tips **1**. **Finding: no competitor in our archive publishes a closed, sourced taxonomy.** So a sourced, grouped, coordinate-annotated vocabulary is not parity work — **it is a differentiator none of them currently offers.** (Stated honestly: absence in *our archive* is not proof of absence in their live products; this is `NOT FOUND IN THE SEARCHED SCOPE`, per R18.11, not "they don't have one".)

## 4.4 Recommended TOTALS and the grouping structure

| Vocabulary | Now | Target | Groups | Group size | Grouping source |
|---|---|---|---|---|---|
| `genres` | 21 | **~120** | 14 families | ~6–12 (deliberately uneven) | Discogs 15 minus `Non-Music` (C-08) |
| `moods` | 17 | **~64** | 9 GEMS factors (+3 superfactors) | ~5–9 | GEMS (A-08/A-09) |
| `instruments` | 17 | **~160** | 16 GM families + 1 `World & Folk` | 8 (GM-fixed) | General MIDI 1 (C-05) |
| `eras` **(new)** | — | **~12** | 2 (decades · period) | ~6 | Google Cloud C-02 |
| **Total selectable** | 55 (of 235 across all closed sets) | **~356** | 41 groups | — | — |

**Every number above is derived, not chosen:** 14 = Discogs' 15 minus the one non-generative family; 9 = GEMS factors; 16 = GM families; 8 = GM programs per family; ~12 eras = decades from the 1920s to the 2020s plus a small set of period labels Google's own example uses ("the 1950s", "early 90s").

## 4.5 The fourth axis — ERA / stylistic timeframe

**New finding, first-party, dated 2026-04-07 (C-02):** Google's current best-practice list for Lyria 3 names era as a *separate* thing to state — "**Reference genres and eras:** Clearly state the musical category (for example, Rock or Pop) **and stylistic timeframe (e.g. the 1950s, early 90s)**." Our vocabularies model **no** era axis. Meanwhile the AcousticBrainz authors deliberately **strip** era tokens ("50s") out of genre taxonomies (A-04 §2.1). Both facts point the same way: **era is real and must be modelled, but not inside `genres`.**

Recommended `era_vocabulary.json`: decades `1920s … 2020s` (11) + period modifiers such as `classic`, `modern`, `early`, `late`, `vintage`, `contemporary` as a separate small set — each entry sourced to C-02, with the "early 90s" construction as the documented precedent for combining a modifier with a decade.

**Also newly available from C-02 and currently unmodelled — recorded for the owner's decision, not acted on:**
1. **Timestamp prompting** — `[00:00] … [01:10] … [03:00]` structural control with per-segment instructions.
2. **Multimodal conditioning** — text, **PDF**, or **up to 10 reference images**.
3. **Vocal texture / range vocabulary** — "commanding baritone", "clear and high soprano", "gravelly", "soulful", "breathy"; delivery "fast-paced"/"laid-back"; and dynamic change within a track ("calmer and quieter as the track progresses"). This is a *fifth* candidate vocabulary with first-party evidence.
4. **Track length** — Lyria 3 = 30 s; **Lyria 3 Pro up to three minutes**.
5. **Trust & safety** — all outputs carry **SynthID** watermarking and support **C2PA** signed metadata.
6. **Eight vocal languages** — English, German, Spanish, French, Hindi, Japanese, Korean, Portuguese. **Turkish is absent from this list** (see CT-3).

---

# Claim cross-verification and independence ledger

| ID | Load-bearing claim | Source A | Source B | Source C | Independence rationale | Status |
|---|---|---|---|---|---|---|
| CV-1 | Discogs' genre taxonomy has exactly **15** genres, enumerated | C-08 Discogs own guidelines (the 15 listed) | A-04 Table 2 (Discogs: 15 genres / 300 subgenres) | MediaEval 2017 CEUR Table 1 (Discogs: 15 / 300) | Taxonomy owner + two independent academic harvests, different years/snapshots | **VERIFIED 3+** |
| CV-2 | AllMusic **21** genres / **745** subgenres; Lastfm **30**/**297**; Tagtraum **31**/**265** | A-04 Table 2 (ISMIR 2019) | MediaEval 2017 CEUR Table 1 (identical genre/subgenre counts) | MTG dataset site + repo (C-11) | Paper, task paper and the dataset distribution are separate artefacts; counts agree even though recording counts do not | **VERIFIED 3+** |
| CV-3 | General MIDI 1 = **128** programs in **16** families of 8; **47** percussion sounds; channel 10 reserved | C-05 midi.org (requirement text) | CMU course patch map ("groups sounds into sixteen families, with 8 instruments in each family") | Somascape family table (PC# 1–8 … 121–128) + Estrella MIDI guide ("128 timbres divided into 16 timbre families … 47 percussion sounds") | Standards body + three independent reproductions | **VERIFIED 3+** |
| CV-4 | Hornbostel–Sachs as revised by MIMO (2011) has **5** top-level classes, electrophones being the addition | C-06 MIMO revision (own text: "the new Electrophones class 5") | A-16 City Univ. KO analysis ("the addition and development of the electrophones main category") | Wikipedia structural summary ("five top-level classifications… over 300 basic categories") + Fondazione Levi abstracts (Birley) | Standard, peer-reviewed analysis, tertiary summary, conference abstract | **VERIFIED 3+** |
| CV-5 | MIREX AMC used **5** mood clusters derived from AMG by Hu & Downie | A-01 (the derivation itself) | A-02 §2.1 + Table 1 (adoption) | C-15 MIREX wiki 2007 **and** 2010 (cluster membership listed identically) | Deriving paper, evaluating paper, and the task's own operational wiki across two years | **VERIFIED 3+** |
| CV-6 | With 5 mood clusters, human inter-annotator agreement was **67.8%** overall (57.6% worst cluster) | A-02 Table 2 (586/864) | A-02 Table 3 (independent reclassification measure, C1 59.8% retained) | A-01 §8 (independent statement that vocabulary size is "a huge impediment"; corroborates the difficulty, not the figure) | Two independent measurements inside the same study + an independent prior study's qualitative agreement | **VERIFIED (figure is `[single-source official]` — one study, two internal measures; the DIRECTION is 3-source)** |
| CV-7 | GEMS = **9** factors, **45** labels, **3** superfactors; music-specific; outperformed basic + dimensional models | A-08 abstract (9-factorial model; Study 3 n=801, Study 4 n=238) | A-09 GEMIAC preprint (names all nine; "45 emotion terms, representing nine emotion factors") | GEMS project page (9 scales, 45 labels, GEMS-25/GEMS-9) + tertiary summary naming the 3 superfactors | Original paper, an independent authors' preprint that critiques it, and the instrument's own distribution page | **VERIFIED 3+** |
| CV-8 | Russell's circumplex is 2-dimensional (valence × arousal) with 28 scaled words and 8 octant anchors | A-06 (the four scalings, stress .001, angles) | A-06-adjacent PMC review (Posner et al.) restating the two-system model | APA PsycNet abstract listing the eight angles 0/45/90/135/180/225/270/315 | Primary, an independent review in a different field (affective neuroscience), and the publisher's own abstract | **VERIFIED 3+** |
| CV-9 | Choice overload is **not** driven by the number of options; **categorisation** is the operative mitigation | A-05 (b=.002, p=.140; R²=0.02; Mogilner citation) | A-07 (names "choice set complexity", not size, among its four moderators) | C-08 Discogs guidelines (practitioner: excess styles make the dropdown "unmanageable"; solved by genre-then-style disclosure) | Two competing meta-analyses that agree on mechanism while disagreeing on main effect, plus an independent practitioner at scale | **VERIFIED 3+ (mechanism); main effect CONTESTED — see CT-1** |
| CV-10 | OpenMIC's 20-class vocabulary is the current instrument-recognition standard, derived by merging >70 AudioSet classes | A-03 §2.1 (the derivation and the 23→20 cut) | C-15 MIREX **2026** task wiki (pins the vocabulary, lists all 20, documents mapping rules) | Zenodo record + DOI (dataset contents, aggregated labels) | Deriving paper, an independent current evaluation campaign, and the archive record | **VERIFIED 3+** |
| CV-11 | Spotify deprecated Audio Features / Audio Analysis for new apps on **2024-11-27** | C-09 Spotify's own developer blog (dated, enumerates 8 removals) | TechCrunch, same date, names danceability/energy/acousticness | spotipy PR #1174 (library removed the methods, citing the blog) + Spotify Community 403 report | First-party announcement, independent press, and independent downstream code/user evidence | **VERIFIED 3+** |
| CV-12 | AudioSet's *Musical instrument* branch has **20** immediate children | C-04 fetched and counted this session | A-03 §2.1 (">70 relevant classes" under instruments, consistent with a 20-child branch expanding downward) | — | Only one authoritative enumeration exists (the ontology itself); the paper corroborates magnitude, not the exact child count | **`[single-source official]` — flagged** |
| CV-13 | Lyria takes free text, not a controlled vocabulary, for genre/mood/instrument | C-01 L1001–1006 (framework of prose slots, "a list of keywords can generate great songs") | C-02 (prose framework, "or Lyria chooses defaults based on the genre") | C-03 ("Lead your prompt with the genre… You can specify a mix of genres") | Three separate first-party Google surfaces (Vertex docs capture, Cloud blog, Gemini API docs) | **VERIFIED 3+** |
| CV-14 | Turkish instrument names + their organological descriptions | C-12 CompMusic/UPF field notes (kanun 26 courses × 3 strings, mandals ~6 parts/semitone; ney end-blown; kemençe 3-string bowed) | A-14 Bozkurt et al. 2014 JNMR (ney, kanun, kemençe, tanbur, oud, keman as the studied set) | UIUC CSAMES teaching sheet (zurna double-reed, davul double-sided beater+switch, ney 7 holes) | A research programme's primary field notes, a peer-reviewed journal article, and an independent university teaching resource | **VERIFIED 3+ for the NAMES; rendering quality on Lyria remains `[UNVERIFIED]`** |
| CV-15 | Genre and mood are statistically independent metadata axes | A-01 §4.1 (170 pairs significant in both subsets; ~10 significant moods per genre) | A-01 §7.1 Last.fm corroboration (21/28 pairs, an independent corpus) | A-02 §2.1.1 (restates it as the design premise for choosing a multi-genre collection) | One study's internal test, its independent external corpus check, and a later study relying on it | **VERIFIED 3+** |

# Contradictions, corrections and version conflicts — preserved, not smoothed

| ID | The disagreement | Side A | Side B | My handling |
|---|---|---|---|---|
| **CT-1** | Does assortment size cause choice overload at all? | **A-05**: mean d = **0.02**, CI₉₅ [−0.09, 0.12]; size b=.002, p=.140; "no sufficient conditions could be identified" | **A-07**: with 4 moderators controlled, "the overall effect of assortment size on choice overload **is significant** — a finding counter to the data reported by prior meta-analytic research" | **NOT resolved and NOT averaged.** I took the *intersection* of their mechanisms (§4.2): both name preference-uncertainty/expertise and set complexity, neither supports a flat list. The recommendation holds under either. |
| **CT-2** | Should genre taxonomies be large and hierarchical, or is genre too ill-defined to enumerate deeply? | **A-04** builds 21/745 and 15/300 hierarchies and treats them as research infrastructure | **A-12/A-13**: genre is "intrinsically ill-defined", signal-based success "limited to… 1–5 families", 91% of MGR work is label-reproduction | **Preserved.** Resolved *for our use case only* by noting our vocabulary is a prompt palette, not a ground-truth label — and by capping at 2 levels with the AcousticBrainz per-label F=0.032 as the stated reason. |
| **CT-3** | Which languages can Lyria sing? | **C-02** (Google Cloud, 2026-04-07): "**eight languages** (English, German, Spanish, French, Hindi, Japanese, Korean, and Portuguese)" — **Turkish absent** | **C-03** (Google AI, Gemini API): "Lyria 3 generates lyrics in **the language of your prompt**… You can also ask for lyrics to be in another language" — **no closed list** | **PRESERVED as an open conflict between two first-party Google surfaces.** Possible explanations (both `[UNVERIFIED]`): the eight are the *supported/evaluated* set while others are *permitted but unevaluated*; or the two surfaces describe different model endpoints. **Not resolved by me — this is a decision item for the owner and a candidate for a $0 probe.** |
| **CT-4** | How many classes are in the AudioSet ontology? | **632** — ICASSP paper abstract, Medium review, one citing paper | **635** — Google Research's own publication page; **527** — the released label set, per several later papers | **PRESERVED with each figure attached to what it counts** (ontology at publication vs. current page vs. released dataset labels). Also recorded: 485 classes have ≥100 instances; 56 blacklisted; 22 abstract. |
| **CT-5** | How many tags does MTG-Jamendo have? | **195** total / **95** genre / **41** instrument / **59** mood-theme (the category subsets) | **183** total / **87** genre / **40** instrument / **56** mood-theme ("available in the splits") | **PRESERVED — these are two different denominators, not an error.** The repo states both explicitly: 195 in `autotagging.tsv`, and "a few tags are discarded in the splits to guarantee the same list of tags across all splits." |
| **CT-6** | AcousticBrainz recording counts | **A-04** (ISMIR 2019) Table 2: AllMusic 1,935,991 / Discogs 1,290,489 / Lastfm 806,627 / Tagtraum 692,217 | **MediaEval 2017** Table 1: 1,353,213 / 904,944 / 566,710 / 486,740 | **PRESERVED as a dated version conflict** — the 2019 paper reflects a later AcousticBrainz snapshot. Genre/subgenre *taxonomy sizes* are identical in both, which is why CV-2 stands. |
| **CT-7** | Lyria 3 audio sample rate | **C-03** (Google AI docs): "**44.1 kHz** stereo", stated twice | `gemilab.net` third-party guide: "48kHz stereo" | **RESOLVED in favour of the first-party source.** The third-party figure is treated as wrong and the site is excluded from all load-bearing use (see Inclusion/exclusion). |
| **CT-8** | Should era be part of genre? | **C-02** (Google, 2026-04-07): "Reference genres **and eras**… stylistic timeframe (e.g. the 1950s, early 90s)" | **A-04** §2.1: manual post-processing "remove[s] location and era names (e.g. '50s', 'Canadian')" from the genre taxonomy | **RESOLVED CONSTRUCTIVELY, and both sources are satisfied**: era becomes its own axis (§4.5), concatenated into the prompt as Google asks, and kept out of the genre vocabulary as AcousticBrainz practice requires. |

---

# Synthesis — adopt / build / avoid

**ADOPT**
- **Genre spine:** Discogs' 15 families (C-08), minus `Non-Music` → 14, as `family`.
- **Genre leaves:** MTG-Jamendo (95 genre tags, CC), Lastfm/Tagtraum (30/31 + 297/265), Lyria's own named genres (C-01/C-02/C-03) → ~120 leaves.
- **Mood grouping:** GEMS 9 factors + 3 superfactors (A-08/A-09).
- **Mood coordinates:** Russell's measured angles for the 15 words he scaled (A-06); Warriner VAD (A-10) for additions.
- **Mood cross-reference:** the 5 MIREX clusters and their 29 constituent terms (A-01/A-02) as a secondary field.
- **Instrument spine:** General MIDI 1 — 16 families × 8 = 128, with `gm_program` integers (C-05).
- **Instrument extension:** AudioSet branch children for world/folk/electronic long tail (C-04); OpenMIC's 20 as the `mir_standard_label` cross-reference (A-03); CompMusic/Bozkurt for Turkish (C-12/A-14).
- **Instrument attribute:** Hornbostel–Sachs/MIMO class code per entry (C-06) — attribute, never grouping.
- **New axis:** `eras` (~12) on Google's first-party instruction (C-02).

**BUILD (ours, no third party — D-SSM-24 satisfied)**
- A `family` field on every entry + a `groups[].source` per source group (already the file shape).
- `valence` / `arousal` floats on every mood entry; `gm_program` int and `hornbostel_sachs` string on every instrument entry.
- A **capability badge** per entry: `GENERATION_PROVEN` / `SCHEMA_ONLY` / `UNPROVEN` — the convention already present in our Turkish notes, made a first-class typed field rather than a prose `note`.
- Progressive disclosure in the UI: family first, leaves after (Discogs' own published pattern), plus **search** and **sensible defaults**.

**AVOID**
- A flat list of any size (both meta-analyses point away from it; Discogs says so from practice).
- Importing AllMusic's 745 subgenres (per-label F **0.032**; research-only licence on the AcousticBrainz-derived copy).
- Hornbostel–Sachs as the instrument picker's grouping (morphological, and an electric guitar files under *chordophone*).
- AudioSet role/technique nodes (`Bass (instrument role)`, `Scratching`) as instruments.
- Spotify audio features in any form (deprecated 2024-11-27 **and** forbidden by D-SSM-24).
- Balancing the genre tree to equal family sizes (Aucouturier & Pachet: that is how contrived taxonomies are made).
- Any claim that Lyria renders a named world instrument well, until we probe it.

# Application / change ledger

**Research is applied, not filed — but the execution limit in this brief forbids me from touching `generate_music_hybrid_model/`.** So the application is specified here per finding, and the owner performs it after verifying these claims against the primary sources. **Nothing under `generate_music_hybrid_model/` was created, edited or deleted in this run** (verified: the only files this run wrote are the three listed in the artefact index).

| # | Finding | Target file | Change specified |
|---|---|---|---|
| 1 | Discogs 15-family spine (CV-1) | `data/genre_vocabulary.json` | add `family` to every entry; add a source group cited to the Discogs guidelines |
| 2 | ~120 leaves from CC/open taxonomies (CV-2) | `data/genre_vocabulary.json` | new source groups per taxonomy, each with its own `source` string and licence note |
| 3 | GEMS 9+3 grouping (CV-7) | `data/mood_vocabulary.json` | add `gems_factor` + `gems_superfactor`; regroup existing 17 under them |
| 4 | Russell coordinates (CV-8) | `data/mood_vocabulary.json` | add `valence`/`arousal`; 15 entries take measured angles, others `coordinate_basis: "warriner"` or `"estimated"` |
| 5 | MIREX cluster cross-ref (CV-5/CV-6) | `data/mood_vocabulary.json` | add optional `mirex_cluster` 1–5 |
| 6 | GM 16×8 spine (CV-3) | `data/instrument_vocabulary.json` | add `family` + `gm_program`; expand toward 128 core names |
| 7 | H-S as attribute (CV-4) | `data/instrument_vocabulary.json` | add `hornbostel_sachs` |
| 8 | OpenMIC 20 cross-ref (CV-10) | `data/instrument_vocabulary.json` | add optional `mir_standard_label` |
| 9 | Turkish/world entries (CV-14) | `data/instrument_vocabulary.json` | add sourced entries; **keep the UNPROVEN badge** |
| 10 | Era is a separate axis (CT-8) | **new** `data/era_vocabulary.json` + `param_spec.json` | new closed vocabulary + `values_import` |
| 11 | Capability badge should be typed | all three + `param_spec.json` | replace prose `note` with `capability: PROVEN\|SCHEMA_ONLY\|UNPROVEN` |
| 12 | Grouping is the safety mechanism (CV-9) | UI layer (4 surfaces) | family-first progressive disclosure + search + defaults; label + one-line gloss only |
| 13 | Turkish singing is contested (CT-3) | — | **$0 validator probe** before promoting any Turkish entry's badge; then record the measurement |
| 14 | Our Lyria capture is stale | `docs/research/_sources/` | re-capture the live Lyria 3 guide + model card under today's date |

# Honest limits — what I could not verify, and what a licence prevents

1. **Academic `[FULL]` count is exactly at the floor (5), not above it.** A-06 Russell (150/328 lines), A-07 Chernev (100/441) and A-10 Warriner are `[PARTIAL]`; A-08 GEMS, A-15 MedleyDB, A-16, A-17 are `[ABS]`. No `[ABS]` source carries a load-bearing claim alone. I state this rather than inflating the marks.
2. **ISO/IEC 15938-4:2002 (MPEG-7 Audio) is PAYWALLED.** I read the ISO catalogue abstract, the MPEG description page and the IEEE overview instead. I did not bypass the paywall (R13.3). Any MPEG-7 claim here is therefore `[ABS]`/secondary and none is load-bearing.
3. **The General MIDI 1 specification PDF is member-gated** on midi.org ("Join Us to Download"). The 128 names and 16 families are verified from three independent reproductions plus the standard's own requirement text on the public page — **but I have not read RP-003 itself.** Marked `[PARTIAL]`.
4. **I did not read the MTG-Jamendo `data/tags/*.txt` files themselves.** The GitHub blob render returned 0 lines; per R4.3 I re-searched instead of guessing URL variants, and obtained the counts from four independent renderings. **The 95/41/59 and 87/40/56 counts are verified; the individual tag strings are NOT in hand.** Anyone building the leaf list must open those files.
5. **AllMusic-derived data carries a research-only licence.** A-04 states its genre metadata is CC BY-NC-SA 4.0 "except for data extracted from the AllMusic database, which is released for **non-commercial scientific research purposes only**." **This blocks copying AllMusic's 745-subgenre list into a commercial product.** Discogs/Lastfm/Tagtraum/MTG-Jamendo do not carry that block. This is a legal reason, independent of the F=0.032 quality reason, to reject the AllMusic depth.
6. **Whether Lyria can sing Turkish is `[UNVERIFIED]` and Google's own surfaces disagree** (CT-3). I did not resolve it and did not spend money to try.
7. **Per-instrument rendering quality on Lyria is `[UNVERIFIED]` for every world/folk instrument.** No first-party per-instrument capability list exists.
8. **The MusicBrainz genre count is deliberately not stated.** The API exposes a live `genre-count`; the number changes over time and I did not call the endpoint. Stating a figure would have been a guess.
9. **Competitor closed vocabularies: `NOT FOUND IN THE SEARCHED SCOPE`,** not proven absent. I searched our 84-file archive and first-party docs; Suno/Udio/Stability/ElevenLabs may expose vocabularies in live UIs I did not access.
10. **Choice overload's main effect is contested in the literature** (CT-1). My recommendation is built to hold under *both* meta-analyses precisely because I cannot honestly pick a winner.
11. **The `Non-Music` exclusion is my own narrowing of a source list.** It is flagged in §1.5 as an owner decision rather than performed silently.
12. **No visual verification.** I cannot see the UI; every interface claim here is a design recommendation from cited evidence, not an observation. Visual: unverified.

# Living-update watchlist

| Watch | Trigger | Why |
|---|---|---|
| Vertex AI Lyria model page + prompt guide | any change | our capture is already stale by one model generation |
| Lyria vocal-language list | change to the eight | CT-3 is open and Turkish depends on it |
| MIREX Audio Instrument Recognition (2026 and later) | vocabulary change | it currently pins OpenMIC's 20 |
| MusicBrainz `/genre/all` `genre-count` | quarterly | live-changing taxonomy |
| Discogs Database Guidelines 9 | style-list changes | our family spine |
| OpenMIC revisions (Zenodo DOI per revision) | new revision | authors stated intent to expand breadth and depth |

# Artefact index and produced-vs-planned count

Planned 3, produced **3** (machine-counted below in the completion audit): (1) this report; (2) 16 archived source captures under `_sources/`; (3) the index row in `docs/README.md`.

# Completion audit

- [x] Newest-dated sources led (C-02, **2026-04-07**); every source dated; stale ones flagged (our own Lyria capture, Spotify endpoints, GTZAN/ISMIR04 legacy).
- [x] SEARCH-FIRST honoured — **zero guessed URLs**; the one empty render was met with a re-search, not a slug variant.
- [x] All four tiers consulted — universities/named professors (UPF-MTG/Serra, NYU MARL/McFee, UIUC/Downie, Geneva/Scherer, Kellogg/Chernev, Indiana/Todd, KTH/Bozkurt, IRCAM/Peeters) · scope-leading companies first-party (Google Cloud, Google Research, Google AI, Spotify, Discogs, MetaBrainz, MIDI Association, ElevenLabs) · **THE DARK** (MIREX 2026 wiki, in-repo tag files, blacklisted ontology nodes, the era-stripping rule, first-party self-contradiction) · top repos/open datasets (MTG-Jamendo, AcousticBrainz, OpenMIC, AudioSet).
- [x] Counts REPORTED: **34** authoritative / **18** academic / **5** academic `[FULL]` / **11** primary `[FULL]`.
- [x] ≥3-source cross-verification: **15** ledger rows; **2** flagged `[single-source official]`; **1** `[UNVERIFIED]`.
- [x] Disagreements PRESERVED: **8** contradictions recorded; 2 resolved on evidence, 1 resolved constructively, 5 left open.
- [x] Documented to convention, in English, with cross-verification ledger, honest limits, application ledger.
- [x] Sources archived: **16** captures written by THIS run under `_sources/`, all named `2026-08-17-*`, all 16 verified present, **1,091,077 bytes** total. (The folder holds **83** files dated `2026-08-17-*` in total — the other 67 belong to other runs today and are **not** claimed here.)
- [x] Indexed in `docs/README.md` — 1 row appended, file grew 304 → **305** lines, nothing overwritten.
- [x] Execution limits obeyed, MEASURED not asserted: **0** files under `generate_music_hybrid_model/` modified in this run's 60-minute window (`Get-ChildItem -Recurse | Where LastWriteTime -gt now-60min` → count 0). The three vocabulary files remain at their 2026-08-14 mtimes: `genre_vocabulary.json` 2026-08-14 19:11:48 / 2,834 B / `761E237DDE1F6BE7…`; `mood_vocabulary.json` 19:12:10 / 1,879 B / `FDBA2471C55CF40D…`; `instrument_vocabulary.json` 19:12:33 / 2,281 B / `E50BFEF27DB06D92…`. Eight files in that tree carry 21:06–21:12 mtimes from a **different** run earlier today; they are named here only so the boundary is unambiguous, and no claim is made about them. **No** paid API call; **no** dataset download; **no** paywall bypassed.
- [ ] **Findings APPLIED to the deliverable — NOT DONE, and correctly so:** the brief reserves the vocabulary files to the owner. The application is specified per item in the Application ledger above and awaits his verification.






