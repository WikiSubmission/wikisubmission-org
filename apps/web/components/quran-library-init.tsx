'use client'

import { useQuranLibraryHydration } from '@/hooks/use-quran-library-hydration'

/**
 * Starts the background sweep that pulls the whole Quran into memory as text.
 *
 * Mounted by the Quran layout so it covers every route in the section — the
 * index, the reader, and the search view all reach the same search bar, and only
 * the reader used to hydrate anything.
 */
export function QuranLibraryInit() {
  useQuranLibraryHydration()
  return null
}
