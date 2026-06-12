'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { meApi, type ActivityKind } from '@/src/api/me-client'

interface ActivityRecorderProps {
  kind: ActivityKind
  scripture: 'quran' | 'bible'
  verseKey?: string
  query?: string
}

// Fires a single fire-and-forget activity event when the route mounts (or
// when its identifying props change). No-ops when signed out. The server
// drops the write silently if the user has revoked consent, so the client
// does not need to check first.
export function ActivityRecorder(props: ActivityRecorderProps) {
  const { status } = useSession()
  const sig = `${props.kind}|${props.scripture}|${props.verseKey ?? ''}|${props.query ?? ''}`
  const lastRef = useRef<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (lastRef.current === sig) return
    lastRef.current = sig
    meApi.activity
      .record({
        kind: props.kind,
        scripture: props.scripture,
        verse_key: props.verseKey,
        query: props.query,
      })
      .catch(() => {
        // Activity recording must never break navigation.
      })
  }, [status, sig, props.kind, props.scripture, props.verseKey, props.query])

  return null
}
