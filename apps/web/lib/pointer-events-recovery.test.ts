import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  installPointerEventsRecovery,
  recoverStuckPointerEvents,
} from '@/lib/pointer-events-recovery'

/** Mimics the DOM a Radix layer leaves behind, in either state. */
function mountLayer(state: 'open' | 'closed') {
  const overlay = document.createElement('div')
  overlay.setAttribute('data-slot', 'dialog-overlay')
  overlay.setAttribute('data-state', state)

  const content = document.createElement('div')
  content.setAttribute('role', 'dialog')
  content.setAttribute('data-state', state)

  document.body.append(overlay, content)
  return { overlay, content }
}

describe('recoverStuckPointerEvents', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.removeProperty('pointer-events')
  })

  it('does nothing when the body is interactive', () => {
    expect(recoverStuckPointerEvents()).toBe(false)
    expect(document.body.style.pointerEvents).toBe('')
  })

  it('leaves the body inert while a layer is genuinely open', () => {
    mountLayer('open')
    document.body.style.pointerEvents = 'none'

    expect(recoverStuckPointerEvents()).toBe(false)
    expect(document.body.style.pointerEvents).toBe('none')
  })

  it('clears the body when only closed layers remain', () => {
    mountLayer('closed')
    document.body.style.pointerEvents = 'none'

    expect(recoverStuckPointerEvents()).toBe(true)
    expect(document.body.style.pointerEvents).toBe('')
  })

  it('replays animationend on stranded layers so Radix can unmount them', () => {
    const { overlay, content } = mountLayer('closed')
    const seen: string[] = []
    for (const el of [overlay, content]) {
      el.addEventListener('animationend', (e) =>
        seen.push((e as { animationName?: string }).animationName ?? '')
      )
    }
    // jsdom reports an empty animation-name; stub the exit animation.
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      animationName: 'exit',
    } as unknown as CSSStyleDeclaration)
    document.body.style.pointerEvents = 'none'

    recoverStuckPointerEvents()

    expect(seen).toEqual(['exit', 'exit'])
    vi.restoreAllMocks()
  })

  it('recovers on the first press after the body gets stuck', () => {
    const uninstall = installPointerEventsRecovery()
    mountLayer('closed')
    document.body.style.pointerEvents = 'none'

    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(document.body.style.pointerEvents).toBe('')
    uninstall()
  })

  it('stops checking once every installer has been torn down', () => {
    const first = installPointerEventsRecovery()
    const second = installPointerEventsRecovery()
    first()

    document.body.style.pointerEvents = 'none'
    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(document.body.style.pointerEvents).toBe('')

    second()
    document.body.style.pointerEvents = 'none'
    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(document.body.style.pointerEvents).toBe('none')
  })
})
