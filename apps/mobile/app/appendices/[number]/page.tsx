import { notFound } from 'next/navigation'
import { APPENDICES, resolveAppendixMeta } from '@/constants/appendices'
import { getAppendixContent } from '@/content/library'
import { AppendixMarkdown } from '@/components/library/appendix-markdown'
import { fetchAppendix, hasEditorialBody } from '@/lib/appendices-backend'
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

  // Static export: this read happens at build time, so an /editor change
  // reaches the app on its next release rather than instantly. Rows with no
  // body yet keep rendering the hardcoded components.
  const editorial = await fetchAppendix(n)
  const appendix = resolveAppendixMeta(n, editorial?.title)
  if (!appendix) notFound()

  const prev = resolveAppendixMeta(n - 1)
  const next = resolveAppendixMeta(n + 1)
  const showMarkdown = hasEditorialBody(editorial)
  const Content = showMarkdown ? null : await getAppendixContent(n)

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

      {showMarkdown && editorial ? (
        <AppendixMarkdown content={editorial.body} />
      ) : Content ? (
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
