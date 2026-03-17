import { create } from 'zustand'
import type { components } from '@/src/api/types.gen'

export type LanguageEntry = components['schemas']['LanguageEntry']

type LanguagesStore = {
  languages: LanguageEntry[]
  init: (langs: LanguageEntry[]) => void
  isRtl: (code: string) => boolean
  getDirection: (code: string) => 'ltr' | 'rtl'
}

export const useLanguagesStore = create<LanguagesStore>((set, get) => ({
  languages: [],
  init: (langs) => set({ languages: langs }),
  isRtl: (code) => {
    const lang = get().languages.find((l) => l.code === code)
    return lang?.direction === 'rtl'
  },
  getDirection: (code) => {
    const lang = get().languages.find((l) => l.code === code)
    return lang?.direction ?? 'ltr'
  },
}))
