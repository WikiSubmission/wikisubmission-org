'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  replaceEditorGrants,
  type EditorGrantsInput,
  type EditorialEditor,
  type MutationResult,
} from '@/lib/editorial-content-client'

// Server actions for the editorial admin surface. Admin-only on the backend;
// the token never reaches the browser.

export async function replaceEditorGrantsAction(
  userId: number,
  grants: EditorGrantsInput,
): Promise<MutationResult<EditorialEditor>> {
  const session = await auth()
  const token = session?.accessToken
  if (!token) return { ok: false, error: 'Your session has expired. Sign in again.' }
  const result = await replaceEditorGrants(token, userId, grants)
  if (result.ok) revalidatePath('/editor/admin')
  return result
}
