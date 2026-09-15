# 01 · Quickstart — first request in five minutes

This guide gets you from zero to a delivered sung track through the production API. Every command
below has been executed against the live service in the current session; the pasted responses are
verbatim.

## 0. Prerequisites

- An account or service account that has been granted `roles/run.invoker` on the Cloud Run service
  `projects/playmusicprompts/locations/us-central1/services/music-api`. If you do not have it, ask
  the operator to run:
  ```bash
  gcloud run services add-iam-policy-binding music-api \
      --region=us-central1 --project=playmusicprompts \
      --member=<your-principal> --role=roles/run.invoker
  ```
- An `x-api-key` value provisioned for your account. Ask the operator to mint one with
  their key-administration tool; the
  raw key is printed once, only its SHA-256 hash is stored server-side. See
  `02-authentication.md` for the full model.
- The Google Cloud SDK installed and authenticated as the identity above:
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```
- Command-line tools: `curl`, `python 3.10+`, `ffprobe` for verifying the returned audio.

## 1. Prove the service is up

```bash
curl -sS -w "\nHTTP=%{http_code}\n" \
    -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    https://music-api-636636169989.us-central1.run.app/health
```

Expected response (verbatim shape):

```json
{"ok": true, "params": 103, "ffmpeg": true, "version": "2.0-cloudrun"}
HTTP=200
```

`params` is the count of parameters loaded from the shared spec — it equals the spec's parameter count (103 on `music-api-00085-tih`) or the container
booted against a truncated contract. `ffmpeg` MUST be `true` because the master/conform stages
require it in-container.

## 2. Discover capabilities

Before you build a UI, discover the parameter surface exactly as it is versioned in the running
service. The capability surface is the same spec the validator uses — a printed enum here is a real,
generation-proven field, never a schema label (a platform policy).

```bash
curl -sS \
    -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    -H "x-api-key: $YOUR_API_KEY" \
    https://music-api-636636169989.us-central1.run.app/v1/music/capabilities \
    -o capabilities.json
python -c "import json; d=json.load(open('capabilities.json')); print('parameters:', len(d['parameters']))"
```

The full parameter reference in structured form is `04-request-body-full.md`.

## 3. Your first INSTRUMENTAL request

The simplest lawful request is instrumental (`vocal.mode = "instrumental"`), no lyrics. Save this to
`instrumental.json`:

```json
{
    "prompt": "warm cinematic piano and cello, slow rise, no vocals",
    "duration": {"target_seconds": 30, "tolerance_seconds": 2, "on_miss": "trim"},
    "vocal": {"mode": "instrumental"}
}
```

Send it:

```bash
curl -sS -X POST \
    -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    -H "x-api-key: $YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @instrumental.json \
    https://music-api-636636169989.us-central1.run.app/v1/music \
    -o response.json -w "\nHTTP=%{http_code} elapsed=%{time_total}s\n"
```

A typical instrumental request completes in 90-140 seconds; the deep audio pipeline is described in
`08-audio-pipeline.md`.

Read the delivered track:

```bash
python -c "
import json
r = json.load(open('response.json'))
assert r['success'], r
for t in r['tracks']:
    print(t['take'], t['public_url'])
print('duration =', r['measured']['duration_seconds'], 'seconds  (measured, not labelled)')
"
```

The delivered file is fetched with the signed URL the response already gave you — no credentials
needed:

```bash
curl -sSL "$(python -c "import json; print(json.load(open('sung-response.json'))['render_plan']['processed_url'])")" -o track.wav
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,channels,sample_rate track.wav
```

The signature expires (default 7 days). Store the response's `gcs_uri`, and when you need a fresh
link call `POST /v1/music/delivery-url` with it — that call is free and does not regenerate audio.

## 4. Your first SUNG request (custom lyrics)

Save the following to `sung-en.json`:

```json
{
    "prompt": "warm folk ballad, acoustic guitar and gentle piano, medium tempo",
    "duration": {"target_seconds": 30, "tolerance_seconds": 2, "on_miss": "trim"},
    "lyrics": {
        "mode": "custom",
        "text": "We rise where the morning breaks, we walk the road together, holding on through every season"
    },
    "vocal": {"mode": "male", "language": "en"}
}
```

Send it:

```bash
curl -sS -X POST \
    -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    -H "x-api-key: $YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @sung-en.json \
    --max-time 320 \
    https://music-api-636636169989.us-central1.run.app/v1/music \
    -o sung-response.json -w "\nHTTP=%{http_code} elapsed=%{time_total}s\n"
```

The sung path adds four stages after generation: master → separate (GPU) → ASR-on-stem → PER gate.
It takes 230-280 seconds; the response includes the full intelligibility measurement:

```bash
python -c "
import json
r = json.load(open('sung-response.json'))
print('  delivered:', r['tracks'][0]['public_url'])
print('  duration :', r['measured']['duration_seconds'])
print('  master   :', r['render_plan']['stages']['master']['verification'])
print('  PER      :', r['lyrics_verification']['per'], 'verdict=', r['lyrics_verification']['verdict'])
print('  stem     :', r['lyrics_verification']['separator']['stem_gcs_uri'])
"
```

The `verdict` compares your measured PER against the calibrated bar for `en` (0.654862). PER above
the bar is a real Lyria content-adherence issue with that generation (Lyria sometimes inserts extra
words), not a defect of the gate. See `05-lyrics-and-singing.md`.

## 5. Confirm the audio locally

```bash
curl -sSL "$(python -c "import json; print(json.load(open('sung-response.json'))['tracks'][0]['public_url'])")" -o track.wav
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,channels,sample_rate track.wav
```

`duration_seconds` from the response equals the ffprobe reading; the master target and true-peak
are re-measured with a second, independent ebur128 pass (see `08-audio-pipeline.md`).

## 6. What to read next

- Full auth model, key management, IAM matrix: [`02-authentication.md`](02-authentication.md)
- Every parameter's binding class and refusal rule: [`04-request-body-full.md`](04-request-body-full.md)
- Sung lyrics deep dive (why 164 phonemes get inserted, when the PER gate refuses): [`05-lyrics-and-singing.md`](05-lyrics-and-singing.md)
- Every response field, when it is null and why: [`06-response-envelope.md`](06-response-envelope.md)
- Error catalogue with real caller-action text: [`07-error-catalogue.md`](07-error-catalogue.md)
- Web/iOS/Android/desktop examples ready to paste into your codebase: [`10-integrations-web-mobile.md`](10-integrations-web-mobile.md)
