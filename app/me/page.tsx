'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  BookOpen,
  Bookmark,
  ChevronRight,
  Flame,
  Library,
  LogOut,
  Plus,
  Share2,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import { useStreak } from '@/hooks/use-reading-streak'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useCollections } from '@/hooks/use-collections'
import { useNoteCount } from '@/hooks/use-notes'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'
import { CategoryActions } from '@/components/me/category-actions'

const QURAN_TOTAL_VERSES = 6236
const QURAN_TOTAL_CHAPTERS = 114

function chapterFromKey(key: string | undefined | null): number {
  if (!key) return 0
  const n = parseInt(key.split(':')[0] ?? '0', 10)
  return Number.isFinite(n) ? n : 0
}

function ScripturePill({ scripture }: { scripture: 'quran' | 'bible' }) {
  return (
    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
      {scripture}
    </span>
  )
}

function CoverToCoverCard({ scripture }: { scripture: 'quran' | 'bible' }) {
  const progress = useCoverToCoverProgress(scripture)
  const streak = useStreak(scripture)
  const chapterNum = chapterFromKey(progress?.verse_key)

  const totalVerses =
    scripture === 'quran' ? QURAN_TOTAL_VERSES : streak?.total_verses_read ?? 0
  const totalChapters = scripture === 'quran' ? QURAN_TOTAL_CHAPTERS : 66

  const ratio =
    scripture === 'quran' && chapterNum
      ? Math.min(1, chapterNum / totalChapters)
      : 0
  const percent = Math.round(ratio * 100)

  const continueHref = progress?.verse_key
    ? scripture === 'quran'
      ? `/quran/${chapterNum}?verse=${progress.verse_key.split(':')[1]}`
      : `/bible/${progress.verse_key}`
    : scripture === 'quran'
      ? '/quran/1'
      : '/bible'

  const label = scripture === 'quran' ? 'Quran' : 'Bible'

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        <ScripturePill scripture={scripture} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {progress?.verse_key
              ? `Currently at ${progress.verse_key}`
              : 'Not started yet'}
          </span>
          <span className="font-mono">{percent}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {streak && (
            <span className="inline-flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {streak.current_streak}d streak
            </span>
          )}
          <span>{totalVerses.toLocaleString()} verses total</span>
        </div>
        <Link href={continueHref}>
          <Button size="sm" variant="ghost" className="h-7 text-xs">
            Continue
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function CoverToCoverSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Cover to cover
        </h2>
        <p className="text-xs text-muted-foreground/80 italic leading-relaxed">
          &ldquo;Read what you can of the Quran. He knew that some of you would be
          ill, others traveling in the land seeking God&rsquo;s bounty…&rdquo;{' '}
          <Link
            href="/quran/73?verse=20"
            className="text-primary not-italic hover:underline"
          >
            (73:20)
          </Link>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CoverToCoverCard scripture="quran" />
        <CoverToCoverCard scripture="bible" />
      </div>
    </section>
  )
}

function CategoriesSection() {
  const categories = useBookmarkCategories()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Bookmark categories
          </h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Group verses with names and colors. Tap a verse&rsquo;s bookmark to add
            it.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center rounded-xl border border-dashed border-border">
          <Bookmark className="w-5 h-5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            No categories yet. Create one to start saving verses.
          </p>
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
    </section>
  )
}

function CollectionsSection() {
  const collections = useCollections()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Collections
          </h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-md leading-relaxed">
            Curated series of verses you can share with anyone via a link. Make
            them public to invite others, or keep them private for yourself.
          </p>
        </div>
        <Link href="/me/collections">
          <Button size="sm" variant="outline">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New
          </Button>
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center rounded-xl border border-dashed border-border">
          <Library className="w-5 h-5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground max-w-xs">
            Build your first collection. Add verses from the reader, then share
            the link or keep it private.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {collections.slice(0, 4).map((col) => (
            <Link
              key={col.id}
              href={`/me/collections/${col.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors"
            >
              <Library className="w-4 h-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{col.name}</p>
                {col.description && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {col.description}
                  </p>
                )}
              </div>
              {col.is_public && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-primary shrink-0">
                  <Share2 className="w-3 h-3" />
                  Public
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </Link>
          ))}
          {collections.length > 4 && (
            <Link
              href="/me/collections"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            >
              View all {collections.length}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

function StatsRow() {
  const quranStreak = useStreak('quran')
  const bibleStreak = useStreak('bible')
  const categories = useBookmarkCategories()
  const noteCount = useNoteCount()

  const totalBookmarks = categories.reduce((s, c) => s + c.entry_count, 0)
  const longest = Math.max(
    quranStreak?.longest_streak ?? 0,
    bibleStreak?.longest_streak ?? 0
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Link
        href="/me/streak"
        className="flex flex-col gap-0.5 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <Flame className="w-4 h-4 text-orange-500" />
          {quranStreak?.current_streak ?? 0}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Quran streak
        </span>
      </Link>
      <Link
        href="/me/streak"
        className="flex flex-col gap-0.5 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
      >
        <div className="text-xl font-bold">{longest}</div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Longest streak
        </span>
      </Link>
      <Link
        href="/me/notes"
        className="flex flex-col gap-0.5 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <StickyNote className="w-4 h-4 text-muted-foreground" />
          {noteCount}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Notes
        </span>
      </Link>
      <Link
        href="/me/bookmarks"
        className="flex flex-col gap-0.5 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <Bookmark className="w-4 h-4 text-amber-500" />
          {totalBookmarks}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Bookmarks
        </span>
      </Link>
    </div>
  )
}

function ProfileHeader() {
  const { data: session } = useSession()
  const user = session?.user
  const initial =
    user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-semibold shrink-0"
        aria-hidden
      >
        {initial}
      </div>
      <div className="flex flex-col min-w-0">
        {user?.name && (
          <h1 className="text-xl sm:text-2xl font-semibold truncate">
            {user.name}
          </h1>
        )}
        {user?.email && (
          <p className="text-sm text-muted-foreground truncate">
            {user.email}
          </p>
        )}
      </div>
    </div>
  )
}

export default function MePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 flex flex-col gap-10">
      <ProfileHeader />
      <StatsRow />
      <CoverToCoverSection />
      <CategoriesSection />

      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
