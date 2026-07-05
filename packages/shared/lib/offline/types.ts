/**
 * Offline content types — the platform-agnostic vocabulary shared by the web
 * (sqlite-wasm + OPFS) and Capacitor (native sqlite) adapters. See
 * org/docs/offline-architecture.md.
 */

/** What a bundle contains. `text` is verse text + translations + FTS;
 * `words` is the word-by-word breakdown (word text per language, roots,
 * meanings) for one target language. Kept a string so future kinds coming
 * from the manifest don't break parsing; absent means `text` (pre-kind
 * manifests and catalogs). */
export type BundleKind = 'text' | 'words' | (string & {})

/** A bundle as advertised by the server manifest (camelCased here; the wire
 * format is snake_case — see manifest.ts). */
export interface BundleDescriptor {
  id: string // "quran-en", "quran-words-en"
  scripture: string // "quran"
  lang: string // "en"
  kind?: BundleKind
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
  kind?: BundleKind
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

/** One word row read from a words bundle: the text of one word in one
 * language, plus root/meaning when the source data carries them (roots ride
 * on Arabic rows, meanings on translation rows). */
export interface WordRow {
  cn: number
  vn: number
  wi: number // word_index within the verse (0-based)
  gi: number // global_index across the whole Quran (1-based)
  lang: string
  text: string
  root?: string
  meaning?: string
}

export interface SearchOpts {
  limit?: number
  offset?: number
}

/** One full-text search hit. `hl` carries the highlighted snippet, mapping to
 * the existing network response's `hl` field so the reader needs no changes.
 * `lang` is the bundle language the hit came from. */
export interface SearchRow {
  vk: string
  cn: number
  vn: number
  lang: string
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
