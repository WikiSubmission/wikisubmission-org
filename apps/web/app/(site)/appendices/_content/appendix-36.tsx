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
          &ldquo;If only the people of the various communities believed and maintained a
          righteous life, we would have showered them with blessings from the heaven and the
          earth.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="7:96" />
        </p>
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm text-foreground/90">
        <p>
          &ldquo;If the people of the scripture (Jews, Christians, and Muslims) believe and
          maintain a righteous life, we will remit their sins and admit them into the blissful
          Heaven. Had they observed the Torah, the Gospel, and what is revealed herein from
          their Lord, they would have enjoyed provisions from above them, and from beneath their
          feet.&rdquo; (<QuranRef reference="5:65-66" />)
        </p>
        <p>
          &ldquo;If only the people of the various communities believed and maintained a
          righteous life, we would have showered them with blessings from the heaven and the
          earth.&rdquo; (<QuranRef reference="7:96" />)
        </p>
        <p>
          &ldquo;God is the One who controls your happiness, or misery… God is the One who
          makes you rich or poor.&rdquo; (<QuranRef reference="53:43" />,{' '}
          <QuranRef reference="53:48" />)
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          A nation that upholds God&apos;s laws is guaranteed prominence among the nations of
          the world, victory, prosperity, and happiness (
          <QuranRef reference="10:62-64" />, <QuranRef reference="16:97" />,{' '}
          <QuranRef reference="24:55" />, <QuranRef reference="41:30-31" />). On the other
          hand, a nation that violates God&apos;s laws incurs a miserable life (
          <QuranRef reference="20:124" />). Since God is in full control (
          <QuranRef reference="10:61" />), His guarantees and promises are absolute. A nation
          that upholds God&apos;s laws is characterized by:
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Nine Characteristics of a Great Nation
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <ol className="space-y-4 list-none">
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            1
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Maximum freedom for the people</strong> — freedom of religion, freedom of
            expression, freedom to travel, and freedom of economy (
            <QuranRef reference="2:256" />, <QuranRef reference="10:99" />,{' '}
            <QuranRef reference="88:21-22" />).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            2
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Guaranteed human rights for all the people</strong>, regardless of their
            race, color, creed, social status, financial situation, or political affiliation (
            <QuranRef reference="5:8" />, <QuranRef reference="49:13" />).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            3
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Prosperity for all the people.</strong> God&apos;s economic system is based
            on constant circulation of wealth, no usury, and productive investment.
            Non-productive economy such as gambling, lottery, and high interest loans are not
            permitted (<QuranRef reference="2:275-277" />, <QuranRef reference="59:7" />).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            4
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Social justice for all.</strong> Because of the obligatory charity (Zakat),
            no one will go hungry or un-sheltered (
            <QuranRef reference="2:215" />, <QuranRef reference="70:24-25" />,{' '}
            <QuranRef reference="107:1-7" />).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            5
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>A political system based on unanimous consensus.</strong> Through mutual
            consultation and freedom of expression, one side of any given issue convinces all
            participants in the discussion. The end result is a unanimous agreement, not the
            opinion of a 51% majority rammed down the throat of the 49% minority (
            <QuranRef reference="42:38" />).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            6
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>The highest standards of moral behavior.</strong> There will be a strong
            family, no alcoholism, no illicit drugs, no illegitimate pregnancies, no abortions,
            and practically no divorce.
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            7
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Maximum regard for people&apos;s lives and properties.</strong> Therefore,
            there will be no crime against the people&apos;s lives or properties.
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            8
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Prevalence of love, courtesy, peace, and mutual respect</strong> among the
            people, and between this nation and other world communities (
            <QuranRef reference="3:110" />, <QuranRef reference="60:8-9" />).
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            9
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            <strong>Environmental protection</strong> is guaranteed through conservation and
            prohibition of wasteful practices (<QuranRef reference="30:41" />).
          </p>
        </li>
      </ol>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="tCHFzFE3LTo" title="Appendix 36 — What Price A Great Nation" />
      </section>
    </>
  )
}
