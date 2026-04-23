'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ThemeToggle } from '@/components/toggles/theme-toggle'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
import { useTranslations, useLocale } from 'next-intl'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'

const NAV_LINKS = [
  { label: 'quran', href: '/quran' },
  { label: 'bible', href: '/bible' },
  { label: 'miracle', href: '/miracle' },
  { label: 'practices', href: '/practices' },
  { label: 'archive', href: '/archive' },
  { label: 'music', href: '/music' },
  { label: 'chat', href: '/chat' },
  { label: 'blog', href: '/blog' },
]

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
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
          padding: '0 clamp(16px, 4vw, 40px)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo + Wordmark */}
        <Link
          href="/"
          onClick={close}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: F.display,
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: 'var(--ed-fg)',
            flexShrink: 0,
            lineHeight: 1,
            textDecoration: 'none',
          }}
          className="min-w-0"
        >
          <Image
            src="/brand-assets/logo-transparent.png"
            alt=""
            width={28}
            height={28}
          />
          <span className="truncate max-[380px]:hidden sm:inline">WikiSubmission</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-7">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: active ? 'var(--ed-fg)' : 'var(--ed-fg-muted)',
                  transition: 'color 150ms',
                  textDecoration: 'none',
                }}
              >
                {t(link.label)}
              </Link>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 shrink-0">
          <LocaleSwitcher currentLocale={locale} />
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleAsk}
            aria-label="Ask AI"
            style={{
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: askState !== 'closed' ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
              transition: 'color 150ms, background 150ms',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in oklab, var(--ed-fg), transparent 94%)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
          >
            <Sparkles size={16} />
          </button>

          {/* Mobile hamburger */}
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
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: active ? 'var(--ed-fg)' : 'var(--ed-fg-muted)',
                  padding: '10px 12px',
                  display: 'block',
                  textDecoration: 'none',
                  borderRadius: 4,
                }}
              >
                {t(link.label)}
              </Link>
            )
          })}
          <div
            className="mt-2 pt-2"
            style={{ borderTop: '1px solid var(--ed-rule)' }}
          >
            <LocaleSwitcher currentLocale={locale} onSelect={close} />
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
