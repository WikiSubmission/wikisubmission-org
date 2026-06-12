import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'

export function AppendixContent() {
  return (
    <>
      {/* Opening card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;Worship Me to attain certainty.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="15:99" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Abraham sought the ability to &ldquo;observe the contact prayers
          (Salat)&rdquo; (<QuranRef reference="14:40" />) rather than
          material blessings. Religious duties instituted by God are in fact
          a great gift from Him — necessary for spiritual nourishment (
          <QuranRef reference="6:158" />, <QuranRef reference="10:90" />–
          <QuranRef reference="10:92" />) and as a means of attaining
          certainty (<QuranRef reference="15:99" />).
        </p>
      </section>

      {/* ── Contact Prayers ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Contact Prayers (Salat)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The five daily contact prayers are the main meals for the soul.
          Salat was established through Abraham (
          <QuranRef reference="8:35" />; <QuranRef reference="9:54" />;{' '}
          <QuranRef reference="16:123" />; <QuranRef reference="21:73" />)
          and must be devoted to God alone (
          <QuranRef reference="20:14" />, <QuranRef reference="39:3" />–
          <QuranRef reference="39:45" />). Commemorating Muhammad and his
          family, or Abraham and his family, within the prayers renders them
          null and void (<QuranRef reference="39:65" />).
        </p>
        <p>
          The Friday congregational noon prayer is an obligatory duty upon
          every Submitting man and woman (<QuranRef reference="62:9" />).
        </p>
      </section>

      {/* Prayer times table */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The Five Daily Prayers
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Prayer</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Time</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">Units</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Reference</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Dawn (Fajr)', 'Two hours before sunrise', '2', '11:114, 24:58'],
                ['Noon (Zuhr)', 'When sun declines from its highest point', '4', '17:78'],
                ['Afternoon (Asr)', 'Three to four hours before sunset', '4', '2:238'],
                ['Sunset (Maghrib)', 'After sunset', '3', '11:114'],
                ['Night (Isha)', "After twilight disappears", '4', '24:58'],
              ].map(([prayer, time, units, refs], i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 font-medium text-xs">{prayer}</td>
                  <td className="px-4 py-2 text-xs text-foreground/70">{time}</td>
                  <td className="px-4 py-2 font-mono text-xs text-primary font-bold">{units}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{refs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border/20 bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Total daily units: 17 (2 + 4 + 4 + 3 + 4). On Fridays: 15 units (noon replaced by 2-unit congregational prayer).
          </p>
        </div>
      </div>

      {/* ── Mathematical Confirmation ──────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Mathematical Confirmation of the Five Prayers
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Sura 1 (The Key / Al-Fateha) provides seven layers of mathematical
          confirmation that the five daily prayers, with their specific
          number of units, are divinely ordained. All patterns are multiples
          of 19 — the Quran&apos;s mathematical common denominator.
        </p>
      </section>

      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Seven Mathematical Proofs from Sura 1
          </p>
        </div>
        <ul className="divide-y divide-border/20 text-sm">
          {[
            {
              n: 1,
              text: 'Sura 1 contains 7 verses. Writing the sura number followed by the verse count gives "17" — exactly the total number of Rak\'ahs (units) in the five daily prayers.',
            },
            {
              n: 2,
              text: 'Writing the sura number followed by all verse numbers produces "1 1 2 3 4 5 6 7" — a number divisible by 19.',
            },
            {
              n: 3,
              text: 'Replacing verse numbers with their letter counts yields "1 19 17 12 11 19 18 43" — also divisible by 19.',
            },
            {
              n: 4,
              text: 'Including gematrical values of each verse produces a large sequence that is a multiple of 19.',
            },
            {
              n: 5,
              text: 'The full data sequence combining sura number, verse numbers, letter counts, and gematrical values is a multiple of 19.',
            },
            {
              n: 6,
              text: 'All individual letter gematrical values of Sura 1 form a 274-digit number divisible by 19.',
            },
            {
              n: 7,
              text: 'A complex pattern combining sura data with prayer unit information yields a multiple of 19, with component digits totaling 4636 (= 19 × 244).',
            },
          ].map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {n}
              </span>
              <span className="text-foreground/80 text-sm leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Confirmation of Friday Prayers ────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Confirmation of Friday Prayers
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          On Fridays, 15 &ldquo;Keys&rdquo; (recitations of Al-Fateha) are
          used instead of 17. The number sequence encoding the Friday prayer
          structure — combining prayer numbers and &ldquo;Key&rdquo; counts
          — is divisible by 19, confirming the Friday prayer format (
          <QuranRef reference="62:9" />).
        </p>
      </section>

      {/* ── Al-Fateha in Arabic ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Al-Fateha Must Be Recited in Arabic
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          When Sura 1 is recited in Arabic, the lips touch precisely 19
          times. There are 4 instances of the letter &ldquo;B&rdquo; (value
          2 each) and 15 instances of the letter &ldquo;M&rdquo; (value 40
          each), totaling 19 occurrences. Their combined gematrical value is
          608 (= 19 × 32).
        </p>
      </section>

      {/* Lip-touch table */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Lip-Touch Letters in Al-Fateha (Total: 608 = 19×32)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Word</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Letter</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground font-mono">Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Bism', 'B', 2],
                ['Bism', 'M', 40],
                ['Rahman', 'M', 40],
                ['Rahim', 'M', 40],
                ['Al-Hamdu', 'M', 40],
                ['Rub', 'B', 2],
                ["'Alamin", 'M', 40],
                ['Rahman', 'M', 40],
                ['Rahim', 'M', 40],
                ['Malik', 'M', 40],
                ['Yawm', 'M', 40],
                ["Na'budu", 'B', 2],
                ['Mustaqim', 'M', 40],
                ['Mustaqim', 'M', 40],
                ["An'amta", 'M', 40],
                ["'Alayhim", 'M', 40],
                ['Maghdub', 'M', 40],
                ['Maghdub', 'B', 2],
                ["'Alayhim", 'M', 40],
              ].map(([word, letter, value], i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 text-xs font-mono">{word}</td>
                  <td className="px-4 py-2 text-xs text-primary font-semibold">{letter}</td>
                  <td className="px-4 py-2 text-xs font-mono text-right text-muted-foreground">{value}</td>
                </tr>
              ))}
              <tr className="bg-primary/5 border-t border-primary/20">
                <td className="px-4 py-2 text-xs font-semibold" colSpan={2}>Total</td>
                <td className="px-4 py-2 text-xs font-mono font-bold text-primary text-right">608 (19×32)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirmation of Prayer Components ────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Confirmation of Prayer Components
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          A sequence encoding all five prayers — combining the sura number,
          prayer number, number of &ldquo;Keys&rdquo; recited, bowings
          (Ruku&apos;), prostrations (Sujud), and Tashahhud (sitting
          position) — is divisible by 19. This confirms the minutest details
          of the prayer structure as divinely prescribed.
        </p>
      </section>

      {/* ── Obligatory Charity ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Obligatory Charity (Zakat)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Zakat must be given &ldquo;on the day of harvest&rdquo; (
          <QuranRef reference="6:141" />) — meaning whenever one receives
          net income. The prescribed amount is 2.5%, to be set aside and
          given to the specified recipients in order: parents, relatives,
          orphans, the poor, and the traveling alien (
          <QuranRef reference="2:215" />).
        </p>
        <p>
          The Quran emphasizes Zakat&apos;s central importance:{' '}
          <em>
            &ldquo;My mercy encompasses all things, but I will specify it
            for the righteous who give Zakat.&rdquo;
          </em>{' '}
          (<QuranRef reference="7:156" />).
        </p>
        <p>
          Zakat calculation excludes government taxes paid, and may deduct
          living expenses, debts, and mortgages. If needy recipients are
          unknown in one&apos;s community, Zakat may be donated to
          organizations designated specifically for helping poor people.
          Charities given to mosques, hospitals, or general organizations do
          not qualify as Zakat.
        </p>
      </section>

      {/* ── Fasting ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Fasting
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Complete fasting regulations are given in{' '}
          <QuranRef reference="2:183" />–<QuranRef reference="2:187" />.
          Fasting during Ramadan is decreed for the believers as a means of
          attaining righteousness.
        </p>
      </section>

      {/* ── Pilgrimage ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Pilgrimage: Hajj &amp; &apos;Umrah
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Hajj and &apos;Umrah are decreed for those who can afford it, once
          in a lifetime. The pilgrimage commemorates Abraham&apos;s exemplary
          submission to God (see{' '}
          <Link href="/quran/appendix/9" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 9
          </Link>
          ) and must occur during the four Sacred Months: Zul-Hijjah,
          Muharram, Safar, and Rabi&apos; I (the 12th, 1st, 2nd, and 3rd
          months) (<QuranRef reference="2:197" />; <QuranRef reference="9:2" />,{' '}
          <QuranRef reference="9:36" />). &apos;Umrah may be observed at any
          time.
        </p>
        <p>
          Most Muslims observe Hajj only during a few days in Zul-Hijjah and
          regard Rajab, Zul-Qi&apos;dah, Zul-Hijjah, and Muharram as the
          Sacred Months. This is a distortion that is strongly condemned (
          <QuranRef reference="9:37" />).
        </p>
      </section>

      {/* Pilgrimage steps */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pilgrimage Procedures
          </p>
        </div>
        <ul className="divide-y divide-border/20 text-sm">
          {[
            {
              step: 'Ihram',
              desc: "The pilgrimage begins with a bath or shower, followed by a state of sanctity called 'Ihraam' (2:196). Men wear seamless sheets of material; women wear a modest dress.",
            },
            {
              step: 'Abstentions',
              desc: "Throughout Hajj, pilgrims abstain from sexual intercourse, vanities such as shaving and cutting hair, arguments, misconduct, and bad language (2:197).",
            },
            {
              step: 'Tawaf',
              desc: "Upon arriving at the Sacred Mosque, pilgrims walk around the Ka'bah seven times while glorifying God (2:125, 22:26–29).",
            },
            {
              step: "Sa'i",
              desc: "Pilgrims walk the half-mile distance between the knolls of Safa and Marwah seven times, completing the 'Umrah portion (2:158).",
            },
            {
              step: "'Arafat",
              desc: "Pilgrims spend a day of worship, meditation, and glorification of God at 'Arafat, from dawn to sunset (2:198).",
            },
            {
              step: 'Muzdalifah',
              desc: "After sunset, pilgrims go to Muzdalifah for the Night Prayer and collect 21 pebbles for the symbolic stoning of Satan at Mina.",
            },
            {
              step: 'Mina',
              desc: "At Mina (two or three days, 2:203) pilgrims perform an animal sacrifice and throw seven pebbles at each of three stations while glorifying God (15:34, 37:107).",
            },
            {
              step: 'Farewell Tawaf',
              desc: "Pilgrims return to Mecca for a farewell circumvolution of the Ka'bah seven times.",
            },
          ].map(({ step, desc }, i) => (
            <li key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-foreground/80 text-sm leading-relaxed">
                <strong>{step}: </strong>{desc}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Physical Benefits ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Physical Benefits
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The religious duties carry documented physical benefits alongside
          their spiritual purpose:
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: 'Dawn Prayer',
            text: 'Interrupts sleep stillness, preventing arthritis. Early rising combats depression and psychological problems.',
          },
          {
            title: 'Prostration Position',
            text: 'Expands brain blood vessels, helping prevent headaches. Back and joint bending provides beneficial exercise.',
          },
          {
            title: 'Ablutions (Wudu)',
            text: 'Frequent washing protects against colon cancer by preventing harmful chemical reabsorption.',
          },
          {
            title: 'Fasting in Ramadan',
            text: 'Restores stomach size, lowers blood pressure through controlled dehydration, removes toxins, rests the kidneys, and reduces harmful fat.',
          },
          {
            title: 'Zakat',
            text: 'Provides far-reaching economic and social benefits through systematic redistribution of wealth.',
          },
          {
            title: 'Hajj',
            text: 'Provides far-reaching social benefits through the gathering of peoples from every nation.',
          },
        ].map(({ title, text }, i) => (
          <div
            key={i}
            data-card
            className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
          </div>
        ))}
      </div>
    </>
  )
}
