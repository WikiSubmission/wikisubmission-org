import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import type { EditorialContentModule } from '@/lib/editorial-content-client'
import { DocForm } from '@/components/editor/content/doc-form'
import { CONTENT_MODULE_DEFS } from '@/components/editor/content/module-defs'
import {
  loadModuleOptions,
  loadViewerAuthorId,
} from '@/components/editor/content/options'
import { EditorCrumb } from '@/components/editor/content/page-chrome'
import { canWriteContentModule } from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ module: string }>
  searchParams: Promise<{ group?: string }>
}

export default async function NewContentDocPage({
  params,
  searchParams,
}: PageProps) {
  const { module } = await params
  const def = CONTENT_MODULE_DEFS[module]
  if (!def) notFound()

  const session = await auth()
  if (!session?.accessToken)
    redirect(`/auth/sign-in?next=/editor/${module}/new`)
  const editorial = await getEditorialSession(session.accessToken)
  const canWrite = !!editorial && canWriteContentModule(editorial, module)
  if (!canWrite) redirect(`/editor/${module}`)

  const { group } = await searchParams
  const options = await loadModuleOptions(module, session.accessToken)

  // A non-admin does not get the author picker, so their own byline is filled
  // in here instead. Admins pick from the full list.
  const viewerAuthorId =
    module === 'article' && !editorial.is_admin
      ? await loadViewerAuthorId(session.accessToken)
      : null
  const initialFields =
    viewerAuthorId === null ? {} : { author_id: viewerAuthorId }

  return (
    <section className="ed-page-narrow px-4 pt-6 pb-24 sm:px-9 sm:pt-8">
      <EditorCrumb href={`/editor/${module}`}>{def.label}</EditorCrumb>
      <DocForm
        module={module as EditorialContentModule}
        def={def}
        docId={null}
        initialFields={initialFields}
        initialStatus={null}
        translationGroup={group ?? null}
        canWrite
        options={options}
        isAdmin={editorial.is_admin}
      />
    </section>
  )
}
