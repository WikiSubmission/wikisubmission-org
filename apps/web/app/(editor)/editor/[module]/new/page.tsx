import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import type { EditorialContentModule } from '@/lib/editorial-content-client'
import { DocForm } from '@/components/editor/content/doc-form'
import { CONTENT_MODULE_DEFS } from '@/components/editor/content/module-defs'
import { loadModuleOptions } from '@/components/editor/content/options'
import { EditorCrumb } from '@/components/editor/content/page-chrome'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ module: string }>
  searchParams: Promise<{ group?: string }>
}

export default async function NewContentDocPage({ params, searchParams }: PageProps) {
  const { module } = await params
  const def = CONTENT_MODULE_DEFS[module]
  if (!def) notFound()

  const session = await auth()
  if (!session?.accessToken) redirect(`/auth/sign-in?next=/editor/${module}/new`)
  const editorial = await getEditorialSession(session.accessToken)
  const canWrite = !!editorial && (editorial.is_admin || editorial.modules[module] === true)
  if (!canWrite) redirect(`/editor/${module}`)

  const { group } = await searchParams
  const options = await loadModuleOptions(module, session.accessToken)

  return (
    <section className="w-full max-w-3xl px-9 py-8">
      <EditorCrumb href={`/editor/${module}`}>{def.label}</EditorCrumb>
      <DocForm
        module={module as EditorialContentModule}
        def={def}
        docId={null}
        initialFields={{}}
        initialStatus={null}
        translationGroup={group ?? null}
        canWrite
        options={options}
      />
    </section>
  )
}
