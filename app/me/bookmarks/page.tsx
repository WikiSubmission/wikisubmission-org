'use client'

import Link from 'next/link'
import { Bookmark, Trash2 } from 'lucide-react'
import { useBookmarksList, useDeleteBookmark } from '@/hooks/use-bookmarks'
import { Button } from '@/components/ui/button'
import type { BookmarkData } from '@/types/bookmarks'

function BookmarkItem({ bm, onDelete }: { bm: BookmarkData; onDelete: () => void }) {
  const [chapter, verse] = bm.verse_key.split(':')
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
      <Bookmark
        className={`w-4 h-4 shrink-0 ${bm.kind === 'cover_to_cover' ? 'text-blue-500' : 'text-amber-500'}`}
        fill="currentColor"
      />
      <Link
        href={`/quran/${chapter}?verse=${verse}`}
        className="flex-1 min-w-0"
      >
        <p className="text-sm font-medium truncate">{bm.name || bm.verse_key}</p>
        <p className="text-xs text-muted-foreground font-mono">{bm.verse_key}</p>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

export default function BookmarksPage() {
  const quranBookmarks = useBookmarksList('quran')
  const bibleBookmarks = useBookmarksList('bible')
  const { mutate: deleteQuran } = useDeleteBookmark('quran')
  const { mutate: deleteBible } = useDeleteBookmark('bible')

  const sorted = (bms: BookmarkData[]) =>
    [...bms].sort((a, b) =>
      a.kind === 'cover_to_cover' ? -1 : b.kind === 'cover_to_cover' ? 1 : 0
    )

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Bookmarks</h1>

      {quranBookmarks.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Quran</h2>
          {sorted(quranBookmarks).map((bm) => (
            <BookmarkItem
              key={bm.id}
              bm={bm}
              onDelete={() => deleteQuran({ id: bm.id, verseKey: bm.verse_key })}
            />
          ))}
        </section>
      )}

      {bibleBookmarks.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Bible</h2>
          {sorted(bibleBookmarks).map((bm) => (
            <BookmarkItem
              key={bm.id}
              bm={bm}
              onDelete={() => deleteBible({ id: bm.id, verseKey: bm.verse_key })}
            />
          ))}
        </section>
      )}

      {quranBookmarks.length === 0 && bibleBookmarks.length === 0 && (
        <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
      )}
    </div>
  )
}
