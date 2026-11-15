'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import SearchResult from '@/components/quran-reader/result-search'
import { VerseListResult } from '@/components/quran-reader/verse-list-result'
import { VerseListSkeleton } from '@/components/quran-reader/verse-list-skeleton'
import { ActivityRecorder } from '@web/components/activity-recorder'
import { parseQuranRef, normalizeQuranInput } from '@/lib/scripture-parser'
import { wsApi } from '@/src/api/client'

/**
 * Query intent, as in apps/web/app/quran/[[...query]]/page.tsx: a chapter
 * number, a verse reference, range or comma list, or free text.
 */
export function parseQueryType(q: string): {
  type: 'chapter' | 'verse-list' | 'search'
  chapterNumber?: number
} {
  if (q.includes(',')) {
    const parts = q.split(',').map((s) => normalizeQuranInput(s.trim()))
    if (parts.length > 0 && parts.every((p) => parseQuranRef(p) !== null)) {
      return { type: 'verse-list' }
    }
  }
  if (/^\d{1,3}$/.test(q)) {
    const n = parseInt(q, 10)
    if (n >= 1 && n <= 114) return { type: 'chapter', chapterNumber: n }
  }
  if (parseQuranRef(q) !== null) return { type: 'verse-list' }
  return { type: 'search' }
}

/** The /quran/search/?q= page: verse lists and text search. */
export function QuranQueryView() {
  const router = useRouter()
  const q = (useSearchParams().get('q') ?? '').trim()
  const parsed = q ? parseQueryType(q) : null

  // A bare chapter number belongs on the chapter's own page, and an empty
  // query on the hub.
  useEffect(() => {
    if (!q) router.replace('/quran/')
    else if (parsed?.type === 'chapter') router.replace(`/quran/${parsed.chapterNumber}/`)
  }, [q, parsed?.type, parsed?.chapterNumber, router])

  if (!q || !parsed || parsed.type === 'chapter') return <Spinner />

  if (parsed.type === 'verse-list') {
    return (
      <main className="py-8 px-4">
        <ActivityRecorder
          kind={q.includes('-') || q.includes(',') ? 'browse_verse_range' : 'browse_verse'}
          scripture="quran"
          query={q}
        />
        <VerseList queryText={q} />
      </main>
    )
  }

  return (
    <main className="pt-6 sm:pt-8 px-4">
      <ActivityRecorder kind="search" scripture="quran" query={q} />
      <section>
        <SearchResult key={q} props={{ query: q }} />
      </section>
    </main>
  )
}

/** Client version of the web VerseListFetcher (same request). */
function VerseList({ queryText }: { queryText: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['desktop', 'verse-list', queryText],
    queryFn: async () => {
      const result = await wsApi.GET('/quran', {
        params: {
          query: {
            langs: ['en', 'ar'],
            verses: queryText,
            include_words: true,
            include_root: true,
            include_meaning: true,
            word_langs: ['ar', 'en', 'tl'],
          },
        },
      })
      if (result.error) throw new Error('verse list request failed')
      return result.data
    },
  })

  if (isPending) return <VerseListSkeleton queryText={queryText} zoom="comfortable" />
  return <VerseListResult queryText={queryText} data={data} apiError={isError} />
}
