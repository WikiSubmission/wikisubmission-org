import { MusicProvider } from '@/lib/music-context'
import { fetchMusicData } from '@/lib/music-data'
import { wsApiServer } from '@/src/api/server-client'
import { DBTrackRow, DBArtist, DBCategory } from '@/types/music'

export const dynamic = 'force-dynamic'

export default async function MusicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let tracks: DBTrackRow[] = []
  let categories: DBCategory[] = []
  let artists: DBArtist[] = []

  try {
    const data = await fetchMusicData(wsApiServer)
    tracks = data.tracks
    categories = data.categories
    artists = data.artists
  } catch (e) {
    console.error('Failed to fetch music data server-side:', e)
  }

  return (
    <MusicProvider
      initialTracks={tracks}
      initialCategories={categories}
      initialArtists={artists}
    >
      {children}
    </MusicProvider>
  )
}
