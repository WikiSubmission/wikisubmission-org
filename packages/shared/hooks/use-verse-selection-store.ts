import { create } from 'zustand'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

/**
 * Non-persistent session store for the multi-select "copy group" flow.
 *
 * - Entered by long-pressing (touch) or shift-clicking (desktop) a verse card.
 * - Exited with Cancel, Escape, chapter/route change, or when the selection
 *   set becomes empty.
 *
 * We keep the full `VerseData` alongside each selected key so the floating
 * copy bar can assemble output for verses that have since scrolled out of the
 * virtual list and unmounted.
 */
interface VerseSelectionState {
  active: boolean
  selected: Set<string>
  verses: Map<string, VerseData>
  /** Start selection mode if inactive, and seed with one verse. */
  activate: (verse: VerseData) => void
  /** Toggle a verse's membership. If the set empties, exits selection mode. */
  toggle: (verse: VerseData) => void
  /** Exit selection mode and clear the set. */
  clear: () => void
  /** Snapshot of selected verses in verse-key order (chapter → verse numeric). */
  ordered: () => VerseData[]
}

function compareVerseKey(a: string, b: string): number {
  const [ac, av] = a.split(':').map(Number)
  const [bc, bv] = b.split(':').map(Number)
  if (ac !== bc) return (ac ?? 0) - (bc ?? 0)
  return (av ?? 0) - (bv ?? 0)
}

export const useVerseSelection = create<VerseSelectionState>((set, get) => ({
  active: false,
  selected: new Set<string>(),
  verses: new Map<string, VerseData>(),

  activate: (verse) => {
    const vk = verse.vk ?? ''
    if (!vk) return
    set((s) => {
      const selected = new Set(s.selected)
      selected.add(vk)
      const verses = new Map(s.verses)
      verses.set(vk, verse)
      return { active: true, selected, verses }
    })
  },

  toggle: (verse) => {
    const vk = verse.vk ?? ''
    if (!vk) return
    set((s) => {
      const selected = new Set(s.selected)
      const verses = new Map(s.verses)
      if (selected.has(vk)) {
        selected.delete(vk)
        verses.delete(vk)
      } else {
        selected.add(vk)
        verses.set(vk, verse)
      }
      const active = selected.size > 0
      return { active, selected, verses }
    })
  },

  clear: () => {
    set({ active: false, selected: new Set(), verses: new Map() })
  },

  ordered: () => {
    const { selected, verses } = get()
    return [...selected]
      .sort(compareVerseKey)
      .map((vk) => verses.get(vk))
      .filter((v): v is VerseData => !!v)
  },
}))
