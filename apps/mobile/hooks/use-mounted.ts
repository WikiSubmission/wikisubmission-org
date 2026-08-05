'use client'

import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/**
 * Returns false during server render / first paint and true once mounted on the
 * client. Uses useSyncExternalStore so it never calls setState in an effect.
 * Use to gate client-only UI (theme/palette reads) in a static export.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
