'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Play, X } from 'lucide-react'
import { F } from './server'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  youtubeId?: string
  videoSrc?: string
  youtubeStart?: number
  youtubeEnd?: number
}

const LOCAL_VIDEO_POLL_MS = 250

/* ---------- pure helpers (no hooks) ---------- */

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ---------- component ---------- */

export function VideoModal({
  isOpen,
  onClose,
  title,
  subtitle,
  youtubeId,
  videoSrc,
  youtubeStart,
  youtubeEnd,
}: VideoModalProps) {
  const [renderModal, setRenderModal] = useState(isOpen)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mediaActivated, setMediaActivated] = useState(true)
  const youtubeEmbedSrc = useMemo(() => {
    if (!youtubeId) return null
    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
    })
    if (youtubeStart !== undefined) params.set('start', String(Math.floor(youtubeStart)))
    if (youtubeEnd !== undefined) params.set('end', String(Math.floor(youtubeEnd)))
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?${params.toString()}`
  }, [youtubeEnd, youtubeId, youtubeStart])

  // Mount/unmount transition handling (derived from isOpen).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setRenderModal(true)
    } else {
      setIsPlaying(false)
      setMediaActivated(true)
    }
  }

  // Local video player + timing
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const clockRef = useRef<number | null>(null)
  const durationRef = useRef(0)

  // DOM refs updated imperatively each frame (avoids re-rendering on every tick)
  const progressFillRef = useRef<HTMLDivElement | null>(null)
  const timecodeRef = useRef<HTMLSpanElement | null>(null)

  // Layout / focus
  const modalBackdropRef = useRef<HTMLDivElement | null>(null)
  const modalContentRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const updateProgressDom = useCallback((t: number, d: number) => {
    if (progressFillRef.current) {
      progressFillRef.current.style.transform = `scaleX(${d > 0 ? Math.min(1, t / d) : 0})`
    }
    if (timecodeRef.current) {
      timecodeRef.current.textContent = d > 0 ? `${fmt(t)} / ${fmt(d)}` : fmt(t)
    }
  }, [])

  const readPlayhead = useCallback(() => {
    let t = 0
    let d = durationRef.current
    if (videoRef.current) {
      t = videoRef.current.currentTime || 0
      const vd = videoRef.current.duration
      if (vd && isFinite(vd)) d = vd
    }
    durationRef.current = d
    return { t, d }
  }, [])

  const syncOnce = useCallback(() => {
    const { t, d } = readPlayhead()
    updateProgressDom(t, d)
  }, [readPlayhead, updateProgressDom])

  const stopClock = useCallback(() => {
    if (clockRef.current != null) {
      window.clearInterval(clockRef.current)
      clockRef.current = null
    }
  }, [])

  const startClock = useCallback(() => {
    if (clockRef.current != null) return
    syncOnce()
    clockRef.current = window.setInterval(syncOnce, LOCAL_VIDEO_POLL_MS)
  }, [syncOnce])

  useEffect(() => {
    if (videoSrc && isPlaying && isOpen) startClock()
    else stopClock()
    return stopClock
  }, [videoSrc, isPlaying, isOpen, startClock, stopClock])

  /* ----- pause media as soon as the modal starts closing ----- */
  useEffect(() => {
    if (isOpen) return
    try {
      videoRef.current?.pause()
    } catch {
      /* noop */
    }
    stopClock()
  }, [isOpen, stopClock])

  /* ----- modal enter / exit animation ----- */
  useEffect(() => {
    const backdrop = modalBackdropRef.current
    const content = modalContentRef.current
    if (!backdrop || !content) return
    const instant = reduceMotion()
    if (isOpen) {
      if (instant) {
        gsap.set(backdrop, { opacity: 1 })
        gsap.set(content, { opacity: 1, y: 0, scale: 1 })
        return
      }
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      gsap.fromTo(
        content,
        { opacity: 0, y: 16, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out' },
      )
    } else if (renderModal) {
      if (instant) {
        const id = window.setTimeout(() => setRenderModal(false), 0)
        return () => window.clearTimeout(id)
      }
      gsap.to(backdrop, { opacity: 0, duration: 0.2, ease: 'power2.in' })
      gsap.to(content, {
        opacity: 0,
        y: 12,
        scale: 0.99,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setRenderModal(false),
      })
    }
  }, [isOpen, renderModal])

  /* ----- scroll lock, Escape, focus trap, focus restore ----- */
  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const { body } = document
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    const trapTab = (e: KeyboardEvent) => {
      const root = modalContentRef.current
      if (!root) return
      const nodes = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea, select, iframe, video, [tabindex]:not([tabindex="-1"])',
      )
      const list = Array.from(nodes).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement as HTMLElement
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !root.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'Tab') {
        trapTab(e)
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    const focusId = window.setTimeout(() => closeBtnRef.current?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      window.clearTimeout(focusId)
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  if (!renderModal) return null

  // 16:9 frame, capped by viewport height so the video never overflows the modal.
  const frameStyle = { maxWidth: 'min(100%, calc(80dvh * 16 / 9))' }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={modalBackdropRef}
      role="presentation"
      className="fixed inset-0 z-[200] overflow-y-auto bg-black/80 backdrop-blur-sm p-0 sm:p-4 sm:grid sm:place-items-center"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        role="dialog"
        aria-modal="true"
        aria-label={subtitle ? `${title}: ${subtitle}` : title}
        tabIndex={-1}
        className="fixed inset-x-0 bottom-0 max-h-[calc(100svh_-_env(safe-area-inset-top,0px))] w-full flex flex-col border border-[var(--ed-rule)] bg-[var(--ed-bg)] shadow-2xl overflow-hidden outline-none rounded-t-2xl pb-[env(safe-area-inset-bottom,0px)] sm:relative sm:inset-auto sm:max-w-5xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl sm:pb-0 md:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--ed-rule)] px-5 py-4 shrink-0 bg-[var(--ed-surface)]/50">
          <div className="space-y-1 min-w-0">
            <span
              className="block text-[9px] sm:text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.3em] text-[var(--ed-fg)] font-bold"
              style={{ fontFamily: F.glacial }}
            >
              {title}
            </span>
            {subtitle && (
              <h3
                className="text-xl sm:text-2xl text-[var(--ed-fg)] italic leading-tight truncate"
                style={{ fontFamily: F.serif }}
              >
                {subtitle}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.mono }}
            >
              Esc
            </span>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close video"
              className="size-11 shrink-0 border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[var(--ed-fg)] flex items-center justify-center hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] focus-visible:ring-1 focus-visible:ring-[var(--ed-accent)] transition-colors rounded-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body: video + caption column */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-[var(--ed-bg)] p-4 lg:p-5 gap-4 lg:gap-5">
          {/* Video column */}
          <div className="flex flex-col gap-3 min-w-0 flex-1 justify-center">
            <div className="flex flex-col gap-3 w-full mx-auto" style={frameStyle}>
              <div className="relative w-full aspect-video bg-black border-4 md:border-8 border-[var(--ed-surface)] ring-1 ring-[var(--ed-rule)] shadow-2xl overflow-hidden">
                {youtubeId ? (
                  mediaActivated && youtubeEmbedSrc ? (
                    <iframe
                      key={youtubeEmbedSrc}
                      src={youtubeEmbedSrc}
                      title={subtitle ? `${title}: ${subtitle}` : title}
                      className="absolute inset-0 h-full w-full bg-black"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMediaActivated(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black text-white transition-colors hover:bg-zinc-950"
                      aria-label={`Play ${subtitle ? `${title}: ${subtitle}` : title}`}
                    >
                      <span className="grid size-16 place-items-center rounded-full border border-white/20 bg-white/10">
                        <Play size={26} fill="currentColor" />
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-[0.24em] text-white/70"
                        style={{ fontFamily: F.glacial }}
                      >
                        Load video
                      </span>
                    </button>
                  )
                ) : videoSrc ? (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={() => {
                      const d = videoRef.current?.duration
                      if (d && isFinite(d)) durationRef.current = d
                      syncOnce()
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onTimeUpdate={() => syncOnce()}
                    onSeeked={() => syncOnce()}
                  />
                ) : null}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06]" />
              </div>

              {!youtubeId && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-0.5">
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      aria-hidden="true"
                      className={`size-1.5 rounded-full ${isPlaying ? 'bg-[var(--ed-accent)]' : 'bg-[var(--ed-fg-muted)]/50'}`}
                    />
                    <span
                      ref={timecodeRef}
                      className="text-[11px] tabular-nums text-[var(--ed-fg-muted)]"
                      style={{ fontFamily: F.mono }}
                    >
                      0:00
                    </span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="relative h-[3px] flex-1 min-w-[80px] rounded-full bg-[var(--ed-rule)] overflow-hidden"
                  >
                    <div
                      ref={progressFillRef}
                      className="absolute inset-0 origin-left bg-[var(--ed-accent)]"
                      style={{ transform: 'scaleX(0)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  )
}
