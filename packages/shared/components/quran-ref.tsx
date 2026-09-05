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
import { CHAPTER_TITLES_EN } from '@/lib/quran-titles-en'
import { VerseCard } from '@/components/quran-reader/verse-card'
import type { components } from '@/src/api/types.gen'

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
    <div className="space-y-2 py-3 border-b border-[var(--ed-rule)]/40 last:border-0">
      <span className="text-xs text-[var(--ed-accent)] font-mono font-bold tracking-tight">
        {bookDisplay} {cn}:{vn}
      </span>
      {tr?.tx && (
        <p className="text-sm leading-relaxed text-[var(--ed-fg)]" style={{ fontFamily: 'var(--font-source-serif), Georgia, serif' }}>
          {tr.tx}
        </p>
      )}
      {tr?.f && (
        <p className="text-xs text-[var(--ed-fg-muted)] italic leading-normal">{tr.f}</p>
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
 *
 *  `children` + `triggerClassName` replace the inline badge with a caller-owned
 *  trigger — used by the mobile search field, where the reference is a full
 *  result row rather than a word inside a sentence.
 */
export function ScriptureRef({
  reference,
  from,
  children,
  triggerClassName,
}: {
  reference: string
  from?: string
  children?: React.ReactNode
  triggerClassName?: string
}) {
  const prefs = useQuranPreferences()
  const { verses: quranVerses, loading: quranLoading, error: quranError, fetch: fetchQuran } = useVerseFetch()
  const { verses: bibleVerses, loading: bibleLoading, error: bibleError, fetch: fetchBible } = useBibleFetch()
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const bibleRef = parseBibleRef(reference)
  const isBible = bibleRef !== null
  const quranRef = isBible ? null : parseQuranRef(reference)

  const primaryCode = prefs.primaryLanguage

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
    return children ?? (
      <span className="font-mono text-[0.85em] font-bold text-[var(--ed-accent)]">{reference}</span>
    )
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

  // Tooltip description for hovering
  const tooltipText = (() => {
    if (quranRef) {
      const suraTitle = CHAPTER_TITLES_EN[quranRef.cn]
      const suraStr = suraTitle ? `Sura ${quranRef.cn}: ${suraTitle}` : `Sura ${quranRef.cn}`
      const verseStr = quranRef.vs === quranRef.ve ? `Verse ${quranRef.vs}` : `Verses ${quranRef.vs}–${quranRef.ve}`
      return `Quran ${label} (${suraStr}, ${verseStr})`
    }
    if (isBible && bibleRef) {
      return `Bible (${label})`
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

  const currentChapterTitle = !isBible && currentParsed
    ? CHAPTER_TITLES_EN[currentParsed.cn]
    : null

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
        title={tooltipText}
        className={
          triggerClassName ??
          'inline-flex items-center gap-1 font-mono text-[0.82em] font-semibold text-[var(--ed-accent)] bg-[var(--ed-accent)]/[0.08] hover:bg-[var(--ed-accent)]/[0.18] border border-[var(--ed-accent)]/20 hover:border-[var(--ed-accent)]/45 rounded-md px-1.5 py-0.5 mx-0.5 transition-all duration-150 cursor-pointer align-baseline select-text shadow-2xs group/ref'
        }
        aria-label={`View ${isBible ? 'Bible' : 'Quran'} verse ${reference}`}
      >
        {children ?? label}
      </button>

      <DialogContent
        className="max-w-xl p-0 overflow-hidden rounded-2xl sm:rounded-3xl gap-0 border border-[var(--ed-rule)] bg-[var(--ed-surface)] shadow-xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {currentLabel}
          {from ? ` — from ${from}` : ''}
        </DialogTitle>

        {/* ── Dialog Header with rich index information ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)]/90 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {!isBible && history.length > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleBack}
                aria-label="Go back"
                className="size-7 -ml-1 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)] bg-[var(--ed-accent)]/10 px-2 py-0.5 rounded-full border border-[var(--ed-accent)]/20 shrink-0"
              style={{ fontFamily: 'var(--font-glacial), sans-serif' }}
            >
              {isBible ? 'Bible' : 'Quran'}
            </span>
            <div className="min-w-0 flex items-baseline gap-1.5 truncate">
              <span
                className="text-sm sm:text-base font-medium text-[var(--ed-fg)] truncate"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                {!isBible && currentParsed ? (
                  <>
                    Sura {currentParsed.cn}
                    {currentChapterTitle ? ` · ${currentChapterTitle}` : ''}
                  </>
                ) : isBible && bibleRef ? (
                  bibleRef.displayBook
                ) : (
                  currentLabel
                )}
              </span>
            </div>
          </div>

          <span className="shrink-0 inline-flex items-center font-mono text-xs font-semibold text-[var(--ed-accent)] bg-[var(--ed-accent-soft)]/20 border border-[var(--ed-accent)]/25 px-2 py-0.5 rounded-md">
            {currentLabel}
          </span>
        </div>

        {/* ── Verse Content Body ── */}
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

        {/* ── Dialog Footer with links & source note ── */}
        {(from ||
          (!isBible && quranVerses.length > 0 && currentParsed)) && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--ed-rule)] bg-[var(--ed-surface-variant)]/40">
            {from ? (
              <span className="text-xs italic text-[var(--ed-fg-muted)] truncate" style={{ fontFamily: 'var(--font-source-serif), Georgia, serif' }}>
                from {from}
              </span>
            ) : (
              <span />
            )}
            {!isBible && quranVerses.length > 0 && currentParsed && (
              <Link
                href={`/quran/${currentParsed.cn}?verse=${currentParsed.vs}`}
                onClick={() => setOpen(false)}
                className="shrink-0 text-xs font-medium text-[var(--ed-accent)] hover:underline flex items-center gap-1.5 transition-colors"
                style={{ fontFamily: 'var(--font-glacial), sans-serif' }}
              >
                <span>Open in Quran reader</span>
                <ArrowUpRight className="size-3.5" />
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
