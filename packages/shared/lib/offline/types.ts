/**
 * Offline content types — the platform-agnostic vocabulary shared by the web
 * (sqlite-wasm + OPFS) and Capacitor (native sqlite) adapters. See
 * org/docs/offline-architecture.md.
 */

/** A bundle as advertised by the server manifest (camelCased here; the wire
 * format is snake_case — see manifest.ts). */
export interface BundleDescriptor {
  id: string // "quran-en"
  scripture: string // "quran"
  lang: string // "en"
  url: string // versioned, immutable download URL
  bytes: number
  sha256: string
  dataVersion: number
  schemaVersion: number
  normalizationVersion: number
  ftsTokenizer: string
}

/** The document served at GET /offline/manifest. */
export interface Manifest {
  bundles: BundleDescriptor[]
}

/** A bundle currently installed locally. Persisted in the catalog. */
export interface BundleInfo {
  id: string
  scripture: string
  lang: string
  bytes: number
  sha256: string
  dataVersion: number
  schemaVersion: number
  normalizationVersion: number
  ftsTokenizer: string
  installedAt: number // epoch ms
}

/** A contiguous slice of one chapter; verseStart/End default to the whole chapter. */
export interface VerseRange {
  chapter: number
  verseStart?: number
  verseEnd?: number
}

/** One verse row read from a content bundle. */
export interface VerseRow {
  vk: string
  cn: number
  vn: number
  text: string
  subtitle?: string
  footnote?: string
}

export interface SearchOpts {
  limit?: number
  offset?: number
}

/** One full-text search hit. `hl` carries the highlighted snippet, mapping to
 * the existing network response's `hl` field so the reader needs no changes. */
export interface SearchRow {
  vk: string
  cn: number
  vn: number
  text: string
  hl?: string
  rank?: number
}

/** Progress callback payload during install. */
export interface InstallProgress {
  phase: 'download' | 'verify' | 'import'
  received: number
  total: number
}
