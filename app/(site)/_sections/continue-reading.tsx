'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen, Bookmark } from 'lucide-react'
import { useReadingProgress } from '@/hooks/use-reading-progress'
import { useBookmarksList } from '@/hooks/use-bookmarks'
import { F } from './shared'

function ContinueCard({
  icon: Icon,
  label,
  verseKey,
  scripture,
  tagline,
}: {
  icon: typeof BookOpen
  label: string
  verseKey: string
  scripture: string
  tagline: string
}) {
  const [chapter, verse] = verseKey.split(':')
  const href = scripture === 'quran' ? `/quran/${chapter}?verse=${verse}` : `/bible/${verseKey}`

  return (
    <Link
      href={href}
      className="ed-card flex items-center gap-4"
      style={{
        backgroundColor: 'var(--ed-surface)',
        padding: 'clamp(16px, 4vw, 24px)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'var(--ed-bg-alt)',
          border: '1px solid var(--ed-rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 18, height: 18, color: 'var(--ed-fg-muted)' }} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
          }}
        >
          {tagline}
        </span>
        <span
          style={{
            fontFamily: F.display,
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--ed-fg)',
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: 'var(--ed-fg-muted)',
            letterSpacing: '0.1em',
          }}
        >
          {verseKey}
        </span>
      </div>
    </Link>
  )
}

export function ContinueReadingSection() {
  const { status } = useSession()
  const quranProgress = useReadingProgress('quran')
  const bibleProgress = useReadingProgress('bible')
  const quranBookmarks = useBookmarksList('quran')
  const bibleBookmarks = useBookmarksList('bible')

  if (status !== 'authenticated') return null

  const c2cQuran = quranBookmarks.find((b) => b.kind === 'cover_to_cover')
  const c2cBible = bibleBookmarks.find((b) => b.kind === 'cover_to_cover')

  const cards: React.ReactNode[] = []

  if (quranProgress?.verse_key) {
    cards.push(
      <ContinueCard
        key="quran-progress"
        icon={BookOpen}
        label="Continue in Quran"
        verseKey={quranProgress.verse_key}
        scripture="quran"
        tagline="Last read"
      />
    )
  }
  if (c2cQuran?.verse_key) {
    cards.push(
      <ContinueCard
        key="quran-c2c"
        icon={Bookmark}
        label="Cover-to-cover Quran"
        verseKey={c2cQuran.verse_key}
        scripture="quran"
        tagline="Bookmark"
      />
    )
  }
  if (bibleProgress?.verse_key) {
    cards.push(
      <ContinueCard
        key="bible-progress"
        icon={BookOpen}
        label="Continue in Bible"
        verseKey={bibleProgress.verse_key}
        scripture="bible"
        tagline="Last read"
      />
    )
  }
  if (c2cBible?.verse_key) {
    cards.push(
      <ContinueCard
        key="bible-c2c"
        icon={Bookmark}
        label="Cover-to-cover Bible"
        verseKey={c2cBible.verse_key}
        scripture="bible"
        tagline="Bookmark"
      />
    )
  }

  if (cards.length === 0) return null

  return (
    <section
      style={{ padding: 'clamp(32px, 5vw, 48px) 0' }}
    >
      <div className="px-4 sm:px-6 md:px-10" style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 9,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
            marginBottom: 16,
          }}
        >
          Continue reading
        </div>
        <div className="grid grid-cols-2 max-sm:grid-cols-1" style={{ gap: 12 }}>
          {cards}
        </div>
      </div>
    </section>
  )
}
