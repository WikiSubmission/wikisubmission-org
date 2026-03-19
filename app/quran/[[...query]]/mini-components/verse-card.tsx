'use client'

import { memo, useMemo, useCallback } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import { useQuranPlayer, type QuranVerse } from '@/lib/quran-audio-context'
import { RootWordOccurrences } from './root-word-occurrences'
import { Play, Pause, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { components } from '@/src/api/types.gen'
import { QuranRefText } from '@/components/quran-ref-text'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']

// Adapter: VerseData → QuranVerse (for the audio player)
export function toQuranVerse(verse: VerseData): QuranVerse {
  return { verse_id: verse.vk ?? '', ws_quran_text: {} }
}

// ─── Word-by-word (Arabic) ────────────────────────────────────────────────────

const WordByWordView = memo(
  function WordByWordView({
    words,
    compact,
  }: {
    words: WordData[]
    /** Used only in arePropsEqual — not needed in the render body. */
    verseKey: string
    compact: boolean
    /** Forwarded from VerseCard — forces re-render on language reload. */
    optsKey?: string
  }) {
  // Sort once and memoize — words from the API are stable references
  const sorted = useMemo(
    () => [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0)),
    [words]
  )

  if (compact) {
    return (
      <div dir="rtl" className="flex flex-wrap text-right justify-start gap-x-4 gap-y-6 py-2">
        {sorted.map((w) => {
          const arabic = (w.tx as Record<string, unknown>)?.['ar'] as string | undefined
          const root = w.r
          const meaning = w.m ?? ''
          const wordIndex = w.wi ?? 0

          return (
            <Dialog key={wordIndex}>
              <Tooltip>
                <DialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <p
                      className="font-arabic text-2xl leading-relaxed transition-all cursor-pointer hover:text-violet-600 hover:scale-105 active:scale-95 text-foreground/90"
                    >
                      {arabic}
                    </p>
                  </TooltipTrigger>
                </DialogTrigger>

                <TooltipContent
                  side="top"
                  className="bg-popover/80 backdrop-blur-sm border-violet-600/20 px-4 py-2 rounded-xl"
                >
                  <div className="flex flex-col gap-0.5 space-y-1 py-2 items-center text-center">
                    <p className="font-arabic text-xl text-violet-600">{arabic}</p>
                    <p className="text-xs font-bold text-foreground">{meaning}</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              {root && (
                <DialogContent className="max-w-md sm:max-w-xl overflow-hidden rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex flex-col items-center gap-3 text-center pb-3 border-b">
                      <span className="text-4xl font-arabic text-violet-600 mb-3">{arabic}</span>
                      <span className="text-base font-semibold text-foreground">{meaning}</span>
                      <div className="px-2.5 py-0.5 bg-violet-600/10 rounded-full">
                        <span className="text-[10px] font-bold text-violet-600">Root: {root}</span>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">
                      Other Occurrences
                    </p>
                    <RootWordOccurrences rootWord={root} />
                  </div>
                </DialogContent>
              )}
            </Dialog>
          )
        })}
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex flex-wrap justify-start gap-y-8 gap-x-2 py-4">
      {sorted.map((w) => {
        const arabic = (w.tx as Record<string, unknown>)?.['ar'] as string | undefined
        const root = w.r
        const meaning = w.m ?? ''
        const wordIndex = w.wi ?? 0

        return (
          <Dialog key={wordIndex}>
            <DialogTrigger asChild>
              <div className="group flex flex-col items-center gap-2 px-3 py-2 cursor-pointer transition-all hover:bg-muted/50 rounded-2xl border border-transparent hover:border-violet-600/20">
                <p className="font-arabic text-2xl leading-snug group-hover:text-violet-600 transition-colors">
                  {arabic}
                </p>
                <div className="flex flex-col items-center gap-0.5 pt-0.5" dir="ltr">
                  <p className="text-[11px] text-muted-foreground font-medium text-center break-words max-w-[100px] italic">
                    {meaning}
                  </p>
                </div>
              </div>
            </DialogTrigger>

            {root && (
              <DialogContent className="max-w-md sm:max-w-xl overflow-hidden rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="flex flex-col items-center gap-3 text-center pb-3 border-b">
                    <span className="text-4xl font-arabic text-violet-600 mb-1">{arabic}</span>
                    <span className="text-base font-semibold text-foreground">{meaning}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="px-2.5 py-0.5 bg-violet-600/10 rounded-full">
                        <span className="text-[10px] font-bold text-violet-600">Root: {root}</span>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">
                    Other Occurrences
                  </p>
                  <RootWordOccurrences rootWord={root} />
                </div>
              </DialogContent>
            )}
          </Dialog>
        )
      })}
    </div>
  )
  },
  (prev, next) =>
    prev.verseKey === next.verseKey &&
    prev.compact === next.compact &&
    prev.optsKey === next.optsKey
)

// ─── Verse Card ───────────────────────────────────────────────────────────────

export const VerseCard = memo(
  function VerseCard({
    verse,
    isLast,
    isScrollTarget,
    optsKey,
  }: {
    verse: VerseData
    isLast: boolean
    isScrollTarget: boolean
    /** Stable key derived from language prefs — forces re-render on reload. */
    optsKey: string
  }) {
  const prefs = useQuranPreferences()
  const { isRtl } = useLanguagesStore()
  const { playFromVerse, currentVerse, isPlaying, isBuffering, togglePlayPause } =
    useQuranPlayer()

  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const tr = verse.tr?.[primaryCode]
  const arTr = verse.tr?.['ar']
  const secondaryTr =
    prefs.secondaryLanguage && prefs.secondaryLanguage !== 'xl'
      ? verse.tr?.[prefs.secondaryLanguage]
      : undefined

  const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)
  const verseId = verse.vk ?? ''
  const isCurrentAudio = currentVerse?.verse_id === verseId

  const audioVerse = useMemo(
    () => toQuranVerse(verse),
    // verse reference is stable within a batch; vk is sufficient identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [verse.vk]
  )

  const handlePlay = useCallback(() => {
    if (isCurrentAudio) {
      togglePlayPause()
    } else {
      // Queue was pre-set in ChapterReader via setChapterQueue; no need to pass it here
      playFromVerse(audioVerse)
    }
  }, [isCurrentAudio, togglePlayPause, playFromVerse, audioVerse])

  return (
    <div
      id={verseId}
      className={`transition-colors duration-500 ${
        isScrollTarget || isCurrentAudio ? 'bg-violet-600/10' : ''
      }`}
    >
      <div className="p-6 sm:p-8 space-y-2">
        {/* Subtitle */}
        {prefs.subtitles && tr?.s && (
          <div className="flex justify-center">
            <p className="text-violet-600 text-xs font-bold text-center">
              <QuranRefText text={tr.s} from={`subtitle of ${verse.vk}`} />
            </p>
          </div>
        )}

        {/* Verse key + play button */}
        <div className="flex items-center justify-between gap-2">
          <div className="w-fit shrink-0 flex items-start space-x-0.5 border px-2 bg-muted/30 backdrop-blur-sm rounded-full">
            <span className="w-full text-lg font-semibold">{chNum}</span>
            <span>:</span>
            <span className="w-full text-lg font-semibold text-primary/80">{vNum}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-violet-600/10 hover:text-violet-600"
            onClick={handlePlay}
          >
            {isCurrentAudio && isPlaying ? (
              isBuffering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            )}
          </Button>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Primary translation */}
            {prefs.text && tr?.tx && (
              <div className={isRtl(prefs.primaryLanguage) ? 'text-right' : ''}>
                <p className="text-lg leading-relaxed text-foreground select-text font-medium">
                  {tr.tx}
                </p>
              </div>
            )}

            {/* Secondary translation */}
            {secondaryTr?.tx && (
              <p
                className={`text-muted-foreground leading-relaxed italic ${
                  isRtl(prefs.secondaryLanguage ?? '') ? 'text-right' : ''
                }`}
              >
                {secondaryTr.tx}
              </p>
            )}

            {/* Arabic + word-by-word */}
            {prefs.arabic && (
              <div className="py-2">
                {verse.w && verse.w.length > 0 ? (
                  <WordByWordView
                    words={verse.w}
                    verseKey={verseId}
                    compact={!prefs.wordByWord}
                    optsKey={optsKey}
                  />
                ) : arTr?.tx ? (
                  <p
                    dir="rtl"
                    className="font-arabic text-2xl leading-relaxed text-foreground/90 text-right py-2"
                  >
                    {arTr.tx}
                  </p>
                ) : null}
              </div>
            )}

            {/* Footnotes */}
            {prefs.footnotes && tr?.f && (
              <p
                className={`text-sm text-muted-foreground/80 leading-relaxed italic ${
                  isRtl(prefs.primaryLanguage) ? 'text-right' : 'text-left'
                }`}
              >
                <QuranRefText text={tr.f} from={`footnote of ${verse.vk}`} />
              </p>
            )}
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="px-8">
          <hr className="border-border/40" />
        </div>
      )}
    </div>
  )
  },
  (prev, next) =>
    prev.verse.vk === next.verse.vk &&
    prev.isLast === next.isLast &&
    prev.isScrollTarget === next.isScrollTarget &&
    prev.optsKey === next.optsKey
)
