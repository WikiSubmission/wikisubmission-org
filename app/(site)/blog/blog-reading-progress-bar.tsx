'use client'

import { useEffect, useState } from 'react'

const NAV_FALLBACK_PX = 64

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function measureNavBottom() {
  const nav = document.querySelector<HTMLElement>('[data-site-nav]')
  if (!nav) return NAV_FALLBACK_PX
  return Math.round(nav.getBoundingClientRect().bottom)
}

export function BlogReadingProgressBar({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0)
  const [navBottom, setNavBottom] = useState(NAV_FALLBACK_PX)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      const navOffset = measureNavBottom()
      setNavBottom(navOffset)

      const target = document.getElementById(targetId)
      if (!target) {
        setProgress(0)
        return
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const rect = target.getBoundingClientRect()
      const targetTop = rect.top + scrollTop
      const targetHeight = target.offsetHeight
      const start = targetTop - navOffset
      const end = Math.max(
        start + 1,
        targetTop + targetHeight - window.innerHeight,
      )

      setProgress(clampPercent(((scrollTop - start) / (end - start)) * 100))
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [targetId])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-40 h-[2px] bg-border/25"
      style={{ top: navBottom }}
    >
      <div
        className="h-full bg-primary/70 transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          transformOrigin: 'left center',
        }}
      />
    </div>
  )
}
