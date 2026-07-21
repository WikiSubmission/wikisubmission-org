/// <reference lib="webworker" />
//
// Writable user.db worker: a per-user SQLite database in its own OPFS SAH-pool,
// holding the local mirror of bookmarks/notes/reading-progress plus the mutation
// outbox. Separate from the read-only content worker so the two stores stay
// independent. All writes go through here; the main thread only sends RPC.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { serveWorker } from '../../worker-serve'
import type { OutboxEntry, UserMutation } from '../types'
import type { BookmarkEntryMirror, NoteMirror } from '../user-store'
import type { UserWorkerRequest } from './protocol'

interface Oo1Db {
  exec(opts: { sql: string; bind?: unknown[]; rowMode?: 'object' | 'array'; resultRows?: unknown[] }): unknown
  close(): void
}
interface SAHPoolUtil {
  OpfsSAHPoolDb: new (path: string) => Oo1Db
  unlink(path: string): boolean
  getFileNames(): string[]
}
interface Sqlite3 {
  installOpfsSAHPoolVfs(opts: { name?: string; initialCapacity?: number }): Promise<SAHPoolUtil>
}

const VFS_NAME = 'ws-offline-user'

let poolPromise: Promise<SAHPoolUtil> | null = null
let db: Oo1Db | null = null
let currentPath = ''

// Memoize the in-flight install promise, not the resolved pool: the SAH-pool VFS
// grabs exclusive OPFS access handles, and two concurrent callers each running
// installOpfsSAHPoolVfs would collide ("Access Handles cannot be created if
// there is another open Access Handle"). Sharing one promise serializes them.
function ensurePool(): Promise<SAHPoolUtil> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const sqlite3 = (await sqlite3InitModule()) as unknown as Sqlite3
      return sqlite3.installOpfsSAHPoolVfs({ name: VFS_NAME, initialCapacity: 4 })
    })().catch((err) => {
      poolPromise = null // allow a later retry instead of caching the failure
      throw err
    })
  }
  return poolPromise
}

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

function pathFor(userId: string): string {
  // Per-user file so data is isolated; sanitize to a safe filename.
  return `/user-${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}.db`
}

async function open(userId: string): Promise<void> {
  const pool = await ensurePool()
  const path = pathFor(userId)
  if (db && currentPath === path) return
  if (db) {
    db.close()
    db = null
  }
  db = new pool.OpfsSAHPoolDb(path)
  currentPath = path
  for (const sql of SCHEMA) db.exec({ sql })
}

function requireDb(): Oo1Db {
  if (!db) throw new Error('user store not opened')
  return db
}

function rows(sql: string, bind: unknown[] = []): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  requireDb().exec({ sql, bind, rowMode: 'object', resultRows: out })
  return out
}

function run(sql: string, bind: unknown[] = []): void {
  requireDb().exec({ sql, bind })
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

// ── mutation application (mirror + outbox atomically) ──

function applyToMirror(m: UserMutation): void {
  switch (m.entity) {
    case 'bookmark_entry':
      if (m.op === 'create') {
        run(`INSERT OR IGNORE INTO bookmark_entries (category_id, scripture, vk) VALUES (?, ?, ?)`, [
          m.categoryId,
          m.scripture,
          m.vk,
        ])
      } else {
        run(`DELETE FROM bookmark_entries WHERE category_id = ? AND scripture = ? AND vk = ?`, [
          m.categoryId,
          m.scripture,
          m.vk,
        ])
      }
      return
    case 'note':
      if (m.op === 'upsert') {
        run(
          `INSERT INTO notes (scripture, vk, content, tags, updated_at) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT (scripture, vk) DO UPDATE SET content = excluded.content, tags = excluded.tags, updated_at = excluded.updated_at`,
          [m.scripture, m.vk, m.content, m.tags ? JSON.stringify(m.tags) : null, Date.now()],
        )
      } else {
        run(`DELETE FROM notes WHERE scripture = ? AND vk = ?`, [m.scripture, m.vk])
      }
      return
    case 'reading_progress':
      run(
        `INSERT INTO reading_progress (scripture, vk, updated_at) VALUES (?, ?, ?)
         ON CONFLICT (scripture) DO UPDATE SET vk = excluded.vk, updated_at = excluded.updated_at`,
        [m.scripture, m.vk, Date.now()],
      )
      return
  }
}

function apply(m: UserMutation, outboxId: string, createdAt: number): void {
  run('BEGIN')
  try {
    applyToMirror(m)
    run(`INSERT OR REPLACE INTO outbox (id, mutation, created_at, attempts) VALUES (?, ?, ?, 0)`, [
      outboxId,
      JSON.stringify(m),
      createdAt,
    ])
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
}

function getBookmarkEntries(scripture: string): BookmarkEntryMirror[] {
  return rows(`SELECT category_id, scripture, vk FROM bookmark_entries WHERE scripture = ?`, [scripture]).map(
    (r) => ({ categoryId: Number(r.category_id), scripture: str(r.scripture), vk: str(r.vk) }),
  )
}

function noteRowToMirror(r: Record<string, unknown>): NoteMirror {
  return {
    scripture: str(r.scripture),
    vk: str(r.vk),
    content: str(r.content),
    tags: r.tags ? (JSON.parse(str(r.tags)) as string[]) : undefined,
    updatedAt: Number(r.updated_at),
  }
}

function getNote(scripture: string, vk: string): NoteMirror | null {
  const found = rows(`SELECT scripture, vk, content, tags, updated_at FROM notes WHERE scripture = ? AND vk = ?`, [
    scripture,
    vk,
  ])
  return found.length === 0 ? null : noteRowToMirror(found[0])
}

// Verse keys are `${chapter}:${verse}`; '2:%' matches 2:1 but not 20:1.
const chapterPrefix = (chapter: number) => `${chapter}:%`

function getChapterUserData(
  scripture: string,
  chapter: number,
): { entries: BookmarkEntryMirror[]; notes: NoteMirror[] } {
  const prefix = chapterPrefix(chapter)
  const entries = rows(
    `SELECT category_id, scripture, vk FROM bookmark_entries WHERE scripture = ? AND vk LIKE ?`,
    [scripture, prefix],
  ).map((r) => ({ categoryId: Number(r.category_id), scripture: str(r.scripture), vk: str(r.vk) }))
  const notes = rows(
    `SELECT scripture, vk, content, tags, updated_at FROM notes WHERE scripture = ? AND vk LIKE ?`,
    [scripture, prefix],
  ).map(noteRowToMirror)
  return { entries, notes }
}

function mirrorChapterUserData(
  scripture: string,
  chapter: number,
  entries: BookmarkEntryMirror[],
  notes: NoteMirror[],
): void {
  const prefix = chapterPrefix(chapter)
  run('BEGIN')
  try {
    run(`DELETE FROM bookmark_entries WHERE scripture = ? AND vk LIKE ?`, [scripture, prefix])
    for (const e of entries) {
      run(`INSERT OR IGNORE INTO bookmark_entries (category_id, scripture, vk) VALUES (?, ?, ?)`, [
        e.categoryId,
        e.scripture,
        e.vk,
      ])
    }
    run(`DELETE FROM notes WHERE scripture = ? AND vk LIKE ?`, [scripture, prefix])
    for (const n of notes) {
      run(
        `INSERT OR REPLACE INTO notes (scripture, vk, content, tags, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [n.scripture, n.vk, n.content, n.tags ? JSON.stringify(n.tags) : null, n.updatedAt],
      )
    }
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
}

function getReadingProgress(scripture: string): string | null {
  const found = rows(`SELECT vk FROM reading_progress WHERE scripture = ?`, [scripture])
  return found.length > 0 ? str(found[0].vk) : null
}

function mirrorBookmarkEntries(scripture: string, entries: BookmarkEntryMirror[]): void {
  run('BEGIN')
  try {
    run(`DELETE FROM bookmark_entries WHERE scripture = ?`, [scripture])
    for (const e of entries) {
      run(`INSERT OR IGNORE INTO bookmark_entries (category_id, scripture, vk) VALUES (?, ?, ?)`, [
        e.categoryId,
        e.scripture,
        e.vk,
      ])
    }
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
}

function pendingMutations(): OutboxEntry[] {
  return rows(`SELECT id, mutation, created_at, attempts FROM outbox ORDER BY created_at ASC, id ASC`).map((r) => ({
    id: str(r.id),
    mutation: JSON.parse(str(r.mutation)) as UserMutation,
    createdAt: Number(r.created_at),
    attempts: Number(r.attempts),
  }))
}

function handle(req: UserWorkerRequest): Promise<unknown> | unknown {
  switch (req.type) {
    case 'open':
      return open(req.userId).then(() => true)
    case 'apply':
      apply(req.mutation, req.outboxId, req.createdAt)
      return true
    case 'getBookmarkEntries':
      return getBookmarkEntries(req.scripture)
    case 'getNote':
      return getNote(req.scripture, req.vk)
    case 'getReadingProgress':
      return getReadingProgress(req.scripture)
    case 'getChapterUserData':
      return getChapterUserData(req.scripture, req.chapter)
    case 'mirrorBookmarkEntries':
      mirrorBookmarkEntries(req.scripture, req.entries)
      return true
    case 'mirrorChapterUserData':
      mirrorChapterUserData(req.scripture, req.chapter, req.entries, req.notes)
      return true
    case 'mirrorNote':
      run(
        `INSERT INTO notes (scripture, vk, content, tags, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (scripture, vk) DO UPDATE SET content = excluded.content, tags = excluded.tags, updated_at = excluded.updated_at`,
        [req.note.scripture, req.note.vk, req.note.content, req.note.tags ? JSON.stringify(req.note.tags) : null, req.note.updatedAt],
      )
      return true
    case 'mirrorReadingProgress':
      run(
        `INSERT INTO reading_progress (scripture, vk, updated_at) VALUES (?, ?, ?)
         ON CONFLICT (scripture) DO UPDATE SET vk = excluded.vk, updated_at = excluded.updated_at`,
        [req.scripture, req.vk, Date.now()],
      )
      return true
    case 'pendingMutations':
      return pendingMutations()
    case 'pendingCount':
      return Number((rows(`SELECT count(*) AS n FROM outbox`)[0]?.n ?? 0))
    case 'markFlushed':
      if (req.ids.length > 0) {
        const placeholders = req.ids.map(() => '?').join(',')
        run(`DELETE FROM outbox WHERE id IN (${placeholders})`, req.ids)
      }
      return true
    case 'bumpAttempts':
      if (req.ids.length > 0) {
        const placeholders = req.ids.map(() => '?').join(',')
        run(`UPDATE outbox SET attempts = attempts + 1 WHERE id IN (${placeholders})`, req.ids)
      }
      return true
    case 'clear':
      run('BEGIN')
      try {
        for (const t of ['bookmark_entries', 'notes', 'reading_progress', 'outbox']) run(`DELETE FROM ${t}`)
        run('COMMIT')
      } catch (e) {
        run('ROLLBACK')
        throw e
      }
      return true
    default: {
      const _exhaustive: never = req
      throw new Error(`unknown request: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

serveWorker<UserWorkerRequest>(handle)
