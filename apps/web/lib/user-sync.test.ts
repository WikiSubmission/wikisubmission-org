import { describe, it, expect } from 'vitest'
import { buildSyncRequest, reconcileSyncResponse } from '@/lib/offline/user/sync-engine'
import type { OutboxEntry, SyncResponse } from '@/lib/offline/user/types'

function entry(id: string, createdAt: number, mutation: OutboxEntry['mutation']): OutboxEntry {
  return { id, createdAt, attempts: 0, mutation }
}

const noteUpsert = entry('b', 200, {
  entity: 'note',
  op: 'upsert',
  scripture: 'quran',
  vk: '2:255',
  content: 'Ayat al-Kursi',
  tags: ['favorite'],
})
const bookmarkCreate = entry('a', 100, {
  entity: 'bookmark_entry',
  op: 'create',
  categoryId: 3,
  scripture: 'quran',
  vk: '1:1',
})
const progress = entry('c', 300, { entity: 'reading_progress', op: 'upsert', scripture: 'quran', vk: '18:10' })

describe('buildSyncRequest', () => {
  it('orders mutations oldest-first regardless of input order', () => {
    const req = buildSyncRequest([progress, noteUpsert, bookmarkCreate])
    expect(req.mutations.map((m) => m.id)).toEqual(['a', 'b', 'c'])
  })

  it('maps natural-key payloads to snake_case wire fields', () => {
    const req = buildSyncRequest([bookmarkCreate, noteUpsert])
    expect(req.mutations[0]).toMatchObject({
      id: 'a',
      entity: 'bookmark_entry',
      op: 'create',
      created_at: 100,
      payload: { category_id: 3, scripture: 'quran', verse_key: '1:1' },
    })
    expect(req.mutations[1].payload).toMatchObject({
      scripture: 'quran',
      verse_key: '2:255',
      content: 'Ayat al-Kursi',
      tags: ['favorite'],
    })
  })

  it('omits tags from a note payload when absent', () => {
    const e = entry('n', 1, { entity: 'note', op: 'upsert', scripture: 'quran', vk: '1:1', content: 'hi' })
    expect(buildSyncRequest([e]).mutations[0].payload).not.toHaveProperty('tags')
  })

  it('does not mutate the input array', () => {
    const input = [progress, bookmarkCreate]
    buildSyncRequest(input)
    expect(input.map((e) => e.id)).toEqual(['c', 'a'])
  })
})

describe('reconcileSyncResponse', () => {
  const outbox = [bookmarkCreate, noteUpsert, progress]
  const resp = (results: SyncResponse['results']): SyncResponse => ({ results, server_time: 999 })

  it('flushes applied, duplicate, and superseded; retries error', () => {
    const r = reconcileSyncResponse(
      outbox,
      resp([
        { id: 'a', status: 'applied' },
        { id: 'b', status: 'superseded' },
        { id: 'c', status: 'error', error: 'db timeout' },
      ]),
    )
    expect(r.flushedIds.sort()).toEqual(['a', 'b'])
    expect(r.failedIds).toEqual(['c'])
  })

  it('treats a duplicate as flushed (idempotent replay)', () => {
    const r = reconcileSyncResponse([bookmarkCreate], resp([{ id: 'a', status: 'duplicate' }]))
    expect(r.flushedIds).toEqual(['a'])
    expect(r.failedIds).toEqual([])
  })

  it('keeps entries with no result for the next flush', () => {
    const r = reconcileSyncResponse(outbox, resp([{ id: 'a', status: 'applied' }]))
    expect(r.flushedIds).toEqual(['a'])
    expect(r.failedIds.sort()).toEqual(['b', 'c'])
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('ignores a result for an id not in the outbox', () => {
    // Server echoes an unknown id; it must not appear in either bucket.
    const r = reconcileSyncResponse(
      [bookmarkCreate],
      resp([
        { id: 'a', status: 'applied' },
        { id: 'ghost', status: 'applied' },
      ]),
    )
    expect(r.flushedIds).toEqual(['a'])
    expect(r.failedIds).toEqual([])
  })

  it('retries every entry when all results are errors', () => {
    const r = reconcileSyncResponse(
      outbox,
      resp([
        { id: 'a', status: 'error' },
        { id: 'b', status: 'error' },
        { id: 'c', status: 'error' },
      ]),
    )
    expect(r.flushedIds).toEqual([])
    expect(r.failedIds.sort()).toEqual(['a', 'b', 'c'])
  })

  it('retries everything against an empty response', () => {
    const r = reconcileSyncResponse(outbox, resp([]))
    expect(r.flushedIds).toEqual([])
    expect(r.failedIds.sort()).toEqual(['a', 'b', 'c'])
  })
})

describe('buildSyncRequest payload mapping', () => {
  it('maps a note delete to scripture + verse_key only', () => {
    const e = entry('d', 1, { entity: 'note', op: 'delete', scripture: 'quran', vk: '2:255' })
    const m = buildSyncRequest([e]).mutations[0]
    expect(m).toMatchObject({ entity: 'note', op: 'delete' })
    expect(m.payload).toEqual({ scripture: 'quran', verse_key: '2:255' })
  })

  it('maps a bookmark delete with its category', () => {
    const e = entry('d', 1, {
      entity: 'bookmark_entry',
      op: 'delete',
      categoryId: 7,
      scripture: 'quran',
      vk: '1:1',
    })
    expect(buildSyncRequest([e]).mutations[0].payload).toEqual({
      category_id: 7,
      scripture: 'quran',
      verse_key: '1:1',
    })
  })

  it('maps reading_progress to scripture + verse_key only', () => {
    const e = entry('d', 1, { entity: 'reading_progress', op: 'upsert', scripture: 'bible', vk: 'John:3:16' })
    expect(buildSyncRequest([e]).mutations[0].payload).toEqual({
      scripture: 'bible',
      verse_key: 'John:3:16',
    })
  })

  it('breaks createdAt ties deterministically by id', () => {
    const e1 = entry('z', 50, { entity: 'reading_progress', op: 'upsert', scripture: 'quran', vk: '1:1' })
    const e2 = entry('a', 50, { entity: 'reading_progress', op: 'upsert', scripture: 'quran', vk: '1:2' })
    expect(buildSyncRequest([e1, e2]).mutations.map((m) => m.id)).toEqual(['a', 'z'])
  })
})
