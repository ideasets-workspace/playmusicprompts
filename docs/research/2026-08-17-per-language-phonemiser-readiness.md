# Per-language phonemiser readiness for the sung PER calibration — English delivered, French measured and blocked on one decision

**Date:** 2026-08-17 · **Author:** engine lane (`generate_music_hybrid_model`) · **Spend:** $0 (all
measurements are local reads of files already on disk; one $0 dictionary download from the MFA release)

**Decision this document serves:** D-SSM-34 ordered the sung lane to target EVERY language in the
language registry, and the nine-language corpus research (
`docs/research/2026-08-17-multilingual-sung-calibration-corpora.md`) established WHICH languages have a
lawful human-sung corpus. That research answered the CORPUS question. It did not answer the second
question that gates the same work, which this document answers with measurements: **for each language
with a lawful corpus, does a phonemiser exist that can turn its lyrics into a reference the PER gate
will accept — and if not, exactly what is missing?**

---

## Outcome first

**English is DELIVERED and deployed.** The gate is no longer Turkish-only:
`generate_music_hybrid_model/music_studio/g2p_en.py` phonemises English through the shipped MFA
`english_us_mfa` dictionary plus a variant-rule tier whose every rule is a distribution measured from
the dictionary's own inflection pairs, and
`generate_music_hybrid_model/music_studio/per_gate.py` now dispatches per language. Control suites:
`scripts/test_g2p_en.py` 24 of 24 assertions, `scripts/test_per_gate.py` 40 of 40.

**French is BLOCKED, and the block is a decision for Berk, not a technical impossibility.** The French
corpus is already on disk and lawful, the French MFA dictionary is now on disk and lawful, and the
measured position is this: **only 4 of the 9 French vocadito tracks are fully phonemisable by the
dictionary alone, and the registry's own sample floor is 5.** The gap is 1 track. Every candidate rule
that would close it was tested against the French dictionary's own entries and none reproduced its own
class, so adopting one would be inventing pronunciations — which this project forbids by name.

**The one exact question Berk must answer for French is in section 6.** Everything that does not depend
on his answer has already been built and deployed.

---

## 1. What was measured, in order, with the numbers

### 1.1 English lexicon coverage of the English vocadito lyrics

Instrument: `scripts/measure_vocadito_en_lexicon_coverage.py`, then generalised into the
language-parametric `scripts/measure_vocadito_lexicon_coverage.py`.

| Quantity | Value |
|---|---|
| English tracks in vocadito | 17 |
| Distinct word types in their lyrics | 244 |
| Total word tokens | 668 |
| Dictionary entries (`english_us_mfa.dict`) | 61,061 |
| Type coverage, dictionary alone | 0.9549 |
| Token coverage, dictionary alone | 0.9656 |

The out-of-vocabulary list was not a random tail. It fell into named classes: g-dropped participles
(`tryin'`, `rattlin'`, `darlin'`), clitics (`heart's`, `doggie's`, `you'll`), a reduced form
(`'cause`), an inflected form whose base is present (`coughs`), a hyphenated refrain word
(`valley-o`) and three nursery-rhyme words with no base at all (`itsy`, `bitsy`, `waggedy`).

### 1.2 The English variant rules, measured rather than recalled

Instrument: `scripts/measure_en_variant_rules_from_lexicon.py`. For every pair `(base, base+suffix)`
where BOTH forms are dictionary entries and the inflected pronunciation EXTENDS the base
pronunciation, the appended phone material was counted, conditioned on the base's final phone.

| Suffix | Extending pairs measured | Distinct base-final phones conditioned | Majority appended material examples |
|---|---|---|---|
| `s` (plural / third person singular) | 7,364 | 40 | after `t` → `s` (1,096 of 1,096) · after `d` → `z` (476 of 477) · after `s` → `ɪ z` (236 of 260) · after `dʒ` → `ɪ z` (111 of 111) |
| `ed` (past) | 1,372 | — | `d` 892 · `t` 450 |
| `'s` (possessive or *is*) | 10 | — | `z` 7 · `s` 2 (too few pairs to condition 40 finals, so the plural map is used and that substitution is stated in the rule file) |
| `'ll` (*will*) | 2 | — | `ɫ̩` 1 · `ə ɫ` 1 — both emitted as variants, the primary chosen by a documented lexicographic tie-break rather than by preference |

The g-dropping rule is not an assumption either: the dictionary itself carries **45** orthographic
`-ing` entries pronounced with a final `ɪ n` instead of `ɪ ŋ` (out of 3,957 `-ing` entries), so the
g-dropped realisation is the dictionary's own convention.

### 1.3 A rule that was tested and REFUTED, and therefore not shipped

The obvious way to resolve `valley-o` is to split on the hyphen and concatenate the two parts'
pronunciations. That candidate was tested against the only evidence that can judge it — the
dictionary's own 8 hyphenated entries, 5 of which have both parts present as entries:

| Entry | Concatenation reproduces the entry? | Difference |
|---|---|---|
| `tik-tok` | yes | — |
| `zig-zag` | yes | — |
| `avant-garde` | **no** | entry `ə v ɛ n t ...` vs concatenation `æ v ə n t ...` |
| `kung-fu` | **no** | entry `kʰ ʉ ŋ ...` vs concatenation `kʰ ʊ ŋ ...` |
| `uh-huh` | **no** | entry `ɐ h ɐ` vs concatenation `ɐ h ə` |

Three of five fail, all by vowel quality. The rule was therefore NOT adopted, `valley-o` remains
honestly unresolved, and the refutation is recorded inside the generated rule file
`generate_music_hybrid_model/music_studio/data/g2p_en.json` under `hyphen_compound_rule` so no future
agent re-adds it from intuition.

### 1.4 What the English module resolves, end to end

Measured by `scripts/test_g2p_en.py` over all 17 English tracks: **658 of 668 tokens resolve**
(0.9850). The 10 that do not are `valley-o` (5), `itsy` (2), `bitsy` (2), `waggedy` (1). They are
returned with `tier="unresolved"` and no phonemes, and the gate refuses a reference that contains
them rather than scoring around them.

---

## 2. Why the gate REFUSES instead of scoring around an unresolved word

`per_gate._assert_no_unresolved` raises, naming the words, when a reference lyric contains a word the
phonemiser cannot resolve. This is deliberate and it is the same law that produced the syllable-error-
rate refusal: a phoneme error rate whose denominator quietly excludes the words the system could not
handle is a **narrowed denominator**, the defect class this project measured on 2026-08-13 when a
corpus of 384 files was reported as 81 by excluding a directory. A reference with a hole in it would
make the gate look better exactly where the engine is weakest.

The asymmetric case is handled asymmetrically and stated: an unresolved word in the **transcript**
(the automatic speech recognition output, which we do not control) contributes no phonemes and is
therefore charged as deletions. That is **pessimistic** — it can only make a take look worse, never
better — and `evaluate_lines` reports it in
`protocol.transcript_unresolved_bias` together with the word list in `transcript_unresolved_words`.

---

## 3. The French measurements

### 3.1 The dictionary: discovered, verified, downloaded, licensed

The French dictionary was not guessed from a URL pattern. The MFA models repository was queried
through the GitHub contents API, which listed `dictionary/french/mfa`, and the release
`dictionary-french_mfa-v3.0.0` (published 2024-03-13) was read for its asset and its licence line,
which states **CC BY 4.0**. The asset was then downloaded with its size asserted against the value the
release API reported.

| Quantity | Value |
|---|---|
| File | `generate_music_hybrid_model/music_studio/data/lexicon/french_mfa.dict` |
| Bytes | 4,583,435 (asserted equal to the release API's own figure) |
| SHA-256 | `e28e20fceb4141221df9de6abb8fd96f26ed57f1a5a9429a9380905b0b4616d7` |
| Lines | 107,172 |
| Unique words | 105,731 |
| Licence | CC BY 4.0 (release body, read this session) |

### 3.2 A metadata defect in the corpus, found by the coverage measurement

The first French coverage run returned type coverage 0.8358 and token coverage 0.8730, and its
out-of-vocabulary list was full of English words: `the`, `have`, `roof`, `leather`, `howling`,
`shanty`. The probe `scripts/probe_vocadito_fr_purity_and_elision.py` located the cause per track:

| Track | Tokens | English-marker hits | First line |
|---|---|---|---|
| 13 | 43 | **19** | `oh the hinges are of leather` |
| 23 | 34 | 0 | `une souris verte` |
| 24 | 20 | 0 | `petit escargot porte sur son dos` |
| 25 | 20 | 0 | `frère jacques` |
| 26 | 40 | 0 | `la digue du cul la digue du cul` |
| 27 | 19 | 0 | `ainsi font, font, font` |
| 28 | 24 | 0 | `il était un petit navire` |
| 29 | 21 | 0 | `les petits poissons dans l'eau` |
| 31 | 23 | 0 | `un crocodile` |

**Track 13 is labelled `French` in `vocadito_metadata.csv` and its lyrics are English.** This is a
defect in the corpus metadata, not in our instrument, and it matters for the count Berk was given:
the nine-language research reported the French leg as n=10 from the paper's Figure 1, the on-disk
metadata says 9 pure-French plus 1 `French+English`, and now one of those 9 turns out to carry English
lyrics. The honest count of usable pure-French tracks is therefore **8**, before phonemisation is even
considered. Excluding track 13, French coverage rises to type 0.9184 and token 0.9403, and the
remaining out-of-vocabulary types are only 8: `l'eau` (3), `trempez-la` (2), `crocrocros` (2),
`l'herbe`, `l'attrape`, `l'huile`, `p'tits`, `humm-mm-mm`.

The exclusion is not hidden: `scripts/measure_vocadito_lexicon_coverage.py` takes an explicit
`--exclude-track` argument and ECHOES every exclusion in its output, so a coverage number can never
be quoted without its denominator.

### 3.3 The French elision rule candidate, measured and refuted

French writes elision inside a single token (`l'eau`, `j'ai`, `qu'il`). The dictionary carries 574
apostrophe entries, including the clitics themselves (`l'`, `d'`, `j'`, `qu'`, `n'`, `m'`, `s'`, `t'`,
`c'`, `ç'`, `z'`), but it does NOT carry `l'eau`, `l'herbe`, `l'huile` or `l'attrape`. The candidate
rule — split at the apostrophe, concatenate the clitic's pronunciation with the tail word's — was
tested by `scripts/measure_fr_variant_rules_from_lexicon.py` on the 312 apostrophe entries whose both
parts are themselves entries.

The pooled reproduction rate was 0.6667, and that number is **not** the criterion: the pool is
polluted by English possessive entries the French dictionary also carries (`a's`, `artist's`,
`ayer's`), whose tail is the letter name `ɛ s`. Reported per clitic instead:

| Clitic | Exact reproductions | Rate | Example failure |
|---|---|---|---|
| `d'` | 85 of 88 | 0.9659 | `d'enseignants`: entry `d ɑ̃ s e ɲ ɑ̃` vs concatenation `d ɑ̃ s ɛ ɲ ɑ̃` |
| `l'` | 44 of 48 | 0.9167 | `l'a`: entry `l a` vs concatenation `l ɑ` |
| `n'` | 11 of 15 | 0.7333 | `n'a`: entry `n a` vs concatenation `n ɑ` |
| `jusqu'` | 7 of 9 | 0.7778 | `jusqu'aujourd'hui`: `ʒ u ʁ` vs `ʒ ɔ ʁ` |
| `m'` | 1 of 4 | 0.25 | `m'a`: entry `m a` vs concatenation `m ɑ` |
| `j'` | 0 of 2 | 0.0 | `j'ai`: entry `ʒ e` vs concatenation `ʒ ɛ` |

Every failure is a **vowel-quality** difference: the standalone dictionary form of a short function
word carries its isolated realisation, which is not its realisation inside the elided form. Tail
length was then measured as the candidate conditioning variable, and it does not give a usable
threshold either — lengths 8, 9, 13, 14 and 15 reproduce at 1.0 while lengths 10, 11 and 12 reproduce
at 0.92, 0.88 and 0.83. Any cut-off would be cherry-picked, so **the rule is refuted and not adopted**.

The hyphen rule is not even measurable for French: the dictionary contains **zero** hyphenated
entries (verified against a raw substring count as an instrument control inside the script, which
raises if the loop and the control disagree), so `trempez-la` has no evidence base at all.

### 3.4 The consequence, per track

`scripts/measure_track_resolvability.py` reads the sample floor out of the registry's own bar reason
(so the floor is imported, not retyped) and measures each track:

| Track | Verdict | Words that exclude it |
|---|---|---|
| 13 | EXCLUDED | 14 English words (see 3.2) |
| 23 | EXCLUDED | `l'attrape`, `l'eau`, `l'herbe`, `l'huile`, `trempez-la` |
| 24 | **RESOLVABLE** | — |
| 25 | **RESOLVABLE** | — |
| 26 | **RESOLVABLE** | — |
| 27 | EXCLUDED | `humm-mm-mm`, `p'tits` |
| 28 | **RESOLVABLE** | — |
| 29 | EXCLUDED | `l'eau` |
| 31 | EXCLUDED | `crocrocros` |

**4 resolvable against a floor of 5.** Artefact: `artifacts/music-studio/track_resolvability_fr.json`.

Note the shape of the four remaining exclusions: two are single-word blocks (`l'eau` on track 29,
`crocrocros` on track 31) and one is a vocable plus an apocope (`humm-mm-mm`, `p'tits` on track 27).
This is not a deep linguistic gap; it is a handful of tokens. That is exactly why it must go to Berk
rather than be resolved by an agent inventing four pronunciations.

---

## 4. What was built and deployed as a result

| Artefact (absolute path) | Nature |
|---|---|
| `C:\Berk\SsmContentAssetCreator\generate_music_hybrid_model\music_studio\g2p_en.py` | English phonemiser, `g2p_tr`-compatible interface, lexicon tier plus measured variant tier, no letter-to-sound guesser |
| `C:\Berk\SsmContentAssetCreator\generate_music_hybrid_model\music_studio\data\g2p_en.json` | GENERATED rule evidence; hand-editing forbidden in its header |
| `C:\Berk\SsmContentAssetCreator\scripts\build_g2p_en_rules.py` | The only lawful writer of that file |
| `C:\Berk\SsmContentAssetCreator\scripts\measure_en_variant_rules_from_lexicon.py` | The measurement the rule file is derived from |
| `C:\Berk\SsmContentAssetCreator\generate_music_hybrid_model\music_studio\per_gate.py` | Language dispatch table, per-language symbol sets and threshold statuses, refusal by name for unsupported languages |
| `C:\Berk\SsmContentAssetCreator\scripts\test_g2p_en.py` | 24 of 24, including negative controls and the corpus-resolution leg |
| `C:\Berk\SsmContentAssetCreator\scripts\test_per_gate.py` | 40 of 40, including two new English legs and the refusal leg re-pinned onto a genuinely unsupported language |
| `C:\Berk\SsmContentAssetCreator\generate_music_hybrid_model\music_studio\data\lexicon\french_mfa.dict` | French dictionary, CC BY 4.0, size-asserted, hashed |
| `C:\Berk\SsmContentAssetCreator\scripts\measure_vocadito_lexicon_coverage.py` | Language-parametric coverage instrument with explicit, echoed exclusions |
| `C:\Berk\SsmContentAssetCreator\scripts\measure_track_resolvability.py` | Per-track resolvability against the registry's imported floor |
| `C:\Berk\SsmContentAssetCreator\scripts\measure_fr_variant_rules_from_lexicon.py` | French rule measurement with its own instrument control |
| `C:\Berk\SsmContentAssetCreator\scripts\probe_vocadito_fr_purity_and_elision.py` | The probe that found the mislabelled track |

Deployment: the package zip was rebuilt (import-closure control and in-archive controls passed) and
uploaded to the Lambda `ssm-content-worker-generate-music-hybrid-model`; the deployed
`CodeSha256` equalled the locally computed digest of the archive on every one of the three
deployments made while this work landed.

---

## 5. Honest limits of this document

The English phone set was measured at **79** distinct symbols in the shipped dictionary, and no
allophone fold was applied for English because no phone-set mismatch has been MEASURED for it (the
Turkish fold exists only because a 70-versus-65 mismatch between that dictionary and its own G2P model
was measured). If English ever gains a neural tier, that measurement must be made first.

The registry's `bar` for English still reads NOT_MEASURED, correctly: a phonemiser is not a
calibration. The calibration itself needs one paid speech-to-text transcription per recording, and no
budget has been declared, so that leg is fail-closed and has not been run.

The French block stated here is a block on the LEXICON-ONLY path with the corpus as it stands on disk.
It is not a claim that French is impossible: section 6 names two routes that would resolve it, both of
which need a decision that is genuinely Berk's.

---

## 6. The decision French is waiting on

**Updated 2026-08-17 with a measurement that removes one of the two routes I first offered.** I
pursued the no-new-dependency route to completion and it does not exist: the lexicon-only path was
tested the right way and refuted, and the corpus-supplement route hits the same wall.

**What was measured (both scripts read-only, $0):**
- `scripts/measure_fr_oov_decomposition.py` — the 8 blocking out-of-vocabulary tokens are four
  elision+noun forms (`l'eau`, `l'herbe`, `l'huile`, `l'attrape`), one apocope (`p'tits` ← `petit`),
  one inflected verb (`trempez` ← `tremper`), and two vocables (`crocrocros`, `humm-mm-mm`, which the
  vocable exemption already covers).
- `scripts/measure_fr_elision_by_tail_class.py` — the elision rule's reproduction rate against the
  dictionary's OWN apostrophe entries, by tail-syllable count: **0.59 / 0.86 / 0.98 / 0.86 / 1.0 /
  1.0** for 1..6-syllable tails, **polysyllabic pooled 155 of 170 = 0.9118**. Every miss is a
  vowel-quality or nasalisation change the standalone entry does not carry (`d'enseignants` `e` ≠ `ɛ`,
  `d'intervention` `i` ≠ `ɛ̃`). A phonemiser step that is right about nine words in ten is not lawful
  here — it is a guessed pronunciation for the tenth, which Clause 4 forbids.

**Why this collapses the choice to one route.** French elision changes vowel quality per syllable, and
the shipped dictionary only knows the correct elided pronunciation when it carries the elided form
itself — which it does not for `l'eau`, `l'herbe`, `l'huile`. Adding the JamendoLyrics French tracks
(route 1) does not change this: those tracks are full pop and jazz mixes whose lyrics contain the same
elisions and would hit the same wall, and they are **not on disk** (I wrongly said they were earlier
this session and withdraw it). So route 1 buys nothing for the phonemiser problem; it only widens the
calibration genre.

**The single question, unchanged in substance but now the ONLY route:** may the French path adopt a
**sourced French grapheme-to-phoneme model** (the MFA French G2P of the same release family as the
dictionary already on disk), which is the same class of third-party model dependency as the Turkish
tier-3 model that D-SSM-24's Google-only constraint currently blocks? There is no lawful
lexicon-only or corpus-only French path — that has now been measured and refuted, not assumed. If the
answer is no, French stays honestly `NO_PHONEMISER` on the discoverable surface (which it already does)
and is delivered only if the Google-only constraint is widened.

