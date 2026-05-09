'use client'

import { use } from 'react'
import Link from 'next/link'
import { Library } from 'lucide-react'
import { useSharedCollection } from '@/hooks/use-collections'

export default function SharedCollectionPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const { shareToken } = use(params)
  const { data, isLoading, isError } = useSharedCollection(shareToken)

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-sm text-muted-foreground">
        Loading collection...
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-sm text-muted-foreground">
        Collection not found or no longer shared.
      </div>
    )
  }

  const col = data.data

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Library className="w-5 h-5 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">{col.name}</h1>
          {col.description && (
            <p className="text-sm text-muted-foreground">{col.description}</p>
          )}
        </div>
      </div>

      {col.verses.length === 0 ? (
        <p className="text-sm text-muted-foreground">This collection has no verses.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {col.verses.map((v) => {
            const [chapter, verse] = v.verse_key.split(':')
            const href = v.scripture === 'quran'
              ? `/quran/${chapter}?verse=${verse}`
              : `/bible/${v.verse_key}`
            return (
              <Link
                key={v.id}
                href={href}
                className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors"
              >
                <span className="text-sm font-medium font-mono">{v.verse_key}</span>
                {v.note && (
                  <span className="text-xs text-muted-foreground">{v.note}</span>
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  {v.scripture}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
