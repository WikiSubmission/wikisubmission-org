import { MusicProvider } from '@/lib/music-context'
import { DBTrackRow, DBArtist, DBCategory } from '@/types/music'
import { ws } from '@/lib/wikisubmission-sdk'

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
    const [tracksRes, catsRes, artistsRes] = await Promise.all([
      ws.supabase
        .from('ws_music_tracks')
        .select(
          '*, artistObj:ws_music_artists(*), categoryObj:ws_music_categories(*)'
        )
        .order('release_date', { ascending: false }),
      ws.supabase
        .from('ws_music_categories')
        .select('*')
        .order('display_priority', { ascending: false }),
      ws.supabase
        .from('ws_music_artists')
        .select('*')
        .order('display_priority', { ascending: false }),
    ])

    if (tracksRes.data) tracks = tracksRes.data
    if (catsRes.data) categories = catsRes.data
    if (artistsRes.data) artists = artistsRes.data
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
