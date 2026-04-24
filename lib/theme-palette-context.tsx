'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type PaletteKey = 'ink' | 'violet' | 'mono'

export const PALETTE_STORAGE_KEY = 'ws-palette'
export const DEFAULT_PALETTE: PaletteKey = 'ink'
export const PALETTES: Record<
  PaletteKey,
  {
    label: string
    light: { bg: string; fg: string; accent: string; rule: string }
    dark: { bg: string; fg: string; accent: string; rule: string }
  }
> = {
  ink: {
    label: 'Ink on Parchment',
    light: { bg: '#f6f2ea', fg: '#1a1715', accent: '#6b3410', rule: '#d9cfb9' },
    dark: { bg: '#14110e', fg: '#eee4d0', accent: '#d4a373', rule: '#2a241e' },
  },
  violet: {
    label: 'Sharpened Violet',
    light: { bg: '#fafafa', fg: '#121214', accent: '#5a1fd4', rule: '#e5e5ea' },
    dark: { bg: '#0c0c0e', fg: '#f4f4f5', accent: '#b48cff', rule: '#27272c' },
  },
  mono: {
    label: 'Monochrome',
    light: { bg: '#f4f4f2', fg: '#0e0e0d', accent: '#0e0e0d', rule: '#d8d8d4' },
    dark: { bg: '#0a0a09', fg: '#f1f1ec', accent: '#f1f1ec', rule: '#23231f' },
  },
}

interface PaletteContextValue {
  palette: PaletteKey
  setPalette: (p: PaletteKey) => void
}

const PaletteContext = createContext<PaletteContextValue | null>(null)

function isPaletteKey(value: string | null): value is PaletteKey {
  return value === 'ink' || value === 'violet' || value === 'mono'
}

function readStoredPalette(): PaletteKey {
  if (typeof window === 'undefined') return DEFAULT_PALETTE
  try {
    const raw = window.localStorage.getItem(PALETTE_STORAGE_KEY)
    return isPaletteKey(raw) ? raw : DEFAULT_PALETTE
  } catch {
    return DEFAULT_PALETTE
  }
}

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteKey>(DEFAULT_PALETTE)

  useEffect(() => {
    const stored = readStoredPalette()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaletteState(stored)
    document.documentElement.dataset.palette = stored
  }, [])

  const setPalette = useCallback((next: PaletteKey) => {
    setPaletteState(next)
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, next)
    } catch {
      // storage unavailable — ignore
    }
    document.documentElement.dataset.palette = next
  }, [])

  const value = useMemo(() => ({ palette, setPalette }), [palette, setPalette])

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  )
}

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext)
  if (!ctx) {
    throw new Error('usePalette must be used within PaletteProvider')
  }
  return ctx
}

export const PALETTE_INIT_SCRIPT = `(function(){try{var k='${PALETTE_STORAGE_KEY}';var v=localStorage.getItem(k);if(v==='ink'||v==='violet'||v==='mono'){document.documentElement.setAttribute('data-palette',v);}else{document.documentElement.setAttribute('data-palette','${DEFAULT_PALETTE}');}}catch(e){document.documentElement.setAttribute('data-palette','${DEFAULT_PALETTE}');}})();`
