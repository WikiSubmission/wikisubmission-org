/**
 * Pure helpers for editing `richTableBlock` values — the table blocks authored
 * in the retired Studio by sanity-plugin-rich-table. Kept free of React and of
 * any @portabletext/editor import so the structural rules are unit-testable.
 *
 * Two rules drive every function here:
 *
 * 1. Nothing is ever dropped. Every returned value is a shallow copy of the
 *    input with only the touched field replaced, so unknown fields on the
 *    block, on a row, on a cell or on a column header survive an edit. Rows and
 *    cells that were not touched keep their identity (same object reference and
 *    the same `_key`).
 * 2. Cell content stays Portable Text. A cell is only editable when its blocks
 *    are simple enough to survive the marker round-trip in pt-text.ts (plain
 *    paragraphs, known decorators, link annotations). Anything richer is
 *    reported as read-only by `isEditableCell` so the UI can refuse to edit it
 *    rather than flatten it.
 */
import {
  parseBlockText,
  randomKey,
  serializeBlockText,
  type PTBlock,
  type PTMarkDef,
  type PTSpan,
} from './pt-text'

export interface RichTableCell {
  _key?: string
  _type?: string
  content?: unknown
  [key: string]: unknown
}

export interface RichTableRow {
  _key?: string
  _type?: string
  title?: string
  cells?: RichTableCell[]
  [key: string]: unknown
}

export interface RichTableColumnHeader {
  _key?: string
  _type?: string
  title?: string
  cellIndex?: number
  [key: string]: unknown
}

export interface RichTableValue {
  _key?: string
  _type?: string
  rows?: RichTableRow[]
  columnHeaders?: RichTableColumnHeader[]
  hasColumnTitles?: boolean
  hasRowTitles?: boolean
  [key: string]: unknown
}

/** Fields of the block this editor owns; everything else is passed through. */
export const TABLE_FIELDS = ['rows', 'columnHeaders', 'hasColumnTitles', 'hasRowTitles'] as const

// `_type` values the Studio wrote for new array members. The array member for
// rows is declared as `name: 'row'` (type richTableRow), which is what Sanity
// stores — see richTable.object.tsx in sanity-plugin-rich-table. New items copy
// the `_type` of an existing sibling when there is one, so a document that was
// stored with different names stays internally consistent.
const DEFAULT_ROW_TYPE = 'row'
const DEFAULT_CELL_TYPE = 'richTableCell'
const DEFAULT_HEADER_TYPE = 'columnHeader'

/** Decorator marks pt-text.ts can serialize and parse back without loss. */
const ROUND_TRIP_DECORATORS = new Set(['strong', 'em', 'underline', 'strike-through', 'code'])

/** Fields of a link markDef the marker syntax carries. */
const LINK_DEF_FIELDS = new Set(['_key', '_type', 'href', 'blank'])

/**
 * Array accessors that tolerate a malformed stored value. The schema says these
 * are arrays, but a table that was hand-edited or half-migrated must not crash
 * the editor for the whole article.
 */
export function tableRows(table: RichTableValue): RichTableRow[] {
  return Array.isArray(table.rows) ? table.rows : []
}

export function tableColumnHeaders(table: RichTableValue): RichTableColumnHeader[] {
  return Array.isArray(table.columnHeaders) ? table.columnHeaders : []
}

export function rowCells(row: RichTableRow | undefined): RichTableCell[] {
  return Array.isArray(row?.cells) ? row.cells : []
}

function siblingType(items: Array<{ _type?: unknown }> | undefined, fallback: string): string {
  const found = items?.find((item) => typeof item?._type === 'string' && item._type !== '')
  return typeof found?._type === 'string' ? found._type : fallback
}

function rowType(table: RichTableValue): string {
  return siblingType(tableRows(table), DEFAULT_ROW_TYPE)
}

function cellType(table: RichTableValue): string {
  const cells = tableRows(table).flatMap((row) => rowCells(row))
  return siblingType(cells, DEFAULT_CELL_TYPE)
}

function headerType(table: RichTableValue): string {
  return siblingType(tableColumnHeaders(table), DEFAULT_HEADER_TYPE)
}

function emptyBlock(): PTBlock {
  const span: PTSpan = { _type: 'span', _key: randomKey(), text: '', marks: [] }
  return { _type: 'block', _key: randomKey(), style: 'normal', markDefs: [], children: [span] }
}

function emptyCell(type: string): RichTableCell {
  return { _type: type, _key: randomKey(), content: [emptyBlock()] }
}

function emptyHeader(type: string, cellIndex: number): RichTableColumnHeader {
  return { _type: type, _key: randomKey(), cellIndex }
}

/** Widest row, or the header count — whichever implies more columns. */
export function columnCount(table: RichTableValue): number {
  const widest = tableRows(table).reduce((max, row) => Math.max(max, rowCells(row).length), 0)
  return Math.max(tableColumnHeaders(table).length, widest)
}

export function rowCount(table: RichTableValue): number {
  return tableRows(table).length
}

/** Grows `cells` to `length` with fresh empty cells; existing cells are kept. */
function padCells(cells: RichTableCell[], length: number, type: string): RichTableCell[] {
  if (cells.length >= length) return cells
  const padded = [...cells]
  while (padded.length < length) padded.push(emptyCell(type))
  return padded
}

function padHeaders(
  headers: RichTableColumnHeader[],
  length: number,
  type: string,
): RichTableColumnHeader[] {
  if (headers.length >= length) return headers
  const padded = [...headers]
  while (padded.length < length) padded.push(emptyHeader(type, padded.length))
  return padded
}

// ── structural edits ─────────────────────────────────────────────────────────

/** Appends a row as wide as the table (at least one cell). */
export function addRow(table: RichTableValue): RichTableValue {
  const rows = tableRows(table)
  const width = Math.max(columnCount(table), 1)
  const type = cellType(table)
  const row: RichTableRow = {
    _type: rowType(table),
    _key: randomKey(),
    cells: Array.from({ length: width }, () => emptyCell(type)),
  }
  return { ...table, rows: [...rows, row] }
}

/** Removes one row. Out-of-range indexes are a no-op. */
export function removeRow(table: RichTableValue, index: number): RichTableValue {
  const rows = tableRows(table)
  if (index < 0 || index >= rows.length) return table
  return { ...table, rows: rows.filter((_, i) => i !== index) }
}

/**
 * Appends a column: one cell on every row and, when the table already has
 * column headers, a matching header. A table stored without headers stays
 * without them so its public rendering does not gain a `<thead>`.
 */
export function addColumn(table: RichTableValue): RichTableValue {
  const width = columnCount(table) + 1
  const type = cellType(table)
  const next: RichTableValue = {
    ...table,
    rows: tableRows(table).map((row) => ({ ...row, cells: padCells(rowCells(row), width, type) })),
  }
  const headers = tableColumnHeaders(table)
  if (headers.length > 0) {
    next.columnHeaders = padHeaders(headers, width, headerType(table))
  }
  return next
}

/**
 * Removes the column at `index` from every row and drops its header. Remaining
 * headers get their `cellIndex` renumbered to their new position; every other
 * field on them is left alone.
 */
export function removeColumn(table: RichTableValue, index: number): RichTableValue {
  if (index < 0 || index >= columnCount(table)) return table
  const next: RichTableValue = {
    ...table,
    rows: tableRows(table).map((row) => {
      const cells = rowCells(row)
      if (index >= cells.length) return row
      return { ...row, cells: cells.filter((_, i) => i !== index) }
    }),
  }
  const headers = tableColumnHeaders(table)
  if (index < headers.length) {
    next.columnHeaders = headers
      .filter((_, i) => i !== index)
      .map((header, i) =>
        typeof header.cellIndex === 'number' && header.cellIndex !== i
          ? { ...header, cellIndex: i }
          : header,
      )
  }
  return next
}

/** Sets a column header title, materializing headers up to `index` if needed. */
export function setColumnHeaderTitle(
  table: RichTableValue,
  index: number,
  title: string,
): RichTableValue {
  if (index < 0) return table
  const headers = padHeaders(tableColumnHeaders(table), index + 1, headerType(table))
  return {
    ...table,
    columnHeaders: headers.map((header, i) => (i === index ? { ...header, title } : header)),
  }
}

export function setHasColumnTitles(table: RichTableValue, value: boolean): RichTableValue {
  return { ...table, hasColumnTitles: value }
}

export function setHasRowTitles(table: RichTableValue, value: boolean): RichTableValue {
  return { ...table, hasRowTitles: value }
}

// ── cell content ─────────────────────────────────────────────────────────────

function isLinkDef(raw: unknown): raw is PTMarkDef {
  const def = raw as PTMarkDef | null
  if (!def || typeof def !== 'object') return false
  if (def._type !== 'link' || typeof def._key !== 'string') return false
  return Object.keys(def).every((key) => LINK_DEF_FIELDS.has(key))
}

/**
 * True when a block survives serialize → edit → parse untouched in substance:
 * a plain paragraph whose children are spans carrying only decorators this
 * module knows and at most one link annotation.
 */
function isRoundTrippableBlock(raw: unknown): boolean {
  const block = raw as PTBlock | null
  if (!block || typeof block !== 'object' || Array.isArray(block)) return false
  if (block._type !== 'block') return false
  if (block.style !== undefined && block.style !== 'normal') return false
  if (block.listItem !== undefined) return false

  const markDefs = block.markDefs
  if (markDefs !== undefined) {
    if (!Array.isArray(markDefs) || !markDefs.every(isLinkDef)) return false
  }
  const linkKeys = new Set((markDefs ?? []).map((def) => def._key))

  const children = block.children
  if (children === undefined) return true
  if (!Array.isArray(children)) return false
  return children.every((raw) => {
    const child = raw as PTSpan | null
    if (!child || typeof child !== 'object') return false
    if (child._type !== 'span' || typeof child.text !== 'string') return false
    const marks = child.marks
    if (marks === undefined) return true
    if (!Array.isArray(marks)) return false
    if (marks.filter((mark) => linkKeys.has(mark)).length > 1) return false
    return marks.every((mark) => ROUND_TRIP_DECORATORS.has(mark) || linkKeys.has(mark))
  })
}

/**
 * True when the cell can be edited as marker text without losing anything.
 * A cell whose content the marker syntax cannot express (headings, lists,
 * inline objects, custom annotations) is reported as not editable so the UI
 * shows it read-only instead of flattening it.
 */
export function isEditableCell(cell: RichTableCell | undefined): boolean {
  const content = cell?.content
  if (content === undefined || content === null) return true
  if (!Array.isArray(content)) return false
  return content.every(isRoundTrippableBlock)
}

/** Cell content as editable marker text; one line per Portable Text block. */
export function cellToText(cell: RichTableCell | undefined): string {
  const content = cell?.content
  if (!Array.isArray(content)) return ''
  return content.map((block) => serializeBlockText(block as PTBlock)).join('\n')
}

/**
 * Marker text back to Portable Text blocks. Each line maps to the block that
 * previously sat at that position, so its `_key` and any other stored field are
 * kept and only `children`/`markDefs` are rewritten.
 */
export function textToCellContent(existing: unknown, text: string): PTBlock[] {
  const previous = Array.isArray(existing) ? (existing as PTBlock[]) : []
  return text.split('\n').map((line, i) => {
    const base = previous[i]
    const { children, markDefs } = parseBlockText(line)
    const keep = base && typeof base === 'object' && !Array.isArray(base) ? base : undefined
    return {
      ...keep,
      _type: 'block' as const,
      _key: typeof keep?._key === 'string' ? keep._key : randomKey(),
      style: typeof keep?.style === 'string' ? keep.style : 'normal',
      children,
      markDefs,
    }
  })
}

/**
 * The marker text a cell will read back as once `text` is stored. The UI uses
 * it to tell its own write apart from an external change, so escaping applied
 * on the way in (`*` → `\*`) does not fight the caret while typing.
 */
export function normalizeCellText(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const { children, markDefs } = parseBlockText(line)
      return serializeBlockText({ _type: 'block', children, markDefs })
    })
    .join('\n')
}

/**
 * Writes marker text into one cell. Rows narrower than `cellIndex` are padded
 * with empty cells first, so a ragged table can be filled in.
 */
export function setCellText(
  table: RichTableValue,
  rowIndex: number,
  cellIndex: number,
  text: string,
): RichTableValue {
  const rows = tableRows(table)
  const row = rows[rowIndex]
  if (!row || cellIndex < 0) return table

  const cells = padCells(rowCells(row), cellIndex + 1, cellType(table))
  const cell = cells[cellIndex]
  const nextCell: RichTableCell = { ...cell, content: textToCellContent(cell.content, text) }
  const nextRow: RichTableRow = {
    ...row,
    cells: cells.map((current, i) => (i === cellIndex ? nextCell : current)),
  }
  return { ...table, rows: rows.map((current, i) => (i === rowIndex ? nextRow : current)) }
}
