'use client'

import { useSyncExternalStore } from 'react'
import { ChapterReader } from '@/components/quran-reader/chapter-reader'
import type { QuranResponse } from '@/hooks/use-chapter-reader'

interface ReaderBootProps {
  chapterNumber: number
  initialData: QuranResponse | null
  initialVerse?: string
}

/**
 * Reconciles the server-baked chapter with the actual URL for offline
 * navigations.
 *
 * When offline, the service worker serves ONE precached reader document
 * (`/quran/1`) for any `/quran/<chapter>` route — they are all the same
 * catch-all segment. That document is baked for chapter 1, so on a cache-served
 * navigation the `chapterNumber` prop will not match `location.pathname`. We
 * re-derive the requested chapter from the URL and, when it differs, remount
 * the reader on the correct chapter with no `initialData` — the reader then
 * fills from the installed offline bundles (or the network when online).
 *
 * The URL is read via `useSyncExternalStore` with a null server snapshot: during
 * SSR and hydration the derived value is null, so the first client render
 * mirrors the server props and never mismatches; React then re-renders with the
 * real location and the swap happens without a cascading effect.
 *
 * Online this is a no-op: the SSR document already matches its URL, so the
 * derived chapter equals the prop and `initialData` is used as before.
 */
export function ReaderBoot({
  chapterNumber,
  initialData,
  initialVerse,
}: ReaderBootProps) {
  const locationKey = useSyncExternalStore(
    subscribeNoop,
    getLocationKey,
    getServerLocationKey,
  )

  const derived = locationKey ? deriveChapterFromLocation(locationKey) : null
  const matchesServer =
    !derived ||
    (derived.chapter === chapterNumber && derived.verse === initialVerse)

  const chapter = matchesServer ? chapterNumber : derived.chapter
  const verse = matchesServer ? initialVerse : derived.verse

  return (
    <ChapterReader
      key={`${chapter}-${verse ?? 'full'}`}
      chapterNumber={chapter}
      initialData={matchesServer ? initialData : null}
      initialVerse={verse}
    />
  )
}

// location only changes via a navigation, which remounts this component, so
// there is nothing to subscribe to — return a no-op unsubscribe.
function subscribeNoop(): () => void {
  return () => {}
}

function getLocationKey(): string {
  return window.location.pathname + window.location.search
}

// Null on the server so the first client (hydration) render uses the server
// props and matches the SSR HTML.
function getServerLocationKey(): null {
  return null
}

/**
 * Parse a plain chapter reference out of a reader URL key
 * (`/quran/<n>` with an optional `?verse=<v>`). Returns null for the index,
 * verse-list, and search forms — those are not remounted by this seam in v1.
 */
function deriveChapterFromLocation(
  locationKey: string,
): { chapter: number; verse?: string } | null {
  const [pathname, searchString = ''] = locationKey.split('?')
  const match = pathname.match(/^\/quran\/([^/]+)/)
  if (!match) return null

  const segment = decodeURIComponent(match[1])
  if (!/^\d{1,3}$/.test(segment)) return null

  const chapter = parseInt(segment, 10)
  if (chapter < 1 || chapter > 114) return null

  const verse = new URLSearchParams(searchString).get('verse')
  return { chapter, verse: verse ?? undefined }
}
