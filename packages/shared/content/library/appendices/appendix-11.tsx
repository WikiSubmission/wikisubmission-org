import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'

/* ──────────────────────────────────────────────────────────────────────────
 * Appendix 11 — The Day of Resurrection
 * (from: Quran The Final Testament, by Rashad Khalifa, PhD.)
 *
 * Body text is a faithful reproduction of the source published at
 * masjidtucson.org/quran/appendices/appendix11.html
 * ────────────────────────────────────────────────────────────────────────── */

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
          All generations of humans and jinns will be resurrected on this earth;
          about 150 billion of them. But we will not be earthbound. God teaches
          us through the example of the caterpillar; it turns into a pupa in the
          cocoon (grave), then exits the cocoon as an airborne butterfly.
          Similarly, we live here on earth, and when we exit the grave on the
          Day of Resurrection we will not be earthbound; like the butterfly (
          <QuranRef reference="101:4" />
          ).
        </p>
        <p>
          The earth will shine with the light of God (
          <QuranRef reference="39:69" />
          ) as He comes to our universe, together with the angels (
          <QuranRef reference="89:22" />
          ). Since our universe is a temporary dominion for Satan, it cannot
          stand the physical presence of God (
          <QuranRef reference="7:143" />
          ). As the Almighty approaches, the stars will crash into one another (
          <QuranRef reference="77:8" />, <QuranRef reference="81:2" />
          ), and the earth will shatter under our feet (
          <QuranRef reference="69:14" />, <QuranRef reference="89:21" />
          ). These horrors will not worry the believers (
          <QuranRef reference="21:103" />
          ).
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
            Upon arrival of Almighty God, all the humans and jinns will be
            automatically stratified according to their degree of growth and
            development. Those who nourished their souls through worshiping God
            alone, believing in the Hereafter, and leading a righteous life will
            be strong enough to stay close to God; they will occupy the highest
            ranks (see{' '}
            <Link
              href="/appendices/5"
              className="text-primary underline underline-offset-2"
            >
              Appendix 5
            </Link>
            ).
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
            Those who developed their souls to a lesser degree, as well as those
            who die before the age of forty, will move downward to the Lower
            Heaven. They will go to the location where they can be as close to
            God as their degree of growth and development permits them to be.
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
            There will be people who nourished their souls just enough to spare
            them Hell, but not enough to enter the Lower Heaven. They are
            neither in Hell, nor in Heaven. They will implore God to admit them
            into the Lower Heaven (<QuranRef reference="7:46-50" />
            ). God will have mercy on them, and will merge the Purgatory into
            the Lower Heaven.
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
            A new, eighth universe will be created to house those who run away
            from God due to their weakness; they failed to nourish and develop
            their souls (<QuranRef reference="69:17" />
            ). God does not put a single being in Hell; they go to it on their
            own volition (
            <Link
              href="/appendices/5"
              className="text-primary underline underline-offset-2"
            >
              Appendix 5
            </Link>
            ).
          </p>
        </div>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed
          videoId="1pvtPUiJ4WM"
          title="Appendix 11 — The Day of Resurrection"
        />
      </section>

      {/* Source attribution */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          United Submitters International / International Community of
          Submitters / Masjid Tucson
        </p>
      </div>
    </>
  )
}
