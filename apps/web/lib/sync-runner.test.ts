import { describe, it, expect, vi } from 'vitest'
import { flushOutbox } from '@/lib/offline/user/sync-runner'
import type { OfflineUserStore } from '@/lib/offline/user/user-store'
import type { OutboxEntry, SyncRequest, SyncResponse } from '@/lib/offline/user/types'

function storeWith(pending: OutboxEntry[]) {
  const markFlushed = vi.fn(async () => {})
  const bumpAttempts = vi.fn(async () => {})
  const store = {
    pendingMutations: async () => pending,
    markFlushed,
    bumpAttempts,
  } as unknown as OfflineUserStore
  return { store, markFlushed, bumpAttempts }
}

const entry = (id: string): OutboxEntry => ({
  id,
  createdAt: Number(id),
  attempts: 0,
  mutation: { entity: 'reading_progress', op: 'upsert', scripture: 'quran', vk: '1:1' },
})

describe('flushOutbox', () => {
  it('does nothing and does not call the transport when the outbox is empty', async () => {
    const { store, markFlushed } = storeWith([])
    const transport = vi.fn()
    const res = await flushOutbox(store, transport)
    expect(transport).not.toHaveBeenCalled()
    expect(markFlushed).not.toHaveBeenCalled()
    expect(res).toEqual({ flushed: 0, failed: 0 })
  })

  it('flushes terminal results and bumps attempts on failures', async () => {
    const { store, markFlushed, bumpAttempts } = storeWith([entry('1'), entry('2'), entry('3')])
    const response: SyncResponse = {
      server_time: 1,
      results: [
        { id: '1', status: 'applied' },
        { id: '2', status: 'error', error: 'x' },
        { id: '3', status: 'duplicate' },
      ],
    }
    const transport = vi.fn(async () => response)
    const res = await flushOutbox(store, transport)

    expect(transport).toHaveBeenCalledOnce()
    expect(markFlushed).toHaveBeenCalledWith(['1', '3'])
    expect(bumpAttempts).toHaveBeenCalledWith(['2'])
    expect(res).toEqual({ flushed: 2, failed: 1 })
  })

  it('sends mutations oldest-first', async () => {
    const { store } = storeWith([entry('3'), entry('1'), entry('2')])
    let sentIds: string[] = []
    const transport = vi.fn(async (req: SyncRequest) => {
      sentIds = req.mutations.map((m) => m.id)
      return { server_time: 1, results: req.mutations.map((m) => ({ id: m.id, status: 'applied' as const })) }
    })
    await flushOutbox(store, transport)
    expect(sentIds).toEqual(['1', '2', '3'])
  })
})
