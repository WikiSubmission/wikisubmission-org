'use client'

import { useState, useEffect } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import { Loader2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

type WordData = components['schemas']['WordData']

interface WordOccurrence {
  verse_key: string        // "1:7"
  chapter_number: number
  verse_number: number
  word_index: number
  arabic: string
  english: string
  root: string
}

/** Flattens a QuranResponse (chapters → verses → words) into a flat list of occurrences */
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
          english: word.m ?? word.tx?.['en'] ?? '',
          root: word.r ?? '',
        })
      }
    }
  }
  return result
}

export function RootWordOccurrences({ rootWord }: { rootWord: string }) {
  const [occurrences, setOccurrences] = useState<WordOccurrence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rootWord) return

    setLoading(true)

    wsApi
      .GET('/search', {
        params: {
          query: {
            q: rootWord,
            scope: 'words',
            include_words: true,
            include_root: true,
            include_meaning: true,
            word_langs: ['ar', 'en'],
            limit: 100,
          },
        },
      })
      .then(({ data }) => {
        setOccurrences(data ? flattenWords(data) : [])
      })
      .catch(() => setOccurrences([]))
      .finally(() => setLoading(false))
  }, [rootWord])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin size-6 text-violet-600" />
      </div>
    )
  }

  return (
    <div className="max-h-[45vh] overflow-y-auto pr-4 custom-scrollbar">
      <div className="space-y-3">
        {occurrences.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No other occurrences found.
          </p>
        ) : (
          occurrences.map((occ, idx) => (
            <div
              key={idx}
              className="group relative bg-muted/20 hover:bg-muted/40 transition-all p-4 rounded-2xl border border-border/50 hover:border-violet-600/30"
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quran/${occ.chapter_number}?verse=${occ.verse_number}&word=${occ.word_index}`}
                      className="text-[10px] font-bold text-violet-600/80 hover:text-violet-600 flex items-center gap-1 uppercase tracking-widest transition-colors"
                      target="_blank"
                    >
                      {occ.verse_key} - WORD #{occ.word_index}
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-violet-600 transition-colors">
                    {occ.english}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter italic">
                    {occ.root}
                  </p>
                </div>
                <div className="text-3xl font-arabic text-right text-foreground group-hover:text-violet-600 transition-colors shrink-0">
                  {occ.arabic}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
