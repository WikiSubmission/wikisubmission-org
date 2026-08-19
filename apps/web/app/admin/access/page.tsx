import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { listBibleVersions, listQuranVersions } from '@/lib/editorial-client'
import {
  listEditorialEditors,
  listEditorialGames,
} from '@/lib/editorial-content-client'
import { AccessClient } from './access-client'

export const dynamic = 'force-dynamic'

/**
 * The single access console: roles, games and editorial grants for every user.
 *
 * The user list comes from /editorial/admin/editors rather than /users, because
 * that endpoint already returns email, display name, role and active state
 * alongside every grant — one request instead of two, with no risk of the two
 * lists disagreeing.
 */
export default async function AdminAccessPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/access')
  if (!session.isAdmin) redirect('/')

  const [editorList, quranVersions, bibleVersions, games] = await Promise.all([
    listEditorialEditors(session.accessToken, { limit: 500 }),
    listQuranVersions(session.accessToken),
    listBibleVersions(session.accessToken),
    listEditorialGames(session.accessToken),
  ])

  // These clients swallow failures into empty results, so an empty user list is
  // the one signal that something went wrong — there is always at least the
  // admin viewing this page.
  const loadError =
    editorList.editors.length === 0 ? 'Could not load users.' : null

  return (
    <AccessClient
      editors={editorList.editors}
      quranVersions={quranVersions.map((v) => ({ id: v.id, name: v.name }))}
      bibleVersions={bibleVersions.map((v) => ({ id: v.id, name: v.name }))}
      games={games}
      loadError={loadError}
    />
  )
}
