'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Share2 } from 'lucide-react'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { CategoryVerseList } from '@/components/me/category-verse-list'
import { CategoryActions } from '@/components/me/category-actions'
import { AddVerseRefDialog } from '@/components/me/add-verse-ref-dialog'

function CategoryDetail({ categoryId }: { categoryId: number }) {
  const categories = useBookmarkCategories()
  const category = categories.find((c) => c.id === categoryId)
  const [addOpen, setAddOpen] = useState(false)
  const router = useRouter()
  const sp = useSearchParams()
  const initialQuery = sp.get('q') ?? ''
  const [search, setSearch] = useState(initialQuery)

  // Sync ?q= in the URL with the local search input, debounced.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(sp.toString())
      if (search) next.set('q', search)
      else next.delete('q')
      router.replace(`?${next.toString()}`, { scroll: false })
    }, 200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const createdAt = category?.created_at
    ? new Date(category.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <>
      <div className="profile-mast">
        <div>
          <div className="profile-mast-eyebrow">
            <span
              className="dot"
              aria-hidden
              style={category?.color ? { background: category.color } : undefined}
            />
            <span>
              {category?.entry_count ?? 0}{' '}
              {category?.entry_count === 1 ? 'verse' : 'verses'}
            </span>
          </div>
          <h1>
            <em>{category?.name ?? 'Category'}</em>
          </h1>
          {category ? (
            <div className="profile-mast-meta">
              {createdAt ? <span>Created {createdAt}</span> : null}
              <span className="sep">·</span>
              <CategoryActions category={category} />
            </div>
          ) : null}
        </div>
        <div className="profile-mast-side">
          <button
            type="button"
            className="section-action"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden />
            Add verses
          </button>
          <Link href="/me/collections" className="section-action">
            <Share2 className="w-3.5 h-3.5" aria-hidden />
            Make a Collection
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-2 border-b border-[var(--ed-rule)] focus-within:border-[var(--ed-accent)] max-w-md">
          <Search className="w-4 h-4 text-[var(--ed-fg-muted)]" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verses in this category…"
            className="flex-1 bg-transparent outline-none py-2 font-[var(--font-source-serif)] text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)]"
          />
        </label>
      </div>

      <div className="mt-6">
        <CategoryVerseList categoryId={categoryId} search={search} />
      </div>

      {category ? (
        <AddVerseRefDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          categoryId={categoryId}
          categoryName={category.name}
        />
      ) : null}
    </>
  )
}

export default function BookmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const categoryId = parseInt(id, 10)
  return <CategoryDetail categoryId={categoryId} />
}
