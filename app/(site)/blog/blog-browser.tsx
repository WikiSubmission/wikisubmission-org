'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  categorySlug?: string
  thumbnailUrl?: string
  authorName?: string
}

export type Category = {
  name: string
  slug: string
  count: number
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug?.current}`}
      className="group bg-background rounded-xl editorial-shadow border border-border/40 overflow-hidden transition-all hover:-translate-y-0.5"
    >
      {post.thumbnailUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 space-y-2">
        {post.category && (
          <span className="inline-block px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
            {post.category}
          </span>
        )}
        <h3 className="font-headline font-bold text-base leading-snug group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        <p className="text-xs text-muted-foreground pt-1">{formatDate(post.publishedAt)}</p>
      </div>
    </Link>
  )
}

export function BlogBrowser({
  articles,
  categories,
}: {
  articles: Post[]
  categories: Category[]
}) {
  const t = useTranslations('blog')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const isFiltering = query.trim().length > 0 || activeCategory !== null

  const filtered = articles.filter((a) => {
    const q = query.trim().toLowerCase()
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.excerpt ?? '').toLowerCase().includes(q)
    const matchesCategory = !activeCategory || a.categorySlug === activeCategory
    return matchesSearch && matchesCategory
  })

  // Grouped view for default (no filter, no search)
  const grouped = categories
    .map((cat) => ({
      ...cat,
      posts: articles.filter((a) => a.categorySlug === cat.slug),
    }))
    .filter((g) => g.posts.length > 0)

  // Articles with no category — only shown in uncategorised group when not filtering
  const uncategorised = articles.filter((a) => !a.categorySlug)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* ── Search + category pills ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="pl-8 h-9 bg-muted/50 border-border/40"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveCategory(null); setQuery('') }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
              !activeCategory && !query
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-muted/60 text-muted-foreground border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
            )}
          >
            {t('filterAll')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug); setQuery('') }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                activeCategory === cat.slug
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/60 text-muted-foreground border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
              )}
            >
              {cat.name}
              <span className="ml-1 opacity-50">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtered / search results ───────────────────────────────────── */}
      {isFiltering && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="font-headline font-bold">{t('noResults')}</p>
              <p className="text-sm mt-1">{t('noResultsHelp')}</p>
            </div>
          )}
        </>
      )}

      {/* ── Grouped by category (default) ───────────────────────────────── */}
      {!isFiltering && (
        <div className="space-y-14">
          {grouped.map((group) => (
            <section key={group.slug}>
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="font-headline text-xl font-bold shrink-0">{group.name}</h2>
                <span className="text-xs text-muted-foreground font-medium">{group.posts.length}</span>
                <div className="h-px flex-1 bg-border/60" />
                <button
                  onClick={() => setActiveCategory(group.slug)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors shrink-0"
                >
                  {t('viewAll')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </section>
          ))}

          {uncategorised.length > 0 && (
            <section>
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="font-headline text-xl font-bold shrink-0 text-muted-foreground">{t('uncategorised')}</h2>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {uncategorised.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </section>
          )}

          {articles.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="font-headline font-bold">{t('noPosts')}</p>
              <p className="text-sm mt-1">{t('noPostsHelp')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
