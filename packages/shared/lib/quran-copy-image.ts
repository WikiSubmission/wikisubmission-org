import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import * as htmlToImage from 'html-to-image'
import {
  VersePrintCard,
  type PrintKind,
  type VersePrintPrefs,
} from '@/app/quran/[[...query]]/mini-components/verse-print-card'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

export interface CopyImageOptions {
  prefs: VersePrintPrefs
  /** Passed through to VersePrintCard for in-image highlight marks. */
  searchHighlight?: string
}

/**
 * Feature-detect clipboard image write. Chromium and WebKit support this;
 * Firefox (as of writing) does not expose `ClipboardItem` reliably enough to
 * rely on — caller should hide image options when this returns false.
 */
export function canCopyImage(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof ClipboardItem === 'undefined') return false
  if (!navigator.clipboard?.write) return false
  // Some browsers have ClipboardItem but only support text/plain. Check PNG.
  const supports = (ClipboardItem as unknown as { supports?: (t: string) => boolean })
    .supports
  if (typeof supports === 'function') {
    try {
      return supports.call(ClipboardItem, 'image/png')
    } catch {
      // Fall through and assume support — we'll catch failures at write time.
    }
  }
  return true
}

/**
 * Renders the given verses into an off-screen VersePrintCard, rasterizes to
 * a PNG, and writes the result to the clipboard. The hidden host is removed
 * regardless of success/failure.
 */
async function renderAndCopy(
  verses: VerseData[],
  kind: PrintKind,
  opts: CopyImageOptions
): Promise<void> {
  if (verses.length === 0) throw new Error('no verses to copy')

  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.position = 'fixed'
  host.style.left = '-10000px'
  host.style.top = '0'
  host.style.pointerEvents = 'none'
  host.style.zIndex = '-1'
  host.style.width = '680px'
  // Force light color scheme so the render doesn't pick up the user's dark
  // theme (VersePrintCard uses inline hex colors anyway, but CSS vars inside
  // .font-arabic or anything else will resolve to light).
  host.style.colorScheme = 'light'
  document.body.appendChild(host)

  let root: Root | null = null
  try {
    root = createRoot(host)
    root.render(
      createElement(VersePrintCard, {
        verses,
        kind,
        prefs: opts.prefs,
        searchHighlight: opts.searchHighlight,
      })
    )

    // Let React commit, then let fonts settle, then let layout paint.
    await new Promise<void>((r) => setTimeout(r, 0))
    if (document.fonts?.ready) await document.fonts.ready
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    const target = host.firstElementChild as HTMLElement | null
    if (!target) throw new Error('print card did not render')

    const blob = await htmlToImage.toBlob(target, {
      pixelRatio: 2,
      backgroundColor: '#F6F2EA',
      cacheBust: true,
    })
    if (!blob) throw new Error('toBlob returned null')

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
  } finally {
    if (root) {
      try {
        root.unmount()
      } catch {
        // ignore
      }
    }
    host.remove()
  }
}

export async function copyVerseImage(
  verse: VerseData,
  kind: PrintKind,
  opts: CopyImageOptions
): Promise<void> {
  await renderAndCopy([verse], kind, opts)
}

export async function copyVersesImage(
  verses: VerseData[],
  kind: PrintKind,
  opts: CopyImageOptions
): Promise<void> {
  await renderAndCopy(verses, kind, opts)
}
