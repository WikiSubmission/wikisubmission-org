'use client'

import { MapPin, RefreshCw } from 'lucide-react'
import { PRAYER_ORDER, type PrayerKey, type PrayerTimesResponse } from '@/lib/prayer-times'
import { usePrayerTimes } from '@/hooks/use-prayer-times'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'
import { LocationPicker } from '@/components/today/location-picker'

const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

function parseDurationToSeconds(text: string): number {
  let total = 0
  const h = /(\d+)\s*h/.exec(text)
  const m = /(\d+)\s*m/.exec(text)
  const s = /(\d+)\s*s/.exec(text)
  if (h) total += Number(h[1]) * 3600
  if (m) total += Number(m[1]) * 60
  if (s) total += Number(s[1])
  return total
}

function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`
  if (m > 0) return `${m}m ${pad(s)}s`
  return `${s}s`
}

function NextPrayer({ data, dataUpdatedAt }: { data: PrayerTimesResponse; dataUpdatedAt: number }) {
  const now = useNow()

  // The server reports time-left in the city's timezone at fetch time; subtract
  // the seconds elapsed since that fetch to tick down without timezone math.
  const seedSeconds = data.upcoming_prayer_time_left
    ? parseDurationToSeconds(data.upcoming_prayer_time_left)
    : null
  const elapsed = dataUpdatedAt > 0 ? Math.floor((now - dataUpdatedAt) / 1000) : 0
  const remaining = seedSeconds === null ? null : Math.max(0, seedSeconds - elapsed)

  if (!data.upcoming_prayer) return null

  return (
    <div className="text-center">
      <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Next prayer</p>
      <p className="font-display mt-1 text-3xl">{data.upcoming_prayer}</p>
      {remaining !== null ? (
        <p className="text-primary mt-1 font-mono text-sm tabular-nums">
          in {formatRemaining(remaining)}
        </p>
      ) : null}
    </div>
  )
}

export function PrayerSchedule() {
  const { data, isLoading, isError, error, dataUpdatedAt, location, setLocation, refetch } =
    usePrayerTimes()
  const currentPrayer = data?.current_prayer?.toLowerCase() ?? ''

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4">
      <LocationPicker
        current={data ? `${data.city}, ${data.country_code}` : location}
        onSelect={setLocation}
      />

      <div className="border-border/50 bg-background/55 rounded-2xl border p-5 shadow-sm backdrop-blur-md">
        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Loading prayer times…</p>
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
            <NextPrayer data={data} dataUpdatedAt={dataUpdatedAt} />

            <ul className="divide-border/40 mt-5 divide-y">
              {data.times?.sunrise ? (
                <li className="text-muted-foreground flex items-center justify-between py-2 text-xs">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-3" aria-hidden="true" />
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
