'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getRegisteredOfflineUserStore } from '@/lib/offline/user/registry'
import { registerSyncTransport } from '@/lib/offline/user/transport'
import { flushOutbox } from '@/lib/offline/user/sync-runner'
import { webSyncTransport } from '@/lib/offline-sync-transport'
import { flushPendingGameSubmits } from '@/lib/games-submit'

/**
 * Wires the offline user store to the session lifecycle (web): opens the
 * per-user database on sign-in, clears it on sign-out, and replays the outbox
 * when connectivity returns. Renders nothing. Web-only — mobile will wire its
 * own bridge to the native session.
 */
export function OfflineSyncBridge() {
  const { data: session, status } = useSession()
  const userKey = session?.user?.email ?? null
  const flushing = useRef(false)
  const openedFor = useRef<string | null>(null)

  const doFlush = useCallback(async () => {
    if (flushing.current) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return
    const store = getRegisteredOfflineUserStore()
    if (!store || openedFor.current === null) return
    flushing.current = true
    try {
      await flushOutbox(store, webSyncTransport)
    } catch {
      // Offline or server error: the outbox is durable and retried on the next trigger.
    } finally {
      flushing.current = false
    }
  }, [])

  // Make the web transport available to any caller that flushes via the registry.
  useEffect(() => {
    registerSyncTransport(webSyncTransport)
    return () => registerSyncTransport(null)
  }, [])

  // Open the per-user store on sign-in (then flush anything queued); clear on sign-out.
  useEffect(() => {
    const store = getRegisteredOfflineUserStore()
    if (!store) return
    if (status === 'authenticated' && userKey) {
      if (openedFor.current !== userKey) {
        openedFor.current = userKey
        void store.open(userKey).then(() => doFlush())
      }
    } else if (status === 'unauthenticated' && openedFor.current !== null) {
      openedFor.current = null
      void store.clear()
    }
  }, [status, userKey, doFlush])

  // Game rounds queue in their own localStorage outbox (they are not part of
  // the user-store mutation set), so they drain on the same triggers but
  // independently of the store being open.
  const doFlushGames = useCallback(() => {
    if (status !== 'authenticated') return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return
    void flushPendingGameSubmits()
  }, [status])

  useEffect(() => {
    doFlushGames()
  }, [doFlushGames])

  // Replay on reconnect and when the tab becomes visible again.
  useEffect(() => {
    const onOnline = () => {
      void doFlush()
      doFlushGames()
    }
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      void doFlush()
      doFlushGames()
    }
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [doFlush, doFlushGames])

  return null
}
