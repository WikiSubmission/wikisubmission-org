'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import { useQuranPreferences, type QuranPreferences } from '@/hooks/use-quran-preferences'

// Keys excluded from backend sync.
// `displayMode` is intentionally local-only because pushing a transient view
// state through the account preference store created bad UX on chapter loads:
// stale server state could override the user's current local choice.
const EXCLUDED_KEYS = new Set(['setPreferences', 'displayMode'])

function stripRemoteOnlyOverrides(
  prefs: QuranPreferences,
  remote: Partial<QuranPreferences>
): QuranPreferences {
  const next = { ...remote }
  delete next.displayMode
  return { ...prefs, ...next }
}

function toPayload(prefs: QuranPreferences): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(prefs)) {
    if (!EXCLUDED_KEYS.has(k)) out[k] = v
  }
  return out
}

// Hydrate local store from server once, then debounce PUTs on subsequent local
// changes. Only durable reading preferences participate in backend sync.
export function useQuranPrefsSync() {
  const { data: session } = useSession()
  const prefs = useQuranPreferences()
  const hydratedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPayloadRef = useRef<string>('')

  // Hydrate from server once, on first auth.
  useEffect(() => {
    if (!session?.accessToken || hydratedRef.current) return
    hydratedRef.current = true

    meApi.getPreferences('quran').then((res) => {
      if (res.data && typeof res.data === 'object') {
        // Backend prefs hydrate the durable reading settings only.
        // `displayMode` remains local-only by design.
        prefs.setPreferences(
          stripRemoteOnlyOverrides(prefs, res.data as Partial<QuranPreferences>)
        )
      }
    }).catch(() => {
      // Silently ignore — local preferences stay as-is if server is unreachable.
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken])

  // Debounce PUTs whenever preferences change (after hydration).
  useEffect(() => {
    if (!session?.accessToken || !hydratedRef.current) return
    const payload = toPayload(prefs)
    const serialised = JSON.stringify(payload)
    if (serialised === prevPayloadRef.current) return
    prevPayloadRef.current = serialised

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      meApi.putPreferences({ scripture: 'quran', payload }).catch(() => {})
    }, 2_000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  })
}
