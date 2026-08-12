import type { ReactNode } from 'react'

/**
 * Section headings in the menu, in display order. `pages` and `content` are the
 * two site-search tiers; the rest are locally derived.
 */
export type CommandGroupId =
  | 'actions' // verse and reader actions for the current context
  | 'pages' // navigation, from the route manifest (local, instant)
  | 'chapters'
  | 'appendices'
  | 'verses' // Quran hits (local corpus, offline bundle, or backend)
  | 'content' // site catalogue hits (backend, debounced)
  | 'settings' // preference, theme, locale, reciter commands

export const COMMAND_GROUP_ORDER: readonly CommandGroupId[] = [
  'actions',
  'pages',
  'chapters',
  'appendices',
  'verses',
  'content',
  'settings',
]

/** A single row in the menu. */
export interface Command {
  /** Stable across renders; cmdk uses it for selection and it keys the list. */
  id: string
  group: CommandGroupId
  label: string
  /** Secondary line, e.g. a route description or a verse snippet. */
  description?: string
  /**
   * Snippet with matches wrapped in `<b>`, in the same form the backend's
   * `hl` field and `ts_headline` produce. Rendered through the shared
   * highlight splitter, never with dangerouslySetInnerHTML.
   */
  snippet?: string
  icon?: ReactNode
  /** Extra text the matcher should consider (transliterations, aliases, verse keys). */
  keywords?: string[]
  /** Right-aligned hint, e.g. `2:255` or a key combination. */
  hint?: string
  /** Editorial weight, 0..100. Breaks ties between equal text scores. */
  priority?: number
  /**
   * What the row does. `navigate` lets the menu render a real link (middle-click,
   * cmd-click, and prefetch all keep working); `run` is for side effects.
   */
  navigate?: string
  run?: () => void | Promise<void>
  /** Opens a sub-page instead of closing the menu. */
  page?: CommandPageId
  /** Keeps the menu open after `run` resolves, e.g. for a toggle. */
  keepOpen?: boolean
}

/** Sub-pages, entered from a root command and left with Backspace or Escape. */
export type CommandPageId = 'copy-verses' | 'go-to-verse' | 'language' | 'reciter' | 'theme'

export interface CommandContext {
  /** Current route, so context-only commands can gate themselves. */
  pathname: string
  isAuthed: boolean
  /** The verse at the viewport centre, when a reader is mounted. */
  currentVerseKey: string | null
  /** Number of verses in the active multi-select. */
  selectionCount: number
}
