import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

// ── Arabic word display (non-interactive, server-rendered) ───────────────────

function ArabicWords({ words }: { words: VerseData['w'] }) {
  if (!words || words.length === 0) return null
  const sorted = [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0))
  return (
    <div
      dir="rtl"
      className="flex flex-wrap justify-end gap-x-3 gap-y-1 pt-2 font-arabic text-lg text-foreground/85"
    >
      {sorted.map((w) => {
        const arabic = (w.tx as Record<string, string> | undefined)?.['ar']
        if (!arabic) return null
        return (
          <span key={w.wi ?? arabic} className="leading-relaxed">
            {arabic}
          </span>
        )
      })}
    </div>
  )
}

// ── Single verse row ─────────────────────────────────────────────────────────

function VerseRow({ verse, isLast }: { verse: VerseData; isLast: boolean }) {
  const en = verse.tr?.['en']
  const ar = verse.tr?.['ar']

  return (
    <div className={`px-4 py-4 space-y-2 ${!isLast ? 'border-b border-border/30' : ''}`}>
      {/* Subtitle */}
      {en?.s && (
        <p className="text-xs italic text-muted-foreground">{en.s}</p>
      )}

      <div className="flex items-start gap-3">
        {/* Verse key badge */}
        <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
          {verse.vk}
        </span>

        <div className="flex-1 min-w-0 space-y-2">
          {/* English text */}
          {en?.tx && (
            <p className="text-sm leading-relaxed">{en.tx}</p>
          )}

          {/* Arabic — word-by-word if available, fallback to block text */}
          {verse.w && verse.w.length > 0 ? (
            <ArabicWords words={verse.w} />
          ) : ar?.tx ? (
            <p
              dir="rtl"
              className="font-arabic text-right text-lg leading-relaxed text-foreground/85 pt-1"
            >
              {ar.tx}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── Segment block ────────────────────────────────────────────────────────────

function SegmentBlock({
  seg,
  verses,
  chapterTitle,
}: {
  seg: Segment
  verses: VerseData[]
  chapterTitle: string
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
  if (apiError || !data) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
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
    <div className="max-w-5xl mx-auto space-y-4">
      {segments.map((seg, i) => {
        const verses = getSegmentVerses(seg, byChapter)
        const title = chapterTitles.get(seg.cn) ?? `Chapter ${seg.cn}`
        return (
          <SegmentBlock
            key={`${seg.raw}-${i}`}
            seg={seg}
            verses={verses}
            chapterTitle={title}
          />
        )
      })}
    </div>
  )
}
