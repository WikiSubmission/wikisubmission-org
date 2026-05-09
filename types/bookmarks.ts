export interface BookmarkData {
  id: number
  scripture: string
  verseKey: string
  name: string
  color: string
  kind: 'normal' | 'cover_to_cover'
  createdAt: string
  updatedAt: string
}

export interface ScriptureState {
  bookmarks: Record<string, BookmarkData>
}
