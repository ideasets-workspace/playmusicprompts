# Research: Application Surface Technology, Runtime, Auth and Pricing for the Movie Maker App

Date: 2026-08-17 · Decision served: see R3 scope gate below · Status: **SCOPE PLAN — research in
progress; findings land in this file and its axis files. Until the completion audit passes this
header stays.**

# Standards ledger

Read this session, from disk, before the first external call: `C:\Users\berke\.claude\skills\deep-research\SKILL.md`
[FULL, two reads covering lines 1-1310] · `docs/moviemaker/2026-08-15-app-creative-brief.md` [FULL] ·
`docs/moviemaker/2026-08-05-00-index-and-reading-order.md` [grep-verified four-surfaces line] ·
`AGENTS.md` platform-purpose block [always-loaded] · `.claude/memory/DECISIONS.md` D-SSM-30 [written
this session] · live capabilities envelope `artifacts/deploy-2026-08-15/_live_caps_after_dssm30.json`
[FULL] · repo user-surface census [measured: 0 UI directories, 1 package.json in a test artifact].

# Scope plan (R3 gate)

1. **Exact decision served:** the four OPEN DECISIONS the app creative brief leaves to the owner
   (its own closing line): **service runtime · auth provider · per-surface app technology ·
   pricing/credits model** — each to be answered in a D1-D10 decision brief with ONE committed
   recommendation, under the constraint set below.
2. **Why:** D-SSM-30 (2026-08-17) redirected work to the platform's big gaps; the biggest measured
   gap is **0 of 4 user surfaces existing** (Clause 24: web · Android/iOS · Windows · macOS are four
   deliverables). No code can be written until the technology decision is made; the decision is the
   owner's; the brief must be evidence-complete.
3. **Project context:** SsmContentAssetCreator — a GENERIC MOVIE MAKER platform (film used only in
   tests), engine on AWS Lambda + Google Vertex (Veo 3.1 + Omni Flash closed set), music engine live
   at `generate-music-hybrid-model` (34-parameter self-describing capabilities API measured this
   session), film engine driven from scripts. Recorded product decisions that BIND this research:
   **Google-only assets/services (D-SSM-30, absolute)** · serving line "Cloud Run · GCS · Cloud CDN"
   (architecture s2c.3, quoted in infra.md) · domain `moviemaker.futuremovies.ai` with user login
   (MEMORY.md L709) · LIGHT editorial UI, never dark default · TR user-facing copy, EN artifacts ·
   the app never touches Vertex directly and holds no production identity in code (Clause 23).
4. **Complete topic and subquestions:** (a) which application technology serves all four surfaces at
   the never-before-achieved bar — one codebase vs per-surface native, with Google's own stacks
   (Flutter/Dart, Angular, Firebase) weighed against web-standard stacks served from Google Cloud;
   (b) which Google runtime serves the app tier (Cloud Run vs Firebase App Hosting vs GCS+CDN static)
   for THIS app's real shape (long-running detached jobs, live progress, media streaming);
   (c) which Google auth surface (Identity Platform vs Firebase Auth) fits `futuremovies.ai` login;
   (d) which pricing/credits models frontier creative tools use (evidence for HIS pricing decision,
   not ours). Each subquestion carries its own falsifiers.
5. **Reversal/falsification evidence:** a measured limitation of a candidate stack on ANY of the four
   surfaces (e.g. media playback/codec limits, desktop packaging state, WebSocket/stream limits on a
   runtime, auth surface deprecation) flips the recommendation; so does a Google product's own
   deprecation/changelog notice.
6. **Inclusion/exclusion:** first-party Google documentation, changelogs, pricing pages and release
   notes; academic/industry evidence on cross-platform app quality; frontier creative-tool product
   surfaces (Runway, Pika, Luma, CapCut, Descript, Frame.io per the brief's own study list). EXCLUDED
   by D-SSM-30: any recommendation that adds a paid third-party vendor or non-Google service to the
   product path. Languages: EN sources (+TR where product-relevant). Dates: newest-first, this-year
   priority.
7. **Verticals from the vision:** the four surfaces themselves (AGENTS.md purpose block names them);
   no geography vertical — the vision is global.
8. **Geography:** GLOBAL (vision verbatim: "dünyada bugüne kadar yapılamamış").
9. **Temporal scope:** current stable + announced-GA technology only; historical lineage only where
   it decides maturity (e.g. Flutter desktop GA history).
10. **Candidate universes:** Google first-party (Flutter, Firebase, Cloud Run, Identity Platform,
    Angular, Chrome/web platform) · frontier creative-tool companies (product+pricing surfaces) ·
    academic/industry cross-platform studies · GitHub first-party repos (flutter/flutter,
    firebase/*) · hidden evidence (issue trackers, release notes, deprecation lists).
11. **Planned artifact tree (count = 6):** this main report · `docs/research/_sources/` captures
    (counted in the register, not as separate planned files) ·
    `docs/research/2026-08-17-app-surface-auth-and-pricing.md` (slice B report) ·
    `docs/research/_runs/2026-08-17-app-surface-technology.preflight.json` ·
    `docs/research/_runs/2026-08-17-app-surface-technology.json` (completion manifest) ·
    `docs/README.md` index entries (edit, counted as one artifact touch) — plus the D1-D10 decision
    brief delivered in chat (not a file artifact).
12. **Hard-law check:** D-SSM-30 Google-only (constrains every candidate) · Clause 23 generic-by-
    construction (no production identity in app code) · Clause 24 four deliverables · research law
    floors (≥20/≥5, three-source, [FULL] reading) · fs-verification (all file checks from disk) ·
    budget: NO BUDGET DECLARED — research is $0 (search/fetch only), no paid call.
13. **Completion semantics:** complete when the four subquestions each carry a triple-verified
    evidence base, both floors are met and reported, the axis files exist, the manifest passes
    R17.1, and the D-brief with ONE committed recommendation per decision is delivered to Berk.
    Known blind spot to be stated honestly: hands-on performance measurements of candidate stacks
    are OUT of this run's scope (no build exists yet); the brief will say so.

# Outcome first

**All four open decisions now carry a verified evidence base (run totals: 52 authoritative provenance
families · 8 academic · 6 academic [FULL] with five-part records · 22 primary [FULL]; floors ≥20/≥5
EXCEEDED). One committed recommendation per decision, each with its falsifier, is in the Synthesis
below. CORRECTION (owner, 2026-08-17, and then MEASURED on disk this session): the "AWS vs GCP
placement" question this report briefly carried was the AGENT'S error, not an open decision — the
platform's established architecture is AWS FRONT DOOR (API Gateway + Lambda) INTEGRATED TO GOOGLE
CLOUD VIA WORKLOAD IDENTITY FEDERATION. Evidence: 15 variant `config.py` files carry
`WORKLOAD_IDENTITY` (counted this session), including the entire Vertex audio family
(`music_lyria`, `voice_vertex_tts`, `stt_vertex`, `audio_live_gemini`);
`generate_music_hybrid_model/config.py` delegates to `ssm-content-worker-music-lyria` and
`ssm-content-worker-stt-vertex`, both WIF-integrated Vertex callers. The film contract's GCP-native
clause (Clause 20) binds where film JOBS EXECUTE, not where the API front door lives. The app
backend follows the same proven pattern. The only remaining owner input is the Windows video
layer (below).**

# Findings by axis — verified against the slice primaries (spot-checks re-run by the parent)

Slice reports (each verified on disk this session: SHA-256 match, `# Standards ledger` opener,
structure complete):
- `docs/research/2026-08-17-app-surface-technology-and-runtime-slice.md` (242 lines, 26 sources /
  6 academic / 4 academic [FULL]; 13 captures)
- `docs/research/2026-08-17-app-auth-and-pricing-slice.md` (228 lines, 26 families / 2 academic
  [FULL]; 12 captures)

Parent spot-checks (this session, against the raw captures): Identity Platform MAU figures
(50,000 free → $0.0055 → $0.0025) and TR SMS $0.01 present in
`_sources/2026-08-17-google-identity-platform-pricing.txt` · flutter/flutter#37673 Windows
video_player absence present in `_sources/2026-08-17-flutter-issue-37673-video-player-windows.txt`
(46 `video_player` hits) · Cloud Run 3600 s WS ceiling context read from the slice report itself.

# Synthesis — one committed recommendation per decision

1. **Per-surface technology → ADOPT Flutter (3.47.0 stable, 2026-08-12) as the ONE codebase for all
   four surfaces**, with TWO conditions that are part of the recommendation, not caveats: (a) a
   real-device frame-gated prototype BEFORE mass build (the academic jank evidence — 33 FPS UI-stress
   vs 55 native, pre-Impeller — is resolved operationally, not argued away); (b) the Windows video
   layer is an owner decision surfaced below (first-party `video_player` has NO Windows
   implementation — #37673 open since 2019, PR closed unmerged 2024-10-08). WHY Flutter and not
   web-first: the measured ABSENCE finding — no Google first-party desktop wrapper for web code
   exists (Chrome Apps deprecated; installed-PWA is not a store artifact) — makes web-first
   structurally unable to deliver Windows/macOS as REAL deliverables under Google-only (Clause 24).
   FALSIFIER: prototype fails the frame gate on real devices.
2. **Runtime → the platform's OWN measured pattern: AWS API Gateway + Lambda front door,
   Google Cloud (Vertex + the GCP instance) as the engine, joined by Workload Identity Federation**
   — 15 variant configs carry `WORKLOAD_IDENTITY` this session; `generate_music_hybrid_model`
   delegates to the WIF-integrated `music_lyria`/`stt_vertex` workers; the film contract's
   GCP-native clause binds JOB EXECUTION, not the front door. The Cloud Run evidence (WS 3600 s
   ceiling, min-instances, measured prices, us-central1, 2026-08-17) remains ON FILE for any
   GCP-side long-lived-connection tier the engine later needs; GCS+CDN cannot terminate SSE/WS;
   the file-truth progress model (Clause 20) is served by polling/SSE through the existing
   AWS front door.
3. **Auth → Identity Platform** (the Firebase-Auth-backend upgrade): free to enable, 50k MAU free
   tier, MFA + OIDC/SAML + multi-tenancy + 99.95% SLA, and BLOCKING FUNCTIONS as the credit-
   enforcement hook (`beforeSignIn` → `sessionClaims`, 7 s budget, 2,000/min). Works identically in
   front of an AWS or GCP backend (it is an identity plane, not a hosting choice). FALSIFIER: a
   session-model limit on desktop surfaces (flagged [UNVERIFIED] in the slice — to be proven in the
   prototype).
4. **Pricing/credits → evidence pack for the OWNER's decision** (never ours): all 8 frontier tools
   converge on subscription + credit-pool ($8-10 / $24-35 / $76-95), non-rollover base credits,
   persistent top-ups, commercial rights gated at mid-tier, and zero-credit UX that REFUSES or
   degrades but never trims — which matches this platform's Clause 22 refuse-never-trim semantics.
   Two academic primaries ([FULL]) establish menu/two-part-tariff optimality. NOT TO COPY —
   UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT.

# Claim cross-verification and contradiction state (parent level)

Run totals from the two slice ledgers: **22 load-bearing claims 3+-verified · ~17 [single-source
official] (dated vendor figures, disclosed) · 6 [UNVERIFIED] (each flagged; none carries a
recommendation)**. Contradictions PRESERVED, not averaged: Luma mid-repricing · Kling first-party
price page bot-blocked (HTTP 446 = access failure, not absence) · Flutter jank studies vs
Impeller-era claims (resolved operationally via the prototype gate) · EU-iOS-push claim
[UNVERIFIED].

# Artifact index and produced-vs-planned count

Planned 6 (scope plan §11) → produced: this main report (1) · slice A report (counts as the
technology/runtime axis file) (2) · slice B report (auth/pricing axis file) (3) · preflight JSON (4)
· completion manifest `docs/research/_runs/2026-08-17-app-surface-technology.json` (5) ·
`docs/README.md` index entry (6). Source captures: 25 files under `_sources/` dated 2026-08-17,
registered in the slice reports. DEVIATION, stated: the scope plan named slice B's file
`2026-08-17-app-surface-auth-and-pricing.md`; it was produced as
`2026-08-17-app-auth-and-pricing-slice.md` — same artifact, different (dated, kebab) name; the index
row and this section carry the real name.

# Honest limits

Hands-on performance measurement of candidate stacks was OUT of scope (no build exists) — the
frame-gated prototype IS the next verification step, and the technology recommendation is explicitly
conditional on it. The Windows video layer is an OWNER decision, presented, never resolved silently.
The AWS-vs-GCP placement question that earlier stood here was withdrawn as the agent's own error —
the architecture (AWS front door + WIF + Google Cloud engine) is already established and measured on
disk (15 WIF variant configs; the delegation chain in `generate_music_hybrid_model/config.py`).

# Framing and falsifiers — the LOCAL architectural facts the recommendation must serve

All measured from disk this session (fs-verification law; sources named per line):

1. **The app talks to ONE backend service** (`docs/moviemaker/2026-08-15-app-engine-contract.md` §1,
   read [FULL] this session): `moviemaker.futuremovies.ai`, user login, five fixed `/v1` schemas
   (`film-job-request` · `film-job-progress` · `shot-record` · `film-delivery` · `owner-verdict`).
   The film line is **GCP-native — "NO AWS for the film line"** (contract §1, citing MEMORY.md L709 #9).
2. **BUT the asset/music product's live API is AWS**: REST API `v2pjhwhk0m` with
   `/generate-music-hybrid-model` (POST, api-key required) → `ssm-content-job-creator`, and WebSocket
   `uijimt1hpd` (infra.md, re-read this session; the capabilities envelope was live-measured 200 this
   session). **TENSION THE BRIEF MUST ADDRESS:** either the `futuremovies.ai` service PROXIES the AWS
   asset APIs (one origin for the app, CORS/auth in one place) or the app calls two backends (violates
   the contract's one-service shape). This is an architecture consequence of the runtime decision, not
   a separate decision.
3. **Progress is file-truth over detached jobs** (Clause 20; contract §2): the progress JSON is the
   authority, which means the app tier needs either polling over HTTPS or a push channel FED BY a
   file-watcher — a long-lived WebSocket to the engine is NOT the model. Runtime evidence must be
   weighed for THIS shape (SSE/poll-friendly, not stateful-socket-dependent).
4. **`futuremovies.ai` has no infra.md record yet** (measured: 0 hits) — the domain decision lives in
   MEMORY.md; DNS/hosting is unbuilt. The runtime recommendation therefore also names the first
   concrete deployment artifact.
5. **Falsifiers for the whole brief:** a Google-runtime limit incompatible with the progress model
   (e.g. SSE/streaming response ceilings), a Flutter-per-surface limitation that breaks the §4D player
   or §4B upload hero-flow, an Identity Platform constraint on the multi-surface session model, or a
   pricing-evidence pattern that contradicts refuse-never-trim semantics (Clause 22).
