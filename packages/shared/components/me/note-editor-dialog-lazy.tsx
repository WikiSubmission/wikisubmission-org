'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { NoteData } from '@/types/bookmarks'

// BlockNote + ProseMirror is the single heaviest dependency in the app
// (~293KB gzipped). The note editor opens at most once per session, yet a
// NoteEditorDialog is rendered inside every VerseCard. Loading it statically
// would ship the whole editor in the core Quran route's initial JS and create
// one BlockNote instance per verse card on mount.
//
// This wrapper defers both costs: the editor chunk is split out via
// next/dynamic (ssr: false) and only fetched the first time a card's dialog is
// opened, and the underlying dialog stays unmounted (no useCreateBlockNote)
// until then.
const NoteEditorDialog = dynamic(
  () => import('./note-editor-dialog').then((m) => m.NoteEditorDialog),
  { ssr: false },
)

type NoteEditorDialogLazyProps = {
  note: NoteData | null
  verseKey: string
  scripture: string
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function NoteEditorDialogLazy(props: NoteEditorDialogLazyProps) {
  // Once opened, keep mounted so close/re-open transitions stay instant.
  // Adjusting state during render (React's sanctioned derived-state pattern)
  // avoids an effect + cascading render just to latch this flag.
  const [hasOpened, setHasOpened] = useState(false)
  if (props.open && !hasOpened) setHasOpened(true)

  if (!hasOpened) return null

  return <NoteEditorDialog {...props} />
}
