/**
 * Recovery for the "nothing is tappable any more" failure mode.
 *
 * Every Radix modal layer (Dialog, Sheet, DropdownMenu, Popover) sets
 * `document.body.style.pointerEvents = 'none'` while it is open, and restores it
 * from an effect cleanup once the last layer unmounts. The unmount is driven by
 * @radix-ui/react-presence, which keeps the closed layer mounted until it sees an
 * `animationend` event for the exit animation (`data-[state=closed]:animate-out`).
 *
 * On Android the WebView pauses CSS animations when the activity is backgrounded,
 * so a layer closed at the moment the app goes to the background never fires
 * `animationend`. Presence stays in `unmountSuspended` forever, the cleanup never
 * runs, and the body keeps `pointer-events: none`. The UI still renders and
 * scrolls, but every button in the app is dead until a full reload — which matches
 * "after a while all the buttons stop working".
 *
 * This module detects that state (body inert while no layer is actually open) and
 * heals it: it hands the stranded layers the `animationend` they never got, so
 * React unmounts them and Radix's own cleanup runs, then clears the body style as
 * a backstop. It is a no-op whenever a layer is legitimately open, so it is safe
 * to run on both web and mobile.
 */

/** Portalled layers that legitimately hold the body inert while open. */
const OPEN_LAYER_SELECTOR = [
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
  '[role="menu"][data-state="open"]',
  '[role="listbox"][data-state="open"]',
].join(', ')

/** The same layers plus their overlays, in the closed state. */
const CLOSED_LAYER_SELECTOR = [
  '[role="dialog"][data-state="closed"]',
  '[role="alertdialog"][data-state="closed"]',
  '[role="menu"][data-state="closed"]',
  '[role="listbox"][data-state="closed"]',
  '[data-slot$="-overlay"][data-state="closed"]',
].join(', ')

/**
 * Dispatch the `animationend` that the WebView swallowed. Presence matches the
 * event against the element's current computed `animation-name`, so we replay one
 * event per name rather than inventing one.
 */
function flushExitAnimation(element: Element): void {
  const names = (getComputedStyle(element).animationName || '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name && name !== 'none')

  for (const animationName of names) {
    element.dispatchEvent(animationEndEvent(animationName))
  }
}

/** `AnimationEvent` is absent in some non-browser runtimes (jsdom); shim it. */
function animationEndEvent(animationName: string): Event {
  if (typeof AnimationEvent === 'function') {
    return new AnimationEvent('animationend', { animationName, bubbles: true })
  }

  const event = new Event('animationend', { bubbles: true })
  Object.defineProperty(event, 'animationName', { value: animationName })
  return event
}

/**
 * Clear a stuck `pointer-events: none` on the body, if and only if no layer is
 * actually open. Returns true when it had to recover something.
 */
export function recoverStuckPointerEvents(): boolean {
  if (typeof document === 'undefined') return false

  const body = document.body
  if (!body || body.style.pointerEvents !== 'none') return false
  if (document.querySelector(OPEN_LAYER_SELECTOR)) return false

  document.querySelectorAll(CLOSED_LAYER_SELECTOR).forEach(flushExitAnimation)
  body.style.removeProperty('pointer-events')

  // The React unmount triggered above runs after this tick and restores whatever
  // Radix captured as the original value. If a layer had opened while the body was
  // already stuck, that captured value is itself 'none' — re-check once it lands.
  setTimeout(() => {
    if (
      document.body?.style.pointerEvents === 'none' &&
      !document.querySelector(OPEN_LAYER_SELECTOR)
    ) {
      document.body.style.removeProperty('pointer-events')
    }
  }, 0)

  return true
}

let installCount = 0
let uninstall: (() => void) | null = null

/**
 * Watch for the stuck state and heal it. Checks run on app resume (the Android
 * trigger) and on the first touch/pointer press — a body with
 * `pointer-events: none` is skipped during hit-testing, so the event still reaches
 * the document and the tap that would have been swallowed usually lands.
 *
 * Idempotent: repeated installs share one set of listeners.
 */
export function installPointerEventsRecovery(): () => void {
  if (typeof document === 'undefined') return () => {}

  installCount += 1

  if (!uninstall) {
    const check = () => {
      recoverStuckPointerEvents()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      // Once immediately, once after the WebView has resumed its animations and
      // any in-flight close has had a chance to finish on its own.
      check()
      setTimeout(check, 350)
    }

    const pressOptions = { capture: true, passive: true } as const

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pageshow', check)
    window.addEventListener('focus', check)
    document.addEventListener('pointerdown', check, pressOptions)
    document.addEventListener('touchstart', check, pressOptions)

    uninstall = () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', check)
      window.removeEventListener('focus', check)
      document.removeEventListener('pointerdown', check, pressOptions)
      document.removeEventListener('touchstart', check, pressOptions)
    }
  }

  return () => {
    installCount -= 1
    if (installCount > 0 || !uninstall) return
    uninstall()
    uninstall = null
  }
}
