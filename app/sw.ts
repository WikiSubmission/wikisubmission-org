/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

// `lib: webworker` is referenced above (file-scoped, so it does not pollute the
// app's DOM lib) to type `ServiceWorkerGlobalScope`. `__SW_MANIFEST` is the
// precache list injected by @serwist/next at build time.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // defaultCache is Next-aware: network-first for navigations/RSC, so we never
  // serve a stale authenticated page, plus stale-while-revalidate for static
  // assets. Credentialed API responses are not cached.
  runtimeCaching: defaultCache,
  // Google Play Vitals treats a non-200 offline launch as a crash. This serves
  // the precached /offline document for any navigation that fails offline.
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

serwist.addEventListeners()
