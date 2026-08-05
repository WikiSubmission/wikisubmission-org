import { notFound } from 'next/navigation'
import { APPENDICES } from '@/constants/appendices'
import { getAppendixContent } from '@/content/library'
import { AppendixEmptyState, AppendixPagination } from './appendix-chrome'

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
        <AppendixEmptyState />
      )}

      <AppendixPagination
        prev={prev && { number: prev.number, title: prev.title }}
        next={next && { number: next.number, title: next.title }}
      />
    </article>
  )
}
