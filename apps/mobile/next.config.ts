import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// The mobile app ships as a static export bundled inside a native Capacitor
// shell. There is no Node server in the webview, so every server-only Next
// feature (route handlers, server actions, middleware, redirects/headers,
// image optimization) is unavailable here. The whole app/ tree is compiled to
// static HTML/JS under `out/`, which `cap sync` copies into the native
// projects. SSR stays exclusively in apps/web.
const nextConfig: NextConfig = {
  output: 'export',
  // Static export cannot run the on-demand image optimizer.
  images: { unoptimized: true },
  // Capacitor serves the bundle from capacitor://localhost (iOS) and
  // https://localhost (Android), so emit relative asset URLs.
  trailingSlash: true,
  // No Serwist here: Capacitor owns the native shell and a service worker
  // inside the webview conflicts with it. PWA/offline concerns live in web.
  env: {
    // There is no same-origin /api/ws proxy in a static export, so the shared
    // API client must target the backend absolutely. Committed default,
    // overridable by a real NEXT_PUBLIC_BROWSER_API_URL at build time.
    NEXT_PUBLIC_BROWSER_API_URL:
      process.env.NEXT_PUBLIC_BROWSER_API_URL ??
      'https://ws-backend.wikisubmission.org/api/v1',
  },
}

// Locale messages are provided purely on the client (see app/intl-provider.tsx);
// the request config returns a static default for the build-time render.
const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
