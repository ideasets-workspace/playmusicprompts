# 14 · Language Support

The registry that decides which languages the platform sings, what happens when a caller asks for
a non-`SINGING_PROVEN` language, and the coverage-score research behind each entry.

Source of truth: the service's versioned language registry. The
registry is loaded at container start and every value in this document was read from it in the
current session.

## The 11 registered languages

| Code | Label | Singing state | Bar (PER) | Coverage | Blocker |
|------|-------|---------------|-----------|----------|---------|
| `en` | English | **SINGING_PROVEN** | 0.654862 (n=14 vocadito) | 0.4681 vs RU | — |
| `tr` | Turkish | NOT_MEASURED | NOT_MEASURED | 0.6232 vs RU | a recorded platform decision corpus licence (CC BY-NC-ND) |
| `zh` | Chinese | NOT_MEASURED | NOT_MEASURED | 0.3086 vs RU | Owner spend + sung corpus |
| `ja` | Japanese | NOT_MEASURED | NOT_MEASURED | 0.6275 vs RU | Owner spend + sung corpus (PJS candidate) |
| `ko` | Korean | NOT_MEASURED | NOT_MEASURED | 0.3908 vs RU | Owner spend + sung corpus |
| `ru` | Russian | NOT_MEASURED | NOT_MEASURED | 0.4179 vs RU (self) | Owner spend + sung corpus |
| `es` | Spanish | NOT_MEASURED | NOT_MEASURED | 0.4878 vs RU | Owner spend + sung corpus |
| `fr` | French | NOT_MEASURED | NOT_MEASURED | 0.5893 vs PT | Owner spend + sung corpus (vocadito candidate) |
| `de` | German | NOT_MEASURED | NOT_MEASURED | 0.7586 vs RU | Owner spend + sung corpus |
| `it` | Italian | NOT_MEASURED | NOT_MEASURED | 0.4938 vs RU | Owner spend + sung corpus |
| `pt` | Portuguese | NOT_MEASURED | NOT_MEASURED | 0.4022 vs ES | Owner spend + sung corpus |

`en` is the only language whose PER bar has been calibrated on labelled sung material. Every other
language is registered (spec knows it exists and can compile prose in it) but not
`SINGING_PROVEN` (no calibrated pass/fail threshold).

## `SINGING_PROVEN` — what it means precisely

A language enters `SINGING_PROVEN` state ONLY when:

1. A **labelled sung corpus** exists in that language (with hand-scored PER on each sample).
2. The `bar_calibration` tool has run on that corpus and produced a numeric `bar.value` with an
   `n` and `dataset` field.
3. The calibration was performed on the current phonemiser + ASR + separator combination (a bar
   from a different setup would drift).

an operator decision a recorded platform decision: a language enters with EVIDENCE, and a silent substitution is the
deception class the project must never commit.

## Requesting a non-`SINGING_PROVEN` language

Set `vocal.language_policy` to one of:

- **`strict`** (default): the request is refused with `422 LANGUAGE_NOT_PROVEN` and the exact
  blocker.
- **`prefer_proven`**: the request is silently promoted to `en`; the response `language_fallback`
  field carries the reason.

Example (strict):

```json
{
    "prompt": "warm Turkish folk song",
    "vocal": {"mode": "male", "language": "tr", "language_policy": "strict"},
    "lyrics": {"mode": "custom", "text": "..."}
}
```

Response:

```json
{
    "success": false,
    "error": "vocal.language 'tr' is NOT_MEASURED for singing; language_policy=strict refuses the fallback",
    "error_code": "LANGUAGE_NOT_PROVEN",
    "error_class": "caller_fixable",
    "caller_action": "either choose a language whose state satisfies the request, or set vocal.language_policy to prefer_proven and accept the reported fallback"
}
```

Example (fallback):

```json
{
    "prompt": "warm Turkish folk song",
    "vocal": {"mode": "male", "language": "tr", "language_policy": "prefer_proven"},
    "lyrics": {"mode": "custom", "text": "..."}
}
```

Response includes `"language_fallback": "tr not SINGING_PROVEN; fell back to en per vocal.language_policy=prefer_proven"`.

## Coverage score — what it measures

`coverage_score.value` is the fraction of the language's phoneme inventory that appears in the
best-matching PHOIBLE reference inventory. Higher = more of the language's sounds are covered by
the compiler + phonemiser.

Compute path:

1. Load the PHOIBLE inventory of the language (from the service's versioned `phoible_segment_features` data file).
2. Compare against every other PHOIBLE reference inventory in the registry.
3. Take the maximum `intersection / language_phones` ratio; note the reference.

Example: `de.coverage_score = 0.7586 vs RU` means 75.86 % of German phones exist in the Russian
PHOIBLE inventory (highest coverage among the 11 references). This is a **feasibility signal**
for the phonemiser + PER path, not a quality prediction.

## Turkish — the special case

Turkish is the only non-`en` language with a `coverage_score` computed against a live corpus. Its
inventory covers ~62 % of the Russian reference (best match among all references).

Turkish is BLOCKED for singing because:

- a recorded platform decision — the only lawful Turkish sung corpus (`Turkish Makam Music`) is CC BY-NC-ND, which
  forbids commercial derivative use.
- The R1 phoneme-informed respelling route exists specifically for Turkish (using the CC BY 4.0
  MFA Turkish lexicon + variant rules), so once a sung corpus becomes available Turkish should be
  the second language to move to `SINGING_PROVEN`.

Full research: the service's internal research documentation (available from the API operator on request), the service's internal research documentation (available from the API operator on request).

## Adding a new language (operator runbook)

1. Extract the PHOIBLE inventory (if the language is in PHOIBLE) via
   an internal operator script — add the language code to `RESEARCH_LANGUAGES`.
2. Compute the coverage score via `an internal operator script --write-registry`.
3. Add a phonemiser module (the service's per-language phonemiser module) — pointing at the language's MFA
   dictionary + variant rules (all under the CC BY 4.0 MFA licence).
4. Provision a labelled sung corpus (with hand-scored PER).
5. Run `bar_calibration.py` to produce `bar.value` and store it in the service's versioned `language_registry` data file.
6. Flip `singing: NOT_MEASURED` → `singing: SINGING_PROVEN` in the registry.
7. Sync the twin (the service's internal data directory byte-identical).
8. Redeploy the Cloud Run service.

All eight steps are needed. Skipping any of them silently produces a language that "seems
supported" but is not lawful.

## Language-per-line

For a multi-language sung request use the `lyrics_language_per_line` parameter. Today this is a
free-text descriptor sent as prose; a structured tuple-per-line surface is a follow-up.

## Related documents

- Phonology + coverage research: the service's internal research documentation (available from the API operator on request)
- Bar calibration research: the service's internal research documentation (available from the API operator on request)
- Language registry research: the service's internal research documentation (available from the API operator on request)
- G2P (R0/R1) research: the service's internal research documentation (available from the API operator on request)
