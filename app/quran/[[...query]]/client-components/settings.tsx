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

export default function QuranSettings() {
  const quranPreferences = useQuranPreferences()
  const languages = useLanguagesStore((s) => s.languages)

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
        <DropdownMenuSub>
          <DropdownMenuLabel className="flex items-center gap-2 text-violet-500">
            <LanguagesIcon className="size-4" />
            <strong>Language</strong>
          </DropdownMenuLabel>
          <DropdownMenuSubTrigger>
            <strong>Primary Language</strong>
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
            <strong>Secondary Language</strong>
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
                <strong>None</strong>
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
          <strong>Reading</strong>
        </DropdownMenuLabel>
        <div className="space-y-2">
          <section className="flex justify-between items-center gap-2 px-2">
            <Label htmlFor="text">Arabic</Label>
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
            <Label htmlFor="text">Subtitles</Label>
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
            <Label htmlFor="text">Footnotes</Label>
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
            <Label htmlFor="text">Transliteration</Label>
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
            <Label htmlFor="text">Word by Word</Label>
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
