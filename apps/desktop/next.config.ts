import fs from 'node:fs'
import path from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// The desktop app ships as a static export served by the Electron shell over
// app://wikisubmission/. There is no Node server in the renderer, so
// server-only Next features (route handlers, server actions, middleware,
// redirects, image optimization) are unavailable. Data comes from the bundled
// ws-backend sidecar: the shell proxies app://wikisubmission/api/ws/* to it and
// adds the access token, so the renderer never holds a credential.
const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as {
  version: string
}

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // One folder per route (quran/2/index.html), which the shell's file lookup
  // relies on.
  trailingSlash: true,
  env: {
    // Same-origin proxy path, identical to the web app's default.
    NEXT_PUBLIC_BROWSER_API_URL: '/api/ws',
    NEXT_PUBLIC_APP_PLATFORM: 'desktop',
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  webpack(config) {
    // Reader components reused from apps/web read the next-auth session. The
    // desktop user is always signed in, so they get a fixed session instead.
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth/react$': path.resolve(process.cwd(), 'lib/next-auth-shim.ts'),
    }
    return config
  },
}

// Locale messages are provided on the client (see app/intl-provider.tsx); the
// request config returns a static default for the build-time render.
const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
