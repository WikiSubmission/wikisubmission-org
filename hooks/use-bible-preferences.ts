import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type BibleDisplayMode = 'verse' | 'reading'

export type BiblePreferences = {
  displayMode: BibleDisplayMode
  /** Show the `f` field — manuscript / textual footnotes */
  manuscriptFootnotes: boolean
  /** Show the `fn` field — theological commentary footnotes */
  theologicalFootnotes: boolean
  /** UI language. English is the only option for now. */
  language: 'en'
  setPreferences: (prefs: BiblePreferences) => void
}

export const useBiblePreferences = create(
  persist<BiblePreferences>(
    (set) => ({
      displayMode: 'verse',
      manuscriptFootnotes: true,
      theologicalFootnotes: true,
      language: 'en',
      setPreferences: (prefs) => set(prefs),
    }),
    {
      name: 'bible-preferences-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
