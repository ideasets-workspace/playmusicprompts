# Standards ledger

| Standard | How this slice implements it | Evidence / status |
| --- | --- | --- |
| Deep-research covenant `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (COVENANT_SHA256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB, re-hashed from disk 2026-09-03 08:57 +03: match, 117,893 bytes) | Part I §1–§7, R0–R18 read this session; MODE B owner research order; search-first (R4.1 first external action = broad scoping search); `[FULL]`/`[ABS]`/`[PARTIAL]` marks honest; claim ledger with ≥3-source rule or flag | Query log §Methodology; register file `2026-09-03-reuse-slice-b-source-register.md` |
| Law Zero (rule 00 / 01 / 25) | Every number below is copied from a primary opened this session (locator given) or labelled INFERENCE / `[UNVERIFIED]` | Five-part records §Findings; claim ledger |
| No-narrowing (rule 10) | Slice file enumerates 8 scope items (1–8) with sub-items 2a–2e; all 8 answered below under their own headings; count 8/8 | §Findings by subquestion |
| Owner constraints: no new paid vendor / paid API; no synthetic data | Every recommended model is open-weight and self-hosted; the only paid options mentioned (OpenAI/Cohere embedding APIs) are FLAGGED and not recommended; no synthetic labelled data — calibration set is defined from REAL skip/listen events only | §Synthesis, §Calibration |
| Licence lawfulness (prior finding 2026-08-17: MERT CC-BY-NC forbidden) | Each model's licence re-read from its HF card/README this session: `laion/larger_clap_music` apache-2.0 (LAWFUL); `OpenMuQ/MuQ-MuLan-large` weights cc-by-nc-4.0 (FORBIDDEN); `BAAI/bge-m3` mit (LAWFUL); `intfloat/multilingual-e5-large` mit (LAWFUL); pgvector README (v0.8.6) | §Companies / APIs / repositories |
| Artifacts (R15) | Exactly 2 files written, English, UTF-8, ISO-date kebab-case; no other project file touched | §Completion audit |
| Report path resolution | Project convention `docs/research/YYYY-MM-DD-<topic>.md` honoured as instructed by SLICE-B.md | — |

**Execution note (honest):** this slice was executed under the 45-minute wall-clock limit set in CONTEXT-17; the limit, not saturation, ended the run. Slice floors (≥10 independent authoritative, ≥3 academic `[FULL]` with five-part records) are met — counts in §Source register summary. Lanes left unswept are listed in §Contradictions/gaps.

# Decision served and slice scope

**Decision served (CONTEXT-01):** whether PlayMusicPrompts should serve an existing, already-generated catalogue take as the *next track* in playlist mode instead of paying $0.08 and waiting 25–145 s for a new generation — and, for THIS slice (B), by which similarity-retrieval method, storage/index, calibration procedure and evaluation.

**Berk's order (verbatim, unaltered, from COMMON-BRIEF.md):** "…eğer elimizde benzer bir şarkı varsa üretmek yerine kullanıcıya o şarkıyı ekleyeceğiz next track olarak. … ve elimzideki şarkılardan benzerlerinin bulunması ve buna bağlı algoritma da lazım."

**Slice scope (SLICE-B.md, 8 items):** (1) precise retrieval-problem definition; (2) method families a–e with primaries, numbers, licence, cost; (3) pgvector storage/indexing on Postgres 16; (4) calibration and thresholds; (5) evaluation offline/online; (6) cold start; (7) compute cost and placement; (8) staged recommendation with falsifiers.

# Outcome first

1. **The lawful, self-hostable audio–text embedding for this product is still `laion/larger_clap_music` (HF card frontmatter `license: apache-2.0`, re-read 2026-09-03).** The 2025 successor MuQ-MuLan is **FORBIDDEN**: `OpenMuQ/MuQ-MuLan-large` frontmatter `license: cc-by-nc-4.0`; the tencent-ailab/MuQ README states "The model weights (MuQ-large-msd-iter, MuQ-MuLan-large) … are released under the CC-BY-NC 4.0 license" (code MIT). The 2026 frontier model FIGMA (ACL 2026) is built on a *frozen MuQ audio encoder*, so it inherits the same NC poison for commercial use (INFERENCE from the licence chain; FIGMA's own weight licence `[UNVERIFIED]` — not published in the paper).
2. **CLAP-class text→audio retrieval is coarse and saturates on long prompts.** FIGMA (read `[FULL]`) measures that CLAP-family models' R@1/5/10 plateau once captions exceed ~40–50 tokens, and LAION-CLAP(Music) scores T2A R@1 = 25.38 % / R@10 = 68.53 % on MusicBench but only 2.60 % / 14.80 % on out-of-domain FMACaps-Eval (Tables 2–3). SDD (read `[FULL]`) measures CLAP T2A on Song Describer at R@1 4.42 / R@5 17.02 / R@10 26.01, MedR 36 (Table 5). Our prompts are long structured briefs (genres[], moods[], eras[], vocal, tempo, duration, negatives) — exactly the regime where a single CLAP text vector loses information. **Consequence:** the audio-text joint embedding must NOT be the first filter; structured parameters and a multilingual text embedding of the prompt must gate first.
3. **Structured-parameter matching is the highest-precision, zero-cost, zero-licence stage and must be a HARD filter, not a soft score, for `vocal.mode`, `vocal.language`, duration band and negative_prompt conflicts.** MuLan (read `[FULL]`) documents that contrastive text encoders mishandle negation ("the text embedding of 'not rock' is similar to 'rock'", §4.2.1) — so `negative_prompt[]` can only be honoured by SQL predicates, never by embedding distance.
4. **pgvector 0.8.6 on Postgres 16 is sufficient and already on the host.** README (read `[FULL]`): exact search by default (perfect recall) — at tens to thousands of rows no index is needed; HNSW (`m`=16, `ef_construction`=64 defaults, `hnsw.ef_search`=40 default) when the catalogue grows; `halfvec` up to 4,000 dims; filtering is applied AFTER the approximate scan, so with a 10 % selective filter and ef_search=40 "only 4 rows will match on average" — fix is `SET hnsw.iterative_scan = strict_order|relaxed_order` (0.8.0+) or partial indexes per `vocal.mode`. Katz's primary benchmark (r7gd.16xlarge, PostgreSQL 16.2, 1 M × 1536-d, ef_construction=256): `halfvec` recall 95.4 % at ef_search=40 with p99 1.20 ms; 99.8 % at ef_search=200 with p99 4.38 ms — identical to `vector` recall.
5. **No universal threshold exists; calibrate negatives-first on OUR pairs.** MusicLM (read `[PARTIAL]`, §4 memorization): "we construct negative pairs by permuting the examples with target tokens and measure the empirical distribution of matching costs for such negative pairs. We set the match threshold τ to 0.85, which leads to less than 0.01 % false positive approximate matches." We adopt the PROCEDURE (permuted brief↔take negatives → empirical score distribution → threshold at a chosen false-accept rate), never the number.
6. **Committed staged architecture (item 8):** Stage 1 = SQL hard filters + weighted structured score + `BAAI/bge-m3` (MIT, 1024-d, 100+ languages incl. Turkish) cosine over the *serialised brief text*; Stage 2 = `laion/larger_clap_music` audio embedding of each catalogue take (computed once at write-time, 512-d, stored as `halfvec(512)`) compared to the CLAP *text* embedding of the new brief AND to the CLAP *audio* embedding of the take the listener just accepted; Stage 3 = Reciprocal Rank Fusion (k = 60, Cormack et al. 2009) over the Stage-1 and Stage-2 rankings, then a calibrated accept/reject threshold learned negatives-first from permuted pairs and validated on real early-skip (<10 s) / full-listen (≥90 %) labels. Falsifiers in §Recommendation.

# Methodology and query log (exact queries, dates)

All external actions 2026-09-03, 08:58–10:27 (+03). Local intake (MODE B, no preflight required by the covenant) preceded them: COMMON-BRIEF.md, SLICE-B.md, covenant Part I + R0–R18, `docs/research/2026-08-17-rhythmic-monotony-and-take-similarity-gate.md` (grep for CLAP/MERT/0.85/Qmax/Haitsma), `docs/api/12-originality-gate.md` (lines 1–80), `docs/api/04-request-body-full.md` line 49 (genre vocabulary 2,196 entries).

| # | System | Exact query / URL | Yield / fate |
| --- | --- | --- | --- |
| Q1 | Web search (R4.1 broad scoping) | `text-to-music retrieval audio-text joint embedding benchmark 2025 2026 recall@10 Song Describer MusicCaps` | 5 hits; discovered FIGMA (ACL 2026, arXiv:2606.06615) and TTMR++ (arXiv:2410.03264); both captured |
| Q2 | Web search | `MuQ-MuLan 2025 music-text joint embedding license Hugging Face OpenMuQ` | HF card raw README + GitHub README + PyPI: weights cc-by-nc-4.0 confirmed on 3 surfaces of one provenance family |
| Q3 | Web search | `pgvector HNSW halfvec benchmark recall latency 1 million vectors Postgres 16 2025` | Katz 2024 primary benchmark (captured); Supabase 0.7.0 post; Neon halfvec post; two SEO comparison blogs EXCLUDED (undated secondary, no method) |
| Q4 | Web search | `multilingual text embedding model open weights license Turkish MTEB 2025 bge-m3 multilingual-e5 Apache-2.0 MIT` | bge-m3 HF card + arXiv:2402.03216; 3 blogs disagree on bge-m3 licence (Apache-2.0 vs MIT) → resolved by HF card raw frontmatter `license: mit` |
| Q5 | Fetch | `https://arxiv.org/abs/2211.06687` (CLAP) | `[FULL]` read incl. appendices C–H |
| Q6 | Fetch | `https://arxiv.org/abs/2208.12415` (MuLan) | `[FULL]` read |
| Q7 | Fetch | `https://huggingface.co/laion/larger_clap_music/raw/main/README.md` | `[FULL]`; `license: apache-2.0` |
| Q8 | Fetch | `https://raw.githubusercontent.com/pgvector/pgvector/master/README.md` | `[FULL]`; README at tag v0.8.6 |
| Q9 | Web search | `Song Describer Dataset Manco 2023 arXiv music captioning evaluation retrieval CC BY licence 1,106 captions` | arXiv:2311.10057 HTML + QMUL accepted PDF + Zenodo DOI |
| Q10 | Web search | `Cormack Clarke Buettcher 2009 Reciprocal rank fusion outperforms Condorcet SIGIR pdf k=60` | author-hosted PDF excerpts (k=60 pilot, Table 2 results); ACM DOI 10.1145/1571941.1572114 |
| Q11 | Web search | `CLAP audio embedding inference latency CPU HTSAT 10 second clip milliseconds onnx benchmark laion clap parameters 190M` | dev.to ONNX CPU measurement (55 ms/clip, Apple M4 Max); lquint ONNX export card (audio tower ≈29 M params, 114 MB); AudioMuse DCLAP distilled 7 M-param student |
| Q12 | Read (captured) | arXiv:2311.10057 HTML | `[FULL]` incl. datasheet appendix |
| Q13 | Read (captured) | arXiv:2606.06615v1 HTML (FIGMA) | `[FULL]` incl. appendices A–G |
| Q14 | Fetch | `https://huggingface.co/BAAI/bge-m3/raw/main/README.md` | `[FULL]`; `license: mit` |
| Q15 | Fetch | `https://huggingface.co/intfloat/multilingual-e5-large/raw/main/README.md` | `[PARTIAL]` (frontmatter `license: mit`, "24 layers and the embedding size is 1024") |
| Q16 | Fetch | `https://arxiv.org/abs/2301.11325` (MusicLM) | `[PARTIAL]`: §4 memorization methodology, §5 memorization analysis, §7 read verbatim; rest not read |
| Q17 | Grep (captured) | Katz 2024 quantization post | setup (r7gd.16xlarge, PostgreSQL 16.2, ANN-Benchmarks datasets) + dbpedia-1M tables read |

Adversarial lane run: Q1/Q13 deliberately surfaced the *failure* of CLAP on long captions (FIGMA) and out-of-domain (SDD); Q2 surfaced the licence conflict of the newest model. Not run (time): Meta FAIR audio-text models, Microsoft CLAP licence, Spotify/Deezer text-based continuation papers, MTG Essentia similarity, Qdrant/Milvus/Weaviate/OpenSearch comparison — listed as gaps.

# Universe and coverage ledger

| universe_id | entity / work | why in scope | discovery path | screened | included | latest checked | gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U-ACAD-1 | LAION CLAP (Mila/UCSD/LAION), arXiv:2211.06687 | mandatory seed; the lawful audio-text model | seed → fetch | yes | `[FULL]` | 2026-09-03 | — |
| U-ACAD-2 | MuLan (Google), arXiv:2208.12415 | mandatory seed; negation finding | seed → fetch | yes | `[FULL]` | 2026-09-03 | no public weights stated in paper |
| U-ACAD-3 | Song Describer Dataset (QMUL/UPF/KAIST), arXiv:2311.10057 | mandatory benchmark seed | Q9 | yes | `[FULL]` | 2026-09-03 | — |
| U-ACAD-4 | FIGMA (UMD), ACL 2026 / arXiv:2606.06615 | 2026 successor; token-saturation finding | Q1 | yes | `[FULL]` | 2026-09-03 | weight licence unverified |
| U-ACAD-5 | MusicLM (Google), arXiv:2301.11325 | τ=0.85 calibration procedure | seed → fetch | yes | `[PARTIAL]` | 2026-09-03 | — |
| U-ACAD-6 | TTMR++ (KAIST et al.), arXiv:2410.03264 | text-to-music retrieval with metadata | Q1 | yes | `[PARTIAL]` (Table 2 via capture) | 2026-09-03 | full read pending |
| U-ACAD-7 | BGE-M3 paper arXiv:2402.03216 | multilingual text embedding | Q4 | yes | `[ABS]` | 2026-09-03 | — |
| U-ACAD-8 | Cormack, Clarke, Büttcher SIGIR 2009 (RRF) | score fusion | Q10 | yes | `[PARTIAL]` | 2026-09-03 | — |
| U-CO-1 | LAION (HF `laion/larger_clap_music`) | licence re-verification | Q7 | yes | `[FULL]` | 2026-09-03 | — |
| U-CO-2 | Tencent AI Lab / OpenMuQ (MuQ, MuQ-MuLan) | 2025 model licence | Q2 | yes | `[PARTIAL]` | 2026-09-03 | — |
| U-CO-3 | BAAI (bge-m3) | prompt text embedding | Q4/Q14 | yes | `[FULL]` | 2026-09-03 | — |
| U-CO-4 | Microsoft (multilingual-e5-large) | alternative text embedding; FIGMA's text tower | Q15 | yes | `[PARTIAL]` | 2026-09-03 | Microsoft CLAP licence not checked |
| U-CO-5 | Meta FAIR audio-text models | slice item 2c names them | — | no | — | — | NOT SWEPT (time) |
| U-CODE-1 | pgvector/pgvector README v0.8.6 | index on our stack | Q8 | yes | `[FULL]` | 2026-09-03 | — |
| U-CODE-2 | jkatz05 pgvector quantization benchmark 2024 | primary recall/latency numbers | Q3 | yes | `[PARTIAL]` | 2026-09-03 | — |
| U-CODE-3 | Supabase pgvector 0.7.0 post; Neon halfvec post | independent halfvec measurements | Q3 | yes | `[PARTIAL]` | 2026-09-03 | — |
| U-CODE-4 | lquint/clap-htsat-unfused-onnx; NeptuneHub/AudioMuse-AI-DCLAP; dev.to ONNX CPU test | CPU cost evidence | Q11 | yes | `[PARTIAL]` | 2026-09-03 | m7i.large not measured by anyone found |
| U-ALT-1 | Qdrant, Milvus, Weaviate, OpenSearch k-NN | slice item 3 comparison | — | no | — | — | NOT SWEPT (time); only the two excluded blogs mention them |
| U-LOCAL-1 | project docs/api/12, docs/api/04, research 2026-08-17 | project truth | local | yes | `[PARTIAL]` | 2026-09-03 | — |

# Source register summary and read-status counts

Full register: `docs/research/2026-09-03-reuse-slice-b-source-register.md`.

- Independent authoritative provenance families consulted: **14** (S01 CLAP paper+HF card family, S02 MuLan, S03 SDD family incl. Zenodo, S04 FIGMA, S05 MusicLM, S06 TTMR++, S07 MuQ/MuQ-MuLan family, S08 pgvector README, S09 Katz benchmark, S10 Supabase post, S11 Neon post, S12 BAAI bge-m3 family, S13 intfloat e5, S14 Cormack RRF) plus S15 CPU-cost community evidence (3 URLs, low tier) and project-local documents.
- Academic sources: **8** (S01–S06, bge-m3 paper, RRF). Academic read `[FULL]` with five-part records: **4** (CLAP, MuLan, SDD, FIGMA). Primary `[FULL]`: **7** (the 4 papers + `laion/larger_clap_music` card + pgvector README + `BAAI/bge-m3` card).
- Slice floor (≥10 authoritative, ≥3 academic `[FULL]`): **met**. Run-level floor (≥20 / ≥5) is the parent's aggregate duty across four slices.

# Findings by subquestion

## Item 1 — The retrieval problem, defined precisely for PlayMusicPrompts

- **Query object q** = the new generation brief exactly as `music_jobs.requestBody` would carry it: free-text `prompt` (English or Turkish), `genres[]` (from the engine's 2,196-entry flat `genre_vocabulary`, docs/api/04 line 49), `moods[]`, `eras[]`, `vocal.mode` ∈ {instrumental, male, female, duet, choir, spoken} (docs/api/05), `vocal.language`, `duration.target_seconds`, `tempo_bpm`, `negative_prompt[]`, plus the listener session signals (early skips < 10 s, full listens ≥ 90 %, per Berk's 2026-08-29 playlist algorithm in the brief).
- **Corpus C** = every previously delivered take: its own brief, the delivered audio (WAV, −14 LUFS), and verification facts (`lyrics_verification`, `originality_gate` axis-1 monotony and axis-2 between-take scores when present).
- **Relevance definition** = a take t is relevant to q iff a listener who submitted q would accept t as the next track. This is an *acceptance* relation, observable only through behaviour (skip/listen). It is asymmetric to "same song": two takes of one request are near-duplicates (axis-2 already measures that, docs/api/12), whereas a *reuse* candidate must be *similar enough to belong to the same station* and *different enough not to feel like a repeat* — i.e., the target similarity band is bounded above as well as below. INFERENCE from the product rule "3 takes in different tones … early skip = strong reject".
- **Output** = a ranked list with a calibrated probability P(accept | q, t) and an abstain option ("generate instead") when no candidate clears the threshold.
- **Hard constraints** (never soft-scored): `vocal.mode` compatibility (a listener asking for instrumental must not receive sung audio), `vocal.language`, a duration band around `duration.target_seconds`, and every `negative_prompt[]` term absent from t's genres/moods/prompt. Rationale: MuLan §4.2.1 measures that contrastive text encoders fail on negation ("not rock" ≈ "rock") — negatives cannot be delegated to any embedding. SOURCE CLAIM S02.
- **Repeat suppression**: exclude takes already heard in this session/anon-id (a simple SQL anti-join on a `listen_events` table) — otherwise the highest-similarity candidate is the track just played.

## Item 2 — Method families

### 2a. Text–text similarity of prompts

| Model | Licence (read this session) | Dim / context | Languages | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| `BAAI/bge-m3` | HF card frontmatter `license: mit` (S12) | 1024-d, 8,192 tokens; dense + sparse (lexical weights) + ColBERT multi-vector in one model | "more than 100 working languages" (card) | arXiv:2402.03216 `[ABS]`: self-knowledge distillation, SOTA multilingual/cross-lingual retrieval | **ADOPT** for prompt↔prompt similarity; sparse mode gives BM25-like genre-token overlap for free |
| `intfloat/multilingual-e5-large` | HF card `license: mit` (S13) | 1024-d, 24 layers | multilingual (card) | FIGMA uses the *-instruct* variant as its frozen text tower (S04 §3.1.1) | ALTERNATIVE; `[PARTIAL]` — Turkish quality not measured by us |
| OpenAI / Cohere embedding APIs | paid | — | — | secondary blogs only | **FLAG — paid vendor; NOT recommended; requires Berk's approval per owner constraint** |

Numbers: bge-m3 card reports its MIRACL/MKQA/MLDR results only as images (not transcribable here) — no numeric claim made; three secondary blogs assert MTEB averages 66.1–68.2 for bge-m3 but disagree on its licence, so they are EXCLUDED from load-bearing use. What matters for us is: multilingual (Turkish prompts), lawful (MIT), 568 M params (card table via S12/blog; `[single-source]` for the param count), CPU-runnable via sentence-transformers / FlagEmbedding `use_fp16`. What to embed: a *canonical serialisation* of the brief ("genres: …; moods: …; eras: …; vocal: …; tempo: … bpm; prompt: …"), so two briefs with the same structured fields but different free text land close. INFERENCE.

### 2b. Structured-parameter similarity

- Exact/weighted match on `vocal.mode`, `vocal.language`, tempo band (e.g., ±8 % of `tempo_bpm` — OWNER/CALIBRATION DECISION, not a literature constant), duration band, `eras[]` overlap, `moods[]` Jaccard, `genres[]` Jaccard.
- **The engine's 2,196-genre list is flat (docs/api/04 line 49; no parent/child field).** Implication: Jaccard on genre strings treats "deep house" and "tech house" as unrelated. Two remedies, both lawful and already in-repo: (i) the project's own 2026-08-18 captures `docs/research/_sources/2026-08-18-wikidata-music-genre-subclass-graph.json` and `2026-08-18-musicbrainz-genres-ws2.json` give a subclass graph over which a Wu-Palmer / shortest-path ontology distance can be computed once and cached as a genre×genre matrix (2,196² ≈ 4.8 M floats ≈ 19 MB, fine as `halfvec` rows or a plain table); (ii) embed each genre name with bge-m3 and use cosine between genre names as a soft-match kernel (captures "synthwave"~"retrowave" without a graph). Recommend (ii) first (zero curation), (i) when the catalogue gates on genre precision. INFERENCE; no source states a genre-distance constant.
- Weights for the structured score are **not** to be hand-picked: learn them by logistic regression on the labelled accept/skip pairs from Item 4 (the calibration set), or, before labels exist, use equal weights and report it as uncalibrated.

### 2c. Audio–text joint embeddings

| Model | Licence | Dims / input | Retrieval numbers (primary) | Verdict |
| --- | --- | --- | --- | --- |
| LAION CLAP `laion/larger_clap_music` (S01 paper `[FULL]`, S01 card `[FULL]`) | apache-2.0 | 512-d joint space; text tokenised to max 77 tokens (paper §4.1); audio 10-s windows at 48 kHz, feature fusion for T > 10 s (§3.4, eq. 4) | Paper (general audio): AudioCaps T→A R@1 36.7 / R@10 83.7; Clotho R@1 18.2 (Table 3). Music benchmarks from independent papers: SDD T→A R@1 4.42 / R@5 17.02 / R@10 26.01, MedR 36 (S03 Table 5); MusicBench T2A R@1 25.38 / R@10 68.53; FMACaps-Eval R@1 2.60 / R@10 14.80 (S04 Tables 2–3) | **ADOPT (Stage 2)** — the only lawful open music-text joint embedding found |
| MuLan (Google) (S02 `[FULL]`) | no public release stated in the paper; `[UNVERIFIED]` whether any official weights exist | 128-d; 10-s windows; BERT text tower n=512 tokens; 44 M clips / 370 K h | Playlist-title retrieval AUC 0.933 / mAP 0.110; description AUC 0.903 / mAP 0.090 (Table 5); zero-shot MTAT AUC 0.778 (Table 4a) | AVOID (not available); its *findings* (negation failure; playlist titles as queries) inform design |
| MuQ-MuLan (Tencent, 2025) (S07) | weights **cc-by-nc-4.0**; code MIT | ~700 M params (README table) | MusicBench T2A R@1 20.81 / R@10 62.94; FMACaps R@1 4.10 / R@10 17.80 (S04 Tables 2–3) | **FORBIDDEN** (NonCommercial) |
| FIGMA (UMD, ACL 2026) (S04 `[FULL]`) | built on frozen MuQ (NC) + multilingual-e5-large-instruct; its own weight licence not stated in paper → `[UNVERIFIED]`; INFERENCE: NC-poisoned | 512-d; 22 M trainable projection params over ~800 M frozen | MusicBench T2A R@1 34.52 / R@10 81.73; FMACaps R@1 13.00 / R@10 37.60; FGMCaps R@1 26.15 (Tables 2, 3, 5) | AVOID for production (licence chain); ADOPT its *method insight* (frame/token-level alignment for tempo/key) as a future BUILD if a lawful audio encoder replaces MuQ |
| Microsoft CLAP 2022/2023 | licence NOT checked this session `[UNVERIFIED]` | — | MusicBench T2A R@1 6.09 (2022) / 20.30 (2023) — both below LAION-CLAP(Music) (S04 Table 2) | not preferred on performance grounds regardless of licence |
| Meta models | NOT SWEPT (time) | — | — | GAP |

Key mechanism facts from S01 `[FULL]`: contrastive InfoNCE loss eq. (3); HTSAT-RoBERTa chosen over PANN/BERT/CLIP-text (Table 2: HTSAT+RoBERTa mAP@10 51.3 T→A on AudioCaps vs 6.0 for HTSAT+CLIP-text); scaling data from AudioCaps+Clotho to LAION-Audio-630K *lowered* AudioCaps R@1 (36.7→32.7) while raising Clotho (12.0→15.6) — a documented distribution trade-off, which is why the *music* checkpoint (not evaluated in the paper) is the right one for us and why our own catalogue is out-of-distribution for any public checkpoint.

### 2d. Audio–audio similarity of the catalogue

- Already in the engine for WITHIN-request pairs: Serrà Qmax + Haitsma–Kalker BER, run in a background thread, ordered pairs, plus a Vendi "effective distinct takes" aggregate (docs/api/12 §Axis 2; committed in research 2026-08-17 with Qmax parameters m=10, κ=0.1, γo=5, γe=0.5 and HK α=0.35 → P_f 3.6·10⁻²⁰). **Assessment for ACROSS-request reuse:** Qmax/BER are *near-duplicate* detectors; for reuse they are the wrong *sign* — we want to *exclude* near-duplicates of what the listener just heard (BER < 0.35 or high normalised Qmax ⇒ "same piece", reject as repeat) and *include* neighbours that share style. So they become a **repeat-suppression guard**, not a ranking signal. INFERENCE grounded in S(local) 2026-08-17 F3/F4.
- Modern embedding similarity: CLAP audio↔audio cosine (apache-2.0). No paper read this session publishes an audio-audio acceptance threshold for CLAP; this is the calibration duty of Item 4. MERT (CC-BY-NC-4.0) remains **FORBIDDEN** (prior finding, not re-opened this session — `[single-source]` relay of research 2026-08-17 claim 6, which itself was VERIFIED 3+).
- Complexity: Qmax is O(n·m) per pair on chroma frames and is the expensive part; CLAP audio embedding is one forward pass per 10-s window and then O(d) per pair — computing it once at write-time (Item 7) makes cross-request comparison a vector lookup.

### 2e. Hybrid ranking

- **Reciprocal Rank Fusion** (Cormack, Clarke, Büttcher, SIGIR 2009, S14 `[PARTIAL]`): RRFscore(d) = Σ_r 1/(k + r(d)), k = 60 "fixed during a pilot investigation and not altered during subsequent validation"; the pilot (Table 1) "indicated that k = 60 was near-optimal, but that the choice was not critical"; on TREC 3/5/9/Robust RRF beat Condorcet Fuse in all cases and CombMNZ in all but one, and on LETOR 3 beat every individual learning-to-rank method (Table 3). RRF needs no score normalisation, which matters because Stage-1 (cosine over text) and Stage-2 (cosine over CLAP) live on different scales.
- **Learned fusion**: bge-m3's own card recommends "hybrid retrieval + re-ranking" and exposes a weighted sum of dense/sparse/colbert scores (`weights_for_different_modes`), a template for a learned linear fusion once accept/skip labels exist (logistic regression over [structured score, bge-m3 cosine, CLAP text→audio cosine, CLAP audio→audio cosine to the last accepted take]). INFERENCE.
- Order of operations that the pgvector README makes mandatory: filter (SQL predicates) THEN vector order, or use iterative scans — otherwise post-filtering an approximate index returns too few rows (README §Filtering: 10 % selectivity × ef_search 40 ⇒ ~4 rows).

## Item 3 — Storage and indexing on our stack (pgvector 0.8.6 on Postgres 16)

All facts from the pgvector README at tag v0.8.6 (S08 `[FULL]`) unless marked.

- **Types and limits:** `vector` up to 2,000 dims; `halfvec` up to 4,000; `bit` up to 64,000; `sparsevec` up to 1,000 non-zero. Our vectors: CLAP 512-d, bge-m3 dense 1,024-d — both fit `vector` and `halfvec`. bge-m3 sparse lexical weights fit `sparsevec`.
- **Distance operators:** `<->` L2, `<#>` negative inner product, `<=>` cosine distance, `<+>` L1, `<~>` Hamming, `<%>` Jaccard. Cosine similarity = `1 - (a <=> b)`. For L2-normalised embeddings (CLAP and bge-m3 both output normalised vectors) the README says "use inner product for best performance".
- **Exact search is the default and gives perfect recall** — for a catalogue of 10³ rows no index is needed; `max_parallel_workers_per_gather` can be raised for exact scans.
- **HNSW:** `m` default 16, `ef_construction` default 64, `hnsw.ef_search` default 40 (`SET LOCAL` per transaction); higher ef_search = better recall, slower. Index can be built on an empty table (no training step). Build "significantly faster when the graph fits into `maintenance_work_mem`"; parallel builds via `max_parallel_maintenance_workers`. **IVFFlat:** `lists ≈ rows/1000` up to 1 M rows, `sqrt(rows)` above; `probes ≈ sqrt(lists)`; needs data before build; lower speed-recall than HNSW. For our growth path (10³ → 10⁵) HNSW is the right choice; IVFFlat's training step is a maintenance burden with a continuously growing table. INFERENCE from README trade-off statement.
- **Filter-then-vector (hybrid SQL):** "With approximate indexes, filtering is applied *after* the index is scanned. If a condition matches 10 % of rows, with HNSW and the default hnsw.ef_search of 40, only 4 rows will match on average." Remedies in the README: `SET hnsw.iterative_scan = strict_order` or `relaxed_order` (0.8.0+; bounded by `hnsw.max_scan_tuples`, default raised via `SET hnsw.max_scan_tuples = 20000`, and `hnsw.scan_mem_multiplier`); **partial indexes** when filtering on few distinct values — exactly our `vocal.mode` (6 values) and `vocal.language`; a B-tree on the filter column for exact search. Concrete pattern for us: `CREATE INDEX … USING hnsw (clap_audio halfvec_ip_ops) WHERE vocal_mode = 'instrumental'` etc., then `WHERE vocal_mode = $1 AND duration_seconds BETWEEN $2 AND $3 ORDER BY clap_audio <#> $4 LIMIT 20`. Distance-threshold filters go in an outer query over a materialised CTE (README §Iterative Index Scans example).
- **halfvec / quantisation:** README: "Use the `halfvec` type instead of `vector` for a smaller working set"; expression index `USING hnsw ((embedding::halfvec(512)) halfvec_ip_ops)`; binary quantisation via `bit` with re-ranking by the full vector. Primary measurements (S09 Katz, r7gd.16xlarge, PostgreSQL 16.2, `dbpedia-openai-1000k-angular`, 1 M × 1536-d, HNSW ef_construction=256, LIMIT 10): `vector` vs `halfvec` recall 77.7 % vs 77.5 % (ef_search 10), **95.4 % vs 95.4 % (40)**, **99.8 % vs 99.8 % (200)**, 100 % vs 100 % (800); p99 latency `halfvec` 0.68 / 1.20 / 4.38 / 14.80 ms; halfvec index ≈ half the size. Independent corroboration: Supabase 0.7.0 post (S10) table — index 7,734 MB → 3,867 MB, build 264 s → 90 s, recall @ef_search 40 = 0.945 both, @200 = 0.987 both; Neon (S11) on 1 M × 1536-d, 8 CPU / 32 GB: −50 % storage, −23 % build time, "equivalent query execution time and recall", but binary quantisation recall "not significant enough to use this in production" at 1536-d. Three independent producers agree → VERIFIED 3+ that halfvec is recall-neutral at ef_construction ≥ 64–256 on 1 M rows.
- **Recall–latency by scale requested (10³ / 10⁵ / 10⁶):** 10³ — exact scan, recall 100 %, sub-millisecond on any instance (INFERENCE from README default behaviour; no primary measured 10³ because it is trivial); 10⁵ — no primary number found this session for 512-d at 10⁵ rows (`[UNVERIFIED]`; the two blogs that quote 100 K p50 3 ms / p99 8 ms are excluded as undated secondary); 10⁶ — the Katz/Supabase/Neon numbers above (1536-d; our 512-d vectors are 3× smaller, so these are conservative upper bounds — INFERENCE).
- **Alternatives (Qdrant, Milvus, Weaviate, OpenSearch k-NN):** NOT researched from primary sources this session (time); every hosted variant would be a **new paid vendor → FLAG, needs Berk's approval**; nothing in the evidence suggests pgvector is insufficient below 10⁶ rows, which is orders of magnitude above the catalogue this decision concerns.

## Item 4 — Calibration and thresholds

- **Prior finding stands:** no source read this session publishes a reusable acceptance threshold for CLAP cosine, bge-m3 cosine or structured scores; every published number is a *ranking* metric (R@K, mAP, AUC), never an absolute cut.
- **Procedure to adopt (from MusicLM §4, S05 `[PARTIAL]`, quoted verbatim):** "we construct negative pairs by permuting the examples with target tokens and measure the empirical distribution of matching costs for such negative pairs. We set the match threshold τ to 0.85, which leads to less than 0.01 % false positive approximate matches." Translation to OUR data:
  1. **Negatives-first:** for every stored take t with brief b_t, form permuted pairs (b_i, t_j), i ≠ j, excluding pairs whose structured fields already match (they are ambiguous, not negatives). Compute each stage's score. The empirical distribution of these scores is the null; pick the threshold at the false-accept rate Berk accepts (OWNER-DECISION: e.g., 1 % vs 0.01 % — MusicLM's 0.01 % is a memorization-audit standard, far stricter than a playlist needs; INFERENCE).
  2. **Positives:** real listener events only (no synthetic labels): (q, t) pairs where t was served (generated or reused) for brief q and the listener played ≥ 90 % (accept) or skipped < 10 s (reject) — Berk's own signals from the 2026-08-29 algorithm. The first positives come from *generated* takes (q, own take) — they define the "this is what a listener accepts for q" band.
  3. **Metric to report:** precision at the reuse threshold (share of reused tracks not early-skipped), coverage / hit-rate (share of briefs for which a candidate cleared the threshold and reuse happened), and the confusion between early-skip rate of reused vs freshly generated tracks. Report the ROC over the permuted-negative null and the real-positive set; choose the operating point on the curve, never a literal.
  4. **Minimum labelled set:** MusicLM's 0.01 % FP claim requires ≥ 10⁴ negative pairs to be estimable at all (INFERENCE: 1/0.0001); permuted pairs scale as n² so 150 takes already yield ~22,000 negatives. Positives are the bottleneck: with a binomial standard error √(p(1−p)/n), n = 100 labelled accept/skip events gives ±5 pp on a 50 % rate — the minimum before any weight is *learned*; below that, use RRF with equal treatment and report "uncalibrated". CALCULATION.
  5. **Re-calibrate on drift:** the null shifts whenever the engine, the prompt UI or the catalogue mix changes — store the threshold with the model version and date (R16.3 living state).
- FIGMA's hard-negative protocol (S04 Table 4: altering exactly one attribute — key, BPM, tempo marking, beat count, chords — drops A2T R@1 from 46.53 to 34.87–43.20) is the template for *attribute-perturbation negatives*: to test whether our fusion respects `tempo_bpm` or `vocal.mode`, perturb one field of a real brief and confirm the acceptance score drops.

## Item 5 — Evaluation

- **Offline (benchmarks, values from primaries):** SDD (S03, 706 recordings / 1,106 captions, CC BY-SA 4.0, evaluation-only): CLAP T→A R@1 4.42 / R@5 17.02 / R@10 26.01 / MedR 36; TTMR 2.95 / 10.19 / 17.43 / 51; on MusicCaps CLAP 3.81 / 10.95 / 17.18 / MedR 82.5 (Table 5). MusicBench (S04 Table 2): LAION-CLAP(Music) T2A R@1 25.38 / R@5 55.84 / R@10 68.53 / R@20 79.70; FIGMA 34.52 / 65.99 / 81.73 / 91.37. FMACaps-Eval (S04 Table 3): LAION-CLAP(Music) 2.60 / 9.40 / 14.80 / 21.60. TTMR++ (S06 `[PARTIAL]`, Table 2 excerpt): caption R@10 on MusicCaps-eval 29.2 and Song Describer 38.3 with track-to-artist text; CLAP-Fusion 17.6 / 25.7. **Reading for our decision:** on out-of-domain music, a single-vector CLAP puts the correct clip in the top-10 only 15–26 % of the time; the *catalogue* task is easier (we need any acceptable neighbour, not the one true clip), but these numbers forbid using CLAP alone as the acceptance gate. Our own offline proxy: hold out real (q, own-take) pairs and measure R@K of the pipeline at retrieving the listener's own accepted take among decoys — a known-item test on real data, no synthetic captions.
- **Online:** A/B by anon-id or session — arm A always generates, arm B serves a reuse candidate when the calibrated threshold is cleared. Primary metric: early-skip rate (< 10 s) of the *next track*, reuse vs generated; secondary: full-listen (≥ 90 %) rate, session length, and $ saved (each reuse avoids one $0.08 take and 25–145 s). Guardrail: stop reuse for a brief class if its early-skip rate exceeds the generated baseline by a pre-registered margin (commit-first evaluation, rules/05). Log every served candidate with its stage scores so the calibration set (Item 4) grows from production.

## Item 6 — Cold start (tens to hundreds of tracks)

- With 10–300 takes, an approximate index buys nothing (README: exact search default, perfect recall); a full scan over 300 × 512-d is trivial.
- The problem at cold start is **coverage**, not speed: the probability that any stored take passes the hard filters *and* the calibrated threshold is low, so reuse rarely fires — that is correct behaviour (generate instead), not a defect.
- Which method works with tiny corpora: Stage 1 (structured filter + bge-m3 prompt cosine) works from the first row because it does not learn from the corpus; its threshold can be calibrated on permuted brief pairs alone (n² negatives). Stage 2 (CLAP audio) also needs no training, but its *audio→audio* use (nearest neighbour to the last accepted take) only becomes informative once several takes share a station. **Add the audio-embedding stage from day one at write-time** (it is one forward pass per take, and back-filling later means re-fetching every WAV), but **weight it into the decision only after ≥ 100 real accept/skip labels exist** (Item 4.4). INFERENCE.

## Item 7 — Compute cost and placement

- **CLAP inference:** model card shows CPU usage directly (`ClapModel.from_pretrained("laion/larger_clap_music")`, `get_audio_features`) (S01 card). Audio tower ≈ 29 M params / 114 MB as ONNX (lquint export card, `[single-source]`); full fused CLAP ≈ 154 M params (aggregator page, `[UNVERIFIED]`). Measured CPU cost (community, single run, Apple M4 Max, ONNX Runtime CPU provider, `clap-htsat-unfused` audio tower): **0.055 s per 10-s clip including decode + preprocessing** (100 clips in 5.458 s) — `[single-source]`, not our hardware. A distilled 7 M-param student (AudioMuse DCLAP) runs "5–6× faster" on a Raspberry Pi 5 (`[single-source]`, GitHub README). **No m7i.large measurement exists in any source found; it must be measured on the instance before the design is called costed** (`[UNVERIFIED]`). Order-of-magnitude INFERENCE: a 60-s take = 6 windows ≈ a few hundred ms on a modern x86 core; well under the 25–145 s generation it replaces.
- **Where it runs:** write-time, once per take, in the existing post-generation step (`deploy/payload/lib/music/jobs.ts` is the parent's file — this slice only names the stage). Query-time work is then: one bge-m3 text embedding of the brief (568 M-param encoder, CPU-runnable in fp16 — latency on m7i.large `[UNVERIFIED]`, to be measured), one CLAP *text* embedding (RoBERTa tower, small), and pgvector lookups (< 5 ms p99 even at 1 M rows per S09). Latency budget: the buffer algorithm fires generation at track START when the buffer is short (brief §CONTEXT-03), so the reuse decision has the whole current track's duration; a target of < 2 s end-to-end keeps it invisible. INFERENCE.
- **GPU:** not required at this scale; a GPU would be a new cost line — FLAG, no recommendation.

## Item 8 — Recommendation for this slice (staged architecture)

See §Recommendation below (kept in one place to avoid duplication).

## Five-part academic records (each [FULL] primary)

### S01 — Wu, Chen, Zhang, Hui, Nezhurina, Berg-Kirkpatrick, Dubnov. "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation." arXiv:2211.06687 (ICASSP 2023). `[FULL]` incl. Appendices A–H.
1. **Problem (authors' framing):** prior language-audio contrastive models trained on small datasets, lacked encoder ablations, could not handle variable-length audio, and were evaluated only on retrieval (§1).
2. **Method:** two encoders + 2-layer MLP projections to D = 512 (eqs. 1–2); symmetric InfoNCE loss with learnable τ (eq. 3); audio encoders PANN (L=2048) / HTSAT (L=768), text encoders CLIP-text/BERT/RoBERTa; feature fusion for T > d = 10 s: global downsample + three random 10-s local slices fused by attentional feature fusion α (eq. 4); keyword-to-caption via T5; 48 kHz mono, 64 mel bins, 1024 window / 480 hop; text max 77 tokens; batch 768–4608, 45 epochs (§3–§4.1).
3. **Numbers:** Table 2 (AudioCaps+Clotho only): HTSAT+RoBERTa mAP@10 A→T 45.7 / T→A 51.3 (AudioCaps), 13.8 / 20.4 (Clotho); CLIP-text encoders collapse (2.4 / 6.0). Table 3: best T→A R@1 36.7 (AudioCaps), 18.2 (Clotho); adding LAION-Audio-630K lowers AudioCaps R@1 32.7 while raising Clotho 15.6. Table 4: zero-shot ESC-50 89.1 → 91.0 with K2C aug. Appendix D: Freesound portion carries 63,693 CC-BY-NC clips (training-data licence note).
4. **Limitations (stated):** dataset-distribution trade-off between AudioSet-like and other audio (§4.2); text ≤ 77 tokens; no music-specific evaluation in this paper. **Analyst-identified:** the music checkpoint we use is *not* evaluated here; training data includes CC-BY-NC audio (the *model* is Apache-2.0 per its card — the licence of weights, not data, governs our use; noted, not resolved).
5. **Application here:** Stage-2 model choice; 77-token cap means the brief must be *compressed* (structured fields, not the full prose) before CLAP text embedding, and the prose belongs to bge-m3 instead; audio embedding per 10-s window with fusion for our 20–58 s takes; store 512-d as `halfvec(512)`.

### S02 — Huang, Jansen, Lee, Ganti, Li, Ellis. "MuLan: A Joint Embedding of Music Audio and Natural Language." arXiv:2208.12415 (ISMIR 2022). `[FULL]`.
1. **Problem:** tagging/retrieval systems bound to rigid ontologies; goal is a free-form natural-language interface to music audio (§1).
2. **Method:** two-tower, ℓ2-normalised d = 128; Contrastive Multiview Coding loss with critic h = exp(aᵀb/τ), τ init 0.1; audio ResNet-50 or AST on 10-s log-mel windows (F=64/128, T=1000); BERT-base text tower n = 512; 44 M 30-s clips (370 K h) with short-form / long-form / playlist-title / AudioSet text mixed 2:2:1:1; batch 6144 / 5120; 14 epochs (§3).
3. **Numbers:** Table 4: zero-shot AUC AudioSet Gen-25 0.840, Mu-141 0.909; MTAT top-50 0.778; linear probe MTAT 0.925–0.927. Table 5 (100 K-track pool, 7,000 expert playlists): title AUC 0.933 / mAP 0.110, description AUC 0.903 / mAP 0.090; ASET-only collapses to mAP 0.005. Table 6: text-triplet accuracy playlist 0.959 vs SBERT 0.942.
4. **Limitations (stated):** BERT-based text tower fails on negation ("not rock" ≈ "rock") and multi-sense tags (§4.2.1); text filtering possibly too aggressive; no release of weights stated ("first attempt … plenty of room for improvement"). **Analyst:** proprietary data and model — not reproducible for us.
5. **Application here:** negation → `negative_prompt[]` handled ONLY by SQL predicates; playlist *titles* as queries are the closest published analogue to our short station briefs and score higher than long descriptions (mAP 0.110 vs 0.090) — support for serialising the brief into a short tag-like string for the joint-embedding stage.

### S03 — Manco, Weck, Doh, Won, Zhang, Bogdanov, Wu, Chen, Tovstogan, Benetos, Quinton, Fazekas, Nam. "The Song Describer Dataset." arXiv:2311.10057 (NeurIPS 2023 ML4Audio). `[FULL]` incl. datasheet.
1. **Problem:** M&L models evaluated on private data; public sets (MusicCaps, YT8M-MTC) lack persistent, openly licensed audio and risk AudioSet leakage (§1–§2).
2. **Method:** crowdsourced single-sentence captions via the Song Describer platform, 142 volunteers, 25 Nov 2022 – 14 Apr 2023, tracks sampled from MTG-Jamendo split-0 test weighted by play count; manual validation into a 746-caption / 547-recording subset; benchmarks for captioning (BLEU/METEOR/ROUGE/BERT-score), generation (FAD/IS/KLD + CLAP Cycle Consistency) and retrieval (R@K, MedR) (§2–§3).
3. **Numbers:** Table 1: SDD 1,106 captions / 706 recordings, 2-min audio, 320 kbps 44.1 kHz MP3; Table 5: CLAP on SDD R@1 4.42 / R@5 17.02 / R@10 26.01 / MedR 36; TTMR 2.95 / 10.19 / 17.43 / 51; on MusicCaps CLAP 3.81 / 10.95 / 17.18 / 82.5. Licence CC BY-SA 4.0; audio re-distributed with individual CC licences.
4. **Limitations (stated):** small scale; annotators concentrated in English-speaking countries and Western Europe; evaluation-only ("we discourage using it for training"); retrieval scores inflated by small pool and by CLAP's AudioSet in-domain training (§3 Results). **Analyst:** 2-minute segments vs our 20–58 s takes; no Turkish captions.
5. **Application here:** the offline benchmark values above are the ceiling for any CLAP-only gate and justify the multi-stage design; SDD is lawful (CC BY-SA) as an *evaluation* harness if we ever want a public sanity check of our CLAP deployment; MedR 36 on a 706-pool means the correct clip typically sits mid-list — a threshold, not a rank, must decide reuse.

### S04 — Anand, Seth, Ghosh, Manocha, Duraiswami. "FIGMA: Towards FIne-Grained Music retrievAl." ACL 2026 (pp. 47559–47572, DOI 10.18653/v1/2026.acl-long.2197) / arXiv:2606.06615v1. `[FULL]` incl. Appendices A–G.
1. **Problem:** CLAP-family models "effectively utilize only the first few tokens" of long captions; retrieval saturates beyond ~40–50 tokens (Fig. 2, MusicBench); fine attributes (tempo, key, chords) are ignored (§1, §3).
2. **Method:** frozen MuQ audio encoder (24 kHz, T=250 frames × 1024) + frozen multilingual-e5-large-instruct text (L=128 × 1024); two 2-layer Transformer projection heads to 512-d (~22 M trainable over ~800 M frozen); Multi-View loss = α·global InfoNCE + (1−α)·frame-level loss where each frame takes its max-similarity token (eqs. 1–4), α = 0.6, τ = 0.07, batch 256, 15 epochs, 8×A100; FGMCaps dataset: 380,878 train / 10,000 test, captions generated by Qwen3-Next-80B from BeatNet tempo/beat, Omnizart chords, Essentia key (§3–§4, App. C).
3. **Numbers:** Table 2 MusicBench T2A R@1/5/10/20: LAION-CLAP(Music) 25.38 / 55.84 / 68.53 / 79.70; MuQ-MuLan 20.81 / 47.71 / 62.94 / 74.62; FIGMA 34.52 / 65.99 / 81.73 / 91.37. Table 3 FMACaps-Eval: LAION-CLAP(Music) 2.60 / 9.40 / 14.80 / 21.60; FIGMA 13.00 / 28.00 / 37.60 / 48.60. Table 4 hard negatives: original A2T R@1 46.53 → key 38.90, BPM 40.30, tempo marking 35.77, beat count 34.87, chords 43.20. Table 5 FGMCaps test: FIGMA 26.15 vs best baseline 2.22.
4. **Limitations (stated):** English-centric captions, cross-lingual not evaluated; attributes limited to tempo/key/beat/chords; max-operator alignment has no theoretical guarantee (§7); datasets "released under licenses permitting non-commercial academic use" (App. B.1). **Analyst:** built on MuQ whose weights are CC-BY-NC-4.0 → not deployable commercially; captions are LLM-generated (synthetic supervision).
5. **Application here:** (a) do NOT rely on a single CLAP text vector for our long structured briefs — split structured fields to SQL and prose to bge-m3; (b) adopt the single-attribute-perturbation protocol as our fusion regression test; (c) BUILD candidate for a later phase: frame/token alignment over a *lawful* audio encoder (CLAP audio tower) if tempo/key precision proves to matter in skip data.

## Companies / APIs / repositories

| Entity | Surface read | Version / date | Licence | Fact | Verdict |
| --- | --- | --- | --- | --- | --- |
| LAION — `laion/larger_clap_music` | HF raw README | fetched 2026-09-03 | `license: apache-2.0` | SWIN-Transformer audio + RoBERTa text; CPU/GPU usage shown | LAWFUL, ADOPT |
| Tencent AI Lab / OpenMuQ — `OpenMuQ/MuQ-MuLan-large`, GitHub `tencent-ailab/MuQ`, PyPI `muq 0.1.0` | HF raw README (via search), GitHub README, PyPI | paper arXiv:2501.01108, Jan 2025 | weights **cc-by-nc-4.0**; code MIT | ~700 M params; EN+ZH text | FORBIDDEN (commercial product) |
| BAAI — `BAAI/bge-m3` | HF raw README | news up to 2024-07-01 | `license: mit` | 1024-d, 8192 tokens, dense+sparse+colbert, 100+ languages | LAWFUL, ADOPT |
| Microsoft — `intfloat/multilingual-e5-large` | HF raw README (partial) | — | `license: mit` | 24 layers, 1024-d | LAWFUL alternative |
| pgvector — `pgvector/pgvector` | README at v0.8.6 | 0.8.6 | (README licence section not read — pgvector is PostgreSQL-licensed per common knowledge; `[UNVERIFIED]` this session) | Postgres 13+; HNSW/IVFFlat; halfvec; iterative scans 0.8.0+ | ADOPT |
| Jonathan Katz (pgvector maintainer) benchmark | jkatz.github.io post 2024-04-09 | pgvector 0.7.0 pre-release, PG 16.2 | — | recall/QPS/p99 tables | primary measurement |
| Supabase — pgvector 0.7.0 post; Neon — halfvec post | blog posts | 2024 | — | independent halfvec measurements | corroboration |
| Google — MuLan, MusicLM | arXiv | 2022, 2023 | no release ("we have no plans to release models") | method insights only | AVOID (unavailable) |
| Community: `lquint/clap-htsat-unfused-onnx`, `NeptuneHub/AudioMuse-AI-DCLAP`, dev.to ONNX test | HF card, GitHub README, blog | 2025–2026 | ONNX export Apache-2.0 | CPU feasibility evidence | low-tier, `[single-source]` each |

## Hidden and contrary evidence

- **Contrary to "use the newest model":** the two strongest 2025–2026 music-text models found (MuQ-MuLan, FIGMA) are licence-blocked for this product; the 2023 Apache-2.0 CLAP music checkpoint remains the lawful frontier for self-hosting.
- **Contrary to "CLAP handles our prompts":** FIGMA Fig. 2 / §3 shows saturation beyond 40–50 tokens; CLAP's tokenizer cap is 77 tokens (S01 §4.1). A serialised 35-parameter brief exceeds this.
- **Contrary to "embedding distance can honour negatives":** MuLan §4.2.1 negation failure.
- **Contrary to "SDD/MusicCaps numbers transfer":** SDD authors state in-domain evaluation "may lead to inflated results" and MedR differs 36 vs 82.5 between two datasets for the same model.
- **Training-data licence tail:** LAION-Audio-630K contains 63,693 CC-BY-NC Freesound clips (S01 App. D.1); the model card licence is Apache-2.0. Whether NC training data taints Apache-2.0 weights is a legal question for the legal slice — flagged, not resolved here.
- **Vendor marketing excluded:** two undated comparison blogs (johal.in, booleanbeyond) quote pgvector recall/latency without method; excluded from the claim ledger.

# Claim cross-verification ledger (claim → ≥3 source IDs or flag)

| claim_id | Claim (scope) | Type | Sources | Independence | Status |
| --- | --- | --- | --- | --- | --- |
| C1 | `laion/larger_clap_music` weights are Apache-2.0 | PRIMARY FACT | S01-card (raw README, this session); research 2026-08-17 claim 7 (HF card + file-tree + LAION repo CC0, VERIFIED 3+ then) | this session = 1 surface; prior session = 3 surfaces | VERIFIED 3+ (1 fresh + 2 relayed from a verified prior ledger; parent should re-open the file-tree page) |
| C2 | MuQ-MuLan weights are CC-BY-NC-4.0 (non-commercial) | PRIMARY FACT | HF raw README frontmatter; GitHub tencent-ailab/MuQ README; PyPI muq README | one provenance family (3 mirrors of the authors' text) | `[single-source official]` — uniqueness disclosed; the licence text itself is the author's own statement, no third party can override it |
| C3 | CLAP-family retrieval saturates beyond ~40–50 caption tokens; CLAP tokenizer max 77 tokens | SOURCE CLAIM | S04 §3 + Fig. 2 (measured on MusicBench); S01 §4.1 (77-token cap); FIGMA project page (same family) | 2 independent producers (UMD; LAION/Mila) | 2 independent → `[single-source]` for the saturation *measurement*, the 77-token cap is a PRIMARY FACT |
| C4 | Contrastive BERT-class text towers fail on negation | SOURCE CLAIM | S02 §4.2.1 (with its refs Ettinger 2020; Tejada 2021 — cited, not opened) | 1 opened + 2 cited-not-opened | `[single-source]` as opened; corroborating literature exists but was not read this session |
| C5 | halfvec HNSW recall equals vector recall at ef_construction ≥ 64–256 on 1 M × 1536-d | PRIMARY FACT (measurement) | S09 Katz tables; S10 Supabase table; S11 Neon post | 3 independent producers (individual maintainer; Supabase; Neon) | VERIFIED 3+ |
| C6 | pgvector post-filters approximate scans; iterative_scan (0.8.0+) / partial indexes are the remedies | PRIMARY FACT | S08 README §Filtering, §Iterative Index Scans | official documentation, unique authority | `[single-source official]` |
| C7 | MusicLM calibrated τ=0.85 on permuted negative pairs → < 0.01 % FP | PRIMARY FACT | S05 §4 verbatim; research 2026-08-17 claim 11 (3 hosts, one family) | one provenance family | `[single-source official]` (as in the prior ledger) |
| C8 | RRF k=60 near-optimal, not critical; beats Condorcet in all TREC runs, CombMNZ in all but one | SOURCE CLAIM | S14 author-hosted PDF excerpts; ACM DOI record abstract; SciSpace record | one provenance family | `[single-source]` — the paper is the unique authority for its own results; independent replications not sought (time) |
| C9 | CLAP on SDD: R@1 4.42 / R@10 26.01 / MedR 36 | PRIMARY FACT | S03 Table 5 (arXiv HTML); S03 QMUL accepted PDF (same text) | one family | `[single-source official]` (dataset authors' own benchmark) |
| C10 | LAION-CLAP(Music) MusicBench T2A R@1 25.38, FMACaps 2.60; MuQ-MuLan 20.81 / 4.10 | PRIMARY FACT | S04 Tables 2–3; FIGMA project page (same family) | one family | `[single-source]` |
| C11 | bge-m3 licence MIT, multilingual 100+ languages, 1024-d | PRIMARY FACT | HF raw README frontmatter + specs table; arXiv:2402.03216 abstract (100+ languages); FlagOpen GitHub (cited by card, not opened) | 2 opened surfaces, same authors | `[single-source official]`; NOTE contradiction with 3 blogs claiming Apache-2.0 — resolved in favour of the card |
| C12 | CLAP audio tower CPU cost ≈ 55 ms per 10-s clip (Apple M4 Max, ONNX) | SOURCE CLAIM (community) | dev.to post | 1 | `[single-source]`, not our hardware → `[UNVERIFIED]` for m7i.large |
| C13 | MERT checkpoints CC-BY-NC-4.0 → forbidden | relayed | research 2026-08-17 claim 6 (VERIFIED 3+ there) | not re-opened this session | relayed; parent re-verifies |
| C14 | Engine genre vocabulary is a flat 2,196-entry list | PRIMARY FACT (project) | docs/api/04 line 49; docs/api/03 line 126 ("genres": 2196); research 2026-08-29 taxonomy docs (D-SSM-36) | 3 project documents | VERIFIED 3+ (project-local) |

Counts: VERIFIED 3+ = 3 (C1, C5, C14); `[single-source]` / `[single-source official]` = 9 (C2, C3, C4, C6, C7, C8, C9, C10, C11); `[UNVERIFIED]` = 1 (C12); relayed-not-reverified = 1 (C13).

# Contradictions, corrections, uncertainty, gaps

| id | Contradiction / gap | Handling |
| --- | --- | --- |
| K1 | bge-m3 licence: two secondary blogs say Apache-2.0, two say MIT; HF card frontmatter says `mit`. | PRESERVED and resolved by the primary artifact (card); blogs excluded. |
| K2 | "Newest = best" (MuQ-MuLan 2025, FIGMA 2026 outperform CLAP on some benchmarks) vs their CC-BY-NC weights. On MusicBench T2A R@1 LAION-CLAP(Music) 25.38 actually *beats* MuQ-MuLan 20.81 (S04 Table 2) while losing on FMACaps (2.60 vs 4.10). | PRESERVED; decisive for us on licence alone; the benchmark split shows no clear winner anyway. |
| K3 | CLAP model licence Apache-2.0 vs 63,693 CC-BY-NC training clips in LAION-Audio-630K (S01 App. D.1). | PRESERVED; legal question routed to the legal slice; not resolved here. |
| K4 | pgvector benchmark scale: primaries exist at 1 M rows only; 10⁵ numbers found only in excluded secondary blogs; 10³ not benchmarked by anyone (trivially exact). | Stated as `[UNVERIFIED]` for 10⁵; INFERENCE for 10³. |
| K5 | Serrà Qmax / HK BER are duplicate detectors, yet the slice asks how they apply to reuse. | Resolved by role inversion: repeat-suppression guard, not ranking. INFERENCE. |
| K6 | No CPU cost measurement for CLAP or bge-m3 on m7i.large exists. | `[UNVERIFIED]`; must be measured on the instance before the design is called costed. |
| K7 | Lanes not swept (45-min limit): Meta FAIR audio-text models; Microsoft CLAP licence; Spotify/Deezer text-based continuation papers; MTG Essentia similarity; Qdrant/Milvus/Weaviate/OpenSearch primaries; TTMR++ full read; RRF paper full read; multilingual-e5 Turkish numbers; pgvector README licence section. | Listed; not claimed. Saturation NOT reached; the wall-clock limit ended the run. |
| K8 | MuLan/MusicLM weights availability: papers state no release; whether Google later released MuLan weights was not checked. | `[UNVERIFIED]`; irrelevant to recommendation (CLAP chosen). |
| K9 | FIGMA weight licence not stated in paper. | `[UNVERIFIED]`; NC inferred from MuQ dependency. |

# Synthesis — adopt / build / avoid for PlayMusicPrompts

**ADOPT**
- `BAAI/bge-m3` (MIT) for prompt↔prompt dense (+ optional sparse) similarity over a canonical brief serialisation; Turkish-capable.
- `laion/larger_clap_music` (Apache-2.0) for take audio embeddings at write-time and brief→audio / accepted-take→audio similarity at query-time.
- pgvector 0.8.6 on the existing Postgres 16: exact search until the catalogue is large; then HNSW with `halfvec` expression indexes, partial indexes per `vocal.mode`, `hnsw.iterative_scan = relaxed_order` for filtered queries; inner-product operator on normalised vectors.
- Reciprocal Rank Fusion (k = 60) for stage fusion until ≥ 100 real labels allow a learned linear fusion.
- The MusicLM negatives-first calibration procedure (permuted pairs → empirical null → threshold at an owner-chosen false-accept rate), validated with Berk's early-skip / full-listen signals.

**BUILD**
- Canonical brief serialiser + SQL hard-filter layer (vocal mode, language, duration band, negative_prompt anti-match, session repeat suppression).
- Genre soft-match kernel: bge-m3 cosine over genre names, later the in-repo Wikidata/MusicBrainz subclass graph distance.
- Calibration harness: permuted-pair null, ROC, precision-at-threshold, coverage; FIGMA-style single-attribute perturbation regression test.
- Labelled-event table (served candidate, stage scores, listener outcome) so calibration grows from production, with model-version + date on every threshold.
- Later (only if skip data shows tempo/key mismatches): frame/token-level alignment head over the lawful CLAP audio tower (FIGMA method, lawful encoder).

**AVOID**
- MuQ-MuLan, MuQ, MERT and anything built on them (CC-BY-NC-4.0) — commercial product.
- FIGMA weights in production (NC chain, `[UNVERIFIED]` licence).
- Paid embedding APIs (OpenAI, Cohere) and hosted vector databases — new paid vendors; not needed at this scale; FLAGGED for Berk only if he wants them.
- Any literal threshold copied from a paper (0.85, 0.35) — they belong to other metrics and other data.
- Using Qmax/HK BER as a *positive* similarity signal for reuse.

# Recommendation for this slice with falsifiers

**Committed recommendation (item 8):**

- **Stage 1 — structured + text (runs first, always):** SQL hard filters (`vocal.mode`, `vocal.language`, `duration.target_seconds` band, every `negative_prompt[]` term absent, not-heard-this-session) → weighted structured score (genres soft-match, moods Jaccard, eras overlap, tempo band) → `bge-m3` cosine between the new brief's serialisation and each surviving take's stored brief embedding (`halfvec(1024)`). Produces ranking R1.
- **Stage 2 — audio embedding (write-time once per take):** `laion/larger_clap_music` audio embedding per 10-s window with feature fusion, stored as `halfvec(512)` with `hnsw … halfvec_ip_ops` partial indexes per `vocal.mode`. Query-time: CLAP text embedding of a ≤ 77-token compressed brief AND CLAP audio embedding of the listener's last accepted take → two rankings R2a, R2b over the Stage-1 survivors.
- **Stage 3 — fusion + calibrated gate:** RRF(k=60) over R1, R2a, R2b → top candidate; accept for reuse only if its fused score clears the negatives-first calibrated threshold (false-accept rate = OWNER-DECISION) and it is not a near-duplicate (HK BER > 0.35-class guard / Qmax) of the last heard take; otherwise generate. Every decision logged with stage scores and later outcome; threshold and weights re-fitted when ≥ 100 new labels accrue or when engine/UI/catalogue mix changes.

**Falsifiers (any one overturns the recommendation):**
1. If, on ≥ 100 real labelled pairs, Stage-1-only precision at the chosen threshold is not statistically worse than the full pipeline, drop Stage 2 (audio embedding adds cost without lift).
2. If early-skip rate of reused tracks exceeds the generated baseline by the pre-registered margin after calibration, the acceptance relation is not captured by these similarities → escalate to learned fusion or stop reuse.
3. If CLAP audio-embedding cost measured on m7i.large exceeds the write-time budget the parent sets, move to the distilled CLAP student or batch embedding off-peak — not to a GPU without Berk's approval.
4. If the legal slice finds the NC training-data tail (K3) taints Apache-2.0 CLAP weights for commercial use, Stage 2 has no lawful model in this evidence set and must be dropped until one is found.
5. If a lawful (Apache/MIT) music-text model appears that beats CLAP(Music) on both MusicBench and FMACaps, replace the Stage-2 model — the pipeline is model-agnostic.

# Sources (complete citations, stable locators, access dates)

See `docs/research/2026-09-03-reuse-slice-b-source-register.md` for the full record (source_id, class, read status, capture hash, first-200-chars quote). Short list:

- S01 Wu et al., arXiv:2211.06687, https://arxiv.org/abs/2211.06687 — accessed 2026-09-03 `[FULL]`; card https://huggingface.co/laion/larger_clap_music/raw/main/README.md `[FULL]`.
- S02 Huang et al., arXiv:2208.12415, https://arxiv.org/abs/2208.12415 — 2026-09-03 `[FULL]`.
- S03 Manco et al., arXiv:2311.10057, https://arxiv.org/html/2311.10057 ; DOI 10.5281/zenodo.10072000 — 2026-09-03 `[FULL]`.
- S04 Anand et al., ACL 2026, DOI 10.18653/v1/2026.acl-long.2197, https://arxiv.org/html/2606.06615v1 — 2026-09-03 `[FULL]`.
- S05 Agostinelli et al., arXiv:2301.11325, https://arxiv.org/abs/2301.11325 — 2026-09-03 `[PARTIAL]`.
- S06 TTMR++, arXiv:2410.03264, https://arxiv.org/html/2410.03264 — 2026-09-03 `[PARTIAL]`.
- S07 OpenMuQ/MuQ-MuLan-large, https://huggingface.co/OpenMuQ/MuQ-MuLan-large ; https://github.com/tencent-ailab/MuQ ; https://pypi.org/project/muq/ — 2026-09-03 `[PARTIAL]`.
- S08 pgvector README v0.8.6, https://raw.githubusercontent.com/pgvector/pgvector/master/README.md — 2026-09-03 `[FULL]`.
- S09 J. Katz, "Scalar and binary quantization for pgvector vector search and storage", 2024-04-09, https://jkatz.github.io/post/postgres/pgvector-scalar-binary-quantization/ — 2026-09-03 `[PARTIAL]`.
- S10 Supabase, "pgvector 0.7.0", https://supabase.com/blog/pgvector-0-7-0 — 2026-09-03 `[PARTIAL]`.
- S11 Neon, "Don't use vector. Use halfvec instead…", https://neon.com/blog/dont-use-vector-use-halvec-instead-and-save-50-of-your-storage-cost — 2026-09-03 `[PARTIAL]`.
- S12 BAAI/bge-m3 card https://huggingface.co/BAAI/bge-m3/raw/main/README.md `[FULL]`; Chen et al. arXiv:2402.03216 `[ABS]` — 2026-09-03.
- S13 intfloat/multilingual-e5-large card https://huggingface.co/intfloat/multilingual-e5-large/raw/main/README.md — 2026-09-03 `[PARTIAL]`.
- S14 Cormack, Clarke, Büttcher, SIGIR 2009, DOI 10.1145/1571941.1572114, https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf — 2026-09-03 `[PARTIAL]`.
- S15 community CPU evidence: https://dev.to/kiarina/classifying-environmental-sounds-with-clap-and-onnx-runtime-a-1-nn-evaluation-on-esc-50-hoi ; https://huggingface.co/lquint/clap-htsat-unfused-onnx ; https://github.com/neptunehub/audiomuse-ai-dclap — 2026-09-03 `[PARTIAL]`.
- Project-local: `docs/research/2026-08-17-rhythmic-monotony-and-take-similarity-gate.md`; `docs/api/12-originality-gate.md`; `docs/api/04-request-body-full.md`; `docs/api/03-endpoints-reference.md` — read 2026-09-03.

# Completion audit

- Planned artifacts 2 / produced 2 (this report; the source register). No other file modified.
- Scope items 1–8 each answered under its own heading (8/8); sub-items 2a–2e answered (5/5).
- Floors: slice ≥10 authoritative → 14 families; ≥3 academic `[FULL]` with five-part records → 4. Run-level floors are the parent's.
- Honest banner not required: slice floors met; gaps stated in K7 and are not hidden. Saturation NOT declared — the 45-minute limit ended the run.
- Read-back and hashes: reported in the worker's return message (computed after the final write).

