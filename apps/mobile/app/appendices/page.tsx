import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { APPENDICES } from '@/constants/appendices'

export default function AppendicesIndexPage() {
  return (
    <ul className="divide-border mx-auto w-full max-w-md divide-y px-2 py-2">
      {APPENDICES.map((appendix) => (
        <li key={appendix.number}>
          <Link
            href={`/appendices/${appendix.number}`}
            className="hover:bg-muted/50 flex items-center gap-3 px-3 py-3.5 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold">
              {appendix.number}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{appendix.title}</p>
              {appendix.quranRef ? (
                <p className="text-muted-foreground font-mono text-xs">[{appendix.quranRef}]</p>
              ) : null}
            </div>
            <ChevronRight
              className="text-muted-foreground/50 ml-auto size-4 shrink-0"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
