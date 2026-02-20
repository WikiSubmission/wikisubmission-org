'use client'

import {
  QueryResultChapter,
  QueryResultMultipleVerses,
  QueryResultVerse,
} from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, BookIcon, ChevronRight } from 'lucide-react'
import { StandardItemTitle } from '../mini-components/standard-item-title'
import { StandardItemVerses } from '../mini-components/standard-item-verses'
import Link from 'next/link'

export function StandardResult({
  props,
}: {
  props: {
    query: string
    data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses
  }
}) {
  return (
    <div className="space-y-2">
      <StandardItemTitle props={props} />
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(props.data.data.map((i) => i.chapter_number))).map(
          (chapterNum) => {
            const chapterData = props.data.data.find(
              (i) => i.chapter_number === chapterNum
            )
            if (!chapterData) return null

            const chapterVersesInResult = props.data.data.filter(
              (i) => i.chapter_number === chapterNum
            ).length
            const isFullChapter =
              chapterData.chapter_number === 1 ||
              chapterData.chapter_number === 9
                ? chapterVersesInResult === chapterData.chapter_verses
                : chapterVersesInResult === chapterData.chapter_verses + 1

            if (isFullChapter) return null

            return (
              <Link
                key={chapterNum}
                href={`/quran/${chapterNum}?verse=${chapterData.verse_number}`}
              >
                <Button variant="secondary" size="sm">
                  <BookIcon className="size-4" />
                  Full Chapter ({chapterNum})
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            )
          }
        )}
      </div>
      <StandardItemVerses props={props} />

      {/* Navigation */}
      <section className="bg-muted/50 p-4 rounded-2xl">
        <div className="flex justify-between items-center">
          {/* Previous Chapter */}
          {props.data.data[0].chapter_number > 1 && (
            <a href={`/quran/${props.data.data[0].chapter_number - 1}`}>
              <Button variant="secondary">
                <ArrowLeft />
                Chapter {props.data.data[0].chapter_number - 1}
              </Button>
            </a>
          )}

          {/* Next Chapter */}
          {props.data.data[0].chapter_number < 114 && (
            <a href={`/quran/${props.data.data[0].chapter_number + 1}`}>
              <Button variant="secondary">
                Chapter {props.data.data[0].chapter_number + 1}
                <ArrowRight />
              </Button>
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
