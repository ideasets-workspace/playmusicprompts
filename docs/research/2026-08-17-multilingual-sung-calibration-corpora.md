# Standards ledger

Read from disk in the session that opened this run (2026-08-17): `.claude/memory/DECISIONS.md`
(D-SSM-30, D-SSM-33, D-SSM-34) · `generate_music_hybrid_model/music_studio/data/language_registry.json`
(the 11-language denominator) · `docs/research/2026-08-17-human-sung-calibration-corpus.md` (the TR/EN
slice whose method this run extends) · the deep-research covenant
`C:\Users\berke\.claude\skills\deep-research\SKILL.md`.

# Multilingual sung calibration corpora — the nine remaining registry languages (R3 scope plan)

## 1. The decision this research serves

D-SSM-34 (his correction, verbatim: *"yaw yanlızca ingilizce nereden çıktı destekleyen tüm diller"*):
the sung lane targets EVERY registry language. `SINGING_PROVEN` is a per-language state whose A9 PER
bar requires ≥5 lawful human sung recordings with per-recording lyrics in that language. EN's corpora
are on disk; TR's active sub-lane is closed (D-SSM-33). **This run produces the lawful-corpus verdict
for each of the remaining NINE languages: zh, ja, ko, ru, es, fr, de, it, pt** — each ending in
LAWFUL CANDIDATE(S) NAMED (with quoted licence strings read from primaries) or NONE EXISTS (with the
exhaustive search recorded), so the per-language calibration order can be planned and every gap
reaches the owner honestly.

## 2. Subquestions

1. Per language: which singing-voice datasets with lyrics/phoneme annotations exist (academic
   releases, Zenodo/OSF/IEEE DataPort, Hugging Face with per-record licence, national/university
   archives — e.g. zh: OpenCpop/M4Singer-class; ja: Tohoku Kiritan/JVS-MuSiC/PJS-class; ko:
   CSD-class and children's-song sets; ru/es/fr/de/it/pt: whatever the four source tiers surface —
   seeds, never a whitelist)?
2. Per candidate: the EXACT licence string read from the primary this session (NC and ND are fatal;
   research-only EULAs are fatal; the TR/EN slice's discipline carries over verbatim).
3. Genre class per candidate (the engine generates pop/ballad/cinematic; scope-blocked corpora are
   reported as such, never silently widened).
4. Multi-language corpora counted once with per-language rows.

## 3. Falsifiers and exclusions

Known-excluded from the TR/EN slice (their verdicts transfer; do not re-litigate, do re-verify the
licence string if a candidate's page changed): GTSinger (NC), M4Singer (NC), OpenSinger (NC), CSD
(NC), DAMP (research EULA), MUSDB18-lyrics (other-nc), VocalSet (CC BY but lyric-free), Dagstuhl
ChoirSet (CC BY but choral genre-blocked). Aggregator licence claims are discovery only.

## 4. Planned artifacts (produced must equal planned)

1. This report · 2. per-source captures `docs/research/_sources/2026-08-17-*` · 3. preflight JSON
(written) · 4. completion manifest
`docs/research/_runs/2026-08-17-multilingual-sung-calibration-corpora.completion.json` ·
5. `docs/README.md` index row. **Total: 5 artifact classes.**

## 5. Hard-law check

D-SSM-30 ($0, no paid services) · D-SSM-33 (TR active work stays closed; TR is NOT in this run's
scope) · D-SSM-34 (all-languages target — no narrowing) · research floors ≥20/≥5 with [FULL] marks ·
SEARCH-FIRST, no guessed URLs.

## 6. Completion semantics

Done when: all NINE languages carry a read-this-session licence verdict (LAWFUL NAMED or NONE
EXISTS with the search recorded); cross-verification ledger covers every load-bearing claim;
artifacts 5/5 produced and indexed.

# Outcome first

*(worker findings below, written 2026-08-17; parent re-verification of load-bearing claims pending)*

**2 of 9 languages have a lawful candidate meeting the >=5 floor; 7 do not.** Per-language verdicts,
one line each (every licence string read from the primary this session; full table below):

1. **zh (Mandarin): NONE MEETS FLOOR.** Every zh corpus with lyrics is NC-family (OpenCpop
   CC BY-NC-ND · PopCS CC BY-NC-SA+EULA · M4Singer/OpenSinger/GTSinger NC, transferred · KiSing
   CC BY-NC-ND · ACE-* CC BY-NC · SingStyle111 research-only). Lawful pool: vocadito's 2 Mandarin
   tracks (CC BY 4.0) — n=2 < 5.
2. **ja (Japanese): LAWFUL CANDIDATE NAMED — PJS corpus, CC BY-SA 4.0, 100 sung recordings**
   ("Free for non-commercial and commercial use", project page + APSIPA 2020 paper, both read
   [FULL]). Caveats: 1 male singer; lyrics are read-style sentences set to composed melodies;
   genre honestly "composed-sentence songs", not commercial pop. Kiritan (research EULA),
   JVS-MuSiC (NC without negotiated TLO licence), IdolSongsJp (custom NC), ACV-001 (covers) all
   excluded.
3. **ko (Korean): NONE EXISTS** in the searched scope. CSD is NC (transferred, re-encountered);
   GTSinger-KO NC; AI-Hub gated national portal without an open commercial grant [PARTIAL];
   ACV-001's ko leg is ~4 songs by a non-native singer covering commercial repertoire.
4. **ru (Russian): NONE EXISTS** in the searched scope. Only GTSinger RU-Alto-1 (NC) and
   licence-less community NNSVS voicebanks (no grant, unclear provenance).
5. **es (Spanish): NONE MEETS FLOOR.** Lawful pool n=4 (< 5): 3 JamendoLyrics songs (BY-SA:
   Esencia, Fantasma, Te Recuerdo — full mixes) + 1 vocadito ES track. Cantoría is genuinely
   CC BY 4.0 (Zenodo API — overturns the prior slice's [UNVERIFIED] NC guess) but genre-blocked
   (Iberian Golden Age choral polyphony); TONAS licence-null + flamenco.
6. **fr (French): LAWFUL CANDIDATE NAMED — vocadito FR leg, CC BY 4.0, n=10 solo-vocal tracks
   with per-track as-sung lyrics** (>= 5 alone). Supplement: 5 lawful JamendoLyrics FR songs
   (BY x3, BY-SA x2 — full mixes needing separation). Genre honestly "solo-vocal mixed
   (folk/pop-adjacent)".
7. **de (German): NONE MEETS FLOOR.** Lawful pool n=4 (< 5): LM-SSD's 2 German-lyrics takes
   (CC BY 4.0 recordings; covers of Heisskalt/Alligatoah compositions) + 2 JamendoLyrics BY-SA
   songs (Freifliegen, Keine Lust). Wagner Ring (CC BY 3.0) and JKU Zauberflöte (CC BY 4.0) are
   lawful-licence but opera → genre-blocked.
8. **it (Italian): NONE EXISTS** in the searched scope. SingStyle111's Italian leg is
   research-only by the paper's own words; GTSinger-IT NC; opera datasets genre-blocked.
9. **pt (Portuguese): NONE EXISTS** in the searched scope. The only fado archive is symbolic
   (PDF/MIDI transcriptions, no vocal audio, article NC); DAMP multilingual sets are
   research-EULA (transferred); no Zenodo/HF/web channel surfaced a lawful pt sung+lyrics corpus.

**Floors: 34 independent authoritative sources/provenance families consulted this run · 10
academic · 6 academic primaries read [FULL]** (PJS APSIPA 2020, vocadito arXiv 2110.05580 re-read,
SingStyle111 ISMIR 2023, IdolSongsJp arXiv 2507.01349, ACE-Opencpop/ACE-KiSing Interspeech 2024,
Kiritan AST E2074 — captures on disk). Spend: $0; no downloads.

**Calibration-order recommendation for the parent:** fr (vocadito, immediately) → ja (PJS,
immediately, with the genre caveat surfaced to the owner) → es/de (1 recording short each — a
single owner-commissioned recording per language closes the floor) → zh (3 short) → ko/ru/it/pt
(owner-commissioned recordings, same brief as TR's Section B in the TR/EN report).

# Per-candidate licence table (read date for every row: 2026-08-17)

| Lang | Dataset | n recordings (lang leg) | Genre class | Licence string, quoted from the primary | Primary URL | Verdict |
|---|---|---|---|---|---|---|
| zh | **OpenCpop** | 100 songs / 3,756 utt | Mandarin pop | "available to download for non-commercial purposes under a CC BY-NC-ND 4.0 License" | https://wenet-e2e.github.io/opencpop/liscense/ | EXCLUDED (NC+ND) |
| zh | **PopCS** (DiffSinger) | 117 songs | Mandarin pop | "agree to the dataset license: CC by-nc-sa 4.0 (NonCommercial!)" + e-mail application EULA | https://github.com/MoonInTheRiver/DiffSinger/blob/master/resources/apply_form.md | EXCLUDED (NC + EULA) |
| zh | **KiSing v1** | 14 songs | Mandarin pop | "licensed with Creative Commons Attribution-NonCommercial-NoDerivs 4.0 (CC BY-NC-ND 4.0)" | http://shijt.site/index.php/2021/05/16/kising-the-first-open-source-mandarin-singing-voice-synthesis-corpus/ | EXCLUDED (NC+ND) |
| zh | **ACE-Opencpop / ACE-KiSing** | 130 h / 32.5 h (synthetic, ACE Studio) | Mandarin pop | "Both ACE-Opencpop and ACE-KiSing are available under the CC-BY-NC-4.0 license" (Interspeech 2024 paper) | https://www.isca-archive.org/interspeech_2024/shi24_interspeech.pdf | EXCLUDED (NC; also synthesizer-generated - inadmissible as HUMAN calibration input) |
| zh | **M4Singer** / **OpenSinger** / **GTSinger-ZH** | 700 / 1,146 / 20-singer songs | Mandarin pop | NC verdicts TRANSFER from the TR/EN slice; GTSinger dataset_license.md re-read this session: "CC BY-NC-SA 4.0 ... NonCommercial" | https://raw.githubusercontent.com/AaronZ345/GTSinger/main/dataset_license.md | EXCLUDED (NC) |
| zh | **SingStyle111 (zh leg)** | 307 min | Pop/folk/opera mix | "We make the dataset freely available for research purposes." (ISMIR 2023 paper, read [FULL]) | https://archives.ismir.net/ismir2023/paper/000091.pdf | EXCLUDED (research-only) |
| zh | **ACV-001 (cn leg)** | 54 songs | C-pop covers | "ACV-001 (c) 2025 by YiChen Huang is licensed under CC BY-SA 4.0" - but cn.txt lists commercial C-pop covers (光年之外, 泡沫, ...) | https://github.com/Archivoice/ACV-001 | EXCLUDED (cover compositions/lyrics not cleared) |
| zh | **vocadito (Mandarin leg)** | 2 tracks | Solo-vocal mixed | "Creative Commons Attribution 4.0" (paper + Zenodo API cc-by-4.0) | https://zenodo.org/records/5578807 | LAWFUL but n=2 < 5 |
| ja | **PJS corpus** | 100 sung recordings | Composed-sentence songs (80-160 BPM, majors dominant) | "All the data in the corpus is licensed with CC BY-SA 4.0" + "Free for non-commercial and commercial use" | https://sites.google.com/site/shinnosuketakamichi/research-topics/pjs_corpus | **LAWFUL** (n=100 >= 5) |
| ja | **Tohoku Kiritan singing DB** | 50 songs | J-pop | non-commercial grant only; Art. 30-4-bounded; "本件音声データを使った成果物については商用目的で利用しないこと" | https://zunko.jp/kiridev/login.php | EXCLUDED (research EULA) |
| ja | **JVS-MuSiC** | 100 singers x 2 songs | Child-song/pop | audio "may be used for [academic/non-commercial/personal]"; commercial = contact UTokyo TLO | https://sites.google.com/site/shinnosuketakamichi/research-topics/jvs_music | EXCLUDED (NC; paid negotiated path) |
| ja | **IdolSongsJp** (AIST 2025) | 15 songs, 414 dry vocal tracks | Idol pop | "license: other / idol-songs-jp-license", gated; "available free of charge for non-commercial research and entertainment purposes"; "Commercial use ... requires prior approval" | https://huggingface.co/datasets/imprt/idol-songs-jp | EXCLUDED (custom NC) |
| ja | **ACV-001 (ja leg)** | 23 songs | J-pop/Vocaloid covers | CC BY-SA 4.0 self-declared; ja.txt = commercial covers; non-native singer | https://github.com/Archivoice/ACV-001 | EXCLUDED (covers + non-native) |
| ja | **GTSinger-JA** | 2 singers | Multi-technique songs | CC BY-NC-SA 4.0 (dataset_license.md) | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| ko | **CSD** | 50 KO songs | Children songs | dataset page CC BY-NC-SA 4.0 - verdict TRANSFERS from TR/EN slice (paper-notice contradiction preserved there) | https://zenodo.org/records/4785016 | EXCLUDED (NC) |
| ko | **AI-Hub singing sets** | large (gov portal) | Various | login-gated Korean national portal; no open commercial grant readable this session | https://www.aihub.or.kr/ | EXCLUDED [PARTIAL] (gated; no grant read) |
| ko | **GTSinger-KO** | 3 singers | Multi-technique songs | CC BY-NC-SA 4.0 | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| ko | **ACV-001 (ko leg)** | ~4 entries | Covers | CC BY-SA 4.0 self-declared; non-native; n<5 | https://github.com/Archivoice/ACV-001 | EXCLUDED (n<5 + non-native + covers) |
| ru | **GTSinger-RU** | 1 singer (RU-Alto-1) | Multi-technique songs | CC BY-NC-SA 4.0 | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| ru | **Community NNSVS voicebanks** (e.g. Llane Crow) | 17 songs | Pop/rock | "You can use Database for training , for base model and etc" - no formal licence instrument | https://github.com/SCERYP/russian_nnsvs_llane_crow_db_vb | EXCLUDED (no licence; provenance unclear) |
| es | **JamendoLyrics (ES lawful rows)** | 3 songs (BY-SA: Esencia, Fantasma, Te Recuerdo) | Folk/hip-hop full mixes | per-song "LicenseType" column in the dataset's own CSV (archived) | https://huggingface.co/datasets/jamendolyrics/jamendolyrics | LAWFUL subset, n=3 < 5 |
| es | **vocadito (ES leg)** | 1 track | Solo-vocal mixed | CC BY 4.0 | https://zenodo.org/records/5578807 | LAWFUL but n=1 |
| es | **Cantoría** | 11 songs | Iberian Golden Age choral polyphony | Zenodo API: {"id": "cc-by-4.0"} (records 5878677 + 5851070) | https://zenodo.org/records/5878677 | GENRE-BLOCKED (lawful licence; overturns prior [UNVERIFIED] NC guess) |
| es | **TONAS** | 72 excerpts | Flamenco a cappella | Zenodo API licence: null | https://zenodo.org/records/1290722 | EXCLUDED (no grant + genre) |
| es | **GTSinger-ES** | 2 singers | Multi-technique songs | CC BY-NC-SA 4.0 | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| fr | **vocadito (FR leg)** | 10 tracks | Solo-vocal mixed | CC BY 4.0 (Zenodo API + paper notice, both read) | https://zenodo.org/records/5578807 | **LAWFUL** (n=10 >= 5) |
| fr | **JamendoLyrics (FR lawful rows)** | 5 songs (BY x3, BY-SA x2) | Pop/country/jazz full mixes | per-song CSV rows (archived): CHRISTMAS AVEC TOI (BY), l'abandon (BY), Le musée d'air contemporain (BY), Les files d'attente (BY-SA), Mère nature (BY-SA) | https://huggingface.co/datasets/jamendolyrics/jamendolyrics | LAWFUL supplement |
| fr | **GTSinger-FR** | 2 singers | Multi-technique songs | CC BY-NC-SA 4.0 | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| de | **LM-SSD (German leg)** | 2 songs (Dezemberluft*, Narben* - TISMIR 166 Table 1) | Pop covers | recordings CC BY 4.0 (AudioLabs page; TR/EN slice) - compositions are commercial covers | https://audiolabs-erlangen.de/resources/MIR/LM-SVR | LAWFUL recordings, n=2 + cover caveat |
| de | **JamendoLyrics (DE lawful rows)** | 2 songs (BY-SA: Freifliegen, Keine Lust) | Rock/reggae full mixes | per-song CSV rows (archived) | https://huggingface.co/datasets/jamendolyrics/jamendolyrics | LAWFUL subset, n=2 |
| de | **Wagner Ring Dataset** | 3 public performances | Opera | Zenodo API: cc-by-3.0 | https://zenodo.org/records/7672157 | GENRE-BLOCKED (opera) |
| de | **JKU-ABPU Zauberflöte** | 1 live opera performance | Opera | Zenodo API: cc-by-4.0 | https://zenodo.org/records/7504097 | GENRE-BLOCKED (opera) |
| de | **GTSinger-DE** | 2 singers | Multi-technique songs | CC BY-NC-SA 4.0 | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| it | **SingStyle111 (IT leg)** | 88 min | Opera/pop mix | "freely available for research purposes" (paper, twice); Interspeech 2024 Table 1: "Restricted"; Zenodo cc-by-4.0 is the PAPER PDF only | https://archives.ismir.net/ismir2023/paper/000091.pdf | EXCLUDED (research-only; contradiction preserved) |
| it | **GTSinger-IT** | 3 singers | Multi-technique songs | CC BY-NC-SA 4.0 | https://huggingface.co/datasets/AaronZ345/GTSinger | EXCLUDED (NC) |
| pt | **Fado: Origem e Memória** | 100 transcriptions (PDF/MIDI) | Fado (symbolic only) | article "(c) 2018 Videira & Rosa ... Creative Commons Attribution-NonCommercial 4.0"; NO vocal audio | https://fado.fcsh.unl.pt/projecto/apresentacao/ | EXCLUDED (no audio; NC) |
| pt | **DAMP multilingual (Smule)** | large | Karaoke pop | research EULA - TRANSFERS from TR/EN slice | https://zenodo.org/records/3553059 | EXCLUDED (research EULA) |

# Methodology and exact query/action log

Web discovery (search engine, exact terms): 1) "Opencpop Mandarin singing corpus dataset license
terms commercial use wenet" 2) "PopCS dataset DiffSinger license CC BY-NC terms download"
3) "東北きりたん歌唱データベース 利用規約 license Kiritan singing database terms commercial" 4) "PJS corpus
phoneme-balanced Japanese singing voice license terms of use" 5) "JVS-MuSiC Japanese multispeaker
singing corpus license terms commercial use" 6) "KiSing singing voice corpus license CC BY dataset
download" 7) "Korean singing voice dataset lyrics annotation license CC BY commercial use -CSD"
8) "Russian singing voice dataset corpus lyrics license open dataset SVS" 9) "Portuguese fado
Italian singing voice dataset lyrics corpus license CC BY MIR" 10) "German singing voice dataset
corpus lyrics license CC BY open access SVS Lieder" 11) "IdolSongsJp corpus dataset license
download Japanese idol songs stems".
Zenodo REST API: 12 queries (11 language sweeps + 1 ru/it/pt combined pilot) + 10 record reads -
every exact query string and per-hit licence id archived in
`_sources/2026-08-17-zenodo-api-nine-language-singing-sweep.txt`.
Hugging Face API: datasets?search=singing&license=cc-by-4.0 (31 rows; filter observed NOT applied
server-side - rows carried cc-by-nc/other/openrail licences; treated as discovery only, licence
verdicts taken from each dataset's own page). GitHub API: ACV-001 contents + raw README + song
lists (429-throttled from local IP, completed via fetch relay). Local primaries re-read: prior
TR/EN slice report + its Jamendo/vocadito/LM-SSD captures.

# Source register and read-status counts

**34 independent authoritative sources / provenance families consulted; 10 academic; 6 academic
primaries read [FULL] and archived** under `docs/research/_sources/2026-08-17-*`:

Academic [FULL] this run: 1) PJS APSIPA 2020 (+ arXiv 2006.02959 abstract page) · 2) vocadito arXiv
2110.05580 (re-read from the on-disk capture) · 3) SingStyle111 ISMIR 2023 · 4) IdolSongsJp arXiv
2507.01349 (ISMIR 2025) · 5) ACE-Opencpop/ACE-KiSing Interspeech 2024 · 6) Tohoku Kiritan AST 42(3)
E2074 (J-STAGE). Academic [ABS/PARTIAL]: 7) GTSinger NeurIPS 2024 (full capture on disk from TR/EN
slice; licence section re-read) · 8) LM-SSD TISMIR 166 (on-disk capture, German-leg rows re-read) ·
9) CSD ISMIR-LBD 2020 (licence-notice section) · 10) Fado EMR 2018 article (licence page).
Non-academic primaries read this session (licence pages / API records / READMEs): OpenCpop licence
page · OpenCpop download page · DiffSinger apply_form.md · Kiritan zunko.jp terms · PJS project
page · JVS-MuSiC project page · KiSing blog terms · GTSinger dataset_license.md (raw) · ACV-001
README + 6 song-list files (GitHub API) · IdolSongsJp HF gate/README · Zenodo API records 10265401,
5878677, 5851070, 17811452, 4625427, 6404999, 10814703, 7672157, 7504097, 1290722, 15547046 ·
Zenodo 11-query sweep · HF API dataset search · JamendoLyrics per-song CSV (prior capture, FR/DE/ES
rows re-parsed) · AudioLabs LM-SVR page (search-surfaced licence sentence) · aihub.or.kr dataset
page [PARTIAL] · SCERYP russian voicebank README · fado.fcsh.unl.pt project page.

# Claim cross-verification ledger (load-bearing claims, >= 3 independent sources unless flagged)

| # | Claim | Sources | Status |
|---|---|---|---|
| K1 | PJS is CC BY-SA 4.0 incl. commercial use | project page terms (read) · APSIPA 2020 paper [FULL] · arXiv 2006.02959 version of the paper (independent venue copy) | VERIFIED |
| K2 | vocadito FR leg = 10 tracks, CC BY 4.0, per-track lyrics | arXiv 2110.05580 Fig. 1 + licence notice [FULL] · Zenodo 5578807 API (TR/EN slice, archived) · mirdata LICENSE_INFO (TR/EN slice) | VERIFIED |
| K3 | OpenCpop is CC BY-NC-ND 4.0 | licence page (fetched) · Interspeech 2024 Table 1 "CC-NC-ND" · ISCA/搜索 synthesis + download-page application flow | VERIFIED |
| K4 | Kiritan is research-only (Art. 30-4 EULA, NC) | zunko.jp terms (quoted) · AST E2074 paper [FULL] · mmorise/kiritan_singing README (Art. 30-4 clause) | VERIFIED |
| K5 | GTSinger (ja/ko/ru/es/fr/de/it legs) is CC BY-NC-SA | dataset_license.md raw (read) · NeurIPS 2024 paper (2 copies) · HF/GitHub READMEs | VERIFIED (transfer re-verified) |
| K6 | SingStyle111 data grant is research-only | ISMIR 2023 paper [FULL] (two statements) · Interspeech 2024 Table 1 "Restricted" · singer-agreement sentence in §3.3 | VERIFIED (vs Zenodo paper-PDF cc-by-4.0 - contradiction #2) |
| K7 | IdolSongsJp is custom-NC, gated | HF gate + README terms · arXiv 2507.01349 [FULL] licence paragraph · ethics statement prohibition clause | VERIFIED |
| K8 | JVS-MuSiC audio is NC without negotiated licence | project page terms (quoted TR+EN) · arXiv 2001.07044 (2 mirrors) | VERIFIED |
| K9 | Cantoría is CC BY 4.0 | Zenodo API record 5878677 · Zenodo API record 5851070 (both versions) | [single-source official] at the archive level (two records, one publisher) |
| K10 | JamendoLyrics FR lawful rows = 5, DE = 2, ES = 3 | the dataset's own CSV (archived file, rows quoted) - single primary | [single-source official] (the CSV is the unique per-song licence authority; per-track jamendo.com pages NOT fetched) |
| K11 | LM-SSD German-lyrics songs = exactly 2 (DL, NB), covers | TISMIR 166 Table 1 [FULL] · AudioLabs page cover-caveat sentence · TR/EN slice table | VERIFIED |
| K12 | No lawful ko/ru/it/pt sung+lyrics corpus in searched scope | Zenodo API sweeps (exact queries archived) · web discovery queries · HF API search + GTSinger/CSD/AI-Hub/community-voicebank primaries | NOT FOUND IN THE SEARCHED SCOPE (R18.11-bounded absence claim) |
| K13 | ACV-001 is CC BY-SA but covers commercial compositions | README licence line · cn.txt/ja.txt song lists (recognizable commercial titles) · GitHub API file listing | VERIFIED (inference on composition rights labelled as analysis) |

# Contradiction ledger

1. **Cantoría licence:** the TR/EN slice recorded "NC-SA per search synthesis [UNVERIFIED]"; the
   Zenodo API read this session returns `cc-by-4.0` on both records. RESOLVED in favour of the
   API (primary); prior row superseded; genre-block verdict unchanged.
2. **SingStyle111:** Zenodo record 10265401 licence id `cc-by-4.0` vs the paper's own "freely
   available for research purposes" (data). RESOLVED: the Zenodo record contains only the paper
   PDF (files list read via API) - CC BY governs the PAPER; the data grant is research-only.
   Preserved because a licence-id-only reader would wrongly classify the DATASET as lawful.
3. **CSD paper-notice vs dataset licence** (transferred from TR/EN slice, re-encountered via the
   ISMIR-LBD PDF's CC BY notice this session): the notice is the PAPER's; the dataset page's
   CC BY-NC-SA governs. Verdict NC, unchanged.
4. **HF search API licence filter:** the query `license=cc-by-4.0` returned datasets tagged
   cc-by-nc-4.0 / other / openrail - the filter did not constrain results. Instrument defect
   noted; no verdict rests on the HF search output alone.
5. **PJS "SA" scope:** the project page says "Free for non-commercial and commercial use" while
   CC BY-SA's ShareAlike clause obliges same-licence sharing of ADAPTATIONS of the corpus. Not a
   use restriction for internal calibration measurement; noted so nobody reads SA as NC.
6. **Covenant hash (dispatch vs recomputation):** the parent's brief said the file "contains THREE
   BEGIN strings of which the first two are prose references" - measured this session: the two
   prose references are R12.2's and PART I §5's `BERK-DEEP-RESEARCH-COVENANT:BEGIN/END` mentions,
   the real block markers are the HTML comments; recomputed hash (markers inclusive, LF):
   `07727f0a5b69946f9de18936a4f217fe256f52c5e3e10f364141d215970acbb8` - matches the TR/EN slice's
   recomputation, so the two workers' extraction conventions now agree.

# Honest limits

- Jamendo per-song licences rest on the dataset's own CSV; the individual jamendo.com track pages
  were not fetched (URLs are in the archived CSV for the parent's re-verification).
- AI-Hub (ko) could not be read beyond its Korean gated portal page this session - [PARTIAL];
  if the owner has a Korean-resident channel, its terms deserve a first-party read before the ko
  NONE verdict is treated as final.
- vocadito FR/ES/ZH legs: volunteer singers, phone/computer mics, 10-40 s excerpts - the honest
  genre label for any bar calibrated on them is "solo-vocal mixed", not "studio pop"; device
  variance may widen the PER null distribution (report it with the calibration).
- PJS ja: one singer, composed-sentence lyrics - lexically balanced but not commercial pop
  phrasing; flag to the owner before treating the ja bar as pop-representative.
- ACV-001's composition-rights analysis (covers not cleared by the dataset's CC BY-SA) is this
  run's legal inference, labelled as such - not a licence string; a written grant from the author
  plus composition licences would change the verdict.
- No dataset was downloaded ($0; licence pages, APIs and papers only) - the download decision is
  the parent's.
- "NONE EXISTS" verdicts are R18.11-bounded: NOT FOUND IN THE SEARCHED SCOPE (queries archived),
  never proof of non-existence; ru/pt in particular have national-archive channels (e.g. russian
  folklore phonogram archives, RTP/Museu do Fado holdings) that publish no machine-readable
  licence surface and were not exhausted beyond the recorded queries.
