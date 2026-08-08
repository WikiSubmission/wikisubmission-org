import { describe, expect, it } from 'vitest'
import React from 'react'
import { convertTree } from './walk'
import { buildBackfillSql } from './sql'

/** Stands in for the shared YouTubeEmbed: only the component name matters. */
function YouTubeEmbed(props: { videoId: string; title?: string }) {
  return React.createElement('div', { 'data-video': props.videoId })
}

/** The exact shape the appendix TSX uses for its trailing video. */
function videoSection(videoId: string, title: string) {
  return React.createElement(
    'section',
    { className: 'space-y-3' },
    React.createElement('h2', null, 'Video'),
    React.createElement(YouTubeEmbed, { videoId, title }),
  )
}

const prose = React.createElement('p', null, 'Body prose.')

describe('convertTree video extraction', () => {
  it('reports the embed as metadata in every mode', () => {
    for (const embeds of ['link', 'shortcode', 'drop'] as const) {
      const { embeds: found } = convertTree(
        React.createElement(React.Fragment, null, prose, videoSection('BkZJa7j0z2M', 'Appendix 4')),
        { embeds },
      )
      expect(found).toEqual([{ videoId: 'BkZJa7j0z2M', videoTitle: 'Appendix 4' }])
    }
  })

  it('reports no embed for an appendix without a video', () => {
    const { embeds } = convertTree(React.createElement(React.Fragment, null, prose), {
      embeds: 'drop',
    })
    expect(embeds).toEqual([])
  })

  it('drops the whole video section, not just the embed', () => {
    // The heading would otherwise be left labelling nothing, and the reader
    // prints its own "Video" heading above the embed it builds from metadata.
    const { markdown } = convertTree(
      React.createElement(React.Fragment, null, prose, videoSection('BkZJa7j0z2M', 'Appendix 4')),
      { embeds: 'drop' },
    )
    expect(markdown).toBe('Body prose.\n')
  })

  it('keeps the heading when the embed stays in the body', () => {
    const { markdown } = convertTree(
      React.createElement(React.Fragment, null, prose, videoSection('BkZJa7j0z2M', 'Appendix 4')),
      { embeds: 'link' },
    )
    expect(markdown).toContain('## Video')
    expect(markdown).toContain('https://www.youtube.com/watch?v=BkZJa7j0z2M')
  })

  it('keeps surrounding prose when a section holds more than the embed', () => {
    const { markdown } = convertTree(
      React.createElement(
        'section',
        null,
        React.createElement('h2', null, 'Video'),
        React.createElement('p', null, 'Watch this.'),
        React.createElement(YouTubeEmbed, { videoId: 'BkZJa7j0z2M' }),
      ),
      { embeds: 'drop' },
    )
    expect(markdown).toContain('Watch this.')
  })
})

describe('buildBackfillSql', () => {
  const row = {
    code: '4',
    title: 'Why Was the Quran Revealed in Arabic?',
    body: '# Appendix 4\n\nText.\n',
    videoId: 'BkZJa7j0z2M',
    videoTitle: "God's message",
  }

  it('is a dry run until apply is passed', () => {
    const sql = buildBackfillSql([row])
    expect(sql).toContain('\\set apply false')
    expect(sql).toContain('ROLLBACK;')
  })

  it('guards the update so a re-run is a no-op', () => {
    expect(buildBackfillSql([row])).toContain('a.draft IS DISTINCT FROM t.new_draft')
  })

  it('scopes the write to English rows and the listed codes', () => {
    const sql = buildBackfillSql([row])
    expect(sql).toContain("WHERE l.code = 'en'")
    expect(sql).toContain('JOIN appendix_backfill    b ON b.code = a.code')
  })

  it('escapes a quote in the video title rather than breaking the literal', () => {
    expect(buildBackfillSql([row])).toContain("'God''s message'")
  })

  it('writes NULL for an appendix with no video', () => {
    const sql = buildBackfillSql([{ ...row, videoId: null, videoTitle: null }])
    expect(sql).toContain('NULL, NULL)')
  })

  it('picks a dollar tag that no body contains', () => {
    const sql = buildBackfillSql([{ ...row, body: 'contains $md$ literally' }])
    expect(sql).toContain('$md1$contains $md$ literally$md1$')
  })

  it('refuses to emit an empty backfill', () => {
    expect(() => buildBackfillSql([])).toThrow(/no appendices/)
  })
})
