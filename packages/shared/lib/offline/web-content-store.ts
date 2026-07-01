import { catalog } from './catalog'
import type { OfflineContentStore } from './content-store'
import { requestPersistentStorage } from './storage'
import type {
  BundleDescriptor,
  BundleInfo,
  InstallProgress,
  SearchOpts,
  SearchRow,
  VerseRange,
  VerseRow,
} from './types'
import { verifySha256 } from './verify'
import type { WorkerRequest, WorkerRequestBody, WorkerResponse } from './worker/protocol'

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void }

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
  private worker: Worker | null = null
  private seq = 0
  private readonly pending = new Map<number, Pending>()

  private ensureWorker(): Worker {
    if (this.worker) return this.worker
    const worker = new Worker(new URL('./worker/sqlite.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const res = e.data
      const p = this.pending.get(res.id)
      if (!p) return
      this.pending.delete(res.id)
      if (res.ok) p.resolve(res.result)
      else p.reject(new Error(res.error))
    }
    worker.onerror = (e) => {
      const err = new Error(e.message || 'offline worker crashed')
      for (const p of this.pending.values()) p.reject(err)
      this.pending.clear()
    }
    this.worker = worker
    return worker
  }

  private rpc<T>(req: WorkerRequestBody, transfer: Transferable[] = []): Promise<T> {
    const worker = this.ensureWorker()
    const id = ++this.seq
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as Pending['resolve'], reject })
      worker.postMessage({ ...req, id } as WorkerRequest, transfer)
    })
  }

  private static bundleId(scripture: string, lang: string): string {
    return `${scripture}-${lang}`
  }

  async installedBundles(): Promise<BundleInfo[]> {
    return catalog.list()
  }

  async getVerses(scripture: string, lang: string, range: VerseRange): Promise<VerseRow[]> {
    const id = WebOfflineContentStore.bundleId(scripture, lang)
    if (!catalog.list().some((b) => b.id === id)) return []
    return this.rpc<VerseRow[]>({ type: 'getVerses', bundleId: id, range })
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
      .filter((b) => b.scripture === scripture && langs.includes(b.lang))
      .map((b) => b.id)
    if (ids.length === 0) return []
    return this.rpc<SearchRow[]>({ type: 'search', bundleIds: ids, query: q, opts })
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
    const res = await fetch(bundle.url)
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
