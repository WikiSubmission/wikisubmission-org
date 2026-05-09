'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateBookmarkCategory } from '@/hooks/use-bookmark-categories'

const PALETTE = [
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Slate', value: '#64748b' },
]

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated?: (id: number) => void
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[0].value)
  const { mutate: create, isPending } = useCreateBookmarkCategory()

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    create(
      { name: trimmed, color },
      {
        onSuccess: (res) => {
          setName('')
          setColor(PALETTE[0].value)
          onOpenChange(false)
          onCreated?.(res.data.id)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New bookmark category</DialogTitle>
          <DialogDescription>
            Group verses you want to revisit. Pick a name and a color.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Name
            </label>
            <input
              autoFocus
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Favorites, To memorize"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) handleCreate()
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full transition-all ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isPending || !name.trim()}
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
