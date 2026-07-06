import Link from 'next/link'
import {
  BookMarked,
  BookText,
  ChevronRight,
  ListOrdered,
  Megaphone,
  ScrollText,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MoreItem {
  key: string
  label: string
  description: string
  icon: LucideIcon
  href?: string
}

const MORE_ITEMS: readonly MoreItem[] = [
  {
    key: 'miracle',
    label: 'Miracle',
    description: 'The mathematical structure of the Quran',
    icon: Sparkles,
    href: '/more/miracle',
  },
  {
    key: 'articles',
    label: 'Articles',
    description: 'Essays and writings',
    icon: ScrollText,
    href: '/more/articles',
  },
  {
    key: 'introduction',
    label: 'Introduction',
    description: 'Introduction to Quran: The Final Testament',
    icon: BookMarked,
    href: '/introduction',
  },
  {
    key: 'proclamation',
    label: 'Proclamation',
    description: 'One unified religion for all the people',
    icon: Megaphone,
    href: '/proclamation',
  },
  {
    key: 'appendices',
    label: 'Appendices',
    description: 'All 38 appendices of the Final Testament',
    icon: ListOrdered,
    href: '/appendices',
  },
  { key: 'bible', label: 'Bible', description: 'Coming soon', icon: BookText },
]

export default function MorePage() {
  return (
    <ul className="divide-border mx-auto w-full max-w-md divide-y px-2 py-2">
      {MORE_ITEMS.map((item) => {
        const Icon = item.icon
        const body = (
          <>
            <Icon className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-medium">{item.label}</p>
              <p className="text-muted-foreground truncate text-xs">{item.description}</p>
            </div>
            {item.href ? (
              <ChevronRight className="text-muted-foreground/50 ml-auto size-4" aria-hidden="true" />
            ) : (
              <span className="text-muted-foreground ml-auto text-[0.625rem] font-medium tracking-wide uppercase">
                Soon
              </span>
            )}
          </>
        )

        return (
          <li key={item.key}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:bg-muted/50 flex items-center gap-3 px-3 py-4 transition-colors"
              >
                {body}
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-3 py-4 opacity-60">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
