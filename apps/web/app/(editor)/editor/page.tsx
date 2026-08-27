import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  canReadModule,
  canWriteModule,
  hasEditorWorkspaceAccess,
} from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

// Display label + a plain-language line about what lives in each module. The
// keys mirror the backend module enum; the wording is aimed at the people who
// write the site, not at the permission model behind it.
const MODULE_INFO: Record<string, { label: string; blurb: string }> = {
  quran: {
    label: 'Quran',
    blurb:
      'Translations, chapter titles, verse text and word-by-word meanings.',
  },
  article: {
    label: 'Articles',
    blurb: 'Write, translate and publish articles for the site.',
  },
  bible: { label: 'Bible', blurb: 'Books, chapters and verse translations.' },
  community: {
    label: 'Communities',
    blurb: 'The local groups and online communities listed on the site.',
  },
  author: {
    label: 'Authors',
    blurb: 'Bylines and profiles for the people who write here.',
  },
  appendix: {
    label: 'Appendices',
    blurb: 'The appendices that accompany a Quran translation.',
  },
}

const MODULE_ORDER = [
  'quran',
  'article',
  'bible',
  'community',
  'author',
  'appendix',
]

export default async function EditorLandingPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor')
  const editorial = await getEditorialSession(session.accessToken)
  // Mirrors the layout gate: a games-only editor holds a snapshot but has no
  // workspace here, so they would see an empty grid.
  if (!editorial || !hasEditorWorkspaceAccess(editorial)) redirect('/')

  const accessible = MODULE_ORDER.filter((key) => canReadModule(editorial, key))

  // First name where we have one, so the page opens like a greeting rather
  // than a control panel. Falls back to a plain title for accounts with no
  // name on file.
  const firstName = (session.user?.name ?? '').trim().split(/\s+/)[0]
  const greeting = firstName ? `Welcome back, ${firstName}` : 'Your workspace'

  return (
    <section className="ed-page-wide px-4 pt-6 pb-24 sm:px-9 sm:pt-8">
      <header className="mb-7">
        <p className="font-[family-name:var(--font-glacial)] text-[12.5px] uppercase tracking-[0.14em] text-muted-foreground">
          WikiSubmission
        </p>
        <h1 className="mt-1.5 mb-2.5 font-[family-name:var(--font-cormorant)] text-[31px] leading-[1.06] text-foreground sm:text-[40.5px] sm:leading-[1.05]">
          {greeting}
        </h1>
        <p className="max-w-xl text-[16.5px] leading-relaxed text-muted-foreground">
          This is where the site&apos;s content is written and kept up to date.
          Pick a section below to get started. Your changes are saved as a draft
          first, so nothing reaches readers until it is published.
        </p>
      </header>

      {accessible.length === 0 ? (
        <p className="max-w-xl text-[16.5px] leading-relaxed text-muted-foreground">
          Nothing has been shared with you yet. Ask an administrator which parts
          of the site you should be working on and they will show up here.
        </p>
      ) : (
        <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5 p-0">
          {accessible.map((key) => {
            const info = MODULE_INFO[key] ?? { label: key, blurb: '' }
            const canWrite = canWriteModule(editorial, key)
            return (
              <li key={key}>
                <Link href={`/editor/${key}`} className="group block h-full">
                  <Card className="h-full gap-3 py-5 transition-colors group-hover:border-primary/40">
                    <CardContent className="flex h-full flex-col gap-2 px-5">
                      <CardTitle className="font-[family-name:var(--font-cormorant)] text-[25.5px] font-normal">
                        {info.label}
                      </CardTitle>
                      <CardDescription className="flex-1 text-[15px] leading-normal">
                        {info.blurb}
                      </CardDescription>
                      <Badge
                        variant={canWrite ? 'default' : 'secondary'}
                        className="mt-2 font-[family-name:var(--font-glacial)] text-[11.5px] uppercase tracking-[0.1em]"
                      >
                        {canWrite ? 'You can edit' : 'View only'}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
