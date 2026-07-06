'use client'

import { LocateFixed, MapPin, RefreshCw, Sunrise } from 'lucide-react'
import { PRAYER_ORDER, type PrayerKey } from '@/lib/prayer-times'
import { usePrayerTimes } from '@/hooks/use-prayer-times'
import { cn } from '@/lib/utils'
import { PrayerGauge } from '@/components/today/prayer-gauge'

const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

function LocationSplash() {
  return (
    <div className="space-y-3 py-10 text-center">
      <LocateFixed
        className="text-primary mx-auto size-8 animate-pulse"
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm">Finding your location…</p>
    </div>
  )
}

function LocationPrompt({
  status,
  onRequest,
}: {
  status: 'denied' | 'unavailable'
  onRequest: () => void
}) {
  return (
    <div className="space-y-3 py-8 text-center">
      <MapPin className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
      <p className="text-foreground text-sm font-medium">
        {status === 'denied'
          ? 'Allow approximate location to see prayer times'
          : 'Your location is unavailable'}
      </p>
      <p className="text-muted-foreground px-4 text-xs">
        {status === 'denied'
          ? 'Only your approximate location is used, just enough to know your city. If nothing happens, enable Location for this app in system settings.'
          : 'Make sure location services are turned on, then try again.'}
      </p>
      <button
        type="button"
        onClick={onRequest}
        className="text-primary inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
        {status === 'denied' ? 'Enable location' : 'Try again'}
      </button>
    </div>
  )
}

export function PrayerSchedule() {
  const {
    data,
    isLoading,
    isError,
    error,
    dataUpdatedAt,
    locationStatus,
    requestLocation,
    refetch,
  } = usePrayerTimes()
  const currentPrayer = data?.current_prayer?.toLowerCase() ?? ''

  // Cached coords keep showing times while a fresh fix (or a denial) resolves;
  // the location states only take over when there is nothing to show yet.
  const showLocationSplash = !data && !isError && locationStatus === 'pending'
  const showLocationPrompt =
    !data && !isLoading && (locationStatus === 'denied' || locationStatus === 'unavailable')

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4">
      <div className="border-border/50 bg-background/55 rounded-2xl border p-5 shadow-sm backdrop-blur-md">
        {showLocationSplash || (isLoading && !data) ? (
          <LocationSplash />
        ) : showLocationPrompt ? (
          <LocationPrompt
            status={locationStatus as 'denied' | 'unavailable'}
            onRequest={requestLocation}
          />
        ) : isError ? (
          <div className="space-y-3 py-6 text-center">
            <p className="text-muted-foreground text-sm">
              {error?.message ?? 'Could not load prayer times.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-primary inline-flex items-center gap-1.5 text-sm font-medium"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : data ? (
          <>
            <PrayerGauge data={data} dataUpdatedAt={dataUpdatedAt} onExpired={refetch} />

            <ul className="divide-border/40 mt-5 divide-y">
              {data.times?.sunrise ? (
                <li className="text-muted-foreground flex items-center justify-between py-2 text-xs">
                  <span className="flex items-center gap-2">
                    <Sunrise className="size-3" aria-hidden="true" />
                    Sunrise
                  </span>
                  <span className="font-mono tabular-nums">{data.times.sunrise}</span>
                </li>
              ) : null}

              {PRAYER_ORDER.map((key) => {
                const isCurrent = currentPrayer === key
                return (
                  <li
                    key={key}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors',
                      isCurrent && 'bg-primary/10',
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {PRAYER_LABELS[key]}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-sm tabular-nums',
                        isCurrent ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {data.times?.[key]}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  )
}
