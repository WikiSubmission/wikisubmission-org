import type { CSSProperties } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession, listBibleVersions } from '@/lib/editorial-client'
import * as s from '../quran/styles'

export const dynamic = 'force-dynamic'

/**
 * Bible module — version registry. Chapter/verse editing is Phase 3 of the
 * editorial port (ws-backend TODO: Bible draft/history tables and write
 * handlers do not exist yet), so this page lists the registry read-only and
 * says so, instead of 404ing the sidebar entry.
 */
export default async function BibleVersionsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/bible')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || (!editorial.is_admin && editorial.modules.bible === undefined)) {
    redirect('/editor')
  }

  const versions = await listBibleVersions(session.accessToken)
  const accessible = versions.filter(
    (v) => editorial.is_admin || editorial.bible_versions[String(v.id)] !== undefined,
  )

  return (
    <section style={s.page}>
      <Link href="/editor" style={s.crumb}>
        ← Workspace
      </Link>
      <div className="dh">
        <div className="dh-main">
          <p className="dh-eyebrow">Bible</p>
          <h1>Versions</h1>
          <p className="dh-sub">
            Books, chapters and verse translations. Editing arrives with the
            Bible write path (Phase 3); until then the registry is read-only.
          </p>
        </div>
      </div>

      {accessible.length === 0 ? (
        <p style={s.lede}>No Bible versions have been assigned to your account yet.</p>
      ) : (
        <ul style={grid}>
          {accessible.map((v) => {
            const canWrite =
              editorial.is_admin || editorial.bible_versions[String(v.id)] === true
            return (
              <li key={v.id}>
                <div style={tile}>
                  <div style={tileTitle}>{v.name}</div>
                  <p style={tileMeta}>
                    {v.slug}
                    {v.direction === 'rtl' ? ' · rtl' : ''}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <span style={s.tag}>{canWrite ? 'Read & write' : 'Read only'}</span>
                    <span style={s.mutedTag}>Editing not yet available</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
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
  minHeight: 120,
}
const tileTitle: CSSProperties = {
  fontFamily: 'var(--font-cormorant)',
  fontSize: 22,
  color: 'var(--ed-fg)',
}
const tileMeta: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.04em',
  color: 'var(--ed-fg-muted)',
}
