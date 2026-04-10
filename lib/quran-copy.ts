import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']

export interface CopyVerseOptions {
  primaryCode: string
  includeText: boolean
  includeArabic: boolean
  secondaryCode?: string
  /** When true, emit per-word arabic/transliteration/meaning instead of the arabic verse string. */
  includeWordByWord?: boolean
  /** Include transliteration lines in word-by-word output. */
  includeTransliteration?: boolean
}

/** Formats words into per-word blocks: arabic / transliteration / meaning */
function buildWordByWordSection(words: WordData[], includeTransliteration: boolean): string {
  const sorted = [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0))
  return sorted
    .map((w) => {
      const tx = w.tx as Record<string, string> | undefined
      const arabic = tx?.['ar'] ?? ''
      const transliteration = tx?.['tl'] ?? ''
      const meaning = w.m ?? tx?.['en'] ?? ''
      const lines = [arabic]
      if (includeTransliteration && transliteration) lines.push(transliteration)
      if (meaning) lines.push(meaning)
      return lines.join('\n')
    })
    .join('\n\n')
}

/**
 * Builds a plain-text string for a single verse.
 * Format: `[vk] translation\narabic`
 * With word-by-word: `[vk] translation\narabic\ntransliteration\nmeaning` (per word)
 */
export function buildVerseLine(verse: VerseData, opts: CopyVerseOptions): string {
  const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
  const arTr = verse.tr?.['ar']
  const secondaryTr = opts.secondaryCode ? verse.tr?.[opts.secondaryCode] : undefined

  const lines: string[] = []

  const key = `[${verse.vk}]`
  if (opts.includeText && tr?.tx) {
    lines.push(`${key} ${tr.tx}`)
  } else {
    lines.push(key)
  }

  if (secondaryTr?.tx) lines.push(secondaryTr.tx)

  if (opts.includeWordByWord && verse.w && verse.w.length > 0) {
    lines.push(buildWordByWordSection(verse.w, opts.includeTransliteration ?? false))
  } else if (opts.includeArabic && arTr?.tx) {
    lines.push(arTr.tx)
  }

  return lines.join('\n')
}

/**
 * Builds a plain-text string for multiple verses, one per `buildVerseLine` block.
 */
export function buildVersesText(verses: VerseData[], opts: CopyVerseOptions): string {
  return verses.map((v) => buildVerseLine(v, opts)).join('\n')
}

/**
 * Builds a markdown string for a named segment.
 * Format:
 *   ## label — title
 *
 *   **[vk]** translation
 *   arabic
 */
export function buildSegmentMarkdown(
  label: string,
  title: string,
  verses: VerseData[],
  opts: CopyVerseOptions
): string {
  const lines: string[] = [`## ${label} — ${title}`, '']

  for (const verse of verses) {
    const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
    const arTr = verse.tr?.['ar']

    const key = `**[${verse.vk}]**`
    if (opts.includeText && tr?.tx) {
      lines.push(`${key} ${tr.tx}`)
    } else {
      lines.push(key)
    }

    if (opts.includeArabic && arTr?.tx) lines.push(arTr.tx)
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}
