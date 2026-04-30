'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_WIDTH_CLASS, ZOOM_FONT } from '@/lib/quran-zoom'
import type { VerseData } from '@/hooks/use-chapter-reader'
import type { ChapterReaderOptions } from '@/hooks/use-chapter-reader'
import { QuranRefText } from '@/components/quran-ref-text'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useVerseFetch } from '@/hooks/use-verse-fetch'
import { parseQuranRef } from '@/lib/scripture-parser'
import type { components } from '@/src/api/types.gen'

type ApiVerseData = components['schemas']['VerseData']

function isRtl(lang: string) {
  return ['ar', 'fa', 'ur'].includes(lang)
}

// ─── Footnote dialog with history ─────────────────────────────────────────────

type HistoryEntry =
  | { type: 'footnote'; verseKey: string; text: string }
  | { type: 'verse'; ref: string }

function FootnoteDialogContent({
  initialEntry,
  onClose,
}: {
  initialEntry: HistoryEntry
  onClose: () => void
}) {
  const prefs = useQuranPreferences()
  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const { verses, loading, error, fetch } = useVerseFetch()
  const [history, setHistory] = useState<HistoryEntry[]>([initialEntry])
  const current = history[history.length - 1]

  const doFetch = useCallback(
    (ref: string) => fetch(ref, primaryCode),
    [fetch, primaryCode]
  )

  const handleNavigate = useCallback(
    (ref: string) => {
      setHistory((prev) => [...prev, { type: 'verse', ref }])
      doFetch(ref)
    },
    [doFetch]
  )

  const handleBack = useCallback(() => {
    setHistory((prev) => {
      const next = prev.slice(0, -1)
      const prev_ = next[next.length - 1]
      if (prev_?.type === 'verse') doFetch(prev_.ref)
      return next
    })
  }, [doFetch])

  // Fetch verse when navigating to a verse entry
  useEffect(() => {
    if (current.type === 'verse') {
      doFetch(current.ref)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const showBack = history.length > 1

  let headerLabel = ''
  if (current.type === 'footnote') {
    headerLabel = `v.${current.verseKey}`
  } else {
    const p = parseQuranRef(current.ref)
    if (p) headerLabel = p.vs === p.ve ? `${p.cn}:${p.vs}` : `${p.cn}:${p.vs}–${p.ve}`
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Go back">
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <DialogTitle className="font-glacial font-bold text-primary text-xs uppercase tracking-widest">{headerLabel}</DialogTitle>
        </div>
      </DialogHeader>

      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 -mr-1">
        {current.type === 'footnote' && (
          <p className="text-sm leading-relaxed text-foreground">
            <QuranRefText
              text={current.text}
              from={`footnote of ${current.verseKey}`}
              onNavigateRef={handleNavigate}
            />
          </p>
        )}

        {current.type === 'verse' && (
          <>
            {loading && (
              <div className="flex justify-center py-10"><Spinner /></div>
            )}
            {error && (
              <p className="text-sm text-destructive text-center py-6">{error}</p>
            )}
            {verses.map((v, i) => {
              const vd = v as ApiVerseData
              const tr = vd.tr?.[primaryCode]
              const arTr = vd.tr?.['ar']
              const [chNum, vNum] = (v.vk ?? '').split(':').map(Number)
              return (
                <div key={v.vk ?? i} className="space-y-2 py-2 border-b last:border-0">
                  <Link
                    href={`/quran/${chNum}?verse=${vNum}`}
                    onClick={onClose}
                    className="text-xs text-primary/60 hover:text-primary flex items-center gap-1 w-fit"
                  >
                    {v.vk} <ArrowUpRight className="size-3" />
                  </Link>
                    {tr?.tx && (
                      <p className="text-base leading-relaxed">
                        <strong className="font-glacial text-xs text-primary mr-2 uppercase tracking-tighter">Verse {v.vk}</strong> {tr.tx}
                      </p>
                    )}
                  {tr?.f && (
                    <p className="text-sm text-muted-foreground italic">
                      <QuranRefText
                        text={tr.f}
                        from={`footnote of ${v.vk}`}
                        onNavigateRef={handleNavigate}
                      />
                    </p>
                  )}
                  {prefs.arabic && arTr?.tx && (
                    <p dir="rtl" className="font-arabic text-xl leading-relaxed text-right pt-1">
                      {arTr.tx}
                    </p>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}

function FootnoteButton({
  index,
  verseKey,
  text,
}: {
  index: number
  verseKey: string
  text: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center font-glacial font-bold text-[9px] text-primary hover:underline align-super mx-0.5 cursor-pointer transition-colors"
        aria-label={`Footnote ${index + 1}`}
      >
        {index + 1}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          {open && (
            <FootnoteDialogContent
              initialEntry={{ type: 'footnote', verseKey, text }}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Main ReadingView ──────────────────────────────────────────────────────────

type Props = {
  verses: VerseData[]
  hasMore: boolean
  loading: boolean
  loadMore: (opts?: ChapterReaderOptions) => Promise<void>
  opts: ChapterReaderOptions
}

export function ReadingView({ verses, hasMore, loading, loadMore, opts }: Props) {
  const prefs = useQuranPreferences()
  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const showArabic = prefs.readingModeLang === 'arabic'
  const showTranslation = prefs.readingModeLang === 'translation'

  // Auto-load all verses when reading mode is active
  useEffect(() => {
    if (hasMore && !loading) {
      loadMore(opts)
    }
  }, [hasMore, loading, verses.length, loadMore, opts])

  // Build footnote index for clickable refs in the translation block
  const footnoteIndex: { verseKey: string; text: string }[] = []
  if (prefs.footnotes) {
    verses.forEach((v) => {
      const tr = v.tr?.[primaryCode]
      if (tr?.f) {
        const [, vNum] = (v.vk ?? '').split(':')
        footnoteIndex.push({ verseKey: vNum, text: tr.f })
      }
    })
  }

  if (verses.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  const zoomFont = ZOOM_FONT[prefs.zoomLevel ?? 'comfortable']
  const widthClass = ZOOM_WIDTH_CLASS[prefs.zoomLevel ?? 'comfortable']

  return (
    <div className={`${widthClass} mx-auto px-4 py-8 space-y-10`}>
      {/* Arabic prose block */}
      {showArabic && (
        <div>
          <p dir="rtl" className={`font-arabic ${zoomFont.readingArabic} leading-[2.2] text-right text-foreground/90`}>
            {verses.map((v) => {
              const arTr = v.tr?.['ar']
              const [, vNum] = (v.vk ?? '').split(':')
              const primaryTr = v.tr?.[primaryCode]
              return (
                <span key={v.vk} id={v.vk ?? undefined}>
                  {prefs.subtitles && primaryTr?.s && (
                    <span className="block text-center text-base font-sans text-primary font-semibold my-4 not-italic">
                      {primaryTr.s}
                    </span>
                  )}
                  {arTr?.tx ?? ''}
                  {prefs.showVerseNumbers && (
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[9px] font-glacial font-bold mx-1 align-middle">
                      {vNum}
                    </span>
                  )}
                  {' '}
                </span>
              )
            })}
          </p>
        </div>
      )}

      {/* Translation prose block */}
      {showTranslation && (
        <div className={isRtl(primaryCode) ? 'text-right' : ''}>
          <p className={`${zoomFont.reading} leading-[2] text-foreground`}>
            {verses.map((v) => {
              const tr = v.tr?.[primaryCode]
              const [, vNum] = (v.vk ?? '').split(':')
              const fnIdx = footnoteIndex.findIndex((f) => f.verseKey === vNum)
              return (
                <span key={v.vk} id={v.vk ?? undefined}>
                  {prefs.subtitles && tr?.s && (
                    <span className="block text-center text-sm font-semibold text-primary my-4">
                      <QuranRefText text={tr.s} from={`subtitle of ${v.vk}`} />
                    </span>
                  )}
                  {tr?.tx ?? ''}
                  {prefs.showVerseNumbers && (
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[9px] font-glacial font-bold mx-1 align-middle">
                      {vNum}
                    </span>
                  )}
                  {prefs.footnotes && fnIdx >= 0 && (
                    <FootnoteButton
                      index={fnIdx}
                      verseKey={footnoteIndex[fnIdx].verseKey}
                      text={footnoteIndex[fnIdx].text}
                    />
                  )}
                  {' '}
                </span>
              )
            })}
          </p>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner className="size-4" />
        </div>
      )}
    </div>
  )
}
