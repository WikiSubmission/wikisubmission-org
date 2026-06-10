'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  createQuranPublishRequest,
  decideQuranPublishRequest,
  publishQuranRootMeanings,
  upsertQuranChapterDraft,
  upsertQuranRootMeaning,
  upsertQuranVerseDraft,
  upsertQuranWordDraft,
  type MutationResult,
  type QuranPublishRequest,
  type QuranRootPublishResult,
  type QuranRootSummary,
  type QuranVerseDraft,
  type QuranVerseDraftInput,
  type QuranWord,
  type QuranWordDraftInput,
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

export async function saveWordDraftAction(
  versionId: number,
  chapterNumber: number,
  wordId: number,
  body: QuranWordDraftInput,
): Promise<MutationResult<QuranWord>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await upsertQuranWordDraft(token, versionId, wordId, body)
  if (result.ok) revalidatePath(`/editor/quran/${versionId}/${chapterNumber}/words`)
  return result
}

export async function saveRootMeaningAction(
  versionId: number,
  rootId: number,
  meaning: string | null,
): Promise<MutationResult<QuranRootSummary>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await upsertQuranRootMeaning(token, versionId, rootId, meaning)
  if (result.ok) revalidatePath(`/editor/quran/${versionId}/roots`)
  return result
}

export async function publishRootMeaningsAction(
  versionId: number,
  note: string | null,
): Promise<MutationResult<QuranRootPublishResult>> {
  const token = await requireToken()
  if (!token) return NOT_AUTHED
  const result = await publishQuranRootMeanings(token, versionId, note)
  if (result.ok) revalidatePath(`/editor/quran/${versionId}/roots`)
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
