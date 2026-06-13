'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeTab, TABS } from '@/constants/navigation'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

/**
 * Fixed bottom tab bar — the primary navigation surface on mobile. Safe-area
 * aware so it clears the home indicator on notched devices, and gives a light
 * haptic tap on selection.
 */
export function TabBar() {
  const pathname = usePathname()
  const current = activeTab(pathname)

  return (
    <nav
      aria-label="Primary"
      className="glass-nav bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch">
        {TABS.map((tab) => {
          const isActive = current?.key === tab.key
          const Icon = tab.icon
          return (
            <li key={tab.key} className="flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => haptic('light')}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[0.625rem] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
