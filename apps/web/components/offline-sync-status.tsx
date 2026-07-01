'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getRegisteredOfflineUserStore } from '@/lib/offline/user/registry'

/**
 * Unobtrusive pending-sync badge: shows how many offline changes are still
 * queued in the outbox. Hidden when nothing is pending (the common case). Polls
 * the count cheaply and refreshes on focus/reconnect so it clears promptly once
 * the sync bridge drains the outbox. Web-only.
 *
 * Gated on an authenticated session: the outbox only exists for signed-in users,
 * and this keeps the user worker from spinning up on public pages.
 */
export function OfflineSyncStatus() {
  const { status } = useSession()
  const [pending, setPending] = useState(0)
  const signedIn = status === 'authenticated'

  useEffect(() => {
    if (!signedIn) return
    let alive = true
    const refresh = async () => {
      const store = getRegisteredOfflineUserStore()
      if (!store) return
      try {
        const n = await store.pendingCount()
        if (alive) setPending(n)
      } catch {
        // store not opened yet (signed out) — treat as nothing pending
        if (alive) setPending(0)
      }
    }
    void refresh()
    const interval = window.setInterval(refresh, 15_000)
    const onActivity = () => void refresh()
    window.addEventListener('online', onActivity)
    window.addEventListener('focus', onActivity)
    document.addEventListener('visibilitychange', onActivity)
    return () => {
      alive = false
      window.clearInterval(interval)
      window.removeEventListener('online', onActivity)
      window.removeEventListener('focus', onActivity)
      document.removeEventListener('visibilitychange', onActivity)
    }
  }, [signedIn])

  if (!signedIn || pending === 0) return null

  return (
    <div role="status" style={badgeStyle}>
      <span style={dotStyle} aria-hidden />
      {pending} change{pending === 1 ? '' : 's'} waiting to sync
    </div>
  )
}

const badgeStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 16,
  left: 16,
  zIndex: 60,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: 999,
  border: '1px solid var(--ed-rule)',
  background: 'var(--ed-surface)',
  color: 'var(--ed-fg-muted)',
  fontSize: 12,
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
}

const dotStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  background: 'var(--ed-accent, #c08a2d)',
}
