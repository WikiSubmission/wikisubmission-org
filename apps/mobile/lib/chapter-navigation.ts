const FIRST_CHAPTER = 1
const LAST_CHAPTER = 114

type ChapterHistory = Pick<History, 'replaceState'>

/**
 * Update an in-reader chapter transition without adding another Back entry.
 *
 * The reader itself is one page in mobile navigation history. Prev/Next only
 * changes the chapter shown on that page, so Android Back should return to the
 * page that opened the reader rather than replaying every chapter visited.
 */
export function replaceChapterHistoryEntry(
  history: ChapterHistory,
  target: number,
): boolean {
  if (!Number.isInteger(target) || target < FIRST_CHAPTER || target > LAST_CHAPTER) {
    return false
  }

  history.replaceState(null, '', `/quran/${target}/`)
  return true
}
