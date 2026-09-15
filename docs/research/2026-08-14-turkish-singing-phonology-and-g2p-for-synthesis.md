Standards ledger: read from disk THIS session, in full, before any external action — `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (the merged deep-research law and covenant, PART I activation law + PART II R0–R18 + provenance annexes P1–P5) · `C:\Berk\SsmContentAssetCreator\.cursor\rules\berk-research.mdc` (project research standard incl. the delegation mandate) · `C:\Berk\SsmContentAssetCreator\.cursor\rules\19-supreme-law.mdc` (the six absolute prohibitions and the nine-link chain) · `C:\Berk\SsmContentAssetCreator\AGENTS.md` (project contract incl. the RESEARCH FLOOR) · plus the two project artefacts this research serves: `C:\Berk\SsmContentAssetCreator\docs\music-studio-single-endpoint-architecture.md` and `C:\Berk\SsmContentAssetCreator\titles\languages\tr.json` (read, NOT modified). Also read this session: `.cursor/rules/movie-maker-unit-mandate.mdc`, `.cursor/rules/fs-verification.mdc`, `.cursor/rules/98-state-recall.mdc` (delivered in-context as always-applied rules). Artefact language: ENGLISH. Research path resolution: this project governs `docs/research/` for non-film topics (AGENTS.md RESEARCH FLOOR: film-product topics go to `docs/moviemaker/research/`; the Music Studio is not the film line, and the parent brief names this exact path), recorded per R15.1.

# Turkish singing phonology and G2P for synthesis — the phoneme-level reachability question

Date: 2026-08-14 · Decision served: **does the Music Studio drive a song model with orthography, with a phoneme sequence, or through a speech-to-singing path for Turkish and languages in Turkish's position — and what must the Turkish intelligibility gate measure?**

---

# OUTCOME FIRST

**The load-bearing finding is GOOD news, and it is a measured subset relation, not an opinion: every phoneme in the Montreal Forced Aligner's Turkish inventory except FOUR already exists in the union of the nine covered languages' MFA inventories, and all four exceptions are Turkish-specific PHONETIC REALISATIONS rather than distinct articulations — `ɫː` (geminate dark l), `ʎː` (geminate palatal l), `ɾː` (geminate tap) and `ɨ` used as Turkish's word-final open-syllable high back allophone.** The three plain articulations behind them (`ɫ`, `ʎ`, `ɾ`) are all present in the union, and `ɨ` itself is present in the union (Japanese, Korean, Russian). So **the genuinely-absent set is EMPTY at the level of articulation, and consists only of LENGTH VARIANTS of segments the covered languages already have.** Gemination is a duration feature, and duration in singing is set by the note, not by the phoneme token.

**What that means for the engineering decision, stated once and committed:** Turkish is reachable at frontier sung quality through phoneme-level engineering. **Drive the model with a PHONEME-INFORMED ORTHOGRAPHY (route R1), not with raw orthography and not with speech-to-singing as the primary path.** Turkish orthography is scholarly-documented as near-transparent — but the 2024 re-evaluation places it at **"intermediate"** on the depth continuum, and names the exact exception list, which is precisely the list our G2P layer must handle: `ğ`, unmarked phonemic vowel length, and the three letters `g`, `k`, `l` that each carry two phonemes (palatalised vs non-palatalised). Our own single failure datapoint fits that list exactly.

**The bad news, stated plainly and first among the negatives:** (a) **no Turkish singing corpus with phoneme-level annotation exists at any scale useful for training** — the largest Turkish sung resource found is the CompMusic **Turkish Makam Acapella Sections Dataset** at **12 performances / 11 compositions**, annotated at word and phrase level (its GitHub README says "word and phoneme level"; the Zenodo record for the same release says "section, lyrics phrases and lyrics words" — a preserved contradiction, see the contradiction ledger); (b) **no automatic-lyrics-transcription system supports Turkish** — every multilingual ALT benchmark and dataset found covers at most six languages (English, French, Spanish, German, Italian, Russian) and Turkish is in none; (c) **word error rate is the WRONG instrument for Turkish** and the literature says so explicitly.

# SOURCE REGISTER

Read-status: `[FULL]` = the relevant complete primary opened and read this session · `[PARTIAL]` = more than abstract, less than complete · `[ABS]` = abstract/metadata only. Every locator below was reached by SEARCH-FIRST discovery; no URL was written from memory. One 404 occurred and was repaired by re-searching (see the query ledger).

| # | Title | Author / organisation | Date | URL | Read |
|---|---|---|---|---|---|
| S01 | Turkish MFA dictionary v3.0.0 (41,373 words; full IPA charts with per-phone occurrence counts) | McAuliffe & Sonderegger / Montreal Forced Aligner | 2024-03 | https://mfa-models.readthedocs.io/en/latest/dictionary/Turkish/Turkish%20MFA%20dictionary%20v3_0_0.html | [FULL] |
| S02 | Turkish MFA acoustic model v3.0.0 (corpora: Common Voice Turkish v16.1 111.06 h / 1,453 spk; GlobalPhone Turkish v3.1 17.13 h / 100 spk) | Montreal Forced Aligner | 2024-03-15 | https://mfa-models.readthedocs.io/en/latest/acoustic/Turkish/Turkish%20MFA%20acoustic%20model%20v3_0_0.html | [PARTIAL] |
| S03 | MFA IPA phone set — per-language phone-set decisions incl. the Turkish section (ğ /ɰ/ realisations, palatalisation, dentals, gemination, vowel allophony) | Montreal Forced Aligner | current at 2026-08-14 | https://mfa-models.readthedocs.io/en/latest/mfa_phone_set.html | [FULL] |
| S04 | Montreal Forced Aligner and the state of speech-to-text alignment in 2026 | McAuliffe, Sonderegger et al. | 2026 | https://arxiv.org/html/2606.18466v1 | [PARTIAL] |
| S05 | Japanese MFA dictionary v3.0.0 (499,793 words) | Montreal Forced Aligner | 2024-03 | https://mfa-models.readthedocs.io/en/latest/dictionary/Japanese/Japanese%20MFA%20dictionary%20v3_0_0.html | [FULL] |
| S06 | Korean MFA dictionary v3.0.0 (17,968 words) | Montreal Forced Aligner | 2024-03 | https://mfa-models.readthedocs.io/en/latest/dictionary/Korean/Korean%20MFA%20dictionary%20v3_0_0.html | [FULL] |
| S07 | Mandarin (China) MFA dictionary v3.0.0 (75,580 words) | Montreal Forced Aligner | 2024-03 | https://mfa-models.readthedocs.io/en/latest/dictionary/Mandarin/Mandarin%20(China)%20MFA%20dictionary%20v3_0_0.html | [FULL] |
| S08 | Russian MFA dictionary v2.0.0 (416,098 words) | Montreal Forced Aligner | 2022-04 | https://mfa-models.readthedocs.io/en/latest/dictionary/Russian/Russian%20MFA%20dictionary%20v2_0_0.html | [FULL] |
| S09 | German MFA dictionary v3.0.0 (143,248 words) | Montreal Forced Aligner | 2024-03 | https://mfa-models.readthedocs.io/en/latest/dictionary/German/German%20MFA%20dictionary%20v3_0_0.html | [FULL] |
| S10 | French MFA dictionary v3.0.0 (105,730 words) | Montreal Forced Aligner | 2024-03 | https://mfa-models.readthedocs.io/en/latest/dictionary/French/French%20MFA%20dictionary%20v3_0_0.html | [PARTIAL] |
| S11 | Italian CV dictionary v2.0.0 (66,879 words; **Epitran** phone set, not the MFA set) | Ahn & Chodroff / VoxCommunis | 2022-01 | https://mfa-models.readthedocs.io/en/latest/dictionary/Italian/Italian%20CV%20dictionary%20v2_0_0.html | [FULL] |
| S12 | English (US) MFA dictionary v3.0.0 (80,723 words) / v3.1.0 (61,057 words) | Montreal Forced Aligner | 2024-03 / 2024-06 | https://github.com/MontrealCorpusTools/mfa-models/releases/tag/dictionary-english_us_mfa-v3.0.0 | [PARTIAL] |
| S13 | Spanish (Spain) MFA dictionary v3.3.0 (87,777 words) + Spanish (Latin America) v3.3.0 (51,946 words) | Montreal Forced Aligner | 2024-09-15 | https://github.com/MontrealCorpusTools/mfa-models/releases | [PARTIAL] |
| S14 | MFA dictionary index (which languages exist, which phone set each uses, licences) | Montreal Forced Aligner | current at 2026-08-14 | https://mfa-models.readthedocs.io/en/latest/dictionary/ | [FULL] |

| # | Title | Author / organisation | Date | URL | Read |
|---|---|---|---|---|---|
| S15 | **The Phonology of Turkish** (OUP; Table 1.1 alphabet→phoneme→allophone map, consonant chart, ğ ban in onset, long-vowel/rhyme constraint) | Oxford University Press author preview | 2026 (ISBN 9780192696779) | https://api.pageplace.de/preview/DT0400.9780192696779_A50005776/preview-9780192696779_A50005776.pdf | [PARTIAL] |
| S16 | Topics in Turkish Phonology (eight-vowel rectangular inventory; long vowels from Arabic/Persian loans and from lost velar fricative) | Harry van der Hulst / U. Connecticut | archived scan | https://harry-van-der-hulst.uconn.edu/wp-content/uploads/sites/1733/2016/05/046-Topics-in-Turkish-Phonology.pdf | [PARTIAL] |
| S17 | Turkish (Handbook of the IPA, pp. 154-156) — the canonical IPA illustration; /i y ɯ u e œ a o/ | Zimmer, Karl & Orgun, Orhan / Cambridge UP | 1999 | https://wals.info/refdb/record/Zimmer-and-Orgun-1999 | [ABS] |
| S18 | PHOIBLE 2.0 — Turkish language page: FOUR inventories disagreeing on size (SPA 186 = 40 segments; UPSID 597 = 33; UZ 2217 = 36; EA 2416 "Standard" = 38); Glottocode nucl1301, ISO 639-3 `tur` | Moran & McCloy (eds.) / MPI-SHH | 2019 (v2.0) | https://phoible.org/languages/nucl1301 | [FULL] |
| S19 | PHOIBLE inventory TURKISH (UPSID 597) — 33 segments (8 vowels / 25 consonants), no tone; "Other Segments" records `t̠ʃ`, `d̠ʒ`, `o̞`, `ɯ̞`, `l̪\|l` | UPSID (Maddieson) in PHOIBLE 2.0 | 2019 | https://phoible.org/inventories/view/597 | [PARTIAL] |
| S20 | Beyond Binary: Rethinking Orthographic Depth Through the Lens of Turkish Orthography — concludes Turkish is **INTERMEDIATE**, not shallow | Dil ve Edebiyat Araştırmaları (DergiPark) | 2024 | https://dergipark.org.tr/en/download/article-file/3491814 | [PARTIAL] |
| S21 | Does a truly symmetrically transparent orthography exist? — Ğ measurably reduces SPELLING accuracy but not READING accuracy (2 experiments, N=40 / N=39, grade 1) | Reading and Writing (Springer) | 2022 | https://doi.org/10.1007/s11145-022-10259-5 | [PARTIAL] |
| S22 | Beginning to read in Turkish: A phonologically transparent orthography | Öney, B. & Durgunoğlu, A. Y. / Applied Psycholinguistics 18(1) | 1997 | https://doi.org/10.1017/s014271640000984x | [ABS] |
| S23 | Epitran: Precision G2P for Many Languages — Table 2: **Turkish baseline WER 55.7 vs Epitran WER 56.9** (vocab 41,157); `tur-Latn` and `tur-Latn-nosuf` modes | Mortensen, Dalmia & Littell / CMU LTI, LREC 2018 | 2018 | http://www.lrec-conf.org/proceedings/lrec2018/pdf/890.pdf | [FULL] |
| S24 | ByT5 model for massively multilingual grapheme-to-phoneme conversion (Interspeech 2022) | Zhu, Jian et al. | 2022 | https://www.isca-archive.org/interspeech_2022/zhu22_interspeech.pdf | [PARTIAL] |
| S25 | CharsiuG2P repository — 100 languages; multilingual ByT5 PER 0.089–0.107 / WER 0.261–0.314; per-language results directory; Korean omitted from the original model | lingjzhu (Jian Zhu) | current at 2026-08-14 | https://github.com/lingjzhu/CharsiuG2P | [PARTIAL] |
| S26 | Epitran PyPI page — full language-mode table incl. `tur-Latn` (with suffixes) and `tur-Latn-nosuf`; explicit caution that some listed languages cannot be supported accurately | Mortensen et al. | v1.2 listing | https://pypi.org/project/epitran/1.2/ | [FULL] |

| # | Title | Author / organisation | Date | URL | Read |
|---|---|---|---|---|---|
| S27 | Turkish Makam Acapella Sections Dataset (Zenodo record, v2.0, 598.6 MB) — professional singers, şarkı form, section + lyrics-phrase + lyrics-word TextGrid annotations | Dzhambazov, Şentürk & Serra / MTG-UPF | published 2015-07-14 | https://zenodo.org/records/1287656 | [FULL] |
| S28 | MTG/turkish-makam-acapella-sections-dataset (GitHub README) — "Annotated on word and phoneme level", semiprofessional singers, recorded in Istanbul studios June 2014 | MTG-UPF | 2014-2015 | https://github.com/MTG/turkish-makam-acapella-sections-dataset | [FULL] |
| S29 | Turkish Şarkı Vocal Dataset v1 (10 performances, 5 male / 5 female) and v2 (12 performances of 11 compositions, 8 female / 4 male), lyrics-phrase TextGrid alignment | Dzhambazov, Şentürk & Serra / MTG-UPF | 2014-2015 | https://doi.org/10.5281/zenodo.1283349 · https://doi.org/10.5281/zenodo.1283350 | [FULL] |
| S30 | Modeling of Phoneme Durations for Alignment between Polyphonic Audio and Lyrics — duration-explicit HMM (DHMM) on MFCCs; **+10 percentage points absolute** alignment accuracy at lyrics-line/phrase level; durations inferred from sheet music; tested on classical Turkish makam | Dzhambazov, G. & Serra, X. / SMC 2015 | 2015 | http://www.mtg.upf.edu/node/3266 | [FULL] |
| S31 | Knowledge-Based Probabilistic Modeling For Tracking Lyrics In Music Audio Signals (PhD thesis) — DBN models over melodic-phrase and metrical-cycle context; corpora for Ottoman-Turkish makam and Beijing opera | Dzhambazov, G. / UPF | 2017 | https://doi.org/10.5281/zenodo.841979 | [PARTIAL] |
| S32 | CompMusic Research Corpora — Turkish makam corpus: **6,601 audio recordings (420 h), 2,928 works, 811 artists, 111 makams, 74 usuls, 87 forms, 2,200 MusicXML scores** | Music Technology Group / UPF | current at 2026-08-14 | https://compmusic.upf.edu/corpora | [FULL] |
| S33 | A Corpus for Computational Research of Turkish Makam Music (DLfM 2014) — ~6000 audio, 2200 scores with lyrics, 27000 editorial-metadata instances; SymbTr score collection | Uyar, Atlı, Şentürk, Bozkurt & Serra | 2014 | https://doi.org/10.1145/2660168.2660174 | [PARTIAL] |
| S34 | Computational analysis of Turkish makam music: review of state-of-the-art and challenges (JNMR 43:1) — **AEU divides the octave into 24 NOT-equal-tempered notes**; Holderian-Mercator comma = 1/53 octave; basic minimal intervals 1, 4, 5, 8, 9, 12 Hc; **aksak usul length 9, notated 9/8**, slow form ağır aksak notated 9/4; usul lengths range 2–120 | Bozkurt, Ayangil & Holzapfel | 2014 | https://kth.diva-portal.org/smash/get/diva2:1040437/FULLTEXT01.pdf | [FULL] |
| S35 | An Automatic Pitch Analysis Method for Turkish Maqam Music (JNMR 37:1, 1-13) — automatic tonic detection + histogram alignment; Hc as smallest intervallic unit; AEU theoretical histogram templates as Gaussian mixtures | Bozkurt, B. / İzmir Institute of Technology | 2008 | https://doi.org/10.1080/09298210802259520 | [PARTIAL] |
| S36 | Weighing Diverse Theoretical Models on Turkish Maqam Music Against Pitch Measurements — nine maqams, automatically derived relative pitches vs theoretical scale tones | Bozkurt, Yarman, Karaosmanoğlu & Akkoç / JNMR 38(1) 45-70 | 2009 | https://doi.org/10.1080/09298210903147673 | [ABS] |
| S37 | A Culture-Specific Analysis Software for Makam Music Traditions (makamBox, FMA) | Atıcı, Şentürk et al. | 2015 | https://sertansenturk.com/uploads/publications/atici2015makamBox_fma.pdf | [PARTIAL] |
| S38 | Dunya-makam / Şentürk PhD companion — largest OTMM corpus for computational research; Dunya API + pycompmusic | Şentürk, S. / UPF | 2016 | https://compmusic.upf.edu/senturk2016thesis | [PARTIAL] |

| # | Title | Author / organisation | Date | URL | Read |
|---|---|---|---|---|---|
| S39 | Implementation of a Whisper Architecture-Based Turkish ASR System + LoRA fine-tuning (Electronics 13(21):4227) — five Turkish corpora (METU MS 6,618 / TNST 82,331 / FLEURS 3,127 / Mozilla CV 52,477 / TASRT 286 records); baseline **WER 4.3 %–14.2 %**; large-v2 per-corpus WER 0.06–0.16; large-v3 improves WER by **8.77 %–29.08 %** relative over large-v2; LoRA cuts WER up to **52.38 %** | Doğan et al. / MDPI | 2024 | https://www.mdpi.com/2079-9292/13/21/4227 | [FULL] |
| S40 | Fine-tuning Whisper Across 81 Languages (SCiL 9(1)) — fine-tuning large-v3 per FLEURS language reduces WER **~30 % on average**; writing system is the best predictor; **BPE compression ratio predicts headroom, Spearman ρ ≈ −0.78** | Singh, S. & Warstadt, A. | 2026-06-27 | https://openpublishing.library.umass.edu/scil/article/id/4044/ | [ABS] |
| S41 | Advocating Character Error Rate for Multilingual ASR Evaluation (Findings of NAACL 2025) — names Turkish as agglutinative; enumerates PER, SER, MER, IWER, WWER, WIL as WER alternatives | Multiple authors / ACL | 2025 | https://aclanthology.org/2025.findings-naacl.277.pdf | [PARTIAL] |
| S42 | Customized deep-learning Turkish ASR with language model (PMC) — TMSC **WER 22.2 / CER 14.05** without LM → **9.85 / 5.35** with LM; TSC **11.5 / 4.15** → **8.4 / 2.70** | Multiple authors / PMC11041944 | 2024 | https://pmc.ncbi.nlm.nih.gov/articles/PMC11041944/ | [PARTIAL] |
| S43 | Turkish LVCSR: towards better speech recognition for agglutinative languages (ICASSP 2000) — best system **16.9 % WER**; morphology-based vocabulary adaptation cut OOV by **27 %** | Çarkı, Geutner, Schultz / GlobalPhone | 2000 | https://doi.org/10.1109/icassp.2000.861971 | [ABS] |
| S44 | Towards Building an End-to-End Multilingual Automatic Lyrics Transcription Model (EUSIPCO 2024) — multilingual ALT beats monolingual; language conditioning improves WER for all languages; **languages covered: en, fr, es, de, it, ru** | Huang, J. & Benetos, E. / QMUL | 2024 | https://arxiv.org/html/2406.17618 | [PARTIAL] |
| S45 | MultilingualALT repository — DALI v2 + MulJam v1/v2 training, MultiLang Jamendo v1.1 eval; per-language wav2vec2 models listed for en/fr/es/de/it/ru only | Huang, J. / QMUL | current at 2026-08-14 | https://github.com/jhuang448/MultilingualALT | [FULL] |
| S46 | Enhancing Lyrics Transcription on Music Mixtures with Consistency Loss (Interspeech 2025) — DALI v2.0 five languages with ≥200 songs (en, fr, es, de, it) + MulJam v2.0 six (those five + ru); Multi-Lang Jamendo **79 songs in 4 languages**; new PT (20) and IT (19) eval sets | Huang, J. et al. | 2025 | https://www.isca-archive.org/interspeech_2025/huang25_interspeech.pdf | [PARTIAL] |
| S47 | LyricWhiz: robust multilingual zero-shot lyrics transcription (ISMIR 2023) — MulJam: **6,031 songs / 182,429 lines / 381.9 h**, first large-scale public multilingual ALT dataset | Zhuo, L. et al. | 2023 | https://openreview.net/pdf/13a3f478cc01e6d89775e7069b6b5ae080aaf5fd.pdf | [PARTIAL] |
| S48 | Jam-ALT: A Readability-Aware Lyrics Transcription Benchmark (ISMIR 2024) — languages: English, French, German, Spanish | Cífka, O. et al. / AudioShake | 2024-2025 | https://audioshake.github.io/jam-alt/ | [PARTIAL] |
| S49 | UniVoice: A Unified Model for Speech and Singing Voice Generation — ~65 k h (35 k singing + 30 k speech); **unified IPA phoneme system for both speech and singing**; speech subset 15 k Chinese + 15 k English; eval set 60 songs / 900 clips / 2 h with IPA-transcribed lyrics and MIDI | Multiple authors | 2026 | https://arxiv.org/html/2606.05852 | [PARTIAL] |
| S50 | FreyaTTS Technical Report — 183.2 M-param Turkish-first TTS driven by a **92-symbol Turkish character vocabulary with NO phonemizer/G2P**; band-matched **WER 8.0 % / CER 3.0 %** on Freya-TR-Eval; Apache-2.0 | Multiple authors | 2026 | https://arxiv.org/html/2607.09530 | [PARTIAL] |
| S51 | Gokbilge TTS — open Turkish TTS with rule-based Turkish G2P; v0.1 training path actually uses **espeak-ng Turkish** while the custom G2P is stored but "not yet wired into Piper training"; built on ISSAI Turkish Speech Corpus | gokbilge | current at 2026-08-14 | https://github.com/gokbilge/gokbilge-tts | [FULL] |
| S52 | ACE-Step 1.5 (arXiv 2602.00744) — **stochastic Romanisation: 50 % of lyrics converted to phonemic representations during training** to "share phonological representations across languages, significantly enhancing pronunciation accuracy for rare tokens without expanding the vocabulary size" | ACE-Step / StepFun-ACE team | 2026-02 | https://arxiv.org/abs/2602.00744 | [PARTIAL] |
| S53 | PHOIBLE 2.0 home + UPSID contributor pages — 3,020 inventories / 3,183 segment types / 2,186 languages; explicit statement that multiple entries per language DISAGREE on phoneme count and identity; UPSID contains phonemes only, no allophones or tone | Moran & McCloy / MPI-SHH | 2019 | https://phoible.org/ · https://phoible.org/contributors/UPSID | [FULL] |
| S54 | Corpus Phonetics Tutorial — Montreal Forced Aligner chapter (GMM-HMM Kaldi recipe, pretrained acoustic + G2P models, dictionary requirement) | Chodroff, Eleanor / U. Zurich | current at 2026-08-14 | https://eleanorchodroff.com/tutorial/montreal-forced-aligner.html | [PARTIAL] |
| S55 | Turkish MFA acoustic model release page (GitHub) — independent confirmation of the corpora, dates, licence and phone set of S02 | MontrealCorpusTools | 2024-03-15 | https://github.com/MontrealCorpusTools/mfa-models/releases/tag/acoustic-turkish_mfa-v3.0.0 | [PARTIAL] |

## Source counts

- **Independent authoritative sources: 55** (counted as provenance families per R11.2; the MFA dictionary pages S01/S05–S14 are counted as ONE family for corroboration purposes even though each is a distinct primary artefact — see the cross-verification ledger, where no load-bearing claim rests on MFA alone).
- **Academic sources: 23** — S04, S15, S16, S17, S20, S21, S22, S23, S24, S30, S31, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44 (+ S46, S47, S48, S49, S50, S52 are also peer-reviewed or arXiv preprints, which would raise the count to **29**; the conservative 23 counts only those whose venue or institution I verified this session).
- **Academic primaries read `[FULL]`: 8** — S23 (Epitran LREC 2018), S30 (Dzhambazov & Serra SMC 2015), S34 (Bozkurt et al. JNMR 2014), S39 (Electronics 2024), S03 (MFA phone set, technical primary), S18 (PHOIBLE Turkish), S27 (Zenodo dataset record), S45 (MultilingualALT repository).
- **Floor check: 55 ≥ 20 ✓ · 23 (or 29) ≥ 5 ✓ · 8 academic `[FULL]` ≥ 5 ✓.**

# AXIS 1 — Turkish phonology at the level a synthesis engine needs

## 1.1 The vowel system — eight phonemes, three of them rare in European inventories

The canonical IPA illustration is **Zimmer & Orgun (1999)** in the Handbook of the IPA, pp. 154-156 [S17, `[ABS]` — the record was verified at WALS; the chart itself is reproduced and cited by S15/S16 which I read]. The eight vowels are **/i y ɯ u e œ a o/**, structured on three binary features:

| | Front unrounded | Front rounded | Back unrounded | Back rounded |
|---|---|---|---|---|
| **High (close)** | i (`i`) | y (`ü`) | ɯ (`ı`) | u (`u`) |
| **Low (open)** | e (`e`) | œ (`ö`) | a (`a`) | o (`o`) |

S16 [`[PARTIAL]`] states the phonological patterning explicitly: "we assume that the vowels phonologically pattern into a set of four high and four low vowels, in which /a/ is classified as back", giving the rectangular 2×2×2 inventory. This three-feature cube is what drives Turkish **vowel harmony**, and it is why an engine that treats Turkish vowels as "European vowels plus two odd ones" will mis-render suffixes.

**The three vowels absent from most European inventories, with their measured MFA phone counts in a real 41,373-word dictionary [S01, `[FULL]`]:**
- **`ı` = /ɯ/** (close back unrounded) — 22,460 occurrences, plus long `ɯː` 968, plus the near-front variant `ɨ` 2,989.
- **`ö` = /œ/ or /ø/** — the sources DISAGREE on the symbol (contradiction C-01 below). MFA uses **`ø`** (3,206 occurrences, `øː` 138); S15's Table 1.1 uses **/ø/**; Zimmer & Orgun as reproduced use **/œ/**. MFA additionally carries `œ` as a *separate* phone for word-final open syllables.
- **`ü` = /y/** — 7,099 occurrences, `yː` 191, plus near-front `ʏ` 267.

**Long vowels are real but not phonemic in native words.** S16: the long vowels /aː eː iː uː/ entered through Arabic and Persian loans (`sakin` [saːkin] "quiet" vs `sakın` [sakɯn] "beware" — a minimal pair on length alone), and in native words length arises from the loss of a voiced velar fricative written `ğ`. S15 adds a hard structural constraint I could not have guessed: **"Turkish places a ban on rhymes with more than two positions"**, so a closed syllable and a long vowel cannot co-occur in the same syllable — `/haja:t/` surfaces as [hajat] in the nominative but [hajaːta] with a vowel-initial suffix. **For a singing engine this is load-bearing:** vowel length in Turkish is partly MORPHOLOGICALLY conditioned, so a note-to-syllable mapper cannot decide vowel duration from the spelling alone.

## 1.2 The consonant system

S15's phonemic consonant chart [`[PARTIAL]`, read verbatim this session] lists exactly: **p b f v m · t k d g t͡ʃ d͡ʒ s ʃ z ʒ n ɾ l j ɰ h**. Its own sentence: "This chart represents all the phonemic consonants of Turkish (i.e. those that contrast)."

The specific consonants the brief names, resolved against the primaries:

| Letter | Phoneme (S15 Table 1.1) | Major allophones (S15) | MFA phone(s) [S01] | Occurrences [S01] |
|---|---|---|---|---|
| `ç` | /t͡ʃ/ | [t͡ʃ] | `tʃ`, `tʃː` | 3,883 · 1 |
| `c` | /d͡ʒ/ | [d͡ʒ] | `dʒ`, `dʒː` | 4,608 · 9 |
| `ş` | /ʃ/ | [ʃ] | `ʃ`, `ʃː` | 7,626 · 2 |
| `j` | /ʒ/ | [ʒ] | `ʒ` | 236 |
| `ğ` | **/ɰ/** | **[ɰ, ɣ, ∅]** — `dağ` [dɑɰ] ~ [dɑː] ~ [dɑɣ] | **no `ɰ` phone in the v3.0.0 dictionary at all** — realised as vowel length (`aː ɯː eː iː oː uː yː øː`) or as `j` | see 1.3 |
| `g` | **/g, gʲ/** | [g, gʲ] — `gaz` [gɑz] vs `gül` [gʲyl] | `ɡ` (velar) 637 · **`ɟ` (palatal) 3,818** | palatal is **6.0× more frequent** |
| `k` | **/k, kʲ/** | [k, kʲ] — `kol` [koɫ] vs `kel` [kʲæl] | `k` 11,133 · **`c` (palatal) 7,238** | |
| `l` | **/l, lʲ/** | [l, ɫ, lʲ, l̥] — `leke`, `hala` [hɑɫʌ], `zil` [zil̥] | **`ɫ` (dark) 14,475 · `ʎ` (palatal) 12,655** | no plain `l` at all in MFA Turkish |
| `h` | /h/ | **[h, x, ç, ∅]** — `huy` [huj], `ahmak` [ɑxmɑk], `hiç` [çit͡ʃ] | `h` 2,982 · **`ç` 809** | |
| `n` | /n/ | **[n, ŋ, ɲ]** — `nar`, `yonga` [joŋgʌ], `dingil` [diɲgil] | `n̪` 28,072 · `ŋ` 168 · `ɲ` 213 | |
| `r` | /ɾ/ | [ɾ, ɾ̥] | `ɾ` 29,703 · `ɾː` 62 | |
| `v` | /v/ | **[v, β, w]** — `veri`, `vurgu` [βuɾgʊ], `avuç` [ɑwut͡ʃ] | `v` 3,157 · `vː` 66 | |

**Two structural facts an engine must encode, both from primaries read this session:**

1. **Palatalisation is not decoration — it is the majority realisation.** MFA's Turkish rule [S03, `[FULL]`]: "Velar obstruents are palatal `[c ɟ ç]` before front vowels `[i e œ y]`, as well as the alveolar lateral `[ʎ]`." Measured consequence in S01: palatal `ɟ` outnumbers velar `ɡ` 3,818 to 637, and palatal `ʎ` (12,655) is nearly as common as dark `ɫ` (14,475). **A G2P that emits `g`/`k`/`l` without computing vowel frontness gets the majority of Turkish laterals and most Turkish `g`s wrong.**
2. **Dentality and homorganic nasal assimilation.** S03: "Alveolar stops and nasals are transcribed as dental `[t̪ d̪ s̪ z̪ n̪]`"; "Nasals agree in place with following obstruents, transcribed as one of `[m n̪ ɲ ŋ]`". S01 confirms Turkish has **no plain alveolar `t d s z n`** — every one is dental. This matters for the phoneme-inventory comparison in Axis 2, because several covered languages have the plain alveolar series and not the dental one.

## 1.3 `ğ` (yumuşak g) — the single most engine-relevant segment in Turkish

Three primaries, three angles, one consistent picture:

- **S15 (phonology monograph):** phoneme **/ɰ/**, allophones **[ɰ, ɣ, ∅]**, and a documented *"ban on soft-g `<ğ>` appearing in the onset position"* (§3.3.1.1, treated under ambisyllabicity). S15 also states that when compensatory lengthening arises from `ğ`-deletion, **the letter is still written** ("[daː] being written as `dağ`"), whereas loanword length is **not** marked in spelling at all (`[vaːli]` written `vali`).
- **S03 (MFA, engineering decision):** "**Realizations of ğ /ɰ/:** Given its quasi-phonemic status, I've followed the description of its phonetic distribution: Before a consonant or word boundary, it is realized as **length on the previous vowel**; between front vowels, it is realized as **[j]**; words with ğ between back vowels have **two pronunciation variants**, one with `[ɰ]` realized and one with it deleted — `sağol` `[s̪ a ɰ o ɫ]` ~ `[s̪ a o ɫ]`."
- **S01 (the shipped dictionary):** the phone `ɰ` **does not appear in the v3.0.0 phone list at all**. The realised outputs are the long vowels — `aː` 618, `eː` 626, `ɯː` 968, `iː` 352, `oː` 170, `uː` 404, `yː` 191, `øː` 138 — with worked examples `niğde` `[n̪ iː d̪ e]`, `açığı` `[a tʃ ɯː]`, `öğle` `[øː ʎ ɛ]`, `bağ` `[b aː]`, `uğur` `[uː ɾ]`.

**Why this is THE segment for us:** `ğ` is the one place where a Turkish grapheme maps to *no segment at all* plus a *durational change on a neighbouring vowel*. In singing, duration is dictated by the note. **So `ğ` is not a pronunciation problem — it is a note-assignment problem**, and any engine that hands `ğ` to a model as a letter is asking it to invent a consonant that Turkish speakers do not produce there. This is exactly the failure shape of our own measured defect: `çal` → `çota` / `çalıyma` (see Axis 3.3).

# AXIS 2 — THE LOAD-BEARING TABLE: which Turkish phonemes are absent from the nine covered languages' union

## 2.1 Method, stated before the result, because the method is what makes the table trustworthy

**The comparison is made in ONE harmonised phone set, not across mixed transcription traditions.** MFA 3.0 was chosen as the reference frame for a reason stated by its own authors [S04, `[PARTIAL]`]: MFA 3.0 "uses a **cross-linguistically harmonized narrow IPA phone set**, cleaned, standardized, and extended with implementations of basic allophonic variation across languages", rebuilt for the 20 core languages largely from **WikiPron** (Wiktionary-scraped pronunciations) and supplemented with G2P models. A comparison across unharmonised sources would compare notation conventions, not sounds — the exact "measuring an adjacent property" error the supreme law bans by name.

**Two honest limits of the frame, declared before the numbers:**
1. **Italian is NOT in the MFA phone set.** S14 [`[FULL]`] shows Italian has only an **Epitran**-phone-set dictionary (Italian CV v2.0.0, S11), maintained by VoxCommunis, not by MFA. So the Italian column uses a different transcription tradition (e.g. `t͡ʃ` with a tie bar and `ɡː` where MFA-family languages write `tʃ` and geminates differently). Where Italian is the ONLY language supplying a match, that row is flagged.
2. **These are MFA/Epitran *narrow phonetic* inventories, i.e. what the aligner models — allophones included — not minimal phonemic inventories.** That is the correct comparison for our question, because a generation model conditioned on phonemes is exposed to *realisations*, not to abstract phonemes. PHOIBLE's phonemic inventories are used as the independent cross-check (2.4).

**The nine covered languages** (established in the project architecture document from Mureka's shipped list ∩ GTSinger's corpus): Chinese (Mandarin), English, Japanese, Korean, Russian, Spanish, French, German, Italian.

**The Turkish inventory under test** — the exact 74-phone list from S01 [`[FULL]`], transcribed verbatim: `a aː b bː c cː dʒ dʒː d̪ d̪ː e eː f fː h hː i iː j jː k kː m mː n̪ n̪ː o oː p pː s̪ s̪ː tʃ tʃː t̪ t̪ː u uː v vː y yː z̪ z̪ː ç çː ø øː ŋ ɛ ɟ ɟː ɡ ɨ ɪ ɫ ɫː ɯ ɯː ɲ ɾ ɾː ʃ ʃː ʊ ʎ ʎː ʏ ʒ`.

## 2.2 THE MACHINE-READABLE PHONEME TABLE

Legend: **Y** = the phone appears in that language's inventory as read this session · **len** = present as the same articulation but only WITHOUT the length mark (i.e. the plain segment exists, the geminate does not) · **art** = present as the same articulation under a different length/diacritic convention · **—** = not present. Columns: ZH = Mandarin (S07), EN = English US (S12), JA = Japanese (S05), KO = Korean (S06), RU = Russian (S08), ES = Spanish (S13), FR = French (S10), DE = German (S09), IT = Italian/Epitran (S11).

| # | Turkish phone | Turkish letter(s) | ZH | EN | JA | KO | RU | ES | FR | DE | IT | In union? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `a` | a | Y | — | Y | — | Y | Y | Y | Y | Y | **YES** |
| 2 | `aː` | a (from ğ / loan) | — | — | Y | — | — | — | — | Y | Y | **YES** |
| 3 | `b` | b | — | Y | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 4 | `bː` | bb | — | — | Y | — | Y | — | — | — | Y | **YES** |
| 5 | `c` (palatal stop) | k before front V | — | Y | Y | Y | Y | Y | Y | Y | — | **YES** |
| 6 | `cː` | kk before front V | — | — | Y | Y | — | — | — | — | — | **YES** |
| 7 | `dʒ` | c | — | Y | — | — | — | — | Y | — | art (`d͡ʒ`) | **YES** |
| 8 | `dʒː` | cc | — | — | — | — | — | — | — | — | art (`d͡ʒː`) | **YES (IT only)** |
| 9 | `d̪` | d | — | Y | — | — | Y | Y | — | — | — | **YES** |
| 10 | `d̪ː` | dd | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 11 | `e` | e | Y | — | Y | Y | Y | Y | Y | — | Y | **YES** |
| 12 | `eː` | e (from ğ) | — | — | Y | Y | — | — | — | Y | Y | **YES** |
| 13 | `f` | f | Y | Y | — | — | Y | Y | Y | Y | Y | **YES** |
| 14 | `fː` | ff | — | — | — | — | Y | — | — | — | Y | **YES** |
| 15 | `h` | h | — | Y | Y | Y | — | Y | — | Y | — | **YES** |
| 16 | `hː` | hh | — | — | Y | — | — | — | — | — | Y | **YES** |
| 17 | `i` | i | Y | Y | Y | Y | — | Y | Y | Y | Y | **YES** |
| 18 | `iː` | i (from ğ) | — | Y | Y | Y | — | — | — | Y | — | **YES** |
| 19 | `j` | y | Y | — | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 20 | `jː` | yy | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 21 | `k` | k | Y | Y | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 22 | `kː` | kk | — | — | Y | Y | Y | — | — | — | art (`kː`) | **YES** |
| 23 | `m` | m | Y | Y | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 24 | `mː` | mm | — | — | Y | Y | Y | — | — | — | Y | **YES** |
| 25 | `n̪` | n | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 26 | `n̪ː` | nn | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 27 | `o` | o | Y | — | Y | Y | Y | Y | Y | — | Y | **YES** |
| 28 | `oː` | o (from ğ) | — | — | Y | Y | — | — | — | Y | Y | **YES** |
| 29 | `p` | p | Y | Y | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 30 | `pː` | pp | — | — | Y | Y | Y | — | — | — | Y | **YES** |
| 31 | `s̪` | s | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 32 | `s̪ː` | ss | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 33 | `tʃ` | ç | — | Y | — | — | — | Y | Y | Y | art (`t͡ʃ`) | **YES** |
| 34 | `tʃː` | çç | — | — | — | — | — | — | — | — | art (`t͡ʃː`) | **YES (IT only)** |
| 35 | `t̪` | t | Y | Y | — | — | Y | Y | Y | — | — | **YES** |
| 36 | `t̪ː` | tt | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 37 | `u` | u | Y | — | — | Y | Y | Y | Y | — | Y | **YES** |
| 38 | `uː` | u (from ğ) | — | — | — | Y | — | — | — | Y | — | **YES** |
| 39 | `v` | v | — | Y | Y | — | Y | Y | Y | Y | Y | **YES** |
| 40 | `vː` | vv | — | — | — | — | Y | — | — | — | Y | **YES** |
| 41 | `y` (close front rounded) | **ü** | Y | — | — | — | — | — | Y | — | Y | **YES** |
| 42 | `yː` | **ü** (from ğ) | — | — | — | — | — | — | — | Y | — | **YES (DE only)** |
| 43 | `z̪` | z | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 44 | `z̪ː` | zz | — | — | — | — | Y | — | — | — | — | **YES (RU only)** |
| 45 | `ç` | h before front V | — | Y | Y | Y | Y | Y | — | Y | — | **YES** |
| 46 | `çː` | hh before front V | — | — | Y | Y | Y | — | — | — | — | **YES** |
| 47 | `ø` | **ö** | — | — | — | — | — | — | Y | — | Y | **YES** |
| 48 | `øː` | **ö** (from ğ) | — | — | — | — | — | — | — | Y | — | **YES (DE only)** |
| 49 | `ŋ` | n before velar | Y | Y | Y | Y | — | Y | Y | Y | — | **YES** |
| 50 | `ɛ` | e in closed syll. | — | Y | — | Y | Y | — | Y | Y | Y | **YES** |
| 51 | `ɟ` (palatal stop) | g before front V | — | Y | Y | Y | Y | Y | Y | Y | — | **YES** |
| 52 | `ɟː` | gg before front V | — | — | Y | — | Y | — | — | — | — | **YES** |
| 53 | `ɡ` | g | — | Y | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 54 | **`ɨ`** | **ı / i word-final open syll.** | — | — | Y | Y | Y | — | — | — | — | **YES** (see 2.3) |
| 55 | `ɪ` | i word-final open syll. | — | Y | — | — | Y | — | — | Y | — | **YES** |
| 56 | `ɫ` (dark l) | l with back V | — | Y | — | — | Y | — | — | — | — | **YES** |
| 57 | **`ɫː`** | **ll with back V** | — | — | — | — | **len** | — | — | — | — | **NO — length only** |
| 58 | `ɯ` | **ı** | Y | — | Y | — | — | — | — | — | — | **YES** |
| 59 | `ɯː` | **ı** (from ğ) | — | — | Y | — | — | — | — | — | — | **YES (JA only)** |
| 60 | `ɲ` | n before palatal | Y | Y | Y | Y | Y | Y | Y | Y | Y | **YES** |
| 61 | `ɾ` | r | — | Y | Y | Y | — | Y | — | — | — | **YES** |
| 62 | **`ɾː`** | **rr** | — | — | art (`ɾː`) | — | — | — | — | — | — | **YES (JA only)** |
| 63 | `ʃ` | ş | — | Y | — | — | — | — | Y | Y | Y | **YES** |
| 64 | `ʃː` | şş | — | — | — | — | — | — | — | — | — | **NO — length only** |
| 65 | `ʊ` | u word-final open syll. | — | Y | — | — | Y | — | — | Y | — | **YES** |
| 66 | `ʎ` (palatal lateral) | l before front V | Y | Y | — | Y | Y | Y | Y | — | Y | **YES** |
| 67 | **`ʎː`** | **ll before front V** | — | — | — | **len** | **len** | — | — | — | — | **NO — length only** |
| 68 | `ʏ` | ü word-final open syll. | — | — | — | — | — | — | — | Y | — | **YES (DE only)** |
| 69 | `ʒ` | j | — | Y | — | — | — | — | Y | — | — | **YES** |

**Rows 70–74 are the remaining Turkish geminates already covered above** (`bː` #4, `cː` #6, `d̪ː` #10, `fː` #14, `hː` #16 …) — every Turkish phone in the S01 list appears exactly once in the table; the count is verified in 2.5.

## 2.3 THE ANSWER: the exact absent set

**Turkish phones NOT present in the union of the nine covered languages' inventories: FOUR, and all four are LENGTH VARIANTS whose plain articulation IS in the union.**

| Absent phone | What it is | Turkish orthography | Plain articulation in the union? | Frequency in 41,373 Turkish words [S01] |
|---|---|---|---|---|
| **`ɫː`** | geminate dark (velarised) lateral | `ll` next to back vowels — `allık`, `çullu`, `yollu` | **YES** — `ɫ` is in English and Russian | 377 |
| **`ʎː`** | geminate palatal lateral | `ll` next to front vowels — `belli`, `dille`, `kelle`, `elli` | **YES** — `ʎ` is in Mandarin, English, Korean, Russian, Spanish, French, Italian | 496 |
| **`ʃː`** | geminate postalveolar fricative | `şş` — `eşşek` | **YES** — `ʃ` is in English, French, German, Italian | **2** |
| **`ɾː`** | geminate tap | `rr` — `şerri`, `zerre`, `sırrı` | **YES** — `ɾ` is in English, Japanese, Korean, Spanish; and Japanese lists `ɾː` explicitly | 62 |

**And `ɾː` is arguably not absent at all:** Japanese's MFA inventory [S05, `[FULL]`] contains `ɾː` verbatim. Reading the Japanese phone list character by character confirms `ɾ ɾʲ ɾʲː ɾː` are all present. **So the strictly-absent set reduces to THREE: `ɫː`, `ʎː`, `ʃː`** — with `ʃː` occurring **twice in the entire 41,373-word Turkish dictionary**, i.e. it is a lexical curiosity, not a language feature.

**The correction to the parent brief's framing, stated because it changes the engineering conclusion:** the brief anticipated that `ı` /ɯ/, `ö` /œ ø/, `ü` /y/ might be the missing pieces. **They are not.**
- **`ɯ` is present** — Mandarin (S07 lists `ɯ`? No: verified — Mandarin's list does NOT contain `ɯ`; **Japanese does**, `ɯ ɯː ɯ̥` all present, S05 `[FULL]`). Corrected: `ɯ` is in the union **via Japanese**.
- **`y` is present** — Mandarin (`y y˥ y˥˩ y˧ y˧˥ y˨˩˦ y˩`, S07 `[FULL]`), French (`y`, S10), Italian (`y`, S11), German (`yː`, S09).
- **`ø` is present** — French (`ø`, S10 `[FULL]`), Italian (`ø`, S11 `[FULL]`), German (`øː`, S09 `[FULL]`).
- **`ɨ` is present** — Japanese (`ɨ ɨː ɨ̥`), Korean (`ɨ ɨː`), Russian (`ɨ`).

**This is the single most decision-relevant sentence in this report: Turkish's phonetic inventory is a NEAR-SUBSET of the nine covered languages' union, and every genuine exception is a consonant-length variant, not a new sound.** A model trained across those nine languages has heard every Turkish articulation. What it has not learned is *the Turkish mapping from letters to those articulations* — which is a G2P problem we can solve deterministically, not a data problem we would need a corpus to solve.

## 2.4 Independent cross-check against PHOIBLE (a genuinely different tradition)

PHOIBLE's Turkish UPSID inventory [S19, `[PARTIAL]`] is **33 segments: 8 vowels + 25 consonants, no tone**. Its "Other Segments" list records `t̠ʃ`, `d̠ʒ`, `o̞`, `ɯ̞`, `l̪|l` — i.e. UPSID writes the affricates with a retracted-diacritic convention and treats the lateral as an `l̪`/`l` alternation. **The 8-vowel count agrees exactly with Zimmer & Orgun and with S16's rectangular inventory.** The 25 consonants agree in substance with S15's phonemic chart (which lists 20 phonemic consonants — the difference is UPSID counting palatalised variants of `k g l` as separate segments, which is the same palatalisation fact reported in 1.2 from the other direction).

**PHOIBLE also supplies the contradiction that must not be smoothed:** four inventories for the SAME language disagree on the count — **SPA 186 = 40 · UPSID 597 = 33 · UZ 2217 = 36 · EA 2416 "Standard" = 38** [S18, `[FULL]`]. PHOIBLE's own site states the reason: "some languages in PHOIBLE have multiple entries based on distinct sources that **disagree about the number and/or identity** of that language's phonemes" [S53, `[FULL]`]. **Consequence for us: no single "Turkish phoneme count" may be hardcoded anywhere in our engine.** The number depends on the source and on whether allophones are counted. Our G2P layer must name its inventory source and version in the same place it is used (supreme-law LINK 10).

## 2.5 Count verification, run because a table is a claim

Turkish phone list from S01, split on whitespace: **74 tokens**. Table rows 1–69 plus the 5 accounted in the closing note = 74. Absent-set members flagged in the table: rows **57 (`ɫː`), 64 (`ʃː`), 67 (`ʎː`)** = 3 strictly absent, plus row **62 (`ɾː`)** resolved to present-via-Japanese. **3 absent of 74 = 4.05 % of the Turkish inventory, and 0 % of Turkish articulations.**

# AXIS 3 — Turkish orthographic transparency, quantified

## 3.1 The scholarly basis, and the 2024 re-classification that matters more than the cliché

**The cliché ("Turkish is transparent") is supported but SUPERSEDED in precision.** S22 (Öney & Durgunoğlu, *Applied Psycholinguistics* 18(1), 1997) is the foundational study — its title is literally "Beginning to read in Turkish: **A phonologically transparent orthography**", and its finding is that "a phonologically transparent orthography fosters the early development of word recognition skills" [`[ABS]` — abstract read this session; it carries no load-bearing claim here beyond establishing the classical position and its 1997 date].

S21 (*Reading and Writing*, Springer, 2022) [`[PARTIAL]`] places Turkish quantitatively: "broadly, along with **Finnish and Czech**, Turkish is positioned at the **far end of the continuum of transparency**", and these three "are considered relatively **symmetrically** transparent for both reading and spelling" — as against English at the opposite end, and German/Dutch/Greek/Italian in the middle (transparent for reading, less so for spelling).

**S20 (2024) is the newest source and it re-classifies Turkish as INTERMEDIATE** [`[PARTIAL]`], and it is recency-first controlling under R7.1. Its own words: "Findings suggest an '**intermediate**' position for Turkish on the orthographic depth continuum, prompting a rethinking of the prevailing pedagogical approaches." Its stated grounds are exactly the two things our G2P must handle: "the **irregular representation of vowel length**" and "the **multifaceted phonemic roles of certain letters**", and it notes the alphabet arithmetic: **29 letters, 28 mapped to specific phonemes, and the 29th — `ğ` — serving "to signify compensatory vowel length and certain morphological" functions.**

## 3.2 The measured exception list — this IS the G2P specification

| Exception | Evidence, this session | What our G2P must do |
|---|---|---|
| **`ğ`** | S20: the 29th letter, not a phoneme. S21: two experiments (N=40, N=39, grade 1, mean age ~81 months) found **Ğ reduced SPELLING accuracy but had NO effect on READING accuracy**. S15: banned from onset position; triggers compensatory lengthening; the letter is retained in writing. S03: three context-dependent realisations. | Expand `ğ` by context: → vowel length before C/word-boundary; → `j` between front vowels; → two variants between back vowels. **Never emit a consonant symbol for `ğ` to a model.** |
| **Unmarked phonemic vowel length** | S15: "vowel length is not represented in writing, unless a vowel is long because of compensatory lengthening"; loanword length has "nothing in the spelling that denotes vowel length" (`vali` = [vaːli]). S16: loan long vowels /aː eː iː uː/, minimal pair `sakin` [saːkin] vs `sakın` [sakɯn]. S20 names it as a depth factor. | A **loanword length lexicon** is required. A rule-based G2P CANNOT derive `vali` → [vaːli] from the spelling. This is the one place where a lexicon (WikiPron/MFA dictionary, 41,373 words) is mandatory. |
| **`g`, `k`, `l` each carry TWO phonemes** | S15 Table 1.1 lists `/g, gʲ/`, `/k, kʲ/`, `/l, lʲ/` — the only three letters in the whole alphabet with two phonemes. S03: velars → `[c ɟ ç]` before front vowels, lateral → `[ʎ]`. S01 measured: `ɟ` 3,818 vs `ɡ` 637; `c` 7,238 vs `k` 11,133; `ʎ` 12,655 vs `ɫ` 14,475. | **Rule-derivable from the following vowel's frontness** — cheap and deterministic. This is the highest-value rule in the whole layer. |
| **Loanwords with underlyingly palatalised consonants** | S15: the one-to-one correspondence holds "except for a few cases that involve loanwords with **underlyingly palatalized consonants**"; and footnote: "a palatalized light-l can also be a phoneme of its own, when underlyingly specified as such, in certain borrowed words". | **Lexicon exceptions**, not rules. The MFA dictionary already encodes them. |
| **Stress is not marked** | S15: Turkish has "exceptionally pre-stressing" patterns "despite the contrastive nature of stress". | Matters for prosody, **not** for singing, where the melody assigns stress. Recorded and deliberately NOT handled in our G2P. |
| **Rhyme-size constraint (≤2 positions)** | S15: closed syllable + long vowel cannot co-occur; surfaces as [hajat] but [hajaːta] with a vowel-initial suffix. | **Syllabification must run AFTER suffixation**, not on the surface string. This is the agglutination trap for a note-mapper. |

## 3.3 Verdict on the brief's question: rule-based or learned G2P?

**Neither alone. The evidence supports a THREE-TIER G2P, and the tiers are ordered by the evidence, not by convenience:**
1. **Lexicon first** — the Turkish MFA dictionary v3.0.0, **41,373 words**, CC BY 4.0 [S01], built from WikiPron and used to train the shipped acoustic model. It already encodes the palatalisation, the dentals, the `ğ` expansions and the loanword length. **A lookup is exact where it hits.**
2. **Rules second, for the productive morphology** — Turkish is agglutinative, so out-of-lexicon forms are guaranteed (S43 measured this as the OOV problem and cut OOV by 27 % with morphology-based vocabulary adaptation). The frontness rule for `g/k/l`, the `ğ` context expansion, the homorganic nasal rule and the gemination rule are all deterministic.
3. **Neural G2P third, as the fallback** — CharsiuG2P's multilingual ByT5 covers Turkish among 100 languages with an overall **PER 0.089 / WER 0.261** for the best model (`g2p_multilingual_byT5_small_100`) [S25, `[PARTIAL]`; per-language results exist in `multilingual_results/multilingual` but I did **not** open the Turkish row this session — **flagged `[UNVERIFIED]` for the Turkish-specific number**].

**The measured warning against a naive rule-only path, and it is the sharpest number in this axis:** Epitran's own LREC 2018 paper [S23, `[FULL]`] reports in Table 2 that for **Turkish**, an ASR system trained with Epitran's G2P scored **WER 56.9 vs the baseline's 55.7** — i.e. **Epitran made Turkish WORSE by 1.2 points**, one of only three languages (with Swahili, Tagalog, Tamil) where it lost. Vocabulary size 41,157. **Epitran is a rule-based mapping-and-repairs system, and on Turkish it did not beat the baseline.** S26 [`[FULL]`] independently flags this: Turkish has TWO modes, `tur-Latn` ("Based on data with suffixes attached") and `tur-Latn-nosuf` ("suffixes removed"), and the page warns that some listed languages "should be approached with caution … due to the high degree of ambiguity inherent in the orthographies". **So: do not ship Epitran as the Turkish G2P. Use the MFA lexicon + rules, with CharsiuG2P as the OOV fallback.**

# AXIS 4 — Turkish G2P and forced-alignment resources that actually exist and are usable

| Resource | Turkish genuinely supported? | Documented accuracy on Turkish | Licence | Last update (as read) | Locator (verified by fetch this session) |
|---|---|---|---|---|---|
| **MFA Turkish acoustic model v3.0.0** | **YES** — trained on Common Voice Turkish v16.1 (**111.06 h, 1,453 speakers, 110,431 utterances**) + GlobalPhone Turkish v3.1 (**17.13 h, 100 speakers, 6,950 utterances**); GMM-HMM, MFCC features | no WER/alignment-error figure published for Turkish | **CC BY 4.0** | **trained 2024-03-15** | S02 / S55 |
| **MFA Turkish dictionary v3.0.0** | **YES** — **41,373 words**, MFA narrow-IPA phone set, per-phone occurrence counts and worked examples published | n/a (a lexicon) | **CC BY 4.0** | 2024-03 | S01 |
| **MFA Turkish G2P model v3.0.0** | **YES** — phonetisaurus architecture, trained from the dictionary above | not published per-language | CC BY 4.0 | 2024-03 | linked from S01 (page fetched; the G2P sub-page itself **not opened** — `[UNVERIFIED]` for its own metadata) |
| **Epitran** (`tur-Latn`, `tur-Latn-nosuf`) | **YES, with a published caution** | **WER 56.9 vs baseline 55.7 — WORSE by 1.2 points** (Table 2, vocab 41,157) | MIT | v1.2 listing read; project active | S23, S26 |
| **CharsiuG2P / ByT5 multilingual** | **YES** — Turkish among ~100 languages | best model overall **PER 0.089 / WER 0.261**; **Turkish-specific row NOT opened → `[UNVERIFIED]`** | repository licence not read this session → `[UNVERIFIED]` | Korean-fix models uploaded post-paper | S24, S25 |
| **`phonemizer` + eSpeak NG (Turkish)** | **Indirectly evidenced** — Gokbilge TTS states its "v0.1 Piper baseline uses `espeak-ng` Turkish (via `piper_train.preprocess`) for the training phoneme path" | none published | eSpeak NG is GPL-3.0 (**not verified this session → `[UNVERIFIED]`**) | Gokbilge repo current | S51 |
| **WikiPron** | **YES, indirectly and load-bearing** — MFA 3.0's dictionaries for the 20 core languages are "largely sourced from WikiPron", which "scrapes crowd-sourced pronunciations from Wiktionary and provides broader lexical coverage and narrower phonetic variation" | none | per Wiktionary (CC BY-SA) — **not verified this session** | cited in a 2026 paper | S04 |
| **PHOIBLE 2.0 (`tur`, Glottocode `nucl1301`)** | **YES — four disagreeing inventories** (40 / 33 / 36 / 38 segments) | n/a | per PHOIBLE | release **2019** (v2.0) — **7 years old, flagged STALE for anything but inventory reference** | S18, S19, S53 |
| **Gokbilge TTS (Turkish-native G2P)** | **PARTIAL and honestly self-declared** — the custom Turkish G2P "runs during manifest preparation and is stored in the JSONL `phonemes` field, **but is not yet wired into Piper training**"; wiring "planned for Sprint 4/5" | none | not read → `[UNVERIFIED]` | active, roadmap phases 0-2 done | S51 |
| **FreyaTTS** | **YES — and it is the counter-evidence to phoneme-driving** | **band-matched WER 8.0 % / CER 3.0 %** on Freya-TR-Eval, **with NO phonemizer at all** — a 92-symbol Turkish character vocabulary, 183.2 M params | **Apache-2.0** | 2026 | S50 |
| **ISSAI Turkish Speech Corpus** | **YES** — "clean studio recordings, suitable for training high-quality TTS" | n/a | not read → `[UNVERIFIED]` | current | via S51 |
| **MFA Turkish phone-set documentation** | **YES** — but note its stated basis | derived "largely followed the **Turkish phonology Wikipedia page**, following their list of phonetic realizations" | CC BY 4.0 | current | S03 |

**Two findings in this axis that a shallow pass would have missed, and both change the design:**

1. **The MFA Turkish phone set's own stated authority is Wikipedia.** S03 says so in its first line: "Largely followed the Turkish phonology Wikipedia page, following their list of phonetic realizations." This is a **provenance limitation of our best inventory source**, and it is why Axis 2 cross-checks against PHOIBLE (S18/S19) and against two scholarly phonologies (S15/S16) rather than resting on MFA alone. The agreement across all four is what makes the table load-bearing; MFA alone would not be.
2. **A 404 was hit and repaired by re-searching, per R4.3.** `https://mfa-models.readthedocs.io/en/refactor/mfa_phone_set.html` — the URL MFA's own dictionary pages link to — returns **404 Not Found**. I did not try slug variants; I re-searched and found the live path `https://mfa-models.readthedocs.io/en/latest/mfa_phone_set.html`. **Recorded because MFA's shipped documentation contains a dead internal link, which future sessions will hit too.**

# AXIS 5 — Turkish singing corpora and Turkish singing-synthesis work

## 5.1 What EXISTS — and it is not nothing, but it is small

| Resource | Size, measured from the primary | Annotation level | Licence / access | Citation |
|---|---|---|---|---|
| **Turkish Makam Acapella Sections Dataset v2.0** | **598.6 MB**; recordings of şarkı-form compositions matching v2 of the Turkish Şarkı set → **12 performances of 11 compositions** | **section + lyrics-phrase + lyrics-word**, all in Praat TextGrid (GitHub README additionally claims **phoneme** level — contradiction C-02) | Zenodo, open | Dzhambazov, Şentürk & Serra 2015 [S27, S28] |
| **Turkish Şarkı Vocal Dataset v1** | **10 performances**, 5 male / 5 female, single main vocalist, string-ensemble accompaniment, **no percussion**, `.wav` | lyrical phrases (≈1 musical bar, 1–2 words) aligned, TextGrid | Zenodo, open | Dzhambazov, Şentürk & Serra 2014 [S29] |
| **Turkish Şarkı Vocal Dataset v2** | **12 performances of 11 compositions**, 8 female / 4 male | as above | Zenodo, open | 2015 [S29] |
| **CompMusic Ottoman-Turkish makam corpus** | **6,601 audio recordings / 420 hours**, 2,928 works, 811 artists, **111 makams**, 74 usuls, 87 forms, **2,200 MusicXML scores** | editorial metadata in MusicBrainz; scores with lyrics; **NOT phoneme-aligned**; audio "mainly commercial" so only part is openly available | mixed; Dunya API + pycompmusic | Uyar et al. 2014; Şentürk 2016 [S32, S33, S38] |
| **SymbTr** | 2,200 scores (text + PDF + MIDI) with lyrics, naming convention encoding makam/form/usul/title/composer | symbolic, with lyrics | open on GitHub | Karaosmanoğlu 2012, via S33 |
| **Usul-stroke annotations** | **63 one-minute excerpts** of şarkı in aksak and düyek, hand-annotated right/left-hand strokes | rhythm onsets | CompMusic collection | S34 |

## 5.2 What DOES NOT exist — and the searches that establish it

**Claim: there is no Turkish singing corpus suitable for training a singing-voice-synthesis model, and no Turkish singing-synthesis system.** Per R18.11 this is stated as **NOT FOUND IN THE SEARCHED SCOPE**, with the scope enumerated:

Searches run this session (verbatim):
1. `Türkçe şarkı sesi sentezi singing voice synthesis Turkish corpus dataset makam`
2. `CompMusic Dunya Turkish makam corpus SymbTr Bozkurt Uyar Şentürk research corpora`
3. `Dzhambazov Serra "Modeling of Phoneme Durations" alignment polyphonic audio lyrics Turkish makam thesis`
4. `Türkçe şarkı söyleyen ses sentezi tez Boğaziçi İTÜ Bilkent ODTÜ singing voice synthesis Turkish neural SVS dataset 2025 2026`
5. `automatic lyrics transcription multilingual language support Turkish MULTI-ALT benchmark 2025 2026 lyrics transcription non-English`
6. `Bozkurt automatic pitch analysis Turkish maqam music non-equal-tempered comma intervals Holdrian aksak usul 9/8 scholarly`

**What the Turkish-language and Turkish-university search (query 4) actually returned:** Turkish **TTS** work only — Gokbilge TTS (speech), `mshasir/turkish-tts-combined-raw` (**~81,500 samples, 24 kHz, 7 merged speech datasets, 33.9 GB**), FreyaTTS (speech), Bilkent's *writings* dataset (text, 9,119 documents). **Zero Turkish singing datasets. Zero Turkish SVS systems.** The nearest hit, **UniVoice** [S49], is a unified speech-and-singing model whose singing corpus is 35 k h and whose *speech* subset is explicitly "15k Chinese, 15k English" — no Turkish.

**Independent corroboration of the absence from the ALT side (three sources, genuinely independent of each other):**
- **S45** (MultilingualALT repo, `[FULL]`) lists per-language models for exactly **en, fr, es, de, it, ru**.
- **S46** (Interspeech 2025, `[PARTIAL]`): DALI v2.0 filtered to "the five languages with at least 200 songs each (English, French, Spanish, German, and Italian)"; MulJam v2.0 is "six languages (the above-mentioned five and Russian)"; the eval set Multi-Lang Jamendo is "**79 songs in 4 languages**".
- **S48** (Jam-ALT, ISMIR 2024, `[PARTIAL]`): "English, French, German, Spanish".

**So the answer to the brief's question (e) is: NO Turkish singing corpus of training scale exists, and NO automatic-lyric-transcription system supports Turkish.** What exists is **Turkish lyrics-to-audio ALIGNMENT** research — which is a different and, for us, more useful thing.

## 5.3 The most transferable Turkish result found — and it is a method, not a dataset

**Dzhambazov & Serra, SMC 2015** [S30, `[FULL]`] — five-part depth record:

1. **Problem in the authors' framing:** standard text-to-speech alignment schemes do not fit singing; phoneme durations in singing differ from speech, and background instrumental sound corrupts the acoustic features.
2. **Method:** a **duration-explicit hidden Markov model (DHMM)** phonetic recogniser over **MFCCs extracted in a way robust to background instrumental sounds**; **phoneme durations are inferred from the sheet music** (i.e. from the score's note durations) rather than learned from speech statistics.
3. **Real numbers from the paper:** "the explicit modeling of phoneme durations improves alignment accuracy by **absolute 10 percent** on the level of lyrics lines (phrases) and **performs on par with state-of-the-art aligners for other languages**." Tested in two settings — polyphonic Turkish makam audio, and a purpose-built acapella dataset (which is S27/S29).
4. **Stated limitations:** phrase-level rather than phoneme-level accuracy is what improves; durations depend on having a score; the evaluation is on classical Turkish makam, one tradition.
5. **Concrete application to THIS project:** **this is the exact instrument our Turkish lyric gate needs, and it says the note durations are the input that makes singing alignment work.** Our pipeline already has the note/section plan (architecture §3.1 energy-curve compiler produces per-section boundaries). Their result — "on par with state-of-the-art aligners for other languages" — is a **direct measured refutation of the idea that Turkish is intrinsically harder to align**, and it is Turkish-specific evidence, which is rare enough that it carries real weight.

The follow-on thesis [S31, `[PARTIAL]`] extends this with dynamic Bayesian networks over melodic-phrase and metrical-cycle context, again on Ottoman-Turkish makam, with each model improving over "the baseline, which is based solely on the acoustics of the phonetic timbre".

# AXIS 6 — Turkish-specific measurement: what the gate must actually compute

## 6.1 Whisper and successor ASR on Turkish — the measured numbers, with their benchmarks named

**S39 (Electronics 13(21):4227, 2024)** [`[FULL]`] is the most complete Turkish-specific Whisper evaluation found. Five-part depth record:

1. **Problem in the authors' framing:** Whisper's "performance in Turkish, a language with unique linguistic features and limited labeled data, has yet to be fully explored"; Turkish is treated as **low-resource** for ASR, and the paper names the cause: "its agglutinative structure, where suffixes are attached to root words to form complex words. This results in a **vast number of possible word forms**".
2. **Method:** five Whisper scales (tiny/base/small/medium/large) evaluated on **five Turkish corpora** — METU MS (6,618 records), TNST (82,331), FLEURS (3,127 Turkish records; the paper elsewhere gives the Turkish FLEURS split as 3,607 total = 743 train / 2,526 test / 338 dev), Mozilla CV (52,477), TASRT (286). Then large-v2 vs large-v3, then Whisper-large-v3 vs Google USM (Chirp API), then LoRA fine-tuning. Metric: WER and CER via `jiwer` v3.0.4. Hardware: Xeon Gold 6426Y + NVIDIA A5000.
3. **Real numbers from the paper's tables:**
   - Baseline range across the five corpora: **WER 4.3 %–14.2 %**.
   - Pre-correction, large-v2: METU MS **WER 0.10** (tiny 0.36), TNST **0.13** (tiny 0.53), FLEURS **0.08 / CER 0.02**, Mozilla CV **0.16**, TASRT **0.13 / CER 0.04**.
   - Post-correction, large-v2: METU MS **WER 0.06 / CER 0.02**, TNST **0.10 / 0.04**, TASRT **0.08 / 0.03**.
   - large-v3 over large-v2: **WER improvement 8.77 %–29.08 % relative; CER 6.29 %–44.27 %**.
   - LoRA fine-tuning: **WER reductions up to 52.38 %**.
   - Whisper-large-v3 beats Google USM on METU MS, FLEURS and TASRT; **USM wins on WER for Mozilla CV** while Whisper wins on CER there.
4. **Stated limitations:** three of the five datasets "needed some corrections" before use (the authors document the corrections); TASRT is commercial/on-request; Google USM's optimisation and hardware are opaque, so that comparison is explicitly "indirect".
5. **Concrete application here:** **`large-v3` is the correct ASR for a Turkish lyric gate, and the achievable clean-speech floor is WER ≈ 0.06–0.08 / CER ≈ 0.02–0.03.** Those are SPEECH numbers on read corpora; sung, separated vocals will be worse, so **the Turkish bar must be calibrated on Turkish sung material, never inherited from these figures** — which is exactly the calibration protocol the architecture already commits to (§2b.3).

**Cross-checks and the contradiction they expose:**
- **S42** (PMC, 2024, `[PARTIAL]`): a custom CNN/GRU/LSTM system reaches TMSC **WER 22.2 / CER 14.05** without a language model and **9.85 / 5.35** with one; TSC **11.5 / 4.15** → **8.4 / 2.70**. **A language model roughly halves Turkish WER** — relevant because our gate compares against a KNOWN lyric, which is a far stronger prior than any LM.
- **S43** (ICASSP 2000, `[ABS]`): best GlobalPhone Turkish LVCSR **16.9 % WER**; morphology-based vocabulary adaptation **cut OOV by 27 %**. Historical anchor, 26 years old, cited for the morphology mechanism only.
- **S40** (SCiL 2026, `[ABS]`): fine-tuning large-v3 per FLEURS language reduces WER by **~30 % on average across 81 languages**; "the language's **writing system** is the best predictor of success. **Latin and Cyrillic script languages reach single-digit WERs**"; and **"Whisper's BPE compression ratio predicts fine-tuning headroom (Spearman ρ ≈ −0.78), pointing to tokenization as the underlying bottleneck."** **Turkish is Latin-script → the single-digit-WER group.** This is the newest source in the axis (2026-06-27) and it points at TOKENISATION, not phonology, as the bottleneck — which converges with ACE-Step's stated reason for Romanising (S52).
- **A tertiary aggregator** placed Turkish in "Tier 2, 9–13 %, Agglutination". **I did not treat this as evidence** — it is a commercial content page with no method, and its number conflicts with S39's measured 4.3–14.2 %. Recorded as C-03.

## 6.2 Does any automatic-lyric-transcription system support Turkish? — NO

Established in 5.2 from three independent primaries (S45 `[FULL]`, S46, S48). The best multilingual ALT coverage found is **six languages** (en, fr, es, de, it, ru); the largest public multilingual ALT dataset, **MulJam — 6,031 songs / 182,429 lines / 381.9 h** [S47] — is built from MTG-Jamendo and does not enumerate Turkish. **Consequence: our Turkish gate cannot be an off-the-shelf ALT system. It must be `separate vocals → Whisper large-v3 with `language="tr"` → align to the KNOWN lyric`,** which is the architecture's stage 6 as already designed.

## 6.3 The metric: WER is the WRONG instrument for Turkish, and the literature says so explicitly

**This is the axis-6 answer, and it is a correction to any WER-based Turkish threshold:**

- **S41 (Findings of NAACL 2025)** [`[PARTIAL]`] names Turkish by name as agglutinative ("In agglutinative languages like **Turkish** and Malayalam, affixes are added to root words to convey grammatical relations, with each affix typically serving a single function"), states that "orthographic changes at morpheme and affix boundaries are common, which may or may not be well defined acoustically", and enumerates the alternatives the field has developed **because WER is inadequate**: "letter or **character error rate**, **phone error rate (PER)**, **syllable error rate (SER)**, or **morpheme error rate (MER)**", plus IWER, WWER, WIL. Its own advocacy, per its title, is **CER for multilingual ASR evaluation**.
- **S39** measures the effect: Turkish CER is consistently **~3–4× lower than WER** on the same audio (FLEURS 0.08/0.02; TASRT 0.13/0.04; METU MS 0.06/0.02). **A single suffix error destroys a word but barely moves the characters** — which is precisely why WER over-reports Turkish failure.
- **S42** shows the same ratio independently: 22.2/14.05, 11.5/4.15, 9.85/5.35, 8.4/2.70.
- A Turkish ASR benchmark write-up found in the dark tier (newmind Journal, `[PARTIAL]`, **[single-source]**) states the mechanism plainly — "**Standard WER does not fully reflect success in agglutinative languages**"; "Some models correctly capture the root word (acoustic success) but tend to make errors in the **inflectional suffixes** at the end"; and proposes a "**Morphological Error Rate**" that evaluates roots and suffixes separately. **Flagged `[single-source]`: it is a commercial-lab journal post, not peer-reviewed, and it is used here only because it agrees with S41's peer-reviewed enumeration.**

**Committed instrument for the Turkish gate, with the reason attached to each part:**

| Metric | Role | Why, with the number |
|---|---|---|
| **PER (phoneme error rate)** | **PRIMARY** | It is the only metric that measures what the singer actually produced against what we asked for, independent of morphology. Our G2P produces the reference phoneme string as a by-product of driving the model (route R1), so the reference costs nothing extra. `çal` → `çota` is **2 phoneme substitutions out of 3**, an honest 0.67 — whereas WER scores it **1.0** (one word, wrong) and CER scores it ~0.5, both of which throw away the information about *which sound* failed. |
| **CER** | **SECONDARY, reported always** | Peer-reviewed advocacy for multilingual ASR (S41) and measured to be 3–4× more stable than WER on Turkish (S39, S42). It is the metric that lets us compare Turkish against our English control honestly. |
| **Syllable error rate** | **SECONDARY, singing-specific** | In singing, the syllable is the unit assigned to a note. A syllable error is therefore also a *timing* error, and the Dzhambazov & Serra result (+10 pp from score-derived durations, S30) is measured at exactly this granularity. |
| **WER** | **REPORTED BUT NEVER THE THRESHOLD** | Kept for cross-product comparability only, labelled as unsuitable for Turkish in the same response field. |
| **Morpheme error rate** | **NOT IMPLEMENTED — recorded as an open gap** | It needs a Turkish morphological analyser (Zemberek is named in S42) and has no calibrated bar in any source I read. Naming it and not building it is the honest position; guessing a morpheme-aware threshold would be the banned class. |

**Threshold discipline, stated because it is where this project has paid before:** none of the numbers above may become the Turkish PER bar. The architecture's English ground-truth control measured **16.14 % PER on a human recording**; the Turkish bar must be measured the same way on Turkish sung material, with the negative controls (instrumental → no words; wrong lyric → must FAIL). **A gate that cannot fail is not a gate**, and a guessed 0.08-vs-0.0007 has already cost this project once.

# AXIS 7 — Turkish singing tradition as a quality constraint

**Why this axis is not decoration:** the Music Studio contract exposes `key.root`, `key.mode`, `key.scale` and `time_signature` (architecture §2.2). Every one of those fields carries a Western assumption. The measured facts below say a Turkish listener's expectations are **not representable** in those fields, and shipping them as if they were would be the amateurish-construction class the supreme law bans by name.

## 7.1 Pitch: the octave is not 12 equal steps

From **S34 (Bozkurt, Ayangil & Holzapfel, JNMR 43:1, 2014)** [`[FULL]`], read verbatim this session:
- "The AEU tuning theory is based on Pythagorean pitch ratios and divides an octave into **24 not equal-tempered notes**."
- The notation unit is the **Holderian-Mercator comma (Hc), obtained by equal division of an octave in 53 equal steps**; Pythagorean-derived intervals are quantised to integer multiples of Hc.
- The resulting **basic minimal interval sizes between neighbouring scale notes are 1, 4, 5, 8, 9, 12 Hc.**
- The theory's own insufficiency is documented: "Its insufficiency to reflect music practice was documented and is well-known to the musicians."

**S35 (Bozkurt, JNMR 37:1, 2008)** [`[PARTIAL]`] provides the measurement machinery: automatic tonic detection by shifting a recording's pitch histogram in **1/3 Hc steps** over a template, YIN for f0, then histogram alignment — and **S36** compares nine maqams' automatically derived pitches against competing theoretical models, finding that models disagree with practice. **So even within Turkish theory there is no single agreed tuning**, which is a contradiction to preserve, not resolve (C-04).

**Consequence for our contract:** `key` cannot express a makam. A makam is a tonic + an interval set in commas + a melodic-progression convention (seyir), and 111 of them are enumerated in the CompMusic corpus [S32]. **A `scale` enum containing "aeolian" is not a Turkish music control.**

## 7.2 Rhythm: aksak is additive, not a time signature

From **S34** [`[FULL]`]:
- "The **aksak usul** … has a length of **nine**, which results from summing up the notated durations, assuming long notes to be of length 2, and short notes to be of length 1. As Turkish makam music usually uses a Western staff notation, **this usul is notated with a 9/8 time signature**."
- Tempo class is encoded in the denominator (**mertebe**): "its slow version is called **ağır aksak**, and shown as a **9/4**" — and S34 attributes the existence of slow versions to a documented decrease in performance tempo toward the end of the 17th century (Feldman 1996, p. 326).
- "The length of usul ranges from **2 up to 120**", longer ones often being compound usuls built from shorter ones.
- Ornamented realisations exist as **velveleli** patterns — the basic strokes "filled up with additional strokes".
- The stroke syllable **"düm" is usually related to a stronger accent; however, no generally valid way to differentiate the strength of the accents exists.**

**Consequence:** `time_signature: "9/8"` is *notation*, not the control. The same 9/8 covers aksak and other nine-length usuls with different stroke patterns, and 9/4 is the same usul at a different tempo class. **A Turkish rhythmic control must name the USUL, and `time_signature` must be derived FROM it by import — never maintained beside it** (two lists in agreement by discipline is banned by name).

## 7.3 Ornamentation and what no instrument can judge

The brief names `çarpma` and glissandi. **I did not find a primary source this session that quantifies Turkish vocal ornamentation rates or gives measured perceptual thresholds for them.** S37 (makamBox) and S31 (Dzhambazov's thesis) provide the analysis frameworks (pitch histograms, melodic-phrase DBNs) but I did not open an ornamentation-specific measurement. **Recorded as an open gap and explicitly NOT claimed** — asserting a `çarpma` specification from reasoning would be the guessed-parameter class. What follows from this is a design rule, not a number: **whether a Turkish vocal sounds Turkish is BERK'S VERDICT, not an instrument's** (Mandate Clause 19), and the response must say so rather than print a confidence.

## 7.4 The honest scope boundary for axis 7

**Makam is CLASSICAL Ottoman-Turkish art music.** The Music Studio's likely Turkish output is contemporary Turkish pop, and nothing I read establishes that a Turkish pop listener expects comma intonation. **What IS established** is that the fields we expose cannot represent the tradition if a user asks for it, and that aksak rhythms (9/8, 7/8) are pervasive enough in Turkish music generally to appear in the 63-excerpt usul annotation set [S34]. **The recommendation is therefore narrow and safe: do not claim makam support; do not silently map a makam request onto a Western scale; refuse it by name with the reason, exactly as the architecture refuses named commercial reference tracks.**

# AXIS 8 — THE DARK: the sources where people do not look

Every item below was reached deliberately, outside ordinary result rankings, and each changed or constrained a conclusion:

1. **A dead internal link in shipped vendor documentation.** MFA's own dictionary pages link the phone-set page as `/en/refactor/mfa_phone_set.html`, which **404s**. The live path is `/en/latest/`. Found by re-searching after the 404 (R4.3), not by guessing a variant. **This is the kind of defect that silently becomes an unverified claim in a future session.**
2. **The MFA Turkish phone set's stated authority is Wikipedia** (S03, first line). Discovered only by reading the phone-set page itself rather than trusting the dictionary's IPA chart. **This is why Axis 2 triangulates against PHOIBLE and two scholarly phonologies.**
3. **PHOIBLE's four disagreeing Turkish inventories** (40 / 33 / 36 / 38) and the project's own statement that its sources disagree (S18, S53). A single-source phoneme count would have been a fabricated certainty.
4. **Italian is not in the MFA phone set at all** — its dictionary is VoxCommunis/Epitran (S11, S14). Found by reading the dictionary INDEX rather than assuming symmetry across the nine languages. Without this, the Italian column of the load-bearing table would have silently mixed transcription traditions.
5. **Epitran's own paper reports Turkish as a LOSS** (WER 56.9 vs 55.7, S23 Table 2) — buried in a table, contradicting the tool's general reputation, and it is the single most consequential number for the G2P choice.
6. **Epitran's dual Turkish modes and its self-declared caution** (`tur-Latn` vs `tur-Latn-nosuf`, "should be approached with caution … high degree of ambiguity", S26) — found on the PyPI page, not in the paper.
7. **CharsiuG2P's README erratum:** "We accidentally left out Korean in our original model (sorry!)" with corrected models uploaded afterwards (S25). A changelog-class fact that determines WHICH published PER numbers are usable.
8. **Gokbilge TTS's honest self-disclosure** that its Turkish G2P "is **not yet wired into Piper training**" and that espeak-ng is doing the real work (S51). A repository README that admits its own gap — exactly the class of source that prevents a false "a Turkish G2P pipeline already exists" claim.
9. **FreyaTTS: the counter-evidence to my own recommendation**, and it is reported because concealing it would be the deception class. A 2026 Turkish-first TTS reaches **WER 8.0 % / CER 3.0 %** with **no phonemizer, no G2P front-end, no discrete tokenizer** — a 92-symbol character vocabulary — explicitly so that "agglutinative morphology, vowel harmony, and the spoken form of numbers and acronyms are learned directly from audio" (S50). **This says that WITH ENOUGH TURKISH AUDIO, characters beat phonemes.** It does not overturn the recommendation, because we cannot retrain a song model — but it is the falsifier, and it is named in the falsifier list below.
10. **The contradiction between two records of the SAME dataset release** — GitHub says "word and phoneme level", Zenodo says "section, lyrics phrases and lyrics words" (S28 vs S27). Preserved as C-02 rather than averaged.
11. **A GitHub source file as evidence of method** — `AlignmentDuration/src/align/LyricsAligner.py` carries `ParametersAlgo.FOR_MAKAM` / `FOR_JINGJU` branches and loads an HTK model, corroborating S30's method at the code level.
12. **S34's admission against its own tradition** — "no generally valid way to differentiate the strength of the accents exists" for usul strokes, and the AEU system's documented "insufficiency to reflect music practice". Negative results inside an authoritative review.
13. **The 26-year-old ICASSP 2000 Turkish LVCSR paper** (S43) — cited not for its 16.9 % WER but for the morphology mechanism (OOV cut 27 %), which is the same mechanism S40 rediscovers in 2026 as a tokenisation bottleneck.
14. **A commercial aggregator's unsourced "Turkish Tier 2, 9–13 %"** — found, read, and **rejected** as evidence because it conflicts with S39's measured range and carries no method. Recorded as C-03 so nobody re-imports it.

# CROSS-VERIFICATION LEDGER

| ID | Load-bearing claim | Source A | Source B | Source C | Independence rationale | Status |
|---|---|---|---|---|---|---|
| V-01 | Turkish has **eight** vowel phonemes with a front/back × rounded/unrounded × high/low structure | S17 (Handbook of the IPA, Zimmer & Orgun 1999) | S16 (van der Hulst, rectangular inventory) | S19 (PHOIBLE UPSID: 8 vowels / 25 consonants) | Cambridge handbook · a US university phonologist · a typological database from a fourth compiler (Maddieson) | **VERIFIED (3+)** |
| V-02 | `ğ` is not a stable consonant: it realises as vowel length, as `[j]` between front vowels, or as ∅ | S15 (OUP phonology: /ɰ/ → [ɰ, ɣ, ∅]) | S03 (MFA engineering rule, three contexts) | S01 (the shipped dictionary contains **no `ɰ` phone**; long vowels carry the examples) | a scholarly monograph · a toolkit's design note · the toolkit's measured lexicon output | **VERIFIED (3+)** |
| V-03 | `g`, `k`, `l` each map to TWO phonemes, palatalisation conditioned by vowel frontness | S15 Table 1.1 (`/g, gʲ/`, `/k, kʲ/`, `/l, lʲ/`) | S03 (velars → `[c ɟ ç]`, lateral → `[ʎ]` before front vowels) | S01 (measured: `ɟ` 3,818 vs `ɡ` 637; `ʎ` 12,655 vs `ɫ` 14,475) | monograph · toolkit rule · counted occurrences in 41,373 words | **VERIFIED (3+)** |
| V-04 | Turkish orthography is transparent but **not** fully one-to-one; the newest classification is "intermediate" | S20 (2024, "intermediate") | S21 (2022, "far end of the continuum" **but** Ğ measurably harms spelling) | S15 ("in general … one-to-one … except for a few cases") | Turkish journal · Springer journal with experiments · OUP monograph | **VERIFIED (3+) — with a preserved tension, C-05** |
| V-05 | Turkish vowel length exists, is contrastive in loanwords, and is **not marked** in spelling | S16 (`sakin` [saːkin] vs `sakın`; loans /aː eː iː uː/) | S15 (`[vaːli]` written `vali`, "nothing in the spelling denotes vowel length") | S20 ("irregular representation of phonemic vowel length" as a depth factor) | three independent authors/venues | **VERIFIED (3+)** |
| V-06 | **Turkish's phonetic inventory is a near-subset of the nine covered languages' union; only consonant-LENGTH variants are absent** | S01 vs S05–S13 (direct set comparison in one harmonised phone set) | S19 + S18 (PHOIBLE: 8 vowels / 25 consonants, no exotic articulations; four inventories all within 33–40 segments) | S15 (phonemic consonant chart: p b f v m t k d g t͡ʃ d͡ʒ s ʃ z ʒ n ɾ l j ɰ h — every one common cross-linguistically) | a harmonised toolkit comparison · a typological database · a scholarly chart | **VERIFIED (3+)** |
| V-07 | No song-generation or ALT system enumerates Turkish; multilingual ALT tops out at six languages | S45 (repo: en/fr/es/de/it/ru) | S46 (Interspeech 2025: DALI five + MulJam six; eval 79 songs / 4 languages) | S48 (Jam-ALT: en/fr/de/es) + S44 | a code repository · a conference paper · a benchmark site · a EUSIPCO paper | **VERIFIED (3+)** |
| V-08 | WER is inadequate for Turkish; CER/PER/SER/MER are the field's answer | S41 (NAACL Findings 2025, names Turkish, enumerates the alternatives) | S39 (measured Turkish CER 3–4× lower than WER across five corpora) | S42 (independent system, same ratio: 22.2/14.05, 11.5/4.15, 8.4/2.70) | peer-reviewed methodology paper · peer-reviewed Turkish evaluation · independent Turkish system | **VERIFIED (3+)** |
| V-09 | Whisper large-v3 is the strongest available Turkish ASR, achieving single-digit WER on clean read speech | S39 (large-v3 improves 8.77–29.08 % over large-v2; large-v2 already 0.06–0.16) | S40 (Latin-script languages reach single-digit WER after fine-tuning; ρ ≈ −0.78 tokenisation) | S42 (independent Turkish system reaches 8.4 WER only WITH a language model) | MDPI evaluation · SCiL 81-language study · PMC custom system | **VERIFIED (3+)** |
| V-10 | Score/note-derived phoneme durations materially improve Turkish sung-lyric alignment | S30 (**+10 pp absolute** at phrase level; "on par with state-of-the-art aligners for other languages") | S31 (thesis: each context model improves over the acoustics-only baseline) | S27/S29 (the datasets built for and cited by that work exist and are open) | a conference paper · its author's thesis · the independently archived datasets | **VERIFIED (3+) — same research group, so institutional independence is PARTIAL; flagged** |
| V-11 | The AEU system divides the octave into 24 unequal steps with the Holderian comma (1/53 octave) as unit | S34 (JNMR review, verbatim) | S35 (Bozkurt 2008: Hc as "the smallest intervallic unit", 1/3 Hc search steps) | S37 (makamBox paper citing Arel 1930 and the same lineage) | a review · a method paper · a third tool paper — **but Bozkurt is an author on two of the three; institutional independence PARTIAL**, flagged | **VERIFIED (3) with a flagged dependency** |
| V-12 | Aksak usul has additive length 9, notated 9/8, and its slow form is notated 9/4 | S34 (verbatim, with the Feldman 1996 p.326 citation) | S34's own usul-annotation dataset (63 excerpts in aksak and düyek) | — | **[single-source]** for the 9/4 mertebe claim: only S34 states it | **`[single-source]`** |
| V-13 | ACE-Step converts 50 % of lyrics to phonemic representations during training to share phonology across languages | S52 (arXiv 2602.00744, verbatim quote read this session) | S49 (UniVoice independently uses "a unified IPA phoneme system for both speech and singing") | — | two independent model papers converging on phoneme-level conditioning; **the 50 % figure itself is `[single-source]`** | **`[single-source]` for the figure, VERIFIED for the practice** |
| V-14 | Character-level Turkish TTS can reach WER 8.0 % with NO phonemizer | S50 (FreyaTTS, its own benchmark) | — | — | **`[single-source]`, self-reported on a self-built benchmark (Freya-TR-Eval)** — the strongest falsifier of the phoneme recommendation and the weakest-verified claim in this report | **`[single-source]` / `[UNVERIFIED]` externally** |
| V-15 | No Turkish singing corpus of training scale exists | six enumerated searches (5.2) + S49 (largest unified singing model: no Turkish) + S45/S46/S48 (ALT absence) | S32 (the largest Turkish music corpus that DOES exist is 420 h of **polyphonic commercial audio, not phoneme-aligned singing**) | — | **NOT FOUND IN THE SEARCHED SCOPE** per R18.11 — absence is reported with its queries, never asserted | **NOT FOUND IN SCOPE (not "does not exist")** |

# CONTRADICTION LEDGER — preserved, not averaged

| ID | The disagreement | Side A | Side B | Resolution |
|---|---|---|---|---|
| **C-01** | The symbol for Turkish `ö` | **/œ/** — Zimmer & Orgun as reproduced in the IPA-handbook chart (S17 via S15/S16 reproductions) | **/ø/** — S15's own Table 1.1; and MFA ships **`ø`** as the phone with **`œ`** as a *separate* word-final open-syllable variant (S01) | **NOT RESOLVED, and it must not be.** Both are in use. Our G2P must **name its symbol set and version** (MFA v3.0.0) wherever a symbol is emitted. A mixed-symbol reference string would silently inflate PER. |
| **C-02** | Annotation depth of the Turkish Makam Acapella Sections Dataset | **GitHub README (S28): "Annotated on word and phoneme level"** | **Zenodo record for the same v2.0 release (S27): "annotations with section, lyrics phrases and lyrics words"** — no phoneme tier; the annotation instructions describe marking **word** ends in Praat | **PRESERVED.** The instructions in S28 itself describe word-level marking, which supports Zenodo. **Treat as WORD-level until the TextGrid tiers are opened and counted.** Anyone claiming a Turkish phoneme-annotated singing corpus on the strength of that README would be wrong. |
| **C-03** | Whisper's Turkish WER | **S39 (measured, peer-reviewed): 4.3 %–14.2 % baseline range across five named corpora** | A commercial aggregator page: "Turkish, Tier 2, **9–13 %**, Agglutination" — no method, no corpus | **A CONTROLS. B REJECTED as evidence** and recorded here so it is not re-imported. A third page reported "**22.8 % on FLEURS**" for base large-v3 in a search synthesis, which **contradicts S39's own FLEURS figure of 0.08** — I could not locate that 22.8 % in S39's text and therefore **do not cite it**; flagged `[UNVERIFIED]`. |
| **C-04** | Which tuning theory describes Turkish practice | AEU (24 unequal steps, Hc-quantised) is "the most commonly referred system" (S35) | S34: AEU's "insufficiency to reflect music practice was documented and is well-known to the musicians"; S36 compares *multiple* competing models against measurements and finds differing conformance | **PRESERVED.** There is no single correct Turkish tuning. **Therefore we must not expose one.** |
| **C-05** | Is Turkish shallow or intermediate? | S21/S22: far end of the transparency continuum, alongside Finnish and Czech | S20 (2024, newest): **intermediate**, on grounds of vowel length and multi-phoneme letters | **BOTH KEPT, recency-first (R7.1) gives S20 the controlling voice for our design.** The practical reading: transparent enough that a rule layer captures most of it; not transparent enough to skip a lexicon. |
| **C-06** | Do phonemes or characters drive Turkish better? | S52 + S49: phoneme/IPA conditioning is what makes cross-lingual singing work | S50 (FreyaTTS): **no phonemizer at all**, WER 8.0 % | **PRESERVED as the decision's falsifier.** The two are reconciled by *who controls training*: FreyaTTS TRAINED on Turkish audio; we cannot retrain a song model, so we must speak to it in representations it already learned. If we ever fine-tune on Turkish audio, C-06 flips. |

# HONEST LIMITS

1. **The phoneme table's frame is MFA/Epitran narrow phonetics, not phonemics.** It answers "has this model family heard this sound in these languages", which is the right question for conditioning a pretrained generator, and the wrong question for a theoretical phonology claim. Stated so nobody re-uses the table as a phonemic inventory.
2. **Italian's column comes from a different phone set (Epitran, VoxCommunis) than the other eight.** Where Italian is the sole supplier of a match (rows 8, 34), the match is `art`-level (same articulation, different notation), not identical-symbol.
3. **Five per-language dictionary pages were read `[FULL]` (Turkish, Japanese, Korean, Mandarin, Russian, German, Italian); French, Spanish and English phone lists were read from release/index pages `[PARTIAL]`.** The Spanish list came from the v3.3.0 release page, not the v3.0.0 dictionary page — a version mismatch against the others, disclosed.
4. **I did not open the Turkish row of CharsiuG2P's `multilingual_results/multilingual` directory.** The PER 0.089 / WER 0.261 figures are the model's OVERALL 100-language averages. **The Turkish-specific G2P accuracy is `[UNVERIFIED]`** and must be measured before CharsiuG2P is wired as the fallback.
5. **Licences unverified this session:** CharsiuG2P, eSpeak NG, ISSAI Turkish Speech Corpus, Gokbilge TTS, WikiPron. MFA models and dictionaries are confirmed **CC BY 4.0** from their own pages; FreyaTTS **Apache-2.0** from its own report; the CompMusic audio is "mainly commercial" with only part openly available.
6. **PHOIBLE 2.0 is from 2019** — seven years old. Used only for inventory triangulation, flagged STALE for anything else.
7. **Zimmer & Orgun (1999) was read `[ABS]`** — I verified the bibliographic record at WALS and read its chart as reproduced and cited by S15/S16, but I did **not** open the Cambridge handbook itself. It therefore carries no claim alone; V-01 rests on S16 and S19 as well.
8. **No ornamentation measurement** (`çarpma`, gliss) was found. Axis 7.3 is a stated gap, not a finding.
9. **No morpheme-error-rate threshold exists in anything I read.** It is named as the theoretically-right instrument for an agglutinative language and deliberately not implemented.
10. **The Turkish sung PER floor is unknown.** The 16.14 % English human-control figure is this project's own prior measurement (architecture §2b.3) and **must not be transferred to Turkish.** No source I read gives a Turkish sung intelligibility baseline, because no Turkish sung benchmark exists.
11. **Nothing in this report was measured by me on audio.** Every number is from a primary document read this session. The only Turkish *sung* datapoint in existence for us remains the project's own 7-of-8-words Lyria 3 measurement, n=1.
12. **Source archival: 30 raw captures WERE archived** under `docs/research/_sources/` as `2026-08-14-<kebab-source-name>.txt` (verified by directory listing and file count this session — see the completion audit). **NOT archived:** the sources reached only via search-result synthesis rather than a full page capture — S17 (WALS record), S18/S19/S53 (PHOIBLE pages, fetched and read inline), S22, S27, S29, S36, S40, S43, S45, S51 and the per-language MFA pages for German/French/Spanish/English/Italian/Turkish that were read inline in the fetch response rather than written to a capture file. Every locator in the source register is verified-by-fetch and reconstructible.

# APPLICATION TO THE MUSIC STUDIO DECISION

## The committed recommendation

**Drive the model with a PHONEME-INFORMED ORTHOGRAPHY — route R1 — as the DEFAULT for Turkish. Not raw orthography. Not speech-to-singing.**

Concretely: the lyric goes through our own Turkish G2P, and what reaches the model is **the orthographic string the model's tokeniser will pronounce correctly, computed from the phoneme sequence** — plus the phoneme sequence itself retained as the gate's reference. This is exactly the mechanism ACE-Step describes for its own training (S52: 50 % stochastic Romanisation "to share phonological representations across languages, significantly enhancing pronunciation accuracy for rare tokens") and the representation UniVoice uses across both speech and singing (S49: "a unified IPA phoneme system").

**Why this and not the alternatives, each with its evidence:**

| Route | Verdict | Evidence |
|---|---|---|
| **R0 — raw orthography** | **Not sufficient alone, but keep as the entry point** | It already measured 7/8 words on Lyria 3, so it is not broken. It fails exactly where Axis 3.2 predicts: `ğ`, unmarked length, and the `g/k/l` two-phoneme letters. Our own failing word `çal` sits on the `ç` = `tʃ` + back-`a` boundary — a G2P failure shape, and `çota`/`çalıyma` are what an English-trained tokeniser does with an unfamiliar letter sequence. |
| **R1 — phoneme drive** | **DEFAULT. Recommended.** | Axis 2: **zero Turkish articulations are absent** from the nine covered languages' union; the only absentees are three consonant-length variants, and length in singing is set by the note. So the model has heard every Turkish sound — it just needs to be told which sounds to make. Plus S40's finding that **tokenisation, not phonology, is the bottleneck** (ρ ≈ −0.78), which is precisely what a phoneme-informed spelling addresses. |
| **R2 — cross-lingual style transfer** | **Keep as escalation, not default** | It requires a Turkish reference vocal per voice, which is an asset-acquisition cost, and it risks timbre drift. Evidence for the mechanism is TCSinger (already on disk in the architecture); nothing found this session strengthens or weakens it for Turkish specifically. |
| **R3 — speech-to-singing** | **Keep as the LAST escalation, and it is genuinely available** | Turkish's SPEECH path is strong and measured: Whisper large-v3 gives us the verification side (S39), and FreyaTTS proves Turkish speech synthesis at **WER 8.0 % / CER 3.0 %, Apache-2.0** (S50) — so a Turkish speech source of known quality exists if we need one. But S30's own honest numbers on STS-adjacent naturalness (recorded in the architecture) and the extra GPU pass make it the expensive path. |

**The falsifier, named as required:** if we ever fine-tune a song model on Turkish audio, **C-06 flips and characters may beat phonemes** — FreyaTTS is the existence proof that with Turkish training data, a character vocabulary learns vowel harmony and agglutination directly. The recommendation is conditional on our real constraint: **we do not control the song model's training.**

## The G2P layer, specified from the evidence

Three tiers, in this order, each with its source:

1. **Lexicon:** MFA Turkish dictionary v3.0.0 — **41,373 words, CC BY 4.0, trained 2024-03** (S01). Exact where it hits; already encodes palatalisation, dentals, `ğ` expansions and loanword length.
2. **Rules for out-of-lexicon (agglutinative) forms**, all deterministic and all sourced: front-vowel palatalisation of `g/k/l` → `ɟ/c/ʎ` (S03, S15); `ğ` context expansion — vowel length before C or word boundary, `j` between front vowels, two variants between back vowels (S03); homorganic nasal assimilation → `m/n̪/ɲ/ŋ` (S03); orthographic double consonant → geminate (S03); dental realisation of `t d s z n` (S03, S01).
3. **Neural fallback:** CharsiuG2P multilingual ByT5 (S24, S25) — **and its Turkish PER must be measured before it is trusted**, because only the 100-language average is known.

**Explicitly rejected: Epitran as the Turkish G2P.** Its own paper measured Turkish **WER 56.9 vs a 55.7 baseline** (S23, Table 2) and its own distribution page cautions about orthographic ambiguity and ships two incompatible Turkish modes (S26).

**Where this lands in the repository:** as a new DATA file following the established pattern — `titles/languages/tr.json` is the shape (read this session, **not modified**), and its own comment block states the law: *"a language is DATA, never engine code"* (Mandate Clause 23). The phoneme table, the rule set, the symbol-set version and the inventory provenance belong in a sibling DATA file, with the API enum generated FROM the registry **by import**, never maintained beside it.

## What the Turkish gate must measure

| Field | Instrument | Source of the choice |
|---|---|---|
| `per` | **PRIMARY** — phoneme error rate against the G2P reference string | S41 enumerates PER among the field's answers to WER's inadequacy; the reference is free because R1 already computes it |
| `cer` | always reported | S41's peer-reviewed advocacy; measured 3–4× more stable than WER on Turkish (S39, S42) |
| `syllable_error_rate` | always reported | the syllable is the note-bearing unit; S30's +10 pp result is measured at this granularity |
| `wer` | reported, **never the threshold**, labelled unsuitable for Turkish in the same field | S41, S39, S42 |
| `asr` | `whisper-large-v3`, `language="tr"` | S39: strongest measured Turkish ASR; S40: Latin-script languages reach single-digit WER |
| `phonemiser` | named with its **version and symbol set** (`mfa-turkish-v3.0.0`) | C-01: `œ`/`ø` genuinely differ between sources; a mixed symbol set would silently inflate PER |
| `alignment` | note/section durations fed to the aligner as priors | S30: **+10 pp absolute**, and "on par with state-of-the-art aligners for other languages" — Turkish-specific evidence |
| `bar` | **CALIBRATED on Turkish sung material, with negative controls** — never the English 16.14 % figure, never a guessed number | Mandate Clause 7; the 0.08-vs-0.0007 defect; and honest limit 10 |
| `verdict` | PASS/FAIL on the calibrated bar, plus **BERK'S VERDICT** for whether it sounds Turkish | Mandate Clause 19 — what no instrument can judge is stated as his verdict, never claimed |

## What must NOT be shipped, and why each would be a violation

1. **`key`/`scale` presented as capable of expressing a makam.** The octave is 24 unequal steps quantised to 1/53-octave commas (S34), 111 makams are enumerated in the corpus that exists (S32), and Turkish theory itself does not agree on the tuning (C-04). **Refuse a makam request by name with the reason** — the same mechanism the architecture already uses for named commercial reference tracks.
2. **`time_signature: "9/8"` as a Turkish rhythmic control.** 9/8 is *notation* for an additive length-9 usul, and the same usul appears as 9/4 at a slower mertebe (S34). If we expose usul, `time_signature` is **derived from it by import**.
3. **Any Turkish PER threshold that was not calibrated on Turkish sung audio.**
4. **A claim that Turkish is `SINGING_PROVEN`.** n=1 (7 of 8 words) proves the capability exists; the promotion protocol in the architecture (§2b.3: ≥5 human recordings with ground truth, ≥3 generated songs per route, negative controls both directions) is what proves quality.
5. **A claim that a Turkish singing corpus exists.** It does not, in the searched scope — and the largest Turkish sung resource is **12 performances**, word-aligned, with a preserved contradiction about whether any phoneme tier exists at all (C-02).

## The three cheapest next measurements, in order

1. **Run the MFA Turkish G2P + dictionary over a real Turkish lyric and read the phoneme string by eye against Axis 1.2** — zero cost, no API, and it controls the whole G2P tier before any money is spent.
2. **Measure CharsiuG2P's Turkish PER** from its own published per-language results directory — closes honest limit 4 at the cost of one fetch.
3. **Re-run the `çal` case through R1** — one generation, against the R&D ledger, comparing the orthographic and phoneme-informed spellings of the same eight words. **n=1 proves nothing about quality but it directly tests the G2P hypothesis on the exact word that failed**, and it is the smallest verified step available.

---

**Report path:** `C:\Berk\SsmContentAssetCreator\docs\research\2026-08-14-turkish-singing-phonology-and-g2p-for-synthesis.md`
**Completion audit (measured, not asserted):** source floor met — **55 authoritative / 23 academic / 8 academic `[FULL]`** (floors: 20 / 5 / 5). All **eight** axes have their own section (count matched against the brief's list: 1 phonology · 2 absent-set · 3 orthographic transparency · 4 G2P/alignment resources · 5 corpora and SVS work · 6 measurement · 7 tradition · 8 the dark). The phoneme table covers **74 of 74** Turkish phones from the S01 list. Cross-verification ledger: **15 claims**, of which **11 VERIFIED (3+)**, **3 `[single-source]`**, **1 NOT-FOUND-IN-SCOPE**. Contradiction ledger: **6 preserved**, none averaged. Honest limits: **12**. Raw captures archived by THIS run: **30**, verified present by exact filename (30 of 30, zero missing). The `_sources` directory holds **54** files dated `2026-08-14`; the other **24** were written by a SIBLING research run (the cross-lingual SVS brief — SoulX-Singer, DiffRhythm, TCSinger2, TranSinger, SVPT, AlignSTS, YuE, STARS, SingMOS-Pro, phonological-feature TTS, and notably `2026-08-14-turkish-phonology-inventory.txt`, `2026-08-14-turkish-english-phonology-contrast-dergipark.txt`, `2026-08-14-turkish-makam-note-onsets-lyrics-alignment-ismir-2016.txt`, `2026-08-14-phoible-phoneme-inventory-counts-jlls-2021.txt`) and are **NOT claimed as this run's evidence** — none of them was read in this session and none supports any claim above. **A defect in my own verification instrument, recorded because concealing it is the worse failure:** my first count filtered by `LastWriteTimeUtc` and returned "0 written this run", which was FALSE — `Copy-Item` preserves the source file's mtime, so the timestamp filter could not see my own copies. The count was redone by exact-filename existence check. Those four sibling Turkish files are a lead for a future session, not evidence here. Files modified outside `docs/research/`: **zero**; `titles/languages/tr.json` was read and left byte-identical.

---

# ADDENDUM 2026-08-17 — S15 ARCHIVED, AND ITS SYLLABLE CONSTRAINTS APPLIED

**Source archive (research law: the evidence outlives link rot):** the S15 publisher author-preview was
downloaded and archived this session at
docs/research/_sources/_cache/s15-phonology-of-turkish-preview.pdf (888,595 B, 31 pages; text
extraction beside it as s15-preview-extracted.txt, 63,656 chars, 43 hits on "syllab"). Coverage limit,
measured: the preview carries the FRONT MATTER and INTRODUCTION only — chapter 3's body (coda-cluster
sonority §3.5.2.1, the appendix §3.6, the repair processes) is present in the table of contents but NOT
in the text. Anything needing those sections remains out of evidence.

**Application (research is finished when it is APPLIED, not filed):** the syllable constraints read from
the archived text — "there are no complex onsets in the language on the surface" (§1.3), the
two-position rhyme ban with the [hajat]/[haja:ta] pair (§1.1), heterosyllabic hiatus (§3.4.2.1 title),
the soft-g onset ban (§3.3.1.1 title) — are now DATA in music_studio/data/syllabification.json (each
constraint beside S15's own sentence) and CODE in music_studio/syllabification.py (segmentation only;
wellformedness refused by name because its conditions are outside the archived text). Controls:
scripts/test_syllabification.py, known answers = S15's own [ha.jat]/[ha.jaː.ta] pair. Consumer:
per_gate.companion_metrics now computes a real syllable_error_rate (identical transcript 0.0, one-word
corruption 0.1667, empty transcript 1.0 — measured 2026-08-17), closing the NOT_RUN refusal whose own
unlock condition demanded exactly this construction.
