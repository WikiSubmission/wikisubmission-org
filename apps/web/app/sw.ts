/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type {
  PrecacheEntry,
  RouteMatchCallback,
  RouteMatchCallbackOptions,
  RuntimeCaching,
  SerwistGlobalConfig,
} from 'serwist'
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

// Restrict every runtime-caching route to same-origin requests.
//
// A fetch() made *inside* the service worker is governed by the page's
// connect-src (sw.js is served under the same CSP header). A request the SW
// does NOT intercept, however, is fetched natively by the browser under its
// real directive — img-src for <img>, script-src for <script>. So cross-origin
// assets (OAuth avatars, the Cloudflare beacon, third-party CDNs) must fall
// through to the network instead of being re-fetched by the SW to populate a
// cache, or connect-src blocks the cache-put fetch and the asset fails to load.
//
// defaultCache's cross-origin route (`!sameOrigin`) and its extension-based and
// catch-all routes would otherwise intercept these. Wrapping each matcher with
// a sameOrigin guard makes the cross-origin route dead and scopes the rest to
// our own origin, so cross-origin requests match no route and pass straight
// through to the browser's native fetch.
const sameOriginOnly = (
  matcher: RuntimeCaching['matcher']
): RouteMatchCallback => {
  if (typeof matcher === 'function') {
    return (options: RouteMatchCallbackOptions) =>
      options.sameOrigin && Boolean(matcher(options))
  }
  // defaultCache's non-function matchers are extension-based RegExps that are
  // only meaningful same-origin; test them against the pathname.
  const pattern = typeof matcher === 'string' ? new RegExp(matcher) : matcher
  return (options: RouteMatchCallbackOptions) =>
    options.sameOrigin && pattern.test(options.url.pathname)
}

const sameOriginCache: RuntimeCaching[] = defaultCache.map((entry) => ({
  ...entry,
  matcher: sameOriginOnly(entry.matcher),
}))

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // defaultCache is Next-aware: network-first for navigations/RSC, so we never
  // serve a stale authenticated page, plus stale-while-revalidate for static
  // assets. Credentialed API responses are not cached. Scoped to same-origin
  // (see sameOriginOnly) so the SW never re-fetches cross-origin assets.
  runtimeCaching: sameOriginCache,
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

// --- Web push ---------------------------------------------------------------
// Payload shape sent by ws-backend (see api/handlers/push.go).
interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
}

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload: PushPayload
  try {
    payload = event.data.json() as PushPayload
  } catch {
    payload = { title: 'WikiSubmission', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? '/android-chrome-192x192.png',
      badge: '/icons/maskable-192x192.png',
      tag: payload.tag,
      data: { url: payload.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data as { url?: string })?.url ?? '/'

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      // Focus an existing tab and navigate it instead of opening a duplicate.
      for (const client of clientList) {
        if ('focus' in client) {
          await client.focus()
          if ('navigate' in client) {
            await client.navigate(target).catch(() => undefined)
          }
          return
        }
      }
      await self.clients.openWindow(target)
    })()
  )
})
