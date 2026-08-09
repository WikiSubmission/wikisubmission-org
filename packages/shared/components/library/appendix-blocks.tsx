/**
 * The presentational primitives an appendix body is built from.
 *
 * Every class string these draw with comes from `lib/appendix-styles.ts`, the
 * same registry the converter matched the hardcoded TSX against. That is the
 * whole point of the arrangement: a Portable Text appendix has to render
 * identically to the hardcoded one, and looking the class string back out of
 * the registry the converter looked it up in makes that true by construction
 * rather than by a second table someone has to keep in agreement.
 *
 * These components never invent styling. A card the corpus grows that is not in
 * the registry is reported by the converter as a warning; it is not
 * approximated here.
 */
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

import {
  CARD_STYLES,
  CODE_STYLES,
  CODE_TEXT_STYLES,
  DIVIDER_ROW,
  DIVIDER_RULE,
  DIVIDER_TITLE,
  DIVIDER_TITLE_CENTERED,
  EVIDENCE_INTERLUDE,
  EVIDENCE_ROW,
  FIGURE_CAPTION,
  FIGURE_CARD,
  FIGURE_FRAME,
  FIGURE_FRAME_SM,
  FIGURE_IMAGE,
  GRID_CELL,
  GRID_NOTE,
  GRID_TABLE,
  GRID_TABLE_CARD,
  GROUP_STYLES,
  LIST_CONTENT_STYLES,
  LIST_ITEM_STYLES,
  LIST_STYLES,
  MARKER_STYLES,
  PARAGRAPH_STYLES,
  STATEMENT_BOX,
  TABLE_CAPTION_BAR,
  TABLE_CAPTION_TEXT,
  TABLE_CELL_STYLES,
  TABLE_HEADER_STYLES,
  TABLE_HEAD_ROW,
  TABLE_LIST_STYLE,
  TABLE_NOTE_STYLES,
  TABLE_ROW_STYLES,
  TABLE_SCROLLER,
  TABLE_SHELL,
  TABLE_STYLES,
  VERSE_BODY_STYLES,
  VERSE_CARD_STYLES,
  VERSE_ENTRY_STYLES,
  VERSE_REF_STYLES,
  type AppendixCardStyle,
  type AppendixCodeStyle,
  type AppendixCodeTextStyle,
  type AppendixGroupStyle,
  type AppendixListContentStyle,
  type AppendixListItemStyle,
  type AppendixListStyle,
  type AppendixMarkerStyle,
  type AppendixParagraphStyle,
  type AppendixTableCellStyle,
  type AppendixTableHeaderStyle,
  type AppendixTableNoteStyle,
  type AppendixTableRowStyle,
  type AppendixTableStyle,
  type AppendixVerseBodyStyle,
  type AppendixVerseCardStyle,
  type AppendixVerseEntryStyle,
  type AppendixVerseRefStyle,
} from '@/lib/appendix-styles'

/** An empty class string has to become `undefined`, not `class=""`. */
const cls = (value: string) => (value === '' ? undefined : value)

// ── paragraph ────────────────────────────────────────────────────────────────

export function AppendixParagraph({
  style,
  children,
}: {
  style: AppendixParagraphStyle
  children: ReactNode
}) {
  return <p className={cls(PARAGRAPH_STYLES[style])}>{children}</p>
}

// ── group ────────────────────────────────────────────────────────────────────

/**
 * A plain wrapper. Runs of paragraphs are grouped into one of these by the
 * renderer; explicit groups exist for the ones that carry a rhythm of their own
 * or hold something other than paragraphs.
 */
export function AppendixGroup({
  style,
  as = 'section',
  children,
}: {
  style: AppendixGroupStyle
  as?: 'section' | 'div'
  children: ReactNode
}) {
  const Tag = as
  return <Tag className={cls(GROUP_STYLES[style])}>{children}</Tag>
}

// ── divider ──────────────────────────────────────────────────────────────────

/** `<hr/> TITLE <hr/>` band that opens a part of an appendix. */
export function SectionDivider({
  centered,
  children,
}: {
  centered?: boolean
  children: ReactNode
}) {
  return (
    <div className={DIVIDER_ROW} data-parallax>
      <hr className={DIVIDER_RULE} />
      <h2 className={centered ? DIVIDER_TITLE_CENTERED : DIVIDER_TITLE}>{children}</h2>
      <hr className={DIVIDER_RULE} />
    </div>
  )
}

// ── evidence ─────────────────────────────────────────────────────────────────

/** One numbered item of physical evidence: badge, then its own content column. */
export function EvidenceItem({
  n,
  marker,
  body,
  children,
}: {
  n: number
  marker: AppendixMarkerStyle
  body: AppendixGroupStyle
  children: ReactNode
}) {
  return (
    <div className={EVIDENCE_ROW}>
      <span className={MARKER_STYLES[marker]}>{n}</span>
      <div className={GROUP_STYLES[body]}>{children}</div>
    </div>
  )
}

/** A term/definition row: fixed-width term on the left, explanation right. */
export function DefinitionRow({
  term,
  termStyle,
  bodyStyle,
  children,
}: {
  term: ReactNode
  termStyle: AppendixMarkerStyle
  bodyStyle: AppendixListContentStyle
  children: ReactNode
}) {
  return (
    <div className={EVIDENCE_ROW}>
      <span className={MARKER_STYLES[termStyle]}>{term}</span>
      <span className={cls(LIST_CONTENT_STYLES[bodyStyle])}>{children}</span>
    </div>
  )
}

/** An editorial aside between evidence items, indented to clear their badges. */
export function EvidenceInterlude({ children }: { children: ReactNode }) {
  return <p className={EVIDENCE_INTERLUDE}>{children}</p>
}

// ── statement ────────────────────────────────────────────────────────────────

/** A single centred monospace assertion, e.g. "15 + 99 = 114 = 19x6." */
export function StatementBox({ children }: { children: ReactNode }) {
  return (
    <div data-card className={STATEMENT_BOX}>
      {children}
    </div>
  )
}

// ── callout ──────────────────────────────────────────────────────────────────

/**
 * A bordered prose card.
 *
 * The surface is whatever `style` names in the registry. The destructive-
 * surfaced `statement` is the one that carries an argument rather than a look:
 * it marks appendix 24's two injected verses as forgeries. In markdown that
 * distinction was gone, and they rendered as an ordinary blockquote, identical
 * to the genuine scripture quoted around them.
 */
export function AppendixCallout({
  style,
  reveal = true,
  as = 'div',
  children,
}: {
  style: AppendixCardStyle
  reveal?: boolean
  as?: 'div' | 'blockquote'
  children: ReactNode
}) {
  const Tag = as
  return (
    <Tag data-card={reveal ? '' : undefined} className={CARD_STYLES[style]}>
      {children}
    </Tag>
  )
}

// ── scripture cards ──────────────────────────────────────────────────────────

export interface VerseCardEntry {
  key: string
  body: ReactNode
  reference?: ReactNode
  wrapper: AppendixVerseEntryStyle
}

/**
 * One or more scripture quotations in a tinted card.
 *
 * The per-entry `wrapper` is the field the markdown conversion lost. Appendix
 * 24 closes with four verses, each its own card separated by a rule; as
 * markdown they merged into a single continuous blockquote with no separation
 * at all.
 */
export function VerseCards({
  style,
  body,
  refStyle,
  heading,
  headingStyle,
  reveal = true,
  entries,
}: {
  style: AppendixVerseCardStyle
  body: AppendixVerseBodyStyle
  refStyle: AppendixVerseRefStyle
  heading?: ReactNode
  headingStyle?: AppendixParagraphStyle
  reveal?: boolean
  entries: VerseCardEntry[]
}) {
  return (
    <div data-card={reveal ? '' : undefined} className={VERSE_CARD_STYLES[style]}>
      {heading !== undefined && (
        <p className={cls(PARAGRAPH_STYLES[headingStyle ?? 'normal'])}>{heading}</p>
      )}
      {entries.map((entry) => {
        const quote = (
          <>
            <p className={VERSE_BODY_STYLES[body]}>{entry.body}</p>
            {entry.reference !== undefined && (
              <p className={VERSE_REF_STYLES[refStyle]}>{entry.reference}</p>
            )}
          </>
        )
        // An unwrapped quotation keeps its paragraphs as direct children of the
        // card, so the card's own `space-y` rhythm sets the gap between them. A
        // wrapper element here would capture that rhythm and change the layout,
        // which is why this is a Fragment and not a `display: contents` span.
        if (entry.wrapper === 'none') {
          return <Fragment key={entry.key}>{quote}</Fragment>
        }
        return (
          <div key={entry.key} className={cls(VERSE_ENTRY_STYLES[entry.wrapper])}>
            {quote}
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
  reveal = true,
  caption,
  source,
}: {
  src: string
  alt: string
  width: number
  height: number
  frame: 'full' | 'sm'
  reveal?: boolean
  caption?: ReactNode
  source?: ReactNode
}) {
  const image = (
    <Image src={src} alt={alt} width={width} height={height} className={FIGURE_IMAGE} />
  )

  if (frame === 'sm') {
    return (
      <div data-card={reveal ? '' : undefined} className={FIGURE_FRAME_SM}>
        {image}
      </div>
    )
  }

  return (
    <div data-card={reveal ? '' : undefined} className={FIGURE_CARD}>
      <div className={FIGURE_FRAME}>{image}</div>
      {caption !== undefined && <p className={FIGURE_CAPTION}>{caption}</p>}
      {source}
    </div>
  )
}

// ── badge list ───────────────────────────────────────────────────────────────

export interface BadgeListItem {
  key: string
  content: ReactNode
}

/**
 * Wraps an item's body in whatever element the source used. A `<p>` and a
 * `<span>` are not interchangeable here: the corpus writes both, and the
 * paragraph ones carry their own type scale and leading.
 */
function ItemBody({
  tag,
  style,
  children,
}: {
  tag: 'none' | 'span' | 'p' | 'div'
  style: AppendixListContentStyle
  children: ReactNode
}) {
  if (tag === 'none') return <>{children}</>
  const Tag = tag
  return <Tag className={cls(LIST_CONTENT_STYLES[style])}>{children}</Tag>
}

/** A list whose markers are tinted badges or bullets rather than list markers. */
export function BadgeList({
  ordered,
  style,
  item,
  marker,
  content,
  contentTag,
  bullet,
  items,
}: {
  ordered: boolean
  style: AppendixListStyle
  item: AppendixListItemStyle
  marker?: AppendixMarkerStyle
  content: AppendixListContentStyle
  contentTag: 'none' | 'span' | 'p' | 'div'
  bullet?: string
  items: BadgeListItem[]
}) {
  const List = ordered ? 'ol' : 'ul'
  return (
    <List className={cls(LIST_STYLES[style])}>
      {items.map((entry, i) => (
        <li key={entry.key} className={cls(LIST_ITEM_STYLES[item])}>
          {marker !== undefined && (
            <span className={MARKER_STYLES[marker]}>{bullet ?? i + 1}</span>
          )}
          <ItemBody tag={contentTag} style={content}>
            {entry.content}
          </ItemBody>
        </li>
      ))}
    </List>
  )
}

// ── data table ───────────────────────────────────────────────────────────────

export interface DataTableColumn {
  key: string
  header?: ReactNode
  headerStyle: AppendixTableHeaderStyle
  cellStyle: AppendixTableCellStyle
}

export interface DataTableRow {
  key: string
  style: AppendixTableRowStyle
  cells: Array<{ key: string; content: ReactNode }>
  cellStyles?: AppendixTableCellStyle[]
}

/**
 * The captioned tables the corpus writes out by hand.
 *
 * Cell recipes hang off the column rather than the cell, because that is how
 * the source is written: a column is monospace, or right-aligned, or the
 * primary-coloured one carrying the count. A row that departs from its columns
 * (a totals row, usually) overrides them, and the `totals*` row styles are what
 * keep a total from reading as one more data row.
 */
export function DataTable({
  caption,
  table,
  columns,
  rows,
  note,
  noteStyle,
  noteInside,
  reveal = true,
}: {
  caption?: ReactNode
  table: AppendixTableStyle
  columns: DataTableColumn[]
  rows: DataTableRow[]
  note?: ReactNode
  noteStyle?: AppendixTableNoteStyle
  noteInside?: boolean
  reveal?: boolean
}) {
  const hasHeaders = columns.some((column) => column.header !== undefined)
  const noteBlock =
    note === undefined ? null : <div className={TABLE_NOTE_STYLES[noteStyle ?? 'plain']}>{note}</div>
  return (
    <div data-card={reveal ? '' : undefined} className={TABLE_SHELL}>
      {caption !== undefined && (
        <div className={TABLE_CAPTION_BAR}>
          <p className={TABLE_CAPTION_TEXT}>{caption}</p>
        </div>
      )}
      <div className={TABLE_SCROLLER}>
        <table className={TABLE_STYLES[table]}>
          {hasHeaders && (
            <thead>
              <tr className={TABLE_HEAD_ROW}>
                {columns.map((column) => (
                  <th key={column.key} className={TABLE_HEADER_STYLES[column.headerStyle]}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={TABLE_ROW_STYLES[row.style]}>
                {row.cells.map((cell, j) => (
                  <td
                    key={cell.key}
                    className={
                      TABLE_CELL_STYLES[
                        row.cellStyles?.[j] ?? columns[j]?.cellStyle ?? 'plain'
                      ]
                    }
                  >
                    {cell.content}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {noteInside ? noteBlock : null}
      </div>
      {noteInside ? null : noteBlock}
    </div>
  )
}

// ── list card ────────────────────────────────────────────────────────────────

/** A captioned card whose rows are list items rather than table cells. */
export function ListCard({
  caption,
  item,
  marker,
  content,
  contentTag,
  items,
  reveal = true,
}: {
  caption?: ReactNode
  item: AppendixListItemStyle
  marker?: AppendixMarkerStyle
  content: AppendixListContentStyle
  contentTag: 'none' | 'span' | 'p' | 'div'
  items: BadgeListItem[]
  reveal?: boolean
}) {
  return (
    <div data-card={reveal ? '' : undefined} className={TABLE_SHELL}>
      {caption !== undefined && (
        <div className={TABLE_CAPTION_BAR}>
          <p className={TABLE_CAPTION_TEXT}>{caption}</p>
        </div>
      )}
      <ul className={TABLE_LIST_STYLE}>
        {items.map((entry, i) => (
          <li key={entry.key} className={cls(LIST_ITEM_STYLES[item])}>
            {marker !== undefined && <span className={MARKER_STYLES[marker]}>{i + 1}</span>}
            <ItemBody tag={contentTag} style={content}>
              {entry.content}
            </ItemBody>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── code ─────────────────────────────────────────────────────────────────────

/** A scrolling strip of monospace text, e.g. a digit sequence. */
export function AppendixCode({
  style,
  text,
  value,
}: {
  style: AppendixCodeStyle
  text: AppendixCodeTextStyle
  value: string
}) {
  return (
    <div className={CODE_STYLES[style]}>
      <code className={CODE_TEXT_STYLES[text]}>{value}</code>
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
 * The bordered-grid table of appendices 26, 29 and 33: rich cells full of
 * scripture badges, `colSpan` sub-headings, and a bold totals row.
 */
export function GridTable({
  headers,
  rows,
  notes,
  reveal = true,
}: {
  headers: Array<{ key: string; content: ReactNode }>
  rows: GridTableRow[]
  notes?: Array<{ key: string; content: ReactNode }>
  reveal?: boolean
}) {
  return (
    <div data-card={reveal ? '' : undefined} className={GRID_TABLE_CARD}>
      <table className={GRID_TABLE}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key} className={GRID_CELL}>
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
                  className={
                    row.variant === 'group'
                      ? `${GRID_CELL} font-semibold`
                      : row.alignTop
                        ? `${GRID_CELL} align-top`
                        : GRID_CELL
                  }
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {notes?.map((note) => (
        <p key={note.key} className={GRID_NOTE}>
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
