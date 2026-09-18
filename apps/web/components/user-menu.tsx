'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition, useSyncExternalStore } from 'react'
import { useLocale, useTranslations } from 'next-intl'
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
import { LogOut, User, Globe, Palette, Gamepad2, Shield, SquarePen, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UI_LOCALES } from '@/constants/ui-locales'

const LOCALES = UI_LOCALES

type Mode = 'light' | 'dark'

function resolveMode(theme: string | undefined, systemTheme: string | undefined): Mode {
  const resolved = theme === 'system' ? systemTheme : theme
  return resolved === 'dark' ? 'dark' : 'light'
}

export function UserMenu() {
  const { user, isAuthenticated, isLoading } = useUser()
  const { data: session } = useSession()
  const isAdmin = session?.isAdmin === true
  // isEditor means games access; isEditorialEditor means /editor content access.
  // They are separate grants, so a games editor must not be shown /editor.
  const isEditor = session?.isEditor === true
  const isEditorialEditor = session?.isEditorialEditor === true
  const openSignIn = useSignInPromptStore((s) => s.open)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const currentLocale = useLocale()
  const t = useTranslations('userMenu')
  const { palette, setPalette } = usePalette()
  const { theme, systemTheme, setTheme } = useTheme()
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

  if (isLoading) {
    return <div className="w-[34px] h-[34px] rounded-[2px] border border-[var(--ed-rule)] bg-[color-mix(in_oklab,var(--ed-fg),transparent_95%)] animate-pulse" />
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={openSignIn}
        className="site-header-action inline-flex items-center h-[34px] px-3 rounded-[2px] transition-colors"
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
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-fg)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg-muted)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-rule)'
        }}
      >
        {t('signIn')}
      </button>
    )
  }

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? 'WS')

  const displayName = user?.name?.trim()?.split(/\s+/)[0] || user?.name || t('profile')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={user?.name ?? t('profile')}
          className="site-header-action flex items-center gap-1.5 sm:gap-2 h-[34px] px-1 sm:px-2 rounded-[2px] transition-colors cursor-pointer select-none group"
          style={{
            border: '1px solid var(--ed-rule)',
            background: 'transparent',
            color: 'var(--ed-fg)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-fg)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-rule)'
          }}
        >
          <div className="relative w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--ed-rule)] group-hover:ring-[var(--ed-fg)] transition-all flex items-center justify-center">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? 'avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center font-mono font-semibold text-[10px]"
                style={{
                  background: 'color-mix(in oklab, var(--ed-accent), transparent 85%)',
                  color: 'var(--ed-accent)',
                }}
              >
                {initials}
              </span>
            )}
          </div>
          <span
            className="hidden sm:inline-block max-w-[88px] truncate text-[10.5px] uppercase tracking-[0.14em] font-medium"
            style={{
              fontFamily: 'var(--font-glacial), sans-serif',
              color: 'var(--ed-fg)',
            }}
          >
            {displayName}
          </span>
          <ChevronDown
            size={11}
            className="hidden sm:inline-block text-[var(--ed-fg-muted)] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1 border-[var(--ed-rule)] bg-[var(--ed-bg)] shadow-xl">
        <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-[var(--ed-rule)]">
          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--ed-rule)] flex items-center justify-center">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? 'avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center font-mono font-semibold text-xs"
                style={{
                  background: 'color-mix(in oklab, var(--ed-accent), transparent 85%)',
                  color: 'var(--ed-accent)',
                }}
              >
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {user?.name && (
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            )}
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/me" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('profile')}
          </a>
        </DropdownMenuItem>
        {(isEditorialEditor || isAdmin) && (
          <DropdownMenuItem asChild>
            <Link href="/editor" className="flex items-center gap-2">
              <SquarePen className="w-4 h-4" />
              {t('editor')}
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <a href="/admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('admin')}
            </a>
          </DropdownMenuItem>
        ) : isEditor ? (
          <DropdownMenuItem asChild>
            {/* The hub lists only the games this user may open, so it works for
                a one-game grant as well as a global one. */}
            <a href="/admin/games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              {t('gamesStudio')}
            </a>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>{t('language')}</span>
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
                <span className="font-mono text-[10px] tracking-widest uppercase">{locale.label}</span>
                <span className="text-sm">{locale.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>{t('theme')}</span>
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
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
