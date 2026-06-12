'use client'

import { useMemo } from 'react'
import { scaleTime, scaleLinear } from '@visx/scale'
import { LinePath, AreaClosed } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Group } from '@visx/group'
import { curveMonotoneX } from '@visx/curve'
import { extent, max as d3max } from 'd3-array'
import {
  AXIS_TICK_LABEL_PROPS,
  RULE_COLOR,
  SCRIPTURE_COLORS,
  type Scripture,
} from './theme'
import type { components } from '@/src/api/types.gen'

type Daily = components['schemas']['ReadingStatsDaily']

interface CumulativeCurveProps {
  width: number
  height: number
  scripture: Scripture
  data: Daily[]
}

const MARGIN = { top: 18, right: 18, bottom: 28, left: 44 }

const MILESTONES: Record<Scripture, number[]> = {
  quran: [1000, 3000, 6236],
  bible: [5000, 15000, 31102],
}

const MILESTONE_LABEL: Record<Scripture, Record<number, string>> = {
  quran: { 6236: 'Full Quran', 3000: 'Halfway', 1000: 'First 1k' },
  bible: { 31102: 'Full Bible', 15000: 'Halfway', 5000: 'First 5k' },
}

interface Point {
  date: Date
  total: number
}

export function CumulativeCurve({ width, height, scripture, data }: CumulativeCurveProps) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom)
  const color = SCRIPTURE_COLORS[scripture]

  const points: Point[] = useMemo(
    () => data.map((d) => ({ date: new Date(`${d.day}T00:00:00`), total: d.verses_read })),
    [data],
  )

  const xScale = useMemo(() => {
    const [lo, hi] = extent(points, (p) => p.date) as [Date | undefined, Date | undefined]
    const now = new Date()
    return scaleTime({ domain: [lo ?? now, hi ?? now], range: [0, innerW] })
  }, [points, innerW])

  const max = d3max(points, (p) => p.total) ?? 1
  const yScale = useMemo(
    () => scaleLinear({ domain: [0, Math.max(max, 1)], range: [innerH, 0], nice: true }),
    [max, innerH],
  )

  const hitMilestones = MILESTONES[scripture]
    .map((threshold) => {
      const hit = points.find((p) => p.total >= threshold)
      if (!hit) return null
      return { threshold, point: hit, label: MILESTONE_LABEL[scripture][threshold] }
    })
    .filter((m): m is { threshold: number; point: Point; label: string } => m !== null)

  return (
    <svg width={width} height={height}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        <AreaClosed
          data={points}
          x={(p) => xScale(p.date)}
          y={(p) => yScale(p.total)}
          yScale={yScale}
          curve={curveMonotoneX}
          fill={color}
          fillOpacity={0.1}
        />
        <LinePath
          data={points}
          x={(p) => xScale(p.date)}
          y={(p) => yScale(p.total)}
          curve={curveMonotoneX}
          stroke={color}
          strokeWidth={1.5}
        />
        {hitMilestones.map((m) => {
          const cx = xScale(m.point.date)
          const cy = yScale(m.point.total)
          return (
            <Group key={m.threshold}>
              <line x1={cx} x2={cx} y1={cy} y2={cy - 14} stroke={RULE_COLOR} strokeDasharray="2,3" />
              <circle cx={cx} cy={cy} r={3} fill={color} />
              <text
                x={cx}
                y={cy - 18}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontSize: 12,
                  fill: 'var(--ed-fg)',
                }}
              >
                {m.label}
              </text>
            </Group>
          )
        })}
        <AxisLeft
          scale={yScale}
          stroke={RULE_COLOR}
          tickStroke={RULE_COLOR}
          numTicks={4}
          tickLabelProps={() => ({ ...AXIS_TICK_LABEL_PROPS, dx: -4, dy: 3, textAnchor: 'end' })}
        />
        <AxisBottom
          top={innerH}
          scale={xScale}
          stroke={RULE_COLOR}
          tickStroke={RULE_COLOR}
          numTicks={Math.min(5, Math.max(2, Math.floor(innerW / 100)))}
          tickLabelProps={() => ({ ...AXIS_TICK_LABEL_PROPS, dy: 6, textAnchor: 'middle' })}
        />
      </Group>
    </svg>
  )
}
