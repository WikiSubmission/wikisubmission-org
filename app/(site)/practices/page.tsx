import PracticesClient from './practices-client'
import { wsApiServer } from '@/src/api/server-client'
import type { components } from '@/src/api/types.gen'
import { buildPageMetadata } from '@/constants/metadata'

export const metadata = buildPageMetadata({
  title: 'Practices | WikiSubmission',
  description: 'Prayer times, Ramadan schedule, and Zakat calculator for any location.',
  url: '/practices',
})

type VerseData = components['schemas']['VerseData']

export default async function Page() {
  let zakatVerse: VerseData | null = null
  let prayerVerse: VerseData | null = null

  try {
    const res = await wsApiServer.GET('/quran', {
      params: {
        query: {
          chapter_number_start: 2,
          verse_start: 215,
          verse_end: 215,
          langs: ['en'],
        },
      },
    })
    zakatVerse = res.data?.chapters?.[0]?.verses?.[0] ?? null
  } catch {
    // non-critical
  }

  try {
    const res = await wsApiServer.GET('/quran', {
      params: {
        query: {
          chapter_number_start: 4,
          verse_start: 103,
          verse_end: 103,
          langs: ['en'],
        },
      },
    })
    prayerVerse = res.data?.chapters?.[0]?.verses?.[0] ?? null
  } catch {
    // non-critical
  }

  return <PracticesClient zakatVerse={zakatVerse} prayerVerse={prayerVerse} />
}
