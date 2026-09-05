'use client'

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { RotateCcw } from 'lucide-react'
import { F } from '@/app/(site)/_sections/shared'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

interface Point {
  x: number
  y: number
}

interface Kernel {
  id: string
  cx: number
  cy: number
  rotation: number
  scale: number
  pair: number
  side: number
}

interface Ear {
  index: number
  d: string
  base: Point
  tip: Point
  kernels: Kernel[]
  awns: { x1: number; y1: number; x2: number; y2: number }[]
}

const CENTER = { x: 460, y: 330 }
const GRAIN_COUNT = 100

// Seven ears with organic, asymmetrical geometry.
// Each ear emerges from the stalk apex and curves with its own character.
const EAR_CONFIGS = [
  { baseY: 214, cpX: 235, cpY: 192, tipX: 102, tipY: 102, bend: -8, density: 1.02 },
  { baseY: 212, cpX: 306, cpY: 148, tipX: 204, tipY: 46, bend: 11, density: 0.96 },
  { baseY: 210, cpX: 380, cpY: 118, tipX: 332, tipY: 18, bend: -6, density: 1.0 },
  { baseY: 210, cpX: 455, cpY: 84, tipX: 460, tipY: 10, bend: 2, density: 1.06 },
  { baseY: 210, cpX: 530, cpY: 118, tipX: 588, tipY: 18, bend: 7, density: 1.0 },
  { baseY: 212, cpX: 604, cpY: 150, tipX: 716, tipY: 48, bend: -9, density: 0.96 },
  { baseY: 214, cpX: 680, cpY: 194, tipX: 818, tipY: 104, bend: 5, density: 1.02 },
]

function quadratic(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  }
}

function tangent(p0: Point, p1: Point, p2: Point, t: number) {
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x)
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
  return Math.atan2(dy, dx)
}

function deterministicNoise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

function buildEar(config: (typeof EAR_CONFIGS)[number], index: number): Ear {
  const p0 = { x: CENTER.x, y: config.baseY }
  const p1 = { x: config.cpX, y: config.cpY }
  const p2 = { x: config.tipX, y: config.tipY }
  const d = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`

  const kernels: Kernel[] = []
  const pairCount = GRAIN_COUNT / 2

  for (let pair = 0; pair < pairCount; pair += 1) {
    // Distribute kernels along the ear, slightly denser toward the tip
    const t = 0.05 + 0.9 * (pair / (pairCount - 1))
    const point = quadratic(p0, p1, p2, t)
    const angle = tangent(p0, p1, p2, t)
    const normal = angle + Math.PI / 2

    // Ear girth: fuller in the middle, tapered at both ends
    const fullness = Math.sin(t * Math.PI)
    const baseSpread = (6.2 + fullness * 6.8) * config.density

    // Kernels at the very tip and base are slightly smaller
    const sizeFactor = 0.72 + 0.28 * Math.sin(t * Math.PI * 0.92)

    for (let side = -1; side <= 1; side += 2) {
      const jitter = (deterministicNoise(index * 631 + pair * 13 + (side === 1 ? 5 : 0)) - 0.5) * 2.6
      const spread = baseSpread + jitter
      const cx = round(point.x + Math.cos(normal) * spread * side, 2)
      const cy = round(point.y + Math.sin(normal) * spread * side, 2)
      const rotation = round((angle * 180) / Math.PI + side * 44 + config.bend * 0.55, 2)
      const scale = round((0.74 + deterministicNoise(index * 179 + pair * 23 + side * 7) * 0.18) * sizeFactor, 3)

      kernels.push({
        id: `ear-${index}-kernel-${pair}-${side}`,
        cx,
        cy,
        rotation,
        scale,
        pair,
        side,
      })
    }
  }

  // Sort by pair index so DOM order runs base → tip for staggered animation
  kernels.sort((a, b) => a.pair - b.pair)

  const awns: Ear['awns'] = []
  for (let a = 0; a < 12; a += 1) {
    const t = 0.42 + a * 0.045
    const point = quadratic(p0, p1, p2, t)
    const angle = tangent(p0, p1, p2, t)
    const normal = angle + Math.PI / 2
    const side = a % 2 === 0 ? -1 : 1
    const startX = round(point.x + Math.cos(normal) * (9.5 * side), 2)
    const startY = round(point.y + Math.sin(normal) * (9.5 * side), 2)
    const length = 14 + (a % 4) * 3.5 + deterministicNoise(index * 41 + a * 3) * 4
    const outAngle = angle + side * 0.32 + deterministicNoise(index * 17 + a) * 0.1

    awns.push({
      x1: startX,
      y1: startY,
      x2: round(startX + Math.cos(outAngle) * length, 2),
      y2: round(startY + Math.sin(outAngle) * length, 2),
    })
  }

  return { index, d, base: p0, tip: p2, kernels, awns }
}

export function ScriptureAnalogy() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const seedRef = useRef<SVGGElement | null>(null)
  const germRef = useRef<SVGCircleElement | null>(null)
  const shadowRef = useRef<SVGEllipseElement | null>(null)
  const rootsRef = useRef<SVGPathElement[]>([])
  const stemRef = useRef<SVGPathElement | null>(null)
  const leafRef = useRef<SVGPathElement[]>([])
  const nodeRef = useRef<SVGCircleElement[]>([])
  const plantGroupRef = useRef<SVGGElement | null>(null)
  const earRef = useRef<SVGPathElement[]>([])
  const kernelGroupRef = useRef<SVGGElement[]>([])
  const awnGroupRef = useRef<SVGGElement[]>([])
  const labelRef = useRef<HTMLDivElement | null>(null)
  const finalNumberRef = useRef<HTMLDivElement | null>(null)
  const finalGlowRef = useRef<SVGCircleElement | null>(null)
  const burstRef = useRef<SVGGElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const swayTweenRef = useRef<gsap.core.Tween | null>(null)

  const [phase, setPhase] = useState<'seed' | 'growth' | 'ears' | 'harvest'>('seed')
  const [count, setCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const uid = useId()

  const ears = useMemo(() => EAR_CONFIGS.map(buildEar), [])
  const finalDisplay = reducedMotion ? 700 : count
  const currentPhase = reducedMotion ? 'harvest' : phase

  const resetVisualState = useCallback(() => {
    const seed = seedRef.current
    if (seed) gsap.set(seed, { scale: 0, opacity: 0, transformOrigin: '50% 50%' })
    if (germRef.current) gsap.set(germRef.current, { r: 2, opacity: 0 })
    if (shadowRef.current) gsap.set(shadowRef.current, { rx: 0, ry: 0, opacity: 0 })
    if (finalGlowRef.current) gsap.set(finalGlowRef.current, { r: 0, opacity: 0 })
    if (burstRef.current) gsap.set(burstRef.current, { opacity: 0, scale: 0.7, transformOrigin: 'center' })
    if (finalNumberRef.current) gsap.set(finalNumberRef.current, { opacity: 0, y: 10, scale: 0.92 })
    if (plantGroupRef.current) {
      gsap.set(plantGroupRef.current, { rotation: 0, transformOrigin: '460px 374px' })
    }

    rootsRef.current.forEach((path) => {
      const length = path?.getTotalLength?.() || 80
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 })
    })

    if (stemRef.current) {
      const length = stemRef.current.getTotalLength?.() || 160
      gsap.set(stemRef.current, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
    }

    leafRef.current.forEach((path, index) => {
      const length = path?.getTotalLength?.() || 100
      const baseRotation = index % 2 === 0 ? -18 : 16
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0,
        rotation: baseRotation,
        transformOrigin: `${index % 2 === 0 ? '460px' : '460px'} ${334 - index * 28}px`,
      })
    })

    nodeRef.current.forEach((node) => gsap.set(node, { scale: 0, opacity: 0, transformOrigin: '50% 50%' }))

    earRef.current.forEach((path) => {
      const length = path?.getTotalLength?.() || 220
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 })
    })

    kernelGroupRef.current.forEach((group) => {
      if (group) gsap.set(group.children, { opacity: 0, scale: 0.1, transformOrigin: 'center center' })
    })

    awnGroupRef.current.forEach((group) => {
      if (group) gsap.set(group.children, { opacity: 0, scale: 0.5, transformOrigin: 'center center' })
    })
  }, [])

  const runAnimation = useCallback(() => {
    if (reducedMotion) return
    timelineRef.current?.kill()
    swayTweenRef.current?.kill()
    resetVisualState()

    setPlaying(true)
    setPhase('seed')
    setCount(0)

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        setPlaying(false)
        setPhase('harvest')
        setCount(700)
        // Gentle ambient sway — the plant lives on after the story resolves
        if (plantGroupRef.current) {
          swayTweenRef.current = gsap.to(plantGroupRef.current, {
            rotation: 1.4,
            duration: 5.2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            transformOrigin: '460px 374px',
          })
        }
      },
    })
    timelineRef.current = tl

    // ─── SEED ───
    tl.call(() => setPhase('seed'))
    tl.to(seedRef.current, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' })
    // A living seed breathes before it breaks open
    tl.to(seedRef.current, { scale: 1.06, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 1 })
    tl.to(germRef.current, { r: 16, opacity: 0.22, duration: 0.55, ease: 'power2.out' }, '-=0.5')
    tl.to(germRef.current, { r: 40, opacity: 0, duration: 0.75, ease: 'power2.out' }, '-=0.25')

    // ─── GROWTH ───
    tl.call(() => setPhase('growth'), undefined, '-=0.35')
    tl.to(seedRef.current, { opacity: 0.3, scale: 0.8, duration: 1, ease: 'power1.out' }, '<')
    tl.to(shadowRef.current, { rx: 110, ry: 7, opacity: 0.07, duration: 2.8, ease: 'power2.out' }, '<')

    // Roots reach downward with organic irregularity
    rootsRef.current.forEach((root, index) => {
      tl.to(
        root,
        { strokeDashoffset: 0, opacity: 0.4, duration: 0.55, ease: 'power1.out' },
        index === 0 ? '<' : '-=0.38',
      )
    })

    // The culm rises with the weight of life in it
    tl.to(stemRef.current, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, '-=0.25')

    // Leaves unfurl from their sheaths
    leafRef.current.forEach((leaf, index) => {
      tl.to(
        leaf,
        { strokeDashoffset: 0, opacity: 0.72, duration: 0.75, ease: 'power2.out' },
        index === 0 ? '-=0.75' : '-=0.58',
      )
      tl.to(leaf, { rotation: 0, duration: 0.7, ease: 'back.out(1.3)' }, '<')
    })

    // Nodes swell into being
    nodeRef.current.forEach((node, index) => {
      tl.to(
        node,
        { scale: 1, opacity: 0.55, duration: 0.28, ease: 'back.out(2)' },
        index === 0 ? '-=0.55' : '-=0.22',
      )
    })

    // ─── EARS ───
    tl.call(() => setPhase('ears'), undefined, '+=0.12')

    // Center ear first, then alternating outward — the fan opens like a hand
    const revealOrder = [3, 2, 4, 1, 5, 0, 6]
    revealOrder.forEach((earIndex, orderIndex) => {
      const path = earRef.current[earIndex]
      if (!path) return

      // Rachis (ear stem) extends from the node
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.78,
          ease: 'power2.out',
        },
        orderIndex === 0 ? '-=0.1' : '-=0.56',
      )

      // Kernels populate from base to tip, as the ear fills with grain
      const group = kernelGroupRef.current[earIndex]
      if (group) {
        tl.to(
          group.children,
          {
            opacity: 0.94,
            scale: 1,
            duration: 0.32,
            stagger: {
              each: 0.009,
              from: 'start',
            },
            ease: 'back.out(1.5)',
          },
          '-=0.48',
        )
      }

      // Awns bristle outward after the grain is set
      const awns = awnGroupRef.current[earIndex]
      if (awns) {
        tl.to(
          awns.children,
          {
            opacity: 0.48,
            scale: 1,
            duration: 0.28,
            stagger: 0.022,
            ease: 'power2.out',
          },
          '-=0.42',
        )
      }
    })

    // ─── HARVEST ───
    tl.call(() => setPhase('harvest'), undefined, '+=0.2')

    // A warm halo expands, suggesting the abundance cannot be contained
    tl.to(finalGlowRef.current, { r: 150, opacity: 0.13, duration: 0.9, ease: 'power2.out' }, '-=0.15')

    // The number accumulates with gravity
    const counter = { value: 0 }
    tl.to(
      counter,
      {
        value: 700,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => setCount(Math.round(counter.value)),
      },
      '-=0.6',
    )

    tl.to(
      finalNumberRef.current,
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.3)' },
      '-=1.4',
    )

    // Restrained rays suggest the multiplication continues beyond what is shown
    tl.to(burstRef.current, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, '-=0.9')
    tl.to(burstRef.current, { opacity: 0.18, scale: 1.18, duration: 2.2, ease: 'sine.out' })
  }, [reducedMotion, resetVisualState])

  useEffect(() => {
    if (reducedMotion) return
    const container = containerRef.current
    if (!container) return

    let triggered = false
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !triggered) {
          triggered = true
          runAnimation()
          observer.disconnect()
        }
      },
      { threshold: 0.32 },
    )

    observer.observe(container)
    return () => {
      observer.disconnect()
      timelineRef.current?.kill()
      swayTweenRef.current?.kill()
    }
  }, [reducedMotion, runAnimation])

  useEffect(() => {
    if (reducedMotion) {
      timelineRef.current?.kill()
      swayTweenRef.current?.kill()
      resetVisualState()

      // Render the completed plant immediately for users who prefer reduced motion
      if (seedRef.current) gsap.set(seedRef.current, { scale: 0.8, opacity: 0.3 })
      if (germRef.current) gsap.set(germRef.current, { r: 0, opacity: 0 })
      if (shadowRef.current) gsap.set(shadowRef.current, { rx: 110, ry: 7, opacity: 0.07 })
      rootsRef.current.forEach((root) => gsap.set(root, { strokeDashoffset: 0, opacity: 0.4 }))
      if (stemRef.current) gsap.set(stemRef.current, { strokeDashoffset: 0, opacity: 1 })
      leafRef.current.forEach((leaf) => gsap.set(leaf, { strokeDashoffset: 0, opacity: 0.72, rotation: 0 }))
      nodeRef.current.forEach((node) => gsap.set(node, { scale: 1, opacity: 0.55 }))
      earRef.current.forEach((ear) => gsap.set(ear, { strokeDashoffset: 0, opacity: 1 }))
      kernelGroupRef.current.forEach((group) => gsap.set(group.children, { opacity: 0.94, scale: 1 }))
      awnGroupRef.current.forEach((group) => gsap.set(group.children, { opacity: 0.48, scale: 1 }))
      if (finalGlowRef.current) gsap.set(finalGlowRef.current, { r: 120, opacity: 0.1 })
      if (finalNumberRef.current) gsap.set(finalNumberRef.current, { opacity: 1, y: 0, scale: 1 })
      if (burstRef.current) gsap.set(burstRef.current, { opacity: 0.15, scale: 1.1 })
    }
  }, [reducedMotion, resetVisualState])

  // Animate the phase label when it changes
  useEffect(() => {
    if (labelRef.current && !reducedMotion) {
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 3 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      )
    }
  }, [phase, reducedMotion])

  const phaseLabel = {
    seed: 'ONE GRAIN',
    growth: 'ONE PLANT',
    ears: 'SEVEN EARS',
    harvest: 'SEVEN × ONE HUNDRED',
  }[currentPhase]

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[1.25rem] border"
      style={{
        backgroundColor: 'var(--ed-bg)',
        borderColor: 'var(--ed-rule)',
      }}
      aria-label="Animated visualization of Quran 2:261: one grain grows into a plant with seven ears, each containing one hundred grains, producing seven hundred grains."
    >
      <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundColor: 'var(--ed-accent)', opacity: 0.5 }} />

      <div className="flex items-center justify-between gap-4 px-5 pt-4 sm:px-7 sm:pt-5">
        <div className="min-w-0">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            The agricultural analogy
          </div>
          <div
            ref={labelRef}
            className="mt-1 text-xs font-medium tracking-wide text-[var(--ed-accent)]"
            style={{ fontFamily: F.mono }}
          >
            {phaseLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={runAnimation}
          disabled={playing || reducedMotion}
          aria-label="Replay the growth animation"
          title="Replay animation"
          className="shrink-0 rounded-full border p-2 text-[var(--ed-fg-muted)] transition-colors hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)] disabled:cursor-default disabled:opacity-35"
          style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)' }}
        >
          <RotateCcw size={13} className={playing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="relative px-2 sm:px-5">
        <svg
          viewBox="0 0 920 500"
          className="block h-auto w-full select-none"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`${uid}-halo`} cx="50%" cy="46%" r="50%">
              <stop offset="0%" stopColor="var(--ed-accent)" stopOpacity="0.14" />
              <stop offset="55%" stopColor="var(--ed-accent)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="var(--ed-accent)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uid}-stem`} x1="0" y1="1" x2="0.8" y2="0">
              <stop offset="0%" stopColor="var(--ed-rule)" />
              <stop offset="42%" stopColor="var(--ed-accent)" stopOpacity="0.72" />
              <stop offset="100%" stopColor="var(--ed-fg)" stopOpacity="0.82" />
            </linearGradient>
            <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            {/* A stylised wheat kernel with a subtle ventral crease */}
            <g id={`${uid}-kernel`}>
              <path
                d="M 0 -6.5 C 3 -4.2, 3.4 1.2, 0 7 C -3.4 1.2, -3 -4.2, 0 -6.5 Z"
                fill="var(--ed-accent)"
              />
              <path
                d="M 0 -4 Q 0.6 0.5, 0 5"
                stroke="var(--ed-bg)"
                strokeWidth="0.5"
                fill="none"
                opacity="0.35"
              />
            </g>
          </defs>

          <circle cx="460" cy="224" r="230" fill={`url(#${uid}-halo)`} />

          {/* Harvest glow — breathes after the animation resolves */}
          <circle
            ref={finalGlowRef}
            cx="460"
            cy="224"
            r="0"
            fill="var(--ed-accent)"
            filter={`url(#${uid}-soft)`}
            opacity="0"
          />

          {/* Ground plane with subtle shadow that grows with the plant */}
          <ellipse
            ref={shadowRef}
            cx="460"
            cy="380"
            rx="0"
            ry="0"
            fill="var(--ed-fg-muted)"
            opacity="0"
          />
          <path
            d="M 238 378 C 320 372, 392 377, 460 374 C 534 371, 616 377, 682 379"
            fill="none"
            stroke="var(--ed-rule)"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 292 382 C 354 388, 406 385, 460 388 C 514 390, 574 385, 632 383"
            fill="none"
            stroke="var(--ed-rule)"
            strokeWidth="0.6"
            strokeDasharray="2 5"
            opacity="0.4"
          />

          {/* Seed — shaped like an actual grain of wheat */}
          <g ref={seedRef} style={{ opacity: 0, transformOrigin: 'center' }}>
            <ellipse
              cx="460"
              cy="374"
              rx="9"
              ry="5.5"
              fill="var(--ed-accent)"
              transform="rotate(-14 460 374)"
            />
            <ellipse
              cx="460"
              cy="374"
              rx="5.5"
              ry="3"
              fill="none"
              stroke="var(--ed-fg)"
              strokeWidth="0.5"
              opacity="0.25"
              transform="rotate(-14 460 374)"
            />
            <line
              x1="460"
              y1="370"
              x2="460"
              y2="378"
              stroke="var(--ed-bg)"
              strokeWidth="0.7"
              opacity="0.35"
              transform="rotate(-14 460 374)"
            />
          </g>
          <circle ref={germRef} cx="460" cy="374" r="2" fill="none" stroke="var(--ed-accent)" strokeWidth="1" opacity="0" />

          {/* Roots — six delicate filaments reaching into the soil */}
          <g>
            {[
              'M 460 374 C 448 386, 436 396, 414 406 C 402 412, 390 418, 378 424',
              'M 460 374 C 452 390, 446 404, 438 422',
              'M 460 374 C 458 394, 456 412, 458 434',
              'M 460 374 C 464 392, 468 408, 474 426',
              'M 460 374 C 470 386, 482 396, 498 406 C 510 412, 524 418, 538 424',
              'M 460 374 C 468 382, 478 390, 490 398',
            ].map((d, index) => (
              <path
                key={`root-${index}`}
                ref={(node) => {
                  if (node) rootsRef.current[index] = node
                }}
                d={d}
                fill="none"
                stroke="var(--ed-rule)"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0"
              />
            ))}
          </g>

          {/* The living plant: everything inside this group sways gently after growth */}
          <g ref={plantGroupRef}>
            {/* Culm — one continuous, slightly sinuous stem */}
            <path
              ref={stemRef}
              d="M 460 374 C 457 342, 463 300, 461 250 C 460 232, 459 220, 460 209"
              fill="none"
              stroke={`url(#${uid}-stem)`}
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity={reducedMotion ? 1 : 0}
            />

            {/* Leaves — blade-like, each with its own gesture */}
            {[
              'M 460 336 C 424 326, 384 330, 344 354',
              'M 460 300 C 498 288, 542 294, 588 322',
              'M 460 270 C 428 258, 396 256, 366 270',
              'M 460 318 C 492 308, 532 314, 572 338',
            ].map((d, index) => (
              <path
                key={`leaf-${index}`}
                ref={(node) => {
                  if (node) leafRef.current[index] = node
                }}
                d={d}
                fill="none"
                stroke="var(--ed-accent)"
                strokeWidth={index === 2 ? 1.3 : 1.6}
                strokeLinecap="round"
                opacity="0"
              />
            ))}

            {/* Nodes — slight swellings where leaves meet the stem */}
            {[
              { cx: 460, cy: 336 },
              { cx: 460, cy: 300 },
              { cx: 460, cy: 270 },
              { cx: 460, cy: 318 },
            ].map((node, index) => (
              <circle
                key={`node-${index}`}
                ref={(el) => {
                  if (el) nodeRef.current[index] = el
                }}
                cx={node.cx}
                cy={node.cy}
                r="3"
                fill="var(--ed-bg)"
                stroke="var(--ed-accent)"
                strokeWidth="1"
                opacity="0"
              />
            ))}

            {/* Seven ears. Each rachis carries 100 kernels arranged in two distinct rows. */}
            {ears.map((ear) => (
              <g key={`ear-${ear.index}`}>
                <path
                  ref={(node) => {
                    if (node) earRef.current[ear.index] = node
                  }}
                  d={ear.d}
                  fill="none"
                  stroke="var(--ed-accent)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0"
                />

                <g
                  ref={(node) => {
                    if (node) kernelGroupRef.current[ear.index] = node
                  }}
                >
                  {ear.kernels.map((kernel) => (
                    <use
                      key={kernel.id}
                      href={`#${uid}-kernel`}
                      transform={`translate(${kernel.cx} ${kernel.cy}) rotate(${kernel.rotation}) scale(${kernel.scale})`}
                      opacity="0"
                    />
                  ))}
                </g>

                <g
                  ref={(node) => {
                    if (node) awnGroupRef.current[ear.index] = node
                  }}
                  stroke="var(--ed-fg-muted)"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity="0"
                >
                  {ear.awns.map((awn, index) => (
                    <line
                      key={`awn-${ear.index}-${index}`}
                      x1={awn.x1}
                      y1={awn.y1}
                      x2={awn.x2}
                      y2={awn.y2}
                    />
                  ))}
                </g>
              </g>
            ))}
          </g>

          {/* Final expansion — fine rays suggesting abundance beyond measure */}
          <g ref={burstRef} opacity="0">
            {Array.from({ length: 20 }, (_, index) => {
              const angle = (index / 20) * Math.PI * 2
              const r1 = 172 + (index % 3) * 8
              const r2 = r1 + 18 + (index % 5) * 4
              return (
                <line
                  key={`ray-${index}`}
                  x1={round(460 + Math.cos(angle) * r1, 2)}
                  y1={round(224 + Math.sin(angle) * r1, 2)}
                  x2={round(460 + Math.cos(angle) * r2, 2)}
                  y2={round(224 + Math.sin(angle) * r2, 2)}
                  stroke="var(--ed-accent)"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              )
            })}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center sm:bottom-6">
          <div className="text-center">
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.glacial }}
            >
              Seven ears × one hundred grains
            </div>
            <div
              ref={finalNumberRef}
              className="mt-1 translate-y-2 scale-95 text-3xl font-normal tracking-tight text-[var(--ed-fg)] opacity-0 sm:text-4xl"
              style={{ fontFamily: F.display }}
            >
              <span>{finalDisplay}</span>{' '}
              <span className="text-base text-[var(--ed-fg-muted)] sm:text-lg">grains</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-4 border-t px-5 py-3 sm:px-7"
        style={{ borderColor: 'var(--ed-rule)' }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.glacial }}
        >
          1 grain → 7 ears → 700 grains
        </span>
        <span
          className="text-[10px] font-mono text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.mono }}
        >
          2:261
        </span>
      </div>
    </div>
  )
}
