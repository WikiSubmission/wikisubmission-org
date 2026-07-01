import { Capacitor } from '@capacitor/core'
import { registerOfflineContentStore } from '@/lib/offline/registry'
import { registerOfflineUserStore } from '@/lib/offline/user/registry'
import { registerSyncTransport } from '@/lib/offline/user/transport'
import { NativeOfflineContentStore } from './offline/native-content-store'
import { NativeOfflineUserStore } from './offline/native-user-store'
import { mobileSyncTransport } from './offline-sync-transport-mobile'

let userStore: NativeOfflineUserStore | null = null

/**
 * Register the native @capacitor-community/sqlite content + user stores so the
 * shared reader, search, and user-data hooks use installed bundles and the local
 * mirror on device. The native counterpart to apps/web/lib/register-offline.ts.
 *
 * No-op off-device (the web dev preview of the mobile app), leaving those
 * sessions on the network path. The user store is opened per-user once signed in
 * by MobileOfflineSyncBridge.
 */
export function registerMobileOfflineStore(): NativeOfflineUserStore | null {
  if (!Capacitor.isNativePlatform()) return null
  registerOfflineContentStore(new NativeOfflineContentStore())
  if (!userStore) userStore = new NativeOfflineUserStore()
  registerOfflineUserStore(userStore)
  registerSyncTransport(mobileSyncTransport)
  return userStore
}
