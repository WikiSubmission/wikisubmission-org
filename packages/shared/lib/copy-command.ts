import { normalizeQuranInput } from '@/lib/scripture-parser'
import { expandQuranSegments, parseQuranSegments } from '@/lib/verse-ref-parser'

/**
 * The one-line form of a copy: a reference followed by option tokens.
 *
 *   2:255                   verse by verse, interface language, as text
 *   2:255 ar en fr          with Arabic, English, and French
 *   1:1-7, 3:18 wbw table   word by word, as a table
 *   18:1 ar none            Arabic only
 *   2:255 vbv no-footnotes no-subtitles
 *                            verse by verse without reader annotations
 *
 * The split stays unambiguous because a reference is the leading run made only
 * of digits, colons, commas, and dashes. Everything after that run is treated as
 * option tokens, in any order.
 *
 * Tokens are fixed keywords rather than translated words. The syntax is typed,
 * and a command a reader saves has to keep meaning the same thing after they
 * switch interface language; the menu shows a localized label beside each token
 * instead, and matches the typed prefix against both.
 */

/** What the finished command copies. */
export type CopyOutput = 'text' | 'table' | 'image'

/** A complete command: the reference plus every option, with defaults resolved. */
export interface CopyRecipe {
  /** Normalized reference string, e.g. `2:255` or `1:1-7, 3:18`. */
  refs: string
  granularity: 'full' | 'wbw'
  arabic: 'yes' | 'no'
  /** Translation language code, or `'none'`. */
  primary: string
  /** Second translation language code, or `'none'`. */
  secondary: string
  output: CopyOutput
  /** Use the reader preference unless the command explicitly suppresses footnotes. */
  footnotes: 'default' | 'exclude'
  /** Use the reader preference unless the command explicitly suppresses subtitles. */
  subtitles: 'default' | 'exclude'
}

/** The answers a token supplies, for the rows that offer it as a completion. */
export type CopyTokenKind =
  | 'arabic'
  | 'granularity'
  | 'translation'
  | 'output'
  | 'footnotes'
  | 'subtitles'

export interface CopyModifier {
  token: string
  /** `commandMenu` message key for the row label. */
  labelKey: string
  kind: CopyTokenKind
}

/** Every option token that is not a language code. */
export const COPY_MODIFIERS: readonly CopyModifier[] = [
  { token: 'ar', labelKey: 'copyWithArabic', kind: 'arabic' },
  { token: 'wbw', labelKey: 'copyWordByWord', kind: 'granularity' },
  { token: 'vbv', labelKey: 'copyVerseByVerse', kind: 'granularity' },
  { token: 'none', labelKey: 'copyNoTranslation', kind: 'translation' },
  { token: 'table', labelKey: 'copyAsTable', kind: 'output' },
  { token: 'image', labelKey: 'copyAsImage', kind: 'output' },
  { token: 'text', labelKey: 'copyAsText', kind: 'output' },
  { token: 'no-footnotes', labelKey: 'copyWithoutFootnotes', kind: 'footnotes' },
  { token: 'no-subtitles', labelKey: 'copyWithoutSubtitles', kind: 'subtitles' },
]

const OUTPUT_TOKENS = new Set<string>(['text', 'table', 'image'])

/** Only the answers the command spelled out, for pre-filling the step-by-step tree. */
export type CopyAnswers = Partial<Omit<CopyRecipe, 'refs'>>

export interface CopyCommand {
  /** The leading text read as the reference, exactly as typed. */
  refText: string
  /** The normalized reference, or null when the leading text is not one. */
  refs: string | null
  /** How many verses `refs` expands to. */
  count: number
  /** Recognized option tokens, deduped, in the order typed. */
  tokens: string[]
  /** Every typed option word, classified for live UI feedback. */
  tokenFeedback: Array<{ token: string; status: 'valid' | 'partial' | 'invalid' }>
  /** Unknown completed tokens. Copy actions should not silently ignore these. */
  invalidTokens: string[]
  /** The token still being typed, or '' when the query ends in a space. */
  partial: string
  /** What was spelled out, with nothing inferred. */
  answers: CopyAnswers
  /** What the command copies, defaults filled in. Null without a reference. */
  recipe: CopyRecipe | null
}

/** A word belongs to the reference while it holds nothing but reference punctuation. */
const REFERENCE_WORD = /^[\d:,-]+$/

const CHAPTERS = 114

export function parseCopyCommand(
  query: string,
  languageCodes: readonly string[],
  defaultLanguage: string,
): CopyCommand {
  const words = query.trim().split(/\s+/).filter(Boolean)

  let cursor = 0
  while (cursor < words.length && REFERENCE_WORD.test(words[cursor]!)) cursor++
  const refText = words.slice(0, cursor).join(' ')

  // Every segment has to name a real chapter, so a typo like `999:1` reads as
  // "not a reference yet" instead of a row that can only fail once run.
  const normalized = normalizeQuranInput(refText)
  const segments = normalized ? parseQuranSegments(normalized) : []
  const usable = segments.length > 0 && segments.every((s) => s.cn >= 1 && s.cn <= CHAPTERS)
  const count = usable ? expandQuranSegments(segments).length : 0
  const refs = count > 0 ? normalized : null

  const languages = new Set(languageCodes)
  const known = new Set<string>([...COPY_MODIFIERS.map((m) => m.token), ...languageCodes])

  const rest = words.slice(cursor).map((word) => word.toLowerCase())
  const hasTrailingSpace = /\s$/.test(query)
  const tokenFeedback = rest.map((token, index) => {
    if (known.has(token)) return { token, status: 'valid' as const }
    const isActiveWord = index === rest.length - 1 && !hasTrailingSpace
    if (isActiveWord && [...known].some((candidate) => candidate.startsWith(token))) {
      return { token, status: 'partial' as const }
    }
    return { token, status: 'invalid' as const }
  })
  const invalidTokens = tokenFeedback
    .filter((item) => item.status === 'invalid')
    .map((item) => item.token)
  const tokens: string[] = []
  for (const word of rest) {
    if (known.has(word) && !tokens.includes(word)) tokens.push(word)
  }

  // The last word is still being typed unless the query ends in whitespace. It
  // can be a finished token at the same time — `en` is both a complete answer and
  // a prefix of nothing else, so it counts above and filters completions here.
  const partial = rest.length > 0 && !hasTrailingSpace ? rest[rest.length - 1]! : ''

  const has = (token: string) => tokens.includes(token)
  const languageTokens = tokens.filter((token) => languages.has(token))

  const answers: CopyAnswers = {}
  const granularity = tokens.filter((token) => token === 'wbw' || token === 'vbv').pop()
  if (granularity) answers.granularity = granularity === 'wbw' ? 'wbw' : 'full'
  if (has('ar')) answers.arabic = 'yes'
  if (has('none')) {
    // The explicit suppressor, so it wins over any language that came with it.
    answers.primary = 'none'
    answers.secondary = 'none'
  } else if (languageTokens.length > 0) {
    answers.primary = languageTokens[0]!
    if (languageTokens.length > 1) answers.secondary = languageTokens[1]!
  }
  // Last one wins, so appending `image` to a line that already says `table`
  // overrides it rather than being quietly ignored.
  const output = tokens.filter((token) => OUTPUT_TOKENS.has(token)).pop()
  if (output) answers.output = output as CopyOutput
  if (has('no-footnotes')) answers.footnotes = 'exclude'
  if (has('no-subtitles')) answers.subtitles = 'exclude'

  return {
    refText,
    refs,
    count,
    tokens,
    tokenFeedback,
    invalidTokens,
    partial,
    answers,
    recipe: refs
      ? {
          refs,
          granularity: answers.granularity ?? 'full',
          arabic: answers.arabic ?? 'no',
          primary: answers.primary ?? defaultLanguage,
          secondary: answers.secondary ?? 'none',
          output: answers.output ?? 'text',
          footnotes: answers.footnotes ?? 'default',
          subtitles: answers.subtitles ?? 'default',
        }
      : null,
  }
}

/** The option tokens a recipe is made of, in canonical order. */
export function copyCommandTokens(recipe: CopyRecipe): string[] {
  const tokens: string[] = []
  if (recipe.arabic === 'yes') tokens.push('ar')
  if (recipe.granularity === 'wbw') tokens.push('wbw')
  if (recipe.primary === 'none') {
    tokens.push('none')
  } else {
    tokens.push(recipe.primary)
    if (recipe.secondary !== 'none' && recipe.secondary !== recipe.primary) {
      tokens.push(recipe.secondary)
    }
  }
  // Text is the default, so spelling it out would only be noise to edit around.
  if (recipe.output !== 'text') tokens.push(recipe.output)
  if (recipe.footnotes === 'exclude') tokens.push('no-footnotes')
  if (recipe.subtitles === 'exclude') tokens.push('no-subtitles')
  return tokens
}

/**
 * A recipe as the line that produces it, which is what the menu pre-fills so the
 * next copy is an edit of the last one rather than five answers again.
 */
export function formatCopyCommand(recipe: CopyRecipe): string {
  return [recipe.refs, ...copyCommandTokens(recipe)].join(' ')
}

/**
 * Adds a token to a query, replacing the partial word it completes.
 *
 * Always leaves one trailing space, so the next completion appends rather than
 * extending the token just added.
 */
export function withCopyToken(query: string, token: string, partial: string): string {
  const base = partial ? query.slice(0, query.length - partial.length) : query
  const spaced = base === '' || base.endsWith(' ') ? base : `${base} `
  return `${spaced}${token} `
}
