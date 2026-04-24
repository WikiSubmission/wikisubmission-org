'use client'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SearchIcon,
  MapPinIcon,
  AlertCircleIcon,
  ShareIcon,
  MoonIcon,
  CalendarIcon,
  StarIcon,
  Activity,
  Timer
} from 'lucide-react'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

export default function RamadanClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12 opacity-20">
        <div className="w-6 h-6 border border-[var(--ed-fg-muted)] border-t-[var(--ed-accent)] animate-spin" />
      </div>
    }>
      <RamadanContent />
    </Suspense>
  )
}

function RamadanContent() {
  const t = useTranslations('ramadan')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialYear = searchParams.get('year') || new Date().getFullYear().toString()

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [year, setYear] = useState(initialYear)
  const [data, setData] = useState<RamadanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRamadanSchedule = useCallback(async (location: string, year: string) => {
    if (!location) { setData(null); return }
    setLoading(true); setError(null)
    try {
      const url = `https://practices.wikisubmission.org/ramadan/${encodeURIComponent(location)}?year=${year}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(t('locationNotFound'))
      const result: RamadanResponse = await response.json()
      setData(result)
      if (result.location_string) {
        const currentParams = new URLSearchParams(window.location.search)
        if (currentParams.get('q') !== result.location_string) {
          currentParams.set('q', result.location_string)
          currentParams.set('year', result.year)
          window.history.replaceState(null, '', `${window.location.pathname}?${currentParams.toString()}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (initialQuery) fetchRamadanSchedule(initialQuery, initialYear)
  }, [initialQuery, initialYear, fetchRamadanSchedule])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', trimmed)
      params.set('year', year)
      router.push(`/ramadan?${params.toString()}`)
      fetchRamadanSchedule(trimmed, year)
    }
  }

  const handleYearChange = (newYear: string) => {
    setYear(newYear)
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', searchQuery.trim())
      params.set('year', newYear)
      router.push(`/ramadan?${params.toString()}`)
      fetchRamadanSchedule(searchQuery.trim(), newYear)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success(t('urlCopied')))
      .catch(() => toast.error(t('failedToCopy')))
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString())

  return (
    <div className="w-full space-y-12">
      {/* Search HUD */}
      <div className="w-full max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1 group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ed-fg-muted)] opacity-30 group-focus-within:text-[var(--ed-accent)] transition-colors" />
            <Input
              type="search"
              placeholder={t('searchLocation')}
              className="pl-9 h-11 bg-[var(--ed-surface)]/50 border-[var(--ed-rule)] rounded-xl focus-visible:ring-0 focus-visible:border-[var(--ed-accent)]/50 transition-all placeholder:text-[var(--ed-fg-muted)]/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-32">
            <select
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full h-11 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 rounded-xl px-4 text-[11px] appearance-none cursor-pointer uppercase tracking-widest text-[var(--ed-fg-muted)] font-mono focus:outline-none focus:border-[var(--ed-accent)]/50 transition-all"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <CalendarIcon size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ed-fg-muted)] opacity-20" />
          </div>
        </form>
      </div>

      {loading && (
        <div className="space-y-6 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 text-destructive py-12 justify-center bg-destructive/5 rounded-2xl border border-destructive/20">
          <AlertCircleIcon className="size-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {data && !loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-12"
        >
          {/* Status HUD */}
          <header className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--ed-surface)] border border-[var(--ed-rule)]">
              <MapPinIcon size={10} className="text-[var(--ed-accent)]" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--ed-fg-muted)]">{data.location_string}</span>
            </div>
            <h2 className="text-3xl font-serif font-medium text-[var(--ed-fg)]">
              {t('schedule', { year: data.year })}
            </h2>
            <div className="flex items-center gap-3 text-[var(--ed-fg-muted)] opacity-60 text-sm">
              <Activity size={14} className="text-[var(--ed-accent)]" />
              <p>{data.status_string}</p>
            </div>
          </header>

          {/* Summary Grid - Inspiration Port */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--ed-rule)] border border-[var(--ed-rule)] rounded-[24px] overflow-hidden shadow-xl">
            <SummaryCard title={t('firstFastingDay')} value={data.first_fasting_day} icon={<CalendarIcon className="size-4 text-[var(--ed-accent)] opacity-40" />} />
            <SummaryCard title={t('lastFastingDay')} value={data.last_fasting_day} icon={<CalendarIcon className="size-4 text-[var(--ed-fg-muted)] opacity-30" />} />
            <SummaryCard title={t('nightOfDestiny')} value={data.night_of_destiny} icon={<StarIcon className="size-4 text-amber-500/60" />} />
            <SummaryCard title={t('averageFastingDuration')} value={data.average_fasting_duration} icon={<MoonIcon className="size-4 text-blue-400/40" />} />
          </div>

          {/* Schedule Table - Technical Polish */}
          <div className="border border-[var(--ed-rule)] rounded-[24px] overflow-hidden bg-[var(--ed-surface)]/20 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ed-rule)] text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ed-fg-muted)] bg-[var(--ed-surface)]/40">
                    <th className="py-4 px-6 text-left font-medium">{t('tableDay')}</th>
                    <th className="py-4 px-6 text-left font-medium">{t('tableDate')}</th>
                    <th className="py-4 px-6 text-center font-medium text-[var(--ed-accent)]">{t('tableDawn')}</th>
                    <th className="py-4 px-6 text-center font-medium">{t('tableNoon')}</th>
                    <th className="py-4 px-6 text-center font-medium">{t('tableAfternoon')}</th>
                    <th className="py-4 px-6 text-center font-medium text-red-500/70">{t('tableSunset')}</th>
                    <th className="py-4 px-6 text-center font-medium">{t('tableNight')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ed-rule)]/50">
                  {data.schedule.map((day) => (
                    <tr 
                      key={day.day_number} 
                      className={cn(
                        'group transition-colors', 
                        day.day_number === data.current_day ? 'bg-[var(--ed-accent)]/10' : 'hover:bg-[var(--ed-surface)]/30'
                      )}
                    >
                      <td className="py-4 px-6 font-mono text-xs">{day.day_number.toString().padStart(2, '0')}</td>
                      <td className="py-4 px-6 text-[var(--ed-fg-muted)] whitespace-nowrap text-xs opacity-60 group-hover:opacity-100">{day.day}</td>
                      <td className="py-4 px-6 font-mono text-xs text-center text-[var(--ed-accent)] font-bold">{stripAmPm(day.dawn)}</td>
                      <td className="py-4 px-6 font-mono text-xs text-center text-[var(--ed-fg-muted)] opacity-50">{stripAmPm(day.noon)}</td>
                      <td className="py-4 px-6 font-mono text-xs text-center text-[var(--ed-fg-muted)] opacity-50">{stripAmPm(day.afternoon)}</td>
                      <td className="py-4 px-6 font-mono text-xs text-center text-red-500/80 font-bold">{stripAmPm(day.sunset)}</td>
                      <td className="py-4 px-6 font-mono text-xs text-center text-[var(--ed-fg-muted)] opacity-50">{stripAmPm(day.night)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Moon Data - Inspiration Port */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--ed-rule)] border border-[var(--ed-rule)] rounded-[24px] overflow-hidden shadow-lg">
            <MoonDataSection title={t('startMoon')} moon={data.moon_data.start} />
            <MoonDataSection title={t('endMoon')} moon={data.moon_data.end} />
          </div>

          {/* Sharing HUD */}
          <footer className="flex justify-center pt-4">
            <button
              onClick={handleShare}
              className="group flex items-center gap-3 px-6 py-3 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all"
            >
              <ShareIcon size={14} className="text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-accent)] transition-colors" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-fg)]">
                {t('shareSchedule')}
              </span>
            </button>
          </footer>
        </motion.div>
      )}
    </div>
  )
}

const stripAmPm = (time: string) => time.replace(/\s?[AP]M/gi, '')

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--ed-bg)] p-6 space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--ed-fg-muted)] opacity-40">{title}</span>
      </div>
      <div className="text-sm font-medium text-[var(--ed-fg)] font-serif">{value}</div>
    </div>
  )
}

function MoonDataSection({ title, moon }: { title: string; moon: any }) {
  const t = useTranslations('ramadan')
  return (
    <div className="bg-[var(--ed-bg)] p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-4 bg-[var(--ed-accent)] opacity-40" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-[var(--ed-fg-muted)]">{title}</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--ed-fg-muted)] opacity-40 text-xs font-serif italic">{t('newMoonLocal')}</span>
          <span className="font-mono text-xs text-[var(--ed-fg)]">{moon.new_moon_local}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--ed-fg-muted)] opacity-40 text-xs font-serif italic">{t('sunsetLocal')}</span>
          <span className="font-mono text-xs text-[var(--ed-fg)]">{moon.sunset_local}</span>
        </div>
        <div className="pt-4 text-[9px] text-[var(--ed-fg-muted)] opacity-20 font-mono border-t border-[var(--ed-rule)] tracking-wider">
          {t('utcValue', { value: moon.new_moon_utc })}
        </div>
      </div>
    </div>
  )
}

interface RamadanResponse {
  query: string
  year: string
  current_day: number
  status_string: string
  location_string: string
  average_fasting_duration: string
  first_fasting_day: string
  last_fasting_day: string
  night_of_destiny: string
  begin_last_10_nights: string
  moon_data: {
    start: { new_moon_utc: string; new_moon_local: string; sunset_local: string }
    end: { new_moon_utc: string; new_moon_local: string; sunset_local: string }
  }
  schedule: {
    day_number: number
    day: string
    dawn: string
    sunrise: string
    noon: string
    afternoon: string
    sunset: string
    night: string
  }[]
}
