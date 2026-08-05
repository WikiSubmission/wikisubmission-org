import { Directory, Filesystem } from '@capacitor/filesystem'
import type { OfflineContentStore } from '@/lib/offline/content-store'
import type {
  BundleDescriptor,
  BundleInfo,
  DocSearchRow,
  InstallProgress,
  SearchOpts,
  SearchRow,
  VerseRange,
  VerseRow,
  WordRow,
} from '@/lib/offline/types'
import { normalizeForSearch } from '@/lib/text-normalization/normalize'
import { verifySha256 } from '@/lib/offline/verify'
import { nativeCatalog, type NativeBundleRecord } from './native-catalog'
import { closeDb, openDb, query, sqlite } from './native-db'

/**
 * Native (@capacitor-community/sqlite) implementation of OfflineContentStore.
 * The schema and every query mirror the web worker (sqlite.worker.ts) exactly so
 * the two platforms return identical results from the same bundle files.
 *
 * Install mirrors the web adapter's download → sha256-verify → import
 * pipeline: bytes are fetched to memory, hashed against the manifest digest,
 * staged into the app cache dir, and only then adopted into the plugin's
 * database directory via moveDatabasesAndAddSuffix ("cache" resolves to the
 * same directory Filesystem's Directory.Cache writes to on both platforms).
 * A digest mismatch aborts the install before any file reaches the store.
 */
function bundleIdOf(scripture: string, lang: string): string {
  return `${scripture}-${lang}`
}

function wordsBundleIdOf(scripture: string, lang: string): string {
  return `${scripture}-words-${lang}`
}

/** The plugin stores a downloaded DB under its URL filename stem. */
function dbNameFromUrl(url: string): string {
  const file = url.split('?')[0].split('/').pop() ?? ''
  return file.replace(/\.db$/i, '')
}

/** Streams the bundle to memory, reporting received bytes as chunks arrive. */
async function downloadBytes(
  url: string,
  total: number,
  onProgress?: (p: InstallProgress) => void,
): Promise<Uint8Array<ArrayBuffer>> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`bundle download failed: ${res.status}`)
  if (!res.body) {
    const buf = new Uint8Array(await res.arrayBuffer())
    onProgress?.({ phase: 'download', received: buf.byteLength, total })
    return buf
  }
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.byteLength
    onProgress?.({ phase: 'download', received, total })
  }
  const out = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.byteLength
  }
  return out
}

/** Chunked base64 encoding — String.fromCharCode(...whole) overflows the arg
 *  limit on multi-MB bundles. */
function toBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

function toVerseRow(r: Record<string, unknown>): VerseRow {
  const s = (v: unknown) => (v == null ? undefined : String(v))
  return {
    vk: String(r.vk ?? ''),
    cn: Number(r.cn),
    vn: Number(r.vn),
    text: String(r.text ?? ''),
    subtitle: s(r.subtitle),
    footnote: s(r.footnote),
  }
}

export class NativeOfflineContentStore implements OfflineContentStore {
  private async recordFor(scripture: string, lang: string): Promise<NativeBundleRecord | undefined> {
    const id = bundleIdOf(scripture, lang)
    return (await nativeCatalog.list()).find((b) => b.id === id)
  }

  async installedBundles(): Promise<BundleInfo[]> {
    return nativeCatalog.list()
  }

  async getVerses(scripture: string, lang: string, range: VerseRange): Promise<VerseRow[]> {
    const rec = await this.recordFor(scripture, lang)
    if (!rec) return []
    const db = await openDb(rec.dbName, true)
    if (range.verseStart != null || range.verseEnd != null) {
      const start = range.verseStart ?? 1
      const end = range.verseEnd ?? Number.MAX_SAFE_INTEGER
      const rows = await query(
        db,
        `SELECT vk, cn, vn, text, subtitle, footnote FROM verses
         WHERE cn = ? AND vn BETWEEN ? AND ? ORDER BY vn`,
        [range.chapter, start, end],
      )
      return rows.map(toVerseRow)
    }
    const rows = await query(
      db,
      `SELECT vk, cn, vn, text, subtitle, footnote FROM verses WHERE cn = ? ORDER BY vn`,
      [range.chapter],
    )
    return rows.map(toVerseRow)
  }

  async getWords(scripture: string, lang: string, range: VerseRange): Promise<WordRow[]> {
    const id = wordsBundleIdOf(scripture, lang)
    const rec = (await nativeCatalog.list()).find((b) => b.id === id)
    if (!rec) return []
    const db = await openDb(rec.dbName, true)
    const start = range.verseStart ?? 1
    const end = range.verseEnd ?? Number.MAX_SAFE_INTEGER
    const rows = await query(
      db,
      `SELECT cn, vn, wi, gi, lang, text, root, meaning FROM words
       WHERE cn = ? AND vn BETWEEN ? AND ? ORDER BY vn, wi, lang`,
      [range.chapter, start, end],
    )
    const s = (v: unknown) => (v == null ? undefined : String(v))
    return rows.map((r) => ({
      cn: Number(r.cn),
      vn: Number(r.vn),
      wi: Number(r.wi),
      gi: Number(r.gi),
      lang: String(r.lang ?? ''),
      text: String(r.text ?? ''),
      root: s(r.root),
      meaning: s(r.meaning),
    }))
  }

  async getChapterTitle(scripture: string, lang: string, chapter: number): Promise<string | null> {
    const rec = await this.recordFor(scripture, lang)
    if (!rec) return null
    const db = await openDb(rec.dbName, true)
    const rows = await query(db, `SELECT title FROM chapters WHERE cn = ?`, [chapter])
    return rows.length > 0 ? String(rows[0].title ?? '') : null
  }

  async search(
    scripture: string,
    langs: string[],
    q: string,
    opts?: SearchOpts,
  ): Promise<SearchRow[]> {
    const norm = normalizeForSearch(q)
    if (!norm) return []
    const match = `"${norm.replace(/"/g, '""')}"`
    const limit = opts?.limit ?? 20
    const offset = opts?.offset ?? 0

    // Words bundles share scripture+lang with their text bundle but carry no
    // FTS table — only text bundles are searchable (mirrors the web adapter).
    const records = (await nativeCatalog.list()).filter(
      (b) =>
        b.scripture === scripture && langs.includes(b.lang) && (b.kind ?? 'text') === 'text',
    )
    if (records.length === 0) return []

    const merged: SearchRow[] = []
    for (const rec of records) {
      const db = await openDb(rec.dbName, true)
      const rows = await query(
        db,
        `SELECT v.vk AS vk, v.cn AS cn, v.vn AS vn, v.text AS text,
                snippet(verses_fts, 0, '<b>', '</b>', '…', 12) AS hl,
                rank AS rank
         FROM verses_fts f JOIN verses v ON v.rowid = f.rowid
         WHERE verses_fts MATCH ? ORDER BY rank LIMIT ? OFFSET ?`,
        [match, limit, offset],
      )
      for (const r of rows) {
        merged.push({
          vk: String(r.vk ?? ''),
          cn: Number(r.cn),
          vn: Number(r.vn),
          lang: rec.lang,
          text: String(r.text ?? ''),
          hl: r.hl == null ? undefined : String(r.hl),
          rank: typeof r.rank === 'number' ? r.rank : Number(r.rank),
        })
      }
    }
    merged.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    return merged.slice(0, limit)
  }

  async searchDocs(lang: string, q: string, opts?: SearchOpts): Promise<DocSearchRow[]> {
    const norm = normalizeForSearch(q)
    if (!norm) return []
    const match = `"${norm.replace(/"/g, '""')}"`
    const limit = opts?.limit ?? 20
    const offset = opts?.offset ?? 0

    const rec = (await nativeCatalog.list()).find(
      (b) => b.kind === 'library' && b.lang === lang,
    )
    if (!rec) return []

    const db = await openDb(rec.dbName, true)
    const rows = await query(
      db,
      `SELECT d.doc_type AS doc_type, d.doc_number AS doc_number, d.title AS title,
              d.section_index AS section_index, d.heading AS heading,
              snippet(docs_fts, 0, '<b>', '</b>', '…', 12) AS hl,
              rank AS rank
       FROM docs_fts f JOIN docs d ON d.rowid = f.rowid
       WHERE docs_fts MATCH ? ORDER BY rank LIMIT ? OFFSET ?`,
      [match, limit, offset],
    )
    return rows.map((r) => ({
      docType: String(r.doc_type ?? ''),
      docNumber: Number(r.doc_number),
      title: String(r.title ?? ''),
      sectionIndex: Number(r.section_index),
      heading: r.heading == null ? undefined : String(r.heading),
      hl: r.hl == null ? undefined : String(r.hl),
      rank: typeof r.rank === 'number' ? r.rank : Number(r.rank),
    }))
  }

  async install(bundle: BundleDescriptor, onProgress?: (p: InstallProgress) => void): Promise<void> {
    const dbName = dbNameFromUrl(bundle.url)
    const stagedFile = `${dbName}.db`
    const previous = (await nativeCatalog.list()).find((b) => b.id === bundle.id)

    onProgress?.({ phase: 'download', received: 0, total: bundle.bytes })
    const bytes = await downloadBytes(bundle.url, bundle.bytes, onProgress)

    onProgress?.({ phase: 'verify', received: bytes.byteLength, total: bundle.bytes })
    if (!(await verifySha256(bytes, bundle.sha256))) {
      throw new Error(`bundle ${bundle.id}: sha256 mismatch — download rejected`)
    }

    // Stage the verified bytes in the cache dir, then let the plugin adopt the
    // file into its database directory (adds the SQLite.db suffix). The move
    // consumes the staged file; the catch cleans up if adoption fails.
    await Filesystem.writeFile({
      path: stagedFile,
      data: toBase64(bytes),
      directory: Directory.Cache,
    })
    try {
      await sqlite().moveDatabasesAndAddSuffix('cache', [stagedFile])
    } catch (error) {
      await Filesystem.deleteFile({ path: stagedFile, directory: Directory.Cache }).catch(
        () => {},
      )
      throw error
    }

    // Bundle files are versioned, so updating leaves the old version's file
    // behind under its own name — delete it once the new download landed.
    if (previous && previous.dbName !== dbName) {
      await closeDb(previous.dbName, true).catch(() => {})
      try {
        const oldDb = await openDb(previous.dbName, false)
        await oldDb.delete()
      } catch {
        // Old file already gone — nothing to clean up.
      }
      await closeDb(previous.dbName, false).catch(() => {})
    }

    onProgress?.({ phase: 'import', received: bundle.bytes, total: bundle.bytes })
    await nativeCatalog.upsert({
      id: bundle.id,
      scripture: bundle.scripture,
      lang: bundle.lang,
      kind: bundle.kind ?? 'text',
      bytes: bundle.bytes,
      sha256: bundle.sha256,
      dataVersion: bundle.dataVersion,
      schemaVersion: bundle.schemaVersion,
      normalizationVersion: bundle.normalizationVersion,
      ftsTokenizer: bundle.ftsTokenizer,
      installedAt: Date.now(),
      dbName,
    })
  }

  async remove(bundleId: string): Promise<void> {
    const rec = (await nativeCatalog.list()).find((b) => b.id === bundleId)
    if (rec) {
      await closeDb(rec.dbName, true).catch(() => {})
      try {
        // Reopen read-write to delete the underlying file, then drop the connection.
        const db = await openDb(rec.dbName, false)
        await db.delete()
      } catch {
        // File already gone or never opened — removing the catalog entry is enough.
      }
      await closeDb(rec.dbName, false).catch(() => {})
    }
    await nativeCatalog.remove(bundleId)
  }
}
