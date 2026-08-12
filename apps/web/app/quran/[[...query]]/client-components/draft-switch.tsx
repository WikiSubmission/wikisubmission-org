'use client'

import { useEffect, useState } from 'react'
import { QuranDraftResults } from '@/components/quran-reader/draft-results'
import { useReaderContext } from '@/hooks/use-reader-context-store'

/** Matches the minimum the local index enforces, so one character shows nothing. */
const MIN_DRAFT_LENGTH = 2

/** Fallback when the header stack has not been measured yet (nav + sub-header). */
const HEADER_FALLBACK_PX = 120

/**
 * Shows matching verses over the reader while the search bar has a draft.
 *
 * An overlay rather than a swap, and that is the whole design. The reader is a
 * virtualized window-scrolled list: hiding it drops its height to zero, which
 * resets the rendered range to the top and makes a deep reading position
 * unrecoverable — a restore can only chase a document that is still growing
 * under it. Unmounting is worse still, since `ChapterReader` clears the reader
 * context on the way out and takes the hydrated chapter corpus with it, which is
 * the exact haystack the slow-device path searches.
 *
 * Left in normal flow and simply covered, the reader keeps its measurements, its
 * loaded window and its scroll offset. Coming back is then not a restore at all;
 * the overlay just goes away.
 *
 * `draftQuery` is empty on the server and on the first client render, so nothing
 * is overlaid during hydration and there is no mismatch.
 */
export function QuranDraftSwitch({ children }: { children: React.ReactNode }) {
  const draft = useReaderContext((s) => s.draftQuery).trim()
  const active = draft.length >= MIN_DRAFT_LENGTH

  // Two measurements, not one.
  //
  // The opaque surface starts below whichever chrome the user is typing into:
  // the fixed header stack on reader routes, or the search bar itself on the
  // index, where it sits in the page body and an overlay anchored to the header
  // would cover the field mid-keystroke. Both are measured because the header is
  // 64px taller on reader routes and slides up on scroll-down.
  //
  // The content then starts below the suggestion panel, which floats over the
  // surface at a height that changes with how many suggestions there are.
  // Collapsing the two into one offset leaks the reader through the band between
  // them; padding the content instead keeps the surface unbroken.
  const [box, setBox] = useState({ top: HEADER_FALLBACK_PX, padding: 0 })
  useEffect(() => {
    if (!active) return
    const headers = document.querySelector('.quran-fixed-headers')

    const measure = () => {
      const bars = [...document.querySelectorAll('[data-quran-search-bar]')].map(
        (bar) => bar.getBoundingClientRect().bottom,
      )
      const top = Math.max(
        0,
        headers?.getBoundingClientRect().bottom ?? HEADER_FALLBACK_PX,
        ...bars,
      )
      const dropdown = document.querySelector('[data-quran-search-dropdown]')
      const dropdownBottom = dropdown?.getBoundingClientRect().bottom ?? 0
      setBox({ top, padding: Math.max(0, dropdownBottom - top) })
    }
    measure()

    // The suggestion panel mounts, unmounts and changes row count without
    // resizing the bar it is anchored to, so structure is watched as well as
    // size — and it is watched on the search bars, since on the index route the
    // panel is nowhere near the header.
    const anchors = [headers, ...document.querySelectorAll('[data-quran-search-bar]')].filter(
      (node): node is Element => node !== null,
    )
    const mutations = new MutationObserver(measure)
    const resizes = new ResizeObserver(measure)
    for (const anchor of anchors) {
      mutations.observe(anchor, { childList: true, subtree: true })
      resizes.observe(anchor)
    }
    // The header slides up 64px via a CSS transform keyed on this attribute,
    // which neither observer above would report.
    mutations.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-nav-hidden'],
    })
    window.addEventListener('resize', measure)

    return () => {
      mutations.disconnect()
      resizes.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [active, draft])

  return (
    <>
      {children}
      {active && (
        <div
          // Above the minimap (z-30), below the header stack and the player bar
          // (both z-50) so navigation and playback controls stay reachable.
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain bg-background"
          style={{ top: box.top, paddingTop: box.padding }}
        >
          <QuranDraftResults query={draft} />
        </div>
      )}
    </>
  )
}
