# 12 · Originality Gate (a recorded platform decision)

The originality gate measures whether a generated track is a "carbon copy" — either internally
monotonous (the same 4-bar loop for 3 minutes) or, when variations are requested, effectively the
same take with cosmetic reshuffles. It is **opt-in** (`run_originality_gate: true`) and runs in a
**background thread** so it never delays the delivery response.

## The gate exists because the operator named the defect

The defect: variation requests were returning multiple takes that measured as the same piece with
minor reshuffles ("hep aynı ritim carbon copy bu çöp" — verbatim, 2026-08-28). The gate turns that
verdict into a numeric measurement.

Full research: the service's internal research documentation (available from the API operator on request). Rule of construction (the platform's off-critical-path policy):
heavy work runs off the critical path.

## Two axes

### Axis 1 — Within-take monotony

`rhythm_monotony.measure_take(samples, sr, take_id, tile_window_seconds)`:

- **Structureness Indicator (SI)** — a measure of internal repetition band structure. High SI = the
  same short segment repeats through the whole track.
- **Cyclic tempogram autocorrelation** — bar-length repetition detection.
- **Tile rule** — the bar window at the request's `tempo_bpm` + `time_signature` is compared to
  every other bar in the track; a track that tiles too cleanly fails.

Runs on the FIRST delivered take.

### Axis 2 — Between-take carbon copy

`take_similarity.compare_takes(a_samples, b_samples, sr, take_a, take_b)`:

- **Serra Qmax** — cross-recurrence pairwise music-similarity score (validated on cover-song
  identification).
- **Haitsma-Kalker BER** — bit-error rate of a 32-bit-per-frame audio fingerprint.

Runs on every pair when `takes_delivered >= 2`. Ordered pairs, so with 4 takes there are 6 pair
scores plus an aggregate "effective distinct takes" Vendi-score.

## When to opt in

- Always, if you are showing "creative variety" as a product feature.
- Never (or opt out on latency-sensitive paths) if you already trust the generator's variation
  budget.
- For a single take, only Axis 1 is meaningful; Axis 2 requires `output_package: variations` and
  `variation_count >= 2`.

## Enabling the gate

```json
{
    "prompt": "...",
    "output_package": "variations",
    "variation_count": 3,
    "run_originality_gate": true
}
```

## Response — pending

Immediately after the synchronous delivery:

```json
"originality_gate": {
    "status": "pending",
    "measured": false,
    "poll": "/v1/music/originality/<request_id>",
    "note": "the optional originality gate is computing in the background"
}
```

## Response — complete (poll result)

Poll `GET /v1/music/originality/{request_id}` every 5-15 s until `status` is `complete`:

```json
{
    "success": true,
    "status": "complete",
    "verdict": {
        "measured": true,
        "bars_status": "NOT_CALIBRATED",
        "note": "raw scores only; Serra/Wu-Yang publish no transferable threshold, so a pass/fail bar is calibrated locally on labelled takes and is absent today (honest state, never a guessed bar)",
        "axis1_monotony": {
            "measured": true,
            "structureness_indicator": 0.183,
            "tempogram_cyclic": 0.412,
            "tile_rule_pass": true,
            "note": "raw scores; NOT_CALIBRATED"
        },
        "axis2_similarity": {
            "measured": true,
            "pairs": [
                {"a": "take_1", "b": "take_2", "qmax": 12.4, "hk_ber": 0.32},
                {"a": "take_1", "b": "take_3", "qmax": 11.8, "hk_ber": 0.29},
                {"a": "take_2", "b": "take_3", "qmax": 14.1, "hk_ber": 0.35}
            ],
            "effective_distinct_takes_vendi": 2.4,
            "verdict": "NOT_CALIBRATED"
        }
    }
}
```

Key fields:

| Field | Meaning |
|-------|---------|
| `bars_status: NOT_CALIBRATED` | No calibrated pass/fail threshold today; raw scores are always emitted |
| `axis1_monotony.structureness_indicator` | 0.0 = maximally varied, 1.0 = maximally monotonous |
| `axis1_monotony.tile_rule_pass` | true iff bar tiling does not exceed the "carbon copy" heuristic |
| `axis2_similarity.pairs[i].qmax` | Serra Qmax; lower is more similar, higher is more distinct |
| `axis2_similarity.pairs[i].hk_ber` | Haitsma-Kalker BER; 0 = identical, 0.5 = random |
| `axis2_similarity.effective_distinct_takes_vendi` | Vendi-score; ≥ N would mean N truly distinct takes |

## Response — failed

Rare. The gate could not run (missing dep, disk full, take too short for the SI bands):

```json
{
    "success": true,
    "status": "failed",
    "reason": "ImportError: librosa not installed"
}
```

Or:

```json
{
    "success": true,
    "status": "failed",
    "reason": "take too short for SI bands (< 30 s)"
}
```

## Response — no record

If the gate was NOT requested (or the `request_id` is unknown):

```
HTTP 404
{
    "success": false,
    "request_id": "<id>",
    "error": "no originality record — the gate was not requested for this request_id (set run_originality_gate:true on the delivery), or the id is unknown"
}
```

## Timing

- Axis 1: ~60-90 s (fitness-scape + cyclic tempogram).
- Axis 2: ~30 s per pair; scales with `choose(N, 2)`.
- Total for 3 variations: typically 90-150 s in the background.

The delivery response ships in ~250 s (sung) regardless of the gate. You SHOULD start polling right
away and back off exponentially (5 s → 8 s → 12 s → 20 s → 30 s cap).

## Why "NOT_CALIBRATED"

Serra Qmax and Wu-Yang's tempogram cyclic score do not publish a transferable pass/fail threshold —
their labelled datasets (cover-song identification, folk-music similarity) do not match the sung
Lyria distribution. To convert raw scores into PASS/FAIL, we need a labelled bar on ~50-100 real
Lyria takes hand-scored by the operator. That bar is a follow-up owner decision.

Until the bar exists, treat the raw scores as **directional signals**: a variation set with
Qmax=12 across all pairs is measurably less carbon-copy than one with Qmax=5 across all pairs.

## Testing your integration

- Enable the gate on a variation request with `variation_count=3`.
- Verify the `originality_gate.status = "pending"` in the immediate response.
- Poll `/v1/music/originality/{request_id}` every 15 s.
- Confirm the verdict shape matches the schema above.
- Confirm 404 with a bogus `request_id`.

## Cost

The gate runs in the same Cloud Run instance that served the delivery, so its cost is a share of
that instance's CPU time (a background thread on 2 vCPU for ~2 minutes ≈ $0.002 per request). GCS
writes for the verdict record are negligible.
