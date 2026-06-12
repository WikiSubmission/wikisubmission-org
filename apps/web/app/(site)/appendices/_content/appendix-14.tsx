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
          &ldquo;Nothing happens on earth, nor in your own souls, without
          being pre-recorded in a record, before We bring it into
          existence.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="57:22" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We possess absolute freedom to believe or disbelieve in God. It is
          God&apos;s will that we will choose our own path (
          <QuranRef reference="18:29" />; <QuranRef reference="25:57" />;{' '}
          <QuranRef reference="73:19" />; <QuranRef reference="74:37" />;{' '}
          <QuranRef reference="76:29" />; <QuranRef reference="78:39" />;{' '}
          <QuranRef reference="80:12" />).
        </p>
        <p>
          Humanity committed an original transgression (see{' '}
          <Link href="/quran/appendix/7" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 7
          </Link>
          ) and was subsequently offered redemption by accepting God&apos;s
          authority (<QuranRef reference="33:72" />). Many, however, chose
          to witness Satan&apos;s capabilities instead. Those who object to
          the concept of predestination often overlook both the severity of
          that original offense and the opportunity to repent.
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
          According to <QuranRef reference="57:22" />, all lives and events
          are pre-recorded — like a videotape. God possesses complete
          knowledge of every individual&apos;s ultimate destination: Heaven
          or Hell. One can imagine each soul&apos;s forehead stamped with
          its predetermined outcome from God&apos;s perspective — yet humans
          remain genuinely free in their choices. There is no contradiction:
          God&apos;s foreknowledge does not compel our decisions.
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

      <div className="space-y-4">
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Abraham (<QuranRef reference="21:51" />)
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            Abraham received guidance because God knew he was a good soul
            deserving direction. God&apos;s prior knowledge of
            Abraham&apos;s character informed the gift of guidance — not
            the other way around.
          </p>
        </div>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Joseph (<QuranRef reference="12:24" />)
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            &ldquo;God diverted evil and sin from Joseph, for he was one of
            My devoted worshipers.&rdquo; God&apos;s intervention reflected
            Joseph&apos;s own sincere devotion, which God knew in advance.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div
        data-card
        className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold uppercase tracking-widest text-muted-foreground text-xs">
          Key Principle
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Predestination means that God already knows the outcome of our
          freely made choices. His foreknowledge does not remove our
          responsibility. We are accountable for the path we freely choose,
          even as God has known since eternity which path each soul will
          take.
        </p>
      </div>

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
