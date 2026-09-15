# Standards ledger

| Standard | Implementation in this run | Evidence | Status |
|---|---|---|---|
| deep-research covenant, C:\Users\berke\.claude\skills\deep-research\SKILL.md, sha256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB (file hash) | MODE B owner order; 4 parallel workers (A–D); parent re-opened the load-bearing primaries itself | scope plan + preflight in docs/research/_runs/; 8 slice files hashed (§Artifact index) | held |
| R11 floors (run level ≥20 authoritative, ≥5 academic [FULL]) | authoritative families A 6 (22 URLs) + B 14 + C 20 + D 19 = 59 (overlaps possible; ≥20 without doubt); academic [FULL] with five-part records B 4 + C 2 + D 0 + A 0 = 6 | worker returns + slice reports | met |
| R15.4 honest banner | Slice A carries `⚠️ UNVERIFIED RELAY — DO NOT CITE` because its own slice floor "≥1 academic/standards primary [FULL]" was not met (0); every A number quoted here is from an OFFICIAL pricing/docs primary read [FULL] by that worker and is cited as such, never as academic | A report line 1 | disclosed |
| Parent re-verification (R12.4) | Re-opened this session: Google Cloud SST (§5(b),(c), §17(b), §20(a),(b),(d),(i)); Generative AI Indemnified Services list; Lyria 3 model page; laion/larger_clap_music raw README (`license: apache-2.0`); OpenMuQ/MuQ-MuLan-large card (weights CC-BY-NC 4.0); pgvector README (halfvec ≤4,000 dims, iterative_scan, ef_search default 40, "only 4 rows will match on average") | fetch outputs in this session | done |
| rules/10 no-narrowing | Berk's 6 items (2026-09-03 08:34) → §Findings F1–F6; count 6 = 6 | preflight JSON carries the verbatim order | held |
| rules/08 owner profile (no new paid vendor without approval; no synthetic data) | recommendation uses only existing vendors (AWS S3/CloudFront, Postgres/pgvector, open-weight models); paid-vendor flag: none | §Committed recommendation | held |
| rules/25 anti-deception | every number carries its source id; [single-source] / [UNVERIFIED] kept; contradictions listed, not averaged | §Contradictions | held |

# Scope plan / decision served / why / project context

Scope plan: docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.scope-plan.md (sha256 9AF689BB789AFB90B2A483AD74F34D61767BE49613859E2D3409C321E6B65DA7). Preflight: docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.preflight.json.

Decision served: whether PlayMusicPrompts should (a) persist every generated track with its prompt and full request/response detail, (b) copy the delivered audio to its own storage after generation, and (c) in playlist mode serve an existing SIMILAR catalogue track as the next track instead of paying for a new generation — and with which storage design, similarity method, decision policy and legal conditions.

Owner order (Turkish, verbatim, 2026-09-03 08:34): "şarkı üretimi oldukça şarkıları playmusicpromts da bir tabloda tutalım şarkının promptu ve tüm detayları ile . ayrıca dosyayı da sunucuya alalım üretim sonrası. Daha sonrasında da bunları şu şekilde kullanacağız, bir kullanıcı bir şarı üretip playlist mantığına döndüğünde eğer elimizde benzer bir şarkı varsa üretmek yerine kullanıcıya o şarkıyı ekleyeceğiz next track olarak. bu şekilde hem üretim süresi hem de maliyetinden tasarruf ederiz ne dersin, bunu bir düşünüp analiz eder misin en ileri seviyede. ve elimzideki şarkılardan benzerlerinin bulunması ve buna bağlı algoritma da lazım. Bunu düşün analiz et araştır ve bana öneride bulun." Approval: "başla" (08:35).

Project context (measured this session, from disk): generation $0.08 per take (artifacts/song-rnd/spend_ledger.json, 37 delivered lines at $0.08 or $0.01); generation-call latency commit→settle min 4.8 s, median 43.7 s, mean 44.8 s, p90 86.0 s, max 92.5 s (same ledger, computed this session); documented end-to-end 25–145 s instrumental, 230–280 s sung (docs/api/09). Storage today: `music_jobs` (requestBody + verbatim responseBody, gcs_uri, 7-day V4 signed URL, free refresh); audio in gs://playmusicprompts-content; site on EC2 eu-central-1 (Istanbul LZ) + Postgres 16 + CloudFront E24H3DG0V4RCWB. Engine similarity exists only WITHIN one request (docs/api/12). Engine generate stage = Vertex AI Lyria (docs/api/08 lines 19, 83–84; sung route `lyria-3-pro-preview`, docs/api/13 line 41).

# Outcome first

1. **Yes to all three parts of Berk's idea, with one legal precondition and one product constraint.** Cross-user reuse of Lyria output is permitted by Google's contract (SST §20(a) "Generated Output is Customer Data … Google does not assert any ownership rights"; Lyria 3 page: preview customers "may … disclose Generated Output to third-parties") [D-S01, D-S06; re-read by the parent 2026-09-03]. The precondition: Lyria is **not** on Google's Generative AI Indemnified Services list (Codey, Gemini, Imagen, PaLM, Veo only) and the sung route is Pre-GA ("not covered by any SLA or Google indemnity", liability cap $25,000) [D-S03, D-S01 §5(b),(c); re-read by the parent] — so any third-party IP exposure from serving one generation to N listeners is the project's, not Google's. This is an OWNER-DECISION (accept, or restrict reuse to a GA-only pool).
2. **Money is not the constraint; listener acceptance is.** Copy+store of a 16.8 MB WAV costs $0.00261 in month 1 (GCS egress $0.12/GiB + S3 PUT $0.0054/1k + S3 Standard $0.0245/GB-mo, official AWS Price List 2026-08-31 and GCS pricing page) = 3.3 % of one $0.08 generation; 1,000 CloudFront-Europe listens cost $1.43 versus $80 of avoided generations [A-S03, A-S05, A-S06]. Break-even acceptance for a reused slot is a* = c_reuse/c_gen − s₀ ≈ 0.018 − s₀, i.e. ≤ 0 for any baseline early-skip rate s₀ ≥ 1.8 % [C §1 CALCULATION].
3. **Time is saved only where the buffer is empty**: session start, a skip cascade, and T−90 s when the pending job is late (worst measured generation 92.5 s > 90 s; sung 230–280 s always) — everywhere else Berk's ≥2-ahead buffer already hides latency [C §2; ledger measured this session].
4. **Storage decision: copy the mastered WAV to S3 Standard eu-central-1 under a content-addressed key (`sha256/<hex>.wav`) and serve through the existing CloudFront distribution; keep the GCS original under a lifecycle rule (Nearline at 30 d, delete at 365 d); add Opus (web/Android) and AAC (iOS/Safari) delivery renditions; keep the raw engine file too (indemnity "unmodified" clause).** EC2 disk in the Istanbul Local Zone is 5.6–7× the S3 price and single-zone; staying on GCS signed URLs costs 41 % more per byte and has a 7-day URL ceiling [A-S05, A-S06, A-S07, A-S08]. No new paid vendor.
5. **Similarity decision: three stages.** Stage 1 SQL hard filters (exact `vocal.mode`, `vocal.language`, duration band, every `negative_prompt` term absent, not heard by this visitor) + weighted structured score + `BAAI/bge-m3` (MIT, 1024-d, Turkish-capable) cosine over the serialised brief; Stage 2 `laion/larger_clap_music` (Apache-2.0, re-verified) audio embeddings computed once per take, stored as pgvector `halfvec(512)`; Stage 3 Reciprocal Rank Fusion (k = 60) + a threshold calibrated negatives-first (MusicLM procedure, never its number). MuQ-MuLan (2025) and FIGMA (2026) are licence-blocked (CC-BY-NC) for this commercial product; MERT remains forbidden [B-S01, B-S04, B-S07, B-S08, B-S12, B-S14; prior 2026-08-17 research].
6. **Policy decision: reuse is a buffer-filling branch, never the first take.** Insert at track START when the buffer is short, at T−90 s when the job is late, and as the skip refill; ≤ 1 catalogue track per 3 served; never a track the visitor already heard; ranked by pessimistic Beta-Bernoulli Thompson sampling (Deezer RecSys'20, independently reproduced) seeded by similarity, MMR re-ranked, Vendi score over the served set as the monoculture alarm; truthful label; A/B against generate-only with early-skip (<10 s) rate as the primary metric [C-S02, C-S03, C-S09, C-S10, C-S11, C-S21].
7. **Privacy/moderation decisions:** store the raw prompt privately, publish only a derived title/description; erasure of a prompt pulls the track from the reuse pool; preserve SynthID/C2PA on every copy; DSA Art. 16 notice-and-action and Law 5651 takedown path; age statement (SST §20(d)); ToS must carry a user→platform licence over prompt, lyrics and output before the first cross-user reuse, and sung tracks with user-written lyrics stay out of the pool until that clause is live [D-S01, D-S09, D-S14, D-S19, D-S20].

# Framing and falsifiers

Hypothesis: a catalogue of previously generated takes can replace a material share of paid generations without raising the early-skip rate. Falsifiers (any one overturns the recommendation): F1 Google confirms SST §17(b)(i) forbids serving output to non-requesting users (put to Google in writing); F2 A/B shows reused tracks early-skipped more than fresh ones beyond the owner's margin; F3 measured catalogue hit-rate h stays near 0 under the calibrated threshold for months (catalogue too small — then the schema/copy work is justified by the /musics tab alone); F4 CLAP weights judged tainted by their CC-BY-NC training tail (Stage 2 dropped); F5 the mastering chain destroys SynthID detectability (must be measured; no public detector API found).

# Inclusion, exclusion, geography, dates, languages, constraints

Included: official vendor terms/docs/pricing (dated), peer-reviewed/arXiv primaries, first-party research blogs, regulator texts (USCO, EU, KVKK), open-source repos with licence files. Excluded: SEO aggregators (pricing blogs kept only as secondaries, never load-bearing), undated summaries, paywalled texts (recorded as FAILED ACCESS: McInerney 2018). Geography GLOBAL; legal slice US/EU/TR. Dates newest-first (SST last modified 2026-07-29; Lyria 3 page 2026-09-02; indemnified list 2026-07-20; AWS Price List 2026-08-31). Languages EN primary, TR for KVKK/FSEK.

# Methodology and exact query/action log

Parent actions (2026-09-03, +03): read covenant Part I, R2, R3, R12, R15, R17; local intake (schema.prisma, jobs.ts, session.js, listening_session.dart, delivery-url route, docs/api/06/09/12, prior research 2026-08-17, spend_ledger.json — hashes in the preflight); wrote scope plan and preflight; wrote 4 briefs (gate audit 4/4 COMPLETE) and dispatched 4 workers in parallel 08:55; measured ledger latencies (python, 37 delivered lines); on return verified the 8 slice files (bytes + SHA-256 match); re-opened 6 primaries (list in Standards ledger); wrote this synthesis, the manifest and the index. Worker query logs: each slice report §Methodology (A: Q1–Q10 + F1–F12; B: Q1–Q15; C: Q01–Q14 + L01; D: Q1–Q11+).

# Universe and coverage ledger

| Universe | Covered by | Gaps carried forward |
|---|---|---|
| Official vendor (Google Cloud terms/docs, AWS Price List, GCS/S3/CloudFront docs, HF model cards, pgvector) | A, B, D + parent re-verification | Cloud Data Processing Addendum not opened; CloudFront price class for Türkiye not read; `gs://playmusicprompts-content` bucket location not read |
| Academic — retrieval (CLAP, MuLan, Song Describer, FIGMA, MusicLM, RRF) | B (4 [FULL]) | TTMR++ and RRF only [PARTIAL]; Meta/Microsoft CLAP variants not swept |
| Academic — recommender/listener (Deezer bandits, Spotify MSSD, Anderson 2014, Chaney 2018, Vendi, MMR, CESifo 2026) | C (2 [FULL]) | inverted-U/mere-exposure lane and RecSys Challenge 2018 lane not swept; McInerney 2018 paywalled |
| Regulators/law (USCO Part 2 [FULL], EU AI Act Art. 50 FAQ, EDPB 28/2024, KVKK 2021 + 2025 guide, DSA Art. 16, Law 5651, FSEK doctrine) | D | Commission Art. 50 guidelines and Code of Practice text, EUR-Lex DSA articles, mevzuat.gov.tr texts not opened; 0 peer-reviewed law papers [FULL] |
| Competitor ToS (Suno 2026-09-03, ElevenLabs, Mubert, Soundraw; Udio partial; Stable Audio identity unverified) | D | Udio body not read; Stability official ToS not located |
| Standards / academic storage (FIPS 180-4, RFC 6716, Zhu 2008, Venti) | — | NOT REACHED (Slice A banner) |
| Catalogue data models (MusicBrainz v31; hikoon-ACR hidden evidence) | A | Discogs, Spotify, Apple, Deezer entity models not opened |

# Source register and read-status counts

Per slice (from each worker's return, files verified on disk by the parent): A — 22 URLs / 6 producer families, academic 0, primary [FULL] 14 official docs; B — 14 authoritative families, academic 8, academic [FULL] 4, primary [FULL] 7; C — 20 authoritative families, academic 15, academic [FULL] 2, primary [FULL] 4; D — 19 authoritative, academic 1 [ABS], primary [FULL] 9. Run totals: authoritative ≥ 20 (59 family-counts before de-duplication; overlap between slices is limited to Google/AWS official surfaces); academic [FULL] 6; primary [FULL] 34. Registers: docs/research/2026-09-03-reuse-slice-{a,b,c,d}-source-register.md.

# Findings by subquestion / axis

**F1 — "tabloda tutalım — prompt ve tüm detaylar" (catalogue).** One `music_tracks` row per DELIVERED TAKE (not per request), FK to `music_jobs` (which keeps the exact 101-parameter `requestBody` and the verbatim envelope); UNIQUE `(jobId, takeNumber)`, UNIQUE `gcsUri`, UNIQUE `sha256` as the idempotency key; typed facet columns projected from the request for filtering (genres[], moods[], eras[], vocal_mode, vocal_language, tempo_bpm, key, time_signature, duration_target_seconds, creative_goal, route); measured facts from the envelope (duration_seconds, sample_rate, channels, codec, integrated_lufs, true_peak_dbtp, lyrics PER/verdict, originality verdict); provenance (request_id, model route, engine version, SynthID/C2PA presence flag, raw-vs-mastered file ids); ownership (userId | anonId), visibility (private | reuse_pool | public), moderation state, soft-delete; companion tables `music_track_facets`, `music_track_pairs` (Qmax / HK-BER from `axis2_similarity.pairs[]`), `music_track_renditions` (wav master, opus, aac), `music_track_embeddings` (model id + version + dims; `halfvec`). Every column traces to docs/api/04, 05, 06 or 12 [A §Item 1]. Backfill from existing `music_jobs.responseBody`: byte size, SHA-256 and GCS checksums are NOT in the envelope and must be fetched; a missing originality verdict is recorded `NOT_FETCHED`, never fabricated [A §Item 5].

**F2 — "dosyayı sunucuya alalım" (copy after generation).** Post-`SUCCEEDED` worker in deploy/payload/lib/music/jobs.ts: fetch by `gcs_uri` (fresh signed URL), verify GCS CRC32C, compute SHA-256 + byte count, PUT to S3 eu-central-1 with the SHA-256 checksum header, insert the row, then transcode Opus/AAC renditions. Costs (official primaries): month-1 copy+store $0.00261 per 16.8 MB WAV; storage $0.00039/month thereafter; CloudFront Europe $0.085/GB → $1.43 per 1,000 WAV listens, ≈ $0.08 per 1,000 Opus-128k listens [A §Item 2–3]. Durability: S3 Standard 99.999999999 % across ≥ 3 AZs; EBS in the Istanbul LZ has no published durability figure and costs 5.6–7× [A-S07, A-S12]. Integrity: never trust ETag; GCS composite objects lack MD5; S3 validates supplied SHA-256 [A-S13, A-S13b, A-S14].

**F3 — "benzer şarkı varsa üretme yerine next track" (reuse branch).** Where it sits in Berk's algorithm (web session.js / app listening_session.dart): P2 = track START when preparedAhead < 2; P3 = T−90 s when the pending adaptive job is not yet delivered; P4 = skip refill. NOT P1 (the 3-take burst) in phase 1. Gates G1–G10: SUCCEEDED + mastered; originality gate passed; not moderation-flagged; exact `vocal.mode` and `vocal.language` match; duration within the listener's band; no `negative_prompt` term matches the candidate's facets; not heard by this visitor (history); visibility = reuse_pool; lyrics not user-supplied until the ToS licence is live; ≤ 1 catalogue track per 3 served [C §2, §5; D item 6].

**F4 — "üretim süresi ve maliyet tasarrufu — ne dersin" (economics).** Δ per slot = h·[c_gen·(s₀ + a) − c_reuse] with c_gen = $0.08, c_reuse ≈ $0.0005–$0.0014 (CloudFront, third-party per-GB figure; official flat-rate Free plan covers 100 GB/month at $0) → positive for any acceptance a > 0.018 − s₀. Time saving exists only at P2/P3/P4 (buffer-empty moments); measured generation latency this session: median 43.7 s, p90 86 s, max 92.5 s (ledger, 37 lines) — so at T−90 s a late job is a real, not hypothetical, case [C §1–2; ledger].

**F5 — "benzerlerinin bulunması ve algoritma" (similarity + algorithm).** Retrieval = 3 stages (Outcome 5). Ranker = per-track Beta-Bernoulli Thompson sampling, prior Beta(1, 99) (pessimistic, Deezer's winning variant), reward 1 = ≥ 90 % listen, 0 = < 10 s skip, similarity as multiplicative context, batch updates; MMR re-rank for within-session diversity; Vendi score over the served set as the monoculture alarm [C-S02, C-S21, C-S10, C-S11]. Pseudocode (parent's synthesis of B §Recommendation + C §2):

```
on_slot_needed(session, point):                       # point ∈ {P2, P3, P4}
  if not reuse_enabled or catalogue_share(session) >= 1/3: return generate(next_brief(session))
  cands = sql_hard_filter(brief=session.brief, visitor=session.id)      # G1..G10
  if cands.empty: return generate(next_brief(session))
  r1 = rank_by(structured_score + bge_m3_cosine(brief_text, cand.brief_embedding))
  r2a = rank_by(clap_text(brief_compressed) · cand.audio_embedding)
  r2b = rank_by(clap_audio(last_accepted_take) · cand.audio_embedding)
  fused = rrf(r1, r2a, r2b, k=60)
  top = thompson_sample(fused[:N], prior=Beta(1,99), context=fused_score)   # then MMR
  if fused_score(top) < TAU_SIM (calibrated negatives-first) or near_duplicate(top, last_heard): return generate(...)
  log(decision, stage_scores); return serve(top, label="matched to your prompt from the PlayMusicPrompts catalogue")
on_outcome(track, listened_ratio, skipped_at): update Beta posterior; append label for recalibration
```

**F6 — "analiz et, araştır, öneri" (the recommendation)** — see §Committed recommendation.

## Five-part academic and technical records
Held in the slice reports: B (CLAP arXiv:2211.06687; MuLan arXiv:2208.12415; Song Describer arXiv:2311.10057; FIGMA ACL 2026); C (Deezer carousel bandits RecSys'20; Spotify MSSD WWW'19). D's primary [FULL] is the USCO Part 2 report (official, not peer-reviewed). A has none (banner).

## Companies / APIs / repositories
Google Cloud (SST, Lyria 3, indemnified list, Prohibited Use Policy), AWS (S3, CloudFront, EC2 LZ Price List), LAION CLAP (HF, Apache-2.0), OpenMuQ (CC-BY-NC), BAAI bge-m3 (MIT), pgvector 0.8.6, Deezer Research, Spotify Research, Suno/ElevenLabs/Mubert/Soundraw ToS — all in slice registers with access dates.

## Hidden and contrary evidence
hikoon-ACR Postgres data model (real ACR system, GitLab, single-source) [A-S16]; TU Wien reproduction of Deezer bandits (confirms main result, contradicts cascade claim) [C-S21]; CESifo 2026 Study 2 found no AI-disclosure effect while Study 3 did [C-S07]; Turkish thesis on FSEK and AI [D-S16–S18].

# Claim cross-verification and independence ledger

| Claim | Sources | Status |
|---|---|---|
| Lyria output is Customer Data; no clause bars serving it to other end users | SST §20(a) read by D and re-read by the parent; Lyria 3 page banner (D + parent) | 2 official surfaces, one provenance → [single-source-official] |
| Lyria not indemnified; Pre-GA no indemnity, $25k cap | indemnified list + SST §5(b),(c) — D + parent | [single-source-official] |
| CLAP Apache-2.0; MuQ-MuLan CC-BY-NC | HF raw READMEs — B + parent; prior research 2026-08-17 | verified 3+ (CLAP) / 2 (MuQ) |
| pgvector post-filter recall trap + iterative_scan | README (B + parent); Katz, Supabase, Neon benchmarks | verified 3+ |
| S3/CloudFront/GCS unit prices | AWS Price List API + GCS pricing page (A) | [single-source-official]; secondaries agree |
| Thompson sampling (pessimistic) best in Deezer test | Deezer paper [FULL] + TU Wien reproduction | 2 independent |
| AI disclosure lowers relisten/WTP (small) | CESifo WP 12405 + ProMarket (same family) + Deezer–Ipsos | [single-source] for the numbers |
| Prompt-only AI music: no copyright (US/EU/TR) | USCO Part 2 [FULL]; Council consensus via USCO; FSEK doctrine (3 TR sources) | verified 3+ (US), [single-source] EU via USCO |

# Contradictions, corrections, retractions, uncertainty, and gaps

- Pre-GA §5(d) (no personal data) vs Lyria 3 banner (may process personal data) — resolved by §5(d)'s own documentation exception; both preserved [D].
- Secondary (RightsDocket) implies Google indemnifies Lyria; primary list says no — primary controls [D].
- SST §17(b)(i) "substitute, replace, or circumvent the use of a Google Model, directly or indirectly" — ordinary reading is anti-distillation; wording is broad; falsifier F1, put to Google in writing [D; re-read by parent].
- bge-m3 licence: blogs say Apache-2.0, HF card says MIT — card controls [B].
- Deezer cascade claim contradicted by TU Wien reproduction [C].
- CESifo Study 2 vs Study 3 on AI-disclosure effect [C].
- Slice A academic floor unmet (banner); Slice A/B/C/D all stopped on the 45-minute limit, not saturation; unswept lanes listed in each report.
- [UNVERIFIED]: CLAP and bge-m3 CPU cost on m7i.large (must be measured before write-time embedding is scheduled); SynthID survival through mastering; bucket location of gs://playmusicprompts-content; CloudFront price class for Türkiye; provenance-wording effect ("matched to your prompt" vs "from the catalogue").

# Synthesis — adopt / build / avoid

ADOPT: S3 + existing CloudFront; content-addressed keys; pgvector `halfvec` on the existing Postgres 16; bge-m3 + larger_clap_music; RRF; negatives-first calibration; pessimistic Thompson sampling + MMR + Vendi alarm; SST §20(a) as the legal root; SynthID/C2PA preservation; Suno-style user licence pattern.
BUILD: catalogue tables + database functions (insert/backfill/erasure); copy worker; embedding worker; reuse branch at P2/P3/P4 in session.js and listening_session.dart behind `MAX_CATALOGUE_SHARE`; labelled-event table; A/B assignment by anonId/userId; derived-public-fields pipeline; DSA/5651 takedown form; ToS clauses (draft in D §Item 6, for Berk's lawyer).
AVOID: EC2 disk storage; persisting `public_url` instead of `gcs_uri`; ETag as integrity; MuQ/MERT/FIGMA weights; copied thresholds (0.85, 0.35); reuse as slot 1 of the burst before A/B; publishing raw prompts; reusing user-lyric sung tracks before the licence clause; any UI text implying human authorship or uniqueness; stripping watermarks.

# Committed recommendation and alternatives/tradeoffs/falsifiers

**Committed:** implement Berk's idea in three gated phases. Phase 0 (legal + measurement, no listener-facing change): ToS/Privacy clauses, age statement, takedown form, raw-prompt privacy, instrument the baseline early-skip rate s₀. Phase 1 (catalogue + copy): tables, copy worker, renditions, backfill, embeddings at write-time, calibration harness with permuted negatives. Phase 2 (reuse branch behind a flag): P2/P3/P4 insertion, gates G1–G10, ≤ 1-in-3 share, Thompson + MMR, truthful label, visitor-randomised A/B against generate-only, primary metric early-skip (<10 s), non-inferiority margin = Berk's decision. Phase 3 (only if Phase 2 passes): reuse as an instant first sound in the 3-take burst; /musics public catalogue reads from the same tables.

**Alternatives rejected:** (i) keep GCS + refresh URLs (dearer per byte, 7-day URL ceiling, no CDN); (ii) EC2 disk (5.6–7× cost, single zone); (iii) CLAP as the first filter (saturates on long briefs, negation-blind); (iv) MuQ-MuLan/FIGMA (NC licences); (v) reuse in the first take immediately (highest listener-expectation moment, unmeasured acceptance); (vi) hosted vector DB or paid embedding API (new paid vendor, unnecessary at this scale).

**Owner decisions carried (D1–D10 brief in the chat report):** (1) accept the non-indemnified/Pre-GA exposure of cross-user reuse, or restrict the reuse pool to GA-only routes; (2) reuse disclosure wording + age mechanism; (3) A/B non-inferiority margin and false-accept rate for TAU_SIM.

# Application/change ledger

No product code changed by this research run. Applied artefacts: this report, 8 slice files, scope plan, preflight, manifest, index; STATE.md entries 2026-09-03. The implementation plan above maps to: deploy/payload/prisma/schema.prisma; deploy/payload/lib/music/jobs.ts (copy + embedding workers); deploy/payload/public/site/session.js and app/lib/src/state/listening_session.dart (reuse branch); new routes for catalogue/takedown; ToS/Privacy pages.

# Living-update watchlist and supersession state

Watch: Google SST / indemnified-services list (Lyria GA + indemnity would change decision 1); Lyria 3 page (Pre-GA status); SynthID Detector API availability; a lawful (Apache/MIT) music–text model beating CLAP(Music); pgvector releases; EU AI Act Art. 50 guidelines; KVKK generative-AI guide updates; Suno/Udio ToS changes. Supersedes nothing; extends the 2026-08-17 similarity research (its MERT/CLAP licence findings re-verified today).

# Artifact index and produced-vs-planned count

Planned 13 (scope plan §11) / produced 13: scope plan; preflight; 8 slice files (A/B/C/D report + register); this synthesis; manifest docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.json; index docs/research/README.md. Hashes in the manifest.

# Sources — complete citations and stable locators

Consolidated in the four slice registers (docs/research/2026-09-03-reuse-slice-{a,b,c,d}-source-register.md). Parent re-verification set (accessed 2026-09-03): https://cloud.google.com/terms/service-terms (Last modified July 29, 2026); https://cloud.google.com/terms/generative-ai-indemnified-services (Last modified July 20, 2026); https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/lyria/lyria-3 (Last updated 2026-09-02); https://huggingface.co/laion/larger_clap_music/raw/main/README.md; https://huggingface.co/OpenMuQ/MuQ-MuLan-large; https://raw.githubusercontent.com/pgvector/pgvector/master/README.md. Project-local: artifacts/song-rnd/spend_ledger.json (measured this session), docs/api/06, 08, 09, 12, 13.

# Completion audit

Floors: run-level met (authoritative ≥ 20; academic [FULL] 6 ≥ 5). Slice A academic floor unmet → banner kept on that file. All four workers stopped on the execution limit, not saturation — coverage gaps are enumerated, not hidden. Parent re-opened the primaries behind every load-bearing legal, licence and index claim. Owner atoms 6/6 mapped. No product code changed. Spend this run: $0 generation.

