'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaletteThemeSwitcher } from '@/components/toggles/palette-theme-switcher'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
import { useTranslations, useLocale } from 'next-intl'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { SiteBrand } from '@/components/site-brand'

type FlatLink = { kind: 'link'; label: string; href: string }
type GroupLink = {
  kind: 'group'
  label: string
  href: string
  children: { label: string; sub: string; href: string }[]
}
type NavItem = FlatLink | GroupLink

const NAV_ITEMS: NavItem[] = [
  {
    kind: 'group',
    label: 'scripture',
    href: '/quran',
    children: [
      { label: 'quran', sub: 'Final Testament', href: '/quran' },
      { label: 'bible', sub: 'Old & New Testaments', href: '/bible' },
    ],
  },
  { kind: 'link', label: 'miracle', href: '/miracle' },
  { kind: 'link', label: 'practices', href: '/practices' },
  { kind: 'link', label: 'community', href: '/community' },
  { kind: 'link', label: 'archive', href: '/archive' },
  { kind: 'link', label: 'music', href: '/music' },
  { kind: 'link', label: 'blog', href: '/blog' },
]

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navbar')
  const locale = useLocale()
  const { toggle: toggleAsk, state: askState } = useChatPanel()
  const close = () => setMobileOpen(false)

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'color-mix(in oklab, var(--ed-bg), transparent 18%)',
        borderBottom: '1px solid color-mix(in oklab, var(--ed-rule), transparent 40%)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 clamp(12px, 3vw, 40px)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        {/* Logo + Wordmark */}
        <div className="flex-none min-w-0">
          <SiteBrand onClick={close} />
        </div>

        {/* Tabbed Navigation (Desktop - Centered) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div
            className="flex"
            style={{
              background: 'color-mix(in oklab, var(--ed-fg), transparent 96%)',
              padding: '2px',
              borderRadius: '0px',
              border: '1px solid var(--ed-rule)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              gap: '1px',
            }}
          >
            {NAV_ITEMS.map((item) =>
              item.kind === 'link' ? (
                <NavTabLink
                  key={item.label}
                  item={item}
                  active={isActive(pathname, item.href)}
                  label={t(item.label)}
                />
              ) : (
                <NavTabGroup
                  key={item.label}
                  item={item}
                  active={item.children.some((c) => isActive(pathname, c.href))}
                  label={t(item.label)}
                  tChild={t}
                />
              )
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex-none flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={toggleAsk}
            aria-label={t('submissionAI')}
            className="hidden sm:inline-flex items-center gap-1 h-[34px] px-2.5 rounded-[2px] transition-colors"
            style={{
              fontFamily: F.mono,
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color:
                askState !== 'closed'
                  ? 'var(--ed-accent)'
                  : 'var(--ed-fg-muted)',
              border: '1px solid var(--ed-rule)',
              background:
                askState !== 'closed'
                  ? 'color-mix(in oklab, var(--ed-accent), transparent 88%)'
                  : 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--ed-fg)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--ed-rule)'
            }}
          >
            <Sparkles size={12} />
            <span>{t('submissionAI')}</span>
          </button>

          <div className="flex items-center gap-0.5">
            <LocaleSwitcher currentLocale={locale} />
            <PaletteThemeSwitcher />
          </div>

          {/* Sign in (Clerk) — temporarily disabled. Re-enable: <Link href="/auth/sign-in">{t('signIn')}</Link> */}

          {/* Mobile controls: AI + hamburger */}
          <button
            type="button"
            onClick={toggleAsk}
            aria-label={t('submissionAI')}
            className="sm:hidden flex items-center justify-center w-[34px] h-[34px] rounded-md"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color:
                askState !== 'closed'
                  ? 'var(--ed-accent)'
                  : 'var(--ed-fg-muted)',
            }}
          >
            <Sparkles size={16} />
          </button>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-[34px] h-[34px] rounded-md text-muted-foreground transition-colors"
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? 'close' : 'open'}
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                style={{ display: 'flex' }}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              borderTop: '1px solid var(--ed-rule)',
              backgroundColor: 'var(--ed-bg)',
            }}
            className="lg:hidden px-4 py-4 flex flex-col gap-0.5 sm:px-6"
          >
            {NAV_ITEMS.map((item) =>
              item.kind === 'link' ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: isActive(pathname, item.href)
                      ? 'var(--ed-fg)'
                      : 'var(--ed-fg-muted)',
                    padding: '10px 12px',
                    display: 'block',
                    textDecoration: 'none',
                    borderRadius: 4,
                  }}
                >
                  {t(item.label)}
                </Link>
              ) : (
                <div key={item.label} className="flex flex-col">
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: 'var(--ed-fg-muted)',
                      padding: '10px 12px 4px',
                    }}
                  >
                    {t(item.label)}
                  </div>
                  {item.children.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      onClick={close}
                      style={{
                        fontFamily: F.mono,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: isActive(pathname, c.href)
                          ? 'var(--ed-fg)'
                          : 'var(--ed-fg-muted)',
                        padding: '8px 24px',
                        display: 'block',
                        textDecoration: 'none',
                        borderRadius: 4,
                      }}
                    >
                      {t(c.label)}
                    </Link>
                  ))}
                </div>
              )
            )}
            <div
              className="mt-2 pt-2 flex items-center gap-2 flex-wrap"
              style={{ borderTop: '1px solid var(--ed-rule)' }}
            >
              <LocaleSwitcher currentLocale={locale} onSelect={close} />
              <PaletteThemeSwitcher />
              {/* Sign in (Clerk) — temporarily disabled. Re-enable: <Link href="/auth/sign-in">{t('signIn')}</Link> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function NavTabLink({
  item,
  active,
  label,
}: {
  item: FlatLink
  active: boolean
  label: string
}) {
  return (
    <Link
      href={item.href}
      style={{
        position: 'relative',
        fontFamily: F.glacial,
        fontSize: '11px',
        fontWeight: active ? 700 : 500,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        padding: '6px 16px',
        color: active ? 'var(--ed-fg)' : 'var(--ed-fg-muted)',
        textDecoration: 'none',
        borderRadius: '0px',
        background: active ? 'var(--ed-bg)' : 'transparent',
        border: active ? '1px solid var(--ed-rule)' : '1px solid transparent',
        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 150ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
      {active && (
        <motion.div
          layoutId="nav-active-dot"
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'var(--ed-accent)',
            boxShadow: '0 0 6px var(--ed-accent)',
            transform: 'translateX(-50%)',
          }}
        />
      )}
    </Link>
  )
}

function NavTabGroup({
  item,
  active,
  label,
  tChild,
}: {
  item: GroupLink
  active: boolean
  label: string
  tChild: (k: string) => string
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const closeDeferred = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div
      style={{ position: 'relative', display: 'flex' }}
      onMouseEnter={openNow}
      onMouseLeave={closeDeferred}
    >
      <Link
        href={item.href}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            openNow()
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          position: 'relative',
          fontFamily: F.glacial,
          fontSize: '11px',
          fontWeight: active ? 700 : 500,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          padding: '6px 12px 6px 16px',
          color: active ? 'var(--ed-fg)' : 'var(--ed-fg-muted)',
          textDecoration: 'none',
          borderRadius: '0px',
          background: active ? 'var(--ed-bg)' : 'transparent',
          border: active ? '1px solid var(--ed-rule)' : '1px solid transparent',
          boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
          transition: 'all 150ms ease',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {label}
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden
          style={{
            transition: 'transform 150ms',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        {active && (
          <motion.div
            layoutId="nav-active-dot"
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'var(--ed-accent)',
              boxShadow: '0 0 6px var(--ed-accent)',
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              minWidth: 220,
              borderRadius: 3,
              border: '1px solid var(--ed-rule)',
              background: 'var(--ed-surface)',
              boxShadow: '0 12px 32px -12px rgba(0,0,0,0.25)',
              padding: 4,
              zIndex: 60,
            }}
          >
            {item.children.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'baseline',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'var(--ed-fg)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    'color-mix(in oklab, var(--ed-fg), transparent 94%)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    'transparent'
                }}
              >
                <span
                  style={{
                    fontFamily: F.display,
                    fontSize: 15,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {tChild(c.label)}
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-fg-muted)',
                  }}
                >
                  {c.sub}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
