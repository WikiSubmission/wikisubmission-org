import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  listContentDocs,
  type EditorialContentDoc,
  type EditorialContentModule,
  type EditorialContentStatus,
} from '@/lib/editorial-content-client'
import { CONTENT_MODULE_DEFS, docTitle } from '@/components/editor/content/module-defs'
import { EditorCrumb, EditorPageHeader } from '@/components/editor/content/page-chrome'
import { STATUS_META } from '@/components/editor/content/status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: Array<{ value: EditorialContentStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'changed', label: 'Unpublished changes' },
  { value: 'published', label: 'Published' },
]

interface PageProps {
  params: Promise<{ module: string }>
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function ContentModuleListPage({ params, searchParams }: PageProps) {
  const { module } = await params
  const def = CONTENT_MODULE_DEFS[module]
  if (!def) notFound()

  const session = await auth()
  if (!session?.accessToken) redirect(`/auth/sign-in?next=/editor/${module}`)
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || (!editorial.is_admin && editorial.modules[module] === undefined)) {
    redirect('/editor')
  }
  const canWrite = editorial.is_admin || editorial.modules[module] === true

  const { q = '', status = '' } = await searchParams
  const statusFilter = STATUS_FILTERS.some((f) => f.value === status)
    ? (status as EditorialContentStatus | '')
    : ''
  const { docs, total } = await listContentDocs(
    session.accessToken,
    module as EditorialContentModule,
    { q: q || undefined, status: statusFilter || undefined, limit: 200 },
  )

  const isArticle = module === 'article'
  const groups = isArticle ? groupArticles(docs) : docs.map((doc) => [doc])

  return (
    <section className="w-full max-w-5xl px-9 py-8">
      <EditorCrumb href="/editor">Workspace</EditorCrumb>
      <EditorPageHeader
        eyebrow={def.label}
        title={def.label}
        meta={`${total} total`}
        description={def.blurb}
        actions={
          canWrite && (
            <Button
              asChild
              className="font-[family-name:var(--font-source-serif)] text-[13.5px]"
            >
              <Link href={`/editor/${module}/new`}>New {def.labelSingular.toLowerCase()}</Link>
            </Button>
          )
        }
      />

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2.5">
        <Input
          name="q"
          defaultValue={q}
          placeholder={`Search ${def.label.toLowerCase()}…`}
          className="h-9 min-w-[260px] max-w-sm font-[family-name:var(--font-source-serif)]"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.value || 'all'}
              module={module}
              q={q}
              value={f.value}
              label={f.label}
              current={statusFilter}
            />
          ))}
        </div>
      </form>

      {docs.length === 0 ? (
        <p className="max-w-[60ch] text-[14px] leading-relaxed text-muted-foreground">
          {q || statusFilter
            ? 'Nothing matches these filters.'
            : `No ${def.label.toLowerCase()} yet.${canWrite ? ' Create the first one.' : ''}`}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[3px] border border-border bg-card">
          {groups.map((group) => (
            <DocGroup key={group[0].id} module={module} group={group} isArticle={isArticle} canWrite={canWrite} />
          ))}
        </div>
      )}
    </section>
  )
}

function FilterChip({
  module,
  q,
  value,
  label,
  current,
}: {
  module: string
  q: string
  value: string
  label: string
  current: string
}) {
  const query = new URLSearchParams()
  if (q) query.set('q', q)
  if (value) query.set('status', value)
  const qs = query.toString()
  const active = current === value
  return (
    <Button
      asChild
      size="sm"
      variant={active ? 'default' : 'outline'}
      className="h-8 font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.1em]"
    >
      <Link href={`/editor/${module}${qs ? `?${qs}` : ''}`}>{label}</Link>
    </Button>
  )
}

/** Groups article variants that share a translation_group; newest first. */
function groupArticles(docs: EditorialContentDoc[]): EditorialContentDoc[][] {
  const byGroup = new Map<string, EditorialContentDoc[]>()
  for (const doc of docs) {
    const key = doc.translation_group ?? `solo-${doc.id}`
    const list = byGroup.get(key) ?? []
    list.push(doc)
    byGroup.set(key, list)
  }
  return [...byGroup.values()]
}

function DocGroup({
  module,
  group,
  isArticle,
  canWrite,
}: {
  module: string
  group: EditorialContentDoc[]
  isArticle: boolean
  canWrite: boolean
}) {
  const def = CONTENT_MODULE_DEFS[module]
  const primary = group[0]
  return (
    <div className="border-b border-border last:border-b-0">
      {group.map((doc) => {
        const fields = doc.fields as Record<string, unknown>
        const language = typeof fields.language === 'string' ? fields.language : null
        const meta = STATUS_META[doc.status]
        return (
          <Link
            key={doc.id}
            href={`/editor/${module}/${doc.id}`}
            className="relative flex flex-col gap-1 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent"
          >
            <div className="flex items-center gap-2.5">
              <span className={`size-[7px] shrink-0 rounded-full ${meta.dot}`} aria-hidden />
              <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-source-serif)] text-[15px] font-medium text-foreground">
                {docTitle(def, fields)}
              </span>
              {language && (
                <Badge
                  variant="outline"
                  className="font-[family-name:var(--font-glacial)] text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {language.toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
              <span className={`font-[family-name:var(--font-glacial)] uppercase tracking-[0.1em] ${meta.text}`}>
                {doc.status}
              </span>
              <span className="opacity-45">·</span>
              <span>{subtitleOf(def.subtitleKey, fields)}</span>
              <span className="opacity-45">·</span>
              <span>updated {new Date(doc.updated_at).toLocaleDateString()}</span>
              {doc.updated_by_email && (
                <>
                  <span className="opacity-45">·</span>
                  <span>{doc.updated_by_email}</span>
                </>
              )}
            </div>
          </Link>
        )
      })}
      {isArticle && canWrite && primary.translation_group && (
        <Link
          href={`/editor/${module}/new?group=${primary.translation_group}`}
          className="block px-4 py-2.5 font-[family-name:var(--font-source-serif)] text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          + Add a language variant
        </Link>
      )}
    </div>
  )
}

function subtitleOf(key: string | undefined, fields: Record<string, unknown>): string {
  if (!key) return ''
  const v = fields[key]
  return typeof v === 'string' ? v : ''
}
