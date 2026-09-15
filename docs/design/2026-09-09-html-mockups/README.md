# HTML design mockups — 2026-09-09 (whole site, from scratch, design-only)

Berk's order (2026-09-09 09:52 → "başla" 09:55): design every page as browser-openable HTML
**before** any backend is coded; he reviews, we iterate, integration is coded only after his final
approval. This folder is that review build. Nothing here talks to a server.

## Open it

```powershell
cd c:\Berk\PlayMusicPrompts\docs\design\2026-09-09-html-mockups
node tools\serve.mjs 4173      # ES modules need http://, not file://
# then open http://127.0.0.1:4173/index.html
```

| Page | File | What it is |
|---|---|---|
| Home | `index.html` | prompt-first hero on a live 3D sound field, compiled brief, labour-shown horizon, now-playing stage, cover carousels |
| Musics | `musics.html` | the catalogue as ONE continuous stream of rows (never a card grid), blurred-cover header, live-facet filter strip |
| Track (`/t/<id>`) | `track.html` | one big stop: cover, actions, the full take record in designed chapters, provenance panel |
| Sign in / Create account | `login.html`, `signup.html` | two-pane: 3D field + focused card; NIST 800-63B-4 password rule shown as a length meter |
| Legal | `legal.html` | privacy / terms / cookies & ads on one reading surface with a sticky table of contents |

Every page carries the same shell (`js/shell.js`): collapsible left rail (state remembered),
top bar with search (`/` focuses it), and the **persistent bottom player bar with a waveform
scrubber** (`js/player-bar.js`) — the pattern both of Berk's reference images share.

## What the owner decided (D-PMP-08, DECISIONS.md) and what is proposed

Decided by Berk: **black/dark**, **interactive**, **3D effects**, whole site. Brand hues and
Manrope come from his own measured brand (D-PMP-06). Everything else in `css/tokens.css` —
type scale, spacing, radii, motion durations — is a **proposal**; one word from him changes it.

## Honesty ledger — read before judging the visuals

1. **No backend, by order.** Track names, prompts, counts in `js/constants.js › SAMPLE_TRACKS`
   are review content and are labelled so in every footer. Live `GET /api/musics` rows replace them.
2. **The waveform and the 3D field animate on time, not audio, in this build.** Production feeds
   `WaveformPainter` and `SoundFieldScene.setEnergy()` from the real `AnalyserNode` / server beat
   grid that the app already has. The visual language is identical; only the data source changes.
3. **Asset generation — what failed, measured this session** (`tools/probe-endpoint.mjs`,
   each job polled to a terminal state):
   - `/create-image-vertex` (the endpoint rule 23 names): every job `FAILED "Internal server error"`
     in ≈0.8 s even for a minimal `{prompt}` body — the worker crashes server-side, not a request fault.
   - OpenAI `credit_balance_exhausted` · fal.ai (flux/ideogram/recraft/nano/qwen/seedream) `Exhausted
     balance` · Stability `payment_required` · Luma `Insufficient credits` · Kling `Account balance not
     enough` · Runway `not enough credits` after exactly one image. **Balances are Berk's decision.**
   - The v5 document's gateway base (`v2pjhwhk0m…`) answers HTTP 500 to every request; the base in
     `ssm-content-credentials.md` (`i3ob0ck5m2…`) works. Also learned live: Runway `promptText` ≤ 1000 chars.
   - **Result: 1 real generated image** — `assets/hero-sound-field.jpg` (Runway gen4_image, 1280×720,
     360,758 B, the violet light ribbon on black). Its exact prompt is in `tools/asset-spec.mjs`.
   - **Covers are procedural**, not AI: `js/cover-art.js` renders each track's own "sound field" from its
     measured bpm / LUFS / duration with a seeded PRNG — real computation, unique per track, no stock,
     no grey placeholder. This is also a product proposal: a generated track can carry its own field as
     cover, derived from its real beat grid at integration time. When credits exist,
     `node tools\generate-assets.mjs` produces the 8 AI covers (prompts already written).
4. **Verification, this session** (`tools/screenshot.mjs`, Chromium 153 via Playwright 1.63.0):
   6 pages × 3 widths (375 / 768 / 1440) = 18/18 rendered, **horizontal overflow 0 px on all 18,
   sub-24 px interactive targets 0 on all 18, console errors 0 on all 18.** Screenshots + `report.json`
   in `verification/`. Not measured: real-device touch, WCAG contrast by tool (token pairs were
   computed by formula, see `css/tokens.css`), INP/long-task budgets — those gates belong to the
   integration build.

## Structure sources (knowledge, not taste)

`docs/design-directions/2026-09-05-frontier-all-surfaces.md` §2 (K1 prompt is the entry, K2 show the
interpretation, K3 show the labour, K9 WCAG 2.2 floors, K19 Art. 50 provenance, K22 attribution
wording); Apple Music + YouTube Music convergence and Berk's two reference images (2026-09-09).
