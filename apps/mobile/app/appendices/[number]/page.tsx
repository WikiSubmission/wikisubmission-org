import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { APPENDICES } from '@/constants/appendices'
import { getAppendixContent } from '@/content/library'

// All 38 appendices are known at build time, so the static export pre-renders
// one page per appendix (the same pattern as the 114 quran chapter pages).
export function generateStaticParams() {
  return APPENDICES.map((a) => ({ number: String(a.number) }))
}

export const dynamicParams = false

export default async function AppendixPage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const n = parseInt(number, 10)

  const appendix = APPENDICES.find((a) => a.number === n)
  if (!appendix) notFound()

  const prev = APPENDICES.find((a) => a.number === n - 1)
  const next = APPENDICES.find((a) => a.number === n + 1)
  const Content = await getAppendixContent(n)

  return (
    <article className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8">
      <header className="flex items-center gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-base font-semibold">
          {appendix.number}
        </span>
        <div>
          <h1 className="text-xl leading-tight font-bold">{appendix.title}</h1>
          {appendix.quranRef ? (
            <p className="text-muted-foreground mt-0.5 font-mono text-sm">[{appendix.quranRef}]</p>
          ) : null}
        </div>
      </header>

      <hr className="border-border/40" />

      {Content ? (
        <div className="space-y-10">
          <Content />
        </div>
      ) : (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Content for this appendix is coming soon.
        </p>
      )}

      <div className="border-border/40 flex items-center justify-between gap-4 border-t pt-4">
        {prev ? (
          <Link
            href={`/appendices/${prev.number}`}
            className="text-muted-foreground hover:text-primary flex min-w-0 items-center gap-2 text-sm transition-colors"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="block text-xs">Appendix {prev.number}</span>
              <span className="font-medium">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/appendices/${next.number}`}
            className="text-muted-foreground hover:text-primary flex min-w-0 items-center gap-2 text-right text-sm transition-colors"
          >
            <span className="truncate">
              <span className="block text-xs">Appendix {next.number}</span>
              <span className="font-medium">{next.title}</span>
            </span>
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  )
}
