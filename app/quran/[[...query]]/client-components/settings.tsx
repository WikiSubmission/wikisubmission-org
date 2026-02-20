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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/toggles/theme-toggle'

export default function QuranSettings() {
  const quranPreferences = useQuranPreferences()

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
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'english',
                  })
                }
              >
                English
                {quranPreferences.primaryLanguage === 'english' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'turkish',
                  })
                }
              >
                Turkish
                {quranPreferences.primaryLanguage === 'turkish' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'persian',
                  })
                }
              >
                Persian
                {quranPreferences.primaryLanguage === 'persian' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'spanish',
                  })
                }
              >
                Spanish
                {quranPreferences.primaryLanguage === 'spanish' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'french',
                  })
                }
              >
                French
                {quranPreferences.primaryLanguage === 'french' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'german',
                  })
                }
              >
                German
                {quranPreferences.primaryLanguage === 'german' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'swedish',
                  })
                }
              >
                Swedish
                {quranPreferences.primaryLanguage === 'swedish' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'russian',
                  })
                }
              >
                Russian
                {quranPreferences.primaryLanguage === 'russian' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'bahasa',
                  })
                }
              >
                Bahasa
                {quranPreferences.primaryLanguage === 'bahasa' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'urdu',
                  })
                }
              >
                Urdu
                {quranPreferences.primaryLanguage === 'urdu' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    primaryLanguage: 'bengali',
                  })
                }
              >
                Bengali
                {quranPreferences.primaryLanguage === 'bengali' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
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
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'english',
                  })
                }
              >
                English
                {quranPreferences.secondaryLanguage === 'english' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'turkish',
                  })
                }
              >
                Turkish
                {quranPreferences.secondaryLanguage === 'turkish' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'persian',
                  })
                }
              >
                Persian
                {quranPreferences.secondaryLanguage === 'persian' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'spanish',
                  })
                }
              >
                Spanish
                {quranPreferences.secondaryLanguage === 'spanish' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'french',
                  })
                }
              >
                French
                {quranPreferences.secondaryLanguage === 'french' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'german',
                  })
                }
              >
                German
                {quranPreferences.secondaryLanguage === 'german' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'swedish',
                  })
                }
              >
                Swedish
                {quranPreferences.secondaryLanguage === 'swedish' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'russian',
                  })
                }
              >
                Russian
                {quranPreferences.secondaryLanguage === 'russian' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'bahasa',
                  })
                }
              >
                Bahasa
                {quranPreferences.secondaryLanguage === 'bahasa' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'urdu',
                  })
                }
              >
                Urdu
                {quranPreferences.secondaryLanguage === 'urdu' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quranPreferences.setPreferences({
                    ...quranPreferences,
                    secondaryLanguage: 'bengali',
                  })
                }
              >
                Bengali
                {quranPreferences.secondaryLanguage === 'bengali' && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
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
