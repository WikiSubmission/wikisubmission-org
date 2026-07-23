import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react'
import { Metadata } from 'next'
import { APPENDICES, appendixPdfUrl } from '@/constants/appendices'
import { buildPageMetadata } from '@/constants/metadata'
import { ArticleAnimations } from '@/components/article-animations'
import { getAppendixContent } from '@/content/library'

interface Props {
  params: Promise<{ number: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params
  const n = parseInt(number, 10)
  const appendix = APPENDICES.find((a) => a.number === n)
  if (!appendix) return {}

  return buildPageMetadata({
    title: `Appendix ${appendix.number}: ${appendix.title} | WikiSubmission`,
    description: `Appendix ${appendix.number} of the Final Testament — ${appendix.title}.`,
    url: `/appendices/${appendix.number}`,
  })
}

export function generateStaticParams() {
  return APPENDICES.map((a) => ({ number: String(a.number) }))
}

export default async function AppendixPage({ params }: Props) {
  const { number } = await params
  const n = parseInt(number, 10)

  if (isNaN(n) || n < 1 || n > 38) notFound()

  const appendix = APPENDICES.find((a) => a.number === n)
  if (!appendix) notFound()

  const prev = APPENDICES.find((a) => a.number === n - 1)
  const next = APPENDICES.find((a) => a.number === n + 1)

  // Content components live in packages/shared/content/library (shared with
  // the mobile app); the registry lazy-loads one appendix per page and returns
  // null (→ "coming soon" shell) if a file is ever absent.
  const Content = await getAppendixContent(n)

  return (
    <ArticleAnimations>
      <main className="min-h-screen py-16 px-4">
        <article className="max-w-2xl mx-auto space-y-10">
          {/* ── Header ───────────────────────────────────────────────────────── */}
          <header className="space-y-3">
            <Link
              href="/quran#appendices"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="size-3.5 rtl-flip" />
              All Appendices
            </Link>
            <div className="flex items-center gap-3 pt-1">
              <span className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary font-mono text-base font-semibold shrink-0">
                {appendix.number}
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  {appendix.title}
                </h1>
                {appendix.quranRef && (
                  <p className="text-sm text-muted-foreground font-mono mt-0.5">
                    [{appendix.quranRef}]
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <a
                    href={appendixPdfUrl(appendix.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <FileText className="size-3.5" />
                    Read
                  </a>
                  <span className="text-border/60 text-xs">·</span>
                  <a
                    href={appendixPdfUrl(appendix.number)}
                    download
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Download className="size-3.5" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </header>

          <hr className="border-border/40" />

          {/* ── Content ──────────────────────────────────────────────────────── */}
          {Content ? (
            <Content />
          ) : (
            <section className="rounded-xl border border-border/60 bg-surface-container-lowest p-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Content for this appendix is coming soon.
              </p>
              <Link
                href="/quran#appendices"
                className="text-xs text-primary hover:underline"
              >
                Browse all appendices →
              </Link>
            </section>
          )}

          {/* ── Prev / Next navigation ────────────────────────────────────────── */}
          <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-4">
            {prev ? (
              <Link
                href={`/appendices/${prev.number}`}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-w-0"
              >
                <ChevronLeft className="size-4 shrink-0 rtl-flip" />
                <span className="truncate">
                  <span className="text-xs block">Appendix {prev.number}</span>
                  <span className="font-medium">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}

            {next ? (
              <Link
                href={`/appendices/${next.number}`}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-w-0 text-right"
              >
                <span className="truncate">
                  <span className="text-xs block">Appendix {next.number}</span>
                  <span className="font-medium">{next.title}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 rtl-flip" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </article>
      </main>
    </ArticleAnimations>
  )
}
