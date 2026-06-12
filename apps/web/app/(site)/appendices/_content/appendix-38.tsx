import { QuranRef } from '@/components/quran-ref'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* Opening verse card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;We will show them our proofs in the horizons, and within themselves, until
          they realize that this is the truth.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="41:53" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The scriptures are not the only mathematically composed creations of God where the
          number 19 is the common denominator. It is profound indeed that Galileo made his
          famous statement: &ldquo;Mathematics is the language with which God created the
          universe.&rdquo; A plethora of scientific findings have now shown that the number 19
          represents God&apos;s signature upon certain creations. This divine stamp appears
          throughout the universe in much the same manner as the signature of Michelangelo and
          Picasso identify their works.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          19 in Creation
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <ol className="space-y-4 list-none">
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            1
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            The sun, the moon, and the earth become aligned in the same relative positions once
            every 19 years (see <em>Encyclopedia Judaica</em> under &ldquo;Calendar&rdquo;).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            2
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            Halley&apos;s Comet, a profound heavenly phenomenon, visits our solar system every
            76 years&nbsp;=&nbsp;19&times;4.
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            3
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            God&apos;s stamp on you and me is manifested in the fact that the human body
            contains 209 bones&nbsp;=&nbsp;19&times;11.
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            4
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <em>Langman&apos;s Medical Embryology</em> by T. W. Sadler, used as a textbook in
            most U.S. medical schools, states on page 88 of the fifth edition: &ldquo;In
            general the length of pregnancy for a full term fetus is considered to be 280 days
            or 40 weeks after onset of the last menstruation, or more accurately, 266 days or
            38 weeks after fertilization.&rdquo; The numbers 266 and 38 are both multiples of
            19 (19&times;14 and 19&times;2, respectively).
          </p>
        </li>
      </ol>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="310Gs6vO8kM" title="Appendix 38 — 19: The Creator's Signature" />
      </section>
    </>
  )
}
