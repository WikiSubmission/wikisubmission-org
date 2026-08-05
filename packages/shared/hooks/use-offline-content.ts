'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchManifest, OFFLINE_MANIFEST_URL } from '@/lib/offline/manifest'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { storageEstimate, type StorageUsage } from '@/lib/offline/storage'
import type {
  BundleDescriptor,
  BundleInfo,
  InstallProgress,
  Manifest,
} from '@/lib/offline/types'

export interface OfflineContentState {
  supported: boolean
  loading: boolean
  manifest: Manifest | null
  installed: BundleInfo[]
  usage: StorageUsage | null
  busyId: string | null
  progress: InstallProgress | null
  error: string | null
}

export interface OfflineContentApi extends OfflineContentState {
  refresh: () => Promise<void>
  install: (bundle: BundleDescriptor) => Promise<void>
  remove: (bundleId: string) => Promise<void>
  isInstalled: (bundleId: string) => boolean
}

/** Drives the offline settings UI: loads the manifest + installed catalog and
 * exposes install/remove with live progress. Resolves the platform store from
 * the registry (web sqlite-wasm or the native Capacitor store), so it works in
 * both apps. Safe on the server and where no store is registered (returns
 * supported: false and does nothing). */
export function useOfflineContent(): OfflineContentApi {
  const [state, setState] = useState<OfflineContentState>({
    supported: false,
    loading: true,
    manifest: null,
    installed: [],
    usage: null,
    busyId: null,
    progress: null,
    error: null,
  })

  const refresh = useCallback(async () => {
    const store = getRegisteredOfflineContentStore()
    if (!store) {
      setState((s) => ({ ...s, supported: false, loading: false }))
      return
    }
    try {
      const [installed, usage] = await Promise.all([store.installedBundles(), storageEstimate()])
      let manifest: Manifest | null = null
      try {
        manifest = await fetchManifest(OFFLINE_MANIFEST_URL)
      } catch {
        // Offline or manifest unreachable: still show what is installed.
        manifest = null
      }
      setState((s) => ({ ...s, supported: true, loading: false, installed, usage, manifest, error: null }))
    } catch (err) {
      setState((s) => ({
        ...s,
        supported: true,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load offline state',
      }))
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const install = useCallback(
    async (bundle: BundleDescriptor) => {
      const store = getRegisteredOfflineContentStore()
      if (!store) return
      setState((s) => ({ ...s, busyId: bundle.id, progress: null, error: null }))
      try {
        await store.install(bundle, (progress) => setState((s) => ({ ...s, progress })))
        const [installed, usage] = await Promise.all([store.installedBundles(), storageEstimate()])
        setState((s) => ({ ...s, installed, usage, busyId: null, progress: null }))
      } catch (err) {
        setState((s) => ({
          ...s,
          busyId: null,
          progress: null,
          error: err instanceof Error ? err.message : 'Install failed',
        }))
      }
    },
    [],
  )

  const remove = useCallback(async (bundleId: string) => {
    const store = getRegisteredOfflineContentStore()
    if (!store) return
    setState((s) => ({ ...s, busyId: bundleId, error: null }))
    try {
      await store.remove(bundleId)
      const [installed, usage] = await Promise.all([store.installedBundles(), storageEstimate()])
      setState((s) => ({ ...s, installed, usage, busyId: null }))
    } catch (err) {
      setState((s) => ({
        ...s,
        busyId: null,
        error: err instanceof Error ? err.message : 'Remove failed',
      }))
    }
  }, [])

  const isInstalled = useCallback(
    (bundleId: string) => state.installed.some((b) => b.id === bundleId),
    [state.installed],
  )

  return { ...state, refresh, install, remove, isInstalled }
}
