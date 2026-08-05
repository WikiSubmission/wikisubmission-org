import { describe, it, expect, afterEach, vi } from 'vitest'
import { RequestTimeoutError, withTimeout } from '@/lib/with-timeout'

afterEach(() => {
  vi.useRealTimers()
})

describe('withTimeout', () => {
  it('passes the value through when the work finishes in time', async () => {
    await expect(withTimeout(1_000, async () => 'done')).resolves.toBe('done')
  })

  it('gives the work an unaborted signal', async () => {
    const aborted = await withTimeout(1_000, async (signal) => signal.aborted)
    expect(aborted).toBe(false)
  })

  it('aborts and reports a timeout when the deadline passes', async () => {
    vi.useFakeTimers()
    const pending = withTimeout(
      5_000,
      (signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')))
        }),
    )
    // Attach the assertion before advancing so the rejection is never
    // momentarily unhandled.
    const assertion = expect(pending).rejects.toBeInstanceOf(RequestTimeoutError)
    await vi.advanceTimersByTimeAsync(5_000)
    await assertion
  })

  it('preserves the original error when the work fails on its own', async () => {
    const boom = new Error('boom')
    await expect(
      withTimeout(1_000, () => Promise.reject(boom)),
    ).rejects.toBe(boom)
  })

  it('clears its timer so a resolved call cannot fire later', async () => {
    vi.useFakeTimers()
    const clear = vi.spyOn(globalThis, 'clearTimeout')

    await withTimeout(1_000, async () => 'done')

    expect(clear).toHaveBeenCalled()
    clear.mockRestore()
  })
})
