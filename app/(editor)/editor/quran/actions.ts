'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  createQuranPublishRequest,
  decideQuranPublishRequest,
  upsertQuranChapterDraft,
  upsertQuranVerseDraft,
  type MutationResult,
  type QuranPublishRequest,
  type QuranVerseDraft,
  type QuranVerseDraftInput,
} from '@/lib/editorial-client'

// Server actions for the Quran editor. The backend bearer token is read from
// the session here and never crosses to the browser; the backend re-checks
// every mutation, so these actions are a transport, not the security boundary.

async function requireToken(): Promise<string | null> {
  const session = await auth()
  return session?.accessToken ?? null
}

const NOT_AUTHED: MutationResult<never> = { ok: false, error: 'Your session has expired. Sign in again.' }

export async function saveVerseDraftAction(
  versionId: number,
  chapterNumber: number,
  verseNumber: number,
  body: QuranVerseDraftInput,
): Promise<MutationResult<QuranVerseDraft>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await upsertQuranVerseDraft(token, versionId, chapterNumber, verseNumber, body)
  if (result.ok) revalidatePath(`/editor/quran/${versionId}/${chapterNumber}`)
  return result
}

export async function saveChapterTitleAction(
  versionId: number,
  chapterNumber: number,
  title: string | null,
): Promise<MutationResult<{ chapter_number: number; title?: string | null }>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await upsertQuranChapterDraft(token, versionId, chapterNumber, title)
  if (result.ok) revalidatePath(`/editor/quran/${versionId}/${chapterNumber}`)
  return result
}

export async function submitPublishAction(
  versionId: number,
  chapterNumber: number,
  note: string | null,
): Promise<MutationResult<QuranPublishRequest>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await createQuranPublishRequest(token, versionId, chapterNumber, note)
  if (result.ok) {
    revalidatePath(`/editor/quran/${versionId}/${chapterNumber}`)
    revalidatePath(`/editor/quran/${versionId}`)
    revalidatePath('/editor/quran/approvals')
  }
  return result
}

export async function decidePublishAction(
  requestId: number,
  decision: 'approve' | 'reject' | 'cancel',
  note: string | null,
): Promise<MutationResult<QuranPublishRequest>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await decideQuranPublishRequest(token, requestId, decision, note)
  if (result.ok) {
    revalidatePath('/editor/quran/approvals')
    revalidatePath(`/editor/quran/${result.data.version_id}/${result.data.chapter_number}`)
    revalidatePath(`/editor/quran/${result.data.version_id}`)
  }
  return result
}
