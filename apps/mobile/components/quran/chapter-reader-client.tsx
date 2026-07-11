'use client'

import { useState } from 'react'
import { ChapterReader } from '@/components/quran-reader/chapter-reader'

/**
 * Client entry for the mobile chapter reader.
 *
 * The mobile app is a static export, so the `[chapter]` page's Server Component
 * never sees the `?verse=N` query string (there is no server at request time).
 * On web that param is parsed server-side and handed to ChapterReader as
 * `initialVerse`; here we read it on the client instead, once at mount.
 *
 * We deliberately read `window.location.search` in a useState initializer
 * rather than `useSearchParams()`: useSearchParams() subscribes to the router
 * and would re-render the reader (+ every VerseCard) on each history sync — the
 * exact re-render storm ChapterReader avoids by reading `initialVerse` from a
 * prop. Reading once at mount keeps that stable.
 */
export function ChapterReaderClient({ chapterNumber }: { chapterNumber: number }) {
  const [initialVerse] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return new URLSearchParams(window.location.search).get('verse') ?? undefined
  })

  return (
    <ChapterReader
      chapterNumber={chapterNumber}
      initialData={null}
      initialVerse={initialVerse}
    />
  )
}
