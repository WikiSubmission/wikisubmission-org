'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useHotkey } from '@/hooks/use-hotkey'
import { useCommandMenu } from '@/components/command-menu/use-command-menu'

/**
 * The always-mounted half of the command menu.
 *
 * Only the shortcut binding and the store live here; the menu itself (cmdk, the
 * route manifest, the command registries) is a separate chunk that loads on the
 * first Meta/Ctrl press or the first pointer over a trigger, both of which land
 * well before the dialog would animate in. Keeping the hotkey out of that chunk
 * is what makes the split real — a shortcut defined inside a lazily-loaded
 * component cannot be the thing that triggers its own load.
 *
 * Once loaded, the chunk is precached by the service worker, so repeat visits
 * open the menu with no network at all.
 */
const CommandMenu = dynamic(
  () => import('@/components/command-menu/command-menu').then((m) => m.CommandMenu),
  { ssr: false },
)

export function CommandMenuMount() {
  const open = useCommandMenu((s) => s.open)
  const toggle = useCommandMenu((s) => s.toggle)
  const [loaded, setLoaded] = useState(false)

  useHotkey('k', toggle, { mod: true })

  // Warm the chunk as soon as the user reaches for a modifier key, so the first
  // ⌘K opens instantly rather than waiting on a fetch.
  useEffect(() => {
    if (loaded) return
    const warm = () => setLoaded(true)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) warm()
    }
    window.addEventListener('keydown', onKeyDown, { once: true })
    window.addEventListener('pointerdown', warm, { once: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', warm)
    }
  }, [loaded])

  if (!loaded && !open) return null
  return <CommandMenu />
}
