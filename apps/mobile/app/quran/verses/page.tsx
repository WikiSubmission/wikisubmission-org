'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { wsApi } from '@/src/api/client'
import { offlineQuranVerseList } from '@/lib/offline/quran-adapter'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { VerseListResult } from '@/components/quran-reader/verse-list-result'
import { VerseListSkeleton } from '@/components/quran-reader/verse-list-skeleton'
import type { components } from '@/src/api/types.gen'

type QuranResponse = components['schemas']['QuranResponse']

type FetchResult = {
  /** query + languages the payload belongs to; a mismatch means it is stale. */
  key: string
  data: QuranResponse | undefined
  apiError: boolean
}

// Verse-reference results ("2:255", "1:1-7", "1:4,2:45"). On web the same view
// is server-rendered by the /quran catch-all route; the static export has no
// server, so the reference travels in `?q=` and is fetched on the client.
function VersesScreen() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const prefs = useQuranPreferences()

  // Joined rather than kept as an array so it can be an effect dependency
  // without re-firing the fetch on every render.
  const langsKey = [
    prefs.primaryLanguage,
    prefs.arabic ? 'ar' : '',
    prefs.secondaryLanguage ?? '',
  ]
    .filter((l) => l && l !== 'xl' && l !== 'none')
    .join(',')
  const fetchKey = `${query}|${langsKey}`

  const wordByWord = prefs.wordByWord

  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    if (!query) return

    let cancelled = false
    const requested = `${query}|${langsKey}`
    const langs = langsKey.split(',').filter(Boolean)
    const requestLangs = langs.length > 0 ? langs : ['en']

    // English is the only word-by-word translation that exists today, the same
    // assumption the chapter reader makes.
    const wordsOpts = wordByWord
      ? { lang: 'en', includeRoot: true, includeMeaning: true }
      : undefined

    const fromBundles = async (): Promise<QuranResponse | null> => {
      const store = getRegisteredOfflineContentStore()
      if (!store) return null
      try {
        return await offlineQuranVerseList(store, requestLangs, query, wordsOpts)
      } catch (e) {
        console.error('[offline-read] verse list', e)
        return null
      }
    }

    const fromNetwork = async (): Promise<QuranResponse | null> => {
      try {
        const res = await wsApi.GET('/quran', {
          params: {
            query: {
              langs: requestLangs,
              verses: query,
              include_words: true,
              include_root: true,
              include_meaning: true,
              word_langs: ['ar', 'en', 'tl'],
            },
          },
        })
        return res.error ? null : (res.data ?? null)
      } catch {
        return null
      }
    }

    void (async () => {
      // Offline-first, except in word-by-word mode: the words bundle may not be
      // installed, and the network always carries the breakdown.
      const first = wordByWord ? fromNetwork : fromBundles
      const second = wordByWord ? fromBundles : fromNetwork
      const data = (await first()) ?? (await second())
      if (cancelled) return
      setResult({ key: requested, data: data ?? undefined, apiError: data === null })
    })()

    return () => {
      cancelled = true
    }
  }, [query, langsKey, wordByWord])

  const loading = query !== '' && result?.key !== fetchKey

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      {loading ? (
        <VerseListSkeleton queryText={query} zoom={prefs.zoomLevel ?? 'comfortable'} />
      ) : (
        <VerseListResult
          queryText={query}
          data={result?.data}
          apiError={result?.apiError ?? true}
        />
      )}
    </div>
  )
}

export default function QuranVersesPage() {
  return (
    <Suspense fallback={null}>
      <VersesScreen />
    </Suspense>
  )
}
