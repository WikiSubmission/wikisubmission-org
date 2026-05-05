'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react'
import gsap from 'gsap'

const isClient = typeof window !== 'undefined'

let gsapDefaultsApplied = false
function applyGsapDefaults() {
  if (!isClient || gsapDefaultsApplied) return
  gsapDefaultsApplied = true
  gsap.defaults({ ease: 'power3.out', duration: 0.6 })
}

if (isClient) applyGsapDefaults()

type GsapRef<T extends HTMLElement = HTMLElement> = React.RefObject<T | null>

type EnterOptions = {
  delay?: number
  distance?: number
  duration?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

function useIntersectionTrigger<T extends HTMLElement>(
  ref: GsapRef<T>,
  callback: (visible: boolean) => void,
  {
    once = true,
    threshold = 0.2,
    rootMargin = '0px 0px -10% 0px',
    enabled = true,
  }: { once?: boolean; threshold?: number; rootMargin?: string; enabled?: boolean } = {},
) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!isClient || !enabled) return
    const el = ref.current
    if (!el) return

    let triggered = false
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            callbackRef.current(true)
            triggered = true
            if (once) {
              observer.disconnect()
              return
            }
          } else if (!once && triggered) {
            callbackRef.current(false)
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, once, threshold, rootMargin, enabled])
}

export function useScrollAnimation(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useIntersectionTrigger(
    ref,
    (visible) => {
      if (visible) setIsInView(true)
    },
    { once: true, threshold, rootMargin: `-${threshold * 100}% 0px` },
  )

  return { ref, isInView }
}

export function useGsapFadeUp<T extends HTMLElement>(ref: GsapRef<T>, opts: EnterOptions = {}) {
  const {
    delay = 0,
    distance = 24,
    duration,
    once = true,
    threshold = 0.15,
    rootMargin,
    enabled = true,
  } = opts

  useIntersectionTrigger(
    ref,
    (visible) => {
      const el = ref.current
      if (!el || !visible) return
      gsap.fromTo(
        el,
        { opacity: 0, y: distance },
        { opacity: 1, y: 0, delay, duration, overwrite: 'auto' },
      )
    },
    { once, threshold, rootMargin, enabled },
  )
}

type StaggerOptions = EnterOptions & {
  selector?: string
  stagger?: number
  childDelay?: number
}

export function useGsapStagger<T extends HTMLElement>(
  parentRef: GsapRef<T>,
  opts: StaggerOptions = {},
) {
  const {
    selector = ':scope > *',
    stagger = 0.1,
    distance = 20,
    delay = 0,
    childDelay = 0.1,
    duration,
    once = true,
    threshold = 0.15,
    rootMargin,
    enabled = true,
  } = opts

  useIntersectionTrigger(
    parentRef,
    (visible) => {
      const el = parentRef.current
      if (!el || !visible) return
      const children = Array.from(el.querySelectorAll<HTMLElement>(selector))
      if (children.length === 0) return
      gsap.fromTo(
        children,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration,
          delay: delay + childDelay,
          stagger,
          overwrite: 'auto',
        },
      )
    },
    { once, threshold, rootMargin, enabled },
  )
}

export function useGsapScaleIn<T extends HTMLElement>(ref: GsapRef<T>, opts: EnterOptions = {}) {
  const {
    delay = 0,
    duration,
    once = true,
    threshold = 0.15,
    rootMargin,
    enabled = true,
  } = opts

  useIntersectionTrigger(
    ref,
    (visible) => {
      const el = ref.current
      if (!el || !visible) return
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, delay, duration, overwrite: 'auto' },
      )
    },
    { once, threshold, rootMargin, enabled },
  )
}

type FadeUpProps = React.HTMLAttributes<HTMLElement> & {
  as?: ElementType
  delay?: number
  distance?: number
  duration?: number
  once?: boolean
  initiallyHidden?: boolean
}

export const FadeUp = forwardRef<HTMLElement, FadeUpProps>(function FadeUp(
  {
    as = 'div',
    children,
    delay,
    distance = 24,
    duration,
    once = true,
    className,
    style,
    initiallyHidden = true,
    ...rest
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement | null>(null)
  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLElement)

  useGsapFadeUp(innerRef, { delay, distance, duration, once })

  const Component = as as ElementType
  const baseStyle: CSSProperties = initiallyHidden
    ? { opacity: 0, transform: `translateY(${distance}px)`, ...style }
    : style ?? {}

  return (
    <Component
      ref={innerRef as unknown as React.Ref<HTMLElement>}
      className={className}
      style={baseStyle}
      {...rest}
    >
      {children}
    </Component>
  )
})

type StaggerContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: ElementType
  selector?: string
  stagger?: number
  delay?: number
  distance?: number
  duration?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
  hideChildren?: boolean
  childSelector?: string
}

export const StaggerContainer = forwardRef<HTMLElement, StaggerContainerProps>(
  function StaggerContainer(
    {
      as = 'div',
      children,
      selector,
      stagger,
      delay,
      distance = 20,
      duration,
      once = true,
      threshold,
      rootMargin,
      className,
      style,
      hideChildren = true,
      childSelector,
      ...rest
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLElement | null>(null)
    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLElement)

    const effectiveSelector = selector ?? childSelector

    useGsapStagger(innerRef, {
      selector: effectiveSelector,
      stagger,
      delay,
      distance,
      duration,
      once,
      threshold,
      rootMargin,
    })

    useEffect(() => {
      if (!hideChildren) return
      const el = innerRef.current
      if (!el) return
      const childTargets = Array.from(
        el.querySelectorAll<HTMLElement>(effectiveSelector ?? ':scope > *'),
      )
      childTargets.forEach((child) => {
        child.style.opacity = '0'
        child.style.transform = `translateY(${distance}px)`
      })
    }, [hideChildren, effectiveSelector, distance])

    const Component = as as ElementType
    return (
      <Component
        ref={innerRef as unknown as React.Ref<HTMLElement>}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </Component>
    )
  },
)

export function useScrollProgress<T extends HTMLElement>(
  ref: GsapRef<T>,
  callback: (progress: number) => void,
) {
  useEffect(() => {
    if (!isClient) return
    const el = ref.current
    if (!el) return

    let frame = 0
    const cb = callback

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = el.getBoundingClientRect()
        const viewportH = window.innerHeight
        const total = rect.height + viewportH
        const scrolled = viewportH - rect.top
        const progress = Math.min(1, Math.max(0, scrolled / total))
        cb(progress)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref, callback])
}

export function useGsapHover<T extends HTMLElement>(
  ref: GsapRef<T>,
  {
    y = -2,
    duration = 0.25,
    ease = 'power2.out',
  }: { y?: number; duration?: number; ease?: string } = {},
) {
  useEffect(() => {
    if (!isClient) return
    const el = ref.current
    if (!el) return

    const onEnter = () => {
      gsap.to(el, { y, duration, ease, overwrite: 'auto' })
    }
    const onLeave = () => {
      gsap.to(el, { y: 0, duration, ease, overwrite: 'auto' })
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref, y, duration, ease])
}
