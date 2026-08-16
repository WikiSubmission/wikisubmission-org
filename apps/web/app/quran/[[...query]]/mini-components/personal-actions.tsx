'use client'

import { useState } from 'react'
import { Bookmark, StickyNote } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useAuthRequired } from '@/hooks/use-auth-required'
import { BookmarksDialog } from './bookmarks-dialog'
import { NotesDialog } from './notes-dialog'

export function QuranPersonalActions() {
  const { data: session } = useSession()
  const withAuth = useAuthRequired()
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Bookmarks"
        onClick={withAuth(() => setBookmarksOpen(true))}
      >
        <Bookmark className="size-4" />
      </Button>
      {session?.accessToken && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Notes"
          onClick={() => setNotesOpen(true)}
        >
          <StickyNote className="size-4" />
        </Button>
      )}

      {session?.accessToken && (
        <>
          <BookmarksDialog open={bookmarksOpen} onOpenChange={setBookmarksOpen} />
          <NotesDialog open={notesOpen} onOpenChange={setNotesOpen} />
        </>
      )}
    </>
  )
}
