'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookIcon, CheckIcon, LanguagesIcon, SettingsIcon } from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { LangCode } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/toggles/theme-toggle'
import { setLocale } from '@/app/actions/locale'
import { useLocale, useTranslations } from 'next-intl'

export default function QuranSettings() {
  const quranPreferences = useQuranPreferences()
  const languages = useLanguagesStore((s) => s.languages)
  const uiLocale = useLocale()
  const t = useTranslations('settings')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label="Open menu" size="icon-sm">
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end">
        <div className="flex justify-end items-center gap-2 px-2 py-1">
          <ThemeToggle />
        </div>
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500">
          <LanguagesIcon className="size-4" />
          <strong>{t('language')}</strong>
        </DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <strong>{t('interfaceLanguage')}</strong>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {languages.map(({ code, name }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setLocale(code)}
                >
                  {name}
                  {uiLocale === code && <CheckIcon className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <strong>{t('quranTranslation')}</strong>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {languages.map(({ code, name }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() =>
                    quranPreferences.setPreferences({
                      ...quranPreferences,
                      primaryLanguage: code as LangCode,
                    })
                  }
                >
                  {name}
                  {quranPreferences.primaryLanguage === code && (
                    <CheckIcon className="size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <strong>{t('secondaryTranslation')}</strong>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: undefined,
                  })
                }
              >
                <strong>{t('none')}</strong>
                {quranPreferences.secondaryLanguage === undefined && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              {languages.map(({ code, name }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() =>
                    quranPreferences.setPreferences({
                      ...quranPreferences,
                      secondaryLanguage: code as LangCode,
                    })
                  }
                >
                  {name}
                  {quranPreferences.secondaryLanguage === code && (
                    <CheckIcon className="size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500">
          <BookIcon className="size-4" />
          <strong>{t('reading')}</strong>
        </DropdownMenuLabel>
        <div className="space-y-2">
          <section className="flex justify-between items-center gap-2 px-2">
            <Label htmlFor="text">{t('arabic')}</Label>
            <Switch
              checked={quranPreferences.arabic}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  arabic: checked,
                })
              }
            />
          </section>

          <section className="flex justify-between items-center gap-2 px-2">
            <Label htmlFor="text">{t('subtitles')}</Label>
            <Switch
              checked={quranPreferences.subtitles}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  subtitles: checked,
                })
              }
            />
          </section>

          <section className="flex justify-between items-center gap-2 px-2">
            <Label htmlFor="text">{t('footnotes')}</Label>
            <Switch
              checked={quranPreferences.footnotes}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  footnotes: checked,
                })
              }
            />
          </section>
          <section className="flex justify-between items-center gap-2 px-2">
            <Label htmlFor="text">{t('transliteration')}</Label>
            <Switch
              checked={quranPreferences.transliteration}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  transliteration: checked,
                })
              }
            />
          </section>
          <section className="flex justify-between items-center gap-2 px-2">
            <Label htmlFor="text">{t('wordByWord')}</Label>
            <Switch
              checked={quranPreferences.wordByWord}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  wordByWord: checked,
                })
              }
            />
          </section>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
