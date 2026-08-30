'use client'

import { useEffect, useMemo, useState } from 'react'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import {
  sanitiseRemotePreferences,
  useQuranPreferences,
  type QuranPreferences,
} from '@/hooks/use-quran-preferences'

// Keys excluded from backend sync.
// The two setters are store actions, not data. `displayMode` is intentionally
// local-only because pushing a transient view state through the account
// preference store created bad UX on chapter loads: stale server state could
// override the user's current local choice.
const EXCLUDED_KEYS = new Set(['setPreferences', 'patchPreferences', 'displayMode'])

const PUSH_DEBOUNCE_MS = 2_000
/**
 * How long a falsy `isSignedIn` must persist before it counts as a sign-out.
 *
 * `isSignedIn` is `!!session?.accessToken` on web, which reads false while
 * next-auth is still resolving and can blip false while it refetches. Acting on
 * the first falsy render cancelled pending pushes and forced a re-hydrate that
 * stamped the stale server row back over the user's live change.
 */
const SIGN_OUT_GRACE_MS = 1_000

/**
 * Sync state is module-scoped because it belongs to the signed-in *session*,
 * not to a hook instance.
 *
 * `ChapterReader` is the only mount point and both apps give it a `key` derived
 * from the chapter, so every chapter navigation unmounts and remounts it.
 * Holding this state in refs meant each navigation re-ran the hydrating GET and
 * overwrote whatever the reader had changed since — a preference the user had
 * just toggled would silently snap back to the server's older value a moment
 * after the new chapter appeared. It also meant an unmount cancelled a pending
 * push, so the value the user chose never reached the server in the first place.
 *
 * `phase` deliberately never returns to `idle` on its own: a mid-session re-pull
 * is exactly the behaviour that produced the reverting-settings bug.
 */
type SyncPhase = 'idle' | 'hydrating' | 'ready'
let phase: SyncPhase = 'idle'
/** Serialised payload last handed to the server, to skip no-op pushes. */
let lastPushed = ''
let pushTimer: ReturnType<typeof setTimeout> | null = null
/** Last observed auth state, so only a real true → false transition ends the session. */
let wasSignedIn = false
let signOutTimer: ReturnType<typeof setTimeout> | null = null

/** Wakes mounted hooks when hydration settles, so a change made mid-flight still pushes. */
const phaseListeners = new Set<() => void>()

function toPayload(prefs: QuranPreferences): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(prefs)) {
    if (!EXCLUDED_KEYS.has(k)) out[k] = v
  }
  return out
}

/** Serialise the store's current syncable preferences. */
function snapshot(): string {
  return JSON.stringify(toPayload(useQuranPreferences.getState()))
}

function cancelPush() {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = null
}

function schedulePush(serialised: string) {
  cancelPush()
  pushTimer = setTimeout(() => {
    pushTimer = null
    meApi
      .putPreferences({
        scripture: 'quran',
        payload: JSON.parse(serialised) as Record<string, unknown>,
      })
      .catch(() => {
        // A failed push must not be remembered as pushed: otherwise a later edit
        // that happens to restore these exact values would be skipped as a no-op
        // and the server would keep the stale record indefinitely. Only clear the
        // marker if a newer push has not already claimed it.
        if (lastPushed === serialised) lastPushed = ''
      })
  }, PUSH_DEBOUNCE_MS)
}

function cancelPendingSignOut() {
  if (signOutTimer) clearTimeout(signOutTimer)
  signOutTimer = null
}

function endSession() {
  phase = 'idle'
  lastPushed = ''
  // Never push one account's preferences after it has signed out.
  cancelPush()
}

function settlePhase() {
  phase = 'ready'
  for (const listener of phaseListeners) listener()
}

// Hydrate local store from server once per session, then debounce PUTs on
// subsequent local changes. Only durable reading preferences participate.
export function useQuranPrefsSync() {
  const { isSignedIn } = useScriptureAuth()
  const prefs = useQuranPreferences()
  // Zustand keeps the state object identity stable between writes, so this only
  // recomputes when a preference actually changes — not on the reader's
  // scroll-driven re-renders.
  const serialised = useMemo(() => JSON.stringify(toPayload(prefs)), [prefs])
  const [phaseTick, setPhaseTick] = useState(0)

  useEffect(() => {
    const listener = () => setPhaseTick((n) => n + 1)
    phaseListeners.add(listener)
    return () => {
      phaseListeners.delete(listener)
    }
  }, [])

  // Hydrate from server once per signed-in session.
  useEffect(() => {
    if (!isSignedIn) {
      // Never signed in during this session — auth simply has not resolved yet.
      if (!wasSignedIn) return
      // Signed in a moment ago. Wait out the grace period before tearing the
      // session down, so a refetch blip does not cancel a pending push or
      // trigger a re-hydrate that would revert the user's live change.
      if (signOutTimer) return
      signOutTimer = setTimeout(() => {
        signOutTimer = null
        wasSignedIn = false
        endSession()
      }, SIGN_OUT_GRACE_MS)
      return
    }
    cancelPendingSignOut()
    wasSignedIn = true
    if (phase !== 'idle') return
    phase = 'hydrating'

    // Captured before the request so the resolver can tell whether the store
    // moved while it was in flight.
    const atRequest = snapshot()

    meApi
      .getPreferences('quran')
      .then((res) => {
        const remote = sanitiseRemotePreferences(res.data)
        // No server record yet: leave `lastPushed` empty so the local
        // preferences get seeded upward instead.
        if (Object.keys(remote).length === 0) return

        const beforePatch = snapshot()
        // Read the store fresh rather than closing over the render's snapshot:
        // this resolves a full round-trip later, and anything the user changed
        // meanwhile must survive. `patchPreferences` also keeps the `text`
        // invariant that a raw spread of the server blob would break.
        useQuranPreferences.getState().patchPreferences(remote)

        // Suppress the echo push of what we were just handed — but only if the
        // store did not move while the GET was in flight. If it did, that change
        // still has to reach the server, so leave the marker empty and let the
        // push effect below fire.
        if (beforePatch === atRequest) lastPushed = snapshot()
      })
      .catch(() => {
        // Silently ignore — local preferences stay as-is if the server is
        // unreachable.
      })
      .finally(() => {
        // Ready regardless of outcome. Gating pushes on a *successful* hydrate
        // left an offline session unable to save any preference for the rest of
        // the page's life.
        settlePhase()
      })
  }, [isSignedIn])

  // Debounce PUTs whenever preferences change (after hydration).
  //
  // The dependency array matters: without one this effect re-ran on every
  // render and its cleanup cleared the pending timer, while the unchanged-
  // payload guard stopped a replacement from ever being scheduled — so any
  // re-render inside the debounce window (the reader has one per scroll tick)
  // cancelled the push permanently. There is deliberately no cleanup here
  // either; a pending push should outlive the reader unmounting.
  useEffect(() => {
    if (!isSignedIn || phase !== 'ready') return
    if (serialised === lastPushed) return
    lastPushed = serialised
    schedulePush(serialised)
  }, [isSignedIn, serialised, phaseTick])
}
