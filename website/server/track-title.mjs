/* TrackTitleComposer: derives a human-readable song title from a creation request.
 *
 * WHAT THIS FILE IS
 *   The one place where a saved song receives its display title. `Store.publish()` calls
 *   `TrackTitleComposer.baseTitle(payload)` for every delivered take and `titleFor(...)` to attach the
 *   ordinal and take number; `Store.retitleLegacyTracks()` uses the same class once, at start-up, to
 *   replace the pre-2026-09-15 automatic names (`Original <6 hex> · Take N`).
 *
 * HOW A TITLE IS FORMED (deterministic, nothing invented)
 *   1. If the creator typed a Track title (`payload.project.name`), that exact text is the title.
 *   2. Otherwise the creator's own prompt is used: any system-appended continuation block is dropped
 *      (`Next-track direction:` and everything after it), the first sentence is taken, and inside that
 *      sentence the first clause is preferred when long enough ("Warm cinematic piano and cello, a gentle
 *      slow rise" -> "Warm Cinematic Piano and Cello"). Imperative openers ("make a music of") and a
 *      leading article are removed, the result is title-cased and cut at a word boundary to 48 chars.
 *   3. If the prompt leaves no usable words, the selected vocabulary values form the title in the order
 *      mood + genre ("Uplifting Cinematic"), then creative goal, then era.
 *   4. If nothing at all is available, the title is honestly "Untitled Creation".
 *   Two different creations that produce the same base title receive creation-order ordinals
 *   ("Peaceful Night Drive", "Peaceful Night Drive II", ...). Take numbers are appended only when a
 *   creation delivered more than one take (unchanged behaviour).
 *
 * All fixed values live in ./track-title-constants.mjs.
 */
import {
  ACRONYM_MAX_LENGTH, CLAUSE_BOUNDARY, CLAUSE_MIN_LENGTH, CONTINUATION_MARKER, EDGE_PUNCTUATION, IMPERATIVE_OPENER,
  LEADING_ARTICLE, LEGACY_AUTO_TITLE, ORDINAL_SEPARATOR, ROMAN_NUMERALS, SENTENCE_BOUNDARY, SMALL_WORDS,
  TAKE_SEPARATOR, TITLE_MAX_LENGTH, TITLE_MIN_LENGTH, TRAILING_CONNECTIVES, UNTITLED_BASE,
  VOCABULARY_FALLBACK_ORDER, VOCABULARY_PREFIXES, VOCABULARY_SECONDARY_FALLBACKS,
} from './track-title-constants.mjs';

export class TrackTitleComposer {
  /** True when a stored title is one of the automatic pre-2026-09-15 names this composer may replace. */
  static isLegacyAutomaticTitle(title) {
    return typeof title === 'string' && LEGACY_AUTO_TITLE.test(title);
  }

  /** Roman numeral for an ordinal >= 1 (2 -> "II"); 1 yields an empty string because the first has no suffix. */
  static ordinalSuffix(ordinal) {
    if (!Number.isSafeInteger(ordinal) || ordinal < 2) return '';
    let remaining = ordinal, roman = '';
    for (const [value, numeral] of ROMAN_NUMERALS) while (remaining >= value) { roman += numeral; remaining -= value; }
    return roman;
  }

  /** Title-case with small words kept lower-case (except first/last) and short acronyms preserved. */
  static titleCase(text) {
    const words = text.split(/\s+/).filter(Boolean);
    return words.map((word, index) => {
      const letters = word.replace(/[^\p{L}\p{N}]/gu, '');
      if (letters && letters.length <= ACRONYM_MAX_LENGTH && letters === letters.toUpperCase() && /\p{L}/u.test(letters) && word === word.toUpperCase()) return word;
      const lower = word.toLowerCase();
      if (index > 0 && index < words.length - 1 && SMALL_WORDS.has(lower)) return lower;
      const firstLetter = lower.search(/\p{L}|\p{N}/u);
      if (firstLetter < 0) return lower;
      return lower.slice(0, firstLetter) + lower.charAt(firstLetter).toUpperCase() + lower.slice(firstLetter + 1);
    }).join(' ');
  }

  /** Human label for a vocabulary id ("era_1980s" -> "1980s", "calm_ambient_meditative" -> "Calm Ambient Meditative"). */
  static vocabularyLabel(id) {
    if (typeof id !== 'string') return '';
    let value = id.trim();
    for (const prefix of VOCABULARY_PREFIXES) if (value.startsWith(prefix)) { value = value.slice(prefix.length); break; }
    value = value.replace(/[_-]+/g, ' ').trim();
    return value ? TrackTitleComposer.titleCase(value) : '';
  }

  /** Cuts a title at a word boundary within TITLE_MAX_LENGTH and drops a dangling connective. */
  static truncate(title) {
    if (title.length <= TITLE_MAX_LENGTH) return TrackTitleComposer.dropTrailingConnective(title);
    let cut = title.slice(0, TITLE_MAX_LENGTH);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 0) cut = cut.slice(0, lastSpace);
    return TrackTitleComposer.dropTrailingConnective(cut.replace(EDGE_PUNCTUATION, ''));
  }

  static dropTrailingConnective(title) {
    const words = title.split(' ');
    while (words.length > 1 && TRAILING_CONNECTIVES.has(words[words.length - 1].toLowerCase())) words.pop();
    return words.join(' ').replace(EDGE_PUNCTUATION, '');
  }

  /** The creator's prompt reduced to its first meaningful clause, or '' when nothing usable remains. */
  static fromPrompt(prompt) {
    if (typeof prompt !== 'string') return '';
    let text = prompt;
    const marker = text.indexOf(CONTINUATION_MARKER);
    if (marker >= 0) text = text.slice(0, marker);
    const sentence = text.split(SENTENCE_BOUNDARY).map(part => part.trim()).find(part => part.length > 0) || '';
    if (!sentence) return '';
    const clause = sentence.split(CLAUSE_BOUNDARY).map(part => part.trim()).find(part => part.length > 0) || '';
    let candidate = clause.length >= CLAUSE_MIN_LENGTH ? clause : sentence;
    candidate = candidate.replace(IMPERATIVE_OPENER, '').replace(LEADING_ARTICLE, '').replace(/\s+/g, ' ').replace(EDGE_PUNCTUATION, '');
    if (candidate.length < TITLE_MIN_LENGTH || !/\p{L}|\p{N}/u.test(candidate)) return '';
    return TrackTitleComposer.truncate(TrackTitleComposer.titleCase(candidate));
  }

  /** Title formed from the vocabulary values the creator selected, or '' when none were selected. */
  static fromVocabulary(payload) {
    const first = key => {
      const value = payload?.[key];
      return Array.isArray(value) ? value.find(item => typeof item === 'string' && item.trim()) : (typeof value === 'string' ? value : undefined);
    };
    const primary = VOCABULARY_FALLBACK_ORDER.map(key => TrackTitleComposer.vocabularyLabel(first(key))).filter(Boolean).join(' ');
    if (primary) return TrackTitleComposer.truncate(primary);
    for (const key of VOCABULARY_SECONDARY_FALLBACKS) {
      const label = TrackTitleComposer.vocabularyLabel(first(key));
      if (label) return TrackTitleComposer.truncate(label);
    }
    return '';
  }

  /**
   * Base title for a creation payload plus the source it came from:
   * `project` (creator-typed title), `prompt`, `vocabulary`, or `untitled`.
   */
  static baseTitle(payload) {
    const name = typeof payload?.project?.name === 'string' ? payload.project.name.trim() : '';
    if (name) return {base: name, source: 'project'};
    const fromPrompt = TrackTitleComposer.fromPrompt(payload?.prompt);
    if (fromPrompt) return {base: fromPrompt, source: 'prompt'};
    const fromVocabulary = TrackTitleComposer.fromVocabulary(payload);
    if (fromVocabulary) return {base: fromVocabulary, source: 'vocabulary'};
    return {base: UNTITLED_BASE, source: 'untitled'};
  }

  /** Full display title: base, then the ordinal for repeated titles, then the take number when several takes exist. */
  static titleFor({base, ordinal = 1, takeNumber, multiple}) {
    const suffix = TrackTitleComposer.ordinalSuffix(ordinal);
    const withOrdinal = suffix ? `${base}${ORDINAL_SEPARATOR}${suffix}` : base;
    return multiple ? `${withOrdinal}${TAKE_SEPARATOR}${takeNumber}` : withOrdinal;
  }
}
