'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Share2, Bookmark, ArrowLeft, ArrowRight } from 'lucide-react'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useTranslations } from 'next-intl'
import { CategoryVerseList } from '@/components/me/category-verse-list'
import { CategoryActions } from '@/components/me/category-actions'
import { AddVerseRefDialog } from '@/components/me/add-verse-ref-dialog'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

function CategoryDetail({ categoryId }: { categoryId: number }) {
  const t = useTranslations('meBookmarks')
  const categories = useBookmarkCategories()
  const category = categories.find((c) => c.id === categoryId)
  const [addOpen, setAddOpen] = useState(false)
  const router = useRouter()
  const sp = useSearchParams()
  const initialQuery = sp.get('q') ?? ''
  const [search, setSearch] = useState(initialQuery)

  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(sp.toString())
      if (search) next.set('q', search)
      else next.delete('q')
      router.replace(`?${next.toString()}`, { scroll: false })
    }, 200)
    return () => clearTimeout(id)
  }, [search, router, sp])

  const createdAt = category?.created_at
    ? new Date(category.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back to all categories link */}
      <div className="mb-6">
        <Link
          href="/me/bookmarks"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors"
        >
          <ArrowLeft size={13} />
          <span>All Bookmark Categories</span>
        </Link>
      </div>

      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--ed-rule)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: category?.color || 'var(--ed-accent)' }}
            />
            <span
              style={{ fontFamily: F.mono }}
              className="text-[11px] uppercase tracking-wider text-[var(--ed-accent)]"
            >
              {category?.entry_count ?? 0} {category?.entry_count === 1 ? 'verse' : 'verses'}
            </span>
          </div>

          <h1
            style={{ fontFamily: F.display }}
            className="m-0 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            {category?.name ?? t('category')}
          </h1>

          {category && (
            <div className="mt-2 flex items-center gap-2 text-[12px] font-mono text-[var(--ed-fg-muted)]">
              {createdAt && <span>Created {createdAt}</span>}
              {createdAt && <span className="opacity-40">·</span>}
              <CategoryActions category={category} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="ed-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] cursor-pointer"
            style={{ fontFamily: F.serif }}
          >
            <Plus size={14} />
            <span>{t('addVerses')}</span>
          </button>

          <Link
            href="/me/collections"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[13px] text-[var(--ed-fg)] hover:border-[var(--ed-accent)] transition-colors no-underline"
            style={{ fontFamily: F.serif }}
          >
            <Share2 size={13} />
            <span>{t('makeCollection')}</span>
          </Link>
        </div>
      </div>

      {/* Search within category */}
      <div className="mt-6 max-w-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[var(--ed-fg-muted)] pointer-events-none" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchInCategory')}
            className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[13.5px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)] outline-none focus:border-[var(--ed-accent)] transition-colors"
            style={{ fontFamily: F.serif }}
          />
        </div>
      </div>

      {/* Verses list */}
      <div className="mt-6">
        <CategoryVerseList categoryId={categoryId} search={search} />
      </div>

      {category && (
        <AddVerseRefDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          categoryId={categoryId}
          categoryName={category.name}
        />
      )}
    </div>
  )
}

function CategoriesDirectory() {
  const categories = useBookmarkCategories()
  const [createOpen, setCreateOpen] = useState(false)
  const totalVerses = categories.reduce((acc, cat) => acc + (cat.entry_count || 0), 0)

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--ed-rule)]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--ed-accent)] mb-2">
            <Bookmark size={13} />
            <span>Sacred Bookmarks</span>
          </div>
          <h1
            style={{ fontFamily: F.display }}
            className="m-0 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            Bookmark Categories
          </h1>
          <div className="mt-2 flex items-center gap-2 text-[12px] font-mono text-[var(--ed-fg-muted)]">
            <span>{categories.length} categories</span>
            <span className="opacity-40">·</span>
            <span>{totalVerses} total saved verses</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="ed-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-[13.5px] shrink-0 self-start sm:self-auto cursor-pointer"
          style={{ fontFamily: F.serif }}
        >
          <Plus size={15} />
          <span>New Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-[10px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-8 sm:p-12 text-center max-w-xl mx-auto w-full mt-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
            <Bookmark size={22} />
          </div>

          <h3
            style={{ fontFamily: F.display }}
            className="m-0 text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            No bookmark categories yet
          </h3>

          <p
            style={{ fontFamily: F.serif }}
            className="mt-2 text-[14px] text-[var(--ed-fg-muted)] leading-relaxed"
          >
            Organize verses into custom color-coded categories. Create your first category to start saving your favorite passages.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="ed-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[14px] cursor-pointer"
              style={{ fontFamily: F.serif }}
            >
              <Plus size={15} />
              <span>Create First Category</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/me/bookmarks?id=${cat.id}`}
              className="group p-5 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="size-3 rounded-full"
                  style={{ background: cat.color || 'var(--ed-accent)' }}
                />
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-[12px] text-[var(--ed-fg-muted)]"
                >
                  {cat.entry_count || 0} verses
                </span>
              </div>
              <h3
                style={{ fontFamily: F.display }}
                className="m-0 text-xl font-medium text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors truncate"
              >
                {cat.name}
              </h3>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)]">
                <span>Browse verses</span>
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateCategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}

function BookmarksScreenInner() {
  const sp = useSearchParams()
  const raw = sp.get('id') ?? sp.get('category')
  const categoryId = raw ? Number.parseInt(raw, 10) : NaN

  if (Number.isFinite(categoryId)) {
    return <CategoryDetail categoryId={categoryId} />
  }

  return <CategoriesDirectory />
}

export default function BookmarksScreen() {
  return (
    <Suspense fallback={null}>
      <BookmarksScreenInner />
    </Suspense>
  )
}
