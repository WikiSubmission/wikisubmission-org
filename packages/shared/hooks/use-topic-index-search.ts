'use client'

import { useEffect, useRef, useState } from 'react'
import { wsApi } from '@/src/api/client'
import type { TopicEntry } from '@/lib/topic-index'

/**
 * Search over the Quran's printed topical index (GET /topic-index/search).
 *
 * A separate corpus from verse search, run alongside it rather than merged into
 * it: the index answers "what does the book say about X", verse search answers
 * "where does this wording appear". Keeping them apart leaves the verse ranking
 * untouched and lets each render in its own section.
 *
 * There is no offline fallback yet — the index is not in the offline bundles (see
 * the note in migrations/031_quran_topic_index.sql). A failed request yields an
 * empty section rather than an error, since the verse results below it still
 * answer the query.
 *
 * The types and URL helpers live in lib/topic-index.ts, which is not a client
 * module: the server-rendered index page needs them too.
 */

/** Small: this is a supporting section above the verse results, not the answer. */
const RESULT_LIMIT = 6
const DEBOUNCE_MS = 250

export function useTopicIndexSearch(
  query: string,
  lang = 'en',
): { entries: TopicEntry[]; loading: boolean } {
  const [entries, setEntries] = useState<TopicEntry[]>([])
  const [loading, setLoading] = useState(false)
  const runIdRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setEntries([])
      setLoading(false)
      return
    }

    const runId = ++runIdRef.current
    setLoading(true)

    const timer = setTimeout(() => {
      void (async () => {
        let results: TopicEntry[] = []
        try {
          const { data, error } = await wsApi.GET('/topic-index/search', {
            params: { query: { q: trimmed, lang, limit: RESULT_LIMIT } },
          })
          if (error || !data) throw new Error('topic index search failed')
          results = data.results
        } catch {
          results = []
        }
        if (runIdRef.current !== runId) return
        setEntries(results)
        setLoading(false)
      })()
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, lang])

  return { entries, loading }
}
