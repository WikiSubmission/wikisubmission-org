'use client'

import { useEffect } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { VerseData } from '@/hooks/use-chapter-reader'
import type { ChapterReaderOptions } from '@/hooks/use-chapter-reader'
import { QuranRefText } from '@/components/quran-ref-text'
import { Spinner } from '@/components/ui/spinner'

function isRtl(lang: string) {
  return ['ar', 'fa', 'ur'].includes(lang)
}

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

  // Auto-load all verses when reading mode is active
  useEffect(() => {
    if (hasMore && !loading) {
      loadMore(opts)
    }
  }, [hasMore, loading, verses.length, loadMore, opts])

  // Collect footnotes for bottom reference section
  const footnotes: { verseKey: string; text: string }[] = []
  if (prefs.footnotes) {
    verses.forEach((v) => {
      const tr = v.tr?.[primaryCode]
      if (tr?.f) {
        const [, vNum] = (v.vk ?? '').split(':')
        footnotes.push({ verseKey: vNum, text: tr.f })
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* Arabic prose block */}
      {prefs.arabic && (
        <div>
          <p dir="rtl" className="font-arabic text-2xl leading-[2.2] text-right text-foreground/90">
            {verses.map((v) => {
              const arTr = v.tr?.['ar']
              const [, vNum] = (v.vk ?? '').split(':')
              const primaryTr = v.tr?.[primaryCode]
              return (
                <span key={v.vk}>
                  {/* Subtitle as section break in Arabic */}
                  {prefs.subtitles && primaryTr?.s && (
                    <span className="block text-center text-base font-sans text-primary font-semibold my-4 not-italic">
                      {primaryTr.s}
                    </span>
                  )}
                  {arTr?.tx ?? ''}
                  {prefs.showVerseNumbers && (
                    <sup className="font-sans text-[10px] text-primary/60 mx-1 align-super">
                      {vNum}
                    </sup>
                  )}
                  {' '}
                </span>
              )
            })}
          </p>
        </div>
      )}

      {/* Translation prose block */}
      {prefs.text && (
        <div className={isRtl(primaryCode) ? 'text-right' : ''}>
          <p className="text-base leading-[2] text-foreground">
            {verses.map((v) => {
              const tr = v.tr?.[primaryCode]
              const [, vNum] = (v.vk ?? '').split(':')
              const fnIndex = footnotes.findIndex((f) => f.verseKey === vNum)
              return (
                <span key={v.vk}>
                  {/* Subtitle as a natural section break in translation */}
                  {prefs.subtitles && tr?.s && (
                    <span className="block text-center text-sm font-semibold text-primary my-4">
                      <QuranRefText text={tr.s} from={`subtitle of ${v.vk}`} />
                    </span>
                  )}
                  {tr?.tx ?? ''}
                  {prefs.showVerseNumbers && (
                    <sup className="text-[10px] font-mono text-primary/60 mx-0.5 align-super">
                      {vNum}
                    </sup>
                  )}
                  {/* Footnote reference number */}
                  {prefs.footnotes && fnIndex >= 0 && (
                    <sup className="text-[10px] font-mono text-muted-foreground/60 mx-0.5 align-super">
                      [{fnIndex + 1}]
                    </sup>
                  )}
                  {' '}
                </span>
              )
            })}
          </p>
        </div>
      )}

      {/* Secondary translation prose block */}
      {prefs.secondaryLanguage && prefs.secondaryLanguage !== 'xl' && (
        <div className={isRtl(prefs.secondaryLanguage) ? 'text-right' : ''}>
          <p className="text-base leading-[2] text-muted-foreground italic">
            {verses.map((v) => {
              const tr = v.tr?.[prefs.secondaryLanguage!]
              const [, vNum] = (v.vk ?? '').split(':')
              return (
                <span key={v.vk}>
                  {tr?.tx ?? ''}
                  {prefs.showVerseNumbers && (
                    <sup className="text-[10px] font-mono text-primary/60 mx-0.5 align-super not-italic">
                      {vNum}
                    </sup>
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

      {/* Footnote references */}
      {!hasMore && footnotes.length > 0 && (
        <div className="border-t border-border/40 pt-8 space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
            Notes
          </p>
          {footnotes.map((fn, i) => (
            <div key={fn.verseKey} className="flex gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs text-primary/60 shrink-0 mt-0.5">
                [{i + 1}]
              </span>
              <span className="leading-relaxed">
                <span className="font-medium text-foreground/60 mr-1">v.{fn.verseKey}</span>
                <QuranRefText text={fn.text} from={`footnote of verse ${fn.verseKey}`} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
