import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getQuranChapter,
  getEditorialSession,
} from '@/lib/editorial-client'
import * as s from '../../styles'
import { ChapterEditor } from './chapter-editor'
import { canApproveQuranVersion, canReadQuranVersion } from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ versionId: string; chapterNumber: string }>
}

export default async function QuranChapterEditorPage({ params }: PageProps) {
  const { versionId: versionIdRaw, chapterNumber: chapterRaw } = await params
  const versionId = Number(versionIdRaw)
  const chapterNumber = Number(chapterRaw)
  if (!Number.isInteger(versionId) || !Number.isInteger(chapterNumber)) notFound()

  const session = await auth()
  if (!session?.accessToken) {
    redirect(`/auth/sign-in?next=/editor/quran/${versionId}/${chapterNumber}`)
  }
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canReadQuranVersion(editorial, versionId)) redirect('/editor/quran')

  const chapter = await getQuranChapter(session.accessToken, versionId, chapterNumber)
  if (!chapter) notFound()

  const canApprove = canApproveQuranVersion(editorial, versionId)

  return (
    <section className="ed-page">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <Link href={`/editor/quran/${versionId}`} style={s.crumb}>
          ← Chapters
        </Link>
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 14 }}>
          <Link href={`/editor/quran/${versionId}/${chapterNumber}/words`} style={s.crumb}>
            Word by word →
          </Link>
          <Link href={`/editor/quran/${versionId}/roots`} style={s.crumb}>
            Root meanings →
          </Link>
        </span>
      </div>
      <ChapterEditor
        versionId={versionId}
        chapterNumber={chapterNumber}
        initial={chapter}
        canApprove={canApprove}
      />
    </section>
  )
}

