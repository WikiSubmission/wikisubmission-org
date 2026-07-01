export type BibleBook = {
  bn: number   // book_number (1–66)
  bk: string   // book_name (matches backend exactly)
  t: 'OT' | 'NT'
  cc: number   // chapter_count
  vc: number   // verse_count
  /** URL-safe slug, e.g. "genesis", "1-samuel", "song-of-solomon" */
  slug: string
}

export const BIBLE_BOOKS: BibleBook[] = [
  { bn: 1,  bk: 'Genesis',          t: 'OT', cc: 50,  vc: 1533, slug: 'genesis' },
  { bn: 2,  bk: 'Exodus',           t: 'OT', cc: 40,  vc: 1213, slug: 'exodus' },
  { bn: 3,  bk: 'Leviticus',        t: 'OT', cc: 27,  vc: 859,  slug: 'leviticus' },
  { bn: 4,  bk: 'Numbers',          t: 'OT', cc: 36,  vc: 1288, slug: 'numbers' },
  { bn: 5,  bk: 'Deuteronomy',      t: 'OT', cc: 34,  vc: 959,  slug: 'deuteronomy' },
  { bn: 6,  bk: 'Joshua',           t: 'OT', cc: 24,  vc: 658,  slug: 'joshua' },
  { bn: 7,  bk: 'Judges',           t: 'OT', cc: 21,  vc: 618,  slug: 'judges' },
  { bn: 8,  bk: 'Ruth',             t: 'OT', cc: 4,   vc: 85,   slug: 'ruth' },
  { bn: 9,  bk: '1 Samuel',         t: 'OT', cc: 31,  vc: 810,  slug: '1-samuel' },
  { bn: 10, bk: '2 Samuel',         t: 'OT', cc: 24,  vc: 695,  slug: '2-samuel' },
  { bn: 11, bk: '1 Kings',          t: 'OT', cc: 22,  vc: 816,  slug: '1-kings' },
  { bn: 12, bk: '2 Kings',          t: 'OT', cc: 25,  vc: 719,  slug: '2-kings' },
  { bn: 13, bk: '1 Chronicles',     t: 'OT', cc: 29,  vc: 942,  slug: '1-chronicles' },
  { bn: 14, bk: '2 Chronicles',     t: 'OT', cc: 36,  vc: 822,  slug: '2-chronicles' },
  { bn: 15, bk: 'Ezra',             t: 'OT', cc: 10,  vc: 280,  slug: 'ezra' },
  { bn: 16, bk: 'Nehemiah',         t: 'OT', cc: 13,  vc: 406,  slug: 'nehemiah' },
  { bn: 17, bk: 'Esther',           t: 'OT', cc: 10,  vc: 167,  slug: 'esther' },
  { bn: 18, bk: 'Job',              t: 'OT', cc: 42,  vc: 1070, slug: 'job' },
  { bn: 19, bk: 'Psalms',           t: 'OT', cc: 150, vc: 2461, slug: 'psalms' },
  { bn: 20, bk: 'Proverbs',         t: 'OT', cc: 31,  vc: 915,  slug: 'proverbs' },
  { bn: 21, bk: 'Ecclesiastes',     t: 'OT', cc: 12,  vc: 222,  slug: 'ecclesiastes' },
  { bn: 22, bk: 'Song of Solomon',  t: 'OT', cc: 8,   vc: 117,  slug: 'song-of-solomon' },
  { bn: 23, bk: 'Isaiah',           t: 'OT', cc: 66,  vc: 1292, slug: 'isaiah' },
  { bn: 24, bk: 'Jeremiah',         t: 'OT', cc: 52,  vc: 1364, slug: 'jeremiah' },
  { bn: 25, bk: 'Lamentations',     t: 'OT', cc: 5,   vc: 154,  slug: 'lamentations' },
  { bn: 26, bk: 'Ezekiel',          t: 'OT', cc: 48,  vc: 1273, slug: 'ezekiel' },
  { bn: 27, bk: 'Daniel',           t: 'OT', cc: 12,  vc: 357,  slug: 'daniel' },
  { bn: 28, bk: 'Hosea',            t: 'OT', cc: 14,  vc: 197,  slug: 'hosea' },
  { bn: 29, bk: 'Joel',             t: 'OT', cc: 3,   vc: 73,   slug: 'joel' },
  { bn: 30, bk: 'Amos',             t: 'OT', cc: 9,   vc: 146,  slug: 'amos' },
  { bn: 31, bk: 'Obadiah',          t: 'OT', cc: 1,   vc: 21,   slug: 'obadiah' },
  { bn: 32, bk: 'Jonah',            t: 'OT', cc: 4,   vc: 48,   slug: 'jonah' },
  { bn: 33, bk: 'Micah',            t: 'OT', cc: 7,   vc: 105,  slug: 'micah' },
  { bn: 34, bk: 'Nahum',            t: 'OT', cc: 3,   vc: 47,   slug: 'nahum' },
  { bn: 35, bk: 'Habakkuk',         t: 'OT', cc: 3,   vc: 56,   slug: 'habakkuk' },
  { bn: 36, bk: 'Zephaniah',        t: 'OT', cc: 3,   vc: 53,   slug: 'zephaniah' },
  { bn: 37, bk: 'Haggai',           t: 'OT', cc: 2,   vc: 38,   slug: 'haggai' },
  { bn: 38, bk: 'Zechariah',        t: 'OT', cc: 14,  vc: 211,  slug: 'zechariah' },
  { bn: 39, bk: 'Malachi',          t: 'OT', cc: 4,   vc: 55,   slug: 'malachi' },
  { bn: 40, bk: 'Matthew',          t: 'NT', cc: 28,  vc: 1071, slug: 'matthew' },
  { bn: 41, bk: 'Mark',             t: 'NT', cc: 16,  vc: 678,  slug: 'mark' },
  { bn: 42, bk: 'Luke',             t: 'NT', cc: 24,  vc: 1151, slug: 'luke' },
  { bn: 43, bk: 'John',             t: 'NT', cc: 21,  vc: 879,  slug: 'john' },
  { bn: 44, bk: 'Acts',             t: 'NT', cc: 28,  vc: 1007, slug: 'acts' },
  { bn: 45, bk: 'Romans',           t: 'NT', cc: 16,  vc: 434,  slug: 'romans' },
  { bn: 46, bk: '1 Corinthians',    t: 'NT', cc: 16,  vc: 437,  slug: '1-corinthians' },
  { bn: 47, bk: '2 Corinthians',    t: 'NT', cc: 13,  vc: 257,  slug: '2-corinthians' },
  { bn: 48, bk: 'Galatians',        t: 'NT', cc: 6,   vc: 149,  slug: 'galatians' },
  { bn: 49, bk: 'Ephesians',        t: 'NT', cc: 6,   vc: 155,  slug: 'ephesians' },
  { bn: 50, bk: 'Philippians',      t: 'NT', cc: 4,   vc: 104,  slug: 'philippians' },
  { bn: 51, bk: 'Colossians',       t: 'NT', cc: 4,   vc: 95,   slug: 'colossians' },
  { bn: 52, bk: '1 Thessalonians',  t: 'NT', cc: 5,   vc: 89,   slug: '1-thessalonians' },
  { bn: 53, bk: '2 Thessalonians',  t: 'NT', cc: 3,   vc: 47,   slug: '2-thessalonians' },
  { bn: 54, bk: '1 Timothy',        t: 'NT', cc: 6,   vc: 113,  slug: '1-timothy' },
  { bn: 55, bk: '2 Timothy',        t: 'NT', cc: 4,   vc: 83,   slug: '2-timothy' },
  { bn: 56, bk: 'Titus',            t: 'NT', cc: 3,   vc: 46,   slug: 'titus' },
  { bn: 57, bk: 'Philemon',         t: 'NT', cc: 1,   vc: 25,   slug: 'philemon' },
  { bn: 58, bk: 'Hebrews',          t: 'NT', cc: 13,  vc: 303,  slug: 'hebrews' },
  { bn: 59, bk: 'James',            t: 'NT', cc: 5,   vc: 108,  slug: 'james' },
  { bn: 60, bk: '1 Peter',          t: 'NT', cc: 5,   vc: 105,  slug: '1-peter' },
  { bn: 61, bk: '2 Peter',          t: 'NT', cc: 3,   vc: 61,   slug: '2-peter' },
  { bn: 62, bk: '1 John',           t: 'NT', cc: 5,   vc: 105,  slug: '1-john' },
  { bn: 63, bk: '2 John',           t: 'NT', cc: 1,   vc: 13,   slug: '2-john' },
  { bn: 64, bk: '3 John',           t: 'NT', cc: 1,   vc: 14,   slug: '3-john' },
  { bn: 65, bk: 'Jude',             t: 'NT', cc: 1,   vc: 25,   slug: 'jude' },
  { bn: 66, bk: 'Revelation',       t: 'NT', cc: 22,  vc: 404,  slug: 'revelation' },
]

export const OT_BOOKS = BIBLE_BOOKS.filter((b) => b.t === 'OT')
export const NT_BOOKS = BIBLE_BOOKS.filter((b) => b.t === 'NT')

/** Resolve a URL slug or numeric string to a book entry. */
export function bookFromSlug(slug: string): BibleBook | undefined {
  const n = parseInt(slug)
  if (!isNaN(n)) return BIBLE_BOOKS.find((b) => b.bn === n)
  return BIBLE_BOOKS.find((b) => b.slug === slug.toLowerCase())
}

/** Generate chapter array [1..cc] for a book. */
export function chapterRange(book: BibleBook): number[] {
  return Array.from({ length: book.cc }, (_, i) => i + 1)
}
