import { wsApiServer } from '@/src/api/server-client'
import { bookFromSlug, BIBLE_BOOKS, OT_BOOKS, NT_BOOKS } from '@/constants/bible-books'
import { BibleReader } from './client-components/bible-reader'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { params: Promise<{ query?: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { query } = await params
  if (!query || query.length === 0) {
    return { title: 'Bible | WikiSubmission' }
  }
  const book = bookFromSlug(query[0])
  const chapter = query[1] ? parseInt(query[1]) : 1
  if (!book) return { title: 'Bible | WikiSubmission' }
  return {
    title: `${book.bk} ${chapter} | Bible | WikiSubmission`,
  }
}

export default async function BiblePage({ params }: Props) {
  const { query } = await params

  // ── Home (/bible) ──────────────────────────────────────────────────────────
  if (!query || query.length === 0) {
    return (
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-10">
          <header className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Scripture
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">Bible</h1>
            <p className="text-sm text-muted-foreground">
              Old &amp; New Testament — English translation
            </p>
          </header>

          {/* OT */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
              Old Testament — {OT_BOOKS.length} books
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OT_BOOKS.map((book) => (
                <Link
                  key={book.bn}
                  href={`/bible/${book.slug}/1`}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border/40 hover:bg-accent/50 hover:border-primary/20 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{book.bk}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {book.cc} ch · {book.vc} v
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* NT */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
              New Testament — {NT_BOOKS.length} books
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NT_BOOKS.map((book) => (
                <Link
                  key={book.bn}
                  href={`/bible/${book.slug}/1`}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border/40 hover:bg-accent/50 hover:border-primary/20 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{book.bk}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {book.cc} ch · {book.vc} v
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  // ── /bible/[book] — redirect to chapter 1 ─────────────────────────────────
  if (query.length === 1) {
    const book = bookFromSlug(query[0])
    if (!book) {
      return (
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Book not found.</p>
        </main>
      )
    }
    redirect(`/bible/${book.slug}/1`)
  }

  // ── /bible/[book]/[chapter] ────────────────────────────────────────────────
  const book = bookFromSlug(query[0])
  const chapter = parseInt(query[1])

  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.cc) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chapter not found.</p>
      </main>
    )
  }

  // SSR — fetch first chapter for immediate render
  const { data, error } = await wsApiServer.GET('/bible', {
    params: {
      query: {
        book: book.bn,
        chapter_start: chapter,
        langs: ['en'],
      },
    },
    next: { revalidate: 86400 },
  })

  const initialVerses =
    data?.books?.flatMap((b) => b.chapters?.flatMap((c) => c.verses ?? []) ?? []) ?? []

  return (
    <BibleReader
      book={book}
      chapter={chapter}
      initialVerses={initialVerses}
      hasError={!!error}
    />
  )
}
