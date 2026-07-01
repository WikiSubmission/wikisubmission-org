// ─── Types ────────────────────────────────────────────────────────────────────

export type ParsedRef = {
  cn: number // chapter number
  vs: number // verse start
  ve: number // verse end (= vs for a single verse)
}

export type ParsedAllChaptersVerseRef = {
  vs: number // verse start (applied to every chapter)
  ve: number // verse end (= vs for a single verse)
}

export type ParsedBibleRef = {
  bn: number         // book number (1–66)
  cs: number         // chapter start
  vs: number         // verse start
  ve: number         // verse end (= vs for a single verse)
  displayBook: string // how to show the book name in a badge
}

// ─── Quran ────────────────────────────────────────────────────────────────────

/**
 * Returns a fresh regex for scanning prose text for Quran references.
 * Uses the colon form only (e.g. "2:255", "1:1-7") to avoid false positives
 * in regular text where two adjacent numbers separated by a space are common.
 *
 * A fresh instance is returned each call to avoid the shared-state issue that
 * arises when a single `/g` regex is reused across multiple exec() loops.
 */
export function createQuranInlineRefRe(): RegExp {
  return /\b(\d{1,3}:\d{1,3}(?:-\d{1,3})?)\b/g
}

/**
 * Returns a fresh regex for scanning prose text for numeric Bible references
 * in the form "bookNumber:chapter:verse[-verseEnd]" (e.g. "40:5:3", "40:5:3-6").
 * Book numbers 1–66 only.
 */
export function createBibleNumericInlineRefRe(): RegExp {
  return /\b([1-9]|[1-5][0-9]|6[0-6]):\d{1,3}:\d{1,3}(?:-\d{1,3})?\b/g
}

/**
 * Returns a fresh regex for scanning prose text for named Bible references
 * (e.g. "Mark 4:12", "1 Sam 3:1-5", "Song of Solomon 1:1").
 *
 * Built dynamically from BIBLE_BOOK_MAP keys, longest-first so multi-word
 * names like "Song of Solomon" win over a sub-match like "Song". Case-insensitive.
 */
export function createBibleNamedInlineRefRe(): RegExp {
  const names = Object.keys(BIBLE_BOOK_MAP)
    .sort((a, b) => b.length - a.length)
    .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  return new RegExp(`\\b(?:${names})\\s+\\d{1,3}:\\d{1,3}(?:-\\d{1,3})?\\b`, 'gi')
}

/**
 * Returns true when the user's search input looks like a Quran verse reference
 * (e.g. "2:255", "2 255", "2:255-257"), so that chapter autocomplete can be
 * suppressed while the user is typing a ref.
 */
export function isQuranRefInput(input: string): boolean {
  // Already has a colon separator ("2:") or a space followed by a digit ("2 2")
  // Also matches the all-chapters form ":50" / ":50-55"
  return /^\d+:/.test(input) || /^\d+\s+\d/.test(input) || /^:\d/.test(input)
}

/**
 * Parses the all-chapters-by-verse form ":50" or ":50-55" — meaning
 * "every chapter that has verse 50" (or the verse range).
 *
 *   ":50"     → { vs: 50, ve: 50 }
 *   ":50-55"  → { vs: 50, ve: 55 }
 *
 * Returns null for unrecognised input. Note this is intentionally a separate
 * function from `parseQuranRef` because the result is fundamentally a list
 * of refs, not a single (chapter, verse) pair — call `expandAllChaptersVerseRef`
 * with chapter metadata to produce a concrete verse list.
 */
export function parseAllChaptersVerseRef(input: string): ParsedAllChaptersVerseRef | null {
  const m = input.trim().match(/^:(\d{1,3})(?:-(\d{1,3}))?$/)
  if (!m) return null
  const vs = parseInt(m[1])
  const ve = m[2] ? parseInt(m[2]) : vs
  if (vs < 0 || ve < vs) return null
  return { vs, ve }
}

/**
 * Expands a parsed `:N` / `:N-M` ref into a comma-separated verse list
 * suitable for the `/quran/<verses>` route. Chapters whose `verse_count`
 * is below `ve` are skipped (verse doesn't exist there).
 *
 *   { vs: 50, ve: 50 }, [{cn:1,vc:7},{cn:2,vc:286}, ...]  → "2:50,3:50,..."
 *
 * Returns an empty string when no chapter qualifies.
 */
export function expandAllChaptersVerseRef(
  parsed: ParsedAllChaptersVerseRef,
  chapters: ReadonlyArray<{ chapter_number?: number; verse_count?: number }>
): string {
  const parts: string[] = []
  const sorted = [...chapters].sort(
    (a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0)
  )
  for (const ch of sorted) {
    const cn = ch.chapter_number
    const vc = ch.verse_count ?? 0
    if (cn == null || vc < parsed.ve) continue
    parts.push(
      parsed.vs === parsed.ve
        ? `${cn}:${parsed.vs}`
        : `${cn}:${parsed.vs}-${parsed.ve}`
    )
  }
  return parts.join(',')
}

/**
 * Normalises a user-typed Quran ref to canonical colon form before it is
 * placed in a URL or passed to the router.
 *
 *   "3 5"    → "3:5"
 *   "3 5-7"  → "3:5-7"
 *   "3:5"    → "3:5"   (no-op)
 *   anything else → returned unchanged
 */
export function normalizeQuranInput(input: string): string {
  return input.trim().replace(/^(\d{1,3})\s+(\d{1,3}(?:-\d{1,3})?)$/, '$1:$2')
}

/**
 * Parses a Quran reference string into chapter + verse range.
 *
 * Accepts both colon and space as the chapter–verse separator:
 *   "2:255"     single verse (colon)
 *   "2 255"     single verse (space)
 *   "1:1-7"     verse range  (colon)
 *   "1 1-7"     verse range  (space)
 *   "2:255-257" verse range  (colon)
 *   "2 255-257" verse range  (space)
 *
 * Returns null for unrecognised input.
 */
export function parseQuranRef(ref: string): ParsedRef | null {
  const m = ref.trim().match(/^(\d{1,3})[\s:](\d{1,3})(?:-(\d{1,3}))?$/)
  if (!m) return null
  const cn = parseInt(m[1])
  const vs = parseInt(m[2])
  const ve = m[3] ? parseInt(m[3]) : vs
  if (cn < 1 || cn > 114 || vs < 0) return null
  return { cn, vs, ve }
}

// ─── Bible ────────────────────────────────────────────────────────────────────

/** Lowercase book name / abbreviation → book number (1–66) */
export const BIBLE_BOOK_MAP: Record<string, number> = {
  // Old Testament
  genesis: 1, gen: 1,
  exodus: 2, exod: 2, ex: 2,
  leviticus: 3, lev: 3,
  numbers: 4, num: 4, nums: 4,
  deuteronomy: 5, deut: 5, dt: 5,
  joshua: 6, josh: 6,
  judges: 7, judg: 7, jdg: 7,
  ruth: 8,
  '1 samuel': 9, '1 sam': 9, '1sam': 9,
  '2 samuel': 10, '2 sam': 10, '2sam': 10,
  '1 kings': 11, '1 kgs': 11, '1kgs': 11,
  '2 kings': 12, '2 kgs': 12, '2kgs': 12,
  '1 chronicles': 13, '1 chr': 13, '1chr': 13,
  '2 chronicles': 14, '2 chr': 14, '2chr': 14,
  ezra: 15,
  nehemiah: 16, neh: 16,
  esther: 17, esth: 17,
  job: 18,
  psalms: 19, psalm: 19, ps: 19, pss: 19,
  proverbs: 20, prov: 20,
  ecclesiastes: 21, eccl: 21, qoh: 21,
  'song of solomon': 22, 'song of songs': 22, song: 22, sos: 22, cant: 22,
  isaiah: 23, isa: 23,
  jeremiah: 24, jer: 24,
  lamentations: 25, lam: 25,
  ezekiel: 26, ezek: 26,
  daniel: 27, dan: 27,
  hosea: 28, hos: 28,
  joel: 29,
  amos: 30,
  obadiah: 31, obad: 31,
  jonah: 32, jon: 32,
  micah: 33, mic: 33,
  nahum: 34, nah: 34,
  habakkuk: 35, hab: 35,
  zephaniah: 36, zeph: 36,
  haggai: 37, hag: 37,
  zechariah: 38, zech: 38,
  malachi: 39, mal: 39,
  // New Testament
  matthew: 40, matt: 40, mt: 40,
  mark: 41, mk: 41,
  luke: 42, lk: 42,
  john: 43, jn: 43,
  acts: 44,
  romans: 45, rom: 45,
  '1 corinthians': 46, '1 cor': 46, '1cor': 46,
  '2 corinthians': 47, '2 cor': 47, '2cor': 47,
  galatians: 48, gal: 48,
  ephesians: 49, eph: 49,
  philippians: 50, phil: 50,
  colossians: 51, col: 51,
  '1 thessalonians': 52, '1 thess': 52, '1thess': 52,
  '2 thessalonians': 53, '2 thess': 53, '2thess': 53,
  '1 timothy': 54, '1 tim': 54, '1tim': 54,
  '2 timothy': 55, '2 tim': 55, '2tim': 55,
  titus: 56,
  philemon: 57, phlm: 57, phm: 57,
  hebrews: 58, heb: 58,
  james: 59, jas: 59,
  '1 peter': 60, '1 pet': 60, '1pet': 60,
  '2 peter': 61, '2 pet': 61, '2pet': 61,
  '1 john': 62, '1 jn': 62, '1jn': 62,
  '2 john': 63, '2 jn': 63, '2jn': 63,
  '3 john': 64, '3 jn': 64, '3jn': 64,
  jude: 65,
  revelation: 66, rev: 66, apoc: 66,
}

/** Short display name for each book number (used when ref is numeric "40:5:3") */
export const BIBLE_BOOK_SHORT: Record<number, string> = {
  1: 'Gen', 2: 'Exod', 3: 'Lev', 4: 'Num', 5: 'Deut',
  6: 'Josh', 7: 'Judg', 8: 'Ruth', 9: '1 Sam', 10: '2 Sam',
  11: '1 Kgs', 12: '2 Kgs', 13: '1 Chr', 14: '2 Chr', 15: 'Ezra',
  16: 'Neh', 17: 'Esth', 18: 'Job', 19: 'Ps', 20: 'Prov',
  21: 'Eccl', 22: 'Song', 23: 'Isa', 24: 'Jer', 25: 'Lam',
  26: 'Ezek', 27: 'Dan', 28: 'Hos', 29: 'Joel', 30: 'Amos',
  31: 'Obad', 32: 'Jonah', 33: 'Mic', 34: 'Nah', 35: 'Hab',
  36: 'Zeph', 37: 'Hag', 38: 'Zech', 39: 'Mal',
  40: 'Matt', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
  45: 'Rom', 46: '1 Cor', 47: '2 Cor', 48: 'Gal', 49: 'Eph',
  50: 'Phil', 51: 'Col', 52: '1 Thess', 53: '2 Thess', 54: '1 Tim',
  55: '2 Tim', 56: 'Titus', 57: 'Phlm', 58: 'Heb', 59: 'Jas',
  60: '1 Pet', 61: '2 Pet', 62: '1 John', 63: '2 John', 64: '3 John',
  65: 'Jude', 66: 'Rev',
}

/**
 * Parses a Bible reference string into book + chapter + verse range.
 *
 * Accepts both colon and space as the chapter–verse separator:
 *
 *   Numeric:  "40:5:3"          → Matthew ch 5 v 3  (colon only for numeric)
 *             "40:5:3-6"
 *
 *   Named:    "Mark 4:12"       → Mark ch 4 v 12
 *             "Mark 4 12"       → Mark ch 4 v 12  (space separator)
 *             "Mark 4:12-15"
 *             "Mark 4 12-15"
 *             "1 Sam 3:1"
 *             "Song of Solomon 1:1"
 *             "Song of Solomon 1 1"
 *
 * Returns null for unrecognised input.
 */
export function parseBibleRef(ref: string): ParsedBibleRef | null {
  const trimmed = ref.trim()

  // Numeric format: "40:5:3" or "40:5:3-6"  (book_number:chapter:verse[-verseEnd])
  const numericMatch = trimmed.match(/^(\d{1,2}):(\d+):(\d+)(?:-(\d+))?$/)
  if (numericMatch) {
    const bn = parseInt(numericMatch[1])
    if (bn < 1 || bn > 66) return null
    const cs = parseInt(numericMatch[2])
    const vs = parseInt(numericMatch[3])
    const ve = numericMatch[4] ? parseInt(numericMatch[4]) : vs
    return { bn, cs, vs, ve, displayBook: BIBLE_BOOK_SHORT[bn] ?? `Book ${bn}` }
  }

  // Named format: "Mark 4:12", "Mark 4 12", "Song of Solomon 1:1-5", "1 Sam 3 1"
  // The chapter–verse separator accepts either colon or space.
  const namedMatch = trimmed.match(/^(.+?)\s+(\d+)[\s:](\d+)(?:-(\d+))?$/)
  if (namedMatch) {
    const bookName = namedMatch[1].trim()
    const bn = BIBLE_BOOK_MAP[bookName.toLowerCase()]
    if (!bn) return null
    const cs = parseInt(namedMatch[2])
    const vs = parseInt(namedMatch[3])
    const ve = namedMatch[4] ? parseInt(namedMatch[4]) : vs
    return { bn, cs, vs, ve, displayBook: bookName }
  }

  return null
}
