'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPrayerTimes, type PrayerTimesResponse } from '@/lib/prayer-times'
import {
  readCachedPrayerResponse,
  writeCachedPrayerResponse,
} from '@/lib/prayer-times-cache'
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

  const query = useQuery<PrayerTimesResponse, Error>({
    queryKey: ['prayer-times', location],
    queryFn: async ({ signal }) => {
      // includeSchedule: one fetch serves both the UI and the local
      // notification scheduler (which reads the persisted copy offline).
      const response = await fetchPrayerTimes(location as string, {
        signal,
        includeSchedule: true,
      })
      const previous = readCachedPrayerResponse()
      writeCachedPrayerResponse(location as string, response)
      // Tell the notification bridge when the resolved location moved so it
      // reschedules prayer notifications for the new city.
      if (previous && previous.location !== location) {
        window.dispatchEvent(new Event('prayer-location-changed'))
      }
      return response
    },
    enabled: location !== null,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
    // Last successful response (any location) paints the card instantly on
    // relaunch; a location change briefly shows the previous city, then the
    // animated transition swaps in the fresh one.
    placeholderData: (previous: PrayerTimesResponse | undefined) =>
      previous ?? readCachedPrayerResponse()?.response,
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
