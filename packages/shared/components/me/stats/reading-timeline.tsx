'use client'

import { useMemo } from 'react'
import { scaleTime, scaleLinear } from '@visx/scale'
import { LinePath, AreaClosed, Bar } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Group } from '@visx/group'
import { curveMonotoneX } from '@visx/curve'
import { localPoint } from '@visx/event'
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip'
import { bisector, extent, max as d3max } from 'd3-array'
import {
  AXIS_TICK_LABEL_PROPS,
  RULE_COLOR,
  SCRIPTURE_COLORS,
  SCRIPTURE_LABEL,
  type Scripture,
} from './theme'
import type { components } from '@/src/api/types.gen'

type Daily = components['schemas']['ReadingStatsDaily']

interface Series {
  scripture: Scripture
  data: Daily[]
}

interface ReadingTimelineProps {
  width: number
  height: number
  series: Series[]
}

interface Point {
  date: Date
  verses: number
}

const MARGIN = { top: 16, right: 16, bottom: 28, left: 36 }

function toPoints(data: Daily[]): Point[] {
  return data.map((d) => ({ date: new Date(`${d.day}T00:00:00`), verses: d.verses_read }))
}

const bisectDate = bisector<Point, Date>((p) => p.date).left

export function ReadingTimeline({ width, height, series }: ReadingTimelineProps) {
  const allPoints = useMemo(
    () => series.map((s) => ({ ...s, points: toPoints(s.data) })),
    [series],
  )
  const flat = useMemo(() => allPoints.flatMap((s) => s.points), [allPoints])
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom)

  const xScale = useMemo(() => {
    const [lo, hi] = extent(flat, (p) => p.date) as [Date | undefined, Date | undefined]
    const now = new Date()
    return scaleTime({
      domain: [lo ?? now, hi ?? now],
      range: [0, innerW],
    })
  }, [flat, innerW])

  const yScale = useMemo(() => {
    const max = d3max(flat, (p) => p.verses) ?? 1
    return scaleLinear({
      domain: [0, Math.max(max, 1)],
      range: [innerH, 0],
      nice: true,
    })
  }, [flat, innerH])

  const { containerRef, TooltipInPortal } = useTooltipInPortal({ scroll: true })
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
  } = useTooltip<{ date: Date; entries: { scripture: Scripture; verses: number }[] }>()

  function handleMove(event: React.PointerEvent<SVGRectElement>) {
    const point = localPoint(event)
    if (!point) return
    const x = point.x - MARGIN.left
    const date = xScale.invert(x)
    const entries = allPoints.map(({ scripture, points }) => {
      if (points.length === 0) return { scripture, verses: 0 }
      const idx = bisectDate(points, date, 1)
      const a = points[idx - 1]
      const b = points[idx]
      const closest =
        !b || (a && Math.abs(+a.date - +date) < Math.abs(+b.date - +date)) ? a : b
      return { scripture, verses: closest?.verses ?? 0 }
    })
    showTooltip({
      tooltipData: { date, entries },
      tooltipLeft: point.x,
      tooltipTop: point.y,
    })
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          {allPoints.map(({ scripture, points }) => {
            const color = SCRIPTURE_COLORS[scripture]
            return (
              <Group key={scripture}>
                <AreaClosed
                  data={points}
                  x={(p) => xScale(p.date)}
                  y={(p) => yScale(p.verses)}
                  yScale={yScale}
                  curve={curveMonotoneX}
                  fill={color}
                  fillOpacity={0.08}
                />
                <LinePath
                  data={points}
                  x={(p) => xScale(p.date)}
                  y={(p) => yScale(p.verses)}
                  curve={curveMonotoneX}
                  stroke={color}
                  strokeWidth={1.5}
                />
              </Group>
            )
          })}
          <AxisLeft
            scale={yScale}
            stroke={RULE_COLOR}
            tickStroke={RULE_COLOR}
            numTicks={4}
            tickLabelProps={() => ({
              ...AXIS_TICK_LABEL_PROPS,
              dx: -4,
              dy: 3,
              textAnchor: 'end',
            })}
          />
          <AxisBottom
            top={innerH}
            scale={xScale}
            stroke={RULE_COLOR}
            tickStroke={RULE_COLOR}
            numTicks={Math.min(6, Math.max(2, Math.floor(innerW / 90)))}
            tickLabelProps={() => ({
              ...AXIS_TICK_LABEL_PROPS,
              dy: 6,
              textAnchor: 'middle',
            })}
          />
          {tooltipData ? (
            <line
              x1={xScale(tooltipData.date)}
              x2={xScale(tooltipData.date)}
              y1={0}
              y2={innerH}
              stroke={RULE_COLOR}
              strokeDasharray="2,3"
            />
          ) : null}
          <Bar
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={handleMove}
            onPointerLeave={() => hideTooltip()}
          />
        </Group>
      </svg>
      {tooltipData ? (
        <TooltipInPortal
          left={tooltipLeft}
          top={tooltipTop}
          style={{ ...defaultStyles, background: 'transparent', padding: 0, boxShadow: 'none' }}
        >
          <div className="rs-tooltip">
            <div style={{ marginBottom: 4 }}>
              {tooltipData.date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            {tooltipData.entries.map((e) => (
              <div key={e.scripture}>
                {SCRIPTURE_LABEL[e.scripture]} — {e.verses} verses
              </div>
            ))}
          </div>
        </TooltipInPortal>
      ) : null}
    </div>
  )
}
