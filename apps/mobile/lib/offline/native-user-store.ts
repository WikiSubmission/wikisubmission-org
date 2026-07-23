import type { SQLiteDBConnection } from '@capacitor-community/sqlite'
import type { OutboxEntry, UserMutation } from '@/lib/offline/user/types'
import type {
  BookmarkEntryMirror,
  NoteMirror,
  OfflineUserStore,
} from '@/lib/offline/user/user-store'
import { openDb, query } from './native-db'

/**
 * Native (@capacitor-community/sqlite) implementation of OfflineUserStore: a
 * writable per-user database holding the bookmark/note/reading-progress mirror
 * plus the mutation outbox. Schema and statements mirror the web user worker
 * (user-sqlite.worker.ts) exactly, so the local mirror and sync behaviour are
 * identical across platforms. Outbox ids and timestamps are minted here.
 */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS bookmark_entries (
     category_id INTEGER NOT NULL, scripture TEXT NOT NULL, vk TEXT NOT NULL,
     PRIMARY KEY (category_id, scripture, vk)
   )`,
  `CREATE TABLE IF NOT EXISTS notes (
     scripture TEXT NOT NULL, vk TEXT NOT NULL, content TEXT NOT NULL,
     tags TEXT, updated_at INTEGER NOT NULL,
     PRIMARY KEY (scripture, vk)
   )`,
  `CREATE TABLE IF NOT EXISTS reading_progress (
     scripture TEXT PRIMARY KEY, vk TEXT NOT NULL, updated_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS outbox (
     id TEXT PRIMARY KEY, mutation TEXT NOT NULL, created_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS outbox_created_at_idx ON outbox (created_at)`,
]

// Verse keys are `${chapter}:${verse}`; '2:%' matches 2:1 but not 20:1.
const chapterPrefix = (chapter: number) => `${chapter}:%`

function dbNameFor(userId: string): string {
  return `ws-user-${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

function tagsToCol(tags?: string[]): string | null {
  return tags ? JSON.stringify(tags) : null
}

function noteRowToMirror(r: Record<string, unknown>): NoteMirror {
  const tags = r.tags == null ? undefined : (JSON.parse(String(r.tags)) as string[])
  return {
    scripture: String(r.scripture ?? ''),
    vk: String(r.vk ?? ''),
    content: String(r.content ?? ''),
    tags,
    updatedAt: Number(r.updated_at),
  }
}

export class NativeOfflineUserStore implements OfflineUserStore {
  private db: SQLiteDBConnection | null = null
  private dbName = ''

  private require(): SQLiteDBConnection {
    if (!this.db) throw new Error('user store not opened')
    return this.db
  }

  async open(userId: string): Promise<void> {
    const name = dbNameFor(userId)
    if (this.db && this.dbName === name) return
    this.db = await openDb(name, false)
    this.dbName = name
    for (const sql of SCHEMA) await this.db.execute(sql)
  }

  // ── mirror reads ──

  async getBookmarkEntries(scripture: string): Promise<BookmarkEntryMirror[]> {
    const rows = await query(
      this.require(),
      `SELECT category_id, scripture, vk FROM bookmark_entries WHERE scripture = ?`,
      [scripture],
    )
    return rows.map((r) => ({
      categoryId: Number(r.category_id),
      scripture: String(r.scripture ?? ''),
      vk: String(r.vk ?? ''),
    }))
  }

  async getNote(scripture: string, vk: string): Promise<NoteMirror | null> {
    const rows = await query(
      this.require(),
      `SELECT scripture, vk, content, tags, updated_at FROM notes WHERE scripture = ? AND vk = ?`,
      [scripture, vk],
    )
    return rows.length === 0 ? null : noteRowToMirror(rows[0])
  }

  async getReadingProgress(scripture: string): Promise<string | null> {
    const rows = await query(
      this.require(),
      `SELECT vk FROM reading_progress WHERE scripture = ?`,
      [scripture],
    )
    return rows.length > 0 ? String(rows[0].vk ?? '') : null
  }

  async getChapterUserData(
    scripture: string,
    chapter: number,
  ): Promise<{ entries: BookmarkEntryMirror[]; notes: NoteMirror[] }> {
    const prefix = chapterPrefix(chapter)
    const db = this.require()
    const entryRows = await query(
      db,
      `SELECT category_id, scripture, vk FROM bookmark_entries WHERE scripture = ? AND vk LIKE ?`,
      [scripture, prefix],
    )
    const noteRows = await query(
      db,
      `SELECT scripture, vk, content, tags, updated_at FROM notes WHERE scripture = ? AND vk LIKE ?`,
      [scripture, prefix],
    )
    return {
      entries: entryRows.map((r) => ({
        categoryId: Number(r.category_id),
        scripture: String(r.scripture ?? ''),
        vk: String(r.vk ?? ''),
      })),
      notes: noteRows.map(noteRowToMirror),
    }
  }

  // ── write-through from successful online reads ──

  async mirrorBookmarkEntries(scripture: string, entries: BookmarkEntryMirror[]): Promise<void> {
    const set = [
      { statement: `DELETE FROM bookmark_entries WHERE scripture = ?`, values: [scripture] },
      ...entries.map((e) => ({
        statement: `INSERT OR IGNORE INTO bookmark_entries (category_id, scripture, vk) VALUES (?, ?, ?)`,
        values: [e.categoryId, e.scripture, e.vk],
      })),
    ]
    await this.require().executeSet(set, true)
  }

  async mirrorNote(note: NoteMirror): Promise<void> {
    await this.require().run(
      `INSERT INTO notes (scripture, vk, content, tags, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (scripture, vk) DO UPDATE SET content = excluded.content, tags = excluded.tags, updated_at = excluded.updated_at`,
      [note.scripture, note.vk, note.content, tagsToCol(note.tags), note.updatedAt],
    )
  }

  async mirrorReadingProgress(scripture: string, vk: string): Promise<void> {
    await this.require().run(
      `INSERT INTO reading_progress (scripture, vk, updated_at) VALUES (?, ?, ?)
       ON CONFLICT (scripture) DO UPDATE SET vk = excluded.vk, updated_at = excluded.updated_at`,
      [scripture, vk, Date.now()],
    )
  }

  async mirrorChapterUserData(
    scripture: string,
    chapter: number,
    entries: BookmarkEntryMirror[],
    notes: NoteMirror[],
  ): Promise<void> {
    const prefix = chapterPrefix(chapter)
    const set = [
      { statement: `DELETE FROM bookmark_entries WHERE scripture = ? AND vk LIKE ?`, values: [scripture, prefix] },
      ...entries.map((e) => ({
        statement: `INSERT OR IGNORE INTO bookmark_entries (category_id, scripture, vk) VALUES (?, ?, ?)`,
        values: [e.categoryId, e.scripture, e.vk],
      })),
      { statement: `DELETE FROM notes WHERE scripture = ? AND vk LIKE ?`, values: [scripture, prefix] },
      ...notes.map((n) => ({
        statement: `INSERT OR REPLACE INTO notes (scripture, vk, content, tags, updated_at) VALUES (?, ?, ?, ?, ?)`,
        values: [n.scripture, n.vk, n.content, tagsToCol(n.tags), n.updatedAt],
      })),
    ]
    await this.require().executeSet(set, true)
  }

  // ── local-first writes ──

  async apply(mutation: UserMutation): Promise<void> {
    const outboxId = crypto.randomUUID()
    const createdAt = Date.now()
    const set = [
      ...mirrorStatements(mutation),
      {
        statement: `INSERT OR REPLACE INTO outbox (id, mutation, created_at, attempts) VALUES (?, ?, ?, 0)`,
        values: [outboxId, JSON.stringify(mutation), createdAt],
      },
    ]
    await this.require().executeSet(set, true)
  }

  // ── outbox / sync ──

  async pendingMutations(): Promise<OutboxEntry[]> {
    const rows = await query(
      this.require(),
      `SELECT id, mutation, created_at, attempts FROM outbox ORDER BY created_at ASC, id ASC`,
    )
    return rows.map((r) => ({
      id: String(r.id ?? ''),
      mutation: JSON.parse(String(r.mutation)) as UserMutation,
      createdAt: Number(r.created_at),
      attempts: Number(r.attempts),
    }))
  }

  async pendingCount(): Promise<number> {
    const rows = await query(this.require(), `SELECT count(*) AS n FROM outbox`)
    return Number(rows[0]?.n ?? 0)
  }

  async markFlushed(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const placeholders = ids.map(() => '?').join(',')
    await this.require().run(`DELETE FROM outbox WHERE id IN (${placeholders})`, ids)
  }

  async bumpAttempts(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const placeholders = ids.map(() => '?').join(',')
    await this.require().run(
      `UPDATE outbox SET attempts = attempts + 1 WHERE id IN (${placeholders})`,
      ids,
    )
  }

  async clear(): Promise<void> {
    const set = ['bookmark_entries', 'notes', 'reading_progress', 'outbox'].map((t) => ({
      statement: `DELETE FROM ${t}`,
      values: [],
    }))
    await this.require().executeSet(set, true)
  }
}

/** The mirror half of a mutation, as a batched statement set (entity/op specific). */
function mirrorStatements(m: UserMutation): { statement: string; values: unknown[] }[] {
  switch (m.entity) {
    case 'bookmark_entry':
      return m.op === 'create'
        ? [
            {
              statement: `INSERT OR IGNORE INTO bookmark_entries (category_id, scripture, vk) VALUES (?, ?, ?)`,
              values: [m.categoryId, m.scripture, m.vk],
            },
          ]
        : [
            {
              statement: `DELETE FROM bookmark_entries WHERE category_id = ? AND scripture = ? AND vk = ?`,
              values: [m.categoryId, m.scripture, m.vk],
            },
          ]
    case 'note':
      return m.op === 'upsert'
        ? [
            {
              statement: `INSERT INTO notes (scripture, vk, content, tags, updated_at) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (scripture, vk) DO UPDATE SET content = excluded.content, tags = excluded.tags, updated_at = excluded.updated_at`,
              values: [m.scripture, m.vk, m.content, tagsToCol(m.tags), Date.now()],
            },
          ]
        : [{ statement: `DELETE FROM notes WHERE scripture = ? AND vk = ?`, values: [m.scripture, m.vk] }]
    case 'reading_progress':
      return [
        {
          statement: `INSERT INTO reading_progress (scripture, vk, updated_at) VALUES (?, ?, ?)
            ON CONFLICT (scripture) DO UPDATE SET vk = excluded.vk, updated_at = excluded.updated_at`,
          values: [m.scripture, m.vk, Date.now()],
        },
      ]
  }
}
