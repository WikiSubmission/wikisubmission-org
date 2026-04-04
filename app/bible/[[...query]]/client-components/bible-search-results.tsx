'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import { wsApi } from '@/src/api/client'
import { bookFromSlug, BIBLE_BOOKS } from '@/constants/bible-books'
import type { components } from '@/src/api/types.gen'

type BibleVerseData = components['schemas']['BibleVerseData']

type ResultVerse = BibleVerseData & { bookSlug: string; bookName: string; chapterNum: number }

export function BibleSearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [results, setResults] = useState<ResultVerse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState('')

  useEffect(() => {
    if (!q || q.length < 2) {
      setResults([])
      setSearched('')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setResults([])

    wsApi
      .GET('/bible/search', {
        params: { query: { q, langs: ['en'], limit: 50 } },
      })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError('Search failed. Please try again.')
          return
        }
        const verses: ResultVerse[] = []
        for (const bookData of data?.books ?? []) {
          const bn = bookData.bn ?? 0
          const bookEntry = BIBLE_BOOKS.find((b) => b.bn === bn)
          const bookName = bookEntry?.bk ?? String(bn)
          const bookSlug = bookEntry?.slug ?? String(bn)
          for (const chapter of bookData.chapters ?? []) {
            const chapterNum = chapter.cn ?? 0
            for (const verse of chapter.verses ?? []) {
              verses.push({ ...verse, bookSlug, bookName, chapterNum })
            }
          }
        }
        setResults(verses)
        setSearched(q)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [q])

  if (!q) {
    return (
      <div className="text-center py-24 text-muted-foreground text-sm">
        Enter a search term above.
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {loading && (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      )}

      {error && !loading && (
        <p className="text-center text-sm text-destructive py-12">{error}</p>
      )}

      {!loading && !error && searched && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No results for &ldquo;{searched}&rdquo;.
        </p>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground font-mono mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{searched}&rdquo;
          </p>
          <div className="space-y-2">
            {results.map((verse) => {
              const tr = verse.tr?.['en']
              const vn = verse.vn ?? 0
              const ref = `${verse.bookName} ${verse.chapterNum}:${vn}`
              return (
                <Link
                  key={verse.vk}
                  href={`/bible/${verse.bookSlug}/${verse.chapterNum}?verse=${vn}`}
                  className="flex gap-3 p-3 rounded-xl border border-border/40 hover:bg-accent/40 hover:border-primary/20 transition-all group"
                >
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground mt-0.5 w-28 leading-relaxed">
                    {ref}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground line-clamp-3">
                    {tr?.tx ?? ''}
                  </p>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
