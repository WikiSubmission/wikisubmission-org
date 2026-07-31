'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'

type ThemedSelectOption = {
  type?: 'option'
  value: string
  label: string
  disabled?: boolean
}

type ThemedSelectGroup = {
  type: 'group'
  label: string
  options: ThemedSelectOption[]
  disabled?: boolean
}

export type ThemedSelectItem = ThemedSelectOption | ThemedSelectGroup

interface FlatOption {
  value: string
  label: string
  disabled: boolean
  groupLabel?: string
}

interface ThemedSelectProps {
  triggerRef?: ((el: HTMLButtonElement | null) => void) | undefined
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  options: ThemedSelectItem[]
  disabled?: boolean
  placeholder?: string
  'aria-label'?: string
}

function normalizeOptions(items: ThemedSelectItem[]): FlatOption[] {
  const flat: FlatOption[] = []
  for (const item of items) {
    if (item.type === 'group') {
      for (const option of item.options) {
        flat.push({
          value: option.value,
          label: option.label,
          disabled: item.disabled || option.disabled || false,
          groupLabel: item.label,
        })
      }
      continue
    }
    flat.push({
      value: item.value,
      label: item.label,
      disabled: item.disabled || false,
    })
  }
  return flat
}

function firstEnabledIndex(options: FlatOption[]): number {
  return options.findIndex((opt) => !opt.disabled)
}

interface MenuPosition {
  top: number
  left: number
  minWidth: number
  maxHeight: number
  dropUp: boolean
}

const MENU_GAP = 6
const VIEWPORT_MARGIN = 8

/**
 * The listbox renders in a portal on <body>, so it is never clipped by an
 * ancestor with `overflow: hidden`. That means its coordinates have to be
 * measured off the trigger each time it opens (and on scroll/resize).
 */
function measureMenu(trigger: HTMLButtonElement): MenuPosition {
  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN
  const spaceAbove = rect.top - MENU_GAP - VIEWPORT_MARGIN
  const dropUp = spaceBelow < 160 && spaceAbove > spaceBelow
  return {
    top: dropUp ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
    left: rect.left,
    minWidth: rect.width,
    maxHeight: Math.max(120, dropUp ? spaceAbove : spaceBelow),
    dropUp,
  }
}

export function ThemedSelect({
  id,
  name,
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
  'aria-label': ariaLabel,
  triggerRef,
}: ThemedSelectProps) {
  const generatedId = useId()
  const selectId = id ?? `themed-select-${generatedId}`
  const listboxId = `${selectId}-listbox`
  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const listboxRef = useRef<HTMLUListElement | null>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [searchBuffer, setSearchBuffer] = useState('')

  const flatOptions = useMemo(() => normalizeOptions(options), [options])

  const selectedIndex = useMemo(() => {
    const index = flatOptions.findIndex((opt) => opt.value === value)
    if (index >= 0) return index
    return firstEnabledIndex(flatOptions)
  }, [flatOptions, value])

  const currentIndex = activeIndex ?? selectedIndex

  useEffect(() => {
    if (!searchBuffer) return
    const timer = window.setTimeout(() => setSearchBuffer(''), 450)
    return () => window.clearTimeout(timer)
  }, [searchBuffer])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setPosition(null)
    setActiveIndex(null)
    setSearchBuffer('')
  }, [])

  const openMenu = useCallback(() => {
    const trigger = buttonRef.current
    if (!trigger) return
    setPosition(measureMenu(trigger))
    setOpen(true)
    setSearchBuffer('')
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (listboxRef.current?.contains(target)) return
      closeMenu()
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [closeMenu])

  // Keep the portalled menu glued to the trigger while the page moves.
  useEffect(() => {
    if (!open) return
    function reposition() {
      const trigger = buttonRef.current
      if (!trigger) return
      setPosition(measureMenu(trigger))
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  function commit(index: number) {
    const next = flatOptions[index]
    if (!next || next.disabled) return
    if (next.value !== value) onChange(next.value)
    closeMenu()
  }

  function findNextEnabled(start: number, step: number): number {
    const total = flatOptions.length
    if (total === 0) return -1
    let index = start
    for (let i = 0; i < total; i += 1) {
      index = (index + step + total) % total
      if (!flatOptions[index]?.disabled) return index
    }
    return -1
  }

  function move(step: number) {
    if (flatOptions.length === 0) return
    const next = findNextEnabled(currentIndex, step)
    if (next >= 0) setActiveIndex(next)
  }

  function jumpToEdge(edge: 'start' | 'end') {
    if (flatOptions.length === 0) return
    const candidate =
      edge === 'start'
        ? flatOptions.findIndex((opt) => !opt.disabled)
        : (() => {
            for (let i = flatOptions.length - 1; i >= 0; i -= 1) {
              if (!flatOptions[i]?.disabled) return i
            }
            return -1
          })()
    if (candidate >= 0) setActiveIndex(candidate)
  }

  function typeAhead(char: string) {
    const nextBuffer = `${searchBuffer}${char.toLowerCase()}`
    setSearchBuffer(nextBuffer)
    const start = currentIndex >= 0 ? currentIndex : -1
    const total = flatOptions.length
    for (let i = 1; i <= total; i += 1) {
      const idx = (start + i) % total
      const opt = flatOptions[idx]
      if (!opt || opt.disabled) continue
      if (opt.label.toLowerCase().startsWith(nextBuffer)) {
        setActiveIndex(idx)
        if (!open) {
          onChange(opt.value)
        }
        return
      }
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        openMenu()
        setActiveIndex(selectedIndex)
      }
      move(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openMenu()
        setActiveIndex(selectedIndex)
      }
      move(-1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      if (!open) openMenu()
      jumpToEdge('start')
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      if (!open) openMenu()
      jumpToEdge('end')
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) commit(currentIndex)
      else {
        openMenu()
        setActiveIndex(selectedIndex)
      }
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      closeMenu()
      return
    }
    if (event.key.length === 1 && /\S/.test(event.key)) {
      typeAhead(event.key)
    }
  }

  const selected = selectedIndex >= 0 ? flatOptions[selectedIndex] : null

  const menuStyle: CSSProperties | undefined = position
    ? {
        top: position.top,
        left: position.left,
        minWidth: position.minWidth,
        maxHeight: position.maxHeight,
        transform: position.dropUp ? 'translateY(-100%)' : undefined,
      }
    : undefined

  return (
    <div ref={rootRef} className="themed-select">
      <input type="hidden" id={selectId} name={name} value={selected?.value ?? ''} />
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="themed-select-trigger"
        ref={(el) => {
          buttonRef.current = el
          triggerRef?.(el)
        }}
        onClick={() => {
          if (open) {
            closeMenu()
            return
          }
          openMenu()
          setActiveIndex(selectedIndex)
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{selected?.label ?? placeholder ?? ''}</span>
        <span aria-hidden>▾</span>
      </button>
      {open && position
        ? createPortal(
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              className="themed-select-listbox"
              style={menuStyle}
            >
              {options.map((item, groupIndex) => {
                if (item.type === 'group') {
                  return (
                    <li
                      key={`group-${item.label}-${groupIndex}`}
                      className="themed-select-group-wrap"
                    >
                      <div className="themed-select-group-label">{item.label}</div>
                      <ul className="themed-select-group-list" role="presentation">
                        {item.options.map((opt) => {
                          const index = flatOptions.findIndex(
                            (candidate) =>
                              candidate.value === opt.value && candidate.groupLabel === item.label,
                          )
                          const isSelected = opt.value === value
                          const isActive = index === currentIndex
                          const isDisabled = item.disabled || opt.disabled
                          return (
                            <li key={`${item.label}-${opt.value}`}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={isDisabled}
                                disabled={isDisabled}
                                className={`themed-select-option${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => commit(index)}
                              >
                                {opt.label}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                }

                const index = flatOptions.findIndex(
                  (opt) => opt.value === item.value && !opt.groupLabel,
                )
                const isSelected = item.value === value
                const isActive = index === currentIndex
                const isDisabled = item.disabled
                return (
                  <li key={item.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                      disabled={isDisabled}
                      className={`themed-select-option${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commit(index)}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
