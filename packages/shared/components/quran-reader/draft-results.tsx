'use client'

import { useTranslations } from 'next-intl'
import { SearchIcon } from 'lucide-react'
import { VerseCard } from '@/components/quran-reader/verse-card'
import { useLocalVerseSearch } from '@/hooks/use-local-verse-search'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'

/**
 * How many matches the reader renders while a draft is active.
 *
 * High enough that a common word still shows a useful spread, low enough that
 * the list stays a plain map — the draft changes on every keystroke, and
 * standing up a virtualizer per keystroke costs more than it saves. Anything
 * past this is what pressing Enter is for.
 */
const DRAFT_LIMIT = 60

/**
 * The verses matching what is being typed, rendered as reader cards.
 *
 * This replaces what the search bar used to show as an autocomplete dropdown.
 * The hit list is the same one `useLocalVerseSearch` produces — whole-Quran when
 * the background sweep ran, the open chapter when it was declined for a slow
 * device or connection — but it is shown where the verses live, at full width,
 * with the same card the reader and the results view use.
 *
 * Nothing here touches the network. It is a view over what is already in memory,
 * which is what makes it safe to re-run on every keystroke.
 */
export function QuranDraftResults({ query }: { query: string }) {
  const t = useTranslations('search')
  const prefs = useQuranPreferences()
  const { isSignedIn } = useScriptureAuth()

  const primaryCode =
    prefs.primaryLanguage === 'xl' || prefs.primaryLanguage === 'none'
      ? 'en'
      : prefs.primaryLanguage

  const local = useLocalVerseSearch(query, { primaryLang: primaryCode, limit: DRAFT_LIMIT })
  const verses = (local.data?.chapters?.flatMap((chapter) => chapter.verses ?? []) ?? [])
    .slice()
    .sort((a, b) => {
      const [ac, av] = (a.vk ?? '0:0').split(':').map(Number)
      const [bc, bv] = (b.vk ?? '0:0').split(':').map(Number)
      return ac === bc ? av - bv : ac - bc
    })

  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? ''}-${prefs.zoomLevel ?? 'comfortable'}-${prefs.arabic}-${prefs.wordByWord}`

  // Always shown, including on an empty result, because the scope is what makes
  // the emptiness readable: "not in this sura" is a different statement from
  // "not in the Quran", and only Enter can make the second one.
  const scope = local.source === 'results' ? t('sourceResults') : t('sourceThisChapter')

  return (
    <div
      className={`${ZOOM_WIDTH_CLASS[prefs.zoomLevel ?? 'comfortable']} mx-auto w-full space-y-3 px-4 pt-4`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm text-muted-foreground">
          {verses.length > 0
            ? t('draftMatches', { count: verses.length, query })
            : t('draftEmpty', { query })}
        </p>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
          {scope}
        </span>
      </div>

      {verses.length > 0 && (
        <div className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden">
          {verses.map((verse, index) => {
            const [chapterNumber, verseNumber] = (verse.vk ?? '').split(':').map(Number)
            const translation = verse.tr?.[primaryCode] ?? verse.tr?.['en']
            return (
              <VerseCard
                key={verse.vk ?? index}
                verse={verse}
                isLast={index === verses.length - 1}
                optsKey={optsKey}
                showAudio={false}
                showBookmark={isSignedIn}
                showNotes={isSignedIn}
                verseHref={`/quran/${chapterNumber}?verse=${verseNumber}`}
                searchHighlight={translation?.hl ?? undefined}
              />
            )
          })}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground/70">
        <SearchIcon className="size-3 shrink-0" />
        {t('draftHint')}
      </p>
    </div>
  )
}
