'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_FONT, ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'
import { QuranRefText } from '@/components/quran-ref-text'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type QuranResponse = components['schemas']['QuranResponse']

// ── Segment types ────────────────────────────────────────────────────────────

type Segment =
  | { type: 'verse'; cn: number; v: number; raw: string }
  | { type: 'range'; cn: number; vs: number; ve: number; raw: string }

function parseSegments(q: string): Segment[] {
  return q.split(',').flatMap((s): Segment[] => {
    const part = s.trim()
    const v = part.match(/^(\d+):(\d+)$/)
    if (v) return [{ type: 'verse', cn: +v[1], v: +v[2], raw: part }]
    const r = part.match(/^(\d+):(\d+)-(\d+)$/)
    if (r) return [{ type: 'range', cn: +r[1], vs: +r[2], ve: +r[3], raw: part }]
    return []
  })
}

function getSegmentVerses(
  seg: Segment,
  byChapter: Map<number, Map<number, VerseData>>
): VerseData[] {
  const m = byChapter.get(seg.cn)
  if (!m) return []
  if (seg.type === 'verse') {
    const v = m.get(seg.v)
    return v ? [v] : []
  }
  const result: VerseData[] = []
  for (let i = seg.vs; i <= seg.ve; i++) {
    const v = m.get(i)
    if (v) result.push(v)
  }
  return result
}

function segmentLabel(seg: Segment): string {
  if (seg.type === 'verse') return `${seg.cn}:${seg.v}`
  return `${seg.cn}:${seg.vs}–${seg.ve}`
}

function segmentHref(seg: Segment): string {
  const verse = seg.type === 'verse' ? seg.v : seg.vs
  return `/quran/${seg.cn}?verse=${verse}`
}

// ── Arabic word display ───────────────────────────────────────────────────────

function ArabicWords({ words, arabicClass }: { words: VerseData['w']; arabicClass: string }) {
  if (!words || words.length === 0) return null
  const sorted = [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0))
  return (
    <p
      dir="rtl"
      className={`pt-2 font-arabic ${arabicClass} leading-loose text-foreground/90 text-right w-full`}
    >
      {sorted.map((w) => {
        const arabic = (w.tx as Record<string, string> | undefined)?.['ar']
        if (!arabic) return null
        return (
          <span key={w.wi ?? arabic}>{arabic}{' '}</span>
        )
      })}
    </p>
  )
}

// ── Single verse row ─────────────────────────────────────────────────────────

function VerseRow({
  verse,
  isLast,
  translationClass,
  arabicClass,
  showSubtitles,
  showFootnotes,
}: {
  verse: VerseData
  isLast: boolean
  translationClass: string
  arabicClass: string
  showSubtitles: boolean
  showFootnotes: boolean
}) {
  const en = verse.tr?.['en']
  const ar = verse.tr?.['ar']

  return (
    <div className={`px-4 py-4 space-y-2 ${!isLast ? 'border-b border-border/30' : ''}`}>
      {/* Subtitle */}
      {showSubtitles && en?.s && (
        <div className="flex justify-center">
          <p className="text-violet-600 text-xs font-bold text-center">
            <QuranRefText text={en.s} from={`subtitle of ${verse.vk}`} />
          </p>
        </div>
      )}

      <div className="space-y-2">
        {/* English text */}
        {en?.tx && (
          <p className={`${translationClass} leading-relaxed`}>{en.tx}</p>
        )}

        {/* Arabic — word-by-word if available, fallback to block text */}
        {verse.w && verse.w.length > 0 ? (
          <ArabicWords words={verse.w} arabicClass={arabicClass} />
        ) : ar?.tx ? (
          <p
            dir="rtl"
            className={`font-arabic text-right ${arabicClass} leading-loose text-foreground/90 pt-1 w-full`}
          >
            {ar.tx}
          </p>
        ) : null}

        {/* Footnote */}
        {showFootnotes && en?.f && (
          <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
            <QuranRefText text={en.f} from={`footnote of ${verse.vk}`} />
          </p>
        )}
      </div>
    </div>
  )
}

// ── Segment block ────────────────────────────────────────────────────────────

function SegmentBlock({
  seg,
  verses,
  chapterTitle,
  translationClass,
  arabicClass,
  showSubtitles,
  showFootnotes,
}: {
  seg: Segment
  verses: VerseData[]
  chapterTitle: string
  translationClass: string
  arabicClass: string
  showSubtitles: boolean
  showFootnotes: boolean
}) {
  if (verses.length === 0) return null

  return (
    <div className="rounded-2xl border border-border/40 bg-background overflow-hidden">
      {/* Header — links to ChapterReader at the right verse */}
      <Link
        href={segmentHref(seg)}
        className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border/40 text-sm hover:bg-muted/60 transition-colors"
      >
        <span className="font-mono font-bold">{segmentLabel(seg)}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{chapterTitle}</span>
        <ArrowRight size={14} className="ml-auto text-muted-foreground" />
      </Link>

      {/* Verses */}
      {verses.map((verse, i) => (
        <VerseRow
          key={verse.vk}
          verse={verse}
          isLast={i === verses.length - 1}
          translationClass={translationClass}
          arabicClass={arabicClass}
          showSubtitles={showSubtitles}
          showFootnotes={showFootnotes}
        />
      ))}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export function VerseListResult({
  queryText,
  data,
  apiError,
}: {
  queryText: string
  data: QuranResponse | undefined
  apiError: boolean
}) {
  const prefs = useQuranPreferences()
  const zoom = prefs.zoomLevel ?? 'comfortable'
  const zoomFont = ZOOM_FONT[zoom]
  const maxW = ZOOM_WIDTH_CLASS[zoom]
  const showSubtitles = prefs.subtitles ?? true
  const showFootnotes = prefs.footnotes ?? true

  if (apiError || !data) {
    return (
      <div className={`${maxW} mx-auto py-12 text-center`}>
        <p className="text-sm text-muted-foreground">
          No verses found for &ldquo;{queryText}&rdquo;.
        </p>
      </div>
    )
  }

  // Build lookup: cn → (vi → VerseData)  and  cn → titles
  const byChapter = new Map<number, Map<number, VerseData>>()
  const chapterTitles = new Map<number, string>()
  for (const ch of data.chapters ?? []) {
    const m = new Map<number, VerseData>()
    for (const v of ch.verses ?? []) m.set(v.vi ?? 0, v)
    byChapter.set(ch.cn ?? 0, m)
    chapterTitles.set(ch.cn ?? 0, ch.titles?.['en'] ?? `Chapter ${ch.cn}`)
  }

  const segments = parseSegments(queryText)

  return (
    <div className={`${maxW} mx-auto space-y-4`}>
      {segments.map((seg, i) => {
        const verses = getSegmentVerses(seg, byChapter)
        const title = chapterTitles.get(seg.cn) ?? `Chapter ${seg.cn}`
        return (
          <SegmentBlock
            key={`${seg.raw}-${i}`}
            seg={seg}
            verses={verses}
            chapterTitle={title}
            translationClass={zoomFont.translation}
            arabicClass={zoomFont.arabic}
            showSubtitles={showSubtitles}
            showFootnotes={showFootnotes}
          />
        )
      })}
    </div>
  )
}
