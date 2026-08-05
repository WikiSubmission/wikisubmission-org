import type { LucideIcon } from 'lucide-react'

interface PlaceholderScreenProps {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Temporary screen body used by tab roots whose real content is ported in a
 * later Phase 5 slice. Centers within the shell's body region.
 */
export function PlaceholderScreen({ icon: Icon, title, description }: PlaceholderScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <Icon className="text-muted-foreground/60 size-10" aria-hidden="true" />
      <h2 className="font-display text-xl">{title}</h2>
      <p className="text-muted-foreground max-w-xs text-sm">{description}</p>
    </div>
  )
}
