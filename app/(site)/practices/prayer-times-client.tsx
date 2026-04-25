'use client'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  CalendarIcon,
  Activity,
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

          {/* Header row - High Priority Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[var(--ed-rule)]/30">
            <div className="flex-1 max-w-sm">
              <form onSubmit={handleSearch} className="relative group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ed-accent)] opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <Input
                  type="search"
                  placeholder={t('searchLocation')}
                  className="pl-9 h-10 bg-[var(--ed-surface)]/40 border-[var(--ed-rule)] rounded-xl focus-visible:ring-0 focus-visible:border-[var(--ed-accent)]/50 transition-all font-mono text-[11px] tracking-wider"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="flex items-center gap-2 mt-2 px-1">
                <MapPinIcon size={10} className="text-[var(--ed-accent)] opacity-40" />
                <span className="font-mono text-[9px] text-[var(--ed-fg-muted)] uppercase tracking-widest">{data.location_string}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Label htmlFor="asr-method" className="text-[9px] text-[var(--ed-fg-muted)] opacity-50 font-mono uppercase tracking-[0.2em] cursor-pointer">
                  {t('asrMidpoint')}
                </Label>
                <Switch
                  id="asr-method"
                  checked={asrAdjustment}
                  onCheckedChange={toggleAsrAdjustment}
                  className="scale-75 origin-right"
                />
              </div>
            </div>
          </div>

          {/* Now / Next hero card */}
          {(data.current_prayer || data.upcoming_prayer) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px rounded-[24px] border border-[var(--ed-rule)] bg-[var(--ed-rule)]/10 overflow-hidden shadow-2xl">
              {data.current_prayer && (
                <div className="relative p-6 bg-[var(--ed-surface)]/60 backdrop-blur-md group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Activity size={80} />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)] animate-pulse" />
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--ed-accent)]">
                        {t('activeState')}
                      </p>
                    </div>
                    <p className="text-3xl md:text-4xl font-serif font-medium text-[var(--ed-fg)] capitalize">
                      {prayerLabels[data.current_prayer.toLowerCase()] ?? data.current_prayer}
                    </p>
                    {data.current_prayer_time_elapsed && (
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--ed-fg-muted)] opacity-50">
                        <span>{t('elapsedLabel')}</span>
                        <span className="text-[var(--ed-fg)]">{data.current_prayer_time_elapsed}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {data.upcoming_prayer && (
                <div className="relative p-6 bg-[var(--ed-surface)]/80 backdrop-blur-md overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--ed-fg-muted)] opacity-40">
                      {t('sequentialEvent')}
                    </p>
                    <p className="text-xl md:text-2xl font-serif font-medium text-[var(--ed-fg)] capitalize">
                      {prayerLabels[data.upcoming_prayer.toLowerCase()] ?? data.upcoming_prayer}
                    </p>
                    {data.upcoming_prayer_time_left && (
                      <div className="flex flex-col gap-1">
                        <div className="font-mono text-[10px] text-[var(--ed-fg-muted)] opacity-40 uppercase tracking-widest">
                          {t('tMinus')}
                        </div>
                        <p className="text-4xl font-mono font-bold text-[var(--ed-accent)] tracking-tighter tabular-nums drop-shadow-[0_0_15px_var(--ed-accent-soft)]">
                          {data.upcoming_prayer_time_left}
                        </p>
                      </div>
                    )}
                  </div>
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
          {t('viewSchedule')}
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
              <TabsTrigger value="today">{t('today')}</TabsTrigger>
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
    <div className="relative pt-6 pb-20 px-4">
      <div className="relative h-[2px] bg-[var(--ed-rule)]/30">
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full bg-[var(--ed-accent)]/20 shadow-[0_0_10px_var(--ed-accent-soft)]"
          style={{ width: `${progressPct}%` }}
        />

        {/* Current position dot */}
        {nowMin >= fajrMin && nowMin <= ishaMin && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--ed-accent)] border-2 border-[var(--ed-bg)] z-10"
            style={{ left: `${progressPct}%` }}
          >
             <div className="absolute inset-0 animate-ping bg-[var(--ed-accent)] opacity-20" />
          </div>
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
                  'w-2 h-2 border border-[var(--ed-surface)] shadow-sm transition-all duration-500',
                  isCurrent
                    ? 'bg-[var(--ed-accent)] scale-125'
                    : isPast
                      ? 'bg-[var(--ed-accent)] opacity-40'
                      : 'bg-[var(--ed-rule)]'
                )}
              />
              <div className="absolute top-5 -translate-x-1/2 left-1/2 flex flex-col items-center gap-1 w-20">
                <span
                  className={cn(
                    'font-mono text-[8px] uppercase tracking-[0.15em] transition-colors',
                    isCurrent ? 'text-[var(--ed-accent)] font-bold' : 'text-[var(--ed-fg-muted)] opacity-30'
                  )}
                >
                  {prayerLabels[prayer]}
                </span>
                <span className={cn(
                  'font-mono text-[9px] tabular-nums',
                  isCurrent ? 'text-[var(--ed-fg)] font-medium' : 'text-[var(--ed-fg-muted)] opacity-20'
                )}>
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
