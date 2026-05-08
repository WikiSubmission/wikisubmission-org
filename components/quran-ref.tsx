'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useVerseFetch, useBibleFetch } from '@/hooks/use-verse-fetch'
import { parseQuranRef, parseBibleRef } from '@/lib/scripture-parser'
import { VerseCard } from '@/app/quran/[[...query]]/mini-components/verse-card'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'

type BibleVerseData = components['schemas']['BibleVerseData']

function BibleVersePreview({
  verse,
  bookDisplay,
}: {
  verse: BibleVerseData
  bookDisplay: string
}) {
  const parts = (verse.vk ?? '').split(':')
  const cn = parts[1] ? parseInt(parts[1]) : null
  const vn = parts[2] ? parseInt(parts[2]) : null
  const tr = verse.tr?.['en']

  return (
    <div className="space-y-2 py-3 border-b last:border-0">
      <span className="text-xs text-primary font-glacial font-bold">
        {bookDisplay} {cn}:{vn}
      </span>
      {tr?.tx && (
        <p className="text-sm leading-relaxed">{tr.tx}</p>
      )}
      {tr?.f && (
        <p className="text-sm text-muted-foreground italic">{tr.f}</p>
      )}
    </div>
  )
}

/** Inline badge that opens a dialog showing the verse(s) on click.
 *
 *  Supports both Quran and Bible references:
 *    Quran:  <ScriptureRef reference="2:255" />
 *            <ScriptureRef reference="1:1-7" from="Appendix 1" />
 *    Bible:  <ScriptureRef reference="Mark 4:12" />
 *            <ScriptureRef reference="40:5:3" />     ← numeric (book 40 = Matthew)
 *            <ScriptureRef reference="1 Sam 3:1-5" />
 */
export function ScriptureRef({
  reference,
  from,
}: {
  reference: string
  from?: string
}) {
  const prefs = useQuranPreferences()
  const { verses: quranVerses, loading: quranLoading, error: quranError, fetch: fetchQuran } = useVerseFetch()
  const { verses: bibleVerses, loading: bibleLoading, error: bibleError, fetch: fetchBible } = useBibleFetch()
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const bibleRef = parseBibleRef(reference)
  const isBible = bibleRef !== null
  const quranRef = isBible ? null : parseQuranRef(reference)

  const primaryCode: LangCode =
    prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'

  const doQuranFetch = useCallback(
    (ref: string) =>
      fetchQuran(ref, primaryCode, {
        secondaryLang: prefs.secondaryLanguage,
        includeWords: prefs.wordByWord,
      }),
    [fetchQuran, primaryCode, prefs.secondaryLanguage, prefs.wordByWord]
  )

  const handleBack = useCallback(() => {
    setHistory((prev) => {
      const next = prev.slice(0, -1)
      doQuranFetch(next[next.length - 1] ?? reference)
      return next
    })
  }, [doQuranFetch, reference])

  // If unparseable, render plain text so we don't swallow content
  if (!isBible && !quranRef) {
    return <span className="font-glacial text-[0.85em] font-bold">{reference}</span>
  }

  // Badge label
  const label = (() => {
    if (isBible && bibleRef) {
      const suffix = bibleRef.ve !== bibleRef.vs ? `–${bibleRef.ve}` : ''
      return `${bibleRef.displayBook} ${bibleRef.cs}:${bibleRef.vs}${suffix}`
    }
    if (quranRef) {
      return quranRef.vs === quranRef.ve
        ? `${quranRef.cn}:${quranRef.vs}`
        : `${quranRef.cn}:${quranRef.vs}–${quranRef.ve}`
    }
    return reference
  })()

  // Dialog title (Quran supports in-dialog navigation; Bible does not)
  const currentRef = history[history.length - 1] ?? reference
  const currentParsed = !isBible ? (parseQuranRef(currentRef) ?? quranRef) : null
  const currentLabel = !isBible && currentParsed
    ? currentParsed.vs === currentParsed.ve
      ? `${currentParsed.cn}:${currentParsed.vs}`
      : `${currentParsed.cn}:${currentParsed.vs}–${currentParsed.ve}`
    : label

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (val) {
      if (isBible && bibleRef) {
        fetchBible(bibleRef)
      } else {
        setHistory([reference])
        doQuranFetch(reference)
      }
    } else {
      setHistory([])
    }
  }

  const loading = isBible ? bibleLoading : quranLoading
  const error = isBible ? bibleError : quranError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        onClick={() => handleOpenChange(true)}
        className="inline-flex items-center font-glacial text-[0.85em] font-bold text-primary hover:underline px-0.5 transition-colors cursor-pointer align-baseline select-none mx-0.5"
        aria-label={`View ${isBible ? 'Bible' : 'Quran'} verse ${reference}`}
      >
        {label}
      </button>

      <DialogContent
        className="max-w-lg p-0 overflow-hidden rounded-3xl gap-0"
        aria-describedby={undefined}
      >
        {/* Required for a11y; visible header is intentionally minimal — the
            verse-key pill on the rendered card already carries the reference. */}
        <DialogTitle className="sr-only">
          {currentLabel}
          {from ? ` — from ${from}` : ''}
        </DialogTitle>

        {!isBible && history.length > 1 && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            aria-label="Go back"
            className="absolute top-3 left-3 z-10"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}

        <div className="max-h-[65vh] overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive text-center py-10">
              {error}
            </p>
          )}
          {isBible ? (
            <div className="px-6 py-5">
              {bibleVerses.map((verse, i) => (
                <BibleVersePreview
                  key={verse.vk ?? i}
                  verse={verse}
                  bookDisplay={bibleRef?.displayBook ?? ''}
                />
              ))}
            </div>
          ) : (
            quranVerses.map((verse, i) => {
              const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)
              return (
                <VerseCard
                  key={verse.vk ?? i}
                  verse={verse}
                  isLast={i === quranVerses.length - 1}
                  optsKey={`ref-${primaryCode}-${prefs.secondaryLanguage ?? ''}-${prefs.wordByWord}`}
                  showAudio={false}
                  showCopyButton={false}
                  verseHref={`/quran/${chNum}?verse=${vNum}`}
                />
              )
            })
          )}
        </div>

        {(from ||
          (!isBible && quranVerses.length > 0 && currentParsed)) && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t bg-muted/20">
            {from ? (
              <span className="text-xs italic text-muted-foreground truncate">
                from {from}
              </span>
            ) : (
              <span />
            )}
            {!isBible && quranVerses.length > 0 && currentParsed && (
              <Link
                href={`/quran/${currentParsed.cn}?verse=${currentParsed.vs}`}
                onClick={() => setOpen(false)}
                className="shrink-0 text-xs text-primary hover:text-primary flex items-center gap-1 transition-colors"
              >
                Open in Quran reader
                <ArrowUpRight className="size-3" />
              </Link>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Backward-compat alias — existing <QuranRef> usage continues to work
export const QuranRef = ScriptureRef
