import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  getContentDoc,
  type EditorialContentModule,
} from '@/lib/editorial-content-client'
import { DocForm } from '@/components/editor/content/doc-form'
import { CONTENT_MODULE_DEFS } from '@/components/editor/content/module-defs'
import { loadModuleOptions } from '@/components/editor/content/options'
import { EditorCrumb } from '@/components/editor/content/page-chrome'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ module: string; docId: string }>
}

export default async function EditContentDocPage({ params }: PageProps) {
  const { module, docId: rawDocId } = await params
  const def = CONTENT_MODULE_DEFS[module]
  if (!def) notFound()
  const docId = Number(rawDocId)
  if (!Number.isInteger(docId) || docId <= 0) notFound()

  const session = await auth()
  if (!session?.accessToken) redirect(`/auth/sign-in?next=/editor/${module}/${docId}`)
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || (!editorial.is_admin && editorial.modules[module] === undefined)) {
    redirect('/editor')
  }
  const canWrite = editorial.is_admin || editorial.modules[module] === true

  const [doc, options] = await Promise.all([
    getContentDoc(session.accessToken, module as EditorialContentModule, docId),
    loadModuleOptions(module, session.accessToken),
  ])
  if (!doc) notFound()

  return (
    <section className="w-full max-w-3xl px-9 py-8">
      <EditorCrumb href={`/editor/${module}`}>{def.label}</EditorCrumb>
      <DocForm
        module={module as EditorialContentModule}
        def={def}
        docId={doc.id}
        initialFields={doc.fields as Record<string, unknown>}
        initialStatus={doc.status}
        translationGroup={doc.translation_group ?? null}
        canWrite={canWrite}
        options={options}
      />
    </section>
  )
}
