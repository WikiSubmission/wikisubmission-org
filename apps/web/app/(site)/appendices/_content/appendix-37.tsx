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
          &ldquo;O you who believe, equivalence is the law decreed for you when dealing with
          murder — the free for the free, the slave for the slave, and the female for the
          female.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="2:178" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          If a thief steals a thousand dollars from you, and they put him in prison, what do
          you get? If the thief has a wife and children, what is their crime? Why should they
          be deprived of their father?
        </p>
        <p>
          The Quran solves this problem, as well as the problems associated with the criminal
          justice systems prevalent in today&apos;s world.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Equivalence is the Law — <QuranRef reference="2:178-179" />
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          According to the Quranic criminal justice, the thief who is convicted of stealing a
          thousand dollars from you must work for you until you are fully paid for the thousand
          dollars you lost, plus any other damage and inconvenience the theft may have caused
          you. At the same time, the thief&apos;s innocent wife and children are not deprived
          of their man, and the expensive prison system is eliminated. Imprisonment is a cruel
          and inhumane punishment that has proven useless to all concerned.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Thief&apos;s Hand
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Contrary to common belief, the thief&apos;s hand shall not be cut off. Thanks to
          God&apos;s mercy and the mathematical miracle in the Quran, we know now that the
          thief&apos;s hand is to be <em>marked</em>. Marking the hand of the thief is stated
          in <QuranRef reference="5:38" />. The sura and verse numbers add up to 5+38&nbsp;=&nbsp;43.
        </p>
        <p>
          The other place in the Quran where &ldquo;the hand is cut&rdquo; is found in{' '}
          <QuranRef reference="12:31" />. This is where we see the women who admired Joseph so
          much that they &ldquo;cut&rdquo; their hands. Obviously, they did not sever their
          hands — no one can do that. The sura and verse numbers add up to
          12+31&nbsp;=&nbsp;43, the same total as in <QuranRef reference="5:38" />. This gives
          mathematical confirmation that the Quranic law calls for marking the hand of the
          thief, not severing it. Additional confirmation: 19 verses after{' '}
          <QuranRef reference="12:31" />, we see the &ldquo;cutting of the hand&rdquo; again.
          Punishment in Submission (Islam) is based on equivalence and social pressure (
          <QuranRef reference="2:178" />, <QuranRef reference="5:38" />,{' '}
          <QuranRef reference="24:2" />).
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Adultery and Murder
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The blasphemy called &ldquo;Hadith &amp; Sunna&rdquo; instituted stoning to death as
          the punishment for married adulterers. This is not God&apos;s law. As stated in{' '}
          <QuranRef reference="24:2" />, the punishment for adultery is whipping in public — a
          hundred symbolic lashes. The basic punishment is social pressure and scandalizing the
          criminal. Whipping in public achieves this goal.
        </p>
        <p>
          In dealing with murder, the Quran definitely discourages capital punishment (
          <QuranRef reference="2:179" />). &ldquo;The free for the free, the slave for the
          slave, and the female for the female&rdquo; (<QuranRef reference="2:178" />). Due to
          human meanness and injustice, many people refuse to accept the clear injunctions that
          strict equivalence must be observed — if a woman kills a man, or a man kills a woman,
          or a slave kills a free person, or a free person kills a slave, capital punishment
          cannot be applied.
        </p>
        <p>
          The Quran prefers that the murderer compensate the victim&apos;s family. Killing the
          murderer does not bring the victim back, nor does the family of the victim benefit
          from executing the murderer. The compensation, however, must be sufficient to be a
          deterrent for others. In Submission (Islam), the victim and/or the victim&apos;s
          family are the judges for all crimes — they decide what the punishment shall be under
          the supervision of a person who knows the Quran.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="WZ6gxmN61V4" title="Appendix 37 — Criminal Justice" />
      </section>
    </>
  )
}
