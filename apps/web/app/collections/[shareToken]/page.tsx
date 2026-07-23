'use client'

import { use } from 'react'
import Link from 'next/link'
import { BookmarkPlus, Check, Library } from 'lucide-react'
import { useSharedCollection, useSubscribeCollection } from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function SharedCollectionPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const { shareToken } = use(params)
  const { data: session } = useSession()
  const { data, isLoading, isError, refetch } = useSharedCollection(shareToken)
  const { mutate: subscribe, isPending: subscribing } = useSubscribeCollection()

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
  const isSubscribed = col.is_subscribed === true
  const isOwner = col.relation === 'owner'

  function handleSubscribe() {
    subscribe(shareToken, {
      onSuccess: () => {
        toast.success('Added to your collections')
        refetch()
      },
      onError: () => {
        toast.error('Could not add collection')
      },
    })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Library className="w-5 h-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">{col.name}</h1>
            {col.description && (
              <p className="text-sm text-muted-foreground truncate">{col.description}</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {col.verses.length} {col.verses.length === 1 ? 'verse' : 'verses'}
            </p>
          </div>
        </div>

        {session && !isOwner && (
          <div className="shrink-0">
            {isSubscribed ? (
              <Button variant="outline" size="sm" disabled className="gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Saved
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={subscribing}
                className="gap-1.5"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Add to my collections
              </Button>
            )}
          </div>
        )}

        {session && isOwner && (
          <Link href="/me/collections">
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </Link>
        )}
      </div>

      {col.verses.length === 0 ? (
        <p className="text-sm text-muted-foreground">This collection has no verses.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {col.verses.map((v) => {
            const [chapter, verse] = v.verse_key.split(':')
            const href =
              v.scripture === 'quran'
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
