'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCommandMenu } from '@/components/command-menu/use-command-menu'

const F = {
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
}

/**
 * Visible affordance for the command menu, sitting in the nav's action row.
 *
 * The menu used to be discoverable only by guessing at a shortcut; this button
 * both opens it and advertises the key that does the same thing. It subscribes
 * to `openMenu` only — a stable action — so the nav never re-renders when the
 * menu opens or closes.
 */
export function CommandMenuTrigger() {
  const t = useTranslations('commandMenu')
  const openMenu = useCommandMenu((s) => s.openMenu)

  return (
    <button
      type="button"
      onClick={() => openMenu()}
      aria-label={t('openLabel')}
      title={t('openLabel')}
      className="site-header-action flex items-center gap-1.5 h-[34px] px-2 sm:px-2.5 rounded-[2px] transition-colors"
      style={{
        color: 'var(--ed-fg-muted)',
        border: '1px solid var(--ed-rule)',
        background: 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-fg)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-rule)'
      }}
    >
      <Search size={13} aria-hidden />
      <kbd
        aria-hidden
        className="hidden sm:flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-[2px]"
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          lineHeight: 1,
          color: 'var(--ed-fg-muted)',
          border: '1px solid var(--ed-rule)',
          background: 'color-mix(in oklab, var(--ed-fg), transparent 94%)',
        }}
      >
        /
      </kbd>
    </button>
  )
}
