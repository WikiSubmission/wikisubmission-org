'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StickyNote, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { NoteData } from '@/types/bookmarks'

function useAllNotes(scripture: string) {
  const { data: session } = useSession()
  const { data } = useQuery<{ data: NoteData[] }>({
    queryKey: ['notes', scripture],
    queryFn: () => meApi.getNotes(scripture),
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  })
  return data?.data ?? []
}

export default function NotesPage() {
  const quranNotes = useAllNotes('quran')
  const bibleNotes = useAllNotes('bible')
  const [filter, setFilter] = useState('')

  const allNotes = [...quranNotes, ...bibleNotes]
  const filtered = filter.trim()
    ? allNotes.filter(
        (n) =>
          n.content.toLowerCase().includes(filter.toLowerCase()) ||
          n.verse_key.includes(filter)
      )
    : allNotes

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Notes</h1>

      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"
          placeholder="Search notes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filter ? 'No notes match your search.' : 'No notes yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((n) => {
            const [chapter, verse] = n.verse_key.split(':')
            const href = n.scripture === 'quran'
              ? `/quran/${chapter}?verse=${verse}`
              : `/bible/${n.verse_key}`
            return (
              <div key={n.id} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                <Link href={href} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground">{n.verse_key}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    {n.scripture}
                  </span>
                </Link>
                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
