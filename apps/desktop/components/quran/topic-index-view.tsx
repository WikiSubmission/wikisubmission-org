'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { ActivityRecorder } from '@web/components/activity-recorder'
import { TopicLetterRail } from '@/components/quran-index/topic-letter-rail'
import { TopicIndexBrowser } from '@/components/quran-index/topic-index-browser'
import { TopicIndexList } from '@/components/quran-index/topic-index-list'
import { wsApi } from '@/src/api/client'
import type { TopicEntry } from '@/lib/topic-index'

const DEFAULT_LETTER = 'A'
const FOREVER = { staleTime: Infinity, gcTime: Infinity } as const

function normalizeLetter(raw: string | null): string {
  if (!raw) return DEFAULT_LETTER
  const letter = raw.trim().toUpperCase()
  return /^[A-Z]$/.test(letter) ? letter : DEFAULT_LETTER
}

/**
 * The Quran's printed topical index. Client counterpart of
 * apps/web/app/quran/index/page.tsx: same sections and URL contract
 * (`?letter=` browses one letter, `?q=` searches every letter), with the
 * requests made from the browser instead of the server.
 */
export function TopicIndexView() {
  const params = useSearchParams()
  const t = useTranslations('quranIndex')
  const tQuran = useTranslations('quran')

  const query = params.get('q')?.trim() ?? ''
  const isSearch = query.length >= 2
  const letter = normalizeLetter(params.get('letter'))

  const letters = useQuery({
    queryKey: ['desktop', 'topic-index-letters'],
    queryFn: async () =>
      (await wsApi.GET('/topic-index/letters', { params: { query: { lang: 'en' } } })).data ?? [],
    ...FOREVER,
  })

  const body = useQuery({
    queryKey: ['desktop', 'topic-index', isSearch ? `q:${query}` : `letter:${letter}`],
    queryFn: async (): Promise<{ entries: TopicEntry[]; total: number }> => {
      if (isSearch) {
        const { data, error } = await wsApi.GET('/topic-index/search', {
          params: { query: { q: query, lang: 'en', limit: 100 } },
        })
        if (error || !data) throw new Error('topic index search failed')
        return { entries: data.results, total: data.total }
      }
      const { data, error } = await wsApi.GET('/topic-index', {
        params: { query: { letter, lang: 'en', limit: 500 } },
      })
      if (error || !data) throw new Error('topic index fetch failed')
      return { entries: data.items, total: data.total }
    },
    ...FOREVER,
  })

  const entries = body.data?.entries ?? []
  const total = body.data?.total ?? 0

  return (
    <div className="py-10 px-4">
      <ActivityRecorder kind="search" scripture="quran" query={isSearch ? query : `index:${letter}`} />

      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
              {tQuran('title')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </header>

        {(letters.data?.length ?? 0) > 0 && (
          <TopicLetterRail letters={letters.data ?? []} active={isSearch ? '' : letter} />
        )}

        {body.isError ? (
          <p className="text-sm text-muted-foreground py-12 text-center">{t('unavailable')}</p>
        ) : body.isPending ? null : isSearch ? (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold">{t('resultsFor', { query })}</h2>
              <Link
                href={`/quran/index/?letter=${DEFAULT_LETTER}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3" aria-hidden />
                {t('backToIndex')}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">{t('resultCount', { count: total })}</p>
            <TopicIndexList entries={entries} emptyMessage={t('noResults')} />
          </section>
        ) : (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">{letter}</h2>
              <p className="text-xs text-muted-foreground">{t('entryCount', { count: total })}</p>
            </div>
            <TopicIndexBrowser
              entries={entries}
              letter={letter}
              labels={{
                filterPlaceholder: t('filterPlaceholder', { letter }),
                searchWholeIndex: t('searchWholeIndex'),
                noneInLetter: t('noneInLetter'),
                clear: t('clear'),
              }}
            />
          </section>
        )}

        <footer className="text-center">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">{t('attribution')}</p>
        </footer>
      </div>
    </div>
  )
}
