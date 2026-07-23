'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
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

const mono = 'var(--font-jetbrains), ui-monospace, monospace'
const serif = 'var(--font-source-serif), Georgia, serif'

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
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'h-[34px] flex items-center gap-1 px-2.5 rounded-[2px] transition-colors',
            isPending && 'opacity-40 pointer-events-none'
          )}
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
            border: '1px solid var(--ed-rule)',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-fg)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg-muted)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-rule)'
          }}
          // The visible text must lead the accessible name (WCAG 2.5.3 label in name).
          aria-label={`${current.label}, switch language`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
          </svg>
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
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            disabled={isPending}
            onClick={() => handleSelect(locale.code)}
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-2 rounded-sm cursor-pointer',
              locale.code === currentLocale
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.16em' }}>
              {locale.label}
            </span>
            <span style={{ fontFamily: serif, fontSize: 13 }}>
              {locale.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
