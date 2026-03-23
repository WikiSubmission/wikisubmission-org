'use client'

import { useEffect } from 'react'
import { useQuranNavStore } from '@/hooks/use-quran-nav-store'
import type { components } from '@/src/api/types.gen'

type Chapter = components['schemas']['Chapter']
type Appendix = components['schemas']['Appendix']

export function QuranNavInit({
  chapters,
  appendices,
}: {
  chapters: Chapter[]
  appendices: Appendix[]
}) {
  const init = useQuranNavStore((s) => s.init)
  useEffect(() => {
    init(chapters, appendices)
  }, [init, chapters, appendices])
  return null
}
