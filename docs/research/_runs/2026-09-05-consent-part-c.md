# Findings — UX evidence (scope item 4): five-part records, five academic `[FULL]`

**A1. Nouwens, Liccardi, Veale, Karger, Kagal — "Dark Patterns after the GDPR", CHI 2020, arXiv 2001.02479 `[FULL]`** (captures `nouwens-2020-arxiv-text.txt`, `nouwens-2020-arxiv.pdf`, MIT DSpace text). 1 Problem: CMP designs shape consent so it is not "freely given" (L35, L41–L43). 2 Method: scrape of the 5 most-used CMPs on the UK top-10k (n=680 sites) scored against minimal legal requirements; then a within-subject field experiment (40 participants, browser extension, 8 interface conditions Fig. 3 a–h, linear fixed-effects regression) (L41, L93, L101–L103). 3 Numbers: only 11.8 % (80/680) meet minimal requirements (L63); 89.3 % of answers via bulk buttons, 55.2 % accept-all vs 34.1 % reject-all (L104); abstract: removing reject from first page +22–23 pp consent; granular controls on first page −8–20 pp; banner vs barrier no effect (L35). 4 Limitations (authors): small experiment sample (40), UK-only scrape, participants aware of study (L113). 5 Application: PlayMusicPrompts Tier-A banner keeps Reject on the first layer at equal weight (already true in `consent.js` L23–L24) and does NOT push granular toggles to the first layer; a second layer carries purpose toggles.

**A2. Utz, Degeling, Fahl, Schaub, Holz — "(Un)informed Consent", CCS 2019, arXiv 1909.02638 `[FULL]`** (`utz-2019-ccs-arxiv.txt`, 1,763 lines from the PDF). 1 Problem: notice position, choice type and nudging drive consent (L33–L40). 2 Method: three field experiments, >80,000 unique users on a German website (L33); manual categorisation of 1,000 notices (L336–L351). 3 Numbers: 57.4 % of notices with choices nudge toward accepting (L337, L372, L559); binary choice yields more acceptance than per-category/per-vendor; with a no-nudge granular notice fewer than 0.1 % allow all purposes (L171, L863); lower-left placement raises interaction (abstract). 4 Limitations: single German site, German users, desktop-heavy (L812 mobile share). 5 Application: expect near-zero personalised-ad opt-in under a neutral granular Tier-A design — the revenue model in Tier A must be non-personalised ads (`&npa=1`) by default, not consent-dependent.

**A3. Habib, Li, Young, Cranor — "Okay, whatever", CHI 2022, DOI 10.1145/3491102.3501985 `[FULL]`** (`habib-2022-chi-fulltext.txt`; DOI fetch 403, text from search-tool extraction). 1 Problem: usability beyond dark patterns (L29–L35). 2 Method: inspection of CMP interfaces → 10 design parameters; between-subjects online study, 1,109 participants, 12 variants incl. "best" and "worst practice" (L111, L127–L129, L143). 3 Numbers: awareness of a privacy decision differed by condition, Fisher's exact p<0.001, V=0.48 (L212); persistent "Cookie Preferences" corner button significantly improved ability to revoke (L245); absence of in-line options on the first screen changed decisions (L41, L157). 4 Limitations: US IP inspection, non-random site list, Useberry prototype awareness, no per-interface timing (L253–L262). 5 Application: keep the persistent footer "Privacy choices" entry (present, `consent.js` L52–L54) and make the first screen carry the choice, not a link.

**A4. Machuletz & Böhme — "Multiple Purposes, Multiple Problems", PoPETs 2020 `[FULL]`** (`machuletz-boehme-2020-popets-text.txt`, `…popets.pdf`). 1 Problem: highlighted "select all" default and option count (L7, L57). 2 Method: lab experiment, N=150 students, Innsbruck + Münster, control + 2 treatments, Kruskal–Wallis/t-tests (L115, L141, L235–L243). 3 Numbers: default button effect χ²(1)=7.2, p<0.01 supporting H1; effect on all-or-nothing consent ≈20 pp, "about four times larger" than prior app-dialog default effect; 1 vs 3 purposes no significant effect (L243–L249, L7). 4 Limitations: students only, desktop, German-language (L111–L115). 5 Application: never visually highlight Accept over Reject in Tier A (rules out the current `primary` class on Accept only — `consent.js` L24 — for Tier A regions).

**A5. Alharbi et al. — "An Empirical Analysis of E-Governments' Cookie Interfaces in 50 Countries", Sustainability 15(2):1231, 2023 `[FULL]`** (`mdpi-2023-egov-cookie-interfaces-fulltext.txt`). 1 Problem: compliance/usability of consent interfaces at scale (L31–L43). 2 Method: 243 e-government sites from 50 countries (UN EGDI 2020), heuristic evaluation G1–Gn, interface types A–D (L251, L269). 3 Numbers: ~70 % (160/243) violated at least one guideline; ~66 % of third-party-cookie sites set cookies before consent; 45 % (110/243) gave cookie information; ~50 % had pre-selected options (L259, L283, abstract) . 4 Limitations: government sites only, 2020 snapshot. 5 Application: "no cookies before decision" is the test the parent's 3-region proof must include (measure network/cookie jar before click).

Regulatory UX (non-academic, `[PARTIAL]`): EDPB 03/2022 v2.0 (14 Feb 2023) pattern families Overloading / Skipping / Stirring / Obstructing / Fickle / Left in the dark (`edpb-03-2022-deceptive-design-v2-text.txt` L5–L48); ICO "equally prominent accept all / reject all" (`ico-storage-access-consent-in-practice-text.txt`); CNIL "tout refuser" button and refusal remembered (`fr-cnil-cookies-faq-text.txt`); AEPD reject "al mismo nivel y con la misma visibilidad" (`es-aepd-guia-cookies-text.txt`). First-party UX guidance from Google's banner best-practice doc and Apple HIG: NOT captured — `[GAP]`.

# Findings — peer practice (scope item 5)
| Peer | What the first-party page says | Certified CMP? | Capture |
| --- | --- | --- | --- |
| Spotify | Two categories (strictly necessary / optional); management via browser settings and account privacy settings; per-region policy variants (/au/) | Not stated on page — `[UNVERIFIED]` | `peer-spotify-cookies-policy.txt` `[FULL]` |
| SoundCloud | Uses a CMP and IAB TCF; "In some countries … allowed to set such Cookies by default" — explicit region-based default-on; Cookie Manager in Privacy tab | TCF CMP yes (vendor unnamed) | `peer-soundcloud-cookie-policy.txt` L23, L38–L48 `[FULL]` |
| Deezer | Consent OR object in cookie settings for ad profile and audience measurement; "If you object, only generic and less-relevant ads" | Not stated | `peer-deezer-personal-data-text.txt` `[FULL]` |
| Suno | Cookies "do not fire until you have provided consent (where consent is required by applicable law)"; Cookie Settings by category; honours GPC; US "Do Not Sell or Share" | Not stated | `peer-suno-cookie-policy.txt` L21–L25 `[FULL]` |
| YouTube Music (Google) | Not captured — search card only ("Before you continue" EEA dialog, g.co/privacytools) | Google's own | `[GAP]` |
Peer pattern: two of four read peers (SoundCloud, Suno) state region-conditional consent explicitly — matching Berk's order.

# Committed Google call sequence (each line traceable to a downloaded doc)
**Web (Next.js on EC2 behind CloudFront):**
1. Origin request policy forwards `CloudFront-Viewer-Country` and `CloudFront-Viewer-Country-Region` (aws-cloudfront L28, L71–L83).
2. Middleware maps header → tier; missing/`ZZ`/AWS-origin → Tier A (aws L76; consent-mode L368).
3. SSR head emits `gtag('consent','default',{ad_storage,ad_user_data,ad_personalization,analytics_storage:'denied', wait_for_update:500, region:[…Tier-A ISO codes incl. 'CA-QC']})` (consent-mode L128–L149, L389–L408).
4. Second `gtag('consent','default',{…all 'granted'})` without `region` = catch-all for Tier B (L368) — replaces today's global-denied default in `analytics.js` L27–L35.
5. Replay stored decision with `gtag('consent','update',…)` — and REMOVE the hard-deny of ad purposes in `analytics.js` L41–L46 (the audited defect).
6. Tier A banner: Accept / Reject equal weight, no pre-ticked toggles; Tier B: passive "Privacy choices" entry + GPC (`navigator.globalPrivacyControl` / `Sec-GPC`) → treat as opt-out and show confirmation (§7025(c)(6) `[PARTIAL]`).
7. IMA tag: `&npa=1` (and `&ltd=1` when no storage consent) whenever `ad_personalization`≠granted (`ads.js` L82–L84; in-repo `ima-html5-consent-eu.html`).
8. EEA/UK/CH personalised ads require a Google-certified TCF CMP (EU UCP help L15) — without one, Tier A stays `npa=1` permanently.
**Flutter (phone + tablet):**
1. `ConsentInformation.instance.requestConsentInfoUpdate(params,…)` at every launch (`consent_gate.dart` L60; android-ump L271).
2. `params` carries `ConsentDebugSettings(debugGeography: EEA | RegulatedUSState | Other)` only on test devices (android-ump L412; us-states iOS excerpt).
3. `ConsentForm.loadAndShowConsentFormIfRequired(...)` — UMP decides by geography whether the GDPR form, the US-states form or nothing is shown (`consent_gate.dart` L64).
4. iOS: publish the IDFA explainer in AdMob Privacy & messaging so UMP shows it BEFORE the ATT alert; add `NSUserTrackingUsageDescription` (idfa L229–L236).
5. `canRequestAds()` true → `MobileAds.instance.initialize()` once (`consent_gate.dart` L65–L68; android-ump L343).
6. `getPrivacyOptionsRequirementStatus()==required` → render the settings entry (`consent_gate.dart` L83–L86; android-ump L320).
7. TFUA: set on `ConsentRequestParameters` AND on ad requests (`RequestConfiguration.ageRestrictedTreatment` per in-repo CHANGELOG note) — UMP does not forward it (us-states L255).
8. Non-EEA/US-regulated devices: UMP shows nothing → ads default-on, matching Tier B; withdraw via the same privacy-options entry.

# Methodology and query ledger
| Q | Time | Query / action | Yield |
| --- | --- | --- | --- |
| Q1 | 17:35 | broad scoping "country-based cookie consent requirements 2026…" | 5 vendor guides (discovery only) |
| Q2 | 17:35 | Consent Mode v2 developer doc | official doc discovered |
| Q3 | 17:35 | EDPB 2/2023 final | v2.0 PDF (7 Oct 2024) |
| Q4 | 17:35 | ICO storage & access / consent-or-pay | 2 ICO pages |
| Q5 | 17:35 | KVKK 2022/229 + 2026 decisions | 3 kvkk.gov.tr pages |
| Q6–Q10 | 17:37 | UMP Android/iOS/US-states; EU UCP; CloudFront; CPPA §7025/GPC; academic identities | 9 official pages, 4 papers |
| Q11–Q15 | 17:40 | EUR-Lex ePD + EDPB 03/2022; UK DUAA; CH EDÖB; BR ANPD; CA/AU/JP/KR/IN | EUR-Lex, legislation.gov.uk ×2, gov.uk, datenrecht redline, gov.br ×2, OAIC, secondaries |
| Q16–Q20 | 17:43 | JP/KR/IN primaries; Utz/Machuletz/EDPB PDFs; CNIL/AEPD/DSK/Garante/AP/KVKK Rehber; GA4/Apple/Play/UMP-iOS; peers | PPC PDF, CNIL FAQ, AEPD PDF, DSK PDF, arXiv/PETS PDFs, UMP iOS + IDFA, 4 peer pages; Garante/AP/Rehber/GA4/Apple/Play NOT found |
| F1 | 17:38 | PowerShell fetcher | 0/17 (Invoke-WebRequest -PassThru fault) — recorded |
| F2 | 17:46 | Node fetcher, 41 URLs | 36×200, 3×403, 1×401, 1×fetch-failed |
| X1 | 17:53 | pypdf/HTML text extraction, 20 files | 20 .txt siblings |

# Source register (families counted for the R11 floor)
Regulator/legislature families: KVKK (2 decisions + 1 principle decision), EUR-Lex ePD, EDPB (2/2023; 03/2022), ICO, UK Parliament/legislation.gov.uk, GOV.UK factsheet, EDÖB (via datenrecht redline), CPPA regs (Westlaw excerpt), ANPD, OAIC, PPC Japan, CNIL, AEPD, DSK = **14**. Platform families: Google (Consent Mode, EU UCP, UMP Android/iOS/IDFA/US-states — one family), AWS = **2**. Academic families: Nouwens, Utz, Habib, Machuletz & Böhme, Alharbi et al., CNIL 2022 literature review = **6**. Peers: Spotify, SoundCloud, Deezer, Suno = **4**. **Total independent families: 26** (authoritative ≥20 met); academic 6, academic `[FULL]` 5, primary `[FULL]` (incl. official docs read in extracted text) 22. Secondaries used for discovery only: 14 (vendor/law-firm), none load-bearing.

# Claim ledger (load-bearing)
| ID | Claim | Sources (families) | Status |
| --- | --- | --- | --- |
| C1 | TR requires opt-in for analytics + ad cookies, web and apps, default off | KVKK 2022/229 TR + EN; prior in-repo S60/S61 | regulator family only → `[single-source official]` |
| C2 | EEA: Art. 5(3) consent for storage/access incl. pixels/IDs | EUR-Lex; EDPB 2/2023; CNIL; AEPD; DSK | 5 families → verified |
| C3 | Reject must be as easy/prominent as accept (EEA/UK) | ICO; CNIL; AEPD; EDPB 03/2022 | 4 → verified |
| C4 | UK: first-party non-shared statistics cookies exempt from consent (notice + objection) from 5 Feb 2026 | legislation.gov.uk Sch A1 + s112; GOV.UK factsheet | 2 (same legislature) → `[single-source official]` |
| C5 | Google requires certified CMP for EEA/UK/CH ad serving | EU UCP help; in-repo GAM 13554116; prior S01 | Google family → `[single-source official]` |
| C6 | Consent Mode region defaults: region-less default = catch-all; most specific wins | Google doc | `[single-source official]` |
| C7 | CloudFront-Viewer-Country not set for AWS-network origin; needs origin request policy | AWS doc; AWS blog (same family); re:Post thread (community) | `[single-source official]` + community |
| C8 | US: opt-out model; GPC binding; visible confirmation from 2026-01-01 | Westlaw §7025 excerpt; CA OAG (card); Consenteo (vendor) | `[PARTIAL]` primary → `[single-source]` |
| C9 | Removing Reject from first layer raises consent ~22–23 pp; highlighted default ≈ +20 pp; nudging in 57.4 % | Nouwens; Machuletz; Utz | 3 → verified |
| C10 | CH: plain cookies notice+opt-out (FMG 45c); high-risk profiling → opt-in | EDÖB redline (mirror); law-firm secondaries ×2 | primary mirror `[PARTIAL]` → `[single-source]` |
| C11 | Quebec s.8.1 tracking off by default | 2 law-firm secondaries, 1 vendor | `[UNVERIFIED]` — primary not read |
| C12 | AU: opt-out acceptable except sensitive data | OAIC | `[single-source official]` |
Counts: verified-3+ = 3 (C2, C3, C9); single-source (official or partial) = 8; unverified = 1 (C11) + the KR/IN rows.

# Contradictions, corrections, gaps
- Vendor guides (Q1) classify Switzerland as "opt-out"; the EDÖB 2025 guide requires opt-in for high-risk profiling — preserved, resolved toward the regulator (C10).
- Vendor guides call Brazil "opt-in"; ANPD's own text allows legitimate interest for analytics — resolved toward ANPD (`[PARTIAL]`).
- Search synthesis claimed "UMPDebugGeographyRegulatedUSState requires UMP 3.1.0+" and elsewhere "2.7.0+" — not resolved from the captured txt; `[UNVERIFIED]`.
- GAPS (named): KR PIPA and IN DPDP primaries; Quebec Law 25 text; LGPD/ANPD guide PDF; GDPR Art. 83 and national penalty ceilings; Garante/AP guidance; KVKK Çerez Rehberi PDF and 2024 amendment text; GA4 consent-requirements help page; Play Data safety; Apple ATT/HIG; Google banner best-practice; YouTube Music consent flow; behaviour-modelling thresholds; UMP geography mechanism.

# Artifact index and produced-vs-planned count
Planned classes 3 + manifest = 4; produced: this report (1), captures under `_sources/2026-09-05-consent-*` (61 files incl. .txt siblings — counted in §Completion audit), `docs/external-api/google-consent/` (8 docs + 8 .txt + README = 17), `_runs/` (fetch scripts ×2, extractor, manifest JSON) — counts machine-verified in the completion audit appended below.
