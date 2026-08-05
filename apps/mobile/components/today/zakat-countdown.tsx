'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, HandCoins } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { haptic } from '@/lib/haptics'
import { useZakatReminder } from '@/hooks/use-zakat-reminder'
import { cn } from '@/lib/utils'

/**
 * Full-width zakat set-up prompt between the zikr strip and the prayer card,
 * shown only until a reminder is configured — after opt-in the compact
 * ZakatBadge on the prayer card takes over. Tapping opens the zakat page
 * (calculator + reminder setup).
 */
export function ZakatCountdown() {
  const router = useRouter()
  const t = useTranslations('mobile.zakat')
  const { prefs, loading, daysLeft } = useZakatReminder()

  const configured = prefs?.enabled && daysLeft !== null
  const dueToday = configured && daysLeft <= 0

  // Configured users get the badge on the prayer card instead of this chip.
  if (configured) return null

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <button
        type="button"
        onClick={() => {
          haptic('light')
          router.push('/zakat')
        }}
        className={cn(
          'border-border/50 bg-background/55 flex h-10 w-full items-center justify-between gap-3 rounded-full border px-4 backdrop-blur-md transition-colors',
          loading && 'opacity-0',
        )}
        aria-label={t(configured ? 'countdown' : 'setUpReminder')}
      >
        <span className="flex min-w-0 items-center gap-2">
          <HandCoins
            className={cn('size-4 shrink-0', dueToday ? 'text-primary' : 'text-muted-foreground')}
            aria-hidden="true"
          />
          {configured ? (
            <span className={cn('truncate text-xs', dueToday ? 'text-primary font-medium' : 'text-foreground')}>
              {dueToday ? t('dueToday') : t('inDays', { days: daysLeft })}
            </span>
          ) : (
            <span className="text-muted-foreground truncate text-xs">{t('setUpReminder')}</span>
          )}
        </span>
        <ChevronRight className="rtl-flip text-muted-foreground size-4 shrink-0" aria-hidden="true" />
      </button>
    </div>
  )
}
