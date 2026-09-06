'use client'

import { QuranModeSelector as SharedQuranModeSelector } from '@/components/quran-reader/mode-selector'
import { useReadingBlocked } from './use-reading-blocked'

/** Web wrapper: derives readingBlocked from the current reader route, then
 * renders the shared segmented control. */
export function QuranModeSelector() {
  const readingBlocked = useReadingBlocked()
  return <SharedQuranModeSelector readingBlocked={readingBlocked} />
}
