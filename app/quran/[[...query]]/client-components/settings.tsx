'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
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
  ZoomInIcon,
} from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { LangCode, ReadingModeLang } from '@/hooks/use-quran-preferences'
import { ZOOM_LEVELS, type ZoomLevel } from '@/lib/quran-zoom'
import { LanguageEntry, useLanguagesStore } from '@/hooks/use-languages-store'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
          <span className="text-xs text-muted-foreground leading-snug">
            {description}
          </span>
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

function LangPicker({
  label,
  value,
  nullable,
  languages,
  onChange,
}: {
  label: string
  value: string | undefined
  nullable?: boolean
  languages: LanguageEntry[]
  onChange: (code: string | undefined) => void
}) {
  return (
    <div className="px-3 py-2 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {nullable && (
          <button
            onClick={() => onChange(undefined)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
              value === undefined
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
            )}
          >
            None
          </button>
        )}
        {languages.map(({ code, name }) => {
          const isActive = value === code
          return (
            <button
              key={code}
              onClick={() => onChange(code)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border flex items-center gap-1',
                isActive
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
              )}
            >
              {name}
              {isActive && <CheckIcon className="size-3" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function QuranSettings() {
  const quranPreferences = useQuranPreferences()
  const languages = useLanguagesStore((s) => s.languages)
  const t = useTranslations('settings')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label="Open menu" size="icon-sm">
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        {/* Zoom */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500">
          <ZoomInIcon className="size-4" />
          <strong>{t('zoom')}</strong>
        </DropdownMenuLabel>

        <div className="px-3 py-2">
          <div className="flex gap-1.5">
            {ZOOM_LEVELS.map((level) => {
              const labelKey =
                `zoom${level.charAt(0).toUpperCase()}${level.slice(1)}` as
                  | 'zoomCompact'
                  | 'zoomNormal'
                  | 'zoomComfortable'
                  | 'zoomWide'
                  | 'zoomFull'
              const isActive =
                (quranPreferences.zoomLevel ?? 'comfortable') === level
              return (
                <button
                  key={level}
                  onClick={() =>
                    quranPreferences.setPreferences({
                      ...quranPreferences,
                      zoomLevel: level as ZoomLevel,
                    })
                  }
                  className={cn(
                    'flex-1 px-1.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
                  )}
                >
                  {t(labelKey)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Language */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500 mt-1">
          <LanguagesIcon className="size-4" />
          <strong>{t('language')}</strong>
        </DropdownMenuLabel>

        <LangPicker
          label={t('quranTranslation')}
          value={quranPreferences.primaryLanguage}
          languages={languages}
          onChange={(code) =>
            quranPreferences.setPreferences({
              ...quranPreferences,
              primaryLanguage: code as LangCode,
            })
          }
        />

        <LangPicker
          label={t('secondaryTranslation')}
          value={quranPreferences.secondaryLanguage}
          nullable
          languages={languages}
          onChange={(code) =>
            quranPreferences.setPreferences({
              ...quranPreferences,
              secondaryLanguage: code as LangCode | undefined,
            })
          }
        />

        {/* Reading */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500 mt-1">
          <BookIcon className="size-4" />
          <strong>{t('reading')}</strong>
        </DropdownMenuLabel>

        <div className="space-y-0.5 pb-1">
          {/* Reading mode: language selector (replaces arabic + translation toggles) */}
          {quranPreferences.displayMode === 'reading' && (
            <div className="px-3 py-2 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Language
              </p>
              <div className="flex gap-1.5">
                {(['translation', 'arabic'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() =>
                      quranPreferences.setPreferences({
                        ...quranPreferences,
                        readingModeLang: lang as ReadingModeLang,
                      })
                    }
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                      quranPreferences.readingModeLang === lang
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {lang === 'translation' ? 'Translation' : 'Arabic'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Arabic — hidden in reading mode (handled by reading language selector) */}
          {quranPreferences.displayMode !== 'reading' && (
            <SettingTile
              icon={<TypeIcon className="size-3.5" />}
              label={t('arabic')}
              description="Original Arabic text"
              checked={
                quranPreferences.arabic ||
                quranPreferences.displayMode === 'word'
              }
              disabled={quranPreferences.displayMode === 'word'}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  arabic: checked,
                })
              }
            />
          )}

          {/* Translation — hidden in reading mode (handled by reading language selector) */}
          {quranPreferences.displayMode !== 'reading' && (
            <SettingTile
              icon={<TextIcon className="size-3.5" />}
              label="Translation"
              description="Verse translation text"
              checked={quranPreferences.text}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  text: checked,
                })
              }
            />
          )}

          {/* Subtitles — verse + word modes */}
          {quranPreferences.displayMode !== 'reading' && (
            <SettingTile
              icon={<MessageSquareTextIcon className="size-3.5" />}
              label={t('subtitles')}
              description="Section titles above verses"
              checked={quranPreferences.subtitles}
              onCheckedChange={(checked) =>
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  subtitles: checked,
                })
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
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  footnotes: checked,
                })
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
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  transliteration: checked,
                })
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
                quranPreferences.setPreferences({
                  ...quranPreferences,
                  showVerseNumbers: checked,
                })
              }
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
