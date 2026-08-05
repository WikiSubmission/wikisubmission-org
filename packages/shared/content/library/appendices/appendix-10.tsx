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
          &ldquo;I am God. There is no other god besides Me.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="20:14" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In the English speaking world, where the trinity doctrine is prevalent, some
          people are intrigued by God&apos;s usage of the plural tense in the Quran. The
          overwhelming message of the Quran, where there is absolutely no compromise is
          that &ldquo;GOD IS ONE&rdquo; (<QuranRef reference="2:133" />,{' '}
          <QuranRef reference="2:163" />; <QuranRef reference="4:171" />;{' '}
          <QuranRef reference="5:73" />; <QuranRef reference="6:19" />;{' '}
          <QuranRef reference="9:31" />; <QuranRef reference="12:39" />;{' '}
          <QuranRef reference="13:16" />; <QuranRef reference="14:48" />,{' '}
          <QuranRef reference="14:52" />; <QuranRef reference="16:22" />,{' '}
          <QuranRef reference="16:51" />; <QuranRef reference="18:110" />;{' '}
          <QuranRef reference="21:108" />; <QuranRef reference="22:34" />;{' '}
          <QuranRef reference="37:4" />; <QuranRef reference="38:65" />;{' '}
          <QuranRef reference="39:4" />; <QuranRef reference="40:16" />;{' '}
          <QuranRef reference="41:6" />; <QuranRef reference="112:1" />).
        </p>
        <p>
          Whenever the first person plural form is used by the Almighty, it invariably
          indicates participation of other entities, such as the angels. For example, the
          revelation of this Quran involved participation of the angel Gabriel and the
          prophet Muhammad. Hence the use of the plural form in{' '}
          <QuranRef reference="15:9" />: &ldquo;We revealed this scripture, and we will
          preserve it.&rdquo; The plural form here simply reflects the fact that the angel
          Gabriel and the prophet Muhammad participated in the process of delivering the
          Quran.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Adam vs. Jesus
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Another example has to do with blowing the breath of life into Adam and Jesus.
          The creation of Adam took place in heaven and God directly blew into him the
          breath of life. Thus, the first person singular form is consistently used:{' '}
          <em>&ldquo;I blew into Adam from My spirit&rdquo;</em> (
          <QuranRef reference="15:29" />, <QuranRef reference="38:72" />). The creation of
          Jesus, on the other hand, took place on earth, and Gabriel carried God&apos;s
          &ldquo;word&rdquo; to Mary. The plural form is consistently used when referring
          to the creation of Jesus (<QuranRef reference="21:91" />,{' '}
          <QuranRef reference="66:12" />).
        </p>
        <p>
          When God spoke to Moses directly, without the mediation of angels, we see that
          God is speaking exclusively in the singular tense:{' '}
          <em>
            &ldquo;I am God. There is no other god besides Me. You shall worship Me alone,
            and observe the regular contact prayers (Salat) to commemorate Me.&rdquo;
          </em>{' '}
          (<QuranRef reference="20:12-14" />).
        </p>
        <p>
          Whenever the worship of God is mentioned, the singular tense is used (
          <QuranRef reference="51:56" />).
        </p>
      </section>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="ONjW_ayZ1Fo" title="Appendix 10 — God's Usage of the Plural Tense" />
      </section>
    </>
  )
}
