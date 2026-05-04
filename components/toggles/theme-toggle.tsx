'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const prevThemeRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const el = ref.current
    if (!el) return
    if (prevThemeRef.current === undefined) {
      gsap.set(el, { rotate: 0, opacity: 1 })
    } else {
      gsap.fromTo(
        el,
        { rotate: -180, opacity: 0 },
        { rotate: 0, opacity: 1, duration: 0.2, ease: 'power2.inOut' },
      )
    }
    prevThemeRef.current = theme
  }, [theme, mounted])

  if (!mounted) {
    return <div className="h-9 w-9 flex items-center justify-center rounded-md" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
    >
      <div ref={ref} key={theme}>
        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      </div>
    </button>
  )
}
