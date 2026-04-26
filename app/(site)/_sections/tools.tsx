'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F, SectionDivider, Arrow } from './shared'

type Tool = {
  key: string
  title: string
  desc: string
  glyph: React.ReactNode
  accent?: boolean
} & ({ href: string } | { onClick: true })

const GLYPH_AI = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

const GLYPH_DOWNLOAD = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
)

const GLYPH_IOS = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 12.3c0-2.4 1.97-3.55 2.06-3.6-1.12-1.64-2.87-1.87-3.5-1.9-1.48-.15-2.9.87-3.64.87-.77 0-1.92-.85-3.16-.82-1.62.02-3.12.94-3.95 2.4-1.68 2.92-.43 7.23 1.2 9.6.8 1.16 1.75 2.46 3 2.42 1.2-.05 1.66-.78 3.12-.78s1.87.78 3.14.75c1.3-.03 2.12-1.18 2.9-2.35.92-1.35 1.3-2.66 1.32-2.73-.03-.02-2.52-.97-2.55-3.86Zm-2.44-7.1c.67-.8 1.12-1.93.99-3.04-.96.04-2.12.64-2.8 1.44-.62.7-1.17 1.85-1.02 2.94 1.07.08 2.17-.54 2.83-1.34Z" />
  </svg>
)

const GLYPH_ANDROID = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="6" y="3" width="12" height="18" rx="2" />
    <path d="M10 18h4" />
  </svg>
)

const GLYPH_DISCORD = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a18 18 0 0 0-5.3 0L9.6 3a19.8 19.8 0 0 0-4.9 1.4C1.5 9.1.6 13.7 1 18.2a19.9 19.9 0 0 0 6 3l.5-.7a13.6 13.6 0 0 1-2.3-1.1l.6-.4a14 14 0 0 0 12.4 0l.6.4a13.6 13.6 0 0 1-2.3 1.1l.5.7a19.9 19.9 0 0 0 6-3c.5-5.2-.9-9.7-2.6-13.8ZM8.4 15.5c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.2 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
  </svg>
)

export function ToolsSection() {
  const { toggle: toggleAsk } = useChatPanel()
  const t = useTranslations('homePage.tools')

  const TOOLS: Tool[] = [
    {
      key: 'ai',
      title: t('aiTitle'),
      desc: t('aiDesc'),
      accent: true,
      onClick: true,
      glyph: GLYPH_AI,
    },
    {
      key: 'downloads',
      title: t('downloadsTitle'),
      desc: t('downloadsDesc'),
      href: '/downloads',
      glyph: GLYPH_DOWNLOAD,
    },
    {
      key: 'ios',
      title: t('iosTitle'),
      desc: t('iosDesc'),
      href: 'https://apps.apple.com/app/id6444260632',
      glyph: GLYPH_IOS,
    },
    {
      key: 'android',
      title: t('androidTitle'),
      desc: t('androidDesc'),
      href: 'https://play.google.com/store/apps/details?id=org.wikisubmission.app',
      glyph: GLYPH_ANDROID,
    },
    {
      key: 'discord',
      title: t('discordTitle'),
      desc: t('discordDesc'),
      href: 'https://discord.com/oauth2/authorize?client_id=978658099474890793',
      glyph: GLYPH_DISCORD,
    },
  ]

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        <div
          style={{ gap: 16 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {TOOLS.map((tool) => {
            const sharedClassName = 'ed-card'
            const sharedStyle = {
              backgroundColor: tool.accent
                ? 'color-mix(in oklab, var(--ed-accent), transparent 92%)'
                : 'var(--ed-surface)',
              borderColor: tool.accent ? 'var(--ed-accent)' : undefined,
              padding: 'clamp(20px, 4vw, 26px)',
              display: 'flex' as const,
              flexDirection: 'column' as const,
              gap: 12,
              textDecoration: 'none',
              minHeight: 180,
            }

            const body = (
              <>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: `1px solid ${tool.accent ? 'var(--ed-accent)' : 'var(--ed-rule)'}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tool.accent ? 'var(--ed-accent)' : 'var(--ed-fg)',
                  }}
                >
                  {tool.glyph}
                </div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 'clamp(17px, 4.2vw, 19px)',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'var(--ed-fg)',
                    lineHeight: 1.15,
                  }}
                >
                  {tool.title}
                </div>
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: 13,
                    color: 'var(--ed-fg-muted)',
                    lineHeight: 1.55,
                    flex: 1,
                  }}
                >
                  {tool.desc}
                </p>
                <div
                  className="ed-cta"
                  style={{
                    fontSize: 12,
                    color: tool.accent ? 'var(--ed-accent)' : undefined,
                  }}
                >
                  {t('open')} <Arrow />
                </div>
              </>
            )

            if ('onClick' in tool) {
              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={toggleAsk}
                  className={sharedClassName}
                  style={{
                    ...sharedStyle,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {body}
                </button>
              )
            }

            const isExternal = tool.href.startsWith('http')
            return (
              <Link
                key={tool.key}
                href={tool.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                className={sharedClassName}
                style={sharedStyle}
              >
                {body}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
