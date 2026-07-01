import type { SearchOpts, SearchRow, VerseRange, VerseRow } from '../types'

/** Request messages sent from the main thread to the sqlite worker. Each carries
 * a monotonic `id` the response echoes so the client can correlate replies. */
export type WorkerRequest =
  | { id: number; type: 'init' }
  | { id: number; type: 'importDb'; bundleId: string; bytes: ArrayBuffer }
  | { id: number; type: 'remove'; bundleId: string }
  | { id: number; type: 'listFiles' }
  | { id: number; type: 'getVerses'; bundleId: string; range: VerseRange }
  | { id: number; type: 'getChapterTitle'; bundleId: string; chapter: number }
  | { id: number; type: 'search'; bundleIds: string[]; query: string; opts?: SearchOpts }

/** Result payload type for each request type. */
export interface WorkerResultMap {
  init: boolean
  importDb: boolean
  remove: boolean
  listFiles: string[]
  getVerses: VerseRow[]
  getChapterTitle: string | null
  search: SearchRow[]
}

export type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string }

/** Omit applied across each union member, so a request literal keeps its
 * discriminant-specific fields (a plain Omit<WorkerRequest, 'id'> collapses the
 * union to its shared keys and rejects fields like `bundleId`). */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** A request without its correlation id; the client assigns the id when sending. */
export type WorkerRequestBody = DistributiveOmit<WorkerRequest, 'id'>
