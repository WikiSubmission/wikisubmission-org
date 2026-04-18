'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { setLocale } from '@/app/actions/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'العربية' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'tr', label: 'TR', flag: '🇹🇷', name: 'Türkçe' },
]

export function LocaleSwitcher({
  currentLocale,
  onSelect,
}: {
  currentLocale: string
  onSelect?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSelect(locale: string) {
    onSelect?.()
    startTransition(async () => {
      await setLocale(locale)
      router.refresh()
    })
  }

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
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
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            disabled={isPending}
            onClick={() => handleSelect(locale.code)}
            className={cn(
              'cursor-pointer gap-3 px-3 py-2.5',
              locale.code === currentLocale
                ? 'text-primary font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <span>{locale.flag}</span>
            <span className="flex-1">{locale.name}</span>
            {locale.code === currentLocale ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
