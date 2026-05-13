'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'
import { CategoryVerseList } from '@/components/me/category-verse-list'

type View = { kind: 'list' } | { kind: 'detail'; categoryId: number }

export function BookmarksDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const categories = useBookmarkCategories()
  const [createOpen, setCreateOpen] = useState(false)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [search, setSearch] = useState('')

  // Reset to category list whenever the dialog re-opens.
  useEffect(() => {
    if (!open) {
      setView({ kind: 'list' })
      setSearch('')
    }
  }, [open])

  const activeCategory =
    view.kind === 'detail' ? categories.find((c) => c.id === view.categoryId) : null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-2xl w-full p-0 gap-0 bg-[var(--ed-surface)] border-[var(--ed-rule)] rounded-[3px]"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[var(--ed-rule)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {view.kind === 'detail' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setView({ kind: 'list' })
                      setSearch('')
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] font-[var(--font-glacial)]"
                  >
                    <ArrowLeft className="w-3 h-3" aria-hidden />
                    Categories
                  </button>
                ) : (
                  <span className="font-[var(--font-glacial)] text-[10.5px] tracking-[0.18em] uppercase text-[var(--ed-accent)]">
                    Bookmarks
                  </span>
                )}
              </div>
              {view.kind === 'list' ? (
                <button
                  type="button"
                  className="section-action"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden />
                  New category
                </button>
              ) : null}
            </div>
            <DialogTitle asChild>
              <h2 className="font-[var(--font-cormorant)] font-medium text-[26px] leading-tight tracking-[-0.02em] mt-1 text-[var(--ed-fg)]">
                {view.kind === 'detail' && activeCategory ? (
                  <>
                    <span
                      className="inline-block w-3 h-3 align-middle mr-2"
                      style={{ background: activeCategory.color }}
                      aria-hidden
                    />
                    {activeCategory.name}
                  </>
                ) : (
                  <>
                    Bookmarks <em className="text-[var(--ed-accent)] not-italic-fallback italic font-normal">by category</em>
                  </>
                )}
              </h2>
            </DialogTitle>
            {view.kind === 'detail' && activeCategory ? (
              <p className="font-[var(--font-jetbrains)] text-[11px] tracking-[0.04em] text-[var(--ed-fg-muted)] mt-1">
                {activeCategory.entry_count}{' '}
                {activeCategory.entry_count === 1 ? 'verse' : 'verses'}
              </p>
            ) : null}
          </DialogHeader>

          {view.kind === 'detail' ? (
            <div className="px-6 py-3 border-b border-[var(--ed-rule)]">
              <label className="flex items-center gap-2 border-b border-[var(--ed-rule)] focus-within:border-[var(--ed-accent)]">
                <Search className="w-4 h-4 text-[var(--ed-fg-muted)]" aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search this category…"
                  className="flex-1 bg-transparent outline-none py-2 font-[var(--font-source-serif)] text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)]"
                />
              </label>
            </div>
          ) : null}

          <div className="max-h-[70vh] overflow-y-auto">
            {view.kind === 'list' ? (
              categories.length === 0 ? (
                <div className="px-6 py-10">
                  <div className="empty">
                    <span className="empty-glyph">§</span>
                    <p className="empty-verse">
                      No categories yet. Create one to start organising your verses.
                    </p>
                    <button
                      type="button"
                      className="empty-cta"
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden />
                      Create a category
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cat-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="cat-row text-left"
                      style={{ ['--cat-color' as string]: cat.color }}
                      onClick={() => setView({ kind: 'detail', categoryId: cat.id })}
                    >
                      <span className="cat-mark" />
                      <div>
                        <div className="cat-name">
                          {cat.name}
                          <span className="num">
                            {String(cat.entry_count).padStart(3, '0')}
                          </span>
                        </div>
                      </div>
                      <span className="cat-action">Open →</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="px-2 sm:px-0">
                <CategoryVerseList
                  categoryId={view.categoryId}
                  search={search}
                  hideAudio
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
