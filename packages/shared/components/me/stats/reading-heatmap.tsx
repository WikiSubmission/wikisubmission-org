'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'

interface ReadingHeatmapProps {
  scripture: 'quran' | 'bible'
  data?: { day: string; verses_read: number }[]
  streakDays?: number
  weeksCount?: number
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function formatLocalDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ReadingHeatmap({
  scripture,
  data = [],
  streakDays = 0,
  weeksCount = 14,
}: ReadingHeatmapProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const todayFormatted = useMemo(() => {
    return today.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [today])

  const { weeks, monthHeaders, totalVersesThisWeek, totalVersesInRange, maxVerses } = useMemo(() => {
    const lookup = new Map<string, number>()
    let max = 1
    for (const item of data) {
      lookup.set(item.day, item.verses_read)
      if (item.verses_read > max) max = item.verses_read
    }

    // End at the upcoming Saturday (end of current calendar week)
    const currentDayOfWeek = today.getDay() // 0 = Sunday
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek))

    // Total days = weeksCount * 7
    const totalDays = weeksCount * 7
    const startDate = new Date(endOfWeek)
    startDate.setDate(endOfWeek.getDate() - totalDays + 1)

    // Current week boundary for stats
    const startOfCurrentWeek = new Date(today)
    startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek)

    let thisWeekVerses = 0
    let totalRangeVerses = 0

    const gridWeeks: { date: Date; dateStr: string; verses: number; isFuture: boolean; isToday: boolean }[][] = []
    const months: { label: string; weekIndex: number }[] = []
    let lastMonth = -1

    for (let w = 0; w < weeksCount; w++) {
      const daysInWeek: { date: Date; dateStr: string; verses: number; isFuture: boolean; isToday: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate)
        cellDate.setDate(startDate.getDate() + w * 7 + d)
        const dateStr = formatLocalDate(cellDate)
        const isFuture = cellDate.getTime() > today.getTime()
        const isToday = cellDate.getTime() === today.getTime()
        const verses = isFuture ? 0 : (lookup.get(dateStr) ?? 0)

        if (!isFuture) {
          totalRangeVerses += verses
          if (cellDate >= startOfCurrentWeek) {
            thisWeekVerses += verses
          }
        }

        daysInWeek.push({ date: cellDate, dateStr, verses, isFuture, isToday })
      }

      // Track month transition by looking at the dates in this week
      const midWeekDate = daysInWeek[0].date
      if (midWeekDate.getMonth() !== lastMonth) {
        lastMonth = midWeekDate.getMonth()
        months.push({
          label: midWeekDate.toLocaleDateString(undefined, { month: 'short' }),
          weekIndex: w,
        })
      }

      gridWeeks.push(daysInWeek)
    }

    return {
      weeks: gridWeeks,
      monthHeaders: months,
      totalVersesThisWeek: thisWeekVerses,
      totalVersesInRange: totalRangeVerses,
      maxVerses: max,
    }
  }, [data, weeksCount, today])

  // Determine heatmap intensity 0 to 4
  function getLevel(verses: number): number {
    if (verses <= 0) return 0
    const ratio = verses / Math.max(1, maxVerses)
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    return 4
  }

  return (
    <div className="reading-heatmap-card">
      <div className="reading-heatmap-header">
        <div className="reading-heatmap-stat is-today-stat">
          <span className="reading-heatmap-stat-label">TODAY:</span>
          <strong className="reading-heatmap-stat-value">{todayFormatted}</strong>
        </div>

        <div className="reading-heatmap-header-right">
          <div className="reading-heatmap-stat">
            <span className="reading-heatmap-stat-label">THIS WEEK:</span>
            <strong className="reading-heatmap-stat-value">{totalVersesThisWeek} verses</strong>
          </div>

          <div className="reading-heatmap-stat">
            <span className="reading-heatmap-stat-label">LAST 30D:</span>
            <span className="reading-heatmap-stat-sub">{totalVersesInRange} verses</span>
          </div>

          <div className="reading-heatmap-streak-badge">
            <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>{streakDays} DAY STREAK</span>
          </div>
        </div>
      </div>

      <div className="reading-heatmap-scroll" tabIndex={0} role="region" aria-label="Reading history calendar">
        <div className="reading-heatmap-grid-wrap">
          {/* Month labels header: aligned pixel-perfect with week columns (13px cell + 3px gap = 16px) */}
          <div className="reading-heatmap-months">
            <div className="reading-heatmap-row-header-spacer" />
            <div className="reading-heatmap-months-track">
              {monthHeaders.map((m, idx) => (
                <span
                  key={`${m.label}-${idx}`}
                  className="reading-heatmap-month-label"
                  style={{ left: `${m.weekIndex * 16}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Matrix with day labels */}
          <div className="reading-heatmap-matrix">
            <div className="reading-heatmap-day-labels" aria-hidden="true">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="reading-heatmap-day-label">
                  {i % 2 === 1 ? d : ''}
                </span>
              ))}
            </div>

            <div className="reading-heatmap-columns" role="grid" aria-label={`${scripture} reading activity matrix`}>
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="reading-heatmap-col" role="row">
                  {week.map((day, dIdx) => {
                    const level = day.isFuture ? -1 : getLevel(day.verses)
                    const titleText = day.isFuture
                      ? 'Upcoming day'
                      : day.isToday
                      ? `Today (${day.date.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}): ${day.verses} verses read`
                      : `${day.date.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}: ${day.verses} verses read`

                    return (
                      <div
                        key={dIdx}
                        role="gridcell"
                        aria-label={titleText || undefined}
                        className={`reading-heatmap-cell ${day.isFuture ? 'is-future' : `level-${level}`} ${day.isToday ? 'is-today' : ''} scripture-${scripture}`}
                        title={titleText}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="reading-heatmap-footer">
        <div className="reading-heatmap-today-legend">
          <span className="reading-heatmap-today-indicator" aria-hidden="true" />
          <span>Today ({today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
        </div>

        <div className="reading-heatmap-legend-group">
          <span className="reading-heatmap-legend-label">Less</span>
          <div className="reading-heatmap-legend-swatches">
            <div className={`reading-heatmap-cell level-0 scripture-${scripture}`} />
            <div className={`reading-heatmap-cell level-1 scripture-${scripture}`} />
            <div className={`reading-heatmap-cell level-2 scripture-${scripture}`} />
            <div className={`reading-heatmap-cell level-3 scripture-${scripture}`} />
            <div className={`reading-heatmap-cell level-4 scripture-${scripture}`} />
          </div>
          <span className="reading-heatmap-legend-label">More</span>
        </div>
      </div>
    </div>
  )
}
