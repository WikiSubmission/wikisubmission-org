import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
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
          &ldquo;(God is) the Knower of the future; He does not permit anyone to
          unveil such knowledge. Only through the messengers that He chooses does
          He reveal future and past events.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="72:27" />
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Among the duties charged to God&apos;s Messenger of the Covenant is
          unveiling the end of the world. We learn from{' '}
          <QuranRef reference="18:7" />-8 and <QuranRef reference="69:13" />-15
          that this world will come to an end. A new earth and new heavens will
          replace the present heavens and earth (<QuranRef reference="14:48" />).
        </p>
      </section>

      {/* ── Signs ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Signs of the Approaching End
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-4 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran provides many signs, and states that the means for unveiling the
          end of the world have been given (<QuranRef reference="47:18" />). The signs
          given in the Quran include:
        </p>

        <div className="space-y-3">
          {[
            {
              num: 1,
              title: 'The splitting of the moon',
              text: 'This already happened in June 1969 when we landed on the moon and brought back moon rocks. People on earth can now visit many museums, colleges, and observatories to look at pieces of the moon.',
            },
            {
              num: 2,
              title: "Discovering the Quran's 19-based mathematical code",
              ref: '74:30-37',
              text: 'Fulfilled in 1969-1974.',
            },
            {
              num: 3,
              title: 'The creature',
              ref: '27:82',
              text: '"Made from the earth, it alerts the people that they have been oblivious to their Creator." The Creature, made from the earth, did appear and was instrumental in unveiling the Quran\'s numerical code — the creature is the computer. Note that the digits that make up 27:82 add up to 19.',
            },
            {
              num: 4,
              title: "Appearance of God's Messenger of the Covenant",
              ref: '3:81',
              text: 'As detailed in Appendix 2, a consolidating messenger, prophesied in the Quran, comes after all the prophets have delivered the scriptures, to purify and unify. This prophecy was fulfilled in Ramadan 1408.',
              appendixRef: 2,
            },
            {
              num: 5,
              title: 'The Smoke',
              ref: '44:10',
              text: "Occurs after God's Messenger of the Covenant has delivered the unified message and proclaimed Submission (Islam) as the only religion acceptable by God.",
            },
            {
              num: 6,
              title: 'Gog and Magog',
              text: 'They re-appear, in accordance with God\'s plan, in the year 1700 AH (2271 AD). Gog and Magog are mentioned in 18:94 and 21:96. If you count the verses from 18:94 to the end of Sura 18, you find 17. If you count the verses from 21:96 to the end of Sura 21, you also find 17. This is the Quran\'s sign that Gog and Magog will re-appear in 1700 AH.',
              refs: ['18:94', '21:96'],
            },
          ].map((sign) => (
            <div key={sign.num} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {sign.num}
              </span>
              <div className="text-sm leading-relaxed space-y-1">
                <p className="font-semibold text-foreground">
                  {sign.title}
                  {sign.ref && (
                    <>
                      {' '}
                      (<QuranRef reference={sign.ref} />)
                    </>
                  )}
                  {sign.refs && (
                    <>
                      {' '}
                      (
                      {sign.refs.map((r, i) => (
                        <span key={r}>
                          <QuranRef reference={r} />
                          {i < sign.refs!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                      )
                    </>
                  )}
                </p>
                <p className="text-foreground/80">
                  {sign.text}
                  {sign.appendixRef && (
                    <>
                      {' '}See{' '}
                      <Link
                        href={`/appendices/${sign.appendixRef}`}
                        className="text-primary underline underline-offset-2"
                      >
                        Appendix {sign.appendixRef}
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── It Will Not Remain Hidden ──────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          It Will Not Remain Hidden
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Verse 15 of Sura 20 informs us that the end of the world will be revealed
          by God before the end of the world (<QuranRef reference="20:15" />), and
          Sura 15, Verse 87, gives the time for that event:
        </p>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2"
        >
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            &ldquo;We have given you the seven pairs, and the great Quran.&rdquo;
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            <QuranRef reference="15:87" />
          </p>
        </div>

        <p>
          The seven pairs are the 14 Quranic Initials. The total gematrical value of
          these profound pillars of the Quran&apos;s miracle pinpoints the year of
          the end of the world. It is noteworthy that Verse 85 of Sura 15 states:
          &ldquo;The end of the world will surely come to pass.&rdquo; The next
          verse, <QuranRef reference="15:86" />, tells us that God is the Creator of
          this world, and, of course, He knows when it will end. The following verse,{' '}
          <QuranRef reference="15:87" />, tells us when the world will end.
        </p>
        <p>
          As shown in Table 1, the gematrical values of &ldquo;The Seven Pairs&rdquo;
          of Quranic Initials total 1709 (see also Table 1 of{' '}
          <Link href="/appendices/1" className="text-primary underline underline-offset-2">
            Appendix 1
          </Link>
          ). According to <QuranRef reference="15:87" />, the world will survive for
          1709 lunar years from the time this prophecy is stated in the Quran. This
          means that the world will end in the year 1710 AH — a multiple of 19:
          1710 = 19×90.
        </p>
      </section>

      {/* ── Table 1: Gematrical Values ────────────────────────────────────── */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Table 1: Total Gematrical Value of &ldquo;The Seven Pairs&rdquo; of Quranic Initials
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Quranic Initial
                </th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                  Gematrical Value
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 'Q', 100],
                [2, 'N', 50],
                [3, 'S (Saad)', 90],
                [4, 'H.M.', 48],
                [5, 'Y.S.', 70],
                [6, 'T.H.', 14],
                [7, 'T.S.', 69],
                [8, 'A.L.M.', 71],
                [9, 'A.L.R.', 231],
                [10, 'T.S.M.', 109],
                [11, '`A.S.Q.', 230],
                [12, 'A.L.M.S.', 161],
                [13, 'A.L.M.R.', 271],
                [14, 'K.H.Y.`A.S.', 195],
              ].map(([num, initial, val]) => (
                <tr
                  key={num}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-1.5 font-mono text-xs text-muted-foreground">{num}</td>
                  <td className="px-4 py-1.5 font-mono text-xs text-primary font-medium">
                    {initial}
                  </td>
                  <td className="px-4 py-1.5 font-mono text-xs text-right">{val}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 font-semibold border-t border-border/40">
                <td colSpan={2} className="px-4 py-2 text-xs text-right text-muted-foreground">
                  Total =
                </td>
                <td className="px-4 py-2 font-mono text-xs text-primary text-right">
                  1709
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Year 2280 AD ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Year 2280 AD
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The unveiling of this information took place in the year 1400 AH, 309 years
          before the prophesied end of the world (1709 - 1400 = 309). The number 309
          is a Quranic number (<QuranRef reference="18:25" />), and is connected with
          the end of the world (<QuranRef reference="18:21" />). The peculiar way of
          writing 309 in <QuranRef reference="18:25" /> — &ldquo;Three hundred years,
          increased by nine&rdquo; — indicates that the 309 are lunar years. The
          difference between 300 solar years and 300 lunar years is 9 years.
        </p>
        <p>
          The year of this discovery, 1400 AH, coincided with 1980 AD, and 1980 plus
          300 solar years is 2280, which is also a multiple of 19: 19×120. Thus the
          world ends in 1710 AH (19×90), which coincides with 2280 AD (19×120).
        </p>
        <p>
          For the disbelievers who do not accept these powerful Quranic proofs, the
          end of the world will come suddenly (
          <QuranRef reference="6:31" />, <QuranRef reference="6:44" />,{' '}
          <QuranRef reference="6:47" />; <QuranRef reference="7:95" />,{' '}
          <QuranRef reference="7:187" />; <QuranRef reference="12:107" />;{' '}
          <QuranRef reference="21:40" />, <QuranRef reference="22:55" />;{' '}
          <QuranRef reference="26:202" />; <QuranRef reference="29:53" />;{' '}
          <QuranRef reference="39:55" />; <QuranRef reference="43:66" />; and{' '}
          <QuranRef reference="47:18" />).
        </p>
      </section>

      {/* ── Historical Hadith Corroboration ───────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Historical Corroboration
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          While Hadith is forbidden as a source of religious teachings (
          <Link href="/appendices/19" className="text-primary underline underline-offset-2">
            Appendix 19
          </Link>
          ), it can be a useful source of history. The books of Hadith indicate that
          the Quranic Initials were believed to determine the life span of the Muslim{' '}
          <em>Ummah</em>. The classic exegesis by Al-Baydaawy cites the following
          historical event, also detailed in Al-Suyooty&apos;s <em>Itqaan</em>
          (First Printing, 1318 AH, Vol 2, Page 10):
        </p>
      </section>

      <div
        data-card
        className="rounded-xl border border-border/60 p-5 text-sm leading-relaxed text-foreground/85 space-y-3 italic"
      >
        <p>
          The Jews of Medina went to the Prophet and said, &ldquo;Your Quran is
          initialed with A.L.M., and these Initials determine the life span of your
          religion. Since &lsquo;A&rsquo; is 1, &lsquo;L&rsquo; is 30, and
          &lsquo;M&rsquo; is 40, this means that your religion will survive only 71
          years.&rdquo; Muhammad said, &ldquo;We also have A.L.M.S.&rdquo; They
          said, &ldquo;The &lsquo;A&rsquo; is 1, the &lsquo;L&rsquo; is 30, the
          &lsquo;M&rsquo; is 40, and the &lsquo;S&rsquo; is 90. This adds up to 161.
          Do you have anything else?&rdquo; The Prophet said, &ldquo;Yes, A.L.M.R.&rdquo;
          They said, &ldquo;This is longer and heavier; the &lsquo;A&rsquo; is 1,
          &lsquo;L&rsquo; is 30, &lsquo;M&rsquo; is 40, and &lsquo;R&rsquo; is 200,
          making the total 271.&rdquo; They finally gave up, saying, &ldquo;We do
          not know how many of these Initials he was given!&rdquo;
        </p>
        <p className="not-italic text-xs text-muted-foreground font-mono">
          [Al-Suyuty&apos;s Famous Reference: Itqaan]
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Although this narration is well known, many scholars have been reluctant to
          accept the unmistakable connection between the Quranic Initials and the end
          of the world. They could not bring themselves to deal with this subject for
          the simple reason that the calculation makes the end of the world, and
          judgment, a reality.
        </p>
      </section>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="D1SfcV27g3k" title="Appendix 25 — End of the World" />
      </section>
    </>
  )
}
