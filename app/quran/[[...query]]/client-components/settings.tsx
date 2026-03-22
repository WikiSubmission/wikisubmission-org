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
import {
  BookIcon,
  BookOpenTextIcon,
  CheckIcon,
  HashIcon,
  LanguagesIcon,
  MessageSquareTextIcon,
  SettingsIcon,
  TextIcon,
  TypeIcon,
} from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { LangCode } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/toggles/theme-toggle'
import { useLocale, useTranslations } from 'next-intl'

function SettingTile({
  icon,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium leading-none">{label}</span>
          <span className="text-xs text-muted-foreground leading-snug">{description}</span>
        </div>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  )
}

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
      <DropdownMenuContent className="w-72" align="end">
        <div className="flex justify-end items-center gap-2 px-2 py-1">
          <ThemeToggle />
        </div>

        {/* Language */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500">
          <LanguagesIcon className="size-4" />
          <strong>{t('language')}</strong>
        </DropdownMenuLabel>

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

        {/* Reading */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500 mt-1">
          <BookIcon className="size-4" />
          <strong>{t('reading')}</strong>
        </DropdownMenuLabel>

        <div className="space-y-0.5 pb-1">
          {/* Arabic */}
          <SettingTile
            icon={<TypeIcon className="size-3.5" />}
            label={t('arabic')}
            description="Original Arabic text"
            checked={quranPreferences.arabic || quranPreferences.displayMode === 'word'}
            disabled={quranPreferences.displayMode === 'word'}
            onCheckedChange={(checked) =>
              quranPreferences.setPreferences({ ...quranPreferences, arabic: checked })
            }
          />

          {/* Translation */}
          <SettingTile
            icon={<TextIcon className="size-3.5" />}
            label="Translation"
            description="Verse translation text"
            checked={quranPreferences.text}
            onCheckedChange={(checked) =>
              quranPreferences.setPreferences({ ...quranPreferences, text: checked })
            }
          />

          {/* Subtitles — verse + word modes */}
          {quranPreferences.displayMode !== 'reading' && (
            <SettingTile
              icon={<MessageSquareTextIcon className="size-3.5" />}
              label={t('subtitles')}
              description="Section titles above verses"
              checked={quranPreferences.subtitles}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({ ...quranPreferences, subtitles: checked })
              }
            />
          )}

          {/* Footnotes — verse + reading modes */}
          {quranPreferences.displayMode !== 'word' && (
            <SettingTile
              icon={<BookOpenTextIcon className="size-3.5" />}
              label={t('footnotes')}
              description="Translator notes at the bottom"
              checked={quranPreferences.footnotes}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({ ...quranPreferences, footnotes: checked })
              }
            />
          )}

          {/* Transliteration — verse mode only */}
          {quranPreferences.displayMode === 'verse' && (
            <SettingTile
              icon={<LanguagesIcon className="size-3.5" />}
              label={t('transliteration')}
              description="Romanized pronunciation"
              checked={quranPreferences.transliteration}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({ ...quranPreferences, transliteration: checked })
              }
            />
          )}

          {/* Verse numbers — reading mode only */}
          {quranPreferences.displayMode === 'reading' && (
            <SettingTile
              icon={<HashIcon className="size-3.5" />}
              label="Verse Numbers"
              description="Inline superscript verse numbers"
              checked={quranPreferences.showVerseNumbers}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({ ...quranPreferences, showVerseNumbers: checked })
              }
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
