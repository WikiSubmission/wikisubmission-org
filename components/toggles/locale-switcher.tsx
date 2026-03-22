'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setLocale } from '@/app/actions/locale'
import { cn } from '@/lib/utils'

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'العربية' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'tr', label: 'TR', flag: '🇹🇷', name: 'Türkçe' },
]

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSelect(locale: string) {
    startTransition(async () => {
      await setLocale(locale)
      router.refresh()
    })
  }

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0]

  return (
    <div className="relative group">
      <button
        className={cn(
          'h-9 flex items-center gap-1.5 px-2.5 rounded-md text-sm font-medium transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          isPending && 'opacity-50 pointer-events-none'
        )}
        aria-label="Switch language"
      >
        <span>{current.flag}</span>
        <span className="text-xs font-semibold tracking-wide">{current.label}</span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border/50 bg-background shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
        {LOCALES.map((locale) => (
          <button
            key={locale.code}
            onClick={() => handleSelect(locale.code)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50',
              locale.code === currentLocale
                ? 'text-primary font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <span>{locale.flag}</span>
            <span>{locale.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
