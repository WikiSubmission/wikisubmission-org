'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useVerseFetch, useBibleFetch } from '@/hooks/use-verse-fetch'
import { parseQuranRef, parseBibleRef } from '@/lib/scripture-parser'
import { QuranRefText } from './quran-ref-text'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'

type VerseData = components['schemas']['VerseData']
type BibleVerseData = components['schemas']['BibleVerseData']

function VersePreview({
  verse,
  primaryCode,
  showArabic,
  onNavigateRef,
}: {
  verse: VerseData
  primaryCode: string
  showArabic: boolean
  onNavigateRef: (ref: string) => void
}) {
  const tr = verse.tr?.[primaryCode]
  const arTr = verse.tr?.['ar']
  const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)

  return (
    <div className="space-y-2 py-3 border-b last:border-0">
      <Link
        href={`/quran/${chNum}?verse=${vNum}`}
        className="text-xs text-primary hover:text-primary flex items-center gap-1 w-fit transition-colors"
      >
        {verse.vk}
        <ArrowUpRight className="size-3" />
      </Link>
      {tr?.s && <p className="text-xs text-primary italic">{tr.s}</p>}
      {tr?.tx && (
        <p className="text-sm leading-relaxed">{tr.tx}</p>
      )}
      {tr?.f && (
        <p className="text-sm text-muted-foreground italic">
          <QuranRefText
            text={tr.f}
            from={`footnote of ${verse.vk}`}
            onNavigateRef={onNavigateRef}
          />
        </p>
      )}
      {showArabic && arTr?.tx && (
        <p
          dir="rtl"
          className="font-arabic text-xl leading-relaxed text-right pt-1"
        >
          {arTr.tx}
        </p>
      )}
    </div>
  )
}

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
    (ref: string) => fetchQuran(ref, primaryCode),
    [fetchQuran, primaryCode]
  )

  const handleNavigate = useCallback(
    (newRef: string) => {
      setHistory((prev) => [...prev, newRef])
      doQuranFetch(newRef)
    },
    [doQuranFetch]
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
    return <span className="font-glacial text-[10px] font-bold">{reference}</span>
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
        className="inline-flex items-center font-glacial text-[10px] font-bold text-primary hover:underline px-0.5 transition-colors cursor-pointer align-baseline select-none mx-0.5"
        aria-label={`View ${isBible ? 'Bible' : 'Quran'} verse ${reference}`}
      >
        {label}
      </button>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {!isBible && history.length > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="font-glacial font-bold text-primary uppercase tracking-wider">{currentLabel}</span>
              {from && (isBible || history.length === 1) && (
                <span className="text-xs text-muted-foreground font-normal">
                  — from {from}
                </span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1 -mr-1">
          {loading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive text-center py-6">{error}</p>
          )}
          {isBible
            ? bibleVerses.map((verse, i) => (
                <BibleVersePreview
                  key={verse.vk ?? i}
                  verse={verse}
                  bookDisplay={bibleRef?.displayBook ?? ''}
                />
              ))
            : quranVerses.map((verse, i) => (
                <VersePreview
                  key={verse.vk ?? i}
                  verse={verse}
                  primaryCode={primaryCode}
                  showArabic={prefs.arabic}
                  onNavigateRef={handleNavigate}
                />
              ))}
        </div>

        {!isBible && quranVerses.length > 0 && currentParsed && (
          <div className="pt-3 border-t">
            <Link
              href={`/quran/${currentParsed.cn}?verse=${currentParsed.vs}`}
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:text-primary flex items-center gap-1 w-fit transition-colors"
            >
              Open in Quran reader
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Backward-compat alias — existing <QuranRef> usage continues to work
export const QuranRef = ScriptureRef
