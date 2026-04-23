'use client'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  SearchIcon,
  MapPinIcon,
  AlertCircleIcon,
  InfoIcon,
  XIcon,
  CalendarIcon,
} from 'lucide-react'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-28" />
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
  const [showChangeForm, setShowChangeForm] = useState(false)
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
        const url = `https://practices.wikisubmission.org/prayer-times/${encodeURIComponent(location)}?${params.toString()}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(t('locationNotFound'))
        }
        const result: PrayerTimesResponse = await response.json()
        setData(result)
        setShowChangeForm(false)

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
        setError(err instanceof Error ? err.message : 'An error occurred')
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
      router.push(`/practices?${params.toString()}`)
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
  const prayerLabels: Record<string, string> = {
    fajr: t('fajr'),
    dhuhr: t('noon'),
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
          <p className="text-sm text-muted-foreground">
            Select a city or search for your location
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURED_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSearchQuery(city)
                  fetchPrayerTimes(city, asrAdjustment)
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors cursor-pointer"
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
          <Skeleton className="h-20 w-full rounded-2xl" />
          {/* day timeline */}
          <Skeleton className="h-16 w-full" />
          {/* schedule button */}
          <Skeleton className="h-4 w-28" />
        </div>
      )}

      {/* ── Data loaded ───────────────────────────────────────────────────── */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

          {/* Location header + Asr toggle + Change */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span className="font-medium truncate">{data.location_string}</span>
            </div>

            <div className="flex-1" />

            {/* Asr toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Label
                htmlFor="asr-method"
                className="text-[10px] text-muted-foreground font-light cursor-pointer whitespace-nowrap"
              >
                {t('asrMidpoint')}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-50 text-center">
                  {t('asrMidpointTooltip')}
                </TooltipContent>
              </Tooltip>
              <Switch
                id="asr-method"
                checked={asrAdjustment}
                onCheckedChange={toggleAsrAdjustment}
                className="scale-75 origin-right"
              />
            </div>

            {/* Change location */}
            {showChangeForm ? (
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/60" />
                  <Input
                    autoFocus
                    type="search"
                    placeholder="New location…"
                    className="pl-6 h-7 text-xs bg-muted/50 border-border/40 w-36"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangeForm(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="size-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowChangeForm(true)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors shrink-0"
              >
                Change
              </button>
            )}
          </div>

          {/* Now / Next hero card */}
          {(data.current_prayer || data.upcoming_prayer) && (
            <div className="grid grid-cols-2 divide-x divide-border/40 rounded-2xl border border-border/40 bg-card/50 overflow-hidden">
              {data.current_prayer && (
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Now
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {prayerLabels[data.current_prayer.toLowerCase()] ??
                      data.current_prayer}
                  </p>
                  {data.current_prayer_time_elapsed && (
                    <p className="text-xs text-muted-foreground">
                      {data.current_prayer_time_elapsed} elapsed
                    </p>
                  )}
                </div>
              )}
              {data.upcoming_prayer && (
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Next
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {prayerLabels[data.upcoming_prayer.toLowerCase()] ??
                      data.upcoming_prayer}
                  </p>
                  {data.upcoming_prayer_time_left && (
                    <p className="text-lg font-mono font-bold text-primary tabular-nums">
                      {data.upcoming_prayer_time_left}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Day progress timeline */}
          {data.times && (
            <DayTimeline data={data} prayerLabels={prayerLabels} />
          )}

          {/* Schedule dialog */}
          <ScheduleDialog
            data={data}
            prayerOrder={prayerOrder}
            prayerLabels={prayerLabels}
            t={t}
          />
        </div>
      )}
    </div>
  )
}

// ── Schedule Dialog ───────────────────────────────────────────────────────────

function ScheduleDialog({
  data,
  prayerOrder,
  prayerLabels,
  t,
}: {
  data: PrayerTimesResponse
  prayerOrder: string[]
  prayerLabels: Record<string, string>
  t: (key: string, values?: Record<string, string>) => string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors w-fit">
          <CalendarIcon className="size-3.5" />
          View Schedule
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <MapPinIcon className="size-3.5 text-muted-foreground" />
            {data.location_string}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="today" className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-3 border-b border-border/40">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="month">{t('monthlySchedule')}</TabsTrigger>
            </TabsList>
          </div>

          {/* Today tab */}
          <TabsContent value="today" className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <div className="overflow-hidden rounded-xl border border-border/40">
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
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                            )}
                            <span
                              className={cn(
                                'font-medium',
                                isCurrent ? 'text-primary' : 'text-foreground'
                              )}
                            >
                              {prayerLabels[prayer]}
                            </span>
                            {isUpcoming && timeLeft && (
                              <span
                                className={cn(
                                  'text-[10px] normal-case leading-none mt-0.5',
                                  isUrgent
                                    ? 'text-destructive font-bold animate-pulse'
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
                              'font-mono tabular-nums',
                              isCurrent
                                ? 'font-bold text-primary'
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
            <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground/40 uppercase tracking-widest pt-2 border-t border-border/20">
              {data.coordinates && (
                <span>{`${data.coordinates.latitude.toFixed(4)}°N, ${data.coordinates.longitude.toFixed(4)}°E`}</span>
              )}
              <span>{data.local_timezone}</span>
            </div>
          </TabsContent>

          {/* Month tab */}
          <TabsContent value="month" className="overflow-y-auto flex-1 px-6 py-5">
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
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
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
                                'py-2.5 text-center font-mono tabular-nums transition-colors',
                                isToday
                                  ? 'text-primary font-medium'
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
      </DialogContent>
    </Dialog>
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
  prayerLabels,
}: {
  data: PrayerTimesResponse
  prayerLabels: Record<string, string>
}) {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
  const times = prayers.map((p) => parseTimeToMinutes(data.times?.[p] ?? ''))
  const [fajrMin, , , , ishaMin] = times
  const span = ishaMin - fajrMin || 1

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const progressPct = Math.max(0, Math.min(100, ((nowMin - fajrMin) / span) * 100))
  const currentPrayer = data.current_prayer?.toLowerCase() ?? ''

  return (
    <div className="relative pt-2 pb-14 px-3">
      <div className="relative h-1.5 rounded-full bg-border/40">
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary/40"
          style={{ width: `${progressPct}%` }}
        />

        {/* Current position dot */}
        {nowMin >= fajrMin && nowMin <= ishaMin && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-background shadow-sm z-10"
            style={{ left: `${progressPct}%` }}
          />
        )}

        {/* Prayer markers */}
        {prayers.map((prayer, i) => {
          const pct = ((times[i] - fajrMin) / span) * 100
          const isCurrent = currentPrayer === prayer
          const isPast = nowMin > times[i]
          return (
            <div
              key={prayer}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full border-2 border-background',
                  isCurrent
                    ? 'bg-primary scale-150'
                    : isPast
                      ? 'bg-primary/50'
                      : 'bg-border'
                )}
              />
              <div className="absolute top-4 -translate-x-1/2 left-1/2 flex flex-col items-center gap-0.5 w-[52px]">
                <span
                  className={cn(
                    'text-[9px] font-semibold uppercase tracking-wide text-center whitespace-nowrap',
                    isCurrent ? 'text-primary' : 'text-muted-foreground/60'
                  )}
                >
                  {prayerLabels[prayer]}
                </span>
                <span className="text-[9px] text-muted-foreground/40 font-mono tabular-nums whitespace-nowrap">
                  {data.times?.[prayer]}
                </span>
              </div>
            </div>
          )
        })}
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
