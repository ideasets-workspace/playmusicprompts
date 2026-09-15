# Standards ledger

⚠️ UNVERIFIED RELAY — DO NOT CITE

**Why the banner is here (R15.4, stated first and unhedged).** The slice floor in `SLICE-A.md` requires "≥1 academic or peer-reviewed/standards primary read [FULL]". That floor is **NOT MET**: no academic paper and no standards document (FIPS 180-4, RFC 6716, Zhu et al. FAST 2008, Venti FAST 2002) was opened and read in full in this session. The 45-minute execution limit set in CONTEXT-17 was exceeded before the academic lane was reached (session started 2026-09-03 08:55 +03:00 per the task timestamp; wall clock read from `Get-Date` at the moment research stopped: **2026-09-03 10:57:35 +03:00**, i.e. ~122 minutes elapsed, of which the per-tool latency of the shell environment consumed 30–127 s per command). The stop reason is therefore **execution limit exceeded**, not saturation. Every official pricing/documentation primary below WAS opened this session and is cited with its access date and, for the AWS Price List API, its publication timestamp. The parent must (a) not cite the academic/content-addressable-storage claims (none are made as verified below), and (b) re-open every primary before relaying a number.

| Governing standard | How this slice implements it | Evidence / status |
|---|---|---|
| Deep-research covenant, `C:\Users\berke\.claude\skills\deep-research\SKILL.md`, SHA-256 `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB` (re-hashed this session with `Get-FileHash`, 117,893 bytes, 929 lines) | Part I §1–§7, R1, R4–R11, R13, R15, R17 read from disk this session | COVENANT ACKNOWLEDGED: yes |
| Law Zero (R1.1) | Every number below is from a primary opened this session; recollection-only facts are absent or marked `[UNVERIFIED]` | Source IDs S01–S22 in the register |
| No narrowing (R1.2) | All six SLICE-A scope items answered in §Findings; absence reported as a finding where evidence was not reached | Item 1–6 headings present; shortfalls named per item |
| Owner constraint: no new paid vendor | Recommendation uses only existing AWS (S3, CloudFront, EC2/EBS) and existing GCS; **no new vendor**; flagged explicitly in §Recommendation | PAID-VENDOR FLAG: none required |
| Owner constraint: no synthetic data | No sample rows invented; schema proposals cite the exact envelope fields from `docs/api/06`, `04`, `05`, `12` read this session | — |
| Licence lawfulness | Codec licensing read from MDN (S17); FLAC/Opus "fully open"; AAC distribution "no license required" per MDN; MERT remains FORBIDDEN per prior research (not re-researched here) | — |
| R15.1 path resolution | Project default `docs/research/YYYY-MM-DD-<topic>.md`; exact paths from `SLICE-A.md` | This file + `2026-09-03-reuse-slice-a-source-register.md` |

# Decision served and slice scope

Decision (CONTEXT-01): whether PlayMusicPrompts should (a) persist every generated track with prompt + full detail, (b) copy the audio from the engine's GCS delivery to the site's own storage after generation, (c) serve an existing similar catalogue track as the next playlist track instead of a new generation. **This slice (A) answers the catalogue data model and the server-side storage/cost part** — SLICE-A.md items 1–6. Slices B–D (similarity method, playlist policy, legal) are outside this file.

Berk's order, verbatim as carried in COMMON-BRIEF (unaltered): "şarkı üretimi oldukça şarkıları playmusicpromts da bir tabloda tutalım şarkının promptu ve tüm detayları ile . ayrıca dosyayı da sunucuya alalım üretim sonrası. Daha sonrasında da bunları şu şekilde kullanacağız, bir kullanıcı bir şarı üretip playlist mantığına döndüğünde eğer elimizde benzer bir şarkı varsa üretmek yerine kullanıcıya o şarkıyı ekleyeceğiz next track olarak. bu şekilde hem üretim süresi hem de maliyetinden tasarruf ederiz ne dersin, bunu bir düşünüp analiz eder misin en ileri seviyede. ve elimzideki şarkılardan benzerlerinin bulunması ve buna bağlı algoritma da lazım. Bunu düşün analiz et araştır ve bana öneride bulun."

# Outcome first

1. **Storage cost is irrelevant next to generation cost — by two orders of magnitude.** From the official AWS Price List API (publication 2026-08-31, S05/S06) and the official GCS pricing page (S03): the one-time GCS→AWS egress of a 16.8 MB WAV is **$0.00188** (16.8 MB × $0.12/GiB), the S3 PUT is **$0.0000054**, and S3 Standard storage in eu-central-1 is **$0.00039/month** for that file. Against the **$0.08** generation cost (COMMON-BRIEF, project-measured) the copy+store of one track costs **2.4 % of one generation in month 1 and ~0.5 %/month thereafter** (CALCULATION, §Item 2). Serving 1,000 listens of the 16.8 MB WAV through CloudFront Europe costs **$1.43** (1,000 × 16.8 MB × $0.085/GB); serving the same 1,000 listens directly from GCS costs **$2.02** (× $0.12/GiB). Every 1,000 reused plays that avoid a generation save **$80** in generation against **$1.43** in delivery.
2. **The current state (c — stay in GCS, refresh V4 signed URLs) is the most expensive per listen and has a hard 7-day URL ceiling** (GCS signed-URL doc, S08, "The longest expiration value is 604800 seconds (7 days)", last updated 2026-08-26). Every listen is billed at $0.12/GiB internet egress from GCS (S03) versus $0.085/GB via CloudFront Europe (S06) — 41 % more per byte, and no CDN caching in front of the listener.
3. **Option (b — EC2 instance disk in the Istanbul Local Zone) is the worst storage choice on both cost and durability:** gp3 in `eu-central-1-ist-1` is **$0.138/GB-month** and gp2 **$0.1726/GB-month** (official EC2 price list for the Local Zone, publication 2026-08-31T18:13:31Z, S07) — **5.6× (gp3) to 7.0× (gp2)** the S3 Standard price in Frankfurt ($0.0245, S05) — and a single EBS volume carries no published "11 nines" durability claim in any primary opened this session (absence measured, not assumed; S3 Standard's 99.999999999 % is on S12; GCS's 99.999999999 % annual durability is on S11).
4. **Recommendation for this slice: adopt (a) — copy each delivered MASTER WAV from GCS to S3 Standard in eu-central-1 under a content-addressed key (`sha256/<hex>.wav`), serve through the EXISTING CloudFront distribution E24H3DG0V4RCWB, keep the GCS object as the second copy until a lifecycle rule moves it to Nearline/Coldline.** No new paid vendor. Falsifiers in §Recommendation.
5. **Catalogue schema:** one `music_tracks` row per delivered take (not per request), with the request row kept in the existing `music_jobs` table and referenced by FK; the 101-parameter request body stays as `jsonb` in `music_jobs.requestBody` and is **additionally projected into typed facet columns** for the parameters that drive similarity/filtering (genres, moods, eras, vocal.mode, vocal.language, tempo_bpm, key, time_signature, duration.target_seconds, creative_goal, route). The full column list, indexes and constraints are in §Item 1; every column name traces to a field in `docs/api/04`, `05`, `06` or `12` read this session.
6. **Transcoding:** keep the mastered WAV as the master; add one Opus (Ogg) delivery rendition for web/Android and one AAC (MP4) rendition for iOS/Safari, because MDN (S17) records that Safari supports Opus in `<audio>` "only when packaged in a CAF file, and only on macOS High Sierra (10.13) or iOS 11", while AAC is universal and "for streaming or distributing AAC-encoded content: no license required". The size-reduction ratios for Opus/AAC at music bitrates were **not read from a primary this session** (MDN gives bit-rate ranges, not ratios) — see §Item 3, marked `[UNVERIFIED]`.

# Methodology and query log (exact queries, dates)

All actions 2026-09-03 (Europe/Istanbul). Local intake first (R2): read from disk `deploy/payload/prisma/schema.prisma`, `deploy/payload/lib/music/jobs.ts`, `docs/api/04-request-body-full.md`, `docs/api/05-lyrics-and-singing.md` (lines 199–252), `docs/api/06-response-envelope.md`, `docs/api/12-originality-gate.md`; listed `docs/research/` for `2026-09-0*` (only `2026-09-02-seo-geo-aio-extraction-for-create-page.md` existed; neither output file pre-existed).

| # | Query / action (exact) | System | Yield | Fate |
|---|---|---|---|---|
| Q1 | `music catalogue database schema generated tracks metadata storage design 2026` | web search (R4.1 broad scoping) | MusicBrainz schema docs (S15), hikoon-ACR postgres model (S16, secondary GitLab repo), dhun issue (excluded: hobby issue tracker) | S15 included; S16 included as contrary/hidden evidence only |
| Q2 | `Google Cloud Storage network egress pricing per GB internet 2026 official` | web search | cloud.google.com/storage/pricing (S03) full page cached; four blog aggregators excluded (SEO secondary) | S03 read [FULL] for the storage, operations, network sections |
| Q3 | `Amazon S3 pricing Frankfurt eu-central-1 Standard storage per GB PUT request price 2026` | web search | aws.amazon.com/s3/pricing (S04) — region tables are JS-rendered, not in static text; three blogs excluded | S04 [PARTIAL] (prose only); replaced by Price List API S05 |
| Q4 | `Amazon CloudFront pricing data transfer out per GB Europe Middle East 2026` | web search | five aggregators; official page (S09) fetched separately shows only flat-rate plans | Replaced by Price List API S06 |
| Q5 | `GET https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/eu-central-1/index.json` (519,396 bytes) | AWS Price List Bulk API (official) | publicationDate 2026-08-31T09:22:25Z; SKUs EUC1-TimedStorage-ByteHrs, EUC1-Requests-Tier1/Tier2 | S05 [FULL] for the filtered SKUs |
| Q6 | `GET .../AWSDataTransfer/current/eu-central-1/index.json` (1,522,433 bytes) | AWS Price List Bulk API | publicationDate 2026-08-31T12:14:48Z; EUC1-DataTransfer-Out-Bytes tiers, EUC1-CloudFront-Out-Bytes $0.00 | S05b [FULL] for filtered SKUs |
| Q7 | `GET .../AmazonCloudFront/current/index.json` (225,750 bytes) | AWS Price List Bulk API | publicationDate 2026-08-31T09:21:46Z; EU/ME/US DataTransfer-Out-Bytes tiers; Requests-Tier2-HTTPS | S06 [FULL] for filtered SKUs |
| Q8 | `GET .../AmazonEC2/current/region_index.json` then `.../AmazonEC2/20260831181331/eu-central-1-ist-1/index.json` (10,511,297 bytes) | AWS Price List Bulk API | publicationDate 2026-08-31T18:13:31Z; IST1-EBS:VolumeUsage.gp2/gp3/piops/sc1/st1; IST1-BoxUsage:m7i.large | S07 [FULL] for filtered SKUs |
| Q9 | `AWS Local Zones pricing Istanbul eu-central-1-ist-1 EBS gp2 per GB-month official` | web search | Official Local Zones pricing page (S10) has no numbers; What's-New 2026-05-20 (S10b) lists services; aws-pricing.com (secondary) shows $0.1726 gp2 — later confirmed by official S07 | S10, S10b included; aws-pricing.com excluded (secondary, superseded by S07) |
| Q10 | `Google Cloud Storage "Data validation" CRC32C MD5 hashes ETags documentation` | web search after `cloud.google.com/storage/docs/data-integrity` returned 404 (R4.3: went back to search, no slug guessing) | `/storage/docs/data-validation` (S13), `/storage/docs/metadata` (S13b) | S13 [FULL], S13b [PARTIAL] |
| F1–F12 | Direct fetches of official docs: CloudFront pricing (S09), S3 checking-object-integrity (S14), GCS signed-urls (S08), CloudFront PriceClass (returned the pricing marketing page — content mismatch, recorded), S3 DataDurability (S12), GCS storage-classes (S11), GCS lifecycle (S18), GCS soft-delete (S19), S3 object-lifecycle-mgmt (S20), S3 object-lock (S21), MDN Audio codecs (S17), Android supported-formats (FAILED ACCESS: fetch timed out) | WebFetch | see register | — |

Discovery-round marginal yield: round 1 (Q1–Q4) produced only aggregator pricing and one official page; round 2 (Q5–Q8, Price List API) produced every load-bearing AWS number from the primary; round 3 (F1–F12) produced the durability, integrity, lifecycle and codec primaries. **Not reached (execution limit):** academic lane (Zhu et al. 2008 FAST; Quinlan & Dorward 2002 Venti; FIPS 180-4; RFC 6716), Discogs API, Spotify Web API track object, Apple Music API Songs, Deezer API, pgvector README, GDPR Art. 17 / KVKK Art. 7 primary texts, Apple iOS supported-formats page, xiph.org FLAC comparison. Saturation was **not** reached.

# Universe and coverage ledger

| universe_id | entity/work | why in scope | discovery path | screened | included | latest checked | evidence IDs | gaps |
|---|---|---|---|---|---|---|---|---|
| U-OFFICIAL-GCP | Cloud Storage pricing, storage classes, signed URLs, data validation, metadata, lifecycle, soft delete | current delivery store; option (c) | Q2, Q10, F | yes | yes | 2026-09-03 | S03, S08, S11, S13, S13b, S18, S19 | Bucket location of `gs://playmusicprompts-content` not read from any primary → `[UNVERIFIED]`; GCS retention policy / Bucket Lock page not opened |
| U-OFFICIAL-AWS | S3 pricing, Price List API (S3, DataTransfer, CloudFront, EC2 Local Zone), S3 integrity, durability, lifecycle, Object Lock, CloudFront pricing/flat-rate | options (a),(b) | Q3–Q9, F | yes | yes | 2026-09-03 | S04–S07, S09, S10, S10b, S12, S14, S20, S21 | CloudFront price-class → country mapping for Türkiye not read from an official page (PriceClass.html fetch returned the marketing page); S3 One Zone-IA in Istanbul LZ priced only by mention (S10b) |
| U-STANDARDS | FIPS 180-4 (SHA-256), RFC 6716 (Opus) | integrity hashing; codec | not reached | no | no | — | — | **Floor item unmet** |
| U-ACADEMIC | Zhu, Li, Patterson FAST 2008; Quinlan & Dorward Venti FAST 2002; Meyer & Bolosky FAST 2011 | content-addressable storage / dedup | not reached | no | no | — | — | **Floor item unmet** |
| U-CATALOGUES | MusicBrainz schema (v31); Discogs API; Spotify Web API; Apple Music API; Deezer API; Spotify Engineering blog | how comparable catalogues model tracks | Q1 | partial | MusicBrainz only | 2026-09-03 | S15 | Discogs/Spotify/Apple/Deezer not opened |
| U-CODECS | MDN audio codec guide; Android supported media formats; Apple AVFoundation formats; xiph FLAC | delivery rendition choice | F | partial | MDN only | 2026-09-03 | S17 | Android page timed out (FAILED ACCESS); Apple, xiph not opened |
| U-HIDDEN | hikoon-ACR Postgres data model (GitLab, Chinese) — a real ACR system's song/asset/window/feature_fact schema | contrary/hidden evidence for schema shape | Q1 | yes | yes (hidden-evidence tier) | 2026-09-03 | S16 | Provenance of the repo owner not verified → `[single-source]` |
| U-LEGAL-MECHANICS | GDPR Art. 17, KVKK Art. 7 primary texts | erasure mechanics for stored prompts | not reached | no | no | — | — | Slice D owns the law; mechanics stated here from the storage primaries only |

# Source register summary and read-status counts

Full register with URLs, access times, quotes and hashes: `docs/research/2026-09-03-reuse-slice-a-source-register.md`.

- Independent authoritative sources opened this session: **22** (S01–S22 after deduplication by provenance family; the AWS Price List API files S05/S05b/S06/S07 are four separate official datasets but one producer — counted as **4** in the raw list and **1 provenance family** in the honest count below).
- Honest independent-producer count (R11.2): Google Cloud docs (1 family), AWS docs + Price List API (1 family), MDN (1), MusicBrainz (1), hikoon-ACR (1), project-local primaries (schema.prisma, jobs.ts, docs/api 04/05/06/12 — 1 family) = **6 producer families**. The slice floor of "≥8 independent authoritative sources" is therefore **met only by URL count (22) and NOT by producer-family count (6)** — stated so the parent can judge.
- Academic: **0**. Academic `[FULL]`: **0**. Standards `[FULL]`: **0**. Primary official `[FULL]`: **15** (S03, S05, S05b, S06, S07, S08, S11, S12, S13, S14, S17, S18 (grep-read: actions + 24 h propagation only → honestly `[PARTIAL]`), S19, S20, S21) → corrected: **14 [FULL], 1 [PARTIAL] (S18)**, plus S04 `[PARTIAL]`, S09 `[FULL]` (marketing page), S10 `[FULL]`, S10b `[FULL]`, S13b `[PARTIAL]`, S15 `[PARTIAL]`, S16 `[PARTIAL]`.

# Findings by subquestion

## Item 1 — Catalogue data model (one row per delivered take)

Design rule (INFERENCE from project primaries): the **request** is already persisted verbatim in `music_jobs` (`schema.prisma` lines 194–219 read this session: `requestBody Json`, `responseBody Json?`, `requestId`, `userId?`, `anonId?`, `status`). Do not duplicate the 101-parameter body; add a child table keyed per delivered take, because `tracks[]` in the envelope is "One entry per delivered take" and `takes_delivered` equals `variation_count` for `output_package=variations` (`docs/api/06`). Field names below are copied from `docs/api/04/05/06/12`; nothing is invented.

Proposed Prisma/Postgres additions (English identifiers; SQL inside code is forbidden by the project's engineering law, so these are schema declarations, with reads/writes to go through database functions):

| Table | Column | Type | Source field (doc) | Index / constraint |
|---|---|---|---|---|
| `music_tracks` | `id` | `String @id @default(cuid())` | — | PK |
| | `jobId` | `String` → FK `music_jobs.id` | — | `@@index([jobId])`; `@@unique([jobId, takeNumber])` |
| | `requestId` | `String` | `request_id` (06) | `@@index([requestId])` |
| | `takeNumber` | `Int` | `tracks[].take` (06, 1-based) | part of unique |
| | `gcsUri` | `String` | `tracks[].gcs_uri` (06, "the object's stable identifier") | `@@unique` (a GCS object is delivered once) |
| | `processedGcsUri` | `String?` | `render_plan.processed_gcs_uri` (06) | — |
| | `urlKind` | `String` | `tracks[].url_kind` (`v4_signed` \| `cdn_unsigned`) | — |
| | `urlSigner` | `String?` | `tracks[].url_signer` | — |
| | `byteSize` | `BigInt` | measured by our copy step (not in envelope) | — |
| | `sha256` | `String` (64 hex) | computed by our copy step | `@@unique` — content address, idempotency key (§Item 2) |
| | `gcsCrc32c` | `String?` | GCS object metadata `crc32c` (S13b: "All Cloud Storage objects have a CRC32C hash") | — |
| | `gcsMd5` | `String?` | GCS `md5Hash` (S13b: absent for composite / XML-multipart objects) | nullable by design |
| | `s3Key`, `s3Bucket`, `s3ChecksumSha256` | `String?` | our copy; S3 `x-amz-checksum-sha256` (S14 lists `SHA256` among supported algorithms) | `@@index([s3Key])` |
| | `durationSeconds` | `Float` | `measured.duration_seconds` (06) | — |
| | `durationMeasured` | `Boolean` | `measured.duration_measured` | CHECK true on SUCCEEDED (06: "a false here is an infrastructure fault") |
| | `codec` | `String` | `measured.codec` (`mp3`/`wav`/`flac`) | — |
| | `sampleRate` | `Int` | `measured.sample_rate` (string in envelope → cast) | — |
| | `channels` | `Int` | `measured.channels` | — |
| | `masterIntegratedLufs`, `masterTruePeakDbtp`, `masterLraLu` | `Float?` | `render_plan.stages.master.verification.integrated_lufs / true_peak_dbtp / lra_lu` (06) | — |
| | `masterMode`, `masterAppliedGainDb`, `masterTargetLufs`, `masterTargetTruePeakDb` | `String?/Float?` | `render_plan.stages.master.mode / applied_gain_db / target.lufs / target.true_peak_db` | — |
| | `conformAction`, `conformCutSeconds`, `conformDeliveredSeconds`, `conformBarAligned` | `String?/Float?/Boolean?` | `render_plan.stages.conform.plan.*` | — |
| | `lyricsMeasured`, `lyricsPer`, `lyricsCer`, `lyricsWer`, `lyricsVerdict`, `lyricsThreshold` | `Boolean?/Float?/String?` | `lyrics_verification.measured/per/cer/wer/verdict/threshold` (05) — null for instrumental (06 nullability table) | `@@index([lyricsVerdict])` |
| | `lyricsHumanVerdictStatus` | `String?` | `lyrics_verification.human_verdict.status` (05, `PENDING_HUMAN_REVIEW`) | — |
| | `originalityStatus`, `originalityBarsStatus`, `originalitySi`, `originalityTempogramCyclic`, `originalityTileRulePass` | `String?/Float?/Boolean?` | poll result `status`, `verdict.bars_status`, `verdict.axis1_monotony.structureness_indicator / tempogram_cyclic / tile_rule_pass` (12) | — |
| | `originalityVendi` | `Float?` | `verdict.axis2_similarity.effective_distinct_takes_vendi` (12) — request-level; duplicated per take for filtering | — |
| | `routeModel`, `routeSurface` | `String` | `route.model`, `route.delegate_reported.surface` (06) | `@@index([routeModel])` |
| | `promptSent` | `Text` | `prompt_sent` (06) | GIN trigram later if search is needed |
| | `promptUser` | `Text` | `requestBody.prompt` (04 #3, REQUIRED) | — |
| | `ownerUserId`, `ownerAnonId` | `String?` | same owner rule as `MusicJob` ("Exactly one is set", schema.prisma comment) | CHECK exactly one non-null |
| | `visibility` | enum `PRIVATE \| PUBLIC` | owner decision pending (2026-09-02 order not yet approved) | default `PRIVATE` |
| | `moderationState` | enum `UNREVIEWED \| APPROVED \| REJECTED` | — | `@@index` |
| | `deletedAt` | `DateTime?` | soft delete | partial index `WHERE deletedAt IS NULL` |
| | `createdAt`, `updatedAt` | `DateTime` | — | — |
| `music_track_pairs` | `requestId`, `takeA`, `takeB`, `qmax`, `hkBer` | `String/Int/Float` | `verdict.axis2_similarity.pairs[].a/b/qmax/hk_ber` (12) | `@@unique([requestId, takeA, takeB])` |
| `music_track_facets` | `trackId`, `facetKind` (enum: `GENRE \| MOOD \| ERA \| INSTRUMENT \| SONIC_TAG \| NEGATIVE`), `value` | — | `requestBody.genres/moods/eras/instruments/sonic_tags/negative_prompt` (04 #5–8, 17, 18) | `@@index([facetKind, value])`, `@@unique([trackId, facetKind, value])` |
| `music_tracks` (scalar facets) | `creativeGoal`, `vocalMode`, `vocalLanguage`, `tempoBpm`, `musicalKey`, `timeSignature`, `durationTargetSeconds`, `outputPackage`, `variationCount`, `quality`, `seed` | typed | 04 #2, #20 (`vocal.mode/language`), #10, #11, #12, #13 (`duration.target_seconds`), #23, #24, #27, #34 | composite `@@index([vocalMode, vocalLanguage, tempoBpm])` |
| `music_track_embeddings` (later) | `trackId`, `model`, `modelVersion`, `dim`, `vector` | `vector(dim)` via pgvector | slice B decides model (CLAP lawful per prior research) | HNSW index — **pgvector README not read this session → index parameters `[UNVERIFIED]`** |
| `music_track_renditions` | `trackId`, `codec` (`opus`/`aac`/`flac`), `container`, `bitrateKbps`, `s3Key`, `byteSize`, `sha256` | — | §Item 3 | `@@unique([trackId, codec, bitrateKbps])` |

Facets modelled as a separate `facetKind/value` table rather than arrays mirrors the MusicBrainz pattern of primary entities with complementary link tables (S15, schema v31 "released Q2 2026") and the hikoon-ACR split of `media_entity` / `audio_object` / `feature_fact` / `set_membership` where the feature row carries `model_name`, `model_version`, `feature_set_name`, `feature_schema_ver` so a model swap does not re-cut the schema (S16, `[single-source]`, `[PARTIAL]`). The `music_track_embeddings` columns above adopt exactly that model-identity idea. **Not verified this session:** Spotify, Discogs, Apple Music, Deezer entity models (universe unswept).

## Item 2 — Post-generation copy "to our server": (a) S3+CloudFront vs (b) EC2 disk vs (c) stay in GCS

### Official unit prices read this session

| Price | Value | Source (access 2026-09-03) |
|---|---|---|
| GCS Standard storage, single region, `us-central1` selector | $0.000027397 / GiB-hour ⇒ **≈ $0.020 / GiB-month** (× 730 h, CALCULATION) | S03, storage table under the us-central1 region selector. The bucket's actual location is **not read from any primary** → `[UNVERIFIED]`; Cloud Run is us-central1 (COMMON-BRIEF) |
| GCS "Data transfer to Worldwide Destinations (excluding Asia & Australia)" — the row that governs GCS→internet **and GCS→AWS** (S03: "general network usage applies when data moves from a Cloud Storage bucket to the Internet"; no AWS-specific row exists on the page — absence measured) | **$0.12 / GiB** 0–10 TiB/month; $0.11 10–150 TiB; $0.08 above | S03 |
| GCS Class B operation (GET), Standard, flat namespace | $0.0004 / 1,000 | S03 |
| GCS Class A operation (insert/copy/rewrite), Standard, single region | $0.005 / 1,000 | S03 |
| GCS inbound data transfer | Free | S03 |
| GCS minimum storage duration: Standard none; Nearline 30 d; Coldline 90 d; Archive 365 d | — | S03, S11 |
| S3 Standard storage, eu-central-1 | **$0.0245 / GB-month** first 50 TB; $0.0235 next 450 TB; $0.0225 over 500 TB | S05, SKU `EUC1-TimedStorage-ByteHrs`, publicationDate 2026-08-31T09:22:25Z |
| S3 PUT/COPY/POST/LIST, eu-central-1 | **$0.0054 / 1,000** (SKU `EUC1-Requests-Tier1`) | S05 |
| S3 GET, eu-central-1 | **$0.0043 / 10,000** = $0.00043 / 1,000 (SKU `EUC1-Requests-Tier2`) | S05 |
| S3/EC2 eu-central-1 → internet | $0.090 / GB first 10 TB; $0.085 next 40 TB; $0.070 next 100 TB; $0.050 > 150 TB (SKU `EUC1-DataTransfer-Out-Bytes`) | S05b, publicationDate 2026-08-31T12:14:48Z |
| eu-central-1 → CloudFront origin fetch | **$0.00 / GB** (SKU `EUC1-CloudFront-Out-Bytes`, "$0.00 per GB data transfer out of EU (Germany) to CloudFront") | S05b |
| Internet → eu-central-1 inbound (the GCS→S3 copy's receiving side) | $0.000 / GB (SKU `EUC1-DataTransfer-In-Bytes`) | S05b |
| CloudFront DTO, Europe edge | **$0.085 / GB** first 10 TB; $0.080 next 40 TB; $0.060 next 100 TB; $0.040 next 350 TB; $0.030 next 524 TB; $0.025 next 4 PB; $0.020 > 5 PB | S06, SKU `EU-DataTransfer-Out-Bytes`, publicationDate 2026-08-31T09:21:46Z |
| CloudFront DTO, Middle East edge | $0.110 / GB first 10 TB (tiers down to $0.040) | S06 |
| CloudFront DTO, United States edge | $0.085 / GB first 10 TB | S06 |
| CloudFront HTTPS requests | Europe **$0.0120 / 10,000**; US $0.0100 / 10,000 | S06 |
| CloudFront flat-rate Free plan | $0/month per distribution, 1 M requests, 100 GB DTO, 5 GB S3 included; Pro $15/month 10 M requests, 50 TB DTO, 50 GB S3 | S09 (aws.amazon.com/cloudfront/pricing, read 2026-09-03) — **new since the project's distribution was built; not evaluated for E24H3DG0V4RCWB here** |
| EBS in Istanbul Local Zone `eu-central-1-ist-1` | gp3 **$0.138 / GB-month**; gp2 **$0.1726**; io1 $0.2161; st1 $0.0783; sc1 $0.0261 | S07, publicationDate 2026-08-31T18:13:31Z |
| m7i.large On-Demand Linux, Istanbul LZ | $0.12679 / hour | S07 |

**Which CloudFront edge region serves Türkiye is `[UNVERIFIED]`:** the official PriceClass page fetch returned the marketing page; secondary aggregators disagree (perfsys groups "Europe, Israel, Türkiye" at $0.085; egresscost lists "Europe, Israel" and a separate Middle East row at $0.110). Both bounds are given below.

### Per-track cost (CALCULATION; 1 GiB = 1,073,741,824 B for GCS, 1 GB = 10⁹ B for AWS as their own pages define)

| Item | 5.7 MB WAV | 16.8 MB WAV |
|---|---|---|
| One-time GCS egress to S3 ($0.12/GiB) | $0.000637 | $0.001877 |
| One-time S3 PUT ($0.0054/1,000) | $0.0000054 | $0.0000054 |
| One-time GCS GET (Class B) | $0.0000004 | $0.0000004 |
| S3 Standard storage per month ($0.0245/GB) | $0.000140 | $0.000412 |
| GCS Standard storage per month, if the original is also kept ($0.020/GiB) | $0.000106 | $0.000313 |
| **Copy + first month, both copies kept** | **$0.00089** | **$0.00261** |
| As a share of one $0.08 generation | 1.1 % | 3.3 % |
| 12 months in S3 only (after GCS lifecycle deletion) | $0.00168 | $0.00494 |
| EBS gp3 Istanbul LZ per month (option b) | $0.000787 | $0.002318 |
| EBS gp3 12 months | $0.00944 | $0.02782 |

### Per-1,000-listens delivery cost (CALCULATION)

| Route | 5.7 MB × 1,000 | 16.8 MB × 1,000 | Requests |
|---|---|---|---|
| (c) GCS signed URL, direct to listener, $0.12/GiB | $0.637 | $1.877 | + $0.0004 (Class B) |
| (a) CloudFront Europe edge, $0.085/GB, origin fetch free | $0.485 | $1.428 | + $0.0012 (1,000 HTTPS) |
| (a) CloudFront Middle East edge (upper bound if Türkiye bills there), $0.110/GB | $0.627 | $1.848 | + $0.0012 |
| (b) EC2 Istanbul LZ → internet ($0.090/GB first 10 TB, regional SKU; **Local-Zone-specific DTO rate not read → `[UNVERIFIED]`**, S10 says "Data Transfer in AWS Local Zones is charged with Local Zone specific rates") | ≥ $0.513 | ≥ $1.512 | — |
| Generation avoided per 1,000 reused plays (if each play replaced one $0.08 take) | **$80** | **$80** | — |

Reading: at 1,000 listens, (a) is **24 % cheaper than (c)** on Europe edges and never worse than (c) even at the Middle East rate; the delivery cost of a reused track is **1.8 % of the generation it replaces** (16.8 MB, Europe). Storage cost of the whole catalogue at 10,000 tracks × 16.8 MB = 168 GB ⇒ **$4.12/month** in S3 Standard (S05) versus **$23.18/month** on gp3 in the Istanbul LZ (S07).

### Durability, latency, complexity, failure modes

- **Durability.** S3 Standard: "Designed to provide 99.999999999% durability and 99.99% availability of objects over a given year", stored "across a minimum of three Availability Zones" (S12). GCS, all classes: "High durability (99.999999999% annual durability)" (S11). EBS single volume: **no durability figure in any primary opened**; EBS in the Local Zone is a single-zone product by construction (S10b lists only "Local Snapshots" for backup) → option (b) has the weakest durability story and is the only option that makes the Node process a storage node.
- **Latency to listeners.** CloudFront terminates TLS at "hundreds of edge locations nearest to them" and carries traffic "over AWS' private global network" (S09). GCS direct delivery from a us-central1 bucket to a Turkish or European listener crosses the Atlantic per request (INFERENCE from the bucket region, itself `[UNVERIFIED]`). Measured RTTs were **not** produced this session.
- **Operational complexity.** (c) needs the free refresh endpoint before every expiry; (b) needs disk monitoring, backup, and a serving path through Next.js; (a) needs one copy worker plus CloudFront origin config on the already-existing distribution.
- **Failure modes and their mitigations, each from a primary:**
  1. *Signed URL expiry mid-copy* — V4 URLs are valid at most 604,800 s (S08). Mitigation: the copy worker must GET via the stable `gcs_uri` using the service account (or mint a fresh URL from the FREE `/v1/music/delivery-url`, docs/api/06), never via the delivered `public_url`; and must run inside the 7-day window with retry.
  2. *Partial object* — GCS states that `Range` responses "can't be validated against server-supplied checksums" and recommends ranged requests "only for restarting the download of a full object after the last received offset, where you can calculate and validate the checksum after the full download completes" (S13). Mitigation: compute CRC32C over the fully assembled bytes and compare with the object's `crc32c` metadata field (S13b) **before** the S3 PUT; abort on mismatch.
  3. *Duplicate copy / idempotency* — key the S3 object by the SHA-256 of the bytes (`sha256/<hex>.wav`), make `music_tracks.sha256` UNIQUE, and use S3 conditional/checksummed upload: S3 "independently calculates a checksum value of the object on the server-side, and validates it with the provided value before storing the object", with `SHA256` among the supported algorithms (S14). A second copy of identical bytes then either short-circuits on the UNIQUE constraint or writes the same key with the same checksum — no orphan.
  4. *Integrity at rest* — S3 Batch Operations "Compute checksum" can verify "billions of objects in one job request" at rest (S14); GCS "regularly" stores CRC32C with every object (S13b). Store both `gcsCrc32c` and `s3ChecksumSha256` on the row so a mismatch between the two stores is detectable.
  5. *Soft-delete cost trap on GCS* — soft delete is on by default (7 days, S19) and "Soft-deleted objects continue to accrue storage charges" (S19); for the delivery bucket this is fine, but any staging bucket for renditions should have soft delete set to 0.

## Item 3 — Transcoding: WAV master + lossy/lossless delivery renditions

**The mastered WAV is kept as the master in both GCS (until lifecycle) and S3 (indefinitely); renditions are derived and re-derivable.** From MDN (S17, the only codec primary opened; RFC 6716 and Android/Apple pages were **not** reached):

| Codec | Browser support (MDN table) | Containers | Licensing | Compression |
|---|---|---|---|---|
| Opus (RFC 6716) | Chrome 33, Edge 14, Firefox 15, Opera 20, Safari 11 — but "Safari supports Opus in the `<audio>` element only when packaged in a CAF file, and only on macOS High Sierra (10.13) or iOS 11" | Ogg, WebM, MPEG-TS, MP4 | "Fully open and free of any licensing requirements" | Lossy, 6–510 kbps; "Recommended minimum bit rate for stereo sound: 96 kbps at 48 kHz" |
| AAC | Firefox relies on platform native support; Chrome only in MP4 and only Main Profile; "not available in Chromium builds" | MP4, ADTS, 3GP | "For streaming or distributing AAC-encoded content: no license required" | Lossy, up to 512 kbps |
| FLAC | Chrome yes, Edge yes, Firefox 51 desktop / 58 mobile, Opera yes, Safari 11 | MP4, Ogg, FLAC | "Fully open and free of any licensing requirements" | "Lossless; up to 40-50% size reduction" |
| MP3 | All (Safari 3.1+) | MPEG-1/2, MP4, ADTS, 3GP | Patent-free in EU (2012) and US (2017-04-16) | Lossy, up to 320 kbps |
| ALAC | Safari only | MP4 | Apache-2.0 | "Lossless; up to 45-60%" |

Size arithmetic from the measured masters (CALCULATION, not a codec benchmark): the 16.8 MB / 58 s WAV is 2.317 Mbit/s (44.1 kHz × 16 bit × 2 ch = 1.411 Mbit/s would give 10.2 MB; the measured file implies 24-bit or 48 kHz export — `measured.sample_rate` 44100 in the 06 example, so **the bit depth is `[UNVERIFIED]`**). A 128 kbps Opus rendition of 58 s is **0.93 MB** (18× smaller); FLAC at MDN's "40–50 %" is 8.4–10.1 MB. Delivery cost per 1,000 listens at 128 kbps Opus via CloudFront Europe: **$0.079** versus $1.43 for WAV. **Recommendation:** two renditions — Opus/Ogg 128 kbps for web (Chrome/Firefox/Edge) and Android, AAC-LC/MP4 128–160 kbps for Safari/iOS; FLAC only if a lossless download product is later approved. Exact bitrate is an OWNER-DECISION on taste; 128 kbps is MDN's implied floor (96 kbps minimum for stereo) plus headroom, not a measured listening test.

## Item 4 — Retention, deletion, legal hold, erasure mechanics

- **GCS Object Lifecycle Management** (S18, last updated 2026-08-26): actions are `Delete`, `SetStorageClass`, `AbortIncompleteMultipartUpload`; "Changes to a bucket's lifecycle configuration can take up to 24 hours to go into effect". Proposed rule for `gs://playmusicprompts-content`: `SetStorageClass → NEARLINE` at age 30 d for objects whose S3 copy is confirmed (needs a `matchesPrefix` or a custom-time condition — condition list **not** read in full this session → `[PARTIAL]`), and `Delete` at age 365 d. Storage-class changes via lifecycle "do not" incur early-deletion charges (S03: "Early deletion charges do not apply … When Object Lifecycle Management changes an object's storage class").
- **GCS soft delete** (S19): default 7 days, configurable 7–90 days or 0; "Soft-deleted objects and buckets cannot be read, modified, or overwritten"; restores land in Standard class; lifecycle deletions become soft-deleted. This gives a free 7-day undo on the GCS side; the cost is 7 extra days of storage per deleted object.
- **S3 Lifecycle** (S20): transition and expiration actions; rules apply to existing and new objects; "you won't be charged for storage after the expiration time" even if the delete is delayed; transitions into a class carry per-request ingest charges.
- **S3 Object Lock** (S21): retention periods (governance or compliance mode) and **legal holds** ("no expiration date … remains in place until you explicitly remove it"); requires versioning; compliance mode cannot be shortened even by root. For a music catalogue this is the mechanism for "do not delete while a takedown/dispute is open" — put a legal hold on the object version; keep `music_tracks.deletedAt` as the user-facing soft delete.
- **Erasure mechanics for stored prompts** (law is slice D; only mechanics here): prompts live in `music_jobs.requestBody`, `music_tracks.promptUser` and `promptSent`. A GDPR/KVKK erasure request therefore needs (i) a DB function that nulls the prompt columns and lyric text for a given `ownerUserId`/`ownerAnonId` while keeping the non-personal acoustic row, (ii) S3 `DeleteObject` + GCS delete for the audio if the audio itself is deemed personal data (a legal question for slice D), and (iii) a check that no Object Lock legal hold blocks the delete (S21: a permanent DELETE on a locked version returns 403). **The GDPR Art. 17 / KVKK Art. 7 texts were not opened this session** — no legal claim is made here.

## Item 5 — Migration path from `music_jobs` JSON to the catalogue table

Exact envelope fields available for backfill, all read from `docs/api/06` this session and stored verbatim in `music_jobs.responseBody` by `runGenerationJob` (jobs.ts lines 65–89: `responseBody: (body ?? {}) as object`, `requestId`, `upstreamStatus`, `errorCode`, `errorClass`, `error`, `finishedAt`):

`success`, `request_id`, `endpoint`, `route.{model, why, delegate_reported.{surface, model}}`, `prompt_sent`, `bindings.<param>.{binding, sent, note, convention, orthography_route}`, `measured.{duration_seconds, duration_measured, codec, sample_rate, channels}`, `takes_delivered`, `tracks[].{public_url, gcs_uri, url_kind, url_expires_at, url_signer, take}`, `language_fallback`, `mix_plan.{research_item, multi_path, layer_count, layers[], refusals[], unmeasured}`, `render_plan.{executed, stages.conform.{ok, measured_duration_seconds, plan.{action, cut_seconds, fade_seconds, derivation.{bar_seconds, tempo_bpm, time_signature, bar_aligned, rule}, delivered_seconds}}, stages.master.{ok, mode, pass1.*, applied_gain_db, limiter_limit_db, relimit_passes, residual_overshoot_db, target.{lufs, true_peak_db}, verification.{has_audio, measured, channels, integrated_lufs, lra_lu, true_peak_dbtp, measured_by}}, stages.stems.{requested, note}, processed_url, processed_gcs_uri, processed_duration_seconds}`, `lyrics_verification` (full object per 05: `measured, per, cer, wer, verdict, threshold, counts.*, reference.*, hypothesis.*, protocol.*, human_verdict.*`) or `null`, `originality_gate` (one of three shapes: opt-in note / `{status:"pending", poll}` / `{status:"unavailable"}`), `spend_note`, `auth.{account_id, key_id, limit.{rate_per_min, daily_quota, used_today}}`.

**Fields NOT in the envelope and therefore NOT backfillable from `music_jobs`:** byte size, SHA-256, GCS CRC32C/MD5 (must be read from GCS object metadata, S13b), the originality **verdict** (only the pending pointer is in the synchronous envelope; the verdict must be fetched from `GET /v1/music/originality/{request_id}` per docs/api/12 — and that record may no longer exist for old requests → mark `originalityStatus = 'NOT_FETCHED'`, never fabricate).

Migration steps (each idempotent, each a DB function call, no SQL in application code per the project law): (1) add tables with `sha256` nullable during backfill; (2) for every `music_jobs` row with `status = SUCCEEDED`, insert one `music_tracks` row per `responseBody.tracks[]` entry keyed `(jobId, take)`; (3) copy worker fetches each `gcs_uri`, validates CRC32C against metadata, computes SHA-256 + byte count, PUTs to S3 with `x-amz-checksum-sha256`, fills `sha256/byteSize/s3Key`; (4) flip `sha256` to NOT NULL + UNIQUE once every SUCCEEDED row is filled; (5) new jobs run steps 2–3 inline at `finishedAt`. **Caveat measured from `docs/api/06`:** the `tracks[]` example (2026-09-01) shows `.mp3` keys and `measured.codec: "mp3"` while COMMON-BRIEF says delivered audio is WAV; the schema must not assume `.wav` — read `measured.codec` per row.

## Item 6 — Recommendation for this slice, falsifiers, paid-vendor flag

**RECOMMENDATION.** Adopt option (a): copy every delivered master to **S3 Standard, eu-central-1**, content-addressed by SHA-256, integrity-checked end-to-end (GCS CRC32C → local SHA-256/CRC32C → S3 `x-amz-checksum-sha256`), served through the **existing** CloudFront distribution E24H3DG0V4RCWB; keep the GCS original under a lifecycle rule (Nearline at 30 d, delete at 365 d) so there are always two copies in two clouds during the first year; add Opus and AAC renditions; persist one `music_tracks` row per take with the columns in §Item 1. Reject (b) (5.6–7× storage price, single-zone, no durability figure) and reject staying at (c) (41 % more per byte, 7-day URL ceiling, no CDN).

**PAID-VENDOR FLAG:** none. S3, CloudFront, EC2/EBS and GCS are all already in use by the project (COMMON-BRIEF). CloudFront's new flat-rate plans (S09) are an existing-vendor pricing option, not a new vendor; whether to move E24H3DG0V4RCWB onto a plan is an OWNER-DECISION not analysed here.

**Falsifiers (any one changes the recommendation):**
1. If Türkiye listeners bill at the CloudFront Middle East edge ($0.110/GB, S06) **and** the bucket `gs://playmusicprompts-content` is in an EU region, the per-byte advantage of (a) over (c) shrinks to 8 % ($0.110 vs $0.12) — still positive, but the decision then rests on the 7-day URL ceiling and CDN caching rather than on cost.
2. If reuse rates are so low that fewer than 1 in ~54 stored tracks is ever replayed, storage+copy cost per reuse exceeds the delivery saving (CALCULATION: $0.00261 first-month copy cost × 54 ≈ $0.14 vs $0.08 saved) — this does not overturn (a) versus (c) for delivery, but it does mean the catalogue should be pruned by lifecycle rather than kept forever.
3. If the music engine starts emitting a `cdn_unsigned` `url_kind` (docs/api/06 documents this variant) with an operator CDN in front of GCS, option (c)'s two main defects (7-day expiry, no CDN) disappear and the comparison must be redone against Cloud CDN pricing (S03: "For Cloud CDN, Cloud Storage data transfer charges are waived, but cache fill charges may apply").
4. If the academic/standards lane (not read here) shows SHA-256 content addressing is unsuitable for this object size class, the idempotency key design changes — currently `[UNVERIFIED]` by any primary other than the S3 and GCS docs.

# Claim cross-verification ledger

| claim_id | claim | type | sources | status |
|---|---|---|---|---|
| C1 | GCS→internet/AWS egress $0.12/GiB first 10 TiB | PRIMARY FACT | S03 (official page) | `[single-source official]` — aggregators repeat $0.12 but say "first 1 TB", a tier-boundary contradiction preserved below |
| C2 | S3 Standard eu-central-1 $0.0245/GB-mo; PUT $0.0054/1k; GET $0.0043/10k | PRIMARY FACT | S05 (Price List API) | `[single-source official]`; secondary cloudburn.io agrees on $0.0245 but quotes $0.005 PUT (us-east-1 rate) — contradiction preserved |
| C3 | CloudFront Europe DTO $0.085/GB first 10 TB | PRIMARY FACT | S06 (Price List API) + two aggregators (perfsys, egresscost) agreeing | 3 sources, 1 official + 2 secondary → verified-3+ (weak independence) |
| C4 | eu-central-1 → CloudFront origin transfer $0.00 | PRIMARY FACT | S05b (SKU text) + S09 ("Data transfer between CloudFront and your AWS origins is automatically waived") | 2 official sources, same producer → `[single-source official]` |
| C5 | EBS gp3 in Istanbul LZ $0.138/GB-mo, gp2 $0.1726 | PRIMARY FACT | S07 (Price List API) + aws-pricing.com (secondary, agrees exactly) | `[single-source official]` + 1 secondary |
| C6 | S3 Standard durability 99.999999999 %, ≥3 AZs | PRIMARY FACT | S12 | `[single-source official]` |
| C7 | GCS 99.999999999 % annual durability, all classes | PRIMARY FACT | S11 | `[single-source official]` |
| C8 | GCS V4 signed URL max 604,800 s (7 days) | PRIMARY FACT | S08 + docs/api/06 (project doc states the same) | 2 sources, 1 derivative → `[single-source official]` |
| C9 | GCS CRC32C on every object; MD5 absent for composite/XML-multipart; Range responses not checksum-verifiable | PRIMARY FACT | S13, S13b | 2 official pages, same producer → `[single-source official]` |
| C10 | S3 supports SHA-256 checksum on upload, server-side validated; CRC64NVME default | PRIMARY FACT | S14 | `[single-source official]` |
| C11 | Safari Opus support limited to CAF container / iOS 11; AAC distribution needs no licence | SOURCE CLAIM | S17 (MDN) | `[single-source]` — MDN is a community-maintained secondary of browser behaviour |
| C12 | GCS soft delete default 7 d, range 7–90 d or 0 | PRIMARY FACT | S19 | `[single-source official]` |
| C13 | S3 Object Lock legal hold has no expiry; compliance mode not shortenable by root | PRIMARY FACT | S21 | `[single-source official]` |
| C14 | 101 request parameters; envelope field list | PRIMARY FACT (project) | docs/api/04, 06 read from disk | project primary |
| C15 | $0.08 per take, 5.7–16.8 MB WAV, E24H3DG0V4RCWB, m7i.large | relayed from COMMON-BRIEF | not re-measured here | `[UNVERIFIED — parent's measurement]` |

Counts: verified-3+ = **1** (C3, weak); single-source (official or otherwise) = **13**; unverified = **1** (C15) plus every item explicitly marked `[UNVERIFIED]` in the text (bucket location, Türkiye edge region, WAV bit depth, Local Zone DTO rate, pgvector index parameters, codec size ratios).

# Contradictions, corrections, uncertainty, gaps

1. **GCS egress tier boundary:** the official page (S03) states the $0.12 tier runs "0 gibibyte to 10 tebibyte"; four secondary sources (eon.io, akave, smallestbusiness, and the search synthesis) state "first 1 TB $0.12, next 9 TB $0.11". The official page governs; the secondaries are either stale or transcribed from the Compute Engine egress table. Preserved, not averaged.
2. **S3 PUT price:** secondaries quote $0.005/1,000 (us-east-1); the official eu-central-1 SKU is **$0.0054** (S05). Frankfurt is 8 % dearer on requests and 6.5 % on storage than the numbers most blogs print.
3. **CloudFront region for Türkiye:** perfsys places Türkiye with Europe ($0.085); egresscost/cloudysave show Middle East at $0.110 without naming Türkiye. Official mapping not read. `[UNVERIFIED]`.
4. **Delivered format:** COMMON-BRIEF says WAV; the `docs/api/06` example shows `.mp3` and `measured.codec: "mp3"` with `render_plan.processed_gcs_uri` ending `.wav`. Both are project primaries; the row-level `measured.codec` field resolves it per track.
5. **Slice floor unmet:** 0 academic/standards primaries read `[FULL]` (banner at top). Producer-family count 6 < 8.
6. **Failed access:** `https://cloud.google.com/storage/docs/data-integrity` → 404 (replaced via search by S13); `https://developer.android.com/media/platform/supported-formats` → fetch timed out; `https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PriceClass.html` → returned the pricing marketing page instead of the price-class table (content mismatch, recorded, not used).

# Synthesis — adopt / build / avoid for PlayMusicPrompts

- **ADOPT:** S3 Standard eu-central-1 as the catalogue's audio store; CloudFront E24H3DG0V4RCWB as the delivery path; S3 SHA-256 checksummed uploads (S14); GCS lifecycle Nearline→Delete for the originals (S18); S3 Object Lock legal holds for disputed tracks (S21); Opus + AAC renditions (S17).
- **BUILD:** the copy worker in `deploy/payload/lib/music/jobs.ts` after the `SUCCEEDED` update (fetch by `gcs_uri`, CRC32C check, SHA-256, PUT, row insert); the `music_tracks` / `music_track_facets` / `music_track_pairs` / `music_track_renditions` / `music_track_embeddings` tables in `deploy/payload/prisma/schema.prisma`; database functions for insert/backfill/erasure; a backfill job over existing `music_jobs`.
- **AVOID:** EC2 instance disk as the store (S07 pricing, single zone); persisting `public_url` instead of `gcs_uri` (docs/api/06: "Store the gcs_uri, not the URL"); relying on ETag as an integrity check (S13b: make "no assumptions about the value used in an ETag"); Range-based copies without a full-object checksum (S13); leaving GCS soft delete enabled on any high-churn staging bucket (S19).

# Recommendation for this slice with falsifiers

See §Item 6 (recommendation, paid-vendor flag "none", four falsifiers). Stop reason: **execution limit exceeded (≈122 min against 45)**, not saturation.

# Sources (complete citations, stable locators, access dates)

Complete entries with quotes and hashes are in `docs/research/2026-09-03-reuse-slice-a-source-register.md`. Short list: S01 `deploy/payload/prisma/schema.prisma`; S02 `deploy/payload/lib/music/jobs.ts`; S02b `docs/api/04-request-body-full.md`; S02c `docs/api/05-lyrics-and-singing.md`; S02d `docs/api/06-response-envelope.md`; S02e `docs/api/12-originality-gate.md`; S03 https://cloud.google.com/storage/pricing; S04 https://aws.amazon.com/s3/pricing/; S05 AWS Price List API AmazonS3 eu-central-1 (2026-08-31T09:22:25Z); S05b AWS Price List API AWSDataTransfer eu-central-1 (2026-08-31T12:14:48Z); S06 AWS Price List API AmazonCloudFront (2026-08-31T09:21:46Z); S07 AWS Price List API AmazonEC2 eu-central-1-ist-1 (2026-08-31T18:13:31Z); S08 https://cloud.google.com/storage/docs/access-control/signed-urls (2026-08-26); S09 https://aws.amazon.com/cloudfront/pricing/; S10 https://aws.amazon.com/about-aws/global-infrastructure/localzones/pricing/; S10b https://aws.amazon.com/about-aws/whats-new/2026/05/aws-local-zones-istanbul-turkiye/ (2026-05-20); S11 https://cloud.google.com/storage/docs/storage-classes (2026-08-26); S12 https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html; S13 https://cloud.google.com/storage/docs/data-validation (2026-08-26); S13b https://docs.cloud.google.com/storage/docs/metadata; S14 https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html; S15 https://musicbrainz.readthedocs.io/en/latest/musicbrainz_database/schema/_schema.html (schema v31); S16 https://gitlab.hikoon.com/wanghai-tech/hikoon-ACR/blob/main/docs/postgresql-data-model.md; S17 https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs; S18 https://cloud.google.com/storage/docs/lifecycle (2026-08-26); S19 https://cloud.google.com/storage/docs/soft-delete; S20 https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html; S21 https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html; S22 https://cloud.google.com/network-tiers/pricing (search-card only, `[ABS]`, not load-bearing). All accessed 2026-09-03 between 08:55 and 10:57 +03:00.
