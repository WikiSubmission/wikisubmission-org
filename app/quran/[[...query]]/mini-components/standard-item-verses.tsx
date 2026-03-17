'use client'

import {
  QueryResultChapter,
  QueryResultMultipleVerses,
  QueryResultVerse,
} from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { LangCode } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArabicDetailed } from './arabic-detailed'
import { useQuranPlayer, QuranVerse } from '@/lib/quran-audio-context'
import { Play, Pause, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Temporary: maps ISO lang codes to SDK language names for ws_quran_text / ws_quran_subtitles / ws_quran_footnotes keys.
// Remove once result-standard.tsx is migrated to the ws-backend.
const CODE_TO_SDK_LANG: Record<LangCode, string> = {
  en: 'english',
  ar: 'arabic',
  fr: 'french',
  de: 'german',
  tr: 'turkish',
  id: 'bahasa',
  fa: 'persian',
  ta: 'tamil',
  sv: 'swedish',
  ru: 'russian',
  bn: 'bengali',
  es: 'spanish',
  ur: 'urdu',
  xl: 'transliterated',
}

export function StandardItemVerses({
  props,
}: {
  props: {
    data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses
  }
}) {
  const quranPreferences = useQuranPreferences()
  const { isRtl } = useLanguagesStore()
  const verseSearchParam = useSearchParams().get('verse')
  const [isHighlighted, setIsHighlighted] = useState(false)
  const {
    playFromVerse,
    currentVerse,
    isPlaying,
    isBuffering,
    togglePlayPause,
  } = useQuranPlayer()

  const primarySdkLang = CODE_TO_SDK_LANG[quranPreferences.primaryLanguage]
  const secondarySdkLang = quranPreferences.secondaryLanguage
    ? CODE_TO_SDK_LANG[quranPreferences.secondaryLanguage]
    : undefined

  useEffect(() => {
    if (!verseSearchParam) return

    const element = document.getElementById(
      `${props.data.data[0].chapter_number}:${verseSearchParam}`
    )
    if (!element) return

    element.scrollIntoView({ block: 'center' })

    requestAnimationFrame(() => {
      setIsHighlighted(true)
      setTimeout(() => setIsHighlighted(false), 300)
    })
  }, [verseSearchParam, props.data.data])

  return (
    <main className="w-full">
      <section className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden">
        {props.data.data.map((i, index) => (
          <div
            id={i.verse_id}
            key={i.verse_id}
            className={`transition-colors duration-500 ${
              (isHighlighted &&
                i.verse_id ===
                  `${props.data.data[0].chapter_number}:${verseSearchParam}`) ||
              currentVerse?.verse_id === i.verse_id
                ? 'bg-violet-600/10'
                : ''
            }`}
          >
            <div className="p-6 sm:p-8 space-y-2">
              {i.ws_quran_subtitles && quranPreferences.subtitles && (
                <div className="flex justify-center">
                  <p className="text-violet-600 text-xs font-bold text-center">
                    {
                      (i.ws_quran_subtitles as Record<string, string>)[
                        primarySdkLang in i.ws_quran_subtitles
                          ? primarySdkLang
                          : 'english'
                      ]
                    }
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="w-fit shrink-0 flex items-start space-x-0.5 border px-2 bg-muted/30 backdrop-blur-sm rounded-full">
                  <span className="w-full text-lg font-semibold">
                    {i.verse_id.split(':')[0]}
                  </span>
                  <span>:</span>
                  <span className="w-full text-lg font-semibold text-primary/80">
                    {i.verse_id.split(':')[1]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-violet-600/10 hover:text-violet-600"
                  onClick={() => {
                    if (currentVerse?.verse_id === i.verse_id) {
                      togglePlayPause()
                    } else {
                      playFromVerse(
                        i as unknown as QuranVerse,
                        props.data.data as unknown as QuranVerse[]
                      )
                    }
                  }}
                >
                  {currentVerse?.verse_id === i.verse_id && isPlaying ? (
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
                {/* Right Column: Verses & Translations */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div
                    className={`${isRtl(quranPreferences.primaryLanguage) ? 'text-right' : ''}`}
                  >
                    <p className="text-lg leading-relaxed text-foreground select-text font-medium">
                      {(i.ws_quran_text as Record<string, string>)[primarySdkLang]}
                    </p>
                  </div>

                  {secondarySdkLang && (
                    <p
                      className={`text-muted-foreground leading-relaxed italic ${isRtl(quranPreferences.secondaryLanguage ?? '') ? 'text-right' : ''}`}
                    >
                      {(i.ws_quran_text as Record<string, string>)[secondarySdkLang]}
                    </p>
                  )}

                  {quranPreferences.arabic && (
                    <div className="py-2">
                      <ArabicDetailed props={{ data: i }} />
                    </div>
                  )}

                  {quranPreferences.transliteration && (
                    <p className="text-violet-600/80 font-medium italic text-sm">
                      {(i.ws_quran_text as Record<string, string>)['transliterated']}
                    </p>
                  )}

                  {i.ws_quran_footnotes && quranPreferences.footnotes && (
                    <div>
                      <p
                        className={`text-sm text-muted-foreground/80 leading-relaxed italic ${isRtl(quranPreferences.primaryLanguage) ? 'text-right' : 'text-left'}`}
                      >
                        {
                          (i.ws_quran_footnotes as Record<string, string>)[
                            primarySdkLang in i.ws_quran_footnotes
                              ? primarySdkLang
                              : 'english'
                          ]
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {index !== props.data.data.length - 1 && (
              <div className="px-8">
                <hr className="border-border/40" />
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  )
}
