'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  ExternalLink,
  Send,
  Archive,
  Trash2,
  Edit3,
  Calendar,
  Globe,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import type { EditorialContentDoc } from '@/lib/editorial-content-client'
import type { EditorialSession } from '@/lib/editorial-access'
import {
  publishContentDocAction,
  unpublishContentDocAction,
  deleteContentDocAction,
} from '@/app/(editor)/editor/content-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ArticlesSectionProps {
  initialArticles: EditorialContentDoc[]
  editorialSession: EditorialSession | null
  canWriteArticles: boolean
  statusFilter?: FilterStatus
  onStatusFilterChange?: (status: FilterStatus) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export type FilterStatus = 'all' | 'published' | 'draft' | 'changed'

export function ArticlesSection({
  initialArticles,
  editorialSession,
  canWriteArticles,
  statusFilter: externalFilter,
  onStatusFilterChange,
  searchQuery: externalSearchQuery,
  onSearchChange,
}: ArticlesSectionProps) {
  const [articles, setArticles] = useState<EditorialContentDoc[]>(initialArticles)
  const [internalFilter, setInternalFilter] = useState<FilterStatus>('all')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const filter = externalFilter !== undefined ? externalFilter : internalFilter
  const setFilter = (next: FilterStatus) => {
    if (onStatusFilterChange) onStatusFilterChange(next)
    else setInternalFilter(next)
  }

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery
  const setSearchQuery = (query: string) => {
    if (onSearchChange) onSearchChange(query)
    else setInternalSearchQuery(query)
  }

  const hasEditorialAccess = Boolean(editorialSession)
  const isAdmin = Boolean(editorialSession?.is_admin)

  // Filter articles based on status tab and search query
  const filteredArticles = articles.filter((doc) => {
    if (filter !== 'all' && doc.status !== filter) return false
    if (!searchQuery.trim()) return true
    const title = String(doc.fields?.title ?? '').toLowerCase()
    const slug = String(doc.fields?.slug ?? '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return title.includes(query) || slug.includes(query)
  })

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length
  const changedCount = articles.filter((a) => a.status === 'changed').length

  const handlePublish = (docId: number) => {
    setPendingId(docId)
    startTransition(async () => {
      try {
        const res = await publishContentDocAction('article', docId)
        if (res.ok) {
          setArticles((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, status: 'published', published_at: new Date().toISOString() } : d))
          )
          toast.success('Article published successfully! Readers can now view it on the blog.')
        } else {
          toast.error(res.error || 'Failed to publish article')
        }
      } catch {
        toast.error('Unexpected error while publishing article')
      } finally {
        setPendingId(null)
      }
    })
  }

  const handleUnpublish = (docId: number) => {
    setPendingId(docId)
    startTransition(async () => {
      try {
        const res = await unpublishContentDocAction('article', docId)
        if (res.ok) {
          setArticles((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, status: 'draft', published_at: null } : d))
          )
          toast.info('Article unpublished and moved back to drafts.')
        } else {
          toast.error(res.error || 'Failed to unpublish article')
        }
      } catch {
        toast.error('Unexpected error while unpublishing article')
      } finally {
        setPendingId(null)
      }
    })
  }

  const handleDelete = (docId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this article'}"? This cannot be undone.`)) {
      return
    }
    setPendingId(docId)
    startTransition(async () => {
      try {
        const res = await deleteContentDocAction('article', docId)
        if (res.ok) {
          setArticles((prev) => prev.filter((d) => d.id !== docId))
          toast.success('Article deleted successfully.')
        } else {
          toast.error(res.error || 'Failed to delete article')
        }
      } catch {
        toast.error('Unexpected error while deleting article')
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="ws-articles-hub">
      {/* Header Banner */}
      <div className="ws-articles-header">
        <div className="ws-articles-header-left">
          <div className="ws-articles-badge-row">
            <span className="ws-section-kicker">Content & Publishing</span>
            {hasEditorialAccess && (
              <span className="ws-editorial-badge">
                <ShieldCheck size={13} className="text-emerald-500" />
                {isAdmin ? 'Admin Access' : 'Editorial Access'}
              </span>
            )}
          </div>
          <h2 className="ws-articles-title">Articles & Blog</h2>
          <p className="ws-articles-desc">
            Your personal writing studio. Manage drafts, publish reflections and research directly to WikiSubmission&apos;s community blog, and launch the rich editor workspace.
          </p>
        </div>

        <div className="ws-articles-header-actions">
          {hasEditorialAccess && (
            <Button
              asChild
              variant="outline"
              className="ws-editor-desk-btn"
            >
              <Link href="/editor">
                <span>Editorial Desk</span>
                <ArrowUpRight size={15} />
              </Link>
            </Button>
          )}

          <Button
            asChild
            className="ws-new-article-btn"
          >
            <Link href="/editor/article/new">
              <Plus size={16} />
              <span>Write Article</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Band */}
      <div className="ws-articles-metrics">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFilter('all')}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('all')}
          className={`ws-articles-metric-card ${filter === 'all' ? 'is-active' : ''}`}
        >
          <div className="ws-metric-icon bg-primary/10 text-primary">
            <FileText size={18} />
          </div>
          <div className="ws-metric-info">
            <span className="ws-metric-value">{articles.length}</span>
            <span className="ws-metric-label">Total Articles</span>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setFilter('published')}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('published')}
          className={`ws-articles-metric-card ${filter === 'published' ? 'is-active' : ''}`}
        >
          <div className="ws-metric-icon bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={18} />
          </div>
          <div className="ws-metric-info">
            <span className="ws-metric-value">{publishedCount}</span>
            <span className="ws-metric-label">Published</span>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setFilter('draft')}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('draft')}
          className={`ws-articles-metric-card ${filter === 'draft' ? 'is-active' : ''}`}
        >
          <div className="ws-metric-icon bg-amber-500/10 text-amber-500">
            <Clock size={18} />
          </div>
          <div className="ws-metric-info">
            <span className="ws-metric-value">{draftCount}</span>
            <span className="ws-metric-label">Drafts</span>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setFilter('changed')}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('changed')}
          className={`ws-articles-metric-card ${filter === 'changed' ? 'is-active' : ''}`}
        >
          <div className="ws-metric-icon bg-sky-500/10 text-sky-500">
            <AlertCircle size={18} />
          </div>
          <div className="ws-metric-info">
            <span className="ws-metric-value">{changedCount}</span>
            <span className="ws-metric-label">Edited Drafts</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="ws-articles-toolbar">
        <div className="ws-articles-search-wrapper">
          <Search size={15} className="ws-search-icon" />
          <Input
            type="search"
            placeholder="Filter articles by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ws-articles-search-input"
          />
        </div>

        <div className="ws-articles-filter-pills" role="tablist" aria-label="Article status filters">
          <button
            type="button"
            className={`ws-filter-pill ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({articles.length})
          </button>
          <button
            type="button"
            className={`ws-filter-pill ${filter === 'published' ? 'is-active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            className={`ws-filter-pill ${filter === 'draft' ? 'is-active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Drafts ({draftCount})
          </button>
          <button
            type="button"
            className={`ws-filter-pill ${filter === 'changed' ? 'is-active' : ''}`}
            onClick={() => setFilter('changed')}
          >
            Edited ({changedCount})
          </button>
        </div>
      </div>

      {/* Articles List or Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="ws-articles-empty">
          <div className="ws-articles-empty-icon">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h3 className="ws-articles-empty-title">
            {searchQuery || filter !== 'all' ? 'No matching articles found' : 'No articles drafted yet'}
          </h3>
          <p className="ws-articles-empty-desc">
            {searchQuery || filter !== 'all'
              ? 'Try changing your search term or selecting a different status filter.'
              : 'Share your research, translation insights, or theological reflections with readers worldwide. You can write, preview, and publish right from here.'}
          </p>
          <div className="ws-articles-empty-actions">
            <Button asChild className="ws-new-article-btn">
              <Link href="/editor/article/new">
                <Plus size={16} />
                <span>Create Your First Article</span>
              </Link>
            </Button>
            {hasEditorialAccess && (
              <Button asChild variant="outline">
                <Link href="/editor">Visit Editorial Desk</Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="ws-articles-list">
          {filteredArticles.map((doc) => {
            const title = String(doc.fields?.title ?? 'Untitled Article')
            const slug = String(doc.fields?.slug ?? '')
            const excerpt = String(doc.fields?.excerpt ?? '')
            const language = String(doc.fields?.language ?? 'en').toUpperCase()
            const isPublishingThis = isPending && pendingId === doc.id
            const isPublished = doc.status === 'published'
            const isChanged = doc.status === 'changed'
            const isDraft = doc.status === 'draft'

            return (
              <article key={doc.id} className="ws-article-card">
                <div className="ws-article-card-main">
                  <div className="ws-article-card-meta">
                    {/* Status Badge */}
                    {isPublished && (
                      <span className="ws-status-badge is-published">
                        <span className="ws-status-dot bg-emerald-500" />
                        Published
                      </span>
                    )}
                    {isDraft && (
                      <span className="ws-status-badge is-draft">
                        <span className="ws-status-dot bg-amber-500" />
                        Draft
                      </span>
                    )}
                    {isChanged && (
                      <span className="ws-status-badge is-changed">
                        <span className="ws-status-dot bg-sky-500" />
                        Unpublished Edits
                      </span>
                    )}

                    <span className="ws-article-lang">
                      <Globe size={12} />
                      {language}
                    </span>

                    {doc.updated_at && (
                      <span className="ws-article-date">
                        <Calendar size={12} />
                        Updated {new Date(doc.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h3 className="ws-article-card-title">
                    <Link href={`/editor/article/${doc.id}`} className="hover:underline">
                      {title}
                    </Link>
                  </h3>

                  {excerpt ? (
                    <p className="ws-article-card-excerpt">{excerpt}</p>
                  ) : (
                    <p className="ws-article-card-slug">/blog/{slug || `doc-${doc.id}`}</p>
                  )}
                </div>

                <div className="ws-article-card-actions">
                  {/* View Live link if published */}
                  {slug && isPublished && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="ws-article-action-btn"
                      title="View published article on blog"
                    >
                      <Link href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                        <span>Live</span>
                      </Link>
                    </Button>
                  )}

                  {/* Edit in Editor */}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="ws-article-action-btn"
                  >
                    <Link href={`/editor/article/${doc.id}`}>
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </Link>
                  </Button>

                  {/* Publish / Unpublish Toggle */}
                  {canWriteArticles && (
                    <>
                      {!isPublished ? (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isPublishingThis}
                          onClick={() => handlePublish(doc.id)}
                          className="ws-article-publish-btn"
                        >
                          <Send size={13} />
                          <span>{isPublishingThis ? 'Publishing...' : 'Publish'}</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPublishingThis}
                          onClick={() => handleUnpublish(doc.id)}
                          className="ws-article-unpublish-btn"
                        >
                          <Archive size={13} />
                          <span>{isPublishingThis ? 'Saving...' : 'Unpublish'}</span>
                        </Button>
                      )}

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPublishingThis}
                        onClick={() => handleDelete(doc.id, title)}
                        className="ws-article-delete-btn text-destructive hover:bg-destructive/10"
                        title="Delete article"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
