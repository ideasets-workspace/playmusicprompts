# Website accounts — sign in / sign up / reset / change / delete (2026-09-15)

Owner order (2026-09-15 10:30, verbatim): "login i de tamamla sign in sign up herşey eksizsiz tamamlanmalı." Approved 11:10 ("başla").
Standing answer to every quality question (D-PMP-17): most advanced level, deepest detail, 10x ahead.

## What was measured before building

- `website/public/login.html` advertised Google / Amazon / Apple and an e-mail form, but nothing worked: the provider,
  sign-up and reset actions opened a "not connected yet" notice (`connected.js` 353), the form had no submit handler,
  `server/identity.mjs` supported one OIDC issuer and none was configured (`config.oidc` null → 503).
- The EC2 host `i-0c52f530769d1ac88` runs **Ory Hydra** (`hydra.service`, loopback 4444/4445) for `auth.playmusicprompts.com`,
  but that hostname has no DNS record and its ACM certificate is `VALIDATION_TIMED_OUT` (measured 2026-09-15). Hydra's
  login/consent UI lived in the deleted Next.js app. Hydra is therefore unreachable publicly today and is NOT used for
  the web sign-in; it stays for the Flutter app's OIDC once DNS/cert exist and this account system can act as its
  login/consent provider (not built in this pass — it would be unverifiable).
- Amazon SES: zero identities in the account (eu-central-1 and us-east-1); `playmusicprompts.com` DNS is at Squarespace.

## Design (primary sources on disk, read this session)

| Concern | Decision | Source |
|---|---|---|
| Password rules | min 15 code points, max 128, no composition rules, no rotation, blocklist of 15+-char leaked passwords + service name + own e-mail, reason shown | NIST SP 800-63B-4 §3.1.1.2 — `docs/research/_sources/2026-09-15-accounts/nist-sp800-63b-4.html` |
| Blocklist | SecLists xato-net 1M → 10,899 unique entries of 15+ chars, MIT | `website/server/data/password-blocklist-PROVENANCE.txt` |
| Hashing | scrypt N=2^17, r=8, p=1, 32-byte key, 16-byte salt, maxmem 256 MiB, self-describing hash string, transparent rehash | OWASP Password Storage Cheat Sheet; Node v24 `crypto.scrypt` docs (same folder) |
| E-mail | Amazon SES API v2 `SendEmail` (Simple content); private on-disk outbox transport in development; production refuses to start without `PMP_MAIL_FROM` | `docs/external-api/aws-sesv2/README.md` |
| Throttles | 30 sign-ins / IP / 15 min, 10 / account / 15 min, 10 registrations / IP / h, 10 reset requests / IP / h, 3 / account / h | NIST §3.2.2 requires rate limiting; numbers are website policy in `server/account-constants.mjs` |
| Tokens | 32 random bytes, SHA-256 stored, single use, verify 24 h, reset 1 h; reset validates the new password BEFORE consuming the link | `server/account-repository.mjs`, `server/accounts.mjs` |
| Sessions | existing `sessions` table; every password change / reset revokes all sessions of the account | `server/store.mjs` `newSession` |
| Providers | Google button kept and disabled until an OIDC client exists; Amazon and Apple buttons removed (no credentials → would be fake) | owner profile cl. 10 |

Files: `server/account-constants.mjs`, `password-policy.mjs`, `password-hash.mjs`, `mailer.mjs`, `account-repository.mjs`,
`accounts.mjs`; routes in `server/http.mjs` (`POST /api/account/{register,sign-in,verify-email,resend-verification,request-reset,
reset,change-password,delete}`, `GET /api/account`); `public/account-client.js`, `public/login.html`, `public/account.html`,
`public/connected.css`; tests `test/account-primitives.test.mjs`, `test/accounts.test.mjs`.

## Verification (this session)

- `npm test` 627/627 (was 618; +9 account tests); `npm run check` 154 modules, seven connected pages.
- Real browser flow (`scripts/verify-accounts-20260915.mjs`, report `website/.state/verification/2026-09-15/accounts-report.json`):
  register → confirmation mail read from the outbox → verified → sign out → wrong password refused with the server's
  sentence → sign in → reset request → reset mail → leaked password refused with the NIST reason → new password set,
  sessions revoked → sign in → change password → delete account → sign-in fails. Google shown disabled, Amazon/Apple absent.
- Rule 23 real SES call (`scripts/ses-real-call.mjs`): `MessageRejected` HTTP 400 "Email address is not verified" →
  mapped to `MAIL_REJECTED`; the success path is recorded once the identity verifies.
- SES identity `playmusicprompts.com` created in eu-central-1 (DKIM `PENDING`); account in sandbox (200/day, 1/s, `ProductionAccessEnabled=false`).

## Open — actions only the owner can perform

1. Add the three DKIM CNAME records at Squarespace DNS (values printed by `aws sesv2 get-email-identity … --region eu-central-1`;
   tokens `wiywcaio3nnuviaazjpqied7ttg5btdk`, `6wg6kcw6dpxuyvmdakzedgcw2qyh3uqd`, `s2dmyc7fquo6ed57l4ovjjviyrdll746`, each
   `<token>._domainkey.playmusicprompts.com CNAME <token>.dkim.amazonses.com`), then request SES production access in the console.
2. Create a Google OAuth 2.0 Web client (project `playmusicprompts`) and provide `PMP_OIDC_ISSUER=https://accounts.google.com`,
   `PMP_OIDC_CLIENT_ID`, `PMP_OIDC_CLIENT_SECRET` (DPAPI-protected locally, SSM on EC2) — the button switches on by itself.
3. Production deploy: EC2 runs Node v20.20.2; this website requires Node ≥ 24.13 — a Node 24 install is part of the deploy step
   (not done in this pass, which is local-only). Set `PMP_MAIL_FROM=no-reply@playmusicprompts.com`, `PMP_SES_REGION=eu-central-1`.
