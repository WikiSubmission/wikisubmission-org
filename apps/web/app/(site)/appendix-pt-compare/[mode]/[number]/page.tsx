/**
 * TEMPORARY fidelity harness. Delete with the rest of the compare rig.
 *
 * Renders one appendix twice — /tsx from the hardcoded component, /pt from the
 * converted Portable Text — inside the same article shell the real appendix
 * page uses, minus ArticleAnimations. GSAP is left out on purpose: its scroll
 * driven reveals and parallax make a full-page screenshot depend on scroll
 * history, which would add noise to a pixel diff without testing anything the
 * DOM comparison does not already cover.
 */
import { notFound } from 'next/navigation'

import { getAppendixContent } from '@/content/library'
import { AppendixPortableText } from '@/components/library/appendix-portable-text'
import { AppendixVideo } from '@/components/library/appendix-video'
import type { AppendixBlock } from '@/lib/appendix-portable-text'

import appendix24 from '@/appendix-pt-fixtures/appendix-24.json'
import appendix26 from '@/appendix-pt-fixtures/appendix-26.json'
import appendix33 from '@/appendix-pt-fixtures/appendix-33.json'

interface Fixture {
  code: string
  body_pt: unknown
  video_id: string | null
  video_title: string | null
}

const FIXTURES: Record<string, Fixture> = {
  '24': appendix24 as Fixture,
  '26': appendix26 as Fixture,
  '33': appendix33 as Fixture,
}

export function generateStaticParams() {
  return Object.keys(FIXTURES).flatMap((number) =>
    ['tsx', 'pt'].map((mode) => ({ mode, number })),
  )
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ mode: string; number: string }>
}) {
  const { mode, number } = await params
  const fixture = FIXTURES[number]
  if (!fixture || (mode !== 'tsx' && mode !== 'pt')) notFound()

  const Content = mode === 'tsx' ? await getAppendixContent(Number(number)) : null

  return (
    <main className="min-h-screen py-16 px-4">
      <article id="compare-body" className="max-w-2xl mx-auto space-y-10">
        {mode === 'tsx' ? (
          Content ? (
            <Content />
          ) : null
        ) : (
          <>
            <AppendixPortableText blocks={fixture.body_pt as AppendixBlock[]} />
            <AppendixVideo
              videoId={fixture.video_id ?? undefined}
              videoTitle={fixture.video_title ?? undefined}
            />
          </>
        )}
      </article>
    </main>
  )
}
