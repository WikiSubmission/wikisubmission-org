'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPrayerTimes, type PrayerTimesResponse } from '@/lib/prayer-times'
import {
  useDeviceLocation,
  type DeviceLocationStatus,
} from '@/hooks/use-device-location'

export interface UsePrayerTimesResult {
  data: PrayerTimesResponse | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  dataUpdatedAt: number
  locationStatus: DeviceLocationStatus
  /** Re-run the location permission prompt (e.g. from a "tap to enable" hint). */
  requestLocation: () => void
  refetch: () => void
}

/**
 * Loads prayer times for the device's approximate location and keeps them
 * fresh. Data refetches every 5 minutes; the per-second countdown is derived
 * locally, so we do not poll the network for it.
 */
export function usePrayerTimes(): UsePrayerTimesResult {
  const { location, status: locationStatus, requestLocation } = useDeviceLocation()

  const query = useQuery({
    queryKey: ['prayer-times', location],
    queryFn: ({ signal }) => fetchPrayerTimes(location as string, { signal }),
    enabled: location !== null,
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
    locationStatus,
    requestLocation,
    refetch: query.refetch,
  }
}
