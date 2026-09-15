# Audio cloud decision — source and claim ledger

As of 2026-09-12. Scope: AWS versus Google Cloud recommendation for PlayMusicPrompts, without owner selection or deployment. This is a bounded decision investigation. Official product documentation is authoritative for that product, but repeated pages from the same vendor are not independent confirmation of vendor superiority.

## Research and evidence classification

- **Measured locally this session:** free authenticated music API health/capabilities, preserved at `../implementation/2026-09-12-website-api/live-access.json` and `live-capabilities.json`. No paid generation, media delivery pilot or account readiness test is implied.
- **Single-source official:** all AWS/Google service features, limits, prices and policies below. Accessed this session. Publication/update dates vary; current retrieval is not a new publication date.
- **Engineering inference/proposal:** GCP-first operational preference, personalized queue recommendation, proposed security/media contracts, switching conditions and tests.
- **Hypothetical calculation:** every cost scenario. Inputs, formulas and exclusions in the JSON model are assumptions, not measured demand or revenue.
- **Historical project context:** AWS resources and auth/catalogue notes were read, not refreshed as live inventory. The owner explicitly superseded any assumed AWS selection.
- **Unresolved:** real publisher eligibility/fill, portable-download reward classification, authentic web reward proof, native/TV compatibility, pure-audio managed channel assembly, quote/plan/account/org-policy eligibility and full deployment cost.

## Search and reading record

Discovery covered audio-only packaging/stitching, scheduled VOD radio, PAYG and flat CDN pricing, cacheability/request counts, signed origin access, Google IMA audio/reward policies, actual device support, owned playout and listener QoE. Directed follow-ups tested the strongest counterarguments: GCP owned radio without managed SSAI, AWS flat pricing without inventing a Business security floor, and Google's new consolidated tariff.

This ledger records the query **topics**, not a reconstructed verbatim search transcript. Exact worker query strings are preserved in their named slice documents; web tool results in this session preserve parent retrievals. No result snippet is counted as a full paper. Primary sources were opened and operative sections read; source-table boundaries intentionally distinguish a relevant-section read from reading an entire long documentation site. No ad sample was executed and no publication action occurred.

## Parent-opened primary record

All entries below were retrieved/opened by the parent during this task, including before context compaction. Boundaries are page headings or returned line locations, not claims of entire documentation-set reading.

| ID | Primary work / link | Parent read boundary | Application and limit |
| --- | --- | --- | --- |
| P01 | [AWS audio-only MediaTailor tutorial](https://aws.amazon.com/blogs/media/monetize-audio-only-content-with-aws-elemental-mediatailor/) | Main article, steps and conclusion; returned lines235–372 | Real audio-only example; 2022 tutorial, old OAI step superseded by current OAC; not our production measurement |
| P02 | [GCP Transcoder configurations](https://docs.cloud.google.com/transcoder/docs/concepts/config-examples) | Audio-only example678–731 and neighboring mux examples | Audio-only HLS route; not full1509-line video-example collection |
| P03 | [Transcoder overview](https://docs.cloud.google.com/transcoder/docs/concepts/overview) | Operative overview, workflow, async and processing-mode text | Packaging feasibility and latency uncertainty |
| P04 | [Transcoder pricing](https://cloud.google.com/transcoder/pricing) | Audio-only rates, output/rendition charging and examples | Output-minute arithmetic; unrelated inconsistent video example not used |
| P05 | [Video Stitcher overview](https://docs.cloud.google.com/video-stitcher/docs/concepts/overview) | Concepts/workflow/protocol/ad sections72–145 | No explicit pure-audio contract established |
| P06 | [Media CDN overview](https://docs.cloud.google.com/media-cdn/docs/overview) | Capabilities/origin/security/enabling sections53–155 | Separate sales-enabled alternative; no CloudCDN price substitution |
| P07 | [CloudFront PAYG pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/) | Current free tier, regional egress and HTTPS tables, pricing notes | EU scenario; examples contradict tables in places, use rate table |
| P08 | [CloudFront flat pricing](https://aws.amazon.com/cloudfront/pricing/) | Plans/features/allowance table238–335 | Real flat alternatives; not entire service bill |
| P09 | [CloudFront flat-plan guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html) | Eligibility, feature restrictions, allowances and expandable Premium tables | Request limits/over-allowance behavior, not “unlimited” |
| P10 | [Cloud CDN pricing](https://cloud.google.com/cdn/pricing) | Operative pricing tables and notes through123 | GiB, regional egress, cache-fill and requests; no fullbill |
| P11 | [Cloud Storage pricing](https://cloud.google.com/storage/pricing) | General internet egress, same-cloud/CDN rules and relevant Standard storage row | One-time ingest example; file format and geography assumptions explicit |
| P12 | [AWS MediaTailor revised pricing announcement](https://aws.amazon.com/about-aws/whats-new/2025/04/new-aws-elemental-mediatailor-pricing-model/) | Full announcement | Live0.50/VOD0.25 per1000, April2025 change; old0.75 rate excluded |
| P13 | [Google reward policy](https://support.google.com/admanager/answer/7496282?hl=en) | Reward and implementation requirements17–53 | Policy text established; portable music-export application unresolved |
| P14 | [GAM rewarded web](https://support.google.com/admanager/answer/9116812?hl=en) | Requirements/setup/events and app-only SSV distinction25–160 | Web grant is a client event; no fictional signed web callback |
| P15 | [Google IMA audio-only](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/audio) | Full operative guide61–191 including controls | Actual client audio path; February2026 update, no demand proof |
| P16 | [IMA additional platforms](https://developers.google.com/interactive-media-ads/docs/sdks/other) | Full operative compatibility/disclaimer50–62 | Samsung/LG account-manager/model gap; no universal support |
| P17 | [Cloud CDN signed URLs](https://docs.cloud.google.com/cdn/docs/using-signed-urls) | Overview/security and GCS permissions60–176 | Unsigned/direct-origin closure and private cache-fill identity; signing-code appendix not fully read |
| P18 | [CloudFront S3 OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) | OAC requirements, origin policy and KMS sections5–143 | Private regular bucket, separate viewer authorization; legacy OAI appendix not full read |
| P19 | [Cloud Run public access](https://docs.cloud.google.com/run/docs/authenticating/public) | Public-service methods and org constraint236–392 | Separate public guest backend, private generation; no policy mutation or eligibility proof |
| P20 | [GFE Enterprise pricing](https://cloud.google.com/vpc/network-pricing) | Dedicated tariff953–1019, CDN GiB notes | EU metered bundle+request+forwardingrule calculation, not flat CDN |
| P21 | [GFE Enterprise availability](https://docs.cloud.google.com/docs/networking/cross-cloud-network/global-front-end/gfee-manage) | Preview status and allowlist setup37–119 | Preview/allowlist dependency, not launch default |
| P22 | [AdMob native SSV](https://developers.google.com/admob/android/ssv) | Operative103–136,203–206 and manual signature verification324–374 | Native signed callback evidence, not a web service |
| P23 | [RFC8216](https://www.rfc-editor.org/rfc/rfc8216.html#section-6.3.4) | Status17–24; loading/reloading/variant/decryption rules2363–2511 | VOD versus live model, half-target sensitivity; Informational RFC, not falsely called Internet Standards Track |

P01/P07/P08/P09/P12/P18 share AWS as producer. P02–P06/P10/P11/P13–P17/P19–P22 share Google as producer, despite different product teams. These are **23 parent-opened source documents from two vendors plus the separately authored HLS RFC**. They cannot alone satisfy a 20-independent-authority standard or corroborate a performance winner.

Worker-read supplemental primaries, exact locators, queries and boundaries are indexed in:
- `../implementation/2026-09-12-website-api/streaming-architecture.md`: Channel Assembly/CDN flow, MediaTailor fees, plan service terms/SLA, Armor charges and adversarial pricing review.
- `../implementation/2026-09-12-website-api/ads-auth-platforms.md`: 19 Google/platform primaries on consent, banner, native SSV, initialization/background/preload and SDK limitations.
- `2026-09-12-owned-radio-alternative.md`: maintained implementations, HLS standards, packaging, dependency/licence and actual metadata behavior.
- `2026-09-12-audio-cloud-qoe-evidence.md`: academic full-text sources and five-part records. Captured PDFs/text are under `_sources/2026-09-12-qoe-*`.

A parent link to a worker-read supplemental source is not a claim of parent full reading. The decisive recommendation does not depend on treating those relays as independent proof; vendor-policy and audio/client/security/price load-bearing facts were independently reopened above. Full research closure remains subject to the stated independence and depth audit.

## Claim / decision ledger

| Claim | Type and supporting source | Application | What would change it |
| --- | --- | --- | --- |
| GCP-first core recommended today | Engineering judgment: measured private GCP motor plus P02/P15/P17 | Fewer initial cross-cloud operating boundaries; no cost-leadership claim | Verified existing AWS reuse, operational skill ownership, account constraints or sufficiently large total-cost saving |
| Personalized owned sessions fit the described product | Product inference from owner's generated tracks, player/skip and ads between songs | Persist queue+content assets; client ad boundary, no encoder/listener | Owner explicitly prioritizes a shared-clock live station |
| AWS has stronger documented audio SSAI path | Single-source official P01 versus P05's narrower documented evidence | Investigate AWS when managed server insertion is needed | Pure-audio GCP contract/pilot or AWS exact configuration failure |
| AWS flat delivery can be cheaper | P07–P10 plus model | Keep CDN replaceable, quote actual request/byte footprint | Eligibility, exceeded allowances, geography, uncounted costs, commercial GCP offer |
| Guest usage and private generation are compatible in design | Owner requirement, P17/P19 and proposed backend boundary | Separate public admission from credentialed music API | Effective org ingress policy or measured anti-abuse failure |
| “Login+reward” is not verified web payment evidence | P13/P14, worker native SSV record | Preserve download requirement as open product/security gate | Google-specific eligibility decision and accepted authentic/fraud model |
| Cloud vendor does not establish TV support | P16 plus proposed platform adapters | Named-device integration tests | Actual supported SDK/account/model matrix and measured application |
| Playback cannot promise zero capture | Technical boundary: receiving audio exposes reproducible output | Protect official original export and entitlements truthfully | No claim of impossible-to-record playback is made |

## Contradictions, negative evidence and resolutions

1. **Earlier AWS scope versus owner's choice:** latest explicit user request controls; neither AWS nor GCP is approved.
2. **Managed-radio assumption:** user asked for own streaming/radio, not necessarily synchronized SSAI. Compare the same personalized product on both vendors.
3. **Video versus audio:** explicit audio-only packaging exists; video-stitching audio tracks alone do not verify pure-audio SSAI.
4. **Old AWS tutorial versus current security:** preserve audio feasibility, replace old OAI instruction with current OAC guidance; do not deploy the tutorial blindly.
5. **Flat pricing versus “unlimited”:** fees and performance entitlement differ; sustained excess can alter delivery/plan.
6. **Business versus private origin:** Pro's lack of VPC private origins is not lack of S3 OAC; managed cache policies may suffice. Business is not a fabricated protection prerequisite.
7. **VOD versus live request volume:** correct the initial1200/h-only model; VOD640/h and live1200/1800 are separate explicit scenarios.
8. **GB versus GiB:** Google explicit binary units; CloudFront definition unresolved. Show both interpretations rather than quietly equate.
9. **Rate tables versus examples:** CloudFront page examples have free-request/tier inconsistencies; MediaTailor standard-channel arithmetic text differs from730×0.35; unrelated Google video example has a decimal discrepancy. Do not carry these into audio math.
10. **Origin-transfer marketing versus MediaTailor billing:** retain service-specific delivery fee pending commercial clarification.
11. **Cloud CDN versus Media CDN versus GFE:** three different commercial configurations; GFE Preview/allowlist is not flat/monthly cap.
12. **Rewarded download versus older reward:** current owner wants a file, not extra generation; exact policy application remains unresolved, not substituted.
13. **Web event versus SSV:** account cookies/nonces do not prove Google reward completion; native signed callback does not exist automatically on web.
14. **TV/mobile labels versus actual support:** desktop web/stock Flutter package/historical minimums do not establish native background or Samsung/LG compatibility.
15. **Library stable label versus playout reliability:** current owned-radio slice records rolling HLS/metadata fixes; require pinned dependency and long-run evidence.
16. **Academic score versus user outcome:** model-derived quality labels, controlled clips or another service's ad experiment cannot be presented as our quality or ad-optimal setting.
17. **Connectivity check versus service outage:** sandbox socket denial is not production-down evidence; historical auth DNS/resource notes are not current operational inventory.

## Adoption and verification obligations

ADOPT: server-owned immutable track identity, master/rendition isolation, durable ingest and job budget, vendor-neutral playback sessions, provider-specific short-lived signing, real audio IMA state machine and explicit surface capability adapters.

BUILD AND PROVE: admitted guest generation to stored playable audio without duplicate spend; correct account ownership; ad/no-fill recovery; controlled official master download with disclosed evidence class; actual browser/media/TV/native cases; operational restore and cost telemetry.

AVOID: proxying upstream leases as the product catalogue, silently hiding ordinary video ads as audio inventory, forced login for guest creation/listening, rewarded UI timers treated as signed proof, per-listener always-on transcoding, imaginary advertising revenue, cloud brand “world-first” claims and frontend-only account flags.

## Preservation and standards status

Parent writes only scoped documentation, cost/audit artifacts and the active lane memory. All three accepted website trees remain outside write scope. Workers own only their named research files. Credentials were not printed, imported, deleted or published during this provider research. No cloud/ad/account mutation occurred.

The recommendation is a bounded evidence-backed proposal. Do not label it a completed 20-independent-authority/5-paper frontier dossier until the exact source/depth audit supports that statement. Formal source-independence closure, external platform/account readiness and production validation are distinct gates; none is hidden by a source count or successful file write.
