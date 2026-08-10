'use client'

import { createElement, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { useQuranPreferences, type LangCode } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import type { Command } from '../types'

/**
 * The `language` sub-page: pick the primary or secondary Quran translation.
 *
 * Languages come from the backend `/languages` cache the Quran layout seeds into
 * `useLanguagesStore`, so this lists exactly what the reader can actually render.
 * Falls back to the two languages that always exist when the store is unseeded
 * (the menu is mounted app-wide, not only under the Quran layout).
 */
export function useLanguageCommands(): Command[] {
  const languages = useLanguagesStore((s) => s.languages)
  const { primaryLanguage, secondaryLanguage, patchPreferences } = useQuranPreferences()
  const t = useTranslations('settings')

  return useMemo(() => {
    const available = languages.length
      ? languages
      : [
          { code: 'en', name: 'English' },
          { code: 'ar', name: 'العربية' },
        ]

    const commands: Command[] = []

    for (const language of available) {
      if (!language.code) continue
      const code = language.code as LangCode
      const name = language.name ?? language.code

      commands.push({
        id: `lang:primary:${code}`,
        group: 'settings',
        label: `${t('quranTranslation')}: ${name}`,
        icon: createElement(Languages),
        hint: primaryLanguage === code ? '✓' : undefined,
        keepOpen: true,
        priority: 60,
        keywords: [code, name],
        run: () => patchPreferences({ primaryLanguage: code }),
      })

      commands.push({
        id: `lang:secondary:${code}`,
        group: 'settings',
        label: `${t('secondaryTranslation')}: ${name}`,
        icon: createElement(Languages),
        hint: secondaryLanguage === code ? '✓' : undefined,
        keepOpen: true,
        priority: 40,
        keywords: [code, name],
        run: () => patchPreferences({ secondaryLanguage: code }),
      })
    }

    // Clearing the secondary translation is the only way back to a single column.
    commands.push({
      id: 'lang:secondary:none',
      group: 'settings',
      label: `${t('secondaryTranslation')}: ${t('none')}`,
      icon: createElement(Languages),
      hint: secondaryLanguage ? undefined : '✓',
      keepOpen: true,
      priority: 40,
      run: () => patchPreferences({ secondaryLanguage: undefined }),
    })

    return commands
  }, [languages, primaryLanguage, secondaryLanguage, patchPreferences, t])
}
