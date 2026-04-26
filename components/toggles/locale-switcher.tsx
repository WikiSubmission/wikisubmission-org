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
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ku', label: 'KU', name: 'کوردی' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
]

<<<<<<< HEAD
=======
const mono = 'var(--font-jetbrains), ui-monospace, monospace'
const serif = 'var(--font-source-serif), Georgia, serif'

>>>>>>> main
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
<<<<<<< HEAD
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
=======
            'h-[34px] flex items-center px-2 rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground',
            isPending && 'opacity-40 pointer-events-none'
          )}
          style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.18em' }}
          aria-label="Switch language"
        >
          {current.label}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="p-1 min-w-[148px]"
        style={{
          borderRadius: 4,
          border: '1px solid var(--ed-rule)',
          backgroundColor: 'var(--ed-surface)',
          boxShadow: '0 8px 24px -8px rgba(26,23,21,0.12)',
        }}
      >
>>>>>>> main
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            disabled={isPending}
            onClick={() => handleSelect(locale.code)}
            className={cn(
<<<<<<< HEAD
              'cursor-pointer gap-3 px-3 py-2.5',
=======
              'flex items-center justify-between gap-3 px-3 py-2 rounded-sm cursor-pointer',
>>>>>>> main
              locale.code === currentLocale
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
<<<<<<< HEAD
            <span>{locale.flag}</span>
            <span className="flex-1">{locale.name}</span>
            {locale.code === currentLocale ? <Check className="size-4" /> : null}
=======
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.16em' }}>
              {locale.label}
            </span>
            <span style={{ fontFamily: serif, fontSize: 13 }}>
              {locale.name}
            </span>
>>>>>>> main
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
