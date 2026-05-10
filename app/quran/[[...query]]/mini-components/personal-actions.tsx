'use client'

import Link from 'next/link'
import { Bookmark, StickyNote } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function QuranPersonalActions() {
  const { data: session } = useSession()
  if (!session?.accessToken) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Bookmarks"
        asChild
      >
        <Link href="/me/bookmarks" prefetch={false}>
          <Bookmark className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Notes"
        asChild
      >
        <Link href="/me/notes" prefetch={false}>
          <StickyNote className="size-4" />
        </Link>
      </Button>
    </>
  )
}
