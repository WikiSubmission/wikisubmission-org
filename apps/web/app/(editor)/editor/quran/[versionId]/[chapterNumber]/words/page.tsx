import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getQuranChapterWords,
  getEditorialSession,
  type EditorialSession,
} from '@/lib/editorial-client'
import * as s from '../../../styles'
import { WordsEditor } from './words-editor'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ versionId: string; chapterNumber: string }>
}

export default async function QuranChapterWordsPage({ params }: PageProps) {
  const { versionId: versionIdRaw, chapterNumber: chapterRaw } = await params
  const versionId = Number(versionIdRaw)
  const chapterNumber = Number(chapterRaw)
  if (!Number.isInteger(versionId) || versionId < 1 || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
    notFound()
  }

  const session = await auth()
  if (!session?.accessToken) {
    redirect(`/auth/sign-in?next=/editor/quran/${versionId}/${chapterNumber}/words`)
  }
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canRead(editorial, versionId)) redirect('/editor/quran')

  const words = await getQuranChapterWords(session.accessToken, versionId, chapterNumber)
  if (!words) notFound()

  return (
    <section style={s.page}>
      <Link href={`/editor/quran/${versionId}/${chapterNumber}`} style={s.crumb}>
        ← Verse text
      </Link>
      <WordsEditor versionId={versionId} chapterNumber={chapterNumber} initial={words} />
    </section>
  )
}

function canRead(editorial: EditorialSession, versionId: number): boolean {
  return editorial.is_admin || editorial.quran_versions[String(versionId)] !== undefined
}
