import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PTEditor } from './pt-editor'

// Integration cover for the `richTableBlock` card against the real
// @portabletext/editor: the pure rules live in pt-table.test.ts, these tests
// pin the part that only shows up once the editor is in the loop — that a
// migrated table survives a load/save with nothing added or dropped, and that
// an edit writes back through `block.set` without losing Studio-only fields.

function cell(key: string, text: string) {
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
  }
}

/** A table as the Studio stored it, plus fields this editor knows nothing about. */
const TABLE = {
  _type: 'richTableBlock',
  _key: 'tbl1',
  hasColumnTitles: true,
  hasRowTitles: false,
  caption: 'Studio-only field',
  columnHeaders: [
    { _type: 'columnHeader', _key: 'h1', title: 'Name', cellIndex: 0, width: 200 },
    { _type: 'columnHeader', _key: 'h2', title: 'Value', cellIndex: 1 },
  ],
  rows: [
    { _type: 'row', _key: 'r1', title: 'First', cells: [cell('c11', 'alpha'), cell('c12', 'one')] },
    { _type: 'row', _key: 'r2', cells: [cell('c21', 'beta'), cell('c22', 'two')] },
  ],
}

const BODY = [
  {
    _type: 'block',
    _key: 'p1',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'sp1', text: 'Intro paragraph.', marks: [] }],
  },
  TABLE,
  {
    _type: 'block',
    _key: 'p2',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'sp2', text: 'Outro paragraph.', marks: [] }],
  },
]

function renderEditor(initialValue: unknown[] = BODY) {
  const onChange = vi.fn()
  const value = structuredClone(initialValue)
  render(<PTEditor initialValue={value} onChange={onChange} />)
  return { onChange, value }
}

// The assertions are what prove these fields are there; the type just keeps
// the deep reads in the tests readable.
interface EmittedTable {
  caption?: string
  hasRowTitles?: boolean
  columnHeaders: Array<Record<string, unknown>>
  rows: Array<{
    _key: string
    title?: string
    cells: Array<{
      _key: string
      content: Array<{ children: Array<{ text: string; marks: string[] }> }>
    }>
  }>
}

/** Latest table block the editor emitted. */
function emittedTable(onChange: ReturnType<typeof vi.fn>): EmittedTable {
  const blocks = onChange.mock.calls.at(-1)?.[0] as Array<Record<string, unknown>>
  const table = blocks.find((block) => block._type === 'richTableBlock')
  expect(table).toBeDefined()
  return table as unknown as EmittedTable
}

describe('PTEditor rich table', () => {
  it('renders the migrated table as editable cells', async () => {
    renderEditor()
    expect(await screen.findByLabelText('Row 1, column 1')).toHaveValue('alpha')
    expect(screen.getByLabelText('Row 2, column 2')).toHaveValue('two')
    expect(screen.getByLabelText('Column 1 title')).toHaveValue('Name')
  })

  it('round-trips an untouched document', async () => {
    const { onChange, value } = renderEditor()
    await screen.findByLabelText('Row 1, column 1')
    // Give the editor a beat to run any load-time normalization.
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Loading emits nothing, so the value the form would save is the value it
    // was given, byte for byte.
    expect(onChange).not.toHaveBeenCalled()
    expect(value).toEqual(BODY)
  })

  it('writes an edited cell back without dropping unknown fields', async () => {
    const user = userEvent.setup()
    const { onChange } = renderEditor()
    const input = await screen.findByLabelText('Row 1, column 2')

    // Several characters, and a marker pair: the box keeps focus between
    // keystrokes and the marker grammar becomes real Portable Text marks.
    await user.type(input, ' **two**')
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(input).toHaveValue('one **two**')

    const table = emittedTable(onChange)
    expect(table.caption).toBe('Studio-only field')
    expect(table.columnHeaders[0]).toMatchObject({ _key: 'h1', title: 'Name', width: 200 })
    expect(table.rows[0].title).toBe('First')
    expect(table.rows[0]._key).toBe('r1')
    expect(table.rows[1]).toEqual(TABLE.rows[1])

    const edited = table.rows[0].cells[1]
    expect(edited._key).toBe('c12')
    expect(edited.content[0].children.map((span) => span.text)).toEqual(['one ', 'two'])
    expect(edited.content[0].children[1].marks).toEqual(['strong'])
    expect(table.rows[0].cells[0]).toEqual(TABLE.rows[0].cells[0])
  })

  it('adds and removes rows through the card controls', async () => {
    const user = userEvent.setup()
    const { onChange } = renderEditor()
    await screen.findByLabelText('Row 1, column 1')

    await user.click(screen.getByRole('button', { name: '+ Row' }))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    let table = emittedTable(onChange)
    expect(table.rows).toHaveLength(3)
    expect(table.rows[2].cells).toHaveLength(2)
    expect(table.rows[0]).toEqual(TABLE.rows[0])
    expect(table.caption).toBe('Studio-only field')

    await user.click(screen.getByRole('button', { name: 'Delete row 1' }))
    await waitFor(() => expect(emittedTable(onChange).rows).toHaveLength(2))
    table = emittedTable(onChange)
    expect(table.rows[0]).toEqual(TABLE.rows[1])
  })

  it('adds and removes columns through the card controls', async () => {
    const user = userEvent.setup()
    const { onChange } = renderEditor()
    await screen.findByLabelText('Row 1, column 1')

    await user.click(screen.getByRole('button', { name: '+ Column' }))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    let table = emittedTable(onChange)
    expect(table.columnHeaders).toHaveLength(3)
    expect(table.columnHeaders[2]).toMatchObject({ _type: 'columnHeader', cellIndex: 2 })
    expect(table.rows[0].cells).toHaveLength(3)
    expect(table.rows[0].cells[0]).toEqual(TABLE.rows[0].cells[0])

    await user.click(screen.getByRole('button', { name: 'Delete column 1' }))
    await waitFor(() => expect(emittedTable(onChange).columnHeaders).toHaveLength(2))
    table = emittedTable(onChange)
    expect(table.columnHeaders[0]).toMatchObject({ _key: 'h2', title: 'Value', cellIndex: 0 })
    expect(table.rows[0].cells).toHaveLength(2)
    expect(table.rows[0].cells[0]).toEqual(TABLE.rows[0].cells[1])
    expect(table.rows[0].title).toBe('First')
    // The cell boxes follow the shift instead of showing the deleted column.
    expect(screen.getByLabelText('Row 1, column 1')).toHaveValue('one')
    expect(screen.getByLabelText('Column 1 title')).toHaveValue('Value')
  })

  it('toggles the title flags', async () => {
    const user = userEvent.setup()
    const { onChange } = renderEditor()
    await screen.findByLabelText('Row 1, column 1')

    await user.click(screen.getByRole('checkbox', { name: /row titles/i }))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(emittedTable(onChange).hasRowTitles).toBe(true)
    expect(emittedTable(onChange).caption).toBe('Studio-only field')
  })

  it('shows a cell it cannot represent as read-only instead of flattening it', async () => {
    const richCell = {
      _type: 'richTableCell',
      _key: 'rich',
      content: [
        {
          _type: 'block',
          _key: 'rb',
          style: 'h3',
          markDefs: [],
          children: [{ _type: 'span', _key: 'rs', text: 'A heading in a cell', marks: [] }],
        },
      ],
    }
    const body = [
      {
        _type: 'richTableBlock',
        _key: 'tbl2',
        rows: [{ _type: 'row', _key: 'r1', cells: [richCell, cell('plain', 'ok')] }],
      },
    ]
    const { onChange } = renderEditor(body)

    expect(await screen.findByLabelText('Row 1, column 2')).toHaveValue('ok')
    expect(screen.queryByLabelText('Row 1, column 1')).toBeNull()
    expect(screen.getByText('A heading in a cell')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })
})
