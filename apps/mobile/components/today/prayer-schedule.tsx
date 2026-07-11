'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, LocateFixed, MapPin, RefreshCw, Sunrise } from 'lucide-react'
import { NotificationSettingsSheet } from '@/components/today/notification-settings-sheet'
import { ZakatBadge } from '@/components/today/zakat-badge'
import { PRAYER_EVENT_ORDER, deriveEventCycle, type PrayerEventKey } from '@/lib/prayer-events'
import { usePrayerTimes } from '@/hooks/use-prayer-times'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { PrayerGauge } from '@/components/today/prayer-gauge'

const EVENT_LABELS: Record<PrayerEventKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
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
  const reducedMotion = usePrefersReducedMotion()
  // Sunrise-aware current event, with a client-side fallback while the
  // deployed API predates the event fields.
  const currentEvent = (
    data?.current_event ??
    (data ? deriveEventCycle(data)?.currentEvent : undefined) ??
    data?.current_prayer ??
    ''
  ).toLowerCase()
  // City-level key: coordinate jitter and refetches of the same city must NOT
  // retrigger the location transition.
  const contentKey = data ? `${data.city}|${data.country_code}` : 'empty'

  // Cached coords keep showing times while a fresh fix (or a denial) resolves;
  // the location states only take over when there is nothing to show yet.
  const showLocationSplash = !data && !isError && locationStatus === 'pending'
  const showLocationPrompt =
    !data && !isLoading && (locationStatus === 'denied' || locationStatus === 'unavailable')

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4">
      <div className="border-border/50 bg-background/55 relative rounded-2xl border p-5 shadow-sm backdrop-blur-md">
        <ZakatBadge />
        {data && (
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="text-muted-foreground hover:text-foreground absolute top-4 right-4 z-10 p-1 transition-colors"
            aria-label="Notification settings"
          >
            <Bell className="size-4" aria-hidden="true" />
          </button>
        )}
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
          <div className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={contentKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
              >
                <PrayerGauge data={data} dataUpdatedAt={dataUpdatedAt} onExpired={refetch} />

                <ul className="divide-border/40 mt-5 divide-y">
                  {PRAYER_EVENT_ORDER.map((key) => {
                    const isSunrise = key === 'sunrise'
                    const isCurrent = currentEvent === key
                    return (
                      <li
                        key={key}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-2 transition-colors',
                          isSunrise ? 'py-2' : 'py-2.5',
                          isCurrent && 'bg-primary/10',
                        )}
                      >
                        <span
                          className={cn(
                            isSunrise
                              ? 'flex items-center gap-2 text-xs'
                              : 'text-sm font-medium',
                            isCurrent
                              ? 'text-primary'
                              : isSunrise
                                ? 'text-muted-foreground'
                                : 'text-foreground',
                          )}
                        >
                          {isSunrise && <Sunrise className="size-3" aria-hidden="true" />}
                          {EVENT_LABELS[key]}
                        </span>
                        <span
                          className={cn(
                            'font-mono tabular-nums',
                            isSunrise ? 'text-xs' : 'text-sm',
                            isCurrent ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {data.times?.[key]}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      <NotificationSettingsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
