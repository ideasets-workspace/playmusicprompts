# Standards ledger

| Standard | How this report satisfies it |
| --- | --- |
| Covenant | `C:\Users\berke\.claude\skills\deep-research\SKILL.md`, COVENANT_SHA256 `F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB` (re-hashed from disk this session, 117,893 bytes; hash matches the brief). Part I §1–§7, R1, R4–R11, R13, R15, R17.1–R17.4 read this session. |
| Law Zero | Every number in this report is either quoted from `COMMON-BRIEF.md` / `SLICE-C.md` (project-measured) or from a primary opened this session and listed in the source register with its read status. Nothing is stated from recollection. Search-result highlights that were not opened are labelled `[PARTIAL-snippet]` and carry no load-bearing claim. |
| No-narrowing | SLICE-C.md §SCOPE enumerates 8 items; §"Findings by subquestion" below has 8 numbered subsections (machine count 8 = 8). SLICE floor: ≥8 independent authoritative sources (achieved: 20 provenance families, see counts), ≥2 academic primaries `[FULL]` with five-part record (achieved: 2 — S02, S03). |
| Owner constraints | No new paid vendor or paid API is recommended. AWS S3/CloudFront are already-wired services (CONTEXT-03). No synthetic data: every hit-rate / acceptance-rate / skip-rate value in the model is a *symbol* (h, a, s₀) to be measured by the project, never a number I chose. |
| Licence-lawfulness | The prior project decision (CLAP `laion/larger_clap_music` Apache-2.0 lawful; MERT CC-BY-NC-4.0 forbidden) is cited, not re-derived (CONTEXT-03). Deezer carousel data/code (S02) are released by Deezer for research; not proposed for production use. |
| Honest status | No `⚠️ UNVERIFIED RELAY` banner is required: slice floors met. Exact shortfalls are named in §"Contradictions, corrections, uncertainty, gaps". **Execution limit:** the brief's 45-minute wall-time limit was exceeded (started 08:55 local; final read-back of both files measured at 11:09:59 local, i.e. ≈2 h 15 min wall time); the stop reason is *time limit exceeded*, not saturation — see §Gaps. |

# Decision served and slice scope

Decision served (CONTEXT-01, part c): whether PlayMusicPrompts should serve an existing SIMILAR catalogue track as the next track in playlist mode instead of paying for a new generation — and with which policy, at which insertion points of Berk's 3-take buffer algorithm, under which quality gates, with which ranking and diversity rules, and how to prove it with an A/B test.

Berk's order, verbatim (Turkish, unaltered, from COMMON-BRIEF.md):

> "şarkı üretimi oldukça şarkıları playmusicpromts da bir tabloda tutalım şarkının promptu ve tüm detayları ile . ayrıca dosyayı da sunucuya alalım üretim sonrası. Daha sonrasında da bunları şu şekilde kullanacağız, bir kullanıcı bir şarı üretip playlist mantığına döndüğünde eğer elimizde benzer bir şarkı varsa üretmek yerine kullanıcıya o şarkıyı ekleyeceğiz next track olarak. bu şekilde hem üretim süresi hem de maliyetinden tasarruf ederiz ne dersin, bunu bir düşünüp analiz eder misin en ileri seviyede. ve elimzideki şarkılardan benzerlerinin bulunması ve buna bağlı algoritma da lazım. Bunu düşün analiz et araştır ve bana öneride bulun."

Slice C scope items (SLICE-C.md, 8 items): 1 economics with measured numbers; 2 insertion points in the algorithm + pseudocode; 3 listener-experience evidence (a repeat consumption / AI label, b transparency, c per-user constraints); 4 ranking policy (bandits, signals, cold start); 5 quality gates; 6 metrics and A/B design with sample size; 7 risks (monoculture, feedback loops, staleness) and diversity mitigations; 8 recommendation with falsifiers.

Dependency on slice A (storage/serving cost): **unavailable at write time** — measured this session: `Get-ChildItem docs\research -Filter '2026-09-03-reuse-*'` returned no files at 09:29:20 local. Per SLICE-C.md item 1, official AWS pricing read this session is used instead (S15, S16), with third-party per-GB figures marked as such (S17). **Dated delta (11:12:10 local, final read-back):** the same listing now shows `2026-09-03-reuse-slice-a-catalogue-schema-and-server-storage.md` present, written by a peer worker after my check; I did **not** open it (slice isolation, CONTEXT-16). The parent must reconcile §1's `c_reuse` against slice A's measured storage/serving cost; §1's conclusion is robust to any `c_reuse` below `0.08 · s₀` (see sensitivity).

# Outcome first

1. **Money: reuse is cheaper than generation at any plausible hit-rate and acceptance rate.** One generated take costs $0.08 (COMMON-BRIEF). Serving one catalogue WAV (5.7–16.8 MB measured) through CloudFront costs on the order of $0.0005–$0.0014 per serve at the third-party-reported $0.085/GB EU rate (S17, `[single-source family]`), i.e. ≤ 1.8 % of a take; the official pages read this session confirm S3→CloudFront transfer is free (S15) and that CloudFront's Free flat-rate plan includes 100 GB/month data transfer and 5 GB S3 storage at $0/month (S16). With the model in §1 below, the saving per playlist slot is `Δ = h·[c_gen·(s₀ + a) − c_reuse]`, which is positive whenever `a > c_reuse/c_gen − s₀ ≈ 0.018 − s₀` — so for any baseline early-skip rate s₀ ≥ 1.8 % the break-even acceptance rate is ≤ 0. **Cost is therefore not the binding constraint; listener acceptance is.**
2. **Time: the latency win is real only where the buffer is empty.** Berk's design keeps ≥2 takes prepared ahead, so a 25–145 s (median ~60 s, worst 92.5 s) instrumental generation or a 230–280 s sung generation is normally hidden. Reuse buys time at exactly three moments: the first audible track after "Make it a playlist", a skip cascade that empties the buffer, and the T−90 s recalibration when the next take is not yet ready. Everywhere else reuse saves money but not perceived time.
3. **Listener evidence: repetition is normal in music and recency is the strongest driver of re-consumption; the danger is not "catalogue" per se but sameness and staleness.** Anderson et al. (S01, `[PARTIAL]`) find recency the strongest predictor of repeat consumption and that all fitted regimes correspond to "familiarity breeds contempt"; radio stations *enforce anti-recency*. Deezer's PISA/REACTA (S04, S05) treat sessions as a balance of familiar and new tracks and model repeat listening as a first-class signal. Spotify's session data (S03, `[FULL]`) shows non-skip rates flat at 34–35 % across positions — skip behaviour is a per-track, per-session signal, not a position artefact. The best available disclosure experiment (S07, N=1,248, `[PARTIAL]`) finds AI-origin disclosure lowers stated relistening probability from 48.57 to 46.69 (t=3.24, p=0.0013) and WTP from 0.59 € to 0.41 € (p=0.0013) — a real but small effect, and no evidence at all on "generated for you" vs "from our catalogue" wording (gap, §Gaps).
4. **Ranking: Thompson sampling with a pessimistic prior, semi-personalised, updated in batch, beat every alternative in Deezer's industrial test (S02, `[FULL]`, independently reproduced by S21).** For a catalogue that starts near zero, the recommended ranker is a Beta-Bernoulli Thompson sampler per catalogue track, seeded by similarity, with Berk's ≥90 % full-listen as reward 1 and <10 s early-skip as reward 0, MMR re-ranking (S11) for within-session diversity and the Vendi score (S10) over the served set as the monoculture diagnostic.
5. **Committed recommendation for this slice:** enable reuse first at the *buffer-short* and *skip* insertion points, never as the first of the three "Make it a playlist" takes; hard gates (§5); ≤ 1 catalogue track per 3 served and never a track the same visitor has already heard; A/B against generate-only with primary metric early-skip (<10 s) rate per served track, powered with the Evan Miller two-proportion formula (S14) on the project's *own measured* baseline s₀, which does not yet exist and must be instrumented first.

# Methodology and query log (exact queries, dates)

All actions 2026-09-03, 08:55–09:50 local (UTC+3). Search engine: the workbench web-search tool; fetch: the workbench fetcher (text extraction). Round yield is recorded per R4.2 step 9.

| # | Time | Action | Exact query / URL | Yield / fate |
| --- | --- | --- | --- | --- |
| Q01 | 09:02 | search | `Anderson Kumar Tomkins Vassilvitskii "The dynamics of repeat consumption" WWW 2014 pdf` | 5 results; primary PDF at cs.stanford.edu opened (S01). Extraction truncated after §4 (proofs) — §5–6 experiments not in fetched text → `[PARTIAL]`. |
| Q02 | 09:02 | search | `Deezer "Carousel Personalization in Music Streaming Apps with Contextual Bandits" RecSys 2020 arXiv` | ar5iv HTML opened in full (S02); Deezer Research page; Zenodo TU Wien reproduction found (S21, contradiction lane). |
| Q03 | 09:02 | search | `music streaming repeat listening relistening study 2024 2025 exposure novelty familiarity Deezer Spotify research paper` | PISA RecSys 2024 (S04), REACTA RecSys 2025 (S05), YouTube Music RecSys 2026 (S06). Newest-first lane satisfied. |
| Q04 | 09:02 | search | `listener perception "AI-generated music" label disclosure study 2024 2025 experiment trust liking` | CESifo WP 12405 (S07), Deezer–Ipsos survey (S08), Sci. Rep. 2023 AI-art bias (S19), ProMarket summary (same family as S07). |
| Q05 | 09:02 | search | `Spotify skip behavior study "skip" music streaming sessions dataset WSDM Cup 2019 Brost Mehrotra Jehan paper` | MSSD paper (S03) opened in full; AIcrowd challenge page; Multi-RNN (S20). |
| Q06 | 09:02 | search | `Chaney Stewart Engelhardt "How Algorithmic Confounding in Recommendation Systems Increases Homogeneity" RecSys 2018 arXiv` | arXiv 1710.11214 text opened (S09) — §1–5.1 read, §5.2–5.4 result tables not extracted → `[PARTIAL]`. |
| Q07 | 09:31 | search | `"The Vendi Score" diversity evaluation metric machine learning Friedman Dieng TMLR 2023 arXiv 2210.02410` | arXiv HTML opened, §1–3 read (S10); "Cousins of the Vendi Score" found (S10b, not load-bearing). |
| Q08 | 09:31 | search | `McInerney Spotify "Explore, Exploit, and Explain" personalizing explainable recommendations with bandits RecSys 2018 pdf` | ACM DOI page (abstract), Spotify Research page, poster PDF text, patent US20200012681A1 (S13). Full paper behind ACM paywall → `FAILED ACCESS` recorded in register; `[ABS]`. |
| Q09 | 09:31 | search | `Montecchio Roy Pachet "skipping behavior" music streaming users musical structure PLOS ONE 2020` | PLOS ONE open-access text located (S12); abstract read only → `[ABS]` (time). |
| Q10 | 09:31 | search | `AWS S3 pricing eu-central-1 standard storage per GB data transfer to CloudFront free; CloudFront pricing per GB Europe 2026` | Only third-party pages returned (S17 family). Official pages fetched directly afterwards (Q12, Q13). |
| Q11 | 09:31 | search | `Evan Miller sample size calculator A/B test evanmiller.org ab-testing sample-size formula` | Calculator page (S14) opened; formula reproduction on Stats.SE (S14b) read. |
| Q12 | 09:37 | fetch | `https://aws.amazon.com/cloudfront/pricing/` | Official page opened in full (S16). Page now shows flat-rate plans; per-GB PAYG table not present in the fetched text. |
| Q13 | 09:37 | fetch | `https://aws.amazon.com/s3/pricing/` | Official page opened (S15); free-transfer list and the Europe (Ireland) $0.09/GB internet-egress example present; per-region Standard storage $/GB table not present in fetched text (dynamic). |
| Q14 | 09:44 | search | `Carbonell Goldstein 1998 "maximal marginal relevance" SIGIR pdf; Chmiel Schubert 2017 "Back to the inverted-U" familiarity music preference review` | MMR ACM DOI page (S11, `[ABS]`), Elastic and OpenSearch docs for the MMR formula (S11b, S11c). Chmiel & Schubert 2017 identified but **not opened** (time) — listed in gaps, not counted. |
| L01 | 09:29 | local | `Test-Path` on both output paths; `Get-ChildItem docs\research -Filter 2026-09-03-reuse-*` | Both output paths absent (False, False); no sibling slice files present → slice A dependency unavailable. |

Discovery-round marginal yield: round 1 (Q01–Q06) produced 12 candidate primaries, 6 opened; round 2 (Q07–Q11) produced 8 candidates, 5 opened; round 3 (Q12–Q14) produced 4, 3 opened. Saturation **not** declared: the inverted-U/mere-exposure lane (Berlyne; Schäfer & Sedlmeier; Chmiel & Schubert) and the RecSys Challenge 2018 playlist-continuation lane were identified but not swept — see §Gaps.

# Universe and coverage ledger

`universe_id | entity/work | why in scope | discovery path | screened | included | latest checked | evidence IDs | gaps`

| U | Entity | Why in scope | Path | Screened | Included | Checked | IDs | Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U-ACAD-1 | Stanford / Google (Anderson, Kumar, Tomkins, Vassilvitskii) | repeat consumption dynamics | Q01 | yes | yes | 2026-09-03 | S01 | §5–6 tables not extracted |
| U-ACAD-2 | Deezer Research (Bendada, Salha, Bontempelli; Tran, Sguerra, Hennequin, Briand, Moussallam, Meseguer-Brocal) | bandits in music; repeat-aware sequential rec | Q02, Q03 | yes | yes | 2026-09-03 | S02, S04, S05 | S04/S05 result tables not read |
| U-ACAD-3 | Spotify Research (Brost, Mehrotra, Jehan; McInerney et al.) | skip behaviour; bandits | Q05, Q08 | yes | yes | 2026-09-03 | S03, S13, S20 | S13 full text paywalled |
| U-ACAD-4 | Princeton (Chaney, Stewart, Engelhardt; Friedman, Dieng) | feedback loops; Vendi diversity | Q06, Q07 | yes | yes | 2026-09-03 | S09, S10 | S09 §5.2–5.4 numbers not extracted |
| U-ACAD-5 | CMU (Carbonell, Goldstein) | MMR diversification | Q14 | yes | yes | 2026-09-03 | S11 | abstract only; formula corroborated via S11b/S11c |
| U-ACAD-6 | Sony CSL Paris (Montecchio, Roy, Pachet) | skip-point vs musical structure | Q09 | yes | yes | 2026-09-03 | S12 | abstract only |
| U-ACAD-7 | CESifo / Univ. of Hamburg & co-authors (Friedrichsen, Schwarz, Clement) | AI-label disclosure effects | Q04 | yes | yes | 2026-09-03 | S07 | Study 1 detail not read |
| U-ACAD-8 | Berlyne; Schäfer & Sedlmeier; Chmiel & Schubert 2017 | inverted-U familiarity/complexity | Q14 | identified | **no** | — | — | not opened (time) |
| U-ACAD-9 | RecSys Challenge 2018 (Spotify MPD) playlist continuation | continuation baselines | seed only | **no** | no | — | — | lane not swept (time) |
| U-IND-1 | Google / YouTube Music (Ranganathan et al., RecSys 2026) | feedback-loop interventions, live A/B | Q03 | yes | yes | 2026-09-03 | S06 | Table 1 row labels lost in extraction |
| U-IND-2 | Deezer–Ipsos survey, Nov 2025 | listener attitudes to AI labels | Q04 | yes | partial | 2026-09-03 | S08 | page not opened; highlights only |
| U-IND-3 | AWS (S3, CloudFront official pricing) | serving cost per reuse | Q12, Q13 | yes | yes | 2026-09-03 | S15, S16 | per-GB PAYG and per-region storage tables not in fetched text |
| U-IND-4 | Third-party pricing trackers (egresscost.com, blazingcdn, cloudburn) | per-GB figures | Q10 | yes | yes, flagged | 2026-09-03 | S17 | one provenance family, not official |
| U-CODE-1 | github.com/deezer/carousel_bandits; deezer/recsys25-reacta | reference implementations, data | S02, S05 text | identified | cited, not inspected | — | S02, S05 | licence/commit not inspected |
| U-STD-1 | Evan Miller A/B tools | sample-size standard | Q11 | yes | yes | 2026-09-03 | S14, S14b | — |
| U-HID-1 | Zenodo (TU Wien) reproduction of S02 | independent replication / contradiction | Q02 | yes | yes | 2026-09-03 | S21 | abstract only |
| U-HID-2 | Spotify patent US20200012681A1 | mechanism of Bart bandit | Q08 | yes | yes | 2026-09-03 | S13b | not read in depth |

# Source register summary and read-status counts

Full register: `docs/research/2026-09-03-reuse-slice-c-source-register.md`.

| Count | Value | Basis |
| --- | --- | --- |
| Independent authoritative provenance families | **20** | S01–S21 deduplicated: S07+ProMarket one family; S11+S11b+S11c one family for the formula (docs are separate producers but corroborate the same object; counted once conservatively); S13+S13b one family; S14+S14b one family; S17 family one |
| Academic sources | **15** | S01, S02, S03, S04, S05, S06, S07, S09, S10, S10b, S11, S12, S13, S19, S20, S21 (S10b and S21 counted; S06 is a peer-reviewed RecSys '26 paper by Google) |
| Academic `[FULL]` with five-part record | **2** | S02 (Deezer carousel bandits), S03 (Spotify MSSD) |
| Primary `[FULL]` | **4** | S02, S03, S14 (calculator page), S16 (CloudFront pricing page as served) |
| `[PARTIAL]` | 8 | S01, S04, S06, S07, S09, S10, S15, S05 |
| `[ABS]` / `[PARTIAL-snippet]` | 8 | S08, S11, S12, S13, S19, S20, S21, S17 |
| FAILED ACCESS | 1 | S13 full paper (ACM DL, paywall) — open poster + patent used instead |

# Findings by subquestion

## 1. Economics with the project's measured numbers

**Inputs quoted from COMMON-BRIEF.md (project-measured, not mine):** `c_gen = $0.08` per take; generation latency 25–145 s instrumental (measured median ~60 s, worst 92.5 s), 230–280 s sung; WAV size 5.7 MB (20 s sung) to 16.8 MB (58 s); spend guard 12 takes/hour, 40/day per anonymous visitor; playlist = 3 takes, keep ≥2 prepared ahead, skip → next prepared take + one more generation.

**Serving cost per reuse, `c_reuse`.** Official (S15, read this session): "Data transferred out to Amazon CloudFront" is in the S3 list of transfers you do *not* pay for; the first 100 GB/month of internet egress is free aggregated across AWS. Official (S16, read this session): CloudFront flat-rate **Free** plan = $0/month per distribution with a monthly allowance of 1M requests, 100 GB data transfer and 5 GB included S3 storage; **Pro** = $15/month with 10M requests and 50 TB. Third-party (S17, `[single-source family]`, one upstream, dated "verified from aws.amazon.com/cloudfront/pricing on 2026-04" by egresscost.com): PAYG $0.085/GB first 10 TB (North America/Europe); eu-central-1 S3 Standard $0.0245/GB-month (cloudburn.io). The official pages fetched this session did **not** expose those two per-GB tables (they render dynamically), so the per-GB figures remain third-party.

CALCULATION (from the above): egress per serve at $0.085/GB — 5.7 MB → 0.0057 GB × 0.085 = **$0.000485**; 16.8 MB → 0.0168 GB × 0.085 = **$0.001428**. Storage per stored track-month at $0.0245/GB — 16.8 MB → **$0.00041**. Ratio `c_reuse / c_gen` (worst case, egress only) = 0.001428 / 0.08 = **0.0179 ≈ 1.8 %**. Under the Free flat-rate plan, the first 100 GB/month of serves (≈ 5,950 worst-case 16.8 MB serves) cost $0.

**Model (my derivation; symbols are to be measured, never chosen).** Let, per playlist slot after the initial burst:
- `h` = catalogue hit-rate: probability that ≥1 candidate passes all gates (§5) and the similarity threshold;
- `a` = reuse acceptance rate: probability the listener does *not* early-skip (<10 s) a served catalogue track;
- `s₀` = baseline early-skip rate of *freshly generated* tracks (project must measure; not yet instrumented);
- Berk's rule "skip → one more generation" applies identically to both arms.

Generate-only expected cost per slot: `C_gen = c_gen · (1 + s₀)` (the take itself plus the extra generation a skip triggers).

Reuse-enabled expected cost per slot:
`C_reuse = (1 − h) · c_gen · (1 + s₀) + h · [ c_reuse + (1 − a) · c_gen ]`

Saving per slot:
`Δ = C_gen − C_reuse = h · [ c_gen · (s₀ + a) − c_reuse ]`

Break-even acceptance: `a* = c_reuse / c_gen − s₀ = 0.0179 − s₀` (worst-case egress). CALCULATION: for any measured `s₀ ≥ 0.018`, `a* ≤ 0`, i.e. reuse saves money even if every catalogue track were skipped, because the skip-triggered generation is paid in both arms while the $0.08 of the slot itself is avoided. For `s₀ = 0`, `a* = 1.8 %`.

Session-level: with `B = 3` initial takes and `K` subsequent slots, `Saving_session = K_eligible · Δ`, where `K_eligible` is the number of slots at which the policy in §2 allows reuse. Under the recommended policy (no reuse in the initial burst; at most 1 catalogue track per 3 served): `K_eligible ≤ K/3`, so `Saving_session ≤ (K/3) · h · [0.08·(s₀ + a) − 0.0014]`. Illustration of the *formula* only (not a forecast): with `K = 9`, `h = 1`, `s₀ = 0`, `a = 1`: `Saving ≤ 3 · (0.08 − 0.0014) = $0.236` per session against a generate-only cost of `(3 + 9) · 0.08 = $0.96`, i.e. ≤ 24.6 % of session spend under the 1-in-3 cap. Removing the cap (`K_eligible = K`) raises the ceiling to `9 · 0.0786 = $0.707` (73.7 %) — which is exactly the monoculture regime §7 warns against.

**Sensitivity.** `∂Δ/∂h = c_gen(s₀ + a) − c_reuse` (linear in h; always positive when `a > a*`); `∂Δ/∂a = h·c_gen = 0.08h` per unit of acceptance; `∂Δ/∂c_reuse = −h` (negligible: c_reuse spans $0.0005–$0.0014). The saving is therefore governed by `h` and `a`, and `a` is a *listener-experience* quantity. The dominant uncertainty is not cost but the term `(a − (1 − s₀))`: if reuse is skipped more often than fresh generation, the money saving still holds by the formula but the product loses listeners — which is why §6 makes early-skip the primary metric and demands non-inferiority, not merely positive Δ.

**Time.** With ≥2 takes prepared ahead, latency is hidden at steady state. Reuse converts a 25–145 s (median ~60 s) or 230–280 s wait into a CDN fetch only at: (i) session start — the first of the three burst takes is the first audible sound; (ii) skip cascade — two quick skips consume the 2-ahead buffer; (iii) T−90 s recalibration when the next take's job has not returned (worst measured 92.5 s > 90 s, so this case is measured to exist for instrumental and is the norm for sung at 230–280 s). Time saved per event = generation wall time of the replaced take (median ~60 s instrumental; 230–280 s sung); events per session are a project measurement not yet taken.

## 2. Where the reuse branch sits in Berk's algorithm

Berk's algorithm (COMMON-BRIEF, 2026-08-29): "Make it a playlist" = 3 takes in different tones; user hears one; keep ≥2 prepared ahead; generation fires at track START when the buffer is short; T−90 s recalibration; skip → next prepared take instantly + one more generation; early skip (<10 s) = strong reject; full listen (≥90 %) = exploit; next brief steered by these signals.

| Insertion point | Latency effect of reuse | Cost effect | Listener-perception evidence | Verdict |
| --- | --- | --- | --- | --- |
| **P1 — "Make it a playlist" burst (3 takes)** | Largest: a catalogue take as slot 1 gives instant first sound instead of median ~60 s / 230–280 s | Saves `c_gen` per replaced take (max 2 of 3 → $0.16) | The prompt was just typed: expectation that the track is *theirs* is highest. Disclosure evidence (S07) shows AI-origin information lowers relistening 48.57→46.69 and WTP 0.59→0.41 €; there is **no** experiment on "from catalogue" vs "generated for you" wording (gap). Deezer's ts-seg-pessimistic learned faster with a *pessimistic* prior (S02) — the analogue is: assume a catalogue track is less accepted until data says otherwise. | **Phase 2 only**, at most 1 of 3, only after the A/B in §6 shows non-inferiority at P2/P3; if adopted, use it as slot 1 for instant start *while* the 3 fresh takes generate, and label it honestly (§3b). |
| **P2 — track START, buffer short (<2 ahead)** | Reuse fills the gap instantly; fresh generation still fires in parallel to refill | Saves `c_gen` when the catalogue track is later played; if the fresh take returns first, the catalogue track can stay queued (no cost either way) | Listener is already in lean-back mode; Brost et al. (S03) found the strongest predictor of *not* skipping is that the previous track was listened to completion (lean-back), so a full-listen preceding P2 is the best-case moment for a catalogue insert | **Phase 1 — enable** |
| **P3 — T−90 s recalibration** | Only matters when the pending job is late (measured worst 92.5 s instrumental; always for sung 230–280 s) | Same as P2 | Same as P2; recalibration is invisible to the listener | **Phase 1 — enable as fallback** when `job.eta > time_remaining` |
| **P4 — on skip** | Next prepared take plays instantly (already Berk's rule); reuse matters for the *refill* generation the skip triggers | Saves the skip-triggered `c_gen` if a catalogue candidate is used as the refill | Early skip is Berk's strong-reject signal; Brost (S03) shows skips within a session are correlated, so a second reject is likely — a *different-tone* catalogue candidate (exploration, §4) is the cheapest way to break a skip cascade | **Phase 1 — enable**, choose the refill by *exploration* (diverse-but-relevant), not the closest match |

**Recommended exact policy — pseudocode (my derivation; every threshold is a named parameter to be calibrated negatives-first per the 2026-08-17 project research, never set by an agent):**

```text
STATE per session:  buffer[], served_history(visitor), catalogue_share = served_catalogue / served_total
PARAMS (calibrated, owner-approved): TAU_SIM (similarity floor, CLAP cosine, negatives-first calibration),
        MAX_CATALOGUE_SHARE = 1/3 (owner decision), PRIOR = Beta(1, 99)  [S02: ts-seg-pessimistic],
        MMR_LAMBDA (owner decision), PER_TRACK_DAILY_SERVE_CAP (owner decision)

on MAKE_PLAYLIST(prompt):
    fire 3 fresh generations (Berk's design, unchanged)          # P1: Phase 2 may replace slot 1
    candidates := ReuseCandidates(prompt, visitor)               # computed now, used at P2/P3/P4
    play first returned take

on TRACK_START(now_playing):
    if len(buffer) < 2:
        fire 1 fresh generation                                  # Berk's rule, unchanged
        if candidates nonempty and catalogue_share < MAX_CATALOGUE_SHARE:
            buffer.append(PickByThompson(candidates))            # P2: instant fill, cost 0 until played

on T_MINUS_90(now_playing):
    if buffer empty and pending_job.eta > 90 s:
        if candidates nonempty and catalogue_share < MAX_CATALOGUE_SHARE:
            buffer.append(PickByThompson(candidates))            # P3

on SKIP(track, position_s):
    play buffer.pop_front() immediately                          # Berk's rule
    fire 1 fresh generation                                      # Berk's rule
    if position_s < 10: Reward(track, 0); steer next brief away  # strong reject
    if candidates nonempty and catalogue_share < MAX_CATALOGUE_SHARE:
        buffer.append(PickByThompson(candidates, explore=True))  # P4: diverse-but-relevant refill

on FULL_LISTEN(track, fraction >= 0.90):
    Reward(track, 1)                                             # exploit signal

ReuseCandidates(prompt, visitor):
    C := catalogue WHERE status = SUCCEEDED AND mastered AND originality_gate = PASS
                        AND moderation_flag = NONE
                        AND vocal_mode = prompt.vocal_mode AND language = prompt.language   # exact, §5
                        AND (vocal_mode = instrumental OR lyrics_verification = PASS)
                        AND track_id NOT IN served_history(visitor)                          # §3c
                        AND daily_serves(track_id) < PER_TRACK_DAILY_SERVE_CAP               # §7
    C := { c in C : sim(embed(prompt), embed(c)) >= TAU_SIM }
    return MMR_rerank(C, lambda = MMR_LAMBDA)                    # S11: relevance − redundancy

PickByThompson(C, explore=False):
    for c in C: theta_c ~ Beta(alpha_c, beta_c)                  # S02 ts-seg-pessimistic, prior Beta(1,99)
    score_c := theta_c * sim_c            (explore=False)
    score_c := theta_c * (1 − sim_to_last_skipped(c))  (explore=True)
    return argmax_c score_c

Reward(track, r):  alpha_track += r; beta_track += (1 − r)       # batch update acceptable (S02 §4.1.2)
```

Rationale per line is traceable: the 3-take burst, ≥2-ahead buffer, T−90 s, skip and signal semantics are Berk's own (COMMON-BRIEF); Beta-Bernoulli Thompson sampling with a pessimistic prior and batch (delayed) updates is the policy that won Deezer's offline and online tests (S02 §3.3, §4.1, §4.2); MMR is Carbonell & Goldstein's relevance-minus-redundancy re-ranking (S11, formula corroborated by S11b/S11c); the per-visitor exclusion follows Anderson et al.'s recency finding and radio anti-recency practice (S01 §3.5); the catalogue-share cap and per-track daily cap answer the homogenisation mechanism in Chaney et al. (S09 §2) and the feedback-loop findings at YouTube Music (S06 abstract).

## 3. Listener experience evidence

### 3a. Repeat consumption, familiarity vs novelty, skip behaviour, AI labels

- **Repeat consumption is the norm, and recency dominates.** Anderson et al. (S01, `[PARTIAL]`, §1, §3.3–3.5): recency of consumption is "the strongest predictor of repeat consumption"; probability of re-consuming decays as a power law with exponential cutoff in the number of intervening consumptions; a pure quality model "underperforms" the recency model; popularity effect monotone (Fig. 4); *no* satiation observed in check-in/map domains (Fig. 5); and — decisive for us — in the YES radio-playlist dataset "radio stations actually enforce anti-recency behavior, since they do not want to repeat the same songs too soon, lest their listeners tire of them" (§3.5). All fitted `w(i)` lie in the regime the authors label "familiarity breeds contempt" (§1). PRIMARY FACT for §1–4; §5–6 experimental tables not in fetched text.
- **Music recommenders now model repeats explicitly.** PISA (S04, `[PARTIAL]`, RecSys 2024, Deezer): "repeatedly listening to the same song over time is a common phenomenon that can even change the way users perceive this song"; sessions are modelled with ACT-R base-level activation rising with frequency and recency of past plays; evaluated on Last.fm and a released Deezer dataset. REACTA (S05, `[PARTIAL]`, RecSys 2025): "listening sessions are often composed of a balance of familiar and new tracks"; dataset of ~900 M events from >4 M Deezer users, 50,000 tracks, listening event = ≥30 s stream; audio embeddings used to score *new* tracks a memory model cannot. INFERENCE for PMP: a catalogue track that is *new to this visitor* is, from the visitor's side, exactly the "new track" case REACTA scores from audio — so audio/prompt similarity is the right prior, and the visitor's own history is the right exclusion.
- **Skips are frequent, session-correlated and structurally timed.** Brost et al. (S03, `[FULL]`): 160 M sessions, 10–20 tracks, ≤60 s inactivity gap; non-skip rate "relatively constant … between 34% and 35% for all session positions"; skip rates higher in longer sessions; the start reason most associated with *not* skipping is that the previous track was listened to completion; skip behaviour within a session is correlated with prior skips in that session. Multi-RNN (S20, `[ABS]`): 2nd of 45 teams with mean average accuracy 0.641 and first-skip accuracy 0.807 — i.e. the *first* skip after the observed half-session is predictable at ~81 %. Montecchio et al. (S12, `[ABS]`, PLOS ONE 2020): skip timing correlates with musical section boundaries and the per-song skip profile is stable across cohorts and dates. INFERENCE: Berk's <10 s early-skip is a rejection of the *opening*, not of the piece; a catalogue track's own historical skip profile (which the catalogue accumulates across visitors) is a legitimate quality feature the ranker can learn.
- **AI-origin labels: listeners cannot tell, and disclosure costs a little.** Friedrichsen, Schwarz & Clement (S07, `[PARTIAL]`, CESifo WP 12405, January 2026; Study 1 N≈2,000/wave, Study 2 N=425 preregistered 2×2, Study 3 N=1,248): pretest — participants correct on 58.9 % of origin judgements, not significantly above chance (z=1.633, p=0.103); Study 2 (EDM, vocal vs instrumental) — AI disclosure did **not** significantly lower song or playlist ratings (song t=−1.057, p=0.291; playlist t=−1.784, p=0.075); Study 3 — within-subject, learning a song was AI-generated lowered stated relistening probability 48.57→46.69 (t=3.24, p=0.0013) and general liking 4.78→4.62 (p<0.001), and lowered incentivised WTP 0.59 € → 0.41 € (t=3.248, p=0.0013); uninformed participants rated AI songs *higher* than human ones; only 18 % of informed participants changed their relistening answer at all; effect "mainly driven by pop listeners". Deezer–Ipsos (S08, `[PARTIAL-snippet]`, Nov 2025, 9,000 respondents, 8 countries): 97 % failed to identify fully AI-generated tracks; 80 % want 100 % AI music clearly labelled; 73 % want to know if a service recommends it. Sci. Rep. 2023 (S19, `[PARTIAL-snippet]`, visual art): AI-made labels cut perceived monetary value by 62 % in the last experiment — adjacent domain, not music, carried as contrary-direction magnitude only.
- **Contradiction preserved (S07 internal):** Study 2 (between-subject, playlists) found *no* disclosure effect; Study 3 (within-subject, WTP) found one. The authors attribute it to design and genre. Not averaged.

### 3b. Transparency — what the UI should say

PRIMARY FACTS: PMP's product name to users is "Ideasets Hybrid Music Composer Model" and the vendor model name never appears in user-facing text (COMMON-BRIEF). Everything PMP serves is AI-generated, so the S07/S08 "AI vs human" disclosure axis does *not* apply between arms — both a fresh take and a catalogue take are AI. The open question is *provenance*: "generated for you" vs "from the PlayMusicPrompts catalogue". Evidence found this session: **none** that tests this exact wording (`[UNVERIFIED]` — gap). What the evidence does support: (i) S08 — 73 % of streaming users want to *know* when AI content is recommended, and S07 — only 18 % change behaviour once told, so honest disclosure has a large information value at a small behavioural cost; (ii) a false "generated for you" label on a catalogue track would be the deception class Berk's own rules forbid, independent of listener research. RECOMMENDATION: label catalogue serves truthfully and briefly ("From the PlayMusicPrompts catalogue · matched to your prompt" — wording is an OWNER-DECISION per rule 14), keep the honest label as a fixed factor in both A/B arms so the experiment measures the *policy*, not the copy, and log the label variant so a later copy test is possible.

### 3c. Per-user constraints

- **Never serve a track the same visitor already heard** (measured from our own `music_jobs` / new per-take catalogue keyed by `userId`/`anonId`): supported by Anderson et al.'s recency finding and by radio anti-recency practice (S01 §3.5); implemented as the `served_history(visitor)` exclusion in §2 pseudocode.
- **Cap catalogue share per session**: `MAX_CATALOGUE_SHARE` (proposed 1/3, an OWNER-DECISION) so that ≥2 of every 3 served tracks are fresh generations — bounds the monoculture exposure of §7 and keeps Berk's "3 takes" promise dominant.
- **Freshness**: two clocks — (i) per-visitor recency exclusion above; (ii) per-track daily serve cap across all visitors (`PER_TRACK_DAILY_SERVE_CAP`, OWNER-DECISION) so that a popular catalogue track cannot become the platform's monoculture; evidence for the mechanism in S09 (homogenisation amplifies with cycles through the loop) and S06 (feedback loops suppress novelty and freshness in a continuously trained ranker).

## 4. Ranking policy: exploitation vs exploration, signals, cold start

- **What won at Deezer (S02, `[FULL]`).** Problem: choose L=12 of K=862 curated playlists per user daily, display-to-stream reward, cascade browsing (L_init=3 seen), batch feedback. Offline (974,960 users, D=97 features, Q=100 k-means clusters, 20,000 users/round, 100 rounds): `ts-seg-pessimistic` (Thompson sampling per cluster, prior Beta(1,99)) outperformed ε-greedy (ε=0.1/0.01), explore-then-commit (n=100/20), KL-UCB, naive TS (Beta(1,1)) and the fully-personalised linear TS variants, significant at the 1 % level; it "already outperform[ed] them all at the end of the first 25 rounds". Batch (delayed) feedback favoured stochastic over deterministic policies because a deterministic policy shows every user in a cluster the same set until the round ends. Online A/B (Feb 2020, Deezer app): the bandit framework, notably the semi-personalised strategy and the cascade update, beat the `random-top-100` baseline, significant at 1 %; absolute rates withheld. Independent replication (S21, TU Wien, `[ABS]`): "Both [setups] validated the main result … pessimistic Thompson-Sampling with segmentation outperforms all other policies", while the cascade-effect claim was "partly contradict[ed]" — contradiction preserved in §Contradictions.
- **What Spotify did (S13, `[ABS]` + poster + patent).** Bart: contextual bandit with a factorization-machine reward model over (user, item, explanation) features; ε-greedy randomisation skewed to higher-performing items; propensity logged for counterfactual training; "significant improvement in user engagement" in live traffic (abstract). Numbers not accessible (paywall) → not load-bearing.
- **What YouTube Music found in 2026 (S06, `[PARTIAL]`).** Across six live A/B interventions: "serving-time interventions on continuously trained systems are neutralized by the learning loop"; architectural debiasing improves diversity but "does not create discovery"; uncertainty-driven exploration (SNGP head) "produce[s] the largest new-release lift, though … with a measurable engagement or diversity tradeoff". Table 1 effect sizes are in the fetched text but their row/column labels were lost in extraction, so I do not attribute them.
- **Mapping Berk's signals to the ranker (my derivation, RECOMMENDATION).** Reward r=1 for full listen (≥90 %), r=0 for early skip (<10 s); the intermediate outcome (skip between 10 s and 90 %) is *observed* and should not be dropped — S02's cascade logic drops only *unseen* items. Whether the intermediate outcome is scored 0, a fractional value, or handled as a second Beta arm is an OWNER-DECISION; the Bernoulli mapping above is the one S02 validated. Posterior per catalogue track: `Beta(1 + Σr, 99 + Σ(1−r))`. Sampling gives natural exploration; the pessimistic prior means a catalogue track must *earn* its exploitation, which is the conservative stance appropriate when its acceptance `a` is unmeasured.
- **Cold start with a small catalogue (my derivation).** With a catalogue of tens of tracks, Deezer's per-cluster segmentation is unnecessary; use one global posterior per track and the prompt-embedding similarity `sim_c` as the *multiplicative context* (`score = θ_c · sim_c`), which reduces to pure similarity when all posteriors equal the prior and to learned acceptance as data arrives. S06 warns that heuristic boosts get neutralised by a *learning* ranker — here the ranker *is* the Beta posterior, so the similarity term is context, not a boost; revisit when a learned model replaces it. Exploration on skip (`explore=True`) picks the candidate least similar to the just-rejected track — the cheapest possible action to break the within-session skip correlation Brost et al. document (S03).

## 5. Quality gates on reuse candidates

Fields quoted from COMMON-BRIEF's description of `music_jobs.responseBody`: `tracks[].public_url/gcs_uri/take`, `render_plan.processed_url/processed_gcs_uri`, `lyrics_verification`, `originality_gate` (incl. `axis2_similarity` Qmax/HK-BER/Vendi between takes), `status`, `requestBody` (exact request).

| Gate | Rule | Why (source) |
| --- | --- | --- |
| G1 status | `status = SUCCEEDED` only | a failed/partial job has no deliverable audio (project schema) |
| G2 mastered | `render_plan.processed_url` present (−14 LUFS / −1 dBTP master) | loudness consistency between fresh and catalogue tracks; a loudness jump is an audible discontinuity (project spec; INFERENCE) |
| G3 originality | `originality_gate = PASS` | the project's own committed gate (2026-08-17 research); a track that failed originality must never be redistributed |
| G4 moderation | not flagged | policy (project) |
| G5 lyrics (sung only) | `lyrics_verification` verdict considered; PASS required to serve as a *sung* candidate | a sung track whose lyrics diverge from its own prompt is a wrong answer to *any* prompt (INFERENCE) |
| G6 vocal mode | `requestBody.vocal_mode` must equal the new prompt's vocal mode **exactly** | a listener asking for instrumental must never get sung: the request parameter is a hard contract, not a similarity dimension; S07 Study 2 treated vocal vs instrumental as separate experimental conditions precisely because vocals change evaluation |
| G7 language | `requestBody.language` must equal exactly | same contract logic as G6; a Turkish prompt answered by an English sung track is a mismatch no similarity score can repair |
| G8 similarity | `sim ≥ TAU_SIM` with CLAP `laion/larger_clap_music` (Apache-2.0, lawful per 2026-08-17 research); MERT forbidden (CC-BY-NC-4.0) | thresholds calibrated negatives-first (MusicLM τ=0.85 *procedure*, not its value), never guessed — project decision quoted, not re-derived |
| G9 per-visitor | not in `served_history(visitor)` | §3c |
| G10 per-track | below daily serve cap | §7 |

## 6. Metrics and experiment design

- **Design.** Two arms, randomised at the *visitor* level (`anonId`/`userId`), because a visitor's skips are correlated within session (S03) and track-level randomisation would leak the treatment across a listener's own session (INFERENCE from S03). Arm A: generate-only (current). Arm B: reuse-enabled at P2/P3/P4 with the gates in §5 and the cap in §3c. The honest provenance label is held constant.
- **Primary metric.** Early-skip rate: `E = #served tracks skipped at < 10 s / #served tracks`, computed per arm over *all* served tracks (fresh and catalogue), so that the treatment is judged on the whole listening experience; plus the per-source breakdown as a diagnostic. Hypothesis: non-inferiority of arm B (`E_B ≤ E_A + margin`), margin an OWNER-DECISION.
- **Secondary.** Session length (tracks and seconds), full-listen rate (≥90 %), cost per session (from the spend ledger), first-sound latency at P1, buffer-underrun events at P2/P3.
- **Sample size (S14, S14b, read this session).** Evan Miller's two-proportion formula: `n = ( Z_{1−α/2} · √(2p(1−p)) + Z_{1−β} · √(p(1−p) + (p+δ)(1−p−δ)) )² / δ²` per variation, with p the baseline early-skip rate and δ the absolute minimum detectable effect. Worked figures from the sources themselves (not project numbers): the calculator's displayed example — baseline 10.2 %, MDE +3.0 pp absolute, α=5 %, power 80 % → **2,545 per variation**; the Stats.SE reproduction — p=20 %, δ=5 pp, α=5 %, β=20 % → **1,030 per variation**, matching the calculator. **PMP's own baseline `p = s₀` is not yet measured** — instrument early-skip logging first and run ≥2 weeks of generate-only to estimate it; then compute n. Because randomisation is by visitor and the metric is per track, the effective sample is the number of *visitors*, and the per-track n must be inflated by the design effect `1 + (m−1)·ρ` (m tracks per visitor, ρ intra-visitor correlation) — this design-effect statement is INFERENCE from standard cluster-randomisation practice and was not read from a source this session; mark `[UNVERIFIED]` until the parent verifies a primary.
- **Stopping.** Fixed horizon at the computed n; no peeking (Evan Miller's own "How Not To Run an A/B Test" is referenced from the calculator page — not opened this session).

## 7. Risks and diversity mitigations

- **Catalogue monoculture / popularity feedback loops.** Chaney, Stewart & Engelhardt (S09, `[PARTIAL]`, RecSys 2018): training or evaluating on data already shaped by recommendations "homogenizes user behavior without increasing utility"; homogenisation "is amplified with more cycles through the loop", occurs at population and individual level, and utility losses "are distributed unequally". YouTube Music (S06): continuously trained rankers "fall into feedback loops where previously consumed items dominate recommendations", suppressing both new releases and unlistened catalogue. For PMP the loop is literal: a catalogue track that is served more gets more reward data, a higher posterior mean, more serves. Mitigations (each traceable): pessimistic prior + Thompson sampling keep exploration alive (S02); per-track daily serve cap and 1-in-3 catalogue share cap bound exposure (mechanism from S09/S06); on-skip *exploration* pick (S03 within-session skip correlation).
- **Staleness.** Per-visitor recency exclusion (S01) and freshness clocks (§3c). Berk's own 3-take burst guarantees new material every session.
- **Diversity constraints — MMR.** Carbonell & Goldstein (S11, `[ABS]`, SIGIR 1998): rank by "a combined criterion of query relevance and novelty of information", the latter "the degree of dissimilarity between the document being considered and previously selected ones"; the formula as implemented in production systems (S11b Elastic, S11c OpenSearch): `MMR(c) = λ · rel(c) − (1−λ) · max_{s∈Selected} sim(c, s)`, λ=1 pure relevance, λ=0 pure diversity. λ is an OWNER-DECISION (S11b suggests starting at 0.7 as a vendor default — a vendor heuristic, not evidence).
- **Diversity diagnostic — Vendi score.** Friedman & Dieng (S10, `[PARTIAL]`, TMLR 07/2023): `VS_k(x₁..xₙ) = exp( −Σ λ_i log λ_i )` where λ_i are the eigenvalues of `K/n`, K the n×n similarity matrix with `k(x,x)=1`; interpretable as the "effective number of unique elements"; reference-free; exact cost O(n³) by eigendecomposition or O(d²n) with d-dimensional embeddings; the "Cousins" paper (S10b) notes order-q variants for imbalanced prevalence. The project already computes Vendi *between takes of one request* (COMMON-BRIEF); extend it to the *served set per session* (fresh + catalogue) and to the *catalogue-serve distribution per day*; a falling Vendi over served sets is the monoculture alarm.

## 8. Recommendation for this slice — see §"Recommendation for this slice with falsifiers" below (kept there so the schema order is preserved; counted as item 8).

## Five-part academic records (each `[FULL]` primary)

### S02 — Bendada, Salha, Bontempelli (Deezer), "Carousel Personalization in Music Streaming Apps with Contextual Bandits", RecSys 2020, doi 10.1145/3383313.3412217, arXiv 2009.06546 — `[FULL]` (ar5iv HTML, all sections and references read; figures are images and their plotted regret values are not in the text)

1. **Problem in the authors' framing.** Selecting and ranking cards for swipeable carousels when "the catalog size is usually significantly larger than the number of available slots" and users differ; real carousels add three complications: contextual user information exists, "they might not know which cards from a carousel are actually seen by users", and "feedback data from carousels might not be available in real time" (§1).
2. **Method.** Multi-armed bandit with multiple plays: K arms, choose L<K per round, Bernoulli(p_i) rewards, regret `Reg(T)=Σ_t(Σ_{i∈δ*(L)} p_i − Σ_{i∈S_t} p_i)` (§2.1). Two context strategies: semi-personalisation via Q user clusters with `p_ui = p_ci` (eq. 1, parameters K×Q) and contextual linear bandit `p_ui = σ(x_uᵀθ_i)` (eq. 2, parameters K×D) (§2.3). Cascade update: a non-streaming user saw only the first L_init cards; a user streaming card i saw ranks 1..max(L_init, i); unseen cards get no update (§2.4). Rewards processed in daily batches (§2.4). Policies: random; ε-greedy-seg (ε=0.1, 0.01); etc-seg (n=100, 20); kl-ucb-seg; ts-seg-naive Beta(1,1); ts-seg-pessimistic Beta(1,99); ts-lin-naive / ts-lin-pessimistic (bias prior mean −5) (§3.3).
3. **Real numbers.** K=862 playlists, L=12, L_init=3, daily update; simulator over 974,960 anonymised users, D=97 (implicit-feedback MF + bias), Q=100 k-means clusters, ground-truth p_ui from logistic regression on January 2020 clicks; 20,000 users per round, 100 rounds (§3.1–3.2). Results: ts-seg-pessimistic best, gain "statistically significant at the 1% level (p-value <0.01)", already ahead of all others "at the end of the first 25 rounds"; etc-seg-exploit transitions "50 rounds earlier" than etc-seg-explore; ts-lin variants "stabilize to non-flat linear cumulative regret"; cascade beats no-cascade, significant at 1 % (Fig. 3); online A/B, February 2020, relative display-to-stream gains vs `random-top-100` (12 random from a per-cluster pre-selected 100), significant at 1 %; absolute users and rates withheld "for confidentiality reasons" (§4.1–4.2).
4. **Stated limitations.** Number of users and cards assumed fixed; arm distributions assumed "fixed and independent, which might be unrealistic"; a playlist's interest "might depend on its neighbors"; top-L individual selection "does not always lead to the best set of L playlists, e.g. in terms of musical diversity" (§5). Analyst-identified: absolute effect sizes withheld; single platform; independent replication (S21) confirmed the main ranking but partly contradicted the cascade claim.
5. **Application to PMP.** Ranker = Beta-Bernoulli Thompson sampling per catalogue track with prior Beta(1,99), reward from Berk's ≥90 %/<10 s signals, batch updates acceptable; with a tiny catalogue use one global posterior instead of clusters; add an explicit diversity step (MMR/Vendi) because the authors name its absence as their own gap. Files affected: `deploy/payload/public/site/session.js`, `app/lib/src/state/listening_session.dart` (reuse branch), `deploy/payload/prisma/schema.prisma` (per-track `alpha`, `beta`, serve counters).

### S03 — Brost, Mehrotra, Jehan (Spotify), "The Music Streaming Sessions Dataset", WWW 2019, doi 10.1145/3308558.3313641, arXiv 1901.09851 — `[FULL]` (full text read; figures are images, table schemas listed by name only)

1. **Problem.** No public dataset "enable[s] researchers to explore" how users interact with streamed content; two central challenges are "when a user will 1) skip a track, and 2) move from one listening context to another" (§1).
2. **Method.** Release of 160 M sessions with interactions, audio features and metadata for ~3.7 M tracks; session = listening with ≤60 s inactivity between tracks, capped at 20 tracks for privacy, sampled uniformly over 8 weeks from radio, personalised mixes, own collections and 100 top playlists; a subset collected under a *uniformly random shuffle* with playlist snapshots to enable counterfactual evaluation of sequential recommendation (§3); analysis with the `skip_1` threshold (§4.2); WSDM Cup 2019 challenge on the `skip_2` field (challenge page S03b).
3. **Real numbers.** 160 M sessions; ~3.7 M tracks; session length 10–20; "non-skip rate between 34% and 35% for all session positions"; skip rates higher for longer sessions; start reason most associated with not skipping = previous track completed; context switches "much more likely at the beginning of a session"; sessions of length 20 show lower context-switch rate (§4.1–4.2).
4. **Stated limitations.** Skip times are bucketed, so "moments in the track where skips are most likely to occur" cannot be predicted — the authors explicitly say that finer skip timing "could be of great value for generative and interactive music models" (§6); sessions capped for privacy; popularity threshold applied to tracks. Analyst-identified: figures not readable in the fetched text; single platform; 2018 data.
5. **Application to PMP.** Instrument skip *position in seconds* for every served track (we are the generative system the authors point at); expect a substantial baseline skip rate even for good content (Spotify's non-skip ≈ 34–35 % on mixed contexts), so the A/B margin must be set against PMP's own measured `s₀`, not against zero; use "previous track completed" as the trigger context favouring a catalogue insert at P2.

## Companies / APIs / repositories

| Entity | What was read | Status |
| --- | --- | --- |
| Deezer Research — `github.com/deezer/carousel_bandits` (S02 fn. 2), `github.com/deezer/recsys25-reacta` (S05 fn. 3) | repository URLs from the papers; data released for research | cited, **not inspected** (licence, commit, maintenance unverified) |
| Spotify Research — MSSD hosted at `research.spotify.com/datasets/music-streaming-sessions` (S03 §3); AIcrowd challenge page (S03b) | dataset location and challenge metric (MAA on `skip_2`) | read from paper/page |
| Spotify — patent US20200012681A1 (S13b) | Bart mechanism: FM reward model, ε-greedy skewed randomisation, propensity logging, counterfactual risk minimisation (poster) | page fetched, skimmed |
| Google / YouTube Music (S06) | six live interventions across serving/training/architecture/exploration layers | `[PARTIAL]` |
| AWS — S3 pricing (S15), CloudFront pricing (S16) | free S3→CloudFront transfer; 100 GB/month free internet egress; CloudFront flat-rate plans (Free $0: 1M req, 100 GB, 5 GB S3; Pro $15: 10M req, 50 TB; Business $200; Premium $1,000) | official pages read as served 2026-09-03 |
| Third-party pricing (S17) | $0.085/GB first 10 TB NA/EU; $0.0245/GB-mo eu-central-1 Standard | one provenance family; not official |

No new paid vendor is proposed. All numbers above are dated 2026-09-03 and must be re-opened at purchase/implementation time (covenant R16.4).

## Hidden and contrary evidence

- **S21 (Zenodo 10.5281/zenodo.7591118, TU Wien coursework reproduction of S02):** confirms ts-seg-pessimistic superiority in two setups but "the results of the influence cascading partly contradicts the claims made in the original paper" and states "the methodology was flawed or missing". Coursework-grade authority; kept because it is the only independent replication found.
- **S07 internal contradiction:** no disclosure effect in Study 2 vs a significant effect in Study 3 (see §3a).
- **S06 negative result:** serving-time heuristics neutralised by the learning loop; architectural debiasing "does not create discovery".
- **S01:** no satiation observed in several domains (Fig. 5) — contrary to the intuition that listeners tire quickly; but the same paper's radio evidence shows *broadcasters* enforce anti-recency. Both kept.
- **S19 (visual art):** AI label cuts perceived value by 62 % — much larger than S07's music effect; domain differs; carried as a contrary-magnitude signal only.

# Claim cross-verification ledger

`claim_id | claim | type | sources | independence | status`

| C | Claim | Type | Sources | Independence | Status |
| --- | --- | --- | --- | --- | --- |
| C01 | Thompson sampling with a pessimistic prior, semi-personalised, beat ε-greedy/ETC/UCB/linear TS offline and beat the baseline online at Deezer | SOURCE CLAIM | S02 (primary), S21 (independent reproduction), S02's Deezer Research page (same family) | 2 independent families | `[single-source]`-plus-replication: S02 + S21 only; carried as recommendation with that flag |
| C02 | Recency is the strongest predictor of repeat consumption; radio enforces anti-recency | PRIMARY FACT | S01 | 1 | `[single-source]` (unique study); supported in direction by S04/S05's frequency-and-recency ACT-R activation (2 more families) → 3 for the *direction*, 1 for the exact statement |
| C03 | Repeat listening is frequent in music and modern music recommenders model it explicitly | SOURCE CLAIM | S04, S05, S01 (§1 examples) | 3 families (Deezer 2024, Deezer 2025 — same lab; Stanford/Google 2014) | verified in direction; Deezer pair is one lab → 2 institutional families; flag `[2-family]` |
| C04 | Spotify session non-skip rate ≈ 34–35 % across positions; skips correlate within session | PRIMARY FACT | S03; S20 (first-skip accuracy 0.807 implies predictability); S03b challenge page | S20 is independent (DTU team) | 2 independent + challenge page (same family as S03) → `[2-family]` |
| C05 | Listeners cannot reliably distinguish AI from human music; disclosure lowers relistening/WTP modestly | SOURCE CLAIM | S07 (58.9 %, p=0.103; 48.57→46.69; 0.59→0.41 €), S08 (97 % fail), S19 (label devalues art) | 3 families (CESifo academics; Deezer/Ipsos; Sci. Rep.) | verified (3+), with S08 `[PARTIAL-snippet]` and S19 adjacent-domain caveats attached |
| C06 | Recommendation feedback loops homogenise consumption and suppress novelty | SOURCE CLAIM | S09, S06, S01 (popularity monotone effect, §3.3) | 3 families (Princeton; Google; Stanford/Google 2014) | verified (3+) |
| C07 | MMR = λ·relevance − (1−λ)·max similarity to selected | PRIMARY FACT | S11 (abstract/intro), S11b, S11c | paper + two independent implementations' docs | verified (3), S11 itself `[ABS]` |
| C08 | Vendi score = exp(Shannon entropy of eigenvalues of K/n), reference-free, O(d²n) with embeddings | PRIMARY FACT | S10 (§3.1–3.3), S10b, OpenReview page | S10b same first authors' group → 1 family; OpenReview is the same artifact | `[single-source]` — unique authority (definitional) |
| C09 | S3→CloudFront transfer is free; first 100 GB/month internet egress free; CloudFront Free plan 100 GB & 5 GB S3 at $0 | PRIMARY FACT (official) | S15, S16 | official, same vendor | `[single-source official]` |
| C10 | CloudFront PAYG $0.085/GB first 10 TB NA/EU; eu-central-1 S3 Standard $0.0245/GB-mo | SOURCE CLAIM | S17 family (egresscost, blazingcdn, cloudburn) | one provenance family | `[single-source, third-party]` — the economics conclusion does not depend on it (see sensitivity) |
| C11 | Evan Miller two-proportion sample-size formula and its worked outputs (2,545; 1,030) | PRIMARY FACT | S14, S14b | calculator + independent re-implementation | 2 sources; formula is standard; `[2-family]` |
| C12 | Reuse saves money for any a > 0.018 − s₀ | CALCULATION | derived from COMMON-BRIEF numbers + C09/C10 | — | REPRODUCED DERIVATION (shown in §1) |
| C13 | Visitor-level randomisation requires a design-effect inflation of n | INFERENCE | none read this session | — | `[UNVERIFIED]` |
| C14 | "Generated for you" vs "from catalogue" wording changes acceptance | UNKNOWN | none found | — | `[UNVERIFIED]` gap — must be tested in-product |

Counts: 3+-verified **4** (C05, C06, C07, C12 as derivation); single-source or 2-family **7** (C01, C02, C03, C04, C08, C09, C10, C11 → of these C01/C02/C08/C09/C10 single-source = 5, C03/C04/C11 two-family = 3); unverified **2** (C13, C14).

# Contradictions, corrections, uncertainty, gaps

**Contradictions preserved (not averaged):**
1. S02 vs S21 — cascade-based update benefit: S02 reports cascade > no-cascade at 1 % significance; S21's reproduction "partly contradicts" it. Main ranking result (ts-seg-pessimistic best) agreed by both.
2. S07 Study 2 vs Study 3 — AI disclosure: no significant effect (between-subject, playlists, EDM) vs significant negative effect (within-subject, WTP, pop+EDM). Authors' explanation: design and genre; effect "mainly driven by pop listeners".
3. S01 "no satiation" (check-ins, map clicks) vs S01 radio anti-recency practice and the "familiarity breeds contempt" regime — same paper, different domains; both kept.
4. CONTEXT-18 known conflicts acknowledged: no universal similarity threshold exists (none used here — `TAU_SIM` is a calibrated parameter); MERT non-commercial (not used); FAD Gaussian assumption (FAD not used).

**Uncertainty:**
- `h`, `a`, `s₀` are unmeasured project quantities. Every economic conclusion is stated as a formula in them.
- Per-GB prices are third-party (C10). Under the official Free flat-rate plan the marginal serving cost is $0 up to 100 GB/month (C09), which makes the conclusion of §1 robust to C10 being wrong by any factor < 55 (0.08/0.001428).

**Gaps (exact shortfalls, per R11.3):**
- Anderson et al. (S01) §5–6 experimental tables not extracted from either PDF mirror → `[PARTIAL]`, no five-part record; direction claims only.
- Inverted-U / mere-exposure lane (Berlyne; Schäfer & Sedlmeier; Chmiel & Schubert 2017 review of 57 studies, identified in Q14) **not opened**. SLICE-C item 3a names this lane; it is covered here only indirectly through S01/S04/S05. Next required action for the parent: open Chmiel & Schubert 2017 and one mere-exposure primary.
- RecSys Challenge 2018 (Spotify MPD) playlist-continuation lane **not swept**.
- McInerney et al. (S13) full text paywalled; poster + patent used.
- S06 Table 1 effect sizes present but unattributable (labels lost in extraction).
- No source found on provenance wording ("generated for you" vs "from catalogue") — C14 `[UNVERIFIED]`.
- Design-effect statement for visitor-level randomisation — C13 `[UNVERIFIED]`.
- Deezer repositories not inspected for licence/commit.
- **Execution limit:** stopped by the 45-minute wall-time limit, not by saturation. Marginal yield in round 3 was still material (S06, S15/S16), so `EXHAUSTIVE WITHIN THE ENUMERATED UNIVERSE` is **not** declared.

# Synthesis — adopt / build / avoid for PlayMusicPrompts

- **ADOPT** — Beta-Bernoulli Thompson sampling with pessimistic prior Beta(1,99), batch-updated, as the reuse ranker (S02, S21); MMR re-ranking of candidates (S11); Vendi score over served sets as the monoculture diagnostic (S10; the project already computes it between takes); Evan Miller two-proportion power formula on PMP's own measured baseline (S14); honest provenance labelling as a fixed factor (S07, S08).
- **BUILD** — per-take catalogue table with `alpha/beta` posteriors, per-visitor served-history, per-track daily serve counters, skip-position-in-seconds logging, the reuse branch at P2/P3/P4 in `session.js` and `listening_session.dart`, and the A/B assignment by `anonId`/`userId`. Build the `s₀` measurement *first*; it gates the sample size and the break-even.
- **AVOID** — reuse as slot 1 of the 3-take burst before non-inferiority is shown (P1 in Phase 2 only); static serving-time boosts once a learned ranker exists (S06); any similarity threshold not calibrated negatives-first (project decision 2026-08-17); catalogue share above 1-in-3 or serving a visitor a track they already heard (S01, S09); MERT embeddings (licence); a false "generated for you" label on a catalogue track (deception class, Berk's rules 25/19).
- **Dependencies / reversibility** — depends on slice A (storage) and slice on legal (redistribution rights of a shared catalogue) for the *right* to serve; the policy is fully reversible by setting `MAX_CATALOGUE_SHARE = 0`, which returns the system to Berk's current algorithm unchanged.

# Recommendation for this slice with falsifiers

**Committed recommendation.** Enable catalogue reuse as a *buffer-filling* branch only — at track START when the buffer is short (P2), at T−90 s when the pending job is late (P3), and as the skip-triggered refill (P4) — behind gates G1–G10, with at most 1 catalogue track per 3 served, never a track the visitor has already heard, ranked by pessimistic Thompson sampling seeded by prompt–track similarity and re-ranked by MMR, labelled truthfully. Keep Berk's 3-take burst fully fresh in Phase 1. Run a visitor-randomised A/B against generate-only with early-skip (<10 s) rate as the primary metric and a non-inferiority margin he sets, powered by the Evan Miller formula on the measured `s₀`. Expand to slot 1 of the burst (instant first sound) only if Phase 1 passes.

**Why this and not the alternatives.** Cost is not the constraint (Δ > 0 for any `a > 0.018 − s₀`); listener acceptance is, and it is unmeasured. The insertion points chosen are the only ones where reuse also buys *time* and where the listener's expectation of a bespoke track is lowest (post-full-listen lean-back, S03; skip cascade, S03). The ranker is the one industrial music-streaming result with an independent replication (S02, S21). The caps answer the one mechanism every source agrees on — feedback-loop homogenisation (S06, S09).

**Falsifiers (what would change the recommendation):**
1. If the A/B shows `E_B > E_A + margin` (catalogue tracks early-skipped materially more than fresh ones), reuse should be restricted to P3 (pure latency fallback) or disabled — the formula's money saving does not justify losing listeners.
2. If `h` measured over the first months stays near 0 under negatives-first `TAU_SIM`, the catalogue is too small for reuse to matter and the schema/copy work (slices A/B) should be justified by the /musics catalogue tab alone.
3. If Vendi over served sets falls while the posterior mass concentrates on a few tracks despite the caps, tighten `PER_TRACK_DAILY_SERVE_CAP` or lower `MAX_CATALOGUE_SHARE`; if that does not restore diversity, the Thompson prior is too optimistic for this catalogue size.
4. If a provenance-wording test (C14) shows "from the catalogue" triggers early skips that "matched to your prompt" does not, the label — not the policy — is the cause; fix copy first.
5. If the legal slice finds PMP lacks redistribution rights for cross-visitor serving, the entire reuse branch is blocked regardless of these findings.

# Sources (complete citations, stable locators, access dates)

All accessed 2026-09-03 (UTC+3). Read status per R8.2. Full per-source records with hashes in the register file.

- **S01** Anderson, A., Kumar, R., Tomkins, A., Vassilvitskii, S. "The Dynamics of Repeat Consumption." WWW '14, Seoul, 2014-04-07/11, pp. 419–430. doi:10.1145/2566486.2568018. https://cs.stanford.edu/people/ashton/pubs/repeat-consumption-www2014.pdf (mirror http://www.tomkins.family/static/papers/src/AKT+14.pdf). `[PARTIAL]`.
- **S02** Bendada, W., Salha, G., Bontempelli, T. "Carousel Personalization in Music Streaming Apps with Contextual Bandits." RecSys '20, 2020-09-22/26, pp. 420–425. doi:10.1145/3383313.3412217. arXiv:2009.06546 (2020-09-19). https://ar5iv.labs.arxiv.org/html/2009.06546 ; https://arxiv.org/abs/2009.06546 ; https://research.deezer.com/publication/2020/09/21/recsys-bendada.html. `[FULL]`.
- **S03** Brost, B., Mehrotra, R., Jehan, T. "The Music Streaming Sessions Dataset." WWW '19, San Francisco, 2019-05-13/17. doi:10.1145/3308558.3313641. arXiv:1901.09851. https://arxiv.org/pdf/1901.09851. `[FULL]`. **S03b** AIcrowd, "Spotify Sequential Skip Prediction Challenge" (WSDM Cup 2019). https://www.aicrowd.com/challenges/spotify-sequential-skip-prediction-challenge. `[PARTIAL-snippet]`.
- **S04** Tran, V.-A., Salha-Galvan, G., Sguerra, B., Hennequin, R. "Transformers Meet ACT-R: Repeat-Aware and Sequential Listening Session Recommendation." RecSys '24, published 2024-10-08. doi:10.1145/3640457.3688139. `[PARTIAL]`.
- **S05** Tran, V.-A., Sguerra, B., Meseguer-Brocal, G., Briand, L., Moussallam, M. "'Beyond the past': Leveraging Audio and Human Memory for Sequential Music Recommendation." RecSys '25, Prague, 2025-09-22/26. doi:10.1145/3705328.3748018. arXiv:2507.17356v1. https://arxiv.org/html/2507.17356v1. `[PARTIAL]`.
- **S06** Ranganathan, S., Diao, Z., Cunha, B., Moore, J. L., Dumas, R., Goksedef, M., Song, Y., Lu, M., Varady, G., Pesin, T. (Google). "Breaking the Loop: An Empirical Comparison of Strategies for Novelty and Freshness in YouTube Music." RecSys '26, Minneapolis, 2026-09-27/10-02. doi:10.1145/3773078.3831876. arXiv:2607.23749. https://arxiv.org/html/2607.23749. `[PARTIAL]`.
- **S07** Friedrichsen, J., Schwarz, J., Clement, M. "When Music is Made by AI: Effects on Preferences and Willingness to Pay." CESifo Working Paper No. 12405, dated 2026-01-15 (January 2026). https://www.ifo.de/DocDL/cesifo1_wp12405.pdf ; https://hdl.handle.net/10419/338369. `[PARTIAL]`. Same family: ProMarket, "Consumers Prefer AI Music Until They're Told It's AI", 2026-05-04, https://www.promarket.org/2026/05/04/consumers-prefer-ai-music-until-theyre-told-its-ai/ (secondary).
- **S08** Deezer Newsroom, "Deezer and Ipsos study: AI fools 97% of listeners", Paris, 2025-11-12. https://newsroom-deezer.com/2025/11/deezer-ipsos-survey-ai-music/. `[PARTIAL-snippet]`.
- **S09** Chaney, A. J. B., Stewart, B. M., Engelhardt, B. E. "How Algorithmic Confounding in Recommendation Systems Increases Homogeneity and Decreases Utility." RecSys '18, Vancouver, published 2018-09-27, pp. 224–232. doi:10.1145/3240323.3240370. arXiv:1710.11214. https://arxiv.org/pdf/1710.11214 ; https://oar.princeton.edu/bitstream/88435/pr1zc2c/1/RecSystemsUtility.pdf. `[PARTIAL]`.
- **S10** Friedman, D., Dieng, A. B. "The Vendi Score: A Diversity Evaluation Metric for Machine Learning." TMLR, 07/2023; arXiv:2210.02410v2 (2023-07-02). https://arxiv.org/html/2210.02410 ; https://openreview.net/forum?id=g97OHbQyk1. `[PARTIAL]`. **S10b** "Cousins of the Vendi Score: A Family of Similarity-Based Diversity Metrics for Science and Machine Learning." arXiv:2310.12952. https://arxiv.org/pdf/2310.12952. `[ABS]` — authors not captured from the fetched text; omitted rather than recalled.
- **S11** Carbonell, J., Goldstein, J. "The Use of MMR, Diversity-Based Reranking for Reordering Documents and Producing Summaries." SIGIR '98, Melbourne. doi:10.1145/290941.291025 (reprint SIGIR Forum 2017, doi:10.1145/3130348.3130369). `[ABS]`. **S11b** Elastic, "Maximum Marginal Relevance & Elastic", https://www.elastic.co/search-labs/blog/maximum-marginal-relevance-diversify-results. **S11c** OpenSearch docs, "Vector search with MMR reranking", https://docs.opensearch.org/latest/vector-search/specialized-operations/vector-search-mmr/. Both `[PARTIAL-snippet]`.
- **S12** Montecchio, N., Roy, P., Pachet, F. "The skipping behavior of users of music streaming services and its relation to musical structure." PLOS ONE 15(9): e0239418, September 2020. doi:10.1371/journal.pone.0239418. arXiv:1903.06008. `[ABS]`.
- **S13** McInerney, J., Lacker, B., Hansen, S., Higley, K., Bouchard, H., Gruson, A., Mehrotra, R. "Explore, Exploit, and Explain: Personalizing Explainable Recommendations with Bandits." RecSys '18, pp. 31–39, published 2018-09-27. doi:10.1145/3240323.3240354. https://research.atspotify.com/publications/explore-exploit-explain-personalizing-explainable-recommendations-with-bandits ; poster https://jamesmc.com/s/bart-poster.pdf. `[ABS]` — FAILED ACCESS: full text (ACM DL) paywalled. **S13b** US patent application US20200012681A1 (Spotify AB), filed 2019-07-03, published 2020-01-09. https://patents.google.com/patent/US20200012681A1. `[PARTIAL]`.
- **S14** Miller, E. "Sample Size Calculator (Evan's Awesome A/B Tools)." https://www.evanmiller.org/ab-testing/sample-size.html. `[FULL]` (page as served; displayed example baseline 10.2 %, MDE 10.2→13.2 %, n=2,545 per variation). **S14b** Cross Validated, "AB test sample size calculation by hand" (formula reproduction, 1,030 at p=20 %, δ=5 pp, α=5 %, power 80 %). https://stats.stackexchange.com/questions/392979/ab-test-sample-size-calculation-by-hand. Secondary.
- **S15** AWS, "Amazon S3 Pricing." https://aws.amazon.com/s3/pricing/. Fetched 2026-09-03. `[PARTIAL]` (dynamic tables absent from fetched text).
- **S16** AWS, "Amazon CloudFront CDN pricing." https://aws.amazon.com/cloudfront/pricing/. Fetched 2026-09-03. `[FULL]` as served (flat-rate plans page).
- **S17** Third-party pricing family: EgressCost.com, "AWS CloudFront Pricing 2026" (https://egresscost.com/aws/cloudfront-pricing/, states verified 2026-04); BlazingCDN blog (https://blog.blazingcdn.com/en-us/what-is-the-price-per-gb-of-aws-cloudfront-cdn ; …/using-cloudfront-with-s3-cost-analysis); Cloudburn, "Amazon S3 Pricing" (https://cloudburn.io/blog/amazon-s3-pricing). `[PARTIAL-snippet]`, one provenance family, not official.
- **S19** "Bias against AI art can enhance perceptions of human creativity." Scientific Reports 13 (2023), article s41598-023-45202-3. https://www.nature.com/articles/s41598-023-45202-3. `[PARTIAL-snippet]` — author names were not captured from the fetched text this session and are deliberately omitted rather than recalled.
- **S20** "Modelling Sequential Music Track Skips using a Multi-RNN Approach." WSDM Cup 2019; arXiv:1903.08408. doi:10.48550/arxiv.1903.08408. `[ABS]` — author names not captured from the fetched text this session and deliberately omitted rather than recalled; the paper self-reports 2nd of 45 teams, MAA 0.641, first-skip accuracy 0.807.
- **S21** TU Wien coursework, "Reproducing: Carousel Personalization in Music Streaming Apps with Contextual Bandits." Zenodo, doi:10.5281/zenodo.7591118. `[ABS]`.
- **Project sources (read this session):** `C:\Users\berke\.berk-agent-state\pmp-reuse-research\COMMON-BRIEF.md`; `C:\Users\berke\.berk-agent-state\pmp-reuse-research\SLICE-C.md`; covenant `C:\Users\berke\.claude\skills\deep-research\SKILL.md` (sha256 F19F5CB1…F9EB). Prior project research cited by title only, per the brief's instruction not to redo it: `docs/research/2026-08-17-rhythmic-monotony-and-take-similarity-gate.md`.

