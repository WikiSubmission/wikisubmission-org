'use client'

import { useEffect } from 'react'
import { wsApi } from '@/src/api/client'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { scheduleIdle } from '@/lib/schedule-idle'
import {
  createLibrary,
  decideLibraryHydration,
  libraryKey,
  mergeChapters,
  pendingBatches,
} from '@/lib/quran-local-library'
import { readDeviceHints } from '@/lib/quran-local-corpus'
import { useReaderContext } from '@/hooks/use-reader-context-store'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'

/** Per batch. Ten chapters of text is small; the ceiling is for a stalled link. */
const BATCH_TIMEOUT_MS = 20_000

/**
 * Backoff after a failed batch, so a flaky connection does not turn the sweep
 * into a retry storm. The sweep is a background nicety — it can afford to wait.
 */
const RETRY_DELAY_MS = 5_000

/** Consecutive failures after which the sweep gives up until the next mount. */
const MAX_CONSECUTIVE_FAILURES = 4

/**
 * One sweep per page, not per mount.
 *
 * The Quran layout stays mounted across chapter navigations, but React strict
 * mode double-invokes effects and a route change can remount the tree. Without a
 * module-level owner, each of those would start its own sweep over the same
 * chapters. The key is the language set, so switching the primary translation
 * does start a genuinely new sweep.
 */
let activeSweepKey: string | null = null

function buildLangs(primary: string, secondary: string | undefined, arabic: boolean): string[] {
  const langs: string[] = []
  if (primary !== 'xl' && primary !== 'none') langs.push(primary)
  if (arabic && !langs.includes('ar')) langs.push('ar')
  if (secondary && secondary !== 'xl' && secondary !== 'none' && !langs.includes(secondary)) {
    langs.push(secondary)
  }
  return langs.length > 0 ? langs : ['en']
}

/**
 * Sweeps the whole Quran into memory, a batch at a time, at idle priority.
 *
 * Mounted once by the Quran layout rather than by the reader, because the
 * surfaces that need it — the header search bar, the home search bar, the
 * command menu — are all reachable on routes where no reader exists. Binding
 * hydration to `ChapterReader` is what left the index and search views with
 * nothing to search.
 *
 * Each batch merges as it lands, so coverage grows while the sweep runs instead
 * of appearing all at once at the end. Nothing here touches the reader's state
 * or its `loading` flag; the sweep is meant to be invisible.
 */
export function useQuranLibraryHydration(enabled = true) {
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)
  const secondaryLanguage = useQuranPreferences((s) => s.secondaryLanguage)
  const arabic = useQuranPreferences((s) => s.arabic)

  useEffect(() => {
    if (!enabled) return

    const langs = buildLangs(primaryLanguage, secondaryLanguage, arabic)
    const key = libraryKey(langs)

    // A language change makes the held library unanswerable for the new set, so
    // it is dropped rather than merged into — a half-English, half-French store
    // would render blank text for whichever half is asked for.
    const existing = useReaderContext.getState().library
    if (existing && existing.key !== key) useReaderContext.getState().setLibrary(null)

    if (activeSweepKey === key) return
    activeSweepKey = key

    let cancelled = false
    let cancelIdle: (() => void) | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    // Per batch, not per sweep: a shared controller stays aborted after the
    // first timeout, which would fail every remaining batch instantly.
    let inFlight: AbortController | null = null
    let failures = 0

    const queue = (delayMs = 0) => {
      if (cancelled) return
      if (delayMs === 0) {
        cancelIdle = scheduleIdle(step)
        return
      }
      retryTimer = setTimeout(() => {
        if (!cancelled) cancelIdle = scheduleIdle(step)
      }, delayMs)
    }

    /** Fetches one pending batch and merges it, then queues the next. */
    const step = () => {
      void (async () => {
        if (cancelled) return

        const hints = readDeviceHints()
        if (decideLibraryHydration({ ...hints, bundlesInstalled: bundlesCovered }) === 'skip') {
          return
        }

        const held = useReaderContext.getState().library
        const library = held && held.key === key ? held : createLibrary(langs)
        const next = pendingBatches(library)[0]
        if (!next) return // fully swept

        const controller = new AbortController()
        inFlight = controller
        const timeout = setTimeout(() => controller.abort(), BATCH_TIMEOUT_MS)
        let failed = false
        try {
          const { data, error } = await wsApi.GET('/quran', {
            params: {
              query: {
                chapter_number_start: next.start,
                chapter_number_end: next.end,
                langs,
                // 0 is the Basmallah, which the reader shows and so search should
                // find. Chapters 1 and 9 have none and simply start at 1.
                verse_start: 0,
              },
            },
            signal: controller.signal,
          })
          if (cancelled) return
          if (error || !data?.chapters?.length) {
            failed = true
          } else {
            // Re-read rather than reusing `library`: the store's copy could have
            // been replaced while this request was in flight.
            const current = useReaderContext.getState().library
            const base = current && current.key === key ? current : library
            useReaderContext.getState().setLibrary(mergeChapters(base, data.chapters))
          }
        } catch {
          failed = true
        } finally {
          clearTimeout(timeout)
          if (inFlight === controller) inFlight = null
        }

        if (cancelled) return
        if (failed) {
          failures += 1
          if (failures >= MAX_CONSECUTIVE_FAILURES) return
          queue(RETRY_DELAY_MS)
        } else {
          failures = 0
          queue()
        }
      })()
    }

    // Probed once per sweep rather than per batch: installed bundles already
    // answer for the whole Quran through FTS5, which beats holding it on the heap.
    let bundlesCovered = false
    void (async () => {
      const store = getRegisteredOfflineContentStore()
      if (store) {
        try {
          const installed = await store.installedBundles()
          const ids = new Set(installed.map((bundle) => bundle.id))
          bundlesCovered = langs.every((lang) => ids.has(`quran-${lang}`))
        } catch {
          bundlesCovered = false
        }
      }
      queue()
    })()

    return () => {
      cancelled = true
      cancelIdle?.()
      if (retryTimer) clearTimeout(retryTimer)
      inFlight?.abort()
      // Released so a genuine remount (navigating away and back) can resume the
      // sweep from whatever the store still holds.
      if (activeSweepKey === key) activeSweepKey = null
    }
  }, [enabled, primaryLanguage, secondaryLanguage, arabic])
}
