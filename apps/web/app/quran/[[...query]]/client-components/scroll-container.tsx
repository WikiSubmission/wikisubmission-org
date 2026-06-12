'use client'

import { useEffect } from 'react'
import { useNavScroll } from '@/hooks/use-nav-scroll'

export function QuranScrollContainer({ children }: { children: React.ReactNode }) {
  useNavScroll()

  // Hide the native browser scrollbar on Quran pages — the minimap is the
  // sole scroll indicator. Class is toggled on <html> so the CSS can target
  // the scrollbar on the root element without affecting nested scrollers.
  useEffect(() => {
    document.documentElement.classList.add('quran-page')
    return () => document.documentElement.classList.remove('quran-page')
  }, [])

  return <>{children}</>
}
