'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTransition, useSyncExternalStore } from 'react'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { useUser } from '@/hooks/use-user'
import { useSignInPromptStore } from '@/store/sign-in-prompt'
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
import { LogOut, User, Globe, Palette, Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function UserMenu() {
  const { user, isAuthenticated, isLoading } = useUser()
  const { data: session } = useSession()
  const isEditor = session?.isEditor === true
  const openSignIn = useSignInPromptStore((s) => s.open)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const currentLocale = useLocale()
  const { palette, setPalette } = usePalette()
  const { theme, systemTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
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

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={openSignIn}
        className="inline-flex items-center h-[34px] px-3 rounded-[2px] transition-colors"
        style={{
          fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
          fontSize: 10.5,
          letterSpacing: '0.16em',
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
      >
        Sign in
      </button>
    )
  }

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? 'WS')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? 'avatar'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          {user?.name && (
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          )}
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/me" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </a>
        </DropdownMenuItem>
        {isEditor && (
          <DropdownMenuItem asChild>
            <a href="/studio/games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Games studio
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />

        {/* Language */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
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
                  locale.code === currentLocale && 'text-primary'
                )}
              >
                <span className="font-mono text-[10px] tracking-widest uppercase">{locale.label}</span>
                <span className="text-sm">{locale.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Theme */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52 p-2">
            {mounted && (Object.keys(PALETTES) as PaletteKey[]).map((k) => {
              const entry = PALETTES[k]
              const isActive = palette === k
              return (
                <div key={k} className="flex items-center justify-between gap-2 px-1.5 py-1.5 rounded-sm">
                  <span className="text-sm" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontWeight: 500 }}>
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
                          className={cn(
                            'inline-flex items-center gap-0.5 px-1.5 py-1 rounded-sm cursor-pointer transition-all',
                            active ? 'ring-2 ring-offset-1' : 'hover:opacity-80'
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
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
