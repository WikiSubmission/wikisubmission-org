'use client'

import { create } from 'zustand'
import type { BundleDescriptor, InstallProgress } from '@/lib/offline/types'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'

/**
 * Session-wide status of the word-by-word bundle download, shared between the
 * background autoloader (MobileWordBundleAutoload) and the chapter toolbar's
 * download sheet. The autoloader drives discovery and the Wi-Fi wait; the
 * sheet reads live progress and can force an install on cellular.
 */

export type WordBundleStatus =
  | 'idle' // not checked yet (or no offline store: web preview)
  | 'checking'
  | 'waiting-wifi' // bundle known, deferred until Wi-Fi
  | 'downloading'
  | 'installed'
  | 'unavailable' // no published bundle for the user's language
  | 'failed' // manifest fetch or install failed; retried next session

interface WordBundleDownloadState {
  status: WordBundleStatus
  /** The manifest descriptor found for the user's language (or the English
   * fallback), kept so a manual install needs no second manifest fetch. */
  bundle: BundleDescriptor | null
  progress: InstallProgress | null
  setState: (
    next: Partial<Pick<WordBundleDownloadState, 'status' | 'bundle' | 'progress'>>,
  ) => void
}

export const useWordBundleDownload = create<WordBundleDownloadState>((set) => ({
  status: 'idle',
  bundle: null,
  progress: null,
  setState: (next) => set((prev) => ({ ...prev, ...next })),
}))

let installInFlight: Promise<boolean> | null = null

/**
 * Download + install the discovered word bundle, publishing progress to the
 * store. Serialized: the Wi-Fi listener and the sheet's "download now" button
 * collapse into one install. Resolves to whether the bundle is installed.
 */
export function installWordBundle(): Promise<boolean> {
  if (installInFlight) return installInFlight
  installInFlight = doInstall().finally(() => {
    installInFlight = null
  })
  return installInFlight
}

async function doInstall(): Promise<boolean> {
  const { bundle, status, setState } = useWordBundleDownload.getState()
  if (status === 'installed') return true
  const store = getRegisteredOfflineContentStore()
  if (!store || !bundle) return false

  setState({ status: 'downloading', progress: null })
  try {
    await store.install(bundle, (progress) => setState({ progress }))
    setState({ status: 'installed', progress: null })
    return true
  } catch {
    setState({ status: 'failed', progress: null })
    return false
  }
}
