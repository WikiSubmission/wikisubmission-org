import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createJSONStorage } from "zustand/middleware"

export type QuranMetrics = {
    lastChapter: number;
    lastQuery: string;
    setMetrics: (metrics: QuranMetrics) => void;
}

export const useQuranMetrics = create(persist<QuranMetrics>((set) => ({
    lastChapter: 1,
    lastQuery: "",
    setMetrics: (metrics: QuranMetrics) => set(metrics),
}), {
    name: "quran-metrics",
    storage: createJSONStorage(() => localStorage),
}))