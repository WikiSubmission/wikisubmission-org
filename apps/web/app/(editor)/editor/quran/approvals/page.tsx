import type { CSSProperties } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession, listQuranPublishRequests } from '@/lib/editorial-client'
import * as s from '../styles'
import { ApprovalActions } from './approval-actions'

export const dynamic = 'force-dynamic'

export default async function QuranApprovalsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/quran/approvals')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial) redirect('/')

  const canApproveAny =
    editorial.is_admin ||
    Object.values(editorial.quran_approver_versions ?? {}).some(Boolean)
  if (!canApproveAny) redirect('/editor/quran')

  const requests = await listQuranPublishRequests(session.accessToken, { status: 'pending' })

  return (
    <section style={s.page}>
      <Link href="/editor/quran" style={s.crumb}>
        ← Versions
      </Link>
      <header style={{ marginBottom: 20 }}>
        <p style={s.kicker}>Quran</p>
        <h1 style={s.heading}>Pending approvals</h1>
        <p style={s.lede}>
          Chapters submitted for publishing. Approving syncs that chapter&apos;s
          drafts into the published record.
        </p>
      </header>

      {requests.length === 0 ? (
        <p style={s.lede}>Nothing is waiting for approval.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map((r) => {
            const canApprove =
              editorial.is_admin || editorial.quran_approver_versions?.[String(r.version_id)] === true
            return (
              <li key={r.id} style={{ ...s.surface, padding: '14px 16px' }}>
                <div style={rowHead}>
                  <div>
                    <Link
                      href={`/editor/quran/${r.version_id}/${r.chapter_number}`}
                      style={{ fontFamily: 'var(--font-cormorant)', fontSize: 20, color: 'var(--ed-fg)' }}
                    >
                      Version {r.version_id} · Chapter {r.chapter_number}
                    </Link>
                    <p style={meta}>
                      Requested by user #{r.requested_by} ·{' '}
                      {new Date(r.requested_at).toLocaleString()}
                    </p>
                  </div>
                  <span style={{ ...s.pillBase(), ...s.statusPill.pending }}>pending</span>
                </div>
                {r.note && <p style={note}>“{r.note}”</p>}
                {canApprove && <ApprovalActions requestId={r.id} />}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

const rowHead: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
}
const meta: CSSProperties = {
  margin: '4px 0 0',
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.03em',
  color: 'var(--ed-fg-muted)',
}
const note: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 13,
  fontStyle: 'italic',
  color: 'var(--ed-fg-muted)',
}
