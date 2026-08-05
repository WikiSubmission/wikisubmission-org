import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'

function Divider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4" data-parallax>
      <hr className="flex-1 border-border/50" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0 text-center">
        {title}
      </h2>
      <hr className="flex-1 border-border/50" />
    </div>
  )
}

function VerseCard({ children, reference }: { children: React.ReactNode; reference: React.ReactNode }) {
  return (
    <div
      data-card
      className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
    >
      <p className="text-base leading-relaxed italic text-foreground/90">{children}</p>
      <p className="text-xs text-muted-foreground font-mono">{reference}</p>
    </div>
  )
}

export function AppendixContent() {
  return (
    <>
      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Death is a great mystery to most people. Not so for the students of
          the Quran. We learn that death is exactly like sleeping; complete
          with dreams (<QuranRef reference="6:60" />,{' '}
          <QuranRef reference="40:46" />). The period between death and
          resurrection passes like one night of sleep (
          <QuranRef reference="2:259" />; <QuranRef reference="6:60" />;{' '}
          <QuranRef reference="10:45" />; <QuranRef reference="16:21" />;{' '}
          <QuranRef reference="18:11" />, <QuranRef reference="18:19" />,{' '}
          <QuranRef reference="18:25" />; <QuranRef reference="30:55" />).
        </p>
        <p>
          At the moment of death, everyone knows his or her destiny; Heaven or
          Hell. For the disbelievers, death is a horrible event; the angels
          beat them on the faces and rear ends as they snatch away their souls
          (<QuranRef reference="8:50" />, <QuranRef reference="47:27" />,{' '}
          <QuranRef reference="79:1" />).
        </p>
        <p>
          Consistently, the Quran talks about two deaths, the first death took
          place when we failed to make a stand with God&rsquo;s absolute
          authority (
          <Link href="/appendices/7" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 7
          </Link>
          ). That first death lasted until we were born into this world. The
          second death terminates our life in this world (
          <QuranRef reference="2:28" />, <QuranRef reference="22:66" />,{' '}
          <QuranRef reference="40:11" />).
        </p>
      </section>

      {/* Martyrdom framing note */}
      <div
        data-card
        className="rounded-xl border-l-2 border-primary/40 bg-muted/20 px-5 py-4"
      >
        <p className="text-sm leading-relaxed text-foreground/80 italic">
          The following page is a reproduction of the lead article from the
          February, 1990 issue of the Submitters Perspective, the monthly
          bulletin of United Submitters International. This issue was completed
          and mailed ahead of time, in December, 1989. Dr. Khalifa was martyred
          on January 31, 1990 and his soul was taken directly to Paradise.
        </p>
      </div>

      <Divider title="New Major Revelation: Great News for the Believers — The Righteous Do Not Really Die, They Go Straight to Heaven" />

      {/* Verse block */}
      <VerseCard reference={<QuranRef reference="2:25" />}>
        &ldquo;Give good news to those who believe and work righteousness that
        they will have gardens with flowing streams. When provided with
        provisions of fruits therein, they will say, &lsquo;This is what was
        given to us in the past.&rsquo; They will be given similar provisions,
        and they will have pure spouses therein. They abide therein
        forever.&rdquo;
      </VerseCard>

      <VerseCard reference={<QuranRef reference="3:169" />}>
        &ldquo;Do not think that those who are killed in the cause of God are
        dead; they are alive at their Lord, being provided for.&rdquo;
      </VerseCard>

      <VerseCard reference={<QuranRef reference="2:154" />}>
        &ldquo;Do NOT say about those who are killed in the cause of God,
        &lsquo;They are dead&rsquo; For they are alive, but you do not
        perceive.&rdquo;
      </VerseCard>

      <VerseCard reference={<QuranRef reference="8:24" />}>
        &ldquo;O you who believe, you shall respond to God and the messenger
        when he invites to what keeps you alive.&rdquo;
      </VerseCard>

      <VerseCard reference={<QuranRef reference="22:58" />}>
        &ldquo;Those who emigrate in the cause of God, then get killed or die,
        God will surely provide for them a good provision.&rdquo;
      </VerseCard>

      <VerseCard reference={<QuranRef reference="44:56" />}>
        &ldquo;They do not taste death, beyond the first death, and God spares
        them the retribution of Hell.&rdquo;
      </VerseCard>

      <VerseCard
        reference={
          <>
            <QuranRef reference="36:26" />–<QuranRef reference="36:27" />
          </>
        }
      >
        &ldquo;He was told, &lsquo;Enter Paradise.&rsquo; He said, &lsquo;I wish
        my people (on earth) know, that my Lord has forgiven me and honored
        me.&rsquo;&rdquo;
      </VerseCard>

      <div
        data-card
        className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center"
      >
        <p className="text-sm leading-relaxed text-foreground/80 italic">
          The wages of sin is death.
        </p>
        <p className="text-xs text-muted-foreground font-mono mt-1">[Romans 6:23]</p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          As stated in <QuranRef reference="3:81" /> and{' '}
          <QuranRef reference="46:9" />, God&rsquo;s Messenger of the Covenant
          does not bring anything new; everything I receive and pass on to you
          is already in the Quran. However, the Quran is full of information
          that is kept by Almighty God for revelation at a specific time. Now is
          the time to look at the verses shown above and learn the great news:
          THE RIGHTEOUS DO NOT DIE; when their lives on this earth come to the
          predetermined end, the angel of death simply invites them to leave
          their earthly bodies and move on to Heaven, the same Paradise where
          Adam and Eve once lived. Heaven has been in existence since Adam and
          Eve. We learn from <QuranRef reference="89:27" />–
          <QuranRef reference="89:30" /> that God invites the believers&rsquo;
          souls: &ldquo;Enter My Paradise.&rdquo;
        </p>
      </section>

      <Divider title="My Own Experience" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          When God&rsquo;s covenant with the prophets was fulfilled in
          accordance with <QuranRef reference="3:81" />, I was taken to Heaven
          where the righteous live NOW (<QuranRef reference="4:69" />). While my
          body was down here on earth, I was in the same Paradise of Adam &amp;
          Eve.
        </p>
      </section>

      <Divider title="The Disbelievers" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          As for the disbelievers, they know at the moment of death that they
          are destined for Hell. The angels beat them up on the faces and rear
          ends (<QuranRef reference="8:50" /> &amp; <QuranRef reference="47:27" />
          ), order them to evict their souls (<QuranRef reference="6:93" />),
          then &ldquo;snatch their souls&rdquo; (<QuranRef reference="79:1" />).
          The Quran teaches that the disbelievers go through 2 deaths (
          <QuranRef reference="2:28" /> &amp; <QuranRef reference="40:11" />).
          They will be put to death — a state of nothingness during which they
          see Hell day and night in a continuous nightmare that lasts until the
          Day of Judgment (<QuranRef reference="40:46" />). Hell is not yet in
          existence (<QuranRef reference="40:46" />, <QuranRef reference="89:23" />).
        </p>
      </section>

      <Divider title="Of Course, the Righteous Depart" />

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          As far as people are concerned, the righteous &ldquo;die.&rdquo;
          People do not realize that the righteous simply leave their bodies,
          and move on to Paradise. The verses shown above are self explanatory.
          They tell us that the righteous die only once — the one death we have
          already experienced as a consequence of the great fued (
          <QuranRef reference="38:69" />). In <QuranRef reference="36:26" />–
          <QuranRef reference="36:27" />, we see the best evidence that the
          righteous go to Paradise, while their friends and relatives are still
          living on earth. Like going to Hawaii and waiting for us there.
        </p>
        <p>
          See also <QuranRef reference="16:32" /> &amp;{' '}
          <QuranRef reference="6:60" />–<QuranRef reference="6:62" />.
        </p>
      </section>

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
