import type { CSSProperties } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession, listQuranVersions } from '@/lib/editorial-client'
import * as s from './styles'
import {
  canApproveAnyQuranVersion,
  canApproveQuranVersion,
  canReadModule,
  canReadQuranVersion,
  canWriteQuranVersion,
} from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

export default async function QuranVersionsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/quran')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canReadModule(editorial, 'quran')) {
    redirect('/editor')
  }

  const versions = await listQuranVersions(session.accessToken)
  const accessible = versions.filter((v) =>
    canReadQuranVersion(editorial, v.id)
  )
  const canApproveAny = canApproveAnyQuranVersion(editorial)

  return (
    <section className="ed-page">
      <Link href="/editor" style={s.crumb}>
        ← Workspace
      </Link>
      <header
        style={{
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
        }}
      >
        <div>
          <p style={s.kicker}>Quran</p>
          <h1 className="ed-h1">Versions</h1>
          <p style={s.lede}>
            Each version is a separate translation. Open one to work through its
            chapters verse by verse.
          </p>
        </div>
        {canApproveAny && (
          <Link href="/editor/quran/approvals" style={s.buttonGhost}>
            Waiting for review
          </Link>
        )}
      </header>

      {accessible.length === 0 ? (
        <p style={s.lede}>
          No translations have been shared with you yet. An administrator can
          give you access to the ones you work on.
        </p>
      ) : (
        <ul style={grid}>
          {accessible.map((v) => {
            const canWrite = canWriteQuranVersion(editorial, v.id)
            const canApprove = canApproveQuranVersion(editorial, v.id)
            return (
              <li key={v.id}>
                <div style={tile}>
                  <Link href={`/editor/quran/${v.id}`}>
                    <div style={tileTitle}>{v.name}</div>
                    <p style={tileMeta}>
                      {v.slug}
                      {v.is_canonical_english ? ' · canonical EN' : ''}
                      {v.direction === 'rtl' ? ' · rtl' : ''}
                    </p>
                  </Link>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <span style={s.tag}>
                      {canWrite ? 'You can edit' : 'View only'}
                    </span>
                    {canApprove && (
                      <span style={s.mutedTag}>You can publish</span>
                    )}
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
  fontSize: 25.5,
  color: 'var(--ed-fg)',
}
const tileMeta: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-glacial)',
  fontSize: 12.5,
  letterSpacing: '0.04em',
  color: 'var(--ed-fg-muted)',
}
