'use client'

import { useMemo } from 'react'
import { useMessages, useTranslations } from 'next-intl'
import { BookOpen, FileText, Hash } from 'lucide-react'
import { createElement } from 'react'
import {
  SITE_ROUTES,
  routeDescription,
  routeHref,
  routeTitle,
  type TranslateFn,
} from '@/lib/site-routes'
import { CHAPTER_TRANSLITERATIONS, VERSE_COUNTS } from '@/constants/quran-chapters'
import { useQuranNavStore } from '@/hooks/use-quran-nav-store'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import type { Command } from './types'

/**
 * The menu's instant, zero-network tier: every page, all 114 chapters, and all
 * appendices, in the active locale.
 *
 * This costs no extra bytes over the wire. The root layout already hands the
 * whole merged message catalog to `NextIntlClientProvider`, so every route title
 * and description is on the client before the menu opens; the chapter
 * transliterations and verse counts are bundled constants the reader already
 * uses. Chapter titles come from the nav store when the Quran layout has seeded
 * it, and fall back to transliterations everywhere else.
 */
export function useLocalIndex(): Command[] {
  // Subscribing to the catalog rather than calling t() per row keeps the memo
  // keyed on something stable: next-intl returns a new `t` identity per render.
  const messages = useMessages()
  const t = useTranslations()
  const { isSignedIn } = useScriptureAuth()
  const chapters = useQuranNavStore((s) => s.chapters)
  const appendices = useQuranNavStore((s) => s.appendices)

  return useMemo(() => {
    const translate: TranslateFn = (key) => {
      try {
        return t(key)
      } catch {
        // A key missing from every catalog would otherwise throw and blank the
        // whole menu. Falling back to the key keeps the row usable.
        return key
      }
    }

    const commands: Command[] = []

    // ── Pages ────────────────────────────────────────────────────────────────
    for (const route of SITE_ROUTES) {
      if (!route.indexable || route.expand) continue
      if (route.requiresAuth && !isSignedIn) continue
      const href = routeHref(route)
      if (href === null) continue

      commands.push({
        id: `page:${route.route}`,
        group: 'pages',
        label: routeTitle(route, translate),
        description: routeDescription(route, translate),
        icon: createElement(FileText),
        navigate: href,
        priority: route.priority,
        keywords: [href.replace(/^\//, '')],
      })
    }

    // ── Chapters ─────────────────────────────────────────────────────────────
    const titleByNumber = new Map<number, string>()
    for (const chapter of chapters) {
      if (chapter.chapter_number && chapter.title) {
        titleByNumber.set(chapter.chapter_number, chapter.title)
      }
    }

    for (let n = 1; n <= 114; n++) {
      const transliteration = CHAPTER_TRANSLITERATIONS[n - 1] ?? ''
      const localized = titleByNumber.get(n)
      const verseCount = VERSE_COUNTS[n - 1]

      commands.push({
        id: `chapter:${n}`,
        group: 'chapters',
        label: localized ? `${n}. ${localized}` : `${n}. ${transliteration}`,
        description: verseCount ? `${verseCount} ${verseCount === 1 ? 'verse' : 'verses'}` : undefined,
        icon: createElement(BookOpen),
        navigate: `/quran/${n}`,
        hint: String(n),
        // Earlier chapters are marginally likelier targets, but the dominant
        // signal must stay the text match, so the spread here is deliberately
        // narrow.
        priority: 50,
        keywords: [String(n), transliteration, localized ?? ''].filter(Boolean),
      })
    }

    // ── Appendices ───────────────────────────────────────────────────────────
    for (const appendix of appendices) {
      if (!appendix.code) continue
      commands.push({
        id: `appendix:${appendix.code}`,
        group: 'appendices',
        label: `${appendix.code}. ${appendix.title ?? ''}`.trim(),
        icon: createElement(Hash),
        navigate: `/appendices/${appendix.code}`,
        hint: String(appendix.code),
        priority: 45,
        keywords: [String(appendix.code), appendix.title ?? ''].filter(Boolean),
      })
    }

    return commands
    // `messages` stands in for the active locale: it changes identity exactly
    // when the catalog swaps, which is when every label needs recomputing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isSignedIn, chapters, appendices])
}
