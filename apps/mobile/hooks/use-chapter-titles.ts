'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale } from 'next-intl'
import {
  fetchChapterTitles,
  hasTranslatedTitles,
  mergeWithBundled,
  readCachedChapterTitles,
  writeCachedChapterTitles,
  type ChapterTitles,
} from '@/lib/chapter-titles'
import { isLocale, type Locale } from '@/constants/locales'

/**
 * Chapter titles in the active UI language, always non-empty.
 *
 * First render is the bundled English table; the cached translation is read in
 * an effect and applied, then a background fetch refreshes the cache. The cache
 * read is deliberately NOT a useState initializer: the static export prerenders
 * at build time and React may replay initializers during hydration, so reading
 * localStorage there would risk a hydration mismatch (error #418).
 */
export function useChapterTitles(): ChapterTitles {
  const rawLocale = useLocale()
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'en'
  /** Fetched/cached titles keyed by locale, so switching back is instant and a
   *  late response for the previous locale cannot overwrite the current one. */
  const [fetched, setFetched] = useState<Partial<Record<Locale, ChapterTitles>>>({})

  useEffect(() => {
    // English, and the locales the backend has no titles for, never fetch.
    if (!hasTranslatedTitles(locale)) return

    const controller = new AbortController()
    let cancelled = false

    void (async () => {
      // The cached titles are read here rather than during render (a static
      // export prerenders and may replay render, and localStorage does not
      // exist then) and after an awaited tick rather than in the effect body,
      // so it is not a synchronous setState inside an effect. Still a microtask,
      // so it lands before paint.
      await Promise.resolve()
      if (cancelled) return
      const cached = readCachedChapterTitles(locale)
      if (cached) setFetched((prev) => ({ ...prev, [locale]: cached }))

      try {
        const titles = await fetchChapterTitles(locale, controller.signal)
        if (cancelled) return
        writeCachedChapterTitles(locale, titles)
        setFetched((prev) => ({ ...prev, [locale]: titles }))
      } catch {
        // Offline or a backend gap: whatever is already showing stands.
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [locale])

  // Derived, not stored: a locale with no entry falls through to the bundled
  // English table without an extra render.
  return useMemo(() => mergeWithBundled(fetched[locale]), [fetched, locale])
}
