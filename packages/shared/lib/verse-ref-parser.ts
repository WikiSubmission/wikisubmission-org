/**
 * Verse reference parser for Quran and Bible.
 *
 * Quran format:  chapter:verse  or  chapter:verse-verse
 *   e.g.  "1:1", "2:255", "3:1-10", "1:1-7, 2:3"
 *
 * Bible format:  BookName chapter:verse  or  BookName chapter:verse-verse
 *   e.g.  "Genesis 1:1", "Gen 1:1-5", "Matthew 5:3", "John 3:16"
 *   → resolved to  book_number:chapter:verse  (e.g. "1:1:1", "40:5:3")
 */

// ── Quran ─────────────────────────────────────────────────────────────────────

export type QuranVerseKey = string // "chapter:verse"

export interface QuranRef {
  type: 'verse'
  cn: number
  v: number
  raw: string
}

export interface QuranRangeRef {
  type: 'range'
  cn: number
  vs: number
  ve: number
  raw: string
}

export type QuranSegment = QuranRef | QuranRangeRef

export function parseQuranSegments(input: string): QuranSegment[] {
  return input.split(',').flatMap((s): QuranSegment[] => {
    const part = s.trim()
    const v = part.match(/^(\d+):(\d+)$/)
    if (v) return [{ type: 'verse', cn: +v[1], v: +v[2], raw: part }]
    const r = part.match(/^(\d+):(\d+)-(\d+)$/)
    if (r) return [{ type: 'range', cn: +r[1], vs: +r[2], ve: +r[3], raw: part }]
    return []
  })
}

/** Expand Quran segments to individual verse keys. */
export function expandQuranSegments(segments: QuranSegment[]): QuranVerseKey[] {
  const keys: QuranVerseKey[] = []
  for (const seg of segments) {
    if (seg.type === 'verse') {
      keys.push(`${seg.cn}:${seg.v}`)
    } else {
      for (let v = seg.vs; v <= seg.ve; v++) {
        keys.push(`${seg.cn}:${v}`)
      }
    }
  }
  return keys
}

/** Parse a Quran reference string directly to individual verse keys. */
export function parseQuranRefs(input: string): QuranVerseKey[] {
  return expandQuranSegments(parseQuranSegments(input))
}

// ── Bible ─────────────────────────────────────────────────────────────────────

export type BibleVerseKey = string // "book_number:chapter:verse"

/** 66 canonical books: name variants → 1-based book number */
const BIBLE_BOOK_MAP: Record<string, number> = {
  genesis: 1, gen: 1, ge: 1, gn: 1,
  exodus: 2, exod: 2, ex: 2, exo: 2,
  leviticus: 3, lev: 3, le: 3, lv: 3,
  numbers: 4, num: 4, nu: 4, nm: 4,
  deuteronomy: 5, deut: 5, dt: 5, de: 5,
  joshua: 6, josh: 6, jos: 6, jsh: 6,
  judges: 7, judg: 7, jdg: 7, jg: 7, jdgs: 7,
  ruth: 8, rut: 8, ru: 8,
  '1samuel': 9, '1sam': 9, '1sa': 9, '1s': 9, 'i samuel': 9, 'i sam': 9,
  '2samuel': 10, '2sam': 10, '2sa': 10, '2s': 10, 'ii samuel': 10, 'ii sam': 10,
  '1kings': 11, '1kgs': 11, '1ki': 11, '1k': 11, 'i kings': 11, 'i kgs': 11,
  '2kings': 12, '2kgs': 12, '2ki': 12, '2k': 12, 'ii kings': 12, 'ii kgs': 12,
  '1chronicles': 13, '1chr': 13, '1ch': 13, 'i chronicles': 13, 'i chr': 13,
  '2chronicles': 14, '2chr': 14, '2ch': 14, 'ii chronicles': 14, 'ii chr': 14,
  ezra: 15, ezr: 15,
  nehemiah: 16, neh: 16, ne: 16,
  esther: 17, esth: 17, est: 17, es: 17,
  job: 18, jb: 18,
  psalms: 19, psalm: 19, ps: 19, pss: 19, psa: 19,
  proverbs: 20, prov: 20, pro: 20, prv: 20, pr: 20,
  ecclesiastes: 21, eccl: 21, ecc: 21, ec: 21, qoh: 21,
  'song of solomon': 22, 'song of songs': 22, sos: 22, ss: 22, song: 22, sg: 22,
  isaiah: 23, isa: 23, is: 23,
  jeremiah: 24, jer: 24, je: 24,
  lamentations: 25, lam: 25, la: 25,
  ezekiel: 26, ezek: 26, eze: 26, ezk: 26,
  daniel: 27, dan: 27, da: 27, dn: 27,
  hosea: 28, hos: 28, ho: 28,
  joel: 29, jl: 29,
  amos: 30, am: 30,
  obadiah: 31, obad: 31, ob: 31,
  jonah: 32, jon: 32, jnh: 32,
  micah: 33, mic: 33, mi: 33,
  nahum: 34, nah: 34, na: 34,
  habakkuk: 35, hab: 35,
  zephaniah: 36, zeph: 36, zep: 36,
  haggai: 37, hag: 37, hg: 37,
  zechariah: 38, zech: 38, zec: 38,
  malachi: 39, mal: 39, ml: 39,
  matthew: 40, matt: 40, mt: 40,
  mark: 41, mrk: 41, mk: 41, mr: 41,
  luke: 42, lk: 42, lu: 42,
  john: 43, jn: 43, joh: 43,
  acts: 44, act: 44, ac: 44,
  romans: 45, rom: 45, ro: 45, rm: 45,
  '1corinthians': 46, '1cor': 46, '1co': 46, 'i corinthians': 46, 'i cor': 46,
  '2corinthians': 47, '2cor': 47, '2co': 47, 'ii corinthians': 47, 'ii cor': 47,
  galatians: 48, gal: 48, ga: 48,
  ephesians: 49, eph: 49,
  philippians: 50, phil: 50, php: 50, pp: 50,
  colossians: 51, col: 51,
  '1thessalonians': 52, '1thess': 52, '1th': 52, 'i thessalonians': 52,
  '2thessalonians': 53, '2thess': 53, '2th': 53, 'ii thessalonians': 53,
  '1timothy': 54, '1tim': 54, '1ti': 54, 'i timothy': 54,
  '2timothy': 55, '2tim': 55, '2ti': 55, 'ii timothy': 55,
  titus: 56, tit: 56, ti: 56,
  philemon: 57, phlm: 57, phm: 57,
  hebrews: 58, heb: 58,
  james: 59, jas: 59, jm: 59,
  '1peter': 60, '1pet': 60, '1pe': 60, '1p': 60, 'i peter': 60,
  '2peter': 61, '2pet': 61, '2pe': 61, '2p': 61, 'ii peter': 61,
  '1john': 62, '1jn': 62, '1jo': 62, 'i john': 62,
  '2john': 63, '2jn': 63, '2jo': 63, 'ii john': 63,
  '3john': 64, '3jn': 64, '3jo': 64, 'iii john': 64,
  jude: 65, jud: 65,
  revelation: 66, rev: 66, re: 66, rv: 66,
}

function normalizeBookName(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function lookupBibleBook(raw: string): number | null {
  const key = normalizeBookName(raw).replace(/\s/g, '')
  if (BIBLE_BOOK_MAP[key] !== undefined) return BIBLE_BOOK_MAP[key]
  // Try with spaces preserved (for "song of solomon" etc.)
  const keyWithSpaces = normalizeBookName(raw)
  return BIBLE_BOOK_MAP[keyWithSpaces] ?? null
}

export interface ParsedBibleRef {
  raw: string
  book: string
  bookNumber: number
  chapter: number
  verseStart: number
  verseEnd: number
}

export interface BibleParseError {
  raw: string
  reason: 'unknown_book' | 'bad_format'
}

export interface BibleParseResult {
  resolved: ParsedBibleRef[]
  errors: BibleParseError[]
}

/** Parse a Bible reference string like "Gen 1:1-5, John 3:16" */
export function parseBibleRefs(input: string): BibleParseResult {
  const resolved: ParsedBibleRef[] = []
  const errors: BibleParseError[] = []

  const parts = input.split(',').map((s) => s.trim()).filter(Boolean)

  for (const part of parts) {
    // Match: <BookName> <chapter>:<verse> or <BookName> <chapter>:<verse>-<verse>
    const m = part.match(/^((?:\d\s*)?[a-zA-Z][a-zA-Z\s]*?)\s+(\d+):(\d+)(?:-(\d+))?$/)
    if (!m) {
      errors.push({ raw: part, reason: 'bad_format' })
      continue
    }
    const bookRaw = m[1].trim()
    const chapter = parseInt(m[2], 10)
    const verseStart = parseInt(m[3], 10)
    const verseEnd = m[4] ? parseInt(m[4], 10) : verseStart

    const bookNumber = lookupBibleBook(bookRaw)
    if (bookNumber === null) {
      errors.push({ raw: part, reason: 'unknown_book' })
      continue
    }

    resolved.push({ raw: part, book: bookRaw, bookNumber, chapter, verseStart, verseEnd })
  }

  return { resolved, errors }
}

/** Expand parsed Bible refs to individual verse keys (`book:chapter:verse`). */
export function expandBibleRefs(refs: ParsedBibleRef[]): BibleVerseKey[] {
  const keys: BibleVerseKey[] = []
  for (const ref of refs) {
    for (let v = ref.verseStart; v <= ref.verseEnd; v++) {
      keys.push(`${ref.bookNumber}:${ref.chapter}:${v}`)
    }
  }
  return keys
}
