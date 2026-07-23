'use client'

import { useEffect } from 'react'
import { useLanguagesStore, type LanguageEntry } from '@/hooks/use-languages-store'

export function LanguagesInit({ languages }: { languages: LanguageEntry[] }) {
  const init = useLanguagesStore((s) => s.init)

  useEffect(() => {
    init(languages)
  }, [init, languages])

  return null
}
