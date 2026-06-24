import { test, expect } from '@playwright/test'

// Runtime verification of the sqlite-wasm + OPFS worker: download a real bundle,
// import it into OPFS, then read a verse and run a full-text search — all in a
// real Chromium. This exercises the path that build/unit checks cannot.
test('offline store installs a bundle and serves reads + search', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/offline-check')
  await page.getByTestId('run').click()

  // Install + query can take a few seconds (download ~2.7MB, WASM init, FTS).
  await expect(page.getByTestId('done')).toHaveText('true', { timeout: 60_000 })

  await expect(page.getByTestId('error')).toHaveText('')
  // Verse 1:1 (en) original text is stored verbatim.
  await expect(page.getByTestId('verse')).toContainText('In the name of')
  // Porter FTS over the normalized column returns a hit for "mercy".
  await expect(page.getByTestId('hit')).not.toHaveText('NONE')
  await expect(page.getByTestId('hit')).toContainText(':')

  expect(errors, errors.join('\n')).toEqual([])
})

test('user store applies local mutations and queues the outbox', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/offline-check')
  await page.getByTestId('run-user').click()

  await expect(page.getByTestId('user-done')).toHaveText('true', { timeout: 60_000 })
  await expect(page.getByTestId('error')).toHaveText('')
  // The note write is readable from the local mirror immediately.
  await expect(page.getByTestId('user-note')).toHaveText('my note')
  // Both writes are queued in the outbox awaiting sync.
  await expect(page.getByTestId('user-pending')).toHaveText('2')
  // Chapter-scoped read returns the chapter-1 note but not the chapter-2 bookmark.
  await expect(page.getByTestId('user-chapter')).toHaveText('1n0b')

  expect(errors, errors.join('\n')).toEqual([])
})
