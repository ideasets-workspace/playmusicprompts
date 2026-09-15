# Standards ledger

Read from disk in the session that opened this run (2026-08-17): `.claude/memory/DECISIONS.md`
(D-SSM-30, D-SSM-31) · `generate_music_hybrid_model/music_studio/bar_calibration.py` ·
`generate_music_hybrid_model/music_studio/data/language_registry.json` (states legend) ·
`scripts/fetch_calibration_corpus.py` · the deep-research covenant
`C:\Users\berke\.claude\skills\deep-research\SKILL.md` (marked block SHA-256 recomputed this session:
`69d557a1ab2b80027be1815c4fc07c37f5bd2c310448d48a6dce64617c14aa17`).

# Human sung calibration corpus — licence-clean sources for the A9 bar (R3 scope plan)

## 1. The decision this research serves

The engine's own registry gate refuses `vocal.mode=sung` for EVERY language because `SINGING_PROVEN`
requires the PER gate to PASS on >=3 songs and the PER gate is `NOT_CALIBRATED` until A9's
per-language bar exists (two $0 planner dry runs, this session). The bar's sampling unit is HUMAN
sung recordings (>=5 per language, bar_calibration.py read this session) — the engine's own outputs
are methodologically INADMISSIBLE as calibration input (a gate calibrated on the thing it judges is
a control that cannot fail). So: **which human sung-vocal datasets with per-song lyric references
are lawful for a COMMERCIAL product under D-SSM-30 (no new paid service; Google-only engine), at $0,
for Turkish first and English second — or the proof that none exists, which routes A9 to owner-
commissioned recordings with a concrete brief.**

## 2. Subquestions

1. Which openly licensed singing-voice corpora exist per language (TR, EN) with lyrics or phoneme
   annotations per recording? (Candidate universe seeds, mandatory, never a whitelist: NUS-48E,
   VocalSet, OpenSinger, M4Singer, GTSinger, CSD (Children's Song Dataset), MUSDB18, MedleyDB,
   Saraga/CompMusic, common-voice-style community corpora, Zenodo/OSF/IEEE DataPort holdings,
   university lab releases.)
2. For each: the EXACT licence string read from the primary source this session, and whether it
   permits commercial use and derivative measurement artefacts (NC and ND are both fatal —
   D-SSM-30's Makam refusal is the precedent).
3. Genre scope: the engine generates pop/ballad/cinematic; a bar's corpus genre must match or the
   scope rule blocks it (bar_calibration.json scope_rule). Which candidates carry that genre class?
4. If Turkish has NO lawful candidate: the commissioned-recordings alternative — what does the
   literature say a minimal valid recording brief looks like (n, song length, singer count, room)?
5. Does Google host any singing corpus (TFDS, research releases) whose terms work? (Google-only
   preference, not a hard filter for DATA — D-SSM-24 binds SERVICES.)

## 3. Falsifiers

- A corpus marketed as "open" whose record-level licence is NC/ND → excluded, named, with the string.
- A licence permitting research only → excluded (this is a commercial product).
- A Turkish corpus existing but in a non-matching genre only (e.g. makam) → reported as scope-blocked,
  never silently widened.

## 4. Inclusion / exclusion

INCLUDE: primary dataset pages, licence files inside the archives, the papers introducing them,
registry APIs (Zenodo/OSF), university lab pages. EXCLUDE: aggregator blog lists as authorities
(usable as discovery only), anything paid (D-SSM-30), anything requiring a signed research-only EULA.

## 5. Planned artifacts (produced count must equal this)

1. This report (findings + ledgers + decision), 2. per-source captures under
`docs/research/_sources/2026-08-17-*`, 3. preflight JSON (written), 4. completion manifest
`docs/research/_runs/2026-08-17-human-sung-calibration-corpus.completion.json`, 5. `docs/README.md`
index row. **Total: 5 artifact classes.**

## 6. Hard-law check

D-SSM-30 (no new paid service; Google-only engine scope) · D-SSM-31 (nothing presented to Berk until
gates green) · Clause 22 ($0 — this run spends nothing) · research floors ≥20/≥5 with [FULL] marks ·
no guessed URLs (SEARCH-FIRST).

## 7. Completion semantics

Done when: every candidate carries a read-this-session licence verdict; TR and EN each end in exactly
one of {LAWFUL CANDIDATE(S) NAMED, NONE EXISTS → commissioned-recordings brief}; the cross-
verification ledger covers every load-bearing claim; artifacts 5/5 produced and indexed.

# Outcome first

**TR verdict: NONE EXISTS → commissioned-recordings brief (Section B below).** Both Turkish corpora
with lyric-aligned sung audio are CC BY-NC-ND (Zenodo API read this session: record 1287656 and
record 1283350, both `cc-by-nc-nd-4.0`); the only CC BY 4.0 Turkish makam record (Zenodo 1284501)
contains annotations and scores ONLY, no vocal audio; the two Hugging Face Turkish folk sets
(alibayram/*) are gated/`license:other` with YouTube-sourced audio — commercially unusable
regardless of their self-declared flag. Zenodo API sweeps (exact queries in the capture file)
surfaced no further Turkish candidate.

**EN verdict: LAWFUL CANDIDATES NAMED.** Two CC BY 4.0 corpora satisfy the bar's input contract
(>=5 human sung recordings with known lyrics): **LM-SSD** (Zenodo 20287765, licence `cc-by-4.0`
read via API this session; 12 pop songs, 72 takes, 348 files incl. clean close-up vocal tracks +
per-song lyrics; caveat: cover compositions — see licence table note) and **vocadito** (Zenodo
5578807, `cc-by-4.0`; 40 solo-vocal excerpts, 17 English, per-track lyrics). Supplementary lawful
pool: 3 commercial-OK English songs inside JamendoLyrics MultiLang (per-song `BY`/`BY-SA` rows
parsed from the dataset's own CSV) and per-track `CC BY` a cappellas on ccMixter (lyrics printed on
the track pages).

Floors: **31 independent authoritative sources / 9 academic, of which 7 archived and read [FULL]**
(counts recomputed in the source register below). Spend: $0.

Covenant-hash note (bad news, kept visible): the dispatch brief carried
`COVENANT_SHA256: 69d557a1…c14aa17`; recomputation of the marked BEGIN..END block this session, on
all four installed copies and 15 normalization variants, yields
`07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8` (markers inclusive,
LF-normalized). The brief's hash did not reproduce; the covenant file itself was read in full and
executed. Recorded in the contradiction ledger.

# Per-candidate licence table (every licence read from the primary source, 2026-08-17)

| Candidate | Lang | Genre class | Licence string, quoted from the primary | Primary URL | Verdict |
|---|---|---|---|---|---|
| **LM-SSD** (Larynx Microphone Singer-Songwriter Dataset, AudioLabs Erlangen, 2024) | EN-dominant (12 pop songs; 1 German-titled track "Dezemberluft", 1 "Narben" — German lyrics, per song table) | Pop (covers of Coldplay, Snow Patrol, Charlie Puth etc.) | Zenodo API: `{"id": "cc-by-4.0"}`; AudioLabs page: "The recordings in LM-SSD are available under the Creative Commons Attribution 4.0 International (CC BY 4.0) license. Note that some songs in the dataset are cover versions. In these cases, it may be required to obtain a separate license for the composition, depending on the intended use case." | https://zenodo.org/records/20287765 | **LAWFUL** (recordings CC BY 4.0). Composition-cover caveat applies to REDISTRIBUTION/sync, not to internal measurement; flag to owner. |
| **vocadito** (Spotify/IRCAM, 2021) | 7 languages; EN 17 tracks, FR 10, Tagalog 6, Mandarin 2, Catalan 2, ES 1, Hawaiian 1; NO Turkish | Mixed solo singing (folk/pop-adjacent, varied devices/training) | Zenodo API: `{"id": "cc-by-4.0"}`; mirdata: `LICENSE_INFO = "Creative Commons Attribution 4.0 International"`; tech report: "Licensed under a Creative Commons Attribution 4.0 International License (CC BY 4.0)" | https://zenodo.org/records/5578807 | **LAWFUL** (EN leg only; 17 EN tracks >= 5) |
| **Turkish Makam Acapella Sections Dataset** (MTG-UPF, 2015) | TR | Makam şarkı (scope-blocked genre anyway) | Zenodo API: `{"id": "cc-by-nc-nd-4.0"}`; compmusic page: "openly available for non-commercial research purposes under the Attribution-NonCommercial-NonDerivs 3.0 Creative Commons license" | https://zenodo.org/records/1287656 | **EXCLUDED** (NC+ND; D-SSM-30 precedent) |
| **Turkish şarkı vocal dataset** (MTG-UPF) | TR | Makam şarkı, 12 performances, lyric-phrase aligned | Zenodo API: `{"id": "cc-by-nc-nd-4.0"}` | https://zenodo.org/records/1283350 | **EXCLUDED** (NC+ND) |
| **Turkish Makam Audio-Score Alignment Dataset** | TR | Makam | Zenodo page: "Creative Commons Attribution 4.0 International" — but content is "the annotations and the scores" only | https://zenodo.org/records/1284501 | **EXCLUDED** (no vocal audio — nothing to measure PER on) |
| **alibayram/jeji-turku + feji-first-finetune** (HF, 2026) | TR | Turkish folk (türkü) | HF API: jeji-turku HTTP 401, page 404; feji: `license:other`, gated:manual; card: "Source-rights, redistribution rights, and downstream commercial-use permissions should be verified before public or commercial use"; audio carries `youtube_id` provenance | https://huggingface.co/datasets/alibayram/feji-first-finetune | **EXCLUDED** (YouTube-ripped audio; no lawful commercial grant; licence page unreadable this session `[PARTIAL]`) |
| **NUS-48E** (NUS, 2013) | EN | Pop/ballad (20 unique songs), phone-level annotations | No open licence found: Zenodo re-upload 19595152 licence `None`; OpenDataLab mirror: academic-use-only card (aggregator, discovery-grade) | https://smcnus.comp.nus.edu.sg/archive/pdf/2012-2013/2013_05-Pub-NUS-48E.pdf | **EXCLUDED** (no commercial grant on any primary surface found; `[single-source]` absence) |
| **VocalSet** (Northwestern, 2018) | EN (3 fixed songs + vowels) | Vocal techniques on vowels/scales/arpeggios | Zenodo API: `{"id": "cc-by-4.0"}`; paper: "Licensed under a Creative Commons Attribution 4.0 International License (CC BY 4.0)" | https://zenodo.org/records/1442513 | **EXCLUDED for the bar** (lawful licence, but content is vowels/technique exercises — no per-recording lyrics to score PER against) |
| **CSD Children's Song Dataset** (KAIST MAC, 2020) | EN+KO | Children's songs | Dataset page: "CSD is released under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). It is provided primarily for research purposes and it is prohibited to be used for commercial purposes." | https://zenodo.org/records/4785016 | **EXCLUDED** (NC) |
| **GTSinger** (NeurIPS 2024) | 9 languages incl. EN; NO Turkish | Multi-technique songs | Paper: "can be used under license CC BY-NC-SA 4.0 … noncommercially used" | https://huggingface.co/datasets/GTSinger/GTSinger | **EXCLUDED** (NC) |
| **M4Singer** (NeurIPS 2022) | Mandarin | Pop | Paper: "freely downloaded and noncommercially used under license CC BY-NC-SA 4.0" | https://m4singer.github.io/ | **EXCLUDED** (NC + language out of scope) |
| **OpenSinger** (ACM-MM 2021) | Mandarin | Pop | GitHub README: "All users of the dataset must follow the CC BY-NC-SA LICENSE." | https://github.com/Multi-Singer/Multi-Singer.github.io | **EXCLUDED** (NC + language) |
| **MUSDB18 lyrics extension** | EN | Pop/rock | Zenodo API: `{"id": "other-nc"}`; page: "licensed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0" | https://zenodo.org/records/3989267 | **EXCLUDED** (NC; MUSDB18 base audio itself is restricted) |
| **MedleyDB 1/2** (NYU) | EN-dominant | Multi-genre multitracks | Downloads page: "offered free of charge for non-commercial research use only … Creative Commons Attribution-NonCommercial-ShareAlike 4.0" | https://medleydb.weebly.com/downloads.html | **EXCLUDED** (NC) |
| **Saraga (CompMusic)** | Carnatic/Hindustani | Indian art music | EMR article: "share these audio recordings for research purposes under Creative Commons (CC) licenses"; article licence CC BY-NC 4.0 | https://emusicology.org/article/id/4793/ | **EXCLUDED** (NC + genre + language) |
| **DAMP / DAMP-VSEP (Smule)** | EN-dominant | Karaoke pop | Zenodo 3553059: "you will not redistribute the data … or use the datasets for any commercial purpose (i.e., no selling the data or using it in any product or company)" | https://zenodo.org/records/3553059 | **EXCLUDED** (research-only EULA) |
| **DALI v1/v2** | EN-dominant | Pop (karaoke community) | TISMIR paper: "distributed as open-source under an Academic Free License (AFL)" — annotations only, audio via YouTube links | https://transactions.ismir.net/articles/10.5334/tismir.30 | **EXCLUDED** (no audio distributed; audio provenance YouTube) |
| **JamendoLyrics MultiLang** (Spotify, ICASSP 2023) | EN 20 / FR / DE / ES | Pop/rock/indie, full mixes | Repo: lyrics+mp3 "LICENSED UNDER CREATIVE COMMONS LICENSES (see 'LicenseType' column …)"; parsed EN commercial-OK rows: `BY` x2, `BY-SA` x1 (exact tracks in capture file) | https://huggingface.co/datasets/jamendolyrics/jamendolyrics | **LAWFUL (subset)** — 3 EN songs only; below n>=5 alone, usable as supplement |
| **Dagstuhl ChoirSet** (AudioLabs/UPF, 2020) | Latin/EN choral | A cappella choral | Zenodo: "License: Creative Commons Attribution 4.0 International" | https://zenodo.org/records/3956666 | **LAWFUL licence, SCOPE-BLOCKED genre** (choral ≠ pop/ballad/cinematic; the scope_rule forbids it for this bar) |
| **Cantoría** (UPF, 2022) | Spanish, Iberian Golden Age polyphony | Early choral | Zenodo record page (dissertation-linked; NC-SA per search synthesis `[UNVERIFIED]` at record level) | https://zenodo.org/records/5878677 | **EXCLUDED** (genre + language; licence not needed for verdict) |
| **ccMixter a cappellas** (per track) | EN-dominant | Pop/folk/spoken | Per-track, e.g. "Just Dreams - Vocals" by Kara Square: "Licensed under Creative Commons Attribution (3.0)", lyrics printed on page; site: "Tracks marked CC BY allow for commercial use provided you give proper attribution" | https://ccmixter.org/files/mindmapthat/33761 | **LAWFUL (per-track pool)** — each pick must be licence-read individually; NC tracks exist on the same site |

Read date for every row: **2026-08-17**. An aggregator's claim was used for discovery only; every
verdict above rests on the dataset's own page, API record, or paper data-availability statement.

# Findings by subquestion

## A. TR verdict: NONE EXISTS → owner-commissioned recordings

Four independent search channels were exhausted (web discovery x3 queries, Zenodo REST API x4
queries with exact strings archived, Hugging Face API search x2, CompMusic/MTG primary pages): every
Turkish sung corpus with lyric references is either NC/ND-licensed, audio-free, or YouTube-sourced.
Per R18.11 this is reported as **NOT FOUND IN THE SEARCHED SCOPE** — the searched scope and queries
are in `_sources/2026-08-17-singing-corpus-licence-api-captures.txt` §13. Additionally, even the
refused Makam corpus would have been **genre scope-blocked** for the pop/ballad bar
(`bar_calibration.py` `corpus_genre` contract: "a makam bar is not a pop bar").

## B. The commissioned-recording brief for Turkish (every number sourced)

The engine's own contract (`bar_calibration.py`, read this session): **>= 5 recordings minimum**
(`minimum_recordings`), small-sample warning below the configured threshold, per-recording PER as
the sampling unit, `corpus_genre` mandatory. Statistical driver for MORE than 5: the exact
noncentral-t factor falls from **k(5)=3.4066 to k(20)=1.9260** (module docstring, report F2) — at
n=5 the bar sits ~1.77x further from the mean, i.e. a needlessly loose gate. Literature-grounded
brief:

1. **Singers: >= 4 (2 female, 2 male), 10–12 recordings total, 2–3 songs each.** Precedents:
   NUS-48E used 12 subjects x 4 songs with every song covered by >= 1 male and >= 1 female
   [FULL, APSIPA 2013]; LM-SSD proved 4 singers x 12 songs sufficient for a published
   lyrics-transcription evaluation corpus [FULL, TISMIR 166, 2024]; vocadito's 40 tracks/29 singers
   is the small-eval-set precedent [FULL, arXiv 2110.05580].
2. **Material: Turkish-language pop/ballad songs, 2–3 min each,** matching the engine's generation
   genre (scope_rule). Commission the compositions as work-for-hire or use owner-written lyrics —
   this removes the cover-composition problem LM-SSD documents on its own licence page.
3. **Recording conditions** (NUS-48E protocol [FULL], upgraded by GTSinger's spec [FULL]):
   sound-proof or acoustically treated room (NUS: STC 50+ studio); large-diaphragm condenser with
   pop filter (NUS: Audio-Technica AT4050); a cappella with tempo/guide via HEADPHONES only (zero
   bleed into the vocal track); lyrics sheet on a stand at the mic; **48 kHz / 24-bit WAV**
   (GTSinger's spec; NUS's 44.1/16 is the floor); singer transcription rule from vocadito: the
   reference lyrics are corrected to what was ACTUALLY sung, by a fluent Turkish speaker.
4. **Consent/contract** (GTSinger appendix [FULL]): formal contracts; GTSinger's measured market
   rate for professional singers was **$300/hour of recorded audio** (2024, China; a cost DATUM,
   not a quote for Turkey — Berk's approval required before any spend, D-SSM-30/Clause 22).
5. **Admissibility rule restated:** the engine's own Lyria outputs remain INADMISSIBLE as
   calibration input; commissioned HUMAN recordings are exactly what the tolerance-limit procedure
   defines as the population.

## C. EN verdict: LAWFUL CANDIDATES NAMED

Primary: **vocadito** (17 EN solo-vocal tracks with per-track lyrics, CC BY 4.0, 58.5 MB single
zip — smallest lawful set that alone satisfies n>=5) and **LM-SSD** (72 takes / 12 pop songs with
clean close-up vocal stems + per-song as-sung lyrics, CC BY 4.0, 5.9 GB). Recommended: calibrate
the EN bar on vocadito-EN + LM-SSD solo-vocal CM tracks (crosstalk-free C0 takes exist by the
naming scheme), report genre honestly as "pop/solo-vocal mixed". Supplement if needed: the 3
commercial-OK JamendoLyrics EN songs and hand-picked ccMixter CC BY a cappellas. VocalSet is
lawful but lyric-free — unusable for a PER gate; Dagstuhl ChoirSet is lawful but genre-blocked.

## D. Google-hosted preference (D-SSM-24 tiebreak)

No Google-hosted (TFDS/Google Research release) singing corpus with per-recording lyrics surfaced
in any sweep this session; TFDS's music datasets (NSynth, Groove, Maestro class) are instrumental.
The tiebreak therefore never activates. `[NOT FOUND IN THE SEARCHED SCOPE]`

# Source register and read-status counts

**31 independent authoritative sources / provenance families consulted; 9 academic; 7 academic
primaries archived and read [FULL]** (files under `docs/research/_sources/2026-08-17-*`):

Academic [FULL], archived: 1) LM-SSD TISMIR 10.5334/tismir.166 (2024) · 2) vocadito arXiv
2110.05580 (2021) · 3) VocalSet ISMIR 2018 · 4) GTSinger NeurIPS 2024 · 5) M4Singer NeurIPS 2022 ·
6) NUS-48E APSIPA 2013 · 7) DALI TISMIR 10.5334/tismir.30 (2019). Academic [ABS]: 8) CSD ISMIR-LBD
2020 · 9) Saraga EMR 2021 (page archived). Non-academic primaries (each read this session, licence
JSON/page text archived in the API-captures file): Zenodo records 20287765, 5578807, 1287656,
1283350, 1284501, 1442513, 3989267, 4785016, 3553059, 3956666, 5878677, 19595152 · compmusic.upf.edu
makam-acapella page · AudioLabs LM-SVR page · medleydb.weebly.com · m4singer.github.io · GitHub
Multi-Singer README · GitHub MTG makam-acapella · HF jamendolyrics (CSV raw) · HF API
(alibayram x2, GTSinger) · KAIST MAC lab page · ccMixter (2 track pages + about) · mirdata vocadito
docs · OpenDataLab NUS-48E card (aggregator, discovery-grade only). Local primaries:
`bar_calibration.py` · preflight JSON · covenant SKILL.md.

# Claim cross-verification ledger (load-bearing claims, >= 3 independent sources)

| # | Claim | Sources (>=3, independent) | Status |
|---|---|---|---|
| C1 | LM-SSD recordings are CC BY 4.0 | Zenodo API licence id · AudioLabs page licence sentence · TISMIR 166 paper data statement | VERIFIED |
| C2 | vocadito is CC BY 4.0 with per-track lyrics, 17 EN tracks | Zenodo API · arXiv 2110.05580 [FULL] (licence + Fig. 1 language counts) · mirdata LICENSE_INFO | VERIFIED |
| C3 | Turkish Makam Acapella is NC+ND (refused) | Zenodo API `cc-by-nc-nd-4.0` · compmusic page BY-NC-ND string · D-SSM-30 decision record (local) | VERIFIED |
| C4 | No lawful TR sung+lyrics corpus exists in the searched scope | Zenodo API sweeps (4 queries) · web discovery (3 queries) · HF API search + gated/other alibayram records | NOT FOUND IN THE SEARCHED SCOPE (absence claim, R18.11-bounded) |
| C5 | CSD prohibits commercial use | Zenodo 4785016 page licence paragraph · zenodo 4916302 duplicate record · KAIST lab page + vendor teardown (corroborating) | VERIFIED |
| C6 | GTSinger/M4Singer/OpenSinger/MedleyDB/Saraga/DAMP are all non-commercial | Each one's own primary (paper licence clause, README, downloads page, EULA text) — 6 independent primaries | VERIFIED per item |
| C7 | JamendoLyrics carries exactly 3 commercial-OK EN songs (BYx2, BY-SAx1) | The dataset's own JamendoLyrics.csv (parsed, archived) · repo licence note · Jamendo per-track pages (URLs recorded, not fetched) | VERIFIED at CSV level; per-track page confirmation pending `[PARTIAL]` |
| C8 | NUS-48E recording protocol (STC 50+ studio, AT4050+pop filter, 44.1 kHz/16-bit, headphone metronome, a cappella) | APSIPA 2013 paper [FULL] — single primary | [single-source official] (the corpus's own paper is the unique authority) |
| C9 | Commissioned-brief floor n>=5, and k(5)=3.4066 vs k(20)=1.9260 | bar_calibration.py (read this session) · its provenance report F2 · NIST worked-example cross-check quoted in the module | VERIFIED (local evidence chain) |

# Contradiction ledger

1. **CSD paper-notice vs dataset licence:** ISMIR-LBD 2020 abstract carries a CC BY 4.0 notice (the
   PAPER's licence); the dataset page says CC BY-NC-SA 4.0. Resolved: the dataset page governs the
   data. Preserved because an agent reading only the paper would wrongly classify CSD as lawful.
2. **Makam Acapella licence version:** compmusic page says BY-NC-ND **3.0-es**; Zenodo API says
   **cc-by-nc-nd-4.0**. Both NC+ND — verdict identical; version conflict preserved.
3. **jeji-turku `commercial_use: true` vs provenance:** the HF card self-declares commercial rights
   while every row carries a `youtube_id`; HF API returns 401 and the page 404s this session. The
   self-declaration cannot override YouTube-sourced audio provenance; treated as EXCLUDED.
4. **MUSDB18-lyrics licence field vs page text:** Zenodo API licence id `other-nc` while the page
   body quotes CC BY-NC-SA 4.0 — consistent in effect (both NC), divergent in metadata.
5. **Covenant hash:** dispatch brief's `69d557a1…` vs recomputed `07727f0a…` (all 4 installed
   copies, 15 normalizations). Not resolvable from this side; the parent should recompute and state
   its extraction convention.

# Honest limits

- Jamendo per-track licences were verified from the dataset's own CSV, not from each jamendo.com
  track page (3 URLs recorded for the parent's re-verification).
- LM-SSD lyric files are per-song "as sung" transcripts (Zenodo page) — line-level, not
  time-aligned; sufficient for the PER gate's reference-text input, stated so nobody expects
  TextGrids.
- vocadito EN tracks are short excerpts by amateur-to-trained volunteers on varied devices — the
  honest genre label for a bar calibrated on it is "solo-vocal mixed", not "studio pop".
- The ccMixter pool was verified on 2 sample tracks + the site policy page, not exhaustively.
- `jeji-turku` could not be read at all this session (401/404) — `[PARTIAL]`; if Berk can obtain
  written rights from its author (audio re-recorded rather than YouTube-ripped), TR could unblock
  without a studio session; treated as non-existent for today's verdict.
- No dataset was downloaded ($0, licence pages and papers only) — the download decision is the
  parent's, per the brief.
