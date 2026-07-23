'use client'

/**
 * The sidebar user block, as a dropdown. Mirrors the site nav's UserMenu
 * (components/user-menu.tsx): a Language submenu backed by the `locale` cookie
 * and a Theme submenu over the shared palette set, so the editor offers the same
 * themes as the rest of the site rather than a private light/dark switch.
 */
import { useTransition, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { setLocale } from '@/app/actions/locale'
import { PALETTES, usePalette, type PaletteKey } from '@/lib/theme-palette-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { IGlobe, IPalette, ILogout, IChevD } from './icons'
import type { EditorViewer } from './sidebar'

const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ku', label: 'KU', name: 'کوردی' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
]

type Mode = 'light' | 'dark'

function resolveMode(theme: string | undefined, systemTheme: string | undefined): Mode {
  const resolved = theme === 'system' ? systemTheme : theme
  return resolved === 'dark' ? 'dark' : 'light'
}

interface EditorUserMenuProps {
  viewer: EditorViewer
  signOutAction: () => void
}

export function EditorUserMenu({ viewer, signOutAction }: EditorUserMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const currentLocale = useLocale()
  const { palette, setPalette } = usePalette()
  const { theme, systemTheme, setTheme } = useTheme()
  // Neither the stored palette nor the resolved mode is known until after
  // hydration; rendering an active swatch before then would mismatch the server.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const mode = resolveMode(theme, systemTheme)

  function handleSelectLocale(locale: string) {
    startTransition(async () => {
      await setLocale(locale)
      router.refresh()
    })
  }

  function applyTheme(nextPalette: PaletteKey, nextMode: Mode) {
    setPalette(nextPalette)
    setTheme(nextMode)
  }

  return (
    <SidebarMenuItem>
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          tooltip={viewer.name}
          aria-label="Account, language and theme"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <span className="flex aspect-square size-8 items-center justify-center rounded-[2px] border bg-card font-[family-name:var(--font-cormorant)] text-[15px]">
            {viewer.name.charAt(0).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13.5px] font-semibold">{viewer.name}</span>
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              @{viewer.handle}
            </span>
          </span>
          <span className="ml-auto text-muted-foreground" aria-hidden>
            <IChevD size={14} />
          </span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <IGlobe size={15} />
            <span>Language</span>
            <span className="ml-auto text-xs text-muted-foreground font-mono uppercase tracking-wide">
              {currentLocale.toUpperCase()}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            {LOCALES.map((locale) => (
              <DropdownMenuItem
                key={locale.code}
                disabled={isPending}
                onClick={() => handleSelectLocale(locale.code)}
                className={cn(
                  'flex items-center justify-between gap-3',
                  locale.code === currentLocale && 'text-primary',
                )}
              >
                <span className="font-mono text-[10px] tracking-widest uppercase">
                  {locale.label}
                </span>
                <span className="text-sm">{locale.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <IPalette size={15} />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52 p-2">
            {mounted &&
              (Object.keys(PALETTES) as PaletteKey[]).map((k) => {
                const entry = PALETTES[k]
                const isActive = palette === k
                return (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-2 px-1.5 py-1.5 rounded-sm"
                  >
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-cormorant), Georgia, serif',
                        fontWeight: 500,
                      }}
                    >
                      {entry.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {(['light', 'dark'] as Mode[]).map((m) => {
                        const p = entry[m]
                        const active = isActive && mode === m
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => applyTheme(k, m)}
                            title={m}
                            aria-label={`${entry.label} ${m}`}
                            aria-pressed={active}
                            className={cn(
                              'inline-flex items-center gap-0.5 px-1.5 py-1 rounded-sm cursor-pointer transition-all',
                              active ? 'ring-2 ring-offset-1' : 'hover:opacity-80',
                            )}
                            style={{
                              background: p.bg,
                              border: `1px solid ${p.rule}`,
                              // @ts-expect-error css var
                              '--tw-ring-color': p.accent,
                            }}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: 1, background: p.accent, display: 'block' }} />
                            <span style={{ width: 7, height: 7, borderRadius: 1, background: p.fg, display: 'block' }} />
                          </button>
                        )
                      })}
                    </span>
                  </div>
                )
              })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOutAction()}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <ILogout size={15} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </SidebarMenuItem>
  )
}
