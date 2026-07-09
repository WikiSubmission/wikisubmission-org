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
import * as s from '../quran/styles'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: Array<{ value: EditorialContentStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'changed', label: 'Unpublished changes' },
  { value: 'published', label: 'Published' },
]

const STATUS_DOT: Record<EditorialContentStatus, string> = {
  draft: 'draft',
  changed: 'changes',
  published: 'pub',
}

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
    <section style={s.page}>
      <Link href="/editor" style={s.crumb}>
        ← Workspace
      </Link>
      <div className="dh">
        <div className="dh-main">
          <p className="dh-eyebrow">{def.label}</p>
          <h1>
            {def.label} <span className="hint">{total} total</span>
          </h1>
          <p className="dh-sub">{def.blurb}</p>
        </div>
        <div className="dh-actions">
          {canWrite && (
            <Link className="btn primary" href={`/editor/${module}/new`}>
              New {def.labelSingular.toLowerCase()}
            </Link>
          )}
        </div>
      </div>

      <form method="get" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="search" style={{ minWidth: 260 }}>
          <input name="q" defaultValue={q} placeholder={`Search ${def.label.toLowerCase()}…`} />
        </div>
        <div className="filterbar">
          {STATUS_FILTERS.map((f) => (
            <FilterChip key={f.value || 'all'} module={module} q={q} value={f.value} label={f.label} current={statusFilter} />
          ))}
        </div>
      </form>

      {docs.length === 0 ? (
        <p style={s.lede}>
          {q || statusFilter
            ? 'Nothing matches these filters.'
            : `No ${def.label.toLowerCase()} yet.${canWrite ? ' Create the first one.' : ''}`}
        </p>
      ) : (
        <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 'var(--ed-radius)', background: 'var(--ed-surface)' }}>
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
  return (
    <Link className={`fchip${current === value ? ' is-on' : ''}`} href={`/editor/${module}${qs ? `?${qs}` : ''}`}>
      {label}
    </Link>
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
    <div style={{ borderBottom: '1px solid var(--ed-rule)' }}>
      {group.map((doc) => {
        const fields = doc.fields as Record<string, unknown>
        const language = typeof fields.language === 'string' ? fields.language : null
        return (
          <Link key={doc.id} href={`/editor/${module}/${doc.id}`} className="row">
            <div className="row-top">
              <span className={`sdot ${STATUS_DOT[doc.status]}`} />
              <span className="row-title">{docTitle(def, fields)}</span>
              {language && <span className="badge">{language.toUpperCase()}</span>}
            </div>
            <div className="row-meta">
              <span className={`status-label ${STATUS_DOT[doc.status]}`}>{doc.status}</span>
              <span className="sep">·</span>
              <span>{subtitleOf(def.subtitleKey, fields)}</span>
              <span className="sep">·</span>
              <span>updated {new Date(doc.updated_at).toLocaleDateString()}</span>
              {doc.updated_by_email && (
                <>
                  <span className="sep">·</span>
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
          className="row"
          style={{ color: 'var(--ed-fg-muted)', fontSize: 13 }}
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
