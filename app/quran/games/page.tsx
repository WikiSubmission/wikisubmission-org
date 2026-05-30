import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const metadata = {
  title: 'Quran Games — WikiSubmission',
  description:
    'Practice, memorize, and play with the Quran. Procedurally generated rounds and global leaderboards.',
}

// One entry per playable game. Adding a game is a single entry here; the grid
// scales without restructuring.
interface GameEntry {
  href: string
  titleKey: string
  subKey: string
}

const GAMES: GameEntry[] = [
  { href: '/quran/games/fill-blank', titleKey: 'fillBlankTitle', subKey: 'fillBlankSub' },
]

export default async function GamesLobbyPage() {
  const t = await getTranslations('games')

  return (
    <section
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
      }}
    >
      <header
        style={{
          marginBottom: 32,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {t('lobbyTitle')}{' '}
            <em style={{ color: 'var(--ed-accent)', fontStyle: 'italic' }}>
              {t('lobbyTitleAccent')}
            </em>
          </h1>
          <p
            style={{
              marginTop: 12,
              color: 'var(--ed-fg-muted)',
              fontSize: 16,
              maxWidth: 560,
              lineHeight: 1.55,
            }}
          >
            {t('lobbyLede')}
          </p>
        </div>

        <Link
          href="/quran/games/leaderboard"
          style={{
            flexShrink: 0,
            padding: '10px 16px',
            border: '1px dashed var(--ed-rule)',
            borderRadius: 2,
            textDecoration: 'none',
            color: 'var(--ed-fg-muted)',
            fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {t('leaderboardLink')}
        </Link>
      </header>

      <ul
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {GAMES.map((game) => (
          <li key={game.href}>
            <Link
              href={game.href}
              style={{
                display: 'block',
                height: '100%',
                padding: '20px 24px',
                border: '1px solid var(--ed-rule)',
                borderRadius: 2,
                textDecoration: 'none',
                color: 'var(--ed-fg)',
                background: 'var(--ed-surface)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {t(game.titleKey as Parameters<typeof t>[0])}
              </div>
              <div
                style={{
                  marginTop: 4,
                  color: 'var(--ed-fg-muted)',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {t(game.subKey as Parameters<typeof t>[0])}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
