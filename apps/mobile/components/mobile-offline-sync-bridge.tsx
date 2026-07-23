'use client'

import { useCallback, useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { getRegisteredOfflineUserStore } from '@/lib/offline/user/registry'
import { flushOutbox } from '@/lib/offline/user/sync-runner'
import { mobileSyncTransport } from '@/lib/offline-sync-transport-mobile'
import { registerMobileOfflineStore } from '@/lib/register-offline-mobile'
import { useMobileAuth } from '@/components/mobile-auth-context'

// Register the native stores + transport at module scope so it runs once before
// any provider renders (mirrors registerMobileApiAuth). No-op off-device.
registerMobileOfflineStore()

/**
 * Wires the native offline user store to the mobile session lifecycle: opens the
 * per-user database on sign-in (keyed by the stable auth id), clears it on
 * sign-out, and replays the outbox when the app resumes or regains
 * connectivity. Renders nothing. The native counterpart to OfflineSyncBridge.
 */
export function MobileOfflineSyncBridge() {
  const { user, isAuthenticated } = useMobileAuth()
  const userKey = user?.auth_id ?? null
  const flushing = useRef(false)
  const openedFor = useRef<string | null>(null)

  const doFlush = useCallback(async () => {
    if (flushing.current) return
    const store = getRegisteredOfflineUserStore()
    if (!store || openedFor.current === null) return
    flushing.current = true
    try {
      await flushOutbox(store, mobileSyncTransport)
    } catch {
      // Offline or server error: the outbox is durable and retried on the next trigger.
    } finally {
      flushing.current = false
    }
  }, [])

  // Open the per-user store on sign-in (then flush anything queued); clear on sign-out.
  useEffect(() => {
    const store = getRegisteredOfflineUserStore()
    if (!store) return
    if (isAuthenticated && userKey) {
      if (openedFor.current !== userKey) {
        openedFor.current = userKey
        void store.open(userKey).then(() => doFlush())
      }
    } else if (!isAuthenticated && openedFor.current !== null) {
      openedFor.current = null
      void store.clear()
    }
  }, [isAuthenticated, userKey, doFlush])

  // Replay when the app returns to the foreground (the native analogue of the
  // web tab becoming visible).
  useEffect(() => {
    const handle = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void doFlush()
    })
    return () => {
      void handle.then((h) => h.remove())
    }
  }, [doFlush])

  return null
}
