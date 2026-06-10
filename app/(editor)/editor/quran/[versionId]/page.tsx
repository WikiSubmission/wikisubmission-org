import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getEditorialSession,
  listQuranChapters,
  type EditorialSession,
} from '@/lib/editorial-client'
import * as s from '../styles'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ versionId: string }>
}

export default async function QuranChaptersPage({ params }: PageProps) {
  const { versionId: versionIdRaw } = await params
  const versionId = Number(versionIdRaw)
  if (!Number.isInteger(versionId) || versionId < 1) notFound()

  const session = await auth()
  if (!session?.accessToken) redirect(`/auth/sign-in?next=/editor/quran/${versionId}`)
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canRead(editorial, versionId)) redirect('/editor/quran')

  const chapters = await listQuranChapters(session.accessToken, versionId)
  if (chapters.length === 0) notFound()

  const canWrite = editorial.is_admin || editorial.quran_versions[String(versionId)] === true

  return (
    <section style={s.page}>
      <Link href="/editor/quran" style={s.crumb}>
        ← Versions
      </Link>
      <header style={{ marginBottom: 20 }}>
        <p style={s.kicker}>Quran · version {versionId}</p>
        <h1 style={s.heading}>Chapters</h1>
        <p style={s.lede}>
          {canWrite
            ? 'Open a chapter to edit verse text and submit it for publishing.'
            : 'You have read-only access to this version.'}
        </p>
      </header>

      <ul style={list}>
        {chapters.map((c) => (
          <li key={c.chapter_number}>
            <Link href={`/editor/quran/${versionId}/${c.chapter_number}`} style={row}>
              <span style={num}>{c.chapter_number}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={title}>{c.title || `Chapter ${c.chapter_number}`}</span>
                <span style={meta}>
                  {c.draft_verse_count}/{c.verse_count} verses drafted
                  {c.has_title_draft ? ' · title draft' : ''}
                </span>
              </span>
              {c.pending_request && (
                <span style={{ ...s.pillBase(), ...s.statusPill.pending }}>pending</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function canRead(editorial: EditorialSession, versionId: number): boolean {
  return editorial.is_admin || editorial.quran_versions[String(versionId)] !== undefined
}

const list: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  border: '1px solid var(--ed-rule)',
  borderRadius: 'var(--ed-radius)',
  overflow: 'hidden',
}
const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '12px 16px',
  borderBottom: '1px solid var(--ed-rule)',
  background: 'var(--ed-surface)',
}
const num: CSSProperties = {
  fontFamily: 'var(--font-glacial)',
  fontSize: 13,
  color: 'var(--ed-fg-muted)',
  width: 28,
  textAlign: 'right',
  flexShrink: 0,
}
const title: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-cormorant)',
  fontSize: 18,
  color: 'var(--ed-fg)',
}
const meta: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.03em',
  color: 'var(--ed-fg-muted)',
}
