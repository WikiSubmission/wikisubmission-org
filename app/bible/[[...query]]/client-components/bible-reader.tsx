'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBiblePreferences } from '@/hooks/use-bible-preferences'
import { wsApi } from '@/src/api/client'
import BibleVerseCard from '../mini-components/verse-card'
import { BibleReadingView } from '../mini-components/reading-view'
import type { BibleBook } from '@/constants/bible-books'
import type { components } from '@/src/api/types.gen'

type BibleVerseData = components['schemas']['BibleVerseData']

type FootnoteDialogState =
  | { kind: 'manuscript'; text: string; label: string }
  | { kind: 'theological'; entries: string[]; label: string }
  | null

function FootnoteDialog({
  state,
  onClose,
}: {
  state: FootnoteDialogState
  onClose: () => void
}) {
  return (
    <Dialog open={state !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-violet-600 text-sm">
            {state?.label ?? ''}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 -mr-1">
          {state?.kind === 'manuscript' && (
            <p className="text-sm leading-relaxed text-foreground">{state.text}</p>
          )}
          {state?.kind === 'theological' && (
            <ul className="space-y-2">
              {state.entries.map((e, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-foreground border-b last:border-0 pb-2"
                >
                  <span className="font-mono text-[10px] text-violet-500 mr-1">{i + 1}.</span>
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type Props = {
  book: BibleBook
  chapter: number
  initialVerses: BibleVerseData[]
  hasError: boolean
}

export function BibleReader({ book, chapter, initialVerses, hasError }: Props) {
  const prefs = useBiblePreferences()
  const router = useRouter()

  const [verses, setVerses] = useState<BibleVerseData[]>(initialVerses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(hasError ? 'Failed to load chapter.' : null)
  const [footnoteDialog, setFootnoteDialog] = useState<FootnoteDialogState>(null)

  const navigate = useCallback(
    async (targetChapter: number) => {
      if (targetChapter < 1 || targetChapter > book.cc) return
      router.push(`/bible/${book.slug}/${targetChapter}`)
      // Optimistic clear + fetch for client-side nav feel
      setLoading(true)
      setVerses([])
      setError(null)

      const { data, error: err } = await wsApi.GET('/bible', {
        params: {
          query: {
            book: book.bn,
            chapter_start: targetChapter,
            langs: ['en'],
          },
        },
      })

      const fetched =
        data?.books?.flatMap((b) => b.chapters?.flatMap((c) => c.verses ?? []) ?? []) ?? []
      setVerses(fetched)
      setError(err ? 'Failed to load chapter.' : null)
      setLoading(false)
    },
    [book, router]
  )

  const prevChapter = chapter > 1 ? chapter - 1 : null
  const nextChapter = chapter < book.cc ? chapter + 1 : null

  // Build manuscript footnote offsets for verse-mode numbering
  let manuscriptOffset = 0
  let theologicalOffset = 0

  return (
    <main className="min-h-screen">
      {/* Chapter header */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            {book.t === 'OT' ? 'Old Testament' : 'New Testament'}
          </p>
          <h1 className="text-2xl font-bold">
            {book.bk}{' '}
            <span className="text-muted-foreground font-normal">{chapter}</span>
          </h1>
        </div>

        {/* Prev / Next chapter */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => prevChapter && navigate(prevChapter)}
            disabled={!prevChapter || loading}
            aria-label="Previous chapter"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => nextChapter && navigate(nextChapter)}
            disabled={!nextChapter || loading}
            aria-label="Next chapter"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      )}

      {error && !loading && (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && prefs.displayMode === 'reading' && (
        <BibleReadingView
          verses={verses}
          showManuscript={prefs.manuscriptFootnotes}
          showTheological={prefs.theologicalFootnotes}
        />
      )}

      {!loading && !error && prefs.displayMode === 'verse' && (
        <>
          <div className="max-w-2xl mx-auto px-4 pb-8 space-y-1">
            {verses.map((verse) => {
              const tr = verse.tr?.['en']
              const hasManuscript = prefs.manuscriptFootnotes && !!tr?.f
              const hasTheological =
                prefs.theologicalFootnotes && tr?.fn && tr.fn.length > 0

              const mOff = manuscriptOffset
              const tOff = theologicalOffset
              if (hasManuscript) manuscriptOffset++
              if (hasTheological) theologicalOffset += tr!.fn!.length

              return (
                <BibleVerseCard
                  key={verse.vk}
                  verse={verse}
                  showManuscript={prefs.manuscriptFootnotes}
                  showTheological={prefs.theologicalFootnotes}
                  manuscriptOffset={mOff}
                  theologicalOffset={tOff}
                  onFootnoteClick={(text, label) =>
                    setFootnoteDialog({ kind: 'manuscript', text, label })
                  }
                  onTheologicalClick={(entries, label) =>
                    setFootnoteDialog({ kind: 'theological', entries, label })
                  }
                />
              )
            })}
          </div>

          {/* Verse-mode: chapter footnote list at the bottom */}
          {(prefs.manuscriptFootnotes || prefs.theologicalFootnotes) && (
            <ChapterFootnotes
              verses={verses}
              showManuscript={prefs.manuscriptFootnotes}
              showTheological={prefs.theologicalFootnotes}
            />
          )}
        </>
      )}

      {/* Prev / Next chapter nav — bottom */}
      {!loading && (
        <div className="max-w-2xl mx-auto px-4 py-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => prevChapter && navigate(prevChapter)}
            disabled={!prevChapter}
            className="gap-1.5 text-sm text-muted-foreground"
          >
            <ChevronLeft className="size-4" />
            {prevChapter ? `Chapter ${prevChapter}` : ''}
          </Button>
          <Button
            variant="ghost"
            onClick={() => nextChapter && navigate(nextChapter)}
            disabled={!nextChapter}
            className="gap-1.5 text-sm text-muted-foreground"
          >
            {nextChapter ? `Chapter ${nextChapter}` : ''}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <FootnoteDialog
        state={footnoteDialog}
        onClose={() => setFootnoteDialog(null)}
      />
    </main>
  )
}

/** Collects all footnotes across the chapter and renders them as a numbered list. */
function ChapterFootnotes({
  verses,
  showManuscript,
  showTheological,
}: {
  verses: BibleVerseData[]
  showManuscript: boolean
  showTheological: boolean
}) {
  const manuscriptNotes: { vn: number; text: string; idx: number }[] = []
  const theologicalNotes: { vn: number; text: string; idx: number }[] = []
  let mIdx = 0
  let tIdx = 0

  for (const verse of verses) {
    const tr = verse.tr?.['en']
    const vn = verse.vn ?? 0
    if (showManuscript && tr?.f) {
      manuscriptNotes.push({ vn, text: tr.f, idx: mIdx++ })
    }
    if (showTheological && tr?.fn) {
      for (const entry of tr.fn) {
        theologicalNotes.push({ vn, text: entry, idx: tIdx++ })
      }
    }
  }

  if (manuscriptNotes.length === 0 && theologicalNotes.length === 0) return null

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12 space-y-6 border-t border-border/40 pt-6">
      {manuscriptNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Manuscript Notes
          </p>
          <ol className="space-y-2">
            {manuscriptNotes.map(({ vn, text, idx }) => (
              <li key={idx} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="font-mono shrink-0 text-foreground/40">[{idx + 1}]</span>
                <span>
                  <span className="font-mono text-foreground/40 mr-1">v.{vn}</span>
                  {text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {theologicalNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Theological Notes
          </p>
          <ol className="space-y-2">
            {theologicalNotes.map(({ vn, text, idx }) => (
              <li key={idx} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="font-mono shrink-0 text-violet-500/60">*{idx + 1}</span>
                <span>
                  <span className="font-mono text-foreground/40 mr-1">v.{vn}</span>
                  {text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
