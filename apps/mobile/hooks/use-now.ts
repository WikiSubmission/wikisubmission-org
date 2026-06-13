'use client'

import { useSyncExternalStore } from 'react'

// Single shared 1-second clock. getSnapshot returns the cached timestamp (stable
// between ticks) so useSyncExternalStore does not loop. Server snapshot is 0;
// countdowns only render once client data has loaded.
let now = Date.now()
let timer: ReturnType<typeof setInterval> | null = null
const listeners = new Set<() => void>()

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  if (timer === null) {
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 1000)
  }
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }
}

/** Current epoch milliseconds, updated once a second. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => 0,
  )
}
