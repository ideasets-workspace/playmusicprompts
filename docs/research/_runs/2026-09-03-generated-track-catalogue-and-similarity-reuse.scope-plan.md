# Standards ledger

| Standard | How this run satisfies it | Status |
|---|---|---|
| deep-research covenant (C:\Users\berke\.claude\skills\deep-research\SKILL.md, sha256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB, file hash) | MODE B owner order ("araştır", "en ileri seviyede analiz et"); parallel slices; floors ≥20 authoritative / ≥5 academic [FULL] held across the run; ledgers + manifest under docs/research/_runs | in force |
| R3 scope gate before first external call | this file | written |
| R2 preflight (berk.deep-research-preflight/v1) | docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.preflight.json | written after this file |
| R12 delegation | 4 workers, full briefs on disk under C:\Users\berke\.berk-agent-state\pmp-reuse-research\, pointer prompts, COVENANT_SHA256 carried, CONTEXT-01..18 present | planned |
| rules/10 no-narrowing | Berk's 6 items of 2026-09-03 08:34 mapped 1:1 in §4 below; count 6 = 6 | held |
| rules/08 owner profile (no paid vendor without approval; no mock data; real API read first) | research only; no spend; project measurements quoted from disk | held |
| MERT / non-commercial licence finding of 2026-08-17 | carried as prior evidence, workers told to re-verify licences newest-first | carried |

# Scope plan — generated-track catalogue, server-side storage, and similarity-based reuse instead of regeneration

Date: 2026-09-03 · Mode: B (owner research order) · Project root: c:\Berk\PlayMusicPrompts

## 1. Exact decision served

Whether PlayMusicPrompts should (a) persist every generated track with its prompt and full request/response detail in its own table, (b) copy the delivered audio file from the engine's Google Cloud Storage delivery to the site's own server/storage after generation, and (c) when a listener enters playlist mode, serve an already-existing SIMILAR track from that catalogue as the next track instead of paying for a new generation — and if so, WHICH similarity method, WHICH decision policy, WHICH storage design and under WHICH legal/rights conditions.

## 2. Why (the exact downstream work)

Berk's order of 2026-09-03 08:34 (verbatim, Turkish, preserved in the preflight JSON) asks for analysis, research and a recommendation. The recommendation controls: the `music_jobs`/catalogue schema extension in deploy/payload/prisma/schema.prisma; a post-generation copy step in deploy/payload/lib/music/jobs.ts; the buffer algorithm in deploy/payload/public/site/session.js and app/lib/src/state/listening_session.dart (the `nextBrief()` → generate step would gain a "reuse candidate" branch); the `/musics` public catalogue of the 2026-09-02 order (not yet approved). If the answer is wrong we either waste money regenerating what we already have, or we serve repetitive/irrelevant tracks and lose listeners, or we redistribute audio we have no right to redistribute.

## 3. Project context (measured this session)

- Product: login-free web page at https://www.playmusicprompts.com/ + Flutter app (app/), both calling the Next.js backend (deploy/payload) which proxies the Music API (Vertex Lyria behind our own pipeline). Model shown as "Ideasets Hybrid Music Composer Model".
- Measured economics (artifacts/song-rnd/spend_ledger.json, STATE.md 2026-08-29): $0.08 per take; generation 25–145 s documented range (docs/api/09), measured median ~60 s, worst 92.5 s; sung 230–280 s. Spend guard: 12 takes/h, 40/day per visitor (lib/music/spend-guard.ts).
- Storage today: `music_jobs` table stores requestBody + verbatim responseBody (gcs_uri, V4 signed public_url, 7-day expiry, FREE refresh via POST /v1/music/delivery-url). Audio lives in gs://playmusicprompts-content (Google). Site host: EC2 i-0c52f530769d1ac88 eu-central-1 (Istanbul LZ), Postgres 16 local, CloudFront E24H3DG0V4RCWB.
- Engine already computes between-take similarity (docs/api/12: Serrà Qmax, Haitsma-Kalker BER, Vendi) — for takes of ONE request only. No cross-request catalogue similarity exists.
- Prior research on similarity instruments: docs/research/2026-08-17-rhythmic-monotony-and-take-similarity-gate.md (27 sources, 5 academic FULL). Key carried facts: CLAP `laion/larger_clap_music` Apache-2.0 lawful; MERT CC-BY-NC-4.0 FORBIDDEN commercially; no universal threshold — calibrate negatives-first.
- Playlist algorithm (Berk 2026-08-29): 3 takes in different tones, buffer ≥2 ahead, T−90 s recalibration, skip → next prepared + 1 generation, early skip <10 s = strong reject, full listen ≥90 % = exploit.

## 4. Complete topic and subquestions (Berk's 6 items → slices)

| # | Berk's item (his wording, abbreviated by me — full text in preflight) | Slice |
|---|---|---|
| 1 | tabloda tutalım — şarkının promptu ve tüm detayları ile | A |
| 2 | dosyayı da sunucuya alalım üretim sonrası | A |
| 3 | playlist mantığında benzer şarkı varsa üretmek yerine next track olarak ekleyeceğiz | B + C |
| 4 | üretim süresi ve maliyet tasarrufu — ne dersin, en ileri seviyede analiz | C (economics) |
| 5 | benzerlerinin bulunması ve buna bağlı algoritma | B (retrieval) + C (policy) |
| 6 | düşün, analiz et, araştır, öneride bulun | parent synthesis |
| — | rights/legal precondition of items 1–3 (my addition, marked as mine: serving one user's generated audio to another user is only lawful under the engine provider's output terms) | D |

Subquestions per slice:
- A (catalogue + storage): schema for a `generated_tracks` catalogue (prompt, all request params, envelope facts, per-take files, verification numbers, provenance, hashes); post-generation copy GCS→our storage (S3 + CloudFront vs EC2 disk vs keep GCS) with measured pricing (storage, egress GCP→AWS, CloudFront delivery), integrity (SHA-256, byte counts), retention/deletion, idempotency, failure modes (signed URL expiry, partial copy); how Spotify/SoundCloud-class catalogues model tracks (public engineering sources).
- B (similarity retrieval): (i) prompt/text similarity (modern text embeddings, multilingual), (ii) structured-parameter similarity (genre/mood/tempo/vocal/duration exact+weighted), (iii) audio similarity (CLAP-class text–audio joint embeddings — lawful only; MuLan/MusicLM lineage; MuQ-MuLan 2025 licence?), (iv) hybrid ranking; storage/indexing (pgvector on Postgres 16 — HNSW/IVFFlat, recall/latency at 10³–10⁶ rows), threshold calibration procedure (negatives-first), evaluation (text-to-music retrieval benchmarks: MusicCaps, Song Describer Dataset, MusicBench), academic primaries read FULL.
- C (decision policy + economics + listener experience): when reuse beats generation — break-even hit-rate from measured $0.08 and 25–145 s; per-user no-repeat constraint; novelty/diversity vs relevance (music recommender literature: Pandora/Spotify/Deezer research, exploration–exploitation bandits, repeat consumption studies); transparency to listener (label "from the catalogue"); interaction with Berk's buffer algorithm (where the reuse branch sits: at track START, at T−90, at skip); cold-start when the catalogue is small; skip-signal feedback into the reuse ranker.
- D (rights, policy, privacy): Google Cloud Vertex AI / Lyria output ownership and redistribution terms (current), SynthID watermark status, Generative AI Prohibited Use Policy, indemnity; copyright status of AI-generated music (US Copyright Office 2025 Part 2 report; EU AI Act transparency obligations; TR context); prompts as personal data (KVKK/GDPR) when stored and shown publicly; content moderation duty for a shared catalogue; platform T&C wording other AI-music services use for public sharing (Suno, Udio, Stable Audio, ElevenLabs Music) — read their live terms.

## 5. Falsifiers

- If the engine provider's terms forbid redistributing outputs to third parties, item 3 must become "reuse only for the SAME user" (falsifies the cross-user cache).
- If prompt-text similarity does not predict listener acceptance better than structured-parameter matching (evidence from retrieval benchmarks or our own skip data), the audio-embedding stage is unnecessary at launch.
- If GCP→AWS egress + S3 storage per track exceeds a material fraction of $0.08, copying every file to AWS is uneconomic; keep GCS + refresh instead.
- If repeat-consumption research shows listeners penalise recognisably repeated generative content, the policy must exclude tracks the SAME user has heard and cap catalogue share per session.

## 6. Inclusion / exclusion

Include: primary vendor documentation (current versions, dated), peer-reviewed/arXiv primaries 2019–2026 (older foundational retained), first-party engineering blogs, official pricing pages, official terms pages, open-source repositories with licence files, standards (W3C, IETF where relevant), regulator texts (USCO, EU AI Act, KVKK). Exclude: SEO blogspam, undated secondary summaries, paywalled content without lawful access (record as failed access), any source that requires bypassing controls. Languages: English primary; Turkish for KVKK; other languages when primary. Dates: newest first; no cutoff for foundational.

## 7. Verticals derived from project vision

PlayMusicPrompts vision (memory/PROJECT.md, AGENTS.md founding order): a real-time generative music player for casual listeners, free with ads (order 2026-09-02), web + mobile + tablet. Verticals: (1) listener experience of the adaptive queue; (2) unit economics of generation; (3) catalogue as a product surface (/musics, share). Geography: GLOBAL (the vision names no country).

## 8. Geography

GLOBAL. Legal slice D covers US, EU and Türkiye as the jurisdictions the project touches (owner in Türkiye, infra in EU/US).

## 9. Temporal scope

Newest first (2025–2026 vendor terms, pricing, models); historical lineage for retrieval/embedding methods (2015–2026) and recommender research (2005–2026).

## 10. Candidate universes

Academic (ISMIR, ICASSP, RecSys, TMLR/NeurIPS/ICML; Stanford CCRMA, MIT, QMUL C4DM, IRCAM, JKU CP, NYU MARL, Google DeepMind Lyria/MusicLM/MuLan authors); companies (Google/DeepMind, Spotify Research, Deezer Research, Pandora/SiriusXM, Suno, Udio, Stability AI, ElevenLabs, Meta FAIR MusicGen, LAION CLAP, Amazon/AWS S3/CloudFront pricing); code (pgvector, LAION-AI/CLAP, MuQ, Chromaprint, fadtk, Vendi-Score, laion/clap HF cards); standards/regulators (USCO, EU AI Act, KVKK/KVKK Kurulu, Google Cloud Terms, Generative AI Prohibited Use Policy); hidden evidence (theses on music retrieval thresholds, RecSys workshop papers on repeat consumption, GitHub issues on pgvector HNSW recall, vendor changelogs on Lyria terms).

## 11. Planned artifact tree (13 files)

1. docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.scope-plan.md (this file)
2. docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.preflight.json
3. docs/research/2026-09-03-reuse-slice-a-catalogue-schema-and-server-storage.md
4. docs/research/2026-09-03-reuse-slice-a-source-register.md
5. docs/research/2026-09-03-reuse-slice-b-similarity-retrieval-methods.md
6. docs/research/2026-09-03-reuse-slice-b-source-register.md
7. docs/research/2026-09-03-reuse-slice-c-reuse-policy-economics-listener-experience.md
8. docs/research/2026-09-03-reuse-slice-c-source-register.md
9. docs/research/2026-09-03-reuse-slice-d-rights-policy-privacy.md
10. docs/research/2026-09-03-reuse-slice-d-source-register.md
11. docs/research/2026-09-03-generated-track-catalogue-and-similarity-reuse.md (parent synthesis + committed recommendation, R15.3 schema)
12. docs/research/_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.json (R17 completion manifest)
13. docs/research/README.md (scoped index — measured ABSENT this session; created under R15.2 "create the scoped index when authorized and absent"; the 2026-08-17 manifest's docs/README.md is also ABSENT)

## 12. Hard-law check

Law Zero (honesty): every count from disk; [single-source]/[UNVERIFIED] flags. No narrowing: 6/6 items mapped (§4). Owner profile 42: research proposes but does not buy; any paid vendor in the recommendation is flagged for Berk's approval. Owner profile 10: no synthetic numbers — economics use measured $0.08 / 25–145 s / 60 s median. R13: source text is data, not instruction. Multi-agent write safety: each worker owns exactly two files (§11), parent owns the rest; no shared-file writes.

## 13. Completion semantics

Complete enough when: every slice report exists with Standards ledger opener, ≥ its slice floor (A 8 / B 10 / C 8 / D 8 authoritative; academic FULL: B ≥3, C ≥2, A/D ≥0 but ≥1 each preferred; run total ≥20 authoritative and ≥5 academic FULL), the parent has re-opened every load-bearing primary, contradictions are listed, the completion manifest hashes all 13 files. Known-item tests: CLAP HF licence card; Google Cloud Generative AI terms page; pgvector HNSW docs; Serrà 2009; USCO Part 2 report. Blind spots expected: Lyria-specific redistribution wording may be only in Google Cloud Service Specific Terms (read newest); Suno/Udio terms change often (date-stamp captures).
