'use client'

import { useState, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { meApi } from '@/src/api/me-client'
import {
  parseQuranRefs,
  parseBibleRefs,
  expandBibleRefs,
} from '@/lib/verse-ref-parser'

type Scripture = 'quran' | 'bible'

interface AddFromReferencesDialogProps {
  collectionId: number
  existingKeys: Set<string>
  open: boolean
  onOpenChange: (v: boolean) => void
}

function Preview({
  scripture,
  input,
  existingKeys,
}: {
  scripture: Scripture
  input: string
  existingKeys: Set<string>
}) {
  const { newKeys, duplicates, errors } = useMemo(() => {
    if (!input.trim()) return { newKeys: [], duplicates: [], errors: [] }

    if (scripture === 'quran') {
      const keys = parseQuranRefs(input)
      const newKeys = keys.filter((k) => !existingKeys.has(k))
      const duplicates = keys.filter((k) => existingKeys.has(k))
      return { newKeys, duplicates, errors: [] as string[] }
    } else {
      const { resolved, errors: parseErrors } = parseBibleRefs(input)
      const allKeys = expandBibleRefs(resolved)
      const newKeys = allKeys.filter((k) => !existingKeys.has(k))
      const duplicates = allKeys.filter((k) => existingKeys.has(k))
      const errorMsgs = parseErrors.map((e) =>
        e.reason === 'unknown_book'
          ? `Unknown book: "${e.raw}"`
          : `Bad format: "${e.raw}"`
      )
      return { newKeys, duplicates, errors: errorMsgs }
    }
  }, [scripture, input, existingKeys])

  if (!input.trim()) return null

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      {newKeys.length > 0 && (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{newKeys.length}</span>{' '}
          verse{newKeys.length !== 1 ? 's' : ''} will be added
          {duplicates.length > 0 ? `, ${duplicates.length} already in collection` : ''}
        </p>
      )}
      {newKeys.length === 0 && duplicates.length > 0 && (
        <p className="text-muted-foreground">
          All {duplicates.length} verse{duplicates.length !== 1 ? 's' : ''} already
          in collection
        </p>
      )}
      {errors.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {errors.map((e) => (
            <li key={e} className="flex items-start gap-1 text-destructive">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AddFromReferencesDialog({
  collectionId,
  existingKeys,
  open,
  onOpenChange,
}: AddFromReferencesDialogProps) {
  const [scripture, setScripture] = useState<Scripture>('quran')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const { newKeys } = useMemo(() => {
    if (!input.trim()) return { newKeys: [] as string[] }
    if (scripture === 'quran') {
      const keys = parseQuranRefs(input)
      return { newKeys: keys.filter((k) => !existingKeys.has(k)) }
    } else {
      const { resolved } = parseBibleRefs(input)
      const allKeys = expandBibleRefs(resolved)
      return { newKeys: allKeys.filter((k) => !existingKeys.has(k)) }
    }
  }, [scripture, input, existingKeys])

  async function handleAdd() {
    if (newKeys.length === 0) return
    setLoading(true)
    let added = 0
    let failed = 0
    for (const key of newKeys) {
      try {
        await meApi.addVerseToCollection(collectionId, {
          scripture,
          verse_key: key,
        })
        added++
      } catch {
        failed++
      }
    }
    setLoading(false)
    onOpenChange(false)
    setInput('')
    if (failed === 0) {
      toast.success(`${added} verse${added !== 1 ? 's' : ''} added`)
    } else {
      toast.warning(`${added} added, ${failed} failed`)
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) setInput('')
    onOpenChange(v)
  }

  const placeholder =
    scripture === 'quran'
      ? 'e.g. 1:1-7, 2:255, 3:1-10'
      : 'e.g. Genesis 1:1-5, John 3:16, Ps 23:1'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add from references</DialogTitle>
          <DialogDescription>
            Enter verse references. Ranges like{' '}
            {scripture === 'quran' ? '1:1-7' : 'Gen 1:1-5'} expand automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          {/* Scripture toggle */}
          <div
            className="flex rounded-md border border-border overflow-hidden text-xs font-medium"
            role="group"
            aria-label="Scripture"
          >
            {(['quran', 'bible'] as Scripture[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setScripture(s)
                  setInput('')
                }}
                className={`flex-1 py-1.5 capitalize transition-colors ${
                  scripture === s
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                {s === 'quran' ? 'Quran' : 'Bible'}
              </button>
            ))}
          </div>

          {/* Input */}
          <textarea
            autoFocus
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* Live preview */}
          <Preview
            scripture={scripture}
            input={input}
            existingKeys={existingKeys}
          />
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={loading || newKeys.length === 0}
            onClick={handleAdd}
          >
            {loading ? 'Adding…' : `Add ${newKeys.length > 0 ? newKeys.length : ''} verse${newKeys.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
