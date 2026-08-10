import { normalizeForSearch } from '@/lib/text-normalization/normalize'

/**
 * Scoring for the command menu's local tier.
 *
 * Both sides go through `normalizeForSearch`, the same folding the backend's FTS
 * and the offline FTS5 bundles use, so a query means the same thing here as it
 * does one tier down: `أ آ ٱ` fold to `ا`, harakat are stripped, case is folded.
 *
 * Hand-rolled rather than a fuzzy library: over a couple of hundred titles,
 * agreement with the other tiers matters far more than fuzzy sophistication, and
 * fuse.js would cost more gzipped than this whole module.
 */

/** Match strength, highest first. A miss scores 0 and is dropped. */
const SCORE = {
  exact: 1000,
  prefix: 500,
  wordPrefix: 300,
  acronym: 200,
  substring: 120,
  keyword: 100,
  description: 40,
} as const

export interface MatchTarget {
  label: string
  description?: string
  keywords?: string[]
  /** Editorial weight 0..100; scales the final score by up to 1.5x. */
  priority?: number
}

/** Splits normalized text into words for word-prefix and acronym matching. */
function words(normalized: string): string[] {
  return normalized.split(' ').filter(Boolean)
}

/** First letter of each word, e.g. "word lab" → "wl". */
function acronym(normalized: string): string {
  return words(normalized)
    .map((w) => w[0] ?? '')
    .join('')
}

function scoreText(haystack: string, needle: string): number {
  if (!haystack) return 0
  if (haystack === needle) return SCORE.exact
  if (haystack.startsWith(needle)) return SCORE.prefix
  if (words(haystack).some((w) => w.startsWith(needle))) return SCORE.wordPrefix
  // Only worth checking for multi-letter queries; "a" would match everything.
  if (needle.length >= 2 && acronym(haystack).startsWith(needle)) return SCORE.acronym
  if (haystack.includes(needle)) return SCORE.substring
  return 0
}

/**
 * Scores one candidate against an already-normalized query. Returns 0 for a miss.
 * An empty query scores every candidate on priority alone, so the menu can show a
 * sensible default list before the user types.
 */
export function scoreTarget(target: MatchTarget, normalizedQuery: string): number {
  const weight = 1 + (target.priority ?? 50) / 200

  if (!normalizedQuery) return Math.round(weight * 100)

  let best = scoreText(normalizeForSearch(target.label), normalizedQuery)

  if (best < SCORE.exact && target.keywords?.length) {
    for (const keyword of target.keywords) {
      const hit = scoreText(normalizeForSearch(keyword), normalizedQuery)
      // A keyword match is a weaker signal than the same match on the label.
      if (hit > 0) best = Math.max(best, Math.min(hit, SCORE.keyword))
    }
  }

  if (best === 0 && target.description) {
    if (normalizeForSearch(target.description).includes(normalizedQuery)) {
      best = SCORE.description
    }
  }

  return best === 0 ? 0 : Math.round(best * weight)
}

/**
 * Filters and ranks candidates. Ties break on the original order, which callers
 * set deliberately (chapter number, nav order), so equal matches stay stable
 * instead of shuffling between keystrokes.
 */
export function rankTargets<T extends MatchTarget>(
  targets: readonly T[],
  query: string,
  limit?: number,
): T[] {
  const normalized = normalizeForSearch(query)
  const scored: { target: T; score: number; index: number }[] = []

  for (let index = 0; index < targets.length; index++) {
    const target = targets[index]!
    const score = scoreTarget(target, normalized)
    if (score > 0) scored.push({ target, score, index })
  }

  scored.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index))
  const ranked = scored.map((s) => s.target)
  return limit === undefined ? ranked : ranked.slice(0, limit)
}

/**
 * Splits a `<b>`-highlighted snippet into plain and emphasized runs.
 *
 * The backend (`ts_headline`), the offline FTS5 `snippet()`, and the local verse
 * search all emit the same `<b>…</b>` form. Returning runs instead of HTML keeps
 * `dangerouslySetInnerHTML` out of the menu entirely.
 */
export function splitHighlight(snippet: string): { text: string; match: boolean }[] {
  const runs: { text: string; match: boolean }[] = []
  // `[\s\S]` rather than `.` with the `s` flag: the shared package targets an
  // older lib than dotAll requires, and snippets can span newlines.
  const pattern = /<b>([\s\S]*?)<\/b>/gi
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(snippet)) !== null) {
    if (match.index > cursor) {
      runs.push({ text: snippet.slice(cursor, match.index), match: false })
    }
    if (match[1]) runs.push({ text: match[1], match: true })
    cursor = match.index + match[0].length
  }

  if (cursor < snippet.length) runs.push({ text: snippet.slice(cursor), match: false })
  return runs
}
