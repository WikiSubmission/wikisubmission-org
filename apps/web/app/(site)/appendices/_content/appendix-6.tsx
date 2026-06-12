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
          &ldquo;They can never fathom the greatness of God. The whole earth is within
          His fist on the Day of Resurrection. In fact, the universes are folded within
          His right hand. Be He glorified; He is much too high above needing any
          partners.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="39:67" />
        </p>
      </div>

      {/* Seven Universes */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We learn from <QuranRef reference="39:67" /> that God&apos;s greatness is far
          beyond human comprehension — the verse states that all seven universes are
          &ldquo;folded within God&apos;s hand.&rdquo;
        </p>
        <p>
          Supported by the Quran&apos;s mathematical code, we are taught that our
          universe is the smallest and innermost of seven universes (
          <QuranRef reference="41:12" />, <QuranRef reference="55:33" />,{' '}
          <QuranRef reference="67:5" />, &amp; <QuranRef reference="72:8-12" />).
          Meanwhile, our scientific advances have shown us that our galaxy, the Milky
          Way, is 100,000 light years across, and that our universe contains a billion
          such galaxies and a billion trillion stars, plus countless decillions of
          heavenly bodies. Our universe is estimated to span distances in excess of
          20,000,000,000 light years.
        </p>
      </section>

      {/* Count the Stars */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Count the Stars
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold text-foreground">A Thought Experiment</p>
        <p className="text-foreground/80">
          If we take only a quintillion [1,000,000,000,000,000,000] of the stars and
          simply count them — one count per second, day and night — this will take
          32 billion years (more than the age of the universe). That is how long it
          would take to just <em>count</em> them. God <em>created</em> them. Such is
          the greatness of God.
        </p>
      </div>

      {/* Space Odyssey */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Space Odyssey
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We can appreciate the vastness of our universe by imagining a journey at the
          speed of light. Leaving Earth toward the sun, we travel 93,000,000 miles and
          arrive in 8 minutes. To exit our galaxy would take more than 50,000 years at
          the speed of light. From the outer limit of the Milky Way, our planet Earth
          is invisible — not even the most powerful telescope can detect it.
        </p>
        <p>
          To reach our nearest neighboring galaxy would require more than 2,000,000
          years at the speed of light. To reach the outer limit of our universe: at
          least 10,000,000,000 years. From that outer limit, even the Milky Way is like
          a speck of dust in a large room.
        </p>
        <p>
          The second universe surrounds our universe. The third universe is larger than
          the second, and so on. More accurately, our universe should be considered the
          seventh universe, surrounded by the sixth, which is surrounded by the fifth,
          and so on. Can you imagine the vastness of the first, outermost universe? No
          number exists to describe its circumference. This incomprehensible vastness is
          &ldquo;within the fist of God&apos;s hand.&rdquo;
        </p>
        <p>
          From the outer limit of the outermost universe, where is the planet Earth?
          How significant is it? On this infinitesimal mote, such minuscule creatures
          as Mary, Jesus, and Muhammad lived. Yet some people set up these powerless
          humans as gods!
        </p>
        <p>
          God&apos;s greatness is represented not only by the fact that He holds the
          seven universes in His hand, but also by the fact that He fully controls
          every atom — even subatomic components — everywhere in the greater universe (
          <QuranRef reference="6:59" />, <QuranRef reference="10:61" />, &amp;{' '}
          <QuranRef reference="34:3" />).
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="64v6qoyK3cA" title="Appendix 6 — Greatness of God" />
      </section>
    </>
  )
}
