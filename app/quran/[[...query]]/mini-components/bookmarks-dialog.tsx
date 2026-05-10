'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'
import { CategoryActions } from '@/components/me/category-actions'

export function BookmarksDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const categories = useBookmarkCategories()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg rounded-2xl p-0 gap-0" aria-describedby={undefined}>
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-base font-semibold">Bookmark categories</DialogTitle>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Group verses with names and colors. Tap a verse&apos;s bookmark to assign it.
            </p>
          </DialogHeader>

          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center rounded-xl border border-dashed border-border">
                <Bookmark className="w-5 h-5 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No categories yet. Create one to start organizing your verses.
                </p>
                <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create a category
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                  >
                    <Link
                      href={`/me/bookmarks/${cat.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => onOpenChange(false)}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: cat.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cat.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {cat.entry_count} {cat.entry_count === 1 ? 'verse' : 'verses'}
                        </p>
                      </div>
                    </Link>
                    <CategoryActions category={cat} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
