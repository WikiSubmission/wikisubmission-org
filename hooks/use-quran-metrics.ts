import { QueryType } from "wikisubmission-sdk";
import { QueryResultMetadata } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createJSONStorage } from "zustand/middleware"

export type QuranMetrics = {
    lastChapter: number;
    lastQueryType?: QueryType;
    lastQueryMetadata?: QueryResultMetadata;
    setMetrics: (metrics: QuranMetrics) => void;
}

export const useQuranMetrics = create(persist<QuranMetrics>((set) => ({
    lastChapter: 1,
    lastQueryType: undefined,
    lastQueryMetadata: undefined,
    setMetrics: (metrics: QuranMetrics) => set(metrics),
}), {
    name: "quran-metrics",
    storage: createJSONStorage(() => localStorage),
}))