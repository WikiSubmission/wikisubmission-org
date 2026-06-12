import { QuranRef } from '@/components/quran-ref'
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
          &ldquo;The horn is blown, whereupon everyone in the heavens and the
          earth is struck unconscious, except those spared by God. Then it is
          blown a second time, whereupon they rise up.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="39:68" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Approximately 150 billion humans and jinns will be resurrected on
          earth. Using the caterpillar-to-butterfly metaphor, the Quran
          describes how resurrected beings will not remain earthbound — just
          as a butterfly exits the cocoon as an airborne creature (
          <QuranRef reference="101:4" />), the resurrected will transcend
          their earthly forms.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Physical Events During Resurrection
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          When God arrives with the angels (<QuranRef reference="89:22" />
          ), &ldquo;the earth will shine with the light of God&rdquo; (
          <QuranRef reference="39:69" />). The stars will crash into one
          another (<QuranRef reference="77:8" />, <QuranRef reference="81:2" />
          ) and the earth will shatter underfoot (
          <QuranRef reference="69:14" />, <QuranRef reference="89:21" />
          ). Believers, however, will not fear these occurrences (
          <QuranRef reference="21:103" />).
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Realms of the Hereafter
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The souls of the Hereafter are distributed across distinct realms
          based on the degree of spiritual development attained during
          earthly life:
        </p>
      </section>

      {/* Realms cards */}
      <div className="space-y-4">
        {/* High Heaven */}
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            The High Heaven
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            Individuals who developed their souls through worshiping God
            alone, believing in the Hereafter, and living righteously will
            occupy the highest ranks closest to God.
          </p>
        </div>

        {/* Lower Heaven */}
        <div
          data-card
          className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The Lower Heaven
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            Those with lesser spiritual development, plus those who died
            before the age of forty, will inhabit this realm, where they can
            approach God within their capability limits.
          </p>
        </div>

        {/* Purgatory */}
        <div
          data-card
          className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The Purgatory
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            People who developed their souls minimally — enough to avoid
            Hell but insufficient for the Lower Heaven — will eventually be
            admitted there (<QuranRef reference="7:46" />–
            <QuranRef reference="7:50" />).
          </p>
        </div>

        {/* Hell */}
        <div
          data-card
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-destructive/70">
            Hell
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            An eighth universe will house those who rejected God through
            their own free will, having failed entirely to develop their
            souls (<QuranRef reference="69:17" />).
          </p>
        </div>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="1pvtPUiJ4WM" title="Appendix 11 — The Day of Resurrection" />
      </section>
    </>
  )
}
