import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getEditorialSession,
  listBibleVersions,
  listQuranVersions,
} from '@/lib/editorial-client'
import { listEditorialEditors } from '@/lib/editorial-content-client'
import { AdminGrantsClient } from './admin-client'
import { EditorCrumb, EditorPageHeader } from '@/components/editor/content/page-chrome'

export const dynamic = 'force-dynamic'

/**
 * Admin tools — editorial grant management. Lists every user with their
 * module and per-version grants; edits replace a user's grants atomically.
 * Admin-only: the backend re-checks on every call.
 */
export default async function EditorAdminPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/admin')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial?.is_admin) redirect('/editor')

  const [{ editors }, quranVersions, bibleVersions] = await Promise.all([
    listEditorialEditors(session.accessToken, { limit: 500 }),
    listQuranVersions(session.accessToken),
    listBibleVersions(session.accessToken),
  ])

  return (
    <section className="w-full max-w-5xl px-9 py-8">
      <EditorCrumb href="/editor">Workspace</EditorCrumb>
      <EditorPageHeader
        eyebrow="System"
        title="Admin Tools"
        description="Grant editorial access per module and per version. Admins bypass grants entirely; everyone else sees only what is granted here."
      />

      <AdminGrantsClient
        editors={editors}
        quranVersions={quranVersions.map((v) => ({ id: v.id, name: v.name }))}
        bibleVersions={bibleVersions.map((v) => ({ id: v.id, name: v.name }))}
      />
    </section>
  )
}
