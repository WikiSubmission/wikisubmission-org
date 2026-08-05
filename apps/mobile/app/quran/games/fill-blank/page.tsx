'use client'

import { useTranslations } from 'next-intl'
import { FillBlankPicker } from '@/components/games/fill-blank-picker'
import { GamesOverview } from '@/components/games/games-overview'

// Fill-the-blank entry screen: difficulty/size picker plus the player's stats
// overview. Both are the shared client components used on web; only the heading
// chrome is mobile-local since the shell already owns the back navigation.
export default function FillBlankEntryPage() {
  const t = useTranslations('games')

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <h1 className="font-serif text-2xl font-semibold leading-tight">{t('fillBlankTitle')}</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{t('fillBlankIntro')}</p>

      <FillBlankPicker />
      <GamesOverview />
    </div>
  )
}
