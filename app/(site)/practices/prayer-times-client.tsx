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
  SearchIcon,
  MapPinIcon,
  ClockIcon,
  AlertCircleIcon,
  ChevronRight,
  InfoIcon,
  ShareIcon,
} from 'lucide-react'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import Link from 'next/link'
import { FaApple } from 'react-icons/fa'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function PrayerTimesClient() {
  return (
    <Suspense
      fallback={
        <div className="text-center opacity-20 py-8">
          <ClockIcon className="size-8 mx-auto animate-spin" />
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
    () => initialQuery || (typeof window !== 'undefined' ? (localStorage.getItem('pt_location') ?? '') : '')
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
        const url = `https://practices.wikisubmission.org/practices/${encodeURIComponent(location)}?${params.toString()}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(t('locationNotFound'))
        }
        const result: PrayerTimesResponse = await response.json()
        setData(result)

        // Persist location so it auto-fills on next visit
        if (result.location_string) {
          localStorage.setItem('pt_location', result.location_string)
        }

        // Update URL purely for browser navigation/sharing without triggering re-render
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
    []
  )

  useEffect(() => {
    const location = initialQuery || localStorage.getItem('pt_location') || ''
    if (location) {
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
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(t('urlCopied'))
      })
      .catch(() => {
        toast.error(t('failedToCopy'))
      })
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
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Search Section */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="w-full relative group">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder={t('searchLocation')}
            className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center justify-end space-x-2 px-1 -mt-2">
          <div className="flex items-center gap-1.5">
            <Label
              htmlFor="asr-method"
              className="text-[10px] text-muted-foreground font-light cursor-pointer"
            >
              {t('asrMidpoint')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center">
                {t('asrMidpointTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="asr-method"
            checked={asrAdjustment}
            onCheckedChange={toggleAsrAdjustment}
            className="scale-75 origin-right"
          />
        </div>
      </div>

      {loading && (
        <div className="space-y-4 pt-8">
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive py-8 justify-center">
          <AlertCircleIcon className="size-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {data && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <header className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-3.5" />
              <span className="text-sm font-medium">
                {data.location_string}
              </span>
            </div>
            <h2 className="text-lg font-semibold">{data.status_string}</h2>
          </header>

          <SunArc data={data} prayerLabels={prayerLabels} />

          {/* Next prayer banner */}
          {data.upcoming_prayer && data.upcoming_prayer_time_left && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="size-3.5 text-primary" />
                <span className="text-muted-foreground">{t('upcomingPrayer')}:</span>
                <span className="font-semibold text-primary capitalize">
                  {prayerLabels[data.upcoming_prayer.toLowerCase()] ?? data.upcoming_prayer}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-primary tabular-nums">
                {data.upcoming_prayer_time_left}
              </span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground uppercase tracking-widest text-[10px]">
                  <th className="py-3 px-4 text-left font-medium">
                    {t('tablePrayer')}
                  </th>
                  <th className="py-3 px-4 text-right font-medium">
                    {t('tableTime')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {prayerOrder.map((prayer) => {
                  const isCurrent = data.current_prayer.toLowerCase() === prayer
                  const isUpcoming =
                    data.upcoming_prayer.toLowerCase() === prayer
                  const timeLeft =
                    data.times_left[prayer as keyof typeof data.times_left]
                  const isUrgent = timeLeft && !timeLeft.includes('h')

                  return (
                    <tr
                      key={prayer}
                      className={cn(
                        'transition-colors',
                        isCurrent ? 'bg-violet-500/10' : 'hover:bg-muted/30'
                      )}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <ClockIcon className="size-3.5 text-violet-600 animate-pulse flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              'font-medium',
                              isCurrent ? 'text-violet-600' : 'text-foreground'
                            )}
                          >
                            {prayerLabels[prayer]}
                          </span>
                          {isUpcoming && timeLeft && (
                            <span
                              className={cn(
                                'text-[10px] normal-case leading-none mt-0.5',
                                isUrgent
                                  ? 'text-red-600 font-bold animate-pulse'
                                  : 'text-muted-foreground font-light'
                              )}
                            >
                              {t('inTimeLeft', { timeLeft })}
                            </span>
                          )}
                          {isCurrent && data.current_prayer_time_elapsed && (
                            <span className="text-[10px] normal-case leading-none mt-0.5 text-violet-600 font-light">
                              {t('timeElapsed', {
                                elapsed: data.current_prayer_time_elapsed,
                              })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={cn(
                            'font-mono tabular-nums',
                            isCurrent
                              ? 'font-bold text-violet-600'
                              : 'text-foreground'
                          )}
                        >
                          {data.times[prayer as keyof typeof data.times]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <section className="flex flex-col">
            <Item asChild variant="outline">
              <Link
                href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ItemContent>
                  <ItemTitle>{t('iosApp')}</ItemTitle>
                  <ItemDescription>{t('iosAppDesc')}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <FaApple className="size-8" />
                  <ChevronRight className="size-4" />
                </ItemActions>
              </Link>
            </Item>
          </section>

          <footer className="flex flex-col items-center gap-2 text-[10px] text-muted-foreground justify-center uppercase tracking-widest pt-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-violet-600 hover:text-violet-500 transition-colors cursor-pointer focus:outline-none"
            >
              <ShareIcon className="size-3" />
              <p>{t('sharePage').toUpperCase()}</p>
            </button>
            <span>{`${data.coordinates.latitude}°N, ${data.coordinates.longitude}°E`}</span>
            <span>{data.local_timezone}</span>
          </footer>

          <hr />

          {data.schedule && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  {t('monthlySchedule')}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {t('next30Days').toUpperCase()}
                </p>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 pb-4">
                <table className="w-full text-[10px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground uppercase tracking-wider">
                      <th className="py-2 text-left font-medium">
                        {t('tableDate')}
                      </th>
                      <th className="py-2 text-center font-medium">
                        {t('fajr')}
                      </th>
                      <th className="py-2 text-center font-medium">
                        {t('sunrise')}
                      </th>
                      <th className="py-2 text-center font-medium">
                        {t('noon')}
                      </th>
                      <th className="py-2 text-center font-medium">
                        {t('asr')}
                      </th>
                      <th className="py-2 text-center font-medium">
                        {t('maghrib')}
                      </th>
                      <th className="py-2 text-center font-medium">
                        {t('isha')}
                      </th>
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
                            isToday && 'bg-violet-600/10 dark:bg-violet-400/10'
                          )}
                        >
                          <td className="py-2.5 pr-4 whitespace-nowrap px-2 relative">
                            {isToday && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" />
                            )}
                            <div className="flex flex-col ml-1">
                              <span
                                className={cn(
                                  'font-semibold',
                                  isToday && 'text-violet-600'
                                )}
                              >
                                {day.day.split(',')[0]}
                              </span>
                              <span className="text-muted-foreground/60">
                                {day.day.split(',')[1]}
                              </span>
                            </div>
                          </td>
                          <td
                            className={cn(
                              'py-2.5 text-center font-mono tabular-nums transition-colors',
                              isToday
                                ? 'text-violet-600 font-medium'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {stripAmPm(day.times.fajr)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 text-center font-mono tabular-nums transition-colors',
                              isToday
                                ? 'text-violet-600 font-medium'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {stripAmPm(day.times.sunrise)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 text-center font-mono tabular-nums transition-colors',
                              isToday
                                ? 'text-violet-600 font-medium'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {stripAmPm(day.times.dhuhr)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 text-center font-mono tabular-nums transition-colors',
                              isToday
                                ? 'text-violet-600 font-medium'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {stripAmPm(day.times.asr)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 text-center font-mono tabular-nums transition-colors',
                              isToday
                                ? 'text-violet-600 font-medium'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {stripAmPm(day.times.maghrib)}
                          </td>
                          <td
                            className={cn(
                              'py-2.5 text-center font-mono tabular-nums transition-colors',
                              isToday
                                ? 'text-violet-600 font-medium'
                                : 'text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            {stripAmPm(day.times.isha)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sun Arc SVG visualization ────────────────────────────────────────────────
function parseTimeToMinutes(timeStr: string): number {
  // Handles "6:12 AM", "12:30 PM", "18:45" formats
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

function arcPoint(t: number, cx: number, cy: number, r: number): [number, number] {
  // t=0 → left (180°), t=1 → right (0°), peak at t=0.5 → top (90°)
  const angle = Math.PI - t * Math.PI
  return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)]
}

function SunArc({
  data,
  prayerLabels,
}: {
  data: PrayerTimesResponse
  prayerLabels: Record<string, string>
}) {
  const cx = 150, cy = 140, r = 110
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
  const times = prayers.map((p) => parseTimeToMinutes(data.times[p]))
  const fajrMin = times[0], ishaMin = times[4]
  const span = ishaMin - fajrMin || 1

  const nowMin = (() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })()

  const toT = (min: number) => Math.max(0, Math.min(1, (min - fajrMin) / span))
  const sunT = toT(nowMin)
  const [sx, sy] = arcPoint(sunT, cx, cy, r)

  const currentPrayer = data.current_prayer.toLowerCase()

  return (
    <div className="w-full py-2">
      <svg viewBox="0 0 300 160" className="w-full max-w-sm mx-auto overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border/40"
        />
        {/* Progress arc (Fajr → now) */}
        {sunT > 0 && sunT <= 1 && (() => {
          const [ex, ey] = arcPoint(sunT, cx, cy, r)
          const largeArc = sunT > 0.5 ? 1 : 0
          return (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary/60"
            />
          )
        })()}

        {/* Prayer tick marks + labels */}
        {prayers.map((prayer, i) => {
          const t = toT(times[i])
          const [px, py] = arcPoint(t, cx, cy, r)
          const isPast = nowMin > times[i]
          const isCurrent = currentPrayer === prayer
          const tickLen = 6
          // Outward normal direction from arc center
          const nx = (px - cx) / r, ny = (py - cy) / r
          return (
            <g key={prayer}>
              <line
                x1={px - nx * tickLen / 2}
                y1={py - ny * tickLen / 2}
                x2={px + nx * tickLen / 2}
                y2={py + ny * tickLen / 2}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                stroke="currentColor"
                className={isCurrent ? 'text-primary' : isPast ? 'text-muted-foreground/40' : 'text-muted-foreground/70'}
              />
              {/* Label: prayer name */}
              <text
                x={px + nx * 14}
                y={py + ny * 14 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="currentColor"
                className={isCurrent ? 'text-primary font-bold' : isPast ? 'text-muted-foreground/50' : 'text-muted-foreground'}
              >
                {prayerLabels[prayer] ?? prayer}
              </text>
            </g>
          )
        })}

        {/* Sun dot */}
        {nowMin >= fajrMin && nowMin <= ishaMin && (
          <circle
            cx={sx}
            cy={sy}
            r="6"
            fill="currentColor"
            className="text-primary"
          />
        )}
      </svg>
    </div>
  )
}

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
  coordinates: {
    latitude: number
    longitude: number
  }
  times: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    sunrise: string
    sunset: string
  }
  times_in_utc: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    sunrise: string
    sunset: string
  }
  times_left: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    sunrise: string
    sunset: string
  }
  current_prayer: string
  upcoming_prayer: string
  current_prayer_time_elapsed: string
  upcoming_prayer_time_left: string
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
