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
          &ldquo;God is my Lord and your Lord; you shall worship Him alone. This is
          the right path.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:51" /> · <QuranRef reference="19:36" /> ·{' '}
          <QuranRef reference="43:64" />
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran informs us that Jesus was a human messenger of God whose sole
          mission was to deliver God&apos;s message; he never possessed any power,
          and is now dead (
          <QuranRef reference="4:171" />, <QuranRef reference="5:75" />,{' '}
          <QuranRef reference="5:117" />). Those who consider Jesus to be God, or Son
          of God, or part of a trinity are &ldquo;pagans&rdquo; (
          <QuranRef reference="5:17" />, <QuranRef reference="5:72" />,{' '}
          <QuranRef reference="5:73" />). Outstanding Christian scholars have reached
          these same conclusions.
        </p>
        <p>
          Christianity as a doctrinal system is largely the product of the Council of
          Nicaea (AD 325). Neither the word &ldquo;Trinity,&rdquo; nor the explicit
          doctrine as such, appears in the New Testament, nor did Jesus and his
          followers intend to contradict the Shema in the Old Testament: &ldquo;Hear
          O Israel: The Lord our God is one&rdquo; (Deuteronomy 6:4).
        </p>
      </section>

      {/* ── The Bible's Jesus ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Bible&apos;s Jesus
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-4 text-sm leading-relaxed text-foreground/90">
        {[
          {
            quote:
              'Whoever puts faith in me believes not so much in me as in him who sent me; ... For I have not spoken on my own; no, the Father who sent me has commanded me what to say and how to speak. Since I know that his commandment means eternal life, whatever I say is spoken just as he instructed me.',
            source: 'John 12:44-50',
          },
          {
            quote:
              'I cannot do anything of myself. I judge as I hear, and my judgment is honest because I am not seeking my own will but the will of him who sent me.',
            source: 'John 5:30',
          },
          {
            quote: 'My doctrine is not my own; it comes from him who sent me.',
            source: 'John 7:16',
          },
          {
            quote:
              'Men of Israel, listen to me! Jesus the Nazorean was a man whom God sent to you with miracles, wonders, and signs as his credentials. These God worked through him in your midst, as you well know.',
            source: 'Acts 2:22',
          },
          {
            quote:
              '...I have not come of myself. I was sent by One who has the right to send, and him you do not know. I know him because it is from him I come; he sent me.',
            source: 'John 7:28-29',
          },
          {
            quote:
              'Jesus looked up to heaven and said, ...Eternal life is this: to know you, the only true God, and him whom you have sent, Jesus Christ.',
            source: 'John 17:1-3',
          },
          {
            quote:
              'As he was setting out on a journey a man came running up, knelt down before him and asked, "Good Teacher, what must I do to share in everlasting life?" Jesus answered, "Why do you call me good? No one is good but God alone."',
            source: 'Mark 10:17-18',
          },
          {
            quote:
              '"None of those who call me \'Lord\' will enter the kingdom of God, but only the one who does the will of my Father in heaven."',
            source: 'Matthew 7:21',
          },
          {
            quote:
              '"...Go to my brothers and tell them, \'I am ascending to my Father and your Father, to my God and your God.\'"',
            source: 'John 20:17',
          },
        ].map((item, i) => (
          <div key={i} className="pl-4 border-l-2 border-primary/30 space-y-1">
            <p className="italic text-foreground/80">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground font-mono">[{item.source}]</p>
          </div>
        ))}
      </section>

      {/* ── Jesus' Death ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Jesus&apos; Death
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="text-foreground/90 leading-relaxed font-medium">
          Jesus&apos; soul was raised — he was put to death prior to the arrest and
          crucifixion of his body. Thus, his persecutors arrested, tortured, and
          crucified an empty body — Jesus was already gone to the world of souls (
          <QuranRef reference="3:55" />, <QuranRef reference="4:157" />).
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This has been the single most controversial subject in the world. The
          Quran&apos;s miraculous mathematical code has now provided the final answer
          to this topic:
        </p>

        <div className="space-y-3 text-sm italic pl-4 border-l-2 border-primary/30">
          <p>
            They plotted and schemed, but so did God, and God is the best schemer.
            Thus, God said, &ldquo;O Jesus, I am putting you to death, and raising
            you to Me; I will save you from the disbelievers.&rdquo; [
            <QuranRef reference="3:54" />-55]
          </p>
          <p>
            They claimed that they killed the Messiah, Jesus, the son of Mary, the
            messenger of God! In fact, they never killed him; they never crucified
            him; they were led to believe that they did. [
            <QuranRef reference="4:157" />]
          </p>
        </div>

        <p>
          Mercifully, God has given our generation a living example of a person whose
          soul departed this world, but his body continued to live for 19 months. On
          November 25, 1984, doctors at the Humana Hospital of Louisville, Kentucky
          removed the diseased heart of Mr. William Schroeder and replaced it with a
          plastic and metal pump.
        </p>
        <p>
          On the 19th day after this historic operation — Thursday, December 13, 1984
          — Mr. Schroeder, the soul, the real person, departed this world. His body
          continued to function with the artificial heart. The world was told that he
          &ldquo;probably suffered a stroke.&rdquo; From the moment he departed, he
          did not recognize the day or time, nor his family members.
        </p>
        <p>
          The Gospels state clearly that the arrested body of Jesus was oblivious to
          the events surrounding it. Pilate interrogated him and &ldquo;greatly to
          Pilate&apos;s surprise, Jesus made no further response&rdquo; (Mark
          15:3-5). Herod likewise questioned Jesus at considerable length, but
          &ldquo;Jesus made no response&rdquo; (Luke 23:8-11).
        </p>
        <p>
          The facts that (1) Mr. Schroeder&apos;s soul departed on the 19th day after
          the operation, and (2) his body survived for 19 months, are uncanny
          reminders that God wanted the world to know the parallel between
          Schroeder&apos;s situation, and the proven account of Jesus&apos; departure
          prior to the arrest, torture, and crucifixion of his soulless body.
        </p>
      </section>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="seAyTYQrsPM" title="Appendix 22 — Jesus" />
      </section>
    </>
  )
}
