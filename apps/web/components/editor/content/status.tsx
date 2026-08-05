/**
 * Editorial status palette, shared by the content list and the doc form. The
 * three states (draft / unpublished changes / published) keep the brand's quiet
 * status inks defined as --st-* in editor.css — those are semantic beyond what
 * the shadcn token set expresses, so we reference them through arbitrary-value
 * utilities rather than re-inventing the colours.
 */
import type { EditorialContentStatus } from '@/lib/editorial-content-client'

interface StatusMeta {
  label: string
  /** Tailwind class colouring the status dot's background. */
  dot: string
  /** Tailwind class colouring the status label text. */
  text: string
}

export const STATUS_META: Record<EditorialContentStatus, StatusMeta> = {
  draft: { label: 'Draft', dot: 'bg-[var(--st-draft)]', text: 'text-[var(--st-draft)]' },
  changed: {
    label: 'Unpublished changes',
    dot: 'bg-[var(--st-changes)]',
    text: 'text-[var(--st-changes)]',
  },
  published: { label: 'Published', dot: 'bg-[var(--st-pub)]', text: 'text-[var(--st-pub)]' },
}
