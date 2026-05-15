'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'
import { VerseCard } from './verse-card'
import { SearchHeader } from './search-header'
import { CopyAllDropdown } from './copy-all-dropdown'
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
    if (r)
      return [{ type: 'range', cn: +r[1], vs: +r[2], ve: +r[3], raw: part }]
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

// ── Segment block ────────────────────────────────────────────────────────────

function SegmentBlock({
  seg,
  verses,
  chapterTitle,
  optsKey,
}: {
  seg: Segment
  verses: VerseData[]
  chapterTitle: string
  optsKey: string
}) {
  if (verses.length === 0) return null

  return (
    <div className="rounded-2xl border border-border/40 bg-background overflow-hidden">
      {/* Header — links to ChapterReader at the right verse */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border/40">
        <Link
          href={segmentHref(seg)}
          className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity flex-1 min-w-0"
        >
          <span className="font-mono font-bold">{segmentLabel(seg)}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground truncate">{chapterTitle}</span>
          <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
        </Link>
        <CopyAllDropdown verses={verses} label="Copy" />
      </div>

      {/* Verses */}
      {verses.map((verse, i) => (
        <VerseCard
          key={verse.vk}
          verse={verse}
          isLast={i === verses.length - 1}
          optsKey={optsKey}
          showAudio={false}
          showCopyButton={false}
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
  const maxW = ZOOM_WIDTH_CLASS[zoom]

  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? ''}-${zoom}-${prefs.arabic}-${prefs.wordByWord}`

  // Build lookup: cn → (verseNumber → VerseData) and cn → titles
  const { byChapter, chapterTitles } = useMemo(() => {
    const byChapter = new Map<number, Map<number, VerseData>>()
    const chapterTitles = new Map<number, string>()
    for (const ch of data?.chapters ?? []) {
      const m = new Map<number, VerseData>()
      for (const v of ch.verses ?? []) {
        const vNum = parseInt((v.vk ?? '').split(':')[1] ?? '0', 10)
        if (!isNaN(vNum)) m.set(vNum, v)
      }
      byChapter.set(ch.cn ?? 0, m)
      chapterTitles.set(ch.cn ?? 0, ch.titles?.['en'] ?? `Chapter ${ch.cn}`)
    }
    return { byChapter, chapterTitles }
  }, [data])

  const segments = useMemo(() => parseSegments(queryText), [queryText])

  const allVerses = useMemo(
    () => segments.flatMap((seg) => getSegmentVerses(seg, byChapter)),
    [segments, byChapter]
  )

  if (apiError || !data) {
    return (
      <div className={`${maxW} mx-auto py-12 text-center`}>
        <p className="text-sm text-muted-foreground">
          No verses found for &ldquo;{queryText}&rdquo;.
        </p>
      </div>
    )
  }

  return (
    <div className={`${maxW} mx-auto space-y-4`}>
      <SearchHeader query={queryText} />

      <div className="flex justify-end">
        <CopyAllDropdown verses={allVerses} />
      </div>

      {segments.map((seg, i) => {
        const verses = getSegmentVerses(seg, byChapter)
        const title = chapterTitles.get(seg.cn) ?? `Chapter ${seg.cn}`
        return (
          <SegmentBlock
            key={`${seg.raw}-${i}`}
            seg={seg}
            verses={verses}
            chapterTitle={title}
            optsKey={optsKey}
          />
        )
      })}
    </div>
  )
}
