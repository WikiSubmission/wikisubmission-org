'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * The answers collected by the copy-by-reference tree, one question at a time.
 *
 * `null` means "not answered yet" and is what drives the current step; the
 * string `'none'` is a real answer that leaves that part out. Keeping the two
 * apart is what lets a step be walked back into rather than re-asked from the
 * start.
 */
export interface CopyDraft {
  /** Normalized reference string, e.g. `2:255` or `1:1-7,3:18`. */
  refs: string | null
  granularity: 'full' | 'wbw' | null
  arabic: 'yes' | 'no' | null
  /** Translation language code, or `'none'`. */
  primary: string | null
  /** Second translation language code, or `'none'`. */
  secondary: string | null
}

/** What the finished tree copies. */
export type CopyOutput = 'text' | 'table' | 'image'

/** A completed set of answers, kept so the next reference can reuse it. */
export interface CopyRecipe {
  granularity: 'full' | 'wbw'
  arabic: 'yes' | 'no'
  primary: string
  secondary: string
  output: CopyOutput
}

/** The question the tree is currently on. Derived from the draft, never stored. */
export type CopyStep = 'ref' | 'granularity' | 'arabic' | 'translation' | 'extra' | 'output'

interface CopyDraftStore extends CopyDraft {
  /**
   * The last set of answers that produced a copy, surviving reloads.
   *
   * Someone pulling ten references for a study note answers the same five
   * questions ten times otherwise, so the reference step offers this as a
   * one-keystroke repeat.
   */
  recent: CopyRecipe | null
  choose(answer: Partial<CopyDraft>): void
  remember(recipe: CopyRecipe): void
  /** Undoes the most recent answer. False when there is nothing left to undo. */
  stepBack(): boolean
  reset(): void
}

const EMPTY: CopyDraft = {
  refs: null,
  granularity: null,
  arabic: null,
  primary: null,
  secondary: null,
}

/** Answer order, which is also the order `stepBack` unwinds. */
const FIELDS = ['refs', 'granularity', 'arabic', 'primary', 'secondary'] as const

export function selectCopyStep(draft: CopyDraft): CopyStep {
  if (!draft.refs) return 'ref'
  if (!draft.granularity) return 'granularity'
  if (!draft.arabic) return 'arabic'
  if (!draft.primary) return 'translation'
  if (!draft.secondary) return 'extra'
  return 'output'
}

/** The answers as a recipe, or null while any of them is still open. */
export function draftRecipe(draft: CopyDraft, output: CopyOutput): CopyRecipe | null {
  if (!draft.granularity || !draft.arabic || !draft.primary || !draft.secondary) return null
  return {
    granularity: draft.granularity,
    arabic: draft.arabic,
    primary: draft.primary,
    secondary: draft.secondary,
    output,
  }
}

export const useCopyDraft = create<CopyDraftStore>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      recent: null,
      choose: (answer) => set(answer),
      remember: (recipe) => set({ recent: recipe }),
      stepBack: () => {
        const state = get()
        for (let i = FIELDS.length - 1; i >= 0; i--) {
          const field = FIELDS[i]!
          if (state[field] !== null) {
            set({ [field]: null } as Partial<CopyDraft>)
            return true
          }
        }
        return false
      },
      reset: () => set(EMPTY),
    }),
    {
      name: 'ws-copy-recipe-v1',
      storage: createJSONStorage(() => localStorage),
      // The draft is per-visit and always starts empty; only the recipe is worth
      // carrying across sessions.
      partialize: (state) => ({ recent: state.recent }) as CopyDraftStore,
    },
  ),
)
