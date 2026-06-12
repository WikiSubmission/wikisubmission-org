import type { CSSProperties } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getEditorialSession,
  listQuranVersions,
  type EditorialSession,
  type QuranVersion,
} from '@/lib/editorial-client'
import * as s from './styles'

export const dynamic = 'force-dynamic'

export default async function QuranVersionsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/quran')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || (!editorial.is_admin && editorial.modules.quran === undefined)) {
    redirect('/editor')
  }

  const versions = await listQuranVersions(session.accessToken)
  const accessible = versions.filter((v) => canRead(editorial, v.id))
  const canApproveAny =
    editorial.is_admin ||
    Object.values(editorial.quran_approver_versions ?? {}).some(Boolean)

  return (
    <section style={s.page}>
      <Link href="/editor" style={s.crumb}>
        ← Workspace
      </Link>
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <p style={s.kicker}>Quran</p>
          <h1 style={s.heading}>Versions</h1>
          <p style={s.lede}>
            Pick a version to edit its chapters. You see only versions you have
            been granted; the backend re-checks access on every change.
          </p>
        </div>
        {canApproveAny && (
          <Link href="/editor/quran/approvals" style={s.buttonGhost}>
            Pending approvals
          </Link>
        )}
      </header>

      {accessible.length === 0 ? (
        <p style={s.lede}>No Quran versions have been assigned to your account yet.</p>
      ) : (
        <ul style={grid}>
          {accessible.map((v) => {
            const canWrite = editorial.is_admin || editorial.quran_versions[String(v.id)] === true
            const canApprove =
              editorial.is_admin || editorial.quran_approver_versions?.[String(v.id)] === true
            return (
              <li key={v.id}>
                <Link href={`/editor/quran/${v.id}`} style={tile}>
                  <div style={tileTitle}>{v.name}</div>
                  <p style={tileMeta}>
                    {v.slug}
                    {v.is_canonical_english ? ' · canonical EN' : ''}
                    {v.direction === 'rtl' ? ' · rtl' : ''}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <span style={s.tag}>{canWrite ? 'Read & write' : 'Read only'}</span>
                    {canApprove && <span style={s.mutedTag}>Approver</span>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function canRead(editorial: EditorialSession, versionId: QuranVersion['id']): boolean {
  return editorial.is_admin || editorial.quran_versions[String(versionId)] !== undefined
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
