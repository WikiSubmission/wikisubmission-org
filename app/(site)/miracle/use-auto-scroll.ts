'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAutoScrollOptions {
  velocity?: number
  startDelayMs?: number
}

interface UseAutoScrollReturn {
  isPlaying: boolean
  hasStarted: boolean
  pause: () => void
  resume: () => void
  toggle: () => void
}

export function useAutoScroll({
  velocity = 40,
  startDelayMs = 1000,
}: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const isPlayingRef = useRef(false)
  const userPausedRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)
  const isTicking = useRef(false)

  const stop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    lastTimestampRef.current = null
    isTicking.current = false
  }, [])

  const tick = useCallback(
    (timestamp: number) => {
      if (!isPlayingRef.current) {
        isTicking.current = false
        return
      }

      if (lastTimestampRef.current !== null) {
        const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.1)
        const delta = velocity * dt

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
      rafIdRef.current = requestAnimationFrame(tick)
    },
    [velocity],
  )

  const startLoop = useCallback(() => {
    if (isTicking.current) return
    lastTimestampRef.current = null
    isTicking.current = true
    rafIdRef.current = requestAnimationFrame(tick)
  }, [tick])

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
      } else if (!document.hidden && !userPausedRef.current && hasStarted) {
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
  }, [startDelayMs, startLoop, stop, hasStarted])

  return { isPlaying, hasStarted, pause, resume, toggle }
}
