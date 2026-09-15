# 05 · Lyrics and Singing

This document is for anyone integrating the API to generate sung tracks with dictated lyrics. It
covers the vocal + lyrics parameter shape, the language registry gate, the R0/R1 orthography
routes, the PER intelligibility gate (with all five stages of the A8 chain), and the honest
answers to "why did my PER FAIL?".

Every measurement below was captured on the live production service in the current session; the
raw audit is at the operator's internal audit record.

## The two knobs that turn on singing

Set both:

```json
{
    "vocal": {"mode": "male", "language": "en"},
    "lyrics": {"mode": "custom", "text": "the exact words, sung verbatim"}
}
```

- `vocal.mode` ∈ `{male, female, duet, choir, spoken}`. Anything other than `instrumental` selects
  the singing path.
- `vocal.language` must be in the language registry (the service's versioned `language_registry` data file, 11 codes).
- `lyrics.mode = custom` means "sing exactly `lyrics.text`". Contrast with `ai_write` (Lyria
  invents its own lyrics matching the theme, and `lyrics.text` is not scored) and `none` (no vocals
  even if `vocal.mode != instrumental` — an inconsistency refused by the validator).
- `lyrics.text` (max 5000 chars): the sung words. Comma-separated phrases are respected as
  breath-marks by Lyria.

## The Lyria prompt convention (why the words appear in quotes)

The generator (Vertex AI Lyria) sings dictated words when they are wrapped in **English quotes**
inside the prompt. This is Google's own documented mechanism (measured 2026-08-13 across dozens of
runs; the R0/R1 study round called it "the winning convention"). The compiler builds the prompt
this way for you — the raw shape sent is echoed back in `prompt_sent`:

```
The piece is approximately 30 seconds long, continuous from beginning to end. warm folk ballad,
acoustic guitar and gentle piano, medium tempo Vocal style: a male voice, singing in en. The
singer sings these exact words, slowly and clearly: "We rise where the morning breaks, we walk the
road together, holding on through every season".
```

The client should never write the quotes itself; it should set `lyrics.text` and let the compiler
place them.

## Language registry — what "SINGING_PROVEN" means

the service's versioned `language_registry` data file carries one entry per supported language with these fields:

| Field | Meaning |
|-------|---------|
| `code` | ISO 639-1 code (`en`, `tr`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `zh`, `ja`, `ko`) |
| `label` | Display name |
| `singing` | State: `SINGING_PROVEN` (a calibrated PER bar exists) or `NOT_MEASURED` (with a stated blocker) |
| `bar.value` | The PER threshold above which a sung take is judged unintelligible; a real number for `en` (0.654862), the string `NOT_MEASURED` for the other 10 |
| `bar.n` | Number of labelled sung samples the bar was calibrated on |
| `bar.dataset` | Source corpus (e.g. `vocadito` for `en`) |
| `coverage_score.value` | PHOIBLE-based phone coverage against the best reference inventory, 0.0-1.0 |
| `coverage_score.reference_language` | Which reference PHOIBLE inventory produced the best coverage |

The **only** language that is `SINGING_PROVEN` today is `en`. Requests in another sung language
are handled per `vocal.language_policy`:

- `strict` (default): refuse with **422 `LANGUAGE_NOT_PROVEN`** and the exact blocker.
- `prefer_proven`: fall back to `en`, note the fallback in the response `language_fallback` field.

`tr` (Turkish) is `NOT_MEASURED` because the calibration corpus (Turkish Makam Music) is
CC BY-NC-ND — an operator decision a recorded platform decision keeps it BLOCKED until a lawful sung corpus exists.

Per-language coverage scores as of `2026-08-31`:

| Language | Coverage | Best reference | Note |
|----------|----------|----------------|------|
| `en` | 0.4681 | RU | `SINGING_PROVEN`, bar 0.654862, n=14 vocadito |
| `tr` | 0.6232 | RU | Corpus licence blocked (a recorded platform decision) |
| `zh` | 0.3086 | RU | Bar owner-decision |
| `ja` | 0.6275 | RU | Bar owner-decision |
| `ko` | 0.3908 | RU | Bar owner-decision |
| `ru` | 0.4179 | RU (self) | Bar owner-decision |
| `es` | 0.4878 | RU | Bar owner-decision |
| `fr` | 0.5893 | PT | Bar owner-decision |
| `de` | 0.7586 | RU | Bar owner-decision |
| `it` | 0.4938 | RU | Bar owner-decision |
| `pt` | 0.4022 | ES | Bar owner-decision |

Full research: the service's internal research documentation (available from the API operator on request),
the service's internal research documentation (available from the API operator on request), the service's internal research documentation (available from the API operator on request).

## R0 vs R1 — orthography routing

`lyrics_orthography_route` chooses how the words are sent to Lyria:

- **R0 (default)** — send the raw orthography unchanged, in quotes. This is the measured
  best-generalist route (a recorded platform decision). Used for all languages except when the operator
  explicitly opts into R1 for Turkish.
- **R1 (Turkish-only escalation)** — apply the Bisani-Ney phoneme-informed respelling before
  quoting (Turkish MFA lexicon + variant rules). Used when the raw Turkish text scores badly on the
  R0 route and there is time to run the respelling pass. Not available for other languages: the
  phonemiser is Turkish-specific.

R0 is what your first integration should use. R1 exists for Turkish content that fails PER on R0.

## The A8 intelligibility gate — five stages, each measured

For a sung request with `lyrics.mode=custom`, the service runs the full A8 chain **on the
separated vocal stem** (never on the mix). The stages, in order:

### Stage 1 — Separate (GPU)

The dedicated separator service (Mel-Band RoFormer / `Kim_Vocal_2.onnx` on NVIDIA L4) is called with
the mixed track's GCS URI. It returns two stem GCS URIs (`vocals`, `instrumental`) and per-run
measurements:

```json
"separator": {
    "model": "Kim_Vocal_2.onnx",
    "mix_duration_s": 143.752,
    "stem_duration_s": 143.752,
    "separate_time_s": 12.47,
    "rtf": 0.087,
    "stem_gcs_uri": "gs://playmusicprompts-music-studio/analysis/stems/2026/09/01/f6d584a0b02e_vocals.wav",
    "other_gcs_uri": "gs://playmusicprompts-music-studio/analysis/stems/2026/09/01/f6d584a0b02e_instrumental.wav"
}
```

`rtf` (real-time factor) is `separate_time_s / mix_duration_s`. An L4 sits around `0.09` — a 60-s
song separates in about 5 s. **The separator NEVER falls back to the mix if it is unreachable**
(NO_FALLBACK_TO_MIX policy): a failure at this stage is reported with `stage_failed:"1_separate"`
and the whole gate produces `measured:false` rather than a silently-degraded score.

The separated stem is **analysis-only** (the platform's stem-shipping policy). It is stored under `gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/`
and is never shipped in `tracks[]`.

### Stage 2 — VAD segmentation (RMS envelope)

For a stem, an RMS envelope segments the vocal into sung-phrase spans. The segmentation plan feeds
Stage 4 so PER is scored per-phrase (S17: Jam-ALT WER 23.02 % → 20.35 % just from VAD segmentation
on separated stems).

Current state: the segmentation plan is **NOT yet supplied on the production `POST /v1/music`
path** — the response reports `vad_segmentation.state = "NOT_SUPPLIED"` with the honest note that
the fallback shape (comma-split reference vs. transcript) is used. Wiring VAD into the live path is
open an operator follow-up.

### Stage 3 — ASR on the stem

`asr_vertex.transcribe(stem_gcs_uri, language)` calls Vertex AI Gemini 2.5 Pro
(`:generateContent`) with a prompt asking for the exact sung transcript. It is called ON THE STEM,
never on the mix — a mix-transcription conflates instrumental frequencies with phonemes and inflates
PER.

The ASR response is embedded in the gate output:

```json
"asr": "vertex-gemini-generateContent (gemini-2.5-pro)",
"transcript": "We rise where the morning breaks\nWe walk the road together, together\n..."
```

### Stage 4 — Score PER + CER + WER (with variant lattice)

`per_gate.evaluate_full_a8(...)` phonemises both the reference lyric and the ASR transcript with
`music_studio.g2p_en` (MFA English (US) v3.1.0 phone set) and computes Phoneme Error Rate as
`PER = (S + D + I) / len(reference)` where `S`/`D`/`I` are substitutions/deletions/insertions in
the aligned pair. Companion metrics:

- **CER (Character Error Rate)** — same align() core, character units.
- **WER (Word Error Rate)** — same core, word units.
- **SER (Syllable Error Rate)** — only when a sourced syllabifier exists for the language, and it refuses BY NAME
  otherwise. Served today: **`tr`** (Turkish constraints, S15) and **`en`** (SONORITY — sonority sequencing with
  onset maximisation, Bartlett/Kondrak/Cherry NAACL-HLT 2009; 0.9393 whole-word boundary agreement measured against
  the same authors' syllabified CMUdict). Any other language reports `NOT_RUN` and names which languages ARE served.
  A word absent from the sourced pronunciation lexicon also makes the row `NOT_RUN` and NAMES that word — a partial
  SER over the segmentable subset would silently narrow its own denominator.

The reference is scored as a **lattice**: for every word, the pronunciation variant that best
explains the sung phonemes is chosen, so a correct alternate pronunciation is not charged as an
error.

### Stage 5 — Vocable exemption

`ExemptionClassifier` disaggregates non-lexical vocables (`ooh`, `ah`, `la` — the three classes
Chambers 1980 attests for song lyrics) and backing-vocal tokens from the PER decision. The
response reports:

```json
"vocable_exemption": {
    "language": "en",
    "lexicon_state": "SOURCED",
    "total_word_count": 16,
    "lead_word_count": 16,
    "vocable_count": 0,
    "backing_count": 0,
    "exempt_ratio": 0.0,
    "denominator_rule": "PASS/FAIL uses lead_word_count; the report uses total_word_count."
}
```

Vocables in the reference are attributed to their class rather than deleted; the PER PASS/FAIL uses
`lead_word_count` while the report shows both totals.

## The verdict

The gate compares measured PER to the calibrated bar for the language and returns:

```json
"lyrics_verification": {
    "measured": true,
    "per": 0.31,
    "cer": 0.28,
    "wer": 0.37,
    "verdict": "PASS",
    "threshold": 0.654862,
    "counts": {
        "reference_phonemes": 57,
        "hypothesis_phonemes": 62,
        "substitutions": 3,
        "deletions": 5,
        "insertions": 10,
        "hits": 49
    },
    "reference": {
        "text": "We rise where the morning breaks, we walk the road together, holding on through every season",
        "phonemes": ["w","iː","ɹ","aj","s","w","ɛ","ɹ","ə","m","ɒ","ɹ","ɲ","ɪ","ŋ","b","ɹ","ej","k","s","..."],
        "tiers": {"lexicon": 16, "variant_rule": 0, "unresolved": 0}
    },
    "hypothesis": {
        "text": "<ASR transcript>",
        "phonemes": ["...IPA sequence..."],
        "tiers": {"lexicon": 62, "variant_rule": 0, "unresolved": 0},
        "unresolved_words": []
    },
    "protocol": {
        "language": "en",
        "symbol_set": "MFA English (US) v3.1.0 phone set",
        "measured_on": "separated vocal stem",
        "stem_path": "gs://playmusicprompts-music-studio/analysis/stems/<YYYY>/<MM>/<DD>/<request>_vocals.wav",
        "separator": "mel-band-roformer / Kim_Vocal_2.onnx (a recorded platform decision)",
        "asr": "vertex-gemini-generateContent (gemini-2.5-pro)",
        "phonemiser": "music_studio.g2p_en (MFA english_us_mfa v3.1.0 CC BY 4.0 lexicon)",
        "metric": "PER = (S+D+I)/len(reference), phoneme-symbol units",
        "a8_chain": "an internal work item full-live (separate + VAD-report + ASR + PER + vocable-exempt)"
    },
    "human_verdict": {
        "status": "PENDING_HUMAN_REVIEW",
        "axes_only_he_can_judge": [
            "does the singing sound human",
            "does the voice suit the song",
            "does the language read as natively sung"
        ],
        "rule": "MOVIE MAKER UNIT the platform's human-judgement policy — no instrument may fill this field"
    }
}
```

For instrumental requests, `lyrics_verification` is `null`.

## "Why did my PER FAIL when the audio sounds fine?"

The 2026-09-01 live proof produced these numbers on a 16-word EN lyric:

| Metric | Value |
|--------|-------|
| Reference phonemes | 57 |
| Hypothesis phonemes | 221 |
| Substitutions | 0 |
| Deletions | 0 |
| **Insertions** | **164** |
| Hits | 57 |
| PER | 2.877 |
| Verdict | FAIL |

The 164 insertions come from **Lyria's own content-adherence issue**: given a 16-word request, it
sang the requested words correctly AND then invented 3-4 more verses in the same style. The gate
correctly detected this — every extra phoneme is charged as an insertion. This is NOT a defect of
the separator or the PER algorithm; it is what Lyria really did. The evidence trail:

- `reference.text` matches your `lyrics.text` character-for-character.
- `hypothesis.text` is the ASR transcript with 4x more content than the reference.
- `substitutions = 0` and `deletions = 0` — every reference phoneme has a matching hit, i.e. the
  singer sang your words correctly.
- `insertions = 164` — the singer sang far more than requested.

Follow-ups (owner decisions):

- **an operator follow-up** — investigate whether Lyria has a `stop_after_dictated` or negative-prompt escape
  that limits its content adherence to the exact lyric.
- Use `duration.target_seconds` tightly (10-20 s for a 16-word lyric) to bound the sung content by
  time.

## Instrumental requests

Set `vocal.mode = "instrumental"` and omit `lyrics`. The response `lyrics_verification` is `null`;
the rest of the pipeline (generate → conform → master → verify) runs identically.

```json
{
    "prompt": "cinematic orchestral swell, epic strings and brass, no vocals",
    "duration": {"target_seconds": 30, "tolerance_seconds": 2, "on_miss": "trim"},
    "vocal": {"mode": "instrumental"}
}
```

## Related documents

- Full parameter table: `04-request-body-full.md`
- End-to-end audio pipeline with measurements: `08-audio-pipeline.md`
- Language registry deep dive: `14-language-support.md`
- Every response field: `06-response-envelope.md`
- The A8 gate research and history: the service's internal research documentation (available from the API operator on request)
- The bar calibration research: the service's internal research documentation (available from the API operator on request)
