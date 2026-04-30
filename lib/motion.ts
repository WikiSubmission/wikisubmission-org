import { useInView, Variants } from 'framer-motion'
import { useRef } from 'react'

/**
 * Shared Framer Motion variants for consistent animations across the site.
 */

export const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100
    }
  }
}

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const SCALE_IN: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100
    }
  }
}

/**
 * Hook to trigger animations when an element enters the viewport.
 */
export function useScrollAnimation(threshold = 0.2) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    margin: `-${threshold * 100}% 0px` as any
  })
  
  return { ref, isInView }
}
