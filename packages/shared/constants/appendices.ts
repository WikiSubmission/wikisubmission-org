export interface AppendixMeta {
  number: number
  title: string
  quranRef?: string
}

export function appendixPdfUrl(number: number): string {
  return `https://library.wikisubmission.org/file/quran-the-final-testament-appendix-${number}`
}

// The editorial store keeps the scripture reference inside the title
// ("One of the Great Miracles [74:35]"), while the reader renders it on its own
// line beneath the heading.
const TRAILING_REF = /\s*\[(\d{1,3}:\d{1,3}(?:-\d{1,3})?)\]\s*$/

/**
 * Splits an editorial appendix title into the heading and its trailing
 * scripture reference, so a title edited in /editor renders in the same shape
 * as the static metadata.
 */
export function splitAppendixTitle(title: string): { title: string; quranRef?: string } {
  const match = TRAILING_REF.exec(title)
  if (!match) return { title: title.trim() }
  return { title: title.replace(TRAILING_REF, '').trim(), quranRef: match[1] }
}

/**
 * Reader-facing metadata for an appendix: the editorial row when it has one,
 * otherwise the static list. Returns undefined for an unknown number.
 */
export function resolveAppendixMeta(
  number: number,
  editorialTitle?: string
): AppendixMeta | undefined {
  const fallback = APPENDICES.find((a) => a.number === number)
  if (!editorialTitle?.trim()) return fallback
  const split = splitAppendixTitle(editorialTitle)
  return {
    number,
    title: split.title || fallback?.title || editorialTitle,
    quranRef: split.quranRef ?? fallback?.quranRef,
  }
}

export const APPENDICES: AppendixMeta[] = [
  { number: 1, title: 'One of the Great Miracles', quranRef: '74:35' },
  { number: 2, title: "God's Messenger of the Covenant", quranRef: '3:81' },
  { number: 3, title: 'We Made the Quran Easy', quranRef: '54:17' },
  { number: 4, title: 'Why Was the Quran Revealed in Arabic?' },
  { number: 5, title: 'Heaven and Hell' },
  { number: 6, title: 'Greatness of God' },
  { number: 7, title: 'Why Were We Created?' },
  { number: 8, title: 'The Myth of Intercession' },
  { number: 9, title: 'Abraham: Original Messenger of Submission' },
  { number: 10, title: "God's Usage of the Plural Tense" },
  { number: 11, title: 'The Day of Resurrection' },
  { number: 12, title: 'Role of the Prophet Muhammad' },
  { number: 13, title: 'The First Pillar of Submission' },
  { number: 14, title: 'Predestination' },
  { number: 15, title: 'Religious Duties: Gift from God' },
  { number: 16, title: 'Dietary Prohibition' },
  { number: 17, title: 'Death' },
  { number: 18, title: 'Quran is All You Need' },
  { number: 19, title: 'Hadith and Sunna: Satanic Innovations' },
  { number: 20, title: 'Quran: Unlike Any Other Book' },
  { number: 21, title: 'Satan: Fallen Angel' },
  { number: 22, title: 'Jesus' },
  { number: 23, title: 'Chronological Order of Revelation' },
  { number: 24, title: 'Two False Verses Removed from the Quran' },
  { number: 25, title: 'End of the World' },
  { number: 26, title: 'The Three Messengers of Islam' },
  { number: 27, title: 'Who Is Your God?' },
  {
    number: 28,
    title: "Muhammad Wrote God's Revelations With His Own Hand",
  },
  { number: 29, title: 'The Missing Basmalah' },
  { number: 30, title: 'Polygamy' },
  { number: 31, title: 'Evolution: A Divinely Guided Process' },
  { number: 32, title: 'The Crucial Age of 40' },
  { number: 33, title: 'Why Did God Send a Messenger Now?' },
  { number: 34, title: 'Virginity/Chastity: A Trait of the True Believers' },
  { number: 35, title: 'Drugs & Alcohol' },
  { number: 36, title: 'What Price A Great Nation' },
  { number: 37, title: 'Criminal Justice in Islam' },
  { number: 38, title: "The Creator's Signature" },
]
