/// <reference lib="webworker" />
//
// Dedicated worker hosting sqlite-wasm with the OPFS SyncAccessHandle Pool VFS.
// All SQL runs here; the main thread talks to it only over the typed RPC in
// protocol.ts. The SAH-pool VFS gives synchronous OPFS access without requiring
// COOP/COEP headers (only the SharedArrayBuffer VFS needs those).
//
// Runtime path (OPFS, real WASM) is verified via Playwright, not unit tests —
// jsdom has neither OPFS nor a usable WASM/worker environment.

import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { normalizeForSearch } from '../../text-normalization/normalize'
import type { SearchOpts, SearchRow, VerseRange, VerseRow } from '../types'
import type { WorkerRequest, WorkerResponse } from './protocol'

// Minimal local typings for the subset of the sqlite-wasm OO1 + SAH-pool API we
// use. The package's own types are loose; this keeps our call sites checked.
interface Oo1Db {
  exec(opts: {
    sql: string
    bind?: unknown[]
    rowMode?: 'object' | 'array'
    resultRows?: unknown[]
  }): unknown
  close(): void
}
interface SAHPoolUtil {
  importDb(path: string, bytes: Uint8Array): number
  OpfsSAHPoolDb: new (path: string) => Oo1Db
  getFileNames(): string[]
  unlink(path: string): boolean
}
interface Sqlite3 {
  installOpfsSAHPoolVfs(opts: { name?: string; initialCapacity?: number }): Promise<SAHPoolUtil>
}

const VFS_NAME = 'ws-offline'
const POOL_CAPACITY = 12

let pool: SAHPoolUtil | null = null
const openDbs = new Map<string, Oo1Db>()

const pathFor = (bundleId: string) => `/${bundleId}.db`

async function ensurePool(): Promise<SAHPoolUtil> {
  if (pool) return pool
  const sqlite3 = (await sqlite3InitModule()) as unknown as Sqlite3
  pool = await sqlite3.installOpfsSAHPoolVfs({ name: VFS_NAME, initialCapacity: POOL_CAPACITY })
  return pool
}

function closeIfOpen(bundleId: string): void {
  const db = openDbs.get(bundleId)
  if (db) {
    db.close()
    openDbs.delete(bundleId)
  }
}

function dbFor(bundleId: string): Oo1Db {
  let db = openDbs.get(bundleId)
  if (!db) {
    db = new pool!.OpfsSAHPoolDb(pathFor(bundleId))
    openDbs.set(bundleId, db)
  }
  return db
}

function rows(db: Oo1Db, sql: string, bind: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  db.exec({ sql, bind, rowMode: 'object', resultRows: out })
  return out
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

function toVerseRow(r: Record<string, unknown>): VerseRow {
  return {
    vk: str(r.vk),
    cn: Number(r.cn),
    vn: Number(r.vn),
    text: str(r.text),
    subtitle: r.subtitle == null ? undefined : str(r.subtitle),
    footnote: r.footnote == null ? undefined : str(r.footnote),
  }
}

function getVerses(bundleId: string, range: VerseRange): VerseRow[] {
  const db = dbFor(bundleId)
  if (range.verseStart != null || range.verseEnd != null) {
    const start = range.verseStart ?? 1
    const end = range.verseEnd ?? Number.MAX_SAFE_INTEGER
    return rows(
      db,
      `SELECT vk, cn, vn, text, subtitle, footnote FROM verses
       WHERE cn = ? AND vn BETWEEN ? AND ? ORDER BY vn`,
      [range.chapter, start, end],
    ).map(toVerseRow)
  }
  return rows(
    db,
    `SELECT vk, cn, vn, text, subtitle, footnote FROM verses WHERE cn = ? ORDER BY vn`,
    [range.chapter],
  ).map(toVerseRow)
}

function getChapterTitle(bundleId: string, chapter: number): string | null {
  const found = rows(dbFor(bundleId), `SELECT title FROM chapters WHERE cn = ?`, [chapter])
  return found.length > 0 ? str(found[0].title) : null
}

function search(bundleIds: string[], query: string, opts?: SearchOpts): SearchRow[] {
  const norm = normalizeForSearch(query)
  if (!norm) return []
  // Quote so FTS5 treats the normalized query as a phrase/string literal; this
  // is also required for the trigram tokenizer used by the Arabic bundle.
  const match = `"${norm.replace(/"/g, '""')}"`
  const limit = opts?.limit ?? 20
  const offset = opts?.offset ?? 0

  const merged: SearchRow[] = []
  for (const bundleId of bundleIds) {
    // bundleId is `${scripture}-${lang}`; recover the language for the hit.
    const lang = bundleId.slice(bundleId.indexOf('-') + 1)
    const db = dbFor(bundleId)
    const found = rows(
      db,
      `SELECT v.vk AS vk, v.cn AS cn, v.vn AS vn, v.text AS text,
              snippet(verses_fts, 0, '<b>', '</b>', '…', 12) AS hl,
              rank AS rank
       FROM verses_fts f JOIN verses v ON v.rowid = f.rowid
       WHERE verses_fts MATCH ? ORDER BY rank LIMIT ? OFFSET ?`,
      [match, limit, offset],
    )
    for (const r of found) {
      merged.push({
        vk: str(r.vk),
        cn: Number(r.cn),
        vn: Number(r.vn),
        lang,
        text: str(r.text),
        hl: r.hl == null ? undefined : str(r.hl),
        rank: typeof r.rank === 'number' ? r.rank : Number(r.rank),
      })
    }
  }
  // FTS5 rank is more-negative-is-better; ascending puts best hits first.
  merged.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  return merged.slice(0, limit)
}

async function handle(req: WorkerRequest): Promise<unknown> {
  switch (req.type) {
    case 'init':
      await ensurePool()
      return true
    case 'importDb': {
      await ensurePool()
      closeIfOpen(req.bundleId)
      const path = pathFor(req.bundleId)
      if (pool!.getFileNames().includes(path)) pool!.unlink(path)
      pool!.importDb(path, new Uint8Array(req.bytes))
      return true
    }
    case 'remove': {
      await ensurePool()
      closeIfOpen(req.bundleId)
      const path = pathFor(req.bundleId)
      if (pool!.getFileNames().includes(path)) pool!.unlink(path)
      return true
    }
    case 'listFiles':
      await ensurePool()
      return pool!.getFileNames()
    case 'getVerses':
      await ensurePool()
      return getVerses(req.bundleId, req.range)
    case 'getChapterTitle':
      await ensurePool()
      return getChapterTitle(req.bundleId, req.chapter)
    case 'search':
      await ensurePool()
      return search(req.bundleIds, req.query, req.opts)
    default: {
      const _exhaustive: never = req
      throw new Error(`unknown request: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const req = e.data
  try {
    const result = await handle(req)
    const res: WorkerResponse = { id: req.id, ok: true, result }
    self.postMessage(res)
  } catch (err) {
    const res: WorkerResponse = {
      id: req.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(res)
  }
}
