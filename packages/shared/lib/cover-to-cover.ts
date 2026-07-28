export const TOTAL_QURAN_CHAPTERS = 114

export interface CoverToCoverPosition {
  chapter: number
  verse: number
  /** Rough share of the Quran read, by chapter number. Same math as /me. */
  percent: number
}

/**
 * Parse a "chapter:verse" key into a reading position. Returns null for
 * anything that isn't a valid Quran reference, so callers can render nothing
 * rather than a broken link.
 */
export function parseCoverToCover(
  verseKey: string | null | undefined,
): CoverToCoverPosition | null {
  if (!verseKey) return null
  const [rawChapter, rawVerse] = verseKey.split(':')
  if (!/^\d+$/.test(rawChapter ?? '') || !/^\d+$/.test(rawVerse ?? '')) return null

  const chapter = parseInt(rawChapter, 10)
  const verse = parseInt(rawVerse, 10)
  if (chapter < 1 || chapter > TOTAL_QURAN_CHAPTERS) return null

  return {
    chapter,
    verse,
    percent: Math.round(Math.min(1, chapter / TOTAL_QURAN_CHAPTERS) * 100),
  }
}
