# PlayMusicPrompts — research index

Scoped index of research artifacts under `docs/research/` (created 2026-09-03; the earlier manifests pointed to `docs/README.md`, which was measured ABSENT on 2026-09-03). Every run keeps its scope plan, preflight and completion manifest under `docs/research/_runs/`, raw captures under `docs/research/_sources/`.

## 2026-09-12 — AWS versus Google Cloud for owned audio

- **Subsequent owner decision:** AWS EC2 is required; cost is not the architecture selection criterion. [Current EC2 direction](../implementation/2026-09-12-website-api/ec2-platform-direction.md) supersedes the earlier GCP-first application proposal. Detailed service roles remain proposals.
- [Earlier provider recommendation](2026-09-12-audio-cloud-platform-decision.md): retained as the research snapshot before the EC2 instruction; its provider-undecided status and GCP-first proposal are historical.
- [Source and claim ledger](2026-09-12-audio-cloud-source-ledger.md), [cost model](_sources/2026-09-12-audio-cloud-cost-model.json), [audit manifest](_runs/2026-09-12-audio-cloud-platform-decision.json).
- [Academic evidence](2026-09-12-audio-cloud-qoe-evidence.md): five full papers; [capture manifest](_sources/2026-09-12-qoe-manifest.json), exact source PDFs/text/page renders under `_sources/2026-09-12-qoe-*`.
- [Owned-radio alternative](2026-09-12-owned-radio-alternative.md): personalized sessions versus shared playout; component/release/license boundaries.
- Supplemental [media/provider analysis](../implementation/2026-09-12-website-api/streaming-architecture.md), [Google ads/auth/platforms](../implementation/2026-09-12-website-api/ads-auth-platforms.md), [current API contract audit](../implementation/2026-09-12-website-api/contract-audit.md).
- Bounded research, not full research-standard closure or production readiness. Independent-source floor, actual publisher/download reward eligibility, web reward trust, live delivery and target devices remain explicitly open. The later EC2 requirement is recorded above; no cloud resources were deployed and no accepted-player files changed.

## 2026-09-03 — Generated-track catalogue, server-side storage, similarity-based reuse

- Synthesis + committed recommendation: `2026-09-03-generated-track-catalogue-and-similarity-reuse.md`
- Scope plan: `_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.scope-plan.md`
- Preflight: `_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.preflight.json`
- Completion manifest: `_runs/2026-09-03-generated-track-catalogue-and-similarity-reuse.json`
- Slice A (catalogue schema, storage; carries the UNVERIFIED RELAY banner — academic floor unmet): `2026-09-03-reuse-slice-a-catalogue-schema-and-server-storage.md`, register `2026-09-03-reuse-slice-a-source-register.md`
- Slice B (similarity retrieval): `2026-09-03-reuse-slice-b-similarity-retrieval-methods.md`, register `2026-09-03-reuse-slice-b-source-register.md`
- Slice C (reuse policy, economics, listener experience): `2026-09-03-reuse-slice-c-reuse-policy-economics-listener-experience.md`, register `2026-09-03-reuse-slice-c-source-register.md`
- Slice D (rights, platform policy, privacy): `2026-09-03-reuse-slice-d-rights-policy-privacy.md`, register `2026-09-03-reuse-slice-d-source-register.md`

## 2026-09-02

- SEO / GEO / AIO extraction for the one-prompt page: `2026-09-02-seo-geo-aio-extraction-for-create-page.md`

## 2026-08-29 — Simple-player input taxonomy and values

- Synthesis: `2026-08-29-simple-player-input-taxonomy-and-values.md`; register `2026-08-29-simple-player-input-taxonomy-source-register.md`
- Slices: `2026-08-29-generative-music-input-surfaces-competitors.md`, `2026-08-29-streaming-station-taxonomy-genres-decades-scenes.md`, `2026-08-29-music-preference-prompt-ux-academic.md`
- Manifest: `_runs/2026-08-29-simple-player-input-taxonomy.manifest.json`; scope plan `_runs/2026-08-29-simple-player-input-taxonomy.scope-plan.md`

## 2026-08-17 — Rhythmic monotony and take-similarity gate

- Report: `2026-08-17-rhythmic-monotony-and-take-similarity-gate.md`; manifest `_runs/2026-08-17-rhythmic-monotony-and-take-similarity-gate.completion.json`; preflight `_runs/2026-08-17-rhythmic-monotony-and-take-similarity-gate.preflight.json`

## 2026-08-13 — AI song generation (competitor axes)

- `sota/2026-08-13-ai-song-generation.md`, `apis/2026-08-13-ai-song-generation.md`, `competitors/2026-08-13-ai-song-generation-{business-model,functions-and-services,pricing,ui-and-menus}.md`

## Pending runs (started 2026-09-03, files land when the workers return)

- Slice E — advertising monetisation (web + mobile): `2026-09-03-ads-slice-e-monetisation-web-and-mobile.md` (+ register)
- Slice F — user management / Google + Amazon sign-in / auth.playmusicprompts.com: `2026-09-03-auth-slice-f-user-management-google-amazon-oidc.md` (+ register)

## 2026-09-05 — Frontier UI/UX research (MODE B, rules/09 six axes; Berk's order 15:49 TRT)

- Main report: `2026-09-05-frontier-music-ui-ux-frontier.md` (outcome first, 14/14 axis files, completion audit with named gaps)
- Source register (443 rows, 564 captures with sha256): `2026-09-05-frontier-music-ui-ux-source-register.md`; completion manifest: `_runs/2026-09-05-frontier-music-ui-ux.json`
- Axis files: `sota/2026-09-05-frontier-music-ui-ux.md`, `apis/2026-09-05-frontier-music-ui-ux.md`, `customer-expectations/2026-09-05-frontier-music-ui-ux.md`, `future-needs/2026-09-05-frontier-music-ui-ux.md`, `growth/2026-09-05-frontier-music-ui-ux.md`, `competitors/2026-09-05-prompt-to-music-creation-{functions-and-services,pricing,business-model,ui-and-menus}.md`, `competitors/2026-09-05-live-adaptive-player-{functions-and-services,pricing,business-model,ui-and-menus}.md`
- Downstream: `../design-directions/2026-09-05-frontier-all-surfaces.md` (3 structurally divergent directions; awaiting `APPROVED BY BERK`)
- Item 11 country-based consent UX (completed 2026-09-05 18:00): `2026-09-05-country-based-consent-ux.md` (41,996 B; 26 families, 5 academic FULL; KR/IN/Quebec rows UNVERIFIED — no regulator primary), captures `_sources/2026-09-05-consent-*` (63 files), official docs `../external-api/google-consent/` (8 HTML + 8 txt + README), manifest `_runs/2026-09-05-country-based-consent-ux.json` (status complete-with-named-gaps, 17 known gaps)

## 2026-09-09 — Frontier UI/UX components + HTML platform components (MODE B; Berk's order 14:40 TRT "önce araştır en ileri seviyede UI UX componentlarını … html componentları")

- Main report (scope plan → delegation ledger → parent re-verification per slice → synthesis ADOPT/BUILD-BEYOND/AVOID → completion audit): `2026-09-09-frontier-ui-components-frontier.md`
- Slice 1 platform primitives (85-row per-engine table; academic floor NOT met for this slice, stated): `2026-09-09-frontier-ui-components-platform-primitives.md`
- Slice 2 libraries + design systems (React Aria vs Base UI vs Radix; APG/ARIA 1.3 status): `2026-09-09-frontier-ui-components-design-systems-libraries.md`
- Slice 3 music & audio UI (38-item parity ledger; closes with the mandatory competitor block): `2026-09-09-frontier-ui-components-music-audio-ui.md`
- Slice 4 HCI/accessibility/typography academic (9 papers FULL with five-part records; carries the run's academic floor): `2026-09-09-frontier-ui-components-hci-academic.md`
- Slice 5 typography stack (34 variable fonts measured from files; loading + CSS support): `2026-09-09-frontier-ui-components-typography.md`
- Slice 6 adaptive/responsive (support matrix, first-party breakpoints, verification procedure): `2026-09-09-frontier-ui-components-adaptive-responsive.md`
- Captures: `_sources/2026-09-09-frontier-ui-components/{platform-primitives,libraries-design-systems,music-audio-ui,hci-academic,typography,adaptive-responsive}/` (326 files, per-slice registers with SHA-256); completion manifest: `_runs/2026-09-09-frontier-ui-components.json`
