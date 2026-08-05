'use client'

import { useEffect, useRef, useState } from 'react'
import { wsApi } from '@/src/api/client'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'

/** One library search hit, normalized across the network and offline paths. */
export interface LibraryHit {
  docType: string // 'appendix' | 'introduction' | 'proclamation'
  docNumber: number | null
  title: string
  sectionIndex: number
  heading?: string
  /** Matching extract; matches wrapped in <b> tags. */
  snippet: string
}

/** Route for a library hit — identical paths on web and mobile. */
export function libraryHitHref(hit: LibraryHit): string {
  if (hit.docType === 'appendix' && hit.docNumber) return `/appendices/${hit.docNumber}`
  if (hit.docType === 'proclamation') return '/proclamation'
  return '/introduction'
}

const RESULT_LIMIT = 20
const SHOWN_DOCS = 6

/** Keep the best (first-ranked) hit per document so one appendix with many
 * matching sections doesn't flood the section. */
function bestPerDoc(hits: LibraryHit[]): LibraryHit[] {
  const seen = new Set<string>()
  const out: LibraryHit[] = []
  for (const hit of hits) {
    const key = `${hit.docType}:${hit.docNumber ?? 0}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(hit)
    if (out.length >= SHOWN_DOCS) break
  }
  return out
}

/**
 * Full-text search over the library documents (introduction, proclamation,
 * appendices): network-first via GET /library/search, falling back to the
 * installed offline `library-en` bundle when the network is unavailable —
 * the same try-network-then-offline shape as verse search.
 */
export function useLibrarySearch(query: string, lang = 'en'): { hits: LibraryHit[]; loading: boolean } {
  const [hits, setHits] = useState<LibraryHit[]>([])
  const [loading, setLoading] = useState(false)
  const runIdRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setHits([])
      return
    }

    const runId = ++runIdRef.current
    setLoading(true)

    const offline = async (): Promise<LibraryHit[]> => {
      const store = getRegisteredOfflineContentStore()
      if (!store) return []
      const rows = await store.searchDocs(lang, trimmed, { limit: RESULT_LIMIT })
      return rows.map((r) => ({
        docType: r.docType,
        docNumber: r.docNumber || null,
        title: r.title,
        sectionIndex: r.sectionIndex,
        heading: r.heading,
        snippet: r.hl ?? '',
      }))
    }

    void (async () => {
      let results: LibraryHit[] = []
      try {
        const { data, error } = await wsApi.GET('/library/search', {
          params: { query: { q: trimmed, lang, limit: RESULT_LIMIT } },
        })
        if (error || !data) throw new Error('library search failed')
        results = data.results.map((r) => ({
          docType: r.doc_type,
          docNumber: r.doc_number ?? null,
          title: r.title,
          sectionIndex: r.section_index,
          heading: r.heading ?? undefined,
          snippet: r.snippet,
        }))
      } catch {
        try {
          results = await offline()
        } catch {
          results = []
        }
      }
      if (runIdRef.current !== runId) return
      setHits(bestPerDoc(results))
      setLoading(false)
    })()
  }, [query, lang])

  return { hits, loading }
}
