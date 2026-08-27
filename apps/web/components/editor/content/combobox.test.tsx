import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Combobox } from './combobox'

// The native <select> this replaced could not be styled in dark mode and could
// not be filtered. These pin the behaviour the replacement owes callers:
// picking, clearing, filtering, and the search box only appearing once the list
// is long enough to need it.

const AUTHORS = [
  { value: '1', label: 'Hichem Toumi' },
  { value: '2', label: 'WikiSubmission Community' },
  { value: '3', label: 'AbdulSalam Khalid' },
]

function longList(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    value: String(i + 1),
    label: `Author ${i + 1}`,
  }))
}

describe('Combobox', () => {
  it('opens on click and reports the picked value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox value="" options={AUTHORS} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /AbdulSalam Khalid/ }))

    expect(onChange).toHaveBeenCalledWith('3')
  })

  it('shows the selected label on the trigger', () => {
    render(<Combobox value="2" options={AUTHORS} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveTextContent(
      'WikiSubmission Community',
    )
  })

  it('offers a blank entry that clears the field', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox value="1" options={AUTHORS} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: '—' }))

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('hides the filter box for a short list', async () => {
    const user = userEvent.setup()
    render(<Combobox value="" options={AUTHORS} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.queryByLabelText('Filter options')).toBeNull()
  })

  it('filters a long list down to the matches', async () => {
    const user = userEvent.setup()
    render(<Combobox value="" options={longList(20)} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByLabelText('Filter options'), 'Author 12')

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Author 12')
  })

  it('filters case-insensitively', async () => {
    const user = userEvent.setup()
    render(<Combobox value="" options={longList(20)} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByLabelText('Filter options'), 'AUTHOR 7')

    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  it('says so when nothing matches', async () => {
    const user = userEvent.setup()
    render(<Combobox value="" options={longList(20)} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByLabelText('Filter options'), 'zzzz')

    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument()
  })

  it('picks with the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox value="" options={AUTHORS} onChange={onChange} />)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    // Opens on ArrowDown highlighting the blank entry, then down twice to the
    // first real author.
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('closes on Escape without changing the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox value="" options={AUTHORS} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)

    await user.keyboard('{Escape}')

    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    render(<Combobox value="" options={AUTHORS} disabled onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
