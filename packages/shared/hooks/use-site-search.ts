'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { wsApi } from '@/src/api/client'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { components } from '@/src/api/types.gen'

type SiteSearchResult = components['schemas']['SiteSearchResult']

/** A normalized hit, shared by the instant local tier and the backend tier. */
export interface SiteHit {
  /** Dedupe key: route plus anchor. */
  id: string
  route: string
  anchor?: string
  kind: string
  title: string
  heading?: string
  description?: string
  /** Matching extract with matches wrapped in `<b>`. Absent for local-only hits. */
  snippet?: string
  tier: 'local' | 'remote'
  score: number
}

export function siteHitHref(hit: SiteHit): string {
  return hit.anchor ? `${hit.route}${hit.anchor}` : hit.route
}

/**
 * 200ms: roughly a fast typist's inter-key interval. The local tier already
 * covers the perceived latency, so there is nothing to gain from waiting longer.
 */
const REMOTE_DEBOUNCE_MS = 200

/** Matches the backend's own 400 on a one-character query. */
const MIN_QUERY_LENGTH = 2

const REMOTE_LIMIT = 8

export interface UseSiteSearchResult {
  /** Debounced backend results, ranked and capped. */
  results: SiteHit[]
  loading: boolean
  /** The backend leg failed and there is no fallback for it. */
  offline: boolean
}

function toHit(result: SiteSearchResult): SiteHit {
  const anchor = result.anchor ?? undefined
  return {
    id: `${result.route}${anchor ?? ''}`,
    route: result.route,
    anchor,
    kind: result.kind,
    title: result.title,
    heading: result.heading ?? undefined,
    description: result.description ?? undefined,
    snippet: result.snippet || undefined,
    tier: 'remote',
    score: result.rank ?? 0,
  }
}

/**
 * Keeps the best hit per route, so one long appendix with many matching sections
 * cannot flood the list. Replaces `bestPerDoc` in use-library-search.ts, which
 * did the same for library documents.
 */
function bestPerRoute(hits: SiteHit[], cap: number): SiteHit[] {
  const seen = new Set<string>()
  const out: SiteHit[] = []
  for (const hit of hits) {
    if (seen.has(hit.route)) continue
    seen.add(hit.route)
    out.push(hit)
    if (out.length >= cap) break
  }
  return out
}

/**
 * The backend tier of site search: page bodies, sections, and the library corpus.
 *
 * This owns only the debounced network leg. The instant tier is the command
 * menu's own index over the route manifest, and the two are rendered as separate
 * labelled groups rather than merged into one ranked list — a merged list
 * re-sorts when the debounced response lands, which moves the row under the
 * user's cursor.
 *
 * `localRoutes` are the routes the instant tier is already offering, so a page
 * cannot appear in both groups.
 */
export function useSiteSearch(
  query: string,
  lang: string,
  localRoutes?: ReadonlySet<string>,
): UseSiteSearchResult {
  const trimmed = query.trim()
  const debouncedQuery = useDebouncedValue(trimmed, REMOTE_DEBOUNCE_MS)

  const [remote, setRemote] = useState<SiteHit[]>([])
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  // Monotonic guard kept alongside AbortController: abort covers the in-flight
  // request, the run id covers an out-of-order resolve that abort cannot reach.
  const runIdRef = useRef(0)

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setRemote([])
      setLoading(false)
      setOffline(false)
      return
    }

    const runId = ++runIdRef.current
    const controller = new AbortController()
    setLoading(true)

    void (async () => {
      try {
        const { data, error } = await wsApi.GET('/site/search', {
          params: { query: { q: debouncedQuery, lang, limit: REMOTE_LIMIT } },
          signal: controller.signal,
        })
        if (runIdRef.current !== runId) return
        if (error || !data) throw new Error('site search failed')
        setRemote(data.results.map(toHit))
        setOffline(false)
      } catch {
        if (runIdRef.current !== runId) return
        // No offline fallback yet: there is no `site-<lang>` bundle. The menu
        // shows the local tier and notes that content search is unavailable.
        setRemote([])
        setOffline(true)
      } finally {
        if (runIdRef.current === runId) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [debouncedQuery, lang])

  return useMemo(() => {
    // Drop a hit whose page the instant tier already offers, so /practices/zakat
    // does not appear twice. Section hits (with an anchor) survive: they point
    // somewhere the page-level row does not.
    const deduped = localRoutes
      ? remote.filter((hit) => hit.anchor || !localRoutes.has(hit.route))
      : remote

    return { results: bestPerRoute(deduped, REMOTE_LIMIT), loading, offline }
  }, [remote, localRoutes, loading, offline])
}
