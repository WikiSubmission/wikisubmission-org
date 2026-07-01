'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { wsApi } from '@/src/api/client'
import { randomQuranRef } from '@/constants/quran-chapters'
import type { components } from '@/src/api/types.gen'
import { useTranslations } from 'next-intl'

type VerseData = components['schemas']['VerseData']

export default function HomeScreenRandomVerse() {
  const t = useTranslations('common')
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [ref] = useState<{ chapter: number; verse: number }>(() =>
    randomQuranRef()
  )

  useEffect(() => {
    const r = ref
    wsApi
      .GET('/quran', {
        params: {
          query: {
            chapter_number_start: r.chapter,
            verse_start: r.verse,
            verse_end: r.verse,
            langs: ['en', 'ar'],
          },
        },
      })
      .then(({ data }) => {
        const v = data?.chapters?.[0]?.verses?.[0]
        if (v) setVerse(v)
      })
  }, [ref])

  if (!verse) {
    return (
      <main className="max-w-lg mx-auto">
        <div className="bg-muted/50 p-4 rounded-2xl flex justify-center py-8">
          <Spinner />
        </div>
      </main>
    )
  }

  const enText = verse.tr?.['en']?.tx
  const arText = verse.tr?.['ar']?.tx

  return (
    <main className="max-w-lg mx-auto">
      <a
        href={`/quran/${ref.chapter}?verse=${ref.verse}`}
        className="hover:cursor-pointer"
      >
        <div className="bg-muted/50 p-4 rounded-2xl space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground tracking-wider">
                {t('randomVerse').toUpperCase()}
              </p>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
            {enText && (
              <p>
                <strong>[{verse.vk}]</strong> {enText}
              </p>
            )}
          </div>
          {arText && (
            <p className="text-xl leading-relaxed text-right font-arabic">
              {arText}
            </p>
          )}
        </div>
      </a>
    </main>
  )
}
