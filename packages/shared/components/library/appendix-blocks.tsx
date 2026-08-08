/**
 * The presentational primitives an appendix body is built from.
 *
 * Every component here is a verbatim copy of markup that already exists in
 * `content/library/appendices/appendix-*.tsx`, class string for class string.
 * That is deliberate and is the whole point of the file: a Portable Text
 * appendix has to render pixel-identically to the hardcoded one, so the
 * Portable Text renderer draws *through* these rather than inventing its own
 * approximation of the same card.
 *
 * The hardcoded corpus is not internally consistent — the same kind of card is
 * written with `space-y-2` in one appendix and `space-y-4` in another — so the
 * variant props below are closed enums covering the shapes that actually
 * occur. Adding a new appendix may add a variant; it must never add a free-form
 * class name, or the fidelity guarantee is gone.
 *
 * Class strings are written out in full in the lookup tables rather than
 * assembled from fragments, because Tailwind only generates classes it can see
 * literally in the source.
 */
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

import type { AppendixGap, AppendixTone } from '@/lib/appendix-portable-text'

// ── shared recipes ───────────────────────────────────────────────────────────

/** Card border + fill per tone. */
const TONE_SURFACE: Record<AppendixTone, string> = {
  primary: 'border-primary/20 bg-primary/5',
  destructive: 'border-destructive/20 bg-destructive/5',
  neutral: 'border-border/60',
  muted: 'border-border/60 bg-muted/20',
}

/** Eyebrow label colour per tone. */
const TONE_LABEL: Record<AppendixTone, string> = {
  primary: 'font-semibold text-primary/80 uppercase tracking-widest text-xs',
  destructive: 'font-semibold text-destructive/80 uppercase tracking-widest text-xs',
  neutral: 'font-semibold text-foreground/80 uppercase tracking-widest text-xs',
  muted: 'font-semibold text-muted-foreground uppercase tracking-widest text-xs',
}

/** Badge colour per tone. */
const TONE_BADGE: Record<AppendixTone, string> = {
  primary: 'bg-primary/10 text-primary',
  destructive: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-foreground',
  muted: 'bg-muted text-muted-foreground',
}

const GAP: Record<AppendixGap, string> = {
  none: '',
  xs: 'space-y-2',
  sm: 'space-y-3',
  md: 'space-y-4',
  lg: 'space-y-5',
  xl: 'space-y-6',
}

const join = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(' ')

// ── section ──────────────────────────────────────────────────────────────────

/**
 * `<section>` wrapper. Runs of plain paragraphs are grouped into one of these
 * by the renderer; explicit sections exist for the handful that carry a
 * different rhythm or hold something other than paragraphs.
 */
export function AppendixSection({
  gap,
  prose,
  children,
}: {
  gap: AppendixGap
  prose: boolean
  children: ReactNode
}) {
  return (
    <section
      className={join(GAP[gap], prose && 'text-base leading-relaxed text-foreground/90')}
    >
      {children}
    </section>
  )
}

// ── divider ──────────────────────────────────────────────────────────────────

/** `<hr/> TITLE <hr/>` band that opens a part of an appendix. */
export function SectionDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4" data-parallax>
      <hr className="flex-1 border-border/50" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0 text-center">
        {children}
      </h2>
      <hr className="flex-1 border-border/50" />
    </div>
  )
}

// ── evidence ─────────────────────────────────────────────────────────────────

/** One numbered item of physical evidence: badge, then its own content column. */
export function EvidenceItem({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
        {n}
      </span>
      <div className="text-sm leading-relaxed text-foreground/85 space-y-3 flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

/** An editorial aside between evidence items, indented to clear their badges. */
export function EvidenceInterlude({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-foreground/85 italic pl-10">{children}</p>
  )
}

// ── statement ────────────────────────────────────────────────────────────────

/** A single centred monospace assertion, e.g. "15 + 99 = 114 = 19×6." */
export function StatementBox({ children }: { children: ReactNode }) {
  return (
    <div
      data-card
      className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-center font-mono text-sm text-primary leading-relaxed"
    >
      {children}
    </div>
  )
}

// ── callout ──────────────────────────────────────────────────────────────────

/**
 * Padding, rhythm and type scale per named callout style. Each entry is one
 * card recipe that exists in the hardcoded corpus.
 */
export const CALLOUT_STYLE: Record<string, string> = {
  /** Labelled quotation card — appendix 24's two false verses. */
  statement: 'p-5 space-y-2 text-sm',
  /** Enumerated conclusions. */
  summary: 'p-5 space-y-2 text-sm text-foreground/85',
  /** Closing acknowledgement. */
  aside: 'p-5 text-sm italic text-foreground/75 leading-relaxed',
  /** A run of quoted passages from an outside source. */
  quotation: 'p-5 space-y-4 text-sm italic text-foreground/80',
  /** A single translated source passage under a figure. */
  source: 'p-5 text-sm italic text-foreground/80 leading-relaxed',
  /** Centred arithmetic. */
  arithmetic: 'p-5 space-y-2 text-sm text-center font-mono',
  /** An inline remark attached to a table or an evidence item. */
  remark: 'px-5 py-4 text-sm leading-relaxed text-foreground/80',
  /** A computed result plus its explanation. */
  result: 'px-5 py-4 space-y-2',
}

const PARAGRAPH_EMPHASIS: Record<string, string> = {
  result: 'font-bold text-base',
  mono: 'font-mono text-sm text-primary break-words',
  caption: 'text-xs text-muted-foreground leading-relaxed',
  passage: 'italic text-foreground/80 leading-relaxed',
}

export interface CalloutParagraph {
  key: string
  content: ReactNode
  emphasis?: string
  spaced?: boolean
}

/**
 * A bordered prose card.
 *
 * `tone` is the field that matters: `destructive` is what marks appendix 24's
 * two injected verses as forgeries. In markdown that distinction was gone —
 * they rendered as an ordinary blockquote, identical to genuine scripture.
 */
export function AppendixCallout({
  tone,
  style,
  label,
  paragraphs,
  footnote,
  footnoteSpaced,
}: {
  tone: AppendixTone
  style: string
  label?: ReactNode
  paragraphs: CalloutParagraph[]
  footnote?: ReactNode
  /** `source` cards separate the tag from the quote it follows. */
  footnoteSpaced?: boolean
}) {
  const recipe = CALLOUT_STYLE[style] ?? CALLOUT_STYLE.statement
  return (
    <div data-card className={join('rounded-xl border', TONE_SURFACE[tone], recipe)}>
      {label !== undefined && <p className={TONE_LABEL[tone]}>{label}</p>}
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.key}
          className={join(
            paragraph.emphasis ? PARAGRAPH_EMPHASIS[paragraph.emphasis] : undefined,
            paragraph.spaced && 'pt-2',
          )}
        >
          {paragraph.content}
        </p>
      ))}
      {footnote !== undefined && (
        <p
          className={join(
            'text-xs not-italic text-muted-foreground font-mono',
            footnoteSpaced && 'mt-2',
          )}
        >
          {footnote}
        </p>
      )}
    </div>
  )
}

// ── scripture cards ──────────────────────────────────────────────────────────

export interface VerseCardEntry {
  key: string
  body: ReactNode
  reference?: ReactNode
}

/**
 * One or more scripture quotations in a tinted card.
 *
 * `divided` is the field the markdown conversion lost. Appendix 24 closes with
 * four verses, each its own card separated by a rule; as markdown they merged
 * into a single continuous blockquote with no separation at all.
 */
export function VerseCards({
  align,
  size,
  gap,
  divided,
  entries,
}: {
  align: 'start' | 'center'
  size: 'sm' | 'base'
  gap: AppendixGap
  divided: boolean
  entries: VerseCardEntry[]
}) {
  const bodyClass =
    size === 'base'
      ? 'text-base leading-relaxed italic text-foreground/90'
      : 'text-sm leading-relaxed italic text-foreground/90'

  return (
    <div
      data-card
      className={join(
        'rounded-xl border border-primary/20 bg-primary/5 p-6',
        align === 'center' && 'text-center',
        GAP[gap],
      )}
    >
      {entries.map((entry, i) => {
        const body = (
          <>
            <p className={bodyClass}>{entry.body}</p>
            {entry.reference !== undefined && (
              <p
                className={join(
                  'text-xs text-muted-foreground font-mono',
                  divided && 'mt-1',
                )}
              >
                {entry.reference}
              </p>
            )}
          </>
        )
        // Undivided single-quote cards keep the paragraphs as direct children so
        // the card's own rhythm sets the gap; a divided stack needs the wrapper
        // to hang the rule on.
        if (!divided) return <Fragment key={entry.key}>{body}</Fragment>
        return (
          <div key={entry.key} className={i > 0 ? 'border-t border-border/40 pt-4' : undefined}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

// ── figure ───────────────────────────────────────────────────────────────────

/** A scanned insert: framed image with a caption or a translated-source card. */
export function AppendixFigure({
  src,
  alt,
  width,
  height,
  frame,
  caption,
  source,
}: {
  src: string
  alt: string
  width: number
  height: number
  frame: 'full' | 'sm'
  caption?: ReactNode
  source?: ReactNode
}) {
  const image = (
    <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" />
  )

  if (frame === 'sm') {
    return (
      <div
        data-card
        className="rounded-lg border border-border/30 overflow-hidden bg-muted/20 max-w-sm mx-auto"
      >
        {image}
      </div>
    )
  }

  return (
    <div data-card className="space-y-3">
      <div className="rounded-lg border border-border/30 overflow-hidden bg-muted/20">
        {image}
      </div>
      {caption !== undefined && (
        <p className="text-xs text-muted-foreground leading-relaxed">{caption}</p>
      )}
      {source}
    </div>
  )
}

// ── badge list ───────────────────────────────────────────────────────────────

export interface BadgeListItem {
  key: string
  content: ReactNode
}

/** A numbered list whose markers are tinted badges rather than list markers. */
export function BadgeList({
  tone,
  ordered,
  density,
  items,
}: {
  tone: AppendixTone
  ordered: boolean
  density: 'compact' | 'comfortable'
  items: BadgeListItem[]
}) {
  const List = ordered ? 'ol' : 'ul'
  const compact = density === 'compact'
  const badge = compact
    ? join(
        'shrink-0 flex items-center justify-center size-6 rounded-md',
        TONE_BADGE[tone],
        'font-mono text-xs font-semibold',
      )
    : join(
        'shrink-0 flex items-center justify-center size-7 rounded-md',
        TONE_BADGE[tone],
        'font-mono text-xs font-semibold mt-0.5',
      )

  return (
    <List className={compact ? 'space-y-2 list-none' : 'space-y-2'}>
      {items.map((item, i) => (
        <li
          key={item.key}
          className={compact ? 'flex items-baseline gap-3' : 'flex items-start gap-3'}
        >
          <span className={badge}>{i + 1}</span>
          {compact ? (
            <p>{item.content}</p>
          ) : (
            <span className="text-sm leading-relaxed">{item.content}</span>
          )}
        </li>
      ))}
    </List>
  )
}

// ── math table ───────────────────────────────────────────────────────────────

/**
 * The captioned monospace table of appendix 24.
 *
 * `totals` is a field rather than trailing rows, and that is the fix this work
 * exists for: converted to markdown, all 42 totals rows in this appendix became
 * byte-identical to ordinary data rows in a document whose entire argument is
 * arithmetic.
 */
export function MathTable({
  caption,
  headers,
  rows,
  totals,
  note,
}: {
  caption: string
  headers: string[]
  rows: Array<Array<string | number>>
  totals?: Array<Array<string | number>>
  note?: ReactNode
}) {
  return (
    <div data-card className="rounded-xl border border-border/60 overflow-hidden">
      <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {caption}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/20 hover:bg-muted/20 transition-colors"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-1.5 font-mono text-xs whitespace-nowrap ${
                      j === 0 ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {totals?.map((t, i) => (
              <tr
                key={`t-${i}`}
                className={`bg-primary/5 font-semibold ${
                  i === 0 ? 'border-t border-border/40' : ''
                }`}
              >
                {t.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-2 font-mono text-xs text-primary whitespace-nowrap"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note !== undefined && (
        <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground leading-relaxed">
          {note}
        </div>
      )}
    </div>
  )
}

// ── grid table ───────────────────────────────────────────────────────────────

export interface GridTableCell {
  key: string
  content: ReactNode
  colSpan?: number
}

export interface GridTableRow {
  key: string
  variant: 'data' | 'total' | 'group'
  alignTop?: boolean
  cells: GridTableCell[]
}

/**
 * The bordered-grid table of appendices 26 and 33: rich cells full of scripture
 * badges, `colSpan` sub-headings, and a bold totals row.
 */
export function GridTable({
  headers,
  rows,
  notes,
}: {
  headers: Array<{ key: string; content: ReactNode }>
  rows: GridTableRow[]
  notes?: Array<{ key: string; content: ReactNode }>
}) {
  return (
    <div
      data-card
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto"
    >
      <table className="w-full text-sm border-collapse">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="border border-border/40 px-3 py-2 text-left">
                  {header.content}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={row.variant === 'total' ? 'font-semibold' : undefined}>
              {row.cells.map((cell) => (
                <td
                  key={cell.key}
                  colSpan={cell.colSpan}
                  className={join(
                    'border border-border/40 px-3 py-2 text-left',
                    row.variant === 'group' && 'font-semibold',
                    row.alignTop && 'align-top',
                  )}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {notes?.map((note) => (
        <p key={note.key} className="text-xs text-muted-foreground">
          {note.content}
        </p>
      ))}
    </div>
  )
}

// ── inline ───────────────────────────────────────────────────────────────────

/** Cross-reference to a sibling appendix. */
export function AppendixLink({ n }: { n: number }) {
  return (
    <Link href={`/appendices/${n}`} className="text-primary underline underline-offset-2">
      Appendix {n}
    </Link>
  )
}
