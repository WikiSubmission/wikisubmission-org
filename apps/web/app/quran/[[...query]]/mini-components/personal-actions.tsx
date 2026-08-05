'use client'

import { useState } from 'react'
import { Bookmark, StickyNote } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { BookmarksDialog } from './bookmarks-dialog'
import { NotesDialog } from './notes-dialog'

export function QuranPersonalActions() {
  const { data: session } = useSession()
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

  if (!session?.accessToken) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Bookmarks"
        onClick={() => setBookmarksOpen(true)}
      >
        <Bookmark className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Notes"
        onClick={() => setNotesOpen(true)}
      >
        <StickyNote className="size-4" />
      </Button>

      <BookmarksDialog open={bookmarksOpen} onOpenChange={setBookmarksOpen} />
      <NotesDialog open={notesOpen} onOpenChange={setNotesOpen} />
    </>
  )
}
