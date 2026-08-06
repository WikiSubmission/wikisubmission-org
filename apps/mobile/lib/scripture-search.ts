import { VERSE_COUNTS } from '@/constants/quran-chapters'
import {
  BIBLE_BOOK_SHORT,
  expandAllChaptersVerseRef,
  normalizeQuranInput,
  parseAllChaptersVerseRef,
  parseBibleRef,
  parseQuranRef,
} from '@/lib/scripture-parser'

/**
 * A scripture reference recognised in the chapter-index search field.
 *
 *   quran → navigable: the verses live at /quran/verses?q=<refs>
 *   bible → previewable only: the mobile app has no /bible route yet, so the
 *           reference opens the shared ScriptureRef dialog instead.
 */
export type ScriptureSearchRef =
  | { kind: 'quran'; label: string; href: string }
  | { kind: 'bible'; label: string; reference: string }

/** Chapter list shaped for `expandAllChaptersVerseRef`, from bundled constants
 *  so the `:50` form resolves without a network call. */
const CHAPTERS = VERSE_COUNTS.map((verse_count, i) => ({
  chapter_number: i + 1,
  verse_count,
}))

function versesHref(refs: string): string {
  return `/quran/verses?q=${encodeURIComponent(refs)}`
}

/**
 * Recognises what the user typed as a scripture reference, mirroring the
 * website's Quran search bar:
 *
 *   ":50" / ":50-55"   every chapter that has that verse (or range)
 *   "1:4,2:45"         comma-separated list (space form accepted per part)
 *   "5:5" / "5 5"      single verse
 *   "1:1-7" / "1 1-7"  verse range
 *   "Mark 12:3"        Bible reference (named or numeric "41:12:3")
 *
 * Returns null when the input is plain text, which falls through to the
 * full-text verse search.
 */
export function resolveScriptureRef(input: string): ScriptureSearchRef | null {
  const q = input.trim()
  if (!q) return null

  // ":50" — every chapter long enough to have that verse.
  const allChapters = parseAllChaptersVerseRef(q)
  if (allChapters) {
    const expanded = expandAllChaptersVerseRef(allChapters, CHAPTERS)
    if (expanded) return { kind: 'quran', label: q, href: versesHref(expanded) }
    return null
  }

  // "1:4,1:1-5,2:45" — only when every part is a valid reference.
  if (q.includes(',')) {
    const parts = q
      .split(',')
      .map((s) => normalizeQuranInput(s.trim()))
      .filter(Boolean)
    if (parts.length > 0 && parts.every((p) => parseQuranRef(p) !== null)) {
      const refs = parts.join(',')
      return { kind: 'quran', label: refs, href: versesHref(refs) }
    }
    return null
  }

  // "5:5", "5 5", "1:1-7"
  const normalized = normalizeQuranInput(q)
  if (parseQuranRef(normalized) !== null) {
    return { kind: 'quran', label: normalized, href: versesHref(normalized) }
  }

  // "Mark 12:3", "mark 12 3", "41:12:3"
  const bible = parseBibleRef(q)
  if (bible) {
    const book = BIBLE_BOOK_SHORT[bible.bn] ?? bible.displayBook
    const suffix = bible.ve !== bible.vs ? `-${bible.ve}` : ''
    // The canonical short form re-parses, so it doubles as the dialog input.
    const label = `${book} ${bible.cs}:${bible.vs}${suffix}`
    return { kind: 'bible', label, reference: label }
  }

  return null
}
