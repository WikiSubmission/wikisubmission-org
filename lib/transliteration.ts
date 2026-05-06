/**
 * Latin <-> Arabic transliteration for Quranic root searches.
 * Buckwalter-flavored simplified mapping. Digraphs are matched greedily before
 * single-letter mapping. Capitals encode emphatic consonants (S, D, T, Z, H, G).
 *
 * Mirrors the algorithm in `Frontpage/design_handoff_word_lab/reference/words.jsx`.
 */

const TR_DIGRAPHS: ReadonlyArray<readonly [string, string]> = [
  ['kh', 'خ'],
  ['gh', 'غ'],
  ['sh', 'ش'],
  ['th', 'ث'],
  ['dh', 'ذ'],
  ['ts', 'ث'],
  ['ph', 'ف'],
]

const TR_SINGLE: Readonly<Record<string, string>> = {
  a: 'ا',
  b: 'ب',
  t: 'ت',
  j: 'ج',
  H: 'ح',
  h: 'ه',
  d: 'د',
  r: 'ر',
  z: 'ز',
  s: 'س',
  S: 'ص',
  D: 'ض',
  T: 'ط',
  Z: 'ظ',
  c: 'ع',
  G: 'غ',
  f: 'ف',
  q: 'ق',
  k: 'ك',
  l: 'ل',
  m: 'م',
  n: 'ن',
  w: 'و',
  y: 'ي',
  "'": 'ء',
  '`': 'ع',
}

const ARABIC_RANGE = /[؀-ۿ]/
const ARABIC_DIACRITICS = /[ً-ْٰ]/g

/**
 * Convert a Latin transliteration (or pass-through Arabic) to bare Arabic letters.
 * Pure function; safe to call on every keystroke.
 */
export function toArabicLetters(input: string): string {
  if (!input) return ''

  if (ARABIC_RANGE.test(input)) {
    return input.replace(ARABIC_DIACRITICS, '').trim()
  }

  const cleaned = input.replace(/[^a-zA-Z'`]/g, '')
  let out = ''
  let i = 0
  while (i < cleaned.length) {
    const two = cleaned.slice(i, i + 2).toLowerCase()
    const digraph = TR_DIGRAPHS.find(([k]) => k === two)
    if (digraph) {
      out += digraph[1]
      i += 2
      continue
    }
    const ch = cleaned[i]
    const mapped = TR_SINGLE[ch] ?? TR_SINGLE[ch.toLowerCase()]
    if (mapped) out += mapped
    i += 1
  }
  return out
}

/** Abjadi (Arabic alphabet) order for grouping/sorting. */
export const ABJAD = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
] as const

/** Compare two root letter strings letter-by-letter using abjadi order. */
export function abjadiCompare(a: string, b: string): number {
  const al = a.replace(/\s+/g, '')
  const bl = b.replace(/\s+/g, '')
  const len = Math.min(al.length, bl.length)
  for (let i = 0; i < len; i++) {
    const ai = ABJAD.indexOf(al[i] as (typeof ABJAD)[number])
    const bi = ABJAD.indexOf(bl[i] as (typeof ABJAD)[number])
    if (ai !== bi) return ai - bi
  }
  return al.length - bl.length
}

/** Latin transliteration for an Arabic root, e.g. "ك ت ب" -> "k-t-b". */
export function rootToLatin(letters: string): string {
  const reverse: Record<string, string> = {}
  for (const [latin, arabic] of TR_DIGRAPHS) reverse[arabic] = latin
  for (const [latin, arabic] of Object.entries(TR_SINGLE)) {
    if (!(arabic in reverse)) reverse[arabic] = latin
  }
  return letters
    .split(/\s+/)
    .filter(Boolean)
    .map((ch) => reverse[ch] ?? ch)
    .join('-')
}

/** Strip Arabic diacritics from a string (for substring highlight matching). */
export function stripDiacritics(s: string): string {
  return s.replace(ARABIC_DIACRITICS, '')
}
