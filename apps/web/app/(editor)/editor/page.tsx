import type { CSSProperties } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'

export const dynamic = 'force-dynamic'

// Display labels + a one-line purpose for each backend module key. Quran leads
// because it is the first module being brought onto the new editor.
const MODULE_INFO: Record<string, { label: string; blurb: string }> = {
  quran: { label: 'Quran', blurb: 'Versions, chapters, verse text and references.' },
  article: { label: 'Articles', blurb: 'Multilingual articles, drafts and publishing.' },
  bible: { label: 'Bible', blurb: 'Books, chapters and verse translations.' },
  community: { label: 'Communities', blurb: 'Online and physical community listings.' },
  author: { label: 'Authors', blurb: 'Author profiles and article relationships.' },
  category: { label: 'Categories', blurb: 'Article categories.' },
  appendix: { label: 'Appendices', blurb: 'Quran-scoped appendices.' },
}

const MODULE_ORDER = ['quran', 'article', 'bible', 'community', 'author', 'category', 'appendix']

export default async function EditorLandingPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial) redirect('/')

  const accessible = MODULE_ORDER.filter(
    (key) => editorial.is_admin || editorial.modules[key] !== undefined,
  )

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 28 }}>
        <p style={kicker}>Editorial</p>
        <h1 style={heading}>Workspace</h1>
        <p style={lede}>
          Choose a module to begin. You see only what you have been granted; the
          backend re-checks access on every change.
        </p>
      </header>

      {accessible.length === 0 ? (
        <p style={lede}>No modules have been assigned to your account yet.</p>
      ) : (
        <ul style={grid}>
          {accessible.map((key) => {
            const info = MODULE_INFO[key] ?? { label: key, blurb: '' }
            const canWrite = editorial.is_admin || editorial.modules[key] === true
            return (
              <li key={key}>
                <Link href={`/editor/${key}`} style={tile}>
                  <div style={tileTitle}>{info.label}</div>
                  <p style={tileBlurb}>{info.blurb}</p>
                  <span style={tileTag}>{canWrite ? 'Read & write' : 'Read only'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

const wrap: CSSProperties = { padding: '32px 36px', maxWidth: 960, width: '100%' }
const kicker: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}
const heading: CSSProperties = {
  margin: '6px 0 10px',
  fontFamily: 'var(--font-cormorant)',
  fontSize: 38,
  lineHeight: 1.05,
  color: 'var(--ed-fg)',
}
const lede: CSSProperties = {
  margin: 0,
  maxWidth: 560,
  fontSize: 14.5,
  lineHeight: 1.55,
  color: 'var(--ed-fg-muted)',
}
const grid: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
}
const tile: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '18px 18px 16px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 'var(--ed-radius)',
  background: 'var(--ed-surface)',
  height: '100%',
}
const tileTitle: CSSProperties = {
  fontFamily: 'var(--font-cormorant)',
  fontSize: 22,
  color: 'var(--ed-fg)',
}
const tileBlurb: CSSProperties = {
  margin: 0,
  flex: 1,
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--ed-fg-muted)',
}
const tileTag: CSSProperties = {
  marginTop: 8,
  fontFamily: 'var(--font-glacial)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ed-accent)',
}
