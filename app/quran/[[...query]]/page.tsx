export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import SearchResult from './client-components/result-search'
import { ChapterReader } from './client-components/chapter-reader'
import QuranSearchBar from './client-components/search-bar'
import { wsApiServer } from '@/src/api/server-client'
import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, BookOpen } from 'lucide-react'
import { VerseListResult } from './mini-components/verse-list-result'
import { QuranAccordions } from './mini-components/quran-accordions'

// Detect query intent: chapter, verse, range, verse-list, or text search
function parseQueryType(q: string): {
  type: 'chapter' | 'verse' | 'range' | 'search' | 'verse-list'
  chapterNumber?: number
  verseStart?: number
  verseEnd?: number
} {
  // Comma-separated verse refs: "1:4,1:1-5,2:45,2:12-133"
  if (q.includes(',')) {
    const parts = q.split(',').map((s) => s.trim())
    let valid = true
    for (const part of parts) {
      if (!/^(\d+):(\d+)$/.test(part) && !/^(\d+):(\d+)-(\d+)$/.test(part)) {
        valid = false
        break
      }
    }
    if (valid && parts.length > 0) return { type: 'verse-list' }
  }

  // Pure chapter number: "1", "2", "114"
  if (/^\d{1,3}$/.test(q)) {
    const n = parseInt(q)
    if (n >= 1 && n <= 114) return { type: 'chapter', chapterNumber: n }
  }

  // Verse ref: "2:255" — treat as a one-element verse list
  const verseMatch = q.match(/^(\d+):(\d+)$/)
  if (verseMatch) {
    return { type: 'verse-list' }
  }

  // Same-chapter range: "2:255-257"
  const rangeMatch = q.match(/^(\d+):(\d+)-(\d+)$/)
  if (rangeMatch) {
    return {
      type: 'range',
      chapterNumber: parseInt(rangeMatch[1]),
      verseStart: parseInt(rangeMatch[2]),
      verseEnd: parseInt(rangeMatch[3]),
    }
  }

  return { type: 'search' }
}

export default async function QuranPage({
  params,
  searchParams,
}: {
  params: Promise<{ query?: string[] }>
  searchParams: Promise<{ q?: string; verse?: string; ch?: string; ap?: string }>
}) {
  const { q, verse, ch, ap } = await searchParams
  const { query } = await params

  const rawQuery = q || query?.join(' ')
  const queryText = rawQuery ? decodeURIComponent(rawQuery) : undefined

  if (!queryText) {
    const [chaptersRes, appendicesRes] = await Promise.all([
      wsApiServer.GET('/chapters', {
        params: { query: { lang: 'en' } },
        next: { revalidate: 86400 },
      }),
      wsApiServer.GET('/appendices', {
        params: { query: { lang: 'en' } },
        next: { revalidate: 86400 },
      }),
    ])
    const [tQuran, tNav, tCommon] = await Promise.all([
      getTranslations('quran'),
      getTranslations('nav'),
      getTranslations('common'),
    ])

    const chapters = (chaptersRes.data ?? [])
      .filter(Boolean)
      .sort((a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0))
    const appendices = (appendicesRes.data ?? [])
      .filter(Boolean)
      .sort((a, b) => (a.code ?? 0) - (b.code ?? 0))

    return (
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* ── Hero ──────────────────────────────────────────────────── */}
          <section className="space-y-6 text-center max-w-xl mx-auto">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
                {tQuran('title')}
              </p>
              <h1 className="text-4xl font-bold tracking-tight">
                {tCommon('finalTestament')}
              </h1>
            </div>
            <QuranSearchBar large />
          </section>

          {/* ── Preview cards ─────────────────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/proclamation"
              className="group flex flex-col gap-2 p-5 rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="size-4 text-primary/70" />
                  {tNav('proclamation')}
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tQuran('proclamationDesc')}
              </p>
            </Link>

            <Link
              href="/introduction"
              className="group flex flex-col gap-2 p-5 rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="size-4 text-primary/70" />
                  {tNav('introduction')}
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tQuran('introductionDesc')}
              </p>
            </Link>
          </section>

          <QuranAccordions
            chapters={chapters}
            appendices={appendices}
            chaptersOpen={ch !== '0'}
            appendicesOpen={ap !== '0'}
          />
        </div>
      </main>
    )
  }

  const parsed = parseQueryType(queryText)

  // ── Chapter view: SSR first N verses via internal Railway network ───────────
  // If ?verse=N is set, start the SSR window 5 verses before the target so
  // scrollToIndex only needs to jump ~5 measured items — avoiding the
  // estimation error that occurs when scrolling past dozens of unmeasured items.
  if (parsed.type === 'chapter' && parsed.chapterNumber) {
    const targetVerse = verse ? parseInt(verse) : undefined
    const ssrVerseStart = targetVerse ? Math.max(1, targetVerse - 5) : 1
    const ssrVerseEnd = ssrVerseStart + 49 // always fetch a 50-verse window

    let data = null
    try {
      const result = await wsApiServer.GET('/quran', {
        params: {
          query: {
            chapter_number_start: parsed.chapterNumber,
            langs: ['en', 'ar'],
            verse_start: ssrVerseStart,
            verse_end: ssrVerseEnd,
            include_words: true,
            include_root: true,
            include_meaning: true,
          },
        },
      })
      data = result.data ?? null
    } catch {
      // SSR fetch failed — ChapterReader will load verses client-side
    }

    return (
      <main>
        <Suspense fallback={<Spinner />}>
          <ChapterReader
            key={parsed.chapterNumber}
            chapterNumber={parsed.chapterNumber}
            initialData={data}
            initialVerse={verse}
          />
        </Suspense>
      </main>
    )
  }

  // ── Range view: SSR specific verse range ─────────────────────────────────────
  if (parsed.type === 'range' && parsed.chapterNumber) {
    let data = null
    try {
      const result = await wsApiServer.GET('/quran', {
        params: {
          query: {
            chapter_number_start: parsed.chapterNumber,
            langs: ['en', 'ar'],
            verse_start: parsed.verseStart,
            verse_end: parsed.verseEnd,
            include_words: true,
            include_root: true,
            include_meaning: true,
          },
        },
      })
      data = result.data ?? null
    } catch {
      // SSR fetch failed — ChapterReader will load verses client-side
    }

    return (
      <main>
        <Suspense fallback={<Spinner />}>
          <ChapterReader
            chapterNumber={parsed.chapterNumber}
            initialData={data}
            initialVerse={verse}
            rangeStart={parsed.verseStart}
            rangeEnd={parsed.verseEnd}
          />
        </Suspense>
      </main>
    )
  }

  // ── Verse list: comma-separated refs like "1:4,1:1-5,2:45" ─────────────────
  if (parsed.type === 'verse-list') {
    let data = undefined
    let apiError = false
    try {
      const result = await wsApiServer.GET('/quran', {
        params: {
          query: {
            langs: ['en', 'ar'],
            verses: queryText,
            include_words: true,
            word_langs: ['ar'],
          },
        },
      })
      data = result.data
      apiError = !!result.error
    } catch {
      apiError = true
    }
    return (
      <main className="py-8 px-4">
        <VerseListResult
          queryText={queryText}
          data={data}
          apiError={apiError}
        />
      </main>
    )
  }

  // ── Verse ref & text search: client-side via SearchResult ────────────────────
  return (
    <main className="whitespace-pre-line">
      <section>
        <Suspense fallback={<Spinner />}>
          <SearchResult props={{ query: queryText }} />
        </Suspense>
      </section>
    </main>
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ query?: string[] }>
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const { query } = await params
  const queryText = decodeURIComponent(q || query?.join(' ') || '')

  let title = `Quran | The Final Testament | WikiSubmission`
  let description = `Access the Final Testament at WikiSubmission, a free and open-source platform for Submission.`
  const openGraph = {
    images: [{ url: '/brand-assets/logo-black.png', width: 64, height: 64 }],
  }

  if (!queryText)
    return {
      title,
      description,
      openGraph: { title, description, ...openGraph },
    }

  const parsed = parseQueryType(queryText)

  if (parsed.type === 'chapter') {
    title = `Sura ${parsed.chapterNumber} | Quran | WikiSubmission`
    description = `Read and study Chapter ${parsed.chapterNumber} of the Final Testament`
  } else if (parsed.type === 'verse-list' || parsed.type === 'range') {
    title = `${queryText} | Quran | WikiSubmission`
    description = `Verse ${queryText} of the Final Testament`
  } else {
    title = `Search: ${queryText} | Quran | WikiSubmission`
    description = `Search results for "${queryText}" in the Final Testament`
  }

  return { title, description, openGraph: { title, description, ...openGraph } }
}
