'use client'

import { useMemo, useState } from 'react'
import { useReadingStats } from '@/hooks/use-reading-stats'
import { useStreak } from '@/hooks/use-reading-streak'
import { italicizeLast } from '@/components/editorial/section-header'
import { StatsTabs } from '@/components/me/stats/stats-tabs'
import { RangeChips } from '@/components/me/stats/range-chips'
import { StatCard } from '@/components/me/stats/stat-card'
import { ChartCard } from '@/components/me/stats/chart-card'
import { ReadingTimeline } from '@/components/me/stats/reading-timeline'
import { HourRadial } from '@/components/me/stats/hour-radial'
import { WeeklyHeatmap } from '@/components/me/stats/weekly-heatmap'
import { WeekdayBars } from '@/components/me/stats/weekday-bars'
import { CumulativeCurve } from '@/components/me/stats/cumulative-curve'
import type { Scripture, StatsView } from '@/components/me/stats/theme'
import type { ReadingStatsRange } from '@/types/bookmarks'

function activeScripture(view: StatsView): Scripture {
  return view === 'bible' ? 'bible' : 'quran'
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatBestDay(day?: string, verses?: number): string | null {
  if (!day || !verses) return null
  try {
    const d = new Date(`${day}T00:00:00`)
    return `${formatNumber(verses)} verses · ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  } catch {
    return `${formatNumber(verses)} verses`
  }
}

export default function StatsPageClient() {
  const [view, setView] = useState<StatsView>('quran')
  const [range, setRange] = useState<ReadingStatsRange>('30d')

  const quran = useReadingStats('quran', range)
  const bible = useReadingStats('bible', range)
  const focused = activeScripture(view)
  const focusedStats = view === 'bible' ? bible.data : quran.data
  const isLoading = view === 'bible' ? bible.isLoading : quran.isLoading

  const quranStreak = useStreak('quran')
  const bibleStreak = useStreak('bible')
  const focusedStreak = focused === 'bible' ? bibleStreak : quranStreak

  const series = useMemo(() => {
    const arr: { scripture: Scripture; data: NonNullable<typeof quran.data>['daily'] }[] = []
    if (view === 'combined') {
      if (quran.data) arr.push({ scripture: 'quran', data: quran.data.daily })
      if (bible.data) arr.push({ scripture: 'bible', data: bible.data.daily })
    } else if (focusedStats) {
      arr.push({ scripture: focused, data: focusedStats.daily })
    }
    return arr
  }, [view, focused, focusedStats, quran.data, bible.data])

  const total = focusedStats?.total ?? 0
  const activeDays = focusedStats?.active_days ?? 0
  const bestDayText = formatBestDay(focusedStats?.best_day?.day, focusedStats?.best_day?.verses_read)
  const hasAny = series.some((s) => s.data.length > 0)
  const dailyEmpty = !hasAny && !isLoading

  return (
    <div>
      <header className="rs-head">
        <div>
          <h1 className="rs-title">Reading {italicizeLast('rhythm')}</h1>
        </div>
        <StatsTabs value={view} onChange={setView} />
        <RangeChips value={range} onChange={setRange} />
      </header>

      <div className="rs-stat-grid">
        <StatCard
          label="Current streak"
          value={`${focusedStreak?.current_streak ?? 0}`}
          note={focusedStreak?.current_streak ? 'days in a row' : 'start one today'}
        />
        <StatCard
          label="Verses in range"
          value={formatNumber(total)}
          note={range === 'all' ? 'all time' : `last ${range}`}
        />
        <StatCard
          label="Active days"
          value={`${activeDays}`}
          note={activeDays === 0 ? '—' : `in this range`}
        />
        <StatCard
          label="Best day"
          value={focusedStats?.best_day ? formatNumber(focusedStats.best_day.verses_read) : '—'}
          note={bestDayText ?? 'no readings yet'}
        />
      </div>

      <ChartCard
        title="Daily readings"
        subtitle={view === 'combined' ? 'Quran + Bible' : focused.toUpperCase()}
        ariaLabel="Daily verses read line chart"
        full
        minHeight={260}
        isEmpty={dailyEmpty}
      >
        {({ width, height }) => (
          <ReadingTimeline width={width} height={height} series={series} />
        )}
      </ChartCard>

      <div className="rs-grid">
        <ChartCard
          title="Hour of day"
          subtitle="when you read"
          ariaLabel="Reading frequency by hour of day"
          minHeight={260}
          isEmpty={!focusedStats || focusedStats.hourly.length === 0}
        >
          {({ width, height }) => (
            <HourRadial
              width={width}
              height={height}
              scripture={focused}
              data={focusedStats?.hourly ?? []}
            />
          )}
        </ChartCard>

        <ChartCard
          title="By weekday"
          subtitle="average verses"
          ariaLabel="Reading frequency by weekday"
          minHeight={260}
          isEmpty={!focusedStats || focusedStats.weekday.length === 0}
        >
          {({ width, height }) => (
            <WeekdayBars
              width={width}
              height={height}
              scripture={focused}
              data={focusedStats?.weekday ?? []}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Daily heatmap"
          subtitle="calendar"
          ariaLabel="Reading intensity calendar heatmap"
          minHeight={200}
          isEmpty={!focusedStats || focusedStats.daily.length === 0}
        >
          {({ width, height }) => (
            <WeeklyHeatmap
              width={width}
              height={height}
              scripture={focused}
              data={focusedStats?.daily ?? []}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Cumulative"
          subtitle="total verses over time"
          ariaLabel="Cumulative verses read curve with milestones"
          minHeight={260}
          isEmpty={!focusedStats || focusedStats.cumulative.length === 0}
        >
          {({ width, height }) => (
            <CumulativeCurve
              width={width}
              height={height}
              scripture={focused}
              data={focusedStats?.cumulative ?? []}
            />
          )}
        </ChartCard>
      </div>
    </div>
  )
}
