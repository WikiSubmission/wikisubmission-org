import { spawn, type ChildProcess } from 'node:child_process'
import readline from 'node:readline'

/**
 * Runs the ws-backend desktop sidecar (`ws-backend --desktop`) and speaks its
 * handshake: one JSON config line on stdin, one JSON readiness line on stdout,
 * shutdown by closing stdin. Used by the dev host and the Electron shell.
 */
export interface SidecarOptions {
  /** Path to the ws-backend desktop binary. */
  binary: string
  /** Where the database lives (the app's user-data folder). */
  dataDir: string
  /** Folder holding embedded-postgres-binaries-<os>-<arch>-<version>.txz. */
  pgArchiveDir: string
  /** Content snapshot folder from cmd/build-desktop-snapshot. */
  snapshotDir: string
  /** Receives each line the sidecar writes to stderr (its logs). */
  onLog?: (line: string) => void
  /** How long to wait for readiness. First launch loads the content (~40 s). */
  startTimeoutMs?: number
}

export interface Sidecar {
  /** Loopback port of the sidecar's HTTP server. */
  port: number
  /** Bearer token for the local user. Never handed to the renderer. */
  token: string
  /** Resolves with the exit code when the process ends. */
  exited: Promise<number | null>
  /** Ask for a clean shutdown; kills the process if it takes too long. */
  stop(timeoutMs?: number): Promise<void>
}

interface ReadyLine {
  ready: boolean
  port: number
  token: string
}

export async function startSidecar(opts: SidecarOptions): Promise<Sidecar> {
  const child: ChildProcess = spawn(opts.binary, ['--desktop'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  })

  const exited = new Promise<number | null>((resolve) => {
    child.once('exit', (code) => resolve(code))
    child.once('error', () => resolve(null))
  })

  if (child.stderr) {
    readline.createInterface({ input: child.stderr }).on('line', (line) => opts.onLog?.(line))
  }

  const config = {
    dataDir: opts.dataDir,
    pgArchiveDir: opts.pgArchiveDir,
    snapshotDir: opts.snapshotDir,
  }
  child.stdin?.write(JSON.stringify(config) + '\n')

  const ready = await new Promise<ReadyLine>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error('the backend did not start in time'))
    }, opts.startTimeoutMs ?? 5 * 60_000)

    child.once('error', (err) => {
      clearTimeout(timer)
      reject(new Error(`could not start the backend: ${err.message}`))
    })
    void exited.then((code) => {
      clearTimeout(timer)
      reject(new Error(`the backend exited during startup (code ${code})`))
    })

    if (!child.stdout) {
      clearTimeout(timer)
      reject(new Error('backend stdout is not available'))
      return
    }
    const rl = readline.createInterface({ input: child.stdout })
    rl.once('line', (line) => {
      clearTimeout(timer)
      try {
        const parsed = JSON.parse(line) as ReadyLine
        if (!parsed.ready || !parsed.port || !parsed.token) throw new Error('incomplete')
        resolve(parsed)
      } catch {
        child.kill()
        reject(new Error(`unexpected readiness line from the backend: ${line.slice(0, 200)}`))
      }
    })
  })

  let stopping: Promise<void> | null = null
  return {
    port: ready.port,
    token: ready.token,
    exited,
    stop(timeoutMs = 10_000) {
      stopping ??= (async () => {
        if (child.exitCode !== null) return
        child.stdin?.end()
        const timedOut = await Promise.race([
          exited.then(() => false),
          new Promise<boolean>((r) => setTimeout(() => r(true), timeoutMs)),
        ])
        if (timedOut) {
          child.kill()
          await exited
        }
      })()
      return stopping
    },
  }
}
