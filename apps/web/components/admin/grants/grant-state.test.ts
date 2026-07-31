import { describe, expect, it } from 'vitest'

import type { EditorialEditor } from '@/lib/editorial-content-client'
import {
  grantStateToInput,
  grantSummary,
  initialGrantState,
  type GrantState,
} from './grant-state'

function editor(overrides: Partial<EditorialEditor> = {}): EditorialEditor {
  return {
    user_id: 1,
    email: 'someone@example.com',
    role: 'member',
    is_active: true,
    modules: {},
    quran_versions: [],
    bible_versions: [],
    games: [],
    ...overrides,
  } as EditorialEditor
}

function state(overrides: Partial<GrantState> = {}): GrantState {
  return {
    modules: {
      quran: 'none',
      bible: 'none',
      article: 'none',
      community: 'none',
      author: 'none',
      category: 'none',
      appendix: 'none',
    },
    quran: {},
    bible: {},
    allGames: 'none',
    games: {},
    reference: null,
    ...overrides,
  }
}

describe('initialGrantState', () => {
  it('reads presence as read and true as write', () => {
    const s = initialGrantState(
      editor({ modules: { quran: true, article: false } })
    )
    expect(s.modules.quran).toBe('write')
    expect(s.modules.article).toBe('read')
    expect(s.modules.bible).toBe('none')
  })

  it('splits the global games tier out of the module map', () => {
    const s = initialGrantState(
      editor({
        modules: { game: true },
        games: [{ game_key: 'fill-blank', can_write: false }],
      })
    )
    expect(s.allGames).toBe('write')
    expect(s.games['fill-blank']).toBe('read')
  })

  it('carries the approver flag independently of version access', () => {
    const s = initialGrantState(
      editor({
        modules: { quran: false },
        quran_versions: [
          { version_id: 3, can_write: false, can_approve: true },
        ],
      })
    )
    expect(s.quran[3]).toEqual({ access: 'read', approve: true })
  })
})

describe('grantStateToInput', () => {
  it('omits modules set to none and maps write to true', () => {
    const input = grantStateToInput(
      state({
        modules: { ...state().modules, article: 'write', community: 'read' },
      })
    )
    expect(input.modules).toEqual({ article: true, community: false })
  })

  it('sends the global games tier as the game module key', () => {
    expect(grantStateToInput(state({ allGames: 'write' })).modules).toEqual({
      game: true,
    })
    expect(grantStateToInput(state({ allGames: 'read' })).modules).toEqual({
      game: false,
    })
    expect(grantStateToInput(state({ allGames: 'none' })).modules).toEqual({})
  })

  it('emits per-game grants independently of the global tier', () => {
    const input = grantStateToInput(state({ games: { 'fill-blank': 'write' } }))
    expect(input.games).toEqual([{ game_key: 'fill-blank', can_write: true }])
    expect(input.modules).toEqual({})
  })

  it('keeps a version row that has approve but no access', () => {
    const input = grantStateToInput(
      state({
        modules: { ...state().modules, quran: 'read' },
        quran: { 3: { access: 'none', approve: true } },
      })
    )
    expect(input.quran_versions).toEqual([
      { version_id: 3, can_write: false, can_approve: true },
    ])
  })

  // Regression: revoking a module used to leave its version grants persisted and
  // invisible, so re-granting the module silently restored the old per-version
  // access and approver flags.
  it('discards quran version grants when the quran module is revoked', () => {
    const input = grantStateToInput(
      state({
        modules: { ...state().modules, quran: 'none' },
        quran: {
          3: { access: 'write', approve: true },
          4: { access: 'read', approve: false },
        },
        reference: 3,
      })
    )
    expect(input.quran_versions).toEqual([])
    expect(input.modules.quran).toBeUndefined()
  })

  it('discards bible version grants when the bible module is revoked', () => {
    const input = grantStateToInput(
      state({
        modules: { ...state().modules, bible: 'none' },
        bible: { 1: 'write' },
      })
    )
    expect(input.bible_versions).toEqual([])
  })

  it('keeps version grants for a module that is still granted', () => {
    const input = grantStateToInput(
      state({
        modules: { ...state().modules, quran: 'read', bible: 'read' },
        quran: { 3: { access: 'write', approve: false } },
        bible: { 1: 'read' },
      })
    )
    expect(input.quran_versions).toEqual([
      { version_id: 3, can_write: true, can_approve: false },
    ])
    expect(input.bible_versions).toEqual([{ version_id: 1, can_write: false }])
  })

  it('round-trips a granted editor unchanged', () => {
    const source = editor({
      modules: { quran: true, game: false },
      quran_versions: [{ version_id: 3, can_write: true, can_approve: true }],
      games: [{ game_key: 'fill-blank', can_write: false }],
      quran_reference_version_id: 3,
    })
    const input = grantStateToInput(initialGrantState(source))
    expect(input.modules).toEqual({ quran: true, game: false })
    expect(input.quran_versions).toEqual([
      { version_id: 3, can_write: true, can_approve: true },
    ])
    expect(input.games).toEqual([{ game_key: 'fill-blank', can_write: false }])
    expect(input.quran_reference_version_id).toBe(3)
  })
})

describe('grantSummary', () => {
  it('reports admins as having full access', () => {
    expect(grantSummary(editor({ role: 'admin' }))).toBe('admin — full access')
  })

  it('reports no grants', () => {
    expect(grantSummary(editor())).toBe('no grants')
  })

  it('names the global games tier rather than the raw module key', () => {
    expect(grantSummary(editor({ modules: { game: true } }))).toBe(
      'all games (write)'
    )
  })

  it('lists per-game grants alongside modules', () => {
    const summary = grantSummary(
      editor({
        modules: { quran: false },
        games: [{ game_key: 'fill-blank', can_write: true }],
      })
    )
    expect(summary).toBe('quran (read), fill-blank (write)')
  })
})
