# 16 — Content Policy and the Safety Gate

Every request's text passes a content-safety gate **before** anything is planned, generated or
charged. This document states exactly what is refused, how the decision is made, what a refusal looks
like on the wire, and what the gate does when its own instrument is unavailable.

If you integrate this API, the one thing you must handle is a `400` with
`error_code: "CONTENT_REFUSED"`. Everything else here explains why it happens.

---

## 1. What is refused

Eight categories. Each is judged on the question printed beside it, which is the *same sentence* the
classifier is asked — the enforced policy and this documentation are generated from one file, so they
cannot drift apart.

| id | Türkçe | English | The question asked of the text |
|---|---|---|---|
| `violence` | Şiddet | Violence | Does the text depict, threaten, glorify or instruct physical violence against any person or animal? Metaphorical or emotional uses of violent verbs in a romantic, spiritual or sporting sense are **not** violence. |
| `violence_against_women` | Kadına şiddet | Violence against women | Does the text depict, normalise or excuse violence, coercion, degradation or control directed at a woman or at women as a group? This includes "she deserved it" framings and possessive threats. |
| `politics` | Siyaset ve politika | Politics | Is the text about party politics, elections, government policy, political movements, protests as political acts, or does it advocate for or against a political position? Songs about human dignity, peace or hardship in general terms are **not** political. |
| `real_people` | Gerçek kişi ve lider isimleri | Real people and leaders | Does the text name or unmistakably identify a real person — a head of state, politician, celebrity, athlete, business figure, religious leader or private individual? Fictional characters, mythological figures and common first names used as a sweetheart address are **not** a violation. |
| `child_sexual_content` | Pedofili ve çocuk istismarı | Child sexual content | Does the text sexualise a minor, allude to sexual contact involving a child, or express sexual interest in minors in any form, however oblique? |
| `dangerous_acts` | Tehlikeli şeyler | Dangerous acts | Does the text instruct, encourage or glamorise self-harm, suicide, weapon or explosive manufacture, drug manufacture or trafficking, or any act that would injure the listener if imitated? |
| `heavy_obscenity` | Ağır küfür | Heavy obscenity | Does the text contain **heavy** obscenity — a strong sexual or scatological profanity, a severe insult to someone's family, or a comparably crude term? **Mild swearing and everyday exclamations are not heavy.** A word that merely sounds similar to an obscenity, or contains one as a substring inside an ordinary word, is not a violation. |
| `hate_and_slurs` | Nefret söylemi ve hakaret | Hate speech and slurs | Does the text attack, demean or dehumanise a person or group on the basis of a protected attribute, or use a slur targeting one? |

`violence_against_women` is a category in its own right rather than a subcase of `violence`, because
the framings that normalise it are frequently not violent in wording (*"o benim malım"*) and a general
violence check misses them.

`hate_and_slurs` was added because each of the other six categories is reachable through a slur, and a
gate that allowed slurs while checking the six literally would satisfy the words and miss the point.

### Text that must pass, and does

These are asserted by the gate's own control on every run. If any of them ever starts being refused,
that is a bug and it is reported as one:

```
kalbime vurdun                    the beat hits hard              fırtına dağı dövüyor
barış içinde yaşamak istiyorum    we all want a better tomorrow
sevgilim Ayşe beni bekliyor       my darling Maria
kalbim yanıyor                    dancing with fire in my soul
```

Metaphor is not literal. A love lyric that uses a forceful verb is clean; a common first name used to
address a sweetheart is clean.

---

## 2. Which fields are checked

**29 fields.** Every field that carries free text and reaches the generator, is sung, or is stored and
returned by the platform:

`prompt` · `lyrics.text` · `lyrics.theme` · `negative_prompt` · `adlibs` · `lyrics_structure` ·
`song_title_in_lyrics` · `vocal_emotion` · `cultural_style` · `reference_artist_style` ·
`instrumentation_notes` · `mood_progression` · `chord_progression` · `solo_instrument` ·
`vocal_accent` · `vocal_pronunciation` · `syllable_stress` · `key_change` · `sound_fx` ·
`creative_goal` · `prompt_blocks` · `sonic_tags` · `vocal_effects` · `transitions` ·
`texture_layers` · `structure` · `lyrics_language_per_line` · `reference_tempo_source` · `labels`

`lyrics.theme` matters as much as `lyrics.text`: in `ai_write` mode the generator writes its own words
*from* the theme, so a forbidden theme produces forbidden lyrics that you never typed.

`labels` is checked even though it never reaches the generator, because it is stored and returned in
the response — forbidden content placed there would be held and served by the platform.

Chip fields (`sound_fx`, `negative_prompt`, `sonic_tags` …) are joined before checking, so a phrase
split across two chips is still seen.

### Four fields deliberately not checked

| field | why not |
|---|---|
| `project` | client-side only; never sent to the generator, never in a delivered artefact |
| `client_side_echo` | client-side only; echoed to the caller that supplied it |
| `seed` | an integer-like token consumed by the generation call; it cannot express a sentence |
| `webhook_url` | constrained to an `https` URI by the validator and used only as a destination address, never as content; it is not compiled into any prompt |

This list is enforced: the gate's control derives the required field set from the parameter
specification itself and **fails** if a free-text parameter is neither checked nor listed here with a
reason. A new free-text parameter therefore cannot slip through unchecked.

---

## 3. How the decision is made

Two layers. Both must clear the text for it to pass.

### Layer 1 — term list (free, instant, deterministic)

An unambiguous phrase is refused immediately, with no classifier call. There is no innocent reading of
`bomba yapımı`, so no interpretation step is performed and nothing is charged.

Ambiguous terms are treated as **signals only**, not verdicts, and go to layer 2 — `vur` appears in a
love lyric as often as in a violent one.

**The term data has two sources, and the difference matters:**

| source | what it covers | how it is enforced |
|---|---|---|
| hand-authored seed entries | the only term source for `violence`, `politics`, `real_people`, `child_sexual_content` and `dangerous_acts` | unambiguous phrases auto-refuse; the rest are signals |
| **imported lexicon** — [imserhatdemir/turkish-toxic-language-lexicon](https://huggingface.co/datasets/imserhatdemir/turkish-toxic-language-lexicon), CC BY 4.0, 628 rows | `hate_and_slurs`: 10 distinct sourced terms from 29 rows (sexual_orientation 22, race 4, religion 3) | **all signal-only.** Every one is marked `context_required` by the dataset, so the classifier decides |
| **imported lexicon**, same source | `heavy_obscenity`: 74 distinct terms from the 160 severity-3 obscenity rows | **18 auto-refuse** (severity 3, not context-dependent, no measured collision with ordinary Turkish) + **56 signal-only** |

**Heavy obscenity is enforced; mild swearing is not.** The lexicon grades every term 1–3. The 160 rows
at severity 3 are enforced under `heavy_obscenity`. The 439 rows at severity 1–2 (245 distinct terms —
mild and moderate swearing) are loaded but their enforcement is off, asserted by control on every build.

**A lexicon term auto-refuses only when three things all hold:** it is severity 3, the dataset does *not*
mark it `context_required`, and it does not fire on ordinary Turkish in our own measurement. The reasons
are concrete. `top oynadık sahada` ("we played ball") collides with `top`, which the lexicon also lists as
a slur and marks context-dependent. And Turkish obscenities are substrings of everyday words — `am` in
*amcam* (my uncle), `it` in *itiraf* (confession), `sik` in *sikke* (coin), `göt` in *götürdüm* (I took),
`kan` in *kanaat* (conviction) — so every auto-refuse candidate is matched against a corpus of innocent
lines before it is allowed to refuse without a classifier behind it. One heavy term was demoted to
signal-only by that check.

Matching is resistant to the obvious evasions and this is asserted by control:

* **Turkish case folding.** `BOMBA YAPIMI` matches. (Ordinary ASCII lowercasing turns `I` into `i`;
  Turkish turns it into `ı`, and a matcher that gets this wrong misses capitalised text.)
* **Leet.** `b0mba` matches.
* **Masking.** `p.e.d.o.f.i.l` and `b-o-m-b-a` match.
* **Word boundaries.** `sikke` (a coin) and `kanaat` (opinion) are **not** matched by substrings of
  other words.

The term list is a seed list for unambiguous phrases and is documented as such — it is not a complete
lexicon, and the classifier carries the substantive judgement.

### Swearing — what is refused and what is not

Heavy obscenity is refused as its own category, `heavy_obscenity`. Mild swearing is not refused.

| text | refused? | by |
|---|---|---|
| mild or moderate swearing (the lexicon's severity 1–2) | **no** | — |
| **heavy obscenity** (severity 3 — strong sexual or scatological profanity, severe family insults) | **yes** | term list for the unambiguous 18; the classifier for the rest |
| a slur attacking a protected attribute | **yes**, as `hate_and_slurs` | term list signal + classifier |

The two categories are kept separate on purpose. A `heavy_obscenity` refusal is a register problem — the
caller rewrites the word. A `hate_and_slurs` refusal is a protected-attribute problem the caller should
take seriously. Merging them would hide that difference from whoever reads `refused_categories`.

**History, so the record is honest.** The original seven categories did not name swearing, and on
2026-09-02 the classifier was measured refusing strong obscenity anyway, on its own judgement, under
`hate_and_slurs`. That gap was put to the platform owner as a decision and closed the same day: heavy
swearing is refused, as a category of its own. The word chosen was *heavy*, which is why severity 1–2
stays out.

### Layer 2 — classifier

Gemini, at **temperature 0**, asked the eight questions in section 1 and required to answer in strict
JSON. Temperature 0 is not a preference: a safety verdict must be reproducible, or the same text passes
on one attempt and fails on the next, and a caller gets anything through by retrying.

`real_people` is the category that makes the classifier structurally necessary. No dictionary can hold
the world's people, so for that category the classifier is not an enhancement — it is the mechanism.

---

## 4. What a refusal looks like

```
HTTP/1.1 400 Bad Request
```

```json
{
  "success": false,
  "error_code": "CONTENT_REFUSED",
  "error_class": "caller_fixable",
  "request_id": "…",
  "caller_action": "read content_safety.refused_categories, rewrite the named categories out of your text, and resend",
  "content_safety": {
    "allowed": false,
    "refused_categories": [
      { "id": "violence", "tr": "Şiddet", "en": "Violence" },
      { "id": "real_people", "tr": "Gerçek kişi ve lider isimleri", "en": "Real people and leaders" }
    ],
    "reason": "the text depicts physical violence and names a real public figure",
    "fields_checked": ["prompt", "lyrics.text"],
    "layers_run": ["term_list (46 patterns, 2 hit)", "classifier (gemini-2.5-flash)"],
    "instrument_failure": false,
    "policy": "the service's internal data/content_policy.json",
    "note": "The offending words are deliberately not echoed. Rewrite the named categories out of your text and resend."
  },
  "auth": { "limit": { "daily_quota": 100, "used_today": 3, "remaining_today": 97 } }
}
```

### The offending text is never echoed

`reason` explains *why* in one sentence and never quotes the words. Nothing in the response body
contains the refused text — asserted per category by control, and by a probe over real HTTP.

The reason is practical, not squeamish: echoing it would write the exact content the gate exists to
stop into your response body, your logs, and every error-reporting pipeline downstream of you.

### Show the user the categories, not the reason

`refused_categories` carries a Turkish and an English label per category, so you can present a
localised message without parsing prose. `reason` is written for a developer reading a log.

---

## 5. `instrument_failure: true` — a refusal that is not about your text

If the classifier cannot be reached, the request is **refused**, and the block says so:

```json
{
  "content_safety": {
    "allowed": false,
    "refused_categories": [],
    "instrument_failure": true,
    "reason": "the content-safety classifier could not be reached, and this gate fails closed rather than letting unchecked text through: …"
  }
}
```

**This is deliberate.** A safety gate that opened when its instrument failed would pass everything
precisely when it is least able to judge.

Distinguish the two cases in your client:

| | `instrument_failure` | what the user should be told | what your code should do |
|---|---|---|---|
| policy refusal | `false`, and `refused_categories` is non-empty | the named categories are not allowed | let the user edit the text |
| instrument failure | `true`, and `refused_categories` is empty | a temporary problem on our side | retry with backoff |

Telling a user their lyric was rejected when the classifier was simply down is a bad experience and an
incorrect statement.

---

## 6. Where in the pipeline it runs, and what a refusal costs

**Stage 0 — before everything.** Before validation, before the prompt is compiled, before any
generation call.

* **A refusal costs nothing.** No generation is paid for, no file is stored, and your daily quota
  records the request but no audio was produced.
* **A refusal wins over a validation error.** If a request is *both* malformed and carries forbidden
  content, you receive `CONTENT_REFUSED`, not the validation error. Answering "your `tempo_bpm` is out
  of range" while quietly accepting a forbidden lyric would be answering the trivial fault.
* Consequently a `CONTENT_REFUSED` response carries **no** `tracks`, `prompt_sent` or `render_plan` —
  those fields exist only when something was actually produced.

---

## 7. What upstream does *not* cover

Vertex AI's own prompt-side filter blocks `PROHIBITED_CONTENT`, which Google's documentation describes
as "usually CSAM". Its configurable harm categories are documented as **"only available for response
filtering, not prompt filtering"**.

In other words: of the eight categories above, exactly one had any upstream protection on the request
path. This gate exists because the other six had none.

`child_sexual_content` is still checked here despite that upstream coverage, because relying on a
single control for the most serious category — one whose exact scope is published only as "usually
CSAM" — would mean trusting a boundary we cannot inspect.

---

## 8. Related documents

* [07 — Error catalogue](07-error-catalogue.md) — `CONTENT_REFUSED` beside every other error code
* [04 — Request body](04-request-body-full.md) — every field, including the 29 checked here
* [05 — Lyrics and singing](05-lyrics-and-singing.md) — `lyrics.mode`, and why `theme` is checked
* [03 — Endpoints](03-endpoints-reference.md) — the endpoint contracts
