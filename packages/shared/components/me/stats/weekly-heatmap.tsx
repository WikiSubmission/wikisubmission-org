'use client'

import { useMemo } from 'react'
import { Group } from '@visx/group'
import {
  AXIS_TICK_LABEL_PROPS,
  RULE_COLOR,
  SCRIPTURE_COLORS,
  type Scripture,
} from './theme'
import type { components } from '@/src/api/types.gen'

type Daily = components['schemas']['ReadingStatsDaily']

interface WeeklyHeatmapProps {
  width: number
  height: number
  scripture: Scripture
  data: Daily[]
}

const MARGIN = { top: 18, right: 8, bottom: 4, left: 30 }
const ROW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function toLocalDate(s: string): Date {
  return new Date(`${s}T00:00:00`)
}

function isoDayIndex(d: Date): number {
  const dow = d.getDay()
  return dow === 0 ? 6 : dow - 1
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const diff = isoDayIndex(copy)
  copy.setDate(copy.getDate() - diff)
  return copy
}

export function WeeklyHeatmap({ width, height, scripture, data }: WeeklyHeatmapProps) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom)
  const color = SCRIPTURE_COLORS[scripture]

  const { weeks, max, lookup, monthLabels } = useMemo(() => {
    if (data.length === 0) {
      return {
        weeks: 0,
        max: 1,
        lookup: new Map<string, number>(),
        monthLabels: [] as { x: number; label: string }[],
      }
    }
    const first = toLocalDate(data[0].day)
    const last = toLocalDate(data[data.length - 1].day)
    const start = startOfWeek(first)
    const end = last
    const totalDays = Math.floor((+end - +start) / 86400000) + 1
    const w = Math.ceil(totalDays / 7)
    const m = new Map<string, number>()
    let mx = 1
    for (const d of data) {
      m.set(d.day, d.verses_read)
      if (d.verses_read > mx) mx = d.verses_read
    }
    const labels: { x: number; label: string }[] = []
    let lastMonth = -1
    for (let i = 0; i < w; i++) {
      const colStart = new Date(start)
      colStart.setDate(colStart.getDate() + i * 7)
      if (colStart.getMonth() !== lastMonth) {
        lastMonth = colStart.getMonth()
        labels.push({ x: i, label: colStart.toLocaleDateString(undefined, { month: 'short' }) })
      }
    }
    return { weeks: w, max: mx, lookup: m, monthLabels: labels }
  }, [data])

  if (weeks === 0) return null

  const cellSize = Math.min(
    Math.floor(innerW / Math.max(1, weeks)) - 2,
    Math.floor(innerH / 7) - 2,
    16,
  )
  const gap = 2
  const startDate = (() => {
    if (data.length === 0) return new Date()
    return startOfWeek(toLocalDate(data[0].day))
  })()

  function colorFor(verses: number): string {
    if (verses <= 0) return 'transparent'
    const ratio = Math.min(1, verses / max)
    const stops = [0.12, 0.28, 0.5, 0.72, 0.92]
    const step = stops.findIndex((s) => ratio <= s)
    const alpha = step === -1 ? stops[stops.length - 1] : stops[step]
    return `color-mix(in oklab, ${color} ${(alpha * 100).toFixed(0)}%, transparent)`
  }

  return (
    <svg width={width} height={height}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        {monthLabels.map((m) => (
          <text
            key={`${m.x}-${m.label}`}
            x={m.x * (cellSize + gap)}
            y={-6}
            {...AXIS_TICK_LABEL_PROPS}
          >
            {m.label}
          </text>
        ))}
        {ROW_LABELS.map((row, i) =>
          i % 2 === 0 ? (
            <text
              key={`row-${i}`}
              x={-8}
              y={i * (cellSize + gap) + cellSize * 0.7}
              textAnchor="end"
              {...AXIS_TICK_LABEL_PROPS}
            >
              {row}
            </text>
          ) : null,
        )}
        {Array.from({ length: weeks }).map((_, col) =>
          Array.from({ length: 7 }).map((__, row) => {
            const d = new Date(startDate)
            d.setDate(d.getDate() + col * 7 + row)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const v = lookup.get(key) ?? 0
            const x = col * (cellSize + gap)
            const y = row * (cellSize + gap)
            return (
              <rect
                key={`${col}-${row}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={colorFor(v)}
                stroke={RULE_COLOR}
                strokeWidth={v > 0 ? 0 : 0.5}
              >
                <title>
                  {d.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  — {v} verses
                </title>
              </rect>
            )
          }),
        )}
      </Group>
    </svg>
  )
}
