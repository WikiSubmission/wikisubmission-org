'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, BarChart3, Bookmark, Flame, StickyNote } from 'lucide-react'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useNotesByScripture } from '@/hooks/use-notes'
import { useStreak } from '@/hooks/use-reading-streak'
import { useReadingStats } from '@/hooks/use-reading-stats'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import { parseCoverToCover } from '@/lib/cover-to-cover'

/**
 * The "Your study" band of the /quran hub: bookmarks, notes and reading stats,
 * scoped to the Quran.
 *
 * These are previews, not the full screens. The all-scripture views stay at
 * /me/bookmarks, /me/notes and /me/stats, which each section links to: Bible
 * bookmarks, notes and stats live there too, and folding them into /quran would
 * leave them unreachable. The shared components in components/me/ are therefore
 * untouched, so /me and apps/mobile behave exactly as before.
 *
 * Every hook here is gated on isSignedIn inside itself, so a signed-out visitor
 * triggers no requests and sees a single prompt instead of three empty panels.
 */

function SectionShell({
  icon,
  title,
  description,
  href,
  seeAllLabel,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  seeAllLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/50 bg-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {icon}
            {title}
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <Link
          href={href}
          className="group inline-flex items-center gap-1 shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {seeAllLabel}
          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      {children}
    </div>
  )
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground/70">{children}</p>
}

function BookmarksPreview() {
  const t = useTranslations('quran')
  const categories = useBookmarkCategories()

  const withEntries = categories.filter((c) => c.entry_count > 0).slice(0, 4)

  return (
    <SectionShell
      icon={<Bookmark className="size-4 text-primary/70" />}
      title={t('studyBookmarks')}
      description={t('studyBookmarksDesc')}
      href="/me/bookmarks"
      seeAllLabel={t('seeAll')}
    >
      {withEntries.length === 0 ? (
        <EmptyLine>{t('studyEmptyBookmarks')}</EmptyLine>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {withEntries.map((category) => (
            <li key={category.id}>
              <Link
                href="/me/bookmarks"
                className="inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-lg bg-background/60 border border-border/40 text-xs hover:border-border transition-colors"
              >
                <span className="truncate max-w-32">{category.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {category.entry_count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}

function NotesPreview() {
  const t = useTranslations('quran')
  const notes = useNotesByScripture('quran')

  const recent = [...notes]
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
    .slice(0, 3)

  return (
    <SectionShell
      icon={<StickyNote className="size-4 text-primary/70" />}
      title={t('studyNotes')}
      description={t('studyNotesDesc')}
      href="/me/notes"
      seeAllLabel={t('seeAll')}
    >
      {recent.length === 0 ? (
        <EmptyLine>{t('studyEmptyNotes')}</EmptyLine>
      ) : (
        <ul className="space-y-1.5">
          {recent.map((note) => {
            const [chapter, verse] = note.verse_key.split(':')
            return (
              <li key={note.id}>
                <Link
                  href={`/quran/${chapter}?verse=${verse}`}
                  className="flex items-baseline gap-2 text-xs hover:text-foreground transition-colors"
                >
                  <span className="font-mono text-muted-foreground shrink-0 tabular-nums">
                    {note.verse_key}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {note.content}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionShell>
  )
}

function StatsPreview() {
  const t = useTranslations('quran')
  const tStats = useTranslations('meStats')
  const streak = useStreak('quran')
  const { data: stats } = useReadingStats('quran', '30d')
  const coverToCover = useCoverToCoverProgress('quran')

  const position = parseCoverToCover(coverToCover?.verse_key)
  const hasAnything =
    (streak?.total_verses_read ?? 0) > 0 || (stats?.total ?? 0) > 0 || position !== null

  return (
    <SectionShell
      icon={<BarChart3 className="size-4 text-primary/70" />}
      title={t('studyStats')}
      description={t('studyStatsDesc')}
      href="/me/stats"
      seeAllLabel={t('seeAll')}
    >
      {!hasAnything ? (
        <EmptyLine>{t('studyEmptyStats')}</EmptyLine>
      ) : (
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">
              {tStats('currentStreak')}
            </dt>
            <dd className="flex items-baseline gap-1 text-lg font-semibold tabular-nums">
              {streak?.current_streak ?? 0}
              {(streak?.current_streak ?? 0) > 0 && (
                <Flame className="size-3.5 text-primary/70" aria-hidden />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {tStats('versesInRange')}
            </dt>
            <dd className="text-lg font-semibold tabular-nums">
              {stats?.total ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {tStats('activeDays')}
            </dt>
            <dd className="text-lg font-semibold tabular-nums">
              {stats?.active_days ?? 0}
            </dd>
          </div>
        </dl>
      )}
    </SectionShell>
  )
}

export function QuranStudyBand() {
  const t = useTranslations('quran')
  const { isSignedIn } = useScriptureAuth()

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
        {t('bandStudy')}
      </h2>

      {!isSignedIn ? (
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/50 bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t('studySignInTitle')}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t('studySignInBody')}
            </p>
          </div>
          <Link
            href="/auth/sign-in?next=/quran"
            className="group inline-flex items-center justify-center gap-1.5 shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('studySignInCta')}
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BookmarksPreview />
          <NotesPreview />
          <div className="md:col-span-2">
            <StatsPreview />
          </div>
        </div>
      )}
    </section>
  )
}
