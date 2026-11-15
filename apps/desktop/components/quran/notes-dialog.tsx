'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StickyNote, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { meApi } from '@/src/api/me-client'
import type { NoteData } from '@/types/bookmarks'

/**
 * Desktop copy of the web reader's notes dialog. The web version waits for a
 * next-auth session and also lists Bible notes; here the local user is always
 * signed in and the app is Quran-only.
 */
export function NotesDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data } = useQuery<{ data: NoteData[] }>({
    queryKey: ['notes', 'quran'],
    queryFn: () => meApi.getNotes('quran'),
    enabled: open,
    staleTime: 30_000,
  })
  const [filter, setFilter] = useState('')

  const notes = data?.data ?? []
  const needle = filter.trim().toLowerCase()
  const filtered = needle
    ? notes.filter((n) => n.content.toLowerCase().includes(needle) || n.verse_key.includes(filter.trim()))
    : notes

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-0 gap-0" aria-describedby={undefined}>
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
          <DialogTitle className="text-base font-semibold">Notes</DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-3 pb-2 border-b border-border/30">
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"
              placeholder="Search notes..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {filter ? 'No notes match your search.' : 'No notes yet.'}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((n) => {
                const [chapter, verse] = n.verse_key.split(':')
                return (
                  <div key={n.id} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                    <Link
                      href={`/quran/${chapter}/?verse=${verse}`}
                      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                      onClick={() => onOpenChange(false)}
                    >
                      <StickyNote className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground">{n.verse_key}</span>
                    </Link>
                    <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
