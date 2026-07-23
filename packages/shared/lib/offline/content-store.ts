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

/**
 * The offline read seam. Implemented twice:
 *   - WebOfflineContentStore (this repo): sqlite-wasm + OPFS in a worker.
 *   - a Capacitor adapter (later): @capacitor-community/sqlite.
 *
 * Everything above this interface — manifest handling, the sync plan, the
 * reader integration — is platform-agnostic and depends only on this contract.
 */
export interface OfflineContentStore {
  /** Bundles currently installed and queryable. */
  installedBundles(): Promise<BundleInfo[]>

  /** Read a contiguous verse range from an installed bundle. Returns [] if the
   * bundle is not installed. */
  getVerses(scripture: string, lang: string, range: VerseRange): Promise<VerseRow[]>

  /** Read a contiguous verse range's word-by-word rows from an installed
   * words bundle (`${scripture}-words-${lang}`). Returns [] if the bundle is
   * not installed. */
  getWords(scripture: string, lang: string, range: VerseRange): Promise<WordRow[]>

  /** Localized chapter title from an installed bundle, or null if unavailable. */
  getChapterTitle(scripture: string, lang: string, chapter: number): Promise<string | null>

  /** Full-text search across the given languages' installed bundles. */
  search(scripture: string, langs: string[], q: string, opts?: SearchOpts): Promise<SearchRow[]>

  /** Full-text search over the installed library-documents bundle
   * (`library-${lang}`: introduction, proclamation, appendices). Returns []
   * when no library bundle is installed for the language. */
  searchDocs(lang: string, q: string, opts?: SearchOpts): Promise<DocSearchRow[]>

  /** Download, verify, and install a bundle, replacing any existing copy. */
  install(bundle: BundleDescriptor, onProgress?: (p: InstallProgress) => void): Promise<void>

  /** Remove an installed bundle. No-op if not installed. */
  remove(bundleId: string): Promise<void>
}
