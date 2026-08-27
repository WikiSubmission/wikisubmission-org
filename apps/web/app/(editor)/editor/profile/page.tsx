import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  getContentDoc,
  type EditorialContentModule,
} from '@/lib/editorial-content-client'
import { DocForm } from '@/components/editor/content/doc-form'
import { CONTENT_MODULE_DEFS } from '@/components/editor/content/module-defs'
import { loadViewerAuthorId } from '@/components/editor/content/options'
import { EditorCrumb } from '@/components/editor/content/page-chrome'
import { hasEditorWorkspaceAccess } from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

/**
 * The editor's own author profile — their byline as readers see it.
 *
 * The Authors module itself stays admin-only: an editor has no business
 * browsing or editing everyone else's records. This page is the one row that is
 * theirs. The backend authorizes it per document (resolveAuthorWriteActor), so
 * an editor who reaches this route with someone else's id gets a 403 regardless
 * of what the page renders.
 *
 * Admins land here too and see their own profile, but they also keep the full
 * list at /editor/author.
 */
export default async function EditorProfilePage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor/profile')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !hasEditorWorkspaceAccess(editorial)) redirect('/')

  const def = CONTENT_MODULE_DEFS.author
  const authorId = await loadViewerAuthorId(session.accessToken)
  // No author row linked to this account yet — the form opens in create mode
  // and the backend pins the new row's user_id to the caller.
  const doc =
    authorId === null
      ? null
      : await getContentDoc(session.accessToken, 'author', authorId)

  const name = session.user?.name?.trim()

  return (
    <section className="ed-page-narrow px-4 pt-6 pb-24 sm:px-9 sm:pt-8">
      <EditorCrumb href="/editor">Workspace</EditorCrumb>

      <header className="mb-6">
        <p className="font-[family-name:var(--font-glacial)] text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
          Your profile
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-[28px] leading-[1.08] text-foreground sm:text-[36px] sm:leading-[1.05]">
          {doc === null ? 'Set up your byline' : (name ?? 'Your byline')}
        </h1>
        <p className="mt-2.5 max-w-[60ch] text-[16.5px] leading-relaxed text-muted-foreground">
          {doc === null
            ? 'You do not have a byline yet. Fill this in and publish it, and your name will appear on the articles you write.'
            : 'This is how your name appears to readers on the articles you write. Only you and an administrator can change it.'}
        </p>
      </header>

      <DocForm
        module={'author' as EditorialContentModule}
        def={def}
        docId={doc?.id ?? null}
        initialFields={(doc?.fields as Record<string, unknown>) ?? {}}
        initialStatus={doc?.status ?? null}
        canWrite
        options={{}}
        isAdmin={editorial.is_admin}
        // Author deletes stay admin-only, and an admin deletes from the full
        // list rather than from their own profile page.
        canDelete={false}
      />
    </section>
  )
}
