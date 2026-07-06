import { QuranRef } from '@/components/quran-ref'

/* ──────────────────────────────────────────────────────────────────────────
 * Appendix 1 — One of the Great Miracles [74:35]
 * (from: Quran The Final Testament, by Rashad Khalifa, PhD.)
 *
 * Faithful reproduction of the source text published at
 * masjidtucson.org/quran/appendices/appendix1.html
 * ────────────────────────────────────────────────────────────────────────── */

/* ── Reusable layout primitives ───────────────────────────────────────────── */

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <hr className="flex-1 border-border/50" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0 text-center">
        {children}
      </h2>
      <hr className="flex-1 border-border/50" />
    </div>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-5 text-base leading-relaxed text-foreground/90">
      {children}
    </section>
  )
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed space-y-2">
      {children}
    </div>
  )
}

function Highlight({
  children,
  center = true,
}: {
  children: React.ReactNode
  center?: boolean
}) {
  return (
    <div
      data-card
      className={`rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2${
        center ? ' text-center' : ''
      }`}
    >
      {children}
    </div>
  )
}

function MonoBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
      <code className="font-mono text-xs text-foreground/80 whitespace-pre">
        {children}
      </code>
    </div>
  )
}

type Cell = string | number

function DataTable({
  caption,
  headers,
  rows,
}: {
  caption?: string
  headers: string[]
  rows: Cell[][]
}) {
  return (
    <div
      data-card
      className="rounded-xl border border-border/60 overflow-hidden"
    >
      {caption && (
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {caption}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2 font-semibold text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const first = String(row[0])
              const isTotal =
                first.startsWith('Total') || first === '—' || first === ''
              return (
                <tr
                  key={i}
                  className={`border-b border-border/20 hover:bg-muted/20 transition-colors${
                    isTotal ? ' bg-muted/20 font-medium' : ''
                  }`}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={
                        j === 0
                          ? 'px-4 py-2 font-mono text-xs text-primary font-medium align-top'
                          : 'px-4 py-2 text-xs align-top'
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

const SIMPLE_FACTS = [
  'The first verse (1:1), known as "Basmalah," consists of 19 letters.',
  'The Quran consists of 114 suras, which is 19 × 6.',
  'The total number of verses in the Quran is 6346, or 19 × 334. [6234 numbered verses & 112 un-numbered verses (Basmalahs) 6234 + 112 = 6346] Note that 6 + 3 + 4 + 6 = 19.',
  'The Basmalah occurs 114 times, despite its conspicuous absence from Sura 9 (it occurs twice in Sura 27) & 114 = 19 × 6.',
  'From the missing Basmalah of Sura 9 to the extra Basmalah of Sura 27, there are precisely 19 suras.',
  'It follows that the total of the sura numbers from 9 to 27 (9+10+11+12+...+26+27) is 342, or 19 × 18.',
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
]

const Q_SUMMARY = [
  'The frequency of occurrence of "Q" in Sura "Q" (No. 50) is 57, 19×3.',
  'The letter "Q" occurs in the other Q-initialed sura (No. 42) exactly the same number of times, 57.',
  'The total occurrence of the letter "Q" in the two Q-initialed suras is 114, which equals the number of suras in the Quran.',
  '"The Quran" is mentioned in the Quran 57 times.',
  'The description of the Quran as "Majid" (Glorious) is correlated with the frequency of occurrence of the letter "Q" in each of the Q-initialed suras. The word "Majid" has a gematrical value of 57.',
  'Sura 42 consists of 53 verses, and 42+53 = 95 = 19×5.',
  'Sura 50 consists of 45 verses, and 50+45 = 95 = 19×5.',
  'The number of Q\'s in all verses numbered "19" throughout the Quran is 76, 19×4.',
]

export function AppendixContent() {
  return (
    <>
      {/* ── Part 1 intro ─────────────────────────────────────────────────── */}
      <NoteBox>
        <p>
          <QuranRef reference="74:35" /> &ldquo;One of the Great Miracles&rdquo;
        </p>
        <p className="text-xs">
          (from: Quran The Final Testament, by Rashad Khalifa, PhD.)
        </p>
      </NoteBox>

      <Prose>
        <p>
          The Quran is characterized by a unique phenomenon never found in any
          human authored book. Every element of the Quran is mathematically
          composed — the suras, the verses, the words, the number of certain
          letters, the number of words from the same root, the number and
          variety of divine names, the unique spelling of certain words, the
          absence or deliberate alteration of certain letters within certain
          words, and many other elements of the Quran besides its content. There
          are two major facets of the Quran&rsquo;s mathematical system: (1) The
          mathematical literary composition, and (2) The mathematical structure
          involving the numbers of suras and verses. Because of this
          comprehensive mathematical coding, the slightest distortion of the
          Quran&rsquo;s text or physical arrangement is immediately exposed.
        </p>
      </Prose>

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
      <Prose>
        <p>
          For the first time in history we have a scripture with built-in proof
          of divine authorship — a superhuman mathematical composition.
        </p>
        <p>
          Any reader of this book can easily verify the Quran&rsquo;s
          mathematical miracle. The word &ldquo;God&rdquo; (Allah) is written in
          bold capital letters throughout the text. The frequency of occurrence
          of the word &ldquo;God&rdquo; is noted at the bottom of each page. The
          last page of the text, Page 372, shows that the total occurrence of
          the word &ldquo;God&rdquo; is 2698, or 19×142.
        </p>
        <p>
          Furthermore, when we add the numbers of all the verses where the word
          &ldquo;God&rdquo; occurs, we obtain a total of 118123, also a multiple
          of 19 (118123 = 19×6217). Nineteen is the common denominator
          throughout the Quran&rsquo;s mathematical system.
        </p>
        <p>
          This phenomenon alone suffices as incontrovertible proof that the
          Quran is God&rsquo;s message to the world. No human being(s) could
          have kept track of 2698 occurrences of the word &ldquo;God,&rdquo; and
          the numbers of verses where they occur. This is especially impossible
          in view of (1) the age of ignorance during which the Quran was
          revealed, and (2) the fact that the suras and verses were widely
          separated in time and place of revelation. The chronological order of
          revelation was vastly different from the final format (Appendix 23).
          However, the Quran&rsquo;s mathematical system is not limited to the
          word &ldquo;God;&rdquo; it is extremely vast, extremely intricate, and
          totally comprehensive.
        </p>
      </Prose>

      {/* ── The Simple Facts ─────────────────────────────────────────────── */}
      <SectionDivider>The Simple Facts</SectionDivider>

      <Prose>
        <p>
          Like the Quran itself, the Quran&rsquo;s mathematical coding ranges
          from the very simple, to the very complex. The Simple Facts are those
          observations that can be ascertained without using any tools. The
          complex facts require the assistance of a calculator or a computer.
          The following facts do not require any tools to be verified:
        </p>

        <ol className="space-y-3 list-none">
          {SIMPLE_FACTS.map((fact, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{fact}</span>
            </li>
          ))}
        </ol>

        <p className="text-sm text-muted-foreground">
          This is a condensed summary of the Simple Facts.
        </p>
      </Prose>

      {/* ── The Literary Mathematical Composition ────────────────────────── */}
      <SectionDivider>The Literary Mathematical Composition</SectionDivider>

      <Prose>
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
          predetermined interim:
        </p>
      </Prose>

      <NoteBox>
        <p>
          They said, &ldquo;Why hasn&rsquo;t a miracle come down to him from his
          Lord?&rdquo; Say, &ldquo;Only God knows the future. Therefore, wait,
          and I will wait along with you.&rdquo; [10:20]
        </p>
        <p className="text-center text-xs">******</p>
        <p>
          Those who disbelieved said, &ldquo;This is no more than a fabrication
          by him, with the help of other people.&rdquo; Indeed, they uttered a
          blasphemy; a falsehood. Others said, &ldquo;Tales from the past that
          he wrote down; they were dictated to him day and night.&rdquo; Say,
          &ldquo;This was sent down from the One who knows &lsquo;the
          secret&rsquo; in the heavens and the earth.&rdquo; Surely, He is
          Forgiving, Most Merciful. [25:4-6]
        </p>
      </NoteBox>

      <Prose>
        <p>
          The Quranic Initials constitute a major portion of the Quran&rsquo;s
          19-based mathematical miracle.
        </p>
      </Prose>

      <DataTable
        caption="Table 1: List of the Quranic Initials and Their Suras"
        headers={['No.', 'Sura', 'Title', 'Initials']}
        rows={[
          [1, 2, 'The Heifer', 'A.L.M.'],
          [2, 3, 'The Amramites', 'A.L.M.'],
          [3, 7, 'The Purgatory', 'A.L.M.S.'],
          [4, 10, 'Jonah', 'A.L.R.'],
          [5, 11, 'Hûd', 'A.L.R.'],
          [6, 12, 'Joseph', 'A.L.R.'],
          [7, 13, 'Thunder', 'A.L.M.R.'],
          [8, 14, 'Abraham', 'A.L.R.'],
          [9, 15, 'Al-Hijr Valley', 'A.L.R.'],
          [10, 19, 'Mary', "K.H.Y.'A.S."],
          [11, 20, 'T.H.', 'T.H.'],
          [12, 26, 'The Poets', 'T.S.M.'],
          [13, 27, 'The Ant', 'T.S.'],
          [14, 28, 'History', 'T.S.M.'],
          [15, 29, 'The Spider', 'A.L.M.'],
          [16, 30, 'The Romans', 'A.L.M.'],
          [17, 31, 'Luqmaan', 'A.L.M.'],
          [18, 32, 'Prostration', 'A.L.M.'],
          [19, 36, 'Y.S.', 'Y.S.'],
          [20, 38, 'S.', 'S.'],
          [21, 40, 'Forgiver', 'H.M.'],
          [22, 41, 'Elucidated', 'H.M.'],
          [23, 42, 'Consultation', "H.M. 'A.S.Q."],
          [24, 43, 'Ornaments', 'H.M.'],
          [25, 44, 'Smoke', 'H.M.'],
          [26, 45, 'Kneeling', 'H.M.'],
          [27, 46, 'The Dunes', 'H.M.'],
          [28, 50, 'Q.', 'Q.'],
          [29, 68, 'The Pen', 'NuN'],
        ]}
      />

      {/* ── Historical Background ────────────────────────────────────────── */}
      <SectionDivider>Historical Background</SectionDivider>

      <Prose>
        <p>
          In 1968, I realized that the existing English translations of the
          Quran did not present the truthful message of God&rsquo;s Final
          Testament. For example, the two most popular translators, Yusuf Ali
          and Marmaduke Pickthall, could not overcome their corrupted religious
          traditions when it came to the Quran&rsquo;s great criterion in{' '}
          <QuranRef reference="39:45" />.
        </p>
      </Prose>

      <NoteBox>
        <p>
          When God ALONE is mentioned, the hearts of those who do not believe in
          the Hereafter shrink with aversion. But when others are mentioned
          beside Him, they rejoice. [39:45]
        </p>
      </NoteBox>

      <Prose>
        <p>
          Yusuf Ali omitted the crucial word &ldquo;ALONE&rdquo; from his
          translation, and altered the rest of the verse by inserting the word
          &ldquo;(gods).&rdquo; Thus, he utterly destroyed this most important
          Quranic criterion. He translated <QuranRef reference="39:45" /> as
          follows:
        </p>
      </Prose>

      <NoteBox>
        <p>
          &ldquo;When God, the One and Only, is mentioned, the hearts of those
          who believe not in the Hereafter are filled with disgust and horror;
          but when (gods) other than He are mentioned, behold, they are filled
          with joy.&rdquo; [39:45] (according to A. Yusuf Ali)
        </p>
      </NoteBox>

      <Prose>
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
      </Prose>

      <NoteBox>
        <p>
          &ldquo;And when Allah alone is mentioned, the hearts of those who
          believe not in the Hereafter are repelled, and when those (whom they
          worship) beside Him are mentioned, behold! they are glad.&rdquo;
          [39:45] (according to Marmaduke Pickthall)
        </p>
      </NoteBox>

      <Prose>
        <p>
          When I saw the truth of God&rsquo;s word thus distorted, I decided to
          translate the Quran, at least for the benefit of my own children.
          Since I was a chemist by profession, and despite my extensive
          religious background — my father was a renowned Sufi leader in Egypt —
          I vowed to God that I would not move from one verse to the next unless
          I fully understood it.
        </p>
        <p>
          I purchased all the available books of Quranic translations and
          exegeses (Tafseer) I could find, placed them on a large table, and
          began my translation. The first sura, The Key, was completed in a few
          days. The first verse in Sura 2 is &ldquo;A.L.M.&rdquo; The
          translation of this verse took four years, and coincided with the
          divine unveiling of &ldquo;the secret,&rdquo; the great mathematical
          Miracle of the Quran.
        </p>
        <p>
          The books of Quranic exegeses unanimously agreed that &ldquo;no one
          knows the meaning or significance of the Quranic Initials A.L.M., or
          any other initials.&rdquo; I decided to write the Quran into the
          computer, analyze the whole text, and see if there were any
          mathematical correlations among these Quranic initials.
        </p>
        <p>
          I used a time-share terminal, connected by telephone to a giant
          computer. To test my hypothesis, I decided to look at the
          single-lettered Quranic Initials — &ldquo;Q&rdquo; (Qaaf) of Suras 42
          and 50, &ldquo;S&rdquo; (Saad) of Suras 7, 19, and 38, and
          &ldquo;N&rdquo; (Noon) of Sura 68. As detailed in my first book
          MIRACLE OF THE QURAN: SIGNIFICANCE OF THE MYSTERIOUS ALPHABETS
          (Islamic Productions, 1973), many previous attempts to unravel the
          mystery had failed.
        </p>
      </Prose>

      {/* ── The Initial Q ────────────────────────────────────────────────── */}
      <SectionDivider>
        The Quranic Initial &ldquo;Q&rdquo; (Qaaf)
      </SectionDivider>

      <Prose>
        <p>
          The computer data showed that the text of the only Q-initialed suras,
          42 and 50, contained the same number of Q&rsquo;s, 57 and 57. That was
          the first hint that a deliberate mathematical system may exist in the
          Quran.
        </p>
        <p>
          Sura 50 is entitled &ldquo;Q,&rdquo; prefixed with &ldquo;Q,&rdquo;
          and the first verse reads, &ldquo;Q, and the glorious Quran.&rdquo;
          This indicated that &ldquo;Q&rdquo; stands for &ldquo;Quran,&rdquo;
          and the total number of Q&rsquo;s in the two Q-initialed suras
          represents the Quran&rsquo;s 114 suras (57+57 = 114 = 19×6). This idea
          was strengthened by the fact that &ldquo;the Quran&rdquo; occurs in
          the Quran 57 times.
        </p>
        <p>
          The Quran is described in Sura &ldquo;Q&rdquo; as &ldquo;Majid&rdquo;
          (glorious), and the Arabic word &ldquo;Majid&rdquo; has a gematrical
          value of 57: M(40) + J(3) + I(10) + D(4) = 57.
        </p>
        <p>Sura 42 consists of 53 verses, and 42+53 = 95 = 19×5.</p>
        <p>
          Sura 50 consists of 45 verses, and 50+45 = 95, same total as in Sura
          42.
        </p>
        <p>
          By counting the letter &ldquo;Q&rdquo; in every &ldquo;Verse 19&rdquo;
          throughout the Quran, the total count comes to 76, 19×4. Here is a
          summary of the Q-related data:
        </p>
      </Prose>

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
          {Q_SUMMARY.map((item, i) => (
            <li key={i} className="flex items-start gap-3 px-4 py-2.5">
              <span className="shrink-0 size-5 flex items-center justify-center rounded bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span className="text-foreground/80">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Prose>
        <p>
          Glimpses of the Quran&rsquo;s mathematical composition began to
          emerge. For example, it was observed that the people who disbelieved
          in Lot are mentioned in 50:13 and occur in the Quran 13 times — 7:80;
          11:70, 74, 89; 21:74; 22:43; 26:160; 27:54, 56; 29:28; 38:13; 50:13;
          and 54:33. Consistently, they are referred to as &ldquo;Qawm,&rdquo;
          with the single exception of the Q-initialed Sura 50 where they are
          referred to as &ldquo;Ikhwaan.&rdquo; Obviously, if the regular,
          Q-containing word &ldquo;Qawm&rdquo; were used, the count of the
          letter &ldquo;Q&rdquo; in Sura 50 would have become 58, and this whole
          phenomenon would have disappeared. With the recognized absolute
          accuracy of mathematics, the alteration of a single letter destroys
          the system.
        </p>
        <p>
          Another relevant example is the reference to Mecca in{' '}
          <QuranRef reference="3:96" /> as &ldquo;Becca&rdquo;! This strange
          spelling of the renowned city has puzzled Islamic scholars for many
          centuries. Although Mecca is mentioned in the Quran properly spelled
          in <QuranRef reference="48:24" />, the letter &ldquo;M&rdquo; is
          substituted with a &ldquo;B&rdquo; in <QuranRef reference="3:96" />.
          It turns out that Sura 3 is an M-initialed sura, and the count of the
          letter &ldquo;M&rdquo; would have deviated from the Quran&rsquo;s code
          if &ldquo;Mecca&rdquo; was spelled correctly in{' '}
          <QuranRef reference="3:96" />.
        </p>
      </Prose>

      {/* ── NuN (Noon) ───────────────────────────────────────────────────── */}
      <SectionDivider>NuN (Noon)</SectionDivider>

      <Prose>
        <p>
          This initial is unique; it occurs in one sura, 68, and the name of the
          letter is spelled out as three letters — Noon Wow Noon — in the
          original text, and is therefore counted as two N&rsquo;s. The total
          count of this letter in the N-initialed sura is 133, 19×7.
        </p>
        <p>
          The fact that &ldquo;N&rdquo; is the last Quranic Initial (see Table
          1) brings out a number of special observations. For example, the
          number of verses from the first Quranic Initial (A.L.M. of 2:1) to the
          last initial (N. of 68:1) is 5263, or 19×277.
        </p>
        <p>
          The word &ldquo;God&rdquo; (Allah) occurs 2641 (19×139) times between
          the first initial and the last initial. Since the total occurrence of
          the word &ldquo;God&rdquo; is 2698, it follows that its occurrence
          outside the initials &ldquo;A.L.M.&rdquo; of 2:1 on one side, and the
          initial &ldquo;N&rdquo; of 68:1 on the other side, is 57, 19×3. Tables
          9 to 18 prove that the initial &ldquo;NuN&rdquo; must be spelled out
          to show two N&rsquo;s.
        </p>
      </Prose>

      {/* ── S (Saad) ─────────────────────────────────────────────────────── */}
      <SectionDivider>S (Saad)</SectionDivider>

      <Prose>
        <p>
          This initial prefixes three suras, 7, 19, and 38, and the total
          occurrence of the letter &ldquo;S&rdquo; (Saad) in these three suras
          is 152, 19×8 (Table 2). It is noteworthy that in{' '}
          <QuranRef reference="7:69" />, the word &ldquo;Bastatan&rdquo; is
          written in some printings with a &ldquo;Saad,&rdquo; instead of
          &ldquo;Seen.&rdquo;
        </p>
      </Prose>

      <DataTable
        caption={
          'Table 2: Frequency of Occurrence of the Letter "S" in the Saad-initialed Suras'
        }
        headers={['Sura No.', 'Frequency of "S"']}
        rows={[
          [7, '97'],
          [19, '26'],
          [38, '29'],
          ['Total', '152 (19×8)'],
        ]}
      />

      <Prose>
        <p>
          This is an erroneous distortion that violates the Quran&rsquo;s code.
          By looking at the oldest available copy of the Quran, the Tashkent
          Copy, it was found that the word &ldquo;Bastatan&rdquo; is correctly
          written with a &ldquo;Seen&rdquo; (see photocopy below).
        </p>
      </Prose>

      {/* ── Historical Note ───────────────────────────────────────────────── */}
      <Highlight center={false}>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Historical Note
        </p>
        <p className="text-base leading-relaxed text-foreground/90">
          The momentous discovery that &ldquo;19&rdquo; is the Quran&rsquo;s
          common denominator became a reality in January 1974, coinciding with
          Zul-Hijjah 1393 A.H. The Quran was revealed in 13 B.H. (Before
          Hijrah). This makes the number of years from the revelation of the
          Quran to the revelation of its miracle 1393 + 13 = 1406 = 19×74. As
          noted above, the unveiling of the Miracle took place in January 1974.
          The correlation between 19×74 lunar years and 1974 solar years could
          not escape notice. This is especially uncanny in view of the fact that
          &ldquo;19&rdquo; is mentioned in Sura 74.
        </p>
      </Highlight>

      {/* ── Y.S. (Ya Seen) ───────────────────────────────────────────────── */}
      <SectionDivider>Y.S. (Ya Seen)</SectionDivider>

      <Prose>
        <p>
          These two letters prefix Sura 36. The letter &ldquo;Y&rdquo; occurs in
          this sura 237 times, while the letter &ldquo;S&rdquo; (Seen) occurs 48
          times. The total of both letters is 285, 19×15.
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
          normally occur in a long sura like Sura 36. In my book QURAN: VISUAL
          PRESENTATION OF THE MIRACLE (Islamic Productions, 1982) every
          &ldquo;Y&rdquo; and &ldquo;S&rdquo; in Sura 36 is marked with a star.
        </p>
      </Prose>

      {/* ── H.M. (Ha Mim) ────────────────────────────────────────────────── */}
      <SectionDivider>H.M. (Ha Mim)</SectionDivider>

      <Prose>
        <p>
          Seven suras are prefixed with the letters &ldquo;H&rdquo; and
          &ldquo;M;&rdquo; Suras 40 through 46. The total occurrence of these
          two letters in the seven H.M.-initialed suras is 2147, or 19×113. The
          detailed data are shown in Table 3.
        </p>
        <p>
          Naturally, the alteration of a single letter &ldquo;H&rdquo; or
          &ldquo;M&rdquo; in any of the seven H.M.-initialed suras would have
          destroyed this intricate phenomenon.
        </p>
      </Prose>

      <DataTable
        caption={
          'Table 3: Occurrence of the Letters "H" and "M" in the Seven H.M.-Initialed Suras'
        }
        headers={['Sura No.', 'Freq. of "H"', 'Freq. of "M"', 'H + M']}
        rows={[
          [40, '64', '380', '444'],
          [41, '48', '276', '324'],
          [42, '53', '300', '353'],
          [43, '44', '324', '368'],
          [44, '16', '150', '166'],
          [45, '31', '200', '231'],
          [46, '36', '225', '261'],
          ['Total', '292', '1855', '2147 (19×113)'],
        ]}
      />

      {/* ── `A.S.Q. ───────────────────────────────────────────────────────── */}
      <SectionDivider>&lsquo;A.S.Q. (&lsquo;Ayn Seen Qaf)</SectionDivider>

      <Prose>
        <p>
          These initials constitute Verse 2 of Sura 42, and the total occurrence
          of these letters in this sura is 209, or 19×11. The letter
          &ldquo;&lsquo;A&rdquo; (&lsquo;Ayn) occurs 98 times, the letter
          &ldquo;S&rdquo; (Seen) occurs 54 times, and the letter &ldquo;Q&rdquo;
          (Qaf) occurs 57 times.
        </p>
      </Prose>

      {/* ── A.L.M. ───────────────────────────────────────────────────────── */}
      <SectionDivider>A.L.M. (Alef Laam Mim)</SectionDivider>

      <Prose>
        <p>
          The letters &ldquo;A,&rdquo; &ldquo;L,&rdquo; and &ldquo;M&rdquo; are
          the most frequently used letters in the Arabic language, and in the
          same order as we see in the Quranic Initials — &ldquo;A,&rdquo; then
          &ldquo;L,&rdquo; then &ldquo;M.&rdquo; These letters prefix six suras
          — 2, 3, 29, 30, 31, and 32 — and the total occurrence of the three
          letters in each of the six suras is a multiple of 19: 9899 (19×521),
          5662 (19×298), 1672 (19×88), 1254 (19×66), 817 (19×43), and 570
          (19×30), respectively. Thus, the total occurrence of the three letters
          in the six suras is 19874 (19×1046), and the alteration of one of
          these letters destroys this phenomenon.
        </p>
      </Prose>

      <DataTable
        caption={
          'Table 4: Occurrence of the Letters "A," "L," and "M" in the A.L.M.-Initialed Suras'
        }
        headers={[
          'Sura No.',
          'Freq. of "A"',
          'Freq. of "L"',
          'Freq. of "M"',
          'Total',
        ]}
        rows={[
          [2, '4502', '3202', '2195', '9899 (19×521)'],
          [3, '2521', '1892', '1249', '5662 (19×298)'],
          [29, '774', '554', '344', '1672 (19×88)'],
          [30, '544', '393', '317', '1254 (19×66)'],
          [31, '347', '297', '173', '817 (19×43)'],
          [32, '257', '155', '158', '570 (19×30)'],
          ['Total', '8945', '6493', '4436', '19874 (19×1046)'],
        ]}
      />

      {/* ── A.L.R. ───────────────────────────────────────────────────────── */}
      <SectionDivider>A.L.R. (Alef Laam Ra)</SectionDivider>

      <Prose>
        <p>
          These initials are found in Suras 10, 11, 12, 14, and 15. The total
          occurrences of these letters in these suras are 2489 (19×131), 2489
          (19×131), 2375 (19×125), 1197 (19×63), and 912 (19×48), respectively
          (Table 5).
        </p>
      </Prose>

      <DataTable
        caption={
          'Table 5: Occurrence of the Letters "A," "L," and "R" in the A.L.R.-Initialed Suras'
        }
        headers={[
          'Sura No.',
          'Freq. of "A"',
          'Freq. of "L"',
          'Freq. of "R"',
          'Total',
        ]}
        rows={[
          [10, '1319', '913', '257', '2489 (19×131)'],
          [11, '1370', '794', '325', '2489 (19×131)'],
          [12, '1306', '812', '257', '2375 (19×125)'],
          [14, '585', '452', '160', '1197 (19×63)'],
          [15, '493', '323', '96', '912 (19×48)'],
          ['Total', '5073', '3294', '1095', '9462 (19×498)'],
        ]}
      />

      {/* ── A.L.M.R. ─────────────────────────────────────────────────────── */}
      <SectionDivider>A.L.M.R. (Alef Laam Mim Ra)</SectionDivider>

      <Prose>
        <p>
          These initials prefix one sura, No. 13, and the total frequency of
          occurrence of the four letters is 1482, or 19×78. The letter
          &ldquo;A&rdquo; occurs 605 times, &ldquo;L&rdquo; occurs 480 times,
          &ldquo;M&rdquo; occurs 260 times, and &ldquo;R&rdquo; occurs 137
          times.
        </p>
      </Prose>

      {/* ── A.L.M.S. ─────────────────────────────────────────────────────── */}
      <SectionDivider>A.L.M.S. (Alef Laam Mim Saad)</SectionDivider>

      <Prose>
        <p>
          Only one sura is prefixed with these initials, Sura 7, and the letter
          &ldquo;A&rdquo; occurs in this sura 2529 times, &ldquo;L&rdquo; occurs
          1530 times, &ldquo;M&rdquo; occurs 1164 times, and &ldquo;S&rdquo;
          (Saad) occurs 97 times. Thus, the total occurrence of the four letters
          in this sura is 2529 + 1530 + 1164 + 97 = 5320 = 19×280.
        </p>
        <p>
          An important observation here is the interlocking relationship
          involving the letter &ldquo;S&rdquo; (Saad). This letter occurs also
          in Suras 19 and 38. While complementing its sister letters in Sura 7
          to give a total that is divisible by 19, the frequency of this letter
          also complements its sister letters in Suras 19 and 38 to give a
          multiple of 19 (see Page 380).
        </p>
        <p>
          Additionally, the Quranic Initial &ldquo;S&rdquo; (Saad) interacts
          with the Quranic Initials &ldquo;K.H.Y.&lsquo;A.&rdquo; (Kaaf Ha Ya
          &lsquo;Ayn) in Sura 19 to give another total that is also a multiple
          of 19 (see Page 383). This interlocking relationship — which is not
          unique to the initial &ldquo;S&rdquo; (Saad) — contributes to the
          intricacy of the Quran&rsquo;s numerical code.
        </p>
      </Prose>

      {/* ── K.H.Y.'A.S. ─────────────────────────────────────────────────── */}
      <SectionDivider>
        K.H.Y.&lsquo;A.S. (Kaaf Ha Ya &lsquo;Ayn Saad)
      </SectionDivider>

      <Prose>
        <p>
          This is the longest set of initials, consisting of five letters, and
          it occurs in one sura, Sura 19. The letter &ldquo;K&rdquo; in Sura 19
          occurs 137 times, &ldquo;H&rdquo; occurs 175 times, &ldquo;Y&rdquo;
          occurs 343 times, &ldquo;&lsquo;A&rdquo; occurs 117 times, and
          &ldquo;S&rdquo; (Saad) occurs 26 times. Thus, the total occurrence of
          the five letters is 137 + 175 + 343 + 117 + 26 = 798 = 19×42.
        </p>
      </Prose>

      {/* ── H., T.H., T.S. & T.S.M. ─────────────────────────────────────── */}
      <SectionDivider>
        H., T.H. (Ta Ha), T.S. (Ta Seen) &amp; T.S.M. (Ta Seen Mim)
      </SectionDivider>

      <Prose>
        <p>
          An intricate interlocking relationship links these overlapping Quranic
          Initials to produce a total that is also a multiple of 19. The initial
          &ldquo;H.&rdquo; is found in Suras 19 and 20. The initials
          &ldquo;T.H.&rdquo; prefix Sura 20. The initials &ldquo;T.S.&rdquo; are
          found in Sura 27, while the initials &ldquo;T.S.M.&rdquo; prefix its
          surrounding Suras 26 &amp; 28.
        </p>
        <p>
          It should be noted at this time that the longer, more complex,
          interlocking and overlapping initials are found in the suras where
          uncommonly powerful miracles are narrated. For example, the virgin
          birth of Jesus is given in Sura 19, which is prefixed with the longest
          set of initials, K.H.Y.&lsquo;A.S.
        </p>
        <p>
          The interlocking initials &ldquo;H.,&rdquo; &ldquo;T.H.,&rdquo;
          &ldquo;T.S.,&rdquo; and &ldquo;T.S.M.&rdquo; prefix suras describing
          the miracles of Moses, Jesus, and the uncommon occurrences surrounding
          Solomon and his jinns. God thus provides stronger evidence to support
          stronger miracles. The frequencies of occurrence of these initials are
          presented in Table 6.
        </p>
      </Prose>

      <DataTable
        caption={
          'Table 6: Occurrence of the Quranic Initials "H.," "T.H.," "T.S.," and "T.S.M." in Their Suras'
        }
        headers={[
          'Sura',
          'Freq. of "H"',
          'Freq. of "T"',
          'Freq. of "S"',
          'Freq. of "M"',
        ]}
        rows={[
          [19, '175', '—', '—', '—'],
          [20, '251', '28', '—', '—'],
          [26, '—', '33', '94', '484'],
          [27, '—', '27', '94', '—'],
          [28, '—', '19', '102', '460'],
          ['Total', '426', '107', '290', '944'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          426 + 107 + 290 + 944 = 1767 = 19×93
        </p>
      </Highlight>

      {/* ── Gematrical Values ────────────────────────────────────────────── */}
      <SectionDivider>What Is a &ldquo;Gematrical Value&rdquo;?</SectionDivider>

      <Prose>
        <p>
          When the Quran was revealed, 14 centuries ago, the numbers known today
          did not exist. A universal system was used where the letters of the
          Arabic, Hebrew, Aramaic, and Greek alphabets were used as numerals.
          The number assigned to each letter is its &ldquo;Gematrical
          Value.&rdquo; The numerical values of the Arabic alphabet are shown in
          Table 7.
        </p>
      </Prose>

      <DataTable
        caption="Table 7: Gematrical Values of the Arabic Alphabet"
        headers={['Letter', 'Value', 'Letter', 'Value', 'Letter', 'Value']}
        rows={[
          ['Alef (ا)', '1', 'Kaf (ك)', '20', 'Qaf (ق)', '100'],
          ["Ba' (ب)", '2', 'Laam (ل)', '30', "Ra' (ر)", '200'],
          ['Jim (ج)', '3', 'Mim (م)', '40', 'Shin (ش)', '300'],
          ['Dal (د)', '4', 'Noon (ن)', '50', "Ta' (ت)", '400'],
          ["Ha' (ه)", '5', 'Seen (س)', '60', "Tha' (ث)", '500'],
          ['Waw (و)', '6', 'Ayn (ع)', '70', "Kha' (خ)", '600'],
          ['Zay (ز)', '7', "Fa' (ف)", '80', 'Dhal (ذ)', '700'],
          ["Ha' (ح)", '8', 'Saad (ص)', '90', 'Dad (ض)', '800'],
          ["TTa' (ط)", '9', '—', '—', "Za' (ظ)", '900'],
          ["Ya' (ي)", '10', '—', '—', 'Ghayn (غ)', '1000'],
        ]}
      />

      {/* ── Other Mathematical Properties ────────────────────────────────── */}
      <SectionDivider>
        Other Mathematical Properties of the Initialed Suras
      </SectionDivider>

      <Prose>
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
          grand total of 988, 19×52. Table 8 presents these data.
        </p>
      </Prose>

      <DataTable
        caption="Table 8: The 14 Letters Used in Forming Quranic Initials"
        headers={['Letter', 'Value', 'First Sura']}
        rows={[
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
          ['Total', '693', '295'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          693 + 295 = 988 = 19×52
        </p>
        <p className="text-sm font-semibold text-primary">
          also 693 + 29 (suras) = 722 = 19×19×2
        </p>
      </Highlight>

      <Prose>
        <p>
          If we add the number of occurrences of each of the 14 letters listed
          in Table 8 as an initial, plus the numbers of the suras where it
          occurs as an initial, the Grand Total comes to 2033, 19×107. See Table
          9.
        </p>
      </Prose>

      <DataTable
        caption="Table 9: Mathematically Structured Distribution of the Quranic Initials"
        headers={[
          'Initial',
          'No. of Occurrences',
          'Suras Where It Occurs',
          'Total',
        ]}
        rows={[
          ['A (Alef)', '13', '2+3+7+10+11+12+13+14+15+29+30+31+32', '222'],
          ['L (Laam)', '13', '2+3+7+10+11+12+13+14+15+29+30+31+32', '222'],
          [
            'M (Mim)',
            '17',
            '2+3+7+13+26+28+29+30+31+32+40+41+42+43+44+45+46',
            '519',
          ],
          ['S (Saad)', '3', '7+19+38', '67'],
          ['R (Ra)', '6', '10+11+12+13+14+15', '81'],
          ['K (Kaf)', '1', '19', '20'],
          ['H (Ha)', '2', '19+20', '41'],
          ['Y (Ya)', '2', '19+36', '57'],
          ["'A ('Ayn)", '2', '19+42', '63'],
          ['T (Ta)', '4', '20+26+27+28', '105'],
          ['S (Seen)', '5', '26+27+28+36+42', '164'],
          ['H (HHa)', '7', '40+41+42+43+44+45+46', '308'],
          ['Q (Qaf)', '2', '42+50', '94'],
          ['N (Noon)', '2', '68', '70'],
          ['Total', '79', '1954', '2033 (19×107)'],
        ]}
      />

      <Prose>
        <p>
          Table 10 presents the total frequency of Quranic Initials, plus the
          total gematrical value of these letters in the whole sura. The Grand
          Total for all initialed suras is 1089479. This number, in excess of
          one million, is a multiple of 19 (1089479 = 19 × 57341). The slightest
          alteration or distortion destroys the system.
        </p>
      </Prose>

      <DataTable
        caption="Table 10: Total Gematrical Values of All Quranic Initials In Their Suras"
        headers={[
          'Suras',
          'Initials',
          'Frequency of Initials',
          'Total Value in Whole Sura',
        ]}
        rows={[
          [2, 'A.L.M.', '9899', '188362'],
          [3, 'A.L.M.', '5662', '109241'],
          [7, 'A.L.M.S', '5320', '103719'],
          [10, 'A.L.R.', '2489', '80109'],
          [11, 'A.L.R.', '2489', '90190'],
          [12, 'A.L.R.', '2375', '77066'],
          [13, 'A.L.M.R.', '1482', '52805'],
          [14, 'A.L.R.', '1197', '46145'],
          [15, 'A.L.R.', '912', '29383'],
          [19, "K.H.Y.'A.S.", '798', '17575'],
          [20, 'T.H.', '279', '1507'],
          [26, 'T.S.M.', '611', '25297'],
          [27, 'T.S.', '121', '5883'],
          [28, 'T.S.M.', '581', '24691'],
          [29, 'A.L.M.', '1672', '31154'],
          [30, 'A.L.M.', '1254', '25014'],
          [31, 'A.L.M.', '817', '16177'],
          [32, 'A.L.M.', '570', '11227'],
          [36, 'Y.S.', '285', '5250'],
          [38, 'S.', '29', '2610'],
          [40, 'H.M.', '444', '15712'],
          [41, 'H.M.', '324', '11424'],
          [42, "H.M.-'A.S.Q.", '562', '28224'],
          [43, 'H.M.', '368', '13312'],
          [44, 'H.M.', '166', '6128'],
          [45, 'H.M.', '231', '8248'],
          [46, 'H.M.', '261', '9288'],
          [50, 'Q', '57', '5700'],
          [68, 'N,N', '133', '6650'],
          ['Total', '', '41388', '1048091'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          41388 + 1048091 = 1089479 (19 × 57341)
        </p>
      </Highlight>

      <NoteBox>
        <p>
          Note: The total gematrical value of the Quranic Initials in a given
          sura equals the gematrical value of each initial multiplied by the
          frequency of occurrence of that initial in the sura.
        </p>
      </NoteBox>

      <Prose>
        <p>
          It is noteworthy that the initial &ldquo;N&rdquo; must be counted as
          two N&rsquo;s. This reflects the fact that the original Quranic text
          spells out this initial with 2 N&rsquo;s.
        </p>
      </Prose>

      {/* ── Major Parameters ─────────────────────────────────────────────── */}
      <SectionDivider>
        Major Parameters of the Quranic Initials (Suras, Verses, Frequency,
        First Sura, &amp; Last Sura)
      </SectionDivider>

      <Prose>
        <p>
          Table 11 shows that the sum of numbers of suras and verses where the
          Quranic Initials are found, plus the initial&rsquo;s frequency of
          occurrence in that sura, plus the number of the first sura where the
          initials occur, plus the number of the last sura where the initials
          occur, produces a total that equals 44232, or 19×2328. Thus, the
          distribution of the Quranic Initials in the initialed suras is so
          intricate that their counts and their placement within suras are
          intertwined to give a grand total that is a multiple of 19.
        </p>
      </Prose>

      <DataTable
        caption="Table 11: Parameters of the 14 Individual Quranic Initials"
        headers={[
          'Initial',
          'Sura, Verse, & (Frequency) of Initial in Each Sura',
          'First Sura',
          'Last Sura',
        ]}
        rows={[
          [
            'A (Alef)',
            '2:1 (4502), 3:1 (2521), 7:1 (2529), 10:1 (1319), 11:1 (1370), 12:1 (1306), 13:1 (605), 14:1 (585), 15:1 (493), 29:1 (774), 30:1 (544), 31:1 (347), 32:1 (257)',
            '2',
            '32',
          ],
          [
            'L (Laam)',
            '2:1 (3202), 3:1 (1892), 7:1 (1530), 10:1 (913), 11:1 (794), 12:1 (812), 13:1 (480), 14:1 (452), 15:1 (323), 29:1 (554), 30:1 (393), 31:1 (297), 32:1 (155)',
            '2',
            '32',
          ],
          [
            'M (Mim)',
            '2:1 (2195), 3:1 (1249), 7:1 (1164), 13:1 (260), 26:1 (484), 28:1 (460), 29:1 (344), 30:1 (317), 31:1 (173), 32:1 (158), 40:1 (380), 41:1 (276), 42:1 (300), 43:1 (324), 44:1 (150), 45:1 (200), 46:1 (225)',
            '2',
            '46',
          ],
          ['S (Saad)', '7:1 (97), 19:1 (26), 38:1 (29)', '7', '38'],
          [
            'R (Ra)',
            '10:1 (257), 11:1 (325), 12:1 (257), 13:1 (137), 14:1 (160), 15:1 (96)',
            '10',
            '15',
          ],
          ['K (Kaf)', '19:1 (137)', '19', '19'],
          ['H (Ha)', '19:1 (175), 20:1 (251)', '19', '20'],
          ['Y (Ya)', '19:1 (343), 36:1 (237)', '19', '36'],
          ["'A ('Ayn)", '19:1 (117), 42:2 (98)', '19', '42'],
          ['T (Ta)', '20:1 (28), 26:1 (33), 27:1 (27), 28:1 (19)', '20', '28'],
          [
            'S (Seen)',
            '26:1 (94), 27:1 (94), 28:1 (102), 36:1 (48), 42:2 (54)',
            '26',
            '42',
          ],
          [
            'H (HHa)',
            '40:1 (64), 41:1 (48), 42:1 (53), 43:1 (44), 44:1 (16), 45:1 (31), 46:1 (36)',
            '40',
            '46',
          ],
          ['Q (Qaf)', '42:2 (57), 50:1 (57)', '42', '50'],
          ['N (NuN)', '68:1 (133)', '68', '68'],
          ['Total', '43423', '295', '514'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          Grand Total = 43423 + 295 + 514 = 44232 = 19×2328
        </p>
      </Highlight>

      <Prose>
        <p>
          A special mathematical coding authenticates the number of verses where
          the Quranic Initials themselves are found. As detailed in Table 11,
          all Quranic Initials occur in Verse 1, except in Sura 42 (initials in
          Verses 1 and 2). This fact is supported by the remarkable mathematical
          phenomenon detailed in Table 12. If we multiply the first two columns
          of Table 12, instead of adding, we still end up with a Total that is
          divisible by 19 (see Table 13).
        </p>
      </Prose>

      <DataTable
        caption="Table 12: Mathematical Coding of the Number of Verses with Initials"
        headers={['Sura No.', 'No. of Initials', 'Initialed Verses']}
        rows={[
          [2, '3', '1'],
          [3, '3', '1'],
          [7, '4', '1'],
          [10, '3', '1'],
          [11, '3', '1'],
          [12, '3', '1'],
          [13, '4', '1'],
          [14, '3', '1'],
          [15, '3', '1'],
          [19, '5', '1'],
          [20, '2', '1'],
          [26, '3', '1'],
          [27, '2', '1'],
          [28, '3', '1'],
          [29, '3', '1'],
          [30, '3', '1'],
          [31, '3', '1'],
          [32, '3', '1'],
          [36, '2', '1'],
          [38, '1', '1'],
          [40, '2', '1'],
          [41, '2', '1'],
          [42, '5', '2'],
          [43, '2', '1'],
          [44, '2', '1'],
          [45, '2', '1'],
          [46, '2', '1'],
          [50, '1', '1'],
          [68, '2', '1'],
          ['Total', '79', '30'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          822 + 79 + 30 = 931 (19×49)
        </p>
        <p className="text-xs text-muted-foreground">
          (822 = sum of the sura numbers in the first column)
        </p>
      </Highlight>

      <DataTable
        caption="Table 13: Multiplying the First Two Columns of Table 12, Instead of Adding (Sura № × № of Initials)"
        headers={['Sura No.', 'No. of Initials', 'Initialed Verses']}
        rows={[
          [2, '3', '1'],
          [3, '3', '1'],
          [7, '4', '1'],
          ['—', '—', '—'],
          [42, '5', '2'],
          ['—', '—', '—'],
          [50, '1', '1'],
          [68, '2', '1'],
          ['Total', '2022', '30'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          2022 + 30 = 2052 (19×108)
        </p>
      </Highlight>

      <Prose>
        <p>
          Obviously, it is crucial to have two different initialed verses in
          Sura 42 in order to conform with the Quran&rsquo;s mathematical code.
          The fact that Verse 1 of Sura 42 consists of the two Quranic Initials
          &ldquo;H.M.&rdquo; and the second verse consists of the three Initials
          &ldquo;&lsquo;A.S.Q.&rdquo; has perplexed Muslim scholars and
          orientalists for 14 centuries.
        </p>
        <p>
          By the end of this Appendix, the reader will see that every element of
          the Quran is mathematically authenticated. The elements we are dealing
          with now are &ldquo;the number of Quranic Initials in each initialed
          sura&rdquo; and &ldquo;the number of verses that contain Quranic
          Initials.&rdquo; Tables 11 through 13 have dealt with these two
          elements.
        </p>
        <p>
          Additional mathematical authentication is shown in Tables 14 and 15.
          In Table 14, we have the numbers of all initialed suras added to the
          number of verses in each sura, plus the number of verses containing
          initials, plus the gematrical values of those initials. The Grand
          Total is 7030, or 19×370.
        </p>
      </Prose>

      <DataTable
        caption="Table 14: Mathematical Properties of the Initialed Suras"
        headers={[
          'Sura Number',
          'No. of Verses',
          'No. of Initialed Verses',
          'Gematrical Value of the Initials',
          'TOTAL',
        ]}
        rows={[
          [2, '286', '1', '71', '360'],
          [3, '200', '1', '71', '275'],
          [7, '206', '1', '161', '375'],
          [10, '109', '1', '231', '351'],
          [11, '123', '1', '231', '366'],
          [12, '111', '1', '231', '355'],
          [13, '43', '1', '271', '328'],
          [14, '52', '1', '231', '298'],
          [15, '99', '1', '231', '346'],
          [19, '98', '1', '195', '313'],
          [20, '135', '1', '14', '170'],
          [26, '227', '1', '109', '363'],
          [27, '93', '1', '69', '190'],
          [28, '88', '1', '109', '226'],
          [29, '69', '1', '71', '170'],
          [30, '60', '1', '71', '162'],
          [31, '34', '1', '71', '137'],
          [32, '30', '1', '71', '134'],
          [36, '83', '1', '70', '190'],
          [38, '88', '1', '90', '217'],
          [40, '85', '1', '48', '174'],
          [41, '54', '1', '48', '144'],
          [42, '53', '2', '278', '375'],
          [43, '89', '1', '48', '181'],
          [44, '59', '1', '48', '152'],
          [45, '37', '1', '48', '131'],
          [46, '35', '1', '48', '130'],
          [50, '45', '1', '100', '196'],
          [68, '52', '1', '50 + 50', '221'],
          ['Total', '2743', '30', '3435', '7030 (19×370)'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          822 + 2743 + 30 + 3435 = 7030 (19×370)
        </p>
        <p className="text-xs text-muted-foreground">
          (822 = sum of the sura numbers)
        </p>
      </Highlight>

      <Prose>
        <p>
          Remarkably, if we multiply the first two columns of Table 14, instead
          of adding them, we still get a Grand Total that is divisible by 19
          (Table 15).
        </p>
        <p>
          The number of verses per sura, and the numbers assigned to each verse
          are among the basic elements of the Quran. Not only are these elements
          authenticated mathematically, but both initialed and un-initialed
          suras are independently coded. Since we are now dealing with the
          initialed suras, Table 16 presents the numbers assigned to these
          suras, added to the numbers of verses in each sura, plus the sum of
          verse numbers (1+2+3+ ... + n). The Grand Total is 190133, or
          19×10007.
        </p>
      </Prose>

      <DataTable
        caption="Table 15: Multiplying the First 2 Columns of Table 14, Instead of Adding Them"
        headers={[
          'Sura Number',
          'No. of Verses',
          'No. of Initialed Verses',
          'Gematrical Value of the Initials',
          'TOTAL',
        ]}
        rows={[
          [2, '× 286', '+ 1', '+ 71', '= 644'],
          [3, '× 200', '+ 1', '+ 71', '= 672'],
          [7, '× 206', '+ 1', '+ 161', '= 1604'],
          ['—', '—', '—', '—', '—'],
          [50, '× 45', '+ 1', '+ 100', '= 2351'],
          [68, '× 52', '+ 1', '+ (50+50)', '= 3637'],
          ['Total', '60071', '30', '3435', '63536 (19×3344)'],
        ]}
      />

      <DataTable
        caption="Table 16: Mathematical Structuring of the Verses of Initialed Suras"
        headers={['Sura No.', 'No. of Verses', 'Sum of Verse #s', 'Total']}
        rows={[
          [2, '286', '41041', '41329'],
          [3, '200', '20100', '20303'],
          [7, '206', '21321', '21534'],
          ['—', '—', '—', '—'],
          [50, '45', '1035', '1130'],
          [68, '52', '1378', '1498'],
          ['Total', '2743', '186568', '190133 (19×10007)'],
        ]}
      />

      <Prose>
        <p>
          By adding the number of every sura to the number of the next sura, and
          accumulating the sums of sura numbers as we continue this process to
          the end of the Quran, we will have a value that corresponds to each
          sura. Thus, Sura 1 will have a corresponding value of 1, Sura 2 will
          have a value of 1+2=3, Sura 3 will have a value of 3+3=6, Sura 4 will
          have a value of 6+4 = 10, and so on to the end of the Quran. The total
          values for the initialed and the un-initialed suras are independently
          divisible by 19. The values for the initialed suras are shown in Table
          17.
        </p>
      </Prose>

      <DataTable
        caption="Table 17: Values Obtained by Successive Addition of Sura Numbers"
        headers={['Sura Number', 'Calculated Value']}
        rows={[
          [2, '3'],
          [3, '6'],
          [7, '28'],
          [10, '55'],
          [11, '66'],
          [12, '78'],
          [13, '91'],
          [14, '105'],
          [15, '120'],
          [19, '190'],
          [20, '210'],
          ['—', '—'],
          [44, '990'],
          [45, '1035'],
          [46, '1081'],
          [50, '1275'],
          [68, '2346'],
          ['Total', '15675 (19×825)'],
        ]}
      />

      <Prose>
        <p>
          The values calculated for the un-initialed suras add up to a total of
          237785, which is also a multiple of 19 (237785 = 19×12515).
        </p>
      </Prose>

      {/* ── Mathematical Coding: The Word "God" ──────────────────────────── */}
      <SectionDivider>
        Mathematical Coding of Special Words — The Word &ldquo;God&rdquo;
        (Allah)
      </SectionDivider>

      <Prose>
        <ol className="space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed">
          <li>
            As shown earlier the word &ldquo;God&rdquo; occurs in the Quran 2698
            times, 19×142.
          </li>
          <li>
            The numbers of verses where the word &ldquo;God&rdquo; occurs add up
            to 118123, also a multiple of 19 (118123 = 19×6217).
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

        <ol
          className="space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed"
          start={3}
        >
          <li>
            From the first Quranic Initials (A.L.M. 2:1) to the last initial (N.
            68:1), there are 2641, 19×139, occurrences of the word
            &ldquo;God.&rdquo;
          </li>
          <li>
            The word &ldquo;God&rdquo; occurs 57 times in the section outside
            the Initials (Table 18).
          </li>
          <li>
            By adding the numbers of the suras and verses where these 57
            occurrences of the word &ldquo;God&rdquo; are found, we get a total
            of 2432, or 19×128. See Table 18.
          </li>
          <li>
            The word &ldquo;God&rdquo; occurs in 85 suras. If we add the number
            of each sura to the number of verses between the first and last
            occurrences of the word &ldquo;God,&rdquo; both verses inclusive,
            the Grand Total comes to 8170 or 19×430. An abbreviated
            representation of the data is shown in Table 19.
          </li>
        </ol>
      </Prose>

      <DataTable
        caption='Table 18: Occurrence of the Word "God" outside the Initialed Section'
        headers={[
          'Number of Sura',
          'Numbers of Verses',
          'Number of Occurrences',
        ]}
        rows={[
          [1, '1, 2', '2'],
          [69, '33', '1'],
          [70, '3', '1'],
          [71, '3, 4, 13, 15, 17, 19, 25', '7'],
          [72, '4, 5, 7, 12, 18, 19, 22, 23', '10'],
          [73, '20', '7'],
          [74, '31, 56', '3'],
          [76, '6, 9, 11, 30', '5'],
          [79, '25', '1'],
          [81, '29', '1'],
          [82, '19', '1'],
          [84, '23', '1'],
          [85, '8, 9, 20', '3'],
          [87, '7', '1'],
          [88, '24', '1'],
          [91, '13', '2'],
          [95, '8', '1'],
          [96, '14', '1'],
          [98, '2, 5, 8', '3'],
          [104, '6', '1'],
          [110, '1, 2', '2'],
          [112, '1, 2', '2'],
          ['Total', '1798 + 634', '57 (19×3)'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          Sum of numbers of the suras &amp; verses = 1798 + 634 = 2432 = 19×128
        </p>
        <p className="text-sm font-semibold text-primary">
          Total occurrence of the word &ldquo;God&rdquo; outside the initialed
          section = 57 (19×3)
        </p>
      </Highlight>

      <DataTable
        caption='Table 19: All Suras in Which the Word "God" (Allah) Is Mentioned'
        headers={[
          'No.',
          'Sura No.',
          'First Verse',
          'Last Verse',
          '# Verses From First to Last',
        ]}
        rows={[
          ['1.', '1', '1', '2', '2'],
          ['2.', '2', '7', '286', '280'],
          ['3.', '3', '2', '200', '199'],
          ['—', '—', '—', '—', '—'],
          ['83.', '104', '6', '—', '1'],
          ['84.', '110', '1', '2', '2'],
          ['85.', '112', '1', '2', '2'],
          ['Total', '3910', '', '', '4260'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          3910 + 4260 = 8170 = 19×430
        </p>
        <p className="text-xs text-muted-foreground">
          These mathematical properties cover all occurrences of the word
          &ldquo;God.&rdquo;
        </p>
      </Highlight>

      <Prose>
        <p>
          [7] The Quran&rsquo;s dominant message is that there is only
          &ldquo;One God.&rdquo; The word &ldquo;One,&rdquo; in Arabic
          &ldquo;Wahed&rdquo; occurs in the Quran 25 times. Six of these
          occurrences refer to other than God (one kind of food, one door,
          etc.). The other 19 occurrences refer to God. These data are found in
          the classic reference INDEX TO THE WORDS OF QURAN.
        </p>
        <p>
          The crucial importance of the word &ldquo;ONE&rdquo; as the
          Quran&rsquo;s basic message is manifested in the fact that the
          Quran&rsquo;s common denominator, 19, happens to be the gematrical
          value of the word &ldquo;ONE&rdquo; (Wahed): W(6) + A(1) + H(8) + D(4)
          = 19.
        </p>
      </Prose>

      {/* ── WHY 19! ──────────────────────────────────────────────────────── */}
      <SectionDivider>Why 19!</SectionDivider>

      <Prose>
        <p>
          As pointed out later in this Appendix, all God&rsquo;s scriptures, not
          only the Quran, were mathematically coded with the number
          &ldquo;19.&rdquo; Even the universe at large bears this divine mark.
          The number 19 can be looked upon as the Almighty Creator&rsquo;s
          signature on everything He created (see Appendix 38). The number
          &ldquo;19&rdquo; possesses unique mathematical properties beyond the
          scope of this Appendix. For example:
        </p>
        <ol className="space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed">
          <li>It is a prime number.</li>
          <li>
            It encompasses the first numeral (1) and the last numeral (9), as if
            to proclaim God&rsquo;s attribute in 57:3 as the &ldquo;Alpha and
            the Omega.&rdquo;
          </li>
          <li>
            It looks the same in all languages of the world. Both components, 1
            and 9, are the only numerals that look the same in all languages.
          </li>
        </ol>
      </Prose>

      <NoteBox>
        <p className="text-center leading-relaxed">
          The Lord our God is ONE!
          <br />
          Therefore, you shall worship the Lord your God with all your heart,
          with all your soul, with all your mind, and with all your strength.
        </p>
        <p className="text-center text-xs">
          [Deuteronomy 6:4-5] [Mark 12:29] [Quran 2:163, 17:22-23]
        </p>
      </NoteBox>

      <Prose>
        <ol
          className="space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed"
          start={4}
        >
          <li>
            It possesses many peculiar mathematical properties. For example, 19
            is the sum of the first powers of 9 and 10, and the difference
            between the second powers of 9 and 10.
          </li>
        </ol>
        <p>
          We now understand that the universal coding of God&rsquo;s creations
          with the number 19 rests in the fact that it is the gematrical value
          of the word &ldquo;ONE&rdquo; in all the scriptural languages —
          Aramaic, Hebrew, and Arabic.
        </p>
      </Prose>

      <DataTable
        caption="Table 20: Why 19!"
        headers={['Letter (Hebrew)', 'Letter (Arabic)', 'Value']}
        rows={[
          ['V', 'W', '6'],
          ['A', 'A', '1'],
          ['H', 'H', '8'],
          ['D', 'D', '4'],
          ['Total', '', '19'],
        ]}
      />

      <Prose>
        <p>
          The number 19, therefore, proclaims the First Commandment in all the
          scriptures: that there is only ONE God.
        </p>
        <p>
          As shown in Table 7, the Aramaic, Hebrew, and Arabic alphabets used to
          double as numerals in accordance with a universally established
          system. The Hebrew word for &ldquo;ONE&rdquo; is &ldquo;VAHD&rdquo;
          (pronounced V-AHAD). In Arabic, the word for &ldquo;ONE&rdquo; is
          &ldquo;WAHD&rdquo; (pronounced WAAHED). See Table 20.
        </p>
      </Prose>

      {/* ── The Word "Quran" ─────────────────────────────────────────────── */}
      <SectionDivider>The Word &ldquo;Quran&rdquo;</SectionDivider>

      <Prose>
        <p>
          The word &ldquo;Quran&rdquo; occurs in the Quran 58 times, with one of
          them, in 10:15, referring to &ldquo;another Quran.&rdquo; This
          particular occurrence, therefore, must be excluded. Thus, the
          frequency of occurrence of &ldquo;this Quran&rdquo; in the Quran is
          57, or 19×3.
        </p>
      </Prose>

      <DataTable
        caption='Table 21: Suras and Verses Where "Quran" Occurs'
        headers={['Sura', 'Verse']}
        rows={[
          [2, '185'],
          [4, '82'],
          [5, '101'],
          [6, '19'],
          [7, '204'],
          [9, '111'],
          [10, '37'],
          ['–', '61'],
          [12, '2'],
          ['–', '3'],
          [15, '1'],
          ['–', '87'],
          ['–', '91'],
          [16, '98'],
          [17, '9'],
          ['–', '41'],
          ['–', '45'],
          ['–', '46'],
          ['–', '60'],
          ['–', '78'],
          ['–', '82'],
          ['–', '88'],
          ['–', '89'],
          ['–', '106'],
          [18, '54'],
          [20, '2'],
          ['–', '113'],
          ['–', '114'],
          [25, '30'],
          ['–', '32'],
          [27, '1'],
          ['–', '6'],
          ['–', '76'],
          ['–', '92'],
          [28, '85'],
          [30, '58'],
          [34, '31'],
          [36, '2'],
          ['–', '69'],
          [38, '1'],
          [39, '27'],
          ['–', '28'],
          [41, '3'],
          ['–', '26'],
          [42, '7'],
          [43, '3'],
          ['–', '31'],
          [46, '29'],
          [47, '24'],
          [50, '1'],
          ['–', '45'],
          [54, '17'],
          ['–', '22'],
          ['–', '32'],
          ['–', '40'],
          [55, '2'],
          [56, '77'],
          [59, '21'],
          [72, '1'],
          [73, '4'],
          ['–', '20'],
          [75, '17'],
          ['–', '18'],
          [76, '23'],
          [84, '21'],
          [85, '21'],
          ['Total', '1356 + 3052 = 4408 (19×232)'],
        ]}
      />

      <Prose>
        <p>
          Two other grammatical forms of the word &ldquo;Quran&rdquo; occur in
          12 verses. These include the word &ldquo;Quranun&rdquo; and the word
          &ldquo;Quranahu.&rdquo; One of these occurrences, in 13:31 refers to
          &ldquo;another Quran&rdquo; that cause the mountains to crumble.
          Another occurrence, in 41:44, refers to &ldquo;a non-Arabic
          Quran.&rdquo; These two occurrences, therefore, are excluded. Table 21
          shows a list of the suras and verses where the word
          &ldquo;Quran,&rdquo; in all its grammatical forms, occurs.
        </p>
      </Prose>

      {/* ── A Strong Foundation ──────────────────────────────────────────── */}
      <SectionDivider>A Strong Foundation</SectionDivider>

      <Prose>
        <p>
          The Quran&rsquo;s first verse, &ldquo;In the Name of God, Most
          Gracious, Most Merciful,&rdquo; known as Basmalah, consists of 19
          Arabic letters. Its constituent words occur in the Quran consistently
          in multiples of 19.
        </p>
      </Prose>

      <DataTable
        caption="Frequency of the Basmalah's Four Words"
        headers={['Word', 'Occurrences', 'Multiple of 19']}
        rows={[
          ['The first word — "Ism" (Name)', '19', '19 × 1'],
          ['The second word — "Allah" (God)', '2,698', '19 × 142'],
          ['The third word — "Al-Rahman" (Most Gracious)', '57', '19 × 3'],
          ['The fourth word — "Al-Raheem" (Most Merciful)', '114', '19 × 6'],
        ]}
      />

      <Prose>
        <p>
          Professor Cesar Majul looked at the gematrical value of more than 400
          attributes of God, and found only four names whose gematrical values
          are multiples of 19:
        </p>
      </Prose>

      <DataTable
        headers={['Divine Name', 'Gematrical Value']}
        rows={[
          ['1. "Waahed" (One)', '19'],
          ['2. "Zul Fadl Al-\'Azim" (Possessor of Infinite Grace)', '2698'],
          ['3. "Majid" (Glorious)', '57'],
          ['4. "Jaami\'" (Summoner)', '114'],
        ]}
      />

      <Prose>
        <p>
          As noted above, the only Divine Names whose gematrical values are
          divisible by 19 correspond exactly to the frequencies of occurrence of
          the Basmalah&rsquo;s four words. The four words of Basmalah, the
          frequencies of occurrence of those words, and the only four divine
          names whose gematrical values are divisible by 19, all share the same
          four numbers: 19, 2698, 57, and 114.
        </p>
      </Prose>

      {/* ── The Five Pillars of Islam ────────────────────────────────────── */}
      <SectionDivider>The Five Pillars of Islam</SectionDivider>

      <Prose>
        <p>
          Although the Quran provides numerous important commandments governing
          all aspects of our lives (see for example 17:22-38), five basic
          &ldquo;pillars&rdquo; have been traditionally emphasized. They are:
        </p>
        <ul className="space-y-2 list-none">
          <li>
            <span className="font-semibold text-foreground">Shahaadah:</span>{' '}
            Bearing witness that there is no other god besides God.
          </li>
          <li>
            <span className="font-semibold text-foreground">Salat:</span>{' '}
            Observing five daily Contact Prayers.
          </li>
          <li>
            <span className="font-semibold text-foreground">Seyaam:</span>{' '}
            Fasting during the ninth month of the Islamic calendar (Ramadan).
          </li>
          <li>
            <span className="font-semibold text-foreground">Zakat:</span> Giving
            away 2.5% of one&rsquo;s net income as a charity to specified
            people.
          </li>
          <li>
            <span className="font-semibold text-foreground">Hajj:</span>{' '}
            Pilgrimage to Mecca once in a lifetime for those who can afford it.
          </li>
        </ul>
        <p>
          Like everything else in the Quran, these are mathematically
          structured.
        </p>
      </Prose>

      <Prose>
        <p className="font-semibold text-foreground">1. One God (Shahaadah)</p>
        <p>
          As mentioned earlier, the word &ldquo;ONE&rdquo; that refers to God
          occurs in the Quran 19 times. The reference to God &ldquo;ALONE&rdquo;
          occurs 5 times, and the sum of the sura and verse numbers where we
          find these five occurrences is 361, 19×19.
        </p>
      </Prose>

      <DataTable
        caption="Table 22: All Suras and Verses from First Occurrence of LAA ELAAHA ELLA HOO to the Last Occurrence"
        headers={['Sura No.', 'No. of Verses', 'Sum of Verse #s', 'Total']}
        rows={[
          [2, '123', '27675', '27800'],
          [3, '200', '20100', '20303'],
          ['—', '—', '—', '—'],
          [9, '127', '8128', '8264'],
          ['—', '—', '—', '—'],
          [72, '28', '406', '506'],
          [73, '9', '45', '127'],
          ['Total', '5312', '308490', '316502 (19×16658)'],
        ]}
      />

      <Prose>
        <p>
          The &ldquo;First Pillar of Islam&rdquo; is stated in 3:18 as
          &ldquo;LAA ELAAHA ELLA HOO&rdquo; (There is no other god besides Him).
          This most important expression occurs in 19 suras. The first
          occurrence is in 2:163, and the last occurrence is in 73:9. Table 22
          shows that the total of sura numbers, plus the number of verses
          between the first and last occurrences, plus the sum of these verse
          numbers is 316502, or 19×16658.
        </p>
        <p>
          Also, by adding the numbers of the 19 suras where LAA ELAAHA ELLA HOO
          occurs, plus the verse numbers where this crucial expression is found,
          plus the total number of occurrences (29), the Grand Total comes to
          2128, or 19×112. The details are shown in Table 23.
        </p>
      </Prose>

      <DataTable
        caption='Table 23: List of All Occurrences of the Crucial Phrase "LAA ELAAHA ELLA HOO" (There is no other god besides Him)'
        headers={[
          'No.',
          'Sura No.',
          'Verses with Shahadah',
          'Frequency of Shahadah',
        ]}
        rows={[
          ['1.', '2', '163, 255', '2'],
          ['2.', '3', '2, 6, 18, 18', '4'],
          ['3.', '4', '87', '1'],
          ['4.', '6', '102, 106', '2'],
          ['5.', '7', '158', '1'],
          ['6.', '9', '31', '1'],
          ['7.', '11', '14', '1'],
          ['8.', '13', '30', '1'],
          ['9.', '20', '8, 98', '2'],
          ['10.', '23', '116', '1'],
          ['11.', '27', '26', '1'],
          ['12.', '28', '70, 88', '2'],
          ['13.', '35', '3', '1'],
          ['14.', '39', '6', '1'],
          ['15.', '40', '3, 62, 65', '3'],
          ['16.', '44', '8', '1'],
          ['17.', '59', '22, 23', '2'],
          ['18.', '64', '13', '1'],
          ['19.', '73', '9', '1'],
          ['Total', '507', '1592', '29'],
        ]}
      />

      <Highlight>
        <p className="text-sm font-semibold text-primary">
          507 + 1592 + 29 = 2128 = 19×112
        </p>
      </Highlight>

      <Prose>
        <p className="font-semibold text-foreground">
          2. The Contact Prayers (Salat)
        </p>
        <p>
          The word &ldquo;Salat&rdquo; occurs in the Quran 67 times, and when we
          add the numbers of suras and verses of these 67 occurrences, the total
          comes to 4674, or 19×246 (see INDEX OF THE QURAN).
        </p>

        <p className="font-semibold text-foreground">3. Fasting (Seyaam)</p>
        <p>
          The commandment to fast is mentioned in 2:183, 184, 185, 187, 196;
          4:92; 5:89, 95; 33:35, 35; &amp; 58:4. The total of these numbers is
          1387, or 19×73. It is noteworthy that 33:35 mentions fasting twice,
          one for the believing men, and the other for the believing women.
        </p>

        <p className="font-semibold text-foreground">
          4. The Obligatory Charity (Zakat) &amp; 5. Hajj Pilgrimage to Mecca
        </p>
        <p>
          While the first three &ldquo;Pillars of Islam&rdquo; are obligatory
          upon all Muslim men and women, the Zakat and Hajj are decreed only for
          those who can afford them. This explains the interesting mathematical
          phenomenon associated with Zakat and Hajj.
        </p>
        <p>
          The Zakat charity is mentioned in 2:43, 83, 110, 177, 277; 4:77, 162;
          5:12, 55; 7:156; 9:5, 11, 18, 71; 18:81; 19:13, 31, 55; 21:73; 22:41,
          78; 23:4; 24:37, 56; 27:3; 30:39; 31:4; 33:33; 41:7; 58:13; 73:20; and
          98:5. These numbers add up to 2395. This total does not quite make it
          as a multiple of 19; it is up by 1.
        </p>
        <p>
          The Hajj Pilgrimage occurs in 2:189, 196, 197; 9:3; and 22:27. These
          numbers add up to 645, and this total does not quite make it as a
          multiple of 19; it is down by 1.
        </p>
        <p>
          Thus, Zakat and Hajj, together, give a total of 2395 + 645 = 3040 =
          19×160.
        </p>
      </Prose>

      {/* ── The Quran's Mathematical Structure ────────────────────────────── */}
      <SectionDivider>The Quran&rsquo;s Mathematical Structure</SectionDivider>

      <Prose>
        <p>
          The Quran&rsquo;s suras, verses, words, and letters are not only
          mathematically composed, but also arranged into a superhuman structure
          that is purely mathematical, i.e., the literary content has nothing to
          do with such an arrangement.
        </p>
        <p>
          Since the physical construction of the Quran is purely mathematical,
          it would be expected that the numbers mentioned in the Quran must
          conform with the Quran&rsquo;s 19-based code.
        </p>
        <p>
          A total of 30 unique numbers are mentioned throughout the Quran, and
          the sum of all these numbers is 162146, a multiple of 19 (162146 =
          19×8534). Table 24 lists all the numbers mentioned in the Quran,
          without the repetitions.
        </p>
      </Prose>

      <DataTable
        caption="Table 24: All the Quranic Numbers"
        headers={['Number', 'Location Example']}
        rows={[
          [1, '2:163'],
          [2, '4:11'],
          [3, '4:171'],
          [4, '9:2'],
          [5, '18:22'],
          [6, '25:59'],
          [7, '41:12'],
          [8, '69:17'],
          [9, '27:48'],
          [10, '2:196'],
          [11, '12:4'],
          [12, '9:36'],
          [19, '74:30'],
          [20, '8:65'],
          [30, '7:142'],
          [40, '7:142'],
          [50, '29:14'],
          [60, '58:4'],
          [70, '9:80'],
          [80, '24:4'],
          [99, '38:23'],
          [100, '2:259'],
          [200, '8:65'],
          [300, '18:25'],
          [1000, '2:96'],
          [2000, '8:66'],
          [3000, '3:124'],
          [5000, '3:125'],
          [50000, '70:4'],
          [100000, '37:147'],
          ['Total', '162146 (19 × 8534)'],
        ]}
      />

      <Prose>
        <p>
          The numbers which are mentioned only once in the Quran are: 11, 19,
          20, 50, 60, 80, 99, 300, 2000, 3000, 5000, 50000, and 100000.
        </p>
        <p>
          All the numbers mentioned in the Quran, with repetitions, occur 285
          times, and this number is a multiple of 19; 285 = 19×15.
        </p>
      </Prose>

      <Prose>
        <p className="font-semibold text-foreground">
          The Numbers of Suras and Verses
        </p>
        <p>
          The numbering system of the Quran&rsquo;s suras and verses has been
          perfectly preserved. Only a few unauthorized and easily detectable
          printings deviate from the standard system that is divinely guarded.
        </p>
        <p>
          When we add the numbers of all suras, plus the number of verses in
          every sura, plus the sum of verse numbers, the Grand total for the
          whole Quran comes to 346199, 19×19×959. Table 25 is an abbreviated
          presentation of these data. Thus, the slightest alteration of a single
          sura or verse would have destroyed this system. As shown in Table 16,
          if we consider only the 29 initialed suras, these same data produce a
          Grand Total which is also a multiple of 19. It follows that the data
          for the un-initialed suras are also divisible by 19. Table 26 is an
          abbreviated presentation of the same data related to the 85
          un-initialed suras.
        </p>
      </Prose>

      <DataTable
        caption="Table 25: Mathematical Coding of the Sura and Verse Numbers"
        headers={['Sura No.', 'No. of Verses', 'Sum of Verse #s', 'TOTAL']}
        rows={[
          [1, '7', '28', '36'],
          [2, '286', '41041', '41329'],
          ['—', '—', '—', '—'],
          [9, '127', '8128', '8264'],
          ['—', '—', '—', '—'],
          [113, '5', '15', '133'],
          [114, '6', '21', '141'],
          ['Total', '6234', '333410', '346199 (19×19×959)'],
        ]}
      />

      <DataTable
        caption="Table 26: Mathematical Coding of the 85 Un-initialed Suras"
        headers={['Sura No.', 'No. of Verses', 'Sum of Verse #s', 'TOTAL']}
        rows={[
          [1, '7', '28', '36'],
          [4, '176', '15576', '15756'],
          ['—', '—', '—', '—'],
          [9, '127', '8128', '8264'],
          ['—', '—', '—', '—'],
          [113, '5', '15', '133'],
          [114, '6', '21', '141'],
          ['Total', '3491', '146842', '156066 (19×8214)'],
        ]}
      />

      {/* ── Superhuman Numerical Combinations ─────────────────────────────── */}
      <SectionDivider>Superhuman Numerical Combinations</SectionDivider>

      <Prose>
        <p>
          Let us write down the number of each verse in the Quran, preceded for
          each sura by the number of verses in that sura. Thus, Sura 1, which
          consists of seven verses, will be represented by the number 7 1234567.
          What we are doing here is forming long numbers by writing the numbers
          of verses next to each other. To find the number representing Sura 2,
          you write down the number of verses in this sura, 286, followed by the
          number of every verse, written next to each other. Thus, the number
          representing Sura 2 will look like this: 286 12345.....284285286. The
          two numbers representing the first two suras are:
        </p>
      </Prose>

      <MonoBlock>
        {'7 1 2 3 4 5 6 7   &   286 1 2 3 4 5 ..... 284 285 286'}
      </MonoBlock>

      <Prose>
        <p>
          Putting these two numbers together to form one number representing the
          first two suras, we get this number:
        </p>
      </Prose>

      <MonoBlock>{'7 1 2 3 4 5 6 7 286 1 2 3 4 5 ..... 284 285 286'}</MonoBlock>

      <Prose>
        <p>
          This process is continued until every verse in the Quran is written
          down, thus forming one very long number encompassing the number of
          every verse in the Quran. The number representing the whole Quran is a
          multiple of 19 &amp; consists of 12692 digits, which is also a
          multiple of 19.
        </p>
      </Prose>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">First No.:</span> This
          very long number consists of 12692 digits (19×668) and includes every
          verse in the Quran. The number of verses in each sura precedes its
          verses. A special computer program that divides very long numbers has
          shown that this long number is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Instead of putting the total number of verses in every sura ahead of
          the sura, let us put it at the end of every sura. Since we are putting
          the total number of verses per sura at the end of each sura, we must
          put the total number of numbered verses (6234) at the end of the
          Quran. Putting together all the verses of all the suras, produces a
          long number that consists of 12696 digits, and is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>
        {'1234567 7 12345...286 286 12345 5...123456 6 6234'}
      </MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Second No.:</span> The
          number of every verse in every sura is followed by the number of
          verses per sura. The last 11 digits shown here are the 6 verses of the
          last sura, followed by its number of verses (6), followed by the
          number of numbered verses in the Quran (6234). The complete, very long
          number, is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Now let us include the number of every sura. Write down the number of
          every verse in every sura, followed by the number of the sura,
          followed by the number of verses in the sura. The total number of
          numbered verses (6234) is added at the end. This number, representing
          the whole Quran, is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>
        {'1234567 1 7 12345...286 2 286 ...123456 114 6 6234'}
      </MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Third No.:</span> The
          number of every verse, followed by the sura number, then the number of
          verses in the sura. The total number of numbered verses is added at
          the end. The long number (12930 digits) is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Instead of putting the total number of verses in every sura after the
          sura, let us now put it ahead of the sura. This very long number
          representing the whole Quran is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>
        {'7 1234567 1 286 12345...286 2...6 123456 114 6234'}
      </MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Fourth No.:</span> The
          total number of verses in each sura is followed by the number of every
          verse, then the sura number. The last 14 digits shown above are the
          number of verses in the last sura (6), followed by the numbers of the
          six verses (123456), followed by the number of the sura (114), then
          the total number of numbered verses in the Quran. The very long number
          (consisting of 12930 digits) is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Now, let us write down the number of every verse in every sura,
          followed by the sum of verse numbers for every sura. Sura 1 consists
          of 7 verses, and the sum of verse numbers is 1+2+3+4+5+6+7 = 28. The
          complete number, representing the whole Quran, consists of 12836
          digits and is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'1234567 28 12345...284285286 41041...123456 21'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Fifth No.:</span> The
          number of every verse in every sura is followed by the sum of verse
          numbers. The long number consists of 12836 digits, and is a multiple
          of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Remarkably, if we take the &ldquo;Fifth No.&rdquo; shown above and
          reverse the order of verse numbers and sum of verse numbers, i.e.,
          move the sum of verse numbers, and put it ahead of the sura, the
          resulting long number is still a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'28 1234567 41041 12345....285286.....21 123456'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Sixth No.:</span>{' '}
          Placing the sum of verse numbers ahead of each sura, instead of after
          it, produces a long number (12836 digits) that is also a multiple of
          19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Even writing the suras backward, i.e., reversing the order of suras by
          starting with the last sura and ending with the first sura, and
          placing the sum of verse numbers after the verses of each sura, the
          product is still a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'123456 21 12345 15..12345..286 41041 1234567 28'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Seventh No.:</span>{' '}
          Reversing the order of suras — starting from the last sura and ending
          with the first sura — and writing down the number of every verse, with
          the sum of verse numbers for every sura after its verses, the product
          is a long number consisting of 12836 digits. This long number is a
          multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Write the sum of verse numbers for the whole Quran (333410), followed
          by the number of numbered verses in the Quran (6234), then the number
          of suras (114). Every sura is then represented by its number followed
          by its number of verses. The complete number, covering all suras of
          the Quran, consists of 474 digits, and is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'333410 6234 114 1 7 2 286 3 200..113 5 114 6'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Eighth No.:</span> The
          Grand Sum of verse numbers (333410) is followed by the number of
          numbered verses (6234), the number of suras (114), then the sura
          numbers and numbers of verses of every sura.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Now let us reverse the order of sura number and its number of verses
          as presented in the &ldquo;Eighth No.&rdquo; The complete number also
          consists of 474 digits and is still a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'333410 6234 114 7 1 286 2 200 3...5 113 6 114'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Ninth No.:</span>{' '}
          Reversing the sequence of sura number and number of verses still gives
          us a long number that is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          If we write down the sum of verse numbers for Sura 1 (28), followed by
          the sum of verse numbers for Sura 2 (41041), and so on to the end of
          the Quran, and placing the Grand Sum of verse numbers (333410) at the
          end, the resulting long number (Tenth No.) consists of 377 digits, and
          is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'28 41041 20100 ..... 15 21 333410'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Tenth No.:</span> The
          sums of verse numbers for every sura in the Quran, are written next to
          each other, followed at the end by the Grand Sum of verse numbers
          (333410). This long number (377 digits) is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          If we write down the number of suras in the Quran (114), followed by
          the total number of numbered verses (6234), followed by the number of
          every sura and its sum of verse numbers, the final long number (612
          digits) is a multiple of 19.
        </p>
      </Prose>

      <MonoBlock>{'114 6234 1 28 2 41041 3 20100...113 15 114 21'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Eleventh No.:</span>{' '}
          The number of suras, followed by the number of numbered verses, then
          the number of every sura and its sum of verse numbers, produce this
          long number (612 digits) that is a multiple of 19.
        </p>
      </NoteBox>

      <Prose>
        <p>
          Lest anyone may think that any Quranic parameter is left un-guarded
          with this awesome mathematical code, let us look at more parameters.
          If we write down the number of suras (114), followed by the number of
          numbered verses, followed by the Grand Sum of verse numbers in the
          whole Quran (333410), followed by the numbers of every sura and its
          verses, we end up with a very long number (12712 digits) that is a
          multiple of 19.
        </p>
      </Prose>

      <MonoBlock>
        {'114 6234 333410 1 1 2 3 4 5 6 7...114 1 2 3 4 5 6'}
      </MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">Twelfth Number.</span>
        </p>
      </NoteBox>

      <Prose>
        <p>
          If we write down the numbers of verses in every sura next to each
          other, we end up with a 235-digit number that is a multiple of 19. To
          do this, write down the total number of numbered verses in the Quran
          (6234), followed by the number of verses in every sura, then close
          with the total number of numbered verses in the Quran.
        </p>
      </Prose>

      <MonoBlock>
        {'6234 | 7 286 200 176 | .... | 127 | .... | 5 4 5 6 | 6234'}
      </MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">
            Thirteenth Number.
          </span>{' '}
          If we write down the number of numbered verses in the Quran (6234),
          followed by the number of suras (114), followed by the number of every
          verse in every sura, then close with the number of verses in the Quran
          (6234) and the number of suras (114), the final number consists of
          12479 digits, and is a multiple of 19.
        </p>
      </NoteBox>

      <MonoBlock>{'6234 114 1234567 12345...286...123456 6234 114'}</MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">
            Fourteenth Number.
          </span>{' '}
          Another long number that consists of 12774 digits is formed by writing
          down the number of every verse in every sura, followed by the number
          of every sura added to its number of verses. Sura 1 consists of 7
          verses, and the total 1+7 is 8. Since Sura 2 consists of 286 verses,
          the number representing Sura 2 looks like this: 12345...286 288. This
          is done for every sura in the Quran. The final combined number is a
          multiple of 19.
        </p>
      </NoteBox>

      <MonoBlock>
        {'1234567 8 12345 ... 286 288 ........... 123456 120'}
      </MonoBlock>

      <NoteBox>
        <p>
          <span className="font-semibold text-foreground">
            Fifteenth Number.
          </span>{' '}
          More specialized features are in Appendices 2, 9, 19, 24, 25, 26, 29,
          and 37.
        </p>
      </NoteBox>

      {/* ── Last Minute Discovery ─────────────────────────────────────────── */}
      <SectionDivider>Last Minute Discovery</SectionDivider>

      <Prose>
        <p className="text-sm text-muted-foreground">
          [May 26, 1989 — Add to Appendix 1]
        </p>
        <p>
          Mr. Abdullah Arik made the following discoveries just before printing
          time:
        </p>
        <ol className="space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed">
          <li>
            If we write down the number of verses in every sura, followed by the
            sum of verse numbers, and keep all number justified to the left, the
            total of all left-justified numbers is 4,859,309,774, or
            19×255753146 (Table 1).
          </li>
          <li>
            Do the same as above, except write down the number of every verse,
            instead of the number of verses. The total this time consists of 757
            digits and is still a multiple of 19 (Table 2).
          </li>
          <li>
            Do the same as above, but justify everything to the right, and write
            down the sura number, followed by the number of verses in that sura,
            followed by the number of every verse in the sura, and finally, the
            sum of verse numbers. The total consists of 759 digits and is also a
            multiple of 19 (Table 3).
          </li>
        </ol>
      </Prose>

      <Highlight>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          God Be Glorified.
        </p>
      </Highlight>

      <DataTable
        caption="Table 1"
        headers={['Sura', 'Number']}
        rows={[
          ['Sura 1', '728'],
          ['Sura 2', '28641041'],
          ['—', '—'],
          ['Sura 114', '621'],
          ['Total', '4859309774 = 19 × 255753146'],
        ]}
      />

      <DataTable
        caption="Table 2"
        headers={['Sura', 'Number']}
        rows={[
          ['Sura 1', '123456728'],
          ['Sura 2', '1234...28641041'],
          ['—', '—'],
          ['Sura 114', '12345621'],
        ]}
      />

      <DataTable
        caption="Table 3"
        headers={['Sura', 'Number']}
        rows={[
          ['Sura 1', '17123456728'],
          ['Sura 2', '2286123 ... 28641041'],
          ['—', '—'],
          ['Sura 114', '114612345621'],
        ]}
      />

      {/* ── A Witness From the Children of Israel ─────────────────────────── */}
      <SectionDivider>
        A Witness From the Children of Israel [46:10]
      </SectionDivider>

      <NoteBox>
        <p>
          Proclaim: &ldquo;What if it is from God, and you disbelieved in it? A
          witness from the Children of Israel has borne witness to a similar
          phenomenon, and he has believed, while you have turned too arrogant to
          believe. God does not guide the wicked.&rdquo; [46:10]
        </p>
      </NoteBox>

      <Prose>
        <p>
          The following quotation is taken from STUDIES IN JEWISH MYSTICISM
          (Association for Jewish Studies, Cambridge, Mass., Joseph Dan &amp;
          Frank Talmage, eds., Page 88, 1982). The quotation refers to the work
          of Rabbi Judah the Pious (12th Century AD):
        </p>
      </Prose>

      <NoteBox>
        <p>
          The people [Jews] in France made it a custom to add [in the morning
          prayer] the words: &ldquo; &lsquo;Ashrei temimei derekh [blessed are
          those who walk the righteous way],&rdquo; and our Rabbi, the Pious, of
          blessed memory, wrote that they were completely and utterly wrong. It
          is all gross falsehood, because there are only nineteen times that the
          Holy Name is mentioned [in that portion of the morning prayer]... and
          similarly you find the word &lsquo;Elohim nineteen times in the
          pericope of Ve-&lsquo;elleh shemot. . . . Similarly, you find that
          Israel were called &ldquo;sons&rdquo; nineteen times, and there are
          many other examples. All these sets of nineteen are intricately
          intertwined, and they contain many secrets and esoteric meanings,
          which are contained in more than eight large volumes. . . Furthermore,
          in this section there are 152 (19×8) words. ...
        </p>
      </NoteBox>

      {/* ── Acknowledgments ──────────────────────────────────────────────── */}
      <SectionDivider>Acknowledgments</SectionDivider>

      <Prose>
        <p>
          All praise and thanks are due to God who has willed that His miracle
          of the Quran shall be revealed at this time. He has distinguished the
          following individuals and blessed them by revealing through them many
          portions of this momentous discovery: Abdullah Arik, Mohamoud Ali
          Abib, Lisa Spray, Edip Yuksel, Ihsan Ramadan, Feroz Karmally, Ismail
          Barakat, Gatut Adisoma, Ahmed Yusuf (of Lagos), Cesar A. Majul,
          Muhtesem Erisen, Emily Kay Sterrett and Cecilia Albertha Wallen.
        </p>
      </Prose>

      <NoteBox>
        <p>
          United Submitters International / International Community of
          Submitters / Masjid Tucson
        </p>
      </NoteBox>
    </>
  )
}
