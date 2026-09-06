'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AArrowDownIcon,
  AArrowUpIcon,
  BookOpenTextIcon,
  CaseLowerIcon,
  CheckIcon,
  ChevronDownIcon,
  HashIcon,
  LanguagesIcon,
  MessageSquareTextIcon,
  RotateCcwIcon,
  SettingsIcon,
  TypeIcon,
} from 'lucide-react'
import {
  isDefaultReadingPreferences,
  useQuranPreferences,
} from '@/hooks/use-quran-preferences'
import type { LangCode, ReadingModeLang } from '@/hooks/use-quran-preferences'
import {
  CONTENT_WIDTHS,
  FONT_SIZES,
  FONT_SIZE_PX,
  type ContentWidth,
  type FontSize,
} from '@/lib/quran-typography'
import { LanguageEntry, useLanguagesStore } from '@/hooks/use-languages-store'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type Section = 'reading' | 'language' | null

const SIZE_LABEL_KEYS: Record<FontSize, string> = {
  xs: 'sizeXs',
  sm: 'sizeSm',
  md: 'sizeMd',
  lg: 'sizeLg',
  xl: 'sizeXl',
}

const WIDTH_LABEL_KEYS: Record<ContentWidth, string> = {
  narrow: 'widthNarrow',
  medium: 'widthMedium',
  wide: 'widthWide',
  full: 'widthFull',
}

/** Arabic sample for the size preview — script everyone reading here recognises. */
const PREVIEW_ARABIC = 'بِسْمِ ٱللَّٰهِ'

// ── Reusable bits ────────────────────────────────────────────────────────────

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
    <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-accent/30 transition-colors">
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
    nextValue: string | undefined
  ) => (
    <button
      key={key}
      type="button"
      // Stop the pointerdown so Radix's dismissable-layer doesn't treat the
      // click as a focus shift and tear the dropdown down before our click
      // handler runs.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(nextValue)
      }}
      className={cn(
        'flex w-full items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
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
        renderRow('__none__', t('none'), value === undefined, undefined)}
      {languages.map(({ code, name }) => {
        if (!code) return null
        return renderRow(code, name ?? code, value === code, code)
      })}
    </div>
  )
}

function AccordionSection({
  id,
  open,
  onToggle,
  icon,
  label,
  summary,
  children,
}: {
  id: string
  open: boolean
  onToggle: () => void
  icon: React.ReactNode
  label: string
  summary: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-3 hover:bg-accent/30 transition-colors text-left"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-foreground">
            {label}
          </span>
          <span className="block text-xs text-muted-foreground truncate">
            {summary}
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 text-muted-foreground shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        id={`${id}-panel`}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Text size and column width, always visible above the accordions.
 *
 * These are the two settings a reader reaches for most often and the only ones
 * whose effect is instant, so they are one click away rather than behind a
 * section — and they are independent: large text in a narrow column is a normal
 * thing to want. The preview renders the real pixel sizes, so the choice reads
 * the same as the page behind the panel.
 */
function SizingControls({
  fontSize,
  contentWidth,
  onFontSize,
  onContentWidth,
}: {
  fontSize: FontSize
  contentWidth: ContentWidth
  onFontSize: (size: FontSize) => void
  onContentWidth: (width: ContentWidth) => void
}) {
  const t = useTranslations('settings')
  const sizeIndex = FONT_SIZES.indexOf(fontSize)
  const px = FONT_SIZE_PX[fontSize]

  const step = (delta: -1 | 1) => {
    const next =
      FONT_SIZES[
        Math.min(FONT_SIZES.length - 1, Math.max(0, sizeIndex + delta))
      ]
    if (next !== fontSize) onFontSize(next)
  }

  return (
    <div className="border-b px-3 py-3 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{t('textSize')}</span>
        <div className="flex items-center gap-0.5 rounded-lg border p-0.5">
          <button
            type="button"
            aria-label={t('decreaseTextSize')}
            disabled={sizeIndex <= 0}
            onClick={() => step(-1)}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <AArrowDownIcon className="size-4" />
          </button>
          <span className="min-w-16 text-center text-xs font-medium">
            {t(SIZE_LABEL_KEYS[fontSize])}
          </span>
          <button
            type="button"
            aria-label={t('increaseTextSize')}
            disabled={sizeIndex >= FONT_SIZES.length - 1}
            onClick={() => step(1)}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <AArrowUpIcon className="size-4" />
          </button>
        </div>
      </div>

      <div
        aria-hidden
        className="flex h-14 items-center justify-between gap-3 overflow-hidden rounded-lg bg-muted/40 px-3"
      >
        <span
          className="truncate leading-none text-foreground"
          style={{ fontSize: px.translation }}
        >
          Aa
        </span>
        <span
          dir="rtl"
          className="font-arabic truncate leading-none text-foreground/90"
          style={{ fontSize: px.arabic }}
        >
          {PREVIEW_ARABIC}
        </span>
      </div>

      {/* Column width only bites on wide viewports — hide it where every step
          would render identically. */}
      <div className="hidden lg:flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{t('readingWidth')}</span>
        <div className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
          {CONTENT_WIDTHS.map((width) => {
            const isActive = contentWidth === width
            return (
              <button
                key={width}
                type="button"
                aria-pressed={isActive}
                onClick={() => onContentWidth(width)}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t(WIDTH_LABEL_KEYS[width])}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function QuranSettings() {
  const prefs = useQuranPreferences()
  const languages = useLanguagesStore((s) => s.languages)
  const t = useTranslations('settings')
  const [openSection, setOpenSection] = useState<Section>('reading')
  const [langTab, setLangTab] = useState<'primary' | 'secondary'>('primary')

  // `patchPreferences` owns the `text: true` invariant, so this is now a passthrough.
  const set = prefs.patchPreferences

  const toggle = (section: Exclude<Section, null>) =>
    setOpenSection((cur) => (cur === section ? null : section))

  const primaryName =
    prefs.primaryLanguage === 'none'
      ? t('none')
      : (languages.find((l) => l.code === prefs.primaryLanguage)?.name ??
        prefs.primaryLanguage)
  const secondaryName = prefs.secondaryLanguage
    ? (languages.find((l) => l.code === prefs.secondaryLanguage)?.name ??
      prefs.secondaryLanguage)
    : t('none')

  const enabledDisplay = [
    prefs.displayMode === 'reading'
      ? prefs.readingModeLang === 'arabic'
        ? t('arabic')
        : 'Translation'
      : prefs.primaryLanguage !== 'none' && 'Translation',
    prefs.displayMode !== 'reading' &&
      prefs.arabic &&
      !prefs.wordByWord &&
      t('arabic'),
    prefs.displayMode !== 'reading' &&
      prefs.wordByWord &&
      prefs.transliteration &&
      t('transliteration'),
    prefs.displayMode !== 'reading' && prefs.subtitles && t('subtitles'),
    prefs.footnotes && t('footnotes'),
  ]
    .filter(Boolean)
    .join(', ')

  const langSummary = prefs.secondaryLanguage
    ? `${primaryName} · ${secondaryName}`
    : primaryName

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        if (open) setOpenSection('reading')
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
        <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
          <p className="text-base font-semibold">{t('title')}</p>
          {!isDefaultReadingPreferences(prefs) && (
            <button
              type="button"
              onClick={() => prefs.resetPreferences()}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
            >
              <RotateCcwIcon className="size-3" />
              {t('reset')}
            </button>
          )}
        </div>

        <SizingControls
          fontSize={prefs.fontSize ?? 'md'}
          contentWidth={prefs.contentWidth ?? 'medium'}
          onFontSize={(fontSize) => set({ fontSize })}
          onContentWidth={(contentWidth) => set({ contentWidth })}
        />

        <div>
          <AccordionSection
            id="reading"
            open={openSection === 'reading'}
            onToggle={() => toggle('reading')}
            icon={<TypeIcon className="size-4" />}
            label={t('reading')}
            summary={enabledDisplay || '—'}
          >
            <div className="space-y-0.5 max-h-96 overflow-y-auto">
              {prefs.displayMode === 'reading' && (
                <div className="px-2 py-2 space-y-2">
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
                        {lang === 'translation' ? t('translation') : t('arabic')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {prefs.displayMode !== 'reading' && (
                <>
                  <SettingTile
                    icon={<TypeIcon className="size-3.5" />}
                    label={t('arabic')}
                    description="Original Arabic text"
                    checked={prefs.arabic || prefs.wordByWord}
                    disabled={prefs.wordByWord}
                    onCheckedChange={(checked) => set({ arabic: checked })}
                  />
                  <SettingTile
                    icon={<CaseLowerIcon className="size-3.5" />}
                    label={t('transliteration')}
                    description="In Word mode, show Latin script under each word"
                    checked={prefs.transliteration}
                    onCheckedChange={(checked) =>
                      set({ transliteration: checked })
                    }
                  />
                  <SettingTile
                    icon={<MessageSquareTextIcon className="size-3.5" />}
                    label={t('subtitles')}
                    description="Section titles above verses"
                    checked={prefs.subtitles}
                    onCheckedChange={(checked) => set({ subtitles: checked })}
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
          </AccordionSection>

          <AccordionSection
            id="language"
            open={openSection === 'language'}
            onToggle={() => toggle('language')}
            icon={<LanguagesIcon className="size-4" />}
            label={t('language')}
            summary={langSummary}
          >
            <div className="space-y-2">
              {/* Each tab carries its current selection, so both translations
                  are readable without switching tabs. */}
              <div className="flex gap-1">
                {(
                  [
                    ['primary', t('translation'), primaryName],
                    ['secondary', t('secondTranslation'), secondaryName],
                  ] as const
                ).map(([tab, label, current]) => {
                  const isActive = langTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setLangTab(tab)}
                      className={cn(
                        'flex-1 min-w-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      )}
                    >
                      <span className="truncate max-w-full">{label}</span>
                      <span className="truncate max-w-full text-[10px] font-normal opacity-70">
                        {current}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {langTab === 'primary' ? (
                  <LangList
                    value={prefs.primaryLanguage}
                    nullable
                    languages={languages}
                    onChange={(code) =>
                      set({
                        primaryLanguage:
                          (code as LangCode | undefined) ?? 'none',
                      })
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
          </AccordionSection>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
