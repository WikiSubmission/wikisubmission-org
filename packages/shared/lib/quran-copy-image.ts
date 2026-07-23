import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import * as htmlToImage from 'html-to-image'
import {
  VersePrintCard,
  LIGHT_PRINT_PALETTE,
  type PrintKind,
  type VersePrintPrefs,
  type VersePrintPalette,
} from '@/components/quran-reader/verse-print-card'
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
 * Resolves the active theme's tokens to concrete colors so the rasterized
 * PNG matches what the user sees (light, dark, or any palette). Colors are
 * read through a hidden probe element — getComputedStyle resolves the CSS
 * variable (and any color-mix) to a concrete color string.
 */
export function resolvePrintPalette(): VersePrintPalette {
  if (typeof window === 'undefined' || !document.body) {
    return LIGHT_PRINT_PALETTE
  }
  const probe = document.createElement('span')
  probe.style.position = 'fixed'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  document.body.appendChild(probe)
  try {
    const read = (variable: string, fallback: string): string => {
      probe.style.color = fallback
      probe.style.color = `var(${variable}, ${fallback})`
      return getComputedStyle(probe).color || fallback
    }
    // Fade a resolved color toward transparent (tints, dividers).
    const fade = (color: string, transparentPct: number) =>
      `color-mix(in oklab, ${color}, transparent ${transparentPct}%)`

    const fg = read('--foreground', LIGHT_PRINT_PALETTE.fg)
    const primary = read('--primary', LIGHT_PRINT_PALETTE.primary)
    return {
      bg: read('--card', LIGHT_PRINT_PALETTE.bg),
      fg,
      muted: read('--muted-foreground', LIGHT_PRINT_PALETTE.muted),
      subtle: fade(fg, 50),
      primary,
      border: read('--border', LIGHT_PRINT_PALETTE.border),
      tint: fade(primary, 92),
      tintStrong: fade(primary, 78),
      divider: fade(fg, 90),
    }
  } catch {
    return LIGHT_PRINT_PALETTE
  } finally {
    probe.remove()
  }
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
  document.body.appendChild(host)

  let root: Root | null = null
  try {
    root = createRoot(host)
    root.render(
      createElement(VersePrintCard, {
        verses,
        kind,
        prefs: opts.prefs,
        palette: resolvePrintPalette(),
        searchHighlight: opts.searchHighlight,
      })
    )

    // Let React commit, then let fonts settle, then let layout paint.
    await new Promise<void>((r) => setTimeout(r, 0))
    if (document.fonts?.ready) await document.fonts.ready
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    const target = host.firstElementChild as HTMLElement | null
    if (!target) throw new Error('print card did not render')

    // No backgroundColor — the PNG keeps transparent rounded corners so the
    // card sits cleanly on whatever background it's pasted onto.
    const blob = await htmlToImage.toBlob(target, {
      pixelRatio: 2,
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
