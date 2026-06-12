'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'

interface AddFromCategoryDialogProps {
  collectionId: number
  existingKeys: Set<string>
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function AddFromCategoryDialog({
  collectionId,
  existingKeys,
  open,
  onOpenChange,
}: AddFromCategoryDialogProps) {
  const categories = useBookmarkCategories()
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImport() {
    if (selected === null) return
    setLoading(true)
    let added = 0
    let skipped = 0
    let failed = 0

    try {
      const { data: entries } = await meApi.listBookmarkCategoryEntries(selected)
      for (const entry of entries) {
        if (existingKeys.has(entry.verse_key)) {
          skipped++
          continue
        }
        try {
          await meApi.addVerseToCollection(collectionId, {
            scripture: entry.scripture,
            verse_key: entry.verse_key,
          })
          added++
        } catch {
          failed++
        }
      }
    } catch {
      setLoading(false)
      toast.error('Failed to load category entries')
      return
    }

    setLoading(false)
    onOpenChange(false)
    setSelected(null)

    if (added === 0 && skipped > 0 && failed === 0) {
      toast.info(`All ${skipped} verse${skipped !== 1 ? 's' : ''} already in collection`)
    } else if (failed === 0) {
      const parts = [`${added} verse${added !== 1 ? 's' : ''} added`]
      if (skipped > 0) parts.push(`${skipped} already in collection`)
      toast.success(parts.join(', '))
    } else {
      toast.warning(`${added} added, ${skipped} already in collection, ${failed} failed`)
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) setSelected(null)
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add from bookmark category</DialogTitle>
          <DialogDescription>
            All verses from the selected category will be added. Duplicates are skipped.
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No bookmark categories yet.{' '}
            <Link href="/me/bookmarks" className="text-primary hover:underline">
              Create one first.
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelected(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                  selected === cat.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent/30'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="flex-1 truncate font-medium">{cat.name}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {cat.entry_count} verses
                </span>
              </button>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={selected === null || loading || categories.length === 0}
            onClick={handleImport}
          >
            {loading ? 'Importing…' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
