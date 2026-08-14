import { describe, expect, it } from 'vitest'
import {
  copyCommandTokens,
  formatCopyCommand,
  parseCopyCommand,
  withCopyToken,
  type CopyRecipe,
} from '@/lib/copy-command'

const LANGS = ['en', 'fr', 'de', 'tr', 'ta', 'tl', 'ac']

const parse = (query: string) => parseCopyCommand(query, LANGS, 'en')

describe('reference and option split', () => {
  it('reads a bare reference with defaults', () => {
    const command = parse('2:255')
    expect(command.refs).toBe('2:255')
    expect(command.count).toBe(1)
    expect(command.tokens).toEqual([])
    expect(command.recipe).toEqual({
      refs: '2:255',
      granularity: 'full',
      arabic: 'no',
      primary: 'en',
      secondary: 'none',
      output: 'text',
      footnotes: 'default',
      subtitles: 'default',
    })
  })

  it('keeps comma-separated references together and counts the verses', () => {
    const command = parse('1:1-7, 3:18 ar fr')
    expect(command.refs).toBe('1:1-7, 3:18')
    expect(command.count).toBe(8)
    expect(command.tokens).toEqual(['ar', 'fr'])
    expect(command.recipe?.arabic).toBe('yes')
    expect(command.recipe?.primary).toBe('fr')
  })

  it('accepts the space form of a reference', () => {
    expect(parse('2 255 wbw').refs).toBe('2:255')
    expect(parse('2 255 wbw').recipe?.granularity).toBe('wbw')
  })

  it('has no recipe until the reference parses', () => {
    expect(parse('').recipe).toBeNull()
    expect(parse('ar en').recipe).toBeNull()
    expect(parse('999:1').refs).toBeNull()
  })

  it('takes options in any order, except that languages are positional', () => {
    const a = parse('2:255 wbw ar en fr table')
    const b = parse('2:255 table en fr ar wbw')
    expect(a.recipe).toEqual(b.recipe)
    // Reversing the two languages swaps which translation is which.
    const c = parse('2:255 table fr en ar wbw')
    expect(c.recipe).toEqual({ ...a.recipe, primary: 'fr', secondary: 'en' })
  })

  it('reads the first two languages as the two translations', () => {
    const command = parse('2:255 fr de tr')
    expect(command.recipe?.primary).toBe('fr')
    expect(command.recipe?.secondary).toBe('de')
  })

  it('lets none suppress both translations, whatever else is given', () => {
    const command = parse('2:255 ar none fr')
    expect(command.recipe?.primary).toBe('none')
    expect(command.recipe?.secondary).toBe('none')
    expect(command.recipe?.arabic).toBe('yes')
  })

  it('ignores words that are not tokens', () => {
    const command = parse('2:255 ar zzz en')
    expect(command.tokens).toEqual(['ar', 'en'])
  })

  it('ignores a repeated token', () => {
    expect(parse('2:255 ar ar en').tokens).toEqual(['ar', 'en'])
  })

  it('lets a later output token override an earlier one', () => {
    expect(parse('2:255 table image').recipe?.output).toBe('image')
  })
})

describe('the token being typed', () => {
  it('is the trailing word until the query ends in a space', () => {
    expect(parse('2:255 ta').partial).toBe('ta')
    expect(parse('2:255 ta ').partial).toBe('')
    expect(parse('2:255').partial).toBe('')
  })

  it('still counts as an answer while it is also a prefix of another token', () => {
    // `ta` is Tamil and the start of `table`; the line means Tamil until it does not.
    const command = parse('2:255 ta')
    expect(command.tokens).toEqual(['ta'])
    expect(command.recipe?.primary).toBe('ta')
    expect(command.partial).toBe('ta')
  })
})

describe('formatting back to a line', () => {
  const recipe: CopyRecipe = {
    refs: '2:255',
    granularity: 'wbw',
    arabic: 'yes',
    primary: 'en',
    secondary: 'fr',
    output: 'table',
    footnotes: 'default',
    subtitles: 'default',
  }

  it('renders the options in canonical order', () => {
    expect(copyCommandTokens(recipe)).toEqual(['ar', 'wbw', 'en', 'fr', 'table'])
    expect(formatCopyCommand(recipe)).toBe('2:255 ar wbw en fr table')
  })

  it('leaves out the defaults that would only be noise to edit around', () => {
    expect(
      formatCopyCommand({ ...recipe, granularity: 'full', arabic: 'no', output: 'text' }),
    ).toBe('2:255 en fr')
  })

  it('round-trips through the parser', () => {
    const variants: CopyRecipe[] = [
      recipe,
      { ...recipe, granularity: 'full', arabic: 'no', secondary: 'none', output: 'text' },
      { ...recipe, primary: 'none', secondary: 'none', output: 'image' },
    ]
    for (const variant of variants) {
      expect(parse(formatCopyCommand(variant)).recipe).toEqual(variant)
    }
  })

  it('drops a second translation that repeats the first', () => {
    expect(copyCommandTokens({ ...recipe, secondary: 'en' })).toEqual(['ar', 'wbw', 'en', 'table'])
  })

  it('round-trips the no-footnotes option', () => {
    const withoutFootnotes = { ...recipe, footnotes: 'exclude' as const }
    expect(formatCopyCommand(withoutFootnotes)).toContain('no-footnotes')
    expect(parse(formatCopyCommand(withoutFootnotes)).recipe).toEqual(withoutFootnotes)
  })

  it('recognizes vbv and no-subtitles', () => {
    const command = parse('2:255 wbw vbv no-subtitles')
    expect(command.recipe?.granularity).toBe('full')
    expect(command.recipe?.subtitles).toBe('exclude')
  })

  it('classifies valid, partial, and invalid parameter tokens', () => {
    expect(parse('2:255 ar wb').tokenFeedback).toEqual([
      { token: 'ar', status: 'valid' },
      { token: 'wb', status: 'partial' },
    ])
    expect(parse('2:255 ar wat ').invalidTokens).toEqual(['wat'])
  })
})

describe('completing a token', () => {
  it('appends when nothing is half-typed', () => {
    expect(withCopyToken('2:255', 'ar', '')).toBe('2:255 ar ')
    expect(withCopyToken('2:255 ', 'ar', '')).toBe('2:255 ar ')
  })

  it('replaces the word being typed rather than extending it', () => {
    expect(withCopyToken('2:255 tab', 'table', 'tab')).toBe('2:255 table ')
    expect(withCopyToken('2:255 ar fr', 'fr', 'fr')).toBe('2:255 ar fr ')
  })

  it('leaves the reference alone', () => {
    expect(withCopyToken('2:255', 'wbw', '').startsWith('2:255')).toBe(true)
  })
})
