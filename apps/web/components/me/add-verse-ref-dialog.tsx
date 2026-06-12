'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { meApi } from '@/src/api/me-client'
import { parseQuranRef, parseBibleRef, normalizeQuranInput } from '@/lib/scripture-parser'

const MAX_RANGE = 50

type ParsedLine =
  | { raw: string; valid: true; scripture: 'quran' | 'bible'; verseKeys: string[] }
  | { raw: string; valid: false }

function expandQuranRef(cn: number, vs: number, ve: number): string[] {
  const count = ve - vs + 1
  const capped = Math.min(count, MAX_RANGE)
  return Array.from({ length: capped }, (_, i) => `${cn}:${vs + i}`)
}

function parseLine(raw: string): ParsedLine {
  const line = raw.trim()
  if (!line) return { raw, valid: false }

  const normalized = normalizeQuranInput(line)
  const quranRef = parseQuranRef(normalized)
  if (quranRef) {
    return {
      raw,
      valid: true,
      scripture: 'quran',
      verseKeys: expandQuranRef(quranRef.cn, quranRef.vs, quranRef.ve),
    }
  }

  const bibleRef = parseBibleRef(line)
  if (bibleRef) {
    const count = bibleRef.ve - bibleRef.vs + 1
    const capped = Math.min(count, MAX_RANGE)
    const verseKeys = Array.from(
      { length: capped },
      (_, i) => `${bibleRef.bn}:${bibleRef.cs}:${bibleRef.vs + i}`
    )
    return { raw, valid: true, scripture: 'bible', verseKeys }
  }

  return { raw, valid: false }
}

interface AddVerseRefDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: number
  categoryName: string
}

export function AddVerseRefDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
}: AddVerseRefDialogProps) {
  const [rawInput, setRawInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const qc = useQueryClient()

  const parsedLines = useMemo(
    () =>
      rawInput
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map(parseLine),
    [rawInput]
  )

  const validRefs = useMemo(
    () => parsedLines.filter((l) => l.valid) as Extract<ParsedLine, { valid: true }>[],
    [parsedLines]
  )

  const totalVerses = validRefs.reduce((s, l) => s + l.verseKeys.length, 0)

  async function handleSubmit() {
    if (validRefs.length === 0 || isSubmitting) return
    setIsSubmitting(true)
    try {
      await Promise.all(
        validRefs.flatMap((ref) =>
          ref.verseKeys.map((verseKey) =>
            meApi.createBookmarkEntry({
              category_id: categoryId,
              scripture: ref.scripture,
              verse_key: verseKey,
            })
          )
        )
      )
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['bookmark-category-entries', categoryId] }),
        qc.invalidateQueries({ queryKey: ['bookmark-categories'] }),
      ])
      onOpenChange(false)
      setRawInput('')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose(v: boolean) {
    if (!isSubmitting) {
      onOpenChange(v)
      if (!v) setRawInput('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add verses to {categoryName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">
              One reference per line. Ranges like{' '}
              <span className="font-mono">2:255-257</span> or{' '}
              <span className="font-mono">John 3:16-18</span> expand up to{' '}
              {MAX_RANGE} verses.
            </p>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              placeholder={'2:255\n3:190-195\nJohn 3:16\nMark 4:12-15'}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {parsedLines.length > 0 && (
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {parsedLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {line.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  )}
                  <span className="font-mono truncate">
                    {line.raw}
                  </span>
                  {line.valid && (
                    <span className="text-muted-foreground shrink-0">
                      {line.verseKeys.length === 1
                        ? line.verseKeys[0]
                        : `${line.verseKeys.length} verses`}{' '}
                      <span className="text-[10px] uppercase tracking-wider">
                        {line.scripture}
                      </span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-muted-foreground">
              {totalVerses > 0
                ? `${totalVerses} verse${totalVerses === 1 ? '' : 's'} will be added`
                : 'No valid references'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={totalVerses === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
