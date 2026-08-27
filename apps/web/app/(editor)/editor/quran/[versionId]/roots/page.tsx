import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getEditorialSession,
  listQuranRoots,
} from '@/lib/editorial-client'
import * as s from '../../styles'
import { RootsEditor } from './roots-editor'
import {
  canApproveQuranVersion,
  canReadQuranVersion,
  canWriteQuranVersion,
} from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface PageProps {
  params: Promise<{ versionId: string }>
  searchParams: Promise<{ q?: string; offset?: string }>
}

export default async function QuranRootsPage({ params, searchParams }: PageProps) {
  const { versionId: versionIdRaw } = await params
  const { q: qRaw, offset: offsetRaw } = await searchParams
  const versionId = Number(versionIdRaw)
  if (!Number.isInteger(versionId) || versionId < 1) notFound()

  const session = await auth()
  if (!session?.accessToken) redirect(`/auth/sign-in?next=/editor/quran/${versionId}/roots`)
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canReadQuranVersion(editorial, versionId)) redirect('/editor/quran')

  const q = qRaw?.trim() || undefined
  const offset = Math.max(0, Number(offsetRaw) || 0)
  const { roots, total } = await listQuranRoots(session.accessToken, versionId, {
    q,
    limit: PAGE_SIZE,
    offset,
  })

  const canWrite = canWriteQuranVersion(editorial, versionId)
  const canApprove = canApproveQuranVersion(editorial, versionId)

  const base = `/editor/quran/${versionId}/roots`
  const qParam = q ? `&q=${encodeURIComponent(q)}` : ''
  const hasPrev = offset > 0
  const hasNext = offset + PAGE_SIZE < total

  return (
    <section className="ed-page">
      <Link href={`/editor/quran/${versionId}`} style={s.crumb}>
        ← Chapters
      </Link>

      <form action={base} method="get" style={searchForm}>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Filter by Arabic root prefix"
          style={{ ...s.input, maxWidth: 320 }}
        />
        <button type="submit" style={s.buttonGhost}>Search</button>
      </form>

      <RootsEditor versionId={versionId} canWrite={canWrite} canApprove={canApprove} roots={roots} />

      {(hasPrev || hasNext) && (
        <nav style={pager}>
          {hasPrev ? (
            <Link href={`${base}?offset=${Math.max(0, offset - PAGE_SIZE)}${qParam}`} style={s.buttonGhost}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span style={{ fontSize: 14, color: 'var(--ed-fg-muted)' }}>
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          {hasNext ? (
            <Link href={`${base}?offset=${offset + PAGE_SIZE}${qParam}`} style={s.buttonGhost}>
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  )
}

const searchForm: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 18,
}
const pager: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginTop: 18,
}
