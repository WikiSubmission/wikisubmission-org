import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getEditorialSession,
  listQuranChapters,
  listQuranVersions,
} from '@/lib/editorial-client'
import * as s from '../styles'
import { ReferenceVersionPicker } from '../reference-version-button'
import {
  canReadQuranVersion,
  canWriteQuranVersion,
} from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ versionId: string }>
}

export default async function QuranChaptersPage({ params }: PageProps) {
  const { versionId: versionIdRaw } = await params
  const versionId = Number(versionIdRaw)
  if (!Number.isInteger(versionId) || versionId < 1) notFound()

  const session = await auth()
  if (!session?.accessToken)
    redirect(`/auth/sign-in?next=/editor/quran/${versionId}`)
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canReadQuranVersion(editorial, versionId))
    redirect('/editor/quran')

  const [chapters, versions] = await Promise.all([
    listQuranChapters(session.accessToken, versionId),
    listQuranVersions(session.accessToken),
  ])
  if (chapters.length === 0) notFound()

  const canWrite = canWriteQuranVersion(editorial, versionId)
  // Name the translation rather than its row id — "version 3" means nothing to
  // someone editing Rashad Khalifa's translation.
  const versionName =
    versions.find((v) => v.id === versionId)?.name ?? `Version ${versionId}`

  return (
    <section className="ed-page">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link href="/editor/quran" style={s.crumb}>
          ← Versions
        </Link>
        <span style={{ display: 'flex', gap: 16 }}>
          {editorial.is_admin && (
            <Link href={`/editor/quran/${versionId}/rectify`} style={s.crumb}>
              Integrity check →
            </Link>
          )}
          <Link href={`/editor/quran/${versionId}/roots`} style={s.crumb}>
            Root meanings →
          </Link>
        </span>
      </div>
      <header style={{ marginBottom: 20 }}>
        <p style={s.kicker}>Quran · {versionName}</p>
        <h1 className="ed-h1">Chapters</h1>
        <p style={s.lede}>
          {canWrite
            ? 'Open a chapter to work on its verses. When a chapter is ready, send it on for review and it will be published once approved.'
            : 'You can read this translation, but not change it.'}
        </p>
      </header>

      <ReferenceVersionPicker
        versions={versions
          .filter((version) => canReadQuranVersion(editorial, version.id))
          .map((version) => ({ id: version.id, name: version.name }))}
        initialVersionId={editorial.quran_reference_version_id ?? null}
      />

      <ul style={list}>
        {chapters.map((c) => (
          <li key={c.chapter_number}>
            <Link
              href={`/editor/quran/${versionId}/${c.chapter_number}`}
              style={row}
            >
              <span style={num}>{c.chapter_number}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={title}>
                  {c.title || `Chapter ${c.chapter_number}`}
                </span>
                <span style={meta}>
                  {c.draft_verse_count > 0
                    ? `${c.draft_verse_count} of ${c.verse_count} verses edited`
                    : `${c.verse_count} verses`}
                  {c.has_title_draft ? ' · title edited' : ''}
                </span>
              </span>
              {c.pending_request && (
                <span style={{ ...s.pillBase(), ...s.statusPill.pending }}>
                  in review
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
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
  fontSize: 15,
  color: 'var(--ed-fg-muted)',
  width: 28,
  textAlign: 'right',
  flexShrink: 0,
}
const title: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-cormorant)',
  fontSize: 20.5,
  color: 'var(--ed-fg)',
}
const meta: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-glacial)',
  fontSize: 12.5,
  letterSpacing: '0.03em',
  color: 'var(--ed-fg-muted)',
}
