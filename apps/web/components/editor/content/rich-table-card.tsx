'use client'

/**
 * Cell-level editor for `richTableBlock` — the table blocks authored in the
 * retired Studio by sanity-plugin-rich-table.
 *
 * The card is a void island inside the Portable Text editable
 * (`contentEditable={false}`), so the surrounding article keeps behaving
 * normally while the table is edited with plain form controls. Every edit goes
 * through the pure helpers in pt-table.ts, which copy the block and replace
 * only the touched field, and is written back with a single `block.set`
 * carrying just the fields that actually changed. Fields the Studio stored but
 * this editor does not know about are never sent and therefore never dropped.
 *
 * Cells are edited as marker text (**bold**, [label](href), …) using the same
 * grammar as pt-text.ts, so decorators and links survive a round-trip. A cell
 * whose Portable Text the grammar cannot express (a heading, a list, an inline
 * object, a custom annotation) is shown read-only rather than flattened.
 */
import { useEffect, useRef, useState } from 'react'

import { useEditor } from '@portabletext/editor'
import type { BlockRenderProps } from '@portabletext/editor'

import {
  TABLE_FIELDS,
  addColumn,
  addRow,
  cellToText,
  columnCount,
  isEditableCell,
  normalizeCellText,
  removeColumn,
  removeRow,
  rowCells,
  setCellText,
  setColumnHeaderTitle,
  setHasColumnTitles,
  setHasRowTitles,
  tableColumnHeaders,
  tableRows,
  type RichTableCell,
  type RichTableValue,
} from './pt-table'

const LOCKED_CELL_HINT =
  'This cell holds formatting the table editor cannot represent (a heading, a list, or a custom annotation). It is shown read-only so nothing is lost.'

interface RichTableCardProps {
  value: RichTableValue
  path: BlockRenderProps['path']
  readOnly?: boolean
}

export function RichTableCard({ value, path, readOnly = false }: RichTableCardProps) {
  const editor = useEditor()

  const apply = (next: RichTableValue) => {
    if (readOnly || next === value) return
    const props: Record<string, unknown> = {}
    for (const field of TABLE_FIELDS) {
      if (next[field] !== value[field] && next[field] !== undefined) props[field] = next[field]
    }
    if (Object.keys(props).length === 0) return
    editor.send({ type: 'block.set', at: path, props })
  }

  const removeBlock = () => editor.send({ type: 'delete.block', at: path })

  const rows = tableRows(value)
  const headers = tableColumnHeaders(value)
  const columns = columnCount(value)
  const columnIndexes = Array.from({ length: columns }, (_, i) => i)

  return (
    <div className="pt-card pt-table" contentEditable={false}>
      <div className="pt-card-bar">
        <span className="pt-card-kind">Table</span>
        <button
          type="button"
          className="btn sm"
          disabled={readOnly}
          onClick={() => apply(addRow(value))}
        >
          + Row
        </button>
        <button
          type="button"
          className="btn sm"
          disabled={readOnly}
          onClick={() => apply(addColumn(value))}
        >
          + Column
        </button>
        <label className="pt-table-toggle">
          <input
            type="checkbox"
            checked={value.hasColumnTitles === true}
            disabled={readOnly}
            onChange={(e) => apply(setHasColumnTitles(value, e.target.checked))}
          />
          Column titles
        </label>
        <label className="pt-table-toggle">
          <input
            type="checkbox"
            checked={value.hasRowTitles === true}
            disabled={readOnly}
            onChange={(e) => apply(setHasRowTitles(value, e.target.checked))}
          />
          Row titles
        </label>
        <span className="pt-spacer" />
        <button
          type="button"
          className="iconbtn"
          title="Remove table"
          aria-label="Remove table"
          disabled={readOnly}
          onClick={removeBlock}
        >
          ✕
        </button>
      </div>

      {columns === 0 && rows.length === 0 ? (
        <div className="pt-table-empty">Empty table — add a row to start.</div>
      ) : (
        <div className="pt-table-scroll">
          <table>
            <thead>
              <tr>
                {columnIndexes.map((c) => (
                  <th key={c}>
                    <div className="pt-table-head">
                      <input
                        className="input pt-cell-input"
                        value={headers[c]?.title ?? ''}
                        placeholder={`Column ${c + 1}`}
                        disabled={readOnly}
                        aria-label={`Column ${c + 1} title`}
                        onChange={(e) => apply(setColumnHeaderTitle(value, c, e.target.value))}
                      />
                      <button
                        type="button"
                        className="iconbtn"
                        title={`Delete column ${c + 1}`}
                        aria-label={`Delete column ${c + 1}`}
                        disabled={readOnly}
                        onClick={() => apply(removeColumn(value, c))}
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
                <th className="pt-table-gutter" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={row._key ?? `row-${r}`}>
                  {columnIndexes.map((c) => (
                    <TableCell
                      key={c}
                      cell={rowCells(row)[c]}
                      readOnly={readOnly}
                      label={`Row ${r + 1}, column ${c + 1}`}
                      onCommit={(text) => apply(setCellText(value, r, c, text))}
                    />
                  ))}
                  <td className="pt-table-gutter">
                    <button
                      type="button"
                      className="iconbtn"
                      title={`Delete row ${r + 1}`}
                      aria-label={`Delete row ${r + 1}`}
                      disabled={readOnly}
                      onClick={() => apply(removeRow(value, r))}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="pt-table-hint">
        Cell formatting uses the marker syntax: <code>**bold**</code>, <code>*italic*</code>,{' '}
        <code>[label](https://…)</code>. Enter starts a new paragraph in the cell.
      </p>
    </div>
  )
}

function TableCell({
  cell,
  label,
  readOnly,
  onCommit,
}: {
  cell: RichTableCell | undefined
  label: string
  readOnly: boolean
  onCommit: (text: string) => void
}) {
  const text = cellToText(cell)

  if (!isEditableCell(cell)) {
    return (
      <td className="pt-cell-locked" title={LOCKED_CELL_HINT}>
        <span className="pt-cell-locked-mark" aria-hidden="true">
          🔒
        </span>
        {text || <em>rich content</em>}
      </td>
    )
  }

  return (
    <td>
      <CellInput text={text} label={label} readOnly={readOnly} onCommit={onCommit} />
    </td>
  )
}

/**
 * Marker-text input for one cell.
 *
 * The textarea keeps its own draft so typing is not fought by the round-trip:
 * committing "2 * 3" stores a literal asterisk and reads back as "2 \* 3", and
 * resetting the box to that mid-keystroke would move the caret. `expected`
 * holds the text the stored value should serialize to after our own write, so
 * only a change that did not come from this box resets the draft.
 */
function CellInput({
  text,
  label,
  readOnly,
  onCommit,
}: {
  text: string
  label: string
  readOnly: boolean
  onCommit: (text: string) => void
}) {
  const [draft, setDraft] = useState(text)
  const expected = useRef(text)

  useEffect(() => {
    if (text === expected.current) return
    expected.current = text
    setDraft(text)
  }, [text])

  const change = (next: string) => {
    setDraft(next)
    expected.current = normalizeCellText(next)
    onCommit(next)
  }

  return (
    <textarea
      className="textarea pt-cell-input"
      rows={Math.min(6, draft.split('\n').length)}
      value={draft}
      disabled={readOnly}
      aria-label={label}
      onChange={(e) => change(e.target.value)}
    />
  )
}
