/**
 * Shared page chrome for the editor content + admin screens, migrated onto
 * semantic shadcn tokens. Replaces the old `.dh*` / `s.crumb` editor.css classes
 * with `text-foreground` / `text-muted-foreground` / `border` etc., while
 * preserving the editorial brand type: glacial eyebrows, a Cormorant display
 * heading, Source Serif body. Server component — no interactivity here.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeftIcon } from 'lucide-react'

interface EditorCrumbProps {
  href: string
  children: ReactNode
}

export function EditorCrumb({ href, children }: EditorCrumbProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 font-[family-name:var(--font-glacial)] text-[12px] uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-3.5" aria-hidden />
      {children}
    </Link>
  )
}

interface EditorPageHeaderProps {
  eyebrow: string
  title: ReactNode
  /** Small count/annotation rendered inline after the title. */
  meta?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function EditorPageHeader({
  eyebrow,
  title,
  meta,
  description,
  actions,
}: EditorPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start gap-x-5 gap-y-3">
      <div className="min-w-0 flex-1">
        <p className="font-[family-name:var(--font-glacial)] text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-2 flex flex-wrap items-baseline gap-x-3 font-[family-name:var(--font-cormorant)] text-[28px] leading-[1.08] text-foreground sm:text-[36px] sm:leading-[1.05]">
          <span className="min-w-0">{title}</span>
          {meta && (
            <span className="font-[family-name:var(--font-jetbrains)] text-[12.5px] font-normal tracking-normal text-muted-foreground">
              {meta}
            </span>
          )}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-[60ch] text-[16.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  )
}
