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
  /** Dotted message key, resolved at the render site — a module constant
   *  cannot call useTranslations(). */
  labelKey: string
  icon: LucideIcon
}

export const TABS: readonly TabItem[] = [
  { key: 'today', href: '/', labelKey: 'mobile.tabs.today', icon: Sunrise },
  { key: 'quran', href: '/quran', labelKey: 'mobile.tabs.quran', icon: BookOpen },
  { key: 'games', href: '/quran/games', labelKey: 'mobile.tabs.games', icon: Gamepad2 },
  { key: 'profile', href: '/me', labelKey: 'mobile.tabs.profile', icon: User },
  { key: 'more', href: '/more', labelKey: 'mobile.tabs.more', icon: LayoutGrid },
]

/** Strip a trailing slash so `output: 'export'` paths match the tab hrefs. */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

/** Library routes mirror web URLs (so shared links work) but are entered from the Quran tab. */
const QURAN_ALIAS_PREFIXES = ['/introduction', '/proclamation', '/appendices'] as const

/** Screens reached from the Today tab (pushed, so the back chevron shows). */
const TODAY_ALIAS_PREFIXES = ['/zakat'] as const

/** Message keys for pushed screens that are not tab roots. */
const SCREEN_TITLE_KEYS: Record<string, string> = {
  '/zakat': 'mobile.nav.zakatScreen',
}

/** Message key for a pushed screen's top-bar title, when it has one. */
export function screenTitleKey(pathname: string): string | undefined {
  return SCREEN_TITLE_KEYS[normalizePath(pathname)]
}

/**
 * Resolve the active tab for a pathname. Longest-href-first so a nested route
 * like `/quran/2` maps to the Quran tab, while `/` only matches Today exactly.
 */
export function activeTab(pathname: string): TabItem | undefined {
  const path = normalizePath(pathname)
  if (QURAN_ALIAS_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return TABS.find((tab) => tab.key === 'quran')
  }
  if (TODAY_ALIAS_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return TABS.find((tab) => tab.key === 'today')
  }
  return [...TABS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((tab) =>
      tab.href === '/' ? path === '/' : path === tab.href || path.startsWith(`${tab.href}/`),
    )
}

/**
 * Immersive reader routes (chapter pages like `/quran/2`): the tab bar is
 * hidden entirely and the top bar auto-hides on scroll to maximize the
 * reading window. Games/search under /quran keep the normal chrome.
 */
export function isQuranReaderRoute(pathname: string): boolean {
  return /^\/quran\/\d+$/.test(normalizePath(pathname))
}

/** A tab root is the tab's own href; deeper paths are pushed screens. */
export function isTabRoot(pathname: string): boolean {
  const path = normalizePath(pathname)
  const tab = activeTab(path)
  return tab ? path === tab.href : false
}
