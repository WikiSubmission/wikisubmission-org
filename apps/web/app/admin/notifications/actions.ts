'use server'

import { auth } from '@/auth'
import {
  notificationsAdminClient,
  NotificationsAdminError,
  type ScheduleDestination,
  type ScheduleInput,
  type ScheduledNotification,
  type SendResult,
  type ZikrEntry,
  type ZikrInput,
} from '@/lib/notifications-admin-client'

export type NotificationsResult<T> = { ok: true; data: T } | { ok: false; error: string }

async function client() {
  const session = await auth()
  if (!session?.accessToken) return { error: 'not_authenticated' as const }
  if (!session.isAdmin) return { error: 'not_authorized' as const }
  return { client: notificationsAdminClient(session.accessToken) }
}

function describe(err: unknown): string {
  if (err === 'not_authenticated') return 'Your session expired. Please sign in again.'
  if (err === 'not_authorized') return 'Admin access required.'
  if (err instanceof NotificationsAdminError) {
    switch (err.status) {
      case 401:
        return 'Your session expired. Please sign in again.'
      case 403:
        return 'Admin access required.'
      case 404:
        return 'Not found.'
      default:
        return err.serverMessage || 'Request failed.'
    }
  }
  return 'Unexpected error.'
}

async function run<T>(fn: (c: ReturnType<typeof notificationsAdminClient>) => Promise<T>) {
  const r = await client()
  if ('error' in r) return { ok: false as const, error: describe(r.error) }
  try {
    return { ok: true as const, data: await fn(r.client) }
  } catch (err) {
    return { ok: false as const, error: describe(err) }
  }
}

export async function createZikrAction(input: ZikrInput): Promise<NotificationsResult<ZikrEntry>> {
  return run((c) => c.createZikr(input))
}

export async function updateZikrAction(
  id: number,
  patch: Partial<ZikrInput>,
): Promise<NotificationsResult<ZikrEntry>> {
  return run((c) => c.updateZikr(id, patch))
}

export async function deleteZikrAction(id: number): Promise<NotificationsResult<{ ok: boolean }>> {
  return run((c) => c.deleteZikr(id))
}

export async function createScheduleAction(
  input: ScheduleInput,
): Promise<NotificationsResult<ScheduledNotification>> {
  return run((c) => c.createSchedule(input))
}

export async function updateScheduleAction(
  id: number,
  patch: Partial<ScheduleInput>,
): Promise<NotificationsResult<ScheduledNotification>> {
  return run((c) => c.updateSchedule(id, patch))
}

export async function deleteScheduleAction(
  id: number,
): Promise<NotificationsResult<{ ok: boolean }>> {
  return run((c) => c.deleteSchedule(id))
}

export async function sendNowAction(id: number): Promise<NotificationsResult<SendResult>> {
  return run((c) => c.sendNow(id))
}

export async function sendTestAction(input: {
  title: string
  body: string
  url?: string
  broadcast?: boolean
  destination?: ScheduleDestination
  category_filter?: string
}): Promise<NotificationsResult<SendResult>> {
  return run((c) => c.sendTest(input))
}

export async function refreshSchedulesAction(): Promise<
  NotificationsResult<ScheduledNotification[]>
> {
  return run((c) => c.listSchedules())
}
