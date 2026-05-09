'use client'

import { use } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useCollectionDetail, useRemoveVerseFromCollection } from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const collectionId = parseInt(id, 10)
  const { data, isLoading } = useCollectionDetail(collectionId)
  const { mutate: removeVerse } = useRemoveVerseFromCollection()

  if (isLoading) {
    return <div className="max-w-lg mx-auto px-4 py-12 text-sm text-muted-foreground">Loading...</div>
  }

  const col = data?.data
  if (!col) {
    return <div className="max-w-lg mx-auto px-4 py-12 text-sm text-muted-foreground">Collection not found.</div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{col.name}</h1>
        {col.description && (
          <p className="text-sm text-muted-foreground mt-1">{col.description}</p>
        )}
      </div>

      {col.verses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verses yet. Add verses from the reader.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {col.verses.map((v) => {
            const [chapter, verse] = v.verse_key.split(':')
            const href = v.scripture === 'quran'
              ? `/quran/${chapter}?verse=${verse}`
              : `/bible/${v.verse_key}`
            return (
              <div
                key={v.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors"
              >
                <Link href={href} className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-mono">{v.verse_key}</p>
                  {v.note && (
                    <p className="text-xs text-muted-foreground truncate">{v.note}</p>
                  )}
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    {v.scripture}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeVerse({ collectionId: collectionId, verseId: v.id })}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
