'use client'

import Link from 'next/link'
import { Bookmark, FileText, Library } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import { useStreak } from '@/hooks/use-reading-streak'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useCollections } from '@/hooks/use-collections'
import { useNoteCount } from '@/hooks/use-notes'
import { useReadingStats } from '@/hooks/use-reading-stats'
import { italicizeLast } from '@/components/editorial/section-header'
import { ReadingHeatmap } from './stats/reading-heatmap'

const QURAN_TOTAL_CHAPTERS = 114
const BIBLE_TOTAL_BOOKS = 66

function chapterFromKey(key: string | undefined | null): number {
  if (!key) return 0
  const n = parseInt(key.split(':')[0] ?? '0', 10)
  return Number.isFinite(n) ? n : 0
}

function ReadingRow({ scripture, label }: { scripture: 'quran' | 'bible'; label: string }) {
  const t = useTranslations('meDashboard')
  const progress = useCoverToCoverProgress(scripture)
  const streak = useStreak(scripture)
  const { data } = useReadingStats(scripture, '90d')
  const daily = data?.daily ?? []

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

  return (
    <div className="reading-card">
      <div className="reading-card-head">
        <div>
          <div className="reading-card-title-row">
            <h3 className="reading-card-title">{label}</h3>
            <span className="reading-card-progress-pill">{percent}%</span>
          </div>
          <p className="reading-card-progress-text">
            {chapterNum} / {totalChapters} {scripture === 'quran' ? 'chapters' : 'books'}
            {progress?.verse_key && (
              <span className="reading-card-verse-key"> · Currently at {progress.verse_key}</span>
            )}
          </p>
        </div>

        <Link href={continueHref} className="reading-card-continue-btn">
          <span>{t('continueReading').replace(/→\s*$/, '').trim()}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="reading-card-progress-track">
        <div className="reading-card-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="reading-card-heatmap-section">
        <ReadingHeatmap
          scripture={scripture}
          data={daily}
          streakDays={streak?.current_streak ?? 0}
        />
      </div>
    </div>
  )
}

function ReadingSection({ hideBible = false }: { hideBible?: boolean }) {
  const tNav = useTranslations('navbar')
  return (
    <section className="me-section" id="reading">
      <div className="me-section-head">
        <h2 className="me-section-title">Reading</h2>
        <Link href="/me/stats" className="me-section-link">
          Full breakdown →
        </Link>
      </div>
      <div className="reading-stack">
        <ReadingRow scripture="quran" label={tNav('quran')} />
        {!hideBible && <ReadingRow scripture="bible" label={tNav('bible')} />}
      </div>
    </section>
  )
}

function SavedSection() {
  const categories = useBookmarkCategories()
  const noteCount = useNoteCount()
  const collections = useCollections()
  const totalBookmarks = categories.reduce((s, c) => s + c.entry_count, 0)

  return (
    <section className="me-section" id="saved">
      <div className="me-section-head">
        <h2 className="me-section-title">Saved Material</h2>
        <Link href="/me/bookmarks" className="me-section-link">
          View all saved material →
        </Link>
      </div>
      <div className="saved-register">
        <Link href="/me/bookmarks" className="saved-register-item">
          <div className="saved-register-icon-wrap">
            <Bookmark className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
          </div>
          <div className="saved-register-body">
            <span className="saved-register-label">Bookmarks</span>
            <span className="saved-register-desc">
              {totalBookmarks} saved verses across {categories.length} categories
            </span>
          </div>
          <span className="saved-register-count">{totalBookmarks}</span>
        </Link>

        <Link href="/me/notes" className="saved-register-item">
          <div className="saved-register-icon-wrap">
            <FileText className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
          </div>
          <div className="saved-register-body">
            <span className="saved-register-label">Study Notes</span>
            <span className="saved-register-desc">
              {noteCount} annotations & reflections
            </span>
          </div>
          <span className="saved-register-count">{noteCount}</span>
        </Link>

        <Link href="/me/collections" className="saved-register-item">
          <div className="saved-register-icon-wrap">
            <Library className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
          </div>
          <div className="saved-register-body">
            <span className="saved-register-label">Collections</span>
            <span className="saved-register-desc">
              {collections.length} curated scripture collections
            </span>
          </div>
          <span className="saved-register-count">{collections.length}</span>
        </Link>
      </div>
    </section>
  )
}

function StatsSummary({
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
  return (
    <div className="me-summary-bar">
      <div className="me-summary-item">
        <span className="me-summary-label">Quran streak:</span>
        <strong className="me-summary-val">{quranStreak} days</strong>
      </div>
      {!hideBible && (
        <div className="me-summary-item">
          <span className="me-summary-label">Bible streak:</span>
          <strong className="me-summary-val">{bibleStreak} days</strong>
        </div>
      )}
      <div className="me-summary-item">
        <span className="me-summary-label">Notes:</span>
        <strong className="me-summary-val">{noteCount}</strong>
      </div>
      <div className="me-summary-item">
        <span className="me-summary-label">Bookmarks:</span>
        <strong className="me-summary-val">{totalBookmarks}</strong>
      </div>
    </div>
  )
}

function ProfileMast({ name, email }: { name?: string | null; email?: string | null }) {
  const t = useTranslations('meDashboard')
  return (
    <div className="profile-mast">
      <div>
        <h1 className="profile-mast-title">{name ? italicizeLast(name) : <em>{t('readerFallback')}</em>}</h1>
        {email ? (
          <div className="profile-mast-meta">
            <span>{email}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface MeDashboardProps {
  name?: string | null
  email?: string | null
  onSignOut: () => void
  providerLabel?: string
  hideBible?: boolean
  hideStudy?: boolean
  customMasthead?: React.ReactNode
  settingsSection?: React.ReactNode
}

export default function MeDashboard({
  name,
  email,
  onSignOut,
  providerLabel,
  hideBible = false,
  hideStudy = false,
  customMasthead,
  settingsSection,
}: MeDashboardProps) {
  const t = useTranslations('meDashboard')
  const quranStreak = useStreak('quran')
  const bibleStreak = useStreak('bible')
  const categories = useBookmarkCategories()
  const noteCount = useNoteCount()
  const totalBookmarks = categories.reduce((s, c) => s + c.entry_count, 0)

  return (
    <div className="me-dashboard-content">
      {customMasthead ?? <ProfileMast name={name} email={email} />}

      <StatsSummary
        quranStreak={quranStreak?.current_streak ?? 0}
        bibleStreak={bibleStreak?.current_streak ?? 0}
        noteCount={noteCount}
        totalBookmarks={totalBookmarks}
        hideBible={hideBible}
      />

      <ReadingSection hideBible={hideBible} />

      {!hideStudy && <SavedSection />}

      {settingsSection && (
        <section className="me-section" id="settings">
          <div className="me-section-head">
            <h2 className="me-section-title">Settings</h2>
          </div>
          {settingsSection}
        </section>
      )}

      <div className="signout">
        <button type="button" onClick={onSignOut}>
          {t('signOut')}
        </button>
        <span className="signout-meta">
          {t('signedInVia', { provider: providerLabel ?? t('providerMagicLink') })}
        </span>
      </div>
    </div>
  )
}
