import { test, expect } from '@playwright/test'

// Offline navigation to an *unvisited* Quran chapter must be served the
// precached reader document (/quran/1) instead of the /offline dead-end, and
// the ReaderBoot seam must re-derive the requested chapter from the URL and
// remount ChapterReader on it (the precached doc is baked for chapter 1, but
// /quran/<n> is a single catch-all segment so one doc serves every chapter).
test('offline nav to unvisited chapter serves the reader shell, not /offline', async ({
  page,
  context,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`))

  // Warm the SW + let precache populate.
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((res) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => res(), {
          once: true,
        }),
      )
    }
  })
  await page.reload()

  const precache = await page.evaluate(async () => {
    const out: string[] = []
    for (const k of await caches.keys()) {
      const c = await caches.open(k)
      for (const r of await c.keys()) {
        const p = new URL(r.url).pathname
        if (p === '/quran/1' || p === '/offline') out.push(`${k}:${p}`)
      }
    }
    return out
  })
  console.log('PRECACHE HITS:', JSON.stringify(precache))
  expect(precache.some((e) => e.endsWith(':/quran/1'))).toBe(true)

  // Offline → navigate to an unvisited chapter.
  await context.setOffline(true)
  const resp = await page.goto('/quran/5', { waitUntil: 'commit' }).catch((e) => {
    console.log('GOTO ERROR:', e.message)
    return null
  })
  console.log('NAV STATUS:', resp?.status())

  // Give the ReaderBoot effect time to re-derive chapter 5 from the URL and
  // remount ChapterReader on it.
  const nextLink = page.locator('a[href="/quran/6"]')
  await nextLink.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})

  const url = new URL(page.url()).pathname
  const body = (await page.locator('body').innerText()).slice(0, 500)
  const isOfflinePage = body.includes('You are offline')
  const isLayoutError = body.includes('Something went wrong')
  const retargetedToCh5 = (await nextLink.count()) > 0
  const stuckOnCh1 = (await page.locator('a[href="/quran/2"]').count()) > 0 && !retargetedToCh5

  console.log('FINAL URL PATH:', url)
  console.log('IS_OFFLINE_PAGE:', isOfflinePage)
  console.log('IS_LAYOUT_ERROR:', isLayoutError)
  console.log('RETARGETED_TO_CH5:', retargetedToCh5)
  console.log('STUCK_ON_CH1:', stuckOnCh1)
  console.log('BODY SNIPPET:', JSON.stringify(body))
  console.log('CONSOLE ERRORS:', consoleErrors.join(' || '))

  expect(url).toBe('/quran/5')
  expect(isOfflinePage, 'should NOT be the offline dead-end page').toBe(false)
  expect(retargetedToCh5, 'ReaderBoot should remount on chapter 5 from the URL').toBe(true)
})
