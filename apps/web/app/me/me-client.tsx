'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  BookOpen,
  Bookmark,
  FileEdit,
  Library,
  Flame,
  LogOut,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Feather,
} from 'lucide-react'
import { SettingsClient } from '@/components/me/settings-screen'
import { OfflineSettingsSection } from '@/components/me/offline-settings-section'
import { ActivityClient } from '@/components/me/activity-screen'
import { ArticlesSection, type FilterStatus } from '@/components/me/articles-section'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useCollections } from '@/hooks/use-collections'
import { useNoteCount } from '@/hooks/use-notes'
import { useStreak } from '@/hooks/use-reading-streak'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import type { EditorialContentDoc } from '@/lib/editorial-content-client'
import { resolveEditorRole, type EditorialSession } from '@/lib/editorial-access'

export type WorkspaceTab = 'overview' | 'saved' | 'activity' | 'settings' | 'articles'

interface MePageClientProps {
  name?: string | null
  email?: string | null
  settingsInitialTab?: string
  initialArticles?: EditorialContentDoc[]
  editorialSession?: EditorialSession | null
  canWriteArticles?: boolean
}

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

function capitalizeName(str?: string | null): string {
  if (!str) return 'Reader'
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function subscribeToHash(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getHashSnapshot(): string {
  return window.location.hash.replace('#', '')
}

function getServerHashSnapshot(): string {
  return ''
}

export default function MePageClient({
  name,
  email,
  settingsInitialTab,
  initialArticles = [],
  editorialSession = null,
  canWriteArticles = false,
}: MePageClientProps) {
  const router = useRouter()

  // Subscribe to URL hash with SSR safety and zero cascading renders
  const currentHash = useSyncExternalStore(subscribeToHash, getHashSnapshot, getServerHashSnapshot)
  const [overrideTab, setOverrideTab] = useState<WorkspaceTab | null>(null)

  const activeTab: WorkspaceTab = useMemo(() => {
    if (overrideTab) return overrideTab
    if (['overview', 'saved', 'activity', 'settings', 'articles'].includes(currentHash)) {
      return currentHash as WorkspaceTab
    }
    return settingsInitialTab ? 'settings' : 'overview'
  }, [overrideTab, currentHash, settingsInitialTab])

  // Articles filtering state (for articles tab)
  const [articleFilter, setArticleFilter] = useState<FilterStatus>('all')
  const [articleSearch, setArticleSearch] = useState('')

  function switchTab(tab: WorkspaceTab) {
    setOverrideTab(tab)
    if (tab === 'overview') {
      window.history.replaceState(null, '', window.location.pathname)
    } else {
      window.history.replaceState(null, '', `#${tab}`)
    }
    window.dispatchEvent(new Event('hashchange'))
  }

  function handleBackToReader() {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('me.preReferrer') : null
    if (stored && !/^(\/[a-z]{2}(-[A-Z]{2})?)?\/me(\/|$)/.test(stored)) {
      router.push(stored)
      return
    }
    router.push('/quran/1')
  }

  // Live Statistics & Progress
  const quranProgress = useCoverToCoverProgress('quran')
  const quranStreak = useStreak('quran')
  const bookmarkCategories = useBookmarkCategories()
  const bookmarkCount = Array.isArray(bookmarkCategories)
    ? bookmarkCategories.reduce((acc, cat) => acc + (cat.entry_count || 0), 0)
    : 0
  const noteCount = useNoteCount()
  const collections = useCollections()
  const collectionCount = Array.isArray(collections) ? collections.length : 0

  // User Profile
  const rawDisplayName = name || (email ? email.split('@')[0] : 'Reader')
  const formattedName = useMemo(() => capitalizeName(rawDisplayName), [rawDisplayName])
  const roleInfo = editorialSession ? resolveEditorRole(editorialSession) : { key: 'reader', label: 'Reader' }

  // Quran Reading Progress calculation
  const quranVk = quranProgress?.verse_key
  const quranChapter = quranVk ? parseInt(quranVk.split(':')[0] || '1', 10) || 1 : 1
  const quranVerse = quranVk ? quranVk.split(':')[1] || '1' : '1'
  const quranPercent = Math.min(100, Math.round((quranChapter / 114) * 100))
  const quranContinueHref = quranVk ? `/quran/${quranChapter}?verse=${quranVerse}` : '/quran/1'

  const showArticlesTab = canWriteArticles || initialArticles.length > 0

  return (
    <div className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)]">
      <div className="max-w-[880px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Top Utility Row ── */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[var(--ed-rule)] text-[12px] font-mono">
          <button
            type="button"
            onClick={handleBackToReader}
            className="inline-flex items-center gap-1.5 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Scripture</span>
          </button>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-1.5 text-[var(--ed-fg-muted)] hover:text-red-500 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>

        {/* ── Profile Masthead ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.16em] text-[var(--ed-accent)] mb-2">
            <ShieldCheck size={13} />
            <span>Reader Workspace</span>
          </div>

          <h1
            style={{ fontFamily: F.display }}
            className="m-0 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            Welcome, {formattedName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-mono text-[var(--ed-fg-muted)]">
            {email && <span>{email}</span>}
            {email && <span className="opacity-40">·</span>}
            <span className="px-2 py-0.5 rounded-[4px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_92%)] text-[var(--ed-accent)] uppercase text-[10px] tracking-wider font-semibold">
              {roleInfo.label}
            </span>
            <span className="opacity-40">·</span>
            <span>Ad-Free &amp; Open Access</span>
          </div>
        </div>

        {/* ── Minimalist Tab Navigation ── */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => switchTab('overview')}
            className={`
              px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0
              ${activeTab === 'overview'
                ? 'bg-[var(--ed-accent)] text-white font-semibold shadow-xs'
                : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'}
            `}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => switchTab('saved')}
            className={`
              px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0
              ${activeTab === 'saved'
                ? 'bg-[var(--ed-accent)] text-white font-semibold shadow-xs'
                : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'}
            `}
          >
            Saved ({bookmarkCount + noteCount})
          </button>

          <button
            type="button"
            onClick={() => switchTab('activity')}
            className={`
              px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0
              ${activeTab === 'activity'
                ? 'bg-[var(--ed-accent)] text-white font-semibold shadow-xs'
                : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'}
            `}
          >
            Activity
          </button>

          <button
            type="button"
            onClick={() => switchTab('settings')}
            className={`
              px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0
              ${activeTab === 'settings'
                ? 'bg-[var(--ed-accent)] text-white font-semibold shadow-xs'
                : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'}
            `}
          >
            Settings
          </button>

          {showArticlesTab && (
            <button
              type="button"
              onClick={() => switchTab('articles')}
              className={`
                px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0
                ${activeTab === 'articles'
                  ? 'bg-[var(--ed-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'}
              `}
            >
              Articles ({initialArticles.length})
            </button>
          )}
        </div>

        {/* ── TAB CONTENT ── */}

        {/* 1. OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary Focus: Continue Reading Hero Card */}
            <div className="rounded-[10px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[color-mix(in_oklab,var(--ed-rule),transparent_50%)]">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[var(--ed-accent)]" />
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ed-accent)]"
                  >
                    Current Devotional Position
                  </span>
                </div>
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-[11px] text-[var(--ed-fg-muted)] uppercase tracking-wider"
                >
                  {quranPercent}% Completed
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3
                    style={{ fontFamily: F.display }}
                    className="m-0 text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
                  >
                    The Holy Qur&apos;an
                  </h3>
                  <p
                    style={{ fontFamily: F.serif }}
                    className="m-0 mt-1 text-[14.5px] text-[var(--ed-fg-muted)]"
                  >
                    {quranVk
                      ? `Chapter ${quranChapter}, Verse ${quranVerse}`
                      : 'Cover to cover reading · Start at Chapter 1'}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-[var(--ed-fg-muted)]">
                    <span>{quranChapter} of 114 Surahs</span>
                    <span className="opacity-40">·</span>
                    <span>Synchronized across devices</span>
                  </div>
                </div>

                <Link
                  href={quranContinueHref}
                  className="ed-btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] shrink-0 group"
                  style={{ fontFamily: F.serif }}
                >
                  <span>Continue Reading</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Progress bar */}
              <div className="mt-5 h-1.5 w-full rounded-full bg-[color-mix(in_oklab,var(--ed-fg),transparent_92%)] overflow-hidden">
                <div
                  className="h-full bg-[var(--ed-accent)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(quranPercent, 2)}%` }}
                />
              </div>
            </div>

            {/* Sacred Library Triad: Bookmarks, Notes, Collections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{ fontFamily: F.glacial }}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
                >
                  Your Scripture Library
                </span>
                <Link
                  href="/me/bookmarks"
                  className="text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)] hover:underline"
                >
                  Browse all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Bookmarks */}
                <Link
                  href="/me/bookmarks"
                  className="group p-5 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex size-7 items-center justify-center rounded-[5px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)]">
                      <Bookmark size={14} />
                    </span>
                    <span style={{ fontFamily: F.mono }} className="text-xl font-bold text-[var(--ed-fg)]">
                      {bookmarkCount}
                    </span>
                  </div>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="block text-[12px] font-bold uppercase tracking-wider text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors"
                  >
                    Bookmarks
                  </span>
                  <span style={{ fontFamily: F.serif }} className="block text-[12.5px] text-[var(--ed-fg-muted)] mt-1">
                    Saved verses across {Array.isArray(bookmarkCategories) ? bookmarkCategories.length : 0} categories
                  </span>
                </Link>

                {/* Personal Notes */}
                <Link
                  href="/me/notes"
                  className="group p-5 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex size-7 items-center justify-center rounded-[5px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)]">
                      <FileEdit size={14} />
                    </span>
                    <span style={{ fontFamily: F.mono }} className="text-xl font-bold text-[var(--ed-fg)]">
                      {noteCount}
                    </span>
                  </div>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="block text-[12px] font-bold uppercase tracking-wider text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors"
                  >
                    Study Notes
                  </span>
                  <span style={{ fontFamily: F.serif }} className="block text-[12.5px] text-[var(--ed-fg-muted)] mt-1">
                    Personal reflections and verse annotations
                  </span>
                </Link>

                {/* Collections */}
                <Link
                  href="/me/collections"
                  className="group p-5 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex size-7 items-center justify-center rounded-[5px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)]">
                      <Library size={14} />
                    </span>
                    <span style={{ fontFamily: F.mono }} className="text-xl font-bold text-[var(--ed-fg)]">
                      {collectionCount}
                    </span>
                  </div>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="block text-[12px] font-bold uppercase tracking-wider text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors"
                  >
                    Collections
                  </span>
                  <span style={{ fontFamily: F.serif }} className="block text-[12.5px] text-[var(--ed-fg-muted)] mt-1">
                    Thematic sets &amp; shareable scripture studies
                  </span>
                </Link>
              </div>
            </div>

            {/* Devotional Habit Ribbon */}
            <div className="p-4 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-[5px] bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Flame size={15} />
                </span>
                <div>
                  <span style={{ fontFamily: F.mono }} className="font-semibold text-[var(--ed-fg)]">
                    {quranStreak?.current_streak ?? 0} Days Reading Streak
                  </span>
                  <span style={{ fontFamily: F.serif }} className="block text-[12.5px] text-[var(--ed-fg-muted)]">
                    Daily engagement in the study of God&apos;s word.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => switchTab('activity')}
                className="text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)] hover:underline self-start sm:self-auto cursor-pointer"
              >
                View Activity Timeline →
              </button>
            </div>

            {/* Editorial Contributor Desk (Quiet callout if editor) */}
            {canWriteArticles && (
              <div className="p-4 rounded-[8px] border border-[var(--ed-rule)] bg-[color-mix(in_oklab,var(--ed-accent),transparent_96%)] flex items-center justify-between gap-3 text-[12px]">
                <div className="flex items-center gap-2.5">
                  <Feather size={15} className="text-[var(--ed-accent)]" />
                  <span style={{ fontFamily: F.serif }} className="text-[13px] text-[var(--ed-fg)]">
                    You have editorial publishing privileges on WikiSubmission.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab('articles')}
                  className="text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)] hover:underline cursor-pointer"
                >
                  Editorial Studio →
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. SAVED MATERIAL VIEW */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/me/bookmarks"
                className="group p-6 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
              >
                <div className="flex items-center justify-between mb-3">
                  <Bookmark size={18} className="text-[var(--ed-accent)]" />
                  <span style={{ fontFamily: F.mono }} className="text-2xl font-bold text-[var(--ed-fg)]">
                    {bookmarkCount}
                  </span>
                </div>
                <h3
                  style={{ fontFamily: F.display }}
                  className="m-0 text-xl font-medium text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors"
                >
                  Bookmarks
                </h3>
                <p style={{ fontFamily: F.serif }} className="m-0 mt-1 text-[13px] text-[var(--ed-fg-muted)]">
                  Browse and organize saved verses by category.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)]">
                  <span>Open Bookmarks</span>
                  <ChevronRight size={12} />
                </span>
              </Link>

              <Link
                href="/me/notes"
                className="group p-6 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
              >
                <div className="flex items-center justify-between mb-3">
                  <FileEdit size={18} className="text-[var(--ed-accent)]" />
                  <span style={{ fontFamily: F.mono }} className="text-2xl font-bold text-[var(--ed-fg)]">
                    {noteCount}
                  </span>
                </div>
                <h3
                  style={{ fontFamily: F.display }}
                  className="m-0 text-xl font-medium text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors"
                >
                  Study Notes
                </h3>
                <p style={{ fontFamily: F.serif }} className="m-0 mt-1 text-[13px] text-[var(--ed-fg-muted)]">
                  Review personal annotations and thoughts on verses.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)]">
                  <span>Open Notes</span>
                  <ChevronRight size={12} />
                </span>
              </Link>

              <Link
                href="/me/collections"
                className="group p-6 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] hover:shadow-xs transition-all no-underline"
              >
                <div className="flex items-center justify-between mb-3">
                  <Library size={18} className="text-[var(--ed-accent)]" />
                  <span style={{ fontFamily: F.mono }} className="text-2xl font-bold text-[var(--ed-fg)]">
                    {collectionCount}
                  </span>
                </div>
                <h3
                  style={{ fontFamily: F.display }}
                  className="m-0 text-xl font-medium text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors"
                >
                  Collections
                </h3>
                <p style={{ fontFamily: F.serif }} className="m-0 mt-1 text-[13px] text-[var(--ed-fg-muted)]">
                  Curate scripture passages into shareable study sets.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[var(--ed-accent)]">
                  <span>Open Collections</span>
                  <ChevronRight size={12} />
                </span>
              </Link>
            </div>

            {/* Quick Bookmark Categories Jump List */}
            {Array.isArray(bookmarkCategories) && bookmarkCategories.length > 0 && (
              <div className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-5">
                <span
                  style={{ fontFamily: F.glacial }}
                  className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ed-accent)] mb-3"
                >
                  Bookmark Categories
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bookmarkCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/me/bookmarks?category=${cat.id}`}
                      className="flex items-center justify-between p-2.5 rounded-[5px] border border-[var(--ed-rule)] bg-[var(--ed-bg)] hover:border-[var(--ed-accent)] transition-colors text-[13px] no-underline"
                    >
                      <span className="text-[var(--ed-fg)] font-medium truncate pr-2">{cat.name}</span>
                      <span className="text-[11px] font-mono text-[var(--ed-fg-muted)] shrink-0">
                        {cat.entry_count || 0} verses
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ACTIVITY VIEW */}
        {activeTab === 'activity' && (
          <div className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8 shadow-xs">
            <ActivityClient />
          </div>
        )}

        {/* 4. SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8 shadow-xs">
              <SettingsClient />
            </div>
            <div className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8 shadow-xs">
              <OfflineSettingsSection />
            </div>
          </div>
        )}

        {/* 5. ARTICLES & BLOG STUDIO VIEW */}
        {activeTab === 'articles' && showArticlesTab && (
          <div className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8 shadow-xs">
            <ArticlesSection
              initialArticles={initialArticles}
              editorialSession={editorialSession}
              canWriteArticles={canWriteArticles}
              statusFilter={articleFilter}
              onStatusFilterChange={setArticleFilter}
              searchQuery={articleSearch}
              onSearchChange={setArticleSearch}
            />
          </div>
        )}
      </div>
    </div>
  )
}