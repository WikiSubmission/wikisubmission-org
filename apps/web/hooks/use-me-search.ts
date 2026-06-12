'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { NoteData, SearchResultData } from '@/types/bookmarks'

function plainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[`*_>#~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildExcerpt(content: string, q: string): string {
  const clean = plainText(content)
  if (!clean) return ''
  const lower = clean.toLowerCase()
  const qLower = q.toLowerCase()
  const i = lower.indexOf(qLower)
  if (i < 0) return clean.slice(0, 160)
  const start = Math.max(0, i - 48)
  const end = Math.min(clean.length, i + q.length + 96)
  return clean.slice(start, end).trim()
}

function localNoteMatches(notes: NoteData[], q: string): SearchResultData[] {
  const query = q.trim().toLowerCase()
  if (!query) return []
  return notes
    .filter((note) => {
      if (note.verse_key.toLowerCase().includes(query)) return true
      return plainText(note.content).toLowerCase().includes(query)
    })
    .map((note) => ({
      source: 'note',
      verse_key: note.verse_key,
      scripture: note.scripture,
      excerpt: buildExcerpt(note.content, q),
    }))
}

export function useMeSearch(q: string, scripture?: string): SearchResultData[] {
  const { data: session } = useSession()
  const trimmed = q.trim()
  const enabled = !!session?.accessToken && trimmed.length > 0

  const { data: remote } = useQuery<{ data: SearchResultData[] }>({
    queryKey: ['me-search', trimmed, scripture],
    queryFn: () => meApi.searchNotes(trimmed, scripture),
    enabled,
    staleTime: 30_000,
  })

  const { data: localNotes } = useQuery<{ data: NoteData[] }>({
    queryKey: ['notes', scripture ?? 'all'],
    queryFn: async () => {
      if (scripture) return meApi.getNotes(scripture)
      const [quran, bible] = await Promise.all([
        meApi.getNotes('quran'),
        meApi.getNotes('bible'),
      ])
      return { data: [...quran.data, ...bible.data] }
    },
    enabled,
    staleTime: 30_000,
  })

  return useMemo(() => {
    const merged = new Map<string, SearchResultData>()
    const local = localNoteMatches(localNotes?.data ?? [], trimmed)
    const remoteResults = remote?.data ?? []
    for (const item of remoteResults) {
      merged.set(`${item.scripture}:${item.verse_key}`, item)
    }
    for (const item of local) {
      const key = `${item.scripture}:${item.verse_key}`
      if (!merged.has(key)) merged.set(key, item)
    }
    return Array.from(merged.values())
  }, [localNotes?.data, remote?.data, trimmed])
}
