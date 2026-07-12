'use client'

import { useLayoutEffect, useState } from 'react'
import { ChapterReader } from '@/components/quran-reader/chapter-reader'
import { takeChapterFlightState } from '@/lib/chapter-flight'
import { Flip } from '@/lib/gsap'

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

  // Index-card → reader title continuity: if the navigation captured a Flip
  // state of the tapped card's title, fly the chapter heading in from it.
  useLayoutEffect(() => {
    const state = takeChapterFlightState()
    if (!state) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const raf = requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('[data-flip-id="chapter-title"]')
      if (!target) return
      Flip.from(state, { targets: target, duration: 0.45, ease: 'power3.out', scale: true })
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <ChapterReader
      chapterNumber={chapterNumber}
      initialData={null}
      initialVerse={initialVerse}
    />
  )
}
