import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession, getQuranRectifyReport } from '@/lib/editorial-client'
import * as s from '../../styles'
import { RectifyPanel } from './rectify-panel'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ versionId: string }>
}

export default async function QuranRectifyPage({ params }: PageProps) {
  const { versionId: versionIdRaw } = await params
  const versionId = Number(versionIdRaw)
  if (!Number.isInteger(versionId) || versionId < 1) notFound()

  const session = await auth()
  if (!session?.accessToken) redirect(`/auth/sign-in?next=/editor/quran/${versionId}/rectify`)
  const editorial = await getEditorialSession(session.accessToken)
  // Rectification is admin-only; the backend re-checks, this just avoids showing
  // a surface the caller cannot use.
  if (!editorial) redirect('/editor/quran')
  if (!editorial.is_admin) redirect(`/editor/quran/${versionId}`)

  const report = await getQuranRectifyReport(session.accessToken, versionId)
  if (!report) notFound()

  return (
    <section style={s.page}>
      <Link href={`/editor/quran/${versionId}`} style={s.crumb}>
        ← Chapters
      </Link>
      <RectifyPanel versionId={versionId} report={report} />
    </section>
  )
}
