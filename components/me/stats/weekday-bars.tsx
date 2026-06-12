'use client'

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import {
  AXIS_TICK_LABEL_PROPS,
  RULE_COLOR,
  SCRIPTURE_COLORS,
  WEEKDAY_LABELS,
  type Scripture,
} from './theme'
import type { components } from '@/src/api/types.gen'

type Weekday = components['schemas']['ReadingStatsWeekday']

interface WeekdayBarsProps {
  width: number
  height: number
  scripture: Scripture
  data: Weekday[]
}

const MARGIN = { top: 16, right: 12, bottom: 28, left: 32 }

export function WeekdayBars({ width, height, scripture, data }: WeekdayBarsProps) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom)
  const color = SCRIPTURE_COLORS[scripture]

  const bars = useMemo(() => {
    const arr = new Array(7).fill(0) as number[]
    for (const w of data) {
      if (w.weekday >= 1 && w.weekday <= 7) arr[w.weekday - 1] = w.verses_read
    }
    return arr
  }, [data])

  const xScale = scaleBand({
    domain: WEEKDAY_LABELS,
    range: [0, innerW],
    padding: 0.32,
  })
  const yScale = scaleLinear({
    domain: [0, Math.max(1, ...bars)],
    range: [innerH, 0],
    nice: true,
  })

  return (
    <svg width={width} height={height}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        {bars.map((v, i) => {
          const label = WEEKDAY_LABELS[i]
          const bw = xScale.bandwidth()
          const bx = xScale(label) ?? 0
          const by = yScale(v)
          const bh = innerH - by
          return (
            <Group key={label}>
              <Bar x={bx} y={by} width={bw} height={Math.max(0, bh)} fill={color} fillOpacity={0.85} />
              {v > 0 ? (
                <text
                  x={bx + bw / 2}
                  y={by - 4}
                  textAnchor="middle"
                  {...AXIS_TICK_LABEL_PROPS}
                >
                  {v}
                </text>
              ) : null}
            </Group>
          )
        })}
        <AxisLeft
          scale={yScale}
          stroke={RULE_COLOR}
          tickStroke={RULE_COLOR}
          numTicks={3}
          tickLabelProps={() => ({ ...AXIS_TICK_LABEL_PROPS, dx: -4, dy: 3, textAnchor: 'end' })}
        />
        <AxisBottom
          top={innerH}
          scale={xScale}
          stroke={RULE_COLOR}
          tickStroke={RULE_COLOR}
          tickLabelProps={() => ({ ...AXIS_TICK_LABEL_PROPS, dy: 6, textAnchor: 'middle' })}
        />
      </Group>
    </svg>
  )
}
