'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useDeleteBookmarkCategory,
  useUpdateBookmarkCategory,
} from '@/hooks/use-bookmark-categories'
import { useTranslations } from 'next-intl'
import type { BookmarkCategoryData } from '@/types/bookmarks'

const PALETTE = [
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
  '#0ea5e9',
  '#10b981',
  '#64748b',
]

export function CategoryActions({
  category,
}: {
  category: BookmarkCategoryData
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const t = useTranslations('meBookmarks')
  const tActions = useTranslations('actions')
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color)
  const { mutate: update, isPending: updating } = useUpdateBookmarkCategory()
  const { mutate: remove, isPending: deleting } = useDeleteBookmarkCategory()

  function handleEdit() {
    setName(category.name)
    setColor(category.color)
    setEditOpen(true)
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    update(
      { id: category.id, name: trimmed, color },
      { onSuccess: () => setEditOpen(false) }
    )
  }

  function handleDelete() {
    remove(category.id, { onSuccess: () => setConfirmOpen(false) })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="w-3.5 h-3.5 me-2" />
            {tActions('edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 me-2" />
            {tActions('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('editCategory')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {tActions('name')}
              </label>
              <input
                autoFocus
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {tActions('color')}
              </label>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-all ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(false)}
            >
              {tActions('cancel')}
            </Button>
            <Button size="sm" disabled={updating || !name.trim()} onClick={handleSave}>
              {tActions('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteTitle', { name: category.name })}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('deleteBody')}
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(false)}
            >
              {tActions('cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
            >
              {tActions('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
