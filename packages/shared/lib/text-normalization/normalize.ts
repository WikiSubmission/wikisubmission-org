/**
 * Canonical search-text normalization for the offline full-text index.
 *
 * This function is applied IDENTICALLY at two points:
 *   1. Server-side, when the bundle builder populates the FTS index (ws-backend).
 *   2. Client-side, when a search query is issued against an installed bundle.
 *
 * If the two implementations diverge, offline search silently returns wrong
 * results. The behavior is therefore frozen by the shared test vectors in
 * `vectors.json`; the Go implementation in ws-backend must satisfy the same
 * vectors. See docs/text-normalization.md for the full specification.
 *
 * The pipeline is deliberately built from primitives that are identical across
 * JavaScript and Go (NFD decomposition, the Unicode Mn category, ToLower, and
 * explicit single-codepoint folding) rather than relying on NFKD's implicit
 * letterform collapsing, which is harder to reason about per character.
 *
 * Word stemming (e.g. English porter) is NOT performed here — that is the job
 * of the FTS5 tokenizer inside SQLite. This function only canonicalizes
 * characters so that index text and query text tokenize to the same terms.
 */

/** Bumped when the algorithm changes. Recorded in each bundle's `meta` table; a
 * mismatch between a bundle's normalization_version and this constant flags the
 * bundle for re-download. */
export const NORMALIZATION_VERSION = 1

const TATWEEL = 'ـ'

/** Nonspacing combining marks (harakat, tanwin, shadda, sukun, dagger alef,
 * combining hamza/madda, Latin accents). Stateless: no global flag. */
const NONSPACING_MARK = /\p{Mn}/u

/**
 * Explicit letterform folding applied after NFD + Mn-strip. NFD already
 * collapses the hamza/madda carriers (أ إ آ ؤ ئ) to their base letter once the
 * combining mark is stripped, but the map is kept exhaustive so the function is
 * idempotent and correct on non-NFD input too.
 */
const FOLD: Readonly<Record<string, string>> = {
  'ٱ': 'ا', // ٱ alef wasla        -> ا
  'أ': 'ا', // أ alef hamza above  -> ا
  'إ': 'ا', // إ alef hamza below  -> ا
  'آ': 'ا', // آ alef madda        -> ا
  'ى': 'ي', // ى alef maqsura      -> ي
  'ة': 'ه', // ة ta marbuta        -> ه
  'ؤ': 'و', // ؤ waw hamza         -> و
  'ئ': 'ي', // ئ ya hamza          -> ي
  'ء': '', //       ء standalone hamza  -> removed
}

/**
 * Normalize a string for indexing or querying the offline FTS index.
 *
 * Pipeline: NFD decompose -> drop nonspacing marks -> drop tatweel ->
 * fold alef/waw/ya/ta-marbuta variants -> lowercase -> collapse whitespace.
 */
export function normalizeForSearch(input: string): string {
  if (!input) return ''

  const decomposed = input.normalize('NFD')
  let out = ''
  for (const ch of decomposed) {
    if (ch === TATWEEL) continue
    if (NONSPACING_MARK.test(ch)) continue
    out += ch in FOLD ? FOLD[ch] : ch
  }

  return out.toLowerCase().replace(/\s+/g, ' ').trim()
}
