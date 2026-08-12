import PracticesClient from './practices-client'
import { wsApiServer } from '@/src/api/server-client'
import type { components } from '@/src/api/types.gen'
import { buildPageMetadata } from '@/constants/metadata'
import { getTranslations, getLocale } from 'next-intl/server'
import { contentLangForUiLocale } from '@/constants/ui-locales'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('practices')
  return buildPageMetadata({
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    url: '/practices',
  })
}

type VerseData = components['schemas']['VerseData']

export default async function Page() {
  const locale = await getLocale()
  let prayerVerse: VerseData | null = null

  try {
    // `langs` is validated against the backend's languages table, and one
    // unrecognised code 400s the whole request — including the `en` alongside it.
    // The UI locale has to be mapped before it goes in.
    const res = await wsApiServer.GET('/quran', {
      params: {
        query: {
          chapter_number_start: 4,
          verse_start: 103,
          verse_end: 103,
          langs: Array.from(new Set(['en', contentLangForUiLocale(locale)])),
        },
      },
    })
    prayerVerse = res.data?.chapters?.[0]?.verses?.[0] ?? null
  } catch {
    // non-critical
  }

  return <PracticesClient prayerVerse={prayerVerse} />
}
