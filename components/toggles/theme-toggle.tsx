'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9 flex items-center justify-center border rounded-md" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative h-9 w-9 flex items-center justify-center border rounded-md"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 0, opacity: 0, rotate: -180 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 0, opacity: 0, rotate: 270 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
