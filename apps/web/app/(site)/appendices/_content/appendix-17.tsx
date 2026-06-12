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
          &ldquo;Do not think that those who are killed in the cause of God
          are dead; they are alive at their Lord, being provided for.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:169" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Death is a great mystery to most people — but not to students of
          the Quran. We learn that death is exactly like sleeping, complete
          with dreams (<QuranRef reference="6:60" />,{' '}
          <QuranRef reference="40:46" />). The period between death and
          resurrection passes like one night of sleep (
          <QuranRef reference="2:259" />; <QuranRef reference="6:60" />;{' '}
          <QuranRef reference="10:45" />; <QuranRef reference="16:21" />;{' '}
          <QuranRef reference="18:11" />, <QuranRef reference="18:19" />,{' '}
          <QuranRef reference="18:25" />; <QuranRef reference="30:55" />).
        </p>
        <p>
          At the moment of death, everyone knows his or her destiny —
          Heaven or Hell. For the disbelievers, death is a horrible event:
          the angels beat them and snatch away their souls (
          <QuranRef reference="8:50" />, <QuranRef reference="47:27" />,{' '}
          <QuranRef reference="79:1" />).
        </p>
        <p>
          Consistently, the Quran speaks of two deaths. The first took
          place when we failed to make a stand with God&apos;s absolute
          authority (see{' '}
          <Link href="/quran/appendix/7" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 7
          </Link>
          ). That first death lasted until we were born into this world. The
          second death terminates our life here (
          <QuranRef reference="2:28" />, <QuranRef reference="22:66" />,{' '}
          <QuranRef reference="40:11" />).
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Great News for the Believers: The Righteous Go Straight to Heaven
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          As far as other people are concerned, the righteous &ldquo;die.&rdquo;
          But in reality they simply leave their bodies and move on to
          Paradise. The Quran tells us that the righteous die only once — the
          one death already experienced as a consequence of the great
          feud in the heavenly realm (<QuranRef reference="38:69" />).
        </p>
        <p>
          In <QuranRef reference="36:26" />–<QuranRef reference="36:27" />,
          we see the best evidence: a righteous man enters Paradise while his
          friends and relatives are still living on earth — like going ahead
          to a wonderful place and waiting for loved ones there. Key verses
          confirming this reality include{' '}
          <QuranRef reference="2:25" />, <QuranRef reference="2:154" />,{' '}
          <QuranRef reference="3:169" />, <QuranRef reference="8:24" />,{' '}
          <QuranRef reference="22:58" />, and <QuranRef reference="44:56" />.
          See also <QuranRef reference="16:32" /> and{' '}
          <QuranRef reference="6:60" />–<QuranRef reference="6:62" />.
        </p>
      </section>

      {/* Verses grid */}
      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Key Verses on the Righteous After Death
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            '2:25', '2:154', '3:169', '8:24', '22:58', '44:56', '36:26', '36:27', '16:32',
          ].map((ref) => (
            <div
              key={ref}
              className="flex items-center justify-center rounded-lg border border-primary/15 bg-background/50 px-3 py-2"
            >
              <span className="font-mono text-xs text-primary font-medium">
                <QuranRef reference={ref} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Disbelievers
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The disbelievers know at the moment of death that they are
          destined for Hell. The angels beat them on their faces and rear
          ends (<QuranRef reference="8:50" />, <QuranRef reference="47:27" />
          ), order them to evict their souls (<QuranRef reference="6:93" />
          ), and then snatch their souls away (<QuranRef reference="79:1" />
          ).
        </p>
        <p>
          The Quran teaches that disbelievers go through two deaths (
          <QuranRef reference="2:28" />, <QuranRef reference="40:11" />).
          They will be put to death — a state of nothingness during which
          they witness Hell day and night in a continuous nightmare that
          lasts until the Day of Judgment (<QuranRef reference="40:46" />).
          Hell itself does not yet exist (
          <QuranRef reference="40:46" />, <QuranRef reference="89:23" />).
        </p>
      </section>

      {/* Comparison card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            The Righteous
          </p>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              <span>Die only once (the original death before this life)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              <span>Go immediately to Paradise at death</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              <span>Are alive and provided for (<QuranRef reference="3:169" />)</span>
            </li>
          </ul>
        </div>
        <div
          data-card
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-destructive/70">
            The Disbelievers
          </p>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="text-destructive/60 mt-0.5">·</span>
              <span>Experience two deaths (<QuranRef reference="40:11" />)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive/60 mt-0.5">·</span>
              <span>Souls are forcibly snatched (<QuranRef reference="79:1" />)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive/60 mt-0.5">·</span>
              <span>Nightmare state until Judgment (<QuranRef reference="40:46" />)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="UW0MnqokXvY" title="Appendix 17 — Death" />
      </section>
    </>
  )
}
