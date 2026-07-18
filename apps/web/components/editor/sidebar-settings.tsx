'use client'

/**
 * Language + theme controls for the editor sidebar, sitting directly above the
 * user block. Both reuse the site-wide mechanisms rather than inventing editor
 * -local state: the locale is the `locale` cookie read by i18n/request.ts (so a
 * change has to round-trip through the server action + refresh), and the theme
 * is next-themes on <html class>, shared with the rest of the site.
 */
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { setLocale } from '@/app/actions/locale'
import { IGlobe, ISun, IMoon, IMonitor, type IconProps } from './icons'

const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ku', label: 'KU', name: 'کوردی' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
] as const

const THEMES: ReadonlyArray<{ value: string; label: string; icon: (p: IconProps) => React.JSX.Element }> = [
  { value: 'light', label: 'Light', icon: ISun },
  { value: 'dark', label: 'Dark', icon: IMoon },
  { value: 'system', label: 'System', icon: IMonitor },
]

function LanguageControl() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  return (
    <label className="sb-set-row">
      <span className="sb-set-k">Language</span>
      <span className="sb-set-select">
        <IGlobe size={13} />
        <span className="v">{current.name}</span>
        <select
          value={current.code}
          disabled={isPending}
          aria-label="Interface language"
          onChange={(e) => {
            const next = e.target.value
            startTransition(async () => {
              await setLocale(next)
              router.refresh()
            })
          }}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

function ThemeControl() {
  const { theme, setTheme } = useTheme()
  // next-themes only knows the stored preference after mount; rendering the
  // active state before then would mismatch the server HTML.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <div className="sb-set-row">
      <span className="sb-set-k">Theme</span>
      <div className="sb-set-seg" role="group" aria-label="Colour theme">
        {THEMES.map(({ value, label, icon: Ico }) => (
          <button
            key={value}
            type="button"
            className={mounted && theme === value ? 'is-on' : undefined}
            aria-pressed={mounted ? theme === value : false}
            title={label}
            onClick={() => setTheme(value)}
          >
            <Ico size={13} />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function SidebarSettings() {
  return (
    <div className="sb-settings">
      <LanguageControl />
      <ThemeControl />
    </div>
  )
}
