import type { components } from '@/src/api/types.gen'

export type BookmarkData = components['schemas']['Bookmark']
export type BookmarkCategoryData = components['schemas']['BookmarkCategory']
export type BookmarkEntryData = components['schemas']['BookmarkEntry']
export type NoteData = components['schemas']['Note']
export type SearchResultData = components['schemas']['SearchResult']

export interface ScriptureState {
  bookmarks: Record<string, BookmarkEntryData[]>
  notes: Record<string, NoteData>
}

export type ReadingProgressData = components['schemas']['ReadingProgress']
export type StreakData = components['schemas']['Streak']
