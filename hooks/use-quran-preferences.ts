import { Language } from 'wikisubmission-sdk';
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type QuranPreferences = {
    arabic: boolean;
    subtitles: boolean;
    footnotes: boolean;
    transliteration: boolean;
    text: boolean;
    wordByWord: boolean;
    primaryLanguage: Language;
    secondaryLanguage?: Language;
    setPreferences: (preferences: QuranPreferences) => void;
}

export const useQuranPreferences = create(persist<QuranPreferences>((set) => ({
    arabic: true,
    subtitles: true,
    footnotes: true,
    transliteration: false,
    text: true,
    wordByWord: false,
    primaryLanguage: "english",
    secondaryLanguage: undefined,
    setPreferences: (preferences: QuranPreferences) => set(preferences),
}), {
    name: "quran-preferences",
    storage: createJSONStorage(() => localStorage),
}))