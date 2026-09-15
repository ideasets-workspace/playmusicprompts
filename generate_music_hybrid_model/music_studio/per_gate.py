"""The PER gate — phoneme error rate on the SEPARATED VOCAL STEM, with its protocol attached.

WHY PER AND NOT WER, and why on the stem (all measured, from this session's reading of
`docs/research/2026-08-14-cross-lingual-singing-voice-synthesis-frontier.md` and the Turkish report):
  · PER is the metric the SVS literature reports for lyric intelligibility; WER punishes Turkish for
    being agglutinative (NAACL 2025 S41 names Turkish in exactly that argument).
  · The measurement runs on the SEPARATED VOCAL STEM, never the mix: claim C09 (VERIFIED, three
    independent sources) measures separation moving lyric transcription from 23.02 % to 20.35 % WER,
    and to 14.98 % on stems. A number taken on the mix is a different, worse instrument.
  · D-SSM-18 correction, recorded: **16.14 % PER is NOT a human floor.** It is VAE-reconstructed
    ground truth measured on a MIX in the DiffRhythm paper. No threshold in this file is set from it.

THE THRESHOLD IS NOT WRITTEN HERE, AND THAT IS DELIBERATE. `evaluate()` returns the measured PER plus
`verdict: "NOT_CALIBRATED"` until a calibration set exists (labelled Turkish singing material, per
language, with its sample count). A guessed bar is the exact defect this project paid for once: a
guessed motion floor of 0.08 rejected all seven correct shots where the calibrated value was 0.0007.

WHAT IS COMPUTED, precisely:
  reference  = lyric text -> phonemes via the three-tier Turkish G2P (tier provenance reported)
  hypothesis = ASR transcript of the vocal stem -> phonemes via the SAME G2P (symmetry matters: a
               reference and a hypothesis phonemised by different systems measure the systems, not
               the singing)
  PER        = (substitutions + deletions + insertions) / len(reference), the standard edit-distance
               form, with the full alignment returned so every error is inspectable per phoneme.

Controls: scripts/test_per_gate.py — known-answer edit-distance cases, the rules-tier agreement
measurement against the 41k lexicon, and refusal cases (empty hypothesis, empty reference).
"""

from __future__ import annotations

from dataclasses import dataclass

from . import g2p_tr

# ------------------------------------------------------------------------------------------------
# LANGUAGE DISPATCH (2026-08-17, D-SSM-34: the sung lane targets ALL registry languages, each
# earning its own gate path). A language enters this table ONLY when a sourced phonemiser module
# for it exists in this package — never a substituted or transliterating one, because a reference
# and a hypothesis phonemised by the wrong system measure the system, not the singing. Languages
# absent from the table are refused by name (honest NOT_RUN), which is the pre-existing behaviour.
#
# Per-language SYMBOL SET strings are MEASURED: the TR count is the v3.0.0 registry evidence line;
# the EN count was measured 2026-08-17 by enumerating distinct phone symbols in the shipped
# english_us_mfa.dict (79). Acquisition record for the EN dictionary (v3.1.0, CC BY 4.0):
# scripts/learn_phoneme_to_grapheme.py header.
# ------------------------------------------------------------------------------------------------

def _load_g2p_en():
    """Lazy import so the TR path never pays the EN lexicon load, and vice versa."""
    from . import g2p_en
    return g2p_en


_LANGUAGES: dict = {
    "tr": {
        "module": lambda: g2p_tr,
        "symbol_set": "MFA Turkish v3.0.0 phone set (74 phones measured; CC BY 4.0)",
        "phonemiser": "music_studio.g2p_tr (MFA v3.0.0 CC BY 4.0 + measured rules; Epitran "
                      "refused — its own paper measures Turkish WER 56.9 vs 55.7)",
        "threshold_status": "NOT CALIBRATED — no labelled Turkish singing set yet; 16.14 % is "
                            "NOT a human floor (D-SSM-18)",
    },
    "en": {
        "module": _load_g2p_en,
        "symbol_set": "MFA English (US) v3.1.0 phone set (79 phones measured in the shipped "
                      "dictionary, 2026-08-17; CC BY 4.0)",
        "phonemiser": "music_studio.g2p_en (MFA english_us_mfa v3.1.0 CC BY 4.0 lexicon + variant "
                      "rules MEASURED from the lexicon's own inflection pairs — data/g2p_en.json, "
                      "generated file; no letter-to-sound guesser by design)",
        "threshold_status": "NOT CALIBRATED — the vocadito/LM-SSD labelled set is on disk but the "
                            "STT leg awaits a budget declaration (fail-closed)",
    },
}


def _language_entry(language: str) -> dict | None:
    return _LANGUAGES.get(language)


def supported_languages() -> dict[str, dict]:
    """The PUBLIC description of every language this gate can actually measure.

    WHY THIS ACCESSOR EXISTS (and why the discoverable surface must consume it rather than restate
    it): `evaluate`/`evaluate_lines` return `NOT_RUN` for a language with no sourced phonemiser, and
    before this accessor existed a client had NO WAY to learn that in advance — the capabilities
    surface projected the language registry, which records CORPUS and BAR state, and said nothing
    about whether a reference lyric could be phonemised at all. That is the served-versus-enforced
    divergence this package has already paid for once (`models.language_value_entries`'s own
    docstring records the 2026-08-15 instance). `models` projects THIS mapping, so the two can only
    ever agree BY IMPORT (supreme-law LINK 10 / MANDATE Clause 23).

    The module loader callables are deliberately NOT exposed: a discoverable surface must be data,
    and handing a caller a loader would invite it to phonemise outside the gate's own protocol.
    """
    return {
        code: {
            "symbol_set": entry["symbol_set"],
            "phonemiser": entry["phonemiser"],
            "threshold_status": entry["threshold_status"],
        }
        for code, entry in _LANGUAGES.items()
    }


def _refusal(language: str) -> dict:
    supported = ", ".join(sorted(_LANGUAGES))
    return {"verdict": "NOT_RUN",
            "reason": f"no sourced phonemiser for language {language!r} exists in this package "
                      f"(supported: {supported}); a substituted phonemiser would measure the "
                      f"substitute, not the singing. D-SSM-34: every registry language earns this "
                      f"path by getting its own sourced G2P, never by borrowing another's."}


def _assert_no_unresolved(side: str, resolved: dict) -> None:
    """EN references/hypotheses may contain words the G2P honestly refuses (tier='unresolved').
    A reference with a hole in it would silently shrink the denominator — the 2026-08-13 defect
    class — so the WHOLE evaluation refuses, naming the words. TR never returns 'unresolved'
    (its rules tier is total), so this is a no-op there by construction."""
    missing = resolved.get("unresolved_words") or []
    if missing:
        raise ValueError(f"the {side} contains words the sourced G2P cannot phonemise: {missing}. "
                         f"Scoring around them would silently narrow the denominator; the "
                         f"evaluation refuses whole instead (CLAUSE 4 / prohibition 4).")


@dataclass
class Alignment:
    operations: list[tuple[str, str | None, str | None]]   # (op, ref_phone, hyp_phone)
    substitutions: int
    deletions: int
    insertions: int
    hits: int


def align(reference: list[str], hypothesis: list[str]) -> Alignment:
    """Levenshtein alignment over PHONEME SYMBOLS with backtrace, unit costs.

    Written out rather than imported: the phone symbols are multi-codepoint strings (`t̪`, `dʒ`,
    `aː`), and a character-level library would silently split them — which would make every dental
    and every affricate count as two errors. Measuring the wrong unit is this project's most
    expensive recurring defect class.
    """
    n, m = len(reference), len(hypothesis)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    back: list[list[str]] = [[""] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        dp[i][0], back[i][0] = i, "D"
    for j in range(1, m + 1):
        dp[0][j], back[0][j] = j, "I"
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if reference[i - 1] == hypothesis[j - 1]:
                dp[i][j], back[i][j] = dp[i - 1][j - 1], "="
                continue
            sub, dele, ins = dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1
            best = min(sub, dele, ins)
            dp[i][j] = best
            back[i][j] = "S" if best == sub else ("D" if best == dele else "I")

    ops: list[tuple[str, str | None, str | None]] = []
    i, j = n, m
    while i > 0 or j > 0:
        op = back[i][j]
        if op in ("=", "S"):
            ops.append((op, reference[i - 1], hypothesis[j - 1]))
            i, j = i - 1, j - 1
        elif op == "D":
            ops.append(("D", reference[i - 1], None))
            i -= 1
        else:
            ops.append(("I", None, hypothesis[j - 1]))
            j -= 1
    ops.reverse()
    return Alignment(
        operations=ops,
        substitutions=sum(1 for o in ops if o[0] == "S"),
        deletions=sum(1 for o in ops if o[0] == "D"),
        insertions=sum(1 for o in ops if o[0] == "I"),
        hits=sum(1 for o in ops if o[0] == "="),
    )


def phoneme_error_rate(reference: list[str], hypothesis: list[str]) -> tuple[float, Alignment]:
    """PER = (S + D + I) / len(reference). An empty reference has NO defined PER and raises rather
    than returning 0.0 — a zero on an empty reference would read as a perfect score."""
    if not reference:
        raise ValueError("PER is undefined for an empty reference phoneme sequence; refusing to "
                         "return a number that would read as a perfect score")
    a = align(reference, hypothesis)
    return (a.substitutions + a.deletions + a.insertions) / len(reference), a


def phoneme_error_rate_over_variants(
        reference_words: list[list[list[str]]],
        hypothesis: list[str]) -> tuple[float, Alignment, list[list[str]]]:
    """PER against a REFERENCE LATTICE: each word contributes its pronunciation VARIANTS, and the
    score is the minimum over variant paths. Returns (per, alignment, chosen variant per word).

    WHY THIS EXISTS — measured, this session: the MFA dictionary carries multiple pronunciations for
    the same word (`öğle` -> `øː ʎ e` AND `øː ʎ ɛ`; `gece` -> `ɟ e dʒ e` AND `ɟ e dʒ ɛ`). Scoring
    against ONE arbitrary variant charges an error to a singer who produced the other, which
    inflates PER for a correct performance. Variant-lattice scoring is the standard form used when a
    pronunciation dictionary has alternates, and it is what makes the number a property of the
    SINGING rather than of the dictionary's row order.

    The DP: dp[i][j] = minimum edit cost to align the first i reference words against the first j
    hypothesis phones, minimising over each word's variants and over every split of the hypothesis.
    Cost units are the same phoneme-symbol edits as `align()`, so the two functions cannot disagree.
    """
    if not reference_words or not any(any(v) for v in reference_words):
        raise ValueError("PER is undefined for an empty reference lattice; refusing to return a "
                         "number that would read as a perfect score")
    n_words, m = len(reference_words), len(hypothesis)
    INF = float("inf")
    dp = [[INF] * (m + 1) for _ in range(n_words + 1)]
    choice: list[list[tuple[int, int] | None]] = [[None] * (m + 1) for _ in range(n_words + 1)]
    dp[0][0] = 0.0
    for j in range(1, m + 1):
        dp[0][j] = j                        # leading hypothesis phones are insertions
    for i in range(1, n_words + 1):
        variants = [v for v in reference_words[i - 1] if v] or [[]]
        for j in range(0, m + 1):
            best, best_choice = INF, None
            for split in range(0, j + 1):
                if dp[i - 1][split] == INF:
                    continue
                span = hypothesis[split:j]
                for k, variant in enumerate(variants):
                    a = align(variant, span)
                    cost = dp[i - 1][split] + a.substitutions + a.deletions + a.insertions
                    if cost < best:
                        best, best_choice = cost, (split, k)
            dp[i][j], choice[i][j] = best, best_choice

    # Backtrace the chosen variants and rebuild one flat alignment for reporting.
    chosen: list[list[str]] = [[] for _ in range(n_words)]
    spans: list[tuple[int, int]] = [(0, 0)] * n_words
    j = m
    for i in range(n_words, 0, -1):
        split, k = choice[i][j]                     # type: ignore[misc]
        variants = [v for v in reference_words[i - 1] if v] or [[]]
        chosen[i - 1] = variants[k]
        spans[i - 1] = (split, j)
        j = split
    flat_ref = [p for v in chosen for p in v]
    a = align(flat_ref, hypothesis)
    if not flat_ref:
        raise ValueError("the chosen reference path is empty; refusing to score")
    return dp[n_words][m] / len(flat_ref), a, chosen


#: The symbol set of the TR path — kept as a named module symbol because the research-application
#: ledger's probe asserts it, and DERIVED from the dispatch table (single source, agreement by
#: import). The 74-phone count is the measured size of the v3.0.0 table (D-SSM-19 evidence line in
#: data/language_registry.json, re-read this session).
SYMBOL_SET = _LANGUAGES["tr"]["symbol_set"]


def _syllable_error_rate(reference_words: list[str], hypothesis_words: list[str]) -> dict:
    """SER over the SOURCED segmenter's syllables, or a NAMED refusal — never a guessed split.

    Each side goes text-word -> G2P (complete word form, honouring S15's post-suffixation
    requirement by construction) -> `TurkishSyllabifier` -> syllable strings; the two flat syllable
    sequences meet in the SAME `align()` core every other row of this gate uses. A word the
    segmenter refuses (complex-onset loanword, PHOIBLE-absent phone) makes the whole row a refusal
    that NAMES the word and the reason: a partial SER computed over the segmentable subset would be
    a silently narrowed denominator — the exact defect class of 2026-08-13 (384 files reported as 81).
    """
    from .syllabification import SyllabificationError, TurkishSyllabifier

    segmenter = TurkishSyllabifier()

    def flat_syllables(words: list[str], side: str) -> list[str]:
        syllables: list[str] = []
        for word in words:
            resolved = g2p_tr.word_to_phonemes(word)
            try:
                syllables.extend(segmenter.syllable_strings(list(resolved.phonemes)))
            except SyllabificationError as exc:
                raise SyllabificationError(f"{side} word {word!r}: {exc}") from exc
        return syllables

    try:
        reference = flat_syllables(reference_words, "reference")
        hypothesis = flat_syllables(hypothesis_words, "transcript") if hypothesis_words else []
    except SyllabificationError as exc:
        return {
            "value": "NOT_RUN",
            "reason": f"the sourced segmenter refused: {exc}",
            "refusal_class": "a partial SER over the segmentable subset would silently narrow the "
                             "denominator; the row refuses whole instead (CLAUSE 4 / prohibition 4)",
        }
    rate, _ = phoneme_error_rate(reference, hypothesis)
    return {
        "value": round(rate, 4),
        "unit": "syllables (post-G2P, segmented by music_studio/syllabification.py from S15's "
                "constraints; controls: scripts/test_syllabification.py)",
        "counts": {"reference_syllables": len(reference), "transcript_syllables": len(hypothesis)},
    }


def companion_metrics(lyric: str, transcript: str, language: str = "tr") -> dict:
    """TR-GATE's metric family beside PER: CER and WER computed, SER run or refused with its reason.

    WHY MORE THAN PER (each with its primary source, read this session from the Turkish report):
      · S41 (Findings of NAACL 2025) names Turkish as agglutinative in its argument AGAINST WER as the
        primary metric and enumerates the alternatives; S39/S42 report Turkish ASR quality in CER beside
        WER (S42: TMSC WER 22.2 / CER 14.05 without LM), because a single wrong suffix vowel costs a whole
        word under WER but one character under CER. So CER is the STABLE companion number, WER the
        literature-comparable one, and PER (the file's main metric) the intelligibility instrument.

    ALL THREE ROWS SHARE ONE EDIT-DISTANCE CORE (`align()`, known-answer controlled) and ONE text
    normalisation (`g2p_tr.normalise` — measured this session: Python's bare `.lower()` maps 'I'→'i'
    where Turkish requires 'ı', and 'İ'→'i'+U+0307, a phantom combining dot that a character metric
    would charge as an error). A second tokenisation or a second lowering rule would be the two-lists
    construction prohibition 6 forbids.

    SYLLABLE ERROR RATE RUNS ON THE SOURCED SEGMENTER (unlocked 2026-08-17): the refusal this block
    used to carry named its own unlock — "a syllabifier built from S15's constraints with a control
    set proving it can both agree and disagree with hand-syllabified words" — and that is now
    `music_studio/syllabification.py` (constraints + S15's own sentences in
    `data/syllabification.json`, controls in `scripts/test_syllabification.py`, known answers =
    S15's own [ha.jat]/[ha.jaː.ta] pair). Both sides are segmented by the SAME deterministic module,
    so the metric measures the transcript's deviation from the lyric, never the segmenter's taste.
    S15's post-suffixation requirement is honoured by construction: the G2P phonemises COMPLETE word
    forms. A word the segmenter refuses (e.g. a complex-onset loanword whose repair rules live
    outside the archived S15 preview) turns the row into a NAMED refusal for that run — an honest
    NOT_RUN with the word and the reason, never a guessed split (CLAUSE 4).

    LANGUAGE DISPATCH (2026-08-17): tokenisation and normalisation come from the LANGUAGE'S OWN
    G2P module (the phonemiser's rule, by import — never a second tokenisation). SER runs only
    where a sourced syllabifier exists (TR, from S15); for other languages the row is an honest
    NOT_RUN naming the missing instrument, never a borrowed segmenter.
    """
    entry = _language_entry(language)
    if entry is None:
        raise ValueError(_refusal(language)["reason"])
    g2p = entry["module"]()

    ref_words = g2p.words(lyric)
    hyp_words = g2p.words(transcript or "")
    if not ref_words:
        raise ValueError("no reference words; refusing to score companion metrics")

    word_per, _ = phoneme_error_rate(ref_words, hyp_words)
    # Characters: the SAME word tokens, joined by single spaces, so CER and WER see identical text and a
    # whitespace or punctuation difference can never open a gap between them. The convention is DECLARED
    # in the payload because published CER papers differ on punctuation/whitespace handling.
    ref_chars = list(" ".join(ref_words))
    hyp_chars = list(" ".join(hyp_words))
    char_per, _ = phoneme_error_rate(ref_chars, hyp_chars)

    if language == "tr":
        ser = _syllable_error_rate(ref_words, hyp_words)
    else:
        ser = {"value": "NOT_RUN",
               "reason": f"no sourced syllabifier exists for language {language!r} in this package "
                         f"(the TR segmenter is built from S15's Turkish constraints and may not be "
                         f"borrowed); the row refuses rather than guessing a split"}

    return {
        "cer": round(char_per, 4),
        "wer": round(word_per, 4),
        "syllable_error_rate": ser,
        "counts": {"reference_words": len(ref_words), "transcript_words": len(hyp_words),
                   "reference_characters": len(ref_chars)},
        "conventions": {
            "text_normalisation": f"music_studio.g2p_{language}.normalise — the phonemiser's own "
                                  f"rule, by import (TR: NFC + I/İ lowering; EN: NFC + typographic-"
                                  f"apostrophe folding)",
            "tokenisation": f"music_studio.g2p_{language}.words — the phonemiser's own rule, by import",
            "cer_text": "word tokens joined by single spaces; punctuation-free by tokenisation",
            "distance": "the same align() core as PER, known-answer controlled",
            "wer_caveat": "S41: WER punishes agglutinative Turkish — reported for comparability, "
                          "never as the primary verdict",
        },
    }


def aligner_priors_status() -> dict:
    """TR-GATE's 'feeds note/section durations to the aligner as priors' item, answered by the A11 record.

    The priors themselves exist (A3's PLANNED timelines carry per-phoneme durations), but there is no
    lawful aligner to feed them TO: A11's registry refuses the MEASURED-timing claim while every candidate
    is blocked. Saying 'priors wired' with no consumer would be an unwired-work claim, so this reports the
    honest state from the registry rather than a hand-written status that could go stale.
    """
    from .alignment import AlignerRegistry, NoLawfulAlignerError

    registry = AlignerRegistry.load()
    try:
        aligner = registry.assert_may_claim_measured_timing()
        return {"status": "AVAILABLE", "aligner": aligner.identifier,
                "priors_source": "A3 PLANNED phoneme timelines (music_studio/phoneme_timing.py)"}
    except NoLawfulAlignerError:
        return {"status": "NO_LAWFUL_ALIGNER",
                "reason": "A11: every candidate is blocked (data/aligners.json) — priors exist in A3's "
                          "PLANNED timelines but there is no lawful aligner to consume them",
                "shortest_route": registry.shortest_route()}


def berk_verdict_field() -> dict:
    """CLAUSE 19's field, present on every gate artefact and NEVER auto-filled.

    What no instrument here can judge — whether the singing sounds human, whether the voice suits the
    song, whether the Turkish reads as natively sung — is stated on the artefact as BERK'S VERDICT.
    Claiming it (setting this to a pass from code) is the lying class by the Mandate's own words.
    """
    return {
        "status": "PENDING_BERK",
        "axes_only_he_can_judge": ["does the singing sound human", "does the voice suit the song",
                                   "does the Turkish read as natively sung"],
        "rule": "MOVIE MAKER UNIT MANDATE CLAUSE 19 — no instrument may fill this field",
    }


def evaluate_lines(*, lyric: str, transcript: str, language: str = "tr",
                   stem_path: str | None = None,
                   calibrated_threshold: float | None = None, **kwargs) -> dict:
    """LINE-AWARE evaluation — the form real lyrics need, and the one a measurement forced.

    MEASURED PROBLEM (this session, on our own tr-R0 take 1): the singer repeated every line
    ("Kapıyı çal" three times), so the ASR transcript has 9 lines against a 3-line reference. Scored
    as one flat sequence, those repetitions become INSERTIONS and PER explodes — but a repetition is
    not an intelligibility failure, it is the arrangement. Charging it would make the gate reject
    correct singing, which is exactly the guessed-threshold defect class this project has paid for
    (a guessed motion floor of 0.08 rejected all seven correct shots).

    So: each REFERENCE LINE is scored against its BEST-MATCHING transcript line (minimum PER; a
    transcript line may match more than once, because a repeat is legitimate). The overall number is
    the phoneme-weighted mean over reference lines. Transcript lines that matched nothing are
    reported in `extra_lines` — visible, never silently charged and never silently dropped.
    """
    entry = _language_entry(language)
    if entry is None:
        return _refusal(language)
    g2p = entry["module"]()

    # SYMMETRY (measured 2026-08-24, vocadito track 10): the reference is segmented on commas but the
    # transcript was not, so one long ASR line ("Fine bog, a handsome bog, a bog down in the valley")
    # matched a short reference line and its remainder was charged as INSERTIONS — a near-perfect
    # transcript measured PER 1.0. Both sides now receive the IDENTICAL segmentation rule; an
    # instrument whose two inputs are prepared differently is measuring its own asymmetry, not the
    # singing (same class as the astats/reset=N defect in MEMORY.md).
    ref_lines = [l.strip() for l in lyric.replace(",", "\n").splitlines() if l.strip()]
    hyp_lines = [l.strip() for l in (transcript or "").replace(",", "\n").splitlines() if l.strip()]
    if not ref_lines:
        raise ValueError("no reference lines; refusing to score")

    per_line: list[dict] = []
    used: set[int] = set()
    hypothesis_unresolved: set[str] = set()
    total_errors = 0.0
    total_ref_phones = 0
    for ref_line in ref_lines:
        ref = g2p.text_to_phonemes(ref_line)
        _assert_no_unresolved(f"reference line {ref_line!r}", ref)
        lattice = [[w["phonemes"], *(v for v in w.get("variants", []))] for w in ref["words"]]
        n_ref = len(ref["phonemes"])
        best = None
        for index, hyp_line in enumerate(hyp_lines):
            hyp = g2p.text_to_phonemes(hyp_line)
            # An unresolved TRANSCRIPT word (possible in EN: the ASR may emit anything) is not ours
            # to fix: its phonemes are simply absent, which charges DELETIONS to the singer — a
            # PESSIMISTIC bias, reported below, never a silent optimism (the TR-vocable precedent).
            hypothesis_unresolved.update(hyp.get("unresolved_words") or [])
            if not hyp["phonemes"]:
                continue
            per, alignment, _ = phoneme_error_rate_over_variants(lattice, hyp["phonemes"])
            if best is None or per < best[0]:
                best = (per, alignment, index, hyp_line)
        if best is None:
            per_line.append({"reference_line": ref_line, "per": 1.0, "matched_line": None,
                             "reason": "no transcript line carried any phonemes"})
            total_errors += n_ref
            total_ref_phones += n_ref
            continue
        per, alignment, index, hyp_line = best
        used.add(index)
        total_errors += per * n_ref
        total_ref_phones += n_ref
        per_line.append({
            "reference_line": ref_line, "matched_line": hyp_line, "per": round(per, 4),
            "reference_phonemes": n_ref,
            "errors": {"substitutions": alignment.substitutions, "deletions": alignment.deletions,
                       "insertions": alignment.insertions, "hits": alignment.hits},
            "error_phonemes": [{"op": op, "ref": r, "hyp": h}
                               for op, r, h in alignment.operations if op != "="],
        })

    overall = total_errors / total_ref_phones if total_ref_phones else 1.0
    verdict = "NOT_CALIBRATED"
    if calibrated_threshold is not None:
        verdict = "PASS" if overall <= calibrated_threshold else "FAIL"

    return {
        "per": round(overall, 4),
        "verdict": verdict,
        "threshold": calibrated_threshold,
        "companion_metrics": companion_metrics(lyric, transcript, language),
        "aligner_priors": aligner_priors_status(),
        "berk_verdict": berk_verdict_field(),
        "per_line": per_line,
        "extra_lines": [l for i, l in enumerate(hyp_lines) if i not in used],
        "counts": {"reference_lines": len(ref_lines), "transcript_lines": len(hyp_lines),
                   "reference_phonemes": total_ref_phones},
        "transcript_unresolved_words": sorted(hypothesis_unresolved),
        "protocol": {
            "language": language,
            "symbol_set": entry["symbol_set"],
            "measured_on": "separated vocal stem" if stem_path else "UNSPECIFIED — a PER on the MIX "
                                                                    "is a different instrument (C09)",
            "stem_path": stem_path,
            "scoring": "per reference LINE against its best-matching transcript line; repeats are "
                       "the arrangement and are NOT charged as insertions; unmatched transcript "
                       "lines are reported in extra_lines",
            "reference": "LATTICE — per-word pronunciation variants from the language's MFA lexicon",
            "phonemiser": entry["phonemiser"],
            "metric": "PER = (S+D+I)/len(reference), phoneme-symbol units, phoneme-weighted mean "
                      "over reference lines",
            "threshold_status": entry["threshold_status"],
            "transcript_unresolved_bias": ("unresolved transcript words carry no phonemes and are "
                                           "charged as deletions — PESSIMISTIC, never optimistic"
                                           if hypothesis_unresolved else None),
            **{k: v for k, v in kwargs.items()},
        },
    }


def evaluate(*, lyric: str, transcript: str, language: str = "tr",
             separator: str = "Mel-Band RoFormer / Kim Vocal (MIT) — D-SSM-26",
             asr: str = "stt_vertex (Gemini 2.5 Pro, :generateContent)",
             stem_path: str | None = None,
             calibrated_threshold: float | None = None) -> dict:
    """Measure lyric intelligibility and return the number WITH the protocol that produced it.

    `calibrated_threshold` is None until a labelled calibration set exists; the verdict is then
    `NOT_CALIBRATED` and the number is explicitly not a pass/fail. This is the honest shape: the
    architecture promises a protocol-labelled PER, not an unbacked green tick.
    """
    entry = _language_entry(language)
    if entry is None:
        return _refusal(language)
    g2p = entry["module"]()

    ref = g2p.text_to_phonemes(lyric)
    _assert_no_unresolved("reference lyric", ref)
    hyp = g2p.text_to_phonemes(transcript or "")
    # The reference is a LATTICE, not a string: the MFA dictionary carries pronunciation variants
    # (measured this session: `öğle` -> `øː ʎ e` | `øː ʎ ɛ`), and charging an error to the singer for
    # producing the other variant would measure the dictionary's row order, not the singing.
    lattice = [[w["phonemes"], *(v for v in w.get("variants", []))] for w in ref["words"]]
    if not hyp["phonemes"]:
        # A silent/empty transcript is a REAL result (nothing intelligible was sung) and is reported
        # as PER 1.0 with the reason, never as a missing measurement.
        per, alignment, chosen = 1.0, align(ref["phonemes"], []), [w["phonemes"] for w in ref["words"]]
    else:
        per, alignment, chosen = phoneme_error_rate_over_variants(lattice, hyp["phonemes"])

    verdict = "NOT_CALIBRATED"
    if calibrated_threshold is not None:
        verdict = "PASS" if per <= calibrated_threshold else "FAIL"

    return {
        "per": round(per, 4),
        "verdict": verdict,
        "threshold": calibrated_threshold,
        "companion_metrics": companion_metrics(lyric, transcript, language),
        "aligner_priors": aligner_priors_status(),
        "berk_verdict": berk_verdict_field(),
        "counts": {"reference_phonemes": len(ref["phonemes"]),
                   "hypothesis_phonemes": len(hyp["phonemes"]),
                   "substitutions": alignment.substitutions,
                   "deletions": alignment.deletions,
                   "insertions": alignment.insertions,
                   "hits": alignment.hits},
        "reference": {"text": lyric, "phonemes": ref["phonemes"], "tiers": ref["tier_counts"],
                      "scored_path": [p for v in chosen for p in v],
                      "variant_scoring": "reference is a LATTICE: per word, the pronunciation "
                                         "variant that best explains the singing is scored, so a "
                                         "correct alternate pronunciation is not charged as an error"},
        "hypothesis": {"text": transcript, "phonemes": hyp["phonemes"], "tiers": hyp["tier_counts"],
                       "unresolved_words": hyp.get("unresolved_words") or []},
        "protocol": {
            "language": language,
            "symbol_set": entry["symbol_set"],
            "measured_on": "separated vocal stem" if stem_path else "UNSPECIFIED — a PER on the MIX "
                                                                    "is a different instrument (C09)",
            "stem_path": stem_path,
            "separator": separator,
            "asr": asr,
            "phonemiser": entry["phonemiser"],
            "metric": "PER = (S+D+I)/len(reference), phoneme-symbol units",
            "threshold_status": entry["threshold_status"],
        },
        "alignment_errors": [{"op": op, "ref": r, "hyp": h}
                             for op, r, h in alignment.operations if op != "="],
    }
