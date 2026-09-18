'use client'

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import {
  parseReadingSettings,
  readingSettingsStore,
  READING_ALIGN_OPTIONS,
  READING_MEASURE_OPTIONS,
  READING_SIZE_OPTIONS,
  type ReadingSettings,
} from './reading-settings'

interface EditorialReaderProps {
  children: ReactNode
  header: ReactNode
  title?: string
  prevSlug?: string
  nextSlug?: string
  backHref?: string
}

export function EditorialReader({
  children,
  header,
  title,
  prevSlug,
  nextSlug,
  backHref = '/blog',
}: EditorialReaderProps) {
  const snapshot = useSyncExternalStore(
    readingSettingsStore.subscribe,
    readingSettingsStore.getSnapshot,
    readingSettingsStore.getServerSnapshot
  )
  const settings = useMemo(() => parseReadingSettings(snapshot), [snapshot])

  const [panelOpen, setPanelOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const update = useCallback(
    (patch: Partial<ReadingSettings>) => {
      readingSettingsStore.write({ ...settings, ...patch })
    },
    [settings]
  )

  useEffect(() => {
    if (!panelOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setPanelOpen(false)
      triggerRef.current?.focus()
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      setPanelOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [panelOpen])

  // Measure sizing: generous book spread matching makingsoftware
  const sheetWidthClass = settings.measure === 'wide' ? 'max-w-[1260px]' : 'max-w-[1100px]'
  const proseWidthClass = settings.measure === 'wide' ? '[&_p]:max-w-[960px]' : '[&_p]:max-w-[820px]'

  const fontSizeClass =
    settings.size === 's'
      ? '[&_p]:text-[15.5px] [&_p]:leading-[1.72]'
      : settings.size === 'l'
        ? '[&_p]:text-[20px] [&_p]:leading-[1.82]'
        : '[&_p]:text-[17.5px] [&_p]:leading-[1.78]'

  const alignClass = settings.align === 'justify' ? '[&_p]:text-justify [&_p]:[text-justify:inter-word]' : '[&_p]:text-left'

  return (
    <div className={`mx-auto ${sheetWidthClass} transition-[max-width] duration-200`}>
      {/* ── Top Toolbar (Positioned ABOVE the sheet on the desk, matching Making Software) ── */}
      <div className="mb-6 flex items-center justify-between gap-3 px-1 py-1">
        {/* Left Breadcrumb & Prev/Next Arrows */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-1 text-[var(--ed-fg-muted)]">
            {prevSlug ? (
              <Link
                href={`/blog/${prevSlug}`}
                aria-label="Previous article"
                className="p-1.5 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="p-1.5 opacity-25">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
            {nextSlug ? (
              <Link
                href={`/blog/${nextSlug}`}
                aria-label="Next article"
                className="p-1.5 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="p-1.5 opacity-25">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="min-w-0 truncate font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.14em] text-[var(--ed-fg-muted)]">
            <Link href={backHref} className="hover:text-[var(--ed-fg)] transition-colors">
              ARTICLES
            </Link>
            {title && (
              <>
                <span className="mx-2 text-[var(--ed-rule)]">/</span>
                <span className="text-[var(--ed-fg)] font-semibold truncate">{title}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Reading Settings Trigger */}
        <div className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-controls={panelId}
            aria-label="Customize typography and reading view"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--ed-rule)]/70 bg-[var(--ed-surface)] text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-accent)] transition-colors shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {/* Settings Popover */}
          {panelOpen && (
            <div
              ref={panelRef}
              id={panelId}
              role="group"
              aria-label="Reading settings"
              className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-4 shadow-2xl text-[var(--ed-fg)] backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--ed-rule)]">
                <span className="font-[family-name:var(--font-glacial)] text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]">
                  Reading Options
                </span>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
                >
                  <X size={13} />
                </button>
              </div>

              <SettingRow
                label="Type Size"
                options={READING_SIZE_OPTIONS}
                value={settings.size}
                onChange={(value) => update({ size: value })}
              />
              <SettingRow
                label="Sheet Measure"
                options={READING_MEASURE_OPTIONS}
                value={settings.measure}
                onChange={(value) => update({ measure: value })}
              />
              <SettingRow
                label="Alignment"
                options={READING_ALIGN_OPTIONS}
                value={settings.align}
                onChange={(value) => update({ align: value })}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── The Physical Page Sheet ──────────────────────────────────────────────
          Modeled precisely after makingsoftware.com:
          - Pure crisp paper white on light desk (or rich warm dark sheet)
          - Tactile drop shadow casting a realistic page shade onto the desk surface
          - Sharp micro-bevel corners (rounded-[2px])
          - Generous internal padding (px-8 sm:px-14 md:px-20 md:py-24)
          - Centered text measure
      ──────────────────────────────────────────────────────────────────────────── */}
      <article
        id="main-article"
        className={`bg-white dark:bg-[#1C1814] rounded-[3px] border border-black/[0.08] dark:border-white/[0.1] px-7 py-12 sm:px-14 sm:py-18 md:px-20 md:py-24 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_16px_36px_rgba(0,0,0,0.09),0_1px_1px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.7),0_24px_55px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-200 mb-28 ring-1 ring-black/[0.03] dark:ring-white/[0.04]`}
      >
        {header}
        
        <div
          data-article-content
          className={`${fontSizeClass} ${alignClass} ${proseWidthClass} font-[family-name:var(--font-source-serif)] text-[var(--ed-fg)] [&_p]:mx-auto [&_p]:mb-6 [&_p]:tracking-normal`}
        >
          {children}
        </div>
      </article>
    </div>
  )
}

interface SettingRowProps<T extends string> {
  label: string
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}

function SettingRow<T extends string>({ label, options, value, onChange }: SettingRowProps<T>) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 font-[family-name:var(--font-glacial)] text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ed-fg-muted)]">
        {label}
      </p>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`flex-1 rounded border px-2 py-1 font-[family-name:var(--font-jetbrains)] text-[11px] font-medium transition-colors ${
              value === option.value
                ? 'border-[var(--ed-accent)] bg-[var(--ed-accent)]/15 text-[var(--ed-accent)] font-bold'
                : 'border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
