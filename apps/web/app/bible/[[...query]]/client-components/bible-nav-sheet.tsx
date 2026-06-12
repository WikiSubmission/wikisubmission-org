'use client'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Book, ChevronDown, ChevronRight, MenuIcon, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS, chapterRange } from '@/constants/bible-books'
import type { BibleBook } from '@/constants/bible-books'

type Testament = 'OT' | 'NT'

// TODO: Localize Bible book/chapter titles once the Bible API exposes translated title data.

function BookRow({
  book,
  isActive,
  onChapterSelect,
}: {
  book: BibleBook
  isActive: boolean
  onChapterSelect: (ch: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left',
          isActive
            ? 'bg-primary/15 text-primary border border-primary/20'
            : 'hover:bg-accent/60 text-foreground/80 hover:text-foreground border border-transparent'
        )}
      >
        <span
          className={cn(
            'shrink-0 flex items-center justify-center size-8 rounded-lg font-mono text-xs font-bold',
            isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          {book.bn}
        </span>
        <span className="flex-1 min-w-0 text-sm font-medium truncate">{book.bk}</span>
        <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
          {book.cc} chapters
        </span>
        {expanded ? (
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-2 pt-1">
          <div className="grid grid-cols-6 gap-1">
            {chapterRange(book).map((ch) => (
              <SheetClose key={ch} asChild>
                <button
                  onClick={() => onChapterSelect(ch)}
                  className={cn(
                    'text-xs font-mono py-1.5 rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {ch}
                </button>
              </SheetClose>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NavSheetContent() {
  const params = useParams()
  const router = useRouter()
  const [testament, setTestament] = useState<Testament>('NT')
  const [search, setSearch] = useState('')

  const queryArr = params.query as string[] | undefined
  const activeSlug = queryArr?.[0]
  const activeBook = activeSlug
    ? BIBLE_BOOKS.find((b) => b.slug === activeSlug || b.bn === parseInt(activeSlug))
    : undefined

  const books = testament === 'OT' ? OT_BOOKS : NT_BOOKS
  const filtered = search
    ? books.filter(
        (b) =>
          b.bk.toLowerCase().includes(search.toLowerCase()) ||
          b.bn.toString().includes(search)
      )
    : books

  function handleChapterSelect(book: BibleBook, ch: number) {
    router.push(`/bible/${book.slug}/${ch}`)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Testament tabs */}
      <div className="px-3 pt-3 pb-2 border-b border-border/40 space-y-2">
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/40">
          {(['OT', 'NT'] as Testament[]).map((t) => (
            <button
              key={t}
              onClick={() => setTestament(t)}
              className={cn(
                'flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors',
                testament === t
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'OT' ? 'Old Testament' : 'New Testament'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder="Search books…"
            className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Book list */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {filtered.map((book) => (
          <BookRow
            key={book.bn}
            book={book}
            isActive={activeBook?.bn === book.bn}
            onChapterSelect={(ch) => handleChapterSelect(book, ch)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No books found</p>
        )}
      </div>

      {/* Footer link */}
      <div className="px-3 py-2 border-t border-border/40">
        <SheetClose asChild>
          <Link
            href="/bible"
            className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            All books
            <ChevronRight className="size-3.5" />
          </Link>
        </SheetClose>
      </div>
    </div>
  )
}

export function BibleNavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Open Bible navigation"
          className="shrink-0 h-8 px-2 gap-1.5"
        >
          <MenuIcon className="size-4 shrink-0" />
          <span className="hidden sm:inline text-xs font-medium">Navigate</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[310px] gap-0">
        <SheetHeader className="px-4 py-3 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <Book className="size-4 text-primary/70" />
            Bible
          </SheetTitle>
        </SheetHeader>
        <NavSheetContent />
      </SheetContent>
    </Sheet>
  )
}
