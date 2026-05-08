'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  wi: number | null
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
const DETAIL_CACHE_KEY = 'ws-roots-detail-v5'
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
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

type DetailCache = Record<
  string,
  { detail: { derivs: Derivative[]; occ: Occurrence[]; meaning: string | null }; fetchedAt: number }
>

function readDetailCache(): DetailCache {
  return readJSON<DetailCache>(DETAIL_CACHE_KEY) ?? {}
}

async function fetchDetail(
  letters: string,
): Promise<{ derivs: Derivative[]; occ: Occurrence[]; meaning: string | null }> {
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
    wi: o.wi ?? null,
  }))
  const meaning = data.m ?? null
  return { derivs, occ, meaning }
}

export type UseRootDetail = {
  status: Status
  derivs: Derivative[]
  occ: Occurrence[]
  meaning: string | null
  error: string | null
}

/**
 * Lazy-loads a single root's derivatives and first 20 occurrences.
 * Cached in localStorage so revisiting a root is instant.
 */
export function useRootDetail(letters: string | null): UseRootDetail {
  // Lazy initial state — only runs once on mount, and Date.now() inside a
  // useState initializer is allowed (it's not the render body).
  const [initial] = useState(() => {
    if (!letters) return null
    const cache = readDetailCache()
    const c = cache[letters]
    if (c && Date.now() - c.fetchedAt <= CACHE_TTL_MS) return c.detail
    return null
  })
  const [status, setStatus] = useState<Status>(initial ? 'ready' : letters ? 'loading' : 'idle')
  const [derivs, setDerivs] = useState<Derivative[]>(initial?.derivs ?? [])
  const [occ, setOcc] = useState<Occurrence[]>(initial?.occ ?? [])
  const [meaning, setMeaning] = useState<string | null>(initial?.meaning ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!letters) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle')
      setDerivs([])
      setOcc([])
      setMeaning(null)
      setError(null)
      return
    }

    const cache = readDetailCache()
    const cached = cache[letters]
    if (cached && Date.now() - cached.fetchedAt <= CACHE_TTL_MS) {
      setDerivs(cached.detail.derivs)
      setOcc(cached.detail.occ)
      setMeaning(cached.detail.meaning ?? null)
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
        setMeaning(detail.meaning)
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

  return { status, derivs, occ, meaning, error }
}

// ─── Paginated occurrences ─────────────────────────────────────────────────

const OCC_PAGE_SIZE = 50

function mapOccurrence(o: {
  vk: string
  ar: string
  en?: string | null
  tl?: string | null
  hl?: string | null
  wi?: number | null
}): Occurrence {
  return {
    ref: o.vk,
    ar: o.ar,
    en: o.en ?? null,
    tl: o.tl ?? null,
    hi: o.hl ?? '',
    wi: o.wi ?? null,
  }
}

async function fetchOccurrencesPage(
  letters: string,
  surface: string | null,
  offset: number,
): Promise<{ items: Occurrence[]; total: number }> {
  const { data, error } = await wsApi.GET('/roots/{letters}/occurrences', {
    params: {
      path: { letters },
      query: {
        limit: OCC_PAGE_SIZE,
        offset,
        ...(surface ? { surface } : {}),
      },
    },
  })
  if (error || !data) {
    throw new Error(`Failed to load occurrences for ${letters}`)
  }
  return {
    items: (data.items ?? []).map(mapOccurrence),
    total: data.total ?? 0,
  }
}

export type UseRootOccurrences = {
  status: Status
  items: Occurrence[]
  total: number
  hasMore: boolean
  loadMore: () => void
  error: string | null
}

/**
 * Paginated occurrences for a root, optionally narrowed to a single surface
 * form. Fetches page 1 on mount, exposes `loadMore` for the virtualized list
 * to call when scrolling near the bottom. Resets when (letters, surface)
 * changes.
 */
export function useRootOccurrences(
  letters: string | null,
  surface: string | null,
): UseRootOccurrences {
  const [status, setStatus] = useState<Status>(letters ? 'loading' : 'idle')
  const [items, setItems] = useState<Occurrence[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const offsetRef = useRef(0)
  const loadingRef = useRef(false)

  const fetchKey = letters ? `${letters}|${surface ?? ''}` : null

  useEffect(() => {
    if (!letters) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle')
      setItems([])
      setTotal(0)
      setError(null)
      offsetRef.current = 0
      return
    }
    let cancelled = false
    offsetRef.current = 0
    setStatus('loading')
    setError(null)
    loadingRef.current = true
    void fetchOccurrencesPage(letters, surface, 0)
      .then(({ items, total }) => {
        if (cancelled) return
        setItems(items)
        setTotal(total)
        offsetRef.current = items.length
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load occurrences')
        setStatus('error')
      })
      .finally(() => {
        loadingRef.current = false
      })
    return () => {
      cancelled = true
    }
  }, [fetchKey, letters, surface])

  const loadMore = useCallback(() => {
    if (!letters) return
    if (loadingRef.current) return
    if (offsetRef.current >= total) return
    loadingRef.current = true
    const nextOffset = offsetRef.current
    void fetchOccurrencesPage(letters, surface, nextOffset)
      .then(({ items: page }) => {
        setItems((prev) => [...prev, ...page])
        offsetRef.current = nextOffset + page.length
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load more occurrences')
      })
      .finally(() => {
        loadingRef.current = false
      })
  }, [letters, surface, total])

  return {
    status,
    items,
    total,
    hasMore: items.length < total,
    loadMore,
    error,
  }
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
