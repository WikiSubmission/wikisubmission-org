import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
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
          &ldquo;He has chosen you and has placed no hardship on you in practicing your
          religion — the religion of your father Abraham. He is the one who named you
          &lsquo;Submitters&rsquo; (Muslims) originally.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="22:78" />
        </p>
      </div>

      {/* Introduction */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          One of the prevalent myths is that Muhammad was the founder of Islam. Although
          Islam — total submission to God alone — is the only religion recognized by God
          since the time of Adam (<QuranRef reference="3:19" />,{' '}
          <QuranRef reference="3:85" />), Abraham is reported in the Quran as the first
          user of the word &ldquo;Islam&rdquo; and the one who called us
          &ldquo;Muslims,&rdquo; i.e., Submitters (<QuranRef reference="22:78" />).
          Abraham&apos;s exemplary submission to God is demonstrated by his famous
          willingness to sacrifice his only son, Ismail, when he thought that was
          God&apos;s command. As it turns out, such a command was in fact from Satan.
        </p>
      </section>

      {/* God Never Ordered */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          God Never Ordered Abraham to Sacrifice His Son
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          God is the Most Merciful. He never violates His own law (<QuranRef reference="7:28" />).
          Any person who believes that the Most Merciful ordered Abraham to kill his son
          cannot possibly make it to God&apos;s Heaven. Such evil thought about God is
          grossly blasphemous. Nowhere in the Quran do we see that God ordered Abraham
          to kill his son. On the contrary, God intervened to save Abraham and Ismail
          from Satan&apos;s plot (<QuranRef reference="37:107" />), and He told Abraham:
          &ldquo;You believed the dream&rdquo; (<QuranRef reference="37:105" />).
          Undoubtedly, it was a dream inspired by Satan. God&apos;s irrevocable law is:
          &ldquo;God never advocates sin&rdquo; (<QuranRef reference="7:28" />).
        </p>
      </section>

      {/* Millat Ibrahim */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Millat Ibrahim — The Religion of Abraham
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Islam is called <em>Millat Ibrahim</em> (The Religion of Abraham) throughout
          the Quran (<QuranRef reference="2:130" />, <QuranRef reference="2:135" />,{' '}
          <QuranRef reference="3:95" />, <QuranRef reference="4:125" />,{' '}
          <QuranRef reference="6:161" />, <QuranRef reference="12:37-38" />,{' '}
          <QuranRef reference="16:123" />, <QuranRef reference="21:73" />,{' '}
          <QuranRef reference="22:78" />). Moreover, the Quran informs us that Muhammad
          was himself a follower of Abraham (<QuranRef reference="16:123" />).
        </p>
        <p>
          Due to a general unawareness of the fact that Abraham was the original
          messenger of Islam (Submission), many so-called Muslims challenge God:
          &ldquo;If the Quran is complete and fully detailed (as claimed by God), where
          can we find the number of Rak&apos;ahs (units) in each contact prayer
          (Salat)?&rdquo;
        </p>
        <p>
          We learn from the Quran that all religious practices of Islam were already
          established before the Quran&apos;s revelation (
          <QuranRef reference="8:35" />, <QuranRef reference="9:54" />,{' '}
          <QuranRef reference="16:123" />, <QuranRef reference="21:73" />,{' '}
          <QuranRef reference="22:27" />, <QuranRef reference="28:27" />). Verse{' '}
          <QuranRef reference="16:123" /> is direct proof that all religious practices
          in Islam were intact when Muhammad was born — Muhammad was enjoined to
          &ldquo;follow the religion of Abraham.&rdquo; If someone asks you to buy a
          color TV, it is assumed you know what a color TV is. Similarly, when God
          enjoined Muhammad to follow the practices of Abraham, such practices must have
          been well known.
        </p>
      </section>

      {/* Preserved Practices */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Divine Preservation of Religious Practices
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Another proof of divine preservation of the Islamic practices given to Abraham
          is their universal acceptance. There is no dispute among Muslims concerning the
          number of Rak&apos;ahs in all five daily prayers. This proves their divine
          preservation.
        </p>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <p className="font-semibold text-foreground">Mathematical Confirmation of the Five Prayers</p>
          <p className="text-foreground/80">
            The Quran&apos;s mathematical code confirms the number of Rak&apos;ahs in
            the five prayers: 2, 4, 4, 3, and 4, respectively. The number 24434 is a
            multiple of 19.
          </p>
        </div>

        <p>
          The Quran deals only with practices that were distorted. For example:
        </p>

        <ul className="space-y-2 text-foreground/80 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">&#8226;</span>
            The distorted ablution is restored in <QuranRef reference="5:6" /> to its
            original four steps.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">&#8226;</span>
            The tone of voice during contact prayers was distorted — many Muslims pray
            silently. This was corrected in <QuranRef reference="17:110" />.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">&#8226;</span>
            Fasting during Ramadan was modified in the Quran to allow intercourse during
            the night (<QuranRef reference="2:187" />).
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">&#8226;</span>
            Zakat is restored in <QuranRef reference="6:141" />, and Hajj is restored
            to the four correct months (see{' '}
            <Link href="/appendices/15" className="text-primary underline underline-offset-2">
              Appendix 15
            </Link>
            ).
          </li>
        </ul>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="zRNjUb2siNc" title="Appendix 9 — Abraham: Original Messenger of Islam" />
      </section>
    </>
  )
}
