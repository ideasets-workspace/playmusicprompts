# 10 · Integrations — Web, iOS, Android, Desktop

Working code samples for each surface, ready to paste into a codebase. All samples call the exact
same production endpoint with the exact same auth pair (Cloud Run identity token +
`x-api-key`). None of them exposes the API key to the end-user's device — every device call goes
through your own backend, which attaches the auth headers server-side.

## The architectural rule

Do NOT ship the `x-api-key` to a browser or a mobile device. The key belongs in your backend's
secret store; the frontend sends a **prompt-and-parameters** request to YOUR backend, and YOUR
backend calls PlayMusicPrompts. If you ship the key to a device you lose control of it the moment
the app is decompiled or the browser's DevTools are opened.

```
[browser/mobile app]  →  [your backend]  →  [PlayMusicPrompts /v1/music]
      (user-signed)         (attaches           (does the work,
                             ID token +          returns tracks,
                             x-api-key)          measurements)
```

## Backend example — Node.js (Express)

Install:
```bash
npm install express google-auth-library node-fetch
```

`backend/music-router.js`:

```javascript
const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

const router = express.Router();
const MUSIC_API_URL = 'https://music-api-636636169989.us-central1.run.app';
const API_KEY = process.env.PLAYMUSICPROMPTS_API_KEY;  // from your secret store, never hardcoded

const auth = new GoogleAuth();

async function getIdentityToken() {
    const client = await auth.getIdTokenClient(MUSIC_API_URL);
    const token = await client.idTokenProvider.fetchIdToken(MUSIC_API_URL);
    return token;
}

router.post('/generate', async (req, res) => {
    try {
        const idToken = await getIdentityToken();
        const upstream = await fetch(`${MUSIC_API_URL}/v1/music`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
            timeout: 320_000,  // 320 s to accommodate sung requests
        });
        const body = await upstream.json();
        res.status(upstream.status).json(body);
    } catch (err) {
        res.status(502).json({ error: 'upstream-fetch-failed', detail: err.message });
    }
});

router.get('/originality/:requestId', async (req, res) => {
    const idToken = await getIdentityToken();
    const upstream = await fetch(
        `${MUSIC_API_URL}/v1/music/originality/${req.params.requestId}`,
        { headers: { 'Authorization': `Bearer ${idToken}`, 'x-api-key': API_KEY } }
    );
    res.status(upstream.status).json(await upstream.json());
});

module.exports = router;
```

Mount:
```javascript
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/api/music', require('./music-router'));
app.listen(8080);
```

## Backend example — Python (FastAPI)

Install:
```bash
pip install fastapi uvicorn google-auth httpx
```

`backend/music_router.py`:

```python
import os
import httpx
from fastapi import APIRouter, HTTPException, Request
from google.auth.transport.requests import Request as GAuthRequest
from google.oauth2 import id_token as gid_token

router = APIRouter(prefix="/api/music")

MUSIC_API_URL = "https://music-api-636636169989.us-central1.run.app"
API_KEY = os.environ["PLAYMUSICPROMPTS_API_KEY"]  # from your secret store

_cached_token: str | None = None
_cached_token_expires_at: float = 0.0


def _get_identity_token() -> str:
    """Fetch and cache an ID token for the music-api audience. Expires every ~3600 s."""
    global _cached_token, _cached_token_expires_at
    import time
    if _cached_token and time.time() < _cached_token_expires_at - 60:
        return _cached_token
    token = gid_token.fetch_id_token(GAuthRequest(), MUSIC_API_URL)
    _cached_token = token
    _cached_token_expires_at = time.time() + 3300  # tokens last 3600 s; refresh 60 s early
    return token


@router.post("/generate")
async def generate(request: Request) -> dict:
    body = await request.json()
    headers = {
        "Authorization": f"Bearer {_get_identity_token()}",
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=320.0) as client:
        response = await client.post(f"{MUSIC_API_URL}/v1/music", json=body, headers=headers)
        return response.json() if response.headers.get("content-type", "").startswith("application/json") \
            else HTTPException(response.status_code, response.text)


@router.get("/originality/{request_id}")
async def originality(request_id: str) -> dict:
    headers = {
        "Authorization": f"Bearer {_get_identity_token()}",
        "x-api-key": API_KEY,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{MUSIC_API_URL}/v1/music/originality/{request_id}", headers=headers)
        return response.json()
```

## Frontend — Web (fetch)

The browser calls YOUR backend, never PlayMusicPrompts directly.

```typescript
// music-client.ts
export type MusicRequest = {
    prompt: string;
    duration?: { target_seconds: number; tolerance_seconds?: number; on_miss?: string };
    vocal?: { mode: "instrumental" | "male" | "female" | "duet" | "choir" | "spoken"; language?: string };
    lyrics?: { mode: "custom" | "ai_write" | "none"; text?: string };
    // ...more parameters from 04-request-body-full.md
};

export async function generateMusic(request: MusicRequest): Promise<any> {
    const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `music-api ${response.status}`);
    }
    return response.json();
}

export async function pollOriginality(requestId: string, timeoutMs = 180_000): Promise<any> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const response = await fetch(`/api/music/originality/${requestId}`);
        const body = await response.json();
        if (body.status === "complete" || body.status === "failed") return body;
        await new Promise((r) => setTimeout(r, 15_000));
    }
    throw new Error("originality poll timed out");
}
```

React usage:

```tsx
async function onSubmit() {
    setLoading(true);
    try {
        const result = await generateMusic({
            prompt: promptField,
            duration: { target_seconds: 30 },
            vocal: { mode: "male", language: "en" },
            lyrics: { mode: "custom", text: lyricsField },
        });
        setAudioUrl(result.render_plan.processed_url);
        setPer(result.lyrics_verification?.per);
    } catch (err) {
        setError(String(err));
    } finally {
        setLoading(false);
    }
}
```

## Frontend — iOS (Swift + URLSession)

```swift
import Foundation

struct MusicRequest: Encodable {
    let prompt: String
    let duration: Duration?
    let vocal: Vocal?
    let lyrics: Lyrics?

    struct Duration: Encodable { let target_seconds: Int }
    struct Vocal: Encodable { let mode: String; let language: String? }
    struct Lyrics: Encodable { let mode: String; let text: String? }
}

final class MusicAPI {
    private let backendURL: URL

    init(backendURL: URL) { self.backendURL = backendURL }

    func generate(_ request: MusicRequest) async throws -> [String: Any] {
        var urlRequest = URLRequest(url: backendURL.appendingPathComponent("api/music/generate"))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)
        urlRequest.timeoutInterval = 320  // seconds

        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
        guard http.statusCode == 200 else {
            let bodyString = String(data: data, encoding: .utf8) ?? "<binary>"
            throw NSError(domain: "MusicAPI", code: http.statusCode,
                          userInfo: [NSLocalizedDescriptionKey: bodyString])
        }
        return try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
    }
}
```

Configure a `URLSessionConfiguration.default.timeoutIntervalForRequest = 320` at the app level so
sung requests do not time out prematurely.

## Frontend — Android (Kotlin + OkHttp)

```kotlin
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class MusicRequest(
    val prompt: String,
    val durationSeconds: Int = 30,
    val vocalMode: String = "instrumental",
    val vocalLanguage: String? = null,
    val lyricsText: String? = null,
)

class MusicApi(private val backendUrl: String) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(320, TimeUnit.SECONDS)  // sung requests can take ~250 s
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    fun generate(request: MusicRequest): JSONObject {
        val body = JSONObject().apply {
            put("prompt", request.prompt)
            put("duration", JSONObject().put("target_seconds", request.durationSeconds))
            put("vocal", JSONObject().apply {
                put("mode", request.vocalMode)
                request.vocalLanguage?.let { put("language", it) }
            })
            request.lyricsText?.let {
                put("lyrics", JSONObject().put("mode", "custom").put("text", it))
            }
        }
        val http = Request.Builder()
            .url("$backendUrl/api/music/generate")
            .post(body.toString().toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(http).execute().use { response ->
            val text = response.body?.string().orEmpty()
            if (!response.isSuccessful) error("music-api ${response.code}: $text")
            return JSONObject(text)
        }
    }
}
```

## Frontend — Desktop (Electron or native)

Same rule: your desktop app talks to your OWN backend (which may be a local server on the user's
machine if the app is truly local-first, or a remote SaaS backend). Do NOT embed the API key in
the desktop binary.

For a truly local-first desktop app the recommended pattern is:

1. Provision one API key per user or per license (via your admin surface).
2. Store the raw key in the OS keychain / credential manager (Windows Credential Store, macOS
   Keychain, Linux Secret Service — do not use plain files).
3. Have the desktop app read the key from the keychain and attach it to the request. The identity
   token is still needed and requires a user-side Google login; consider whether the local-first
   model is right for you or whether a backend is a better fit.

## Handling every response state on the client

```typescript
async function handleGenerationResponse(response: any) {
    if (!response.success) {
        // 4xx / 5xx envelope
        switch (response.error_code) {
            case "INVALID_REQUEST":
                showDeveloperError(response.refused);           // devs see the field-by-field list
                showUserError("Please check your input.");      // users see a friendly summary
                break;
            case "LANGUAGE_NOT_PROVEN":
                showUserError("This language is not yet supported for singing. Try English.");
                break;
            case "GENERATION_FAILED":
                showUserError("The music model refused this prompt. Please try different wording.");
                break;
            case "INTERNAL_ERROR":
            case "CONFIG_ERROR":
                reportIncident(response.request_id);
                showUserError("Something on our side broke. We have been alerted.");
                break;
            default:
                showUserError(response.error || "Unknown error.");
        }
        return;
    }

    // 200 success
    const mastered = response.render_plan?.processed_url;
    const raw = response.tracks?.[0]?.public_url;
    playAudio(mastered || raw);

    // Sung requests carry lyrics_verification
    if (response.lyrics_verification?.measured) {
        const { per, verdict, threshold } = response.lyrics_verification;
        showPerBadge({ per, verdict, threshold });
    }

    // Show remaining allowance
    const { used_today, daily_quota } = response.auth?.limit ?? {};
    if (used_today && daily_quota) showQuotaBadge(daily_quota - used_today);
}
```

## Timeouts by SDK

| Environment | Set the timeout to | Notes |
|-------------|-------------------|-------|
| Node.js `fetch` | 320_000 ms | The default is 300 s in undici; explicit is safer |
| Python `httpx.AsyncClient` | 320.0 | Passed as `timeout=` |
| Swift `URLRequest.timeoutInterval` | 320 | Also set `URLSessionConfiguration.timeoutIntervalForResource` |
| Kotlin `OkHttpClient.readTimeout` | 320 s | `writeTimeout` can be 30 s |
| Browser `fetch` with `AbortSignal.timeout` | 320_000 ms | AbortController for reliable cancel |

## Progress reporting on the client

The API does not stream progress. For a sung request, the response arrives ~250 s after the
request. Common UX:

- Show an indeterminate spinner with a "generating (~4 min)" label.
- Or run the request from a background job and report status via your own polling API.
- Or use the `webhook_url` parameter (see `11-webhook-async.md`) so the API pings your backend
  when the delivery is ready (still in a synchronous shape today; webhook is currently a
  notification, not a delivery mechanism).

## Testing your integration

- Use a **development API key** with `rate_per_min=10` and `daily_quota=50` for early testing.
- Point at a **dev prompt** with `duration.target_seconds=15` for short cycles (faster feedback).
- Do NOT hammer the production endpoint with load tests without operator approval — the L4
  separator serialises sung requests.
- Verify with an instrumental request first (~140 s each); once the plumbing works, exercise the
  sung path.
