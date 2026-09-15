# Standards ledger

⚠️ WRITE-CONFLICT NOTICE (rule 13, multi-agent write safety): the two file paths named in SLICE-F.md are being written progressively by a PEER worker (its draft header reads "worker start 12:54:40 +03:00", last write measured 13:00:41 / 13:01:04 +03:00). This worker's first full write to the report path was overwritten by that peer (measured: 5,235 bytes on disk at 13:04:05 instead of this worker's content). To obey rule 13 §3/§5 (never crush another agent's content, never retry over a conflict) this worker's complete deliverables are written to these two sibling files instead; the parent decides which draft survives or merges them. Nothing of the peer's draft was modified by this worker.

- Covenant: `C:\Users\berke\.claude\skills\deep-research\SKILL.md`, COVENANT_SHA256 F19F5CB14319E09EC73FDF42FEEF2D3067EC8A5949A34657ED9E5C1104D5F9EB (given in the brief; read this session: Part I §1–§7, R1, R4–R11, R13, R15, R17, R18). COVENANT ACKNOWLEDGED: yes.
- Law Zero: every load-bearing statement cites a source ID from the companion register `2026-09-03-auth-slice-f-source-register--worker-2.md` that was OPENED this session; `[FULL]`, `[PARTIAL]`, `[ABS]` marks are honest; `[single-source official]` and `[UNVERIFIED]` are attached to the sentence they qualify.
- No-narrowing: SLICE-F.md enumerates 8 scope items; all 8 are answered (F1–F8). Additions are reported as additions (Apple 4.8 → Sign in with Apple; Google's Android custom-scheme withdrawal; NIST 15-character rule vs. the design's 8-character hint; Amazon absent from the Flutter design; `LoginEvent` not `LoginAttempt`; no role column in the schema).
- Owner constraints: no new paid vendor recommended (Ory Hydra self-hosted is Apache-2.0 per S25 `[single-source secondary]`; Ory Network hosted would be a paid vendor — FLAGGED, not recommended; Auth0/Clerk/Supabase flagged as paid vendors). No synthetic data. No project file other than this worker's two output files was modified.
- Licence-lawfulness: flutter_appauth 12.1.0 BSD-3-Clause (S20), flutter_secure_storage 11.0.0 BSD-3-Clause (S22), google_sign_in 7.2.0 BSD-3-Clause (S21); Zitadel AGPL-3.0 and Keycloak Apache-2.0 per S25 `[single-source secondary]`; Auth.js licence NOT opened `[UNVERIFIED]`.
- Path resolution: governed research root `c:\Berk\PlayMusicPrompts\docs\research\` (project convention = R15.1 default).

# Decision served and slice scope

Berk's order (2026-09-02, verbatim, unaltered): "siteye en ileri seviyede ve güvenli olarak user management yani kullanıcı kaydı eklememiz lazım. hem kendi user veritabanımız olsun hem de google ve amazon authentication ı destekleyelim. yani auth.playmusicprompts.com gibi yapıyı kurman lazım. bunların hepsi hem web hem de mobil ve tablet appler için geçerli. google cloud a bağlanabilirsin, orada proje yarat playmusicprompts diye ve altına gerekli aouthenticaion parametrelerini ekle." Approved 2026-09-03 ("başla").

Decision answered: (1) how "our own user database" coexists with Google + Amazon federation; (2) whether `auth.playmusicprompts.com` is a self-run OIDC authorization server or a hosted service; (3) how the Flutter apps sign in and how the anonymous `pmp_anon` visitor is migrated; (4) the exact Google Cloud project and Login with Amazon parameters.

Local intake (files opened from disk this session BEFORE any external call): `deploy/payload/prisma/schema.prisma` (models User/Account/Session/VerificationToken/ApiKey/Project/LoginEvent/AuditLog/MusicJob; NO role field; Account.provider comment "google" | "apple" | "credentials"; `LoginEvent` exists — the slice file's "LoginAttempt" is a misnomer), `deploy/payload/auth.ts` (Auth.js v5: Credentials + Google + Apple gated on env; `session.strategy: "jwt"`; PrismaAdapter; `events.signIn` writes `login_events` with method = provider), `deploy/payload/package.json` (`next-auth ^5.0.0-beta.32`, `@auth/prisma-adapter ^2.11.3`, `bcryptjs ^3.0.3`, `google-auth-library ^11.0.2`, `next 16.3.3`), `deploy/payload/lib/music/owner.ts` (pmp_anon: HttpOnly, SameSite=Lax, Secure in production, path=/, UUID v4 validated by regex, 365-day maxAge), `deploy/payload/lib/music/config.ts` (spend guard 12 takes/hour, 40/day per visitor; secrets from SSM `/playmusicprompts/env-file`), `app/lib/src/features/auth/create_account_screen.dart` (roles verbatim: Producer / Artist / Listener / Filmmaker / Creator; social buttons Google / Apple / Discord — NO Amazon button; hint "At least 8 characters with a number or symbol"), `app/pubspec.yaml` (Dart ^3.12.0; http, just_audio, shared_preferences only).

# Outcome first

1. **`auth.playmusicprompts.com` must be a real OAuth 2.0 / OpenID Connect authorization server that WE run, with the user directory in OUR Postgres 16 (existing Prisma `users`/`accounts` tables), and Google + Amazon brokered server-side by that server.** Recommended shape: Ory Hydra (headless OAuth2/OIDC server) + a Next.js "login & consent app" we own (reusing Auth.js Prisma tables, bcrypt credentials, Google OIDC and a custom Amazon OAuth provider). Ory's doc: Hydra "doesn't contain a database with end users but instead uses HTTP redirection to 'delegate' the login flow to another app" (S17 [FULL]) — exactly the own-DB requirement. Flutter then talks to ONE issuer via RFC 8252 (S01 [FULL]) with flutter_appauth 12.1.0 and OpenID Discovery (S20 [FULL]).
2. **Auth.js/NextAuth alone cannot be `auth.playmusicprompts.com` for mobile**: it is an OAuth *client*/session library (S18, S19 [FULL]) with no `/authorize`, `/token` or discovery document for native apps. Keep it as the login UI + federation broker inside the login app.
3. **Hosted IdPs fail "own user database" as written**: Cognito, Identity Platform/Firebase Auth, Auth0, Clerk, Supabase Auth each keep the directory in the vendor's store (S07–S11 [FULL]/[PARTIAL]); Auth0/Clerk/Supabase are new paid vendors (FLAG). Cognito Essentials $0.015/MAU above 10,000 free (S07 `[single-source official]`); Identity Platform free to 50,000 MAU then $0.0055 (S08 `[single-source official]`). None recommended.
4. **Google's native-app doc (Last updated 2026-08-07, S04 [FULL]): "Custom URI schemes are no longer supported on Android and Chrome apps" and the loopback redirect "is DEPRECATED for Android, Chrome app and iOS OAuth client types".** Direct app→Google OAuth on Android is Credential Manager / Sign in with Google only (S06, S21). Brokering Google through our own AS removes the constraint: Google redirects only to `https://auth.playmusicprompts.com/...` (Web application client, S05 [FULL]); the app's redirect from OUR AS is a claimed `https` App Link / Universal Link, which RFC 8252 §7.2 says native apps "SHOULD use … over the other options where possible" (S01).
5. **ADDITION for Berk's decision — Sign in with Apple becomes mandatory on iOS.** Guideline 4.8 (Last Updated: June 8, 2026, S12 [FULL]) names "Google Sign-In … Login with Amazon" and requires "as an equivalent option another login service" that limits data to name and email, lets users keep their email private, and does not collect interactions for advertising without consent. Schema (`provider: "apple"`), `auth.ts` (Apple provider gated on `AUTH_APPLE_ID/SECRET`) and the Flutter design (Apple button) are already pre-wired.
6. **Account deletion is mandatory on both stores** — Apple 5.1.1(v) (S12); Google Play in-app path + web link + Data safety "Data deletion" questions (S13 [FULL]).
7. **The Flutter design's password hint contradicts NIST SP 800-63B-4** (S14 [PARTIAL] §3.1.1.2): single-factor passwords SHALL be ≥ 15 characters (≥ 8 only within MFA), composition rules SHALL NOT be imposed, blocklist SHALL be checked, no periodic rotation, no hints, ≤ 100 consecutive failures then disable. OWASP ASVS v5 V6.2 agrees (S15 [FULL]).
8. Anonymous-visitor migration: on first successful sign-in with a valid `pmp_anon` cookie present, link `music_jobs.anonId → userId` through a Postgres function (no SQL in code), then clear the cookie; spend guard becomes per-account (same 12/h, 40/day defaults until Berk sets tiers).

# Methodology and query log (exact queries, dates)

All actions 2026-09-03, 11:44–13:04 (UTC+3). Discovery-first (R4.1): four broad scoping searches before any deep URL.

| # | Action | Query / URL | Yield |
| --- | --- | --- | --- |
| Q1 | search | `OAuth 2.0 for native apps RFC 8252 PKCE system browser 2026 best practice mobile authentication architecture` | 5 secondary pages (skycloak, contensu, loginradius, corkhounds) — vocabulary only, not evidence |
| Q2 | search | `self-hosted identity provider comparison 2026 Keycloak Ory Zitadel Authentik Logto SuperTokens Auth.js own user database` | skycloak comparison (S25) + 4 secondary — universe enumeration and version discovery |
| Q3 | search | `Apple App Store Review Guidelines 4.8 Login Services Sign in with Apple third-party login requirement 2026 text` | S12 live + S12b Wayback 2025-04-28 |
| Q4 | search | `Login with Amazon developer documentation security profile web settings allowed return URLs Android iOS SDK 2025` | S23 register-web, S24 authorization-code-grant, S26 LWA website PDF |
| Q5 | fetch | `https://www.rfc-editor.org/rfc/rfc8252.txt` | S01 [FULL] 1052 lines |
| Q6 | fetch | `https://www.rfc-editor.org/rfc/rfc9700.txt` | S02 [FULL] 2553 lines (3 passes) |
| Q7 | fetch | `https://developers.google.com/identity/protocols/oauth2/native-app` | S04 [FULL] "Last updated 2026-08-07 UTC" |
| Q8 | fetch | `https://developers.google.com/identity/gsi/web/guides/verify-google-id-token` | S03 [FULL] "Last updated 2025-12-22 UTC" |
| Q9 | fetch | `https://support.google.com/cloud/answer/13463073` | S05b [FULL] OAuth App Verification |
| Q10 | fetch | `https://support.google.com/googleplay/android-developer/answer/13327111` | S13 [FULL] |
| Q11 | fetch | `https://support.google.com/cloud/answer/15549257` | S05 [FULL] Manage OAuth Clients |
| Q12 | fetch | `https://developers.google.com/identity/android-credential-manager` | S06 [FULL] "Last updated 2024-10-31 UTC" |
| Q13 | fetch | `https://developer.amazon.com/docs/login-with-amazon/security-profile.html` | S27 [FULL] "Last updated: Nov 25, 2020" |
| Q14 | fetch | `https://developer.amazon.com/docs/login-with-amazon/obtain-customer-profile.html` | S28 [FULL] |
| Q15 | fetch | `https://support.google.com/cloud/answer/10311615` | 1st attempt TIMEOUT 12:1x; retry OK → S05c [FULL] |
| Q16 | fetch | `https://developer.amazon.com/docs/login-with-amazon/register-android.html` | S29 [FULL] "Last updated: Dec 20, 2023" |
| Q17 | fetch | `https://developer.amazon.com/docs/login-with-amazon/register-ios.html` | 1st attempt TIMEOUT; retry OK → S30 [FULL] "Last updated: Dec 20, 2023" |
| Q18 | fetch | `https://developer.amazon.com/docs/login-with-amazon/button.html` | S31 [FULL] |
| Q19 | fetch | `https://aws.amazon.com/cognito/pricing/` | S07 [PARTIAL] (tier table is a widget; free-tier text + worked examples read) |
| Q20 | fetch | `https://cloud.google.com/identity-platform/pricing` | S08 [FULL] |
| Q21 | fetch | `https://auth0.com/pricing` | S09 [FULL] |
| Q22 | fetch | `https://clerk.com/pricing` | S10 [FULL] |
| Q23 | fetch | `https://supabase.com/pricing` | S11 [FULL] |
| Q24 | fetch | `https://authjs.dev/getting-started/providers/amazon` | 404 — Auth.js ships NO Amazon provider |
| Q25 | search | `Auth.js next-auth v5 "Login with Amazon" provider custom OAuth provider configuration api.amazon.com/user/profile` | GitHub discussion #11291 (S32 secondary) |
| Q26 | fetch | `https://authjs.dev/getting-started/authentication/oauth` | S18 [FULL] |
| Q27 | fetch | `https://authjs.dev/guides/configuring-oauth-providers` | S19 [FULL] |
| Q28 | fetch | `https://pub.dev/packages/flutter_appauth` | S20 [FULL] v12.1.0 "Published 4 days ago" |
| Q29 | fetch | `https://pub.dev/packages/google_sign_in` | S21 [FULL] v7.2.0 "Published 11 months ago" |
| Q30 | fetch | `https://pub.dev/packages/flutter_secure_storage` | S22 [FULL] v11.0.0 "Published 27 days ago" |
| Q31 | fetch | `https://pages.nist.gov/800-63-4/sp800-63b.html` | S14 [PARTIAL: §2 AAL table, §3.1.1 passwords, §3.2.2 throttling, §3.2.5 phishing resistance, refs] |
| Q32 | fetch | `https://raw.githubusercontent.com/OWASP/ASVS/master/5.0/en/0x15-V6-Authentication.md` | S15 [FULL] |
| Q33 | fetch | `https://www.ory.sh/docs/hydra/guides/custom-ui-oauth2-login-consent` | 404 FAILED LOCATOR (not fabricated; real path found next) |
| Q34 | fetch | `https://www.ory.sh/docs/oauth2-oidc/custom-login-consent/flow` | S17 [FULL] |
| Q35 | fetch | `https://zitadel.com/docs/self-hosting/deploy/overview` | S33 [FULL] |
| Q36 | fetch | `https://passkeys.dev/docs/intro/what-are-passkeys/` | S16 [FULL] "Last Updated: Oct 31, 2025" |
| Q37 | fetch | `https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law` | S34 [PARTIAL: Article 4] |

Saturation: rounds 1–3 (standards, Google, Amazon) yielded every load-bearing fact; round 4 (pricing) the cost table; round 5 (self-hosted officials) 2 primaries + 1 failed locator, confirmation only. Stopped at the CONTEXT-17 45-minute limit with F1–F8 covered; gaps in § Contradictions.

# Universe and coverage ledger

| universe_id | entity/work | why in scope | discovery path | class | included | latest checked | evidence | gaps |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U-STD-1 | RFC 8252 (BCP 212) | native-app OAuth floor | seed → rfc-editor | standard | yes | Oct 2017 | S01 | none |
| U-STD-2 | RFC 9700 (BCP 240) | OAuth Security BCP | seed → rfc-editor | standard | yes | Jan 2025 | S02 | none |
| U-STD-3 | RFC 7636, 9449, 9207, 8414 | cited normatively by S01/S02 | citation chain | standard | via S02 `[ABS]` | — | S02 | not opened directly |
| U-STD-4 | NIST SP 800-63B-4 | password/throttle rules | seed | standard | yes | final (page 2025-08-26) | S14 | full read not completed |
| U-STD-5 | OWASP ASVS v5 V6 | auth checklist | seed | standard | yes | master 2026-09-03 | S15 | V7/V8 not opened |
| U-STD-6 | passkeys.dev / WebAuthn | passkeys | seed | community/standard | partial | 2025-10-31 | S16 | W3C L3 spec not opened |
| U-VEND-1 | Google Identity docs | Google specifics | seed + help center | official | yes | 2026-08-07 | S03–S06 | GIS web JS doc, google_sign_in_android README not opened |
| U-VEND-2 | Login with Amazon docs | Amazon specifics | seed | official | yes | 2023-12-20 | S23–S31 | Türkiye availability NOT FOUND in searched scope |
| U-VEND-3 | Apple App Review Guidelines | 4.8 / 5.1.1(v) | seed | policy | yes | 2026-06-08 | S12, S12b | none |
| U-VEND-4 | Google Play account deletion | store rule | seed | policy | yes | live | S13 | none |
| U-VEND-5 | Cognito, Identity Platform, Auth0, Clerk, Supabase | hosted options + pricing | seed | official pricing | yes | 2026-09-03 | S07–S11 | Cognito table widget |
| U-OSS-1 | Ory Hydra, Zitadel, Keycloak, Authentik, Logto, SuperTokens | self-hosted | Q2 + official | official + secondary | Ory & Zitadel primary; others secondary | live | S17, S33, S25 | Keycloak/Authentik/Logto/SuperTokens officials not opened |
| U-OSS-2 | Auth.js v5 | project dependency | code + authjs.dev | official | yes | live | S18, S19, S32 | Prisma adapter doc not reopened (schema in repo) |
| U-OSS-3 | flutter_appauth, google_sign_in, flutter_secure_storage | Flutter | seed → pub.dev | official | yes | 12.1.0 / 7.2.0 / 11.0.0 | S20–S22 | platform READMEs not opened |
| U-LAW-1 | KVKK Law 6698 | TR data minimisation | seed | law | partial | live | S34 | GDPR text not opened |
| U-ACAD-1 | Fett/Küsters/Schmitz arXiv 1601.01229, 1704.08539; Sun & Beznosov CCS'12; Chen et al. CCS'14; Jannett et al. CCS'22 | OAuth vulnerability studies | S02 references | academic | `[ABS]` via S02 | — | S02 §3, §4.10.3, §4.17 | not opened |

# Source register summary and read-status counts

Register: `2026-09-03-auth-slice-f-source-register--worker-2.md`. Deduplicated provenance families: authoritative independent sources consulted **28**; academic/standards primaries **6** (S01, S02, S14, S15, S16, S34 — standards/regulatory; peer-reviewed papers reached only `[ABS]` via S02); standards `[FULL]` with five-part record **2** (S01, S02); primary/official `[FULL]` **24**; `[PARTIAL]` 3 (S07, S14, S34); `[ABS]` 4 families. Slice floor (≥12 authoritative `[FULL]`; ≥2 standards `[FULL]` with five-part record incl. RFC 8252): MET.

# Findings by subquestion

## F1 — Requirements extraction; what "most advanced and secure" means in 2026 primaries

Atoms from Berk's order → requirements: "kendi user veritabanımız" → directory in our Postgres (mandatory); "google ve amazon authentication" → both federations mandatory; "kullanıcı kaydı" + own DB → email/password registration kept (design has it); "auth.playmusicprompts.com gibi yapı" → dedicated auth host; "hem web hem de mobil ve tablet appler" → one architecture for Next.js web + Flutter Android/iOS/tablet; "en ileri seviyede ve güvenli" → the bar below; "google cloud … proje yarat playmusicprompts … authentication parametreleri" → F3/F8.

2026 primary-source bar:
- PKCE everywhere — RFC 9700 §2.1.1: public clients MUST use PKCE, confidential RECOMMENDED, "Authorization servers MUST support PKCE", S256 only method not exposing the verifier (S02). RFC 8252 §6: "Public native app clients MUST implement … PKCE" (S01).
- Exact redirect-URI matching — RFC 9700 §2.1 (S02); RFC 8252 §8.4 "reject authorization requests that specify a redirect URI that doesn't exactly match" (S01).
- No implicit grant (RFC 9700 §2.1.2), no ROPC ("MUST NOT be used", §2.4) (S02).
- Refresh tokens for public clients "MUST be sender-constrained or use refresh token rotation"; SHOULD expire on inactivity (S02 §2.2.2, §4.14.2).
- Sender-constrained access tokens SHOULD use mTLS or DPoP (S02 §2.2.1); Google's token endpoint already accepts a `DPoP` header and DPoP-binds refresh tokens (S04) — deployable in 2026.
- Mix-up defence REQUIRED when a client talks to >1 AS: `iss` (RFC 9207) or distinct redirect URIs (S02 §2.1, §4.4.2). Our login app talks to Google AND Amazon → applies.
- Passkeys/WebAuthn first-class — NIST 800-63B-4 §3.2.5 names WebAuthn/FIDO2 phishing-resistant via verifier-name binding; AAL2 "Recommended; Must be available", AAL3 "Required" (S14); passkeys.dev (S16); ASVS 6.3.3 MFA at L2 (S15).
- Passwords — NIST §3.1.1.2: ≥15 chars single-factor (≥8 if MFA), max ≥64, no composition rules, no periodic change, no hints/KBA, blocklist, verify full password, salted+hashed approved scheme (S14); ASVS 6.2.1–6.2.12 (S15).
- Throttling — NIST §3.2.2 ≤100 consecutive failures then disable authenticator (S14); ASVS 6.1.1/6.3.1 (S15).
- Session/audit — ASVS 6.3.5/6.3.7/6.3.8 (S15); NIST reauth AAL1 30 days, AAL2 24 h / 1 h inactivity (S14 §2 table).
- Data minimisation — KVKK Art. 4(2)(ç) "relevant, limited and proportionate", (d) storage limited to the required period (S34); Apple 4.8 exemption rewards limiting to name and email (S12). Scopes: Google `openid email profile` (S03/S04), Amazon `profile` (S24).

## F2 — Architecture options and committed recommendation

| Option | Own-DB fit | `auth.` host | Flutter via RFC 8252 (one issuer) | Google + Amazon | Cost (official, 2026-09-03) | Residency | Lock-in / maintenance | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (a) Auth.js v5 inside Next.js at auth.playmusicprompts.com | YES (Prisma tables exist) | yes | NO — client/session library, no `/authorize`, `/token`, discovery (S18, S19) | Google built-in; Amazon via custom `type:"oauth"` with `https://www.amazon.com/ap/oa`, `https://api.amazon.com/auth/o2/token`, `https://api.amazon.com/user/profile` (S19 + S24/S28) | $0 | EC2 eu-central-1 | mobile would need native SDKs + ID-token exchange + bespoke password API | login UI + broker only |
| (b1) Ory Hydra + our Next.js login/consent app | YES by design (S17) | yes | YES — discovery `https://auth.playmusicprompts.com/.well-known/openid-configuration`; flutter_appauth `authorizeAndExchangeCode(... discoveryUrl ...)` (S20) | in OUR login app | $0 self-hosted; Apache-2.0 (S25 `[single-source secondary]`) | EC2; Hydra DB = separate database on same Postgres 16 `[UNVERIFIED]` | one Go service + migrations; Ory Network = NEW PAID VENDOR (flagged) | **RECOMMENDED** |
| (b2) Zitadel | partial — users in Zitadel's own schema in a Postgres we run (S33) | yes | YES | yes | $0; AGPL-3.0 (S25 `[single-source]`) | EC2 | full IdP + console; Prisma `users` becomes mirror | fallback |
| (b3) Keycloak / Authentik / Logto / SuperTokens | vendor-schema directories (S25 secondary) | yes | yes | yes | $0 | EC2 | Keycloak Java/Quarkus heavy (S25); officials NOT opened | not without primary read |
| (c) AWS Cognito + custom domain | NO — Cognito owns the directory | yes | yes (OIDC) | Google yes; LWA as social IdP | Essentials 10,000 MAU free then $0.015; Plus $0.020 no free tier; Lite $0.0055→$0.0046 (S07 `[single-source official]`) | eu-central-1 | AWS pre-approved, but not our DB | rejected on own-DB |
| (d) Google Identity Platform / Firebase Auth | NO — Google owns the directory | Firebase Hosting custom domain `[UNVERIFIED]` | Firebase SDK, not plain OIDC | Google yes; Amazon not in Tier-1 list (Email/Phone/Anonymous/Social) → Tier-2 OIDC/OAuth `[UNVERIFIED]` | 50,000 MAU free then $0.0055/$0.0046/$0.0032/$0.0025; Tier-2 50 free then $0.015 (S08) | us-central1/global | Google pre-approved, but not our DB | rejected on own-DB; GCP project still needed for OAuth clients (F3) |
| (e) Auth0 / Clerk / Supabase Auth | NO | Auth0 1 free w/ card; Clerk on Hobby; Supabase $10/domain/mo | yes | yes | Auth0 Free ≤25,000 MAU, Essentials $35/mo (S09); Clerk Hobby ≤50,000 MRU, Pro $25/mo (S10); Supabase Free 50,000 MAU, Pro $25/mo (S11) | varies | NEW PAID VENDORS | rejected |

Committed recommendation: **(b1)** — the only option satisfying all four hard atoms at once (own DB, `auth.` as a true AS, one RFC 8252 flow, Google + Amazon brokered) while reusing the Auth.js/Prisma investment. Falsifiers in § Recommendation.

## F3 — Google sign-in specifics (quoted from the docs)

- Client types (S05 [FULL]): "Private Clients: … web server applications, can securely store the client secret … Public Clients: Native apps or JavaScript-based apps … do not use client secrets." Web application client needs Authorized JavaScript origins (HTTPS, no path/query/fragment/wildcard) and Authorized redirect URIs (HTTPS, exact, "cannot contain open redirects", no fragment). "It may take 5 minutes to a few hours for changes … to take effect." Android client: "specify your Android app's package name and SHA1 fingerprint" (`keytool -list -v -keystore …`); a production client needs the release-key SHA-1. iOS client: Bundle ID (+ optional App Store ID, Team ID; App Check via App Attest needs Team ID and no wildcard bundle). Client secrets are shown ONCE at creation (feature for clients created after June 2025) and unused clients are auto-deleted after six months (S05).
- Consent screen / branding (S05c [FULL]): App name, User support email, Logo (≤1 MB, 120×120), App Domain links (homepage, privacy policy, terms — "required for all external production apps"), Authorized domains ("Add your Authorized Domains before you add your redirect or origin URIs"), Developer contact. "Your brand must be verified if you want your application logo and application name to be visible"; publish within 7 days of a passed check.
- Verification (S05b [FULL]): "If your app utilizes only non-sensitive scopes, it is not mandatory … to complete the app verification process. However, if you want your app to display an app name and logo … brand-verification." We need only `openid email profile` → non-sensitive → brand verification only.
- Native-app flow (S04 [FULL], 2026-08-07): PKCE S256; authorization endpoint `https://accounts.google.com/o/oauth2/v2/auth`; token endpoint `https://oauth2.googleapis.com/token`; "Custom URI schemes are no longer supported on Android and Chrome apps"; loopback "DEPRECATED for Android, Chrome app and iOS"; `disallowed_useragent` error for WKWebView; refresh tokens always returned for installed apps; revoke at `https://oauth2.googleapis.com/revoke`; DPoP optional and recommended.
- Android (S06 [FULL]): "Sign in with Google is now built into Credential Manager" (replaces Smart Lock and One Tap). Flutter: google_sign_in 7.2.0 `initialize(clientId, serverClientId)`, `attemptLightweightAuthentication()`, `authenticate()`; web must render the SDK button (S21 [FULL]).
- ID-token validation (S03 [FULL], 2025-12-22): verify signature with Google JWKS (rotate per `Cache-Control`), `aud` = one of our client IDs, `iss` = `accounts.google.com` or `https://accounts.google.com`, `exp` not passed; "Only use Google ID token `sub` field as identifier"; Node: `google-auth-library` `verifyIdToken` (already in package.json ^11.0.2). GIS web POSTs `credential` + `g_csrf_token` double-submit cookie.
- Redirects for our design: Web application client with Authorized redirect URI `https://auth.playmusicprompts.com/api/auth/callback/google` (Auth.js default `basePath` `/api/auth`, callback `/callback/{id}`, S19) and JavaScript origin `https://auth.playmusicprompts.com`; Android/iOS Google clients are needed ONLY if the apps use google_sign_in natively (fallback path) — in the recommended brokered design they are optional.

## F4 — Login with Amazon specifics (quoted)

- Security Profile (S27, S29, S30 [FULL]): "you must have a security profile assigned to the website or app, and that security profile must be enabled for Login with Amazon"; required Consent Privacy Notice URL; optional logo (≤50 px high). Client identifier ≤100 bytes, client secret ≤64 bytes; "the Authorization Code Grant requires both the client identifier and client secret" (S27).
- Web Settings (S23/S26 [FULL]): "you must specify either Allowed Origins or Allowed Return URLs"; Allowed Origins HTTPS origin only (popup/JS SDK); Allowed Return URLs = full redirect URI incl. path (redirect flow). Ours: Allowed Return URL `https://auth.playmusicprompts.com/api/auth/callback/amazon`; Allowed Origin `https://auth.playmusicprompts.com`.
- Auth code grant (S24 [FULL]): authorize `https://www.amazon.com/ap/oa`, token `https://api.amazon.com/auth/o2/token`; `scope` MUST be `profile`, `profile:user_id`, `postal_code` or a combination; browser-only apps must use PKCE (`options.pkce = true`) and then get no refresh token — server-side code exchange recommended.
- Token verification + profile (S28 [FULL]): `GET https://api.amazon.com/auth/o2/tokeninfo?access_token=…` and check `aud` == our client ID; then `GET https://api.amazon.com/user/profile` with `Authorization: Bearer` → `user_id`, `email`, `name`, `postal_code`. Errors 400 `invalid_token`, 401 `insufficient_scope`.
- Android (S29): package name + MD5 and SHA-256 signatures → API key (one per signing key/version). iOS (S30): Bundle ID → API key. Both only needed for the native LWA SDK path; in the brokered design Amazon sees only our web client.
- Button rules (S31 [FULL]): use Amazon-supplied button assets (Android hdpi–xxhdpi; iOS 32dp/44dp; web sizes 156×32 … 390×92, load from Amazon's HTTPS servers); localized packs exist for zh/fr/de/ja/it/pt/es — NO Turkish pack listed.
- Türkiye availability: NOT FOUND IN THE SEARCHED SCOPE — no official LWA page listing supported customer marketplaces was located this session `[UNVERIFIED]`.
- Auth.js has no Amazon provider (Q24 404; S18 index) → custom provider object per S19; the community example (S32) uses the same three endpoints and maps `CustomerId`/`Name`/`PrimaryEmail` (JS-SDK field names) — the REST `user/profile` returns `user_id`/`name`/`email` (S28), so the `profile()` mapper must use the REST names.

## F5 — Flutter mobile OIDC, storage, store rules

- RFC 8252 (S01 [FULL]): external user-agent MANDATORY (§5, §8.12 "MUST NOT use embedded user-agents"); in-app browser tabs RECOMMENDED (§6; iOS `SFAuthenticationSession`/successor, Android Custom Tabs, App. B); redirect options: private-use scheme (reverse-DNS, §7.1), claimed `https` (§7.2 — SHOULD prefer; iOS Universal Links, Android App Links), loopback (desktop); PKCE MUST (§6, §8.1); exact redirect registration (§8.4); `state` high-entropy (§8.9); per-AS distinct redirect URI and check (§8.10); Appendix A server checklist (support all three redirect types, public clients, PKCE).
- flutter_appauth 12.1.0 (S20 [FULL]): `authorizeAndExchangeCode(AuthorizationTokenRequest(clientId, redirectUrl, discoveryUrl|issuer, scopes))`, `token(refreshToken…)`, `endSession(idTokenHint, postLogoutRedirectUrl)`, `preferEphemeralSession` (iOS/macOS), `FlutterAppAuthUserCancelledException`; Android `appAuthRedirectScheme` manifest placeholder or explicit `RedirectUriReceiverActivity` intent-filter with `android:scheme`/`android:host` (App Links `https` possible via the same intent-filter); iOS `CFBundleURLTypes`; warns that iOS `cache.db` may hold tokens.
- flutter_secure_storage 11.0.0 (S22 [FULL]): Keychain on iOS/macOS; Android RSA-OAEP + AES-GCM default, optional biometric KeyStore mode, min SDK 23; disable Android auto-backup (`android:allowBackup="false"`); iOS `keychain-access-groups` entitlement required.
- google_sign_in 7.2.0 (S21 [FULL]) only if native Google is used (Android SDK 21+, iOS 12+).
- Apple 5.1.1(v) (S12 [FULL], 2026-06-08): "If your app supports account creation, you must also offer account deletion within the app … must provide access without a login … must also include a mechanism to revoke social network credentials … may not store credentials or tokens to social networks off of the device". Apple 4.8 (S12): third-party login (Google, Login with Amazon named) → "must also offer as an equivalent option another login service" meeting the three bullets; exemptions do not fit us ("exclusively uses your company's own account setup" fails because Google/Amazon are offered). → ADDITION: Sign in with Apple on iOS (Berk's decision).
- Google Play (S13 [FULL]): "provide users with an in-app path to delete their app accounts and associated data; and provide a web link resource"; Data safety form deletion questions; non-mobile surfaces may link out.

## F6 — Data model and migration for THIS project

- Keep Prisma `User`/`Account`/`Session`/`VerificationToken` (adapter contract, schema read). Add: `User.role` enum {PRODUCER, ARTIST, LISTENER, FILMMAKER, CREATOR} (names verbatim from `create_account_screen.dart`); `Account.provider` values `google` | `amazon` | `apple` | `credentials` (schema comment currently lacks `amazon`); `User.passwordUpdatedAt`; `User.deletedAt` + deletion job (store rules); passkey table `WebAuthnCredential(credentialId, publicKey, counter, transports, userId)` when passkeys land.
- Hydra state (clients, consent sessions, JWKs) lives in Hydra's own database — recommended as a second database on the same Postgres 16 instance `[UNVERIFIED: Hydra's DB requirements doc not opened]`.
- Anonymous linking: DB function `fn_link_anonymous_jobs(p_anon_id uuid, p_user_id text)` → `UPDATE music_jobs SET "userId"=p_user_id, "anonId"=NULL WHERE "anonId"=p_anon_id AND "userId" IS NULL`, called from the login app's post-sign-in hook ONLY when the request carries the HttpOnly `pmp_anon` cookie (owner.ts regex-validated), then `Set-Cookie: pmp_anon=; Max-Age=0`. Spend guard: count per `userId` when signed in (same 12/h, 40/day defaults in `config.ts`) — tiering is Berk's decision.
- Email verification: keep `VerificationToken`; NIST §3.1.1.2 password rules (15 chars, blocklist, no composition, no rotation) replace the design's hint text; `LoginEvent` (not `LoginAttempt`) already records `method`, `ipAddress`, `userAgent`; add failure rows and a per-account consecutive-failure counter (NIST ≤100).

## F7 — Security controls checklist (RFC 9700 + ASVS v5 + NIST)

| Control | Requirement (source) | Where |
| --- | --- | --- |
| PKCE S256 for every client; reject downgrade | RFC 9700 §2.1.1, §4.8.2 (S02) | Hydra config; flutter_appauth default |
| Exact redirect-URI match; no open redirectors | RFC 9700 §2.1, §4.11 (S02); Google S05 | Hydra client registry; login app |
| `state` + OIDC `nonce`, validated; state invalidated after use | RFC 9700 §4.7.1, §4.2.4 (S02); RFC 8252 §8.9 (S01) | Auth.js providers (Google, Amazon) |
| Mix-up defence (`iss`/RFC 9207 or distinct redirect URIs) | RFC 9700 §2.1, §4.4.2 (S02) | login app: `/callback/google` vs `/callback/amazon` |
| Refresh-token rotation or sender-constraint; inactivity expiry | RFC 9700 §4.14.2 (S02) | Hydra `[UNVERIFIED: Hydra rotation config not opened]` |
| Access tokens audience-restricted; short-lived | RFC 9700 §2.3 (S02) | Hydra `aud` for `api.playmusicprompts.com`/Next.js API |
| No 307 on credential POST; use 303 | RFC 9700 §4.12 (S02) | login app |
| Anti-clickjacking CSP `frame-ancestors`, `X-Frame-Options` | RFC 9700 §4.16 (S02) | CloudFront/Next.js headers |
| Referrer-Policy no-referrer on auth pages | RFC 9700 §4.2.4 (S02) | Next.js headers |
| Reverse proxy sanitises `X-Forwarded-*` | RFC 9700 §4.13 (S02) | CloudFront → EC2 |
| Cookie attributes HttpOnly/Secure/SameSite | existing owner.ts pattern; ASVS session (not opened) | session cookies |
| Password policy (≥15, blocklist, no composition, no rotation, full verify) | NIST §3.1.1.2 (S14); ASVS 6.2.x (S15) | registration + change |
| Salted adaptive hash (bcrypt in use; cost as high as practical) | NIST §3.1.1.2 (S14) | `bcryptjs` |
| ≤100 consecutive failures → disable + rebind | NIST §3.2.2 (S14); ASVS 6.3.1 (S15) | LoginEvent counter |
| No user enumeration | ASVS 6.3.8 (S15) | uniform errors/timing |
| Notify on credential change / suspicious login | ASVS 6.3.5, 6.3.7 (S15) | email via existing SES/SMTP `[UNVERIFIED which]` |
| Federated identity keyed by (provider, providerAccountId) | ASVS 6.8.1 (S15); Google "sub" only (S03) | Account @@unique already present |
| Verify assertion signatures always | ASVS 6.8.2 (S15); S03 | Auth.js/jose + google-auth-library |
| Secrets only in SSM Parameter Store | project config.ts pattern; Google S05 "never … in code" | `/playmusicprompts/env-file` |
| Logging without PII | KVKK Art. 4 (S34) | LoginEvent stores IP/UA only; no tokens |

## F8 — Recommendation for this slice: exact parameters and steps

**Architecture (b1):** `auth.playmusicprompts.com` = Ory Hydra public endpoints (`/oauth2/auth`, `/oauth2/token`, `/.well-known/openid-configuration`, `/userinfo`, `/oauth2/sessions/logout`) + our Next.js login/consent app at the same host (login endpoint `/oauth2-login?login_challenge=…`, consent `/oauth2-consent?consent_challenge=…` per S17) that (i) verifies email+password against `users.passwordHash`, (ii) brokers Google (Auth.js Google provider, OIDC, `sub` as key) and Amazon (custom OAuth provider: `/ap/oa`, `/auth/o2/token`, `/user/profile`, `aud` check via `tokeninfo`), (iii) accepts the Hydra login challenge with `subject = users.id`, (iv) links `pmp_anon` jobs, (v) writes `login_events`. Web (www.playmusicprompts.com) is a confidential OIDC client of Hydra; Flutter is a public client with PKCE.

**Google Cloud project checklist (parent executes; values from S05/S05b/S05c/S03/S04):**
1. `gcloud projects create playmusicprompts --name="PlayMusicPrompts"` (project id "playmusicprompts" as Berk ordered; if taken, Berk chooses the suffix).
2. Google Auth Platform → Branding: App name "PlayMusicPrompts"; support email (Berk's Google account); logo 120×120 ≤1 MB; homepage `https://www.playmusicprompts.com/`; privacy `https://www.playmusicprompts.com/privacy`; terms `https://www.playmusicprompts.com/terms`; Authorized domain `playmusicprompts.com` (verify in Search Console) — add BEFORE redirect URIs (S05c).
3. Audience: User type External; Publishing status Production; scopes `openid`, `email`, `profile` only (non-sensitive → no scope verification; brand verification for name/logo, S05b).
4. Clients (S05): (a) Web application "pmp-auth-web": Authorized JavaScript origins `https://auth.playmusicprompts.com`; Authorized redirect URIs `https://auth.playmusicprompts.com/api/auth/callback/google`; download the secret ONCE → SSM `/playmusicprompts/env-file` as `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` (names already used in auth.ts). (b) OPTIONAL fallback only: Android client (package name + release SHA-1) and iOS client (bundle id, Team ID, App Check) — not needed in the brokered design.
5. Verify the ID token server-side with `google-auth-library` `verifyIdToken({audience: WEB_CLIENT_ID})` (S03); key users by `sub`.
6. Keep the client used ≥ once per 6 months or it auto-deletes (S05).

**Login with Amazon checklist (S27, S23/S26, S24, S28):** developer.amazon.com → Login with Amazon console → Create Security Profile "PlayMusicPrompts" (Consent Privacy Notice URL `https://www.playmusicprompts.com/privacy`, logo ≤50 px high) → Web Settings: Allowed Origins `https://auth.playmusicprompts.com`; Allowed Return URLs `https://auth.playmusicprompts.com/api/auth/callback/amazon` → copy Client ID/Secret → SSM as `AUTH_AMAZON_ID`/`AUTH_AMAZON_SECRET` → scope `profile` → verify `tokeninfo.aud`. Android/iOS API keys only if the native LWA SDK is ever used. Use Amazon's button assets (S31).

**auth.playmusicprompts.com DNS/TLS:** Squarespace DNS (Berk's) CNAME `auth` → CloudFront distribution; ACM certificate in us-east-1 covering `auth.playmusicprompts.com` (CloudFront requirement — `[UNVERIFIED this session; project infra fact]`); origin = EC2 Next.js/Hydra; CloudFront behaviours must forward `Authorization` header, cookies and query strings for `/oauth2/*`, `/api/auth/*`, `/.well-known/*`; 30 s origin timeout is fine (auth requests are short). Hydra `urls.self.issuer = https://auth.playmusicprompts.com`.

**Flutter (S01, S20, S22):** `flutter_appauth ^12.1.0` + `flutter_secure_storage ^11.0.0`; `issuer: https://auth.playmusicprompts.com`; redirect `https://auth.playmusicprompts.com/app/callback` as Android App Link (assetlinks.json) + iOS Universal Link (apple-app-site-association) per RFC 8252 §7.2; fallback private-use scheme `com.playmusicprompts.app:/oauth2redirect` (reverse-DNS, period required, §7.1); scopes `openid profile email offline_access`; store tokens in secure storage; `endSession` on sign-out; in-app "Delete account" (Apple 5.1.1(v), Play).

**Paid-vendor flags:** Ory Network (hosted Hydra) — paid, NOT proposed; Auth0, Clerk, Supabase — paid, rejected; Apple Developer Program is already required for iOS (existing). Sign in with Apple — Berk's decision (mandatory under 4.8 if Google/Amazon ship on iOS).

## Five-part academic and technical records (each [FULL] primary)

**S01 — RFC 8252 "OAuth 2.0 for Native Apps", Denniss (Google) & Bradley (Ping Identity), BCP 212, October 2017 [FULL].**
1. Problem (authors' framing): native apps used embedded user-agents (web-views) for OAuth, letting "the host app … copy user credentials and cookies" and forcing re-authentication per app (§4); OAuth servers assuming confidential web clients must learn public native clients and their redirect types.
2. Method: use an external user-agent (browser / in-app browser tab) for the authorization request (§5–§6); three redirect mechanisms — private-use URI scheme (reverse DNS, single slash, §7.1), claimed `https` URI (§7.2, preferred), loopback `http://127.0.0.1:{port}` (§7.3); PKCE mandatory for public native clients (§6, §8.1); server checklist Appendix A (support all three redirect types, treat app secrets as public, PKCE); platform notes Appendix B (iOS SFAuthenticationSession/Universal Links; Android Custom Tabs/App Links).
3. Quantitative results: none — a BCP without empirical tables; normative counts: MUST/MUST NOT clauses in §6 (PKCE), §7 (three redirect options), §8.4 (exact match, client type recorded), §8.10 (per-AS redirect URI), §8.12 (no embedded UA).
4. Stated limitations: "code interception by a different native app running on the same device may be possible" (§8.1); loopback interception on some OSes; claimed-https redirect dispatched by OS with "unknown security properties"; Appendix B "will likely change over time".
5. Application here: the Flutter apps use flutter_appauth (AppAuth pattern named in §1) against OUR issuer; claimed `https` App Links/Universal Links as primary redirect, reverse-DNS scheme as fallback; Hydra must satisfy Appendix A; distinct redirect path per provider in the login app satisfies §8.10.

**S02 — RFC 9700 "Best Current Practice for OAuth 2.0 Security", Lodderstedt, Bradley, Labunets, Fett, BCP 240, January 2025 [FULL].**
1. Problem: continued exploitation of known OAuth anti-patterns, higher-assurance deployments (open banking, eHealth), dynamic multi-AS setups and browser changes (fragment handling) invalidated parts of RFC 6749/6750/6819 (§1).
2. Method: §2 best practices (exact redirect matching, no open redirectors, CSRF via PKCE/nonce/state, mix-up defence via `iss`, PKCE for all public clients and servers, implicit grant discouraged, sender-constrained tokens via mTLS/DPoP, refresh-token rotation or sender-constraint, audience restriction, ROPC MUST NOT, asymmetric client auth, AS metadata); §3 attacker model A1–A5; §4 seventeen attack classes with countermeasures (redirect validation, referer/history leakage, mix-up, code injection, token injection, CSRF, PKCE downgrade, RS leakage, stolen tokens, open redirection, 307, TLS proxies, refresh tokens, client impersonating RO, clickjacking, in-browser messaging).
3. Quantitative results: none (normative BCP); it cites empirical studies — Sun & Beznosov CCS'12 and Chen et al. CCS'14 — as evidence that "a large portion of client implementations do not or fail to properly implement security controls, like state checks" (§4.10.3).
4. Stated limitations: "following the best practices … may break interoperability" (§1); PKCE/nonce can be circumvented if the attacker can modify the victim's request values (§4.5.4); sender-constrained tokens are undermined when key material leaks (§4.10.1); some deployments cannot use sender-constraining for "architecture and performance reasons" (§4.10).
5. Application here: Hydra config (PKCE mandatory, exact redirects, rotation), login app (state/nonce, `iss` or distinct callbacks for Google vs Amazon, 303 not 307, CSP frame-ancestors, Referrer-Policy), CloudFront header sanitisation, audience-restricted access tokens for the Next.js API; DPoP as a follow-on (Google already supports it, S04).

**S14 — NIST SP 800-63B-4 [PARTIAL]** and **S15 — OWASP ASVS v5 V6 [FULL]**: adapted records are embedded in F1/F7 (problem = authenticator assurance; mechanism = SHALL clauses; numbers = 15/8/64 chars, 100 failures, AAL reauth 30 d/24 h/1 h; limitations = federal framing (NIST) and "does not attempt to comprehensively cover every point" (ASVS §intro); application = password/throttle/notification controls above).

## Companies / APIs / repositories

Google Identity (S03–S06), Amazon LWA (S23–S31), Apple (S12), Google Play (S13), AWS Cognito (S07), Google Identity Platform (S08), Auth0 (S09), Clerk (S10), Supabase (S11), Ory (S17), Zitadel (S33), Auth.js (S18, S19, S32), pub.dev packages (S20–S22). Keycloak, Authentik, Logto, SuperTokens: secondary only (S25) — versions quoted there (Keycloak 26.7.0 Jul 2026; Zitadel v4.16.1 Jul 2026; Ory v26.2.0 Mar 2026; SuperTokens core v12.0.7 Jul 2026) are `[single-source secondary, UNVERIFIED]`.

## Hidden and contrary evidence

- Contrary to "just use Auth.js": Auth.js's own docs describe it as consuming providers, and its custom-provider guide tells you to register YOUR callback at the provider (S19) — it never issues tokens to third-party native clients.
- Contrary to "native Google SDK on Android is optional": Google withdrew custom-scheme and loopback redirects for Android (S04) — a pure-OAuth Android client against Google is no longer supported; only Credential Manager or brokering.
- Contrary to the 2024 community example (S32): its `profile()` mapper uses JS-SDK field names (`CustomerId`, `PrimaryEmail`) that the REST profile endpoint does not return (S28 shows `user_id`, `email`, `name`).
- Wayback 2025-04-28 Apple text (S12b) vs live 2026-06-08 (S12): "Sign in with Twitter" → "Log in with X"; the three-feature test and the exemption list are otherwise unchanged — the requirement is stable across at least 17 months.
- Cognito's pre-2024-11-22 50,000-MAU free tier no longer applies to new pools (10,000 free on Lite/Essentials; none on Plus) (S07).

# Claim cross-verification ledger

| claim_id | claim | sources (independent) | status |
| --- | --- | --- | --- |
| C1 | Native apps must use external user-agent + PKCE; embedded web-views forbidden | S01 §5/§6/§8.12; S02 §2.1.1; S04 `disallowed_useragent` | 3+ VERIFIED |
| C2 | Exact redirect-URI matching is mandatory | S01 §8.4; S02 §2.1/§4.1.3; S05 (`redirect_uri_mismatch`) | 3+ VERIFIED |
| C3 | Public-client refresh tokens need rotation or sender-constraint | S02 §2.2.2/§4.14.2; S04 (DPoP-bound refresh tokens); S15 (6.5.6 revocation, indirect) | 2 strong + 1 indirect → VERIFIED (S02 is the normative authority) |
| C4 | Google no longer supports custom-scheme redirects on Android; loopback deprecated on mobile | S04 (2026-08-07) | `[single-source official]` |
| C5 | Google requires only brand verification for non-sensitive scopes | S05b; S05c | 2 official pages, same publisher → `[single-source official family]` |
| C6 | Apple 4.8 requires an equivalent privacy-preserving login when Google/Amazon login is offered | S12 (2026-06-08); S12b (2025-04-28 archive); Q3 secondary confirmations | 3 VERIFIED |
| C7 | Account deletion is mandatory when account creation is offered | S12 5.1.1(v); S13 Google Play | 2 independent platforms → VERIFIED for both stores |
| C8 | Passwords: ≥15 chars single-factor, no composition rules, blocklist, no rotation | S14; S15 (8 min, 15 strongly recommended, 6.2.5, 6.2.10, 6.2.12) | 2 independent → VERIFIED (ASVS derives from NIST; independence partial) |
| C9 | Ory Hydra has no user database and delegates login to your app | S17 (official) | `[single-source official]` |
| C10 | Auth.js has no built-in Amazon provider | Q24 404; S18 provider index; S32 community workaround | 3 VERIFIED |
| C11 | LWA endpoints/scopes/verification | S24; S28; S26 (PDF, same publisher) | `[single-source official family]` |
| C12 | Hosted IdP prices | S07, S08, S09, S10, S11 (each its own publisher) | each `[single-source official]` |
| C13 | flutter_appauth 12.1.0 / google_sign_in 7.2.0 / flutter_secure_storage 11.0.0 current versions | S20, S21, S22 | each `[single-source official]` |
| C14 | Keycloak/Zitadel/Ory licences and versions | S25 only | `[single-source secondary]` |
| C15 | LWA availability in Türkiye | none found | `[UNVERIFIED]` |

Counts: 3+-verified 6 (C1, C2, C3, C6, C7, C10); single-source 8 (C4, C5, C8*, C9, C11, C12, C13, C14 — *C8 counted single-family because ASVS derives from NIST); unverified 1 (C15).

# Contradictions, corrections, uncertainty, gaps

- Slice file says "LoginAttempt table exists" — the schema has `LoginEvent` (`login_events`). Corrected.
- Slice file lists roles "in the app designs" — confirmed verbatim from the Dart source; the schema has NO role column (gap to add).
- Flutter design offers Google / Apple / Discord, NOT Amazon — Berk's order adds Amazon; Discord is not in his order (report, do not build unless he says so).
- Design hint "At least 8 characters with a number or symbol" vs NIST/ASVS (C8) — contradiction; NIST governs.
- Google S04 says custom URI schemes unsupported on Android, yet flutter_appauth's Android setup documents a custom scheme (S20) — no conflict: the scheme is for OUR issuer, not Google's.
- `[UNVERIFIED]`: Hydra's database requirements and refresh-token rotation configuration (Hydra reference docs not opened); Ory Network pricing; Firebase custom-domain mechanics; CloudFront/ACM us-east-1 requirement (project infra fact, not re-read); LWA Türkiye availability; Auth.js licence; Keycloak/Zitadel/Logto/SuperTokens official docs.
- Not read in full: NIST SP 800-63B-4 (250 KB; sections cited were read), Cognito per-MAU widget table, KVKK full text.
- Access failures: 2 transient timeouts (Google 10311615, LWA register-ios) resolved on retry; 2 dead locators (authjs Amazon provider — genuine absence; ory hydra guide path — moved).

# Synthesis — adopt / build / avoid for PlayMusicPrompts

- ADOPT: RFC 8252 + RFC 9700 as the normative design; Ory Hydra as the OAuth2/OIDC core at `auth.playmusicprompts.com`; Auth.js v5 + Prisma as the login/consent app and federation broker; flutter_appauth + flutter_secure_storage; Google Web application client + brand verification; LWA Security Profile with web settings; NIST 800-63B-4 password/throttle policy; store-mandated account deletion.
- BUILD: login/consent endpoints (S17 pattern), custom Amazon provider mapper (REST field names), `fn_link_anonymous_jobs`, per-account spend guard, `User.role`, deletion flow + web deletion page, LoginEvent failure counter, passkey registration (WebAuthn) as the "most advanced" second phase, DPoP as third phase.
- AVOID: Auth.js as the mobile authorization server; hosted directories (Cognito, Identity Platform, Auth0, Clerk, Supabase) for the primary directory; embedded web-views; implicit grant; ROPC/password-over-API for mobile; composition rules and forced rotation; storing provider tokens off-device beyond what account linking needs (Apple 5.1.1(v)).

# Recommendation for this slice with falsifiers

Recommendation: build (b1). Falsifiers (any one flips the choice to (b2) Zitadel or to a self-written OIDC provider inside Next.js): (F-a) Hydra cannot be configured for refresh-token rotation or inactivity expiry per RFC 9700 §4.14.2 — check Hydra reference before coding; (F-b) Hydra's database requirement conflicts with the single Postgres 16 instance (needs its own cluster/version) — check; (F-c) Berk rejects running a second service on the EC2 host — then (b2) or in-process provider; (F-d) Berk rejects Sign in with Apple — then Google/Amazon may not ship in the iOS app (4.8), web only; (F-e) Berk wants Discord (present in the design) — add as another Auth.js provider, no architecture change.

# Sources (complete citations, stable locators, access dates)

Complete register with URLs, titles, dates, first-200-character quotes and SHA-256 of captured text: `c:\Berk\PlayMusicPrompts\docs\research\2026-09-03-auth-slice-f-source-register--worker-2.md`.

