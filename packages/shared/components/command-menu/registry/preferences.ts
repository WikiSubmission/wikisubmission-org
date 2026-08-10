'use client'

import { createElement, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
  ALargeSmall,
  BookOpen,
  Eye,
  Languages,
  List,
  Moon,
  Palette,
  ScanText,
  Sun,
  Type,
} from 'lucide-react'
import { useQuranPreferences, type QuranPreferences } from '@/hooks/use-quran-preferences'
import { usePalette, PALETTES, type PaletteKey } from '@/lib/theme-palette-context'
import { ZOOM_LEVELS } from '@/lib/quran-zoom'
import type { Command } from '../types'

/** Reader toggles, keyed by the `settings` message that already names each one. */
const TOGGLES: {
  key: keyof QuranPreferences
  labelKey: string
  icon: () => ReturnType<typeof createElement>
}[] = [
  { key: 'arabic', labelKey: 'arabic', icon: () => createElement(Type) },
  { key: 'subtitles', labelKey: 'subtitles', icon: () => createElement(Eye) },
  { key: 'footnotes', labelKey: 'footnotes', icon: () => createElement(Eye) },
  { key: 'transliteration', labelKey: 'transliteration', icon: () => createElement(ALargeSmall) },
  { key: 'wordByWord', labelKey: 'wordByWord', icon: () => createElement(ScanText) },
]

/**
 * Reader preference, zoom, theme, and palette commands.
 *
 * Every one writes through `patchPreferences`, which owns the `text: true`
 * invariant, so the menu cannot drift from the settings panel. Toggles set
 * `keepOpen` so a reader can flip several without reopening the menu.
 */
export function usePreferenceCommands(): Command[] {
  const prefs = useQuranPreferences()
  const { patchPreferences } = prefs
  const { palette, setPalette } = usePalette()
  const { theme, setTheme } = useTheme()
  const t = useTranslations('settings')
  const tQuran = useTranslations('quran')
  const tMenu = useTranslations('commandMenu')

  return useMemo(() => {
    const commands: Command[] = []
    const stateHint = (on: boolean) => (on ? tMenu('on') : tMenu('off'))

    for (const toggle of TOGGLES) {
      const current = Boolean(prefs[toggle.key])
      commands.push({
        id: `pref:${toggle.key}`,
        group: 'settings',
        label: t(toggle.labelKey),
        hint: stateHint(current),
        icon: toggle.icon(),
        keepOpen: true,
        priority: 55,
        run: () => {
          // Word-by-word annotates the Arabic, so turning it on implies Arabic.
          if (toggle.key === 'wordByWord' && !current) {
            patchPreferences({ wordByWord: true, arabic: true })
            return
          }
          patchPreferences({ [toggle.key]: !current } as Partial<QuranPreferences>)
        },
      })
    }

    // ── Display mode ─────────────────────────────────────────────────────────
    // The three-state control the mode selector exposes, flattened into rows.
    const activeMode = prefs.displayMode === 'reading' ? 'reading' : prefs.wordByWord ? 'word' : 'verse'
    const modeRows: {
      id: 'verse' | 'word' | 'reading'
      label: string
      icon: ReturnType<typeof createElement>
      patch: Partial<QuranPreferences>
    }[] = [
      {
        id: 'verse',
        label: tQuran('modeVerse'),
        icon: createElement(List),
        patch: { displayMode: 'verse', wordByWord: false },
      },
      {
        id: 'word',
        label: tQuran('modeWordByWord'),
        icon: createElement(ScanText),
        patch: { displayMode: 'verse', wordByWord: true, arabic: true },
      },
      {
        id: 'reading',
        label: tQuran('modeReading'),
        icon: createElement(BookOpen),
        patch: { displayMode: 'reading' },
      },
    ]
    for (const mode of modeRows) {
      commands.push({
        id: `pref:mode-${mode.id}`,
        group: 'settings',
        label: `${tMenu('mode')}: ${mode.label}`,
        icon: mode.icon,
        hint: activeMode === mode.id ? '✓' : undefined,
        keepOpen: true,
        priority: 50,
        keywords: [tMenu('mode'), mode.label],
        run: () => patchPreferences(mode.patch),
      })
    }

    // ── Zoom ─────────────────────────────────────────────────────────────────
    for (const level of ZOOM_LEVELS) {
      const labelKey = `zoom${level.charAt(0).toUpperCase()}${level.slice(1)}`
      commands.push({
        id: `pref:zoom-${level}`,
        group: 'settings',
        label: `${t('zoom')}: ${t(labelKey)}`,
        icon: createElement(ALargeSmall),
        hint: prefs.zoomLevel === level ? '✓' : undefined,
        keepOpen: true,
        priority: 40,
        keywords: [t('zoom'), level],
        run: () => patchPreferences({ zoomLevel: level }),
      })
    }

    // ── Theme mode ───────────────────────────────────────────────────────────
    const modes: { id: string; labelKey: string; icon: ReturnType<typeof createElement> }[] = [
      { id: 'light', labelKey: 'light', icon: createElement(Sun) },
      { id: 'dark', labelKey: 'dark', icon: createElement(Moon) },
      { id: 'system', labelKey: 'system', icon: createElement(Sun) },
    ]
    for (const mode of modes) {
      commands.push({
        id: `theme:${mode.id}`,
        group: 'settings',
        label: `${t('theme')}: ${t(mode.labelKey)}`,
        icon: mode.icon,
        hint: theme === mode.id ? '✓' : undefined,
        keepOpen: true,
        priority: 40,
        keywords: [t('theme'), mode.id],
        run: () => setTheme(mode.id),
      })
    }

    // ── Colour palette ───────────────────────────────────────────────────────
    for (const key of Object.keys(PALETTES) as PaletteKey[]) {
      commands.push({
        id: `palette:${key}`,
        group: 'settings',
        label: `${tMenu('palette')}: ${key}`,
        icon: createElement(Palette),
        hint: palette === key ? '✓' : undefined,
        keepOpen: true,
        priority: 35,
        keywords: [tMenu('palette'), key],
        run: () => setPalette(key),
      })
    }

    // ── Translation language ─────────────────────────────────────────────────
    commands.push({
      id: 'pref:language',
      group: 'settings',
      label: t('quranTranslation'),
      icon: createElement(Languages),
      page: 'language',
      priority: 60,
      keywords: [t('language'), t('interfaceLanguage')],
    })

    return commands
  }, [prefs, patchPreferences, palette, setPalette, theme, setTheme, t, tQuran, tMenu])
}
