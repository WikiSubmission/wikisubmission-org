'use client'

import { useEffect, useState } from 'react'
import { wsApi } from '@/src/api/client'
import { rootToLatin, stripDiacritics } from '@/lib/transliteration'

export type Derivative = {
  ar: string
  count: number
}

export type Occurrence = {
  ref: string
  ar: string
  en: string | null
  hi: string
}

export type RootRecord = {
  letters: string
  tr: string
  count: number
  derivs: Derivative[]
  occ: Occurrence[]
}

export type RootsIndex = {
  roots: RootRecord[]
  fetchedAt: number
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

const CACHE_KEY = 'ws-roots-index-v1'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
const MAX_OCC_PER_ROOT = 25
const MAX_DERIVS_PER_ROOT = 12

function readCache(): RootsIndex | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RootsIndex
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(index: RootsIndex): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(index))
  } catch {
    // Quota exceeded — drop the cache silently.
  }
}

/**
 * Format a raw root string ("رحم") as space-separated letters ("ر ح م"),
 * matching the design handoff data shape.
 */
function spaceLetters(root: string): string {
  return Array.from(root.replace(/\s+/g, '')).join(' ')
}

async function fetchAndAggregate(): Promise<RootRecord[]> {
  type RootBucket = {
    letters: string
    count: number
    derivs: Map<string, number>
    occ: Occurrence[]
    occChapters: Set<number>
  }

  const buckets = new Map<string, RootBucket>()

  // The /quran endpoint accepts a chapter range; fetch each chapter sequentially
  // to keep payload size manageable and surface progress if we ever wire one up.
  for (let chapter = 1; chapter <= 114; chapter++) {
    const { data, error } = await wsApi.GET('/quran', {
      params: {
        query: {
          chapter_number_start: chapter,
          chapter_number_end: chapter,
          langs: ['ar', 'en'],
          include_words: true,
          include_root: true,
          include_meaning: true,
          word_langs: ['ar', 'en'],
        },
      },
    })
    if (error || !data) {
      throw new Error(`Failed to fetch chapter ${chapter}`)
    }
    const verses = data.chapters?.[0]?.verses ?? []
    for (const verse of verses) {
      const verseAr = verse.tr?.ar?.tx ?? ''
      const verseEn = verse.tr?.en?.tx ?? null
      const ref = verse.vk ?? ''
      for (const word of verse.w ?? []) {
        const root = word.r
        if (!root) continue
        const ar = word.tx?.ar
        if (!ar) continue
        let bucket = buckets.get(root)
        if (!bucket) {
          bucket = {
            letters: spaceLetters(root),
            count: 0,
            derivs: new Map(),
            occ: [],
            occChapters: new Set(),
          }
          buckets.set(root, bucket)
        }
        bucket.count += 1
        bucket.derivs.set(ar, (bucket.derivs.get(ar) ?? 0) + 1)
        // Spread occurrences across distinct chapters for variety.
        if (
          bucket.occ.length < MAX_OCC_PER_ROOT &&
          !bucket.occChapters.has(verse.sc ?? 0)
        ) {
          bucket.occ.push({
            ref,
            ar: verseAr,
            en: verseEn,
            hi: ar,
          })
          bucket.occChapters.add(verse.sc ?? 0)
        }
      }
    }
  }

  const records: RootRecord[] = []
  for (const bucket of buckets.values()) {
    const derivs = Array.from(bucket.derivs.entries())
      .map(([ar, count]): Derivative => ({ ar, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_DERIVS_PER_ROOT)
    records.push({
      letters: bucket.letters,
      tr: rootToLatin(bucket.letters),
      count: bucket.count,
      derivs,
      occ: bucket.occ,
    })
  }
  records.sort((a, b) => b.count - a.count)
  return records
}

export type UseRootsIndex = {
  status: Status
  data: RootRecord[] | null
  error: string | null
  refresh: () => void
}

/**
 * Aggregates a Quran-wide roots index on the client. First call streams the
 * whole corpus (one request per chapter), subsequent calls hit localStorage.
 *
 * Phase 1 implementation — designed to be replaced by a `/roots` backend
 * endpoint without changing the consuming UI. See plan §A.
 */
export function useRootsIndex(): UseRootsIndex {
  const [status, setStatus] = useState<Status>('idle')
  const [data, setData] = useState<RootRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    const cached = readCache()
    if (cached && reloadTick === 0) {
      setData(cached.roots)
      setStatus('ready')
      return
    }

    setStatus('loading')
    setError(null)
    void fetchAndAggregate()
      .then((roots) => {
        if (cancelled) return
        const index: RootsIndex = { roots, fetchedAt: Date.now() }
        writeCache(index)
        setData(roots)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to build roots index')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [reloadTick])

  return {
    status,
    data,
    error,
    refresh: () => setReloadTick((n) => n + 1),
  }
}

/** Filter + sort helpers — pure, exported for testing and re-use. */
export function filterRoots(
  roots: RootRecord[],
  query: string,
  arabicTarget: string,
): RootRecord[] {
  const q = query.trim()
  if (!q) return roots
  const target = arabicTarget.replace(/\s+/g, '')
  const lcQuery = q.toLowerCase()
  if (target) {
    return roots.filter((r) => {
      const flat = stripDiacritics(r.letters).replace(/\s+/g, '')
      if (flat.includes(target)) return true
      if (r.tr.replace(/-/g, '').toLowerCase().includes(lcQuery.replace(/\s+/g, ''))) return true
      return false
    })
  }
  return roots.filter((r) => r.tr.toLowerCase().includes(lcQuery))
}
