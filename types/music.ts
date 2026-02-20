export interface DBArtist {
  id: string
  name: string
  description: string | null
  image_url: string | null
  display_priority: number | null
}

export interface DBCategory {
  id: string
  name: string
  description: string | null
  display_priority: number
}

export interface DBTrackRow {
  id: string
  name: string
  url: string
  release_date: string | null
  artist: string
  category: string
  featured: boolean | null
  // Joined objects
  artistObj?: DBArtist
  categoryObj?: DBCategory
}

export interface UnifiedTrack {
  id: string
  title: string
  url: string
  artist: DBArtist
  category: DBCategory
  releaseDate: Date
  featured: boolean
}

export type LoopMode = 'off' | 'context' | 'repeatOne'
export type PlaybackContextType = 'allTracks' | 'category' | 'favorites'
