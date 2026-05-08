import type { Client } from 'openapi-fetch'
import type { components, paths } from '@/src/api/types.gen'
import type { DBArtist, DBCategory, DBTrackRow } from '@/types/music'

type ApiArtist = components['schemas']['MusicArtist']
type ApiCategory = components['schemas']['MusicCategory']
type ApiTrack = components['schemas']['MusicTrack']

type ApiClient = Client<paths>

const fallbackCategory: DBCategory = {
  id: 'other',
  name: 'Other',
  description: null,
  display_priority: -1,
}

export interface MusicData {
  tracks: DBTrackRow[]
  categories: DBCategory[]
  artists: DBArtist[]
}

function toArtist(a: ApiArtist): DBArtist {
  return {
    id: String(a.id),
    name: a.name,
    description: a.description ?? null,
    image_url: a.image_url,
    display_priority: a.display_priority,
  }
}

function toCategory(c: ApiCategory): DBCategory {
  return {
    id: String(c.id),
    name: c.name,
    description: c.description ?? null,
    display_priority: c.display_priority,
  }
}

function toTrack(
  t: ApiTrack,
  artistsById: Map<string, DBArtist>,
  categoriesById: Map<string, DBCategory>
): DBTrackRow {
  const artistId = String(t.artist_id)
  const categoryId = t.category_id != null ? String(t.category_id) : undefined
  return {
    id: String(t.id),
    name: t.name,
    url: t.url,
    release_date: t.release_date,
    featured: t.featured,
    artistObj: artistsById.get(artistId),
    categoryObj: categoryId
      ? (categoriesById.get(categoryId) ?? fallbackCategory)
      : fallbackCategory,
  }
}

export async function fetchMusicData(client: ApiClient): Promise<MusicData> {
  const [artistsRes, categoriesRes, tracksRes] = await Promise.all([
    client.GET('/music/artists'),
    client.GET('/music/categories'),
    client.GET('/music/tracks'),
  ])

  // Preserve the existing display order: highest display_priority first.
  // Backend returns ascending; the legacy Supabase query used descending.
  const artists = (artistsRes.data ?? [])
    .map(toArtist)
    .sort((a, b) => (b.display_priority ?? 0) - (a.display_priority ?? 0))

  const categories = (categoriesRes.data ?? [])
    .map(toCategory)
    .sort((a, b) => (b.display_priority ?? 0) - (a.display_priority ?? 0))

  const artistsById = new Map(artists.map((a) => [a.id, a]))
  const categoriesById = new Map(categories.map((c) => [c.id, c]))

  const tracks = (tracksRes.data ?? []).map((t) =>
    toTrack(t, artistsById, categoriesById)
  )
  const hasFallbackCategory = tracks.some(
    (track) => track.categoryObj?.id === fallbackCategory.id
  )

  return {
    tracks,
    categories: hasFallbackCategory ? [...categories, fallbackCategory] : categories,
    artists,
  }
}
