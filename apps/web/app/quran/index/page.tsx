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
import { ArticleAnimations } from '@/components/article-animations'
import type { TopicEntry, TopicIndexLetter } from '@/lib/topic-index'

export const dynamic = 'force-dynamic'

const DEFAULT_LETTER = 'A'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

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
  const t = await getTranslations('quranIndex')

  const query = q?.trim() ?? ''
  const isSearch = query.length >= 2
  const letter = normalizeLetter(letterParam)

  const letters = await fetchLetters()
  const totalIndexTopics = letters.reduce((sum, l) => sum + l.count, 0)

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
    <ArticleAnimations>
      <main className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 md:px-8">
        <ActivityRecorder
          kind="search"
          scripture="quran"
          query={isSearch ? query : `index:${letter}`}
        />

        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
          {/* ── Hero Header ─────────────────────────────────────────────────── */}
          <header className="space-y-4 text-center pb-6 sm:pb-8 border-b border-[var(--ed-rule)]">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[var(--ed-fg)]"
              style={{ fontFamily: F.display }}
            >
              {t('title')}
            </h1>

            <p
              className="text-sm sm:text-base italic text-[var(--ed-fg-muted)] max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: F.serif }}
            >
              {t('description')}
            </p>

            {/* Quick Metrics Bar */}
            {totalIndexTopics > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-1 text-xs text-[var(--ed-fg-muted)]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--ed-surface)] border border-[var(--ed-rule)]/60 font-mono text-[11px]">
                  <strong className="font-bold text-[var(--ed-accent)]">{totalIndexTopics.toLocaleString()}</strong> Topics
                </span>
                <span className="text-[var(--ed-rule)] font-mono">·</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--ed-surface)] border border-[var(--ed-rule)]/60 font-mono text-[11px]">
                  <strong className="font-bold text-[var(--ed-accent)]">114</strong> Chapters
                </span>
                <span className="text-[var(--ed-rule)] font-mono">·</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--ed-surface)] border border-[var(--ed-rule)]/60 font-mono text-[11px]">
                  <strong className="font-bold text-[var(--ed-accent)]">A–Z</strong> Concordance
                </span>
              </div>
            )}
          </header>

          {/* ── Letter rail ────────────────────────────────────────────────── */}
          {letters.length > 0 && (
            <TopicLetterRail letters={letters} active={isSearch ? '' : letter} />
          )}

          {/* ── Body ───────────────────────────────────────────────────────── */}
          {failed ? (
            <div className="rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/40 p-12 text-center shadow-xs">
              <p
                className="text-sm text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                {t('unavailable')}
              </p>
            </div>
          ) : isSearch ? (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--ed-rule)]">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <h2
                      className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--ed-fg)]"
                      style={{ fontFamily: F.display }}
                    >
                      {t('resultsFor', { query })}
                    </h2>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full border border-[var(--ed-accent)]/20 bg-[var(--ed-accent-soft)]/10 text-xs font-semibold text-[var(--ed-accent)]"
                      style={{ fontFamily: F.mono }}
                    >
                      {t('resultCount', { count: total })}
                    </span>
                  </div>
                  <p
                    className="text-xs text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    Found across all alphabetical sections of the index
                  </p>
                </div>

                <Link
                  href={`/quran/index?letter=${DEFAULT_LETTER}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-xs font-semibold text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-accent)] transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
                  style={{ fontFamily: F.glacial }}
                >
                  <ArrowLeft className="size-3.5 text-[var(--ed-accent)]" aria-hidden />
                  <span>{t('backToIndex')}</span>
                </Link>
              </div>

              <TopicIndexList
                entries={entries}
                emptyMessage={t('noResults')}
                showLetterBadges={true}
              />
            </section>
          ) : (
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--ed-rule)]">
                <div className="flex items-baseline gap-3">
                  <h2
                    className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--ed-accent)]"
                    style={{ fontFamily: F.display }}
                  >
                    Section {letter}
                  </h2>
                </div>

                <span
                  className="inline-flex items-center px-3 py-1 rounded-full border border-[var(--ed-accent)]/25 bg-[var(--ed-accent-soft)]/15 text-xs font-semibold text-[var(--ed-accent)]"
                  style={{ fontFamily: F.mono }}
                >
                  {t('entryCount', { count: total })}
                </span>
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
          <footer className="text-center border-t border-[var(--ed-rule)] pt-8 pb-4">
            <p
              className="text-xs text-[var(--ed-fg-muted)]/70 italic leading-relaxed max-w-lg mx-auto"
              style={{ fontFamily: F.serif }}
            >
              {t('attribution')}
            </p>
          </footer>
        </div>
      </main>
    </ArticleAnimations>
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
