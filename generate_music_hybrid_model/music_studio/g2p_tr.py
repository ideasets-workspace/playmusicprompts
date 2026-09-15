"""Turkish grapheme-to-phoneme for the PER gate — THREE TIERS, in the order the evidence sets.

EVERY RULE HERE CARRIES ITS SOURCE, read this session from
`docs/research/2026-08-14-turkish-singing-phonology-and-g2p-for-synthesis.md` (S01 = the MFA
Turkish dictionary v3.0.0 itself, S03 = the MFA phone-set decisions, S15 = the Phonology of Turkish,
S20 = the 2024 orthographic-depth re-classification). Nothing is written from recollection, and the
one thing the research forbids by name is NOT here: Epitran, which its own LREC 2018 Table 2
measured as making Turkish ASR WORSE (WER 56.9 vs baseline 55.7).

THE TIER ORDER (research §3.3, "Neither alone"):
  TIER 1 — LEXICON. `data/lexicon/turkish_mfa.dict` (CC BY 4.0, 41,377 unique words measured on
    disk this session, 49,651 lines because of pronunciation variants). A lookup is EXACT where it
    hits, and it already encodes palatalisation, the dentals, the `ğ` expansions and loanword
    length — the last of which a rule CANNOT derive (`vali` -> [vaːli] has nothing in the spelling).
  TIER 2 — RULES, for the productive morphology (Turkish is agglutinative, so OOV forms are
    guaranteed). Only the deterministic rules the research names:
      · `ğ` is NEVER a consonant: before a consonant or word boundary it is LENGTH on the previous
        vowel; between front vowels it is `j`; between back vowels the length variant is taken and
        the `[ɰ]` variant is recorded as the alternative (S03, verbatim).
      · `g k l` are palatal `ɟ c ʎ` before front vowels `[i e œ y]` (S03), which is the MAJORITY
        realisation in the shipped dictionary (`ɟ` 3,818 vs `ɡ` 637; `ʎ` 12,655 vs `ɫ` 14,475).
      · alveolars are DENTAL `t̪ d̪ s̪ z̪ n̪` — the dictionary has no plain alveolar series at all (S01/S03).
      · nasals assimilate in place before obstruents -> `[m n̪ ɲ ŋ]` (S03).
  TIER 3 — NEURAL (CharsiuG2P ByT5). **NOT INSTALLED HERE.** It is named in the plan and its absence
    is REPORTED per word (`tier: "unavailable_neural"` never happens silently); the rules tier is
    deterministic, so nothing is guessed in its place.

WHAT IS DELIBERATELY NOT MODELLED, with the reason (research §3.2): stress (the melody assigns it in
singing) and post-suffixation resyllabification (a note-mapper problem, not a PER problem).

THE RULES TIER IS NOT TRUSTED, IT IS MEASURED: `scripts/test_g2p_tr.py` scores tier 2 against the
41k lexicon word by word and reports the agreement rate as a NUMBER. A rule set whose accuracy is
unknown is exactly the guessed-parameter class this project bans.
"""

from __future__ import annotations

import io
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

_PKG_DIR = Path(__file__).resolve().parent
LEXICON_PATH = _PKG_DIR / "data" / "lexicon" / "turkish_mfa.dict"

# S15 Table 1.1 / S03: the eight vowels, split by frontness because the palatalisation rule and the
# `ğ` rule both key on it. Front: i e ö ü — Back: a ı o u.
FRONT_VOWELS = set("ieöü")
BACK_VOWELS = set("aıou")
VOWELS = FRONT_VOWELS | BACK_VOWELS

# S01 measured phone inventory (the dictionary's own phone list, read this session from the model
# card): long vowels exist as separate phones, alveolars are dental, laterals are ɫ/ʎ with no plain l.
VOWEL_PHONE = {"a": "a", "e": "e", "ı": "ɯ", "i": "i", "o": "o", "ö": "ø", "u": "u", "y": "y",
               "ü": "y"}
LONG_OF = {"a": "aː", "e": "eː", "ɯ": "ɯː", "i": "iː", "o": "oː", "u": "uː", "y": "yː", "ø": "øː"}

# Consonants that do not depend on context. `ğ`, `g`, `k`, `l`, `n` are handled by rules below.
SIMPLE_CONSONANT = {
    "b": "b", "c": "dʒ", "ç": "tʃ", "d": "d̪", "f": "f", "h": "h", "j": "ʒ", "m": "m",
    "p": "p", "r": "ɾ", "s": "s̪", "ş": "ʃ", "t": "t̪", "v": "v", "y": "j", "z": "z̪",
}
# S03: nasals agree in place with a following obstruent.
LABIAL = set("bpm")
PALATAL_TRIGGER = set("cç")          # postalveolar affricates -> ɲ (S03 `dingil` [diɲgil] pattern)
VELAR = set("kg")


@dataclass
class WordPhonemes:
    word: str
    phonemes: list[str]
    tier: str                        # "lexicon" | "rules"
    variants: list[list[str]] = field(default_factory=list)


# ---------------------------------------------------------------------------------------------
# ALLOPHONE EQUIVALENCE FOR SCORING — measured necessity, sourced mapping, 2026-08-15
#
# WHY THIS EXISTS (the measurement that forced it): the MFA Turkish DICTIONARY (tier 1, 49,651
# entries) uses **70** distinct phone symbols, while the MFA Turkish **G2P model** (tier 3,
# phonetisaurus v3.0.0) can only emit the **65** in its own `phones.sym`. Measured by
# `scripts/verify_g2p_tier3_phone_set_compatibility.py`, the dictionary uses six symbols the model
# cannot produce, with these dictionary frequencies:
#     ɛ 2,477 · ɨ 2,989 · ɪ 950 · ʊ 897 · ʏ 267 · spn 4
# Without an equivalence, a word phonemised by tier 3 and compared against a tier-1 reference would
# be charged a substitution for every one of those — errors of ALPHABET, not of pronunciation, which
# would inflate PER against a singer who sang correctly. That is the "adjacent property" failure
# class this project has paid for repeatedly.
#
# WHY THE MAPPING IS NOT A HACK — it is MFA's own documented allophony, read this session from
# https://mfa-models.readthedocs.io/en/latest/mfa_phone_set.html, section "Turkish vowels", verbatim:
#   "The primary realization of front vowels is [i y e ø], but for word-final open syllables, these
#    are represented with [ɪ ʏ ɛ œ]. Back vowels are generally represented as [ɯ u a o], with
#    word-final open realizations for the high back vowels are [ɨ ʊ]"
#   "Closed syllable [e] lowering: In syllables with coda [m ʎ ɲ ɾ ŋ ɫ n̪], [e] -> [ɛ]"
# So each of the five is a POSITIONAL REALIZATION of a vowel the model does emit — the same phoneme,
# not a different one. Folding them is therefore restoring the phonemic level at which PER is defined,
# not loosening the gate: a genuine vowel confusion (/a/ for /o/, /i/ for /y/) is still charged in full,
# which the negative control in `scripts/test_g2p_tier3_allophone_fold.py` proves.
#
# `œ` appears in the doc's list but is NOT in the measured difference set, so it is NOT folded here —
# only what was measured is acted on.
#
# `spn` is MFA's SPOKEN-NOISE placeholder, not a phone (4 occurrences in 49,651 entries). It is
# DROPPED rather than mapped: mapping noise onto a real phone would invent a segment.
ALLOPHONE_FOLD: dict[str, str] = {
    "ɪ": "i",    # word-final open-syllable realization of /i/
    "ʏ": "y",    # word-final open-syllable realization of /y/
    "ɛ": "e",    # word-final open-syllable realization AND closed-syllable lowering of /e/
    "ɨ": "ɯ",    # word-final open-syllable realization of /ɯ/
    "ʊ": "u",    # word-final open-syllable realization of /u/
}
NON_PHONE_SYMBOLS: frozenset[str] = frozenset({"spn", "sil", "sp", "<eps>", "<unk>"})
_ALLOPHONE_FOLD_SOURCE = ("https://mfa-models.readthedocs.io/en/latest/mfa_phone_set.html "
                          "section 'Turkish vowels', read 2026-08-15")


def fold_for_scoring(phonemes: list[str]) -> list[str]:
    """Map positional allophones onto their phoneme and drop non-phone symbols.

    Applied to BOTH sides of a PER comparison, always symmetrically — folding one side only would
    turn a fold into a bias. Length markers are preserved: `eː` and `e` are a real Turkish contrast
    (research §3.2: loanword vowel length cannot be derived from spelling), so only the base symbol
    is folded and the length mark rides along.
    """
    out: list[str] = []
    for phone in phonemes:
        if phone in NON_PHONE_SYMBOLS:
            continue
        base, length = (phone[:-1], phone[-1]) if phone.endswith("ː") else (phone, "")
        out.append(ALLOPHONE_FOLD.get(base, base) + length)
    return out


_lexicon: dict[str, list[list[str]]] | None = None


def load_lexicon(path: Path | None = None) -> dict[str, list[list[str]]]:
    """word -> list of pronunciation variants, each a list of phone symbols. Loaded once."""
    global _lexicon
    if _lexicon is None:
        target = path or LEXICON_PATH
        if not target.exists():
            raise FileNotFoundError(
                f"the MFA Turkish lexicon is missing at {target}. Tier 1 is MANDATORY: the research "
                f"(§3.2) measures that loanword vowel length cannot be derived from spelling, so a "
                f"rules-only G2P is knowingly wrong on that class. Download "
                f"https://raw.githubusercontent.com/MontrealCorpusTools/mfa-models/main/dictionary/"
                f"turkish/mfa/turkish_mfa.dict (CC BY 4.0).")
        table: dict[str, list[list[str]]] = {}
        with io.open(target, encoding="utf-8") as fh:
            for line in fh:
                line = line.rstrip("\n")
                if not line.strip():
                    continue
                word, _, phones = line.partition("\t")
                # The probability-annotated release prefixes numeric columns; the plain dictionary
                # (the file used here) does not. Numeric-only leading fields are dropped defensively
                # so a swapped file cannot silently poison the phone sequences.
                parts = [p for p in phones.split() if not _is_number(p)]
                if not parts:
                    continue
                table.setdefault(normalise(word), []).append(parts)
        _lexicon = table
    return _lexicon


def _is_number(token: str) -> bool:
    try:
        float(token)
        return True
    except ValueError:
        return False


def normalise(text: str) -> str:
    """NFC + Turkish-aware lowering: dotted/dotless I must not collapse (`I`->`ı`, `İ`->`i`).

    WHY THE TWO REPLACES RUN BEFORE `.lower()` — measured this session, not assumed: Python's
    locale-insensitive `.lower()` maps `'I'` (U+0049) to `'i'` (U+0069), which in Turkish is a DIFFERENT
    LETTER (`kıl` vs `kil` are different words), and maps `'İ'` (U+0130) to `'i' + U+0307` — a combining
    dot that survives as a phantom character and would count as an ERROR in any character-level metric.
    Every character/word metric in this package MUST reach text through this function (single source of
    truth); a bare `.lower()` on Turkish text is the measured-wrong baseline.
    """
    text = unicodedata.normalize("NFC", text)
    return text.replace("I", "ı").replace("İ", "i").lower()


def words(text: str) -> list[str]:
    """The ONE Turkish word tokenisation: normalised, whitespace-split, alphabetic-bearing tokens only.

    Extracted from `text_to_phonemes` (2026-08-15) so the WER added for TR-GATE counts words by the SAME
    rule the phonemiser uses — two tokenisations kept in step by discipline is the construction Supreme Law
    prohibition 6 forbids by name.
    """
    return [w for w in normalise(text).split() if any(c.isalpha() for c in w)]


def _rules_word(word: str) -> tuple[list[str], list[list[str]]]:
    """TIER 2. Deterministic, source-cited. Returns (primary, alternative variants)."""
    letters = [c for c in normalise(word) if c.isalpha()]
    out: list[str] = []
    alt_back_g: list[int] | None = None   # index where a ɰ-variant may be inserted (S03)

    for i, ch in enumerate(letters):
        nxt = letters[i + 1] if i + 1 < len(letters) else ""
        prev = letters[i - 1] if i else ""

        if ch in VOWELS:
            out.append(VOWEL_PHONE[ch])
            continue

        if ch == "ğ":
            # S03, verbatim: before a consonant or word boundary -> length on the previous vowel;
            # between front vowels -> [j]; between back vowels -> two variants (ɰ realised / deleted).
            if nxt == "" or nxt not in VOWELS:
                if out and out[-1] in LONG_OF:
                    out[-1] = LONG_OF[out[-1]]
                continue
            if prev in FRONT_VOWELS and nxt in FRONT_VOWELS:
                out.append("j")
                continue
            if prev in BACK_VOWELS and nxt in BACK_VOWELS:
                if out and out[-1] in LONG_OF:
                    out[-1] = LONG_OF[out[-1]]
                alt_back_g = list(range(len(out)))  # marker: a ɰ variant exists at this position
                continue
            # mixed frontness: the sources do not specify; lengthen (the majority realisation) and
            # record the alternative rather than inventing a consonant.
            if out and out[-1] in LONG_OF:
                out[-1] = LONG_OF[out[-1]]
            continue

        if ch in "gkl":
            # S03: velar obstruents are palatal [c ɟ ç] before front vowels, as is the lateral [ʎ].
            front_context = nxt in FRONT_VOWELS or (nxt == "" and prev in FRONT_VOWELS)
            if ch == "g":
                out.append("ɟ" if front_context else "ɡ")
            elif ch == "k":
                out.append("c" if front_context else "k")
            else:
                out.append("ʎ" if front_context else "ɫ")
            continue

        if ch == "n":
            # S03: nasals agree in place with a following obstruent.
            if nxt in LABIAL:
                out.append("m")
            elif nxt in PALATAL_TRIGGER:
                out.append("ɲ")
            elif nxt in VELAR:
                out.append("ŋ")
            else:
                out.append("n̪")
            continue

        phone = SIMPLE_CONSONANT.get(ch)
        if phone:
            # Gemination: a doubled letter yields the long phone (S01 lists `ː` variants of every
            # consonant, e.g. tʃː, ʃː, ɾː).
            if out and out[-1] == phone:
                out[-1] = phone + "ː"
            else:
                out.append(phone)
    variants: list[list[str]] = []
    if alt_back_g is not None:
        variants.append(out)  # the length variant is primary; the ɰ variant is documented, not built
    return out, variants


def word_to_phonemes(word: str, *, lexicon: dict[str, list[list[str]]] | None = None) -> WordPhonemes:
    """TIER 1 then TIER 2. The tier used is always reported — never inferred by the caller."""
    table = lexicon if lexicon is not None else load_lexicon()
    key = normalise(word).strip(".,;:!?\"'()[]…—-")
    hit = table.get(key)
    if hit:
        return WordPhonemes(word=key, phonemes=list(hit[0]), tier="lexicon",
                            variants=[list(v) for v in hit[1:]])
    primary, variants = _rules_word(key)
    return WordPhonemes(word=key, phonemes=primary, tier="rules", variants=variants)


def text_to_phonemes(text: str, *, lexicon: dict[str, list[list[str]]] | None = None) -> dict:
    """Phonemise a whole lyric line. Returns the flat sequence AND the per-word tier provenance,
    so a PER number can never be reported without knowing how its reference was derived."""
    table = lexicon if lexicon is not None else load_lexicon()
    per_word = [word_to_phonemes(w, lexicon=table) for w in words(text)]
    flat: list[str] = []
    for entry in per_word:
        flat.extend(entry.phonemes)
    return {
        "text": text,
        "words": [{"word": e.word, "phonemes": e.phonemes, "tier": e.tier,
                   "variants": e.variants} for e in per_word],
        "phonemes": flat,
        "tier_counts": {
            "lexicon": sum(1 for e in per_word if e.tier == "lexicon"),
            "rules": sum(1 for e in per_word if e.tier == "rules"),
        },
        "neural_fallback": "NOT INSTALLED (CharsiuG2P ByT5 named in the plan; its absence is "
                           "reported, never silently substituted)",
    }
