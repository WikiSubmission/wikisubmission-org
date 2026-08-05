'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, Info, Plus, Search, Share2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import { useStreak } from '@/hooks/use-reading-streak'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useCollections } from '@/hooks/use-collections'
import { useAllNotes, useNoteCount } from '@/hooks/use-notes'
import { useReadingStats } from '@/hooks/use-reading-stats'
import { CreateCategoryDialog } from '@/components/me/create-category-dialog'
import { italicizeLast } from '@/components/editorial/section-header'
import { ParentSize } from '@visx/responsive'
import { Sparkline } from '@/components/me/stats/sparkline'
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

type Translate = ReturnType<typeof useTranslations<'meDashboard'>>

/** Compact "x ago" stamp; falls back to a locale-formatted date past 30 days. */
function relativeTime(iso: string | undefined, t: Translate, locale: string): string {
  if (!iso) return ''
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < hour) return t('minutesAgo', { minutes: Math.max(1, Math.round(diff / minute)) })
  if (diff < day) return t('hoursAgo', { hours: Math.round(diff / hour) })
  if (diff < 30 * day) return t('daysAgo', { days: Math.round(diff / day) })
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

function CoverToCoverCard({ scripture }: { scripture: 'quran' | 'bible' }) {
  const t = useTranslations('meDashboard')
  const tNav = useTranslations('navbar')
  const tQuran = useTranslations('quran')
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
  const label = tNav(scripture)
  // The mono rail keeps a stable Latin tag; the scripture name above it is translated.
  const monoLabel = scripture === 'quran' ? 'QURAN' : 'BIBLE'

  return (
    <div className="c2c-card">
      <div className="c2c-head">
        <span className="c2c-title">{label}</span>
        <span className="c2c-mono">
          {monoLabel} · {percent}%
        </span>
      </div>
      <div className="c2c-progress">
        <div className="c2c-progress-bar thick">
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="c2c-progress-meta">
          <span>
            {progress?.verse_key
              ? tQuran('continueCurrentlyAt', { verseKey: progress.verse_key })
              : t('notStarted')}
          </span>
          <span>{t('chapterOf', { current: chapterNum, total: totalChapters })}</span>
        </div>
      </div>
      <div className="c2c-foot">
        <span className="inline-flex items-center gap-1.5">
          {streak?.current_streak ? (
            <>
              <Flame className="w-3.5 h-3.5 text-[var(--ed-accent)]" aria-hidden />
              {t('streakDays', { days: streak.current_streak })}
            </>
          ) : (
            t('beginStreak')
          )}
        </span>
        <Link href={continueHref} className="c2c-continue">
          {t('continueReading')}
        </Link>
      </div>
    </div>
  )
}

function CoverToCoverSection({ hideBible = false }: { hideBible?: boolean }) {
  const t = useTranslations('meDashboard')
  return (
    <section className="section" id="cover-to-cover">
      <div className="section-head">
        <span className="section-roman">I</span>
        <span className="section-eyebrow">{t('coverEyebrow')}</span>
        <h2 className="section-title">{t.rich('coverTitle', { em: (c) => <em>{c}</em> })}</h2>
        <span className="section-spacer" />
      </div>
      <div className="c2c-grid">
        <CoverToCoverCard scripture="quran" />
        {/* Bible is not shipped on mobile yet (no /bible route) — hidden there. */}
        {!hideBible && <CoverToCoverCard scripture="bible" />}
      </div>
    </section>
  )
}

function RhythmTeaser({ scripture, label }: { scripture: 'quran' | 'bible'; label: string }) {
  const t = useTranslations('meDashboard')
  const locale = useLocale()
  const { data } = useReadingStats(scripture, '30d')
  const daily = data?.daily ?? []
  const total = data?.total ?? 0
  return (
    <Link
      href={`/me/stats?scripture=${scripture}`}
      className="c2c-card"
      aria-label={t('rhythmAria', { scripture: label })}
    >
      <div className="c2c-head">
        <span className="c2c-title">{label}</span>
        <span className="c2c-mono">
          {scripture === 'quran' ? 'QURAN' : 'BIBLE'} · {t('last30Days')}
        </span>
      </div>
      <div style={{ height: 48 }}>
        {daily.length > 0 ? (
          <ParentSize>
            {({ width }) =>
              width ? (
                <Sparkline width={width} height={48} scripture={scripture} data={daily} />
              ) : null
            }
          </ParentSize>
        ) : (
          <div className="rs-card-empty" style={{ padding: '12px 0', border: 'none' }}>
            {t('noReadingsYet')}
          </div>
        )}
      </div>
      <div className="c2c-foot">
        <span>{t('versesLast30', { count: total.toLocaleString(locale) })}</span>
        <span className="c2c-continue">{t('viewBreakdown')}</span>
      </div>
    </Link>
  )
}

function RhythmSection({ hideBible = false }: { hideBible?: boolean }) {
  const t = useTranslations('meDashboard')
  const tNav = useTranslations('navbar')
  return (
    <section className="section" id="rhythm">
      <div className="section-head">
        <span className="section-roman">II</span>
        <span className="section-eyebrow">{t('rhythmEyebrow')}</span>
        <h2 className="section-title">{t.rich('rhythmTitle', { em: (c) => <em>{c}</em> })}</h2>
        <span className="section-spacer" />
        <Link href="/me/stats" className="section-action-link">
          {t('fullBreakdown')}
        </Link>
      </div>
      <div className="c2c-grid">
        <RhythmTeaser scripture="quran" label={tNav('quran')} />
        {/* Bible is not shipped on mobile yet (no /bible route) — hidden there. */}
        {!hideBible && <RhythmTeaser scripture="bible" label={tNav('bible')} />}
      </div>
    </section>
  )
}

function CategoriesSection() {
  const t = useTranslations('meDashboard')
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
        <span className="section-roman">III</span>
        <span className="section-eyebrow">{t('bookmarksEyebrow')}</span>
        <h2 className="section-title">
          <Link href="/me/bookmarks" className="hover:text-[var(--ed-accent)] transition-colors">
            {t.rich('bookmarksTitle', { em: (c) => <em>{c}</em> })}
          </Link>
        </h2>
        <span className="section-spacer" />
        <button type="button" className="section-action" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" aria-hidden />
          {t('newCategory')}
        </button>
      </div>
      {categories.length > 4 && (
        <label className="flex items-center gap-2 border-b border-[var(--ed-rule)] focus-within:border-[var(--ed-accent)] max-w-md mb-4">
          <Search className="w-4 h-4 text-[var(--ed-fg-muted)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchCategories')}
            className="flex-1 bg-transparent outline-none py-2 font-[var(--font-source-serif)] text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)]"
          />
        </label>
      )}
      <div className="cat-grid">
        {filtered.map((cat) => (
          <Link
            key={cat.id}
            href={`/me/bookmarks?id=${cat.id}`}
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
            <span className="cat-action">{t('open')}</span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-[var(--ed-fg-muted)] text-sm py-2">{t('noCategoriesMatch')}</p>
        )}
      </div>
      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </section>
  )
}

function NotesPreviewSection() {
  const t = useTranslations('meDashboard')
  const notes = useAllNotes()
  if (notes.length === 0) return null

  const recent = notes.slice(0, 4)

  return (
    <section className="section" id="notes">
      <div className="section-head">
        <span className="section-roman">IV</span>
        <span className="section-eyebrow">{t('notesEyebrow', { count: notes.length })}</span>
        <h2 className="section-title">{t.rich('notesTitle', { em: (c) => <em>{c}</em> })}</h2>
        <span className="section-spacer" />
        <Link href="/me/notes" className="section-action-link">
          {t('openAllNotes', { count: notes.length })}
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
  const t = useTranslations('meDashboard')
  const locale = useLocale()
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
        <span className="date">{relativeTime(note.updated_at, t, locale)}</span>
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
  const t = useTranslations('meDashboard')
  const collections = useCollections()
  if (collections.length === 0) return null

  return (
    <section className="section" id="collections">
      <div className="section-head">
        <span className="section-roman">V</span>
        <span className="section-eyebrow">{t('collectionsEyebrow')}</span>
        <h2 className="section-title">
          <Link href="/me/collections" className="hover:text-[var(--ed-accent)] transition-colors">
            {t.rich('collectionsTitle', { em: (c) => <em>{c}</em> })}
          </Link>
        </h2>
        <span className="section-spacer" />
        <Link href="/me/collections" className="section-action-link">
          {t('viewAllCollections', { count: collections.length })}
        </Link>
      </div>
      <div className="coll-list">
        {collections.slice(0, 4).map((col, idx) => (
          <Link key={col.id} href={`/me/collections?id=${col.id}`} className="coll-row">
            <span className="coll-num">{roman(idx + 1)}</span>
            <div>
              <h3 className="coll-title">{col.name}</h3>
              {col.description ? <p className="coll-desc">{col.description}</p> : null}
            </div>
            <span className="coll-meta">—</span>
            {col.is_public ? (
              <span className="coll-public inline-flex items-center gap-1">
                <Share2 className="w-3 h-3" aria-hidden />
                {t('public')}
              </span>
            ) : (
              <span className="coll-meta">{t('private')}</span>
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
  const t = useTranslations('meDashboard')
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={t('streakInfoAria')}
          className="stat-info"
          onClick={(e) => e.preventDefault()}
        >
          <Info className="w-3 h-3" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
        {t('streakInfoBody')}
      </TooltipContent>
    </Tooltip>
  )
}

function StatsGrid({
  quranStreak,
  bibleStreak,
  noteCount,
  totalBookmarks,
  hideBible = false,
}: {
  quranStreak: number
  bibleStreak: number
  noteCount: number
  totalBookmarks: number
  hideBible?: boolean
}) {
  const t = useTranslations('meDashboard')
  const tHeader = useTranslations('meHeader')
  const tCommon = useTranslations('common')
  const cells = (
    <>
      <div>
        <Flame className="stat-flame" aria-hidden />
        <p className="stat-eyebrow">
          {t('quranStreak')}
          <StreakInfoIcon />
        </p>
        <div className="stat-num">
          {quranStreak}
          <span className="unit">{t('days')}</span>
        </div>
        <p className="stat-sub">{tCommon('finalTestament')}</p>
      </div>
      {/* Bible is not shipped on mobile yet (no /bible route) — hidden there. */}
      {!hideBible && (
        <div>
          <Flame className="stat-flame" aria-hidden />
          <p className="stat-eyebrow">
            {t('bibleStreak')}
            <StreakInfoIcon />
          </p>
          <div className="stat-num">
            {bibleStreak}
            <span className="unit">{t('days')}</span>
          </div>
          <p className="stat-sub">{t('oldNewTestament')}</p>
        </div>
      )}
      <Link href="/me/notes">
        <p className="stat-eyebrow">{tHeader('notes')}</p>
        <div className="stat-num">{noteCount}</div>
        <p className="stat-sub">{t('acrossBothScriptures')}</p>
      </Link>
      <Link href="/me#bookmarks">
        <p className="stat-eyebrow">{tHeader('bookmarks')}</p>
        <div className="stat-num">{totalBookmarks}</div>
        <p className="stat-sub">{t('savedVerses')}</p>
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
  const t = useTranslations('meDashboard')
  return (
    <>
      <div className="profile-mast">
        <div>
          <h1>{name ? italicizeLast(name) : <em>{t('readerFallback')}</em>}</h1>
          {email ? (
            <div className="profile-mast-meta">
              <span>{email}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="profile-mast-mobile">
        <h1>{name ? italicizeLast(name) : <em>{t('readerFallback')}</em>}</h1>
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
  const t = useTranslations('meDashboard')
  const tNotes = useTranslations('meNotes')
  const em = { em: (c: React.ReactNode) => <em>{c}</em> }
  return (
    <>
      <section className="section">
        <div className="section-head">
          <span className="section-roman">I</span>
          <span className="section-eyebrow">{t('welcomeEyebrow')}</span>
          <h2 className="section-title">{t.rich('beginTitle', em)}</h2>
        </div>
        <div className="empty">
          <span className="empty-glyph">§</span>
          <h3 className="empty-title">{t('welcomeTitle')}</h3>
          <p className="empty-verse">{t('welcomeVerse')}</p>
          <span className="empty-cite">{t('welcomeCite')}</span>
          <Link href="/quran/1" className="empty-cta">
            {tNotes('emptyCta')}
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="section-roman">II</span>
          <span className="section-eyebrow">{t('threeStepsEyebrow')}</span>
          <h2 className="section-title">{t.rich('threeStepsTitle', em)}</h2>
        </div>
        <div className="c2c-grid">
          <div className="c2c-card">
            <span className="c2c-mono">I</span>
            <h3 className="c2c-title">{t('step1Title')}</h3>
            <p className="text-[var(--ed-fg-muted)] text-[14px]">{t('step1Body')}</p>
          </div>
          <div className="c2c-card">
            <span className="c2c-mono">II</span>
            <h3 className="c2c-title">{t('step2Title')}</h3>
            <p className="text-[var(--ed-fg-muted)] text-[14px]">{t('step2Body')}</p>
          </div>
          <div className="c2c-card">
            <span className="c2c-mono">III</span>
            <h3 className="c2c-title">{t('step3Title')}</h3>
            <p className="text-[var(--ed-fg-muted)] text-[14px]">{t('step3Body')}</p>
          </div>
        </div>
      </section>
    </>
  )
}

interface MeDashboardProps {
  name?: string | null
  email?: string | null
  // Sign-out is platform-specific: web wraps next-auth signOut, mobile uses the
  // native MobileAuthProvider. The dashboard stays auth-library agnostic.
  onSignOut: () => void
  /** Provider name shown under the sign-out button. Provider names (Google,
   *  Apple, Email) are proper nouns and passed through untranslated; omitting
   *  this falls back to the translated "Magic link". */
  providerLabel?: string
  // Hide all Bible-specific content. The mobile app has no /bible route yet, so
  // it opts in; web leaves this false and shows Bible as before.
  hideBible?: boolean
}

export default function MeDashboard({
  name,
  email,
  onSignOut,
  providerLabel,
  hideBible = false,
}: MeDashboardProps) {
  const t = useTranslations('meDashboard')
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

  return (
    <>
      <ProfileMast name={name} email={email} />
      {isNewUser ? null : (
        <StatsGrid
          quranStreak={quranStreak?.current_streak ?? 0}
          bibleStreak={bibleStreak?.current_streak ?? 0}
          noteCount={noteCount}
          totalBookmarks={totalBookmarks}
          hideBible={hideBible}
        />
      )}

      {isNewUser ? (
        <NewUserStarter />
      ) : (
        <>
          <CoverToCoverSection hideBible={hideBible} />
          <RhythmSection hideBible={hideBible} />
          <CategoriesSection />
          <NotesPreviewSection />
          <CollectionsSection />
        </>
      )}

      <div className="signout">
        <button type="button" onClick={onSignOut}>
          {t('signOut')}
        </button>
        <span className="signout-meta">
          {t('signedInVia', { provider: providerLabel ?? t('providerMagicLink') })}
        </span>
      </div>
    </>
  )
}
