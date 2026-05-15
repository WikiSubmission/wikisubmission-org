import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']

// ─── Legacy plain-text helpers (still used by verse-list-result.tsx) ──────────

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
function buildWordByWordSection(
  words: WordData[],
  includeTransliteration: boolean
): string {
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
 * Legacy plain-text single-verse builder. Retained for verse-list-result.tsx.
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

export function buildVersesText(verses: VerseData[], opts: CopyVerseOptions): string {
  return verses.map((v) => buildVerseLine(v, opts)).join('\n')
}

/**
 * Plain-text segment used by verse-list-result.tsx:
 *   label
 *   [vk] translation
 *   arabic
 */
export function buildSegmentMarkdown(
  label: string,
  verses: VerseData[],
  opts: CopyVerseOptions
): string {
  const lines: string[] = [label, '']

  for (const verse of verses) {
    const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
    const arTr = verse.tr?.['ar']

    const key = `[${verse.vk}]`
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

// ─── New markdown helpers (used by the unified copy button) ──────────────────

/**
 * Preference-gated options for the new copy helpers. These mirror the user's
 * display preferences from `useQuranPreferences`.
 */
export interface CopyMarkdownOptions {
  primaryCode: string
  /** Secondary language code, or undefined to skip. */
  secondaryCode?: string
  /** Show translation text (full verse and per-word). Gated by prefs.text. */
  includeText: boolean
  /** Show Arabic (full verse and per-word). Gated by prefs.arabic. */
  includeArabic: boolean
  /** Show subtitle text above the verse body. Gated by prefs.subtitles. */
  includeSubtitles: boolean
  /** Show transliteration lines per word. Gated by prefs.transliteration. */
  includeTransliteration: boolean
  /** Include footnote as a markdown blockquote. Gated by prefs.footnotes. */
  includeFootnotes: boolean
  /** Raw `<b>..</b>` highlight snippet from the backend `hl` field (search results only). */
  searchHighlight?: string
}

/** Strip `<b>..</b>` tags from a highlight snippet — copy output is plain text. */
function stripHighlight(s: string): string {
  return s.replace(/<\/?b>/gi, '')
}

function buildHeaderLine(verse: VerseData, opts: CopyMarkdownOptions): string {
  const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
  const key = `[${verse.vk}]`
  if (opts.includeText && tr?.tx) {
    const stripped = opts.searchHighlight ? stripHighlight(opts.searchHighlight) : ''
    const text = stripped && stripped.length >= tr.tx.length * 0.9 ? stripped : tr.tx
    return `${key} ${text}`
  }
  return key
}

function buildVerseBodyMarkdown(
  verse: VerseData,
  opts: CopyMarkdownOptions,
  kind: 'full' | 'wbw'
): string {
  const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
  const arTr = verse.tr?.['ar']
  const secondary = opts.secondaryCode ? verse.tr?.[opts.secondaryCode] : undefined

  const blocks: string[] = []

  if (kind === 'full') {
    if (opts.includeArabic && arTr?.tx) blocks.push(arTr.tx)
  } else {
    const words = verse.w ?? []
    if (words.length === 0) {
      if (opts.includeArabic && arTr?.tx) blocks.push(arTr.tx)
    } else {
      const sorted = [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0))
      const lines: string[] = []
      for (const w of sorted) {
        const tx = w.tx as Record<string, string> | undefined
        const parts: string[] = []
        if (opts.includeArabic && tx?.['ar']) parts.push(tx['ar'])
        if (opts.includeTransliteration && tx?.['tl']) parts.push(tx['tl'])
        if (opts.includeText && tx?.['en']) parts.push(tx['en'])
        if (parts.length > 0) lines.push(parts.join(' — '))
      }
      if (lines.length > 0) blocks.push(lines.join('\n'))
    }
  }

  if (secondary?.tx) blocks.push(secondary.tx)
  if (opts.includeFootnotes && tr?.f) blocks.push(tr.f)

  return blocks.join('\n\n')
}

/**
 * Full-verse plain text: subtitle → header → Arabic → secondary → footnote.
 * Each block is preference-gated.
 */
export function buildVerseMarkdown(
  verse: VerseData,
  opts: CopyMarkdownOptions
): string {
  const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
  const blocks: string[] = []
  if (opts.includeSubtitles && tr?.s) blocks.push(tr.s)
  blocks.push(buildHeaderLine(verse, opts))
  const body = buildVerseBodyMarkdown(verse, opts, 'full')
  if (body) blocks.push(body)
  return blocks.join('\n\n')
}

/**
 * Word-by-word plain text: subtitle → header → per-word lines → secondary → footnote.
 * Each line is `arabic — transliteration — translation`, conditional on toggles.
 */
export function buildWordByWordMarkdown(
  verse: VerseData,
  opts: CopyMarkdownOptions
): string {
  const tr = verse.tr?.[opts.primaryCode] ?? verse.tr?.['en']
  const blocks: string[] = []
  if (opts.includeSubtitles && tr?.s) blocks.push(tr.s)
  blocks.push(buildHeaderLine(verse, opts))
  const body = buildVerseBodyMarkdown(verse, opts, 'wbw')
  if (body) blocks.push(body)
  return blocks.join('\n\n')
}

export function buildMultiVerseMarkdown(
  verses: VerseData[],
  kind: 'full' | 'wbw',
  opts: CopyMarkdownOptions,
  includeHeader = true
): string {
  return verses
    .map((v) =>
      includeHeader
        ? kind === 'full'
          ? buildVerseMarkdown(v, opts)
          : buildWordByWordMarkdown(v, opts)
        : buildVerseBodyMarkdown(v, opts, kind)
    )
    .join('\n\n')
}
