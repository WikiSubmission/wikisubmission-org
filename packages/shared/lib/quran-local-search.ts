import { normalizeForSearch } from '@/lib/text-normalization/normalize'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type QuranResponse = components['schemas']['QuranResponse']

/**
 * Searches verses already in memory, emitting the same response shape the
 * backend and the offline bundles do.
 *
 * Two constraints shape this module.
 *
 * Both sides go through `normalizeForSearch`, the folding the backend's FTS and
 * the offline FTS5 bundles already use, so a query means the same thing here as
 * it does one tier down.
 *
 * Highlights are spliced using offsets recorded from the *original* text. The
 * normalizer is lossy — it drops non-spacing marks, tatweel and hamza, and
 * collapses whitespace — so an offset in the normalized string does not map back.
 * `vectors.json` freezes that behaviour against the Go implementation, so it
 * cannot grow an offset-emitting variant either. Tokenizing once and keeping
 * each token's original span is what makes highlighting correct.
 */

/** Matching a query is all-terms-required; a quoted group must appear in order. */
export interface LocalQuery {
  raw: string
  terms: string[]
  phrases: string[][]
}

const MIN_QUERY_LENGTH = 2

export function parseLocalQuery(raw: string): LocalQuery {
  const phrases: string[][] = []
  // Pull quoted groups out first so their words are not also loose terms.
  const withoutPhrases = raw.replace(/"([^"]+)"/g, (_match, group: string) => {
    const tokens = normalizeForSearch(group).split(' ').filter(Boolean)
    if (tokens.length > 0) phrases.push(tokens)
    return ' '
  })

  const terms = normalizeForSearch(withoutPhrases).split(' ').filter(Boolean)
  return { raw, terms, phrases }
}

interface Token {
  /** Offsets into the original string, for splicing highlights. */
  start: number
  end: number
  norm: string
}

/** Splits on whitespace, keeping each token's span in the original string. */
function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  const pattern = /\S+/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const norm = normalizeForSearch(match[0])
    // A token that normalizes away entirely (bare punctuation) cannot match.
    if (norm) tokens.push({ start: match.index, end: match.index + match[0].length, norm })
  }
  return tokens
}

/** Per-language weights. The reader's own language is the one they are reading. */
function fieldWeight(lang: string, primaryLang: string | undefined): number {
  if (lang === primaryLang) return 1
  if (lang === 'ar') return 0.85
  return 0.6
}

const SUBTITLE_WEIGHT = 0.4

interface FieldIndex {
  lang: string
  /** Which part of the verse: the body, or the subtitle/footnote. */
  weight: number
  text: string
  tokens: Token[]
}

interface IndexedVerse {
  verse: VerseData
  chapter: number
  verseNumber: number
  fields: FieldIndex[]
}

export interface LocalSearchOptions {
  /** Languages to search. Defaults to every language present on the verse. */
  langs?: string[]
  primaryLang?: string
  limit?: number
  /** Chapter titles by number, enabling the `tm` title-match flag. */
  titles?: Record<number, string>
}

export interface LocalIndex {
  readonly size: number
  search(query: string, options?: LocalSearchOptions): QuranResponse
}

/**
 * A `LocalIndex` that can be grown after construction.
 *
 * The whole-Quran library arrives in batches, and re-tokenizing everything held
 * so far on each arrival is quadratic — twelve rebuilds of a corpus that ends at
 * ~6,300 verses across two languages. Appending keeps the cost proportional to
 * what actually arrived.
 */
export interface IncrementalLocalIndex extends LocalIndex {
  /** Verses already held are replaced by verse key, so a re-merge is idempotent. */
  add(verses: VerseData[]): void
}

/** Tokenizes one verse into the entry the scorer walks. Null when unparsable. */
function indexVerse(verse: VerseData): IndexedVerse | null {
  if (!verse.vk) return null
  const [chapterRaw, verseRaw] = verse.vk.split(':')
  const chapter = Number(chapterRaw)
  const verseNumber = Number(verseRaw)
  if (!Number.isFinite(chapter) || !Number.isFinite(verseNumber)) return null

  const fields: FieldIndex[] = []
  for (const [lang, translation] of Object.entries(verse.tr ?? {})) {
    if (translation?.tx) {
      fields.push({ lang, weight: 1, text: translation.tx, tokens: tokenize(translation.tx) })
    }
    if (translation?.s) {
      fields.push({
        lang,
        weight: SUBTITLE_WEIGHT,
        text: translation.s,
        tokens: tokenize(translation.s),
      })
    }
    if (translation?.f) {
      fields.push({
        lang,
        weight: SUBTITLE_WEIGHT,
        text: translation.f,
        tokens: tokenize(translation.f),
      })
    }
  }

  return { verse, chapter, verseNumber, fields }
}

/**
 * An empty index that verses are appended to.
 *
 * Pre-tokenizing is the load-bearing performance decision. Re-normalizing a few
 * hundred verses across two languages on every keystroke is hundreds of
 * kilobytes of string churn; scanning pre-computed tokens is a few milliseconds.
 */
export function createLocalIndex(): IncrementalLocalIndex {
  const indexed: IndexedVerse[] = []
  // Verse key → position in `indexed`, so a repeated batch overwrites in place
  // rather than scoring the same verse twice.
  const positions = new Map<string, number>()

  return {
    get size() {
      return indexed.length
    },
    add(verses) {
      for (const verse of verses) {
        const entry = indexVerse(verse)
        if (!entry) continue
        const existing = positions.get(entry.verse.vk!)
        if (existing !== undefined) {
          indexed[existing] = entry
          continue
        }
        positions.set(entry.verse.vk!, indexed.length)
        indexed.push(entry)
      }
    },
    search: (query, options = {}) => runSearch(indexed, query, options),
  }
}

/** Pre-tokenizes a fixed verse array once. */
export function buildLocalIndex(verses: VerseData[]): LocalIndex {
  const index = createLocalIndex()
  index.add(verses)
  return index
}

/** One-shot convenience for callers that do not keep an index around. */
export function searchVersesLocally(
  verses: VerseData[],
  query: string,
  options: LocalSearchOptions = {},
): QuranResponse {
  return buildLocalIndex(verses).search(query, options)
}

const EMPTY_RESPONSE: QuranResponse = { info: { result_count: 0, total: 0 }, chapters: [] }

/** Indexes of tokens matched in a field, used for both scoring and highlighting. */
function matchField(field: FieldIndex, query: LocalQuery): { score: number; hits: number[] } | null {
  const hits = new Set<number>()

  for (const term of query.terms) {
    let found = false
    for (let i = 0; i < field.tokens.length; i++) {
      const token = field.tokens[i]!
      if (token.norm === term) {
        hits.add(i)
        found = true
      } else if (token.norm.includes(term)) {
        hits.add(i)
        found = true
      }
    }
    // Every loose term is required.
    if (!found) return null
  }

  for (const phrase of query.phrases) {
    let found = false
    for (let i = 0; i + phrase.length <= field.tokens.length; i++) {
      let all = true
      for (let j = 0; j < phrase.length; j++) {
        const token = field.tokens[i + j]!
        const word = phrase[j]!
        if (token.norm !== word && !token.norm.includes(word)) {
          all = false
          break
        }
      }
      if (all) {
        for (let j = 0; j < phrase.length; j++) hits.add(i + j)
        found = true
      }
    }
    // Every quoted phrase is required, in order.
    if (!found) return null
  }

  if (hits.size === 0) return null

  const ordered = [...hits].sort((a, b) => a - b)
  const first = ordered[0]!
  // Early matches read as more relevant, and repeated matches more still, but
  // both stay small next to the field weight so language choice dominates.
  const positionBonus = 1.5 * (1 - first / Math.max(1, field.tokens.length))
  const frequencyBonus = 0.25 * Math.min(ordered.length, 4)

  return { score: (2 + positionBonus + frequencyBonus) * field.weight, hits: ordered }
}

/** Splices `<b>` around matched tokens using their original offsets. */
function highlight(field: FieldIndex, hits: number[]): string {
  let out = ''
  let cursor = 0
  for (const index of hits) {
    const token = field.tokens[index]
    if (!token || token.start < cursor) continue
    out += field.text.slice(cursor, token.start)
    out += `<b>${field.text.slice(token.start, token.end)}</b>`
    cursor = token.end
  }
  out += field.text.slice(cursor)
  return out
}

function runSearch(
  indexed: IndexedVerse[],
  rawQuery: string,
  options: LocalSearchOptions,
): QuranResponse {
  const query = parseLocalQuery(rawQuery)
  const normalizedLength = [...query.terms, ...query.phrases.flat()].join('').length
  // Matches the `q` minimum the API enforces and the offline adapter's guard.
  if (normalizedLength < MIN_QUERY_LENGTH) return EMPTY_RESPONSE

  const limit = options.limit ?? 50
  const allowLang = options.langs ? new Set(options.langs) : null

  type Scored = { verse: VerseData; chapter: number; verseNumber: number; score: number }
  const scored: Scored[] = []

  for (const entry of indexed) {
    let best = 0
    /** Highlight per language, since the UI picks the language to render. */
    const highlights = new Map<string, string>()

    for (const field of entry.fields) {
      if (allowLang && !allowLang.has(field.lang)) continue
      const match = matchField(field, query)
      if (!match) continue

      const weighted = match.score * fieldWeight(field.lang, options.primaryLang)
      if (weighted > best) best = weighted
      // Only the verse body carries a highlight; a subtitle match should not
      // replace the body text the card renders.
      if (field.weight === 1 && !highlights.has(field.lang)) {
        highlights.set(field.lang, highlight(field, match.hits))
      }
    }

    if (best === 0) continue

    // Attach highlights without mutating the corpus copy of the verse.
    const tr: Record<string, unknown> = {}
    for (const [lang, translation] of Object.entries(entry.verse.tr ?? {})) {
      const hl = highlights.get(lang)
      tr[lang] = hl ? { ...translation, hl } : translation
    }

    scored.push({
      verse: { ...entry.verse, tr: tr as VerseData['tr'], sc: Number(best.toFixed(4)) },
      chapter: entry.chapter,
      verseNumber: entry.verseNumber,
      score: best,
    })
  }

  scored.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : a.chapter !== b.chapter
        ? a.chapter - b.chapter
        : a.verseNumber - b.verseNumber,
  )

  const top = scored.slice(0, limit)

  // Group by chapter, matching the shape `offlineQuranSearch` returns so the
  // results view and the search dropdown consume it unchanged.
  const byChapter = new Map<number, typeof top>()
  for (const hit of top) {
    const bucket = byChapter.get(hit.chapter)
    if (bucket) bucket.push(hit)
    else byChapter.set(hit.chapter, [hit])
  }

  const titleQuery = query.terms.length > 0 || query.phrases.length > 0
  const chapters = [...byChapter.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([chapterNumber, hits]) => {
      const title = options.titles?.[chapterNumber]
      const titleMatch =
        titleQuery && title
          ? matchField(
              { lang: 'title', weight: 1, text: title, tokens: tokenize(title) },
              query,
            ) !== null
          : false

      return {
        cn: chapterNumber,
        hits: hits.length,
        ...(titleMatch ? { tm: true } : {}),
        verses: hits.map((hit) => hit.verse),
      }
    })

  return {
    info: { result_count: top.length, total: scored.length },
    chapters: chapters as QuranResponse['chapters'],
  }
}
