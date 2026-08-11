'use client'

import { useEffect, useRef } from 'react'
import { wsApi } from '@/src/api/client'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { offlineQuranVerses } from '@/lib/offline/quran-adapter'
import { scheduleIdle } from '@/lib/schedule-idle'
import {
  corpusKey,
  createCorpus,
  decideHydration,
  readDeviceHints,
  type CorpusShape,
} from '@/lib/quran-local-corpus'
import { useReaderContext } from '@/hooks/use-reader-context-store'
import { useQuranNavStore } from '@/hooks/use-quran-nav-store'
import type { ChapterReaderOptions } from '@/hooks/use-chapter-reader'

/** Generous, since this is a whole chapter and runs at background priority. */
const HYDRATION_TIMEOUT_MS = 30_000

/** The words bundle language, matching the reader's own constant. */
const WORDS_BUNDLE_LANG = 'en'

function buildLangs(opts: ChapterReaderOptions): string[] {
  const langs: string[] = []
  if (opts.primaryLang !== 'xl' && opts.primaryLang !== 'none') langs.push(opts.primaryLang)
  if (opts.includeArabic && !langs.includes('ar')) langs.push('ar')
  if (opts.secondaryLang && opts.secondaryLang !== 'xl' && opts.secondaryLang !== 'none') {
    if (!langs.includes(opts.secondaryLang)) langs.push(opts.secondaryLang)
  }
  return langs.length > 0 ? langs : ['en']
}

/**
 * Pulls the rest of the open chapter into memory, once, in the background.
 *
 * Why one request rather than chaining the reader's `loadMore`: a full chapter is
 * a single response the endpoint already supports (`verse_end` omitted means "to
 * the end"), where chaining pages costs a round trip each, commits state per
 * page, and rebuilds the audio queue and minimap every time. `reading-view`
 * already chains and visibly blinks the title spinner doing it.
 *
 * This must never touch the reader's `loading` flag. Both the border glow and the
 * title spinner read it, and hydration is meant to be invisible.
 */
export function useChapterHydration(
  chapterNumber: number,
  opts: ChapterReaderOptions,
  enabled: boolean,
) {
  // Keys already attempted, so a remount or a re-render cannot refetch.
  const attemptedRef = useRef(new Set<string>())
  const chapters = useQuranNavStore((s) => s.chapters)

  useEffect(() => {
    if (!enabled) return

    const langs = buildLangs(opts)
    const shape: CorpusShape = { langs, includeWords: opts.includeWords }
    const key = corpusKey(chapterNumber, shape)

    // A preference change produces a new key, so the old corpus is stale.
    const existing = useReaderContext.getState().corpus
    if (existing && existing.key !== key) useReaderContext.getState().setCorpus(null)

    if (attemptedRef.current.has(key)) return

    const expected =
      chapters.find((chapter) => chapter.chapter_number === chapterNumber)?.verse_count ?? 0

    const controller = new AbortController()
    let cancelled = false

    const cancelIdle = scheduleIdle(() => {
      void (async () => {
        const hints = readDeviceHints()
        const store = getRegisteredOfflineContentStore()

        // Bundle coverage decides both the gate and the source.
        let bundlesInstalled = false
        if (store) {
          try {
            const installed = await store.installedBundles()
            const ids = new Set(installed.map((bundle) => bundle.id))
            bundlesInstalled = langs.every((lang) => ids.has(`quran-${lang}`))
          } catch {
            bundlesInstalled = false
          }
        }
        if (cancelled) return

        const decision = decideHydration({
          verseCount: expected,
          includeWords: opts.includeWords,
          saveData: hints.saveData,
          deviceMemoryGb: hints.deviceMemoryGb,
          online: hints.online,
          bundlesInstalled,
        })
        if (decision === 'skip') {
          attemptedRef.current.add(key)
          return
        }

        const withWords = decision === 'full' && opts.includeWords
        // The shape the corpus advertises must match what was actually fetched,
        // or a text-only corpus would be read for word-by-word rendering.
        const actualShape: CorpusShape = { langs, includeWords: withWords }
        const actualKey = corpusKey(chapterNumber, actualShape)
        attemptedRef.current.add(key)
        if (actualKey !== key) attemptedRef.current.add(actualKey)

        // Chapters 1 and 9 have no Basmallah, so their verses start at 1.
        const verseFloor = chapterNumber === 1 || chapterNumber === 9 ? 1 : 0

        // Installed bundles first, as the reader itself does.
        if (bundlesInstalled && store) {
          try {
            const offline = await offlineQuranVerses(
              store,
              langs,
              { chapter: chapterNumber, verseStart: verseFloor },
              withWords
                ? {
                    lang: WORDS_BUNDLE_LANG,
                    includeRoot: opts.includeRoot,
                    includeMeaning: opts.includeMeaning,
                  }
                : undefined,
            )
            if (cancelled) return
            if (offline && offline.verses.length > 0) {
              useReaderContext
                .getState()
                .setCorpus(
                  createCorpus(chapterNumber, actualShape, offline.verses, offline.titles ?? {}, {
                    expected,
                  }),
                )
              return
            }
          } catch {
            // Fall through to the network.
          }
        }

        if (!hints.online) return

        const timeout = setTimeout(() => controller.abort(), HYDRATION_TIMEOUT_MS)
        try {
          // `verse_end` omitted: the endpoint returns through the chapter's end.
          const { data, error } = await wsApi.GET('/quran', {
            params: {
              query: {
                chapter_number_start: chapterNumber,
                langs,
                verse_start: verseFloor,
                include_words: withWords || undefined,
                include_root: withWords ? opts.includeRoot || undefined : undefined,
                include_meaning: withWords ? opts.includeMeaning || undefined : undefined,
                word_langs: withWords ? ['ar', 'en', 'tl'] : undefined,
              },
            },
            signal: controller.signal,
          })
          if (cancelled || error || !data) return

          const chapter = data.chapters?.[0]
          const fetched = chapter?.verses ?? []
          if (fetched.length === 0) return

          useReaderContext.getState().setCorpus(
            createCorpus(chapterNumber, actualShape, fetched, chapter?.titles ?? {}, {
              expected,
              lastVerse: data.info?.verse_end,
            }),
          )
        } catch {
          // Aborted or offline; the reader keeps working from the network.
        } finally {
          clearTimeout(timeout)
        }
      })()
    })

    return () => {
      cancelled = true
      cancelIdle()
      controller.abort()
    }
  }, [chapterNumber, opts, enabled, chapters])
}
