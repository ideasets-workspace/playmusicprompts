# IndexNow — official protocol documentation (downloaded this session)

Per rules/23 (external-api-integrations-law): official docs fetched, saved, and read in full
BEFORE any code was written against this protocol.

## Sources

1. `https://www.bing.com/indexnow/getstarted` — fetched 2026-09-06, "How to add IndexNow to your
   website | Bing Webmaster Tools". No dated version string on the page itself; freshness is the
   fetch date. Byte size of the fetched (rendered-to-markdown) content: 2,847 chars.
2. `https://www.indexnow.org/documentation` — fetched 2026-09-06, "Documentation | IndexNow.org",
   the canonical protocol spec (IndexNow is a joint Microsoft/Bing + Yandex + Seznam.cz initiative;
   this is the neutral protocol-owner site, not a single search engine's page). Byte size of the
   fetched content: 3,412 chars.

Both fetches' full rendered text is reproduced in `2026-09-06-fetched-pages.txt` in this directory
(saved verbatim, not paraphrased, so a future session can re-read the primary source rather than
this summary).

## Endpoints, parameters, and permitted values — traceable to the fetched text above

- **Key generation** (client-side, no API call): a string of **8 to 128 hexadecimal characters**
  (lowercase a-z, uppercase A-Z, digits 0-9, dash `-` only — verbatim from indexnow.org/documentation
  §"Submitting One URL"). Not issued by any server; the site owner generates it.
- **Key hosting, Option 1 (used here — the doc's own "strongly recommended" option):** a UTF-8 text
  file at the site root, path `/<key>.txt`, whose entire contents are the key string. Verbatim:
  "It is strongly recommended that you use Option 1 and place your file key at the root directory
  of your web server" (§"Verifying ownership via the key").
- **Single-URL submission (GET):** `https://<searchengine>/indexnow?url=<url-escaped-URL>&key=<key>`
  — 200 on success. `<searchengine>` is the endpoint of any participating engine; `api.indexnow.org`
  is the shared endpoint that fans out to all participants (per bing.com/indexnow/getstarted's own
  worked example, which posts to `api.indexnow.org` directly).
- **Bulk submission (POST):** `POST /IndexNow` (or `/indexnow`, case-appears-insensitive across the
  two fetched pages) to `api.indexnow.org` (or a specific engine host), `Content-Type:
  application/json; charset=utf-8`, JSON body `{ "host": "<bare-hostname>", "key": "<key>",
  "keyLocation": "<full URL to the key file>", "urlList": ["<url1>", ...] }`. **Up to 10,000 URLs
  per POST** (verbatim, indexnow.org/documentation §"Submitting set of URLs").
- **Response codes, all four traceable to the fetched text:** `200 OK` = submitted successfully;
  `202 Accepted` = received, key validation pending; `400 Bad request` = invalid format; `403
  Forbidden` = key not valid (not found, or file found but key not inside it); `422 Unprocessable
  Entity` = URLs don't belong to the host, or key doesn't match the URL's own path scope (Option 2
  only); `429 Too Many Requests` = rate-limited/spam suspicion.
- **`keyLocation` is REQUIRED only for Option 2** (a key file hosted somewhere other than the root).
  This project uses Option 1 (root-hosted `/<key>.txt`), for which `keyLocation` is optional per the
  spec but is still SENT in every request here (harmless, and removes any ambiguity for the
  receiving engine — the doc's own worked POST example includes it even while documenting Option 1).

## Verification, this session (rules/23: "a real call, this session, against the real platform;
one success and one failure response read and reported")

- **Success:** `POST https://api.indexnow.org/IndexNow` with the real, correctly-formed body
  (host=www.playmusicprompts.com, the generated key, its keyLocation, urlList=["…/stream"]) →
  **`HTTP 202 Accepted`** ("URL received. IndexNow key validation pending" — the documented meaning
  of 202, not 200, because the key file was deployed moments before this call and the engine's own
  async key-validation had not yet run; this is the spec's own documented behaviour, not an error).
- **Failure:** `POST https://api.indexnow.org/IndexNow` with a deliberately malformed body (not
  valid JSON) → **`HTTP 400 Bad request`**, body `{"errorCode":"InvalidRequestParameters","message":
  "Given request parameters are null or invalid","details":null}` — matches the documented 400
  meaning exactly ("Invalid format").
- Key file live on production, byte-verified: `curl https://www.playmusicprompts.com/<key>.txt` →
  `200 OK`, content byte-identical to the key (64 bytes, no trailing newline).
- Note on the 403 case: `api.indexnow.org` is the shared fan-out endpoint and accepts (202) any
  syntactically valid request regardless of whether the key is actually correct — key validity is
  checked ASYNCHRONOUSLY against the live keyLocation after acceptance, per the spec's own wording
  ("search engines will crawl the key file to verify ownership"). A synchronous 403 could not be
  produced against this endpoint in this session without waiting for that async check; this is
  reported as a measured limit, not glossed over.


- The key itself: generated locally with Node's `crypto.randomBytes`, hex-encoded, 64 characters —
  well inside the 8–128 range, using only permitted characters (hex is a strict subset of the
  allowed alphabet). Never guessed, never a placeholder.
- Key file route: `deploy/payload/app/[key]/route.ts`... — see the real path in the code comment at
  the top of the route file actually added; this README does not restate the runtime wiring so the
  two can never drift out of sync silently.
- Submission script: `scripts/verify-tools/indexnow-submit.cjs`, called manually after a real
  content change (the doc explicitly says "should publish only URLs changing... since the time you
  start to use IndexNow" — never a backfill of historical URLs).
