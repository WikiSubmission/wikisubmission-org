import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { resolveStatic } from './static-routes.mts'
import { backendPathFor } from './api-proxy.mts'

let out: string

function touch(rel: string) {
  const file = path.join(out, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, rel)
}

beforeAll(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-out-'))
  for (const f of [
    'index.html',
    '404.html',
    'quran/index.html',
    'quran/2/index.html',
    'quran/2/index.txt',
    'quran/2/__next._tree.txt',
    'quran/2/__next.quran/$d$chapter/__PAGE__.txt',
    'quran/search/index.html',
    'quran/words/index.html',
    '_next/static/chunks/app.js',
  ]) {
    touch(f)
  }
  fs.writeFileSync(path.join(os.tmpdir(), 'desktop-out-secret.txt'), 'secret')
})

afterAll(() => {
  fs.rmSync(out, { recursive: true, force: true })
})

const rel = (r: ReturnType<typeof resolveStatic>) =>
  r.kind === 'file' ? path.relative(out, r.file).split(path.sep).join('/') : r

describe('resolveStatic', () => {
  it('serves a folder index for a trailing-slash path', () => {
    expect(rel(resolveStatic(out, '/quran/2/'))).toBe('quran/2/index.html')
    expect(rel(resolveStatic(out, '/'))).toBe('index.html')
  })

  it('serves files as they are, with a content type', () => {
    const r = resolveStatic(out, '/_next/static/chunks/app.js')
    expect(r.kind).toBe('file')
    expect(r.kind === 'file' && r.contentType).toMatch(/javascript/)
    expect(rel(resolveStatic(out, '/quran/2/index.txt'))).toBe('quran/2/index.txt')
  })

  it('redirects a folder without its trailing slash, keeping the query', () => {
    expect(resolveStatic(out, '/quran/2', '?verse=5')).toEqual({
      kind: 'redirect',
      location: '/quran/2/?verse=5',
    })
  })

  it('maps dotted segment payload names onto the nested files', () => {
    expect(rel(resolveStatic(out, '/quran/2/__next.quran.$d$chapter.__PAGE__.txt'))).toBe(
      'quran/2/__next.quran/$d$chapter/__PAGE__.txt',
    )
    expect(rel(resolveStatic(out, '/quran/2/__next._tree.txt'))).toBe('quran/2/__next._tree.txt')
  })

  it('sends free-form Quran queries to the search page', () => {
    expect(resolveStatic(out, '/quran/2:255')).toEqual({
      kind: 'redirect',
      location: '/quran/search/?q=2%3A255',
    })
    expect(resolveStatic(out, '/quran/mercy%20and%20patience/')).toEqual({
      kind: 'redirect',
      location: '/quran/search/?q=mercy%20and%20patience',
    })
  })

  it('sends word lab roots to the query form', () => {
    expect(resolveStatic(out, '/quran/words/%D9%83%D8%AA%D8%A8')).toEqual({
      kind: 'redirect',
      location: '/quran/words/?root=' + encodeURIComponent('كتب'),
    })
  })

  it('leaves missing payload files as 404 so Next falls back to a full load', () => {
    expect(resolveStatic(out, '/quran/2:255/index.txt').kind).toBe('not-found')
  })

  it('never serves a file outside the export', () => {
    expect(resolveStatic(out, '/../desktop-out-secret.txt').kind).toBe('not-found')
    expect(resolveStatic(out, '/%2e%2e/desktop-out-secret.txt').kind).toBe('not-found')
    expect(resolveStatic(out, '/quran/%00').kind).toBe('not-found')
  })

  it('returns the export 404 page for unknown paths', () => {
    const r = resolveStatic(out, '/nowhere/')
    expect(r.kind).toBe('not-found')
    expect(r.kind === 'not-found' && r.file && path.basename(r.file)).toBe('404.html')
  })
})

describe('backendPathFor', () => {
  it('maps the same-origin API path onto the backend', () => {
    expect(backendPathFor('/api/ws/quran')).toBe('/api/v1/quran')
    expect(backendPathFor('/api/ws/me/notes/3')).toBe('/api/v1/me/notes/3')
    expect(backendPathFor('/quran/2/')).toBeNull()
    expect(backendPathFor('/api/wsx/quran')).toBeNull()
  })
})
