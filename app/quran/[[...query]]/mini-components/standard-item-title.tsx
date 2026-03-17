'use client'

import {
  QueryResultChapter,
  QueryResultMultipleVerses,
  QueryResultVerse,
} from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { LangCode } from '@/hooks/use-quran-preferences'

// Temporary: maps ISO lang codes to ws_quran_chapters Supabase column names.
// Remove once result-standard.tsx is migrated to the ws-backend.
const CODE_TO_TITLE_FIELD: Record<LangCode, string> = {
  en: 'title_english',
  ar: 'title_arabic',
  fr: 'title_french',
  de: 'title_german',
  tr: 'title_turkish',
  id: 'title_bahasa',
  fa: 'title_persian',
  ta: 'title_tamil',
  sv: 'title_swedish',
  ru: 'title_russian',
  bn: 'title_bengali',
  es: 'title_spanish',
  ur: 'title_urdu',
  xl: 'title_transliterated',
}

export function StandardItemTitle({
  props,
}: {
  props: {
    data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses
  }
}) {
  const quranPreferences = useQuranPreferences()
  const titleField = CODE_TO_TITLE_FIELD[quranPreferences.primaryLanguage] ?? 'title_english'

  return (
    <main className="space-y-2">
      <section>
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold pl-1">
              {props.data.metadata.allMatchesInSameChapter
                ? `Sura ${props.data.data[0].chapter_number}, ${(props.data.data[0].ws_quran_chapters as Record<string, string>)[titleField]}`
                : props.data.metadata.formattedChapterTitle}
            </h1>
            {props.data.metadata.allMatchesInSameChapter ? (
              <section className="flex w-fit justify-end items-center bg-muted/50 rounded-lg text-sm text-muted-foreground space-x-2 p-1">
                <p>
                  {props.data.data[0].ws_quran_chapters.title_transliterated}
                </p>
                <p>•</p>
                <p>{`${props.data.data[0].chapter_verses} verses`}</p>
              </section>
            ) : (
              <section className="flex w-fit justify-end items-center bg-muted/50 rounded-lg text-sm text-muted-foreground space-x-2 p-1">
                <p>{props.data.metadata.formattedQuery}</p>
              </section>
            )}
          </div>

          {props.data.metadata.allMatchesInSameChapter && (
            <div className="flex flex-col text-right">
              <h1 className="text-2xl font-bold">
                {props.data.data[0].ws_quran_chapters.title_arabic}
              </h1>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
