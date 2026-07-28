'use client'

import { useTranslations } from 'next-intl'
import { ContinueCoverToCover } from '@/components/quran-reader/continue-cover-to-cover'

/**
 * Localized wrapper around the shared cover-to-cover card for the /quran
 * landing. Chapter titles come from the server component's /chapters fetch, so
 * no extra request is made here.
 */
export function ContinueCoverToCoverSection({
  chapterTitles,
}: {
  chapterTitles: Record<number, string>
}) {
  const t = useTranslations('quran')

  return (
    <ContinueCoverToCover
      getChapterTitle={(n) => chapterTitles[n]}
      linkClassName="hover:bg-muted/60 hover:border-border transition-all"
      labels={{
        eyebrow: t('continueEyebrow'),
        cta: t('continueCta'),
        currentlyAt: (verseKey) => t('continueCurrentlyAt', { verseKey }),
        chapter: (number, title) => t('chapter', { number, title }),
      }}
    />
  )
}
