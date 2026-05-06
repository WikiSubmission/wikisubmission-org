'use client'

import { useEffect, useState } from 'react'
import { wsApi } from '@/src/api/client'
import { rootToLatin, stripDiacritics } from '@/lib/transliteration'

export type Derivative = {
  ar: string
  tr: string | null
  count: number
}

export type Occurrence = {
  ref: string
  ar: string
  en: string | null
  tl: string | null
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

const INDEX_CACHE_KEY = 'ws-roots-index-v2'
const DETAIL_CACHE_KEY = 'ws-roots-detail-v3'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
const ROOTS_FETCH_LIMIT = 5000

function readJSON<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded — drop silently.
  }
}

function readIndex(): RootsIndex | null {
  const cached = readJSON<RootsIndex>(INDEX_CACHE_KEY)
  if (!cached) return null
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null
  return cached
}

async function fetchIndex(): Promise<RootRecord[]> {
  const { data, error } = await wsApi.GET('/roots', {
    params: {
      query: {
        sort: 'frequency',
        limit: ROOTS_FETCH_LIMIT,
      },
    },
  })
  if (error || !data) {
    throw new Error('Failed to load roots index')
  }
  return (data.items ?? []).map((s) => ({
    letters: s.r,
    tr: s.tr || rootToLatin(s.r),
    count: s.c,
    derivs: [],
    occ: [],
  }))
}

export type UseRootsIndex = {
  status: Status
  data: RootRecord[] | null
  error: string | null
  refresh: () => void
}

/**
 * Fetches the Quran roots index from the backend `/roots` endpoint.
 * One request, cached in localStorage with a 7-day TTL.
 *
 * The cache is read synchronously during initial state — when warm, the first
 * render already has the data, eliminating the loading flash on navigation.
 */
export function useRootsIndex(): UseRootsIndex {
  const [data, setData] = useState<RootRecord[] | null>(() => readIndex()?.roots ?? null)
  const [status, setStatus] = useState<Status>(() => (readIndex() ? 'ready' : 'idle'))
  const [error, setError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    if (status === 'ready' && reloadTick === 0) return

    setStatus('loading')
    setError(null)
    void fetchIndex()
      .then((roots) => {
        if (cancelled) return
        writeJSON(INDEX_CACHE_KEY, { roots, fetchedAt: Date.now() } satisfies RootsIndex)
        setData(roots)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load roots index')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTick])

  return {
    status,
    data,
    error,
    refresh: () => setReloadTick((n) => n + 1),
  }
}

type DetailCache = Record<string, { detail: { derivs: Derivative[]; occ: Occurrence[] }; fetchedAt: number }>

function readDetailCache(): DetailCache {
  return readJSON<DetailCache>(DETAIL_CACHE_KEY) ?? {}
}

async function fetchDetail(letters: string): Promise<{ derivs: Derivative[]; occ: Occurrence[] }> {
  const { data, error } = await wsApi.GET('/roots/{letters}', {
    params: {
      path: { letters },
    },
  })
  if (error || !data) {
    throw new Error(`Failed to load root ${letters}`)
  }
  const derivs: Derivative[] = (data.dv ?? []).map((d) => ({
    ar: d.ar,
    tr: d.tr ?? null,
    count: d.c,
  }))
  const occ: Occurrence[] = (data.oc ?? []).map((o) => ({
    ref: o.vk,
    ar: o.ar,
    en: o.en ?? null,
    tl: o.tl ?? null,
    hi: o.hl ?? '',
  }))
  return { derivs, occ }
}

export type UseRootDetail = {
  status: Status
  derivs: Derivative[]
  occ: Occurrence[]
  error: string | null
}

/**
 * Lazy-loads a single root's derivatives and first 20 occurrences.
 * Cached in localStorage so revisiting a root is instant.
 */
export function useRootDetail(letters: string | null): UseRootDetail {
  const initial = (() => {
    if (!letters) return null
    const cache = readDetailCache()
    const c = cache[letters]
    if (c && Date.now() - c.fetchedAt <= CACHE_TTL_MS) return c.detail
    return null
  })()
  const [status, setStatus] = useState<Status>(initial ? 'ready' : letters ? 'loading' : 'idle')
  const [derivs, setDerivs] = useState<Derivative[]>(initial?.derivs ?? [])
  const [occ, setOcc] = useState<Occurrence[]>(initial?.occ ?? [])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!letters) {
      setStatus('idle')
      setDerivs([])
      setOcc([])
      setError(null)
      return
    }

    const cache = readDetailCache()
    const cached = cache[letters]
    if (cached && Date.now() - cached.fetchedAt <= CACHE_TTL_MS) {
      setDerivs(cached.detail.derivs)
      setOcc(cached.detail.occ)
      setStatus('ready')
      return
    }

    let cancelled = false
    setStatus('loading')
    setError(null)
    void fetchDetail(letters)
      .then((detail) => {
        if (cancelled) return
        const next = readDetailCache()
        next[letters] = { detail, fetchedAt: Date.now() }
        writeJSON(DETAIL_CACHE_KEY, next)
        setDerivs(detail.derivs)
        setOcc(detail.occ)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load root detail')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [letters])

  return { status, derivs, occ, error }
}

/** Filter helpers — pure, exported for testing and re-use. */
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
