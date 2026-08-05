'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Bell, LocateFixed, MapPin, RefreshCw, Sunrise } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { gsap } from '@/lib/gsap'
import { NotificationSettingsSheet } from '@/components/today/notification-settings-sheet'
import { ZakatBadge } from '@/components/today/zakat-badge'
import { PRAYER_EVENT_ORDER, deriveEventCycle } from '@/lib/prayer-events'
import { usePrayerTimes } from '@/hooks/use-prayer-times'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { PrayerGauge } from '@/components/today/prayer-gauge'

function LocationSplash() {
  const t = useTranslations('mobile.today')
  return (
    <div className="space-y-3 py-10 text-center">
      <LocateFixed
        className="text-primary mx-auto size-8 animate-pulse"
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm">{t('findingLocation')}</p>
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
  const t = useTranslations('mobile.today')
  const denied = status === 'denied'
  return (
    <div className="space-y-3 py-8 text-center">
      <MapPin className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
      <p className="text-foreground text-sm font-medium">
        {t(denied ? 'locationDeniedTitle' : 'locationUnavailableTitle')}
      </p>
      <p className="text-muted-foreground px-4 text-xs">
        {t(denied ? 'locationDeniedBody' : 'locationUnavailableBody')}
      </p>
      <button
        type="button"
        onClick={onRequest}
        className="text-primary inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
        {t(denied ? 'enableLocation' : 'tryAgain')}
      </button>
    </div>
  )
}

export function PrayerSchedule() {
  const {
    data,
    isLoading,
    isError,
    dataUpdatedAt,
    locationStatus,
    requestLocation,
    refetch,
  } = usePrayerTimes()
  const t = useTranslations('mobile.today')
  // PrayerEventKey values match the prayertimes.* key names one-for-one, so an
  // event key can be translated directly.
  const tEvent = useTranslations('prayertimes')
  const tNotifications = useTranslations('mobile.notifications')
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

  // Location-change transition: slide the fresh city's card in when the
  // content key moves. No animation on first data (prevKey seeds lazily).
  const contentRef = useRef<HTMLDivElement>(null)
  const prevKeyRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    const el = contentRef.current
    const prev = prevKeyRef.current
    prevKeyRef.current = contentKey
    if (!el || prev === null || prev === contentKey || reducedMotion) return
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [contentKey, reducedMotion])

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4">
      <div className="border-border/50 bg-background/55 relative rounded-2xl border p-5 shadow-sm backdrop-blur-md">
        <ZakatBadge />
        {data && (
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="text-muted-foreground hover:text-foreground absolute top-4 end-4 z-10 p-1 transition-colors"
            aria-label={tNotifications('settingsLabel')}
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
            {/* Deliberately not error.message: PrayerTimesError only ever
                carries generic English infrastructure text ("service returned
                502", "timed out"), which is untranslatable and not actionable.
                The specifics stay on the error object for crash reporting. */}
            <p className="text-muted-foreground text-sm">{t('prayerTimesError')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-primary inline-flex items-center gap-1.5 text-sm font-medium"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('tryAgain')}
            </button>
          </div>
        ) : data ? (
          <div className="relative">
            <div ref={contentRef}>
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
                          {tEvent(key)}
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
            </div>
          </div>
        ) : null}
      </div>

      <NotificationSettingsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
