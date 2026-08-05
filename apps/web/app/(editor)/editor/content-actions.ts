'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  createContentDoc,
  deleteContentDoc,
  publishContentDoc,
  unpublishContentDoc,
  updateContentDoc,
  type EditorialContentDoc,
  type EditorialContentModule,
  type MutationResult,
} from '@/lib/editorial-content-client'

// Server actions for the content modules (articles, authors, categories,
// communities, appendices). The bearer token stays server-side; the backend
// re-validates permissions and payloads on every call.

const NOT_AUTHED: MutationResult<never> = {
  ok: false,
  error: 'Your session has expired. Sign in again.',
}

async function requireToken(): Promise<string | null> {
  const session = await auth()
  return session?.accessToken ?? null
}

function revalidateModule(module: EditorialContentModule, docId?: number) {
  revalidatePath(`/editor/${module}`)
  if (docId) revalidatePath(`/editor/${module}/${docId}`)
}

export async function saveContentDocAction(
  module: EditorialContentModule,
  docId: number | null,
  fields: Record<string, unknown>,
  translationGroup?: string | null,
): Promise<MutationResult<EditorialContentDoc>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result =
    docId === null
      ? await createContentDoc(token, module, {
          fields,
          translation_group: translationGroup ?? undefined,
        })
      : await updateContentDoc(token, module, docId, { fields })
  if (result.ok) revalidateModule(module, result.data.id)
  return result
}

export async function publishContentDocAction(
  module: EditorialContentModule,
  docId: number,
): Promise<MutationResult<EditorialContentDoc>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await publishContentDoc(token, module, docId)
  if (result.ok) revalidateModule(module, docId)
  return result
}

export async function unpublishContentDocAction(
  module: EditorialContentModule,
  docId: number,
): Promise<MutationResult<EditorialContentDoc>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await unpublishContentDoc(token, module, docId)
  if (result.ok) revalidateModule(module, docId)
  return result
}

export async function deleteContentDocAction(
  module: EditorialContentModule,
  docId: number,
): Promise<MutationResult<null>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await deleteContentDoc(token, module, docId)
  if (result.ok) revalidateModule(module, docId)
  return result
}
