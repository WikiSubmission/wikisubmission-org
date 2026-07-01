import type { OfflineContentStore } from '@/lib/offline/content-store'
import type {
  BundleDescriptor,
  BundleInfo,
  InstallProgress,
  SearchOpts,
  SearchRow,
  VerseRange,
  VerseRow,
} from '@/lib/offline/types'
import { normalizeForSearch } from '@/lib/text-normalization/normalize'
import { nativeCatalog, type NativeBundleRecord } from './native-catalog'
import { closeDb, openDb, query, sqlite } from './native-db'

/**
 * Native (@capacitor-community/sqlite) implementation of OfflineContentStore.
 * The schema and every query mirror the web worker (sqlite.worker.ts) exactly so
 * the two platforms return identical results from the same bundle files.
 *
 * Install uses the plugin's getFromHTTPRequest to download the prebuilt DB
 * straight into the plugin's database directory. NOTE: byte-level sha256
 * verification (done by the web adapter before OPFS import) is not yet performed
 * on native — integrity here rests on HTTPS plus the immutable, versioned bundle
 * URL. Closing that gap is a tracked follow-up.
 */
function bundleIdOf(scripture: string, lang: string): string {
  return `${scripture}-${lang}`
}

/** The plugin stores a downloaded DB under its URL filename stem. */
function dbNameFromUrl(url: string): string {
  const file = url.split('?')[0].split('/').pop() ?? ''
  return file.replace(/\.db$/i, '')
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

    const records = (await nativeCatalog.list()).filter(
      (b) => b.scripture === scripture && langs.includes(b.lang),
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

  async install(bundle: BundleDescriptor, onProgress?: (p: InstallProgress) => void): Promise<void> {
    const dbName = dbNameFromUrl(bundle.url)

    onProgress?.({ phase: 'download', received: 0, total: bundle.bytes })
    await sqlite().getFromHTTPRequest(bundle.url, true)

    onProgress?.({ phase: 'import', received: bundle.bytes, total: bundle.bytes })
    await nativeCatalog.upsert({
      id: bundle.id,
      scripture: bundle.scripture,
      lang: bundle.lang,
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
