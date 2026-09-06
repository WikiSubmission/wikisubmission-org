'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AArrowDownIcon,
  AArrowUpIcon,
  BookOpenIcon,
  BookOpenTextIcon,
  CaseLowerIcon,
  CheckIcon,
  ChevronDownIcon,
  HashIcon,
  LanguagesIcon,
  ListIcon,
  MessageSquareTextIcon,
  RotateCcwIcon,
  ScanTextIcon,
  SettingsIcon,
  TypeIcon,
} from 'lucide-react'
import {
  isDefaultReadingPreferences,
  useQuranPreferences,
} from '@/hooks/use-quran-preferences'
import type { LangCode, ReadingModeLang } from '@/hooks/use-quran-preferences'
import {
  useQuranDisplayMode,
  type QuranModeId,
} from '@/hooks/use-quran-display-mode'
import {
  CONTENT_WIDTHS,
  FONT_SIZES,
  FONT_SIZE_PX,
  LINE_SPACINGS,
  type ContentWidth,
  type FontSize,
  type LineSpacing,
} from '@/lib/quran-typography'
import { LanguageEntry, useLanguagesStore } from '@/hooks/use-languages-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useReadingBlocked } from './use-reading-blocked'

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

const SPACING_LABEL_KEYS: Record<LineSpacing, string> = {
  tight: 'spacingTight',
  normal: 'spacingNormal',
  relaxed: 'spacingRelaxed',
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

/** Label + segmented choices, the shape every sizing control in here uses. */
function SegmentedRow<T extends string>({
  label,
  options,
  value,
  onChange,
  optionLabel,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  optionLabel: (option: T) => string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
        {options.map((option) => {
          const isActive = value === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option)}
              className={cn(
                'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {optionLabel(option)}
            </button>
          )
        })}
      </div>
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
 * Verse / word / reading, at the top of the panel.
 *
 * The mode decides which of the toggles below even apply, so reading the panel
 * without it meant watching rows appear and disappear for no visible reason.
 * `useQuranDisplayMode` is the same hook the header's segmented control uses.
 */
function ModeRow() {
  const t = useTranslations('quran')
  const tSettings = useTranslations('settings')
  const readingBlocked = useReadingBlocked()
  const { activeMode, setMode } = useQuranDisplayMode({ readingBlocked })

  const MODES: { id: QuranModeId; label: string; icon: React.ReactNode }[] = [
    { id: 'verse', label: t('modeVerse'), icon: <ListIcon className="size-3.5" /> },
    { id: 'word', label: t('modeWord'), icon: <ScanTextIcon className="size-3.5" /> },
    {
      id: 'reading',
      label: t('modeReading'),
      icon: <BookOpenIcon className="size-3.5" />,
    },
  ]

  return (
    <div className="border-b px-3 py-3 space-y-2">
      <span className="text-sm font-medium">{tSettings('mode')}</span>
      <div className="flex gap-1">
        {MODES.map((mode) => {
          const isActive = activeMode === mode.id
          const disabled = mode.id === 'reading' && readingBlocked
          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              title={disabled ? t('modeReadingBlocked') : undefined}
              aria-pressed={isActive}
              onClick={() => void setMode(mode.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none',
                isActive
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
              )}
            >
              {mode.icon}
              {mode.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Text size, line spacing and column width, always visible above the accordions.
 *
 * These are the settings a reader reaches for most often and the only ones whose
 * effect is instant, so they are one click away rather than behind a section —
 * and they are independent: large text in a narrow column is a normal thing to
 * want. The preview renders the real pixel sizes, so the choice reads the same
 * as the page behind the panel.
 */
function SizingControls({
  fontSize,
  lineSpacing,
  contentWidth,
  onFontSize,
  onLineSpacing,
  onContentWidth,
}: {
  fontSize: FontSize
  lineSpacing: LineSpacing
  contentWidth: ContentWidth
  onFontSize: (size: FontSize) => void
  onLineSpacing: (spacing: LineSpacing) => void
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

      <SegmentedRow
        label={t('lineSpacing')}
        options={LINE_SPACINGS}
        value={lineSpacing}
        onChange={onLineSpacing}
        optionLabel={(spacing) => t(SPACING_LABEL_KEYS[spacing])}
      />

      {/* Column width only bites on wide viewports — hide it where every step
          would render identically. */}
      <div className="hidden lg:block">
        <SegmentedRow
          label={t('readingWidth')}
          options={CONTENT_WIDTHS}
          value={contentWidth}
          onChange={onContentWidth}
          optionLabel={(width) => t(WIDTH_LABEL_KEYS[width])}
        />
      </div>
    </div>
  )
}

/**
 * The panel itself, rendered inside a dropdown on desktop and a bottom sheet on
 * phones. Everything it needs comes from the preferences store, so the two
 * containers stay pure layout.
 *
 * The heading is passed in because the sheet needs it to be its `SheetTitle`:
 * rendering a separate off-screen title would have a screen reader announce
 * "Settings" twice.
 */
function SettingsPanel({ heading }: { heading: React.ReactNode }) {
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
        : t('translation')
      : prefs.primaryLanguage !== 'none' && t('translation'),
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
    <>
      <div className="flex items-center justify-between gap-2 px-3 pe-10 pt-3 pb-2">
        {heading}
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

      <ModeRow />

      <SizingControls
        fontSize={prefs.fontSize ?? 'md'}
        lineSpacing={prefs.lineSpacing ?? 'normal'}
        contentWidth={prefs.contentWidth ?? 'medium'}
        onFontSize={(fontSize) => set({ fontSize })}
        onLineSpacing={(lineSpacing) => set({ lineSpacing })}
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
                  description={t('arabicDescription')}
                  checked={prefs.arabic || prefs.wordByWord}
                  disabled={prefs.wordByWord}
                  onCheckedChange={(checked) => set({ arabic: checked })}
                />
                {/* Transliteration only renders in word mode, and the mode row
                    above is right there, so it is hidden rather than explained. */}
                {prefs.wordByWord && (
                  <SettingTile
                    icon={<CaseLowerIcon className="size-3.5" />}
                    label={t('transliteration')}
                    description={t('transliterationDescription')}
                    checked={prefs.transliteration}
                    onCheckedChange={(checked) =>
                      set({ transliteration: checked })
                    }
                  />
                )}
                <SettingTile
                  icon={<MessageSquareTextIcon className="size-3.5" />}
                  label={t('subtitles')}
                  description={t('subtitlesDescription')}
                  checked={prefs.subtitles}
                  onCheckedChange={(checked) => set({ subtitles: checked })}
                />
              </>
            )}

            <SettingTile
              icon={<BookOpenTextIcon className="size-3.5" />}
              label={t('footnotes')}
              description={t('footnotesDescription')}
              checked={prefs.footnotes}
              onCheckedChange={(checked) => set({ footnotes: checked })}
            />

            {prefs.displayMode === 'reading' && (
              <SettingTile
                icon={<HashIcon className="size-3.5" />}
                label={t('verseNumbers')}
                description={t('verseNumbersDescription')}
                checked={prefs.showVerseNumbers}
                onCheckedChange={(checked) => set({ showVerseNumbers: checked })}
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
                      primaryLanguage: (code as LangCode | undefined) ?? 'none',
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
    </>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function QuranSettings() {
  const t = useTranslations('settings')
  // A 320px dropdown anchored to a toolbar icon is a poor target on a phone;
  // the same panel opens as a bottom sheet there instead. `useIsMobile` reports
  // false until it has measured, which is the desktop path — the trigger is the
  // same either way, so there is nothing to flash.
  const isMobile = useIsMobile()

  const trigger = (
    <Button variant="outline" aria-label="Open settings" size="icon-sm">
      <SettingsIcon />
    </Button>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          aria-describedby={undefined}
          className="max-h-[85vh] overflow-y-auto gap-0 rounded-t-xl pb-6"
        >
          <SettingsPanel
            heading={
              <SheetTitle className="text-base font-semibold">
                {t('title')}
              </SheetTitle>
            }
          />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-0 overflow-hidden"
        align="end"
        sideOffset={6}
      >
        <SettingsPanel
          heading={<p className="text-base font-semibold">{t('title')}</p>}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
