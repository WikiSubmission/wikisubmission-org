import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* Opening card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;Anything that happens on earth, or to you, has already been recorded,
          even before the creation. This is easy for God to do.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="57:22" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We are absolutely free to believe or disbelieve in God. It is God&apos;s will
          that we will (<QuranRef reference="18:29" />, <QuranRef reference="25:57" />,{' '}
          <QuranRef reference="73:19" />, <QuranRef reference="74:37" />,{' '}
          <QuranRef reference="76:29" />, <QuranRef reference="78:39" />,{' '}
          <QuranRef reference="80:12" />).
        </p>
        <p>
          After committing our original sin (
          <Link href="/appendices/7" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 7
          </Link>
          ), God gave us a chance to denounce our crime and accept His absolute authority
          (<QuranRef reference="33:72" />). But we decided that we wanted to see a
          demonstration of Satan&apos;s competence as a god. Many people protest the fact
          that God has created them, to put them through this gruesome test. Obviously,
          such people are not aware that [1] they have committed a horrendous crime
          (Introduction &amp;{' '}
          <Link href="/appendices/7" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 7
          </Link>
          ), and [2] that they were given a chance to denounce their crime and redeem
          themselves, but they chose to go through the test.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Free Will Within God&apos;s Full Knowledge
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We learn from <QuranRef reference="57:22" /> that our lives, along with
          everything else around us, are pre-recorded on something like a videotape. God
          fully knows what kind of decision each of us is destined to make; He knows which
          of us are going to Heaven and which are going to Hell. Even before we were born
          into this world, God knew which souls are good and which souls are evil. As far
          as God&apos;s omniscience is concerned, we can imagine a stamp on everyone&apos;s
          forehead that says &ldquo;Heaven&rdquo; or &ldquo;Hell.&rdquo; Yet, as far as we
          are concerned, we are totally free to side with God&apos;s absolute authority, or
          Satan&apos;s polytheistic views. Predestination, therefore, is a fact as far as
          God is concerned, not as far as we are concerned.
        </p>
      </section>

      {/* Examples */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Quranic Examples
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This understanding explains the numerous verses stating that &ldquo;God guides
          whomever He wills, and misleads whomever He wills.&rdquo; Based on His knowledge,
          God assigns our souls to the circumstances that we deserve. When God said to the
          angels, &ldquo;I know what you do not know&rdquo; (<QuranRef reference="2:30" />),
          this meant that some of us deserved a chance to redeem ourselves. One example of
          God&apos;s guidance for those who deserve guidance is found in{' '}
          <QuranRef reference="21:51" />: &ldquo;We granted Abraham his guidance, for we
          were fully aware of him.&rdquo; In other words, God knew that Abraham was a good
          soul who deserved to be guided, and God granted him his guidance and
          understanding. Another good example is stated in <QuranRef reference="12:24" />.
          Joseph fell for the Egyptian nobleman&apos;s wife, and almost committed adultery
          &ldquo;if it were not that he saw a sign from his Lord.&rdquo; God teaches us in{' '}
          <QuranRef reference="12:24" /> that He &ldquo;diverted evil and sin from Joseph,
          for he was one of My devoted worshipers.&rdquo; Was it Joseph who controlled his
          lust? Or, was it God&apos;s protection from sin that rendered him chaste? Such is
          predestination.
        </p>
      </section>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="ycRUmiOuRiM" title="Appendix 14 — Predestination" />
      </section>
    </>
  )
}
