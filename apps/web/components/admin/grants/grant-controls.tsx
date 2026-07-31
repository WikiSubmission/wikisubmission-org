'use client'

/**
 * Presentational primitives for the access console's grant rows. Extracted from
 * the former /editor/admin grant editor so the unified console at /admin/access
 * can reuse them unchanged.
 *
 * Built on shadcn primitives over semantic tokens; the brand type is preserved
 * via font-family utilities. Nothing here makes an access decision — callers own
 * the state and the save.
 */
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/** None / Read / Write, the shape every grant in this model takes. */
export type GrantLevel = 'none' | 'read' | 'write'

export function GrantSectionHeading({
  children,
  hint,
}: {
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="mt-[18px] mb-3 flex items-baseline gap-3 border-b border-border pb-2">
      <h3 className="font-[family-name:var(--font-cormorant)] text-[23px] leading-none text-foreground">
        {children}
      </h3>
      {hint && (
        <span className="ml-auto font-[family-name:var(--font-jetbrains)] text-[12.5px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
}

export function GrantRow({
  label,
  labelWidth = 'w-[130px]',
  indent = false,
  children,
}: {
  label: string
  labelWidth?: string
  /** Marks a sub-grant (a version or a game) as nested under its parent row. */
  indent?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn('flex items-center gap-3 py-1.5', indent && 'pl-5')}>
      <span
        className={cn(
          'shrink-0 truncate text-[15.5px] text-foreground',
          labelWidth
        )}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

export function TriState({
  value,
  disabled,
  onChange,
}: {
  value: GrantLevel
  disabled: boolean
  onChange: (v: GrantLevel) => void
}) {
  const options: Array<{ v: GrantLevel; label: string }> = [
    { v: 'none', label: 'None' },
    { v: 'read', label: 'Read' },
    { v: 'write', label: 'Write' },
  ]
  return (
    <span className="inline-flex gap-1.5">
      {options.map(({ v, label }) => (
        <Chip
          key={v}
          active={value === v}
          disabled={disabled}
          onClick={() => onChange(v)}
        >
          {label}
        </Chip>
      ))}
    </span>
  )
}

export function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      disabled={disabled}
      onClick={onClick}
      className="h-8 font-[family-name:var(--font-glacial)] text-[12px] uppercase tracking-[0.1em]"
    >
      {children}
    </Button>
  )
}

export function NativeSelect({
  value,
  disabled,
  onChange,
  className,
  children,
}: {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  className?: string
  children: ReactNode
}) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-[2px] border border-input bg-transparent px-3 py-1 font-[family-name:var(--font-source-serif)] text-[16px] shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className
      )}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  )
}
