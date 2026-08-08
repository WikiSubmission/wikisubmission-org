import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// QuranRef opens a dialog and pulls the whole reader stack in; the markdown
// renderer only needs to prove it emits one, so stub it with a marker.
vi.mock('@/components/quran-ref', () => ({
  QuranRef: ({ reference }: { reference: string }) => (
    <span data-testid="quran-ref">{reference}</span>
  ),
}))

// appendix-markdown lives in packages/shared (@/components/library/…);
// colocated here because that is where the vitest project scans.
const { AppendixMarkdown } =
  await import('@/components/library/appendix-markdown')

describe('AppendixMarkdown', () => {
  it('renders headings, paragraphs and lists', () => {
    const { container } = render(
      <AppendixMarkdown
        content={'## Section\n\nSome prose.\n\n- one\n- two\n'}
      />
    )
    expect(screen.getByRole('heading', { name: 'Section' })).toBeInTheDocument()
    expect(screen.getByText('Some prose.')).toBeInTheDocument()
    expect(container.querySelectorAll('li')).toHaveLength(2)
  })

  it('renders GFM tables, which the hardcoded appendices rely on', () => {
    const table = [
      '| Sura | Verses |',
      '| --- | --- |',
      '| 1 | 7 |',
      '| 2 | 286 |',
    ].join('\n')
    const { container } = render(<AppendixMarkdown content={table} />)

    expect(container.querySelector('table')).not.toBeNull()
    expect(container.querySelectorAll('th')).toHaveLength(2)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
  })

  it('keeps wide tables inside their own scroll container', () => {
    const { container } = render(
      <AppendixMarkdown content={'| a | b |\n| --- | --- |\n| 1 | 2 |'} />
    )
    expect(container.querySelector('div.overflow-x-auto table')).not.toBeNull()
  })

  it('turns bracketed scripture references into cross-reference badges', () => {
    render(
      <AppendixMarkdown content={'See [74:35] and [3:81-85] for details.'} />
    )
    expect(
      screen.getAllByTestId('quran-ref').map((n) => n.textContent)
    ).toEqual(['74:35', '3:81-85'])
  })

  it('linkifies references inside table cells and list items too', () => {
    render(
      <AppendixMarkdown
        content={'- item [2:255]\n\n| c |\n| --- |\n| [1:1] |'}
      />
    )
    expect(
      screen.getAllByTestId('quran-ref').map((n) => n.textContent)
    ).toEqual(['2:255', '1:1'])
  })

  it('escapes raw HTML instead of parsing it', () => {
    const { container } = render(
      <AppendixMarkdown
        content={'<img src=x onerror="alert(1)"> <b>bold</b>'}
      />
    )
    // The markup survives as literal text, so no element and no event handler
    // attribute is ever created from an editor-authored string.
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
    expect(container.textContent).toContain('<img src=x onerror="alert(1)">')
  })

  it('drops a javascript: link but keeps its label', () => {
    const { container } = render(
      <AppendixMarkdown content={'[click me](javascript:alert(1))'} />
    )
    expect(container.querySelector('a')).toBeNull()
    expect(screen.getByText('click me')).toBeInTheDocument()
  })

  it('drops a javascript: image rather than rendering it', () => {
    const { container } = render(
      <AppendixMarkdown content={'![x](javascript:alert(1))'} />
    )
    expect(container.querySelector('img')).toBeNull()
  })

  it('keeps http(s) links and opens external ones in a new tab safely', () => {
    const { container } = render(
      <AppendixMarkdown content={'[docs](https://wikisubmission.org/x)'} />
    )
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('https://wikisubmission.org/x')
    expect(anchor?.getAttribute('target')).toBe('_blank')
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('keeps a relative link in the same tab', () => {
    const { container } = render(
      <AppendixMarkdown content={'[quran](/quran/1)'} />
    )
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('/quran/1')
    expect(anchor?.getAttribute('target')).toBeNull()
  })

  it('renders an empty body without throwing', () => {
    const { container } = render(<AppendixMarkdown content="" />)
    expect(container.textContent).toBe('')
  })
})
