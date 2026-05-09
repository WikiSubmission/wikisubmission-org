export interface BookmarkData {
  id: number
  scripture: string
  verse_key: string
  name: string
  color: string
  kind: 'normal' | 'cover_to_cover'
  created_at: string
  updated_at: string
}

export interface NoteData {
  id: number
  scripture: string
  verse_key: string
  lang: string
  content: string
  created_at: string
  updated_at: string
}

export interface ScriptureState {
  bookmarks: Record<string, BookmarkData>
  notes: Record<string, NoteData[]>
}

export interface ReadingProgressData {
  scripture: string
  verse_key: string
  updated_at: string
}

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_active_day?: string
  total_verses_read: number
}
