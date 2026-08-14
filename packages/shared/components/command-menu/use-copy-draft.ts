'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CopyOutput, CopyRecipe } from '@/lib/copy-command'

/**
 * The answers collected by the copy-by-reference tree, one question at a time.
 *
 * `null` means "not answered yet" and is what drives the current step; the
 * string `'none'` is a real answer that leaves that part out. Keeping the two
 * apart is what lets a step be walked back into rather than re-asked from the
 * start, and lets a typed one-liner pre-answer some steps and leave the rest.
 */
export interface CopyDraft {
  /** Normalized reference string, e.g. `2:255` or `1:1-7, 3:18`. */
  refs: string | null
  granularity: 'full' | 'wbw' | null
  arabic: 'yes' | 'no' | null
  /** Translation language code, or `'none'`. */
  primary: string | null
  /** Second translation language code, or `'none'`. */
  secondary: string | null
}

/** The question the tree is currently on. Derived from the draft, never stored. */
export type CopyStep = 'ref' | 'granularity' | 'arabic' | 'translation' | 'extra' | 'output'

interface CopyDraftStore extends CopyDraft {
  /**
   * The last command that produced a copy, surviving reloads.
   *
   * Someone pulling ten references for a study note answers the same questions
   * ten times otherwise, so the reference step pre-fills this as a line with the
   * reference selected: type the next one over it and the options carry.
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

/** The answers as a command, or null while any of them is still open. */
export function draftRecipe(draft: CopyDraft, output: CopyOutput): CopyRecipe | null {
  if (!draft.refs || !draft.granularity || !draft.arabic || !draft.primary || !draft.secondary) {
    return null
  }
  return {
    refs: draft.refs,
    granularity: draft.granularity,
    arabic: draft.arabic,
    primary: draft.primary,
    secondary: draft.secondary,
    output,
    footnotes: 'default',
    subtitles: 'default',
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
      version: 1,
      // v0 stored the options without the reference they were used with, which
      // the pre-filled command line needs. There is nothing to salvage in half a
      // command, so the next copy starts it over.
      migrate: (state, version) =>
        version < 1 ? { ...(state as CopyDraftStore), recent: null } : (state as CopyDraftStore),
      // The draft is per-visit and always starts empty; only the last command is
      // worth carrying across sessions.
      partialize: (state) => ({ recent: state.recent }) as CopyDraftStore,
    },
  ),
)
