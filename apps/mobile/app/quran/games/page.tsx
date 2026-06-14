'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight, PencilLine, Trophy } from 'lucide-react'
import { haptic } from '@/lib/haptics'

// Mobile games lobby. The shell supplies the "Games" top bar, so this screen is
// just the playable list plus a leaderboard entry. Each row links into a route
// under /quran/games/* — the same paths the shared game components navigate to,
// which is why the Games tab is rooted at /quran/games.
export default function GamesLobbyPage() {
  const t = useTranslations('games')

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{t('lobbyLede')}</p>

      <ul className="flex flex-col gap-1.5">
        <li>
          <Link
            href="/quran/games/fill-blank"
            prefetch={false}
            onClick={() => haptic('light')}
            className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3 transition-colors active:bg-muted/60"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PencilLine className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-serif text-base font-semibold leading-tight">
                {t('fillBlankTitle')}
              </span>
              <span className="truncate text-sm text-muted-foreground">{t('fillBlankSub')}</span>
            </span>
            <ChevronRight className="rtl-flip ml-auto size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>

        <li>
          <Link
            href="/quran/games/leaderboard"
            prefetch={false}
            onClick={() => haptic('light')}
            className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3 transition-colors active:bg-muted/60"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-serif text-base font-semibold leading-tight">
                {t('leaderboardTitle')}
              </span>
            </span>
            <ChevronRight className="rtl-flip ml-auto size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      </ul>
    </div>
  )
}
