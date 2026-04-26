import MusicClient from './music-client'
import { ws } from '@/lib/wikisubmission-sdk'
import { buildPageMetadata } from '@/constants/metadata'
import type { Metadata } from 'next'

export default async function MusicPage() {
  return <MusicClient />
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>
}): Promise<Metadata> {
  const { track: trackId } = await searchParams

  if (trackId) {
    try {
      const { data: track } = await ws.supabase
        .from('ws_music_tracks')
        .select('*, artistObj:ws_music_artists(*)')
        .eq('id', trackId)
        .single()

      if (track && track.artistObj) {
        const title = `${track.name} by ${track.artistObj.name} | Zikr | WikiSubmission`
        const description = `Listen to ${track.name} by ${track.artistObj.name} on WikiSubmission. Glorification and commemoration of God through beautiful recitations and melodies.`
        return {
          ...buildPageMetadata({
            title,
            description,
            url: `https://wikisubmission.org/music?track=${trackId}`,
          }),
          itunes: {
            appId: '6444260632',
            appArgument: `wikisubmission://music/track/${trackId}`,
          },
          openGraph: {
            ...buildPageMetadata({ title, description }).openGraph,
            type: 'music.song',
          },
        }
      }
    } catch (error) {
      console.error('Error fetching track for metadata:', error)
    }
  }

  return buildPageMetadata({
    title: 'Zikr | WikiSubmission',
    description: 'Glorification and commemoration of God through beautiful recitations and melodies.',
    url: 'https://wikisubmission.org/music',
  })
}
