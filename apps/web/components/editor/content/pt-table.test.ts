import { describe, it, expect } from 'vitest'

import {
  addColumn,
  addRow,
  cellToText,
  columnCount,
  isEditableCell,
  normalizeCellText,
  removeColumn,
  removeRow,
  rowCount,
  setCellText,
  setColumnHeaderTitle,
  setHasColumnTitles,
  setHasRowTitles,
  textToCellContent,
  type RichTableValue,
} from './pt-table'

// Tables were authored by sanity-plugin-rich-table in the retired Studio, so
// these fixtures use the shapes it stored: `_type: 'row'` array members, cells
// of `richTableCell`, and cell content as a nested Portable Text array.

function cell(key: string, text: string, extra: Record<string, unknown> = {}) {
  return {
    _type: 'richTableCell',
    _key: key,
    content: [
      {
        _type: 'block',
        _key: `b-${key}`,
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: `s-${key}`, text, marks: [] }],
      },
    ],
    ...extra,
  }
}

function table(): RichTableValue {
  return {
    _type: 'richTableBlock',
    _key: 'tbl',
    hasColumnTitles: true,
    hasRowTitles: false,
    columnHeaders: [
      { _type: 'columnHeader', _key: 'h1', title: 'Name', cellIndex: 0 },
      { _type: 'columnHeader', _key: 'h2', title: 'Value', cellIndex: 1 },
    ],
    rows: [
      { _type: 'row', _key: 'r1', cells: [cell('c11', 'alpha'), cell('c12', 'one')] },
      { _type: 'row', _key: 'r2', cells: [cell('c21', 'beta'), cell('c22', 'two')] },
    ],
  }
}

describe('shape helpers', () => {
  it('counts columns from headers and the widest row', () => {
    expect(columnCount(table())).toBe(2)
    expect(rowCount(table())).toBe(2)
    expect(columnCount({ rows: [{ cells: [cell('a', 'x'), cell('b', 'y'), cell('c', 'z')] }] })).toBe(3)
    expect(columnCount({ columnHeaders: [{ cellIndex: 0 }] })).toBe(1)
    expect(columnCount({})).toBe(0)
  })
})

describe('addRow', () => {
  it('appends a row as wide as the table without touching existing rows', () => {
    const before = table()
    const after = addRow(before)

    expect(after.rows).toHaveLength(3)
    expect(after.rows?.[0]).toBe(before.rows?.[0])
    expect(after.rows?.[1]).toBe(before.rows?.[1])
    expect(before.rows).toHaveLength(2)

    const added = after.rows![2]
    expect(added.cells).toHaveLength(2)
    expect(added._type).toBe('row')
    expect(added._key).toMatch(/^[0-9a-f]{12}$/)
    expect(added.cells?.[0]._type).toBe('richTableCell')
    expect(added.cells?.[0]._key).toMatch(/^[0-9a-f]{12}$/)
    expect(cellToText(added.cells?.[0])).toBe('')
  })

  it('gives an empty table a single-cell row', () => {
    const after = addRow({ _type: 'richTableBlock' })
    expect(after.rows?.[0].cells).toHaveLength(1)
  })

  it('mirrors the _type of existing rows and cells', () => {
    const after = addRow({
      rows: [{ _type: 'legacyRow', _key: 'r', cells: [{ _type: 'legacyCell', _key: 'c' }] }],
    })
    expect(after.rows?.[1]._type).toBe('legacyRow')
    expect(after.rows?.[1].cells?.[0]._type).toBe('legacyCell')
  })
})

describe('removeRow', () => {
  it('drops one row and keeps the other rows identical', () => {
    const before = table()
    const after = removeRow(before, 0)
    expect(after.rows).toHaveLength(1)
    expect(after.rows?.[0]).toBe(before.rows?.[1])
    expect(after.rows?.[0]._key).toBe('r2')
  })

  it('is a no-op for an out-of-range index', () => {
    const before = table()
    expect(removeRow(before, 9)).toBe(before)
    expect(removeRow(before, -1)).toBe(before)
  })
})

describe('addColumn', () => {
  it('adds a cell to every row and a matching header', () => {
    const before = table()
    const after = addColumn(before)

    expect(columnCount(after)).toBe(3)
    expect(after.columnHeaders).toHaveLength(3)
    expect(after.columnHeaders?.[0]).toBe(before.columnHeaders?.[0])
    expect(after.columnHeaders?.[2]).toMatchObject({ _type: 'columnHeader', cellIndex: 2 })
    for (const row of after.rows ?? []) {
      expect(row.cells).toHaveLength(3)
      expect(cellToText(row.cells?.[2])).toBe('')
    }
    // Existing cells keep their identity.
    expect(after.rows?.[0].cells?.[0]).toBe(before.rows?.[0].cells?.[0])
    expect(before.rows?.[0].cells).toHaveLength(2)
  })

  it('does not invent headers for a table stored without any', () => {
    const after = addColumn({ rows: [{ _key: 'r', cells: [cell('c', 'x')] }] })
    expect(after.columnHeaders).toBeUndefined()
    expect(after.rows?.[0].cells).toHaveLength(2)
  })

  it('squares off a ragged table', () => {
    const after = addColumn({
      rows: [
        { _key: 'r1', cells: [cell('a', 'x'), cell('b', 'y')] },
        { _key: 'r2', cells: [cell('c', 'z')] },
      ],
    })
    expect(after.rows?.[0].cells).toHaveLength(3)
    expect(after.rows?.[1].cells).toHaveLength(3)
  })
})

describe('removeColumn', () => {
  it('removes the cell from every row and renumbers the remaining headers', () => {
    const before = table()
    const after = removeColumn(before, 0)

    expect(after.columnHeaders).toHaveLength(1)
    expect(after.columnHeaders?.[0]).toMatchObject({ _key: 'h2', title: 'Value', cellIndex: 0 })
    expect(after.rows?.[0].cells).toHaveLength(1)
    expect(after.rows?.[0].cells?.[0]).toBe(before.rows?.[0].cells?.[1])
    expect(after.rows?.[1].cells?.[0]._key).toBe('c22')
  })

  it('leaves headers that already sit at the right index untouched', () => {
    const before = table()
    const after = removeColumn(before, 1)
    expect(after.columnHeaders?.[0]).toBe(before.columnHeaders?.[0])
  })

  it('is a no-op for an out-of-range index', () => {
    const before = table()
    expect(removeColumn(before, 5)).toBe(before)
    expect(removeColumn(before, -1)).toBe(before)
  })
})

describe('column headers and title flags', () => {
  it('sets a header title in place', () => {
    const after = setColumnHeaderTitle(table(), 1, 'Amount')
    expect(after.columnHeaders?.[1]).toMatchObject({ _key: 'h2', title: 'Amount', cellIndex: 1 })
    expect(after.columnHeaders?.[0].title).toBe('Name')
  })

  it('materializes headers up to the edited index', () => {
    const after = setColumnHeaderTitle({ rows: [{ _key: 'r', cells: [cell('a', 'x')] }] }, 1, 'B')
    expect(after.columnHeaders).toHaveLength(2)
    expect(after.columnHeaders?.[0]).toMatchObject({ _type: 'columnHeader', cellIndex: 0 })
    expect(after.columnHeaders?.[0].title).toBeUndefined()
    expect(after.columnHeaders?.[1].title).toBe('B')
  })

  it('toggles the title flags without touching anything else', () => {
    const before = table()
    expect(setHasColumnTitles(before, false).hasColumnTitles).toBe(false)
    expect(setHasRowTitles(before, true).hasRowTitles).toBe(true)
    expect(setHasRowTitles(before, true).rows).toBe(before.rows)
  })
})

describe('cell content', () => {
  it('round-trips decorators and links through marker text', () => {
    const rich = {
      _type: 'richTableCell',
      _key: 'c',
      content: [
        {
          _type: 'block',
          _key: 'b',
          style: 'normal',
          markDefs: [{ _key: 'lnk', _type: 'link', href: 'https://example.com' }],
          children: [
            { _type: 'span', _key: 's1', text: 'bold', marks: ['strong'] },
            { _type: 'span', _key: 's2', text: ' and ', marks: [] },
            { _type: 'span', _key: 's3', text: 'link', marks: ['lnk'] },
          ],
        },
      ],
    }
    expect(isEditableCell(rich)).toBe(true)
    const text = cellToText(rich)
    expect(text).toBe('**bold** and [link](https://example.com)')

    const back = textToCellContent(rich.content, text)
    expect(back).toHaveLength(1)
    expect(back[0]._key).toBe('b')
    expect(back[0].style).toBe('normal')
    expect(back[0].children?.map((s) => ({ text: s.text, marks: s.marks }))).toEqual([
      { text: 'bold', marks: ['strong'] },
      { text: ' and ', marks: [] },
      { text: 'link', marks: [back[0].markDefs![0]._key] },
    ])
    expect(back[0].markDefs).toEqual([
      { _key: expect.any(String), _type: 'link', href: 'https://example.com' },
    ])
  })

  it('keeps unknown fields on the rewritten block', () => {
    const content = [
      {
        _type: 'block',
        _key: 'b',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's', text: 'hi', marks: [] }],
        legacyFlag: 'keep-me',
      },
    ]
    const back = textToCellContent(content, 'hello')
    expect(back[0].legacyFlag).toBe('keep-me')
    expect(back[0]._key).toBe('b')
  })

  it('maps one line per block and generates keys for new lines', () => {
    const content = [
      {
        _type: 'block',
        _key: 'b1',
        children: [{ _type: 'span', _key: 's', text: 'one', marks: [] }],
      },
    ]
    const back = textToCellContent(content, 'one\ntwo')
    expect(back).toHaveLength(2)
    expect(back[0]._key).toBe('b1')
    expect(back[1]._key).toMatch(/^[0-9a-f]{12}$/)
    expect(back[1].children?.[0].text).toBe('two')

    // Removing a line removes its block.
    expect(textToCellContent(content, '')).toHaveLength(1)
  })

  it('reports cells the marker syntax cannot express as read-only', () => {
    const heading = { content: [{ _type: 'block', style: 'h2', children: [] }] }
    const list = { content: [{ _type: 'block', listItem: 'bullet', children: [] }] }
    const inlineObject = {
      content: [{ _type: 'block', children: [{ _type: 'footnote', _key: 'f' }] }],
    }
    const customAnnotation = {
      content: [
        {
          _type: 'block',
          markDefs: [{ _key: 'a', _type: 'internalLink', ref: 'x' }],
          children: [{ _type: 'span', _key: 's', text: 'x', marks: ['a'] }],
        },
      ],
    }
    const linkWithExtras = {
      content: [
        {
          _type: 'block',
          markDefs: [{ _key: 'a', _type: 'link', href: 'https://x.test', rel: 'nofollow' }],
          children: [{ _type: 'span', _key: 's', text: 'x', marks: ['a'] }],
        },
      ],
    }
    const nestedTable = { content: [{ _type: 'richTableBlock', rows: [] }] }

    for (const bad of [heading, list, inlineObject, customAnnotation, linkWithExtras, nestedTable]) {
      expect(isEditableCell(bad)).toBe(false)
    }
  })

  it('treats an empty or absent cell as editable', () => {
    expect(isEditableCell(undefined)).toBe(true)
    expect(isEditableCell({})).toBe(true)
    expect(isEditableCell({ content: [] })).toBe(true)
    expect(cellToText({})).toBe('')
  })

  it('normalizes text to what the cell will read back as', () => {
    expect(normalizeCellText('**bold**')).toBe('**bold**')
    // A lone marker survives as literal text and comes back escaped.
    expect(normalizeCellText('2 * 3')).toBe('2 \\* 3')
    expect(normalizeCellText('a\nb')).toBe('a\nb')
  })
})

describe('setCellText', () => {
  it('writes one cell and leaves every other row and cell identical', () => {
    const before = table()
    const after = setCellText(before, 1, 0, 'BETA')

    expect(after.rows?.[0]).toBe(before.rows?.[0])
    expect(after.rows?.[1].cells?.[1]).toBe(before.rows?.[1].cells?.[1])
    expect(after.rows?.[1]._key).toBe('r2')
    expect(after.rows?.[1].cells?.[0]._key).toBe('c21')
    expect(cellToText(after.rows?.[1].cells?.[0])).toBe('BETA')
    // The original is untouched.
    expect(cellToText(before.rows?.[1].cells?.[0])).toBe('beta')
  })

  it('pads a short row before writing', () => {
    const before: RichTableValue = { rows: [{ _key: 'r', cells: [cell('a', 'x')] }] }
    const after = setCellText(before, 0, 2, 'far')
    expect(after.rows?.[0].cells).toHaveLength(3)
    expect(cellToText(after.rows?.[0].cells?.[1])).toBe('')
    expect(cellToText(after.rows?.[0].cells?.[2])).toBe('far')
  })

  it('is a no-op for a missing row', () => {
    const before = table()
    expect(setCellText(before, 7, 0, 'x')).toBe(before)
    expect(setCellText(before, 0, -1, 'x')).toBe(before)
  })
})

describe('unknown key preservation', () => {
  const withExtras: RichTableValue = {
    _type: 'richTableBlock',
    _key: 'tbl',
    caption: 'Comparison of translations',
    tableTheme: { striped: true },
    columnHeaders: [
      { _type: 'columnHeader', _key: 'h1', title: 'A', cellIndex: 0, width: 120 },
      { _type: 'columnHeader', _key: 'h2', title: 'B', cellIndex: 1, width: 240 },
    ],
    rows: [
      {
        _type: 'row',
        _key: 'r1',
        title: 'First',
        highlight: true,
        cells: [cell('c1', 'x', { colSpan: 2 }), cell('c2', 'y')],
      },
    ],
  }

  const edits: Array<[string, (t: RichTableValue) => RichTableValue]> = [
    ['addRow', (t) => addRow(t)],
    ['removeRow', (t) => removeRow(t, 0)],
    ['addColumn', (t) => addColumn(t)],
    ['removeColumn', (t) => removeColumn(t, 1)],
    ['setColumnHeaderTitle', (t) => setColumnHeaderTitle(t, 0, 'Z')],
    ['setCellText', (t) => setCellText(t, 0, 0, 'changed')],
    ['setHasColumnTitles', (t) => setHasColumnTitles(t, false)],
    ['setHasRowTitles', (t) => setHasRowTitles(t, true)],
  ]

  for (const [name, edit] of edits) {
    it(`${name} keeps unknown block-level fields`, () => {
      const after = edit(withExtras)
      expect(after._type).toBe('richTableBlock')
      expect(after._key).toBe('tbl')
      expect(after.caption).toBe('Comparison of translations')
      expect(after.tableTheme).toEqual({ striped: true })
    })
  }

  it('keeps unknown fields on rows, cells and headers that survive an edit', () => {
    const afterRow = addRow(withExtras)
    expect(afterRow.rows?.[0]).toMatchObject({ title: 'First', highlight: true })

    const afterCell = setCellText(withExtras, 0, 1, 'changed')
    expect(afterCell.rows?.[0].title).toBe('First')
    expect(afterCell.rows?.[0].highlight).toBe(true)
    expect(afterCell.rows?.[0].cells?.[0].colSpan).toBe(2)

    const afterHeader = setColumnHeaderTitle(withExtras, 1, 'BB')
    expect(afterHeader.columnHeaders?.[1]).toMatchObject({ width: 240, title: 'BB' })

    const afterColumn = removeColumn(withExtras, 0)
    expect(afterColumn.columnHeaders?.[0]).toMatchObject({ width: 240, cellIndex: 0 })
    expect(afterColumn.rows?.[0].cells?.[0]._key).toBe('c2')
  })

  it('reads a malformed value as empty instead of throwing', () => {
    const broken = { rows: 'nope', columnHeaders: 3 } as unknown as RichTableValue
    expect(columnCount(broken)).toBe(0)
    expect(rowCount(broken)).toBe(0)
    expect(addRow(broken).rows).toHaveLength(1)

    const brokenCells = { rows: [{ _key: 'r', cells: null }] } as unknown as RichTableValue
    expect(columnCount(brokenCells)).toBe(0)
    expect(setCellText(brokenCells, 0, 0, 'x').rows?.[0].cells).toHaveLength(1)
  })

  it('never mutates the value it was given', () => {
    const snapshot = JSON.stringify(withExtras)
    for (const [, edit] of edits) edit(withExtras)
    expect(JSON.stringify(withExtras)).toBe(snapshot)
  })
})
