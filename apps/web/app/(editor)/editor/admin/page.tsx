import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getEditorialSession,
  listBibleVersions,
  listQuranVersions,
} from '@/lib/editorial-client'
import { listEditorialEditors } from '@/lib/editorial-content-client'
import { AdminGrantsClient } from './admin-client'
import * as s from '../quran/styles'

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
    <section style={s.page}>
      <Link href="/editor" style={s.crumb}>
        ← Workspace
      </Link>
      <div className="dh">
        <div className="dh-main">
          <p className="dh-eyebrow">System</p>
          <h1>Admin Tools</h1>
          <p className="dh-sub">
            Grant editorial access per module and per version. Admins bypass
            grants entirely; everyone else sees only what is granted here.
          </p>
        </div>
      </div>

      <AdminGrantsClient
        editors={editors}
        quranVersions={quranVersions.map((v) => ({ id: v.id, name: v.name }))}
        bibleVersions={bibleVersions.map((v) => ({ id: v.id, name: v.name }))}
      />
    </section>
  )
}
