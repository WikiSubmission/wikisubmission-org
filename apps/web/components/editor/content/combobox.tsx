'use client'

/**
 * Searchable single-select for the editor's `select` fields.
 *
 * Replaces the native <select> these fields used to render. Two reasons:
 *
 *  1. Chromium paints the native drop-down list with the platform's own
 *     surface, and neither `color-scheme` nor an author `background-color` on
 *     `option` reliably reaches it on Windows — so in dark mode the list came
 *     up white behind light ink and could not be read at all.
 *  2. Author and language lists run to dozens of entries, which is past the
 *     point where scrolling a native list is reasonable.
 *
 * Drawing the list ourselves fixes both: it inherits the editor's tokens like
 * any other surface, and it can filter. Hand-rolled rather than composed from
 * Radix because the repo has no popover primitive, and a menu primitive would
 * fight the text input for arrow keys and typeahead.
 */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { ChevronsUpDownIcon, CheckIcon, SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  value: string
  options: ComboboxOption[]
  disabled?: boolean
  /** Shown on the trigger when nothing is selected. */
  placeholder?: string
  /** Label for assistive tech — the visible <Label> sits outside this control. */
  ariaLabel?: string
  /** Below this many options the filter box is more noise than help. */
  searchThreshold?: number
  onChange: (value: string) => void
  className?: string
}

const EMPTY_OPTION: ComboboxOption = { value: '', label: '—' }

export function Combobox({
  value,
  options,
  disabled = false,
  placeholder = '—',
  ariaLabel,
  searchThreshold = 8,
  onChange,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  // The blank entry is part of the list so "clear this field" is reachable by
  // keyboard and by filter, not only by a separate affordance.
  const all = useMemo(() => [EMPTY_OPTION, ...options], [options])
  const showSearch = options.length >= searchThreshold

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((o) => o.label.toLowerCase().includes(q))
  }, [all, query])

  const selected = all.find((o) => o.value === value) ?? EMPTY_OPTION

  // Open/close are driven from the handlers rather than an effect, so the
  // query reset and the initial highlight happen in the same render as the
  // state change instead of cascading a second one.
  const openPanel = () => {
    setQuery('')
    const i = all.findIndex((o) => o.value === value)
    setActive(i < 0 ? 0 : i)
    setOpen(true)
  }

  const closePanel = () => {
    setOpen(false)
    setQuery('')
  }

  // Close on outside pointer or Escape, and hand focus back to the trigger so
  // tabbing carries on from where it left off.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closePanel()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  useEffect(() => {
    if (open && showSearch) searchRef.current?.focus()
  }, [open, showSearch])

  const commit = (option: ComboboxOption) => {
    onChange(option.value)
    closePanel()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePanel()
      return
    }
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openPanel()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = matches[active]
      if (option) commit(option)
    } else if (e.key === 'Tab') {
      closePanel()
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-[2px] border border-input bg-transparent px-3 py-1 text-left shadow-xs outline-none transition-[color,box-shadow]',
          'font-[family-name:var(--font-source-serif)] text-[17px]',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span
          className={cn(
            'min-w-0 truncate',
            selected.value === '' && 'text-muted-foreground',
          )}
        >
          {selected.value === '' ? placeholder : selected.label}
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" aria-hidden />
      </button>

      {open && (
        <div
          className={cn(
            // Own surface + border so the list is legible in every palette and
            // both modes — this is the whole point of not using a native list.
            'absolute z-50 mt-1 w-full overflow-hidden rounded-[3px] border border-border bg-popover text-popover-foreground shadow-lg',
          )}
        >
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-border px-2.5">
              <SearchIcon
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Search…"
                aria-label="Filter options"
                className="h-9 w-full bg-transparent text-[16px] outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1">
            {matches.length === 0 && (
              <li className="px-2.5 py-2 text-[15px] text-muted-foreground">
                Nothing matches “{query}”.
              </li>
            )}
            {matches.map((option, i) => {
              const isSelected = option.value === value
              return (
                <li key={option.value || '__none'}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => commit(option)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-[2px] px-2.5 py-1.5 text-left font-[family-name:var(--font-source-serif)] text-[16px]',
                      i === active && 'bg-accent text-accent-foreground',
                      option.value === '' && 'text-muted-foreground',
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        'size-3.5 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 truncate">{option.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
