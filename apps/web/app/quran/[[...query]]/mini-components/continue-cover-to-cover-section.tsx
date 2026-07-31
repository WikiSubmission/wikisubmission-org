'use client'

import { ContinueCoverToCover } from '@/components/quran-reader/continue-cover-to-cover'

/**
 * Wrapper around the shared cover-to-cover card for the /quran landing. Chapter
 * titles come from the server component's /chapters fetch, so no extra request
 * is made here. The card translates its own copy from the `quran` catalog — only
 * the web-specific hover styling is passed in.
 */
export function ContinueCoverToCoverSection({
  chapterTitles,
}: {
  chapterTitles: Record<number, string>
}) {
  return (
    <ContinueCoverToCover
      getChapterTitle={(n) => chapterTitles[n]}
      linkClassName="hover:bg-muted/60 hover:border-border transition-all"
    />
  )
}
