'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const MULTIPLIERS: number[] = [0.5, 1, 2, 3]
const DEFAULT_MULTIPLIER_INDEX = 1
const STORAGE_KEY = 'miracle-auto-scroll-multiplier'

interface UseAutoScrollOptions {
  startDelayMs?: number
  defaultVelocity?: number
  getVelocity?: (scrollY: number) => number
}

interface UseAutoScrollReturn {
  isPlaying: boolean
  hasStarted: boolean
  speedIndex: number
  speedCount: number
  multiplier: number
  pause: () => void
  resume: () => void
  toggle: () => void
  speedUp: () => void
  speedDown: () => void
}

function readStoredIndex(): number {
  if (typeof window === 'undefined') return DEFAULT_MULTIPLIER_INDEX
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_MULTIPLIER_INDEX
    const parsed = Number(raw)
    if (!Number.isInteger(parsed)) return DEFAULT_MULTIPLIER_INDEX
    if (parsed < 0 || parsed >= MULTIPLIERS.length) {
      return DEFAULT_MULTIPLIER_INDEX
    }
    return parsed
  } catch {
    return DEFAULT_MULTIPLIER_INDEX
  }
}

function writeStoredIndex(index: number) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, String(index))
  } catch {
    // ignore (storage disabled / quota)
  }
}

export function useAutoScroll({
  startDelayMs = 1000,
  defaultVelocity = 220,
  getVelocity,
}: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(() => readStoredIndex())

  const isPlayingRef = useRef(false)
  const userPausedRef = useRef(false)
  const multiplierRef = useRef(MULTIPLIERS[speedIndex])
  const getVelocityRef = useRef(getVelocity)
  const defaultVelocityRef = useRef(defaultVelocity)
  const rafIdRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)
  const isTicking = useRef(false)
  const hasStartedRef = useRef(false)
  const tickRef = useRef<(timestamp: number) => void>(() => {})

  useEffect(() => {
    getVelocityRef.current = getVelocity
  }, [getVelocity])

  useEffect(() => {
    defaultVelocityRef.current = defaultVelocity
  }, [defaultVelocity])

  useEffect(() => {
    multiplierRef.current = MULTIPLIERS[speedIndex]
  }, [speedIndex])

  useEffect(() => {
    hasStartedRef.current = hasStarted
  }, [hasStarted])

  const stop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    lastTimestampRef.current = null
    isTicking.current = false
  }, [])

  const startLoop = useCallback(() => {
    if (isTicking.current) return
    lastTimestampRef.current = null
    isTicking.current = true
    rafIdRef.current = requestAnimationFrame((ts) => tickRef.current(ts))
  }, [])

  useEffect(() => {
    tickRef.current = (timestamp: number) => {
      if (!isPlayingRef.current) {
        isTicking.current = false
        return
      }

      if (lastTimestampRef.current !== null) {
        const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.1)
        const base =
          getVelocityRef.current?.(window.scrollY) ?? defaultVelocityRef.current
        const delta = base * multiplierRef.current * dt

        const atBottom =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2

        if (atBottom) {
          isPlayingRef.current = false
          setIsPlaying(false)
          isTicking.current = false
          return
        }

        isTicking.current = true
        window.scrollBy({ top: delta, behavior: 'auto' })
      }

      lastTimestampRef.current = timestamp
      rafIdRef.current = requestAnimationFrame((ts) => tickRef.current(ts))
    }
  }, [])

  const pause = useCallback(() => {
    userPausedRef.current = true
    isPlayingRef.current = false
    setIsPlaying(false)
    stop()
  }, [stop])

  const resume = useCallback(() => {
    userPausedRef.current = false
    isPlayingRef.current = true
    setIsPlaying(true)
    startLoop()
  }, [startLoop])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      pause()
    } else {
      resume()
    }
  }, [pause, resume])

  const speedUp = useCallback(() => {
    setSpeedIndex((prev) => {
      const next = Math.min(prev + 1, MULTIPLIERS.length - 1)
      writeStoredIndex(next)
      return next
    })
  }, [])

  const speedDown = useCallback(() => {
    setSpeedIndex((prev) => {
      const next = Math.max(prev - 1, 0)
      writeStoredIndex(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion) return

    const startTimer = setTimeout(() => {
      setHasStarted(true)
      isPlayingRef.current = true
      setIsPlaying(true)
      startLoop()
    }, startDelayMs)

    const onUserInterrupt = (e: Event) => {
      if (!e.isTrusted) return
      if (isPlayingRef.current) {
        userPausedRef.current = true
        isPlayingRef.current = false
        setIsPlaying(false)
        stop()
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden && isPlayingRef.current) {
        isPlayingRef.current = false
        setIsPlaying(false)
        stop()
      } else if (!document.hidden && !userPausedRef.current && hasStartedRef.current) {
        isPlayingRef.current = true
        setIsPlaying(true)
        startLoop()
      }
    }

    window.addEventListener('wheel', onUserInterrupt, { passive: true })
    window.addEventListener('touchstart', onUserInterrupt, { passive: true })
    window.addEventListener('keydown', onUserInterrupt, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearTimeout(startTimer)
      stop()
      window.removeEventListener('wheel', onUserInterrupt)
      window.removeEventListener('touchstart', onUserInterrupt)
      window.removeEventListener('keydown', onUserInterrupt)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [startDelayMs, startLoop, stop])

  return {
    isPlaying,
    hasStarted,
    speedIndex,
    speedCount: MULTIPLIERS.length,
    multiplier: MULTIPLIERS[speedIndex],
    pause,
    resume,
    toggle,
    speedUp,
    speedDown,
  }
}
