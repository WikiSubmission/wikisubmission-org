'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'
import { CategoryActions } from '@/components/me/category-actions'

export default function BookmarksPage() {
  const categories = useBookmarkCategories()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 flex flex-col gap-6">
      <Link
        href="/me"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to profile
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bookmark categories</h1>
          <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-md">
            Group verses with names and colors. Open any verse in the reader and
            tap the bookmark icon to assign it.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center rounded-xl border border-dashed border-border">
          <Bookmark className="w-6 h-6 text-muted-foreground/40" />
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

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
