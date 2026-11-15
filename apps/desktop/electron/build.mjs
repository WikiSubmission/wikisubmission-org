// Bundles the Electron main process (electron/main.ts plus the shared host/
// modules) into dist-electron/main.cjs.
import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

await build({
  entryPoints: [path.join(appDir, 'electron/main.ts')],
  outfile: path.join(appDir, 'dist-electron/main.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  external: ['electron'],
  sourcemap: 'linked',
  logLevel: 'info',
})
