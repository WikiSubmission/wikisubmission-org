import type { CSSProperties } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession, listQuranPublishRequests } from '@/lib/editorial-client'
import * as s from '../styles'
import { ApprovalActions } from './approval-actions'
import {
  canApproveAnyQuranVersion,
  canApproveQuranVersion,
} from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

export default async function QuranApprovalsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/quran/approvals')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial) redirect('/')

  const canApproveAny = canApproveAnyQuranVersion(editorial)
  if (!canApproveAny) redirect('/editor/quran')

  const requests = await listQuranPublishRequests(session.accessToken, { status: 'pending' })

  return (
    <section className="ed-page">
      <Link href="/editor/quran" style={s.crumb}>
        ← Versions
      </Link>
      <header style={{ marginBottom: 20 }}>
        <p style={s.kicker}>Quran</p>
        <h1 className="ed-h1">Waiting for review</h1>
        <p style={s.lede}>
          Chapters that editors have finished and sent on for a second look.
          Approving one publishes its drafts to the live site.
        </p>
      </header>

      {requests.length === 0 ? (
        <p style={s.lede}>Nothing is waiting on you right now.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map((r) => {
            const canApprove = canApproveQuranVersion(editorial, r.version_id)
            return (
              <li key={r.id} style={{ ...s.surface, padding: '14px 16px' }}>
                <div style={rowHead}>
                  <div>
                    <Link
                      href={`/editor/quran/${r.version_id}/${r.chapter_number}`}
                      style={{ fontFamily: 'var(--font-cormorant)', fontSize: 23, color: 'var(--ed-fg)' }}
                    >
                      Version {r.version_id} · Chapter {r.chapter_number}
                    </Link>
                    <p style={meta}>
                      Sent by editor #{r.requested_by} on{' '}
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
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
}
const meta: CSSProperties = {
  margin: '4px 0 0',
  fontFamily: 'var(--font-glacial)',
  fontSize: 12.5,
  letterSpacing: '0.03em',
  color: 'var(--ed-fg-muted)',
}
const note: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 15,
  fontStyle: 'italic',
  color: 'var(--ed-fg-muted)',
}
