import { describe, expect, it } from 'vitest'

import {
  accessibleGames,
  canApproveAnyQuranVersion,
  canApproveQuranVersion,
  canReadBibleVersion,
  canReadGame,
  canReadModule,
  canWriteBibleVersion,
  canWriteGame,
  canWriteModule,
  canWriteQuranVersion,
  canReadQuranVersion,
  hasAnyGameAccess,
  hasEditorWorkspaceAccess,
  hasGlobalGameAccess,
  type EditorialSession,
} from './editorial-access'

/**
 * These mirror ws-backend's db/editorial_permissions_test.go. If a case here
 * changes, the Go table almost certainly needs the same change — the two must
 * agree or the UI will offer actions the backend rejects (or hide ones it
 * allows).
 */
function session(overrides: Partial<EditorialSession> = {}): EditorialSession {
  return {
    is_admin: false,
    modules: {},
    quran_versions: {},
    bible_versions: {},
    quran_approver_versions: {},
    games: {},
    ...overrides,
  }
}

describe('modules', () => {
  it('treats key presence as read and true as write', () => {
    const readOnly = session({ modules: { article: false } })
    expect(canReadModule(readOnly, 'article')).toBe(true)
    expect(canWriteModule(readOnly, 'article')).toBe(false)

    const writable = session({ modules: { article: true } })
    expect(canReadModule(writable, 'article')).toBe(true)
    expect(canWriteModule(writable, 'article')).toBe(true)
  })

  it('denies modules with no grant', () => {
    const s = session({ modules: { quran: true } })
    expect(canReadModule(s, 'article')).toBe(false)
    expect(canWriteModule(s, 'article')).toBe(false)
  })

  it('lets admins read and write everything', () => {
    const admin = session({ is_admin: true })
    expect(canReadModule(admin, 'article')).toBe(true)
    expect(canWriteModule(admin, 'anything-at-all')).toBe(true)
  })
})

describe('quran versions', () => {
  it('requires the module grant as well as the version grant', () => {
    // Version grant present but the module grant was revoked — must deny.
    const orphaned = session({ modules: {}, quran_versions: { '3': true } })
    expect(canReadQuranVersion(orphaned, 3)).toBe(false)
    expect(canWriteQuranVersion(orphaned, 3)).toBe(false)

    const granted = session({
      modules: { quran: false },
      quran_versions: { '3': true },
    })
    expect(canReadQuranVersion(granted, 3)).toBe(true)
    expect(canWriteQuranVersion(granted, 3)).toBe(true)
  })

  it('scopes access to the granted version only', () => {
    const s = session({
      modules: { quran: true },
      quran_versions: { '3': true },
    })
    expect(canReadQuranVersion(s, 4)).toBe(false)
    expect(canWriteQuranVersion(s, 4)).toBe(false)
  })

  it('treats approve as a grant independent of write', () => {
    const approverOnly = session({
      modules: { quran: false },
      quran_versions: { '3': false },
      quran_approver_versions: { '3': true },
    })
    expect(canWriteQuranVersion(approverOnly, 3)).toBe(false)
    expect(canApproveQuranVersion(approverOnly, 3)).toBe(true)
    expect(canApproveAnyQuranVersion(approverOnly)).toBe(true)

    const writerOnly = session({
      modules: { quran: true },
      quran_versions: { '3': true },
    })
    expect(canApproveQuranVersion(writerOnly, 3)).toBe(false)
    expect(canApproveAnyQuranVersion(writerOnly)).toBe(false)
  })

  it('revokes approval when the module grant goes away', () => {
    const stale = session({
      modules: {},
      quran_approver_versions: { '3': true },
    })
    expect(canApproveQuranVersion(stale, 3)).toBe(false)
    expect(canApproveAnyQuranVersion(stale)).toBe(false)
  })

  it('lets admins approve every version', () => {
    const admin = session({ is_admin: true })
    expect(canApproveQuranVersion(admin, 99)).toBe(true)
    expect(canApproveAnyQuranVersion(admin)).toBe(true)
  })
})

describe('bible versions', () => {
  it('requires the module grant as well as the version grant', () => {
    const orphaned = session({ modules: {}, bible_versions: { '1': true } })
    expect(canReadBibleVersion(orphaned, 1)).toBe(false)

    const granted = session({
      modules: { bible: false },
      bible_versions: { '1': false },
    })
    expect(canReadBibleVersion(granted, 1)).toBe(true)
    expect(canWriteBibleVersion(granted, 1)).toBe(false)
  })
})

describe('games', () => {
  it('covers every game from the global module grant', () => {
    const global = session({ modules: { game: false } })
    expect(hasGlobalGameAccess(global)).toBe(true)
    // Including a game with no entry of its own, e.g. one added later.
    expect(canReadGame(global, 'some-future-game')).toBe(true)
    expect(canWriteGame(global, 'some-future-game')).toBe(false)

    const globalWrite = session({ modules: { game: true } })
    expect(canWriteGame(globalWrite, 'some-future-game')).toBe(true)
  })

  it('honours a per-game grant WITHOUT the module grant (union, unlike versions)', () => {
    const perGame = session({ games: { 'fill-blank': false } })
    expect(hasGlobalGameAccess(perGame)).toBe(false)
    expect(canReadGame(perGame, 'fill-blank')).toBe(true)
    expect(canWriteGame(perGame, 'fill-blank')).toBe(false)

    const perGameWrite = session({ games: { 'fill-blank': true } })
    expect(canWriteGame(perGameWrite, 'fill-blank')).toBe(true)
  })

  it('does not leak a grant on one game to another', () => {
    const s = session({ games: { 'fill-blank': true } })
    expect(canReadGame(s, 'other-game')).toBe(false)
    expect(canWriteGame(s, 'other-game')).toBe(false)
  })

  it('lets a per-game write grant escalate one game above global read', () => {
    const s = session({
      modules: { game: false },
      games: { 'fill-blank': true },
    })
    expect(canWriteGame(s, 'fill-blank')).toBe(true)
    expect(canWriteGame(s, 'other-game')).toBe(false)
  })

  it('denies when there are no game grants', () => {
    const none = session({ modules: { quran: true } })
    expect(canReadGame(none, 'fill-blank')).toBe(false)
    expect(hasAnyGameAccess(none)).toBe(false)
  })

  it('reports any access from either tier', () => {
    expect(hasAnyGameAccess(session({ is_admin: true }))).toBe(true)
    expect(hasAnyGameAccess(session({ modules: { game: false } }))).toBe(true)
    expect(hasAnyGameAccess(session({ games: { 'fill-blank': false } }))).toBe(
      true
    )
    expect(hasAnyGameAccess(session())).toBe(false)
  })

  it('filters a registry, treating global access as all games', () => {
    const registry = [
      { key: 'fill-blank', name: 'Fill in the Blank' },
      { key: 'other-game', name: 'Other' },
    ]
    expect(
      accessibleGames(session({ games: { 'fill-blank': true } }), registry)
    ).toEqual([registry[0]])
    // A global grant holds no per-game entries, so the registry must not be
    // filtered down to nothing.
    expect(
      accessibleGames(session({ modules: { game: false } }), registry)
    ).toEqual(registry)
    expect(accessibleGames(session({ is_admin: true }), registry)).toEqual(
      registry
    )
    expect(accessibleGames(session(), registry)).toEqual([])
  })

  it('tolerates a session missing the games map', () => {
    // Defensive: an older backend, or a cached response predating the field.
    const legacy = {
      ...session(),
      games: undefined,
    } as unknown as EditorialSession
    expect(canReadGame(legacy, 'fill-blank')).toBe(false)
    expect(canWriteGame(legacy, 'fill-blank')).toBe(false)
    expect(hasAnyGameAccess(legacy)).toBe(false)
  })
})

describe('hasEditorWorkspaceAccess', () => {
  it('excludes games-only editors', () => {
    // Games have no content documents, so /editor would be an empty workspace.
    expect(hasEditorWorkspaceAccess(session({ modules: { game: true } }))).toBe(
      false
    )
    expect(
      hasEditorWorkspaceAccess(session({ games: { 'fill-blank': true } }))
    ).toBe(false)
  })

  it('admits admins and holders of any content module', () => {
    expect(hasEditorWorkspaceAccess(session({ is_admin: true }))).toBe(true)
    expect(
      hasEditorWorkspaceAccess(session({ modules: { community: false } }))
    ).toBe(true)
    expect(
      hasEditorWorkspaceAccess(
        session({ modules: { game: true, article: false } })
      )
    ).toBe(true)
  })

  it('rejects a version grant with no module grant', () => {
    expect(
      hasEditorWorkspaceAccess(session({ quran_versions: { '1': true } }))
    ).toBe(false)
  })
})
