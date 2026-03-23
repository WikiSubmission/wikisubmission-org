import { create } from 'zustand'
import type { components } from '@/src/api/types.gen'

type Chapter = components['schemas']['Chapter']
type Appendix = components['schemas']['Appendix']

interface QuranNavStore {
  chapters: Chapter[]
  appendices: Appendix[]
  init(chapters: Chapter[], appendices: Appendix[]): void
}

export const useQuranNavStore = create<QuranNavStore>((set) => ({
  chapters: [],
  appendices: [],
  init: (chapters, appendices) => set({ chapters, appendices }),
}))
