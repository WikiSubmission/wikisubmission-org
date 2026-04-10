'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'
import { VerseCard } from './verse-card'
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
  const prefs = useQuranPreferences()
  const primaryCode =
    prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const [copied, setCopied] = useState(false)

  const handleCopySegment = useCallback(() => {
    const lines: string[] = []
    for (const verse of verses) {
      const tr = verse.tr?.[primaryCode] ?? verse.tr?.['en']
      const arTr = verse.tr?.['ar']
      lines.push(`[${verse.vk}]`)
      if (tr?.tx) lines.push(tr.tx)
      if (prefs.arabic && arTr?.tx) lines.push(arTr.tx)
    }
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [verses, primaryCode, prefs.arabic])

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
        <button
          onClick={handleCopySegment}
          className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/60"
          aria-label="Copy segment verses"
        >
          {copied ? (
            <Check size={13} className="text-green-500" />
          ) : (
            <Copy size={13} />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
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
  const primaryCode =
    prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'

  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? ''}-${zoom}-${prefs.arabic}-${prefs.wordByWord}`

  const [copiedAll, setCopiedAll] = useState(false)

  // Build lookup: cn → (verseNumber → VerseData) and cn → titles
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

  const segments = parseSegments(queryText)

  const handleCopyAllMarkdown = useCallback(() => {
    const parts: string[] = []
    for (const seg of segments) {
      const verses = getSegmentVerses(seg, byChapter)
      if (verses.length === 0) continue
      const title = chapterTitles.get(seg.cn) ?? `Chapter ${seg.cn}`
      parts.push(`## ${segmentLabel(seg)} — ${title}`)
      parts.push('')
      for (const verse of verses) {
        const tr = verse.tr?.[primaryCode] ?? verse.tr?.['en']
        const arTr = verse.tr?.['ar']
        parts.push(`**[${verse.vk}]**`)
        if (prefs.text && tr?.tx) parts.push(tr.tx)
        if (prefs.arabic && arTr?.tx) parts.push(arTr.tx)
        parts.push('')
      }
    }
    navigator.clipboard.writeText(parts.join('\n').trimEnd())
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    segments,
    byChapter,
    chapterTitles,
    primaryCode,
    prefs.text,
    prefs.arabic,
  ])

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
      {/* Copy all as markdown */}
      <div className="flex justify-end">
        <button
          onClick={handleCopyAllMarkdown}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60 border border-border/40"
          aria-label="Copy all results as markdown"
        >
          {copiedAll ? (
            <Check size={13} className="text-green-500" />
          ) : (
            <Copy size={13} />
          )}
          <span>{copiedAll ? 'Copied!' : 'Copy all as markdown'}</span>
        </button>
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
