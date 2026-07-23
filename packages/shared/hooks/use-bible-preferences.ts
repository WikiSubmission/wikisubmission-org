import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ZoomLevel } from '@/lib/quran-zoom'

export type BibleDisplayMode = 'verse' | 'reading'

export type BiblePreferences = {
  displayMode: BibleDisplayMode
  /** Show the `f` field — manuscript / textual footnotes */
  manuscriptFootnotes: boolean
  /** Show the `fn` field — theological commentary footnotes */
  theologicalFootnotes: boolean
  /** UI language. English is the only option for now. */
  language: 'en'
  zoomLevel: ZoomLevel
  setPreferences: (prefs: BiblePreferences) => void
}

export const useBiblePreferences = create(
  persist<BiblePreferences>(
    (set) => ({
      displayMode: 'verse',
      manuscriptFootnotes: true,
      theologicalFootnotes: true,
      language: 'en',
      zoomLevel: 'comfortable',
      setPreferences: (prefs) => set(prefs),
    }),
    {
      name: 'bible-preferences-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
