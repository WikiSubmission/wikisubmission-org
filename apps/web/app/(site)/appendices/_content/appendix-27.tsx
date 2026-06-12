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
          &ldquo;O you who believe, you shall remember God frequently; glorify Him day and
          night.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="33:41" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Most people are outraged upon hearing the question &ldquo;Who is your god?&rdquo;
          They say: &ldquo;My god is the Creator of the heavens and the earth.&rdquo; And most
          of these people will be shocked to find out that their proclamation is no more than
          lip service, and that they are in fact destined for Hell (<QuranRef reference="12:106" />
          ).
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center text-sm font-medium text-foreground/90">
        Your god is whoever or whatever occupies your mind most of the time.
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Your god can be your children (<QuranRef reference="7:190" />), your spouse (
          <QuranRef reference="9:24" />), your business (<QuranRef reference="18:35" />), or
          your ego (<QuranRef reference="25:43" />). This is why one of the most important and
          most repeated commandments in the Quran is to remember God frequently (
          <QuranRef reference="33:41" />).
        </p>
        <p>
          To put this commandment into practice, we must establish certain habits whereby we
          guarantee that God occupies our minds more than anything else. The Quran helps us
          establish such soul-saving habits:
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Six Habits to Remember God
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <ol className="space-y-4 list-none">
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            1
          </span>
          <div className="space-y-1 text-base leading-relaxed text-foreground/90">
            <p>
              <strong>The Contact Prayers (Salat):</strong> Those who observe the 5 daily
              prayers come a long way towards commemorating God throughout their waking hours.
              Salat helps us remember God not only during prayer, but also throughout the times
              of anticipation — glancing at a watch to see if noon prayer is due causes one to
              think about God, and one is credited accordingly (<QuranRef reference="20:14" />
              ).
            </p>
          </div>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            2
          </span>
          <div className="space-y-1 text-base leading-relaxed text-foreground/90">
            <p>
              <strong>Commemorate God before eating:</strong> <QuranRef reference="6:121" />{' '}
              enjoins us to mention God&apos;s name before we eat: &ldquo;You shall not eat from
              that upon which God&apos;s name has not been mentioned.&rdquo;
            </p>
          </div>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            3
          </span>
          <div className="space-y-1 text-base leading-relaxed text-foreground/90">
            <p>
              <strong>God Willing (IN SHAA ALLAH):</strong> &ldquo;You shall not say, &lsquo;I
              will do this or that tomorrow,&rsquo; without saying, &lsquo;God willing&rsquo; (IN
              SHAA ALLAH). If you forget to do this, then apologize and say, &lsquo;May my Lord
              guide me to do better next time.&rsquo;&rdquo; (<QuranRef reference="18:24" />).
              This is a direct commandment regardless of who we are talking with.
            </p>
          </div>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            4
          </span>
          <div className="space-y-1 text-base leading-relaxed text-foreground/90">
            <p>
              <strong>God&apos;s Gift (MAA SHAA ALLAH):</strong> To invoke God&apos;s protection
              for our beloved objects — our children, our cars, our homes — we are enjoined in{' '}
              <QuranRef reference="18:39" /> to say &ldquo;MAA SHAA ALLAH&rdquo; (This is
              God&apos;s gift).
            </p>
          </div>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            5
          </span>
          <div className="space-y-1 text-base leading-relaxed text-foreground/90">
            <p>
              <strong>Glorify God day and night:</strong> When we eat, we must reflect on
              God&apos;s creation of the food — the flavor, our enjoyment through the senses God
              has given us, the perfect packaging of a banana or orange, the varieties of
              seafood. When we see a beautiful flower, animal, or sunset, we must glorify God.
              We must seize every possible opportunity to remember and glorify God.
            </p>
          </div>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            6
          </span>
          <div className="space-y-1 text-base leading-relaxed text-foreground/90">
            <p>
              <strong>First Utterance:</strong> Make it a habit to say: &ldquo;In the name of
              God, Most Gracious, Most Merciful. There is no other god besides God,&rdquo; the
              moment you wake up every morning. If you establish this good habit, this is what
              you will utter when you are resurrected.
            </p>
          </div>
        </li>
      </ol>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="gAa7XWY78I8" title="Appendix 27 — Who Is Your God?" />
      </section>
    </>
  )
}
