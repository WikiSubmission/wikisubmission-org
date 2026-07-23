// Server-only helpers — imported from server components, never the browser.
import { wsApiServer } from '@/src/api/server-client'
import { listQuranVersions } from '@/lib/editorial-client'
import { listContentDocs } from '@/lib/editorial-content-client'
import { docTitle, CONTENT_MODULE_DEFS } from './module-defs'

export type OptionMap = Record<string, Array<{ value: string; label: string }>>

/**
 * Loads the reference-data options a module's editing form needs (languages,
 * authors, categories, Quran versions). Failures degrade to empty lists — the
 * form stays usable and the backend still validates the final payload.
 */
export async function loadModuleOptions(
  module: string,
  token: string | undefined,
): Promise<OptionMap> {
  switch (module) {
    case 'article': {
      const [languages, authors, categories] = await Promise.all([
        loadLanguages(),
        loadDocOptions('author', token),
        loadDocOptions('category', token),
      ])
      return { languages, authors, categories }
    }
    case 'appendix': {
      const versions = await listQuranVersions(token)
      return {
        quranVersions: versions.map((v) => ({ value: String(v.id), label: v.name })),
      }
    }
    default:
      return {}
  }
}

async function loadLanguages(): Promise<Array<{ value: string; label: string }>> {
  try {
    const { data } = await wsApiServer.GET('/languages', {
      next: { revalidate: 3600 },
    })
    return (data ?? [])
      .filter((l) => l.code)
      .map((l) => ({ value: l.code!, label: l.name ? `${l.name} (${l.code})` : l.code! }))
  } catch {
    return []
  }
}

async function loadDocOptions(
  module: 'author' | 'category',
  token: string | undefined,
): Promise<Array<{ value: string; label: string }>> {
  const def = CONTENT_MODULE_DEFS[module]
  const { docs } = await listContentDocs(token, module, { limit: 500 })
  return docs.map((doc) => ({
    value: String(doc.id),
    label: docTitle(def, doc.fields as Record<string, unknown>),
  }))
}
