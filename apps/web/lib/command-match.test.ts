import { describe, expect, it } from 'vitest'
import { rankTargets, scoreTarget, splitHighlight, type MatchTarget } from '@/lib/command-match'
import { normalizeForSearch } from '@/lib/text-normalization/normalize'

/** Scores against a raw query, normalizing it the way the menu does. */
const score = (target: MatchTarget, query: string) => scoreTarget(target, normalizeForSearch(query))

const labels = (targets: MatchTarget[]) => targets.map((t) => t.label)

describe('scoreTarget ranking order', () => {
  const target = (label: string): MatchTarget => ({ label, priority: 50 })

  it('ranks exact above prefix above word-prefix above substring', () => {
    const exact = score(target('word'), 'word')
    const prefix = score(target('word lab'), 'word')
    const wordPrefix = score(target('the word lab'), 'lab')
    const substring = score(target('crossword'), 'word')

    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(wordPrefix)
    expect(wordPrefix).toBeGreaterThan(substring)
    expect(substring).toBeGreaterThan(0)
  })

  it('matches an acronym over the label words', () => {
    expect(score(target('Word Lab'), 'wl')).toBeGreaterThan(0)
    expect(score(target('Contact Prayers'), 'cp')).toBeGreaterThan(0)
    // A single letter would match nearly everything, so acronyms need two.
    expect(score(target('Word Lab'), 'w')).toBe(score(target('Word Lab'), 'w'))
    expect(score(target('Zakat'), 'wl')).toBe(0)
  })

  it('returns 0 for a miss', () => {
    expect(score(target('Zakat'), 'ramadan')).toBe(0)
  })

  it('scores a description match, but below any label match', () => {
    const viaDescription = score({ label: 'Miracle', description: 'Mathematical proof', priority: 50 }, 'proof')
    const viaLabel = score({ label: 'Proof', priority: 50 }, 'proof')
    expect(viaDescription).toBeGreaterThan(0)
    expect(viaLabel).toBeGreaterThan(viaDescription)
  })

  it('scores a keyword match, but never above the same match on the label', () => {
    const viaKeyword = score({ label: 'Al-Faatehah', keywords: ['1'], priority: 50 }, '1')
    const viaLabel = score({ label: '1', priority: 50 }, '1')
    expect(viaKeyword).toBeGreaterThan(0)
    expect(viaLabel).toBeGreaterThan(viaKeyword)
  })

  it('lets priority break ties but never outrank a stronger text match', () => {
    const lowPriorityExact = score({ label: 'zakat', priority: 0 }, 'zakat')
    const highPrioritySubstring = score({ label: 'the zakat guide', priority: 100 }, 'zakat')
    expect(lowPriorityExact).toBeGreaterThan(highPrioritySubstring)

    const low = score({ label: 'zakat', priority: 10 }, 'zakat')
    const high = score({ label: 'zakat', priority: 90 }, 'zakat')
    expect(high).toBeGreaterThan(low)
  })

  it('ranks an empty query on priority alone, matching everything', () => {
    expect(score({ label: 'anything', priority: 10 }, '')).toBeGreaterThan(0)
    expect(score({ label: 'anything', priority: 90 }, '')).toBeGreaterThan(
      score({ label: 'anything', priority: 10 }, ''),
    )
  })
})

describe('scoreTarget normalization', () => {
  // The point of routing both sides through normalizeForSearch: this tier agrees
  // with the backend FTS and the offline FTS5 bundles about what a query means.
  it('folds case and ignores diacritics', () => {
    expect(score({ label: 'Zakât' }, 'zakat')).toBeGreaterThan(0)
    expect(score({ label: 'ZAKAT' }, 'zakat')).toBeGreaterThan(0)
  })

  it('folds the Arabic alef and hamza variants', () => {
    // ٱ, أ, آ all fold to ا, so any spelling of the query finds any spelling of the label.
    expect(score({ label: 'ٱلْفَاتِحَة' }, 'الفاتحه')).toBeGreaterThan(0)
    expect(score({ label: 'أحمد' }, 'احمد')).toBeGreaterThan(0)
    expect(score({ label: 'الله' }, 'اللّٰه')).toBeGreaterThan(0)
  })

  it('matches an Arabic label from an Arabic query', () => {
    expect(score({ label: 'البقرة' }, 'بقره')).toBeGreaterThan(0)
  })
})

describe('rankTargets', () => {
  const targets: MatchTarget[] = [
    { label: 'Zakat', priority: 65 },
    { label: 'Ramadan', priority: 65 },
    { label: 'Hajj', priority: 60 },
    { label: 'Contact Prayers', priority: 70 },
  ]

  it('drops misses and sorts by score', () => {
    expect(labels(rankTargets(targets, 'zakat'))).toEqual(['Zakat'])
    expect(labels(rankTargets(targets, 'xyz'))).toEqual([])
    expect(labels(rankTargets(targets, 'ha'))).toEqual(['Hajj'])
    // A prefix match outranks a substring match even when priority disagrees:
    // Ramadan (65) starts with "ra", Contact Prayers (70) only contains it.
    expect(labels(rankTargets(targets, 'ra'))).toEqual(['Ramadan', 'Contact Prayers'])
  })

  it('respects the limit', () => {
    expect(rankTargets(targets, '', 2)).toHaveLength(2)
  })

  it('keeps input order for equal scores, so rows do not shuffle between keystrokes', () => {
    const equal: MatchTarget[] = [
      { label: 'alpha', priority: 50 },
      { label: 'alpine', priority: 50 },
      { label: 'alps', priority: 50 },
    ]
    // All three are prefix matches with identical priority.
    expect(labels(rankTargets(equal, 'al'))).toEqual(['alpha', 'alpine', 'alps'])
  })

  it('returns everything for an empty query, ordered by priority', () => {
    expect(labels(rankTargets(targets, ''))).toEqual(['Contact Prayers', 'Zakat', 'Ramadan', 'Hajj'])
  })
})

describe('splitHighlight', () => {
  it('splits a snippet into plain and matched runs', () => {
    expect(splitHighlight('the <b>mercy</b> of God')).toEqual([
      { text: 'the ', match: false },
      { text: 'mercy', match: true },
      { text: ' of God', match: false },
    ])
  })

  it('handles multiple, leading, and trailing matches', () => {
    expect(splitHighlight('<b>a</b> and <b>b</b>')).toEqual([
      { text: 'a', match: true },
      { text: ' and ', match: false },
      { text: 'b', match: true },
    ])
  })

  it('returns one plain run when there is no markup', () => {
    expect(splitHighlight('plain text')).toEqual([{ text: 'plain text', match: false }])
  })

  it('returns nothing for an empty snippet', () => {
    expect(splitHighlight('')).toEqual([])
  })

  it('spans newlines, which ts_headline fragments can contain', () => {
    expect(splitHighlight('a <b>two\nlines</b> b')).toEqual([
      { text: 'a ', match: false },
      { text: 'two\nlines', match: true },
      { text: ' b', match: false },
    ])
  })

  it('drops the tags, so concatenating the runs recovers the plain text', () => {
    const snippet = 'and <b>God</b> is <b>most</b> merciful'
    const plain = splitHighlight(snippet)
      .map((run) => run.text)
      .join('')
    expect(plain).toBe('and God is most merciful')
    expect(plain).not.toContain('<b>')
  })

  it('is case-insensitive about the tags', () => {
    expect(splitHighlight('x <B>y</B> z').filter((r) => r.match)).toEqual([{ text: 'y', match: true }])
  })
})
