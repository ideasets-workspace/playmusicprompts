# PlayMusicPrompts — EC2 direction

## Owner decision

Latest instruction, 2026-09-12: "maliyet önemli değil. bu projenin aws de bir ec2 su olacak".

AWS EC2 is now a required part of this project. Cost is not a criterion for limiting architecture quality. Prioritize audible continuity, security, reliability, global delivery and the accepted product experience. The earlier GCP-first recommendation is historical and must not remain the active application-hosting direction. There is no longer a blanket requirement to wait for an AWS-versus-GCP choice before designing the EC2 application.

This instruction does not specify an instance type, region, exact instance count, existing resource ID, storage/CDN/database product or immediate cloud provisioning. These remain design/operational details. It does not request moving the existing Google Cloud music-generation engine.

## Proposed allocation of responsibilities

| Component | Proposed role | Decision status |
| --- | --- | --- |
| AWS EC2 | Website backend, guest/account admission, durable job coordination, owned playback sessions and playlist/download authorization; media workers isolated from the public application | EC2 participation is owner-decided; this role allocation is the implementation proposal |
| Private S3 storage | Retained original masters/takes and validated listening renditions, with distinct access boundaries | Recommended; no bucket created or existing bucket assumed ready |
| CloudFront | Global delivery of the owned listening assets, with scoped playback access and private origin | Recommended; exact distribution/cache/signing configuration requires verification |
| Durable database and queue | Account ownership, generation/idempotency ledger, catalogue, radio/session state, playlists and reward evidence | Required responsibilities; deployment product/topology still to be specified |
| Existing Google Cloud music API | Private upstream generation reached only by the backend/worker with the established identity plus API key | Existing integration boundary retained; no migration instruction |
| Google ad adapters | Real audio breaks between songs, discreet web banner and a policy-eligible download reward with an explicit evidence model | Product requirement retained; publisher and reward prerequisites remain open |

The EC2 application orchestrates the experience; CDN delivery and durable media storage can be separate. Temporary EC2 work files are not the only authoritative music archive. The phrase "an EC2" is not interpreted as a prohibition on replicas, separate workers or failover if required for verified reliability. A single instance has not been assessed as sufficient for the global availability target.

## Product and security requirements retained

- Guest listening and generation; login for playlist ownership and official downloads; downloads additionally require the owner's rewarded-ad flow.
- Copy actual generated outputs into owned storage, verify bytes/media metadata, then publish. Retry ingestion or packaging without resubmitting paid generation.
- Keep upstream credentials and service identity server-side; isolate original masters from listening access; enforce account ownership in the backend.
- Existing API quotas and the bounded verification-generation allowance are unchanged. Removing cost as a selection criterion is not permission for unlimited requests or cloud purchases.
- Google downloadable-reward eligibility and absence of Google web reward SSV remain unresolved requirements, not fabricated completed integrations or substituted rewards.
- Web is the current deliverable; native phone/tablet and Samsung/LG/other TV clients share service contracts but require their own media, ad, background and input verification.
- Preserve all three accepted website/player trees. Continue implementation in the independent website directory; keep current deployment/secret-handling boundaries.

## Next implementation action

Continue API contract and existing-source reconciliation against this EC2 target. Establish the actual EC2 environment and deployable application contract through permitted read-only evidence; do not assume that historical AWS resource IDs are the new target. Implement and verify the local server/application and owned-media interfaces before any requested deployment. Instance sizing, availability topology and origin placement must follow actual workloads and failure tests rather than a low-price target.

This document records the owner's direction and a responsibility proposal. It does not claim that an EC2 was created, that the media pipeline operates, or that any production security, advertising or device acceptance gate has passed. Earlier research prices and source captures remain historical evidence, not the current selection rationale.

Relevant official contracts re-opened for the proposed access boundary: [private S3 origin through CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) and [EC2 workload IAM roles](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html). These support implementation mechanisms, not account readiness or a deployed configuration.
