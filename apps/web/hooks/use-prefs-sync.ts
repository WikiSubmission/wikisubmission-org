'use client'

import { useEffect, useRef } from 'react'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import { useQuranPreferences, type QuranPreferences } from '@/hooks/use-quran-preferences'

// Keys excluded from sync (functions are not serialisable).
const EXCLUDED_KEYS = new Set(['setPreferences'])

function toPayload(prefs: QuranPreferences): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(prefs)) {
    if (!EXCLUDED_KEYS.has(k)) out[k] = v
  }
  return out
}

// Hydrate local store from server on first load (server-wins), then debounce
// PUTs on every subsequent local change.
export function useQuranPrefsSync() {
  const { isSignedIn } = useScriptureAuth()
  const prefs = useQuranPreferences()
  const hydratedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPayloadRef = useRef<string>('')

  // Hydrate from server once, on first auth.
  useEffect(() => {
    if (!isSignedIn || hydratedRef.current) return
    hydratedRef.current = true

    meApi.getPreferences('quran').then((res) => {
      if (res.data && typeof res.data === 'object') {
        // Server-wins: merge server payload into local store, preserving
        // the local setPreferences function reference.
        prefs.setPreferences({ ...prefs, ...(res.data as Partial<QuranPreferences>) })
      }
    }).catch(() => {
      // Silently ignore — local preferences stay as-is if server is unreachable.
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn])

  // Debounce PUTs whenever preferences change (after hydration).
  useEffect(() => {
    if (!isSignedIn || !hydratedRef.current) return
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
