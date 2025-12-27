import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createJSONStorage } from "zustand/middleware"

export type NavigationEntry =
    | { type: 'chapter'; chapter: number }
    | { type: 'verse'; chapter: number; verse: number }
    | { type: 'query'; query: string };

export type QuranMetrics = {
    recentlyNavigated: NavigationEntry[];
    addNavigation: (entry: NavigationEntry) => void;
    clearHistory: () => void;
}

export const useQuranMetrics = create(persist<QuranMetrics>((set) => ({
    recentlyNavigated: [],
    addNavigation: (entry: NavigationEntry) => set((state) => {
        const lastEntry = state.recentlyNavigated[state.recentlyNavigated.length - 1];

        // Don't add if it's the same as the last entry (avoid consecutive duplicates)
        if (lastEntry) {
            if (entry.type === 'chapter' && lastEntry.type === 'chapter' && lastEntry.chapter === entry.chapter) {
                return state;
            }
            if (entry.type === 'verse' && lastEntry.type === 'verse' &&
                lastEntry.chapter === entry.chapter && lastEntry.verse === entry.verse) {
                return state;
            }
            if (entry.type === 'query' && lastEntry.type === 'query' && lastEntry.query === entry.query) {
                return state;
            }
        }

        // Keep only the last 10 entries
        const newHistory = [...state.recentlyNavigated, entry].slice(-6);
        return { recentlyNavigated: newHistory };
    }),
    clearHistory: () => set({ recentlyNavigated: [] }),
}), {
    name: "quran-metrics",
    storage: createJSONStorage(() => localStorage),
}))