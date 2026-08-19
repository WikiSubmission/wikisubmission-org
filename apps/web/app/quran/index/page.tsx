import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { wsApiServer } from '@/src/api/server-client'
import { buildPageMetadata } from '@/constants/metadata'
import { ActivityRecorder } from '@/components/activity-recorder'
import { TopicLetterRail } from '@/components/quran-index/topic-letter-rail'
import { TopicIndexBrowser } from '@/components/quran-index/topic-index-browser'
import { TopicIndexList } from '@/components/quran-index/topic-index-list'
import type { TopicEntry, TopicIndexLetter } from '@/lib/topic-index'

export const dynamic = 'force-dynamic'

const DEFAULT_LETTER = 'A'

/**
 * The Quran's printed topical index: the alphabetical subject index bound into
 * the back of The Final Testament, at /quran/index.
 *
 * Two modes on one route. `?letter=` browses one printed section, which arrives
 * whole so the client can filter it without another request. `?q=` searches every
 * letter through the backend instead — a different question, and the copy says so.
 */

function normalizeLetter(raw: string | undefined): string {
  if (!raw) return DEFAULT_LETTER
  const letter = raw.trim().toUpperCase()
  return /^[A-Z]$/.test(letter) ? letter : DEFAULT_LETTER
}

async function fetchLetters(): Promise<TopicIndexLetter[]> {
  try {
    const { data } = await wsApiServer.GET('/topic-index/letters', {
      params: { query: { lang: 'en' } },
    })
    return data ?? []
  } catch {
    // The rail is chrome. Losing it should cost the reader their A-Z shortcuts,
    // never the page — the same rule fetchQuranMetadata applies to titles.
    return []
  }
}

export default async function QuranIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; q?: string }>
}) {
  const { letter: letterParam, q } = await searchParams
  const [t, tQuran] = await Promise.all([
    getTranslations('quranIndex'),
    getTranslations('quran'),
  ])

  const query = q?.trim() ?? ''
  const isSearch = query.length >= 2
  const letter = normalizeLetter(letterParam)

  const letters = await fetchLetters()

  let entries: TopicEntry[] = []
  let total = 0
  let failed = false

  try {
    if (isSearch) {
      const { data, error } = await wsApiServer.GET('/topic-index/search', {
        params: { query: { q: query, lang: 'en', limit: 100 } },
      })
      if (error || !data) throw new Error('topic index search failed')
      entries = data.results
      total = data.total
    } else {
      const { data, error } = await wsApiServer.GET('/topic-index', {
        params: { query: { letter, lang: 'en', limit: 500 } },
      })
      if (error || !data) throw new Error('topic index fetch failed')
      entries = data.items
      total = data.total
    }
  } catch {
    failed = true
  }

  return (
    <div className="py-10 px-4">
      <ActivityRecorder
        kind="search"
        scripture="quran"
        query={isSearch ? query : `index:${letter}`}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
              {tQuran('title')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </header>

        {/* ── Letter rail ────────────────────────────────────────────────── */}
        {letters.length > 0 && (
          <TopicLetterRail letters={letters} active={isSearch ? '' : letter} />
        )}

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {failed ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            {t('unavailable')}
          </p>
        ) : isSearch ? (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold">
                {t('resultsFor', { query })}
              </h2>
              <Link
                href={`/quran/index?letter=${DEFAULT_LETTER}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3" aria-hidden />
                {t('backToIndex')}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('resultCount', { count: total })}
            </p>
            <TopicIndexList entries={entries} emptyMessage={t('noResults')} />
          </section>
        ) : (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">{letter}</h2>
              <p className="text-xs text-muted-foreground">
                {t('entryCount', { count: total })}
              </p>
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

        {/* ── Attribution ────────────────────────────────────────────────── */}
        <footer className="text-center">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {t('attribution')}
          </p>
        </footer>
      </div>
    </div>
  )
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string; q?: string }>
}): Promise<Metadata> {
  const { letter: letterParam, q } = await searchParams
  const query = q?.trim() ?? ''

  if (query.length >= 2) {
    return buildPageMetadata({
      title: `"${query}" | Quran Index | WikiSubmission`,
      description: `Topics matching "${query}" in the index to the Final Testament (Quran)`,
      url: `/quran/index?q=${encodeURIComponent(query)}`,
    })
  }

  const letter = normalizeLetter(letterParam)
  return buildPageMetadata({
    title: `${letter} | Quran Index | WikiSubmission`,
    description: `Quranic topics beginning with ${letter} — the alphabetical subject index to the Final Testament, with the verses on each topic`,
    url: `/quran/index?letter=${letter}`,
  })
}
