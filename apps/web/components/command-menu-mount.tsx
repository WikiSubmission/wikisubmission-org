'use client'

import { useHotkey } from '@/hooks/use-hotkey'
import { useCommandMenu } from '@/components/command-menu/use-command-menu'
import { CommandMenu } from '@/components/command-menu/command-menu'

/**
 * Binds the global command-menu shortcut and mounts the menu.
 *
 * `CommandMenu` renders nothing until it is opened, so mounting it eagerly costs
 * a subscription and no DOM. It is a static import on purpose: behind
 * `next/dynamic` with `ssr: false`, React reported a hook-order change inside
 * `CommandMenu` on every open (accompanied by a null `getSnapshot` from one of
 * the zustand stores), which left its effects unattached — the open and close
 * tweens never ran and the dialog could not be dismissed. The chunk is small
 * enough that correctness is the better trade; revisit with `React.lazy` behind
 * a Suspense boundary if it ever grows.
 *
 * The shortcut lives out here rather than inside the menu so there is exactly one
 * owner of `/`, and it keeps working no matter what the menu is rendering. `/` is
 * a bare key, so `useHotkey` ignores it while the user is typing in a field.
 */
export function CommandMenuMount() {
  const toggle = useCommandMenu((s) => s.toggle)

  useHotkey('/', toggle, { mod: false })

  return <CommandMenu />
}
