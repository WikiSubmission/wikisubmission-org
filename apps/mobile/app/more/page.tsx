import { BookText, ScrollText, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MoreItem {
  key: string
  label: string
  description: string
  icon: LucideIcon
}

const MORE_ITEMS: readonly MoreItem[] = [
  {
    key: 'miracle',
    label: 'Miracle',
    description: 'The mathematical structure of the Quran',
    icon: Sparkles,
  },
  { key: 'articles', label: 'Articles', description: 'Essays and writings', icon: ScrollText },
  { key: 'bible', label: 'Bible', description: 'Coming soon', icon: BookText },
]

export default function MorePage() {
  return (
    <ul className="divide-border mx-auto w-full max-w-md divide-y px-2 py-2">
      {MORE_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.key}>
            <div className="flex items-center gap-3 px-3 py-4 opacity-60">
              <Icon className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground truncate text-xs">{item.description}</p>
              </div>
              <span className="text-muted-foreground ml-auto text-[0.625rem] font-medium tracking-wide uppercase">
                Soon
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
