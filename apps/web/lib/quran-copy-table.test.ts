import { describe, expect, it } from 'vitest'
import {
  buildVerseTable,
  buildWordTable,
  type CopyMarkdownOptions,
} from '@/lib/quran-copy'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

const BASE_OPTS: CopyMarkdownOptions = {
  primaryCode: 'en',
  includeText: true,
  includeArabic: true,
  includeSubtitles: false,
  includeTransliteration: false,
  includeFootnotes: false,
}

const VERSES: VerseData[] = [
  {
    vk: '1:1',
    tr: {
      en: { lc: 'en', d: 'ltr', tx: 'In the name of God', s: 'Opening', f: 'A footnote' },
      ar: { lc: 'ar', d: 'rtl', tx: 'بسم الله' },
      fr: { lc: 'fr', d: 'ltr', tx: 'Au nom de Dieu' },
    },
    w: [
      { wi: 2, tx: { ar: 'الله', tl: 'Allah', en: 'God' }, r: 'اله', m: 'God' },
      { wi: 1, tx: { ar: 'بسم', tl: 'bismi', en: 'in the name' }, r: 'سمو', m: 'name' },
    ],
  },
  {
    vk: '1:2',
    tr: {
      en: { lc: 'en', d: 'ltr', tx: 'Praise be to God' },
      ar: { lc: 'ar', d: 'rtl', tx: 'الحمد لله' },
    },
  },
]

const lines = (table: string) => table.split('\n')

describe('buildVerseTable', () => {
  it('emits a markdown table with a header and divider', () => {
    const rows = lines(buildVerseTable(VERSES, 'markdown', BASE_OPTS))
    expect(rows[0]).toBe('| Verse | EN | AR |')
    expect(rows[1]).toBe('| --- | --- | --- |')
    expect(rows[2]).toBe('| 1:1 | In the name of God | بسم الله |')
    expect(rows).toHaveLength(4)
  })

  it('emits tab-separated rows for spreadsheets', () => {
    const rows = lines(buildVerseTable(VERSES, 'tsv', BASE_OPTS))
    expect(rows[0]).toBe('Verse\tEN\tAR')
    expect(rows[1].split('\t')).toEqual(['1:1', 'In the name of God', 'بسم الله'])
  })

  it('emits an html table for rich editors', () => {
    const html = buildVerseTable(VERSES, 'html', BASE_OPTS)
    expect(html.startsWith('<table><thead><tr><th>Verse</th>')).toBe(true)
    expect(html).toContain('<td>In the name of God</td>')
    expect(html.endsWith('</tbody></table>')).toBe(true)
    // Two body rows for two verses.
    expect(html.match(/<tr>/g)).toHaveLength(3)
  })

  it('gates columns on the same preferences as the text builders', () => {
    const noArabic = buildVerseTable(VERSES, 'tsv', { ...BASE_OPTS, includeArabic: false })
    expect(lines(noArabic)[0]).toBe('Verse\tEN')

    const noText = buildVerseTable(VERSES, 'tsv', { ...BASE_OPTS, includeText: false })
    expect(lines(noText)[0]).toBe('Verse\tAR')

    const withSecondary = buildVerseTable(VERSES, 'tsv', { ...BASE_OPTS, secondaryCode: 'fr' })
    expect(lines(withSecondary)[0]).toBe('Verse\tEN\tAR\tFR')
    expect(lines(withSecondary)[1]).toContain('Au nom de Dieu')

    const withExtras = buildVerseTable(VERSES, 'tsv', {
      ...BASE_OPTS,
      includeSubtitles: true,
      includeFootnotes: true,
    })
    expect(lines(withExtras)[0]).toBe('Verse\tEN\tAR\tSubtitle\tFootnote')
    expect(lines(withExtras)[1]).toContain('Opening')
    expect(lines(withExtras)[1]).toContain('A footnote')
  })

  it('leaves a cell empty rather than dropping a column when a verse lacks the field', () => {
    // Verse 1:2 has no subtitle; its row must still have the same column count.
    const rows = lines(
      buildVerseTable(VERSES, 'tsv', { ...BASE_OPTS, includeSubtitles: true }),
    )
    expect(rows[1].split('\t')).toHaveLength(4)
    expect(rows[2].split('\t')).toHaveLength(4)
    expect(rows[2].split('\t')[3]).toBe('')
  })
})

describe('table escaping', () => {
  const tricky: VerseData[] = [
    {
      vk: '9:9',
      tr: {
        en: { lc: 'en', d: 'ltr', tx: 'a | pipe\tand a tab\nand a newline' },
        ar: { lc: 'ar', d: 'rtl', tx: '<b>bold</b> & "quoted"' },
      },
    },
  ]

  it('escapes pipes and flattens newlines in markdown', () => {
    const row = lines(buildVerseTable(tricky, 'markdown', BASE_OPTS))[2]
    expect(row).toContain('a \\| pipe')
    // A raw newline would break the row into two.
    expect(lines(buildVerseTable(tricky, 'markdown', BASE_OPTS))).toHaveLength(3)
  })

  it('flattens tabs and newlines in tsv so the grid survives', () => {
    const rows = lines(buildVerseTable(tricky, 'tsv', BASE_OPTS))
    expect(rows).toHaveLength(2)
    expect(rows[1].split('\t')).toHaveLength(3)
  })

  it('escapes html entities so markup in the text cannot break the table', () => {
    const html = buildVerseTable(tricky, 'html', BASE_OPTS)
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; &quot;quoted&quot;')
    expect(html).not.toContain('<b>bold</b>')
  })
})

describe('buildWordTable', () => {
  const opts: CopyMarkdownOptions = { ...BASE_OPTS, includeTransliteration: true }

  it('emits one row per word, ordered by word index', () => {
    const rows = lines(buildWordTable(VERSES, 'tsv', opts))
    expect(rows[0]).toBe('Verse\t#\tArabic\tTransliteration\tMeaning\tRoot')
    // Input order is 2 then 1; output must be sorted.
    expect(rows[1].split('\t')).toEqual(['1:1', '1', 'بسم', 'bismi', 'name', 'سمو'])
    expect(rows[2].split('\t')).toEqual(['1:1', '2', 'الله', 'Allah', 'God', 'اله'])
  })

  it('contributes nothing for verses without word data', () => {
    // Only 1:1 has words, so 1:2 adds no rows.
    expect(lines(buildWordTable(VERSES, 'tsv', opts))).toHaveLength(3)
    expect(buildWordTable([VERSES[1]!], 'tsv', opts)).toBe(
      'Verse\t#\tArabic\tTransliteration\tMeaning\tRoot',
    )
  })

  it('always keeps the root column, and gates the rest on preferences', () => {
    const minimal = buildWordTable(VERSES, 'tsv', {
      ...BASE_OPTS,
      includeArabic: false,
      includeText: false,
      includeTransliteration: false,
    })
    expect(lines(minimal)[0]).toBe('Verse\t#\tRoot')
    expect(lines(minimal)[1]).toBe('1:1\t1\tسمو')
  })

  it('falls back to the English word gloss when no meaning is present', () => {
    const noMeaning: VerseData[] = [
      { vk: '2:1', w: [{ wi: 1, tx: { ar: 'الف', en: 'A.L.M.' } }] },
    ]
    expect(lines(buildWordTable(noMeaning, 'tsv', BASE_OPTS))[1]).toContain('A.L.M.')
  })
})
