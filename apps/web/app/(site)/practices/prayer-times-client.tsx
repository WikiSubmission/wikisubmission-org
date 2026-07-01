'use client'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  SearchIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { F } from '../_sections/shared'


const FEATURED_CITIES = [
  'Mecca',
  'Medina',
  'Cairo',
  'Istanbul',
  'London',
  'New York',
  'Algiers',
  'Jakarta',
]

export default function PrayerTimesClient() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-2/5 rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-4 w-28 rounded-none" />
        </div>
      }
    >
      <PrayerTimesContent />
    </Suspense>
  )
}

function PrayerTimesContent() {
  const t = useTranslations('prayertimes')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const asrAdjustment = searchParams.get('asr_adjustment') === 'true'

  const [searchQuery, setSearchQuery] = useState(
    () =>
      initialQuery ||
      (typeof window !== 'undefined'
        ? (localStorage.getItem('pt_location') ?? '')
        : '')
  )
  const [data, setData] = useState<PrayerTimesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrayerTimes = useCallback(
    async (location: string, adjustment: boolean) => {
      if (!location) {
        setData(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (adjustment) params.set('asr_adjustment', 'true')
        params.set('include_schedule', 'true')
        const url = `/api/practices/prayer-times/${encodeURIComponent(location)}?${params.toString()}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(t('locationNotFound'))
        }
        const result: PrayerTimesResponse = await response.json()
        setData(result)
        if (result.location_string) {
          localStorage.setItem('pt_location', result.location_string)
        }

        if (result.location_string) {
          const currentParams = new URLSearchParams(window.location.search)
          if (currentParams.get('q') !== result.location_string) {
            currentParams.set('q', result.location_string)
            const newPath = `${window.location.pathname}?${currentParams.toString()}`
            window.history.replaceState(null, '', newPath)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('genericError'))
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  useEffect(() => {
    const location = initialQuery || localStorage.getItem('pt_location') || ''
    if (location) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPrayerTimes(location, asrAdjustment)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', trimmed)
      router.push(`/practices?${params.toString()}`, { scroll: false })
      fetchPrayerTimes(trimmed, asrAdjustment)
    }
  }

  const toggleAsrAdjustment = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.set('asr_adjustment', 'true')
    } else {
      params.delete('asr_adjustment')
    }
    router.replace(`/practices?${params.toString()}`, { scroll: false })
    if (data?.location_string) {
      fetchPrayerTimes(data.location_string, checked)
    }
  }

  const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  const prayerDisplayNames: Record<string, string> = {
    fajr: t('dawnLabel'),
    dhuhr: t('noonLabel'),
    asr: t('afternoonLabel'),
    maghrib: t('sunsetLabel'),
    isha: t('nightLabel'),
  }
  const prayerArabic: Record<string, string> = {
    fajr: t('fajr'),
    dhuhr: t('dhuhr'),
    asr: t('asr'),
    maghrib: t('maghrib'),
    isha: t('isha'),
  }

  return (
    <div className="w-full space-y-8">
      {/* ── Default / empty state ─────────────────────────────────────────── */}
      {!data && !loading && (
        <div className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-4 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          <p 
            className="text-sm text-muted-foreground"
            style={{ fontFamily: F.serif }}
          >
            {t('selectLocationPrompt')}
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURED_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSearchQuery(city)
                  fetchPrayerTimes(city, asrAdjustment)
                }}
                className="px-3 py-1.5 text-xs font-medium bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors cursor-pointer"
                style={{ fontFamily: F.glacial }}
              >
                {city}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
            <Input
              type="search"
              placeholder={t('searchLocation')}
              className="pl-8 h-10 bg-muted/50 border-border/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-6">
          {/* location row */}
          <Skeleton className="h-8 w-2/5" />
          {/* now / next card */}
          <Skeleton className="h-20 w-full" />
          {/* day timeline */}
          <Skeleton className="h-16 w-full" />
          {/* schedule button */}
          <Skeleton className="h-4 w-28" />
        </div>
      )}

      {/* ── Data loaded ───────────────────────────────────────────────────── */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

          {/* Search + ASR toggle (one cohesive control row) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <form onSubmit={handleSearch} className="relative group flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ed-accent)] opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <Input
                type="search"
                placeholder={t('searchLocation')}
                className="pl-9 pr-3 h-11 bg-[var(--ed-surface)]/40 border-[var(--ed-rule)] focus-visible:ring-0 focus-visible:border-[var(--ed-accent)]/50 transition-all font-[family-name:var(--font-jetbrains)] text-[12px] tracking-wider"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex items-center gap-2.5 sm:pl-1 shrink-0">
              <Switch
                id="asr-method"
                checked={asrAdjustment}
                onCheckedChange={toggleAsrAdjustment}
                className="scale-75 origin-left"
              />
              <Label
                htmlFor="asr-method"
                className="text-[10px] text-[var(--ed-fg-muted)] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.18em] cursor-pointer"
              >
                {t('asrMidpoint')}
              </Label>
            </div>
          </div>

          {/* Resolved location + the API's reported local time (so the
              displayed prayer times have an unambiguous reference clock). */}
          {data.location_string && (
            <div
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.glacial }}
            >
              <span className="opacity-70">{data.location_string}</span>
              {data.local_time && (
                <span className="opacity-50">
                  <span aria-hidden className="mr-2">·</span>
                  <span className="tabular-nums">{data.local_time}</span>
                  {data.local_timezone && (
                    <span className="ml-1.5 opacity-70">{data.local_timezone}</span>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Now / Next — primary headline */}
          {(data.current_prayer || data.upcoming_prayer) && (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 -mt-2">
              {data.current_prayer && (
                <span
                  className="text-3xl md:text-4xl font-medium text-[var(--ed-accent)] capitalize tracking-tight leading-none"
                  style={{ fontFamily: F.serif }}
                >
                  {prayerDisplayNames[data.current_prayer.toLowerCase()] ?? data.current_prayer}
                </span>
              )}
              {data.upcoming_prayer && data.upcoming_prayer_time_left && (
                <span
                  className="text-base md:text-lg text-[var(--ed-fg-muted)] tabular-nums leading-none whitespace-nowrap"
                  style={{ fontFamily: F.serif }}
                >
                  <span className="opacity-60 mx-1">→</span>
                  <span className="capitalize text-[var(--ed-fg)]"> {prayerDisplayNames[data.upcoming_prayer.toLowerCase()] ?? data.upcoming_prayer}</span>
                  <span className="font-[family-name:var(--font-jetbrains)] text-[var(--ed-accent)]"> {data.upcoming_prayer_time_left}</span>
                </span>
              )}
            </div>
          )}

          {/* Day progress timeline */}
          {data.times && (
            <DayTimeline data={data} prayerDisplayNames={prayerDisplayNames} />
          )}

          {/* Inline schedule (today + monthly) */}
          <div className="space-y-2">
            <SchedulePanel
              data={data}
              prayerOrder={prayerOrder}
              prayerDisplayNames={prayerDisplayNames}
              t={t}
            />
            {/* English → Arabic name mapping, right under the card */}
            <div
              className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-[10px] text-[var(--ed-fg-muted)] opacity-80 leading-relaxed"
              style={{ fontFamily: F.glacial }}
            >
              {prayerOrder.map((prayer) => (
                <span key={prayer}>
                  <span className="text-[var(--ed-fg)]/80">{prayerDisplayNames[prayer]}</span>
                  <span className="opacity-60"> · {prayerArabic[prayer]}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Footnotes — supplementary metadata pulled from the API response */}
          <dl
            className="!mt-1.5 pt-3 border-t border-[var(--ed-rule)]/30 text-[10px] text-[var(--ed-fg-muted)] opacity-80 leading-relaxed space-y-1.5"
            style={{ fontFamily: F.glacial }}
          >
            {(data.times?.sunrise || data.times?.sunset) && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="uppercase tracking-[0.18em] shrink-0">{t('daylightLabel')}</dt>
                <dd className="inline-flex flex-wrap gap-x-3 gap-y-1 tabular-nums">
                  {data.times?.sunrise && (
                    <span>
                      <span className="text-[var(--ed-fg)]/80">{t('sunrise')}</span>
                      <span className="opacity-60"> · {data.times.sunrise}</span>
                    </span>
                  )}
                  {data.times?.sunset && (
                    <span>
                      <span className="text-[var(--ed-fg)]/80">{t('sunsetLabel')}</span>
                      <span className="opacity-60"> · {data.times.sunset}</span>
                    </span>
                  )}
                </dd>
              </div>
            )}
            {data.coordinates && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="uppercase tracking-[0.18em] shrink-0">{t('coordinatesLabel')}</dt>
                <dd className="tabular-nums text-[var(--ed-fg)]/80">
                  {`${data.coordinates.latitude.toFixed(4)}°N, ${data.coordinates.longitude.toFixed(4)}°E`}
                </dd>
              </div>
            )}
            {data.local_timezone_id && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="uppercase tracking-[0.18em] shrink-0">{t('timezoneLabel')}</dt>
                <dd className="text-[var(--ed-fg)]/80">{data.local_timezone_id}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}

// ── Schedule Panel (inline, expanded by default) ─────────────────────────────

function SchedulePanel({
  data,
  prayerOrder,
  prayerDisplayNames,
  t,
}: {
  data: PrayerTimesResponse
  prayerOrder: string[]
  prayerDisplayNames: Record<string, string>
  t: (key: string, values?: Record<string, string>) => string
}) {
  return (
    <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 overflow-hidden">
      <Tabs defaultValue="today" className="flex flex-col gap-0">
          <div className="px-5 py-3 border-b border-border/40">
            <TabsList>
              <TabsTrigger value="today">{t('today')}</TabsTrigger>
              <TabsTrigger value="month">{t('monthlySchedule')}</TabsTrigger>
            </TabsList>
          </div>

          {/* Today tab */}
          <TabsContent value="today" className="px-5 py-5 space-y-4">
            <div className="overflow-hidden border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground uppercase tracking-widest text-[10px]">
                    <th className="py-2.5 px-4 text-left font-medium">
                      {t('tablePrayer')}
                    </th>
                    <th className="py-2.5 px-4 text-right font-medium">
                      {t('tableTime')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {prayerOrder.map((prayer) => {
                    const isCurrent =
                      data.current_prayer?.toLowerCase() === prayer
                    const isUpcoming =
                      data.upcoming_prayer?.toLowerCase() === prayer
                    const timeLeft =
                      data.times_left?.[
                        prayer as keyof typeof data.times_left
                      ]
                    const isUrgent = timeLeft && !timeLeft.includes('h')

                    return (
                      <tr
                        key={prayer}
                        className={cn(
                          'transition-colors',
                          isCurrent ? 'bg-primary/8' : 'hover:bg-muted/30'
                        )}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 bg-primary animate-pulse shrink-0" />
                            )}
                            <span
                              className={cn(
                                'font-medium',
                                isCurrent ? 'text-primary' : 'text-foreground'
                              )}
                            >
                              {prayerDisplayNames[prayer]}
                            </span>
                            {isUpcoming && timeLeft && (
                              <span
                                className={cn(
                                  'text-[10px] normal-case leading-none mt-0.5',
                                  isUrgent
                                    ? 'text-destructive font-bold'
                                    : 'text-muted-foreground font-light'
                                )}
                              >
                                {t('inTimeLeft', { timeLeft })}
                              </span>
                            )}
                            {isCurrent && data.current_prayer_time_elapsed && (
                              <span className="text-[10px] normal-case leading-none mt-0.5 text-primary/70 font-light">
                                {t('timeElapsed', {
                                  elapsed: data.current_prayer_time_elapsed,
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={cn(
                              'font-bold uppercase tracking-tight',
                              isCurrent
                                ? 'text-primary'
                                : 'text-foreground'
                            )}
                          >
                            {data.times?.[prayer as keyof typeof data.times]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Month tab */}
          <TabsContent value="month" className="px-5 py-5">
            {data.schedule ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground uppercase tracking-wider">
                      <th className="py-2 text-left font-medium">{t('tableDate')}</th>
                      <th className="py-2 text-center font-medium">{t('fajr')}</th>
                      <th className="py-2 text-center font-medium">{t('sunrise')}</th>
                      <th className="py-2 text-center font-medium">{t('noon')}</th>
                      <th className="py-2 text-center font-medium">{t('asr')}</th>
                      <th className="py-2 text-center font-medium">{t('maghrib')}</th>
                      <th className="py-2 text-center font-medium">{t('isha')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {data.schedule.map((day, index) => {
                      const isToday = index === 0
                      const stripAmPm = (time: string) =>
                        time.replace(/\s?[AP]M/gi, '')
                      return (
                        <tr
                          key={day.date}
                          className={cn(
                            'hover:bg-muted/30 transition-colors group relative',
                            isToday && 'bg-primary/8'
                          )}
                        >
                          <td className="py-2.5 pr-4 whitespace-nowrap px-2 relative">
                            {isToday && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                            )}
                            <div className="flex flex-col ml-1">
                              <span className={cn('font-semibold', isToday && 'text-primary')}>
                                {day.day.split(',')[0]}
                              </span>
                              <span className="text-muted-foreground/60">
                                {day.day.split(',')[1]}
                              </span>
                            </div>
                          </td>
                          {[
                            day.times.fajr,
                            day.times.sunrise,
                            day.times.dhuhr,
                            day.times.asr,
                            day.times.maghrib,
                            day.times.isha,
                          ].map((time, ti) => (
                            <td
                              key={ti}
                              className={cn(
                                'py-2.5 text-center font-glacial font-bold transition-colors',
                                isToday
                                  ? 'text-primary'
                                  : 'text-muted-foreground group-hover:text-foreground'
                              )}
                            >
                              {stripAmPm(time)}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('next30Days')}
              </p>
            )}
          </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Day progress timeline ─────────────────────────────────────────────────────

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.trim()
  const ampm = /([AP]M)/i.exec(clean)
  const parts = clean.replace(/[AP]M/gi, '').trim().split(':')
  let h = parseInt(parts[0], 10)
  const m = parseInt(parts[1] ?? '0', 10)
  if (ampm) {
    if (ampm[1].toUpperCase() === 'PM' && h !== 12) h += 12
    if (ampm[1].toUpperCase() === 'AM' && h === 12) h = 0
  }
  return h * 60 + m
}

function DayTimeline({
  data,
  prayerDisplayNames,
}: {
  data: PrayerTimesResponse
  prayerDisplayNames: Record<string, string>
}) {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
  const times = prayers.map((p) => parseTimeToMinutes(data.times?.[p] ?? ''))
  const [, , , , ishaMin] = times

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const currentPrayer = data.current_prayer?.toLowerCase() ?? ''

  // Map "now" onto the cell grid: locate the current interval, then interpolate
  // within that cell's 20%-wide column. This keeps the progress indicator
  // visually consistent with the highlighted cell — unlike a Fajr→Isha
  // proportional bar, which floats far from whichever cell is "current".
  const currentIdx = prayers.findIndex((p) => p === currentPrayer)
  const intervalProgress = (() => {
    if (currentIdx < 0) return null
    const start = times[currentIdx]
    const end = times[currentIdx + 1] ?? ishaMin
    if (end <= start) return 0
    return Math.max(0, Math.min(1, (nowMin - start) / (end - start)))
  })()
  const cellPct = 100 / prayers.length
  const nowPct =
    intervalProgress === null ? null : currentIdx * cellPct + intervalProgress * cellPct

  return (
    <div className="relative">
      {/* Prayer cells — equal-width columns, current cell is the visual anchor */}
      <div className="grid grid-cols-5 border-y border-[var(--ed-rule)]/40 relative">
        {prayers.map((prayer, i) => {
          const isCurrent = currentPrayer === prayer
          const isPast = nowMin > times[i] && !isCurrent
          return (
            <div
              key={prayer}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-0.5 sm:px-1 border-l first:border-l-0 border-[var(--ed-rule)]/40 transition-colors min-w-0',
                isCurrent && 'bg-[var(--ed-accent)]/8',
                isPast && 'opacity-50'
              )}
            >
              <span
                className={cn(
                  'text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-[0.2em] font-semibold w-full text-center truncate',
                  isCurrent ? 'text-[var(--ed-accent)]' : 'text-[var(--ed-fg-muted)]'
                )}
                style={{ fontFamily: F.glacial }}
              >
                {prayerDisplayNames[prayer]}
              </span>
              <span
                className={cn(
                  'text-[11px] sm:text-[13px] tabular-nums font-semibold whitespace-nowrap',
                  isCurrent ? 'text-[var(--ed-fg)]' : 'text-[var(--ed-fg-muted)]'
                )}
                style={{ fontFamily: F.mono }}
              >
                {data.times?.[prayer]}
              </span>
            </div>
          )
        })}

        {/* Within-interval "now" sweep — sits along the bottom edge of the
            current cell and grows as the interval elapses. Width is one cell;
            the filled portion shows interval progress. */}
        {nowPct !== null && (
          <div
            className="pointer-events-none absolute bottom-0 h-[2px] bg-[var(--ed-rule)]/30"
            style={{ left: `${currentIdx * cellPct}%`, width: `${cellPct}%` }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-[var(--ed-accent)] transition-[width] duration-500"
              style={{ width: `${(intervalProgress ?? 0) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PrayerTimesResponse {
  status_string: string
  location_string: string
  country: string
  country_code: string
  city: string
  region: string
  local_time: string
  local_timezone: string
  local_timezone_id: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  times?: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    sunrise: string
    sunset: string
  }
  times_in_utc?: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    sunrise: string
    sunset: string
  }
  times_left?: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    sunrise: string
    sunset: string
  }
  current_prayer?: string
  upcoming_prayer?: string
  current_prayer_time_elapsed?: string
  upcoming_prayer_time_left?: string
  schedule?: {
    date: string
    day: string
    times: {
      fajr: string
      sunrise: string
      dhuhr: string
      asr: string
      sunset: string
      maghrib: string
      isha: string
    }
  }[]
}
