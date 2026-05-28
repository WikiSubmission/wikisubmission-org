'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Trash2 } from 'lucide-react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import '@blocknote/react/style.css'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUpsertNote, useDeleteNote } from '@/hooks/use-notes'
import type { NoteData } from '@/types/bookmarks'

export function NoteEditorDialog({
  note,
  verseKey,
  scripture,
  open,
  onOpenChange,
}: {
  note: NoteData | null
  verseKey: string
  scripture: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const editor = useCreateBlockNote()
  const { resolvedTheme } = useTheme()
  const blockNoteTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const { mutateAsync: upsert, isPending: saving } = useUpsertNote(scripture)
  const { mutate: remove, isPending: deleting } = useDeleteNote(scripture)
  const [changeNonce, setChangeNonce] = useState(0)
  const [saveState, setSaveState] = useState<
    'saved' | 'unsaved' | 'saving' | 'error'
  >('saved')
  const lastSavedRef = useRef('')
  const loadingRef = useRef(false)
  const saveSeqRef = useRef(0)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const initialContent = note?.content ?? ''
    async function load() {
      loadingRef.current = true
      const blocks = initialContent
        ? await editor.tryParseMarkdownToBlocks(initialContent)
        : [{ type: 'paragraph' as const, content: [] }]
      if (!cancelled) editor.replaceBlocks(editor.document, blocks)
      if (!cancelled) {
        lastSavedRef.current = initialContent.trim()
        setSaveState('saved')
      }
      loadingRef.current = false
    }
    void load()
    return () => {
      cancelled = true
      loadingRef.current = false
    }
  }, [open, editor, note?.content])

  const persistCurrent = useCallback(async (): Promise<boolean> => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document)
    const nextContent = markdown.trim()
    if (nextContent === lastSavedRef.current) {
      setSaveState('saved')
      return true
    }
    const seq = ++saveSeqRef.current
    setSaveState('saving')
    try {
      await upsert({ verseKey, content: nextContent })
      lastSavedRef.current = nextContent
      if (seq === saveSeqRef.current) setSaveState('saved')
      return true
    } catch {
      if (seq === saveSeqRef.current) setSaveState('error')
      return false
    }
  }, [editor, upsert, verseKey])

  useEffect(() => {
    if (!open || loadingRef.current || saveState === 'saving') return
    if (saveState !== 'unsaved') return
    const timer = window.setTimeout(() => {
      void persistCurrent()
    }, 900)
    return () => window.clearTimeout(timer)
  }, [changeNonce, open, persistCurrent, saveState])

  async function handleSave() {
    const ok = await persistCurrent()
    if (ok) onOpenChange(false)
  }

  function handleDelete() {
    if (!note) return
    remove({ id: note.id, verseKey }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex flex-col gap-0 p-0 overflow-hidden
          w-[98vw] max-w-[98vw]
          h-[94vh] max-h-[94vh]
          sm:w-[96vw] sm:max-w-[96vw]
          sm:h-[92vh] sm:max-h-[92vh]
          rounded-lg sm:rounded-xl
        "
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
              Note
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="font-mono text-sm">{verseKey}</span>
          </DialogTitle>
        </DialogHeader>
        <div
          className="
            flex-1 overflow-y-auto
            px-2.5 sm:px-5 py-3
            min-h-[360px] sm:min-h-[560px]
            bn-themed
          "
          onKeyDownCapture={(e) => {
            if (
              e.key === 'Enter' &&
              typeof window !== 'undefined' &&
              window.matchMedia('(pointer: coarse)').matches
            ) {
              e.preventDefault()
              e.stopPropagation()
              handleSave()
            }
          }}
        >
          <BlockNoteView
            editor={editor}
            theme={blockNoteTheme}
            onChange={() => {
              if (!open || loadingRef.current) return
              setSaveState('unsaved')
              setChangeNonce((v) => v + 1)
            }}
          />
        </div>
        <DialogFooter className="px-5 py-3 border-t flex flex-row items-center gap-2 shrink-0">
          <div
            aria-live="polite"
            className="mr-auto text-xs text-muted-foreground"
          >
            {saveState === 'saving'
              ? 'Saving...'
              : saveState === 'error'
                ? 'Save failed'
                : saveState === 'unsaved'
                  ? 'Unsaved changes'
                  : 'Saved'}
          </div>
          {note && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {note ? 'Save' : 'Add note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
