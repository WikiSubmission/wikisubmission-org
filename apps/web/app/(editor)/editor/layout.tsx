import './editor.css'

import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  hasAnyGameAccess,
  hasEditorWorkspaceAccess,
  resolveEditorRole,
} from '@/lib/editorial-access'
import { AppShell, type EditorViewer } from '@/components/editor/shell'

// Session-dependent: never statically render the editor.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'WikiSubmission Editor',
  robots: { index: false, follow: false },
}

export default async function EditorLayout({ children }: { children: ReactNode }) {
  // Gate 1 — authentication. Anonymous callers go to sign-in. middleware.ts
  // already redirects unauthenticated requests, but the layout re-checks so the
  // gate holds even if middleware is ever bypassed.
  const session = await auth()
  if (!session?.accessToken) {
    redirect('/auth/sign-in?next=/editor')
  }

  // Gate 2 — authorization. The backend is authoritative: a null snapshot means
  // no access at all (403, deactivated, or unknown), so deny by default.
  //
  // A non-null snapshot is not sufficient on its own. /editorial/session also
  // serves games-only editors, because the games studio reads it to resolve
  // per-game grants — but games have no content documents, so such a caller
  // would land on an empty workspace here. Require a content module and send
  // them to the studio they can actually use.
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial) {
    redirect('/')
  }
  if (!hasEditorWorkspaceAccess(editorial)) {
    redirect(hasAnyGameAccess(editorial) ? '/admin/games' : '/')
  }

  const email = session.user?.email ?? ''
  const localPart = email ? email.split('@')[0] : ''
  const viewer: EditorViewer = {
    name: session.user?.name || localPart || 'Editor',
    handle: localPart || (session.user?.name ?? 'editor').toLowerCase(),
    email,
    // Same provider photo the site nav shows, so the account looks identical
    // on both surfaces.
    image: session.user?.image ?? null,
    isAdmin: editorial.is_admin,
    role: resolveEditorRole(editorial),
  }

  async function doSignOut() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <div className="ed-scope">
      <AppShell viewer={viewer} modules={editorial.modules} signOutAction={doSignOut}>
        {children}
      </AppShell>
    </div>
  )
}
