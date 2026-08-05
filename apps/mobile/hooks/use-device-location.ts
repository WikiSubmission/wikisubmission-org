'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

export type DeviceLocationStatus = 'pending' | 'granted' | 'denied' | 'unavailable'

export interface UseDeviceLocationResult {
  /** "lat,lng" string suitable for the prayer-times service, or null while unknown. */
  location: string | null
  status: DeviceLocationStatus
  /** Re-run the permission prompt + position fix (e.g. from a "tap to enable" hint). */
  requestLocation: () => void
}

/** Cached last-known coords so relaunches render instantly while a fresh fix runs. */
const COORDS_STORAGE_KEY = 'pt_coords'

// City-level accuracy is all prayer times need; ~3 decimals ≈ 110 m and keeps
// the React Query key (and the upstream geocoding cache) stable between fixes.
const COORD_DECIMALS = 3
const POSITION_TIMEOUT_MS = 10_000
const POSITION_MAX_AGE_MS = 5 * 60 * 1000
// The cached fix paints the prayer card instantly; the fresh fix (permission
// check + position request over the native bridge) waits this long so it
// never competes with hydration and first paint on the startup critical path.
const FRESH_FIX_DELAY_MS = 500

function toLocationString(latitude: number, longitude: number): string {
  return `${latitude.toFixed(COORD_DECIMALS)},${longitude.toFixed(COORD_DECIMALS)}`
}

function readCachedCoords(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(COORDS_STORAGE_KEY)
    return raw && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(raw) ? raw : null
  } catch {
    return null
  }
}

function writeCachedCoords(value: string): void {
  try {
    window.localStorage.setItem(COORDS_STORAGE_KEY, value)
  } catch {
    // Private mode etc. — the in-memory value still works for this session.
  }
}

class LocationDeniedError extends Error {
  constructor() {
    super('Location permission denied.')
    this.name = 'LocationDeniedError'
  }
}

function isDeniedError(error: unknown): boolean {
  if (error instanceof LocationDeniedError) return true
  // Web GeolocationPositionError: code 1 = PERMISSION_DENIED.
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code: unknown }).code === 1
  }
  return error instanceof Error && /denied|permission/i.test(error.message)
}

async function acquirePosition(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    // Only the coarse alias: the manifest declares ACCESS_COARSE_LOCATION alone
    // and approximate location is all this feature should ever ask for.
    let permissions = await Geolocation.checkPermissions()
    if (
      permissions.coarseLocation === 'prompt' ||
      permissions.coarseLocation === 'prompt-with-rationale'
    ) {
      permissions = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] })
    }
    if (permissions.coarseLocation !== 'granted') throw new LocationDeniedError()
  }

  // On web this triggers the browser permission prompt itself.
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: false,
    timeout: POSITION_TIMEOUT_MS,
    maximumAge: POSITION_MAX_AGE_MS,
  })
  return toLocationString(position.coords.latitude, position.coords.longitude)
}

/**
 * Resolves the device's approximate location as a "lat,lng" string for the
 * prayer-times service. Seeds from the last cached fix so a relaunch shows
 * times immediately, then refreshes in the background.
 */
export function useDeviceLocation(): UseDeviceLocationResult {
  const [status, setStatus] = useState<DeviceLocationStatus>('pending')
  const [location, setLocation] = useState<string | null>(null)
  const runningRef = useRef(false)

  const acquire = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    setStatus('pending')

    acquirePosition()
      .then((next) => {
        writeCachedCoords(next)
        // The rounded coords usually match the cached seed — skip the state
        // write (and the React Query key change it would ripple) when they do.
        setLocation((prev) => (prev === next ? prev : next))
        setStatus('granted')
      })
      .catch((error: unknown) => {
        setStatus(isDeniedError(error) ? 'denied' : 'unavailable')
      })
      .finally(() => {
        runningRef.current = false
      })
  }, [])

  useEffect(() => {
    // Seed from the last good fix so a relaunch renders times immediately
    // (post-hydration, so the export HTML still matches), then run the fresh
    // (possibly slow, possibly denied) fix off the startup critical path.
    setLocation((prev) => prev ?? readCachedCoords())
    const timer = setTimeout(acquire, FRESH_FIX_DELAY_MS)
    return () => clearTimeout(timer)
  }, [acquire])

  // Re-acquire when the app returns to the foreground so a user who traveled
  // sees their new city without restarting. Cheap: getCurrentPosition honors
  // maximumAge, and the rounded coords keep the query key stable in place.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let remove: (() => void) | undefined
    let cancelled = false
    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) acquire()
      }).then((handle) => {
        if (cancelled) handle.remove()
        else remove = () => handle.remove()
      })
    })
    return () => {
      cancelled = true
      remove?.()
    }
  }, [acquire])

  return { location, status, requestLocation: acquire }
}
