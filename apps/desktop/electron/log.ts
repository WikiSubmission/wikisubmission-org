import fs from 'node:fs'
import path from 'node:path'

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Append-only log file with one backup: when the file passes 5 MB at startup
 * it becomes `<name>.1`, replacing the previous backup.
 */
export class LogFile {
  readonly path: string
  private stream: fs.WriteStream

  constructor(dir: string, name: string) {
    fs.mkdirSync(dir, { recursive: true })
    this.path = path.join(dir, name)
    try {
      if (fs.statSync(this.path).size > MAX_BYTES) fs.renameSync(this.path, this.path + '.1')
    } catch {
      // No previous log.
    }
    this.stream = fs.createWriteStream(this.path, { flags: 'a' })
  }

  write(line: string): void {
    this.stream.write(line.endsWith('\n') ? line : line + '\n')
  }

  info(message: string): void {
    this.write(`${new Date().toISOString()} [shell] ${message}`)
  }

  close(): Promise<void> {
    return new Promise((resolve) => this.stream.end(resolve))
  }
}
