'use client'

import Link from 'next/link'
import { ArrowRight, BookMarked } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCoverToCoverProgress } from '@/hooks/use-reading-progress'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { parseCoverToCover } from '@/lib/cover-to-cover'

export interface ContinueCoverToCoverLabels {
  eyebrow: string
  cta: string
  /** Receives the verse key, e.g. "Currently at 5:23". */
  currentlyAt: (verseKey: string) => string
  /** Receives the chapter number and its title, e.g. "Sura 5: The Feast". */
  chapter: (chapterNumber: number, title: string) => string
}

export interface ContinueCoverToCoverProps {
  getChapterTitle?: (chapterNumber: number) => string | undefined
  /** Per-caller copy overrides; defaults come from the `quran` catalog. */
  labels?: Partial<ContinueCoverToCoverLabels>
  /** Applied to the root element — spacing is the caller's business. */
  className?: string
  /** Interaction classes differ per platform: hover: on web, active: on mobile. */
  linkClassName?: string
  onNavigate?: () => void
}

/**
 * "Continue cover to cover" card for the Quran index. Surfaces the verse the
 * reader last marked via the verse menu (PUT /me/cover-to-cover) so getting
 * back to it is one tap. Renders nothing for signed-out readers or before a
 * first verse has been marked.
 */
export function ContinueCoverToCover({
  getChapterTitle,
  labels,
  className = '',
  linkClassName = '',
  onNavigate,
}: ContinueCoverToCoverProps) {
  const { isSignedIn } = useScriptureAuth()
  const progress = useCoverToCoverProgress('quran')
  const t = useTranslations('quran')

  const position = parseCoverToCover(progress?.verse_key)
  if (!isSignedIn || !position) return null

  // Copy lives in the catalog so both apps are localized by default; the
  // labels prop stays for callers that need to deviate.
  const l: ContinueCoverToCoverLabels = {
    eyebrow: t('continueEyebrow'),
    cta: t('continueCta'),
    currentlyAt: (verseKey) => t('continueCurrentlyAt', { verseKey }),
    chapter: (chapterNumber, title) =>
      title ? t('chapter', { number: chapterNumber, title }) : t('sura', { number: chapterNumber }),
    ...labels,
  }
  const { chapter, verse, percent } = position
  const verseKey = `${chapter}:${verse}`
  const title = getChapterTitle?.(chapter) ?? ''

  return (
    <section className={className}>
      <Link
        href={`/quran/${chapter}?verse=${verse}`}
        onClick={onNavigate}
        className={`group flex flex-col gap-3 p-5 rounded-2xl border border-border/50 bg-muted/30 ${linkClassName}`}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookMarked className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {l.eyebrow}
            </span>
            <span className="truncate text-base font-semibold leading-tight">
              {l.chapter(chapter, title)}
            </span>
          </div>
          <ArrowRight className="rtl-flip ms-auto size-4 shrink-0 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5" />
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary/70"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate">
            <span className="font-mono">{l.currentlyAt(verseKey)}</span>
            <span aria-hidden> · {percent}%</span>
          </span>
          <span className="shrink-0 font-medium text-primary">{l.cta}</span>
        </div>
      </Link>
    </section>
  )
}
