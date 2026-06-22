'use client'

import { useState } from 'react'
import { fetchManifest } from '@/lib/offline/manifest'
import { getOfflineContentStore, OFFLINE_MANIFEST_URL } from '@/lib/offline/web-store-singleton'

// Diagnostic harness for the offline content store, used by the Playwright e2e
// to exercise the real sqlite-wasm + OPFS worker path (install -> getVerses ->
// search). Not part of the product UI; hidden in production builds.
export default function OfflineCheckPage() {
  const [steps, setSteps] = useState<string[]>([])
  const [verse, setVerse] = useState('')
  const [hit, setHit] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Opt-in only (set NEXT_PUBLIC_OFFLINE_CHECK=1 for the e2e build); hidden otherwise.
  if (process.env.NEXT_PUBLIC_OFFLINE_CHECK !== '1') return null

  const log = (s: string) => setSteps((prev) => [...prev, s])

  async function run() {
    setError('')
    try {
      const store = getOfflineContentStore()
      const manifest = await fetchManifest(OFFLINE_MANIFEST_URL)
      log(`manifest:${manifest.bundles.length}`)

      const en = manifest.bundles.find((b) => b.id === 'quran-en')
      if (!en) throw new Error('quran-en not in manifest')

      await store.install(en)
      log('installed')

      const verses = await store.getVerses('quran', 'en', { chapter: 1, verseStart: 1, verseEnd: 1 })
      setVerse(verses[0]?.text ?? 'NONE')
      log(`verses:${verses.length}`)

      const rows = await store.search('quran', ['en'], 'mercy', { limit: 1 })
      setHit(rows[0]?.vk ?? 'NONE')
      log(`search:${rows.length}`)

      setDone(true)
      log('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h1>offline-check</h1>
      <button type="button" data-testid="run" onClick={run}>
        run
      </button>
      <pre data-testid="log">{steps.join('\n')}</pre>
      <div data-testid="verse">{verse}</div>
      <div data-testid="hit">{hit}</div>
      <div data-testid="done">{done ? 'true' : 'false'}</div>
      <div data-testid="error">{error}</div>
    </div>
  )
}
