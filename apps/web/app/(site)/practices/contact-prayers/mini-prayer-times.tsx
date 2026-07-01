'use client'

import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { F } from '../../_sections/shared/server'

interface PrayerTimesResponse {
  location_string: string
  local_time: string
  current_prayer?: string
  upcoming_prayer?: string
  upcoming_prayer_time_left?: string
  times?: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
  }
}

const prayerLabels: Record<string, string> = {
  fajr: 'Dawn',
  dhuhr: 'Noon',
  asr: 'Afternoon',
  maghrib: 'Sunset',
  isha: 'Night',
}

async function fetchMiniPrayerTimes(location: string) {
  const response = await fetch(`/api/practices/prayer-times/${encodeURIComponent(location)}`)
  if (!response.ok) throw new Error('location_not_found')
  return response.json() as Promise<PrayerTimesResponse>
}

function MiniTimeline({ data }: { data: PrayerTimesResponse }) {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
  const currentPrayer = data.current_prayer?.toLowerCase() ?? ''
  
  return (
    <div className="mt-4 grid grid-cols-5 border-y border-[var(--ed-rule)]/40">
      {prayers.map((prayer) => {
        const isCurrent = currentPrayer === prayer
        return (
          <div
            key={prayer}
            className={`flex flex-col items-center gap-1 py-2 px-1 border-l first:border-l-0 border-[var(--ed-rule)]/40 transition-colors ${
              isCurrent ? 'bg-[var(--ed-accent)]/10' : ''
            }`}
          >
            <span
              className={`text-[8px] sm:text-[9px] uppercase tracking-[0.08em] font-bold ${
                isCurrent ? 'text-[var(--ed-accent)]' : 'text-[var(--ed-fg-muted)]'
              }`}
              style={{ fontFamily: F.glacial }}
            >
              {prayerLabels[prayer] ?? prayer}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] tabular-nums font-semibold ${
                isCurrent ? 'text-[var(--ed-fg)]' : 'text-[var(--ed-fg-muted)]'
              }`}
              style={{ fontFamily: F.mono }}
            >
              {data.times?.[prayer]?.replace(/\s?[AP]M/gi, '')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function LocationPrayerTimes({ location, title }: { location: string; title: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['mini-prayer-times', location],
    queryFn: () => fetchMiniPrayerTimes(location),
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  if (isPending) {
    return (
      <div className="space-y-3 py-6">
        <Skeleton className="h-3 w-24 bg-[var(--ed-rule)]" />
        <Skeleton className="h-6 w-40 bg-[var(--ed-rule)]" />
        <Skeleton className="h-12 w-full bg-[var(--ed-rule)] mt-4" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-6 space-y-2">
        <span
          className="text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--ed-fg)]"
          style={{ fontFamily: F.glacial }}
        >
          {title}
        </span>
        <p className="text-xs text-[var(--ed-fg-muted)]">Prayer times are temporarily unavailable.</p>
      </div>
    )
  }

  const currentLabel = data.current_prayer 
    ? prayerLabels[data.current_prayer.toLowerCase()] ?? data.current_prayer
    : ''
  const upcomingLabel = data.upcoming_prayer
    ? prayerLabels[data.upcoming_prayer.toLowerCase()] ?? data.upcoming_prayer
    : ''

  return (
    <div className="py-6 space-y-3 animate-in fade-in duration-500">
      <div className="flex items-baseline justify-between gap-4">
        <span 
          className="text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--ed-fg)]" 
          style={{ fontFamily: F.glacial }}
        >
          {title}
        </span>
        <span className="text-[10px] tabular-nums text-[var(--ed-fg-muted)]">
          {data.local_time}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span 
          className="text-2xl font-medium text-[var(--ed-accent)] capitalize leading-none" 
          style={{ fontFamily: F.serif }}
        >
          {currentLabel}
        </span>
        {upcomingLabel && data.upcoming_prayer_time_left && (
          <span className="text-sm text-[var(--ed-fg-muted)] tabular-nums leading-none">
            <span className="opacity-60 mr-1">→</span>
            {upcomingLabel} in <span className="font-[family-name:var(--font-jetbrains)] text-[var(--ed-accent)]">{data.upcoming_prayer_time_left}</span>
          </span>
        )}
      </div>

      {data.times && <MiniTimeline data={data} />}
    </div>
  )
}

export function MiniPrayerTimes() {
  return (
    <aside className="border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-2 md:mt-8">
      <div className="border border-[var(--ed-rule)] bg-[var(--ed-bg)] h-full flex flex-col">
        
        <div className="flex items-start justify-between gap-6 p-6 md:p-8 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)]/50">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1.5 w-1.5 bg-[var(--ed-accent)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--ed-fg-muted)]" style={{ fontFamily: F.glacial }}>
                [ Network ]
              </p>
            </div>
            <p className="text-3xl font-medium tracking-tight text-[var(--ed-fg)]" style={{ fontFamily: F.display }}>
              Live Times
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center border border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-accent)] relative">
            <span className="absolute -top-1 -right-1 inline-flex h-1.5 w-1.5 bg-[var(--ed-accent)]"></span>
            <Clock size={18} strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex-1 flex flex-col px-6 md:px-8">
          <div className="divide-y divide-[var(--ed-rule)]">
            <LocationPrayerTimes location="Mecca" title="MAKKAH SAUDI ARABIA" />
            <LocationPrayerTimes location="Tucson, AZ" title="TUCSON AZ USA" />
          </div>
          <div className="py-6 border-t border-[var(--ed-rule)] mt-auto">
            <Link
              href="/practices#prayer-times"
              className="flex w-full min-h-10 items-center justify-center gap-2 border border-[var(--ed-rule)] bg-[var(--ed-bg)]/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg-muted)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)] transition-colors"
              style={{ fontFamily: F.glacial }}
            >
              <Search size={13} />
              Search Your City
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
