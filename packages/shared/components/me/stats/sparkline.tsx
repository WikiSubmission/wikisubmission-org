'use client'

import { useMemo } from 'react'
import { scaleTime, scaleLinear } from '@visx/scale'
import { LinePath, AreaClosed } from '@visx/shape'
import { Group } from '@visx/group'
import { curveMonotoneX } from '@visx/curve'
import { extent, max as d3max } from 'd3-array'
import { SCRIPTURE_COLORS, type Scripture } from './theme'
import type { components } from '@/src/api/types.gen'

type Daily = components['schemas']['ReadingStatsDaily']

interface SparklineProps {
  width: number
  height: number
  scripture: Scripture
  data: Daily[]
}

export function Sparkline({ width, height, scripture, data }: SparklineProps) {
  const color = SCRIPTURE_COLORS[scripture]
  const points = useMemo(
    () => data.map((d) => ({ date: new Date(`${d.day}T00:00:00`), verses: d.verses_read })),
    [data],
  )

  const xScale = useMemo(() => {
    const [lo, hi] = extent(points, (p) => p.date) as [Date | undefined, Date | undefined]
    const now = new Date()
    return scaleTime({ domain: [lo ?? now, hi ?? now], range: [2, width - 2] })
  }, [points, width])

  const yScale = useMemo(() => {
    const max = d3max(points, (p) => p.verses) ?? 1
    return scaleLinear({ domain: [0, Math.max(max, 1)], range: [height - 2, 2] })
  }, [points, height])

  if (points.length === 0) return null

  return (
    <svg width={width} height={height} aria-hidden="true">
      <Group>
        <AreaClosed
          data={points}
          x={(p) => xScale(p.date)}
          y={(p) => yScale(p.verses)}
          yScale={yScale}
          curve={curveMonotoneX}
          fill={color}
          fillOpacity={0.12}
        />
        <LinePath
          data={points}
          x={(p) => xScale(p.date)}
          y={(p) => yScale(p.verses)}
          curve={curveMonotoneX}
          stroke={color}
          strokeWidth={1.2}
        />
      </Group>
    </svg>
  )
}
