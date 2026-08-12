'use client'

import { create } from 'zustand'
import type { CommandPageId } from './types'

interface CommandMenuStore {
  /** The user's intent. The dialog stays mounted past `false` to play its exit tween. */
  open: boolean
  /** Active sub-page, or null for the root list. */
  page: CommandPageId | null
  query: string
  openMenu(initialQuery?: string): void
  close(): void
  toggle(): void
  setQuery(query: string): void
  setPage(page: CommandPageId | null): void
  /** Leaves the current sub-page, clearing its query. */
  back(): void
}

export const useCommandMenu = create<CommandMenuStore>((set) => ({
  open: false,
  page: null,
  query: '',
  openMenu: (initialQuery = '') => set({ open: true, query: initialQuery, page: null }),
  // The query survives close so reopening resumes where the user left off; it is
  // cleared on the next open instead.
  close: () => set({ open: false, page: null }),
  toggle: () => set((s) => (s.open ? { open: false, page: null } : { open: true, query: '', page: null })),
  setQuery: (query) => set({ query }),
  setPage: (page) => set({ page, query: '' }),
  back: () => set({ page: null, query: '' }),
}))
