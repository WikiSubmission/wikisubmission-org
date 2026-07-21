import { catalog } from './catalog'
import type { OfflineContentStore } from './content-store'
import { requestPersistentStorage } from './storage'
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
} from './types'
import { verifySha256 } from './verify'
import { WorkerRpc } from './worker-rpc'
import type { WorkerRequestBody } from './worker/protocol'

/**
 * Web implementation of OfflineContentStore: drives the sqlite-wasm worker over
 * RPC and runs the download/verify pipeline on the main thread (so fetch
 * progress is observable), handing verified bytes to the worker for OPFS import.
 *
 * Browser-only. Not imported by apps/mobile (which gets a native adapter), and
 * not re-exported from the offline barrel, so non-browser builds never pull in
 * the worker or WASM.
 */
export class WebOfflineContentStore implements OfflineContentStore {
  // SharedWorker (with a dedicated-Worker fallback) so all tabs share one OPFS
  // SAH-pool instead of colliding on its exclusive access handles.
  private readonly transport = new WorkerRpc<WorkerRequestBody>(
    'ws-offline',
    () =>
      new SharedWorker(new URL('./worker/sqlite.worker.ts', import.meta.url), {
        type: 'module',
        name: 'ws-offline',
      }),
    () => new Worker(new URL('./worker/sqlite.worker.ts', import.meta.url), { type: 'module' }),
  )

  private rpc<T>(req: WorkerRequestBody, transfer: Transferable[] = []): Promise<T> {
    return this.transport.rpc<T>(req, transfer)
  }

  private static bundleId(scripture: string, lang: string): string {
    return `${scripture}-${lang}`
  }

  private static wordsBundleId(scripture: string, lang: string): string {
    return `${scripture}-words-${lang}`
  }

  async installedBundles(): Promise<BundleInfo[]> {
    return catalog.list()
  }

  async getVerses(scripture: string, lang: string, range: VerseRange): Promise<VerseRow[]> {
    const id = WebOfflineContentStore.bundleId(scripture, lang)
    if (!catalog.list().some((b) => b.id === id)) return []
    return this.rpc<VerseRow[]>({ type: 'getVerses', bundleId: id, range })
  }

  async getWords(scripture: string, lang: string, range: VerseRange): Promise<WordRow[]> {
    const id = WebOfflineContentStore.wordsBundleId(scripture, lang)
    if (!catalog.list().some((b) => b.id === id)) return []
    return this.rpc<WordRow[]>({ type: 'getWords', bundleId: id, range })
  }

  async getChapterTitle(scripture: string, lang: string, chapter: number): Promise<string | null> {
    const id = WebOfflineContentStore.bundleId(scripture, lang)
    if (!catalog.list().some((b) => b.id === id)) return null
    return this.rpc<string | null>({ type: 'getChapterTitle', bundleId: id, chapter })
  }

  async search(
    scripture: string,
    langs: string[],
    q: string,
    opts?: SearchOpts,
  ): Promise<SearchRow[]> {
    const ids = catalog
      .list()
      // Words bundles share scripture+lang with their text bundle but carry
      // no FTS table — only text bundles are searchable.
      .filter(
        (b) =>
          b.scripture === scripture && langs.includes(b.lang) && (b.kind ?? 'text') === 'text',
      )
      .map((b) => b.id)
    if (ids.length === 0) return []
    return this.rpc<SearchRow[]>({ type: 'search', bundleIds: ids, query: q, opts })
  }

  async searchDocs(lang: string, q: string, opts?: SearchOpts): Promise<DocSearchRow[]> {
    const rec = catalog.list().find((b) => b.kind === 'library' && b.lang === lang)
    if (!rec) return []
    return this.rpc<DocSearchRow[]>({ type: 'searchDocs', bundleId: rec.id, query: q, opts })
  }

  async install(
    bundle: BundleDescriptor,
    onProgress?: (p: InstallProgress) => void,
  ): Promise<void> {
    const bytes = await this.download(bundle, onProgress)

    onProgress?.({ phase: 'verify', received: bundle.bytes, total: bundle.bytes })
    if (!(await verifySha256(bytes, bundle.sha256))) {
      throw new Error(`checksum mismatch for bundle ${bundle.id}`)
    }

    onProgress?.({ phase: 'import', received: bundle.bytes, total: bundle.bytes })
    await this.rpc<boolean>({ type: 'importDb', bundleId: bundle.id, bytes }, [bytes])

    catalog.upsert({
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
    })
    void requestPersistentStorage()
  }

  async remove(bundleId: string): Promise<void> {
    await this.rpc<boolean>({ type: 'remove', bundleId })
    catalog.remove(bundleId)
  }

  private async download(
    bundle: BundleDescriptor,
    onProgress?: (p: InstallProgress) => void,
  ): Promise<ArrayBuffer> {
    // Bypass the browser HTTP cache: bundle bytes are persisted to OPFS, so
    // caching the multi-MB response is pure waste, and a cached copy replays
    // whatever CORS headers it was stored with (a response cached while the
    // CDN's CORS config was broken keeps failing every retry for up to a year
    // under the immutable max-age, even after the CDN is fixed).
    const res = await fetch(bundle.url, { cache: 'no-store' })
    if (!res.ok || !res.body) {
      throw new Error(`bundle download failed: ${res.status} ${res.statusText}`)
    }

    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let received = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.byteLength
      onProgress?.({ phase: 'download', received, total: bundle.bytes })
    }

    const all = new Uint8Array(received)
    let offset = 0
    for (const chunk of chunks) {
      all.set(chunk, offset)
      offset += chunk.byteLength
    }
    return all.buffer
  }
}
