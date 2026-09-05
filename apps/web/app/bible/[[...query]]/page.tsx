import { wsApiServer } from '@/src/api/server-client'
import { bookFromSlug, OT_BOOKS, NT_BOOKS } from '@/constants/bible-books'
import { BibleReader } from './client-components/bible-reader'
import { BibleSearchResults } from './client-components/bible-search-results'
import BibleSearchBar from './client-components/bible-search-bar'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Suspense } from 'react'
import type { Metadata } from 'next'

type Props = { params: Promise<{ query?: string[] }>; searchParams: Promise<{ verse?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { query } = await params
  if (!query || query.length === 0) {
    return { title: 'The Holy Bible | Old & New Testament | WikiSubmission' }
  }
  const book = bookFromSlug(query[0])
  const chapter = query[1] ? parseInt(query[1]) : 1
  if (!book) return { title: 'The Holy Bible | WikiSubmission' }
  return {
    title: `${book.bk} ${chapter} | Bible | WikiSubmission`,
  }
}

export default async function BiblePage({ params, searchParams }: Props) {
  const { query } = await params

  // ── Home (/bible) ──────────────────────────────────────────────────────────
  if (!query || query.length === 0) {
    const totalChapters = OT_BOOKS.reduce((acc, b) => acc + b.cc, 0) + NT_BOOKS.reduce((acc, b) => acc + b.cc, 0)
    const totalVerses = OT_BOOKS.reduce((acc, b) => acc + b.vc, 0) + NT_BOOKS.reduce((acc, b) => acc + b.vc, 0)

    return (
      <main className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-12 sm:space-y-14">
          {/* ── Hero Header ─────────────────────────────────────────── */}
          <header className="space-y-6 text-center max-w-xl mx-auto">
            <div className="space-y-2.5">
              <p
                style={{
                  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                  fontWeight: 600,
                }}
              >
                Scripture / The Holy Bible
              </p>
              <h1
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(36px, 6vw, 52px)',
                  fontWeight: 500,
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  color: 'var(--ed-fg)',
                  margin: 0,
                }}
              >
                Old &amp; New Testament
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                  fontStyle: 'italic',
                  color: 'var(--ed-fg-muted)',
                  lineHeight: 1.6,
                  maxWidth: '46ch',
                  margin: '8px auto 0',
                }}
              >
                The foundational scriptures of the Old and New Testaments in English translation.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Suspense>
                <BibleSearchBar className="w-full max-w-none" large />
              </Suspense>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3.5 pt-1 text-xs text-[var(--ed-fg-muted)]">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px]"
                style={{
                  backgroundColor: 'var(--ed-surface)',
                  borderColor: 'var(--ed-rule)',
                  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                }}
              >
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>66</strong> Books
              </span>
              <span style={{ color: 'var(--ed-rule)' }} className="font-mono">·</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px]"
                style={{
                  backgroundColor: 'var(--ed-surface)',
                  borderColor: 'var(--ed-rule)',
                  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                }}
              >
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>{totalChapters.toLocaleString()}</strong> Chapters
              </span>
              <span style={{ color: 'var(--ed-rule)' }} className="font-mono">·</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px]"
                style={{
                  backgroundColor: 'var(--ed-surface)',
                  borderColor: 'var(--ed-rule)',
                  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                }}
              >
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>{totalVerses.toLocaleString()}</strong> Verses
              </span>
            </div>
          </header>

          {/* ── Old Testament ────────────────────────────────────────── */}
          <section className="space-y-4">
            <div
              className="flex items-baseline justify-between gap-3 pb-2.5 border-b"
              style={{ borderColor: 'var(--ed-rule)' }}
            >
              <div className="flex items-baseline gap-2.5">
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-accent)',
                    fontWeight: 600,
                  }}
                >
                  39
                </span>
                <span style={{ color: 'var(--ed-rule)' }}>/</span>
                <h2
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: '-0.015em',
                    color: 'var(--ed-fg)',
                    margin: 0,
                  }}
                >
                  Old Testament
                </h2>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: 'var(--ed-fg-muted)',
                }}
              >
                Torah, History &amp; Prophets
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {OT_BOOKS.map((book) => (
                <Link
                  key={book.bn}
                  href={`/bible/${book.slug}/1`}
                  className="group flex items-center justify-between gap-2 p-3.5 rounded-lg border transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--ed-surface)',
                    borderColor: 'var(--ed-rule)',
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate group-hover:text-[var(--ed-accent)] transition-colors"
                      style={{
                        fontFamily: 'var(--font-source-serif), Georgia, serif',
                        color: 'var(--ed-fg)',
                      }}
                    >
                      {book.bk}
                    </p>
                    <p
                      className="text-[10px] font-mono mt-0.5"
                      style={{ color: 'var(--ed-fg-muted)' }}
                    >
                      <span style={{ color: 'var(--ed-accent)', opacity: 0.85 }}>{book.cc} ch</span> · {book.vc} v
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 text-[var(--ed-fg-muted)] shrink-0 group-hover:text-[var(--ed-accent)] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>

          {/* ── New Testament ────────────────────────────────────────── */}
          <section className="space-y-4">
            <div
              className="flex items-baseline justify-between gap-3 pb-2.5 border-b"
              style={{ borderColor: 'var(--ed-rule)' }}
            >
              <div className="flex items-baseline gap-2.5">
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-accent)',
                    fontWeight: 600,
                  }}
                >
                  27
                </span>
                <span style={{ color: 'var(--ed-rule)' }}>/</span>
                <h2
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: '-0.015em',
                    color: 'var(--ed-fg)',
                    margin: 0,
                  }}
                >
                  New Testament
                </h2>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: 'var(--ed-fg-muted)',
                }}
              >
                Gospels, Acts &amp; Epistles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {NT_BOOKS.map((book) => (
                <Link
                  key={book.bn}
                  href={`/bible/${book.slug}/1`}
                  className="group flex items-center justify-between gap-2 p-3.5 rounded-lg border transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--ed-surface)',
                    borderColor: 'var(--ed-rule)',
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate group-hover:text-[var(--ed-accent)] transition-colors"
                      style={{
                        fontFamily: 'var(--font-source-serif), Georgia, serif',
                        color: 'var(--ed-fg)',
                      }}
                    >
                      {book.bk}
                    </p>
                    <p
                      className="text-[10px] font-mono mt-0.5"
                      style={{ color: 'var(--ed-fg-muted)' }}
                    >
                      <span style={{ color: 'var(--ed-accent)', opacity: 0.85 }}>{book.cc} ch</span> · {book.vc} v
                    </p>
                  </div>
                  <ChevronRight className="size-3.5 text-[var(--ed-fg-muted)] shrink-0 group-hover:text-[var(--ed-accent)] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  // ── /bible/search?q=... ────────────────────────────────────────────────────
  if (query[0] === 'search') {
    return (
      <Suspense>
        <BibleSearchResults />
      </Suspense>
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
    data?.books?.flatMap(
      (b) => b.chapters?.flatMap((c) => c.verses ?? []) ?? []
    ) ?? []

  const { verse } = await searchParams
  const initialVerse = verse ? parseInt(verse) : undefined

  return (
    <BibleReader
      book={book}
      chapter={chapter}
      initialVerses={initialVerses}
      hasError={!!error}
      initialVerse={initialVerse}
    />
  )
}
