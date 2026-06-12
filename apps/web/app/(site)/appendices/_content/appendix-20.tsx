import { QuranRef } from '@/components/quran-ref'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* ── Opening card ─────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;The Most Gracious. Teacher of the Quran.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="55:1-2" />
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran is God&apos;s Final Testament to the world, and He has pledged
          to protect it from the slightest distortion (
          <QuranRef reference="15:9" />). Thus, the Quran is surrounded by invisible
          forces that guard it and serve it (
          <QuranRef reference="13:39" />, <QuranRef reference="41:42" />,{' '}
          <QuranRef reference="42:24" />).
        </p>
        <p>
          Unlike any other book, the Quran is taught by God (
          <QuranRef reference="55:1" />-2); He teaches us what we need at the time
          we need it. This is why we read the Quran hundreds of times without getting
          bored. We can read a novel, for example, only once. But the Quran can be
          read an infinite number of times, and we derive new and valuable information
          from it every time.
        </p>
        <p>
          On the other hand, the insincere readers — those who read the Quran to find
          fault with it — are diverted from the Quran (
          <QuranRef reference="7:146" />, <QuranRef reference="17:45" />,{' '}
          <QuranRef reference="18:57" />, <QuranRef reference="41:44" />). In fact,
          God&apos;s invisible forces help them find the faults they seek. Since the
          Quran is perfect, such &ldquo;faults&rdquo; serve only to reveal the
          stupidity of God&apos;s enemies.
        </p>
      </section>

      {/* ── God's Attributes for the Quran ───────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          God&apos;s Attributes for the Quran
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          God uses His own attributes to describe the Quran; He calls the Quran:
        </p>

        <div
          data-card
          className="rounded-xl border border-border/60 overflow-hidden"
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Arabic
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Meaning
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { arabic: 'ʿAzeem', meaning: 'Great', ref: '15:87' },
                { arabic: 'Hakeem', meaning: 'Full of wisdom', ref: '36:2' },
                { arabic: 'Majid', meaning: 'Glorious', ref: '50:1' },
                { arabic: 'Karim', meaning: 'Honorable', ref: '56:77' },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-xs text-primary font-medium">
                    {row.arabic}
                  </td>
                  <td className="px-4 py-2 text-xs">{row.meaning}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground font-mono">
                    <QuranRef reference={row.ref} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Accessible to Believers ───────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Accessible to All Believers
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Since the Quran is God&apos;s message to all the people, regardless of their
          language, the Quran is accessible to the believers, regardless of their
          language (<QuranRef reference="41:44" />). This explains a profound
          phenomenon: the believers who do not know Arabic know the Quran better than
          the Arabic speaking unbelievers.
        </p>
        <p>
          Because of the invisible forces serving the Quran, it is readily and
          enjoyably accessible to the sincere believers, and utterly inaccessible to
          the unbelievers (
          <QuranRef reference="17:45" />, <QuranRef reference="18:57" />,{' '}
          <QuranRef reference="56:79" />).
        </p>
      </section>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="vQwdGHGu570" title="Appendix 20 — Quran: Unlike Any Other Book" />
      </section>
    </>
  )
}
