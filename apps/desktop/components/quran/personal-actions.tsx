'use client'

import { useState } from 'react'
import { Bookmark, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookmarksDialog } from '@web/app/quran/[[...query]]/mini-components/bookmarks-dialog'
import { NotesDialog } from './notes-dialog'

/**
 * Bookmarks and notes buttons in the reader toolbar. Desktop copy of the web
 * QuranPersonalActions without the sign-in checks: the local user is always
 * signed in.
 */
export function QuranPersonalActions() {
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

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
