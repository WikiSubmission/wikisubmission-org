import { StrictMode } from 'react'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Behavioural tests for `useQuranPrefsSync` (packages/shared/hooks/use-prefs-sync.ts).
 *
 * The hook keeps its session state at module scope, so every test re-imports it
 * through `vi.resetModules()` + dynamic `import()` — otherwise `hydrated` /
 * `lastPushed` / the pending timer leak between cases and a test can pass on
 * another test's state. `loadHook()` below is the only way this file touches
 * either module.
 *
 * The regression these pin down: settings on the reader "auto-reverted".
 * `ChapterReader` is keyed by chapter (`reader-boot.tsx` line 53,
 * `chapter-reader-client.tsx` line 105), so it remounts on every chapter
 * navigation — which used to re-run the hydrating GET and stamp stale server
 * values over whatever the user had just changed.
 */

const h = vi.hoisted(() => ({
  getPreferences: vi.fn<(scripture: string) => Promise<{ data: Record<string, unknown> | null }>>(),
  putPreferences: vi.fn<(body: unknown) => Promise<void>>(),
  signedIn: true,
}))

vi.mock('@/src/api/me-client', () => ({
  meApi: {
    getPreferences: (s: string) => h.getPreferences(s),
    putPreferences: (b: unknown) => h.putPreferences(b),
  },
}))

vi.mock('@/lib/scripture-auth-context', () => ({
  // Read at render time, so flipping `h.signedIn` + re-rendering flips auth.
  useScriptureAuth: () => ({ isSignedIn: h.signedIn, promptSignIn: () => {} }),
}))

type Loaded = {
  useQuranPrefsSync: typeof import('@/hooks/use-prefs-sync')['useQuranPrefsSync']
  useQuranPreferences: typeof import('@/hooks/use-quran-preferences')['useQuranPreferences']
}

/** Fresh module graph — the hook and the store it writes to must be the same instance. */
async function loadHook(): Promise<Loaded> {
  vi.resetModules()
  const prefs = await import('@/hooks/use-quran-preferences')
  const sync = await import('@/hooks/use-prefs-sync')
  return { useQuranPrefsSync: sync.useQuranPrefsSync, useQuranPreferences: prefs.useQuranPreferences }
}

/** Flush pending promise jobs without advancing the fake clock. */
async function flush() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

function makeProbe(useQuranPrefsSync: Loaded['useQuranPrefsSync']) {
  return function Probe({ tick }: { tick: number }) {
    useQuranPrefsSync()
    return <span data-testid="tick">{tick}</span>
  }
}

beforeEach(() => {
  localStorage.clear()
  h.signedIn = true
  h.getPreferences.mockReset().mockResolvedValue({ data: null })
  h.putPreferences.mockReset().mockResolvedValue(undefined)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useQuranPrefsSync', () => {
  it('sends exactly one PUT when re-renders happen inside the debounce window', async () => {
    // The core regression. The old effect had no dependency array: its cleanup
    // cleared the pending timer on every re-render, and the unchanged-payload
    // guard then refused to reschedule — so a single re-render inside the 2s
    // window (the reader has one per scroll tick) killed the push for good.
    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    const view = render(<Probe tick={0} />)
    await flush()
    // No server record: the hook seeds local prefs upward. Let that settle.
    await advance(2_000)
    h.putPreferences.mockClear()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ wordByWord: true })
    })

    // Six re-renders spread across the debounce window.
    for (let i = 1; i <= 6; i++) {
      view.rerender(<Probe tick={i} />)
      await advance(200)
    }
    expect(h.putPreferences).not.toHaveBeenCalled() // still debouncing

    await advance(2_000)

    expect(h.putPreferences).toHaveBeenCalledTimes(1)
    const body = h.putPreferences.mock.calls[0][0] as {
      scripture: string
      payload: Record<string, unknown>
    }
    expect(body.scripture).toBe('quran')
    expect(body.payload.wordByWord).toBe(true)
    // displayMode is deliberately local-only.
    expect(body.payload).not.toHaveProperty('displayMode')
  })

  it('still sends the PUT when the reader unmounts inside the debounce window', async () => {
    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    const view = render(<Probe tick={0} />)
    await flush()
    await advance(2_000)
    h.putPreferences.mockClear()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ zoomLevel: 'wide' })
    })
    await advance(500)
    view.unmount()
    await advance(2_000)

    expect(h.putPreferences).toHaveBeenCalledTimes(1)
    const body = h.putPreferences.mock.calls[0][0] as { payload: Record<string, unknown> }
    expect(body.payload.zoomLevel).toBe('wide')
  })

  it('does not re-hydrate on remount, and does not clobber a post-hydration change', async () => {
    // Chapter navigation remounts ChapterReader. The old per-instance
    // `hydratedRef` meant every navigation re-ran the GET and wrote the stale
    // server blob back over the user's live settings.
    h.getPreferences.mockResolvedValue({ data: { wordByWord: true, arabic: false } })

    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    const view = render(<Probe tick={0} />)
    await flush()
    expect(h.getPreferences).toHaveBeenCalledTimes(1)
    expect(useQuranPreferences.getState().wordByWord).toBe(true)

    // User turns word-by-word back off, then navigates to another chapter.
    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ wordByWord: false })
    })
    await advance(2_000)
    h.putPreferences.mockClear()

    view.unmount()
    const view2 = render(<Probe tick={0} />)
    await flush()
    await advance(2_000)

    expect(h.getPreferences).toHaveBeenCalledTimes(1) // NOT re-issued
    expect(useQuranPreferences.getState().wordByWord).toBe(false) // NOT reverted
    expect(h.putPreferences).not.toHaveBeenCalled() // remount is not a change
    view2.unmount()
  })

  it('does not echo a PUT back of the record it just hydrated', async () => {
    h.getPreferences.mockResolvedValue({
      data: { wordByWord: true, arabic: false, primaryLanguage: 'fr' },
    })

    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    render(<Probe tick={0} />)
    await flush()
    await advance(5_000)

    expect(useQuranPreferences.getState().primaryLanguage).toBe('fr')
    expect(h.putPreferences).not.toHaveBeenCalled()
  })

  it('seeds local preferences upward when the server has no record yet', async () => {
    h.getPreferences.mockResolvedValue({ data: null })

    const { useQuranPrefsSync } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    render(<Probe tick={0} />)
    await flush()
    await advance(2_000)

    expect(h.putPreferences).toHaveBeenCalledTimes(1)
  })

  it('cancels a pending PUT on sign-out and re-hydrates on the next sign-in', async () => {
    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    const view = render(<Probe tick={0} />)
    await flush()
    await advance(2_000)
    h.putPreferences.mockClear()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ transliteration: true })
    })
    await advance(500)

    // Sign out mid-debounce.
    h.signedIn = false
    await act(async () => {
      view.rerender(<Probe tick={1} />)
    })
    await advance(5_000)

    expect(h.putPreferences).not.toHaveBeenCalled()

    // Signing back in re-hydrates: session state was reset.
    h.signedIn = true
    await act(async () => {
      view.rerender(<Probe tick={2} />)
    })
    await flush()
    expect(h.getPreferences).toHaveBeenCalledTimes(2)
  })

  it('never sends a PUT while signed out', async () => {
    h.signedIn = false
    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    const view = render(<Probe tick={0} />)
    await flush()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ wordByWord: true })
    })
    view.rerender(<Probe tick={1} />)
    await advance(5_000)

    expect(h.getPreferences).not.toHaveBeenCalled()
    expect(h.putPreferences).not.toHaveBeenCalled()
    // Local-only preferences still work.
    expect(useQuranPreferences.getState().wordByWord).toBe(true)
  })

  it('issues exactly one GET under StrictMode double-invocation', async () => {
    h.getPreferences.mockResolvedValue({ data: { wordByWord: true } })

    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    render(
      <StrictMode>
        <Probe tick={0} />
      </StrictMode>
    )
    await flush()
    await advance(5_000)

    expect(h.getPreferences).toHaveBeenCalledTimes(1)
    expect(useQuranPreferences.getState().wordByWord).toBe(true)
    expect(h.putPreferences).not.toHaveBeenCalled()
  })

  it('sends one PUT when two hooks are mounted at once', async () => {
    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    render(
      <>
        <Probe tick={0} />
        <Probe tick={0} />
      </>
    )
    await flush()
    await advance(2_000)
    expect(h.getPreferences).toHaveBeenCalledTimes(1)
    h.putPreferences.mockClear()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ subtitles: false })
    })
    await advance(5_000)

    expect(h.putPreferences).toHaveBeenCalledTimes(1)
  })

  it('survives a transient signed-out blip without reverting or re-hydrating', async () => {
    // On web `isSignedIn = !!session?.accessToken`, which reads false while
    // next-auth resolves and can blip false on refetch. A sign-out is only
    // acted on after SIGN_OUT_GRACE_MS, so a blip shorter than that must leave
    // the session — and the user's pending change — completely intact.
    h.getPreferences.mockResolvedValue({ data: { wordByWord: true } })

    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    const view = render(<Probe tick={0} />)
    await flush()
    h.putPreferences.mockClear()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ wordByWord: false })
    })
    await advance(500)

    h.signedIn = false
    await act(async () => {
      view.rerender(<Probe tick={1} />)
    })
    await advance(200)
    h.signedIn = true
    await act(async () => {
      view.rerender(<Probe tick={2} />)
    })
    await flush()
    await advance(5_000)

    // No second hydrate, so nothing stamped the server's value back.
    expect(h.getPreferences).toHaveBeenCalledTimes(1)
    expect(useQuranPreferences.getState().wordByWord).toBe(false)
    // And the pending push survived the blip.
    expect(h.putPreferences).toHaveBeenCalledTimes(1)
  })

  // The phase settles in `.finally()`, not `.then()`. Gating pushes on a
  // *successful* hydrate left an offline session unable to save any preference
  // for the rest of the page's life.
  it('still pushes when the hydrating GET fails', async () => {
    h.getPreferences.mockRejectedValue(new Error('offline'))

    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    render(<Probe tick={0} />)
    await flush()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ wordByWord: true })
    })
    await advance(5_000)

    expect(h.putPreferences).toHaveBeenCalled()
  })

  // Echo-suppression seeds `lastPushed` from the post-patch store, which would
  // fold in a mid-flight change and make the push effect skip it as a no-op.
  // Hydration therefore only suppresses the echo when the store did not move
  // while the GET was in flight.
  it('does not lose a preference changed while the hydrating GET is in flight', async () => {
    // `zoomLevel` is absent from the server record, so hydration has no opinion
    // on it and the user's mid-flight choice survives in the store. It must
    // still reach the server.
    let resolveGet!: (v: { data: Record<string, unknown> | null }) => void
    h.getPreferences.mockReturnValue(
      new Promise((resolve) => {
        resolveGet = resolve
      })
    )

    const { useQuranPrefsSync, useQuranPreferences } = await loadHook()
    const Probe = makeProbe(useQuranPrefsSync)

    render(<Probe tick={0} />)
    await flush()

    await act(async () => {
      useQuranPreferences.getState().patchPreferences({ zoomLevel: 'wide' })
    })

    await act(async () => {
      resolveGet({ data: { wordByWord: true } })
    })
    await flush()
    await advance(5_000)

    expect(useQuranPreferences.getState().zoomLevel).toBe('wide')
    expect(h.putPreferences).toHaveBeenCalled()
    const last = h.putPreferences.mock.calls.at(-1)?.[0] as { payload: Record<string, unknown> }
    expect(last.payload.zoomLevel).toBe('wide')
  })
})
