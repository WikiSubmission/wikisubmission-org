import { Language } from 'wikisubmission-sdk';
import { create } from 'zustand'

export type QuranPreferences = {
    text: boolean;
    subtitles: boolean;
    footnotes: boolean;
    arabic: boolean;
    wordByWord: boolean;
    primaryLanguage: Language;
    secondaryLanguage?: Language;
    setPreferences: (preferences: QuranPreferences) => void;
}

export const useQuranPreferences = create<QuranPreferences>((set) => ({
    text: true,
    subtitles: true,
    footnotes: true,
    arabic: true,
    wordByWord: true,
    primaryLanguage: "english",
    secondaryLanguage: undefined,
    setPreferences: (preferences: QuranPreferences) => set(preferences),
}))