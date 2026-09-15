# Amazon SES API v2 — downloaded official documentation (rule 23 record)

Platform: Amazon Simple Email Service, **API v2** (the current SES API; the v1 "SES Classic" API is not used).
Owner of the AWS account that will send: `376210053952` (CLI profile `geomagics_production`), the same account
that runs `i-0c52f530769d1ac88` (playmusicprompts-web). Purpose in this project: transactional account e-mail
for the website — e-mail address verification at sign-up, password reset, password-changed notice.

## Files in this directory

| File | Source URL (AWS official) | Version the document declares | Fetched (UTC) | Bytes |
|---|---|---|---|---|
| `API_SendEmail.html` | https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html | SES API v2 reference ("APIReference-V2", API version 2019-09-27 as stated in the v2 reference set) | 2026-09-15T08:36:19Z | 37,899 |
| `API_CreateEmailIdentity.html` | https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_CreateEmailIdentity.html | same reference set | 2026-09-15T08:36:19Z | 27,198 |
| `API_GetEmailIdentity.html` | https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_GetEmailIdentity.html | same reference set | 2026-09-15T08:36:19Z | 28,037 |
| `API_Errors.html` | https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_Errors.html | same reference set | 2026-09-15T08:36:19Z | 1,182 |
| `dg_request-production-access.html` | https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html | SES Developer Guide (sandbox → production access) | 2026-09-15T08:36:19Z | 22,498 |

Each file is the page exactly as served by AWS on the fetch date (`curl -sL`). The document's own reference set
proves currency; the download date proves nothing (rule 23 §1).

## Endpoints this website uses, traced to the downloaded pages

### `SendEmail` — `POST /v2/email/outbound-emails` (API_SendEmail.html, "Request Syntax")

Fields sent by `server/mailer.mjs` (every one traceable to the Request Body section of the page):

| Field | Doc statement (API_SendEmail.html) | How the website supplies it |
|---|---|---|
| `FromEmailAddress` | "The email address to use as the 'From' address for the email. **The address that you specify has to be verified.** Type: String. Required: No" | `PMP_MAIL_FROM` environment variable (config), never a literal in code |
| `Destination.ToAddresses[]` | array of strings | the account's e-mail address, exactly one recipient |
| `Content.Simple.Subject.Data` / `.Charset` | Content type "Simple — a standard email message… SES assembles the message" | template subject, UTF-8 |
| `Content.Simple.Body.Text.Data` and `Body.Html.Data` | Body object with `Html` and `Text`, each `{Charset, Data}` | plain-text and HTML renditions of the same message |
| `ReplyToAddresses[]` | array of strings | `PMP_MAIL_REPLY_TO` when configured |
| `ConfigurationSetName` | string | `PMP_SES_CONFIGURATION_SET` when configured (optional; not required for sending) |

Errors the page enumerates for SendEmail (all mapped in `server/mailer.mjs` to the website's honest failure
classes, never swallowed): `AccountSuspendedException` 400, `BadRequestException` 400, `LimitExceededException`
400, `MailFromDomainNotVerifiedException` 400, `MessageRejected` 400, `NotFoundException` 404,
`SendingPausedException` 400, `TooManyRequestsException` 429, plus the common errors of `API_Errors.html`.

### `CreateEmailIdentity` / `GetEmailIdentity` (operator-side, run through the AWS CLI, not from the website)

Used once to register the sending domain `playmusicprompts.com` and to read its DKIM CNAME records and the
`VerifiedForSendingStatus`. The website never creates identities at runtime.

## Constraints the documents state and this project honours

- The `From` address must belong to a **verified identity**; until `playmusicprompts.com` (or a specific
  address) is verified, `SendEmail` fails with `MailFromDomainNotVerifiedException`/`MessageRejected`. The
  website surfaces that as "e-mail could not be sent" — it never pretends the message went out.
- A new SES account is in the **sandbox** (dg_request-production-access.html): it can send only to verified
  recipients and with a 200/day, 1/second quota until production access is requested by the account owner
  (Berk) in the SES console. This is an owner action; the website cannot request it.
- Region: SES is regional; the website reads `AWS_REGION` (production: the EC2 role's region, `eu-central-1`).

## Verification (rule 23, "a real call this session")

Recorded in `docs/implementation/2026-09-15-website-accounts/verification.md` once the identity exists: one
successful `SendEmail` and one failure response (an unverified sender) read and reported. Until the identity is
verified the only real call possible is the failure path, which is what the local run demonstrates.
