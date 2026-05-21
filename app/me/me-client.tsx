'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Flame, Info, Plus, Search, Share2 } from 'lucide-react'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import { useStreak } from '@/hooks/use-reading-streak'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useCollections } from '@/hooks/use-collections'
import { useAllNotes, useNoteCount } from '@/hooks/use-notes'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'
import { ProfileNavMinimal } from '@/components/me/profile-nav'
import { italicizeLast } from '@/components/editorial/section-header'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { NoteData } from '@/types/bookmarks'

const QURAN_TOTAL_CHAPTERS = 114
const BIBLE_TOTAL_BOOKS = 66

function chapterFromKey(key: string | undefined | null): number {
  if (!key) return 0
  const n = parseInt(key.split(':')[0] ?? '0', 10)
  return Number.isFinite(n) ? n : 0
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return ''
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))}m ago`
  if (diff < day) return `${Math.round(diff / hour)}h ago`
  if (diff < 30 * day) return `${Math.round(diff / day)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CoverToCoverCard({ scripture }: { scripture: 'quran' | 'bible' }) {
  const progress = useCoverToCoverProgress(scripture)
  const streak = useStreak(scripture)
  const chapterNum = chapterFromKey(progress?.verse_key)
  const totalChapters = scripture === 'quran' ? QURAN_TOTAL_CHAPTERS : BIBLE_TOTAL_BOOKS
  const ratio = chapterNum ? Math.min(1, chapterNum / totalChapters) : 0
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
    <div className="c2c-card">
      <div className="c2c-head">
        <span className="c2c-title">{label}</span>
        <span className="c2c-mono">
          {label.toUpperCase()} · {percent}%
        </span>
      </div>
      <div className="c2c-progress">
        <div className="c2c-progress-bar thick">
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="c2c-progress-meta">
          <span>
            {progress?.verse_key ? `Currently at ${progress.verse_key}` : 'Not started yet'}
          </span>
          <span>
            {chapterNum} of {totalChapters}
          </span>
        </div>
      </div>
      <div className="c2c-foot">
        <span className="inline-flex items-center gap-1.5">
          {streak?.current_streak ? (
            <>
              <Flame className="w-3.5 h-3.5 text-[var(--ed-accent)]" aria-hidden />
              {streak.current_streak}-day streak
            </>
          ) : (
            'Begin a streak today'
          )}
        </span>
        <Link href={continueHref} className="c2c-continue">
          Continue reading →
        </Link>
      </div>
    </div>
  )
}

function CoverToCoverSection() {
  return (
    <section className="section" id="cover-to-cover">
      <div className="section-head">
        <span className="section-roman">I</span>
        <span className="section-eyebrow">Cover</span>
        <h2 className="section-title">
          Cover <em>to cover</em>
        </h2>
        <span className="section-spacer" />
      </div>
      <div className="c2c-grid">
        <CoverToCoverCard scripture="quran" />
        <CoverToCoverCard scripture="bible" />
      </div>
    </section>
  )
}

function CategoriesSection() {
  const categories = useBookmarkCategories()
  const [createOpen, setCreateOpen] = useState(false)
  const [query, setQuery] = useState('')

  if (categories.length === 0) return null

  const filtered = query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories

  return (
    <section className="section" id="bookmarks">
      <div className="section-head">
        <span className="section-roman">II</span>
        <span className="section-eyebrow">Bookmarks</span>
        <h2 className="section-title">
          <Link href="/me/bookmarks" className="hover:text-[var(--ed-accent)] transition-colors">
            Bookmarks <em>by category</em>
          </Link>
        </h2>
        <span className="section-spacer" />
        <button type="button" className="section-action" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" aria-hidden />
          New category
        </button>
      </div>
      {categories.length > 4 && (
        <label className="flex items-center gap-2 border-b border-[var(--ed-rule)] focus-within:border-[var(--ed-accent)] max-w-md mb-4">
          <Search className="w-4 h-4 text-[var(--ed-fg-muted)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories…"
            className="flex-1 bg-transparent outline-none py-2 font-[var(--font-source-serif)] text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)]"
          />
        </label>
      )}
      <div className="cat-grid">
        {filtered.map((cat) => (
          <Link
            key={cat.id}
            href={`/me/bookmarks/${cat.id}`}
            className="cat-row"
            style={{ ['--cat-color' as string]: cat.color }}
          >
            <span className="cat-mark" />
            <div>
              <div className="cat-name">
                {cat.name}
                <span className="num">{String(cat.entry_count).padStart(3, '0')}</span>
              </div>
            </div>
            <span className="cat-action">Open →</span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-[var(--ed-fg-muted)] text-sm py-2">No categories match.</p>
        )}
      </div>
      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </section>
  )
}

function NotesPreviewSection() {
  const notes = useAllNotes()
  if (notes.length === 0) return null

  const recent = notes.slice(0, 4)

  return (
    <section className="section" id="notes">
      <div className="section-head">
        <span className="section-roman">III</span>
        <span className="section-eyebrow">Notes · {notes.length} total</span>
        <h2 className="section-title">
          Notes <em>&amp; marginalia</em>
        </h2>
        <span className="section-spacer" />
        <Link href="/me/notes" className="section-action-link">
          Open all {notes.length} →
        </Link>
      </div>
      <div className="notes-preview">
        {recent.map((note) => (
          <NotePreviewCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  )
}

function NotePreviewCard({ note }: { note: NoteData }) {
  const tags = note.tags ?? []
  const href =
    note.scripture === 'quran'
      ? `/me/notes?focus=${note.id}`
      : `/me/notes?focus=${note.id}`
  const firstLine = note.content.split('\n').find((l) => l.trim()) ?? ''

  return (
    <Link href={href} className="note-card">
      <div className="note-card-head">
        <span>{note.verse_key}</span>
        <span className="date">{relativeTime(note.updated_at)}</span>
      </div>
      {firstLine ? <p className="note-card-body">{firstLine}</p> : null}
      {tags.length > 0 ? (
        <div className="note-card-foot">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="tag-chip">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function CollectionsSection() {
  const collections = useCollections()
  if (collections.length === 0) return null

  return (
    <section className="section" id="collections">
      <div className="section-head">
        <span className="section-roman">IV</span>
        <span className="section-eyebrow">Collections</span>
        <h2 className="section-title">
          <Link href="/me/collections" className="hover:text-[var(--ed-accent)] transition-colors">
            Curated <em>collections</em>
          </Link>
        </h2>
        <span className="section-spacer" />
        <Link href="/me/collections" className="section-action-link">
          View all {collections.length} →
        </Link>
      </div>
      <div className="coll-list">
        {collections.slice(0, 4).map((col, idx) => (
          <Link key={col.id} href={`/me/collections/${col.id}`} className="coll-row">
            <span className="coll-num">{roman(idx + 1)}</span>
            <div>
              <h3 className="coll-title">{col.name}</h3>
              {col.description ? <p className="coll-desc">{col.description}</p> : null}
            </div>
            <span className="coll-meta">—</span>
            {col.is_public ? (
              <span className="coll-public inline-flex items-center gap-1">
                <Share2 className="w-3 h-3" aria-hidden />
                Public
              </span>
            ) : (
              <span className="coll-meta">Private</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

function roman(n: number): string {
  const numerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  for (const [val, sym] of numerals) {
    while (n >= val) {
      out += sym
      n -= val
    }
  }
  return out || 'I'
}

function StreakInfoIcon() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="How streaks are updated"
          className="stat-info"
          onClick={(e) => e.preventDefault()}
        >
          <Info className="w-3 h-3" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
        Streaks update when you advance your cover-to-cover position through the
        reader.
      </TooltipContent>
    </Tooltip>
  )
}

function StatsGrid({
  quranStreak,
  bibleStreak,
  noteCount,
  totalBookmarks,
}: {
  quranStreak: number
  bibleStreak: number
  noteCount: number
  totalBookmarks: number
}) {
  const cells = (
    <>
      <div>
        <Flame className="stat-flame" aria-hidden />
        <p className="stat-eyebrow">
          Quran streak
          <StreakInfoIcon />
        </p>
        <div className="stat-num">
          {quranStreak}
          <span className="unit">days</span>
        </div>
        <p className="stat-sub">Final Testament</p>
      </div>
      <div>
        <Flame className="stat-flame" aria-hidden />
        <p className="stat-eyebrow">
          Bible streak
          <StreakInfoIcon />
        </p>
        <div className="stat-num">
          {bibleStreak}
          <span className="unit">days</span>
        </div>
        <p className="stat-sub">Old &amp; New Testament</p>
      </div>
      <Link href="/me/notes">
        <p className="stat-eyebrow">Notes</p>
        <div className="stat-num">{noteCount}</div>
        <p className="stat-sub">Across both scriptures</p>
      </Link>
      <Link href="/me#bookmarks">
        <p className="stat-eyebrow">Bookmarks</p>
        <div className="stat-num">{totalBookmarks}</div>
        <p className="stat-sub">Saved verses</p>
      </Link>
    </>
  )
  return (
    <>
      <div className="stats">{cells}</div>
      <div className="stats-mobile">{cells}</div>
    </>
  )
}

function ProfileMast({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <>
      <div className="profile-mast">
        <div>
          <h1>{name ? italicizeLast(name) : <em>Reader</em>}</h1>
          {email ? (
            <div className="profile-mast-meta">
              <span>{email}</span>
              <span className="sep">·</span>
              <Link href="/me/settings">Settings</Link>
            </div>
          ) : null}
        </div>
      </div>
      <div className="profile-mast-mobile">
        <h1>{name ? italicizeLast(name) : <em>Reader</em>}</h1>
        {email ? (
          <div className="profile-mast-meta">
            <span>{email}</span>
          </div>
        ) : null}
      </div>
    </>
  )
}

function NewUserStarter() {
  return (
    <>
      <section className="section">
        <div className="section-head">
          <span className="section-roman">I</span>
          <span className="section-eyebrow">Welcome</span>
          <h2 className="section-title">
            Begin <em>to read</em>
          </h2>
        </div>
        <div className="empty">
          <span className="empty-glyph">§</span>
          <h3 className="empty-title">Welcome to the commentary</h3>
          <p className="empty-verse">
            &ldquo;Read what you can of the Quran. He knew that some of you would be ill,
            others traveling in the land seeking God&apos;s bounty…&rdquo;
          </p>
          <span className="empty-cite">— 73:20</span>
          <Link href="/quran/1" className="empty-cta">
            Open chapter one →
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="section-roman">II</span>
          <span className="section-eyebrow">Three first steps</span>
          <h2 className="section-title">
            Three <em>first steps</em>
          </h2>
        </div>
        <div className="c2c-grid">
          <div className="c2c-card">
            <span className="c2c-mono">I</span>
            <h3 className="c2c-title">Open a chapter</h3>
            <p className="text-[var(--ed-fg-muted)] text-[14px]">
              Pick any of the 114 suras and start reading. Your place is saved automatically.
            </p>
          </div>
          <div className="c2c-card">
            <span className="c2c-mono">II</span>
            <h3 className="c2c-title">Bookmark a verse</h3>
            <p className="text-[var(--ed-fg-muted)] text-[14px]">
              Tap the bookmark icon on any verse to add it to a category.
            </p>
          </div>
          <div className="c2c-card">
            <span className="c2c-mono">III</span>
            <h3 className="c2c-title">Write a note</h3>
            <p className="text-[var(--ed-fg-muted)] text-[14px]">
              Add your own thoughts. Notes appear in the margin of the verse, and in your profile.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default function MePageClient({
  name,
  email,
}: {
  name?: string | null
  email?: string | null
}) {
  const quranStreak = useStreak('quran')
  const bibleStreak = useStreak('bible')
  const categories = useBookmarkCategories()
  const noteCount = useNoteCount()

  const totalBookmarks = categories.reduce((s, c) => s + c.entry_count, 0)
  const isNewUser =
    (quranStreak?.current_streak ?? 0) === 0 &&
    (bibleStreak?.current_streak ?? 0) === 0 &&
    categories.length === 0 &&
    noteCount === 0

  const provider = 'Magic link'

  return (
    <div className="ed-page">
      <ProfileNavMinimal />
      <ProfileMast name={name} email={email} />
      {isNewUser ? null : (
        <StatsGrid
          quranStreak={quranStreak?.current_streak ?? 0}
          bibleStreak={bibleStreak?.current_streak ?? 0}
          noteCount={noteCount}
          totalBookmarks={totalBookmarks}
        />
      )}

      {isNewUser ? (
        <NewUserStarter />
      ) : (
        <>
          <CoverToCoverSection />
          <CategoriesSection />
          <NotesPreviewSection />
          <CollectionsSection />
        </>
      )}

      <div className="signout">
        <button type="button" onClick={() => signOut({ callbackUrl: '/' })}>
          Sign out
        </button>
        <span className="signout-meta">Signed in via {provider}</span>
      </div>
    </div>
  )
}
