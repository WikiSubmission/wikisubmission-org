'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpenTextIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HashIcon,
  LanguagesIcon,
  MessageSquareTextIcon,
  ScanTextIcon,
  SettingsIcon,
  TextIcon,
  TypeIcon,
  ZoomInIcon,
} from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type {
  LangCode,
  ReadingModeLang,
} from '@/hooks/use-quran-preferences'
import { ZOOM_LEVELS, type ZoomLevel } from '@/lib/quran-zoom'
import { LanguageEntry, useLanguagesStore } from '@/hooks/use-languages-store'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type View = 'root' | 'language' | 'display' | 'zoom'

const ZOOM_LABEL_KEYS = {
  compact: 'zoomCompact',
  normal: 'zoomNormal',
  comfortable: 'zoomComfortable',
  wide: 'zoomWide',
  full: 'zoomFull',
} as const

// ── Reusable bits ────────────────────────────────────────────────────────────

function NavRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/40 transition-colors text-left"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground truncate">
          {value}
        </span>
      </span>
      <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
    </button>
  )
}

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

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-1 px-2 py-2 border-b">
      <button
        onClick={onBack}
        className="flex items-center gap-0.5 px-2 py-1 -ml-1 rounded-lg text-sm text-primary hover:bg-accent/40 transition-colors"
        aria-label="Back"
      >
        <ChevronLeftIcon className="size-4" />
        <span>Settings</span>
      </button>
      <span className="flex-1 text-center text-sm font-semibold pr-12">
        {title}
      </span>
    </div>
  )
}

function LangList({
  value,
  nullable,
  languages,
  onChange,
}: {
  value: string | undefined
  nullable?: boolean
  languages: LanguageEntry[]
  onChange: (code: string | undefined) => void
}) {
  const t = useTranslations('settings')
  const renderRow = (
    key: string,
    label: string,
    isActive: boolean,
    handle: () => void
  ) => (
    <button
      key={key}
      onClick={handle}
      className={cn(
        'flex w-full items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-foreground hover:bg-accent/40'
      )}
    >
      <span>{label}</span>
      {isActive && <CheckIcon className="size-4" />}
    </button>
  )

  return (
    <div className="flex flex-col gap-0.5">
      {nullable &&
        renderRow('__none__', t('none'), value === undefined, () =>
          onChange(undefined)
        )}
      {languages.map(({ code, name }) =>
        renderRow(code ?? '', name ?? code ?? '', value === code, () =>
          onChange(code ?? undefined)
        )
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function QuranSettings() {
  const prefs = useQuranPreferences()
  const languages = useLanguagesStore((s) => s.languages)
  const t = useTranslations('settings')
  const [view, setView] = useState<View>('root')
  const [langTab, setLangTab] = useState<'primary' | 'secondary'>('primary')

  const set = (patch: Partial<typeof prefs>) =>
    prefs.setPreferences({ ...prefs, ...patch })

  const primaryName =
    languages.find((l) => l.code === prefs.primaryLanguage)?.name ??
    prefs.primaryLanguage
  const secondaryName = prefs.secondaryLanguage
    ? languages.find((l) => l.code === prefs.secondaryLanguage)?.name ??
      prefs.secondaryLanguage
    : t('none')
  const zoomName = t(ZOOM_LABEL_KEYS[prefs.zoomLevel ?? 'comfortable'])

  const enabledDisplay = [
    prefs.displayMode === 'reading'
      ? prefs.readingModeLang === 'arabic'
        ? t('arabic')
        : 'Translation'
      : prefs.text && 'Translation',
    prefs.displayMode !== 'reading' && prefs.wordByWord && t('wordByWord'),
    prefs.displayMode !== 'reading' &&
      prefs.arabic &&
      !prefs.wordByWord &&
      t('arabic'),
    prefs.displayMode !== 'reading' &&
      prefs.transliteration &&
      t('transliteration'),
    prefs.displayMode !== 'reading' && prefs.subtitles && t('subtitles'),
    prefs.footnotes && t('footnotes'),
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        if (!open) setView('root')
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label="Open settings" size="icon-sm">
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-0 overflow-hidden"
        align="end"
        sideOffset={6}
      >
        {view === 'root' && (
          <div className="p-2">
            <div className="px-2 pt-1 pb-2">
              <p className="text-base font-semibold">{t('title')}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <NavRow
                icon={<LanguagesIcon className="size-4" />}
                label={t('language')}
                value={
                  prefs.secondaryLanguage
                    ? `${primaryName} · ${secondaryName}`
                    : primaryName
                }
                onClick={() => {
                  setLangTab('primary')
                  setView('language')
                }}
              />
              <NavRow
                icon={<TypeIcon className="size-4" />}
                label={t('reading')}
                value={enabledDisplay || '—'}
                onClick={() => setView('display')}
              />
              <NavRow
                icon={<ZoomInIcon className="size-4" />}
                label={t('zoom')}
                value={zoomName}
                onClick={() => setView('zoom')}
              />
            </div>
          </div>
        )}

        {view === 'language' && (
          <div className="flex flex-col max-h-[28rem]">
            <SubHeader
              title={t('language')}
              onBack={() => setView('root')}
            />
            <div className="flex gap-1 px-2 pt-2">
              {(
                [
                  { value: 'primary', label: t('quranTranslation') },
                  { value: 'secondary', label: t('secondaryTranslation') },
                ] as const
              ).map((tab) => {
                const isActive = langTab === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => setLangTab(tab.value)}
                    className={cn(
                      'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/40'
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <div className="overflow-y-auto p-2 flex-1">
              {langTab === 'primary' ? (
                <LangList
                  value={prefs.primaryLanguage}
                  languages={languages}
                  onChange={(code) =>
                    set({ primaryLanguage: code as LangCode })
                  }
                />
              ) : (
                <LangList
                  value={prefs.secondaryLanguage}
                  nullable
                  languages={languages}
                  onChange={(code) =>
                    set({ secondaryLanguage: code as LangCode | undefined })
                  }
                />
              )}
            </div>
          </div>
        )}

        {view === 'display' && (
          <div className="flex flex-col">
            <SubHeader title={t('reading')} onBack={() => setView('root')} />
            <div className="p-2 space-y-0.5 max-h-[28rem] overflow-y-auto">
              {prefs.displayMode === 'reading' && (
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('language')}
                  </p>
                  <div className="flex gap-1.5">
                    {(['translation', 'arabic'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() =>
                          set({ readingModeLang: lang as ReadingModeLang })
                        }
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                          prefs.readingModeLang === lang
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
                        )}
                      >
                        {lang === 'translation' ? 'Translation' : t('arabic')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {prefs.displayMode !== 'reading' && (
                <>
                  <SettingTile
                    icon={<TextIcon className="size-3.5" />}
                    label="Translation"
                    description="Verse translation text"
                    checked={prefs.text}
                    onCheckedChange={(checked) => set({ text: checked })}
                  />
                  <SettingTile
                    icon={<TypeIcon className="size-3.5" />}
                    label={t('arabic')}
                    description="Original Arabic text"
                    checked={prefs.arabic || prefs.wordByWord}
                    disabled={prefs.wordByWord}
                    onCheckedChange={(checked) => set({ arabic: checked })}
                  />
                  <SettingTile
                    icon={<ScanTextIcon className="size-3.5" />}
                    label={t('wordByWord')}
                    description="Per-word Arabic with translation"
                    checked={prefs.wordByWord}
                    onCheckedChange={(checked) =>
                      set({ wordByWord: checked })
                    }
                  />
                  <SettingTile
                    icon={<MessageSquareTextIcon className="size-3.5" />}
                    label={t('subtitles')}
                    description="Section titles above verses"
                    checked={prefs.subtitles}
                    onCheckedChange={(checked) => set({ subtitles: checked })}
                  />
                  <SettingTile
                    icon={<LanguagesIcon className="size-3.5" />}
                    label={t('transliteration')}
                    description="Romanized pronunciation"
                    checked={prefs.transliteration}
                    onCheckedChange={(checked) =>
                      set({ transliteration: checked })
                    }
                  />
                </>
              )}

              <SettingTile
                icon={<BookOpenTextIcon className="size-3.5" />}
                label={t('footnotes')}
                description="Translator notes at the bottom"
                checked={prefs.footnotes}
                onCheckedChange={(checked) => set({ footnotes: checked })}
              />

              {prefs.displayMode === 'reading' && (
                <SettingTile
                  icon={<HashIcon className="size-3.5" />}
                  label="Verse Numbers"
                  description="Inline superscript verse numbers"
                  checked={prefs.showVerseNumbers}
                  onCheckedChange={(checked) =>
                    set({ showVerseNumbers: checked })
                  }
                />
              )}
            </div>
          </div>
        )}

        {view === 'zoom' && (
          <div className="flex flex-col">
            <SubHeader title={t('zoom')} onBack={() => setView('root')} />
            <div className="p-2 flex flex-col gap-0.5">
              {ZOOM_LEVELS.map((level) => {
                const isActive =
                  (prefs.zoomLevel ?? 'comfortable') === level
                return (
                  <button
                    key={level}
                    onClick={() => set({ zoomLevel: level as ZoomLevel })}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-accent/40'
                    )}
                  >
                    <span>{t(ZOOM_LABEL_KEYS[level])}</span>
                    {isActive && <CheckIcon className="size-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
