import { BookOpen, Gamepad2, LayoutGrid, Sunrise, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Bottom-tab navigation model for the mobile app.
 *
 * Mobile uses a five-slot tab bar instead of the web's top horizontal nav +
 * hamburger sheet. Search is not a tab (it lives inside the Quran reader);
 * Today (prayer times) is the home tab; secondary content (Miracle, Articles,
 * Bible) lives under More.
 */
export interface TabItem {
  key: string
  href: string
  label: string
  icon: LucideIcon
}

export const TABS: readonly TabItem[] = [
  { key: 'today', href: '/', label: 'Today', icon: Sunrise },
  { key: 'quran', href: '/quran', label: 'Quran', icon: BookOpen },
  { key: 'games', href: '/quran/games', label: 'Games', icon: Gamepad2 },
  { key: 'profile', href: '/me', label: 'Profile', icon: User },
  { key: 'more', href: '/more', label: 'More', icon: LayoutGrid },
]

/** Strip a trailing slash so `output: 'export'` paths match the tab hrefs. */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

/** Library routes mirror web URLs (so shared links work) but live under More. */
const MORE_ALIAS_PREFIXES = ['/introduction', '/proclamation', '/appendices'] as const

/**
 * Resolve the active tab for a pathname. Longest-href-first so a nested route
 * like `/quran/2` maps to the Quran tab, while `/` only matches Today exactly.
 */
export function activeTab(pathname: string): TabItem | undefined {
  const path = normalizePath(pathname)
  if (MORE_ALIAS_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return TABS.find((tab) => tab.key === 'more')
  }
  return [...TABS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((tab) =>
      tab.href === '/' ? path === '/' : path === tab.href || path.startsWith(`${tab.href}/`),
    )
}

/** A tab root is the tab's own href; deeper paths are pushed screens. */
export function isTabRoot(pathname: string): boolean {
  const path = normalizePath(pathname)
  const tab = activeTab(path)
  return tab ? path === tab.href : false
}
