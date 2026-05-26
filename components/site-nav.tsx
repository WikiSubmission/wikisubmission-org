'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, MessageSquare } from 'lucide-react'
import gsap from 'gsap'
import { PaletteThemeSwitcher } from '@/components/toggles/palette-theme-switcher'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
import { useTranslations, useLocale } from 'next-intl'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { SiteBrand } from '@/components/site-brand'
import { UserMenu } from '@/components/user-menu'
import { useSession } from 'next-auth/react'

type FlatLink = { kind: 'link'; label: string; href: string; requiresAuth?: boolean }
type GroupGrandchild = { label: string; sub: string; href: string; requiresAuth?: boolean }
type GroupChild = {
  label: string
  sub: string
  href: string
  requiresAuth?: boolean
  children?: GroupGrandchild[]
}
type GroupLink = {
  kind: 'group'
  label: string
  href: string
  requiresAuth?: boolean
  children: GroupChild[]
}
type NavItem = FlatLink | GroupLink

const NAV_ITEMS: NavItem[] = [
  {
    kind: 'group',
    label: 'scripture',
    href: '/quran',
    children: [
      {
        label: 'quran',
        sub: 'Final Testament',
        href: '/quran',
        children: [
          { label: 'wordLab', sub: 'Roots & concordance', href: '/quran/words' },
          { label: 'games', sub: 'Memorization games', href: '/quran/games', requiresAuth: true },
        ],
      },
      { label: 'bible', sub: 'Old & New Testaments', href: '/bible' },
    ],
  },
  { kind: 'link', label: 'miracle', href: '/miracle' },
  { kind: 'link', label: 'practices', href: '/practices' },
  { kind: 'link', label: 'archive', href: '/archive' },
  { kind: 'link', label: 'music', href: '/music' },
  { kind: 'link', label: 'blog', href: '/blog' },
]

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

function filterNavItems(items: NavItem[], isAuthed: boolean): NavItem[] {
  const allow = <T extends { requiresAuth?: boolean }>(node: T): boolean =>
    isAuthed || !node.requiresAuth
  return items.filter(allow).map((item) => {
    if (item.kind === 'link') return item
    return {
      ...item,
      children: item.children.filter(allow).map((c) => ({
        ...c,
        children: c.children?.filter(allow),
      })),
    }
  })
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function HamburgerIcon({ open }: { open: boolean }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const prevRef = useRef<boolean | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prevRef.current === null) {
      gsap.set(el, { rotate: 0, opacity: 1 })
    } else {
      gsap.fromTo(
        el,
        { rotate: -45, opacity: 0 },
        { rotate: 0, opacity: 1, duration: 0.15, ease: 'power1.inOut' },
      )
    }
    prevRef.current = open
  }, [open])

  return (
    <span ref={ref} key={open ? 'close' : 'open'} style={{ display: 'flex' }}>
      {open ? <X size={18} /> : <Menu size={18} />}
    </span>
  )
}

function MobileMenu({
  open,
  pathname,
  t,
  close,
  items,
}: {
  open: boolean
  pathname: string | null
  t: (k: string) => string
  close: () => void
  items: NavItem[]
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [render, setRender] = useState(open)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setRender(true)
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) {
      gsap.fromTo(
        el,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      )
    } else if (render) {
      gsap.to(el, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => setRender(false),
      })
    }
  }, [open, render])

  if (!render) return null

  return (
    <div
      ref={ref}
      style={{
        borderTop: '1px solid var(--ed-rule)',
        backgroundColor: 'var(--ed-bg)',
      }}
      className="lg:hidden px-4 py-4 flex flex-col gap-0.5 sm:px-6"
    >
      {items.map((item) =>
        item.kind === 'link' ? (
          <Link
            key={item.label}
            href={item.href}
            onClick={close}
            style={{
              position: 'relative',
              fontFamily: F.mono,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: isActive(pathname, item.href)
                ? 'var(--ed-fg)'
                : 'var(--ed-fg-muted)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              borderRadius: 4,
              fontWeight: isActive(pathname, item.href) ? 600 : 500,
            }}
          >
            {isActive(pathname, item.href) && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: 'var(--ed-accent)',
                  borderRadius: 2,
                }}
              />
            )}
            {t(item.label)}
          </Link>
        ) : (
          <div key={item.label} className="flex flex-col">
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--ed-fg-muted)',
                padding: '12px 12px 6px',
                opacity: 0.8,
              }}
            >
              {t(item.label)}
            </div>
            <div style={{ position: 'relative' }}>
              {/* Outer vertical rail spanning all children + grandchildren */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 14,
                  top: 8,
                  bottom: 8,
                  width: 1,
                  background: 'var(--ed-rule)',
                }}
              />
              {item.children.map((c) => {
                const childActive = isActive(pathname, c.href)
                const hasGrand = !!c.children && c.children.length > 0
                return (
                  <div key={c.label}>
                    <Link
                      href={c.href}
                      onClick={close}
                      style={{
                        position: 'relative',
                        fontFamily: F.mono,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: childActive
                          ? 'var(--ed-fg)'
                          : 'var(--ed-fg-muted)',
                        padding: '9px 12px 9px 30px',
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        borderRadius: 4,
                        fontWeight: childActive ? 600 : 500,
                      }}
                    >
                      {/* Horizontal tick connecting rail (x=14) to text (x=30) */}
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          width: 14,
                          height: 1,
                          background: childActive
                            ? 'var(--ed-accent)'
                            : 'var(--ed-rule)',
                        }}
                      />
                      {childActive && (
                        <span
                          aria-hidden
                          style={{
                            position: 'absolute',
                            left: 26,
                            top: 6,
                            bottom: 6,
                            width: 2,
                            background: 'var(--ed-accent)',
                            borderRadius: 2,
                          }}
                        />
                      )}
                      {t(c.label)}
                    </Link>
                    {hasGrand && (
                      <div style={{ position: 'relative' }}>
                        {/* Sub-rail for grandchildren level (offset 24px from outer rail) */}
                        {c.children!.length > 1 && (
                          <span
                            aria-hidden
                            style={{
                              position: 'absolute',
                              left: 38,
                              top: 4,
                              bottom: 4,
                              width: 1,
                              background: 'var(--ed-rule)',
                            }}
                          />
                        )}
                        {c.children!.map((g) => {
                          const gActive = isActive(pathname, g.href)
                          return (
                            <Link
                              key={g.label}
                              href={g.href}
                              onClick={close}
                              style={{
                                position: 'relative',
                                fontFamily: F.mono,
                                fontSize: 10.5,
                                textTransform: 'uppercase',
                                letterSpacing: '0.16em',
                                color: gActive
                                  ? 'var(--ed-fg)'
                                  : 'var(--ed-fg-muted)',
                                padding: '8px 12px 8px 54px',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                borderRadius: 4,
                                fontWeight: gActive ? 600 : 500,
                              }}
                            >
                              {/* Horizontal tick from sub-rail (x=38) to text (x=54) */}
                              <span
                                aria-hidden
                                style={{
                                  position: 'absolute',
                                  left: 38,
                                  top: '50%',
                                  width: 14,
                                  height: 1,
                                  background: gActive
                                    ? 'var(--ed-accent)'
                                    : 'var(--ed-rule)',
                                }}
                              />
                              {gActive && (
                                <span
                                  aria-hidden
                                  style={{
                                    position: 'absolute',
                                    left: 50,
                                    top: 6,
                                    bottom: 6,
                                    width: 2,
                                    background: 'var(--ed-accent)',
                                    borderRadius: 2,
                                  }}
                                />
                              )}
                              {t(g.label)}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ),
      )}
    </div>
  )
}

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navbar')
  const locale = useLocale()
  const { toggle: toggleAsk, state: askState } = useChatPanel()
  const { status } = useSession()
  const isAuthed = status === 'authenticated'
  const navItems = filterNavItems(NAV_ITEMS, isAuthed)
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
        borderBottom:
          '1px solid color-mix(in oklab, var(--ed-rule), transparent 40%)',
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
        <div className="flex-none min-w-0">
          <SiteBrand onClick={close} />
        </div>

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
            {navItems.map((item) =>
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
              ),
            )}
          </div>
        </div>

        <div className="flex-none flex items-center justify-end gap-1">
          {isAuthed && (
            <button
              type="button"
              onClick={toggleAsk}
              aria-label={t('submissionAI')}
              className="hidden sm:inline-flex items-center gap-1.5 h-[34px] px-2.5 rounded-[2px] transition-colors"
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
              <MessageSquare size={12} />
              <span>Chat</span>
            </button>
          )}

          <UserMenu />

          {!isAuthed && (
            <div className="flex items-center gap-0.5">
              <LocaleSwitcher currentLocale={locale} />
              <PaletteThemeSwitcher />
            </div>
          )}

          {isAuthed && (
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
              <MessageSquare size={16} />
            </button>
          )}

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-[34px] h-[34px] rounded-md text-muted-foreground transition-colors"
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        pathname={pathname}
        t={t}
        close={close}
        items={navItems}
      />
    </nav>
  )
}

function NavActiveDot() {
  return (
    <div
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
      onMouseEnter={(e) => {
        if (active) return
        const el = e.currentTarget as HTMLAnchorElement
        el.style.color = 'var(--ed-fg)'
        el.style.background = 'color-mix(in oklab, var(--ed-fg), transparent 94%)'
      }}
      onMouseLeave={(e) => {
        if (active) return
        const el = e.currentTarget as HTMLAnchorElement
        el.style.color = 'var(--ed-fg-muted)'
        el.style.background = 'transparent'
      }}
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
        transition: 'color 150ms ease, background-color 150ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
      {active && <NavActiveDot />}
    </Link>
  )
}

function NavGroupMenu({
  open,
  item,
  setOpen,
  tChild,
}: {
  open: boolean
  item: GroupLink
  setOpen: (v: boolean) => void
  tChild: (k: string) => string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [render, setRender] = useState(open)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setRender(true)
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
      )
    } else if (render) {
      gsap.to(el, {
        opacity: 0,
        y: 4,
        duration: 0.12,
        ease: 'power2.out',
        onComplete: () => setRender(false),
      })
    }
  }, [open, render])

  if (!render) return null

  return (
    <div
      ref={ref}
      role="menu"
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
        <div key={c.href} style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            href={c.href}
            onClick={() => setOpen(false)}
            role="menuitem"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
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
                lineHeight: 1.2,
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
                lineHeight: 1.2,
              }}
            >
              {c.sub}
            </span>
          </Link>
          {c.children && c.children.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 16,
                paddingLeft: 8,
                borderLeft: '1px solid var(--ed-rule)',
              }}
            >
              {c.children.map((g) => (
                <Link
                  key={g.href}
                  href={g.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    padding: '8px 12px',
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
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                    }}
                  >
                    {tChild(g.label)}
                  </span>
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: 9.5,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--ed-fg-muted)',
                      lineHeight: 1.2,
                    }}
                  >
                    {g.sub}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
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
        onMouseEnter={(e) => {
          if (active) return
          const el = e.currentTarget as HTMLAnchorElement
          el.style.color = 'var(--ed-fg)'
          el.style.background = 'color-mix(in oklab, var(--ed-fg), transparent 94%)'
        }}
        onMouseLeave={(e) => {
          if (active) return
          const el = e.currentTarget as HTMLAnchorElement
          el.style.color = 'var(--ed-fg-muted)'
          el.style.background = 'transparent'
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
          transition: 'color 150ms ease, background-color 150ms ease',
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
        {active && <NavActiveDot />}
      </Link>

      <NavGroupMenu open={open} item={item} setOpen={setOpen} tChild={tChild} />
    </div>
  )
}
