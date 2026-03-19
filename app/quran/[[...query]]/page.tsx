export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import SearchResult from './client-components/result-search'
import { ChapterReader } from './client-components/chapter-reader'
import HomeScreenRandomVerse from './mini-components/home-random-verse'
import HomeScreenMetrics from './mini-components/home-metrics'
import QuranUtilitiesRow from './mini-components/home-utilities'
import HomeScreenSuggestions from './mini-components/home-suggestions'
import Image from 'next/image'
import { wsApiServer } from '@/src/api/server-client'
import { Metadata } from 'next'

// Detect if a query string is a chapter number (1–114)
function parseQueryType(q: string): {
  type: 'chapter' | 'verse' | 'range' | 'search'
  chapterNumber?: number
  verseStart?: number
  verseEnd?: number
} {
  // Pure chapter number: "1", "2", "114"
  if (/^\d{1,3}$/.test(q)) {
    const n = parseInt(q)
    if (n >= 1 && n <= 114) return { type: 'chapter', chapterNumber: n }
  }

  // Verse ref: "2:255"
  const verseMatch = q.match(/^(\d+):(\d+)$/)
  if (verseMatch) {
    return { type: 'verse' }
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
  searchParams: Promise<{ q?: string; verse?: string }>
}) {
  const { q, verse } = await searchParams
  const { query } = await params

  const queryText = q || query?.join(' ')

  if (!queryText) {
    return (
      <main className="whitespace-pre-line">
        <section>
          <div className="space-y-2">
            <QuranUtilitiesRow />
            <HomeScreenMetrics />
            <Image
              src="/brand-assets/logo-transparent.png"
              alt="WikiSubmission Logo"
              width={64}
              height={64}
              className="mx-auto"
            />
            <hr className="my-6 w-xs mx-auto" />
            <HomeScreenSuggestions />
            <hr className="my-6 w-xs mx-auto" />
            <HomeScreenRandomVerse />
            <hr className="my-6 w-xs mx-auto" />
          </div>
        </section>
      </main>
    )
  }

  const parsed = parseQueryType(queryText)

  // ── Chapter view: SSR first N verses via internal Railway network ───────────
  // If ?verse=N is set, SSR up to that verse so it's immediately in the DOM.
  if (parsed.type === 'chapter' && parsed.chapterNumber) {
    const targetVerse = verse ? parseInt(verse) : undefined
    const ssrVerseEnd = targetVerse ? Math.max(50, targetVerse + 5) : 50

    const { data } = await wsApiServer.GET('/quran', {
      params: {
        query: {
          chapter_number_start: parsed.chapterNumber,
          langs: ['en', 'ar'],
          verse_start: 0,
          verse_end: ssrVerseEnd,
          include_words: true,
          include_root: true,
          include_meaning: true,
        },
      },
    })

    return (
      <main className="whitespace-pre-line">
        <Suspense fallback={<Spinner />}>
          <ChapterReader
            chapterNumber={parsed.chapterNumber}
            initialData={data ?? null}
            initialVerse={verse}
          />
        </Suspense>
      </main>
    )
  }

  // ── Range view: SSR specific verse range ─────────────────────────────────────
  if (parsed.type === 'range' && parsed.chapterNumber) {
    const { data } = await wsApiServer.GET('/quran', {
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

    return (
      <main className="whitespace-pre-line">
        <Suspense fallback={<Spinner />}>
          <ChapterReader
            chapterNumber={parsed.chapterNumber}
            initialData={data ?? null}
            initialVerse={verse}
          />
        </Suspense>
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
  } else if (parsed.type === 'verse' || parsed.type === 'range') {
    title = `${queryText} | Quran | WikiSubmission`
    description = `Verse ${queryText} of the Final Testament`
  } else {
    title = `Search: ${queryText} | Quran | WikiSubmission`
    description = `Search results for "${queryText}" in the Final Testament`
  }

  return { title, description, openGraph: { title, description, ...openGraph } }
}
