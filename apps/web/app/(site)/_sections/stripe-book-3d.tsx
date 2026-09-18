'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

function checkWebglSupported(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export interface StripeBook3DProps {
  type: 'quran' | 'bible'
  width?: number
  height?: number
  className?: string
  priority?: boolean
  staggerDelay?: number
}

export function StripeBook3D({
  type,
  width,
  height,
  className = '',
  priority = false,
  staggerDelay = 0,
}: StripeBook3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [webglSupported] = useState<boolean>(checkWebglSupported)
  const [is3DReady, setIs3DReady] = useState<boolean>(false)
  const [shouldLoad, setShouldLoad] = useState<boolean>(() => {
    if (priority) return true
    if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) return true
    return false
  })

  const triggerLoad = useCallback(() => {
    setShouldLoad(true)
  }, [])

  // IntersectionObserver: Load 3D runtime only when within 200px of viewport
  useEffect(() => {
    if (shouldLoad || !webglSupported) return

    const container = mountRef.current
    if (!container || !('IntersectionObserver' in window)) return

    let timerId: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (staggerDelay && staggerDelay > 0) {
            timerId = setTimeout(() => {
              setShouldLoad(true)
            }, staggerDelay)
          } else {
            setShouldLoad(true)
          }
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    )
    observer.observe(container)
    return () => {
      observer.disconnect()
      if (timerId) clearTimeout(timerId)
    }
  }, [shouldLoad, webglSupported, staggerDelay])

  // Lazy load and mount the 3D book when triggered
  useEffect(() => {
    if (!shouldLoad || !webglSupported) return

    const container = mountRef.current
    if (!container) return

    let cancelled = false
    let handle: { destroy: () => void } | null = null

    async function init() {
      try {
        const { mountStripeBook } = await import('@/lib/3d-book/loader')
        if (cancelled || !container) return

        handle = await mountStripeBook({
          container,
          type,
          onReady: () => {
            if (!cancelled) {
              setIs3DReady(true)
            }
          },
        })
      } catch (err) {
        console.error('[StripeBook3D] Failed to mount 3D book:', err)
      }
    }

    void init()

    return () => {
      cancelled = true
      handle?.destroy()
    }
  }, [shouldLoad, webglSupported, type])

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{
        ...(width ? { width: `${width}px` } : {}),
        ...(height ? { height: `${height}px` } : {}),
      }}
      onPointerEnter={triggerLoad}
      onTouchStart={triggerLoad}
      role="img"
      aria-label={
        type === 'quran'
          ? 'Quran: The Final Testament 3D Book model. Drag to rotate and inspect.'
          : 'The Holy Bible 3D Book model. Drag to rotate and inspect.'
      }
    >
      {/* 2D Fallback / Instant Loading Preview */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-out ${
          is3DReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div
          className="relative w-[74%] h-[88%] rounded-md shadow-2xl overflow-hidden"
          style={{
            transform: 'perspective(1000px) rotateY(-18deg) rotateX(3deg)',
            transformOrigin: 'center center',
            boxShadow:
              '0 20px 35px -8px rgba(0, 0, 0, 0.45), 0 8px 16px -4px rgba(0, 0, 0, 0.3)',
          }}
        >
          {type === 'quran' ? (
            <Image
              src="/images/books/quran-the-final-testament/quran-front.webp"
              alt="Quran: The Final Testament"
              fill
              sizes="(max-width: 768px) 220px, 270px"
              className="object-cover"
              priority={priority}
            />
          ) : (
            <Image
              src="/images/books/the-holy-bible/bible-front.png"
              alt="The Holy Bible: Old & New Testaments"
              fill
              sizes="(max-width: 768px) 220px, 270px"
              className="object-cover"
              priority={priority}
            />
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      {webglSupported && (
        <div
          ref={mountRef}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            is3DReady ? 'opacity-100 cursor-grab active:cursor-grabbing' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
