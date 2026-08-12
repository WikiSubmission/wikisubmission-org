import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { APPENDICES, resolveAppendixMeta, type AppendixMeta } from '@/constants/appendices'
import { fetchAppendices } from '@/lib/appendices-backend'

// Titles come from the editorial store when it has them (edited at /editor),
// falling back to the static list so the index still renders if the backend is
// unreachable at build time.
async function resolveList(): Promise<AppendixMeta[]> {
  const editorial = await fetchAppendices()
  if (editorial.length === 0) return APPENDICES
  const byNumber = new Map(
    editorial.filter((a) => a.number !== null).map((a) => [a.number as number, a.title])
  )
  return APPENDICES.map((a) => resolveAppendixMeta(a.number, byNumber.get(a.number)) ?? a)
}

export default async function AppendicesIndexPage() {
  const appendices = await resolveList()

  return (
    <ul className="divide-border mx-auto w-full max-w-md divide-y px-2 py-2">
      {appendices.map((appendix) => (
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
              className="rtl-flip text-muted-foreground/50 ms-auto size-4 shrink-0"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
