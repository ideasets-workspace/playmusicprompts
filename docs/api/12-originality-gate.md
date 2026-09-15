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
- **Lag scan** (since 2026-09-08, the axis's GATING statistic) — for every candidate period from 0.37 s to 12 s the
  take is compared with itself one period later, block by block, using the published Haitsma-Kalker near-copy
  criterion; `lag_scan.max_block_repeat_fraction` is the largest share of the take that repeats at any period and
  `lag_scan.best_lag_seconds` is that period. No tempo, meter or beat input is needed. On a known-answer control (24 real
  takes each tiled from one bar) it measured 1.0000 on all 24 against 0.000–0.0625 on the 24 human originals.

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
        "bars_status": "CALIBRATED",
        "bars_status_per_axis": {"axis1_monotony": "CALIBRATED", "axis2_similarity": "CALIBRATED"},
        "bar_window": {"bar_seconds": 2.0, "tempo_source": "requested", "meter_source": "requested"},
        "note": "Serra/Wu-Yang publish no transferable threshold, so each axis's pass/fail bar is calibrated locally on labelled takes and validated against the class it exists to catch; an axis whose bar did not validate reports raw scores + NOT_CALIBRATED with the measured reason (never a guessed bar)",
        "axis1_monotony": {
            "take": "take_1",
            "structureness": {"si_short": 0.183, "si_mid": 0.201, "si_long": 0.174},
            "tempogram": {"column_correlation": 0.99999, "temporal_entropy": 7.30},
            "tile_rule": {"max_consecutive_identical_windows": 1, "flagged": false, "ran": true},
            "lag_scan": {"max_block_repeat_fraction": 0.0168, "best_lag_seconds": 9.342, "lags_evaluated": 1006, "ran": true},
            "verdict": "PASS",
            "verdict_basis": {
                "gating_statistic": "lag_scan_max_block_repeat_fraction",
                "lag_scan_bar": 0.14419,
                "lag_scan_above_bar": false,
                "lag_scan_best_lag_seconds": 9.342,
                "tile_rule_flag": false,
                "si_short_bar_reported_not_gating": 0.587127,
                "si_above_bar_reported_not_gating": false,
                "corpus_genre": "singer_songwriter_acoustic",
                "scope_rule": "these bars judge material of this genre class; widening is a new calibration"
            }
        },
        "axis2_similarity": {
            "pairs": [
                {"take_a": "take_1", "take_b": "take_2", "qmax_normalised": 0.052, "fingerprint_ber": 0.49, "near_exact_copy": false, "verdict": "PASS"},
                {"take_a": "take_1", "take_b": "take_3", "qmax_normalised": 0.131, "fingerprint_ber": 0.47, "near_exact_copy": false, "verdict": "CARBON_COPY_FLAGGED"},
                {"take_a": "take_2", "take_b": "take_3", "qmax_normalised": 0.061, "fingerprint_ber": 0.50, "near_exact_copy": false, "verdict": "PASS"}
            ],
            "effective_distinct_takes_vendi": 2.4,
            "take_count": 3,
            "verdict": "CARBON_COPY_FLAGGED",
            "flagged_pairs": "1/3",
            "verdict_basis": {"qmax_norm_bar": 0.085308, "corpus_genre": "singer_songwriter_acoustic", "scope_rule": "these bars judge material of this genre class; widening is a new calibration"}
        }
    }
}
```

Key fields:

| Field | Meaning |
|-------|---------|
| `bars_status` | Summary of the two axes: `CALIBRATED` (both), `PARTIALLY_CALIBRATED` (one), `NOT_CALIBRATED` (neither). Read the per-axis truth in `bars_status_per_axis` and in each axis's own `verdict` |
| `axis1_monotony.structureness.si_short` | Structureness indicator over the short timescale band; 0.0 = maximally varied, 1.0 = maximally self-repeating |
| `axis1_monotony.tempogram.column_correlation` | Cyclic-tempogram column correlation (companion signal; saturates near 1.0 on most material and is never a lone verdict) |
| `axis1_monotony.tile_rule.flagged` | true iff a run of identical bar-windows exceeds the published tile limit (`ran:false` + `state:"NOT_RUN"` when no bar window could be derived) |
| `axis1_monotony.lag_scan.max_block_repeat_fraction` | Largest share of the take that repeats itself at any period between 0.37 s and 12 s by the near-copy criterion; 0.0 = no period repeats, 1.0 = the whole take is a loop. The axis's gating statistic |
| `axis1_monotony.lag_scan.best_lag_seconds` | The fundamental period at which that maximum was found |
| `axis1_monotony.verdict_basis.gating_statistic` | Which statistic produced the verdict (`lag_scan_max_block_repeat_fraction`); the SI figure is reported beside it as `*_reported_not_gating` |
| `axis1_monotony.verdict` | `MONOTONE_FLAGGED` / `PASS` only when this axis's bar is `CALIBRATED`; otherwise `NOT_CALIBRATED` with `calibration_status` and, on a failed calibration, `calibration_failure` carrying the measured reason |
| `axis2_similarity.pairs[i].qmax_normalised` | Serra Qmax divided by the shorter take's frame count; HIGHER = more similar |
| `axis2_similarity.pairs[i].fingerprint_ber` | Haitsma-Kalker bit error rate; 0 = identical, 0.5 = unrelated; `near_exact_copy` fires below the published 0.35 |
| `axis2_similarity.pairs[i].verdict` | `CARBON_COPY_FLAGGED` when `qmax_normalised` is above the calibrated bar or `near_exact_copy` is true; else `PASS` |
| `axis2_similarity.effective_distinct_takes_vendi` | Vendi score; ≈ N means N truly distinct takes, ≈ 1 means one take repeated |
| `axis2_similarity.verdict_basis` | The bar applied, the genre class it was calibrated on, and the scope rule |

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

## Calibration state — read `bars_status_per_axis`, never assume

Serra Qmax and the tempogram/structureness statistics publish no transferable pass/fail threshold, so each axis's
bar is calibrated locally on labelled material and VALIDATED against the class it exists to catch before it is
allowed to gate anything. Current state (calibration run of 2026-09-07):

- **Axis 2 (take similarity) — `CALIBRATED`.** Normalised-Qmax bar 0.085308, the upper tolerance limit (coverage
  0.90, confidence 0.95) of 264 human different-song pairs (singer-songwriter acoustic reference set). Validated:
  12/12 human same-song pairs and 31/45 of the owner-labelled carbon-copy pairs lie above it; 24/264 human
  different-song pairs (≤ 10 %, the expected tail) are flagged. Per-pair verdicts and `verdict_basis` are emitted.
  The bar judges material of that genre class; the `scope_rule` travels in the response.
- **Axis 1 (rhythm monotony) — `CALIBRATED` on the lag-scan statistic (2026-09-08).** Bar 0.14419 = the upper
  tolerance limit of 24 human takes (p 0.90, γ 0.95); validated on a known-answer monotone class (24/24 flagged) and on
  the human class itself (0/24 flagged, ≤ 10 %). The earlier structureness bar caught 0/10 of the
  owner-labelled monotone takes and is no longer the gating statistic; it is still reported beside the verdict. Verdicts
  are `MONOTONE_FLAGGED` / `PASS` with `verdict_basis`. **Rollout note:** revisions deployed before 2026-09-08 still
  return the previous `NOT_CALIBRATED` / `CALIBRATION_FAILED` shape for this axis; read `bars_status_per_axis`.

Treat both axes' verdicts as **judgments** scoped to the calibrated genre class (`scope_rule`); raw scores remain
available as directional signals.

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
