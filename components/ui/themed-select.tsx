'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

type ThemedSelectOption = {
  value: string
  label: string
}

interface ThemedSelectProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  options: ThemedSelectOption[]
  disabled?: boolean
  'aria-label'?: string
}

export function ThemedSelect({
  id,
  name,
  value,
  onChange,
  options,
  disabled = false,
  'aria-label': ariaLabel,
}: ThemedSelectProps) {
  const generatedId = useId()
  const selectId = id ?? `themed-select-${generatedId}`
  const listboxId = `${selectId}-listbox`
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((opt) => opt.value === value)
    return index >= 0 ? index : 0
  }, [options, value])

  const currentIndex = activeIndex ?? selectedIndex

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(null)
      }
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function commit(index: number) {
    const next = options[index]
    if (!next) return
    if (next.value !== value) onChange(next.value)
    setOpen(false)
    setActiveIndex(null)
  }

  function move(step: number) {
    const total = options.length
    if (total === 0) return
    const next = (currentIndex + step + total) % total
    setActiveIndex(next)
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(selectedIndex)
      }
      move(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(selectedIndex)
      }
      move(-1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) commit(currentIndex)
      else {
        setOpen(true)
        setActiveIndex(selectedIndex)
      }
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(null)
    }
  }

  const selected = options[selectedIndex]

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
        onClick={() => {
          setOpen((v) => {
            const next = !v
            setActiveIndex(next ? selectedIndex : null)
            return next
          })
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{selected?.label ?? ''}</span>
        <span aria-hidden>▾</span>
      </button>
      {open ? (
        <ul id={listboxId} role="listbox" className="themed-select-listbox">
          {options.map((opt, index) => {
            const isSelected = opt.value === value
            const isActive = index === currentIndex
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
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
      ) : null}
    </div>
  )
}
