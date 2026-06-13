'use client'

import { useMemo, useSyncExternalStore } from 'react'

export type DayPhase = 'night' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk'

export interface TimeOfDay {
  /** Minutes since local midnight (0–1439). */
  minutes: number
  /** Fraction of the day elapsed (0–1). */
  progress: number
  phase: DayPhase
  isDay: boolean
  /** Horizontal position of the sun/moon across the sky, 0 (east) to 100 (west). */
  luminaryX: number
  /** Height of the sun/moon above the horizon, 0 (set) to 1 (zenith). */
  luminaryAltitude: number
}

const DAY_START = 6 * 60 // 06:00 sunrise reference
const DAY_END = 18 * 60 // 18:00 sunset reference
const DAY_SPAN = DAY_END - DAY_START
const NOON = 12 * 60

function phaseFor(minutes: number): DayPhase {
  const h = minutes / 60
  if (h < 5) return 'night'
  if (h < 7) return 'dawn'
  if (h < 11) return 'morning'
  if (h < 15) return 'midday'
  if (h < 18) return 'afternoon'
  if (h < 20) return 'dusk'
  return 'night'
}

function compute(minutes: number): TimeOfDay {
  const isDay = minutes >= DAY_START && minutes < DAY_END
  let luminaryX: number
  let luminaryAltitude: number

  if (isDay) {
    const f = (minutes - DAY_START) / DAY_SPAN // 0..1 across daylight
    luminaryX = f * 100
    luminaryAltitude = Math.sin(f * Math.PI)
  } else {
    const sinceDusk = (minutes - DAY_END + 1440) % 1440 // 0..720 since 18:00
    const f = sinceDusk / (1440 - DAY_SPAN)
    luminaryX = f * 100
    luminaryAltitude = Math.sin(f * Math.PI)
  }

  return {
    minutes,
    progress: minutes / 1440,
    phase: phaseFor(minutes),
    isDay,
    luminaryX,
    luminaryAltitude,
  }
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

// Shared minute clock. Server snapshot is noon so the export render is
// deterministic; the real local minute is read on the client.
let currentMinutes = nowMinutes()
let timer: ReturnType<typeof setInterval> | null = null
const listeners = new Set<() => void>()

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  if (timer === null) {
    timer = setInterval(() => {
      currentMinutes = nowMinutes()
      listeners.forEach((l) => l())
    }, 60_000)
  }
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }
}

/** Tracks the local time of day, updating once a minute. */
export function useTimeOfDay(): TimeOfDay {
  const minutes = useSyncExternalStore(
    subscribe,
    () => currentMinutes,
    () => NOON,
  )
  return useMemo(() => compute(minutes), [minutes])
}
