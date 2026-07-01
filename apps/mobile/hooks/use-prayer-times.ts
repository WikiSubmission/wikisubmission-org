'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DEFAULT_PRAYER_LOCATION,
  fetchPrayerTimes,
  PRAYER_LOCATION_STORAGE_KEY,
  type PrayerTimesResponse,
} from '@/lib/prayer-times'

// localStorage-backed location store. Read through useSyncExternalStore so the
// chosen location survives reloads without a setState-in-effect hydration step.
const listeners = new Set<() => void>()

function readStoredLocation(): string {
  if (typeof window === 'undefined') return DEFAULT_PRAYER_LOCATION
  try {
    return window.localStorage.getItem(PRAYER_LOCATION_STORAGE_KEY) || DEFAULT_PRAYER_LOCATION
  } catch {
    return DEFAULT_PRAYER_LOCATION
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function writeLocation(next: string): void {
  try {
    window.localStorage.setItem(PRAYER_LOCATION_STORAGE_KEY, next)
  } catch {
    // Storage can be unavailable (private mode); the query key still updates
    // for the current session via the listener notification below.
  }
  listeners.forEach((l) => l())
}

export interface UsePrayerTimesResult {
  data: PrayerTimesResponse | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  dataUpdatedAt: number
  location: string
  setLocation: (next: string) => void
  refetch: () => void
}

/**
 * Loads prayer times for the current location and keeps them fresh. The chosen
 * location persists to localStorage (shared key with the web client). Data
 * refetches every 5 minutes; the per-second countdown is derived locally, so we
 * do not poll the network for it.
 */
export function usePrayerTimes(): UsePrayerTimesResult {
  const location = useSyncExternalStore(
    subscribe,
    readStoredLocation,
    () => DEFAULT_PRAYER_LOCATION,
  )

  const setLocation = useCallback((next: string) => {
    const trimmed = next.trim()
    if (trimmed) writeLocation(trimmed)
  }, [])

  const query = useQuery({
    queryKey: ['prayer-times', location],
    queryFn: ({ signal }) => fetchPrayerTimes(location, { signal }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    dataUpdatedAt: query.dataUpdatedAt,
    location,
    setLocation,
    refetch: query.refetch,
  }
}
