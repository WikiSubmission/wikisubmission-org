'use client'

import { useState, useCallback } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'

type VerseData = components['schemas']['VerseData']

export type ParsedRef = {
  cn: number // chapter number
  vs: number // verse start
  ve: number // verse end
}

/** Parses a Quran reference string into chapter + verse range.
 *  Accepts: "2:255", "1:1-7", "2:255-257"
 *  Returns null for unrecognised input. */
export function parseQuranRef(ref: string): ParsedRef | null {
  const m = ref.trim().match(/^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/)
  if (!m) return null
  const cn = parseInt(m[1])
  const vs = parseInt(m[2])
  const ve = m[3] ? parseInt(m[3]) : vs
  if (cn < 1 || cn > 114 || vs < 0) return null
  return { cn, vs, ve }
}

/** Lazy-fetch a verse or range on demand.
 *  Fetch is NOT triggered on mount — call `fetch(ref, lang)` explicitly. */
export function useVerseFetch() {
  const [verses, setVerses] = useState<VerseData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ref: string, lang: LangCode) => {
    const parsed = parseQuranRef(ref)
    if (!parsed) {
      setError('Invalid reference')
      return
    }

    setLoading(true)
    setVerses([])
    setError(null)

    const langs: string[] = []
    if (lang !== 'xl') langs.push(lang)
    if (!langs.includes('ar')) langs.push('ar')

    const { data, error: err } = await wsApi.GET('/quran', {
      params: {
        query: {
          chapter_number_start: parsed.cn,
          verse_start: parsed.vs,
          verse_end: parsed.ve,
          langs,
        },
      },
    })

    setVerses(data?.chapters?.flatMap((ch) => ch.verses ?? []) ?? [])
    setError(err ? 'Failed to fetch verse.' : null)
    setLoading(false)
  }, [])

  return { verses, loading, error, fetch }
}
