'use client'

import Link from 'next/link'
import { Bookmark, Plus, Tag } from 'lucide-react'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'

export default function BookmarksPage() {
  const categories = useBookmarkCategories()

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bookmark Categories</h1>
        <Link
          href="/me"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Manage in profile
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Tag className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No categories yet.</p>
          <Link
            href="/me"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Create a category
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: cat.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 font-mono">
                {(cat as { entry_count?: number }).entry_count ?? 0}
              </span>
              <Bookmark className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
