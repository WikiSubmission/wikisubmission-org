'use client'

import { useLayoutEffect, useState } from 'react'
import { ChapterReader } from '@/components/quran-reader/chapter-reader'

/**
 * Client entry for a chapter page.
 *
 * The page is prerendered at build time, so the `?verse=N` deep link can only
 * be read on the client. It is read once at mount rather than with
 * useSearchParams(): the reader keeps `?verse` in sync with
 * history.replaceState on every scroll, and a subscriber would re-render the
 * whole reader on each of those updates. (Same approach as apps/mobile.)
 */
function readVerseParam(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return new URLSearchParams(window.location.search).get('verse') ?? undefined
}

export function ChapterReaderClient({ chapterNumber }: { chapterNumber: number }) {
  const [initialVerse, setInitialVerse] = useState<string | undefined>(readVerseParam)

  // On a client-side navigation the initializer runs before the router has
  // pushed the new URL, so re-read after commit. On a cold load this is a
  // no-op; otherwise the key below remounts the reader on the right verse
  // before first paint.
  useLayoutEffect(() => {
    const verse = readVerseParam()
    // Runs once, at mount, to pick up the URL the router has just committed;
    // a no-op on cold loads. Not derivable during render, because the reader
    // rewrites ?verse while scrolling and must not remount on it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialVerse((prev) => (prev === verse ? prev : verse))
  }, [])

  return (
    <ChapterReader
      key={`${chapterNumber}-${initialVerse ?? 'top'}`}
      chapterNumber={chapterNumber}
      initialData={null}
      initialVerse={initialVerse}
    />
  )
}
