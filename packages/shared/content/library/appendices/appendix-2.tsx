import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'

export function AppendixContent() {
  return (
    <>
      {/* Opening verse card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;God took a covenant from the prophets, saying, &lsquo;After I have given you
          the scripture and wisdom, a messenger will come to confirm what you have. You shall
          believe in him and support him.&rsquo; He said, &lsquo;Do you agree with this, and
          pledge to uphold this covenant?&rsquo; They said, &lsquo;We agree.&rsquo; He said,
          &lsquo;You have thus borne witness, and I am with you a witness.&rsquo;&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:81" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          God&apos;s Messenger of the Covenant is a consolidating messenger. His mission
          is to purify and unify all existing religions into one: Submission (Islam).
          Islam is NOT a name; it is a description of one&apos;s total submission and devotion to God
          ALONE, without idolizing Jesus, Mary, Muhammad, or the saints. Anyone meeting
          this criterion qualifies as a &ldquo;Muslim&rdquo; (Submitter) — Muslim Jews,
          Muslim Christians, and so on.
        </p>
        <p>
          The Quran is clear that the only religion approved by God is Submission
          (<QuranRef reference="3:19" />), and that anyone who seeks other than Submission
          as a religion, it will not be accepted (<QuranRef reference="3:85" />).
        </p>
        <p>
          All previous messengers required divine proof of their messengership: Moses
          transformed his staff into a serpent, Jesus healed lepers and revived the dead,
          Saleh produced the famous camel, Abraham walked out of fire, and Muhammad&apos;s
          proof was the Quran itself (<QuranRef reference="29:50-51" />). A new messenger
          likewise requires divine, incontrovertible proof.
        </p>
      </section>

      {/* A Quranic Truth */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Quranic Truth
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <QuranRef reference="33:7" />: &ldquo;And when we exacted a covenant from the
          Prophets, and from thee (O Muhammad) and from Noah and Abraham and Moses and
          Jesus son of Mary, We took from them a solemn covenant.&rdquo;
        </p>
      </section>

      {/* Nabi vs. Rasoul */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Prophet vs. Messenger
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran makes a critical distinction between <em>Nabi</em> (Prophet) and{' '}
          <em>Rasoul</em> (Messenger). A prophet delivers a new scripture, while a
          messenger confirms existing scripture without bringing new revelation. Every
          prophet is also a messenger, but not every messenger is a prophet.
        </p>
        <p>
          Not every messenger received a new scripture. Some assume Aaron was a prophet
          (<QuranRef reference="19:53" />) who was given no scripture, yet the Quran states the
          Torah was given &ldquo;to both Moses and Aaron&rdquo; (<QuranRef reference="21:48" />,{' '}
          <QuranRef reference="37:117" />). It has also always been a human trait to reject a
          living messenger: Joseph was even declared &ldquo;the last messenger&rdquo;
          (<QuranRef reference="40:34" />), though Moses, David, Solomon, Jesus, and Muhammad all
          came after him.
        </p>
        <p>
          <QuranRef reference="33:40" /> states: &ldquo;Muhammad was not the father of
          any of your men; he was a messenger (Rasoul) of God and the last prophet
          (Nabi).&rdquo; Muhammad was thus the last prophet — no new scripture after
          him — but messengers can and do come after him. The gematrical value of
          &ldquo;Muhammad Khaatum Al-Nabiyyeen&rdquo; (the last prophet), plus the sura
          number (33) and the verse number (40), equals 1349, or 19×71. By contrast, the
          value of the erroneous expression &ldquo;Muhammad Khaatum Al-Mursaleen&rdquo;
          (the last messenger) is not a multiple of 19 — confirming the distinction through
          the Quran&apos;s mathematical code.
        </p>
      </section>

      {/* Prophecy */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Prophecy
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          References to a consolidating messenger appear throughout the Quran at{' '}
          <QuranRef reference="3:81" />, <QuranRef reference="33:7" />, and{' '}
          <QuranRef reference="33:40" />. This prophecy is also found in the Bible at
          Malachi 3:1–3: &ldquo;Lo, I am sending my messenger to prepare the way before
          me; and suddenly there will come to the temple the Lord whom you seek and the
          messenger of the covenant whom you desire.&rdquo;
        </p>
        <p>
          The covenant was confirmed in a personal experience during the Hajj pilgrimage
          on Zul-Hijjah 3, 1391 (December 21, 1971): &ldquo;I was sitting still, while
          the prophets, one by one, came towards me, looked at my face, then nodded their
          heads.&rdquo; Notably, the numerical sum of month (12) + day (3) + year (1391)
          = 1406 = 19×74. The number 19 is mentioned in Sura 74. The number 1406 is also the
          count of years from the revelation of the Quran to the revelation of its miracle
          (<Link href="/appendices/1" className="text-primary underline underline-offset-2">Appendix 1</Link>).
        </p>
      </section>

      {/* Mathematical proof */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Proof
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The name of God&apos;s Messenger of the Covenant is mathematically coded into the
          Quran as &ldquo;Rashad Khalifa&rdquo; — the most appropriate way to introduce
          God&apos;s messenger to the world in the computer age. The following is physical,
          examinable, verifiable, and irrefutable evidence.
        </p>
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <ul className="space-y-2 text-foreground/80">
            <li>
              &bull; <strong>(1)</strong> The Quran&apos;s 19-based miracle remained hidden for
              1406 years (19×74), predestined to be unveiled through Rashad Khalifa. For fourteen
              centuries, hundreds of Muslim and Orientalist scholars tried in vain to decipher
              the Quranic Initials.
            </li>
            <li>
              &bull; <strong>(2)</strong> The Quran is made easy only for sincere believers
              (<QuranRef reference="54:17" />, <QuranRef reference="39:28" />). No one is granted
              access to the Quran — let alone its miracle — without specific divine authorization
              (<QuranRef reference="17:45-46" />, <QuranRef reference="18:57" />,{' '}
              <QuranRef reference="41:44" />, <QuranRef reference="56:79" />). Its unveiling
              through Rashad Khalifa is a major sign of his messengership.
            </li>
          </ul>
        </div>
      </section>

      {/* Table 1: Rashada and Khalifa occurrences */}
      <div
        data-card
        className="rounded-xl border border-border/60 overflow-hidden"
      >
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Table 1: Suras and Verses of &ldquo;Rashada&rdquo; and &ldquo;Khalifa&rdquo;
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">
                  #
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Sura
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Verse
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 2, 186],
                [2, '—', 256],
                [3, 4, 6],
                [4, 7, 146],
                [5, 11, 78],
                [6, '—', 87],
                [7, '—', 97],
                [8, 18, 10],
                [9, '—', 17],
                [10, '—', 24],
                [11, '—', 66],
                [12, 21, 51],
                [13, 40, 29],
                [14, '—', 38],
                [15, 49, 7],
                [16, 72, 2],
                [17, '—', 10],
                [18, '—', 14],
                [19, '—', 21],
              ].map(([n, sura, verse]) => (
                <tr
                  key={n as number}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {n}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-primary font-medium">
                    {sura}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{verse}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border/40 bg-muted/30 font-semibold">
                <td className="px-4 py-2 text-xs" colSpan={1}>
                  Totals
                </td>
                <td className="px-4 py-2 font-mono text-xs text-primary">224</td>
                <td className="px-4 py-2 font-mono text-xs">1145</td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border/20 space-y-1">
            <p>
              Repeated sura numbers are shown as &ldquo;—&rdquo; and counted once: the nine
              distinct suras sum to 224, and the nineteen verse numbers sum to 1145.
            </p>
            <p>
              &ldquo;Khalifa&rdquo; occurs at 2:30 (a non-human khalifa — Satan) and 38:26 (a
              human khalifa). Sura 2 is already counted above, so &ldquo;Khalifa&rdquo; adds
              sura 38 and verses 30 + 26 = 56. Grand total: 224 + 1145 + 38 + 56 = 1463 = 19×77.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        {/* Proof 3 */}
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <p className="font-semibold text-foreground">Numbered Mathematical Proofs</p>
          <ul className="space-y-2 text-foreground/80">
            <li>
              &bull; <strong>(3)</strong> The root word &ldquo;Rashada&rdquo; (to uphold the
              right guidance) occurs in the Quran exactly 19 times — the Quran&apos;s common
              denominator.
            </li>
            <li>
              &bull; <strong>(4)</strong> &ldquo;Rashad&rdquo; occurs at 40:29 and 40:38.
              &ldquo;Khalifa&rdquo; occurs at 2:30 (a non-human khalifa — Satan) and 38:26
              (a human khalifa). Adding the suras and verses of &ldquo;Rashad&rdquo; (40:29, 38)
              and the human &ldquo;Khalifa&rdquo; (38:26): 40+29+38+38+26 = 171 = 19×9.
            </li>
            <li>
              &bull; <strong>(5)</strong> The sum of all sura and verse numbers where
              &ldquo;Rashada&rdquo; and &ldquo;Khalifa&rdquo; occur, combined = 1463 = 19×77.
            </li>
            <li>
              &bull; <strong>(6)</strong> &ldquo;Rashada&rdquo; total = 1369 = (19×72) + 1;
              &ldquo;Khalifa&rdquo; total = 94 = (19×5) − 1. &ldquo;Rashada&rdquo; up by one and
              &ldquo;Khalifa&rdquo; down by one pins the name to &ldquo;Rashad Khalifa&rdquo; —
              not any other Rashad or Khalifa.
            </li>
            <li>
              &bull; <strong>(7)</strong> Gematrical value of &ldquo;Rashad&rdquo; = 505;
              &ldquo;Khalifa&rdquo; = 725 (combined 1230). From the beginning of the Quran
              to the first &ldquo;Rashada&rdquo; (2:186): 3 suras, 192 verses.
              505 + 725 + 3 + 192 = 1425 = 19×75.
            </li>
            <li>
              &bull; <strong>(8)</strong> The sum of all verse numbers from 1:1 through 2:186
              (first &ldquo;Rashada&rdquo;) = 17,233 = 19×907.
            </li>
            <li>
              &bull; <strong>(9)</strong> The Quranic Initials appear in 29 suras; the sum of
              those sura numbers = 822. 822 + 1230 (Rashad Khalifa) = 2052 = 19×108.
            </li>
            <li>
              &bull; <strong>(10)</strong> The sura numbers plus their verse counts for all suras
              containing &ldquo;Rashada&rdquo; = 1368 = 19×72.
            </li>
            <li>
              &bull; <strong>(11)</strong> Writing each sura number, followed by its number of
              verses, followed by the individual verse numbers, from the first &ldquo;Rashada&rdquo;
              (2:186) to the last (72:21), produces a single number of 11,087 digits that is
              divisible by 19.
            </li>
            <li>
              &bull; <strong>(12)</strong> From the first &ldquo;Rashada&rdquo; to the word
              &ldquo;Khalifa&rdquo; in 38:26, the sum of the sura numbers and their verse counts
              = 4541 = 19×239.
            </li>
            <li>
              &bull; <strong>(13)</strong> Writing the value of &ldquo;Rashad&rdquo; (505), then
              &ldquo;Khalifa&rdquo; (725), then every sura and verse number where
              &ldquo;Rashada&rdquo; occurs from 2:186 to &ldquo;Khalifa&rdquo; (38:26), produces a
              number divisible by 19.
            </li>
          </ul>
        </div>

        {/* Three Messengers (14) + Five Messengers (15) */}
        <p>
          <strong>(14)</strong> The Quran specifies three messengers of Submission (Islam):
          Abraham, who delivered all the practices of Islam (gematrical value 258); Muhammad,
          who delivered the Quran (92); and Rashad, who delivered Islam&apos;s proof of
          authenticity (505). Total: 258 + 92 + 505 = 855 = 19×45.
        </p>
        <p>
          The true Judaism, Christianity, and Islam will be consolidated into one religion —
          complete submission and absolute devotion to God ALONE. The existing religions are
          severely corrupted and will die out (<QuranRef reference="9:33" />,{' '}
          <QuranRef reference="48:28" />, <QuranRef reference="61:9" />).
        </p>
        <p>
          <strong>(15)</strong> Since the Quran sometimes refers to &ldquo;Abraham, Ismail, and
          Isaac,&rdquo; the gematrical values of all five messengers were added — and the total
          remains a multiple of 19:
        </p>
      </section>

      <div
        data-card
        className="rounded-xl border border-border/60 overflow-hidden"
      >
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gematrical Values of the Five Messengers
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Letter Values
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Abraham', '1+2+200+5+10+40', 258],
                ['Ismail', '1+60+40+70+10+30', 211],
                ['Isaac', '1+60+8+100', 169],
                ['Muhammad', '40+8+40+4', 92],
                ['Rashad', '200+300+1+4', 505],
              ].map(([name, letters, total], i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 text-xs font-medium">{name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {letters}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-primary font-medium">
                    {total}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border/40 bg-muted/30 font-semibold">
                <td className="px-4 py-2 text-xs" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-2 font-mono text-xs text-primary">
                  1235 = 19×65
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This divisibility by 19 is not possible if any of the three names Abraham,
          Muhammad, or Rashad is omitted.
        </p>

        {/* Proofs 16-20: Verse 3:81 */}
        <p>
          <strong>Verse 3:81</strong> carries profound mathematical confirmation:
        </p>
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <ul className="space-y-2 text-foreground/80">
            <li>
              &bull; <strong>(16)</strong> 505 (Rashad) + 725 (Khalifa) + 81 (verse number)
              = 1311 = 19×69.
            </li>
            <li>
              &bull; <strong>(17)</strong> Sura 81, verse 19 mentions a messenger
              &ldquo;powerfully supported and authorized.&rdquo;
            </li>
            <li>
              &bull; <strong>(18)</strong> From 1:1 to 3:81: Sura 1 (7 verses) + Sura 2
              (286 verses) + Sura 3 (81 verses) = 374 verses. 1+2+3+7+286+81 = 380 = 19×20.
            </li>
            <li>
              &bull; <strong>(19)</strong> The gematrical value of the entire verse 3:81
              = 13,148 = 19×692.
            </li>
            <li>
              &bull; <strong>(20)</strong> The key phrase &ldquo;JAA&apos;AKUM RASOOLUN
              MUSADDIQUN LEMAA MA&apos;AKUM&rdquo; (a messenger will come to confirm what
              you have) = 836 = 19×44.
            </li>
          </ul>
        </div>
      </section>

      {/* Verse 36:3 */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;Surely, you are one of the messengers.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="36:3" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>(21)</strong> Among the initialed suras, Sura 36 (Ya Seen) occupies position
          number 19. The identity of the messenger in 36:3 was revealed through the angel
          Gabriel.
        </p>
        <p>
          <strong>(22)</strong> The gematrical value of verse 36:3 is 612.
          Calculation: 36 + 3 + 612 + 505 + 725 = 1881 = 19×99.
        </p>
        <p>
          <strong>(23)</strong> Sura 36 has 83 verses: 36 + 83 + 505 + 725 = 1349 = 19×71.
        </p>
        <p>
          <strong>(24)</strong> From 3:81 to Sura 36 there are 3330 verses.
          505 + 725 + 3330 = 4560 = 19×240.
        </p>
        <p>
          <strong>(25)</strong> From 3:81 to 36:3 there are exactly 3333 verses.
          3333 + 505 = 3838 = 19×202.
        </p>
        <p>
          <strong>(26)</strong> From 1:1 to 36:3 there are 3705 verses = 19×195.
        </p>
        <p>
          <strong>(27)</strong> The sum of all verse numbers from 1:1 to 36:3 = 257,925 = 19×13,575.
        </p>
        <p>
          <strong>(28)</strong> The sum of sura numbers 1 through 36 = 666.
          Calculation: 666 + 505 + 725 + 612 = 2508 = 19×132.
        </p>
        <p>
          <strong>(29–30)</strong> From the first &ldquo;Rashada&rdquo; (2:186) to 36:3,
          the sum of sura numbers = 665 = 19×35, representing 35 suras. The full sum of
          sura totals + verse numbers = 241,395 = 19×12,705.
        </p>
      </section>

      {/* A Messenger to the People of the Scripture [5:19] */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Messenger to the People of the Scripture
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;O people of the scripture, our messenger has come to you, to clarify
          things for you, after a long period without messengers. Lest you say,
          &lsquo;No preacher or warner has come to us.&rsquo; A preacher and warner
          has come to you. God is Omnipotent.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="5:19" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>(31)</strong> The verse number is 19 — the Quran&apos;s common denominator
          and the number of &ldquo;Rashada&rdquo; occurrences.
        </p>
        <p>
          <strong>(32)</strong> 1230 (Rashad Khalifa) + 5 (sura) + 19 (verse) = 1254 = 19×66.
        </p>
        <p>
          <strong>(33)</strong> From the beginning of the Quran through 5:19:
          Sura 1 (7 verses) + Sura 2 (286) + Sura 3 (200) + Sura 4 (176) + Sura 5 (19)
          = 688 verses total; 1+2+3+4+5+7+286+200+176+19 = 703 = 19×37.
        </p>
      </section>

      {/* Sura 98 - The Proof */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Proof (Sura 98)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <QuranRef reference="98:1-2" />: &ldquo;Those who disbelieved among the people of
          the scripture, and the idolators, will not believe, despite the profound sign given
          to them. A messenger from God, reciting Sacred Scriptures.&rdquo;
        </p>
        <p>
          <strong>(34)</strong> 505 (Rashad) + 725 (Khalifa) + 98 (sura) + 2 (verse)
          = 1330 = 19×70.
        </p>
        <p>
          <strong>(35)</strong> The word &ldquo;Bayyinah&rdquo; (profound sign), the title
          of Sura 98, occurs in the Quran exactly 19 times — confirming that the Quran&apos;s
          proof is based on 19.
        </p>
      </section>

      {/* A Profound Messenger [44:13] */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Profound Messenger Has Come
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          <strong>(36)</strong> From 1:1 to 44:13: the sum of sura numbers = 990, verse
          numbers = 4425. Combined: 5415 = 19×19×15.
        </p>
        <p>
          <strong>(37)</strong> Sura number (44) + verse number (13) = 57 = 19×3.
        </p>
      </section>

      {/* End of World */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          End of the World
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          God alone knows the end of the world (<QuranRef reference="7:187" />,{' '}
          <QuranRef reference="31:34" />, <QuranRef reference="33:63" />,{' '}
          <QuranRef reference="41:47" />, <QuranRef reference="43:85" />), yet He
          chooses to reveal certain knowledge to messengers He selects (
          <QuranRef reference="72:27" />).
        </p>
        <p>
          <strong>(38–39)</strong> Total verses from the beginning of the Quran to 72:27
          = 5472 = 19×72×4. Sura 72 contains four occurrences of
          &ldquo;Rashada&rdquo; at verses 2, 10, 14, and 21. The sum 1230+72+2+10+14+21
          = 1349 = 19×71.
        </p>
        <p>
          <strong>(40)</strong> The opening phrase of <QuranRef reference="72:27" />,
          &ldquo;Only the Messenger that He chooses,&rdquo; has a gematrical value of
          1919.
        </p>
      </section>

      {/* Mercy from God */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Mercy from God
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          When the believers are faced with a problem, they develop a number of possible
          solutions, and this invariably leads to considerable bickering, disunity, and
          disarray. It is but mercy from God that He sends to us messengers to provide
          the final solutions to our problems (<QuranRef reference="2:151" />,{' '}
          <QuranRef reference="3:164" />, <QuranRef reference="21:107" />).
        </p>
        <p>
          God sends His messengers to communicate with us, and to disseminate new
          information (<QuranRef reference="42:51" />). We are enjoined to accept,
          without the slightest hesitation, the teachings delivered to us through
          God&apos;s messengers (<QuranRef reference="4:65" />,{' '}
          <QuranRef reference="4:80" />).
        </p>
      </section>

      {/* Criteria */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Criteria for God&apos;s Messenger
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>Three minimum criteria identify God&apos;s Messenger of the Covenant:</p>
        <ol className="space-y-3 list-none">
          {[
            'God\'s messenger advocates the worship of God ALONE, and the abolition of all forms of idol worship.',
            'God\'s messenger never asks for a wage for himself.',
            'God\'s messenger is given divine, incontrovertible proof of his messengership.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
        <p>
          The most important difference between God&apos;s messenger and a fake messenger
          is that God&apos;s messenger is supported by God, while the fake messenger is not.
          God&apos;s messenger is supported by God&apos;s invisible soldiers (
          <QuranRef reference="3:124-126" />, <QuranRef reference="9:26" />,{' '}
          <QuranRef reference="9:40" />, <QuranRef reference="33:9" />,{' '}
          <QuranRef reference="37:171-173" />, <QuranRef reference="48:4" />,{' '}
          <QuranRef reference="48:7" />, <QuranRef reference="74:31" />), by
          God&apos;s treasury (<QuranRef reference="63:7-8" />), and is guaranteed
          victory and dignity, in this world and forever (
          <QuranRef reference="40:51" />, <QuranRef reference="58:21" />).
        </p>
        <p>
          Thus, the truthfulness of God&apos;s messenger invariably prevails, while
          the falsehood of a fake messenger invariably, sooner or later, is exposed.
        </p>
      </section>

      {/* Principal Duties */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Principal Duties
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>The principal duties of God&apos;s Messenger of the Covenant include:</p>
        <ol className="space-y-2 list-none">
          {[
            <>Unveil the Quran&apos;s mathematical miracle (<Link href="/appendices/1" className="text-primary underline underline-offset-2">Appendix 1</Link>).</>,
            <>Remove the false verses 9:128–129 (<Link href="/appendices/24" className="text-primary underline underline-offset-2">Appendix 24</Link>).</>,
            <>Explain the purpose of our life (<Link href="/appendices/7" className="text-primary underline underline-offset-2">Appendix 7</Link>).</>,
            <>Proclaim one religion and purge corruptions from Judaism, Christianity, and Islam (<Link href="/appendices/13" className="text-primary underline underline-offset-2">Appendix 13</Link>, <Link href="/appendices/15" className="text-primary underline underline-offset-2">15</Link>, <Link href="/appendices/19" className="text-primary underline underline-offset-2">19</Link>).</>,
            <>Proclaim Zakat as a prerequisite for redemption (<QuranRef reference="7:156" />) and explain its correct practice (<Link href="/appendices/15" className="text-primary underline underline-offset-2">Appendix 15</Link>).</>,
            <>Unveil the end of the world (<Link href="/appendices/25" className="text-primary underline underline-offset-2">Appendix 25</Link>).</>,
            <>Proclaim that those who die before the age of 40 are destined for Heaven (<Link href="/appendices/32" className="text-primary underline underline-offset-2">Appendix 32</Link>).</>,
            <>Explain the death of Jesus (<Link href="/appendices/22" className="text-primary underline underline-offset-2">Appendix 22</Link>).</>,
            <>Explain the delivery of the Quran through Muhammad (<Link href="/appendices/28" className="text-primary underline underline-offset-2">Appendix 28</Link>).</>,
            <>Announce that Muhammad wrote the Quran with his own hand (<Link href="/appendices/28" className="text-primary underline underline-offset-2">Appendix 28</Link>).</>,
            <>Explain why most believers do not reach Heaven (<Link href="/appendices/27" className="text-primary underline underline-offset-2">Appendix 27</Link>).</>,
            <>Proclaim that God never ordered Abraham to kill his son (<Link href="/appendices/9" className="text-primary underline underline-offset-2">Appendix 9</Link>).</>,
            <>Proclaim the secret of perfect happiness (Introduction).</>,
            <>Establish the Quran&apos;s criminal justice system (<Link href="/appendices/37" className="text-primary underline underline-offset-2">Appendix 37</Link>).</>,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
