import type { MetadataRoute } from 'next'

/**
 * PWA web app manifest (served at /manifest.webmanifest).
 *
 * This is what makes the site installable and is the source of truth the
 * Trusted Web Activity (Android / Google Play) build reads from. Keep it in
 * sync with the TWA config in `android/twa-manifest.json`.
 *
 * Brand colors mirror globals.css: primary `#6B3410`, light bg `#F6F2EA`.
 * Locale is cookie-based (no URL prefix), so a single `/` start_url is correct.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'WikiSubmission',
    short_name: 'WikiSubmission',
    description:
      'Read the Final Testament (Quran) and Bible, listen to recitation, and explore religious education — free and open source.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait-primary',
    theme_color: '#6B3410',
    background_color: '#F6F2EA',
    lang: 'en',
    dir: 'ltr',
    categories: ['books', 'education', 'lifestyle'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Quran',
        short_name: 'Quran',
        url: '/quran?source=pwa-shortcut',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Bible',
        short_name: 'Bible',
        url: '/bible?source=pwa-shortcut',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Practices',
        short_name: 'Practices',
        url: '/practices?source=pwa-shortcut',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
