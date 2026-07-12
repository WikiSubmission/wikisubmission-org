'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { PrayerTimesResponse } from '@/lib/prayer-times'
import { deriveEventCycle } from '@/lib/prayer-events'
import { useNow } from '@/hooks/use-now'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { parseDurationToSeconds, formatRemaining } from '@/lib/duration'

interface PrayerGaugeProps {
  data: PrayerTimesResponse
  dataUpdatedAt: number
  /** Called once when the countdown reaches zero so fresh times load. */
  onExpired: () => void
}

// Half-circle geometry: center (100,100), radius 84, sweeping 180° from the
// left end (16,100) to the right end (184,100).
const ARC_PATH = 'M 16 100 A 84 84 0 0 1 184 100'

/**
 * Half-circle gauge showing progress through the current prayer interval: a
 * dot travels along the arc while the center counts down to the next prayer.
 */
export function PrayerGauge({ data, dataUpdatedAt, onExpired }: PrayerGaugeProps) {
  const now = useNow()
  const reducedMotion = usePrefersReducedMotion()
  const expiredRef = useRef(false)

  // Sunrise-aware event cycle. Prefer the API's event fields; fall back to
  // deriving the cycle from times_in_utc (recomputed each tick, so no drift
  // bookkeeping); finally fall back to the 5-prayer fields.
  const derived = !data.upcoming_event ? deriveEventCycle(data, now) : null
  const upcomingLabel = data.upcoming_event ?? derived?.upcomingEvent ?? data.upcoming_prayer

  // The server reports elapsed/left in the city's timezone at fetch time; add
  // the seconds since that fetch to tick locally without timezone math.
  const elapsedSeed = data.current_event_time_elapsed
    ? parseDurationToSeconds(data.current_event_time_elapsed)
    : data.current_prayer_time_elapsed && !derived
      ? parseDurationToSeconds(data.current_prayer_time_elapsed)
      : null
  const leftSeed = data.upcoming_event_time_left
    ? parseDurationToSeconds(data.upcoming_event_time_left)
    : data.upcoming_prayer_time_left && !derived
      ? parseDurationToSeconds(data.upcoming_prayer_time_left)
      : null
  const drift = dataUpdatedAt > 0 ? Math.floor((now - dataUpdatedAt) / 1000) : 0

  const remaining =
    leftSeed !== null ? Math.max(0, leftSeed - drift) : (derived?.secondsLeft ?? null)
  const fraction =
    elapsedSeed !== null && leftSeed !== null && elapsedSeed + leftSeed > 0
      ? Math.min(1, Math.max(0, (elapsedSeed + drift) / (elapsedSeed + leftSeed)))
      : derived && derived.secondsElapsed + derived.secondsLeft > 0
        ? Math.min(
            1,
            Math.max(
              0,
              derived.secondsElapsed / (derived.secondsElapsed + derived.secondsLeft),
            ),
          )
        : null

  useEffect(() => {
    expiredRef.current = false
  }, [dataUpdatedAt])

  useEffect(() => {
    if (remaining === 0 && !expiredRef.current) {
      expiredRef.current = true
      onExpired()
    }
  }, [remaining, onExpired])

  // Minute roll: a small settle on the countdown line each time the minute
  // ticks over (per-second churn would be noise; the seconds just re-render).
  const countdownRef = useRef<HTMLParagraphElement>(null)
  const minutesLeft = remaining !== null ? Math.floor(remaining / 60) : null
  const prevMinutesRef = useRef<number | null>(null)
  useEffect(() => {
    const el = countdownRef.current
    const prev = prevMinutesRef.current
    prevMinutesRef.current = minutesLeft
    if (!el || minutesLeft === null || prev === null || prev === minutesLeft) return
    if (reducedMotion) return
    const tween = gsap.fromTo(
      el,
      { y: 6, autoAlpha: 0.35 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.out',
        clearProps: 'transform,opacity,visibility',
      },
    )
    return () => {
      tween.kill()
    }
  }, [minutesLeft, reducedMotion])

  if (!upcomingLabel) return null

  const transition = reducedMotion
    ? undefined
    : 'stroke-dashoffset 1s linear, transform 1s linear'

  return (
    <div className="relative mx-auto w-full max-w-70">
      <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label="Time until next prayer">
        <path
          d={ARC_PATH}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-border/60"
        />
        {fraction !== null ? (
          <>
            <path
              d={ARC_PATH}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - fraction}
              className="stroke-primary"
              style={{ transition }}
            />
            <g
              style={{
                transform: `rotate(${180 * fraction}deg)`,
                transformOrigin: '100px 100px',
                transformBox: 'view-box',
                transition,
              }}
            >
              <circle cx="16" cy="100" r="7" className="fill-primary/25" />
              <circle cx="16" cy="100" r="4" className="fill-primary" />
            </g>
          </>
        ) : null}
      </svg>

      <div className="absolute inset-x-0 bottom-0 pb-1 text-center">
        <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
          {upcomingLabel.toLowerCase() === 'sunrise' ? 'Up next' : 'Next prayer'}
        </p>
        <p className="font-display mt-0.5 text-3xl capitalize">{upcomingLabel}</p>
        {remaining !== null ? (
          <p ref={countdownRef} className="text-primary mt-0.5 font-mono text-sm tabular-nums">
            in {formatRemaining(remaining)}
          </p>
        ) : null}
        {data.city ? (
          <p className="text-muted-foreground mt-1 text-xs">
            {data.city}
            {data.country_code ? `, ${data.country_code}` : ''}
          </p>
        ) : null}
      </div>
    </div>
  )
}
