'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
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
 *
 * Chapter-to-chapter navigation (prev/next buttons) is handled entirely as
 * client state here, never through Next's router. Next's client-side
 * transition between two generateStaticParams pages needs the server to
 * content-negotiate an RSC payload vs. the full HTML document via request
 * headers on the same URL — a static file host (what Capacitor serves `out/`
 * from) can't do that, so the soft navigation silently no-ops. A hard `<a>`
 * reload "works" but replays the entire app boot sequence (startup splash,
 * prayer-reminder flow) outside its normal entry point, which is worse. So
 * `chapterNumber` is owned as local state, seeded from the route param and
 * swapped in place on nav-button taps; `history.pushState`/`popstate` keep
 * the URL and Android back button honest without asking Next to do anything.
 */

function readVerseParam(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return new URLSearchParams(window.location.search).get('verse') ?? undefined
}

function readChapterFromPath(): number | null {
  const match = window.location.pathname.match(/\/quran\/(\d+)/)
  return match ? Number(match[1]) : null
}

export function ChapterReaderClient({
  chapterNumber: routeChapterNumber,
}: {
  chapterNumber: number
}) {
  const [chapterNumber, setChapterNumber] = useState(routeChapterNumber)
  const [initialVerse, setInitialVerse] = useState<string | undefined>(readVerseParam)

  // On client-side navigations the useState initializer above runs while
  // window.location still points at the *previous* route — the App Router only
  // calls history.pushState in an insertion effect during commit. Re-read the
  // query after commit (layout effects run after insertion effects): on cold
  // loads the value is unchanged and this is a no-op; on client navigations it
  // picks up the ?verse=N the initializer missed (or drops one inherited from
  // the previous route's URL). The `key` below remounts ChapterReader, which
  // reads initialVerse once, so the corrected target seeds a fresh instance —
  // all before first paint, so there is no visible flash.
  useLayoutEffect(() => {
    const verse = readVerseParam()
    setInitialVerse((prev) => (prev === verse ? prev : verse))
  }, [])

  const navigateToChapter = useCallback((target: number) => {
    if (!Number.isInteger(target) || target < 1 || target > 114) return
    window.history.pushState(null, '', `/quran/${target}/`)
    setChapterNumber(target)
    setInitialVerse(undefined)
  }, [])

  // Android hardware/gesture back after one or more in-place chapter swaps —
  // sync local state back from whatever URL browser history lands on.
  useEffect(() => {
    const onPopState = () => {
      const chapter = readChapterFromPath()
      if (chapter !== null) setChapterNumber(chapter)
      setInitialVerse(readVerseParam())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

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
      key={`${chapterNumber}-${initialVerse ?? 'top'}`}
      chapterNumber={chapterNumber}
      initialData={null}
      initialVerse={initialVerse}
      onChapterChange={navigateToChapter}
    />
  )
}
