import { defineConfig, devices } from '@playwright/test'

// E2E for the offline content store. Runs the dev server on a fixed port so the
// fixture bundles (served same-origin from public/offline) match the manifest
// URLs baked by `just offline-bundles -base-url http://localhost:3100/offline`.
const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Production server, not dev: dev-mode Turbopack cannot resolve sqlite-wasm's
    // dynamic worker URL, and dev-mode webpack trips on react-scan (which the
    // production build aliases off). `next build --webpack` is the path that
    // bundles the worker + WASM cleanly. Build with the e2e env baked in
    // (NEXT_PUBLIC_* are inlined at build time), then serve.
    command: `NEXT_PUBLIC_OFFLINE_CHECK=1 NEXT_PUBLIC_OFFLINE_MANIFEST_URL=${BASE_URL}/offline/manifest.json pnpm exec next build --webpack && pnpm exec next start -p ${PORT}`,
    url: `${BASE_URL}/offline-check`,
    timeout: 420_000,
    reuseExistingServer: !process.env.CI,
  },
})
