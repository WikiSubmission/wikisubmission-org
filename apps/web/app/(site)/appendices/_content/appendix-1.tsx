import { QuranRef } from '@/components/quran-ref'

export function AppendixContent() {
  return (
    <>
      {/* ── Part 1 intro ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
        <p><QuranRef reference="74:35" /> &ldquo;One of the Great Miracles&rdquo;</p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran is characterized by a unique phenomenon never found in any
          human authored book. Every element of the Quran is mathematically
          composed — the suras, the verses, the words, the number of certain
          letters, the number of words from the same root, the number and
          variety of divine names, the unique spelling of certain words, the
          absence or deliberate alteration of certain letters within certain
          words, and many other elements of the Quran besides its content. There
          are two major facets of the Quran&apos;s mathematical system: (1) The
          mathematical literary composition, and (2) The mathematical structure
          involving the numbers of suras and verses. Because of this
          comprehensive mathematical coding, the slightest distortion of the
          Quran&apos;s text or physical arrangement is immediately exposed.
        </p>
      </section>

      {/* ── Opening card ─────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Simple to Understand · Impossible to Imitate
        </p>
      </div>

      {/* ── Intro ────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          For the first time in history we have a scripture with built-in proof
          of divine authorship — a superhuman mathematical composition.
        </p>
        <p>
          Any reader of this book can easily verify the Quran&apos;s
          mathematical miracle. The word &ldquo;God&rdquo; (Allah) is written in
          bold capital letters throughout the text. The cumulative frequency of
          occurrence of the word &ldquo;God&rdquo; is noted at the bottom of
          each page in the left hand corner. The number in the right hand corner
          is the cumulative total of the numbers for verses containing the word
          &ldquo;God.&rdquo; The last page of the text shows that the total
          occurrence of the word &ldquo;God&rdquo; is 2698, or 19×142. The total
          sum of verse numbers for all verses containing the word
          &ldquo;God&rdquo; is 118123, also a multiple of 19 (118123 = 19×6217).
          Nineteen is the common denominator throughout the Quran&apos;s
          mathematical system.
        </p>
        <p>
          This phenomenon alone suffices as incontrovertible proof that the
          Quran is God&apos;s message to the world. No human being(s) could have
          kept track of 2698 occurrences of the word &ldquo;God,&rdquo; and the
          numbers of verses where they occur. This is especially impossible in
          view of (1) the age of ignorance during which the Quran was revealed,
          and (2) the fact that the suras and verses were widely separated in
          time and place of revelation. The chronological order of revelation
          was vastly different from the final format (Appendix 23). However, the
          Quran&apos;s mathematical system is not limited to the word
          &ldquo;God;&rdquo; it is extremely vast, extremely intricate, and
          totally comprehensive.
        </p>
      </section>

      {/* ── The Simple Facts ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Simple Facts
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Like the Quran itself, the Quran&apos;s mathematical coding ranges
          from the very simple, to the very complex. The Simple Facts are those
          observations that can be ascertained without using any tools. The
          complex facts require the assistance of a calculator or a computer.
          The following facts do not require any tools to be verified, but
          please remember they all refer to the original Arabic text:
        </p>

        <ol className="space-y-3 list-none">
          {[
            'The first verse (1:1), known as "Basmalah," consists of 19 letters.',
            'The Quran consists of 114 suras, which is 19 × 6.',
            'The total number of verses in the Quran is 6346, or 19 × 334. [6234 numbered verses & 112 un-numbered verses (Basmalahs) 6234 + 112 = 6346] Note that 6 + 3 + 4 + 6 = 19.',
            'The Basmalah occurs 114 times, despite its conspicuous absence from Sura 9 (it occurs twice in Sura 27) & 114 = 19 × 6.',
            'From the missing Basmalah of Sura 9 to the extra Basmalah of Sura 27, there are precisely 19 suras.',
            'It follows that the total of the sura numbers from 9 to 27 (9+10+11+...+27) is 342, or 19 × 18.',
            'This total (342) also equals the number of words between the two Basmalahs of Sura 27, and 342 = 19 × 18.',
            'The famous first revelation (96:1–5) consists of 19 words.',
            'This 19-worded first revelation consists of 76 letters — 19 × 4.',
            'Sura 96, first in the chronological sequence, consists of 19 verses.',
            'This first chronological sura is placed atop the last 19 suras.',
            'Sura 96 consists of 304 Arabic letters, and 304 equals 19 × 16.',
            'The last revelation (Sura 110) consists of 19 words.',
            'The first verse of the last revelation (110:1) consists of 19 letters.',
            '14 different Arabic letters form 14 different sets of "Quranic Initials" (such as A.L.M. of 2:1), and prefix 29 suras. These numbers add up to 14 + 14 + 29 = 57 = 19 × 3.',
            'The total of the 29 sura numbers where the Quranic Initials occur is 2+3+7+...+50+68 = 822, and 822 + 14 (14 sets of initials) equals 836, or 19 × 44.',
            'Between the first initialed sura (Sura 2) and the last initialed sura (Sura 68) there are 38 un-initialed suras — 19 × 2.',
            'Between the first and last initialed sura there are 19 sets of alternating "initialed" and "un-initialed" suras.',
            'The Quran mentions 30 different numbers: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20, 30, 40, 50, 60, 70, 80, 99, 100, 200, 300, 1000, 2000, 3000, 5000, 50,000, & 100,000. The sum of these numbers is 162,146 = 19 × 8,534.',
          ].map((fact, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{fact}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── The Literary Mathematical Composition ────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Literary Mathematical Composition
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran is characterized by a unique phenomenon never found in any
          other book: 29 suras are prefixed with 14 different sets of
          &ldquo;Quranic Initials,&rdquo; consisting of one to five letters per
          set. Fourteen letters, half the Arabic alphabet, participate in these
          initials. The significance of the Quranic initials remained a divinely
          guarded secret for 14 centuries.
        </p>
        <p>
          The Quran states in <QuranRef reference="10:20" /> and{' '}
          <QuranRef reference="25:4-6" /> that its miracle, i.e., proof of
          divine authorship, was destined to remain secret for a specific
          predetermined interim.
        </p>
        <p>
          The Quranic Initials constitute a major portion of the Quran&apos;s
          19-based mathematical miracle.
        </p>
      </section>

      {/* ── Initials table ───────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-border/60 overflow-hidden"
      >
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Table 1: The Quranic Initials and Their Suras
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
                  Title
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">
                  Initials
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [2, 'The Heifer', 'A.L.M.'],
                [3, 'The Amramites', 'A.L.M.'],
                [7, 'The Purgatory', 'A.L.M.S.'],
                [10, 'Jonah', 'A.L.R.'],
                [11, 'Hûd', 'A.L.R.'],
                [12, 'Joseph', 'A.L.R.'],
                [13, 'Thunder', 'A.L.M.R.'],
                [14, 'Abraham', 'A.L.R.'],
                [15, 'Al-Hijr Valley', 'A.L.R.'],
                [19, 'Mary', "K.H.Y.'A.S."],
                [20, 'T.H.', 'T.H.'],
                [26, 'The Poets', 'T.S.M.'],
                [27, 'The Ant', 'T.S.'],
                [28, 'History', 'T.S.M.'],
                [29, 'The Spider', 'A.L.M.'],
                [30, 'The Romans', 'A.L.M.'],
                [31, 'Luqmaan', 'A.L.M.'],
                [32, 'Prostration', 'A.L.M.'],
                [36, 'Y.S.', 'Y.S.'],
                [38, 'S.', 'S.'],
                [40, 'Forgiver', 'H.M.'],
                [41, 'Elucidated', 'H.M.'],
                [42, 'Consultation', "H.M.'A.S.Q."],
                [43, 'Ornaments', 'H.M.'],
                [44, 'Smoke', 'H.M.'],
                [45, 'Kneeling', 'H.M.'],
                [46, 'The Dunes', 'H.M.'],
                [50, 'Q.', 'Q.'],
                [68, 'The Pen', 'NuN'],
              ].map(([sura, title, initials], i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-primary font-medium">
                    {sura}
                  </td>
                  <td className="px-4 py-2 text-xs">{title}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {initials}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Historical Background ────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Historical Background
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In 1968, Rashad Khalifa realized that the existing English translations
          of the Quran did not present the truthful message of God&apos;s Final
          Testament. For example, the two most popular translators, Yusuf Ali
          and Marmaduke Pickthall, could not overcome their corrupted religious
          traditions when it came to the Quran&apos;s great criterion in{' '}
          <QuranRef reference="39:45" />.
        </p>

        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            <QuranRef reference="39:45" /> &ldquo;When God ALONE is mentioned,
            the hearts of those who do not believe in the Hereafter shrink with
            aversion. But when others are mentioned beside Him, they
            rejoice.&rdquo;
          </p>
        </div>

        <p>
          Yusuf Ali omitted the crucial word &ldquo;ALONE&rdquo; from his
          translation, and altered the rest of the verse by inserting the word
          &ldquo;(gods).&rdquo; Thus, he utterly destroyed this most important
          Quranic criterion. He translated <QuranRef reference="39:45" /> as
          follows:
        </p>

        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            &ldquo;When God, the One and Only, is mentioned, the hearts of those
            who believe not in the Hereafter are filled with disgust and horror;
            but when (gods) other than He are mentioned, behold, they are filled
            with joy.&rdquo; [39:45] (according to A. Yusuf Ali)
          </p>
        </div>

        <p>
          The expression &ldquo;When God, the One and Only, is mentioned,&rdquo;
          is not the same as saying, &ldquo;When God alone is mentioned.&rdquo;
          One can mention &ldquo;God, the One and Only,&rdquo; and also mention
          Muhammad or Jesus, and no one will be upset. But if &ldquo;God ALONE
          is mentioned,&rdquo; you cannot mention anyone else, and a lot of
          people — those who idolize Muhammad or Jesus — will be upset. Thus,
          Yusuf Ali could not bring himself to present the truth of the Quran,
          if it exposed his corrupted belief.
        </p>

        <p>
          Marmaduke Pickthall translated &ldquo;ALONE&rdquo; correctly, but
          destroyed the criterion by inserting his personal belief in
          parentheses; he translated <QuranRef reference="39:45" /> as follows:
        </p>

        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            &ldquo;And when Allah alone is mentioned, the hearts of those who
            believe not in the Hereafter are repelled, and when those (whom they
            worship) beside Him are mentioned, behold! they are glad.&rdquo;
            [39:45] (according to Marmaduke Pickthall)
          </p>
        </div>

        <p>
          When Rashad Khalifa saw the truth of God&apos;s word thus distorted,
          he decided to translate the Quran, at least for the benefit of his own
          children. Since he was a chemist by profession, and despite his
          extensive religious background — his father was a renowned Sufi leader
          in Egypt — he vowed to God that he would not move from one verse to
          the next unless he fully understood it.
        </p>

        <p>
          He purchased all the available books of Quranic translations and
          exegeses (Tafseer), placed them on a large table, and began his
          translation. The first sura, The Key, was completed in a few days. The
          first verse in Sura 2 is &ldquo;A.L.M.&rdquo; The translation of this
          verse took four years, and coincided with the divine unveiling of
          &ldquo;the secret,&rdquo; the great mathematical Miracle of the Quran.
        </p>

        <p>
          The books of Quranic exegeses unanimously agreed that &ldquo;no one
          knows the meaning or significance of the Quranic Initials A.L.M., or
          any other initials.&rdquo; He decided to write the Quran into the
          computer, analyze the whole text, and see if there were any
          mathematical correlations among these Quranic initials.
        </p>

        <p>
          He used a time-share terminal, connected by telephone to a giant
          computer. To test his hypothesis, he decided to look at the
          single-lettered Quranic Initials — &ldquo;Q&rdquo; (Qaaf) of Suras 42
          and 50, &ldquo;S&rdquo; (Saad) of Suras 7, 19, and 38, and
          &ldquo;N&rdquo; (Noon) of Sura 68. As detailed in his first book
          MIRACLE OF THE QURAN: SIGNIFICANCE OF THE MYSTERIOUS ALPHABETS
          (Islamic Productions, 1973), many previous attempts to unravel the
          mystery had failed.
        </p>
      </section>

      {/* ── The Initial Q ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Initial Q (Qaaf)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The computer data showed that the text of the only Q-initialed suras,
          42 and 50, contained the same number of Q&apos;s: 57 and 57. That was
          the first hint that a deliberate mathematical system might exist in the
          Quran.
        </p>
        <p>
          Sura 50 is entitled &ldquo;Q,&rdquo; prefixed with &ldquo;Q,&rdquo;
          and the first verse reads, &ldquo;Q, and the glorious Quran.&rdquo;
          This indicated that &ldquo;Q&rdquo; stands for &ldquo;Quran,&rdquo;
          and the total number of Q&apos;s in the two Q-initialed suras
          represents the Quran&apos;s 114 suras (57 + 57 = 114 = 19×6). This
          idea was strengthened by the fact that &ldquo;the Quran&rdquo; occurs
          in the Quran 57 times. The Quran is described in Sura &ldquo;Q&rdquo;
          as &ldquo;Majid&rdquo; (glorious), and the Arabic word
          &ldquo;Majid&rdquo; has a gematrical value of 57: M(40) + J(3) +
          I(10) + D(4) = 57.
        </p>

        <div
          data-card
          className="rounded-xl border border-border/60 overflow-hidden"
        >
          <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Summary of Q-Related Data
            </p>
          </div>
          <ul className="divide-y divide-border/20 text-sm">
            {[
              'The frequency of occurrence of "Q" in Sura "Q" (No. 50) is 57, 19×3.',
              'The letter "Q" occurs in the other Q-initialed sura (No. 42) exactly the same number of times, 57.',
              'The total occurrence of the letter "Q" in the two Q-initialed suras is 114, which equals the number of suras in the Quran.',
              '"The Quran" is mentioned in the Quran 57 times.',
              'The description of the Quran as "Majid" (Glorious) is correlated with the frequency of occurrence of the letter "Q" in each of the Q-initialed suras. The word "Majid" has a gematrical value of 57.',
              'Sura 42 consists of 53 verses, and 42 + 53 = 95 = 19×5.',
              'Sura 50 consists of 45 verses, and 50 + 45 = 95 = 19×5.',
              'The number of Q\'s in all verses numbered "19" throughout the Quran is 76, 19×4.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                <span className="shrink-0 size-5 flex items-center justify-center rounded bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p>
          Glimpses of the Quran&apos;s mathematical composition began to emerge.
          For example, it was observed that the people who disbelieved in Lot
          are mentioned in 50:13 and occur in the Quran 13 times. Consistently,
          they are referred to as &ldquo;Qawm,&rdquo; with the single exception
          of the Q-initialed Sura 50 where they are referred to as
          &ldquo;Ikhwaan.&rdquo; Obviously, if the regular, Q-containing word
          &ldquo;Qawm&rdquo; were used, the count of the letter &ldquo;Q&rdquo;
          in Sura 50 would have become 58, and this whole phenomenon would have
          disappeared. With the recognized absolute accuracy of mathematics, the
          alteration of a single letter destroys the system.
        </p>
        <p>
          Another relevant example is the reference to Mecca in{' '}
          <QuranRef reference="3:96" /> as &ldquo;Becca&rdquo;! This strange
          spelling of the renowned city has puzzled Islamic scholars for many
          centuries. Although Mecca is mentioned in the Quran properly spelled
          in <QuranRef reference="48:24" />, the letter &ldquo;M&rdquo; is
          substituted with a &ldquo;B&rdquo; in <QuranRef reference="3:96" />.
          It turns out that Sura 3 is an M-initialed sura, and the count of the
          letter &ldquo;M&rdquo; would have deviated from the Quran&apos;s code
          if &ldquo;Mecca&rdquo; was spelled correctly in{' '}
          <QuranRef reference="3:96" />.
        </p>
      </section>

      {/* ── NuN (Noon) ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          NuN (Noon)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This initial is unique; it occurs in one sura, 68, and the name of
          the letter is spelled out as three letters — Noon Wow Noon — in the
          original text, and is therefore counted as two N&apos;s. The total
          count of this letter in the N-initialed sura is 133, 19×7.
        </p>
        <p>
          The fact that &ldquo;N&rdquo; is the last Quranic Initial (see Table
          1) brings out a number of special observations. For example, the
          number of verses from the first Quranic Initial (A.L.M. of 2:1) to
          the last initial (N. of 68:1) is 5263, or 19×277.
        </p>
        <p>
          The word &ldquo;God&rdquo; (Allah) occurs 2641 (19×139) times between
          the first initial and the last initial. Since the total occurrence of
          the word &ldquo;God&rdquo; is 2698, it follows that its occurrence
          outside the initials &ldquo;A.L.M.&rdquo; of 2:1 on one side, and the
          initial &ldquo;N&rdquo; of 68:1 on the other side, is 57, 19×3.
        </p>
      </section>

      {/* ── S (Saad) ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          S (Saad)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This initial prefixes three suras, 7, 19, and 38, and the total
          occurrence of the letter &ldquo;S&rdquo; (Saad) in these three suras
          is 152, 19×8. It is noteworthy that in <QuranRef reference="7:69" />,
          the word &ldquo;Bastatan&rdquo; is written in some printings with a
          &ldquo;Saad,&rdquo; instead of &ldquo;Seen.&rdquo; This is an
          erroneous distortion that violates the Quran&apos;s code. By looking
          at the oldest available copy of the Quran, the Tashkent Copy, it was
          found that the word &ldquo;Bastatan&rdquo; is correctly written with a
          &ldquo;Seen.&rdquo;
        </p>
      </section>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Sura</th>
              <th className="px-4 py-2 text-left font-semibold">Frequency of &ldquo;S&rdquo;</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['7', '97'],
              ['19', '26'],
              ['38', '29'],
              ['Total', '152 (19×8)'],
            ].map(([sura, freq], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-primary font-medium">{sura}</td>
                <td className="px-4 py-2 text-xs">{freq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Historical Note ───────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Historical Note
        </p>
        <p className="text-base leading-relaxed text-foreground/90">
          The momentous discovery that &ldquo;19&rdquo; is the Quran&apos;s
          common denominator became a reality in January 1974, coinciding with
          Zul-Hijjah 1393 A.H. The Quran was revealed in 13 B.H. (Before
          Hijrah). This makes the number of years from the revelation of the
          Quran to the revelation of its miracle 1393 + 13 = 1406 = 19×74. As
          noted above, the unveiling of the Miracle took place in January 1974.
          The correlation between 19×74 lunar years and 1974 solar years could
          not escape notice. This is especially uncanny in view of the fact that
          &ldquo;19&rdquo; is mentioned in Sura 74.
        </p>
      </div>

      {/* ── Y.S. (Ya Seen) ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Y.S. (Ya Seen)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          These two letters prefix Sura 36. The letter &ldquo;Y&rdquo; occurs
          in this sura 237 times, while the letter &ldquo;S&rdquo; (Seen)
          occurs 48 times. The total of both letters is 285, 19×15.
        </p>
        <p>
          It is noteworthy that the letter &ldquo;Y&rdquo; is written in the
          Quran in two forms; one is obvious and the other is subtle. The subtle
          form of the letter may be confusing to those who are not thoroughly
          familiar with the Arabic language. A good example is the word
          &ldquo;Araany&rdquo; which is mentioned twice in{' '}
          <QuranRef reference="12:36" />. The letter &ldquo;Y&rdquo; is used
          twice in this word, the first &ldquo;Y&rdquo; is subtle and the second
          is obvious. Sura 36 does not contain a single &ldquo;Y&rdquo; of the
          subtle type. This is a remarkable phenomenon, and one that does not
          normally occur in a long sura like Sura 36.
        </p>
      </section>

      {/* ── H.M. (Ha Mim) ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          H.M. (Ha Mim)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Seven suras are prefixed with the letters &ldquo;H&rdquo; and
          &ldquo;M;&rdquo; Suras 40 through 46. The total occurrence of these
          two letters in the seven H.M.-initialed suras is 2147, or 19×113.
          Naturally, the alteration of a single letter &ldquo;H&rdquo; or
          &ldquo;M&rdquo; in any of the seven H.M.-initialed suras would have
          destroyed this intricate phenomenon.
        </p>
      </section>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Sura No.</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;H&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;M&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">H + M</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['40', '64', '380', '444'],
              ['41', '48', '276', '324'],
              ['42', '53', '300', '353'],
              ['43', '44', '324', '368'],
              ['44', '16', '150', '166'],
              ['45', '31', '200', '231'],
              ['46', '36', '225', '261'],
              ['Total', '292', '1855', '2147 (19×113)'],
            ].map(([sura, h, m, total], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-primary font-medium">{sura}</td>
                <td className="px-4 py-2 text-xs">{h}</td>
                <td className="px-4 py-2 text-xs">{m}</td>
                <td className="px-4 py-2 text-xs font-medium">{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── `A.S.Q. ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          &lsquo;A.S.Q. (&lsquo;Ayn Seen Qaf)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          These initials constitute Verse 2 of Sura 42, and the total
          occurrence of these letters in this sura is 209, or 19×11. The letter
          &ldquo;&lsquo;A&rdquo; (&lsquo;Ayn) occurs 98 times, the letter
          &ldquo;S&rdquo; (Seen) occurs 54 times, and the letter &ldquo;Q&rdquo;
          (Qaf) occurs 57 times.
        </p>
      </section>

      {/* ── A.L.M. ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A.L.M. (Alef Laam Mim)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The letters &ldquo;A,&rdquo; &ldquo;L,&rdquo; and &ldquo;M&rdquo;
          are the most frequently used letters in the Arabic language. These
          letters prefix six suras — 2, 3, 29, 30, 31, and 32 — and the total
          occurrence of the three letters in each of the six suras is a multiple
          of 19: 9899 (19×521), 5662 (19×298), 1672 (19×88), 1254 (19×66), 817
          (19×43), and 570 (19×30), respectively. Thus, the total occurrence of
          the three letters in the six suras is 19874 (19×1046), and the
          alteration of one of these letters destroys this phenomenon.
        </p>
      </section>

      {/* ── A.L.M. Table ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Sura No.</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;A&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;L&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;M&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['2', '4502', '3202', '2195', '9899 (19×521)'],
              ['3', '2521', '1892', '1249', '5662 (19×298)'],
              ['29', '774', '554', '344', '1672 (19×88)'],
              ['30', '544', '393', '317', '1254 (19×66)'],
              ['31', '347', '297', '173', '817 (19×43)'],
              ['32', '257', '155', '158', '570 (19×30)'],
              ['Total', '8945', '6493', '4436', '19874 (19×1046)'],
            ].map(([sura, a, l, m, total], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-primary font-medium">{sura}</td>
                <td className="px-4 py-2 text-xs">{a}</td>
                <td className="px-4 py-2 text-xs">{l}</td>
                <td className="px-4 py-2 text-xs">{m}</td>
                <td className="px-4 py-2 text-xs font-medium">{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── A.L.R. ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A.L.R. (Alef Laam Ra)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          These initials are found in Suras 10, 11, 12, 14, and 15. The total
          occurrences of these letters in these suras are 2489 (19×131), 2489
          (19×131), 2375 (19×125), 1197 (19×63), and 912 (19×48), respectively.
        </p>
      </section>

      {/* ── A.L.R. Table ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Sura No.</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;A&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;L&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;R&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['10', '1319', '913', '257', '2489 (19×131)'],
              ['11', '1370', '794', '325', '2489 (19×131)'],
              ['12', '1306', '812', '257', '2375 (19×125)'],
              ['14', '585', '452', '160', '1197 (19×63)'],
              ['15', '493', '323', '96', '912 (19×48)'],
              ['Total', '5073', '3294', '1095', '9462 (19×498)'],
            ].map(([sura, a, l, r, total], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-primary font-medium">{sura}</td>
                <td className="px-4 py-2 text-xs">{a}</td>
                <td className="px-4 py-2 text-xs">{l}</td>
                <td className="px-4 py-2 text-xs">{r}</td>
                <td className="px-4 py-2 text-xs font-medium">{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── A.L.M.R. ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A.L.M.R. (Alef Laam Mim Ra)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          These initials prefix one sura, No. 13, and the total frequency of
          occurrence of the four letters is 1482, or 19×78. The letter
          &ldquo;A&rdquo; occurs 605 times, &ldquo;L&rdquo; occurs 480 times,
          &ldquo;M&rdquo; occurs 260 times, and &ldquo;R&rdquo; occurs 137
          times.
        </p>
      </section>

      {/* ── A.L.M.S. ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A.L.M.S. (Alef Laam Mim Saad)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Only one sura is prefixed with these initials, Sura 7, and the letter
          &ldquo;A&rdquo; occurs in this sura 2529 times, &ldquo;L&rdquo; occurs
          1530 times, &ldquo;M&rdquo; occurs 1164 times, and &ldquo;S&rdquo;
          (Saad) occurs 97 times. Thus, the total occurrence of the four letters
          in this sura is 2529 + 1530 + 1164 + 97 = 5320 = 19×280.
        </p>
        <p>
          An important observation here is the interlocking relationship
          involving the letter &ldquo;S&rdquo; (Saad). This initial occurs also
          in Suras 19 and 38. While complementing its sister letters in Sura 7
          to give a total that is divisible by 19, the frequency of this letter
          also complements its sister letters in Suras 19 and 38 to give a
          multiple of 19. Additionally, the Quranic Initial &ldquo;S&rdquo;
          (Saad) interacts with the Quranic Initials &ldquo;K.H.Y.&lsquo;A.&rdquo;
          (Kaaf Haa Ya &lsquo;Ayn) in Sura 19 to give another total that is
          also a multiple of 19. This interlocking relationship — which is not
          unique to the initial &ldquo;S&rdquo; (Saad) — contributes to the
          intricacy of the Quran&apos;s numerical code.
        </p>
      </section>

      {/* ── K.H.Y.'A.S. ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          K.H.Y.&lsquo;A.S. (Kaaf Ha Ya &lsquo;Ayn Saad)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This is the longest set of initials, consisting of five letters, and
          it occurs in one sura, Sura 19. The letter &ldquo;K&rdquo; in Sura 19
          occurs 137 times, &ldquo;H&rdquo; occurs 175 times, &ldquo;Y&rdquo;
          occurs 343 times, &ldquo;&lsquo;A&rdquo; occurs 117 times, and
          &ldquo;S&rdquo; (Saad) occurs 26 times. Thus, the total occurrence of
          the five letters is 137 + 175 + 343 + 117 + 26 = 798 = 19×42.
        </p>
      </section>

      {/* ── H., T.H., T.S. & T.S.M. ─────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          H., T.H. (Ta Ha), T.S. (Ta Seen) &amp; T.S.M. (Ta Seen Mim)
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          An intricate interlocking relationship links these overlapping Quranic
          Initials to produce a total that is also a multiple of 19. The initial
          &ldquo;H.&rdquo; is found in Suras 19 and 20. The initials
          &ldquo;T.H.&rdquo; prefix Sura 20. The initials &ldquo;T.S.&rdquo;
          are found in Sura 27, while the initials &ldquo;T.S.M.&rdquo; prefix
          its surrounding Suras 26 &amp; 28.
        </p>
        <p>
          It should be noted that the longer, more complex, interlocking and
          overlapping initials are found in the suras where uncommonly powerful
          miracles are narrated. For example, the virgin birth of Jesus is given
          in Sura 19, which is prefixed with the longest set of initials,
          K.H.Y.&lsquo;A.S. The interlocking initials &ldquo;H.,&rdquo;
          &ldquo;T.H.,&rdquo; &ldquo;T.S.,&rdquo; and &ldquo;T.S.M.&rdquo;
          prefix suras describing the miracles of Moses, Jesus, and the uncommon
          occurrences surrounding Solomon and his jinns. God thus provides
          stronger evidence to support stronger miracles.
        </p>
      </section>

      {/* ── Complex Table ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Sura</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;H&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;T&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;S&rdquo;</th>
              <th className="px-4 py-2 text-left font-semibold">Freq. of &ldquo;M&rdquo;</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['19', '175', '—', '—', '—'],
              ['20', '251', '28', '—', '—'],
              ['26', '—', '33', '94', '484'],
              ['27', '—', '27', '94', '—'],
              ['28', '—', '19', '102', '460'],
              ['Total', '426', '107', '290', '944'],
            ].map(([sura, h, t, s, m], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-primary font-medium">{sura}</td>
                <td className="px-4 py-2 text-xs">{h}</td>
                <td className="px-4 py-2 text-xs">{t}</td>
                <td className="px-4 py-2 text-xs">{s}</td>
                <td className="px-4 py-2 text-xs">{m}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">
          426 + 107 + 290 + 944 = 1767 = 19×93
        </p>
      </div>

      {/* ── Gematrical Values ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          What Is a &ldquo;Gematrical Value&rdquo;?
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          When the Quran was revealed, 14 centuries ago, the numbers known today
          did not exist. A universal system was used where the letters of the
          Arabic, Hebrew, Aramaic, and Greek alphabets were used as numerals.
          The number assigned to each letter is its &ldquo;Gematrical
          Value.&rdquo; The numerical values of the Arabic alphabet are shown in
          Table 7.
        </p>
      </section>

      {/* ── Gematrical Table ─────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Letter</th>
              <th className="px-4 py-2 text-left font-semibold">Value</th>
              <th className="px-4 py-2 text-left font-semibold">Letter</th>
              <th className="px-4 py-2 text-left font-semibold">Value</th>
              <th className="px-4 py-2 text-left font-semibold">Letter</th>
              <th className="px-4 py-2 text-left font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Alef (ا)", "1", "Kaf (ك)", "20", "Qaf (ق)", "100"],
              ["Ba' (ب)", "2", "Laam (ل)", "30", "Ra' (ر)", "200"],
              ["Jim (ج)", "3", "Mim (م)", "40", "Shin (ش)", "300"],
              ["Dal (د)", "4", "Noon (ن)", "50", "Ta' (ت)", "400"],
              ["Ha' (ه)", "5", "Seen (س)", "60", "Tha' (ث)", "500"],
              ["Waw (و)", "6", "Ayn (ع)", "70", "Kha' (خ)", "600"],
              ["Zay (ز)", "7", "Fa' (ف)", "80", "Dhal (ذ)", "700"],
              ["Ha' (ح)", "8", "Saad (ص)", "90", "Dad (ض)", "800"],
              ["TTa' (ط)", "9", "—", "—", "Za' (ظ)", "900"],
              ["Ya' (ي)", "10", "—", "—", "Ghayn (غ)", "1000"],
            ].map(([l1, v1, l2, v2, l3, v3], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 text-xs">{l1}</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">{v1}</td>
                <td className="px-4 py-2 text-xs">{l2}</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">{v2}</td>
                <td className="px-4 py-2 text-xs">{l3}</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">{v3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Other Mathematical Properties ────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Other Mathematical Properties of the Initialed Suras
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Fourteen Arabic letters, half the Arabic alphabet, participate in the
          formation of 14 different sets of Quranic Initials. By adding the
          gematrical value of each one of these letters, plus the number of
          suras which are prefixed with Quranic Initials (29), we obtain a total
          of 722, or 19×19×2.
        </p>
        <p>
          Additionally, if we add the total gematrical value of all 14 initials,
          plus the number of the first sura where the initial occurs, we get a
          grand total of 988, 19×52.
        </p>
        <p>
          If we add the number of occurrences of each of the 14 letters as an
          initial, plus the numbers of the suras where it occurs as an initial,
          the Grand Total comes to 2033, 19×107.
        </p>
      </section>

      {/* ── Initial Totals Table ─────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-2 text-left font-semibold">Letter</th>
              <th className="px-4 py-2 text-left font-semibold">Value</th>
              <th className="px-4 py-2 text-left font-semibold">First Sura</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['A (Alef)', '1', '2'],
              ['L (Laam)', '30', '2'],
              ['M (Mim)', '40', '2'],
              ['S (Saad)', '90', '7'],
              ['R (Ra)', '200', '10'],
              ['K (Kaf)', '20', '19'],
              ['H (Ha)', '5', '19'],
              ['Y (Ya)', '10', '19'],
              ["'A ('Ayn)", '70', '19'],
              ['T (Ta)', '9', '20'],
              ['S (Seen)', '60', '26'],
              ['H (HHa)', '8', '40'],
              ['Q (Qaf)', '100', '42'],
              ['N (Noon)', '50', '68'],
              ['Totals', '693', '295'],
            ].map(([letter, value, firstSura], i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="px-4 py-2 text-xs">{letter}</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">{value}</td>
                <td className="px-4 py-2 font-mono text-xs">{firstSura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">
          693 + 295 = 988 = 19×52
        </p>
        <p className="text-sm font-semibold text-primary">
          693 + 29 (suras) = 722 = 19×19×2
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Grand Total for all initialed suras, combining total frequency of
          Quranic Initials with their total gematrical values in each sura, is
          1,089,479 (19×57,341). The slightest alteration or distortion destroys
          the system.
        </p>
        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Note: The total gematrical value of the Quranic Initials in a given
            sura equals the gematrical value of each initial multiplied by the
            frequency of occurrence of that initial in the sura.
          </p>
        </div>
      </section>

      {/* ── Mathematical Coding: Major Parameters ────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Major Parameters of the Quranic Initials
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The sum of numbers of suras and verses where the Quranic Initials are
          found, plus the initial&apos;s frequency of occurrence in that sura,
          plus the number of the first sura where the initials occur, plus the
          number of the last sura where the initials occur, produces a total
          that equals 44,232, or 19×2348. Thus, the distribution of the Quranic
          Initials in the initialed suras is so intricate that their counts and
          their placement within suras are intertwined to give a grand total
          that is a multiple of 19.
        </p>
        <p>
          It is noteworthy that the initial &ldquo;N&rdquo; must be counted as
          two N&apos;s. This reflects the fact that the original Quranic text
          spells out this initial with 2 N&apos;s.
        </p>
        <p>
          A special mathematical coding authenticates the number of verses where
          the Quranic Initials themselves are found. All Quranic Initials occur
          in Verse 1, except in Sura 42 (initials in Verses 1 and 2). The sum
          of all sura numbers (822), plus the count of initials per sura (79),
          plus initialed verses (30), equals 931 = 19×49. This fact is supported
          by a remarkable mathematical phenomenon: if we multiply the sura
          numbers by the number of initials per sura, instead of adding, the
          grand total is still divisible by 19.
        </p>
        <p>
          Obviously, it is crucial to have two different initialed verses in
          Sura 42 in order to conform with the Quran&apos;s mathematical code.
          The fact that Verse 1 of Sura 42 consists of the two Quranic Initials
          &ldquo;H.M.&rdquo; and the second verse consists of the three Initials
          &ldquo;&lsquo;A.S.Q.&rdquo; has perplexed Muslim scholars and
          orientalists for 14 centuries.
        </p>
        <p>
          Every element of the Quran is mathematically authenticated. When the
          numbers of all initialed suras are added to the number of verses in
          each sura, plus the number of verses containing initials, plus the
          gematrical values of those initials, the Grand Total is 7030, or
          19×370. Remarkably, if we multiply instead of add the first two
          columns, the Grand Total is still divisible by 19: 63,536 = 19×3,344.
        </p>
        <p>
          The numbers of suras and verses are among the basic elements of the
          Quran. Both initialed and un-initialed suras are independently coded.
          The numbers of all initialed suras, added to the number of verses in
          each sura and the sum of verse numbers (1+2+3+…+n), produce a Grand
          Total of 190,133, or 19×10,007. The values for the un-initialed suras
          add up to 237,785 = 19×12,515.
        </p>
        <p>
          By adding the number of every sura to the number of the next sura and
          accumulating the sums to the end of the Quran, we obtain a value
          corresponding to each sura. The total values for the initialed suras
          come to 15,675 = 19×825. The values for the un-initialed suras add up
          to 237,785 = 19×12,515.
        </p>
      </section>

      {/* ── Mathematical Coding: The Word "God" ──────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Mathematical Coding: The Word &ldquo;God&rdquo;
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <ol className="space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed">
          <li>
            As shown earlier, the word &ldquo;God&rdquo; occurs in the Quran
            2698 times, 19×142.
          </li>
          <li>
            The numbers of verses where the word &ldquo;God&rdquo; occurs add
            up to 118,123, also a multiple of 19 (118,123 = 19×6,217).
          </li>
          <li>
            From the first Quranic Initials (A.L.M. 2:1) to the last initial
            (N. 68:1), there are 2641, 19×139, occurrences of the word
            &ldquo;God.&rdquo;
          </li>
          <li>
            The word &ldquo;God&rdquo; occurs 57 times in the section outside
            the initials (outside Suras 2–68).
          </li>
          <li>
            By adding the numbers of the suras and verses where these 57
            occurrences are found, we get a total of 2432, or 19×128.
          </li>
          <li>
            The word &ldquo;God&rdquo; occurs in 85 suras. If we add the number
            of each sura to the number of verses between the first and last
            occurrences of the word &ldquo;God,&rdquo; both verses inclusive,
            the Grand Total comes to 8170, or 19×430.
          </li>
          <li>
            The Quran&apos;s dominant message is that there is only &ldquo;One
            God.&rdquo; The word &ldquo;One,&rdquo; in Arabic &ldquo;Wahed,&rdquo;
            occurs in the Quran 25 times. Six of these occurrences refer to
            other than God (one kind of food, one door, etc.). The other 19
            occurrences refer to God.
          </li>
        </ol>

        <p>
          These simple phenomena gave us many difficulties while simply counting
          the word &ldquo;God.&rdquo; We were a group of workers, equipped with
          computers, and all of us college graduates. Yet, we made several
          errors in counting, calculating, or simply writing the counts of the
          word &ldquo;God.&rdquo; Those who still claim that Muhammad was the
          author of the Quran are totally illogical; he never went to college,
          and he did not have a computer.
        </p>

        <p>
          The crucial importance of the word &ldquo;ONE&rdquo; as the
          Quran&apos;s basic message is manifested in the fact that the
          Quran&apos;s common denominator, 19, happens to be the gematrical
          value of the word &ldquo;ONE&rdquo; (Wahed): W(6) + A(1) + H(8) +
          D(4) = 19.
        </p>
      </section>

      {/* ── The Basmalah's Four Words ─────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Basmalah&apos;s Four Words
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The opening statement of the Quran — &ldquo;In the name of God, Most
          Gracious, Most Merciful&rdquo; — consists of four words. Each word
          occurs in the Quran a number of times that is a multiple of 19:
        </p>
      </section>

      {/* ── Basmalah Table ────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-border/60 overflow-hidden"
      >
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Frequency of the Basmalah&apos;s Four Words
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  Word
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">
                  Occurrences
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground font-mono">
                  Multiple of 19
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Name (Ism)', '19', '19 × 1'],
                ['God (Allah)', '2,698', '19 × 142'],
                ['Most Gracious (Al-Rahman)', '57', '19 × 3'],
                ['Most Merciful (Al-Raheem)', '114', '19 × 6'],
              ].map(([word, count, multiple], i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-2 text-xs">{word}</td>
                  <td className="px-4 py-2 font-mono text-xs text-primary font-medium">
                    {count}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {multiple}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
