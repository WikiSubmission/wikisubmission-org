'use client'

import { useQuranMetrics } from '@/hooks/use-quran-metrics'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function MetricsCollector() {
  const addNavigation = useQuranMetrics((state) => state.addNavigation)
  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for search query first
    const searchQuery = searchParams.get('q')
    if (searchQuery && searchQuery.trim().length > 0) {
      // Only track as a query if it contains non-numeric characters
      // This prevents duplicates when searching for verse references like "2:255"
      const hasNonNumeric = /[^\d:\s-]/.test(searchQuery.trim())
      if (hasNonNumeric) {
        addNavigation({
          type: 'query',
          query: searchQuery.trim(),
        })
        return
      }
    }

    // Extract chapter number from params
    const query = params.query as string[] | undefined
    if (!query || query.length === 0) return

    const chapterNumber = parseInt(query[0])
    if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) return

    // Extract verse number from search params if present
    const verseParam = searchParams.get('verse')

    if (verseParam) {
      const verseNumber = parseInt(verseParam)
      if (!isNaN(verseNumber)) {
        // Add as verse navigation (includes both chapter and verse)
        addNavigation({
          type: 'verse',
          chapter: chapterNumber,
          verse: verseNumber,
        })
        return
      }
    }

    // Add as chapter-only navigation
    addNavigation({
      type: 'chapter',
      chapter: chapterNumber,
    })
  }, [params, searchParams, addNavigation])

  return null
}
