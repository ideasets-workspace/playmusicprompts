/* Constants for deriving a human-readable song title from a creation request.
 *
 * WHAT THIS FILE IS
 *   Every fixed value the `TrackTitleComposer` (server/track-title.mjs) relies on: length bounds, the
 *   phrase patterns it strips, the words it keeps lower-case, the continuation marker the adaptive
 *   policy appends to prompts, the vocabulary-id prefixes it turns into labels, and the shape of the
 *   legacy automatic title it is allowed to replace. Nothing in the composer is a literal of its own.
 *
 * WHY
 *   Owner order, 2026-09-15 10:10 (+03): "şarkı isimlerini de anlamlı isimler yap". The music engine
 *   returns no title (docs/api/06-response-envelope.md carries no title field, measured 2026-09-15), so
 *   the website derives one from the words the creator typed. Nothing here invents content: every
 *   candidate title is a transformation of the creator's own prompt or of the vocabulary values the
 *   creator selected; when neither yields words, the title says so honestly (`UNTITLED_BASE`).
 */

/** Longest title emitted, in characters; longer sentences are cut at a word boundary. */
export const TITLE_MAX_LENGTH = 48;

/** Shortest prompt fragment accepted as a title before falling back to selected vocabulary. */
export const TITLE_MIN_LENGTH = 3;

/** A clause before the first comma/semicolon is preferred when it is at least this long. */
export const CLAUSE_MIN_LENGTH = 12;

/**
 * Marker the adaptive policy appends when it extends a prompt with steering for the next track
 * (server/adaptive-policy.mjs line 122: `planned.prompt+='\n\nNext-track direction:\n'+guidance`).
 * Everything from this marker onward is system text, never part of the creator's title.
 */
export const CONTINUATION_MARKER = 'Next-track direction:';

/** Sentence boundaries: full stop, exclamation, question mark, or a line break. */
export const SENTENCE_BOUNDARY = /[.!?\n\r]+/;

/** Clause boundaries inside a sentence. */
export const CLAUSE_BOUNDARY = /[,;:\u2014\u2013]|\s-\s/;

/**
 * Imperative openers people type when asking for music ("make a music of happiness",
 * "please create a song about ..."). Stripped so the subject of the request becomes the title.
 */
export const IMPERATIVE_OPENER = /^(?:please\s+)?(?:can\s+you\s+|could\s+you\s+)?(?:make|create|generate|compose|write|produce|give\s+me|play|i\s+want|i'd\s+like|i\s+would\s+like|i\s+need)\s+(?:me\s+)?(?:a|an|some|the)?\s*(?:music|song|track|piece|tune|beat|melody|soundtrack)?\s*(?:of|about|for|that|which|like|with)?\s*/i;

/** Leading article removed from the start of a title ("A peaceful night drive" -> "Peaceful Night Drive"). */
export const LEADING_ARTICLE = /^(?:a|an|the)\s+/i;

/** Characters trimmed from both ends of a candidate title. */
export const EDGE_PUNCTUATION = /^[\s"'\u201c\u201d\u2018\u2019(\[{,;:.!?\-\u2014\u2013]+|[\s"'\u201c\u201d\u2018\u2019)\]},;:.!?\-\u2014\u2013]+$/g;

/** Words kept lower-case inside a title (never at the first or last position). */
export const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'nor', 'but', 'of', 'for', 'in', 'on', 'at', 'to', 'with', 'by', 'from', 'as', 'vs', 'no']);

/** Words that may not end a title (a truncated "... Piano and" is cut back to "... Piano"). */
export const TRAILING_CONNECTIVES = new Set(['and', 'or', 'nor', 'but', 'of', 'for', 'in', 'on', 'at', 'to', 'with', 'by', 'from', 'as', 'vs', 'a', 'an', 'the']);

/** Short all-caps tokens (EDM, UK, R&B) keep their case. */
export const ACRONYM_MAX_LENGTH = 4;

/** Vocabulary-id prefixes removed when a selected value becomes a label ("era_1980s" -> "1980s"). */
export const VOCABULARY_PREFIXES = ['era_modifier_', 'era_'];

/** Order in which selected vocabulary values are combined when the prompt yields no title. */
export const VOCABULARY_FALLBACK_ORDER = ['moods', 'genres'];

/** Secondary fallbacks, tried one at a time, when moods/genres are both absent. */
export const VOCABULARY_SECONDARY_FALLBACKS = ['creative_goal', 'eras'];

/** Honest title when the request carries no usable words at all. */
export const UNTITLED_BASE = 'Untitled Creation';

/** Separator between a base title and its take number (unchanged from the previous naming). */
export const TAKE_SEPARATOR = ' \u00b7 Take ';

/** Separator between a base title and its ordinal for same-titled later creations ("Night Drive II"). */
export const ORDINAL_SEPARATOR = ' ';

/** Automatic titles produced before 2026-09-15; only these are ever rewritten by the migration. */
export const LEGACY_AUTO_TITLE = /^Original [0-9a-f]{6} \u00b7 Take \d+$/;

/** Roman-numeral table for ordinals (creation order of same-titled songs). */
export const ROMAN_NUMERALS = Object.freeze([[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]);
