'use client'

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { Arc } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import {
  AXIS_TICK_LABEL_PROPS,
  RULE_COLOR,
  SCRIPTURE_COLORS,
  type Scripture,
} from './theme'
import type { components } from '@/src/api/types.gen'

type Hourly = components['schemas']['ReadingStatsHourly']

interface HourRadialProps {
  width: number
  height: number
  scripture: Scripture
  data: Hourly[]
}

const HOUR_TICKS = [0, 6, 12, 18]

export function HourRadial({ width, height, scripture, data }: HourRadialProps) {
  const size = Math.min(width, height)
  const cx = width / 2
  const cy = height / 2
  const outerMax = size / 2 - 22
  const inner = Math.max(20, outerMax * 0.35)

  const byHour = useMemo(() => {
    const arr = new Array(24).fill(0) as number[]
    for (const h of data) {
      if (h.hour >= 0 && h.hour < 24) arr[h.hour] = h.verses_read
    }
    return arr
  }, [data])

  const maxVerses = useMemo(() => Math.max(1, ...byHour), [byHour])
  const peakHour = useMemo(() => {
    let idx = 0
    let val = -1
    byHour.forEach((v, i) => {
      if (v > val) {
        val = v
        idx = i
      }
    })
    return { hour: idx, verses: val }
  }, [byHour])

  const rScale = scaleLinear({ domain: [0, maxVerses], range: [inner, outerMax] })
  const fill = SCRIPTURE_COLORS[scripture]
  const segment = (2 * Math.PI) / 24

  return (
    <svg width={width} height={height}>
      <Group left={cx} top={cy}>
        <circle r={outerMax} fill="none" stroke={RULE_COLOR} strokeDasharray="2,3" />
        <circle r={inner} fill="none" stroke={RULE_COLOR} />
        {byHour.map((verses, hour) => {
          const start = hour * segment - Math.PI / 2
          const end = start + segment - 0.01
          const r = verses > 0 ? rScale(verses) : inner
          return (
            <Arc
              key={hour}
              startAngle={start + Math.PI / 2}
              endAngle={end + Math.PI / 2}
              innerRadius={inner}
              outerRadius={r}
              fill={fill}
              fillOpacity={verses === 0 ? 0 : 0.35 + 0.55 * (verses / maxVerses)}
            />
          )
        })}
        {HOUR_TICKS.map((h) => {
          const angle = (h / 24) * 2 * Math.PI - Math.PI / 2
          const x = Math.cos(angle) * (outerMax + 12)
          const y = Math.sin(angle) * (outerMax + 12)
          return (
            <text
              key={h}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              {...AXIS_TICK_LABEL_PROPS}
            >
              {String(h).padStart(2, '0')}
            </text>
          )
        })}
        <text
          x={0}
          y={-2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fill: 'var(--ed-fg-muted)',
          }}
        >
          Peaks at
        </text>
        <text
          x={0}
          y={16}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 22,
            fill: 'var(--ed-fg)',
          }}
        >
          {peakHour.verses > 0
            ? `${String(peakHour.hour).padStart(2, '0')}:00`
            : '—'}
        </text>
      </Group>
    </svg>
  )
}
