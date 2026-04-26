'use client'

import { useState, useEffect } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import { Loader2 } from 'lucide-react'
import { QuranRef } from '@/components/quran-ref'
import { useTranslations } from 'next-intl'

type WordData = components['schemas']['WordData']

interface WordOccurrence {
  verse_key: string
  chapter_number: number
  verse_number: number
  word_index: number
  arabic: string
  english: string
  root: string
}

function flattenWords(
  data: components['schemas']['QuranResponse']
): WordOccurrence[] {
  const result: WordOccurrence[] = []
  for (const chapter of data.chapters ?? []) {
    for (const verse of chapter.verses ?? []) {
      const [, verseNumStr] = (verse.vk ?? '').split(':')
      const verseNumber = parseInt(verseNumStr ?? '0', 10)
      for (const word of (verse.w ?? []) as WordData[]) {
        result.push({
          verse_key: verse.vk ?? '',
          chapter_number: chapter.cn ?? 0,
          verse_number: verseNumber,
          word_index: word.wi ?? 0,
          arabic: word.tx?.['ar'] ?? '',
          english: word.tx?.['en'] ?? '',
          root: word.r ?? '',
        })
      }
    }
  }
  return result
}

const PAGE_LIMIT = 100

export function RootWordOccurrences({ rootWord }: { rootWord: string }) {
  const t = useTranslations('common')
  const tQuran = useTranslations('quran')
  const [occurrences, setOccurrences] = useState<WordOccurrence[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!rootWord) return

    wsApi
      .GET('/search', {
        params: {
          query: {
            root: rootWord,
            scope: 'words',
            include_words: true,
            include_root: true,
            include_meaning: true,
            word_langs: ['ar', 'en'],
            limit: PAGE_LIMIT,
            offset: 0,
          },
        },
      })
      .then(({ data, error }) => {
        if (error) {
          console.error('[RootWordOccurrences] API error for root', rootWord, error)
          setOccurrences([])
          setLoading(false)
          return
        }
        const results = data ? flattenWords(data) : []
        if (results.length === 0) {
          console.warn('[RootWordOccurrences] No results for root:', rootWord, 'response:', data)
        }
        setOccurrences(results)
        setTotal(data?.info?.total ?? 0)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[RootWordOccurrences] Network error for root', rootWord, err)
        setOccurrences([])
        setLoading(false)
      })
  }, [rootWord])

  const loadMore = () => {
    setLoadingMore(true)
    wsApi
      .GET('/search', {
        params: {
          query: {
            root: rootWord,
            scope: 'words',
            include_words: true,
            include_root: true,
            include_meaning: true,
            word_langs: ['ar', 'en'],
            limit: PAGE_LIMIT,
            offset: occurrences.length,
          },
        },
      })
      .then(({ data }) => {
        setOccurrences((prev) => [...prev, ...(data ? flattenWords(data) : [])])
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin size-6 text-primary" />
      </div>
    )
  }

  if (occurrences.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-10">
        {tQuran('noOccurrences')}
      </p>
    )
  }

  return (
    <div className="max-h-[45vh] overflow-y-auto pr-4 custom-scrollbar">
      <div className="flex flex-col gap-3">
        {occurrences.map((occ, i) => (
          <div
            key={`${occ.verse_key}:${occ.word_index}:${i}`}
            className="group relative bg-muted/20 hover:bg-muted/40 transition-all p-4 rounded-2xl border border-border/50 hover:border-primary/30"
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <QuranRef reference={occ.verse_key} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {t('word', { index: occ.word_index })}
                  </span>
                </div>
                {occ.english && (
<<<<<<< HEAD
                  <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-violet-600 transition-colors">
=======
                  <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
>>>>>>> main
                    {occ.english}
                  </p>
                )}
              </div>
              <div className="text-3xl font-arabic text-right text-foreground group-hover:text-primary transition-colors shrink-0">
                {occ.arabic}
              </div>
            </div>
          </div>
        ))}
      </div>
      {occurrences.length < total && (
        <div className="pt-3 pb-1 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {loadingMore && <Loader2 className="animate-spin size-3" />}
            {loadingMore
              ? t('loading')
              : t('loadMore', { shown: occurrences.length, total })}
          </button>
        </div>
      )}
    </div>
  )
}
