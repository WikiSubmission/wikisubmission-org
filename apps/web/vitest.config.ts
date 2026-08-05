import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const here = path.dirname(fileURLToPath(import.meta.url))

/**
 * `@/…` resolution for files that live in packages/shared.
 *
 * tsconfig maps `@/*` to this app first and then to packages/shared, but
 * vite-tsconfig-paths only applies that mapping to files inside this app — so a
 * shared module with a runtime `@/src/api/…` import fails to resolve as soon as
 * a test pulls it in. This applies the same two-root order to every file, so an
 * app-local module still wins over its shared namesake.
 */
function sharedAtAlias(): Plugin {
  const roots = [here, path.resolve(here, '../../packages/shared')]
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
  const firstFile = (candidates: string[]) =>
    candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile())

  return {
    name: 'ws-shared-at-alias',
    enforce: 'pre',
    resolveId(source) {
      if (!source.startsWith('@/')) return null
      const relative = source.slice(2)
      for (const root of roots) {
        const resolved = firstFile([
          ...extensions.map((ext) => path.join(root, relative + ext)),
          ...extensions.map((ext) => path.join(root, relative, `index${ext}`)),
        ])
        if (resolved) return resolved
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [react(), sharedAtAlias(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'app/**', 'hooks/**', 'src/**'],
      exclude: ['**/*.d.ts', '**/*.config.*', 'node_modules', '.next'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
