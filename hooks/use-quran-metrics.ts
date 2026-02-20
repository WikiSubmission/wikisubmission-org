import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'

export type NavigationEntry =
  | { type: 'chapter'; chapter: number }
  | { type: 'verse'; chapter: number; verse: number }
  | { type: 'query'; query: string }

export type QuranMetrics = {
  recentlyNavigated: NavigationEntry[]
  addNavigation: (entry: NavigationEntry) => void
  clearHistory: () => void
}

export const useQuranMetrics = create(
  persist<QuranMetrics>(
    (set) => ({
      recentlyNavigated: [],
      addNavigation: (entry: NavigationEntry) =>
        set((state) => {
          // Filter out any existing entry that matches the new one to avoid duplicates
          // and move the item to the "most recent" position.
          const filteredHistory = state.recentlyNavigated.filter((item) => {
            if (item.type !== entry.type) return true
            if (item.type === 'chapter' && entry.type === 'chapter') {
              return item.chapter !== entry.chapter
            }
            if (item.type === 'verse' && entry.type === 'verse') {
              return (
                item.chapter !== entry.chapter || item.verse !== entry.verse
              )
            }
            if (item.type === 'query' && entry.type === 'query') {
              return item.query !== entry.query
            }
            return true
          })

          const newHistory = [...filteredHistory, entry].slice(-4)
          return { recentlyNavigated: newHistory }
        }),
      clearHistory: () => set({ recentlyNavigated: [] }),
    }),
    {
      name: 'quran-metrics',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
